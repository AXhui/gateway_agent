---
name: B_Empty
version: 1.0.0
description: 空状态（业务组件）—— 固定插画 + 随业务适配的可变文案，无行动按钮
---

# 空状态 · B_Empty

> **逻辑名**：`B_Empty`
> **现 id**：`bc-empty`
> **分类**：空态
> **entityHint**：`device`
> **包归属**：`ui-core`
> **依赖基础组件**：`ui-core ^1.1.0`

---

## 一、描述（Description）

纯空状态占位：一张**固定不变的插画**（`empty.png`）配两行**随业务适配的可变文案**（主文案 + 可选副文案），**无任何行动按钮**。与 `B_EmptyState`（空态引导，含主/次行动按钮）互补——本组件只做「无数据时的静默占位」，不做「引导开通/创建」。

## 二、Props（组装契约）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Empty` | `ms-empty` | 空态骨架（插画 + 文案居中排布） |

### ctx 上下文契约（单一来源，只读）

| 键 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `ctx.entity.cn` | `string` | 是 | 实体中文名（如「设备」），主文案兜底用 |
| `ctx.empty.cn` | `string` | 否 | 主文案，缺省时回退 `暂无${entity.cn}数据` |
| `ctx.empty.sub` | `string` | 否 | 副文案，缺省时不渲染 |

### render(ctx) 骨架

```js
render(ctx) {
  const e = ctx.entity;
  const title = ctx.empty && ctx.empty.cn ? ctx.empty.cn : `暂无${esc(e.cn)}数据`;
  const sub = ctx.empty && ctx.empty.sub ? ctx.empty.sub : '';
  return `<div class="ms-card"><div class="ms-empty bc-empty">
    <img class="ms-empty-illu bc-empty-img" src="data:image/png;base64,{...}" alt="" aria-hidden="true">
    <div class="ms-empty-text">${esc(title)}</div>
    ${sub ? `<div class="bc-empty-sub">${esc(sub)}</div>` : ''}
  </div></div>`;
}
```

### entityHint

`device`

## 三、状态（States）

纯静态占位，无 hover/active/disabled 交互态。插画与文案均不可点、不可聚焦。

## 四、场景（Scenarios）

### 何时用
- 列表/详情页某区块暂无数据，只需「插画 + 一句说明」的静默占位。
- 需要随业务（实体类型）切换文案、但插画保持统一的空态。

### 何时不用（改用其他 B_*）
| 场景 | 改用 |
|------|------|
| 空态需带「开通/创建」等行动按钮 | `B_EmptyState`（空态引导） |
| 表格内局部空态 | `S_Empty`（基础组件） |
| 结果页（成功/失败） | `S_Result` |

## 五、Token（设计令牌）

| 令牌 | 用途 |
|---|---|
| `--spacing-64` / `--spacing-16` | `.bc-empty` 纵向/横向内边距 |
| `--color-text-primary` | 主文案色 |
| `--color-text-auxiliary` | 副文案色（继承 `.ms-empty` 默认辅助色） |

## 六、依赖（Dependencies）

- `atoms` 依赖序列：仅 `S_Empty`（见 §二），不新增基础原子，仅编排。
- 插画为内联 base64 PNG（`empty.png`），零外部依赖，满足单文件导出约束。

## 七、示例（Examples）

```js
// 最小可运行：设备域，自定义主/副文案
render({ entity: { cn: '设备' }, empty: { cn: '暂无告警记录', sub: '设备运行正常，暂无告警' } });
// → 插画 + 「暂无告警记录」+「设备运行正常，暂无告警」

// 兜底：不传 ctx.empty，回退默认文案
render({ entity: { cn: '设备' } });
// → 插画 + 「暂无设备数据」
```

## 八、版本（Version）

见 frontmatter `version:`。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-empty`
- 结构类：`library/business.css`（`.bc-empty` / `.bc-empty-sub`）
- 插画（内联）：`.claude/skills/business/_shared/B_Empty/empty.png`
- 实体（只读）：`assets/js/registry-entities.js`（key `device`）
- 令牌（只读）：`.claude/tokens/tokens.css`
