---
name: B_Eg71PageTabs
version: 1.0.0
description: EG71 页级页签壳（业务组件）：48px 白底 + 2px 墨条下划线的第一层内容区导航，ctx.tabs 泛化任意页签组
---

# EG71 页级页签壳 · B_Eg71PageTabs

> **逻辑名**：`B_Eg71PageTabs`
> **现 id**：`bc-eg71-page-tabs`
> **分类**：数据服务
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **bind**：有（页签点击 → `eg71-page-tab` 冒泡）
> **站点依据**：`output/eg71-site-distill/` 16 页 `ant-tabs-top ysd-tabs`（equipment-data / batch-import-result / parsing-library / firewall / interfaces / vpn / platform / events / maintenance / serve / setting / snmp / user / docker / python）

## 1. 描述

**这是什么**：EG71 内容区第一层页签条：顶栏面包屑（`bc-eg71-topnav`）之下、页面内容（工具栏/表格/表单卡）之上的 48px 白底横条；选中页签文字加粗 + 2px 主色下划线（墨条）。`ctx.tabs` 传任意页签组即成该页导航。

**不是什么**：不是卡片内二级页签、不是 scan-device 双页签表（那是 `bc-eg71-scan-device-table`）；不承载页签内容渲染——内容由宿主按 `eg71-page-tab` 事件切换；面包屑不在本组件（在 `bc-eg71-topnav`）。

**归属产品线**：`eg71`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Tab` | 页签按钮（`role=tab` + `aria-selected`） | 48px 页签条本体 |

### ctx 上下文契约（只读，变更走回调）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.tabs` | `{key, label}[]` | Device / IO Device / Device Access Network / LoRaWAN 四签 | 页签组（站点 equipment-data 形态） |
| `ctx.tab` | string | 首签 key | 当前选中页签 |
| `ctx.ariaLabel` | string | `'Page navigation'` | tablist 无障碍名 |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-page-tab` | `{ tab }` | 点击页签 |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 默认 | — | 14px 次级色文字 |
| hover | 鼠标悬停 | 文字转主文字色 |
| active | `ctx.tab === key` | 文字主色 + 500 字重 + 2px `--color-divider-primary` 下划线；`aria-selected="true"`、`tabindex=0` |
| 键盘可达 | Tab 聚焦 active 签 | button 原生聚焦态 |

## 4. 场景（Scenarios）

**何时用**：页面内容区第一层平行视图切换（站点 16 页共用：设备四签、VPN 八签、System User 三签、SNMP 五签…）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 表单内 2-3 项互斥选择 | `bc-eg71-form-item-radio-group`（outline 分段单选，站点 radio-group-item 同构） |
| 扫描确认页发现/已忽略双表 | `bc-eg71-scan-device-table`（页签+表格一体） |
| 卡片内 App 页签 | `bc-eg71-app-tabs`（存量专用壳，可按 release.md 宽限期收编到本组件） |

## 5. Token（设计令牌）

- 底/边框：`--color-bg-card` / `--color-border-base`
- 文字：`--color-text-secondary`（默认）/ `--color-text-primary`（hover·active）
- 墨条：`--color-divider-primary`（2px = `--spacing-2`）
- 间距：`--spacing-48`（条高）/ `--spacing-20`（左右内距）/ `--spacing-24`（页签间距）

## 6. 依赖（Dependencies）

`atoms: ['tab']`——仅编排，不新增基础原子。结构类 `.bc-eg71-page-tabs` / `.bc-eg71-page-tab(--active)`（`library/business.css`），纯布局与令牌引用。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
el.innerHTML = B['bc-eg71-page-tabs'].render({
  tabs: [{ key: 'eth', label: 'Ethernet' }, { key: 'cellular', label: 'Cellular' },
         { key: 'wlan', label: 'WLAN' }, { key: 'lo', label: 'Loopback' }],
  tab: 'eth'
});
B['bc-eg71-page-tabs'].bind(el);
el.addEventListener('eg71-page-tab', e => renderPanel(e.detail.tab));
```

## 8. 版本（Version）

见 frontmatter `version:`。
