# Spin · 加载中

> **分类**：反馈  
> **Figma**：1424-160894

---

## 概述

加载指示器，可包裹内容产生遮罩 loading。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `spinning` | `boolean` | `true` | 加载中 |
| `tip` | `ReactNode` | `-` | 提示文字 |
| `size` | `'small' | 'default' | 'large'` | `'default'` | 尺寸 |
| `indicator` | `ReactNode` | `-` | 自定义指示器 |
| `delay` | `number` | `-` | 延迟显示(ms) |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `var(--color-bg-card)`


---

## 交互规则

### 设计指引

短暂操作设 delay={300} 避免闪烁；长任务首选 Progress。

### 交互 Skill

【Spin 交互 Skill】
spinning=true：显示加载态，内容区 opacity 0.4 + pointer-events none（避免误操作）。

使用场景：
- 局部刷新（表格重新请求）：Spin 包裹 Table，spinning={loading}
- 全页加载：Spin 居中 delay=300ms（避免闪烁）
- 按钮操作中：Button loading=true（不用 Spin 包裹 Button）

size: small（14px）/ default（20px）/ large（32px）。
tip：loading 下方文字说明，color --color-text-auxiliary，font 12px。

禁止：Spin 不叠加 Skeleton；Spin 不超过 3 层嵌套（父有 Spin 子不再加）。


---

## 代码示例

```html
<Spin spinning tip="-" size="default" />
```

---

## 文件映射

- Preview 文件：`spin-preview.html`
- 组件目录：`frontend/components/Spin/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
