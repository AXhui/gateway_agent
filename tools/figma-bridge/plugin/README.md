# HTML → Figma（Milesight 内部插件）

把自家 demo 页（单文件 HTML）转成**原生可编辑 Figma 图层**（文本层/图标库实例/SVG 矢量/帧/圆角/内外阴影/边框），数据全程不出内网，**不依赖 html.to.design（免费）**。

## 原理

```
demo 页（含 MS_FIGMA_EXPORT 全状态契约）→ build-scene.js（仓库 tools/figma-bridge/）
  → 注入序列化脚本 → 无头 Chrome 逐态渲染 → walk DOM + computed style → scene.json 落桌面
        → serve.py（127.0.0.1:8124，CORS + /api/list 清单 + /api/build 构建，build-scene.js 会自动拉起）
        → 插件面板选 HTML → 生成 scene.json → 落图（图标/控件走库实例，库目录动态找回）
```

- **图标实例化**：demo 内联的 `MS_ICONS`（Lucide 集）经签名反查识别后，按 `tools/figma-bridge/icon-keys.json` 映射成 **Milesight_IOT_Web 团队库图标组件实例**（颜色按 currentColor 换算成描边覆盖）；无映射/导入失败自动回退矢量 SVG。库映射重建方法见 icon-keys.json 头注释。
- **颜色令牌绑定（2026-10-30）**：落 Figma 的实色不新建裸色——build-scene 按 tokens.css 令牌名反查（跟随页面主题）产出 `scene.tokVars`，插件按 `tools/figma-bridge/token-vars.json` 注册表 `importVariableByKeyAsync` 导入库「Color Token」变量并 `setBoundVariableForPaint` 绑定（scope 门禁 + 读回校验，库值≠demo 色自动回退裸色）；改库变量全局改稿。完成通知报「令牌绑定 N」，N=0 且有 tokVars 即异常（查注册表 key / 库订阅）。
- **引用即改写（2026-10-29）**：库实例落画布后文案/文字色一律按 HTML 改写——序列化侧每个命中节点带深层文本清单+逐段颜色，插件侧 TEXT 属性逐段写入、剩余按嵌套文本层逐层回填，库默认文案不残留；变体按 HTML 颜色/形状证据裁决。
- **蒙版全页三根因收口（2026-10-29）**：库弹窗实例内部蒙版不随根 resize → 强制铺满+卡片重居中（通知报「蒙版铺满 N」）；蒙版透明度做在图层上（非 FILL）→ 双通道识别；DOM 蒙版嵌在有裁切容器内 → 序列化侧提升到状态帧根再全幅。
- **词干匹配三补（2026-10-29）**：目录名末段归一（去路径前缀/序号）+ 中英文词干桥接（标题/弹窗/导航栏…）+ 权威两库优先（防多库同名命中错误库）。
- 状态来源：demo 内嵌的 `window.MS_FIGMA_EXPORT` 契约（Tab 各态/弹窗/启用禁用/空态，见仓库 AGENTS.md 生成规范第 7 条）；无契约回退单态。
- 同时产出 `figma-export.html`（全状态铺开参考页，浏览器打开可与 Figma 结果对照）。

## 安装（换电脑一句话）

本目录（仓库 `tools/figma-bridge/plugin/`）是插件**唯一真源**，随 git 走。换电脑后对 Claude Code 说一句 **「安装 html to design 脚本」**，即触发 `install-html-to-design` 技能：同步本目录 → `~/Desktop/html-to-figma-internal/`（Figma 已登记的固定路径）→ 校验依赖（Node / Chrome / python3）→ 确认 serve.py → 给出 Figma 导入步骤。

手动等价操作：

1. `mkdir -p ~/Desktop/html-to-figma-internal && cp tools/figma-bridge/plugin/* ~/Desktop/html-to-figma-internal/`
2. 打开 Figma 桌面端 → 任意 design 文件
3. 菜单 **Figma → Plugins → Development → Import plugin from manifest…**
4. 选 `~/Desktop/html-to-figma-internal/manifest.json`

之后改动仓库源（git pull / 直接编辑）：重跑同步（技能或上面第 1 步命令）+ 完全关闭再重开插件面板即生效，**无需重新导入 manifest**。

## 每次使用

1. 数据服务跑着即可（build-scene.js 检测 8124 端口空闲时会自动拉起；手动：`python3 ~/Desktop/html-to-figma-internal/serve.py`）
2. Figma 里 **右键 → Plugins → Development → HTML to Figma (Milesight Internal)**，面板两步走：
   - **① 选择 HTML**：下拉选要转换的 demo（扫描 `05_release/` / `output/` / 桌面，按修改时间排序）；或**把 .html 文件直接拖进面板任意位置**；或在链接框**粘贴 http(s) 链接 / 本地绝对路径**后点「导入链接」（面板空白处粘贴链接会自动填入）。三种入口点后都走「生成 scene.json 并导入」。**入口模式差异（2026-10-30 用户裁定：复制的网页链接不走本地组件）**：粘贴的 http(s) 链接一律按**外部网页模式**导入（serve.py 传 `--ext` → scene.ext）——纯图层转录，跳过本地组件库匹配、组件化、图标库映射、颜色令牌绑定，也不拉库目录，完成通知报「外部网页 · 纯图层（不走本地组件库）」；本地路径（下拉/绝对路径）与拖拽文件仍是自家 demo，组件体系照常全套。**链接多页转录**：链接导入自动发现入口页里的同源页面（导航区链接优先、去重、上限 8，`--pages` 可调），逐页抓取转录，一次落「1. 入口 + 2..N 子页」多帧（帧名取链接文字）；相对 CSS/图片按原始域名解析（补 `<base>`）。仅覆盖带真实 href 的页面，纯 JS 路由与登录后的页面不自动发现。
   - **② 组件匹配（全自动，面板无此区块）**：库匹配零手动步骤、无可选项，面板不再设独立「组件库」区块（2026-10-30 用户指令：没有选择就隐藏），状态收进面板下方状态卡的「库」一行；导入按 HTML 内容自动匹配团队库组件，命中即按组件 key 直接加载成库实例，无权限/未启用自动回退本地重绘。匹配三层（引用优先，不自己生产）：**快路径** component-keys.json / icon-keys.json 映射（含变体 token 与复合块守卫）；**库目录动态找回**（2026-10-29）——key 失效（库重发布 key 轮换）按家族名从 `getTeamLibraryAsync` 库目录找回现 key 重试，未入映射表的原子 `ms-*` 控件按类名词干匹配目录组件名就地实例化（复合容器仍本地编排）；最后才回退重绘。**跨导入复用**：重复块 def 同名同尺寸即引用本文件既有组件（多页面重复不再每次新建组件）。建议在 Figma 资源库面板启用 Milesight_IOT_Web 与（新版本）网关/路由器 通用业务组件库两份库——启用后组件集（Button/Input/Select 等）稳定落成库实例；完成通知里的「库目录动态命中」「复用既有」即两层兜底统计，「库导入失败数」为最终回退（库实例 0 = 异常，查 key / 库订阅 / 库目录）
3. 高级：终端手动 `node build-scene.js <demo.html>` 生成后面板直接「导入当前 scene.json」，或粘贴 scene.json 全文导入

> HTML 允许范围（serve.py `/api/build`）：`{path}` 仅接受白名单根（仓库 `05_release/`、`output/`、`~/Desktop`）内的 HTML；**拖拽文件**与**链接导入**的内容存 `~/Desktop/_drops/` 再构建（不参与下拉列表扫描）；链接仅 http(s)，单文件上限 20MB。

## 约束（v1）

- 覆盖：实色填充 / 圆角 / box-shadow（外+内）/ 边框（合成等宽填充条）/ opacity / overflow 裁切 / 文本（字号/字重/行高/字距/颜色/对齐，取真实行盒 y）/ 内联 SVG（矢量）/ **库图标（Milesight_IOT_Web 团队库实例，需 Figma 账号可访问该团队库）**
- 不覆盖：渐变、背景图、伪元素、img/canvas；字体统一映射 **PingFang SC**（与组件库 tokens.css `--font-family` 对齐；PingFang 无 Bold，700+ 退化 Semibold）——Figma 桌面端首次需在 设置 里允许「字体读取权限」，取不到时自动退 Inter Regular（可在 code.js 顶部 FONT_FAMILY 改）
- 只用于自家 demo 页（CSS 子集已知）；任意网页不在目标内
- serve.py 以 `~/Desktop` 为根开 CORS、`/api/build` 仅接受白名单根（`05_release/` `output/` `~/Desktop`）内的 HTML——导入间隙仍建议关掉，避免本机文件被网页跨域读取
