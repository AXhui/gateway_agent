# PageHeader · 页头

> **分类**：布局  
> **Figma**：1363-99512

---

## 概述

页面顶部容器，承载面包屑、返回、标题、副标题、操作区。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `ReactNode` | `-` | 主标题 |
| `subTitle` | `ReactNode` | `-` | 副标题 |
| `onBack` | `() => void` | `-` | 返回回调 |
| `extra` | `ReactNode` | `-` | 右侧操作区 |
| `breadcrumb` | `BreadcrumbProps` | `-` | 面包屑配置 |

### 设计令牌

使用的 CSS 变量：

- `--color-text-primary`
- `var(--color-bg-card)`
- `--color-divider-base-1`


---

## 交互规则

### 设计指引

详情页一律使用 PageHeader 承载返回 + 操作；列表页省略 onBack。

### 交互 Skill

【PageHeader 交互 Skill】
结构：[返回箭头] 面包屑 / 标题 [Badge状态] [extra操作区]

交互：
- onBack：点击左箭头执行，通常 router.back() 或跳指定路由
- extra：右侧操作区，主操作 Button primary，次操作 Button default，最多 3 个
- 面包屑：末级不可点，前级 hover underline

页面类型对应：
- 列表页：无 onBack，title=模块名，extra=新建按钮
- 详情页：onBack=true，title=记录名，extra=编辑+删除
- 表单页：onBack=true，title=新建/编辑，extra 在底部 Footer 而非 PageHeader


---

## 代码示例

```html
<PageHeader title="-" subTitle="-" onBack="-" />
```

---

## 文件映射

- Preview 文件：`page-header-preview.html`
- 组件目录：`frontend/components/PageHeader/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
