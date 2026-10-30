---
name: install-html-to-design
description: 安装/更新 html-to-figma-internal 内部插件（html to design 脚本）到 Figma。用户说「安装 html to design 脚本」「装 figma 转换插件」「更新插件」等时触发：把仓库 tools/figma-bridge/plugin/ 同步到 ~/Desktop/html-to-figma-internal/、校验依赖、确认 serve.py、指引 Figma 导入 manifest（新电脑一次性手动步骤）。
---

# 安装 html to design 脚本（html-to-figma-internal 插件）

> 插件**唯一真源**在仓库 `tools/figma-bridge/plugin/`（5 个文件：code.js / ui.html / manifest.json / serve.py / README.md），随 git 走。
> 安装目标 = `~/Desktop/html-to-figma-internal/`（Figma 已登记的固定路径）。本技能 = 同步 + 校验 + 起服务 + 导入指引。

按顺序执行，任何一步失败先修复再继续：

## 1. 前置检查

```bash
ls tools/figma-bridge/plugin/manifest.json        # 仓库真源在（缺 = 先 git pull / clone）
node -v && python3 -v                              # Node + python3
ls "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"   # 无头渲染依赖
```

Chrome 不在默认路径时查 `CHROME` 环境变量或提示用户装 Chrome。

## 2. 同步真源 → 安装目标

```bash
mkdir -p ~/Desktop/html-to-figma-internal
cp tools/figma-bridge/plugin/code.js tools/figma-bridge/plugin/ui.html \
   tools/figma-bridge/plugin/manifest.json tools/figma-bridge/plugin/serve.py \
   tools/figma-bridge/plugin/README.md ~/Desktop/html-to-figma-internal/
```

**不要删除**目标目录里的 `scene.json` / `_drops/`（运行时产物）。同步后 `diff` 逐文件确认一致。

## 3. 语法校验

```bash
node --check ~/Desktop/html-to-figma-internal/code.js
python3 -c "import ast; ast.parse(open('$HOME/Desktop/html-to-figma-internal/serve.py').read())"
```

## 4. serve.py 数据服务（127.0.0.1:8124）

- 端口空闲 → 无需手动启动（build-scene.js 渲染时会自动拉起）；可主动起一次验证：`nohup python3 ~/Desktop/html-to-figma-internal/serve.py >/tmp/serve-figma.log 2>&1 &`
- 端口已被**旧版本**占用（本次是更新）→ 杀掉重启：`kill $(lsof -ti :8124 -sTCP:LISTEN)` 后再起
- 验证：`curl -s http://127.0.0.1:8124/api/list | head -c 120` 返回 `{"ok": true, ...}`

## 5. Figma 侧（人手动，仅新电脑/首次需要）

告诉用户逐步操作：

1. 打开 **Figma 桌面端** → 任意 design 文件
2. 菜单 **Figma → Plugins → Development → Import plugin from manifest…**
3. 选 `~/Desktop/html-to-figma-internal/manifest.json`（插件名 *HTML to Figma (Milesight Internal)*）

**已导入过的电脑（更新场景）不需要重新导入**——同步完把插件面板**完全关闭再重开**即生效；serve.py 若在跑需重启（第 4 步）。

## 6. 汇报

- 新装/更新、同步了哪些文件、serve.py 状态、是否需要 Figma 导入
- 提醒：面板关闭重开后，右键 → Plugins → Development → HTML to Figma (Milesight Internal) 可用；粘贴 http(s) 链接 = 外部网页多页转录，本地路径/拖拽 = 自家 demo 全套组件体系（详见插件 README）
