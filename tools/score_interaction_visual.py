#!/usr/bin/env python3
r"""
交互 + 视觉还原度打分脚本 —— 把「交互」「视觉」两个维度从 AI 自评拍脑袋，
变成可执行、可复核的规则打分（与 score_component.py / score_fidelity.py 平行，同属 L1 规则层）。

规则来源
--------
.claude/rules/scoring.md §4.③④ 扣分表 + .claude/rules/spacing.md 红线数值的静态可检测子集。

关键口径：**交互检测用全 HTML（含资产块），视觉检测只查业务样式**。

交互检测为何用全文：demo 架构是「壳 + JS 装配」，部分 demo（如 REQ-005/014/016）把资产
（组件库 registry）与业务装配混在同一个 script 块里，按块拆分会把业务代码全部豁免。
组件库是全 demo 共享的常量（其内部 addEventListener/toast 定义对所有 demo 贡献相同），
用全文统计仍能公平区分 demo 之间的装配差异——与 score_fidelity.py 的装配活跃度口径一致。

视觉检测只对「页面自己写的样式」生效（库自身已知偏差是 spacing §7 的账，不是 demo 的账）：
  - CSS 规则级判定：选择器含 req\d+ / \bcr\b / mod- 等业务类的规则才检查
  - 手写 svg / 裸标题只查静态 HTML（单块混合下 JS 模板字符串无法区分资产/业务，为已知边界）

交互还原度（interaction）——5 条子规则（权重 20/25/20/20/15）：
  ① 事件绑定充分性  20%  全文 addEventListener/onclick 调用数；过少说明纯展示页
  ② 操作反馈完备    25%  有交互就应有反馈（toast/showMsg/message 组件调用）
  ③ 空态/加载态     20%  有列表/表格渲染就应有 ms-empty/ms-spin 空态加载态兜底
  ④ 危险操作确认    20%  删除/禁用/清除类操作必须配 confirm/Modal 二次确认
  ⑤ 键盘可达性      15%  有 modal/drawer 就应有 Esc（keydown 27/Escape）关闭

视觉还原度（visual）——4 条子规则（权重 30/25/20/25）：
  ① 字号红线        30%  合法集合 12/14/16/18/20/24/28/30（18 仅数值展示从宽豁免；13 全场景禁用）
  ② 图标尺寸阶梯    25%  合法阶梯 12/16/18/20/24/32/44（装饰微标 12 例外，区间 16≤s≤44）
  ③ 间距阶梯        20%  padding/margin/gap 裸 px 值合法集合 4/8/12/16/20/24/32/40/48/64（0 豁免）
  ④ 手写图标/裸标题 25%  静态 HTML 里的手写 <svg>、裸 h1-h6 标签（应走 S_Icon/S_Typography）

已知边界（对齐 scoring.md §6）：
  - 视觉「对标 Figma 实测偏差」「主色语义色用错」等需要渲染或设计稿比对的条款不在本脚本
    覆盖范围，仍归 UED 人工复核（L3）；本脚本只做静态红线。
  - 交互「行为与 PRD 相反」「状态保持回滚」需要理解业务语义，不在静态检测范围，
    仍归 TEST 人工走查；本脚本只做结构完备性检查。

用法
----
    python tools/score_interaction_visual.py --demo 05_release/REQ-005/demo.html
    python tools/score_interaction_visual.py --demo 05_release/REQ-005/demo.html --write
    python tools/score_interaction_visual.py --demo 05_release/REQ-005/demo.html --report
"""

import argparse
import json
import re
import sys
from pathlib import Path

# ================= 通用工具 =================

def read_text(p: Path) -> str:
    with open(p, "r", encoding="utf-8-sig", errors="replace") as f:
        return f.read()


def strip_static(html: str) -> str:
    """剔除 style/script 块，只留静态 HTML。"""
    s = re.sub(r"<style[^>]*>.*?</style>", "", html, flags=re.S | re.I)
    s = re.sub(r"<script[^>]*>.*?</script>", "", s, flags=re.S | re.I)
    return s


def split_css_rules(css_text: str):
    """把 CSS 文本拆成 (selector, body) 列表（忽略 @media 嵌套，直接展平取所有规则）。"""
    rules = []
    for m in re.finditer(r"([^{}]+)\{([^{}]*)\}", css_text):
        sel, body = m.group(1).strip(), m.group(2)
        if sel.startswith("@") or not sel:
            continue
        rules.append((sel, body))
    return rules


BIZ_SELECTOR_RE = re.compile(r"\.(?:req\d+|cr|mod-)[\w-]*|req\d+-[\w-]*")


def extract_biz_css(html: str) -> str:
    """从全部 style 块中提取业务 CSS 规则（选择器含 req\d+/cr/mod- 类）。
    资产规则（.ms-/.bc- 组件定义、L1 令牌层）全部豁免——库的已知偏差不是 demo 的账。"""
    biz_bodies = []
    for m in re.finditer(r"<style[^>]*>(.*?)</style>", html, re.S | re.I):
        for sel, body in split_css_rules(m.group(1)):
            if BIZ_SELECTOR_RE.search(sel):
                biz_bodies.append(f"{sel}{{{body}}}")
    return "\n".join(biz_bodies)


# ================= 交互规则（输入用全 HTML，口径见文件头说明） =================

def check_event_binding(html: str, static_html: str):
    """交互 ①：事件绑定充分性（全文口径，含组件库常量贡献，阈值按全量校准）。"""
    js_events = len(re.findall(r"addEventListener|\.onclick\s*=", html))
    html_events = len(re.findall(r"\bonclick\s*=", static_html))
    total = js_events + html_events
    notes = [f"事件绑定 {total} 处（JS（含资产常量）{js_events} / 静态 onclick {html_events}）"]
    if total >= 30:
        score, tag = 100, "交互绑定充足（≥30，满分）"
    elif total >= 15:
        score, tag = 85, "交互绑定良好（15~29）"
    elif total >= 5:
        score, tag = 60, "交互绑定偏少（5~14），页面接近纯展示"
    else:
        score, tag = 30, "事件绑定过少（<5），纯静态展示页"
    notes.append(tag)
    return float(score), total, 0, notes


def check_action_feedback(html: str, events: int):
    """交互 ②：操作反馈完备（有操作就应有 toast/message 反馈）。"""
    feedbacks = len(re.findall(r"toast|showMsg|showMessage|ms-message|MS_BIZ_UTIL\.msg", html, re.I))
    notes = [f"反馈提示调用 {feedbacks} 处（toast/showMsg/message）"]
    if events == 0:
        score, tag = 60, "无事件绑定，反馈检查不适用（取中性分）"
    elif feedbacks >= 10:
        score, tag = 100, "操作反馈完备（≥10 处）"
    elif feedbacks >= 3:
        score, tag = 85, "操作反馈良好（3~9 处）"
    elif feedbacks >= 1:
        score, tag = 65, "反馈偏少（1~2 处），部分操作可能无反馈"
    else:
        score, tag = 40, "有交互绑定但零反馈调用，点击后用户无感知"
    notes.append(tag)
    return float(score), feedbacks, 0, notes


def check_empty_loading(html: str):
    """交互 ③：空态/加载态兜底（有列表渲染就应有 ms-empty/ms-spin）。"""
    has_list = bool(re.search(r"renderTable|<table\b|(?:fields|columns)\.map|ms-table", html, re.I))
    empty_refs = len(re.findall(r"ms-empty|--empty|emptyState|empty-state", html, re.I))
    loading_refs = len(re.findall(r"ms-spin|loading|spinner", html, re.I))
    notes = [f"列表渲染信号={'有' if has_list else '无'}；空态引用 {empty_refs} 处；加载引用 {loading_refs} 处"]
    if not has_list:
        score, tag = 80, "无列表/表格渲染，空态检查不适用（取中性分）"
    elif empty_refs >= 5 and loading_refs >= 5:
        score, tag = 100, "空态与加载态兜底齐全"
    elif empty_refs >= 1 or loading_refs >= 1:
        score, tag = 60, "空态/加载态覆盖不足（T2 条款 −10/处）"
    else:
        score, tag = 30, "有列表渲染但无空态/加载态兜底（B 类断链）"
    notes.append(tag)
    return float(score), empty_refs + loading_refs, 0, notes


def check_danger_confirm(html: str):
    """交互 ④：危险操作二次确认。"""
    danger_ops = len(re.findall(
        r"(?:delete|remove|清除|删除|禁用|disable\w*)\w*\s*[(:=]", html, re.I))
    confirms = len(re.findall(
        r"confirm\w*\s*[(:=]|确认删除|确认禁用|openModal|ms-modal|Modal\.", html, re.I))
    notes = [f"危险操作信号 {danger_ops} 处；确认弹窗信号 {confirms} 处"]
    if danger_ops == 0:
        score, tag = 100, "未检测到删除/禁用类危险操作（中性满分）"
    elif confirms >= danger_ops:
        score, tag = 100, f"危险操作 {danger_ops} 处均有确认弹窗覆盖"
    elif confirms >= 1:
        ratio = confirms / danger_ops
        score, tag = round(40 + 60 * min(1.0, ratio)), f"确认弹窗 {confirms} 处，覆盖比 {ratio:.0%}"
    else:
        score, tag = 30, f"危险操作 {danger_ops} 处零确认弹窗（必备状态集 −10/处）"
    notes.append(tag)
    return float(score), danger_ops, confirms, notes


def check_keyboard_esc(html: str):
    """交互 ⑤：键盘可达性（有弹层就应有 Esc 关闭）。"""
    has_layer = bool(re.search(r"ms-modal|ms-drawer|openModal|showModal|Modal|Drawer", html))
    has_esc = bool(re.search(r"Escape|keyCode\s*===?\s*27|key\s*===?\s*['\"]Esc", html))
    notes = [f"弹层信号={'有' if has_layer else '无'}；Esc 监听={'有' if has_esc else '无'}"]
    if not has_layer:
        score, tag = 100, "无弹层，Esc 检查不适用（中性满分）"
    elif has_esc:
        score, tag = 100, "弹层配了 Esc 关闭（键盘可达）"
    else:
        score, tag = 50, "有弹层但无 Esc 关闭（键盘可达性缺失，T5 条款 −3/处）"
    notes.append(tag)
    return float(score), int(has_layer), int(has_esc), notes


# ================= 视觉规则 =================

FONT_SIZE_ALLOWED = {12, 14, 16, 18, 20, 24, 28, 30}
ICON_SIZE_ALLOWED = {12, 16, 18, 20, 24, 32, 44}
SPACING_ALLOWED = {0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64}


def check_font_redline(biz_css: str, biz_js: str):
    """视觉 ①：字号红线（spacing §4：13 全场景禁用；集合 12/14/16/18/20/24/28/30）。"""
    targets = []
    for m in re.finditer(r"font-size\s*:\s*(\d+(?:\.\d+)?)px", biz_css):
        targets.append((float(m.group(1)), m.group(0)))
    for m in re.finditer(r"font-size:\s*(\d+(?:\.\d+)?)px", biz_js):
        targets.append((float(m.group(1)), m.group(0)))
    bad = [t for t in targets if t[0] not in FONT_SIZE_ALLOWED]
    notes = [f"业务样式字号声明 {len(targets)} 处，越红线 {len(bad)} 处"]
    if bad:
        samples = sorted({f"{int(v)}px" if v == int(v) else f"{v}px" for v, _ in bad})
        notes.append(f"非法字号（合法集 12/14/16/18/20/24/28/30，13 全禁）：{', '.join(samples)}")
    if not targets:
        return 100.0, 0, 0, notes + ["业务样式无字号声明（沿用组件默认），中性满分"]
    score = round(max(0, 100 - len(bad) * 8))
    if bad:
        notes.append("按 −8/处折算扣分")
    else:
        notes.append("全部字号在合法集合内")
    return float(score), len(targets), len(bad), notes


def check_icon_ladder(biz_css: str):
    """视觉 ②：图标/元素尺寸阶梯（spacing §3：16≤s≤44，阶梯 12/16/18/20/24/32/44）。"""
    targets = [float(m.group(1)) for m in re.finditer(r"(?:width|height)\s*:\s*(\d+(?:\.\d+)?)px", biz_css)]
    if not targets:
        return 100.0, 0, 0, ["业务样式无 width/height 声明，中性满分"]
    # >44 的大尺寸多为容器/图片宽高而非图标；只抓 12~44 区间内的非阶梯值（疑似图标尺寸越阶梯）
    iconish_bad = [v for v in targets if v <= 44 and v not in ICON_SIZE_ALLOWED]
    notes = [f"业务样式宽高声明 {len(targets)} 处，小尺寸越阶梯 {len(iconish_bad)} 处"]
    if iconish_bad:
        samples = sorted({f"{int(v)}px" if v == int(v) else f"{v}px" for v in iconish_bad})
        notes.append(f"非阶梯值（合法 12/16/18/20/24/32/44）：{', '.join(samples[:10])}")
    score = round(max(0, 100 - len(iconish_bad) * 6))
    if not iconish_bad:
        notes.append("小尺寸全部落阶梯")
    return float(score), len(targets), len(iconish_bad), notes


def check_spacing_ladder(biz_css: str):
    """视觉 ③：间距阶梯（spacing §1：4/8/12/16/20/24/32/40/48/64）。"""
    targets = []
    for prop in ("padding", "margin", "gap"):
        for m in re.finditer(rf"{prop}\s*:\s*([^;}}]+)", biz_css):
            for v in re.findall(r"(\d+(?:\.\d+)?)px", m.group(1)):
                targets.append(float(v))
    if not targets:
        return 100.0, 0, 0, ["业务样式无 padding/margin/gap 声明，中性满分"]
    bad = [v for v in targets if v not in SPACING_ALLOWED]
    notes = [f"业务样式间距声明 {len(targets)} 处，越阶梯 {len(bad)} 处"]
    if bad:
        samples = sorted({f"{int(v)}px" if v == int(v) else f"{v}px" for v in bad})
        notes.append(f"非阶梯值（合法 4/8/12/16/20/24/32/40/48/64）：{', '.join(samples[:12])}")
    score = round(max(0, 100 - len(bad) * 6))
    if not bad:
        notes.append("间距全部落阶梯")
    return float(score), len(targets), len(bad), notes


def check_handmade_svg(biz_js: str, static_html: str):
    """视觉 ④：手写图标/裸标题（spacing §3 引用铁律 + §4 标题规则）。
    只查静态 HTML（JS 模板字符串在单块混合架构下无法区分资产/业务，已知边界）。"""
    svg_in_static = len(re.findall(r"<svg\b", static_html))
    svg_static_legit = len(re.findall(r"<svg[^>]*data-lucide", static_html))
    bare_headings = len(re.findall(r"<h[1-6]\b", static_html))
    handmade = svg_in_static - svg_static_legit
    notes = [
        f"静态 HTML <svg> {svg_in_static} 处（合法 lucide 引用 {svg_static_legit}）；"
        f"裸 h1-h6 标签 {bare_headings} 处（JS 模板内 svg 为已知边界，未计入）",
    ]
    if handmade == 0 and bare_headings == 0:
        notes.append("无手写图标、无裸标题，引用走 S_Icon / S_Typography")
        return 100.0, 0, 0, notes
    score = round(max(0, 100 - handmade * 6 - bare_headings * 8))
    if handmade:
        notes.append(f"手写 <svg>（应走 S_Icon/MS_ICONS）{handmade} 处，−6/处")
    if bare_headings:
        notes.append(f"裸标题标签（应走 S_Typography level）{bare_headings} 处，−8/处")
    return float(score), handmade, bare_headings, notes


# ================= 汇总 =================

def compute_iv(demo_path: Path) -> dict:
    html = read_text(demo_path)
    static_html = strip_static(html)
    biz_js = ""  # 单块混合架构下不拆块；视觉字号检查的业务 JS 内联字号并入 biz_css 口径之外的补充
    biz_css = extract_biz_css(html)

    checks = {}
    checks["交互① 事件绑定充分"] = check_event_binding(html, static_html)
    events = checks["交互① 事件绑定充分"][1]
    checks["交互② 操作反馈完备"] = check_action_feedback(html, events)
    checks["交互③ 空态加载态兜底"] = check_empty_loading(html)
    checks["交互④ 危险操作确认"] = check_danger_confirm(html)
    checks["交互⑤ 键盘Esc可达"] = check_keyboard_esc(html)
    inter_total = round(
        (checks["交互① 事件绑定充分"][0] * 20
         + checks["交互② 操作反馈完备"][0] * 25
         + checks["交互③ 空态加载态兜底"][0] * 20
         + checks["交互④ 危险操作确认"][0] * 20
         + checks["交互⑤ 键盘Esc可达"][0] * 15) / 100
    )
    # 死页面惩罚：事件绑定过少时交互总分封顶 45（纯展示 demo 不能拿交互高分）
    if events < 5:
        inter_total = min(inter_total, 45)
        checks["交互① 事件绑定充分"][3].append("事件绑定 <5：交互总分封顶 45")

    checks["视觉① 字号红线"] = check_font_redline(biz_css, biz_js)
    checks["视觉② 图标尺寸阶梯"] = check_icon_ladder(biz_css)
    checks["视觉③ 间距阶梯"] = check_spacing_ladder(biz_css)
    checks["视觉④ 手写图标/裸标题"] = check_handmade_svg(biz_js, static_html)
    visual_total = round(
        (checks["视觉① 字号红线"][0] * 30
         + checks["视觉② 图标尺寸阶梯"][0] * 25
         + checks["视觉③ 间距阶梯"][0] * 20
         + checks["视觉④ 手写图标/裸标题"][0] * 25) / 100
    )

    return {
        "demo": str(demo_path),
        "interaction_score": inter_total,
        "visual_score": visual_total,
        "checks": checks,
    }


def main():
    parser = argparse.ArgumentParser(description="交互/视觉还原度打分：规则化替代 AI 拍脑袋")
    parser.add_argument("--demo", required=True, help="demo.html 路径（必填）")
    parser.add_argument("--write", action="store_true", help="把 interaction/visual 分写回同目录 quality.json")
    parser.add_argument("--report", action="store_true", help="把完整明细另存为同目录 score_interaction_visual.json")
    args = parser.parse_args()

    demo = Path(args.demo).resolve()
    if not demo.is_file():
        print(f"[错误] 找不到 demo 文件: {demo}", file=sys.stderr)
        sys.exit(2)

    try:
        result = compute_iv(demo)
    except Exception as e:
        print(f"[错误] 分析失败: {e}", file=sys.stderr)
        sys.exit(2)

    print("=" * 60)
    print(f"交互/视觉还原度打分：{result['demo']}")
    print("=" * 60)
    for name, (score, a, b, notes) in result["checks"].items():
        print(f"\n[{name}] → {score} 分")
        for n in notes:
            print(f"  · {n}")
    print("\n" + "=" * 60)
    print(f"★ 交互还原度 interaction 分 = {result['interaction_score']} / 100")
    print(f"★ 视觉还原度 visual 分 = {result['visual_score']} / 100")

    if args.write:
        qpath = demo.parent / "quality.json"
        if not qpath.is_file():
            print(f"[警告] 未找到 {qpath}，跳过写回", file=sys.stderr)
        else:
            q = json.loads(read_text(qpath))
            old_i, old_v = q.get("interaction"), q.get("visual")
            q["interaction"] = result["interaction_score"]
            q["visual"] = result["visual_score"]
            with open(qpath, "w", encoding="utf-8") as f:
                json.dump(q, f, ensure_ascii=False, indent=2)
                f.write("\n")
            print(f"[写回] {qpath}：interaction {old_i}→{result['interaction_score']}，visual {old_v}→{result['visual_score']}（其余维度未动）")

    if args.report:
        rpath = demo.parent / "score_interaction_visual.json"
        with open(rpath, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"[报告] 明细已保存: {rpath}")


if __name__ == "__main__":
    main()
