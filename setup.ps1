# ============================================================
#  一键配置脚本 —— UI Demo 自动同步飞书多维表格
#  双击 setup.bat 运行本脚本
#
#  自动完成：
#    1. 检查 Git 是否安装
#    2. 检查当前目录是否为 git 仓库
#    3. 设置 git 钩子路径（core.hooksPath = .githooks）
#    4. 设置 git 姓名/邮箱（飞书表格「生成人」显示的就是它）
#    5. 设置环境变量（Webhook 地址 / Token / NAS 路径，永久生效）
#    6. 生成样式文件（tools/build-css-bundle.py）
#
#  支持参数（供自动化/测试）：
#    -Name "陈文昆" -Email "chenwk@milesight.com"  跳过提问直接配置
#    -DryRun                                      只演示不写入
# ============================================================

[CmdletBinding()]
param(
    [string]$Name = "",
    [string]$Email = "",
    [switch]$DryRun
)

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Write-OK($msg) {
    Write-Host "    OK  $msg" -ForegroundColor Green
}

Write-Host "=============================================" -ForegroundColor Green
Write-Host "  UI Demo 自动同步飞书 · 一键配置向导" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# ---------- 1. 检查 Git ----------
Write-Step "检查 Git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "未检测到 Git，请先安装：https://git-scm.com/download/win" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
Write-OK "Git 已安装: $(git --version)"

# ---------- 2. 检查是否 git 仓库 ----------
Write-Step "检查项目目录..."
$repoRoot = git rev-parse --show-toplevel 2>$null
if (-not $repoRoot) {
    Write-Host "当前目录不是 git 仓库。" -ForegroundColor Red
    Write-Host "请先执行：git clone https://github.com/AXhui/Feishu-competition.git" -ForegroundColor Yellow
    Write-Host "然后进入 Feishu-competition 目录重新双击 setup.bat" -ForegroundColor Yellow
    Read-Host "按回车键退出"
    exit 1
}
Write-OK "项目目录: $repoRoot"

# ---------- 3. 设置 git 钩子 ----------
Write-Step "设置 git 钩子..."
if ($DryRun) {
    Write-OK "[演示模式] 将执行: git config core.hooksPath .githooks"
} else {
    git config core.hooksPath .githooks
    Write-OK "core.hooksPath = .githooks"
}

# ---------- 4. 设置 git 姓名/邮箱 ----------
Write-Step "设置 git 姓名 / 邮箱（飞书表格「生成人」显示的就是它）..."
if (-not $Name) {
    $Name = Read-Host "请输入你的飞书姓名（例如：小星）"
}
if (-not $Email) {
    $Email = Read-Host "请输入你的飞书邮箱（例如：xiaoxing@milesight.com）"
}
if (-not $Name -or -not $Email) {
    Write-Host "姓名和邮箱不能为空，请重新运行脚本。" -ForegroundColor Red
    Read-Host "按回车键退出"
    exit 1
}
if ($DryRun) {
    Write-OK "[演示模式] 将执行: git config user.name $Name"
    Write-OK "[演示模式] 将执行: git config user.email $Email"
} else {
    git config user.name $Name
    git config user.email $Email
    Write-OK "git user.name  = $Name"
    Write-OK "git user.email = $Email"
}

# ---------- 5. 设置环境变量（永久生效） ----------
Write-Step "设置环境变量（User 级，永久生效）..."
$envVars = [ordered]@{
    "FEISHU_WEBHOOK_URL"    = "https://milesight.feishu.cn/base/workflow/webhook/event/ShLZa9qoWwcCBihQSjccAlV5nEd"
    "FEISHU_WEBHOOK_TOKEN"  = "Uq7RWQID5Ht8mpGjvJg5ESG7"
    "FEISHU_DEMO_BASE_URL"  = "\\192.168.5.50\公共临时文件夹（每季度定期清空）\chenwk\UI_demo"
}
foreach ($k in $envVars.Keys) {
    if ($DryRun) {
        Write-OK "[演示模式] 将设置 $k = $($envVars[$k])"
    } else {
        [Environment]::SetEnvironmentVariable($k, $envVars[$k], "User")
        Write-OK "$k 已设置"
    }
}

# ---------- 6. 生成样式文件 ----------
Write-Step "生成样式文件..."
if ($DryRun) {
    Write-OK "[演示模式] 将执行: python tools/build-css-bundle.py"
} else {
    $buildScript = Join-Path $repoRoot "tools\build-css-bundle.py"
    if (Test-Path $buildScript) {
        python $buildScript
        Write-OK "样式文件已生成"
    } else {
        Write-Host "警告：未找到 tools/build-css-bundle.py，跳过（不影响同步）" -ForegroundColor Yellow
    }
}

# ---------- 7. 完成 ----------
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "  配置完成！" -ForegroundColor Green
if (-not $DryRun) {
    Write-Host "  请【关闭并重新打开终端】后再使用。" -ForegroundColor Yellow
    Write-Host "  之后：给 AI 工具 PRD → 自动生成 demo → 自动 commit → 自动同步飞书" -ForegroundColor Green
}
Write-Host "=============================================" -ForegroundColor Green
Read-Host "按回车键退出"
