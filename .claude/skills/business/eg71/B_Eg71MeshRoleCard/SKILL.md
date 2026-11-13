---
name: B_Eg71MeshRoleCard
version: 1.2.0
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

EG71 LoRa General 页的 Gateway Role 区块卡：组网方式 × 角色级联单选（5 组合 optgroup，32px 档）、Relay 角色自动生成 Relay ID（8 位示例 + 复制）、IP Master 的 Secure connections（info 提示图标）与证书下载链接钮（内缩 20px）。

**不是**：通用角色选择器（角色文案与 LoRa Mesh 业务强绑定，见 `MESH_ROLES` 唯一源）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段行骨架 |
| `S_Select` | `ms-select`（`.bc-eg71-mesh-role-select`） | 角色级联单选（optgroup 按组网方式分组） |
| `S_Card` | `ms-card` | 区块卡 |
| `S_Icon` | `MS_ICONS` | 标题 gateway 图标、复制/chevron 图标 |
| `S_Radio` | `ms-radio-dot` | Deployment Mode 卡片选中态圆点（**内联左置**——与卡名同行、图标位左侧，Figma 43:12085） |
| `S_Checkbox` | `ms-checkbox` | Secure connections（IP Connection Master） |
| `S_Button` | `ms-btn--link` | 证书下载 / 复制 / More |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `role` | `'ip-master'\|'ip-agent'\|'mesh-master'\|'mesh-relay'\|'ipmesh-master'` | `'mesh-master'` | 当前角色 key |
| `relayId` | `string` | `'24E124FFFE123456'` | Relay ID（仅 `.relay` 角色显示该行） |
| `deployment` | `{value, options?, msg?}` | 不传不渲染 | Deployment Mode 卡片选择器：`value` 选中卡 key（`'embedded-ns'\|'forwarding'\|'fleet'\|'hybrid'`）；`options` 覆写预设（前 3 卡直显 + More 展开第 4）；`msg` 卡区提示 |
| `secure` | `boolean` | `true` | Secure connections 勾选（仅 ip-master 显示该行） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-role-change` | `{role, conn, roleCn}` | 下拉切换角色 |
| `eg71-mesh-deployment-change` | `{value}` | 点选 Deployment Mode 卡（含键盘 Enter/Space） |
| `eg71-mesh-secure-change` | `{value}` | 切换 Secure connections |
| `eg71-mesh-cert` | — | 点击 Download Certificate（仅 cert 角色） |
| `eg71-mesh-copy` | `{value}` | 点击复制 Relay ID（含 clipboard 写入） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 卡片 + Deployment Mode 卡片选择器（前 3 卡 + More 展开第 4）+ 角色下拉（32px 小号档）；无灰底角色提示盒（角色提示并入级联下拉选项分组） |
| 展开更多 | More 钮切换 extra 区（`is-more-open`，第 4 卡 hybird 收纳于 `.bc-eg71-mesh-deploy-extra`），chevron 旋转 |
| 卡片选中 | `is-selected`（主色描边 + 左置 radio-dot 实心） |
| relay 角色 | Relay ID 行显示（`hidden` 属性切换） |
| cert 角色 | Secure connections 复选框行（尾随 16px info 提示图标）+ 提示文案下**内缩 20px**（`--spacing-xl`）的 Download Certificate 链接钮 |

## 四、场景

**何时用**：LoRa General 页选 Deployment Mode + 组网角色；任何需要「部署模式卡选 + 组网方式 × 角色」级联选择的 Mesh 配置流。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 非 LoRa Mesh 的角色/身份选择 | `bc-eg71-form-item-select` |

## 五、Token

`--color-fill-base-normal`、`--color-primary-bg`、`--color-primary-normal`、`--color-border-base`、`--radius-8`、`--duration-fast`、`--ease`、`--spacing-4/8/12/16/20`、`--color-text-secondary`、`--color-text-auxiliary`、`--color-text-link-normal`、`--color-icon-*`（info 图标）（Deployment Mode 卡片选择器样式以 Figma 71.0.0.5 node 43:12085 为准）。

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
