# Card · 卡片

> **分类**：数据展示  
> **Figma**：1492-4939

---

## 概述

通用内容容器，含标题、操作、封面、底部操作区。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `ReactNode` | `-` | 标题 |
| `extra` | `ReactNode` | `-` | 右上操作 |
| `actions` | `ReactNode[]` | `-` | 底部操作 |
| `bordered` | `boolean` | `true` | 有边框 |
| `hoverable` | `boolean` | `false` | 悬浮效果 |

### 设计令牌

使用的 CSS 变量：

- `--color-divider-base-1`
- `--shadow-1`
- `var(--color-bg-card)`


---

## 交互规则

### 设计指引

列表项可点击使用 hoverable；信息密集场景关闭 bordered 减少线条。

### 交互 Skill

【Card 交互 Skill】
状态：
- 默认：bg var(--color-bg-card)，border 1px --color-divider-base-1，border-radius --radius-8，shadow --shadow-1
- hoverable=true：hover shadow --shadow-2，transform translateY(-1px)，transition 160ms
- loading：内容区替换为 Skeleton（不用 Spin 覆盖）

结构：[cover 顶部图] → [header: title + extra] → [body] → [footer: actions]

size=small：padding 12px（默认 16px），title font-size 14px。
嵌套：Card 内可嵌套 Card（border-color 改为 --color-divider-base-1 降级），不超过 2 层。
actions：底部 icon 操作区，hover color --color-primary-normal，以 Divider 分隔。


---

## 代码示例

```html
<Card title="-" extra="-" actions="-" />
```

---

## 文件映射

- Preview 文件：`card-preview.html`
- 组件目录：`frontend/components/Card/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
