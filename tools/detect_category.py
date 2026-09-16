#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
产品分类自动判断工具（多层兜底）。

判断优先级（从高到低）：
1. quality.json 里的 category 字段（AI 主动判断，最准确）
2. prompt.md 关键词（用户原始提示词）
3. prd.md 关键词（PRD 文档内容，如存在）
4. commit message 关键词
5. demo 名称关键词

用法：
    python tools/detect_category.py \
        --quality-file 05_release/REQ-001/quality.json \
        --prompt-file 05_release/REQ-001/prompt.md \
        --prd-file 05_release/REQ-001/prd.md \
        --commit-msg "feat: 生成 REQ-001 网关设备管理 demo" \
        --demo-name "REQ-001 · feat: 生成网关设备管理 demo"

输出：分类名称（云平台/CCTV/CV/网关/路由器/uink），判断不出来则输出空字符串。
"""

import argparse
import json
import os
import sys


# 关键词映射：分类 -> 关键词列表（按优先级排序，越靠前越优先匹配）
CATEGORY_KEYWORDS = {
    "云平台": ["云平台", "cloud platform", "cloudplatform", "平台管理", "管理平台", "paas", "saas"],
    "CCTV": ["cctv", "监控", "摄像头", "camera", "surveillance", "视频监控", "安防"],
    "CV": ["计算机视觉", "computer vision", "ai识别", "ai 识别", "视觉识别", "图像识别", "目标检测", "人脸识别"],
    "网关": ["网关", "gateway", "楼宇网关", "边缘网关", "iot网关", "iot 网关"],
    "路由器": ["路由器", "router", "无线路由", "wifi路由", "wi-fi路由"],
    "uink": ["uink", "ulink", "u-link"],
}

# 匹配优先级：先匹配更具体的分类，避免"网关"被"网关管理"误判
# 实际上按关键词长度降序匹配即可，长关键词更具体
def detect_from_text(text: str) -> str:
    """根据文本关键词判断产品分类。"""
    if not text:
        return ""
    text_lower = text.lower()
    best_category = ""
    best_keyword_len = 0
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if kw.lower() in text_lower:
                # 长关键词优先（更具体）
                if len(kw) > best_keyword_len:
                    best_keyword_len = len(kw)
                    best_category = category
    return best_category


def main():
    parser = argparse.ArgumentParser(description="产品分类自动判断（多层兜底）")
    parser.add_argument("--quality-file", default="", help="quality.json 路径")
    parser.add_argument("--prompt-file", default="", help="prompt.md 路径")
    parser.add_argument("--prd-file", default="", help="prd.md 路径（可选）")
    parser.add_argument("--commit-msg", default="", help="commit message")
    parser.add_argument("--demo-name", default="", help="demo 名称")
    args = parser.parse_args()

    # 第1优先级：quality.json 里的 category
    if args.quality_file and os.path.isfile(args.quality_file):
        try:
            with open(args.quality_file, "r", encoding="utf-8-sig") as f:
                q = json.load(f)
            cat = q.get("category", "").strip()
            if cat and cat in CATEGORY_KEYWORDS:
                print(cat)
                return
        except Exception:
            pass

    # 合并所有文本源，按优先级拼接（前面的权重更高）
    text_parts = []

    # 第2优先级：prompt.md
    if args.prompt_file and os.path.isfile(args.prompt_file):
        try:
            with open(args.prompt_file, "r", encoding="utf-8-sig") as f:
                text_parts.append(f.read())
        except Exception:
            pass

    # 第3优先级：prd.md
    if args.prd_file and os.path.isfile(args.prd_file):
        try:
            with open(args.prd_file, "r", encoding="utf-8-sig") as f:
                text_parts.append(f.read())
        except Exception:
            pass

    # 第4优先级：commit message
    if args.commit_msg:
        text_parts.append(args.commit_msg)

    # 第5优先级：demo 名称
    if args.demo_name:
        text_parts.append(args.demo_name)

    combined_text = "\n".join(text_parts)
    category = detect_from_text(combined_text)
    print(category)


if __name__ == "__main__":
    main()
