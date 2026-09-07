#!/usr/bin/env python3
"""Enrich 62 L2 base-component SKILL.md 状态视觉矩阵 with the five interaction axes.

Appends a compact 五轴交互补表 block immediately before `## 三、研发层`.
Exempt (static/structural) components get a single-line marker instead.
"""
import io, os, re

BASE = os.path.join(os.path.dirname(__file__), "..", ".claude", "skills", "base")

EXEMPT = {
    "Affix", "Avatar", "Badge", "Comment", "Descriptions", "Divider", "Empty",
    "Grid", "Icon", "Layout", "Logo", "Progress", "Result", "Skeleton",
    "Space", "Spin", "Statistic", "Timeline", "Watermark",
}

# name -> (hover, active, keyboard, loading, error)
INTERACTIVE = {
    "Alert": ("关闭按钮 hover（对应色相 hover，回指总纲）", "关闭按钮按下加深", "关闭按钮 `Tab`/`Enter` 聚焦触发", "无加载态", "自身即 `type=\"error\"` 提示，无额外错误态"),
    "Anchor": ("链接 hover `--color-text-link-hover`", "无（纯链接，回指总纲）", "`Tab` 聚焦 + `Enter` 激活锚点", "无加载态", "无"),
    "AutoComplete": ("联想项 hover bg `--color-bg-page`（见矩阵）", "联想项按下（回指总纲）", "`↑↓` 切换高亮、`Enter` 选中、`Esc` 关闭", "远程搜索 `onSearch` 进行中（Spin，回指总纲）", "同 Input：边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "BackTop": ("图标 hover（回指总纲）", "按下加深", "`Enter` 触发回到顶部", "无加载态", "无"),
    "Breadcrumb": ("链接 hover `--color-text-link-hover`", "无（纯链接）", "`Tab`/`Enter` 激活链接", "无加载态", "无"),
    "Button": ("各变体 hover（见矩阵，回指 `--color-primary-hover` 等）", "各变体 active（`--color-primary-active` 等）", "`Tab` 聚焦、`Enter`/`Space` 触发", "`loading` 态 Spin + `aria-busy`，与 disabled 互斥", "无独立错误态；`status=\"danger\"` 为语义色非校验错误"),
    "Calendar": ("单元格 hover `--color-bg-hover`", "选中按下", "`↑↓←→` 移动日期、`Enter` 选中、`Esc` 关闭面板", "无（数据异步由上层 Skeleton 承载）", "无"),
    "Card": ("`box-shadow` 提升一级（`--shadow-1`，回指总纲）", "无（纯容器）", "无键盘语义（含可点击区域则 `Tab`/`Enter`）", "`loading` 态 Skeleton（见矩阵）", "无"),
    "Cascader": ("选项 hover（见矩阵）", "选项按下", "`↑↓←→` 导航、`Enter` 展开/选中、`Esc` 关闭", "级联异步加载子集（Spin，回指总纲）", "边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "Checkbox": ("边框/底色 hover（回指总纲）", "按下加深", "`Space` 切换、组内方向键切换", "无加载态", "无独立错误态（校验由 Form 承载）"),
    "Collapse": ("标题 hover `--color-bg-hover`", "按下加深", "`Tab` 聚焦、`Enter`/`Space` 展开、`←/→` 展开收起", "无加载态", "无"),
    "DatePicker": ("输入框 hover（见矩阵）", "按下", "`Enter` 确认、`Esc` 关闭、面板内方向键导航", "无（面板静态）", "边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "Drawer": ("关闭按钮 hover", "按下加深", "焦点陷阱、`Esc` 关闭、关闭按钮 `Enter`", "无加载态", "无"),
    "DropdownMenu": ("菜单项 hover `--color-bg-hover`", "按下加深", "`↑↓` 导航、`Enter` 激活、`Esc` 关闭", "无加载态", "无"),
    "Form": ("无（容器）", "无", "无（子控件承载）", "无加载态", "校验错误态 `status=\"error\"` + message（回指总纲轴 5）"),
    "Image": ("预览 hover（预览遮罩）", "按下", "`Enter` 触发预览", "加载占位 → 失败回退图（见矩阵）", "加载失败回退态"),
    "Input": ("边框 `--color-border-base-disable`（见矩阵）", "无（文本输入，聚焦即可）", "原生 `Tab`/`Enter`/光标移动", "无加载态", "边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "InputNumber": ("边框（见矩阵）", "步进按钮按下", "`↑↓` 步进、`Enter` 确认", "无加载态", "边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "List": ("行 hover `--color-bg-hover`", "无（行可点则按下）", "无（行可点则 `Enter`）", "`loading` Skeleton（回指总纲）", "空/失败由 Empty/Result 承载"),
    "Message": ("无（自动消失）", "无", "无（`role=\"alert\"`/`status` 播报）", "无加载态", "自身即 `type=\"error\"` 提示"),
    "Modal": ("关闭按钮 hover", "按下加深", "焦点陷阱、`Esc` 关闭、`Enter` 确认", "无（`confirmLoading` 回指总纲）", "无"),
    "NavMenu": ("菜单项 hover `--color-bg-hover`", "按下加深", "`↑↓` 导航、`Enter` 激活、`Esc` 关闭", "无加载态", "无"),
    "Notification": ("关闭按钮 hover", "按下加深", "关闭按钮 `Enter`", "无加载态", "自身即 `type=\"error\"` 提示"),
    "PageHeader": ("返回按钮 hover", "按下加深", "返回按钮 `Enter`", "无加载态", "无"),
    "Pagination": ("页码 hover（回指总纲）", "按下加深", "`Tab`/`Enter` 翻页/跳转", "无加载态", "无"),
    "Popconfirm": ("按钮 hover", "按下加深", "`Esc` 关闭、`Enter` 确认", "`okButtonProps.loading`（回指总纲）", "无"),
    "Popover": ("无（触发元素）", "无", "`Esc` 关闭、`Tab` 焦点进入", "无加载态", "无"),
    "Radio": ("边框 hover（回指总纲）", "按下加深", "`Space` 选中、组内方向键切换", "无加载态", "无（校验由 Form 承载）"),
    "Rate": ("星 hover 预览值", "按下选中", "方向键调值", "无加载态", "无"),
    "Segmented": ("项 hover `--color-bg-hover`", "按下加深", "`←/→` 切换、`Enter`/`Space` 选中", "无加载态", "无"),
    "Select": ("边框 + 焦点环（见矩阵）", "选项按下", "`↑↓` 导航、`Enter` 选中、`Esc` 收起、`Space` 展开", "下拉异步 `loading`（回指总纲）", "边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "Slider": ("滑杆 hover 高亮", "拖拽中高亮", "`←/→` 调值、`Home/End` 首尾", "无加载态", "无"),
    "Steps": ("可点击步骤 hover", "按下加深", "`Enter` 激活可点击步骤", "无加载态", "`status=\"error\"` 步骤（语义态）"),
    "Switch": ("边框 hover（回指总纲）", "按下加深", "`Space` 切换", "`loading` 态（回指总纲）", "无"),
    "Tabs": ("标签 hover", "按下加深", "`←/→` 切换、`Enter`/`Space` 选中、`Home/End` 首尾", "无加载态", "无"),
    "Tag": ("可关闭时关闭按钮 hover", "按下加深", "可关闭时 `Enter` 关闭", "无加载态", "无（`status` 为语义色）"),
    "TimePicker": ("输入框 hover（见矩阵）", "按下", "`Enter` 确认、`Esc` 关闭、面板导航", "无加载态", "边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "Tooltip": ("触发（hover 触发即悬停）", "无", "`focus` 触发（`Tab` 聚焦显示）", "无加载态", "无"),
    "Transfer": ("项 hover `--color-bg-hover`", "按下加深", "项 `Enter` 移项、方向键导航", "数据异步 `loading`（回指总纲）", "无"),
    "Tree": ("节点 hover `--color-bg-hover`", "按下加深", "`↑↓` 导航、`←/→` 展开收起、`Enter` 激活", "节点异步加载子级（Spin，回指总纲）", "无"),
    "TreeSelect": ("选项 hover", "按下加深", "`↑↓←→` 导航、`Enter` 选中、`Esc` 关闭", "树异步加载（回指总纲）", "边框 `--color-error-normal` + 焦点环 `--color-error-bg`"),
    "Typography": ("无（默认展示）", "无", "`copyable`/`editable`/`ellipsis` 可聚焦触发", "无加载态", "无"),
    "Upload": ("卡片/按钮 hover", "按下加深", "`Enter`/`Space` 触发选择", "上传中 progress（回指总纲）", "失败态 `status=\"error\"`（见矩阵）"),
}

MARKER = "> 五轴交互：无交互，五轴豁免（回指 `INTERACTION.md` 总纲）。\n"

def render_table(vals):
    hover, active, keyboard, loading, error = vals
    return (
        "### 五轴交互补表（回指 `INTERACTION.md` 总纲）\n\n"
        "| 轴 | 本组件 |\n"
        "|----|--------|\n"
        f"| hover | {hover} |\n"
        f"| active（点击反馈） | {active} |\n"
        f"| 键盘 | {keyboard} |\n"
        f"| loading | {loading} |\n"
        f"| error | {error} |\n"
    )

HEADING_RE = re.compile(r'^## 三、研发层', re.M)

def process(name):
    path = os.path.join(BASE, name, "SKILL.md")
    if not os.path.isfile(path):
        return False, f"missing {name}"
    with io.open(path, encoding="utf-8") as f:
        text = f.read()

    if "五轴交互补表" in text or "无交互，五轴豁免" in text:
        return False, f"already done {name}"

    m = HEADING_RE.search(text)
    if not m:
        return False, f"no 研发层 heading in {name}"

    if name in EXEMPT:
        block = MARKER
    else:
        block = render_table(INTERACTIVE[name])

    new_text = text[:m.start()] + block + "\n" + text[m.start():]
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(new_text)
    return True, name

def main():
    names = sorted(os.listdir(BASE))
    ok, fail = [], []
    for n in names:
        if n in ("INTERACTION.md", "README.md") or not os.path.isdir(os.path.join(BASE, n)):
            continue
        status, msg = process(n)
        (ok if status else fail).append(msg)
    print(f"OK ({len(ok)}):")
    for x in ok:
        print("  ", x)
    print(f"SKIP/FAIL ({len(fail)}):")
    for x in fail:
        print("  ", x)

if __name__ == "__main__":
    main()
