---
name: B_ComDangerAction
version: 0.1.0
description: 危险操作 · Delete 状态（删除/卸载红色警告）交互规范（业务组件 · 规范稿）
---

# 危险操作（删除/卸载红色警告） · B_ComDangerAction

> **状态**：规范稿 v0.1.0 —— 交互规范已定稿；运行时**部分已有基础**（L2 `ms-btn--danger` / `ms-dropdown-item--danger` 三态类已实现），com 线确认弹窗组件与图标按钮红底 hover、Toast/淡出等待落地。eg71 线确认弹窗实现参照 [[B_Eg71Modal]]。

## 1. 描述

不可恢复操作（**删除 / 卸载 / 解除绑定 / 重置 / 恢复出厂 / 退出登录**）的统一交互规范：三态视觉（常规灰 → hover 红 → active 深红）+ 二次确认弹窗 + 确认后行为。常规功能按钮保持蓝/灰，只有不可恢复操作进入本规范。

**不是什么**：不是重画基础组件（三态样式由 `S_Button` / `S_DropdownMenu` 的 `--danger` 变体承担，本组件只定规则与编排）；不是 EG71 专属（com 跨线通用；eg71 线弹窗调度见 `B_Eg71Modal`）；状态标签用色语义见 [[K_color-tone]]，本文件不重复定义颜色。

- **归属**：`_shared/`（`com` 跨线通用）
- **运行时 id**：`bc-com-danger-action`（待实现）
- **组件来源**：Milesight_IOT_Web 组件库，直接调用

## 2. Props（组装契约）

### atoms 依赖序列

| 依赖 S_* | ms-* 控件 | 在本组件的作用 |
|---|---|---|
| `S_Button` | `ms-btn--danger`（描边）/ `--filled--danger`（实心） | 危险描边按钮 / 确认弹窗红色确认按钮 |
| `S_DropdownMenu` | `ms-dropdown-item--danger` | 菜单危险项（Log out） |
| `S_Icon` | `ms-ico` | 图标按钮（垃圾桶等，灰色 → 红） |
| `S_Modal` | `ms-mask` / `ms-modal-*` | 二次确认弹窗骨架 |
| `S_Result` | `ms-result-icon--error` | 弹窗警告图标（红圆底） |
| `S_Popconfirm` | `ms-popconfirm` | 轻量删除确认（表格行内可选用） |
| `S_Message` | `ms-message` | 确认后「删除成功」Toast |

### ctx 上下文契约

| 字段 | 说明 |
|---|---|
| `ctx.action` | `'delete' \| 'unbind' \| 'reset' \| 'factory-reset' \| 'uninstall' \| 'logout'` —— 决定文案族（见 §4） |
| `ctx.target` | 操作对象名，填入「确定要删除「XXX」吗？」 |
| `ctx.onConfirm` / `ctx.onCancel` | 确认/取消回调；确认后执行删除 → 行淡出 0.3s → Toast「删除成功」 |

### 元素类型与三态规则（核心矩阵）

| 元素 | 常规态 | Hover 态 | 点击态（Active） | 适用场景 |
|---|---|---|---|---|
| **图标按钮** | 灰图标 + 透明底 | 红图标 + 浅红底 | 深红图标 | Table 操作列删除、表单行内删除 |
| **描边按钮**（Delete / Remove） | 灰边 + 灰字 + 白底 | 红边 + 红字 + 浅红底 | 深红边 + 深红字 | 批量删除、移除、卸载等操作按钮 |
| **菜单项**（Log out） | 红色文字 | 红色文字 + 浅红底 | 深红文字 | 用户菜单退出登录、系统级危险入口 |
| **确认弹窗按钮** | 取消 = 灰色描边（常规按钮）；确认 = 红色实心 | 确认 = 浅红实心 | 确认 = 深红实心 | 所有删除/危险操作的二次确认 |

### 确认弹窗结构（所有不可恢复操作必须弹出）

- **标题栏**：操作名称（如「确认删除」）+ 关闭按钮 ×
- **内容区**：警告图标（红色圆底 ⚠️）+ 问题 + 描述 —— 问题「确定要删除「XXX」吗？」（带具体对象名）；描述「此操作不可恢复，删除后数据将永久丢失」（**「不可恢复」加粗红色**）
- **操作栏**：取消（灰边）+ 确认删除（红色实心），右对齐
- **关闭方式**（四种等价）：取消按钮 / × 按钮 / 点击遮罩 / ESC 键
- **确认后行为**：执行删除 → 行/项淡出动画 0.3s → Toast「删除成功」

## 3. 状态

交互状态速查（即 §2 三态矩阵的单元素展开）：

| 元素 | 常规 | Hover | Active |
|---|---|---|---|
| 图标按钮 | 灰图标 + 透明底 | 红图标 + 浅红底 | 深红图标 |
| 描边按钮 | 灰边 + 灰字 + 白底 | 红边 + 红字 + 浅红底 | 深红边 + 深红字 |
| 菜单项 | 红字 + 透明底 | 红字 + 浅红底 | 深红字 |
| 确认按钮（实心） | 红实心 | 浅红实心 | 深红实心 |

**已实现**：`ms-btn--danger` 描边三态、`ms-btn--filled.ms-btn--danger` 实心、`ms-dropdown-item--danger`（`library/base.css`）。**待落地**：图标按钮 hover 浅红底、active 深红态、确认弹窗文案族、淡出 0.3s、Toast。

## 4. 场景

### 应用场景

| 场景 | 规则 |
|---|---|
| **一：Table 删除图标** | 操作列最右与编辑并列；hover 变红 → 点击弹确认 → 确认后删除行；操作列固定，横向滚动不消失 |
| **二：多 IP 地址表单（行内删除）** | 每行输入框末尾独立删除列；hover 变红 → 点击弹确认 → 确认后行淡出移除；底部「+ 添加」为蓝/灰常规按钮；**最后一行也可删**（删完剩添加按钮） |
| **三：退出系统（用户菜单）** | 用户下拉菜单最后一项 Log out 红字（与上方常规项区分）；hover 浅红底 → 点击弹退出确认；菜单结构：Change Password / Language / Log out（红色分隔） |
| **四：危险操作按钮组** | Delete / Unbind / Reset / Factory Reset / Uninstall 均为灰边按钮 hover 变红；**顺序按危险程度从低到高排列，删除类在前** |

### 确认弹窗文案族（按 `ctx.action`）

| action | 问题 | 确认按钮 | 描述要点 |
|---|---|---|---|
| `delete` | 确定要删除「XXX」吗？ | 确认删除 | 此操作不可恢复，删除后数据将永久丢失 |
| `unbind` | 确定要解除「XXX」的绑定吗？ | 确认解除 | — |
| `reset` | 确定要重置「XXX」吗？ | 确认重置 | — |
| `factory-reset` | 确定要恢复出厂设置吗？ | 确认恢复出厂 | 强调「**绝对不可恢复**」 |
| `uninstall` | 确定要卸载「XXX」吗？ | 确认卸载 | — |
| `logout` | 确定要退出当前账号吗？ | 退出登录 | — |

## 5. Token（设计令牌清单）

> 源规范色值来自 Milesight_IOT_Web 组件库（AntD 系数值）。**实现一律引 L1 令牌，禁止裸 hex**（铁律）；源值仅作对照，L1 error 三态与源色阶**结构同构**（normal / hover / active / bg）。

| 用途 | 源规范值 | L1 令牌（实现用） |
|---|---|---|
| 危险常规（文字/边框/实心） | `#ff4d4f`（r5） | `--color-error-normal` |
| Hover（文字/边框/实心变浅） | `#ff4d4f` / 实心 hover `#ff7875` | `--color-error-hover` |
| 点击（深红） | `#cf1322`（r7） | `--color-error-active` |
| 浅红底（hover 背景） | `#fff2f0` | `--color-error-bg`（= `--color-red-01`，与源值一致） |
| 图标常规灰 | `#8c8c8c` | `--color-text-auxiliary` |
| 按钮常规灰边 / 灰字 | `#d9d9d9` / `#595959` | `--color-divider-base-2` / `--color-text-secondary` |

**待收敛裸值**（令牌无命中，登记在案）：淡出动画时长 `0.3s`（源规范给定）。

## 6. 依赖

- `atoms` 见 §2，全部已封装（`registry-base.js` 在册：button / dropdown-menu / icon / modal / result / popconfirm / message），R3 可校验。
- 声明**不新增基础原子，仅编排**。
- eg71 线确认弹窗既有实现：`B_Eg71Modal`（action 分发 delete/disable/confirm/select，含关键词二次校验）——本规范文案族落地时以其为参照扩展。
- 状态标签红色语义见 [[K_color-tone]]，不在此重复。
- 依赖版本范围：`ui-core`。

## 7. 示例

```js
// render 骨架（实现时 registry-business.js#bc-com-danger-action）
render(ctx) {
  // 1 按文案族表取 ctx.action 对应 标题/问题/描述/确认按钮文案
  // 2 S_Modal：标题 + × ｜ 红圆底警告图标 + 问题(带 ctx.target) + 描述（「不可恢复」加粗红）
  // 3 操作栏右对齐：取消（ms-btn 灰边）+ 确认（ms-btn ms-btn--filled ms-btn--danger 红实心）
}
bind(root) {
  // 关闭四途径：取消 / × / 点遮罩 / ESC → hidden 收起
  // 确认：onConfirm() → 目标行 .is-removing 淡出 0.3s → 移除 → Message「删除成功」
}
```

页面侧消费：经模块装配引用，见 `.claude/rules/page-assembly.md`。

## 8. 版本

见 frontmatter `version:`。当前 0.1.0 规范稿；运行时落地 + 产品线页面验证后升 1.0.0。

---

## 文件映射

- 实现（运行时）：`assets/js/registry-business.js#bc-com-danger-action`（**待实现**）
- 已有基础：`library/base.css` 的 `ms-btn--danger` / `ms-dropdown-item--danger` 三态类
- eg71 线参照：`.claude/skills/business/eg71/B_Eg71Modal/SKILL.md`
- 令牌（只读）：`.claude/tokens/tokens.css`（error 三态 + red 色阶）
