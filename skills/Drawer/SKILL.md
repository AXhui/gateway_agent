# Drawer · 抽屉

> **分类**：反馈  
> **Figma**：1445-39010

---

## 概述

侧边滑入面板，承载详情、表单、配置等中等复杂度内容。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | `boolean` | `false` | 开启 |
| `placement` | `'top' | 'right' | 'bottom' | 'left'` | `'right'` | 方向 |
| `size` | `'default' | 'large' | number` | `'default'` | 尺寸 |
| `onClose` | `() => void` | `-` | 关闭回调 |
| `footer` | `ReactNode` | `-` | 底部 |

### 设计令牌

使用的 CSS 变量：

- `var(--color-bg-card)`
- `--shadow-3`
- `--color-divider-base-1`


---

## 交互规则

### 设计指引

详情查看用 Drawer 不打断主流程；表单 >5 字段也用 Drawer。

### 交互 Skill

【Drawer 交互 Skill】
placement: right（默认，表单/详情）/ left / top / bottom。

交互：
- 打开：slide + fade，width/height transition 240ms easing-standard
- 关闭：点击遮罩 or × or Esc；有未保存修改时 Popconfirm 确认
- 遮罩：bg rgba(0,0,0,0.45)，click 关闭

宽度规范：
- 详情 Drawer：width 480px
- 表单 Drawer：width 520px
- 复杂表单：width 640px，超过改用独立页面

Footer：fixed 在 Drawer 底部，Divider 分隔，Space 放"取消+提交"按钮。
禁止：不在 Drawer 内嵌套 Modal；Drawer 层级最多 2 层。


---

## 代码示例

```html
<Drawer placement="right" size="default" />
```

---

## 文件映射

- Preview 文件：`drawer-preview.html`
- 组件目录：`frontend/components/Drawer/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
