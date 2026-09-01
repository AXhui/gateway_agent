# Calendar · 日历

> **分类**：数据展示  
> **Figma**：1517-2040

---

## 概述

日历视图，支持月/年模式、单元格自定义、选择回调。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `Dayjs` | `-` | 显示日期 |
| `mode` | `'month' | 'year'` | `'month'` | 模式 |
| `cellRender` | `(date, info) => ReactNode` | `-` | 单元格渲染 |
| `onPanelChange` | `(date, mode) => void` | `-` | 面板切换 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`
- `--color-divider-base-1`


---

## 交互规则

### 设计指引

调度/日程类页面使用 Calendar；只是选日期用 DatePicker。

### 交互 Skill

【Calendar 交互 Skill】
mode: month（默认）/ year 切换。

交互：
- 日期 click：onSelect 回调，视觉上选中高亮
- 月/年切换：header 中 Select 组件切换，不用 < > 箭头翻页
- 今日：高亮圆圈
- cellRender：自定义单元格内容（如显示任务数 Badge）

与 DatePicker 区别：Calendar 是全量展示用于内容展示（如排班/日程），DatePicker 是弹层用于选值。
移动端：Calendar 改为 DatePicker 或精简的周视图。


---

## 代码示例

```html
<Calendar value="-" mode="month" cellRender="-" />
```

---

## 文件映射

- Preview 文件：`calendar-preview.html`
- 组件目录：`frontend/components/Calendar/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
