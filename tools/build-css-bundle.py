#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
把 library/*.css 打包成 assets/js/library-css.js。

目的：生成器产出的页面是「内联全部样式的单文件 HTML」，但在 file:// 场景下
浏览器禁止 fetch 本地 CSS。把样式层编译成 JS 常量后，生成链路不再依赖任何
网络或服务端请求，双击 index.html 也能完整工作。

⚠️ 本文件自动生成，请勿手工编辑。样式真源始终是 library/*.css。
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LIB = os.path.join(ROOT, "library")
OUT = os.path.join(ROOT, "assets", "js", "library-css.js")

FILES = [("tokens", "tokens.css"), ("base", "base.css"), ("business", "business.css")]

parts = []
for key, name in FILES:
    with open(os.path.join(LIB, name), encoding="utf-8") as f:
        parts.append('  %s: %s' % (key, json.dumps(f.read(), ensure_ascii=False)))

content = (
    "/* 自动生成，请勿手工编辑 —— 源文件：library/tokens.css / base.css / business.css\n"
    "   生成脚本：tools/build-css-bundle.py */\n"
    "window.MS_CSS = {\n" + ",\n".join(parts) + "\n};\n"
)

with open(OUT, "w", encoding="utf-8") as f:
    f.write(content)

print("bundled ->", OUT, os.path.getsize(OUT), "bytes")
