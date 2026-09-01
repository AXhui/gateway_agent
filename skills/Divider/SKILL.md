# Divider · 分割线

> **分类**：基础  
> **Figma**：1303-6825

---

## 概述

区隔内容的分割线，支持水平/垂直、虚实线、带文字三类形态。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'horizontal' | 'vertical'` | `'horizontal'` | 方向 |
| `dashed` | `boolean` | `false` | 虚线 |
| `orientation` | `'left' | 'right' | 'center'` | `'center'` | 文字位置 |
| `plain` | `boolean` | `false` | 普通文字（非标题） |

### 设计令牌

使用的 CSS 变量：

- `--color-border-base`
- `--color-text-auxiliary`


---

## 交互规则

### 设计指引

列表项之间不要使用 Divider，使用列表自身的 border-bottom 即可。

### 交互 Skill

【Divider 交互 Skill】
无交互，纯视觉分隔。

使用规则：
- 水平分割线：border-top 1px --color-divider-base-1（卡片内分组）/ --color-border-base（区块间）
- 有文字时：文字居中，颜色 --color-text-auxiliary，font 12px；左对齐用于列表分组标题
- vertical 方向：height 1em，margin 0 --spacing-8，用于行内按钮组分隔
- 表单 fieldset 间距用 Divider + --spacing-20 margin，不用额外 padding


---

## 代码示例

```html
<Divider type="horizontal" orientation="center" />
```

---

## 文件映射

- Preview 文件：`divider-preview.html`
- 组件目录：`frontend/components/Divider/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
