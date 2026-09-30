# REQ-013 · EG71 M-Bus 数据转发 — 组件映射清单（A2 产物 · page-assembly.md §0 铁律工件）

> PRD 源：【EG71】AI测试（= REQ-011 同源 PRD 的 2026-8-25 版）。REQ-011 已交付 8 模块；
> 本 REQ 范围 = **5.8 数据转发**（唯一 REQ-011 未落地的 UI 模块）。
> 5.9 Node-RED（节点级变更，无 EG71 页面）、5.6 引擎逻辑（UI 触点已属 REQ-011 页面）不入本 demo。

## 一、形态 → 组件映射（逐行）

| # | 业务形态 | 组件 / 原子 | ctx 参数 |
|---|---|---|---|
| 1 | 页面壳（侧边栏+顶栏+面包屑） | `MS_EG71_SHELL`（壳资产冻结，navGroups 零改动） | `route:'/data-services/data-forwarding'`, `entity` 网关信息, `rows` 站点数据 |
| 2 | 页头（面包屑/标题/描述） | 结构类 `req013-head` + `ms-h2`（S_Typography H2 24px/600） | title='Data Forwarding' |
| 3 | 服务切换页签 | `ms-tabs` / `ms-tab` / `ms-tab--active`（基础原子） | 4 服务：MQTT / HTTP / BACnet Server / Modbus Server |
| 4 | 对象表格卡（列表类页面单卡） | `.bc-eg71-table` 结构类（白底 20px）+ `ms-table-wrap`/`ms-table`（bc-data-table 同源原子） | 按服务类型切换列集 |
| 5 | 表格数字列（对象ID/实例编号/寄存器*） | `bc-num`（mono+tabular，左对齐）—— EG71 左对齐契约，禁 `ms-table-num` | — |
| 6 | 表格操作列 | `bc-eg71-table-ops`（禁 `ms-table-ops`）；BACnet/Modbus=编辑+删除，HTTP/MQTT=仅删除 | `opsMode:'icon'` |
| 7 | 表格顶部工具栏 | `ms-table-toolbar`（左：`ms-table-title`「转发对象」+ `bc-count` 计数；右：`ms-btn` 组 = 添加对象 filled sm → 批量导出 default sm → 批量删除 danger sm（选中 0 时 disabled），`ms-space ms-space--12`）；底部 `bc-table-foot` 仅放计数（T9：EG71 批量操作一律顶部工具栏，参照 bc-eg71-device-list） | — |
| 8 | 删除确认弹窗 | **`B_Eg71Modal`（bc-eg71-modal）** via `B['bc-eg71-modal'].render/bind` | `action:'delete'`, desc='您确认要删除所选的对象吗？' |
| 9 | 添加对象抽屉 | 结构类 `req013-drawer`（REQ-011 drawer 范式）+ `ms-tree`/`ms-tree-node` 设备树 + `ms-checkbox` 对象复选 | 无对象设备→⚠ 图标+tooltip+置灰 |
| 10 | 编辑对象抽屉（仅 BACnet/Modbus） | `bc-eg71-form-item-input` + `bc-eg71-form-item-select`（L3 表单项，按 SKILL 契约 ctx 调用） | label/value/placeholder/options/msg/status/showCount |
| 11 | 全局对象子区（仅 HTTP/MQTT） | `bc-eg71-subarea` + `ms-checkbox`（Gateway SN / Status-alarmState） | 切换→toast 反馈 |
| 12 | hover 信息气泡（设备名/对象名） | 结构类 `req013-bubble`（纯 CSS :hover/:focus-within，仅引用既有 token） | 设备→名称/ID/型号；对象→名称/DIB/VIB |
| 13 | 操作反馈 toast | `ms-alert`（REQ-011 toast 范式） | 添加/导出/全局对象切换 |
| 14 | 空态 | `ms-empty`（居中例外） | 服务下无对象时 |
| 15 | 图标 | `S_Icon`（`MS_ICONS`/Lucide），尺寸阶梯 16 起，热区 ≥24 | — |

## 二、列集（按服务，PRD 5.8 表格列一一对应）

| 服务 | 列 | 可编辑 |
|---|---|---|
| HTTP / MQTT | 复选 / 设备名称(hover) / 对象名称(hover) / 对象ID / 关联对象(-) | 否 |
| BACnet Server | 上列（去关联对象）+ 对象类型 / 单位 / 实例编号 | **是** |
| Modbus Server | 上列（去关联对象）+ 寄存器类型 / 数据格式 / 寄存器数量 / 寄存器地址 / 关联寄存器(-) | **是** |

数值→Analog-Input/Input Register（bc-num 列），字符串→CharacterString-Value/Holding Register；
编号自动分配、删除后释放复用（demo 以种子数据静态演绎）。

## 三、种子数据（M-Bus 三设备）

| 设备 | 型号 | 设备ID | 对象 |
|---|---|---|---|
| Heat-Meter-01 | SHARKY 775 | 101 | Energy(kWh,04/06)·Volume(m³,04/13)·Power(kW,04/2E)·Flow temperature(°C,04/5A) |
| Water-Meter-02 | SENSEO 550 | 102 | Volume(m³,04/13)·Flow rate(m³/h,04/3B) |
| Energy-Meter-03 | —（未建模） | 103 | 0 个对象 → 添加抽屉中置灰+⚠ 提示「设备下没有对象，请先到【设备数采】菜单添加对象后，再操作」 |

## 四、缺口预判（interaction-completeness.md，A5 复核）

| 功能点 | 类别 | 缺什么 | demo 处理 |
|---|---|---|---|
| 添加对象 | B 链路断 | PRD 未写保存后反馈 | 补 toast「已添加 X 个对象，转发立即生效」，标注【PRD 缺省 · demo 补全】（仅记 validation.md，不进 UI） |
| 批量导出 | C 待澄清 | PRD 只写「导出 xlsx」，未写文件结构 | 按字面实现，toast 演绎；导出内容细节留 issue |
| 全局对象切换失败态 | D 隐含缺失 | PRD 未定义失败业务去向 | 小缺口：仅演示成功态；失败回滚留 issue |
| Modbus String 数量上限 121 | A | PRD 已写明 1–121 可改 | 编辑抽屉表单 showCount演绎 |

## 五、消费确认

- 清单涉及组件 SKILL.md §2 组装契约已读：bc-eg71-modal、bc-data-table、bc-eg71-form-item-input/select、bc-eg71-subarea（registry 源内联）。
- 壳契约（AGENTS.md）：`MS_EG71_SHELL.render(ctx,{content,footer})` + `bind($app)`，navGroups 已含 Data Forwarding 入口（`/data-services` children），**零改动**。
- §7 偏差在 A4 内联时就地修正：ico(*,14)→16（37 处）、ms-space--8 按钮组→--12（7 处）、.ms-stat-title 13→12、bc-eg71-protocol-card padding 12→16；不回写 assets 源头。
