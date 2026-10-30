#!/usr/bin/env node
// scene.json 生成器 —— html-to-figma-internal 插件（~/Desktop）的数据源。
// 原理：向 demo 注入序列化脚本 → 无头 Chrome 真实渲染 → 逐态 walk DOM + computed style
// → scene.json（插件 code.js 的消费格式）落桌面；无 MS_FIGMA_EXPORT 契约时回退单态。
// 用法: node build-scene.js <demo.html> [--out-dir ~/Desktop] [--ext [--site <原始链接>] [--pages N]]
//   --ext  外部网页纯图层转录（serve.py 链接导入）；--site 带原始链接时自动发现同源页面多页转录（--pages 子页上限，默认 8）

const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { buildExportPage } = require('./export-page');

const { BOOTSTRAP } = require('./scene-bootstrap');

const args = process.argv.slice(2);
const demoPath = args.find(a => !a.startsWith('--'));
const EXT = args.includes('--ext'); // 外部网页模式（serve.py 链接导入传入）：纯图层转录，不走本地组件体系
const siteIdx = args.indexOf('--site');
const SITE = siteIdx >= 0 ? args[siteIdx + 1] : null; // 外部网页原始链接：补 <base> 相对资源解析 + 多页转录的同源基准
const pagesIdx = args.indexOf('--pages');
const PAGES_CAP = Math.min(20, Math.max(1, (pagesIdx >= 0 ? parseInt(args[pagesIdx + 1], 10) : 0) || 8)); // 子页上限
const outDirIdx = args.indexOf('--out-dir');
const outDir = outDirIdx >= 0 ? args[outDirIdx + 1] : path.join(os.homedir(), 'Desktop');
if (!demoPath || !fs.existsSync(demoPath)) {
  console.error('用法: node build-scene.js <demo.html> [--out-dir <dir>]');
  process.exit(1);
}

const html = fs.readFileSync(demoPath, 'utf8');
// 颜色令牌注册表（token-vars.json）：tokens.css 名 -> Milesight_IOT_Web「Color Token」库变量 key。
// 注入名清单后页内 getComputedStyle 值反查（跟随主题/暗色覆写）+ 家族优先裁决，节点打 tk/ftk/ctk 标记；
// 插件侧不新建颜色，实色一律绑库变量（改库全局生效），scope 门禁 + 读回校验失败回退裸色。
let TOK_VARS = null;
try {
  const tokCfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'token-vars.json'), 'utf8'));
  if (tokCfg && tokCfg.vars) TOK_VARS = tokCfg.vars;
} catch (e) { console.warn('token-vars.json 缺失或损坏，颜色令牌绑定关闭: ' + e.message); }
const tokNames = TOK_VARS ? Object.keys(TOK_VARS).map(n => '--' + n) : [];
const chrome = process.env.CHROME && fs.existsSync(process.env.CHROME) ? process.env.CHROME
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(chrome)) { console.error('找不到 Chrome: ' + chrome + '（可用 CHROME 环境变量指定）'); process.exit(2); }

// 单页渲染管线：注入 → 无头 Chrome → 抽取 scene（+ 外部网页链接发现标记）。
// SITE 存在时在 <head> 顶部补 <base>（file:// 下相对 CSS/JS/图片按原始域名解析，外部网页还原度关键）
let pageSeq = 0;
function renderPage(src) {
  let head = src;
  if (SITE && EXT && !/<base\b/i.test(head)) {
    const bt = '<base href="' + SITE.replace(/"/g, '&quot;') + '">';
    head = /<head[^>]*>/i.test(head) ? head.replace(/<head[^>]*>/i, m0 => m0 + '\n' + bt)
      : (/<html[^>]*>/i.test(head) ? head.replace(/<html[^>]*>/i, m0 => m0 + '\n' + bt) : bt + '\n' + head);
  }
  const inject = (EXT && SITE ? '<script>window.__MS_EXT_CRAWL__=' + JSON.stringify(SITE) + '<\/script>\n' : '') +
    (tokNames.length && !EXT ? '\n<script>window.__MS_TOK_NAMES__=' + JSON.stringify(tokNames) + '<\/script>' : '') +
    '\n<script>' + BOOTSTRAP + '<\/script>';
  const built = /<\/body>/i.test(head) ? head.replace(/<\/body>/i, inject + '\n</body>') : head + inject;
  const tmp = '/tmp/ms-scene-in-' + Date.now() + '-' + (++pageSeq) + '.html';
  fs.writeFileSync(tmp, built);
  console.log('无头 Chrome 渲染中（' + (built.length / 1024).toFixed(0) + 'KB）…');
  const dump = cp.execFileSync(chrome,
    ['--headless', '--disable-gpu', '--window-size=1440,900', '--virtual-time-budget=20000', '--dump-dom', 'file://' + tmp],
    { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
  fs.unlinkSync(tmp);
  const m = dump.match(/<script id="ms-scene-json" type="application\/json">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('未找到 scene.json 标记——渲染未完成或注入脚本异常');
  const lm = dump.match(/<script id="ms-ext-links" type="application\/json">([\s\S]*?)<\/script>/);
  return { scene: JSON.parse(m[1]), links: lm ? JSON.parse(lm[1]) : null };
}

let scene, extLinks = null;
try { ({ scene, links: extLinks } = renderPage(html)); }
catch (e) { console.error(e.message); process.exit(3); }

// 命名规范：demo <title>（回退文件名）→ scene.name；插件侧主画板/组件画板/变体集按此命名——
// 画板名 = 功能名（"EG71 · Data Library · Inbuilt Update"），组件名 = 类名家族 + 文本变体，不出现无名层
const titleM = html.match(/<title>([^<]*)<\/title>/i);
scene.name = (titleM && titleM[1].trim()) || path.basename(demoPath, '.html');
if (EXT) scene.ext = 1; // 插件据此切纯图层通知、跳过库目录拉取（本地组件体系仅对自家 ms-* demo 有意义）

// 外部网页多页转录（--ext --site）：入口页 DOM 里的同源链接（scene-bootstrap 收集，导航优先/去重）
// 逐页抓取渲染，cells 依次为 1.入口 2..N 子页纵向堆叠，插件侧每 cell 落一帧——
// 对齐 demo 侧 MS_FIGMA_EXPORT 多态铺开的思路（用户 2026-10-30：链接导入要自动转出全部页面）
if (EXT && SITE && Array.isArray(extLinks) && extLinks.length) {
  let org = null; try { org = new URL(SITE); } catch (eO) {}
  if (org) {
    const normKey = k => String(k).replace(/\/(index|default)\.html?(?=\?|$)/i, '/'); // /index.html ≡ /，同页去重
    const seen = new Set([normKey(org.pathname + org.search)]);
    const todo = [];
    extLinks.forEach(L => {
      if (!L || !L.url || seen.has(normKey(L.u))) return;
      seen.add(normKey(L.u)); if (todo.length < PAGES_CAP) todo.push(L);
    });
    if (todo.length) {
      console.log('外部网页多页: 发现 ' + todo.length + ' 个同源页面（导航优先，上限 ' + PAGES_CAP + '，入口外一跳）');
      todo.forEach((L, i) => {
        try {
          console.log('  子页 ' + (i + 2) + '/' + (todo.length + 1) + ' · ' + L.u);
          const subHtml = cp.execFileSync('curl',
            ['-sLf', '--compressed', '--max-time', '30', '--max-filesize', String(20 * 1024 * 1024),
              '-A', 'Mozilla/5.0 (Macintosh) build-scene ext import', L.url],
            { maxBuffer: 24 * 1024 * 1024 }).toString('utf8');
          const r2 = renderPage(subHtml);
          const cell = (r2.scene.cells || [])[0];
          if (cell) {
            cell.label = (i + 2) + '. ' + (String(L.t || L.u).trim().slice(0, 24) || L.u);
            scene.cells.push(cell);
            if (r2.scene.stats) ['al', 'img', 'bg'].forEach(k => {
              if (r2.scene.stats[k]) scene.stats[k] = (scene.stats[k] || 0) + r2.scene.stats[k];
            });
          }
        } catch (e) { console.warn('  子页跳过 ' + (L.u || '') + '：' + e.message); }
      });
    }
    if (scene.cells.length > 1) {
      scene.cells[0].label = '1. ' + String(scene.name).slice(0, 24);
      let y = 0; scene.cells.forEach(c => { c.x = 0; c.y = y; y += (c.h || 600) + 64; });
      console.log('多页转录: 共 ' + scene.cells.length + ' 帧（1 入口 + ' + (scene.cells.length - 1) + ' 子页）');
    }
  }
}

// 原型连线（R5）：scene.proto 记录 setup 真实派发的 click（{state, evs:[{path}]}）→
// 各屏同路径节点挂 rct {to, tg}；必须在拍平/组件化之前解析（此后 child 序列改变），
// 路径落空（文本子节点/被丢弃节点）时沿路径上浮到最近已序列化祖先。
let rctCount = 0;
if (Array.isArray(scene.proto) && scene.proto.length) {
  const edges = scene.proto.filter(t => t && t.state > 0 && t.evs && t.evs.length)
    .map(t => ({ state: t.state, path: t.evs[0].path })).filter(e => e.path);
  scene.cells.forEach(cell => {
    const byPath = {};
    (function idx(n) { if (n.p) byPath[n.p] = n; (n.ch || []).forEach(idx); })(cell.root);
    edges.forEach(e2 => {
      let seg = e2.path.split('/');
      while (seg.length) {
        const hit = byPath[seg.join('/')];
        if (hit) {
          if (!(hit.rct || []).some(r => r.to === e2.state)) {
            hit.rct = (hit.rct || []).concat([{ to: e2.state, tg: 'ON_CLICK' }]);
            rctCount++;
          }
          break;
        }
        seg.pop();
      }
    });
  });
}
delete scene.proto;

// 去多余嵌套：无视觉贡献（无填充/阴影/圆角/裁切、不透明）且无 bc-/ms- 语义类的透传容器拍平，
// 子树坐标换算进父级——图层树不留空壳帧（设计师展开图层不剥洋葱）
let flatCut = 0;
function flattenWrappers(node) {
  if (!node.ch) return;
  for (const c of node.ch) flattenWrappers(c);
  const out = [];
  for (const c of node.ch) {
    const r = c.r || {};
    if (c.t === 'f' && !c.lib && !(c.f || []).length && !(c.e || []).length && !(c.bg || []).length && !c.al
      && !c.stk && !c.bm && !c.rot
      && !(r.tl || r.tr || r.br || r.bl) && !c.clip && (c.o == null || c.o === 1)
      && !(c.n && /^(bc|ms)-/.test(c.n))) {
      flatCut++;
      (c.ch || []).forEach((k, ki) => {
        k.x += c.x; k.y += c.y;
        // 拍平壳上的原型连线转移到首个保留子节点（否则 reactions 随壳一起丢失）
        if (c.rct && ki === 0) k.rct = (k.rct || []).concat(c.rct);
        out.push(k);
      });
    } else out.push(c);
  }
  node.ch = out;
}
scene.cells.forEach(c => flattenWrappers(c.root));

// 蒙版全页铁律（用户 2026-10-25）：弹窗蒙版一律铺满状态帧，禁止局部覆盖——
// DOM 层 ms-mask 若未全幅（局部定位/尺寸缩水），scene 侧强制扩到 0,0,frame w×h；
// 库「弹窗」实例侧同理吃到全页尺寸（自带全页蒙版），富弹窗本地重绘的蒙版同样被本条兜底
// 2026-10-29 补提升：ms-mask 常嵌在有裁切的容器（右列/卡片）内，只改宽高不改父级 → 蒙版仍被
// 父容器裁掉一半（用户实测「mask 没有全屏幕」根因）。修法：非根级 ms-mask 一律提升为状态帧
// 直接子节点并置于最顶层（子级坐标本就相对蒙版，提升后位置不变），再强制全幅。
let maskFix = 0, maskLift = 0;
scene.cells.forEach(c => {
  const lifted = [];
  (function fixMask(nd) {
    const out = [];
    (nd.ch || []).forEach(m => {
      const isMask = m.t === 'f' && m.n && String(m.n).trim().split(/\s+/).includes('ms-mask');
      if (isMask && nd !== c.root) { lifted.push(m); maskLift++; return; }
      if (isMask && (m.x !== 0 || m.y !== 0 || m.w < c.w || m.h < c.h)) { m.x = 0; m.y = 0; m.w = c.w; m.h = c.h; maskFix++; }
      out.push(m);
      fixMask(m);
    });
    nd.ch = out;
  })(c.root);
  lifted.forEach(m => { m.x = 0; m.y = 0; m.w = c.w; m.h = c.h; c.root.ch.push(m); });
});
if (maskFix || maskLift) console.log('蒙版全页强制: ' + maskFix + ' 处扩幅 + ' + maskLift + ' 处提升到帧根（弹窗蒙版铁律）');

// 图标实例化：页内已反查出 MS_ICONS 名（node.ic），命中 icon-keys.json 的升级为 t:'ic'（携带库组件 key）
let iconStats = null;
if (!EXT) try {
  const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'icon-keys.json'), 'utf8')).icons;
  let inst = 0, nomap = 0, plain = 0;
  function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.t === 's') {
      if (n.ic) {
        const e = keys[n.ic];
        if (e) { n.t = 'ic'; n.k = e.key; n.f = e.figmaName; inst++; }
        else { delete n.ic; delete n.col; nomap++; }
      } else plain++;
    }
    (n.ch || []).forEach(walk);
  }
  scene.cells.forEach(c => walk(c.root));
  iconStats = { inst, nomap, plain };
} catch (e) { console.warn('icon-keys.json 缺失或损坏，图标全部走矢量: ' + e.message); }

// 库组件实例化二期：component-keys.json 命中的控件块打 n.lib 标记（子树原样保留——插件导入库失败时整块回退重绘）。
// 插件侧 importComponentByKeyAsync → set 按修饰类择变体 → createInstance → 覆写文本。
let libStats = null;
let needLibs = new Set();   // 本页实际命中的库（web/biz）——scene.libs 供插件 assets 选择门禁
let LIBRARIES = null;       // component-keys.json libraries 元数据（name + libraryKey）
if (!EXT) try {
  const libCfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'component-keys.json'), 'utf8'));
  LIBRARIES = libCfg.libraries || null;
  const comps = (libCfg.components || []).filter(c => c.enabled && c.cls && c.key);
  // 守卫（First Draft 形状匹配原则）：复合块只有形状匹配库形态才整块替换，不硬凑。
  // 守卫不过 → 不打 lib 标记，子树照常走本地重绘（内层控件仍会被各自锚点标记为库实例）。
  const SEM_WORDS = { error: 'error', danger: 'error', success: 'success', warn: 'warn', warning: 'warn', info: 'info', waiting: 'waiting', loading: 'waiting' };
  function deepTextPairs(m, cap) {
    // 深层文本对（文本+颜色，阅读顺序）：引用实例的文案改写数据源（2026-10-29 用户规则：文本按 HTML 填写）
    const out = [];
    (function w2(x) {
      if (out.length >= cap) return;
      if (x.t === 't' && x.text && String(x.text).trim()) out.push({ s: String(x.text).trim(), c: x.col });
      (x.ch || []).forEach(w2);
    })(m);
    return out;
  }
  function deepTexts(m, cap) { return deepTextPairs(m, cap).map(p => p.s); }
  function deepClassToks(m, cap) {
    const out = [];
    (function w3(x) {
      if (out.length >= cap) return;
      if (x.n) String(x.n).trim().split(/\s+/).forEach(t => { if (t && !out.includes(t)) out.push(t); });
      (x.ch || []).forEach(w3);
    })(m);
    return out;
  }
  function evalGuard(ent, n) {
    if (ent.guard === 'plainTitle') {
      const kids = n.ch || [];
      const onlyText = kids.length === 1 && kids[0].t === 't';
      const fs = onlyText ? kids[0].fs : 0;
      return onlyText && fs >= 15.5 && fs <= 16.5 && n.w >= 40 ? { texts: deepTexts(n, 4), fs, sw: false } : null;
    }
    if (ent.guard === 'simpleDialog') {
      const clsAll = deepClassToks(n, 120);
      // 富体拒绝：子树含进度条（ms-progress/-bar/-pct）/上传/拖拽/表格/统计/时间轴/树 →
      // 库「弹窗」（图标+标题+描述+按钮）表达不了，本地重绘；家族类名（bc-*-progress）不算——只认真实富体元素
      const rich = clsAll.some(c => c === 'ms-progress' || /progress-(bar|line|text|pct)/.test(c)
        || /(^|-)(upload|drag|table|stats|stat|timeline|tree)(-|$)/.test(c));
      if (rich) return null;
      let modal = null, modalCount = 0;
      (function fm(m) {
        (m.ch || []).forEach(c => {
          if (c.t === 'f' && c.n && /\bms-modal\b/.test(c.n)) { modalCount++; if (!modal) modal = c; }
          fm(c);
        });
      })(n);
      if (modalCount !== 1 || !modal || modal.w > 560) return null;
      const texts = deepTexts(n, 9);
      if (texts.length < 2 || texts.length > 8) return null;
      const sem = [];
      clsAll.forEach(c => { const m2 = c.match(/--([a-z]+)$/); if (m2 && SEM_WORDS[m2[1]] && !sem.includes(SEM_WORDS[m2[1]])) sem.push(SEM_WORDS[m2[1]]); });
      if (!sem.length && clsAll.includes('ms-spin')) sem.push('waiting'); // 旋转图标 = Waiting 变体形状
      return { texts: deepTexts(n, 8), sem, sw: false };
    }
    if (ent.guard === 'pageTabs') {
      const items = [];
      (n.ch || []).forEach(c => {
        if (c.t !== 'f' || !c.n) return;
        const ct = c.n.trim().split(/\s+/);
        if (!ct.includes('bc-eg71-page-tab')) return;
        items.push({ text: deepTexts(c, 2).join(' '), active: ct.includes('bc-eg71-page-tab--active') });
      });
      if (items.length < 2) return null;
      return { tabs: items, sw: false, aux: ent.aux };
    }
    return {};
  }
  function walkLib(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walkLib); return; }
    if (n.t === 'f' && n.n) {
      const toks = String(n.n).trim().split(/\s+/);
      const ent = comps.find(c => toks.includes(c.cls));
      if (ent && !(ent.exclude || []).some(x => toks.includes(x))) {
        const vt = [];
        toks.forEach(t => { if (t.startsWith(ent.cls + '--')) { const m = (ent.tokens || {})[t.slice(ent.cls.length + 2)]; if (m && !vt.includes(m)) vt.push(m); } });
        const bgP = (n.f || []).find(p => p && p.c && (p.a == null || p.a > 0.05));
        const tch = (n.ch || []).find(c => c.t === 't' && c.col);
        const lib = {
          k: ent.key, f: ent.figmaName, cls: String(n.n).slice(0, 80), tok: vt,
          // col/tc：块背景色+首段文字色——插件侧 token 未决变体轴按颜色比色距裁决（库引用规则 2026-10-25）
          col: bgP ? bgP.c : undefined, tc: tch ? tch.col : undefined,
          text: ((n.ch || []).filter(c => c.t === 't').map(c => c.text).join(' ').trim().slice(0, 40)) || undefined,
          ic: (function hasVec(m) { return (m.ch || []).some(c => c.t === 'ic' || c.t === 's' || hasVec(c)); })(n)
        };
        // 实例文案改写数据源（2026-10-29 用户规则：引用实例的文本按 HTML 填写）：
        // 深层文本清单 texts + 逐段颜色 tcols（阅读顺序对齐），插件侧 TEXT 属性逐段吃、剩余按嵌套文本层回填
        const tp = deepTextPairs(n, 8);
        lib.texts = tp.map(p => p.s);
        lib.tcols = tp.map(p => p.c || undefined);
        if (ent.guard) {
          const g = evalGuard(ent, n);
          if (g) {
            Object.assign(lib, g);
            if (g.texts) lib.tcols = undefined; // 守卫 texts 用自身截断，颜色序列不对齐 → 不带
            if (g.sem) g.sem.forEach(w => { if (!lib.tok.includes(w)) lib.tok.push(w); });
            delete lib.sem;
          } else { (n.ch || []).forEach(walkLib); return; }
        }
        n.lib = lib;
        needLibs.add(ent.lib);
      }
    }
    (n.ch || []).forEach(walkLib);
  }
  scene.cells.forEach(c => walkLib(c.root));
  const hits = new Map();
  scene.cells.forEach(c => (function cc(n) {
    if (n.lib) { const k = n.lib.cls.split(/\s+/)[0]; hits.set(k, (hits.get(k) || 0) + 1); }
    else (n.ch || []).forEach(cc);
  })(c.root));
  const total = [...hits.values()].reduce((a, b) => a + b, 0);
  if (total) libStats = { total, by: [...hits].map(([k, v]) => k.split(/\s+/)[0] + '×' + v).join(' ') };
} catch (e) { console.warn('component-keys.json 缺失或损坏，库组件实例化跳过: ' + e.message); }

// scene.libs：图标命中（icon-keys.json library 字段）+ 控件命中聚合出的库需求，
// 插件面板据此做 assets 选择门禁（库未订阅时 importComponent 必回退，生成了也不是库实例）
try {
  if (iconStats && iconStats.inst > 0 && LIBRARIES) {
    const icCfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'icon-keys.json'), 'utf8'));
    const hit = Object.entries(LIBRARIES).find(([, v]) => v && v.name === icCfg.library);
    if (hit) needLibs.add(hit[0]);
  }
} catch (e) { /* icon-keys 元数据缺失不阻断 */ }
if (!EXT && needLibs.size && LIBRARIES) {
  scene.libs = [...needLibs].filter(id => LIBRARIES[id])
    .map(id => ({ id, name: LIBRARIES[id].name, key: LIBRARIES[id].libraryKey }));
  console.log('库需求: ' + scene.libs.map(l => l.name).join(' + ') + '（插件面板 assets 门禁）');
}

// 重复块自动成组件：bc-* / ms-* 块级类做结构签名（类名+几何+填充+阴影+圆角+文本全量哈希），
// 跨屏出现 ≥2 次的块 → scene.defs 定义一份 + 原位替换为 {t:'inst'} 引用；插件侧 createComponent/createInstance。
// 变体分组（写明，设计师视角）：同名（同家族）的多个 def = 同一组件的不同形态，互为变体——
// scene.defs 逐个带 vname（取块内首段文本做变体名），插件侧 figma.combineAsVariants 合成 COMPONENT_SET，
// 不散落成 N 个孤立组件；组件定义统一收进「组件定义」画板按家族分节网格排版。
let compStats = null;
(function componentize(scene) {
  if (EXT) return; // 外部网页：不产本地组件/变体集，纯图层
  const MIN_DUP = 2, MIN_AREA = 64;
  function isBlockClass(n) { return n && !n.lib && n.n && /^(bc|ms)-/.test(n.n) && n.w * n.h >= MIN_AREA; }
  function sig(n) {
    if (n.t === 'inst') return 'i' + n.d;
    const r10 = v => Math.round(v * 10);
    const parts = [n.t, n.n || '', r10(n.w), r10(n.h), JSON.stringify(n.f || []),
      JSON.stringify((n.e || []).map(e => [e.k, e.c, e.a, e.x, e.y, e.b, e.s])),
      JSON.stringify(n.r || {}), n.clip ? 1 : 0, n.o == null ? 1 : r10(n.o * 100) / 100,
      JSON.stringify(n.bg || []), n.al ? JSON.stringify(n.al) : '',
      n.rot || 0, n.bm || '', n.stk ? JSON.stringify(n.stk) : ''];
    if (n.t === 't') parts.push(n.text, n.fs, n.fw, n.lh, n.ls, JSON.stringify(n.col), n.al, r10(n.w), r10(n.h), n.it || 0, n.tr || 0, n.td || '');
    if (n.t === 's' || n.t === 'ic') parts.push(n.k || n.svg || '');
    (n.ch || []).forEach(c => parts.push(sig(c), r10(c.x), r10(c.y)));
    return parts.join('|');
  }
  const candidates = [];
  scene.cells.forEach(c => (function cc(n) {
    if (n.lib) return; // 库组件子树保留原样（回退用），不参与去重
    if (n.t === 'f' && isBlockClass(n)) candidates.push(n);
    (n.ch || []).forEach(cc);
  })(c.root));
  const countBySig = new Map();
  candidates.forEach(n => { const s = sig(n); countBySig.set(s, (countBySig.get(s) || 0) + 1); });
  const countTree = n => 1 + (n.ch || []).reduce((a, c) => a + countTree(c), 0);
  const defById = new Map();
  let defSeq = 0;
  const stats = { defs: 0, insts: 0, cutNodes: 0 };
  function process(node) {
    if (!node.ch) return;
    const out = [];
    for (const c of node.ch) {
      if (c.lib) { out.push(c); continue; } // 不改写库组件子树内部
      if (c.t === 'f' && isBlockClass(c) && (countBySig.get(sig(c)) || 0) >= MIN_DUP) {
        const s = sig(c);
        let def = defById.get(s);
        if (!def) { def = { id: 'c' + (++defSeq), name: (c.n || 'block').split(/\s+/)[0].slice(0, 40), root: c }; defById.set(s, def); }
        stats.insts++; stats.cutNodes += countTree(c) - 1;
        out.push({ t: 'inst', d: def.id, x: c.x, y: c.y, w: c.w, h: c.h, o: c.o == null ? 1 : c.o });
        continue;
      }
      process(c);
      out.push(c);
    }
    node.ch = out;
  }
  scene.cells.forEach(cell => process(cell.root));
  // 嵌套成组件：def 内部子块同样去重（迭代到不动点，组件内含组件实例）
  for (let round = 0; round < 5; round++) {
    const before = stats.insts;
    defById.forEach(d => process(d.root));
    if (stats.insts === before) break;
  }
  if (stats.insts) {
    stats.defs = defById.size;
    // 变体分组元数据：家族内 ≥2 个 def 互为变体，vname 取块内首段文本（去重后）做变体名
    const famCount = new Map();
    defById.forEach(d => famCount.set(d.name, (famCount.get(d.name) || 0) + 1));
    const famUsed = new Map();
    defById.forEach(d => {
      if ((famCount.get(d.name) || 0) < 2) return;
      let label = '';
      (function firstText(n) {
        if (label) return;
        if (n.t === 't' && n.text) { label = String(n.text).replace(/\s+/g, ' ').trim().slice(0, 16); return; }
        (n.ch || []).some(firstText);
      })(d.root);
      let base = label || ('v' + d.id.slice(1));
      let v = base, k = 2;
      const used = famUsed.get(d.name) || new Set();
      while (used.has(v)) v = base + ' ' + k++;
      used.add(v); famUsed.set(d.name, used);
      d.vname = v;
    });
    stats.families = famCount.size;
    stats.variantSets = [...famCount.values()].filter(c => c >= 2).length;
    scene.defs = {};
    defById.forEach(d => { scene.defs[d.id] = { name: d.name, vname: d.vname, root: d.root }; });
    scene.v = 2;
    compStats = stats;
  }
})(scene);

// 颜色令牌汇总（scene.tokMap 由页内反查导出，仅 Node 侧消费）：lib 文本逐段颜色反查 ttoks（与 tcols 平行），
// 再收集树内全部令牌标记（tk/ftk/ctk/stk.tk/al.btk/lib.ttoks）→ scene.tokVars={令牌名:库变量key} 供插件绑定。
if (scene.tokMap) {
  const FAM = { text: ['color-text-'], fill: ['color-fill-', 'color-bg-', 'color-base-', 'color-mask', 'color-primary-'], icon: ['color-icon-'], stroke: ['color-border-', 'color-divider-'] };
  const pickTok = (c, site) => {
    if (!c) return undefined;
    const cand = scene.tokMap[Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255)];
    if (!cand || !cand.length) return undefined;
    const fam = FAM[site] || [];
    let best = null, bs = -1;
    cand.forEach(nm => {
      const s = (fam.some(p => nm.indexOf(p) === 0) ? 100 : 0) + (/\d\d$/.test(nm) ? 0 : 10);
      if (s > bs) { bs = s; best = nm; }
    });
    return best;
  };
  scene.cells.forEach(c => (function wt(n) {
    if (n.lib && Array.isArray(n.lib.tcols)) n.lib.ttoks = n.lib.tcols.map(cc => pickTok(cc, 'text'));
    (n.ch || []).forEach(wt);
  })(c.root));
  const used = new Set();
  const gather = n => {
    if (!n || typeof n !== 'object') return;
    if (n.tk) used.add(n.tk);
    if (n.ftk) used.add(n.ftk);
    if (n.ctk) used.add(n.ctk);
    if (n.stk && n.stk.tk) used.add(n.stk.tk);
    if (n.al && n.al.btk) used.add(n.al.btk);
    if (n.lib && n.lib.ttoks) n.lib.ttoks.forEach(t => { if (t) used.add(t); });
    (n.ch || []).forEach(gather);
  };
  scene.cells.forEach(c => gather(c.root));
  if (scene.defs) Object.keys(scene.defs).forEach(id => gather(scene.defs[id].root));
  const tokVars = {};
  used.forEach(nm => { const k = TOK_VARS && TOK_VARS[nm]; if (k) tokVars[nm] = k; });
  if (Object.keys(tokVars).length) {
    scene.tokVars = tokVars;
    console.log('令牌绑定: ' + Object.keys(tokVars).length + ' 个库颜色变量（Milesight_IOT_Web · Color Token，插件 importVariableByKeyAsync 绑定）');
  }
  delete scene.tokMap;
}

// 序列化审计用的 DOM 路径 p 落盘前剥离（rct 已解析，运行时不再需要）
function stripP(n) {
  if (!n || typeof n !== 'object') return;
  delete n.p;
  (n.ch || []).forEach(stripP);
}
scene.cells.forEach(c => stripP(c.root));
if (scene.defs) Object.keys(scene.defs).forEach(id => stripP(scene.defs[id].root));

fs.writeFileSync(path.join(outDir, 'scene.json'), JSON.stringify(scene));

const tiled = buildExportPage(html, path.basename(demoPath, '.html'));
if (tiled.states) fs.writeFileSync(path.join(outDir, 'figma-export.html'), tiled.html);

const count = n => 1 + (n.ch || []).reduce((a, c) => a + count(c), 0);
scene.cells.forEach(c => console.log('  屏 ' + c.label + '｜' + count(c.root) + ' 节点｜' + c.w + '×' + Math.round(c.h)));
console.log('完成 → ' + path.join(outDir, 'scene.json') +
  (tiled.states ? ' + figma-export.html（全状态铺开参考页）'
    : (EXT && scene.cells.length > 1 ? '（外部网页多页转录 ' + scene.cells.length + ' 帧）' : '（无契约，单态）')));
if (EXT) console.log('模式: 外部网页纯图层转录——跳过本地组件库匹配/组件化/图标库映射/令牌绑定（--ext，链接导入不走自家组件体系）');
if (iconStats) console.log('图标: 库实例 ' + iconStats.inst + '｜识别但无映射(矢量) ' + iconStats.nomap + '｜其他矢量 ' + iconStats.plain);
if (scene.stats) console.log('自动布局: flex 置信转换 ' + (scene.stats.al || 0) + ' 容器｜图片 ' + (scene.stats.img || 0) + '｜背景图层(渐变/底图) ' + (scene.stats.bg || 0));
if (flatCut) console.log('拍平: 透传空壳帧 ' + flatCut + ' 层（无视觉无语义类）');
if (libStats) console.log('库组件: 命中 ' + libStats.total + ' 处（' + libStats.by + '）→ 插件 importComponent(Set)ByKeyAsync 实例化（token+颜色择变体）');
if (compStats) console.log('组件化: 定义 ' + compStats.defs + ' 个（家族 ' + compStats.families + '，变体集 ' + compStats.variantSets + ' 个待 combineAsVariants）｜实例引用 ' + compStats.insts + ' 处｜省节点 ' + compStats.cutNodes + '（scene v2 defs）');
if (rctCount) console.log('原型连线: ' + rctCount + ' 条（setup 触发节点 ON_CLICK → 目标态画板，插件侧 reactions）');

// 插件数据服务（serve.py，CORS 静态服务）保活：
// 端口空闲 → 自动拉起；端口被占但 serve.py 源码比运行进程新 → 旧进程跑的是旧代码
// （改了不生效，2026-10-30 面板连不上/链接导入不走 --ext 的根因），自动重启对时。
// 日志统一落 serve.log（此前 stdio ignore 导致 Failed to fetch 无从取证）。
(function ensureServe() {
  const serve = path.join(os.homedir(), 'Desktop/html-to-figma-internal/serve.py');
  if (!fs.existsSync(serve)) return;
  const spawnServe = (msg) => {
    const log = path.join(path.dirname(serve), 'serve.log');
    cp.spawn('python3', [serve], { detached: true,
      stdio: ['ignore', fs.openSync(log, 'a'), fs.openSync(log, 'a')] }).unref();
    if (msg) console.log(msg);
  };
  let pid = null;
  try { pid = cp.execSync('lsof -ti :8124 -sTCP:LISTEN').toString().trim().split('\n')[0]; }
  catch (e) { return spawnServe('已自动启动 serve.py（127.0.0.1:8124，V2 插件面板端口，日志 serve.log）'); }
  if (!pid || String(process.ppid) === pid) return; // 自己就是 serve.py 拉起的：重启会切断本次构建的 HTTP 响应
  try {
    const cmd = cp.execSync('ps -o command= -p ' + pid).toString();
    if (!/serve\.py/.test(cmd)) return; // 8124 被其他程序占用，不动
    const started = new Date(cp.execSync('ps -o lstart= -p ' + pid).toString().trim()).getTime();
    if (isNaN(started) || fs.statSync(serve).mtimeMs <= started) return;
    process.kill(Number(pid), 'SIGTERM');
    for (let i = 0; i < 15; i++) { // 等端口释放，最多 ~3s
      try { cp.execSync('lsof -ti :8124 -sTCP:LISTEN', { stdio: 'ignore' }); cp.execSync('sleep 0.2'); }
      catch (e) { break; }
    }
    try { cp.execSync('lsof -ti :8124 -sTCP:LISTEN', { stdio: 'ignore' }); }
    catch (e) { return spawnServe('serve.py 源码已更新：已自动重启后台（旧进程 ' + pid + '）'); }
    console.log('serve.py 源码已更新，但旧进程 ' + pid + ' 未退出——手动重启：kill ' + pid + ' && python3 ' + serve);
  } catch (e) {}
})();
