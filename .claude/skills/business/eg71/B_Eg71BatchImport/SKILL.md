---
name: B_Eg71BatchImport
version: 1.0.0
description: EG71 批量导入向导页（业务组件）：协议选择卡（checkbox 卡网格 + 子协议嵌套）+ 上传卡（文件类型分段单选 + 模板链接 + 空态上传区），Next 随选择启停
---

# EG71 批量导入向导页 · B_Eg71BatchImport

> **逻辑名**：`B_Eg71BatchImport`
> **现 id**：`bc-eg71-batch-import`
> **分类**：数据服务
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：有（协议勾选/文件类型/规则链接事件 + Next 同步禁用）
> **站点依据**：`output/eg71-site-distill/dom/data-services_equipment-data_batch-import.html` + `css/style-pages.css` `.batch-import-*` 族（协议四卡 LoRaWAN/KNX/BACnet(MS·TP,IP)/Modbus(RTU,TCP,RTU over TCP)；.xlsx/.csv 单选；模板下载/批量导出链接提示；空态上传区）

## 1. 描述

**这是什么**：EG71 设备批量导入向导首步（整页）：**协议选择卡**（协议 checkbox 卡三列网格，多子项协议嵌套子协议 checkbox 组）→ **上传卡**（Select File Type 分段单选 .xlsx/.csv + 提示文案内嵌模板/导出链接钮 + 空态上传区「Please select a protocol before uploading」）。选协议后上传区转就绪文案。底部 Cancel/Next Step 由 `bc-eg71-form-footer`（ctx.buttons）组合，未选协议 Next 置灰（bind 同步）。

**不是什么**：不是上传项表单行（那是 `bc-eg71-form-item-upload`）；不做真实文件 IO 与导入提交——全部事件交宿主。

**归属产品线**：`eg71`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card(-head/-body)` | 协议选择卡 / 上传卡 |
| `S_Checkbox` | `ms-checkbox` | 协议与子协议勾选 |
| `S_Radio` | `ms-radio-btn-group`（outline 分段） | 文件类型 .xlsx/.csv |
| `S_Button` | `ms-btn--link` | Import Rules / 模板/导出提示链接 |
| `S_Icon` | `ico('upload', 32)` | 上传区 32px 阶梯图标 |
| `S_Text` | `ms-text` / `bc-empty-sub` | 提示文案 |

### ctx 上下文契约（只读，变更走回调）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.protocols` | `{key, label, children?[]}[]` | LoRaWAN/KNX/BACnet/Modbus 四卡（站点形态） | 协议卡组 |
| `ctx.selected` | string[] | `[]` | 已勾选协议/子协议值 |
| `ctx.fileTypes` | string[] | `['.xlsx','.csv']` | 文件类型组 |
| `ctx.fileType` | string | 首项 | 当前文件类型 |
| `ctx.hint` / `ctx.dropHint` / `ctx.dropSub` / `ctx.dropReadyText` | string | 站点文案 | 提示/空态/就绪文案 |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-import-change` | `{ selected }` | 任一协议 checkbox change（同时同步 Next 禁用态） |
| `eg71-import-filetype` | `{ fileType }` | 切换 .xlsx/.csv |
| `eg71-import-rules` | `{}` | 点击 Import Rules |
| `eg71-import-hint` | `{ target }` | 点击提示内 Template File / Batch Export 链接 |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 未选协议（默认） | `selected` 空 | 上传区空态：32px upload 图标 + dropHint + dropSub；宿主 Next 置灰 |
| 已选协议 | 任一勾选 | 上传区转就绪文案（Click or drag file…） |
| 子协议嵌套 | 协议卡 `children` | 卡内纵向 checkbox 组（8px 距，24px 缩进） |
| 文件类型切换 | 点击分段钮 | `ms-radio-btn--checked` + aria 同步 |

## 4. 场景（Scenarios）

**何时用**：Equipment Data → Batch Import 向导（以及同构的批量导入流：IO 设备/自定义解析库导入）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 表单内单个文件导入位 | `bc-eg71-form-item-upload` |
| 列表页入口 | `bc-eg71-toolbar`（Batch Import ghost 钮） |

## 5. Token（设计令牌）

- 卡：`--color-bg-card` / `--color-border-base` / `--radius-4` / 内距 `--spacing-20`（卡）/ `--spacing-16`（协议卡）
- 上传区：`--color-fill-base-normal` 底 + dashed `--color-border-base`；上下 `--spacing-64`
- 间距：卡间 `--spacing-24`（红线模块 ≥24；站点 16px 不照抄，diff-matrix D2）/ 网格 `--spacing-16` / 组内 `--spacing-8`
- 图标：32px 阶梯，`--color-icon-secondary`

## 6. 依赖（Dependencies）

`atoms: ['card','checkbox','radio','button','icon','text','empty']`——仅编排。结构类 `.bc-eg71-batch-import` / `.bc-eg71-import-(grid|proto|children|filetype|drop|hintlink)`（`library/business.css`）。底部操作栏组合 `bc-eg71-form-footer`（不重复实现）。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
el.innerHTML =
  B['bc-eg71-page-back'].render({ title: 'Upload File' }) +
  B['bc-eg71-batch-import'].render({}) +
  B['bc-eg71-form-footer'].render({ buttons: [
    { label: 'Cancel', action: 'cancel' },
    { label: 'Next Step', kind: 'filled', action: 'next', disabled: true }
  ]});
['bc-eg71-page-back', 'bc-eg71-batch-import', 'bc-eg71-form-footer'].forEach(id => B[id].bind(el));
el.addEventListener('eg71-import-change', e => console.log('selected:', e.detail.selected)); // Next 已由 bind 同步启停
```

## 8. 版本（Version）

见 frontmatter `version:`。
