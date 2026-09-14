---
name: B_Eg71EventMqtt
version: 1.0.0
description: EG71 事件 MQTT 通知卡（业务组件 · Events → Notification 渠道版 · MQTT 表格化配置）
---

# EG71 事件 MQTT 通知卡 · B_Eg71EventMqtt

> **逻辑名**：`B_Eg71EventMqtt`
> **运行时 id**：`bc-eg71-event-mqtt`
> **分类**：系统设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`
> **Figma 源**：`205:2483`（Notification-2 渠道版 · MQTT 卡，205:4688 表格）

---

## 一、描述

Events → Notification 页（渠道版 205:2483）的 MQTT 渠道卡：标题 + 渠道开关 + 表格化配置——Event Type / MQTT connection / Topic / Keep messages（复选）/ QoS 五列 + 行尾 more 操作 + 底部居中「添加」。

不是普通渠道卡——SMS/Email/SNMP 的 Sender/Event Type 标签多选形态改用 `B_Eg71EventChannel`；MQTT 因每行绑定连接与发布参数，走行内表格范式。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Table` | 结构表格（bc- 斑马纹事件表 --tall） | 45px 行高五行配置表 |
| `S_Select` | `ms-select ms-select--sm` | MQTT connection / Topic / QoS |
| `S_Checkbox` | `ms-checkbox`（16px） | Keep messages |
| `S_Switch` | `ms-switch ms-switch--xs`（28×16） | 渠道开关 |
| `S_Button` | `ms-btn ms-btn--xs`（24px） | 「添加」 |
| `S_Icon` | `ms-ico`（moreHoriz 16px） | 行尾操作 |
| `S_Card` | `ms-card` / `ms-card-body` | 白卡外壳 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.enabled` | `boolean` | `true` | 渠道开关初值；false 禁用表格与添加 |
| `ctx.connections` | `string[]` | `['']` | MQTT connection 选项——应来自数据服务已建连接，宿主注入 |
| `ctx.topics` | `string[]` | `['All']` | Topic 选项 |
| `ctx.rows` | `Array<{event, connection, topic, keep, qos}>` | 1 行 `System Restart` | 配置行集合；`qos` 收口 QoS 0/1/2 |

### render 骨架
```
.bc-eg71-maint-body > section.ms-card > .ms-card-body
  ├ .bc-eg71-event-head[data-event-channel="MQTT"]（ms-h4「MQTT」+ ms-switch--xs[data-event-mqtt-toggle]）
  └ .bc-eg71-event-body{--disabled}
      ├ table.bc-eg71-event-table--tall（45px）
      │   ├ thead：Event Type / MQTT connection / Topic / Keep messages(129px) / QoS / 40px ops
      │   └ tbody：文本 + select[data-event-mqtt-field=connection|topic|qos][data-index]
      │            + checkbox[data-event-mqtt-keep-i] + moreHoriz[data-event-mqtt-ops-i]
      └ .bc-eg71-snmp-addrow > ms-btn--xs[data-event-mqtt-add]「添加」
```

### bind 骨架
渠道开关 change → 冒泡 `eg71-event-mqtt-toggle {enabled}`；select change → `eg71-event-mqtt-field {index, field, value}`；复选 change → `eg71-event-mqtt-keep {index, checked}`；行 more click → `eg71-event-mqtt-ops {index}`；添加 click → `eg71-event-mqtt-add`。

## 三、状态

| 状态 | 表现 |
|---|---|
| 默认 | 渠道开；一行 `System Restart` + Topic All + QoS 1 + Keep 未勾 |
| 渠道关闭 | 表格与添加整体 `--disabled`，开关自身可用 |
| 添加 | 底部居中 24px 小钮追加空行（宿主改 ctx.rows 后重渲染） |

### 业务规范（整理自 Figma 205:2483 / 205:4688）
1. **MQTT 通知 = 按事件发布**：每行 = 一个事件类型绑定一条 MQTT 发布配置；Event Type 为行主键语义，同一事件不重复建行（宿主提交层校验）。
2. **连接引用不重建**：MQTT connection 下拉选项来自数据服务已建 MQTT 连接（`ctx.connections` 注入），本卡不做连接的新建/编辑——通知与数据转发共用连接资产。
3. **Topic 可全选**：Topic 下拉含 `All`（发布到连接默认主题），也可指定具体 topic；缺省 All。
4. **Keep messages 保留消息**：布尔复选——勾选后按 MQTT QoS 1/2 语义保留离线消息（broker 侧 RETAIN/持久会话由连接配置承担，本卡只管开关）。
5. **QoS 收口三档**：QoS 0 / QoS 1 / QoS 2 下拉收口，默认 QoS 1（至少一次），不做自由数值。
6. **行内编辑范式**：与 SNMP MIB View / VACM 同套交互——底部居中「添加」24px 小钮 + 行尾 more-horiz 操作（编辑/删除菜单由宿主拉起），保持 EG71 配置表格一致性。

## 四、场景

**何时用**：网关事件经 MQTT broker 对外发布——按事件类型选连接、定主题、定 QoS 与保留策略。
**何时不用**：

| 场景 | 改用 |
|---|---|
| SMS/Email/SNMP 渠道 | `B_Eg71EventChannel` |
| 集中事件×动作矩阵 | `B_Eg71EventNotify` |
| MQTT 数据转发通道表单 | `B_Eg71_DataForwardMqtt`（数据服务域） |

## 五、Token

`--color-bg-card`、`--color-fill-base-normal`、`--color-text-primary`、`--color-icon-auxiliary`、`--color-border-base`、`--font-sans`、`--spacing-12`、`--spacing-40`、`--spacing-48`。
（45px 行高、Keep messages 列 129px、开关 28×16 为 Figma 指定。）

## 六、依赖

atoms 序列见第二节；不新增基础原子，仅编排。表格/添加行复用 `bc-eg71-event-table--tall` / `bc-eg71-snmp-addrow` 结构类。

## 七、示例

```js
const BIZ = window.MS_BIZ_INDEX;
let rows = [{ event: 'System Restart', connection: 'emqx-1', topic: 'All', keep: false, qos: 'QoS 1' }];
const render = () => {
  app.innerHTML = BIZ['bc-eg71-event-mqtt'].render({
    rows, connections: ['emqx-1', 'emqx-2'], topics: ['All', 'eg71/event']
  });
  BIZ['bc-eg71-event-mqtt'].bind(app);
};
app.addEventListener('eg71-event-mqtt-add', () => { rows.push({}); render(); });
app.addEventListener('eg71-event-mqtt-keep', e => { rows[e.detail.index].keep = e.detail.checked; });
app.addEventListener('eg71-event-mqtt-ops', e => { rows.splice(e.detail.index, 1); render(); });
render();
```

## 八、版本

见 frontmatter `version:`。

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-eg71-event-mqtt`
- 结构类：`library/business.css`（`bc-eg71-event-head` / `bc-eg71-event-body--disabled` / `bc-eg71-event-table--tall` / `bc-eg71-event-col-keep` / `bc-eg71-event-col-ops` / 复用 `bc-eg71-snmp-addrow` / `bc-eg71-snmp-del`）
- 令牌（只读）：`.claude/tokens/tokens.css`
- 校验页：`output/eg71-event-verify.html`
