# Pagination · 分页

> **分类**：导航  
> **Figma**：1363-88210

---

## 概述

长列表分页，提供 simple、jumper、size changer 三种增强能力。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `current` | `number` | `1` | 当前页码 |
| `total` | `number` | `0` | 总条数 |
| `pageSize` | `number` | `10` | 每页条数 |
| `showSizeChanger` | `boolean` | `false` | 显示页大小选择 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-border-base`


---

## 交互规则

### 设计指引

列表 ≤50 条不分页；首页统一 pageSize=20。

### 交互 Skill

【Pagination 交互 Skill】
交互：
- 页码按钮：hover bg --color-bg-page，当前页 bg --color-primary-normal text #fff
- 省略号：hover 展开跳 5 页的前/后箭头
- pageSize 切换：Select 组件，change 后重置到第 1 页
- 快速跳转（showQuickJumper）：输入数字后回车跳转，超出范围自动 clamp

位置：Table 分页固定在内容区底部，padding 16px 0，align right；移动端居中。
total 显示格式：共 {total} 条，放在 Pagination 左侧。


---

## 代码示例

```html
<Pagination current="1" total="0" pageSize="10" />
```

---

## 文件映射

- Preview 文件：`pagination-preview.html`
- 组件目录：`frontend/components/Pagination/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
