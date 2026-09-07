#!/usr/bin/env python3
"""
批量生成组件文件和 Skill 文档
从 milesight-iot-web-doc.html 提取的 COMPONENTS 和 PREVIEWS 数据生成：
- frontend/components/{Name}/index.html  (组件实现，来自 preview HTML)
- .claude/skills/base/{Name}/SKILL.md  (组件 Skill 文档)
- frontend/index.html  (组件总览导航页)
"""

import json
import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, 'frontend')
SKILLS_DIR = os.path.join(BASE_DIR, '.claude', 'skills', 'base')


def slugify(name):
    """将组件名转为目录友好的格式"""
    return name


def generate_skill_md(component):
    """生成组件 Skill 文档"""
    name = component['name']
    cn = component['cn']
    cat = component['cat']
    summary = component.get('summary', '')
    figma = component.get('figma', '-')
    props = component.get('props', [])
    tokens = component.get('tokens', [])
    guidance = component.get('guidance', '')
    skill = component.get('skill', '')
    file_key = component.get('file', '')

    # Props 表格
    props_table = "| 参数 | 类型 | 默认值 | 说明 |\n"
    props_table += "|------|------|--------|------|\n"
    for p in props:
        props_table += f"| `{p['name']}` | `{p['type']}` | `{p.get('default', '-')}` | {p.get('desc', '')} |\n"

    # Tokens 列表
    tokens_section = ""
    if tokens:
        tokens_section = "### 设计令牌\n\n使用的 CSS 变量：\n\n"
        for t in tokens:
            tokens_section += f"- `{t}`\n"
        tokens_section += "\n"

    # Skill 格式化
    skill_section = ""
    if skill:
        skill_section = f"""### 交互 Skill\n\n{skill}\n\n"""

    # Guidance 格式化
    guidance_section = ""
    if guidance:
        guidance_section = f"""### 设计指引\n\n{guidance}\n\n"""

    # 代码示例（基于 props 生成）
    code_example = generate_code_example(name, props)

    md = f"""# {name} · {cn}

> **分类**：{cat}  
> **Figma**：{figma}

---

## 概述

{summary}

---

## 用法

### Props

{props_table}
{tokens_section}
---

## 交互规则

{guidance_section}{skill_section}
---

## 代码示例

```html
{code_example}
```

---

## 文件映射

- Preview 文件：`{file_key}`
- 组件目录：`../../../../frontend/components/{name}/`

---

## 注意事项

1. 本组件基于 Milesight IOT Web 设计系统，样式变量引用 `../../../tokens/tokens.css`
2. 组件实现为独立 HTML 文件，可直接在浏览器中打开预览
3. Preview 中的交互示例使用 React + esm.sh CDN 渲染
"""

    return md


def generate_code_example(name, props):
    """根据 props 生成基础代码示例"""
    if not props:
        return f"<{name} />"

    # 取前几个有默认值的 props 作为示例
    example_props = []
    for p in props[:3]:
        if p.get('default') and p['default'] != 'false':
            val = p['default'].strip("'")
            if p['type'] == 'boolean':
                if val == 'true':
                    example_props.append(p['name'])
            else:
                example_props.append(f'{p["name"]}="{val}"')

    props_str = " ".join(example_props)
    if props_str:
        return f"<{name} {props_str} />"
    return f"<{name} />"


def generate_overview_html(components):
    """生成组件总览导航页"""
    # 按分类分组
    cats = {}
    for c in components:
        cat = c['cat']
        if cat not in cats:
            cats[cat] = []
        cats[cat].append(c)

    # 生成导航内容
    nav_items = []
    content_items = []

    for cat_name in ['基础', '布局', '导航', '数据录入', '数据展示', '反馈', '设计资源']:
        if cat_name not in cats:
            continue
        comps = cats[cat_name]

        nav_items.append(f'<a href="#cat-{cat_name}">{cat_name} ({len(comps)})</a>')

        comp_links = []
        for c in comps:
            comp_links.append(f'''
            <a class="comp-card" href="components/{c['name']}/index.html" target="_blank">
                <div class="comp-name">{c['name']}</div>
                <div class="comp-cn">{c['cn']}</div>
                <div class="comp-summary">{c.get('summary', '')[:40]}...</div>
            </a>
            ''')

        content_items.append(f'''
        <section class="cat-section" id="cat-{cat_name}">
            <h2>{cat_name}</h2>
            <div class="comp-grid">
                {''.join(comp_links)}
            </div>
        </section>
        ''')

    html = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Milesight IOT Web — 组件库总览</title>
<style>
:root {{
  --color-primary-normal:#3491FA;
  --color-primary-hover:#5EAFFF;
  --color-text-primary:#272E3B;
  --color-text-secondary:#6B7785;
  --color-bg-page:#F7F8FA;
  --color-bg-card:#FFFFFF;
  --color-border-base:#E5E6EB;
  --radius-8:8px;
  --shadow-diffusion-1:0 2px 8px rgba(0,0,0,0.04);
  --font-sans:'PingFang SC',-apple-system,'Helvetica Neue',Helvetica,Arial,sans-serif;
  --ease:cubic-bezier(0.2, 0, 0, 1);
}}
* {{ margin:0; padding:0; box-sizing:border-box; }}
body {{
  font-family:var(--font-sans);
  background:var(--color-bg-page);
  color:var(--color-text-primary);
  line-height:1.6;
}}
header {{
  background:var(--color-bg-card);
  border-bottom:1px solid var(--color-border-base);
  padding:24px 32px;
  position:sticky; top:0; z-index:10;
}}
header h1 {{
  font-size:24px; font-weight:600;
  display:flex; align-items:center; gap:12px;
}}
header .subtitle {{
  color:var(--color-text-secondary); font-size:14px; margin-top:4px;
}}
.nav {{
  display:flex; gap:8px; flex-wrap:wrap; margin-top:16px;
}}
.nav a {{
  padding:6px 14px; border-radius:var(--radius-8);
  background:var(--color-bg-page); color:var(--color-text-secondary);
  text-decoration:none; font-size:13px; transition:all 160ms var(--ease);
  border:1px solid var(--color-border-base);
}}
.nav a:hover {{
  background:var(--color-primary-normal); color:#fff; border-color:var(--color-primary-normal);
}}
main {{ max-width:1200px; margin:0 auto; padding:32px; }}
.cat-section {{ margin-bottom:48px; }}
.cat-section h2 {{
  font-size:20px; font-weight:600; margin-bottom:20px;
  padding-bottom:12px; border-bottom:2px solid var(--color-primary-normal);
  display:inline-block;
}}
.comp-grid {{
  display:grid;
  grid-template-columns:repeat(auto-fill, minmax(260px, 1fr));
  gap:16px;
}}
.comp-card {{
  background:var(--color-bg-card);
  border:1px solid var(--color-border-base);
  border-radius:var(--radius-8);
  padding:20px;
  text-decoration:none; color:inherit;
  transition:all 200ms var(--ease);
  box-shadow:var(--shadow-diffusion-1);
}}
.comp-card:hover {{
  transform:translateY(-2px);
  box-shadow:0 8px 24px rgba(0,0,0,0.08);
  border-color:var(--color-primary-normal);
}}
.comp-name {{
  font-size:16px; font-weight:600; color:var(--color-primary-normal);
}}
.comp-cn {{
  font-size:13px; color:var(--color-text-secondary); margin-top:4px;
}}
.comp-summary {{
  font-size:12px; color:var(--color-text-secondary); margin-top:8px;
  line-height:1.5;
}}
.stats {{
  display:flex; gap:24px; margin-top:8px;
}}
.stat {{
  font-size:13px; color:var(--color-text-secondary);
}}
.stat strong {{
  color:var(--color-text-primary); font-size:18px;
}}
</style>
</head>
<body>
<header>
  <h1>🏗️ Milesight IOT Web 组件库</h1>
  <div class="subtitle">共 {len(components)} 个组件，覆盖 7 大分类 · 基于设计令牌体系</div>
  <div class="stats">
    <div class="stat"><strong>{len(components)}</strong> 组件</div>
    <div class="stat"><strong>{len(set(c['cat'] for c in components))}</strong> 分类</div>
  </div>
  <nav class="nav">
    {''.join(nav_items)}
  </nav>
</header>
<main>
  {''.join(content_items)}
</main>
</body>
</html>"""

    return html


def main():
    # 读取数据
    with open('/tmp/components.json', 'r', encoding='utf-8') as f:
        components = json.load(f)
    with open('/tmp/previews.json', 'r', encoding='utf-8') as f:
        previews = json.load(f)

    print(f"Total components: {len(components)}")

    # 创建目录并生成文件
    for comp in components:
        name = comp['name']
        file_key = comp['file']

        # 1. 组件实现
        comp_dir = os.path.join(FRONTEND_DIR, 'components', name)
        os.makedirs(comp_dir, exist_ok=True)

        if file_key in previews:
            preview_html = previews[file_key]
            index_path = os.path.join(comp_dir, 'index.html')
            with open(index_path, 'w', encoding='utf-8') as f:
                f.write(preview_html)
            print(f"  [OK] {name}/index.html ({len(preview_html)} chars)")
        else:
            print(f"  [WARN] {name}: preview not found for {file_key}")

        # 2. Skill 文档
        skill_dir = os.path.join(SKILLS_DIR, name)
        os.makedirs(skill_dir, exist_ok=True)

        skill_md = generate_skill_md(comp)
        skill_path = os.path.join(skill_dir, 'SKILL.md')
        with open(skill_path, 'w', encoding='utf-8') as f:
            f.write(skill_md)
        print(f"  [OK] .claude/skills/base/{name}/SKILL.md")

    # 3. 组件总览页
    overview_html = generate_overview_html(components)
    overview_path = os.path.join(FRONTEND_DIR, 'index.html')
    with open(overview_path, 'w', encoding='utf-8') as f:
        f.write(overview_html)
    print(f"\n[OK] frontend/index.html (overview page)")

    print(f"\nDone! Generated {len(components)} components + {len(components)} skills.")


if __name__ == '__main__':
    main()
