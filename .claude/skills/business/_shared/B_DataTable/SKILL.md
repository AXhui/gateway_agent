---
name: B_DataTable
description: 数据表格（业务组件）
---

# 数据表格 · B_DataTable

> **逻辑名**：`B_DataTable`
> **现 id**：`bc-data-table`
> **分类**：列表
> **entityHint**：`device`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
带多选、状态列、进度列与行内操作的主数据表，列定义由实体字段自动装配。

### 何时用
- 列表管理页的主表格，列来自 `entity.fields`、行内操作来自 `entity.actions`。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 成员/角色专属表格 | `B_MemberTable` |
| 告警事件专属表格 | `B_Eg71Alarm` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | `ms-table-wrap/toolbar/table` | 表格骨架 |
| `S_Checkbox` | `ms-checkbox` | 多选列 |
| `S_Tag` | `ms-tag`（经 `U.statusTag`） | 状态列 |
| `S_Button` | `ms-btn` | 工具栏/行内操作 |
| `S_Pagination` | `ms-pagination` | 分页 |
| `S_Empty` / `S_Avatar` | `ms-empty` / `ms-avatar` | 空态 / 用户列 |

### render 骨架（业务框架）
1. 工具栏：标题 + 计数角标 + 列设置/导出/新增。
2. 表头：首列 checkbox + 实体字段列（`num/percent` 右对齐）+ 操作列。
3. 表体：`U.cellHtml(c, r, e)` 按字段 `type` 分派（status/level/percent/code/user/role/num/time）。
4. 表尾（`ctx.plain` 为假时）：`bc-table-foot` 已选数 + 批量操作 + 分页。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-data-table', cn: '数据表格', cat: '列表', desc: '带多选、状态列、进度列与行内操作的主数据表…', atoms: ['table','checkbox','tag','button','pagination','empty','avatar'], entityHint: 'device', tags: ['列表','表格','管理','批量','数据','分页','明细'], render(ctx) { /* toolbar → table → cellHtml 分派 → 表尾 */ } }
```

### 上下文 ctx 契约
- `ctx.entity.fields`（列）、`ctx.entity.actions`（行内操作，取前 3）、`ctx.rows`（`MS_DATA.build`）、`ctx.plain`（是否省略表尾）。

### 结构类（`library/business.css`）
`.bc-col-check`（44px 复选列）、`.bc-count`、`.bc-table-foot`（表尾）、`.bc-bar`（进度列）、`.bc-code/num/time/user`（单元格微态）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-data-table`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
