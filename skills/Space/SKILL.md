# Space · 间距

> **分类**：布局  
> **Figma**：-

---

## 概述

行内/纵向元素间隔工具，自动处理 wrap 与 split。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | `'small' | 'middle' | 'large' | number` | `'small'` | 间距大小 |
| `direction` | `'horizontal' | 'vertical'` | `'horizontal'` | 排列方向 |
| `wrap` | `boolean` | `false` | 自动换行 |
| `split` | `ReactNode` | `-` | 分隔节点 |

### 设计令牌

使用的 CSS 变量：

- `--spacing-8`
- `--spacing-12`
- `--spacing-16`


---

## 交互规则

### 设计指引

按钮组优先使用 Space 而非手动 margin。

### 交互 Skill

【Space 交互 Skill】
direction=horizontal（默认）/ vertical。
size: small(8px) / middle(16px) / large(24px) 或自定义数字。

使用场景：
- 按钮组：Space size=8，wrap=false
- 表单字段组：Space direction=vertical size=16
- 标签组：Space size=4 wrap=true
- 页头操作区：Space size=12

禁止用 Space 模拟 Grid 布局；超过 3 列改用 Grid。wrap=true 时注意 align=start 避免拉伸。


---

## 代码示例

```html
<Space size="small" direction="horizontal" />
```

---

## 文件映射

- Preview 文件：`space-preview.html`
- 组件目录：`frontend/components/Space/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
