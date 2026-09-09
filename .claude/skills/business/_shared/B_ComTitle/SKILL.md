---
name: B_ComTitle
version: 1.0.0
description: 标题（业务组件）
---

# 标题 · B_ComTitle

> **逻辑名**：`B_ComTitle`
> **现 id**：`bc-com-title`
> **分类**：通用
> **entityHint**：`com`（跨产品线通用）
> **包归属**：`ui-com`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：无（纯编排，状态由父级持有）

---

## 一、业务层（何时用 / 何时不用）

### 组件定位
跨产品线通用的标题编排组件，按**层级（level）**与**变体（variant）**双维度决定视觉形态；标题右侧可按需编排 Tag / 提示图标 / 开关 / 按钮组，描述文案（describe）分「必要展示」与「非必要提示」双模式。只做编排，不写样式常量。

### 层级划分（level，高 → 低）
| 层级 | 位置 | 视觉 |
|------|------|------|
| `page`（页面级） | 页面最顶部，面包屑下方 | 主标题变体（16px） |
| `tab`（Tab 级） | Tab 栏下方，内容区顶部 | 主标题 + 开关（Enable） |
| `card`（卡片/区块级） | 卡片/区块顶部，内边距内左对齐 | 主标题，下方到表格/表单有固定间距 |
| `group`（分组级） | 表单分组内，字段组上方 | 次标题变体（14px，左竖条） |

### 对齐方式（align）
- `left`（默认）— 常规场景。
- `center` / `right` — 特殊场景（如弹窗标题居中）。

### 何时用
- 页面、Tab、卡片/区块、表单分组四层标题位。
- 标题需带 Tag / 提示 / 开关 / 操作按钮时。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 弹窗/抽屉内部独立标题栏 | `S_Modal` / `B_DetailDrawer` 自带标题 |
| 纯数据表格列头 | `S_Table` 自带 column title |
| 卡片整块标题（带图标+操作区） | `B_EntityCard` |

---

## 二、组装层（atoms 依赖 + render 骨架）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Typography` | `ms-h4` / `ms-h5` | 主/次标题文字 |
| `S_Form` | `ms-form-section-title` | 分组级标题（14px + 左竖条） |
| `S_Tag` | `ms-tag` | 标题同行标签 |
| `S_Icon` | `ms-ico` | 提示图标（`U.ico`） |
| `S_Tooltip` | `ms-tip` / `ms-tip-bubble` | 非必要描述的悬浮提示 |
| `S_Switch` | `ms-switch` / `ms-switch--xs` | Tab 级 Enable 开关 |
| `S_Button` | `ms-btn` / `ms-btn-group` | 标题右侧操作按钮组 |
| `S_Text` | `ms-text` / `ms-text--auxiliary` | 必要描述下一行小字 |

### Props 契约（组装契约）
| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | string | — | 标题文字（必填） |
| `variant` | `'main' \| 'sub'` | `'main'` | 主标题（16px/600）/ 次标题（14px/600） |
| `level` | `'page' \| 'tab' \| 'card' \| 'group'` | `'card'` | 层级，决定位置与默认形态 |
| `align` | `'left' \| 'center' \| 'right'` | `'left'` | 对齐方式 |
| `showTag` | boolean | `false` | 是否显示 Tag |
| `tag` | string | — | Tag 文案（showTag 时） |
| `showTip` | boolean | `false` | 是否显示提示图标 |
| `tip` | string | — | 提示文案（showTip 时，tooltip 内容） |
| `showSwitch` | boolean | `false` | 是否显示开关（Tab 级 Enable） |
| `switchChecked` | boolean | `false` | 开关初始态 |
| `switchLabel` | string | — | 开关左侧标签 |
| `showButton` | boolean | `false` | 是否显示操作按钮组 |
| `buttons` | `{ t: string, kind?: 'filled'\|'outline'\|'text' }[]` | — | 按钮组 |
| `showDescribe` | boolean | `false` | 是否显示描述文案 |
| `describe` | string | — | 描述文案 |
| `describeMode` | `'inline' \| 'tip'` | `'inline'` | 描述展示模式：inline=下一行小字；tip=并入提示图标 tooltip |

### render 骨架（业务框架）
1. `.bc-com-title` 容器（按 `level` 加 `.bc-com-title--page/tab/card/group`，按 `align` 加 `.bc-com-title--center/right`）。
2. 左侧：标题文字（`variant=main` → `.ms-h4`；`variant=sub` 或 `level=group` → `.ms-h5` / `.ms-form-section-title`）。
3. 右侧（按需）：Tag → 提示图标 → 开关 → 按钮组，同一行两端对齐（`space-between`）或紧邻小间距。
4. `showDescribe && describeMode='inline'`：标题下一行 `.ms-text.ms-text--auxiliary`。

### bind 骨架
无 bind。开关态、按钮点击均由父级通过回调持有，组件只读 Props、只发事件。

---

## 三、研发层（注册契约）

```js
{ id: 'bc-com-title', cn: '标题', cat: '通用', desc: '跨产品线标题编排…', atoms: ['typography','form','tag','icon','tooltip','switch','button','text'], entityHint: 'com', tags: ['标题','页面','Tab','卡片','分组','Tag','开关','按钮'], render(ctx){/* … */} }
```

### 上下文 ctx 契约
- 无强制单一来源；`title` / `describe` / `switchChecked` 等由调用方 Props 传入。

### 结构类（`library/business.css`）
`.bc-com-title`（容器布局 + 层级/对齐修饰符；标题与同行元素间距、标题下方间距）。

---

## 四、交互说明

### 开关（Tab 级 Enable）
- 复用 `.ms-switch.ms-switch--xs`（28×16），与标题两端对齐。
- 状态由父级 Props 持有，变更走回调（`onSwitchChange`），组件内部不改状态。

### 描述文案双模式
- `describeMode='inline'`：必要描述放标题下一行，16px `--color-text-auxiliary` 小字。
- `describeMode='tip'`：非必要描述并入提示图标，点击/悬浮显示 `.ms-tip-bubble`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-com-title`
- 结构类：`library/business.css`
- 令牌（只读）：`.claude/tokens/tokens.css`
