# REQ-023 · UG6X LoRa Mesh — validation

> PRD：飞书 wiki `QK6RwHDmuidau8kg3yEcGBKPnad`（UG6X LoRa Mesh，2026-11-13 拉取，source.txt 存源链接）。
> Figma：71.0.0.5（12 页截图全量分析）。**样式以 Figma 为主**（用户指令）。
> 交付物：`05_release/REQ-023/demo.html`（681,784 B 单文件，5 源内联 + 页面编排 JS）。

## 一、装配完整性自检（assembly-integrity.md §2）

- 首尾字节 diff：5 内联块 head64 全 OK（tokens / base / business / registry-base / page），registry-business head64 OK（含 §7 修正后源）。
- 标签平衡：`<style>` 1/1、`<script>` 3/3。
- 令牌活性断言：`--spacing-24` 计算值非空（浏览器实测 check #1）。
- 修正落地：ico14→16 ×36；`ms-space--8`→`--12` 8/8 行；`.ms-stat-title`/`.ms-empty-text` 13px→12px；`.ms-ico--12` 补规则；protocol-card 竖向 padding 12→16。
- 契约级内联修正（均仅改 demo 内联副本，不回写 assets 源头，spacing.md §7 惯例）：
  1. Tab 契约（AGENTS.md）：`.ms-tabs` gap 24→32、定高 48、active/hover 文字改 `--color-text-primary`；
  2. Alert 持久性契约：成功 toast 落右下角（`.ms-message-stack` 顶中→右下）；
  3. 吸底操作栏锚定：`.ms-affix` 静态位在视口外（壳 flex 第三项 w=0 缺陷，REQ-016 同源），左右钉到 220px 侧栏右缘——修复后截图 01 实证 footer 完整在视口内、右对齐主列。

## 二、三角色验收（scoring.md §0）

### UED（structure / visual）

- [U1-1] demo.html 脚本④ 证据｜AGENTS.md 壳契约｜唯一壳 `MS_EG71_SHELL` render+bind 各 1 次，navGroups 未改（`/lora`、`/data-services` 入口既有）｜0
- [U2-1] mapping.md §二 × 浏览器 41 检查｜R4 结构覆盖｜A1-A8/B1-B8/C1-C3/D1/S1-S2 全部落地：tabs×3、role/config/forward/module 卡、footer、modal、toast、fleet members(392)/neighbors(312)/edit/detail 抽屉、delete 弹窗、flow×2、frames ns/raw｜0
- [U2-2] /lora/general 页面｜Figma 页 1 顺序｜卡片序 Deployment Mode → Mesh Configuration → Forwarding Destination → Frequency Plan，与设计稿一致；设置类=多区块卡片、Fleet/Stream=单卡，页面类型形态正确｜0
- [U3-1] 截图 01/03/09 AI 视觉核验｜§3 基准一级（Figma）｜footer 完整在视口右对齐主列；确认弹窗居中、蒙版全页、Cancel/Confirm 右下；dashboard 拓扑流卡 + 级联卡无重叠无截断｜0
- [U4-1] demo.html｜AGENTS.md 标题契约｜卡片/区块标题全部经 `B_ComTitle`（bc-com-title 22 处），主 16px/500、次 14px/500｜0
- [U4-2] demo.html 内联 CSS｜AGENTS.md Tab 契约｜runtime 偏差已按 §7 惯例就地修正（见 §一）｜0
- [U4-3] demo.html 内联 CSS｜AGENTS.md Alert 契约·持久性｜成功类瞬时 toast 右下角（内联修正）；错误类持久（duration 0）｜0
- [U5-1] demo.html 全文 grep｜page-assembly §5 纯净性｜可见 UI 无 PRD 注记/评审指引/装配痕迹/校验徽标（`按 PRD|demo 补全|评审|Powered by` 零命中）｜0

**structure 原始分 100（零扣分）→ 写入 90（§0.6 钳制）；visual 原始分 100（零扣分）→ 写入 90（§0.6 钳制）**

### DEV（component，脚本权威）

- [D1-1] score_component.json｜五规则｜①98（594/605，自造类 11 个均为模板串属性值误读：cr/cur/false/fileType/last/on/page/tab/tool/val/version，②注册覆盖 100% 佐证非真实类名）②100 ③70（9 个疑似手写函数：editDrawerHtml/detailDrawerHtml/bindEg71Modal 为 registry-business.js 组件内部源码，单文件内联致脚本近似误报；closeAllPopups/openModal/closeModal/eg71ModalVariant/eg71ModalBody/roleConfirmDesc 为页面编排助手（调度/数据矩阵），非业务形态渲染，page-assembly §6 边界）④100 ⑤62（令牌 69%：裸 px 695 处主要为内联 base/business.css 源码固有值）｜component = **84**（脚本分，权威）
- [D2-1] demo.html｜page-assembly §0 映射清单｜全部业务形态经 `B['bc-*'].render(ctx)` + `.bind(root)` 契约调用（27 处），无绕过 B_* 的手写业务形态（R2b 通过）｜0
- [D3-1] demo.html｜naming/R2｜页面层类名仅 `mod-*`/`bc-*`/`ms-*` 结构与组件类，无私造视觉类｜0
- [D4-1] §一 自检结果｜assembly-integrity §2｜全部通过｜0
- [D5-1] build 脚本输出｜spacing §7 清单｜8 项偏差全部就地修正（ico×36、space 8/8、stat、empty、ico--12、card、Tab、Alert）｜0

**component = 84（脚本分；③/⑤ 的脚本近似误报已在 D1-1 归因，脚本分照用不手工调整）**

### TEST（interaction / field）

浏览器实测 41/41 PASS、控制台 0 错误（1440×900 Chromium）：

- [T1-1] check #5｜interaction-completeness §1｜角色切换闭环：选 Mesh Master → 确认弹窗（interrupted 文案）→ Confirm → 弹窗关 → toast → 页面重渲染 config 卡出现｜0
- [T1-2] check #7｜ Fleet 编辑闭环：edit 抽屉 → 非法名 '1bad name!' → 行内校验错（letter 提示）→ 关闭；详情抽屉 → RSSI/SNR 展示｜0
- [T1-3] check #7｜ 删除闭环：离线行 Delete → 确认弹窗 → OK → 行移除、总数 392→391｜0
- [T2-1] check #7｜列表必备状态集｜空态：搜索 zzz-no-match → `ms-empty` 渲染；危险确认：删除/角色切换均走 `B_Eg71Modal`；在线行 Delete 禁用（offline-only）｜0
- [T2-2] check #5-6｜表单/开关反馈｜Save 成功 toast；Radio 开关切换入状态机（persist 复验）｜0
- [T3-1] check #4｜business-specific §6.2 精神｜hops 改 3 → 容量风险文案**就地**更新（不整页重渲染丢焦点）；radio 开关状态保持｜0
- [T4-1] check #3-10｜PRD 字段表｜key/hops（mesh-master）、heartbeat（relay）、Relay ID、Secure connections（ip-master）、pager Total 392/neighbors 312、ns 视角 5 列/raw 6 列（Data Rate/RSSI 列实测）｜0
- [T4-2] PRD 五方向确认矩阵｜roleConfirmDesc｜ip-master→mesh-master 确认 ✓；mesh-master(embedded)→agent/relay 确认；ipmesh→agent/relay 确认；其余直存（mesh-relay 保存实测无弹窗直存 toast）｜0
- [T5-1] check #7/10｜边界｜非法名校验、搜索无匹配空态、离线才可删、帧过滤 Up 后无 Dn 行｜0
- [T5-2] check #7｜键盘｜Esc 关详情抽屉（document keydown）｜0

**interaction 原始分 100（零扣分）→ 写入 90（§0.6 钳制）；field 原始分 100（零扣分）→ 写入 90（§0.6 钳制）**

## 三、交互链缺口（A5，interaction-completeness §2）

| 功能点 | 类别 | 缺什么 | demo 处理 | 差异归因 |
|---|---|---|---|---|
| mesh-master(外部转发)→mesh-relay 切换 | C1 | PRD 五方向矩阵不含此向，是否需确认未写 | 按矩阵字面直存（无确认） | UI 细节（不发） |
| Fleet 成员表 loading 态 | B | 静态数据源无异步 | 数据态直出（demo 数据本地生成，无伪 loading） | UI 细节（不发） |
| 编辑抽屉 Name 长度上限 | D 小 | PRD 未写 ≤20 的上限来源 | 采用 Figma 占位与组件契约默认 20 | UI 细节（不发） |

**§2.5 差异核对结论：本次核对无「需求侧逻辑漏洞」候选（C2/D 大缺口为零）**——PRD 五方向确认矩阵、角色字段集、Fleet 列集与 Figma 71.0.0.5 均自洽，demo 按二者融合实现无矛盾点。待用户确认是否发评论（零候选也必问，规则 §4）。

## 四、旧形态 × 新规则（page-assembly §0.5 修订行）

同一 PRD 前次交付 REQ-014/016，本次按当前规则全链重做，主要修订：

| 旧形态 | 新规则 | 本次处理 |
|---|---|---|
| 旧 demo toast 顶中 | AGENTS.md Alert 契约（右下角） | 内联修正落右下 |
| 旧 demo Tab 24/38px | AGENTS.md Tab 契约（32/48px） | 内联修正 |
| 旧 Fleet 无勾选/分页/详情抽屉 | Figma 71.0.0.5 新形态 | B_Eg71MeshFleetTable 升 1.3.0 |
| 旧 Deployment 无四卡选择器 | Figma 新形态 | B_Eg71MeshRoleCard 升 1.1.0 |
| 旧弹窗确认 OK 后保存静默失效 | bindEg71Modal stopPropagation（组件固有） | 页面监听改 capture 相位（页面层修复，不动组件） |

## 五、真实性校验（scoring.md §0.4）

- structure 100 = 100 − 0（U1-U5 证据行零扣分）→ 写入 90（§0.6）
- component 84 = 脚本分（score_component.json，D1-1）→ 84（区间内不钳制）
- interaction 100 = 100 − 0（T1-T5 证据行零扣分）→ 写入 90（§0.6）
- visual 100 = 100 − 0（U3-U5 证据行零扣分）→ 写入 90（§0.6）
- field 100 = 100 − 0（T4-T5 证据行零扣分）→ 写入 90（§0.6）
- score_fidelity.py --write 后 structure/field 以脚本分覆写，若与上述不一致以脚本分为准并同步本表（见 §七 追记）。

## 六、备注

- 弹窗 OK 静默失效根因（组件 `.ms-modal` click stopPropagation）以页面层 capture 监听修复，未改组件源——组件行为符合封装（内部消费点击防冒泡关闭），页面按 capture 相位注册是正确消费方式。
- `.ms-affix` 视口外缺陷为 runtime 存量问题（REQ-016 同源），本次仅内联修复；建议后续上沉 spacing §7 偏差清单。

## 七、脚本覆写追记

score_fidelity.py --write 执行记录（初版缺 `MS_ENTITIES` 实体契约，field① 0 分致 field 60；补齐三实体契约块后复测）：

| 维度 | 证据反推原始分 | 脚本分 | 写入分（§0.6 钳制） |
|---|---|---|---|
| structure | 100（U1-U5 零扣分） | 100（①壳 ②骨架 5/5 ③装配 269 点 ④定制满） | 90 |
| component | —（脚本权威） | 84（score_component.json） | 84（区间内） |
| interaction | 100（T1-T5 零扣分） | —（无脚本） | 90 |
| visual | 100（U3-U5 零扣分） | —（无脚本） | 90 |
| field | 100（T4-T5 零扣分） | 100（①实体 10 字段 ②活跃 53 处 ③静态校验） | 90 |

- 修复过程：首测 field 60（缺 MS_ENTITIES）→ 按 REQ-021 范式补实体契约（fleetMember/neighbor/meshFrame 三实体）→ 复测 field 100；中途实体块误并入页面 JS 致「独立业务块」检测落空（structure ② 80/④ 50），拆为独立 `<script>` 块（脚本 split_biz_blocks 按 MS_ENTITIES 模式划资产块）后 structure 复测 100。全量回归：41/41 浏览器检查 + 0 console errors + 装配完整性 7 块 head64 OK。

## 八、2026-11-13 更新轮：单表格页免标题（用户裁定 → AGENTS.md 列表工具栏契约新增小节）

用户原话：「全局只有一个table的页面，不需要有标题。这个你要整理成规则。并且优化023这条需求」。规则已固化至 AGENTS.md「EG71 列表工具栏契约 · 单表格页免标题（用户裁定 2026-11-13，硬性）」，本节为该轮 demo 修订的验收证据。

### 修订行（旧形态 × 新规则）

| 旧形态 | 新规则 | 本次处理 |
|---|---|---|
| Fleet 卡默认兜底标题行「Member Gateways」（registry 源未传 title 也渲染） | AGENTS.md 单表格页免标题 + runtime 偏差条款 | 内联副本改「未显式传 `title`/`actionsHtml` 不渲染标题行」，`fleetPage()` 两视图均不传 → 头部整行消失，registry 源头不动 |
| Frames 卡标题行「Mesh Frames」+ 行内筛选/刷新控件 | 同上 + 「标题行功能控件下沉操作栏行」条款 | 标题行删除；筛选下拉 + 刷新图标钮下沉 `.bc-eg71-toolbar` 行（左筛选组 + spacer + 右工具组），新增 `.bc-eg71-mesh-frames-toolbar` 结构类仅表达贴顶分隔线（padding/margin 12 + 1px `--color-divider-base-1`，值全令牌） |

### 三角色验收证据

- [U2-6] Fleet 页（Gateway Fleet 卡）｜AGENTS.md 列表工具栏契约·单表格页免标题｜标题行移除后操作栏升白卡第一行、下沿 1px 分隔线与表格分界（实测 card-head 0 / toolbar 1 / 分隔线 1px）｜0
- [U2-7] Radio 页（Network · Radio 卡）｜同上·反例条款｜配置语义卡（无 ms-table、含开关/选择）标题照常保留（实测 card-head 1），不误伤反例｜0
- [U3-6] Stream 页（Data Stream · Mesh Frames 卡）｜同上 + 控件下沉条款｜工具栏 32px 档（select 实测高 32px、14px——避开 `--sm` 的 28px/13px 违规档，spacing §4 禁 13px）；AI 视觉核验截图：标题行已消、下拉/刷新/表头对齐、无重叠错位｜0
- [U5-3] 全局｜page-assembly §5 纯净性｜标题移除后可见 UI 无注记/指引残留｜0
- [D2-2] demo.html fleet 渲染｜runtime 偏差范式（AGENTS.md）｜按契约就地修正内联副本，registry 源头不动（与 Tab 栏契约偏差处理同范式）｜0
- [D3-2] demo.html frames 渲染｜naming / R2｜控件下沉复用既有 `.bc-eg71-toolbar`/`.bc-eg71-toolbar-spacer`/`.bc-eg71-toolbar-select` 基建类，无新自造视觉类｜0
- [D4-2] 装配完整性｜assembly-integrity §2｜令牌活性断言 `--spacing-24` 有值、抽查分隔线 computed 1px、0 console errors、node --check 通过｜0
- [T1-6] 三页导航｜interaction §1｜LoRa 组展开 → Fleet（5 行）/ Data Stream（13 行）/ Radio 全可达渲染正常｜0
- [T2-6] Stream 筛选闭环｜interaction §1.1 列表类｜All Directions → Up 过滤后 19 行 Up 数据、刷新钮在位，交互链完整｜0

### 本轮真实性校验

本轮证据行全部 0 扣分（规则驱动修订，非缺陷修复）：interaction / visual 原始分维持 100 → 写 90（§0.6）；structure / field / component 以脚本复测为准（见 §九 追记）。

## 九、更新轮脚本覆写追记（2026-11-13）

| 维度 | 证据反推原始分 | 脚本分 | 写入分（§0.6 钳制） |
|---|---|---|---|
| structure | 100（本轮 U2-6/U2-7 零扣分） | 100（score_fidelity ①壳 ②骨架 ③装配 ④定制） | 90 |
| component | —（脚本权威） | 84（score_component.json 复测同初版） | 84（区间内） |
| interaction | 100（T1-6/T2-6 零扣分） | —（无脚本） | 90 |
| visual | 100（U3-6/U5-3 零扣分） | —（无脚本） | 90 |
| field | 100（T4 沿用初版字段核验，本轮无字段变更） | 100（score_fidelity ①实体 ②活跃 ③静态） | 90 |

综合（0.2/0.2/0.25/0.2/0.15 加权，按写入分）= 90 × 0.2 + 84 × 0.2 + 90 × 0.25 + 90 × 0.2 + 90 × 0.15 = 89.9 ≥ 80，过同步门槛。

## 十、2026-11-13 更新轮二：控制器形态重排（43:12085）+ 删除弹窗 Message 版式（127:8693）

用户原话：「https://www.figma.com/design/yjHZc80XWLZW9jhE4SPH0u/71.0.0.5?node-id=43-12085 样式不对」+「Gateway Fleet 删除的提示词，按照这个样式」。两处均为 Figma 真源驱动的**组件级升级**（改 registry-business.js + library/business.css 源头，非内联修正——与新形态入库同范式，page-assembly §3）。

### 修订行（旧形态 × 新真源）

| 旧形态 | 新真源（Figma） | 本次处理 |
|---|---|---|
| Deployment Mode 卡 radio 圆点右上角、卡片双行排布 | 43:12085：radio **内联左置**与卡名同行 | `B_Eg71MeshRoleCard` 1.2.0：render 骨架重排 + `.bc-eg71-mesh-deploy-*` CSS 更新 |
| 角色提示灰盒（`bc-eg71-mesh-role-hint`） | 43:12085 无灰盒，提示并入下拉分组 | 删除该行结构 |
| Secure connections 无提示图标、证书链接平铺 | 43:12085：info 图标 16px 尾随；证书链接内缩 20px（`--spacing-xl`，business-specific §6.1 附加内容内缩） | render + CSS 更新 |
| 通用模块卡平铺行、卡头带图标 | 43:12085：Advanced Setting 可折叠（默认展开、chevron 18px）、内嵌边框 panel、双列 grid、compound 复合行；卡头纯文字 | `B_Eg71MeshModuleCard` 1.0.0→1.1.0：新增 `collapsible`/`open` ctx、`panel`/`grid`/`compound` 行类型、`eg71-mesh-module-fold` 事件 |
| mesh-config / forward 卡 40px 控件 + 标题图标 | 43:12085：控件统一 32px 档、标题纯文字 | ConfigCard 1.1.1 / ForwardCard 1.0.1 patch |
| Fleet Edit 抽屉「Identifier」列名 | PRD/真源：Relay ID | FleetTable 1.3.0→1.4.0（上一轮已落） |
| 删除确认弹窗 = 头/体/尾版式（标题栏 + 右上 × + head 图标圆点） | **127:8693 业务库「弹窗」Error 变体**：无标题栏无关闭钮；24px 实心红圆 ×（`circleXFilled`）与标题 18/500/行高 26 + 正文 14 同排 gap 8；卡 416 宽 / 圆角 8 / padding 24·16；按钮组右对齐 gap 16（Cancel 描边 + Delete 红底） | `B_Eg71Modal` 1.0.0→1.1.0：`action:'delete'` 分支走 Message 版式（`.bc-eg71-modal--msg`），disable/confirm/select 保持原版式；标题「Delete Member」→「Delete Gateway」 |

### 三角色验收证据

- [U3-7] General 页（IP Master 默认态）｜基准一级（Figma 43:12085）｜四卡结构 Deployment Mode / Gateway Role / Frequency Plan / Advanced Setting 与设计稿一致；IP Master 无 Mesh Config / Forward 卡（控制器变体）｜0
- [U3-8] 删除弹窗｜基准一级（Figma 127:8693）｜AI 视觉核验（截图逐项比对）：无标题栏/无 × ✓ 红圆白× 24px ✓ Delete Gateway 18px/500 ✓ 灰描述 14px ✓ 右对齐 Cancel 描边 + Delete 红底 ✓ 416 窄卡圆角 8 ✓｜0
- [U3-9] 删除弹窗标题 18px｜spacing §4 字号集合｜**Figma 真源值 18px/500（业务库弹窗 Error 变体规格）**——按 scoring §1.3 基准分级（一级 Figma 真源 > 三级规则红线）不扣分；建议 spacing.md §4 为「弹窗 Error 变体标题 18px」增补阶梯口径，待 UED 复核裁定｜0
- [D2-3] 组件升级范式｜page-assembly §3 / encapsulation｜新形态走 registry+business.css 组件升级（SKILL 契约同步 bump：Modal 1.1.0 / Role 1.2.0 / Module 1.1.0 / Config 1.1.1 / Forward 1.0.1），非页面层手搓；已交付 demo（REQ-012/016/024）为冻结内联副本不受影响｜0
- [D4-3] 装配完整性｜assembly-integrity §2｜重建后 8/8 间距修正 + head64 首尾字节 diff 全过 + 43 导出状态｜0
- [T1-7] 49 项浏览器检查｜interaction §1｜全绿（含新增「delete modal msg layout (Figma 127:8693)」结构断言）+ 0 console errors｜0
- [T3-3] 删除闭环｜business-specific / interaction §1.1｜行删除 + 批量删除（N selected 提示）→ 确认 → 行消失/Total 392→391 → 搜索空态，链路完整｜0
- [T5-3] 删除弹窗 Esc/遮罩关闭｜五轴交互 keyboard｜Message 版式无 × 钮，Esc + 遮罩 + Cancel 三通道可达｜0

### 本轮真实性校验

本轮证据行全部 0 扣分（Figma 真源驱动的形态对齐，非缺陷）：interaction / visual 原始分维持 100 → 写 90（§0.6）；structure / field / component 以脚本复测为准（见 §十一 追记）。

### §2.5 差异核对（本轮）

本轮为样式对齐（Figma 真源），无新增 PRD 逻辑差异；「Delete Member→Delete Gateway」措辞随真源，属 UI 细节不发评论。**本轮无逻辑漏洞候选。**

## 十一、更新轮二脚本覆写追记（2026-11-13）

| 维度 | 证据反推原始分 | 脚本分 | 写入分（§0.6 钳制） |
|---|---|---|---|
| structure | 100（本轮无结构违规证据行） | 100（score_fidelity ①壳 ②骨架 ③装配 ④定制满） | 90 |
| component | —（脚本权威） | 84（score_component.json 复测） | 84（区间内） |
| interaction | 100（T1-7/T3-3/T5-3 零扣分） | —（无脚本） | 90 |
| visual | 100（U3-7/U3-8/U3-9 零扣分） | —（无脚本） | 90 |
| field | 100（字段集沿用，本轮无字段变更——仅措辞 Delete Member→Delete Gateway 随真源） | 100（score_fidelity ①实体 ②活跃 ③静态） | 90 |

综合（0.2/0.2/0.25/0.2/0.15 加权，按写入分）= 90 × 0.2 + 84 × 0.2 + 90 × 0.25 + 90 × 0.2 + 90 × 0.15 = 88.8 ≥ 80，过同步门槛。
