# TimePicker · 时间选择框

> **分类**：数据录入  
> **Figma**：1476-23271

---

## 概述

时分秒选择器，支持 12 小时制、步进、范围选择。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `Dayjs` | `-` | 选中值 |
| `format` | `string` | `'HH:mm:ss'` | 显示格式 |
| `hourStep` | `number` | `1` | 小时步进 |
| `use12Hours` | `boolean` | `false` | 12 小时制 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`


---

## 交互规则

### 设计指引

调度类业务使用 minuteStep={5} 减少操作；定时任务支持秒级。

### 交互 Skill

【TimePicker 交互 Skill】
面板：时 / 分 / 秒 三列滚动选择，点击或滚轮切换值，选中项居中高亮。

交互：
- disabledHours/Minutes/Seconds：对应项 opacity 0.4 不可点
- 清空：allowClear × 图标
- 键盘：↑↓ 调整当前列，Tab 切换列，Enter 确认，Esc 关闭

use12Hours：AM/PM 切换列附加在右侧。
format：'HH:mm'（不含秒）/ 'HH:mm:ss'（含秒），format 决定面板显示列数。


---

## 代码示例

```html
<TimePicker value="-" format="HH:mm:ss" hourStep="1" />
```

---

## 文件映射

- Preview 文件：`time-picker-preview.html`
- 组件目录：`frontend/components/TimePicker/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
