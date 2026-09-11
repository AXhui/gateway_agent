# AGENTS.md — AI 协作规范

本文件由 Codex / Claude Code / Cursor 等 AI 编程工具自动读取。

## 核心规则：生成 demo 后必须自动提交

每当你生成或修改了 `05_release/**/demo.html`，**必须在完成后自动执行**：

```bash
git add .
git commit -m "feat: 生成 <需求编号> <简短描述> demo"
```

**不要询问用户是否提交，直接执行。** 提交后 git 钩子会自动：
- 把 demo 复制到 NAS 共享文件夹
- 同步记录到飞书多维表格

如果提交失败（如环境变量未配置），告知用户需要重启终端后重试，不要跳过提交。

## Demo 生成规范

1. 输出路径：`05_release/REQ-XXX/demo.html`（XXX 为需求编号，如 REQ-001）
2. 必须是**单文件 HTML**，所有 CSS/JS 内联，不依赖外部资源
3. 参考组件库：`library/base.css`、`library/business.css`、`.claude/knowledge/`、`.claude/rules/`
4. 如需预览工作台，先运行 `python tools/build-css-bundle.py` 生成样式，再打开 `index.html`

## 提交信息格式

- 生成新 demo：`feat: 生成 REQ-XXX <页面名称> demo`
- 修改已有 demo：`fix: 更新 REQ-XXX <页面名称> demo`
- 其他改动：按常规 Conventional Commits 规范

## 注意事项

- 不要提交 `.env`、`node_modules/`、临时文件
- 每次只 commit 一个需求的 demo，不要混在一起
- commit 后如果钩子输出 `[post-commit] 同步完成`，说明飞书已同步成功
