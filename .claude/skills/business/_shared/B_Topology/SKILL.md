---
name: B_Topology
description: 网络拓扑（业务组件）
---

# 网络拓扑 · B_Topology

> **逻辑名**：`B_Topology`
> **现 id**：`bc-topology`
> **分类**：数据
> **entityHint**：`gateway`
> **版本**：v1.0.0（已固化）
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
网关组网的层级拓扑，用卡片 + 徽标 + 连接线呈现设备关系。

### 何时用
- 网络结构/架构页，展示网关与下行设备的关系层级。
- 需要「节点卡片 + 状态徽标 + 连线」的拓扑视图。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 平面设备列表 | `B_DataTable` |
| 遥测曲线 | `B_TelemetryPanel` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 节点容器 |
| `S_Badge` | `ms-badge` | 节点数量徽标 |
| `S_Tag` | `ms-tag` | 状态 |
| `S_Tooltip` | `ms-tooltip` | 节点悬浮信息 |
| `S_Button` | `ms-btn` | 节点操作 |

### render 骨架（业务框架）
1. `.bc-topo` 拓扑容器。
2. 根节点 `ms-card.bc-topo-root`（网关）。
3. 层级连线 `U.svgLine()`。
4. 子节点 `ms-card.bc-topo-node`（`ms-badge` 计数 + `U.statusTag`）。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-topology', cn: '网络拓扑', cat: '数据', desc: '网关组网的层级拓扑，卡片 + 徽标 + 连线…', atoms: ['card','badge','tag','tooltip','button'], entityHint: 'gateway', tags: ['拓扑','网关','网络','结构','关系','连接','架构'], render(ctx) { /* bc-topo → root → svgLine → nodes */ } }
```

### 上下文 ctx 契约
- `ctx.entity.topo`（`{root, children[]}` 层级结构）。

### 结构类（`library/business.css`）
`.bc-topo`（relative 容器）、`.bc-topo-root`、`.bc-topo-node`（absolute 定位 + 连线锚点）。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-topology`
- 结构类：`library/business.css`
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
