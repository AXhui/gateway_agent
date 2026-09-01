/* ==========================================================================
   L3 · 业务组件层 (Business Components)
   --------------------------------------------------------------------------
   铁律：业务组件不得自己写样式常量，只能
        ① 组合 L2 基础组件（ms-* 类），
        ② 引用 L1 设计令牌，
        ③ 使用本文件顶部的结构类（bc-*，定义在 library/business.css）。
   每个组件显式声明 atoms（所依赖的基础组件），learner 依此学习「搭建逻辑」。
   ========================================================================== */

/* ---------- 图标（内联 SVG，随生成页面一起导出，零外部依赖） ---------- */
window.MS_ICONS = {
  device: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="6" y="3" width="12" height="18" rx="3"/><path d="M10 7h4"/></svg>',
  gateway: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 17h.01M12 10V7a4 4 0 0 1 8 0v3"/></svg>',
  alarm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  firmware: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 16V4"/><path d="m7 9 5-5 5 5"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  member: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 5.5a3 3 0 0 1 0 5.5M18 20c0-2.5-1-4.6-2.6-5.7"/></svg>',
  sensor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 16h4l2-5 3 9 2.5-7 2 3h4.5"/></svg>',
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 5h16M4 12h16M4 19h10"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 6h16M7 12h10M10 18h4"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 4v11"/><path d="m7 11 5 5 5-5"/><path d="M5 20h14"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 5v6h-6"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m5 13 4 4L19 7"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 4 2.5 20h19L12 4Z"/><path d="M12 10v4M12 17h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 6 12 12M18 6 6 18"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20V6M4 20h16"/><path d="m8 16 3.5-5 3 3L20 8"/></svg>',
  topology: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="5" r="2.5"/><circle cx="5" cy="19" r="2.5"/><circle cx="19" cy="19" r="2.5"/><path d="M12 7.5 6.5 17M12 7.5 17.5 17M7.5 19h9"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 20h4L20 8l-4-4L4 16v4Z"/><path d="m14 6 4 4"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>'
};

/* ---------- 渲染小工具 ---------- */
window.MS_BIZ_UTIL = (function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ico = (name, size) => `<span class="ms-ico ms-ico--${size || 16}">${MS_ICONS[name] || MS_ICONS.info}</span>`;
  const TONE = { success: 'ms-tag--success', error: 'ms-tag--error', warm: 'ms-tag--warm', primary: 'ms-tag--primary', muted: 'ms-tag' };
  const DOT = { success: 'ms-timeline-dot--success', error: 'ms-timeline-dot--error', warm: 'ms-timeline-dot--warm', muted: 'ms-timeline-dot--muted' };

  function statusTag(st, size) {
    if (!st) return '';
    const cls = TONE[st.tone] || 'ms-tag';
    return `<span class="ms-tag ${cls}${size === 'sm' ? ' ms-tag--round' : ''}"><i class="ms-tag-dot"></i>${esc(st.cn)}</span>`;
  }
  function statusOf(entity, name) {
    return entity.statuses.find(s => s.cn === name) || entity.statuses[0];
  }
  function cellHtml(field, row, entity) {
    const v = row[field.key];
    switch (field.type) {
      case 'status': return statusTag(statusOf(entity, v));
      case 'level': {
        const tone = v === '紧急' ? 'ms-tag--error' : (v === '重要' ? 'ms-tag--warm' : 'ms-tag--primary');
        return `<span class="ms-tag ${tone}">${esc(v)}</span>`;
      }
      case 'percent': {
        const p = Math.max(4, Math.min(100, Number(v) || 0));
        const tone = p < 20 ? 'error' : (p < 50 ? 'warm' : 'success');
        return `<span class="bc-bar"><i class="bc-bar-track bc-bar-track--${tone}"><b style="width:${p}%"></b></i><em>${esc(v)}%</em></span>`;
      }
      case 'code': return `<code class="bc-code">${esc(v)}</code>`;
      case 'user': return `<span class="bc-user"><span class="ms-avatar ms-avatar--sm">${esc(String(v).slice(0, 1))}</span>${esc(v)}</span>`;
      case 'role': return `<span class="ms-select ms-select--inline"><select class="ms-select-native"><option>${esc(v)}</option></select></span>`;
      case 'num': return `<span class="bc-num">${esc(v)}${field.unit ? '<em>' + esc(field.unit) + '</em>' : ''}</span>`;
      case 'time': return `<span class="bc-time">${esc(v)}</span>`;
      default: return `<span class="ms-text">${esc(v)}</span>`;
    }
  }
  function svgLine(seed, opts) {
    const o = Object.assign({ w: 640, h: 180, base: 50, amp: 22, points: 32, color: 'var(--color-primary-normal)', fill: true }, opts || {});
    const data = MS_DATA.series(seed, o.points, o.base, o.amp);
    const max = Math.max.apply(null, data) * 1.15, min = Math.min.apply(null, data) * 0.85;
    const stepX = o.w / (data.length - 1);
    const y = v => o.h - ((v - min) / (max - min || 1)) * o.h;
    const pts = data.map((v, i) => [i * stepX, y(v)]);
    const line = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    const area = line + ` L${o.w} ${o.h} L0 ${o.h} Z`;
    const last = pts[pts.length - 1];
    return `<svg class="bc-chart-svg" viewBox="0 0 ${o.w} ${o.h}" preserveAspectRatio="none" role="img" aria-label="${esc(seed)} 趋势图">
      <defs><linearGradient id="g-${MS_DATA.hash(String(seed))}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${o.color}" stop-opacity="0.22"/><stop offset="100%" stop-color="${o.color}" stop-opacity="0"/>
      </linearGradient></defs>
      ${[0.25, 0.5, 0.75].map(t => `<line x1="0" y1="${(o.h * t).toFixed(1)}" x2="${o.w}" y2="${(o.h * t).toFixed(1)}" stroke="var(--color-divider-base-2)" stroke-width="1" stroke-dasharray="3 4"/>`).join('')}
      ${o.fill ? `<path d="${area}" fill="url(#g-${MS_DATA.hash(String(seed))})"/>` : ''}
      <path d="${line}" fill="none" stroke="${o.color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${last[0].toFixed(1)}" cy="${last[1].toFixed(1)}" r="3.5" fill="var(--color-bg-card)" stroke="${o.color}" stroke-width="2"/>
    </svg>`;
  }
  function svgBars(seed, opts) {
    const o = Object.assign({ w: 640, h: 180, base: 60, amp: 30, points: 16, color: 'var(--color-primary-normal)' }, opts || {});
    const data = MS_DATA.series(seed, o.points, o.base, o.amp);
    const max = Math.max.apply(null, data) * 1.1;
    const bw = (o.w / data.length) * 0.6, gap = o.w / data.length;
    return `<svg class="bc-chart-svg" viewBox="0 0 ${o.w} ${o.h}" preserveAspectRatio="none" role="img" aria-label="${esc(seed)} 分布图">
      ${data.map((v, i) => `<rect x="${(i * gap + (gap - bw) / 2).toFixed(1)}" y="${(o.h - (v / max) * o.h).toFixed(1)}" width="${bw.toFixed(1)}" height="${((v / max) * o.h).toFixed(1)}" rx="3" fill="${o.color}" fill-opacity="0.82"/>`).join('')}
    </svg>`;
  }
  return { esc, ico, statusTag, statusOf, cellHtml, svgLine, svgBars, DOT };
})();

/* ---------- 业务组件定义 ---------- */
(function () {
  const U = MS_BIZ_UTIL, esc = U.esc, ico = U.ico;

  window.MS_BIZ_COMPONENTS = [
    {
      id: 'bc-metric-card', cn: '指标卡组', cat: '概览',
      desc: '一行四列的关键指标卡，含同比趋势与状态色。用于所有控制台首屏。',
      atoms: ['statistic', 'card', 'tag', 'icon'],
      entityHint: 'device',
      tags: ['指标', '概览', '看板', '统计', '总览', '首屏', '数据'],
      render(ctx) {
        const e = ctx.entity;
        return `<div class="ms-grid-4">${e.metrics.map((m, i) => `
          <div class="ms-card bc-metric">
            <div class="ms-card-body bc-metric-body">
              <div class="ms-stat-title">${esc(m.cn)}</div>
              <div class="ms-stat-value">${esc(m.value)}<span class="ms-stat-suffix">${esc(m.suffix || '')}</span></div>
              <div class="ms-stat-trend ms-stat-trend--${m.dir || 'flat'}">${m.dir === 'down' ? '↓' : (m.dir === 'up' ? '↑' : '—')} ${esc(m.trend || '')}<span class="ms-text--auxiliary ms-text--sm"> 较昨日</span></div>
            </div>
          </div>`).join('')}</div>`;
      }
    },
    {
      id: 'bc-status-tag', cn: '状态标签', cat: '原子业务',
      desc: '把业务状态枚举映射为令牌色标签，统一全站状态语义。',
      atoms: ['tag', 'badge'],
      entityHint: 'device',
      tags: ['状态', '在线', '离线', '标签', '枚举'],
      render(ctx) {
        return `<div class="ms-space ms-space--8">${ctx.entity.statuses.map(s => U.statusTag(s)).join('')}</div>`;
      }
    },
    {
      id: 'bc-filter-bar', cn: '筛选栏', cat: '列表',
      desc: '关键词搜索 + 状态/分组/时间筛选 + 批量操作与导出，是所有列表页的标准头部。',
      atoms: ['input', 'select', 'date-picker', 'button', 'form', 'space'],
      entityHint: 'device',
      tags: ['筛选', '搜索', '查询', '过滤', '批量', '导出', '列表', '管理'],
      render(ctx) {
        const e = ctx.entity;
        return `<div class="ms-card"><div class="ms-card-body ms-card-body--tight">
          <div class="bc-filter">
            <label class="ms-input ms-input--sm bc-filter-search">${ico('search', 14)}<input placeholder="搜索${esc(e.cn)}名称 / 编号" value=""></label>
            <span class="ms-select ms-select--sm bc-filter-select"><select><option>全部状态</option>${e.statuses.map(s => `<option>${esc(s.cn)}</option>`).join('')}</select></span>
            <span class="ms-select ms-select--sm bc-filter-select"><select><option>全部分组</option><option>默认分组</option><option>生产车间</option><option>仓储物流</option></select></span>
            <span class="bc-filter-date"><label class="ms-input ms-input--sm">${ico('log', 14)}<input value="2026-08-01 ~ 2026-08-31" readonly></label></span>
            <span class="bc-filter-actions">
              <button class="ms-btn ms-btn--sm">${ico('refresh', 14)}重置</button>
              <button class="ms-btn ms-btn--sm ms-btn--filled">${ico('search', 14)}查询</button>
            </span>
          </div></div></div>`;
      }
    },
    {
      id: 'bc-data-table', cn: '数据表格', cat: '列表',
      desc: '带多选、状态列、进度列与行内操作的主数据表，列定义由实体字段自动装配。',
      atoms: ['table', 'checkbox', 'tag', 'button', 'pagination', 'empty', 'avatar'],
      entityHint: 'device',
      tags: ['列表', '表格', '管理', '批量', '数据', '分页', '明细'],
      render(ctx) {
        const e = ctx.entity, rows = ctx.rows || MS_DATA.build(e, 6);
        const cols = e.fields;
        const ops = e.actions.slice(0, 3);
        return `<div class="ms-table-wrap">
          <div class="ms-table-toolbar">
            <div class="ms-table-title">${esc(e.cn)}列表<span class="ms-tag ms-tag--round ms-tag--outline bc-count">${rows.length * 214}</span></div>
            <div class="ms-space ms-space--8">
              <button class="ms-btn ms-btn--sm ms-btn--dashed">${ico('filter', 14)}列设置</button>
              <button class="ms-btn ms-btn--sm">${ico('download', 14)}导出</button>
              <button class="ms-btn ms-btn--sm ms-btn--filled">${ico('plus', 14)}新增${esc(e.cn)}</button>
            </div>
          </div>
          <table class="ms-table">
            <thead><tr>
              <th class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span></label></th>
              ${cols.map(c => `<th${c.type === 'num' || c.type === 'percent' ? ' class="ms-table-num"' : ''}>${esc(c.cn)}</th>`).join('')}
              <th class="ms-table-ops">操作</th>
            </tr></thead>
            <tbody>${rows.map((r, i) => `<tr${i === 0 ? ' class="ms-table-row--active"' : ''}>
              <td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"${i < 2 ? ' checked' : ''}><span class="ms-checkbox-box"></span></label></td>
              ${cols.map(c => `<td${c.type === 'num' || c.type === 'percent' ? ' class="ms-table-num"' : ''}>${U.cellHtml(c, r, e)}</td>`).join('')}
              <td class="ms-table-ops">${ops.map((a, k) => `<button class="ms-btn ms-btn--link${k === ops.length - 1 ? ' ms-btn--danger' : ''}">${esc(a)}</button>`).join('')}</td>
            </tr>`).join('')}</tbody>
          </table>
          ${ctx.plain ? '' : `<div class="bc-table-foot">
            <span class="ms-text--secondary ms-text--sm">已选 <b>2</b> 项</span>
            <div class="ms-space ms-space--8">
              <button class="ms-btn ms-btn--sm ms-btn--dashed">批量配置</button>
              <button class="ms-btn ms-btn--sm ms-btn--danger">批量删除</button>
              <span class="ms-pagination">
                <span class="ms-page-item" disabled>‹</span>
                <span class="ms-page-item ms-page-item--active">1</span>
                <span class="ms-page-item">2</span><span class="ms-page-item">3</span>
                <span class="ms-page-item">…</span><span class="ms-page-item">18</span>
                <span class="ms-page-item">›</span>
                <span class="ms-page-jump">跳至<input value="1">页</span>
              </span>
            </div>
          </div>`}
        </div>`;
      }
    },
    {
      id: 'bc-entity-card', cn: '实体卡片', cat: '详情',
      desc: '卡片形态展示单个实体的关键属性与操作，适合详情区与卡片墙。',
      atoms: ['card', 'descriptions', 'tag', 'button', 'avatar'],
      entityHint: 'device',
      tags: ['卡片', '详情', '属性', '概览', '信息'],
      render(ctx) {
        const e = ctx.entity, rows = ctx.rows || MS_DATA.build(e, 3);
        return `<div class="ms-grid-3">${rows.map(r => `
          <div class="ms-card ms-card--hoverable bc-entity-card">
            <div class="ms-card-head">
              <div class="ms-card-title">${ico(ctx.icon || 'device', 20)}<span class="ms-ellipsis">${esc(r.name || e.cn)}</span></div>
              ${U.statusTag(r._status)}
            </div>
            <div class="ms-card-body">
              <div class="ms-desc">
                ${e.fields.filter(f => f.type !== 'status').slice(0, 6).map(f => `
                  <div class="ms-desc-item"><div class="ms-desc-label">${esc(f.cn)}</div><div class="ms-desc-value">${U.cellHtml(f, r, e)}</div></div>`).join('')}
              </div>
            </div>
            <div class="ms-card-foot">
              <button class="ms-btn ms-btn--sm">${ico('edit', 14)}编辑</button>
              <button class="ms-btn ms-btn--sm ms-btn--filled">${esc(e.actions[0])}</button>
            </div>
          </div>`).join('')}</div>`;
      }
    },
    {
      id: 'bc-telemetry-panel', cn: '遥测面板', cat: '数据',
      desc: '时间范围切换 + 多测点 Tab + 折线/柱状图（纯内联 SVG，不引第三方图表库）。',
      atoms: ['card', 'tabs', 'segmented', 'statistic', 'tag', 'button'],
      entityHint: 'sensor',
      tags: ['数据', '遥测', '图表', '趋势', '曲线', '监控', '看板', '报表', '分析'],
      render(ctx) {
        const e = ctx.entity;
        const tabs = ['温度', '湿度', '电量', '信号强度'];
        return `<div class="ms-card">
          <div class="ms-card-head">
            <div class="ms-card-title">${ico('chart', 20)}遥测数据</div>
            <div class="ms-card-extra">
              <span class="ms-segmented">
                <span class="ms-segmented-item">1H</span>
                <span class="ms-segmented-item ms-segmented-item--active">24H</span>
                <span class="ms-segmented-item">7D</span>
                <span class="ms-segmented-item">30D</span>
              </span>
              <button class="ms-btn ms-btn--sm ms-btn--dashed">${ico('download', 14)}导出 CSV</button>
            </div>
          </div>
          <div class="ms-card-body ms-stack ms-stack--tight">
            <div class="ms-tabs">${tabs.map((t, i) => `<span class="ms-tab${i === 0 ? ' ms-tab--active' : ''}">${esc(t)}</span>`).join('')}</div>
            <div class="bc-chart-grid">
              <div class="bc-chart-main">
                ${U.svgLine(e.cn + '-温度', { base: 42, amp: 14, color: 'var(--color-primary-normal)' })}
                <div class="bc-chart-axis"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span></div>
              </div>
              <div class="bc-chart-side ms-stack ms-stack--tight">
                <div class="bc-chart-stat"><div class="ms-stat-title">当前值</div><div class="ms-stat-value ms-stat-value--sm">23.6<span class="ms-stat-suffix">℃</span></div></div>
                <div class="bc-chart-stat"><div class="ms-stat-title">区间最大</div><div class="ms-stat-value ms-stat-value--sm">31.2<span class="ms-stat-suffix">℃</span></div></div>
                <div class="bc-chart-stat"><div class="ms-stat-title">区间最小</div><div class="ms-stat-value ms-stat-value--sm">18.4<span class="ms-stat-suffix">℃</span></div></div>
                <div class="bc-chart-stat"><div class="ms-stat-title">采集点位数</div><div class="ms-stat-value ms-stat-value--sm">1,024</div></div>
              </div>
            </div>
            <div class="ms-divider"></div>
            <div class="ms-text--sm ms-text--secondary">按小时聚合 · 数据延迟 &lt; 30s · 采样频率 10 min/次</div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-rule-form', cn: '规则配置表单', cat: '表单',
      desc: '左标签右控件的标准配置表单，覆盖输入/选择/开关/滑杆/数值五种控件与校验态。',
      atoms: ['form', 'input', 'select', 'switch', 'slider', 'input-number', 'alert', 'button', 'divider'],
      entityHint: 'alarm',
      tags: ['配置', '规则', '表单', '新增', '编辑', '设置', '创建', '参数'],
      render(ctx) {
        const e = ctx.entity;
        return `<div class="ms-card">
          <div class="ms-card-head"><div class="ms-card-title">${ico('alarm', 20)}${esc(e.cn)}配置</div><span class="ms-tag ms-tag--primary ms-tag--round">草稿</span></div>
          <div class="ms-card-body">
            <div class="ms-form">
              <div class="ms-form-section">
                <div class="ms-form-section-title">基础信息</div>
                <div class="ms-form-item ms-form-item--inline">
                  <label class="ms-form-label ms-form-label--required">${esc(e.cn)}名称</label>
                  <div class="ms-form-control"><label class="ms-input"><input value="${esc(e.cn)}超限提醒"></label></div>
                </div>
                <div class="ms-form-item ms-form-item--inline">
                  <label class="ms-form-label ms-form-label--required">触发条件</label>
                  <div class="ms-form-control">
                    <div class="ms-space ms-space--8">
                      <span class="ms-select"><select><option>温度</option><option>湿度</option><option>电量</option><option>信号强度</option></select></span>
                      <span class="ms-select"><select><option>大于</option><option>小于</option><option>区间外</option></select></span>
                      <span class="ms-input-number" style="width:120px"><input value="45"><span class="ms-input-number-step"><button>▴</button><button>▾</button></span></span>
                    </div>
                  </div>
                </div>
                <div class="ms-form-item ms-form-item--inline">
                  <label class="ms-form-label">生效范围</label>
                  <div class="ms-form-control"><span class="ms-select"><select><option>全部分组</option><option>生产车间</option><option>仓储物流</option></select></span></div>
                </div>
              </div>
              <div class="ms-divider"></div>
              <div class="ms-form-section">
                <div class="ms-form-section-title">通知与阈值</div>
                <div class="ms-form-item ms-form-item--inline">
                  <label class="ms-form-label">连续触发</label>
                  <div class="ms-form-control"><div class="ms-slider"><i class="ms-slider-fill" style="width:35%"></i><i class="ms-slider-handle" style="left:35%"></i></div><div class="ms-form-help">连续 3 个采样点满足条件后才告警</div></div>
                </div>
                <div class="ms-form-item ms-form-item--inline">
                  <label class="ms-form-label">启用通知</label>
                  <div class="ms-form-control"><label class="ms-switch"><input type="checkbox" checked><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label></div>
                </div>
                <div class="ms-form-item ms-form-item--inline">
                  <label class="ms-form-label">通知渠道</label>
                  <div class="ms-form-control">
                    <div class="ms-space ms-space--12">
                      <label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>邮件</label>
                      <label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>Webhook</label>
                      <label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span>短信</label>
                    </div>
                  </div>
                </div>
              </div>
              <div class="ms-alert ms-alert--warn">${ico('warn', 16)}<div class="ms-alert-body"><div class="ms-alert-title">阈值校验</div><div class="ms-alert-desc">当前条件预计影响 1,284 台设备，日均产生约 42 条告警。</div></div></div>
              <div class="ms-space ms-space--8">
                <button class="ms-btn">取消</button>
                <button class="ms-btn ms-btn--dashed">存为草稿</button>
                <button class="ms-btn ms-btn--filled">保存并启用</button>
              </div>
            </div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-detail-drawer', cn: '详情抽屉', cat: '详情',
      desc: '右侧抽屉承载实体详情：属性描述 + 处理时间轴 + 底部操作，不打断列表上下文。',
      atoms: ['drawer', 'descriptions', 'timeline', 'tag', 'button', 'divider'],
      entityHint: 'alarm',
      tags: ['详情', '抽屉', '处理', '时间轴', '查看', '单条'],
      render(ctx) {
        const e = ctx.entity, r = (ctx.rows || MS_DATA.build(e, 1))[0];
        return `<div class="bc-drawer-preview">
          <div class="ms-drawer bc-drawer-static">
            <div class="ms-drawer-head">
              <div><div class="ms-h4">${esc(e.cn)}详情</div><div class="ms-text--sm ms-text--auxiliary">${esc(r.eui || r.sn || r.code || '—')}</div></div>
              <span class="ms-modal-close">${ico('close', 16)}</span>
            </div>
            <div class="ms-drawer-body ms-stack">
              <div class="ms-space ms-space--8">${U.statusTag(r._status)}<span class="ms-tag ms-tag--outline">${esc(e.actions[0])}建议</span></div>
              <div class="ms-desc ms-desc--bordered">
                ${e.fields.filter(f => f.type !== 'status').map(f => `<div class="ms-desc-item"><div class="ms-desc-label">${esc(f.cn)}</div><div class="ms-desc-value">${U.cellHtml(f, r, e)}</div></div>`).join('')}
              </div>
              <div class="ms-divider"></div>
              <div class="ms-h5">处理记录</div>
              <div class="ms-timeline">
                <div class="ms-timeline-item"><i class="ms-timeline-dot ms-timeline-dot--error"></i><div class="ms-timeline-title">触发告警<span class="ms-timeline-time">2026-08-31 14:02</span></div><div class="ms-timeline-desc">温度 46.2℃ 超过阈值 45℃，持续 3 个采样点。</div></div>
                <div class="ms-timeline-item"><i class="ms-timeline-dot ms-timeline-dot--warm"></i><div class="ms-timeline-title">系统派单<span class="ms-timeline-time">2026-08-31 14:05</span></div><div class="ms-timeline-desc">按规则「温度超限」自动指派至运维组 · ${esc('林见川')}。</div></div>
                <div class="ms-timeline-item"><i class="ms-timeline-dot ms-timeline-dot--muted"></i><div class="ms-timeline-title">待处理<span class="ms-timeline-time">—</span></div><div class="ms-timeline-desc">等待现场确认。</div></div>
              </div>
            </div>
            <div class="ms-drawer-foot">
              <button class="ms-btn">忽略</button>
              <button class="ms-btn">指派</button>
              <button class="ms-btn ms-btn--filled">标记已处理</button>
            </div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-upgrade-modal', cn: '批量任务弹窗', cat: '反馈',
      desc: '固件升级 / 批量下发的分步弹窗：选择版本 → 灰度策略 → 进度反馈。',
      atoms: ['modal', 'steps', 'select', 'progress', 'alert', 'checkbox', 'button', 'table'],
      entityHint: 'firmware',
      tags: ['升级', '固件', 'OTA', '批量', '推送', '弹窗', '任务', '灰度'],
      render(ctx) {
        const e = ctx.entity;
        return `<div class="bc-modal-preview">
          <div class="ms-modal ms-modal--lg">
            <div class="ms-modal-head"><div class="ms-modal-title">批量${esc(e.cn)}升级</div><span class="ms-modal-close">${ico('close', 16)}</span></div>
            <div class="ms-modal-body ms-stack">
              <div class="ms-steps">
                <div class="ms-step ms-step--done"><span class="ms-step-index">${ico('check', 14)}</span><div class="ms-step-body"><div class="ms-step-title">选择版本</div><div class="ms-step-desc">v2.4.1</div></div><i class="ms-step-line"></i></div>
                <div class="ms-step ms-step--active"><span class="ms-step-index">2</span><div class="ms-step-body"><div class="ms-step-title">选择设备</div><div class="ms-step-desc">1,208 台</div></div><i class="ms-step-line"></i></div>
                <div class="ms-step"><span class="ms-step-index">3</span><div class="ms-step-body"><div class="ms-step-title">灰度策略</div><div class="ms-step-desc">待设置</div></div></div>
              </div>
              <div class="ms-alert ms-alert--info">${ico('info', 16)}<div class="ms-alert-body"><div class="ms-alert-title">已选 1,208 台设备</div><div class="ms-alert-desc">其中 86 台上次升级失败，建议勾选失败重试策略。</div></div></div>
              <div class="ms-form">
                <div class="ms-form-item ms-form-item--inline"><label class="ms-form-label ms-form-label--required">目标版本</label><div class="ms-form-control"><span class="ms-select"><select><option>v2.4.1（推荐 · 2026-08-20 发布）</option><option>v2.4.0</option><option>v2.3.7</option></select></span></div></div>
                <div class="ms-form-item ms-form-item--inline"><label class="ms-form-label">灰度批次</label><div class="ms-form-control"><span class="ms-select"><select><option>分批灰度（10% → 50% → 100%）</option><option>全量推送</option></select></span></div></div>
                <div class="ms-form-item ms-form-item--inline"><label class="ms-form-label">失败重试</label><div class="ms-form-control"><label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>失败后自动重试 3 次，间隔 10 分钟</label></div></div>
              </div>
              <div class="ms-divider"></div>
              <div class="bc-progress-list">
                <div class="ms-progress"><div class="ms-progress-line"><i class="ms-progress-bar" style="width:62%"></i></div><span class="ms-progress-text">62% · 749/1208</span></div>
                <div class="ms-progress"><div class="ms-progress-line"><i class="ms-progress-bar ms-progress-bar--success" style="width:100%"></i></div><span class="ms-progress-text">灰度批次 1 已完成</span></div>
                <div class="ms-progress"><div class="ms-progress-line"><i class="ms-progress-bar ms-progress-bar--error" style="width:18%"></i></div><span class="ms-progress-text">失败 86 台</span></div>
              </div>
            </div>
            <div class="ms-modal-foot"><button class="ms-btn">取消</button><button class="ms-btn ms-btn--dashed">保存为任务</button><button class="ms-btn ms-btn--filled">开始升级</button></div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-topology', cn: '网络拓扑', cat: '数据',
      desc: '网关—设备的两层拓扑图，用内联 SVG 绘制，状态色与状态标签同源。',
      atoms: ['card', 'badge', 'tag', 'tooltip', 'button'],
      entityHint: 'gateway',
      tags: ['拓扑', '网关', '网络', '结构', '关系', '连接', '架构'],
      render(ctx) {
        const devices = ['VS121', 'VS133', 'WS202', 'EM300', 'AM107'];
        return `<div class="ms-card">
          <div class="ms-card-head">
            <div class="ms-card-title">${ico('topology', 20)}网络拓扑</div>
            <div class="ms-card-extra">
              <span class="ms-segmented"><span class="ms-segmented-item ms-segmented-item--active">按网关</span><span class="ms-segmented-item">按区域</span></span>
              <button class="ms-btn ms-btn--sm ms-btn--dashed">${ico('refresh', 14)}刷新</button>
            </div>
          </div>
          <div class="ms-card-body">
            <svg class="bc-topo" viewBox="0 0 720 260" role="img" aria-label="网关与设备拓扑图">
              <line x1="360" y1="70" x2="130" y2="190" stroke="var(--color-divider-base-2)" stroke-width="1.5"/>
              <line x1="360" y1="70" x2="245" y2="190" stroke="var(--color-divider-base-2)" stroke-width="1.5"/>
              <line x1="360" y1="70" x2="360" y2="190" stroke="var(--color-divider-base-2)" stroke-width="1.5"/>
              <line x1="360" y1="70" x2="475" y2="190" stroke="var(--color-divider-base-2)" stroke-width="1.5"/>
              <line x1="360" y1="70" x2="590" y2="190" stroke="var(--color-divider-base-2)" stroke-width="1.5"/>
              <g>
                <rect x="300" y="34" width="120" height="46" rx="10" fill="var(--color-primary-bg)" stroke="var(--color-primary-normal)"/>
                <text x="360" y="55" text-anchor="middle" font-size="13" font-weight="600" fill="var(--color-primary-normal)">UG67 网关</text>
                <text x="360" y="70" text-anchor="middle" font-size="11" fill="var(--color-text-secondary)">在线 · 5 设备</text>
              </g>
              ${devices.map((d, i) => {
                const x = [130, 245, 360, 475, 590][i];
                const tone = i === 4 ? 'var(--color-error-normal)' : (i === 3 ? 'var(--color-warm-normal)' : 'var(--color-success-normal)');
                return `<g><rect x="${x - 52}" y="190" width="104" height="44" rx="8" fill="var(--color-bg-card)" stroke="var(--color-border-base)"/>
                  <circle cx="${x - 36}" cy="212" r="4" fill="${tone}"/>
                  <text x="${x - 22}" y="208" font-size="12" fill="var(--color-text-primary)">${d}</text>
                  <text x="${x - 22}" y="223" font-size="10" fill="var(--color-text-auxiliary)">${i === 4 ? '离线' : '在线'} · RSSI -${60 + i * 6}</text></g>`;
              }).join('')}
            </svg>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-member-table', cn: '成员权限表', cat: '权限',
      desc: '成员列表 + 角色下拉 + 启停开关，承载组织与权限管理。',
      atoms: ['table', 'avatar', 'select', 'switch', 'tag', 'button', 'pagination'],
      entityHint: 'member',
      tags: ['成员', '权限', '角色', '组织', '用户', '人员', '账号', '授权'],
      render(ctx) {
        const e = ctx.entity;
        const names = ['陈亦然', '林见川', '苏若彤', '周砚青', '何知远', '许清和'];
        const roles = ['超级管理员', '组织管理员', '运维人员', '运维人员', '只读成员', '只读成员'];
        return `<div class="ms-table-wrap">
          <div class="ms-table-toolbar">
            <div class="ms-table-title">成员与权限<span class="ms-tag ms-tag--round ms-tag--outline bc-count">248</span></div>
            <div class="ms-space ms-space--8">
              <label class="ms-input ms-input--sm" style="width:200px">${ico('search', 14)}<input placeholder="搜索成员 / 邮箱"></label>
              <button class="ms-btn ms-btn--sm ms-btn--filled">${ico('plus', 14)}邀请成员</button>
            </div>
          </div>
          <table class="ms-table">
            <thead><tr><th>成员</th><th>角色</th><th>所属组织</th><th>状态</th><th>最后登录</th><th class="ms-table-ops">操作</th></tr></thead>
            <tbody>${names.map((n, i) => `
              <tr>
                <td><span class="bc-user"><span class="ms-avatar ms-avatar--sm">${esc(n.slice(0, 1))}</span><span><span class="ms-list-title">${esc(n)}</span><span class="ms-list-desc">${['chenyr', 'linjc', 'surt', 'zhouyq', 'hezy', 'xuqh'][i]}@milesight.com</span></span></span></td>
                <td><span class="ms-select ms-select--sm"><select class="ms-select-native"><option>${esc(roles[i])}</option></select></span></td>
                <td>${i < 2 ? '总部 / 平台运维' : '华东大区 / 现场运维'}</td>
                <td>${U.statusTag(e.statuses[i % e.statuses.length])}</td>
                <td><span class="bc-time">2026-08-3${i} 0${i + 1}:1${i}</span></td>
                <td class="ms-table-ops"><button class="ms-btn ms-btn--link">编辑权限</button><button class="ms-btn ms-btn--link ms-btn--danger">移除</button></td>
              </tr>`).join('')}</tbody>
          </table>
        </div>`;
      }
    },
    {
      id: 'bc-log-timeline', cn: '操作日志时间轴', cat: '审计',
      desc: '按时间倒序展示操作流水，状态点颜色与状态标签共用一套令牌。',
      atoms: ['timeline', 'tag', 'button', 'select', 'empty'],
      entityHint: 'log',
      tags: ['日志', '审计', '流水', '记录', '操作记录', '追踪'],
      render(ctx) {
        const e = ctx.entity;
        const items = [
          { t: '2026-08-31 16:42', title: '批量升级固件 v2.4.1', who: '陈亦然', tone: 'success', desc: '影响设备 1,208 台，灰度批次 10%。' },
          { t: '2026-08-31 15:20', title: '修改告警规则「温度超限」', who: '林见川', tone: 'warm', desc: '阈值由 50℃ 调整为 45℃。' },
          { t: '2026-08-31 14:02', title: '触发紧急告警', who: '系统', tone: 'error', desc: '云谷工厂 3 号 温度 46.2℃。' },
          { t: '2026-08-31 11:36', title: '新增成员 许清和', who: '苏若彤', tone: 'success', desc: '角色：只读成员，组织：华东大区。' },
          { t: '2026-08-31 09:15', title: '导出设备清单', who: '周砚青', tone: 'muted', desc: '导出 12,846 条记录，格式 CSV。' }
        ];
        return `<div class="ms-card">
          <div class="ms-card-head">
            <div class="ms-card-title">${ico('log', 20)}${esc(e.cn)}记录</div>
            <div class="ms-card-extra">
              <span class="ms-select ms-select--sm"><select><option>全部操作类型</option><option>配置变更</option><option>数据导出</option><option>权限变更</option></select></span>
              <button class="ms-btn ms-btn--sm ms-btn--dashed">${ico('download', 14)}导出</button>
            </div>
          </div>
          <div class="ms-card-body">
            <div class="ms-timeline">
              ${items.map(it => `<div class="ms-timeline-item">
                <i class="ms-timeline-dot ${U.DOT[it.tone] || ''}"></i>
                <div class="ms-timeline-title">${esc(it.title)}<span class="ms-timeline-time">${esc(it.t)}</span></div>
                <div class="ms-timeline-desc">${esc(it.desc)} · 操作人 ${esc(it.who)}</div>
              </div>`).join('')}
            </div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-empty-state', cn: '空态引导', cat: '引导',
      desc: '无数据时的引导区：说明 + 主行动 + 次级行动，避免空白页。',
      atoms: ['empty', 'button', 'result', 'space'],
      entityHint: 'device',
      tags: ['空态', '引导', '无数据', '首次', '开通', '初始化'],
      render(ctx) {
        const e = ctx.entity;
        return `<div class="ms-card"><div class="ms-empty">
          <svg class="ms-empty-illu" viewBox="0 0 120 88" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="14" y="20" width="92" height="56" rx="8" stroke="var(--color-border-base)"/>
            <path d="M14 34h92" stroke="var(--color-border-base)"/>
            <circle cx="24" cy="27" r="2" fill="var(--color-border-base)" stroke="none"/>
            <circle cx="32" cy="27" r="2" fill="var(--color-border-base)" stroke="none"/>
            <path d="M34 52h52M34 62h34" stroke="var(--color-divider-base-2)"/>
          </svg>
          <div class="ms-empty-text">还没有${esc(e.cn)}数据</div>
          <div class="bc-empty-actions">
            <button class="ms-btn ms-btn--filled">${ico('plus', 14)}立即创建${esc(e.cn)}</button>
            <button class="ms-btn">查看接入文档</button>
          </div>
        </div></div>`;
      }
    },
    {
      id: 'bc-quick-actions', cn: '快捷操作区', cat: '概览',
      desc: '首屏高频操作入口，一屏只允许一个主按钮（遵循 Button 交互 Skill）。',
      atoms: ['button', 'space', 'card', 'icon', 'divider'],
      entityHint: 'device',
      tags: ['快捷', '操作', '入口', '常用', '新建'],
      render(ctx) {
        const e = ctx.entity;
        const list = [
          { i: 'plus', t: '新增' + e.cn }, { i: 'firmware', t: '批量升级' },
          { i: 'alarm', t: '配置告警' }, { i: 'download', t: '导出数据' }
        ];
        return `<div class="ms-card"><div class="ms-card-body ms-card-body--tight">
          <div class="bc-quick">
            <span class="bc-quick-label">快捷操作</span>
            <span class="ms-divider--vertical"></span>
            ${list.map((a, i) => `<button class="ms-btn ms-btn--sm ms-btn--text">${ico(a.i, 14)}${esc(a.t)}</button>`).join('')}
            <span class="bc-quick-spacer"></span>
            <button class="ms-btn ms-btn--sm">${ico('refresh', 14)}刷新</button>
            <button class="ms-btn ms-btn--sm ms-btn--filled">${ico('plus', 14)}新增${esc(e.cn)}</button>
          </div>
        </div></div>`;
      }
    }
  ];

  window.MS_BIZ_INDEX = Object.fromEntries(window.MS_BIZ_COMPONENTS.map(c => [c.id, c]));
})();
