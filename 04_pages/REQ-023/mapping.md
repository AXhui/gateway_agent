# REQ-023 · UG6X LoRa Mesh（Figma 71.0.0.5 重制版）— 组件映射清单（page-assembly.md §0 铁律工件）

> PRD 源：飞书 wiki QK6RwHDmuidau8kg3yEcGBKPnad（UG6X LoRa Mesh，2026-11-13 拉取）。
> Figma 源：71.0.0.5（12 页截图全量分析）。**样式以 Figma 为主**（用户指令），交互/内容/细节按 Figma，PRD 补充。
> 同一 PRD 此前交付 REQ-014/016 —— 本版按 page-assembly.md §0.5 当作全新需求重做：旧 demo 非基线，形态逐条对照当前契约；差异见 validation.md「旧形态 × 新规则」节。

## 〇、库升级（样式以 Figma 为主的落地路径）

四个既有 L3 组件按 Figma 71.0.0.5 形态扩展（SemVer minor，SKILL.md 同步）：

| 组件 | 版本 | 升级内容 |
|---|---|---|
| `B_Eg71MeshRoleCard`（bc-eg71-mesh-role） | 1.0.0 → **1.1.0** | 新增 Deployment Mode 四卡选择器（前 3 卡 + More 展开、radio-dot、is-selected 主色态）+ Secure connections 复选（ip-master）+ `eg71-mesh-deployment-change`/`eg71-mesh-secure-change` 事件 |
| `B_Eg71MeshConfigCard`（bc-eg71-mesh-config） | 1.0.0 → **1.1.0** | 顶部密钥/跳数双列（`ms-grid-2` + `bc-com-form-grid`）；Relay Advanced 改两列结构（TX/BW/心跳左列 + SF/CR 右列） |
| `B_Eg71MeshFleetTable`（bc-eg71-mesh-fleet） | 1.2.0 → **1.3.0** | 成员表新增：勾选列 + 表头全选（indeterminate）、卡体顶部工具栏（批量 Delete + 搜索，贴顶 + 下分隔线）、表底分页（刷新/Total/页码窗口/每页条数/跳页）、内置 Detail 抽屉（Basic Info + Signal Quality RSSI/SNR(avg)）、Edit 抽屉 idLabel 覆写 + 8 事件 |
| `B_Eg71MeshFlowDiagram`（bc-eg71-mesh-flow） | 1.1.0 → **1.2.0** | cascade 行去 View 钮改纯展示（Figma 形态），Configuration 钮保留 |

## 一、路由与页面形态

| 路由 | 页面类型 | 形态 |
|---|---|---|
| `/lora/general` | 设置类 | Tab 栏（General/Radio/Gateway Fleet）+ 多区块卡片：Deployment Mode（含 Gateway Role + Secure connections）→ Mesh Configuration → Forwarding Destination → Frequency Plan；footer Reset/Save（英文） |
| `/lora/radio` | 设置类（简版） | 多信道设置卡（8 频段开关）——Mesh 频段告警跳转落点 |
| `/lora/gateway-fleet` | 列表/流程类 | 单卡：成员表（工具栏 + 勾选 + 分页 + 行操作）+ 编辑/详情抽屉 + 删除确认弹窗 |
| `/dashboard` | 概览 | LoRa Statistics（含级联摘要卡，按角色变体）+ 工作模式示意图 |
| `/data-services/data-stream` | 列表/流程类 | 单卡：mesh 帧列表 |

**角色状态联动**：全局 `MS_MESH_ROLE`（General 保存后更新）；Fleet / Dashboard / Data Stream 按当前角色重渲染。Agent 角色隐藏 Gateway Fleet 页签（PRD：Agent 不出现在成员表，故自身无 Fleet 页）。

## 二、形态 → 组件映射（逐行）

### A. LoRa General（`/lora/general`）

| # | 业务形态 | 组件 | ctx 要点 |
|---|---|---|---|
| A1 | 页签条（EG71 Tab 契约：右列顶部贴导航栏） | `B_Eg71PageTabs`（bc-eg71-page-tabs） | tabs=[General,Radio,Gateway Fleet]（Agent 时去 Fleet）；flush=true |
| A2 | Deployment Mode 四卡选择 + Gateway Role 级联下拉 + Secure connections | `B_Eg71MeshRoleCard` 1.1.0（bc-eg71-mesh-role） | deploy:'fleet'；role 按保存态；relayId；secure；事件驱动重渲染下方卡片 |
| A3 | Mesh Configuration（密钥/跳数双列 + 频段 chips + Advanced 按角色变体 + 跳数风险实时 + 频段禁用告警） | `B_Eg71MeshConfigCard` 1.1.0（bc-eg71-mesh-config） | role 联动；values/errors/risk/freqWarning |
| A4 | Forwarding Destination（Type 三选 + 条件表单 + 连接态 + IP&Mesh 锁定） | `B_Eg71MeshForwardCard`（bc-eg71-mesh-forward） | type:'chirpstack'；ipmesh 时 locked:true |
| A5 | Frequency Plan（频段下拉 + Advanced） | `B_Eg71MeshModuleCard`（bc-eg71-mesh-module） | rows=[select CN470…] |
| A6 | 底部操作栏（Reset / Save） | `B_Eg71FormFooter`（bc-eg71-form-footer） | buttons=[{Reset},{Save,filled}] 英文 |
| A7 | 保存成功/失败反馈 | `B_Eg71Message`（bc-eg71-message） | eg71-message-show 驱动 |
| A8 | 角色切换确认（PRD 5 方向文案） | `B_Eg71Modal`（bc-eg71-modal） | action:'confirm'，英文 title/okText/cancelText |

### B. Gateway Fleet（`/lora/gateway-fleet`）

| # | 业务形态 | 组件 | ctx 要点 |
|---|---|---|---|
| B1 | 页签条（同 A1） | `B_Eg71PageTabs` | tab:'fleet' |
| B2 | 成员表（勾选/Identifier/Name/Status/Last Updated/操作 + 工具栏批量 Delete + 搜索 + 分页 Total 392） | `B_Eg71MeshFleetTable` 1.3.0（bc-eg71-mesh-fleet）view='members' | rows/pager{total:392,page:1,pages:40,size:10}；toolbar 默认开 |
| B3 | 邻居表（Relay 角色；ID/Name/Last Updated + 搜索 + Total 312） | `B_Eg71MeshFleetTable` view='neighbors' | 4-byte 短 ID；无状态/操作/勾选列 |
| B4 | 行编辑抽屉（Identifier 只读 + Name 校验：字母开头、字母数字-_、≤20） | `B_Eg71MeshFleetTable` editDrawer | nameError 实时；Save → toast + 列表名更新 |
| B5 | 行详情抽屉（Basic Info：最后心跳时间/心跳间隔/最大中继跳数/发射功率 + Signal Quality：RSSI/SNR(avg) 每次查询刷新） | `B_Eg71MeshFleetTable` detailDrawer | basics/signal 数值每次打开随机刷新（PRD「按查询刷新」语义） |
| B6 | 删除确认弹窗（仅离线可删；在线行 Delete 禁用 + title 提示） | `B_Eg71Modal` action:'delete' | 英文 title 'Delete Member'；确定后行移除 + toast |
| B7 | 批量删除（勾选启用 → 含在线行时报错 toast） | B2 工具栏 + `B_Eg71Message` | eg71-mesh-fleet-batch → 校验 |
| B8 | 搜索过滤（Name/EUI 实时） | B2/B3 内置 | eg71-mesh-fleet-search → 页内过滤重渲染 |

### C. Dashboard（`/dashboard`）

| # | 业务形态 | 组件 | ctx 要点 |
|---|---|---|---|
| C1 | Gateway Status 级联摘要卡（Agent n/n + Relay n/n 行，状态 tag：全部在线/部分离线/全部离线/无数据） | `B_Eg71MeshFlowDiagram` 1.2.0 mode='cascade' | cascade 行按 MS_MESH_ROLE 变体；Configuration → 跳 Fleet |
| C2 | LoRa Statistics 工作模式示意图 | `B_Eg71MeshFlowDiagram` mode='flow' | variant 按 5 角色映射 4 变体 |
| C3 | 面包屑/壳导航到上述页 | `MS_EG71_SHELL` | data-route 驱动 |

### D. Data Stream（`/data-services/data-stream`）

| # | 业务形态 | 组件 | ctx 要点 |
|---|---|---|---|
| D1 | Mesh 帧列表（ns 视角 5 列 / raw 视角 6 列，心跳帧 Heartbeat 标注） | `B_Eg71MeshFrameList`（bc-eg71-mesh-frames） | view 按 MS_MESH_ROLE |

### 壳与全局

| # | 形态 | 来源 |
|---|---|---|
| S1 | 唯一壳（侧边栏 + 顶栏 + 面包屑） | `window.MS_EG71_SHELL` + navGroups 唯一源（`/lora`、`/data-services` 入口既有，不改菜单） |
| S2 | 全状态导出 | `MS_FIGMA_EXPORT`（General 各部署态 / Fleet 勾选+删除弹窗+编辑/详情抽屉 / 空 Tab 联动 / Dashboard cascade 变体） |

## 三、铸造/升级边界

- **无新铸造**：全部形态命中既有 B_*（4 个组件按 Figma 升级，见 §〇）。
- 页面层零手写业务形态：仅 ctx 注入 + 事件编排 + 角色状态机（页面级纯结构，page-assembly.md §6 边界）。
