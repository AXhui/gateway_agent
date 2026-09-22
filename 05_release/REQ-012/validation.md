# REQ-012 · validation（校验留档）

> 本文件承载 demo 之外需要留档的说明（page-assembly §5 纯净性：评审/装配/校验信息一律不进可见 UI）。
> 消费方：A5 还原度校验（R1–R5 + 纯净性）、A6 质量记录。A5 校验结论请追加「交互链缺口（A5）」专节，勿改写本节。

## 交付物信息（A4）

- demo：`05_release/REQ-012/demo.html`（单文件 / 零依赖 / 可离线打开 / hash 路由 5 页）
- 输入契约：`04_pages/REQ-012/page.json`（5 页面 + 全局扫描条 + stateSupplements 10 条 + hostWiring）
- 组件调用方式：全部经 `MS_BIZ_INDEX[...]` / `MS_EG71_SHELL` 按各 SKILL.md §2 组装契约以 ctx 调用；页面层只做模块编排、ctx 注入与宿主事件接线（page-assembly §2）
- 内联资产：`.claude/tokens/tokens.css` + `library/base.css` + `library/business.css` + `assets/js/registry-base.js`（含冻结 Logo 段，逐字节一致）+ `registry-entities.js` + `registry-business.js`
- spacing.md §7 存量偏差四项已按红线在 demo 内就地机械修正（不回写 assets 源头）：
  1. `ico(*, 14)` → `ico(*, 16)`：全量清零（grep 计 0 残留）
  2. 按钮组 `ms-space--8` → `ms-space--12`：8 处交互组替换（bc-data-table 工具栏/表尾、bc-rule-form 按钮组、bc-member-table 工具栏、bc-eg71-alarm 工具栏/表尾、bc-eg71-device-list 工具栏/表尾）；保留 3 处非交互（bc-status-tag 标签组 / bc-rule-form 下拉筛选组 / bc-detail-drawer 标签组）
  3. `.ms-stat-title` 13px → 12px
  4. `.bc-eg71-protocol-card` 竖向 padding 12px → 16px（`var(--spacing-16) var(--spacing-16)`）
- 页面层结构类（`mod-req012-*`）：模块间距 `--spacing-2xl`（24px）、P1/P2/P3 列表/流程页内容区 20px 覆写、吸底操作栏让位、S8 数值项错误描边——全部仅引 L1 令牌，无视觉常量

## 交互链补全（A4）

> 依据 `interaction-completeness.md` §1：PRD 未写但链路必需的状态允许且必须补全，用资产库既有组件补；
> 补全标注【PRD 缺省 · demo 补全】只落本文件，绝不进可见 UI。S1–S10 与 page.json stateSupplements 一一对应。

| # | 页面 | 功能点 | 类别 | PRD 缺什么 | demo 补全形态（用什么组件） |
|---|---|---|---|---|---|
| S1 | P1 | 设备列表加载 | B 链路断 | 首次进入/刷新的加载态 | 【PRD 缺省 · demo 补全】首载 650ms 表格区替换为骨架卡（L2 `S_Skeleton`：`ms-card` + `ms-skeleton` 直组），就绪后重渲染 `B_Eg71DeviceList` 数据态（`ctx.state` 另支持空态切换） |
| S2 | P1 | 设备删除反馈 | B 链路断 | 删除确认后的结果反馈 | 【PRD 缺省 · demo 补全】内嵌 `B_Eg71Modal(action:'delete')` 确认后组件移除行（runtime 既有行为）+ 宿主 Toast「Device deleted」（L2 `ms-message-stack`/`ms-message` 直组；英文文案为最小合理默认，Figma 复核） |
| S3 | P2 | 导入文件解析中 | B 链路断 | 文件选择→结果之间的处理中反馈 | 【PRD 缺省 · demo 补全】导入按钮 `ms-btn--loading` + `disabled`（防重复点击），由 `eg71-scan-keys-change` / `eg71-scan-import-error` 或 2s 兜底恢复 |
| S4 | P2 | 自定义 Key 校验失败 | B 链路断 | 32hex 非法时的失败呈现 | 【PRD 缺省 · demo 补全】`bc-eg71-form-item-msg--error` 行内错误（`B_Eg71ScanAppkeyCard` bind 内置：空值/非法 hex/重复/超限四类文案） |
| S5 | P2/P4/P5 | 表单提交反馈 | B 链路断 | 开始扫描/应用/保存的提交中与成功反馈 | 【PRD 缺省 · demo 补全】主钮 loading 600ms + 成功 Toast「保存成功」/「应用成功」（最小合理默认，Figma 定稿替换字符串）；P2 首次开始扫描的结果态=跳 P3 属 PRD 明写，不属补全。**不发明保存后业务去向**（见下方 C 类口径） |
| S6 | P3 | 扫描表加载/刷新 | B 链路断 | 进入页面与手动刷新的加载反馈 | 【PRD 缺省 · demo 补全】首载骨架（`ms-skeleton`，保留页签与表头结构位）+ 刷新钮 loading + 表体骨架 600ms → 数据态/空态；刷新时更新时间刷新、信号微调（已忽略设备信号与更新时间仍更新 = F07 数据层语义） |
| S7 | P3 | 添加设备提交中 | B 链路断 | 确认弹窗后的批量注册处理中 | 【PRD 缺省 · demo 补全】确认后 Toast「{N}个设备添加成功」（组件内置 S_Message 直组）+ 行 `--duration-normal` 淡出移除 + 池计数联动 + 既有设备数累加；提交时超限拦截（D4）为组件既有分支 |
| S8 | P3 | 编辑抽屉保存校验 | B 链路断 | fPort/超时时间必填与数值校验失败呈现 | 【PRD 缺省 · demo 补全】宿主在组件 bind 前注册保存校验监听（`stopImmediatePropagation` 拦截非法保存：不关抽屉、不冒泡 save），`ms-input-number` 错误描边（`mod-req012-num-error` 引 `--color-error-normal` 令牌）+ `bc-eg71-form-item-msg--error` 行内提示 + 平滑滚动到首个错误项 |
| S9 | P4/P5 | 设备表单校验失败 | B 链路断 | DevEUI/AppKey/ABP 三密钥 hex 校验失败呈现 | 【PRD 缺省 · demo 补全】保存时校验（add：DevEUI 16hex + OTAA custom 模式 AppKey 32hex；edit：OTAA custom AppKey / ABP custom 三密钥 DevAddr 8hex + NwkSKey/AppSKey 32hex），失败 `ms-input--error` + 行内提示 + 滚动首错 + 不进入提交 loading；成功走 S5 |
| S10 | P5 | 编辑页数据回填 | B 链路断 | 进入编辑页的数据加载状态 | 【PRD 缺省 · demo 补全】进入 550ms 骨架 → `B_Eg71DeviceForm` 回填（OTAA 三只读字段由 DevEUI 确定性派生的入网数据：DevAddr 8hex + 32hex 双会话密钥，稳定可回归）；URL 直入无编辑目标时取默认设备回填 |

### 补全实现的边界说明

1. **Toast / 骨架为 L2 直组**：无独立 `S_Message` / `S_Skeleton` 运行时助手，页面层 Toast 与骨架沿用注册表内 `bc-eg71-scan-device-table` bind 的既有同款直组范式（`ms-message-stack` / `ms-skeleton`），未手搓新视觉常量。
2. **数值受控初值**：`B_Eg71ScanEditDrawer` / `B_Eg71DeviceForm` 的 `S_InputNumber` 渲染不落 value 属性（组件 v1.0.0 形态），宿主按受控契约在 bind 后注入初值（fPort=1 / 超时=1440 / ABP 计数器），未改组件源码。
3. **扫描会话模拟**：开始扫描后池初始为「发现 3 台 + 已忽略 1 台」（两 Tab 初始均有数据），其后 6s 节拍从待发现队列入池（上限 7 台种子）；新设备入池时全局提示条红点重燃（03-ued §2.5「扫描到新设备时出现」），在确认页且无勾选/弹窗/抽屉打开时就地刷新表格。
4. **visited 语义**：进入确认页（任意路径）即红点去除转灰态并闩锁，计数保留；仅新设备入池重燃红点。

### C 类口径（demo 未擅自实现，留 A5 判定/评论回流）

1. **保存成功后的业务去向**（P4/P5 是否回设备列表）：PRD 未写，demo 按最小默认「停留当前页 + Toast」。
2. **添加冲突「{N}个设备已存在」**：多用户并发场景单机 demo 无法触发；组件具备该 Toast 文案路径（F06 语义已就位）。
3. **超限 object>20000 分支**：组件超限弹窗实例按 device 分支文案渲染（page.json D4 占位含 object 分支字符串，属宿主触发分支逻辑）。
4. **已忽略 Tab 是否支持行内编辑**（03-ued 待确认 #6）：按 A2/mapping 口径——工具栏【编辑】仅发现 Tab；已忽略 Tab 行内编辑控件按组件契约渲染（字段清单两 Tab 通用）。
5. **侧边栏非本需求路由**（Dashboard/Network 等菜单项）：本 demo 范围 = REQ-012 五页，点击其余菜单不跳转（不发明 REQ-012 之外的页面）。
6. **xlsx 导入**：前端无解析库，组件按契约以 `invalid` 场景冒泡（csv 走真实 FileReader 解析：表头/数量/非法校验生效）；真实解析由宿主接后端。

## 自检记录（A4 出厂）

- `node --check`：两段 `<script>`（注册表 + 页面层）语法均通过。
- jsdom 全流程冒烟 42 步全过、零运行时错误（5 页路由 / F01–F15 关键链路 / S1–S10 补全态 / 交互 #6–#9）。
- 纯净性：剥离 script/style 后可见文案 grep「按 PRD / 点击查看 / 点击卡片 / 点击配置 / 组件映射 / Powered by / 评审 / PRD 缺省 / demo 补全 / 校验徽标」零命中。
- spacing §7 四项修正 grep 见「交付物信息」；冻结 Logo 段与 `registry-base.js` 源头逐字节一致。
- 零外链：无任何 http(s) 资源引用（图片均为 data URI，图标全量内联 `MS_ICONS`）。

---

# A5 校验报告（还原度校验 · 2026-09-22）

> 校验者：ued-a5-validator。规则基线：`.claude/knowledge/K_validation.md`（权重唯一口径）+ `rules/spacing.md`（R1 红线映射表 + §7 存量偏差清单）+ `rules/page-assembly.md §5`（纯净性）+ `rules/interaction-completeness.md §1–§2`（R5 判定表 + 缺口分类），四份均已读后开检。
> 校验对象：`05_release/REQ-012/demo.html`（9763 行）× `04_pages/REQ-012/page.json`。计分口径：R1–R4 加权 + R2b/纯净性一票否决；R5 附加不占总分、带退回权（K_validation「使用时机」）。

## 一、五维结论总览

| 规则 | 权重 | 得分 | 结论 |
|---|---|---|---|
| R1 令牌合规率 | 30 | **30** | **通过**。§7 四项修正逐项复核全部落实；A4 产出层（页面层 CSS/JS、REQ-012 新组件段）零违规；源头存量偏差另行上报（见 1.4，不计分理由见该节） |
| R2 组件溯源率 | 30 | **30** | **通过**。117 个严格类名（ms-/bc-/mod-/is-）逐一反查，0 未溯源 |
| R2b L3 复用率 | 一票否决 | — | **PASS，未触发**。形态签名 `ms-modal` + `ms-btn--danger` 仅由入口函数 `renderEg71Modal`（及 `MS_BIZ_INDEX['bc-eg71-modal'].render` 调用链）产出；页面层零手写业务形态 |
| R3 依赖闭环率 | 25 | **25** | **通过**。10 个 B_* 的 atoms 去重 25 项全部在 `_index.json` 已封装（table 为派生原子，dir:null 属既有口径） |
| R4 结构覆盖率 | 15 | **15** | **通过**。page.json 18 个模块槽（含 M_GlobalNotice×5 挂载位）全部在 demo 落地 |
| 纯净性 | 一票否决 | — | **PASS**。可见 UI 扫描零命中；全部模式命中均为 JS/CSS 注释或注册表 catalog 元数据（desc/tags/skill 字段，不进 render 输出） |
| R5 交互链完整性 | 附加·带退回权 | — | **通过**。F01–F15 逐链核对；B 类断链 S1–S10 共 10 条全部已补全（代码实证）→ 不退回。**另发现 1 项 P1 级整改项（非断链，见四）** |
| **总分（R1–R4 加权）** | 100 | **100** | |

## 二、R1 令牌合规（30/30）——证据

### 2.1 §7 存量偏差四项修正复核（A4 声称，逐项验证）

| # | 声称 | 复核结果 | 证据 |
|---|---|---|---|
| 1 | `ico(*,14)` → 16 全量清零 | **属实** | demo 内 `ico(*,14)` 残留 grep = 0（源头 registry-business.js 为 42 处）；demo 内 ico() 尺寸分布：16×99 / 20×15 / 24×4 / 32×5（+1 处 12，见 2.4） |
| 2 | 按钮组 `ms-space--8` → `--12` 共 8 处交互组 | **属实** | 与源头拼接 diff 精确命中 8 个替换 hunk（data-table 工具栏/表尾、rule-form 按钮组、member-table 工具栏、device-list 工具栏/表尾等）；保留 3 处非交互（bc-status-tag 标签组 / rule-form 下拉筛选组 / detail-drawer 标签组），均在未渲染组件内 |
| 3 | `.ms-stat-title` 13px → 12px | **属实** | demo L731：`font-size: 12px`（源头 library/base.css 为 13px） |
| 4 | `.bc-eg71-protocol-card` 竖向 padding 12→16 | **属实** | demo L1397：`padding: var(--spacing-16) var(--spacing-16)`（源头为 `--spacing-12 --spacing-16`） |

**内联资产与源头的全量 diff（方法：`cat tokens.css base.css business.css` / `cat registry-base.js registry-entities.js registry-business.js` 分别与 demo style 块 / script#1 逐行 diff）**：全部差异 = §7 四项修正 + 拼接空行 + 注释行标记更新（×41→×16）+ 页面层 mod-req012-* 13 行，**无任何其他改动**。`registry-base.js` 段（含冻结 Logo 段）逐字节一致——「冻结 Logo」声明属实。

### 2.2 裸色值

- `:root` / `[data-theme="dark"]` 令牌定义段（L21–409）的 hex 为 L1 真源，合法。
- 令牌定义段之外，hex 仅出现在 `.bc-eg71-sidenav` 深色侧边栏块（demo L1223–1315），为 library/business.css **源头既有值**，带「Figma color-bg-6 写死、不随 data-theme 切换、仅本组件作用域」注释豁免，且 page.json 声明「壳资产冻结零改动」。A4 层零新增裸色值。
- `rgb(/rgba(` 仅存在于令牌定义（shadow/surface 系）。demo JS 模板串零内联色值；页面层零 `style=` 内联（JS 内仅 2 处 `style=`，均在未渲染的 dashboard/protocol-detail 组件源头）。

### 2.3 间距 / 图标 / 字号（A4 产出层）

- 页面层结构类 `mod-req012-*` 四项全部只引 L1 令牌：模块 gap `--spacing-2xl`(24，模块 ≥24 达标)、listflow 20px（AGENTS 壳契约「列表/流程类页单卡片四周 20px」明文覆写，非违规）、withfooter `--spacing-64`、num-error 仅 `--color-error-normal`。
- REQ-012 七新组件 CSS 段（L1808–1901）全部 token 引用；16px 图标均以 `--spacing-24` 撑 24px 热区（alert-close / scan-key-del），符合 spacing §3 无障碍热区要求。
- 图标阶梯：16/20/24/32 全在 16–44 阶梯内。

### 2.4 源头存量偏差候选（不计分，建议补入 spacing.md §7 清单）

按 §7「运行时层保留源头原值、已知偏差以清单为准就地修正」的同步契约，以下为**清单外**的源头存量（与清单既列 4 项同性质，A4 依约未擅改；建议按「两边同维护」机制补入清单后由下一轮 A4 统一修正）：

1. `ico('chevronRight', 12)`（面包屑分隔符，冻结壳 topnav）：12px 命中 §3「装饰性微标」例外（不承载独立交互），**可豁免**；建议源头统一升 16。
2. L2 base.css 多处 13px 字号（`.ms-table td`、`.ms-btn--sm`、`.ms-alert`、`.ms-message`、`.ms-breadcrumb`、`.ms-pagination` 等约 25 处）与 `.ms-h1/.ms-h2/.ms-h3` = 28/22/18px（spacing §4 阶梯为 30/24/20）：§7 清单仅收录 `.ms-stat-title` 一处 13px，其余未列。P1/P3 表格正文实际以 13px 渲染（`.ms-table td`）。**不计分理由**：全部为 library 源头逐字节一致值（diff 证实 A4 零改动），修正属源头/清单层动作，非 A4 执行偏差；与 K_validation 样例基线（同 base.css 内联 → R1 100）口径一致。
3. `.bc-eg71-form-item-btnrow` gap `--spacing-8`（按钮与相邻下拉 8px < 红线 12px）：源头 business.css 值；本 demo 中该类仅出现于 `bc-eg71-form-item-input-button` / `bc-eg71-form-item-button` 两个**未被 REQ-012 页面调用**的独立组件，可见 UI 未渲染，无实际违规。

## 三、R2 / R2b / R3 / R4 / 纯净性——证据

### 3.1 R2 组件溯源（30/30）

- 提取 demo 全部 `class="..."` 534 个原始 token，严格过滤（ms-/bc-/mod-/is- 前缀）得 **117 个类名**，逐一反查 demo style 块选择器 + `assets/js/registry-{base,business,entities}.js`：**0 未溯源**。
- 10 个契约引用 B_* 在 `_index.json`（status 全部「已固化」）、`registry-business.js`、SKILL.md frontmatter **三处一致**（含 B_Eg71DeviceList 1.1.0 / B_Eg71FormFooter 1.1.0 两个 minor bump 与 7 个 1.0.0 新铸造组件，铸造已回库——page-assembly §3 补位路径合规）。
- 页面层自有类仅 `mod-req012-{flow,listflow,withfooter,num-error}` 4 个 + 4 个 `id="mod-req012-*"` 挂载点，属 page-assembly §6 允许的页面级纯结构/状态钩子。

### 3.2 R2b L3 复用（一票否决：PASS）

- 按 K_validation 形态签名表扫描：`ms-modal` + `ms-btn--danger` 组合在页面层（L8935–9761）**零出现**；该形态唯一产出点是注册表内入口函数 `renderEg71Modal(ctx)`（demo L8778–8804），页面层 4 处弹窗（P3 添加/放弃/超限三实例经 `bc-eg71-scan-device-table` render 内嵌、URL 守卫经页面层 `B['bc-eg71-modal'].render` 调用）全部走入口。无 `xxxConfirmHtml()` 类手搓函数。
- 页面层三处 L2 直组均有依据、非调度器形态：`toast()`（ms-message-stack/ms-message，与注册表 bc-eg71-scan-device-table bind 内 L8354–8363 同款范式，逐行同构）、`skeletonCard()`（ms-card+ms-skeleton 补全态）、`markFieldError()`（复用已注册 `bc-eg71-form-item-msg--error` 类做 S8/S9 行内错误）。按签名表维护约定（仅调度器类 B_* 入表；L2 直组允许页面层组合）不构成自我生产。
- **观察（不判罚，建议回流）**：`bindActivationLive()`（页面层 L9354–9377）在 DevEUI 输入时实时重判 Milesight 并切换单选禁用态。page.json milesightRule 声明「判定在 L3 内」；实际 L3 仅在 render 时判定初值，**输入中的实时重判由页面层补位**（仅操作 L3 已渲染 DOM 的已注册类，未产生新形态）。建议后续将该 live 判定下沉 B_Eg71DeviceForm（minor bump），消除页面层越界补位。

### 3.3 R3 依赖闭环（25/25）

10 个 B_* atoms 声明 → 去重 25 项 → 全部在 `_index.json` components 中已封装：button / table(派生) / checkbox / tag / icon / pagination / empty / modal / affix / space / result / input / radio / badge / typography / upload / alert / tabs / message / drawer / form / input-number / select / switch / card。对应 ms-* 运行时类均在 demo 内联 base.css 存在。内嵌链（DeviceForm 内嵌 ActivationCard + form-item 系、DeviceList/ScanDeviceTable 内嵌 Modal）镜像 registry 既有范式，闭合。

### 3.4 R4 结构覆盖（15/15）

page.json 18 模块槽 vs demo 落地（页面层 L9229–9305 实证）：

| 页 | 模块槽 | demo 落地 |
|---|---|---|
| 共享 | M_GlobalNotice（P1–P5 挂载位） | `bannerHtml()` 每页首模块，scanning=false 返回空串整条不挂载 ✓（5/5） |
| P1 | M_DeviceList（含内嵌 delete-confirm） | `B['bc-eg71-device-list'].render` ✓（内嵌 Modal 在组件 render L6228） |
| P2 | M_ScanKeyConfig / M_AlertBar / M_FormFooter | appkey-card render ✓ / alert-bar（importError 时）✓ / footer（buttons 化 ctx）✓ |
| P3 | M_GuideBanner / M_ScanDeviceTable（3 内嵌 Modal）/ M_ScanEditDrawer / M_ScanEditSingle / M_UrlGuardModal | alert-bar(info) ✓ / scan-device-table（add/abandon/limit 三 Modal 内嵌）✓ / `#mod-req012-drawer-multi` ✓ / `#mod-req012-drawer-single` ✓ / `#mod-req012-guard` ✓ |
| P4/P5 | M_DeviceForm（内嵌 ActivationCard）/ M_FormFooter | device-form render（otaa/abp 块 + actCard 内嵌）✓ / formFooterHtml ✓ |

18/18 落地。**观察**：P3 三内嵌弹窗文案取组件内置默认（demo L8335–8337），与 page.json D3 占位文案（visibleCopy）措辞有差——组件未开放 modal ctx 覆写，两套均为待定稿占位、形态等价，仅换字符串级别差异，不构成结构缺口；Figma 定稿时以组件文案槽为准统一。

### 3.5 纯净性（一票否决：PASS）

剥离 script/style 后可见文案模式扫描（按 PRD / 点击…查看 / 点击卡片 / 点击配置 / 交互指引 / 评审 / 组件映射 / Powered by / 校验徽标 / 生成水印 / PRD 缺省 / demo 补全 / 占位 / 待确认 / 定稿 / 仅提供 / REQ-012 等）：全部命中落位为 ① JS/CSS 注释（L1809/1904/8937/8943 等）② 注册表 catalog 元数据字段（`desc`/`tags`/`skill`，L2317/2355/6126/6127 等，不进 render 输出，页面层无任何 `.desc/.tags` 渲染调用）。**可见 UI 零命中**。A4 自检声明的 jsdom 文本扫描结论与静态扫描互证一致。

## 四、R5 交互链完整性（附加 · 通过，含 1 项整改）

### 4.1 F01–F15 逐链结论

| 流 | 链路四段核对 | 结论 |
|---|---|---|
| F01 扫描入网 | 入口 P1 Scan Add（组件既有事件）→ P2 勾选/导入/逐条输入（canStart 置灰联动、4 类失败横幅、Key 行内校验）→ 开始扫描 loading 600ms → 跳 P3；扫描中重进 label=应用、Key/已扫设备保留（SCAN 会话单例） | A 完整 |
| F02 放弃扫描 | danger 钮 → B_Eg71Modal action=delete（红图标+红实心确认钮）→ 行淡出 240ms + 宿主 320ms 结束会话回 P1 + 提示条消失 | A 完整 |
| F03 扫描中重进 | 应用 → loading + Toast「应用成功」+ footer 重渲染；会话数据保留 | A 完整 |
| F04 全局提示条 | 每页首模块、active/visited 双态、键盘可达（Enter/Space）、visited 闩锁、新设备入池红点重燃（discoverTick 置 visited=false） | A 完整 |
| F05 入网失败展示 | STATUS 增 'Join failed'(error) + failReason 问号图标 + hover 气泡（key_error/no_join_accept 两值之外不渲染，L6177） | A 完整 |
| F06 添加设备 | 勾选（单/多/全选 indeterminate）→ 确认弹窗 → Toast「{N}个设备添加成功」+ 行淡出 + 池计数联动 + P1 Total 同源累加；超限提交时拦截（existing+selected>2000 → limit Modal） | A 完整（冲突 Toast 与 object 分支见缺口 C11/C4） |
| F07 忽略流转 | 行/勾选忽略、取消忽略 → rows[].ignored 切换重渲染、页签计数更新、被忽略设备信号/时间随刷新更新 | A 完整 |
| F08 行内编辑 | name/description blur、model 下拉即选 → eg71-scan-row-edit 就地入池 | A 完整 |
| F09 单/多编辑 | 操作列/工具栏 → 抽屉（single 7 字段含 DevEUI 只读 / multi 4 字段、profiles 过滤 ABP）→ S8 校验拦截（stopImmediatePropagation 先注册先触发）→ 保存应用全部目标 + 关抽屉 + 刷新 | A 完整 |
| F10 URL 直入守卫 | 非扫描中入 P3 → 守卫弹窗 + 3s 定时跳 P2（宿主 setTimeout + navigate + close） | A 完整 |
| F11 导入文件 | S3 loading + csv FileReader 真解析（表头/数量/非法）→ 4 类失败横幅（count 场景拼 remaining）/ 入列表不去重 | **B→已补全；但 size 门槛实现缺陷见 4.2** |
| F12 清空 | danger 描边直接清空、计数归零、空态、默认 Key 勾选不动（无确认，见缺口 D1） | A 完整（口径见 D1） |
| F13 激活设置 | 灰卡单选 + 32hex 校验（输入即时 error）+ 非 Milesight 默认值 disabled（render 判定 + 页面层 live 补位，见 3.2 观察）+ 切换保留输入（#8：切换只读输入框取当前值） | A 完整 |
| F14 三场景+暂存 | stash Map（key=activation:profile:model）切回恢复、保存清除（eg71-footer-action save → stash.clear）、ABP 默认值三密钥置灰联动（消费 eg71-activation-change） | A 完整 |
| F15 设备删除 | 行内 Delete → 内嵌 delete Modal → 行移除 + Toast「Device deleted」（S2） | A 完整 |

S1–S10 补全态全部在代码中实证（骨架 650/550ms、loading/disabled、错误描边+行内提示+滚动首错、Toast 文案、URL 直入默认设备回填）。

### 4.2 整改项（P1 级缺陷，建议修复——非断链、不触发强制退回）

**导入文件大小门槛：实现 5M ≠ 契约 1M。**
- 证据：demo L8113 / 源头 `assets/js/registry-business.js` L3194 均为 `if (f.size > 5 * 1024 * 1024) return fail('size')`；而 page.json `limits.importFileSize: "1M"`、M_AlertBar 文案「文件超过1M无法上传」。
- 影响：1–5MB 的 csv 在 demo 中会正常解析导入而非触发 size 横幅，F11 的 PRD 限制行为失真。
- 定性：链路（size 失败态）存在、门槛常量错——属 B_Com... 即 B_Eg71ScanAppkeyCard 组件源头缺陷（铸造时引入），非 A4 装配错误。
- 建议：源头 `registry-business.js` 该行改为 `1 * 1024 * 1024`，SKILL.md bump patch（1.0.1），A4 重新内联该段（一行机械替换）；可与 §7 清单候选项（2.4）合并为一次源头维护。

## 五、交互链缺口（A5）

> 按 `interaction-completeness.md` §2 分类。**本节为 A6 多维表格台账 + PRD 评论回写的唯一输入**；「建议话术」可直接作为评论正文（补 Demo 预览链接后发送）。
> 素材：03-ued §8 待确认 10 项 + 04-dev §8 疑点 10 条 + A4 留档 C 类口径 6 条（任务书写 5，以 validation.md 留档 6 为准），去重合并后 B 10 / C 17 / D 3，共 **30 条**。

### B 类 · 链路断（demo 已补全 → 记 issue，评论「建议补充」）

| # | 功能点 | 缺什么 | demo 处理 | 建议给 PRD 的话术 |
|---|---|---|---|---|
| B1 | P1 设备列表加载 | 首次进入/刷新的加载态 | 已补全：650ms 骨架卡（L2 S_Skeleton 直组）→数据态/空态 | 【UED 反馈 · REQ-012】功能点「设备列表」：链路缺口——PRD 未描述列表加载中状态。Demo 处理：已补全（骨架屏过渡）。建议：PRD 补充加载态描述与口径。Demo 预览：<链接> |
| B2 | P1 设备删除反馈 | 删除确认后的结果反馈 | 已补全：确认后行移除 + Toast「Device deleted」 | 【UED 反馈 · REQ-012】功能点「设备删除」：链路缺口——PRD 未写删除后的结果反馈。Demo 处理：已补全（行移除 + 全局提示）。建议：PRD 补充删除成功/失败反馈口径。Demo 预览：<链接> |
| B3 | P2 导入解析中 | 文件选择→结果之间的处理中反馈 | 已补全：导入钮 loading+disabled 防重复，事件或 2s 兜底恢复 | 【UED 反馈 · REQ-012】功能点「AppKey 导入」：链路缺口——PRD 未描述文件解析中的反馈。Demo 处理：已补全（按钮 loading）。建议：PRD 补充解析中状态。Demo 预览：<链接> |
| B4 | P2 自定义 Key 校验失败 | 32hex 非法的失败呈现 | 已补全：行内 error（空值/非法 hex/重复/超限四类文案） | 【UED 反馈 · REQ-012】功能点「自定义 AppKey」：链路缺口——PRD 只写限制未写失败反馈形态。Demo 处理：已补全（行内错误提示）。建议：PRD 补充校验失败文案。Demo 预览：<链接> |
| B5 | P2/P4/P5 表单提交反馈 | 开始扫描/应用/保存的提交中与成功反馈 | 已补全：主钮 loading + 成功 Toast（「保存成功」/「应用成功」为最小合理默认） | 【UED 反馈 · REQ-012】功能点「表单提交」：链路缺口——PRD 仅写跳转、无反馈描述。Demo 处理：已补全（loading + Toast，文案待定稿）。建议：PRD 补充提交反馈与文案。Demo 预览：<链接> |
| B6 | P3 扫描表加载/刷新 | 进入页面与手动刷新的加载反馈 | 已补全：首载骨架（保留页签表头）+ 刷新钮 loading + 表体骨架 600ms | 【UED 反馈 · REQ-012】功能点「扫描确认页列表」：链路缺口——PRD 未描述加载/刷新反馈。Demo 处理：已补全（骨架 + 刷新 loading）。建议：PRD 补充。Demo 预览：<链接> |
| B7 | P3 添加设备提交中 | 确认弹窗后的批量注册处理中 | 已补全：Toast「{N}个设备添加成功」+ 行淡出移除 + 计数联动 | 【UED 反馈 · REQ-012】功能点「添加设备」：链路缺口——PRD 未写确认后的处理中状态。Demo 处理：已补全（Toast + 行移除动画）。建议：PRD 补充。Demo 预览：<链接> |
| B8 | P3 编辑抽屉保存校验 | fPort/超时必填与数值校验失败呈现 | 已补全：失败不关抽屉不冒泡 + 错误描边 + 行内提示 + 滚动首错 | 【UED 反馈 · REQ-012】功能点「编辑设备抽屉」：链路缺口——PRD 只写约束未写失败呈现。Demo 处理：已补全（error 态 + 行内提示）。建议：PRD 补充校验文案。Demo 预览：<链接> |
| B9 | P4/P5 设备表单校验失败 | DevEUI/AppKey/ABP 三密钥 hex 校验失败呈现 | 已补全：ms-input--error + 行内提示 + 滚动首错 + 不进提交 loading | 【UED 反馈 · REQ-012】功能点「LoRaWAN 设备表单」：链路缺口——PRD 只写长度限制。Demo 处理：已补全（error 态族）。建议：PRD 补充各字段校验失败文案。Demo 预览：<链接> |
| B10 | P5 编辑页数据回填 | 进入编辑页的数据加载状态 | 已补全：550ms 骨架 → 回填（OTAA 三只读字段 DevEUI 确定性派生，稳定可回归） | 【UED 反馈 · REQ-012】功能点「设备编辑页」：链路缺口——PRD 未描述数据加载态。Demo 处理：已补全（骨架 → 回填）。建议：PRD 补充。Demo 预览：<链接> |

### C 类 · 描述不完整/矛盾（demo 按字面或最小默认 → 记 issue，评论「需要澄清」）

| # | 功能点 | 缺什么 | demo 处理 | 建议给 PRD 的话术 |
|---|---|---|---|---|
| C1 | 扫描入口（P1） | 入口控件形式与位置 PRD 未写（03-ued §8#1） | 按既有工具栏【Scan Add】按钮（D1，注册表零改动） | 【UED 反馈 · REQ-012】功能点「扫描入口」：需要澄清——进入扫描配置页的入口控件形式与位置 PRD 未写明。Demo 按设备数采页工具栏【Scan Add】实现，请确认。Demo 预览：<链接> |
| C2 | 单设备编辑形态（P3） | 弹窗/抽屉/页面未明说（03-ued §8#2，有 Figma 截图） | 抽屉同壳 single 态（D2，与多设备编辑交互一致） | 【UED 反馈 · REQ-012】功能点「单设备编辑」：需要澄清——编辑形态 PRD 未明说。Demo 按右侧抽屉（同壳 single 态，有 Figma 截图佐证）实现，请确认。Demo 预览：<链接> |
| C3 | 确认弹窗文案族（P3） | 添加/放弃/超限/URL 守卫四弹窗文案 PRD 未给（03-ued §8#3） | 组件内置占位产品文案渲染（与 page.json D3 占位措辞有差、形态等价，定稿仅换字符串） | 【UED 反馈 · REQ-012】功能点「确认弹窗」：需要澄清——四处弹窗文案 PRD 未给。Demo 当前为占位文案，请提供定稿文案（仅换字符串不改结构）。Demo 预览：<链接> |
| C4 | 超限提示（P3） | 触发时机（勾选时/提交时）与文案未定；object>20000 分支（03-ued §8#4 + 04-dev §8#9） | 提交时拦截 + device 分支文案；object 分支占位未实现（宿主分支逻辑，单机无对象数据） | 【UED 反馈 · REQ-012】功能点「超限提示」：需要澄清——超限（设备>2000/对象>20000）触发时机与双分支文案未定。Demo 按提交时拦截 + 设备分支文案实现，请确认时机与定稿文案。Demo 预览：<链接> |
| C5 | 信号三档阈值（P1/P3） | SNR/RSSI 阈值数值 PRD 未给（03-ued §8#5） | 沿用设备数采页既有信号列三档实现，种子数据直接给档位 | 【UED 反馈 · REQ-012】功能点「信号强度展示」：需要澄清——三档 SNR/RSSI 阈值数值未给。Demo 沿用既有信号列实现（数据层直接给档位），请提供阈值取值。Demo 预览：<链接> |
| C6 | 已忽略 Tab 编辑范围（P3） | 是否支持行内编辑与【编辑】操作（03-ued §8#6） | 行内编辑按字段清单两 Tab 通用渲染；工具栏【编辑】仅发现 Tab（A2 口径） | 【UED 反馈 · REQ-012】功能点「已忽略设备」：需要澄清——已忽略 Tab 的行内编辑与【编辑】操作范围两处描述含糊。Demo 按字段清单两 Tab 通用、工具栏【编辑】仅发现 Tab 实现，请确认。Demo 预览：<链接> |
| C7 | 超时时间单位 | 1440 单位疑似分钟（03-ued §8#7 + 04-dev §8#6） | 按分钟（D5，字段标签「超时时间 (min)」） | 【UED 反馈 · REQ-012】功能点「超时时间」：需要澄清——默认 1440 的单位 PRD 疑为分钟未确认。Demo 按分钟实现，请确认。Demo 预览：<链接> |
| C8 | 空态提示归属（P3） | 「扫描进行中，离开此页面不会打断扫描」归属页原文含糊（03-ued §8#9） | 按扫描确认页 found Tab 空态实现（保留表头） | 【UED 反馈 · REQ-012】功能点「扫描空态」：需要澄清——该空态文案归属页面原文略含糊。Demo 按扫描确认页空态实现，请确认。Demo 预览：<链接> |
| C9 | OTAA 添加页未入网字段 | DevAddr/会话密钥是否完全不展示（03-ued §8#10） | 按 PRD 字面移除（添加态不渲染三只读字段） | 【UED 反馈 · REQ-012】功能点「激活设置」：需要澄清——OTAA 添加页未入网阶段 DevAddr/会话密钥是否完全不展示。Demo 按字面移除，请确认。Demo 预览：<链接> |
| C10 | 保存成功后业务去向（P4/P5） | 是否回设备列表 PRD 未写（A4 留档 C1） | 最小默认：停留当前页 + Toast | 【UED 反馈 · REQ-012】功能点「设备保存」：需要澄清——保存成功后的页面去向 PRD 未写。Demo 按停留当前页 + Toast 实现，请明确。Demo 预览：<链接> |
| C11 | 添加冲突提示（P3） | 多用户并发「{N}个设备已存在」触发条件（A4 留档 C2） | 组件具备该 Toast 文案路径，单机 demo 无法触发演示 | 【UED 反馈 · REQ-012】功能点「添加设备」：需要澄清——并发冲突「{N}个设备已存在」的触发与不拦截口径。Demo 已内置该 Toast 路径（单机不可触发），请确认文案与行为。Demo 预览：<链接> |
| C12 | 导入解析位置与 xlsx（P2） | 前端 or 后端解析（04-dev §8#8 + A4 留档 C6） | csv 前端 FileReader 真解析（表头/数量/非法校验生效）；xlsx 前端无解析库按契约冒泡 invalid | 【UED 反馈 · REQ-012】功能点「AppKey 导入」：需要澄清——导入解析归属（前端/后端）及 1M/1000 条校验位置。Demo：csv 前端解析、xlsx 按无效冒泡由宿主接真实解析，请明确。Demo 预览：<链接> |
| C13 | DevAddr 生成位数（P5 回填数据） | 「第10至16位=7位」vs 步骤3「6位字符」矛盾（04-dev §8#1） | demo 回填用 DevEUI 确定性派生 8hex，不依赖该规则（纯展示层） | 【UED 反馈 · REQ-012】功能点「ABP 默认参数」：需要澄清——DevAddr 截取规则两处矛盾（7 位+校验位 vs 6 位）。Demo 展示层用确定性派生值不受影响，请产品确认生成规则。Demo 预览：<链接> |
| C14 | 会话密钥取值关系（P5 回填数据） | NwkSKey/AppSKey 是否同值、拼接方式（04-dev §8#2+#3） | 各自确定性派生（稳定可回归，纯展示层） | 【UED 反馈 · REQ-012】功能点「ABP 默认参数」：需要澄清——两把会话密钥取值是否彼此相同、动态密钥「DevEUI+DevEUI」是否直接拼接。请明确生成规则。Demo 预览：<链接> |
| C15 | 【应用】Key 即时性（F03） | 扫描中新增 Key 是否即时参与后续 MIC 匹配（04-dev §8#7） | 模拟会话不区分（新设备继续入池、已扫设备匹配 Key 保留） | 【UED 反馈 · REQ-012】功能点「扫描中应用配置」：需要澄清——新增 AppKey 是否即时参与后续 MIC 匹配。Demo 按会话不中断、已扫设备 Key 保留实现，请明确。Demo 预览：<链接> |
| C16 | 既有状态枚举（P1） | 设备数采页完整状态枚举未列出（03-ued §8#8） | Online/Offline/Not activated/Join failed 四态齐（含新增） | 【UED 反馈 · REQ-012】功能点「设备状态列」：需要澄清——设备数采页既有状态完整枚举。Demo 渲染 Online/Offline/Not activated + 新增 Join failed，请提供完整枚举对齐。Demo 预览：<链接> |
| C17 | demo 范围声明（侧边栏） | 非本需求路由点击去向（A4 留档 C5） | 点击其余菜单不跳转（demo 范围 = REQ-012 五页） | 无需评论回写（demo 范围内闭环声明，非 PRD 缺口；A6 台账可跳过本条） |

### D 类 · 隐含缺失（PRD 没提但产品必需 → 记 issue，评论「建议 PRD 增补」）

| # | 功能点 | 缺什么 | demo 处理 | 建议给 PRD 的话术 |
|---|---|---|---|---|
| D1 | 清空自定义 Key（P2） | 破坏性操作是否需二次确认，PRD 未提 | 按无确认直接清空（mapping §4.2 口径，Figma 复核） | 【UED 反馈 · REQ-012】功能点「清空 AppKey」：建议 PRD 增补——「清空」为破坏性操作，是否需要二次确认。Demo 当前按无确认实现（仅清自定义 Key、不动默认勾选）。Demo 预览：<链接> |
| D2 | 无型号设备对象规则（P3） | 「无型号不添加对象」设备是否仍注册、「对象」定义与上限（04-dev §8#4+#5） | 未实现对象区分（按普通添加渲染，前端无对象数据） | 【UED 反馈 · REQ-012】功能点「添加设备」：建议 PRD 增补——无型号(None)设备「注册但不添加对象」的注册口径、以及「对象」的精确定义与单设备对象数上限。Demo 未实现该分支（按普通添加）。Demo 预览：<链接> |
| D3 | 已忽略设备与池覆盖（P3） | 2000 覆盖最旧时忽略态设备可否被覆盖（04-dev §8#10） | 未实现覆盖演示（种子远小于上限） | 【UED 反馈 · REQ-012】功能点「扫描确认池」：建议 PRD 增补——池满 2000 覆盖最旧时，已忽略态设备是否可被覆盖。Demo 未演示该分支。Demo 预览：<链接> |

## 六、结论与后续

1. **五维总分 100/100**（R1 30 + R2 30 + R3 25 + R4 15）；R2b 与纯净性两个一票否决项均 PASS；R5 附加项通过（B 类 10 条全部已补全，不触发退回）。
2. **无强制退回项**。1 项 P1 级整改建议（4.2 导入门槛 1M/5M，组件源头一行修复 + patch bump + A4 重内联）；2 项回流建议（bindActivationLive 下沉 L3；spacing §7 清单补 2.4 三条候选）。
3. **A6 输入**：第五节缺口清单 30 条（B 10 / C 17 / D 3；其中 C17 无需评论回写，实际可评论 29 条）。PRD 源链接见 `source.txt`（飞书 docx）；台账 URL 配置源 `tools/feishu_issue_table.txt`（未配置则降级模式，仅警告不阻断）。
4. 独立复核补充：两段 script `node --check` 通过；零外链 grep = 0（A4 自检声明属实）。
