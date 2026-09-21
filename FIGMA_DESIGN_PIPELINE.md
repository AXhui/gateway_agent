# 飞书按钮 → Claude → Figma 设计稿 — 全链路说明

## 功能

在飞书多维表格（UI demo 表）里点一个按钮，几分钟后：

1. 本机 Claude（headless）通过**官方 figma-remote MCP** 在 Figma 团队空间生成一份可编辑的页面级设计稿
2. 生成的 Figma 链接**自动回写**到点按钮那一行的「Figma链接」列

全程无人值守，无需打开 Figma 客户端（设计稿直接写进云端文件）。

```
飞书多维表格 ──点按钮──▶ 自动化工作流「UED确认转Figma通知设计师」
                              │ HTTP POST（需求字段；record_id 可选）
                              ▼
              cloudflare 隧道（公网临时域名）
                              │
                              ▼
              本机桥接 server.js :8080（POST /task）
                              │ spawn claude -p（cwd=本仓库）
                              ▼
              claude headless + figma-remote MCP（OAuth）
                              │ 写画布
                              ▼
              Figma 团队空间文件（完整可编辑 frame）
                              │ 任务结束
                              ▼
              桥接提取日志里的 Figma 链接
                              │ lark-cli 回写
                              ▼
              多维表格该行「Figma链接」列 = 设计稿地址
```

---

## 组件与位置

| 组件 | 位置 | 说明 |
|---|---|---|
| 桥接服务（权威源码） | 本仓库 `tools/figma-bridge/server.js` | 收任务、spawn claude、回写飞书 |
| 桥接运行副本 | `~/Desktop/figma-feedo-executor/bridge/server.js` | 实际跑的进程（`node_modules/ws` 在此），**改权威源码后需同步** |
| 飞书多维表格 | `https://milesight.feishu.cn/base/F2MebgSgMaUZSbseUWLcefqbnKd?table=tbln6WxfFJ6iYaek` | UI demo 表，字段：Demo名称/版本号/产品分类/需求描述/提示词/demoUrl/Figma链接 + 按钮字段 |
| 自动化工作流 | 多维表格内「UED确认转Figma通知设计师」 | 按钮触发 → HTTP 请求 → 发飞书消息 |
| cloudflared 隧道 | quick tunnel，域名随重启变化 | `cloudflared tunnel --url http://localhost:8080` |
| claude CLI | `/usr/local/bin/claude`（v2.1.x） | headless `-p` 模式 |
| figma-remote MCP | 全局注册 `https://mcp.figma.com/mcp` | OAuth 认证，**唯一能写画布的官方通道** |
| lark-cli | `/usr/local/bin/lark-cli` | 回写多维表格，用户身份登录 |

---

## 一次性配置（新人视角）

### 1. figma-remote MCP 认证（写画布的前提）

```bash
claude mcp add --transport http figma-remote https://mcp.figma.com/mcp --scope user
claude mcp login figma-remote      # 交互式终端里跑；浏览器点 Approve 后自动回调完成
claude mcp list                    # 确认显示 ✔ Connected
```

> Figma PAT（`figd_` 个人令牌）**不能**用于 mcp.figma.com（官方仅支持 OAuth；PAT 只能驱动只读的 figma-api）。
> PAT 只许存本机用户级文件，绝不入库。

### 2. 启动桥接（本机）

```bash
cd ~/Desktop/figma-feedo-executor && npm install ws   # 首次
nohup node bridge/server.js >> /tmp/bridge-server.log 2>&1 &
curl http://127.0.0.1:8080/health    # {"ok":true,"mode":"claude",...}
```

### 3. 启动隧道（每次重启域名会变）

```bash
cloudflared tunnel --url http://localhost:8080
# 记下输出的 https://xxx.trycloudflare.com
```

### 4. 飞书工作流配置（HTTP 请求节点）

| 项 | 值 |
|---|---|
| 方法 | POST |
| URL | `https://<当前隧道域名>/task`（隧道换了要回来改） |
| Header | `Content-Type: application/json` |
| Body（Raw/JSON） | 见下 |

```json
{
  "demoName":    "<引用：Demo名称>",
  "version":     "<引用：版本号>",
  "category":    "<引用：产品分类>",
  "requirement": "<引用：需求描述>",
  "prompt":      "<引用：提示词>"
}
```

> `record_id` 可加可不加。加了 → 桥接直接写那一行；不加 → 桥接按 **Demo 名称 + 版本号** 自动反查记录再回写（飞书按钮触发的工作流变量面板里往往没有「记录 ID」可引用，这就是兜底存在的原因；同名多版本行靠版本号区分）。
> `demoUrl` 可选。带了 → 直接作为转录模式的 demo 源；不带也会走「本地归档 / 表格反查预览 URL」兜底（见下节）。

### 5. lark-cli 登录（回写的前提）

```bash
lark-cli auth login    # 用户身份；scope 需含 base:app:update、base:field:read
```

---

## 已踩过的坑（关键，改动前必读）

1. **headless `-p` 下 OAuth MCP 竞态**（官方 bug：[#36309](https://github.com/anthropics/claude-code/issues/36309) / [#36060](https://github.com/anthropics/claude-code/issues/36060)）：首个 API 请求抢在 MCP 握手完成前发出，第一回合工具列表里没有 figma-remote。
   **解法**：任务 prompt 已内置「先输出设计规划再动手」的前戏回合，第二回合起工具列表刷新、figma-remote 可用。**不要删掉 buildPrompt 里的这句引导。**
2. **设计生成耗时 5–20 分钟**（实测：简单页 ~5 分钟，带背景调研的复杂页 15 分钟+——模型会读仓库 prd.md、做参考调研，再执行 10 次左右画布操作）：桥接超时设 20 分钟（`JOB_TIMEOUT_MS`），别改小；飞书工作流本身的 HTTP 超时只影响「接收请求」，桥接是先应答后干活，不受影响。**任务已排队串行执行**（并发多个 figma-remote 会话会互相拖慢导致超时）。
3. **spawn 必须带 `stdio: ['ignore','pipe','pipe']`**：否则 claude 卡在「等 stdin 3 秒」。
4. **项目目录未信任警告可忽略**：headless 下忽略 settings.json 的 4 条 allow 规则，不影响 MCP 工具与 Read（`--allowedTools Read,mcp__figma-remote,mcp__figma-dev-mode` 走命令行）。
5. **claude 必须以本仓库为 cwd 跑**（`CLAUDE_CWD`）：figma-remote 虽是全局注册，但任务 prompt 依赖仓库上下文。
6. **隧道域名易变**：cloudflared quick tunnel 每次重启换域名，工作流 URL 要同步改；固定方案待做（named tunnel + 自己的域名）。

---

## demo 还原模式（转录，默认行为）

表格里的 demo 是**唯一还原基准**：任务命中 demo 源后走**转录模式**——100% 照抄布局/文案/色值/组件结构进 Figma，禁止再设计、增删模块、改写文案、换色。只有三层取源全部落空才退回自由设计模式。

demo 源三层解析（任一命中即转录）：

| 层 | 来源 | 说明 |
|---|---|---|
| 1 | Body 里 `demoUrl` | 飞书云盘附件链接（markdown 包装也行），自动 `lark-cli drive +download` |
| 2 | 本地归档 `05_release/REQ-###/demo.html` | 从 Demo 名称提取 REQ 号定位（REQ-001~007 在库） |
| 3 | 反查表格「预览 URL」列再下载 | 覆盖 REQ-008+ 无本地归档的行 |

命中后桥接再用无头 Chrome 截一张 1440×1024 图（`--virtual-time-budget=8000` 等 JS 渲染完）作为**视觉基准**，HTML 源码作为**结构/文案/真实色值基准**，一起写进 claude 的 prompt（`--allowedTools` 含 `Read` 供其读取）。

**组件复用**：两种模式都要求先在 Figma 团队空间引用两份库文件——「Milesight_IOT_Web」与「（新版本）网关/路由器 通用业务组件库 业务组件」——能复用的组件优先从库里取，铁律见 `.claude/rules/figma-asset-libs.md`。

---

## 日常使用

1. 在多维表格某行填好需求字段，点按钮
2. 工作流第 3 步立刻发一条飞书消息（固定文案，**不代表完成**）
3. 等 5–20 分钟，刷新表格——「Figma链接」列出现地址即完成
4. 打开链接直接进 Figma 可编辑设计稿

## 排障

| 症状 | 查哪 |
|---|---|
| 按钮点了没反应 | `/tmp/bridge-server.log` 有没有新 `[task]`；没有 → 工作流 URL 是否过期（隧道换域名） |
| 任务收到但没产物 | 对应 `/tmp/claude-job-<jobId>.log`，看 claude 报了什么 |
| 画布写成功但表格没回写 | 桥接日志找 `[writeback:...]`：`反查失败/没找到记录` → Body 里 demoName/version 与表格列值不完全一致（注意空格）；lark-cli 退出码非 0 → token 过期，重跑 `lark-cli auth login` |
| figma-remote 不见了 | `claude mcp list` 检查；OAuth 失效重跑 `claude mcp login figma-remote` |

## 安全红线

- Figma PAT / OAuth 凭据只存本机用户级文件（`~/.claude.json` 等），**绝不入库**
- 隧道只暴露 `/task` 和 `/health` 两个端点；扩展暴露面需先获使用者明确同意
- 多维表格 base token 写在本文档中属于团队资源坐标，非密钥
