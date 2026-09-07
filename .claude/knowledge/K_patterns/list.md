# K_pattern · 列表页范式

> 模板 `T_List`（`tpl-list`）的标准装配。适合「管理 / 维护 / 查询 / 台账 / 清单」类需求。

## 结构

```
T_List
├── M_QuickActions      快捷操作区（新增 / 批量导出 / 刷新）
└── M_FilterList        筛选栏 + 数据表格 + 分页
```

## 关键模块与组件

| 层 | 模块 | 内部业务组件 |
|---|---|---|
| L4 | `M_QuickActions` | `B_QuickActions` |
| L4 | `M_FilterList` | `B_FilterBar` + `B_DataTable` |

## 装配要点

- 列表页以表格为核心，`M_FilterList` 是必选；`M_QuickActions` 视是否有新增/导出动作增减。
- 加了「弹窗」动作会多出任务弹窗区块，加了「图表」会多出遥测区块（planner 按动作/形态做模块增删，非整体套模板）。
- 实体字段由 `ctx` 注入（`device` / `gateway` / `sensor` 等，见 `registry-entities.js`），同一模块换实体即可复用。

## 相关

- 模板 `T_Detail`（详情）、`T_Dashboard`（分析）在相邻范式文件。
- 映射见 [`K_mapping.md`](../K_mapping.md)。
