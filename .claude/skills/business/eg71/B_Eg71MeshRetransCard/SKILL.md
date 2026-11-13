---
name: B_Eg71MeshRetransCard
version: 1.0.0
description: Mesh 数据重传卡 · IP Agent（业务组件）
---

# Mesh 数据重传卡（IP Agent） · B_Eg71MeshRetransCard

> **逻辑名**：`B_Eg71MeshRetransCard`
> **运行时 id**：`bc-eg71-mesh-retrans`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa General 页（IP Connection Agent 角色）的 Data Retransmission 卡：**卡头标题级总闸**（switch，紧跟标题右侧——business-specific §6.1 载体分工）+ Pending Data 灰底面板（积压包数 `Pending Data: N packets` + Clear Data 钮）。总闸 off → 面板灰显保持（§6.2：值不清零）；Clear Data 在积压为 0 时禁用。

**不是**：Mesh Master 的 Data Retransmission 开关（那由 `B_Eg71MeshModuleCard` 的 switch 行承载）；通用积压队列监控。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 卡容器 |
| `S_Switch` | `ms-switch` | 卡头总闸 |
| `S_Button` | `ms-btn` | Clear Data |
| `S_Icon` | `MS_ICONS` | 卡头 repeat 20 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `on` | boolean | `true` | 总闸态 |
| `pending` | number | `0` | 积压包数（0 → Clear Data 禁用） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-retrans-toggle` | `{on}` | 总闸切换（bind 内部就地切 `--disabled`） |
| `eg71-mesh-retrans-clear` | — | Clear Data（宿主清零积压并重渲染） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 总闸 off | `bc-eg71-mesh-retrans-panel--disabled`（opacity .45 + pointer-events none），积压数保持不清零 |
| 积压为 0 | Clear Data `disabled` |

## 四、场景

**何时用**：IP Agent 的 General 页数据重传积压管理（Figma 71.0.0.5 · 43:11788）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh Master 的 Data Retransmission 开关 | `B_Eg71MeshModuleCard`（switch 行） |
| 帧转发策略 | `B_Eg71MeshForwardCard` |

## 五、Token

`--spacing-12/16`（面板内距）、`--color-fill-base-normal`（面板底）、`--radius-4`（面板圆角）、`--color-text-secondary/primary`（文案/数值 b 600）。无新增样式常量。

## 六、依赖

- 基础原子：`switch / button / card / icon`，不新增基础原子，仅编排。
- 结构类（`library/business.css`）：`.bc-eg71-mesh-retrans-body/-panel(--disabled)/-text`。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-retrans'];
$app.innerHTML = C.render({ on: true, pending: 128 });
C.bind($app);
$app.addEventListener('eg71-mesh-retrans-clear', () => {/* 清零后重渲染 */});
```

## 八、版本

见 frontmatter `version:`。
