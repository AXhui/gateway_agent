# Upload · 上传

> **分类**：数据录入  
> **Figma**：1471-13813

---

## 概述

文件上传组件，支持点击/拖拽、列表/卡片/头像三种 listType。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `accept` | `string` | `-` | 接受类型 |
| `multiple` | `boolean` | `false` | 多文件 |
| `listType` | `'text' | 'picture' | 'picture-card'` | `'text'` | 列表样式 |
| `maxCount` | `number` | `-` | 数量上限 |

### 设计令牌

使用的 CSS 变量：

- `--color-border-base`
- `--color-primary-normal`
- `--color-bg-page`


---

## 交互规则

### 设计指引

图片用 picture-card；文档用 text；前端预校验文件大小再发请求。

### 交互 Skill

【Upload 交互 Skill】
type=button：按钮形态，点击打开文件选择器。
type=dragger：拖拽区域，drag over 时 border-color --color-primary-normal bg --color-primary-bg。

上传流程：
- 选文件 → beforeUpload 校验（类型/大小）→ 失败显示 error 状态 + message
- 上传中：Progress bar（line类型），status=active
- 成功：status=done，thumbnail/icon + 文件名 + 删除按钮
- 失败：status=error，红色提示 + 重试按钮

listType=picture-card：n×n 缩略图网格，最后一格为上传触发区。
multiple=true：支持多选，maxCount 限制数量，超出禁止继续上传并提示。


---

## 代码示例

```html
<Upload accept="-" listType="text" />
```

---

## 文件映射

- Preview 文件：`upload-preview.html`
- 组件目录：`frontend/components/Upload/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
