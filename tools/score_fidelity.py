#!/usr/bin/env python3
"""
结构 + 字段还原度打分脚本 —— 把「结构」「字段」两个维度从 AI 自评拍脑袋，
变成可执行、可复核的规则打分（与 score_component.py 平行，同属 L1 规则层）。

原理
----
纯 Python 读文件分析，不碰网络、不运行浏览器。对 demo.html 做两类检查。

本组件库的 demo 架构是「壳 + JS 装配」：页面内容全部由 JS 模板渲染（静态 HTML
只有壳，无 th/label/input 文本）。因此还原度不能靠「静态字段文本比对」，而要看
「实体定义是否完整」与「JS 装配是否真正驱动了字段/结构渲染」。

字段还原度（field）——3 条子规则（权重 40/35/25）：
  ① 实体定义完整  40%  MS_ENTITIES 是否有完整字段清单（key/cn/type）+ formFields 声明 +
                        指标卡/操作/状态等业务定义；缺失越多分越低
  ② 装配活跃度    35%  页面 JS 中字段渲染驱动是否活跃（fields.map / columns.map /
                        innerHTML 装配 / MS_BIZ_INDEX 契约调用 / 表格渲染）；
                        装配越少越可能是「空壳 demo」
  ③ 静态字段校验  25%  若静态 HTML 存在字段文本，逐一比对实体字段清单（防硬编码野字段）；
                        无静态字段时按实体驱动可信度给分

结构还原度（structure）——3 条子规则（权重 35/35/30）：
  ① 统一壳        35%  页面是否使用统一壳（MS_EG71_SHELL 或 ms-shell/ms-header/
                        ms-sidebar 布局类）；页面自拼壳结构扣分
  ② 骨架完整      35%  从 JS 装配信号检测骨架区块（壳 + 内容区 + 页头 + 导航 + 表格主体）
  ③ 装配健康      30%  装配点数量（innerHTML / render / 弹层 / 指标卡）是否达到业务页面
                        应有的活跃度；有壳无内容（装配过少）重扣

用法
----
    # 只打分（输出到 stdout）
    python tools/score_fidelity.py --demo 05_release/REQ-005/demo.html

    # 打分并把 field/structure 分写回同目录 quality.json（其余维度不动）
    python tools/score_fidelity.py --demo 05_release/REQ-005/demo.html --write

    # 打分并把完整明细另存为同目录 score_fidelity.json
    python tools/score_fidelity.py --demo 05_release/REQ-005/demo.html --report

退出码：0=成功；2=输入文件缺失或无法解析。
"""

import argparse
import json
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# ================= 字段规则 =================

def extract_entity_fields(html: str):
    """从 window.MS_ENTITIES 提取 {key, cn, type} 字段定义。"""
    m = re.search(r'window\.MS_ENTITIES\s*=\s*(\{.*?\n\})\s*;', html, re.S)
    if not m:
        return []
    seg = m.group(1)
    return re.findall(
        r"\{\s*key\s*:\s*['\"]([^'\"]+)['\"]\s*,\s*cn\s*:\s*['\"]([^'\"]+)['\"]\s*,\s*type\s*:\s*['\"]([^'\"]+)['\"]",
        seg,
    )


def strip_static(html: str) -> str:
    """剔除 style/script 块，只留静态 HTML 标记与文本。"""
    s = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S | re.I)
    s = re.sub(r"<script[^>]*>.*?</script>", "", s, flags=re.S | re.I)
    return s


def split_biz_blocks(html: str):
    """拆分业务代码块与资产代码块。

    资产块：含 window.MS_BASE_COMPONENTS / MS_BIZ_COMPONENTS / MS_ICONS / MS_BIZ_UTIL /
    MS_DATA / MS_ENTITIES / MS_BASE_INDEX / MS_ENTITY_FALLBACK 等组件库定义。
    业务块：以 'use strict' 开头或含 REQ- 业务标识的独立 script。
    返回 (业务JS文本, 资产JS文本, 业务块数, 资产块数)。
    """
    ASSET_PATTERNS = [
        r"window\.MS_BASE_COMPONENTS\s*=", r"window\.MS_BIZ_COMPONENTS\s*=",
        r"window\.MS_ICONS\s*=", r"window\.MS_BIZ_UTIL\s*=", r"window\.MS_DATA\s*=",
        r"window\.MS_ENTITIES\s*=", r"window\.MS_BASE_INDEX\s*=", r"window\.MS_BASE_LOGO",
        r"window\.MS_ENTITY_FALLBACK\s*=",
    ]
    _ASSET_RE = re.compile("|".join(ASSET_PATTERNS))
    blocks = [m.group(1) for m in re.finditer(r"<script[^>]*>(.*?)</script>", html, re.S | re.I)]
    asset, biz = [], []
    for b in blocks:
        if _ASSET_RE.search(b):
            asset.append(b)
        else:
            biz.append(b)
    return "\n".join(biz), "\n".join(asset), len(biz), len(asset)


def check_entity_definition(html: str, entity_fields: list):
    """字段规则 ①：实体定义完整。"""
    notes = []
    score = 0
    if not entity_fields:
        return 0.0, 0, 0, ["未检测到 MS_ENTITIES 字段清单，实体定义缺失"]
    uniq_keys = len(set(k for k, _c, _t in entity_fields))
    uniq_cns = len(set(c for _k, c, _t in entity_fields))
    if uniq_keys >= 8:
        score += 50
        notes.append(f"实体字段 {uniq_keys} 个去重 key / {uniq_cns} 个中文名（≥8 达标，得 50）")
    else:
        score += max(0, int(uniq_keys / 8 * 50))
        notes.append(f"实体字段仅 {uniq_keys} 个去重 key，偏少（得 {score}）")
    form_fields = len(re.findall(r"formFields\s*:", html))
    if form_fields >= 1:
        score += 20
        notes.append(f"声明了 formFields 表单字段（{form_fields} 处，得 20）")
    else:
        notes.append("未声明 formFields，表单字段来源不明（不得分）")
    biz_defs = sum(bool(re.search(p, html)) for p in [r"metrics\s*:", r"actions\s*:", r"statuses\s*:"])
    score += biz_defs * 10
    notes.append(f"业务定义（指标卡/操作/状态枚举）命中 {biz_defs}/3（各 10 分）")
    return min(100, score), uniq_keys, form_fields, notes


def count_assembly_calls(html: str):
    """统计页面真实装配调用点（排除组件定义）。

    关键：资产代码里也有 render( / addEventListener（组件库自身），必须排除。
    排除策略：
    - render 定义（render: function / render(ctx) {）不计数
    - 只数调用形态：X.render( / X.innerHTML= / X.addEventListener / X.onclick=
    """
    # 剔除 render 定义段（render: function ... 或 render(ctx) { ...）
    s = re.sub(r'render\s*:\s*function|render\s*\([^)]*\)\s*\{', '', html)
    renders = len(re.findall(r'\.render\s*\(', s))
    inner = len(re.findall(r'\.innerHTML\s*=', html))
    events = len(re.findall(r'addEventListener|\.onclick\s*=', html))
    return renders, inner, events


def check_field_assembly(html: str, biz_js: str):
    """字段规则 ②：装配活跃度（字段渲染驱动）。

    信号取「调用点」而非「定义」：render( / innerHTML= / MS_BIZ_INDEX[ / fields.map
    只在业务逻辑里出现；资产定义里的组件模板字符串不含这些调用点。
    """
    renders, inner, _ = count_assembly_calls(html)
    full = html if not biz_js else biz_js + "\n" + html
    signals = {
        "render( 调用": renders,
        "innerHTML 装配": inner,
        "MS_BIZ_INDEX 契约调用": len(re.findall(r"MS_BIZ_INDEX\s*\[", full)),
        "fields.map 字段渲染": len(re.findall(r"(?:fields|columns)\.map", full)),
    }
    total = sum(signals.values())
    notes = [f"字段渲染调用点合计 {total} 处：" + "、".join(f"{k} {v}" for k, v in signals.items() if v)]
    if total == 0:
        return 0.0, 0, 0, notes + ["未检测到任何字段渲染调用点，页面疑似空壳/纯模板底座"]
    if total >= 20:
        score = 100
        notes.append("装配调用充足（≥20 处，满分）")
    elif total >= 10:
        score = 85
        notes.append("装配调用良好（10~19 处）")
    elif total >= 5:
        score = 65
        notes.append("装配调用一般（5~9 处），部分内容可能未渲染")
    else:
        score = 40
        notes.append("装配调用不足（<5 处），页面内容稀疏")
    return float(score), total, 0, notes


def check_static_fields(html: str, entity_fields: list):
    """字段规则 ③：静态字段校验（防硬编码野字段）。"""
    static = strip_static(html)
    rendered = []
    for pat in (
        r"<th[^>]*>([^<]{1,30})</th>",
        r"<label[^>]*>([^<]{1,30})</label>",
        r"placeholder\s*=\s*[\"']([^\"']{1,30})[\"']",
    ):
        for m in re.finditer(pat, static, re.I):
            t = m.group(1).strip().strip("*")
            if t and not t.startswith("${") and "}" not in t:
                rendered.append(t)
    if not rendered:
        # 无静态字段 → 实体驱动即可信（本组件库架构常态）
        entity_driven = bool(re.search(r"MS_ENTITY_FALLBACK|(?:fields|columns)\.map|MS_ENTITY\b", html))
        if entity_driven:
            return 100.0, 0, 0, ["无静态字段文本，字段由实体渲染器产出，可信"]
        return 70.0, 0, 0, ["无静态字段文本且未检测到实体渲染，无法静态校验，取中性分"]
    entity_cns = set(c for _k, c, _t in entity_fields)
    if not entity_cns:
        return 40.0, 0, len(rendered), [f"存在静态字段 {len(rendered)} 个，但无实体清单可比对，硬编码风险高"]
    norm = lambda s: re.sub(r"[\s:：\-—/]", "", s).lower()
    entity_norm = {norm(c) for c in entity_cns}
    hit = [r for r in rendered if norm(r) in entity_norm]
    miss = [r for r in rendered if norm(r) not in entity_norm]
    ratio = len(hit) / len(rendered)
    score = round(max(0, ratio * 100))
    notes = [f"静态字段 {len(rendered)} 个，与实体清单一致 {len(hit)} 个（覆盖率 {ratio:.0%}）"]
    if miss:
        notes.append(f"未匹配（疑似野字段）{len(miss)} 个：{', '.join(miss[:12])}")
    return score, len(hit), len(miss), notes


# ================= 结构规则 =================

SHELL_LAYOUT_CLASSES = ("ms-shell", "ms-header", "ms-sidebar", "ms-content")
SHELL_JS_MARKERS = ("MS_EG71_SHELL", "MS_SHELL", "shell.render")


def check_unified_shell(html: str):
    """结构规则 ①：统一壳。"""
    has_js_shell = any(k in html for k in SHELL_JS_MARKERS)
    layout_classes = [c for c in SHELL_LAYOUT_CLASSES if re.search(rf'class\s*=\s*["\'][^"\']*\b{re.escape(c)}\b', html)]
    notes = []
    score = 100
    if has_js_shell:
        notes.append("检测到统一壳 JS（MS_EG71_SHELL / MS_SHELL）")
    elif layout_classes:
        notes.append(f"未检测到统一壳 JS，但使用了壳布局类（{', '.join(layout_classes)}）")
        score -= 20
    else:
        notes.append("未检测到统一壳，页面疑似自拼结构")
        score -= 40
    return max(0, score), has_js_shell, layout_classes, notes


def check_skeleton(html: str, biz_js: str, biz_count: int):
    """结构规则 ②：骨架完整（壳 + 业务块 + 内容/页头/导航/表格信号）。"""
    checks = {
        "壳布局": bool(re.search(r'class\s*=\s*["\'][^"\']*(?:ms-shell|ms-header|ms-sidebar)', html)),
        "独立业务块": biz_count >= 1 or bool(re.search(r"'use strict'|REQ-\d+", biz_js)),
        "内容区装配": bool(re.search(r"(?:ms-content|ms-main|ms-page|innerHTML\s*=)", html, re.I)),
        "页头/导航": bool(re.search(r"(?:ms-page-head|page-header|ms-nav|ms-breadcrumb|breadcrumb)", html, re.I)),
        "表格/列表主体": bool(re.search(r"(?:renderTable|renderList|<table\b|Table\s*\()", html, re.I)),
    }
    present = [k for k, v in checks.items() if v]
    score = round(100 * len(present) / len(checks))
    notes = [f"骨架区块 {len(present)}/5：{', '.join(present) if present else '无'}"]
    if len(present) < 5:
        notes.append("缺失：" + ", ".join(k for k, v in checks.items() if not v))
    return score, len(present), len(checks), notes


def check_biz_customization(html: str, biz_js: str):
    """结构规则 ④（辅助参考）：业务定制度。

    区分「为真实业务定制的 demo」与「通用模板底座」：
    - REQ 业务标识数（REQ-xxx 出现次数）：越多说明业务场景定制越深
    - 独立业务块/use strict 业务代码：有独立业务 JS 说明针对业务写过装配逻辑
    """
    marks = len(re.findall(r"REQ-\d+", html))
    has_biz_js = bool(re.search(r"'use strict'", biz_js)) or len(biz_js) > 3000
    score = 0
    notes = []
    if has_biz_js:
        score += 50
        notes.append("存在独立业务代码块（≥50）")
    else:
        notes.append("无独立业务代码块，业务逻辑内嵌资产（不得分）")
    if marks >= 10:
        score += 50
        notes.append(f"REQ 业务标识 {marks} 个，业务定制充分（≥10，+50）")
    elif marks >= 3:
        score += 35
        notes.append(f"REQ 业务标识 {marks} 个，有一定业务定制（3~9，+35）")
    elif marks >= 1:
        score += 20
        notes.append(f"REQ 业务标识 {marks} 个，定制有限（1~2，+20）")
    else:
        notes.append("无 REQ 业务标识，疑似纯模板底座")
    return min(100, score), marks, has_biz_js, notes


def check_assembly_health(html: str, biz_js: str):
    """结构规则 ③：装配健康（页面真实调用点）。

    只统计页面装配调用点（render / innerHTML / 交互事件绑定）；
    组件注册表（{id:'bc-...'}）是资产定义不是装配信号，不计入，
    避免"只有注册没调用"的死页面拿高分。
    """
    renders, inner, events = count_assembly_calls(html)
    total = inner + renders + events
    notes = [f"页面装配调用点合计 {total}（内联 {inner} / render {renders} / 交互事件 {events}）"]
    if total == 0:
        return 0.0, 0, 0, notes + ["页面没有任何装配调用，疑似只有组件注册没有实际渲染的死页面"]
    if total >= 40:
        score = 100
        notes.append("装配调用充实（≥40，满分）")
    elif total >= 20:
        score = 85
        notes.append("装配调用良好（20~39）")
    elif total >= 8:
        score = 60
        notes.append("装配调用一般（8~19），部分区块可能空置")
    else:
        score = 30
        notes.append("装配调用不足（<8），页面内容稀疏")
    return float(score), total, 0, notes


def compute_fidelity(demo_path: Path) -> dict:
    """对单个 demo.html 执行结构 + 字段检查，返回分数与明细。"""
    with open(demo_path, "r", encoding="utf-8-sig", errors="replace") as f:
        html = f.read()

    entity_fields = extract_entity_fields(html)
    biz_js, asset_js, biz_count, asset_count = split_biz_blocks(html)

    checks = {}
    checks["字段① 实体定义完整"] = check_entity_definition(html, entity_fields)
    checks["字段② 装配活跃度"] = check_field_assembly(html, biz_js)
    checks["字段③ 静态字段校验"] = check_static_fields(html, entity_fields)
    # 装配依赖惩罚：实体定义再全，若页面没有真实渲染调用（死页面），字段总分不得超过 45
    assembly_total = checks["字段② 装配活跃度"][1]
    field_total = round(
        (checks["字段① 实体定义完整"][0] * 40
         + checks["字段② 装配活跃度"][0] * 35
         + checks["字段③ 静态字段校验"][0] * 25) / 100
    )
    if assembly_total == 0:
        field_total = min(field_total, 45)
        checks["字段② 装配活跃度"][3].append("装配调用为 0：实体定义未实际渲染，字段总分封顶 45")

    checks["结构① 统一壳"] = check_unified_shell(html)
    checks["结构② 骨架完整"] = check_skeleton(html, biz_js, biz_count)
    checks["结构③ 装配健康"] = check_assembly_health(html, biz_js)
    checks["结构④ 业务定制度"] = check_biz_customization(html, biz_js)
    struct_total = round(
        (checks["结构① 统一壳"][0] * 35
         + checks["结构② 骨架完整"][0] * 35
         + checks["结构③ 装配健康"][0] * 30) / 100
    )
    if checks["结构③ 装配健康"][1] == 0:
        struct_total = min(struct_total, 45)
        checks["结构③ 装配健康"][3].append("装配调用为 0：有壳无内容，结构总分封顶 45")

    return {
        "demo": str(demo_path),
        "structure_score": struct_total,
        "field_score": field_total,
        "checks": checks,
    }


def main():
    parser = argparse.ArgumentParser(description="结构/字段还原度打分：规则化替代 AI 拍脑袋")
    parser.add_argument("--demo", required=True, help="demo.html 路径（必填）")
    parser.add_argument("--write", action="store_true", help="把 structure/field 分写回同目录 quality.json")
    parser.add_argument("--report", action="store_true", help="把完整明细另存为同目录 score_fidelity.json")
    args = parser.parse_args()

    demo = Path(args.demo).resolve()
    if not demo.is_file():
        print(f"[错误] 找不到 demo 文件: {demo}", file=sys.stderr)
        sys.exit(2)

    try:
        result = compute_fidelity(demo)
    except Exception as e:
        print(f"[错误] 分析失败: {e}", file=sys.stderr)
        sys.exit(2)

    print("=" * 60)
    print(f"结构/字段还原度打分：{result['demo']}")
    print("=" * 60)
    for name, (score, a, b, notes) in result["checks"].items():
        print(f"\n[{name}] → {score} 分")
        for n in notes:
            print(f"  · {n}")
    print("\n" + "=" * 60)
    print(f"★ 结构还原度 structure 分 = {result['structure_score']} / 100")
    print(f"★ 字段还原度 field 分 = {result['field_score']} / 100")

    if args.write:
        qpath = demo.parent / "quality.json"
        if not qpath.is_file():
            print(f"[警告] 未找到 {qpath}，跳过写回", file=sys.stderr)
        else:
            q = json.loads(open(qpath, encoding="utf-8-sig").read())
            old_s, old_f = q.get("structure"), q.get("field")
            q["structure"] = result["structure_score"]
            q["field"] = result["field_score"]
            with open(qpath, "w", encoding="utf-8") as f:
                json.dump(q, f, ensure_ascii=False, indent=2)
                f.write("\n")
            print(f"[写回] {qpath}：structure {old_s}→{result['structure_score']}，field {old_f}→{result['field_score']}（其余维度未动）")

    if args.report:
        rpath = demo.parent / "score_fidelity.json"
        with open(rpath, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"[报告] 明细已保存: {rpath}")


if __name__ == "__main__":
    main()
