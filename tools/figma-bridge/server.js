// 桥接服务 v3：飞书触发端(POST /task) → html.to.design MCP（Figma 插件中转落画布，零 LLM token）
// 有 demo 源 → import-html 直连导入；无 demo 源 → 任务失败（LLM 自由设计兜底已删，2026-10-23）
// 用法：
//   node server.js            启动桥接（:8080）
//   node server.js --login    首次 OAuth 授权：浏览器点一次，自动铸 service account 长期凭据
// 环境变量：H2D_PUBLIC_BASE=https://xxx.trycloudflare.com 时，import-html 失败自动改走 import-url（经公网隧道取页）
const http = require('http')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
const { spawn } = require('child_process')
const { buildExportPage } = require('./export-page')

const PORT = 8080
const REPO_ROOT = '/Users/youxh/Feishu-competition'
const AUTH_FILE = path.join(__dirname, 'auth.json')          // 本机凭据，已 gitignore，绝不入库
const MCP_BASE = 'https://mcp.to.design'
const IMPORT_TIMEOUT_MS = 10 * 60 * 1000                      // 插件导入整页 demo 的安全垫

// 任务排队：一次只跑一个（Figma 插件同一时刻只接一个导入）
const queue = []
let running = false
function pumpQueue() {
  if (running || !queue.length) return
  running = true
  const { task, jobId } = queue.shift()
  runTask(task, jobId, () => { running = false; pumpQueue() })
}

// 飞书多维表格回写目标（UI demo 表）：任务结束后把生成的 Figma 链接写回触发按钮的那一行
const FEISHU = {
  bin: '/usr/local/bin/lark-cli',
  baseToken: 'F2MebgSgMaUZSbseUWLcefqbnKd',
  tableId: 'tbln6WxfFJ6iYaek',
  linkField: 'Figma 链接',
  statusField: 'Figma状态',   // 状态流：待转 → 转Figma中(工作流置位) → 已完成/失败(本服务回写)
}

function extractFigmaUrl(text) {
  const urls = String(text).match(/https:\/\/(?:www\.)?figma\.com\/(?:design|file)\/[A-Za-z0-9]+[^\s"'，。；）)、」』\]]*/g)
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
  const payload = JSON.stringify({ update_records: { [recordId]: { [FEISHU.linkField]: url, [FEISHU.statusField]: ['已完成'] } } })
  larkCli([
    'base', '+record-batch-update',
    '--base-token', FEISHU.baseToken,
    '--table-id', FEISHU.tableId,
    '--json', payload,
    '--as', 'user',
  ], (code, out) => console.log(`[writeback:${jobId}] lark-cli 退出 code=${code} ${out.slice(0, 300)}`))
}

// 只更新状态列（失败场景：无 Figma 链接 / 任务异常退出）
function updateRecordStatus(recordId, status, jobId) {
  const payload = JSON.stringify({ update_records: { [recordId]: { [FEISHU.statusField]: [status] } } })
  larkCli([
    'base', '+record-batch-update',
    '--base-token', FEISHU.baseToken,
    '--table-id', FEISHU.tableId,
    '--json', payload,
    '--as', 'user',
  ], (code, out) => console.log(`[writeback:${jobId}] 状态置为${status} lark-cli 退出 code=${code} ${out.slice(0, 300)}`))
}

function writeBackToFeishu(task, jobId, url) {
  // 按最终结果决定回写动作：有链接 → 写链接+已完成；无链接 → 标记失败（不让"转Figma中"卡住）
  const apply = (recordId) => url
    ? updateRecordField(recordId, url, jobId)
    : updateRecordStatus(recordId, '失败', jobId)

  if (task.record_id) return apply(task.record_id)
  // 兜底：工作流没带 record_id 时，按 Demo 名称+版本号 反查记录（同名多版本靠版本号区分）
  if (!task.demoName) {
    console.log(`[writeback:${jobId}] 无 record_id 也无 demoName，跳过回写`)
    return
  }
  const conditions = [["Demo 名称", "Is", task.demoName]]
  const body = {
    keyword: task.demoName,
    search_fields: ["Demo 名称"],
    select_fields: ["Demo 名称"],
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
        return row[0] === task.demoName
      })
    } catch (e) {
      return console.log(`[writeback:${jobId}] 反查结果解析失败:`, e.message)
    }
    if (!ids.length) {
      return console.log(`[writeback:${jobId}] 表里没找到 Demo 名称=${task.demoName} 的记录，跳过回写`)
    }
    console.log(`[writeback:${jobId}] 按 Demo 名称反查命中 ${ids.length} 条：${ids.join(', ')}`)
    ids.forEach((id) => apply(id))
  })
}

// ---- html.to.design 认证（自有凭据，独立于 claude 的存储）----
// auth.json 结构：{ client:{client_id,client_secret}, refresh_token?, svc?:{client_id,client_secret} }
// 运行时优先 svc（client_credentials 长期有效），否则 refresh_token（14 天，过期重跑 --login）

function loadAuth() {
  try { return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8')) } catch { return null }
}
function saveAuth(auth) {
  fs.writeFileSync(AUTH_FILE, JSON.stringify(auth, null, 2))
  fs.chmodSync(AUTH_FILE, 0o600)
}

const b64url = (buf) => Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

let tokenCache = null // { token, exp }

async function tokenRequest(form, basic) {
  const headers = { 'Content-Type': 'application/x-www-form-urlencoded' }
  if (basic) headers.Authorization = 'Basic ' + Buffer.from(`${basic[0]}:${basic[1]}`).toString('base64')
  const res = await fetch(`${MCP_BASE}/token`, { method: 'POST', headers, body: new URLSearchParams(form).toString() })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`token 端点 ${res.status}: ${JSON.stringify(data).slice(0, 300)}`)
  return data
}

async function getAccessToken() {
  if (tokenCache && Date.now() < tokenCache.exp - 5 * 60e3) return tokenCache.token
  const auth = loadAuth()
  if (!auth) throw new Error('未授权：先跑 node server.js --login')
  let data
  if (auth.svc) {
    data = await tokenRequest(
      { grant_type: 'client_credentials', resource: MCP_BASE, scope: 'mcp' },
      [auth.svc.client_id, auth.svc.client_secret],
    )
  } else if (auth.refresh_token) {
    data = await tokenRequest(
      { grant_type: 'refresh_token', refresh_token: auth.refresh_token, resource: MCP_BASE },
      [auth.client.client_id, auth.client.client_secret],
    )
    if (data.refresh_token && data.refresh_token !== auth.refresh_token) {
      saveAuth({ ...auth, refresh_token: data.refresh_token })
    }
  } else {
    throw new Error('auth.json 里既无 service account 也无 refresh token，重跑 node server.js --login')
  }
  tokenCache = { token: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 }
  return tokenCache.token
}

// ---- MCP 客户端（streamable HTTP + Bearer）----

async function parseMcpResponse(res, wantId) {
  const ct = res.headers.get('content-type') || ''
  if (!ct.includes('text/event-stream')) return res.json()
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true })
    const lines = buf.split('\n')
    buf = lines.pop()
    for (const line of lines) {
      if (!line.startsWith('data:')) continue
      try {
        const msg = JSON.parse(line.slice(5).trim())
        if (msg.id === wantId) return msg
      } catch { /* 心跳/分片行，跳过 */ }
    }
  }
  throw new Error(`MCP SSE 流结束但未收到响应 id=${wantId}`)
}

async function mcpCall(tool, args, timeoutMs = IMPORT_TIMEOUT_MS) {
  const token = await getAccessToken()
  const base = {
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
    Authorization: `Bearer ${token}`,
  }
  const post = (body, extra = {}) => fetch(`${MCP_BASE}/`, {
    method: 'POST',
    headers: { ...base, ...extra },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  })

  const initRes = await post({
    jsonrpc: '2.0', id: 1, method: 'initialize',
    params: {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'feishu-figma-bridge', version: '3.0' },
    },
  })
  if (initRes.status === 401) throw new Error('MCP 401：凭据失效，重跑 node server.js --login')
  if (!initRes.ok) throw new Error(`MCP initialize ${initRes.status}`)
  const init = await parseMcpResponse(initRes, 1)
  const session = initRes.headers.get('mcp-session-id')

  const headers = session ? { 'mcp-session-id': session } : {}
  await post({ jsonrpc: '2.0', method: 'notifications/initialized' }, headers).catch(() => {})
  const callRes = await post({ jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: tool, arguments: args } }, headers)
  if (!callRes.ok) throw new Error(`MCP tools/call ${callRes.status}: ${(await callRes.text()).slice(0, 300)}`)
  const msg = await parseMcpResponse(callRes, 2)
  if (msg.error) throw new Error(`MCP error: ${JSON.stringify(msg.error).slice(0, 300)}`)
  const r = msg.result
  if (r && r.isError) {
    const text = (r.content || []).map((c) => c.text || '').join(' ')
    throw new Error(`工具执行失败: ${text.slice(0, 300)}`)
  }
  return r
}

// ---- --login：动态注册 + PKCE 授权码 + 自动铸 service account ----

async function cmdLogin() {
  const cbPort = 4300 + Math.floor(Math.random() * 200)
  const redirectUri = `http://127.0.0.1:${cbPort}/callback`
  let auth = loadAuth()
  if (!auth || !auth.client) {
    console.log('注册 MCP 客户端…')
    const res = await fetch(`${MCP_BASE}/reg`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_name: 'feishu-figma-bridge',
        redirect_uris: [redirectUri],
        grant_types: ['authorization_code', 'refresh_token'],
        response_types: ['code'],
        scope: 'openid offline_access mcp',
      }),
    })
    if (!res.ok) throw new Error(`动态注册失败 ${res.status}: ${(await res.text()).slice(0, 200)}`)
    const reg = await res.json()
    auth = { client: { client_id: reg.client_id, client_secret: reg.client_secret } }
  }

  const verifier = b64url(crypto.randomBytes(48))
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest())
  const state = b64url(crypto.randomBytes(12))
  const authUrl = `${MCP_BASE}/auth?` + new URLSearchParams({
    client_id: auth.client.client_id,
    response_type: 'code',
    scope: 'openid offline_access mcp',
    resource: MCP_BASE,
    redirect_uri: redirectUri,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  })

  const code = await new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      const u = new URL(req.url, `http://127.0.0.1:${cbPort}`)
      if (u.pathname !== '/callback') { res.writeHead(404); return res.end() }
      if (u.searchParams.get('state') !== state) { res.writeHead(400); return res.end('state 不匹配') }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
      res.end('<h3>授权成功，可以关掉这个页面回到终端</h3>')
      srv.close(() => resolve(u.searchParams.get('code') || u.searchParams.get('error')))
    })
    srv.on('error', reject)
    srv.listen(cbPort, '127.0.0.1', () => {
      console.log(`\n即将打开浏览器完成 html.to.design 授权（用 Figma 插件同一账号登录）…\n${authUrl}\n`)
      if (!process.env.H2D_NO_BROWSER) spawn('open', [authUrl], { stdio: 'ignore' })
    })
    setTimeout(() => reject(new Error('等待浏览器授权超时（5 分钟）')), 5 * 60 * 1000)
  })
  if (!code || code === 'access_denied') throw new Error(`授权失败: ${code}`)

  console.log('用授权码换 token…')
  const data = await tokenRequest(
    { grant_type: 'authorization_code', code, redirect_uri: redirectUri, code_verifier: verifier, resource: MCP_BASE },
    [auth.client.client_id, auth.client.client_secret],
  )
  auth.refresh_token = data.refresh_token
  saveAuth(auth)
  console.log('refresh token 已保存（14 天有效）')

  // 铸 service account：长期凭据，免 14 天续期
  try {
    const res = await fetch(`${MCP_BASE}/service-accounts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${data.access_token}` },
    })
    if (res.ok) {
      const svc = await res.json()
      saveAuth({ ...auth, svc: { client_id: svc.client_id, client_secret: svc.client_secret } })
      console.log('service account 已铸好并保存（长期有效，无需续期）')
    } else {
      console.log(`service account 创建未成功（${res.status}），先用 refresh token 跑，14 天后重跑 --login`)
    }
  } catch (e) {
    console.log('service account 创建异常，先用 refresh token 跑：', e.message)
  }
  console.log('完成。可先在 Figma 打开 html.to.design 插件切到 MCP 标签页，然后启动 node server.js')
}

// ---- demo 源解析：三层兜底，只需拿到 html 文件路径 ----
// 优先级（行内产物是权威基准，本地归档可能落后于云端）：
// 1. task.demoUrl（工作流显式带的飞书云盘附件链接）
// 2. 反查多维表格「预览 URL」列（触发行自己的产物）再下载
// 3. 本地归档 05_release/REQ-###/demo.html（预览列为 UNC 占位或无链接时兜底）

function extractUrl(text) {
  const m = String(text || '').match(/https?:\/\/[^\s\)\]]+/)
  return m ? m[0] : null
}

function resolveDemoSource(task, jobId, cb) {
  const finish = (info, src) => {
    console.log(info
      ? `[demo:${jobId}] demo 源就绪（${src}）: html=${info.htmlPath}`
      : `[demo:${jobId}] 三层取源均未命中，任务放弃（无 demo 源不再有兜底）`)
    cb(info)
  }

  const fromUrl = (url, src, next) => {
    if (!url) return next()
    const htmlPath = `/tmp/demo-${jobId}.html`
    larkCli(['drive', '+download', '--url', url, '--output', htmlPath, '--overwrite', '--as', 'user'], (code, out) => {
      if (code !== 0 || !fs.existsSync(htmlPath) || fs.statSync(htmlPath).size < 500) {
        console.log(`[demo:${jobId}] ${src} 下载失败: ${String(out).slice(0, 150)}`)
        return next()
      }
      finish({ htmlPath }, src)
    })
  }
  const fromLocal = () => {
    const m = String(task.demoName || '').match(/REQ-(\d+)/i)
    if (m) {
      const p = `${REPO_ROOT}/05_release/REQ-${m[1]}/demo.html`
      if (fs.existsSync(p)) {
        console.log(`[demo:${jobId}] 用本地归档 ${p}`)
        return finish({ htmlPath: p }, '本地归档')
      }
    }
    finish(null)
  }
  const fromRecord = () => {
    if (!task.demoName) return fromLocal()
    const conditions = [["Demo 名称", "Is", task.demoName]]
    const body = {
      keyword: task.demoName, search_fields: ["Demo 名称"],
      select_fields: ["Demo 名称", "预览 URL"],
      filter: { logic: "and", conditions }, limit: 5,
    }
    larkCli([
      'base', '+record-search', '--base-token', FEISHU.baseToken, '--table-id', FEISHU.tableId,
      '--json', JSON.stringify(body), '--format', 'json', '--as', 'user',
    ], (code, out) => {
      let url = null
      try {
        const data = JSON.parse(out).data
        // 同名行可能有多条（历史同步重复），遍历取第一条带可用链接的，空链接行跳过
        for (const row of data.data || []) {
          if ((row[0] || '').trim() !== String(task.demoName).trim()) continue
          const u = extractUrl(row[1])
          if (u) { url = u; break }
        }
      } catch (e) { /* 落到本地归档兜底 */ }
      if (!url) {
        console.log(`[demo:${jobId}] 表格「预览 URL」列无可用链接（未上传或 UNC 占位），走本地归档兜底`)
        return fromLocal()
      }
      console.log(`[demo:${jobId}] 从表格「预览 URL」取到云端附件，下载中`)
      fromUrl(url, '表格预览URL', fromLocal)
    })
  }
  fromUrl(extractUrl(task.demoUrl), 'demoUrl', fromRecord)
}

// import-url 兜底时把 demo 挂在本服务上，让 mcp.to.design 走公网取页
const servedDemos = new Map() // jobId -> { html }
function serveDemo(jobId, html) {
  servedDemos.set(jobId, { html })
  if (servedDemos.size > 20) servedDemos.delete(servedDemos.keys().next().value)
}

function stripHtmlComments(html) {
  return html.replace(/<!--[\s\S]*?-->/g, '')
}

// ---- Figma 自动拉起：插件离线时点击仍能自动恢复（不依赖人事先开好插件）----
const H2D_PLUGIN_ID = '1159123024924461424'
const openFigmaApp = () => { try { spawn('open', ['-a', 'Figma'], { stdio: 'ignore' }) } catch { /* open 不存在则靠报错信息人工兜底 */ } }
const openH2dPlugin = () => { try { spawn('open', [`figma://plugin/${H2D_PLUGIN_ID}`], { stdio: 'ignore' }) } catch { /* 同上 */ } }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const pluginOffline = (msg) => /isn.t connected|not connected/i.test(msg)

async function importWithAutoRecovery(kind, args, jobId) {
  let lastErr
  for (let round = 0; round < 3; round++) {
    if (round > 0) await sleep(5000)
    try {
      return await mcpCall(kind === 'url' ? 'import-url' : 'import-html', args)
    } catch (e) {
      lastErr = e
      if (!pluginOffline(e.message)) throw e
      console.log(`[h2d:${jobId}] 插件不在线（第 ${round + 1}/3 轮），自动拉起 Figma + html.to.design 插件后重试`)
      openFigmaApp()                       // 应用没开则启动，开着则仅聚焦
      await sleep(round === 0 ? 10000 : 5000)  // 冷启动留足应用加载时间
      openH2dPlugin()                      // 深链在当前文件里启动插件
      await sleep(15000)                   // 等插件加载并连上 MCP
    }
  }
  throw new Error(`${lastErr.message}（已自动拉起 3 轮仍不在线：确认插件内登录账号与 --login 授权一致、并停在 MCP 标签页后重新点按钮）`)
}

// ---- 主任务：demo → import-html 直连导入（零 LLM token）----

function runImportJob(task, jobId, demo, done) {
  const name = task.demoName || `demo-${jobId}`
  fs.readFile(demo.htmlPath, 'utf8', async (err, raw) => {
    if (err) { console.log(`[h2d:${jobId}] 读 demo 失败:`, err.message); return done() }
    const html = stripHtmlComments(raw)
    // 命中 demo 内嵌的 MS_FIGMA_EXPORT 契约 → 生成全状态铺开页（逐态渲染+网格平铺）再导入
    const built = buildExportPage(html, name)
    console.log(`[h2d:${jobId}] import-html 开始（${(built.html.length / 1024).toFixed(0)}KB，name=${built.name}${built.states ? '，全状态铺开' : ''}）`)
    try {
      let result
      try {
        result = await importWithAutoRecovery('html', { name: built.name, html: built.html }, jobId)
      } catch (e) {
        const base = process.env.H2D_PUBLIC_BASE
        // 插件离线重试 import-url 也没意义；仅在配置了公网地址时对其他失败（如体积超限）换通道
        if (!base || pluginOffline(e.message)) throw e
        console.log(`[h2d:${jobId}] import-html 失败（${e.message}），改走 import-url 公网取页: ${base}/demo/${jobId}`)
        serveDemo(jobId, built.html)
        result = await importWithAutoRecovery('url', { url: `${base}/demo/${jobId}`, viewport: 1440 }, jobId)
      }
      const url = extractFigmaUrl(result ? JSON.stringify(result) : '')
      console.log(`[h2d:${jobId}] 导入完成${url ? ` → ${url}` : ''}`)
      writeBackToFeishu(task, jobId, url)
    } catch (e) {
      console.log(`[h2d:${jobId}] 导入失败: ${e.message}`)
    }
    done()
  })
}

function runTask(task, jobId, done) {
  resolveDemoSource(task, jobId, (demo) => {
    if (demo) return runImportJob(task, jobId, demo, done)
    console.log(`[task:${jobId}] 无 demo 源，任务结束（不做 LLM 兜底）`)
    done()
  })
}

// ---- HTTP 服务 ----

const server = http.createServer((req, res) => {
  // CORS：允许任意页面（多维表格内嵌 HTML / 本地按钮页）直接 POST
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }

  if (req.method === 'POST' && req.url === '/task') {
    let body = ''
    req.on('data', (c) => (body += c))
    req.on('end', () => {
      let task
      try { task = JSON.parse(body) } catch { task = { raw: body } }
      console.log('[task]', JSON.stringify(task))
      const jobId = Date.now()
      queue.push({ task, jobId })
      pumpQueue()
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ ok: true, accepted: true, mode: 'h2d', jobId, queued: queue.length }))
    })
    return
  }

  // import-url 兜底取页端点（html.to.design 云端经公网隧道访问）
  const demoMatch = req.method === 'GET' && req.url.match(/^\/demo\/(\d+)$/)
  if (demoMatch) {
    const entry = servedDemos.get(demoMatch[1])
    if (!entry) { res.writeHead(404); return res.end() }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return res.end(entry.html)
  }

  if (req.method === 'GET' && req.url === '/health') {
    const auth = loadAuth()
    res.writeHead(200, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({
      ok: true,
      mode: 'h2d',
      auth: auth ? (auth.svc ? 'service-account' : 'refresh-token') : 'none',
      queued: queue.length,
      running,
    }))
  }
  res.writeHead(404); res.end()
})

if (process.argv.includes('--login')) {
  cmdLogin().catch((e) => { console.error('[login] 失败:', e.message); process.exit(1) })
} else if (require.main === module) {
  if (!loadAuth()) console.log('[warn] 尚未授权：先跑 node server.js --login')
  server.listen(PORT, () => console.log(`桥接服务已启动: http://127.0.0.1:${PORT}  模式=html.to.design 直连`))
}
