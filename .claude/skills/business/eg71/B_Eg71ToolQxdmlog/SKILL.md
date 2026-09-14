---
name: B_Eg71ToolQxdmlog
version: 1.0.0
description: Qxdmlog 日志抓取页（业务组件 · 维护 → Tools → Qxdmlog）
---

# Qxdmlog 日志抓取 · B_Eg71ToolQxdmlog

> **逻辑名**：`B_Eg71ToolQxdmlog`
> **运行时 id**：`bc-eg71-tool-qxdmlog`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`125:12325`（工具tool/Qxdmlog，1220×216）

---

## 一、描述

维护 → Tools → Qxdmlog 页：动作行（Start 主按钮 / Stop / Download）+ 日志输出空态面板；启动后日志流由宿主回填输出区。

不是抓包表单——带字段配置的抓包改用 `B_Eg71ToolCapture`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn` / `ms-btn--filled` | Start / Stop / Download |
| `S_Empty` | `ms-empty` | 未抓取时输出区空态 |
| `S_Icon` | `ms-ico` | 空态插图（内联 SVG） |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.running` | `boolean` | `false` | 运行中 Stop 可用 |
| `ctx.file` | `string` | `''` | 已产出日志文件名，有值 Download 可用 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-tool-actions（Start / Stop / Download）
  └ .ms-empty（空态文案 "No log output yet..."）
```

### bind 骨架
三按钮 → `eg71-tool-start / eg71-tool-stop / eg71-tool-download`（`detail.tool:'qxdmlog'`）。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | Start 可用；Stop / Download 禁用；输出区空态 |
| 运行中 | Stop 可用 |
| 已产出 | Download 可用（宿主以日志内容替换空态） |

## 四、场景

**何时用**：维护 → Tools → Qxdmlog 页（调制解调器诊断日志抓取）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Ping / Traceroute | `B_Eg71ToolDiagnose` |
| 抓包（接口/IP/端口/规则） | `B_Eg71ToolCapture` |

## 五、Token

`--color-bg-card`、`--color-text-auxiliary`、`--color-border-base`、`--spacing-20`、`--spacing-16`、`--spacing-8`、`--spacing-40`、`--radius-4`。

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-tool-qxdmlog'].render({});
BIZ['bc-eg71-tool-qxdmlog'].bind(app);
app.addEventListener('eg71-tool-download', e => downloadLog());
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-tool-qxdmlog`
- 结构类：`library/business.css`（`bc-eg71-tool-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
