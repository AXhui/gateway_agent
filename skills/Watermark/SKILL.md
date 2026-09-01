# Watermark · 水印

> **分类**：数据展示  
> **Figma**：1424-145447

---

## 概述

页面/区块水印，使用 Canvas 绘制，自动监听 DOM 变化防移除。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | `string | string[]` | `-` | 水印文字 |
| `image` | `string` | `-` | 图片水印 |
| `rotate` | `number` | `-22` | 旋转角度 |
| `gap` | `[number, number]` | `[100, 100]` | 间距 |
| `zIndex` | `number` | `9` | 层级 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-auxiliary`


---

## 交互规则

### 设计指引

涉及合同、隐私文件的页面默认开启；用户名 + 时间戳。

### 交互 Skill

【Watermark 交互 Skill】
纯视觉层，无交互。

样式规范：
- content：用户名 + 时间戳（如"张三 2026-05-14"），防截图泄露
- color：rgba(0,0,0,0.08)（浅色背景）/ rgba(255,255,255,0.12)（深色背景）
- font-size：14px，rotate：-22deg，gap：[100,100]

使用场景：敏感数据页面（财务/权限配置/用户隐私），全屏覆盖在 Content 区。
禁止：不在 Watermark 上叠加可交互元素，不降低 opacity 使其不可见。


---

## 代码示例

```html
<Watermark content="-" image="-" rotate="-22" />
```

---

## 文件映射

- Preview 文件：`watermark-preview.html`
- 组件目录：`frontend/components/Watermark/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
