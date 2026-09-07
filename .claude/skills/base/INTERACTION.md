---
name: INTERACTION
description: L2 基础组件交互能力规范总纲（五轴：hover / 点击反馈 / 键盘操作 / 加载状态 / 错误状态）
---

# 基础组件交互能力规范（总纲）

> **定位**：本文档是 62 个 L2 基础组件交互行为的**总纲**，五轴通用规范在此定义；每个组件 SKILL.md 的「状态视觉矩阵」是**组件补表**，只写该组件特有值，通用值回指本文档。
> **令牌前提**：交互状态一律映射 **自有 token 体系**（`tokens.css`），**不引入 antd/Arco 令牌**。组件 SKILL.md 版本行「已对齐 antd `X` API」仅指 Props/API 契约对齐，与令牌无关。

---

## 一、五轴总览

| 轴 | 英文 | 一句话 | 是否所有组件都需定义 |
|---|---|---|---|
| hover | hover | 指针悬停的即时视觉反馈 | 仅「可交互」组件需要；静态/结构组件豁免 |
| 点击反馈 | active | 按下瞬间（mousedown→mouseup）的按压态 | 仅「可点击」组件需要；纯展示豁免 |
| 键盘操作 | keyboard | 纯键盘（Tab/Enter/Space/Esc/方向键）完成核心交互 | 交互组件必需；静态组件标注「无键盘语义」 |
| 加载状态 | loading | 异步进行中的占位/禁用反馈 | 有异步行为的组件需要（按钮/表格/上传/图片等） |
| 错误状态 | error | 校验失败/异常时的警示反馈 | 表单族（输入/选择/上传）必需；其余按需 |

> **豁免原则**：静态/结构组件（Divider、Space、Grid、Layout、Watermark、Descriptions、Comment、Statistic、Timeline 等）在五轴上「豁免」——它们本身无交互，SKILL.md 状态视觉矩阵写「无交互，五轴豁免」即可，不必硬凑。

---

## 二、五轴通用规范

### 轴 1 · hover（悬停）

- **定义**：指针进入可交互元素热区时的即时视觉反馈，提示「这里可点/可操作」。
- **触发**：`pointerenter`（mouse 悬停）；触屏设备无 hover，不依赖 hover 传达唯一信息。
- **视觉反馈**：
  - 控件类（按钮/菜单项/下拉项/表格行）：`background` 变为该色相的 hover 态。
  - 链接类：`color` 变 `--color-text-link-hover`，可加 `text-decoration: underline`。
  - 卡片/列表类：`box-shadow` 提升一级（`--shadow-1`），`border-color` 变 `--color-border-base`。
- **令牌映射**：
  | 语义 | 令牌 |
  |---|---|
  | 主色 hover | `--color-primary-hover` |
  | 成功 hover | `--color-success-hover` |
  | 警告 hover | `--color-warm-hover` |
  | 危险 hover | `--color-error-hover` |
  | 提醒 hover | `--color-remind-hover` |
  | 中性底 hover | `--color-bg-hover` / `--color-fill-base-hover` / `--color-base-hover` |
  | 链接 hover | `--color-text-link-hover` |
- **过渡**：`transition: background-color / border-color / color / box-shadow var(--duration-fast) var(--easing-standard)`（160ms）。

### 轴 2 · 点击反馈（active / 按压态）

- **定义**：指针按下（`mousedown`）到抬起（`mouseup`）之间的按压态，让「点击有响应」。
- **触发**：`pointerdown` / `:active`。
- **视觉反馈**：色相比 hover 再加深一档（active 态）。
- **令牌映射**：
  | 语义 | 令牌 |
  |---|---|
  | 主色 active | `--color-primary-active` |
  | 成功 active | `--color-success-active` |
  | 警告 active | `--color-warm-active` |
  | 危险 active | `--color-error-active` |
  | 提醒 active | `--color-remind-active` |
- **按压时序**：hover（悬停）→ active（按下）→ hover（抬起后回到悬停）→ default（移出）。
- **禁用时**：不触发 active，且光标 `cursor: not-allowed`。

### 轴 3 · 键盘操作（keyboard）

- **定义**：不依赖鼠标，纯键盘完成核心交互（聚焦、触发、关闭、导航）。
- **通用键位表**：
  | 键 | 语义 | 适用 |
  |---|---|---|
  | `Tab` / `Shift+Tab` | 焦点顺序前移/后移 | 所有可聚焦元素 |
  | `Enter` | 激活主操作 | 按钮、链接、菜单项、确认弹窗 |
  | `Space` | 激活/切换 | 按钮、Checkbox、Switch、Tab |
  | `Esc` | 关闭/取消 | 弹窗、抽屉、下拉、气泡 |
  | `↑/↓` | 上下导航 | 菜单、下拉、列表、树、表格行 |
  | `←/→` | 左右导航/步进 | Tabs、Slider、Steps、Collapse、Tree 展开 |
  | `Home/End` | 首/尾 | 列表、滑块 |
  | `PageUp/PageDown` | 翻页 | 长列表 |
- **焦点环（统一）**：`focus-visible` 时 `outline: 2px solid var(--color-primary-normal)`，`outline-offset: 2px`。**不使用**默认浏览器焦点环，也**不硬编码** `rgba(52,145,250,…)`（焦点环颜色取 `--color-primary-normal` 即可）。
- **ARIA 语义**：
  | 控件 | role | 关键 aria |
  |---|---|---|
  | 按钮 | `button`（原生） | `aria-label`（图标按钮必填）、`aria-busy`（loading）、`aria-disabled` |
  | 开关 | `switch` | `aria-checked` |
  | 复选框/单选 | `checkbox` / `radio` | `aria-checked` |
  | 下拉/菜单 | `menu` / `menuitem` | `aria-haspopup`、`aria-expanded` |
  | 标签页 | `tab` / `tablist` / `tabpanel` | `aria-selected`、`aria-controls` |
  | 弹窗 | `dialog` | `aria-modal`、`aria-labelledby` |
  | 折叠 | — | `aria-expanded`、`aria-controls` |
- **焦点顺序**：遵循 DOM 顺序；弹窗打开时焦点移入弹窗、关闭时归还触发元素。

### 轴 4 · 加载状态（loading）

- **定义**：异步操作进行中的「进行中」反馈，防止重复提交 + 告知进度。
- **触发**：组件进入 loading（`loading=true` / 数据未就绪）。
- **视觉反馈**：
  - 按钮/触发控件：左侧 Spin 图标 + 文字「加载中」，`aria-busy`，指针事件禁用。
  - 数据区（表格/列表/卡片）：骨架屏（Skeleton）或整体 Spin 遮罩。
  - 图片：加载前占位 + 加载失败回退图。
- **互斥**：`loading` 与 `disabled` 逻辑互斥——loading 强制 disabled 行为，但视觉保留 loading 态（不塌缩为禁用灰）。
- **过渡**：Spin 旋转 `--duration-normal`（240ms）/圈 恒定旋转。
- **令牌缺口**：`tokens.css` **无** `loading` 专用令牌，加载态复用现有：Spin 色 `--color-primary-normal`、遮罩 `--color-bg-hover`（半透明）、骨架 `--color-fill-base-hover`。见「三、令牌缺口」。

### 轴 5 · 错误状态（error）

- **定义**：校验失败 / 非法输入 / 异常时的警示反馈。
- **触发**：校验不通过（表单）、接口异常（异步）、操作失败（反馈）。
- **视觉反馈**：
  - 输入/选择控件：边框 `1px solid var(--color-error-normal)` + 焦点环 `0 0 0 3px var(--color-error-bg)`（实色 tint，对齐运行时 `library/base.css`）。
  - 下方错误文案：`--color-error-normal`，字号 12px，`aria-live` 或 `aria-describedby` 关联。
  - 反馈类组件（Alert/Message/Result）：沿用各自 error 态配色。
- **令牌映射**：
  | 语义 | 令牌 |
  |---|---|
  | 错误主色 | `--color-error-normal` |
  | 错误边框 | `--color-error-normal` |
  | 错误焦点环（扩散阴影） | `--color-error-bg`（实色 tint） |
  | 错误底 | `--color-error-hover`（极浅） |
- **ARIA**：错误文案 `role="alert"` 或输入 `aria-invalid="true"` + `aria-describedby` 指向错误文案 id。

---

## 三、令牌映射总表（现有 token 直接用 / 缺口标注）

### 现有 token（直接引用，不新增）

| 轴 | 现成 token |
|---|---|
| hover | `--color-primary-hover`、`--color-success-hover`、`--color-warm-hover`、`--color-error-hover`、`--color-remind-hover`、`--color-bg-hover`、`--color-fill-base-hover`、`--color-base-hover`、`--color-text-link-hover`、`--surface-code-btn-bg-hover` |
| active | `--color-primary-active`、`--color-success-active`、`--color-warm-active`、`--color-error-active`、`--color-remind-active` |
| 禁用 | `--color-primary-disable`、`--color-border-base-disable`、`--color-icon-disable`、`--color-text-disable` |
| 阴影 | `--shadow-1`、`--shadow-2`、`--shadow-3`、`--shadow-4`、`--shadow-diffusion-primary/success/warm/error` |
| 动效 | `--duration-fast`（160ms）、`--duration-normal`（240ms）、`--easing-standard`（`cubic-bezier(0.2,0,0,1)`）、`--ease`（别名） |

> 注意：禁用令牌是 **`disable`** 拼写（`--color-primary-disable`），非 `disabled`——引用时不得误写。

### 令牌缺口（标注，**不擅自新增**）

| 缺口 | 现状 | 建议补法（待 UED 确认，本总纲只标注不落地） |
|---|---|---|
| focus（焦点环） | 无 `--color-focus-ring` 类令牌，焦点环颜色目前直接取 `--color-primary-normal` | 可增 `--focus-ring-color`、`--focus-ring-width`（2px）、`--focus-ring-offset`（2px） |
| loading | 无 `--color-loading` / Spin 专用令牌 | 复用 `--color-primary-normal`（Spin 色）+ `--color-bg-hover`（遮罩）；或增 `--loading-spin-color` |
| readonly | 无 `--color-readonly-bg` 只读底 | 复用 `--color-fill-base-hover`（浅灰底）作只读态；或增 `--color-readonly-bg` |

---

## 四、键盘操作参考表（速查）

| 组件族 | Tab | Enter | Space | Esc | 方向键 | 其他 |
|---|---|---|---|---|---|---|
| Button | ✓ | ✓ | ✓ | — | — | — |
| Input / Textarea | ✓ | 提交 | — | 清空(可选) | 光标移动 | — |
| InputNumber | ✓ | 确认 | — | — | ↑/↓ 步进 | — |
| Select / AutoComplete | ✓ | 选当前项 | 展开 | 关闭 | ↑/↓ 选项 | — |
| Cascader / TreeSelect | ✓ | 展开/选中 | — | 关闭 | ↑/↓/←/→ | — |
| Checkbox / Radio | ✓ | — | ✓ | — | 组内方向键切换 | — |
| Switch | ✓ | — | ✓ | — | — | — |
| Slider | ✓ | — | — | — | ←/→ 调值、Home/End | — |
| DatePicker / TimePicker | ✓ | 确认 | — | 关闭 | 面板内导航 | — |
| Tabs | ✓ | 选中 | 选中 | — | ←/→ 切换 tab | Home/End 首尾 tab |
| NavMenu / DropdownMenu | ✓ | 激活 | — | 关闭 | ↑/↓ 导航 | — |
| Tree | ✓ | 展开/激活 | — | — | ↑/↓/←/→ | — |
| Table | ✓ | 激活行操作 | 多选 | — | ↑/↓ 行导航 | — |
| Pagination | ✓ | 跳转 | — | — | — | — |
| Modal / Drawer / Popconfirm | 焦点锁定 | 确认 | — | 关闭 | — | 焦点陷阱（focus trap） |
| Steps / Collapse | ✓ | 展开 | — | — | — | Collapse ←/→ 展开 |
| Upload | ✓ | 触发选择 | — | — | — | — |

---

## 五、组件补表规则（各 SKILL.md 如何补轴）

每个组件 SKILL.md 的「状态视觉矩阵」按以下规则补轴，**通用值回指本总纲，只写组件特有值**：

1. **hover / active**：可交互组件补该色相的 hover/active 令牌；静态组件标「豁免」。
2. **键盘**：交互组件补「关键键位 + aria」，静态组件标「无键盘语义」。
3. **loading**：有异步行为的补加载态描述（Spin/Skeleton），其余标「无加载态」。
4. **error**：表单族补错误态（边框 + 扩散阴影 + 文案），其余按需标「无」。
5. **补表时**：状态色一律引用本总纲令牌总表，不得在单个 SKILL.md 里新造令牌或硬编码色值。

---

## 文件映射

- 令牌真源（只读）：`.claude/tokens/tokens.css`
- 组件补表：`.claude/skills/base/{Name}/SKILL.md`（62 份，状态视觉矩阵）
- 本总纲：`.claude/skills/base/INTERACTION.md`
