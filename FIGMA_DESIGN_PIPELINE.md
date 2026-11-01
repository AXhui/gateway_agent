# 飞书按钮 → 本地插件 → Figma 设计稿 — 全链路说明

## 功能

在飞书多维表格（UI demo 表）里点一个按钮，demo HTML 被取回并**登记为插件面板任务**；UED 在插件面板「选择 HTML」下拉里选中该任务点生成，转换落画布，表格行自动回写「已完成」（Figma 链接到表格手填）。

> **面板改版（2026-11-01 用户指令「飞书任务和 html 融合到一起、最好可以选择的」+「浏览器捕获和后台库信息可以隐藏」+「飞书任务的链接融入到本地链接、编号要一致」+「脚本前端，截图部分移除」+「不要区分飞书和本地状态，也不需要有已转状态」+「管理区也没隐藏，整个去掉」）**：「选择 HTML」下拉为**单一列表**——飞书任务（REQ 编号，与表格需求编号列一致，置顶，**无状态标识**；无 demo 源的任务不进下拉）+ 本地 HTML 混排，选中点「生成」即转 + 自动回写；面板每 15s 轮询任务。**「飞书任务」管理区（补填链接 / 重试回写）已整体移除**——Figma 链接到多维表格手填，回写失败下拉重选重新生成即重试。浏览器捕获书签已从前端移除（serve.py `{capture}` 分支保留）；后台/scene/库状态卡移除（连通性诊断收敛到操作时报错提示）。**名称随任务透传（2026-11-01 用户令「名称一起转过去，保持列表一致性」）**：任务构建经面板 `outName` → serve.py → build-scene `--out-name`——桌面参考页名 `REQ-###-export.html`（本地构建取源名，`demo.html` 取上级目录名）、Figma 主画板名 `REQ-### · <demo 标题>`（标题已含则不重复）；不再产泛名 `figma-export.html`。

> **通道裁决（2026-10-31 用户指令，反转 2026-10-25 裁决）**：「点击转 Figma」按钮**默认走本地内部插件**（html-to-figma-internal，组件化/库实例化/令牌绑定全保留）；官方 html.to.design MCP 链路**保留为手动备用**（POST /task 带 `{"engine":"mcp"}` 或环境变量 `H2D_ENGINE=mcp` 时走旧自动导入，见文末附录），按钮不再默认触发它。

```
飞书多维表格 ──点按钮──▶ 自动化工作流「UED确认转Figma通知设计师」
                              │ ① 置状态节点：Figma状态 = 转Figma中（⚠ 必须排在 HTTP 节点之前）
                              │ ② HTTP POST（需求字段，经 cloudflare 隧道 —— 只是加速通道，失败不阻断）
                              ▼
              本机桥接 server.js :8080（engine=local 默认）
                ├─ POST /task：隧道可达时立即登记（加速通道）
                └─ 表格轮询（每 30s，2026-11-01 起）：差分「Figma状态」列，
                   行变「转Figma中」即本地登记 —— 任务到达不再依赖隧道；
                   两路同到由 recordId 去重收敛，POST 保留为快路径
                              │ 三层取源拿 demo.html（demoUrl / 表格反查预览URL / 本地归档）
                              │ 本地归档 → 直接引用路径；云端下载 → 暂存 ~/Desktop/_drops/feishu/
                              ▼
              登记任务 feishu-tasks.json（状态=待转；单写者 server.js，原子替换）
                              ▼  ◀── GET /api/feishu-tasks（serve.py 只读）
              Figma 内部插件「选择 HTML」下拉 · 单一列表（飞书任务 REQ 编号置顶 + 本地 HTML 按最近导入时间排序）
                              │ UED 选中任务点「生成 scene.json 并导入」
                              ▼
              build-scene.js 构建 scene.json（库匹配/令牌绑定/全状态铺开全保留）
                              ▼
              插件导入落画布（库组件实例 + 令牌绑定 + 原型连线）
                              │ 转完不关面板：code.js 发 import-done（closePlugin 会连 iframe 销毁）
                              ▼
              ui.html POST /api/feishu-done → serve.py 转发 server.js POST /done
                              │ lark-cli 回写（record_id 直写 / 按需求编号反查）
                              ▼
              多维表格该行「Figma状态」= 已完成；「Figma链接」列到表格手填（面板管理区已移除）
```

> 无 demo 源（三层取源全落空）时任务直接失败并标表格行「失败」（日志「三层取源均未命中」）。原「无 demo 源走 claude 自由设计」的 LLM 兜底已于 2026-10-23 删除——token 消耗不可控。

---

## 组件与位置

| 组件 | 位置 | 说明 |
|---|---|---|
| 桥接服务（权威源码） | 本仓库 `tools/figma-bridge/server.js` | 收任务、取源暂存、登记队列、/done 回写飞书；engine=mcp 时调官方链路 |
| 任务队列 | `tools/figma-bridge/feishu-tasks.json`（gitignore） | server.js 单写（tmp+rename 原子替换），serve.py 只读展示；状态：待转 → 已转 / 已转·回写失败 |
| 桥接凭据 | `tools/figma-bridge/auth.json`（gitignore） | service account / refresh token，仅本机（mcp 备用链路用） |
| 飞书多维表格 | `https://milesight.feishu.cn/base/F2MebgSgMaUZSbseUWLcefqbnKd?table=tbln6WxfFJ6iYaek` | UI demo 表，字段：需求编号/记录类型/生成人/更新时间/产品分类/需求描述/提示词/demoUrl/Figma链接/Figma状态 + 按钮字段（2026-11-01 改版：Demo 名称列已删，反查键 = 需求编号） |
| 自动化工作流 | 多维表格内「UED确认转Figma通知设计师」 | 按钮触发 → HTTP 请求 → 发飞书消息（无需改动，沿用旧 Body） |
| cloudflared 隧道 | quick tunnel，域名随重启变化 | 本机二进制 `~/.local/bin/cloudflared`（brew 4.x 有兼容问题，直装官方 release）；`~/.local/bin/cloudflared tunnel --url http://localhost:8080`，日志 `/tmp/bridge-tunnel.log` |
| 内部插件（生产链路） | 仓库 `tools/figma-bridge/plugin/` → 部署 `~/Desktop/html-to-figma-internal/` | 面板（飞书任务并入「选择 HTML」下拉，管理区已移除）+ serve.py（:8124，/api/list /api/build /api/feishu-tasks /api/feishu-done）+ code.js 导入 |
| html.to.design MCP（手动备用） | `https://mcp.to.design`（云端） | OAuth 认证；engine=mcp 时中继到官方 Figma 插件自动导入 |
| lark-cli | `/usr/local/bin/lark-cli` | 回写多维表格，用户身份登录；调用全部收敛在 server.js |

---

## 一次性配置（新人视角）

### 1. Figma 端：内部插件部署（生产链路载体）

对 Claude Code 说一句 **「安装 html to design 脚本」**（`install-html-to-design` 技能），自动完成：仓库 `tools/figma-bridge/plugin/` → `~/Desktop/html-to-figma-internal/` → 校验依赖 → 拉起 serve.py → 给出 Figma 导入步骤。手动等价：`mkdir -p ~/Desktop/html-to-figma-internal && cp tools/figma-bridge/plugin/* ~/Desktop/html-to-figma-internal/`，Figma 里 Plugins → Development → Import from manifest 选该目录 manifest.json。

导入落在**当前打开的文件**里；UED 在目标文件里开插件，「选择 HTML」下拉为单一列表，飞书任务（REQ 编号）置顶显示。

### 2. 启动桥接（本机）

```bash
cd tools/figma-bridge
nohup node server.js >> /tmp/bridge-server.log 2>&1 &
curl http://127.0.0.1:8080/health    # {"ok":true,"mode":"local","engine":"local",...}
```

数据服务 serve.py（:8124）由 build-scene 自动保活；手动：`python3 ~/Desktop/html-to-figma-internal/serve.py`。

### 3. 启动隧道（每次重启域名会变；现为加速通道，非必需）

> 2026-11-01 起任务到达有轮询兜底（server.js 每 30s 差分表格），隧道断了/域名过期只是少了 POST 加速路径，不再丢任务。

```bash
~/.local/bin/cloudflared tunnel --url http://localhost:8080 >> /tmp/bridge-tunnel.log 2>&1 &
# 记下输出的 https://xxx.trycloudflare.com
```

### 4. 飞书工作流配置（HTTP 请求节点；沿用旧 Body 无需改动）

> **节点顺序（硬要求，2026-11-01 事故固化）**：「置状态 → Figma状态=转Figma中」节点必须排在 HTTP 请求节点**之前**——HTTP 失败（隧道域名过期）会中断工作流，状态置不上则轮询也取不到任务。最简单：把 HTTP 节点整个删掉（轮询 30s 内取到）。

| 项 | 值 |
|---|---|
| 方法 | POST |
| URL | `https://<当前隧道域名>/task`（隧道换了要回来改） |
| Header | `Content-Type: application/json` |
| Body（Raw/JSON） | 见下 |

```json
{
  "demoName":    "<引用：需求编号>",
  "category":    "<引用：产品分类>",
  "requirement": "<引用：需求描述>",
  "prompt":      "<引用：提示词>"
}
```

> `demoName` 字段名沿用旧 Body 不改，取值改为引用**需求编号**列（2026-11-01 表格改版：Demo 名称列已删）。任何含 `REQ-###` 的字符串都可以——server.js `reqNoOf` 一律提取 `REQ-###` 归一（`REQ-20`→`REQ-020`）后面板显示名与表格反查键。

> `record_id` 可加可不加。加了 → /done 直接写那一行；不加 → 按**需求编号**（`demoName` 提取 REQ-### 归一）自动反查记录再回写（同 REQ 多行时取更新时间最新一条）。
> `demoUrl` 可选。带了 → 直接下载暂存作导入源；不带也会走「表格反查预览 URL / 本地归档」兜底（见下节）。
> `engine` 可选：`mcp` → 走附录的官方自动导入备用链路；缺省 = 本地插件登记。

### 5. lark-cli 登录（回写的前提）

```bash
lark-cli auth login    # 用户身份；scope 需含 base:app:update、base:field:read
```

---

## 已踩过的坑（关键，改动前必读）

1. **closePlugin 会连 iframe 一起销毁**：飞书任务导入成功后 code.js **不能**直接 `figma.closePlugin()`——iframe 没了，回写请求发不出去。链路是：code.js 发 `import-done`（不关面板）→ ui.html POST `/api/feishu-done` 等回写结果 → 成功才发 `feishu-close` 关面板；回写失败面板保持打开、状态行报错，下拉重选该任务重新生成即重试（管理区已移除）。
2. **lark-cli 对不存在的记录也退出码 0**：只把不存在的 id 报在 JSON 的 `data.record_not_found` 数组里。server.js 回写后必须解析该字段——全部 not found 才算失败（任务标「已转·回写失败」）。
3. **serve.py 跑的是 Desktop 部署副本**：Figma 从 `~/Desktop/html-to-figma-internal/` 加载 manifest。改了仓库 `plugin/` 源码要 cp 过去；serve.py 旧进程不重启 = 改动永不生效（build-scene ensureServe 会按 mtime 自动重启，手动改用 kill + 重开）。日志统一落 `~/Desktop/html-to-figma-internal/serve.log`。
4. **插件 API 拿不到自己文件的 URL**：「Figma链接」列无法全自动——状态列自动回写，链接由 UED 直接在多维表格手填（原面板「补填链接」入口已随管理区移除）。
5. **隧道域名易变（已降级为加速通道）**：cloudflared quick tunnel 每次重启换域名，工作流 URL 过期时 POST 到不了本机（飞书通知照发、毫无表迹）。2026-11-01 起 server.js 每 30s **轮询表格差分取任务**——行「Figma状态」变「转Figma中」即本地登记，任务到达不再依赖隧道（首轮只建基线，存量卡「转Figma中」的行不回灌；重新点击/状态变化才登记）。**前提（一次性工作流修改）**：「置状态 Figma状态=转Figma中」节点必须排在 HTTP 节点**之前**（HTTP 失败会中断工作流、状态置不上 → 轮询也看不见——2026-11-01 实测当天点击零登记的根因）。建议把置状态挪到最前或直接删掉 HTTP 节点。
6. **库组件导入要求订阅库**：目标文件须在资源库面板订阅 Milesight_IOT_Web 与网关/路由器业务库，否则 `importComponentSetByKeyAsync` 不可用（完成通知「库组件实例 0」即查这个）。
7. **JS 渲染的 demo 依赖真实浏览器执行**：build-scene 用无头 Chrome 渲染，内联 `<script>` 会执行（EG71 壳 `MS_EG71_SHELL.render()` 正常出全页）。

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

## 内部免费通道：html-to-figma-internal 插件（生产链路载体）

> **通道地位（2026-10-31 用户指令，反转 2026-10-25 裁决）**：「点击转 Figma」的**生产链路走本内部插件**——数据不出内网、零费用，且库实例化/令牌绑定/原型连线等能力官方链路没有；官方 html.to.design MCP 降级为手动备用（见文末附录）。

html.to.design 云 MCP 开始收费后，本机自研插件可完全替代导入环节（数据不出内网、零费用）：

```
demo.html → build-scene.js（本仓库 tools/figma-bridge/）
  → 无头 Chrome 逐态渲染（消费 MS_FIGMA_EXPORT 契约，无契约单态）
  → scene.json + figma-export.html 落 ~/Desktop（自动拉起 serve.py :8124）
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
- **动态找库组件 + 跨导入复用（2026-10-29 用户指令：不要自己生产，去库里找组件引用）**：内部通道在映射表之上加两层「引用优先」兜底——①**库目录动态找回**：导入时 `getAvailableLibrariesAsync` + `getTeamLibraryAsync` 拉每份可访问库的组件目录（key+name），component-keys.json 的 key 失效（库重发布后 key 轮换）按家族名找回现 key 重试；未入映射表的原子 `ms-*` 控件按类名词干与目录组件名归一匹配，就地导入实例化（复合容器含子框架不整块替换，仍本地编排、内层原子各自命中——同守卫哲学）。②**跨导入复用**：导入前扫全文件既有组件建索引，重复块 def 同名（vname）且同尺寸（±3px）直接 `createInstance` 引用既有组件，不再每次 `createComponent` 新建（多页面重复块只建一次；全部复用时不再生成「组件定义」画板、不再 combine）。完成通知新增「库目录动态命中 N」「复用既有 N」计数。词干匹配三补（2026-10-29 用户实测「组件库很多没有匹配上」）：目录名归一双轨（全名 + **末段去前导序号**，'2 Navigation/1 Breadcrumb'→'breadcrumb'）、**双语词干桥接**（业务库中文名 标题/弹窗/导航栏/picker-cell ↔ 英文词干别名表）、**权威库优先**（团队空间多库同名组件按库名裁决，Milesight_IOT_Web 与网关/路由器业务库优先）。mock 64/64（新增 key 轮换找回、词干动态命中、二次导入复用三组断言）；verify 四页基线 100% 不受影响（序列化侧未动）。
- **引用即改写（2026-10-29 用户指令：文本按 HTML 填写、内容视觉按 HTML 拼凑）**：库实例落画布后不得残留库默认文案——build-scene 给**每个** lib 命中节点采集深层文本清单 `texts`（阅读顺序 ≤8 段）+ 逐段颜色 `tcols`（此前仅复合块守卫有 texts）；插件侧两级消费：组件 TEXT 属性逐段 setProperties，剩余文本**全部**按阅读顺序回填到嵌套文本层（此前仅首层兜底），并按 tcols 覆盖文本层 fills——文字色跟 demo 而非库默认灰。规则固化见 `.claude/rules/figma-asset-libs.md` §4.6。mock 66/66（新增无 TEXT 属性组件逐层回填 + 文字色覆盖断言）；verify 四页（REQ-014~017）100% 不变；REQ-017 实测 269 处命中全带 texts/tcols。
- **半页蒙版修复（2026-10-29 用户实测「蒙版只有一半」，三根因收口）**：①库「弹窗」实例内部蒙版子帧默认约束固定位置尺寸、**不随实例根 resize 长高**——插件侧 `forceDialogFullPage` 收口：根尺寸到帧宽高（resize 失败走 resizeWithoutConstraints）→ 半透明蒙版子帧强制铺满 0,0 → 弹窗卡片重居中（CSS fixed 居中等价），通知新增「蒙版铺满 N」计数；②蒙版透明度做在**图层**上（fill 不透明 + layer opacity）——`transl` 识别双通道（FILL paint 级 + 图层级），只查 FILL 漏判 → 蒙版识别不到不铺满；③DOM 层 ms-mask 嵌在**有裁切的容器**内——序列化侧把非根级 ms-mask **提升为状态帧直接子节点**（顶层）再强制全幅（子级坐标本就相对蒙版，提升后位置不变），只改宽高不提升会被父容器裁一半。mock 73/73（新增图层级透明蒙版铺满 + 弹窗文案改写断言）。
- **颜色令牌绑定（2026-10-30 用户指令：颜色 token 不要自己新建，去引用基础组件库的 token color）**：内部通道落 Figma 的实色不再新建裸色——全链四段：①注册表 `tools/figma-bridge/token-vars.json`（tokens.css 名 → Milesight_IOT_Web「Color Token」库变量 key 63 条；scopes 不落表以运行时 Variable.scopes 为准；`color-blue-01..10`→库 `color-primary-1..10` 别名直录；同名变量在 UINK 集合发布的排除）；②build-scene 注入 `__MS_TOK_NAMES__` 名单，页内 `getComputedStyle(:root)` 建值→名反查——**自定义属性返回声明字面量而非 rgb() 计算值**（首版根因：正则只匹配 rgb() 全军覆没），解析需覆盖 #HEX/#RGBA/rgb()/`var()` 链 ≤4 跳，自动跟随暗色主题覆写；同值多候选按站点家族优先（text/fill/icon/stroke 四族前缀表）+ 语义名压色阶名；七个采集点打标（文本 `tk`/帧 `ftk`/图标 `ctk`/描边 `stk.tk`·`al.btk`/库实例文本 `lib.ttoks`），verify 路径不注入名单即整体关闭、审计基线不动；③Node 汇总 `scene.tokVars`；④插件 `importVariableByKeyAsync` + `setBoundVariableForPaint` 绑定，**scope 门禁**（错配跳过）+ **读回校验**（绑定后 paint.color 反映变量值，偏差 >0.02 回退裸色——防暗色 demo 进亮色文件/别名值漂移），同步路径描边入队导入尾声 flush；通知报「令牌绑定 N」，0 且有 tokVars 即异常。半透明色/库无名/scope 错配/读回漂移允许裸色。规则固化 `.claude/rules/figma-asset-libs.md` §4.7。mock 85/85（12 条绑定断言：四落点绑定、scope 错配跳过、读回漂移回退、无效 key 回退、计数入通知）；verify 四页 100% 不变；REQ-017 实测 19 个库变量、tk×96/ftk×54/ctk×19。
- **其余待做（html.to.design 对齐轴）**：富文本分段（span 级混排）、Variables 样式绑定、旋转 transform、多宽度断点导入（原型连线已于 2026-10-25 R5 落地，`MS_FIGMA_EXPORT.states[].trigger` → Figma reactions）。
- **变体分组 + 组件画板 + 命名/去嵌套（2026-10-24，设计师视角）**：①重复块 def 同名（同家族）≥2 个即互为变体——build-scene 产出 `vname`（块内首段文本）变体标签，插件 `figma.combineAsVariants` 合成 COMPONENT_SET（右侧面板直接切变体），不再散落成孤立组件；②全部组件定义收进「组件定义 · <功能名>」画板，按家族分节、节内网格换行（替换旧的一条长龙散排）；③命名规范——主画板 = demo `<title>`（如「EG71 · Data Library · Inbuilt Update」），状态帧 = 契约 state 名，组件 = 类名家族 + 文本变体，图层名 = 类名/文本，不出现无名层；④去多余嵌套——无视觉贡献且无 `bc-/ms-` 语义类的透传容器在序列化后拍平（子树坐标换算进父级，REQ-017 拍平 630 层，终态节点 −100），库标记子树内的保留作回退数据。⑤「能引用 MS 库坚决不自己造」的边界：原子控件与整块壳件（侧边栏）一律库实例；含动态内容的复合块（弹窗/Tab 栏/标题行）保持本地编排、内部原子件全部库实例——整块换库会丢 demo 内容，本地块内已是库件不算「自己造」。持续优化轴（设计师怎么用 Figma，脚本就朝哪做）：已做 组件集变体/画板分节/库实例直调/图层命名/拍平空壳/属性驱动实例化/Auto Layout/图片渐变；待做 原型连线、富文本分段、Variables 样式绑定、按态分页整理。
- 其余产物为普通图层（非库组件）的由设计师在 Figma 内回填（同上条；图标/原子控件/壳件已由库实例化解决）。
- **通道裁决（2026-10-31 用户指令，反转 2026-10-25）**：生产链路走本内部插件；官方 mcp 链路保留为手动备用（附录）。

---

## 日常使用

1. 多维表格某行点「转 Figma」按钮——桥接取源、登记任务（`/health` 的 `localPending` +1）
2. UED 在**目标 Figma 文件**里打开内部插件（右键 → Plugins → Development → HTML to Figma (Milesight Internal)），「选择 HTML」下拉单一列表置顶显示飞书任务（REQ 编号；面板每 15s 自动轮询，开着也会出现）
3. 选中该任务点「生成 scene.json 并导入」→ 转换落画布（库实例 + 令牌绑定 + 全状态铺开）→ 完成后**面板自动**回写表格「Figma状态=已完成」并自动关闭
4. 把当前文件的 Figma 链接直接填到多维表格该行（面板管理区已移除；状态已自动回写，链接可跳过）
5. 回写失败时面板不关、状态行报错——下拉重选该任务点「生成」重新走一遍即重试回写

## 排障

| 症状 | 查哪 |
|---|---|
| 面板卡「导入库组件 X/Y...」不动 | 库资产导入停顿（Figma 资产服务偶发不返回）。r13 起每项限时 20s 自动超时兜底不再挂死；r14 起超时不再级联重试、失败 key 缓存短路（停顿 key 只烧一次 20s，不随节点数放大），各阶段状态行带秒数可直接看慢在哪；仍卡 = 面板跑旧代码——**完全关闭面板再重开**（构建号护栏会拒导旧 scene 并提示） |
| 导入明显变慢（分钟级） | 状态行秒数定位慢的阶段：库目录（多库×停顿）→ 预载库组件（停顿 key）→ 逐屏导入；r14 前的 r13 有「超时级联 80s + 失败不缓存×节点数」放大效应，r14 已修——先确认面板是 r14（关面板重开）再排查 |
| 按钮点了表格没动静 | 表格该行「Figma状态」有没有变「转Figma中」；没变 → 工作流 HTTP 节点失败**中断了后续节点**（置状态排在 HTTP 后）——把置状态节点挪到 HTTP 前或删掉 HTTP 节点；变了但面板没任务 → 看 `/tmp/bridge-server.log` 的 `[poll]` 行（每 30s 一查，server.js 是否在跑：`lsof -i :8080`） |
| 下拉没有飞书任务 | `/tmp/bridge-server.log` 有无 `[poll] 表格出现「转Figma中」→ 本地登记`；有登记但下拉没有 → `feishu-tasks.json` 是否待转条目、serve.py `:8124` 是否活着；`/task` 是否走了 engine=mcp |
| 点任务没反应 / build 失败 | `serve.log`（`~/Desktop/html-to-figma-internal/serve.log`）的 `/api/build` 行；demo 路径是否在 serve.py 白名单内（05_release / output / ~/Desktop） |
| 导入成功但表格没回写 | 桥接日志 `[writeback:...]`：`记录不存在` → 表格行已删或 record_id/demoName 对不上；lark-cli 报权限 → 重跑 `lark-cli auth login`。面板留着重试即可 |
| 完成通知「库组件实例 0」 | 目标文件未订阅两份库（资源库面板开启），见坑 6 |
| 完成通知「令牌绑定 0」 | `token-vars.json` key 失效（库重发布）或库未订阅，见 figma-asset-libs.md §4.7 |
| 导入结果只有默认单页态 | demo 未内嵌 `MS_FIGMA_EXPORT` 契约（grep demo 源）；契约在但某态缺失 → 该态 setup 抛错，帧标签带「导出失败」 |
| serve.py 改了不生效 | 跑的是 Desktop 副本——cp 过去 + 重启（坑 3） |

## 附录：官方 mcp.to.design 备用链路（手动，默认不走）

按钮默认走本地插件；需要官方链路时**手动**触发——POST /task 的 Body 加 `"engine":"mcp"`（或桥接进程环境变量 `H2D_ENGINE=mcp`，此时全部任务走官方链路）。链路恢复为 2026-10-25 版自动导入：

```
POST /task {"engine":"mcp", ...} → server.js 队列 → mcp.to.design（OAuth）
  → 自动拉起 Figma + html.to.design 插件（MCP 标签页）→ import-html/import-url
  → 拿到 figma.com 链接 → lark-cli 回写 Figma链接 + Figma状态
```

### 备用链路专属配置（本链路才需要）

```bash
node server.js --login   # 浏览器授权 html.to.design（与插件同账号）；service account 长期有效，仅 refresh token 时 14 天续一次
export H2D_PUBLIC_BASE=https://<隧道域名>   # 可选：import-html 失败（demo 过大）时走 import-url 公网取页兜底
```

### 备用链路专属坑

- **插件必须在线且停在 MCP 标签页**：离线时桥接自动 `open -a Figma` 深链拉起（3 轮重试，冷启动约 1 分钟）；仍失败查账号一致性 / 标签页 / Figma 桌面端。
- **导入落点是插件当前打开的文件**；想导到哪就在哪开插件。
- **凭据**：auth.json（gitignore）——401/token 报错重跑 `--login`。
- **官方导入是机械转录**（普通图层，无库实例/令牌绑定），组件化需设计师回填；链接列由官方返回体带出、自动回写。

## 安全红线

- 桥接 OAuth 凭据（auth.json）、Figma PAT 等**只存本机文件，绝不入库**（auth.json 已 gitignore）
- 隧道只暴露 `/task`、`/health`、`/demo/:id` 端点；扩展暴露面需先获使用者明确同意
- 多维表格 base token 写在本文档中属于团队资源坐标，非密钥
