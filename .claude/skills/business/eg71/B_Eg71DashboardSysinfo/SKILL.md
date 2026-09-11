---
name: B_Eg71DashboardSysinfo
version: 0.1.0
description: EG71 Dashboard「System information」系统信息摘要面板（业务组件）
---

# 系统信息摘要面板 · B_Eg71DashboardSysinfo

> **逻辑名**：`B_Eg71DashboardSysinfo`
> **运行时 id**：`bc-eg71-dashboard-sysinfo`
> **分类**：概览
> **entityHint**：`gateway`
> **产品线**：`eg71`
> **依赖基础组件**：`ms-card` / `ms-desc`

---

## 1. 描述

Milesight 网关 Dashboard 总览页的「System information」面板：型号 / 网关 EUI / 固件版本 / 硬件版本 / 运行时长 / 本地时间六项摘要信息，纯只读展示，非 bordered 的 Descriptions 摘要形态。

不是什么：不是协议接口详情抽屉里的 bordered 字段分组（那是 `bc-eg71-protocol-detail` 的 `sections[].fields`），本组件是总览页的固定六项系统摘要，字段集合不随协议变化。

## 2. 组装契约（atoms 依赖 + ctx + render 骨架）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 面板容器（边框/圆角/背景 + `ms-card-head--plain` 标题条） |
| `S_Descriptions` | `ms-desc` / `ms-desc-item` / `ms-desc-label` / `ms-desc-value` | 六项标签-值摘要，用基础组件默认（非 bordered）形态，不做作用域覆写 |

### ctx 上下文契约

- `ctx.sysinfo`：只读对象，形状：
  ```js
  {
    model: 'EG710', gatewayEui: '24E124126D123456', firmware: '60.0.0.35',
    hardware: 'V1.0', uptime: '4 days, 12h 56m', localTime: '2026-09-09 11:20:00'
  }
  ```
  - 六个字段固定映射为 Model / Gateway EUI / Firmware version / Hardware version / Uptime / Local time，缺省字段渲染为 `-`。
  - 纯只读展示，无编辑/回调。

### render(ctx) 骨架

1. `.ms-card.bc-eg71-dashboard-sysinfo` → `ms-card-head--plain`（标题「System information」）→ `ms-card-body`。
2. `ms-desc` 内固定顺序渲染六个 `ms-desc-item`（标签+值），直接用基础组件默认样式，不做 `.bc-eg71-*` 作用域覆写——与 `bc-eg71-protocol-detail` 内因 Figma 精确值差异而覆写 `ms-desc` 不同，本面板视觉与基础组件默认态一致，无需覆写（铁律二：业务组件只做框架编排，不重复描述基础组件）。

本组件无 `bind`（纯展示，无交互）。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 默认 | 有数据 | 六项摘要按固定顺序纵向排列 |
| 字段缺省 | 某字段值为 `null`/`undefined` | 该项显示占位符 `-` |

## 4. 场景

**何时用**：EG71 Dashboard 总览页，需要「网关基础信息只读摘要」的固定六项展示场景。

**何时不用**：

| 场景 | 改用 |
|---|---|
| 协议接口详情的多组字段（含表格/多子设备） | `bc-eg71-protocol-detail` |
| 需要 bordered 表格观感的字段展示 | 各自组件内按 `.ms-desc--bordered` 单独走基础组件变体，不下沉到本组件 |
| 系统设置表单页的可编辑字段 | `bc-eg71-content` 内的表单条目组件 |

## 5. Token

无新增令牌，字段值/标签颜色沿用 `S_Descriptions` 基础组件默认 token 集（`--color-text-auxiliary` / `--color-text-primary` 等），本组件不做样式覆写。

## 6. 依赖

`atoms`：`descriptions` / `text`（见第 2 节表），不新增基础原子，仅编排。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
B['bc-eg71-dashboard-sysinfo'].render({
  sysinfo: {
    model: 'EG710', gatewayEui: '24E124126D123456', firmware: '60.0.0.35',
    hardware: 'V1.0', uptime: '4 days, 12h 56m', localTime: '2026-09-09 11:20:00'
  }
});
```

参见 `output/eg71-dashboard-verify.html`。

## 8. 版本

见 frontmatter `version:`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-dashboard-sysinfo`
- 结构类：`library/business.css`（无新增覆写，仅 `.bc-eg71-dashboard-sysinfo` 容器） 
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 示例页：`output/eg71-dashboard-verify.html`
