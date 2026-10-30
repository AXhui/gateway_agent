#!/usr/bin/env python3
"""CORS 静态 + 构建桥服务：给 Figma 插件 ui.html 用。
- GET  /            静态文件（根 ~/Desktop，含 scene.json）
- GET  /api/list    扫描 HTML 根（05_release / output / ~/Desktop）返回可选 demo 清单
- POST /api/build   输入统一落 build-scene.js：
                     {path}            白名单根内的本地 HTML 路径
                     {name, content}   拖拽进面板的 HTML 全文 → 存 ~/Desktop/_drops/ 再 build
                                       （mode:'ext' = 粘贴的外部代码 → --ext 纯图层，可带 url 补 base）
                     {url}             粘贴的 http(s) 链接 → 下载到 ~/Desktop/_drops/ 再 build
                     {urls:[...]}      批量链接（PRO bulk imports）→ 逐个下载，位置参数批量转录
                     {capture, url, content} 浏览器书签捕获：任意页面（登录页/本地页）渲染后 DOM
                                       全文直传 → --ext --site（free 层 browser capture 对标）
                     {name, zip_b64}   .zip 整站包 → 解包 _drops/（file:// 相对资源天然可用）→ 批量转录
                     {viewports}       可选 '1440,390' 多视口（仅链接导入转发 build-scene --viewport）
                     {theme}           可选 'dark' 入口页暗色补帧（--theme dark，尽力转换）
用法：python3 serve.py [port]   （默认 8124，与 V2 插件面板 127.0.0.1:8124 对齐）"""
import http.server, socketserver, os, sys, json, subprocess, urllib.request, time, re, base64, zipfile, io
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8124
ROOT = os.path.realpath(os.path.expanduser('~/Desktop'))
REPO = os.path.expanduser('~/Feishu-competition')
# 自动探测实际项目路径（多种候选）
for _cand in [os.path.expandvars(r'F:\AI_project\feishu_UI_3\Feishu-competition-main'),
              os.path.expanduser('~/Feishu-competition'),
              r'C:\Feishu-competition']:
    if os.path.isdir(_cand):
        REPO = _cand
        break
BUILD = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'bridge', 'build-scene.js')
HTML_ROOTS = [os.path.join(REPO, '05_release'), os.path.join(REPO, 'output'), ROOT]
DROPS = os.path.join(ROOT, '_drops')   # 拖拽/链接导入的暂存目录（在白名单根内，不参与 /api/list 扫描）
MAX_IN = 20 * 1024 * 1024
CLOUD_LIST_FILE = os.path.join(REPO, 'figma-html-list.json')


def find_lark_cli():
    for c in (os.environ.get('LARK_CLI'), 'lark-cli', 'lark-cli.cmd',
              os.path.expandvars(r'%APPDATA%\npm\lark-cli.cmd')):
        if c and (os.path.isfile(c) or shutil.which(c)):
            return c
    return 'lark-cli'


def fetch_pending_list():
    """实时查飞书表格里 Figma状态='转Figma中' 的记录，只返回待处理的云盘文件"""
    cli = find_lark_cli()
    base = 'F2MebgSgMaUZSbseUWLcefqbnKd'
    table = 'tbln6WxfFJ6iYaek'
    try:
        r = subprocess.run(
            [cli, 'base', '+record-list',
             '--base-token', base, '--table-id', table,
             '--filter-json', '{"conjunction":"and","conditions":[{"field_name":"Figma状态","operator":"is","value":["转Figma中"]}]}',
             '--page-size', '50', '--format', 'json', '--as', 'user'],
            capture_output=True, text=True, timeout=30, encoding='utf-8', errors='replace')
        if r.returncode != 0:
            print('fetch_pending_list lark-cli error:', r.stderr[:200], file=sys.stderr)
            return []
        data = json.loads(r.stdout)
        d = data.get('data', {})
        # 数组格式：data.data 是二维数组，data.fields 是字段名，data.record_id_list 是 record_id
        rows = d.get('data') or []
        fields = d.get('fields') or []
        record_ids = d.get('record_id_list') or []
        # 建字段名→列索引映射
        col = {name: i for i, name in enumerate(fields)}
        url_idx = col.get('预览 URL', -1)
        req_idx = col.get('需求编号', -1)
        out = []
        import re
        for ri, row in enumerate(rows):
            url_val = str(row[url_idx]) if url_idx >= 0 and url_idx < len(row) else ''
            m = re.search(r'https://milesight\.feishu\.cn/file/([A-Za-z0-9]+)', url_val)
            if not m:
                continue
            file_token = m.group(1)
            name_m = re.search(r'\[([^\]]+)\]', url_val)
            file_name = name_m.group(1) if name_m else ('cloud_' + file_token[:8] + '.html')
            req_id = str(row[req_idx]) if req_idx >= 0 and req_idx < len(row) else ''
            rid = record_ids[ri] if ri < len(record_ids) else ''
            out.append({
                'path': 'cloud:' + file_token,
                'rel': '☁ ' + req_id + ' · ' + file_name,
                'name': file_name,
                'mtime': 0, 'size': 0, 'cloud': True,
                'url': 'https://milesight.feishu.cn/file/' + file_token,
                'record_id': rid,
            })
        return out
    except Exception as e:
        print('fetch_pending_list error:', e, file=sys.stderr)
        return []


def extract_zip(b64):
    """解包上传的 .zip 整站包到 _drops/zip-<ts>/：只收常规资源文件，防路径穿越/炸弹。
    入口页 = 最浅层 index.html（回退最浅层首个 .html），其余 .html 作批量位置参数。"""
    try:
        data = base64.b64decode(b64, validate=False)
    except Exception as e:
        return None, None, 'zip base64 解码失败：' + str(e), 400
    if len(data) > MAX_IN:
        return None, None, 'zip 超过 20MB 上限', 413
    try:
        zf = zipfile.ZipFile(io.BytesIO(data))
    except Exception as e:
        return None, None, 'zip 打开失败：' + str(e), 400
    infos = [i for i in zf.infolist() if not i.is_dir()]
    if len(infos) > 200:
        return None, None, 'zip 文件数超 200 上限', 413
    if sum(i.file_size for i in infos) > 100 * 1024 * 1024:
        return None, None, 'zip 解压总量超 100MB 上限', 413
    dest = os.path.join(DROPS, 'zip-' + str(int(time.time())))
    os.makedirs(dest, exist_ok=True)
    htmls = []
    for i in infos:
        name = os.path.basename(i.filename)
        if not name or '..' in i.filename.split('/'):
            continue
        low = name.lower()
        if not (low.endswith(('.html', '.htm', '.css', '.js', '.json', '.svg', '.png', '.jpg',
                              '.jpeg', '.gif', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.map'))):
            continue
        tgt = os.path.realpath(os.path.join(dest, i.filename))
        if not (tgt == dest or tgt.startswith(dest + os.sep)):
            continue
        os.makedirs(os.path.dirname(tgt), exist_ok=True)
        with open(tgt, 'wb') as f:
            f.write(zf.read(i))
        if low.endswith(('.html', '.htm')):
            htmls.append(tgt)
    if not htmls:
        return None, None, 'zip 内没有 .html 页面', 400
    idx = [h for h in htmls if os.path.basename(h).lower() in ('index.html', 'index.htm', 'default.html')]
    entry = min(idx or htmls, key=lambda h: (h.count(os.sep), h))
    return entry, [h for h in htmls if h != entry][:20], None, None


def drop_path(name):
    """暂存文件名净化：去目录成分、强制 .html 后缀，落 ~/Desktop/_drops/"""
    n = os.path.basename(str(name or '').strip()) or 'dropped.html'
    if not n.lower().endswith(('.html', '.htm')):
        n += '.html'
    os.makedirs(DROPS, exist_ok=True)
    return os.path.join(DROPS, n)


def scan_htmls():
    """只返回飞书表格里待处理（转Figma中）的云盘文件，不再扫本地目录"""
    return fetch_pending_list()


def allowed(path):
    rp = os.path.realpath(str(path))
    return any(rp == r or rp.startswith(r + os.sep)
               for r in [os.path.realpath(x) for x in HTML_ROOTS] if os.path.isdir(r))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def reply_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path.split('?')[0] == '/api/list':
            return self.reply_json({'ok': True, 'htmls': scan_htmls()})
        super().do_GET()

    def do_POST(self):
        try:
            self.handle_build()
        except subprocess.TimeoutExpired:
            self.reply_json({'ok': False, 'error': '下载或构建超时，请重试'}, 504)
        except Exception as e:
            self.reply_json({'ok': False, 'error': str(e)}, 500)

    def handle_build(self):
        if self.path.split('?')[0] != '/api/build':
            return self.reply_json({'ok': False, 'error': 'not found'}, 404)
        length = int(self.headers.get('Content-Length') or 0)
        try:
            req = json.loads(self.rfile.read(length) or b'{}')
        except ValueError:
            return self.reply_json({'ok': False, 'error': 'JSON 解析失败'}, 400)
        # 输入分支：capture（书签捕获）/ content（拖拽或粘贴代码）/ url·urls（链接）/ zip / path（白名单）
        p = None
        extra_paths = []   # 批量导入的后续页面 → build-scene 位置参数（显式清单，不做自动发现）
        site_url = None    # 链接导入的入口 URL（--ext --site）
        ext_mode = False   # 拖拽/粘贴的外部内容强制纯图层（--ext，不带 site）
        if req.get('capture') and isinstance(req.get('content'), str):
            # 浏览器书签「捕获此页」：任意页面（登录后/本地/JS 渲染）的渲染后 DOM 全文直传，
            # 走 --ext --site（base 让外链样式/图片按原域名解析）——curl 够不着的页面从这里进
            cap_url = str(req.get('url') or '')
            if cap_url and not cap_url.lower().startswith(('http://', 'https://')):
                cap_url = ''
            if len(req['content'].encode('utf-8')) > MAX_IN:
                return self.reply_json({'ok': False, 'error': '捕获内容超过 20MB 上限'}, 413)
            os.makedirs(DROPS, exist_ok=True)
            p = os.path.join(DROPS, 'capture-' + time.strftime('%m%d-%H%M%S') + '.html')
            with open(p, 'w', encoding='utf-8') as f:
                f.write(req['content'])
            site_url = cap_url or None
        elif req.get('zip_b64'):
            entry, extras, err, code = extract_zip(req['zip_b64'])
            if err:
                return self.reply_json({'ok': False, 'error': err}, code or 400)
            p, extra_paths, ext_mode = entry, extras, True
        elif isinstance(req.get('content'), str):
            if len(req['content'].encode('utf-8')) > MAX_IN:
                return self.reply_json({'ok': False, 'error': '文件超过 20MB 上限'}, 413)
            p = drop_path(req.get('name'))
            with open(p, 'w', encoding='utf-8') as f:
                f.write(req['content'])
            if req.get('mode') == 'ext':
                # 粘贴的外部 HTML 代码（free 层 code editor 对标）：纯图层转录
                ext_mode = True
                if str(req.get('url') or '').lower().startswith(('http://', 'https://')):
                    site_url = str(req['url'])
        elif isinstance(req.get('urls'), list):
            us = [str(u).strip() for u in req['urls'] if str(u).strip()]
            bad = [u for u in us if not u.lower().startswith(('http://', 'https://'))]
            if bad:
                return self.reply_json({'ok': False, 'error': '批量导入仅支持 http(s) 链接：' + bad[0]}, 400)
            if not us:
                return self.reply_json({'ok': False, 'error': '批量清单为空'}, 400)
            if len(us) > 20:
                return self.reply_json({'ok': False, 'error': '批量上限 20 个链接'}, 400)
            os.makedirs(DROPS, exist_ok=True)
            used, paths_all = set(), []
            try:
                for u in us:
                    rq = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (serve.py import)'})
                    with urllib.request.urlopen(rq, timeout=30) as resp:
                        data = resp.read(MAX_IN + 1)
                    if len(data) > MAX_IN:
                        return self.reply_json({'ok': False, 'error': '链接内容超过 20MB 上限：' + u}, 413)
                    stem = os.path.basename(urlparse(u).path) or 'from-url'
                    stem = stem if stem.lower().endswith(('.html', '.htm')) else stem + '.html'
                    root_stem = stem[:-5] if stem.lower().endswith('.html') else stem[:-4]
                    n, i = stem, 2
                    while n in used:
                        n = root_stem + '-' + str(i) + '.html'
                        i += 1
                    used.add(n)
                    with open(os.path.join(DROPS, n), 'wb') as f:
                        f.write(data)
                    paths_all.append(os.path.join(DROPS, n))
            except Exception as e:
                return self.reply_json({'ok': False, 'error': '链接抓取失败：' + str(e)}, 502)
            p, extra_paths, site_url = paths_all[0], paths_all[1:], us[0]
        elif req.get('url'):
            u = str(req['url'])
            if not u.lower().startswith(('http://', 'https://')):
                return self.reply_json({'ok': False, 'error': '链接仅支持 http(s)'}, 400)
            try:
                rq = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0 (serve.py import)'})
                with urllib.request.urlopen(rq, timeout=30) as resp:
                    data = resp.read(MAX_IN + 1)
                if len(data) > MAX_IN:
                    return self.reply_json({'ok': False, 'error': '链接内容超过 20MB 上限'}, 413)
                p = drop_path(os.path.basename(urlparse(u).path) or 'from-url.html')
                with open(p, 'wb') as f:
                    f.write(data)
                site_url = u
            except Exception as e:
                return self.reply_json({'ok': False, 'error': '链接抓取失败：' + str(e)}, 502)
        else:
            p = str(req.get('path') or '')
            # 云盘文件：path 形如 "cloud:file_token"，先用 lark-cli 下载到 DROPS
            if p.startswith('cloud:'):
                file_token = p[6:]
                cloud_name = os.path.basename(str(req.get('name') or 'cloud.html'))
                if not cloud_name.lower().endswith('.html'):
                    cloud_name += '.html'
                os.makedirs(DROPS, exist_ok=True)
                p = os.path.join(DROPS, '_cloud_' + cloud_name)
                cli = find_lark_cli()
                dl = subprocess.run(
                    [cli, 'drive', '+download', '--file-token', file_token,
                     '--output', os.path.basename(p), '--overwrite', '--as', 'user'],
                    cwd=DROPS, capture_output=True, text=True, timeout=120, encoding='utf-8', errors='replace')
                if dl.returncode != 0 or not os.path.isfile(p):
                    return self.reply_json({'ok': False, 'error': '云盘下载失败：' + (dl.stderr or dl.stdout)[:300]}, 502)
            elif not allowed(p):
                return self.reply_json({'ok': False, 'error': '路径不在允许范围（05_release / output / 桌面）；桌面外文件请拖拽进面板'}, 403)
        # 多视口参数（PRO multi-viewport）：仅链接导入转发；格式 '1440,390'（1-4 个 3-4 位宽数）
        vp = str(req.get('viewports') or '')
        vp_ok = re.fullmatch(r'\d{3,4}(?:,\d{3,4}){0,3}', vp) if vp else None
        dk = str(req.get('theme') or '').lower() == 'dark'   # 暗色补帧（free 层 dark & light themes 对标）
        try:
            # 链接导入 = 外部网页模式（--ext）：build-scene 纯图层转录，不走本地组件库匹配/组件化/令牌绑定；
            # --site 带原始链接 → 入口页自动发现同源页面（导航优先，上限 8）逐页转录多帧；
            # urls[] 批量 = 显式位置参数清单（与自动发现互斥）；本地路径/拖拽照常全套；
            # 书签捕获/粘贴代码/zip = --ext（前者带 site 补 base）；--theme dark 追加暗色帧
            cmd = ['node', BUILD, p] + extra_paths
            if site_url:
                cmd += ['--ext', '--site', site_url]
                if vp_ok:
                    cmd += ['--viewport', vp_ok.group(0)]
            elif ext_mode:
                cmd += ['--ext']
            if (site_url or ext_mode) and dk:
                cmd += ['--theme', 'dark']
            # Windows 兼容：自动注入 CHROME 环境变量 + 强制 UTF-8 解码
            env = os.environ.copy()
            if os.name == 'nt':
                for cp in (r'C:\Program Files\Google\Chrome\Application\chrome.exe',
                           r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'):
                    if os.path.isfile(cp):
                        env['CHROME'] = cp
                        break
            r = subprocess.run(cmd, capture_output=True, text=True, timeout=300, encoding='utf-8', errors='replace', env=env)
            tail = [l for l in (r.stdout + r.stderr).strip().splitlines()
                    if l and 'CVDisplayLink' not in l][-6:]
            self.reply_json({'ok': r.returncode == 0, 'returncode': r.returncode, 'log': tail})
        except subprocess.TimeoutExpired:
            self.reply_json({'ok': False, 'error': '构建超时（300s）'}, 504)
        except FileNotFoundError as e:
            self.reply_json({'ok': False, 'error': str(e)}, 500)


http.server.ThreadingHTTPServer.allow_reuse_address = True
with http.server.ThreadingHTTPServer(('127.0.0.1', PORT), Handler) as httpd:
    print(f'serving {ROOT} on http://localhost:{PORT} (CORS on, /api/list /api/build)')
    httpd.serve_forever()
