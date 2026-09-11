---
name: B_Eg71ProtocolDetail
version: 0.1.0
description: EG71 Dashboard 协议接口详情抽屉（schema 驱动，10 个协议接口复用同一框架）
---

# 协议接口详情抽屉 · B_Eg71ProtocolDetail

> **逻辑名**：`B_Eg71ProtocolDetail`
> **运行时 id**：`bc-eg71-protocol-detail`
> **分类**：概览
> **entityHint**：`gateway`
> **产品线**：`eg71`
> **依赖基础组件**：`ms-drawer` / `ms-desc` / `ms-tag` / `ms-table` / `ms-btn` / `ms-ico`

---

## 1. 描述

Milesight 网关 Dashboard 总览页的协议接口详情抽屉：统一 schema 驱动，供 10 个协议接口（WLAN / Cellular / IO / RS485 / KNX-TP / VPN / Ethernet / Routing / Host / LoRaWAN）复用同一套框架渲染——头部图标卡+标签 → 一至多组 Descriptions 字段分组（可选子卡头 `headcard`） → 可选表格分组 → 单按钮确认底栏。

不是什么：不是 10 个独立业务组件。10 个协议详情共享完全相同的框架骨架，差异只在数据（字段/表格列/分组数），按铁律二折叠为 1 个组件 + 1 份数据字典（`registry-eg71-protocol-details.js`），不是总览页固定六项摘要（那是 `bc-eg71-dashboard-sysinfo`）。

## 2. 组装契约（atoms 依赖 + ctx + render/bind 骨架）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Drawer` | `ms-drawer` / `ms-mask--drawer` | 详情容器，右侧滑出，内联 `width:600px`（`size:number` 用法，调用基础组件自身数值分支，非业务层新造样式常量） |
| `S_Descriptions` | `ms-desc` / `ms-desc-item` / `ms-desc-label` / `ms-desc-value` | 每个 section 的字段分组，作用域内覆写标签列宽/字号/颜色对齐 Figma（见第 5 节） |
| `S_Tag` | `ms-tag` / `ms-tag--<tone>` | 头部/子卡头/分组标签（Online/Enable/Pin Error 等状态标签） |
| `S_Table` | `ms-table` / `ms-table-wrap` | 可选表格分组（VPN/Routing/Host/WLAN 的关联站点/路由表/ARP 缓存/DHCP 租约） |
| `S_Button` | `ms-btn` / `ms-btn--filled` | 底栏单按钮 Confirm（关闭抽屉） |
| `S_Icon` | `ms-ico` | 头部/子卡头图标、关闭按钮图标 |

### ctx 上下文契约

- `ctx.detail`：只读对象，形状：
  ```js
  {
  icon, title, tags: [{ text, tone }],      // 头部图标卡（可选，无 title 时不渲染）
    sections: [
      {
   title?, tag?,          // 分组标题行（与 headcard 二选一）
     headcard?: { icon, title, tags: [{text,tone}] }, // 子卡头（多子设备场景，如 RS485-1/RS485-2）
        fields?: [{ label, value, tone? }],          // Descriptions 字段行，value 支持 \n 换行
        table?: { columns:[{key,title}], rows:[...], empty? } // 表格分组，rows 为空时渲染 empty 占位
      }
    ]
  }
  ```
  - 组件不持有路由/打开状态，取数来自 `window.MS_EG71_PROTOCOL_DETAILS[route]`（数据字典，非组件内置），由宿主页在 `eg71-protocol-navigate` 事件回调里传入对应 `route` 的字典项作为 `ctx.detail`。
  - `sections[].headcard` 与 `sections[].title` 二选一：多子设备场景（IO 的 UI1/UI2/AI1、RS485 的 RS485-1/2、Ethernet 的 ETH1/2）用 `headcard`；普通分组（Basic Information/Modem/Network）用 `title`。

### render(ctx) 骨架

1. `.bc-eg71-protocol-detail[hidden]`（默认隐藏根节点）→ `.ms-mask.ms-mask--drawer` → `.ms-drawer`（内联 `width:600px`）。
2. `ms-drawer-head`：固定标题「Detail」+ 关闭图标按钮（`data-drawer-close`）。
3. `ms-drawer-body`（`ms-stack`）：若 `d.title` 存在先渲染头部图标卡（icon+title+tags），再逐个渲染 `sections[]`——每个 section 内 `headcard` 或 `title/tag` 头 → `fields` 用 `ms-desc` → `table` 用 `ms-table-wrap`。
4. `ms-drawer-foot`：单个 `ms-btn--filled` Confirm（`data-drawer-close`，语义等价关闭，无额外提交副作用）。

### bind(root) 骨架

- 幂等、可空跑：收敛到 `root.querySelector('.bc-eg71-protocol-detail')`（或 `root` 本身即该节点），找不到直接返回。
- 挂 `open()`/`close()` 到节点自身（`wrap.open` / `wrap.close`），供宿主页在 `eg71-protocol-navigate` 事件回调里调用 `open()`。
- `[data-drawer-close]` 点击关闭；遮罩点击（`e.target === mask`）关闭；抽屉内部点击 `stopPropagation()` 防止穿透到遮罩。
- 与 `bc-eg71-modal` 现有开关模式一致（`hidden` + `.is-open`），不新增交互范式。

## 3. 状态

| 状态 | 触发 | 视觉 |
|---|---|---|
| 关闭（默认） | 初始 / Confirm / 遮罩点击 / 关闭图标 | `hidden` 属性生效，不占版面 |
| 打开 | 宿主调用 `wrap.open()`（响应 `eg71-protocol-navigate`） | 移除 `hidden`，`.is-open`，右侧滑出遮罩层 |
| 表格空数据 | `sections[].table.rows` 为空数组 | 渲染 `empty` 占位行（默认「暂无数据」），跨列居中 |
| 字段缺省 | `fields[].value` 为 `null`/`undefined` | 渲染 `-` 占位 |

## 4. 场景

**何时用**：EG71 Dashboard 总览页点击任一协议卡/子项/Data forwarding 入口后弹出的详情态，字段-表格混合展示，10 个协议接口统一复用。

**何时不用**：

| 场景 | 改用 |
|---|---|
| 总览页固定六项系统摘要 | `bc-eg71-dashboard-sysinfo` |
| 协议卡自身的总览态展示（非详情） | `bc-eg71-protocol-card` |
| 删除/禁用/信息确认类二次确认弹窗 | `bc-eg71-modal` |
| 设置表单页的可编辑字段 | `bc-eg71-content` 内表单条目组件 |

## 5. Token

`--spacing-4` / `--spacing-8` / `--spacing-12` / `--spacing-16` / `--spacing-24` / `--radius-4` / `--color-primary-normal` / `--color-text-primary` / `--color-text-secondary` / `--color-text-auxiliary` / `--color-text-constant-normal`

**Descriptions 覆写说明**：Figma 精确值（117px 标签列、24px 行内间距、14px 字号、`--color-text-secondary` 标签色）与 `.ms-desc` 默认（12px、`--color-text-auxiliary`、auto-fit 网格）不符。按铁律一处理方式：能命中令牌的字号/间距/颜色全部走 `var(--token)`（如 `gap: var(--spacing-24)`），**117px 标签列宽无对应令牌命中，写死 px**（与 `bc-eg71-sidenav` 的 9px/10px 先例一致处理，不豁免其它裸值）；14px 字号因 `--font-size-14` 令牌未在当前 token 集覆盖同名变量，暂写死数值，随 token 集扩充后收敛。覆写全部收敛在 `.bc-eg71-protocol-detail .ms-desc*` 作用域内，不污染其它组件对 `.ms-desc` 的默认引用。

## 6. 依赖

`atoms`：`drawer` / `descriptions` / `tag` / `table` / `button` / `icon`（见第 2 节表），不新增基础原子，仅编排 + 一处必要的作用域内 Descriptions 覆写（见第 5 节）。数据来源 `assets/js/registry-eg71-protocol-details.js`（10 条路由字典，非注册组件）。

## 7. 示例

```js
const B = window.MS_BIZ_INDEX;
// 挂载：10 个路由各建一个独立抽屉节点
const detail = window.MS_EG71_PROTOCOL_DETAILS['/network/wlan'];
const host = document.createElement('div');
host.innerHTML = B['bc-eg71-protocol-detail'].render({ detail });
const node = host.firstElementChild;
document.body.appendChild(node);
B['bc-eg71-protocol-detail'].bind(node);

// 触发：监听协议卡/入口面板派发的导航事件
document.getElementById('app').addEventListener('eg71-protocol-navigate', (e) => {
  if (e.detail.route === '/network/wlan') node.open();
});
```

参见 `output/eg71-dashboard-verify.html`（10 条路由全量挂载 + 事件联动）。

## 8. 版本

见 frontmatter `version:`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-protocol-detail`
- 结构类：`library/business.css`（`.bc-eg71-protocol-detail*`，含 Descriptions 覆写）
- 数据字典（只读）：`assets/js/registry-eg71-protocol-details.js`（10 条路由，含 `/network/rs485-2`、`/network/ethernet-2` 别名指向合并抽屉）
- 实体（只读）：`assets/js/registry-entities.js`（key `gateway`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 示例页：`output/eg71-dashboard-verify.html`
