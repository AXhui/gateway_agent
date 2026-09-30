# K_pattern · 列表页范式

> 模板 `T_List`（`tpl-list`）的标准装配。适合「管理 / 维护 / 查询 / 台账 / 清单」类需求。
> §表格排列规则为**权威源**（2026-09 从 EG71 真实产品站 36 页 / 9 张真实表归纳，证据：`output/eg71-site-distill/`，对照结论见其 `diff-matrix.md`），A4 渲染与 A8 Figma 侧同值执行。

## 结构

```
T_List
├── M_QuickActions      快捷操作区（新增 / 批量导出 / 刷新）
└── M_FilterList        筛选栏 + 数据表格 + 分页
```

EG71 线（ms-table-pro 体系，31/37 页形态）的列表页装配序列：

```
bc-eg71-topnav(面包屑在顶栏) → [bc-eg71-page-tabs 页签条(可选)] → bc-eg71-toolbar(操作+筛选)
→ bc-data-table(opsMode:'icon') → 表尾(批量钮态 + Total 左置分页)
```

## 关键模块与组件

| 层 | 模块 | 内部业务组件 |
|---|---|---|
| L4 | `M_QuickActions` | `B_QuickActions`；EG71 线改用 `B_Eg71Toolbar`（无壳操作+筛选单行） |
| L4 | `M_FilterList` | `B_FilterBar`（卡片壳查询区）/ `B_Eg71Toolbar`（EG71 无壳工具栏）+ `B_DataTable` |

## 表格排列规则（EG71 站点 9 表归纳 · 权威）

### T1 列序通则

`复选列(可选) → 标识/名称 → 分类属性 → 状态 → 计数 → 时间 → 信号 → 操作列（右锚末列）`

- 数据属性按「标识 → 分类 → 状态 → 计数 → 时间 → 信号」从左到右排列；操作列永远末列右锚。
- 证据：equipment-data `[✓] Device Name→Model→Protocol Type→Status→Object Count→Last Seen→Signal→Operation`；data-flow `Device ID/Group→Name→Access Network→Type→Data Type→Time→Fcnt→Operation`；parsing-library `Model→Protocol→Number of Objects→Reference Count→Operation`。
- **例外——状态前置**：当状态是行的主语义（启停型列表）时 Status 提到首列。证据：data-forwarding `Status→Name→Type→Device Count→Object Count→Operation`；network_backup `Priority→Enable Rule(行内开关)→Current Link→…`。
- 同一实体多入口（equipment-data 与 batch-import-result）列序必须完全一致。

### T2 列宽阶梯（区间，不写死 px）

| 列型 | 区间 | 证据 |
|---|---|---|
| 状态/短枚举/信号 | 90–150px | Status 110、Size 90、Signal 100、Operation(icon) 100 |
| 标识/名称 | 110–160px（长内容至 450px） | Device Name 110–160、Image Name 450 |
| 计数/引用数 | 140–244px | Object Count 140、Device Reference Count 244 |
| 操作列（icon 双钮） | 100px | equipment-data / forwarding / parsing-library |
| 操作列（文本多钮） | 240–320px | app_docker 320 |

实现约束：业务层不写死 colgroup px（diff-matrix D4），由结构类 `ms-table-ops` / `bc-col-check` 与内容自适应承载；上表区间用于规划器估宽与 A8 设计稿对齐。

### T3 对齐规则

- **全列默认左对齐**（站点 9 表 DOM 无一列覆盖 `text-align`）；纯数值/计数列用表格数字字体（`bc-num` mono tabular-nums）但**不右对齐**；操作列内容右锚（`ms-table-pro-oprt.align-right` → 库 `ms-table-ops`）。

### T4 操作列形态

- **≤3 个动作**：icon-only 反馈色按钮（edit/trash/…），`aria-label`/title 补语义，钮间 16px；危险动作（delete）红色。证据：equipment-data、data-forwarding 操作格 `#icon-edit`+`#icon-delete`，`margin-right:16px`，sticky right。
- 库实现：`bc-data-table` `ctx.opsMode:'icon'`（v1.2.0）。
- **文本按钮列**（低频，4+ 动作或语义重）：如 app_docker 320px 文本按钮列；溢出动作收 `moreHoriz` dropdown。
- 固定右锚（横向滚动时操作列 sticky right），复选列固定左锚。

### T5 状态列

- antd tag 色票，非圆点。库映射（`U.statusTag` token）：

| 站点语义 | 站点色 | 库 tone |
|---|---|---|
| Online / Enable | green | `success` |
| Offline | **orange** | `warm` |
| Disable / 未激活 | default 灰 | `muted` |
| Join failed / 错误 | red | `error` |

### T6 计数列（下钻）

- 计数可作链接下钻对象列表：data-forwarding Object Count 单元格 `<a>31</a>`。库实现：`bc-data-table` 字段 `type:'link'`（v1.2.0）。

### T7 空态与加载态

- **空态保留表头**，表体单行 colspan 占位 `ms-empty`（插画 + 文案 + 可选 extra 动作），上下 padding ≥24px。证据：`ms-table-pro .ant-table-placeholder .ms-empty{padding:24px 0}`。
- 加载态：表体 spin 遮罩（`ms-table-pro-virtual-loading` 半透明遮罩）；列表页首屏 loading 用骨架/居中 spin。

### T8 分页形态

- **Total 左置**（`Total：8`，flex:1）+ 页码/每页条数右置，分页条与表体以**上边框分隔**，条内 padding 12/20。
- 仅大表启用分页（站点 4/9 表：equipment-data、batch-import-result、parsing-library、system_events）；小表（forwarding 4 行、interfaces、backup）**无分页**——行数阈值参考 ≤50 行不分页。
- 库实现：`bc-table-foot` / `ms-pagination`（含页码跳转）。

### T9 批量选择条

- **EG71 线一律顶部工具栏形态**：批量操作（批量导出 / 批量删除等）放**表格顶部** `ms-table-toolbar`（或 `B_Eg71Toolbar`）——filled 新增在前、danger 批量删除在后，勾选驱动危险钮 disabled→enabled 启停；不另渲染独立批量条。参照 `bc-eg71-device-list`（真实站点 31/37 页同构）。
- 底部 `bc-table-foot` 只放**计数与分页**（Total / 已选 N 项 / 页码），**不放操作按钮**。
- 「已选 N 项 + 批量动作」放表尾的形态仅存在于 `bc-data-table` 通用模板（非 EG71 线 / 高密度后台可选）；EG71 demo 选用表尾批量形态即违规（REQ-013 首版实证返工）。

### T10 行内控件列

- 列可承载交互控件：行内 Switch（network_backup Enable Rule 列）、行内 Select；行内编辑（scan-device-table）。控件列态变化走回调，不整行重载。

### T11 信号列（EG71 特有）

- 4-bar 信号条 + hover 气泡（SF/SNR/RSSI），离线/无信号显示 `—`。库实现：`bc-eg71-device-list` / `bc-eg71-scan-device-table` 的 `bc-eg71(-scan)-signal*` 类。

## 装配要点

- 列表页以表格为核心，`M_FilterList` 是必选；`M_QuickActions` 视是否有新增/导出动作增减。
- 加了「弹窗」动作会多出任务弹窗区块，加了「图表」会多出遥测区块（planner 按动作/形态做模块增删，非整体套模板）。
- 实体字段由 `ctx` 注入（`device` / `gateway` / `sensor` 等，见 `registry-entities.js`），同一模块换实体即可复用。
- 子页（新增/编辑/向导）用 `B_Eg71PageBack` 返回头 + 表单/向导组件，不占列表页结构。

## 相关

- 模板 `T_Detail`（详情）、`T_Dashboard`（分析）在相邻范式文件；上传形态见 [`upload.md`](upload.md)。
- 映射见 [`K_mapping.md`](../K_mapping.md)。
