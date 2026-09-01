# AutoComplete · 自动完成

> **分类**：数据录入  
> **Figma**：1453-86532

---

## 概述

输入框 + 下拉建议，适合海量候选项的搜索式选择。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `Option[]` | `[]` | 建议项 |
| `value` | `string` | `-` | 输入值 |
| `onSearch` | `(value: string) => void` | `-` | 搜索回调 |
| `allowClear` | `boolean` | `false` | 允许清除 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`
- `--shadow-2`


---

## 交互规则

### 设计指引

远程搜索 onSearch 加 300ms 防抖；空状态显示「暂无匹配」。

### 交互 Skill

【AutoComplete 交互 Skill】
展开时机：输入内容后实时请求/过滤，防抖 300ms 避免频繁请求。

交互：
- 候选项 hover：bg --color-bg-page
- 键盘：↑↓ 导航，Enter 确认，Esc 关闭
- 无结果：显示"无匹配结果"（不用 Empty 组件，inline 文本即可）
- 清空（allowClear）：× 清空同时关闭下拉

使用场景：搜索框智能提示、城市选择、标签联想。
与 Select 区别：AutoComplete 可输入任意值，Select 只能选已有选项。


---

## 代码示例

```html
<AutoComplete options="[]" value="-" onSearch="-" />
```

---

## 文件映射

- Preview 文件：`auto-complete-preview.html`
- 组件目录：`frontend/components/AutoComplete/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
