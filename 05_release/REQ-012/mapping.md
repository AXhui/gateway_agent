# REQ-012 组件映射清单（A2 · ued-a2-component-matcher）

> 输入：`05_release/REQ-012/plan.md`（A1，5 页面 + 1 全局元素）+ `05_release/REQ-012/03-ued.md`（字段/交互/状态）。
> 规则基线（匹配前已逐份引用）：`business-specific.md` §2 组装契约（atoms 序列 + ctx 字段 + render/bind 骨架 + entityHint）；`page-assembly.md` §0 映射清单格式 + §3 缺形态铸造路径（先找相似 L3 → 铸造注册回库 → 再拼装，禁止页面层现搓）；`naming.md` 三处一致（逻辑名 ↔ `bc-*` ↔ `business/eg71/` 目录）。
> 真伪核对源：`.claude/_index.json` + `assets/js/registry-business.js`（runtime 权威）+ `assets/js/registry-base.js` + `library/base.css`（ms-* 原子类实测齐备：badge/message/tabs/drawer/alert/upload/input-number/radio-btn/switch/select/tip 等）。
> 本清单是铸造施工（下一环）的唯一输入；`需铸造` 条目按 §4 契约施工后**注册回库**（registry-business.js + library/business.css + `_index.json` + SKILL.md 8 章节 + frontmatter `version: 1.0.0`）才允许 A4 拼装。

---

## 0. 壳匹配结论（AGENTS.md 唯一壳契约）

全部 5 页面命中 `MS_BIZ_UTIL.navGroups → Data Services → Data Acquisition`（子路由 `/data-services/data-acquisition`，已核对 registry-business.js:139 + slug 拼接逻辑）。P2/P3/P4/P5 为该入口下二级页，从 P1 按钮进入，**navGroups 唯一源零改动**；顶栏面包屑按路由 2 级渲染（Data Services > Data Acquisition），更深层级折叠，壳资产冻结不动。

---

## 1. 组件映射清单（page-assembly §0 格式：形态描述 → B_* + ctx）

### P1 · 设备数采页（route `/data-services/data-acquisition`）

| 形态 | → 组件 + ctx |
|---|---|
| 页面壳（侧栏+顶栏+内容区） | `MS_EG71_SHELL.render(ctx, { content, footer })` + `bind(root)`，`ctx.route='/data-services/data-acquisition'`，**直接复用** |
| 全局扫描提示条（扫描中挂载内容区顶部） | `B_Eg71ScanBanner`（**铸造**）+ `ctx={ scanning:true, unaddedCount:N, visited:false }`，见 §4.1 |
| 设备列表（工具栏/8 列/信号三档/复选/空态/分页） | `B_Eg71DeviceList`（`bc-eg71-device-list`，runtime 已注册）**直接复用** + `ctx.rows`（含既有行）；`ctx.state='empty'` 可切空态 |
| 设备状态列「入网失败」+ 右侧失败原因提示 | `B_Eg71DeviceList` **扩展**（§3.1）：`ctx.rows[].status:'Join failed'` + `failReason:'key_error'\|'no_join_accept'` |
| Scan Add 扫描入口（→ P2） | 既有工具栏按钮 `data-device-add="scan"` 已冒泡 `eg71-device-add {path:'scan'}`，页面层监听后 `MS_EG71_SHELL.navigate('/data-services/data-acquisition/lorawan-scan')`——**零注册表改动**（A1 修正项，见 §6） |
| 删除确认弹窗 | `B_Eg71Modal`（**直接复用**，device-list 内嵌实例）`ctx={ action:'delete', title:'Delete Device', okText:'Delete' }`，确认后行为按 `B_ComDangerAction` 规范（§5.2） |

### P2 · LoRaWAN 扫描配置页（`…/lorawan-scan`）

| 形态 | → 组件 + ctx |
|---|---|
| 页面壳 | `MS_EG71_SHELL`（**直接复用**），route 同上二级 |
| 全局提示条（扫描中重进入态） | `B_Eg71ScanBanner`（**铸造**）+ `ctx={ scanning:true, unaddedCount, visited:false }` |
| AppKey 配置卡（勾选/导入/清空/搜索/Key 列表/计数/空态） | `B_Eg71ScanAppkeyCard`（**铸造**，§4.2）+ `ctx={ defaultKeyChecked:true, keys:[], maxKeys:1000, keyword:'' }` |
| 导入文件 | 卡内按钮，文件类型 csv/xlsx，前端模拟解析；四失败场景冒泡 `eg71-scan-import-error {case, remaining}` |
| 导入异常横幅（4 场景，error） | `B_Eg71AlertBar`（**铸造**，§4.3）+ `ctx={ tone:'error', desc:'（§6.8 四文案之一，N 由调用方拼好）' }` |
| 底部操作栏【取消】【开始扫描｜应用】 | `B_Eg71FormFooter` **扩展 ctx.buttons**（§3.2）+ `ctx.buttons=[{label:'取消',action:'cancel'},{label: scanning?'应用':'开始扫描', kind:'filled', action:'start-scan', disabled:!canStart}]`（`canStart` 由 `eg71-scan-keys-change` 事件联动换 buttons 重渲染） |

### P3 · 扫描确认页（`…/lorawan-scan/confirm`）

| 形态 | → 组件 + ctx |
|---|---|
| 页面壳 | `MS_EG71_SHELL`（**直接复用**） |
| 全局提示条（灰态：无红点、保留设备数） | `B_Eg71ScanBanner`（**铸造**）+ `ctx={ scanning:true, unaddedCount, visited:true }` |
| 交互引导横幅（info 固定文案 §6.7） | `B_Eg71AlertBar`（**铸造**）+ `ctx={ tone:'info', desc:'扫描仅能发现OTAA入网模式的设备，请核对 DevEUI是否与您的设备一致。若长时间未发现目标设备，请确认设备处于开机状态，缩短设备与网关距离并重启设备后再试。' }` |
| 双 Tab 设备表（页签/分 Tab 工具栏/行内编辑/信号具体值/更新时间倒序/空态保留表头/刷新） | `B_Eg71ScanDeviceTable`（**铸造**，§4.4）+ `ctx={ tab:'found'\|'ignored', rows:ScanRow[], scanning:true }`；数字列 `bc-num`、操作列 `bc-eg71-table-ops`（EG71 左对齐契约） |
| 多设备编辑抽屉（勾选多台点【编辑】，4 字段） | `B_Eg71ScanEditDrawer`（**铸造**，§4.5）+ `ctx={ mode:'multi', open, value:{profile, fPort:1, timeout:1440, frameCheck:false}, profiles:['ClassA-OTAA',…] }`（过滤 ABP） |
| 单设备编辑（操作列【编辑】，7 字段） | 同 `B_Eg71ScanEditDrawer` `ctx.mode='single'`（D2 默认抽屉同壳，增 DevEUI 只读/名称/描述/型号） |
| 添加设备确认弹窗 | `B_Eg71Modal`（**直接复用**，ScanDeviceTable 内嵌实例①）`ctx={ action:'confirm', okText:'确认', desc:'（D3 占位文案，Figma 定稿替换）' }`；确认后行移除 + `S_Message` Toast「xx个设备添加成功」+ 刷新；冲突「xx个设备已存在」不拦截 |
| 放弃扫描确认弹窗 | `B_Eg71Modal`（**直接复用**，内嵌实例②）`ctx={ action:'delete', title:'放弃扫描', okText:'放弃扫描', desc:'（D3 占位）' }`，**不传 confirmKeyword**；行为按 `B_ComDangerAction`（§5.2） |
| URL 直入提示弹窗 | `B_Eg71Modal`（**直接复用**，独立实例）`ctx={ action:'confirm', desc:'请先完成扫描配置，页面即将返回配置步骤。' }`；3 秒定时跳转 P2 为**页面级流程逻辑**（Modal 只负责展示/关闭） |
| 超限拦截弹窗（>2000 设备 / >20000 对象） | `B_Eg71Modal`（**直接复用**，内嵌实例③）`ctx={ action:'confirm', title:'超出上限', desc:'（D4 文案待确认，默认提交时拦截）' }` |

### P4 · LoRaWAN 设备添加页（`…/device/add?protocol=lorawan`）

| 形态 | → 组件 + ctx |
|---|---|
| 页面壳 | `MS_EG71_SHELL`（**直接复用**） |
| 全局扫描提示条 | `B_Eg71ScanBanner`（**铸造**）+ `ctx={ scanning, unaddedCount, visited }` |
| LoRaWAN 设备表单（Basic / Profiles 区块卡 + 激活设置灰卡，OTAA；三只读字段移除） | `B_Eg71DeviceForm`（**铸造**，§4.7）+ `ctx={ mode:'add', activation:'otaa', devEui, values:{…} }`；Milesight 判定（DevEUI `24E124` 前缀或 Milesight 型号）在 L3 内 |
| 激活设置灰卡（默认值/自定义值单选 + 应用程序密钥 32hex 无左侧下拉） | `B_Eg71ActivationCard`（**铸造**，§4.6，被 DeviceForm 内嵌）+ `ctx={ kind:'otaa', value:{mode, appKey}, milesight }` |
| 底部操作栏【取消】【保存】 | `B_Eg71FormFooter` **扩展** + `ctx.buttons=[{label:'取消',action:'cancel'},{label:'保存',kind:'filled',action:'save'}]` |

### P5 · LoRaWAN 设备编辑页（`…/device/edit`）

| 形态 | → 组件 + ctx |
|---|---|
| 页面壳 / 全局提示条 / 底部操作栏 | 同 P4（**直接复用** / 铸造 / 扩展） |
| 设备表单（edit 双态：OTAA AppKey 可编辑 + DevAddr/AppSKey/NwkSKey 只读自动填充；ABP 三密钥默认值置灰联动 + 三计数器保持可编辑 + 不显示 AppKey） | `B_Eg71DeviceForm` + `ctx={ mode:'edit', activation:'otaa'\|'abp', devEui, values:{…含 abp:{devAddr,nwkSKey,appSKey,uplink,downlink,timeout}} }`；三场景切换 + 前端暂存状态机为组件内部逻辑（§4.7 bind） |
| 激活设置灰卡（ABP 段） | `B_Eg71ActivationCard` + `ctx={ kind:'abp', value:{mode}, milesight }`（ABP 态不渲染密钥输入——本迭代排除项 2） |

### G · 全局元素（挂 P1–P5 内容区顶部第一模块，任意路由）

| 形态 | → 组件 + ctx |
|---|---|
| 「正在LoRaWAN扫描中」常驻条（文字 + 新设备红点 + 未添加设备数 + 进入后灰态 + 整条可点击跳 P3 不中断扫描） | `B_Eg71ScanBanner`（**铸造**，§4.1）；`ctx.scanning=false` 时 render 返回 `''`（不挂载）；点击冒泡 `eg71-scan-navigate`，宿主走壳 `navigate` |

**统计：直接复用 5（MS_EG71_SHELL、B_Eg71Modal、bc-eg71-form-item-input / -select / -radio-group 作为 DeviceForm 内嵌编排件）+ 规范引用 1（B_ComDangerAction，无运行时条目）；扩展 2（bc-eg71-device-list、bc-eg71-form-footer）；铸造 7。** 清单内无「手写/现场实现」条目，满足 page-assembly §0 第 2 条。

---

## 2. 注册表真伪核对表（A1 引用逐项核验）

| A1 引用 | runtime（registry-business.js） | `_index.json` | SKILL.md | 判定 |
|---|---|---|---|---|
| `MS_EG71_SHELL` | 有（:3080，render/navigate/bind + navGroups） | —（壳非 B_* 条目） | eg71-shell skill | **真，直接复用** |
| `bc-eg71-modal`（B_Eg71Modal） | 有（:1519，action 分发 delete/disable/confirm/select） | 有 | 有（8 章节 v1.0.0） | **真** |
| `bc-eg71-device-list`（B_Eg71DeviceList） | 有（:1195，含 Scan Add 按钮与 `eg71-device-add` 事件） | **缺** | **缺目录** | **真（runtime），但注册契约脱 sync，随 §3.1 扩展一并补** |
| `bc-eg71-form-footer`（B_Eg71FormFooter） | 有（:933，硬编码三按钮、无 bind） | 有 | 有（旧三段式，待迁 8 章节） | **真，走扩展** |
| `bc-eg71-content`（B_Eg71Content） | 有（:1018） | 有 | 有 | 真；本需求**只作 DeviceForm 迁移范式**，不直接摆放 |
| `bc-eg71-protocol-card` | 有（:953，data-route + `eg71-protocol-navigate`） | 有 | 有 | 真；**ScanBanner 迁移源** |
| `bc-eg71-protocol-detail` | 有（:1614，schema 抽屉 + wrap.open/close） | 有 | 有（v0.1.0） | 真；**ScanEditDrawer 迁移源** |
| `bc-eg71-event-tabs` / `bc-eg71-event-list` | 有（:2364 / :2387） | 有 | 有 / 有 | 真；**页签形态 + 工具栏编排迁移源** |
| `bc-eg71-app-card` | 有（:2868） | 有 | **缺目录** | 真（runtime）；**ScanAppkeyCard 迁移源**，SKILL.md 缺待补 |
| `bc-eg71-form-item-input / -select / -radio-group`（A1 引 `bc-eg71-form-item-radio-group`） | 有（:1360 / :1383 / :1469） | **缺** | **缺目录** | 真（runtime）；作为 DeviceForm/ActivationCard 内嵌编排件复用 |
| `B_ComDangerAction`（bc-com-danger-action） | **无条目** | 无 | 有（_shared 规范稿 v0.1.0，「待实现」） | **规范引用**，调用方式见 §5.2 |
| 7 个新铸候选 id（scan-banner / scan-appkey-card / alert-bar / scan-device-table / scan-edit-drawer / activation-card / device-form） | **无**（registry + business.css grep 均无） | 无 | 无 | **确认缺形态，走铸造** |

> 注册表卫生问题汇总（随本轮施工一并治理，见 §7）：runtime 有而 `_index.json`/SKILL.md 缺的 8 个条目（device-list + form-item-*×6 + app-card 的 SKILL 目录）。

---

## 3. 存量扩展（改注册表源头，versioning minor bump，不在 demo 内私改）

### 3.1 `bc-eg71-device-list` → v1.1.0（minor）

现契约（registry:1195-1357）：`ctx.rows[]`（id/name/model/protocol/network/signal{level,tip[]}/updated/status/objects），STATUS 硬编码 `{Online:success, Offline:muted, 'Not activated':warm}`；工具栏 Manually Add / **Scan Add（`data-device-add="scan"`，已冒泡 `eg71-device-add {path:'scan'}`）** / Batch Add / Delete；行内 Edit·Monitor·Delete；内嵌删除确认 `bc-eg71-modal`；空态保留表头。

扩展 diff（仅第 ① 项是注册表改动）：

1. **① 状态枚举增 `Join failed`**：STATUS 表增 `'Join failed': { cn:'Join failed', tone:'error' }`（状态本身是 tag，失败原因仅为右侧注记——03-ued §6.1/§6.2；tone 以 Figma 定稿为准，暂定 error）。
2. **① rows 增可选字段 `failReason: 'key_error' | 'no_join_accept'`**：渲染时状态 tag 右侧加提示图标 + hover 气泡（镜像既有 `.bc-eg71-signal-tip` 模式，结构类 `.bc-eg71-fail-tip`），文案映射：`key_error → 密钥错误`、`no_join_accept → 节点未收到入网应答包`。两值之外不渲染提示。
3. **② 「Scan Add 路由化」撤销**（A1 修正）：runtime 已有事件冒泡机制（props 进/事件出），宿主页面监听 `eg71-device-add` 调 `MS_EG71_SHELL.navigate` 即可，**注册表零改动**。
4. 配套：补 `_index.json` 条目（id/cn/cat/dir/src/status）+ 新建 SKILL.md（8 章节、frontmatter `version: 1.1.0`、目录 `business/eg71/B_Eg71DeviceList/`）；A4 内联时按 spacing.md §7 存量偏差清单就地修正（`ico(*,14)`→16、工具栏 `ms-space--8`→`--12`），不回写源头。

### 3.2 `bc-eg71-form-footer` → v1.1.0（minor）

现契约（registry:933-951 + SKILL.md 旧三段式）：`render(ctx)` 硬编码 取消/重置/保存（保存 filled），`ctx.readonly → ''`；atoms `['affix','space','button']`；**无 bind**（按钮为静态标记）。

扩展 diff：

1. **`ctx.buttons` 化**：`FooterBtn = { label:string, kind?:'default'|'filled'|'danger'|'dashed', disabled?:boolean, action?:string }`；`ctx.buttons` 缺省时保持 `[{取消},{重置},{保存,filled}]`（向后兼容，现有使用者零改动）。
2. **新增 `bind(root)`**：按钮 click → 冒泡 `eg71-footer-action {action, label, index}`；幂等、可空跑（找不到容器直接返回）。容器结构不变（`ms-affix--fixed` + spacer + `ms-space--12`，按钮间距已合规 ≥12px）。
3. 本需求用法：P2 两按钮（label 随 `ctx.scanning` 在「开始扫描/应用」间切换 = 宿主换 `ctx.buttons` 重渲染 footer 容器；`disabled` 由 `eg71-scan-keys-change {canStart}` 联动）；P4/P5 两按钮（取消/保存）。
4. 配套：SKILL.md 从旧三段式迁 8 章节 + frontmatter `version: 1.1.0`；原「ctx.onSave/onCancel/onReset 回调预留」表述改为事件制（`eg71-footer-action`）。

---

## 4. 新铸契约 ×7（可直接施工深度；全部 `entityHint:'gateway'`，产品线 `eg71`，目录 `business/eg71/<B_*>`，初版 `version: 1.0.0`）

### 4.1 B_Eg71ScanBanner（全局扫描提示条）

| 项 | 值 |
|---|---|
| 逻辑名 / 运行时 id / 目录 | `B_Eg71ScanBanner` / `bc-eg71-scan-banner` / `business/eg71/B_Eg71ScanBanner/` |
| entityHint / tags | `gateway` / `['扫描','LoRaWAN','全局提示条','红点','新设备','扫描中','Scan','EG71']` |
| 迁移来源 | `bc-eg71-protocol-card`（data-route 整卡可点击 + bind 事件委托范式） |

atoms 依赖序列：

| 依赖 S_* | ms-* 控件 | 作用 |
|---|---|---|
| `S_Icon` | `ms-ico`（`lorawan`/`search` 图标 16px 起） | 条首扫描图标 |
| `S_Badge` | `ms-badge` / `ms-badge-count` / `ms-badge-dot` | 新设备红点 + 未添加设备数（visited 态去 dot） |
| `S_Typography` | `ms-text` / `ms-text--secondary` | 常驻文案「正在LoRaWAN扫描中」与计数文字 |

ctx 契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.scanning` | boolean | `false` | 扫描态单一来源；false 时 `render` 返回 `''`（整条不挂载） |
| `ctx.unaddedCount` | number | `0` | 未添加设备数（= 扫描确认页未添加节点数） |
| `ctx.visited` | boolean | `false` | 两态：false=`--active`（红点+数）；true=`--visited` 灰态（去红点、保留数） |
| `ctx.route` | string | `'/data-services/data-acquisition/lorawan-scan/confirm'` | 点击跳转目标 |

render(ctx) 骨架要点：`div.bc-eg71-scan-banner{--active|--visited}[data-route]`（可点击行用结构类 + data-route，**不用 S_Button**——嵌套链接非法 HTML，与 protocol-card 同判）→ `ico` + `ms-text` 常驻文案 + `ms-badge`（count + dot，visited 态仅 count）。
bind(root) 骨架要点：整条 click → 冒泡 `eg71-scan-navigate {route}`（镜像 `eg71-protocol-navigate`）；幂等可空跑。宿主监听后调 `MS_EG71_SHELL.navigate`（不中断扫描）。

### 4.2 B_Eg71ScanAppkeyCard（AppKey 配置卡）

| 项 | 值 |
|---|---|
| 逻辑名 / 运行时 id / 目录 | `B_Eg71ScanAppkeyCard` / `bc-eg71-scan-appkey-card` / `business/eg71/B_Eg71ScanAppkeyCard/` |
| entityHint / tags | `gateway` / `['扫描','AppKey','密钥','导入','清空','搜索','Milesight','LoRaWAN','EG71']` |
| 迁移来源 | `bc-eg71-app-card`（标题+字段行+行内主钮编排）；`bc-eg71-form-item-input`（count/msg 校验模式） |

atoms 依赖序列：

| 依赖 S_* | ms-* 控件 | 作用 |
|---|---|---|
| `S_Checkbox` | `ms-checkbox` | 「Milesight默认Key」默认勾选；【清空】不改其状态 |
| `S_Button` | `ms-btn` / `ms-btn--danger`（描边） | 【导入文件】默认钮 +【清空】危险描边钮（B_ComDangerAction 元素矩阵）+ Key 行删除 icon 钮 + 添加钮 |
| `S_Upload` | `ms-upload` | 导入语义：唤起 csv/xlsx 文件选择 |
| `S_Input` | `ms-input` | 搜索框（模糊过滤）+ 逐条添加输入（32 位 hex 校验） |
| `S_Tag` | `ms-tag--round ms-tag--outline` | 计数 `N/1000`（镜像 device-list `bc-count` 模式） |
| `S_Icon` | `ms-ico` | 搜索/删除/上传图标 |
| `S_Empty` | `ms-empty` | 无自定义 Key 空态 |

ctx 契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.defaultKeyChecked` | boolean | `true` | Milesight 默认 Key（固定+动态两套）勾选态 |
| `ctx.keys` | string[] | `[]` | 自定义 Key 列表（手动+导入合计 ≤ maxKeys） |
| `ctx.maxKeys` | number | `1000` | 上限 |
| `ctx.keyword` | string | `''` | 搜索词（过滤列表展示） |

render(ctx) 骨架要点：单卡（ms-card 结构）→ 勾选行 → 按钮组【导入文件】【清空】（`ms-space--12`，≥12px 红线）→ 搜索框 → Key 列表（行 = Key 文本 + 删除 icon 钮 24px 热区；行距 8–12px 紧凑列表）+ 计数 tag → 添加输入行 → 空态。
bind(root) 骨架要点：① 勾选/增/删/搜索 → 内部维护 → 冒泡 `eg71-scan-keys-change {keys, defaultKeyChecked, canStart}`（`canStart = defaultKeyChecked || keys.length>0`，footer 主钮置灰联动源）；② 添加输入 32 位 hex 校验，非法走 `bc-eg71-form-item-msg--error` 提示；③ 文件选择 change → 前端模拟校验（demo 读文件名/行数 mock）→ 四场景冒泡 `eg71-scan-import-error {case:'size'|'count'|'no-header'|'invalid', remaining?}`，横幅由 B_Eg71AlertBar 渲染（本组件不内拼横幅）；④【清空】仅清自定义 Key，danger 描边、无确认弹窗（PRD 未要求，Figma 复核）。

### 4.3 B_Eg71AlertBar（页内业务横幅）

| 项 | 值 |
|---|---|
| 逻辑名 / 运行时 id / 目录 | `B_Eg71AlertBar` / `bc-eg71-alert-bar` / `business/eg71/B_Eg71AlertBar/` |
| entityHint / tags | `gateway` / `['横幅','提示','引导','导入异常','Alert','扫描','EG71']` |
| 迁移来源 | 无同形 L3（A1 判定成立）——`S_Alert` 的业务封装（bc-restart :2037 已有 `ms-alert--warn` 直组先例，本组件收敛为可复用横幅） |

atoms：`S_Alert`（`ms-alert--info` / `--error` + body）+ `S_Icon`（`ms-ico` info/warn）。

ctx 契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tone` | `'info' \| 'error'` | `'info'` | info=引导横幅（P3）；error=导入异常（P2 四场景） |
| `ctx.title` | string? | — | 可选标题行 |
| `ctx.desc` | string | `''` | 正文文案（调用方拼好，含动态 N）；空则整条返回 `''` |
| `ctx.closable` | boolean | `false` | 关闭钮（本需求两用例均不关） |

render：`div.bc-eg71-alert-bar > ms-alert--{tone} > ico + ms-alert-body(title? + desc)`。bind：closable 时冒泡 `eg71-alert-close`；幂等。
两用例文案来源：03-ued §6.7（引导，info 常驻）与 §6.8（四场景 error，随导入动作显隐——显隐由宿主按 `eg71-scan-import-error` 换 ctx 重渲染，或 `hidden` 切换）。

### 4.4 B_Eg71ScanDeviceTable（扫描确认页双 Tab 设备表）

| 项 | 值 |
|---|---|
| 逻辑名 / 运行时 id / 目录 | `B_Eg71ScanDeviceTable` / `bc-eg71-scan-device-table` / `business/eg71/B_Eg71ScanDeviceTable/` |
| entityHint / tags | `gateway` / `['扫描','发现设备','已忽略','双Tab','行内编辑','信号强度','忽略','添加设备','放弃扫描','EG71','LoRaWAN']` |
| 迁移来源 | `bc-eg71-device-list`（信号单元 `signalHtml`/复选/全选 sync/空态保留表头/工具栏范式）+ `bc-eg71-event-tabs`（48px 页签条形态）+ `bc-eg71-event-list`（工具栏+搜索编排） |

atoms 依赖序列：

| 依赖 S_* | ms-* 控件 | 作用 |
|---|---|---|
| `S_Tabs` | `ms-tabs` / `ms-tab--active` | 【发现设备(N)】/【已忽略设备(M)】双页签 |
| `S_Button` | `ms-btn` / `--filled` / `--danger` | 分 Tab 工具栏：found=添加设备(filled)/放弃扫描(danger 描边)/编辑/忽略；ignored=取消忽略；表尾刷新 |
| `S_Table` | `ms-table` / `ms-table-wrap` | 8 列设备表（选择/DevEUI/设备名/描述/设备型号/信号强度/更新时间/操作）；数字列 `bc-num`、操作列 `bc-eg71-table-ops` |
| `S_Checkbox` | `ms-checkbox` | 行选 + 全选（含 indeterminate，镜像 device-list sync） |
| `S_Input` | `ms-input` | 行内编辑：设备名 / 描述（默认名=DevEUI） |
| `S_Select` | `ms-select` | 型号行内快速选择（含 None） |
| `S_Tag` | `ms-tag` | 型号多值展示（如 AM102/AM102L/…）与 None |
| `S_Icon` | `ms-ico` | 信号三档、操作图标 |
| `S_Empty` | `ms-empty` | 空态文案「扫描进行中，离开此页面不会打断扫描」（保留表头） |
| `S_Message` | `ms-message` / `ms-message-stack` | 添加成功 Toast「xx个设备添加成功」（反馈归本组件 bind） |

ctx 契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tab` | `'found' \| 'ignored'` | `'found'` | 当前页签（路由唯一源的只读投影） |
| `ctx.rows` | `ScanRow[]` | `[]` | `ScanRow = { devEui, name(默认=devEui), description:'', model?(string\|string[]\|'None'), rssi, snr, level:'good'\|'medium'\|'poor', lastUpdateAt(带时区字符串), ignored:false }` |
| `ctx.scanning` | boolean | `true` | false 且 URL 直入 → 守卫弹窗（宿主逻辑） |

render(ctx) 骨架要点：单卡 → 页签条（镜像 `bc-eg71-event-tab` 形态，带计数）→ 分 Tab 工具栏（`ms-space--12`）→ 表（行按 `lastUpdateAt` 倒序，render 内排序幂等）→ 空态 → 表尾刷新钮。信号单元从 device-list `signalHtml` 字段迁移：三档条形 + **SNR/RSSI 具体值常显**（P1 是 hover 气泡，本页常显——字段迁移时的形态差异点）。
bind(root) 骨架要点（单向数据流：组件不改 rows，只冒泡；行内编辑的即时值在组件内暂存、失焦冒泡）：

- 页签切换 → `eg71-scan-tab {tab}`；刷新 → `eg71-scan-refresh {tab}`
- 选择/全选 sync（复刻 device-list 的 indeterminate 逻辑）
- 行内编辑失焦 → `eg71-scan-row-edit {devEui, field:'name'|'description'|'model', value}`
- 【忽略】/【取消忽略】→ `eg71-scan-ignore {devEuis, ignored:true|false}`（宿主改 rows 重渲染；被忽略设备信号与更新时间仍更新=数据层语义）
- 【添加设备】→ 内嵌 `bc-eg71-modal` 实例①（`action:'confirm', okText:'确认'`）→ ok → 冒泡 `eg71-scan-add {devEuis}` + Toast「xx个设备添加成功」+ 移除已添加行；提交时超限判定（D4）→ 内嵌实例③（`action:'confirm'` 超限文案）拦截；冲突「xx个设备已存在」为 Toast 提示、不拦截
- 【放弃扫描】→ 内嵌实例②（`action:'delete', title:'放弃扫描', okText:'放弃扫描'`，无 confirmKeyword）→ ok → 冒泡 `eg71-scan-abandon`，行淡出 0.3s 移除（含已忽略）
- 工具栏【编辑】（勾选多台）→ `eg71-scan-edit-multi {devEuis}`；操作列【编辑】（单台）→ `eg71-scan-edit-single {devEui}`
- 内嵌多弹窗注意：每实例独立 wrapper 容器分别 bind（`bindEg71Modal` 收敛到 root 内第一个 `.bc-eg71-modal`）

### 4.5 B_Eg71ScanEditDrawer（单/多设备编辑抽屉）

| 项 | 值 |
|---|---|
| 逻辑名 / 运行时 id / 目录 | `B_Eg71ScanEditDrawer` / `bc-eg71-scan-edit-drawer` / `business/eg71/B_Eg71ScanEditDrawer/` |
| entityHint / tags | `gateway` / `['扫描','编辑抽屉','多设备编辑','单设备编辑','Drawer','配置文件','fPort','帧计数','EG71']` |
| 迁移来源 | `bc-eg71-protocol-detail`（S_Drawer 壳范式 + `wrap.open/close` API + mask/stopPropagation 交互，改只读 Descriptions 为可编辑表单控件） |

atoms 依赖序列：

| 依赖 S_* | ms-* 控件 | 作用 |
|---|---|---|
| `S_Drawer` | `ms-drawer` / `ms-mask--drawer` | 右侧滑出容器（单/多同壳，宽 480–600px 区间取 Figma） |
| `S_Form` | `ms-form` / `ms-form-item` | 表单编排 |
| `S_Input` | `ms-input` | single 态：设备名称 / 设备描述 |
| `S_InputNumber` | `ms-input-number` | fPort（默认 1）/ 超时时间（默认 1440，unit `(min)`，D5） |
| `S_Select` | `ms-select` | 配置文件（**过滤 ABP 模式**）；single 态设备型号 |
| `S_Switch` | `ms-switch` | 是否启用帧计数校验（默认不启用） |
| `S_Button` | `ms-btn` / `--filled` | 取消 / 保存（保存应用到全部目标设备） |
| `S_Icon` | `ms-ico` | 关闭钮/必填标记 |

ctx 契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.mode` | `'single' \| 'multi'` | `'multi'` | single=7 字段（+DevEUI 只读）；multi=4 字段（不显示名称/描述/DevEUI/型号） |
| `ctx.open` | boolean | `false` | 初始态（bind 后走 `wrap.open/close`） |
| `ctx.targets` | string[] | `[]` | 目标 devEui 列表（保存时随事件带回） |
| `ctx.device` | object? | — | single 必填：`{ devEui, name, description, model }` |
| `ctx.value` | object | `{profile:'ClassA-OTAA', fPort:1, timeout:1440, frameCheck:false, name:'', description:'', model:'None'}` | 表单值 |
| `ctx.profiles` | string[] | `['ClassA-OTAA']` | 可选配置文件（已过滤 ABP） |

render 骨架要点：`.bc-eg71-scan-edit-drawer[hidden] > ms-mask--drawer > ms-drawer`，标题 single=`编辑设备` / multi=`编辑多个设备`；body = single 前置 4 项（DevEUI 只读 + 名称 + 描述 + 型号）+ 公共 4 项（配置文件/fPort/超时(单位 min)/帧计数开关）；foot = 取消 + 保存(filled)。
bind 骨架要点：完全镜像 `bc-eg71-protocol-detail`（`wrap.open`/`wrap.close` + `data-drawer-close` + 遮罩点击关闭 + 内部 stopPropagation，幂等）；保存 → 校验 → 冒泡 `eg71-scan-save {mode, targets, value}` 后 `close()`。

### 4.6 B_Eg71ActivationCard（激活设置灰底卡）

| 项 | 值 |
|---|---|
| 逻辑名 / 运行时 id / 目录 | `B_Eg71ActivationCard` / `bc-eg71-activation-card` / `business/eg71/B_Eg71ActivationCard/` |
| entityHint / tags | `gateway` / `['激活设置','默认值','自定义值','AppKey','应用程序密钥','灰卡','OTAA','ABP','EG71']` |
| 迁移来源 | `bc-eg71-form-item-radio-group`（线框单选组形态）+ `bc-eg71-form-item-input`（count/校验）+ 灰底结构类（背景引 `--color-fill-base-normal` 令牌） |

atoms：`S_Radio`（`ms-radio-btn-group` 默认值/自定义值）+ `S_Form`（`ms-form-item`）+ `S_Input`（应用程序密钥 32 位 hex，**无左侧下拉**）+ `S_Icon`（info 提示）。

ctx 契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.kind` | `'otaa' \| 'abp'` | `'otaa'` | abp 态不渲染密钥输入（本迭代排除项 2），仅单选组 |
| `ctx.value` | `{ mode:'default'\|'custom', appKey:string }` | `{mode:'default', appKey:''}` | 当前值 |
| `ctx.milesight` | boolean | `false` | 由父（DeviceForm）判定注入：DevEUI `24E124` 前缀或型号 Milesight；true→默认 `default` 可选；false→`custom` 且 `default` **disabled** |
| `ctx.readonly` | boolean | `false` | edit·OTAA 已入网时的密钥可编辑态由父控制（AppKey 可编辑，DevAddr 等只读在父层） |

render 骨架要点：`div.bc-eg71-activation-card`（灰底）→ 单选组（第 1 行）→（kind=otaa）应用程序密钥输入（第 2 行，showCount `0/32`，行距 16px）。
bind 骨架要点：单选切换 → **保留**已输入 appKey（特殊交互 #8：切换不清空，仅换视图）→ 冒泡 `eg71-activation-change {kind, mode, appKey}`；输入 → `eg71-activation-appkey {value}`（32hex 校验，非法 error 态）。
**边界修正（对 A1）**：「槽位置灰联动」（ABP 默认值 → DevAddr/NwkSKey/AppSKey 置灰）的作用对象在卡外的 DeviceForm ABP 区，联动由 **B_Eg71DeviceForm** 消费 `eg71-activation-change` 实现；本卡只管自身两字段 + 发事件。

### 4.7 B_Eg71DeviceForm（LoRaWAN 设备添加/编辑表单）

| 项 | 值 |
|---|---|
| 逻辑名 / 运行时 id / 目录 | `B_Eg71DeviceForm` / `bc-eg71-device-form` / `business/eg71/B_Eg71DeviceForm/` |
| entityHint / tags | `gateway` / `['设备添加','设备编辑','LoRaWAN','OTAA','ABP','激活设置','三场景','前端暂存','DevEUI','EG71']` |
| 迁移来源 | `bc-eg71-content`（区块卡竖排编排 + `MS_BIZ_INDEX` 调用 form-item 的范式）+ `bc-eg71-form-item-input / -select / -radio-group`（直接内嵌复用）；内嵌 `bc-eg71-activation-card` |

atoms 依赖序列：

| 依赖 S_* | ms-* 控件 | 作用 |
|---|---|---|
| `S_Card` | `ms-card` | 区块卡：Basic / Profiles /（edit·OTAA 只读段）/（ABP）ABP 参数；卡片栅格 gap ≥16px（`--spacing-l`） |
| `S_Form` | `ms-form` / `ms-form-item` | 表单编排（复用 `bc-eg71-formgrid` 两列） |
| `S_Input` | `ms-input` | DevEUI / 设备名 / 描述 / 三密钥（DevAddr/NwkSKey/AppSKey） |
| `S_InputNumber` | `ms-input-number` | fPort / 超时时间 / Uplink·Downlink Frame-counter |
| `S_Select` | `ms-select` | 设备型号 / 配置文件 |
| `S_Switch` | `ms-switch` | 帧计数校验 |
| `S_Icon` | `ms-ico` | info/必填 |
| 内嵌 B_*（非 atoms） | `bc-eg71-activation-card` + `bc-eg71-form-item-*` | 激活灰卡与表单项经 `MS_BIZ_INDEX[...].render(ctx)` 内嵌调用（镜像 device-list 内嵌 modal 的既有范式） |

ctx 契约：

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.mode` | `'add' \| 'edit'` | `'add'` | add：OTAA 不渲染 DevAddr/AppSKey/NwkSKey 三字段（PRD 移除）；edit：OTAA 三字段只读自动填充 |
| `ctx.activation` | `'otaa' \| 'abp'` | `'otaa'` | 激活类型（edit 可切） |
| `ctx.devEui` | string | `''` | Milesight 判定输入①（`24E124` 前缀） |
| `ctx.model` | string | `''` | 判定输入②（Milesight 型号）；判定结果注入 activation card 的 `ctx.milesight` |
| `ctx.values` | object | 见 render | `{ name, description, model, profile, fPort:1, timeout:1440, frameCheck:false, activation:{mode, appKey}, abp:{devAddr, nwkSKey, appSKey, uplink:0, downlink:0, timeout:1440} }` |

render(ctx) 骨架要点：`.bc-eg71-device-form` → Basic 卡（DevEUI/名称/描述/型号）→ Profiles 卡（配置文件/fPort/超时(min)/帧计数）→ 激活设置灰卡（内嵌 activation-card；abp 态 kind='abp'）→ edit·OTAA：三只读字段（disabled input）→ abp：ABP 参数卡（三密钥 + 三计数器；**默认值态三密钥 disabled、三计数器保持可编辑**——03-ued §4.7）。
bind(root) 骨架要点（**三场景 + 暂存状态机为组件内部逻辑，页面层不参与**——04-dev §3.8/3.9）：

1. 消费内嵌卡的 `eg71-activation-change`：abp + mode='default' → 三密钥置灰（`ms-input--disabled`）；切 custom 恢复；切换全程保留输入（#7/#8）。
2. 场景切换暂存：切换配置文件/型号/激活类型 → 未保存值存入组件内部 stash（per 场景 map）；切回恢复；保存（`eg71-footer-action {action:'save'}` 被宿主转发或直接监听 footer 事件）后清除未激活类型暂存。
3. 值变更统一冒泡 `eg71-device-form-change {dirty, activation, values}`（宿主可持状态重渲染）。
4. ABP 态不显示 AppKey（排除项 2）；OTAA edit 态 AppKey 可编辑。

---

## 5. B_Eg71Modal 四用例逐个核对（SKILL.md v1.0.0 §2 契约逐字段比对）

| 用例 | ctx.action | title | okText | 其余 ctx | 核对结论 |
|---|---|---|---|---|---|
| P1 删除确认 | `'delete'` | 默认「删除确认」/ device-list 传 `'Delete Device'` | `'Delete'` | `desc` 带设备名；**不传 confirmKeyword**（设备删除无需关键词二次校验） | **匹配成立**（device-list 内嵌既有实例，registry:1263） |
| P3 添加设备确认 | `'confirm'` | 覆写（D3 占位） | `'确认'` | `desc` D3 占位；确认后 Toast + 行移除在 ScanDeviceTable bind | **匹配成立**（confirm 变体 = info 图标 + filled 钮） |
| P3 放弃扫描确认 | `'delete'`（危险语义：清空全部未添加设备不可恢复） | 覆写 `'放弃扫描'` | `'放弃扫描'` | **不传 confirmKeyword**（A1 判定无关键字输入，成立——confirmKeyword 是选填，不传则无输入框） | **匹配成立**（delete 变体 = error 图标 + `ms-btn--filled ms-btn--danger` 红实心确认钮，符合 B_ComDangerAction 弹窗矩阵） |
| P3 URL 直入提示 | `'confirm'` | 覆写 | `'确认'` | `desc='请先完成扫描配置，页面即将返回配置步骤。'`；**3 秒定时跳转是页面级流程逻辑**（Modal 契约无倒计时能力，宿主 setTimeout + navigate + close） | **匹配成立**（纯展示型确认） |
| P3 超限拦截 | `'confirm'` | 覆写（D4 文案待确认） | `'确认'` | 提交时触发（D4 默认），在 ScanDeviceTable 添加流程内判定 | **匹配成立** |

**调用契约注意**：`bindEg71Modal(root)` 收敛到 root 内**第一个** `.bc-eg71-modal`——P3 同页 3 个弹窗实例（添加/放弃/超限）必须各放独立 wrapper 容器分别 `bind`；或共用单实例换 ctx 重渲染（二选一，A4 定）。

### 5.2 B_ComDangerAction 调用方式（registry 无运行时条目，按 `_shared` 规范稿 v0.1.0 执行）

- **定位**：`bc-com-danger-action` 待实现（SKILL.md 自标），本轮**不做运行时铸造**，按规范稿消费其规则。
- **放弃扫描（工具栏按钮）**：danger 描边钮 `ms-btn ms-btn--danger`（元素矩阵「描边按钮」三态——base.css 已实现，R3 可过）。
- **确认弹窗**：规范稿 §6 明示「eg71 线确认弹窗实现参照 B_Eg71Modal」→ 用 `B_Eg71Modal action='delete'` 变体承载（红 Result 图标 + 红实心确认钮）；规范文案族（delete/unbind/reset/…）无「放弃扫描」项，用 `title`/`okText` 覆写表达，**不扩 action 枚举**。
- **确认后行为**（规范「确认后行为」条）：结束扫描 → 未添加行（含已忽略）淡出 0.3s 移除 → `S_Message` Toast。淡出时长 0.3s 是规范登记的待收敛裸值。
- **P2 清空按钮**：danger 描边、无确认弹窗（PRD 未要求确认；自定义 Key 可重录，不属「不可恢复」级；Figma 定稿复核此判定）。
- **P1 设备删除**：device-list 既有内嵌 delete 弹窗已按此范式（确认 → 行移除）。

---

## 6. 对 A1 候选的修正记录

| # | A1 原案 | A2 修正 | 依据 |
|---|---|---|---|
| 1 | device-list 扩展②「Scan Add 按钮事件路由化（→P2）」 | **撤销该扩展项**：runtime 已有 `data-device-add="scan"` + `eg71-device-add` 冒泡事件，宿主监听导航即可，注册表零改动 | registry:1228/1347-1351 实测 |
| 2 | ScanBanner atoms 含 `S_Button` | 改为 `S_Icon + S_Badge + S_Typography`，整条可点击走结构类 + data-route 事件（不用按钮元素） | 镜像 protocol-card 同判（嵌套可点元素/非法 a 嵌套，registry:971-973 注释） |
| 3 | ScanAppkeyCard atoms 未列 `S_Tag` | 补 `S_Tag`（计数 N/1000 镜像 bc-count 模式） | device-list 表头计数先例 |
| 4 | ScanEditDrawer atoms 未列 `S_Icon` | 补 `S_Icon`（close 钮/必填） | protocol-detail 骨架对照 |
| 5 | ActivationCard 职责含「槽位置灰联动」 | 联动归 DeviceForm（作用对象在卡外 ABP 区）；本卡只发 `eg71-activation-change`、管自身两字段、切换保留输入 | encapsulation §2 单向数据流 |
| 6 | DeviceForm atoms 含 `S_Radio` 且「内嵌 #6」表述含糊 | 明确：radio 能力经内嵌 `bc-eg71-activation-card`（B_* 内嵌 B_* 镜像 device-list 内嵌 modal 范式）；atoms 表单类经内嵌 `bc-eg71-form-item-*`（镜像 bc-eg71-content 调用式） | registry 既有内嵌范式 |
| 7 | A1 §4.1 把 `bc-eg71-form-item-*` 未列为可复用资产 | 显式列为直接复用（runtime 在册）：DeviceForm / ActivationCard / ScanEditDrawer 的表单项优先经其编排，避免重画 | registry:1360-1494 |
| 8 | 7 铸造 / 2 扩展 / 复用清单 | **全部维持 7+2，无合并/拆分**；仅上述边界修正 | — |

---

## 7. 铸造施工顺序与注册回库 checklist

**先后依赖顺序**（每步完成即注册回库，后续步骤才可引用）：

1. **B_Eg71AlertBar**（零依赖；P2/P3 共用）
2. **B_Eg71ScanBanner**（零依赖；全局元素）
3. **B_Eg71ActivationCard**（依赖存量 form-item-*；被 #8 内嵌，必须先行）
4. **存量扩展双件**：`bc-eg71-form-footer`（ctx.buttons + bind）+ `bc-eg71-device-list`（Join failed）；两者独立于新铸，可与 1–3 并行
5. **B_Eg71ScanAppkeyCard**（依赖 #1 反馈横幅 + #4 footer 联动事件）
6. **B_Eg71ScanEditDrawer**（依赖 protocol-detail 范式 + 存量 form 项）
7. **B_Eg71ScanDeviceTable**（依赖 #6 内嵌 + Modal 复用 + device-list 信号单元迁移）
8. **B_Eg71DeviceForm**（依赖 #3 内嵌 + form-item-* 编排；施工量最大，殿后）

**每个新 B_* 注册回库 checklist**（release.md 通用清单摘录）：registry-business.js 条目（id/cn/cat/desc/atoms/entityHint/tags/render/bind）→ library/business.css 结构类（`bc-eg71-*`，只引令牌）→ `_index.json` 登记 → SKILL.md 8 章节 + frontmatter `version: 1.0.0` → 命名三处一致（naming.md §3）→ demo 纯净性（可见 UI 无评审注记）。

**注册表卫生（随本轮一并治理）**：补登 `_index.json` 缺失条目 `bc-eg71-device-list` + `bc-eg71-form-item-*`×6；补建 SKILL.md 目录 `B_Eg71DeviceList`（随扩展）、`B_Eg71AppCard`、`B_Eg71FormItem*`（可后置，不阻塞施工）；`K_mapping.md` §三 建议回写 eg71 线词条（见下），待确认后执行。

**K_mapping 建议回写词条（§二模块 + §三组件，待用户确认后写入，本轮不擅动）**：

| 需求要素 | 资产 | id |
|---|---|---|
| 全局扫描提示条 | `M_GlobalNotice` / `B_Eg71ScanBanner` | mod-global-notice / bc-eg71-scan-banner |
| 页内引导/异常横幅 | `M_GuideBanner` / `B_Eg71AlertBar` | mod-guide-banner / bc-eg71-alert-bar |
| 扫描 Key 配置 | `M_ScanKeyConfig` / `B_Eg71ScanAppkeyCard` | mod-scan-key-config / bc-eg71-scan-appkey-card |
| 扫描双 Tab 设备表 | `M_ScanDeviceTable` / `B_Eg71ScanDeviceTable` | mod-scan-device-table / bc-eg71-scan-device-table |
| 扫描编辑抽屉 | `M_ScanEditDrawer` / `B_Eg71ScanEditDrawer` | mod-scan-edit-drawer / bc-eg71-scan-edit-drawer |
| 激活设置灰卡 | `M_ActivationCard` / `B_Eg71ActivationCard` | mod-activation-card / bc-eg71-activation-card |
| 设备添加/编辑表单 | `M_DeviceForm` / `B_Eg71DeviceForm` | mod-device-form / bc-eg71-device-form |
| 设备列表（数据服务） | `B_Eg71DeviceList`（存量补登） | bc-eg71-device-list |

---

## 8. A1 决策项（§7 D1–D5）消费结果

D1 用既有 Scan Add 工具栏按钮（零改动）；D2 单设备编辑=同抽屉 `ctx.mode='single'`；D3 两弹窗文案以占位进 ctx，Figma 定稿只换字符串不改结构；D4 超限=提交时拦截（ScanDeviceTable 添加流程内）；D5 超时单位=min（`bc-eg71-form-item-unit` 后缀 `(min)`）。五项均已消化进 §4 契约，无遗留阻塞。
