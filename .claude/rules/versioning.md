# 版本规则 · Versioning

> **适用范围**：基础组件与业务组件**共用一份**。
> **性质**：硬性约束。全局只有一个版本规则，**组件级版本**落在各自 SKILL.md 的 frontmatter。

## 1. 版本位置：frontmatter，不在正文

每个组件的版本号放在 SKILL.md **frontmatter** 的 `version` 字段，与 `name` 并列：

```markdown
---
name: Button
version: 1.1.0
description: 按钮（基础组件）
---
```

- `name`：组件逻辑名（基础 `S_<PascalCase>` / 业务 `B_<域>_<组件>`，见 naming.md）。
- `version`：该组件**自身**的版本，SemVer（`major.minor.patch`）。
- **迁移要求**：现有 SKILL.md 中正文里的 `> **版本**：v1.1.0（…）` 一律收敛到 frontmatter `version:` 字段，正文不再重复写版本。

## 2. SemVer 语义

| 位 | 何时 bump | 示例 |
|----|-----------|------|
| **major** | 契约破坏性变更：Props 删除/改名、运行时 id 变化、atoms 依赖断裂 | `type` 属性改为 `variant` 且不再兼容 |
| **minor** | 向后兼容新增：新 Props、新变体、新状态、新 atoms 依赖 | 新增 `status` 语义色 |
| **patch** | 无契约变化：文档勘误、样式微调、token 引用修正 | 修正 disabled 的 opacity 值 |

**判断标准**：现有使用者不改代码能否继续跑？不能 → major；能且新增能力 → minor；纯修复 → patch。

## 3. 触发 bump 的三类变更

1. **Props 契约变更**：任何 `Props` 表的增删改（见 documentation.md 第 2 节）。
2. **Token 依赖变更**：组件用到的 `--*` 变量集合变化（见 documentation.md 第 5 节）。
3. **依赖图谱变更**：业务组件的 `atoms` 序列增删，或基础组件的上游依赖变化。

## 4. 禁止事项

- **禁止全局版本号**：不存在「整个组件库 v2.0」；每个组件独立演进、独立版本。
- **禁止版本写在正文**：frontmatter 是唯一来源，正文、README、`_index.json` 都不再单独维护版本号（`_index.json` 只存 `id/cn/cat/dir/src/status`，不含 version）。
- **禁止跳版本**：按 SemVer 顺序递增，不预留、不回退。

## 5. 与发布的关系

版本 bump 是发布（release.md）的前提：先 bump，再走发布 checklist；发布失败不 bump，修复后只 bump patch。
