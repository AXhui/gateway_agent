# K_pattern · 上传范式

> 上传类需求的形态选型与装配参考。依据：EG71 真实产品站 CSS 词汇（`style-shared.css` `iot-upload-*` 族）+ 37 页 DOM dump 实际渲染态（`output/eg71-site-distill/`，2026-09）。

## 站点上传词汇 → 库组件映射

| 站点形态 | CSS 词汇 | DOM 实测 | 库组件 | 状态 |
|---|---|---|---|---|
| 按钮+列表（Import/Export） | `iot-upload-button(-list/-file-item/-operator…)` | **8 页实际渲染**（app_docker/network_vpn/system_setting/scan-config/scan-confirm/parsing-library/app_python/app_nodered） | `B_Eg71FormItemUpload`（`bc-eg71-form-item-upload` v1.0.0） | ✅ 已铸造 |
| 向导上传区（空态/就绪） | `batch-import-upload-empty/-hint` | 1 页（batch-import） | `B_Eg71BatchImport`（`bc-eg71-batch-import` v1.0.0） | ✅ 已铸造 |
| 矩形拖拽区 | `iot-upload-rectangle(-empty-img/-file-card/-done-status/-error-item…)` | CSS 在、DOM 态未抓到 | — | ⏳ 遗留（见下） |
| 自定义拖拽卡 | `iot-upload-custom(-drag-icon/-drag-note/-drag-progress/-waiting-block/-done-item/-error-item…)` | CSS 在、DOM 态未抓到 | — | ⏳ 遗留 |
| 链接文件列表 | `iot-upload-link(-list/-file-item/-extra-download/-extra-delete/-help…)` | CSS 在、DOM 态未抓到 | — | ⏳ 遗留 |
| 图片/方块 | `iot-upload-image-block` / mask 族 | CSS 在、DOM 态未抓到 | — | ⏳ 遗留 |

## 已铸造形态契约要点

### 表单上传项（button 形态，8 页证据）

- 结构：标签行 → Import 主钮（accept 约束）+ Export ghost（无文件置灰，12px 间距）→ 文件行（文件图标+文件名+移除）→ 提示文案。
- 状态机：无文件（Export 置灰）→ 已选（文件行出现）→ error（红字）；事件 `eg71-upload-import/export/remove`。
- 证据页：Docker 引擎包 `.tar.gz`（app_docker）、VPN 证书 `.crt`（network_vpn）、HTTPS 证书（system_setting）。

### 向导上传区（batch-import 页证据）

- 空态（未选协议）：upload 图标（32px）+ 主文案 + 副提示，灰底 dashed 边框；就绪态换「Click or drag file」文案。
- 文件类型分段单选（.xlsx/.csv）+ 提示内嵌模板下载/批量导出链接；Next 随协议选择启停。

## 遗留（四形态完整规范）

`rectangle / custom / link-list / image` 四形态只有 CSS 词汇，37 页 dump 未抓到文件已选/上传中/失败等交互态——**不做臆测铸造**。后续抓取到对应状态 DOM 后按 page-assembly.md §3 铸造路径补：疑似 atoms = `S_Upload(S_Dragger)` + progress + result；命名建议 `B_Eg71UploadDrop`（拖拽区）/ `B_Eg71UploadFileList`（链接列表）。

## 装配要点

- 表单内单个导入位 → `bc-eg71-form-item-upload`；整页向导上传 → `bc-eg71-batch-import`。
- 上传中/失败反馈走 Message/Result 反馈组件（`bc-eg71-maint-message` 范式），不在上传位内自绘 toast。
- accept/大小/行数约束写进提示文案（产品文案），不放评审注记（page-assembly.md §5 纯净性）。

## 相关

- [`form.md`](form.md) 表单页范式；[`list.md`](list.md) 列表页范式；映射见 [`K_mapping.md`](../K_mapping.md)。
