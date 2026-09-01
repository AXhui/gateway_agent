# Icon · 图标

> **分类**：基础  
> **Figma**：-

---

## 概述

基于 Lucide 图标集的统一图标组件，size 默认跟随父级字号。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | `-` | 图标名称 |
| `size` | `number` | `16` | 图标尺寸（px） |
| `color` | `string` | `'currentColor'` | 图标颜色 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-primary`
- `--color-primary-normal`


---

## 交互规则

### 设计指引

图标始终使用 currentColor 继承文字颜色，避免硬编码。

### 交互 Skill

【Icon 交互 Skill】
使用规则：
- 始终用 currentColor，不写 color prop，由父级文字颜色继承
- 配合文字时间距 --spacing-4（4px）
- 可交互图标（如关闭按钮）：hover color --color-text-primary → --color-primary-normal，需 cursor pointer
- 纯装饰性图标：aria-hidden="true"
- size 默认 16，正文内 14，大标题区 20/24
- 状态图标：success=CheckCircle, error=XCircle, warn=AlertTriangle, info=InfoCircle，颜色引用对应语义 token


---

## 代码示例

```html
<Icon name="-" size="16" color="currentColor" />
```

---

## 文件映射

- Preview 文件：`icon-preview.html`
- 组件目录：`frontend/components/Icon/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
