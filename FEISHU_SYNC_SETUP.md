# UI Demo 自动同步飞书多维表格 — 配置说明

## 功能

每次生成 UI demo 并 git commit 后，自动完成：
1. 把 demo.html 复制到公司 NAS 共享文件夹
2. 在飞书多维表格新增一条记录（含名称、描述、预览路径、生成人、版本号等）

与 AI 工具无关，Codex / Claude Code / Cursor / Windsurf 等均可使用。

---

## 新人一次性配置（约 10 分钟）

### 1. 安装 Git
未安装则前往 https://git-scm.com 下载安装。

### 2. 克隆项目
```bash
git clone https://github.com/AXhui/Feishu-competition.git
cd Feishu-competition
```

### 3. 设置 git 钩子
```bash
git config core.hooksPath .githooks
```

### 4. 设置环境变量（PowerShell 执行，永久生效）
```powershell
[Environment]::SetEnvironmentVariable("FEISHU_WEBHOOK_URL", "https://milesight.feishu.cn/base/workflow/webhook/event/ShLZa9qoWwcCBihQSjccAlV5nEd", "User")
[Environment]::SetEnvironmentVariable("FEISHU_WEBHOOK_TOKEN", "Uq7RWQID5Ht8mpGjvJg5ESG7", "User")
[Environment]::SetEnvironmentVariable("FEISHU_DEMO_BASE_URL", "\\192.168.5.50\公共临时文件夹（每季度定期清空）\chenwk\UI_demo", "User")
```

### 5. 生成样式文件
```bash
python tools/build-css-bundle.py
```

### 6. 重启终端
环境变量需要重启终端后生效。

---

## 日常使用

1. 用任意 AI 工具打开项目，给 PRD 文档
2. AI 会自动生成 demo 到 `05_release/REQ-编号/demo.html`，并自动 git commit（规则见 `AGENTS.md`）
3. commit 后自动同步到飞书，无需手动操作

> 如果 AI 没有自动 commit，手动执行：
> ```bash
> git add .
> git commit -m "feat: 生成 REQ-XXX 页面名称 demo"
> ```

---

## 查看 demo

飞书表格里的「预览 URL」是 NAS 网络路径（`\\192.168.5.50\...`），复制到文件资源管理器地址栏即可打开。

飞书表格地址：https://milesight.feishu.cn/base/F2MebgSgMaUZSbseUWLcefqbnKd

---

## 文件说明

| 文件 | 位置 | 作用 |
|------|------|------|
| `AGENTS.md` | 根目录 | AI 工具自动读取，规定生成 demo 后自动 commit |
| `.githooks/post-commit` | `.githooks/` | git 钩子，commit 后自动复制文件到 NAS 并同步飞书 |
| `tools/sync_demo_to_feishu.py` | `tools/` | 同步脚本，被钩子调用 |
| `FEISHU_SYNC_SETUP.md` | 根目录 | 本配置说明 |
| `.claude/agents/ued-a6-quality-recorder.md` | `.claude/agents/` | Claude Code 的 A6 agent，含同步步骤 |

---

## 常见问题

**Q: commit 后提示缺少 FEISHU_WEBHOOK_URL？**
A: 环境变量没生效，重启终端即可。

**Q: 预览 URL 为空？**
A: 检查 FEISHU_DEMO_BASE_URL 环境变量是否设置，且终端已重启。

**Q: 换了 AI 工具还能用吗？**
A: 可以。同步靠 git 钩子，与 AI 工具无关。AGENTS.md 是通用规范，所有主流 AI 编程工具都会读取。

**Q: 想改成可点击的 HTTP 链接？**
A: 需要 IT 在群晖 NAS 上开启 Web Station，把 UI_demo 目录设为网页根目录，然后把 FEISHU_DEMO_BASE_URL 改成 http:// 地址，并把飞书表格的「预览 URL」字段改回链接类型。
