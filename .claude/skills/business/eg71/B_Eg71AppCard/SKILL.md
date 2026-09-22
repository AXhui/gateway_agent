---
name: B_Eg71AppCard
version: 1.0.0
description: EG71 应用导入卡（业务组件，存量补档）：标题 + 两列字段行 + 行内主钮，Import App Package/Configuration/Debug Script 三卡同形态复用
---

# 应用导入卡 · B_Eg71AppCard

> **存量补档**：本组件运行时先于本文档落地（`assets/js/registry-business.js#bc-eg71-app-card`），本文档按运行时反向固化契约。

## 1. 描述

**这是什么**：EG71 应用管理的通用「标题 + 两列字段行 + 行内主钮」导入卡：Figma 92:19840 的 Import App Package / Import App Configuration / Debug Script 三卡同形态复用。字段单元格为输入框或下拉（sm），可携带行内按钮（如 Select file / Upload）。

**不是什么**：不是应用列表卡（应用运行态列表走 `B_Eg71AppManager`）；不做实际上传/导入——控件变更与按钮点击以冒泡事件交宿主。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` / `ms-card-body` | 卡片容器 |
| `S_Typography` | `ms-h4` | 卡标题 |
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段格骨架 |
| `S_Input` | `ms-input` | 文本字段格 |
| `S_Select` | `ms-select--sm` | 下拉字段格 |
| `S_Button` | `ms-btn`（kind:'primary' → `ms-btn--primary`） | 行内按钮 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.title` | string | `''` | 卡标题（H4） |
| `ctx.rows` | Cell[][] | `[]` | 字段行（二维：每行 1-2 格）。Cell = `{ label, type:'input'\|'select', value?, placeholder?, options?:string[], button?:{ label, kind?:'primary', disabled? } }` |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-app-card-field` | `{ row, col, value }` | 字段控件 change（row/col 为 0 起格子坐标） |
| `eg71-app-card-button` | `{ row, col }` | 行内按钮点击 |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 常规 | 默认 | 头部标题 + `bc-eg71-app-fieldsrow` 两列栅格（列距 32、行距 16） |
| 带行内按钮 | Cell.button 存在 | `.bc-eg71-app-inline` 字段与按钮同行底对齐（gap 12） |
| 按钮禁用 | button.disabled | 原生 `disabled` |
| 窄屏 | ≤980px | 字段行降为单列 |

## 4. 场景（Scenarios）

**何时用**：App Manager / Node-RED / SDK 侧的导入类配置卡（包导入、配置导入、调试脚本）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 应用运行列表与状态 | `B_Eg71AppManager` |
| 设置页普通表单卡 | `bc-eg71-form-item-*` 系列 + `S_Card` |
| 导入失败提示 | `bc-eg71-alert-bar` |

## 5. Token（设计令牌）

全部继承 Card/Form/Input/Select/Button。结构类引用：
- `--spacing-16`（字段行距）/ `calc(--spacing-16 × 2)`（两列列距，见 business.css 注记 Figma 41:18631）
- `--spacing-12`（行内按钮 gap）/ `--spacing-20`（卡体上距）

## 6. 依赖（Dependencies）

`atoms`：`['S_Form','S_Select','S_Input','S_Button','S_Card']`（运行时按 S_* 名登记，与本库 atoms 命名等价）。结构类 `.bc-eg71-app-head/-fieldsrow/-inline`（`library/business.css`）。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-app-card'].render({
  title: 'Import App Package',
  rows: [[
    { label: 'App type', type: 'select', value: 'Official', options: ['Official', 'Custom'] },
    { label: 'Package file', type: 'input', placeholder: 'Select app package…',
      button: { label: 'Select file', kind: 'primary' } }
  ]]
});
B['bc-eg71-app-card'].bind(app);
app.addEventListener('eg71-app-card-button', e => filePickers[e.detail.row + ':' + e.detail.col].click());
```

## 8. 版本（Version）

见 frontmatter `version:`。
