# 产出目录规则 · Output

> **适用范围**：临时/手动验证类 demo（组件拼装核实页、单组件渲染检查、调试用 HTML 等）。
> **不适用**：PRD 正式流转产物 `05_release/REQ-###/demo.html`（见 `.claude/README.md` 五、六节 + release.md），那条路径已有独立归档规则，不受本文件约束。
> **性质**：硬性约束。

## 1. 判断边界：哪些 demo 归本规则

凡满足以下任一条件的 HTML/JS demo，都归本规则管：

- 手动核实某个基础/业务组件拼装效果（如「EG71 四组件拼装核实页」）。
- 调试用的一次性渲染检查，不挂在任何 `R_YYYYMMDD_REQ-###_*` 需求目录下。
- 不是 A4 渲染器按 `page.json` 生成的正式交付物。

反例（不归本规则）：`05_release/REQ-###/demo.html`——这是 PRD 流转链路的正式交付物，continue 走 `04_pages/` → `05_release/` 既有路径，不搬进 `output/`。

## 2. 存放规则

- 统一落到仓库根 `output/` 目录（已在 `.gitignore` 声明为忽略路径，不入库）。
- **禁止**在仓库根目录直接新建校验/demo 类 HTML 文件（如 `xxx-verify.html` 散落在根目录）。
- `output/` 内部不强制子目录结构，但建议按来源前缀命名，方便回溯（见第 3 节）。

## 3. 命名建议

- 沿用来源可追溯的命名：`<域或组件>-<场景>-verify.html`，例如 `output/eg71-sidenav-verify.html`、`output/eg71-alarm-verify.html`。
- 同一组件多次迭代校验，直接覆盖同名文件，不做版本号后缀（`output/` 本身不入库，不需要版本追溯）。

## 4. 引用规则

- 组件 SKILL.md 若在「示例/依赖」章节提到校验页路径，必须写 `output/<文件名>`，不能写根目录裸路径。
- 若某校验页从根目录迁移到 `output/`，迁移时同步更新所有引用该路径的 SKILL.md / README。

## 5. 与 `05_release/` 的关系

| | `output/` | `05_release/REQ-###/` |
|---|---|---|
| 产出方 | 人工手动核实 / 一次性调试 | A4 渲染器按 `page.json` 生成 |
| 是否入库 | 否（`.gitignore` 忽略） | 是（PRD 交付物，需归档） |
| 生命周期 | 随时可删，不做版本追溯 | 跟随需求目录长期保留 |
| 校验要求 | 无强制校验 | 必须过 R1–R5（见 release.md / K_validation.md） |

两套路径职责不同，不得混用：正式交付物不能落进 `output/`（会被 `.gitignore` 吞掉，等于丢失交付物）；临时校验也不能塞进 `05_release/`（会污染需求目录的正式产出）。

## 6. 存量迁移

现有散落在仓库根目录的临时校验 demo（如 `eg71-verify.html`、`eg71-alarm-verify.html`）需迁移到 `output/` 下，并更新引用它们的 SKILL.md 路径。迁移会使这些文件脱离版本库跟踪（进入 `.gitignore` 范围），执行前需与用户确认。