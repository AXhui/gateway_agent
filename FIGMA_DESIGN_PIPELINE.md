# 飞书按钮 → html.to.design → Figma 设计稿 — 全链路说明

## 功能

在飞书多维表格（UI demo 表）里点一个按钮，几分钟后：

1. 桥接把 demo HTML 经 **html.to.design 官方 MCP**（`mcp.to.design`）直连导入 Figma 当前画布
2. 生成的 Figma 链接**自动回写**到点按钮那一行的「Figma链接」列

**零 LLM token**（v2 的 claude+spec 转录路径已于 2026-10 移除；「无 demo 源走 claude 自由设计」的 LLM 兜底也已于 2026-10-23 删除）；耗时取决于插件导入速度，通常分钟级。

```
飞书多维表格 ──点按钮──▶ 自动化工作流「UED确认转Figma通知设计师」
                              │ HTTP POST（需求字段；record_id 可选）
                              ▼
              cloudflare 隧道（公网临时域名）
                              │
                              ▼
              本机桥接 server.js :8080（POST /task）
                              │ 三层取源拿 demo.html（demoUrl / 本地归档 / 表格反查）
                              ▼
              mcp.to.design（OAuth，桥接自有凭据）
                              │ tools/call import-html（demo 全文；命中导出契约时为全状态铺开页）
                              ▼
              Figma 里打开的 html.to.design 插件（MCP 标签页，同账号在线）
                              │ 渲染落画布
                              ▼
              Figma 当前文件里的可编辑设计稿
                              │ 任务结束
                              ▼
              桥接从导入结果提取 Figma 链接
                              │ lark-cli 回写
                              ▼
              多维表格该行「Figma链接」列 = 设计稿地址
```

> 插件离线时桥接**自动拉起**：`open -a Figma` 启动/聚焦 Figma → `figma://plugin/<id>` 深链启动 html.to.design 插件 → 重试导入（最多 3 轮），点击按钮不依赖人事先开好插件。
>
> 无 demo 源（三层取源全落空）时任务**直接失败**（日志「三层取源均未命中，任务放弃」）。原「退回 claude 自由设计（figma-remote）」的 LLM 兜底已于 2026-10-23 删除——token 消耗不可控。

---

## 组件与位置

| 组件 | 位置 | 说明 |
|---|---|---|
| 桥接服务（权威源码） | 本仓库 `tools/figma-bridge/server.js` | 收任务、取源、调 mcp.to.design、回写飞书；Node 25 自带 fetch，`ws` 已装但 v3 不再使用 |
| 桥接凭据 | `tools/figma-bridge/auth.json`（gitignore） | service account / refresh token，仅本机 |
| 飞书多维表格 | `https://milesight.feishu.cn/base/F2MebgSgMaUZSbseUWLcefqbnKd?table=tbln6WxfFJ6iYaek` | UI demo 表，字段：Demo名称/产品分类/需求描述/提示词/demoUrl/Figma链接 + 按钮字段 |
| 自动化工作流 | 多维表格内「UED确认转Figma通知设计师」 | 按钮触发 → HTTP 请求 → 发飞书消息 |
| cloudflared 隧道 | quick tunnel，域名随重启变化 | 本机二进制 `~/.local/bin/cloudflared`（brew 4.x 有兼容问题，直装官方 release）；`~/.local/bin/cloudflared tunnel --url http://localhost:8080`，日志 `/tmp/bridge-tunnel.log` |
| html.to.design MCP | `https://mcp.to.design`（云端） | OAuth 认证；中继到 Figma 插件 |
| html.to.design 插件 | Figma 内运行，**MCP 标签页** | 必须与 `--login` 授权同一账号；离线时桥接自动拉起（插件 ID `1159123024924461424`），导入落到插件所在文件的当前画布 |
| lark-cli | `/usr/local/bin/lark-cli` | 回写多维表格，用户身份登录 |

---

## 一次性配置（新人视角）

### 1. Figma 端：插件一次就位（之后桥接自动拉起）

Figma 里打开 **html.to.design** 插件 → 登录账号（与第 2 步 `--login` 用同一账号）→ 切到 **MCP 标签页** → 状态点绿色 Ready。首次手动到位后，日常点击按钮桥接会自动拉起 Figma + 插件（3 轮重试）；插件通常停留在上次使用的标签页，若被切走，按报错提示手动回到 MCP 标签页即可。
插件开着时，导入落在**当前打开的文件**里；换文件 = 在目标文件里重开插件。

### 2. 桥接授权（一次性，浏览器点一次）

```bash
cd tools/figma-bridge
node server.js --login
# 浏览器弹出 html.to.design 登录页（用插件同一账号）→ 授权
# 自动完成：动态注册 MCP 客户端 → PKCE 授权码 → 保存 refresh token（14 天）→ 铸 service account（长期）
```

- service account 铸成功后**永久免续期**；未铸成功则靠 refresh token，**14 天后重跑 `--login`**。
- 凭据存 `tools/figma-bridge/auth.json`（已 gitignore），**绝不入库**。

### 3. 启动桥接（本机）

```bash
cd tools/figma-bridge && npm install ws   # 首次
nohup node server.js >> /tmp/bridge-server.log 2>&1 &
curl http://127.0.0.1:8080/health    # {"ok":true,"mode":"h2d","auth":"service-account",...}
```

### 4. 启动隧道（每次重启域名会变）

```bash
~/.local/bin/cloudflared tunnel --url http://localhost:8080 >> /tmp/bridge-tunnel.log 2>&1 &
# 记下输出的 https://xxx.trycloudflare.com
```

可选：`export H2D_PUBLIC_BASE=https://xxx.trycloudflare.com` 再启动桥接——import-html 失败（如 demo 过大）时自动改走 import-url 经公网取页。

### 5. 飞书工作流配置（HTTP 请求节点）

| 项 | 值 |
|---|---|
| 方法 | POST |
| URL | `https://<当前隧道域名>/task`（隧道换了要回来改） |
| Header | `Content-Type: application/json` |
| Body（Raw/JSON） | 见下 |

```json
{
  "demoName":    "<引用：Demo名称>",
  "category":    "<引用：产品分类>",
  "requirement": "<引用：需求描述>",
  "prompt":      "<引用：提示词>"
}
```

> `record_id` 可加可不加。加了 → 桥接直接写那一行；不加 → 桥接按 **Demo 名称** 自动反查记录再回写。
> `demoUrl` 可选。带了 → 直接作为导入源；不带也会走「本地归档 / 表格反查预览 URL」兜底（见下节）。

### 6. lark-cli 登录（回写的前提）

```bash
lark-cli auth login    # 用户身份；scope 需含 base:app:update、base:field:read
```

---

## 已踩过的坑（关键，改动前必读）

1. **插件不在线时自动拉起**：mcp.to.design 是中继，所有导入都经 Figma 里登录同账号、停在 MCP 标签页的插件。插件离线时桥接自动 `open -a Figma` + 深链启动插件并重试（3 轮，冷启动约 1 分钟）。仍失败的排查顺序：插件登录账号与 `--login` 是否一致 → 是否停在 MCP 标签页 → Figma 桌面端是否正常。
2. **导入落点是插件的当前画布**：html.to.design 不会自己新建文件，落在插件所在文件；想导到哪个文件就在哪个文件里开插件。
3. **凭据有效期**：service account 长期有效；只有 refresh token 时 14 天过期，桥接日志出现 401/token 端点报错 → 重跑 `node server.js --login`。
4. **demo 过大**：单文件 demo（内联 CSS/JS）几百 KB 起步。桥接已剥离 HTML 注释；import-html 仍失败时，配置 `H2D_PUBLIC_BASE`（隧道域名）后自动改走 import-url 公网取页兜底。
5. **JS 渲染的 demo 依赖真实浏览器执行**：html.to.design 在浏览器环境渲染导入的 HTML，内联 `<script>` 会执行（EG71 壳 `MS_EG71_SHELL.render()` 正常出全页）。
6. **隧道域名易变**：cloudflared quick tunnel 每次重启换域名，工作流 URL 要同步改；固定方案待做（named tunnel + 自己的域名）。
7. **组件库引用规则**：html.to.design 导入是机械转录（产出普通图层，非库组件）；组件回填由设计师在 Figma 内做，库规则见 `.claude/rules/figma-asset-libs.md`。（原坑 7「claude 自由设计模式仍走 claude」已随该模式删除。）

---

## demo 还原模式（默认行为）

表格里的 demo 是唯一基准：命中 demo 源即 1:1 导入（布局/文案/色值由插件按浏览器渲染结果转录），桥接不再做截图/spec 提取，也不经 LLM。

demo 源三层解析（行内产物是权威基准，本地归档可能落后于云端，故后置）：

| 层 | 来源 | 说明 |
|---|---|---|
| 1 | Body 里 `demoUrl` | 工作流显式带的飞书云盘附件链接（markdown 包装也行），自动 `lark-cli drive +download` |
| 2 | 反查表格「预览 URL」列再下载 | **触发行自己的云端产物**（权威基准；覆盖多机提交、本地旧版的场景） |
| 3 | 本地归档 `05_release/REQ-###/demo.html` | 预览列为 UNC 占位或无链接时兜底 |

---

## 全状态导出契约 `MS_FIGMA_EXPORT`（demo 侧内嵌，桥接自动消费）

html.to.design 抓的是**渲染后的 DOM 快照**，导出页可以自带 JS：加载时逐态渲染、克隆、网格平铺，插件一次抓到全状态成品（不用逐个状态手动导）。桥接 import 前检测 demo 里的 `window.MS_FIGMA_EXPORT`，命中则经 `tools/figma-bridge/export-page.js` 注入铺开脚本；**无契约按单页原样导入（现状不变）**。

demo（A4 渲染产物）在 `</body>` 前内嵌：

```html
<script>
window.MS_FIGMA_EXPORT = {
  rootSelector: '#app',             // 要克隆铺开的根容器
  columns: 1,                       // 网格列数（整页 demo 建议 1）
  frameWidth: 1440,                 // 每帧固定宽
  hideSelectors: ['.demo-menu'],    // 导出时隐藏的演示辅助 UI
  settleMs: 200,                    // 每态渲染后的等待 ms
  reset() {},                       // 可选：每个 setup 前回到初始态；无则要求 setup 自洽
  ready() {},                       // 可选：返回 Promise，等异步初始化完成
  states: [
    { name: '设备列表 · 默认',    setup() {} },
    { name: '设备列表 · 删除确认弹窗', setup() { document.querySelector('[data-modal="delete"]').classList.add('is-open') },
      trigger: '[data-modal-open="delete"]' },   // 可选：函数驱动型 setup 标注触发元素（CSS 选择器）→ 原型连线
    { name: 'SNMP · 禁用态',      setup() { document.querySelector('.bc-eg71-snmp-fields').classList.add('bc-eg71-snmp-fields--disabled') } }
  ]
}
</script>
```

- **状态枚举口径**：覆盖该页关键交互态——页面内 Tab 各态、危险操作确认弹窗、启用/禁用总闸两态、列表空态，与 `interaction-completeness.md` §1 必备状态集对齐。
- **原型连线（可选，自动）**：setup 里真实派发的 `click`（如 `el.click()`）会被自动捕获，落图后该元素挂 Figma `reactions`（ON_CLICK → NAVIGATE 目标态画板），demo 变**可点击原型**；函数直接改 DOM 的 setup（无真实点击）可给该态补 `trigger: '<选择器>'` 标注触发元素。不标注则该态无连线（状态帧照常铺开）。

- **状态枚举口径**：覆盖该页关键交互态——页面内 Tab 各态、危险操作确认弹窗、启用/禁用总闸两态、列表空态，与 `interaction-completeness.md` §1 必备状态集对齐。
- **桥接注入行为**：每态 `reset → setup → settle` → 克隆 root（fixed 元素转 absolute）→ 帧高取当时 scrollHeight → 铺入网格后清空 body；某态 setup 抛错不中断整体，该帧标注「导出失败，按前态快照」。导入名带「· 全状态」后缀。
- **转写友好写法（生成侧要求，AGENTS.md 生成规范第 7 条）**：关键容器不依赖 `aspect-ratio`（写死高度）、间距直白表达不靠叠层技巧、`@media` 缩放仅作演示辅助（铺开层已覆盖 html/body 滚动锁）。

---

## 内部免费通道：html-to-figma-internal 插件（mcp.to.design 的免费替代）

html.to.design 云 MCP 开始收费后，本机自研插件可完全替代导入环节（数据不出内网、零费用）：

```
demo.html → build-scene.js（本仓库 tools/figma-bridge/）
  → 无头 Chrome 逐态渲染（消费 MS_FIGMA_EXPORT 契约，无契约单态）
  → scene.json + figma-export.html 落 ~/Desktop（自动拉起 serve.py :8123）
  → Figma 开发插件（~/Desktop/html-to-figma-internal/，一次性 manifest 导入）
  → 启动即自动拉取落图（文本层/SVG 矢量/帧/圆角/阴影/边框）
```

```bash
node tools/figma-bridge/build-scene.js 05_release/REQ-XXX/demo.html
# Figma：右键 → Plugins → Development → HTML to Figma (Milesight Internal)
```

- 插件侧文件在 `~/Desktop/html-to-figma-internal/`（manifest/code.js/ui.html/serve.py），细节见该目录 README。
- **图标实例化（2026-10-23）**：demo 内联 `MS_ICONS` → 序列化时页内签名反查图标名 → `tools/figma-bridge/icon-keys.json` 映射（74/116 命中 Milesight_IOT_Web 团队库，重建方法见该文件头注释）→ 插件 `importComponentByKeyAsync` 实例化落图，`currentColor` 换算成描边色覆盖；无映射或导入失败自动回退矢量 SVG。图标部分产物从普通图层升级为**库组件实例**（REQ-016 实测 11/11 识别、9 实例化）。
- **控件库实例化（2026-10-24）**：`tools/figma-bridge/component-keys.json` 映射 demo 类名（ms-btn/ms-input/ms-select/ms-switch/ms-checkbox/ms-radio/ms-tag/ms-empty 等）→ 两份发布库组件 key（（新版本）网关/路由器 通用业务组件库 + Milesight_IOT_Web，libraryKey/重建方法见该文件头注释）。build-scene lib-pass 给命中节点打 `n.lib` 标记（修饰类 → 变体 token、直接文本 → 覆写文案；**子树原样保留**作导入失败回退）；插件**属性驱动实例化**（按官方手册 developers.figma.com 契约，2026-10-24 核对）：读 `componentPropertyDefinitions` → VARIANT 按修饰类 token 匹配 `variantOptions` 选值 + 子组件 `variantProperties`（官方读法，不解析变体名）计分择变体 → `createInstance` → `setProperties(payload)`（VARIANT=选项串 / BOOLEAN=图标·禁用推断 / TEXT=demo 文案；SLOT/INSTANCE_SWAP 保持默认，右侧面板 preferredValues 属定义侧）→ 库未暴露 TEXT 属性时兜底覆写首个文本层；任一步失败回退整块重绘。铁律：**EG71（网关）HTML 必走本映射调用库基础组件；业务库已有整块形态优先直调实例**——壳侧边栏（`bc-eg71-sidenav`）已启用直调业务库「侧边栏-账户」，壳母版组件内嵌库件可整体换库/切变体；其余复合块（标题/弹窗/Tab 栏/导航栏）挂 key 待逐个启用。重复块去重与库实例化叠加：重复工具栏收进本地组件 def，库按钮实例嵌在 def 内部（改一处处处生效）。
- **视觉保真对齐 html.to.design（2026-10-24，五期）**：①**图片**——`<img>`/`<canvas>`/背景底图不再丢弃，序列化捕获 src/fit/圆角（canvas 就地 toDataURL），插件 `figma.createImageAsync` 落 IMAGE fill（hash 缓存，data URL 与远程 URL 均支持，manifest networkAccess 已放开），失败保留空矩形占位；②**渐变**——backgroundImage 图层逐层解析（linear 角度精确换算 gradientTransform、radial 近似内切圆、停靠点无位置按最近已知插值），与背景色按 CSS 层序合成 fills；③**自动布局**——flex 容器**置信转换**：nowrap、非 reverse、justify/align 在 Figma 可映射集、子节点全流内（无 absolute/fixed、无 visibility:hidden）、无文本+元素混排、边框统一（转 INSIDE 描边）或无、主轴总尺寸吻合（无 grow/shrink 失真）→ 打 `al` 标，插件子节点落齐后转 layoutMode/padding/gap/对齐（REQ-017 转 606 容器，改文案增删内容不错位）；任一条件不过保持绝对定位——宁可不转，不可转错。拍平/去重签名均已纳入 bg/al（AL 容器不拍平）。
- **库引用契约修复 + 颜色择变体（2026-10-25）**：`importComponentByKeyAsync` 只认 component key，**组件集 key 必须走 `importComponentSetByKeyAsync`**——此前 19/20 条映射是 set、全走错 API 静默抛错回退，库组件实例为 0（根因：mock 的 import API 比真 API 宽松，测试绿灯掩盖）。现插件先试 component API 失败回退 set API（`kind` 元数据不可信），build-scene 采集块背景色 `n.lib.col`，token 未决变体轴按「变体子组件主导填充色 vs HTML 背景色」比色距裁决（胜出 <0.12 且领先 >0.12），set 级裁决（含颜色）写入 setProperties；完成通知报库导入失败/回退/颜色择变体计数，实例 0 即异常。规则固化见 `.claude/rules/figma-asset-libs.md` §4（库引用契约）。REQ-017 实测命中 230 处（按钮 210），修复后将全部落为库 Button 实例。
- **复合块实质库引用（2026-10-25，First Draft 形状匹配逻辑）**：原子控件之外，复合块按「形状匹配才整块替换」启用三类库直调（`guard` 守卫，见规则 §4.3）——纯文本标题 → 业务库「标题」实例（带开关形态贴 with-switch 变体）；简单确认弹窗（`ms-mask` 全页蒙版）→ 业务库「弹窗」整页实例（自带 1440×900 蒙版 + 语义布尔 Info/Error/Waiting/Warn/Success，`ms-spin`→Waiting、`--danger`→Error，多文本经 TEXT 属性逐段覆写）；页签栏 `bc-eg71-page-tabs` → web 库 Tabs/Top 三层嵌套 swap（→ Components/Tabs-Top Item 数量 → 逐 Tab Selecte 选择 + 文案）。变体裁决升级为 token → 颜色 → **形状**（字号差+文本数差+开关有无+宽高比打分）。富弹窗（进度条/上传/统计）守卫不过 → 本地重绘 + 内件实例，不硬凑。mock 54/54、四 verify 基线 100%；REQ-017 命中 242 处（+tabs×10、弹窗×1、标题×2）。
- **其余待做（html.to.design 对齐轴）**：富文本分段（span 级混排）、Variables 样式绑定、旋转 transform、多宽度断点导入（原型连线已于 2026-10-25 R5 落地，`MS_FIGMA_EXPORT.states[].trigger` → Figma reactions）。
- **变体分组 + 组件画板 + 命名/去嵌套（2026-10-24，设计师视角）**：①重复块 def 同名（同家族）≥2 个即互为变体——build-scene 产出 `vname`（块内首段文本）变体标签，插件 `figma.combineAsVariants` 合成 COMPONENT_SET（右侧面板直接切变体），不再散落成孤立组件；②全部组件定义收进「组件定义 · <功能名>」画板，按家族分节、节内网格换行（替换旧的一条长龙散排）；③命名规范——主画板 = demo `<title>`（如「EG71 · Data Library · Inbuilt Update」），状态帧 = 契约 state 名，组件 = 类名家族 + 文本变体，图层名 = 类名/文本，不出现无名层；④去多余嵌套——无视觉贡献且无 `bc-/ms-` 语义类的透传容器在序列化后拍平（子树坐标换算进父级，REQ-017 拍平 630 层，终态节点 −100），库标记子树内的保留作回退数据。⑤「能引用 MS 库坚决不自己造」的边界：原子控件与整块壳件（侧边栏）一律库实例；含动态内容的复合块（弹窗/Tab 栏/标题行）保持本地编排、内部原子件全部库实例——整块换库会丢 demo 内容，本地块内已是库件不算「自己造」。持续优化轴（设计师怎么用 Figma，脚本就朝哪做）：已做 组件集变体/画板分节/库实例直调/图层命名/拍平空壳/属性驱动实例化/Auto Layout/图片渐变；待做 原型连线、富文本分段、Variables 样式绑定、按态分页整理。
- 其余产物为普通图层（非库组件），组件回填由设计师在 Figma 内做（同坑 7；图标已由上条解决）。
- **桥接（按钮链路）当前仍走 mcp.to.design 收费通道**；切换为「build-scene.js + 深链拉起内部插件」是既定演进方向。

---

## 日常使用

1. 多维表格某行点按钮（Figma/插件没开也没关系，桥接自动拉起）
2. 工作流立刻发一条飞书消息（固定文案，不代表完成）
3. 等分钟级，刷新表格——「Figma链接」列出现地址即完成
4. 打开链接进 Figma 可编辑设计稿（落在插件当前文件）

## 排障

| 症状 | 查哪 |
|---|---|
| 按钮点了没反应 | `/tmp/bridge-server.log` 有没有新 `[task]`；没有 → 工作流 URL 是否过期（隧道换域名） |
| 插件自动拉起 3 轮仍失败 | 插件登录账号与 `--login` 不一致 / 没停在 MCP 标签页（坑 1） |
| 401 / token 端点报错 | 凭据过期，重跑 `node server.js --login`（坑 3） |
| import-html 失败 | 桥接日志 `[h2d:...]`；过大 → 配 `H2D_PUBLIC_BASE` 走 import-url 兜底（坑 4） |
| 导入成功但表格没回写 | 桥接日志找 `[writeback:...]`：`反查失败/没找到记录` → Body 里 demoName 与表格列值不完全一致（注意空格）；lark-cli 退出码非 0 → token 过期，重跑 `lark-cli auth login` |
| 导入了但链接列没 URL | mcp.to.design 返回体里没带 figma.com 链接——把 `[h2d:...] 导入完成` 后的日志贴出来排查 |
| 导入结果只有默认单页态 | demo 未内嵌 `MS_FIGMA_EXPORT` 契约（grep demo 源）；契约在但某态缺失 → 该态 setup 抛错，帧标签带「导出失败」 |

## 安全红线

- 桥接 OAuth 凭据（auth.json）、Figma PAT 等**只存本机文件，绝不入库**（auth.json 已 gitignore）
- 隧道只暴露 `/task`、`/health`、`/demo/:id` 端点；扩展暴露面需先获使用者明确同意
- 多维表格 base token 写在本文档中属于团队资源坐标，非密钥
