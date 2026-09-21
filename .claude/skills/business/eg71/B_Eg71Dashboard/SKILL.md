---
name: B_Eg71Dashboard
version: 1.0.0
description: EG71 Dashboard 内容区卡片墙（业务组件）
---

# Dashboard 卡片墙 · B_Eg71Dashboard

> **逻辑名**：`B_Eg71Dashboard`
> **现 id**：`bc-eg71-dashboard`
> **分类**：概览
> **entityHint**：`gateway`
> **产品线**：`eg71`
> **依赖基础组件**：`ms-grid-3`（间接经 `bc-eg71-protocol-card`：`ms-card` / `ms-ico` / `ms-tag`）

---

## 1. 描述

EG71 Dashboard 页内容区容器：以三列栅格编排一组 [[B_Eg71ProtocolCard]]（`bc-eg71-protocol-card`），展示各协议接口的连接状态。供 `MS_EG71_SHELL.render(ctx, opts)` 在 `ctx.route === '/dashboard'` 时通过 `opts.content` 接入，替换默认的 `bc-eg71-content` 设置表单。

不是什么：不是路由分发逻辑本身（路由判断由页面组装层/调用方做，本组件只负责渲染卡片墙），不重复 `bc-eg71-protocol-card` 的单卡逻辑。

## 2. 组装契约（atoms 依赖 + ctx + render/bind 骨架）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Grid`（布局工具类） | `ms-grid-3` | 三列响应式栅格（≤980px 降 2 列，≤640px 降 1 列） |
| 间接依赖 `B_Eg71ProtocolCard` | — | 逐卡渲染委托给 `bc-eg71-protocol-card.render` |

### ctx 上下文契约

- `ctx.cards`：卡片数据数组（只读），每项形状同 `bc-eg71-protocol-card` 的 `ctx.card`（见其 SKILL.md 第 2 节）。
- 其余字段（`ctx.entity`/`ctx.route` 等）原样透传给每个 `bc-eg71-protocol-card.render`。

### render(ctx) 骨架

1. 外层 `ms-grid-3.bc-eg71-dashboard`。
2. `ctx.cards.map(card => B['bc-eg71-protocol-card'].render({ ...ctx, card }))`，逐卡渲染并拼接。

### bind(root) 骨架

- 幂等、可空跑：委托给 `bc-eg71-protocol-card.bind(root)`（子项 `stopPropagation` 兜底），本组件不额外绑定事件。

## 3. 状态

无自身可交互态（纯编排容器）；卡片级 hover/点击态见 [[B_Eg71ProtocolCard]] 第 3 节。

## 4. 场景

**何时用**：EG71 Dashboard 首屏内容区，需要多协议连接状态卡片墙。

**何时不用**：

| 场景 | 改用 |
|---|---|
| 通用设置表单页内容区 | `bc-eg71-content` |
| 单张协议卡渲染（非卡片墙布局） | 直接调用 `bc-eg71-protocol-card` |

## 5. Token

无自有 token（栅格间距由 `ms-grid-3` 基础类的 `--spacing-16` 提供），卡片级 token 见 [[B_Eg71ProtocolCard]] 第 5 节。

### 间距红线（见 `rules/spacing.md` §1）

- 卡片墙栅格 gap `--spacing-16`（合规下限，不得低于）。
- 本组件作为一个**模块**接入页面时，与上下相邻模块的纵向间距 **≥ `--spacing-24`**，由页面内容容器（`mod-*` / 内容区 flex gap）承载，卡片墙自身不管。

## 6. 依赖

`atoms`：`grid`（复用基础栅格工具类）；组装依赖 `bc-eg71-protocol-card`，不新增基础原子。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
const ctx = {
  entity: window.MS_ENTITIES.gateway,
  route: '/dashboard',
  cards: [
    { icon: 'cellular', title: 'Cellular Network', value: 'Connect', tone: 'success', route: '/network/cellular' },
    { icon: 'wlan', title: 'WLAN', value: 'Disabled', tone: 'muted', route: '/network/wlan' },
    { icon: 'rs485', title: 'RS485', items: [
      { tag: 'RS485-1', label: 'Modbus RTU', tone: 'link', route: '/network/rs485-1' },
      { tag: 'RS485-2', label: 'BACnet MS/TP', tone: 'link', route: '/network/rs485-2' }
    ]}
  ]
};
const app = document.getElementById('app');
app.innerHTML = window.MS_EG71_SHELL.render(ctx, { content: B['bc-eg71-dashboard'].render(ctx) });
window.MS_EG71_SHELL.bind(app);
app.addEventListener('eg71-protocol-navigate', (e) => {
  console.log(e.detail.sub ? '子项跳转' : '整卡跳转', e.detail.route);
});
```

参见 `output/eg71-dashboard-cards-verify.html`。

## 8. 版本

见 frontmatter `version:`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-dashboard`
- 结构类：`library/business.css`（`.bc-eg71-dashboard`）
- 依赖组件：`.claude/skills/business/eg71/B_Eg71ProtocolCard/SKILL.md`
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 示例页：`output/eg71-dashboard-cards-verify.html`
