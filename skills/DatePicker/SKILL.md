# DatePicker · 日期选择框

> **分类**：数据录入  
> **Figma**：1471-40068

---

## 概述

日期/时间选择，含 picker 类型、范围选择、预设范围、禁用日期。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `Dayjs` | `-` | 选中值 |
| `picker` | `'date' | 'week' | 'month' | 'quarter' | 'year'` | `'date'` | 类型 |
| `showTime` | `boolean | object` | `false` | 含时间 |
| `format` | `string` | `'YYYY-MM-DD'` | 显示格式 |
| `range` | `boolean` | `false` | 范围选择 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`
- `--shadow-2`


---

## 交互规则

### 设计指引

统一使用 dayjs；表格筛选用 RangePicker presets。

### 交互 Skill

【DatePicker 交互 Skill】
展开：Input 区域 click 触发，Popup fade 200ms，placement bottomLeft 自动边界翻转。

面板交互：
- 年/月切换：< > 箭头翻页，点击"年月"标题切换到年选/月选视图
- 日期 hover：bg --color-bg-page
- 今日：text --color-primary-normal（无选中态）
- 已选：bg --color-primary-normal text #fff，圆形
- 禁用日期（disabledDate）：opacity 0.4 不可点

RangePicker：
- 开始日期选中后，hover 在结束日期前的日期显示范围高亮（bg --color-primary-bg）
- 可设置同一天为开始=结束

showTime：面板底部显示时间选择，点击"确定"提交。
键盘：Tab 切换 input，方向键移动日期，Enter 选中，Esc 关闭。


---

## 代码示例

```html
<DatePicker value="-" picker="date" />
```

---

## 文件映射

- Preview 文件：`date-picker-preview.html`
- 组件目录：`frontend/components/DatePicker/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
