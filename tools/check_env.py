#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
环境自检脚本 —— 首次获取 gateway_agent 后运行，检查本机环境是否达标。

用法（仓库根目录下执行）：
    python tools/check_env.py

检查项：
  1. Git 是否安装
  2. 当前目录是否为 git 仓库
  3. git 钩子是否已配置（core.hooksPath = .githooks）
  4. git 姓名/邮箱是否设置（飞书表格「生成人」显示的就是它）
  5. Python 是否可用
  6. lark-cli 是否安装（用于上传飞书云空间，生成可点开的预览链接）
  7. lark-cli 是否已登录

每项输出 ✅ 达标 / ❌ 未达标，未达标项会给出修复操作提示。
全部达标显示「环境就绪」；有未达标项显示「需要处理」，请按提示操作后重跑本脚本。
"""

import json
import shutil
import subprocess
import sys

GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
RESET = "\033[0m"

# Windows 终端可能不支持 ANSI 颜色，自动降级
if sys.platform == "win32":
    try:
        import ctypes

        kernel32 = ctypes.windll.kernel32
        kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
    except Exception:
        GREEN = RED = YELLOW = RESET = ""


def run(cmd, timeout=30):
    """执行命令，返回 (exit_code, stdout, stderr)"""
    try:
        proc = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )
        return proc.returncode, proc.stdout.strip(), proc.stderr.strip()
    except subprocess.TimeoutExpired:
        return -1, "", "timeout"
    except Exception as e:  # noqa: BLE001
        return -1, "", str(e)


def ok(msg):
    print(f"{GREEN}  ✅ {msg}{RESET}")


def fail(msg, hint):
    print(f"{RED}  ❌ {msg}{RESET}")
    print(f"{YELLOW}     修复：{hint}{RESET}")


def warn(msg, hint):
    print(f"{YELLOW}  ⚠️  {msg}{RESET}")
    print(f"{YELLOW}     提示：{hint}{RESET}")


def main():
    print("=" * 60)
    print("  gateway_agent 环境自检")
    print("=" * 60)

    issues = 0

    # 1. Git 是否安装
    print("\n[1/7] 检查 Git...")
    git = shutil.which("git")
    if git:
        code, out, _ = run("git --version")
        ok(out or "Git 已安装")
    else:
        issues += 1
        fail("未检测到 Git", "请先安装 Git：https://git-scm.com/download/win （macOS：brew install git）")

    # 2. 当前目录是否为 git 仓库
    print("\n[2/7] 检查项目目录...")
    code, out, _ = run("git rev-parse --show-toplevel")
    if code == 0 and out:
        ok(f"项目目录：{out}")
    else:
        issues += 1
        fail("当前目录不是 git 仓库", "请先执行：git clone git@gitlab.milesight.com:ued/gateway.git，然后进入 gateway 目录重跑本脚本")

    # 3. git 钩子是否配置
    print("\n[3/7] 检查 git 钩子...")
    code, out, _ = run("git config core.hooksPath")
    if out.strip() == ".githooks":
        ok("钩子已启用（commit 后自动同步到飞书表格 + NAS 备份）")
    else:
        issues += 1
        fail("git 钩子未启用", "执行一次：git config core.hooksPath .githooks（这是 setup.bat 做的事，Windows/Mac 通用）")

    # 4. git 姓名/邮箱
    print("\n[4/7] 检查 git 姓名/邮箱...")
    code1, name, _ = run("git config user.name")
    code2, email, _ = run("git config user.email")
    if name and email:
        ok(f"姓名：{name}｜邮箱：{email}（飞书表格「生成人」显示的就是它）")
    else:
        issues += 1
        missing = []
        if not name:
            missing.append("姓名")
        if not email:
            missing.append("邮箱")
        fail(f"未设置 git {'和'.join(missing)}", f"执行：git config user.name \"你的飞书姓名\" 和 git config user.email \"你的飞书邮箱\"（例：git config user.name 小星）")

    # 5. Python
    print("\n[5/7] 检查 Python...")
    py = sys.executable or "python"
    code, out, _ = run(f'"{py}" --version')
    if code == 0 and out:
        ok(f"Python 已安装：{out}")
    else:
        issues += 1
        fail("未检测到 Python 3", "请安装 Python 3：https://www.python.org/downloads/ （安装时勾选 Add to PATH）")

    # 6. lark-cli 是否安装
    print("\n[6/7] 检查 lark-cli...")
    lark = shutil.which("lark-cli")
    if lark:
        code, out, _ = run("lark-cli --version")
        ok(f"lark-cli 已安装：{out or '版本信息见上'}")
    else:
        issues += 1
        fail("未检测到 lark-cli", "lark-cli 用于上传飞书云空间（生成可点开的预览链接）。安装方式：npm install -g @larksuiteoapi/lark-cli（或用 npx 调用）；安装后执行 lark-cli auth login 登录")

    # 7. lark-cli 是否登录
    print("\n[7/7] 检查 lark-cli 登录状态...")
    if lark:
        code, out, _ = run("lark-cli contact +get-user --as user --format json")
        if code == 0:
            try:
                data = json.loads(out)
                user = data.get("data", {}).get("user", {})
                name = user.get("name") or user.get("en_name") or "已登录"
                ok(f"lark-cli 已登录：{name}")
            except Exception:  # noqa: BLE001
                ok("lark-cli 已登录（身份信息解析失败，但不影响使用）")
        else:
            issues += 1
            fail("lark-cli 未登录或登录已过期", "执行：lark-cli auth login（扫码/授权一次，之后自动生效）")
    else:
        issues += 1
        fail("lark-cli 未安装，无法登录", "先安装 lark-cli（见第 6 项提示），再执行 lark-cli auth login")

    # 汇总
    print("\n" + "=" * 60)
    if issues == 0:
        print(f"{GREEN}  环境就绪 ✅ 可以直接开始使用：给 AI 发 PRD → 生成 demo → 自动同步飞书{RESET}")
    else:
        print(f"{RED}  有 {issues} 项未达标，请按上面的「修复」提示操作，完成后重跑本脚本{RESET}")
    print("=" * 60)

    return 0 if issues == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
