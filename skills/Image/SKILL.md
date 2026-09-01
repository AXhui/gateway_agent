# Image · 图片

> **分类**：数据展示  
> **Figma**：1491-53161

---

## 概述

图片组件，含预览、缩放、回退、占位。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | `-` | 图片源 |
| `preview` | `boolean | object` | `true` | 预览能力 |
| `fallback` | `string` | `-` | 失败兜底 |
| `width` | `number` | `-` | 宽度 |
| `height` | `number` | `-` | 高度 |

### 设计令牌

使用的 CSS 变量：

- `--color-divider-base-1`
- `--color-bg-hover`


---

## 交互规则

### 设计指引

必须设置 fallback；列表图片用 Image.PreviewGroup。

### 交互 Skill

【Image 交互 Skill】
交互：
- preview=true（默认）：click 打开全屏预览 Modal，背景 rgba(0,0,0,0.85)
- 预览内：← → 切换（PreviewGroup），滚轮缩放，拖拽移动，Esc/× 关闭
- 加载中：Skeleton 占位，宽高同最终图片
- 加载失败：fallback 图（broken image icon）

PreviewGroup：多图共享预览上下文，左右箭头翻页，右上角显示 n/total。

lazy loading：默认开启（intersection observer），viewport 外图片不加载。


---

## 代码示例

```html
<Image src="-" preview="true" fallback="-" />
```

---

## 文件映射

- Preview 文件：`image-preview.html`
- 组件目录：`frontend/components/Image/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
