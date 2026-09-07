---
name: B_FilterBar
description: 筛选栏（业务组件）
---

# 筛选栏 · B_FilterBar

> **逻辑名**：`B_FilterBar`
> **现 id**：`bc-filter-bar`
> **分类**：列表
> **entityHint**：`device`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
关键词搜索 + 状态/分组/时间筛选 + 批量操作与导出，是所有列表页的标准头部。

### 何时用
- 列表页顶部，把「搜索 + 下拉筛选 + 日期范围 + 重置/查询」打包成一行。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 只要搜索不要多维筛选 | `S_Input` 内联 |
| 复杂高级筛选抽屉 | `B_DetailDrawer` 承载筛选表单 |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Input` | `ms-input ms-input--sm` | 关键词搜索框 |
| `S_Select` | `ms-select ms-select--sm` | 状态/分组下拉 |
| `S_DatePicker` | `ms-input`（readonly 日期区间） | 时间范围 |
| `S_Button` | `ms-btn` | 重置/查询 |
| `S_Form` / `S_Space` | `ms-form/space` | 布局 |

### render 骨架（业务框架）
1. `ms-card` → `ms-card-body--tight` → `.bc-filter` 弹性行。
2. 左：搜索框 + 状态 select（实体 statuses）+ 分组 select + 日期区间。
3. 右：`.bc-filter-actions`（`margin-left:auto`）放 重置/查询。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-filter-bar', cn: '筛选栏', cat: '列表', desc: '关键词搜索 + 状态/分组/时间筛选…', atoms: ['input','select','date-picker','button','form','space'], entityHint: 'device', tags: ['筛选','搜索','查询','过滤','批量','导出','列表','管理'], render(ctx) { /* ms-card → bc-filter → 搜索/select/日期/actions */ } }
```

### 上下文 ctx 契约
- `ctx.entity.cn`（搜索占位）、`ctx.entity.statuses`（状态下拉选项）。

### 结构类（`library/business.css`）
`.bc-filter`（flex wrap）、`.bc-filter-search/select/date`（定宽）、`.bc-filter-actions`（右对齐）。响应式 `980px` 断点折叠为整行。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-filter-bar`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
