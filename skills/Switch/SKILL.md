# Switch · 开关

> **分类**：数据录入  
> **Figma**：1318-116140

---

## 概述

二态开关，立即生效，无需提交按钮。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean` | `false` | 开关状态 |
| `size` | `'default' | 'small'` | `'default'` | 尺寸 |
| `loading` | `boolean` | `false` | 加载中 |
| `disabled` | `boolean` | `false` | 禁用 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-gray-200`


---

## 交互规则

### 设计指引

代价高的操作不要用 Switch；危险开关需二次确认。

### 交互 Skill

【Switch 交互 Skill】
交互：
- 点击切换：thumb slide 动画 160ms，bg 从 --color-border-base 过渡到 --color-primary-normal
- loading=true：thumb 显示 Spin，不可再次点击
- checked：bg --color-primary-normal；unchecked：bg --color-border-base（不用灰色 bg 区分）

使用场景：立即生效的全局/功能开关，如"启用通知"。
需要确认再生效的操作不用 Switch，改用 Checkbox + 保存按钮。
size=sm（24px高）用于表格行内；size=md（28px高）用于表单。

label 放 Switch 右侧（Form.Item label 在上时例外），说明当前状态（"已开启"/"已关闭"）。


---

## 代码示例

```html
<Switch size="default" />
```

---

## 文件映射

- Preview 文件：`switch-preview.html`
- 组件目录：`frontend/components/Switch/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
