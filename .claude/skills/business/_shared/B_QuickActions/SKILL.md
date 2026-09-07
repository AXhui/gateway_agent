---
name: B_QuickActions
description: 快捷操作区（业务组件）
---

# 快捷操作区 · B_QuickActions

> **逻辑名**：`B_QuickActions`
> **现 id**：`bc-quick-actions`
> **分类**：概览
> **entityHint**：`device`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
常用入口的快捷操作区，图标 + 文案的横向快捷入口，承载「新建/常用」动作。

### 何时用
- 首屏/概览页，把高频动作（新建设备、批量导入、导出）排成快捷入口。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 主行动单个强调 | `S_Button`（基础组件） |
| 指标卡 | `B_MetricCard` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn` | 快捷入口 |
| `S_Space` | `ms-space` | 布局 |
| `S_Card` | `ms-card` | 容器 |
| `S_Icon` | `ms-ico` | 图标（`U.ico`） |
| `S_Divider` | `ms-divider` | 分隔 |

### render 骨架（业务框架）
1. `ms-card` → `ms-card-body--tight`。
2. `.bc-quick` 横向排布：逐条动作 → `ms-ico` + 文案按钮。
3. 分隔符 `ms-divider`。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-quick-actions', cn: '快捷操作区', cat: '概览', desc: '常用入口快捷操作区，图标 + 文案横向快捷入口…', atoms: ['button','space','card','icon','divider'], entityHint: 'device', tags: ['快捷','操作','入口','常用','新建'], render(ctx) { /* card → bc-quick(ico+文案按钮) → divider */ } }
```

### 上下文 ctx 契约
- `ctx.entity.quickActions`（动作数组 `{cn, icon}`）。

### 结构类（`library/business.css`）
`.bc-quick`（flex 横排 gap）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-quick-actions`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
