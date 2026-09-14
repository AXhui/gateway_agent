#!/usr/bin/env python3
"""
拉取飞书文档（wiki / docx / docs）为 Markdown，供 Claude Code / Codex / Cursor 等本地 AI 读取。

背景：飞书文档需要登录，AI 自带的网页抓取（webReader）只能拿到登录页；
本工具复用本机已登录的 lark-cli，因此能读到真实正文。

用法：
    # 直接打印 Markdown 到终端
    python tools/fetch_feishu_doc.py "https://milesight.feishu.cn/wiki/xxxx?from=from_copylink"

    # 保存到文件
    python tools/fetch_feishu_doc.py "<飞书链接或token>" --out prd.md

前置：本机已安装并登录 lark-cli（跑过一次 setup 即可）。
"""

import argparse
import json
import re
import subprocess
import sys


def extract_token(arg: str) -> str:
    """从飞书 URL 提取文档 token；若本身就是 token 则原样返回。"""
    m = re.search(r"/(?:wiki|docx|docs)/([A-Za-z0-9]+)", arg)
    if m:
        return m.group(1)
    return arg.strip()


def fetch_markdown(token: str) -> str:
    """调用 lark-cli 拉取文档，返回 Markdown 正文。"""
    cmd = [
        "lark-cli", "docs", "+fetch",
        "--doc", token,
        "--doc-format", "markdown",
        "--as", "user",
    ]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    except FileNotFoundError:
        print(
            "[错误] 未找到 lark-cli。请先安装并在本机登录（项目根目录运行 setup）。",
            file=sys.stderr,
        )
        sys.exit(2)

    if proc.returncode != 0:
        print(f"[错误] lark-cli 执行失败: {proc.stderr}", file=sys.stderr)
        sys.exit(1)

    try:
        data = json.loads(proc.stdout)
    except json.JSONDecodeError:
        print(f"[错误] 无法解析 lark-cli 输出: {proc.stdout[:300]}", file=sys.stderr)
        sys.exit(1)

    if not data.get("ok"):
        print(f"[错误] 拉取失败（可能未登录或无权限）: {data}", file=sys.stderr)
        sys.exit(1)

    return data["data"]["document"]["content"]


def main():
    parser = argparse.ArgumentParser(description="拉取飞书文档为 Markdown")
    parser.add_argument("doc", help="飞书文档 URL（wiki/docx/docs）或 token")
    parser.add_argument("--out", default="", help="可选：保存到该文件路径")
    args = parser.parse_args()

    token = extract_token(args.doc)
    markdown = fetch_markdown(token)

    if args.out:
        with open(args.out, "w", encoding="utf-8") as f:
            f.write(markdown)
        print(f"[完成] 已保存 {len(markdown)} 字符到 {args.out}", file=sys.stderr)
    else:
        sys.stdout.write(markdown)


if __name__ == "__main__":
    main()
