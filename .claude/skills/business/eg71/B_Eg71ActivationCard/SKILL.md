---
name: B_Eg71ActivationCard
version: 1.0.0
description: EG71 激活设置灰卡（业务组件）：默认值/自定义值单选（非 Milesight 禁用默认值）+ OTAA AppKey 32 位十六进制输入校验
---

# 激活设置灰卡 · B_Eg71ActivationCard

## 1. 描述

**这是什么**：EG71 LoRaWAN 激活设置灰底卡片：单选组「默认值 / 自定义值」+（OTAA 态）AppKey 输入框。非 Milesight 设备时「默认值」禁用（03-ued §6.3）；AppKey 限 32 位十六进制，实时字数统计与错误提示。单选切换**只读输入框取当前值、绝不清空**（交互 #8）。

**不是什么**：不管理 OTAA/ABP 切换、不管 ABP 三密钥置灰——那是消费方（`bc-eg71-device-form`）监听本组件的 `eg71-activation-change` 后做的联动，本组件不越界。ABP 态（`kind:'abp'`）只渲染单选组，无 AppKey 输入框。

**归属产品线**：`eg71`。**entityHint**：`device`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Form` | `ms-form-item` / `ms-form-label(--required)` / `ms-form-label` | 灰卡表单骨架（复用全局 `bc-eg71-form-item-*` 结构类） |
| `S_Radio` | `ms-radio-btn-group` / `ms-radio-btn(--checked)` | 默认值/自定义值单选 |
| `S_Input` | `ms-input` / `ms-input--error` / `ms-input--disabled` | AppKey 输入与校验态 |
| `S_Icon` | `ico('info', 16)` | 标签说明图标 |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.kind` | `'otaa' \| 'abp'` | `'otaa'` | 激活类型；otaa 才渲染 AppKey 块 |
| `ctx.value` | `{ mode, appKey }` | `{ mode:'default', appKey:'' }` | 受控值（mode = `'default' \| 'custom'`） |
| `ctx.milesight` | boolean | `false` | 是否 Milesight 设备（false 时「默认值」禁用，mode 强制走 custom） |
| `ctx.readonly` | boolean | `false` | AppKey 输入只读态 |

### 事件出（CustomEvent，bubbles: true）
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-activation-change` | `{ kind, mode, appKey }` | 点击可选中的单选钮（aria-disabled=true 的跳过）；appKey 恒为输入框当前值（保留输入） |
| `eg71-activation-appkey` | `{ value, valid }` | AppKey 输入 change（valid = `/^[0-9A-Fa-f]{32}$/`） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 单选选中 | 点击 radio | `.ms-radio-btn--checked` + `aria-checked` 同步 |
| 默认值禁用 | `ctx.milesight === false` | `.bc-eg71-activation-btn--disabled`（auxiliary 色 + `pointer-events:none` + `aria-disabled="true"`） |
| AppKey 非法 | 已输入且非 32 位十六进制 | `ms-input--error` + `.bc-eg71-form-item-msg--error`「AppKey 必须为 32 位十六进制字符（0-9 / A-F）」 |
| AppKey 合法/空 | 输入中实时同步 | 字数 `N/32`；msg 显示提示文案 |
| 只读 | `ctx.readonly` | `ms-input--disabled` + `readonly` 属性 |

## 4. 场景（Scenarios）

**何时用**：设备添加页 OTAA 灰卡（Profiles 下方）；设备编辑页 OTAA/ABP 激活区；也作为 `bc-eg71-device-form` 的内嵌原子卡（由其 render 直接调用本组件 render）。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 整页设备添加/编辑表单（含基本信息/Profiles/三场景暂存） | `bc-eg71-device-form`（内嵌本组件） |
| ABP 三密钥 + 计数器编辑 | `bc-eg71-device-form` 的 ABP 参数卡 |
| 扫描配置页的自定义 AppKey 批量列表 | `bc-eg71-scan-appkey-card` |

## 5. Token（设计令牌）

- 灰卡底：继承 `bc-eg71-subarea`（`--color-fill-base-normal`）
- 禁用单选：`--color-text-auxiliary`
- 输入/文案：全部继承 `ms-input` / `ms-form-label` / `bc-eg71-form-item-msg` 既有令牌
- 间距：`--spacing-12`（卡内纵向 gap）/ `--spacing-8`（AppKey 块内 gap）

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `radio` / `form` / `input` / `icon`。结构类 `.bc-eg71-activation-card` / `.bc-eg71-activation-group` / `.bc-eg71-activation-btn--disabled` / `.bc-eg71-activation-key`（`library/business.css`）；灰卡与 labelrow/count/msg 复用全局共享类 `bc-eg71-subarea` / `bc-eg71-form-item-*`。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
// 添加页：非 Milesight（DevEUI 不以 24E124 开头）→ 默认值禁用
app.innerHTML = B['bc-eg71-activation-card'].render({
  kind: 'otaa', milesight: false, value: { mode: 'custom', appKey: '' }
});
B['bc-eg71-activation-card'].bind(app);

app.addEventListener('eg71-activation-change', e => {
  // e.detail = { kind:'otaa', mode:'custom', appKey:'<当前输入，切换不清空>' }
});
app.addEventListener('eg71-activation-appkey', e => {
  saveBtn.disabled = !e.detail.valid; // 32 位十六进制才放开保存
});
```

## 8. 版本（Version）

见 frontmatter `version:`。
