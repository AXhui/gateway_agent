---
name: B_EmptyState
description: 空态引导（业务组件）
---

# 空态引导 · B_EmptyState

> **逻辑名**：`B_EmptyState`
> **现 id**：`bc-empty-state`
> **分类**：引导
> **entityHint**：`device`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
无数据/首次开通的空态引导，含插画、说明与行动按钮。

### 何时用
- 首次进入无数据、或需引导开通/初始化的页面。
- 需要「插画 + 说明 + 主行动」的引导场景。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 表格内局部空态 | `S_Empty`（基础组件） |
| 结果页（成功/失败） | `S_Result` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Empty` | `ms-empty` | 空态骨架 |
| `S_Button` | `ms-btn` | 主行动 |
| `S_Result` | `ms-result` | 结果语义 |
| `S_Space` | `ms-space` | 布局 |

### render 骨架（业务框架）
1. `ms-empty` 插画 + 主文案 + 副文案。
2. `.bc-empty-actions`：主行动按钮（开通/添加）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-empty-state', cn: '空态引导', cat: '引导', desc: '无数据/首次开通的空态引导，插画 + 说明 + 行动…', atoms: ['empty','button','result','space'], entityHint: 'device', tags: ['空态','引导','无数据','首次','开通','初始化'], render(ctx) { /* ms-empty → 文案 → bc-empty-actions(主行动) */ } }
```

### 上下文 ctx 契约
- `ctx.empty.cn`（主文案）、`ctx.empty.sub`（副文案）、`ctx.empty.action`（行动文案）。

### 结构类（`library/business.css`）
`.bc-empty-actions`（行动按钮组居中）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-empty-state`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
