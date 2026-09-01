# Skeleton · 骨架屏

> **分类**：反馈  
> **Figma**：1439-19991

---

## 概述

加载占位，还原页面骨架，减少首屏空白感。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `active` | `boolean` | `false` | 动画 |
| `avatar` | `boolean | object` | `false` | 含头像 |
| `paragraph` | `boolean | object` | `true` | 段落 |
| `loading` | `boolean` | `true` | 加载中 |
| `round` | `boolean` | `false` | 圆角 |

### 设计令牌

使用的 CSS 变量：

- `--color-bg-hover`
- `--color-bg-page`


---

## 交互规则

### 设计指引

首屏加载 >500ms 必须用 Skeleton 而非 Spin。

### 交互 Skill

【Skeleton 交互 Skill】
使用时机：首次加载（无缓存数据）时显示，加载完成后 active=false 切换为真实内容，transition 200ms。

配置：
- avatar：圆形占位（列表头像）
- paragraph：多行文字占位，rows 控制行数，width 数组精细控制每行宽度
- Skeleton.Button/Input/Image：针对具体组件的占位符

动画：active=true 时 shimmer 扫光动画（left→right，1.5s 循环）。

禁止：
- 不在 Spin 和 Skeleton 同时使用，二选一
- 不超过 3 屏的骨架屏（超长列表用虚拟滚动 + 分页）
- 内容重新加载（已有数据）用 Spin overlay，不用 Skeleton


---

## 代码示例

```html
<Skeleton paragraph="true" />
```

---

## 文件映射

- Preview 文件：`skeleton-preview.html`
- 组件目录：`frontend/components/Skeleton/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
