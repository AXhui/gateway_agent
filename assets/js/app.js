/* ==========================================================================
   Workbench · 交互装配层
   把「意图解析 → 装配规划 → 渲染 → 还原度校验」四步引擎接到界面上，
   并把生成的 HTML 原样暴露在「代码」页，保证所见即所得、生成即可交付。
   ========================================================================== */
(function () {
  const $ = s => document.querySelector(s);
  const $$ = s => Array.prototype.slice.call(document.querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const state = {
    mode: 'match',
    theme: 'light',
    device: 'desktop',
    html: '',
    plan: null,
    report: null,
    trace: [],
    title: ''
  };

  const EXAMPLES = [
    { t: '做一个设备概览看板，带指标卡、遥测图表和设备列表', m: 'match' },
    { t: '告警中心页面，要有未处理告警列表和点击后的处理抽屉', m: 'match' },
    { t: '固件升级任务页，弹窗里能选版本和灰度批次', m: 'match' },
    { t: '网关管理页面，展示网络拓扑和网关列表', m: 'match' },
    { t: '成员权限管理，能看到角色和启停开关', m: 'match' },
    { t: '数据分析页，看最近 7 天的趋势和日志', m: 'match' },
    { t: '做一个工单列表页，带筛选和批量派单', m: 'learn' },
    { t: '巡检任务管理页面，需要图表和状态筛选', m: 'learn' },
    { t: '能耗账单页面，展示用量趋势和明细表格', m: 'learn' }
  ];

  /* ---------------- 资产库 ---------------- */
  let assetFilter = '';

  function treeData() {
    const base = MS_BASE_COMPONENTS.filter(c => !assetFilter || (c.cn + c.name + c.id).toLowerCase().indexOf(assetFilter) !== -1);
    const biz = MS_BIZ_COMPONENTS.filter(c => !assetFilter || (c.cn + c.id + c.tags.join('')).toLowerCase().indexOf(assetFilter) !== -1);
    const mods = MS_MODULES.filter(m => !assetFilter || (m.cn + m.id + m.tags.join('')).toLowerCase().indexOf(assetFilter) !== -1);
    const tpls = MS_TEMPLATES.filter(t => !assetFilter || (t.cn + t.id + Object.keys(t.kw).join('')).toLowerCase().indexOf(assetFilter) !== -1);
    return { base, biz, mods, tpls };
  }

  function renderTree() {
    const d = treeData();
    const groups = [
      { key: 'L1', name: 'L1 设计令牌', count: 1, items: [{ type: 'tokens', id: 'tokens', cn: '设计令牌层', en: 'tokens.css', on: true }] },
      {
        key: 'L2', name: 'L2 基础组件', count: d.base.length,
        items: d.base.map(c => ({ type: 'base', id: c.id, cn: c.cn, en: c.name, on: c.implemented }))
      },
      {
        key: 'L3', name: 'L3 业务组件', count: d.biz.length,
        items: d.biz.map(c => ({ type: 'biz', id: c.id, cn: c.cn, en: c.id, on: true, isNew: c.generated }))
      },
      {
        key: 'L4', name: 'L4 页面模块', count: d.mods.length,
        items: d.mods.map(m => ({ type: 'mod', id: m.id, cn: m.cn, en: m.id, on: true, isNew: m.generated }))
      },
      {
        key: 'L5', name: 'L5 页面模板', count: d.tpls.length,
        items: d.tpls.map(t => ({ type: 'tpl', id: t.id, cn: t.cn, en: t.id, on: true }))
      }
    ];

    $('#tree').innerHTML = groups.map(g => `
      <div class="wb-group">
        <button class="wb-group-head" data-group="${g.key}">
          <span class="wb-group-caret">▾</span>${esc(g.name)}
          <span class="wb-group-count">${g.count}</span>
        </button>
        <div class="wb-group-items" data-items="${g.key}">
          ${g.items.map(it => `
            <button class="wb-item" data-type="${it.type}" data-id="${esc(it.id)}">
              <span class="wb-dot ${it.isNew ? 'wb-dot--new' : (it.on ? 'wb-dot--on' : 'wb-dot--off')}"></span>
              <span>${esc(it.cn)}</span>
              <span class="wb-item-en">${esc(it.en)}</span>
            </button>`).join('')}
        </div>
      </div>`).join('');

    $$('#tree .wb-group-head').forEach(b => b.addEventListener('click', () => {
      const box = $('[data-items="' + b.dataset.group + '"]');
      const hidden = box.style.display === 'none';
      box.style.display = hidden ? '' : 'none';
      b.querySelector('.wb-group-caret').textContent = hidden ? '▾' : '▸';
    }));
    $$('#tree .wb-item').forEach(b => b.addEventListener('click', () => {
      $$('#tree .wb-item').forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      showAsset(b.dataset.type, b.dataset.id);
      switchTab('asset');
    }));
  }

  function showAsset(type, id) {
    let html = '';
    if (type === 'tokens') {
      const css = MS_CSS.tokens;
      const defs = (css.match(/--[a-z0-9-]+\s*:/g) || []).length;
      html = `<div class="wb-asset-title">设计令牌层<span class="wb-asset-en">.claude/tokens/tokens.css</span></div>
        <div class="wb-asset-desc">从线上组件文档原样抽取的唯一真源。所有组件层与业务层只允许引用这里的令牌，禁止裸值 —— 这是还原度可校验的前提。</div>
        <dl class="wb-kv">
          <dt>令牌定义</dt><dd>${defs} 条</dd>
          <dt>主题</dt><dd>浅色 :root + 深色 [data-theme="dark"]</dd>
          <dt>体积</dt><dd>${(css.length / 1024).toFixed(1)} KB</dd>
          <dt>来源</dt><dd>milesight-iot-web-doc.html</dd>
        </dl>`;
    } else if (type === 'base') {
      const c = MS_BASE_INDEX[id];
      html = `<div class="wb-asset-title">${esc(c.cn)}<span class="wb-asset-en">${esc(c.name)}</span></div>
        <div class="wb-asset-desc">${esc(c.summary)}</div>
        <dl class="wb-kv">
          <dt>分类</dt><dd>${esc(c.cat)}</dd>
          <dt>状态</dt><dd>${c.implemented ? '<span style="color:var(--wb-good)">已封装</span>' : '<span style="color:var(--wb-text-3)">在册待封装</span>'}</dd>
          <dt>Figma</dt><dd>${esc(c.figma)}</dd>
          <dt>属性</dt><dd>${c.props.length} 个</dd>
          <dt>引用令牌</dt><dd>${(c.tokens || []).join(' ')}</dd>
        </dl>
        ${c.guidance ? `<div class="wb-mono wb-subhead">GUIDANCE</div><div class="wb-asset-desc">${esc(c.guidance)}</div>` : ''}
        ${c.skill ? `<div class="wb-mono wb-subhead">COMPONENT SKILL</div><div class="wb-skill">${esc(c.skill)}</div>` : ''}`;
    } else if (type === 'biz') {
      const c = MS_BIZ_INDEX[id];
      const deps = c.atoms.map(a => {
        const b = MS_BASE_INDEX[a];
        return `<span class="wb-trace-chip" style="${b && b.implemented ? '' : 'color:var(--wb-bad)'}" data-jump="base:${a}">${esc(b ? b.cn : a)}</span>`;
      }).join(' ');
      html = `<div class="wb-asset-title">${esc(c.cn)}<span class="wb-asset-en">${esc(c.id)}</span></div>
        <div class="wb-asset-desc">${esc(c.desc)}</div>
        <dl class="wb-kv">
          <dt>层级</dt><dd>L3 业务组件</dd>
          <dt>来源</dt><dd>${c.generated ? '<span style="color:var(--wb-accent)">Agent 自动生成</span>' : '人工封装'}</dd>
          ${c.derivedFrom ? `<dt>学习自</dt><dd>${c.derivedFrom.map(x => esc(MS_BIZ_INDEX[x] ? MS_BIZ_INDEX[x].cn : x)).join(' + ')}</dd>` : ''}
          <dt>标签</dt><dd>${c.tags.map(esc).join(' · ')}</dd>
        </dl>
        <div class="wb-mono wb-subhead">依赖的基础组件（搭建逻辑）</div>
        <div class="wb-trace-chips">${deps}</div>
        <div class="wb-mono wb-subhead">被哪些模块引用</div>
        <div class="wb-trace-chips">${MS_MODULES.filter(m => m.biz.indexOf(c.id) !== -1).map(m => `<span class="wb-trace-chip">${esc(m.cn)}</span>`).join(' ') || '<span class="wb-hint">未被引用</span>'}</div>`;
    } else if (type === 'mod') {
      const m = MS_MODULE_INDEX[id];
      html = `<div class="wb-asset-title">${esc(m.cn)}<span class="wb-asset-en">${esc(m.id)}</span></div>
        <div class="wb-asset-desc">模块 = 若干业务组件 + 区块标题 + 版式栅格。模块本身不绑定具体业务，实体字段由上下文注入，所以同一个模块换一个实体即可复用到新页面。</div>
        <div class="wb-mono wb-subhead">包含业务组件</div>
        <div class="wb-trace-chips">${m.biz.map(b => `<span class="wb-trace-chip" data-jump="biz:${b}">${esc(MS_BIZ_INDEX[b] ? MS_BIZ_INDEX[b].cn : b)}</span>`).join(' ')}</div>
        <div class="wb-mono wb-subhead">被哪些模板使用</div>
        <div class="wb-trace-chips">${MS_TEMPLATES.filter(t => t.modules.indexOf(m.id) !== -1).map(t => `<span class="wb-trace-chip">${esc(t.cn)}</span>`).join(' ') || '<span class="wb-hint">未被引用</span>'}</div>
        <div class="wb-mono wb-subhead">匹配标签</div>
        <div class="wb-trace-chips">${m.tags.map(t => `<span class="wb-trace-chip">${esc(t)}</span>`).join(' ')}</div>`;
    } else if (type === 'tpl') {
      const t = MS_TEMPLATE_INDEX[id];
      html = `<div class="wb-asset-title">${esc(t.cn)}<span class="wb-asset-en">${esc(t.id)}</span></div>
        <div class="wb-asset-desc">${esc(t.desc)}</div>
        <div class="wb-mono wb-subhead">模块装配顺序</div>
        <div class="wb-trace-chips">${t.modules.map(m => `<span class="wb-trace-chip" data-jump="mod:${m}">${esc(MS_MODULE_INDEX[m] ? MS_MODULE_INDEX[m].cn : m)}</span>`).join(' → ')}</div>
        <div class="wb-mono wb-subhead">关键词权重</div>
        <div class="wb-trace-chips">${Object.keys(t.kw).map(k => `<span class="wb-trace-chip">${esc(k)} ${t.kw[k]}</span>`).join(' ')}</div>
        <div class="wb-mono wb-subhead">偏好实体</div>
        <div class="wb-trace-chips">${t.entities.map(e => `<span class="wb-trace-chip">${esc(MS_ENTITIES[e] ? MS_ENTITIES[e].cn : e)}</span>`).join(' ') || '<span class="wb-hint">不限</span>'}</div>`;
    }
    $('#pane-asset').innerHTML = html;
    $$('#pane-asset [data-jump]').forEach(el => el.addEventListener('click', () => {
      const [ty, iid] = el.dataset.jump.split(':');
      if ((ty === 'base' && MS_BASE_INDEX[iid]) || (ty === 'biz' && MS_BIZ_INDEX[iid]) || (ty === 'mod' && MS_MODULE_INDEX[iid])) showAsset(ty, iid);
    }));
  }

  /* ---------------- 生成 ---------------- */
  function generate(text) {
    const raw = text.trim();
    if (!raw) return;
    let out;
    if (state.mode === 'learn') {
      out = MSLearner.run(raw, { theme: state.theme });
      state.trace = out.trace;
      state.plan = out.plan;
      state.title = out.plan.title + '（Agent 生成）';
    } else {
      const intent = MSParser.parse(raw);
      const plan = MSPlanner.plan(intent, { theme: state.theme });
      const html = MSRenderer.document(plan);
      const report = MSValidator.check(html, plan);
      out = { plan, html, report };
      state.title = plan.title;
      state.trace = [
        {
          title: '意图解析',
          detail: `实体「${intent.entity ? intent.entity.cn : '未命中 → 通用对象'}」· 场景 ${intent.scenes.join('/') || '—'} · 形态 ${intent.surfaces.join('/') || '—'} · 动作 ${intent.actions.join('/') || '—'} · 置信度 ${Math.round(intent.confidence * 100)}%`,
          chips: [].concat(intent.scenes, intent.surfaces, intent.actions)
        },
        {
          title: '模板匹配',
          detail: `${plan.templateReason}；候选 ${plan.rankedTemplates.map(r => r.cn + '(' + r.score + ')').join(' · ')}`,
          chips: plan.rankedTemplates.map(r => r.cn + ' ' + r.score)
        },
        {
          title: '模块装配',
          detail: plan.deltas.length ? plan.deltas.map(d => d.why).join('；') : '模板默认结构，无需微调',
          chips: plan.modules.map(m => m.cn)
        },
        {
          title: '依赖展开',
          detail: `${plan.modules.length} 个模块 → ${plan.biz.length} 个业务组件 → ${plan.atoms.length} 个基础组件，全部来自已注册资产库`,
          chips: plan.atoms
        },
        {
          title: '还原度校验',
          detail: `${report.score}% · ${report.rules.map(r => r.name + ' ' + (r.bad === 0 ? '通过' : r.bad + ' 项异常')).join(' · ')}`,
          chips: report.rules.map(r => r.id + ' ' + Math.round(r.rate * 100) + '%')
        }
      ];
      state.plan = plan;
    }

    state.html = out.html;
    state.report = out.report;

    $('#stage-empty').hidden = true;
    $('#frame-wrap').hidden = false;
    $('#frame').srcdoc = out.html;
    $('#stage-name').textContent = state.title;
    $('#frame-wrap').dataset.device = state.device;

    renderTrace();
    renderReport();
    renderCode();
    renderTree();
    switchTab('trace');
  }

  function renderTrace() {
    $('#pane-trace').innerHTML = `<div class="wb-trace">${state.trace.map((t, i) => `
      <div class="wb-trace-step${t.title.indexOf('生成') > -1 || t.title.indexOf('铸造') > -1 ? ' is-key' : ''}">
        <span class="wb-trace-idx">${i + 1}</span>
        <div class="wb-trace-body">
          <div class="wb-trace-title">${esc(t.title)}</div>
          <div class="wb-trace-detail">${esc(t.detail)}</div>
          ${t.chips && t.chips.length ? `<div class="wb-trace-chips">${t.chips.map(c => `<span class="wb-trace-chip">${esc(c)}</span>`).join('')}</div>` : ''}
        </div>
      </div>`).join('')}</div>`;
  }

  function renderReport() {
    const r = state.report;
    if (!r) { $('#pane-report').innerHTML = '<div class="wb-hint">尚未生成。</div>'; return; }
    const ok = r.score >= 99.95;
    $('#pane-report').innerHTML = `
      <div class="wb-score">
        <span class="wb-score-num${ok ? '' : ' is-bad'}">${r.score}</span><span class="wb-score-unit">/100</span>
        <span class="wb-score-label">四项规则加权<br/>R1 30 · R2 30 · R3 25 · R4 15</span>
      </div>
      ${r.rules.map(rule => `
        <div class="wb-rule">
          <div class="wb-rule-head">
            <span class="wb-rule-id">${rule.id}</span>
            <span class="wb-rule-name">${esc(rule.name)}</span>
            <span class="wb-rule-rate${rule.bad ? ' is-bad' : ''}">${Math.round(rule.rate * 100)}%</span>
          </div>
          <div class="wb-rule-desc">${esc(rule.desc)}</div>
          <div class="wb-rule-meta">检查 ${rule.total} 项 · 异常 ${rule.bad} 项</div>
          ${rule.bad ? `<div class="wb-rule-bad">${rule.evidence.map(e => `<span>${esc(e)}</span>`).join('')}</div>` : ''}
        </div>`).join('')}
      <div class="wb-rule" style="border-bottom:0">
        <div class="wb-rule-head"><span class="wb-rule-name">本次装配规模</span></div>
        <div class="wb-rule-meta">${r.counts.modules} 模块 · ${r.counts.biz} 业务组件 · ${r.counts.atoms} 基础组件 · ${(r.counts.bytes / 1024).toFixed(1)} KB 单文件 HTML</div>
      </div>`;
  }

  function renderCode() {
    $('#code').textContent = state.html || '// 尚未生成';
    $('#code-meta').textContent = state.html ? (state.html.length / 1024).toFixed(1) + ' KB · 单文件 · 零外部依赖' : '—';
  }

  /* ---------------- 交互绑定 ---------------- */
  function switchTab(name) {
    $$('#tabs .wb-tab').forEach(t => t.classList.toggle('is-active', t.dataset.tab === name));
    $$('.wb-pane').forEach(p => p.classList.toggle('is-active', p.id === 'pane-' + name));
  }

  function renderExamples() {
    $('#examples').innerHTML = EXAMPLES.map(e =>
      `<button class="wb-chip${e.m === 'learn' ? ' wb-chip--learn' : ''}" data-text="${esc(e.t)}" data-mode="${e.m}">${esc(e.t)}</button>`
    ).join('');
    $$('#examples .wb-chip').forEach(b => b.addEventListener('click', () => {
      $('#inp').value = b.dataset.text;
      setMode(b.dataset.mode);
      generate(b.dataset.text);
    }));
  }

  function setMode(m) {
    state.mode = m;
    $$('#seg-mode .wb-seg-item').forEach(b => b.classList.toggle('is-active', b.dataset.mode === m));
  }

  function refreshStats() {
    const impl = MS_BASE_COMPONENTS.filter(c => c.implemented).length;
    $('#stat-atoms').textContent = `L2 ${impl}/${MS_BASE_COMPONENTS.length}`;
    $('#stat-biz').textContent = `L3 ${MS_BIZ_COMPONENTS.length}`;
    $('#stat-mod').textContent = `L4 ${MS_MODULES.length}`;
    $('#stat-tpl').textContent = `L5 ${MS_TEMPLATES.length}`;
  }

  function download() {
    if (!state.html) return;
    const blob = new Blob([state.html], { type: 'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (state.title || 'demo') + '.html';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function bind() {
    $('#btn-gen').addEventListener('click', () => generate($('#inp').value));
    $('#inp').addEventListener('keydown', e => { if (e.key === 'Enter') generate($('#inp').value); });
    $('#inp-clear').addEventListener('click', () => { $('#inp').value = ''; $('#inp').focus(); });
    $('#btn-download').addEventListener('click', download);
    $('#btn-copy').addEventListener('click', () => {
      navigator.clipboard.writeText(state.html || '').then(() => {
        const b = $('#btn-copy'); b.textContent = '已复制'; setTimeout(() => { b.textContent = '复制'; }, 1200);
      });
    });
    $$('#seg-mode .wb-seg-item').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    $$('#seg-device .wb-seg-item').forEach(b => b.addEventListener('click', () => {
      state.device = b.dataset.device;
      $$('#seg-device .wb-seg-item').forEach(x => x.classList.toggle('is-active', x === b));
      $('#frame-wrap').dataset.device = state.device;
    }));
    $$('#seg-theme .wb-seg-item').forEach(b => b.addEventListener('click', () => {
      state.theme = b.dataset.theme;
      $$('#seg-theme .wb-seg-item').forEach(x => x.classList.toggle('is-active', x === b));
      if (state.plan) generate($('#inp').value || state.plan.intent.raw);
    }));
    $$('#tabs .wb-tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));
    $('#asset-search').addEventListener('input', e => { assetFilter = e.target.value.trim().toLowerCase(); renderTree(); });
    /* 样式层修改后需执行 tools/build-css-bundle.py，这里只负责重载页面 */
    $('#btn-rebuild').addEventListener('click', () => location.reload());
    $('#btn-fullscreen').addEventListener('click', enterFullscreen);
    $('#btn-fs-exit').addEventListener('click', exitFullscreen);
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isFullscreen) exitFullscreen(); });
  }

  /* ---------------- 全屏渲染 ---------------- */
  let isFullscreen = false;

  function enterFullscreen() {
    if (!state.html) return; // 未生成时无内容可全屏
    isFullscreen = true;
    $('#frame-wrap').classList.add('is-fullscreen');
    $('#btn-fs-exit').hidden = false;
  }

  function exitFullscreen() {
    isFullscreen = false;
    $('#frame-wrap').classList.remove('is-fullscreen');
    $('#btn-fs-exit').hidden = true;
  }

  /* ---------------- 启动 ---------------- */
  renderExamples();
  renderTree();
  refreshStats();
  bind();
  generate(EXAMPLES[0].t);
  $('#inp').value = EXAMPLES[0].t;
})();
