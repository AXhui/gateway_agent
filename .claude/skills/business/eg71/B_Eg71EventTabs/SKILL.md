---
name: B_Eg71EventTabs
version: 1.0.0
description: EG71 事件页双页签壳（业务组件 · Events → List / Notification）
---

# EG71 事件页双页签壳 · B_Eg71EventTabs

> **逻辑名**：`B_Eg71EventTabs`
> **运行时 id**：`bc-eg71-event-tabs`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`92:16026`（事件页，1220×3311；页签条见各符号 48px 条）

---

## 一、描述

EG71「Events」页顶部的双页签条：List / Notification。48px 白底 + 底分隔线，激活项主文字色加粗 + 2px 蓝墨条。

不是内容容器——List 页内容改用 `B_Eg71EventList`，Notification 页内容改用 `B_Eg71EventNotify`（矩阵版）或 `B_Eg71EventChannel` + `B_Eg71EventMqtt`（渠道版）。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn`（基础形态） | 页签按钮（结构性重置为 tab 形态） |
| `S_Icon` | `ms-ico` | 预留图标位 |
| `S_Space` | 间距 token | 页签间距 24px |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tab` | `'list' \| 'notification'` | `'list'` | 当前激活页签；为路由唯一源的只读投影 |

### render 骨架
```
.bc-eg71-event-bar[role=tablist]
  └ button.bc-eg71-event-tab{--active}[role=tab][data-event-tab] × 2（List / Notification）
```

### bind 骨架
页签 click → 冒泡 `eg71-event-tab {tab}`；宿主改路由后整体重渲染（不在本组件内切内容）。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | List 激活：主文字色 + 500 字重 + 底部 2px 墨条 |
| 非激活 | 次文字色；hover 变主文字色 |
| Notification 激活 | 同上墨条右移 |

### 业务规范（整理自 Figma 92:16026）
1. **双页签路由**：Events 页只有 List / Notification 两个页签；页签为路由唯一源，内容区由宿主按路由换装，页签自身不藏内容。
2. **页签条形态**：48px 白底 + 1px 底分隔线；激活态 = 主文字色 + 500 字重 + 2px 蓝墨条（`--color-divider-primary`），本页页签间距 24px（与 SNMP 页 32px 不同，按各页 Figma 取值）。

## 四、场景

**何时用**：EG71 事件页（维护/系统设置域）需要 List 与 Notification 切换时作为页首。
**何时不用**：

| 场景 | 改用 |
|---|---|
| SNMP 五页签 | `B_Eg71SnmpTabs` |
| 维护页三页签 | 维护页签壳组件 |
| 左侧一级/二级导航 | `B_Eg71Sidenav` |

## 五、Token

`--color-bg-card`、`--color-border-base`、`--color-text-primary`、`--color-text-secondary`、`--color-divider-primary`、`--spacing-2`、`--spacing-20`、`--spacing-24`、`--spacing-48`、`--radius-s`。
（14px/22px 字号行高为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let tab = 'list';
const render = () => {
  app.innerHTML = BIZ['bc-eg71-event-tabs'].render({ tab }) + contentFor(tab);
  BIZ['bc-eg71-event-tabs'].bind(app);
};
app.addEventListener('eg71-event-tab', e => { tab = e.detail.tab; render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-event-tabs`
- 结构类：`library/business.css`（`bc-eg71-event-bar` / `bc-eg71-event-tab*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-event-verify.html`
