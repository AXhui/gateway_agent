# Avatar · 头像

> **分类**：数据展示  
> **Figma**：1496-37413

---

## 概述

用户/对象的视觉标识，支持图片、文字、图标、组合。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | `-` | 图片地址 |
| `size` | `'large' | 'small' | 'default' | number` | `'default'` | 尺寸 |
| `shape` | `'circle' | 'square'` | `'circle'` | 形状 |
| `icon` | `ReactNode` | `-` | 图标 |
| `group` | `boolean` | `false` | 组合模式 |

### 设计令牌

使用的 CSS 变量：

- `--color-bg-hover`
- `--color-primary-normal`


---

## 交互规则

### 设计指引

无图时显示姓名首字符；多用户使用 Avatar.Group 重叠。

### 交互 Skill

【Avatar 交互 Skill】
尺寸：xs=24 / sm=32 / md=40（默认）/ lg=48 / xl=64，shape=circle/square。

Fallback 顺序：图片 → src 加载失败显示 alt 首字符 → 显示 UserIcon。

交互：
- 可点击（如进入个人页）：hover 添加 overlay rgba(0,0,0,0.15)，cursor pointer
- Avatar.Group：超出 maxCount 显示 "+N" 气泡，hover 展开 Tooltip 列表

Badge 组合：在线状态用 Badge status=processing（绿色脉冲点）叠加在右下角。
图片失败：onError 回调切换为文字/图标模式。


---

## 代码示例

```html
<Avatar src="-" size="default" shape="circle" />
```

---

## 文件映射

- Preview 文件：`avatar-preview.html`
- 组件目录：`frontend/components/Avatar/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
