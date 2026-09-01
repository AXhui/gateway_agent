# Comment · 评论

> **分类**：数据展示  
> **Figma**：1478-142292

---

## 概述

评论展示组件，含作者、内容、时间、操作、嵌套回复。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `author` | `ReactNode` | `-` | 作者 |
| `content` | `ReactNode` | `-` | 内容 |
| `datetime` | `ReactNode` | `-` | 时间 |
| `actions` | `ReactNode[]` | `-` | 操作 |
| `avatar` | `ReactNode` | `-` | 头像 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-secondary`
- `--color-text-auxiliary`


---

## 交互规则

### 设计指引

嵌套深度 ≤2 层，更深层级用「@用户」引用而非缩进。

### 交互 Skill

【Comment 交互 Skill】
结构：Avatar（左）+ 内容区（右：作者+时间+正文+操作）。

交互：
- actions：点赞（心形 toggle，count+1/-1）、回复（展开回复输入框）、举报（Popconfirm确认）
- 回复输入框：expandIn 动画，200ms；提交后 loading，成功后追加子 Comment
- 时间：显示相对时间（"3 分钟前"），hover Tooltip 显示绝对时间

列表：Comment 垂直堆叠，嵌套回复左侧 16px 缩进，最多 3 层缩进。


---

## 代码示例

```html
<Comment author="-" content="-" datetime="-" />
```

---

## 文件映射

- Preview 文件：`comment-preview.html`
- 组件目录：`frontend/components/Comment/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
