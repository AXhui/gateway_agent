# NavMenu · 导航菜单

> **分类**：导航  
> **Figma**：1372-127827

---

## 概述

应用主导航，支持 inline / horizontal / vertical 三种模式。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `mode` | `'inline' | 'horizontal' | 'vertical'` | `'inline'` | 模式 |
| `items` | `MenuItem[]` | `[]` | 菜单项 |
| `selectedKeys` | `string[]` | `-` | 选中项 |
| `openKeys` | `string[]` | `-` | 展开项 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`
- `var(--color-bg-card)`


---

## 交互规则

### 设计指引

侧边栏二级菜单不超过两层；超过则改用 Drawer。

### 交互 Skill

【NavMenu 交互 Skill】
mode=vertical（侧边栏）/ horizontal（顶栏）/ inline（嵌套展开）。

状态样式：
- 默认: color --color-text-secondary, bg transparent
- hover: bg --color-bg-page, color --color-text-primary
- 选中(selected): bg --color-primary-bg, color --color-primary-normal, left border 2px --color-primary-normal（vertical模式）
- 子菜单展开: 旋转 chevron 180°, transition 240ms

collapsed 模式（vertical）：
- 宽 56px，仅 Icon，Tooltip placement=right 展示菜单名
- SubMenu 折叠为 Popover 展开，不再内联展开

角标：用 Badge count 或 dot 叠加在菜单 icon 右上角，count>99 显示 99+。


---

## 代码示例

```html
<NavMenu mode="inline" items="[]" selectedKeys="-" />
```

---

## 文件映射

- Preview 文件：`nav-menu-preview.html`
- 组件目录：`frontend/components/NavMenu/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
