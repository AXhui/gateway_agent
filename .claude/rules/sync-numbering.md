# 多远程同步与 REQ 编号规则 · Multi-remote Sync & REQ Numbering

> **适用范围**：多远程（`origin` = GitHub / `gitlab` = 内网 GitLab）之间的代码同步、REQ 编号分配、同步冲突处理。
> **性质**：硬性约束。
> **来源**：2026-10-16 双机 REQ-014 撞号事故——两台机器在各自本地 `05_release/` max=013 的情况下分别生成了 REQ-014（GitHub 侧 M-Bus 告警中心 vs 本地 LoRa Mesh），同步 rebase 时 `05_release/REQ-014/` add/add 冲突。本文件把该次事故的完整处理范式固化为规则，此后同类场景**按动作序列执行，不临场发挥**。

## 1. REQ 编号唯一源纪律（事前预防）

- 分配新 REQ 编号前，必须先 `git fetch origin gitlab`，检查**所有远程**的 `05_release/` 取全局最大编号，新编号 = max + 1。
- **禁止只看本地 `05_release/` 目录就分配编号**——双机并行时本地 max 落后于远端，必然撞号（本次事故根因）。
- demo 一旦推送到任一远程（gitlab / origin），其编号即视为**已占用**，无论本地是否还能看到它。
- 同一 PRD 在另一台机器已交付过 REQ 的（changelog 迭代版除外），新 demo 不得复用旧编号，按新 REQ 走。

## 2. 同步范式（GitHub → GitLab 单向同步）

标准动作序列，逐项执行：

1. `git fetch origin gitlab` —— 先取全量状态，不做任何写操作；
2. 分叉时 `git stash push -u -m "<用途>"` —— 保护工作区未提交内容（**必须带 `-u`**，untracked 一并收走）；
3. `git rebase origin/main` —— 保持线性历史，不用 merge；
4. 冲突按 §3 决策表处理；
5. `git stash pop` —— 恢复工作区；与 HEAD 有交叠的文件按 §4 三方合并，禁止丢弃任何一侧；
6. `git push --force-with-lease gitlab main` —— 推送前必须 fetch 确认 gitlab 上无他人新提交；rebase 过的历史只允许 `--force-with-lease`，禁止裸 `--force`。

## 3. REQ 目录 add/add 冲突决策表（硬性）

rebase 中同编号不同内容（双机撞号）时，按表处理：

| 项 | 规则 |
|---|---|
| 谁保号 | **被同步源（远端）保号**；本地新产物挪号 |
| 挪到几号 | 撞号时全局（含两个 remote）max + 1 |
| 挪号清单 | `04_pages/REQ-X/` + `05_release/REQ-X/` **全部文件**一个不漏（demo.html / prompt.md / quality.json / mapping.md / source.txt / validation.md …），以 `git show <commit> --name-status` 清点为准 |
| 字样替换 | 挪号文件**内容里**所有 `REQ-XXX` 字样全局替换为新号（含 demo.html 内部标题），提交信息同步替换 |
| 残留清理 | 原路径残留文件必须 diff 验证（编号归一替换后）与新版**完全一致**才允许删除；验证不过 = 内容没搬全，禁止删 |
| 配套资产 | 组件 SKILL.md / registry / CSS 等库资产不挪——它们属于组件库，不属于 REQ 目录，auto-merge 结果即可用 |

## 4. 未提交工作保护（rebase 全程）

- rebase 前 stash 必须带 `-u`；stash 消息写明用途，方便多 stash 时辨认。
- stash pop 报冲突时：先 `git stash show --name-status <stash>` 盘点全部内容，再逐类恢复：
  - 与 HEAD 无交叠的 tracked 文件：`git restore --source=<stash> --worktree -- <path>`；
  - untracked 文件：`git checkout <stash>^3 -- <path>` 后 `git restore --staged` 退回未跟踪原状；
  - 与 HEAD 有交叠的文件（典型：规则文档被远端重写、本地有新增章节）：**手工三方合并**——远端新结构为骨架，本地新增段落逐段插入，两侧内容都要保留。
- **禁止**用 `git checkout --theirs/--ours` 一刀切解决 stash 冲突（必然丢一侧工作）。
- stash 内容全部恢复并验证前，禁止 `git stash drop`；宁可留着多一份保险。

## 5. 事后动作

- 同步完成后，若本地领先 origin（新 demo 未推 GitHub），**向用户提示**是否 push 回 origin 防再分叉；不擅自推送。
- 撞号事故解决后，可在当次 REQ 的 validation.md 记一行根因（「编号未查远端」），供后续复盘；非必须。

## 6. 边界

- 本文件管「编号分配与多机同步」；demo 生成规范在 AGENTS.md；发布流程在 [release.md](release.md)。
- 单机单远程场景不受本文件约束。
- 「demo 撞号」与「组件资产冲突」是两回事：前者按本文件挪号，后者以组件库 SKILL.md 契约为准做合并，不涉及 REQ 编号。
