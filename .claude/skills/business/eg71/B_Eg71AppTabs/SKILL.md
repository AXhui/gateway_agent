---
name: B_Eg71AppTabs
version: 1.0.0
description: EG71 应用页签壳（业务组件 · APP → Python 三页签）
---

# EG71 应用页签壳 · B_Eg71AppTabs

> **逻辑名**：`B_Eg71AppTabs`
> **运行时 id**：`bc-eg71-app-tabs`
> **分类**：应用管理
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`41:19864`（APP 页 · Python 页签条 95:1420）

---

## 一、描述

APP 菜单 Python 页的三页签条：Python / AppManager Configuration / Python APP——48px 白底、底分隔线、激活项主文字色 + 2px 蓝墨条、页签间距 24px。与事件页签壳（`B_Eg71EventTabs`）同范式，仅页签集合不同。

不是内容组件——三页签的内容分别由 `B_Eg71AppSdk` / `B_Eg71AppManager` / `B_Eg71AppCard` 承担；Node RED 无三级菜单，直接用 `B_Eg71AppNodered`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Tab` | 页签条结构（bc- 编排） | 48px 页签条 + 2px 墨条 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tab` | `'python' \| 'manager' \| 'app'` | `'python'` | 激活页签 |
| `ctx.tabs` | `Array<{key, label}>` | Python / AppManager Configuration / Python APP | 页签集合，宿主可覆写 |

### render 骨架
```
.bc-eg71-app-bar（48px 白底 + border-bottom）
  └ button.bc-eg71-app-tab{--active}[data-app-tab=key] × N
```

### bind 骨架
页签 click → 冒泡 `eg71-app-tab {tab}`；宿主改路由/状态后重渲染，页签是路由的只读投影。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | Python 激活（主文字色 + 500 字重 + 2px 墨条） |
| 未激活 | 次要文字色，hover 转主色 |
| 禁用 | 无（页签恒可切） |

### 业务规范（整理自 Figma 95:1420）
1. **三页签固定次序**：Python → AppManager Configuration → Python APP；先装 SDK（Python）、再管 AppManager、最后管应用包，页签次序即操作动线。
2. **页签为路由只读投影**：组件不自持激活态，切换以事件上报，宿主改 `ctx.tab` 重渲染（与事件/维护/SNMP 页签壳同一契约）。
3. **墨条规范**：激活项底部 2px `--color-divider-primary`、圆角 `--radius-s`——EG71 全线页签统一。

## 四、场景

**何时用**：APP → Python 页的页签导航。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Node RED 页（无三级菜单） | `B_Eg71AppNodered` |
| 事件页 List / Notification | `B_Eg71EventTabs` |
| 维护 / SNMP 页签 | `B_Eg71_MaintTabs` / `B_Eg71SnmpTabs` |

## 五、Token

`--color-bg-card`、`--color-text-primary`、`--color-text-secondary`、`--color-border-base`、`--color-divider-primary`、`--spacing-2`、`--spacing-20`、`--spacing-24`、`--spacing-48`、`--radius-s`。

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let tab = 'python';
const render = () => {
  app.innerHTML = BIZ['bc-eg71-app-tabs'].render({ tab });
  BIZ['bc-eg71-app-tabs'].bind(app);
};
app.addEventListener('eg71-app-tab', e => { tab = e.detail.tab; render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-app-tabs`
- 结构类：`library/business.css`（`bc-eg71-app-bar` / `bc-eg71-app-tab{,--active,--active::after}`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-app-verify.html`
