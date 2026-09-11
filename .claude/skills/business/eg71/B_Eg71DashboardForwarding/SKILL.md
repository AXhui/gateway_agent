---
name: B_Eg71DashboardForwarding
version: 0.1.0
description: EG71 Dashboard「Data forwarding」数据转发入口面板（业务组件）
---

# 数据转发入口面板 · B_Eg71DashboardForwarding

> **逻辑名**：`B_Eg71DashboardForwarding`
> **运行时 id**：`bc-eg71-dashboard-forwarding`
> **分类**：概览
> **entityHint**：`gateway`
> **产品线**：`eg71`
> **依赖基础组件**：`ms-card` / `ms-ico` / `ms-btn`

---

## 1. 描述

Milesight 网关 Dashboard 总览页的「Data forwarding」面板：VPN / Routing information / Host 三行入口，每行左图标 + 标题 + 右箭头，整行可点击跳转对应详情抽屉。

不是什么：不是协议连接状态卡（那是 `bc-eg71-protocol-card`，展示连接状态值/子项），本组件三行都是纯导航入口，无状态值展示。

## 2. 组装契约（atoms 依赖 + ctx + render/bind 骨架）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 面板容器（边框/圆角/背景 + `ms-card-head--plain` 标题条） |
| `S_Icon` | `ms-ico` | 每行左侧图标（20px）+ 右侧跳转箭头（16px chevronRight） |
| `S_Button` | — | 行为整行可点击入口，语义等价按钮交互（无独立 `ms-btn` 元素，交互契约随铁律一「控件必调基础组件」以图标+可点击行结构承载，不重复描述按钮基础组件自身状态） |

### ctx 上下文契约

- `ctx.forwards`：只读数组，形状：
  ```js
  [
    { icon: 'topology', title: 'VPN', route: '/network/vpn' },
    { icon: 'log', title: 'Routing information', route: '/network/routing' },
    { icon: 'device', title: 'Host', route: '/network/host' }
  ]
  ```
  - `icon` 为 `MS_ICONS` key；VPN/Routing/Host 无专用图标 key，遵守「不新造图标」原则分别复用 `topology`（网络路径语义）/ `log`（表格列表语义）/ `device`（通用设备语义）。
  - 变更一律走回调：组件不持有路由状态、不直接跳转。行点击由 `bind(root)` 委托为 `eg71-protocol-navigate` 冒泡自定义事件（`detail: {route, sub: false}`）——**复用 `bc-eg71-protocol-card` 已定的事件契约，不新造事件名**，与宿主页面既有的协议卡导航监听共用同一个事件通道。

### render(ctx) 骨架

1. `.ms-card.bc-eg71-dashboard-forwarding` → `ms-card-head--plain`（标题「Data forwarding」）→ `ms-card-body`。
2. 逐行渲染 `.bc-eg71-dashboard-forwarding-row[data-route]`：图标 + 标题 + 箭头。

### bind(root) 骨架

- 幂等、可空跑：对 `.bc-eg71-dashboard-forwarding-row[data-route]` 逐个挂 click，派发 `eg71-protocol-navigate`（`sub:false`）。
- 不管理任何内部状态，重复调用不重复绑定副作用（依赖宿主每次重渲染后重新 `bind` 新 DOM，与项目现有 `bind` 契约一致）。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 默认 | 无 | 行底部 1px 分隔线（`--color-divider-base-1`），末行无分隔线 |
| Hover | 鼠标移入某行 | 文字/图标/箭头统一转 `--color-primary-normal` |

## 4. 场景

**何时用**：EG71 Dashboard 总览页，需要「纯导航入口列表」（无状态值展示、点击直达详情）的场景。

**何时不用**：

| 场景 | 改用 |
|---|---|
| 需展示协议连接状态值/子项 | `bc-eg71-protocol-card` |
| 侧边栏级导航 | `bc-eg71-sidenav` |
| 表单提交类操作 | `bc-eg71-form-footer` |

## 5. Token

`--color-divider-base-1` / `--color-primary-normal` / `--color-text-primary` / `--color-text-auxiliary` / `--spacing-12`

## 6. 依赖

`atoms`：`card` / `icon` / `button`（见第 2 节表），不新增基础原子，仅编排；复用 `eg71-protocol-navigate` 事件契约，不新造事件名。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
const app = document.getElementById('app');
app.innerHTML = B['bc-eg71-dashboard-forwarding'].render({
  forwards: [
    { icon: 'topology', title: 'VPN', route: '/network/vpn' },
    { icon: 'log', title: 'Routing information', route: '/network/routing' },
    { icon: 'device', title: 'Host', route: '/network/host' }
  ]
});
B['bc-eg71-dashboard-forwarding'].bind(app);
app.addEventListener('eg71-protocol-navigate', (e) => {
  console.log('跳转', e.detail.route);
});
```

参见 `output/eg71-dashboard-verify.html`。

## 8. 版本

见 frontmatter `version:`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-dashboard-forwarding`
- 结构类：`library/business.css`（`.bc-eg71-dashboard-forwarding*`）
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 示例页：`output/eg71-dashboard-verify.html`
