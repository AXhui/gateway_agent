---
name: B_Eg71ToolCapture
version: 1.0.0
description: 网络抓包工具表单（业务组件 · 维护 → Tools → Network packet capture）
---

# 网络抓包工具 · B_Eg71ToolCapture

> **逻辑名**：`B_Eg71ToolCapture`
> **运行时 id**：`bc-eg71-tool-capture`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`125:12147`（工具tool/Network packet capture，1220×664）

---

## 一、描述

维护 → Tools → Network packet capture 抓包配置表单：动作行（Start / Stop / Download）+ 两列字段（Ethernet Interface 下拉默认 Any、IP Address、Port）+ Advance 复选联动高级规则 textarea（tcpdump 语法）。

不是简单连通性诊断——Ping/Traceroute 改用 `B_Eg71ToolDiagnose`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form` / `ms-form-item` | 表单结构 |
| `S_Input` | `ms-input` / `ms-input--textarea` | IP / Port / 高级规则 |
| `S_Select` | `ms-select` | Ethernet Interface |
| `S_Checkbox` | `ms-checkbox` | Advance 开关（联动面板显隐） |
| `S_Button` | `ms-btn` / `ms-btn--filled` | Start / Stop / Download |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.running` | `boolean` | `false` | 运行中 Stop 可用 |
| `ctx.file` | `string` | `''` | 已产出文件名，有值 Download 可用 |
| `ctx.advance` | `boolean` | `true` | Advance 复选初始态 |
| `ctx.interfaces` | `string[]` | `['Any','eth0','eth1']` | 接口下拉选项 |
| `ctx.interface` / `ctx.ip` / `ctx.port` | `string` | — | 字段初值 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-tool-actions（Start / Stop / Download）
  └ .ms-form
      ├ .bc-eg71-tool-fields（2 列栅格：Ethernet Interface / IP Address / Port）
      ├ .ms-checkbox.bc-eg71-tool-advance（Advance）
      └ .ms-input--textarea[data-capture-panel]（Advance 勾选时显示）
```

### bind 骨架
`[data-capture-advance]` change → 同卡 `[data-capture-panel]` 显隐；三按钮 → `eg71-tool-start / eg71-tool-stop / eg71-tool-download`（`detail.tool:'capture'`）。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | Start 可用；Stop / Download 禁用 |
| 运行中 | Stop 可用 |
| 已产出文件 | Download 可用 |
| Advance 关 | 高级规则 textarea 隐藏（`hidden` 属性） |

## 四、场景

**何时用**：维护 → Tools → Network packet capture 页。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Ping / Traceroute | `B_Eg71ToolDiagnose` |
| Qxdmlog 日志抓取 | `B_Eg71ToolQxdmlog` |

## 五、Token

`--color-bg-card`、`--color-text-secondary`、`--color-border-base`、`--spacing-20`、`--spacing-16`、`--spacing-32`、`--spacing-8`、`--radius-4`。

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-tool-capture'].render({ interface: 'Any', advance: true });
BIZ['bc-eg71-tool-capture'].bind(app);
app.addEventListener('eg71-tool-start', e => startCapture());
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-tool-capture`
- 结构类：`library/business.css`（`bc-eg71-tool-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
