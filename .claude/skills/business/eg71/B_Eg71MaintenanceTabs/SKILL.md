---
name: B_Eg71MaintenanceTabs
version: 1.0.0
description: 维护页签壳（业务组件 · System Setting → Maintenance 一级/二级页签）
---

# 维护页签壳 · B_Eg71MaintenanceTabs

> **逻辑名**：`B_Eg71MaintenanceTabs`
> **运行时 id**：`bc-eg71-maintenance-tabs`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`125:11980`「维护」符号组（Ping 页骨架）

---

## 一、描述

EG71 网关「System Setting → Maintenance」的页签壳：一级页签条（Tools / Equipment self-test / Mission Planning / Backup / Upgrade / Restart）+ Tools 页下的卡片式二级页签（Ping / Traceroute / Network packet capture / Qxdmlog）。

不是内容组件——只负责页签导航形态；各页内容由 `B_Eg71ToolDiagnose` / `B_Eg71MissionPlan` / `B_Eg71Upgrade` / `B_Eg71Restart` / `B_Eg71Backup` 等同级业务组件填充。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn`（页面层无直接引用，页签为 button 元素走 `bc-eg71-maint-tab` 结构类） | 页签项 |
| `S_Icon` | `ms-ico` | Tools 页签右侧 chevron-down |
| `S_Space` | `ms-space` | 预留间距编排 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tab` | `'tools'｜'selftest'｜'plan'｜'backup'｜'upgrade'｜'restart'` | `'tools'` | 一级页签激活项（路由唯一源的投影） |
| `ctx.tool` | `'ping'｜'traceroute'｜'capture'｜'qxdmlog'` | `'ping'` | 二级页签激活项（仅 `tab==='tools'` 时渲染） |

### render 骨架
```
.bc-eg71-maintenance-tabs
  ├ .bc-eg71-maint-bar[role=tablist]        → 6 个 .bc-eg71-maint-tab（激活 + --active + aria-selected）
  └ (tab==='tools') .bc-eg71-maint-cardbar   → 4 个 .bc-eg71-maint-cardtab（激活灰底蓝字）
```

### bind 骨架
`[data-maint-tab]` 点击 → `eg71-maint-tab {tab}`；`[data-maint-tool]` 点击 → `eg71-maint-tool {tool}`（均冒泡，宿主改路由后重渲染）。

## 三、状态

| 状态 | 切换类 / 属性 | 说明 |
|---|---|---|
| 一级激活 | `.bc-eg71-maint-tab--active` + `aria-selected` | 主文字色 + 500 字重 + 2px 蓝墨条（`::after`） |
| 一级悬停 | `:hover` | 文字转 `--color-text-primary` |
| 二级激活 | `.bc-eg71-maint-cardtab--active` | 灰底（`--color-fill-base-normal`）+ 蓝字 + 底边透明融入内容区 |

## 四、场景

**何时用**：维护域任何子页（路由 `/system-setting/maintenance/*`）的顶部页签。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Dashboard / 通用页顶部导航 | `B_Eg71Topnav` |
| 侧边一级/二级导航 | `B_Eg71Sidenav` |
| 表单分区内的选项卡 | `S_Radio`（`ms-radio-btn-group`） |

## 五、Token

`--color-bg-card`、`--color-border-base`、`--color-text-secondary`、`--color-text-primary`、`--color-text-primary-normal`、`--color-fill-base-normal`、`--color-divider-primary`、`--spacing-48`、`--spacing-32`、`--spacing-24`、`--spacing-20`、`--spacing-16`、`--spacing-4`、`--spacing-2`、`--radius-s`、`--radius-2`。
（14px/22px 字号为 Figma 指定，L1 无字号令牌，随项目惯例写死；二级页签 9px 垂直内边距同为 Figma 指定。）

## 六、依赖

- atoms 序列见第二节；不新增基础原子，仅编排。
- 同线（ui-eg71）被消费：维护域各内容组件均假设本壳已渲染在其上方。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
app.innerHTML = BIZ['bc-eg71-maintenance-tabs'].render({ tab: 'tools', tool: 'ping' });
BIZ['bc-eg71-maintenance-tabs'].bind(app);
app.addEventListener('eg71-maint-tab', e => console.log('switch tab:', e.detail.tab));
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-maintenance-tabs`
- 结构类：`library/business.css`（`bc-eg71-maint-*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
