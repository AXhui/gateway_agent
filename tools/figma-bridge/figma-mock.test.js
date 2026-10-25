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
    inst.setProperties = p => { inst.setProps.push(p); };
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
})();

// ---------- mock figma ----------
const calls = { importKey: [], importSetKey: [], createImageAsync: [], combineAsVariants: [], notify: [], fonts: new Set(), closePlugin: 0 };
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
  currentPage: new FNode('PAGE', { name: 'Page 1' }),
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
  cells: [{
    label: '1. 默认态', x: 0, y: 0, w: 1440, h: 900,
    root: {
      t: 'f', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 0, w: 1440, h: 900, o: 1, ch: [
        T('Italic Underline', { it: 1, td: 'u', fw: 500 }),
        T('Strike Text', { td: 's' }),
        T('Truncated long text', { tr: 1 }),
        { t: 'f', n: 'dashed-blend-rot', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 60, w: 200, h: 60, o: 1, rot: 15, bm: 'multiply',
          stk: { w: 2, c: [1, 0, 0], a: 1, dash: 'dashed' },
          bg: [{ k: 'l', ang: 90, stops: [{ c: [0.1, 0.4, 0.9], a: 1, p: 0 }, { c: [0.9, 0.2, 0.2], a: 1, p: 1 }] }], ch: [] },
        { t: 'f', n: 'al-row', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 140, w: 300, h: 40, o: 1,
          rct: [{ to: 1, tg: 'ON_CLICK' }],
          al: { dir: 'row', gap: 12, just: 'MIN', align: 'CENTER', pt: 8, pr: 8, pb: 8, pl: 8, bw: 1, bc: [0, 0, 0], ba: 1 },
          ch: [{ t: 'f', n: 'k1', f: [{ c: [0.8, 0.8, 0.8], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 8, y: 8, w: 50, h: 24, o: 1, ch: [] },
               { t: 'f', n: 'k2', f: [{ c: [0.7, 0.7, 0.7], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 70, y: 8, w: 50, h: 24, o: 1, ch: [] }] },
        { t: 'img', src: 'data:image/png;base64,MOCKDATA', x: 0, y: 200, w: 120, h: 80, o: 1, fit: 'cover', r: { tl: 8, tr: 8, br: 8, bl: 8 } },
        { t: 'ic', k: 'icon:check', f: 'icon/check', svg: '<svg viewBox="0 0 24 24"></svg>', x: 0, y: 300, w: 16, h: 16, o: 1, col: [0.2, 0.4, 0.9] },
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
        { t: 'f', n: 'ms-mask', f: [{ c: [0.15, 0.18, 0.23], a: 0.5 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 540, w: 1440, h: 900, o: 1,
          lib: { k: 'lib:dialog-lock', f: '弹窗', cls: 'ms-mask', tok: [], texts: ['Lock', 'Locked', 'OK'] },
          ch: [{ t: 'f', n: 'ms-modal', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 8, tr: 8, br: 8, bl: 8 }, clip: false, x: 512, y: 390, w: 416, h: 160, o: 1,
            ch: [T('Lock'), T('Locked'), T('OK')] }] },
        { t: 'f', n: 'bc-eg71-page-tabs', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 600, w: 1220, h: 48, o: 1,
          lib: { k: 'lib:tabs', f: 'Tabs/Top', cls: 'bc-eg71-page-tabs', tok: [], sw: false,
            tabs: [{ text: '设备', active: true }, { text: '固件', active: false }],
            aux: { top: { figmaName: 'Components/Tabs-Top', key: 'lib:tabs-top' }, tab: { figmaName: 'Components/Tab', key: 'lib:tab' } } },
          ch: [T('设备'), T('固件')] },
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

  const doneMsg = calls.notify.find(t => t.indexOf('导入完成') === 0);
  A('完成通知', !!doneMsg, calls.notify.join(' | '));
  if (doneMsg) console.log('  通知: ' + doneMsg);

  console.log('\n=== figma-mock: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('✗ harness 异常:', e); process.exit(1); });
