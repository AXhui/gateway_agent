#!/usr/bin/env python3
"""
组件还原度打分脚本 —— 把「组件维度」从 AI 自评拍脑袋，变成可执行、可复核的规则打分。

原理
----
纯 Python 读文件分析，不碰网络、不运行浏览器。按 5 条规则检查 demo.html，
加权算出 0-100 的 component 分，并输出每项扣分明细，供 UED 复核时追溯。

5 条规则（默认权重 20/20/25/15/20，可用 --weights 覆盖）：
  ① 组件库命中率  20%  demo 里组件库类（bc-*/ms-*）占全部 class 的比例，自造类越多分越低
  ② 注册表覆盖    20%  用到的 bc-*/ms-* 类是否在组件资产（library/*.css + registry-*.js）注册过
  ③ 契约调用      25%  该用现成 B_* 组件的地方，是否按契约以 ctx 调用（MS_BIZ_INDEX[id].render），
                        有没有绕过注册组件手写渲染函数（自我生产）
  ④ 壳契约        15%  EG71 demo 是否用统一壳（MS_EG71_SHELL.render + .bind），有没有页面私有壳结构
  ⑤ 设计令牌      20%  样式是否引用 var(--*) 令牌；裸色值 / 裸间距越多分越低

用法
----
    # 只打分（输出到 stdout）
    python tools/score_component.py --demo 05_release/REQ-005/demo.html

    # 打分并把 component 分写回同目录 quality.json（其余 4 维不动）
    python tools/score_component.py --demo 05_release/REQ-005/demo.html --write

    # 打分并把完整明细另存为同目录 score_component.json
    python tools/score_component.py --demo 05_release/REQ-005/demo.html --report

    # 自定义权重（顺序：命中率/覆盖/契约/壳/令牌）
    python tools/score_component.py --demo 05_release/REQ-005/demo.html --weights 20 20 25 15 20

退出码：0=成功；2=输入文件缺失或无法解析；3=权重配置非法。
"""

import argparse
import json
import os
import re
import sys
from pathlib import Path

# 仓库根目录 = 本脚本所在目录的上一级（tools/ 的父目录）
REPO_ROOT = Path(__file__).resolve().parent.parent

# 组件资产真源（注册表与组件库定义均以仓库内真源为准，不采信 demo 内联副本）
ASSET_FILES = {
    "business_css": REPO_ROOT / "library" / "business.css",
    "base_css": REPO_ROOT / "library" / "base.css",
    "tokens_css": REPO_ROOT / ".claude" / "tokens" / "tokens.css",
    "registry_business_js": REPO_ROOT / "assets" / "js" / "registry-business.js",
    "registry_base_js": REPO_ROOT / "assets" / "js" / "registry-base.js",
}

# 页面私有壳结构的典型信号：页面层直接拼 shell/topbar/sider 结构类
SHELL_PRIVATE_CLASS_MARKERS = (
    "ms-sidebar",
    "ms-topbar",
    "bc-eg71-sidenav",
    "ms-nav-item",
    "ms-sidebar-brand",
)

# 组件级自我生产：手写 Modal/Confirm/Drawer/Dialog/Popup/Toast 等本应走注册组件的函数。
# 注意：cellHtml/rowHtml/tableHtml/sectionHtml/tabsHtml 等是页面装配辅助函数，
# 不是绕过注册组件的自我生产，不扣。
HANDWRITTEN_FN_PATTERNS = re.compile(
    r"function\s+([A-Za-z_$][\w$]*(?:Modal|Confirm|Drawer|Dialog|Popup|Toast)\w*)\s*\("
    r"|\bconst\s+([A-Za-z_$][\w$]*(?:Modal|Confirm|Drawer|Dialog|Popup|Toast)\w*)\s*=",
    re.IGNORECASE,
)

# CSS 变量定义行（--name: value;）——其中的色值/间距是令牌定义，不是裸值使用
CSS_VAR_DEF_LINE = re.compile(r"^\s*--[\w-]+\s*:", re.MULTILINE)


def read_text(path: Path) -> str:
    """读取文本文件，容错 UTF-8 BOM。"""
    with open(path, "r", encoding="utf-8-sig", errors="replace") as f:
        return f.read()


def split_style_and_body(html: str):
    """把单文件 HTML 拆成 <style> 内容与其余（body 标记 + 脚本）文本。"""
    styles = []
    rest = []
    pos = 0
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", html, re.S | re.I):
        styles.append(m.group(1))
        rest.append(html[pos:m.start()])
        pos = m.end()
    rest.append(html[pos:])
    return "\n".join(styles), "\n".join(rest)


# 资产内联块判定：demo 会把组件库 JS 资产整段内联进 <script>，
# 这些块是「组件库代码」而非「页面代码」，打分时必须区分开。
ASSET_DEF_PATTERNS = [
    r"window\.MS_BASE_COMPONENTS\s*=",
    r"window\.MS_BIZ_COMPONENTS\s*=",
    r"window\.MS_ICONS\s*=",
    r"window\.MS_BIZ_UTIL\s*=",
    r"window\.MS_DATA\s*=",
    r"window\.MS_ENTITIES\s*=",
    r"window\.MS_BASE_INDEX\s*=",
    r"window\.MS_BASE_LOGO",
    r"window\.MS_ENTITY_FALLBACK\s*=",
]
_ASSET_DEF_RE = re.compile("|".join(ASSET_DEF_PATTERNS))


def split_script_blocks(html: str):
    """按 <script> 块切分：返回 (资产内联代码, 页面代码, 全部脚本)。

    资产内联块 = 定义了 window.MS_* 组件资产的块（组件库代码）；
    其余 script 块 = 页面代码（页面装配 / 交互逻辑）。
    """
    blocks = [m.group(1) for m in re.finditer(
        r"<script[^>]*>(.*?)</script>", html, re.S | re.I)]
    asset_blocks, page_blocks = [], []
    for b in blocks:
        if _ASSET_DEF_RE.search(b):
            asset_blocks.append(b)
        else:
            page_blocks.append(b)
    return "\n".join(asset_blocks), "\n".join(page_blocks), "\n".join(blocks)


def extract_html_markup(html: str) -> str:
    """只提取真正的 HTML 标记文本：剔除 <style> 与 <script> 块。

    避免把 JS 模板字符串里的 `class="${...}"` 误当成页面实际使用的 class。
    """
    # 先把 style / script 整块替换为占位，只保留标记与文本
    stripped = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S | re.I)
    stripped = re.sub(r"<script[^>]*>.*?</script>", "", stripped, flags=re.S | re.I)
    return stripped


def clean_class_token(token: str) -> str | None:
    """清洗单个 class 名：去掉模板表达式残留、空白，返回有效类名或 None。"""
    t = token.strip().rstrip("}")
    if not t or "{" in t or "}" in t or "${" in t or "$" in t or "`" in t:
        return None
    # 去掉可能的引号残留与拼接残留
    t = t.strip("\"'")
    if not t or not re.match(r"^[A-Za-z_][\w-]*$", t):
        return None
    return t


def collect_classes_from_text(text: str) -> set:
    """从文本（HTML 标记或 JS 模板字符串）中收集实际使用的 class（去重、清洗模板残留）。"""
    used = set()
    for m in re.finditer(r'class\s*=\s*["\']([^"\']+)["\']', text):
        for c in m.group(1).split():
            clean = clean_class_token(c)
            if clean:
                used.add(clean)
    return used


def collect_page_classes(markup: str, page_js: str) -> set:
    """收集页面实际使用的 class：优先取页面代码 JS 模板字符串里的 class，
    若页面是静态 HTML（无 JS 渲染），回退到 HTML 标记里的 class。"""
    used = collect_classes_from_text(page_js)
    if not used:
        used = collect_classes_from_text(markup)
    return used


def collect_registered_classes():
    """从组件资产真源收集已注册的 bc-* / ms-* 类集合。

    数据来源（三路合并，避免漏报）：
      - library/business.css 与 library/base.css 中的类选择器（.bc-xxx / .ms-xxx）
      - registry-*.js 中出现的所有 bc-*/ms-* 类名（含组件模板字符串里的类名，
        不再只认 id: 'xxx' 这一种形式，避免 EG71 业务组件被误判为未注册）
    """
    registered = set()
    css_text = ""
    for key in ("business_css", "base_css"):
        p = ASSET_FILES[key]
        if p.is_file():
            css_text += read_text(p) + "\n"
    # CSS 类选择器
    registered.update(re.findall(r"\.(bc-[\w-]+)", css_text))
    registered.update(re.findall(r"\.(ms-[\w-]+)", css_text))
    # registry JS 里所有出现的 bc-*/ms-* 类名（含模板字符串、注释、对象 key）
    for key in ("registry_business_js", "registry_base_js"):
        p = ASSET_FILES[key]
        if not p.is_file():
            continue
        js = read_text(p)
        registered.update(re.findall(r"\b(bc-[\w-]+)\b", js))
        registered.update(re.findall(r"\b(ms-[\w-]+)\b", js))
    return registered


def collect_all_classes(html: str) -> set:
    """从整段 HTML（含 <style>、<script>、JS 模板字符串）收集所有 class= 属性后的类名。

    对「壳 + JS 装配」架构的 demo，class 全部在 <script> 模板字符串里，
    不能按 markup/page_js 二分（否则会把整段 script 误判为资产代码而漏掉所有 class）。
    资产块里组件库自身模板的 class 都是合法 bc-*/ms-*，自然在注册清单里，不会误扣。
    """
    used = set()
    for m in re.finditer(r'class\s*=\s*["\']([^"\']+)["\']', html):
        for c in m.group(1).split():
            clean = clean_class_token(c)
            if clean:
                used.add(clean)
    return used


def check_library_hit_rate(used: set):
    """规则①：组件库命中率。

    统计页面实际使用的 class（去重）：组件库类（bc-*/ms-*）占比越高越好，
    页面私有自造类（非组件前缀）越多，分越低。
    """
    if not used:
        return 0.0, 0, 0, ["页面没有检测到任何 class，无法判定组件库使用情况"]

    lib_classes = [c for c in used if c.startswith("bc-") or c.startswith("ms-")]
    private_classes = sorted(used - set(lib_classes))
    hit_rate = len(lib_classes) / len(used)

    # 命中率映射：100% → 100 分；每降 10% 扣 10 分（自造类越多分越低）
    score = round(max(0, hit_rate * 100))
    notes = [
        f"检测到组件库类 {len(lib_classes)} 个 / 全部类 {len(used)} 个，命中率 {hit_rate:.0%}",
    ]
    if private_classes:
        notes.append(f"自造类 {len(private_classes)} 个：{', '.join(private_classes[:12])}"
                     + (" …" if len(private_classes) > 12 else ""))
    else:
        notes.append("未发现自造 class，全部为组件库类")
    return score, len(lib_classes), len(used), notes


def check_registry_coverage(used: set, registered: set):
    """规则②：注册表覆盖。

    用到的每个 bc-*/ms-* 类，是否在组件资产真源注册过；未注册的视为「野路子类」扣分。
    """
    used = {c for c in used if c.startswith("bc-") or c.startswith("ms-")}
    if not used:
        return 0.0, 0, 0, ["页面未检测到组件库类"]

    unregistered = sorted(c for c in used if c not in registered)
    covered = len(used) - len(unregistered)
    ratio = covered / len(used)
    # 覆盖率映射：100% → 100 分；每 5% 缺失扣 8 分
    score = round(max(0, 100 - (1 - ratio) * 160))
    notes = [f"使用的组件类 {len(used)} 个，其中 {covered} 个在组件资产中注册（覆盖率 {ratio:.0%}）"]
    if unregistered:
        notes.append(f"未注册类 {len(unregistered)} 个：{', '.join(unregistered[:12])}"
                     + (" …" if len(unregistered) > 12 else ""))
    else:
        notes.append("全部组件类均已注册")
    return score, covered, len(used), notes


def check_contract_calls(full_html: str):
    """规则③：契约调用（禁止自我生产）。

    正向：整段 HTML（含 JS 装配代码）中按契约以注册表索引调用 render。
    负向：出现与已注册业务形态重叠的手写渲染函数（xxxConfirmHtml 之类）。
    统计时不剔除资产块——资产定义里不会出现 MS_BIZ_INDEX['id'].render() 这种页面调用。
    """
    # 正向信号：按注册表索引调用 render
    index_calls = len(re.findall(
        r"MS_BIZ_INDEX\s*\[\s*['\"](?:bc|ms)-[\w-]+['\"]\s*\]\s*\.\s*render\s*\(",
        full_html,
    ))
    b_index_calls = len(re.findall(
        r"\bB\s*\[\s*['\"](?:bc|ms)-[\w-]+['\"]\s*\]\s*\.\s*render\s*\(",
        full_html,
    ))
    qualified_calls = index_calls + b_index_calls

    # 负向信号：手写渲染函数定义（函数名与注册形态重叠）
    handwritten = []
    for m in HANDWRITTEN_FN_PATTERNS.finditer(full_html):
        name = m.group(1) or m.group(2) or m.group(3) or m.group(4)
        if name and name not in handwritten:
            handwritten.append(name)

    notes = [f"按注册表契约调用 render 共 {qualified_calls} 处（MS_BIZ_INDEX={index_calls}，B[]={b_index_calls}）"]
    # 以正向契约调用为主要评分依据（页面在用注册组件）
    if qualified_calls >= 10:
        score = 100
    elif qualified_calls >= 5:
        score = 85
    elif qualified_calls >= 1:
        score = 60
    else:
        score = 30

    # 负向：手写 Modal/Drawer/Toast 等组件级函数，每处轻扣 4 分（最多扣 30 分）
    # 注意：被注册表 render(ctx) 指向的函数（如 renderEg71Modal）是组件定义，不算自我生产
    if handwritten:
        # 排除"被注册表指向"的函数（形如 render(ctx) { return xxxFn(ctx) }）
        real_handwritten = []
        for fn in handwritten:
            # 如果 fn 在文件里被 render(ctx){ return fn(ctx...) } 这种注册指向引用，跳过
            if re.search(rf"render\s*\(\s*ctx\s*\)\s*\{{\s*return\s+{re.escape(fn)}\s*\(", full_html):
                continue
            real_handwritten.append(fn)
        if real_handwritten:
            penalty = min(30, len(real_handwritten) * 4)
            score = max(0, score - penalty)
            notes.append(f"疑似手写组件级函数 {len(real_handwritten)} 个（已排除注册表指向）：{', '.join(real_handwritten[:10])}"
                         + (" …" if len(real_handwritten) > 10 else ""))
        else:
            notes.append("检测到的 Modal/Drawer 函数均为注册表组件定义或封装，非自我生产")
    else:
        notes.append("未发现手写组件级函数")
    return score, qualified_calls, len(handwritten), notes


def check_shell_contract(full_html: str, markup: str):
    """规则④：壳契约。

    EG71 demo 必须使用统一壳：调用 MS_EG71_SHELL 的 render 与 bind。
    在整段 HTML 上统计（资产定义 window.MS_EG71_SHELL={...} 里的 render 是函数定义，
    不是页面调用）。
    """
    has_shell_def = bool(re.search(r"window\.MS_EG71_SHELL\s*=", full_html))
    # 调用形式：MS_EG71_SHELL.render(  /  MS_EG71_SHELL.bind(  （排除 .render = function 定义）
    shell_render_calls = len(re.findall(
        r"MS_EG71_SHELL\s*\.\s*render\s*\(", full_html))
    shell_bind_calls = len(re.findall(
        r"MS_EG71_SHELL\s*\.\s*bind\s*\(", full_html))

    notes = []
    score = 100

    if not has_shell_def:
        notes.append("未检测到 window.MS_EG71_SHELL 定义，页面没有使用统一壳")
        score -= 40
    else:
        notes.append("检测到统一壳 MS_EG71_SHELL 定义")

    if shell_render_calls == 0:
        notes.append("未检测到 MS_EG71_SHELL.render 调用")
        score -= 30
    else:
        notes.append(f"MS_EG71_SHELL.render 调用 {shell_render_calls} 次")

    if shell_bind_calls == 0:
        notes.append("未检测到 MS_EG71_SHELL.bind 调用（壳交互未挂载）")
        score -= 15
    else:
        notes.append(f"MS_EG71_SHELL.bind 调用 {shell_bind_calls} 次")

    # 页面私有壳结构：在剔除 style/script 后的静态标记里直接出现壳结构类
    private_shell_hits = []
    for marker in SHELL_PRIVATE_CLASS_MARKERS:
        hits = re.findall(rf'class\s*=\s*["\'][^"\']*\b{re.escape(marker)}\b[^"\']*["\']', markup)
        if hits:
            private_shell_hits.append(marker)
    if private_shell_hits:
        notes.append(f"页面标记中出现壳结构类（{', '.join(private_shell_hits)}），疑似页面私有壳")
        score -= 20

    return max(0, score), has_shell_def, shell_render_calls, notes


def check_design_tokens(css_text: str):
    """规则⑤：设计令牌。

    统计 <style> 中 var(--*) 引用与裸值（hex 色、rgb(a)、px 间距/字号）的比例。
    令牌定义行（--name: value）中的色值与间距是令牌本身，不计入「裸值」。
    """
    # 把令牌定义行从统计文本中剔除，避免把定义误判为裸值使用
    lines = css_text.splitlines()
    use_lines = [ln for ln in lines if not CSS_VAR_DEF_LINE.match(ln)]
    use_text = "\n".join(use_lines)

    token_refs = len(re.findall(r"var\(\s*--[\w-]+\s*\)", css_text))
    hex_colors = len(re.findall(r"#[0-9a-fA-F]{3,8}\b", use_text))
    rgb_colors = len(re.findall(r"rgba?\([^)]*\)", use_text))
    px_values = len(re.findall(r"-?\d+(?:\.\d+)?px\b", use_text))
    raw_values = hex_colors + rgb_colors + px_values

    total = token_refs + raw_values
    if total == 0:
        return 0.0, token_refs, raw_values, ["样式块为空或无法解析，令牌检查跳过"]

    token_ratio = token_refs / total
    # 令牌占比映射：100% → 100 分；每 10% 缺失扣 12 分（裸值越多扣越多）
    score = round(max(0, 100 - (1 - token_ratio) * 120))
    notes = [
        f"var(--*) 令牌引用 {token_refs} 处；裸值 {raw_values} 处（hex {hex_colors} / rgb {rgb_colors} / px {px_values}）",
        f"令牌占比 {token_ratio:.0%}",
    ]
    if raw_values == 0:
        notes.append("未发现裸色值与裸间距，全部引用设计令牌")
    elif token_ratio >= 0.8:
        notes.append("令牌占比达标（≥80%）")
    else:
        notes.append("裸值偏多，建议改用 var(--*) 令牌")
    return score, token_refs, raw_values, notes


def compute_score(demo_path: Path, weights) -> dict:
    """对单个 demo.html 执行 5 项检查，返回分数与明细。"""
    html = read_text(demo_path)
    css_text, _ = split_style_and_body(html)
    markup = extract_html_markup(html)

    registered = collect_registered_classes()
    # class 从整段 HTML 收集（含 JS 模板字符串）——JS 装配 demo 的 class 在 script 里
    used = collect_all_classes(html)

    checks = {}
    checks["① 组件库命中率"] = check_library_hit_rate(used)
    checks["② 注册表覆盖"] = check_registry_coverage(used, registered)
    checks["③ 契约调用"] = check_contract_calls(html)
    checks["④ 壳契约"] = check_shell_contract(html, markup)
    checks["⑤ 设计令牌"] = check_design_tokens(css_text)

    total = 0.0
    detail = []
    for name, (score, a, b, notes) in checks.items():
        weight = weights[list(checks).index(name)]
        total += score * weight
        detail.append({
            "rule": name,
            "weight": weight,
            "score": score,
            "summary": f"{score} 分（权重 {weight}%）",
            "detail": notes,
        })

    final_score = round(total / 100)
    return {
        "demo": str(demo_path),
        "component_score": final_score,
        "weights": weights,
        "checks": detail,
    }


def main():
    parser = argparse.ArgumentParser(
        description="组件还原度打分：按 5 条规则自动算出 component 分（替代 AI 拍脑袋）"
    )
    parser.add_argument("--demo", required=True, help="demo.html 路径（必填）")
    parser.add_argument(
        "--weights",
        type=float,
        nargs=5,
        metavar=("HIT", "COVER", "CONTRACT", "SHELL", "TOKEN"),
        default=[20, 20, 25, 15, 20],
        help="5 项权重（顺序：命中率/覆盖/契约/壳/令牌），默认 20 20 25 15 20，合计应=100",
    )
    parser.add_argument("--write", action="store_true", help="把 component 分写回同目录 quality.json（其余字段不动）")
    parser.add_argument("--report", action="store_true", help="把完整明细另存为同目录 score_component.json")
    args = parser.parse_args()

    demo = Path(args.demo).resolve()
    if not demo.is_file():
        print(f"[错误] 找不到 demo 文件: {demo}", file=sys.stderr)
        sys.exit(2)

    if sum(args.weights) <= 0:
        print("[错误] 权重合计必须大于 0", file=sys.stderr)
        sys.exit(3)

    try:
        result = compute_score(demo, list(args.weights))
    except Exception as e:
        print(f"[错误] 分析失败: {e}", file=sys.stderr)
        sys.exit(2)

    print("=" * 60)
    print(f"组件还原度打分：{result['demo']}")
    print("=" * 60)
    for c in result["checks"]:
        print(f"\n[{c['rule']}] 权重 {c['weight']}% → {c['score']} 分")
        for n in c["detail"]:
            print(f"  · {n}")
    print("\n" + "=" * 60)
    print(f"★ 组件还原度 component 分 = {result['component_score']} / 100")

    # 写回 quality.json（--write）
    if args.write:
        qpath = demo.parent / "quality.json"
        if not qpath.is_file():
            print(f"[警告] 未找到 {qpath}，跳过写回", file=sys.stderr)
        else:
            try:
                q = json.loads(read_text(qpath))
            except Exception as e:
                print(f"[错误] 读取 {qpath} 失败: {e}", file=sys.stderr)
                sys.exit(2)
            old = q.get("component")
            q["component"] = result["component_score"]
            with open(qpath, "w", encoding="utf-8") as f:
                json.dump(q, f, ensure_ascii=False, indent=2)
                f.write("\n")
            print(f"[写回] {qpath}：component {old} → {result['component_score']}（其余维度未动）")

    # 另存明细（--report）
    if args.report:
        rpath = demo.parent / "score_component.json"
        with open(rpath, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"[报告] 明细已保存: {rpath}")


if __name__ == "__main__":
    main()
