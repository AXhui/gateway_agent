---
name: B_Eg71SnmpAgent
version: 1.0.0
description: SNMP Agent 设置（业务组件 · 系统设置 → SNMP → Agent Setting）
---

# SNMP Agent 设置 · B_Eg71SnmpAgent

> **逻辑名**：`B_Eg71SnmpAgent`
> **运行时 id**：`bc-eg71-snmp-agent`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`123:7870`（Agent Setting，1220×374）

---

## 一、描述

SNMP → Agent Setting 页：标题行「SNMP Setting」+ 28×16 小开关（功能总闸）+ 两列表单（port / System Name / Version 分段单选 / Location Information / Contact Information）。

不是 Trap 目标配置——告警接收端改用 `B_Eg71SnmpTrap`；不是视图/访问控制——改用 `B_Eg71SnmpMibView` / `B_Eg71SnmpVacm`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 两列字段结构 |
| `S_Input` | `ms-input` | port / System Name / Location / Contact |
| `S_Radio` | `ms-radio-btn-group` / `ms-radio-btn` | Version 分段单选（SNMP v1·v2·v3） |
| `S_Switch` | `ms-switch ms-switch--xs`（28×16） | SNMP Setting 总闸 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |
| `S_Title` | `ms-h4` | 「SNMP Setting」标题 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.enabled` | `boolean` | `true` | 总开关初值；false 时表单整体禁用 |
| `ctx.version` | `'v1'｜'v2'｜'v3'` | `'v1'` | 版本单选初值 |
| `ctx.agent` | `object` | `{}` | 字段值包：`port`（默认 `'161'`）/ `systemName`（默认 `'24E124FFFEF6A10E'`）/ `location` / `contact` |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-snmp-head（ms-h4「SNMP Setting」+ ms-switch--xs[data-snmp-agent-toggle]）
  └ .bc-eg71-snmp-fields{--disabled}（两列栅格）
      ├ ms-form-item（port + ms-input[data-snmp-agent-port]）
      ├ ms-form-item（System Name + ms-input[data-snmp-agent-name]）
      ├ ms-form-item（Version + ms-radio-btn-group[data-snmp-agent-version]）
      ├ ms-form-item（Location Information + ms-input）
      └ ms-form-item（Contact Information + ms-input）
```

### bind 骨架
开关 change → 冒泡 `eg71-snmp-agent-toggle {enabled}`；版本分段 click → 组内互斥切换（类 + aria 同步）+ 冒泡 `eg71-snmp-agent-version {version}`。表单值提交由宿主读取 DOM 或自行维护，组件不内嵌提交按钮（EG71 后台统一由页面级 Apply 承担）。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 开关开；五字段可编辑；Version 默认 v1 |
| 总闸关闭 | 字段区 `--disabled`（opacity 0.45 + pointer-events none），开关仍可再开 |
| 版本切换 | 分段按钮互斥高亮（主色描边） |

### 业务规范（整理自 Figma 123:7870）
1. **总开关先行**：「SNMP Setting」开关是本页签功能总闸；关闭时表单整体禁用（视觉 0.45 半透明 + 交互屏蔽），开关本身保持可用以便重新开启。
2. **版本互斥分段**：Agent 版本以 SNMP v1 / v2 / v3 分段单选维护，默认 v1；与 Trap 页签的版本各自独立配置，互不强制一致。
3. **端口与标识默认值**：port 默认 `161`（SNMP 标准端口）；System Name 默认设备 EUI 标识（Figma 示例 `24E124FFFEF6A10E`），随设备出厂写入。
4. **字段两列栅格**：列距 32 / 行距 16，980px 以下收为单列（全局响应式断点）。

## 四、场景

**何时用**：配置网关本机 SNMP 代理（端口 / 版本 / 系统标识 / 位置 / 联系人）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 告警上报目标 | `B_Eg71SnmpTrap` |
| MIB 视图裁剪 | `B_Eg71SnmpMibView` |
| Community 访问控制 | `B_Eg71SnmpVacm` |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-text-secondary`、`--color-primary-normal`、`--color-border-base`、`--spacing-20`、`--spacing-16`、`--spacing-8`、`--radius-4`。
（开关 28×16、分段单选 px-16 py-5、两列列距 32 = 2×16 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。外层壳 `B_Eg71SnmpTabs` + 页面级 Apply 由宿主承担。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let enabled = true;
const render = () => {
  app.innerHTML = BIZ['bc-eg71-snmp-agent'].render({ enabled, version: 'v1' });
  BIZ['bc-eg71-snmp-agent'].bind(app);
};
app.addEventListener('eg71-snmp-agent-toggle', e => { enabled = e.detail.enabled; render(); });
app.addEventListener('eg71-snmp-agent-version', e => console.log('version →', e.detail.version));
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-snmp-agent`
- 结构类：`library/business.css`（`bc-eg71-snmp-head` / `bc-eg71-snmp-fields*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-snmp-verify.html`
