---
name: B_Eg71MeshConfigCard
version: 1.0.0
description: Mesh 配置卡（业务组件）
---

# Mesh 配置卡 · B_Eg71MeshConfigCard

> **逻辑名**：`B_Eg71MeshConfigCard`
> **运行时 id**：`bc-eg71-mesh-config`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

EG71 LoRa General 页的 Mesh Configuration 区块卡：签名密钥（密码框 + Show/Hide 链接钮）、最大中继跳数（实时风险提示区）、Mesh 频段多选 chip（含被禁用频段告警条）、Advanced 折叠区（TX Power / SF / BW / CR + Master 侧 Ignore Direct Uplink + Relay 侧 Heartbeat Interval），按角色出字段变体。

**不是**：通用表单卡——字段集合与提示文案为 LoRa Mesh 专属。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段行骨架 |
| `S_Input` | `ms-input--lg(--error)` | 密钥 / 跳数 / 功率 / 心跳 |
| `S_Select` | `ms-select(--error)` | SF / BW / CR |
| `S_Checkbox` | `ms-checkbox-box` | 频段 chip、忽略直连上行 |
| `S_Card` | `ms-card` | 区块卡 |
| `S_Icon` | `MS_ICONS` | 标题图标、折叠箭头、告警图标 |
| `S_Alert` | `ms-alert--error` | 频段被禁用告警（可点击跳转） |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `role` | string | — | `'mesh-relay'` 出心跳、不出忽略直连 |
| `values` | object | 见 render 缺省 | `{key,hops,freqs[],freqOptions[],txPower,sf,bw,cr,ignoreDirect,heartbeat}` |
| `errors` | object | `{}` | 任意字段错误文案（替换默认 hint） |
| `freqWarning` | boolean | `false` | true 时渲染频段禁用告警条 |
| `risk` | string | — | 跳数风险提示实时文案（空/undefined 隐藏） |
| `advOpen` | boolean | `false` | 高级区初始展开态 |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-hops-change` | `{value}` | 跳数输入（宿主计算 risk 后重渲染或直改 risk 区） |
| `eg71-mesh-freq-change` | `{selected[]}` | 频段 chip 勾选变化 |
| `eg71-mesh-freq-warning` | — | 点击频段禁用告警条（宿主跳 Radio 多信道设置） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 密钥密码框 + 跳数 + 频段 chips + 折叠钮 |
| 字段错误 | `ms-input--error` / `ms-select--error` + 错误文案替换 hint |
| 风险提示 | `bc-eg71-mesh-config-risk`（warm 底）显示 |
| 频段禁用 | `ms-alert--error` 告警条（button 重置，可点击） |
| 高级展开 | `.is-open`（箭头旋转 180° + `aria-expanded` 同步） |
| 密钥可见 | Show/Hide 链接钮切换 input type |

## 四、场景

**何时用**：LoRa Mesh 的 Mesh Configuration 卡；跳数/频段联动风险与告警的配置流。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 通用设置表单（非 Mesh 字段） | `bc-eg71-content` + `bc-eg71-form-item-*` |
| 转发目的地配置 | `B_Eg71MeshForwardCard` |

## 五、Token

`--color-fill-base-normal`、`--color-warm-bg`、`--color-warm-normal`、`--color-primary-bg`、`--color-primary-normal`、`--color-border-base`、`--radius-4/8/full`、`--spacing-4/8/12/16/24`、`--duration-fast`、`--ease`。

## 六、依赖

- 基础原子：`form / input / select / checkbox / card / icon / alert`，不新增基础原子，仅编排。
- 业务依赖：`bc-eg71-form-item-labelrow / -select / -msg(--error)` 结构类（`library/business.css`）。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-config'];
$app.innerHTML = C.render({
  role: 'mesh-relay',
  values: { freqs: ['868.1', '868.3'], freqOptions: ['868.1','868.3','868.5','868.7','868.9','869.1','869.3','869.5'] },
  freqWarning: true, risk: 'More than 4 hops: latency and loss risk rise sharply.', advOpen: false
});
C.bind($app);
```

## 八、版本

见 frontmatter `version:`。
