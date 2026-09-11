#!/usr/bin/env python3
"""
同步 UI Demo 信息到飞书多维表格。

用法：
    python tools/sync_demo_to_feishu.py \
        --name "登录页 Demo" \
        --description "用户中心登录页改版 v2" \
        --preview-url "http://intranet/demo/REQ-001/demo.html" \
        --generator "axhui" \
        --version "v1.0.0" \
        --source "Agent 生成" \
        --status "已生成"

环境变量（必填）：
    FEISHU_WEBHOOK_URL    飞书多维表格 Webhook 地址
    FEISHU_WEBHOOK_TOKEN  Webhook Bearer Token

也可以用 --webhook-url 和 --webhook-token 命令行参数覆盖。
"""

import argparse
import json
import os
import sys
import urllib.request
import urllib.error


def sync_to_feishu(payload: dict, webhook_url: str, webhook_token: str) -> bool:
    """发送 POST 请求到飞书多维表格 Webhook。"""
    headers = {"Content-Type": "application/json"}
    if webhook_token:
        headers["Authorization"] = f"Bearer {webhook_token}"

    data = json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        webhook_url, data=data, headers=headers, method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            print(f"[同步成功] HTTP {resp.status}")
            print(f"  响应: {body}")
            return True
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[同步失败] HTTP {e.code}: {body}", file=sys.stderr)
        return False
    except urllib.error.URLError as e:
        print(f"[同步失败] 网络错误: {e.reason}", file=sys.stderr)
        return False
    except Exception as e:
        print(f"[同步失败] 未知错误: {e}", file=sys.stderr)
        return False


def main():
    parser = argparse.ArgumentParser(
        description="同步 UI Demo 信息到飞书多维表格"
    )
    parser.add_argument("--name", required=True, help="Demo 名称")
    parser.add_argument("--description", default="", help="需求描述")
    parser.add_argument("--preview-url", default="", help="预览 URL（内网地址）")
    parser.add_argument("--generator", default="", help="生成人")
    parser.add_argument("--version", default="", help="版本号")
    parser.add_argument(
        "--source",
        default="Agent 生成",
        choices=["Agent 生成", "GitHub 更新", "手动录入"],
        help="来源（默认：Agent 生成）",
    )
    parser.add_argument(
        "--status",
        default="已生成",
        choices=["已生成", "已发布", "已下线"],
        help="状态（默认：已生成）",
    )
    parser.add_argument("--webhook-url", default="", help="飞书 Webhook 地址（覆盖环境变量）")
    parser.add_argument("--webhook-token", default="", help="飞书 Webhook Token（覆盖环境变量）")

    args = parser.parse_args()

    webhook_url = args.webhook_url or os.environ.get("FEISHU_WEBHOOK_URL", "")
    webhook_token = args.webhook_token or os.environ.get("FEISHU_WEBHOOK_TOKEN", "")

    if not webhook_url:
        print(
            "[错误] 未配置飞书 Webhook 地址。请设置环境变量 FEISHU_WEBHOOK_URL，"
            "或使用 --webhook-url 参数。",
            file=sys.stderr,
        )
        sys.exit(1)

    payload = {
        "Demo 名称": args.name,
        "需求描述": args.description,
        "预览 URL": args.preview_url,
        "生成人": args.generator,
        "版本号": args.version,
        "来源": args.source,
        "状态": args.status,
    }

    print(f"[同步中] {args.name} → {webhook_url}")
    ok = sync_to_feishu(payload, webhook_url, webhook_token)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
