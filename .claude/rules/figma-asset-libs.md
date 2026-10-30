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

### 4.2 变体裁决顺序（token → 颜色 → 形状）

1. **修饰类 token 优先**：`ms-btn--primary` 等修饰类经 component-keys.json `tokens` 映射 → VARIANT 选项。
2. **颜色匹配兜底**：token 未决的 VARIANT 轴，用「变体子组件主导填充色」对比「HTML 块背景色」（build-scene 采集 `n.lib.col`）：胜出距离 < 0.12 且领先第二名 > 0.12 才裁决（平局不判——尺寸轴颜色相同天然不参与）。典型：filled 按钮主题蓝 → `Type=Primary`。
3. **形状匹配第三裁决（First Draft 逻辑，2026-10-25）**：token/颜色都未决、且块携带形状证据（texts 清单/字号/有无开关）时，按「字号差 + 文本数差 + 开关有无 + 宽高比差」对变体子组件打分，胜出变体的 variantProperties 并入 payload。典型：纯文本标题贴「标题」plain 变体、带 ms-switch 的标题贴 with-switch 变体。
4. set 级裁决结果（含颜色/形状）必须进 `setProperties` payload——右侧面板所见即所判。

### 4.3 复合块守卫（形状匹配才整块替换，硬性）

复合块（标题行/弹窗/页签栏）整块换库实例**必须过 component-keys.json 的 `guard` 守卫**（build-scene 侧评估，不过 → 本地重绘 + 内件实例，不硬凑）：

| 守卫 | 规则要点 | 对应库形态 |
|---|---|---|
| `plainTitle` | 仅 1 段 16px 纯文本、无图标/控件子树 | 业务库「标题」plain 变体 |
| `simpleDialog` | 单一 ms-modal 卡 ≤560px、2-8 段文本、子树无进度条/上传/拖拽/表格/统计等富体；`ms-spin` → Waiting、`--danger/--error` → Error 等语义布尔 | 业务库「弹窗」（自带全页蒙版，语义布尔轴 Info/Error/Waiting/Warn/Success） |
| `pageTabs` | bc-eg71-page-tabs 锚点 + ≥2 个 tab 子帧（`--active` 定选中态）→ 三层嵌套 swap：Tabs/Top → Components/Tabs-Top（Item 数量）→ 逐 Tab（Selecte 选择）+ 文案覆写 | web 库 Tabs/Top 组件族 |

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
