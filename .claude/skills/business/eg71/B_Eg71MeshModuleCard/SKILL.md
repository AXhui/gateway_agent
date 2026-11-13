---
name: B_Eg71MeshModuleCard
version: 1.1.0
description: Mesh 通用设置模块卡（业务组件）
---

# Mesh 通用设置模块卡 · B_Eg71MeshModuleCard

> **逻辑名**：`B_Eg71MeshModuleCard`
> **运行时 id**：`bc-eg71-mesh-module`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa General 页的通用被动设置模块卡：承载 Frequency Plan / Advanced Setting（**可折叠** + 内嵌边框 panel / 双列 grid / compound 复合行）/ Packet Filter / Data Retransmission / Network Server Parameters 等按角色显隐的参数区块。行级字段（input / select / switch / text / panel / grid / compound）由宿主经 `ctx.rows` 注入，字段变更统一 `eg71-mesh-module-field`、折叠统一 `eg71-mesh-module-fold` 冒泡。卡头**无图标**（Figma 43:12085：标题纯文字，折叠卡标题尾随 18px chevron）。

**不是**：带复杂交互编排的设置卡（Mesh 配置/转发目的地用 `B_Eg71MeshConfigCard` / `B_Eg71MeshForwardCard`）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 模块卡容器 |
| `S_Input` | `ms-input` | input 行 |
| `S_Select` | `ms-select` | select 行 |
| `S_Switch` | `ms-switch` | 卡头总开关 / switch 行 |
| `S_Statistic` | `ms-stat-*` | stat 行（数值块，Dashboard 设备概况/信道容量） |
| `S_Button` | `ms-btn` | button 行（卡内动作，如 Add） |
| `S_Icon` | `MS_ICONS` | 折叠 chevron（18px）/ button 行图标（16px）；卡头无图标 |
| `S_Typography` | 字号阶梯 | 标签 14 / 辅助 12 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `title` | string | — | 卡头标题（纯文字，无图标） |
| `collapsible` | boolean | `false` | 可折叠卡（标题变按钮，尾随 18px chevron，`aria-expanded` 同步） |
| `open` | boolean | `true` | 折叠卡初始展开态（`collapsible:true` 时生效） |
| `desc` | string | — | 卡内顶部说明 |
| `headSwitch` | `{on,label}` | 无 | 卡头右侧总开关（如 Enable Filter） |
| `rows` | array | `[]` | `{type:'input'\|'select'\|'switch'\|'text'\|'stat'\|'button'\|'panel'\|'grid'\|'compound', key, label, value, options, on, msg, required, unit, placeholder, readonly, rows(嵌套), selectKey, selectOptions, selectValue, kind, icon}`；`panel`=内嵌边框分组（title + 嵌套 rows）、`grid`=双列（`ms-grid-2 bc-com-form-grid` 包嵌套 rows）、`compound`=select+input 复合行（如 Channel Mode Custom）；stat 行汇总渲染为三列数值块，button 行渲染卡内动作钮 |
| `errors` | `{key:msg}` | `{}` | 行级错误（覆盖 msg；compound 按 `selectKey`/`key` 分别落） |
| `tip` | string | — | 表底说明 |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-module-field` | `{key, value}` | 行字段变更（input/select 值、switch 布尔、button 行 click） |
| `eg71-mesh-module-head` | `{on}` | 卡头总开关切换 |
| `eg71-mesh-module-fold` | `{open}` | 折叠卡标题点击（body `hidden` 随动，`aria-expanded` 同步） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 折叠 | `collapsible:true` 时标题为按钮（`is-open` + chevron 旋转 + `aria-expanded`），body 带 `hidden` |
| 错误 | `ms-input--error` / `ms-select--error` + `--error` 消息（覆盖 msg） |
| 只读 | input 行 `readonly` |

## 四、场景

**何时用**：LoRa General 页按角色显隐的通用参数区块（频段计划 / 报文过滤 / 数据重传 / NS 参数）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh 组网配置 | `B_Eg71MeshConfigCard` |
| 转发目的地 | `B_Eg71MeshForwardCard` |
| 角色/部署模式选择 | `B_Eg71MeshRoleCard` |

## 五、Token

`--spacing-4/12/16/20/32`、`--color-text-primary/secondary`、`--color-divider-base-2`、`--color-fill-base-normal`（panel 边框分组底）、`--radius-8`（panel 圆角）（控件态色经 ms-input/ms-select/ms-switch 既有契约），无新增常量。

## 六、依赖

- 基础原子：`form / input / select / switch / card / icon / text`，不新增基础原子，仅编排。

## 七、示例

```js
const M = window.MS_BIZ_INDEX['bc-eg71-mesh-module'];
$app.innerHTML = M.render({
  icon: 'filter', title: 'Packet Filter',
  headSwitch: { on: true, label: 'Enable' },
  rows: [
    { type: 'input', key: 'mac', label: 'MAC Address', value: '', required: true, placeholder: '6-byte hex' },
    { type: 'switch', key: 'dropUnknown', label: 'Drop Unknown Devices', on: false }
  ]
});
M.bind($app);
```

## 八、版本

见 frontmatter `version:`。
