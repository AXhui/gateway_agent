---
name: B_Eg71EventChannel
version: 1.0.0
description: EG71 事件通知渠道卡（业务组件 · Events → Notification 渠道版 · SMS/Email/SNMP）
---

# EG71 事件通知渠道卡 · B_Eg71EventChannel

> **逻辑名**：`B_Eg71EventChannel`
> **运行时 id**：`bc-eg71-event-channel`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`205:2483`（Notification-2 渠道版，1180×800；SMS/Email/SNMP 卡）

---

## 一、描述

Events → Notification 页（渠道版 205:2483）的单渠道卡：卡标题（SMS / Email / SNMP …，`ctx.channel`）+ 28×16 渠道开关 + Sender / Event Type 标签多选字段（tag 可删、chevron 展开选择）。

不是矩阵版通知——事件×Record/Email 集中矩阵改用 `B_Eg71EventNotify`；MQTT 渠道因含表格化配置改用 `B_Eg71EventMqtt`。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label` | 字段结构 |
| `S_Switch` | `ms-switch ms-switch--xs`（28×16） | 渠道开关 |
| `S_Tag` | 标签形态（bc- 结构编排） | 已选联系人/事件类型 tag |
| `S_Select` | `ms-select`（语义引用） | 展开选择面板由宿主拉起 |
| `S_Icon` | `ms-ico`（close 14px / chevronDown 16px） | tag 删除 / 展开箭头 |
| `S_Title` | `ms-h4` | 渠道标题 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.channel` | `string` | `'SMS'` | 卡标题（渠道名） |
| `ctx.enabled` | `boolean` | `true` | 渠道开关初值；false 仅禁用本卡字段 |
| `ctx.fields` | `Array<{label, tags: string[]}>` | Sender + Event Type（Figma 样例值） | 字段与已选标签集合 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-event-head[data-event-channel]（ms-h4 渠道名 + ms-switch--xs[data-event-channel-toggle]）
  └ .bc-eg71-event-fieldsrow{--disabled}
      └ ms-form-item × N
          └ .bc-eg71-event-tags[data-event-tag-open]（combobox 语义）
              ├ .bc-eg71-event-tag（12px tag + [data-event-tag-remove="f:i"] close 14px）× N
              └ .bc-eg71-event-tags-arrow（chevronDown 右置）
```

### bind 骨架
渠道开关 change → 冒泡 `eg71-event-channel-toggle {channel, enabled}`；tag 删除 click → `eg71-event-tag-remove {field, index}`（stopPropagation）；选择框 click → `eg71-event-tag-open {field}`（宿主拉起选项面板，选中后改 ctx.tags 重渲染）。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 渠道开；tag 灰底 12px 可删，chevron 右置 |
| 渠道关闭 | 本卡字段 `--disabled`，开关自身可用，不影响其他渠道卡 |
| 空 tags | 选择框仍可点（chevron 展开选择） |

### 业务规范（整理自 Figma 205:2483）
1. **一渠道一卡一开关**：SMS / Email / SNMP / MQTT 每渠道独立白卡；渠道开关只禁用本卡，不做全局总闸——与矩阵版（92:16508 Enable 总闸）是两种授权粒度。
2. **Sender = 发送方多选**：Sender 为标签多选，混选联系人（+86 手机号）与联系组（Operation and Maintenance Group 运维组）——号码与分组同池。
3. **Event Type = 事件过滤**：每渠道独立圈选要通知的事件类型（Ethernet goes online / VPN goes live …），SNMP 渠道可用「All」全选 tag。
4. **tag 即删即生效**：tag 上 close（14px）删除单项，stopPropagation 不触发展开；组件只上报，选项面板（可选清单）由宿主经 `eg71-event-tag-open` 拉起，不自持候选数据。
5. **MQTT 不走本组件**：MQTT 渠道除开关外还有连接/Topic/QoS 表格配置，形态不同，见 `B_Eg71EventMqtt`。

## 四、场景

**何时用**：分渠道事件通知配置——SMS 短信、Email 邮件、SNMP Trap 渠道的发送方与事件类型过滤。
**何时不用**：

| 场景 | 改用 |
|---|---|
| 集中事件×动作矩阵 | `B_Eg71EventNotify` |
| MQTT 渠道（连接/Topic/QoS） | `B_Eg71EventMqtt` |
| 事件浏览/导出 | `B_Eg71EventList` |

## 五、Token

`--color-bg-card`、`--color-fill-base-normal`、`--color-text-primary`、`--color-icon-auxiliary`、`--color-border-base`、`--spacing-2`、`--spacing-4`、`--spacing-8`、`--spacing-16`、`--radius-4`。
（开关 28×16、tag 12px/20px、选择框 32px 高、两列列距 32 = 2×16 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。标签多选为 `bc-eg71-event-tags` 结构编排（L2 无 tag-multiselect 原子，视觉全部走 token）。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
const state = { channel: 'SMS', enabled: true,
  fields: [{ label: 'Sender', tags: ['+86 13860235632', 'Operation and Maintenance Group'] },
           { label: 'Event Type', tags: ['Ethernet goes online', 'VPN goes live'] }] };
const render = () => {
  app.innerHTML = BIZ['bc-eg71-event-channel'].render(state);
  BIZ['bc-eg71-event-channel'].bind(app);
};
app.addEventListener('eg71-event-tag-remove', e => {
  state.fields[e.detail.field].tags.splice(e.detail.index, 1); render();
});
app.addEventListener('eg71-event-channel-toggle', e => { state.enabled = e.detail.enabled; render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-event-channel`
- 结构类：`library/business.css`（`bc-eg71-event-head` / `bc-eg71-event-fieldsrow` / `bc-eg71-event-body--disabled` / `bc-eg71-event-tags*` / `bc-eg71-event-tag*`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-event-verify.html`
