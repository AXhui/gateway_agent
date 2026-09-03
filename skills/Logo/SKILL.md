# Logo · 品牌标识

> **分类**：基础
> **Figma**：175-15304
> **组件目录**：`frontend/components/Logo/`
> **版本**：v1.1.0（统一 token）

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
| `variant="full"` | 完整 Logo（图形+文字） | 空间充裕时用完整版 |
| `variant="compact"` | 紧凑 Logo（仅图形） | 侧边栏折叠态用紧凑版 |
| `color="brand"` | 品牌色（浅色背景） | 纸面/浅色文档用 brand |
| `color="white"` | 白色反色（深色背景） | 深色 Header 一律用 white |

### 无障碍
- Logo 容器有 `aria-label`（如「Milesight IOT」）。
- 作为链接时 `alt`/`aria-label` 承载品牌名。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 默认高度 | 32px | `size` 可调 |
| full 宽高比 | 按品牌规范 | 图形 + 文字 |
| compact | 32×32 | 仅图形 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| brand 图形 | `--color-primary-normal` |
| brand 文字 | `--color-text-constant-normal` |
| white 图形/文字 | 白色 `--color-text-constant-normal`（反色） |

### 过渡
无动画，静态品牌展示。

### 使用的设计令牌
`--color-primary-normal`（brand 图形）、`--color-text-constant-normal`（文字/反色）。

> **Token 修正**：无。旧版 Skill 已符合规范。

---

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），第三方开发者不直接 import 源码，而是**通过 Skill 契约 + token 变量**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Props 契约（含 antd 别名）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `'full' \| 'compact'` | `'full'` | 完整或紧凑 |
| `size` | `number` | `32` | 高度（px） |
| `color` | `'brand' \| 'white'` | `'brand'` | 颜色版本 |

### 受控/非受控语义
- 纯展示组件，无受控语义。

### 事件 / 键盘
- 纯展示；作为链接时继承链接键盘/焦点行为。

---

## 代码示例

```html
<Logo />
<Logo variant="compact" size={28} />
<Logo color="white" size={32} />
```

---

## 文件映射

- Preview 文件：`logo-preview.html`
- 组件目录：`frontend/components/Logo/index.html`
- 令牌文件：`frontend/shared/tokens.css`
