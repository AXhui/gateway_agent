# DropdownMenu · 下拉菜单

> **分类**：导航  
> **Figma**：-

---

## 概述

操作收纳菜单，支持 hover / click / contextMenu 三种触发。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `trigger` | `('hover' | 'click' | 'contextMenu')[]` | `['hover']` | 触发方式 |
| `items` | `MenuItem[]` | `[]` | 菜单项 |
| `placement` | `'bottom' | 'bottomLeft' | 'bottomRight'` | `'bottomLeft'` | 弹出位置 |
| `disabled` | `boolean` | `false` | 禁用 |

### 设计令牌

使用的 CSS 变量：

- `var(--color-bg-card)`
- `--shadow-2`
- `--color-brand-50`


---

## 交互规则

### 设计指引

操作 ≤2 个直接展示；3-5 个用 Dropdown 收纳。

### 交互 Skill

【DropdownMenu 交互 Skill】
trigger: click（默认，移动端友好）/ hover（桌面快捷）/ contextMenu（右键菜单）。

交互：
- 展开：fade + scale(0.95→1) from 触发点，200ms
- 菜单项 hover: bg --color-bg-page
- 危险操作项：color --color-error-normal，点击后 Popconfirm 确认
- disabled 项：opacity 0.4，cursor not-allowed，不响应 click
- 键盘：↑↓ 导航，Enter 确认，Esc 关闭

placement: bottomLeft（默认）/ bottomRight / topLeft / topRight，根据边界自动翻转。
层级：z-index 1050（高于 Modal 1000 不超过 Toast 9999）。


---

## 代码示例

```html
<DropdownMenu trigger="['hover']" items="[]" placement="bottomLeft" />
```

---

## 文件映射

- Preview 文件：`dropdown-menu-preview.html`
- 组件目录：`frontend/components/DropdownMenu/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
