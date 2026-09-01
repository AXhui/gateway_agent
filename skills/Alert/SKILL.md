# Alert · 警告提示

> **分类**：反馈  
> **Figma**：1432-54120

---

## 概述

页内常驻警告条，4 种状态 + 可关闭 + 可带描述/动作。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'info' | 'success' | 'warning' | 'error'` | `'info'` | 类型 |
| `message` | `ReactNode` | `-` | 主标题 |
| `description` | `ReactNode` | `-` | 详细描述 |
| `closable` | `boolean` | `false` | 可关闭 |
| `showIcon` | `boolean` | `false` | 显示图标 |

### 设计令牌

使用的 CSS 变量：

- `--color-success-normal`
- `--color-warm-normaling`
- `--color-error-normal`
- `--color-primary-normal`


---

## 交互规则

### 设计指引

页面级提示用 Alert；瞬时反馈用 Message。

### 交互 Skill

【Alert 交互 Skill】
type: success / info / warn / error，对应 icon 和颜色语义 token。

交互：
- showIcon=true（推荐）：左侧 icon 增强语义
- closable=true：右侧 × 关闭，fade-out 200ms，onClose 回调
- banner=true：撑满父容器宽度，无圆角，用于页面级全局提示
- action：右侧自定义操作区（如"查看详情"Link）

层级优先级：error > warn > info > success；同类型合并为一条（不叠加多条）。
持久性：操作类提示（error/warn）不自动消失；临时反馈用 Message。


---

## 代码示例

```html
<Alert type="info" message="-" description="-" />
```

---

## 文件映射

- Preview 文件：`alert-preview.html`
- 组件目录：`frontend/components/Alert/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
