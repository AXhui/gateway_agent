# REQ-018 · EG71 M-Bus 数据转发（四通道）组件映射清单

> 同一 PRD 已交付：REQ-011（8 大模块全景）、REQ-014（告警中心）、REQ-015（总线状态概览）。
> 本次差异化主题：**5.8 数据转发**——MQTT / HTTP / BACnet Server / Modbus Server 四通道的
> M-Bus 对象接入：添加对象抽屉（无对象设备置灰提示）、BACnet/Modbus 对象编辑（类型联动）、
> 删除/批量导出、BACnet 实例编号与 Modbus 寄存器地址的**自动分配-释放-复用**、
> 对象列表 hover 信息（设备名称/对象名称双层 tooltip）、转发失败处理与 Error Notification 内容。
> 路由：`/data-services/data-forwarding`（navGroups 既有入口 Data Forwarding，未改菜单）。

## B_* 组件映射（page-assembly §0 清单）

| 业务形态 | 映射 |
|---|---|
| 页面壳（侧边导航 + 顶栏 + 面包屑） | `MS_EG71_SHELL.render(ctx,{content,footer})` + `bind(app)`，route `/data-services/data-forwarding` |
| 服务列表工具栏 / 对象列表工具栏（左操作 + 右搜索 + Reset） | `B_Eg71Toolbar → bc-eg71-toolbar.render({actions,filters})` + `bind`（事件 `eg71-toolbar-action/filter`） |
| 转发服务列表（Object Count 下钻链接 + icon 操作列） | `B_DataTable → bc-data-table.render({entity,rows,opsMode:'icon'})`（field type:'link' 即站点 data-forwarding Object Count 同构） |
| 对象列表页标题 / 服务卡标题 | `B_ComTitle → bc-com-title.render({title,tag,variant})` |
| 对象列表页返回头 | `B_Eg71PageBack → bc-eg71-page-back.render({title})` + `bind`（事件 `eg71-page-back`） |
| 服务详情抽屉（配置摘要 + 转发失败处理 + Error Notification 内容） | `B_Eg71ProtocolDetail → bc-eg71-protocol-detail.render({detail})` + `bind`（schema 驱动泛化复用） |
| 删除对象 / 删除服务二次确认 | `B_Eg71Modal.render({action:'delete',desc})` + `bind` + `wrap.open()` |
| 编辑对象表单项（BACnet/Modbus 联动表单） | `B_Eg71FormItemSelect → bc-eg71-form-item-select` + `B_Eg71FormItemInput → bc-eg71-form-item-input`（error 态红字） |
| 抽屉底栏 | 抽屉面板内用 L2 `ms-drawer-foot` + `ms-btn`（`bc-eg71-form-footer` 为页面级吸底固钉，不适配右侧全高抽屉） |
| 操作反馈 | `B_Eg71Message → bc-eg71-message`（`eg71-message-show` 事件驱动，error 不自动消失） |
| 服务/对象状态标签 | `ms-tag`（L2 原子经 L3 render 消费） |
| 空服务对象列表空态 | `ms-empty`（L2） |

## 页面层结构形态（无对应 B_*，按 REQ-011 报备范式：ms-* 原子编排 + 弹窗仍复用 B_*）

| 形态 | 说明 |
|---|---|
| 对象列表表格 | 行内工作 checkbox（批量导出/删除联动表尾）+ 每服务类型列差异（BACnet：对象类型/实例编号/单位；Modbus：寄存器类型/数据格式/寄存器数目/寄存器地址）+ 行内 icon 操作 + 表尾批量栏——超出 `bc-data-table` 静态快照契约（勾选固定 i<2、工具栏写死），走页面 `ms-table/ms-checkbox` 编排 |
| hover 信息卡（设备名称→设备名称/ID/型号；对象名称→名称/DIB/VIB） | 无 tooltip B_*；页面结构类 `bc-eg71-fw-tip` + L1 token，`tabindex=0` + `:focus-within` 键盘可达 |
| 添加对象抽屉（设备树 + 无对象设备置灰 + 对象勾选） | 无通用表单抽屉 B_*（`bc-detail-drawer` 绑定告警实体时间轴）；页面 `ms-drawer` 编排，内部表单/底栏一律 B_Eg71FormItem*/FormFooter |
| 编辑对象抽屉（Modbus 寄存器类型→数据格式→寄存器数量联动；BACnet 类型→编号建议） | 同上；联动状态机为页面逻辑 |
| 编号分配-释放-复用引擎 | PRD 规则（分组从 0 递增、移除释放、新增优先复用）为数据逻辑非视觉形态，页面状态机承载，表格实时呈现 |

## 关键交互规格（来自 PRD 5.8）

1. **添加对象**：抽屉设备树；无对象设备在名称右侧 info 图标提示「设备下没有对象，请先到【设备数采】菜单添加对象后，再操作」，展开钮与复选框置灰；已在本服务的对象锁定（checked+disabled）；保存即生效 toast。
2. **列差异**：HTTP/MQTT=对象名称/对象ID/关联对象(-)；BACnet=+对象类型/单位；Modbus=+寄存器类型/数据格式/寄存器数目。
3. **编辑对象**（仅 BACnet/Modbus）：Modbus 寄存器类型（Input/Holding）↔ 数据格式联动（Input 18 项定长 1/2/4；Holding=String 默认 64 可改）+ 寄存器地址可编辑；BACnet 对象名称/类型（Analog-Input/CharacterString-Value）/实例编号/描述/单位可编辑；保存即生效。
4. **删除**：单个/批量，二次确认「您确认要删除所选的对象吗？」；删除后实例编号/寄存器地址释放并优先复用。
5. **批量导出**：xlsx 增加 M-Bus 对象信息（demo toast 反馈）。
6. **hover**：设备名称→设备名称/设备ID/设备型号；对象名称（M-Bus 对象）→对象名称/DIB/VIB；非 M-Bus 对象无 DIB/VIB 行。
7. **失败处理**（服务详情抽屉）：HTTP 失败数据丢失；MQTT 缓存重传；BACnet/Modbus 等待 Client 重查。Error Notification 内容：一次地址冲突/二次地址冲突/采集失败/数据帧异常。
