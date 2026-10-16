---
name: B_Eg71MeshFlowDiagram
version: 1.1.0
description: Mesh 工作模式图（业务组件）
---

# Mesh 工作模式图 · B_Eg71MeshFlowDiagram

> **逻辑名**：`B_Eg71MeshFlowDiagram`
> **运行时 id**：`bc-eg71-mesh-flow`
> **分类**：概览
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

Dashboard 的 LoRa 工作模式数据流示意图（`flow` 模式，4 变体）+ Gateway Status 的级联网关摘要卡（`cascade` 模式），一组件双模式。flow 模式：节点（End Devices / Relay / Master / NS / 南向协议）+ 连线标签（LoRa / LoRa Mesh / IP / Data）+ NS 连接状态 tag + 在线设备数标注 + PRD 逐字英文说明；cascade 模式：按角色汇总行（名称/数量/状态 tag/View 钮）+ 空态。

**不是**：通用拓扑图组件——节点文案与变体集合为 LoRa Mesh 契约。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 卡片 |
| `S_Icon` | `MS_ICONS` | 节点图标（sensor/gateway/data/io/topology/lorawan） |
| `S_Tag` | `ms-tag--success/error/primary` | NS 连接态、在线设备数、级联状态 |
| `S_Button` | `ms-btn--link` | cascade 行 View |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `mode` | `'flow'\|'cascade'` | `'flow'` | 双模式切换 |
| `variant` | `'mesh-master-external'\|'mesh-master-embedded'\|'relay'\|'ipmesh-master'` | `'mesh-master-external'` | flow 变体 |
| `nsLabel` / `nsConnected` | string / boolean | `'ChirpStack MQTT'` / `true` | 外部 NS 节点（external 变体） |
| `online` | number | `100` | 在线设备数（embedded/ipmesh 变体） |
| `badge` | string | `'Working Mode'` | 卡头角色标注 |
| `cascade` | array | `[]` | cascade 行：`{key,name,count,tone,toneCn,icon}` |
| `configRoute` | string | 无 | cascade 卡头右侧 Configuration 钮（传入即渲染，如 `'/lora/gateway-fleet'`） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-cascade-view` | `{key}` | cascade 行 View（宿主开抽屉或跳转） |
| `eg71-mesh-cascade-config` | `{}` | cascade 卡头 Configuration 钮（宿主跳配置页） |

## 三、状态

| 状态 | 表现 |
|---|---|
| flow 默认 | 节点链 + 虚线 stage 标注 + 连线（primary 实线段） |
| NS 断连 | `ms-tag--error` Disconnected |
| ipmesh 双列 | Agent/Relay 双 lane 汇聚 Master |
| cascade 空态 | `ms-empty`（gateway 图标 + No cascaded gateways） |

## 四、场景

**何时用**：Dashboard 按当前角色展示工作模式与级联概要；Gateway Status 卡。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 级联网关明细抽屉（字段表） | `B_Eg71ProtocolDetail` |
| 成员/邻居管理表 | `bc-data-table`（Fleet 页） |

## 五、Token

`--color-fill-base-normal`、`--color-border-base`、`--color-primary-normal`、`--color-primary-bg`、`--color-text-primary/secondary/auxiliary`、`--radius-4/8/full`、`--spacing-4/8/12/16/48`。

## 六、依赖

- 基础原子：`card / icon / tag / button`，不新增基础原子，仅编排（连线为 2px `--color-primary-normal` 边线段，无新增视觉常量）。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-flow'];
$app.innerHTML = C.render({ variant: 'mesh-master-embedded', online: 88 })
  + C.render({ mode: 'cascade', cascade: [
      { key: 'relay', name: 'Relay Gateway', count: '6', tone: 'success', toneCn: '4 online' }] });
C.bind($app);
```

## 八、版本

见 frontmatter `version:`。
