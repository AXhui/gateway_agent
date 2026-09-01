# Transfer · 穿梭框

> **分类**：数据录入  
> **Figma**：1476-47478

---

## 概述

双列对照的多选控件，适合需要批量调整两侧数据的场景。

---

## 用法

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dataSource` | `TransferItem[]` | `[]` | 数据源 |
| `targetKeys` | `string[]` | `-` | 目标列表 key |
| `showSearch` | `boolean` | `false` | 显示搜索 |
| `titles` | `[ReactNode, ReactNode]` | `['源列表','目标列表']` | 标题 |

### 设计令牌

使用的 CSS 变量：

- `--color-primary-normal`
- `--color-brand-50`
- `--color-bg-page`


---

## 交互规则

### 设计指引

权限分配、字段映射等场景使用；候选项 >50 必须开 showSearch。

### 交互 Skill

【Transfer 交互 Skill】
结构：左侧"待选区"＋中间操作按钮（→ / ←）＋右侧"已选区"。

交互：
- 勾选：左侧 Checkbox 选中 → 点击 → 移入右侧（动画 list 高度变化）
- 全选：列表头部 Checkbox，indeterminate 表示部分选中
- 搜索（showSearch）：各自独立过滤，不影响对方列表
- 右侧项目可拖拽排序（可选）

禁止：不要用 Transfer 做"关联"操作，只用于明确的"分配/取消分配"场景。
超出高度：列表内部滚动，高度固定（listStyle={{ height:280 }}）。


---

## 代码示例

```html
<Transfer dataSource="[]" targetKeys="-" />
```

---

## 文件映射

- Preview 文件：`transfer-preview.html`
- 组件目录：`frontend/components/Transfer/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `frontend/shared/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
