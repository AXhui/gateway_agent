---
name: Transfer
description: 穿梭框（基础组件）
---

# Transfer · 穿梭框

> **分类**：数据录入
> **Figma**：1476-47478
> **组件目录**：`../../../../frontend/components/Transfer/`
> **版本**：v1.1.0（已对齐 antd `Transfer` `dataSource` / `targetKeys` / `showSearch` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**双列对照的多选穿梭控件**。左侧「源列表」、右侧「目标列表」，通过中间按钮批量搬运。用于**直观调整两个集合的归属关系**，如权限分配、字段映射、成员分派。

### 何时用
- 需要**批量**在「未选 / 已选」之间搬运数据。
- 强调「两侧对照」——能同时看到已选与未选，便于复核。
- 候选项较多、需要搜索定位（`showSearch`）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 简单多选（不需对照搬运） | `Select` `mode="multiple"` |
| 层级多选 | `TreeSelect` `treeCheckable` |
| 少量选项、空间有限 | `Checkbox.Group` |
| 分步授权（跨页选择） | `Select` + 分页 |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础 | 源/目标双列 + 左右箭头 | 默认「全选/清除」按钮语义要清晰 |
| `showSearch` | 两侧独立搜索 | 候选项 >50 必须开，否则无法定位 |
| `titles` | 自定义两列标题 | 标题要说明集合语义（如「未授权/已授权」） |
| 排序 | 支持目标列表内排序 | 排序能力要可选，不要默认干扰 |

### 无障碍
- 两列各为 `role="listbox"`，项为 `role="option"`，`aria-selected` 标记勾选。
- 中间按钮有 `aria-label`（如「添加选中项」「移除选中项」）。
- 键盘 `↑ ↓` 在列内移动，`Space` 勾选，`Tab` 在「源列表 → 按钮 → 目标列表」间切换。
- 搬运后焦点保持，读屏播报「已添加 N 项 / 已移除 N 项」。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 两列宽度 | 各 220px | 可配置，等高 |
| 列表项高 | 32px | padding `6px 12px`，带复选框 |
| 中间操作区宽 | 48px | 竖直排列箭头按钮 |
| 列头高 | 40px | 显示标题 + 计数 |
| 整体圆角 | `var(--radius-8)` | 两列卡片 |

### 状态视觉矩阵
| 状态 | 表现 |
|------|------|
| 列表默认 | bg `var(--color-bg-card)`，边框 `var(--color-border-base)` |
| 勾选项 | 项底 `var(--color-primary-bg)`，复选框 `--color-primary-normal` |
| hover 项 | bg `var(--color-bg-page)` |
| 计数徽标 | 「已选 n / 总数」`--color-text-secondary` |
| 禁用按钮 | 无可搬运项时置灰 `--color-text-disable` |
| 空列表 | 「暂无数据」`--color-text-auxiliary` |

### 过渡
项勾选背景 `160ms var(--easing-standard)`；搬运可加列表项淡出动画。

### 使用的设计令牌
`--color-primary-normal`（勾选）、`--color-primary-bg`（勾选项底，等价 `--color-fill-primary`）、`--color-border-base`（列边框）、`--color-bg-card`（列底）、`--color-bg-page`（hover 项/页面底）、`--color-text-primary`、`--color-text-secondary`、`--color-text-auxiliary`、`--color-text-disable`、`--radius-4`、`--radius-8`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-brand-50`（勾选项底），已统一为 `--color-primary-bg`。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 项 hover `--color-bg-hover` |
| active（点击反馈） | 按下加深 |
| 键盘 | 项 `Enter` 移项、方向键导航 |
| loading | 数据异步 `loading`（回指总纲） |
| error | 无 |

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），第三方开发者不直接 import 源码，而是**通过 Skill 契约 + token 变量**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Props 契约（含 antd 别名）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `dataSource` | `TransferItem[]` | `[]` | **antd 同名同义**：数据源（`{key,title,disabled?}`） |
| `targetKeys` | `string[]` | `-` | **antd 同名同值**：目标列表 key 集合 |
| `defaultTargetKeys` | `string[]` | `-` | **antd 别名**，非受控默认目标 |
| `showSearch` | `boolean` | `false` | **antd 同名同值**：两侧搜索 |
| `titles` | `[ReactNode, ReactNode]` | `['源列表','目标列表']` | **antd 同名同值**：两列标题 |
| `onChange` | `(targetKeys: string[], direction, moveKeys) => void` | `-` | 搬运回调 |
| `disabled` | `boolean` | `false` | 整体禁用 |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `targetKeys !== undefined` 时受控，搬运经 `onChange(targetKeys, direction, moveKeys)` 通知外部；否则内部维护 `defaultTargetKeys`。
- 源列表 = `dataSource` 中 key 不在 `targetKeys` 的项。

### 事件 / 键盘
- 两列独立多选（复选框）；中间按钮搬运选中项，方向由点击决定。
- 每列 `showSearch` 提供独立过滤；`↑ ↓` 移动、`Space` 勾选、`Tab` 跨区切换。

---

## 代码示例

```html
<Transfer dataSource={roles} targetKeys={assigned} onChange={setAssigned} />
<Transfer showSearch dataSource={fields} titles={['可选字段','已选字段']} defaultTargetKeys={['name']} />
<Transfer dataSource={members} targetKeys={keys} onChange={handleMove} />
```

---

## 文件映射

- Preview 文件：`transfer-preview.html`
- 组件目录：`../../../../frontend/components/Transfer/index.html`
- 令牌文件：`../../../tokens/tokens.css`
