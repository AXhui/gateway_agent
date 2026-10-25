#!/usr/bin/env node
// scene.json 生成器 —— html-to-figma-internal 插件（~/Desktop）的数据源。
// 原理：向 demo 注入序列化脚本 → 无头 Chrome 真实渲染 → 逐态 walk DOM + computed style
// → scene.json（插件 code.js 的消费格式）落桌面；无 MS_FIGMA_EXPORT 契约时回退单态。
// 用法: node build-scene.js <demo.html> [--out-dir ~/Desktop]

const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { buildExportPage } = require('./export-page');

const { BOOTSTRAP } = require('./scene-bootstrap');

const args = process.argv.slice(2);
const demoPath = args.find(a => !a.startsWith('--'));
const outDirIdx = args.indexOf('--out-dir');
const outDir = outDirIdx >= 0 ? args[outDirIdx + 1] : path.join(os.homedir(), 'Desktop');
if (!demoPath || !fs.existsSync(demoPath)) {
  console.error('用法: node build-scene.js <demo.html> [--out-dir <dir>]');
  process.exit(1);
}

const html = fs.readFileSync(demoPath, 'utf8');
const inject = '\n<script>' + BOOTSTRAP + '<\/script>';
const built = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, inject + '\n</body>') : html + inject;
const tmp = '/tmp/ms-scene-in-' + Date.now() + '.html';
fs.writeFileSync(tmp, built);

const chrome = process.env.CHROME && fs.existsSync(process.env.CHROME) ? process.env.CHROME
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(chrome)) { console.error('找不到 Chrome: ' + chrome + '（可用 CHROME 环境变量指定）'); process.exit(2); }

console.log('无头 Chrome 渲染中（' + (built.length / 1024).toFixed(0) + 'KB）…');
const dump = cp.execFileSync(chrome,
  ['--headless', '--disable-gpu', '--window-size=1440,900', '--virtual-time-budget=20000', '--dump-dom', 'file://' + tmp],
  { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
fs.unlinkSync(tmp);

const m = dump.match(/<script id="ms-scene-json" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error('未找到 scene.json 标记——渲染未完成或注入脚本异常'); process.exit(3); }

const scene = JSON.parse(m[1]);

// 命名规范：demo <title>（回退文件名）→ scene.name；插件侧主画板/组件画板/变体集按此命名——
// 画板名 = 功能名（"EG71 · Data Library · Inbuilt Update"），组件名 = 类名家族 + 文本变体，不出现无名层
const titleM = html.match(/<title>([^<]*)<\/title>/i);
scene.name = (titleM && titleM[1].trim()) || path.basename(demoPath, '.html');

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

// 图标实例化：页内已反查出 MS_ICONS 名（node.ic），命中 icon-keys.json 的升级为 t:'ic'（携带库组件 key）
let iconStats = null;
try {
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
try {
  const libCfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'component-keys.json'), 'utf8'));
  const comps = (libCfg.components || []).filter(c => c.enabled && c.cls && c.key);
  // 守卫（First Draft 形状匹配原则）：复合块只有形状匹配库形态才整块替换，不硬凑。
  // 守卫不过 → 不打 lib 标记，子树照常走本地重绘（内层控件仍会被各自锚点标记为库实例）。
  const SEM_WORDS = { error: 'error', danger: 'error', success: 'success', warn: 'warn', warning: 'warn', info: 'info', waiting: 'waiting', loading: 'waiting' };
  function deepTexts(m, cap) {
    const out = [];
    (function w2(x) {
      if (out.length >= cap) return;
      if (x.t === 't' && x.text && String(x.text).trim()) out.push(String(x.text).trim());
      (x.ch || []).forEach(w2);
    })(m);
    return out;
  }
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
        if (ent.guard) {
          const g = evalGuard(ent, n);
          if (g) {
            Object.assign(lib, g);
            if (g.sem) g.sem.forEach(w => { if (!lib.tok.includes(w)) lib.tok.push(w); });
            delete lib.sem;
          } else { (n.ch || []).forEach(walkLib); return; }
        }
        n.lib = lib;
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

// 重复块自动成组件：bc-* / ms-* 块级类做结构签名（类名+几何+填充+阴影+圆角+文本全量哈希），
// 跨屏出现 ≥2 次的块 → scene.defs 定义一份 + 原位替换为 {t:'inst'} 引用；插件侧 createComponent/createInstance。
// 变体分组（写明，设计师视角）：同名（同家族）的多个 def = 同一组件的不同形态，互为变体——
// scene.defs 逐个带 vname（取块内首段文本做变体名），插件侧 figma.combineAsVariants 合成 COMPONENT_SET，
// 不散落成 N 个孤立组件；组件定义统一收进「组件定义」画板按家族分节网格排版。
let compStats = null;
(function componentize(scene) {
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
  (tiled.states ? ' + figma-export.html（全状态铺开参考页）' : '（无契约，单态）'));
if (iconStats) console.log('图标: 库实例 ' + iconStats.inst + '｜识别但无映射(矢量) ' + iconStats.nomap + '｜其他矢量 ' + iconStats.plain);
if (scene.stats) console.log('自动布局: flex 置信转换 ' + (scene.stats.al || 0) + ' 容器｜图片 ' + (scene.stats.img || 0) + '｜背景图层(渐变/底图) ' + (scene.stats.bg || 0));
if (flatCut) console.log('拍平: 透传空壳帧 ' + flatCut + ' 层（无视觉无语义类）');
if (libStats) console.log('库组件: 命中 ' + libStats.total + ' 处（' + libStats.by + '）→ 插件 importComponent(Set)ByKeyAsync 实例化（token+颜色择变体）');
if (compStats) console.log('组件化: 定义 ' + compStats.defs + ' 个（家族 ' + compStats.families + '，变体集 ' + compStats.variantSets + ' 个待 combineAsVariants）｜实例引用 ' + compStats.insts + ' 处｜省节点 ' + compStats.cutNodes + '（scene v2 defs）');
if (rctCount) console.log('原型连线: ' + rctCount + ' 条（setup 触发节点 ON_CLICK → 目标态画板，插件侧 reactions）');

// 端口空闲时自动拉起插件数据服务（serve.py，CORS 静态服务）
try {
  cp.execSync('lsof -i :8123 -sTCP:LISTEN', { stdio: 'ignore' });
} catch (e) {
  const serve = path.join(os.homedir(), 'Desktop/html-to-figma-internal/serve.py');
  if (fs.existsSync(serve)) {
    cp.spawn('python3', [serve], { detached: true, stdio: 'ignore' }).unref();
    console.log('已自动启动 serve.py（localhost:8123）');
  }
}
