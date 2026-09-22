# REQ-012 页面装配计划（A1 · ued-a1-page-planner）

> 输入：`05_release/REQ-012/03-ued.md`（A0 UED 视角，12 页面/容器）+ `05_release/REQ-012/04-dev.md`（业务规则参考）。
> 规则基线（规划前已逐份引用）：
> 1. `.claude/rules/page-assembly.md` —— §0 无映射清单不生成；§1 两级装配铁律（demo 拼 L3、L3 封 L2，页面层只做 L3 编排 + ctx 注入）；§5 交付物纯净性。
> 2. `.claude/rules/spacing.md` —— 模块间 ≥24px（`--spacing-2xl`）、卡片间 ≥16px（`--spacing-l`）、按钮间 ≥12px（`--spacing-m`）、工具栏与表格 12px（`--spacing-m`）、图标阶梯 16-44。
> 3. `.claude/rules/business-specific.md` —— 业务组件带产品线前缀（本需求全部为 `eg71`，目录 `business/eg71/`），atoms 组装契约齐全。
> 4. `AGENTS.md`「EG71 唯一壳契约」—— `window.MS_EG71_SHELL` + `navGroups` 唯一源；壳资产冻结；列表/流程类页面单卡片四周 20px；EG71 表格左对齐契约（`bc-num` / `bc-eg71-table-ops`）。
>
> 本计划只描述**产品 UI 模块**装配序列，供 A2 组件匹配消费（A2 产出组件映射清单 `04_pages/REQ-012/mapping.md` 后才允许 A4 生成 demo）。PRD 对齐点、评审说明、待确认文案一律不进本计划正文与可见 UI（归 `validation.md`；影响装配形态的少量决策项见 §7，作为 A2 输入而非 UI 内容）。

---

## 1. 页面总览与壳匹配

共 **5 个页面 + 1 个全局元素**（对 03-ued §1 的 12 容器按可装配性重组：5 个弹窗/抽屉容器归入所属页面的模块序列，不单列页面）。

壳匹配动作（AGENTS.md 唯一壳契约）：全部页面命中既有入口 `navGroups → Data Services → Data Acquisition`（route 前缀 `/data-services/data-acquisition`），**无需修改 navGroups 唯一源**。扫描配置页/扫描确认页为该入口下的二级页，从设备列表按钮进入，不加菜单项。

| # | 页面 | route | 类型 | 内容区卡片形态 | 模板（T_*） |
|---|---|---|---|---|---|
| P1 | 设备数采页（改动） | `/data-services/data-acquisition` | 列表页 | 单卡片四周 20px | `T_List` |
| P2 | LoRaWAN 扫描配置页（新增） | `/data-services/data-acquisition/lorawan-scan` | 表单配置页 | 单卡片四周 20px | `T_Config` |
| P3 | 扫描确认页（新增） | `/data-services/data-acquisition/lorawan-scan/confirm` | 双 Tab 列表页 | 单卡片四周 20px | `T_List`（页签变体） |
| P4 | LoRaWAN 设备添加页（改动） | `/data-services/data-acquisition/device/add?protocol=lorawan` | 表单页 | 多区块卡片（设置类，`bc-eg71-content` 形态） | `T_Config` |
| P5 | LoRaWAN 设备编辑页（改动） | `/data-services/data-acquisition/device/edit` | 表单页 | 多区块卡片 | `T_Config` |
| G | 全局提示条「正在LoRaWAN扫描中」（新增） | 全局元素，非页面 | — | 扫描中挂载于 P1–P5 内容区顶部 | — |

每页装配序列统一以 `MS_EG71_SHELL.render(ctx, { content, footer })` + `bind(root)` 开头；页面层职责仅限：选模块、定 L3 出现顺序、注入 ctx（`route` / `entity` / `rows` / `scanning` 等）。二级页路由切换用壳既有 `navigate` + `data-route` 范式，不自造壳结构。

---

## 2. 逐页装配序列

### 2.1 P1 · 设备数采页（改动）

```
MS_EG71_SHELL（route=/data-services/data-acquisition）
├── M_GlobalNotice      全局扫描提示条（ctx.scanning=true 时挂载；见 §3）
└── M_DeviceList        设备列表（单卡片）
    └── B_Eg71DeviceList（bc-eg71-device-list，扩展）
        ├── S_Button / S_Icon          工具栏：Manually Add / Scan Add / Batch Add / Delete
        ├── S_Table / S_Checkbox       设备表（复选 + 8 列 + 行内 Edit·Monitor·Delete）
        ├── S_Tag（状态列）            Online / Offline / Not activated + 【扩展】Join failed（右侧失败原因提示，镜像 signal-tip hover 模式）
        ├── 信号图示（既有）           三档条形 + SF/SNR/RSSI hover 气泡（P3 扫描表沿用此逻辑）
        ├── S_Pagination / S_Empty     表尾 + 空态
        └── B_Eg71Modal（内嵌）        删除确认（action='delete'，既有）
```

- **ctx 要点**：`rows` 注入含 `status:'join_failed'` + `failReason:'key_error' | 'no_join_accept'` 的设备行；失败原因为状态右侧提示（非独立颜色状态），文案取 04-dev §1.1 枚举的产品文案（密钥错误 / 节点未收到入网应答包）。
- **扫描入口**：命中工具栏既有 `Scan Add` 按钮（`data-device-add="scan"`），行为从占位事件改为路由至 P2——不加新控件（入口最终形态以 Figma 为准，若移位属 A2 微调）。
- **间距**：工具栏与表格 12px（`--spacing-m`）；表尾与表格 12px；卡片内边距 ≥16px（推荐 20px）；全页单卡片，无卡片栅格。

### 2.2 P2 · LoRaWAN 扫描配置页（新增）

```
MS_EG71_SHELL（route=/data-services/data-acquisition/lorawan-scan）
├── M_GlobalNotice      全局扫描提示条（仅「扫描中重新进入」态挂载；见 §3）
├── M_ScanKeyConfig     AppKey 配置卡（单卡片，页面主体）
│   └── B_Eg71ScanAppkeyCard（bc-eg71-scan-appkey-card，新铸）
│       ├── S_Checkbox       「Milesight默认Key」勾选框（默认勾选；清空不影响其状态）
│       ├── S_Button ×2      【导入文件】（唤起 csv/xlsx 文件选择）+【清空】（危险态次按钮）
│       ├── S_Input          搜索框（模糊搜索过滤 Key 列表）
│       ├── S_Input + S_Icon 自定义 AppKey 输入区（逐条添加/删除；计数 0/1000；校验 32 位 hex）
│       ├── S_Empty          无自定义 Key 时的列表空态
│       └── 内嵌反馈态       导入失败 4 场景横幅（经 B_Eg71AlertBar，见下）
├── M_AlertBar          导入异常横幅（反馈态，随导入动作显隐）
│   └── B_Eg71AlertBar（bc-eg71-alert-bar，新铸）：S_Alert + S_Icon，error 语义，4 条产品文案（文件超 1M / 数量超限 / 无 AppKey 表头 / 存在非法 AppKey）
└── M_FormFooter        底部吸底操作栏（shell opts.footer）
    └── B_Eg71FormFooter（bc-eg71-form-footer，扩展 ctx.buttons）
        └── S_Button ×2：【取消】（次）+【开始扫描｜应用】（主 filled；无任何 Key 时置灰 disabled）
```

- **ctx 要点**：`ctx.scanning`（true 时主按钮文案为「应用」，且顶部挂全局提示条——路径 C）；`ctx.keys`（自定义 Key 列表）；`ctx.defaultKeyChecked`（默认 true）。
- **按钮态逻辑归属**：主按钮置灰条件（未勾选默认 Key 且无自定义 Key）在 B_Eg71ScanAppkeyCard 与 footer 间以事件联动（L3 业务逻辑，页面层不写控件级判断）。
- **间距**：勾选行 → 导入/清空按钮组 ≥12px；按钮与按钮 ≥12px；按钮组 → 搜索框 16px（表单项距）；搜索框 → Key 列表 16px；Key 列表行距 8–12px（纯展示紧凑列表允许 8px）；卡片内边距 ≥16px（推荐 20/24px）；横幅与卡片同区块内 12px，卡片与 footer 区块间 ≥24px（`--spacing-2xl`）。

### 2.3 P3 · 扫描确认页（新增）

```
MS_EG71_SHELL（route=/data-services/data-acquisition/lorawan-scan/confirm）
├── M_GlobalNotice      全局扫描提示条（灰态：无红点、保留设备数；见 §3）
├── M_GuideBanner       交互引导横幅（顶部全宽）
│   └── B_Eg71AlertBar（新铸）：info 语义，固定产品文案（仅能发现 OTAA 设备 + 排障建议）
├── M_ScanDeviceTable   双 Tab 设备表（单卡片，页面主体）
│   └── B_Eg71ScanDeviceTable（bc-eg71-scan-device-table，新铸）
│       ├── S_Tabs             【发现设备】/【已忽略设备】双页签（镜像 bc-eg71-event-tabs 页签形态）
│       ├── S_Button 工具栏    发现 Tab：【添加设备】(主)【放弃扫描】(危险)【编辑】【忽略】；已忽略 Tab：【取消忽略】
│       ├── S_Table + S_Checkbox  设备表：选择框 / DevEUI / 设备名(行内编辑) / 描述(行内编辑) / 设备型号(行内快速选择) / 信号强度 / 更新时间 / 操作列
│       ├── 行内编辑           S_Input / S_Select 单元格级编辑（设备名、描述、型号）
│       ├── 信号强度列         三档图示 + SNR/RSSI 具体值常显（沿用 P1 信号列图示逻辑，铸造时字段迁移自 bc-eg71-device-list 信号单元）
│       ├── 更新时间列         带时区，列表按其倒序
│       ├── S_Empty            空态文案「扫描进行中，离开此页面不会打断扫描」（保留表头）
│       └── S_Button 刷新      列表下方手动刷新（两 Tab 均有）
├── M_ScanEditDrawer    多设备编辑抽屉（勾选多台点【编辑】滑出）
│   └── B_Eg71ScanEditDrawer（bc-eg71-scan-edit-drawer，新铸，ctx.mode='multi'）
│       ├── S_Drawer           右侧滑出，抽屉名「编辑多个设备」
│       ├── S_Select           配置文件（过滤且不显示 ABP 模式配置文件）
│       ├── S_InputNumber ×2   fPort（默认 1）/ 超时时间（默认 1440）
│       ├── S_Switch           是否启用帧计数校验（默认不启用）
│       └── S_Button           取消 / 保存（保存应用到全部勾选设备；不显示名称/描述/DevEUI/型号）
├── M_ScanEditSingle    单设备编辑（操作列【编辑】进入，7 字段；形态弹窗/抽屉见 §7-D2）
│   └── B_Eg71ScanEditDrawer（ctx.mode='single'，同壳增字段）
│       └── 增：设备名称 / 设备描述 / 设备型号（S_Input / S_Select）+ DevEUI（只读）+ 上列 4 项
├── M_ConfirmModals     确认弹窗组（全部复用 B_Eg71Modal，页面层不手搓弹窗）
│   ├── 添加设备确认   B_Eg71Modal action='confirm'，okText='确认'；确认后 Toast「xx个设备添加成功」（S_Message 反馈，随事件触发）+ 刷新 + 移除已添加行；冲突提示「xx个设备已存在」不拦截
│   ├── 放弃扫描确认   B_Eg71Modal action='delete'（danger 变体，无关键字输入），okText='放弃扫描'；确认后结束扫描 + 清空未添加设备（行为遵循 B_ComDangerAction 规范）
│   ├── URL 直入提示   B_Eg71Modal action='confirm'，desc='请先完成扫描配置，页面即将返回配置步骤。'；3 秒自动跳回 P2（定时跳转为页面级流程逻辑）
│   └── 超限拦截       B_Eg71Modal action='confirm'（勾选 >2000 设备上限 / >20000 对象上限）
```

- **ctx 要点**：`ctx.tab`（found / ignored）；`ctx.rows`（池设备：devEUI/name/description/model/rssi/snr/lastUpdateAt/ignored）；`ctx.scanning`（false 且 URL 直入时触发守卫弹窗）。
- **忽略流转**：Tab 间移动（忽略/取消忽略）为 B_Eg71ScanDeviceTable 内部业务事件，被忽略设备信号与更新时间仍更新。
- **间距**：引导横幅 → 卡片 ≥24px（`--spacing-2xl`，模块间）；页签 → 工具栏 ≥12px；工具栏 → 表格 12px（`--spacing-m`）；表格 → 刷新按钮 16px；卡片内边距 ≥16px；工具栏按钮间 ≥12px。表格数字列 `bc-num`、操作列 `bc-eg71-table-ops`（EG71 左对齐契约）。

### 2.4 P4 · LoRaWAN 设备添加页（改动 · OTAA）

```
MS_EG71_SHELL（route=/data-services/data-acquisition/device/add?protocol=lorawan）
├── M_GlobalNotice      全局扫描提示条（扫描中时挂载；见 §3）
├── M_DeviceForm        LoRaWAN 设备表单（多区块卡片，B_Eg71DeviceForm ctx.mode='add'）
│   └── B_Eg71DeviceForm（bc-eg71-device-form，新铸）
│       ├── 区块卡 Basic           S_Input（DevEUI / 设备名 / 描述）+ S_Select（设备型号）
│       ├── 区块卡 Profiles        S_Select（配置文件）+ S_InputNumber（fPort / 超时时间）+ S_Switch（帧计数校验）
│       ├── 区块卡 激活设置（灰底） B_Eg71ActivationCard（bc-eg71-activation-card，新铸）
│       │   ├── S_Radio            「默认值 / 自定义值」单选组（非 Milesight 设备时「默认值」禁用）
│       │   └── S_Input            应用程序密钥（32 位 hex；移除原左侧下拉；无左侧下拉框）
│       └── （OTAA 态不再展示 设备地址/应用程序会话秘钥/网络会话秘钥 三只读字段——直接移除）
└── M_FormFooter        B_Eg71FormFooter（扩展 ctx.buttons）：取消 / 保存
```

- **ctx 要点**：`ctx.mode='add'`；`ctx.activationMode` 默认值判定（DevEUI 以 `24E124` 开头或型号为 Milesight → 默认「默认值」，否则「自定义值」且「默认值」禁用）；Milesight 判定与默认选中逻辑在 L3 内，页面层只传 DevEUI/型号。
- **间距**：多区块卡片间 ≥16px（`--spacing-l`，卡片栅格 gap，用 mod-* 结构类表达）；区块卡内表单项距 16–24px；灰卡内单选组 → 密钥输入 16px；卡片内边距 ≥16px；区块卡标题与卡体内容 12px。

### 2.5 P5 · LoRaWAN 设备编辑页（改动 · OTAA/ABP 双态）

```
MS_EG71_SHELL（route=/data-services/data-acquisition/device/edit）
├── M_GlobalNotice      全局扫描提示条（扫描中时挂载；见 §3）
├── M_DeviceForm        B_Eg71DeviceForm（ctx.mode='edit'）
│   ├── 区块卡 Basic / Profiles    同 P4
│   ├── OTAA 态          AppKey 可编辑（B_Eg71ActivationCard 自定义值）+ DevAddr/AppSKey/NwkSKey 只读（入网后自动填充）
│   ├── 区块卡 激活设置（灰底） B_Eg71ActivationCard（ABP 段复用）
│   │   └── ABP 态：S_Radio 默认值/自定义值 + 默认值时下方三密钥置灰不可编辑（DevAddr / NwkSKey / AppSKey）
│   └── 区块卡 ABP 参数   S_Input ×3（三密钥，随激活设置联动置灰/恢复）+ S_InputNumber ×3（Uplink / Downlink Frame-counter、Timeout——默认值态仍可编辑）
│   （ABP 态不显示 AppKey 字段）
└── M_FormFooter        B_Eg71FormFooter：取消 / 保存
```

- **三场景切换 + 前端暂存**（04-dev §3.8/§3.9）：同类型切换保持不变；ABP→OTAA / OTAA→ABP 字段带入规则；未保存切换时前端暂存、保存后未激活类型字段清除——全部为 B_Eg71DeviceForm 内部业务状态机，页面层不参与。
- **间距**：同 P4（卡片间 ≥16px；联动置灰不影响间距结构）。

---

## 3. 全局元素 G · 全局扫描提示条

```
M_GlobalNotice（挂载于 P1–P5 内容区顶部第一个模块，扫描中常驻——含状态页等任意路由）
└── B_Eg71ScanBanner（bc-eg71-scan-banner，新铸）
    ├── S_Icon + 文本     「正在LoRaWAN扫描中」常驻文字
    ├── S_Badge 红点      扫描到新设备时出现 + 未添加设备数
    ├── 灰态变体          点击进入 P3 后：红点去除、提示条变灰、设备数保留（--active / --visited 两态）
    └── 整条可点击        点击 → 路由至 P3（不中断扫描），用 data-route 事件范式（镜像 bc-eg71-protocol-card 导航事件）
```

- **挂载点**：壳资产冻结不改 `MS_EG71_SHELL`；提示条由页面层作为内容区第一个 L3 模块注入（页面层定 L3 出现顺序属其职责），扫描态经 `ctx.scanning` / `ctx.unaddedCount` / `ctx.visited` 注入。
- **间距**：提示条与下方第一个业务模块 ≥24px（`--spacing-2xl`，模块与模块红线）。

---

## 4. 复用 / 扩展 / 新铸总表（供 A2）

### 4.1 直接复用（registry 已注册，零改动）

| B_* | 现 id | 用于 |
|---|---|---|
| `MS_EG71_SHELL`（含 sidenav/topnav/form-footer 调度） | — | P1–P5 全部壳 |
| `B_Eg71Modal` | `bc-eg71-modal` | P1 删除确认；P3 添加确认 / 放弃扫描（delete 变体）/ URL 直入 / 超限拦截，共 5 处 |
| `B_Eg71FormFooter`（若走扩展则见 4.2） | `bc-eg71-form-footer` | P2 / P4 / P5 底部操作栏 |
| `B_Eg71Content` | `bc-eg71-content` | P4 / P5 多区块卡片容器形态（若 B_Eg71DeviceForm 铸造则内部复用其区块卡结构与 form-item 编排） |
| `B_ComDangerAction`（规范） | — | 放弃扫描、清空、删除类危险操作行为规范（红字/danger 按钮 + 确认 + Toast 反馈） |

### 4.2 扩展既有（改注册表源头，走 versioning bump，不在 demo 内私改）

| 组件 | 扩展点 | 版本动作 |
|---|---|---|
| `bc-eg71-device-list` | ① 状态枚举增 `join_failed`（状态右侧失败原因提示，镜像 signal-tip hover 模式）；② `Scan Add` 按钮事件路由化（→ P2） | minor（新增状态值与行为，Props 兼容） |
| `bc-eg71-form-footer` | `ctx.buttons` 化：按钮数量与文案可配（默认仍 取消/重置/保存）——P2 需【取消】【开始扫描｜应用】、P4/P5 需【取消】【保存】 | minor |

### 4.3 新铸候选（缺形态，7 个 —— A2 按 §3 铸造路径：先找相似 L3 做字段迁移 → 生成注册回库 → 再拼装）

| # | 建议逻辑名 | 运行时 id | 形态 | 字段迁移源（最相似 L3） | atoms（S_*） |
|---|---|---|---|---|---|
| 1 | `B_Eg71ScanBanner` | `bc-eg71-scan-banner` | 全局扫描提示条（文字+红点+设备数+灰态） | `bc-eg71-protocol-card`（data-route 导航事件范式） | S_Button, S_Icon, S_Badge |
| 2 | `B_Eg71ScanAppkeyCard` | `bc-eg71-scan-appkey-card` | AppKey 配置卡（勾选/导入/清空/搜索/Key 列表/计数） | `bc-eg71-app-card`（标题+字段行+行内主钮导入卡） | S_Checkbox, S_Button, S_Input, S_Upload(导入语义), S_Icon, S_Empty |
| 3 | `B_Eg71AlertBar` | `bc-eg71-alert-bar` | 页内业务横幅（info 引导 / error 导入异常 4 场景） | 无同形 L3（基础 S_Alert 的业务封装） | S_Alert, S_Icon |
| 4 | `B_Eg71ScanDeviceTable` | `bc-eg71-scan-device-table` | 双 Tab + 分 Tab 工具栏 + 行内编辑表 + 信号具体值 + 空态 + 刷新 | `bc-eg71-device-list`（信号单元/复选/空态/表尾）+ `bc-eg71-event-tabs`（页签）+ `bc-eg71-event-list`（工具栏+搜索编排） | S_Tabs, S_Button, S_Table, S_Checkbox, S_Input, S_Select, S_Tag, S_Icon, S_Empty |
| 5 | `B_Eg71ScanEditDrawer` | `bc-eg71-scan-edit-drawer` | 单/多设备编辑抽屉（ctx.mode='single' 7 字段 / 'multi' 4 字段） | `bc-eg71-protocol-detail`（S_Drawer 壳范式，改只读为可编辑表单） | S_Drawer, S_Form, S_Input, S_InputNumber, S_Select, S_Switch, S_Button |
| 6 | `B_Eg71ActivationCard` | `bc-eg71-activation-card` | 激活设置灰底卡（默认值/自定义值单选 + 槽位置灰联动 + 切换保留输入） | `bc-eg71-form-item-radio-group`（单选组）+ 灰底容器 | S_Radio, S_Form, S_Input |
| 7 | `B_Eg71DeviceForm` | `bc-eg71-device-form` | LoRaWAN 设备添加/编辑表单页（多区块卡 + OTAA/ABP 双态 + 三场景暂存状态机） | `bc-eg71-content`（区块卡编排）+ `bc-eg71-form-item-*` 系列 | S_Card, S_Form, S_Input, S_InputNumber, S_Select, S_Switch, S_Icon + 内嵌 #6 |

新模块词汇（建议随 A2 回写 `K_mapping.md` §二）：`M_GlobalNotice`（全局提示条）、`M_GuideBanner`（页内引导横幅）、`M_ScanKeyConfig`（扫描 Key 配置）、`M_ScanDeviceTable`（扫描双 Tab 设备表）、`M_ScanEditDrawer`（扫描编辑抽屉）、`M_ActivationCard`（激活设置灰卡）、`M_DeviceForm`（设备添加/编辑表单）。

---

## 5. 间距合规速查（A4 渲染对照）

| 关系 | 本计划取值 | 令牌 | 出现位置 |
|---|---|---|---|
| 模块与模块 | 24px | `--spacing-2xl` | 全局提示条→业务模块；引导横幅→卡片；P2 卡片区→footer 区 |
| 卡片与卡片 | ≥16px | `--spacing-l` | P4/P5 多区块卡栅格 gap |
| 按钮与按钮 | ≥12px | `--spacing-m` | 全部工具栏 / footer / 灰卡操作 |
| 工具栏与表格 | 12px | `--spacing-m` | P1 / P3 |
| 表单项与表单项 | 16–24px | `--spacing-l`/`--spacing-2xl` | P2 Key 卡 / P4/P5 表单 |
| 标题与正文内容 | 12px | `--spacing-m` | 区块卡标题→卡体 |
| 卡片内边距 | ≥16px（推荐 20/24px） | `--spacing-l` 起 | 全部卡片 |
| 页面内容区 | 四周 20px（列表/流程类页级覆写） | `--spacing-xl`(20) | P1/P2/P3（AGENTS 壳契约第 3 条） |

A4 内联 runtime 后按 `spacing.md` §7 存量偏差清单就地修正（不回写源头）：`ico(*,14)`→`ico(*,16)`（bc-eg71-device-list 工具栏/操作列等）；工具栏 `ms-space--8`（按钮组场景）→`ms-space--12`；`.ms-stat-title` 13px→12px；`.bc-eg71-protocol-card` 竖向 padding 12→16px。图标一律经 `S_Icon`（`MS_ICONS`），同组同尺寸（16px 起）。

---

## 6. 装配顺序建议（A3/A4 消费）

1. **主路径 A 优先**：P1（默认入口，含 join_failed 行）→ Scan Add → P2（默认 Key 勾选态）→【开始扫描】→ P3（发现设备 Tab 有数据 + 全局提示条灰态）。
2. **次路径**：P3 忽略流转（双 Tab 切换）→ 多设备编辑抽屉 → 添加确认弹窗 → Toast + 行移除；放弃扫描弹窗 → 回 P1（提示条消失）。
3. **改动页**：P4（OTAA 灰卡、默认值/自定义值切换、非 Milesight 禁用态）；P5（ABP 默认值置灰联动 + 三场景切换暂存）。
4. **守卫路径**：URL 直入 P3（非扫描中）→ 提示弹窗 + 3 秒回 P2。
5. demo 为单文件多路由：页面渲染函数表按 route 分发，壳 `navigate` 复用；每页均可在 `ctx.scanning=true` 下叠加全局提示条。

---

## 7. A2 输入依赖（影响模块形态的决策项，非 UI 内容）

| # | 决策项 | 对装配的影响 | 建议默认 |
|---|---|---|---|
| D1 | 扫描入口控件形式/位置（03-ued 待确认 #1） | M_DeviceList 工具栏内按钮位置 | 用既有 `Scan Add` 工具栏按钮，Figma 定稿后微调 |
| D2 | 单设备编辑形态：弹窗 / 抽屉 / 页面（待确认 #2） | M_ScanEditSingle 的壳（S_Drawer vs S_Modal） | 抽屉（与多设备编辑同壳 `ctx.mode='single'`，交互一致） |
| D3 | 添加/放弃确认弹窗文案（待确认 #3） | B_Eg71Modal ctx.desc 文案 | A2 以合理产品文案占位，Figma 定稿后替换 |
| D4 | 超限提示触发时机与文案（待确认 #4） | M_ConfirmModals 超限弹窗的触发绑定（勾选时/提交时） | 提交时拦截 |
| D5 | 超时时间单位（待确认 #7） | M_ScanEditDrawer / M_DeviceForm 数值单位后缀 | 分钟（min） |

> 以上仅为 A2 匹配/铸造时的输入参数；其最终口径与 PRD 对齐记录归 `05_release/REQ-012/validation.md`，不进可见 UI。
