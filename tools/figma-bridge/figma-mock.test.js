#!/usr/bin/env node
// figma-mock.test.js — 离线验证插件 code.js 全流水线（10 轮保真验证的插件层度量仪）。
// 原理：mock figma API（节点工厂/字体/库导入/图片/变体合并）→ vm 跑 ~/Desktop/html-to-figma-internal/code.js
// → 灌入覆盖全能力的合成 scene → 断言文本修饰/描边/混合/旋转/渐变/图片/AL/图标/库实例/组件变体。
// 用法: node figma-mock.test.js

const fs = require('fs'), path = require('path'), os = require('os'), vm = require('vm');

// ---------- mock 节点 ----------
let NODE_SEQ = 0;
const REMOVED = []; // remove() 全量登记（svgCache 原型清场断言用）
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
  // 对齐真 API（mock 校准纪律，2026-10-31 五轮 REQ-020 实测）：给既有 frame 开 AL，主轴 sizing 落
  // hug（AUTO）并立即收缩到内容+padding——蒙版 1440→468、弹窗 foot 372→71.48 的根因复刻；此后显式
  // FIXED 不回弹尺寸，必须再 resize 才恢复（插件 sizing-first + 终态 resize 即为此）。副轴 hug 不模拟
  //（无缺陷证据，保 mock 最小）——red 靶：AL-hug 用例在此模拟下无插件修复必红。
  set layoutMode(v) {
    const was = this._layoutMode;
    this._layoutMode = v;
    if (v && v !== 'NONE' && (!was || was === 'NONE')) { this._ps = 'AUTO'; this._cs = 'AUTO'; this._hug(); }
  }
  get layoutMode() { return this._layoutMode; }
  set primaryAxisSizingMode(v) { this._ps = v; }
  get primaryAxisSizingMode() { return this._ps; }
  set counterAxisSizingMode(v) { this._cs = v; }
  get counterAxisSizingMode() { return this._cs; }
  set itemSpacing(v) { this._sp = v; if (this._ps === 'AUTO') this._hug(); }
  get itemSpacing() { return this._sp; }
  set paddingTop(v) { this._pt = v; if (this._ps === 'AUTO') this._hug(); }
  get paddingTop() { return this._pt; }
  set paddingBottom(v) { this._pb = v; if (this._ps === 'AUTO') this._hug(); }
  get paddingBottom() { return this._pb; }
  set paddingLeft(v) { this._pl = v; if (this._ps === 'AUTO') this._hug(); }
  get paddingLeft() { return this._pl; }
  set paddingRight(v) { this._pr = v; if (this._ps === 'AUTO') this._hug(); }
  get paddingRight() { return this._pr; }
  _hug() {
    if (!this._layoutMode || this._layoutMode === 'NONE' || !this.children || !this.children.length) return;
    const horiz = this._layoutMode === 'HORIZONTAL';
    const pad = (horiz ? (this._pl || 0) + (this._pr || 0) : (this._pt || 0) + (this._pb || 0));
    const len = this.children.reduce((s, c) => s + (horiz ? c.width : c.height), 0) + (this._sp || 0) * Math.max(0, this.children.length - 1) + pad;
    if (horiz) this._w = len; else this._h = len;
  }
  // 对齐真 API 枚举（官方手册 2026-10-31 developers.figma.com + mock 校准纪律）：
  // counterAxisAlignItems 只收 MIN|MAX|CENTER|BASELINE——赋 STRETCH 必抛；stretch 语义在子节点
  // layoutAlign（枚举含 STRETCH）。此前 mock 宽松收下 STRETCH，plugin 抛错被外层 catch 吞掉后
  // 终态 resize 一并跳过 → AL-hug 冻结（REQ-020 footer 71.48 根因），绿灯掩盖全灭。
  set counterAxisAlignItems(v) { if (!['MIN', 'MAX', 'CENTER', 'BASELINE'].includes(v)) throw new Error('cannot set counterAxisAlignItems: ' + v); this._cai = v; }
  get counterAxisAlignItems() { return this._cai; }
  set primaryAxisAlignItems(v) { if (!['MIN', 'MAX', 'CENTER', 'SPACE_BETWEEN', 'SPACE_EVENLY', 'SPACE_AROUND'].includes(v)) throw new Error('cannot set primaryAxisAlignItems: ' + v); this._pai = v; }
  get primaryAxisAlignItems() { return this._pai; }
  set layoutAlign(v) { if (!['MIN', 'CENTER', 'MAX', 'STRETCH', 'INHERIT'].includes(v)) throw new Error('cannot set layoutAlign: ' + v); this._la = v; }
  get layoutAlign() { return this._la; }
  // 对齐真 API：绝对变换（沿父链累加 x/y，忽略旋转——fix 提升换算用）
  get absoluteTransform() {
    let tx = this.x, ty = this.y, p = this.parent;
    while (p) { tx += p.x; ty += p.y; p = p.parent; }
    return [[1, 0, tx], [0, 1, ty], [0, 0, 1]];
  }
  appendChild(ch) {
    if (ch.parent) ch.parent.children = ch.parent.children.filter(c => c !== ch);
    ch.parent = this; this.children.push(ch); return ch;
  }
  remove() { REMOVED.push(this); if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this); this.parent = null; }
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
      // 对齐真 API（mock 校准纪律）：TEXT 属性按绑定层 componentPropertyReferences.characters 定位写入，
      // 未绑 references 的（手搭 mock 组件）退回 defaultValue 定位——实例文案回填的 used 过滤依赖
      // characters 已被 setProperties 更新这一真行为
      Object.entries(p).forEach(([k2, v]) => {
        const d = (inst.componentPropertyDefinitions || {})[k2];
        if (!d || d.type !== 'TEXT') return;
        const hit = [];
        (function fr(nd) { (nd.children || []).forEach(c => { if (hit.length) return; if (c.type === 'TEXT' && c.componentPropertyReferences && c.componentPropertyReferences.characters === k2) hit.push(c); else fr(c); }); })(inst);
        if (!hit[0]) {
          (function ft(nd) { (nd.children || []).forEach(c => { if (hit.length) return; if (c.type === 'TEXT' && c.characters === d.defaultValue) hit.push(c); else ft(c); }); })(inst);
        }
        if (hit[0]) hit[0].characters = v;
      });
    };
    return inst;
  }
  setProperties(p) { (this.setProps = this.setProps || []).push(p); }
  // 对齐真 API：组件上暴露 TEXT 属性（返回属性名，值写进绑定层的 componentPropertyReferences）
  addComponentProperty(name, type, defaultValue) {
    this.componentPropertyDefinitions = this.componentPropertyDefinitions || {};
    let pname = String(name), i = 2;
    while (Object.keys(this.componentPropertyDefinitions).includes(pname)) pname = String(name) + ' ' + i++;
    this.componentPropertyDefinitions[pname] = { type, defaultValue };
    return pname;
  }
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
  // 2026-10-31 像素审计回归靶：①Tab 项包在 'tabs group' 帧里（真库结构——旧 w8 跳过名字含 tabs 的子树，
  // tabKids 收空 → Tab 文案全 "Tab"）；②Top 带 More 更多 轴（旧逻辑不约束 → more 按钮残影）；
  // ③Tab 带 Icon/ShowSelect 轴（旧逻辑不约束 → 图标/chevron 泄漏）
  const mkTabComp = (sel, icon, ssel) => {
    const c = new FNode('COMPONENT', { name: 'Selecte=' + sel + ', Icon=' + icon + ', ShowSelect=' + ssel, width: 100, height: 48 });
    c.variantProperties = { 'Selecte 选择': sel, 'Size 尺寸': 'medium', 'Icon 图标': icon, 'ShowSelect 下拉': ssel };
    c.appendChild(mkText('Tab'));
    if (icon === 'true') c.appendChild(new FNode('VECTOR', { name: 'icon', width: 16, height: 16 }));
    if (ssel === 'true') c.appendChild(new FNode('VECTOR', { name: 'chevron-down', width: 16, height: 16 }));
    return c;
  };
  const tabSet = new FNode('COMPONENT_SET', { name: 'Components/Tab', width: 100, height: 48 });
  ['true', 'false'].forEach(sel => ['true', 'false'].forEach(ic => ['true', 'false'].forEach(ss =>
    tabSet.appendChild(mkTabComp(sel, ic, ss)))));
  const mkTabsTopComp = (n2, more) => {
    const c = new FNode('COMPONENT', { name: 'Item 数量=' + n2 + (more ? ', More=true' : ''), width: 100 * n2 + 24, height: 48 });
    c.variantProperties = { 'Item 数量': String(n2), 'Size 尺寸': 'medium', 'Icon 图标': 'false', 'More 更多': more ? 'true' : 'false' };
    const grp = new FNode('FRAME', { name: 'tabs group', width: 100 * n2, height: 48 });
    for (let i = 0; i < n2; i++) {
      const ti = new FNode('INSTANCE', { name: 'Tab', width: 100, height: 48, x: i * 100 });
      // 真结构（2026-10-31 三轮校准）：嵌套实例挂 mainComponent——真 API 有、mock clone 不带；
      // 插件按 mainComponent 所属集合识别 tab 项（库重发布后图层名可能不再是 'tab'）
      ti.mainComponent = tabSet.children[tabSet.children.length - 1];
      grp.appendChild(ti);
    }
    c.appendChild(grp);
    // 真库形态（2026-10-31 审计实测）：被选变体自身携带 more 按钮，无轴可关 → 靠 hideMore 藏
    c.appendChild(new FNode('INSTANCE', { name: 'more button', width: 24, height: 48, x: 100 * n2 }));
    return c;
  };
  const tabsTopSet = new FNode('COMPONENT_SET', { name: 'Components/Tabs-Top', width: 200, height: 48 });
  // more=true 的 cnt=2 排在前面：旧逻辑（不约束 More 轴）会先命中它——回归陷阱
  tabsTopSet.appendChild(mkTabsTopComp(2, true)); tabsTopSet.appendChild(mkTabsTopComp(2)); tabsTopSet.appendChild(mkTabsTopComp(3));
  tabsTopSet.componentPropertyDefinitions = {
    'Item 数量': { type: 'VARIANT', variantOptions: ['2', '3'], defaultValue: '2' },
    'Icon 图标': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'false' },
    'More 更多': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'true' },
  };
  const tabsComp = new FNode('COMPONENT', { name: 'Tabs/Top', width: 1220, height: 48 });
  const innerTop = new FNode('INSTANCE', { name: 'Components/Tabs-Top', width: 200, height: 48 });
  // 真结构（2026-10-31 三轮校准）：嵌套实例挂 mainComponent——真 API 有、mock clone 不带；
  // 插件按 mainComponent 所属集合识别 inner（真库重发布后该层图层名已不是 'Tabs-Top'，按名查找落空 → swap 静默退出）
  innerTop.mainComponent = tabsTopSet.children[0];
  tabsComp.appendChild(innerTop);
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

  // 证据裁决靶子（2026-10-31 像素审计缺陷 E/F）：icon 类 VARIANT 轴，HTML 块无矢量子节点（ic=false）
  // → 必须择 Icon=false 变体；默认值故意设 'true'（default Add 图标泄漏复刻）
  const tagxSet = new FNode('COMPONENT_SET', { name: 'Tag 标签X', width: 60, height: 24 });
  tagxSet.componentPropertyDefinitions = { 'Icon 图标': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'true' } };
  ['true', 'false'].forEach(ic => {
    const c = new FNode('COMPONENT', { name: 'Icon=' + ic, width: 60, height: 24 });
    c.variantProperties = { 'Icon 图标': ic };
    c.appendChild(mkText('Tag'));
    if (ic === 'true') c.appendChild(new FNode('VECTOR', { name: 'chevron-down-big', width: 12, height: 12 }));
    tagxSet.appendChild(c);
  });
  MOCK_LIBS.set('lib:tagx', tagxSet);

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

  // 属性定义序≠视觉序靶子（2026-10-31 文字错位根因）：BTN 属性定义在前、TITLE 在后，
  // 视觉上 TITLE 层在上（y=0）、BTN 在下（y=40）——按定义序消费 texts 会标题/按钮互换
  const ordComp = new FNode('COMPONENT', { name: 'TitleButton', width: 200, height: 80 });
  const ordTitle = mkText('Title'); ordTitle.y = 0;
  const ordBtn = mkText('Button'); ordBtn.y = 40;
  ordComp.appendChild(ordTitle); ordComp.appendChild(ordBtn);
  ordComp.componentPropertyDefinitions = {
    'BTN#501': { type: 'TEXT', defaultValue: 'Button' },
    'TITLE#502': { type: 'TEXT', defaultValue: 'Title' },
  };
  MOCK_LIBS.set('lib:swap-order', ordComp);

  // setProperties 自愈靶子（2026-10-31）：库重发布后 defaultValue 漂移（层里 '旧默认' ≠ 属性默认 'New Default'），
  // 属性写不进绑定层（mock/真库按 defaultValue 定位）→ 写后回读校验须 overrideText 兜底，文案不得丢
  const driftComp = new FNode('COMPONENT', { name: 'Drift', width: 120, height: 24 });
  driftComp.appendChild(mkText('旧默认'));
  driftComp.componentPropertyDefinitions = { 'Label#601': { type: 'TEXT', defaultValue: 'New Default' } };
  MOCK_LIBS.set('lib:drift', driftComp);

  // 表达力守卫靶子（2026-10-31「缺失很严重」根因）：demo 6 段文案 vs 库组件仅 1 个文本层——
  // 硬替换丢 5 段 → 必须回退整块本地重绘，6 段全部落图、不产生该库实例
  const tinyComp = new FNode('COMPONENT', { name: 'Tiny', width: 100, height: 20 });
  tinyComp.appendChild(mkText('A'));
  MOCK_LIBS.set('lib:tiny', tinyComp);

  // 图标槽换装 + 视觉复核重选靶子（2026-10-31 按钮输入框转化修复）：
  // Ghost 变体无主导填充色 → 颜色择变体 dists<2 不判、tok 空 → 轴裁决全不判 → 默认 Ghost（无填充）
  // 落图与 demo 蓝底背离 → 视觉复核换 Filled 重建；Filled 内嵌 16px 图标槽 INSTANCE（默认 Add），
  // lib.icnk 换装后指向 demo 真实图标（「Delete 永远挂库默认 Add 图标」复刻）
  const addIcon = mkIconComp('add'); MOCK_LIBS.set('icon:add', addIcon);
  const trashIcon = mkIconComp('trash'); MOCK_LIBS.set('icon:trash', trashIcon);
  const searchIcon = mkIconComp('search'); MOCK_LIBS.set('icon:search-x', searchIcon); // 目录名 icon/search，key 故意不等名——按名兜底只能走目录
  const mkBtnIc = type => {
    const c = new FNode('COMPONENT', { name: 'Type=' + type, width: 88, height: 32 });
    c.variantProperties = { Type: type };
    c.componentPropertyDefinitions = {
      Type: { type: 'VARIANT', variantOptions: ['Filled', 'Ghost'], defaultValue: 'Ghost' },
      'Label#701': { type: 'TEXT', defaultValue: 'Button' },
    };
    if (type === 'Filled') {
      c.fills = [{ type: 'SOLID', color: { r: 0.2, g: 0.4, b: 0.9 } }];
      // 图标槽只进 Filled：Ghost 保持全树无填充——dominantFill 深扫也不得见色（否则颜色择变体
      // 直接判 Filled，视觉复核路径测不到）
      const slot = new FNode('INSTANCE', { name: '1 Basic/1 Icon/Add', width: 16, height: 16 });
      slot.mainComponent = addIcon;
      c.appendChild(slot);
    }
    c.appendChild(mkText('Button'));
    return c;
  };
  const btnIcSet = new FNode('COMPONENT_SET', { name: 'ButtonIC', width: 88, height: 32 });
  btnIcSet.appendChild(mkBtnIc('Ghost')); btnIcSet.appendChild(mkBtnIc('Filled'));
  btnIcSet.componentPropertyDefinitions = { Type: { type: 'VARIANT', variantOptions: ['Filled', 'Ghost'], defaultValue: 'Ghost' } };
  MOCK_LIBS.set('lib:btn-ic', btnIcSet);

  // shape 门控靶子（2026-10-31「Delete 文字 12px」根因）：Small 88×32 / Large 120×40 几何不同 +
  // 宽 HTML 块（200×40，宽高比 5.0 更贴 Large 3.0）——旧逻辑 texts 单段也跑形状打分按宽高比误裁
  // Size=Large；新门控（单段文本不跑形状）保持默认 Small
  const btnWSet = new FNode('COMPONENT_SET', { name: 'ButtonW', width: 88, height: 32 });
  [['Small', 88, 32], ['Large', 120, 40]].forEach(([sz, w2, h2]) => {
    const c = new FNode('COMPONENT', { name: 'Size=' + sz, width: w2, height: h2 });
    c.variantProperties = { Size: sz };
    c.componentPropertyDefinitions = {
      Size: { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' },
      'Label#702': { type: 'TEXT', defaultValue: 'Button' },
    };
    c.appendChild(mkText('Button'));
    btnWSet.appendChild(c);
  });
  btnWSet.componentPropertyDefinitions = { Size: { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' } };
  MOCK_LIBS.set('lib:btn-w', btnWSet);

  // 主题轴 token 优先级靶子（2026-10-31 四轮）：裸类兜底 token（strock）排修饰 token（primary）之后——
  // pickVariantValue 按 token 序消费；此前按选项序遍历，兜底会压过修饰语义
  const btnThemeSet = new FNode('COMPONENT_SET', { name: 'ButtonTheme', width: 80, height: 32 });
  ['Primary', 'Strock', 'Text'].forEach(th => {
    const c = new FNode('COMPONENT', { name: 'Theme=' + th, width: 80, height: 32 });
    c.variantProperties = { Theme: th };
    c.componentPropertyDefinitions = { Theme: { type: 'VARIANT', variantOptions: ['Primary', 'Strock', 'Text'], defaultValue: 'Primary' }, 'Label#705': { type: 'TEXT', defaultValue: 'Btn' } };
    c.appendChild(mkText('Btn'));
    btnThemeSet.appendChild(c);
  });
  btnThemeSet.componentPropertyDefinitions = { Theme: { type: 'VARIANT', variantOptions: ['Primary', 'Strock', 'Text'], defaultValue: 'Primary' } };
  MOCK_LIBS.set('lib:btn-theme', btnThemeSet);

  // tag 双轴靶子（2026-10-31 四轮）：种类×theme 同时裁决——tinted tag 必须 Light background+theme；
  // 单值 token 只判 theme、种类落默认 deep background → 深底配同色文字不可见（实测「待分配」根因）
  const tagKindSet = new FNode('COMPONENT_SET', { name: 'Tag 标签双色', width: 60, height: 24 });
  [['deep background', 'default'], ['Light background', 'primary'], ['Light background', 'default'], ['outline', 'default']].forEach(pr => {
    const c = new FNode('COMPONENT', { name: '种类=' + pr[0] + ', theme=' + pr[1], width: 60, height: 24 });
    c.variantProperties = { '种类': pr[0], theme: pr[1] };
    c.appendChild(mkText('Tag'));
    tagKindSet.appendChild(c);
  });
  tagKindSet.componentPropertyDefinitions = {
    '种类': { type: 'VARIANT', variantOptions: ['deep background', 'Light background', 'light outline', 'outline'], defaultValue: 'deep background' },
    theme: { type: 'VARIANT', variantOptions: ['default', 'primary', 'warning', 'danger', 'success'], defaultValue: 'default' },
  };
  MOCK_LIBS.set('lib:tag-kind', tagKindSet);

  // 高度平局靶子（2026-10-31 四轮）：两变体同高不同宽——高度平局不判 + 单段文本不跑形状 → 保持默认 Small
  const btnTieSet = new FNode('COMPONENT_SET', { name: 'ButtonTie', width: 88, height: 32 });
  [['Small', 88], ['Large', 120]].forEach(([sz, w3]) => {
    const c = new FNode('COMPONENT', { name: 'Size=' + sz, width: w3, height: 32 });
    c.variantProperties = { Size: sz };
    c.componentPropertyDefinitions = { Size: { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' }, 'Label#706': { type: 'TEXT', defaultValue: 'Btn' } };
    c.appendChild(mkText('Btn'));
    btnTieSet.appendChild(c);
  });
  btnTieSet.componentPropertyDefinitions = { Size: { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' } };
  MOCK_LIBS.set('lib:btn-tie', btnTieSet);

  // 纯图标按钮靶子（2026-10-31 五轮，REQ-020 操作列「图标钮变 Label 文字钮」根因）：
  // Strock+S 带图标槽、Strock+M 纯文字（同轴都合法）——demo 有图标无文字 → 必须择带槽变体 + 换装 + 藏 Label；
  // lib:btn-noic 全家族无图标槽 → 整块回退本地重绘（图标仍走库实例）
  const addIo = mkIconComp('add2'); MOCK_LIBS.set('icon:add2', addIo);
  const mkBtnIO = (sz, withSlot) => {
    const c = new FNode('COMPONENT', { name: 'Theme=Strock, Size=' + sz, width: 60, height: 28 });
    c.variantProperties = { Theme: 'Strock', Size: sz };
    c.componentPropertyDefinitions = { Theme: { type: 'VARIANT', variantOptions: ['Strock'], defaultValue: 'Strock' }, Size: { type: 'VARIANT', variantOptions: ['S', 'M'], defaultValue: 'M' }, 'Label#801': { type: 'TEXT', defaultValue: 'Label' } };
    if (withSlot) { const slot = new FNode('INSTANCE', { name: '1 Basic/1 Icon/Add', width: 16, height: 16 }); slot.mainComponent = addIo; c.appendChild(slot); }
    c.appendChild(mkText('Label'));
    return c;
  };
  const btnIOSet = new FNode('COMPONENT_SET', { name: 'ButtonIO', width: 60, height: 28 });
  btnIOSet.appendChild(mkBtnIO('M', false)); btnIOSet.appendChild(mkBtnIO('S', true));
  btnIOSet.componentPropertyDefinitions = { Theme: { type: 'VARIANT', variantOptions: ['Strock'], defaultValue: 'Strock' }, Size: { type: 'VARIANT', variantOptions: ['S', 'M'], defaultValue: 'M' } };
  MOCK_LIBS.set('lib:btn-io', btnIOSet);
  const mkBtnNO = sz => {
    const c = new FNode('COMPONENT', { name: 'Theme=Strock, Size=' + sz, width: 60, height: 28 });
    c.variantProperties = { Theme: 'Strock', Size: sz };
    c.componentPropertyDefinitions = { Theme: { type: 'VARIANT', variantOptions: ['Strock'], defaultValue: 'Strock' }, Size: { type: 'VARIANT', variantOptions: ['S', 'M'], defaultValue: 'M' }, 'Label#802': { type: 'TEXT', defaultValue: 'Label' } };
    c.appendChild(mkText('Label'));
    return c;
  };
  const btnNOSet = new FNode('COMPONENT_SET', { name: 'ButtonNO', width: 60, height: 28 });
  btnNOSet.appendChild(mkBtnNO('M')); btnNOSet.appendChild(mkBtnNO('S'));
  btnNOSet.componentPropertyDefinitions = { Theme: { type: 'VARIANT', variantOptions: ['Strock'], defaultValue: 'Strock' }, Size: { type: 'VARIANT', variantOptions: ['S', 'M'], defaultValue: 'M' } };
  MOCK_LIBS.set('lib:btn-noic', btnNOSet);

  // input 转化靶子（2026-10-31 七轮，REQ-018 input 审计根因）：库 Input 组件集——对齐真库轴系：
  // BOOLEAN preIcon/afterIcon/addonBefore/addonAfter 全默认 true（主档带 http:// 前缀文本 + 图标附加块
  // + Example 默认值），VARIANT Size（Standard 32 / Large 40），TEXT value 默认 Example。
  // 旧插件只认 icon 类轴且无位置感 → 左置 search 图标误开 afterIcon、addon 轴无人管 → 三泄漏
  const searchIco = mkIconComp('search2'); MOCK_LIBS.set('icon:search2', searchIco);
  const defIco = mkIconComp('add3'); MOCK_LIBS.set('icon:add3', defIco);
  const mkInputV = (sz, h2) => {
    const c = new FNode('COMPONENT', { name: 'Size=' + sz, width: 200, height: h2 });
    c.variantProperties = { Size: sz };
    c.componentPropertyDefinitions = {
      Size: { type: 'VARIANT', variantOptions: ['Standard', 'Large'], defaultValue: 'Standard' },
      preIcon: { type: 'BOOLEAN', defaultValue: true },
      afterIcon: { type: 'BOOLEAN', defaultValue: true },
      addonBefore: { type: 'BOOLEAN', defaultValue: true },
      addonAfter: { type: 'BOOLEAN', defaultValue: true },
      value: { type: 'TEXT', defaultValue: 'Example' },
    };
    const slot = new FNode('INSTANCE', { name: '1 Basic/1 Icon/add', width: 16, height: 16 }); slot.mainComponent = defIco;
    c.appendChild(slot);
    c.appendChild(mkText('http://'));
    c.appendChild(mkText('Example'));
    c.appendChild(mkText('Setting'));
    return c;
  };
  const inputSet = new FNode('COMPONENT_SET', { name: 'Input 输入框', width: 200, height: 32 });
  inputSet.appendChild(mkInputV('Standard', 32)); inputSet.appendChild(mkInputV('Large', 40));
  inputSet.componentPropertyDefinitions = { Size: { type: 'VARIANT', variantOptions: ['Standard', 'Large'], defaultValue: 'Standard' } };
  MOCK_LIBS.set('lib:input-x', inputSet);

  // 十轮靶子：真库 Input 结构（Milesight_IOT_Web 实测）——组件集**没有任何 addon/preIcon BOOLEAN 轴**
  //（只有 Size/State/Filled VARIANT），http:// 前缀块（InputAddon 直发子实例）、28px 设置图标附加块
  //（Component 1 直发子实例）、person 前图标 + input-suffix（'input' 内层 16px 实例）全是烤进变体的
  // 结构。七轮布尔轴关态路径对这套结构无效 → 十轮证据隐藏三连：addon 结构隐藏（>24px 直发子实例）/
  // 槽位换装收口（换装槽之外全藏）/改写 df 剪枝（藏掉的 addon 文本退出对位，值落到值层）。
  const personIco = mkIconComp('person1'); MOCK_LIBS.set('icon:person1', personIco);
  const gearIco = mkIconComp('gear1'); MOCK_LIBS.set('icon:gear1', gearIco);
  const suffixIco = mkIconComp('suffix1'); MOCK_LIBS.set('icon:suffix1', suffixIco);
  const addonComp = new FNode('COMPONENT', { name: 'Input-Addon', width: 56, height: 32 });
  addonComp.appendChild(mkText('http://'));
  MOCK_LIBS.set('lib:input-addon', addonComp);
  const mkInputRL = () => {
    const c = new FNode('COMPONENT', { name: 'Size 尺寸=Small, State 状态=normal, Filled 填充=true', width: 220, height: 32 });
    c.variantProperties = { 'Size 尺寸': 'Small', 'State 状态': 'normal', 'Filled 填充': 'true' };
    c.componentPropertyDefinitions = {
      'Size 尺寸': { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' },
      'State 状态': { type: 'VARIANT', variantOptions: ['normal', 'disable'], defaultValue: 'normal' },
      'Filled 填充': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'true' },
      '值': { type: 'TEXT', defaultValue: 'Example' },
    };
    const addon = new FNode('INSTANCE', { name: 'Input-Addon', width: 56, height: 32 });
    addon.mainComponent = addonComp;
    c.appendChild(addon);
    const gear = new FNode('INSTANCE', { name: 'Component 1', width: 28, height: 28 });
    gear.mainComponent = gearIco;
    c.appendChild(gear);
    const inner = new FNode('FRAME', { name: 'input', width: 120, height: 32 });
    const person = new FNode('INSTANCE', { name: 'icon/person', x: 4, y: 8, width: 16, height: 16 });
    person.mainComponent = personIco;
    inner.appendChild(person);
    const val = mkText('Example'); val.x = 28; val.y = 6;
    inner.appendChild(val);
    const suf = new FNode('INSTANCE', { name: 'input-suffix', x: 96, y: 8, width: 16, height: 16 });
    suf.mainComponent = suffixIco;
    inner.appendChild(suf);
    c.appendChild(inner);
    return c;
  };
  const inputRLSet = new FNode('COMPONENT_SET', { name: 'Input 真结构', width: 220, height: 32 });
  inputRLSet.appendChild(mkInputRL());
  inputRLSet.componentPropertyDefinitions = { 'Size 尺寸': { type: 'VARIANT', variantOptions: ['Small', 'Large'], defaultValue: 'Small' } };
  MOCK_LIBS.set('lib:input-rl', inputRLSet);

  // 十一轮靶子：库 steps-item（Milesight_IOT_Web 实测轴系：Layout 布局 × Small 小型 × Status 状态）。
  // tail 连接线烤在 item 内（header.tail 内 line、88px 定宽）、步号数字是 icon 子实例内可覆写 TEXT——
  // 整条 steps 集 Number 轴只有 3~6 → 逐项映射：done/active/裸类 token 裁决 Status，Small 走高度裁决
  // （块 24 → true 胜 32 差 8），末步无 ms-step-line（lib.tail=0）→ 藏 tail、有线的拉宽填满余宽
  const mkStepIcon = (variant) => {
    const c = new FNode('COMPONENT', { name: 'steps-item-icon/' + variant, width: 24, height: 24 });
    const d = mkText('2'); d.x = 7; d.y = 1;
    c.appendChild(d);
    return c;
  };
  const stepIcoOp = mkStepIcon('Operating'); MOCK_LIBS.set('icon:step-op', stepIcoOp);
  const stepIcoWait = mkStepIcon('Wait'); MOCK_LIBS.set('icon:step-wait', stepIcoWait);
  const mkStepV = (layout, small, status, h2) => {
    const c = new FNode('COMPONENT', { name: 'Layout 布局=' + layout + ', Small 小型=' + small + ', Status 状态=' + status, width: 220, height: h2 });
    c.variantProperties = { 'Layout 布局': layout, 'Small 小型': String(small), 'Status 状态': status };
    c.componentPropertyDefinitions = {
      'Layout 布局': { type: 'VARIANT', variantOptions: ['水平左对齐', '垂直'], defaultValue: '水平左对齐' },
      'Small 小型': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'false' },
      'Status 状态': { type: 'VARIANT', variantOptions: ['完成', '进行中', '等待'], defaultValue: '等待' },
    };
    const header = new FNode('FRAME', { name: 'header', width: 210, height: h2 });
    const ic = new FNode('INSTANCE', { name: 'steps-item-icon', width: 24, height: 24 });
    ic.mainComponent = status === '等待' ? stepIcoWait : stepIcoOp;
    header.appendChild(ic);
    const title = mkText('Step Title'); title.x = 40; title.y = h2 === 24 ? 5 : 7;
    header.appendChild(title);
    const tail = new FNode('FRAME', { name: 'tail', x: 122, y: h2 === 24 ? 12 : 16, width: 88, height: 1,
      fills: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }] });
    const line = new FNode('VECTOR', { name: 'line', width: 88, height: 1,
      fills: [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }], strokes: [] });
    tail.appendChild(line);
    header.appendChild(tail);
    c.appendChild(header);
    return c;
  };
  const stepSet = new FNode('COMPONENT_SET', { name: 'components/steps-item', width: 220, height: 24 });
  stepSet.appendChild(mkStepV('水平左对齐', true, '进行中', 24));
  stepSet.appendChild(mkStepV('水平左对齐', true, '等待', 24));
  stepSet.appendChild(mkStepV('水平左对齐', false, '进行中', 32));
  stepSet.appendChild(mkStepV('水平左对齐', false, '等待', 32));
  stepSet.componentPropertyDefinitions = {
    'Layout 布局': { type: 'VARIANT', variantOptions: ['水平左对齐', '垂直'], defaultValue: '水平左对齐' },
    'Small 小型': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'false' },
    'Status 状态': { type: 'VARIANT', variantOptions: ['完成', '进行中', '等待'], defaultValue: '等待' },
  };
  MOCK_LIBS.set('lib:steps-item', stepSet);

  // 十一轮续（审计启用）：库 components/Segmented（Milesight_IOT_Web 实测轴系：尺寸 × 选中 × 悬停 × 禁用
  // ——选中/悬停/禁用同为 true/false 值域）。token 必须「轴名=值」显式寻址：裸 'true' 会让每个未决
  // 布尔轴都吃到同一值——故 fixture 特意含「选中+悬停+禁用全开」变体，红态（轴名门禁缺失）会选中它，
  // 悬停/禁用串开可见。尺寸轴块高 28 vs 大30/中26 双差 2px 平局不判 → 默认大 + resize 吸收
  const mkSegV = (size, sel, hov, dis) => {
    const c = new FNode('COMPONENT', { name: '尺寸=' + size + ', 选中=' + sel + ', 悬停=' + hov + ', 禁用=' + dis, width: 70, height: size === '大' ? 30 : 26 });
    c.variantProperties = { '尺寸': size, '选中': sel, '悬停': hov, '禁用': dis };
    const t = mkText('Segment'); t.x = 12; t.y = 6;
    c.appendChild(t);
    return c;
  };
  const segSet = new FNode('COMPONENT_SET', { name: 'components/Segmented', width: 70, height: 30 });
  segSet.appendChild(mkSegV('大', 'true', 'false', 'false'));
  segSet.appendChild(mkSegV('大', 'false', 'false', 'false'));
  segSet.appendChild(mkSegV('中', 'false', 'false', 'false'));
  segSet.appendChild(mkSegV('大', 'true', 'true', 'true'));
  segSet.componentPropertyDefinitions = {
    '尺寸': { type: 'VARIANT', variantOptions: ['大', '中', '小', '迷你'], defaultValue: '大' },
    '选中': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'false' },
    '悬停': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'false' },
    '禁用': { type: 'VARIANT', variantOptions: ['true', 'false'], defaultValue: 'false' },
  };
  MOCK_LIBS.set('lib:seg-item', segSet);

  // 十一轮续：库 time-dot（Timeline 页实测：单轴 status 状态=进行中/完成/失败/等待，8×8）。
  // 单轴裸值无碰撞（与 Segmented 布尔家族相反）；warm 修饰库无档 → 等待 + repaintLibInstance 按 HTML 色兜正
  const mkDotV = (st, col) => {
    const c = new FNode('COMPONENT', { name: 'status 状态=' + st, width: 8, height: 8,
      fills: [{ type: 'SOLID', color: { r: col[0], g: col[1], b: col[2] } }] });
    c.variantProperties = { 'status 状态': st };
    return c;
  };
  const dotSet = new FNode('COMPONENT_SET', { name: 'time-dot', width: 8, height: 8 });
  dotSet.appendChild(mkDotV('进行中', [0.2, 0.4, 0.9]));
  dotSet.appendChild(mkDotV('完成', [0.1, 0.7, 0.3]));
  dotSet.appendChild(mkDotV('失败', [0.9, 0.2, 0.2]));
  dotSet.appendChild(mkDotV('等待', [0.6, 0.6, 0.6]));
  dotSet.componentPropertyDefinitions = { 'status 状态': { type: 'VARIANT', variantOptions: ['进行中', '完成', '失败', '等待'], defaultValue: '进行中' } };
  MOCK_LIBS.set('lib:time-dot', dotSet);

  // 十轮靶子：真库 Checkbox——tag BOOLEAN 默认 true 控标签 <p>{text}</p>、text TEXT 默认 "Checkbox"。
  // 轴名 tag 此前无规则管辖恒落默认 true → 裸表格勾选框（无文本证据）泄漏 "Checkbox" 文案；
  // 用户裁定：标题场景（块内有文本）才带文本，表格列只有勾选框。
  const checkComp = new FNode('COMPONENT', { name: 'Checkbox', width: 90, height: 22 });
  checkComp.componentPropertyDefinitions = {
    tag: { type: 'BOOLEAN', defaultValue: true },
    text: { type: 'TEXT', defaultValue: 'Checkbox' },
    selected: { type: 'BOOLEAN', defaultValue: false },
  };
  const checkLabel = mkText('Checkbox'); checkLabel.x = 22; checkLabel.y = 2;
  checkComp.appendChild(checkLabel);
  MOCK_LIBS.set('lib:checkbox-rl', checkComp);
})();

// ---------- mock figma ----------
const calls = { importKey: [], importSetKey: [], importVarKey: [], createImageAsync: [], combineAsVariants: [], notify: [], fonts: new Set(), closePlugin: 0, teamLib: 0, uiPost: [], csGet: [], csSet: [], svgCreated: [] };
let PAINT_STYLES = [], styleSeq = 0;

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
  createNodeFromSvg: svg => { const n = new FNode('FRAME', { name: 'svg', width: 24, height: 24, children: [] }); calls.svgCreated.push(n); return n; },
  combineAsVariants: (comps, page) => {
    // 对齐真 API 实测（2026-10-31 REQ-018 defs 板 179:57095）：combine 不自动排布变体（全叠原位、
    // 集框塌成单变体尺寸），且吞变体——末个 comp 不入集、游离集外。插件侧靠对账补挂 + 网格排布 +
    // resizeWithoutConstraints 收口；mock 复刻吞末个形态防插件侧回归
    const set = new FNode('COMPONENT_SET', { name: 'set' });
    const kept = comps.length > 1 ? comps.slice(0, comps.length - 1) : comps.slice();
    kept.forEach(c => set.appendChild(c));
    comps.forEach(c => { if (!kept.includes(c)) page.appendChild(c); });
    if (kept[0]) { set.width = kept[0].width; set.height = kept[0].height; }
    page.appendChild(set);
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
  // paint styles（free 层 use local styles 对标）：复刻真 API create/getLocalPaintStylesAsync
  createPaintStyle: () => {
    const s = { id: 'style:' + (++styleSeq), type: 'PAINT_STYLE', name: '', paints: [] };
    PAINT_STYLES.push(s); return s;
  },
  getLocalPaintStylesAsync: async () => PAINT_STYLES.slice(),
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
  // clientStorage（历史一键重导代理）：真 API 异步 KV；mock 复刻 get/set 行为
  clientStorage: {
    _store: {},
    getAsync: async k => { calls.csGet.push(k); return (k in figma.clientStorage._store) ? figma.clientStorage._store[k] : undefined; },
    setAsync: async (k, v) => { calls.csSet.push(k); figma.clientStorage._store[k] = v; },
  },
  viewport: { scrollAndZoomIntoView: () => {} },
  closePlugin: () => { calls.closePlugin++; },
  showUI: () => {},
  ui: {
    _handler: null,
    postMessage: m => { calls.uiPost.push(m); },
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
        // 九轮防换行靶（REQ-015「大文字不要换行」）：多行文本保持 NONE+定宽盒（Figma 重排风险兜底），单行走 hug
        T('多行文本第一行\n多行文本第二行', { w: 160, h: 40 }),
        T('居中断言', { al: 'center', x: 300, w: 100, fs: 14 }),
        { t: 'f', n: 'dashed-blend-rot', f: [{ c: [1, 1, 1], a: 1 }], ftk: 'color-fill-base-normal', e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 60, w: 200, h: 60, o: 1, rot: 15, bm: 'multiply',
          stk: { w: 2, c: [1, 0, 0], a: 1, dash: 'dashed', tk: 'color-error-normal' },
          bg: [{ k: 'l', ang: 90, stops: [{ c: [0.1, 0.4, 0.9], a: 1, p: 0 }, { c: [0.9, 0.2, 0.2], a: 1, p: 1 }] }], ch: [] },
        { t: 'f', n: 'al-row', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 140, w: 300, h: 40, o: 1,
          rct: [{ to: 1, tg: 'ON_CLICK' }],
          al: { dir: 'row', gap: 12, just: 'MIN', align: 'CENTER', pt: 8, pr: 8, pb: 8, pl: 8, bw: 1, bc: [0, 0, 0], ba: 1, btk: 'color-border-base' },
          ch: [{ t: 'f', n: 'k1', f: [{ c: [0.8, 0.8, 0.8], a: 1 }], ftk: 'color-text-secondary', e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 8, y: 8, w: 50, h: 24, o: 1, ch: [] },
               { t: 'f', n: 'k2', f: [{ c: [0.7, 0.7, 0.7], a: 1 }], ftk: 'color-warm-normal', e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 70, y: 8, w: 50, h: 24, o: 1, ch: [] }] },
        // AL stretch 消毒靶（2026-10-31 六轮）：CSS align-items 默认 stretch → 序列化发 align:'STRETCH'——
        // counterAxisAlignItems 无此枚举（真 API 必抛）；正确表达 = 容器 MIN + 子节点 layoutAlign='STRETCH'，
        // 且终态 resize 不得被枚举抛错连带跳过（旧代码外层 catch 一口吞 → hug 冻结 136px ≠ 300px）
        { t: 'f', n: 'al-stretch', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 400, y: 140, w: 300, h: 40, o: 1,
          al: { dir: 'row', gap: 8, just: 'MIN', align: 'STRETCH', pt: 4, pr: 4, pb: 4, pl: 4 },
          ch: [{ t: 'f', n: 'sk1', f: [{ c: [0.8, 0.8, 0.8], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 4, y: 4, w: 60, h: 32, o: 1, ch: [] },
               { t: 'f', n: 'sk2', f: [{ c: [0.7, 0.7, 0.7], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 72, y: 4, w: 60, h: 32, o: 1, ch: [] }] },
        { t: 'img', src: 'data:image/png;base64,MOCKDATA', x: 0, y: 200, w: 120, h: 80, o: 1, fit: 'cover', r: { tl: 8, tr: 8, br: 8, bl: 8 } },
        { t: 'ic', k: 'icon:check', f: 'icon/check', svg: '<svg viewBox="0 0 24 24"></svg>', x: 0, y: 300, w: 16, h: 16, o: 1, col: [0.2, 0.4, 0.9], ctk: 'color-icon-normal' },
        { t: 'ic', f: 'search', svg: '<svg viewBox="0 0 24 24"></svg>', x: 40, y: 300, w: 16, h: 16, o: 1, col: [0.1, 0.1, 0.1] }, // 无 key：icon-keys 未映射 → 插件按名走库目录兜底
        { t: 'f', n: 'ms-btn ms-btn--primary', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 340, w: 88, h: 32, o: 1,
          lib: { k: 'lib:btn', f: 'Button', cls: 'ms-btn', tok: ['primary'], text: 'Save', ic: false }, ch: [T('Save')] },
        { t: 'f', n: 'ms-btn', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 120, y: 340, w: 60, h: 32, o: 1,
          lib: { k: 'lib:btn', f: 'Button', cls: 'ms-btn', tok: [], col: [0.2, 0.4, 0.9], text: 'OK', ic: false }, ch: [T('OK')] },
        // 九轮颜色覆写靶（REQ-015「按钮颜色要和 html 统一」）：demo 白底灰边 bare/sm 按钮，
        // 库 Strock 变体默认边框是库蓝——lib.col+lib.stk（色条反推描边证据）无条件按 HTML 重涂；
        // tk 走 v:border（库变量黑值≠demo 灰）→ 读回漂移回退裸灰，恰好覆盖回退分支。
        // cls 用独立名 ms-btnt--sm：避开五轮纯图标钮靶（ms-btn--sm 同名会让 find 串靶）
        { t: 'f', n: 'ms-btnt ms-btnt--sm', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 200, y: 340, w: 70, h: 32, o: 1,
          lib: { k: 'lib:btn-theme', f: 'ButtonTheme', cls: 'ms-btnt ms-btnt--sm', tok: ['strock'], col: [1, 1, 1], stk: { w: 1, c: [0.898, 0.902, 0.922], tk: 'color-border-base' }, text: '导出', ic: false },
          ch: [T('导出')] },
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
          lib: { k: 'lib:stat', f: 'Statistic', cls: 'ms-stat', tok: [], texts: ['24', '在线设备'], tcols: [[0.2, 0.4, 0.9], undefined], ttoks: ['color-icon-normal', undefined], tfs: [20, 12], tfw: [600, undefined] },
          ch: [T('24', { col: [0.2, 0.4, 0.9] }), T('在线设备')] },
        { t: 'f', n: 'ms-tag ms-tag--primary', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 980, y: 700, w: 60, h: 24, o: 1,
          lib: { k: 'lib:tagx', f: 'Tag 标签X', cls: 'ms-tag', tok: ['primary'], text: 'MBus', ic: false }, ch: [T('MBus')] },
        { t: 'f', n: 'ms-breadcrumb', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 240, y: 700, w: 200, h: 20, o: 1,
          ch: [T('Home / Devices')] },
        { t: 'f', n: 'ms-header', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 730, w: 200, h: 20, o: 1,
          ch: [T('导航')] },
        { t: 'f', n: 'ms-mask', f: [{ c: [0.15, 0.18, 0.23], a: 0.5 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 560, w: 1440, h: 1800, o: 1,
          lib: { k: 'lib:dialog-layop', f: '弹窗Layop', cls: 'ms-mask', tok: [], texts: ['上传固件', 'Uploading 40%', 'Cancel'] },
          ch: [{ t: 'f', n: 'ms-modal', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 8, tr: 8, br: 8, bl: 8 }, clip: false, x: 540, y: 840, w: 360, h: 120, o: 1,
            ch: [T('上传固件'), T('Uploading 40%'), T('Cancel')] }] },
        { t: 'f', n: 'ms-ord', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 480, y: 700, w: 200, h: 80, o: 1,
          lib: { k: 'lib:swap-order', f: 'TitleButton', cls: 'ms-ord', tok: [], texts: ['网关设置', '保存'], tcols: [[0.1, 0.1, 0.1], [1, 1, 1]] },
          ch: [T('网关设置', { col: [0.1, 0.1, 0.1] }), T('保存', { col: [1, 1, 1] })] },
        { t: 'f', n: 'ms-drift', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 700, y: 700, w: 120, h: 24, o: 1,
          lib: { k: 'lib:drift', f: 'Drift', cls: 'ms-drift', tok: [], texts: ['新文案'] },
          ch: [T('新文案')] },
        { t: 'f', n: 'ms-under', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 840, y: 700, w: 100, h: 20, o: 1,
          lib: { k: 'lib:tiny', f: 'Tiny', cls: 'ms-under', tok: [], texts: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'] },
          ch: [T('M1'), T('M2'), T('M3'), T('M4'), T('M5'), T('M6')] },
        // 十一轮（步骤条组件化，REQ-019 向导条两步形态）：active 步（步号 1 + 标题 + 连线 tail:1）+
        // 末步 wait（步号 2 + 标题、无连线 tail:0）——tok 含裸类兜底「等待」排在修饰 token 之后
        { t: 'f', n: 'ms-step ms-step--active', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 40, y: 1240, w: 560, h: 24, o: 1,
          lib: { k: 'lib:steps-item', f: 'components/steps-item', cls: 'ms-step ms-step--active', tok: ['水平左对齐', '进行中', '等待'], texts: ['1', '设备信息'], tcols: [[0.2, 0.4, 0.9], [0.1, 0.1, 0.1]], ic: false, tail: 1 },
          ch: [T('1', { x: 8, fs: 12, fw: 600, w: 12, h: 20 }), T('设备信息', { x: 36, y: 1, w: 64, h: 22 }),
            { t: 'f', n: 'ms-step-line', f: [{ c: [0.9, 0.9, 0.9], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 120, y: 12, w: 430, h: 1, o: 1, ch: [] }] },
        { t: 'f', n: 'ms-step', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 620, y: 1240, w: 560, h: 24, o: 1,
          lib: { k: 'lib:steps-item', f: 'components/steps-item', cls: 'ms-step', tok: ['水平左对齐', '等待'], texts: ['2', '对象配置'], tcols: [[0.1, 0.1, 0.1], [0.1, 0.1, 0.1]], ic: false, tail: 0 },
          ch: [T('2', { x: 8, fs: 12, fw: 600, w: 12, h: 20 }), T('对象配置', { x: 36, y: 1, w: 64, h: 22 })] },
        // 十一轮续（审计启用）：分段控制器逐项换库——active 项「选中=true」显式轴 token + 裸项兜底「选中=false」。
        // 悬停/禁用与选中同值域（true/false）：红态（轴名门禁缺失）裸值把三轴全串开 → 选「全开」变体
        { t: 'f', n: 'ms-segmented-item ms-segmented-item--active', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 6, tr: 6, br: 6, bl: 6 }, clip: false, x: 40, y: 1300, w: 62, h: 28, o: 1,
          lib: { k: 'lib:seg-item', f: 'components/Segmented', cls: 'ms-segmented-item ms-segmented-item--active', tok: ['选中=true'], col: [1, 1, 1, 1], texts: ['列表'], tcols: [[0.1, 0.1, 0.1]], ic: false },
          ch: [T('列表')] },
        { t: 'f', n: 'ms-segmented-item', f: [], e: [], r: { tl: 6, tr: 6, br: 6, bl: 6 }, clip: false, x: 110, y: 1300, w: 62, h: 28, o: 1,
          lib: { k: 'lib:seg-item', f: 'components/Segmented', cls: 'ms-segmented-item', tok: ['选中=false'], texts: ['卡片'], tcols: [[0.4, 0.4, 0.4]], ic: false },
          ch: [T('卡片')] },
        // 十一轮续：时间轴点逐项换库——warm 修饰（库无 warm 档 → 等待 + repaint 按 demo 橙色兜正）+ 裸点（进行中）
        { t: 'f', n: 'ms-timeline-dot ms-timeline-dot--warm', f: [{ c: [0.95, 0.6, 0.1], a: 1 }], e: [], r: { tl: 5, tr: 5, br: 5, bl: 5 }, clip: false, x: 40, y: 1340, w: 9, h: 9, o: 1,
          lib: { k: 'lib:time-dot', f: 'time-dot', cls: 'ms-timeline-dot ms-timeline-dot--warm', tok: ['等待'], col: [0.95, 0.6, 0.1, 1], ic: false }, ch: [] },
        { t: 'f', n: 'ms-timeline-dot', f: [{ c: [0.2, 0.4, 0.9], a: 1 }], e: [], r: { tl: 5, tr: 5, br: 5, bl: 5 }, clip: false, x: 60, y: 1340, w: 9, h: 9, o: 1,
          lib: { k: 'lib:time-dot', f: 'time-dot', cls: 'ms-timeline-dot', tok: ['进行中'], col: [0.2, 0.4, 0.9, 1], ic: false }, ch: [] },
        { t: 'inst', d: 'c1', x: 0, y: 400, w: 60, h: 24, o: 1, texts: ['在线'], tcols: [[0.1, 0.6, 0.3]] },
        { t: 's', svg: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24z"/></svg>', x: 0, y: 440, w: 20, h: 20, o: 1 },
        // 图标槽换装 + 视觉复核重选（2026-10-31）：轴裁决全不判 → 默认 Ghost 落图背离蓝底 → 换 Filled 重建 + 图标槽换 trash
        { t: 'f', n: 'ms-btn ms-btn--filled', f: [{ c: [0.2, 0.4, 0.9], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 980, y: 340, w: 100, h: 32, o: 1,
          lib: { k: 'lib:btn-ic', f: 'ButtonIC', cls: 'ms-btn ms-btn--filled', tok: [], col: [0.2, 0.4, 0.9, 1], texts: ['Delete Configuration'], ic: true, icnk: 'icon:trash' },
          ch: [T('Delete Configuration')] },
        // t:'s' 裸 svg 图标身份（2026-10-31 六轮，REQ-020 ops 钮根因）：损坏 MS_ICONS 的 svg 经 iconSig
        // 实体容忍反查出 ic 名 → walkLib firstIcon 收 t:'s' → lib.icnf → 按名换装图标槽——
        // 此前 firstIcon 只认 t:'ic'，icnf 恒空 → 守卫 return false → 库默认 Add 图标泄漏
        { t: 'f', n: 'ms-btn ms-btn--ops', f: [{ c: [0.2, 0.4, 0.9], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 980, y: 300, w: 90, h: 32, o: 1,
          lib: { k: 'lib:btn-ic', f: 'ButtonIC', cls: 'ms-btn ms-btn--ops', tok: [], col: [0.2, 0.4, 0.9, 1], texts: ['搜索设备'], ic: true, icnf: 'search', icnc: [0.1, 0.1, 0.1] },
          ch: [{ t: 's', svg: '<svg viewBox="0 0 24 24"><path d="M0 0h24v24z"/></svg>', x: 8, y: 8, w: 16, h: 16, o: 1, ic: 'search', col: [0.1, 0.1, 0.1] }, T('搜索设备')] },
        // shape 门控（2026-10-31）：宽块 + Small/Large 几何轴，旧逻辑按宽高比误裁 Large——门控后保持默认 Small
        { t: 'f', n: 'ms-btn ms-btn--wide', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 980, y: 400, w: 200, h: 40, o: 1,
          lib: { k: 'lib:btn-w', f: 'ButtonW', cls: 'ms-btn ms-btn--wide', tok: [], texts: ['A Wide Button Label'], ic: false },
          ch: [T('A Wide Button Label')] },
        // 裸类兜底 / token 序优先（2026-10-31 四轮）：bare=strock 白底描边；filled 修饰 primary 压过兜底
        { t: 'f', n: 'ms-btnt', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 300, y: 460, w: 80, h: 32, o: 1,
          lib: { k: 'lib:btn-theme', f: 'ButtonTheme', cls: 'ms-btnt', tok: ['strock'], text: '取消', ic: false }, ch: [T('取消')] },
        { t: 'f', n: 'ms-btnt ms-btnt--filled', f: [{ c: [0.2, 0.4, 0.9], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 420, y: 460, w: 80, h: 32, o: 1,
          lib: { k: 'lib:btn-theme', f: 'ButtonTheme', cls: 'ms-btnt ms-btnt--filled', tok: ['primary', 'strock'], text: '下一步', ic: false }, ch: [T('下一步')] },
        // tag 双轴（2026-10-31 四轮）：tinted=Light background+theme；outline 修饰压过兜底
        { t: 'f', n: 'ms-tagk ms-tagk--primary', f: [{ c: [0.9, 0.95, 1], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 300, y: 500, w: 60, h: 24, o: 1,
          lib: { k: 'lib:tag-kind', f: 'Tag 标签双色', cls: 'ms-tagk ms-tagk--primary', tok: ['light background', 'primary', 'default'], text: '待分配', ic: false }, ch: [T('待分配')] },
        { t: 'f', n: 'ms-tagk ms-tagk--outline', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 420, y: 500, w: 60, h: 24, o: 1,
          lib: { k: 'lib:tag-kind', f: 'Tag 标签双色', cls: 'ms-tagk ms-tagk--outline', tok: ['outline', 'light background', 'default'], text: 'M-Bus', ic: false }, ch: [T('M-Bus')] },
        // 高度平局（2026-10-31 四轮）：两变体同高 → 高度不判 + 形状不跑 → 默认 Small
        { t: 'f', n: 'ms-btnq', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 540, y: 460, w: 200, h: 32, o: 1,
          lib: { k: 'lib:btn-tie', f: 'ButtonTie', cls: 'ms-btnq', tok: [], texts: ['A Wide Tie Label'], ic: false },
          ch: [T('A Wide Tie Label')] },
        // 几何对齐（2026-10-31 四轮）：单行文本层盒收缩到字形 run + 几何居中——全宽层会漂移居中压兄弟图标
        // （scene 坐标为 cell 绝对系：宿主 x700 + 字形 run 偏移 44 → 文本层 x744）
        { t: 'f', n: 'geo-align-host', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 700, y: 460, w: 200, h: 32, o: 1,
          ch: [T('几何居中段', { al: 'center', x: 744, w: 64, y: 466, h: 20 })] },
        // 长文案防折行 autoFit（2026-10-31 sig 去宽高）：短文案主档（Disabled 8 字）被长文案实例复用
        { t: 'inst', d: 'c2', x: 80, y: 400, w: 200, h: 24, o: 1, texts: ['这是一个特别特别特别特别长的实例文案标签内容超过阈值'], tcols: [[0.1, 0.6, 0.3]] },
        { t: 'inst', d: 'c2', x: 80, y: 440, w: 200, h: 24, o: 1, texts: ['中等长度的实例文案'], tcols: [[0.1, 0.6, 0.3]] },
        // AL-hug 靶子（2026-10-31 五轮，REQ-020 蒙版 1440→468 / foot 372→71.48 实测复刻）：fix 提升节点
        // 带 AL——真 API 开 AL 主轴落 hug，插件必须 sizing-first + 终态 resize 钉回 scene 原尺寸
        { t: 'f', n: 'ms-mask-hug', f: [{ c: [0.15, 0.18, 0.23], a: 0.5 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 0, w: 1440, h: 813, o: 1, fix: 1,
          al: { dir: 'row', gap: 12, just: 'CENTER', align: 'CENTER', pt: 24, pr: 24, pb: 24, pl: 24 },
          ch: [{ t: 'f', n: 'ms-modal-hug', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 8, tr: 8, br: 8, bl: 8 }, clip: false, x: 510, y: 316.5, w: 420, h: 180, o: 1,
            ch: [{ t: 'f', n: 'dlg-foot', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 24, y: 124, w: 372, h: 32, o: 1,
              al: { dir: 'row', gap: 12, just: 'MAX', align: 'CENTER' },
              ch: [T('Cancel', { x: 300.5, y: 0, w: 71.48, h: 32 })] }] }] },
        // 纯图标钮（2026-10-31 五轮）：有图标槽的 set → 择带槽变体 + 换装 + 藏 Label；无槽 set → 整块本地重绘
        { t: 'f', n: 'ms-btnop ms-btnop--sm', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 1100, y: 460, w: 34, h: 28, o: 1,
          lib: { k: 'lib:btn-io', f: 'ButtonIO', cls: 'ms-btn ms-btn--sm', tok: ['s', 'strock'], ic: true, icnk: 'icon:check', icnc: [0.1, 0.1, 0.1] },
          ch: [{ t: 'ic', k: 'icon:check', f: 'icon/check', svg: '<svg viewBox="0 0 24 24"></svg>', x: 1109, y: 466, w: 16, h: 16, o: 1, col: [0.1, 0.1, 0.1] }] },
        { t: 'f', n: 'ms-btnop2 ms-btnop2--sm', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 1160, y: 460, w: 34, h: 28, o: 1,
          lib: { k: 'lib:btn-noic', f: 'ButtonNO', cls: 'ms-btn ms-btn--sm', tok: ['s', 'strock'], ic: true },
          ch: [{ t: 'ic', f: 'moreHoriz', svg: '<svg viewBox="0 0 24 24"></svg>', x: 1169, y: 466, w: 16, h: 16, o: 1, col: [0.1, 0.1, 0.1] }] },
        // input 转化（2026-10-31 七轮，REQ-018）：①搜索框 = 左置图标（icL）+ placeholder 文案（合成文本节点）
        // → addon 两轴关 + afterIcon 关（不误开）+ preIcon 保槽换 search + Example 改写为占位文案；
        // ②lg 只读值输入 → 高度判 Large + 值文案改写；③空输入（无 value/placeholder）→ 藏主档 Example
        { t: 'f', n: 'ms-input bc-eg71-toolbar-search', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 240, y: 780, w: 260, h: 32, o: 1,
          lib: { k: 'lib:input-x', f: 'Input 输入框', cls: 'ms-input bc-eg71-toolbar-search', tok: [], texts: ['搜索通道名称 / 编号'], tcols: [[0.6, 0.6, 0.6]], ic: true, icL: 1, icnk: 'icon:search2', icnc: [0.4, 0.4, 0.4] },
          ch: [{ t: 'ic', k: 'icon:search2', f: 'icon/search2', svg: '<svg viewBox="0 0 24 24"></svg>', x: 248, y: 788, w: 16, h: 16, o: 1, col: [0.4, 0.4, 0.4] }, T('搜索通道名称 / 编号', { x: 272, y: 786, w: 180, col: [0.6, 0.6, 0.6] })] },
        { t: 'f', n: 'ms-input ms-input--lg ms-input--range', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 520, y: 780, w: 200, h: 40, o: 1,
          lib: { k: 'lib:input-x', f: 'Input 输入框', cls: 'ms-input ms-input--lg ms-input--range', tok: [], texts: ['2026-08-01 ~ 2026-08-31'], tcols: [[0.1, 0.1, 0.1]], ic: false },
          ch: [T('2026-08-01 ~ 2026-08-31', { x: 524, y: 790, w: 190 })] },
        { t: 'f', n: 'ms-input ms-input--lg ms-input--blank', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 740, y: 780, w: 200, h: 40, o: 1,
          lib: { k: 'lib:input-x', f: 'Input 输入框', cls: 'ms-input ms-input--lg ms-input--blank', tok: [], ic: false } },
        // 十轮：真库 Input 结构 + Checkbox tag 轴（REQ-019 板审计）：①搜索框 = addon 结构隐藏 +
        // person 槽换装 search + suffix 藏 + 值落值层（addon 内层 http:// 退出对位序列）；
        // ②无图标值输入 = person/suffix 槽全藏 + Example 改写；③裸 checkbox（无文本证据）=
        // tag 轴关 + 标签藏；④带文本 checkbox = 标签改写、不藏
        { t: 'f', n: 'ms-input rl-search', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 240, y: 840, w: 260, h: 32, o: 1,
          lib: { k: 'lib:input-rl', f: 'Input 真结构', cls: 'ms-input rl-search', tok: [], texts: ['4900 Water #31005621'], tcols: [[0.1, 0.1, 0.1]], ic: true, icL: 1, icnk: 'icon:search2', icnc: [0.4, 0.4, 0.4] },
          ch: [{ t: 'ic', k: 'icon:search2', f: 'icon/search2', svg: '<svg viewBox="0 0 24 24"></svg>', x: 248, y: 848, w: 16, h: 16, o: 1, col: [0.4, 0.4, 0.4] }, T('4900 Water #31005621', { x: 272, y: 846, w: 180 })] },
        { t: 'f', n: 'ms-input rl-value', f: [], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 520, y: 840, w: 200, h: 32, o: 1,
          lib: { k: 'lib:input-rl', f: 'Input 真结构', cls: 'ms-input rl-value', tok: [], texts: ['Heat Meter 01'], tcols: [[0.1, 0.1, 0.1]], ic: false },
          ch: [T('Heat Meter 01', { x: 524, y: 846, w: 150 })] },
        { t: 'f', n: 'ms-checkbox rl-check', f: [], e: [], r: { tl: 3, tr: 3, br: 3, bl: 3 }, clip: false, x: 740, y: 844, w: 16, h: 16, o: 1,
          lib: { k: 'lib:checkbox-rl', f: 'Checkbox', cls: 'ms-checkbox rl-check', tok: [], ic: false } },
        { t: 'f', n: 'ms-checkbox rl-check-label', f: [], e: [], r: { tl: 3, tr: 3, br: 3, bl: 3 }, clip: false, x: 800, y: 840, w: 90, h: 22, o: 1,
          lib: { k: 'lib:checkbox-rl', f: 'Checkbox', cls: 'ms-checkbox rl-check-label', tok: [], texts: ['启用告警'], tcols: [[0.1, 0.1, 0.1]], ic: false },
          ch: [T('启用告警', { x: 822, y: 842, w: 60 })] },
      ],
    },
  }, {
    label: '2. 危险确认', x: 1500, y: 0, w: 1440, h: 900,
    root: { t: 'f', f: [], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 0, w: 1440, h: 900, o: 1, ch: [T('Confirm Delete?')] },
  }],
  defs: {
    c1: { name: 'ms-tag', vname: 'Active', sig: 'aabbccdd', root: { t: 'f', n: 'ms-tag', f: [{ c: [0.9, 0.9, 0.9], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 0, w: 60, h: 24, o: 1, ch: [T('Active')] } },
    c2: { name: 'ms-tag', vname: 'Disabled', sig: '11223344', root: { t: 'f', n: 'ms-tag', f: [{ c: [0.85, 0.85, 0.85], a: 1 }], e: [], r: { tl: 4, tr: 4, br: 4, bl: 4 }, clip: false, x: 0, y: 0, w: 60, h: 24, o: 1, ch: [T('Disabled')] } },
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

  // ---- AL stretch 消毒（2026-10-31 六轮：官方手册 counterAxisAlignItems 无 STRETCH 枚举）----
  const alS = findBy(n => n.name === 'al-stretch')[0];
  A('AL stretch 消毒为 MIN（容器枚举无 STRETCH，不再抛错）', alS && alS.counterAxisAlignItems === 'MIN', alS && alS.counterAxisAlignItems);
  A('AL stretch 尺寸保持（终态 resize 未被枚举抛错连带跳过；hug 冻结时宽塌到 136）',
    alS && Math.abs(alS.width - 300) < 1 && Math.abs(alS.height - 40) < 1, alS && (alS.width + '×' + alS.height));
  A('AL stretch 下沉子节点 layoutAlign=STRETCH', alS && alS.children.length === 2 && alS.children.every(c => c.layoutAlign === 'STRETCH'),
    alS && alS.children.map(c => c.layoutAlign).join(','));

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
    // w8 修复（2026-10-31 缺陷 C）：Tab 项包在 'tabs group' 里也要收集到（旧逻辑收空 → 文案全 "Tab"）
    const tabKids = [];
    (function collectTabs(nd) { (nd.children || []).forEach(c => { if (/^tab$/i.test(String(c.name))) tabKids.push(c); else collectTabs(c); }); })(topInner || tabsInst);
    A('Tab 实例 ×2（tabs group 内深收集）', tabKids.length === 2,
      tabKids.length + ' kids=' + JSON.stringify((function fl(nd) { let o = []; (nd.children || []).forEach(c => { o.push(c.name); o = o.concat(fl(c)); }); return o; })(topInner || tabsInst)));
    A('Tab 择变体（Selecte 正确 + Icon/ShowSelect 关态）',
      tabKids.length === 2 && tabKids[0].variantProperties['Selecte 选择'] === 'true' && tabKids[1].variantProperties['Selecte 选择'] === 'false'
        && tabKids.every(t4 => t4.variantProperties['Icon 图标'] === 'false' && t4.variantProperties['ShowSelect 下拉'] === 'false'),
      tabKids.map(t4 => JSON.stringify(t4.variantProperties)).join(','));
    const tabTexts = tabKids.map(t4 => { const tt = findFirstTextM(t4); return tt ? tt.characters : null; });
    A('Tab 文案覆写 = 设备/固件', tabTexts.join('|') === '设备|固件', tabTexts.join('|'));
    // More 轴证据裁决（2026-10-31 缺陷 D）：more=true 变体排在前面也不得被选中；more 按钮残影要藏掉
    A('Top 择变体排除 More=true', topInner && topInner.variantProperties['More 更多'] === 'false',
      topInner && topInner.variantProperties['More 更多']);
    const moreBtn = topInner && (function fm2(nd) { let hit = null; (nd.children || []).forEach(c => { if (/more/i.test(String(c.name))) hit = c; else { const r = fm2(c); if (r) hit = r; } }); return hit; })(topInner);
    A('more 按钮残影隐藏（visible=false 覆写）', moreBtn && moreBtn.visible === false,
      moreBtn && moreBtn.name + ' visible=' + moreBtn.visible);
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
  // ---- 字样覆写（2026-10-31 五轮）：实例主档默认文字样式（14/Regular）不随 demo——tfs/tfw 逐段覆写 ----
  const statLay = statInst ? (statInst.children || []).filter(c => c.type === 'TEXT') : [];
  A('实例字号按 HTML 覆写（24 段 20px / 标签段 12px）',
    statLay.length === 2 && statLay[0].fontSize === 20 && statLay[1].fontSize === 12,
    statLay.map(t => t.fontSize).join(','));
  A('实例字重按 HTML 覆写（600 → Semibold；主档 Regular 不再泄漏）',
    statLay.length === 2 && statLay[0].fontName && statLay[0].fontName.style === 'Semibold',
    statLay[0] && JSON.stringify(statLay[0].fontName));
  A('字样覆写计数入通知', doneMsg0 && /字样覆写 [1-9]/.test(doneMsg0), doneMsg0);

  // ---- 证据裁决（2026-10-31 像素审计缺陷 E/F）：ic=false → icon 类 VARIANT 轴强制关态 ----
  const tagxInst = iconInsts.find(i => i.name === 'ms-tag ms-tag--primary' || i.name === 'ms-tag');
  A('无图标证据择 Icon=false 变体（默认 true 不泄漏）',
    !!tagxInst && tagxInst.variantProperties && tagxInst.variantProperties['Icon 图标'] === 'false',
    tagxInst && JSON.stringify(tagxInst.variantProperties));
  A('关态变体无 chevron 矢量残留',
    !!tagxInst && !(function fv(nd) { return (nd.children || []).some(c => /chevron/i.test(String(c.name)) || fv(c)); })(tagxInst),
    tagxInst && tagxInst.name);

  // ---- svgCache 原型清场（2026-10-31 像素审计缺陷 G）----
  A('svgCache 原型导入结束 remove（无游离 Frame）',
    calls.svgCreated.length >= 1 && calls.svgCreated.every(n => REMOVED.includes(n)),
    'created=' + calls.svgCreated.length + ' removed=' + calls.svgCreated.filter(n => REMOVED.includes(n)).length);

  // ---- 图标槽换装 + 视觉复核重选 + shape 门控 + autoFit（2026-10-31 按钮输入框转化修复）----
  const icBtn = iconInsts.find(i => i.name === 'ms-btn ms-btn--filled');
  A('视觉复核重选 Filled（默认 Ghost 无填充背离蓝底证据 → 换兄弟变体重建）',
    icBtn && icBtn.variantProperties && icBtn.variantProperties.Type === 'Filled',
    icBtn && JSON.stringify(icBtn.variantProperties));
  const icSlot = icBtn && (function fs2(nd) { let o = null; (nd.children || []).forEach(c => { if (c.type === 'INSTANCE' && /icon/i.test(String(c.name))) o = c; else { const r = fs2(c); if (r) o = r; } }); return o; })(icBtn);
  A('图标槽换装 mainComponent=trash（Delete 不再挂库默认 Add）',
    icSlot && icSlot.mainComponent && /trash/.test(String(icSlot.mainComponent.name || '')),
    icSlot && String(icSlot.mainComponent && icSlot.mainComponent.name));
  // t:'s' svg 身份链（2026-10-31 六轮）：icnf 按名换装——REQ-020 ops 钮 svg 图标不再挂库默认 Add
  const opsBtn = iconInsts.find(i => String(i.name) === 'ms-btn ms-btn--ops');
  const opsSlot = opsBtn && (function fs4(nd) { let o = null; (nd.children || []).forEach(c => { if (c.type === 'INSTANCE' && /icon/i.test(String(c.name))) o = c; else { const r = fs4(c); if (r) o = r; } }); return o; })(opsBtn);
  A('t:s svg icnf 按名换装（裸 svg 图标身份反查后不挂库默认 Add）',
    opsSlot && opsSlot.mainComponent && /search/.test(String(opsSlot.mainComponent.name || '')),
    opsSlot && String(opsSlot.mainComponent && opsSlot.mainComponent.name));
  A('图标换装计数入通知', doneMsg0 && /图标槽换装 [1-9]/.test(doneMsg0), doneMsg0);
  A('视觉重选计数入通知', doneMsg0 && /视觉复核重选 [1-9]/.test(doneMsg0), doneMsg0);
  A('图标按名兜底计数入通知', doneMsg0 && /按名动态兜底 1/.test(doneMsg0), doneMsg0);
  const dynIcon = iconInsts.find(i => String(i.name) === 'icon/search'); // mock createInstance 不挂 mainComponent，按克隆保留的名字找
  A('无 key 图标按名走库目录实例化（不建本地组件）', !!dynIcon && calls.importKey.includes('icon:search-x'),
    dynIcon ? 'key=' + String(calls.importKey.includes('icon:search-x')) : '实例缺失');
  const wideBtn = iconInsts.find(i => i.name === 'ms-btn ms-btn--wide');
  A('高度择尺寸：40px 块落 Size=Large（高度 px 真值参与裁决，不再默认序混档；2026-10-31 四轮「高度间距不一致」根因）',
    wideBtn && wideBtn.variantProperties && wideBtn.variantProperties.Size === 'Large',
    wideBtn && JSON.stringify(wideBtn.variantProperties));
  A('高度择尺寸计数入通知', doneMsg0 && /高度择尺寸 [1-9]/.test(doneMsg0), doneMsg0);
  const tieBtn = iconInsts.find(i => i.name === 'ms-btnq');
  A('高度平局不判 + 单段文本不跑形状（同高变体保持默认 Small，宽高比不再误裁 Large）',
    tieBtn && tieBtn.variantProperties && tieBtn.variantProperties.Size === 'Small',
    tieBtn && JSON.stringify(tieBtn.variantProperties));

  // ---- 九轮：实例颜色无条件覆写（用户硬性要求「html 的颜色怎样都按 html 改」）----
  // demo 白底灰边 bare/sm 按钮落库 Strock 变体后，实例根 fills/strokes 按 HTML 证据重涂——
  // 库变体默认蓝描边不再泄漏；tk 读回漂移（v:border 黑值≠灰）回退裸色仍是 demo 灰
  const rpBtn = iconInsts.find(i => String(i.name) === 'ms-btnt ms-btnt--sm');
  A('实例 fills 按 HTML 覆写（白底，不再随库变体默认）',
    !!rpBtn && rpBtn.fills && rpBtn.fills[0] && rpBtn.fills[0].color.r > 0.99 && rpBtn.fills[0].color.b > 0.99,
    rpBtn && rpBtn.fills[0] && JSON.stringify(rpBtn.fills[0].color));
  A('实例 strokes 按 HTML 覆写（灰边 #E5E6EB，库默认蓝边不再泄漏）',
    !!rpBtn && rpBtn.strokes && rpBtn.strokes[0] && rpBtn.strokes[0].color
      && Math.abs(rpBtn.strokes[0].color.r - 0.898) < 0.02 && Math.abs(rpBtn.strokes[0].color.b - 0.922) < 0.02,
    rpBtn && rpBtn.strokes[0] && JSON.stringify(rpBtn.strokes[0].color));
  A('描边宽 1 INSIDE', !!rpBtn && rpBtn.strokeWeight === 1 && rpBtn.strokeAlign === 'INSIDE',
    rpBtn && String(rpBtn.strokeWeight) + '/' + String(rpBtn.strokeAlign));
  A('stk 令牌绑定尝试过（漂移回退裸色但 key 已 import）', calls.importVarKey.includes('v:border'),
    'importVarKey=' + JSON.stringify(calls.importVarKey));
  A('颜色覆写计数入通知', doneMsg0 && /颜色覆写 [1-9]/.test(doneMsg0), doneMsg0);

  // ---- 九轮：单行文本 hug 防换行（用户令「大文字不要换行」）----
  const hugTxt = findBy(n => n.type === 'TEXT' && n.characters === 'Italic Underline')[0];
  A('单行文本 hug（WIDTH_AND_HEIGHT，浏览器量盒窄于 Figma 字形排宽不再折行）',
    hugTxt && hugTxt.textAutoResize === 'WIDTH_AND_HEIGHT',
    hugTxt && String(hugTxt.textAutoResize));
  const trTxt = findBy(n => n.type === 'TEXT' && n.characters === 'Truncated long text')[0];
  A('CSS 省略号文本保持 NONE+ENDING（不 hug）',
    trTxt && trTxt.textAutoResize === 'NONE' && trTxt.textTruncation === 'ENDING',
    trTxt && String(trTxt.textAutoResize) + '/' + String(trTxt.textTruncation));
  const mlTxt = findBy(n => n.type === 'TEXT' && String(n.characters).indexOf('多行文本第一行') === 0)[0];
  A('多行文本保持定宽盒 NONE（不 hug，防 Figma 重排）',
    mlTxt && mlTxt.textAutoResize === 'NONE', mlTxt && String(mlTxt.textAutoResize));
  const ctrTxt = findBy(n => n.type === 'TEXT' && n.characters === '居中断言')[0];
  // mock 自然宽 = 4 字 × 14 × 0.6 = 33.6 → x = 300 + (100-33.6)/2 = 333.2（真 Figma 同字体漂移亚像素级）
  A('hug 后居中文本按盒中心回移（x≈333.2，非左锚 300）',
    ctrTxt && ctrTxt.textAutoResize === 'WIDTH_AND_HEIGHT' && Math.abs(ctrTxt.x - 333.2) < 0.6,
    ctrTxt && 'x=' + ctrTxt.x + '/' + String(ctrTxt.textAutoResize));
  const themeBare = iconInsts.find(i => i.name === 'ms-btnt');
  A('裸类兜底 token：bare 按钮 Theme=Strock（白底描边，不再落默认 Primary 蓝底「文字看不到」根因）',
    themeBare && themeBare.variantProperties && themeBare.variantProperties.Theme === 'Strock',
    themeBare && JSON.stringify(themeBare.variantProperties));
  const themeFilled = iconInsts.find(i => i.name === 'ms-btnt ms-btnt--filled');
  A('token 序优先：修饰 token 压过裸类兜底（filled→Primary，不被 strock 兜底吃掉）',
    themeFilled && themeFilled.variantProperties && themeFilled.variantProperties.Theme === 'Primary',
    themeFilled && JSON.stringify(themeFilled.variantProperties));
  const tagkPrim = iconInsts.find(i => i.name === 'ms-tagk ms-tagk--primary');
  A('tag 双轴：tinted → 种类=Light background + theme=primary（浅底彩字，深底同色字不可见根因）',
    tagkPrim && tagkPrim.variantProperties && tagkPrim.variantProperties['种类'] === 'Light background' && tagkPrim.variantProperties.theme === 'primary',
    tagkPrim && JSON.stringify(tagkPrim.variantProperties));
  const tagkOut = iconInsts.find(i => i.name === 'ms-tagk ms-tagk--outline');
  A('tag outline 修饰压过兜底：种类=outline（不被裸类 Light background 吃掉）',
    tagkOut && tagkOut.variantProperties && tagkOut.variantProperties['种类'] === 'outline',
    tagkOut && JSON.stringify(tagkOut.variantProperties));
  const geoText = findBy(n => n.type === 'TEXT' && n.characters === '几何居中段')[0];
  // 九轮 hug 后居中文本按盒中心回移：mock 自然宽 = 5 字 × 14 × 0.6 = 42 → x = 744 + (64-42)/2 = 755
  //（真 Figma 同字体自然宽≈浏览器 run 宽，漂移亚像素级；序列化 run 收缩本身由 verify-scene 断言）
  A('几何对齐：单行居中文本层 CENTER 且盒收缩到字形 run（hug 后中心回移 x≈755）',
    geoText && geoText.textAlignHorizontal === 'CENTER' && Math.abs(geoText.x - 755) < 0.6,
    geoText && String(geoText.textAlignHorizontal) + '/x=' + geoText.x);
  const longInst = iconInsts.find(i => { const t5 = findFirstTextM(i); return t5 && t5.characters === '这是一个特别特别特别特别长的实例文案标签内容超过阈值'; });
  const longText = longInst && findFirstTextM(longInst);
  A('实例特别长文案省略号 ENDING（>24 字符，定回容器宽截断）',
    longText && longText.textTruncation === 'ENDING' && longText.textAutoResize === 'NONE',
    longText && String(longText.textTruncation) + '/' + String(longText.textAutoResize));
  const midInst = iconInsts.find(i => { const t6 = findFirstTextM(i); return t6 && t6.characters === '中等长度的实例文案'; });
  const midText = midInst && findFirstTextM(midInst);
  A('实例中等文案全展示（≤24 字符不省略号，WIDTH_AND_HEIGHT 自适应展开，2026-10-31 三轮用户令反转默认）',
    midText && midText.textAutoResize === 'WIDTH_AND_HEIGHT' && midText.textTruncation !== 'ENDING',
    midText && String(midText.textAutoResize) + '/' + String(midText.textTruncation));

  // ---- AL-hug 钉尺寸（2026-10-31 五轮，REQ-020 蒙版 1440→468 / foot 372→71.48 根因）----
  // 真 API 开 AL 主轴落 hug——插件 sizing-first + 终态 resize 后必须保持 scene 原尺寸与提升位
  const maskHug = cell && (cell.children || []).find(c => c.name === 'ms-mask-hug');
  A('蒙版提升后保持全幅（1440×813，不被 AL hug 收缩成 468）',
    !!maskHug && maskHug.width === 1440 && maskHug.height === 813,
    maskHug && (maskHug.width + '×' + maskHug.height));
  A('蒙版提升 y=24（lift 不双重补偿；bug 形态是 48）', !!maskHug && Math.abs(maskHug.y - 24) < 0.5,
    maskHug && String(maskHug.y));
  const footHug = maskHug && (function ff2(nd) { let o = null; (nd.children || []).forEach(c => { if (c.name === 'dlg-foot') o = c; else { const r = ff2(c); if (r) o = r; } }); return o; })(maskHug);
  A('弹窗 foot 保持全宽（372，不被 AL hug 收缩成按钮宽 71）',
    !!footHug && footHug.width === 372 && footHug.height === 32,
    footHug && (footHug.width + '×' + footHug.height));

  // ---- 纯图标钮（2026-10-31 五轮，REQ-020 操作列「图标钮变 Label 文字钮」根因）----
  const ioInst = iconInsts.find(i => i.name === 'ms-btn ms-btn--sm' && i.variantProperties && i.variantProperties.Theme === 'Strock');
  A('纯图标钮择带图标槽变体（Size=S，不被默认序落纯文字 M）',
    !!ioInst && ioInst.variantProperties.Size === 'S', ioInst && JSON.stringify(ioInst.variantProperties));
  const ioSlot = ioInst && (function fs3(nd) { let o = null; (nd.children || []).forEach(c => { if (c.type === 'INSTANCE' && /icon/i.test(String(c.name))) o = c; else { const r = fs3(c); if (r) o = r; } }); return o; })(ioInst);
  A('纯图标钮槽换装 check（图标真身随 demo，不挂库默认 Add）',
    !!ioSlot && ioSlot.mainComponent && /check/.test(String(ioSlot.mainComponent.name || '')),
    ioSlot && String(ioSlot.mainComponent && ioSlot.mainComponent.name));
  const ioLabel = ioInst && (function ft3(nd) { let o = null; (nd.children || []).forEach(c => { if (c.type === 'TEXT' && /Label|Button/.test(String(c.characters))) o = c; else { const r = ft3(c); if (r) o = r; } }); return o; })(ioInst);
  A('纯图标钮藏主档 Label（visible=false，不再泄漏「Label」文字）', !!ioLabel && ioLabel.visible === false,
    ioLabel && String(ioLabel.visible));
  A('纯图标钮计数入通知', doneMsg0 && /纯图标钮 1/.test(doneMsg0), doneMsg0);
  A('无图标槽家族整块回退本地（不产 ButtonNO 实例）',
    iconInsts.filter(i => { const vp = i.variantProperties ? Object.keys(i.variantProperties) : []; return vp.includes('Label#802'); }).length === 0
    && !iconInsts.some(i => String(i.name).includes('ms-btnop2')));
  const ioFallbackFrame = tree.find(n => String(n.name).startsWith('ms-btnop2')) || findBy(n => String(n.name).startsWith('ms-btnop2'))[0];
  A('回退本地重绘图标钮落图（边框热区本地 + 图标仍引用库）', !!ioFallbackFrame,
    (tree.map(n => n.name).join(',')));

  // ---- input 转化（2026-10-31 七轮，REQ-018 input 审计：Example/addon/afterIcon 三泄漏根因）----
  const inpSearch = iconInsts.find(i => String(i.name).includes('bc-eg71-toolbar-search'));
  A('搜索框落库实例', !!inpSearch);
  const isp = inpSearch && Object.assign({}, ...(inpSearch.setProps || []));
  A('addon 轴全关（addonBefore/addonAfter=false，http:// 前缀与附加块不泄漏）',
    !!isp && isp.addonBefore === false && isp.addonAfter === false, JSON.stringify(isp));
  A('afterIcon 关（左置图标不误开右侧图标）', !!isp && isp.afterIcon === false);
  A('preIcon 保默认 true（左图标槽在，供换装）', !!isp && isp.preIcon === undefined);
  A('搜索框高度判 Standard（32px）', inpSearch && inpSearch.variantProperties && inpSearch.variantProperties.Size === 'Standard',
    inpSearch && JSON.stringify(inpSearch.variantProperties));
  const isTxt = inpSearch && findFirstTextM(inpSearch);
  A('placeholder 改写（Example → 搜索占位文案）', !!isTxt && /搜索通道名称/.test(String(isTxt.characters)),
    isTxt && String(isTxt.characters));
  const isSlot = inpSearch && (function fs4(nd) { let o = null; (nd.children || []).forEach(c => { if (c.type === 'INSTANCE' && /icon/i.test(String(c.name))) o = c; else { const r = fs4(c); if (r) o = r; } }); return o; })(inpSearch);
  A('preIcon 槽换装 search2（图标真身随 demo）',
    !!isSlot && isSlot.mainComponent && /search2/.test(String(isSlot.mainComponent.name || '')),
    isSlot && String(isSlot.mainComponent && isSlot.mainComponent.name));
  const inpRange = iconInsts.find(i => String(i.name).includes('ms-input--range'));
  A('lg 输入高度判 Large（40px）', inpRange && inpRange.variantProperties && inpRange.variantProperties.Size === 'Large',
    inpRange && JSON.stringify(inpRange.variantProperties));
  const irTxt = inpRange && findFirstTextM(inpRange);
  A('值文案改写（2026-08-01 ~ 2026-08-31）', !!irTxt && /2026-08-01/.test(String(irTxt.characters)),
    irTxt && String(irTxt.characters));
  const rsp = inpRange && Object.assign({}, ...(inpRange.setProps || []));
  A('无图标输入 preIcon/afterIcon 全关（图标零泄漏）', !!rsp && rsp.preIcon === false && rsp.afterIcon === false);
  const inpBlank = iconInsts.find(i => String(i.name).includes('ms-input--blank'));
  A('空输入落库实例', !!inpBlank);
  const blankTexts = inpBlank ? (function ft4(nd) { const o = []; (nd.children || []).forEach(c => { if (c.type === 'TEXT') o.push(c); o.push(...ft4(c)); }); return o; })(inpBlank) : [];
  A('空输入藏主档 Example（TEXT 层全 visible=false，不再泄漏默认值）',
    blankTexts.length > 0 && blankTexts.every(t => t.visible === false),
    blankTexts.map(t => t.visible).join(','));
  A('空输入藏文案计数入通知', doneMsg0 && /空输入藏文案/.test(doneMsg0), doneMsg0);

  // ---- 十轮：真库 Input 结构 + Checkbox tag 轴（REQ-019 板审计：addon/前图标泄漏 + 表格勾选框文案）----
  const rlInst = (nm, root) => { let o = null; (function w5(n2) { if (o) return; (n2.children || []).forEach(c => { if (!o && String(c.name || '') === nm && c.type === 'INSTANCE') o = c; else w5(c); }); })(root); return o; };
  const visText = root => { let o = null; (function w6(nd) { (nd.children || []).forEach(c => { if (o || c.visible === false) return; if (c.type === 'TEXT') o = c; else w6(c); }); })(root); return o; };
  const rls = iconInsts.find(i => String(i.name).includes('rl-search'));
  A('真结构搜索框落库实例', !!rls);
  const addonInst = rls && rlInst('Input-Addon', rls);
  A('addon 结构隐藏（http:// 前缀块 visible=false）', !!addonInst && addonInst.visible === false,
    addonInst && String(addonInst.visible));
  const gearInst = rls && rlInst('Component 1', rls);
  A('设置图标附加块隐藏（visible=false）', !!gearInst && gearInst.visible === false,
    gearInst && String(gearInst.visible));
  const sufInst = rls && rlInst('input-suffix', rls);
  A('未换装图标槽隐藏（input-suffix visible=false）', !!sufInst && sufInst.visible === false,
    sufInst && String(sufInst.visible));
  const personSlot = rls && rlInst('icon/person', rls);
  A('person 前图标槽换装 search2（icL 位置证据选最左槽）',
    !!personSlot && personSlot.visible !== false && personSlot.mainComponent && /search2/.test(String(personSlot.mainComponent.name || '')),
    personSlot && String(personSlot.mainComponent && personSlot.mainComponent.name));
  const rlsVal = rls && visText(rls);
  A('值落值层（Example → 4900…，addon 内层 http:// 退出对位序列）',
    !!rlsVal && /4900 Water/.test(String(rlsVal.characters)), rlsVal && String(rlsVal.characters));
  const addonTxt = addonInst && (addonInst.children || []).find(c => c.type === 'TEXT');
  A('addon 内层 http:// 不被误写（红态下值会错落 addon 层）',
    !!addonTxt && addonTxt.characters === 'http://', addonTxt && String(addonTxt.characters));
  const rlv = iconInsts.find(i => String(i.name).includes('rl-value'));
  A('真结构无图标输入落库实例', !!rlv);
  const rlvPerson = rlv && rlInst('icon/person', rlv);
  A('无图标证据时前图标槽隐藏（person visible=false，库默认图标零泄漏）',
    !!rlvPerson && rlvPerson.visible === false, rlvPerson && String(rlvPerson.visible));
  const rlvVal = rlv && visText(rlv);
  A('无图标输入值改写（Example → Heat Meter 01）',
    !!rlvVal && /Heat Meter 01/.test(String(rlvVal.characters)), rlvVal && String(rlvVal.characters));
  const rcb = iconInsts.find(i => String(i.name) === 'ms-checkbox rl-check');
  A('裸勾选框落库实例', !!rcb);
  const rcsp = rcb && Object.assign({}, ...(rcb.setProps || []));
  A('tag 轴关（tag=false，标签结构不随默认 true 泄漏）', !!rcsp && rcsp.tag === false, JSON.stringify(rcsp));
  const rcbTxt = rcb ? (function ft5(nd) { const o = []; (nd.children || []).forEach(c => { if (c.type === 'TEXT') o.push(c); o.push(...ft5(c)); }); return o; })(rcb) : [];
  A('裸勾选框藏主档 Checkbox 文案（表格列只有勾选框、没有文本）',
    rcbTxt.length > 0 && rcbTxt.every(t => t.visible === false), rcbTxt.map(t => t.visible).join(','));
  const rcl = iconInsts.find(i => String(i.name) === 'ms-checkbox rl-check-label');
  A('带文本勾选框落库实例', !!rcl);
  const rclTxt = rcl && (rcl.children || []).find(c => c.type === 'TEXT');
  A('标题勾选框文本改写（Checkbox → 启用告警，不藏）',
    !!rclTxt && rclTxt.characters === '启用告警' && rclTxt.visible !== false,
    rclTxt && String(rclTxt.characters) + '/' + rclTxt.visible);
  A('十轮计数入通知（附加结构隐藏/图标槽隐藏）',
    doneMsg0 && /附加结构隐藏 [1-9]/.test(doneMsg0) && /图标槽隐藏 [1-9]/.test(doneMsg0), doneMsg0);

  // ---- 十一轮：步骤条逐项换库 steps-item（REQ-019 向导条；Status token 裁决 + Small 高度裁决 + tail 证据）----
  const stpA = iconInsts.find(i => i.name === 'ms-step ms-step--active');
  const stpB = iconInsts.find(i => i.name === 'ms-step');
  A('active 步骤落库实例（逐项映射，非本地重绘）', !!stpA);
  A('末步（wait）落库实例', !!stpB);
  const stpAvp = (stpA && stpA.variantProperties) || {};
  A('Status 修饰 token 裁决（进行中压过兜底等待）', stpAvp['Status 状态'] === '进行中', JSON.stringify(stpAvp));
  A('Layout 烤入 token（水平左对齐）', stpAvp['Layout 布局'] === '水平左对齐', JSON.stringify(stpAvp));
  const stpAsp = stpA && Object.assign({}, ...(stpA.setProps || []));
  A('Small 小型高度裁决（块 24 → true，步进 payload）', !!stpAsp && stpAsp['Small 小型'] === 'true', JSON.stringify(stpAsp));
  const stpBvp = (stpB && stpB.variantProperties) || {};
  A('末步裸类兜底 token（Status=等待）', stpBvp['Status 状态'] === '等待', JSON.stringify(stpBvp));
  const stpTexts = (inst) => inst ? (function ft6(nd) { const o = []; (nd.children || []).forEach(c => { if (c.type === 'TEXT') o.push(c); o.push(...ft6(c)); }); return o; })(inst).filter(t => t.visible !== false).map(t => t.characters).join('|') : '';
  const ta = stpTexts(stpA), tb = stpTexts(stpB);
  A('步号数字 + 标题按 demo 改写（icon 子实例内 TEXT 覆写）', ta === '1|设备信息', ta);
  A('末步步号 + 标题改写', tb === '2|对象配置', tb);
  const stepTail = (inst) => { let o = null; (function w9(nd) { (nd.children || []).forEach(c => { if (!o && /^tail$/i.test(String(c.name || ''))) o = c; else w9(c); }); })(inst); return o; };
  const tailA = stpA && stepTail(stpA), tailB = stpB && stepTail(stpB);
  A('active 步 tail 拉宽填满余宽（560-122=438）', !!tailA && Math.abs(tailA.width - 438) < 1, tailA && ('w=' + tailA.width));
  A('末步 tail 隐藏（demo 无连线，不再残留库定宽尾线）', !!tailB && tailB.visible === false, tailB && String(tailB.visible));
  A('步骤尾线计数入通知（1 藏/1 拉宽）', doneMsg0 && /步骤尾线 1 藏\/1 拉宽/.test(doneMsg0), doneMsg0);
  A('steps Small 轴走高度裁决计入通知（高度择尺寸 6，红态被 shape 兜底遮成 4）',
    doneMsg0 && /高度择尺寸 6/.test(doneMsg0), doneMsg0);

  // ---- 十一轮续（审计启用）：segmented/time-dot 逐项换库（「轴名=值」显式 token 防布尔轴串轴）----
  const segA = iconInsts.find(i => i.name === 'ms-segmented-item ms-segmented-item--active');
  const segB = iconInsts.find(i => i.name === 'ms-segmented-item');
  A('分段控制器 active 项落库实例（逐项映射，组轨道本地）', !!segA);
  A('分段控制器裸项落库实例', !!segB);
  const segAvp = (segA && segA.variantProperties) || {};
  A('「选中=true」显式轴 token 裁决', segAvp['选中'] === 'true', JSON.stringify(segAvp));
  A('布尔轴不串轴（悬停/禁用保持 false——红态裸值串开选「全开」变体）',
    segAvp['悬停'] === 'false' && segAvp['禁用'] === 'false', JSON.stringify(segAvp));
  A('尺寸轴 28 vs 大30/中26 平局不判（默认大，resize 吸收 2px）', segAvp['尺寸'] === '大', JSON.stringify(segAvp));
  const segBvp = (segB && segB.variantProperties) || {};
  A('裸项兜底（选中=false）', segBvp['选中'] === 'false', JSON.stringify(segBvp));
  const segTxt = segA ? (function ft7(nd) { const o = []; (nd.children || []).forEach(c => { if (c.type === 'TEXT') o.push(c); o.push(...ft7(c)); }); return o; })(segA).filter(t => t.visible !== false).map(t => t.characters).join('|') : '';
  A('分段项文案改写（Segment → 列表）', segTxt === '列表', segTxt);
  const dotW = iconInsts.find(i => i.name === 'ms-timeline-dot ms-timeline-dot--warm');
  const dotP = iconInsts.find(i => i.name === 'ms-timeline-dot');
  A('时间轴点落库实例（warm + 裸）', !!dotW && !!dotP);
  const dotWvp = (dotW && dotW.variantProperties) || {};
  const dotPvp = (dotP && dotP.variantProperties) || {};
  A('warm 修饰 → 等待档（库无 warm 档）', dotWvp['status 状态'] === '等待', JSON.stringify(dotWvp));
  A('裸点 → 进行中档', dotPvp['status 状态'] === '进行中', JSON.stringify(dotPvp));
  const wf = dotW ? (dotW.fills || []).map(p => p && p.color ? [p.color.r, p.color.g, p.color.b].map(x => Math.round(x * 100) / 100).join(',') : '?').join(';') : '';
  A('warm 点颜色按 HTML 覆写（等待档灰 → demo 橙，硬性颜色规则）', /0\.95,0\.6,0\.1/.test(String(wf)), String(wf));

  // ---- 对位-校验-自愈（2026-10-31 强化）：文字/内容错位 + 缺失三根因收口 ----
  const ordInst = iconInsts.find(i => i.name === 'ms-ord');
  const ordTexts = ordInst ? (ordInst.children || []).filter(c => c.type === 'TEXT') : [];
  const ordTop = ordTexts.find(t => t.y === 0), ordBottom = ordTexts.find(t => t.y === 40);
  A('属性定义序≠视觉序：标题/按钮不互换（视觉序对位）',
    !!ordInst && !!ordTop && !!ordBottom && ordTop.characters === '网关设置' && ordBottom.characters === '保存',
    ordInst && ordTexts.map(t => t.y + ':' + t.characters).join(' | '));
  A('库默认文案不残留（Title/Button 已改写）',
    !!ordInst && !ordTexts.some(t => t.characters === 'Title' || t.characters === 'Button'));
  A('属性层文字色也按 HTML 覆盖（不再只改回填层）',
    !!ordTop && ordTop.fills[0] && !ordTop.fills[0].boundVariables && ordTop.fills[0].color.r < 0.11
    && ordTop.fills[0].color.g < 0.11,
    ordTop && ordTop.fills[0] && JSON.stringify(ordTop.fills[0].color));
  const driftInst = iconInsts.find(i => i.name === 'ms-drift');
  const driftText = driftInst && (driftInst.children || []).find(c => c.type === 'TEXT');
  A('defaultValue 漂移自愈：属性写不进时 overrideText 兜底',
    !!driftText && driftText.characters === '新文案', driftText && driftText.characters);
  A('表达力守卫：装不下的块不硬替换（无 ms-under 实例）',
    findBy(n => n.type === 'INSTANCE' && n.name === 'ms-under').length === 0);
  const underTexts = findBy(n => n.type === 'TEXT' && /^M[1-6]$/.test(n.characters)).map(t => t.characters);
  A('表达力守卫：回退本地重绘 6 段全落图', underTexts.length === 6, underTexts.join('|'));
  A('文案改写/文字色计数入通知', doneMsg0 && /文案改写 [1-9]/.test(doneMsg0) && /文字色 [1-9]/.test(doneMsg0), doneMsg0);
  A('内容不齐回退计数入通知', doneMsg0 && /内容不齐回退 1/.test(doneMsg0), doneMsg0);

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
  // ---- 八轮（2026-10-31 REQ-018 defs 板）：mock 吞末变体后插件必须补挂回集 + 网格排布 + 集框收缩 ----
  const defSet = (function () { let o = null; (function w5(n2) { if (o) return; if (n2.type === 'COMPONENT_SET') { o = n2; return; } (n2.children || []).forEach(w5); })(figma.currentPage); return o; })();
  A('变体集补挂被吞变体（真 API 吞末个，插件对账回集）',
    !!defSet && defSet.children.length === 2, defSet && ('kids=' + defSet.children.length + ' names=' + defSet.children.map(c2 => c2.name).join(',')));
  A('变体集网格排布（两变体不叠位）',
    !!defSet && defSet.children.length === 2 && defSet.children[0].x !== defSet.children[1].x,
    defSet && defSet.children.map(c2 => c2.x + ',' + c2.y).join(' | '));
  A('变体集框收缩到内容（2 变体 60px + gutter 24 = 144）',
    !!defSet && Math.abs(defSet.width - 144) < 1, defSet && ('w=' + defSet.width));
  A('inst 引用实例化', findBy(n => n.type === 'INSTANCE' && n.variantProperties && n.variantProperties.Size).length >= 1);
  A('svg 矢量节点', findBy(n => n.type === 'FRAME' && (n.name === 'svg' || n.name === 's')).length >= 1);

  // ---- 同组件多实例按块改文案（2026-10-31：结构签名去文案，同构不同文案共用组件，实例逐段改写）----
  const c1Inst = findBy(n => n.type === 'INSTANCE' && n.name === 'Active')[0];
  const c1InstText = c1Inst && findFirstTextM(c1Inst);
  A('实例文案按本块改写（不残留 def 首块文案）', c1InstText && c1InstText.characters === '在线', c1InstText && c1InstText.characters);
  A('实例文字色按本块覆盖', c1InstText && c1InstText.fills[0] && c1InstText.fills[0].color
    && Math.abs(c1InstText.fills[0].color.g - 0.6) < 0.01, c1InstText && JSON.stringify(c1InstText.fills[0] && c1InstText.fills[0].color));
  A('实例文案改写计数入通知', doneMsg0 && /实例文案改写 3/.test(doneMsg0), doneMsg0);
  // ---- TEXT 属性化（2026-10-31，对标 code.to.design）：自建组件文本层暴露为 TEXT 组件属性，实例改文字走 setProperties ----
  const compA = (function findComp() { let o = null; (function w4(n2) { if (o) return; if (n2.type === 'COMPONENT' && n2.name === 'Active') { o = n2; return; } (n2.children || []).forEach(w4); })(figma.currentPage); return o; })();
  const compAdefs = (compA && compA.componentPropertyDefinitions) || {};
  const compAprop = Object.entries(compAdefs).find(([, d2]) => d2.type === 'TEXT');
  A('自建组件暴露 TEXT 属性', !!compAprop, JSON.stringify(compAdefs));
  const compAtext = compA && findFirstTextM(compA);
  A('TEXT 属性绑定文本层（references）', compAtext && compAtext.componentPropertyReferences
    && compAtext.componentPropertyReferences.characters === (compAprop && compAprop[0]),
    compAtext && JSON.stringify(compAtext.componentPropertyReferences));
  A('实例改写走 setProperties（右侧面板 string 字段）', c1Inst && Array.isArray(c1Inst.setProps)
    && c1Inst.setProps.some(p => compAprop && p[compAprop[0]] === '在线'),
    c1Inst && JSON.stringify(c1Inst.setProps));

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

  // ---- 结构哈希跨导入复用（2026-10-31 用户指令：先判断再建，同构不同文案只留一个组件）----
  // vname 改成不同文案 → 同名匹配必失配，只有 description 里的 'h2d-sig:' 结构指纹能命中既有组件
  const cntComps = nd => { let n = (nd.type === 'COMPONENT' || nd.type === 'COMPONENT_SET') ? 1 : 0; (nd.children || []).forEach(c => { n += cntComps(c); }); return n; };
  const compCountBefore3 = cntComps(figma.currentPage);
  const SCENE2 = JSON.parse(JSON.stringify(SCENE));
  SCENE2.defs.c1.vname = '离线';
  SCENE2.cells[0].root.ch.filter(n2 => n2.t === 'inst' && n2.d === 'c1').forEach(i2 => { i2.texts = ['离线']; i2.tcols = [[0.1, 0.6, 0.3]]; });
  SCENE2.cells[0].root.ch.push({ t: 'inst', d: 'c1', x: 0, y: 480, w: 60, h: 24, o: 1,
    texts: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7'], tcols: [] }); // 7 段 > 1 层+4 → 实例装不下，回退本地重绘
  // 八轮：伪元素文本层落图命名按字符（此前叫 pseudo-before → verify-import P4 文本比对必漏报）
  SCENE2.cells[0].root.ch.push({ t: 't', n: 'pseudo-before', text: '*', fs: 14, fw: 400, lh: 20, ls: 0, col: [0.9, 0.2, 0.2], al: 'left', x: 0, y: 300, w: 7, h: 20, o: 1 });
  await handler({ type: 'scene', json: SCENE2 });
  const doneMsg3 = calls.notify.filter(t => t.indexOf('导入完成') === 0).pop();
  A('结构哈希复用（vname 不同也命中既有）', doneMsg3 && /复用既有 2/.test(doneMsg3), doneMsg3);
  A('哈希复用不新建组件', cntComps(figma.currentPage) === compCountBefore3,
    compCountBefore3 + ' → ' + cntComps(figma.currentPage));
  A('实例内容回退入通知', doneMsg3 && /实例内容回退 1/.test(doneMsg3), doneMsg3);
  const boardsAll = figma.currentPage.children.filter(n => n.type === 'FRAME' && /MockTest/.test(n.name) && !/组件定义/.test(n.name));
  const board3 = boardsAll[boardsAll.length - 1];
  const inst3 = board3 && (function f3(nd) { let o = null; (function w3(n2) { if (o) return; if (n2.type === 'INSTANCE' && n2.name === 'Active') { o = n2; return; } (n2.children || []).forEach(w3); })(nd); return o; })(board3);
  const inst3Text = inst3 && findFirstTextM(inst3);
  A('哈希复用实例文案随块改写（离线）', inst3Text && inst3Text.characters === '离线', inst3Text && inst3Text.characters);
  const pseudoT = (function () { let o = null; (function w6(n2) { if (o) return; if (n2.type === 'TEXT' && n2.characters === '*') { o = n2; return; } (n2.children || []).forEach(w6); })(board3); return o; })();
  A('伪元素文本层按字符命名（P4 可见，不再叫 pseudo-before）',
    !!pseudoT && pseudoT.name === '*', pseudoT && ('name=' + pseudoT.name));

  // ---- 外部网页模式（2026-10-30 用户裁定：复制的网页链接不走本地组件）----
  // scene.ext=1 → 不拉库目录（getTeamLibraryAsync 不新增）、通知报「外部网页 · 纯图层」而非库/令牌段。
  // 多 cell = build-scene --ext 三路多帧（--viewport 多视口 / 批量位置参数 / --site 自动发现），cells 纵向堆叠 → 插件每 cell 落一帧。
  // free 层四能力靶子：cell.u + n.lk 原型连线、clip 高帧 overflow VERTICAL、n.ff 字体映射、重复实色 ≥3 本地色样式
  const teamLibBeforeExt = calls.teamLib;
  const combineBeforeExt = calls.combineAsVariants.length;
  const BLUE = [0.2, 0.4, 0.8]; // #3366CC —— 重复实色靶子
  const extCell = (label, y, u, ch) => ({ label, x: 0, y, u, w: 800, h: 600,
    root: { t: 'f', f: [{ c: [1, 1, 1], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 0, w: 800, h: 600, o: 1, ch } });
  await handler({
    type: 'scene', json: {
      v: 2, name: 'ExtPage', ext: 1,
      cells: [
        extCell('1. 首页 /', 0, '/', [
          T('Hello Web'),
          T('Arial Font', { ff: 'Arial, sans-serif', y: 30 }),
          { t: 'f', n: 'nav-about', f: [{ c: BLUE, a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 60, w: 120, h: 32, o: 1, lk: '/about',
            ch: [T('About', { col: [1, 1, 1] })] },
          { t: 'f', n: 'side-blue', f: [{ c: BLUE, a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 640, y: 60, w: 100, h: 200, o: 1 },
          { t: 'f', n: 'footer-blue', f: [{ c: BLUE, a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 480, w: 800, h: 60, o: 1 },
          { t: 'f', n: 'tall-clip', f: [{ c: [0.95, 0.95, 0.96], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: true, x: 0, y: 300, w: 300, h: 120, o: 1,
            ch: [{ t: 'f', n: 'inner-tall', f: [{ c: [0.8, 0.8, 0.85], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 0, w: 300, h: 500, o: 1 }] },
          { t: 'f', n: 'sticky-top', f: [{ c: [0.1, 0.1, 0.1], a: 1 }], e: [], r: { tl: 0, tr: 0, br: 0, bl: 0 }, clip: false, x: 0, y: 550, w: 800, h: 40, o: 1, fix: 1 },
        ]),
        extCell('2. 首页 / ·390px', 664, undefined, [T('Hello Web Mobile')]),
        extCell('3. 关于 /about', 1328, '/about', [T('About Page')]),
      ],
    },
  });
  const extMsg = calls.notify.filter(t => t.indexOf('导入完成') === 0).pop();
  A('外部网页通知报纯图层模式', extMsg && /外部网页 · 纯图层/.test(extMsg) && !/库组件实例/.test(extMsg) && !/令牌绑定/.test(extMsg), extMsg);
  A('外部网页不报库实例 0 异常', extMsg && !/库导入失败/.test(extMsg), extMsg);
  A('外部网页不拉库目录', calls.teamLib === teamLibBeforeExt, 'teamLib=' + calls.teamLib + ' before=' + teamLibBeforeExt);
  A('外部网页不建组件', calls.combineAsVariants.length === combineBeforeExt, 'combine=' + JSON.stringify(calls.combineAsVariants));
  const extBoard = figma.currentPage.children.find(n => n.type === 'FRAME' && /ExtPage/.test(n.name));
  A('外部网页画板落图层', !!extBoard, figma.currentPage.children.map(n => n.name).join(','));
  const extFrames = extBoard ? extBoard.children.filter(n => n.type === 'FRAME') : [];
  A('外部网页多页落多帧（每 cell 一帧带序号标签，含 ·390px 视口帧）',
    extFrames.length === 3 && /1\./.test(extFrames[0].name) && /·390px/.test(extFrames[1].name) && /3\./.test(extFrames[2].name),
    extFrames.map(f => f.name).join(','));
  A('外部网页多帧按 scene 堆叠定位', extFrames[1] && Math.abs(extFrames[1].y - 664) < 1 && extFrames[2] && Math.abs(extFrames[2].y - 1328) < 1,
    'y=' + (extFrames[1] && extFrames[1].y) + ',' + (extFrames[2] && extFrames[2].y));

  // ---- free 层核心能力断言（2026-10-30 free-features 全量对标）----
  const extFind = (re) => { let o = null; (function w3(n3) { if (o) return; if (re.test(String(n3.name || ''))) { o = n3; return; } (n3.children || []).forEach(w3); })(extBoard || { children: [] }); return o; };
  // ① automatic linking：nav-about 带 lk:'/about' → ON_CLICK NAVIGATE 到 cell3 帧
  const navN = extFind(/^nav-about$/);
  A('自动连线挂 reactions',
    !!(navN && navN.reactions && navN.reactions.length === 1 && navN.reactions[0].action.destinationId === extFrames[2].id
      && navN.reactions[0].action.navigation === 'NAVIGATE'),
    navN && navN.reactions ? JSON.stringify(navN.reactions[0] && navN.reactions[0].action) : 'no reactions');
  // ② scroll support：tall-clip 裁切且内容 500 > 帧 120+40 → overflowDirection VERTICAL
  const tallN = extFind(/^tall-clip$/);
  A('overflow 滚动 VERTICAL', !!(tallN && tallN.overflowDirection === 'VERTICAL'), tallN && tallN.overflowDirection);
  // ③ replace missing fonts：ff 'Arial, sans-serif' → 首族 Arial 生效
  const arialN = (function () { let t2 = null; (function w4(n4) { if (t2) return; if (n4.type === 'TEXT' && n4.characters === 'Arial Font') { t2 = n4; return; } (n4.children || []).forEach(w4); })(extBoard || { children: [] }); return t2; })();
  A('字体映射 Arial 生效', !!(arialN && arialN.fontName && arialN.fontName.family === 'Arial'), arialN && arialN.fontName && arialN.fontName.family);
  // ④ use local styles：BLUE ×3 → #3366CC paint style 创建并回绑
  const blueStyle = PAINT_STYLES.find(s => s.name === '#3366CC');
  A('重复实色建本地色样式', !!blueStyle, 'styles=' + PAINT_STYLES.map(s => s.name).join(','));
  A('本地色样式回绑节点',
    !!(blueStyle && ((navN && navN.paintStyleId === blueStyle.id) || (extFind(/^side-blue$/) || {}).paintStyleId === blueStyle.id)),
    'nav=' + (navN && navN.paintStyleId) + ' styleId=' + (blueStyle && blueStyle.id));
  // ⑤ fixed/sticky 提升：sticky-top 成为 cell 帧直接子节点（不被内层裁走）
  const stickyN = extFind(/^sticky-top$/);
  A('吸顶元素提升为 cell 直接子节点',
    !!(stickyN && stickyN.parent && /1\./.test(String(stickyN.parent.name || ''))),
    stickyN && stickyN.parent && stickyN.parent.name);
  A('能力计数进通知', extMsg && /原型连线 1/.test(extMsg) && /滚动 1/.test(extMsg) && /本地色样式/.test(extMsg) && /吸顶 1/.test(extMsg) && /字体映射 1/.test(extMsg), extMsg);

  // ---- 历史一键重导（clientStorage 代理：save → get 回环）----
  await handler({ type: 'history-save', list: [{ payload: { url: 'https://a.com' }, label: 'a.com/', time: '10-30 12:00' }] });
  await handler({ type: 'history-get' });
  const histMsg = calls.uiPost.filter(m => m && m.type === 'history').pop();
  A('历史 clientStorage 读写回环（save→get→ui 收到）',
    !!histMsg && Array.isArray(histMsg.list) && histMsg.list.length === 1 && histMsg.list[0].label === 'a.com/',
    JSON.stringify(histMsg && histMsg.list));

  // ---- 构建号护栏（r8+）：面板旧代码（scene.build ≠ 插件 PLUGIN_BUILD）→ 拒导提示重开面板；匹配 → 正常导入 ----
  {
    const pbM = code.match(/PLUGIN_BUILD\s*=\s*'([^']+)'/);
    A('插件声明 PLUGIN_BUILD', !!pbM, 'code 中未找到 PLUGIN_BUILD 常量');
    if (pbM) {
      // 红态：scene 构建号比插件新（= 面板开着没重开、跑的是旧代码）→ 必须拒导：有重开面板提示、无导入完成
      const redScene = JSON.parse(JSON.stringify(SCENE)); redScene.build = 'r999';
      const n0 = calls.notify.length;
      await handler({ type: 'scene', json: redScene });
      A('护栏拒导旧面板（提示重开、无导入完成）',
        calls.notify.slice(n0).some(t => /旧版|重新打开/.test(t)) && !calls.notify.slice(n0).some(t => t.indexOf('导入完成') === 0),
        calls.notify.slice(n0).join(' | '));
      // 绿态：构建号匹配 → 放行正常导入
      const greenScene = JSON.parse(JSON.stringify(SCENE)); greenScene.build = pbM[1];
      const n1 = calls.notify.length;
      await handler({ type: 'scene', json: greenScene });
      A('护栏匹配放行（导入完成照常）',
        calls.notify.slice(n1).some(t => t.indexOf('导入完成') === 0),
        calls.notify.slice(n1).join(' | '));
    }
  }

  const doneMsg = calls.notify.find(t => t.indexOf('导入完成') === 0);
  A('完成通知', !!doneMsg, calls.notify.join(' | '));
  if (doneMsg) console.log('  通知: ' + doneMsg);

  console.log('\n=== figma-mock: ' + pass + ' 通过 / ' + fail + ' 失败');
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('✗ harness 异常:', e); process.exit(1); });
