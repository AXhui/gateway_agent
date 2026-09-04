# 01_biz_skills · 业务组件层（L1）

> 定位：**仅封装 `00_skills` 的基础组件，零新增样式**。
> 命名：`B_<业务域>_<组件>`。一个业务组件 = 显式声明的 `atoms` 依赖序列 + `render` 骨架，样式细节由 L0 令牌统一保证。

---

## 当前状态：登记映射，未固化

现有 18 个业务组件的实现仍留在工作台引擎的 `assets/js/registry-business.js`（以 `bc-*` 为 id）。本层先登记映射，逻辑名 `B_*` 与 `bc-*` 一一对应（见 [`_index.json`](../_index.json) `business` 段）。后续如需固化，将按 `B_<域>_<组件>/SKILL.md` 目录结构落盘。

| 逻辑名 | 现 id | 说明 |
|---|---|---|
| `B_MetricCard` | `bc-metric-card` | 指标卡组 |
| `B_StatusTag` | `bc-status-tag` | 状态标签 |
| `B_FilterBar` | `bc-filter-bar` | 筛选栏 |
| `B_DataTable` | `bc-data-table` | 数据表格 |
| `B_EntityCard` | `bc-entity-card` | 实体卡片 |
| `B_TelemetryPanel` | `bc-telemetry-panel` | 遥测面板 |
| `B_RuleForm` | `bc-rule-form` | 规则配置表单 |
| `B_DetailDrawer` | `bc-detail-drawer` | 详情抽屉 |
| `B_UpgradeModal` | `bc-upgrade-modal` | 批量任务弹窗 |
| `B_Topology` | `bc-topology` | 网络拓扑 |
| `B_MemberTable` | `bc-member-table` | 成员权限表 |
| `B_LogTimeline` | `bc-log-timeline` | 操作日志时间轴 |
| `B_EmptyState` | `bc-empty-state` | 空态引导 |
| `B_QuickActions` | `bc-quick-actions` | 快捷操作区 |
| `B_Eg71Sidenav` | `bc-eg71-sidenav` | 网关侧边导航 |
| `B_Eg71Topnav` | `bc-eg71-topnav` | 顶部导航 |
| `B_Eg71FormFooter` | `bc-eg71-form-footer` | 表单底部操作栏 |
| `B_Eg71Content` | `bc-eg71-content` | 内容容器 |

> 铁律：业务组件不得写样式常量，只能 ① 组合 `S_*` 基础组件（`ms-*` 类）② 引用 L1 令牌 ③ 用 `bc-*` 结构类（定义在 `library/business.css`）。

---

## 新增业务组件的流程

1. 在 `02_knowledge/K_mapping.md` 确认需求要素 → 是否已有可复用 `B_*`。
2. 若无，声明 `atoms`（依赖的 `S_*`）+ `render` 骨架，零新增样式。
3. 登记进 `_index.json` 的 `business` 段，并在本 README 补一行。
