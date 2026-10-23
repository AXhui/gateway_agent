---
name: B_Eg71LibUploadModal
version: 1.0.0
description: 离线包上传弹窗（内置库导入 · EG71）
---

# B_Eg71LibUploadModal · 离线包上传弹窗

## 1. 描述

**这是什么**：内置库**离线包导入弹窗**（Figma 71.0.0.4「导入离线包」帧）：标准弹窗 = 头部标题 + 说明 Alert（醒目提示官方包来源）+ `Official Download` 蓝链接（后台直接下载，免 GitHub）+ Upload-Drag 拖拽区（`ms-upload`）+ 文件态行/校验错误文案 + Cancel / Upload 底钮（Upload 随文件就绪启停）。

**不是什么**：不是自定义库导入向导页（那是 `bc-eg71-batch-import` 协议选择+上传卡）；不是文件管理器——不做真实文件系统读取，文件选择以 `eg71-lib-upload-file` 事件交宿主裁决（宿主决定 fileState）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. Props（组装契约）

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.fileState` | `'empty'/'ok'/'error'` | `'empty'` | ok=显示文件行且 Upload 可用；error=红色校验错误文案且 Upload 禁用 |
| `ctx.fileName` / `ctx.fileSize` | string | `''` | 文件行内容（ok 态） |
| `ctx.errorText` | string | 内置文案 | 校验失败文案（文件类型/大小错误） |
| `ctx.note` | string | 内置文案 | 说明 Alert 正文（醒目提示） |
| `ctx.linkText` | string | `'Official Download'` | 官方下载链接文案 |
| `ctx.dropHint` / `ctx.dropSub` | string | 内置文案 | 拖拽区主/副文案 |
| `ctx.title` / `ctx.cancelText` / `ctx.confirmText` | string | `'Import Offline Package'` / `'Cancel'` / `'Upload'` | 文案 |
| `ctx.open` | boolean | `true` | `false` 时产物 hidden |

事件：`eg71-lib-upload-file`（点击/键盘触发挥区，宿主模拟选文件）/ `-remove` / `-download`（官方链接）/ `-cancel`（Cancel / × / 遮罩 / Esc）/ `-confirm`（Upload，仅 ok 态可点）。

atoms 依赖：`S_Modal`（head/body/foot 全结构）、`S_Alert`（info 说明）、`S_Upload`（`ms-upload` 拖拽区 + `ms-upload-file` 文件行）、`S_Button`、`S_Icon`（info/upload 32/fileArchive/close/warn）。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 空态 | `fileState:'empty'` | 拖拽区 hover 主色描边，Upload 禁用 |
| 文件就绪 | `fileState:'ok'` | 文件行（图标+名+大小+移除 ×），Upload 可用 |
| 校验失败 | `fileState:'error'` | 红色错误文案（warn 图标），Upload 禁用 |
| 键盘 | 拖拽区 Enter/Space 触发 file 事件；Esc 关闭 | — |

## 4. 场景

- **何时用**：内置库断网/离线场景手动上传 Milesight 官方 ZIP（PRD「导入离线包」步骤 1-2）。
- **何时不用**：在线拉取 → Obtain + `bc-eg71-lib-progress-modal` 直连；自定义库批量导入 → `bc-eg71-batch-import`。

## 5. Token

`--color-fill-base-normal` / `--color-border-base`（Alert info，经 L2 `ms-alert--info`）、`--color-text-link-normal`（官方链接，经 `ms-link`）、`--color-error-normal`（校验错误）、`--color-text-primary/secondary/auxiliary`、`--spacing-4/8/12/16/24`。

## 6. 依赖

`render(ctx)` + `bind(root)`；无新增基础原子，仅编排。注册：`registry-business.js#bc-eg71-lib-upload-modal`。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
layer.innerHTML = B['bc-eg71-lib-upload-modal'].render({
  fileState: 'ok', fileName: 'msil-inbuilt-1.4.0.zip', fileSize: '45.2 MB'
});
B['bc-eg71-lib-upload-modal'].bind(layer);
layer.addEventListener('eg71-lib-upload-confirm', () => startImport());
```

## 8. 版本

见 frontmatter `version:`。
