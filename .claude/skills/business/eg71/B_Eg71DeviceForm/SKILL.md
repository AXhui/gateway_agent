---
name: B_Eg71DeviceForm
version: 1.0.0
description: EG71 LoRaWAN 设备添加/编辑整页表单（业务组件）：基本信息/配置文件/激活设置三卡，OTAA·ABP 双态 + ABP 置灰联动 + 三场景前端暂存
---

# LoRaWAN 设备添加/编辑表单 · B_Eg71DeviceForm

## 1. 描述

**这是什么**：EG71 LoRaWAN 设备手动添加/编辑整页表单：**基本信息卡**（DevEUI 添加可填/编辑只读 + 名称/描述/型号）→ **配置文件卡**（配置文件/fPort/超时(min)/帧计数校验开关）→ **激活设置卡**（头部 OTAA/ABP 切换下拉 + 内嵌 `bc-eg71-activation-card` 灰卡）。OTAA 编辑态附 DevAddr/NwkSKey/AppSKey 三只读字段；ABP 态为 ABP 参数卡（三密钥 + Uplink/Downlink/Timeout 三计数器，默认值态三密钥置灰、计数器保持可编辑，交互 #7）。

内部消费内嵌灰卡的 `eg71-activation-change` 做置灰联动；切换配置文件/型号/激活类型走组件内 **stash 暂存**（场景键 = `activation:profile:model`，切回恢复、保存清除，交互 #9）；任何值变更统一冒泡 `eg71-device-form-change`。

**不是什么**：不渲染页尾按钮（走 `bc-eg71-form-footer`，本组件监听其 `eg71-footer-action` 且 action='save' 时清暂存）；不做提交——全部变更冒泡交宿主聚合。

**归属产品线**：`eg71`。**entityHint**：`device`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` / `ms-card-head/body` / `ms-card-title` / `ms-card-extra` | 三张卡骨架 |
| `S_Form` | `ms-form-item` / `ms-form-label(--required)`（复用 `bc-eg71-form-item-*` / `bc-eg71-formgrid`） | 表单栅格 |
| `S_Input` | `ms-input(--disabled)` | DevEUI/名称/描述/ABP 密钥（置灰=disabled） |
| `S_InputNumber` | `ms-input-number` + 步进钮组 | fPort/超时/三计数器 |
| `S_Select` | `ms-select(--sm)` | 型号/配置文件/激活类型切换 |
| `S_Switch` | `ms-switch(-track/-thumb)` | 帧计数校验 |
| `B_Eg71ActivationCard` | `MS_BIZ_INDEX['bc-eg71-activation-card'].render`（内嵌） | 激活设置灰卡（OTAA/ABP 两处） |
| `S_Icon` | `ico('info', 16)` | 标签说明 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.mode` | `'add' \| 'edit'` | `'add'` | add：DevEUI 可填、无 OTAA 三只读字段；edit：DevEUI 只读、OTAA 附三只读 |
| `ctx.devEui` | string | `''` | DevEUI 初值；**Milesight 判定源之一**（`/^24e124/i`） |
| `ctx.model` | string | `''` | 型号初值；Milesight 判定源之二（`/^(am\|em\|ws\|uc\|wt\|vs\|gs\|ts)\d/i`） |
| `ctx.activation` | `'otaa' \| 'abp'` | `'otaa'` | 初始激活类型（决定 `data-device-form-act` 显隐） |
| `ctx.values` | object | 见 render | `{ name, description, model, profile, fPort, timeout, frameCheck, activation:{mode,appKey}, abp:{devAddr,nwkSKey,appSKey,uplink,downlink,timeout} }` |

Milesight 判定（03-ued §6.3）：DevEUI 以 **24E124** 开头**或**型号命中 Milesight SKU 族 → 内嵌灰卡「默认值」可选且默认；否则默认值禁用、默认「自定义值」。

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-device-form-change` | `{ dirty:boolean, activation, values }` | 任何字段变更 / 激活切换 / 场景切换（values 为全量聚合，含隐藏态字段） |

### 事件入（本组件消费，bubbles 到 wrap 的）
| 事件 | 来源 | 行为 |
|---|---|---|
| `eg71-activation-change` | 内嵌灰卡 | ABP 三密钥 `[data-form-field^="abp."]` 按 `mode==='default'` 置灰/恢复（保留值，#7/#8），并冒泡 form-change |
| `eg71-footer-action`（action='save'） | `bc-eg71-form-footer` | 清空场景暂存 stash，冒泡 `dirty:false` 的 form-change（#9） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| OTAA 态 | `data-activation="otaa"` | `[data-device-form-act="otaa"]` 显示：灰卡（含 AppKey）+（edit）三只读字段；ABP 块 hidden |
| ABP 态 | `data-activation="abp"` | ABP 灰卡（无 AppKey 输入）+ ABP 参数卡；OTAA 块 hidden |
| ABP 默认值置灰 | 内嵌灰卡单选 = default | 三密钥 `ms-input--disabled` + `disabled` 属性；三计数器不受影响（可编辑） |
| 场景切换暂存 | profile / model / 激活下拉 change | 旧场景全量值入 stash（键 `act:profile:model`）→ 切换 → 新场景有快照则恢复；DevEUI 只在 add 可编辑 |
| 配置文件↔激活联动 | profile 切到含 ABP / 离开 | `setActivation` 同步显隐；反向切激活类型时 profile 归位 `ClassA-ABP` / `ClassA-OTAA` |
| 数值步进 | 步进钮（上 − 下 +） | ±1 下限 0，并冒泡 form-change |

## 4. 场景（Scenarios）

**何时用**：LoRaWAN 设备手动添加页（OTAA 灰卡替换原三只读字段）；设备编辑页（OTAA：AppKey 可编辑 + 三密钥只读；ABP：三密钥可编辑、默认值置灰、计数器恒可编辑；三场景切换值保留）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 扫描发现设备的批量/单台快速编辑 | `bc-eg71-scan-edit-drawer` |
| 仅激活设置灰卡单体（无整页） | `bc-eg71-activation-card` |
| 非 LoRaWAN 设备添加 | 既有设备添加表单模块 |

## 5. Token（设计令牌）

全部继承 Card/Form/Input/InputNumber/Select/Switch 与内嵌灰卡（`bc-eg71-subarea`）。本组件结构类仅引用：
- `--spacing-12`（`.bc-eg71-device-form-act` 纵向 gap / `.bc-eg71-device-form-rokeys` 上距）
- 内容区纵向节奏复用 `bc-eg71-content`（`--spacing-24` 区块分节）

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `card` / `form` / `input` / `input-number` / `select` / `switch` / `icon` + 业务内嵌 `B_Eg71ActivationCard`（单向：只消费其事件，不回写其内部 DOM）。结构类 `.bc-eg71-device-form` / `.bc-eg71-device-form-act` / `.bc-eg71-device-form-rokeys`（`library/business.css`）。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
page.innerHTML =
  B['bc-eg71-device-form'].render({ mode: 'edit', devEui: '24E124FFFE00A001', model: 'AM319', activation: 'otaa' }) +
  B['bc-eg71-form-footer'].render({});
B['bc-eg71-device-form'].bind(page);
B['bc-eg71-form-footer'].bind(page);

page.addEventListener('eg71-device-form-change', e => {
  saveBtnState = e.detail.dirty; // values 含隐藏态字段（OTAA+ABP 全量），保存时直接取
});
// 页尾【保存】点击 → eg71-footer-action(action:'save') → 组件自动清暂存并回 dirty:false
```

## 8. 版本（Version）

见 frontmatter `version:`。
