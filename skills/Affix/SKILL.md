# Affix · 固钉

> **分类**：布局  
> **Figma**：1372-131274

---

## 概述

在滚动到边界时将子元素固定，常用于操作栏、回到顶部按钮。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `offsetTop` | `number` | `0` | 距顶距离 |
| `offsetBottom` | `number` | `-` | 距底距离 |
| `onChange` | `(affixed: boolean) => void` | `-` | 固定状态变化 |

### 设计令牌

使用的 CSS 变量：

- `--shadow-2`


---

## 交互规则

### 设计指引

长表单的提交栏推荐使用 Affix offsetBottom={0}。

### 交互 Skill

【Affix 交互 Skill】
交互：
- offsetTop 设定距离顶部触发吸顶的阈值（默认 0）
- 吸顶后元素脱离文档流，占位 placeholder 保持原有高度避免页面跳动
- z-index 建议 90（低于 Modal 的 1000，低于 Header 的 100）

使用场景：表单底部操作栏（offsetBottom=0）、页面侧边快捷导航、表格操作栏。
避免同一页面设置超过 2 个 Affix，优先考虑 sticky CSS 方案。


---

## 代码示例

```html
<Affix offsetTop="0" offsetBottom="-" onChange="-" />
```

---

## 文件映射

- Preview 文件：`affix-preview.html`
- 组件目录：`frontend/components/Affix/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
