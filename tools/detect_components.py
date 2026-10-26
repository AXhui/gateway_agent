#!/usr/bin/env python3
"""
检测 demo.html 实际使用了哪些组件库组件（bc-* / ms-* 类），映射到组件注册表。

用法：
    python3 tools/detect_components.py \
        --demo-file 05_release/REQ-XXX/demo.html \
        --registry milesight-ui-prototype-workspace/component-registry.json \
        [--json]

输出（默认，每行一个组件中文名）：
    按钮
    图标
    ...

--json 时输出：{"components": ["按钮", ...], "class_hits": {"按钮": ["ms-btn", ...]}}
"""

import argparse
import json
import os
import re
import sys


# 组件 id -> 类名候选映射。
# 类名通常是 ms-<id> 或 bc-<id> 的变体；这里补充组件文档中 class 与 id 不一致的已知情况。
# 新增组件时若 demo 类名与 id 不一致，先在这里登记别名，再重新运行本脚本。
CLASS_ALIASES = {
    "input-search": ["ms-input-search"],
    "page-header": ["ms-page-head", "ms-page-header"],
    "nav-menu": ["ms-nav", "ms-nav-item"],
    "dropdown-menu": ["ms-dropdown", "ms-dropdown-item"],
    "back-top": ["ms-backtop", "ms-back-top"],
    "date-picker": ["ms-datepicker", "ms-date-picker"],
    "auto-complete": ["ms-autocomplete", "ms-auto-complete"],
    "time-picker": ["ms-timepicker", "ms-time-picker"],
    "tree-select": ["ms-tree-select"],
    "descriptions": ["ms-desc"],
    "empty": ["ms-empty"],
    "statistic": ["ms-stat"],
    "progress": ["ms-progress"],
    "segmented": ["ms-segmented"],
    "collapse": ["ms-collapse"],
    "table": ["ms-table"],
    "pagination": ["ms-pagination"],
    "breadcrumb": ["ms-breadcrumb"],
    "tabs": ["ms-tabs"],
    "steps": ["ms-steps"],
    "input": ["ms-input"],
    "select": ["ms-select"],
    "checkbox": ["ms-checkbox"],
    "radio": ["ms-radio"],
    "switch": ["ms-switch"],
    "slider": ["ms-slider"],
    "upload": ["ms-upload"],
    "form": ["ms-form"],
    "avatar": ["ms-avatar"],
    "badge": ["ms-badge"],
    "card": ["ms-card"],
    "tag": ["ms-tag"],
    "tooltip": ["ms-tip"],
    "alert": ["ms-alert"],
    "drawer": ["ms-drawer"],
    "modal": ["ms-modal"],
    "spin": ["ms-spin"],
    "timeline": ["ms-timeline"],
    "tree": ["ms-tree"],
    "button": ["ms-btn"],
    "divider": ["ms-divider"],
    "space": ["ms-space"],
    "grid": ["ms-grid-3", "ms-grid-4"],
    "layout": ["ms-shell", "ms-header", "ms-sidebar", "ms-content"],
    "affix": ["ms-affix"],
    "logo": ["ms-logo"],
    "icon": ["ms-ico"],
    "typography": ["ms-text", "ms-h2", "ms-h3", "ms-h4", "ms-h5"],
    "anchor": ["ms-anchor"],
    "message": ["ms-message"],
    "notification": ["ms-notification"],
    "popconfirm": ["ms-popconfirm"],
    "result": ["ms-result-icon", "ms-result"],
    "skeleton": ["ms-skeleton"],
    "watermark": ["ms-watermark"],
    "comment": ["ms-comment"],
    "calendar": ["ms-calendar"],
    "image": ["ms-image"],
    "list": ["ms-list-desc", "ms-list-title"],
    "rate": ["ms-rate"],
    "popover": ["ms-popover"],
    "cascader": ["ms-cascader"],
    "transfer": ["ms-transfer"],
    "input-number": ["ms-input-number"],
}


def load_registry(registry_path):
    """读取组件注册表，返回 {cn: {"id": ..., "category": ..., "class_hits": set}}"""
    with open(registry_path, "r", encoding="utf-8-sig") as f:
        reg = json.load(f)
    comps = reg.get("components", [])
    result = {}
    for c in comps:
        cid = c.get("id", "")
        cn = c.get("cn", "") or c.get("name", "")
        if not cn:
            continue
        cands = set()
        cands.add("ms-" + cid)
        cands.add("bc-" + cid)
        cands.add("ms-" + cid.replace("-", ""))
        cands.add("bc-" + cid.replace("-", ""))
        for a in CLASS_ALIASES.get(cid, []):
            cands.add(a)
        result[cn] = {"id": cid, "category": c.get("category", ""), "cands": cands}
    return result


def collect_classes(demo_path):
    """从 demo.html 收集所有 bc-*/ms-* 类名。"""
    with open(demo_path, "r", encoding="utf-8-sig", errors="replace") as f:
        html = f.read()
    classes = set()
    for m in re.finditer(r'class\s*=\s*["\']([^"\']+)["\']', html):
        for c in m.group(1).split():
            c = c.strip()
            if re.match(r"^(bc|ms)-[\w-]+$", c):
                classes.add(c)
    return classes


def detect(demo_path, registry_path):
    reg = load_registry(registry_path)
    used = collect_classes(demo_path)
    hits = {}
    for cn, info in reg.items():
        hit_classes = sorted(info["cands"] & used)
        if hit_classes:
            hits[cn] = hit_classes
    return hits


def main():
    parser = argparse.ArgumentParser(description="检测 demo.html 使用了哪些组件库组件")
    parser.add_argument("--demo-file", required=True, help="demo.html 路径")
    parser.add_argument("--registry", required=True, help="component-registry.json 路径")
    parser.add_argument("--json", action="store_true", help="输出 JSON 而非每行一个组件名")
    args = parser.parse_args()

    hits = detect(args.demo_file, args.registry)
    if args.json:
        print(json.dumps({"components": list(hits.keys()), "class_hits": hits}, ensure_ascii=False))
    else:
        for cn in hits:
            print(cn)


if __name__ == "__main__":
    main()
