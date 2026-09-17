#!/usr/bin/env python3
"""
上传 demo.html 到飞书云空间，生成可在线预览的链接。

用法：
  python tools/upload_demo_to_feishu.py \
    --demo-file 05_release/REQ-005/demo.html \
    --req-id REQ-005 \
    --version 01 \
    --folder-token JZeofZysclhJKbd2UCzcAiKDn5d

输出：飞书云空间文件 URL（stdout），失败时输出空串。
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
import tempfile


def resolve_lark_cli():
    """返回可由 subprocess 直接执行的 lark-cli 路径。

    Windows 下 npm 会生成 lark-cli.cmd；Python subprocess 在 shell=False
    且传入 "lark-cli" 时不会稳定套用这个 .cmd shim，所以需要先解析完整路径。
    """
    candidates = [
        os.environ.get("LARK_CLI"),
        shutil.which("lark-cli"),
        shutil.which("lark-cli.cmd"),
        os.path.expandvars(r"%APPDATA%\npm\lark-cli.cmd"),
    ]
    for candidate in candidates:
        if candidate and os.path.isfile(candidate):
            return candidate
    return "lark-cli"


def run_cmd(args, capture_output=True):
    """执行命令，返回 (returncode, stdout, stderr)
    明确传递当前进程环境变量，确保 lark-cli 能找到用户配置（USERPROFILE/HOME）。
    某些 AI 工具（Codex/Claude Code）的子进程环境可能会重置这些变量。
    """
    env = os.environ.copy()
    # 确保 USERPROFILE 和 HOME 指向当前用户目录
    user_home = os.path.expanduser("~")
    if not env.get("USERPROFILE"):
        env["USERPROFILE"] = user_home
    if not env.get("HOME"):
        env["HOME"] = user_home
    try:
        result = subprocess.run(
            args,
            capture_output=capture_output,
            text=True,
            timeout=120,
            encoding="utf-8",
            errors="replace",
            env=env,
        )
        return result.returncode, result.stdout, result.stderr
    except Exception as e:
        return -1, "", str(e)


def main():
    parser = argparse.ArgumentParser(description="上传 demo 到飞书云空间")
    parser.add_argument("--demo-file", required=True, help="本地 demo.html 路径")
    parser.add_argument("--req-id", required=True, help="需求编号，如 REQ-005")
    parser.add_argument("--version", required=True, help="版本号，如 01")
    parser.add_argument("--folder-token", required=True, help="飞书云空间文件夹 token")
    args = parser.parse_args()

    # 调试信息：打印环境变量和 lark-cli 路径，方便排查子进程环境问题
    lark_cli_path = resolve_lark_cli()
    print(f"[upload] 调试：lark-cli 路径 = {lark_cli_path}", file=sys.stderr)
    print(f"[upload] 调试：USERPROFILE = {os.environ.get('USERPROFILE', '(未设置)')}", file=sys.stderr)
    print(f"[upload] 调试：HOME = {os.environ.get('HOME', '(未设置)')}", file=sys.stderr)
    print(f"[upload] 调试：expanduser('~') = {os.path.expanduser('~')}", file=sys.stderr)

    if not os.path.isfile(args.demo_file):
        print(f"[upload] 错误：文件不存在 {args.demo_file}", file=sys.stderr)
        return ""

    # 1. 复制到临时目录，重命名为 REQ-XXX_vYY.html
    file_name = f"{args.req_id}_v{args.version}.html"
    temp_dir = tempfile.gettempdir()
    temp_path = os.path.join(temp_dir, file_name)
    try:
        shutil.copy2(args.demo_file, temp_path)
    except Exception as e:
        print(f"[upload] 错误：复制到临时目录失败 {e}", file=sys.stderr)
        return ""

    # 2. 上传到飞书云空间
    upload_cmd = [
        lark_cli_path, "drive", "+upload",
        "--file", temp_path,
        "--folder-token", args.folder_token,
        "--name", file_name,
        "--as", "user",
    ]
    print(f"[upload] 调试：执行命令 = {' '.join(upload_cmd)}", file=sys.stderr)
    rc, stdout, stderr = run_cmd(upload_cmd)
    if rc != 0:
        print(f"[upload] 错误：上传失败 rc={rc}", file=sys.stderr)
        print(f"[upload] 错误：stdout = {stdout[:500]}", file=sys.stderr)
        print(f"[upload] 错误：stderr = {stderr[:500]}", file=sys.stderr)
        # 清理临时文件
        try:
            os.remove(temp_path)
        except Exception:
            pass
        return ""

    # 解析上传结果
    try:
        result = json.loads(stdout)
        if not result.get("ok"):
            print(f"[upload] 错误：上传返回失败 {result}", file=sys.stderr)
            return ""
        file_token = result["data"]["file_token"]
        file_url = result["data"]["url"]
    except (json.JSONDecodeError, KeyError) as e:
        print(f"[upload] 错误：解析上传结果失败 {e}", file=sys.stderr)
        print(stdout[:500], file=sys.stderr)
        return ""

    # 3. 设置链接分享权限为"组织内获得链接的人可阅读"
    perm_json = os.path.join(temp_dir, f"perm_{file_token}.json")
    try:
        with open(perm_json, "w", encoding="utf-8") as f:
            json.dump({"link_share_entity": "tenant_readable"}, f)
    except Exception as e:
        print(f"[upload] 警告：写权限 JSON 失败 {e}", file=sys.stderr)
        perm_json = None

    if perm_json:
        perm_cmd = [
            lark_cli_path, "drive", "permission.public", "patch",
            "--token", file_token,
            "--type", "file",
            "--data", f"@{perm_json}",
            "--yes",
            "--as", "user",
        ]
        rc, stdout, stderr = run_cmd(perm_cmd)
        # 权限设置失败不影响上传结果，只是链接可能访问不了
        if rc != 0:
            print(f"[upload] 警告：设置分享权限失败 rc={rc}", file=sys.stderr)
            print((stderr or stdout)[:300], file=sys.stderr)
        # 清理权限 JSON
        try:
            os.remove(perm_json)
        except Exception:
            pass

    # 4. 清理临时文件
    try:
        os.remove(temp_path)
    except Exception:
        pass

    print(f"[upload] 成功：{file_url}", file=sys.stderr)
    # 输出 URL 到 stdout（供 post-commit 捕获）
    print(file_url)
    return file_url


if __name__ == "__main__":
    main()
