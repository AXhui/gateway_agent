# Anchor · 锚点

> **分类**：导航  
> **Figma**：1424-143764

---

## 概述

页内导航锚点，自动追踪滚动位置高亮当前章节。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `AnchorItem[]` | `[]` | 锚点项 |
| `offsetTop` | `number` | `0` | 距顶偏移 |
| `bounds` | `number` | `5` | 判定边界 |
| `onChange` | `(activeLink: string) => void` | `-` | 切换回调 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-border-base`


---

## 交互规则

### 设计指引

超过 4 屏长度的页面建议加锚点。

### 交互 Skill

【Anchor 交互 Skill】
交互：
- 点击：平滑滚动到目标 (scroll-behavior: smooth)，URL hash 更新
- 激活（scroll spy）：距视口顶部 offsetTop 内的标题对应 Anchor item 高亮，color --color-primary-normal，left border 2px
- hover: color --color-text-primary

位置：固定在内容区右侧，position sticky top 80px，z-index 10。
层级：只处理 H2/H3，H4 以下不进 Anchor。
移动端：隐藏 Anchor，改为 ScrollTop 按钮。


---

## 代码示例

```html
<Anchor items="[]" offsetTop="0" bounds="5" />
```

---

## 文件映射

- Preview 文件：`anchor-preview.html`
- 组件目录：`frontend/components/Anchor/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
