---
name: B_ComTablePro
version: 0.1.0
description: Table Pro 组合表格（业务组件 · 规范稿）
---

# Table Pro 组合表格 · B_ComTablePro

> **状态**：规范稿 v0.1.0 —— 本文件是完整交互规格；运行时组件**尚未实现**（`registry-business.js` 无 `bc-com-table-pro` 条目）。实现落地 + 产品线页面验证后再升 1.0.0 发布。

## 1. 描述

「顶部操作区 + 富表头 + 表体 + 富分页器」四段式**组合表格**：树形层级、行内编辑、列级搜索/筛选/排序/拖宽/显隐、条件搜索卡片、三级 Loading。复杂表格场景的主表格骨架。

**不是什么**：不是基础组件（表格视觉/交互原子属 `S_Table` / `S_Pagination` 等，本组件只编排）；不是 `B_DataTable`（那是无列交互的简单列表主表格，见 §4）；不做数据请求层（数据经 `ctx` 注入，变更走回调）。

- **归属**：`_shared/`（`com` 跨线通用）
- **entityHint**：不限（列与行内操作由 `ctx.entity` 注入，换实体即复用）
- **运行时 id**：`bc-com-table-pro`（实现时注册）

## 2. Props（组装契约）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | `ms-table*` | 表格骨架（表头/表体/行分隔线/操作列） |
| `S_Checkbox` | `ms-checkbox` | 复选列（行勾选/表头全选）+ 筛选多选 + 列配置勾选 |
| `S_Button` | `ms-btn` | 工具栏主/次按钮、条件卡片 Search |
| `S_Input` | `ms-input` | 全局搜索框、列搜索、行内编辑输入 |
| `S_InputNumber` | `ms-input-number` | 范围搜索最小/最大值、跳转页码 |
| `S_Select` | `ms-select` | 下拉筛选、行内下拉编辑、每页条数 |
| `S_Switch` | `ms-switch` | 行内开关列（Enable） |
| `S_Tag` | `ms-tag` | 状态标签单元格 |
| `S_Icon` | `ms-ico` | 放大镜/齿轮/漏斗/箭头/铅笔/垃圾桶/省略号/循环箭头/＋− |
| `S_Tooltip` | `ms-tooltip` | 溢出完整内容、错误补充说明 |
| `S_Popover` / `S_DropdownMenu` | `ms-popover` / `ms-dropdown-*` | 列筛选面板、列配置面板、更多操作收纳 |
| `S_DatePicker` / `S_TimePicker` | `ms-datepicker` / `ms-timepicker` | 日期/时间过滤面板 |
| `S_Pagination` | `ms-pagination` | 分页器骨架 |
| `S_Empty` | `ms-empty` | 空数据态 / 无匹配态插画 |
| `S_Spin` | `ms-spin` / `ms-spin-mask` | 三级 Loading（表遮罩/按钮/单行） |
| `S_Popconfirm` | `ms-popconfirm` | 删除二次确认 |
| `S_Form` | `ms-form*` | 条件搜索卡片布局 + 校验错误态 |

### ctx 上下文契约（只读，变更走回调）

| 字段 | 说明 |
|---|---|
| `ctx.entity.fields` | 列定义，扩展标志：`sortable` / `filterable` / `searchable` / `editable` / `tree` / `width` / `minWidth` |
| `ctx.rows` | 行数据；树形时含 `children` 层级 |
| `ctx.selected` / `ctx.onSelect` | 选中行集合 / 勾选回调（驱动顶部按钮启停） |
| `ctx.query` / `ctx.onSearch` | 条件搜索条件集（AND 关系）/ 搜索回调 |
| `ctx.loading` | `'table'` \| `'button'` \| `'row'` 三级加载态 |
| `ctx.page` / `ctx.onPageChange` | 页码/条数 / 分页回调 |
| `ctx.onAdd/onEdit/onDelete/onExport/…` | 动作回调（按钮顺序见 §2 结构） |

### 结构骨架（四段 + 可展开卡片）

```
Table Pro
├── 顶部操作区 Toolbar
│   ├── 左：操作按钮组 —— 主按钮（Add 蓝色实心）+ 次按钮（描边），
│   │        顺序固定：新增类 → 导出类 → 状态操作类（Enable/Disable 等）→ 删除类
│   └── 右：全局搜索框（放大镜 + placeholder="Search"）+ 列配置按钮（齿轮，弹列显隐面板）
├── 表头 Header
│   ├── 复选框列（最左，全选/反选）
│   ├── 树形展开列（如有层级，展开箭头在复选框与首列之间）
│   ├── 列标题区（标题左对齐 + 右侧操作图标组，hover 显现/高亮：排序/筛选/搜索/隐藏列）
│   └── 列宽拖拽手柄（列右边界，hover 显示）
├── 表体 Body（每行底 1px 分隔线）
│   ├── 复选框单元格 → 树形缩进 → 数据单元格（文本溢出省略/Tag/行内编辑/空值"—"）
│   └── 操作列（最右固定不随横向滚动：铅笔编辑/垃圾桶 hover 红/"..."收纳）
└── 分页器 Pagination
    ├── 左：刷新按钮（循环箭头）+ Total: 总数
    └── 右：页码导航（上一页/数字页/…/下一页）+ 每页条数下拉（"10条/页"）+ 跳转输入（"前往 [输入框]"）
```

## 3. 状态与交互

### 3.1 表头列交互

**列搜索**：文本搜索（输入框 + 搜索按钮，模糊匹配）｜范围搜索（最小值 + 最大值双字段联动）｜日期过滤（弹 DatePicker/TimePicker 面板，范围或单值）。

**列筛选**：单选（radio 列表选中即过滤）｜多选（checkbox 列表）｜带搜索（面板顶部搜索框过滤候选）｜分类分组（按 Type 分组，组名灰色不可选）。

**列排序**：点标题或排序图标循环 **默认 → 升序 ↑ → 降序 ↓ → 默认**；生效列图标高亮，其他列排序重置。

**列宽拖拽**：hover 列右边界显竖线手柄 → 拖动显参考线实时调宽 → **全局最小列宽 100px**，不可拖更窄。

**列配置（显隐）**：齿轮弹出面板 → checkbox 列表勾选显示/取消隐藏 → **面板最大高度 640px**，超出滚动，随浏览器高度自适应。横向列配置本期不做。

### 3.2 表体行交互

**行选择**：单行勾选（行首复选框）｜全选（表头复选框选中当前页全部）｜树形全选（勾父节点自动勾全部子节点）｜选中计数驱动顶部操作按钮启停。

**树形展开**：父节点行首箭头（+ / −），点击展开/收起、箭头旋转；子节点按层级左缩进；分页/刷新后是否保持展开按业务配置。

**行内编辑**：开关列点击直接切换（即时生效或失焦保存）｜输入框列点击进入编辑态，失焦/回车保存｜下拉列点开选列表选中即更新｜禁用行全部行内组件 disabled 灰色不可点。

**操作列**：铅笔 → 行编辑或编辑弹窗；垃圾桶 → 确认对话框后删除（危险三态与确认弹窗规范见 [[B_ComDangerAction]]）；操作列固定最右，横向滚动不消失；超出动作收进 "..."。

**文本溢出**：超列宽显 "..."，hover 显黑色 tooltip 展示完整内容。

**行状态**：hover 整行浅灰｜选中行背景高亮｜禁用行整行半透明。

### 3.3 条件搜索（高级搜索卡片）

- **入口**：表格右上角搜索按钮（放大镜）；点击 → 卡片在表头下方展开；再点 → 收起回默认样式；**浏览器刷新回到默认样式**（不保持展开态）。
- **卡片布局**：宽度随条件数自适应（2 条件占 2 份宽、3 条件占 3 份）；**默认最宽 = table 宽度**（不超表格边界）；超出换 2 行展示；**最多 3 行**，超出滚动或收纳。
- **条件字段**：每条件 = 字段名 label + 输入控件（输入框/下拉/日期）；多条件 **AND** 关系；单条件可删除。
- **执行**：点 "Search" 触发过滤；无匹配显示空态「暂无匹配的数据」（居中插画 + 提示）。
- 全局搜索（表格外关键词搜索）**本期不做**。

### 3.4 可编辑输入四态

| 状态 | 表现 |
|---|---|
| 未输入 | 空 + placeholder，边框默认色 |
| 编辑输入 | 聚焦边框高亮（主题色），可输入 |
| 校验错误 | 边框变红 + 下方红色错误文字 + hover 补充 tooltip |
| 禁用 | 灰色背景，不可编辑 |

### 3.5 加载与空状态

**三级 Loading，层级 Table > Button > 单行**：

| 级 | 表现 |
|---|---|
| Table-Loading | 整表半透明遮罩；顶部操作按钮同时 disabled + loading 图标；数据行可见但半透明不可交互 |
| Button-Loading | 仅按钮 loading 旋转图标 + 文字、disabled；表格正常可交互（点击操作等响应场景） |
| 单行 Loading | 新插入行单独 loading，其他行正常 |

**空态**：空数据 → 表体居中插画 + 提示，表头/分页仍显示（Total: 0）｜无匹配 → 「暂无匹配的数据」｜某列参数空 → 统一占位 "—"，不影响他列。

### 3.6 分页器交互

刷新按钮重新请求当前页｜页码点击切换并高亮｜省略号 "..." 点击输入跳页｜上一页/下一页边界 disabled｜条数下拉 10/20/50/100，切换后回第 1 页｜跳转输入页码 + 回车/点「前往」跳转。

### 3.7 关键参数速查

| 规则点 | 结论 |
|---|---|
| 列最小宽度 | 全局 100px |
| 操作列位置 | 固定最右，横向滚动不消失 |
| 条件搜索卡片最大行数 | 最多 3 行 |
| 列配置面板最大高度 | 640px，随浏览器高度自适应 |
| 文本溢出处理 | 省略号 + hover tooltip |
| Loading 层级 | Table-Loading（整表遮罩）> Button-Loading（仅按钮）> 单行 Loading |
| 树形全选 | 父节点勾选 → 子节点自动全选 |
| 校验错误表现 | 红边框 + 下方红字 + hover tooltip |

## 4. 场景

**何时用**：复杂表格 —— 树形层级、行内编辑、列级搜索/筛选/排序/拖宽/显隐、条件搜索卡片、三级 Loading 任一需要时。

**何时不用**：

| 场景 | 改用 |
|---|---|
| 简单列表（无列交互/树形/行内编辑） | `B_DataTable` |
| 成员/角色权限表格 | `B_MemberTable` |
| EG71 告警事件表格 | `B_Eg71Alarm` |
| 详情页描述列表 | `B_DetailDrawer` 内描述项 |

## 5. Token（设计令牌清单）

> 实现时结构类（`library/business.css` 的 `.bc-tablepro-*` 作用域）只准引用令牌；与 `B_DataTable` §5 同源基准：

| 令牌 | 用在哪 |
|---|---|
| `--spacing-4 / -8 / -12 / -16` | 单元格/工具栏/面板内间距 |
| `--color-divider-base-1` | 行底分隔线、面板边线 |
| `--color-base-bg` / `--color-fill-base-hover` | 面板底色 / 行 hover 浅灰 |
| `--color-primary-normal` | Add 主按钮、聚焦边框、排序高亮 |
| `--color-error-normal` | 校验红边框、红字、危险操作 hover |
| `--color-text-primary / -secondary / -auxiliary` | 单元格/标题/辅助文字 |
| `--radius-4 / -8` | 单元格内元素 / 浮层面板圆角 |
| `--shadow-2 / -shadow-3` | 条件卡片 / 筛选·列配置浮层 |
| `--font-mono` | 数字/页码列 |

**待收敛裸值**（规范给定，令牌无命中，登记在案）：

| 裸值 | 位置 |
|---|---|
| `100px` | 全局最小列宽 |
| `640px` | 列配置面板最大高度（随浏览器高度自适应） |
| `1px` | 行底分隔线粗细 |
| `3 行` | 条件搜索卡片最大行数（数量约束，非尺寸） |

## 6. 依赖

- `atoms` 序列见 §2，全部为已封装基础组件 id（`registry-base.js` 在册 63 项，含 `table` / `date-picker` / `dropdown-menu` / `popover` / `popconfirm` / `spin`），R3 依赖闭环可校验。
- 声明**不新增基础原子，仅编排**。
- 浮层（筛选/列配置面板、tooltip）层级沿用基础组件既有 z-index 锚点，不新造层级值。
- 依赖版本范围：`ui-core`（见 `skills/business/GOVERNANCE.md`）。

## 7. 示例

```js
// render 骨架（实现时 registry-business.js#bc-com-table-pro）
render(ctx) {
  // 1 Toolbar：左（Add 主按钮 → 导出 → 状态操作 → Delete）右（Search 输入 + 齿轮列配置）
  // 2 条件搜索卡片（可展开）：N × (label + 控件) AND 关系 + Search 按钮 + 单条件删除
  // 3 Header：全选复选 | 树形箭头 | 列标题 + hover 图标组（排序/筛选/搜索/隐藏）| 拖宽手柄
  // 4 Body：行（hover/选中/禁用态）· 树形缩进 · cellHtml 分派 · 行内编辑 · 固定操作列
  // 5 Pagination：刷新 + Total | 页码(…可跳) + 条数下拉 + 跳转输入
}
bind(root) {
  // 排序三态循环（他列重置）/ 筛选面板开合 / 列宽拖拽(min 100px) / 列显隐(≤640px 自适应) /
  // 行选择（全选·树形父子联动）/ 树形展开收起（箭头旋转）/ 行内编辑（失焦·回车保存 + 四态校验）/
  // 条件卡片展开收起（刷新回默认）/ 溢出 tooltip / 删除 popconfirm / 三级 loading 注入
}
```

页面侧消费：只允许经模块装配引用，页面不直接内联其内部 `ms-*` —— 见 `.claude/rules/page-assembly.md`。

## 8. 版本

见 frontmatter `version:`（正文不重复维护）。当前 0.1.0 规范稿；实现落地 + 产品线实际页面验证（business-specific.md §4）后升 1.0.0 发布。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-com-table-pro`（**待实现**）
- 结构类：`library/business.css`（`.bc-tablepro-*`，**待实现**）
- 基础组件（只读）：`assets/js/registry-base.js`（§2 atoms 全部在册）
- 令牌（只读）：`.claude/tokens/tokens.css`
