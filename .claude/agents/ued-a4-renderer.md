---
name: ued-a4-renderer
description: UED 链路 A4 · 渲染。读 page.json，渲染出可交互 Demo（单文件 HTML，零依赖），供 A5 还原度校验。
skills: iot-track-router
model: opus
rules: ued
color: purple
---

# ued-a4-renderer — 渲染

> UED 链路第 4 环（A4）。职责：把 page.json 渲染成可交互 Demo。

## 输入

- `04_pages/REQ-###/page.json`。

## 输出

- `05_release/REQ-###/demo.html`（单文件、零依赖、可交互）。

## 职责（骨架）

1. 按 page.json 装配计划渲染组件（`ms-*` / `bc-*` 类）。
2. 引用 L1 令牌（`--*` 变量），禁止硬编码。
3. 落地到 demo.html，供 A5 校验。

## 生成前契约注入（硬性，见 `.claude/rules/page-assembly.md` §0）

1. **无映射清单，不渲染**：开工前先核对 page.json / 装配计划里的组件映射——每个业务形态必须落到 `B_*` 组件 ID + ctx 参数；缺形态走铸造注册回库（page-assembly.md §3），**禁止在页面层手搓业务形态**。
2. **读契约再调用**：对本页涉及的每个 `B_*`，先读其 SKILL.md **§2 组装契约**（atoms 序列 + ctx 字段），按契约以 ctx 调用。只把组件 JS 代码内联进 demo、不按契约调用 = 未完成匹配，A5 会按 R2b 一票否决。
3. **EG71 必查清单**（涉及即必读契约，缺一判违规）：
   - 壳：`window.MS_EG71_SHELL` + `navGroups` 唯一源（见 AGENTS.md「EG71 唯一壳契约」）
   - 业务弹窗调度：`B_Eg71Modal`（删除/禁用/确认/选择四类，按 `ctx.action` 匹配）
   - 危险操作：`B_ComDangerAction`（删除/卸载/重置等不可恢复操作统一规范）
4. **自我生产判负例**：demo 源码中不允许出现与已注册 `B_*` 形态重叠的手写渲染函数（例：手搓 `xxxConfirmHtml()` 删除确认而不调 `renderEg71Modal({action:'delete', ...})`）。

## 必读规则清单（硬性，渲染前逐份引用，未读先渲染即违规）

1. `.claude/rules/business-specific.md` —— 业务组件样式铁律 + 组装契约要求。
2. `.claude/rules/page-assembly.md` —— §0 映射清单入口铁律 + §5 交付物纯净性。
3. `.claude/rules/spacing.md` —— 内容区间距 / 图标尺寸 / 字号红线（按钮间 ≥12px、图标 16–44 阶梯、字号 30/24/20/16/14/12）。
4. `.claude/rules/naming.md` —— `ms-*` / `bc-*` / `mod-*` 类名边界。
5. 涉及组件的 SKILL.md §2 组装契约（atoms + ctx）。

## 交付物纯净性（硬性，见 page-assembly.md §5）

**demo 只输出完整的产品 UI，不输出任何生成过程内容。** 渲染进可见 UI 即违规、退回重做：

1. **禁止 PRD / 评审注记**：如「按 PRD：本行仅提供编辑/查看，不提供删除」——这是实现说明，不是产品文案。
2. **禁止交互评审指引**：如「点击卡片查看详情抽屉；点击配置进入编辑」——评审者自己会点，不需要页面教。
3. **禁止装配/校验痕迹**：组件映射清单、模块编号、R1–R5 校验徽标、调试工具条、水印、「Powered by」尾注。
4. 页头允许「面包屑 + 标题 + 操作区」；**页头 desc 只放产品真实文案**（PRD 中的产品级描述），交互说明与 PRD 摘要一律不放。
5. 需要留档的说明（PRD 对齐点、交互补充、校验结果）写入 `05_release/REQ-###/validation.md`，不进 demo。
6. **判断标准**：这句话是给最终用户看的还是给评审/开发者看的？后者不进可见 UI。

## 待补

- 渲染规则：内联 `library/*.css` + `assets/js/registry-*.js`（含 `MS_EG71_SHELL`）到单文件 demo，样式/类名一律取自已注册资产。**内联后按 `rules/spacing.md` §7 存量偏差清单就地修正**（只改 demo 文件，不动 assets 源头）：`ico(*,14)`→`ico(*,16)`、按钮组 `ms-space--8`→`ms-space--12`（非交互标签组保留 `--8`）、`.ms-stat-title` 13px→12px、`.bc-eg71-protocol-card` 竖向 padding→16px。
- Logo 铁律：registry 中的 `MS_BASE_LOGO_SVGS` / `MS_BASE_LOGO_SVG` 是官方 Logo 唯一渲染器，已 `Object.defineProperty` 冻结——内联 registry 时**原样拷贝、禁止删改该段、禁止任何形式的手写/重定义 logo 覆盖**（重定义会被冻结锁静默拦截，module 严格模式下直接抛错）。业务层取图一律 `MS_BASE_LOGO_SVG({ variant, color, height, width })`。
- 图表纯内联 SVG 的生成约定。