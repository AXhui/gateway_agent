---
name: B_Eg71EventList
version: 1.0.0
description: EG71 事件列表（业务组件 · Events → List · inbox 收件箱 / log 日志双形态）
---

# EG71 事件列表 · B_Eg71EventList

> **逻辑名**：`B_Eg71EventList`
> **运行时 id**：`bc-eg71-event-list`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`92:15883`（List 收件箱版 1180×756）/ `205:2107`（List-2 日志版 1180×756）

---

## 一、描述

Events → List 页事件表，一个组件两形态（`ctx.mode`）：

- **inbox 收件箱态**（92:15883）：行复选 + 已读/未读状态列（Read 次文字色 / 「Mark as Read」蓝色链接）+ 工具栏「Mark ALL as Read」「Delete」+ 行尾 more 操作。
- **log 日志态**（205:2107）：工具栏仅「Export」主按钮；Time / Type / Message 三列只读。

两态共用：240px 定宽右置搜索 + 41px 斑马纹表格 + 分页器（左刷新与 Total 计数，右页码 / 每页条数 / 前往跳页）。

不是通知配置——通知渠道与事件×动作开关改用 `B_Eg71EventNotify` / `B_Eg71EventChannel` / `B_Eg71EventMqtt`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | 结构表格（bc- 斑马纹事件表） | 41px 行高数据表 |
| `S_Checkbox` | `ms-checkbox`（16px） | 行复选 / 表头全选（inbox） |
| `S_Input` | `ms-input` | 240px 搜索框（search 图标后缀） |
| `S_Select` | `ms-select ms-select--sm` | 每页条数下拉 |
| `S_Button` | `ms-btn` / `ms-btn--filled` / `ms-btn--xs` | Mark ALL as Read / Delete / Export / 刷新 |
| `S_Pagination` | `ms-pagination` / `ms-page-item` / `ms-page-jump` | 页码 / 跳页 |
| `S_Icon` | `ms-ico`（check/trash/download/search/refresh/moreHoriz） | 工具钮与行操作图标 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.mode` | `'inbox' \| 'log'` | `'inbox'` | 列表形态 |
| `ctx.rows` | `Array<{checked, read, type, time, message}>` | 3 行 Figma 样例 | 行数据；`read` 仅 inbox 用 |
| `ctx.columns` | `{type, type2, time, message}` | Figma 原文 | 表头文案覆写（见业务规范 6） |
| `ctx.total` / `ctx.size` / `ctx.page` | `number` | `312` / `10` / `1` | 分页三要素 |
| `ctx.keyword` | `string` | `''` | 搜索初值 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-event-toolbar
  │   ├ .bc-eg71-event-toolbar-left（inbox：Mark ALL as Read + Delete；log：Export 主按钮）
  │   └ label.ms-input.bc-eg71-event-search > input[data-event-search] + search 图标
  ├ table.bc-eg71-event-table（41px 斑马纹）
  │   ├ inbox：复选 / Type(状态) / Type(类型) / Time / Message / 40px ops(moreHoriz)
  │   └ log：Time / Type / Message
  └ .bc-eg71-event-pager
      ├ 左：刷新 ms-btn[data-event-refresh] + Total 计数
      └ 右：.ms-pagination（页码 data-event-page / 每页条数 select / 前往跳页 input）
```

### bind 骨架
搜索 input → `eg71-event-search {keyword}`；Mark as Read 链接 → `eg71-event-read {index}`；Mark ALL as Read / Delete / Export / 刷新 → 同名事件；复选 change → `eg71-event-select {index, checked}` / `eg71-event-select-all {checked}`；页码 click → `eg71-event-page {page}`；每页条数 / 跳页 change → `eg71-event-page-size {size}` / `eg71-event-jump {page}`；行 more → `eg71-event-ops {index}`。数据变更由宿主改 ctx 后重渲染。

## 三、状态

| 状态 | 表现 |
|---|---|
| 已读行（inbox） | 状态列显示「Read」次文字色 |
| 未读行（inbox） | 状态列显示「Mark as Read」链接（`--color-text-primary-normal`，hover 下划线） |
| 斑马纹 | 表头灰底；数据行奇白偶灰（`--color-fill-base-normal`） |
| 选中行 | 复选勾选（视觉不整行高亮，由宿主扩展） |

### 业务规范（整理自 Figma 92:15883 / 205:2107）
1. **双形态一组件**：List 页签存在两版设计——收件箱态（92:15883：复选 + 已读语义 + 批量读/删）与日志态（205:2107：只读 + Export 导出）；以 `ctx.mode` 切换，宿主按产品决策选用。
2. **已读语义（inbox）**：事件有已读/未读两态；未读行「Mark as Read」链接即点即读（行级轻操作，无确认弹窗）；工具栏「Mark ALL as Read」一键全读。
3. **批量删除（inbox）**：「Delete」按行复选批量删，不内嵌确认——确认由宿主挂 `eg71-event-delete` 后的弹窗承担；表头复选做全选/半选联动（宿主状态机）。
4. **导出（log）**：日志态工具栏仅 Export 主按钮，导当前过滤条件全量数据；两态共用右置 240px 定宽搜索（输入即过滤，`eg71-event-search` 实时上报）。
5. **分页器**：左侧刷新按钮（重拉当前页不换页）+ `Total:N` 总数；右侧页码窗口（1-5 + … + 末页）/ 每页条数（10/20/50 条/页）/ 「前往」跳页；全部经事件上报，组件不自持分页状态。
6. **双「Type」表头勘误**：Figma inbox 表两列同题「Type」为复制痕迹——实现语义 = 已读状态列 + 事件类型列；`ctx.columns`（`type` / `type2`）可覆写文案。
7. **行尾 more 操作**：40px 操作列 16px more-horiz 图标，具体菜单（删除本行等）由宿主经 `eg71-event-ops` 拉起，组件不内嵌菜单。

## 四、场景

**何时用**：网关事件/告警记录的浏览、已读管理、批量删除、导出与检索。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 通知渠道与事件×动作开关 | `B_Eg71EventNotify` / `B_Eg71EventChannel` / `B_Eg71EventMqtt` |
| dashboard 只读统计表 | L2 `S_Table`（`ms-table`） |
| 行内可编辑配置表 | `B_Eg71SnmpMibView` / `B_Eg71SnmpVacm` 范式 |

## 五、Token

`--color-bg-card`、`--color-bg-page`、`--color-fill-base-normal`、`--color-text-primary`、`--color-text-secondary`、`--color-text-primary-normal`、`--color-icon-auxiliary`、`--color-border-base`、`--font-sans`、`--spacing-8`、`--spacing-12`、`--spacing-16`、`--spacing-20`、`--spacing-40`、`--spacing-48`、`--radius-s`。
（41px 行高、Type 184px / Time 197px / log·Type 200px / log·Time 260px、搜索 240px 均为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。分页视觉走 L2 `ms-pagination` 原子（30px 页码钮为产品化尺寸，Figma 36px 仅设计稿标注）。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let rows = [{ type: 'Cellular Up', time: '2024-12-24 00:23:23', message: 'Cellular 1 dialed up', read: false }];
const render = () => {
  app.innerHTML = BIZ['bc-eg71-event-list'].render({ mode: 'inbox', rows, total: 312, page: 1 });
  BIZ['bc-eg71-event-list'].bind(app);
};
app.addEventListener('eg71-event-read', e => { rows[e.detail.index].read = true; render(); });
app.addEventListener('eg71-event-read-all', () => { rows.forEach(r => r.read = true); render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-event-list`
- 结构类：`library/business.css`（`bc-eg71-event-toolbar*` / `bc-eg71-event-search` / `bc-eg71-event-table*` / `bc-eg71-event-col-*` / `bc-eg71-event-read` / `bc-eg71-event-link` / `bc-eg71-event-pager*` / `bc-eg71-event-total`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-event-verify.html`
