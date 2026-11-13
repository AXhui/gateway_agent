---
name: B_Eg71MeshFleetTable
version: 1.3.0
description: Mesh 成员/邻居表（业务组件）
---

# Mesh 成员/邻居表 · B_Eg71MeshFleetTable

> **逻辑名**：`B_Eg71MeshFleetTable`
> **运行时 id**：`bc-eg71-mesh-fleet`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa → Gateway Fleet 的成员/邻居单卡列表：`members` 视角（勾选列 / Identifier / Name / Status / Last Updated / 操作，仅离线行可删——在线行 Delete 禁用；卡体顶部工具栏 = 批量 Delete（禁用态直至勾选）+ 右侧搜索；表底分页 = 刷新钮 + Total + 页码窗口 + 每页条数 + 跳页）与 `neighbors` 视角（ID / Name / Last Updated，无状态无操作，仅搜索）。行级 Edit / Detail 抽屉（Detail 含 Basic Info + Signal Quality RSSI/SNR(avg)，刷新即重取）。遵守 EG71 表格左对齐契约（数字列 `bc-num`、操作列 `bc-eg71-table-ops`）。

**不是**：通用设备列表（`bc-eg71-device-list` 管数采设备；本表管 Mesh 成员/邻居网关）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | `ms-table` | 列表骨架（td 数字列 `bc-num`、操作列 `bc-eg71-table-ops`） |
| `S_Tag` | `ms-tag--success/warm` | Online / Offline 状态 |
| `S_Button` | `ms-btn--sm(--danger)/--link/--filled` | 行操作图标钮 / 批量 Delete / 刷新 / 抽屉底部钮 |
| `S_Icon` | `MS_ICONS` | 图标 |
| `S_Empty` | `ms-empty` | 空态（保留表头） |
| `S_Checkbox` | `ms-checkbox` | 勾选列（members）+ 表头全选（含 indeterminate） |
| `S_Input` | `ms-input` | 工具栏搜索框（search 图标前置）+ 跳页输入 |
| `S_Select` | `ms-select--sm` | 每页条数（10/20/50） |
| `S_Pagination` | `ms-pagination` / `ms-page-item` / `ms-page-jump` | 分页窗口（首/末/当前±1，省略号折叠） |
| `S_Drawer` | `ms-drawer` | Edit / Detail 抽屉 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `view` | `'members'\|'neighbors'` | `'members'` | 视角切换（列集/操作随之变化） |
| `rows` | array | `[]` | `{id, kind?, name, status?, updated}` |
| `title` | string | 按视角 | 卡头标题覆写 |
| `actionsHtml` | string | `''` | 卡头右侧操作区（宿主注入，如 Refresh 钮） |
| `tip` | string | — | 表底说明（如「仅离线成员可删除」） |
| `toolbar` | boolean | `true` | `false` 时不渲染工具栏（neighbors 亦只有搜索） |
| `search` / `searchPlaceholder` | string | — / 按视角 | 工具栏搜索初值与占位文案 |
| `pager` | `{total, page, pages, size}` | 无 | 传入即渲染表底分页 |
| `editDrawer` | `{id, name, nameError?, open?, info?, idLabel?}` | 无 | 传入即渲染内置 Edit 抽屉（Identifier 只读 + Name 可编辑，名称规则提示与行级错误；`info?: [{label,value}]` 追加只读展示行；`idLabel` 覆写首行标签，如 neighbors 视角 'ID'），`open:true` 时打开 |
| `detailDrawer` | `{open, basics:[{label,value}], signal:{rssi,snr}, tip?}` | 无 | 传入即渲染内置 Detail 抽屉（400px；Basic Info 行 + Signal Quality (Last 1h) RSSI/SNR(avg)） |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-fleet-op` | `{op:'edit'\|'detail'\|'delete', index}` | 行操作钮（delete 在线行已禁用） |
| `eg71-mesh-fleet-save` | `{name}` | 编辑抽屉 Save 钮（校验与落库由宿主负责；保存成功由宿主重渲染收起） |
| `eg71-mesh-fleet-select` | `{indexes[]}` | 勾选行 / 表头全选变化 |
| `eg71-mesh-fleet-batch` | `{indexes[]}` | 批量 Delete 钮（勾选为空时禁用） |
| `eg71-mesh-fleet-search` | `{value}` | 搜索输入（input 实时） |
| `eg71-mesh-fleet-refresh` | — | 分页区刷新钮 |
| `eg71-mesh-fleet-page` | `{page}` | 页码点击 / 跳页回车 |
| `eg71-mesh-fleet-size` | `{size}` | 每页条数切换 |

## 三、状态

| 状态 | 表现 |
|---|---|
| 数据态 | 行渲染 + 状态 tag + 勾选列（members） |
| 在线行 | Delete 钮 `disabled` + title 提示 |
| 空态 | `ms-empty`（表头保留） |
| neighbors | 无 Status/操作/勾选列，工具栏仅搜索 |
| 批量钮 | 无勾选 `disabled`；有勾选启用（danger） |
| 全选 | 全选框 checked/indeterminate 随行勾选同步 |
| 分页 | 当前页高亮；首/末边界 ‹ › 禁用；省略号折叠中间页 |

## 四、场景

**何时用**：Gateway Fleet 成员管理（Master / IP&Mesh）、Relay 邻居查看。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 数采设备列表 | `bc-eg71-device-list` |
| Mesh 帧流水 | `B_Eg71MeshFrameList` |

## 五、Token

`--spacing-12/16/20`（卡体/表头经 `ms-card` / `ms-table` 既有契约）、`--spacing-8/24`（分页/详情行距）、`--color-divider-base-1`（工具栏下分隔线）——样式以 Figma 71.0.0.5 为准，无新增常量。

## 六、依赖

- 基础原子：`table / tag / button / icon / empty / checkbox / input / select / pagination / drawer`，不新增基础原子，仅编排。
- 业务结构类：`bc-num`、`bc-eg71-table-ops`（左对齐契约）、`bc-eg71-toolbar`（工具栏骨架，贴顶 + 下分隔线）。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-fleet'];
$app.innerHTML = C.render({ view: 'members', rows: [
  { id: 'A1B2C3D4', kind: 'Relay ID', name: 'Relay-Warehouse', status: 'Online', updated: '2026-10-16 09:42' }] });
C.bind($app);
```

## 八、版本

见 frontmatter `version:`。
