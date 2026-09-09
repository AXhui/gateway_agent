---
name: Logo
version: 2.0.0
description: 品牌标识（基础组件，直接引用官方 SVG 原图）
---

# Logo · 品牌标识

> **分类**：基础
> **Figma**：175-15304
> **组件目录**：`../../../../frontend/components/Logo/`

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**Milesight IOT 品牌 Logo 组件**，提供完整版（full）与紧凑版（compact）两种变体，以及品牌色与白色反色版本，用于页面头部、登录页、文档等品牌露出位置。

### 何时用
- 应用**头部/侧边栏顶部**品牌露出。
- **登录页 / 引导页**品牌展示。
- 文档、报表、导出的品牌标识。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 普通功能图标 | `Icon` |
| 产品截图/插画 | 图片 |
| 非品牌语义的装饰 | 直接省略 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| `variant="full"` | 完整 Logo（M 图形 + "Milesight" 文字），最小宽度 ≥ 120px | 空间充裕时用完整版 |
| `variant="compact"` | 紧凑 Logo（仅 M 图形），最小尺寸 ≥ 24px | 侧边栏折叠态 / favicon / 头像用紧凑版 |
| `color="brand"` | 标准色版（蓝色 M + 深灰文字）→ 浅色背景 | 纸面/浅色文档用 brand |
| `color="white"` | 反白版（全白）→ 深色背景 | 深色 Header 一律用 white |

### 使用规范
- 安全区域：Logo 四周保留最小留白（= M 高度 1/4）。
- 禁止：拉伸/压缩/倾斜；更改颜色或加描边；拆分图形与文字；在 Logo 上叠加元素。
- 选择原则：空间充足 → 完整版；空间有限 → 图形版；浅色背景 → 标准色版；深色背景 → 反白版。

### 无障碍
- Logo 容器有 `aria-label`（如「Milesight IOT」）。
- 作为链接时 `alt`/`aria-label` 承载品牌名。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 默认高度 | 32px | `height` 可调 |
| full 宽高比 | 120×32（3.75:1） | 图形 + 文字，最小宽度 ≥ 120px |
| compact | 32×32 | 仅图形，最小尺寸 ≥ 24px |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| brand 图形 | 深蓝 M `#1351AD` + 主蓝 M `#3491FA`（官方原色） |
| brand 文字 | 深灰 `#272E3B`，i 点为主蓝 `#3491FA`（官方原色） |
| white 图形/文字 | 全白 `#FFFFFF`（反色） |

### 过渡
无动画，静态品牌展示。

### 品牌资产说明
Logo 通过 `<img>` 直接引用官方 SVG 原图（`frontend/components/Logo/assets/`），
四个文件与 Milesight 官方导出一致：`Type=Logo, Color=Default.svg`（full/brand）、
`Type=Logo M, Color=Default.svg`（compact/brand）、`Type=Logo, Color=White.svg`（full/white）、
`Type=Logo M, Color=White.svg`（compact/white）。

> **例外说明**：官方 SVG 内含硬编码品牌色（`#3491FA` / `#1351AD` / `#272E3B` / `#FFFFFF`），
> 属外部品牌资源，**保留官方原色、不走 token 变量**（encapsulation.md §3 的品牌资产豁免，
> 依据「直接引用官方 SVG 原图」决策）。组件不再消费 `--color-*` 令牌渲染图形/文字颜色。

---

> 五轴交互：无交互，五轴豁免（回指 `INTERACTION.md` 总纲）。

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），通过 `<img>` 引用官方 SVG 品牌资产，第三方开发者**通过 Skill 契约 + 资产文件**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Props 契约（含 antd 别名）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'full' \| 'compact'` | `'full'` | 完整或紧凑 |
| `height` | `number` | `32` | 高度（px），宽度按宽高比自适应 |
| `color` | `'brand' \| 'white'` | `'brand'` | 颜色版本 |
| `style` | `object` | `undefined` | 透传到 `<img>` 的内联样式 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 纯展示；作为链接时继承链接键盘/焦点行为。

---

## 代码示例

```html
<Logo />
<Logo variant="compact" height={28} />
<Logo color="white" height={32} />
```

---

## 文件映射

- Preview 文件：`logo-preview.html`
- 组件目录：`../../../../frontend/components/Logo/index.html`
- 品牌资产：`../../../../frontend/components/Logo/assets/`（官方 SVG 原图 ×4）
