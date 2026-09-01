# Modal · 对话框

> **分类**：反馈  
> **Figma**：1430-37845

---

## 概述

模态对话框，承载需用户聚焦的确认/输入/详情。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 开启 |
| `title` | `ReactNode` | `-` | 标题 |
| `onOk` | `() => void` | `-` | 确定回调 |
| `onCancel` | `() => void` | `-` | 取消回调 |
| `width` | `number | string` | `520` | 宽度 |
| `footer` | `ReactNode | null` | `-` | 底部 |

### 设计令牌

使用的 CSS 变量：

- `var(--color-bg-card)`
- `--shadow-3`
- `--color-primary-normal`


---

## 交互规则

### 设计指引

二次确认必弹 Modal；表单 >5 字段改用 Drawer。

### 交互 Skill

【Modal 交互 Skill】
交互：
- 打开：fade + scale(0.9→1) 200ms，遮罩 fade
- 关闭：点击遮罩（maskClosable 默认true）/ × / Esc / onCancel
- 有未保存修改：关闭前 Popconfirm 二次确认

按钮规则：
- 主操作（onOk）：Button primary，操作中 loading=true
- 取消（onCancel）：Button default
- 危险操作：okButtonProps={{ danger:true }}，且 okText="确认删除"（明确写操作对象）

宽度：
- 小确认框：width 400px
- 标准表单：width 520px
- 大内容：width 720px，超过用 Drawer

footer=null + 自定义 footer：用于非标准按钮布局。
禁止：不在 Modal 内再弹 Modal；Modal 内 Form 需独立 form 实例。


---

## 代码示例

```html
<Modal title="-" onOk="-" />
```

---

## 文件映射

- Preview 文件：`modal-preview.html`
- 组件目录：`frontend/components/Modal/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
