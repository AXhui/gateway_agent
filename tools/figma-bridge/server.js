// 桥接服务 v2：飞书触发端(POST /task) → 本机 claude -p（figma-remote MCP 写画布）
// 旧路径保留：USE_CLAUDE=false 时恢复为「广播给 Figma 插件画文本画板」
// 用法：node bridge/server.js   （先 npm install ws）
const http = require('http')
const { spawnSync, spawn } = require('child_process')
const fs = require('fs')
const { WebSocketServer } = require('ws')

const PORT = 8080
const USE_CLAUDE = true
// 项目级 MCP（figma-remote）注册在这个目录下，claude 必须在这里跑才能加载到
const CLAUDE_CWD = '/Users/youxh/Feishu-competition'
const JOB_TIMEOUT_MS = 35 * 60 * 1000

// 任务排队：一次只跑一个 claude（并发多个 figma-remote 会话会互相拖慢/超时）
const queue = []
let running = false
function pumpQueue() {
  if (running || !queue.length) return
  running = true
  const { task, jobId } = queue.shift()
  runClaudeJob(task, jobId, () => { running = false; pumpQueue() })
}

// 飞书多维表格回写目标（UI demo 表）：任务结束后把生成的 Figma 链接写回触发按钮的那一行
const FEISHU = {
  bin: '/usr/local/bin/lark-cli',
  baseToken: 'F2MebgSgMaUZSbseUWLcefqbnKd',
  tableId: 'tbln6WxfFJ6iYaek',
  linkField: 'Figma 链接',
}

function extractFigmaUrl(text) {
  const urls = text.match(/https:\/\/(?:www\.)?figma\.com\/(?:design|file)\/[A-Za-z0-9]+[^\s，。；）)、」』\]]*/g)
  return urls ? urls[urls.length - 1] : null   // 取最后一个：最终报告里的才是本次产物
}

function larkCli(args, cb) {
  const child = spawn(FEISHU.bin, args, { stdio: ['ignore', 'pipe', 'pipe'] })
  let out = ''
  child.stdout.on('data', (d) => (out += d))
  child.stderr.on('data', (d) => (out += d))
  child.on('close', (code) => cb(code, out))
}

function updateRecordField(recordId, url, jobId) {
  const payload = JSON.stringify({ update_records: { [recordId]: { [FEISHU.linkField]: url } } })
  larkCli([
    'base', '+record-batch-update',
    '--base-token', FEISHU.baseToken,
    '--table-id', FEISHU.tableId,
    '--json', payload,
    '--as', 'user',
  ], (code, out) => console.log(`[writeback:${jobId}] lark-cli 退出 code=${code} ${out.slice(0, 300)}`))
}

function writeBackToFeishu(task, jobId, url) {
  if (!url) { console.log(`[writeback:${jobId}] 日志里没有 Figma 链接，跳过回写`); return }
  if (task.record_id) return updateRecordField(task.record_id, url, jobId)
  // 兜底：工作流没带 record_id 时，按 Demo 名称+版本号 反查记录（同名多版本靠版本号区分）
  if (!task.demoName) { console.log(`[writeback:${jobId}] 无 record_id 也无 demoName，跳过回写`); return }
  const conditions = [["Demo 名称", "Is", task.demoName]]
  if (task.version) conditions.push(["版本号", "Is", task.version])
  const body = {
    keyword: task.demoName,
    search_fields: ["Demo 名称"],
    select_fields: ["Demo 名称", "版本号"],
    filter: { logic: "and", conditions },
    limit: 20,
  }
  larkCli([
    'base', '+record-search',
    '--base-token', FEISHU.baseToken,
    '--table-id', FEISHU.tableId,
    '--json', JSON.stringify(body),
    '--format', 'json',
    '--as', 'user',
  ], (code, out) => {
    if (code !== 0) return console.log(`[writeback:${jobId}] 反查失败 code=${code} ${out.slice(0, 200)}`)
    let ids = []
    try {
      const data = JSON.parse(out).data
      ids = (data.record_id_list || []).filter((_, i) => {
        const row = data.data[i] || []
        return row[0] === task.demoName && (!task.version || row[1] === task.version)
      })
    } catch (e) {
      return console.log(`[writeback:${jobId}] 反查结果解析失败:`, e.message)
    }
    if (!ids.length) {
      return console.log(`[writeback:${jobId}] 表里没找到 Demo 名称=${task.demoName} 版本=${task.version || '(任意)'} 的记录，跳过回写`)
    }
    console.log(`[writeback:${jobId}] 按 Demo 名称反查命中 ${ids.length} 条：${ids.join(', ')}`)
    ids.forEach((id) => updateRecordField(id, url, jobId))
  })
}

// 启动时解析 claude 可执行文件，找不到就自动退回旧路径
const CLAUDE_BIN = spawnSync('which', ['claude'], { encoding: 'utf8' }).stdout.trim()
const useClaude = USE_CLAUDE && CLAUDE_BIN
if (USE_CLAUDE && !CLAUDE_BIN) console.log('[warn] 找不到 claude 可执行文件，退回插件广播模式')

// ---- demo 源解析：转 Figma 的还原基准（三层兜底）----
// 1. task.demoUrl（飞书云盘附件链接）→ 下载到 /tmp
// 2. 本地归档 05_release/REQ-###/demo.html
// 3. 反查多维表格读「预览 URL」列再下载（覆盖 REQ-008+ 等无本地归档的行）
const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

function extractUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s\)\]]+/)
  return m ? m[0] : null
}

function demoScreenshot(htmlPath, jobId, cb) {
  const pngPath = `/tmp/demo-${jobId}.png`
  if (!fs.existsSync(CHROME_BIN)) return cb(null)
  const child = spawn(CHROME_BIN, [
    '--headless=new', '--disable-gpu', `--screenshot=${pngPath}`,
    '--window-size=1440,1024', '--hide-scrollbars', '--virtual-time-budget=8000',
    `file://${htmlPath}`,
  ], { stdio: 'ignore' })
  const t = setTimeout(() => { child.kill(); cb(null) }, 30000)
  child.on('close', () => {
    clearTimeout(t)
    cb(fs.existsSync(pngPath) && fs.statSync(pngPath).size > 20000 ? pngPath : null)
  })
}

function resolveDemoSource(task, jobId, cb) {
  const finish = (info) => {
    console.log(info
      ? `[demo:${jobId}] demo 源就绪（转录模式）: html=${info.htmlPath} png=${info.pngPath || '无'}`
      : `[demo:${jobId}] 三层取源均未命中，走自由设计模式`)
    cb(info)
  }
  const afterHtml = (htmlPath) => demoScreenshot(htmlPath, jobId, (pngPath) => finish({ htmlPath, pngPath }))

  const fromUrl = (url) => {
    if (!url) return fromLocal()
    const htmlPath = `/tmp/demo-${jobId}.html`
    larkCli(['drive', '+download', '--url', url, '--output', htmlPath, '--overwrite', '--as', 'user'], (code, out) => {
      if (code !== 0 || !fs.existsSync(htmlPath) || fs.statSync(htmlPath).size < 500) {
        console.log(`[demo:${jobId}] demoUrl 下载失败: ${String(out).slice(0, 150)}`)
        return fromLocal()
      }
      afterHtml(htmlPath)
    })
  }
  const fromLocal = () => {
    const m = String(task.demoName || '').match(/REQ-(\d+)/i)
    if (m) {
      const p = `${CLAUDE_CWD}/05_release/REQ-${m[1]}/demo.html`
      if (fs.existsSync(p)) {
        console.log(`[demo:${jobId}] 用本地归档 ${p}`)
        return afterHtml(p)
      }
    }
    fromRecord()
  }
  const fromRecord = () => {
    if (!task.demoName) return finish(null)
    const conditions = [["Demo 名称", "Is", task.demoName]]
    if (task.version) conditions.push(["版本号", "Is", task.version])
    const body = {
      keyword: task.demoName, search_fields: ["Demo 名称"],
      select_fields: ["Demo 名称", "预览 URL"],
      filter: { logic: "and", conditions }, limit: 5,
    }
    larkCli([
      'base', '+record-search', '--base-token', FEISHU.baseToken, '--table-id', FEISHU.tableId,
      '--json', JSON.stringify(body), '--format', 'json', '--as', 'user',
    ], (code, out) => {
      let cell = null
      try {
        const data = JSON.parse(out).data
        const idx = (data.record_id_list || []).findIndex((_, i) => {
          const row = data.data[i] || []
          return row[0] === task.demoName
        })
        if (idx >= 0) cell = (data.data[idx] || [])[1]
      } catch (e) { /* 落到 finish(null) */ }
      const url = cell ? extractUrl(cell) : null
      if (!url) return finish(null)
      console.log(`[demo:${jobId}] 从表格「预览 URL」反查到附件，下载中`)
      fromUrl(url)
    })
  }
  fromUrl(extractUrl(task.demoUrl))
}

// 组件库引用：搭 Figma 稿前先在团队空间找这两份库文件，能复用的组件优先从库里取
const FIGMA_LIBS = [
  '「Milesight_IOT_Web」',
  '「（新版本）网关/路由器 通用业务组件库 业务组件」',
]

function buildPrompt(t, demo) {
  // 第一行的「先输出规划再动手」是 headless 下 OAuth MCP 握手竞态的解法，勿删
  const warmup = '你是设计执行器。先花一个回合输出简短的执行规划（两三行即可），然后再动手——figma-remote MCP 握手需要几秒，第一回合看不到它的工具属正常，规划完它就绪了。'
  const libRule = `组件复用优先：在 Figma 团队空间找 ${FIGMA_LIBS.join(' 和 ')} 两份库文件，能复用的组件（按钮、输入框、表格、徽标、侧边导航项等）优先从库里复制/引用，库里没有的再手画。`

  if (demo) {
    // 转录模式：已有 demo，100% 还原，禁止再设计
    return [
      warmup,
      `本次任务：把已有 demo 页面逐像素转写成 Figma 可编辑设计稿（是 1:1 转录，不是重新设计）。`,
      `基准材料（用 Read 工具查看）：`,
      demo.pngPath ? `- 视觉基准（最终长相）：${demo.pngPath}` : '',
      `- 源码基准（结构/文案/真实色值）：${demo.htmlPath}（文件较大，分段读关键部分；颜色一律取 CSS 变量真实值）`,
      `- 名称：${t.demoName || '未命名'}${t.version ? `（版本 ${t.version}）` : ''}`,
      `硬性要求：`,
      `1. 布局、模块、顺序、文案 100% 照抄 demo：侧边导航每一项、标题、卡片里的数字、表格每一列每一行、徽标颜色、按钮文字，全部原样落进 Figma。禁止增删模块、禁止改写文案、禁止任何"优化"。`,
      `2. 颜色一律用 demo 的真实色值（从源码 CSS 变量取，如 #2563EB/#0F1B2D/#F5F7FA），不得主观换色；字体字号间距按 demo 实际值。`,
      `3. 整页放进一个 1440 宽的完整 frame，高度按 demo 实际内容，不要只画首屏。`,
      `4. ${libRule}`,
      `完成后报告：写进了哪个文件（链接）、节点名，以及与 demo 的差异清单（若有，应尽量为零）。`,
    ].filter(Boolean).join('\n')
  }

  // 设计模式：无 demo 源时保持原有行为
  const req = t.requirement || t.prompt || ''
  return [
    warmup + '随后使用 figma-remote MCP 的画布写入工具，把下面的需求落成 Figma 里一个可编辑的页面级设计稿（完整 frame，不要只输出文字说明）：',
    `- 名称：${t.demoName || t.title || '未命名'}`,
    t.version ? `- 版本：${t.version}` : '',
    t.category ? `- 分类：${t.category}` : '',
    `- 需求：${req || t.demoName || '（无描述，按名称做一个物联网设备后台界面）'}`,
    `- ${libRule}`,
    '完成后用一两句话报告：写进了哪个文件、节点叫什么名字。'
  ].filter(Boolean).join('\n')
}

function runClaudeJob(task, jobId, done) {
  resolveDemoSource(task, jobId, (demo) => {
    const logFile = `/tmp/claude-job-${jobId}.log`
    const log = fs.createWriteStream(logFile, { flags: 'a' })
    const child = spawn(CLAUDE_BIN, [
      '-p', buildPrompt(task, demo),
      '--model', 'sonnet',
      '--allowedTools', 'Read,mcp__figma-remote,mcp__figma-dev-mode'
    ], { cwd: CLAUDE_CWD, stdio: ['ignore', 'pipe', 'pipe'] })

  const timer = setTimeout(() => {
    console.log(`[claude:${jobId}] 超时(${JOB_TIMEOUT_MS / 60000}min)，强杀`)
    child.kill('SIGKILL')
  }, JOB_TIMEOUT_MS)

  console.log(`[claude:${jobId}] 启动 pid=${child.pid} 日志=${logFile}`)
  child.stdout.on('data', (d) => log.write(d))
  child.stderr.on('data', (d) => log.write(d))
  child.on('error', (e) => {
    clearTimeout(timer)
    console.log(`[claude:${jobId}] 启动失败:`, e.message)
  })
  child.on('close', (code) => {
    clearTimeout(timer)
    console.log(`[claude:${jobId}] 结束 code=${code}`)
    // 任务产物回写：从最终报告里提取 Figma 链接 → 写回多维表格该行
    try {
      const finalText = fs.readFileSync(logFile, 'utf8')
      writeBackToFeishu(task, jobId, extractFigmaUrl(finalText))
    } catch (e) {
      console.log(`[writeback:${jobId}] 读取日志失败:`, e.message)
    }
    wss.clients.forEach((c) => {
      if (c.readyState === 1) c.send(JSON.stringify({ event: 'claude-done', jobId, code }))
    })
    if (done) setImmediate(done)
  })
  })
}

const server = http.createServer((req, res) => {
  // CORS：允许任意页面（多维表格内嵌 HTML / 本地按钮页）直接 POST
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

  if (req.method === 'POST' && req.url === '/task') {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      let task
      try { task = JSON.parse(body) } catch { task = { raw: body } }
      console.log('[task]', JSON.stringify(task))

      if (useClaude) {
        const jobId = Date.now()
        queue.push({ task, jobId })
        pumpQueue()
        res.writeHead(200, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ ok: true, accepted: true, mode: 'claude', jobId, queued: queue.length }))
      }

      // 旧路径：广播给所有已连接的 Figma 插件
      wss.clients.forEach((c) => { if (c.readyState === 1) c.send(JSON.stringify(task)) })
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ ok: true, delivered: wss.clients.size }))
    })
    return
  }

  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ ok: true, mode: useClaude ? 'claude' : 'plugin', plugins: wss.clients.size }))
  }
  res.writeHead(404); res.end()
})

const wss = new WebSocketServer({ server })
wss.on('connection', (ws, req) => {
  console.log('[ws] 插件已连接', req.socket.remoteAddress)
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString())
    if (msg.event === 'done') {
      console.log('[done] record_id =', msg.record_id)
      // TODO 正式版：在这里回写飞书（多维表格更新记录状态），或转发到飞书 webhook
    }
  })
  ws.on('close', () => console.log('[ws] 插件断开'))
})

server.listen(PORT, () => console.log(`桥接服务已启动: http://127.0.0.1:${PORT}  模式=${useClaude ? 'claude' : 'plugin'}`))
