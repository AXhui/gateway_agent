---
name: B_Eg71EventNotify
version: 1.0.0
description: EG71 事件通知矩阵（业务组件 · Events → Notification 矩阵版）
---

# EG71 事件通知矩阵 · B_Eg71EventNotify

> **逻辑名**：`B_Eg71EventNotify`
> **运行时 id**：`bc-eg71-event-notify`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`92:16508`（Notification 矩阵版，1180×800）

---

## 一、描述

Events → Notification 页（矩阵版 92:16508）：「Enable」通知总闸 + Phone / Email for Notification 两个通知端下拉 + 12 类事件 × Record / Email 双动作开关矩阵（斑马纹表格，Email 列头带 help 图标）。

不是渠道卡版通知——SMS/Email/SNMP/MQTT 分渠道配置改用 `B_Eg71EventChannel` + `B_Eg71EventMqtt`（205:2483 渠道版）；本组件是事件×动作的集中矩阵形态。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 通知端两列字段结构 |
| `S_Select` | `ms-select` | Phone / Email for Notification 下拉 |
| `S_Switch` | `ms-switch ms-switch--xs`（28×16） | Enable 总闸 + 矩阵内行开关 |
| `S_Table` | 结构表格（bc- 斑马纹事件表） | 12 行事件矩阵 |
| `S_Icon` | `ms-ico`（question 16px） | Email 列头 help 图标 |
| `S_Title` | `ms-h4` | 「Enable」标题 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.enabled` | `boolean` | `true` | 通知总闸初值；false 时通知端与矩阵整体禁用 |
| `ctx.phoneOptions` / `ctx.mailOptions` | `string[]` | `['']` | 通知端下拉选项（宿主注入联系人/邮箱） |
| `ctx.phone` / `ctx.mail` | `string` | 选项首项 | 通知端初值 |
| `ctx.events` | `Array<string \| {name, record, email}>` | Figma 12 类事件 | 矩阵行；字符串形态默认双开 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-event-head（ms-h4「Enable」+ ms-switch--xs[data-event-notify-toggle]）
  └ .bc-eg71-event-body{--disabled}
      ├ .bc-eg71-event-fieldsrow（两列：Phone / Email for Notification 下拉）
      └ table.bc-eg71-event-table--stack（41px 斑马纹）
          ├ Events（344px）/ Record / Email+help 三列
          └ 每行 ms-switch--xs × 2（data-event-record-i / data-event-email-i）
```

### bind 骨架
总闸 change → 冒泡 `eg71-event-notify-toggle {enabled}`；通知端 change → `eg71-event-phone {value}` / `eg71-event-mail {value}`；行开关 change → `eg71-event-record {index, enabled}` / `eg71-event-email {index, enabled}`。均只上报，状态由宿主持有。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 总闸开；12 行事件 Record / Email 双开 |
| 总闸关闭 | 通知端 + 矩阵整体 `--disabled`（opacity 0.45 + pointer-events none），开关自身保持可用 |
| 斑马纹 | 奇白偶灰；表头灰底 |

### 业务规范（整理自 Figma 92:16508）
1. **通知总闸先行**：「Enable」是通知功能总闸——关闭时通知端与整张矩阵禁用（与 SNMP Agent / Trap 同范式），开关自身保持可用。
2. **事件枚举固定 12 类**：Cellular Up/Down、WAN Up/Down、VPN Up/Down、Power On、Connect to UPS External Power Supplies、Connect to UPS Internal Battery、UPS Low Power (20%)、UPS Abnormal Charging、Disconnect the UPS——覆盖蜂窝/WAN/VPN 链路与 UPS 电源两类资产域。
3. **事件 × 动作双开关矩阵**：每事件 Record（记录，落本地日志）与 Email（发邮件）独立开关，互不联动；默认全开。
4. **通知端先行选择**：Phone / Email for Notification 下拉先选定接收端，矩阵只管「谁发」不管「发给谁」——接收端与动作正交。
5. **Email 列头带 help 图标**：通知动作语义（发送时机/内容模板）需解释，点击由宿主拉起说明（`ms-alert`/弹层），组件不内嵌。

## 四、场景

**何时用**：集中式事件通知策略配置——一张矩阵管全部事件的记录与邮件动作。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 分渠道（SMS/SNMP/MQTT）配置 | `B_Eg71EventChannel` / `B_Eg71EventMqtt`（渠道版 205:2483） |
| 事件浏览/已读/导出 | `B_Eg71EventList` |
| SNMP Trap 上报 | `B_Eg71SnmpTrap` |

## 五、Token

`--color-bg-card`、`--color-fill-base-normal`、`--color-text-primary`、`--color-text-secondary`、`--color-icon-auxiliary`、`--color-border-base`、`--font-sans`、`--spacing-4`、`--spacing-8`、`--spacing-16`、`--spacing-48`。
（Events 列 344px、41px 行高、开关 28×16、两列列距 32 = 2×16 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。表格视觉走 `bc-eg71-event-table` 结构类。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let enabled = true, events = ['Cellular Up', { name: 'Power On', record: false, email: true }];
const render = () => {
  app.innerHTML = BIZ['bc-eg71-event-notify'].render({
    enabled, events,
    phoneOptions: ['+86 13860235632'], mailOptions: ['ops@example.com']
  });
  BIZ['bc-eg71-event-notify'].bind(app);
};
app.addEventListener('eg71-event-notify-toggle', e => { enabled = e.detail.enabled; render(); });
app.addEventListener('eg71-event-record', e => {
  events[e.detail.index] = Object.assign({}, events[e.detail.index], { record: e.detail.enabled });
});
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-event-notify`
- 结构类：`library/business.css`（`bc-eg71-event-head` / `bc-eg71-event-body--disabled` / `bc-eg71-event-fieldsrow` / `bc-eg71-event-table*` / `bc-eg71-event-col-events` / `bc-eg71-event-thhelp`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-event-verify.html`
