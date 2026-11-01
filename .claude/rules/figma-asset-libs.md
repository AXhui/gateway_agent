# Figma 组件库引用规则 · Figma Asset Libraries

> **适用范围**：一切在 Figma 里搭建设计稿的场景——桥接转录任务（tools/figma-bridge）、A8 Figma 转换 agent、人工指挥 claude 直接画 Figma。
> **性质**：硬性约束。搭稿前必须先引用两份库文件，能复用的组件一律从库里取。

## 1. 两份权威库文件

在 Figma 团队空间（厦门星纵数字科技）检索并打开这两份文件：

| 库文件 | 用途 |
|---|---|
| **Milesight_IOT_Web** | Web 端整体设计语言：布局、令牌、页面级模式 |
| **（新版本）网关/路由器 通用业务组件库 业务组件** | 网关/路由器业务组件：按钮、输入框、表格、徽标、侧边导航项等 |

## 2. 搭建铁律

1. **先找再画**：动手搭稿前，先用 figma-remote 的检索/取数工具在两份库文件里找对应组件；找得到 → 复制/引用进目标文件再用。
2. **库里没有才允许手画**：手画的组件要在最终报告里列明「库中无对应，已新画」，供后续回填进库。
3. **禁止绕库私搭**：库里已有同形态组件却在目标文件里从零手画，视为违规（与页面装配规则 §0「无映射清单，不生成」同源——Figma 侧同样不允许自我生产）。
4. **视觉基准优先级**：转录模式下 demo 的真实色值/文案 > 库文件默认样式；组件结构来源则相反——库文件 > 手画。

## 3. 与本仓库分层的关系

- 本规则是 [.claude/rules/page-assembly.md](page-assembly.md)「组件复用」铁律在 **Figma 侧**的镜像：HTML demo 侧禁止绕过 `B_*`，Figma 侧禁止绕过两份库文件。
- **适用范围**：claude 驱动的搭稿（A8 Figma 转换、人工指挥）。`tools/figma-bridge` 的 html.to.design 直连导入是**机械转录**（产出普通图层、非库组件），不适用本规则；导入后的组件回填由设计师在 Figma 内做。桥接 server.js 曾内置本规则（自由设计模式 spawn claude），该模式已于 2026-10-23 整体删除（token 耗费不可控），server.js 不再有任何 LLM 路径。
- **生产通道裁决（2026-10-31 用户指令，反转 2026-10-25）**：飞书「点击转 Figma」按钮**默认走本内部插件**（server.js `/task` engine=local：登记任务到 feishu-tasks.json → 面板「飞书任务」区 → UED 点击转换 → 自动回写表格）；官方 html.to.design MCP 链路降级为**手动备用**（POST /task 带 `{"engine":"mcp"}` 或环境变量 `H2D_ENGINE=mcp` 时触发）。本规则的 §4 库引用契约因此在生产链路全程生效，不再只是研究基线。全链路细节见 `FIGMA_DESIGN_PIPELINE.md`。
- **外部网页链接导入不走本地组件（2026-10-30 用户裁定）**：内部插件面板**粘贴的 http(s) 链接**一律按外部网页模式（serve.py `url` 分支 → build-scene `--ext --site` → `scene.ext=1`）——纯图层转录，跳过 §4 全部库匹配机制与 §4.7 令牌绑定、不做组件化、插件不拉库目录；本地路径/拖拽的自家 demo 照常全套。§4 以下契约只对自家 `ms-*` demo 生效。
- **外部网页多页转录（--site，2026-10-30）**：对齐 demo 侧 `MS_FIGMA_EXPORT` 多态铺开的思路——入口页渲染后由 scene-bootstrap 收集可见同源链接（`a[href]`，导航区 nav/header/aside 优先、pathname+search 去重且 `/index.html`≡`/`、排除资源文件），Node 侧逐页抓取（curl，20MB/30s 上限，失败跳页不阻断）转录，cells 依次 `1. 入口 2..N 子页` 纵向堆叠、插件每 cell 落一帧（标签取锚文本 ≤24 字）；`--pages` 子页上限默认 8；`--ext --site` 同时在 `<head>` 顶部补 `<base>`，修正 file:// 渲染下相对 CSS/JS/图片按原始域名解析。仅 href 可发现的页面（SPA 纯 JS 路由不带真实 href 的不发现）、仅入口外一跳不递归。**后台部署自愈（2026-10-30 事故固化）**：serve.py 改后旧进程不重启=改动永不生效（当日「面板连不上/链接导入不走 --ext」根因）——build-scene 自动拉起时对时，源码新于运行进程即自动重启（日志统一落 `~/Desktop/html-to-figma-internal/serve.log`，时间+Origin+请求行；面板再报 Failed to fetch 先查此日志：有记录=服务端问题，无记录=客户端拦截）。
- **PRO 对标四件套（2026-10-30，对标 html.to.design Pro plan）**：内部通道免费补齐 PRO 卖点——①**批量导入**：面板链接框多行/逗号分隔多个 http(s)（或面板空白处多链接粘贴）→ serve.py `{urls:[...]}` 逐个下载（批内文件名去重、上限 20）→ build-scene 多位置参数**显式清单转录**（与 `--site` 自动发现互斥，显式优先）；②**多视口**：面板「多视口」下拉（1440+390 / 1440+768+390，仅链接导入生效），入口页按宽度列表逐宽渲染，帧标签带 `·390px` 后缀（真实移动布局，非缩放）；③**一键重导**：导入历史（path/url/urls 负载，拖拽全文除外）经 `figma.clientStorage` 持久化（插件 iframe 无可靠 localStorage，code.js 代理读写），面板「最近导入」区点击即重跑，上限 12 条可清空；④**高清图**：序列化时 img 取 **srcset 最大 w/x 候选**（含 `<picture><source>`，浏览器 currentSrc 只选够用小图），懒加载占位（`data:`/pixel/placeholder）回退 `data-src`/`data-original`。分层不变：全部走既有 ext 纯图层管线，不触 §4 库契约。
- **Free 层核心全量（2026-10-30，对标 html.to.design free-features，用户令「核心功能都需要完成，包括原型特征」）**：①**浏览器捕获**——面板「浏览器捕获」区书签按钮拖到 Chrome 收藏夹栏，目标页（登录后/本地/JS 交互页）点击即把渲染后 DOM 全文 POST serve.py `{capture,url,content}`（走 `--ext --site`，curl 够不着的页面入口）；②**暗色补帧**——`--theme dark`：head 前置 localStorage 主题键 + body 尾 `.dark`/`data-theme` class 约定，入口页补一帧 `·暗色`，**尽力转换**（站点无暗色 CSS 则同亮色）；③**本地色样式**——ext 导入时重复 ≥3 次的不透明实色自动建本地 paint style（名 `#HEX`，≤30）回绑全节点，自家 demo 不走此路（仍绑库变量，§4.7 不变）；④**字体映射**——文本按真实 font-family 首族（`n.ff`）经 FONT_ALIASES 表映射（系统栈→PingFang SC、Arial/Inter/Roboto/Georgia 等直用，表外原样尝试），整族失败回退默认；⑤**粘贴代码**——高级区 `{name,content,mode:'ext'}` 纯图层转换；⑥**.zip 整站包**——`{zip_b64}` 解包 `_drops/zip-<ts>/`（≤200 文件/≤100MB/防穿越），入口=最浅 index.html，余页批量转录，`file://<原目录>/` base 让包内相对资源生效（渲染的是 /tmp 注入副本，base 缺失即 404——zip 实测根因）；⑦**自动原型连线**——ext 渲染注入 `__MS_LINKMARK__`，bootstrap 给同源 `<a>`（含锚内 img/svg）标 `lk`（http 取 pathname+search 归一 `/index.html≡/`；file: 取文件名），拍平时 lk 随壳转移给首子节点，build-scene 各 cell 记 `u`（SITE 用 pathKey、本地页用 basename），插件 lk→u 命中即挂 ON_CLICK NAVIGATE 到对应帧（zip 页间跳转同样连线）；⑧**overflow 滚动**——插件侧裁切且内容超高 >40px 的帧设 `overflowDirection:VERTICAL`，position:fixed/sticky（`n.fix`）提升为 cell 帧直接子节点（绝对变换换算）；⑨**多语言**——批量导入贴多语言 URL 等价实现（各站语言 URL 约定不同，显式清单优先）。hover 组件变体不建通用机制：自家 demo 的 `MS_FIGMA_EXPORT` 多态契约已覆盖且粒度更细（业务态/弹窗/启停），ext 站点跨域样式表不可读、:hover 提取不可靠。

## 4. 转录链路（html→Figma 内部插件）的库引用契约

> 来源：2026-10-25 库引用研究 + 插件「库组件 0 实例」事故。内部免费通道（build-scene.js + html-to-figma-internal 插件）把 demo 落成 Figma 图层时，**库优先、能引用则引用**——不允许把库里已有的组件重画成普通图层。

### 4.1 引用契约（API 层，硬性）

| 资产类型 | key 来源 | 导入 API |
|---|---|---|
| `component`（单组件，如图标） | search_design_system 的 `componentKey` | `figma.importComponentByKeyAsync(key)` |
| `component_set`（组件集/变体集，如 Button/Input/Select） | `componentSetKey` | `figma.importComponentSetByKeyAsync(key)` |

- **错配必抛错**：拿 set key 调 component API 直接抛异常——2026-10-25 事故根因（插件只用 component API，19/20 条映射是 set，全部静默回退重绘）。
- 实现上**先试 component API、失败回退 set API**（component-keys.json 的 `kind` 元数据不可信，ms-empty 曾标 single 实为 set）。

### 4.2 变体裁决顺序（证据 → token → 颜色 → 形状）

0. **证据裁决（2026-10-31 像素审计固化，最高优先）**：HTML 块内**无图标/矢量子节点**（`lib.ic=false`）时，icon/箭头/chevron/下拉/more 类 VARIANT 轴与 BOOLEAN 轴**强制关态**——库默认装饰不随默认变体泄漏（实测泄漏形态：Button 默认 Add 图标、Tag 自带 chevron-down-big、Tabs 选中态 chevron + 右侧 more 按钮）。tabs 嵌套 swap 的 topSet/tabSet 择变体同样受此约束；被选变体仍自带 more 按钮结构时以 `visible=false` 覆写藏掉。
1. **修饰类 token 优先**：`ms-btn--primary` 等修饰类经 component-keys.json `tokens` 映射 → VARIANT 选项。三个补强（2026-10-31 四轮「颜色不匹配/文字看不到/高度间距不一致」根因）：
   - **裸类兜底 token**：`tokens['']` 给无修饰类提供基态（bare ms-btn=`strock` 白底描边、bare ms-tag=`light background,default`）——此前 bare 按钮零 token 落默认变体 Primary 蓝底、蓝底配蓝字不可见；
   - **逗号多值**：一个修饰类裁决多轴（tag tinted=`light background,primary`——种类+theme 双轴，单值只判 theme、种类落默认 deep background 成深底同色字）；
   - **token 序即优先级**：walkLib 修饰 token 在前、裸类兜底在后，插件 `pickVariantValue` 按 token 序消费（此前按选项序遍历，兜底会压过修饰语义——outline tag 被兜底判成 Light background）。
2. **颜色匹配兜底**：token 未决的 VARIANT 轴，用「变体子组件主导填充色」对比「HTML 块背景色」（build-scene 采集 `n.lib.col`）：胜出距离 < 0.12 且领先第二名 > 0.12 才裁决（平局不判——尺寸轴颜色相同天然不参与）。典型：filled 按钮主题蓝 → `Type=Primary`。
2b. **高度裁决尺寸轴（2026-10-31 四轮）**：`/size|尺寸/i` 的 VARIANT 轴取各选项变体子组件高度与块高最近者，最近距 ≤3px 且领先次近 ≥2px 才判（平局不判）——高度是 px 真值，不再让默认序定 L/M 混档（「下一步 16px 大字 / 取消 14px」不一致根因）；计数入通知「高度择尺寸 N」。
3. **形状匹配第三裁决（First Draft 逻辑，2026-10-25）**：token/颜色都未决、且块携带形状证据（texts 清单/字号/有无开关）时，按「字号差 + 文本数差 + 开关有无 + 宽高比差」对变体子组件打分，胜出变体的 variantProperties 并入 payload。典型：纯文本标题贴「标题」plain 变体、带 ms-switch 的标题贴 with-switch 变体。
4. set 级裁决结果（含颜色/形状）必须进 `setProperties` payload——右侧面板所见即所判。

### 4.3 复合块守卫（形状匹配才整块替换，硬性）

复合块（标题行/弹窗/页签栏）整块换库实例**必须过 component-keys.json 的 `guard` 守卫**（build-scene 侧评估，不过 → 本地重绘 + 内件实例，不硬凑）：

| 守卫 | 规则要点 | 对应库形态 |
|---|---|---|
| `plainTitle` | 仅 1 段 16px 纯文本、无图标/控件子树 | 业务库「标题」plain 变体 |
| `simpleDialog` | 单一 ms-modal 卡 ≤560px、2-8 段文本、子树无进度条/上传/拖拽/表格/统计等富体；`ms-spin` → Waiting、`--danger/--error` → Error 等语义布尔 | 业务库「弹窗」（自带全页蒙版，语义布尔轴 Info/Error/Waiting/Warn/Success） |
| `pageTabs` | bc-eg71-page-tabs 锚点 + ≥2 个 tab 子帧（`--active` 定选中态）→ 三层嵌套 swap：Tabs/Top → Components/Tabs-Top（Item 数量 + Icon/More 关态）→ 逐 Tab（Selecte 选择 + Icon/ShowSelect 关态）+ 文案覆写；**tab 子帧包在 'tabs group' 等命名容器内也要深收集**（曾因跳过名字含 tabs 的子树，tabKids 收空 → Tab 文案全 "Tab"）；**inner/tab 识别按 `mainComponent.parent === set` 集合成员判定**（2026-10-31 三轮：库重发布后嵌套实例图层名不再是 'Tabs-Top'，按名查找落空 → swap 静默退出；名称只作兜底）；BOOLEAN 轴（ShowSelect/Icon 类）childByWants 不裁，须逐实例 setProperties 关态 | web 库 Tabs/Top 组件族 |
| `statCard`（2026-10-31） | 库 Statistic = 横排（图标+数值+后缀）；HTML **竖排统计瓦片**（小标题 fs≤big-5 压在大数值上方）→ 守卫不过本地绘制；横排大数值（fs≥18、无上方小标题）才换库实例；**标题级 label 拒收（同日二轮）**：库 suffix 槽是主档定宽（≈36px @ 24px 字号），装单位（个/%/bps）可以、装标题（「接入设备总数」6 字）必折行重叠（实例内层 resize 被 Figma 模型拒绝，无就地加宽通道）——小字号文本 CJK 计权长度（CJK=2/latin=1）>3 一律本地绘制 | web 库 Statistic |

富弹窗（进度条/上传/结果统计）守卫不过 → 本地重绘 + 内部原子件库实例——**能引用则引用，不能表达不硬凑**。

### 4.4 失败可见性（硬性）

- 插件完成通知必须报：库组件实例数 / 属性设置数 / **颜色择变体数** / 回退数 / **库导入失败数**。
- **库组件实例 0 = 异常**：说明 key 失效或库未订阅，必须排查（get_libraries 查订阅 → search_design_system 校验 key 与 assetType），不得当作正常结果。
- mock 校准纪律：figma-mock.test.js 的 import API 必须复刻真 API 行为（set key 走错 API 必抛）——曾因 mock 比 真 API 宽松，36/36 绿灯掩盖全灭根因。

### 4.5 key 清单维护

- **快路径权威映射**：`tools/figma-bridge/component-keys.json`（含 libraryKey/重建方法注释、变体 token、复合块守卫）；重建 = get_libraries 反查 libraryKey → search_design_system `includeLibraryKeys` 定向检索。
- **运行时库目录兜底（2026-10-29，内部插件落地）**：导入时 `getAvailableLibrariesAsync` + `getTeamLibraryAsync` 拉库目录（key+name），两类动态命中——key 失效（库重发布 key 轮换）按家族名找回现 key；未入映射表的原子 `ms-*` 控件按类名词干匹配目录组件名就地实例化（复合容器不整块替换，本地编排 + 内层原子命中）。component-keys.json 仍为第一优先（带 token/守卫元数据），动态目录是引用兜底，**两者都不命中才允许本地重绘**。
- **词干匹配三补（2026-10-29 用户实测「组件库很多没有匹配上」）**：①目录名归一双轨——全名归一 + **末段归一**（'/' 后去前导序号，'2 Navigation/1 Breadcrumb'→'breadcrumb'）；②**双语词干桥接**——业务库中文名（标题/弹窗/导航栏/picker-cell…）与英文词干经别名表互查；③**权威库优先**——团队空间多库同名组件（弹窗/标题在 YCM UI、Linkus、管理端等库各有一份）按库名裁决，Milesight_IOT_Web 与网关/路由器业务库优先，防命中错误库。
- 设计稿必须订阅两份库（资源库面板开启）——`importComponentSetByKeyAsync` 只在库已订阅的文件里可用；未订阅时目录兜底同样拿不到组件集。

### 4.6 引用即改写（实例内容按 HTML，硬性）

> 来源：2026-10-29 用户指令「引用了组件要做改写，文本要按照 html 去填写。内容视觉要按照 html 去拼凑」——库实例落画布后**不得残留库默认文案**，内容呈现以 HTML demo 为准。

- **文本**：build-scene 给每个 lib 命中节点采集**深层文本清单 `texts`（阅读顺序，≤8 段）+ 逐段颜色 `tcols`**；插件侧按序消费——组件 TEXT 属性逐段写入（setProperties），剩余文本**全部**按阅读顺序回填到嵌套文本层（`characters` 覆写，非只改首层）；已由 TEXT 属性写对的层跳过。
- **图标槽换装（2026-10-31 按钮输入框转化修复）**：walkLib 采 `lib.icnk`（块内首个图标的库 key）/`lib.icnf`（名字）+ `lib.icnc`·`lib.ictk`（图标颜色与令牌）→ 插件把实例内层首个 ≤24px 图标槽 INSTANCE 的 `mainComponent` 换成 demo 真实图标（Delete 不再挂库默认 Add，统计卡不再挂 folder），**换装后按 HTML 颜色涂装（含 token 绑定）**——库变体自带图标色不随 demo，颜色对应以 HTML 为准。守卫：仅 `ms-(btn|input|select|stat)` 类控件；checkbox/radio/switch 载体豁免。
- **图标不做本地组件（2026-10-31 用户令「图标引用库 icon 组件就好」）**：图标一律引用库组件——icon-keys.json 命中直取 key 实例化；未命中**保留图标名与颜色**（`t:'ic'` 无 k），插件按名走库目录动态兜底（`ensureIconByName`），兜不中回退 svg 绘制（颜色仍按 demo 涂装，此前未映射图标颜色被删画成黑色）；组件化门槛排除 `t:'ic'` 与 `ms-ico` 类 svg，不产本地散组件。通知报「按名动态兜底 N」。
- **库内容不做包装组件（2026-10-31 二轮，用户令「都引用了组件库元素就不需要再做组件」，适配所有内容）**：块内任一后代是库实例（`lib` 标记）或图标实例（`t:'ic'`）→ 不组件化，直接铺库实例子节点（子实例各自走改写）。双重理由：①库实例已是复用单元，包装层不增益；②嵌套库实例内层文本真 API 不可改，包进主档后复用会把其他块内容冻死在首个主档（实测 173:24957 错位/字体重叠根源）。图标包装（`ms-ico` 组件）同禁。
- **组件化签名必须含几何（2026-10-31 二轮打回）**：根宽高与子节点 x/y 入签名——去几何复用让异构块共用主档，实例只缩放根、内部子节点不重排 → 错位/位置乱；仍不入签名的只有文案内容与文本层自身宽高（文本改写时填充适配父容器宽 + 超长 ENDING）。
- **超长文案规则（2026-10-31 三轮用户令反转：默认完整展示）**：实例改写**默认把文本全量展示**——超出主档原字符数且 **≤24 字符**的层设 `textAutoResize='WIDTH_AND_HEIGHT'` 按层中心回移自适应展开（尽量文本都展示出来）；**>24 字符（特别长）才省略号**：定回父容器宽 + `textTruncation='ENDING'`。本地绘制文本 CSS ellipsis 命中（`n.tr`）照旧 ENDING。宽度适配失败（Figma 实例模型拒绝定宽槽内改 autoResize）计入通知「实例内层扩宽失败 N」，N>0 的块建议守卫拒收改本地绘制。
- **视觉复核重选（自愈兜底）**：变体裁决三级（§4.2）全部不判、默认变体落图后与 demo 底色证据（`lib.col`）背离 >0.2 时，直接比色在兄弟变体找 <0.08 且领先 >0.2 的一 个换装重建——轴名无关，兜住 setProperties 轴失配静默失败类缺陷；形状打分只对复合块（多段文本/开关/页签）开闸，单段文本控件不跑（曾按宽高比误裁 Size 轴）。
- **长文案防折行**：改写超出主档原字符数且未过省略号阈值的文本层设 `textAutoResize='WIDTH_AND_HEIGHT'` 并按层中心回移（短文案主档被长文案实例复用是常态）——已并入上条「默认完整展示」路径的机制描述。
- **几何对齐（2026-10-31 四轮，序列化侧）**：单行文本的对齐与盒子以**字形 run 实测**裁决（Range union rect vs 元素盒），不信 computed textAlign——它是书写意图（button UA 默认 center、flex 居中不反映在 textAlign）。run 窄于盒子才判：对称=center、右贴边=right、其余=left；文本层盒收缩到 run 宽（全宽文本层会漂移居中、与兄弟图标重叠——「高级」标题 chevron 重叠 / radio 段标签不居中根因）。多行段落保持全宽防 Figma 重排换行；scene-audit 同款镜像保基线。
- **视觉**：文字色按 `tcols` 覆盖对应文本层 fills；图标色按 HTML `currentColor` 覆盖描边/填充；变体（颜色/形状）按 HTML 证据裁决（§4.2）——右侧面板所见即 demo 内容。
- **蒙版铺满（弹窗实例收口，2026-10-29「蒙版只有一半」实测）**：蒙版只盖半页有三个根因，两侧收口——①库「弹窗」实例内部蒙版子帧默认约束固定、不随根 resize 长高：插件侧强制 根尺寸到帧宽高 → 蒙版子帧铺满 0,0 → 卡片重居中，通知报「蒙版铺满 N」；②蒙版子帧透明度做在**图层**上（fill 不透明 + layer opacity）而非 FILL paint 上：识别必须双通道（fill 级 + 图层级），只查 FILL 会漏判；③DOM 层 ms-mask 嵌在**有裁切的容器**（右列/卡片）内：序列化侧把非根级 ms-mask **提升为状态帧直接子节点**（顶层）再强制全幅，只改宽高不提升会被父容器裁掉一半。
- **边界**：实例内部结构不可重构是 Figma 实例模型限制——表达不了的形态走守卫不过 → 本地编排 + 内层原子件实例（§4.3），不属于「残留库默认内容」。

### 4.7 颜色令牌引用（实色绑库变量，不新建裸色，硬性）

> 来源：2026-10-30 用户指令「颜色token不要自己新建，脚本要去引用基础组件库的token color」——内部通道落 Figma 的实色不得是裸色值，一律绑定 Milesight_IOT_Web 库「Color Token」集合的已发布变量（`importVariableByKeyAsync` + `setBoundVariableForPaint`），改库变量即全局改稿。

| 环节 | 动作 | 落点 |
|---|---|---|
| 注册表 | tokens.css 令牌名 → 库变量 key（63 条）；scopes **不落表**，以运行时 `Variable.scopes` 为准（空数组=全域） | `tools/figma-bridge/token-vars.json` |
| 页内反查 | build-scene 注入 `window.__MS_TOK_NAMES__`（注册表全量名）→ `getComputedStyle(:root)` 建值→名映射（自定义属性返回**声明字面量**，解析 #HEX / #RGBA / rgb() / `var()` 链 ≤4 跳；自动跟随暗色/主题覆写）→ 同值多候选按站点家族优先（text→`color-text-`、fill→`color-fill-|color-bg-|color-base-|color-mask|color-primary-`、icon→`color-icon-`、stroke→`color-border-|color-divider-`），家族内语义名压色阶名（`primary-normal` > `blue-06`）；**仅不透明色参与** | `scene-bootstrap.js` tokOf |
| 采集点 | 文本色 `tk` / 帧填充 `ftk` / 图标 currentColor `ctk` / 描边 `stk.tk`·`al.btk` / 库实例文本逐段 `lib.ttoks`；`verify-scene` 路径不注入名单 → 标记整体关闭、审计基线不变 | scene 各节点 |
| Node 汇总 | 收集树内全部标记 → `scene.tokVars={令牌名:key}`（只保留注册表有的名） | `build-scene.js` |
| 插件绑定 | scope 门禁（变量 scopes 不含目标落点即跳过：fill 族绑不到 stroke 等）→ 绑定 → **读回校验**（绑定后 `paint.color` 反映变量值，与 demo 色偏差 >0.02 → 回退裸色，防暗色 demo 进亮色文件/别名值漂移）；同步路径（applyFrameProps/applyAutoLayout 的 strokes）先落裸色入队、导入尾声统一 flush | `code.js` tokPaint |

- **可见性**：完成通知报「令牌绑定 N」；**N=0 且 scene 有 tokVars = 异常**（查 token-vars.json key 失效 / 库未订阅），不得当正常结果。
- **允许裸色的例外**：半透明色（库变量不含 alpha）、注册表无名命中（gray/green 等色阶库未发布）、scope 错配、读回漂移——回退裸色保视觉，不算违规。
- **别名保护**：tokens.css `color-blue-01..10` 对应库 `color-primary-1..10`，key 已直录注册表；库值≠demo 色由读回校验兜底回退。
- **重建**：key 失效时 get_libraries 反查 libraryKey → search_design_system `includeLibraryKeys` 定向检索，同名变量在 Color Token（a5396ce6…）与 UINK 专用（f431adcf…）两集合发布，**只收前者**；变量全名带分组前缀（'3 Text/color-text-primary'）取末段对齐 tokens.css。

### 4.8 1:1 还原三铁律（2026-10-31 像素审计固化）

> 来源：REQ-019 M-Bus 导入稿九维偏差审计（字体/间距/位置/布局/适配/宽度/高度/文字/颜色），七缺陷根因修复后 mock 124/124、verify-scene 五页 100%。

- **根提升（序列化范围铁律）**：demo 契约 `rootSelector` 写成壳内子树（如 `.ms-shell .ms-main`）时，序列化/参考页/审计三侧一律**提升到整壳 `.ms-shell`**——侧边栏与顶栏一并入 scene（帧宽回视口 1440），业务库「完整侧边栏」映射才有机会命中；曾因只序列化右列，侧边栏整列缺失、`bc-eg71-sidenav → 侧边栏` 映射永不触发。
- **svgCache 原型清场**：`figma.createNodeFromSvg` 的缓存原型节点从未挂父，导入结束若不 `remove()` 会以游离空 Frame（如 24×24 "Frame"）残留在页面根——导入收尾统一清空缓存并 remove。
- **审计方法论**：大画板**截图不可作判据**（服务端异步渐进渲染，同节点两次截图完整度不同）——像素审计以 `get_design_context` 的节点属性（fills/字体/坐标/尺寸）为证据；「缺陷对不上」先怀疑截图时序，再查链路。

### 4.9 五轮修复 + 五视角验收仪（2026-10-31 REQ-020 蒙版/弹窗/按钮/图标钮审计固化）

> 来源：REQ-020 导入稿蒙版缩水（468/568/1060 ≠ 1440）、蒙版 y=48、弹窗 footer 71.48、实例字样不随 demo、纯图标钮泄漏 "Label"。四修后 mock 152/152（四靶红实测值复现）、verify-scene 六页 100%（+REQ-020 27213 断言）、verify-import 红态点名全部真缺陷零误报。

- **AL-hug 根因（真 API 语义）**：对既有 frame 设 `layoutMode` 时，主轴 sizing 直接落 AUTO（hug）并收缩到内容+padding；之后再写 FIXED **不恢复尺寸**，只有 `resize()` 恢复——蒙版 1440→468（420 卡片+24×2 padding）、footer 372→71.48 同族。修法：设 FIXED 后立即 + 收尾 + 最终 `node.resize(w,h)` 三重断言；mock 必须仿真该语义（layoutMode 从 NONE 切入即 hug、间距/内边距变更再 hug），否则绿灯掩盖塌缩。
- **蒙版提升不做双重补偿**：提升用 transform 增量（`fn.x = pa[0][2]-fa[0][2]`），子节点已含 +24 位移时再手动 +24 = 双重计数（y=48 根因）。
- **实例文字字样覆写**：实例内层 TEXT 层接受 fontSize/fontName override——build-scene 逐段采集 `lib.tfs/tfw`，插件 rewriteInstanceText 按 demo 字号/字重覆写（400 Regular/500 Medium/600 Semibold，先 loadFontAsync）；主档默认 12/Regular 不再泄漏到「取消 14/500」。
- **纯图标按钮变体裁决**：demo 有图标无文字的 `ms-btn`——严格按已裁决轴选「带图标槽（≤24px INSTANCE 子节点）」变体；本主题无图标槽变体 → 整块回退本地重绘（图标仍走库实例）；被选变体残留的主档 Label 文本层 `visible=false` 藏掉；跳过比色重选（会按底色丢图标槽）。
- **五视角验收仪 `verify-import.js`（导入后必跑）**：`node tools/figma-bridge/verify-import.js --scene <scene.json> --board <get_metadata 落盘>` 五轮——P1 设计师·库引用（实例落图率/壳映射）｜P2 设计师·文案卫生（主档默认文案泄漏）｜P3 HTML·几何（具名帧宽高 ±2px + 蒙版提升位 y=24，库实例内部帧豁免）｜P4 HTML·文本（scene 文本 ⊆ board 文本，≤5%）｜P5 用户场景（蒙版全幅盖 cell、按钮塌缩 <20、300×300 失管 svg、同级文本重叠）。**取证坑两条**：get_metadata 对 TEXT 节点名硬截 20 字符（907 节点实测 max=20，frame 到 59）——文本比对必须截断感知；instance 是叶子，库实例内部帧/文本不可见——scene 侧按「祖先带 lib 标记」豁免，实例内层由 mock 靶覆盖。**按钮塌缩判定以 scene 实测高度为准**（2026-10-31 REQ-015 泛化）：demo 原生矮链钮（REQ-015 表格链钮 16px、REQ-020 链钮 22px）不算塌缩——板高 <20 且与同名 scene 高度对不上（±tol）才报，写死绝对阈值会误报原生矮钮。

### 4.10 六轮修复（2026-10-31 button/文本二审：枚举抛错连带 + MS_ICONS 资产损坏）

> 来源：用户令「先理解调用的业务组件实例变体、去 Figma 官方手册了解功能再改脚本」。官方手册核对（developers.figma.com）+ 全链根因：footer/结果区 hug 冻结与 ops 钮图标泄漏各有一层更深的根因。mock 156/156（+4 靶，3 红态实证）、verify-scene 六页 100%、REQ-020 重建 223/223 按钮带图标身份。

- **AL 对齐枚举消毒（官方手册证据）**：`counterAxisAlignItems` 只收 MIN|MAX|CENTER|**BASELINE**——**无 STRETCH**；`stretch` 的 Figma 表达 = 容器 MIN + **子节点 `layoutAlign='STRETCH'`**（该属性枚举才含 STRETCH）；`primaryAxisAlignItems` 收 MIN|MAX|CENTER|SPACE_BETWEEN|SPACE_EVENLY|SPACE_AROUND。序列化侧 CSS `align-items:normal/stretch`（默认值）→ `align:'STRETCH'` → 旧代码原样赋值必抛 → **外层 catch 一口吞掉 padding/终态 resize → AL-hug 冻结**（footer 71.48/结果区 44.78 的第二层根因）。修法：枚举白名单消毒 + **逐 setter 各自 try**（一处抛错不连带）+ 终态 resize 不可跳；`buildDefs` 对组件主档根的 `applyAutoLayout` 调用必须传第三参（缺 n 时主档根无终态 resize）。
- **mock 枚举校准（§4.4 纪律再证）**：mock FNode 补 counterAxisAlignItems/primaryAxisAlignItems/layoutAlign 枚举 setter——非法值必抛。此前 mock 宽松收下 STRETCH，plugin 抛错被吞 + resize 跳过 = 全链失真而绿灯（红态实证：旧插件代码 + 新 mock → 宽塌 120×40 三靶全红）。
- **MS_ICONS 资产损坏（134 处）**：`assets/js/registry-business.js` 的 MS_ICONS 字面量内 134 处元素间丢 `<`（`" />path d=`）——浏览器把后续内容解析成 svg 内**文本节点**，① demo 里多路径图标渲染半损（chevrons-left 只剩一支、square-pen 没笔尖）；② DOM innerHTML 序列化文本 `>` 成 `&gt;`，iconSig 归一化后与原始条目 sig 永不相等 → **图标名反查 0/11 命中** → lib.icnk/icnf 全空 → swapIconSlot 守卫 return → 库默认 Add 图标泄漏。修法双管：①资产机械修复（`/>字母`→`/><字母`，134 处全在字面量内、node --check + 逐条目剥标签零残留文本双校验，REQ-020 demo 内联副本未动、容忍链路可复原）；②桥接容错——`iconSig` 先实体还原（&gt;/&lt;/&quot;/&amp;，&amp; 最后）再归一，损坏 demo 无需重生成即可反查；`firstIcon` 同时收 `t:'s'` 裸 svg（icnf=n.ic、icnc=n.col、ictk=n.ctk）。重建实证：477/477 图标带名、223/223 ms-btn lib 块图标身份齐备。
- **坑**：模板字符串包的 scene-bootstrap.js 里写注释**禁止反引号**（会把 BOOTSTRAP 字面量提前终止，require 即炸）；zsh `echo ====` 会被当命令。

### 4.11 七轮修复（2026-10-31 input 审计：表单值序列化 + addon/图标位置证据）

> 来源：REQ-018 板（179:45057）用户令「input 还是有问题，你没打到我的标准」——Input 实例整块保留库主档默认（value="Example"、addonBefore http:// 前缀文本、afterIcon 44px 设置图标附加块），实例零 override。根因三层，全链收口后 mock 169/169（+13 靶，5 红态实证）、verify-scene 六页 100%、REQ-018 scene 重建 14 个 input 块证据齐备。

- **表单值序列化（序列化侧根因）**：`<input>/<textarea>` 的内容在 `value/placeholder` **属性**里、不是 DOM 文本节点——scene-bootstrap 此前采集不到，`lib.texts` 恒空 → 插件 rewriteInstanceText 整段跳过。修法：serEl 为 text-like input/textarea（排除 checkbox/radio/button/file 等非文本型——它们的 value 是表单语义值不是可见文案）**合成 t:'t' 节点**：value 优先（值色 = cs.color），否则 placeholder（`getComputedStyle(el,'::placeholder')` 计算色，标 `ph:1`）；宽度 canvas measureText 量测、左内边距 + 行高垂直居中定位。scene-audit 补同款镜像（input 值/占位必须入 scene，防合成回归）。
- **addon 轴证据（插件侧根因一）**：库 Input 的 `addonBefore/addonAfter` 等**结构型附加轴**默认 true——HTML 块没有 addon 容器结构，一律关态；旧映射只认 icon 类轴，addon 轴永无裁决 → 主档 http:// 前缀与附加块泄漏。
- **图标位置证据（插件侧根因二）**：库 Input 的 `preIcon/afterIcon` 是**两条独立 BOOLEAN**——旧逻辑「块内有图标」的布尔 ic 让左置 search 图标把 afterIcon 也误开。build-scene firstIcon 改累计偏移采 `lib.icL/icR`（首个图标中心 vs 块中心的左右关系）；插件图标类 BOOLEAN 轴按位置裁决：after/suffix 类轴吃 icR、其余吃 icL，无图标两侧全关（图标零泄漏）。
- **空输入兜底（插件侧根因三）**：demo 输入框无 value/placeholder 时合成节点也没有 → 主档 value="Example" 泄漏。`ms-input/ms-select` 块无任何文本证据 → 实例内层 TEXT 层全部 `visible=false`（空输入本就不该有可见文案），计数「空输入藏文案 N 层」入通知。
- **边界认知**：demo 原文可能自带 "Example"（REQ-018 模板 `placeholder || 'Example'` 兜底）——此时 Example 是**忠实转录**不是泄漏，判泄漏须看证据链（scene lib.texts 是否含该串），不能只看板上文字。

### 4.12 八轮修复（2026-10-31 REQ-018 二审：文本 run 分组 + 伪元素冒号 + 变体集对账）

> 来源：REQ-018 新板（179:51357）细节审计——表单 label 文字右对齐压图标、必填 `*` 落块右缘、footer 混排行 `已选 <b>2</b> 项` 文本重叠 ×5、defs 变体集不排布 + 吞变体。四修后 mock 173/173（+4 靶，红态 4 红实证）、verify-scene 七页 100%（014/015/016/017/018/019/020，REQ-018 18904 断言零缺陷）、scene 重建证据：星号 x=4/w=7.1、混排三段逐段盒 28+7.2 贴合。

- **文本 run 分组（run-union 污染根因，序列化侧）**：`Range.selectNodeContents(el)` 的 union 会把**元素子节点**（svg 图标等）并进文本盒 → w 撑大误判 right + 文本盒压兄弟图标（「高级」chevron 重叠同族）；混排行「已选 <b>2</b> 项」整 union 盒与单独序列化的 b 子层重叠。修法：**直接文本节点按连续段分组**（空白段剔除）逐段 Range 量盒——单段走 run 对齐裁决（盒收缩到 run 宽）；**多段（混排行）逐段产 t:'t' 节点**：盒 = run 精确盒、al='left'（盒已精确无需裁决）、与元素子节点按 DOM 序交错落层（阅读顺序/图层顺序两保）；scene-audit 同款镜像（段数/段盒/逐段文本/al 全断言）。
- **伪元素冒号 bug（位置根因）**：pseudoNode 调用传 `which=':before'` **带冒号**，旧定位分支比 `which==='before'` 恒 false → 一切静态伪元素全落 **after 公式**（必填 `*` 被推到块右缘 x=101）。修法：判定用既有的 `short` 归一值；锚点取首/末文本段（元素子节点不进 run，图标不再把锚点推到块右缘）。
- **伪元素文本宽 canvas 实测**：旧 `0.6*fs` 估宽对 `*` 等窄字符偏差大（8.4 vs 实测 7.1）——`measureText` 实测替换，星号紧贴 run 边界落位。
- **变体集 combine 真 API 行为（defs 板 179:57095 实测）**：`combineAsVariants` **不自动排布**（变体全叠 0,0、集框塌成单变体尺寸 w=124）且**实测吞变体**（11 个变体只见 10，末个被改名 `family/variant` 游离集外，静态分析未定位吞点）。修法（防御性收口）：combine 后**对账补挂**（`parent !== set` 一律 `appendChild` 回集，计数「补挂被吞变体 N」入通知）+ **网格排布**（cols=ceil(√n) 下限 2、GP=24）+ `resizeWithoutConstraints` 集框收缩到内容。mock 必须复刻吞末个形态（§4.4 纪律三证：mock 宽松一次绿灯掩盖全灭）。
- **伪元素文本层按字符命名（插件侧）**：落图 TEXT 层命名一律 `n.text.slice(0,20)`（旧 pseudo 节点叫 'pseudo-before'）——get_metadata 以图层名做文本比对，叫 pseudo-before 时 verify-import P4 必漏报该段文本。
- **verify-import P3 匹配器加 `$` 锚**：旧 `new RegExp('^'+escaped)` 前缀匹配把 scene 'ms-modal' 误命中 board 'ms-modal-xxx' 类长名帧；加 `(?:\s+\d+)?$`（容忍 Figma 同名去重后缀 " 2"）精确收口。
- **构建号护栏（八轮后固化，防「旧面板产缺陷板」）**：Figma 插件面板开着时 JS 上下文**不随磁盘 code.js 更新重载**——用户改完代码不重开面板直接重导，跑的仍是旧代码，静默产出「颜色又错/主档默认又泄漏」的缺陷板（REQ-018 板 182:63565 实证：input 实例五处七轮前主档默认全在场，Desktop code.js 却已是新码）。修法：build-scene 写 `scene.build`、插件声明 `PLUGIN_BUILD`，`msg.type==='scene'` 时两者不匹配 → **拒导**并提示「完全关闭面板再重新打开」；无 build 号的旧 scene/mock 不拦。**两侧改任一侧必须同步 bump**；mock 有红绿靶（旧插件×新 scene → 拒导）。

### 4.13 九轮修复（2026-11-01 REQ-015 板 183:2088：实例颜色无条件覆写 + 单行 hug 防换行）

> 来源：用户令「大文字不要换行，按钮颜色要和html统一」+ 硬性要求「**html 的颜色怎样，即便调取的组件颜色不一样，都要根据 html 的颜色去改**」。修后 mock 185/185（+9 靶，红态 6 红实证：关闭两修 → 4 覆写靶 + 2 hug 靶全红）、verify-scene 七页 100%、REQ-015 重建 11 个 lib.stk 证据 + 91 条色条带 ftk。

- **实线边框序列化为色条、非 node.stk（根因链）**：CSS solid border 拆成 4 条 `border-*` 色条子帧（scene-bootstrap 边框分支）——只有 dashed 才产 `node.stk`。walkLib 旧逻辑只读 `n.stk` → solid 边框证据恒空 → bare/sm 按钮落库 Strock 变体后边框是**库默认蓝**，demo 灰边 #E5E6EB 被丢。修法双侧：①色条带 `ftk`（tokOf stroke 家族，进 scene.tokVars）；②walkLib 在 `n.stk` 缺失时从**≥2 条不透明同色 border-\* 条**反推 `lib.stk={w,c,tk}`（w 取横条高/竖条宽；单条分隔线 <2 不触发，表格行底边/Tab 下划线不受影响）。
- **实例颜色无条件覆写（repaintLibInstance，插件侧）**：变体裁决/视觉复核重选定型后，实例根按 HTML 证据重涂——`fills=[tokPaint(lib.col, n.ftk)]`、`strokes=[tokPaint(lib.stk.c, lib.stk.tk)]`+strokeWeight+INSIDE；令牌绑定读回漂移自动回退裸色（§4.7 内建）；`ms-mask` 弹窗跳过（蒙版全页归 forceDialogFullPage）。计数「颜色覆写 N」入通知；**col/stk 证据缺失不覆写**（无证据 ≠ 透明）。现有 filled/link/文本按钮核验本就正确，覆写后不回归。
- **单行文本 hug 防换行（materialize）**：浏览器量盒可能窄于 Figma 字形排宽（同字号不同 hinting，host 标题自然 ≈212px vs 盒 208px），`NONE`+定宽遇宽字形即折行。单行文本（无 `n.tr` 省略号、无 `\n`、高 ≤1.6×行高）落图后改 `textAutoResize='WIDTH_AND_HEIGHT'`，x 按对齐锚定（left 不动 / center 保盒中心 / right 保右缘）；`n.tr` 与多行文本保持 NONE+定宽盒。**当前板实测所有文本均单行未折**——本条是系统性预防（旧 scene 定宽盒 + Figma 宽字形必折）。
- **mock 校准**：FNode 的 TEXT `width` getter 模拟自然宽（chars×fs×0.6）——hug 重锚靶靠它驱动（居中 744→755 / 300→333.2，真 Figma 同字体漂移亚像素级）；**靶 fixture 类名必须避开既有同名靶**（ms-btn--sm 与五轮纯图标钮同名会让 find 串靶，新靶用 ms-btnt--sm）。


### 4.14 十轮修复（2026-11-01 REQ-019 板 184:9931：checkbox 文案泄漏 + input addon/前图标泄漏 + icL 坐标系 bug）

> 来源：用户令「checkbox 的引用也没很规范。如果是标题的，才需要这个文本，在 table 列，只有一个勾选框，没有文本。还有 input 也是，还是会有差异，需要隐藏前后的 addon，也需要隐藏前 icon」。修后 mock 201/201（+16 靶，红态 7 红实证）、verify-scene 七页 100%、REQ-019 重建 202 lib 命中证据齐备。

- **icL/icR 坐标系 bug（序列化侧）**：build-scene 的 firstIcon 累计偏移含块自身 `n.x`（父系绝对坐标），却与块内局部系 `n.w/2` 直接比 → 图标几乎恒判右置（REQ-019 工具栏左置 search 被记 `icR:1`，七轮的 preIcon/afterIcon 位置裁决整套失效）。修法：`icCx = __io[0] - (n.x||0) + w/2` 先归一到块内系。
- **真库 Input 无 addon/preIcon 轴（七轮轴关态路径失效的根因）**：实测 Milesight_IOT_Web 的 Input 组件集只有 `Size 尺寸/State 状态/Filled 填充` 三 VARIANT 轴——http:// 前缀块（InputAddon 直发子实例）、28~44px 设置图标附加块（Component 1 直发子实例）、person 前图标 + input-suffix（'input' 内层 16px 实例）全是**烤进变体的结构**，布尔轴关态对它无效。修法 = 证据隐藏三连（插件 buildInstance 内，顺序敏感）：
  1. **hideInputAddons**（setProperties 后、改写前）：ms-input 直发子 INSTANCE 中**非图标槽尺寸**（>24px）的结构块 visible=false（≤24px 槽留给换装）；ms-select 只藏名字命中 `addon|affix|附加|前缀|后缀` 的直发子实例（自带 chevron 是语义结构保留）。
  2. **改写 df 剪枝不可见子树**：Figma 里父层 visible=false 不改子层自身 visible，只查 TEXT 层会漏——addon 藏掉后其内层 http:// 文本必须退出对位序列，demo 值才能落到值层（REQ-019 objname 输入框 "Example 未改写、http:// 被写成 4900 Water" 双症状根因）。swapIconSlot walk 同款剪枝 + 候选按位置裁决（icL 取最左、icR 取最右——首个命中序是主档图层序不保证视觉序）。
  3. **hideExtraIconSlots**：换装槽之外残余的 ≤24px 图标槽实例（input-suffix、未换装的 person）一律 visible=false；无图标证据（ic=false）时全藏——库默认图标零泄漏。仅 ms-input（select chevron / btn 图标变体是语义结构不藏）。
- **Checkbox tag 轴（用户裁定）**：真库 Checkbox 的 `tag` BOOLEAN（默认 true）控制标签 `<p>{text}</p>`，轴名此前无规则管辖恒落默认 → 裸表格勾选框泄漏主档 "Checkbox" 文案。新轴规则：`tag|label|文本|文字` → `有文本证据才 true`；**标题场景（块内有文本）才带文本，表格列只有勾选框**。空证据兜底（藏全 TEXT）同步扩到 checkbox/radio（tag 轴关态是第一道闸、结构兜底双保险，不算双计）。
- **hideLeftoverTexts（残余文本收口）**：实例内可见 TEXT 层多于 demo 文本段数时，超出段 visible=false（排序与 rewriteInstanceText 同款防错位）。仅 input/select/checkbox/radio 载体。
- **计数可见性**：通知新增「附加结构隐藏 N / 图标槽隐藏 N / 残余文本隐藏 N」。
- **坑**：①红态靶必须能** discriminate**——「值落值层」用 visText 断言在红态（addon 可见、值错落 addon 层）仍绿，须补「addon 内层 http:// 保持原样」断言才能抓住错位；②靶 fixture 的 icon 槽若是**直发子**（七轮轴模型），addon 隐藏不能一刀切直发子 INSTANCE——按 >24px 尺寸排除槽位，两代库结构（轴式/烤入式）同一插件路径兼容。

### 4.15 十一轮：步骤条组件化 + 存量映射全量审计（2026-11-01 REQ-019 板 184:12825）

> 来源：用户令「步骤条也要组件，一般 html 出现的内容都有」——两条产出：①步骤条逐项换库；②对 component-keys 全部 disabled 条目按「html 出现的都该有映射」原则做使用量审计，能套现有裁决机的启用、需新机制的记录启用条件。修后 mock **224/224**（+11 靶，红态 1 失败正中串轴靶）、verify-scene 七页 100%、构建号两侧 r11→**r11b**。

- **步骤条逐项映射（ms-step → components/steps-item）**：整条 steps 集（Number 轴仅 3~6 变体）弃用，走**逐项**——任意步数可表达。Status 经修饰类 token（done→完成 / active→进行中 / 裸类兜底→等待）；Layout=水平左对齐烤入全部 token 值；Small 小型走高度裁决（高度轴 regex 扩 `/size|尺寸|small|小型/`，块 24 → true 胜 32 差 8px）。**tail 连接线证据**：build-scene 采 `lib.tail`（后代有无 `ms-step-line`）——末步 tail:0 藏 tail 帧；有线的把 tail/line 拉宽到实例余宽（插件 `fixStepsTail`，计数「步骤尾线 N 藏/N 拉宽」）。步号数字是 icon 子实例内可覆写 TEXT，随 rewriteInstanceText 阅读序对位。**stepItem 守卫**：含 `ms-step-desc` 的形态（升级弹窗）拒收——desc 的 tip 帧烤在库 item 内且高度证据被拉高 muddy，本地绘制保内容。
- **「轴名=值」显式 token（布尔轴串轴防线，pickVariantValue 扩展）**：Segmented 实测四轴 尺寸×选中×悬停×禁用——后三条同为 `true/false` 值域，而每个未决 VARIANT 轴都拿**同一份 token 列表**独立询问：裸值 `true`（或子串通道的 `选中=true`）会把悬停/禁用一并判 true。修法双闸：①token 支持 `轴名=值` 形态，**轴名 norm 命中才取值**；②纯布尔值轴（选项全 true/false）不再吃裸值 token，只有轴名门禁能寻址。红态实证：旧代码选中「选中+悬停+禁用全开」变体（fixture 必须故意含该变体，否则红态不可见——pickVariantChild 打分会退回正确变体，绿灯掩盖串轴）。
- **审计启用（能套现有裁决机的才开）**：`ms-segmented-item → components/Segmented`（选中轴显式 token；尺寸轴 28.8 vs 大30/中26 平局不判走默认+resize；组级 Segmented-group 弃用——数量/选中位是结构事实非类名，token 表达不了且组宽烤死）、`ms-timeline-dot → time-dot`（单轴 status 裸值无碰撞：裸→进行中 / success→完成 / error→失败 / muted·warm→等待，warm 色差由 repaintLibInstance 按 HTML 兜正；Timeline 整条与 components/time 项集内容烤死弃用）。
- **勘验后维持 disabled（记录启用条件）**：`ms-progress`——Progress-Line/Status-Normal 集 Value 值轴仅 5%~95% 的 5% 离散档、宽度烤死（large 400 / Small 174），HTML 任意 % 内层填充无法表达（实例 resize 只缩根、内层不随比例重排，statCard 同族判例）；状态集（Success/Error/Warn/Waiting × Small）同因。启用条件 = 库出填充条独立子组件或内层比例 resize 可靠化。其余 13 条 disabled（表格数据行/表单项/卡片内容等动态内容、文本节点无类名）维持诚实原则。
- **端到端验证载体坑**：REQ-019 九个导出状态无一打开含 segmented/timeline 的视图（元素在内联 runtime 的 JS 模板串里）——grep `class="` 计数会误判「已渲染」；用 /tmp 可见页验 walkLib 证据（修饰 token 在前、裸类兜底 appended 在后、col/高度证据齐）后再重建 REQ scene 交还面板。

### 4.16 十二轮修复（2026-11-01 REQ-019 板 187:14922：select 选中值消失 + 库默认色图标不重涂）

> 来源：用户令「input的文本消失了，input标题的icon颜色也不对，应该是灰色」。修后 mock **234/234**（+10 靶，红态 1 红正中填充重涂靶）、verify-scene 七页 100%（REQ-019 断言 11904→11909，select 值入审计）、构建号两侧 r11b→**r12**。

- **select 选中值序列化（序列化侧根因）**：原生 `<select>` 闭合态的选中项文案由**浏览器绘制**（selectedOptions[0].label），无 DOM 文本节点——七轮只合成 input/textarea → ms-select 块 `lib.texts` 恒空 → 插件 hideLeftoverTexts 把实例内层 TEXT 全藏（板上全部下拉只剩 chevron）。修法：七轮合成块扩到 select（值 = selectedOptions[0].label||text，值色 = cs.color；option 子元素闭合态零盒由 serEl 既有 w<0.5 下限自然过滤），scene-audit 补镜像（input/select 值必须入 scene）。
- **排他守卫写反（本层自伤，红态由 verify-scene 揭示）**：非文本型排除正则写成 `tag!=='select'&&!/^(checkbox|…)$/` —— select 整体短路**永远不进合成分支**（本意是「select 免检 type、input 才排除非文本型」，正确写法 `tag==='select'||!/^(…)$/`）。教训：**audit 镜像必须与实现同 PR**——mock 靶（scene 侧已供 texts）全绿，verify-scene 首跑 REQ-019 text×5 才暴露合成根本没跑。
- **库默认色图标无条件重涂（插件侧根因，paintIconStrokes）**：库 icon 组件的默认填充是自家语义色（实测 #272E3B 深蓝黑 / #C9CBCE 浅灰），不是纯黑——旧填充分支只重涂「近纯黑 <0.01」→ info/copy/more 落图保持库默认深色（描边型 search 一直正常）。修法：几何节点全集（VECTOR/RECTANGLE/ELLIPSE/LINE/POLYGON/STAR/BOOLEAN_OPERATION）内，`strokes` 有值重涂描边、`fills` 纯 SOLID 无条件重涂填充（demo 图标经 MS_ICONS 单色 currentColor，混合色=部分重涂即本根因）。板取证：16×16 info 图标像素 #272E3B×8 + #787D85×18 + #C9CBCE×5。
- **板错位一格 = 暂存副本旧版（流程结论，非工具缺陷）**：板 9 格全部显示下一态内容、末格空帧（serEl-null 兜底帧 h:600）——14:57 scene 来自暂存副本的**旧版 demo**（states name/setup 错位）；当前源 9 态全部健康（探针 sameRef/display/childCount/contentText 四证）。**飞书表格预览 URL 服务的是下载时刻的 demo 版本**——改 demo 后重转必须重新触发任务，不能复用旧暂存。
