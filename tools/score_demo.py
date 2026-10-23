#!/usr/bin/env python3
"""
demo 质量评分器 v2 —— 三层取数 + 质量门 + 分维下限。

与 v1（score_component.py）的区别
--------------------------------
v1 只读 demo.html 源码文本，用正则统计 class。实测在「资产与页面代码同块内联 +
全 JS 渲染」的 demo 上全面失效（REQ-013/014/016 全部误判 28 分）。

v2 改为三层取数：
  L1 契约层   registry-*.js / library/*.css  → 组件 id、注册类、壳契约（真源）
  L2 源码层   demo.html 全文                  → 契约调用、手写渲染函数、自有样式
  L3 运行时层 无头 Chrome dump-dom            → 真实渲染后的 class / 可见文本 / 结构

职责边界
--------
本脚本只算「客观可验证」的分数，不假装能测「视觉还原度」。
语义分由 Agent 按 .claude/rules/quality-scoring.md 的锚点写进 llm.json，
用 --llm 传入后合并；未提供时该维标记 unscored，不参与综合分。

用法
----
    python tools/score_demo.py --demo 05_release/REQ-016/demo.html --req REQ-016
    python tools/score_demo.py --demo ... --req ... --write          # 写回 quality.json
    python tools/score_demo.py --demo ... --req ... --llm llm.json --write
    python tools/score_demo.py --demo ... --check                    # 只跑质量门

退出码：0=通过；2=质量门拦截；3=输入/环境错误；4=缺分（unscored）。
"""

import argparse
import datetime as dt
import json
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent

# 组件资产真源
ASSET_FILES = [
    REPO_ROOT / "library" / "business.css",
    REPO_ROOT / "library" / "base.css",
    REPO_ROOT / "assets" / "js" / "registry-base.js",
    REPO_ROOT / "assets" / "js" / "registry-business.js",
]

# 维度权重：按「可验证性」分配，不按「主观重要性」
# component 是唯一可 100% 自动化的契约维度，权重最高；visual 最主观，权重最低
WEIGHTS = {
    "component": 0.25,
    "field": 0.20,
    "interaction": 0.20,
    "structure": 0.20,
    "visual": 0.15,
}

# 分维下限：综合分可以被高分维拉平，分维下限不能
FLOORS = {
    "component": 85,
    "field": 70,
    "interaction": 70,
    "structure": 70,
    "visual": 70,
}

OVERALL_MIN = 80.0

# 手写渲染函数的语义特征：与已注册 L3 形态重叠才算违规
HANDWRITTEN_SEMANTIC = re.compile(
    r"(modal|confirm|drawer|dialog|popup|table|form|card|list)", re.I
)
HANDWRITTEN_FN = re.compile(
    r"function\s+([A-Za-z_$][\w$]*)\s*\(|\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(?:function|\()"
)

# 纯净性：可见 UI 不应出现的评审/装配注记
PURITY_PATTERNS = [
    r"按\s*PRD", r"PRD\s*[:：]", r"校验(通过|结果|徽标)", r"\bR[1-5]\b\s*[:：]",
    r"B_[A-Z]", r"映射清单", r"还原度", r"评分", r"装配说明", r"交互评审",
]

CHROME_CANDIDATES = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    shutil.which("google-chrome") or "",
    shutil.which("chromium") or "",
]


def read_text(p: Path) -> str:
    return p.read_text(encoding="utf-8-sig", errors="replace")


# ---------------------------------------------------------------- L1 契约层

def load_registry():
    """宽口径提取组件类与组件 id。

    v1 用 ['"](bc-xxx)['"] 只认「紧贴引号」的类名，模板字符串里空格分隔的类
    （class="ms-btn bc-eg71-x"）全部漏掉，导致合法类被判未注册。
    """
    classes, ids, texts = set(), set(), []
    for p in ASSET_FILES:
        if not p.is_file():
            continue
        t = read_text(p)
        texts.append(t)
        classes |= set(re.findall(r"\b((?:bc|ms)-[\w-]+)\b", t))
        ids |= set(re.findall(r"id:\s*['\"]((?:bc|ms)-[\w-]+)['\"]", t))
    blob = "\n".join(texts)
    return {
        "classes": classes,
        "ids": ids,
        "has_shell": "MS_EG71_SHELL" in blob,
        "raw": blob,
    }


def load_mapping(req: str):
    """从 04_pages/REQ-###/mapping.md 提取「页面层必须直接调用」的 L3 组件 id。

    不能把 mapping 里出现的所有 bc-* 都当 expected —— 其中混有 L2 原子
    （form-item / table-ops / data-table），它们由 L3 内部消费，页面层不该直接 render。
    优先取「铸造清单」章节的组件 id（新铸 L3，页面必须调）；无该章节时退回全部 bc-*。
    """
    for base in (REPO_ROOT / "04_pages" / req, REPO_ROOT / "05_release" / req):
        p = base / "mapping.md"
        if p.is_file():
            t = read_text(p)
            m = re.search(r"##[^\n]*铸造清单(.*?)(?=\n##\s|\Z)", t, re.S)
            if m:
                return set(re.findall(r"\b(bc-[\w-]+)\b", m.group(1))), p
            return set(re.findall(r"\b(bc-[\w-]+)\b", t)), p
    return set(), None


# ---------------------------------------------------------------- L3 运行时层

def find_chrome():
    for c in CHROME_CANDIDATES:
        if c and Path(c).exists():
            return c
    return None


def runtime_dom(demo: Path, budget_ms: int = 5000):
    """无头 Chrome 渲染后 dump DOM。失败返回 (None, 原因)。"""
    chrome = find_chrome()
    if not chrome:
        return None, "未找到 Chrome/Chromium，退回静态解析（置信度降低）"
    cmd = [
        chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
        "--disable-dev-shm-usage", f"--virtual-time-budget={budget_ms}",
        "--dump-dom", demo.as_uri(),
    ]
    try:
        r = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
        if r.returncode != 0 or len(r.stdout) < 500:
            return None, f"渲染失败 rc={r.returncode}（退回静态解析）"
        return r.stdout, None
    except subprocess.TimeoutExpired:
        return None, "渲染超时（退回静态解析）"


def collect_classes(html: str):
    used = set()
    for m in re.finditer(r"class\s*=\s*[\"']([^\"']+)[\"']", html):
        for c in m.group(1).split():
            if re.match(r"^[A-Za-z_][\w-]*$", c):
                used.add(c)
    return used


def visible_text(html: str) -> str:
    t = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html, flags=re.S | re.I)
    t = re.sub(r"<[^>]+>", " ", t)
    return re.sub(r"\s+", " ", t)


def demo_own_css(html: str) -> str:
    """只取 demo 自有样式段：按 `/* ==== */` 分节，跳过 tokens / library 资产节。

    v1 按整个 <style> 块统计，把内联的 base.css（大量 #fff / 12px）算成裸值，
    导致「令牌占比 69%」这类系统性误判。
    """
    css = "\n".join(re.findall(r"<style[^>]*>(.*?)</style>", html, re.S | re.I))
    marks = [m.start() for m in re.finditer(r"/\*\s*=+", css)]
    if not marks:
        return css
    segs = []
    if css[:marks[0]].strip():
        segs.append(css[:marks[0]])
    for i, st in enumerate(marks):
        en = marks[i + 1] if i + 1 < len(marks) else len(css)
        segs.append(css[st:en])
    own = [
        s for s in segs
        if re.search(r"demo\s*(overrides?|copy only|自有)", s[:300], re.I)
    ]
    if not own:
        own = [
            s for s in segs
            if not re.search(
                r"L1\s*·|L2\s*·|L3\s*·|设计令牌|基础组件注册表|业务组件|站点转录|EG71\s*·",
                s[:300],
            )
        ]
    return "\n".join(own)


# ---------------------------------------------------------------- 事实采集

def collect_facts(demo: Path, req: str):
    src = read_text(demo)
    reg = load_registry()
    expected, mapping_path = load_mapping(req) if req else (set(), None)

    dom, dom_note = runtime_dom(demo)
    rendered = dom is not None
    html_for_dom = dom if rendered else src

    used = collect_classes(html_for_dom)
    lib_used = {c for c in used if c.startswith(("bc-", "ms-"))}
    unregistered = sorted(c for c in lib_used if c not in reg["classes"])
    own_css = demo_own_css(src)
    # 未注册类分级：demo 自有 CSS 里有定义 = 就地扩展（spacing.md §7 允许），
    # 完全无定义 = phantom 类，才是真的野路子（R2 违规）
    local_ext = [c for c in unregistered if re.search(rf"\.{re.escape(c)}\b", own_css)]
    phantom = [c for c in unregistered if c not in local_ext]

    # 契约调用：B['bc-x'].render / MS_BIZ_INDEX['bc-x'].render（全文，不切 script 块）
    calls = re.findall(
        r"(?:MS_BIZ_INDEX|(?<![\w.])B)\s*\[\s*['\"]((?:bc|ms)-[\w-]+)['\"]\s*\]\s*\.\s*render\s*\(",
        src,
    )
    called_ids = set(calls)
    binds = len(re.findall(
        r"(?:MS_BIZ_INDEX|(?<![\w.])B)\s*\[\s*['\"](?:bc|ms)-[\w-]+['\"]\s*\]\s*\.\s*bind\s*\(",
        src,
    ))

    # 手写渲染函数：只有「同语义已注册 L3 存在且未被调用」才算绕过契约（R2b）
    # 组件内部的通用 modal 工具（closeModal / renderEg71Modal）不算违规
    handwritten_raw = []
    for m in HANDWRITTEN_FN.finditer(src):
        name = m.group(1) or m.group(2)
        if not name or name in handwritten_raw:
            continue
        if HANDWRITTEN_SEMANTIC.search(name) and re.search(r"(Html|Modal|Confirm|Drawer)$", name):
            handwritten_raw.append(name)
    handwritten = []
    for name in handwritten_raw:
        sem = HANDWRITTEN_SEMANTIC.search(name).group(1).lower()
        same = [i for i in reg["ids"] if sem in i]
        if same and not (set(same) & called_ids):
            handwritten.append(name)

    css = demo_own_css(src)
    token_refs = len(re.findall(r"var\(\s*--[\w-]+", css))
    raw = len(re.findall(r"#[0-9a-fA-F]{3,8}\b", css)) + len(re.findall(r"\b\d+(?:\.\d+)?px\b", css))
    token_ratio = token_refs / (token_refs + raw) if (token_refs + raw) else None

    text = visible_text(html_for_dom)
    purity_hits = []
    for pat in PURITY_PATTERNS:
        for m in re.finditer(pat, text):
            purity_hits.append(text[max(0, m.start() - 25):m.end() + 25].strip())
            break

    # 状态覆盖探测：按 interaction-completeness §1 的必备状态集
    state_signals = {
        "empty": r"(ms-empty|bc-[\w-]*empty|暂无|No data|No results)",
        "error": r"(status[\"']?\s*[:=]\s*[\"']error|is-error|bc-[\w-]*error|Invalid|必填)",
        "modal": r"(ms-modal|bc-[\w-]*modal|bc-[\w-]*confirm|role=[\"']dialog)",
        "loading": r"(ms-spinner|ms-loading|is-loading|loading[\"']?\s*[:=])",
        "toast": r"(ms-alert|toast|bc-[\w-]*message)",
    }
    states = {k: bool(re.search(v, html_for_dom, re.I)) for k, v in state_signals.items()}

    return {
        "demo": str(demo),
        "req": req,
        "rendered": rendered,
        "dom_note": dom_note,
        "dom_bytes": len(html_for_dom),
        "used_classes": used,
        "lib_used": lib_used,
        "unregistered": unregistered,
        "local_ext": local_ext,
        "phantom": phantom,
        "registered_total": len(reg["classes"]),
        "registry_has_shell": reg["has_shell"],
        "shell_render": len(re.findall(r"MS_EG71_SHELL\s*\.\s*render\s*\(", src)),
        "shell_bind": len(re.findall(r"MS_EG71_SHELL\s*\.\s*bind\s*\(", src)),
        "contract_calls": len(calls),
        "contract_called_ids": called_ids,
        "contract_binds": binds,
        "expected_ids": expected,
        "mapping_path": str(mapping_path) if mapping_path else None,
        "handwritten": handwritten,
        "token_ratio": token_ratio,
        "token_refs": token_refs,
        "raw_values": raw,
        "purity_hits": purity_hits,
        "states": states,
        "object_leak": len(re.findall(r"\[object Object\]", html_for_dom)),
    }


# ---------------------------------------------------------------- 质量门

def evaluate_gates(f: dict):
    gates = []

    # G1 可运行性：渲染出内容、无对象泄漏、无致命空壳
    g1_pass = f["rendered"] and len(f["used_classes"]) >= 20 and f["object_leak"] == 0
    gates.append({
        "id": "G1", "name": "可运行性", "pass": g1_pass, "blocking": True,
        "evidence": [
            f"运行时 DOM {f['dom_bytes']} 字节，渲染 class {len(f['used_classes'])} 个" if f["rendered"]
            else f"未取得运行时 DOM：{f['dom_note']}",
            f"[object Object] 泄漏 {f['object_leak']} 处",
        ],
    })

    # G2 契约合规：手写渲染绕过已注册 L3 + phantom 类（无定义的野路子类）
    g2_pass = len(f["handwritten"]) == 0 and len(f["phantom"]) == 0
    ev2 = []
    ev2.append(
        f"手写渲染绕过 {len(f['handwritten'])} 个：{', '.join(f['handwritten'][:8])}"
        if f["handwritten"] else "未发现绕过已注册 L3 的手写渲染函数"
    )
    ev2.append(
        f"phantom 类 {len(f['phantom'])} 个（无任何 CSS 定义）：{', '.join(f['phantom'][:8])}"
        if f["phantom"] else f"{len(f['lib_used'])} 个库类全部有定义"
    )
    if f["local_ext"]:
        ev2.append(f"就地扩展类 {len(f['local_ext'])} 个（自有 CSS 已定义，按 §7 允许）：{', '.join(f['local_ext'][:6])}")
    gates.append({
        "id": "G2", "name": "契约合规（R2/R2b）", "pass": g2_pass, "blocking": True,
        "evidence": ev2,
    })

    # G3 纯净性（page-assembly §5）
    gates.append({
        "id": "G3", "name": "交付物纯净性", "pass": not f["purity_hits"], "blocking": True,
        "evidence": [f"可见 UI 出现评审/装配注记 {len(f['purity_hits'])} 处：{f['purity_hits'][:3]}"] if f["purity_hits"] else ["可见 UI 无评审/装配注记"],
    })

    # G4 材料齐全：映射清单是 page-assembly §0 的生成入口铁律
    g4_pass = bool(f["expected_ids"])
    gates.append({
        "id": "G4", "name": "映射清单齐全", "pass": g4_pass, "blocking": True,
        "evidence": [
            f"mapping.md 声明 {len(f['expected_ids'])} 个 L3 组件（{f['mapping_path']}）" if g4_pass
            else "未找到 mapping.md 或未声明任何 bc-* 组件（违反 page-assembly §0）",
        ],
    })

    return gates


# ---------------------------------------------------------------- 客观评分

def score_component(f: dict):
    """component 维度：100% 客观，无 LLM 参与。"""
    evidence, parts = [], []

    # ① 注册覆盖 35%
    if f["lib_used"]:
        cov = 1 - len(f["unregistered"]) / len(f["lib_used"])
        s1 = round(cov * 100)
        evidence.append(f"注册覆盖 {cov:.1%}（{len(f['lib_used'])} 个库类，未注册 {len(f['unregistered'])} 个）")
    else:
        s1 = 0
        evidence.append("运行时未采集到任何库类，注册覆盖记 0")
    parts.append((s1, 0.35))

    # ② 契约调用覆盖 35%：mapping 声明的每个组件是否真的被 render
    exp = f["expected_ids"]
    if exp:
        hit = exp & f["contract_called_ids"]
        cov = len(hit) / len(exp)
        s2 = round(cov * 100)
        miss = sorted(exp - hit)
        evidence.append(f"契约调用覆盖 {cov:.0%}（声明 {len(exp)}，命中 {len(hit)}，调用 {f['contract_calls']} 次）")
        if miss:
            evidence.append(f"未按契约调用的组件：{', '.join(miss[:8])}")
    else:
        s2 = 50
        evidence.append("无 mapping 清单，契约覆盖按 50 分中值计（G4 会拦截）")
    parts.append((s2, 0.35))

    # ③ 壳契约 15%
    s3 = 100
    if f["shell_render"] == 0:
        s3 -= 50
        evidence.append("未检测到 MS_EG71_SHELL.render")
    if f["shell_bind"] == 0:
        s3 -= 30
        evidence.append("未检测到 MS_EG71_SHELL.bind")
    if s3 == 100:
        evidence.append(f"壳契约完整（render×{f['shell_render']} / bind×{f['shell_bind']}）")
    parts.append((max(0, s3), 0.15))

    # ④ 设计令牌 15%（仅统计 demo 自有样式块）
    if f["token_ratio"] is None:
        s4 = 60
        evidence.append("未解析到 demo 自有样式块，令牌项按 60 分中性计")
    else:
        s4 = round(min(100, f["token_ratio"] * 100 / 0.9))  # ≥90% 记满分
        evidence.append(f"自有样式令牌占比 {f['token_ratio']:.0%}（var {f['token_refs']} / 裸值 {f['raw_values']}）")
    parts.append((s4, 0.15))

    score = round(sum(s * w for s, w in parts))
    return score, evidence


def score_objective_proxy(f: dict):
    """其余 4 维的客观代理指标。只作为 LLM 语义分的「地板」与佐证，不单独定分。"""
    states = f["states"]
    return {
        "structure": {
            "proxy": 100 if f["expected_ids"] else 60,
            "note": f"mapping 声明 {len(f['expected_ids'])} 个 L3，实际调用 {len(f['contract_called_ids'])} 个",
        },
        "interaction": {
            "proxy": round(sum(states.values()) / len(states) * 100),
            "note": "状态探测：" + "、".join(f"{k}={'有' if v else '无'}" for k, v in states.items()),
        },
        "field": {
            "proxy": None,
            "note": "字段维度需对照 PRD 字段表或业务线上页表单，脚本不做代理判定",
        },
        "visual": {
            "proxy": round((f["token_ratio"] or 0) * 100),
            "note": f"令牌占比 {f['token_ratio']:.0%}" if f["token_ratio"] is not None else "无自有样式",
        },
    }


# ---------------------------------------------------------------- 聚合

def aggregate(f, gates, llm):
    obj, comp_ev = score_component(f)
    proxy = score_objective_proxy(f)

    dims = {
        "component": {"score": obj, "source": "script", "confidence": 0.95, "evidence": comp_ev},
    }

    unscored = []
    for d in ("structure", "interaction", "visual", "field"):
        entry = (llm or {}).get(d)
        if isinstance(entry, dict) and isinstance(entry.get("score"), int):
            dims[d] = {
                "score": entry["score"],
                "source": "llm",
                "confidence": entry.get("confidence", 0.6),
                "evidence": entry.get("evidence", []),
                "reason": entry.get("reason", ""),
            }
        elif isinstance(entry, int):
            dims[d] = {"score": entry, "source": "llm", "confidence": 0.5, "evidence": [], "reason": ""}
        else:
            unscored.append(d)
            dims[d] = {"score": None, "source": "unscored", "confidence": 0.0,
                       "evidence": [proxy[d]["note"]]}

    blocked_by = [g["id"] for g in gates if g["blocking"] and not g["pass"]]

    if unscored:
        overall = None
        status = "blocked" if blocked_by else "incomplete"
    else:
        overall = round(sum(dims[d]["score"] * w for d, w in WEIGHTS.items()), 1)
        floor_fail = [d for d, fl in FLOORS.items() if dims[d]["score"] < fl]
        if blocked_by:
            status = "blocked"
        elif floor_fail:
            status = "floor_fail"
            blocked_by = [f"{d}<{FLOORS[d]}" for d in floor_fail]
        elif overall < OVERALL_MIN:
            status = "below_min"
        else:
            status = "pass"

    return {
        "req": f["req"],
        "schema_version": 2,
        "generated_at": dt.datetime.now().isoformat(timespec="seconds"),
        "rendered": f["rendered"],
        "dom_note": f["dom_note"],
        "gates": gates,
        "dimensions": dims,
        "weights": WEIGHTS,
        "floors": FLOORS,
        "overall": overall,
        "status": status,
        "blocked_by": blocked_by,
        "objective_proxy": proxy,
        # 兼容 sync_demo_to_feishu.py 的旧字段
        "structure": dims["structure"]["score"],
        "component": dims["component"]["score"],
        "interaction": dims["interaction"]["score"],
        "visual": dims["visual"]["score"],
        "field": dims["field"]["score"],
        "reason": "；".join(
            dims[d].get("reason") or "" for d in ("structure", "interaction", "visual", "field")
        ).strip("；"),
    }


# ---------------------------------------------------------------- 输出

def print_report(q):
    print("=" * 64)
    print(f"demo 质量评分 · {q['req'] or '(未指定 REQ)'}")
    print("=" * 64)
    print(f"运行时渲染：{'成功' if q['rendered'] else '失败（' + (q['dom_note'] or '') + '）'}")
    print("\n[质量门]")
    for g in q["gates"]:
        print(f"  {'PASS' if g['pass'] else 'FAIL'}  {g['id']} {g['name']}")
        for e in g["evidence"]:
            print(f"        · {e}")
    print("\n[维度]")
    for d, w in q["weights"].items():
        dim = q["dimensions"][d]
        s = "—" if dim["score"] is None else dim["score"]
        print(f"  {d:<12} {str(s):>4} × {w:.2f}  [{dim['source']}, conf={dim['confidence']}]")
        for e in dim["evidence"][:4]:
            print(f"        · {e}")
    print("\n" + "-" * 64)
    print(f"综合还原度：{'—（缺分）' if q['overall'] is None else q['overall']}")
    print(f"结论：{q['status']}" + (f"  拦截原因：{', '.join(q['blocked_by'])}" if q["blocked_by"] else ""))


def main():
    ap = argparse.ArgumentParser(description="demo 质量评分 v2（三层取数 + 质量门 + 分维下限）")
    ap.add_argument("--demo", required=True)
    ap.add_argument("--req", default="")
    ap.add_argument("--llm", default="", help="语义分文件（Agent 按 rubric 产出）")
    ap.add_argument("--write", action="store_true", help="写回同目录 quality.json")
    ap.add_argument("--json", action="store_true", help="stdout 输出 JSON")
    ap.add_argument("--check", action="store_true", help="只跑质量门，退出码表达结果")
    ap.add_argument("--budget", type=int, default=5000, help="渲染等待毫秒（默认 5000）")
    args = ap.parse_args()

    demo = Path(args.demo).resolve()
    if not demo.is_file():
        print(f"[错误] 找不到 demo: {demo}", file=sys.stderr)
        sys.exit(3)

    llm = None
    if args.llm:
        p = Path(args.llm)
        if not p.is_file():
            print(f"[错误] 找不到语义分文件: {p}", file=sys.stderr)
            sys.exit(3)
        llm = json.loads(read_text(p))

    f = collect_facts(demo, args.req)
    f["dom_bytes"] = f["dom_bytes"]
    gates = evaluate_gates(f)
    q = aggregate(f, gates, llm)

    if args.json:
        print(json.dumps(q, ensure_ascii=False, indent=2))
    else:
        print_report(q)

    if args.write:
        out = demo.parent / "quality.json"
        out.write_text(json.dumps(q, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"\n[写回] {out}")

    if args.check:
        sys.exit(0 if q["status"] == "pass" else 2)
    if q["status"] in ("blocked", "floor_fail", "below_min"):
        sys.exit(2)
    if q["status"] == "incomplete":
        sys.exit(4)


if __name__ == "__main__":
    main()
