---
name: B_Eg71DeviceLibTable
version: 1.0.0
description: 设备库型号表（内置库/自定义库共用 · EG71）
---

# B_Eg71DeviceLibTable · 设备库型号表

## 1. 描述

**这是什么**：Data Services → Data Library 页的型号主表（Figma 71.0.0.4 内置库帧），内置库 / 自定义库两页签共用：Device Model / Service Reference Count（计数下钻链接）/ Operation（eye 图标钮）三列，**全列左对齐**（EG71 表格左对齐契约硬性落地：数字列 `bc-num`、操作列 `bc-eg71-table-ops`，禁用 `ms-table-num`/`ms-table-ops`），表尾 Total N + 单页分页。

**不是什么**：不是带勾选/批量操作的管理表（那是 `bc-data-table`，本组件按 EG71 左对齐契约从其骨架做字段迁移铸造）；不做筛选工具栏（页面头行由 `bc-com-title` 承载）；不渲染型号详情（view/count 以事件交宿主）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. Props（组装契约）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.rows` | `{model, refs}[]` | `[]` | 行数据；空数组渲染 ms-empty 空态 |
| `ctx.total` | number | `rows.length` | 表尾 Total 值（可与可见行数解耦） |
| `ctx.modelTitle` / `ctx.countTitle` / `ctx.opsTitle` | string | `'Device Model'` / `'Service Reference Count'` / `'Operation'` | 列头文案 |
| `ctx.emptyText` | string | `'No device models'` | 空态文案 |

事件：`eg71-devicelib-count`（detail.model，计数下钻）、`eg71-devicelib-view`（detail.model，型号查看）。

atoms 依赖：`S_Table`（`ms-table`）、`S_Button`（`ms-btn--sm` icon 钮）、`S_Icon`（eye 16 / fileText 32 空态）、`S_Pagination`（`ms-pagination` 只读单页）、`S_Empty`。不新增基础原子，仅编排。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 数据态 | `rows` 非空 | 三列左对齐 + Total N 表尾 |
| 空态 | `rows` 为空 | ms-empty（fileText 32 + 文案） |
| count hover | 计数链接悬停 | `ms-link` 下划线 |
| view hover/focus | eye 钮 | `ms-btn` 原生态 + `aria-label` |

## 4. 场景

- **何时用**：内置库页签（Inbuilt Data Parsing Library）、自定义库页签（Custom Data Parsing）的型号列表。
- **何时不用**：带勾选/批量/多选的设备管理表 → `bc-data-table`；协议卡列表 → `bc-eg71-protocol-card`。

## 5. Token

`--color-text-primary`（型号名）、`--color-text-link-normal/hover`（计数链接，经 `ms-link`）、`--color-text-secondary`（表尾，经 `ms-text--secondary`）、`--font-mono` + `--color-text-auxiliary`（bc-num/em，经既有 bc-num 结构类）、`--spacing-12`（表尾上距）。

## 6. 依赖

`render(ctx)` + `bind(root)`；注册：`registry-business.js#bc-eg71-device-lib-table`。左对齐契约类名（`bc-num` / `bc-eg71-table-ops`）均为 `library/business.css` 既有结构类。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
el.innerHTML = B['bc-eg71-device-lib-table'].render({
  rows: [{ model: 'AM319', refs: 6 }, { model: 'BU-KMC6727', refs: 2 }],
  total: 17
});
B['bc-eg71-device-lib-table'].bind(el);
el.addEventListener('eg71-devicelib-count', e => drillDown(e.detail.model));
```

## 8. 版本

见 frontmatter `version:`。
