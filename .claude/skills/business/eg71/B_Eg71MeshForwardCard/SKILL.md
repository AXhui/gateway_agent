---
name: B_Eg71MeshForwardCard
version: 1.0.0
description: Mesh 转发目的卡（业务组件）
---

# Mesh 转发目的卡 · B_Eg71MeshForwardCard

> **逻辑名**：`B_Eg71MeshForwardCard`
> **运行时 id**：`bc-eg71-mesh-forward`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

EG71 LoRa General 页的 Forwarding Destination 区块卡：Type 单选（ChirpStack MQTT / Embedded Network Server / Semtech UDP）、连接状态 tag、三组条件表单（ChirpStack：Topic/Broker/Port/凭证/TLS+证书上传；Embedded：说明文案无配置；Semtech：地址+上下行端口）；IP & Mesh 模式锁定 Embedded NS（select 禁用 + 卡头 warm tag）。

**不是**：通用转发配置卡——三组表单的字段与校验为 LoRa Mesh 转发契约。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段行骨架 |
| `S_Input` | `ms-input--lg(--error)` | topic/server/port/user/pass/端口 |
| `S_Select` | `ms-select` | Type、证书类型 |
| `S_Checkbox` | `ms-checkbox` | 凭证开关、TLS 开关 |
| `S_Upload` | `ms-btn`（upload 图标） | 证书三件套导入钮 |
| `S_Card` | `ms-card` | 区块卡 |
| `S_Tag` | `ms-tag--success/error/warm` | 连接状态、锁定标注 |
| `S_Icon` | `MS_ICONS` | 标题/上传图标 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `type` | `'chirpstack'\|'embedded'\|'semtech'` | `'embedded'` | 当前转发类型 |
| `locked` | boolean | `false` | IP & Mesh 锁定（强制 embedded + 禁用 select） |
| `conn` | `'connected'\|'disconnected'\|null` | — | 连接状态 tag（embedded 不渲染） |
| `values` | object | 见 render 缺省 | `{topic,server,port,useCreds,user,pass,useTls,certType,caFile,certFile,keyFile,upPort,downPort}` |
| `errors` | object | `{}` | 字段错误文案（input error 态 + 文件名红显） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-forward-type` | `{type}` | Type 切换（组可见性组件内已自同步） |
| `eg71-mesh-fwd-upload` | `{name}` | 点击证书 Import（name=caFile/certFile/keyFile） |

### bind 内自洽交互
凭证 checkbox → 凭证行显隐；TLS checkbox → TLS 行显隐；Type → 三组显隐 + 连接状态行显隐。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | Type select + 当前组表单 |
| locked | select `disabled` + 卡头 warm tag「IP & Mesh: Embedded NS only」 |
| 连接态 | `ms-tag--success` Connected / `--error` Disconnected |
| 字段错误 | `ms-input--error` + 错误 msg；未选文件时文件名位置红字提示 |
| 条件组 | 凭证/TLS 勾选展开对应行（`hidden` 切换） |

## 四、场景

**何时用**：LoRa Mesh 的转发目的地配置；需要「类型切换 + 连接状态 + 条件表单组」的转发流。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh 本体参数（密钥/跳数/频段） | `B_Eg71MeshConfigCard` |
| 数据转发规则列表（非 Mesh） | `bc-data-table` / `B_Eg71Content` |

## 五、Token

`--color-fill-base-normal`、`--color-border-base`、`--color-text-auxiliary/secondary`、`--color-error-normal`、`--radius-4/8`、`--spacing-4/8/12/16/24`。

## 六、依赖

- 基础原子：`form / input / select / checkbox / upload / card / tag / icon`，不新增基础原子，仅编排。
- 业务依赖：`bc-eg71-form-item-labelrow / -select / -msg(--error)` 结构类。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-forward'];
$app.innerHTML = C.render({ type: 'chirpstack', conn: 'connected',
  values: { server: '192.168.5.10', port: '1883', useTls: true, certType: 'Self-Signed Certificate' } });
C.bind($app);
```

## 八、版本

见 frontmatter `version:`。
