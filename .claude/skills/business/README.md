# 01_biz_skills · 业务组件层（L1）

> 定位：**仅封装 `.claude/skills/base` 的基础组件，零新增样式**。
> 命名：`B_<业务域>_<组件>`。一个业务组件 = 显式声明的 `atoms` 依赖序列 + `render` 骨架，样式细节由 L0 令牌统一保证。

---

## 当前状态：已固化

现有 19 个业务组件的运行时实现仍留在工作台引擎的 `assets/js/registry-business.js`（以 `bc-*` 为 id），本层按**产品线归组**落盘：通用业务组件在 [`_shared/`](_shared/)、EG71 网关线在 [`eg71/`](eg71/)，各自再按 `B_<域>_<组件>/SKILL.md` 组织；逻辑名 `B_*` 与 `bc-*` 一一对应（见 [`_index.json`](../../_index.json) `business` 段，`status: "已固化"`）。

### 通用业务组件（`_shared/`）

| 逻辑名 | 现 id | SKILL 文档 | 说明 |
|---|---|---|---|
| `B_MetricCard` | `bc-metric-card` | [_shared/B_MetricCard/SKILL.md](_shared/B_MetricCard/SKILL.md) | 指标卡组 |
| `B_StatusTag` | `bc-status-tag` | [_shared/B_StatusTag/SKILL.md](_shared/B_StatusTag/SKILL.md) | 状态标签 |
| `B_FilterBar` | `bc-filter-bar` | [_shared/B_FilterBar/SKILL.md](_shared/B_FilterBar/SKILL.md) | 筛选栏 |
| `B_DataTable` | `bc-data-table` | [_shared/B_DataTable/SKILL.md](_shared/B_DataTable/SKILL.md) | 数据表格 |
| `B_EntityCard` | `bc-entity-card` | [_shared/B_EntityCard/SKILL.md](_shared/B_EntityCard/SKILL.md) | 实体卡片 |
| `B_TelemetryPanel` | `bc-telemetry-panel` | [_shared/B_TelemetryPanel/SKILL.md](_shared/B_TelemetryPanel/SKILL.md) | 遥测面板 |
| `B_RuleForm` | `bc-rule-form` | [_shared/B_RuleForm/SKILL.md](_shared/B_RuleForm/SKILL.md) | 规则配置表单 |
| `B_DetailDrawer` | `bc-detail-drawer` | [_shared/B_DetailDrawer/SKILL.md](_shared/B_DetailDrawer/SKILL.md) | 详情抽屉 |
| `B_UpgradeModal` | `bc-upgrade-modal` | [_shared/B_UpgradeModal/SKILL.md](_shared/B_UpgradeModal/SKILL.md) | 批量任务弹窗 |
| `B_Topology` | `bc-topology` | [_shared/B_Topology/SKILL.md](_shared/B_Topology/SKILL.md) | 网络拓扑 |
| `B_MemberTable` | `bc-member-table` | [_shared/B_MemberTable/SKILL.md](_shared/B_MemberTable/SKILL.md) | 成员权限表 |
| `B_LogTimeline` | `bc-log-timeline` | [_shared/B_LogTimeline/SKILL.md](_shared/B_LogTimeline/SKILL.md) | 操作日志时间轴 |
| `B_EmptyState` | `bc-empty-state` | [_shared/B_EmptyState/SKILL.md](_shared/B_EmptyState/SKILL.md) | 空态引导 |
| `B_QuickActions` | `bc-quick-actions` | [_shared/B_QuickActions/SKILL.md](_shared/B_QuickActions/SKILL.md) | 快捷操作区 |

### EG71 网关线业务组件（`eg71/`）

| 逻辑名 | 现 id | SKILL 文档 | 说明 |
|---|---|---|---|
| `B_Eg71Sidenav` | `bc-eg71-sidenav` | [eg71/B_Eg71Sidenav/SKILL.md](eg71/B_Eg71Sidenav/SKILL.md) | 网关侧边导航 |
| `B_Eg71Topnav` | `bc-eg71-topnav` | [eg71/B_Eg71Topnav/SKILL.md](eg71/B_Eg71Topnav/SKILL.md) | 顶部导航 |
| `B_Eg71FormFooter` | `bc-eg71-form-footer` | [eg71/B_Eg71FormFooter/SKILL.md](eg71/B_Eg71FormFooter/SKILL.md) | 表单底部操作栏 |
| `B_Eg71Content` | `bc-eg71-content` | [eg71/B_Eg71Content/SKILL.md](eg71/B_Eg71Content/SKILL.md) | 内容容器 |
| `B_Eg71Alarm` | `bc-eg71-alarm` | [eg71/B_Eg71Alarm/SKILL.md](eg71/B_Eg71Alarm/SKILL.md) | 告警事件列表（本次补登） |

> 铁律：业务组件不得写样式常量，只能 ① 组合 `S_*` 基础组件（`ms-*` 类）② 引用 L1 令牌 ③ 用 `bc-*` 结构类（定义在 `library/business.css`）。

---

## 新增业务组件的流程

1. 在 `.claude/knowledge/K_mapping.md` 确认需求要素 → 是否已有可复用 `B_*`。
2. 若无，声明 `atoms`（依赖的 `S_*`）+ `render` 骨架，零新增样式。
3. 登记进 `_index.json` 的 `business` 段，并在本 README 补一行。
