---
name: B_Eg71DashboardDevices
version: 0.1.0
description: EG71 Dashboard「Access devices」接入设备总览面板（业务组件）
---

# 接入设备总览面板 · B_Eg71DashboardDevices

> **逻辑名**：`B_Eg71DashboardDevices`
> **运行时 id**：`bc-eg71-dashboard-devices`
> **分类**：概览
> **entityHint**：`gateway`
> **产品线**：`eg71`
> **依赖基础组件**：`ms-card` / `ms-progress` / `ms-text`

---

## 1. 描述

Milesight 网关 Dashboard 总览页的「Access devices」面板：三段式进度条（在线/离线/未激活）+ 图例统计，展示该网关下接入设备的总览分布。

不是什么：不是设备列表（那是列表页的 `DataTable` 编排），不是单台设备详情（那是设备详情组件），本组件只做总览页的聚合统计展示，无交互跳转。

## 2. 组装契约（atoms 依赖 + ctx + render 骨架）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 面板容器（边框/圆角/背景 + `ms-card-head--plain` 标题条） |
| `S_Progress` | `ms-progress` / `ms-progress-line` / `ms-progress-bar` | 三段式进度条：`--success`（在线）/ `--error`（离线）/ `--muted`（未激活，本组件新增修饰符，见第 5 节） |
| `S_Text` | `ms-text--auxiliary` / `ms-text--sm` | 图例文案（标签 + 数值） |

### ctx 上下文契约

- `ctx.devices`：只读统计对象，形状：
  ```js
  { online: 12, offline: 3, notActivated: 5, total: 20 }
  ```
  - `total` 缺省时按 `online+offline+notActivated` 兜底；三项均缺省时按 0 处理，进度条整体退化为空。
  - 组件不持有任何设备明细，不做分页/筛选，纯只读聚合展示。

### render(ctx) 骨架

1. `.ms-card.bc-eg71-dashboard-devices` → `ms-card-head--plain`（标题「Access devices」）→ `ms-card-body`。
2. `ms-progress-line` 内按 online/offline/notActivated 顺序渲染三个 `ms-progress-bar`，各自 `width` 按占比内联计算（百分比是渲染态的数值计算，非新增视觉常量，不违反铁律一）。
3. 图例行：每项一个色点（`bc-eg71-dashboard-devices-dot--<tone>`）+ 标签 + 数值，末尾追加 Total 汇总项（`margin-left:auto` 右对齐）。

本组件无 `bind`（纯展示，无交互），符合「幂等、可空跑」——不提供也视为空跑。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 默认 | 有数据 | 三段进度条按各自占比渲染，首段左圆角、末段右圆角 |
| 单项为 0 | 某类别数值为 0 | 该段 `width:0%`，不单独隐藏，图例仍显示「0」 |
| 全部为 0 | `total` 兜底为 1 且三项均 0 | 进度条视觉退化为空条，图例全部显示 0 |

## 4. 场景

**何时用**：EG71 Dashboard 总览页，需要「接入设备总量 + 在线/离线/未激活分布」的聚合统计入口。

**何时不用**：

| 场景 | 改用 |
|---|---|
| 设备明细列表（可筛选/分页） | 列表页 `DataTable` 编排 |
| 单台设备详情 | 设备详情组件（非本组件范畴） |
| 无分布语义的纯数值指标 | `bc-metric-card` |

## 5. Token

`--color-success-normal` / `--color-error-normal` / `--color-icon-auxiliary`（未激活灰态，见下）/ `--color-text-primary` / `--radius-full` / `--spacing-4` / `--spacing-12` / `--spacing-16`

**新增修饰符说明**：`.ms-progress-bar` 基础组件只有 `success`/`error`/`warm` 三变体，Figma 第三态（未激活）为灰色，无对应基础变体。按 `eg71` skill 铁律一「业务组件配色写死」的例外处理方式，在 `library/business.css`（非 `base.css`）新增 `.ms-progress-bar--muted { background: var(--color-icon-auxiliary); }`——纯令牌引用，不新增裸色值，属于业务层允许的 L2 修饰符补充，不下沉进基础组件文档。

## 6. 依赖

`atoms`：`card` / `progress` / `text`（见第 2 节表），不新增基础原子，仅编排 + 一个纯令牌引用的进度条修饰符（见第 5 节）。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
B['bc-eg71-dashboard-devices'].render({
  devices: { online: 12, offline: 3, notActivated: 5, total: 20 }
});
```

参见 `output/eg71-dashboard-verify.html`。

## 8. 版本

见 frontmatter `version:`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-dashboard-devices`
- 结构类：`library/business.css`（`.bc-eg71-dashboard-devices*`，含 `.ms-progress-bar--muted`）
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 示例页：`output/eg71-dashboard-verify.html`
