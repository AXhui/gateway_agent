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

- 唯一映射源：`tools/figma-bridge/component-keys.json`（含 libraryKey/重建方法注释）；重建 = get_libraries 反查 libraryKey → search_design_system `includeLibraryKeys` 定向检索。
- 设计稿必须订阅两份库（资源库面板开启）——`importComponentSetByKeyAsync` 只在库已订阅的文件里可用。
