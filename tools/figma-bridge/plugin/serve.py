#!/usr/bin/env python3
"""CORS 静态 + 构建桥服务：给 Figma 插件 ui.html 用。
- GET  /            静态文件（根 ~/Desktop，含 scene.json）
- GET  /api/list    扫描 HTML 根（05_release / output / ~/Desktop）返回可选 demo 清单
- POST /api/build   三种输入统一落 build-scene.js：
                     {path}            白名单根内的本地 HTML 路径
                     {name, content}   拖拽进面板的 HTML 全文 → 存 ~/Desktop/_drops/ 再 build
                     {url}             粘贴的 http(s) 链接 → 下载到 ~/Desktop/_drops/ 再 build
用法：python3 serve.py [port]   （默认 8124，与 V2 插件面板 127.0.0.1:8124 对齐）"""
import http.server, socketserver, os, sys, json, subprocess, urllib.request, time
from urllib.parse import urlparse

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8124
ROOT = os.path.realpath(os.path.expanduser('~/Desktop'))
REPO = os.path.expanduser('~/Feishu-competition')
BUILD = os.path.join(REPO, 'tools/figma-bridge/build-scene.js')
HTML_ROOTS = [os.path.join(REPO, '05_release'), os.path.join(REPO, 'output'), ROOT]
DROPS = os.path.join(ROOT, '_drops')   # 拖拽/链接导入的暂存目录（在白名单根内，不参与 /api/list 扫描）
MAX_IN = 20 * 1024 * 1024


def drop_path(name):
    """暂存文件名净化：去目录成分、强制 .html 后缀，落 ~/Desktop/_drops/"""
    n = os.path.basename(str(name or '').strip()) or 'dropped.html'
    if not n.lower().endswith(('.html', '.htm')):
        n += '.html'
    os.makedirs(DROPS, exist_ok=True)
    return os.path.join(DROPS, n)


def scan_htmls():
    out = []
    for base in HTML_ROOTS:
        base = os.path.realpath(base)
        if not os.path.isdir(base):
            continue
        if base == ROOT:
            paths = [os.path.join(ROOT, f) for f in os.listdir(ROOT) if f.endswith('.html')]
        else:
            paths = [os.path.join(dp, f) for dp, _, fs in os.walk(base) for f in fs if f.endswith('.html')]
        for p in paths:
            st = os.stat(p)
            out.append({
                'path': p, 'rel': os.path.relpath(p, base),
                'name': os.path.basename(p), 'mtime': int(st.st_mtime), 'size': st.st_size,
            })
    out.sort(key=lambda x: x['mtime'], reverse=True)
    return out


def allowed(path):
    rp = os.path.realpath(str(path))
    return any(rp == r or rp.startswith(r + os.sep)
               for r in [os.path.realpath(x) for x in HTML_ROOTS] if os.path.isdir(r))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    # 访问留痕（时间 + Origin + 客户端）：面板再报 Failed to fetch 时，
    # 查 serve.log 即可判定请求是否到达后台（到=服务端问题；不到=浏览器/客户端拦截）
    def log_message(self, fmt, *args):
        sys.stderr.write('%s %s %s %s\n' % (
            time.strftime('%m-%d %H:%M:%S'),
            self.headers.get('Origin') or '-', self.address_string(), fmt % args))
        sys.stderr.flush()

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    # CORS 预检：插件 iframe POST application/json 前浏览器必发 OPTIONS，
    # 不回 204+允许头会被 CORS 拦下，面板报 Failed to fetch（GET 无预检不受影响）
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        if self.headers.get('Access-Control-Request-Private-Network'):
            self.send_header('Access-Control-Allow-Private-Network', 'true')
        self.send_header('Access-Control-Max-Age', '86400')
        self.end_headers()

    def reply_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split('?')[0] == '/api/list':
            return self.reply_json({'ok': True, 'htmls': scan_htmls()})
        super().do_GET()

    def do_POST(self):
        if self.path.split('?')[0] != '/api/build':
            return self.reply_json({'ok': False, 'error': 'not found'}, 404)
        length = int(self.headers.get('Content-Length') or 0)
        try:
            req = json.loads(self.rfile.read(length) or b'{}')
        except ValueError:
            return self.reply_json({'ok': False, 'error': 'JSON 解析失败'}, 400)
        # 三种输入：content（拖拽文件）/ url（粘贴链接）/ path（白名单本地路径）
        p = None
        if isinstance(req.get('content'), str):
            if len(req['content'].encode('utf-8')) > MAX_IN:
                return self.reply_json({'ok': False, 'error': '文件超过 20MB 上限'}, 413)
            p = drop_path(req.get('name'))
            with open(p, 'w', encoding='utf-8') as f:
                f.write(req['content'])
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
            except Exception as e:
                return self.reply_json({'ok': False, 'error': '链接抓取失败：' + str(e)}, 502)
        else:
            p = str(req.get('path') or '')
            if not allowed(p):
                return self.reply_json({'ok': False, 'error': '路径不在允许范围（05_release / output / 桌面）；桌面外文件请拖拽进面板'}, 403)
        try:
            # 链接导入 = 外部网页模式（--ext）：build-scene 纯图层转录，不走本地组件库匹配/组件化/令牌绑定；
            # --site 带原始链接 → 入口页自动发现同源页面（导航优先，上限 8）逐页转录多帧；本地路径/拖拽照常全套
            r = subprocess.run(['node', BUILD, p] + (['--ext', '--site', u] if req.get('url') else []),
                               capture_output=True, text=True, timeout=300)
            tail = [l for l in (r.stdout + r.stderr).strip().splitlines()
                    if l and 'CVDisplayLink' not in l][-6:]
            self.reply_json({'ok': r.returncode == 0, 'returncode': r.returncode, 'log': tail})
        except subprocess.TimeoutExpired:
            self.reply_json({'ok': False, 'error': '构建超时（300s）'}, 504)
        except FileNotFoundError as e:
            self.reply_json({'ok': False, 'error': str(e)}, 500)


# 多线程：/api/build 处理中可能回抓本服务自己的静态页（粘贴 127.0.0.1:8124 链接的场景），
# 单线程 TCPServer 会自锁超时；静态并发拉取（插件取 scene.json）也不再排队
socketserver.ThreadingTCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('', PORT), Handler) as httpd:
    print(f'serving {ROOT} on http://localhost:{PORT} (CORS on, /api/list /api/build)')
    httpd.serve_forever()
