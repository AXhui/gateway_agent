#!/usr/bin/env node
// figma-mock.test.js — 离线验证插件 code.js 全流水线（10 轮保真验证的插件层度量仪）。
// 原理：mock figma API（节点工厂/字体/库导入/图片/变体合并）→ vm 跑 ~/Desktop/html-to-figma-internal/code.js
// → 灌入覆盖全能力的合成 scene → 断言文本修饰/描边/混合/旋转/渐变/图片/AL/图标/库实例/组件变体。
// 用法: node figma-mock.test.js

const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm');

// ---------- mock 节点 ----------
let NODE_SEQ = 0;
class FNode {
  constructor(type, opts = {}) {
    this.id = ++NODE_SEQ; this.type = type; this.children = []; this.parent = null;
    this._w = 100; this._h = 100;
    this.x = 0; this.y = 0; this.opacity = 1; this.rotation = 0; this.visible = true;
    this.name = type; this.blendMode = 'NORMAL';
    this.fills = []; this.strokes = []; this.strokeDashes = []; this.effects = [];
    Object.assign(this, opts);
  }
  get width() { return this.type === 'TEXT' ? Math.max(10, String(this.characters || '').length * (this.fontSize || 14) * 0.6) : this._w; }
  get height() { return this.type === 'TEXT' ? (this.lineHeight && this.lineHeight.value) || 20 : this._h; }
  set width(v) { this._w = v; }
  set height(v) { this._h = v; }
  resize(w, h) { this._w = w; this._h = h; }
  resizeWithoutConstraints(w, h) { this._w = w; this._h = h; }
  rescale(s) { this._w *= s; this._h *= s; }
  appendChild(ch) {
    if (ch.parent) ch.parent.children = ch.parent.children.filter(c => c !== ch);
    ch.parent = this; this.children.push(ch); return ch;
  }
  remove() { if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); this.parent = null; }
  clone() {
    const c = new FNode(this.type);
    Object.assign(c, this);
    c.id = ++NODE_SEQ; c.children = []; c.parent = null;
    this.children.forEach(k => c.appendChild(k.clone()));
    return c;
  }
  set mainComponent(c) {
    // 对齐真 API：换 mainComponent → 子树换成新变体结构（组件子件以实例形态出现）
    this._main = c;
    if (c) {
      this.children.slice().forEach(k => k.remove());
      c.children.map(k => k.clone()).forEach(k => { if (k.type === 'COMPONENT') k.type = 'INSTANCE'; this.appendChild(k); });
      this.variantProperties = c.variantProperties ? Object.assign({}, c.variantProperties) : this.variantProperties;
      this.componentPropertyDefinitions = c.componentPropertyDefinitions || this.componentPropertyDefinitions;
    }
  }
  get mainComponent() { return this._main; }
  createInstance() {
    const inst = this.clone();
    inst.type = 'INSTANCE';
    inst.componentPropertyDefinitions = this.componentPropertyDefinitions;
    inst.variantProperties = this.variantProperties;
    inst.setProps = [];
    inst.setProperties = p => {
      inst.setProps.push(p);
      // 对齐真 API（mock 校准纪律）：TEXT 属性同步写入绑定文本层（按 defaultValue 定位）——
      // 实例文案回填的 used 过滤依赖 characters 已被 setProperties 更新这一真行为
      Object.entries(p).forEach(([k2, v]) => {
        const d = (inst.componentPropertyDefinitions || {})[k2];
        if (!d || d.type !== 'TEXT') return;
        const hit = [];
        (function ft(nd) { (nd.children || []).forEach(c => { if (hit.length) return; if (c.type === 'TEXT' && c.characters === d.defaultValue) hit.push(c); else ft(c); }); })(inst);
        if (hit[0]) hit[0].characters = v;
      });
    };
    return inst;
  }
  setProperties(p) { (this.setProps = this.setProps || []).push(p); }
}

// ---------- mock 库组件 ----------
function mkText(chars) {
  return new FNode('TEXT', { characters: chars, fontName: { family: 'PingFang SC', style: 'Regular' }, fontSize: 14 });
}
function mkBtnVariant(sizeVal, typeVal, label) {
  const c = new FNode('COMPONENT', { name: 'Type=' + typeVal + ', Size=' + sizeVal, width: 88, height: 32 });
  c.variantProperties = { Size: sizeVal, Type: typeVal };
  c.componentPropertyDefinitions = {
    'Size': { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' },
    'Type': { type: 'VARIANT', variantOptions: ['Primary', 'Default'], defaultValue: 'Default' },
    'icon#101': { type: 'BOOLEAN', defaultValue: false },
    'Label#102': { type: 'TEXT', defaultValue: 'Button' },
  };
  // 变体主导填充色（Primary 蓝 / Default 白）——颜色择变体的比对源
  c.fills = [{ type: 'SOLID', color: typeVal === 'Primary' ? { r: 0.2, g: 0.4, b: 0.9 } : { r: 1, g: 1, b: 1 } }];
  c.appendChild(mkText(label));
  return c;
}
function mkIconComp(key) {
  // 描边型 path（strokes 黑）+ 填充型 path（fills 黑）——验证 paintIconStrokes 两路覆盖
  const c = new FNode('COMPONENT', { name: 'icon/' + key, width: 24, height: 24 });
  const strokePath = new FNode('VECTOR', { width: 24, height: 24, strokes: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }], fills: [] });
  const fillPath = new FNode('VECTOR', { width: 24, height: 24, fills: [{ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }], strokes: [] });
  c.appendChild(strokePath); c.appendChild(fillPath);
  return c;
}
const MOCK_LIBS = new Map();
(function () {
  const set = new FNode('COMPONENT_SET', { name: 'Button', width: 88, height: 32 });
  set.appendChild(mkBtnVariant('Small', 'Primary', 'Button'));
  set.appendChild(mkBtnVariant('Small', 'Default', 'Button'));
  set.appendChild(mkBtnVariant('Large', 'Primary', 'Button'));
  set.appendChild(mkBtnVariant('Large', 'Default', 'Button'));
  set.componentPropertyDefinitions = {
    Size: { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' },
    Type: { type: 'VARIANT', variantOptions: ['Primary', 'Default'], defaultValue: 'Default' },
  };
  MOCK_LIBS.set('lib:btn', set);
  MOCK_LIBS.set('icon:check', mkIconComp('check'));

  // biz 标题 set：plain / with-switch 两变体（形状择变体的靶子）
  const titleSet = new FNode('COMPONENT_SET', { name: '标题', width: 200, height: 24 });
  const mkTitle = withSw => {
    const c = new FNode('COMPONENT', { name: 'Type=' + (withSw ? 'Switch' : 'Plain'), width: 200, height: 24 });
    c.variantProperties = { Type: withSw ? 'Switch' : 'Plain' };
    c.componentPropertyDefinitions = {
      Type: { type: 'VARIANT', variantOptions: ['Plain', 'Switch'], defaultValue: 'Plain' },
      '标题#10': { type: 'TEXT', defaultValue: '标题' },
    };
    const t1 = mkText('标题'); t1.fontSize = 16; c.appendChild(t1);
    if (withSw) c.appendChild(new FNode('INSTANCE', { name: 'Switch', width: 28, height: 16 }));
    return c;
  };
  titleSet.appendChild(mkTitle(false)); titleSet.appendChild(mkTitle(true));
  MOCK_LIBS.set('lib:title', titleSet);

  // biz 弹窗 set：语义布尔轴（Info/Error/Waiting/Warn/Success）+ 多 TEXT 属性
  const dlgSet = new FNode('COMPONENT_SET', { name: '弹窗', width: 1440, height: 900 });
  const dlg = new FNode('COMPONENT', { name: '弹窗/Info', width: 1440, height: 900 });
  dlg.componentPropertyDefinitions = {
    Info: { type: 'BOOLEAN', defaultValue: false }, Error: { type: 'BOOLEAN', defaultValue: false },
    Waiting: { type: 'BOOLEAN', defaultValue: false }, Warn: { type: 'BOOLEAN', defaultValue: false },
    Success: { type: 'BOOLEAN', defaultValue: false },
    '标题#201': { type: 'TEXT', defaultValue: '提示' }, '描述#202': { type: 'TEXT', defaultValue: '内容' }, '按钮#203': { type: 'TEXT', defaultValue: 'OK' },
  };
  const mask = new FNode('FRAME', { name: 'Mask', width: 1440, height: 900, fills: [{ type: 'SOLID', color: { r: 0.15, g: 0.18, b: 0.23 }, opacity: 0.5 }] });
  const card = new FNode('FRAME', { name: 'Message', width: 416, height: 160 });
  card.appendChild(mkText('提示')); card.appendChild(mkText('内容')); card.appendChild(mkText('OK'));
  mask.appendChild(card); dlg.appendChild(mask); dlgSet.appendChild(dlg);
  MOCK_LIBS.set('lib:dialog', dlgSet);
  // resize 被锁的弹窗库（蒙版铁律：resize 失败保持库原生全页尺寸）
  const dlgLock = dlg.clone(); dlgLock.name = '弹窗/Lock';
  dlgLock.resize = () => { throw new Error('resize locked'); };
  const dlgLockSet = new FNode('COMPONENT_SET', { name: '弹窗Lock', width: 1440, height: 900 });
  dlgLockSet.appendChild(dlgLock);
  MOCK_LIBS.set('lib:dialog-lock', dlgLockSet);

  // web Tabs/Top 三层：外壳 set + 内部 Components/Tabs-Top（Item 数量轴）+ Components/Tab（Selecte 选择轴）
  const mkTabComp = sel => {
    const c = new FNode('COMPONENT', { name: 'Selecte=' + sel, width: 100, height: 48 });
    c.variantProperties = { 'Selecte 选择': sel, 'Size 尺寸': 'medium' };
    c.appendChild(mkText('Tab'));
    return c;
  };
  const tabSet = new FNode('COMPONENT_SET', { name: 'Components/Tab', width: 100, height: 48 });
  tabSet.appendChild(mkTabComp('true')); tabSet.appendChild(mkTabComp('false'));
  const mkTabsTopComp = n2 => {
    const c = new FNode('COMPONENT', { name: 'Item 数量=' + n2, width: 100 * n2, height: 48 });
    c.variantProperties = { 'Item 数量': String(n2), 'Size 尺寸': 'medium', 'Icon 图标': 'false' };
    for (let i = 0; i < n2; i++) c.appendChild(new FNode('INSTANCE', { name: 'Tab', width: 100, height: 48 }));
    return c;
  };
  const tabsTopSet = new FNode('COMPONENT_SET', { name: 'Components/Tabs-Top', width: 200, height: 48 });
  tabsTopSet.appendChild(mkTabsTopComp(2)); tabsTopSet.appendChild(mkTabsTopComp(3));
  const tabsComp = new FNode('COMPONENT', { name: 'Tabs/Top', width: 1220, height: 48 });
  tabsComp.appendChild(new FNode('INSTANCE', { name: 'Components/Tabs-Top', width: 200, height: 48 }));
  const tabsSet = new FNode('COMPONENT_SET', { name: 'Tabs/Top', width: 1220, height: 48 });
  tabsSet.appendChild(tabsComp);
  MOCK_LIBS.set('lib:tabs', tabsSet); MOCK_LIBS.set('lib:tabs-top', tabsTopSet); MOCK_LIBS.set('lib:tab', tabSet);

  // 动态命中靶子（2026-10-29）：未映射原子控件词干匹配用（catalogFind('switch') → 'Switch'）
  const swComp = new FNode('COMPONENT', { name: 'Switch', width: 40, height: 20 });
  swComp.componentPropertyDefinitions = { 'Label#301': { type: 'TEXT', defaultValue: 'Switch' } };
  swComp.appendChild(mkText('Switch'));
  MOCK_LIBS.set('lib:switch', swComp);

  // 全量文案改写靶子（2026-10-29 用户规则）：无 TEXT 属性、2 个嵌套文本层 → 剩余文本逐层回填 + 文字色覆盖
  const statComp = new FNode('COMPONENT', { name: 'Statistic', width: 120, height: 48 });
  statComp.appendChild(mkText('Value'));
  statComp.appendChild(mkText('Label'));
  MOCK_LIBS.set('lib:stat', statComp);

  // 双语词干命中靶子（2026-10-29 用户实测「组件库很多没有匹配上」）：
  // ①路径前缀名（'2 Navigation/1 Breadcrumb'）→ ms-breadcrumb 词干经「末段去序号归一」命中；
  // ②中文组件名（'导航栏'）→ ms-header 词干经 STEM_ALIAS 中文桥接命中
  const crumbSet = new FNode('COMPONENT_SET', { name: '2 Navigation/1 Breadcrumb', width: 200, height: 20 });
  const crumbC = new FNode('COMPONENT', { name: 'Basic', width: 200, height: 20 });
  crumbC.componentPropertyDefinitions = { 'Label#401': { type: 'TEXT', defaultValue: 'Breadcrumb' } };
  crumbC.appendChild(mkText('Breadcrumb'));
  crumbSet.appendChild(crumbC);
  MOCK_LIBS.set('lib:crumb', crumbSet);
  const navSet = new FNode('COMPONENT_SET', { name: '导航栏', width: 200, height: 20 });
  const navC = new FNode('COMPONENT', { name: 'Basic', width: 200, height: 20 });
  navC.appendChild(mkText('导航'));
  navSet.appendChild(navC);
  MOCK_LIBS.set('lib:nav', navSet);

  // 图层级透明度蒙版弹窗（fill 不透明、layer opacity 0.5）——transl 双通道靶子（只查 FILL 会漏判）
  const dlgLaySet = new FNode('COMPONENT_SET', { name: '弹窗Layop', width: 1440, height: 900 });
  const dlgLay = new FNode('COMPONENT', { name: '弹窗/Layop', width: 1440, height: 900 });
  const maskLay = new FNode('FRAME', { name: 'Mask', width: 1440, height: 900, opacity: 0.5, fills: [{ type: 'SOLID', color: { r: 0.15, g: 0.18, b: 0.23 } }] });
  const cardLay = new FNode('FRAME', { name: 'Message', width: 360, height: 120 });
  cardLay.appendChild(mkText('上传固件')); cardLay.appendChild(mkText('Uploading 40%')); cardLay.appendChild(mkText('Cancel'));
  maskLay.appendChild(cardLay); dlgLay.appendChild(maskLay); dlgLaySet.appendChild(dlgLay);
  MOCK_LIBS.set('lib:dialog-layop', dlgLaySet);
})();

// ---------- mock figma ----------
const calls = { importKey: [], importSetKey: [], importVarKey: [], createImageAsync: [], combineAsVariants: [], notify: [], fonts: new Set(), closePlugin: 0, teamLib: 0 };

// ---------- 颜色令牌变量注册表（2026-10-30 令牌绑定契约）----------
// 对齐 Milesight_IOT_Web「Color Token」库变量：scopes 空=全域；值经 valuesByMode 提供，
// setBoundVariableForPaint 绑定后 paint.color 同步为变量值（插件读回校验依赖此行为）
const VAR_REGISTRY = new Map();
const mkVar = (key, name, rgb, scopes) => {
  const v = { id: 'var:' + key, key, name, scopes: scopes || [], valuesByMode: { m1: { r: rgb[0], g: rgb[1], b: rgb[2] } } };
  VAR_REGISTRY.set(key, v); return v;
};
const V_TEXT = mkVar('v:text', 'color-text-primary', [0.1, 0.1, 0.1]);
const V_FILL = mkVar('v:fill', 'color-fill-base-normal', [1, 1, 1]);
const V_ICON = mkVar('v:icon', 'color-icon-normal', [0.2, 0.4, 0.9]);
const V_RED = mkVar('v:red', 'color-error-normal', [1, 0, 0], ['STROKE']);
const V_BORDER = mkVar('v:border', 'color-border-base', [0, 0, 0], ['STROKE']);
mkVar('v:text-only', 'color-text-secondary', [0.2, 0.2, 0.2], ['TEXT_FILL']); // 仅 TEXT_FILL → FRAME_FILL 错配必跳
mkVar('v:drift', 'color-warm-normal', [0.9, 0.1, 0.1]);                       // 库值≠demo 色 → 读回校验回退裸色
// 'v:missing' 故意不注册：tokVars 带该 key，importVariableByKeyAsync 抛错 → 插件 catch 后保持裸色
const mockPage = new FNode('PAGE', { name: 'Page 1' });
const figma = {
  createFrame: () => new FNode('FRAME'),
  createText: () => new FNode('TEXT', { characters: '' }),
  createRectangle: () => new FNode('RECTANGLE'),
  createComponent: () => new FNode('COMPONENT'),
  createImage: b => ({ hash: 'hash:' + String(b).slice(0, 8) }),
  createImageAsync: async url => { calls.createImageAsync.push(url); return { hash: 'hash:' + String(url).slice(-16) }; },
  createNodeFromSvg: svg => new FNode('FRAME', { name: 'svg', width: 24, height: 24, children: [] }),
  combineAsVariants: (comps, page) => {
    const set = new FNode('COMPONENT_SET', { name: 'set' });
    comps.forEach(c => set.appendChild(c)); page.appendChild(set);
    calls.combineAsVariants.push(comps.map(c => c.name));
    return set;
  },
  currentPage: mockPage,
  root: { type: 'DOCUMENT', children: [mockPage] },
  // 库目录（2026-10-29 动态找组件）：getAvailableLibrariesAsync + getTeamLibraryAsync，
  // 目录从 MOCK_LIBS 派生（component/set 各自清单，key+name 对齐真 API PublishedLibraryFile）
  getAvailableLibrariesAsync: async () => [{ id: 'lib:mock', name: 'Milesight_Mock', enabled: true }],
  getTeamLibraryAsync: async id => {
    if (id !== 'lib:mock') throw new Error('unknown library: ' + id);
    calls.teamLib++;
    const of = t2 => [...MOCK_LIBS.entries()].filter(([, n]) => n.type === t2).map(([k, n]) => ({ key: k, name: n.name }));
    return { libraryName: 'Milesight_Mock', components: of('COMPONENT'), componentSets: of('COMPONENT_SET') };
  },
  loadFontAsync: async f => { calls.fonts.add(f.family + '/' + f.style); },
  importComponentByKeyAsync: async k => {
    calls.importKey.push(k);
    const n = MOCK_LIBS.get(k);
    if (!n) throw new Error('key not found: ' + k);
    // 对齐真 API：component_set 的 key 走本方法必抛错（曾掩盖根因的 mock 盲区）
    if (n.type === 'COMPONENT_SET') throw new Error('COMPONENT_SET key must use importComponentSetByKeyAsync: ' + k);
    return n;
  },
  importComponentSetByKeyAsync: async k => {
    calls.importSetKey.push(k);
    const n = MOCK_LIBS.get(k);
    if (!n || n.type !== 'COMPONENT_SET') throw new Error('set key not found: ' + k);
    return n;
  },
  // 对齐真 API（令牌绑定契约）：无效 key reject；setBoundVariableForPaint 仅 SOLID（否则 throw）、
  // 写 paint.boundVariables.color 并把 paint.color 同步为变量值——读回校验（库值≠demo 色即回退）依赖该行为
  variables: {
    importVariableByKeyAsync: async k => {
      calls.importVarKey.push(k);
      const v = VAR_REGISTRY.get(k);
      if (!v) throw new Error('variable key not found: ' + k);
      return v;
    },
    setBoundVariableForPaint: (paint, field, variable) => {
      if (!paint || paint.type !== 'SOLID') throw new Error('setBoundVariableForPaint requires a SOLID paint');
      if (!variable || variable.type === undefined && !variable.id) throw new Error('invalid variable');
      paint.boundVariables = Object.assign({}, paint.boundVariables, (function () { const o = {}; o[field] = { type: 'VARIABLE', id: variable.id }; return o; })());
      const val = variable.valuesByMode && Object.values(variable.valuesByMode)[0];
      if (val) paint.color = { r: val.r, g: val.g, b: val.b };
    },
  },
  notify: (t, o) => { calls.notify.push(t); },
  viewport: { scrollAndZoomIntoView: () => {} },
  closePlugin: () => { calls.closePlugin++; },
  showUI: () => {},
  ui: {
    _handler: null,
    postMessage: () => {},
    set onmessage(fn) { this._handler = fn; },
    get onmessage() { return this._handler; },
  },
};

// ---------- 合成 scene（覆盖全部新能力） ----------
function T(text, extra) { return Object.assign({ t: 't', text, fs: 14, fw: 400, lh: 20, ls: 0, col: [0.1, 0.1, 0.1], al: 'left', x: 0, y: 0, w: 100, h: 20, o: 1 }, extra); }
const SCENE = {
  v: 2, name: 'MockTest',
  // 令牌绑定契约：令牌名 -> 库变量 key（真源 token-vars.json）；'v:missing' 未注册 → 导入失败回退裸色
  tokVars: {
    'color-text-primary': 'v:text', 'color-fill-base-normal': 'v:fill', 'color-icon-normal': 'v:icon',
    'color-error-normal': 'v:red', 'color-border-base': 'v:border',
    'color-text-secondary': 'v:text-only', 'color-warm-normal': 'v:drift', 'color-no-such': 'v:missing',
  },
  cells: [{
    label: '1. 默认态', x: 0, y: 0, w: 1440, h: 900,
    root: {
      t: 'f', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 0, w: 1440, h: 900, o: 1, ch: [
        T('Italic Underline', { it: 1, td: 'u', fw: 500, tk: 'color-text-primary' }),
        T('Strike Text', { td: 's', tk: 'color-no-such' }),
        T('Truncated long text', { tr: 1 }),
        { t: 'f', n: 'dashed-blend-rot', f: [{ c: [1, 1, 1], a: 1 }], ftk: 'color-fill-base-normal', e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 60, w: 200, h: 60, o: 1, rot: 15, bm: 'multiply',
          stk: { w: 2, c: [1, 0, 0], a: 1, dash: 'dashed', tk: 'color-error-normal' },
          bg: [{ k: 'l', ang: 90, stops: [{ c: [0.1, 0.4, 0.9], a: 1, p: 0 }, { c: [0.9, 0.2, 0.2], a: 1, p: 1 }] }], ch: [] },
        { t: 'f', n: 'al-row', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 140, w: 300, h: 40, o: 1,
          rct: [{ to: 1, tg: 'ON_CLICK' }],
          al: { dir: 'row', gap: 12, just: 'MIN', align: 'CENTER', pt: 8, pr: 8, pb: 8, pl: 8, bw: 1, bc: [0, 0, 0], ba: 1, btk: 'color-border-base' },
          ch: [{ t: 'f', n: 'k1', f: [{ c: [0.8, 0.8, 0.8], a: 1 }], ftk: 'color-text-secondary', e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 8, y: 8, w: 50, h: 24, o: 1, ch: [] },
               { t: 'f', n: 'k2', f: [{ c: [0.7, 0.7, 0.7], a: 1 }], ftk: 'color-warm-normal', e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 70, y: 8, w: 50, h: 24, o: 1, ch: [] }] },
        { t: 'img', src: 'data:image/png;base64,MOCKDATA', x: 0, y: 200, w: 120, h: 80, o: 1, fit: 'cover', r: { tl: 8, tr: 8, br: 8, bl: 8 } },
        { t: 'ic', k: 'icon:check', f: 'icon/check', svg: '<svg viewBox="0 0 24 24"></svg>', x: 0, y: 300, w: 16, h: 16, o: 1, col: [0.2, 0.4, 0.9], ctk: 'color-icon-normal' },
        { t: 'f', n: 'ms-btn ms-btn--primary', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 340, w: 88, h: 32, o: 1,
          lib: { k: 'lib:btn', f: 'Button', cls: 'ms-btn', tok: ['primary'], text: 'Save', ic: false }, ch: [T('Save')] },
        { t: 'f', n: 'ms-btn', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 120, y: 340, w: 60, h: 32, o: 1,
          lib: { k: 'lib:btn', f: 'Button', cls: 'ms-btn', tok: [], col: [0.2, 0.4, 0.9], text: 'OK', ic: false }, ch: [T('OK')] },
        { t: 'f', n: 'ms-modal-title', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 480, w: 160, h: 24, o: 1,
          lib: { k: 'lib:title', f: '标题', cls: 'ms-modal-title', tok: [], texts: ['导入离线包'], fs: 16, sw: false }, ch: [T('导入离线包', { fs: 16 })] },
        { t: 'f', n: 'ms-mask', f: [{ c: [0.15, 0.18, 0.23], a: 0.5 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 520, w: 1440, h: 900, o: 1,
          lib: { k: 'lib:dialog', f: '弹窗', cls: 'ms-mask', tok: [], texts: ['确认删除？', '此操作不可恢复', '删除', '取消'] },
          ch: [{ t: 'f', n: 'ms-modal', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 8, tr: 8, br: 8, bl: 8 }, clip: false, x: 512, y: 380, w: 416, h: 160, o: 1,
            ch: [T('确认删除？'), T('此操作不可恢复'), T('删除'), T('取消')] }] },
        { t: 'f', n: 'ms-mask', f: [{ c: [0.15, 0.18, 0.23], a: 0.5 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 530, w: 1440, h: 900, o: 1,
          lib: { k: 'lib:dialog', f: '弹窗', cls: 'ms-mask', tok: ['waiting'], texts: ['Online Update', 'Fetching…', 'Cancel'] },
          ch: [{ t: 'f', n: 'ms-modal', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 8, tr: 8, br: 8, bl: 8 }, clip: false, x: 512, y: 385, w: 416, h: 160, o: 1,
            ch: [T('Online Update'), T('Fetching…'), T('Cancel')] }] },
        { t: 'f', n: 'ms-mask', f: [{ c: [0.15, 0.18, 0.23], a: 0.5 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 540, w: 1440, h: 1800, o: 1,
          lib: { k: 'lib:dialog-lock', f: '弹窗', cls: 'ms-mask', tok: [], texts: ['Lock', 'Locked', 'OK'] },
          ch: [{ t: 'f', n: 'ms-modal', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 8, tr: 8, br: 8, bl: 8 }, clip: false, x: 512, y: 390, w: 416, h: 160, o: 1,
            ch: [T('Lock'), T('Locked'), T('OK')] }] },
        { t: 'f', n: 'bc-eg71-page-tabs', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 600, w: 1220, h: 48, o: 1,
          lib: { k: 'lib:tabs', f: 'Tabs/Top', cls: 'bc-eg71-page-tabs', tok: [], sw: false,
            tabs: [{ text: '设备', active: true }, { text: '固件', active: false }],
            aux: { top: { figmaName: 'Components/Tabs-Top', key: 'lib:tabs-top' }, tab: { figmaName: 'Components/Tab', key: 'lib:tab' } } },
          ch: [T('设备'), T('固件')] },
        { t: 'f', n: 'ms-switch ms-switch--sm', f: [], e: [], r: { tl: 10, tr: 10, br: 10, bl: 10 }, clip: false, x: 0, y: 660, w: 40, h: 20, o: 1, ch: [T('On')] },
        { t: 'f', n: 'ms-modal-title2', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 700, w: 160, h: 24, o: 1,
          lib: { k: 'lib:stale', f: '标题', cls: 'ms-modal-title2', tok: [], texts: ['离线恢复'], fs: 16, sw: false }, ch: [T('离线恢复', { fs: 16 })] },
        { t: 'f', n: 'ms-stat', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 80, y: 700, w: 120, h: 48, o: 1,
          lib: { k: 'lib:stat', f: 'Statistic', cls: 'ms-stat', tok: [], texts: ['24', '在线设备'], tcols: [[0.2, 0.4, 0.9], undefined], ttoks: ['color-icon-normal', undefined] },
          ch: [T('24', { col: [0.2, 0.4, 0.9] }), T('在线设备')] },
        { t: 'f', n: 'ms-breadcrumb', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 240, y: 700, w: 200, h: 20, o: 1,
          ch: [T('Home / Devices')] },
        { t: 'f', n: 'ms-header', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 730, w: 200, h: 20, o: 1,
          ch: [T('导航')] },
        { t: 'f', n: 'ms-mask', f: [{ c: [0.15, 0.18, 0.23], a: 0.5 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 560, w: 1440, h: 1800, o: 1,
          lib: { k: 'lib:dialog-layop', f: '弹窗Layop', cls: 'ms-mask', tok: [], texts: ['上传固件', 'Uploading 40%', 'Cancel'] },
          ch: [{ t: 'f', n: 'ms-modal', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 8, tr: 8, br: 8, bl: 8 }, clip: false, x: 540, y: 840, w: 360, h: 120, o: 1,
            ch: [T('上传固件'), T('Uploading 40%'), T('Cancel')] }] },
        { t: 'inst', d: 'c1', x: 0, y: 400, w: 60, h: 24, o: 1 },
        { t: 's', svg: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24z"/></svg>', x: 0, y: 440, w: 20, h: 20, o: 1 },
      ],
    },
  }, {
    label: '2. 危险确认', x: 1500, y: 0, w: 1440, h: 900,
    root: { t: 'f', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 0, w: 1440, h: 900, o: 1, ch: [T('Confirm Delete?')] },
  }],
  defs: {
    c1: { name: 'ms-tag', vname: 'Active', root: { t: 'f', n: 'ms-tag', f: [{ c: [0.9, 0.9, 0.9], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 0, w: 60, h: 24, o: 1, ch: [T('Active')] } },
    c2: { name: 'ms-tag', vname: 'Disabled', root: { t: 'f', n: 'ms-tag', f: [{ c: [0.85, 0.85, 0.85], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 0, w: 60, h: 24, o: 1, ch: [T('Disabled')] } },
  },
};

// ---------- 跑插件 ----------
const plugin = path.join(os.homedir(), 'Desktop/html-to-figma-internal/code.js');
if (!fs.existsSync(plugin)) { console.error('找不到插件 code.js: ' + plugin); process.exit(2); }
const code = fs.readFileSync(plugin, 'utf8');
const sandbox = { figma, __html__: '<html></html>', console, setTimeout, clearTimeout, setInterval, clearInterval };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);

(async () => {
  const handler = figma.ui.onmessage;
  if (typeof handler !== 'function') { console.error('✗ 未捕获 onmessage 入口'); process.exit(1); }
  await handler({ type: 'scene', json: JSON.parse(JSON.stringify(SCENE)) });

  // ---------- 断言 ----------
  let pass = 0, fail = 0;
  const A = (name, cond, detail) => { if (cond) { pass++; } else { fail++; console.error('  ✗ ' + name + (detail ? ' · ' + detail : '')); } };
  const board = figma.currentPage.children.find(n => n.type === 'FRAME' && /MockTest/.test(n.name));
  A('主画板生成', !!board);
  const cell = board && board.children.find(c => c.name === '1. 默认态');
  A('状态帧生成', !!cell);
  const tree = cell ? cell.children.slice(1) : [];

  const findBy = (pred, list = tree) => { let out = []; (function w(n) { if (Array.isArray(n)) return n.forEach(w); if (pred(n)) out.push(n); (n.children || []).forEach(w); })(list); return out; };
  const findByNameM = (r, re) => { let o = null; (function w2(n2) { if (o) return; if (re.test(String(n2.name || ''))) { o = n2; return; } (n2.children || []).forEach(w2); })(r); return o; };
  const findFirstTextM = r => { if (r.type === 'TEXT') return r; for (const c of r.children || []) { const x = findFirstTextM(c); if (x) return x; } return null; };

  const ital = findBy(n => n.type === 'TEXT' && n.characters === 'Italic Underline')[0];
  A('斜体 fontStyle', ital && ital.fontName && ital.fontName.style === 'Medium Italic', ital && ital.fontName.style);
  A('下划线', ital && ital.textDecoration === 'UNDERLINE');
  const strike = findBy(n => n.type === 'TEXT' && n.characters === 'Strike Text')[0];
  A('删除线', strike && strike.textDecoration === 'STRIKETHROUGH');
  const trunc = findBy(n => n.type === 'TEXT' && /Truncated/.test(n.characters))[0];
  A('文本截断 ENDING', trunc && trunc.textTruncation === 'ENDING');

  const dash = findBy(n => n.name === 'dashed-blend-rot')[0];
  A('虚线描边存在', !!dash);
  if (dash) {
    A('描边色红', dash.strokes[0] && dash.strokes[0].color.r > 0.99 && dash.strokes[0].color.g < 0.01);
    A('描边宽 2 INSIDE', dash.strokeWeight === 2 && dash.strokeAlign === 'INSIDE');
    A('dash 节拍 [6,4]', JSON.stringify(dash.strokeDashes) === '[6,4]', JSON.stringify(dash.strokeDashes));
    A('混合模式 MULTIPLY', dash.blendMode === 'MULTIPLY', dash.blendMode);
    A('旋转 15°', dash.rotation === 15, String(dash.rotation));
    const g = dash.fills.find(f => f.type === 'GRADIENT_LINEAR');
    A('线性渐变 fill', !!g);
    if (g) {
      // 90°（左→右）：dx=1,dy=0 → 起点 M·(0,0)=(0,0.5)、终点 (1,0.5)
      const want = [[1, 0, 0], [0, 1, 0.5]];
      const got = g.gradientTransform.map(r => r.map(v => Math.round(v * 1000) / 1000));
      A('90° 渐变矩阵', JSON.stringify(got) === JSON.stringify(want), JSON.stringify(got));
      A('渐变停靠 2 个', g.gradientStops && g.gradientStops.length === 2);
    }
  }

  const al = findBy(n => n.name === 'al-row')[0];
  A('AL 容器', !!al && al.layoutMode === 'HORIZONTAL', al && al.layoutMode);
  if (al) {
    A('AL gap 12', al.itemSpacing === 12);
    A('AL padding', al.paddingTop === 8 && al.paddingLeft === 8);
    A('AL 边框 INSIDE 描边', al.strokeWeight === 1 && al.strokeAlign === 'INSIDE');
    A('AL 对齐', al.primaryAxisAlignItems === 'MIN' && al.counterAxisAlignItems === 'CENTER');
  }

  const img = findBy(n => n.type === 'RECTANGLE')[0];
  A('图片矩形', !!img);
  A('图片 fill IMAGE/FILL', img && img.fills[0] && img.fills[0].type === 'IMAGE' && img.fills[0].scaleMode === 'FILL',
    img && img.fills[0] && (img.fills[0].type + '/' + img.fills[0].scaleMode));
  A('createImageAsync 收到 data URL', calls.createImageAsync.some(u => String(u).startsWith('data:image/png;base64,MOCKDATA')));

  const iconInst = findBy(n => n.type === 'INSTANCE' && n.name !== 'ms-btn ms-btn--primary' && n.setProps === undefined)[0];
  const iconInsts = findBy(n => n.type === 'INSTANCE');
  A('图标实例化（icon:check 导入）', calls.importKey.includes('icon:check'));
  const iconInst2 = iconInsts.find(i => (i.parent && i.parent !== cell) || true);
  const paintedStroke = iconInsts.flatMap(i => findBy(n => n.type === 'VECTOR' && (n.strokes || []).length, i.children || []));
  const paintedFill = iconInsts.flatMap(i => findBy(n => n.type === 'VECTOR' && (n.fills || []).length && !(n.strokes || []).length, i.children || []));
  A('图标描边重绘为主题色', paintedStroke.some(v => v.strokes[0].color.r > 0.19 && v.strokes[0].color.r < 0.21 && v.strokes[0].color.b > 0.89));
  A('图标黑填充重绘', paintedFill.some(v => v.fills[0].color.b > 0.89 && v.fills[0].color.r > 0.19 && v.fills[0].color.r < 0.21));

  const libInsts = iconInsts.filter(i => i.componentPropertyDefinitions && 'Label#102' in i.componentPropertyDefinitions);
  const propsOf = i => i.setProps.reduce((m, p) => Object.assign(m, p), {});
  // 实例文案经 setProperties(TEXT 属性)写入，mock 不改 characters——按 payload 定位实例
  const saveInst = libInsts.find(i => propsOf(i)['Label#102'] === 'Save');
  const okInst = libInsts.find(i => propsOf(i)['Label#102'] === 'OK');
  A('库组件实例（Button set ×2）', libInsts.length === 2, 'insts=' + libInsts.length);
  A('组件集 key 走 set 专属 API', calls.importSetKey.includes('lib:btn') && calls.importKey.includes('lib:btn'),
    'setApi=' + JSON.stringify(calls.importSetKey));
  if (saveInst) {
    const payload = propsOf(saveInst);
    A('TEXT 属性写入 Save', payload['Label#102'] === 'Save', JSON.stringify(payload));
    A('token 择变体 Type=Primary', saveInst.variantProperties && saveInst.variantProperties.Type === 'Primary',
      JSON.stringify(saveInst.variantProperties));
  }
  // 颜色择变体：tok 空、col=主题蓝 → Type=Primary（用户规则：按 HTML 颜色匹配库组件变体）
  A('颜色择变体 Type=Primary', okInst && okInst.variantProperties && okInst.variantProperties.Type === 'Primary',
    okInst && JSON.stringify(okInst.variantProperties));
  if (okInst) {
    const p2 = propsOf(okInst);
    A('颜色变体写入 setProperties', p2['Type'] === 'Primary', JSON.stringify(p2));
  }

  // ---- 复合块实质库引用：标题（形状择变体）/弹窗（多文本+语义布尔）/页签栏（三层嵌套 swap）----
  const titleInst = iconInsts.find(i => i.name === 'ms-modal-title');
  A('标题库实例', !!titleInst);
  A('标题形状择变体 Plain（无开关）', titleInst && titleInst.variantProperties && titleInst.variantProperties.Type === 'Plain',
    titleInst && JSON.stringify(titleInst.variantProperties));
  A('标题 TEXT 属性覆写', titleInst && propsOf(titleInst)['标题#10'] === '导入离线包',
    titleInst && JSON.stringify(propsOf(titleInst)));
  const dlgInst = iconInsts.find(i => i.name === 'ms-mask');
  A('弹窗库实例（全页蒙版整块替换）', !!dlgInst);
  const dp = dlgInst && propsOf(dlgInst);
  A('弹窗多文本 TEXT 覆写（标题+描述）', dp && dp['标题#201'] === '确认删除？' && dp['描述#202'] === '此操作不可恢复',
    dp && JSON.stringify(dp));
  A('弹窗语义布尔保持默认（无 --danger token）', dlgInst && !(dp.Error || dp.Success || dp.Waiting || dp.Warn || dp.Info));
  const waitInst = iconInsts.filter(i => i.name === 'ms-mask')[1];
  const wp = waitInst && propsOf(waitInst);
  A('弹窗 Waiting 语义布尔（ms-spin → Waiting=true）', wp && wp.Waiting === true, wp && JSON.stringify(wp));
  // 蒙版全页铁律：resize 失败的弹窗实例保持库原生全页尺寸（1440 宽），不得缩放成局部覆盖
  const lockInst = iconInsts.filter(i => i.name === 'ms-mask')[2];
  A('弹窗 resize 失败保持原生全页宽', lockInst && lockInst.width === 1440, lockInst && String(lockInst.width));
  // 半页蒙版修复（2026-10-29 用户实测）：高帧（1800）下库实例内部蒙版不随根长高 → 强制铺满 + 卡片重居中
  const lockMaskKid = lockInst && (lockInst.children || []).find(c => c.type === 'FRAME' && (c.fills || []).some(p => p.type === 'SOLID' && p.opacity < 1));
  A('蒙版铺满高帧（1440×1800 @0,0）', !!lockInst && lockInst.height === 1800 && !!lockMaskKid && lockMaskKid.height === 1800 && lockMaskKid.y === 0 && lockMaskKid.x === 0,
    lockInst && (lockInst.width + '×' + lockInst.height + ' mask=' + (lockMaskKid && lockMaskKid.width + '×' + lockMaskKid.height + '@' + lockMaskKid.x + ',' + lockMaskKid.y)));
  const lockCard = lockMaskKid && (lockMaskKid.children || []).find(c => c.type === 'FRAME');
  A('弹窗卡片重居中（fixed 居中等价）', !!lockCard && Math.abs(lockCard.y - (1800 - lockCard.height) / 2) < 1 && Math.abs(lockCard.x - (1440 - lockCard.width) / 2) < 1,
    lockCard && (lockCard.x + ',' + lockCard.y + ' ' + lockCard.width + '×' + lockCard.height));
  // 图层级透明度蒙版（fill 不透明 + layer opacity 0.5）也要被识别并铺满——只查 FILL 会漏判
  const layopInst = iconInsts.filter(i => i.name === 'ms-mask')[3];
  const layopMaskKid = layopInst && (layopInst.children || []).find(c => c.type === 'FRAME' && c.opacity != null && c.opacity < 1);
  A('图层级透明蒙版识别铺满（1440×1800）', !!layopInst && layopInst.height === 1800 && !!layopMaskKid && layopMaskKid.height === 1800 && layopMaskKid.x === 0 && layopMaskKid.y === 0,
    layopInst && (layopInst.height + ' mask=' + (layopMaskKid && layopMaskKid.width + '×' + layopMaskKid.height)));
  const layopTexts = layopInst ? (function flat(nd) { let o = []; (nd.children || []).forEach(c => { if (c.type === 'TEXT') o.push(c.characters); o = o.concat(flat(c)); }); return o; })(layopInst) : [];
  A('图层级蒙版弹窗文案改写', layopTexts.join('|') === '上传固件|Uploading 40%|Cancel', layopTexts.join('|'));
  A('蒙版铺满计数入通知（4 实例）', /蒙版铺满 4/.test(String((calls.notify.find(t => t.indexOf('导入完成') === 0) || ''))),
    String(calls.notify.find(t => t.indexOf('导入完成') === 0)));
  const tabsInst = iconInsts.find(i => i.name === 'bc-eg71-page-tabs');
  A('页签栏库实例', !!tabsInst);
  if (tabsInst) {
    const topInner = findByNameM(tabsInst, /tabs-top/i);
    A('嵌套 Tabs-Top swap 到 Item=2', topInner && topInner.variantProperties && topInner.variantProperties['Item 数量'] === '2',
      topInner && JSON.stringify(topInner.variantProperties));
    const tabKids = topInner ? topInner.children.filter(c => /^tab$/i.test(String(c.name))) : [];
    A('Tab 实例 ×2（active/inactive 择变体）',
      tabKids.length === 2 && tabKids[0].variantProperties['Selecte 选择'] === 'true' && tabKids[1].variantProperties['Selecte 选择'] === 'false',
      tabKids.map(t4 => JSON.stringify(t4.variantProperties)).join(','));
    const tabTexts = tabKids.map(t4 => { const tt = findFirstTextM(t4); return tt ? tt.characters : null; });
    A('Tab 文案覆写 = 设备/固件', tabTexts.join('|') === '设备|固件', tabTexts.join('|'));
    A('辅助组件集导入（tabs-top/tab 走 set API）',
      calls.importSetKey.includes('lib:tabs-top') && calls.importSetKey.includes('lib:tab'), JSON.stringify(calls.importSetKey));
  }
  const doneMsg0 = calls.notify.find(t => t.indexOf('导入完成') === 0);
  A('通知含形状择变体计数', doneMsg0 && /形状择变体/.test(doneMsg0), doneMsg0);
  A('通知含嵌套 swap 计数', doneMsg0 && /嵌套实例 swap/.test(doneMsg0), doneMsg0);

  // ---- 动态找库组件（2026-10-29）：key 轮换按名找回 + 未映射原子控件词干命中 ----
  A('库目录已拉取（getTeamLibraryAsync）', calls.teamLib >= 1, 'teamLib=' + calls.teamLib);
  const dynSw = iconInsts.find(i => i.name === 'ms-switch ms-switch--sm');
  A('未映射 ms-* 词干动态命中 Switch', !!dynSw && propsOf(dynSw)['Label#301'] === 'On',
    dynSw && JSON.stringify(propsOf(dynSw)));
  const dynTitle = iconInsts.find(i => i.name === 'ms-modal-title2');
  A('key 轮换按名找回标题库（lib:stale→lib:title）', !!dynTitle && propsOf(dynTitle)['标题#10'] === '离线恢复',
    dynTitle && JSON.stringify(propsOf(dynTitle)));
  A('stale key 双 API 均试过', calls.importKey.includes('lib:stale') && calls.importSetKey.includes('lib:stale'),
    'k=' + calls.importKey.includes('lib:stale') + '/s=' + calls.importSetKey.includes('lib:stale'));
  A('动态命中计数入通知', doneMsg0 && /库目录动态命中/.test(doneMsg0), doneMsg0);

  // ---- 双语词干命中（2026-10-29 用户实测「组件库很多没有匹配上」）----
  const dynCrumb = iconInsts.find(i => i.name === 'ms-breadcrumb');
  A('路径前缀组件名末段归一命中（ms-breadcrumb → 2 Navigation/1 Breadcrumb）',
    !!dynCrumb && propsOf(dynCrumb)['Label#401'] === 'Home / Devices',
    dynCrumb && JSON.stringify(propsOf(dynCrumb)));
  const dynNav = iconInsts.find(i => i.name === 'ms-header');
  const navText = dynNav && (dynNav.children || []).filter(c => c.type === 'TEXT').map(c => c.characters).join('|');
  A('中文组件名词干桥接命中（ms-header → 导航栏）', !!dynNav && navText === '导航',
    dynNav && navText);

  // ---- 实例文案全量改写（2026-10-29 用户规则）：无 TEXT 属性组件 → 嵌套文本层逐层回填 + 文字色按 HTML ----
  const statInst = iconInsts.find(i => i.name === 'ms-stat');
  const statTexts = statInst ? (statInst.children || []).filter(c => c.type === 'TEXT').map(c => c.characters) : [];
  A('无 TEXT 属性组件逐层文案回填（不只首层）', statTexts.join('|') === '24|在线设备', statTexts.join('|'));
  const statCol = statInst && (statInst.children || []).find(c => c.type === 'TEXT');
  A('回填层文字色按 HTML 覆盖', !!statCol && statCol.fills[0] && statCol.fills[0].color.b > 0.89
    && statCol.fills[0].color.r > 0.19 && statCol.fills[0].color.r < 0.21,
    statCol && statCol.fills[0] && JSON.stringify(statCol.fills[0].color));

  // ---- 颜色令牌绑定（2026-10-30 契约）：实色绑库 Color Token 变量，不新建裸色值 ----
  A('变量按 key 导入（importVariableByKeyAsync）',
    calls.importVarKey.includes('v:text') && calls.importVarKey.includes('v:icon') && calls.importVarKey.includes('v:fill'),
    JSON.stringify(calls.importVarKey));
  A('文本 fill 绑 text 变量', ital && ital.fills[0] && ital.fills[0].boundVariables && ital.fills[0].boundVariables.color
    && ital.fills[0].boundVariables.color.id === V_TEXT.id, ital && JSON.stringify(ital.fills[0].boundVariables));
  A('图标描边绑 icon 变量（STROKE）', paintedStroke.some(v => v.strokes[0].boundVariables && v.strokes[0].boundVariables.color
    && v.strokes[0].boundVariables.color.id === V_ICON.id));
  A('图标黑填充绑 icon 变量（SHAPE_FILL）', paintedFill.some(v => v.fills[0].boundVariables && v.fills[0].boundVariables.color
    && v.fills[0].boundVariables.color.id === V_ICON.id));
  const dashSolid = dash && dash.fills.find(f => f.type === 'SOLID');
  A('帧实色 fill 绑 fill 变量（FRAME_FILL）', dashSolid && dashSolid.boundVariables && dashSolid.boundVariables.color
    && dashSolid.boundVariables.color.id === V_FILL.id,
    dashSolid && JSON.stringify(dashSolid.boundVariables));
  A('入队描边异步绑定（dashed stk）', dash && dash.strokes[0] && dash.strokes[0].boundVariables
    && dash.strokes[0].boundVariables.color && dash.strokes[0].boundVariables.color.id === V_RED.id,
    dash && JSON.stringify(dash.strokes[0].boundVariables));
  A('AL 边框入队绑定（al.btk）', al && al.strokes[0] && al.strokes[0].boundVariables
    && al.strokes[0].boundVariables.color && al.strokes[0].boundVariables.color.id === V_BORDER.id,
    al && JSON.stringify(al.strokes[0].boundVariables));
  A('lib 文本 ttoks 绑变量', statCol && statCol.fills[0] && statCol.fills[0].boundVariables
    && statCol.fills[0].boundVariables.color && statCol.fills[0].boundVariables.color.id === V_ICON.id,
    statCol && JSON.stringify(statCol.fills[0].boundVariables));
  const k1n = findBy(n => n.name === 'k1')[0];
  A('scope 错配跳过（TEXT_FILL 变量不绑帧 fill）', k1n && !k1n.fills[0].boundVariables && k1n.fills[0].color.r > 0.79,
    k1n && JSON.stringify(k1n.fills[0]));
  const k2n = findBy(n => n.name === 'k2')[0];
  A('读回漂移回退裸色（库值≠demo 色）', k2n && !k2n.fills[0].boundVariables && k2n.fills[0].color.r > 0.69 && k2n.fills[0].color.r < 0.71,
    k2n && JSON.stringify(k2n.fills[0]));
  A('变量导入失败回退裸色（无效 key）', strike && !strike.fills[0].boundVariables && calls.importVarKey.includes('v:missing'));
  A('令牌绑定计数入通知（7）', doneMsg0 && /令牌绑定 7/.test(doneMsg0), doneMsg0);

  A('def 组件 ×2', figma.currentPage.children[0].children.filter(n => n.type === 'COMPONENT' || n.type === 'COMPONENT_SET').length >= 0 && calls.combineAsVariants.length >= 1,
    'combine=' + JSON.stringify(calls.combineAsVariants));
  A('inst 引用实例化', findBy(n => n.type === 'INSTANCE' && n.variantProperties && n.variantProperties.Size).length >= 1);
  A('svg 矢量节点', findBy(n => n.type === 'FRAME' && (n.name === 'svg' || n.name === 's')).length >= 1);

  // 原型连线：rct 节点 → reactions 指向目标态画板
  const cell2 = board && board.children.find(c => c.name === '2. 危险确认');
  A('目标态画板存在', !!cell2);
  const al2 = findBy(n => n.name === 'al-row')[0];
  const rx = al2 && al2.reactions && al2.reactions[0];
  A('reactions 挂载', !!rx, al2 && JSON.stringify(al2.reactions));
  A('触发器 ON_CLICK', rx && rx.trigger.type === 'ON_CLICK');
  A('动作 NODE/NAVIGATE → 目标画板', rx && rx.action.type === 'NODE' && rx.action.navigation === 'NAVIGATE' && cell2 && rx.action.destinationId === cell2.id,
    rx && (rx.action.type + '/' + rx.action.destinationId + ' vs ' + (cell2 && cell2.id)));

  // ---- 跨导入复用（2026-10-29）：同名同尺寸重复块 → 引用既有组件，不重复创建 ----
  const combineBefore = calls.combineAsVariants.length;
  const compCountBefore = (function cnt(nd) {
    let n = (nd.type === 'COMPONENT' || nd.type === 'COMPONENT_SET') ? 1 : 0;
    (nd.children || []).forEach(c => { n += cnt(c); });
    return n;
  })(figma.currentPage);
  await handler({ type: 'scene', json: JSON.parse(JSON.stringify(SCENE)) });
  const boards = figma.currentPage.children.filter(n => n.type === 'FRAME' && /MockTest/.test(n.name) && !/组件定义/.test(n.name));
  const compCountAfter = (function cnt(nd) {
    let n = (nd.type === 'COMPONENT' || nd.type === 'COMPONENT_SET') ? 1 : 0;
    (nd.children || []).forEach(c => { n += cnt(c); });
    return n;
  })(figma.currentPage);
  A('二次导入出第二画板', boards.length === 2, 'boards=' + boards.length);
  const doneMsg2 = calls.notify.filter(t => t.indexOf('导入完成') === 0).pop();
  A('二次导入复用既有 2（不新建）', doneMsg2 && /复用既有 2/.test(doneMsg2), doneMsg2);
  A('组件总数不增（重复块未重建）', compCountAfter === compCountBefore,
    compCountBefore + ' → ' + compCountAfter);
  A('复用时不再 combineAsVariants', calls.combineAsVariants.length === combineBefore,
    'combine=' + JSON.stringify(calls.combineAsVariants));

  const doneMsg = calls.notify.find(t => t.indexOf('导入完成') === 0);
  A('完成通知', !!doneMsg, calls.notify.join(' | '));
  if (doneMsg) console.log('  通知: ' + doneMsg);

  console.log('\n=== figma-mock: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('✗ harness 异常:', e); process.exit(1); });
