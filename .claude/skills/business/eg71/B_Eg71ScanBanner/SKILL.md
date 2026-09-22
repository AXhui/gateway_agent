---
name: B_Eg71ScanBanner
version: 1.0.0
description: EG71 全局扫描提示条（业务组件）：扫描中常驻、红点/设备数角标、visited 置灰、整条可点击跳扫描确认页
---

# 全局扫描提示条 · B_Eg71ScanBanner

## 1. 描述

**这是什么**：EG71 LoRaWAN 扫描入网的**全局**提示条：网关扫描中挂载于所有页面，常驻文字「正在LoRaWAN扫描中」+ LoRaWAN 图标 + 红点/未添加设备数角标；点击整条跳转扫描确认页。点击后（或传入 `visited:true`）红点去除、提示条变灰，设备数保留（交互 #4）。

**不是什么**：不是页内引导/异常横幅（那是 `bc-eg71-alert-bar`）；自身不做路由跳转——结构上用 `div + data-route` 委托（与 `bc-eg71-protocol-card` 迁移范式一致，不嵌 `<a>`），点击以 `eg71-scan-navigate` 冒泡，由宿主（`MS_EG71_SHELL` 路由源）执行跳转。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Badge` | `ms-badge` / `ms-badge-dot` / `ms-badge-count` | LoRaWAN 图标上的红点 + 未添加设备数角标 |
| `S_Icon` | `ico('lorawan', 20)` / `ico('chevronRight', 16)` | 协议图标（20px）与右向箭头（16px） |
| `S_Typography` | `ms-text` / `ms-text--secondary` / `ms-text--sm` | 常驻文字与「未添加设备 N」计数 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.scanning` | boolean | `false` | **false 时整体不渲染**（返回 `''`）——非扫描中无此条 |
| `ctx.visited` | boolean | `false` | 是否已访问过扫描确认页：true 走 visited 灰态、去红点、保留计数 |
| `ctx.unaddedCount` | number | `0` | 未添加设备数（= 扫描确认页中未被添加的节点数）；>0 才渲染角标 |
| `ctx.route` | string | `'/data-services/data-acquisition/lorawan-scan/confirm'` | 跳转路由（写入 `data-route`） |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-scan-navigate` | `{ route, visited }` | 点击整条 / 键盘 Enter·Space（`role=link` + `tabindex=0` 可聚焦） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| active（默认） | 扫描中且有新设备未查看 | `.bc-eg71-scan-banner--active`：primary-bg 底 + primary 边框；`ms-badge-dot` 红点 + `ms-badge-count` 计数 |
| visited | `ctx.visited:true`（已进过确认页） | `.bc-eg71-scan-banner--visited`：fill-base-normal 灰底 + base 边框；红点去除、计数保留；图标转次级色 |
| 计数为 0 | `unaddedCount <= 0` | 不渲染 dot/count（仅常驻文字） |
| 键盘可达 | Tab 聚焦 | `:focus-visible` 2px primary 外描边 |

## 4. 场景（Scenarios）

**何时用**：LoRaWAN 扫描进行中，需要在所有页面（含状态页）常驻展示扫描状态与新设备提醒时。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 页内引导/异常说明（不可跳转） | `bc-eg71-alert-bar` |
| 扫描确认页顶部 OTAA 引导 | `bc-eg71-alert-bar`（info 态） |
| 设备列表中的信号/状态展示 | `bc-eg71-device-list` / `bc-eg71-scan-device-table` |

## 5. Token（设计令牌）

- active 底/边：`--color-primary-bg` / `--color-primary-normal`（hover 边框 `--color-primary-hover`）
- visited 底/边：`--color-fill-base-normal` / `--color-border-base`
- 图标：`--color-icon-primary-normal`（active）/ `--color-icon-secondary`（visited 图标与箭头）
- 间距：`--spacing-12`（条内 gap）/ `--spacing-12`·`--spacing-16`（条内边距）
- 圆角：`--radius-4`

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `badge` / `icon` / `typography`。结构类 `.bc-eg71-scan-banner(--active/--visited)` / `.bc-eg71-scan-banner-badge/-text/-count/-arrow`（`library/business.css`），纯布局与令牌引用。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
shell.innerHTML = B['bc-eg71-scan-banner'].render({ scanning: true, unaddedCount: 3 });
B['bc-eg71-scan-banner'].bind(shell);

shell.addEventListener('eg71-scan-navigate', e => {
  // 宿主路由源执行跳转；再次渲染时传 visited: true 进入灰态
  router.push(e.detail.route);
  shell.innerHTML = B['bc-eg71-scan-banner'].render({ scanning: true, visited: true, unaddedCount: 3 });
  B['bc-eg71-scan-banner'].bind(shell);
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
