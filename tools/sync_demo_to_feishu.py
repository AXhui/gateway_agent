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
        --action-type "新建" \
        --status "已生成" \
        --structure 90 --component 85 --interaction 80 --visual 88 --field-score 92

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
    parser.add_argument(
        "--action-type",
        default="新建",
        choices=["新建", "更新"],
        help="记录类型：新建=首次生成（会通知）；更新=修改已有 demo（不通知，仅留记录）",
    )
    parser.add_argument("--prompt", default="", help="用户本次的原始提示词/需求原话")
    parser.add_argument("--duration", type=float, default=None, help="生成耗时（分钟），由 post-commit 自动计算")
    parser.add_argument("--req-id", default="", help="需求编号（如 REQ-004），供工作流按需求查找/更新旧记录")
    parser.add_argument("--category", default="", choices=["", "云平台", "CCTV", "CV", "网关", "路由器", "uink"], help="产品分类：IOT/CCTV/路由器/网关（AI 自动判断）")
    # AI 自评的 5 维度分数（0-100，整数）；不填则为空，等待 UED 复核
    parser.add_argument("--structure", type=int, help="结构还原度 0-100（AI 自评）")
    parser.add_argument("--component", type=int, help="组件类型还原度 0-100（AI 自评）")
    parser.add_argument("--interaction", type=int, help="交互逻辑还原度 0-100（AI 自评）")
    parser.add_argument("--visual", type=int, help="视觉还原度 0-100（AI 自评）")
    parser.add_argument("--field-score", type=int, help="字段还原度 0-100（AI 自评）")
    parser.add_argument(
        "--check-status",
        default="待校验",
        help="校验状态：待校验/校验中/校验完成（AI 自评后默认待 UED 复核）",
    )
    parser.add_argument(
        "--quality-file",
        default="",
        help="AI 自评文件 quality.json 路径；提供后自动读取 5 维度分数",
    )
    parser.add_argument("--webhook-url", default="", help="飞书 Webhook 地址（覆盖环境变量）")
    parser.add_argument("--webhook-token", default="", help="飞书 Webhook Token（覆盖环境变量）")

    args = parser.parse_args()

    webhook_url = args.webhook_url or os.environ.get("FEISHU_WEBHOOK_URL", "")
    webhook_token = args.webhook_token or os.environ.get("FEISHU_WEBHOOK_TOKEN", "")

    # 读取 AI 自评文件 quality.json（命令行显式分数优先于文件）
    q = {}
    if args.quality_file and os.path.isfile(args.quality_file):
        try:
            with open(args.quality_file, "r", encoding="utf-8-sig") as f:
                q = json.load(f)
        except Exception as e:
            print(f"[警告] 读取自评文件失败: {e}", file=sys.stderr)

    def _pick(cli_val, file_key):
        return cli_val if cli_val is not None else q.get(file_key)

    structure = _pick(args.structure, "structure")
    component = _pick(args.component, "component")
    interaction = _pick(args.interaction, "interaction")
    visual = _pick(args.visual, "visual")
    field_score = _pick(args.field_score, "field")
    category = args.category or q.get("category", "")
    # AI 已提供任一分数即视为已自评，等待 UED 复核
    check_status = args.check_status
    if any(v is not None for v in (structure, component, interaction, visual, field_score)):
        check_status = "待校验"

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
        "记录类型": args.action_type,
        "提示词": args.prompt,
        "生成耗时(分钟)": args.duration,
        "需求编号": args.req_id,
        "结构还原度": structure,
        "组件类型还原度": component,
        "交互逻辑还原度": interaction,
        "视觉还原度": visual,
        "字段还原度": field_score,
        "校验状态": check_status,
        "产品分类": category,
    }

    print(f"[同步中] {args.name} → {webhook_url}")
    ok = sync_to_feishu(payload, webhook_url, webhook_token)
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
