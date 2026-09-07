---
name: B_MemberTable
description: 成员权限表（业务组件）
---

# 成员权限表 · B_MemberTable

> **逻辑名**：`B_MemberTable`
> **现 id**：`bc-member-table`
> **分类**：权限
> **entityHint**：`member`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
组织成员的权限管理表，含头像、角色下拉与权限开关，支撑账号授权。

### 何时用
- 权限/成员管理页，按「头像 + 角色 + 权限开关」列装配。
- 需要行内角色切换与权限授权开关的表格。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 普通设备列表 | `B_DataTable` |
| 操作审计 | `B_LogTimeline` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | `ms-table` | 表格骨架 |
| `S_Avatar` | `ms-avatar` | 成员头像 |
| `S_Select` | `ms-select` | 角色下拉 |
| `S_Switch` | `ms-switch` | 权限开关 |
| `S_Tag` | `ms-tag` | 状态 |
| `S_Button` | `ms-btn` | 行内操作 |
| `S_Pagination` | `ms-pagination` | 分页 |

### render 骨架（业务框架）
1. 工具栏：标题 + 邀请成员按钮。
2. 表头：成员（头像+名）、角色、权限开关组、状态、操作。
3. 表体：`U.cellHtml` user 类型 + `ms-select` 角色 + `ms-switch` 授权。
4. 表尾：分页。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-member-table', cn: '成员权限表', cat: '权限', desc: '组织成员权限管理表，含头像、角色下拉与权限开关…', atoms: ['table','avatar','select','switch','tag','button','pagination'], entityHint: 'member', tags: ['成员','权限','角色','组织','用户','人员','账号','授权'], render(ctx) { /* toolbar → table(头像/角色select/权限switch) → pagination */ } }
```

### 上下文 ctx 契约
- `ctx.rows`（成员列表）、`ctx.entity.roles`（角色枚举）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-member-table`
- 结构类：无新增（复用 `ms-table` 体系）
- 实体（只读）：`assets/js/registry-entities.js`（key `member`）
- 令牌（只读）：`.claude/tokens/tokens.css`
