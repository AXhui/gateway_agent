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
  device: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>',
  gateway: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="14" rx="2"/><path d="M6.01 18H6"/><path d="M10.01 18H10"/><path d="M15 10v4"/><path d="M17.84 7.17a4 4 0 0 0-5.66 0"/><path d="M20.66 4.34a8 8 0 0 0-11.31 0"/></svg>',
  alarm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  firmware: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7"/><path d="m7.5 4.27 9 5.15"/></svg>',
  member: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  sensor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>',
  log: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
  download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
  more: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>',
  warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
  topology: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z"/></svg>',
  trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>',
  chevronDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  moreHoriz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>',
  data: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
  app: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 4v4"/><path d="M2 8h20"/><path d="M6 4v4"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
  menuFold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M11 7h9"/><path d="M11 12h9"/><path d="M11 17h9"/><path d="M9 7l-5 5 5 5"/></svg>',
  menuUnfold: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h9"/><path d="M4 12h9"/><path d="M4 17h9"/><path d="M15 7l5 5-5 5"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>',
  minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>',
  cellular: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20h.01"/><path d="M7 20v-4"/><path d="M12 20v-8"/><path d="M17 20V8"/><path d="M22 20V4"/></svg>',
  wlan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" x2="12.01" y1="20" y2="20"/></svg>',
  ethernet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="10" x="4" y="10" rx="2"/><path d="M9 10V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><path d="M9 20v-4"/><path d="M15 20v-4"/></svg>',
  lorawan: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49"/><path d="M7.76 16.24a6 6 0 0 1 0-8.49"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 19.07a10 10 0 0 1 0-14.14"/></svg>',
  rs485: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16"/><path d="M4 17h16"/><path d="M8 3v4"/><path d="M16 3v4"/><path d="M8 17v4"/><path d="M16 17v4"/></svg>',
  io: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>',
  knx: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg>',
  mbus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22v-6"/><path d="M12 8V2"/><circle cx="12" cy="12" r="4"/></svg>'
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
  const slug = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  // EG71 一级侧边导航分组（侧栏与顶栏面包屑共享的唯一源，避免两处各写一份）
  const navGroups = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Data Services', icon: 'data', route: '/data-services', children: ['Data Acquisition', 'Data Forwarding', 'Data Library', 'Data Stream'] },
    { label: 'Network', icon: 'topology', route: '/network', children: ['Network Interface', 'Firewall Management', 'DHCP', 'DDNS', 'Link Failover', 'VPN'] },
    { label: 'Platform', icon: 'layers', route: '/platform', children: ['Location Rules'] },
    { label: 'System Setting', icon: 'settings', route: '/system-setting', children: ['General', 'User', 'Server', 'Maintenance', 'Log', 'SNMP', 'Events'] },
    { label: 'APP', icon: 'app', route: '/app', children: ['Python', 'Node-RED'] }
  ];
  return { esc, ico, statusTag, statusOf, cellHtml, svgLine, svgBars, DOT, slug, navGroups };
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
      id: 'bc-empty', cn: '空状态', cat: '空态',
      desc: '纯空状态：固定插画 + 随业务适配的可变文案，无行动按钮。',
      atoms: ['empty'],
      entityHint: 'device',
      tags: ['空态', '空状态', '无数据', '占位', '暂无'],
      render(ctx) {
        const e = ctx.entity;
        const title = ctx.empty && ctx.empty.cn ? ctx.empty.cn : `暂无${esc(e.cn)}数据`;
        const sub = ctx.empty && ctx.empty.sub ? ctx.empty.sub : '';
        return `<div class="ms-card"><div class="ms-empty bc-empty">
          <img class="ms-empty-illu bc-empty-img" src="data:image/png;base64,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" alt="" aria-hidden="true">
          <div class="ms-empty-text">${esc(title)}</div>
          ${sub ? `<div class="bc-empty-sub">${esc(sub)}</div>` : ''}
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
    },
    {
      id: 'bc-com-title', cn: '标题', cat: '通用',
      desc: '跨产品线通用标题编排：按 level（page/tab/card/group）× variant（main/sub）双维度决定形态，标题右侧可编排 Tag/提示图标/开关/按钮组，describe 分必要展示（下一行小字）与非必要提示（tooltip）双模式；只编排不写样式常量。',
      atoms: ['typography', 'form', 'tag', 'icon', 'tooltip', 'switch', 'button', 'text'],
      entityHint: 'com',
      tags: ['标题', '页面', 'Tab', '卡片', '分组', 'Tag', '开关', '按钮'],
      render(ctx) {
        const variant = ctx.variant || 'main';
        const level = ctx.level || 'card';
        const align = ctx.align || 'left';
        const alignCls = align === 'center' ? ' bc-com-title--center' : (align === 'right' ? ' bc-com-title--right' : '');
        // 标题原子：group 级复用 .ms-form-section-title（14px + 左竖条），否则 main→ms-h4 / sub→ms-h5
        const titleCls = level === 'group'
          ? 'ms-form-section-title'
          : (variant === 'sub' ? 'ms-h5' : 'ms-h4');
        // 左组：标题 + Tag（紧邻小间距）+ 提示图标（紧邻小间距）
        const main = [`<span class="${titleCls}">${esc(ctx.title || '')}</span>`];
        if (ctx.showTag && ctx.tag) main.push(`<span class="ms-tag">${esc(ctx.tag)}</span>`);
        if (ctx.showTip) {
          const tipText = (ctx.describeMode === 'tip' && ctx.describe) ? ctx.describe : (ctx.tip || '');
          main.push(`<span class="ms-tip">${ico('info', 14)}<span class="ms-tip-bubble">${esc(tipText)}</span></span>`);
        }
        // 右组：开关（两端对齐）+ 按钮组
        const extra = [];
        if (ctx.showSwitch) {
          const label = ctx.switchLabel ? `<span class="ms-text">${esc(ctx.switchLabel)}</span>` : '';
          const sw = `<label class="ms-switch ms-switch--xs"><input type="checkbox"${ctx.switchChecked ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>`;
          extra.push(`${label}${sw}`);
        }
        if (ctx.showButton && Array.isArray(ctx.buttons) && ctx.buttons.length) {
          const btns = ctx.buttons.map(b => {
            const kind = b.kind === 'filled' ? ' ms-btn--filled' : (b.kind === 'text' ? ' ms-btn--text' : '');
            return `<button class="ms-btn ms-btn--sm${kind}">${esc(b.t)}</button>`;
          }).join('');
          extra.push(`<div class="ms-btn-group">${btns}</div>`);
        }
        const mainEl = `<div class="bc-com-title-main">${main.join('')}</div>`;
        const extraEl = extra.length ? `<div class="bc-com-title-extra">${extra.join('')}</div>` : '';
        const row = `<div class="bc-com-title-row">${mainEl}${extraEl}</div>`;
        const descEl = (ctx.showDescribe && ctx.describeMode !== 'tip' && ctx.describe)
          ? `<span class="bc-com-title-desc ms-text ms-text--auxiliary">${esc(ctx.describe)}</span>`
          : '';
        return `<div class="bc-com-title bc-com-title--${level}${alignCls}">${row}${descEl}</div>`;
      }
    },
    {
      id: 'bc-eg71-sidenav', cn: '网关侧边导航', cat: '管理员',
      desc: 'Milesight 网关管理后台侧边导航（220px 深色侧边栏 · Figma 2016:89103）：Logo 区（Milesight 字标 + 白色描边新增按钮）+ 一级导航菜单（Dashboard 选中态 / Data Services / Network / Platform / System Setting / APP 各带 chevron 展开箭头，默认折叠）+ 底部 Admin 账户入口（头像 + 名称 + 更多操作下拉，含 Language 二级语言子菜单），编排 L2 Logo / 导航菜单 / 头像 / 按钮 / 下拉菜单基础组件；深色配色「基本固定」按 Figma 写死（bg #182032 / 选中 #052461·#5eafff / 未选中 #d6d6d8 / 常量白），不绑主题切换。',
      atoms: ['nav-menu', 'dropdown-menu', 'logo', 'avatar', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['侧边栏', '导航', '菜单', '下拉菜单', '管理员', 'EG71', '网关', '后台'],
      render(ctx) {
        // 一级导航（mode=vertical）：单一路由源 ctx.route 决定选中态；Dashboard 直达 /dashboard，
        // 其余带 chevron 可展开，子条目带各自路由（父级 route 即分组路由，子条目 = 分组路由 + slug）。
        const route = ctx.route || '/dashboard';
        const slug = U.slug;
        const groups = U.navGroups;
        const navItem = (g) => {
          const has = g.children && g.children.length;
          const active = route === g.route || route.indexOf(g.route + '/') === 0;
          const subActive = has && route.indexOf(g.route + '/') === 0;
          const chevron = has ? `<span class="bc-eg71-chevron">${ico('chevronDown', 16)}</span>` : '';
          const sub = has
            ? `<div class="bc-eg71-sub"${subActive ? '' : ' hidden'}>${g.children.map(c => {
                const cr = g.route + '/' + slug(c);
                return `<div class="ms-nav-item ms-nav-item--sub${route === cr ? ' ms-nav-item--active' : ''}" data-sub="${esc(c)}" data-route="${esc(cr)}"><span>${esc(c)}</span></div>`;
              }).join('')}</div>`
            : '';
          return `<div class="bc-eg71-nav" data-nav="${esc(g.label)}">
            <div class="ms-nav-item${active ? ' ms-nav-item--active' : ''}" data-nav-trigger data-route="${esc(g.route)}"${has ? ` aria-expanded="${subActive}"` : ''}>${ico(g.icon, 16)}<span>${esc(g.label)}</span>${chevron}</div>
            ${sub}
          </div>`;
        };
        // 账户下拉菜单（trigger=click / placement=topRight）：含危险项 + Language 二级语言子菜单
        const adminItems = [
          { icon: 'user', label: 'Change Account Info' },
          { label: 'Language', children: [{ icon: 'check', label: 'Chinese' }, { label: 'English' }] },
          { type: 'divider' },
          { label: 'Log out', danger: true }
        ];
        const dropdownItem = (it) => {
          if (it.type === 'divider') return `<div class="ms-dropdown-sep"></div>`;
          if (it.children) {
            return `<div class="ms-dropdown-item bc-eg71-lang" data-eg71-lang>
              <span>${esc(it.label)}</span>
              <span class="bc-eg71-chevron">${ico('chevronDown', 14)}</span>
              <div class="ms-dropdown bc-eg71-lang-menu" hidden>
                ${it.children.map((c) => `<div class="ms-dropdown-item">${c.icon ? ico(c.icon, 14) : ''}<span>${esc(c.label)}</span></div>`).join('')}
              </div>
            </div>`;
          }
          return `<div class="ms-dropdown-item${it.danger ? ' ms-dropdown-item--danger' : ''}">${it.icon ? ico(it.icon, 14) : ''}<span>${esc(it.label)}</span></div>`;
        };
        return `<aside class="ms-sidebar bc-eg71-sidenav">
          <div class="ms-sidebar-brand">
            <span class="ms-logo">${window.MS_BASE_LOGO_SVG({ variant: 'full', color: 'white', height: 32 })}</span>
            <button class="ms-btn ms-btn--xs ms-btn--text bc-eg71-collapse" aria-label="收起侧边栏" aria-expanded="true">${ico('arrowLeft', 16)}</button>
          </div>
          <nav class="ms-sidebar-body"><div class="ms-nav">
            ${groups.map(navItem).join('')}
          </div></nav>
          <div class="ms-sidebar-foot">
            <div class="bc-eg71-foot">
              <span class="ms-avatar ms-avatar--lg">${ico('user', 20)}</span>
              <span class="bc-eg71-foot-name">Admin</span>
              <button class="ms-btn ms-btn--xs ms-btn--text bc-eg71-more" aria-label="账户操作菜单" aria-expanded="false">${ico('moreHoriz', 16)}</button>
            </div>
            <div class="ms-dropdown bc-eg71-admin-menu" hidden>
              ${adminItems.map(dropdownItem).join('')}
            </div>
          </div>
        </aside>`;
      },
      bind(root) {
        const rootEl = root.querySelector('.bc-eg71-sidenav') || root;
        // 展开/收起：点击 collapse 按钮切换 is-collapsed，折叠/展开图标随状态互换（arrowLeft ↔ arrowRight）
        const collapseBtn = rootEl.querySelector('.bc-eg71-collapse');
        if (collapseBtn) {
          collapseBtn.addEventListener('click', () => {
            const collapsed = rootEl.classList.toggle('is-collapsed');
            collapseBtn.innerHTML = ico(collapsed ? 'arrowRight' : 'arrowLeft', 16);
            collapseBtn.setAttribute('aria-expanded', String(!collapsed));
            collapseBtn.setAttribute('aria-label', collapsed ? '展开侧边栏' : '收起侧边栏');
            // Logo 完整↔图形切换：收起态仅 M 图形（compact），展开态完整字标（full）
            const logo = rootEl.querySelector('.ms-logo');
            if (logo && window.MS_BASE_LOGO_SVG) {
              logo.innerHTML = window.MS_BASE_LOGO_SVG({ variant: collapsed ? 'compact' : 'full', color: 'white', height: 32 });
            }
          });
        }
        // 一级导航展开/收起：点击切换 open，chevron 旋转，仅展开当前项（accordion）
        rootEl.querySelectorAll('[data-nav]').forEach(nav => {
          const t = nav.querySelector('[data-nav-trigger]');
          const sub = nav.querySelector('.bc-eg71-sub');
          if (!t || !sub) return;
          t.addEventListener('click', () => {
            const willOpen = sub.hidden;
            rootEl.querySelectorAll('.bc-eg71-sub').forEach(s => { s.hidden = true; });
            rootEl.querySelectorAll('[data-nav-trigger]').forEach(x => {
              x.classList.remove('is-open');
              x.setAttribute('aria-expanded', 'false');
            });
            if (willOpen) {
              sub.hidden = false;
              t.classList.add('is-open');
              t.setAttribute('aria-expanded', 'true');
            }
          });
        });
        // 子条目点击 → 设为主选中态
        rootEl.querySelectorAll('.ms-nav-item--sub').forEach(item => {
          item.addEventListener('click', () => {
            rootEl.querySelectorAll('.ms-nav-item--sub').forEach(x => x.classList.remove('ms-nav-item--active'));
            item.classList.add('ms-nav-item--active');
          });
        });
        // Admin 账户下拉：点击 more 开关，点击空白处关闭
        const more = rootEl.querySelector('.bc-eg71-more');
        const adminMenu = rootEl.querySelector('.bc-eg71-admin-menu');
        const toggleAdmin = (open) => {
          if (!more || !adminMenu) return;
          adminMenu.hidden = !open;
          more.classList.toggle('is-open', open);
          more.setAttribute('aria-expanded', String(open));
        };
        if (more && adminMenu) {
          more.addEventListener('click', (e) => { e.stopPropagation(); toggleAdmin(adminMenu.hidden); });
          adminMenu.addEventListener('click', (e) => e.stopPropagation());
        }
        // Language 二级子菜单：点击展开
        const lang = rootEl.querySelector('[data-eg71-lang]');
        const langMenu = rootEl.querySelector('.bc-eg71-lang-menu');
        if (lang && langMenu) {
          lang.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.hidden = !langMenu.hidden;
            lang.classList.toggle('is-open', !langMenu.hidden);
          });
        }
        // 点击侧边栏外任意处关闭账户下拉 + 语言子菜单
        document.addEventListener('click', () => {
          toggleAdmin(false);
          if (langMenu) langMenu.hidden = true;
          if (lang) lang.classList.remove('is-open');
        });
      }
    },
    {
      id: 'bc-eg71-topnav', cn: '顶部导航', cat: '概览',
      desc: 'Milesight 网关管理后台顶部导航（Header）：以路由为单一源，/dashboard 渲染 Dashboard 版（44px 模块图标 + 网关名称 + 序列号复制 + Guide 帮助），其余路由渲染通用版（面包屑 Home > Channel > Users > News chevron 分隔 + 灰底 HostName 胶囊含 16px Medium 名称 + 序列号复制 + 40px 更多按钮），编排 L2 面包屑 / 按钮 / 图标基础组件。',
      atoms: ['breadcrumb', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['顶部导航', 'Header', '面包屑', '网关', 'EG71', '后台', '导航'],
      render(ctx) {
        const e = ctx.entity, r = (ctx.rows || MS_DATA.build(e, 1))[0];
        const route = ctx.route || '/system-setting/general';
        const isDashboard = route === '/dashboard' || route.indexOf('/dashboard/') === 0;
        const cap = s => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

        // 分组 A：Dashboard 导航（/dashboard）——44px 圆形模块图标 + HostName + 序列号复制 + Guide 帮助
        // Figma 2016:88209（V3 只读）/ 2016:88233（Variant5 名称可编辑）两个状态同骨架；间距/字号写死在 business.css 的 .bc-eg71-dash-* 作用域。
        if (isDashboard) {
          return `<header class="ms-header bc-eg71-topnav--dashboard">
            <div class="ms-header-left bc-eg71-dash-left">
              <span class="bc-eg71-dash-logo">${ico('gateway', 24)}</span>
              <div class="bc-eg71-dash-title">
                <span class="bc-eg71-dash-host">${esc(r.name)}</span>
                <span class="bc-eg71-dash-sn">
                  <span class="ms-text bc-eg71-dash-sn-text">${esc(r.sn)}</span>
                  <button class="ms-btn ms-btn--text bc-eg71-dash-copy" aria-label="复制序列号">${ico('copy', 20)}</button>
                </span>
              </div>
            </div>
            <div class="ms-header-right">
              <button class="ms-btn bc-eg71-dash-guide">${ico('question', 16)}Guide</button>
            </div>
          </header>`;
        }

        // 分组 B：通用页导航（非 /dashboard）——面包屑（chevron 分隔，末级不可点）+ 灰底 HostName 胶囊 + 更多按钮
        // Figma 2016:88258（默认）：56px 骨架，左面包屑 Home > Channel > Users > News（chevron 分隔，非末级 auxiliary、末级 primary），
        // 右灰底胶囊（HostName 16px Medium + 序列号 + 复制 20px）+ 40px 更多按钮。间距/字号写死在 business.css 的 .bc-eg71-topnav--general 作用域。
        const segs = route.split('/').filter(Boolean);
        const crumbSep = `<span class="bc-eg71-crumb-sep">${ico('chevronRight', 12)}</span>`;
        // 面包屑从一级侧边导航开始排（无 Home）：route 第一段 → 分组，第二段 → 子项
        const group = U.navGroups.find(g => segs[0] && ('/' + segs[0]) === g.route);
        let crumbs = [];
        if (group) {
          const isGroupOnly = !segs[1];
          crumbs.push(isGroupOnly
            ? `<span class="bc-eg71-crumb-last">${esc(group.label)}</span>`
            : `<a href="${esc(group.route)}">${esc(group.label)}</a>`);
          if (segs[1]) {
            const childLabel = (group.children || []).find(c => U.slug(c) === segs[1]) || cap(segs[1]);
            crumbs.push(`<span class="bc-eg71-crumb-last">${esc(childLabel)}</span>`);
          }
        } else {
          crumbs.push(`<span class="bc-eg71-crumb-last">${esc(cap(segs[segs.length - 1] || 'Home'))}</span>`);
        }
        const breadcrumb = crumbs.join(crumbSep);

        return `<header class="ms-header bc-eg71-topnav--general">
          <div class="ms-header-left">
            <nav class="ms-breadcrumb bc-eg71-general-crumbs">${breadcrumb}</nav>
          </div>
          <div class="ms-header-right bc-eg71-general-right">
            <div class="bc-eg71-general-host">
              <button class="ms-btn ms-btn--text bc-eg71-general-hostname">${esc(r.name)}</button>
              <span class="bc-eg71-general-sn">
                <span class="ms-text bc-eg71-general-sn-text">${esc(r.sn)}</span>
                <button class="ms-btn ms-btn--text bc-eg71-general-copy" aria-label="复制序列号">${ico('copy', 20)}</button>
              </span>
            </div>
            <button class="ms-btn ms-btn--text bc-eg71-general-more" aria-label="更多操作">${ico('moreHoriz', 20)}</button>
          </div>
        </header>`;
      }
    },
    {
      id: 'bc-eg71-form-footer', cn: '表单底部操作栏', cat: '系统设置',
      desc: 'Milesight 网关配置表单底部固定悬浮操作栏：Affix 固钉吸底（offsetBottom=0）+ 左侧弹性占位把 取消/重置/保存 按钮靠右排列（保存为主按钮）；只读模式整体不渲染，弹窗内部表单禁用本栏。',
      atoms: ['affix', 'space', 'button'],
      entityHint: 'gateway',
      tags: ['表单', '操作栏', '底部固定', '固钉', '保存', '取消', '重置', 'EG71'],
      render(ctx) {
        if (ctx.readonly) return '';
        return `<div class="ms-affix ms-affix--fixed ms-affix--bottom">
          <div class="ms-affix-body bc-eg71-formfooter">
            <span class="bc-eg71-formfooter-spacer"></span>
            <div class="ms-space ms-space--12">
              <button class="ms-btn">取消</button>
              <button class="ms-btn">重置</button>
              <button class="ms-btn ms-btn--filled">保存</button>
            </div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-eg71-protocol-card', cn: '协议连接状态卡', cat: '概览',
      desc: 'Milesight 网关 Dashboard 协议连接状态卡：默认 1px 浅灰边框无箭头，hover 边框转主蓝 + 右侧箭头滑入/淡入、整卡可点击跳转对应详情/配置页；多子项协议（RS485/IO/KNX-TP/M-Bus）额外渲染 Tag+名称/数值子项行，子项数值可呈蓝色链接态单独跳转子项详情，点击子项不触发整卡跳转。',
      atoms: ['card', 'icon', 'tag'],
      entityHint: 'gateway',
      tags: ['协议', '连接状态', 'Dashboard', '卡片', 'EG71', 'Cellular', 'WLAN', 'Ethernet', 'LoRaWAN', 'RS485', 'IO', 'KNX', 'M-Bus'],
      render(ctx) {
        const card = ctx.card || {};
        const clickable = card.route ? ' bc-eg71-protocol-card--clickable' : '';
        const routeAttr = card.route ? ` data-route="${esc(card.route)}"` : '';
        const items = Array.isArray(card.items) && card.items.length
          ? `<div class="bc-eg71-protocol-card-items">${card.items.map(it => {
              const subAttr = it.route ? ` data-sub-route="${esc(it.route)}"` : '';
              return `<div class="bc-eg71-protocol-card-item">
                ${it.tag ? `<span class="ms-tag bc-eg71-protocol-card-item-tag">${esc(it.tag)}</span>` : ''}
                <span class="bc-eg71-protocol-card-item-value bc-eg71-protocol-card-item-value--${esc(it.tone || 'plain')}"${subAttr}>${esc(it.label != null ? it.label : it.value)}</span>
              </div>`;
            }).join('')}</div>`
          : (card.value != null ? `<div class="bc-eg71-protocol-card-value bc-eg71-protocol-card-value--${esc(card.tone || 'plain')}">${esc(card.value)}</div>` : '');
        // 结构类统一用 div（不用 <a>）：多子项卡内部另有独立可点击的子项元素，
        // 嵌套 <a> 是非法 HTML（浏览器会拆解重排 DOM），故整卡跳转走 data-route + bind() 委托，
        // 与项目既有 sidenav 的 data-route 导航范式（MS_EG71_SHELL.bind）保持一致。
        return `<div class="ms-card bc-eg71-protocol-card${clickable}"${routeAttr}>
          <span class="bc-eg71-protocol-card-icon">${ico(card.icon || 'device', 24)}</span>
          <span class="bc-eg71-protocol-card-body">
            <span class="bc-eg71-protocol-card-title">${esc(card.title)}</span>
            ${items}
          </span>
          ${card.route ? `<span class="bc-eg71-protocol-card-arrow">${ico('chevronRight', 16)}</span>` : ''}
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelector) ? root : document;
        // 子项：阻止冒泡，避免触发外层整卡的导航；随后以冒泡事件对外通知（props 进 / 事件出）。
        rootEl.querySelectorAll('[data-sub-route]').forEach(el => {
          el.addEventListener('click', e => {
            e.stopPropagation();
            el.dispatchEvent(new CustomEvent('eg71-protocol-navigate', { bubbles: true, detail: { route: el.getAttribute('data-sub-route'), sub: true } }));
          });
        });
        // 整卡：仅当带 data-route 才可点击导航。
        rootEl.querySelectorAll('.bc-eg71-protocol-card[data-route]').forEach(el => {
          el.addEventListener('click', () => {
            el.dispatchEvent(new CustomEvent('eg71-protocol-navigate', { bubbles: true, detail: { route: el.getAttribute('data-route'), sub: false } }));
          });
        });
      }
    },
    {
      id: 'bc-eg71-dashboard', cn: 'Dashboard 卡片墙', cat: '概览',
      desc: 'Milesight 网关 Dashboard 内容区：以 ms-grid-3 编排一组 bc-eg71-protocol-card，展示各协议接口的连接状态，供 MS_EG71_SHELL 在 route=/dashboard 时通过 opts.content 接入。',
      atoms: ['grid', 'card', 'icon', 'tag'],
      entityHint: 'gateway',
      tags: ['Dashboard', '卡片墙', '协议', '概览', 'EG71'],
      render(ctx) {
        const B = window.MS_BIZ_INDEX;
        const cards = ctx.cards || [];
        return `<div class="ms-grid-3 bc-eg71-dashboard">${cards.map(card => B['bc-eg71-protocol-card'].render(Object.assign({}, ctx, { card }))).join('')}</div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelector) ? root : document;
        const B = window.MS_BIZ_INDEX;
        if (typeof B['bc-eg71-protocol-card'].bind === 'function') B['bc-eg71-protocol-card'].bind(rootEl);
      }
    },
    {
      id: 'bc-eg71-content', cn: '内容容器', cat: '系统设置',
      desc: 'Milesight 网关配置页内容容器：一张张 ms-card 区块卡竖排堆叠，每张卡 = 标题行（标题 + 尾部 Switch 开关或 Add/导入按钮组）+ 卡体。表单字段统一引用 bc-eg71-form-item-* 表单业务组件（input / radio-group），Checkbox 多选内嵌子区、可编辑 ms-table + Add 按钮、ms-empty 空态则由基础组件直接编排。',
      atoms: ['card', 'form', 'input', 'select', 'radio', 'checkbox', 'switch', 'button', 'tag', 'table', 'empty'],
      entityHint: 'gateway',
      tags: ['内容容器', '区块卡', '表单', '设置', '网络', '开关', '单选', '多选', '可编辑表格', '空态', 'EG71'],
      render(ctx) {
        const e = ctx.entity, r = (ctx.rows || MS_DATA.build(e, 1))[0];
        const fitem = (id, c) => (window.MS_BIZ_INDEX && window.MS_BIZ_INDEX[id] ? window.MS_BIZ_INDEX[id].render(c) : '');
        const select = opts => `<span class="ms-select"><select>${opts.map(o => `<option${o[1] ? ' selected' : ''}>${esc(o[0])}</option>`).join('')}</select></span>`;
        const head = (title, extra) => `
          <div class="ms-card-head">
            <div class="ms-card-title">${esc(title)}</div>
            ${extra || ''}
          </div>`;
        const sw = on => `<label class="ms-switch"><input type="checkbox"${on ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>`;

        return `<div class="bc-eg71-content">
          <section class="ms-card">
            ${head('Basic Settings', sw(true))}
            <div class="ms-card-body">
              <div class="ms-form">
                <div class="bc-eg71-formgrid">
                  ${fitem('bc-eg71-form-item-input', { label: 'Device Name', required: true, value: r.name, showCount: true, msg: '' })}
                  ${fitem('bc-eg71-form-item-input', { label: 'Host ID', required: false, value: r.sn, msg: '' })}
                  ${fitem('bc-eg71-form-item-input', { label: 'Model', required: false, value: r.model, msg: '' })}
                  ${fitem('bc-eg71-form-item-input', { label: 'Firmware', required: false, value: r.firmware || '1.2.3', msg: '' })}
                </div>
              </div>
            </div>
          </section>

          <section class="ms-card">
            ${head('Network Interface')}
            <div class="ms-card-body">
              <div class="ms-form">
                ${fitem('bc-eg71-form-item-radio-group', { label: 'IP Assignment', required: false, options: ['DHCP', 'Static'], value: 'DHCP', msg: '' })}
                <div class="bc-eg71-formgrid">
                  ${fitem('bc-eg71-form-item-input', { label: 'IP Address', required: false, value: '192.168.1.1', msg: '' })}
                  ${fitem('bc-eg71-form-item-input', { label: 'Netmask', required: false, value: '255.255.255.0', msg: '' })}
                  ${fitem('bc-eg71-form-item-input', { label: 'Gateway', required: false, value: '192.168.1.254', msg: '' })}
                  ${fitem('bc-eg71-form-item-input', { label: 'DNS Server', required: false, value: '8.8.8.8', msg: '' })}
                </div>
              </div>
            </div>
          </section>

          <section class="ms-card">
            ${head('Features')}
            <div class="ms-card-body">
              <div class="bc-eg71-subarea">
                <label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>Enable LoRaWAN</label>
                <label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span>Enable Wi-Fi</label>
                <label class="ms-checkbox"><input type="checkbox" checked><span class="ms-checkbox-box"></span>Enable GPS</label>
              </div>
            </div>
          </section>

          <section class="ms-card">
            ${head('Data Forwarding', `<div class="ms-card-extra"><button class="ms-btn ms-btn--sm">${ico('plus', 14)}Add</button></div>`)}
            <div class="ms-card-body ms-card-body--flush">
              <table class="ms-table">
                <thead><tr><th>Rule</th><th>Protocol</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  <tr>
                    <td>Uplink → MQTT</td>
                    <td>${select([['MQTT', true], ['HTTP', false], ['HTTPS', false]])}</td>
                    <td>${U.statusTag(U.statusOf(e, '在线'))}</td>
                    <td class="ms-table-ops"><button class="ms-btn ms-btn--link">${ico('edit', 14)}</button><button class="ms-btn ms-btn--link ms-btn--danger">${ico('trash', 14)}</button></td>
                  </tr>
                  <tr>
                    <td>Downlink bridge</td>
                    <td>${select([['HTTP', true], ['MQTT', false], ['HTTPS', false]])}</td>
                    <td>${U.statusTag(U.statusOf(e, '离线'))}</td>
                    <td class="ms-table-ops"><button class="ms-btn ms-btn--link">${ico('edit', 14)}</button><button class="ms-btn ms-btn--link ms-btn--danger">${ico('trash', 14)}</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section class="ms-card">
            ${head('Applications')}
            <div class="ms-card-body">
              <div class="ms-empty">
                <svg class="ms-empty-illu" viewBox="0 0 88 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="10" y="12" width="68" height="40" rx="6"/><path d="M10 22h68M22 34h44"/></svg>
                <span class="ms-empty-text">No data</span>
              </div>
            </div>
          </section>
        </div>`;
      }
    },
    {
      id: 'bc-eg71-alarm', cn: '告警事件列表', cat: '系统设置',
      desc: 'Milesight 网关管理后台「System Setting → Events」告警事件页：指标卡组（未处理 / 紧急 / 今日已处理 / 平均响应）+ 筛选栏（关键词 / 级别 / 处理状态 / 时间范围）+ 告警数据表（规则名称 / 级别 / 触发条件 / 触发对象 / 触发时间 / 处理状态，行内 处理·指派·忽略·详情 动作），全部编排 L2 卡片 / 统计 / 输入 / 选择器 / 按钮 / 表格 / 分页 / 标签基础组件；行内「处理 / 忽略」动作在 bind 里把该行处理状态原地切换为「已关闭」。',
      atoms: ['card', 'statistic', 'input', 'select', 'button', 'table', 'checkbox', 'tag', 'pagination', 'icon'],
      entityHint: 'alarm',
      tags: ['告警', '报警', '事件', 'Events', '预警', '规则', '列表', 'EG71', '告警列表'],
      render(ctx) {
        const e = ctx.entity, rows = ctx.rows || MS_DATA.build(e, 6);
        const cols = e.fields;
        const levels = ['紧急', '重要', '提示', '配置变更'];
        const metrics = `<div class="ms-grid-4">${e.metrics.map(m => `
          <div class="ms-card bc-metric">
            <div class="ms-card-body bc-metric-body">
              <div class="ms-stat-title">${esc(m.cn)}</div>
              <div class="ms-stat-value">${esc(m.value)}<span class="ms-stat-suffix">${esc(m.suffix || '')}</span></div>
              <div class="ms-stat-trend ms-stat-trend--${m.dir || 'flat'}">${m.dir === 'down' ? '↓' : (m.dir === 'up' ? '↑' : '—')} ${esc(m.trend || '')}<span class="ms-text--auxiliary ms-text--sm"> 较昨日</span></div>
            </div>
          </div>`).join('')}</div>`;
        const filter = `<div class="ms-card"><div class="ms-card-body ms-card-body--tight">
          <div class="bc-filter">
            <label class="ms-input ms-input--sm bc-filter-search">${ico('search', 14)}<input placeholder="搜索规则名称 / 触发对象"></label>
            <span class="ms-select ms-select--sm bc-filter-select"><select><option>全部级别</option>${levels.map(l => `<option>${esc(l)}</option>`).join('')}</select></span>
            <span class="ms-select ms-select--sm bc-filter-select"><select><option>全部状态</option>${e.statuses.map(s => `<option>${esc(s.cn)}</option>`).join('')}</select></span>
            <span class="bc-filter-date"><label class="ms-input ms-input--sm">${ico('log', 14)}<input value="2026-08-01 ~ 2026-09-04" readonly></label></span>
            <span class="bc-filter-actions">
              <button class="ms-btn ms-btn--sm">${ico('refresh', 14)}重置</button>
              <button class="ms-btn ms-btn--sm ms-btn--filled">${ico('search', 14)}查询</button>
            </span>
          </div></div></div>`;
        const opBtn = a => `<button class="ms-btn ms-btn--link${a === '忽略' ? ' ms-btn--danger' : ''}" data-alarm-op="${esc(a)}">${esc(a)}</button>`;
        const table = `<div class="ms-table-wrap">
          <div class="ms-table-toolbar">
            <div class="ms-table-title">${esc(e.cn)}列表<span class="ms-tag ms-tag--round ms-tag--outline bc-count">共 1,286 条</span></div>
            <div class="ms-space ms-space--8">
              <button class="ms-btn ms-btn--sm ms-btn--dashed">${ico('filter', 14)}列设置</button>
              <button class="ms-btn ms-btn--sm">${ico('download', 14)}导出</button>
              <button class="ms-btn ms-btn--sm ms-btn--filled">${ico('plus', 14)}新增规则</button>
            </div>
          </div>
          <table class="ms-table">
            <thead><tr>
              <th class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span></label></th>
              ${cols.map(c => `<th>${esc(c.cn)}</th>`).join('')}
              <th class="ms-table-ops">操作</th>
            </tr></thead>
            <tbody>${rows.map((r, i) => `<tr${i === 0 ? ' class="ms-table-row--active"' : ''}>
              <td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"${i < 2 ? ' checked' : ''}><span class="ms-checkbox-box"></span></label></td>
              ${cols.map(c => c.type === 'status'
                ? `<td data-col="status">${U.cellHtml(c, r, e)}</td>`
                : `<td${c.type === 'num' || c.type === 'percent' ? ' class="ms-table-num"' : ''}>${U.cellHtml(c, r, e)}</td>`).join('')}
              <td class="ms-table-ops">${e.actions.map(opBtn).join('')}</td>
            </tr>`).join('')}</tbody>
          </table>
          <div class="bc-table-foot">
            <span class="ms-text--secondary ms-text--sm">已选 <b>2</b> 项</span>
            <div class="ms-space ms-space--8">
              <button class="ms-btn ms-btn--sm ms-btn--dashed">批量处理</button>
              <button class="ms-btn ms-btn--sm ms-btn--danger">批量忽略</button>
              <span class="ms-pagination">
                <span class="ms-page-item" disabled>‹</span>
                <span class="ms-page-item ms-page-item--active">1</span>
                <span class="ms-page-item">2</span><span class="ms-page-item">3</span>
                <span class="ms-page-item">…</span><span class="ms-page-item">18</span>
                <span class="ms-page-item">›</span>
                <span class="ms-page-jump">跳至<input value="1">页</span>
              </span>
            </div>
          </div>
        </div>`;
        return `<div class="bc-eg71-content bc-eg71-alarm">${metrics}${filter}${table}</div>`;
      },
      bind(root) {
        const rootEl = root.querySelector('.bc-eg71-alarm') || root;
        const closed = { cn: '已关闭', tone: 'muted' };
        rootEl.querySelectorAll('[data-alarm-op]').forEach(btn => {
          btn.addEventListener('click', () => {
            const op = btn.getAttribute('data-alarm-op');
            if (op !== '处理' && op !== '忽略') return;
            const tr = btn.closest('tr');
            const sc = tr && tr.querySelector('td[data-col="status"]');
            if (sc) sc.innerHTML = U.statusTag(closed);
          });
        });
      }
    },
    {
      id: 'bc-eg71-form-item-input', cn: '表单输入项', cat: '表单',
      desc: 'Milesight 网关配置表单输入项：标签 + 输入框 + 提示文案，支持 normal/error 状态与 0/32 字数统计开关。',
      atoms: ['form', 'input'],
      entityHint: 'gateway',
      tags: ['表单', '输入', '校验', '字数', 'FormItem', '设置', 'EG71'],
      render(ctx) {
        const err = ctx.status === 'error';
        const showCount = !!ctx.showCount;
        const label = ctx.label || 'Label';
        const unit = ctx.unit ? `<span class="bc-eg71-form-item-unit">(${esc(ctx.unit)})</span>` : '';
        const required = ctx.required !== false;
        const msg = ctx.msg != null ? ctx.msg : "Please input passenger's name or delete this field.";
        return `<div class="ms-form-item">
          <div class="bc-eg71-form-item-labelrow">
            <label class="ms-form-label${required ? ' ms-form-label--required' : ''}">${esc(label)}${unit}${ico('info', 16)}</label>
            ${showCount ? '<span class="bc-eg71-form-item-count">0/32</span>' : ''}
          </div>
          <label class="ms-input${err ? ' ms-input--error' : ' ms-input--lg'}"><input value="${esc(ctx.value || '')}" placeholder="${esc(ctx.placeholder || 'Example')}"></label>
          ${msg ? `<div class="bc-eg71-form-item-msg${err ? ' bc-eg71-form-item-msg--error' : ''}">${esc(msg)}</div>` : ''}
        </div>`;
      }
    },
    {
      id: 'bc-eg71-form-item-select', cn: '表单下拉项', cat: '表单',
      desc: 'Milesight 网关配置表单下拉项：标签 + 下拉选择框 + 提示文案，支持 normal/error 状态。',
      atoms: ['form', 'select'],
      entityHint: 'gateway',
      tags: ['表单', '下拉', '选择', '校验', 'FormItem', '设置', 'EG71'],
      render(ctx) {
        const err = ctx.status === 'error';
        const label = ctx.label || 'Label';
        const unit = ctx.unit ? `<span class="bc-eg71-form-item-unit">(${esc(ctx.unit)})</span>` : '';
        const required = ctx.required !== false;
        const msg = ctx.msg != null ? ctx.msg : 'Please select a time zone.';
        const opts = ctx.options || ['Please select'];
        const value = ctx.value;
        return `<div class="ms-form-item">
          <div class="bc-eg71-form-item-labelrow">
            <label class="ms-form-label${required ? ' ms-form-label--required' : ''}">${esc(label)}${unit}${ico('info', 16)}</label>
          </div>
          <span class="ms-select bc-eg71-form-item-select${err ? ' ms-select--error' : ''}">
            <select>${opts.map(o => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>
          </span>
          ${msg ? `<div class="bc-eg71-form-item-msg${err ? ' bc-eg71-form-item-msg--error' : ''}">${esc(msg)}</div>` : ''}
        </div>`;
      }
    },
    {
      id: 'bc-eg71-form-item-input-button', cn: '表单输入按钮项', cat: '表单',
      desc: 'Milesight 网关配置表单「输入 + 按钮」项：下拉框 + 主/次按钮组，用于选择后触发动作。',
      atoms: ['form', 'select', 'button'],
      entityHint: 'gateway',
      tags: ['表单', '下拉', '按钮组', '主次按钮', 'FormItem', '设置', 'EG71'],
      render(ctx) {
        const label = ctx.label || 'Label';
        const unit = ctx.unit ? `<span class="bc-eg71-form-item-unit">(${esc(ctx.unit)})</span>` : '';
        const required = ctx.required !== false;
        const msg = ctx.msg != null ? ctx.msg : 'Supportive text';
        const opts = ctx.options || ['Please select'];
        const value = ctx.value;
        const primary = ctx.primaryLabel || 'Button';
        const secondary = ctx.secondaryLabel || 'Button';
        return `<div class="ms-form-item">
          <div class="bc-eg71-form-item-labelrow">
            <label class="ms-form-label${required ? ' ms-form-label--required' : ''}">${esc(label)}${unit}${ico('info', 16)}</label>
          </div>
          <div class="bc-eg71-form-item-btnrow">
            <span class="ms-select bc-eg71-form-item-select"><select>${opts.map(o => `<option${o === value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
            <span class="ms-btn-group">
              <button class="ms-btn ms-btn--filled ms-btn--lg">${esc(primary)}</button>
              <button class="ms-btn ms-btn--lg">${esc(secondary)}</button>
            </span>
          </div>
          ${msg ? `<div class="bc-eg71-form-item-msg">${esc(msg)}</div>` : ''}
        </div>`;
      }
    },
    {
      id: 'bc-eg71-form-item-date-picker', cn: '表单日期范围项', cat: '表单',
      desc: 'Milesight 网关配置表单日期范围项：标签 + 起始/结束日期选择框，用于时间范围录入。',
      atoms: ['form', 'input', 'date-picker'],
      entityHint: 'gateway',
      tags: ['表单', '日期', '时间', '范围', 'DatePicker', '设置', 'EG71'],
      render(ctx) {
        const label = ctx.label || 'Label';
        const unit = ctx.unit ? `<span class="bc-eg71-form-item-unit">(${esc(ctx.unit)})</span>` : '';
        const required = ctx.required !== false;
        const msg = ctx.msg != null ? ctx.msg : 'Supportive text';
        const startPlaceholder = ctx.startPlaceholder || 'Start date';
        const endPlaceholder = ctx.endPlaceholder || 'End date';
        const startValue = ctx.startValue || '';
        const endValue = ctx.endValue || '';
        return `<div class="ms-form-item">
          <div class="bc-eg71-form-item-labelrow">
            <label class="ms-form-label${required ? ' ms-form-label--required' : ''}">${esc(label)}${unit}${ico('info', 16)}</label>
          </div>
          <span class="ms-datepicker">
            <label class="ms-input ms-input--lg bc-eg71-form-item-range">
              <input placeholder="${esc(startPlaceholder)}" value="${esc(startValue)}">
              ${ico('minus', 16)}
              <input placeholder="${esc(endPlaceholder)}" value="${esc(endValue)}">
              ${ico('calendar', 16)}
            </label>
          </span>
          ${msg ? `<div class="bc-eg71-form-item-msg">${esc(msg)}</div>` : ''}
        </div>`;
      }
    },
    {
      id: 'bc-eg71-form-item-radio-group', cn: '表单单选按钮组', cat: '表单',
      desc: 'Milesight 网关配置表单单选按钮组：标签 + 线框单选按钮组（optionType=button, buttonStyle=outline），用于 2-3 个互斥选项切换。',
      atoms: ['form', 'radio'],
      entityHint: 'gateway',
      tags: ['表单', '单选', '按钮组', 'Radio', 'FormItem', '设置', 'EG71'],
      render(ctx) {
        const label = ctx.label || 'Label';
        const unit = ctx.unit ? `<span class="bc-eg71-form-item-unit">(${esc(ctx.unit)})</span>` : '';
        const required = ctx.required !== false;
        const msg = ctx.msg != null ? ctx.msg : 'Supportive text';
        const opts = ctx.options || ['Option 1', 'Option 2', 'Option 3'];
        const value = ctx.value;
        return `<div class="ms-form-item">
          <div class="bc-eg71-form-item-labelrow">
            <label class="ms-form-label${required ? ' ms-form-label--required' : ''}">${esc(label)}${unit}${ico('info', 16)}</label>
          </div>
          <div class="ms-radio-btn-group bc-eg71-form-item-radio-group" role="radiogroup" aria-label="${esc(label)}">
            ${opts.map((o, i) => {
              const checked = o === value || (value == null && i === 1);
              return `<span class="ms-radio-btn${checked ? ' ms-radio-btn--checked' : ''}" role="radio" aria-checked="${checked}" tabindex="${checked ? '-1' : '0'}">${esc(o)}</span>`;
            }).join('')}
          </div>
          ${msg ? `<div class="bc-eg71-form-item-msg">${esc(msg)}</div>` : ''}
        </div>`;
      }
    },
    {
      id: 'bc-eg71-form-item-button', cn: '表单按钮项', cat: '表单',
      desc: 'Milesight 网关配置表单按钮项：标签 + 主按钮，用于触发单一动作。',
      atoms: ['form', 'button'],
      entityHint: 'gateway',
      tags: ['表单', '按钮', '主按钮', 'FormItem', '设置', 'EG71'],
      render(ctx) {
        const label = ctx.label || 'Label';
        const unit = ctx.unit ? `<span class="bc-eg71-form-item-unit">(${esc(ctx.unit)})</span>` : '';
        const required = ctx.required !== false;
        const msg = ctx.msg != null ? ctx.msg : 'Supportive text';
        const btn = ctx.buttonLabel || 'Button';
        return `<div class="ms-form-item">
          <div class="bc-eg71-form-item-labelrow">
            <label class="ms-form-label${required ? ' ms-form-label--required' : ''}">${esc(label)}${unit}${ico('info', 16)}</label>
          </div>
          <div class="bc-eg71-form-item-btnrow">
            <button class="ms-btn ms-btn--filled ms-btn--lg">${esc(btn)}</button>
          </div>
          ${msg ? `<div class="bc-eg71-form-item-msg">${esc(msg)}</div>` : ''}
        </div>`;
      }
    },
    {
      id: 'bc-eg71-modal', cn: '业务弹窗（删除/禁用/确认/选择）', cat: '反馈',
      desc: 'Milesight 网关业务弹窗调度器：按 ctx.action 做业务匹配，分发到删除确认 / 禁用确认 / 信息确认 / 设备选择四类弹窗规则，触发时居中浮层展示。',
      atoms: ['modal', 'button', 'result', 'input', 'radio'],
      entityHint: 'gateway',
      tags: ['弹窗', 'Modal', '删除确认', '禁用确认', '确认', '选择', 'EG71'],
      render(ctx) { return renderEg71Modal(ctx || {}); },
      bind(root) { bindEg71Modal(root); }
    }
  ];

  /* ---------- EG71 业务弹窗：按 ctx.action 做业务匹配（不同业务 → 不同弹窗规则） ----------
     ctx.action 取值：
       'delete'  删除确认（危险，需二次确认，Result--error 图标，danger 按钮）
       'disable' 禁用/停用确认（警示，Result--warn 图标，filled 按钮）
       'confirm' 信息确认（普通提示，Result--info 图标，filled 按钮）
       'select'  设备选择（信息 + 单选按钮组，用于「选择设备」类场景）
     未命中时兜底为 'confirm'。 */
  function eg71ModalVariant(action) {
    if (action === 'delete') return { status: 'error', size: '', okClass: 'ms-btn--filled ms-btn--danger', okText: '删除' };
    if (action === 'disable') return { status: 'warn', size: '', okClass: 'ms-btn--filled', okText: '禁用' };
    if (action === 'select') return { status: 'info', size: '--lg', okClass: 'ms-btn--filled', okText: '确定' };
    return { status: 'info', size: '', okClass: 'ms-btn--filled', okText: '确定' };
  }

  function eg71ModalBody(ctx, variant) {
    const desc = ctx.desc != null ? ctx.desc : '';
    if (ctx.action === 'select') {
      const options = ctx.options || [];
      const opts = options.map((o, i) => `<button type="button" class="ms-radio-btn${i === 0 ? ' ms-radio-btn--checked' : ''}" role="radio" aria-checked="${i === 0 ? 'true' : 'false'}" data-value="${esc(o.value != null ? o.value : o.label)}">${esc(o.label)}</button>`).join('');
      return `<div class="ms-stack">
        ${desc ? `<div class="ms-text ms-text--secondary">${esc(desc)}</div>` : ''}
        <div class="ms-radio-btn-group bc-eg71-form-item-radio-group" role="radiogroup" aria-label="${esc(ctx.optionLabel || '设备')}">${opts}</div>
      </div>`;
    }
    if (ctx.action === 'delete' && ctx.confirmKeyword) {
      return `<div class="ms-stack">
        ${desc ? `<div class="ms-text ms-text--secondary">${esc(desc)}</div>` : ''}
        <div class="ms-alert ms-alert--error">${ico('warn', 16)}<div class="ms-alert-body">${esc(ctx.warnText || '此操作不可撤销，请谨慎确认。')}</div></div>
        <div class="ms-form-item">
          <label class="ms-form-label">请输入「${esc(ctx.confirmKeyword)}」以确认</label>
          <input class="ms-input bc-eg71-modal-confirm-input" type="text" placeholder="${esc(ctx.confirmKeyword)}" data-keyword="${esc(ctx.confirmKeyword)}" />
        </div>
      </div>`;
    }
    return desc ? `<div class="ms-text ms-text--secondary">${esc(desc)}</div>` : '';
  }

  function renderEg71Modal(ctx) {
    const variant = eg71ModalVariant(ctx.action);
    const title = ctx.title || (ctx.action === 'delete' ? '删除确认' : ctx.action === 'disable' ? '禁用确认' : ctx.action === 'select' ? '选择设备' : '操作确认');
    const cancelText = ctx.cancelText || '取消';
    const okText = ctx.okText || variant.okText;
    const needKeyword = ctx.action === 'delete' && ctx.confirmKeyword;
    return `<div class="bc-eg71-modal" hidden>
      <div class="ms-mask">
        <div class="ms-modal${variant.size ? ' ms-modal' + variant.size : ''}" role="dialog" aria-modal="true" aria-labelledby="bc-eg71-modal-title">
          <div class="ms-modal-head">
            <span class="ms-modal-title" id="bc-eg71-modal-title">${esc(title)}</span>
            <span class="ms-modal-close" data-modal-close aria-label="关闭">${ico('close', 16)}</span>
          </div>
          <div class="ms-modal-body">
            <div class="bc-eg71-modal-body-row">
              <span class="ms-result-icon ms-result-icon--${variant.status}">${ico(variant.status === 'error' ? 'trash' : variant.status === 'warn' ? 'warn' : 'info', 24)}</span>
              <div class="bc-eg71-modal-body-content">${eg71ModalBody(ctx, variant)}</div>
            </div>
          </div>
          <div class="ms-modal-foot">
            <button type="button" class="ms-btn" data-modal-cancel>${esc(cancelText)}</button>
            <button type="button" class="ms-btn ${variant.okClass}" data-modal-ok${needKeyword ? ' disabled' : ''}>${esc(okText)}</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function bindEg71Modal(root) {
    const scope = (root && root.querySelector && root.querySelector('.bc-eg71-modal')) || root;
    if (!scope) return;
    const wrap = scope.classList && scope.classList.contains('bc-eg71-modal') ? scope : scope.querySelector('.bc-eg71-modal');
    if (!wrap) return;
    const open = () => { wrap.hidden = false; wrap.classList.add('is-open'); };
    const close = () => { wrap.hidden = true; wrap.classList.remove('is-open'); };
    const okBtn = wrap.querySelector('[data-modal-ok]');
    const keywordInput = wrap.querySelector('.bc-eg71-modal-confirm-input');
    if (keywordInput && okBtn) {
      keywordInput.addEventListener('input', () => {
        okBtn.disabled = keywordInput.value !== keywordInput.dataset.keyword;
      });
    }
    wrap.querySelectorAll('.ms-radio-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        wrap.querySelectorAll('.ms-radio-btn').forEach(b => { b.classList.remove('ms-radio-btn--checked'); b.setAttribute('aria-checked', 'false'); });
        btn.classList.add('ms-radio-btn--checked');
        btn.setAttribute('aria-checked', 'true');
      });
    });
    wrap.querySelector('.ms-mask').addEventListener('click', e => { if (e.target === wrap.querySelector('.ms-mask')) close(); });
    wrap.querySelector('.ms-modal').addEventListener('click', e => e.stopPropagation());
    const closeBtn = wrap.querySelector('[data-modal-close]');
    const cancelBtn = wrap.querySelector('[data-modal-cancel]');
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (cancelBtn) cancelBtn.addEventListener('click', close);
    if (okBtn) okBtn.addEventListener('click', () => { close(); });
    const triggers = (root.querySelectorAll ? root.querySelectorAll('[data-modal-trigger="bc-eg71-modal"]') : []);
    triggers.forEach(t => t.addEventListener('click', open));
    wrap.open = open;
    wrap.close = close;
  }

  /* ---------- EG71 侧-导航栏双重结构（L5 页面模板 · 捆绑） ----------
     规则：路由是唯一源。侧边栏（bc-eg71-sidenav）+ 顶栏（bc-eg71-topnav）捆绑为
     双重结构：每次侧边栏点击 → 读 data-route → 以新路由同源重渲染顶栏并同步侧边栏
     选中态。顶栏只在「Dashboard」与「通用面包屑」两种形态间切换（其余路由都走通用版）。
     调用方式（EG71 需求直接调双重结构，不再手动拼侧栏/顶栏）：
       const html = window.MS_EG71_SHELL.render(ctx);
       app.innerHTML = html;
       window.MS_EG71_SHELL.bind(app); */
  window.MS_EG71_SHELL = (function () {
    const BIZ = () => window.MS_BIZ_INDEX;
    let ctx = null, opts = {};

    function render(c, o) {
      ctx = Object.assign({}, c || {});
      ctx.route = ctx.route || '/dashboard';
      opts = o || {};
      const B = BIZ();
      const content = opts.content !== undefined ? opts.content
        : (B['bc-eg71-content'] ? B['bc-eg71-content'].render(ctx) : '');
      const footer = opts.footer !== undefined ? opts.footer
        : (B['bc-eg71-form-footer'] ? B['bc-eg71-form-footer'].render(ctx) : '');
      return '<div class="ms-shell">'
        + B['bc-eg71-sidenav'].render(ctx)
        + '<div class="ms-main">'
        + B['bc-eg71-topnav'].render(ctx)
        + '<div class="ms-content">' + content + '</div>'
        + '</div>'
        + footer
        + '</div>';
    }

    // 路由切换：只换顶栏 .ms-header，再原地同步侧边栏选中态（不重渲染、不重 bind）
    function navigate(route, root) {
      if (!route || route === ctx.route) return;
      ctx = Object.assign({}, ctx, { route });
      const rootEl = (root && root.querySelector) ? root : document.getElementById('app');
      const main = rootEl && rootEl.querySelector('.ms-main');
      const header = main && main.querySelector('.ms-header');
      const html = BIZ()['bc-eg71-topnav'].render(ctx);
      if (header) header.outerHTML = html;
      else if (main) main.insertAdjacentHTML('afterbegin', html);
      syncSidebar(rootEl, route);
    }

    // 侧边栏选中态：一级项前缀匹配（Dashboard 直达 /dashboard），子项精确匹配，路由所属分组展开
    function syncSidebar(rootEl, route) {
      const side = (rootEl && rootEl.querySelector('.bc-eg71-sidenav')) || rootEl;
      if (!side) return;
      side.querySelectorAll('[data-nav-trigger]').forEach(t => {
        const r = t.getAttribute('data-route');
        const active = route === r || route.indexOf(r + '/') === 0;
        t.classList.toggle('ms-nav-item--active', active);
      });
      side.querySelectorAll('.ms-nav-item--sub').forEach(s => {
        s.classList.toggle('ms-nav-item--active', s.getAttribute('data-route') === route);
      });
      side.querySelectorAll('[data-nav]').forEach(nav => {
        const t = nav.querySelector('[data-nav-trigger]');
        const sub = nav.querySelector('.bc-eg71-sub');
        if (!t || !sub) return;
        const r = t.getAttribute('data-route');
        const inGroup = route === r || route.indexOf(r + '/') === 0;
        sub.hidden = !inGroup;
        t.classList.toggle('is-open', inGroup);
        t.setAttribute('aria-expanded', String(inGroup));
      });
    }

    function bind(root) {
      const B = BIZ();
      const rootEl = (root && root.querySelector) ? root : document.getElementById('app');
      if (!rootEl) return;
      // 1) 侧边栏自身交互（手风琴 + Admin 账户下拉 + 语言子菜单）
      if (typeof B['bc-eg71-sidenav'].bind === 'function') B['bc-eg71-sidenav'].bind(rootEl);
      // 2) 双重结构捆绑：侧边栏点击 [data-route] → 路由导航 → 顶栏切换 + 选中态同步
      const side = rootEl.querySelector('.bc-eg71-sidenav') || rootEl;
      side.addEventListener('click', (e) => {
        const t = e.target && e.target.closest ? e.target.closest('[data-route]') : null;
        if (!t) return;
        const nav = t.closest('.bc-eg71-nav');
        // 仅「叶子导航」触发路由切换：无子菜单的一级项（Dashboard）或 .ms-nav-item--sub。
        // 带子菜单的一级项（Data Services / Network / …）点击只做手风琴展开，不导航。
        const isLeafTrigger = nav && !nav.querySelector('.bc-eg71-sub');
        const isSub = t.classList.contains('ms-nav-item--sub');
        if (isLeafTrigger || isSub) navigate(t.getAttribute('data-route'), rootEl);
      });
    }

    return { render, navigate, bind, get route() { return ctx && ctx.route; } };
  })();

  window.MS_BIZ_INDEX = Object.fromEntries(window.MS_BIZ_COMPONENTS.map(c => [c.id, c]));
})();
