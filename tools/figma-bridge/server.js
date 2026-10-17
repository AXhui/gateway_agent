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
// 模型分档：转录=机械照抄用 haiku，设计=sonnet；均可用环境变量覆盖（质量下降时 FIGMA_TRANSCRIBE_MODEL=sonnet）
const TRANSCRIBE_MODEL = process.env.FIGMA_TRANSCRIBE_MODEL || 'haiku'
const DESIGN_MODEL = process.env.FIGMA_MODEL || 'sonnet'

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

// ---- spec 提取：无头 Chrome(CDP) 在渲染后的页面里跑一段 JS，导出每个可见元素的位置/尺寸/真实色值/文案 ----
// 产出紧凑 spec JSON 作为转录基准，替代让 claude 分段读几百 KB 原始 HTML（token 大头）
const EXTRACT_JS = `(async () => {
  await new Promise(res => document.readyState === 'complete' ? setTimeout(res, 1200) : addEventListener('load', () => setTimeout(res, 1200)))
  const SKIP = new Set(['SCRIPT','STYLE','LINK','META','TITLE','HEAD','NOSCRIPT','TEMPLATE','BR'])
  const transparent = (c) => /^rgba\\(.+, 0\\)$/.test(c)
  const nodes = []
  let i = 0
  const page = { w: innerWidth, h: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight), bg: getComputedStyle(document.body).backgroundColor }
  const walk = (el, p) => {
    const tag = el.tagName
    if (SKIP.has(tag)) return
    const cs = getComputedStyle(el)
    if (cs.display === 'none' || cs.visibility === 'hidden') return
    const r = el.getBoundingClientRect()
    if (r.width < 1 || r.height < 1) return
    const idx = i++
    const n = { i: idx, p, t: tag.toLowerCase(), x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }
    const cls = (el.getAttribute('class') || '').trim()
    if (cls) n.c = cls.split(/\\s+/).slice(0, 4).join(' ')
    let tx = ''
    for (const nd of el.childNodes) if (nd.nodeType === 3) tx += nd.textContent
    tx = tx.replace(/\\s+/g, ' ').trim()
    if (!tx && (tag === 'INPUT' || tag === 'TEXTAREA')) tx = el.value || el.placeholder || ''
    if (tag === 'SELECT') tx = el.selectedOptions[0] ? el.selectedOptions[0].textContent : ''
    if (tx) {
      n.tx = tx.slice(0, 200)
      n.fg = cs.color; n.ff = cs.fontFamily.split(',')[0].replace(/["']/g, ''); n.fs = cs.fontSize; n.fw = cs.fontWeight
      if (cs.textAlign && cs.textAlign !== 'left' && cs.textAlign !== 'start') n.ta = cs.textAlign
    }
    if (tag === 'IMG') n.img = (el.currentSrc || el.src || '').startsWith('data:') ? 'inline' : (el.currentSrc || el.src || '').slice(0, 140)
    if (cs.backgroundImage && cs.backgroundImage !== 'none') n.bg = cs.backgroundImage.length <= 300 ? cs.backgroundImage : 'gradient'
    else if (cs.backgroundColor && !transparent(cs.backgroundColor)) n.bg = cs.backgroundColor
    if (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none') n.bd = cs.borderTopWidth + ' ' + cs.borderTopStyle + ' ' + cs.borderTopColor
    if (cs.borderRadius && cs.borderRadius !== '0px') n.br = cs.borderRadius
    if (cs.boxShadow && cs.boxShadow !== 'none') n.sh = cs.boxShadow.length <= 200 ? cs.boxShadow : 'shadow'
    nodes.push(n)
    if (i <= 2500) for (const c of el.children) walk(c, idx)
  }
  walk(document.body, -1)
  return JSON.stringify({ page, nodes, truncated: i > 2500 })
})()`

function extractSpec(htmlPath, jobId, cb) {
  const specPath = `/tmp/demo-${jobId}.spec.json`
  if (!fs.existsSync(CHROME_BIN)) return cb(null)
  const port = 20000 + Math.floor(Math.random() * 20000)
  const child = spawn(CHROME_BIN, [
    '--headless=new', '--disable-gpu', `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/chrome-spec-${jobId}`,
    '--window-size=1440,1024', '--hide-scrollbars', `file://${htmlPath}`,
  ], { stdio: 'ignore' })
  const WebSocket = require('ws')
  const http = require('http')
  let ws = null
  let done = false
  const finish = (spec) => {
    if (done) return
    done = true
    clearTimeout(guard)
    if (ws) { try { ws.close() } catch (e) { /* 已断开 */ } }
    child.kill()
    if (spec && spec.length > 100) {
      try {
        fs.writeFileSync(specPath, spec)
        console.log(`[demo:${jobId}] spec 提取成功 ${specPath}（${(spec.length / 1024).toFixed(0)}KB / ${JSON.parse(spec).nodes.length} 节点）`)
        return cb(specPath)
      } catch (e) { console.log(`[demo:${jobId}] spec 写盘失败:`, e.message) }
    }
    console.log(`[demo:${jobId}] spec 提取失败，转录回退为读原始 HTML`)
    cb(null)
  }
  const guard = setTimeout(() => finish(null), 30000)
  const tryList = (attempt) => {
    if (done) return
    http.get({ host: '127.0.0.1', port, path: '/json/list', timeout: 1500 }, (res) => {
      let body = ''
      res.on('data', (d) => (body += d))
      res.on('end', () => {
        let target = null
        try { target = JSON.parse(body).find((t) => t.type === 'page' && t.webSocketDebuggerUrl) } catch (e) { /* chrome 未就绪 */ }
        if (!target) return attempt < 12 ? setTimeout(() => tryList(attempt + 1), 1000) : finish(null)
        ws = new WebSocket(target.webSocketDebuggerUrl, { maxPayload: 256 * 1024 * 1024 })
        ws.on('open', () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: EXTRACT_JS, returnByValue: true, awaitPromise: true } })))
        ws.on('message', (m) => {
          const msg = JSON.parse(m.toString())
          if (msg.id !== 1) return
          const r = msg.result && msg.result.result
          if (r && typeof r.value === 'string' && r.value.length > 100) finish(r.value)
          else {
            console.log(`[demo:${jobId}] spec evaluate 失败:`, JSON.stringify((msg.result && (msg.result.exceptionDetails || r)) || msg.error || msg).slice(0, 300))
            finish(null)
          }
        })
        ws.on('error', () => finish(null))
      })
    }).on('error', () => { if (attempt < 12) setTimeout(() => tryList(attempt + 1), 1000) })
  }
  tryList(0)
}

function resolveDemoSource(task, jobId, cb) {
  const finish = (info) => {
    console.log(info
      ? `[demo:${jobId}] demo 源就绪（转录模式）: html=${info.htmlPath} png=${info.pngPath || '无'}`
      : `[demo:${jobId}] 三层取源均未命中，走自由设计模式`)
    cb(info)
  }
  const afterHtml = (htmlPath) => demoScreenshot(htmlPath, jobId, (pngPath) => {
    extractSpec(htmlPath, jobId, (specPath) => finish({ htmlPath, pngPath, specPath }))
  })

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
    // 转录模式：已有 demo，1:1 照抄。基准 = 截图（视觉）+ spec JSON（结构/色值/文案，机器提取，CSS 变量已解析）
    // spec 提取失败时才回退给原始 HTML（token 大头，最后手段）
    const mats = []
    if (demo.pngPath) mats.push(`- 视觉基准（整体长相/图标/渐变的参考）：${demo.pngPath}`)
    if (demo.specPath) {
      mats.push(`- 结构基准（权威）：${demo.specPath}——机器从渲染后的 demo 提取的元素树，每个可见元素一个节点：i/p=自身/父节点索引（直接对应 Figma frame 层级）、t=标签、c=类名、x/y/w/h=页面绝对坐标、tx=文案、bg/fg=真实色值（CSS 变量已解析）、fs/fw/ff=字号/字重/字体、bd/br/sh=边框/圆角/阴影。布局、文案、色值一律以此文件为准。`)
    } else {
      mats.push(`- 源码基准（结构/文案/真实色值）：${demo.htmlPath}（文件较大，分段读关键部分；颜色一律取 CSS 变量真实值）`)
    }
    return [
      warmup,
      `本次任务：把已有 demo 页面 1:1 转录成 Figma 可编辑设计稿（是照抄，不是重新设计）。`,
      `基准材料（只允许 Read 下面这 ${mats.length} 个文件，禁止读仓库其他任何文件、禁止读 prd.md、禁止做任何调研）：`,
      ...mats,
      `- 名称：${t.demoName || '未命名'}${t.version ? `（版本 ${t.version}）` : ''}`,
      `执行方式（硬性，为省时间与上下文）：`,
      `1. 画布写入一次性完成：把整页生成一段完整的 JavaScript，放在一个 use_figma 调用里建完，禁止交互式逐节点搭建（不做 get_metadata 逐层探索）。仅当脚本超过 5 万字符上限时，才按页面区块拆成少数几次调用。`,
      `2. 整页放进一个 1440 宽、完整内容高度的 frame，不要只画首屏。`,
      `3. 节点映射：spec 里带 bg/bd 的盒子→Frame 或 Rectangle；tx 文本→Text 节点（用 fs/fw/fg 实际值）；容器无样式→直接挂到父 frame 层级；图标按截图选最近似的内置图标。`,
      `4. ${libRule}`,
      `还原要求：布局、模块、顺序、文案 100% 照抄基准：侧边导航每一项、标题、卡片数字、表格每列每行、徽标颜色、按钮文字原样落进 Figma；颜色一律用基准里的真实色值，禁止主观换色、禁止增删模块、禁止改写文案。`,
      `完成后报告：写进了哪个文件（链接）、节点名、与基准的差异清单（应尽量为零）。`,
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
      '--model', demo ? TRANSCRIBE_MODEL : DESIGN_MODEL,
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

// 直接 require 本文件只导出工具函数用于测试，不启动服务
module.exports = { extractSpec, buildPrompt }
if (require.main === module) {
  server.listen(PORT, () => console.log(`桥接服务已启动: http://127.0.0.1:${PORT}  模式=${useClaude ? 'claude' : 'plugin'}`))
}
