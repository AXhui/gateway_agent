---
name: B_Eg71MeshRadioCard
version: 1.0.0
description: Mesh 多信道设置卡（业务组件）
---

# Mesh 多信道设置卡 · B_Eg71MeshRadioCard

> **逻辑名**：`B_Eg71MeshRadioCard`
> **运行时 id**：`bc-eg71-mesh-radio`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa → Radio 的多信道设置卡：频段开关行（编号 F1… + 频率值 + `ms-switch`）。Mesh 频段（`B_Eg71MeshConfigCard`）的可选项同步自此页；在此关闭的频段会触发 General 页 Mesh 频段告警（`存在频段配置在多信道设置中被禁用…`）。

**不是**：Radio 页全量设置（Sync Word / LoRaWAN 服务等不在本卡范围）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 卡片 |
| `S_Switch` | `ms-switch` | 频段启停开关 |
| `S_Icon` | `MS_ICONS` | 卡头图标 |
| `S_Typography` | 字号阶梯 | 行文案（14 正文 / 12 辅助） |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `freqs` | array | `[]` | `{id:'F1', mhz:'868.1', on:true}` |
| `title` | string | `'Multi-Channel Settings'` | 卡头标题覆写 |
| `actionsHtml` | string | `''` | 卡头右侧操作区 |
| `tip` | string | — | 表底说明 |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-radio-toggle` | `{id, on}` | 频段开关切换（宿主同步 Mesh 频段可选集 / 触发告警） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 开启 | switch checked（`--color-primary-normal` 轨道） |
| 关闭 | switch 未选中（灰轨道），对应频段在 General 页告警 |

## 四、场景

**何时用**：LoRa → Radio 页多信道频段开关；作为 Mesh 频段数据源。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh 频段多选（General 页） | `B_Eg71MeshConfigCard` |
| Radio 其他设置项 | 既有 Radio L3 |

## 五、Token

`--spacing-4/12`、`--color-divider-base-2`、`--color-text-primary/secondary`（switch 轨道色经 `ms-switch` 既有契约），无新增常量。

## 六、依赖

- 基础原子：`card / switch / icon`，不新增基础原子，仅编排。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-radio'];
$app.innerHTML = C.render({ freqs: [
  { id: 'F1', mhz: '868.1', on: true }, { id: 'F4', mhz: '868.7', on: false }] });
C.bind($app);
```

## 八、版本

见 frontmatter `version:`。
