---
name: B_Eg71SnmpTabs
version: 1.0.0
description: SNMP 三级页签壳（业务组件 · 系统设置 → SNMP 页签路由）
---

# SNMP 三级页签壳 · B_Eg71SnmpTabs

> **逻辑名**：`B_Eg71SnmpTabs`
> **运行时 id**：`bc-eg71-snmp-tabs`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`123:4165`（SNMP 页总帧，1425×2171：五区块纵向并列展示全部状态）

---

## 一、描述

系统设置 → SNMP 的三级页签条：Agent Setting / MIB View / VACM / Trap / MIB（48px 白底 + 底分隔线，激活项主文字色加粗 + 2px 蓝墨条，页签间距 32px）。

不是内容组件——页签条是路由的只读投影，五个页签内容分别由 `B_Eg71SnmpAgent` / `B_Eg71SnmpMibView` / `B_Eg71SnmpVacm` / `B_Eg71SnmpTrap` / `B_Eg71SnmpMib` 承担。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn`（取按钮基底重置） | 页签按钮（结构类接管视觉） |
| `S_Icon` | `ms-ico` | 无直接渲染（沿用图标体系） |
| `S_Space` | 结构间距 | 页签间距 32 = 2×16 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tab` | `'agent'｜'mibview'｜'vacm'｜'trap'｜'mib'` | `'agent'` | 当前激活页签 |

### render 骨架
```
.bc-eg71-snmp-bar[role=tablist]
  └ 5 × button.bc-eg71-snmp-tab{--active}[role=tab][data-snmp-tab]
```

### bind 骨架
页签 click → 冒泡 `eg71-snmp-tab {tab}`；宿主（MS_EG71_SHELL / 页面）改路由后重渲染，不在组件内自改。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 5 页签横排，激活项主文字色 + 500 字重 + 底部 2px 墨条 |
| hover | 未激活页签文字变主色 |
| 键盘 | 非激活项 `tabindex="-1"`，激活项可聚焦 |

### 业务规范（页签路由）
1. **五页签路由唯一源**：页签状态由宿主 `ctx.tab` 注入，组件只读投影；切换经 `eg71-snmp-tab` 事件回调，宿主改路由后整页重渲染。
2. **视觉规格与一级页签一致**：48px 高白底 + 底分隔线 + 2px 墨条（与维护模块 `B_Eg71MaintenanceTabs` 同规格），体现三级菜单层级一致性。
3. **Figma 并列 ≠ 运行时并列**：设计稿将五个页签内容纵向全量展示为文档手段，运行时同屏只出现一个激活页签的内容。

## 四、场景

**何时用**：SNMP 页顶部导航（系统设置 → SNMP）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 维护模块页签 | `B_Eg71MaintenanceTabs` |
| 诊断工具二级页签 | `bc-eg71-maint-bar` 内 tool 页签（随 maintenance-tabs 一并渲染） |
| SNMP 内容表单 | 本页签壳的五个内容组件 |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-text-secondary`、`--color-border-base`、`--color-divider-primary`、`--spacing-48`、`--spacing-20`、`--spacing-16`、`--spacing-2`、`--radius-s`。
（14px / 22px 行高 / 页签间距 32 = 2×16 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。与五个 SNMP 内容组件同线成套使用。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let tab = 'agent';
const render = () => {
  app.innerHTML = BIZ['bc-eg71-snmp-tabs'].render({ tab }) + CONTENT[tab]();
  BIZ['bc-eg71-snmp-tabs'].bind(app);
};
app.addEventListener('eg71-snmp-tab', e => { tab = e.detail.tab; render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-snmp-tabs`
- 结构类：`library/business.css`（`bc-eg71-snmp-bar` / `bc-eg71-snmp-tab*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-snmp-verify.html`
