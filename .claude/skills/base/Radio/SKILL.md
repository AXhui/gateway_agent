---
name: Radio
description: 单选框（基础组件）
---

# Radio · 单选框

> **分类**：数据录入
> **Figma**：1318-112964
> **组件目录**：`../../../../frontend/components/Radio/`
> **版本**：v1.1.0（已对齐 antd `Radio.Group` `optionType` / `buttonStyle` / `size` API，统一 token）

---

## 一、产品层（何时用 / 何时不用）

### 组件定位
**互斥单选**控件。同一组内只能选中一项，选中后**立即生效**（无需二次提交），常用于需要一眼看清所有候选的场景。

### 何时用
- 2~8 个**互斥**选项，且候选最好全部可见、无需搜索。
- 需要用户明确在并列选项间做**唯一**抉择（地域、计费方式、配额档位）。
- 需要「全部候选一览无余」对比时（比 `Select` 更直观）。

### 何时不用（改用其他组件）
| 场景 | 改用 |
|------|------|
| 选项 > 8 个、或需要搜索过滤 | `Select` |
| 切换的是**视图/模式**（卡片/列表/地图）而非表单值 | `Segmented` |
| 多选、可同时成立 | `Checkbox` / `Checkbox.Group` |
| 开/关二态且即时生效 | `Switch` |
| 只读展示单选结果 | 文本 / `Tag` |

### 变体选择建议（Do / Don't）
| 形态 | 用法 | 禁忌 |
|------|------|------|
| 基础（default） | 4+ 个选项时用，圆点单选框 | 选项 ≤3 且短时用按钮更省空间 |
| `optionType="button"` | 2~3 个短选项，视觉成组 | 不要超过 4 个，撑满一行 |
| `buttonStyle="solid"` | 强调当前态的胶囊按钮组 | 不要与 outline 混用在同一组 |
| `buttonStyle="outline"` | 轻量线框按钮组 | 选中态仅边框+文字变色 |
| 纵向排列 | 5~8 个长选项 | 横向排不下时强制换行会乱 |
| `disabled`（项级） | 不可选项（如「海外暂未开放」） | 不要整组禁用来表达只读 |

### 无障碍
- 根为原生 `<input type="radio">` + `<label>`，同组共享 `name` 语义；读屏播报「已选/未选」。
- 键盘 `↑ ↓ ← →` 在组内切换，`Space` 选中。
- 不要只靠颜色/边框区分选中，选中态保留圆点实心标记。
- 按钮组用原生 `<button>` + `aria-pressed` 语义（或 `role="radio"`），确保可聚焦。

---

## 二、UED 层（视觉规格 / 统一 Token）

### 尺寸矩阵
| 属性 | 值 | 说明 |
|------|-----|------|
| 圆点外圈 | 16px × 16px | 固定，不随 size 缩放 |
| 圆点内点 | 8px × 8px | 选中时 scale(0→1) |
| 外圈圆角 | `var(--radius-full)` | 正圆 |
| label 间距 | `var(--spacing-8)`（8px） | 圆点与文字 |
| 组水平间距 | `var(--spacing-16)`（16px） | 项与项 |

### 按钮组尺寸（optionType="button"）
| size | height | 左右 padding | 使用场景 |
|------|--------|-------------|----------|
| `small` | 24px | 12px | 紧凑行内 |
| `default` | 28px | 16px | 常规 |
| `large` | 32px | 16px | 强调/大点击区 |

### 状态视觉矩阵
| 状态 | 外圈边框 | 内点 | 说明 |
|------|----------|------|------|
| unselected | `var(--color-border-base)` | 无（scale 0） | 空圈 |
| hover（未选） | `var(--color-primary-normal)` | 无 | 仅边框变色 |
| selected | `var(--color-primary-normal)` | `var(--color-primary-normal)` | 实心点 |
| disabled | 同当前态 | 同当前态 | `opacity:0.6`，文字 `--color-text-disable` |
| 按钮组选中（outline） | `var(--color-primary-normal)` | — | 边框+文字品牌蓝 |
| 按钮组选中（solid） | `var(--color-primary-normal)` bg | — | 文字 `--color-text-constant-normal` |

### 过渡
外圈边框 / 内点 `transform:scale` / 按钮背景 同步 `160ms var(--easing-standard)`。

### 使用的设计令牌
`--color-primary-normal`（选中/边框）、`--color-border-base`（未选边框）、`--color-bg-card`（未选背景）、`--color-bg-hover`（禁用背景）、`--color-text-primary`、`--color-text-secondary`、`--color-text-auxiliary`、`--color-text-disable`、`--color-text-constant-normal`（solid 选中文字）、`--radius-2`、`--radius-4`、`--radius-full`、`--duration-fast`、`--easing-standard`。

> **Token 修正**：旧版 Skill 引用非规范 `--color-gray-200`，已统一为 `--color-border-base`（等价色阶 `--color-gray-04`）。

---

### 五轴交互补表（回指 `INTERACTION.md` 总纲）

| 轴 | 本组件 |
|----|--------|
| hover | 边框 hover（回指总纲） |
| active（点击反馈） | 按下加深 |
| 键盘 | `Space` 选中、组内方向键切换 |
| loading | 无加载态 |
| error | 无（校验由 Form 承载） |

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
| `disabled` | `boolean` | `false` | 禁用 |
| `onChange` | `(e: Event) => void` | `-` | 回传原生 change event |
| `children` | `ReactNode` | `-` | label 文字 |
| `style` / `className` / `...rest` | `-` | `-` | 透传，`...rest` 落到原生 input |

### RadioGroup Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `options` | `{ label, value, disabled? }[]` | `-` | 选项集合 |
| `value` | `string\|number` | `-` | 受控选中值 |
| `defaultValue` | `string\|number` | `-` | **antd 别名**，非受控默认值 |
| `disabled` | `boolean` | `false` | 整组禁用 |
| `optionType` | `'default' \| 'button'` | `'default'` | **antd 同名同值**：原生圆点 / 按钮组 |
| `buttonStyle` | `'outline' \| 'solid'` | `'outline'` | **antd 同名同值**：按钮组线框/实心 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 按钮组尺寸 |
| `onChange` | `(value: string\|number) => void` | `-` | 回传新选中值 |

### 受控/非受控语义
- 单 `Radio`：`checked !== undefined` 时受控，否则内部维护 `defaultChecked`。
- `RadioGroup`：`value !== undefined` 时受控，否则 `defaultValue`；`onChange` 回传**单个值**（非事件）。

### 事件 / 键盘
- 单 Radio 根为原生 `<input type="radio">`，同组浏览器自动互斥；`↑↓←→` 切换、`Space` 选中。
- 按钮组根为原生 `<button type="button">`，`Enter`/`Space` 触发；组内未实现箭头键互切，需接入 `aria-pressed` 或 `role="radio"` 补充语义。

---

## 代码示例

```html
<Radio defaultChecked>已选中</Radio>
<Radio disabled>禁用</Radio>
<RadioGroup value={region} onChange={setRegion}
  options={[{label:'华东 1',value:'cn-east-1'},{label:'华北 2',value:'cn-north-2'}]} />
<RadioGroup optionType="button" value={billing} onChange={setBilling}
  options={[{label:'按小时',value:'hour'},{label:'包月',value:'month'}]} />
<RadioGroup optionType="button" buttonStyle="solid" defaultValue="md"
  options={[{label:'小',value:'sm'},{label:'中',value:'md'}]} />
```

---

## 文件映射

- Preview 文件：`radio-preview.html`
- 组件目录：`../../../../frontend/components/Radio/index.html`
- 令牌文件：`../../../tokens/tokens.css`
