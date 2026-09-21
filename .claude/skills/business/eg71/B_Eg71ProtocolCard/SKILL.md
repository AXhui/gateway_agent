---
name: B_Eg71ProtocolCard
version: 1.0.0
description: EG71 Dashboard 协议连接状态卡（业务组件）
---

# 协议连接状态卡 · B_Eg71ProtocolCard

> **逻辑名**：`B_Eg71ProtocolCard`
> **现 id**：`bc-eg71-protocol-card`
> **分类**：概览
> **entityHint**：`gateway`
> **产品线**：`eg71`
> **依赖基础组件**：`ms-card` / `ms-ico` / `ms-tag`

---

## 1. 描述

Milesight 网关 Dashboard 上展示单个协议接口（Cellular / WLAN / Ethernet / LoRaWAN / RS485 / IO / KNX-TP / M-Bus）连接状态的卡片。默认灰边、无箭头；hover 后边框转主蓝并浮现跳转箭头，整卡可点击直达该协议的详情/配置页。多子项协议（RS485/IO/KNX-TP/M-Bus）在卡内额外渲染 Tag+名称/数值子项行，子项数值可呈蓝色链接态，单独跳转该子项自己的详情页。

不是什么：不是设置表单容器（那是 `bc-eg71-content`），不是通用信息展示卡（那是 `bc-entity-card`，无跳转语义）。

## 2. 组装契约（atoms 依赖 + ctx + render/bind 骨架）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 卡片容器（边框/圆角/背景） |
| `S_Icon` | `ms-ico` | 协议图标（24px）+ 悬浮箭头（16px chevronRight） |
| `S_Tag` | `ms-tag` | 多子项行的 Tag 徽标（如 `RS485-1`、`AO`） |

### ctx 上下文契约

- `ctx.card`：单卡数据对象（只读），形状：
  ```js
  {
    icon: 'cellular',            // MS_ICONS key
    title: 'Cellular Network',
    route: '/network/cellular',  // 整卡点击目标；省略则不可点击、不显示箭头
    value: 'Connect',            // 单值卡：状态文案
    tone: 'success',             // 单值卡文本语义：success/muted/plain
    items: [                     // 多子项卡：与 value/tone 二选一
      { tag: 'RS485-1', label: 'Modbus RTU', tone: 'link', route: '/network/rs485-1' },
      { tag: 'AO', label: '0', tone: 'muted' }
    ]
  }
  ```
- 变更一律走回调：组件不持有路由状态、不直接跳转（不写 `location.href`）。整卡/子项点击由 `bind(root)` 统一委托为 `eg71-protocol-navigate` 冒泡自定义事件（`detail: {route, sub}`），由宿主（页面组装层）监听后决定实际导航方式（SPA 路由 / 真实页面跳转），符合「Props 进，事件出」单向数据流铁律。

### render(ctx) 骨架

1. 卡片根元素统一用 `<div class="ms-card bc-eg71-protocol-card">`（不用 `<a>`——多子项卡内部还有独立可点击的子项元素，嵌套 `<a>` 是非法 HTML）；有 `route` 时加 `bc-eg71-protocol-card--clickable` 修饰符 + `data-route` 属性。
2. 图标 + 标题 + （单值 `value` 或多子项 `items` 二选一渲染）+ 有 `route` 时追加箭头 `span`。
3. 多子项每行：`ms-tag` 徽标 + 值（`tone: link` 且有 `route` 时该值元素带 `data-sub-route` 属性）。

### bind(root) 骨架

- 幂等、可空跑：
  1. 对 `[data-sub-route]` 元素挂 click：`e.stopPropagation()`（阻止触发外层整卡）+ 派发 `eg71-protocol-navigate`（`sub:true`）。
  2. 对 `.bc-eg71-protocol-card[data-route]` 挂 click：派发 `eg71-protocol-navigate`（`sub:false`）。
- 不管理任何内部状态，重复调用不重复绑定副作用（原生 `addEventListener` 幂等性依赖宿主每次重渲染后重新 `bind` 新 DOM，与项目现有 `bind` 契约一致）。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 默认 | 无 | 1px `--color-border-base` 灰边，箭头 `opacity:0` |
| Hover（可点击卡） | 鼠标移入 `.bc-eg71-protocol-card--clickable` | 边框转 `--color-border-primary-normal`（240ms 过渡），箭头 `opacity:1` 且向右滑入 |
| 子项默认（link） | 无 | `--color-text-link-normal` 蓝色，无下划线 |
| 子项 Hover（link） | 鼠标移入 | 颜色转 `--color-text-link-hover`，出现下划线 |
| 不可点击 | `card.route` 为空 | 无 hover 边框变化、无箭头，纯展示 |

## 4. 场景

**何时用**：EG71 Dashboard 首屏，需要「协议图标 + 状态值/子项 + 一键跳转详情」的连接状态入口。

**何时不用**：

| 场景 | 改用 |
|---|---|
| 纯设置表单字段 | `bc-eg71-content` 内的 `bc-eg71-form-item-*` |
| 无跳转语义的实体信息卡 | `bc-entity-card` |
| 首屏纯数值指标（无跳转） | `bc-metric-card` |

## 5. Token

`--color-border-base` / `--color-border-primary-normal` / `--color-text-primary` / `--color-text-success-normal` / `--color-text-auxiliary` / `--color-text-link-normal` / `--color-text-link-hover` / `--color-icon-primary-normal` / `--spacing-4` / `--spacing-8` / `--spacing-12` / `--spacing-16` / `--duration-normal` / `--ease`

### 间距与尺寸红线（见 `rules/spacing.md`）

- 卡片内边距 **≥16px**（推荐 `--spacing-16` 竖向 × `--spacing-20` 横向）；旧 12px 竖向档废止。
- 数值展示字号走数值家族（16 / 18 / 20），标题/说明走正文字号集合（14 / 12），**禁止 13px**。
- 图标经 `S_Icon`，16px 起、阶梯 16/20/24；卡片内图标与标题 gap ≥ `--spacing-8`。

## 6. 依赖

`atoms`：`card` / `icon` / `tag`（见第 2 节表），不新增基础原子，仅编排。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
// 单值卡
B['bc-eg71-protocol-card'].render({ card: {
  icon: 'cellular', title: 'Cellular Network', value: 'Connect', tone: 'success', route: '/network/cellular'
}});
// 多子项卡（RS485）
B['bc-eg71-protocol-card'].render({ card: {
  icon: 'rs485', title: 'RS485',
  items: [
    { tag: 'RS485-1', label: 'Modbus RTU', tone: 'link', route: '/network/rs485-1' },
    { tag: 'RS485-2', label: 'BACnet MS/TP', tone: 'link', route: '/network/rs485-2' }
  ]
}});
// 卡片墙 + 绑定 + 监听导航事件（宿主自行决定跳转方式）
const app = document.getElementById('app');
app.innerHTML = B['bc-eg71-dashboard'].render({ cards: [...] });
B['bc-eg71-dashboard'].bind(app);
app.addEventListener('eg71-protocol-navigate', (e) => {
  console.log(e.detail.sub ? '子项跳转' : '整卡跳转', e.detail.route);
});
```

参见 `output/eg71-dashboard-cards-verify.html`。

## 8. 版本

见 frontmatter `version:`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-protocol-card`（图标：`MS_ICONS.cellular/wlan/ethernet/lorawan/rs485/io/knx/mbus`）
- 结构类：`library/business.css`（`.bc-eg71-protocol-card*`）
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 示例页：`output/eg71-dashboard-cards-verify.html`
