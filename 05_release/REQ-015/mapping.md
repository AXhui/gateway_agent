# REQ-015 组件映射清单

- 页面壳 → `MS_EG71_SHELL` + `route:'/dashboard'`
- 协议状态卡 → `bc-eg71-protocol-card` + `card` ctx
- 设备采集表 → `ms-table` + `bc-num` + `bc-eg71-table-ops`
- 扫描反馈 → `ms-alert` + 注册按钮交互
- 数据流摘要 → `ms-card` + `ms-stat-*`
- 设备数据提示 → `bc-eg71-protocol-detail` 语义由状态提示承载
