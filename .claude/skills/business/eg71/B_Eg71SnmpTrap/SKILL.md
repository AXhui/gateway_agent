---
name: B_Eg71SnmpTrap
version: 1.0.0
description: SNMP Trap 告警目标（业务组件 · 系统设置 → SNMP → Trap）
---

# SNMP Trap 告警目标 · B_Eg71SnmpTrap

> **逻辑名**：`B_Eg71SnmpTrap`
> **运行时 id**：`bc-eg71-snmp-trap`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`123:15156`（Trap，1220×300）

---

## 一、描述

SNMP → Trap 页：标题行「Enable」+ 28×16 小开关（Trap 总闸）+ 两列表单（SNMP Version 下拉 / Server Address / Port / Name）。

不是 Agent 本机配置——端口/版本/系统标识改用 `B_Eg71SnmpAgent`；这里配置的是网关主动上报 Trap 的接收端（NMS）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 两列字段结构 |
| `S_Input` | `ms-input` | Server Address / Port / Name |
| `S_Select` | `ms-select` | SNMP Version（SNMPv1 / v2 / v3） |
| `S_Switch` | `ms-switch ms-switch--xs`（28×16） | Enable 总闸 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |
| `S_Title` | `ms-h4` | 「Enable」标题 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.enabled` | `boolean` | `true` | 总开关初值；false 时表单整体禁用 |
| `ctx.versions` | `string[]` | `['SNMPv1','SNMPv2','SNMPv3']` | 版本下拉选项覆写 |
| `ctx.version` | `string` | `'SNMPv2'` | 版本初值（不在 options 内时回退默认） |
| `ctx.trap` | `object` | `{}` | 字段值包：`server` / `port` / `name` |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-snmp-head（ms-h4「Enable」+ ms-switch--xs[data-snmp-trap-toggle]）
  └ .bc-eg71-snmp-fields{--disabled}（两列栅格）
      ├ ms-form-item（SNMP Version + ms-select[data-snmp-trap-version]）
      ├ ms-form-item（Server Address + ms-input[data-snmp-trap-server]）
      ├ ms-form-item（Port + ms-input[data-snmp-trap-port]）
      └ ms-form-item（Name + ms-input[data-snmp-trap-name]）
```

### bind 骨架
开关 change → 冒泡 `eg71-snmp-trap-toggle {enabled}`。字段值提交由宿主页面级 Apply 承担。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 开关开；四字段可编辑；版本默认 SNMPv2 |
| 总闸关闭 | 字段区 `--disabled`（opacity 0.45 + pointer-events none） |

### 业务规范（整理自 Figma 123:15156）
1. **总开关先行**：「Enable」开关是 Trap 上报总闸；关闭时字段整体禁用（与 Agent 页签同范式），开关自身保持可用。
2. **版本独立配置**：Trap 版本以 SNMPv1 / SNMPv2 / SNMPv3 下拉维护，默认 SNMPv2；与 Agent 页签的分段单选各自独立，互不强制一致。
3. **单目标表单**：Figma 为单接收端形态（Server Address + Port + Name），多 NMS 目标如后续需要应扩展为行内表格（对齐 MIB View 范式），本版不做。

## 四、场景

**何时用**：配置网关向 NMS 主动上报 SNMP Trap 的开关、版本与接收端。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Agent 本机端口/版本 | `B_Eg71SnmpAgent` |
| 告警规则/通知渠道 | EG71 告警模块组件 |
| MIB 文件获取 | `B_Eg71SnmpMib` |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-text-secondary`、`--color-border-base`、`--spacing-20`、`--spacing-16`、`--spacing-8`、`--radius-4`。
（开关 28×16、两列列距 32 = 2×16 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。表单骨架与 `B_Eg71SnmpAgent` 共用 `bc-eg71-snmp-fields` 结构类。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let enabled = true;
const render = () => {
  app.innerHTML = BIZ['bc-eg71-snmp-trap'].render({ enabled, trap: { server: '10.0.0.5', port: '162', name: 'nms1' } });
  BIZ['bc-eg71-snmp-trap'].bind(app);
};
app.addEventListener('eg71-snmp-trap-toggle', e => { enabled = e.detail.enabled; render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-snmp-trap`
- 结构类：`library/business.css`（`bc-eg71-snmp-head` / `bc-eg71-snmp-fields*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-snmp-verify.html`
