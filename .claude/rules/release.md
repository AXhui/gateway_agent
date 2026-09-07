# 发布 / 下线规则 · Release & Deprecation

> **适用范围**：基础组件与业务组件**共用一份通用 checklist**。
> **性质**：硬性约束。通用清单人人必过；业务组件额外加两条（见 §3，落在 `.claude/rules/business-specific.md`）。

## 1. 发布前通用 Checklist（全部组件）

发布一个组件（新增或版本 bump）前，逐项勾选：

- [ ] **Token 合规**：无硬编码 hex/px，全部 `--*` 变量来自 `tokens.css`（encapsulation.md §3）。
- [ ] **命名一致**：逻辑名 ↔ 运行时 id ↔ 目录名三处一致，无越界类名（naming.md §3）。
- [ ] **文档 8 章节**：SKILL.md 填满 8 节，无缺项（documentation.md）。
- [ ] **版本已 bump**：frontmatter `version:` 已按 SemVer 递增，正文无重复版本（versioning.md）。
- [ ] **自包含**：目录拷到空项目凭 `tokens.css` 可独立渲染（encapsulation.md §1）。
- [ ] **五轴交互**（基础组件）：hover/active/keyboard/loading/error 可测（encapsulation.md §4）。
- [ ] **注册契约**：`_index.json` / `registry-*.js` 中 `id/cn/cat/dir/src` 已登记或更新。
- [ ] **示例可运行**：代码示例在当前 token 下真实渲染，非伪代码。

**判定**：任一项不满足 → 不发布，退回修复；修复后按 versioning.md 只 bump patch。

## 2. 下线（Deprecation）规则

组件下线分两阶段，**禁止一步删除**：

1. **标记弃用**：SKILL.md 顶部加 `> **状态**：deprecated（vX.Y.Z 起，改用 <替代组件>）`，写清迁移路径；`_index.json` 的 `status` 改 `deprecated`。
2. **宽限期**：至少保留一个 minor 周期（约一个 release 迭代），期间旧组件可渲染但不新增功能，文档首页置顶「迁移指引」。
3. **正式删除**：确认无引用后，删除目录 + 移除 registry 条目 + 移除 `_index.json` 记录，并在 CHANGELOG/发布说明标注「移除 <组件>，替代 <组件>」。

**红线**：弃用必须给出**替代组件**；无替代方案时只允许「暂缓弃用」，不得标记 deprecated 后无路可走。

## 3. 业务组件追加两条（差异补充，落在 `.claude/rules/business-specific.md`）

- **产品线实际页面验证**：业务组件必须在其归属产品线的真实页面（如 EG71 网关后台）跑通一次端到端，含真实数据 + 交互，非组件库内 demo。
- **跨产品线影响评估**：改动 `bc-com-*` 等跨产品线共用组件时，必须评估对 eg71/router/cctv/cv 四线的回归影响，并同步受影响线的验证。

> 通用 checklist 全量共用；这两条只在 `.claude/rules/` 追加，**不复制本文件**。