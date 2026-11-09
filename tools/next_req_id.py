#!/usr/bin/env python3
"""REQ 编号取号与占用裁定工具。

权威源（2026-11-09 用户裁定）：REQ 编号唯一权威源 = 飞书多维表格「UI Demo 记录」表；
新 demo 进飞书时做「新增编号」操作（查表格已占编号取 max+1）；
demo 是否入 git 与编号无关——git 远程 / 本地 05_release/ 目录不再作为取号依据。

用法：
    python tools/next_req_id.py              # 打印下一个可用编号（表格 max+1）
    python tools/next_req_id.py --json       # JSON 输出：{"next": "REQ-021", "occupied": [...]}

    python tools/next_req_id.py --check REQ-020 --generator youxh [--prompt-file xx]
        # 占用裁定（先占先得）：编号在表格里被其他生成人/其他提示词的记录先占
        # → stdout 打印裁定后的新编号；未被占用或属本管线 → 打印原编号。
        # 查询失败（无 lark-cli / 网络失败）→ 打印原编号并警告，不阻断同步。
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

# 与 tools/sync_demo_to_feishu.py / tools/backfill_demo_components.sh 一致的团队内置配置
DEFAULT_BASE_TOKEN = "F2MebgSgMaUZSbseUWLcefqbnKd"
DEFAULT_DEMO_TABLE = "tbln6WxfFJ6iYaek"

REQ_RE = re.compile(r"REQ-(\d+)")


def _txt(v):
    if isinstance(v, list):
        return " ".join(
            str(x.get("text", x) if isinstance(x, dict) else x) for x in v
        )
    return "" if v is None else str(v)


def fetch_occupied_rows(base_token=DEFAULT_BASE_TOKEN, table_id=DEFAULT_DEMO_TABLE):
    """拉全表记录，返回 [{req, gen, prompt}]；失败返回 None（不抛异常）。"""
    if not subprocess.run(
        ["which", "lark-cli"], capture_output=True
    ).stdout.strip():
        return None
    # lark-cli 输出路径只允许 cwd / /tmp / ~/files，系统 TMPDIR(/var/folders) 会被拒
    out = f"/tmp/next_req_id_{os.getpid()}.ndjson"
    Path(out).unlink(missing_ok=True)
    try:
        res = subprocess.run(
            [
                "lark-cli", "base", "+record-list",
                "--base-token", base_token,
                "--table-id", table_id,
                "--format", "ndjson",
                "--output", out,
                "--as", "user",
            ],
            capture_output=True, text=True, timeout=60,
        )
        if res.returncode != 0:
            return None
        rows = []
        for line in Path(out).read_text(encoding="utf-8").splitlines():
            try:
                r = json.loads(line)
            except json.JSONDecodeError:
                continue
            req = _txt(r.get("需求编号")).strip()
            if not req:
                continue
            rows.append(
                {"req": req, "gen": _txt(r.get("生成人")).strip(), "prompt": _txt(r.get("提示词"))}
            )
        return rows
    except Exception:
        return None
    finally:
        try:
            Path(out).unlink()
        except OSError:
            pass


def next_req_id(rows):
    """全表 max+1。"""
    nums = [int(m.group(1)) for r in rows for m in [REQ_RE.search(r["req"])] if m]
    return f"REQ-{(max(nums) + 1) if nums else 1:03d}"


def arbitrate(req_id, generator, prompt, rows):
    """占用裁定（先占先得）。

    返回 (final_req_id, note)：
    - 表格无该编号                → 原编号（新增编号）
    - 该编号已有记录属本生成人     → 原编号（同号更新）
    - 该编号已有记录、提示词匹配   → 原编号（同 demo 协作/换机场景）
    - 该编号已被他人先占且提示词不同 → 全表 max+1（先占者保号）
    """
    occ = [r for r in rows if r["req"] == req_id]
    if not occ:
        return req_id, "编号未被占用，直接使用"
    if generator and any(r["gen"] == generator for r in occ):
        return req_id, "本生成人在该编号下已有记录，同号更新"
    head = (prompt or "").strip()[:40]
    if head and any(head in r["prompt"] for r in occ):
        return req_id, "提示词与该编号既有记录匹配，同号更新"
    holders = "、".join(sorted({r["gen"] or "（空）" for r in occ}))
    new_id = next_req_id(rows)
    if new_id == req_id:  # 理论不可达（occ 非空则 max>=该编号），防御
        return req_id, "裁定异常，保持原编号"
    return new_id, f"{req_id} 已被生成人（{holders}）先占，按多维表格先占先得裁定"


def main():
    ap = argparse.ArgumentParser(description="REQ 编号取号与占用裁定（权威源=飞书多维表格）")
    ap.add_argument("--json", action="store_true", help="JSON 输出 next + occupied")
    ap.add_argument("--check", metavar="REQ-ID", help="裁定该编号是否被他人先占")
    ap.add_argument("--generator", default="", help="当次生成人（git 作者名）")
    ap.add_argument("--prompt-file", default="", help="prompt.md 路径（协作场景同号判定）")
    args = ap.parse_args()

    rows = fetch_occupied_rows()
    if rows is None:
        print("[编号裁定] 警告：无法查询多维表格（无 lark-cli 或查询失败）", file=sys.stderr)
        if args.check:
            print(args.check)  # 查不到就保持原编号，不阻断同步
            return
        sys.exit(1)

    if args.check:
        prompt = ""
        if args.prompt_file:
            try:
                prompt = Path(args.prompt_file).read_text(encoding="utf-8")
            except OSError:
                pass
        final, note = arbitrate(args.check, args.generator, prompt, rows)
        print(note, file=sys.stderr)
        print(final)
        return

    nxt = next_req_id(rows)
    if args.json:
        print(json.dumps({"next": nxt, "occupied": sorted({r["req"] for r in rows})}, ensure_ascii=False))
    else:
        print(nxt)


if __name__ == "__main__":
    main()
