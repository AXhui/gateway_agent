---
name: B_Eg71LibProgressModal
version: 1.0.0
description: 内置库更新进度弹窗（在线更新/离线包导入共用 · EG71）
---

# B_Eg71LibProgressModal · 内置库更新进度弹窗

## 1. 描述

**这是什么**：内置库在线更新 / 离线包导入共用的遮罩进度弹窗（Figma 71.0.0.4「解析中」帧）：深遮罩 + 居中小卡（`ms-modal--sm`）= spinner 标题行 + 提示文案 + 进度条 + Cancel。fetch / parse / write 三阶段内置文案。

**不是什么**：不是带头部的标准表单弹窗（无标题栏无 ×，只能 Cancel 或等待完成）；不是页内进度条（那是 `ms-progress` L2 直用）；不承载结果展示（完成态用 `B_Eg71LibResultModal`）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. Props（组装契约）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.phase` | `'fetch'/'parse'/'write'` | `'fetch'` | 三阶段；fetch→Fetching the latest built-in libraries... / parse→Parsing… Please wait. / write→Writing to the built-in library... |
| `ctx.percent` | number \| null | `null` | 进度百分比；为空时仅 spinner 不渲染进度条 |
| `ctx.title` | string | phase 推导（fetch='Online Update'，其余='Importing'） | 弹窗标题（aria-label + 标题行） |
| `ctx.hint` | string | phase 内置文案 | 提示文案覆写 |
| `ctx.cancelText` | string | `'Cancel'` | 取消钮文案 |
| `ctx.open` | boolean | `true` | `false` 时产物 hidden |

事件：`eg71-lib-progress-cancel`（Cancel / 点遮罩 / Esc）。

atoms 依赖：`S_Modal`（`ms-mask`/`ms-modal--sm`）、`S_Progress`（`ms-progress-line/bar/text`）、`S_Icon`（loaderCircle 24）、`S_Button`。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 获取中 | `phase:'fetch'` | spinner + Fetching 文案，无进度条 |
| 解析中 | `phase:'parse', percent:30` | spinner + Parsing… + 30% + 进度条 |
| 写入中 | `phase:'write', percent:80` | spinner + Writing… + 80% + 进度条 |
| 键盘 | Esc | 弹窗开着时触发 cancel |

## 4. 场景

- **何时用**：在线更新点击 Obtain 后全流程（获取→解析→写入）、离线包 Upload 确认后（解析→写入）。
- **何时不用**：固件升级多步弹窗 → `bc-upgrade-modal`；瞬时 loading（<1s）直接按钮 `ms-btn--loading`。

## 5. Token

`--surface-mask`（遮罩）、`--color-text-primary/secondary`、`--color-primary-normal`（进度条与 spinner，经 L2 `ms-progress*`/`ms-spin`）、`--spacing-8/12/16/20/24`。

## 6. 依赖

`render(ctx)` + `bind(root)`；无新增基础原子，仅编排。注册：`registry-business.js#bc-eg71-lib-progress-modal`。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
layer.innerHTML = B['bc-eg71-lib-progress-modal'].render({ phase: 'parse', percent: 30 });
B['bc-eg71-lib-progress-modal'].bind(layer);
layer.addEventListener('eg71-lib-progress-cancel', () => console.log('cancelled'));
```

## 8. 版本

见 frontmatter `version:`。
