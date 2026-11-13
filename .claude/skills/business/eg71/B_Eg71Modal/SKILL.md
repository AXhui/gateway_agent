---
name: B_Eg71Modal
version: 1.1.0
description: EG71 业务弹窗调度器（业务组件）：按业务动作匹配删除/禁用/确认/选择四类弹窗规则；删除走 Message 版式（Figma 业务库「弹窗」Error 变体）
---

# 业务弹窗（删除/禁用/确认/选择） · B_Eg71Modal

## 1. 描述

**这是什么**：EG71 网关后台的业务弹窗调度器。不是「一个固定内容的弹窗」，而是按传入的业务动作（`ctx.action`）做**业务匹配**，分发到对应弹窗规则——删除功能触发「删除确认」规则、禁用功能触发「禁用确认」规则、普通操作触发「信息确认」规则、需要选目标时触发「设备选择」规则。触发时弹窗始终居于页面正中间（基础 Modal 的 `.ms-mask` 已保证）。

**两套版式**：`action:'delete'` 走 **Message 版式**（Figma 业务库「弹窗」Error 变体，node 127:8693）：无标题栏、无关闭 × 钮；24px 实心红圆 × 图标（`MS_ICONS.circleXFilled`）与标题/正文同排（`gap 8 / items-start`）；标题 18px/500/行高 26 `--color-text-primary`，正文 14px/400 `--color-text-secondary`；卡片 416px 宽、圆角 8、水平内边距 24 / 垂直 16；按钮组右对齐 `gap 16`（Cancel 白底描边 + Delete 红底 `--color-error-normal`）。其余 action（disable/confirm/select）走 **头/体/尾版式**（标题栏 + 右上 × 关闭 + 语义色图标）。

**不是什么**：不是重新实现基础 Modal（`S_Modal`）的开合/遮罩/动效逻辑；不是某个具体业务表单弹窗（如具体的「新增设备」弹窗），那类一次性表单弹窗应直接组合 `S_Modal` + `S_Form`。

**归属产品线**：`eg71`（Milesight LoRaWAN 网关）。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Modal` | `ms-mask` / `ms-modal` / `ms-modal-head/body/foot` | 居中浮层容器，头/体/尾骨架（delete 版式只用 `ms-modal` + `ms-modal-foot`） |
| `S_Button` | `ms-btn` / `ms-btn--filled` / `ms-btn--danger` | 取消 / 确认按钮，danger 用于删除场景 |
| `S_Result` | `ms-result-icon` + `--error/--warn/--info` | 头/体/尾版式弹窗头部的语义色图标圆点 |
| `S_Icon` | `MS_ICONS.circleXFilled`（24px） | delete 版式左置实心红圆 × 图标（`--color-error-normal` 圆底 + 常量色叉） |
| `S_Input` | `ms-input` | 删除场景的「输入关键词确认」二次校验 |
| `S_Radio` | `ms-radio-btn-group` / `ms-radio-btn` | 选择场景的单选目标列表 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 说明 |
|---|---|---|
| `ctx.action` | `'delete' \| 'disable' \| 'confirm' \| 'select'` | **业务匹配的唯一依据**：删除功能传 `'delete'`，禁用功能传 `'disable'`，普通确认传 `'confirm'`（默认），选择目标传 `'select'` |
| `ctx.title` | string | 弹窗标题，未传时按 action 给出默认标题 |
| `ctx.desc` | string | 正文说明文案 |
| `ctx.confirmKeyword` | string | `action:'delete'` 时选填：要求用户输入该关键词才可确认（高危删除二次校验） |
| `ctx.warnText` | string | `action:'delete'` 时的不可撤销提示文案 |
| `ctx.options` | `{label, value}[]` | `action:'select'` 时的可选目标列表 |
| `ctx.okText` / `ctx.cancelText` | string | 按钮文案覆写 |

变更方式：调用方重新 `render(ctx)` 传入不同 `action`；组件内部不持有跨渲染状态。

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 关闭（默认） | 初始渲染 | 根节点 `.bc-eg71-modal` 带 `hidden` 属性，不可见 |
| 打开 | 页面内 `[data-modal-trigger="bc-eg71-modal"]` 元素被点击 | 移除 `hidden`，加 `.is-open`，`.ms-mask` 居中显示 `.ms-modal` |
| 关闭（× / 取消 / 点击遮罩） | 点击 `.ms-modal-close` / `[data-modal-cancel]` / 遮罩空白处 | 恢复 `hidden`；delete 版式无 × 钮，只能经取消/遮罩/Esc 关闭 |
| 删除二次校验未通过 | `action:'delete'` 且设置 `confirmKeyword`，输入未匹配 | 确认按钮 `disabled`（`ms-btn` 原生禁用态） |
| 选择态 | `action:'select'`，点击某个 `.ms-radio-btn` | 该项加 `.ms-radio-btn--checked`，`aria-checked="true"`，其余复位 |

## 4. 场景（Scenarios）

**何时用**：EG71 页面内任意「点击某按钮 → 需二次确认/选择才能继续」的业务动作，例如表格行「删除」按钮、设备/规则「禁用」开关确认、批量操作前的信息确认、需要从多个设备中选一个的场景。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 固定展示的多步骤任务弹窗（如固件升级流程） | `bc-upgrade-modal` |
| 承载完整表单字段（多输入项、非确认类） | 直接组合 `S_Modal` + `S_Form` |
| 非阻断式轻量提示（气泡确认，不需要遮罩） | `S_Popconfirm` |
| 详情查看（非确认动作） | `bc-detail-drawer` |

## 5. Token（设计令牌）

全部令牌均来自组合的基础组件（`S_Modal`/`S_Button`/`S_Result`/`S_Input`/`S_Radio`/`S_Icon`），本组件自身新增的结构类只引用间距/圆角令牌，不新增颜色常量（delete 版式 18px 标题为 Figma 业务库「弹窗」Error 变体真源值，见 §1）：
- `--spacing-12`（图标与内容间距，`.bc-eg71-modal-body-row`）
- `--spacing-8` / `--spacing-16` / `--spacing-24`（delete 版式图标-文字间距 / 卡片纵向 gap·垂直内边距 / 水平内边距）
- `--radius-8`（delete 版式卡片圆角）
- `--color-error-normal`（delete 版式红圆与 Delete 按钮，经 `S_Icon`/`S_Button` 引用）

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖已注册基础组件 `modal` / `button` / `result` / `input` / `radio` / `icon`（`assets/js/registry-base.js`）。业务层结构类（`library/business.css`）：`.bc-eg71-modal-body-row` / `.bc-eg71-modal-body-content`（头/体/尾版式）、`.bc-eg71-modal--msg` / `.bc-eg71-modal-msg-row` / `-msg-ic` / `-msg-text` / `-msg-title`（delete Message 版式），纯布局编排，无视觉常量。

## 7. 示例（Examples）

```js
// 删除功能 → 匹配「删除确认」规则
const html = MS_BIZ_INDEX['bc-eg71-modal'].render({
  action: 'delete',
  title: '删除网关',
  desc: '删除后该网关的所有配置与历史数据将无法恢复。',
  confirmKeyword: 'DELETE'
});
app.innerHTML = html;
MS_BIZ_INDEX['bc-eg71-modal'].bind(app);
// 触发：页面内放一个 <button data-modal-trigger="bc-eg71-modal">删除</button>

// 选择设备 → 匹配「选择」规则
MS_BIZ_INDEX['bc-eg71-modal'].render({
  action: 'select',
  title: '选择设备',
  optionLabel: '设备',
  options: [{ label: 'Sensor-01' }, { label: 'Sensor-02' }]
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
