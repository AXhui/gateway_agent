# K_mapping · 需求要素 → 组件映射表

> 用途：把 PRD 里的「需求要素」翻译成可装配的组件资产（`B_*` / `M_*` / `T_*`）。
> 初版由 `assets/js/registry-business.js` 播种（`M_*` / `T_*` 装配词汇随知识本身维护，registry 已随工作台移除），随 PRD 出现持续回写。

---

## 一、页面形态 → 模板（`T_*`）

| 需求关键词 | 模板 | 现 id |
|---|---|---|
| 概览 / 总览 / 看板 / 首页 / 驾驶舱 / 大盘 | `T_Overview` | `tpl-overview` |
| 列表 / 管理 / 维护 / 查询 / 台账 | `T_List` | `tpl-list` |
| 详情 / 明细 / 查看 | `T_Detail` | `tpl-detail` |
| 告警 / 预警 / 事件 | `T_Alarm` | `tpl-alarm` |
| 固件 / 升级 / OTA | `T_Upgrade` | `tpl-upgrade` |
| 数据分析 / 报表 / 统计 | `T_Dashboard` | `tpl-dashboard` |
| 拓扑 / 组网 / 连接关系 | `T_Topology` | `tpl-topology` |
| 权限 / 成员 / 角色 / 组织 | `T_Permission` | `tpl-permission` |
| 配置 / 参数 / 设置 | `T_Config` | `tpl-config` |
| 审计 / 日志 / 操作记录 | `T_Audit` | `tpl-audit` |
| 空态 / 引导 / 欢迎 | `T_Onboard` | `tpl-onboard` |

## 二、区块形态 → 模块（`M_*`）

| 需求要素 | 模块 | 现 id |
|---|---|---|
| 快捷操作 / 常用入口 | `M_QuickActions` | `mod-quick-actions` |
| 指标 / KPI / 统计数值 | `M_Metrics` | `mod-metrics` |
| 筛选 + 列表 + 批量 | `M_FilterList` | `mod-filter-list` |
| 卡片墙 / 实体网格 | `M_EntityCards` | `mod-entity-cards` |
| 遥测 / 实时数据 / 图表 | `M_Telemetry` | `mod-telemetry` |
| 规则 / 阈值 / 条件配置 | `M_RuleConfig` | `mod-rule-config` |
| 详情抽屉 / 侧边详情 | `M_DetailDrawer` | `mod-detail-drawer` |
| 批量任务 / 升级任务 | `M_UpgradeTask` | `mod-upgrade-task` |
| 拓扑 / 网络结构 | `M_Topology` | `mod-topology` |
| 成员 / 权限 | `M_Member` | `mod-member` |
| 日志 / 审计 | `M_Log` | `mod-log` |
| 空态 / 引导 | `M_Empty` | `mod-empty` |
| 全局扫描提示条 / 跨页进行中提示（REQ-012） | `M_GlobalNotice` | `mod-global-notice` |
| 页内引导/异常横幅（REQ-012） | `M_GuideBanner` | `mod-guide-banner` |
| 扫描 Key 配置 / AppKey 批量管理（REQ-012） | `M_ScanKeyConfig` | `mod-scan-key-config` |
| 扫描双 Tab 设备表 / 发现+已忽略（REQ-012） | `M_ScanDeviceTable` | `mod-scan-device-table` |
| 扫描编辑抽屉 / 单台/批量编辑（REQ-012） | `M_ScanEditDrawer` | `mod-scan-edit-drawer` |
| 激活设置灰卡 / OTAA·ABP（REQ-012） | `M_ActivationCard` | `mod-activation-card` |
| 设备添加/编辑表单 / LoRaWAN（REQ-012） | `M_DeviceForm` | `mod-device-form` |

## 三、字段/实体 → 业务组件（`B_*`）

| 需求要素 | 业务组件 | 现 id |
|---|---|---|
| 指标卡 / 数值概览 | `B_MetricCard` | `bc-metric-card` |
| 状态 / 标签 | `B_StatusTag` | `bc-status-tag` |
| 筛选条件栏 | `B_FilterBar` | `bc-filter-bar` |
| 数据表格 | `B_DataTable` | `bc-data-table` |
| 实体卡片 | `B_EntityCard` | `bc-entity-card` |
| 遥测面板 | `B_TelemetryPanel` | `bc-telemetry-panel` |
| 规则配置表单 | `B_RuleForm` | `bc-rule-form` |
| 详情抽屉 | `B_DetailDrawer` | `bc-detail-drawer` |
| 批量任务弹窗 | `B_UpgradeModal` | `bc-upgrade-modal` |
| 网络拓扑 | `B_Topology` | `bc-topology` |
| 成员权限表 | `B_MemberTable` | `bc-member-table` |
| 操作日志时间轴 | `B_LogTimeline` | `bc-log-timeline` |
| 空态引导 | `B_EmptyState` | `bc-empty-state` |
| 快捷操作区 | `B_QuickActions` | `bc-quick-actions` |
| 全局扫描提示条（LoRaWAN 扫描进行中，REQ-012） | `B_Eg71ScanBanner` | `bc-eg71-scan-banner` |
| 页内业务横幅 / 引导·异常提示（REQ-012） | `B_Eg71AlertBar` | `bc-eg71-alert-bar` |
| 激活设置灰卡 / OTAA·ABP + AppKey（REQ-012） | `B_Eg71ActivationCard` | `bc-eg71-activation-card` |
| 扫描 Key 配置卡 / AppKey 批量增删·导入（REQ-012） | `B_Eg71ScanAppkeyCard` | `bc-eg71-scan-appkey-card` |
| 扫描编辑抽屉 / 单台·批量字段编辑（REQ-012） | `B_Eg71ScanEditDrawer` | `bc-eg71-scan-edit-drawer` |
| 扫描双 Tab 设备表 / 发现+已忽略（REQ-012） | `B_Eg71ScanDeviceTable` | `bc-eg71-scan-device-table` |
| LoRaWAN 设备添加/编辑表单（REQ-012） | `B_Eg71DeviceForm` | `bc-eg71-device-form` |
| 设备列表（数据服务，存量补登，v1.1.0 含 Join failed） | `B_Eg71DeviceList` | `bc-eg71-device-list` |

> 实体词典与确定性造数工厂在 `assets/js/registry-entities.js`（`device` / `gateway` / `sensor` 等），字段迁移时以最相似实体为源。
