# REQ-016 · LoRa Mesh — 组件映射清单（A2 产物 · page-assembly.md §0 铁律工件）

> PRD 源：LoRa Mesh（飞书 wiki QK6RwHDmuidau8kg3yEcGBKPnad，2026-10-16 拉取）。
> 范围 = PRD 功能全景全量 5 模块（用户拍板：全量一个 REQ）：
> ① LoRa-General（P0）② LoRa-Gateway Fleet（P0）③ 数据流-数据列表（P1）④ Dashboard-LoRa Statistics（P0/P1）⑤ Dashboard-Gateway Status（P0）。
> 壳变更：navGroups 唯一源已增补 `{ label:'LoRa', icon:'lorawan', route:'/lora', children:['General','Radio','Gateway Fleet'] }`（提案已批，2026-10-16）。

## 一、路由与页面形态

| 路由 | 页面类型 | 形态 |
|---|---|---|
| `/lora/general` | 设置类 | `bc-eg71-content` 多区块卡片：Deployment Mode / Gateway Role / Mesh Configuration / Forwarding Destination / Frequency Plan / Network Server Parameters（按角色显隐） |
| `/lora/radio` | 设置类（简版） | 多信道设置卡——Mesh 频段告警「点击跳转多信道设置」的链路必需落点（B 类补全），8 频段开关 |
| `/lora/gateway-fleet` | 列表/流程类 | 单卡四周 20px：三视角成员/邻居表 + 编辑/详情抽屉 + 删除弹窗 |
| `/dashboard` | 概览 | 工作模式示意图 + 设备概况 + 信道容量 + 级联网关卡（按角色变体） |
| `/data-services/data-stream` | 列表/流程类 | 单卡：mesh 帧列表 + 帧详情抽屉（NS 视图按角色显隐） |

**角色状态联动**：demo 全局 `MS_MESH_ROLE`（General 页保存后更新），Fleet / Dashboard / Data Stream 页按当前角色重渲染——真实交互链，非并排摆样子。

## 二、形态 → 组件映射（逐行）

### A. LoRa General

| # | 业务形态 | 组件 / 原子 | ctx 参数 |
|---|---|---|---|
| A1 | Deployment Mode 区块（既有四模式单选） | `bc-eg71-content` + `bc-eg71-form-item-radio-group` | Fleet Gateway 默认选中 |
| A2 | Gateway Role 级联选择（组网方式+角色 optgroup 单选、角色提示文案联动、Relay ID 自动生成展示、证书下载链接） | **铸造 `B_Eg71MeshRoleCard`（bc-eg71-mesh-role）** | role:'mesh-master-ns' 等 6 组合；roleChange 冒泡 |
| A3 | Mesh Configuration 表单卡（签名密钥密码框/最大中继跳数/Mesh 频段多选 + 高级折叠：功率/SF/BW/CR/忽略直连/心跳 + 跳数风险提示实时联动 + 频段被禁用告警） | **铸造 `B_Eg71MeshConfigCard`（bc-eg71-mesh-config）**，内部经 `bc-eg71-form-item-input/select` | isMaster/isRelay 分变体；hopsChange 冒泡驱动容量提示 |
| A4 | Forwarding Destination 卡（Type 单选 + 连接状态 tag + ChirpStack MQTT 表单组（Topic/地址/端口/用户凭证/TLS/证书）/ Embedded NS 无配置 / Semtech UDP 表单组；IP&Mesh 锁定 Embedded NS） | **铸造 `B_Eg71MeshForwardCard`（bc-eg71-mesh-forward）**，内部经 `bc-eg71-form-item-*` | type:'embedded'\|'chirpstack'\|'semtech'；conn 状态 tag |
| A5 | 角色切换确认弹窗（PRD 5 方向文案） | `B_Eg71Modal` action:'confirm' | title/desc 按 PRD 表 |
| A6 | 表单底部保存/重置 | `B_Eg71FormFooter` | save → 校验 → 弹窗（涉 NS 停止方向）→ toast |
| A7 | 校验错误态（必填/格式/范围，PRD 错误文案逐条） | `bc-eg71-form-item-input/select` `status:'error'` + `msg` | — |
| A8 | Master(ChirpStack/Semtech) 与 Relay 隐藏 5 个数据服务入口 | 侧边栏菜单显隐（shell 渲染后按角色置灰/隐藏） | PRD 隐藏清单逐项 |
| A9 | 频段计划 / 报文过滤 / 数据重传 / NS 参数（按角色显隐的被动参数区块） | **铸造 `B_Eg71MeshModuleCard`（bc-eg71-mesh-module）**，行级字段宿主注入 | visibility 按角色矩阵 |

### B. LoRa Gateway Fleet

| # | 业务形态 | 组件 / 原子 | ctx 参数 |
|---|---|---|---|
| B1 | 成员表（Master / IP&Mesh：EUI 或 Relay ID、名称、状态、最近更新、操作） | `ms-table`（bc-data-table 同源原子）+ `ms-tag`（在线/离线）+ `bc-eg71-table-ops` | rows 种子数据 |
| B2 | 邻居表（Relay：ID、名称、最近更新；无状态无操作） | 同上（列集裁剪） | 仅 24h 内周边 Relay |
| B3 | 编辑抽屉（Relay ID 只读 + 名称可编辑 + 校验） | 结构类 drawer（bc-eg71-scan-edit-drawer 范式）+ `bc-eg71-form-item-input`（readonly/value/showCount） | PRD 名称规则：字母数字-_，首字母，≤20 |
| B4 | 详情抽屉（基本信息 4 字段 + 信号质量 RSSI/SNR avg） | `B_Eg71ProtocolDetail`（sections.fields 范式，直接复用） | sections:[基本信息, 信号质量（近1小时）] |
| B5 | 删除确认弹窗（仅离线可删；在线行删除钮禁用） | `B_Eg71Modal` action:'delete' | desc「确定要删除该中继网关吗？」 |
| B6 | 空态 | `ms-empty` | 无成员时 |
| B7 | IP&Mesh 视角 Agent 行编辑/详情 | 按「现有逻辑」= 内置 NS 表单/描述演绎 | PRD：Agent 按现有逻辑 |

### C. Dashboard（LoRa Statistics + Gateway Status）

| # | 业务形态 | 组件 / 原子 | ctx 参数 |
|---|---|---|---|
| C1 | 工作模式数据流示意图（4 变体：Mesh-Master-ChirpStack / Mesh-Master-Embedded / Relay / IP&Mesh-Master；含 External NS 连接状态 / 在线设备数标注） | **铸造 `B_Eg71MeshFlowDiagram`（bc-eg71-mesh-flow）** | variant + 说明文案（PRD 逐字） |
| C2 | 设备概况（全数据态：周边活跃/繁忙/已接入 + 添加→；提示态：外部 LNS 管理 / 边界网关管理文案，无添加钮） | `bc-eg71-dashboard-devices`（聚合数值）+ 提示文案卡（info 图标+文案，PRD 逐字） | 按角色切换两态 |
| C3 | 信道容量（mesh 帧计入 Air Time） | 既有 dashboard 卡片范式（ms-card + 进度/数值） | P1 口径演绎 |
| C4 | 级联网关摘要卡（Master: N/N 在线；Relay: N；IP&Mesh: Agent N/N + Relay N/N） | **铸造摘要形态入 `B_Eg71MeshFlowDiagram` 家族？→ 独立结构类 + `ms-card`**（指标+状态色） | 按角色 |
| C5 | 级联网关抽屉（字段表 + Configuration 按钮跳配置页 + 空态变体） | `B_Eg71ProtocolDetail`（sections.table 范式） | rows；config 跳 /lora/gateway-fleet |

### D. 数据流 - 数据列表

| # | 业务形态 | 组件 / 原子 | ctx 参数 |
|---|---|---|---|
| D1 | mesh 帧列表（内置 NS 视角：Time/Device/Direction/Fcnt/Payload Size/操作；ChirpStack/Relay 视角：Time/Direction/Frequency/DataRate/RSSI-SNR/Frame Size/操作） | `ms-table` + `ms-tag`（Up/Dn）+ `bc-num` | 三视角列集切换 |
| D2 | 帧详情抽屉（Basic/Control&payload/Radio 或 Basic/RF Metrics 分组，新增字段 Relay ID / Mesh Heartbeat） | `B_Eg71ProtocolDetail`（sections.fields，直接复用） | 按帧类型组 sections |
| D3 | NS 视图页签隐藏（Master-ChirpStack 角色下） | 页签显隐 | — |
| D4 | 心跳帧行标识 | `ms-tag`（Heartbeat） | Mesh Heartbeat=true 行 |

### E. 全局

| # | 业务形态 | 组件 / 原子 |
|---|---|---|
| E1 | 页面壳（侧边栏+顶栏+面包屑） | `MS_EG71_SHELL`（navGroups 含新 LoRa 菜单） |
| E2 | 页内横幅（频段禁用告警等） | `B_Eg71AlertBar`（tone:'error'） |
| E3 | toast 反馈 | `ms-alert` toast 范式（REQ-011/013） |
| E4 | 图标 | `S_Icon`（MS_ICONS），16 起阶梯，热区 ≥24 |

## 三、铸造清单（8 新 L3，注册回库）

| 组件 | id | 归属 | atoms |
|---|---|---|---|
| `B_Eg71MeshRoleCard` | `bc-eg71-mesh-role` | business/eg71/ | form/select/card/icon/tag/button（含可选 `ctx.deployment` Deployment Mode 单选区块，A1 落点） |
| `B_Eg71MeshConfigCard` | `bc-eg71-mesh-config` | business/eg71/ | form/input/select/checkbox/card/icon/alert |
| `B_Eg71MeshForwardCard` | `bc-eg71-mesh-forward` | business/eg71/ | form/input/select/checkbox/upload/card/tag/icon |
| `B_Eg71MeshFlowDiagram` | `bc-eg71-mesh-flow` | business/eg71/ | card/icon/tag/text（纯结构连线用 token） |
| `B_Eg71MeshFleetTable` | `bc-eg71-mesh-fleet` | business/eg71/ | table/tag/button/icon/empty/checkbox（B1/B2 原计划页面层 ms-table，按 page-assembly §1 两级装配改铸 L3） |
| `B_Eg71MeshFrameList` | `bc-eg71-mesh-frames` | business/eg71/ | table/tag/button/icon/empty/select（D1 同上） |
| `B_Eg71MeshRadioCard` | `bc-eg71-mesh-radio` | business/eg71/ | card/switch/icon/text（B 类补全：Mesh 频段告警「点击跳转多信道设置」的落点页） |
| `B_Eg71MeshModuleCard` | `bc-eg71-mesh-module` | business/eg71/ | form/input/select/switch/card/icon/text（A9 频段计划/报文过滤/数据重传/NS 参数按角色显隐的通用被动模块卡；`bc-eg71-content` 硬编码无法参数化，页面层拼 L2 违反 page-assembly §1，故铸造） |

## 四、种子数据

- Master（Mesh-Embedded NS）视角：Relay 成员 6 台（A1B2C3D4 在线 / 24E124FFFE123456 离线…），帧数据 8 条（Up×5 含 Heartbeat×2 / Dn×2），心跳 60s / 跳数 1 / 功率 14dBm / RSSI avg -89 / SNR avg 7.5。
- Relay 视角：周边 Relay 3 台（24h 内）。
- IP&Mesh 视角：Agent 2 + Relay 2 混合成员表。
- 频段：EU868 8 频段（附录 A），默认勾选 F1-F3；F4 在多信道设置禁用 → 告警演绎。

## 五、缺口预判（interaction-completeness，A5 复核）

| 功能点 | 类别 | 缺什么 | demo 处理 |
|---|---|---|---|
| 跳数容量预估公式 | C 待澄清 | 口径含糊（可用−增量×已用） | 按字面演绎（≥20% / <20% 两档文案）；记 issue |
| AS923-1 F1=F8=923.2 | C 待澄清 | 附录 A 疑似撞频笔误 | demo 用 EU868 不受影响；记 issue |
| 角色配图与表格矛盾 | C 待澄清 | 配图 Mesh 下写 Agent | 以正文表格（Master/Relay）为准；记 issue |
| IP&Mesh 成员混列排序口径 | D 建议增补 | EUI 与短 ID 同列排序/去重未定义 | 按通信时间倒序演绎；记 issue |
| General 保存后反馈 | B 链路断 | PRD 未写保存 toast | 补 toast「配置已保存」【PRD 缺省 · demo 补全】 |
| 证书下载（IP Master） | D 隐含缺失 | 仅文案提及「下载证书」 | 链接钮演绎，下载内容留 issue |
| Radio 页跳转落点 | B 链路断 | Mesh 频段告警跳「多信道设置」页面未给 PRD | 简版多信道卡演绎（B 类补全，8 频段开关） |
| FUOTA/扫描取消提示 | A | PRD 已写明（callout） | Relay/ChirpStack Master 保存后 toast「已取消进行中任务」 |

## 六、消费确认

- 已读契约：bc-eg71-modal、bc-eg71-content、bc-eg71-form-item-input/select、bc-eg71-toolbar、bc-eg71-alert-bar、bc-eg71-dashboard-devices、bc-eg71-protocol-detail（§2 组装契约）。
- 壳契约：`MS_EG71_SHELL.render(ctx,{content,footer})` + `bind($app)`；navGroups 唯一源已增补 LoRa（本次合法变更，提案已批）。
- §7 偏差内联时就地修正（ico 14→16 / ms-space--8→--12 按钮组 / stat-title 13→12 / protocol-card padding→16），不回写 assets 源头。
