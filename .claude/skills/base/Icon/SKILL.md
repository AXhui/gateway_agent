---
name: Icon
version: 1.2.0
description: 图标（基础组件）
---

# Icon · 图标

> **分类**：基础
> **Figma**：-
> **组件目录**：`../../../../frontend/components/Icon/`
> **运行时真源**：`assets/js/registry-business.js` → `window.MS_ICONS`（唯一源，115 枚）

---

## 1. 描述

基于 Lucide 图标集（1.5 描边、24 viewBox、`currentColor`）的统一图标资产，`size` 默认跟随父级字号，颜色继承文字色。完整图标清单见 [references/icons.md](references/icons.md)。

**不是什么**：不是插画/品牌图形容器（用 `Logo` / 图片）；不允许混入第二套图标体系（iconfont 字体、外链图标图片、emoji 充当图标——一票否决，见 `rules/spacing.md` §3）。

**取材来源**：真实产品 iconfont（iconfont.cn 项目 4834330，`at.alicdn.com/t/c/font_4834330_bgfadakjpfr.css`）的图标词汇经 Lucide 对齐后注册进 `MS_ICONS`。该外链 CSS **只作取材参照，禁止作为运行时依赖**（demo 单文件零外链铁律）。产品 iconfont 的实心变体（`*-f`）不注册——语义状态一律走描边形 + 语义色 token（`ms-tag--success` 等）。

## 2. Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `-` | **antd 别名**（对应 `icon`）：图标名，取值见 [references/icons.md](references/icons.md) |
| `size` | `number` | `16` | 图标尺寸（px），默认 1em 跟随字号 |
| `color` | `string` | `'currentColor'` | 图标颜色 |
| `style` / `className` | `-` | `-` | 透传 |

运行时调用（demo 内联 `registry-business.js` 后）：`MS_BIZ_UTIL.ico(name, size)` → `<span class="ms-ico ms-ico--{size}"><svg…></span>`；未注册名回落 `info`。

## 3. 状态

| 状态 | 表现 |
|------|------|
| 默认 | `currentColor` 继承文字色 |
| 主色强调 | `--color-primary-normal` |
| 次级 | `--color-text-secondary` |
| 禁用 | `--color-text-disable` |
| 加载 | `loaderCircle` + 旋转动画（按钮 loading 态） |

五轴交互：无交互，五轴豁免（回指 `INTERACTION.md` 总纲）。

## 4. 场景

**何时用**
- 按钮/菜单/表格操作列的**语义图标**（删除、编辑、搜索）。
- 状态/类型标识（成功、警告、错误，配语义色）。
- 导航/菜单入口的辅助图标。
- 需要**视觉锚点**降低阅读成本的场景。

**何时不用（改用其他组件）**

| 场景 | 改用 |
|------|------|
| 纯装饰且无语义 | 直接省略 |
| 需要文字承载语义 | 图标 + 文字并用，不要只留图标 |
| 复杂插画/品牌图形 | `Logo` / 图片 |
| 库里没有的形态 | 走铸造：Lucide 取材 → 注册 `MS_ICONS` → bump 本组件版本；**禁止** demo 现场手写 `<svg>` |

**无障碍**：纯装饰图标 `aria-hidden="true"`；仅图标的按钮必须有 `aria-label`；状态图标不只靠颜色。

## 5. Token

`--color-text-primary`（默认继承）、`--color-primary-normal`（强调）、`--color-text-secondary`（次级）、`--color-text-disable`（禁用）、`--color-error-normal`（危险操作）、`--color-icon-*`（图标专用色系，唯一合法图标颜色来源，见 `rules/spacing.md` §3）。

图标本身无固定色值——`currentColor` 继承。

## 6. 依赖

- 运行时真源：`assets/js/registry-business.js`（`window.MS_ICONS` + `MS_BIZ_UTIL.ico`），A4 渲染时整文件内联进 demo。
- 结构样式：`library/base.css`（`.ms-ico` / `.ms-ico--{14,16,20,24,32}`）。
- 令牌：`.claude/tokens/tokens.css`。
- 无其他运行时依赖；Lucide SVG 为构建期取材（lucide-static 1.58.0），不是运行时依赖。

## 7. 示例

```html
<!-- React 契约用法 -->
<Icon name="search" size={16} />
<Icon name="trash" color="var(--color-error-normal)" />
<Button icon={<Icon name="plus" />}>新建</Button>

<!-- 运行时（demo 内联 registry 后） -->
MS_BIZ_UTIL.ico('nfc', 16)
MS_BIZ_UTIL.ico('loaderCircle', 16)   // loading 态
```

校验页：`output/icon-set-verify.html`（全量 115 枚渲染核实）。

## 8. 版本

见 frontmatter `version:`。
