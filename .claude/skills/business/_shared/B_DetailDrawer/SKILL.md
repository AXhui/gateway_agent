---
name: B_DetailDrawer
description: 详情抽屉（业务组件）
---

# 详情抽屉 · B_DetailDrawer

> **逻辑名**：`B_DetailDrawer`
> **现 id**：`bc-detail-drawer`
> **分类**：详情
> **entityHint**：`alarm`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
侧滑抽屉承载单条记录的详情，含属性描述、状态时间轴与处理操作。

### 何时用
- 从列表点击进入单条详情，用 `S_Drawer` 侧滑展示。
- 需要「属性 + 时间轴 + 处理按钮」的详情场景。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 详情独立成页 | `B_EntityCard` |
| 批量任务步骤弹窗 | `B_UpgradeModal` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Drawer` | `ms-drawer` | 侧滑容器 |
| `S_Descriptions` | `ms-desc` | 属性描述 |
| `S_Timeline` | `ms-timeline` | 状态时间轴 |
| `S_Tag` | `ms-tag` | 状态 |
| `S_Button` | `ms-btn` | 处理/关闭 |
| `S_Divider` | `ms-divider` | 分段 |

### render 骨架（业务框架）
1. `ms-drawer` 头：标题 + 状态标签 + 关闭。
2. 属性区：`ms-desc` 逐字段 `U.cellHtml`。
3. 时间轴区：`ms-timeline` 逐条 `U.statusOf` 状态节点。
4. 脚：处理按钮（主行动）+ 关闭。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-detail-drawer', cn: '详情抽屉', cat: '详情', desc: '侧滑抽屉承载单条详情，含属性、时间轴与处理…', atoms: ['drawer','descriptions','timeline','tag','button','divider'], entityHint: 'alarm', tags: ['详情','抽屉','处理','时间轴','查看','单条'], render(ctx) { /* drawer → desc → timeline → footer */ } }
```

### 上下文 ctx 契约
- `ctx.entity.fields`（属性）、`ctx.rows`（选中单条）、`ctx.entity.events`（时间轴事件）。

### 结构类（`library/business.css`）
`.bc-drawer-static`（预览态抽屉定位）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-detail-drawer`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `alarm`）
- 令牌（只读）：`.claude/tokens/tokens.css`
