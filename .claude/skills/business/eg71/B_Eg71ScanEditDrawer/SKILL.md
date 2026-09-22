---
name: B_Eg71ScanEditDrawer
version: 1.0.0
description: EG71 扫描编辑抽屉（业务组件）：单设备编辑（7 项）/ 多设备编辑（公共 4 项）右侧抽屉，开合骨架镜像 bc-eg71-protocol-detail
---

# 扫描编辑抽屉 · B_Eg71ScanEditDrawer

## 1. 描述

**这是什么**：EG71 扫描确认页的右侧编辑抽屉。`mode:'single'`（行内【编辑】）标题「编辑设备」，渲染 DevEUI 只读 + 设备名/描述/型号 + 公共 4 项；`mode:'multi'`（勾选多台后工具栏【编辑】）标题「编辑多个设备」，仅公共 4 项（03-ued §4.5：不显示名称/描述/DevEUI/型号）。公共 4 项 = 配置文件（**过滤 ABP 模式**）/ fPort / 超时时间(min) / 帧计数校验开关。

**不是什么**：不是通用详情抽屉（协议详情用 `bc-eg71-protocol-detail`——本组件的开合骨架正是镜像它：`hidden` + `.is-open` + close 委托 + 遮罩命中判定 + 内部 stopPropagation，但内容/事件完全不同）；不负责把值写回表格——保存以 `eg71-scan-save` 冒泡，由宿主应用到行数据并刷新。

**归属产品线**：`eg71`。**entityHint**：`device`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Drawer` | `ms-mask--drawer` / `ms-drawer` / `ms-drawer-head/body/foot` | 右侧 480px 抽屉浮层骨架 |
| `S_Form` | `ms-form` / `ms-form-item` / `ms-form-label(--required)` | 表单骨架（复用 `bc-eg71-form-item-*`） |
| `S_Input` | `ms-input` / `ms-input--disabled` | 设备名/描述/DevEUI（只读） |
| `S_InputNumber` | `ms-input-number` + 步进钮组（上 − 下 +） | fPort / 超时时间 |
| `S_Select` | `ms-select` | 型号 / 配置文件 |
| `S_Switch` | `ms-switch(-track/-thumb)` | 帧计数校验 |
| `S_Button` | `ms-btn` / `ms-btn--filled` | 取消 / 保存 |
| `S_Icon` | `ico('close', 20)` | 头部关闭 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.mode` | `'single' \| 'multi'` | `'multi'` | 编辑形态（决定标题与字段集） |
| `ctx.targets` | string[] | `[]` | 目标 DevEUI 列表（写入 `data-scan-targets`，保存时原样带回） |
| `ctx.device` | `{ devEui }` | `{}` | single 态 DevEUI 来源 |
| `ctx.value` | `{ profile, fPort, timeout, frameCheck, name?, description?, model? }` | `{ profile:'ClassA-OTAA', fPort:1, timeout:1440, frameCheck:false, … }` | 受控初值 |
| `ctx.profiles` | string[] | `['ClassA-OTAA']` | 配置文件选项（render 内再过滤 `/ABP/i`） |
| `ctx.models` | string[] | `[]` | 型号选项（自动并入 'None' 去重） |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-scan-save` | `{ mode, targets, value }` | 点击【保存】（value 含全部字段；single 带 name/description/model，multi 仅公共 4 项）；派发后抽屉自动 close |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 关闭（默认） | 初始渲染 | 根 `.bc-eg71-scan-edit-drawer` 带 `hidden` |
| 打开 | 宿主调用 `wrap.open()`（bind 挂载到根元素） | 移除 `hidden` + 加 `.is-open`，遮罩 + 480px 抽屉滑入 |
| 关闭（× / 取消 / 遮罩） | `[data-scan-drawer-close]` / `[data-scan-drawer-cancel]` / 点击遮罩空白（`e.target === mask`） | 恢复 `hidden`；抽屉内部点击 stopPropagation 不误关 |
| 数值步进 | 点击步进钮（组内第 1 钮 −、第 2 钮 +） | 输入值 ±1，下限 0 |

## 4. 场景（Scenarios）

**何时用**：扫描确认页——行内【编辑】（single，由 `bc-eg71-scan-device-table` 冒泡 `eg71-scan-edit-single` 驱动）；勾选多台后工具栏【编辑】（multi，`eg71-scan-edit-multi` 驱动）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 协议详情侧滑 | `bc-eg71-protocol-detail` |
| 表格行内轻编辑（名称/描述/型号） | `bc-eg71-scan-device-table` 行内控件 |
| 整页设备编辑（激活/ABP） | `bc-eg71-device-form` |

## 5. Token（设计令牌）

全部继承 `S_Drawer` / `S_Form` / 表单原子既有令牌。本组件结构类仅引用：
- `--spacing-16`（`.bc-eg71-scan-edit-form` 表单纵向 gap）

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `drawer` / `form` / `input` / `input-number` / `select` / `switch` / `button` / `icon`。结构类 `.bc-eg71-scan-edit-drawer` / `.bc-eg71-scan-edit-drawer-panel` / `.bc-eg71-scan-edit-form`（`library/business.css`）；栅格与 labelrow/unit 复用全局 `bc-eg71-formgrid` / `bc-eg71-form-item-*`。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
app.innerHTML = B['bc-eg71-scan-edit-drawer'].render({
  mode: 'multi', targets: ['24E124FFFE00A001', '24E124FFFE00A002'],
  value: { profile: 'ClassA-OTAA', fPort: 1, timeout: 1440, frameCheck: false },
  profiles: ['ClassA-OTAA', 'ClassB-OTAA', 'ClassC-OTAA', 'ClassA-ABP']
});
B['bc-eg71-scan-edit-drawer'].bind(app);
const drawer = app.querySelector('.bc-eg71-scan-edit-drawer');
drawer.open();

app.addEventListener('eg71-scan-save', e => {
  // e.detail = { mode:'multi', targets:[...], value:{ profile, fPort, timeout, frameCheck } }
  applyToRows(e.detail.targets, e.detail.value); // 宿主写回并刷新表格
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
