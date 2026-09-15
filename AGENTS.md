# AGENTS.md — AI 协作规范

本文件由 Codex / Claude Code / Cursor 等 AI 编程工具自动读取。

## 读取飞书 PRD/需求文档：用拉取工具，不要用网页抓取

当用户给的是飞书链接（`/wiki/`、`/docx/`、`/docs/`），**不要用 webReader/网页抓取**——飞书需要登录，那样只能拿到登录页。改用项目自带工具（复用本机已登录的 lark-cli）：

```bash
python tools/fetch_feishu_doc.py "<飞书链接>" --out prd.md
```

然后读取 `prd.md` 作为需求正文。若工具报未登录或无权限，再请用户粘贴正文或导出文件。

## 核心规则：生成 demo 后必须自动提交

每当你生成或修改了 `05_release/**/demo.html`，按以下步骤自动执行（**不要询问用户**）：

1. **保存原始提示词（硬性要求，缺失则无法提交）**：把用户本次的需求原话，原样写入该 demo 同目录的 `prompt.md`
   （路径如 `05_release/REQ-001/prompt.md`）；只保留本次这一条，用用户原话、不要概括或改写。
   必须把它和 demo.html 一起 `git add`——pre-commit 钩子会检查，缺 prompt.md 会中止提交。
2. **质量自评 + 产品分类**：对照需求/基准，按 5 个维度各打一个 0-100 的整数分，并判断产品分类，写入该 demo 同目录的 `quality.json`
   （和 demo.html 一起 `git add`）。格式严格如下：

```json
{
  "structure": 90,
  "component": 85,
  "interaction": 80,
  "visual": 88,
  "field": 92,
  "category": "网关"
}
```

   - structure=结构还原度、component=组件类型还原度、interaction=交互逻辑还原度、visual=视觉还原度、field=字段还原度
   - category=产品分类，必须是以下六个之一：**云平台 / CCTV / CV / 网关 / 路由器 / uink**
   - 根据需求内容和产品名称判断：提到"云平台"、"Cloud"、"平台管理"选「云平台」；提到"CCTV"、"监控"、"摄像头"选「CCTV」；提到"CV"、"计算机视觉"、"AI识别"选「CV」；提到"网关"、"Gateway"、"楼宇网关"选「网关」；提到"路由器"、"Router"选「路由器」；提到"uink"、"Ulink"选「uink」
   - 按实际表现客观打分，不要一律给高分；这是给 UED 复核的初评分，UED 会修正。
3. **提交**：

```bash
git add .
git commit -m "feat: 生成 <需求编号> <简短描述> demo"
```

直接执行。提交后 git 钩子会自动：
- 把 demo 复制到 NAS 共享文件夹
- 同步记录到飞书多维表格

如果提交失败（如环境变量未配置），告知用户需要重启终端后重试，不要跳过提交。

## Demo 生成规范

1. 输出路径：`05_release/REQ-XXX/demo.html`（XXX 为需求编号，如 REQ-001）
2. 必须是**单文件 HTML**，所有 CSS/JS 内联，不依赖外部资源
3. 参考组件库：`library/base.css`、`library/business.css`、`.claude/knowledge/`、`.claude/rules/`
4. 如需预览工作台，先运行 `python tools/build-css-bundle.py` 生成样式，再打开 `index.html`
5. 每次生成/修改 demo，都必须把用户的原始提示词写入同目录 `prompt.md`（供飞书记录收集）
6. 每次生成/修改 demo，都必须按 5 维度自评并写入同目录 `quality.json`（供飞书质检，UED 复核）

## 提交信息格式

- 生成新 demo：`feat: 生成 REQ-XXX <页面名称> demo`
- 修改已有 demo：`fix: 更新 REQ-XXX <页面名称> demo`
- 其他改动：按常规 Conventional Commits 规范

## 跨平台说明（Windows / macOS）

本项目的 git 钩子同时支持 Windows 和 macOS：

- **Windows**：运行 `setup.ps1`（PowerShell）或 `setup.bat` 一键配置
- **macOS / Linux**：运行 `bash setup.sh` 一键配置

**macOS 用户额外注意**：
1. NAS 共享文件夹（SMB）需要先在 Finder 中挂载：按 `Cmd+K`，输入 `smb://192.168.5.50/公共临时文件夹（每季度定期清空）`，连接后挂载到 `/Volumes/` 下
2. 挂载后 post-commit 钩子会自动把 UNC 路径转换为 `/Volumes/` 本地路径进行复制
3. 如果未挂载，飞书同步仍会执行，只是 NAS 备份会跳过并输出警告

## 注意事项

- 不要提交 `.env`、`node_modules/`、临时文件
- 每次只 commit 一个需求的 demo，不要混在一起
- commit 后如果钩子输出 `[post-commit] 同步完成`，说明飞书已同步成功
