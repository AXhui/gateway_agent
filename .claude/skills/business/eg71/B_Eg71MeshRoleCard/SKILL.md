---
name: B_Eg71MeshRoleCard
version: 1.0.0
description: Mesh 角色级联卡（业务组件）
---

# Mesh 角色级联卡 · B_Eg71MeshRoleCard

> **逻辑名**：`B_Eg71MeshRoleCard`
> **运行时 id**：`bc-eg71-mesh-role`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

EG71 LoRa General 页的 Gateway Role 区块卡：组网方式 × 角色级联单选（5 组合 optgroup）、角色提示文案联动、Relay 角色自动生成 Relay ID（8 位示例 + 复制）、IP Master 的证书下载链接钮。

**不是**：通用角色选择器（角色文案与 LoRa Mesh 业务强绑定，见 `MESH_ROLES` 唯一源）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段行骨架 |
| `S_Select` | `ms-select` | 角色级联单选（optgroup 按组网方式分组） |
| `S_Card` | `ms-card` | 区块卡 |
| `S_Icon` | `MS_ICONS` | 标题 gateway 图标、复制图标 |
| `S_Tag` | `ms-tag` | （证书场景预留） |
| `S_Button` | `ms-btn--link` | 证书下载 / 复制 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `role` | `'ip-master'\|'ip-agent'\|'mesh-master'\|'mesh-relay'\|'ipmesh-master'` | `'mesh-master'` | 当前角色 key |
| `relayId` | `string` | `'24E124FFFE123456'` | Relay ID（仅 `.relay` 角色显示该行） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-role-change` | `{role, conn, roleCn}` | 下拉切换角色 |
| `eg71-mesh-cert` | — | 点击 Download Certificate（仅 cert 角色） |
| `eg71-mesh-copy` | `{value}` | 点击复制 Relay ID（含 clipboard 写入） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 卡片 + 角色下拉 + 提示文案块 |
| relay 角色 | Relay ID 行显示（`hidden` 属性切换） |
| cert 角色 | 提示文案尾随 Download Certificate 链接钮 |

## 四、场景

**何时用**：LoRa General 页选组网角色；任何需要「组网方式 × 角色」级联选择的 Mesh 配置流。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 非 LoRa Mesh 的角色/身份选择 | `bc-eg71-form-item-select` |
| 设备接入模式四选一（Deployment Mode） | `bc-eg71-content` + radio-group |

## 五、Token

`--color-fill-base-normal`、`--radius-4`、`--spacing-4/8/12/16`、`--color-text-secondary`、`--color-text-auxiliary`（提示/说明文字色经 base 类 + 结构类组合表达）。

## 六、依赖

- 基础原子：`form / select / card / icon / tag / button`，不新增基础原子，仅编排。
- 共享唯一源：`MESH_ROLES` + `MESH_ROLE_HINT`（`registry-business.js` IIFE 模块级，与 config/forward 组件共用）。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-role'];
$app.innerHTML = C.render({ role: 'mesh-relay', relayId: '24E124FFFE123456' });
C.bind($app);
$app.addEventListener('eg71-mesh-role-change', e => console.log(e.detail));
```

## 八、版本

见 frontmatter `version:`。
