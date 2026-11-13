---
name: B_Eg71MeshDestCard
version: 1.0.0
description: Mesh 主网关目的地卡 · IP Agent（业务组件）
---

# Mesh 主网关目的地卡（IP Agent） · B_Eg71MeshDestCard

> **逻辑名**：`B_Eg71MeshDestCard`
> **运行时 id**：`bc-eg71-mesh-dest`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa General 页（IP Connection Agent 角色）的 Master Gateway Destination 卡：Destination Address（必填输入 + **连接状态 tag**（Connected 绿 / Disconnected 橙）+ 自动接入说明文案）与 CA File（必填 + 16px info tip 钮（title 原生提示）+ 只读输入 + Import 导入钮）。用于 Agent 安全接入 Master Gateway（证书自控制器网关下载后导入）。

**不是**：证书管理器（只承载单文件导入入口）；Mesh Master 的转发目的地（那是 `B_Eg71MeshForwardCard`）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 卡容器 |
| `S_Form` | `ms-form-item` / `ms-form-label--required` | 字段行 |
| `S_Input` | `ms-input--lg` | 地址输入 / CA 文件只读输入 |
| `S_Button` | `ms-btn` | Import 导入钮 |
| `S_Tag` | `ms-tag--success` / `ms-tag--warm` | Connected / Disconnected 状态 |
| `S_Icon` | `MS_ICONS` | 卡头 link 20、info tip 16、upload 16 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `values` | object | `{dest:'', caFile:''}` | 目的地址 / 已导入证书文件名 |
| `connected` | boolean | `false` | 连接状态（切 tag 变体） |
| `errors` | `{key:msg}` | `{}` | 字段级错误（`dest`/`caFile`） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-dest-field` | `{value}` | 地址输入 change |
| `eg71-mesh-dest-import` | — | 点击 Import（宿主开文件选择/演示导入反馈） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 已连接 | 状态行 `ms-tag--success`「Connected」 |
| 未连接 | 状态行 `ms-tag--warm`「Disconnected」 |
| 字段校验失败 | `ms-input--error` + `bc-eg71-form-item-msg--error`（CA File 错误行在导入行下方） |

## 四、场景

**何时用**：IP Agent 的 General 页安全接入配置（Figma 71.0.0.5 · 43:11788）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh 转发目的地（目的策略） | `B_Eg71MeshForwardCard` |
| IP Master 高级设置 | `B_Eg71MeshAdvCard` |

## 五、Token

`--spacing-4/8/16`（卡体 gap / 状态行距）、tag/input/btn 色经既有 L2 契约（success/warm 语义 tag、`--color-icon-auxiliary` tip）。无新增样式常量。

## 六、依赖

- 基础原子：`form / input / button / card / tag / icon`，不新增基础原子，仅编排。
- 结构类（`library/business.css`）：`.bc-eg71-mesh-dest-body/-status/-ca`；tip 钮复用 `.bc-eg71-form-item-tip`。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-dest'];
$app.innerHTML = C.render({ values: { dest: '192.168.1.10', caFile: '' }, connected: false, errors: { caFile: 'Please import the file.' } });
C.bind($app);
$app.addEventListener('eg71-mesh-dest-import', () => {/* 演示导入 */});
```

## 八、版本

见 frontmatter `version:`。
