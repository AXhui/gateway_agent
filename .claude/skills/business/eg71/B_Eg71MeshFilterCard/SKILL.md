---
name: B_Eg71MeshFilterCard
version: 1.0.0
description: Mesh 包过滤器卡 · IP Agent（业务组件）
---

# Mesh 包过滤器卡（IP Agent） · B_Eg71MeshFilterCard

> **逻辑名**：`B_Eg71MeshFilterCard`
> **运行时 id**：`bc-eg71-mesh-filter`
> **分类**：LoRa 设置
> **entityHint**：`gateway`
> **包归属**：`ui-eg71`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述

LoRa General 页（IP Connection Agent 角色）的 Packet Filter 卡：**Proprietary Message Filter 标题级总闸**（switch）+ 三组过滤表（NetID / JoinEUI / DevEUI）：每组为 `Type | 值列 | 操作` 表格——Type 下拉（Blacklist/Whitelist）、值列按组取「单值输入」或「From…To 区间」、行级删除钮 + 组底 Add 添加行。总闸 off → 三组整体灰显保持（business-specific §6.2：opacity .45 + pointer-events none，值不清空）。

**不是**：Mesh Master 的 Packet Filter（那由 `B_Eg71MeshModuleCard` 的 switch 总闸 + 行字段承载，无过滤表）；防火墙规则编辑器。

## 二、Props（组装契约）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Card` | `ms-card` | 卡容器 |
| `S_Form` | `ms-form-item` | 总闸行骨架 |
| `S_Switch` | `ms-switch` | Proprietary Message Filter 总闸 |
| `S_Table` | `ms-table` | 三组过滤表 |
| `S_Select` | `ms-select` | Type（Blacklist/Whitelist） |
| `S_Input` | `ms-input` | 值 / From / To 输入 |
| `S_Button` | `ms-btn--sm ms-btn--danger` / `ms-btn` | 行删除 / Add |
| `S_Icon` | `MS_ICONS` | 卡头 filter 20、trash/plus 16 |

### ctx 上下文契约（只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `on` | boolean | `true` | 总闸态 |
| `groups` | array | `[]` | `{key, label, col, range, rows:[{type, value? / from,to?}]}`；`range:true` 渲染 From…To 区间列 |

### 事件（CustomEvent，bubbles）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-mesh-filter-toggle` | `{on}` | 总闸切换（bind 内部就地切 `--disabled`） |
| `eg71-mesh-filter-field` | `{field:'type'\|'value'\|'from'\|'to', id, value}` | 表格控件变更（`id` = `组key-行号`） |
| `eg71-mesh-filter-del` | `{id}` | 行删除钮 |
| `eg71-mesh-filter-add` | `{group}` | 组底 Add（宿主向该组 rows 追加空行后重渲染） |

## 三、状态

| 状态 | 表现 |
|---|---|
| 总闸 off | `bc-eg71-mesh-filter-groups--disabled`（opacity .45 + pointer-events none），行值保持不清空 |

## 四、场景

**何时用**：IP Agent 的 General 页专有消息过滤（Figma 71.0.0.5 · 43:11788）。
**何时不用**：

| 场景 | 改用 |
|---|---|
| Mesh Master 的 Packet Filter 开关 | `B_Eg71MeshModuleCard`（switch 行） |
| 帧粒度过滤/转发 | `B_Eg71MeshForwardCard` |

## 五、Token

`--spacing-12/20`（卡体/组内 gap）、`--color-text-primary`（组次标题 14/500/22）、表格线经 `ms-table` 既有契约。无新增样式常量。

## 六、依赖

- 基础原子：`form / input / select / switch / table / button / card / icon`，不新增基础原子，仅编排。
- 结构类（`library/business.css`）：`.bc-eg71-mesh-filter-body/-sub/-groups(--disabled)/-group/-table/-range(-to)/-add`；组次标题复用 `.bc-eg71-mesh-filter-sub`。

## 七、示例

```js
const C = window.MS_BIZ_INDEX['bc-eg71-mesh-filter'];
$app.innerHTML = C.render({
  on: true,
  groups: [
    { key: 'netid', label: 'NetID', col: 'NetID', range: true, rows: [{ type: 'Blacklist', from: '000001', to: '000010' }] },
    { key: 'deveui', label: 'DevEUI', col: 'DevEUI', range: false, rows: [{ type: 'Whitelist', value: '24E124FFFE123456' }] }
  ]
});
C.bind($app);
$app.addEventListener('eg71-mesh-filter-add', e => console.log(e.detail.group));
```

## 八、版本

见 frontmatter `version:`。
