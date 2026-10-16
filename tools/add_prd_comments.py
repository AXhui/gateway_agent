#!/usr/bin/env python3
"""
把 review 评论以「锚定到原文段落」的方式发到飞书 PRD 文档。

原理：
1. 拉取 PRD 文档的 XML（带 block_id）
2. 对每条评论，用它引用的原文片段（quote）去匹配最相关的 block
3. 用 lark-cli drive +add-comment --block-id <id> 把评论挂到那个段落上
4. 匹配不到的 fallback 到全文评论（文档底部），不报错

用法：
    python tools/add_prd_comments.py \
        --doc "https://milesight.feishu.cn/docx/xxxx" \
        --comments comments.json

comments.json 格式：
[
  {
    "quote": "8位十六进制",
    "comment": "Relay ID 位数不一致：PRD 写 8 位，但图例是 16 位，建议明确位数。"
  }
]
"""

import argparse
import json
import re
import subprocess
import sys
import html as html_mod


def extract_token(url_or_token: str) -> str:
    m = re.search(r"/(?:wiki|docx|docs)/([A-Za-z0-9]+)", url_or_token)
    return m.group(1) if m else url_or_token.strip()


def fetch_doc_xml(doc: str) -> str:
    cmd = [
        "lark-cli", "docs", "+fetch",
        "--doc", doc,
        "--doc-format", "xml",
        "--detail", "with-ids",
        "--as", "user",
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if proc.returncode != 0:
        print(f"[错误] 拉取文档失败: {proc.stderr}", file=sys.stderr)
        sys.exit(1)
    data = json.loads(proc.stdout)
    if not data.get("ok"):
        print(f"[错误] 拉取文档失败: {data}", file=sys.stderr)
        sys.exit(1)
    return data["data"]["document"]["content"]


def strip_tags(xml_text: str) -> str:
    """去掉 XML 标签，只保留纯文本。"""
    no_tags = re.sub(r"<[^>]+>", "", xml_text)
    return html_mod.unescape(no_tags).strip()


def parse_blocks(xml_content: str):
    """解析 XML，返回 [(block_id, 纯文本), ...]，按文档顺序。"""
    blocks = []
    # 匹配所有带 id 的块级元素：<p id="...">...</p>、<h1 id="...">...</h1> 等
    for m in re.finditer(r'<(?:p|h[1-6]|li|td|th|pre|callout|blockquote)[^>]*\sid="([^"]+)"[^>]*>(.*?)</(?:p|h[1-6]|li|td|th|pre|callout|blockquote)>', xml_content, re.DOTALL):
        bid = m.group(1)
        text = strip_tags(m.group(2))
        if text:
            blocks.append((bid, text))
    return blocks


def find_block_for_quote(quote: str, blocks) -> str | None:
    """根据引用的原文片段，找最匹配的 block_id。"""
    # 清理 quote：去掉首尾引号、多余空格
    q = quote.strip().strip("\"'「」""''").strip()
    if not q:
        return None
    # 取前 10 个有意义字符做匹配（避免太长不准）
    q_key = re.sub(r"\s+", "", q)
    if len(q_key) > 30:
        q_key = q_key[:30]

    best_bid = None
    best_score = 0
    for bid, text in blocks:
        t_key = re.sub(r"\s+", "", text)
        if q_key in t_key:
            # 完全包含，分数最高
            return bid
        # 部分包含：取最长公共子串长度
        for i in range(len(q_key), 4, -1):
            if q_key[:i] in t_key:
                if i > best_score:
                    best_score = i
                    best_bid = bid
                break
    return best_bid if best_score >= 6 else None


def add_comment(doc: str, block_id: str | None, comment_text: str) -> bool:
    cmd = [
        "lark-cli", "drive", "+add-comment",
        "--doc", doc,
        "--content", json.dumps([
            {
                "type": "text",
                "text": {"content": comment_text}
            }
        ], ensure_ascii=False),
        "--as", "user",
    ]
    if block_id:
        cmd.extend(["--block-id", block_id])
    else:
        cmd.append("--full-comment")

    proc = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if proc.returncode != 0:
        print(f"  [失败] {proc.stderr[:200]}", file=sys.stderr)
        return False
    try:
        data = json.loads(proc.stdout)
        if not data.get("ok"):
            print(f"  [失败] {data.get('error', data)}", file=sys.stderr)
            return False
    except json.JSONDecodeError:
        pass
    return True


def main():
    parser = argparse.ArgumentParser(description="把 review 评论锚定到 PRD 原文段落")
    parser.add_argument("--doc", required=True, help="飞书 PRD 文档 URL 或 token")
    parser.add_argument("--comments", required=True, help="评论 JSON 文件路径")
    args = parser.parse_args()

    with open(args.comments, "r", encoding="utf-8") as f:
        comments = json.load(f)

    print(f"[1/3] 拉取 PRD 文档...")
    xml = fetch_doc_xml(args.doc)
    blocks = parse_blocks(xml)
    print(f"  共解析到 {len(blocks)} 个段落")

    print(f"[2/3] 匹配评论到对应段落...")
    anchored = 0
    fallback = 0
    for i, c in enumerate(comments, 1):
        quote = c.get("quote", "")
        text = c.get("comment", "")
        bid = find_block_for_quote(quote, blocks)
        if bid:
            print(f"  [{i}] ✓ 锚定到段落 {bid}  (引用: {quote[:30]}...)")
            anchored += 1
        else:
            print(f"  [{i}] ⚠ 未匹配到段落，fallback 到全文评论  (引用: {quote[:30]}...)")
            fallback += 1
        # 发评论
        ok = add_comment(args.doc, bid, f"🔍 AI Demo Review: {text}")
        if ok:
            print(f"      评论已发送")
        else:
            print(f"      发送失败", file=sys.stderr)

    print(f"[3/3] 完成：锚定 {anchored} 条，fallback {fallback} 条，共 {len(comments)} 条")


if __name__ == "__main__":
    main()
