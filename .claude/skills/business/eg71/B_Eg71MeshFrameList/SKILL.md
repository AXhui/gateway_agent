---
name: B_Eg71MeshFrameList
version: 1.0.0
description: Mesh 帧列表（业务组件）
---

# Mesh 帧列表 · B_Eg71MeshFrameList

> **逻辑名**：`B_Eg71MeshFrameList`
> **运行时 id**：`bc-eg71-mesh-frames`
> **分类**：数据服务
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

数据流 → 数据列表的 Mesh 帧单卡列表：`ns` 视角（内置 NS：Time / Device / Direction / FCnt / Payload Size）与 `raw` 视角（ChirpStack / Relay：Time / Direction / Frequency / Data Rate / RSSI-SNR / Frame Size）；心跳帧带 Heartbeat 标注；卡头自带方向筛选 + Refresh。遵守 EG71 表格左对齐契约。

**不是**：通用数据流水表——列集按 NS 视角切换，是 Mesh 帧专属。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | `ms-table` | 列表骨架（数字/时间列 `bc-num`） |
| `S_Tag` | `ms-tag--primary/warm/remind` | Up / Dn / Heartbeat |
| `S_Button` | `ms-btn--sm` | 详情钮 / Refresh |
| `S_Icon` | `MS_ICONS` | 图标 |
| `S_Empty` | `ms-empty` | 空态（保留表头） |
| `S_Select` | `ms-select` | 方向筛选 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `view` | `'ns'\|'raw'` | `'ns'` | 视角（列集切换） |
| `rows` | array | `[]` | ns：`{time,device,dir,fcnt,size,heartbeat?}`；raw：`{time,dir,freq,dr,rssi,size,heartbeat?}` |
| `tip` | string | — | 表底说明 |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-frame-detail` | `{index}` | 行详情钮（宿主开 `B_Eg71ProtocolDetail` 抽屉） |
| `eg71-mesh-frame-filter` | `{dir}` | 方向筛选变化（宿主过滤 rows 重渲染） |
| `eg71-mesh-frame-refresh` | — | Refresh 钮 |

## 三、状态

| 状态 | 表现 |
|---|---|
| 数据态 | 行渲染 + Up/Dn tag |
| 心跳帧 | Direction 侧追加 `ms-tag--remind` Heartbeat |
| 空态 | `ms-empty`（表头保留） |

## 四、场景

**何时用**：数据流页 Mesh 帧流水（内置 NS 或 ChirpStack/Relay 视角）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 通用 NS 帧流水（非 Mesh） | `bc-data-table` / 既有 data-stream L3 |
| 成员/邻居管理 | `B_Eg71MeshFleetTable` |

## 五、Token

`--spacing-8/12/16/20`（经 `ms-card` / `ms-table` / `ms-space` 既有契约），无新增常量。

## 六、依赖

- 基础原子：`table / tag / button / icon / empty / select`，不新增基础原子，仅编排。
- 业务结构类：`bc-num`、`bc-eg71-table-ops`、`bc-eg71-form-item-select`。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-frames'];
$app.innerHTML = C.render({ view: 'ns', rows: [
  { time: '2026-10-16 09:42:15', device: '24E124FFFE123456', dir: 'Up', fcnt: '128', size: '62', heartbeat: true }] });
C.bind($app);
```

## 八、版本

见 frontmatter `version:`。
