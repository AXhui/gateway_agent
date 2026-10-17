#!/usr/bin/env bash
# 打包产品侧 agent 只读快照：VS Code + Claude Code 插件即开即用，无需 GitHub。
# 产物落在 output/（gitignored），并同步 latest 到 NAS 固定分发位，产品用内置 update 脚本一键拉新。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DATE=$(date +%Y%m%d)
OUT="$ROOT/output/agent-snapshot-$DATE.zip"
NAS_SHARE="/Volumes/公共临时文件夹（每季度定期清空）"
NAS_DIR="$NAS_SHARE/chenwk/agent-snapshot"
STAGE_PARENT="$(mktemp -d)"
STAGE="$STAGE_PARENT/agent-snapshot"
trap 'rm -rf "$STAGE_PARENT"' EXIT

mkdir -p "$STAGE"
rsync -a \
  --exclude 'settings.json' \
  --exclude 'settings.local.json' \
  --exclude '.DS_Store' \
  "$ROOT/.claude/" "$STAGE/.claude/"
rsync -a --exclude '.DS_Store' "$ROOT/library/" "$STAGE/library/"
rsync -a --exclude '.DS_Store' "$ROOT/assets/" "$STAGE/assets/"

# 产品版 settings：封死资产层写入（产物写在根目录/工作目录不受影响）
cat > "$STAGE/.claude/settings.json" <<'EOF'
{
  "permissions": {
    "deny": [
      "Edit(.claude/**)",
      "Write(.claude/**)",
      "Edit(library/**)",
      "Write(library/**)",
      "Edit(assets/**)",
      "Write(assets/**)"
    ]
  }
}
EOF

# macOS 一键更新：从 NAS 拉最新包覆盖资产层，不动产品自己的产物
cat > "$STAGE/update-mac.command" <<'EOF'
#!/bin/bash
# 双击即可更新 agent 资产库（从公司 NAS 拉最新包）
cd "$(dirname "$0")"
SRC="/Volumes/公共临时文件夹（每季度定期清空）/chenwk/agent-snapshot/agent-snapshot-latest.zip"
if [ ! -f "$SRC" ]; then
  echo "NAS 未挂载，正在请求挂载……请在弹出的 Finder 里点「连接」"
  open 'smb://192.168.5.50/公共临时文件夹（每季度定期清空）'
  read -p "连接完成后按回车重试（或直接关窗口手动重跑）..."
  [ -f "$SRC" ] || { echo "仍未找到更新包（检查是否连上公司网络/VPN）"; read -p "按回车退出..."; exit 1; }
fi
TMP=$(mktemp -d)
unzip -q "$SRC" -d "$TMP"
rsync -a --delete "$TMP/agent-snapshot/.claude/" .claude/
rsync -a --delete "$TMP/agent-snapshot/library/" library/
rsync -a --delete "$TMP/agent-snapshot/assets/" assets/
cp -f "$TMP/agent-snapshot/CLAUDE.md" "$TMP/agent-snapshot/产品使用说明.md" . 2>/dev/null || true
rm -rf "$TMP"
echo ""
echo "✅ 更新完成 $(date '+%Y-%m-%d %H:%M')"
read -p "按回车关闭窗口..."
EOF
chmod +x "$STAGE/update-mac.command"

# Windows 一键更新
cat > "$STAGE/update-win.bat" <<'EOF'
@echo off
chcp 65001 >nul
set SRC=\\192.168.5.50\公共临时文件夹（每季度定期清空）\chenwk\agent-snapshot\agent-snapshot-latest.zip
if not exist "%SRC%" (
  echo 找不到 NAS 更新包，请先连上公司网络/VPN 后重试
  pause & exit /b 1
)
powershell -NoProfile -Command "Expand-Archive -Force '%SRC%' \"$env:TEMP\\agent-snap-update\""
xcopy /e /y /i "%TEMP%\agent-snap-update\agent-snapshot\.claude" ".claude\" >nul
xcopy /e /y /i "%TEMP%\agent-snap-update\agent-snapshot\library" "library\" >nul
xcopy /e /y /i "%TEMP%\agent-snap-update\agent-snapshot\assets" "assets\" >nul
copy /y "%TEMP%\agent-snap-update\agent-snapshot\CLAUDE.md" . >nul
echo.
echo 更新完成 %date% %time%
pause
EOF

# Claude 自动读取的项目指令（产品侧入口）
cat > "$STAGE/CLAUDE.md" <<'EOF'
# 产品侧 Agent 使用入口

这是 Milesight UED agent 资产库的只读快照，供产品同学调用，不含 git 历史。

- 你的职责：帮用户调用 `.claude/agents/` 里的 agent 链——A0 PRD 三角色拆解、UED 链 A1-A8、DEV 链 D1-D5、测试链 T1-T4、function-interaction-composer 等——按各 agent 自身说明分派，不自己重新实现。
- `.claude/`、`library/`、`assets/` 是只读资产（权限层已封写），不要修改，也不要用 Bash 绕过写入。
- agent 产物（03-ued.md、04-dev.md、05-test.md、demo.html 等）写在仓库根目录或当次工作目录。
- 本目录没有 git：不要执行任何 git 提交/推送；每次任务完成后，提醒用户把生成的产物文件发给 UED 同学归档。
- 用户说人话即可，由你判断分派到哪条 agent 链；不确定时先列出可选 agent 让用户选。
EOF

# 人类阅读的使用说明
cat > "$STAGE/产品使用说明.md" <<'EOF'
# 产品同学使用说明（3 步上手）

1. 解压本文件夹到任意位置，用 VS Code「打开文件夹」打开它
2. VS Code 扩展市场装 **Claude Code** 插件，用公司 Claude 账号登录（一次性）
3. 打开 Claude 面板直接说需求，例如：
   - 「帮我拆解这份 PRD：<粘贴正文>」→ 跑 A0 三角色拆解
   - 「把这个需求出成可交互 demo」→ 跑 UED 链
   - 「这个功能模块出交互编排」→ function-interaction-composer

## 资产库更新（UED 发新版后）

双击本目录里的更新脚本，10 秒拉新，**不影响你自己生成的产物文件**：

- macOS：双击 `update-mac.command`（首次若提示无法执行：右键 → 打开）
- Windows：双击 `update-win.bat`（需连公司网络/VPN）

## 说明

- agent 产物是你本地这个文件夹里的新文件；完成后按 Claude 提示发给 UED 同学归档
- `.claude/`、`library/`、`assets/` 是只读资产，改不了也不用改
EOF

mkdir -p "$ROOT/output"
rm -f "$OUT"
(cd "$STAGE_PARENT" && zip -qr "$OUT" "agent-snapshot")
echo "打包完成: $OUT ($(du -h "$OUT" | cut -f1))"

# 同步 latest 到 NAS 固定分发位（未挂载只提示，不失败）
if [ -d "$NAS_SHARE" ]; then
  mkdir -p "$NAS_DIR"
  cp -f "$OUT" "$NAS_DIR/agent-snapshot-latest.zip"
  echo "已同步 NAS: $NAS_DIR/agent-snapshot-latest.zip"
else
  echo "[提示] NAS 未挂载，latest 未上传——Finder 按 Cmd+K 挂载 smb://192.168.5.50/公共临时文件夹（每季度定期清空） 后重跑本脚本"
fi
