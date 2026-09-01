# Timeline · 时间轴

> **分类**：数据展示  
> **Figma**：1494-20096

---

## 概述

时间维度的事件流展示，支持左右交替、待定状态。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `items` | `TimelineItem[]` | `[]` | 项目 |
| `mode` | `'left' | 'alternate' | 'right'` | `'left'` | 模式 |
| `pending` | `ReactNode` | `-` | 待定项 |
| `reverse` | `boolean` | `false` | 倒序 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-border-base`


---

## 交互规则

### 设计指引

运维操作日志、订单流转优先使用；最新事件置顶。

### 交互 Skill

【Timeline 交互 Skill】
mode: left（图标左）/ right / alternate（左右交替）。

视觉：
- dot：默认圆点 --color-primary-normal；自定义 icon（如 CheckCircle/XCircle）表示里程碑/异常
- color：继承语义（success/error/warn/processing）
- pending（进行中）：最后一项 dot 为 Spin，虚线尾部表示未完成

交互：
- 可展开详情：click item 展开/收起（Collapse 效果），不要跳转新页
- 超长列表：显示前 10 条，"查看全部"加载更多

详情页常用：设备事件日志（Timeline）+ 分页，替代 Table（视觉更轻量）。


---

## 代码示例

```html
<Timeline items="[]" mode="left" pending="-" />
```

---

## 文件映射

- Preview 文件：`timeline-preview.html`
- 组件目录：`frontend/components/Timeline/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
