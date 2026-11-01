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
// 构建号护栏（2026-10-31 八轮后）：Figma 插件面板开着时 JS 上下文不随磁盘 code.js 更新重载——
// 面板里跑的可能是旧代码（REQ-018 板 182:63565 实证：input 五处主档默认全泄漏 = 七轮前形态）。
// build-scene 给 scene 写 build 构建号，与插件 PLUGIN_BUILD 不匹配 = 面板代码旧于仓库 → 拒导提示重开面板，
// 不再静默产出旧缺陷板。两侧同步 bump。
const PLUGIN_BUILD = 'r11b';

const FONT_FAMILY = 'PingFang SC';
const STYLE_MAP = {
  300: 'Light', 400: 'Regular', 500: 'Medium', 600: 'Semibold'
};

let loadedStyles = new Set();
// styleFor 在 loadFontAsync 之后跑，做「已加载回退」
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
// 字体映射（free 层 replace missing fonts 对标）：bootstrap 捕获文本首个 font-family（n.ff）→
// 别名表归到本机可用的 Figma 家族；表外站点字体原样尝试加载，整族加载失败回退默认家族
const FONT_ALIASES = {
  '-apple-system': FONT_FAMILY, 'system-ui': FONT_FAMILY, 'blinkmacsystemfont': FONT_FAMILY,
  'pingfang sc': FONT_FAMILY, 'pingfang': FONT_FAMILY, 'hiragino sans gb': FONT_FAMILY,
  'microsoft yahei': FONT_FAMILY, 'heiti sc': FONT_FAMILY, 'sans-serif': FONT_FAMILY,
  'segoe ui': 'Inter', 'sf pro display': 'Inter', 'sf pro text': 'Inter', 'sf pro icons': 'Inter',
  'helvetica': 'Helvetica', 'helvetica neue': 'Helvetica', 'arial': 'Arial',
  'inter': 'Inter', 'roboto': 'Roboto', 'robotoflex': 'Roboto',
  'times new roman': 'Times New Roman', 'times': 'Times New Roman', 'georgia': 'Georgia', 'serif': 'Times New Roman',
  'menlo': 'Menlo', 'courier new': 'Courier New', 'consolas': 'Menlo', 'monospace': 'Menlo',
  'verdana': 'Verdana', 'tahoma': 'Tahoma', 'trebuchet ms': 'Verdana'
};
let famStyles = {}; // family -> Set(已加载 style)；加载不到的家族不进表 → 文本回退默认家族
let famHitCount = 0;
function famOf(ff) {
  const k = String(ff || '').split(',')[0].toLowerCase().replace(/["']/g, '').trim();
  if (!k) return null;
  if (FONT_ALIASES[k]) return FONT_ALIASES[k];
  if (k.length > 40 || /^(ui-|var\(|-)/.test(k)) return null;
  return String(ff).split(',')[0].trim().slice(0, 40);
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
function postStatus(text) {
  try { figma.ui.postMessage({ type: 'status', text }); } catch (e) {}
}

function sceneRoots(scene) {
  const roots = scene.cells.map(c => c.root);
  if (scene.defs) Object.keys(scene.defs).forEach(id => roots.push(scene.defs[id].root));
  return roots;
}

async function ensureFonts(scene) {
  const need = new Map(); // family -> Set(style)：默认家族保底三档 + 全部文本按映射家族收集
  const add = (fam, st) => { if (!need.has(fam)) need.set(fam, new Set()); need.get(fam).add(st); };
  ['Regular', 'Medium', 'Semibold'].forEach(s => add(FONT_FAMILY, s));
  sceneRoots(scene).forEach(r => (function walk(n) {
    if (n.t === 't') {
      const f = famOf(n.ff) || FONT_FAMILY; // 无 ff/映射不出的文本归默认家族
      const s = styleNameFor(n.fw); add(f, s); if (n.it) add(f, s + ' Italic');
    }
    (n.ch || []).forEach(walk);
  })(r));
  loadedStyles = new Set();
  famStyles = {};
  for (const style of (need.get(FONT_FAMILY) || [])) {
    try {
      await figma.loadFontAsync({ family: FONT_FAMILY, style });
      loadedStyles.add(style);
    }
    catch (e) { console.warn('font load fail', style, e); }
  }
  if (loadedStyles.size) famStyles[FONT_FAMILY] = loadedStyles;
  else await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  for (const [fam, sts] of need) {
    if (fam === FONT_FAMILY) continue;
    const ok = new Set();
    for (const st of sts) { try { await figma.loadFontAsync({ family: fam, style: st }); ok.add(st); } catch (e) {} }
    if (ok.size) famStyles[fam] = ok;
  }
}

let ICON_MAP = new Map();
let iconInstCount = 0, iconFallbackCount = 0, iconDynCount = 0;
let libInstCount = 0, libFallbackCount = 0, libPropCount = 0, libImportFailCount = 0, libColorPickCount = 0, libShapePickCount = 0, libSwapCount = 0, libTextDoneCount = 0, libColDoneCount = 0, libUnderflowCount = 0, libIconSwapCount = 0, libVisualRepickCount = 0, libSizePickCount = 0, libFontDoneCount = 0, libFontFailCount = 0, libIconOnlyCount = 0, libIconOnlyHiddenCount = 0, libEmptyInputHiddenCount = 0, libColorRepaintCount = 0, instTextCount = 0, instUnderCount = 0, instanceFitFailCount = 0, libAddonHiddenCount = 0, libSlotHiddenCount = 0, libTextSweepCount = 0, libTailHiddenCount = 0, libTailGrowCount = 0;

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
    if (pairs.length >= 12) return;
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

// 图标按名兜底（icon-keys 未映射）：库目录按名找回图标组件实例化，兜不中记缓存回退 svg——
// 引用优先（用户令：组件库都有 icon 组件，引用就好），不建本地图标组件
async function ensureIconByName(name) {
  const ck = 'icn:' + name;
  let c = ICON_MAP.get(ck);
  if (c) return c;
  const alt = catalogFind(name);
  if (alt) {
    try { c = await figma.importComponentByKeyAsync(alt.key); } catch (e) {}
    if (!c) { try { c = await figma.importComponentSetByKeyAsync(alt.key); } catch (e2) {} }
    if (c && c.type === 'COMPONENT') { ICON_MAP.set(ck, c); iconDynCount++; return c; }
  }
  ICON_MAP.set(ck, null);
  return null;
}

async function materializeIcon(n) {
  const comp = n.k ? (ICON_MAP.get(n.k) || await ensureLibComp(n.k, n.f)) : (n.f ? await ensureIconByName(n.f) : null);
  if (!comp || comp.type !== 'COMPONENT') { iconFallbackCount++; return null; }
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
// 枚举消毒（官方手册 2026-10-31 核对，developers.figma.com）：
// counterAxisAlignItems 只收 MIN|MAX|CENTER|BASELINE——无 STRETCH，赋值必抛；
// CSS align-items:stretch 的 Figma 表达 = 容器 MIN + 子节点 layoutAlign='STRETCH'（该属性枚举含 STRETCH）；
// primaryAxisAlignItems 收 MIN|MAX|CENTER|SPACE_BETWEEN|SPACE_EVENLY|SPACE_AROUND。
// 逐 setter 隔离：任一抛错不再连带跳过 padding/终态 resize（footer 71.48 塌缩根因——STRETCH 抛错曾把
// resize 一起吞掉，AL-hug 冻结在内容高度）。
const AL_PRI = { MIN: 1, MAX: 1, CENTER: 1, SPACE_BETWEEN: 1, SPACE_EVENLY: 1, SPACE_AROUND: 1 };
const AL_CNT = { MIN: 1, MAX: 1, CENTER: 1, BASELINE: 1 };
function applyAutoLayout(node, a, n) {
  try {
    node.layoutMode = a.dir === 'row' ? 'HORIZONTAL' : 'VERTICAL';
    // 开 AL 后真实 API 会把主轴落 hug（REQ-020 实测：蒙版 1440→468、弹窗 foot 372→71）
    // ——sizing 紧跟 layoutMode 先钉死，别让中间 setter 抛错留下 hug 态
    try { node.primaryAxisSizingMode = 'FIXED'; node.counterAxisSizingMode = 'FIXED'; } catch (e0) {}
    try { node.itemSpacing = Math.max(0, a.gap || 0); } catch (e1) {}
    try { node.primaryAxisAlignItems = AL_PRI[a.just] ? a.just : 'MIN'; } catch (e2) {}
    try {
      if (a.align === 'STRETCH') {
        node.counterAxisAlignItems = 'MIN';
        // stretch 语义下沉到子节点（layoutAlign 才有 STRETCH）；子节点已有 HTML 实测尺寸，设了也是保持填充
        (node.children || []).forEach(c => { try { c.layoutAlign = 'STRETCH'; } catch (eS) {} });
      } else node.counterAxisAlignItems = AL_CNT[a.align] ? a.align : 'MIN';
    } catch (e3) {}
    try { node.paddingTop = a.pt || 0; node.paddingRight = a.pr || 0; node.paddingBottom = a.pb || 0; node.paddingLeft = a.pl || 0; } catch (e4) {}
    try { node.primaryAxisSizingMode = 'FIXED'; node.counterAxisSizingMode = 'FIXED'; } catch (e5) {}
    // 终态复位：无论上面哪一步被真 API 拒绝，按 scene 原值 resize 兜底（蒙版全幅/foot 全宽的保证）
    if (n && n.w && n.h) { try { node.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01)); } catch (e6) {} }
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
function pickVariantValue(def, toks, axisName) {
  const opts = def.variantOptions || [];
  const nt = (toks || []).map(norm);
  // 轴显式 token（十一轮 Segmented 启用）：'轴名=值' 先按轴名门禁——布尔值轴家族
  //（Segmented 选中/悬停/禁用 同为 true/false）裸值必串轴：每个未决轴都拿同一份 token
  // 列表询问，'选中=true' 会把悬停/禁用一并判成 true，必须轴名命中才取值
  if (axisName != null) {
    const na = norm(axisName);
    for (const t of nt) {
      const raw = String(t);
      const eq = raw.indexOf('=');
      if (eq <= 0) continue;
      if (norm(raw.slice(0, eq)) !== na) continue;
      const o = opts.find(x => norm(x) === norm(raw.slice(eq + 1)));
      if (o) return o;
    }
  }
  // 裸值 token 不参与纯布尔值轴（true/false 家族）：布尔轴只能被上方轴名门禁寻址，
  // 否则裸 'true' 会把第一个遇到的布尔轴误开（悬停/禁用泄漏）
  const boolOnly = opts.length > 0 && opts.every(o => /^(true|false)$/i.test(String(o).trim()));
  if (!boolOnly) {
    for (const t of nt) {
      const o = opts.find(x => norm(x) === t);
      if (o) return o;
    }
    for (const t of nt) {
      if (t.length < 3) continue;
      const o = opts.find(x => { const no = norm(x); return no.includes(t) || t.includes(no); });
      if (o) return o;
    }
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
// 2026-10-31 三轮：库重发布后内部嵌套实例图层名不再是 "Tabs-Top"（实测无名）——按名查找落空 →
// 整个 swap 静默退出 → Tab 文案全 "Tab"、more 按钮/选中 chevron 泄漏。改为按 mainComponent
// 所属集合的成员关系识别（set 对象身份 + 名字兜底），不依赖图层名。
async function swapNestedTabs(inst, lib) {
  const topSet = (lib.aux && lib.aux.top && (ICON_MAP.get(lib.aux.top.key) || await ensureLibComp(lib.aux.top.key, lib.aux.top.figmaName))) || null;
  const tabSet = lib.aux && lib.aux.tab && (ICON_MAP.get(lib.aux.tab.key) || await ensureLibComp(lib.aux.tab.key, lib.aux.tab.figmaName));
  if (!tabSet) return;
  const ofSet = (nd, set) => {
    if (!nd || nd.type !== 'INSTANCE' || !nd.mainComponent || !nd.mainComponent.parent || !set) return false;
    if (nd.mainComponent.parent === set) return true;
    const a = String(nd.mainComponent.parent.name || '').toLowerCase();
    const b = String(set.name || '').toLowerCase();
    return !!a && !!b && a.split('/').pop() === b.split('/').pop();
  };
  const cnt = lib.tabs.length;
  const OFF = /false|无|off|none|^0$/i;
  // 证据裁决（2026-10-31 缺陷 D）：HTML Tab 契约无图标/无下拉/无 more 按钮（AGENTS.md Tab 契约），
  // 数量轴之外同时约束 icon / showSelect / more 类轴为关态
  let inner = null;
  if (topSet) {
    (function wInner(nd) { if (inner) return; (nd.children || []).forEach(c => { if (!inner && ofSet(c, topSet)) inner = c; else wInner(c); }); })(inst);
  }
  if (inner) {
    const topChild = childByWants(topSet, [[/item|数量/, new RegExp('^' + cnt + '$')], [/icon|图标/, OFF], [/more|menu|更多|菜单/, OFF]])
      || childByWants(topSet, [[/item|数量/, new RegExp('^' + cnt + '$')], [/icon|图标/, OFF]])
      || childByWants(topSet, [[/item|数量/, new RegExp('^' + cnt + '$')]]);
    if (topChild) { try { inner.mainComponent = topChild; libSwapCount++; } catch (e) { console.warn('tabs-top swap fail', e); } }
  }
  // tab 项收集：全树找 Components/Tab 集合成员实例（换完 inner 再收——换 mainComponent 会重建内层），
  // 不再依赖图层名 'tab'（库里叫 'Components/Tab' 或被重命名）；收集完按 x 排序对齐视觉序
  const tabKids = [];
  (function w8(nd) {
    (nd.children || []).forEach(c => { if (ofSet(c, tabSet)) tabKids.push(c); else w8(c); });
  })(inst);
  try { tabKids.sort((a, b) => a.x - b.x); } catch (e) {}
  // more 按钮残影收口：整树隐藏 more/menu 命名装饰层（more 是 wrapper 级节点，不在 inner 内）
  (function hideMore(nd) {
    (nd.children || []).forEach(c => {
      if (/more|menu|更多|菜单|dropdown/i.test(String(c.name || ''))) { try { c.visible = false; } catch (e) {} }
      hideMore(c);
    });
  })(inst);
  const act = /true|选中|on|^1$/i;
  for (let i = 0; i < Math.min(tabKids.length, lib.tabs.length); i++) {
    const it = lib.tabs[i];
    let pick = childByWants(tabSet, [
      [/selecte|选中|选择/, it.active ? act : /false|未选|off|^0$/],
      [/icon|图标/i, OFF],
      [/showselect|show-select|下拉|chevron|箭头/i, OFF]
    ]);
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
    // BOOLEAN 轴关态（ShowSelect/Icon 类——childByWants 只裁 VARIANT 轴，选中 tab 的 chevron 泄漏由此收口）
    try {
      const offProps = {};
      Object.entries(tabKids[i].componentPropertyDefinitions || {}).forEach(([pn, pd]) => {
        if (pd.type === 'BOOLEAN' && /showselect|show-select|下拉|chevron|箭头|icon|图标/i.test(norm(pn)) && pd.defaultValue !== false) offProps[pn] = false;
      });
      if (Object.keys(offProps).length) { await tabKids[i].setProperties(offProps); libPropCount += Object.keys(offProps).length; }
    } catch (e) {}
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

// 实例文案/文字色统一改写（2026-10-31 强化：对位-校验-自愈；此前 TEXT 属性按定义序吃 texts、
// 与视觉阅读序错位时文案互换，setProperties 部分失败无自愈，tcols 只覆盖回填层）：
// ①实例内全部文本层按视觉序 (y,x) 排列 ②TEXT 属性 defaultValue 反查它控制的层
// ③html texts（阅读序）逐段对位：属性层经 setProperties 写、裸层直接 overrideText
// ④写后回读校验：没落上的段降级 overrideText 自愈 ⑤tcols 按段覆盖全部承载层（含属性层）
// 表达力守卫（2026-10-31「缺失很严重」根因）：demo 文案段数远超实例文本层数（如 EG71 侧边栏
// 整块直调）时硬替换会丢内容 → 返回 false，materializeLib 回退整块本地重绘（保内容一致优先）
async function rewriteInstanceText(inst, target, lib) {
  const libTexts = lib.texts && lib.texts.length ? lib.texts : (lib.text ? [lib.text] : []);
  if (!libTexts.length) return true;
  const layers = [];
  const origLen = new Map(); // 改写前每层字符数（超长省略号判定基准）
  const origW = new Map();   // 改写前每层宽（截断定回原宽，防 hug 层已被长文案撑开）
  // 十轮：df 剪枝不可见子树——Figma 里父层 visible=false 不改子层自身 visible，只查文本层会漏；
  // addon 隐藏（hideInputAddons）后其内层 http:// 文本必须退出对位序列，demo 值才能落到值层
  (function df(nd) { (nd.children || []).forEach(c => { if (c.visible === false) return; if (c.type === 'TEXT') layers.push(c); df(c); }); })(inst);
  if (!layers.length) return libTexts.length <= 1;
  if (libTexts.length > layers.length + 4) return false;
  // 视觉阅读序：y 主序（2px 容差）、x 次序；无几何信息的层保持 DOM 序
  if (layers.every(l => typeof l.x === 'number' && typeof l.y === 'number')) {
    layers.sort((a, b) => (Math.abs(a.y - b.y) > 2 ? a.y - b.y : a.x - b.x));
  }
  layers.forEach(l => { origLen.set(l, l.characters.length); origW.set(l, l.width); });
  // 层 → TEXT 属性名：优先按 componentPropertyReferences.characters 绑定（真 API 解析路径），
  // 未绑定的按 defaultValue 反查（手搭 mock 组件 / 库重发布漂移场景），同默认文案多属性按层序一对一领取
  const propOf = new Map();
  try {
    const defs = target.componentPropertyDefinitions || {};
    layers.forEach(l => {
      const r = l.componentPropertyReferences;
      if (r && r.characters && defs[r.characters] && defs[r.characters].type === 'TEXT') propOf.set(l, r.characters);
    });
    if (propOf.size < layers.length) {
      const dvMap = [];
      Object.entries(defs).forEach(([name, d]) => {
        if (d.type === 'TEXT' && d.defaultValue != null && String(d.defaultValue) !== '') dvMap.push([name, String(d.defaultValue)]);
      });
      const taken = new Set([...propOf.values()]);
      layers.forEach(l => {
        if (propOf.has(l)) return;
        const hit = dvMap.find(([nm, dv]) => !taken.has(nm) && dv === l.characters);
        if (hit) { taken.add(hit[0]); propOf.set(l, hit[0]); }
      });
    }
  } catch (e) {}
  const tcols = lib.tcols || [], ttoks = lib.ttoks || [];
  const n2 = Math.min(layers.length, libTexts.length);
  const pendingProps = {};
  for (let i = 0; i < n2; i++) {
    const want = libTexts[i], layer = layers[i], pname = propOf.get(layer);
    if (pname) { if (want !== layer.characters) pendingProps[pname] = want; }
    else { try { if (layer.characters !== want) await overrideText(layer, want); } catch (e) {} }
  }
  const propKeys = Object.keys(pendingProps);
  if (propKeys.length) {
    try { await inst.setProperties(pendingProps); libPropCount += propKeys.length; }
    catch (e) { console.warn('setProperties(text) skip', lib.cls, e); }
    for (let i = 0; i < n2; i++) { // 写后回读自愈：真库上属性没生效的段直接改层
      const layer = layers[i], pname = propOf.get(layer);
      if (pname && pendingProps[pname] != null && layer.characters !== pendingProps[pname]) {
        try { await overrideText(layer, pendingProps[pname]); } catch (e) {}
      }
    }
  }
  for (let i = 0; i < n2; i++) { // 文字色全覆盖（属性层此前残留库默认灰/白）
    const col = tcols[i];
    if (!col) continue;
    try { layers[i].fills = [await tokPaint(solid(col, 1), ttoks[i], 'TEXT_FILL')]; libColDoneCount++; } catch (e) {}
  }
  // 字样覆写（2026-10-31 五轮）：实例主档默认文字样式（12/Regular）不随 demo——字号/字重按 HTML 逐段覆写
  //（REQ-020 实测 Cancel 14/500 落成 12/400）；fontSize/fontName 是实例内层合法 override，失败仅计数
  const tfsA = lib.tfs || [], tfwA = lib.tfw || [];
  for (let i = 0; i < n2; i++) {
    const l = layers[i], fs = tfsA[i], fw = tfwA[i];
    if (!l || (!fs && !fw)) continue;
    try { if (fs && Math.abs((l.fontSize || 0) - fs) > 0.5) { l.fontSize = fs; libFontDoneCount++; } } catch (e) { libFontFailCount++; }
    if (fw) {
      try {
        const want = styleFor(fw);
        const cur = l.fontName && l.fontName !== figma.mixed ? l.fontName : null;
        const fam = cur ? cur.family : fontFamilyFor();
        if (!cur || cur.style !== want) {
          await figma.loadFontAsync({ family: fam, style: want });
          l.fontName = { family: fam, style: want }; libFontDoneCount++;
        }
      } catch (e) { libFontFailCount++; }
    }
  }
  for (let i = 0; i < n2; i++) if (layers[i].characters === libTexts[i]) libTextDoneCount++;
  // 文本宽度适配（2026-10-31 三轮用户令，反转省略号默认）：超长文本**默认完整展示**——超出原容量
  // 的层改 hug 自动扩宽（WIDTH_AND_HEIGHT + 按层中心回移）；只有「特别长」（>24 字符）才定宽回填 +
  // ENDING 省略号。注意：实例内层 resize 被 Figma 实例模型拒绝（真 API 抛错，mock 允许——勿以 mock
  // 绿灯为准），textAutoResize 是唯一可能的就地扩宽通道，写后读回验证，失败计数在完成通知里暴露
  for (let i = 0; i < n2; i++) {
    const l = layers[i];
    if (!l) continue;
    const s = String(libTexts[i] || '');
    const ol = origLen.get(l) || 0;
    if (s.length <= ol) continue; // 容量内：hug 层随 characters 自动加宽，定宽层也够放，不动
    if (s.length > 24) {
      // 特别长：定宽回填 + 省略号（与 demo CSS text-overflow 行为一致）
      try { l.textAutoResize = 'NONE'; } catch (e) {}
      const pw = l.parent ? l.parent.width : 0;
      const w = pw ? Math.max(8, pw - l.x * 2) : (origW.get(l) || l.width);
      if (Math.abs(w - l.width) > 0.5) { try { l.resize(w, l.height); } catch (e) {} }
      try { l.textTruncation = 'ENDING'; } catch (e) {}
    } else {
      // 完整展示：改 hug 扩宽，按层中心回移防错位；扩宽失败（实例内层拒绝）计入 fitFail
      const cx = l.x + l.width / 2, cy = l.y + l.height / 2;
      let ok = false;
      try { l.textAutoResize = 'WIDTH_AND_HEIGHT'; ok = l.textAutoResize === 'WIDTH_AND_HEIGHT'; } catch (e) {}
      if (ok) { try { l.x = Math.round(cx - l.width / 2); l.y = Math.round(cy - l.height / 2); } catch (e) {} }
      else instanceFitFailCount++;
    }
  }
  return true;
}

// 图标槽换装（2026-10-31 按钮输入框转化修复）：walkLib 新采 lib.icnk（块内真实图标的库 key），
// 实例内层图标槽 mainComponent 换成 demo 图标——此前图标名/key 在序列化侧丢失，Delete 永远挂库默认 Add。
// 守卫：btn/input/select/stat 类控件；只换首个 ≤24px 小实例槽；checkbox/radio/switch 载体豁免（形态即语义）
// 十轮：①walk 剪枝不可见子树（addon 藏掉的容器里不再选槽）②候选按位置裁决——icL 取最左、
// icR 取最右（首个命中顺序是主档图层序不保证视觉序，右置 suffix 排前会抢走换装）③返回槽节点
// （供 hideExtraIconSlots 区分已换装槽），调用方 truthiness 兼容旧布尔用法
async function swapIconSlot(inst, lib) {
  if (!lib.icnk && !lib.icnf) return null;
  if (!/ms-(btn|input|select|stat)/.test(String(lib.cls || ''))) return null;
  let comp = lib.icnk ? (ICON_MAP.get(lib.icnk) || await ensureLibComp(lib.icnk)) : await ensureIconByName(lib.icnf);
  if (!comp || comp.type !== 'COMPONENT') return null;
  const cands = [];
  (function walk(x) {
    for (const c of x.children || []) {
      if (c.visible === false) continue;
      if (c.type === 'INSTANCE' && c.mainComponent && c.width <= 24 && c.height <= 24
        && !/check|radio|switch|滑|勾选|开关/i.test(String(c.mainComponent.name || ''))) cands.push(c);
      walk(c);
    }
  })(inst);
  if (!cands.length) return null;
  cands.sort((a, b) => (a.x || 0) - (b.x || 0));
  const slot = lib.icR ? cands[cands.length - 1] : cands[0];
  try { slot.mainComponent = comp; } catch (e) { return null; }
  // 换装后按 HTML 涂色（含 token 绑定）——库变体自带的图标色不随 HTML，颜色对应关系以 demo 为准
  if (lib.icnc) { try { await paintIconStrokes(slot, lib.icnc, lib.ictk); } catch (e) {} }
  return slot;
}
// 十轮：库 Input 集没有任何 addon/preIcon BOOLEAN 轴（实测只有 Size/State/Filled 三 VARIANT 轴）——
// http:// 前缀块、44px 设置图标附加块、person 前图标、input-suffix 都是烤进变体的嵌套子实例，
// 七轮的布尔轴关态路径对这套库形同虚设。按 HTML 证据隐藏：demo 输入框没有 addon 容器结构 →
// ms-input 直发子 INSTANCE 里**非图标槽尺寸**（>24px）的结构块全 hidden（InputAddon http:// 前缀块、
// 28~44px 设置图标附加块都在这层；≤24px 槽留给换装）；ms-select 只藏名字命中 addon/affix 的
// 直发子实例（自带下拉 chevron 是语义结构，保留）。
function hideInputAddons(inst, lib) {
  const cls = String(lib.cls || '');
  const isInput = /(^|\s)ms-input(\s|$)/.test(cls);
  const isSelect = /(^|\s)ms-select(\s|$)/.test(cls);
  if (!isInput && !isSelect) return;
  let n = 0;
  for (const c of inst.children || []) {
    if (c.type !== 'INSTANCE' || c.visible === false) continue;
    if (isInput && c.width <= 24 && c.height <= 24) continue;
    if (isSelect && !/addon|affix|附加|前缀|后缀/i.test(String(c.name || ''))) continue;
    try { c.visible = false; n++; } catch (e) {}
  }
  libAddonHiddenCount += n;
}
// 十轮：图标槽收口——demo 只有一个图标（或没有图标）时，换装槽之外残余的 ≤24px 图标槽实例
//（input-suffix、未被换装的 person 前图标）一律 hidden。仅 ms-input（泄漏重灾区；select 自带
// chevron、btn 图标变体是语义结构，不藏）。
function hideExtraIconSlots(inst, lib, swapped) {
  if (!/(^|\s)ms-input(\s|$)/.test(String(lib.cls || ''))) return;
  let n = 0;
  (function w(x) {
    for (const c of x.children || []) {
      if (c.visible === false) continue;
      if (c !== swapped && c.type === 'INSTANCE' && c.mainComponent && c.width <= 24 && c.height <= 24
        && !/check|radio|switch|滑|勾选|开关/i.test(String(c.mainComponent.name || ''))) {
        try { c.visible = false; n++; continue; } catch (e) {}
      }
      w(c);
    }
  })(inst);
  libSlotHiddenCount += n;
}
// 十轮：残余文本收口——实例内可见 TEXT 层多于 demo 文本段数时，超出段藏掉（主档默认文案不随
// demo 泄漏）。排序与 rewriteInstanceText 同款（y 主序 2px 容差、x 次序），保证藏的是同批「尾部」。
// 仅 input/select/checkbox/radio 四类控件载体；空证据（0 段）走 materializeLib 空输入分支全藏。
function hideLeftoverTexts(inst, lib) {
  const cls = String(lib.cls || '');
  if (!/(^|\s)ms-(input|select|checkbox|radio)(\s|$)/.test(cls)) return;
  const want = (lib.texts && lib.texts.length ? lib.texts : (lib.text ? [lib.text] : [])).length;
  if (!want) return;
  const vis = [];
  (function w(x) { for (const c of x.children || []) { if (c.visible === false) continue; if (c.type === 'TEXT') vis.push(c); w(c); } })(inst);
  if (!vis.length) return;
  if (vis.every(l => typeof l.x === 'number' && typeof l.y === 'number')) {
    vis.sort((a, b) => (Math.abs(a.y - b.y) > 2 ? a.y - b.y : a.x - b.x));
  }
  let n = 0;
  for (let i = want; i < vis.length; i++) { try { vis[i].visible = false; n++; } catch (e) {} }
  libTextSweepCount += n;
}
// 十一轮：库 steps-item 把 tail 连接线烤在 item 内（header.tail 内 line 矢量、主档 88px 定宽）。
// demo 的连线是 .ms-step-line（flex:1 填满块余宽）且末步无——按 build-scene 采的 lib.tail 证据：
// 0（末步）→ 藏 tail 帧；1 → 把 tail 与内层 line 拉宽到实例余宽（实例 resize 不重排内部，
// 88px 原宽会在右端留空档，连线到不了下一步图标）。resize 0 高会抛 → 高度下限 0.01
function fixStepsTail(inst, lib) {
  if (!/(^|\s)ms-step(\s|$)/.test(String(lib.cls || ''))) return;
  let tail = null;
  (function w8(x) {
    for (const c of x.children || []) {
      if (/^tail$/i.test(String(c.name || ''))) { tail = c; return; }
      w8(c);
    }
  })(inst);
  if (!tail) return;
  if (!lib.tail) { try { tail.visible = false; libTailHiddenCount++; } catch (e) {} return; }
  try {
    const nw = Math.max(0, (inst.width || 0) - (tail.x || 0));
    if (nw > (tail.width || 0)) {
      const line = (tail.children || [])[0];
      const nh = Math.max(tail.height || 0, 0.01);
      if (line && line.resize) { try { line.resize(nw, Math.max(line.height || 0, 0.01)); } catch (e1) {} }
      tail.resize(nw, nh);
      libTailGrowCount++;
    }
  } catch (e) {}
}
// 落图后视觉复核（自愈，2026-10-31 按钮输入框转化修复）：payload 轴名失配 / setProperties 静默失败
// 时实例根呈现背离 demo 证据（lib.col 底色）——直接比色在兄弟变体里找明显更贴的一个。保守门限：
// 当前背离 >0.2、候选 <0.08 且领先 >0.2 才动；轴名无关，不依赖裁决逻辑自身正确
function pickVariantByVisual(set, curTarget, curInst, lib) {
  try {
    if (!lib.col || lib.col[3] === 0 || !set || set.type !== 'COMPONENT_SET') return null;
    const kids = set.children || [];
    if (!kids.length || kids.length > 80) return null;
    const dist = (ev, c) => (ev && c) ? Math.max(Math.abs(ev[0] - c.r), Math.abs(ev[1] - c.g), Math.abs(ev[2] - c.b)) : Infinity;
    const solid = ps => { if (!ps || ps === 'MIXED') return null; for (const p of ps) if (p && p.type === 'SOLID' && p.visible !== false) return p.color; return null; };
    const curD = dist(lib.col, solid(curInst.fills) || solid(curInst.strokes));
    if (curD <= 0.2) return null;
    let best = null, bestD = Infinity;
    for (const k of kids) {
      if (k === curTarget) continue;
      const kd = dist(lib.col, solid(k.fills) || solid(k.strokes));
      if (kd < bestD) { bestD = kd; best = k; }
    }
    return (best && bestD < 0.08 && curD - bestD > 0.2) ? best : null;
  } catch (e) { return null; }
}
// 实例颜色无条件覆写（九轮，用户硬性要求「html 的颜色怎样，即便调取的组件颜色不一样，
// 都要按 html 的颜色去改」）：库变体默认色与 demo 不一致时（bare/sm 按钮库默认蓝描边 vs
// demo 灰边根因），实例根按 HTML 证据重涂——fills 用 lib.col（块背景实色）+ n.ftk 令牌绑定
// 优先、strokes 用 lib.stk（实线边框证据，九轮起从 border-* 色条反推）。令牌绑定读回漂移
// 自动回退裸色（tokPaint 内建）；ms-mask 弹窗跳过（蒙版全页形态由 forceDialogFullPage 管辖）。
async function repaintLibInstance(inst, n) {
  const lib = n.lib || {};
  if (/ms-mask/.test(String(lib.cls || ''))) return;
  let did = 0;
  if (lib.col) {
    try { inst.fills = [await tokPaint(solid(lib.col, 1), n.ftk, 'FRAME_FILL')]; did++; }
    catch (e) { console.warn('repaint fills skip', lib.cls, e); }
  }
  if (lib.stk && lib.stk.c) {
    try {
      inst.strokes = [await tokPaint(solid(lib.stk.c, 1), lib.stk.tk, 'STROKE')];
      inst.strokeWeight = Math.max(1, Math.round(lib.stk.w || 1));
      inst.strokeAlign = 'INSIDE';
      did++;
    } catch (e) { console.warn('repaint strokes skip', lib.cls, e); }
  }
  if (did) libColorRepaintCount++;
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
        const v = pickVariantValue(d, n.lib.tok, name);
        if (v != null) want[name] = v;
      });
      // 证据裁决（2026-10-31 像素审计缺陷 D/E/F）：块内无图标/矢量子节点（lib.ic=false）时，
      // icon/箭头/chevron/更多 类 VARIANT 轴强制关态——库默认装饰（Button 的 Add 图标 / Tag 下拉箭头 /
      // Tabs 的 chevron 与 more 按钮）不随默认变体泄漏
      if (!n.lib.ic) {
        Object.entries(setDefs).forEach(([name, d]) => {
          if (d.type !== 'VARIANT' || want[name] != null) return;
          if (!/icon|图标|arrow|箭头|chevron|下拉|more|菜单|menu/.test(norm(name))) return;
          const off = (d.variantOptions || []).find(o => /^(false|无|off|none|no|0)$/i.test(String(o).trim()));
          if (off != null) want[name] = off;
        });
      }
      if (n.lib.col) pickVariantByColor(comp, setDefs, want, n.lib.col);
      // 尺寸轴按高度裁决（2026-10-31 四轮「高度间距不一致」根因）：高度是 px 真值却从未参与
      // 裁决，Size 轴全靠默认序落 L/M 混档。取各选项变体子组件高度与块高最近者；最近距 ≤3px
      // 且领先次近 ≥2px 才判（平局不判——颜色轴平局纪律同源）
      if (n.h) {
        Object.entries(setDefs).forEach(([name, d]) => {
          if (d.type !== 'VARIANT' || want[name] != null) return;
          if (!/size|尺寸|small|小型/.test(norm(name))) return;
          const kids0 = (comp.children || []).filter(c => c.type === 'COMPONENT');
          const dists = [];
          (d.variantOptions || []).forEach(o => {
            let best = null;
            kids0.forEach(k => {
              let vp = {}; try { vp = k.variantProperties || {}; } catch (e) {}
              if (vp[name] !== o) return;
              const dh = Math.abs((k.height || 0) - n.h);
              if (best == null || dh < best) best = dh;
            });
            if (best != null) dists.push({ o, d: best });
          });
          if (dists.length < 2) return;
          dists.sort((a, b) => a.d - b.d);
          if (dists[0].d <= 3 && dists[1].d - dists[0].d >= 2) { want[name] = dists[0].o; libSizePickCount++; }
        });
      }
      // shape 收口（2026-10-31「Delete 文字 12px」根因）：texts=[] 在 JS 恒为真值导致每个普通
      // 控件都跑形状打分、误裁 Size 轴——形状证据只对复合块（多段文本/开关/页签）有意义
      if ((n.lib.texts && n.lib.texts.length > 1) || n.lib.sw != null || n.lib.tabs) shapeMergeVariant(comp, want, n.lib, n);
      target = pickVariantChild(comp, want);
      if (!target) throw new Error('set 无变体: ' + n.lib.f);
      setWant = want; // payload 继承 set 级裁决（含颜色择变体），右侧面板所见即所判
    }
    // 纯图标按钮（demo 有图标无文字，REQ-020 操作列实测）：label-only 变体会泄漏主档默认 "Label"
    // 文案且图标没槽可换——严格按已裁决轴选「带图标槽」的变体；本主题无图标槽变体 → 整块回退
    // 本地重绘（边框/热区本地 + 图标仍走库实例，能引用则引用、不能表达不硬凑）
    const iconOnly = !!n.lib.ic && !(n.lib.texts && n.lib.texts.length) && !n.lib.text;
    if (iconOnly && /(^|\s)ms-btn(\s|$)/.test(String(n.lib.cls || ''))) {
      const hasSlot = k => { let hit = null; (function w3(x) { (x.children || []).forEach(ch => { if (ch.type === 'INSTANCE' && ch.width <= 24 && ch.height <= 24) hit = ch; w3(ch); }); })(k); return !!hit; };
      const kidsAll = (comp.children || []).filter(c => c.type === 'COMPONENT');
      const scored = kidsAll.filter(k => { try { const vp = k.variantProperties || {}; return Object.entries(setWant || {}).every(([p, v]) => vp[p] === v); } catch (e) { return false; } });
      const withIcon = scored.find(hasSlot);
      if (withIcon) { target = withIcon; libIconOnlyCount++; }
      else { libFallbackCount++; return null; }
    }
    if (target.type !== 'COMPONENT') throw new Error('非组件: ' + n.lib.f);
    // setProperties payload：VARIANT/BOOLEAN 按属性定义逐个映射；TEXT 统一走 rewriteInstanceText
    // （按视觉序对位 + 写后自愈，不在此按定义序消费 texts）
    const payload = {};
    const SEM_AXES = { info: 1, error: 1, waiting: 1, warn: 1, success: 1 }; // 业务库「弹窗」语义布尔轴
    try {
      const tDefs = target.componentPropertyDefinitions || {};
      const toks = (n.lib.tok || []).map(t => t.toLowerCase());
      Object.entries(tDefs).forEach(([name, d]) => {
        if (d.type === 'VARIANT') {
          const v = setWant && setWant[name] != null ? setWant[name] : pickVariantValue(d, n.lib.tok, name);
          if (v != null && v !== d.defaultValue) payload[name] = v;
        } else if (d.type === 'BOOLEAN') {
          const nn = norm(name);
          let val = null;
          if (/addon|prefix|suffix|前缀|后缀|附加/.test(nn)) {
            // 结构型附加轴（库 Input 的 addonBefore/addonAfter 等）：HTML 块没有前置/后置
            // 附加结构（demo 输入框无 addon 容器）——一律关态。库默认 true 会泄漏 http://
            // 前缀文本与 44px 设置图标附加块（REQ-018 input 审计根因之一）
            val = false;
          } else if (/icon|arrow|箭头|chevron|下拉/.test(nn)) {
            // 图标类轴按位置裁决（REQ-018 根因之二）：库 Input 的 preIcon/afterIcon 是独立
            // BOOLEAN，旧逻辑布尔 ic 让左置 search 图标把 afterIcon 也误开（右侧 44px 设置图标
            // 泄漏）。scene 侧 icL/icR 给首个图标的左右位置；after/suffix 类轴吃 icR，其余吃 icL
            const isAfter = /after|suffix|后|尾|trailing/.test(nn);
            val = isAfter ? !!n.lib.icR : !!n.lib.icL;
          } else if (/^tag$|^label$|文本|文字/.test(nn)) {
            // 十轮：库 Checkbox 的 tag BOOLEAN（默认 true）控制标签 <p>{text}</p>——轴名此前
            // 无规则管辖恒落默认 true，裸表格勾选框（16×16 无文本证据）泄漏主档 "Checkbox" 文案。
            // 用户裁定：标题/表单场景（块内有文本证据）才带文本；表格列只有勾选框、没有文本。
            val = !!((n.lib.texts && n.lib.texts.length) || n.lib.text);
          }
          else if (/disable/.test(nn)) val = toks.includes('disabled');
          else if (SEM_AXES[nn]) val = toks.includes(nn) || (nn === 'warn' && toks.includes('warning'));
          if (val != null && val !== d.defaultValue) payload[name] = val;
        }
      });
    } catch (e) { console.warn('defs read fail:', n.lib.f, e); }
    // 实例化收口为 buildInstance：视觉复核重选要换兄弟变体重建，同一管线跑两遍
    const buildInstance = async (tgt) => {
      const inst = tgt.createInstance();
      try { inst.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01)); }
      catch (e) {
        // 非弹窗：等比缩放兜底；弹窗走 forceDialogFullPage 统一收口
        if (!/ms-mask/.test(String(n.lib.cls || ''))) { try { inst.rescale(Math.max(n.w, 0.01) / (tgt.width || n.w)); } catch (e2) {} }
      }
      if (/ms-mask/.test(String(n.lib.cls || ''))) forceDialogFullPage(inst, n);
      if (Object.keys(payload).length) {
        try { inst.setProperties(payload); libPropCount += Object.keys(payload).length; }
        catch (e) { console.warn('setProperties skip', n.lib.cls, JSON.stringify(payload), e); }
      }
      // 十轮：addon 隐藏先于文案改写——烤进变体的 http:// 前缀块/设置图标附加块退出结构后，
      // 其内层文本也随之退出 rewriteInstanceText 的对位序列（df 剪枝不可见子树），
      // demo 值才能落到值层而非 addon 文本层（REQ-019 objname 输入框 Example 未改写根因）
      hideInputAddons(inst, n.lib);
      // 实例文案 + 文字色按 HTML 统一改写（对位-校验-自愈；tabs 走 swapNestedTabs 自带文案覆写）；
      // 表达力守卫不过（demo 段数 > 实例层数+4）→ 回退整块本地重绘，不硬替换丢内容
      if ((n.lib.texts && n.lib.texts.length || n.lib.text) && !n.lib.tabs) {
        const ok = await rewriteInstanceText(inst, tgt, n.lib);
        if (!ok) { try { inst.remove(); } catch (e0) {} return { inst: null, underflow: true }; }
        hideLeftoverTexts(inst, n.lib);
      }
      // 十一轮：steps-item 的 tail 连接线按 lib.tail 证据隐藏/拉宽（末步无连线、有线的填满余宽）
      fixStepsTail(inst, n.lib);
      if (n.lib.tabs && n.lib.tabs.length) await swapNestedTabs(inst, n.lib);
      const slot = await swapIconSlot(inst, n.lib);
      if (slot) libIconSwapCount++;
      hideExtraIconSlots(inst, n.lib, slot);
      return { inst, underflow: false };
    };
    let built = await buildInstance(target);
    if (built.underflow) { libUnderflowCount++; return null; }
    if (iconOnly) {
      // 纯图标钮：比色重选会按底色丢掉图标槽变体，跳过；残留的主档 Label 文本层藏掉
      //（实例内层 visible 是合法 override；REQ-020 操作列实测变体自带 "Label" 泄漏）
      (function dfx(nd) { (nd.children || []).forEach(c => { if (c.type === 'TEXT') { try { c.visible = false; libIconOnlyHiddenCount++; } catch (e0) {} } dfx(c); }); })(built.inst);
    } else if (/(^|\s)ms-(input|select|checkbox|radio)(\s|$)/.test(String(n.lib.cls || '')) && !(n.lib.texts && n.lib.texts.length) && !n.lib.text) {
      // 空输入兜底（REQ-018 根因之三）：demo 输入框无 value/placeholder 时 rewriteInstanceText
      // 整段跳过，库主档默认 value="Example" 泄漏——空输入本就不该有可见文案，实例内层 TEXT 层
      // 全部 visible=false（带 placeholder/value 的输入走改写路径，不进此分支）。
      // 十轮：扩到 checkbox/radio——裸勾选框无文本证据时主档 "Checkbox" 文案同样不该可见
      //（tag 轴关态是第一道闸，这里是结构兜底，双保险不算双计）
      (function htx(nd) { (nd.children || []).forEach(c => { if (c.type === 'TEXT') { try { c.visible = false; libEmptyInputHiddenCount++; } catch (e0) {} } htx(c); }); })(built.inst);
    } else {
      const alt = pickVariantByVisual(comp, target, built.inst, n.lib);
      if (alt) {
        const again = await buildInstance(alt);
        if (again.inst) { try { built.inst.remove(); } catch (e0) {} built = again; libVisualRepickCount++; }
      }
    }
    // 九轮：变体裁决/视觉复核重选定型后，实例根颜色按 HTML 证据无条件覆写（用户硬性要求）
    await repaintLibInstance(built.inst, n);
    built.inst.name = n.lib.cls || n.lib.f;
    libInstCount++;
    return built.inst;
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
    const fam = famOf(n.ff);
    const fs = (fam && famStyles[fam]) || loadedStyles;
    node.fontName = {
      family: (fam && famStyles[fam]) ? fam : fontFamilyFor(),
      style: (n.it && fs.has(stIt)) ? stIt : (fs.has(st) ? st : (fs.has('Regular') ? 'Regular' : st))
    };
    if (fam && famStyles[fam] && fam !== FONT_FAMILY) famHitCount++;
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
    // 同组件多实例按本块文案逐段改写（2026-10-31 用户指令：可复用块只建一个组件，实例改文字）——
    // inst.texts 是本块深层文本清单（build-scene 采集），复用 rewriteInstanceText 的对位-校验-自愈管线；
    // 复用的既有组件结构漂移装不下本块文案 → 本地重绘 def 子树后再改写，不丢内容
    if (n.texts && n.texts.length) {
      const ok = await rewriteInstanceText(node, node, { texts: n.texts, tcols: n.tcols, tfs: n.tfs, tfw: n.tfw });
      if (!ok) {
        instUnderCount++;
        try { node.remove(); } catch (e) {}
        node = figma.createFrame();
        const dr = DEF_ROOTS.get(n.d);
        if (dr) { applyFrameProps(node, dr); node.fills = await buildFills(dr); }
        for (const c of ((dr && dr.ch) || [])) await materialize(c, node);
        const lay = [];
        (function df2(nd) { (nd.children || []).forEach(c => { if (c.type === 'TEXT') lay.push(c); df2(c); }); })(node);
        const nn = Math.min(lay.length, n.texts.length);
        for (let i = 0; i < nn; i++) { try { await overrideText(lay[i], n.texts[i]); } catch (e) {} }
        for (let i = 0; i < nn; i++) { const col = (n.tcols || [])[i]; if (col) { try { lay[i].fills = [solid(col, 1)]; } catch (e) {} } }
      } else instTextCount++;
    }
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
    node.name = n.t === 't' ? n.text.slice(0, 20) : (n.n || n.t);
  }
  node.x = n.x; node.y = n.y;
  try { node.resize(Math.max(n.w, 0.01), Math.max(n.h, 0.01)); } catch (e) {}
  // 单行文本防换行（九轮，用户令「大文字不要换行」）：浏览器量盒可能窄于 Figma 字形排宽
  //（同字号不同 hinting），NONE+定宽遇宽字形即折行——单行文本（无省略号、无换行、高≈单行）
  // 改 hug（WIDTH_AND_HEIGHT）自适应展开，x 按对齐锚定（left 不动 / center 保中心 / right 保右缘）；
  // CSS 省略号（n.tr）与多行文本不进此分支（保持 NONE + 定宽盒）
  if (n.t === 't' && !n.tr && !String(n.text).includes('\n') && node.type === 'TEXT'
    && n.h <= Math.max(n.lh || 0, n.fs || 0) * 1.6 + 0.5) {
    try {
      node.textAutoResize = 'WIDTH_AND_HEIGHT';
      const nw = node.width;
      if (Math.abs(nw - n.w) > 0.5) {
        const al = n.al || 'left';
        if (al === 'center') node.x = n.x + (n.w - nw) / 2;
        else if (al === 'right') node.x = n.x + (n.w - nw);
      }
    } catch (e) { /* hug 写入被拒（实例内层等）：保持定宽盒，回退原行为 */ }
  }
  node.opacity = n.o == null ? 1 : n.o;
  if (n.rot) { try { node.rotation = n.rot; } catch (e) { console.warn('rotation skip', n.n, e); } }
  if (n.rct) RCT_NODES.push({ node, rct: n.rct });
  if (n.lk) LK_NODES.push({ node, lk: n.lk });
  if (n.fix) FIX_NODES.push(node);
  parent.appendChild(node);
  if (!skipChildren) for (const c of (n.ch || [])) { await materialize(c, node); }
  if (n.al && (node.type === 'FRAME' || node.type === 'COMPONENT')) applyAutoLayout(node, n.al, n);
  return node;
}

let DEF_COMPS = new Map();
let DEF_FAMILY = new Map(); // def id → 家族名（同家族 ≥2 个 → combineAsVariants 变体集）
let DEF_REUSED = new Set(); // 跨导入复用的 def id（引用既有组件，不重复创建）
let defReuseCount = 0;
let EXISTING_COMPS = new Map(); // norm(名) → [ComponentNode] 本文件既有组件索引（重复块引用源）
let EXISTING_BY_SIG = new Map(); // h2d 结构哈希 → [ComponentNode]（组件 description 'h2d-sig:' 指纹，跨导入先判断再建）
let DEF_ROOTS = new Map(); // def id → scene root（复用的既有组件结构漂移时，本地重绘子树的源）
let RCT_NODES = []; // 原型连线：带 rct 的 scene 节点 → 已落图 figma 节点（所有屏建完后统一挂 reactions）
let LK_NODES = []; // 外部网页原型连线（free 层 automatic linking 对标）：带 lk（同源链接目标）的节点 → reactions 跳对应页帧
let FIX_NODES = []; // position:fixed/sticky 节点（吸顶）→ 提升为 cell 帧直接子节点（不被 overflow 滚走）
let lkCount = 0, scrollCount = 0, extStyleCount = 0, fixLiftCount = 0;

// 跨导入复用索引（2026-10-29 用户指令：多页面重复块引用既有组件，不要一直新建）：
// 导入前扫全文件组件按名归一建索引；2026-10-31 强化——同时索引组件 description 里的 'h2d-sig:'
// 结构哈希指纹（build-scene 按「去文案结构签名」产出），匹配顺序：结构哈希+尺寸 → 同名+尺寸 → 新建
function indexExistingComponents() {
  EXISTING_COMPS = new Map();
  EXISTING_BY_SIG = new Map();
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
        const m = /h2d-sig:([0-9a-f]+)/.exec(String(nd.description || ''));
        if (m) {
          if (!EXISTING_BY_SIG.has(m[1])) EXISTING_BY_SIG.set(m[1], []);
          EXISTING_BY_SIG.get(m[1]).push(nd);
        }
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
      DEF_ROOTS.set(id, d.root);
      // 先判断再建（2026-10-31 用户指令：可多页面复用的内容块只留一个组件，不重复创建）：
      // ① 结构哈希（d.sig ↔ 既有组件 description 'h2d-sig:' 指纹）+ 尺寸一致 → 复用——同构不同文案的块
      //   vname 必然不同，靠名字匹配必然漏，结构指纹才命中；② 退同名（vname）+ 尺寸；③ 都无才新建并写入指纹
      const sizeOk = c => Math.abs(c.width - d.root.w) <= 3 && Math.abs(c.height - d.root.h) <= 3;
      const wantName = String(d.vname || d.name || id).replace(/[=,]/g, ' ');
      const hit = ((d.sig ? EXISTING_BY_SIG.get(d.sig) : null) || []).find(sizeOk)
        || (EXISTING_COMPS.get(norm(wantName)) || []).find(sizeOk);
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
      if (d.sig) { try { comp.description = (comp.description ? comp.description + ' ' : '') + 'h2d-sig:' + d.sig; } catch (e) {} }
      applyFrameProps(comp, d.root);
      comp.fills = await buildFills(d.root);
      try { comp.resize(Math.max(d.root.w, 0.01), Math.max(d.root.h, 0.01)); } catch (e) {}
      for (const c of (d.root.ch || [])) await materialize(c, comp);
      if (d.root.al) applyAutoLayout(comp, d.root.al, d.root);
      // TEXT 属性化（2026-10-31，对标 code.to.design 组件集再生）：把组件内文本层暴露为 TEXT 组件属性——
      // 实例改文字走右侧面板 string 字段（setProperties 所见即所得），比裸改 characters 抗漂移、设计师可直接编辑；
      // 嵌套实例（组件内库实例等）内部文本不暴露（真 API 禁止改嵌套实例内层）
      try {
        const lays = [];
        (function df3(nd, inInst) { (nd.children || []).forEach(c => {
          const ins = inInst || c.type === 'INSTANCE';
          if (c.type === 'TEXT' && !ins && !(c.componentPropertyReferences && c.componentPropertyReferences.characters)) lays.push(c);
          df3(c, ins);
        }); })(comp, false);
        lays.forEach((l, i) => {
          if (typeof comp.addComponentProperty !== 'function') return;
          const nm = String(l.characters || '').replace(/\s+/g, ' ').trim().slice(0, 16) || ('text' + (i + 1));
          const pname = comp.addComponentProperty(nm.replace(/[=,]/g, ' '), 'TEXT', String(l.characters || ''));
          l.componentPropertyReferences = { characters: pname };
        });
      } catch (e) { console.warn('TEXT 属性暴露跳过', e.message); }
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
  // 飞书任务链路收尾：ui.html 回写表格完成后关面板（回写在 iframe 里发，closePlugin 会连 iframe 一起销毁）
  if (msg.type === 'feishu-close') { figma.closePlugin(); return; }
  if (msg.type !== 'scene') return;
  const scene = msg.json;
  if (!scene || !scene.cells || !scene.cells.length) {
    figma.notify('scene.json 无效', { error: true });
    return;
  }
  // 构建号护栏：scene 由当前仓库 build-scene 产出（带 build 号）；面板代码旧于它 = 面板没重开（JS 上下文
  // 是改代码前加载的），继续导只会产出旧缺陷板——直接拒导，提示完全关闭面板再重开。无 build 号的 scene
  // （旧 scene 文件/mock）不拦。
  if (scene.build && scene.build !== PLUGIN_BUILD) {
    figma.notify('⚠️ 面板插件是旧版代码（scene ' + scene.build + ' / 插件 ' + PLUGIN_BUILD +
      '）——请完全关闭本面板再重新打开，然后重新导入', { error: true, timeout: 15000 });
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
  iconInstCount = 0; iconFallbackCount = 0; iconDynCount = 0;
  libInstCount = 0; libFallbackCount = 0; libPropCount = 0; libImportFailCount = 0; libColorPickCount = 0; libShapePickCount = 0; libSwapCount = 0; libTextDoneCount = 0; libColDoneCount = 0; libUnderflowCount = 0; libIconSwapCount = 0; libVisualRepickCount = 0; libSizePickCount = 0; libFontDoneCount = 0; libFontFailCount = 0; libIconOnlyCount = 0; libIconOnlyHiddenCount = 0; libEmptyInputHiddenCount = 0; libColorRepaintCount = 0; instTextCount = 0; instUnderCount = 0; instanceFitFailCount = 0; libAddonHiddenCount = 0; libSlotHiddenCount = 0; libTextSweepCount = 0; libTailHiddenCount = 0; libTailGrowCount = 0;
  libDynHitCount = 0; CATALOG_CACHE.clear(); dialogFullPageCount = 0;
  imgFillCount = 0; gradFillCount = 0; alApplyCount = 0;
  rctCount = 0; RCT_NODES = []; cellFrames = [];
  LK_NODES = []; FIX_NODES = []; lkCount = 0; scrollCount = 0; extStyleCount = 0; fixLiftCount = 0; famHitCount = 0;
  CUR_SCENE = scene; tokBindCount = 0; TOK_BIND_QUEUE.length = 0;
  IMG_CACHE.clear();
  DEF_COMPS = new Map(); DEF_FAMILY = new Map(); DEF_REUSED = new Set(); DEF_ROOTS = new Map(); defReuseCount = 0;
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
      // fixed/sticky 提升：吸顶元素挪为 cell 帧直接子节点（绝对坐标换算），不被内层 overflow 裁走
      const lifts = FIX_NODES.splice(0);
      for (const fn of lifts) {
        try {
          const pa = fn.absoluteTransform, fa = cellF.absoluteTransform;
          cellF.appendChild(fn);
          // absoluteTransform 已含上一行 children +=24 的整体下移——再 +24 会双重补偿
          //（REQ-020 实测蒙版落 y=48 而非 24）
          fn.x = pa[0][2] - fa[0][2]; fn.y = pa[1][2] - fa[1][2];
          fixLiftCount++;
        } catch (e) { console.warn('fix lift skip', fn.name, e); }
      }
      // overflow 滚动（free 层 scroll support 对标）：裁切且内容超高 >40px 的帧 → overflowDirection VERTICAL
      (function recScroll(f) {
        if (f.type !== 'FRAME') return;
        if (f.clipsContent) {
          let maxB = 0; f.children.forEach(ch => { maxB = Math.max(maxB, ch.y + ch.height); });
          if (maxB > f.height + 40) { try { f.overflowDirection = 'VERTICAL'; scrollCount++; } catch (e) {} }
        }
        f.children.forEach(recScroll);
      })(cellF);
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
    // 外部网页自动连线（free 层 automatic linking 对标）：cell.u 记录了各帧页面 URL 归一键，
    // 节点 lk（同源 a[href] 目标）命中即挂 ON_CLICK NAVIGATE → 对应页帧，导入即得可点击站点原型
    if (LK_NODES.length) {
      const uFrame = new Map();
      scene.cells.forEach((c, i) => { if (c.u && cellFrames[i]) uFrame.set(c.u, cellFrames[i]); });
      for (const { node, lk } of LK_NODES) {
        const dest = uFrame.get(lk);
        if (!dest || dest.id === node.id) continue;
        try {
          node.reactions = (node.reactions || []).concat([{ trigger: { type: 'ON_CLICK' }, action: { type: 'NODE', destinationId: dest.id, navigation: 'NAVIGATE', transition: null } }]);
          lkCount++;
        } catch (e) { console.warn('lk skip', node.name, e); }
      }
    }
    // 外部网页本地色板（free 层 use local styles 对标）：重复 ≥3 次的实色建本地 paint style 并回绑
    //（自家 ms-* demo 不走此路——那边实色一律绑库 Color Token 变量，§4.7 契约不变）
    if (EXT_SCENE) {
      try {
        const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('').toUpperCase();
        const counts = new Map();
        // 计数：仅不透明实色（半透明色保持裸值，与令牌绑定例外口径一致）；
        // 范围 = 各 cell 帧内容（跳过首行标签——那是导入器自加的序号标签，不是页面内容）
        const walkFills = (fn) => cellFrames.forEach(cf => cf.children.slice(1).forEach(nd => (function recW(n2) {
          fn(n2); (n2.children || []).forEach(recW);
        })(nd)));
        walkFills(nd => {
          if (nd.fills && nd.fills !== figma.mixed) {
            nd.fills.forEach(p => {
              if (p && p.type === 'SOLID' && p.visible !== false && (p.opacity == null || p.opacity === 1)) {
                const k = hex(p.color.r, p.color.g, p.color.b);
                counts.set(k, (counts.get(k) || 0) + 1);
              }
            });
          }
        });
        const existing = new Map((await figma.getLocalPaintStylesAsync()).map(s => [s.name, s]));
        const hot = [...counts.entries()].filter(([, n2]) => n2 >= 3)
          .sort((a, b) => b[1] - a[1]).slice(0, 30);
        const styleByKey = new Map();
        for (const [k] of hot) {
          const st = existing.get(k) || figma.createPaintStyle();
          st.name = k;
          st.paints = [{ type: 'SOLID', color: { r: parseInt(k.slice(1, 3), 16) / 255, g: parseInt(k.slice(3, 5), 16) / 255, b: parseInt(k.slice(5, 7), 16) / 255 } }];
          styleByKey.set(k, st);
        }
        if (styleByKey.size) {
          walkFills(nd => {
            if (nd.fills && nd.fills !== figma.mixed && nd.fills.length === 1 && nd.fills[0].type === 'SOLID'
              && (nd.fills[0].opacity == null || nd.fills[0].opacity === 1)) {
              const st = styleByKey.get(hex(nd.fills[0].color.r, nd.fills[0].color.g, nd.fills[0].color.b));
              if (st && nd.paintStyleId !== st.id) { try { nd.paintStyleId = st.id; extStyleCount++; } catch (e) {} }
            }
          });
        }
      } catch (e) { console.warn('ext local styles skip', e); }
    }
    // 组件定义收进一个画板（设计师习惯：组件库画板分节收纳，不散落长龙）：
    // 按家族分节 → 同家族 ≥2 个 combineAsVariants 合成变体组件集 → 节内网格换行
    let variantSetCount = 0;
    let defSetReattach = 0;
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
            // 八轮（2026-10-31 REQ-018 实测）：真 API combine 不自动排布变体（全部叠 0,0、集框塌成
            // 单变体尺寸），且实测吞变体——第 11 个 Energy-Analyser- 被改名 family/variant 游离集外。
            // 先对账补挂（parent 不是 set 的一律 appendChild 回集），再网格排布 + 集框收缩到内容
            for (const cm of comps) { if (cm.parent !== set) { try { set.appendChild(cm); defSetReattach++; } catch (e2) { console.warn('变体补挂失败', fam, cm.name, e2); } } }
            const kids = comps.filter(cm => cm.parent === set);
            let mw = 0, mh = 0;
            kids.forEach(cm => { mw = Math.max(mw, cm.width); mh = Math.max(mh, cm.height); });
            const cols = Math.max(2, Math.ceil(Math.sqrt(kids.length))), GP = 24;
            kids.forEach((cm, i) => { try { cm.x = (i % cols) * (mw + GP); cm.y = Math.floor(i / cols) * (mh + GP); } catch (e3) {} });
            try { set.resizeWithoutConstraints(Math.max(1, cols * (mw + GP) - GP), Math.max(1, Math.ceil(kids.length / cols) * (mh + GP) - GP)); } catch (e4) { console.warn('变体集框收缩失败', fam, e4); }
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
    // svgCache 原型清场（2026-10-31 像素审计缺陷 G）：缓存的原型节点从未挂父，导入结束会以
    // 游离空 Frame 形态残留在页面根（如 24×24 "Frame"）——统一 remove 清掉
    svgCache.forEach(p => { if (p && p.remove) { try { p.remove(); } catch (e) {} } });
    svgCache.clear();
    figma.viewport.scrollAndZoomIntoView([board]);
    // 外部网页（scene.ext）不进本地组件体系——库/令牌段整体替换为模式标记，不报「库实例 0 异常」误导
    const libSeg = EXT_SCENE
      ? '｜外部网页 · 纯图层（不走本地组件库）'
      : '｜库组件实例 ' + libInstCount + '（属性设置 ' + libPropCount + ' 项，文案改写 ' + libTextDoneCount + '，文字色 ' + libColDoneCount + '，字样覆写 ' + libFontDoneCount + (libFontFailCount ? '（失败 ' + libFontFailCount + '）' : '') + '，图标槽换装 ' + libIconSwapCount + (libAddonHiddenCount ? '，附加结构隐藏 ' + libAddonHiddenCount : '') + (libSlotHiddenCount ? '，图标槽隐藏 ' + libSlotHiddenCount : '') + (libTextSweepCount ? '，残余文本隐藏 ' + libTextSweepCount : '') + (libTailHiddenCount || libTailGrowCount ? '，步骤尾线 ' + libTailHiddenCount + ' 藏/' + libTailGrowCount + ' 拉宽' : '') + (libIconOnlyCount ? '，纯图标钮 ' + libIconOnlyCount + (libIconOnlyHiddenCount ? '（藏 Label ' + libIconOnlyHiddenCount + ' 层）' : '') : '') + (libEmptyInputHiddenCount ? '，空输入藏文案 ' + libEmptyInputHiddenCount + ' 层' : '') + '，视觉复核重选 ' + libVisualRepickCount + '，颜色覆写 ' + libColorRepaintCount + '，颜色择变体 ' + libColorPickCount + (libDynHitCount ? '，库目录动态命中 ' + libDynHitCount : '') + (libShapePickCount ? '，形状择变体 ' + libShapePickCount : '') + (libSizePickCount ? '，高度择尺寸 ' + libSizePickCount : '') + (dialogFullPageCount ? '，蒙版铺满 ' + dialogFullPageCount : '') + (libSwapCount ? '，嵌套实例 swap ' + libSwapCount : '') + (instanceFitFailCount ? '，实例内层扩宽失败 ' + instanceFitFailCount + '（Figma 实例模型限制，定宽槽装不下长文案——该块建议守卫拒收本地绘制）' : '') + (libUnderflowCount ? '，内容不齐回退 ' + libUnderflowCount + '（demo 段数超实例容量，整块本地重绘保内容）' : '') + (libFallbackCount ? '，回退 ' + libFallbackCount : '') + (libImportFailCount ? '，库导入失败 ' + libImportFailCount + '（0 实例即异常，查 component-keys.json key / 库订阅 / 库目录动态找回）' : '') + '）｜令牌绑定 ' + tokBindCount + '（库 Color Token 变量，0 且有 tokVars 即异常查 token-vars.json key）';
    figma.notify('导入完成：' + totalCells + ' 屏｜组件 ' + defCount + (defReuseCount ? '（复用既有 ' + defReuseCount + '，重复块不再新建）' : '') + (instTextCount ? '｜实例文案改写 ' + instTextCount : '') + (instUnderCount ? '｜实例内容回退 ' + instUnderCount : '') + '｜变体集 ' + variantSetCount + (defSetReattach ? '（补挂被吞变体 ' + defSetReattach + '）' : '') + '｜图标库实例 ' + iconInstCount + (iconDynCount ? '（按名动态兜底 ' + iconDynCount + '）' : '') + libSeg + '｜自动布局 ' + alApplyCount + '｜图片 ' + imgFillCount + '｜渐变 ' + gradFillCount + '｜矢量回退 ' + iconFallbackCount + (rctCount + lkCount ? '｜原型连线 ' + (rctCount + lkCount) : '') + (scrollCount ? '｜滚动 ' + scrollCount : '') + (fixLiftCount ? '｜吸顶 ' + fixLiftCount : '') + (EXT_SCENE && extStyleCount ? '｜本地色样式 ' + extStyleCount : '') + (famHitCount ? '｜字体映射 ' + famHitCount : ''));
    importing = false; // 连续导入（多页面逐个导入）不被「导入进行中」挡住
    // 飞书任务链路：转完不自动关面板——iframe 里的回写 fetch 需要活着；回写完 ui 发 feishu-close 再关
    if (scene.feishu && scene.feishu.id) {
      figma.ui.postMessage({ type: 'import-done', feishu: scene.feishu, ok: true });
      return;
    }
    figma.closePlugin();
  } catch (e) {
    figma.notify('导入失败：' + (e && e.message || e), { error: true, timeout: 12000 });
    postStatus('导入失败：' + (e && e.message || e) + '——已保留已生成部分，可重试');
    if (scene.feishu && scene.feishu.id) figma.ui.postMessage({ type: 'import-done', feishu: scene.feishu, ok: false });
    importing = false;
  }
};
