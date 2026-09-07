---
name: B_StatusTag
description: 状态标签（业务组件）
---

# 状态标签 · B_StatusTag

> **逻辑名**：`B_StatusTag`
> **现 id**：`bc-status-tag`
> **分类**：原子业务
> **entityHint**：`device`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
把业务状态枚举（在线/离线/异常）映射为令牌色标签，统一全站状态语义。

### 何时用
- 页头/卡片头展示实体全部状态枚举的图例。
- 任何需要「一组状态语义预览」的地方。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 表格单元格单条状态 | `U.statusTag()` 直接内联（`B_DataTable`） |
| 状态 + 数量角标 | `B_MetricCard` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Tag` | `ms-tag ms-tag--success/error/warm/primary` | 状态色标签 |
| `S_Badge` | —（角标语义预留） | 徽标语义 |

### render 骨架（业务框架）
1. 外层 `ms-space ms-space--8` 横向排布。
2. 逐条 `entity.statuses` → `U.statusTag(s)`（tone→`ms-tag--*`）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-status-tag', cn: '状态标签', cat: '原子业务', desc: '把业务状态枚举映射为令牌色标签…', atoms: ['tag','badge'], entityHint: 'device', tags: ['状态','在线','离线','标签','枚举'], render(ctx) { /* ms-space--8 → U.statusTag */ } }
```

### 上下文 ctx 契约
- `ctx.entity.statuses`：状态枚举数组（`{cn,tone}`），`tone` ∈ `success/error/warm/primary/muted`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-status-tag`
- 结构类：无新增（复用 `ms-space`）
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
