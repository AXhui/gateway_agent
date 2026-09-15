#!/usr/bin/env bash
# 一键配置脚本（macOS / Linux）
# 用法：在仓库根目录执行  bash setup.sh
#
# 功能：
#   1. 设置 git hooks 路径为 .githooks（commit 后自动同步飞书）
#   2. 检查必要环境变量（飞书 Webhook、NAS 路径）
#   3. 提示 Mac 用户如何挂载 SMB 共享

set -e

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
cd "$REPO_ROOT"

echo "========================================"
echo "  Feishu Demo Sync - macOS/Linux 配置"
echo "========================================"
echo ""

# 1. 设置 git hooks 路径
git config core.hooksPath .githooks
echo "[1/3] git hooks 路径已设置为 .githooks"

# 给钩子加执行权限（Mac/Linux 需要）
chmod +x .githooks/post-commit .githooks/pre-commit 2>/dev/null || true
echo "      钩子执行权限已添加"

# 2. 检查环境变量
echo ""
echo "[2/3] 检查环境变量..."

MISSING=""
[ -z "$FEISHU_WEBHOOK_URL" ] && MISSING="$MISSING  FEISHU_WEBHOOK_URL\n"
[ -z "$FEISHU_WEBHOOK_TOKEN" ] && MISSING="$MISSING  FEISHU_WEBHOOK_TOKEN\n"

if [ -n "$MISSING" ]; then
  echo "  缺少以下环境变量，请先配置："
  printf "$MISSING"
  echo ""
  echo "  配置方法（写入 ~/.zshrc 或 ~/.bash_profile）："
  echo '    export FEISHU_WEBHOOK_URL="https://milesight.feishu.cn/base/workflow/webhook/event/ShLZa9qoWwcCBihQSjccAlV5nEd"'
  echo '    export FEISHU_WEBHOOK_TOKEN="Uq7RWQID5Ht8mpGjvJg5ESG7"'
  echo '    export FEISHU_DEMO_BASE_URL="\\192.168.5.50\公共临时文件夹（每季度定期清空）\chenwk\UI_demo"'
  echo ""
  echo "  配置完后执行：source ~/.zshrc（或重启终端）"
else
  echo "  飞书 Webhook 环境变量已配置"
fi

# 3. Mac SMB 挂载提示
echo ""
echo "[3/3] NAS 共享文件夹（Mac 专属）"
if [[ "$(uname)" == "Darwin" ]]; then
  echo "  Mac 访问 SMB 共享需要先挂载："
  echo "    1. Finder 中按 Cmd+K"
  echo '    2. 输入：smb://192.168.5.50/公共临时文件夹（每季度定期清空）'
  echo "    3. 连接后挂载到 /Volumes/ 下"
  echo ""
  echo "  挂载后 post-commit 会自动把 UNC 路径转换为 /Volumes/ 路径"
  echo "  无需额外配置"
else
  echo "  当前不是 macOS，跳过 SMB 挂载提示"
fi

echo ""
echo "========================================"
echo "  配置完成！"
echo "========================================"
echo ""
echo "  现在用 Claude Code / Cursor / Codex 等工具生成 demo 后，"
echo "  commit 时会自动同步到飞书多维表格。"
echo ""
