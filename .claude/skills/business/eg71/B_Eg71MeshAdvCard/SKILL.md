---
name: B_Eg71MeshAdvCard
version: 1.0.0
description: Mesh 高级设置卡 · IP Master（业务组件）
---

# Mesh 高级设置卡（IP Master） · B_Eg71MeshAdvCard

> **逻辑名**：`B_Eg71MeshAdvCard`
> **运行时 id**：`bc-eg71-mesh-adv`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa General 页（IP Connection Master 角色）的 Advanced Setting 卡：卡头标题 + **双箭头折叠钮**（business-specific §6.1 双箭头载体——有附加内容才可用，点击展开/收起）；展开后为边框盒 `bc-eg71-mesh-adv-box`：Default Channels（Custom/Standard 下拉 + 自定义信道输入，如 `868.1, 868.3`）与嵌套 Frequency Plan 子区（次标题 + 2×2 双列网格：Network ID / Join Request Interval (s) / RX1 Delay (s) / Lease Time (hh-mm-ss)，全部必填）。

**不是**：Mesh Master 的 Advanced Setting（那由 `B_Eg71MeshConfigCard` 的可折叠 panel 行承载）；通用折叠面板。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 卡容器 |
| `S_Form` | `ms-form-item` / `ms-grid-2` | 字段行 + 嵌套 Frequency Plan 2×2 |
| `S_Input` | `ms-input--lg` | 自定义信道 / Network ID 等输入 |
| `S_Select` | `ms-select` | Default Channels（Custom/Standard） |
| `S_Icon` | `MS_ICONS` | 卡头 wrench 20、折叠 chevronsDown 16 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `open` | boolean | `true` | 展开态（`aria-expanded` 同步） |
| `values` | object | 见 render | `{channels:'Custom', channelsVal:'', netId:'010203', joinInt:'5', rx1Int:'1', lease:'8760-0-0'}` |
| `errors` | `{key:msg}` | `{}` | 字段级错误（`channelsVal`/`netId`/`joinInt`/`rx1Int`/`lease`） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-adv-toggle` | `{open}` | 双箭头折叠钮（bind 内部就地切 `is-open`/`hidden` + aria） |
| `eg71-mesh-adv-field` | `{key, value}` | 任一 input/select 变更 |

## 三、状态

| 状态 | 表现 |
|---|---|
| 收起 | 折叠钮 chevron 旋转 180°（`is-open` 移除）、body `hidden`、`aria-expanded="false"` |
| 字段校验失败 | `ms-input--error` + `bc-eg71-form-item-msg--error` |

## 四、场景

**何时用**：IP Master 的 General 页高级设置（Figma 71.0.0.5 · 43:12085）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh Master 的 Advanced Setting（panel 行） | `B_Eg71MeshConfigCard` |
| IP Agent 的 Master Gateway Destination | `B_Eg71MeshDestCard` |
| 通用被动参数区块 | `B_Eg71MeshModuleCard` |

## 五、Token

`--spacing-8/16/20/24`（盒内距/网格 gutter）、`--radius-4`（边框盒/嵌套子区）、`--color-border-base`（盒边框）、`--color-fill-base-normal`（嵌套 Frequency Plan 底）、`--duration-fast`/`--ease`（chevron 旋转）、`--color-icon-auxiliary`（折叠钮）。无新增样式常量。

## 六、依赖

- 基础原子：`form / input / select / card / icon`，不新增基础原子，仅编排。
- 结构类（`library/business.css`）：`.bc-eg71-mesh-adv-toggle/-box/-channels/-nested/-nested-grid`。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-adv'];
$app.innerHTML = C.render({ open: true, values: { channels: 'Custom', channelsVal: '868.1, 868.3', netId: '010203', joinInt: '5', rx1Int: '1', lease: '8760-0-0' } });
C.bind($app);
$app.addEventListener('eg71-mesh-adv-field', e => console.log(e.detail));
```

## 八、版本

见 frontmatter `version:`。
