// 设计师视角（持续优化轴，2026-10-24 起）：设计师搭稿怎么用 Figma，脚本就朝哪做——
// ① 组件集+变体：同家族形态 combineAsVariants 合成一集，右侧面板直接切变体（已做）
// ② 组件画板分节收纳：组件定义收进「组件定义」画板按家族分节，不散落长龙（已做）
// ③ 团队库实例：控件/壳件直调发布库，可一键换库组件（已做）。引用契约（2026-10-25 库引用研究）：
//    component key → importComponentByKeyAsync；component_set key → importComponentSetByKeyAsync
//    （错配必抛错，先试前者失败回退后者）；变体先按修饰类 token、token 未决轴再按 HTML 颜色比色距择变体
// ④ 图层命名可读：类名/文本命名，图层树可辨认（已做）
// ⑤ 属性驱动实例化：按官方手册 componentPropertyDefinitions/variantProperties/setProperties 契约
//    把 HTML 修饰类映射成右侧面板属性值（VARIANT 选选项、BOOLEAN 图标/禁用、TEXT 写文案），
//    实例落图即带正确属性，设计师右侧面板所见即 demo 所示（已做，2026-10-24）
// ⑥ 视觉保真对齐 html.to.design：图片（img/canvas/背景底图 → image fill，data URL/远程均支持）、
//    渐变（linear 角度精确换算 gradientTransform，radial 近似内切圆）、
//    自动布局（序列化侧置信判定的 flex 容器 → layoutMode/padding/gap/描边，可增删内容不错位）（已做，2026-10-24）
// ⑦ 原型连线（2026-10-25）：scene.rct（setup 真实 click 捕获 / demo 契约 trigger 选择器标注）→
//    节点 reactions（ON_CLICK → NAVIGATE 目标态画板），demo 落图即成可点击原型——html.to.design 不做的交互保真。
//    配套：伪元素（::before/::after 装饰/文本/CSS 三角/L 形箭头含 rotate）、overflow hidden → clipsContent、
//    斜体/下划线/删除线/截断、虚线描边、混合模式、纯旋转——序列化侧 verify-scene.js 四页 100% 审计。
// ⑧ 动态找库组件 + 跨导入复用（2026-10-29 用户指令：不要自己生产，去库里找组件引用）：
//    getTeamLibraryAsync 拉库目录——key 失效（库重发布 key 轮换）按家族名找回现 key；
//    未入映射表的原子 ms-* 控件按类名词干匹配目录组件名实例化；重复块 def 同名同尺寸
//    引用本文件既有组件（多页面重复不再每次新建）。
// 待做：富文本分段、Variables 样式绑定、按态分页整理

// 与组件库 tokens.css 的 --font-family 对齐（'PingFang SC',-apple-system,...）
// PingFang SC 只有 Ultralight/Thin/Light/Regular/Medium/Semibold——无 Bold，700+ 统一退化 Semibold
const FONT_FAMILY = 'PingFang SC';
const STYLE_MAP = {
  300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold'
};

let loadedStyles = new Set();
// 纯映射（不依赖字体已加载——collectFontStyles 在 loadFontAsync 之前跑，须用本函数）；
// styleFor 才做「已加载回退」
function styleNameFor(fw) {
  return STYLE_MAP[fw] || (fw >= 600 ? 'Semibold' : fw >= 500 ? 'Medium' : fw >= 300 ? 'Light' : 'Regular');
}
function styleFor(fw) {
  if (!loadedStyles.size) return 'Regular';
  const s = styleNameFor(fw);
  return loadedStyles.has(s) ? s : (loadedStyles.has('Regular') ? 'Regular' : s);
}
function fontFamilyFor() {
  return loadedStyles.size ? FONT_FAMILY : 'Inter';
}
function solid(c, a) {
  return { type: 'SOLID', color: { r: c[0], g: c[1], b: c[2] }, opacity: a == null ? 1 : a };
}
function toEffect(e) {
  return {
    type: e.k === 'in' ? 'INNER_SHADOW' : 'DROP_SHADOW',
    // Effect.color 是 RGBA 对象（alpha 键必须是 a，不是 Paint 契约的 opacity）
    color: { r: e.c[0], g: e.c[1], b: e.c[2], a: e.a == null ? 1 : e.a },
    offset: { x: e.x, y: e.y },
    radius: e.b || 0, spread: e.s || 0,
    visible: true, blendMode: 'NORMAL'
  };
}
function collectFontStyles(node, set) {
  if (node.t === 't') { const s = styleNameFor(node.fw); set.add(s); if (node.it) set.add(s + ' Italic'); }
  (node.ch || []).forEach(c => collectFontStyles(c, set));
}

function postStatus(text) {
  try { figma.ui.postMessage({ type: 'status', text }); } catch (e) {}
}

function sceneRoots(scene) {
  const roots = scene.cells.map(c => c.root);
  if (scene.defs) Object.keys(scene.defs).forEach(id => roots.push(scene.defs[id].root));
  return roots;
}

async function ensureFonts(scene) {
  const set = new Set(['Regular', 'Medium', 'Semibold']);
  sceneRoots(scene).forEach(r => collectFontStyles(r, set));
  loadedStyles = new Set();
  for (const style of set) {
    try {
      await figma.loadFontAsync({ family: FONT_FAMILY, style });
      loadedStyles.add(style);
    }
    catch (e) { console.warn('font load fail', style, e); }
  }
  if (!loadedStyles.size) await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
}

let ICON_MAP = new Map();
let iconInstCount = 0, iconFallbackCount = 0;
let libInstCount = 0, libFallbackCount = 0, libPropCount = 0, libImportFailCount = 0, libColorPickCount = 0, libShapePickCount = 0, libSwapCount = 0;

// —— 动态找库组件（2026-10-29 用户指令：不要自己生产，去团队库找组件引用）——
// getTeamLibraryAsync 拉每份可访问库的组件目录（key+name），两类命中：
// ① component-keys.json 的 key 失效（库重发布 key 轮换）→ 按家族名找回现 key 重试；
// ② 未入映射表的原子 ms-* 控件 → 类名词干与目录组件名归一精确匹配（复合容器仍本地编排，同守卫哲学）。
let LIB_CATALOG = [];             // [{lib, key, name}]
let libDynHitCount = 0;
const CATALOG_CACHE = new Map();  // norm(name) → 目录条目（或 null，防重复线性扫）
async function buildLibCatalog() {
  LIB_CATALOG = []; CATALOG_CACHE.clear();
  if (typeof figma.getTeamLibraryAsync !== 'function' || typeof figma.getAvailableLibrariesAsync !== 'function') return;
  try {
    const list = await figma.getAvailableLibrariesAsync();
    for (const a of (list || [])) {
      try {
        const pub = await figma.getTeamLibraryAsync(a.id);
        const eat = x => (Array.isArray(x) ? x : Object.values(x || {}))
          .forEach(c => { if (c && c.key && c.name != null) LIB_CATALOG.push({ lib: a.name, key: c.key, name: String(c.name) }); });
        eat(pub.components); eat(pub.componentSets);
      } catch (e) { console.warn('catalog fail:', a.name, e && e.message || e); }
    }
    postStatus('库目录 ' + LIB_CATALOG.length + ' 组件（' + (list || []).length + ' 库）');
  } catch (e) { console.warn('catalog unavailable:', e && e.message || e); }
}
function catalogFind(name) {
  if (name == null || name === '') return null;
  const q = norm(String(name));
  if (!q) return null;
  if (!CATALOG_CACHE.has(q)) {
    // 目录名常带路径前缀与序号（'1 Basic/2 Button'、'2 Navigation/1 Breadcrumb'）——
    // 归一键双轨：全名归一 + 末段（'/' 后、去前导序号）归一，命中任一即算匹配。
    // 团队空间多个库存在同名组件（弹窗/标题 在 YCM UI、Linkus、管理端等库各有同名）——
    // 权威两库（Milesight_IOT_Web / 网关路由器业务组件库）优先，防命中错误库
    const hits = LIB_CATALOG.filter(c => {
      const s = String(c.name);
      const seg = (s.split('/').pop() || s).replace(/^[\s\d.]+/, '');
      return norm(s) === q || (seg && norm(seg) === q);
    });
    CATALOG_CACHE.set(q, hits.find(h => AUTH_LIB_RE.test(String(h.lib))) || hits[0] || null);
  }
  return CATALOG_CACHE.get(q);
}
const AUTH_LIB_RE = /milesight|网关/i; // 权威两库优先（同名组件多库并存时的裁决依据）
// 类名词干 → 库组件名别名。两份库命名混排：web 库英文名（Input/Alert/Card…），
// 业务库中文名（标题/弹窗/导航栏…）；英文词干与英文名经 catalogFind 末段归一直接相等，
// 中文名与缩写词干必须在此桥接（2026-10-29 用户实测「组件库很多没有匹配上」的补口）
const STEM_ALIAS = {
  btn: 'button',
  stat: 'Statistic',            // ms-stat → web 库 Statistic
  segmented: 'Segmented-group',
  header: '导航栏',              // ms-header → 业务库 导航栏
  title: '标题',                 // *-title 词干 → 业务库 标题
  mask: '弹窗',                  // ms-mask → 业务库 弹窗（快路径已覆盖，兜底）
  picker: 'picker-cell',         // picker 词干 → 业务库 picker-cell
  alert: 'Alert', breadcrumb: 'Breadcrumb', message: 'Message', drawer: 'Drawer',
  card: 'Card', form: 'Form-Item', progress: 'Progress-Line'
};
function dynLibFor(n) {
  if (!n.n) return null;
  const toks = String(n.n).trim().split(/\s+/).filter(Boolean);
  const stem = toks.find(t => /^(ms|bc)-[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(t) && !t.includes('--'));
  if (!stem) return null;
  // 原子守卫：子节点仅文本/图标/svg/图片才算原子控件；含子容器的复合块本地编排（内层原子各自命中）
  if (!(n.ch || []).every(c => c.t === 't' || c.t === 'ic' || c.t === 's' || c.t === 'img')) return null;
  const word = stem.replace(/^(ms|bc)-/, '');
  const ent = catalogFind(STEM_ALIAS[word] || word) || catalogFind(word);
  if (!ent) return null;
  const tok = [];
  toks.forEach(t => { if (t.startsWith(stem + '--')) { const s = t.slice(stem.length + 2); if (s && !tok.includes(s)) tok.push(s); } });
  const bgP = (n.f || []).find(p => p && p.c && (p.a == null || p.a > 0.05));
  const tch = (n.ch || []).find(c => c.t === 't' && c.col);
  // 动态命中同样带深层文本清单（与 build-scene walkLib 对齐）：实例文案按 HTML 全量改写
  const pairs = [];
  (function wpt(x) {
    if (pairs.length >= 8) return;
    if (x.t === 't' && x.text && String(x.text).trim()) pairs.push({ s: String(x.text).trim(), c: x.col });
    (x.ch || []).forEach(wpt);
  })(n);
  return { k: ent.key, f: ent.name, cls: String(n.n).slice(0, 80), tok,
    col: bgP ? bgP.c : undefined, tc: tch ? tch.col : undefined,
    texts: pairs.map(p => p.s), tcols: pairs.map(p => p.c || undefined),
    text: ((n.ch || []).filter(c => c.t === 't').map(c => c.text).join(' ').trim().slice(0, 40)) || undefined,
    ic: (n.ch || []).some(c => c.t === 'ic' || c.t === 's'), dyn: true };
}

async function preloadIconComponents(scene) {
  const pairs = new Map(); // key → 家族名（key 失效时按名从库目录动态找回现 key）
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.t === 'ic' && n.k) pairs.set(n.k, n.f);
    if (n.lib && n.lib.k) pairs.set(n.lib.k, n.lib.f); // 库组件（图标与业务/基础控件同一导入通道）
    if (n.lib && n.lib.aux) Object.keys(n.lib.aux).forEach(a => { const au = n.lib.aux[a]; const ak = au && au.key; if (ak) pairs.set(ak, au.figmaName); }); // 复合块嵌套 swap 的辅助组件集
    (n.ch || []).forEach(walk);
  })(sceneRoots(scene));
  const arr = [...pairs.keys()];
  if (!arr.length) return;
  postStatus('导入库组件 0/' + arr.length + '…');
  let done = 0;
  await Promise.all(arr.map(async k => {
    try { ICON_MAP.set(k, await figma.importComponentByKeyAsync(k)); }
    catch (e1) {
      // 组件集 key 只认 importComponentSetByKeyAsync（真 API 错配即抛，曾致全部控件静默回退）
      try { ICON_MAP.set(k, await figma.importComponentSetByKeyAsync(k)); }
      catch (e) { await importByKeyOrName(k, pairs.get(k), e); }
    }
    done++;
    if (done % 20 === 0) postStatus('导入库组件 ' + done + '/' + arr.length + '…');
  }));
}
// key 失效兜底（库重发布后 key 轮换）：按家族名从库目录找现 key 重试，仍失败才计导入失败
async function importByKeyOrName(k, fam, err) {
  const alt = catalogFind(fam);
  if (alt && alt.key !== k) {
    try { ICON_MAP.set(k, await figma.importComponentByKeyAsync(alt.key)); libDynHitCount++; return; } catch (e2) {}
    try { ICON_MAP.set(k, await figma.importComponentSetByKeyAsync(alt.key)); libDynHitCount++; return; } catch (e3) {}
  }
  libImportFailCount++;
  console.warn('component import fail:', k, err);
}
// 就地导入（动态命中的 key 不在预载集）：component API 优先、set API 回退、key 失效按名找回
async function ensureLibComp(k, fam) {
  let c = ICON_MAP.get(k);
  if (c) return c;
  try { c = await figma.importComponentByKeyAsync(k); }
  catch (e1) {
    try { c = await figma.importComponentSetByKeyAsync(k); }
    catch (e) { await importByKeyOrName(k, fam, e); c = ICON_MAP.get(k) || null; }
  }
  if (c) ICON_MAP.set(k, c);
  return c;
}

async function paintIconStrokes(inst, col, tok) {
  const plain = solid(col, 1);
  // 描边/填充两种落点各按 scope 绑定（icon 族变量多为 SHAPE_FILL；错配 scope 由 tokPaint 内部跳过）
  const sp = tok ? await tokPaint(plain, tok, 'STROKE') : plain;
  const fp = tok ? await tokPaint(plain, tok, 'SHAPE_FILL') : plain;
  (function walk(nd) {
    try {
      if ('strokes' in nd && nd.strokes.length) nd.strokes = [sp];
      // fill 型图标（无描边、纯黑填充=currentColor 默认）：填色一并覆盖
      else if (nd.type === 'VECTOR' && nd.fills && nd.fills.length === 1 && nd.fills[0].type === 'SOLID' &&
        nd.fills[0].color.r < 0.01 && nd.fills[0].color.g < 0.01 && nd.fills[0].color.b < 0.01)
        nd.fills = [fp];
    } catch (e) {}
    if (nd.children) nd.children.forEach(walk);
  })(inst);
}

async function materializeIcon(n) {
  const comp = n.k && ICON_MAP.get(n.k);
  if (!comp) { iconFallbackCount++; return null; }
  try {
    const inst = comp.createInstance();
    try { inst.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01)); }
    catch (e) { inst.rescale(Math.max(n.w, 0.01) / (comp.width || 24)); }
    if (n.col) await paintIconStrokes(inst, n.col, n.ctk);
    iconInstCount++;
    return inst;
  } catch (e) {
    iconFallbackCount++;
    console.warn('icon instance fail:', n.f || n.k, e);
    return null;
  }
}

// SVG 克隆缓存：同形 svg 只解析一次，后续 clone() 远快于重复 createNodeFromSvg
const svgCache = new Map();
function createSvgNode(svg) {
  let proto = svgCache.get(svg);
  if (proto === null) return null;
  if (!proto) {
    try { proto = figma.createNodeFromSvg(svg); }
    catch (e) { svgCache.set(svg, null); return null; }
    svgCache.set(svg, proto);
    const inst = proto.clone();
    return inst;
  }
  return proto.clone();
}

// 图片/渐变 paint：img 与背景底图 → IMAGE fill（hash 缓存，data URL/远程皆走 createImageAsync）；
// linear 渐变角度 → gradientTransform（CSS 角度 0deg=向上、顺时针，起点=中心-方向/2、终点=中心+方向/2），
// radial 一律内切圆近似
const IMG_CACHE = new Map();
let imgFillCount = 0, gradFillCount = 0, alApplyCount = 0;
let rctCount = 0; // 原型连线数（rct → reactions）
let cellFrames = []; // 各态画板（rct 目标）
// 颜色令牌绑定（scene.tokVars={令牌名:库变量key}，注册表 tools/figma-bridge/token-vars.json）：
// 实色一律绑 Milesight_IOT_Web「Color Token」库变量，不新建裸色值——改库变量全局生效。
// scope 门禁按运行时 Variable.scopes（空数组=全域）；读回校验：绑定后 paint.color 反映变量值，
// 与原色偏差>0.02 说明库值≠demo 色（如暗色 demo 进亮色文件），回退裸色保视觉。
let CUR_SCENE = null;
const VAR_CACHE = new Map();
let tokBindCount = 0;
async function tokVar(name) {
  const key = CUR_SCENE && CUR_SCENE.tokVars && CUR_SCENE.tokVars[name];
  if (!key) return null;
  if (VAR_CACHE.has(key)) return VAR_CACHE.get(key);
  let v = null;
  try { v = await figma.variables.importVariableByKeyAsync(key); }
  catch (e) { console.warn('token var import fail:', name, e); }
  VAR_CACHE.set(key, v);
  return v;
}
async function tokPaint(paint, tokName, needScope) {
  if (!paint || paint.type !== 'SOLID' || !tokName) return paint;
  const v = await tokVar(tokName);
  if (!v) return paint;
  const sc = v.scopes || [];
  if (sc.length && sc.indexOf(needScope) < 0) return paint; // fill 族绑不到 stroke 等错配直接跳过
  try {
    const p = Object.assign({}, paint);
    figma.variables.setBoundVariableForPaint(p, 'color', v);
    const o = paint.color, b = p.color;
    if (!b || Math.abs(o.r - b.r) + Math.abs(o.g - b.g) + Math.abs(o.b - b.b) > 0.02) return paint;
    tokBindCount++;
    return p;
  } catch (e) { return paint; }
}
// 同步路径（applyFrameProps/applyAutoLayout 设 strokes）不能 await：先落裸色，入队导入尾声统一绑定替换
const TOK_BIND_QUEUE = [];
async function flushTokBinds() {
  for (const b of TOK_BIND_QUEUE) {
    const p = await tokPaint(b.paint, b.tok, b.scope);
    if (p !== b.paint) { try { const arr = (b.node[b.field] || []).slice(); arr[b.idx] = p; b.node[b.field] = arr; } catch (e) {} }
  }
  TOK_BIND_QUEUE.length = 0;
}
async function imagePaint(src, fit) {
  if (!src) return null;
  if (!IMG_CACHE.has(src)) {
    try { IMG_CACHE.set(src, (await figma.createImageAsync(src)).hash); }
    catch (e) { IMG_CACHE.set(src, null); console.warn('image fail:', String(src).slice(0, 60), e && e.message || e); }
  }
  const hash = IMG_CACHE.get(src);
  if (!hash) return null;
  imgFillCount++;
  return { type: 'IMAGE', scaleMode: fit === 'contain' ? 'FIT' : (fit === 'fill' ? 'CROP' : 'FILL'), imageHash: hash };
}
function linT(angDeg) {
  const rad = angDeg * Math.PI / 180;
  const dx = Math.sin(rad), dy = -Math.cos(rad);
  return [[dx, -dy, 0.5 - dx / 2], [dy, dx, 0.5 - dy / 2]];
}
function gradientPaint(g) {
  const stops = (g.stops || []).map(s => ({ position: s.p, color: { r: s.c[0], g: s.c[1], b: s.c[2], a: s.a == null ? 1 : s.a } }));
  gradFillCount++;
  if (g.k === 'r') return { type: 'GRADIENT_RADIAL', gradientTransform: [[0.5, 0, 0.5], [0, 0.5, 0.5]], gradientStops: stops };
  return { type: 'GRADIENT_LINEAR', gradientTransform: linT(g.ang || 180), gradientStops: stops };
}
async function buildFills(n) {
  const paints = [];
  for (const g of (n.bg || [])) {
    if (g.k === 'u') { const p = await imagePaint(g.src, g.fit); if (p) paints.push(p); }
    else paints.push(gradientPaint(g));
  }
  const sf = n.f || [];
  for (let i2 = 0; i2 < sf.length; i2++) {
    let p = solid(sf[i2].c, sf[i2].a);
    // 首个不透明实色绑库变量（ftk；帧/组件填充 → FRAME_FILL）
    if (i2 === 0 && n.ftk && (sf[i2].a == null || sf[i2].a >= 1)) p = await tokPaint(p, n.ftk, 'FRAME_FILL');
    paints.push(p);
  }
  return paints;
}

// CSS mix-blend-mode → Figma BlendMode（normal/默认不映射）；CSS dash 样式 → strokeDashes（近似节拍，宽度相关）
const BLEND_MAP = { multiply: 'MULTIPLY', screen: 'SCREEN', overlay: 'OVERLAY', darken: 'DARKEN', lighten: 'LIGHTEN',
  'color-dodge': 'COLOR_DODGE', 'color-burn': 'COLOR_BURN', 'hard-light': 'HARD_LIGHT', 'soft-light': 'SOFT_LIGHT',
  difference: 'DIFFERENCE', exclusion: 'EXCLUSION', hue: 'HUE', saturation: 'SATURATION', color: 'COLOR', luminosity: 'LUMINOSITY' };
function dashFor(style, w) {
  if (style === 'dotted') return [0.01, Math.max(0.01, w * 2)];
  if (style === 'dashed') return [w * 3, w * 2];
  return [];
}
function applyFrameProps(node, n) {
  node.clipsContent = !!n.clip;
  const es = (n.e || []).map(toEffect);
  if (es.length) { try { node.effects = es; } catch (err) { console.warn('effects skip', n.n, err); } }
  const r = n.r || {};
  if (r.tl === r.tr && r.tr === r.br && r.br === r.bl) node.cornerRadius = r.tl || 0;
  else { node.topLeftRadius = r.tl || 0; node.topRightRadius = r.tr || 0; node.bottomRightRadius = r.br || 0; node.bottomLeftRadius = r.bl || 0; }
  if (n.stk) {
    try {
      const sp = solid(n.stk.c, n.stk.a == null ? 1 : n.stk.a);
      node.strokes = [sp];
      node.strokeWeight = n.stk.w || 1;
      node.strokeAlign = 'INSIDE';
      node.strokeDashes = dashFor(n.stk.dash, n.stk.w || 1);
      if (n.stk.tk) TOK_BIND_QUEUE.push({ node, field: 'strokes', idx: 0, paint: sp, tok: n.stk.tk, scope: 'STROKE' });
    } catch (err) { console.warn('stroke skip', n.n, err); }
  }
  if (n.bm) { try { node.blendMode = BLEND_MAP[n.bm] || 'NORMAL'; } catch (err) { console.warn('blend skip', n.n, err); } }
}
// 自动布局：序列化侧置信判定的 flex 容器（scene n.al）→ Figma layoutMode；调用时机=子节点落齐之后，
// Figma 会把现有子节点按 AL 重排；主/次轴 FIXED 保几何，padding/gap/对齐一一对应，统一边框转 INSIDE 描边
function applyAutoLayout(node, a) {
  try {
    node.layoutMode = a.dir === 'row' ? 'HORIZONTAL' : 'VERTICAL';
    node.itemSpacing = Math.max(0, a.gap || 0);
    node.primaryAxisAlignItems = a.just;
    node.counterAxisAlignItems = a.align;
    node.paddingTop = a.pt || 0; node.paddingRight = a.pr || 0; node.paddingBottom = a.pb || 0; node.paddingLeft = a.pl || 0;
    node.primaryAxisSizingMode = 'FIXED';
    node.counterAxisSizingMode = 'FIXED';
    if (a.bw) {
      const bp = solid(a.bc, a.ba == null ? 1 : a.ba);
      node.strokes = [bp]; node.strokeWeight = a.bw; node.strokeAlign = 'INSIDE';
      if (a.btk) TOK_BIND_QUEUE.push({ node, field: 'strokes', idx: 0, paint: bp, tok: a.btk, scope: 'STROKE' });
    }
    alApplyCount++;
  } catch (e) { console.warn('autolayout skip', a.dir, e && e.message || e); }
}

// 库组件实例化 —— 属性驱动（官方手册核对 2026-10-24，developers.figma.com）：
// ① componentPropertyDefinitions（挂在 ComponentNode/ComponentSetNode，只读）：
//    { 属性名: { type: 'BOOLEAN'|'TEXT'|'INSTANCE_SWAP'|'VARIANT'|'SLOT', defaultValue,
//      variantOptions?（仅 VARIANT）, preferredValues?（仅 INSTANCE_SWAP）} }；
//    TEXT/BOOLEAN/INSTANCE_SWAP 的属性名带 '#<id>' 后缀。
// ② 变体值编码在变体名（Size=Small, State=Hover），官方读法是子组件 variantProperties（不解析名）。
// ③ inst.setProperties({属性名: 值})：VARIANT→选项串、BOOLEAN→bool、TEXT→string；
//    SLOT 不支持（cannotSetSlotProperty）；未指定的属性保持原值；名称冲突优先 VARIANT。
// ④ INSTANCE_SWAP/preferredValues 属定义侧（右侧面板候选列表），HTML 侧无来源信息，保持默认。
// 匹配失败任意一步 → 调用方回退整块重绘（子树已保留在 scene）
function norm(s) { return String(s).toLowerCase().replace(/[\s_-]+/g, ''); }
function pickVariantValue(def, toks) {
  const opts = def.variantOptions || [];
  const nt = (toks || []).map(norm);
  for (const o of opts) if (nt.includes(norm(o))) return o;
  for (const o of opts) {
    const no = norm(o);
    if (nt.some(t => t.length >= 3 && (no.includes(t) || t.includes(no)))) return o;
  }
  return null;
}
function pickVariantChild(set, want) {
  const kids = (set.children || []).filter(c => c.type === 'COMPONENT');
  if (!kids.length) return null;
  let defs = {};
  try { defs = set.componentPropertyDefinitions || {}; } catch (e) {}
  let best = null, bestScore = -Infinity;
  for (const k of kids) {
    let vp = {};
    try { vp = k.variantProperties || {}; } catch (e) {}
    let score = 0;
    Object.entries(want).forEach(([p, v]) => {
      if (Object.keys(vp).length) score += vp[p] === v ? 2 : (p in vp ? -1 : -0.5);
      else score += k.name.toLowerCase().includes(norm(v)) ? 2 : -0.5; // 老库无 variantProperties 时退回名字匹配
    });
    Object.entries(defs).forEach(([p, d]) => {
      if (d.type !== 'VARIANT' || want[p] != null) return;
      if (!Object.keys(vp).length || vp[p] === d.defaultValue) score += 0.5; // 未决属性贴近默认态
    });
    if (score > bestScore) { bestScore = score; best = k; }
  }
  return best;
}
function findFirstText(node) {
  if (node.type === 'TEXT') return node;
  for (const c of node.children || []) { const t = findFirstText(c); if (t) return t; }
  return null;
}
// 颜色匹配变体（用户规则 2026-10-25：button 调基础库组件、按 HTML 颜色择变体）——
// token 未决的 VARIANT 轴，比「变体子组件主导填充色」与「HTML 块背景色」的色距：
// 胜出距离 < 0.12 且领先第二名 > 0.12（明显区分才裁决，平局不判——尺寸轴颜色相同天然不参与）
function fillRgb(p) {
  try { return p && p.type === 'SOLID' && p.visible !== false ? [p.color.r, p.color.g, p.color.b] : null; } catch (e) { return null; }
}
function dominantFill(node) {
  const root = (node.fills || []).map(fillRgb).filter(Boolean)[0];
  if (root) return root;
  let best = null, bestArea = 0;
  (function w(nd) {
    (nd.children || []).forEach(ch => {
      const c = (ch.fills || []).map(fillRgb).filter(Boolean)[0];
      if (c) { const a = ch.width * ch.height; if (a > bestArea) { bestArea = a; best = c; } }
      w(ch);
    });
  })(node);
  return best;
}
function colorDist(a, b) { return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2) / Math.sqrt(3); }
function pickVariantByColor(set, defs, want, col) {
  const kids = (set.children || []).filter(c => c.type === 'COMPONENT');
  Object.entries(defs).forEach(([name, d]) => {
    if (d.type !== 'VARIANT' || want[name] != null) return;
    const dists = [];
    (d.variantOptions || []).forEach(o => {
      let best = null;
      kids.forEach(k => {
        const vp = k.variantProperties || {};
        if (Object.keys(vp).length ? vp[name] !== o : !norm(k.name).includes(norm(o))) return;
        const c = dominantFill(k);
        if (c) { const dd = colorDist(c, col); if (best == null || dd < best) best = dd; }
      });
      if (best != null) dists.push({ o, d: best });
    });
    if (dists.length < 2) return;
    dists.sort((x, y) => x.d - y.d);
    if (dists[0].d < 0.12 && dists[1].d - dists[0].d > 0.12) { want[name] = dists[0].o; libColorPickCount++; }
  });
}

// 形状择变体（First Draft 资产复用逻辑：按形状匹配库组件栈，不靠名字硬凑）——
// token/颜色都未决的 VARIANT 轴，对变体子组件按「字号差 + 文本数差 + 开关有无 + 宽高比差」打分，
// 胜出变体的 variantProperties 并入 want（仅未决轴），pickVariantChild 随之收敛到该变体。
// build-scene 侧只有守卫命中的复合块（标题/弹窗/tab）才携带形状证据（texts/fs/sw）。
function shapeMergeVariant(set, want, lib, n) {
  const kids = (set.children || []).filter(c => c.type === 'COMPONENT');
  if (kids.length < 2) return;
  const libFs = lib.fs != null ? lib.fs : null;
  const libTn = lib.texts ? lib.texts.length : null;
  let best = null, bs = null;
  kids.forEach(k => {
    const tn = []; let fs = null, sw = false;
    (function w6(nd) {
      (nd.children || []).forEach(ch => {
        if (ch.type === 'TEXT') { tn.push(ch); if (fs == null && ch.fontSize) fs = ch.fontSize; }
        if (/switch/i.test(String(ch.name || ''))) sw = true;
        w6(ch);
      });
    })(k);
    let s = 0;
    if (libFs != null && fs != null) s += Math.abs(fs - libFs) / 2;
    if (libTn != null && tn.length) s += Math.abs(Math.min(tn.length, 8) - libTn) * 0.75;
    if (lib.sw != null && sw !== !!lib.sw) s += 2;
    if (n && n.w && n.h && k.width && k.height) s += Math.abs(k.width / k.height - n.w / n.h) * 0.5;
    if (bs == null || s < bs) { bs = s; best = k; }
  });
  if (!best) return;
  let added = false;
  Object.entries(best.variantProperties || {}).forEach(([p, v]) => { if (want[p] == null) { want[p] = v; added = true; } });
  if (added) libShapePickCount++;
}
function findByName(root, re) {
  let out = null;
  (function w7(nd) { if (out) return; if (re.test(String(nd.name || ''))) { out = nd; return; } (nd.children || []).forEach(w7); })(root);
  return out;
}
// 按「轴名正则 × 轴值正则」挑变体子组件（tabs 嵌套 swap 用——轴名/取值以真库为准的宽松匹配）
function childByWants(set, wants) {
  let best = null, bs = 0;
  (set.children || []).filter(c => c.type === 'COMPONENT').forEach(k => {
    const vp = k.variantProperties || {};
    let s = 0;
    wants.forEach(([ar, vr]) => {
      if (Object.entries(vp).some(([pn, pv]) => ar.test(pn) && vr.test(String(pv)))) s += 2; else s -= 1;
    });
    if (s > bs) { bs = s; best = k; }
  });
  return best;
}
async function overrideText(t, s) {
  try {
    const fn = typeof t.getRangeFontName === 'function'
      ? t.getRangeFontName(0, Math.max(t.characters.length - 1, 0))
      : (t.fontName && t.fontName !== figma.mixed ? t.fontName : null);
    if (fn && fn !== figma.mixed) await figma.loadFontAsync(fn);
  } catch (e) {}
  try { t.characters = s; return true; } catch (e) { console.warn('text override skip', e); return false; }
}
// 页签栏三层嵌套 swap：Tabs/Top 实例 → 内部 Components/Tabs-Top 换 Item 数量=页签数的变体
// → 逐个 Tab 换 Selecte 选择=active 变体 + 文案覆写（InstanceNode 不能 appendChild，靠 mainComponent 换）
async function swapNestedTabs(inst, lib) {
  const topSet = lib.aux && lib.aux.top && ICON_MAP.get(lib.aux.top.key);
  const tabSet = lib.aux && lib.aux.tab && ICON_MAP.get(lib.aux.tab.key);
  if (!topSet || !tabSet) return;
  const inner = findByName(inst, /tabs-top/i);
  if (!inner) return;
  const cnt = lib.tabs.length;
  const topChild = childByWants(topSet, [[/item|数量/, new RegExp('^' + cnt + '$')], [/icon|图标/, /false|无|off|0/]])
    || childByWants(topSet, [[/item|数量/, new RegExp('^' + cnt + '$')]]);
  if (!topChild) return;
  try { inner.mainComponent = topChild; libSwapCount++; } catch (e) { console.warn('tabs-top swap fail', e); return; }
  const tabKids = [];
  (function w8(nd) {
    (nd.children || []).forEach(c => {
      const nm = String(c.name || '').split('/').pop();
      if (/^tab$/i.test(nm)) tabKids.push(c);
      else if (!/tabs/i.test(String(c.name || ''))) w8(c);
    });
  })(inner);
  const act = /true|选中|on|^1$/i;
  for (let i = 0; i < Math.min(tabKids.length, lib.tabs.length); i++) {
    const it = lib.tabs[i];
    let pick = childByWants(tabSet, [[/selecte|选中|选择/, it.active ? act : /false|未选|off|^0$/]]);
    if (!pick && !it.active) {
      const actKids = (tabSet.children || []).filter(c => {
        const vp = c.variantProperties || {};
        return Object.entries(vp).some(([pn, pv]) => /selecte|选中|选择/.test(pn) && act.test(String(pv)));
      });
      pick = (tabSet.children || []).filter(c => c.type === 'COMPONENT' && !actKids.includes(c))[0] || null;
    }
    if (!pick) pick = (tabSet.children || []).filter(c => c.type === 'COMPONENT')[0];
    if (!pick) continue;
    try { tabKids[i].mainComponent = pick; libSwapCount++; } catch (e) { console.warn('tab swap fail', e); continue; }
    const t2 = findFirstText(tabKids[i]);
    if (t2 && t2.characters !== it.text) await overrideText(t2, it.text);
  }
}

// 蒙版全页铁律（插件侧收口，2026-10-29）：弹窗库实例的蒙版必须铺满状态帧——
// 库组件原生 1440×900，实例内部蒙版子帧默认约束固定位置尺寸、不随根 resize 长高，
// 页面帧更高时蒙版只盖一半。强制三步：根尺寸到 n.w×n.h（resize 失败走
// resizeWithoutConstraints）→ 半透明蒙版子帧铺满 0,0 → 弹窗卡片重居中（CSS fixed 居中的等价）。
let dialogFullPageCount = 0;
function forceDialogFullPage(inst, n) {
  const w = Math.max(n.w, 0.01), h = Math.max(n.h, 0.01);
  const natW = inst.width, natH = inst.height;
  // 半透明识别双通道：FILL 级（paint.opacity 0~1）或图层级（node.opacity 0~1 + 有实色填充）。
  // 库组件蒙版常把透明度做在图层上（fill 不透明、layer 半透明），只查 FILL 会漏判 → 蒙版没铺满。
  const transl = k => {
    const fillT = (k.fills || []).some(p => p && p.type === 'SOLID' && p.opacity != null && p.opacity > 0 && p.opacity < 1);
    const layT = k.opacity != null && k.opacity > 0.05 && k.opacity < 1 && (k.fills || []).some(p => p && p.visible !== false);
    return fillT || layT;
  };
  const all = [];
  (function wq(nd) { (nd.children || []).forEach(c => { all.push(c); wq(c); }); })(inst);
  const maskKid = all.find(k => transl(k) && k.width * k.height >= 0.5 * natW * natH) || null;
  const card = all.filter(k => k !== maskKid && k.type === 'FRAME' && !transl(k) && k.width >= 80 && k.height >= 40)
    .sort((a, b) => b.width * b.height - a.width * a.height)[0] || null;
  try { inst.resize(w, h); }
  catch (e) { try { inst.resizeWithoutConstraints(w, h); } catch (e2) { console.warn('dialog full-page fail:', e2); return; } }
  if (maskKid) { try { maskKid.resize(w, h); maskKid.x = 0; maskKid.y = 0; } catch (e) {} }
  if (card) { try { card.x = (w - card.width) / 2; card.y = (h - card.height) / 2; } catch (e) {} }
  dialogFullPageCount++;
}

async function materializeLib(n) {
  let comp = ICON_MAP.get(n.lib.k);
  if (!comp) comp = await ensureLibComp(n.lib.k, n.lib.f); // 动态命中的 key 不在预载集 → 就地导入
  if (!comp) { libFallbackCount++; return null; }
  try {
    let target = comp, setWant = null;
    if (comp.type === 'COMPONENT_SET') {
      const setDefs = comp.componentPropertyDefinitions || {};
      const want = {};
      Object.entries(setDefs).forEach(([name, d]) => {
        if (d.type !== 'VARIANT') return;
        const v = pickVariantValue(d, n.lib.tok);
        if (v != null) want[name] = v;
      });
      if (n.lib.col) pickVariantByColor(comp, setDefs, want, n.lib.col);
      if (n.lib.texts || n.lib.sw != null || n.lib.tabs) shapeMergeVariant(comp, want, n.lib, n);
      target = pickVariantChild(comp, want);
      if (!target) throw new Error('set 无变体: ' + n.lib.f);
      setWant = want; // payload 继承 set 级裁决（含颜色择变体），右侧面板所见即所判
    }
    if (target.type !== 'COMPONENT') throw new Error('非组件: ' + n.lib.f);
    // setProperties payload：VARIANT/BOOLEAN/TEXT 按属性定义逐个映射，SLOT/INSTANCE_SWAP 保持默认
    const payload = {};
    let textPropSet = false, ti = 0;
    const SEM_AXES = { info: 1, error: 1, waiting: 1, warn: 1, success: 1 }; // 业务库「弹窗」语义布尔轴
    const libTexts = n.lib.texts && n.lib.texts.length ? n.lib.texts : (n.lib.text ? [n.lib.text] : []);
    try {
      const tDefs = target.componentPropertyDefinitions || {};
      const toks = (n.lib.tok || []).map(t => t.toLowerCase());
      Object.entries(tDefs).forEach(([name, d]) => {
        if (d.type === 'VARIANT') {
          const v = setWant && setWant[name] != null ? setWant[name] : pickVariantValue(d, n.lib.tok);
          if (v != null && v !== d.defaultValue) payload[name] = v;
        } else if (d.type === 'BOOLEAN') {
          const nn = norm(name);
          let val = null;
          if (/icon/.test(nn)) val = !!n.lib.ic;
          else if (/disable/.test(nn)) val = toks.includes('disabled');
          else if (SEM_AXES[nn]) val = toks.includes(nn) || (nn === 'warn' && toks.includes('warning'));
          if (val != null && val !== d.defaultValue) payload[name] = val;
        } else if (d.type === 'TEXT') {
          // 多文本覆写：守卫复合块带 texts 清单，按属性顺序逐段写入（标题/弹窗正文/按钮组）
          if (ti < libTexts.length) {
            const tv = libTexts[ti++];
            if (tv !== d.defaultValue) payload[name] = tv;
            textPropSet = true;
          }
        }
      });
    } catch (e) { console.warn('defs read fail:', n.lib.f, e); }
    const inst = target.createInstance();
    try { inst.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01)); }
    catch (e) {
      // 非弹窗：等比缩放兜底；弹窗走 forceDialogFullPage 统一收口
      if (!/ms-mask/.test(String(n.lib.cls || ''))) { try { inst.rescale(Math.max(n.w, 0.01) / (target.width || n.w)); } catch (e2) {} }
    }
    if (/ms-mask/.test(String(n.lib.cls || ''))) forceDialogFullPage(inst, n);
    if (Object.keys(payload).length) {
      try { inst.setProperties(payload); libPropCount += Object.keys(payload).length; }
      catch (e) { console.warn('setProperties skip', n.lib.cls, JSON.stringify(payload), e); }
    }
    if (libTexts.length && !n.lib.tabs) {
      // 实例文案按 HTML 全量改写（2026-10-29 用户规则）：TEXT 属性吃剩的文本按阅读顺序
      // 逐层回填到嵌套文本层（不再只改首层）；已由 TEXT 属性写对的层（characters 命中已用文本）跳过；
      // 携带 tcols 时同步把 HTML 文字色覆盖到对应层——库默认文案/灰色不残留在页面上
      const layers = [];
      (function df(nd) { (nd.children || []).forEach(c => { if (c.type === 'TEXT') layers.push(c); df(c); }); })(inst);
      const used = textPropSet ? libTexts.slice(0, ti) : [];
      const rest = libTexts.slice(used.length);
      const free = layers.filter(l => !used.some(u => u === l.characters));
      const tcols = n.lib.tcols || [];
      const ttoks = n.lib.ttoks || [];
      const n2 = Math.min(rest.length, free.length);
      for (let i2 = 0; i2 < n2; i2++) {
        if (free[i2].characters !== rest[i2]) await overrideText(free[i2], rest[i2]);
        const col = tcols[used.length + i2];
        if (col) { try { free[i2].fills = [await tokPaint(solid(col, 1), ttoks[used.length + i2], 'TEXT_FILL')]; } catch (e) {} }
      }
    }
    if (n.lib.tabs && n.lib.tabs.length) await swapNestedTabs(inst, n.lib);
    inst.name = n.lib.cls || n.lib.f;
    libInstCount++;
    return inst;
  } catch (e) {
    libFallbackCount++;
    console.warn('lib instance fail:', n.lib.f, e);
    return null;
  }
}

let nodeCount = 0, doneCells = 0, totalCells = 0;
const YIELD_EVERY = 200;
const yieldUI = () => new Promise(r => setTimeout(r, 0));

async function materialize(n, parent) {
  if (++nodeCount % YIELD_EVERY === 0) {
    postStatus('导入 ' + doneCells + '/' + totalCells + ' 屏 · ' + nodeCount + ' 节点…');
    await yieldUI();
  }
  let node, skipChildren = false;
  if (n.t === 't') {
    node = figma.createText();
    const st = styleFor(n.fw), stIt = st + ' Italic';
    node.fontName = { family: fontFamilyFor(), style: (n.it && loadedStyles.has(stIt)) ? stIt : st };
    node.characters = n.text;
    node.fontSize = n.fs;
    node.lineHeight = { unit: 'PIXELS', value: Math.max(n.lh, n.fs) };
    node.letterSpacing = { unit: 'PIXELS', value: n.ls || 0 };
    node.fills = [await tokPaint(solid(n.col, 1), n.tk, 'TEXT_FILL')];
    node.textAlignHorizontal = (n.al || 'left').toUpperCase();
    node.textAlignVertical = 'TOP';
    node.textAutoResize = 'NONE';
    if (n.tr) { try { node.textTruncation = 'ENDING'; } catch (e) {} }
    if (n.td) { try { node.textDecoration = n.td === 'u' ? 'UNDERLINE' : 'STRIKETHROUGH'; } catch (e) {} }
  } else if (n.t === 's') {
    node = createSvgNode(n.svg);
    if (!node) return null;
  } else if (n.t === 'ic') {
    node = await materializeIcon(n);
    if (!node) {
      node = n.svg ? createSvgNode(n.svg) : null;
      if (!node) return null;
    }
  } else if (n.t === 'img') {
    node = figma.createRectangle();
    const p = await imagePaint(n.src, n.fit);
    node.fills = p ? [p] : [];
    const rr = n.r || {};
    node.cornerRadius = (rr.tl === rr.tr && rr.tr === rr.br && rr.br === rr.bl) ? (rr.tl || 0) : 0;
  } else if (n.t === 'inst') {
    const comp = DEF_COMPS.get(n.d);
    if (!comp) { console.warn('def not found:', n.d); return null; }
    node = comp.createInstance();
  } else {
    if (n.lib) { node = await materializeLib(n); if (node) skipChildren = true; }
    if (!node && !n.lib && n.n && /(^|\s)(ms|bc)-/.test(String(n.n))) {
      // 未入映射表的原子控件：类名词干 → 库目录动态匹配（引用库组件优先于本地重绘）
      const dyn = dynLibFor(n);
      if (dyn) {
        node = await materializeLib(Object.assign({}, n, { lib: dyn }));
        if (node) { skipChildren = true; libDynHitCount++; }
      }
    }
    if (!node) { node = figma.createFrame(); applyFrameProps(node, n); node.fills = await buildFills(n); }
  }
  if (node.type !== 'INSTANCE') {
    node.name = n.n || (n.t === 't' ? n.text.slice(0, 20) : n.t);
  }
  node.x = n.x; node.y = n.y;
  try { node.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01)); } catch (e) {}
  node.opacity = n.o == null ? 1 : n.o;
  if (n.rot) { try { node.rotation = n.rot; } catch (e) { console.warn('rotation skip', n.n, e); } }
  if (n.rct) RCT_NODES.push({ node, rct: n.rct });
  parent.appendChild(node);
  if (!skipChildren) for (const c of (n.ch || [])) { await materialize(c, node); }
  if (n.al && (node.type === 'FRAME' || node.type === 'COMPONENT')) applyAutoLayout(node, n.al);
  return node;
}

let DEF_COMPS = new Map();
let DEF_FAMILY = new Map(); // def id → 家族名（同家族 ≥2 个 → combineAsVariants 变体集）
let DEF_REUSED = new Set(); // 跨导入复用的 def id（引用既有组件，不重复创建）
let defReuseCount = 0;
let EXISTING_COMPS = new Map(); // norm(名) → [ComponentNode] 本文件既有组件索引（重复块引用源）
let RCT_NODES = []; // 原型连线：带 rct 的 scene 节点 → 已落图 figma 节点（所有屏建完后统一挂 reactions）

// 跨导入复用索引（2026-10-29 用户指令：多页面重复块引用既有组件，不要一直新建）：
// 导入前扫全文件组件按名归一建索引；def 同名且尺寸一致（±3px）即引用既有件，不 createComponent
function indexExistingComponents() {
  EXISTING_COMPS = new Map();
  const pages = (figma.root && figma.root.children) ? figma.root.children : [figma.currentPage];
  let visited = 0;
  pages.forEach(pg => {
    if (!pg || pg.type !== 'PAGE') return;
    (function w(nd) {
      if (visited++ > 200000) return;
      if (nd.type === 'COMPONENT') {
        const k = norm(nd.name);
        if (!EXISTING_COMPS.has(k)) EXISTING_COMPS.set(k, []);
        EXISTING_COMPS.get(k).push(nd);
      }
      (nd.children || []).forEach(w);
    })(pg);
  });
}

// scene.defs（v2 重复块组件）：按依赖序建 figma.createComponent，支持组件内嵌套组件实例
async function buildDefs(scene) {
  if (!scene.defs) return 0;
  const ids = Object.keys(scene.defs);
  const pending = new Set(ids);
  for (let round = 0; round < 10 && pending.size; round++) {
    for (const id of [...pending]) {
      const deps = new Set();
      (function walk(n) { (n.ch || []).forEach(c => { if (c.t === 'inst' && c.d) deps.add(c.d); walk(c); }); })(scene.defs[id].root);
      let ready = true;
      deps.forEach(d => { if (!DEF_COMPS.has(d)) ready = false; });
      if (!ready) continue;
      const d = scene.defs[id];
      // 重复块引用优先：同名（vname）且同尺寸的既有组件直接复用，不重复创建
      const wantName = String(d.vname || d.name || id).replace(/[=,]/g, ' ');
      const hit = (EXISTING_COMPS.get(norm(wantName)) || [])
        .find(c => Math.abs(c.width - d.root.w) <= 3 && Math.abs(c.height - d.root.h) <= 3);
      if (hit) {
        DEF_COMPS.set(id, hit); DEF_FAMILY.set(id, d.name || id); DEF_REUSED.add(id);
        defReuseCount++; pending.delete(id);
        postStatus('复用组件 ' + defReuseCount + '…');
        continue;
      }
      const comp = figma.createComponent();
      // 变体命名：同家族变体 def 用 vname（块内首段文本）做变体名，合成集后家族名归集；
      // '='/',' 是 Figma 变体属性语法保留字，出现即替换为空格防误解析
      comp.name = String(d.vname || d.name || id).replace(/[=,]/g, ' ');
      applyFrameProps(comp, d.root);
      comp.fills = await buildFills(d.root);
      try { comp.resize(Math.max(d.root.w, 0.01), Math.max(d.root.h, 0.01)); } catch (e) {}
      for (const c of (d.root.ch || [])) await materialize(c, comp);
      if (d.root.al) applyAutoLayout(comp, d.root.al);
      DEF_COMPS.set(id, comp);
      DEF_FAMILY.set(id, d.name || id);
      pending.delete(id);
      postStatus('生成组件 ' + DEF_COMPS.size + '/' + ids.length + '…');
    }
  }
  if (pending.size) console.warn('未解析的 def（依赖缺失）:', [...pending]);
  return DEF_COMPS.size;
}

let importing = false;

figma.showUI(__html__, { width: 400, height: 700 });

// assets 状态：把本文件可访问的团队库（getAvailableLibrariesAsync）报给面板**仅作状态展示**；
// 匹配全自动——按 HTML 内容命中的库组件一律按 key 直载，无权限/未订阅自动回退重绘，不做勾选门禁
let lastLibs = []; // [{id,name,enabled}]
function postLibs() {
  if (typeof figma.getAvailableLibrariesAsync !== 'function') {
    lastLibs = [];
    figma.ui.postMessage({ type: 'libs', list: [], unavailable: true,
      error: '本环境不支持库枚举——导入时按组件 key 直接加载，无权限自动回退重绘。' });
    return;
  }
  figma.getAvailableLibrariesAsync().then(list => {
    const libs = (list || []).map(l => ({ id: l.id, name: l.name, enabled: !!l.enabled }));
    lastLibs = libs;
    try { figma.ui.postMessage({ type: 'libs', list: libs, unavailable: !libs.length }); } catch (e) {}
  }).catch(() => {
    lastLibs = [];
    try { figma.ui.postMessage({ type: 'libs', list: [], unavailable: true }); } catch (e) {}
  });
}
postLibs();

figma.ui.onmessage = async msg => {
  if (!msg) return;
  if (msg.type === 'refresh-libs') { postLibs(); return; }
  // 导入历史一键重导（PRO shortcut to re-import）：clientStorage 持久化（插件 iframe 无可靠 localStorage），ui.html 代理读写
  if (msg.type === 'history-get') {
    try {
      const l = await figma.clientStorage.getAsync('h2d-history');
      figma.ui.postMessage({ type: 'history', list: Array.isArray(l) ? l : [] });
    } catch (e) { figma.ui.postMessage({ type: 'history', list: [] }); }
    return;
  }
  if (msg.type === 'history-save') {
    try { await figma.clientStorage.setAsync('h2d-history', Array.isArray(msg.list) ? msg.list.slice(0, 12) : []); } catch (e) {}
    return;
  }
  if (msg.type !== 'scene') return;
  const scene = msg.json;
  if (!scene || !scene.cells || !scene.cells.length) {
    figma.notify('scene.json 无效', { error: true });
    return;
  }
  if (importing) { postStatus('导入进行中，忽略重复触发'); return; }
  // 自动匹配：不设门禁——库组件按 key 直载，失败自动回退重绘；
  // 需求库未在文件启用时仅提示（组件集 importSet 多数会回退，启用可提升实例化成功率）
  if (Array.isArray(scene.libs) && scene.libs.length) {
    const missing = scene.libs.filter(l => !lastLibs.some(a => a.enabled && (
      (l.key && a.id === l.key) ||
      norm(a.name).includes(norm(l.name)) || norm(l.name).includes(norm(a.name)))));
    if (missing.length) {
      figma.notify('按 key 直载：' + missing.map(l => l.name).join('、') +
        ' 未在文件启用——单组件仍可直载，组件集可能回退本地重绘；在资源库面板启用后成功率最高', { timeout: 6000 });
    }
  }
  importing = true;
  // 外部网页模式（serve.py 链接导入 → build-scene --ext）：纯图层转录，不拉库目录/不做库匹配（2026-10-30 用户裁定：复制的网页链接不走本地组件）
  const EXT_SCENE = !!(scene && scene.ext);
  nodeCount = 0; doneCells = 0; totalCells = scene.cells.length;
  iconInstCount = 0; iconFallbackCount = 0;
  libInstCount = 0; libFallbackCount = 0; libPropCount = 0; libImportFailCount = 0; libColorPickCount = 0; libShapePickCount = 0; libSwapCount = 0;
  libDynHitCount = 0; CATALOG_CACHE.clear(); dialogFullPageCount = 0;
  imgFillCount = 0; gradFillCount = 0; alApplyCount = 0;
  rctCount = 0; RCT_NODES = []; cellFrames = [];
  CUR_SCENE = scene; tokBindCount = 0; TOK_BIND_QUEUE.length = 0;
  IMG_CACHE.clear();
  DEF_COMPS = new Map(); DEF_FAMILY = new Map(); DEF_REUSED = new Set(); defReuseCount = 0;
  try {
    postStatus('加载字体…');
    await ensureFonts(scene);
    if (!EXT_SCENE) { postStatus('拉取库目录…'); await buildLibCatalog(); }
    indexExistingComponents();
    await preloadIconComponents(scene);
    const defCount = await buildDefs(scene);
    const page = figma.currentPage;
    const board = figma.createFrame();
    // 命名规范：主画板 = 功能名（demo <title>）+ 时间戳；无 scene.name 回退「HTML 导入」
    board.name = (scene.name || 'HTML 导入') + ' · ' + new Date().toISOString().slice(0, 16).replace('T', ' ');
    board.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
    page.appendChild(board);
    let maxX = 0, maxY = 0;
    for (let i = 0; i < scene.cells.length; i++) {
      const c = scene.cells[i];
      doneCells = i + 1;
      postStatus('导入 ' + doneCells + '/' + totalCells + '：' + (c.label || ''));
      const cellF = figma.createFrame();
      cellF.name = c.label || 'cell';
      cellF.fills = [];
      cellF.x = c.x; cellF.y = c.y;
      cellF.resize(Math.max(c.w, 1), Math.max(c.h + 24, 1));
      board.appendChild(cellF);
      cellFrames.push(cellF);
      const lab = figma.createText();
      lab.fontName = { family: fontFamilyFor(), style: loadedStyles.has('Medium') ? 'Medium' : 'Regular' };
      lab.characters = c.label || '';
      lab.fontSize = 13;
      lab.fills = [solid([0.25, 0.25, 0.27], 1)];
      lab.x = (c.w - lab.width) / 2; lab.y = 0;
      cellF.appendChild(lab);
      await materialize(c.root, cellF);
      cellF.children.slice(1).forEach(ch => { ch.y += 24; });
      maxX = Math.max(maxX, c.x + c.w); maxY = Math.max(maxY, c.y + c.h + 24);
      await yieldUI();
    }
    board.x = 0; board.y = 0;
    board.resize(Math.max(maxX, 100), Math.max(maxY, 100));
    // 原型连线：setup 真实触发事件的节点 → ON_CLICK 导航到目标态画板（可点击原型，交互保真）
    for (const { node, rct } of RCT_NODES) {
      const reactions = [];
      for (const r of (rct || [])) {
        const dest = cellFrames[r.to];
        if (!dest) continue;
        reactions.push({ trigger: { type: r.tg || 'ON_CLICK' }, action: { type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: null, preserveScrollPosition: false } });
      }
      if (reactions.length) { try { node.reactions = reactions; rctCount += reactions.length; } catch (e) { console.warn('reactions skip', node.name, e); } }
    }
    // 组件定义收进一个画板（设计师习惯：组件库画板分节收纳，不散落长龙）：
    // 按家族分节 → 同家族 ≥2 个 combineAsVariants 合成变体组件集 → 节内网格换行
    let variantSetCount = 0;
    if (DEF_COMPS.size - DEF_REUSED.size > 0) {
      const defBoard = figma.createFrame();
      defBoard.name = '组件定义' + (scene.name ? ' · ' + scene.name : '');
      defBoard.fills = [{ type: 'SOLID', color: { r: 0.96, g: 0.96, b: 0.97 } }];
      page.appendChild(defBoard);
      const fams = new Map();
      DEF_COMPS.forEach((comp, id) => {
        if (DEF_REUSED.has(id)) return; // 复用件留在原处（可能在既有变体集/画板内，挪动会拆散）
        const fam = DEF_FAMILY.get(id) || comp.name;
        if (!fams.has(fam)) fams.set(fam, []);
        fams.get(fam).push(comp);
      });
      const BW = 2560, PAD = 80, GX = 96, GY = 96, LAB_H = 36;
      let cy = PAD;
      for (const [fam, comps] of [...fams.entries()].filter(([, c]) => c.length).sort((a, b) => a[0].localeCompare(b[0]))) {
        const lab = figma.createText();
        lab.fontName = { family: fontFamilyFor(), style: loadedStyles.has('Medium') ? 'Medium' : 'Regular' };
        lab.characters = fam + (comps.length > 1 ? ' · 变体集 × ' + comps.length : '');
        lab.fontSize = 14;
        lab.fills = [solid([0.2, 0.2, 0.22], 1)];
        defBoard.appendChild(lab);
        lab.x = PAD; lab.y = cy;
        cy += LAB_H;
        let units = comps;
        if (comps.length > 1) {
          try {
            const set = figma.combineAsVariants(comps, figma.currentPage);
            set.name = fam;
            units = [set];
            variantSetCount++;
          } catch (e) { console.warn('combineAsVariants fail:', fam, e); units = comps; }
        }
        let x = PAD, rowH = 0;
        for (const u of units) {
          if (x + u.width > BW - PAD && x > PAD) { x = PAD; cy += rowH + GY; rowH = 0; }
          defBoard.appendChild(u);
          u.x = x; u.y = cy;
          x += u.width + GX;
          rowH = Math.max(rowH, u.height);
        }
        cy += rowH + GY;
        await yieldUI();
      }
      defBoard.x = 0; defBoard.y = maxY + 200;
      defBoard.resize(BW, Math.max(cy, PAD * 2));
    }
    await flushTokBinds(); // 同步路径落裸色入队的描边绑定（scope 门禁 + 读回校验，失败保持裸色）
    figma.viewport.scrollAndZoomIntoView([board]);
    // 外部网页（scene.ext）不进本地组件体系——库/令牌段整体替换为模式标记，不报「库实例 0 异常」误导
    const libSeg = EXT_SCENE
      ? '｜外部网页 · 纯图层（不走本地组件库）'
      : '｜库组件实例 ' + libInstCount + '（属性设置 ' + libPropCount + ' 项，颜色择变体 ' + libColorPickCount + (libDynHitCount ? '，库目录动态命中 ' + libDynHitCount : '') + (libShapePickCount ? '，形状择变体 ' + libShapePickCount : '') + (dialogFullPageCount ? '，蒙版铺满 ' + dialogFullPageCount : '') + (libSwapCount ? '，嵌套实例 swap ' + libSwapCount : '') + (libFallbackCount ? '，回退 ' + libFallbackCount : '') + (libImportFailCount ? '，库导入失败 ' + libImportFailCount + '（0 实例即异常，查 component-keys.json key / 库订阅 / 库目录动态找回）' : '') + '）｜令牌绑定 ' + tokBindCount + '（库 Color Token 变量，0 且有 tokVars 即异常查 token-vars.json key）';
    figma.notify('导入完成：' + totalCells + ' 屏｜组件 ' + defCount + (defReuseCount ? '（复用既有 ' + defReuseCount + '，重复块不再新建）' : '') + '｜变体集 ' + variantSetCount + '｜图标库实例 ' + iconInstCount + libSeg + '｜自动布局 ' + alApplyCount + '｜图片 ' + imgFillCount + '｜渐变 ' + gradFillCount + '｜矢量回退 ' + iconFallbackCount + (rctCount ? '｜原型连线 ' + rctCount : ''));
    importing = false; // 连续导入（多页面逐个导入）不被「导入进行中」挡住
    figma.closePlugin();
  } catch (e) {
    figma.notify('导入失败：' + (e && e.message || e), { error: true, timeout: 12000 });
    postStatus('导入失败：' + (e && e.message || e) + '——已保留已生成部分，可重试');
    importing = false;
  }
};
