---
name: B_Eg71LibResultModal
version: 1.0.0
description: 内置库更新/导入完成摘要弹窗（EG71）
---

# B_Eg71LibResultModal · 内置库更新结果弹窗

## 1. 描述

**这是什么**：内置库在线更新 / 离线包导入**完成摘要弹窗**（Figma 71.0.0.4「更新完成 / 自定义库冲突」帧）：绿色对勾 + `Import Completed` 标题 + `Inbuilt library rebuilt:` 统计行 + 可选详情段（重命名映射 / 被引用备份 / 无法删除保留，各段带 copy）+ `Back to Device Library` 主钮。**统计值为 0 的项省略不渲染**（PRD「避免信息冗余」规则内置）。

**不是什么**：不是阻断式错误弹窗——与自定义库同名冲突**不阻断**，在完成弹窗内以 Renamed 段体现（PRD 交互要点④）；不是通用信息确认弹窗（那是 `bc-eg71-modal` 的 info 规则）；不是维护结果页卡（那是 `bc-eg71-maint-message`）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. Props（组装契约）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.stats` | `{added?, updated?, removed?}` | `{}` | 统计行；**值为 0 / 缺省的键不渲染该行** |
| `ctx.sections` | `{type, title?, note?, items}[]` | `[]` | 详情段；type=`renamed`（items 为 `{from,to}` 映射）/ `inuse`（被引用已备份）/ `kept`（无法删除保留）；items 亦可传字符串数组 |
| `ctx.title` | string | `'Import Completed'` | 标题 |
| `ctx.statsTitle` | string | `'Inbuilt library rebuilt:'` | 统计小节标题 |
| `ctx.okText` | string | `'Back to Device Library'` | 主按钮文案 |
| `ctx.open` | boolean | `true` | `false` 时产物 hidden |

事件：`eg71-lib-result-ok`（主钮 / Esc）、`eg71-lib-result-copy`（detail.section=段序号）。

atoms 依赖：`S_Modal`（`ms-mask`/`ms-modal--sm`）、`S_Result`（success 语义色，结构类自承载小尺寸圆底）、`S_Button`、`S_Icon`（check/arrowRight/copy 16px）。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 标准摘要 | 仅 stats | Added/Updated/Removed 行（0 省略） |
| 冲突重命名 | sections 含 `renamed` | `AM02 → AM02-1` 映射行，to 侧链接色 |
| 被引用备份 | sections 含 `inuse` | 型号清单 + 备份说明 note |
| 无法删除保留 | sections 含 `kept` | 型号清单 |
| copy hover | 段头 copy 钮 | `--color-text-secondary` |

## 4. 场景

- **何时用**：在线更新完成（含冲突重命名/被引用备份变体）、离线包导入完成（标准 / 被引用更新 / 被删保留变体）。
- **何时不用**：失败提示 → `bc-eg71-message`（toast）或错误 Alert；确认类对话 → `bc-eg71-modal`。

## 5. Token

`--color-success-bg/normal`（对勾圆底）、`--color-text-primary/secondary`、`--color-text-link-normal`（重命名 to 侧）、`--color-fill-base-normal`（段落底）、`--color-icon-auxiliary`、`--radius-full/m/s`、`--spacing-4/8/12/16/20/24`。

## 6. 依赖

`render(ctx)` + `bind(root)`；无新增基础原子，仅编排。注册：`registry-business.js#bc-eg71-lib-result-modal`。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
layer.innerHTML = B['bc-eg71-lib-result-modal'].render({
  stats: { added: 30, updated: 20 },               // removed=0 省略
  sections: [{ type: 'renamed', items: [{ from: 'AM02', to: 'AM02-1' }] }]
});
B['bc-eg71-lib-result-modal'].bind(layer);
```

## 8. 版本

见 frontmatter `version:`。
