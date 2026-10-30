#!/usr/bin/env python3
"""
把 demo 的「使用组件」link 关联补写到飞书 Demo 表。

在 sync_demo_to_feishu.py 同步完之后跑：
    python tools/link_components.py --demo-dir 05_release/REQ-021 --req-id REQ-021

或者直接指定已有的记录：
    python tools/link_components.py --demo-dir 05_release/REQ-014 --record-id recvvspSwkLnhs

前提：本机已安装并登录 lark-cli（lark-cli base +record-list 能跑通）。
"""

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

BASE_TOKEN = "F2MebgSgMaUZSbseUWLcefqbnKd"
DEMO_TABLE = "tbln6WxfFJ6iYaek"
COMP_TABLE = "tblzae8q8LwpVcoM"

# ms-*/bc-* 前缀 → 组件质量表中文组件名
PREFIX_MAP = {
    "ms-btn": "按钮", "ms-icon": "图标", "ms-ico": "图标",
    "ms-text": "排版", "ms-h3": "排版", "ms-h4": "排版", "ms-h5": "排版",
    "ms-ellipsis": "排版",
    "ms-logo": "品牌标识", "ms-divider": "分割线",
    "ms-grid": "栅格", "bc-col": "栅格",
    "ms-space": "间距", "ms-stack": "间距",
    "ms-affix": "固钉",
    "ms-header": "页头", "ms-page-head": "页头", "bc-page-head": "页头",
    "ms-breadcrumb": "面包屑",
    "ms-nav": "导航菜单", "ms-sidebar": "导航菜单",
    "ms-pagination": "分页",
    "ms-step": "步骤条", "ms-steps": "步骤条",
    "ms-dropdown": "下拉菜单",
    "ms-tabs": "标签页",
    "ms-input": "输入框", "bc-num": "数字输入框",
    "ms-select": "选择器",
    "ms-checkbox": "复选框", "ms-radio": "单选框",
    "ms-switch": "开关", "ms-slider": "滑动输入条",
    "ms-datepicker": "日期选择框",
    "ms-form": "表单", "ms-segmented": "分段控制器",
    "ms-avatar": "头像", "ms-card": "卡片",
    "ms-desc": "描述列表",
    "ms-empty": "空状态", "bc-empty": "空状态",
    "ms-table": "表格", "bc-table": "表格",
    "ms-list": "列表",
    "ms-stat": "统计数值", "bc-metric": "统计数值", "bc-count": "统计数值",
    "ms-tag": "标签",
    "ms-timeline": "时间轴",
    "ms-tip": "文字提示",
    "ms-alert": "警告提示",
    "ms-drawer": "抽屉", "bc-drawer": "抽屉",
    "ms-modal": "对话框", "bc-modal": "对话框",
    "ms-progress": "进度条", "bc-progress": "进度条",
    "ms-result": "结果", "ms-mask": "加载中",
    "ms-shell": "布局", "ms-content": "布局", "ms-main": "布局",
    "ms-page": "布局", "bc-section": "布局", "bc-entity": "布局",
    "bc-com": "布局", "bc-quick": "布局", "bc-filter": "布局",
    "bc-code": "设计令牌",
    "bc-chart": "统计数值", "bc-bar": "统计数值", "bc-topo": "统计数值",
    "bc-time": "排版",
}


def run_lark_cli(args: list) -> dict:
    """跑 lark-cli 命令，返回解析后的 JSON。"""
    cmd = ["lark-cli"] + args + ["--as", "user"]
    result = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8")
    if result.returncode != 0:
        print(f"[错误] lark-cli 失败: {result.stderr}", file=sys.stderr)
        sys.exit(1)
    return json.loads(result.stdout)


def normalize_class(c: str) -> str:
    """bc-card--active → bc-card"""
    m = re.match(r"^(bc-[\w-]+?|ms-[\w-]+?)(?:--|$)", c)
    return m.group(1) if m else c


def map_to_component_names(classes: list) -> set:
    """组件类列表 → 中文组件名集合"""
    names = set()
    for c in classes:
        base = normalize_class(c)
        if base in PREFIX_MAP:
            names.add(PREFIX_MAP[base])
    return names


def get_component_record_map() -> dict:
    """从组件质量表拉取「组件名 → record_id」映射。"""
    data = run_lark_cli([
        "base", "+record-list",
        "--base-token", BASE_TOKEN,
        "--table-id", COMP_TABLE,
        "--limit", "200",
    ])
    # record-list 返回的 record_file 在顶层
    record_file = data.get("record_file")
    if not record_file:
        print("[错误] 拿不到组件质量表数据", file=sys.stderr)
        sys.exit(1)
    name_map = {}
    with open(record_file, "r", encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            name = rec.get("组件名")
            rid = rec.get("record_id")
            if name and rid:
                name_map[name] = rid
    return name_map


def find_demo_record_id(req_id: str) -> str:
    """按需求编号在 Demo 表找 record_id（取最新一条）。"""
    data = run_lark_cli([
        "base", "+record-list",
        "--base-token", BASE_TOKEN,
        "--table-id", DEMO_TABLE,
        "--limit", "200",
    ])
    record_file = data.get("record_file")
    with open(record_file, "r", encoding="utf-8") as f:
        for line in f:
            rec = json.loads(line)
            if rec.get("需求编号") == req_id:
                return rec["record_id"]
    print(f"[错误] Demo 表找不到需求编号 {req_id}", file=sys.stderr)
    sys.exit(1)


def analyze_components(demo_dir: Path) -> list:
    """跑 score_component.py，返回 used_component_classes 列表。"""
    repo_root = Path(__file__).resolve().parent.parent
    demo_html = demo_dir / "demo.html"
    if not demo_html.is_file():
        print(f"[错误] 找不到 {demo_html}", file=sys.stderr)
        sys.exit(1)
    score_script = repo_root / "tools" / "score_component.py"
    subprocess.run(
        [sys.executable, str(score_script), "--demo", str(demo_html), "--report"],
        cwd=str(repo_root), check=True, capture_output=True, text=True,
    )
    report = demo_dir / "score_component.json"
    with open(report, "r", encoding="utf-8-sig") as f:
        data = json.load(f)
    return data.get("used_component_classes", [])


def main():
    parser = argparse.ArgumentParser(description="补写 demo 的「使用组件」link 关联")
    parser.add_argument("--demo-dir", required=True, help="demo 目录（含 demo.html）")
    parser.add_argument("--req-id", default="", help="需求编号（如 REQ-021），和 --record-id 二选一")
    parser.add_argument("--record-id", default="", help="直接指定 Demo 表记录 ID")
    args = parser.parse_args()

    demo_dir = Path(args.demo_dir)
    if not args.req_id and not args.record_id:
        print("[错误] 必须传 --req-id 或 --record-id", file=sys.stderr)
        sys.exit(1)

    # 1. 分析组件
    print(f"[1/4] 分析 {demo_dir.name} 的组件列表...")
    classes = analyze_components(demo_dir)
    comp_names = map_to_component_names(classes)
    print(f"      检测到 {len(classes)} 个组件类 → 映射为 {len(comp_names)} 个组件: {', '.join(sorted(comp_names))}")

    # 2. 组件名 → record_id
    print("[2/4] 拉取组件质量表 record_id...")
    comp_map = get_component_record_map()
    link_ids = [{"id": comp_map[n]} for n in sorted(comp_names) if n in comp_map]
    missing = comp_names - set(comp_map.keys())
    if missing:
        print(f"      [警告] 以下组件在质量表中找不到，已跳过: {', '.join(sorted(missing))}")

    # 3. 找 Demo 记录
    demo_record_id = args.record_id or find_demo_record_id(args.req_id)
    print(f"[3/4] Demo 记录: {demo_record_id}")

    # 4. 写回 link
    print("[4/4] 写回「使用组件」link...")
    payload = {
        "update_records": [{
            "record_id": demo_record_id,
            "fields": {"使用组件": link_ids},
        }]
    }
    payload_file = demo_dir / "_link_payload.json"
    with open(payload_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False)
    result = run_lark_cli([
        "base", "+record-batch-update",
        "--base-token", BASE_TOKEN,
        "--table-id", DEMO_TABLE,
        "--json", f"@{payload_file}",
    ])
    payload_file.unlink()
    if result.get("ok"):
        print(f"\n✅ 完成！已关联 {len(link_ids)} 个组件到 {demo_record_id}")
    else:
        print(f"\n❌ 失败: {result}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
