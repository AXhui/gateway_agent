# Button · 按钮

> **分类**：基础  
> **Figma**：1294-844

---

## 概述

触发即时操作的按钮。提供 5 种类型、3 种尺寸，覆盖主要操作、次要操作、文本操作三种场景。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'primary' | 'default' | 'dashed' | 'link' | 'text'` | `'default'` | 按钮类型 |
| `size` | `'large' | 'middle' | 'small'` | `'middle'` | 按钮尺寸 |
| `loading` | `boolean` | `false` | 加载状态 |
| `block` | `boolean` | `false` | 撑满容器 |
| `disabled` | `boolean` | `false` | 禁用状态 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--radius-4`
- `--spacing-12`
- `--color-text-constant-normal`


---

## 交互规则

### 设计指引

主要操作仅一个，使用 type="primary"；批量操作用 default；危险操作搭配确认弹窗。

### 交互 Skill

【Button 交互 Skill】
交互状态：
- default: border 1px --color-border-base, bg var(--color-bg-card), text --color-text-primary
- hover: border-color --color-primary-normal, text --color-primary-normal, bg --color-primary-bg; transition 160ms
- active: bg --color-primary-active（primary类型）/ bg --color-bg-hover（default类型）
- focus-visible: outline 2px --color-border-primary-normal, outline-offset 2px
- loading: 左侧 Spin icon 替换 iconLeft，disabled pointer-events none
- disabled: opacity 0.4, cursor not-allowed

尺寸规则：
- sm: height 28px, padding 0 10px, font 12px
- md: height 36px, padding 0 16px, font 14px（默认）
- lg: height 44px, padding 0 20px, font 16px

类型优先级：一屏只允许一个 primary Button；破坏性操作用 type=default + status=error + Popconfirm 二次确认；批量操作区用 default/dashed；纯文字跳转用 link；无边框操作用 text。

危险操作流程：点击 → Popconfirm 弹出 → 确认后执行，执行期间按钮 loading=true。

空态兜底：操作无权限时 disabled=true + Tooltip 说明原因。


---

## 代码示例

```html
<Button type="default" size="middle" />
```

---

## 文件映射

- Preview 文件：`button-preview.html`
- 组件目录：`frontend/components/Button/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
