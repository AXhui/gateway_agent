# REQ-011 · EG71 M-Bus 协议支持 Demo

## 任务

来源：飞书 wiki《【EG71】AI测试》= EG71 M-Bus 协议支持主 PRD
（https://milesight.feishu.cn/wiki/CqYjwRIS9ieQPikk3O0ck4mOnOe）。

按 PRD 8 大 UI 模块产出可交互 demo，**所有可点击交互补齐**（按钮/弹框/校验/toast/抽屉/向导）。

## 路由与模块

| 路由 | 模块 |
|---|---|
| /dashboard | ⑦ 状态概览（M-Bus 接口卡 → 详情抽屉 → 设备数跳列表 / 配置按钮） |
| /network/network-interface | ① 接入网络管理（M-Bus 行仅编辑+查看） |
| /network/network-interface/edit | ① M-Bus 网络 编辑/查看表单（波特率联动高级默认值 + 范围校验） |
| /data-services/data-acquisition | ④ 设备管理（列表 + 编辑抽屉 + 删除级联确认） |
| /data-services/data-acquisition/scan | ② 设备扫描添加（三段向导 + 进度弹框 + 主从选择 + 冲突折叠区） |
| /data-services/data-acquisition/add | ③ 设备手动添加（两步表单 + 型号分叉流程） |
| /data-services/data-acquisition/objects | ⑤ 数据对象管理（启用开关/快捷编辑/手动添加抽屉/复制对象流程） |
| /data-services/data-stream | ⑥ 数据流（M-Bus 筛选置前 + RX/TX + hex 详情抽屉） |
| /data-services/data-library | ⑧ 设备库模板（M-Bus 模板 + 对象抽屉含 BACnet/Modbus 转发联动） |

## 组件映射清单（page-assembly §0）

| 形态 | 映射 |
|---|---|
| 页面壳（侧边导航+顶栏+路由） | `MS_EG71_SHELL.render(ctx,{content,footer})` + `bind(app)` |
| 表单底部操作栏（取消/保存） | `B_Eg71FormFooter.render(ctx)`（查看模式 ctx.readonly 不渲染） |
| M-Bus 编辑/查看表单项 | `B_Eg71FormItemInput`（名称/延时/超时/重试，error 态红字）+ `B_Eg71FormItemSelect`（协议/波特率）+ `B_Eg71FormItemRadioGroup`（寻址/扫描方式） |
| 二次确认弹窗（删除/数量校验/型号切换/覆盖确认/冲突确认/复制结果） | `B_Eg71Modal.render({action,title,desc,okText})` + `bind(app)` + `wrap.open()` |
| 设备列表（勾选/批量删除/信号气泡/行内操作） | `B_Eg71DeviceList.render({rows,total})` + `bind`（事件：`eg71-device-add` / `eg71-device-op`） |
| 对象字段明细表 / 数据流表 / 模板列表 | `B_Eg71Data Table → bc-data-table.render({entity,rows})`（embedded/plain 按需） |
| 筛选栏（对象页/数据流页/模板页搜索） | `B_Eg71FilterBar → bc-filter-bar.render({entity})` |
| 状态标签（Online/Offline/从未上线/冲突） | `U.statusTag({cn,tone})`（bc-status-tag 原子） |
| 状态概览协议卡片墙（含 M-Bus 子项可点） | `B_Eg71Dashboard.render({cards})` + `bind`（事件：`eg71-protocol-navigate`，子项 stopPropagation） |
| 接入设备统计（总/在线/离线/从未上线） | `B_Eg71DashboardDevices.render({devices:{total,online,offline,notActivated}})` |
| M-Bus 接口详情抽屉 | `B_Eg71ProtocolDetail.render({detail:{title,tags,sections}})` + `bind` |
| 指标卡组（各页首屏统计） | `B_Eg71MetricCard.render(ctx.entity.metrics)` |

页面层结构形态（无对应 B_*，按 REQ-007 范式以页面类 + ms-* 原子编排，清单报备）：

| 形态 | 说明 |
|---|---|
| 接入网络列表（M-Bus 行无删除 → 行级操作差异） | bc-data-table 操作列为实体级统一契约，不支持行级差异；走页面 ms-table 编排，弹窗仍复用 B_Eg71Modal |
| 扫描三段向导壳 + 进度弹框 + 添加结果弹框 | 无 B_* 向导/进度组件；ms-steps / ms-progress / ms-modal 原子编排 |
| 设备名编辑弹框（带输入校验） | B_Eg71Modal desc 为纯文本契约，不承载输入；页面 ms-modal + ms-input |
| 对象列表（启用开关/名称快捷编辑/获取值） | 行内交互契约外形态；ms-table + ms-switch/ms-input 编排，弹窗复用 B_Eg71Modal |
| 设备编辑抽屉 / 对象手动添加抽屉 / 数据流详情抽屉 / 复制对象流程 / 模板对象抽屉 | 无通用业务抽屉契约（bc-detail-drawer 绑定告警实体时间轴）；页面 ms-drawer 编排，内部表单一律 B_Eg71FormItem* |
| toast | REQ-007 已确立页面级范式 |

## 关键交互规格（来自 PRD）

1. **网络编辑**：名称/协议禁用；波特率 1200/2400/4800/9600 切换联动高级默认值（1200→75ms/3800ms/1、2400→50/2000/1、4800→25/1100/1、9600→10/700/1）；帧间延时 0-1000、超时 100-60000、重试 0-10，越界红框+红字；查看=全禁用无底栏。
2. **扫描**：掩码 8 位首位 F 后 7 位 0-9/F，全 F 拦截提示；自动分配一次地址默认勾选；超时 100-60000/重试 0-30（2400 波特默认 350/5）；进度=已探索/250 地址空间，「停止扫描，下一步」（进行中设备丢弃）；步骤二左分组（厂商+介质+数据点签名，组名「厂商 介质 Group N — X台×Y对象」）右对象表；冲突折叠区（一次地址冲突可添加仅告警/二次地址冲突不可添加，每地址最多 3 行+「还有 x 台」）；对象超 100 限选；确认添加→数量校验（250/2000/20000）→结果弹框（固定高度滚动+复制）。
3. **手动添加**：名称必填唯一≤127；一次地址 1-250 查重；二次地址 16 位 hex；采集间隔默认 600 范围 60-86400；下一步设备立即创建状态「从未上线」；型号 None→对象列表页（扫描/手动/跳过），非 None→对象选择页（完成/完成并继续添加/上一步/取消）。
4. **设备管理**：协议列「M-Bus / [网络名]」；状态从未上线/在线/离线+多告警 hover；对象数量点击进对象页；编辑抽屉型号切换二次确认；删除二次确认级联。
5. **对象管理**：对象 ID 降序；名称快捷编辑；扫描添加仅在线可用（置灰 hover 提示），进度最少 2 秒，结果抽屉 VIB⚠提示/已添加对象锁定；获取值 toast；手动添加保存时 DIB+VIB+记录位置重复拦截弹框；复制对象：覆盖/新增单选默认新增、目标设备搜索全选、覆盖二次确认、新增冲突「X台冲突确认只复制无冲突」、结果「成功N台跳过M台」。
6. **数据流**：设备类型筛选 M-Bus 置 KNX/TP 前；RX/TX；详情抽屉 hex+复制；上限 20000 循环覆盖。
7. **状态概览**：M-Bus 卡点击→抽屉（波特率+已接入设备数）；设备数点击→设备列表带 M-Bus 过滤；配置按钮→快捷编辑接入网络。
8. **模板库**：协议过滤加 M-Bus；协议选 M-Bus→型号列表 M-Bus+None；添加对象抽屉（基础+可选 BACnet[Analog-Input/CharacterString-Value]+Modbus[Input/Holding Register+数据格式联动寄存器数量 1-121，String 可改上限 64]）；编辑页对象名称只读；删除被引用 toast「正在被引用，无法删除」。

## 构建

- 平台层（L1 令牌 / L2 原子注册表 / L3 业务注册表 / MS_EG71_SHELL / 冻结 Logo）从 REQ-007 demo 提取复用。
- 页面层：`S` 单一状态 + `render()` 全量重渲 + 事件委托（REQ-007 范式）。
- 校验：无头 Chrome 截图自检。
