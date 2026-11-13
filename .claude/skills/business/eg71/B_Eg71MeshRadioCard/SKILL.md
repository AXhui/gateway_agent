---
name: B_Eg71MeshRadioCard
version: 2.0.0
description: LoRa Radio 设置页卡组（业务组件，四卡对齐线上真机）
---

# LoRa Radio 设置页卡组 · B_Eg71MeshRadioCard

> **逻辑名**：`B_Eg71MeshRadioCard`
> **运行时 id**：`bc-eg71-mesh-radio`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa → Radio 页**卡组**（v2，对齐 UG6X 线上真机 `http://…/lora/radio` 只读核对）：

1. **Antenna Settings**：info Alert（EIRP 合规提示）+ Effective Antenna Gain(dBi) 必填输入 + 18→16px tip 钮（点开出补充说明 tipnote）。
2. **Channel Settings**（三子区）：Multi Channels Setting（`Enable | Frequency(MHz)` 表 ×8 行，每行 switch + 输入）；LoRa Channel Setting（总闸 switch + Frequency/Bandwidth/Data Rate 双列）；FSK Channel Setting（总闸 switch + Frequency/Bandwidth/DataRate 双列）。
3. **Advanced Settings**（卡头 chevron 可折叠，默认收起）：ClassB Setting（beacon 总闸 + 8 字段）/ Intervals Setting（3 字段）/ Forward CRC Setting（Disabled/Error/Valid 三 checkbox）。
4. **Custom Configuration**：卡头 switch 总闸 + textarea（placeholder "Example"）。

子区开关是区块总闸（business-specific.md §6：off → `--disabled` 灰显保持、值不清空）；Mesh 频段（`B_Eg71MeshConfigCard`）可选项同步自 Multi Channels 的启用行。

**不是**：Radio 页全量（Sync Word / LoRaWAN 服务等不在本卡组范围）；单卡组件。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 四张卡容器 |
| `S_Form` | `ms-form-item` / `ms-grid-2 bc-com-form-grid` | 表单项与双列（>6 项子区） |
| `S_Input` | `ms-input--lg` / `--textarea` | 频率/增益/间隔输入、Custom 文本域 |
| `S_Select` | `ms-select--lg` | Bandwidth / Data Rate / Beacon Sync Type |
| `S_Switch` | `ms-switch--xs` | 频道行开关、子区总闸、Custom 卡头总闸 |
| `S_Checkbox` | `ms-checkbox` | Forward CRC 三态 |
| `S_Table` | `ms-table` | Multi Channels ×8 表 |
| `S_Alert` | `ms-alert--info` | Antenna 卡 EIRP 合规提示（位置④：卡头下方） |
| `S_Icon` | `MS_ICONS` | info 16 tip 钮、chevron-down 折叠钮 |
| `S_Typography` | 字号阶梯 | 标题/label/单位（14 正文 / 12 辅助） |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `channels` | array | `[]` | `{id:'F1', mhz:'868.1', on:true}` ×8 行 |
| `antenna` | object | `{}` | `{gain}` 天线增益 dBi（必填） |
| `lora` | object | `{}` | `{on, freq, bw:'125', dr:'SF7'}` |
| `fsk` | object | `{}` | `{on, freq, bw, dr}`（dr 为 bps 数值串） |
| `beacon` | object | `{}` | `{on, freq, dr, count, step, bw:'125000', tx, sync:'GPS'/'RTC', offset}` |
| `intervals` | object | `{}` | `{keepalive, stat, push}`（s/s/ms） |
| `crc` | object | `{}` | `{disabled, error, valid}` 三 checkbox |
| `custom` | object | `{}` | `{on, text}` Custom 总闸 + 文本 |
| `errors` | object | `{}` | 字段 key → 错误文案（`antennaGain`/`chMhz{i}`/`loraFreq`…） |
| `advOpen` | bool | `false` | Advanced 卡展开态（aria-expanded 同步） |
| `tip` | string | — | Channel 卡 Multi 表底说明 |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-radio-ch` | `{id, on}` | 频道行开关切换（宿主同步 Mesh 频段可选集 / 告警） |
| `eg71-mesh-radio-sec` | `{key, on}` | 子区总闸（`lora`/`fsk`/`beacon`/`custom`）；bind 内部就地切 `--disabled` + aria |
| `eg71-mesh-radio-check` | `{key, on}` | CRC checkbox（`crcDisabled`/`crcError`/`crcValid`） |
| `eg71-mesh-radio-field` | `{key, value}` | input/select/textarea 变更（`chMhz{i}`/`antennaGain`/`loraFreq`…） |
| `eg71-mesh-radio-adv` | `{open}` | Advanced 折叠钮（bind 内部就地切 `--open` + aria） |

tip 钮点击为组件内 DOM 行为（tipnote 显隐 + aria-expanded），不冒泡事件。

## 三、状态

| 状态 | 表现 |
|---|---|
| 子区禁用（总闸 off） | `bc-eg71-mesh-radio-sec-body--disabled`（opacity .45 + pointer-events none），值保持不清空 |
| 字段校验失败 | `ms-input--error` + `bc-eg71-form-item-msg--error` 错误行 |
| Advanced 折叠/展开 | `aria-expanded` + `bc-eg71-mesh-radio-advbody--open`（默认收起，线上真机同） |
| tipnote | 默认隐藏，点 tip 钮展开（`--open`） |

## 四、场景

**何时用**：LoRa → Radio 页全量设置（对齐线上真机四卡结构）；作为 Mesh 频段数据源。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh 频段多选（General 页） | `B_Eg71MeshConfigCard` |
| General 页通用设置模块卡 | `B_Eg71MeshModuleCard` |
| 页脚 Apply/Reset | `bc-eg71-form-footer`（页层编排，非本卡组内） |

## 五、Token

`--spacing-4/8/12/16/24/32`、`--spacing-3xl`（CRC 行距）、`--color-text-primary`、`--color-gray-05`（单位 `ms-form-unit`）、`--color-icon-auxiliary`（tip/折叠钮）、`--color-divider-*`（表格线，经 `ms-table`）、switch/alert/card 色经既有 L2 契约。无新增样式常量。

## 六、依赖

- 基础原子：`card / form / input / select / switch / checkbox / table / alert / icon / text`，不新增基础原子，仅编排。
- runtime 源：`assets/js/registry-business.js`（库副本 v1 冻结，v2 形态先落 demo 内联，按 spacing §7 范式不回写源头）。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-radio'];
$app.innerHTML = C.render({
  channels: [{ id: 'F1', mhz: '868.1', on: true }, { id: 'F2', mhz: '868.3', on: true }],
  antenna: { gain: '3' },
  lora: { on: false, freq: '868.3', bw: '125', dr: 'SF7' },
  fsk: { on: false, freq: '868.8', bw: '125', dr: '50000' },
  beacon: { on: false, freq: '869.525', dr: 'SF9', count: '2', step: '600000', bw: '125000', tx: '16', sync: 'GPS', offset: '0' },
  intervals: { keepalive: '10', stat: '30', push: '100' },
  crc: { disabled: false, error: false, valid: true },
  custom: { on: false, text: '' },
  errors: {}, advOpen: false,
  tip: 'Mesh frequency options on the General page are synced from these channels.'
});
C.bind($app);
// 宿主监听：eg71-mesh-radio-ch / -sec / -check / -field / -adv
```

## 八、版本

见 frontmatter `version:`。
