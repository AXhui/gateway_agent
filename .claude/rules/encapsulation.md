# 封装规则 · Encapsulation

> **适用范围**：基础组件（`base/`）与业务组件（`business/`）**共用一份**，不分别复制。
> **性质**：硬性约束（违反即打回）。业务层不得重写本文件，只允许在 `.claude/rules/` 追加差异补充。

封装是组件可复用、可组合、可独立演进的前提。四条铁律，缺一不可：

## 1. 自包含（Self-contained）

- 每个组件是一个**独立目录**，运行时实现、结构样式、示例文档三者同源，不引用其他组件的内部实现细节。
- 运行时依赖收敛到最小集：React 18 + esm.sh + L1 设计令牌（`tokens.css`）。不得隐式依赖第三方库、全局变量或宿主页面布局。
- 组件对外只暴露一份契约（SKILL.md 的 Props 契约 + 运行时 id），其余全部私有。

**判断标准**：把组件目录拷到空项目里，能否只凭 `tokens.css` 独立渲染？能 → 自包含达标。

## 2. 单向数据流（Unidirectional data flow）

- **Props 进，事件出**。数据只从父组件经 Props 流入，子组件通过回调/事件把变化通知父组件，**禁止**子组件直接改父组件状态或反向写 DOM。
- 受控组件优先：交互状态（hover/active/focus/loading）由组件内部管理，业务状态（value/checked/visible）由父级持有。
- 业务组件内的路由等「单一来源」通过 `ctx` 注入，组件只读不写；变更一律回调（如 `ctx.route` 由 shell 驱动，组件只消费 + 高亮）。

**反例**：`render()` 里用 `document.querySelector` 改父容器、`ctx.someState = x` 直接赋值、props 对象被原地 mutate。

## 3. 样式隔离（Style isolation）

- **禁止硬编码**：任何 hex 色值、px/rem 尺寸、阴影、圆角都必须来自 L1 设计令牌（`tokens.css` 的 CSS 变量）。写死的 `#333` / `16px` 一律打回。
- 命名空间分层：
  - **基础组件**：运行时类名统一 `ms-*`（如 `ms-btn`、`ms-nav-item--active`）。
  - **业务组件**：结构类统一 `bc-<域>-<组件>`（如 `bc-eg71-sidenav`）。
- **业务组件铁律**：业务层**只编排、不写样式常量**。样式只允许 ① 组合 `S_*` 原子的 `ms-*` 类 ② 引用 L1 token 变量 ③ 用 `bc-*` 结构类控制布局/显隐。任何新的颜色、字号、间距常量都应下沉到 L1 或 L2，不得落在业务层。

## 4. 可独立测试（Independently testable）

- 给定 Props 的渲染结果**确定、无副作用**（纯渲染），可脱离宿主单独验证。
- 基础组件必须满足五轴交互标准（见 `INTERACTION.md`）：hover / active / keyboard / loading / error 各态可测、可断言。
- 业务组件的组装结果（atoms 依赖序列 + render 骨架 + bind 骨架）必须可由「组件注册契约」直接校验：`atoms` 列表齐全、`render(ctx)` 可空跑、`bind(root)` 幂等。

## 边界

- 本文件是全量共用规则。业务层若确有差异，**不重写**本文件，而是在 `.claude/rules/business-specific.md` 以「补充规则」叠加（见该文件）。
- 冲突时：组件级元数据 > 业务补充规则 > 本共用规则。
