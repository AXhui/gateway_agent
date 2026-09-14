---
name: B_Eg71ToolDiagnose
version: 1.0.0
description: Ping / Traceroute 诊断工具表单（业务组件 · 维护 → Tools）
---

# Ping / Traceroute 诊断工具 · B_Eg71ToolDiagnose

> **逻辑名**：`B_Eg71ToolDiagnose`
> **运行时 id**：`bc-eg71-tool-diagnose`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`125:11905`（三级菜单=工具tool · 四级菜单=Ping）、`125:11981`（Traceroute）

---

## 一、描述

维护 → Tools 下 Ping 与 Traceroute 两页共用的连通性诊断表单：Host 标签 + 输入框（placeholder「Eg.」）+ 主按钮（文案随 `ctx.tool` 切换 Ping / Traceroute）+ 次按钮 Stop。

不是抓包工具——多字段抓包形态改用 `B_Eg71ToolCapture`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form` / `ms-form-item` | 表单结构 |
| `S_Input` | `ms-input` | Host 输入框（32px 默认高） |
| `S_Button` | `ms-btn` / `ms-btn--filled` | Ping/Traceroute 主按钮 + Stop 次按钮 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tool` | `'ping'｜'traceroute'` | `'ping'` | 决定主按钮文案 |
| `ctx.host` | `string` | `''` | Host 值；空则主按钮禁用（Figma 默认态） |
| `ctx.running` | `boolean` | `false` | 运行中：Stop 可用、主按钮保持可用 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  └ .ms-form > .bc-eg71-tool-fields > .ms-form-item
      ├ 标签行（Host，复用 bc-eg71-form-item-labelrow 结构类）
      └ .bc-eg71-tool-btnrow = ms-input + ms-btn--filled + ms-btn
```

### bind 骨架
`[data-tool-start]` → `eg71-tool-start {tool:'diagnose'}`；`[data-tool-stop]` → `eg71-tool-stop`。

## 三、状态

| 状态 | 表现 | Token 映射 |
|---|---|---|
| 默认（Host 空） | 主按钮禁用 | `--color-primary-disable` 底 + `--color-text-disable`（L2 disabled） |
| Host 已填 | 主按钮可用 | `--color-primary-normal` |
| 运行中 | Stop 可用 | 次按钮 enabled |
| 悬停 | 输入框/按钮 hover | L2 `:hover` 令牌 |

## 四、场景

**何时用**：维护 → Tools → Ping / Traceroute 页（配合 `B_Eg71MaintenanceTabs`）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 多字段抓包（接口/IP/端口/Advance） | `B_Eg71ToolCapture` |
| 无字段日志抓取 | `B_Eg71ToolQxdmlog` |
| 设置页大号（40px）表单项 | `bc-eg71-form-item-input` |

## 五、Token

`--color-bg-card`、`--color-text-secondary`、`--color-text-auxiliary`、`--color-primary-normal`、`--color-primary-disable`、`--color-text-disable`、`--color-border-base`、`--spacing-20`、`--spacing-16`、`--spacing-32`、`--spacing-8`、`--radius-4`。

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-tool-diagnose'].render({ tool: 'ping', host: '192.168.1.1' });
BIZ['bc-eg71-tool-diagnose'].bind(app);
app.addEventListener('eg71-tool-start', e => startPing());
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-tool-diagnose`
- 结构类：`library/business.css`（`bc-eg71-tool-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
