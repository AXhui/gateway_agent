---
name: B_DataTable
version: 1.2.0
description: 数据表格（业务组件）：v1.2.0 站点转录新增 icon 操作列形态与 link 计数下钻单元格
---

# 数据表格 · B_DataTable

## 1. 描述

带多选、状态列、进度列与行内操作的主数据表，列定义由实体字段自动装配 —— 是「列表管理页」的主表格骨架。v1.2.0（站点转录，依据 `output/eg71-site-distill/diff-matrix.md` §1#5）：① `ctx.opsMode="icon"` 操作列形态；② 字段 `type:"link"` 计数下钻链接单元格（站点 data-forwarding Object Count `<a>31</a>` 同构）。默认行为不变，向后兼容。

**不是什么**：不是基础组件（表格视觉/交互属 `S_Table`）；不是成员/告警等专属表格（见 §4 替代表）。

- **归属**：`_shared/`（`com` 跨线通用）· 包 `ui-core`
- **entityHint**：`device`（列与行内操作由 `ctx.entity` 注入，换实体即复用）

## 2. Props（组装契约）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | `ms-table-wrap/toolbar/table` | 表格骨架 |
| `S_Checkbox` | `ms-checkbox` | 多选列 |
| `S_Tag` | `ms-tag`（经 `U.statusTag`） | 状态列 |
| `S_Button` | `ms-btn` | 工具栏 / 行内操作 |
| `S_Pagination` | `ms-pagination` | 分页 |
| `S_Empty` / `S_Avatar` | `ms-empty` / `ms-avatar` | 空态 / 用户列 |

### ctx 上下文契约（只读，变更走回调）

| 字段 | 说明 |
|---|---|
| `ctx.entity.fields` | 列定义（`type` 驱动单元格分派；**v1.2.0 新增 `type:"link"`** = 计数下钻链接单元格） |
| `ctx.entity.actions` | 行内操作，取前 3 |
| `ctx.rows` | 行数据；缺省时 `MS_DATA.build(entity, 6)` 造数 |
| `ctx.plain` | 真 = 省略表尾（批量操作 + 分页） |
| `ctx.embedded` | 真 = 卡片内嵌形态：省略工具栏 / 复选列 / 表尾，首行不高亮（v1.1.0 新增，列表管理页以外的卡片表格场景） |
| `ctx.opsMode` | `'link'`（默认，文字按钮）/ `'icon'`（**v1.2.0 站点转录**：icon-only 反馈色操作钮 + `aria-label` + 16px 间距；站点 ms-table-pro 操作列同构，如 equipment-data / data-forwarding 的 edit·delete icon 钮）。动作名→图标映射：edit/delete/monitor/view/detail/copy，其余 moreHoriz |

## 3. 状态

| 状态 | 表现 | 来源 |
|---|---|---|
| 行选中 | 首行 `ms-table-row--active` + checkbox 勾选（前 2 行默认勾选演示） | `S_Table` / `S_Checkbox` 基础态 |
| 单元格微态 | status / level / percent / code / user / role / num / time 按 `type` 分派（`U.cellHtml`） | 本组件 render |
| 表尾省略 | `ctx.plain` 为真时不渲染 `bc-table-foot` | 本组件 render |
| 内嵌形态 | `ctx.embedded` 为真时只出「列头 + 行 + 操作列」，供卡片内嵌（如 `bc-eg71-content` 的 Data Forwarding 表格） | 本组件 render |

## 4. 场景

**何时用**：列表管理页的主表格 —— 列来自 `entity.fields`、行内操作来自 `entity.actions`，需要多选 + 批量操作 + 分页。

**何时不用**：

| 场景 | 改用 |
|------|------|
| 复杂表格（树形 / 行内编辑 / 列搜索·筛选·排序·显隐 / 条件搜索卡片） | `B_ComTablePro`（Table Pro 组合表格，规范稿） |
| 成员/角色权限表格 | `B_MemberTable` |
| EG71 告警事件表格 | `B_Eg71Alarm` |
| 详情页描述列表 | `B_DetailDrawer` 内描述项 |

## 5. Token（设计令牌清单）

> 只列本组件结构类**直接引用**的令牌（`library/business.css`）；`ms-*` 基础控件自身的令牌见 `S_Table` 等各基础组件文档，不在此重复。

| 令牌 | 用在哪 |
|---|---|
| `--spacing-4 / -8 / -12 / -16` | `.bc-count` 间距、`.bc-bar`/`.bc-user` gap、`.bc-table-foot` 内边距、`.bc-num em` 间距 |
| `--color-divider-base-1` | `.bc-table-foot` 上边线 |
| `--color-base-bg` | `.bc-table-foot` 背景 |
| `--color-fill-base-hover` | `.bc-bar-track` 轨道底色 |
| `--color-success-normal / --color-warm-normal / --color-error-normal` | `.bc-bar-track--success/warm/error` 进度色 |
| `--color-primary-bg` | `.bc-code` 代码底色 |
| `--color-text-primary / -secondary / -auxiliary` | `.bc-num` / `.bc-bar em` / `.bc-num em` 文字色 |
| `--radius-4 / --radius-full` | `.bc-code` 圆角 / `.bc-bar-track` 圆角 |
| `--font-mono` | `.bc-bar em` / `.bc-num` / `.bc-time` 等宽数字 |

**待收敛裸值**（令牌无命中，登记在案；L1 增补字号/尺寸令牌后替换）：

| 裸值 | 位置 |
|---|---|
| `44px` | `.bc-col-check` 复选列宽 |
| `56px / 6px` | `.bc-bar-track` 轨道宽/高 |
| `12px` | `.bc-bar em` / `.bc-num em` / `.bc-time` 字号（L1 无字号令牌） |

## 6. 依赖

- `atoms` 序列见 §2，全部为已封装基础组件 id（`registry-base.js` 在册），R3 依赖闭环可校验。
- 声明**不新增基础原子，仅编排**。
- 依赖版本范围：`ui-core ^1.1.0`（见 `skills/business/GOVERNANCE.md`）。

## 7. 示例

```js
// render 骨架（registry-business.js#bc-data-table）
render(ctx) {
  const e = ctx.entity, rows = ctx.rows || MS_DATA.build(e, 6);
  // 1 工具栏：标题 + 计数角标 + 列设置/导出/新增
  // 2 表头：checkbox 列 + 实体字段列（num/percent 右对齐）+ 操作列
  // 3 表体：U.cellHtml(c, r, e) 按字段 type 分派单元格微态
  // 4 表尾（!ctx.plain）：bc-table-foot 已选数 + 批量操作 + ms-pagination
}
// bind：无（分页/勾选为基础组件原生态，静态稿无业务行为注入）
```

页面侧消费：只允许经模块装配引用（如 `M_FilterList` = `B_FilterBar` + `B_DataTable`），页面不直接内联其内部 `ms-*` —— 见 `.claude/rules/page-assembly.md`。

## 8. 版本

见 frontmatter `version:`（正文不重复维护）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-data-table`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
