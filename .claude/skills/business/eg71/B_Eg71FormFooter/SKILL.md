---
name: B_Eg71FormFooter
version: 1.1.0
description: EG71 表单底部操作栏（业务组件）：Affix 吸底固钉 + 默认取消/重置/保存；v1.1.0 支持 ctx.buttons 自定义按钮组与 eg71-footer-action 事件
---

# 表单底部操作栏 · B_Eg71FormFooter

## 1. 描述

**这是什么**：EG71 表单页底部固定悬浮操作栏：Affix 固钉吸底（offsetBottom=0）+ 左侧弹性占位把按钮组靠右排列。默认渲染 取消/重置/保存（保存为主按钮）；v1.1.0（REQ-012）起支持 `ctx.buttons` 自定义按钮组（如 LoRaWAN 设备表单页尾的 取消/保存 两钮、扫描配置页尾的 取消/开始扫描）。只读模式整体不渲染；弹窗内部表单禁用本栏。

**不是什么**：不执行保存/取消逻辑——点击以 `eg71-footer-action` 冒泡交宿主（v1.0.0 无 bind、无事件，按钮为纯展示；v1.1.0 补齐 bind 与事件）。

**归属产品线**：`eg71`。**entityHint**：`gateway`。

## 2. 组装契约（atoms 依赖 + ctx 上下文）

### atoms 依赖序列
| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Affix` | `ms-affix--fixed ms-affix--bottom` / `ms-affix-body` | 底部固钉浮层 |
| `S_Space` | `ms-space ms-space--12` | 按钮组横向排列（≥12 间距红线） |
| `S_Button` | `ms-btn` / `ms-btn--filled` / `ms-btn--danger` / `ms-btn--dashed` | 默认三钮 / 自定义 kind |

### ctx 上下文契约（单一来源，只读）
| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `ctx.readonly` | boolean | `false` | true 整体不渲染（返回 `''`） |
| `ctx.buttons` | FooterBtn[] | 无 | v1.1.0：自定义按钮组；**不传或空数组时保持默认三钮**（向后兼容）。FooterBtn = `{ label:string, kind?:'default'\|'filled'\|'danger'\|'dashed', disabled?:boolean, action?:string }` |

默认三钮等价于 `[{label:'取消',action:'cancel'},{label:'重置',action:'reset'},{label:'保存',kind:'filled',action:'save'}]`。

### 事件出（CustomEvent，bubbles: true）· v1.1.0 新增
| 事件 | detail | 触发 |
|---|---|---|
| `eg71-footer-action` | `{ action, label, index }` | 点击任一按钮；action 未传时为 `''`（默认组为 cancel/reset/save） |

## 3. 状态（States）

| 状态 | 触发 | 视觉/结构 |
|---|---|---|
| 常驻吸底 | 渲染即吸附页底 | `ms-affix--fixed ms-affix--bottom`，上方内容由 spacer 让位 |
| 只读 | `ctx.readonly:true` | 整体不渲染 |
| 按钮禁用 | FooterBtn.disabled | 原生 `disabled` |
| kind 变体 | filled / danger / dashed | 对应 `ms-btn--*` 修饰类 |

## 4. 场景（Scenarios）

**何时用**：EG71 一切长表单页（设置、Network、LoRaWAN 设备添加/编辑、扫描配置）页尾提交区。

**何时不用**：
| 场景 | 改用 |
|---|---|
| 顶部操作区 | `B_Eg71Topnav` |
| 非固定行内按钮组 | `S_Space` + `S_Button` 直接组合 |
| 弹窗内 footer | `S_Modal` 自带 `ms-modal-foot` |
| 危险确认（需二次弹窗） | `B_Eg71Modal`（本栏只发事件不拦截） |

## 5. Token（设计令牌）

全部继承 `S_Affix` / `S_Space` / `S_Button` 既有令牌。本组件结构类 `.bc-eg71-formfooter` / `.bc-eg71-formfooter-spacer`（`library/business.css` 255-260）仅布局，无视觉常量。

## 6. 依赖（Dependencies）

`atoms`：仅编排，不新增基础原子。依赖 `affix` / `space` / `button`。

## 7. 示例（Examples）

```js
const B = window.MS_BIZ_INDEX;
// 默认三钮（v1.0.0 行为完全保留）
foot.innerHTML = B['bc-eg71-form-footer'].render({});
B['bc-eg71-form-footer'].bind(foot);   // v1.1.0 起可 bind

// 自定义两钮（LoRaWAN 设备表单页尾）
B['bc-eg71-form-footer'].render({ buttons: [
  { label: '取消', action: 'cancel' },
  { label: '保存', kind: 'filled', action: 'save' }
]});

foot.addEventListener('eg71-footer-action', e => {
  if (e.detail.action === 'save') submitForm();
});
```

## 8. 版本（Version）

见 frontmatter `version:`。v1.1.0（REQ-012）：新增 `ctx.buttons` 组装契约与 `bind`（`eg71-footer-action` 事件）；默认三钮行为与 v1.0.0 向后兼容。
