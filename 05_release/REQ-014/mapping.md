# REQ-014 · EG71 M-Bus 告警中心组件映射清单

- 页面壳（侧边栏、顶栏、面包屑） → `MS_EG71_SHELL` + `route:'/system-setting/events'`
- 告警统计卡 → `B_Eg71Alarm` / `ms-card` + `ms-stat-*`
- 实时告警与告警规则页签 → `ms-tabs` + `ms-tab` + `ms-tab--active`
- 告警筛选栏 → `ms-input` + `ms-select` + `ms-btn`
- 告警事件列表 → `B_Eg71Alarm` / `ms-table` + `ms-checkbox` + `ms-tag`
- 规则列表 → `ms-table` + `ms-tag` + `bc-eg71-table-ops`
- 告警状态关闭反馈 → `ms-tag--green` + 行内操作按钮
- 页面提示 → `ms-alert`

本页基于 `prd.md` 中 M-Bus 告警事件和规则管理场景制作，未修改 `navGroups` 或壳资产。
