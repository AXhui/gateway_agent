// 全状态导出页生成器 —— html.to.design 抓的是「渲染后的 DOM 快照」，
// 所以导出页可以自带 JS：加载时逐态渲染、克隆、网格平铺，插件抓到的就是铺好的成品。
// 契约由 demo 侧（A4 渲染）内嵌 window.MS_FIGMA_EXPORT 提供；无契约则原样返回（单页导入）。

const STAGE_CSS = `/* ms-figma-export：桥接注入的转写铺开层——一次性转写产物，非组件库样式，不适用令牌体系 */
html,body{height:auto!important;overflow:visible!important;margin:0!important}
#ms-fe-stage{display:grid;gap:64px;padding:64px;background:#fff;position:relative}
.ms-fe-cell{display:flex;flex-direction:column;gap:16px}
.ms-fe-label{font:600 20px/1.4 -apple-system,'Helvetica Neue',sans-serif;color:#111;padding:8px 0}
.ms-fe-frame{overflow:hidden;background:#fff;flex:none;box-sizing:content-box}
.ms-fe-clone{position:relative}`

const BOOTSTRAP_JS = `(function () {
  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn)
    else fn()
  }
  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms) }) }
  ready(async function () {
    var hook = window.MS_FIGMA_EXPORT
    if (!hook || !Array.isArray(hook.states) || !hook.states.length) return
    var root = document.querySelector(hook.rootSelector || '#app') || document.body
    var settle = hook.settleMs != null ? hook.settleMs : 200
    var cols = hook.columns || 1
    var W = hook.frameWidth || 1440

    var css = __MS_FE_CSS__
    ;(hook.hideSelectors || []).forEach(function (s) { css += s + '{display:none!important}' })
    var st = document.createElement('style')
    st.textContent = css
    document.head.appendChild(st)

    if (typeof hook.ready === 'function') { try { await hook.ready() } catch (e) {} }

    var stage = document.createElement('div')
    stage.id = 'ms-fe-stage'
    stage.style.gridTemplateColumns = 'repeat(' + cols + ', ' + W + 'px)'

    var ok = 0
    for (var i = 0; i < hook.states.length; i++) {
      var s = hook.states[i]
      var failed = false
      try {
        if (typeof hook.reset === 'function') { hook.reset(); await sleep(settle) }
        s.setup(); await sleep(settle)
        ok++
      } catch (e) {
        failed = true
        console.error('[ms-figma-export] 状态「' + s.name + '」setup 失败:', e)
      }
      // 标记 live DOM 里的 fixed 定位元素，克隆后转 absolute，避免固定层漂到每帧视口
      var fixed = []
      root.querySelectorAll('*').forEach(function (el) {
        if (getComputedStyle(el).position === 'fixed') { fixed.push(el); el.setAttribute('data-ms-fixed', '1') }
      })
      var clone = root.cloneNode(true)
      fixed.forEach(function (el) { el.removeAttribute('data-ms-fixed') })
      clone.querySelectorAll('[data-ms-fixed]').forEach(function (el) { el.style.position = 'absolute' })
      clone.classList.add('ms-fe-clone')

      var cell = document.createElement('div'); cell.className = 'ms-fe-cell'
      var label = document.createElement('div'); label.className = 'ms-fe-label'
      label.textContent = (i + 1) + '. ' + s.name + (failed ? '（导出失败，按前态快照）' : '')
      var frame = document.createElement('div'); frame.className = 'ms-fe-frame'
      frame.style.width = W + 'px'
      frame.style.height = Math.max(root.scrollHeight, 600) + 'px'
      frame.appendChild(clone)
      cell.appendChild(label); cell.appendChild(frame)
      stage.appendChild(cell)
    }

    document.body.innerHTML = ''
    document.body.appendChild(stage)
    window.__MS_FIGMA_EXPORT_DONE__ = true
    console.log('[ms-figma-export] 铺开完成: ' + ok + '/' + hook.states.length)
  })
})()`

const hasHook = (html) => /MS_FIGMA_EXPORT\s*=/.test(html)
const alreadyBuilt = (html) => html.includes('ms-fe-stage')

// 返回 { html, name, states }：states=true 表示命中契约已生成铺开页
function buildExportPage(html, name) {
  if (!hasHook(html) || alreadyBuilt(html)) return { html, name, states: false }
  const script = BOOTSTRAP_JS.split('__MS_FE_CSS__').join(JSON.stringify(STAGE_CSS))
  const inject = '\n<script>' + script + '<\/script>'
  const built = /<\/body>/i.test(html)
    ? html.replace(/<\/body>/i, inject + '\n</body>')
    : html + inject
  return { html: built, name: `${name} · 全状态`, states: true }
}

module.exports = { buildExportPage }
