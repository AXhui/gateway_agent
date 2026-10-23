# REQ-017 · 设备库内置库交互流程优化 — 验收记录

- PRD：飞书 wiki `EaMAwC2TkiOOMqkjHpAcWYB0nqg`（source.txt）
- 视觉真源：Figma 网关/路由器业务组件库 71.0.0.4「Data Library」6 帧
- 产物：`05_release/REQ-017/demo.html`（单文件，4 独立 script 块 + 内联 tokens/base/business）
- 铸造组件 ×5：B_Eg71Message / B_Eg71LibProgressModal / B_Eg71LibResultModal / B_Eg71LibUploadModal / B_Eg71DeviceLibTable

## 一、三角色验收（scoring.md §0）

### UED 走查

| # | 证据 |
|---|---|
| [U1-1] | 唯一壳：`MS_EG71_SHELL.render+bind` 各 1 次（score_component.json ④=100）；route `/data-services/data-library` 命中 navGroups 既有 Data Library 入口，无私加菜单；列表页单卡形态（`.ms-content--wide` + 单 `ms-card`），卡片内不套卡。零扣分 |
| [U2-1] | 模块清点（对 mapping.md）：版本头行（bc-com-title + V1.3.5 徽标 + Obtain/Upload）/ 内置库表（17 型号 + Total + 单页分页）/ 进度弹窗（fetch/parse/write）/ 完成弹窗（标准 + 冲突重命名两变体）/ 上传弹窗（空/错误/就绪）/ 错误 toast / 自定义页签空态——全部落地、顺序一致。零扣分 |
| [U3-1] | 内容区可见 UI 13px 清零（探针 n13(content)=0）；runtime 存量 13px（.ms-table td 13→14、.ms-btn--sm 13→14、.ms-pagination 13→12）已按 spacing §7 精神 demo 内就地修正、不回写源头。零扣分 |
| [U3-2] | 壳侧边栏菜单标签 51 个仍为 13px（base.css/.bc-eg71-sidenav 存量）：冻结壳资产 + §7 清单未列，REQ-013/016 均保留，待 runtime 统一升级清除。建议扣分 −4 |
| [U3-3] | Figma 对照（6 帧）：主标题 16/500、轻量 Tag 无边框、表三列左对齐、计数链接色、eye 16、空态 fileText 32、对勾圆底 48、重命名箭头 to 侧链接色——目检（default.png + states.png 10 帧）一致。零扣分 |
| [U4-1] | 三契约：标题行按钮高 32（覆写 `.bc-com-title-extra .ms-btn--sm`）+ gap 12（runtime 已落）✓；Tab 栏契约五值全过（B_Eg71PageTabs v1.1.0 组件级落实：紧贴导航栏正下方 top-gap=0、通栏到列边 L=R=0、高 48 flex-shrink:0、gap 32、左起 20，探针见「增补 · v2」；初版 U4 只验了 gap/高未验位置，位置缺陷由用户 UED 复核捕获，已在 v2 修复）✓；Alert 位置：上传弹窗 info Alert 在 body 顶部（④ 表单级精神）✓。零扣分 |
| [U5-1] | 纯净性：可见 UI 无 PRD 注记/交互指引/装配痕迹/校验徽标（10 状态截图目检）。零扣分 |

**UED 结论：visual = 100 − 4 = 96；structure 零扣分 = 100**

### DEV 走查

| # | 证据 |
|---|---|
| [D1-1] | `score_component.py --report` → **component 92**，明细归档 `score_component.json`：①100（页面类 4/4 全组件库类）②100（覆盖率 100%）③100（B[] 字面量契约调用 8 处，无手写渲染函数）④100 ⑤62（令牌 69%，裸值 711 = hex 37 + px 674，全部为 L2 内联块固有 px/font 值——脚本整库内联口径，spacing §6 L2 内部值由 SKILL 契约域豁免） |
| [D2-1] | 映射清单核对：8 个形态全部按 SKILL 契约 ctx 调用（shell/page-tabs/com-title/device-lib-table/lib-progress/lib-result/lib-upload/message），bind 全挂。零扣分 |
| [D3-1] | 自造类：页面代码仅 4 个 class（ms-card/ms-card-body/ms-stack/bc-eg71-device-lib-page[已注册 business.css 脚手架]）。零扣分 |
| [D4-1] | 装配完整性：令牌活性断言 PASS（sp24=24px、bodyPad=20px）；内联块由源文件字节级拼装（首尾无截断）；10/10 状态渲染（141–571 节点）；build-scene 补 `--window-size=1440,900` 后侧边栏纳入 capture（库实例图标 48→168）。零扣分 |
| [D5-1] | spacing §7 偏差就地修正清单执行：ico 14→16 ×36；ms-space--8→12 ×7（工具栏/批量/卡底按钮组，标签组/筛选行/分页 4 处保留）；.ms-stat-title 13→12；.bc-eg71-protocol-card 竖向 padding→16；ms-ico--12 未使用不补。全部只落 demo 副本。零扣分 |

**DEV 结论：component = 92（脚本权威）**

### TEST 走查

| # | 证据 |
|---|---|
| [T1-1] | 在线更新链：Obtain → fetch→parse→write 进度（850ms 步进）→ 完成弹窗 → 版本徽标 V1.3.5→1.4.0 + 表格重渲。全通。零扣分 |
| [T1-2] | 离线导入链：Upload → 弹窗（拖拽/官方下载链接/文件行）→ 选文件 ok/error → Upload → parse→write → 完成弹窗。全通。零扣分 |
| [T1-3] | 计数下钻：count 点击 → `eg71-devicelib-count` → toast「N services reference MODEL」（下钻目标页在 PRD 范围外，事件 + 占位反馈合规）；eye → `eg71-devicelib-view` 事件外抛。零扣分 |
| [T2-1] | 必备状态集：列表（空态 ms-empty/数据态/危险确认不适用）；上传表单（默认/校验失败红字/提交中=进度）；按钮（busy 时 Obtain/Upload disabled）；数据同步（进行中/成功/超时失败 toast，error 持久不自动消失）。全齐。零扣分 |
| [T3-1] | 回滚/解锁：进度 Cancel → 清 chainTimer + setBusy(false)，页面状态不重置；完成 ok → 关弹窗 + 解锁 + 版本更新。全通。零扣分 |
| [T4-1] | 字段核对：17 型号清单、版本号 V1.3.5→V1.4.0、统计 Added 30/Updated 20（Removed 0 省略——「避免信息冗余」规则）、重命名映射 AM02→AM02-1 / BU-KMC6727→BU-KMC6727-1、被引用备份 BU-VIE9185/EM500-PP、离线统计 Added 2/Updated 3、文件 msil-inbuilt-1.4.0.zip 45.2 MB。全对 PRD/Figma 真源。零扣分 |
| [T5-1] | 边界：空态文案、无效文件类型/大小红字、网络失败 toast、Esc 关闭三弹窗（document.contains 守卫防监听堆积）、拖拽区 Enter/Space 键盘触发。全通。零扣分 |

**TEST 结论：interaction 零扣分 = 100；field 零扣分 = 100**

### 真实性校验（§0.4）

structure 100 = 100 − 0（U1/U2/U4 零扣分行）✓；component 92 = 脚本分（D1）✓；interaction 100 = 100 − 0（T1–T5 零扣分行）✓；visual 96 = 100 − 4（U3-2）✓；field 100 = 100 − 0（T4）✓。综合 = 0.2×100 + 0.2×92 + 0.25×100 + 0.2×96 + 0.15×100 = **97.6 ≥ 80 门槛** ✓

## 二、交互链缺口（A5，interaction-completeness §2）

| # | 功能点 | 类别 | 缺口 | demo 处理 | 差异归因（§2.5） |
|---|---|---|---|---|---|
| 1 | 更新入口形态 | C2 | PRD 正文「点击 Update 下拉框（含在线更新/离线导入）」vs Figma「Obtain / Upload 两独立按钮并列标题行」 | 按 Figma 两按钮实现 | **需求侧逻辑漏洞**（正文与图例矛盾）→ 发方案评论 |
| 2 | 同名冲突处理 | C2 | PRD「冲突阻断，弹错误对话框提示用户处理」vs 交互要点④「不阻断流程，重命名+备份并在完成弹窗展示」 | 按④：Renamed 段（AM02→AM02-1） | **需求侧逻辑漏洞**（前后矛盾）→ 发方案评论 |
| 3 | 网络失败行「划掉」 | C1 | PRD 状态机表注「划掉=实现未做」但交互要点/错误提示表仍保留该行 | 按错误提示表 toast 呈现，不实现划掉行 | demo 侧 UI 细节（不发） |
| 4 | ZIP 校验规则 | D | PRD 标注「需研发确认」（类型白名单/大小上限未定） | 最小合理默认：仅 .zip、错误文案按 PRD 字面 | 业务规则空白（大缺口）→ 不实现，台账记录，PRD 作者已有确认动作（不发） |
| 5 | loading/error/empty/确认 | — | 无缺口（B 类全补全） | — | — |

### 差异核对表（§2.5）

| 功能点 | PRD 写了什么 | demo 实现了什么 | 归因 |
|---|---|---|---|
| 更新入口 | 正文：Update 下拉框两入口；图例：Obtain/Upload 两按钮 | Obtain/Upload 两按钮 | 需求侧逻辑漏洞（图例侧） |
| 冲突处理 | 状态机：错误对话框阻断；交互要点④：不阻断重命名 | 不阻断 + 完成弹窗 Renamed 段 | 需求侧逻辑漏洞（取④） |
| 失败行划掉 | 「划掉=实现未做」+ 错误表保留 | toast 呈现 | demo 侧 UI 细节 |
| ZIP 校验 | 「需研发确认」 | .zip + PRD 字面文案 | demo 侧最小默认（占位） |

## 三、过程记录

- demo 重组：4 独立 `<script>` 块（base/entities/business/page）——score_component 按「资产块 vs 页面块」分类依赖块边界，整块拼接会把页面代码误判为资产内联（曾致 component 误报 28）。
- build-scene 补 `--window-size=1440,900`：默认 800×600 视口触发 ≤760px 断点隐藏侧边栏，scene.json 全状态丢壳侧边栏（图标库实例 48→168）。独立 commit。
- Tab 栏高 48 失效根因：`.ms-content` 纵向 flex 收缩（内容超高时 48px 被 shrink 到 29.3），demo 覆写 `flex-shrink:0` 修复。
- **增补 · v2（Tab 契约组件级落实，2026-10-23）**：用户 UED 复核（Figma 截图对照）捕获页签条未紧贴顶部导航栏——初版 Tab 栏落在 `.ms-content--wide` 20px 内边距之内，与「紧贴导航栏正下方、通栏到列边」契约不符；初版 U4-1 只验了 gap/高未验位置（验收缺口）。根因是契约从未在业务组件层实现（bc-eg71-maint-bar 同款潜伏缺陷，REQ-016，另行处理）。修复落在组件源头 `B_Eg71PageTabs 1.0.0 → 1.1.0`（Props 契约变更，minor）：① business.css 新增 `.bc-eg71-page-tabs--flush` 修饰符（负 margin 拉出父容器 20px 内边距，Alert 契约「demo 内用负 margin 结构类拉通」同款机制上沉为组件能力）+ 基类补 `flex-shrink:0` + gap 24→32（`--spacing-3xl`）；② registry render 支持 `ctx.flush`；③ demo 侧 demo-local 覆写整段删除（契约回归组件，页面零覆写）。探针五值：top-gap=0 / h=48 / L=0 / R=0 / gap=32 / tabLeft=20。分数不变（U4-1 修订后仍零扣分，visual 96 维持 −4 壳侧边栏 13px），component 脚本重跑 92。
