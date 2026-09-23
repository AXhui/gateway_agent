---
name: B_Eg71FormItemUpload
version: 1.0.0
description: EG71 表单上传项（业务组件）：Import 主钮 + Export ghost + accept 约束 + 文件行 + 提示，form-item 族第 7 员，站点 ysd-upload button 形态（8 页）
---

# EG71 表单上传项 · B_Eg71FormItemUpload

> **逻辑名**：`B_Eg71FormItemUpload`
> **现 id**：`bc-eg71-form-item-upload`
> **分类**：表单
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：有（import/export/remove 事件冒泡）
> **站点依据**：`output/eg71-site-distill/` 8 页 `ysd-upload` button 形态（app_docker：Import .tar.gz 引擎包 + Upgrade；network_vpn：Import .crt 证书 + Export；system_setting：HTTPS 证书 Import/Export；scan-config / scan-confirm / parsing-library / app_python / app_nodered）

## 1. 描述

**这是什么**：EG71 配置表单「导入/导出」上传项：标签行（label + 必填标 + info 图标，与 form-item 族同骨架）→ 按钮行（Import 主按钮 + Export ghost 按钮，无文件时 Export 置灰）→ 已选文件行（文件图标 + 文件名 + 移除钮，error 态红字）→ 提示文案（accept 约束说明）。

**不是什么**：不是拖拽上传区（拖拽/矩形/链接列表四形态站点 DOM 未抓到交互态，规范见 `K_patterns/upload.md` 遗留）；不发起真实请求——文件选择/导出以事件交宿主。

**归属产品线**：`eg71`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label--required` | 表单项骨架 |
| `S_Button` | `ms-btn(--filled)` / `ms-btn--link` | Import 主钮 / 文件移除钮 |
| `S_Icon` | `ico('info'/'log'/'close', 16)` | 标签提示 / 文件 / 移除图标（16px 阶梯） |
| `S_Text` | `ms-text` / `bc-eg71-form-item-msg` | 文件名与提示文案 |

### ctx 上下文契约（只读，变更走回调）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.label` | string | `'Certificate'` | 标签 |
| `ctx.required` | boolean | `true` | 必填标（族内一致） |
| `ctx.accept` | string | — | 文件类型约束（`.crt` / `.tar.gz`…），写进默认提示 |
| `ctx.importLabel` / `ctx.exportLabel` | string | `Import` / `Export` | 按钮文案 |
| `ctx.showExport` | boolean | `true` | 是否渲染 Export 钮 |
| `ctx.fileName` | string | `''` | 已选文件名（空则无文件行、Export 置灰） |
| `ctx.status` | `'normal' \| 'error'` | `normal` | 文件行/提示态 |
| `ctx.msg` | string | 按 accept 生成 | 说明文案 |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-upload-import` | `{ accept }` | 点击 Import |
| `eg71-upload-export` | `{}` | 点击 Export（disabled 不触发） |
| `eg71-upload-remove` | `{}` | 点击文件移除钮 |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 无文件（默认） | `fileName` 空 | 无文件行；Export 置灰 |
| 已选文件 | `fileName` 非空 | 文件行（log 图标 + 文件名 + 移除钮）；Export 可用 |
| error | `status:'error'` | 文件行与提示红字（`--color-text-error-normal`） |
| 键盘可达 | Tab | 三个按钮原生可达 |

## 4. 场景（Scenarios）

**何时用**：配置表单里的证书/固件/模板导入位（VPN 证书、HTTPS 证书、Docker 引擎包、SNMP MIB、自定义解析库…）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 批量导入向导的整页上传区 | `bc-eg71-batch-import` |
| 升级文件 + 升级执行组合 | `bc-eg71-upgrade` / `bc-eg71-app-sdk`（存量） |

## 5. Token（设计令牌）

- 文字：`--color-text-secondary`（标签）/ `--color-text-auxiliary`（提示）/ `--color-text-error-normal`（错误）
- 图标：`--color-icon-secondary`（文件图标）；16px 阶梯
- 间距：`--spacing-12`（按钮间）/ `--spacing-8`（文件行内距/上距）

## 6. 依赖（Dependencies）

`atoms: ['form','button','icon','text']`——仅编排。结构类 `.bc-eg71-form-item-file(--error)`（复用族内 labelrow/btnrow/msg 类）。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
el.innerHTML = B['bc-eg71-form-item-upload'].render({
  label: 'Certificate', accept: '.crt',
  msg: 'Only .crt files are supported.'
});
B['bc-eg71-form-item-upload'].bind(el);
el.addEventListener('eg71-upload-import', () => filePicker.pick('.crt'));
```

## 8. 版本（Version）

见 frontmatter `version:`。
