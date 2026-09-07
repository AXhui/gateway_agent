---
name: Switch
description: 开关（基础组件）
---

# Switch · 开关

> **分类**：数据录入
> **Figma**：1318-116140
> **组件目录**：`../../../../frontend/components/Switch/`
> **版本**：v1.1.0（已对齐 antd `size` / `checkedChildren` / `defaultChecked` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**立即生效**的二态开关。Switch 表达「开/关」并**即时提交**，不做二次确认、不挂保存按钮。

### 何时用
- 单个功能/设置的即时启停（如「启用通知」「自动续费」「日志采集」）。
- 状态切换有**清晰对立**语义（开/关、启/停、ON/OFF），且副作用可逆。
- 表格行内、表单里的布尔字段。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 代价高/不可逆的操作（删除、格式化、扣费、发版） | `Checkbox` + 显式「保存」按钮 |
| 需要二次确认才生效 | `Popconfirm` 包裹，或 `Checkbox` + 提交 |
| 多项并列、需要明确勾选 | `Checkbox` / `Checkbox.Group` |
| 三态或不确定态 | 不支持，改用 `Checkbox` 的 `indeterminate` |
| 只读展示布尔状态 | `Tag` / `Badge` / 文本，不要用禁用的 Switch |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础（默认） | 单开关，表单/详情里布尔字段 | 不要脱离 label 裸放 |
| `size="small"` | 表格行内、紧凑布局 | 不要在 40px 表单项里用 small |
| `checkedChildren`/`unCheckedChildren` | 需明示当前态文案（开/关、ON/OFF） | 文案别超过 2 字，撑坏宽度 |
| `loading` | 提交中禁止二次点击 | 不要 loading + 可点击并存 |
| `disabled` | 无权限/不可变更时 | 不要用 disabled 表达「当前值」 |

### 无障碍
- 根元素 `role="switch"` + `aria-checked`，读屏播报「开/关」。
- `aria-disabled` 在 disabled/loading 时置位；键盘可聚焦（原生 `<button>`）。
- label 与开关关联：文案放 Switch 右侧（Form.Item label 在上时例外），读屏能读到当前状态说明。
- 不要只靠颜色区分开/关，配合 `checkedChildren` 文案或外部 label。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵（精确值，禁止脱离 token 硬编码）
| size | height | width | knob 直径 | 内边距 | 使用场景 |
|------|--------|-------|-----------|--------|----------|
| `default` | 22px | 44px | 18px | 2px | 表单、详情 |
| `small` | 16px | 28px | 12px | 2px | 表格行内、紧凑布局 |

antd 尺寸语义：`default` 22px / `small` 16px，Milesight 与 antd 完全一致。

### 状态视觉矩阵
| 状态 | 轨道背景 | knob | 说明 |
|------|----------|------|------|
| off（default） | `var(--color-border-base)` | `var(--color-bg-card)` | 关态，无灰色 bg 区分 |
| on（checked） | `var(--color-primary-normal)` | `var(--color-bg-card)` | 开态 |
| hover | 不变（无边框） | knob `box-shadow 0 2px 4px rgba(0,0,0,0.16)` | 轻浮起 |
| disabled | 同当前态 + `opacity:0.5` | 同当前态 | cursor not-allowed |
| loading | 同当前态 | knob 内显示 Spin（`--color-primary-normal`，0.8s 旋转） | 不可再点击 |

### knob 阴影
knob 统一 `box-shadow: 0 2px 4px rgba(0,0,0,0.16)`，营造立体悬浮感。

### 文案（checkedChildren / unCheckedChildren）
- 位于轨道内，color `--color-text-constant-normal`；开态文案靠左、关态文案靠右（随 knob 位置用 padding 切换）。
- 字号：`default` 12px / `small` 10px。

### 过渡
`background` / knob `left` / 文案 `padding` 三者同步 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（on 轨道）、`--color-border-base`（off 轨道）、`--color-bg-card`（knob）、`--color-text-constant-normal`（文案）、`--radius-full`（轨道 pill 圆角）、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版引用非规范 `--color-gray-200`，已统一为 `--color-border-base`（等价色阶 `--color-gray-04`）。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 边框 hover（回指总纲） |
| active（点击反馈） | 按下加深 |
| 键盘 | `Space` 切换 |
| loading | `loading` 态（回指总纲） |
| error | 无 |

## 三、研发层（代码架构 / Props 契约）

### 导入方式
组件为独立 HTML 实现（React 18 + esm.sh），第三方开发者不直接 import 源码，而是**通过 Skill 契约 + token 变量**复刻：

```html
<script type="importmap">
{ "imports": { "react": "https://esm.sh/react@18.3.1", "react-dom/client": "https://esm.sh/react-dom@18.3.1/client" } }
</script>
```

### Props 契约（含 antd 别名）

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | `boolean` | `-` | 受控值（`checked !== undefined` 时受控） |
| `defaultChecked` | `boolean` | `false` | **antd 别名**，非受控默认值 |
| `size` | `'default' \| 'small'` | `'default'` | 尺寸（antd 同名同值） |
| `checkedChildren` | `ReactNode` | `-` | **antd 别名**，开态文案 |
| `unCheckedChildren` | `ReactNode` | `-` | **antd 别名**，关态文案 |
| `loading` | `boolean` | `false` | 加载中，禁止点击，knob 显示 Spin |
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(checked: boolean) => void` | `-` | 切换回调（回传新布尔值，非 event） |
| `style` / `className` | `-` | `-` | 透传 |

### 受控/非受控语义
- `checked !== undefined` 时受控，点击经 `onChange(newBool)` 通知外部更新。
- 否则内部维护 `defaultChecked`。
- `loading` 与 `disabled` 任一为 true 时阻断点击（`blocked = disabled || loading`）。

### 事件 / 键盘
- 根为原生 `<button type="button">`，`Enter`/`Space` 原生触发点击。
- `role="switch"` + `aria-checked` + `aria-disabled` 语义齐全，无需额外键盘逻辑。

---

## 代码示例

```html
<Switch defaultChecked />
<Switch size="small" defaultChecked />
<Switch checkedChildren="开" unCheckedChildren="关" defaultChecked />
<Switch checked={enabled} onChange={setEnabled} />
<Switch loading defaultChecked />
<Switch disabled />
```

---

## 文件映射

- Preview 文件：`switch-preview.html`
- 组件目录：`../../../../frontend/components/Switch/index.html`
- 令牌文件：`../../../tokens/tokens.css`
