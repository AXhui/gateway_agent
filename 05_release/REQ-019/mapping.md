# REQ-019 · 组件映射清单（page-assembly.md §0）

- **PRD**：【EG71】AI测试需求 — EG71 M-Bus（EN 13757）协议支持（源 URL 见 source.txt）
- **覆盖模块**：5.1 接入网络 · 5.2 扫描添加 · 5.3 手动添加 · 5.4 设备管理 · 5.5 对象管理 · 5.7 数据流 · 5.10 状态概览 · 5.11 设备库模板（5.6 数据采集为后台逻辑、5.8 数据转发已由 REQ-018 交付、5.9 Node-RED 为既有页面入口，不重复）
- **路由**：`/data-services/data-acquisition`（主，三页签 Overview / Device / Device Access Network + 扫描/手动向导 + 对象子页）· `/data-services/data-stream`（数据流）· `/data-services/data-library`（自定义设备库）
- **壳导航**：既有 navGroups 入口（Data Acquisition / Data Stream / Data Library），未增改菜单

## A. 注册 B_* 组件（按 SKILL.md §2 组装契约以 ctx 调用）

| # | 业务形态 | 组件 ID | ctx 要点 |
|---|---|---|---|
| 1 | 唯一壳 | `MS_EG71_SHELL`（bc-eg71-sidenav + bc-eg71-topnav 捆绑） | `route` 注入；页面层监听导航点击后按 `MS_EG71_SHELL.route` 重渲染 `.ms-content` |
| 2 | 页签（Overview / Device / Device Access Network） | `bc-eg71-page-tabs` | `ctx.tabs[].key/label`、`ctx.tab`、`ctx.flush:true`；事件 `eg71-page-tab` |
| 3 | 列表工具栏（操作版 + 搜索版） | `bc-eg71-toolbar` | `ctx.actions[]`（含 dropdown 添加菜单）、`ctx.filters[]`（search/select）、`ctx.reset`；事件 `eg71-toolbar-action` / `eg71-toolbar-filter` |
| 4 | 页面/卡片/分组标题 | `bc-com-title` | `variant:'main'/'sub'`、tag/tip/switch/buttons |
| 5 | 删除/禁用/信息/选择/数量弹窗 | `bc-eg71-modal` | `ctx.action` delete/disable/confirm/select、`desc`（PRD 原文文案）、`options`、`okText/cancelText` |
| 6 | 扫描进度弹窗（5.2 Step2 / 5.5 扫描对象 ≥2s / 设备添加中） | `bc-eg71-lib-progress-modal` | `title/hint/cancelText` 按场景定制（spinner+文案+单按钮小卡形态复用）；事件 `eg71-lib-progress-cancel` |
| 7 | 添加结果弹窗（部分一次地址分配失败 + 复制按钮） | `bc-eg71-lib-result-modal` | `stats.added` + `sections[]`（失败地址清单 + copy 钮）；事件 `eg71-lib-result-ok/copy` |
| 8 | 表单项（输入/下拉/单选） | `bc-eg71-form-item-input` / `-select` / `-radio-group` | `label/value/required/placeholder/status:'error'/msg/showCount`；错误文案用 PRD 原文 |
| 9 | Toast 反馈 | `bc-eg71-message` | `app` 尾部 render+bind；`eg71-message-show` {type,text} |
| 10 | Alert 横幅（Tab 级 / 卡片级，位置契约 ②③④） | `bc-eg71-alert-bar` | `tone info/error`、`desc`（PRD 告警原文）、`closable`；事件 `eg71-alert-close` |
| 11 | 子页返回头（对象列表 / 扫描向导 / 手动向导） | `bc-eg71-page-back` | `ctx.title`；事件 `eg71-page-back` |
| 12 | 状态概览 M-Bus 协议卡 | `bc-eg71-protocol-card` | `card.icon/title/tag/items`；事件 `eg71-protocol-navigate` |
| 13 | 状态概览 M-Bus 卡点击抽屉（波特率 + 已接入设备数） | `bc-eg71-protocol-detail` | `detail.sections[].fields[]`（波特率 / 已接入设备数 → 跳转设备筛选）；`wrap.open()`；底部 Confirm 钮页面层改写为 Configuration（跳 Network 页签，5.10） |

## B. 页面层结构形态（报备：库内无对应 B_*，开合骨架/结构镜像既有范式）

| 形态 | 落地方式 | 镜像范式 |
|---|---|---|
| 表单/结果抽屉（网络编辑、设备编辑、对象添加/编辑、复制对象、扫描对象结果、报文详情、模板对象查看） | `ms-drawer` 开合骨架（hidden + is-open + mask 点击关闭 + `[data-drawer-close]`），内容 = `bc-eg71-form-item-*` 契约调用 / `ms-table` / `ms-desc` | `bc-eg71-scan-edit-drawer` / `bc-eg71-protocol-detail` 开合范式 |
| M-Bus 设备表 / 对象表 / 报文表 / 分组对象表 / 自定义设备库模板表（设备型号/厂商/协议类型/对象数量/引用设备数，`bc-eg71-device-lib-table` 3 列契约不含厂商/协议列不匹配，弃用） | `ms-table` + `bc-num` + `bc-eg71-table-ops`（EG71 左对齐契约）；勾选列 `ms-checkbox` | REQ-011/018 表格范式 |
| 统计瓦片（接入设备总数/在线/离线/从未上线） | `ms-stat` + `ms-grid-4`（bc-req019-stats 结构类） | REQ-015 状态概览同范式 |
| 扫描向导步骤指示 / 8 位掩码编辑器（首 F + 7×[0-9F]） | `ms-steps` + `ms-input`（bc-req019-mask 结构类） | ms-steps 原子编排 |
| 十六进制报文块 | `--font-mono` + `bc-req019-hex` 结构类 | mono 代码场景 |

> 页面层不新增任何颜色/字号/间距常量；结构类只做布局/显隐，数值全部引用 `--*` 令牌（encapsulation.md §3）。

## C. 关键交互链落点（动词闭环清单）

| 动词 | 入口 | 闭环 |
|---|---|---|
| 编辑（网络） | Network 页签 编辑 | 抽屉表单（波特率→默认联动）→ 校验（0-1000/100-60000/0-10 原文报错）→ 保存 toast → 仅波特率变化时 SND_NKE 提示 |
| 扫描添加（设备） | Device 工具栏 + 添加→扫描添加 | 三步向导：模式/掩码/自动分配/高级 → 进度弹窗（停止→任务确认弹窗）→ 无结果/均已添加弹窗 → 确认页（分组/冲突折叠/下载报告/名称编辑/一次地址标签/对象 8 列/100 上限 toast/VIB⚠/记录位置）→ 数量弹窗（情况一~五）→ 添加中 → 结果（部分失败+复制） |
| 手动添加（设备） | Device 工具栏 + 添加→手动添加 | 两步向导：双列表单（名称/型号/寻址/一次 1-250 重复校验原文/二次 16hex/描述/采集间隔 60-86400+tooltip）→ 立即创建（从未上线→异步验证→在线）→ 型号 None 对象三入口 / 型号模板对象选择（4 按钮） |
| 编辑（设备） | 设备表 操作·编辑 | 抽屉（一次地址可编辑+重复校验、二次只读、型号切换二次确认原文、采集间隔）→ 保存 → 地址变更状态即时更新 |
| 删除（设备） | 行删除 / 批量删除 | 危险确认弹窗（PRD 原文）→ 级联删对象 → 列表刷新 |
| 扫描添加（对象） | 对象页 Scan to add | 在线才可用（否则置灰+hover 原文）→ 进度弹窗 ≥2s → 停止→toast 原文 → 成功 toast 原文 + 结果抽屉（默认全选/前100/VIB⚠ 不可勾/已添加锁定 hover/记录位置/顶部提示行）→ 确认添加 |
| 添加（对象） | 对象页 Add | 型号≠None 菜单（自定义对象/设备库）；抽屉表单（hex 校验原文/float32 校验原文/单位 63/记录位置 1-255）→ 重复拦截弹窗（对象重复/编码重复原文）→ 数量上限弹窗（20000/100 原文） |
| 编辑（对象） | 对象表 操作·编辑 | 同添加表单（预填）→ 保存 |
| 启用/禁用（对象） | 行 switch / 批量 | 切换保留最后值（禁用不更新数值/时间/次数） |
| 复制对象 | 对象页 Copy Object | 前置（无对象置灰/无同型号 toast 原文）→ 类型单选（默认新增）→ 目标设备抽屉（搜索/全选）→ 覆盖二次确认原文 / 新增冲突弹窗原文 → 结果 toast |
| 获取值 | 对象表 操作·获取值 | loading → 成功更新数值/时间/次数；失败 toast「获取值失败」 |
| 删除（对象） | 行/批量 | 确认弹窗 → 移除 |
| 查看（报文） | 数据流 查看 | 抽屉（设备信息 + hex 帧 + Copy） |
| 删除（模板） | 设备库 删除 | 引用中 → 阻断（原文）；未引用 → 确认弹窗 |
| 查看模板 / 对象数下钻 | 设备库 eye / 计数链接 | 模板对象抽屉（BACnet/Modbus 转发 checkbox + 寄存器数量 1-121） |
