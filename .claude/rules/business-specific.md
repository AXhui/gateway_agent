# 业务组件补充规则 · Business-specific Supplement

> **定位**：本文件是 `../rules/` 的**差异补充**，不是重写。通用规则（encapsulation / versioning / naming / documentation / release）已共用一份，本文件只写**业务层独有**的那 ~10%。
> **叠加关系**：组件级元数据 > 本补充规则 > `../rules/` 通用规则。

## 1. 样式铁律（对应 encapsulation.md §3 的业务特化）

业务组件**只编排、不写样式常量**：

- ✅ 允许：组合 `S_*` 原子的 `ms-*` 类；引用 L1 token 变量；用 `bc-*` 结构类控制布局/显隐。
- ❌ 禁止：新增颜色/字号/间距/阴影常量；发明新的 `ms-*` 类；在业务层定义 `--*` 变量。
- 判断：业务组件里若出现一个既非 `ms-*` 也非 `bc-*`、又非 `--*` 引用的样式值 → 打回，下沉到 L1/L2。

## 2. 组装契约（对应 documentation.md §2 的业务特化）

业务组件的 Props 契约 = **组装契约**，必须包含：

1. `atoms` 依赖序列（表）：依赖哪个 `S_*`、对应 `ms-*` 控件、在本组件的作用。
2. `ctx` 上下文契约：业务组件依赖的单一来源（如 `ctx.route`、`ctx.entity`），只读，变更走回调。
3. `render(ctx)` 骨架 + `bind(root)` 骨架：可空跑、幂等。
4. `entityHint`：归属实体（`gateway` / `device` / `channel` …）。

## 3. 产品线前缀（对应 naming.md §2.4 的业务特化）

- 业务组件名必须带产品线/域前缀：`eg71` / `router` / `cctv` / `cv` / `com`（跨线通用）。
- 目录归属：`business/eg71/`、`business/router/`、`business/cctv/`、`business/cv/`、`business/_shared/`（com 前缀）。
- 运行时 id 一律 `bc-<域>-<组件>`。

## 4. 发布追加两条（对应 release.md §3）

- **产品线实际页面验证**：业务组件必须在其归属产品线真实页面（如 EG71 网关后台）端到端跑通一次，含真实数据 + 交互。
- **跨产品线影响评估**：改 `bc-com-*` 等共用组件时，评估对 eg71/router/cctv/cv 四线回归影响并同步验证。

## 5. 本层边界

- 本文件**不重复** encapsulation / versioning / naming / documentation / release 的任何通用条目。
- 若某条业务差异未来被多线共用、可抽象为通用规则，则**上沉**到 `../rules/`，从本文件删除——规则只升不裂。