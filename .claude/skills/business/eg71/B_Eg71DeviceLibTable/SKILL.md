---
name: B_Eg71DeviceLibTable
version: 2.0.0
description: 设备库型号表（内置库/自定义库共用 · 6 列 · EG71）
---

# B_Eg71DeviceLibTable · 设备库型号表

## 1. 描述

**这是什么**：Data Services → Data Library 页的型号主表（Figma 71.0.0.4 内置库主帧 387:78306 **6 列**真源），内置库 / 自定义库两页签共用：Device Model / Vendor / Protocol Type / Number of Objects / Device Reference Count（计数下钻链接）/ Operation（view 形态单 eye 钮；manage 形态追加 edit/trash 钮），**全列左对齐**（EG71 表格左对齐契约硬性落地：数字列 `bc-num`、操作列 `bc-eg71-table-ops`，禁用 `ms-table-num`/`ms-table-ops`），表尾 Total N + 分页（页码可点翻页）。

**不是什么**：不是带勾选/批量操作的管理表（那是 `bc-data-table`）；不做筛选工具栏（页面头行由 `bc-com-title` 承载）；不渲染型号详情（view/count/edit/delete 以事件交宿主）。v1.x 为 3 列（Device Model / Service Reference Count / Operation），v2.0.0 起按 Figma 主帧升 6 列，列头默认值同步变更。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. Props（组装契约）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.rows` | `{model, vendor?, protocol?, objects?, refs}[]` | `[]` | 行数据；vendor/protocol 缺省渲染 `—`；空数组渲染 ms-empty 空态 |
| `ctx.total` | number | `rows.length` | 表尾 Total 值（可与可见行数解耦，分页页数由 total/pageSize 派生） |
| `ctx.opsMode` | `'view' \| 'manage'` | `'view'` | view=单 eye 钮；manage=eye + edit + trash 三钮（自定义库页签） |
| `ctx.pageSize` / `ctx.page` | number | `10` / `1` | 分页尺寸与当前页（页码点击派发事件，宿主重渲染） |
| `ctx.modelTitle` 等 | string | `'Device Model'` / `'Vendor'` / `'Protocol Type'` / `'Number of Objects'` / `'Device Reference Count'` / `'Operation'` | 六列列头文案（`modelTitle/vendorTitle/protocolTitle/objectsTitle/countTitle/opsTitle`） |
| `ctx.emptyText` | string | `'No device models'` | 空态文案 |

事件：`eg71-devicelib-count`（detail.model，计数下钻）、`eg71-devicelib-view`（detail.model，型号查看）、`eg71-devicelib-edit` / `eg71-devicelib-delete`（detail.model，仅 manage）、`eg71-devicelib-page`（detail.page，翻页）。

atoms 依赖：`S_Table`（`ms-table`）、`S_Button`（`ms-btn--sm` icon 钮）、`S_Icon`（eye/edit/trash 16 / fileText 32 空态）、`S_Pagination`（`ms-pagination`）、`S_Empty`。不新增基础原子，仅编排。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 数据态 | `rows` 非空 | 六列左对齐 + Total N + 页码表尾 |
| 空态 | `rows` 为空 | ms-empty（fileText 32 + 文案） |
| count hover | 计数链接悬停 | `ms-link` 下划线 |
| 行内钮 hover/focus | eye/edit/trash | `ms-btn` 原生态 + `aria-label`/`title` |

## 4. 场景

- **何时用**：内置库页签（Inbuilt Data Parsing Library，opsMode=view）、自定义库页签（Custom Data Parsing，opsMode=manage）的型号列表。
- **何时不用**：带勾选/批量/多选的设备管理表 → `bc-data-table`；协议卡列表 → `bc-eg71-protocol-card`。

## 5. Token

`--color-text-primary`（型号名 + 表头范式字色）、`--color-text-link-normal/hover`（计数链接，经 `ms-link`）、`--color-text-secondary`（表尾，经 `ms-text--secondary`）、`--color-fill-base-normal`（表头底色，EG71 表头黑色加粗范式：500/14px/主文本色，与 `.bc-eg71-table thead th` 共享规则，v2.0.0 起经并列选择器 `.bc-eg71-device-lib-table thead th` 生效——不挂 `bc-eg71-table` 裸类以免其 20px padding 副作用）、`--font-mono` + `--color-text-auxiliary`（bc-num/em，经既有 bc-num 结构类）、`--spacing-12`（表尾上距）。

## 6. 依赖

`render(ctx)` + `bind(root)`；注册：`registry-business.js#bc-eg71-device-lib-table`。左对齐契约类名（`bc-num` / `bc-eg71-table-ops`）均为 `library/business.css` 既有结构类。**v2.0.0 为 Props 契约破坏性变更**（rows 增字段 + 列头默认值变更 + opsMode 新增）；已交付 demo（REQ-004/017）内联副本冻结不受影响。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
el.innerHTML = B['bc-eg71-device-lib-table'].render({
  rows: [
    { model: 'AM319', vendor: 'Milesight', protocol: 'LoRaWAN', objects: 12, refs: 6 },
    { model: 'AM02', vendor: 'Milesight', protocol: 'LoRaWAN', objects: 9, refs: 2 }
  ],
  total: 17, page: 1, opsMode: 'manage'
});
B['bc-eg71-device-lib-table'].bind(el);
el.addEventListener('eg71-devicelib-edit', e => openEditor(e.detail.model));
```

## 8. 版本

见 frontmatter `version:`。
