# K_pattern · 详情页范式

> 详情/明细查看型需求的装配参考。适合「详情 / 明细 / 查看 / 概览单个实体」类需求。

## 结构

```
T_Detail
├── M_Metrics           关键指标区
├── M_DetailDrawer      详情抽屉 / 侧边详情
└── M_Log / M_Telemetry 按需：操作日志 / 遥测数据
```

## 关键模块与组件

| 层 | 模块 | 内部业务组件 |
|---|---|---|
| L4 | `M_Metrics` | `B_MetricCard` |
| L4 | `M_DetailDrawer` | `B_DetailDrawer` + `B_Descriptions`/`S_Descriptions` |
| L4 | `M_Log` | `B_LogTimeline` |
| L4 | `M_Telemetry` | `B_TelemetryPanel` |

## 装配要点

- 详情查看用 `B_DetailDrawer` 不打断主流程；描述字段用 `S_Descriptions`（L0 数据展示类）。
- 带「日志 / 操作记录」动作时追加 `M_Log`，带「实时数据 / 图表」时追加 `M_Telemetry`。
- 状态呈现用 `B_StatusTag`，操作时间轴用 `B_LogTimeline`。

## 相关

- 映射见 [`K_mapping.md`](../K_mapping.md)。
