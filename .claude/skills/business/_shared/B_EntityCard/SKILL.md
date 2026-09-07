---
name: B_EntityCard
description: 实体卡片（业务组件）
---

# 实体卡片 · B_EntityCard

> **逻辑名**：`B_EntityCard`
> **现 id**：`bc-entity-card`
> **分类**：详情
> **entityHint**：`device`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
卡片形态展示单个实体的关键属性与操作，适合详情区与卡片墙。

### 何时用
- 卡片墙/详情区，以 `ms-grid-3` 三列铺陈实体样例。
- 需要「标题 + 状态 + 属性描述 + 底部操作」的卡片式信息。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 只读属性强调层级 | `S_Descriptions`（基础组件） |
| 侧边详情抽屉 | `B_DetailDrawer` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card--hoverable` | 卡片容器 |
| `S_Descriptions` | `ms-desc` | 属性描述列表 |
| `S_Tag` | `ms-tag`（经 `U.statusTag`） | 状态 |
| `S_Button` | `ms-btn` | 底部操作 |
| `S_Avatar` | `ms-avatar` | 用户微态（`U.cellHtml` user 类型） |

### render 骨架（业务框架）
1. `ms-grid-3` → 逐行 `ms-card--hoverable.bc-entity-card`。
2. 卡头：`ms-card-title`（图标 + 名称）+ 状态标签。
3. 卡体：`ms-desc` 逐字段（过滤 `status`，取前 6）`U.cellHtml`。
4. 卡脚：编辑 + 主行动（`e.actions[0]`）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-entity-card', cn: '实体卡片', cat: '详情', desc: '卡片形态展示单个实体的关键属性与操作…', atoms: ['card','descriptions','tag','button','avatar'], entityHint: 'device', tags: ['卡片','详情','属性','概览','信息'], render(ctx) { /* ms-grid-3 → card → head/desc/foot */ } }
```

### 上下文 ctx 契约
- `ctx.entity.fields/actions`、`ctx.rows`、`ctx.icon`（卡头图标 key）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-entity-card`
- 结构类：`library/business.css`（无专属 bc-*，复用 ms-*）
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
