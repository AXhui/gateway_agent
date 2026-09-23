---
name: B_Eg71PageBack
version: 1.0.0
description: EG71 子页返回头（业务组件）：48px 白底下边框条，20px 返回箭头 + 页标题，站点 title-back 同构（9 页共用）
---

# EG71 子页返回头 · B_Eg71PageBack

> **逻辑名**：`B_Eg71PageBack`
> **现 id**：`bc-eg71-page-back`
> **分类**：数据服务
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：有（返回点击 → `eg71-page-back` 冒泡）
> **站点依据**：`output/eg71-site-distill/` 9 页 `.title-back`（add-device / batch-import / scan-config / scan-confirm / scan-device / multicast-form / forwarding-form / parsing-detail ×2；CSS：48px 高、12/20 内距、20px 返回图标 + 20px/600 标题）

## 1. 描述

**这是什么**：EG71 子页/向导页的返回头：48px 白底下边框条，左 20px 返回箭头按钮（padding 撑 24px+ 热区）+ 页标题（`ms-h2`，22px/600）。新增/编辑/向导/详情类子页的标准头。

**不是什么**：不是面包屑（面包屑在顶栏 `bc-eg71-topnav`，站点两处并存）；不做路由跳转——点击以事件交宿主。

**归属产品线**：`eg71`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn--text` | 返回箭头按钮（24px+ 热区） |
| `S_Icon` | `ico('arrowLeft', 20)` | 返回箭头（20px 阶梯） |
| `S_Typography` | `ms-h2` | 页标题（22px/600——站点 20px 不在库标题原子阶梯，取最近阶梯，diff-matrix D1） |

### ctx 上下文契约（只读，变更走回调）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.title` | string | `'Upload File'` | 子页标题（站点 batch-import 首步形态） |
| `ctx.backLabel` | string | `'Back to ' + title` | 返回钮 aria-label |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-page-back` | `{ from }` | 点击返回钮（from = 当前标题） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 默认 | — | 白底 48px 条 + 下边框 |
| hover | 悬停返回钮 | `ms-btn--text` 悬停态 |
| 键盘可达 | Tab | button 原生聚焦；`aria-label` 可读 |

## 4. 场景（Scenarios）

**何时用**：列表页下钻出的新增/编辑表单、多步向导（batch-import / scan-config 三步流）、详情子页——凡站点用 `title-back` 的场景。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 一级页面（面包屑+页签/工具栏） | `bc-eg71-topnav` + `bc-eg71-page-tabs` / `bc-eg71-toolbar` |
| 卡片标题 | `bc-com-title`（level=card） |

## 5. Token（设计令牌）

- 底/边框：`--color-bg-card` / `--color-border-base`
- 图标：`--color-icon-normal`（20px）
- 间距：`--spacing-48`（条高）/ `--spacing-20`（左右内距）/ `--spacing-12`（箭头→标题）/ `--spacing-4`（热区 padding）

## 6. 依赖（Dependencies）

`atoms: ['button','icon','typography']`——仅编排。结构类 `.bc-eg71-page-back(-btn/-title)`（`library/business.css`）。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
el.innerHTML = B['bc-eg71-page-back'].render({ title: 'Add Device' }) + formHtml;
B['bc-eg71-page-back'].bind(el);
el.addEventListener('eg71-page-back', () => router.push('/data-services/equipment-data'));
```

## 8. 版本（Version）

见 frontmatter `version:`。
