/* ==========================================================================
   L3 · 业务组件层 (Business Components)
   --------------------------------------------------------------------------
   铁律：业务组件不得自己写样式常量，只能
        ① 组合 L2 基础组件（ms-* 类），
        ② 引用 L1 设计令牌，
        ③ 使用本文件顶部的结构类（bc-*，定义在 library/business.css）。
   每个组件显式声明 atoms（所依赖的基础组件），learner 依此学习「搭建逻辑」。

   间距/尺寸红线同步（权威源 .claude/rules/spacing.md §7）：
   本文件存在存量偏差，源头保留不动，A4 生成 demo 内联时按红线就地修正：
     · ico(*, 14) ×41          → 图标下限 16px，内联时改 ico(*, 16)
     · 按钮组 ms-space--8 ×11  → 按钮间 ≥12px，内联时改 ms-space--12
                                （标签组等非交互场景的 --8 保留）
   新增组件不得再引入偏差；源头升级后同步删除 spacing.md §7 清单行。
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
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
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
        const embedded = !!ctx.embedded; // 卡片内嵌形态：无工具栏/复选列/表尾，首行不高亮
        return `<div class="ms-table-wrap">
          ${embedded ? '' : `<div class="ms-table-toolbar">
            <div class="ms-table-title">${esc(e.cn)}列表<span class="ms-tag ms-tag--round ms-tag--outline bc-count">${rows.length * 214}</span></div>
            <div class="ms-space ms-space--8">
              <button class="ms-btn ms-btn--sm ms-btn--dashed">${ico('filter', 14)}列设置</button>
              <button class="ms-btn ms-btn--sm">${ico('download', 14)}导出</button>
              <button class="ms-btn ms-btn--sm ms-btn--filled">${ico('plus', 14)}新增${esc(e.cn)}</button>
            </div>
          </div>`}
          <table class="ms-table">
            <thead><tr>
              ${embedded ? '' : `<th class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"><span class="ms-checkbox-box"></span></label></th>`}
              ${cols.map(c => `<th${c.type === 'num' || c.type === 'percent' ? ' class="ms-table-num"' : ''}>${esc(c.cn)}</th>`).join('')}
              <th class="ms-table-ops">操作</th>
            </tr></thead>
            <tbody>${rows.map((r, i) => `<tr${!embedded && i === 0 ? ' class="ms-table-row--active"' : ''}>
              ${embedded ? '' : `<td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"${i < 2 ? ' checked' : ''}><span class="ms-checkbox-box"></span></label></td>`}
              ${cols.map(c => `<td${c.type === 'num' || c.type === 'percent' ? ' class="ms-table-num"' : ''}>${U.cellHtml(c, r, e)}</td>`).join('')}
              <td class="ms-table-ops">${ops.map((a, k) => `<button class="ms-btn ms-btn--link${k === ops.length - 1 ? ' ms-btn--danger' : ''}">${esc(a)}</button>`).join('')}</td>
            </tr>`).join('')}</tbody>
          </table>
          ${(ctx.plain || embedded) ? '' : `<div class="bc-table-foot">
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
        // 子条目 HTML 抽公用：展开态内联 .bc-eg71-sub 与收起态浮窗 .bc-eg71-popup 共用同一份，避免重复维护高亮判定
        const renderChildren = (g) => g.children.map(c => {
          const cr = g.route + '/' + slug(c);
          return `<div class="ms-nav-item ms-nav-item--sub${route === cr ? ' ms-nav-item--active' : ''}" data-sub="${esc(c)}" data-route="${esc(cr)}"><span>${esc(c)}</span></div>`;
        }).join('');
        const navItem = (g) => {
          const has = g.children && g.children.length;
          const active = route === g.route || route.indexOf(g.route + '/') === 0;
          const subActive = has && route.indexOf(g.route + '/') === 0;
          const chevron = has ? `<span class="bc-eg71-chevron">${ico('chevronDown', 16)}</span>` : '';
          const sub = has ? `<div class="bc-eg71-sub"${subActive ? '' : ' hidden'}>${renderChildren(g)}</div>` : '';
          return `<div class="bc-eg71-nav" data-nav="${esc(g.label)}">
            <div class="ms-nav-item${active ? ' ms-nav-item--active' : ''}" data-nav-trigger data-route="${esc(g.route)}"${has ? ` aria-expanded="${subActive}" aria-haspopup="menu"` : ''}>${ico(g.icon, 16)}<span>${esc(g.label)}</span>${chevron}</div>
            ${sub}
          </div>`;
        };
        // 收起态（80px icon-only）容不下 .bc-eg71-sub 文字，点击一级分组改弹浮窗；挂在 .bc-eg71-sidenav 下（非导航区内），
        // 避免被 .ms-sidebar-body 的 overflow 裁切（同类坑见 admin-sidebar skill 变更历史 2026-09-08 补的记录）
        const popups = groups.filter(g => g.children && g.children.length).map(g =>
          `<div class="bc-eg71-popup" data-popup="${esc(g.route)}" role="menu" hidden>
            <div class="bc-eg71-popup-title">${esc(g.label)}</div>
            ${renderChildren(g)}
          </div>`
        ).join('');
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
          ${popups}
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
            // 展开回来时收起态浮窗不再适用，全部收掉
            if (!collapsed) closeAllPopups();
          });
        }
        // 收起态浮窗：全部关闭 + 触发按钮 is-open/aria-expanded 复位
        const closeAllPopups = () => {
          rootEl.querySelectorAll('.bc-eg71-popup').forEach(p => { p.hidden = true; });
          rootEl.querySelectorAll('[data-nav-trigger][aria-haspopup]').forEach(x => {
            x.classList.remove('is-open');
            x.setAttribute('aria-expanded', 'false');
          });
        };
        // 一级导航展开/收起：展开态走内联 accordion（chevron 旋转，仅展开当前项）；
        // 收起态（is-collapsed，80px icon-only）改弹浮窗，定位用 getBoundingClientRect 贴在触发项右侧，
        // 不受 .ms-sidebar-body{overflow:auto} 裁切影响（浮窗挂在 .bc-eg71-sidenav 下，非导航滚动区内）
        rootEl.querySelectorAll('[data-nav]').forEach(nav => {
          const t = nav.querySelector('[data-nav-trigger]');
          const sub = nav.querySelector('.bc-eg71-sub');
          if (!t || !sub) return;
          const route = t.getAttribute('data-route');
          const popup = rootEl.querySelector(`.bc-eg71-popup[data-popup="${route}"]`);
          t.addEventListener('click', (e) => {
            if (rootEl.classList.contains('is-collapsed')) {
              if (!popup) return;
              e.stopPropagation(); // 阻止冒泡到 document 的 closeAllPopups，否则刚打开就被同一次点击关掉
              const willOpen = popup.hidden;
              closeAllPopups();
              if (willOpen) {
                const r = t.getBoundingClientRect();
                const railRight = rootEl.getBoundingClientRect().right; // 用侧边栏容器右缘而非触发项右缘：触发项内边距使其右缘落在 80px 收起轨内侧，会导致浮窗与轨道重叠
                popup.style.top = r.top + 'px';
                popup.style.left = (railRight + 8) + 'px'; // 侧边栏右侧 8px 间距，position:fixed 相对视口定位
                popup.hidden = false;
                t.classList.add('is-open');
                t.setAttribute('aria-expanded', 'true');
              }
              return;
            }
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
        // 点击浮窗内子条目 / 侧边栏外任意处 → 关闭浮窗；不 stopPropagation，让点击继续冒泡到
        // MS_EG71_SHELL 挂在 .bc-eg71-sidenav 上的路由监听（触发 navigate），关闭与导航互不影响
        document.addEventListener('click', () => closeAllPopups());
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
      desc: 'Milesight 网关配置表单底部固定悬浮操作栏：Affix 固钉吸底（offsetBottom=0）+ 左侧弹性占位把按钮组靠右排列。默认渲染 取消/重置/保存（保存为主按钮）；v1.1.0 起支持 ctx.buttons 自定义按钮组（label/kind/disabled/action）。只读模式整体不渲染，弹窗内部表单禁用本栏。点击以 eg71-footer-action {action, label, index} 冒泡（默认组 action = cancel/reset/save）。',
      atoms: ['affix', 'space', 'button'],
      entityHint: 'gateway',
      tags: ['表单', '操作栏', '底部固定', '固钉', '保存', '取消', '重置', '自定义按钮', 'EG71'],
      render(ctx) {
        if (ctx.readonly) return '';
        const KIND_CLS = { filled: 'ms-btn--filled', danger: 'ms-btn--danger', dashed: 'ms-btn--dashed' };
        const custom = Array.isArray(ctx.buttons) ? ctx.buttons : null;
        const buttons = custom && custom.length
          ? custom.map((b, i) => `<button type="button" class="ms-btn${b.kind && KIND_CLS[b.kind] ? ' ' + KIND_CLS[b.kind] : ''}" data-footer-btn="${esc(b.action || '')}" data-footer-index="${i}"${b.disabled ? ' disabled' : ''}>${esc(b.label)}</button>`).join('')
          : `<button type="button" class="ms-btn" data-footer-btn="cancel" data-footer-index="0">取消</button>
             <button type="button" class="ms-btn" data-footer-btn="reset" data-footer-index="1">重置</button>
             <button type="button" class="ms-btn ms-btn--filled" data-footer-btn="save" data-footer-index="2">保存</button>`;
        return `<div class="ms-affix ms-affix--fixed ms-affix--bottom">
          <div class="ms-affix-body bc-eg71-formfooter">
            <span class="bc-eg71-formfooter-spacer"></span>
            <div class="ms-space ms-space--12">${buttons}</div>
          </div>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('.bc-eg71-formfooter [data-footer-btn]').forEach(b => {
          b.addEventListener('click', () => {
            b.dispatchEvent(new CustomEvent('eg71-footer-action', { bubbles: true, detail: { action: b.getAttribute('data-footer-btn') || '', label: b.textContent.trim(), index: Number(b.getAttribute('data-footer-index')) || 0 } }));
          });
        });
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
      desc: 'Milesight 网关配置页内容容器：一张张 ms-card 区块卡竖排堆叠，每张卡 = 标题行（标题 + 尾部 Switch 开关或 Add/导入按钮组）+ 卡体。表单字段统一引用 bc-eg71-form-item-* 表单业务组件（input / radio-group）；Checkbox 多选内嵌子区、ms-empty 空态由基础组件直接编排；Data Forwarding 表格调用 bc-data-table 业务组件（embedded 内嵌形态）。',
      atoms: ['card', 'form', 'input', 'radio', 'checkbox', 'switch', 'button', 'empty'],
      entityHint: 'gateway',
      tags: ['内容容器', '区块卡', '表单', '设置', '网络', '开关', '单选', '多选', '可编辑表格', '空态', 'EG71'],
      render(ctx) {
        const e = ctx.entity, r = (ctx.rows || MS_DATA.build(e, 1))[0];
        const fitem = (id, c) => (window.MS_BIZ_INDEX && window.MS_BIZ_INDEX[id] ? window.MS_BIZ_INDEX[id].render(c) : '');
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
              ${fitem('bc-data-table', {
                entity: {
                  cn: 'Data Forwarding',
                  fields: [
                    { key: 'rule', cn: 'Rule' },
                    { key: 'protocol', cn: 'Protocol', type: 'code' },
                    { key: 'status', cn: 'Status', type: 'status' }
                  ],
                  actions: ['Edit', 'Delete'],
                  statuses: e.statuses
                },
                rows: [
                  { rule: 'Uplink → MQTT', protocol: 'MQTT', status: '在线' },
                  { rule: 'Downlink bridge', protocol: 'HTTP', status: '离线' }
                ],
                embedded: true
              })}
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
              <th class="bc-eg71-table-ops">操作</th>
            </tr></thead>
            <tbody>${rows.map((r, i) => `<tr${i === 0 ? ' class="ms-table-row--active"' : ''}>
              <td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox"${i < 2 ? ' checked' : ''}><span class="ms-checkbox-box"></span></label></td>
              ${cols.map(c => c.type === 'status'
                ? `<td data-col="status">${U.cellHtml(c, r, e)}</td>`
                : `<td${c.type === 'num' || c.type === 'percent' ? ' class="bc-num"' : ''}>${U.cellHtml(c, r, e)}</td>`).join('')}
              <td class="bc-eg71-table-ops">${e.actions.map(opBtn).join('')}</td>
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
      id: 'bc-eg71-device-list', cn: '设备列表', cat: '数据服务',
      desc: 'Milesight 网关「Data Services → Data Acquisition → Device」设备列表：工具栏（Manually Add 主按钮 / Scan Add / Batch Add / Delete 危险钮随勾选启停）+ 设备表（复选列 + Identifier / Name / Model / Protocol Type / Signal / Last updated / Status / Number of objects，行内 Edit·Monitor·Delete）+ 信号列 hover 气泡（SF / SNR / RSSI）+ 表尾（刷新 + Total + 已选计数 + 分页跳转）；空态保留表头、表体替换 Empty；行删除 / 批量删除复用 bc-eg71-modal 删除确认弹窗。v1.1.0（REQ-012）：状态新增「入网失败 Join failed」（error 态），failReason = key_error / no_join_accept 时状态右侧渲染问号图标，hover 气泡展示失败原因（密钥错误 / 节点未收到入网应答包）。',
      atoms: ['button', 'table', 'checkbox', 'tag', 'icon', 'pagination', 'empty', 'modal'],
      entityHint: 'gateway',
      tags: ['设备', 'Device', '设备数采', 'Data Acquisition', '数据服务', '列表', '信号', 'Signal', '空态', '删除确认', '批量删除', '入网失败', 'Join failed', '失败原因', 'EG71'],
      render(ctx) {
        const rows = ctx.rows || [
          { id: '3423', name: 'WT201', model: 'WT201', protocol: 'Modbus TCP', network: 'Modbus TCP12', signal: { level: 'good', tip: ['SF:7', 'SNR: -199dB', 'RSSI: -188dBm'] }, updated: '2024-12-23 09:34', status: 'Online', objects: 11 },
          { id: '3424', name: 'WT201', model: 'WT201', protocol: 'Modbus RTU', network: 'RTU23', signal: null, updated: '', status: 'Offline', objects: 11 },
          { id: '3425', name: 'AM319', model: 'AM319', protocol: 'LoRaWAN', network: '', signal: { level: 'good', tip: ['SF:9', 'SNR: -97dB', 'RSSI: -108dBm'] }, updated: '2024-12-23 09:30', status: 'Online', objects: 34 },
          { id: '3426', name: 'EM500-PT100', model: 'EM500-PT100', protocol: 'Modbus TCP', network: 'DO Name', signal: { level: 'medium', tip: ['SF:10', 'SNR: -121dB', 'RSSI: -120dBm'] }, updated: '2024-12-23 09:28', status: 'Online', objects: 232 },
          { id: '3427', name: 'WS202', model: 'WS202', protocol: 'LoRaWAN', network: '', signal: { level: 'poor', tip: ['SF:11', 'SNR: -156dB', 'RSSI: -188dBm'] }, updated: '', status: 'Not activated', objects: 343 },
          { id: '3428', name: 'UC50x', model: 'UC50x', protocol: 'KNX/TP', network: 'KNX Line 1', signal: null, updated: '2024-12-22 17:02', status: 'Online', objects: 8 }
        ];
        const cols = ['Identifier', 'Name', 'Model', 'Protocol Type', 'Signal', 'Last updated', 'Status', 'Number of objects'];
        const FILTERED = ['Signal', 'Status'];
        const STATUS = {
          'Online': { cn: 'Online', tone: 'success' },
          'Offline': { cn: 'Offline', tone: 'muted' },
          'Not activated': { cn: 'Not activated', tone: 'warm' },
          'Join failed': { cn: 'Join failed', tone: 'error' }
        };
        // REQ-012 §6.2：失败原因仅作状态右侧提示注记，不做成独立状态
        const FAIL_REASON = { key_error: '密钥错误', no_join_accept: '节点未收到入网应答包' };
        const SIGNAL_BARS = { good: 4, medium: 3, poor: 2 };
        const signalHtml = s => {
          if (!s) return '<span class="ms-text">—</span>';
          const on = SIGNAL_BARS[s.level] || 4;
          const bars = [1, 2, 3, 4].map(n => `<i class="bc-eg71-signal-bar${n <= on ? ' bc-eg71-signal-bar--' + esc(s.level) : ''}"></i>`).join('');
          const tip = (s.tip || []).map(t => `<span class="ms-text--secondary ms-text--sm">${esc(t)}</span>`).join('');
          return `<span class="bc-eg71-signal-cell"><span class="bc-eg71-signal">${bars}</span>${tip ? `<span class="bc-eg71-signal-tip" hidden>${tip}</span>` : ''}</span>`;
        };
        const OPS = [['edit', 'edit', 'Edit'], ['monitor', 'chart', 'Monitor'], ['delete', 'trash', 'Delete']];
        const opsHtml = OPS.map(o => `<button type="button" class="ms-btn ms-btn--sm${o[0] === 'delete' ? ' ms-btn--danger' : ''}" data-device-op="${o[0]}" aria-label="${o[2]}" title="${o[2]}">${ico(o[1], 14)}</button>`).join('');
        const toolbar = `<div class="ms-space ms-space--8">
          <button type="button" class="ms-btn ms-btn--sm ms-btn--filled" data-device-add="manual">${ico('plus', 14)}Manually Add</button>
          <button type="button" class="ms-btn ms-btn--sm" data-device-add="scan">${ico('search', 14)}Scan Add</button>
          <button type="button" class="ms-btn ms-btn--sm" data-device-add="batch">${ico('download', 14)}Batch Add</button>
          <button type="button" class="ms-btn ms-btn--sm ms-btn--danger" data-device-batch-delete disabled>${ico('trash', 14)}Delete</button>
        </div>`;
        const empty = ctx.state === 'empty';
        const total = ctx.total != null ? ctx.total : 312;
        const body = empty
          ? `<tbody><tr><td colspan="${cols.length + 2}"><div class="ms-empty"><span class="ms-empty-illu">${ico('device', 32)}</span><div class="ms-empty-text">No data, please add a device first</div></div></td></tr></tbody>`
          : `<tbody>${rows.map(r => `<tr>
              <td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox" data-device-check><span class="ms-checkbox-box"></span></label></td>
              <td><span class="ms-text">${esc(r.id)}</span></td>
              <td><span class="ms-text">${esc(r.name)}</span></td>
              <td><span class="ms-text">${esc(r.model)}</span></td>
              <td><span class="ms-text">${esc(r.protocol)}${r.network ? `<span class="ms-text--auxiliary"> / ${esc(r.network)}</span>` : ''}</span></td>
              <td>${signalHtml(r.signal)}</td>
              <td><span class="ms-text">${r.updated ? esc(r.updated) : '—'}</span></td>
              <td>${U.statusTag(STATUS[r.status] || STATUS.Online)}${r.status === 'Join failed' || r.failReason ? `<span class="bc-eg71-fail-tipwrap">${ico('question', 16)}<span class="bc-eg71-fail-tip" hidden>${esc(FAIL_REASON[r.failReason] || (r.failReasonText != null ? r.failReasonText : '密钥错误'))}</span></span>` : ''}</td>
              <td class="bc-num">${esc(r.objects)}</td>
              <td class="bc-eg71-table-ops">${opsHtml}</td>
            </tr>`).join('')}</tbody>`;
        const foot = `<div class="bc-table-foot">
          <span class="ms-text ms-text--secondary ms-text--sm">${ico('refresh', 14)} Total:${esc(total)}</span>
          <span class="ms-text ms-text--secondary ms-text--sm bc-eg71-device-selected" hidden>Selected <b>0</b> items</span>
          <div class="ms-space ms-space--8">
            <span class="ms-pagination">
              <span class="ms-page-item" disabled>‹</span>
              <span class="ms-page-item ms-page-item--active">1</span>
              <span class="ms-page-item">2</span><span class="ms-page-item">3</span><span class="ms-page-item">4</span><span class="ms-page-item">5</span>
              <span class="ms-page-item">…</span><span class="ms-page-item">20</span>
              <span class="ms-page-item">›</span>
              <span class="ms-select ms-select--sm"><select><option>10 / page</option><option>20 / page</option><option>50 / page</option></select></span>
              <span class="ms-page-jump">Go to<input value="2">page</span>
            </span>
          </div>
        </div>`;
        const modalHtml = window.MS_BIZ_INDEX && window.MS_BIZ_INDEX['bc-eg71-modal']
          ? window.MS_BIZ_INDEX['bc-eg71-modal'].render({ action: 'delete', title: 'Delete Device', desc: 'Are you sure you want to delete this device? This operation cannot be undone.', okText: 'Delete' })
          : '';
        return `<div class="bc-eg71-device-list">${toolbar}
          <div class="ms-table-wrap">
            <table class="ms-table">
              <thead><tr>
                <th class="bc-col-check"><label class="ms-checkbox"><input type="checkbox" data-device-check-all><span class="ms-checkbox-box"></span></label></th>
                ${cols.map(c => `<th>${FILTERED.indexOf(c) >= 0 ? `<span class="bc-eg71-th-filter">${esc(c)}${ico('filter', 14)}</span>` : esc(c)}</th>`).join('')}
                <th class="bc-eg71-table-ops">Operation</th>
              </tr></thead>
              ${body}
            </table>
          </div>
          ${foot}${modalHtml}
        </div>`;
      },
      bind(root) {
        const rootEl = root.querySelector('.bc-eg71-device-list') || root;
        const modal = rootEl.querySelector('.bc-eg71-modal');
        const modalDesc = modal ? modal.querySelector('.bc-eg71-modal-body-content .ms-text--secondary') : null;
        const batchBtn = rootEl.querySelector('[data-device-batch-delete]');
        const selectedInfo = rootEl.querySelector('.bc-eg71-device-selected');
        let pendingRows = [];
        const sync = () => {
          const checks = Array.prototype.slice.call(rootEl.querySelectorAll('[data-device-check]'));
          const checked = checks.filter(c => c.checked);
          if (batchBtn) batchBtn.disabled = checked.length === 0;
          if (selectedInfo) {
            selectedInfo.hidden = checked.length === 0;
            const b = selectedInfo.querySelector('b');
            if (b) b.textContent = checked.length;
          }
          const all = rootEl.querySelector('[data-device-check-all]');
          if (all) {
            all.checked = checks.length > 0 && checked.length === checks.length;
            all.indeterminate = checked.length > 0 && checked.length < checks.length;
          }
        };
        rootEl.querySelectorAll('[data-device-check]').forEach(c => c.addEventListener('change', sync));
        const all = rootEl.querySelector('[data-device-check-all]');
        if (all) all.addEventListener('change', () => {
          rootEl.querySelectorAll('[data-device-check]').forEach(c => { c.checked = all.checked; });
          sync();
        });
        const openModal = desc => {
          if (!modal) return;
          if (modalDesc) modalDesc.textContent = desc;
          pendingRows = [];
          modal.hidden = false;
          modal.classList.add('is-open');
        };
        const closeModal = () => {
          if (!modal) return;
          modal.hidden = true;
          modal.classList.remove('is-open');
        };
        rootEl.querySelectorAll('[data-device-op="delete"]').forEach(btn => {
          btn.addEventListener('click', () => {
            const tr = btn.closest('tr');
            const nameTd = tr ? tr.querySelector('td:nth-child(3) .ms-text') : null;
            pendingRows = tr ? [tr] : [];
            openModal(nameTd ? `Are you sure you want to delete "${nameTd.textContent.trim()}"? This operation cannot be undone.` : 'Are you sure you want to delete this device? This operation cannot be undone.');
          });
        });
        if (batchBtn) batchBtn.addEventListener('click', () => {
          pendingRows = Array.prototype.slice.call(rootEl.querySelectorAll('[data-device-check]')).filter(c => c.checked).map(c => c.closest('tr'));
          openModal(`Are you sure you want to delete the ${pendingRows.length} selected device(s)? This operation cannot be undone.`);
        });
        if (modal) {
          const ok = modal.querySelector('[data-modal-ok]');
          if (ok) ok.addEventListener('click', () => {
            pendingRows.forEach(tr => tr.remove());
            pendingRows = [];
            closeModal();
            sync();
          });
        }
        rootEl.querySelectorAll('.bc-eg71-signal-cell').forEach(cell => {
          const tip = cell.querySelector('.bc-eg71-signal-tip');
          if (!tip) return;
          cell.addEventListener('mouseenter', () => { tip.hidden = false; });
          cell.addEventListener('mouseleave', () => { tip.hidden = true; });
        });
        // REQ-012：入网失败原因提示——与信号列同款 hover 气泡交互
        rootEl.querySelectorAll('.bc-eg71-fail-tipwrap').forEach(cell => {
          const tip = cell.querySelector('.bc-eg71-fail-tip');
          if (!tip) return;
          cell.addEventListener('mouseenter', () => { tip.hidden = false; });
          cell.addEventListener('mouseleave', () => { tip.hidden = true; });
        });
        rootEl.querySelectorAll('[data-device-add]').forEach(btn => {
          btn.addEventListener('click', () => {
            btn.dispatchEvent(new CustomEvent('eg71-device-add', { bubbles: true, detail: { path: btn.getAttribute('data-device-add') } }));
          });
        });
        rootEl.querySelectorAll('[data-device-op="edit"], [data-device-op="monitor"]').forEach(btn => {
          btn.addEventListener('click', () => {
            btn.dispatchEvent(new CustomEvent('eg71-device-op', { bubbles: true, detail: { op: btn.getAttribute('data-device-op') } }));
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
    },
    {
      id: 'bc-eg71-dashboard-devices', cn: 'Dashboard 接入设备面板', cat: '概览',
      desc: 'Milesight 网关 Dashboard「Access devices」面板：三段式进度条（在线/离线/未激活）+ 图例统计，展示网关下接入设备的总览分布。',
      atoms: ['card', 'progress', 'text'],
      entityHint: 'gateway',
      tags: ['Dashboard', '接入设备', 'Access devices', '进度条', 'EG71'],
      render(ctx) {
        const d = ctx.devices || {};
        const online = Number(d.online) || 0, offline = Number(d.offline) || 0, notActivated = Number(d.notActivated) || 0;
        const total = Number(d.total) || (online + offline + notActivated) || 1;
        const pct = n => Math.max(0, Math.min(100, (n / total) * 100));
        const legend = [
          { key: 'online', label: 'Online', tone: 'success', value: online },
          { key: 'offline', label: 'Offline', tone: 'error', value: offline },
          { key: 'notActivated', label: 'Not activated', tone: 'muted', value: notActivated }
        ];
        return `<div class="ms-card bc-eg71-dashboard-devices">
          <div class="ms-card-head ms-card-head--plain"><span class="ms-card-title">Access devices</span></div>
          <div class="ms-card-body">
            <div class="ms-progress bc-eg71-dashboard-devices-progress">
              <div class="ms-progress-line">
                ${legend.map(l => `<i class="ms-progress-bar${l.tone === 'success' ? ' ms-progress-bar--success' : l.tone === 'error' ? ' ms-progress-bar--error' : ' ms-progress-bar--muted'} bc-eg71-dashboard-devices-seg" style="width:${pct(l.value).toFixed(2)}%"></i>`).join('')}
              </div>
            </div>
            <div class="bc-eg71-dashboard-devices-legend">
              ${legend.map(l => `<span class="bc-eg71-dashboard-devices-legend-item"><i class="bc-eg71-dashboard-devices-dot bc-eg71-dashboard-devices-dot--${l.tone}"></i><span class="ms-text--auxiliary ms-text--sm">${esc(l.label)}</span><span class="bc-eg71-dashboard-devices-legend-value">${esc(l.value)}</span></span>`).join('')}
              <span class="bc-eg71-dashboard-devices-legend-item bc-eg71-dashboard-devices-legend-total"><span class="ms-text--auxiliary ms-text--sm">Total</span><span class="bc-eg71-dashboard-devices-legend-value">${esc(total)}</span></span>
            </div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-eg71-dashboard-forwarding', cn: 'Dashboard 数据转发面板', cat: '概览',
      desc: 'Milesight 网关 Dashboard「Data forwarding」面板：VPN / Routing information / Host 三行入口，逐行点击 dispatch eg71-protocol-navigate 事件跳转对应详情。',
      atoms: ['card', 'icon', 'button'],
      entityHint: 'gateway',
      tags: ['Dashboard', '数据转发', 'Data forwarding', 'VPN', 'Routing', 'Host', 'EG71'],
      render(ctx) {
        const rows = ctx.forwards || [];
        return `<div class="ms-card bc-eg71-dashboard-forwarding">
          <div class="ms-card-head ms-card-head--plain"><span class="ms-card-title">Data forwarding</span></div>
          <div class="ms-card-body">
            ${rows.map(r => `<div class="bc-eg71-dashboard-forwarding-row" data-route="${esc(r.route)}">
              <span class="bc-eg71-dashboard-forwarding-icon">${ico(r.icon || 'topology', 20)}</span>
              <span class="bc-eg71-dashboard-forwarding-title">${esc(r.title)}</span>
              <span class="bc-eg71-dashboard-forwarding-arrow">${ico('chevronRight', 16)}</span>
            </div>`).join('')}
          </div>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelector) ? root : document;
        rootEl.querySelectorAll('.bc-eg71-dashboard-forwarding-row[data-route]').forEach(el => {
          el.addEventListener('click', () => {
            el.dispatchEvent(new CustomEvent('eg71-protocol-navigate', { bubbles: true, detail: { route: el.getAttribute('data-route'), sub: false } }));
          });
        });
      }
    },
    {
      id: 'bc-eg71-dashboard-sysinfo', cn: 'Dashboard 系统信息面板', cat: '概览',
      desc: 'Milesight 网关 Dashboard「System information」面板：型号/序列号/固件/硬件版本/运行时长/本地时间摘要，非 bordered 的 Descriptions 纯文字形态。',
      atoms: ['descriptions', 'text'],
      entityHint: 'gateway',
      tags: ['Dashboard', '系统信息', 'System information', 'EG71'],
      render(ctx) {
        const s = ctx.sysinfo || {};
        const fields = [
          { label: 'Model', value: s.model },
          { label: 'Gateway EUI', value: s.gatewayEui },
          { label: 'Firmware version', value: s.firmware },
          { label: 'Hardware version', value: s.hardware },
          { label: 'Uptime', value: s.uptime },
          { label: 'Local time', value: s.localTime }
        ];
        return `<div class="ms-card bc-eg71-dashboard-sysinfo">
          <div class="ms-card-head ms-card-head--plain"><span class="ms-card-title">System information</span></div>
          <div class="ms-card-body">
            <div class="ms-desc">
              ${fields.map(f => `<div class="ms-desc-item"><span class="ms-desc-label">${esc(f.label)}</span><span class="ms-desc-value">${esc(f.value != null ? f.value : '-')}</span></div>`).join('')}
            </div>
          </div>
        </div>`;
      }
    },
    {
      id: 'bc-eg71-protocol-detail', cn: '协议接口详情抽屉', cat: '概览',
      desc: 'Milesight 网关 Dashboard 协议接口详情抽屉：统一 schema 驱动（头部图标卡+标签 → 一至多组 Descriptions 字段分组 → 可选表格分组 → 单按钮确认底栏），供 10 个协议接口（WLAN/Cellular/IO/RS485/KNX-TP/VPN/Ethernet/Routing/Host/LoRaWAN）复用同一套框架渲染各自数据。',
      atoms: ['drawer', 'descriptions', 'tag', 'table', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['详情', '抽屉', 'Drawer', '协议', 'WLAN', 'Cellular', 'IO', 'RS485', 'KNX', 'VPN', 'Ethernet', 'Routing', 'Host', 'LoRaWAN', 'EG71'],
      render(ctx) {
        const d = ctx.detail || {};
        const tags = Array.isArray(d.tags) ? d.tags : [];
        const sections = Array.isArray(d.sections) ? d.sections : [];
        const fieldRow = f => `<div class="ms-desc-item"><span class="ms-desc-label">${esc(f.label)}</span><span class="ms-desc-value">${esc(f.value != null ? f.value : '-').replace(/\n/g, '<br>')}</span></div>`;
        const sectionHtml = sec => {
          const headcard = sec.headcard ? `<div class="ms-card bc-eg71-protocol-detail-headcard bc-eg71-protocol-detail-headcard--sub">
              <span class="bc-eg71-protocol-detail-headcard-icon">${ico(sec.headcard.icon || 'device', 20)}</span>
              <span class="bc-eg71-protocol-detail-headcard-title">${esc(sec.headcard.title)}</span>
              ${(sec.headcard.tags || []).map(t => `<span class="ms-tag${t.tone ? ' ms-tag--' + esc(t.tone) : ''}">${esc(t.text)}</span>`).join('')}
            </div>` : '';
          const head = (!sec.headcard && sec.title) ? `<div class="bc-eg71-protocol-detail-section-head">
              <span class="ms-h5">${esc(sec.title)}</span>
              ${sec.tag ? `<span class="ms-tag${sec.tag.tone ? ' ms-tag--' + esc(sec.tag.tone) : ''}">${esc(sec.tag.text)}</span>` : ''}
            </div>` : '';
          const fieldsHtml = Array.isArray(sec.fields) && sec.fields.length
            ? `<div class="ms-desc">${sec.fields.map(fieldRow).join('')}</div>` : '';
          const tableHtml = sec.table
            ? `<div class="ms-table-wrap"><table class="ms-table">
                <thead><tr>${sec.table.columns.map(c => `<th>${esc(c.title)}</th>`).join('')}</tr></thead>
                <tbody>${sec.table.rows.length
                  ? sec.table.rows.map(row => `<tr>${sec.table.columns.map(c => `<td>${esc(row[c.key] != null ? row[c.key] : '-')}</td>`).join('')}</tr>`).join('')
                  : `<tr><td colspan="${sec.table.columns.length}" class="bc-eg71-protocol-detail-table-empty">${esc(sec.table.empty || '暂无数据')}</td></tr>`}</tbody>
              </table></div>` : '';
          return `<div class="bc-eg71-protocol-detail-section">${headcard}${head}${fieldsHtml}${tableHtml}</div>`;
        };
        return `<div class="bc-eg71-protocol-detail" hidden>
          <div class="ms-mask ms-mask--drawer">
            <div class="ms-drawer bc-eg71-protocol-detail-drawer" style="width:600px" role="dialog" aria-modal="true" aria-labelledby="bc-eg71-protocol-detail-title">
              <div class="ms-drawer-head">
                <span class="ms-h4" id="bc-eg71-protocol-detail-title">Detail</span>
                <span class="ms-modal-close" data-drawer-close aria-label="关闭">${ico('close', 20)}</span>
              </div>
              <div class="ms-drawer-body ms-stack">
                ${d.title ? `<div class="ms-card bc-eg71-protocol-detail-headcard">
                  <span class="bc-eg71-protocol-detail-headcard-icon">${ico(d.icon || 'device', 20)}</span>
                  <span class="bc-eg71-protocol-detail-headcard-title">${esc(d.title)}</span>
                  ${tags.map(t => `<span class="ms-tag${t.tone ? ' ms-tag--' + esc(t.tone) : ''}">${esc(t.text)}</span>`).join('')}
                </div>` : ''}
                ${sections.map(sectionHtml).join('')}
              </div>
              <div class="ms-drawer-foot">
                <button type="button" class="ms-btn ms-btn--filled" data-drawer-close>Confirm</button>
              </div>
            </div>
          </div>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelector) ? root : document;
        const wrap = (rootEl.classList && rootEl.classList.contains('bc-eg71-protocol-detail')) ? rootEl : (rootEl.querySelector ? rootEl.querySelector('.bc-eg71-protocol-detail') : null);
        if (!wrap) return;
        const open = () => { wrap.hidden = false; wrap.classList.add('is-open'); };
        const close = () => { wrap.hidden = true; wrap.classList.remove('is-open'); };
        wrap.querySelectorAll('[data-drawer-close]').forEach(el => el.addEventListener('click', close));
        const mask = wrap.querySelector('.ms-mask');
        if (mask) mask.addEventListener('click', e => { if (e.target === mask) close(); });
        const drawer = wrap.querySelector('.ms-drawer');
        if (drawer) drawer.addEventListener('click', e => e.stopPropagation());
        wrap.open = open;
        wrap.close = close;
      }
    },
    {
      id: 'bc-eg71-maintenance-tabs', cn: '维护页签壳', cat: '系统设置',
      desc: 'Milesight 网关「System Setting → Maintenance」页签壳：一级页签条（Tools / Equipment self-test / Mission Planning / Backup / Upgrade / Restart，48px 白底 + 底分隔线，激活项主文字色 + 2px 蓝墨条）；Tools 页下追加卡片式二级页签（Ping / Traceroute / Network packet capture / Qxdmlog，激活灰底蓝字）。页签为路由唯一源的只读投影，切换以 eg71-maint-tab / eg71-maint-tool 冒泡事件对外通知，由宿主（MS_EG71_SHELL）改路由后重渲染。',
      atoms: ['button', 'icon', 'space'],
      entityHint: 'gateway',
      tags: ['维护', '页签', 'Tabs', '工具', '升级', '重启', '备份', '任务计划', 'EG71', 'System Setting'],
      render(ctx) {
        const TABS = [
          { key: 'tools', cn: 'Tools', caret: true },
          { key: 'selftest', cn: 'Equipment self-test' },
          { key: 'plan', cn: 'Mission Planning' },
          { key: 'backup', cn: 'Backup' },
          { key: 'upgrade', cn: 'Upgrade' },
          { key: 'restart', cn: 'Restart' }
        ];
        const TOOLS = [
          { key: 'ping', cn: 'Ping' },
          { key: 'traceroute', cn: 'Traceroute' },
          { key: 'capture', cn: 'Network packet capture' },
          { key: 'qxdmlog', cn: 'Qxdmlog' }
        ];
        const tab = ctx.tab || 'tools';
        const tool = ctx.tool || 'ping';
        return `<div class="bc-eg71-maintenance-tabs">
          <div class="bc-eg71-maint-bar" role="tablist" aria-label="Maintenance">
            ${TABS.map(t => `<button type="button" class="bc-eg71-maint-tab${t.key === tab ? ' bc-eg71-maint-tab--active' : ''}" role="tab" aria-selected="${t.key === tab}" data-maint-tab="${t.key}"${t.key === tab ? '' : ' tabindex="-1"'}>${esc(t.cn)}${t.caret ? ico('chevronDown', 14) : ''}</button>`).join('')}
          </div>
          ${tab === 'tools' ? `<div class="bc-eg71-maint-cardbar" role="tablist" aria-label="Tools">
            ${TOOLS.map(t => `<button type="button" class="bc-eg71-maint-cardtab${t.key === tool ? ' bc-eg71-maint-cardtab--active' : ''}" role="tab" aria-selected="${t.key === tool}" data-maint-tool="${t.key}"${t.key === tool ? '' : ' tabindex="-1"'}>${esc(t.cn)}</button>`).join('')}
          </div>` : ''}
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-maint-tab]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-maint-tab', { bubbles: true, detail: { tab: b.getAttribute('data-maint-tab') } }));
        }));
        rootEl.querySelectorAll('[data-maint-tool]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-maint-tool', { bubbles: true, detail: { tool: b.getAttribute('data-maint-tool') } }));
        }));
      }
    },
    {
      id: 'bc-eg71-tool-diagnose', cn: 'Ping/Traceroute 诊断工具', cat: '系统设置',
      desc: '维护 → Tools 下 Ping / Traceroute 两页共用诊断表单：Host 标签 + 输入框（placeholder「Eg.」）+ 主按钮（文案随 ctx.tool 在 Ping / Traceroute 间切换）+ 次按钮 Stop。Host 为空或未在运行时主按钮禁用（Figma 默认态），Stop 仅运行态可用。事件：eg71-tool-start / eg71-tool-stop（detail.tool 标明来源页）。',
      atoms: ['form', 'input', 'button'],
      entityHint: 'gateway',
      tags: ['维护', '工具', 'Ping', 'Traceroute', '诊断', '连通性', 'Host', 'EG71'],
      render(ctx) {
        const tool = ctx.tool === 'traceroute' ? 'traceroute' : 'ping';
        const startLabel = tool === 'ping' ? 'Ping' : 'Traceroute';
        const running = !!ctx.running;
        const startDisabled = !running && !(ctx.host || '').trim();
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="ms-form">
                <div class="bc-eg71-tool-fields">
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Host</label></div>
                    <div class="bc-eg71-tool-btnrow">
                      <label class="ms-input"><input data-tool-host value="${esc(ctx.host || '')}" placeholder="Eg."></label>
                      <button type="button" class="ms-btn ms-btn--filled" data-tool-start${startDisabled ? ' disabled' : ''}>${startLabel}</button>
                      <button type="button" class="ms-btn" data-tool-stop${running ? '' : ' disabled'}>Stop</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const wrap = rootEl.querySelector('.bc-eg71-tool-btnrow') || rootEl;
        const start = wrap.querySelector('[data-tool-start]');
        const stop = wrap.querySelector('[data-tool-stop]');
        if (start) start.addEventListener('click', () => {
          wrap.dispatchEvent(new CustomEvent('eg71-tool-start', { bubbles: true, detail: { tool: 'diagnose' } }));
        });
        if (stop) stop.addEventListener('click', () => {
          wrap.dispatchEvent(new CustomEvent('eg71-tool-stop', { bubbles: true, detail: { tool: 'diagnose' } }));
        });
      }
    },
    {
      id: 'bc-eg71-tool-capture', cn: '网络抓包工具', cat: '系统设置',
      desc: '维护 → Tools → Network packet capture 抓包表单：顶部动作行（Start 主按钮 / Stop / Download，未运行时后两者禁用）+ 两列字段（Ethernet Interface 下拉默认 Any / IP Address / Port）+ Advance 复选（默认勾选，控制高级规则 textarea 显隐，placeholder 给出 tcpdump 语法示例）。事件：eg71-tool-start / eg71-tool-stop / eg71-tool-download。',
      atoms: ['form', 'input', 'select', 'checkbox', 'button'],
      entityHint: 'gateway',
      tags: ['维护', '工具', '抓包', 'packet capture', 'tcpdump', 'Advance', 'EG71'],
      render(ctx) {
        const running = !!ctx.running;
        const advance = ctx.advance !== false;
        const ifaces = ctx.interfaces || ['Any', 'eth0', 'eth1'];
        const iface = ctx.interface || 'Any';
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-tool-actions">
                <button type="button" class="ms-btn ms-btn--filled" data-tool-start>Start</button>
                <button type="button" class="ms-btn" data-tool-stop${running ? '' : ' disabled'}>Stop</button>
                <button type="button" class="ms-btn" data-tool-download${ctx.file ? '' : ' disabled'}>Download</button>
              </div>
              <div class="ms-form">
                <div class="bc-eg71-tool-fields">
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Ethernet Interface</label></div>
                    <span class="ms-select"><select data-capture-iface>${ifaces.map(o => `<option${o === iface ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                  </div>
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">IP Address</label></div>
                    <label class="ms-input"><input data-capture-ip value="${esc(ctx.ip || '')}"></label>
                  </div>
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Port</label></div>
                    <label class="ms-input"><input data-capture-port value="${esc(ctx.port || '')}"></label>
                  </div>
                </div>
                <label class="ms-checkbox bc-eg71-tool-advance"><input type="checkbox" data-capture-advance${advance ? ' checked' : ''}><span class="ms-checkbox-box"></span>Advance</label>
                <label class="ms-input ms-input--textarea" data-capture-panel${advance ? '' : ' hidden'}><textarea rows="6" placeholder="Please set the packet capture network port, IP address, port and other rules in this text box. For example: ianyhost 192.168.1.1 and 443,"></textarea></label>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const wrap = rootEl.querySelector('.bc-eg71-tool-actions') || rootEl;
        [['data-tool-start', 'eg71-tool-start'], ['data-tool-stop', 'eg71-tool-stop'], ['data-tool-download', 'eg71-tool-download']].forEach(([sel, ev]) => {
          const btn = wrap.querySelector('[' + sel + ']');
          if (btn) btn.addEventListener('click', () => {
            wrap.dispatchEvent(new CustomEvent(ev, { bubbles: true, detail: { tool: 'capture' } }));
          });
        });
        const adv = rootEl.querySelector('[data-capture-advance]');
        const panel = rootEl.querySelector('[data-capture-panel]');
        if (adv && panel) adv.addEventListener('change', () => { panel.hidden = !adv.checked; });
      }
    },
    {
      id: 'bc-eg71-tool-qxdmlog', cn: 'Qxdmlog 日志抓取', cat: '系统设置',
      desc: '维护 → Tools → Qxdmlog 页：动作行（Start 主按钮 / Stop / Download 禁用）+ 日志输出空态面板，抓取启动后由宿主把日志流回填。事件：eg71-tool-start / eg71-tool-stop / eg71-tool-download。',
      atoms: ['button', 'empty', 'icon'],
      entityHint: 'gateway',
      tags: ['维护', '工具', 'Qxdmlog', '日志', '抓取', '诊断', 'EG71'],
      render(ctx) {
        const running = !!ctx.running;
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-tool-actions">
                <button type="button" class="ms-btn ms-btn--filled" data-tool-start>Start</button>
                <button type="button" class="ms-btn" data-tool-stop${running ? '' : ' disabled'}>Stop</button>
                <button type="button" class="ms-btn" data-tool-download${ctx.file ? '' : ' disabled'}>Download</button>
              </div>
              <div class="ms-empty">
                <svg class="ms-empty-illu" viewBox="0 0 88 64" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="10" y="12" width="68" height="40" rx="6"/><path d="M10 22h68M22 34h44M22 44h28"/></svg>
                <span class="ms-empty-text">No log output yet. Start capturing to view Qxdmlog.</span>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const wrap = rootEl.querySelector('.bc-eg71-tool-actions') || rootEl;
        [['data-tool-start', 'eg71-tool-start'], ['data-tool-stop', 'eg71-tool-stop'], ['data-tool-download', 'eg71-tool-download']].forEach(([sel, ev]) => {
          const btn = wrap.querySelector('[' + sel + ']');
          if (btn) btn.addEventListener('click', () => {
            wrap.dispatchEvent(new CustomEvent(ev, { bubbles: true, detail: { tool: 'qxdmlog' } }));
          });
        });
      }
    },
    {
      id: 'bc-eg71-mission-plan', cn: '任务计划卡片墙', cat: '系统设置',
      desc: '维护 → Mission Planning：自适应卡片墙 = 「+ Add Plan」虚线占位卡 + 计划卡（标题 + 启用开关 + 删除钮 / 动作下拉 Reboot / 时间选择 / 一~日七枚星期多选钮）。停用卡整体降透明度且表单区禁点（开关除外，可重新启用）。事件：eg71-plan-add / eg71-plan-delete / eg71-plan-toggle / eg71-plan-day。',
      atoms: ['form', 'select', 'input', 'button', 'switch', 'icon'],
      entityHint: 'gateway',
      tags: ['维护', '任务计划', 'Mission Planning', '计划', '定时', 'Reboot', '星期', 'EG71'],
      render(ctx) {
        const DAYS = ['一', '二', '三', '四', '五', '六', '日'];
        const actions = ctx.actions || ['Reboot'];
        const plans = ctx.plans || [
          { name: 'Plan 1', enabled: true, action: 'Reboot', time: '14:30', days: [0, 3, 5, 6] },
          { name: 'Plan 1', enabled: false, action: 'Reboot', time: '14:30', days: [0, 3, 5, 6] }
        ];
        const planCard = (p, i) => {
          const disabled = p.enabled === false;
          return `<article class="bc-eg71-plan-card${disabled ? ' bc-eg71-plan-card--disabled' : ''}" data-plan="${i}">
            <div class="bc-eg71-plan-head">
              <span class="bc-eg71-plan-title">${esc(p.name || 'Plan ' + (i + 1))}</span>
              <label class="ms-switch"><input type="checkbox" data-plan-toggle${disabled ? '' : ' checked'} aria-label="Enable plan"><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
              <button type="button" class="bc-eg71-plan-del" data-plan-del aria-label="Delete plan">${ico('trash', 16)}</button>
            </div>
            <div class="bc-eg71-plan-body">
              <span class="ms-select"><select data-plan-action>${actions.map(a => `<option${a === p.action ? ' selected' : ''}>${esc(a)}</option>`).join('')}</select></span>
              <div class="bc-eg71-plan-time">
                <label class="ms-input"><input type="time" value="${esc(p.time || '00:00')}"></label>
                ${ico('clock', 16)}
              </div>
              <div class="bc-eg71-plan-days" role="group" aria-label="Repeat days">
                ${DAYS.map((d, di) => `<button type="button" class="ms-btn ms-btn--sm bc-eg71-plan-day${(p.days || []).indexOf(di) >= 0 ? ' bc-eg71-plan-day--active' : ''}" data-plan-day="${di}" aria-pressed="${(p.days || []).indexOf(di) >= 0}">${d}</button>`).join('')}
              </div>
            </div>
          </article>`;
        };
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-plan-grid">
                ${plans.map(planCard).join('')}
                <button type="button" class="bc-eg71-plan-card--add" data-plan-add>${ico('plus', 24)}<span>Add Plan</span></button>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-plan-add]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-plan-add', { bubbles: true }));
        }));
        rootEl.querySelectorAll('[data-plan-del]').forEach(b => b.addEventListener('click', () => {
          const card = b.closest('[data-plan]');
          b.dispatchEvent(new CustomEvent('eg71-plan-delete', { bubbles: true, detail: { index: Number(card.getAttribute('data-plan')) } }));
        }));
        rootEl.querySelectorAll('[data-plan-toggle]').forEach(t => t.addEventListener('change', () => {
          const card = t.closest('[data-plan]');
          card.classList.toggle('bc-eg71-plan-card--disabled', !t.checked);
          t.dispatchEvent(new CustomEvent('eg71-plan-toggle', { bubbles: true, detail: { index: Number(card.getAttribute('data-plan')), enabled: t.checked } }));
        }));
        rootEl.querySelectorAll('[data-plan-day]').forEach(d => d.addEventListener('click', () => {
          const active = d.classList.toggle('bc-eg71-plan-day--active');
          d.setAttribute('aria-pressed', String(active));
          const card = d.closest('[data-plan]');
          d.dispatchEvent(new CustomEvent('eg71-plan-day', { bubbles: true, detail: { index: Number(card.getAttribute('data-plan')), day: Number(d.getAttribute('data-plan-day')), active } }));
        }));
      }
    },
    {
      id: 'bc-eg71-maint-message', cn: '维护结果反馈卡', cat: '系统设置',
      desc: '维护域共用结果反馈 Message 卡（Figma 升级/重启说明页 Frame75/76 形态）：416px 定宽白卡 = 居中 140 插图（success/error/info 三态换色）+ 标题 + 正文 + 右下按钮组。被 bc-eg71-upgrade / bc-eg71-restart 在结果态引用。事件：eg71-maint-action（detail.action 为按钮文案）。',
      atoms: ['card', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['维护', '结果', '反馈', 'Message', '升级完成', '重启完成', 'EG71'],
      render(ctx) {
        const tone = ctx.tone === 'success' || ctx.tone === 'error' ? ctx.tone : 'info';
        const actions = ctx.actions && ctx.actions.length ? ctx.actions : [{ label: 'Back' }];
        return `<section class="ms-card bc-eg71-maint-msg">
          ${maintIllu(tone)}
          <div class="bc-eg71-maint-msg-title">${esc(ctx.title || '')}</div>
          <div class="bc-eg71-maint-msg-content">${esc(ctx.content || '')}</div>
          <div class="bc-eg71-maint-msg-actions">
            ${actions.map(a => `<button type="button" class="ms-btn${a.primary ? ' ms-btn--filled' : ''}" data-maint-action="${esc(a.label)}">${esc(a.label)}</button>`).join('')}
          </div>
        </section>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-maint-action]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-maint-action', { bubbles: true, detail: { action: b.getAttribute('data-maint-action') } }));
        }));
      }
    },
    {
      id: 'bc-eg71-upgrade', cn: '固件升级', cat: '系统设置',
      desc: '维护 → Upgrade 固件升级页（含 Figma「.升级说明」状态机）：idle 态 = 固件版本行（蓝链接）+ 140 插图 + Upgrade Files + 文件行（File 输入 + 清除 × + Import 主钮 + Upgrade 次钮）+ Restore to factory settings 复选；importing / upgrading 态 = 插图 + 文件行与复选整体禁用；success / failed 态 = bc-eg71-maint-message 结果卡。事件：eg71-upgrade-import / eg71-upgrade-start / eg71-upgrade-clear / eg71-upgrade-factory。',
      atoms: ['form', 'input', 'checkbox', 'button', 'icon', 'card'],
      entityHint: 'gateway',
      tags: ['维护', '升级', '固件', 'Firmware', 'Import', '恢复出厂', 'EG71'],
      render(ctx) {
        const B = window.MS_BIZ_INDEX;
        const state = ctx.state || 'idle';
        if (state === 'success' || state === 'failed') {
          const ok = state === 'success';
          const msg = B && B['bc-eg71-maint-message'] ? B['bc-eg71-maint-message'].render({
            tone: ok ? 'success' : 'error',
            title: ctx.title || (ok ? 'Upgrade completed' : 'Upgrade failed'),
            content: ctx.content || (ok ? 'The firmware has been upgraded. The device will apply the new firmware.' : 'The upgrade failed. Please check the upgrade file and retry.'),
            actions: ctx.actions || [{ label: 'Back' }]
          }) : '';
          return `<div class="bc-eg71-maint-body">${msg}</div>`;
        }
        const busy = state === 'importing' || state === 'upgrading';
        const file = ctx.file || '';
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-upgrade">
                <div class="bc-eg71-upgrade-version">
                  <label class="ms-form-label">Firmware version</label>
                  <a class="ms-link" href="javascript:void(0)">${esc(ctx.version || '60.0.0.42-r5-a5')}</a>
                </div>
                <div class="bc-eg71-upgrade-center">
                  ${maintIllu('upgrade')}
                  <span class="bc-eg71-upgrade-filelabel">Upgrade Files</span>
                  <div class="bc-eg71-upgrade-file">
                    <label class="ms-input"><input value="${esc(file)}" placeholder="File"${busy ? ' disabled' : ''}></label>
                    ${file && !busy ? `<button type="button" class="bc-eg71-upgrade-clear" data-upgrade-clear aria-label="Clear file">${ico('close', 14)}</button>` : ''}
                    <button type="button" class="ms-btn ms-btn--filled" data-upgrade-import${busy ? ' disabled' : ''}>Import</button>
                    <button type="button" class="ms-btn" data-upgrade-start${busy || !file ? ' disabled' : ''}>Upgrade</button>
                  </div>
                  <label class="ms-checkbox"><input type="checkbox" data-upgrade-factory${ctx.factory ? ' checked' : ''}${busy ? ' disabled' : ''}><span class="ms-checkbox-box"></span>Restore to factory settings</label>
                </div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const B = window.MS_BIZ_INDEX;
        if (B && B['bc-eg71-maint-message'] && typeof B['bc-eg71-maint-message'].bind === 'function') B['bc-eg71-maint-message'].bind(rootEl);
        const wrap = rootEl.querySelector('.bc-eg71-upgrade') || rootEl;
        [['data-upgrade-import', 'eg71-upgrade-import'], ['data-upgrade-start', 'eg71-upgrade-start'], ['data-upgrade-clear', 'eg71-upgrade-clear']].forEach(([sel, ev]) => {
          const btn = wrap.querySelector('[' + sel + ']');
          if (btn) btn.addEventListener('click', () => wrap.dispatchEvent(new CustomEvent(ev, { bubbles: true })));
        });
        const factory = wrap.querySelector('[data-upgrade-factory]');
        if (factory) factory.addEventListener('change', () => {
          wrap.dispatchEvent(new CustomEvent('eg71-upgrade-factory', { bubbles: true, detail: { factory: factory.checked } }));
        });
      }
    },
    {
      id: 'bc-eg71-restart', cn: '重启/恢复出厂', cat: '系统设置',
      desc: '维护 → Restart 页（含 Figma「.重启说明」状态机）：idle 态 = 顶部 warm 警示条（重启期间勿操作）+ 三选一单选组（Reboot / Restore to factory settings / Restore to factory settings and reboot）+ Restart 主按钮；restarting / restoring 态 = 140 插图 + 按钮禁用（说明页中间态）；success 态 = bc-eg71-maint-message 结果卡。事件：eg71-restart-mode / eg71-restart-submit。',
      atoms: ['alert', 'form', 'radio', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['维护', '重启', 'Reboot', '恢复出厂', 'Restart', 'EG71'],
      render(ctx) {
        const B = window.MS_BIZ_INDEX;
        const state = ctx.state || 'idle';
        if (state === 'success') {
          const msg = B && B['bc-eg71-maint-message'] ? B['bc-eg71-maint-message'].render({
            tone: 'success',
            title: ctx.title || 'Restart completed',
            content: ctx.content || 'The device has rebooted and is back online.',
            actions: ctx.actions || [{ label: 'Back' }]
          }) : '';
          return `<div class="bc-eg71-maint-body">${msg}</div>`;
        }
        const busy = state === 'restarting' || state === 'restoring';
        const MODES = [
          { key: 'reboot', cn: 'Reboot' },
          { key: 'factory', cn: 'Restore to factory settings' },
          { key: 'factory-reboot', cn: 'Restore to factory settings and reboot' }
        ];
        const mode = ctx.mode || 'reboot';
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-restart">
                <div class="ms-alert ms-alert--warn">${ico('warn', 16)}<div class="ms-alert-body">${esc(ctx.alertText || 'The device will be unavailable during the restart. Do not power off or refresh the page.')}</div></div>
                ${busy ? `<div class="bc-eg71-restart-center">
                  ${maintIllu('restart')}
                  <button type="button" class="ms-btn ms-btn--filled" disabled>Restart</button>
                </div>` : `<div class="ms-form">
                  <div class="ms-form-item">
                    ${MODES.map(m => `<label class="ms-radio bc-eg71-restart-mode"><input type="radio" name="eg71-restart-mode" value="${m.key}"${m.key === mode ? ' checked' : ''}><span class="ms-radio-dot"></span>${esc(m.cn)}</label>`).join('')}
                  </div>
                  <button type="button" class="ms-btn ms-btn--filled" data-restart-submit>Restart</button>
                </div>`}
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const B = window.MS_BIZ_INDEX;
        if (B && B['bc-eg71-maint-message'] && typeof B['bc-eg71-maint-message'].bind === 'function') B['bc-eg71-maint-message'].bind(rootEl);
        const wrap = rootEl.querySelector('.bc-eg71-restart') || rootEl;
        wrap.querySelectorAll('input[name="eg71-restart-mode"]').forEach(r => r.addEventListener('change', () => {
          wrap.dispatchEvent(new CustomEvent('eg71-restart-mode', { bubbles: true, detail: { mode: r.value } }));
        }));
        const submit = wrap.querySelector('[data-restart-submit]');
        if (submit) submit.addEventListener('click', () => {
          const checked = wrap.querySelector('input[name="eg71-restart-mode"]:checked');
          wrap.dispatchEvent(new CustomEvent('eg71-restart-submit', { bubbles: true, detail: { mode: checked ? checked.value : 'reboot' } }));
        });
      }
    },
    {
      id: 'bc-eg71-backup', cn: '配置备份/恢复/导入', cat: '系统设置',
      desc: '维护 → Backup 页三卡结构：双卡并排（Backup Running-config 插图+Backup 次按钮 / Restore Factory Defaults 插图+Reset 次按钮）+ 全宽导入卡（Importing a Configuration File：Configuration Files 标签 + File 输入带清除 × + Import 主按钮 + Configuration 次按钮）。事件：eg71-backup-run / eg71-backup-reset / eg71-backup-import / eg71-backup-config / eg71-backup-clear。',
      atoms: ['card', 'form', 'input', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['维护', '备份', 'Backup', '恢复出厂', '配置导入', 'Running-config', 'EG71'],
      render(ctx) {
        const file = ctx.file || '';
        return `<div class="bc-eg71-maint-body">
          <div class="bc-eg71-backup-grid">
            <section class="ms-card">
              <div class="ms-card-body bc-eg71-backup-card">
                <span class="ms-h4">Backup Running-config</span>
                ${maintIllu('backupRun')}
                <button type="button" class="ms-btn" data-backup-run>Backup</button>
              </div>
            </section>
            <section class="ms-card">
              <div class="ms-card-body bc-eg71-backup-card">
                <span class="ms-h4">Restore Factory Defaults</span>
                ${maintIllu('backupReset')}
                <button type="button" class="ms-btn" data-backup-reset>Reset</button>
              </div>
            </section>
          </div>
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="ms-form">
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Configuration Files</label></div>
                  <div class="bc-eg71-backup-file">
                    <label class="ms-input"><input value="${esc(file)}" placeholder="File"></label>
                    ${file ? `<button type="button" class="bc-eg71-upgrade-clear" data-backup-clear aria-label="Clear file">${ico('close', 14)}</button>` : ''}
                    <button type="button" class="ms-btn ms-btn--filled" data-backup-import>Import</button>
                    <button type="button" class="ms-btn" data-backup-config>Configuration</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        [['data-backup-run', 'eg71-backup-run'], ['data-backup-reset', 'eg71-backup-reset'], ['data-backup-import', 'eg71-backup-import'], ['data-backup-config', 'eg71-backup-config'], ['data-backup-clear', 'eg71-backup-clear']].forEach(([sel, ev]) => {
          rootEl.querySelectorAll('[' + sel + ']').forEach(b => b.addEventListener('click', () => {
            b.dispatchEvent(new CustomEvent(ev, { bubbles: true }));
          }));
        });
      }
    },
    {
      id: 'bc-eg71-snmp-tabs', cn: 'SNMP 三级页签壳', cat: '系统设置',
      desc: 'Milesight 网关「System Setting → SNMP」三级页签条：Agent Setting / MIB View / VACM / Trap / MIB（48px 白底 + 底分隔线，激活项主文字色 + 2px 蓝墨条，页签间距 32px）。页签为路由唯一源的只读投影，切换以 eg71-snmp-tab 冒泡事件对外通知，由宿主（MS_EG71_SHELL）改路由后重渲染。',
      atoms: ['button', 'icon', 'space'],
      entityHint: 'gateway',
      tags: ['SNMP', '页签', 'Tabs', '网管', 'System Setting', '三级菜单', 'EG71'],
      render(ctx) {
        const TABS = [
          { key: 'agent', cn: 'Agent Setting' },
          { key: 'mibview', cn: 'MIB View' },
          { key: 'vacm', cn: 'VACM' },
          { key: 'trap', cn: 'Trap' },
          { key: 'mib', cn: 'MIB' }
        ];
        const tab = ctx.tab || 'agent';
        return `<div class="bc-eg71-snmp-bar" role="tablist" aria-label="SNMP">
          ${TABS.map(t => `<button type="button" class="bc-eg71-snmp-tab${t.key === tab ? ' bc-eg71-snmp-tab--active' : ''}" role="tab" aria-selected="${t.key === tab}" data-snmp-tab="${t.key}"${t.key === tab ? '' : ' tabindex="-1"'}>${esc(t.cn)}</button>`).join('')}
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-snmp-tab]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-snmp-tab', { bubbles: true, detail: { tab: b.getAttribute('data-snmp-tab') } }));
        }));
      }
    },
    {
      id: 'bc-eg71-snmp-agent', cn: 'SNMP Agent 设置', cat: '系统设置',
      desc: 'SNMP → Agent Setting：标题行「SNMP Setting」+ 28×16 小开关（功能总闸，关闭时表单整体禁用）+ 两列字段（port 默认 161 / System Name 默认设备 EUI / Version 分段单选 SNMP v1·v2·v3 / Location Information / Contact Information）。事件：eg71-snmp-agent-toggle {enabled} / eg71-snmp-agent-version {version}。',
      atoms: ['form', 'input', 'radio', 'switch', 'button'],
      entityHint: 'gateway',
      tags: ['SNMP', 'Agent', '端口', '161', '版本', 'v1', 'v2', 'v3', 'System Name', 'EG71'],
      render(ctx) {
        const enabled = ctx.enabled !== false;
        const version = ['v1', 'v2', 'v3'].indexOf(ctx.version) >= 0 ? ctx.version : 'v1';
        const agent = ctx.agent || {};
        const val = (k, d) => esc(agent[k] != null ? agent[k] : d);
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-snmp-head">
                <span class="ms-h4">SNMP Setting</span>
                <label class="ms-switch ms-switch--xs"><input type="checkbox" data-snmp-agent-toggle${enabled ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
              </div>
              <div class="bc-eg71-snmp-fields${enabled ? '' : ' bc-eg71-snmp-fields--disabled'}">
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">port</label></div>
                  <label class="ms-input"><input data-snmp-agent-port value="${val('port', '161')}"></label>
                </div>
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">System Name</label></div>
                  <label class="ms-input"><input data-snmp-agent-name value="${val('systemName', '24E124FFFEF6A10E')}"></label>
                </div>
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Version</label></div>
                  <div class="ms-radio-btn-group" role="radiogroup" aria-label="SNMP Version">
                    ${['v1', 'v2', 'v3'].map(v => `<button type="button" class="ms-radio-btn${v === version ? ' ms-radio-btn--checked' : ''}" role="radio" aria-checked="${v === version}" tabindex="${v === version ? '-1' : '0'}" data-snmp-agent-version="${v}">SNMP ${v}</button>`).join('')}
                  </div>
                </div>
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Location Information</label></div>
                  <label class="ms-input"><input data-snmp-agent-location value="${val('location', '')}"></label>
                </div>
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Contact Information</label></div>
                  <label class="ms-input"><input data-snmp-agent-contact value="${val('contact', '')}"></label>
                </div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const t = rootEl.querySelector('[data-snmp-agent-toggle]');
        if (t) t.addEventListener('change', () => {
          t.dispatchEvent(new CustomEvent('eg71-snmp-agent-toggle', { bubbles: true, detail: { enabled: t.checked } }));
        });
        rootEl.querySelectorAll('[data-snmp-agent-version]').forEach(b => b.addEventListener('click', () => {
          const group = b.closest('.ms-radio-btn-group');
          if (group) group.querySelectorAll('.ms-radio-btn').forEach(x => { x.classList.remove('ms-radio-btn--checked'); x.setAttribute('aria-checked', 'false'); });
          b.classList.add('ms-radio-btn--checked');
          b.setAttribute('aria-checked', 'true');
          b.dispatchEvent(new CustomEvent('eg71-snmp-agent-version', { bubbles: true, detail: { version: b.getAttribute('data-snmp-agent-version') } }));
        }));
      }
    },
    {
      id: 'bc-eg71-snmp-mibview', cn: 'SNMP MIB View 视图表', cat: '系统设置',
      desc: 'SNMP → MIB View 行内可编辑表格：View Name（输入）/ View Filter（下拉 Included·Excluded）/ View OID（输入）三列 + 行尾删除图标，底部居中「添加」小钮（24px）追加空行。事件：eg71-snmp-view-add / eg71-snmp-view-delete {index}。',
      atoms: ['table', 'input', 'select', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['SNMP', 'MIB View', 'View Name', 'View Filter', 'View OID', 'Included', 'Excluded', '行内编辑', 'EG71'],
      render(ctx) {
        const views = (ctx.views && ctx.views.length ? ctx.views : [{}, {}]).map(v => ({
          name: v.name || '', filter: v.filter || 'Included', oid: v.oid || ''
        }));
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <table class="bc-eg71-snmp-table">
                <thead><tr><th>View Name</th><th>View Filter</th><th>View OID</th><th class="bc-eg71-snmp-ops" aria-label="操作"></th></tr></thead>
                <tbody>
                  ${views.map((v, i) => `<tr>
                    <td><label class="ms-input ms-input--sm"><input data-snmp-view-name value="${esc(v.name)}"></label></td>
                    <td><span class="ms-select ms-select--sm"><select data-snmp-view-filter>${['Included', 'Excluded'].map(o => `<option${o === v.filter ? ' selected' : ''}>${o}</option>`).join('')}</select></span></td>
                    <td><label class="ms-input ms-input--sm"><input data-snmp-view-oid value="${esc(v.oid)}"></label></td>
                    <td class="bc-eg71-snmp-ops"><button type="button" class="bc-eg71-snmp-del" data-snmp-view-del="${i}" aria-label="Delete">${ico('trash', 16)}</button></td>
                  </tr>`).join('')}
                </tbody>
              </table>
              <div class="bc-eg71-snmp-addrow"><button type="button" class="ms-btn ms-btn--xs" data-snmp-view-add>添加</button></div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const add = rootEl.querySelector('[data-snmp-view-add]');
        if (add) add.addEventListener('click', () => add.dispatchEvent(new CustomEvent('eg71-snmp-view-add', { bubbles: true })));
        rootEl.querySelectorAll('[data-snmp-view-del]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-snmp-view-delete', { bubbles: true, detail: { index: Number(b.getAttribute('data-snmp-view-del')) } }));
        }));
      }
    },
    {
      id: 'bc-eg71-snmp-vacm', cn: 'SNMP VACM 访问控制表', cat: '系统设置',
      desc: 'SNMP → VACM 行内可编辑表格：Community（输入）/ Permission（下拉 Read-Write·Read-Only）/ MIB View（下拉，选项来自 MIB View 页签已定义视图，ctx.viewNames 注入，缺省 All·None）/ View OID（输入）四列 + 行尾删除；底部居中「添加」。事件：eg71-snmp-vacm-add / eg71-snmp-vacm-delete {index}。',
      atoms: ['table', 'input', 'select', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['SNMP', 'VACM', 'Community', 'Read-Write', 'Read-Only', 'MIB View', '访问控制', '行内编辑', 'EG71'],
      render(ctx) {
        const viewNames = (ctx.viewNames && ctx.viewNames.length) ? ctx.viewNames : ['All', 'None'];
        const groups = (ctx.groups && ctx.groups.length ? ctx.groups : [{}, {}]).map((g, i) => ({
          community: g.community || '',
          permission: g.permission || 'Read-Write',
          view: g.view || viewNames[i % viewNames.length],
          oid: g.oid || ''
        }));
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <table class="bc-eg71-snmp-table">
                <thead><tr><th>Community</th><th>Permission</th><th>MIB View</th><th>View OID</th><th class="bc-eg71-snmp-ops" aria-label="操作"></th></tr></thead>
                <tbody>
                  ${groups.map((g, i) => `<tr>
                    <td><label class="ms-input ms-input--sm"><input data-snmp-vacm-community value="${esc(g.community)}"></label></td>
                    <td><span class="ms-select ms-select--sm"><select data-snmp-vacm-permission>${['Read-Write', 'Read-Only'].map(o => `<option${o === g.permission ? ' selected' : ''}>${o}</option>`).join('')}</select></span></td>
                    <td><span class="ms-select ms-select--sm"><select data-snmp-vacm-view>${viewNames.map(o => `<option${o === g.view ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span></td>
                    <td><label class="ms-input ms-input--sm"><input data-snmp-vacm-oid value="${esc(g.oid)}"></label></td>
                    <td class="bc-eg71-snmp-ops"><button type="button" class="bc-eg71-snmp-del" data-snmp-vacm-del="${i}" aria-label="Delete">${ico('trash', 16)}</button></td>
                  </tr>`).join('')}
                </tbody>
              </table>
              <div class="bc-eg71-snmp-addrow"><button type="button" class="ms-btn ms-btn--xs" data-snmp-vacm-add>添加</button></div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const add = rootEl.querySelector('[data-snmp-vacm-add]');
        if (add) add.addEventListener('click', () => add.dispatchEvent(new CustomEvent('eg71-snmp-vacm-add', { bubbles: true })));
        rootEl.querySelectorAll('[data-snmp-vacm-del]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-snmp-vacm-delete', { bubbles: true, detail: { index: Number(b.getAttribute('data-snmp-vacm-del')) } }));
        }));
      }
    },
    {
      id: 'bc-eg71-snmp-trap', cn: 'SNMP Trap 告警目标', cat: '系统设置',
      desc: 'SNMP → Trap：标题行「Enable」+ 28×16 小开关（Trap 总闸，关闭时表单整体禁用）+ 两列字段（SNMP Version 下拉默认 SNMPv2 / Server Address / Port / Name）。事件：eg71-snmp-trap-toggle {enabled}。',
      atoms: ['form', 'input', 'select', 'switch'],
      entityHint: 'gateway',
      tags: ['SNMP', 'Trap', '告警', 'NMS', 'Server Address', 'SNMPv2', 'EG71'],
      render(ctx) {
        const enabled = ctx.enabled !== false;
        const versions = ctx.versions || ['SNMPv1', 'SNMPv2', 'SNMPv3'];
        const version = versions.indexOf(ctx.version) >= 0 ? ctx.version : 'SNMPv2';
        const trap = ctx.trap || {};
        const fi = (label, key) => `<div class="ms-form-item">
          <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">${label}</label></div>
          <label class="ms-input"><input data-snmp-trap-${key} value="${esc(trap[key] || '')}"></label>
        </div>`;
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-snmp-head">
                <span class="ms-h4">Enable</span>
                <label class="ms-switch ms-switch--xs"><input type="checkbox" data-snmp-trap-toggle${enabled ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
              </div>
              <div class="bc-eg71-snmp-fields${enabled ? '' : ' bc-eg71-snmp-fields--disabled'}">
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">SNMP Version</label></div>
                  <span class="ms-select"><select data-snmp-trap-version>${versions.map(o => `<option${o === version ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                </div>
                ${fi('Server Address', 'server')}
                ${fi('Port', 'port')}
                ${fi('Name', 'name')}
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const t = rootEl.querySelector('[data-snmp-trap-toggle]');
        if (t) t.addEventListener('change', () => {
          t.dispatchEvent(new CustomEvent('eg71-snmp-trap-toggle', { bubbles: true, detail: { enabled: t.checked } }));
        });
      }
    },
    {
      id: 'bc-eg71-snmp-mib', cn: 'SNMP MIB 文件下载', cat: '系统设置',
      desc: 'SNMP → MIB：MIB File 下拉（设备支持的 MIB 文件清单，ctx.files 注入，缺省 BRIDGE-MIB.txt）+ Download 主按钮（Figma 文案笔误 Downliad，实现取 Download）。只读下载，无上传。事件：eg71-snmp-mib-download {file}。',
      atoms: ['form', 'select', 'button'],
      entityHint: 'gateway',
      tags: ['SNMP', 'MIB', 'Download', 'BRIDGE-MIB', '文件下载', 'EG71'],
      render(ctx) {
        const files = (ctx.files && ctx.files.length) ? ctx.files : ['BRIDGE-MIB.txt'];
        const file = files.indexOf(ctx.file) >= 0 ? ctx.file : files[0];
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="ms-form">
                <div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">MIB File</label></div>
                  <div class="bc-eg71-snmp-mibrow">
                    <span class="ms-select"><select data-snmp-mib-file>${files.map(o => `<option${o === file ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                    <button type="button" class="ms-btn ms-btn--filled" data-snmp-mib-download>Download</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const btn = rootEl.querySelector('[data-snmp-mib-download]');
        if (btn) btn.addEventListener('click', () => {
          const sel = rootEl.querySelector('[data-snmp-mib-file]');
          btn.dispatchEvent(new CustomEvent('eg71-snmp-mib-download', { bubbles: true, detail: { file: sel ? sel.value : '' } }));
        });
      }
    },
    {
      id: 'bc-eg71-event-tabs', cn: 'EG71 事件页签壳', cat: '系统设置',
      desc: 'Milesight 网关「Events」页双页签条：List / Notification（48px 白底 + 底分隔线，激活项主文字色 + 2px 蓝墨条，页签间距 24px）。页签为路由唯一源的只读投影，切换以 eg71-event-tab 冒泡事件对外通知，由宿主改路由后重渲染。',
      atoms: ['button', 'icon', 'space'],
      entityHint: 'gateway',
      tags: ['Events', '事件', '页签', 'Tabs', 'List', 'Notification', 'EG71'],
      render(ctx) {
        const TABS = [
          { key: 'list', cn: 'List' },
          { key: 'notification', cn: 'Notification' }
        ];
        const tab = ctx.tab === 'notification' ? 'notification' : 'list';
        return `<div class="bc-eg71-event-bar" role="tablist" aria-label="Events">
          ${TABS.map(t => `<button type="button" class="bc-eg71-event-tab${t.key === tab ? ' bc-eg71-event-tab--active' : ''}" role="tab" aria-selected="${t.key === tab}" data-event-tab="${t.key}"${t.key === tab ? '' : ' tabindex="-1"'}>${esc(t.cn)}</button>`).join('')}
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-event-tab]').forEach(b => b.addEventListener('click', () => {
          b.dispatchEvent(new CustomEvent('eg71-event-tab', { bubbles: true, detail: { tab: b.getAttribute('data-event-tab') } }));
        }));
      }
    },
    {
      id: 'bc-eg71-event-list', cn: 'EG71 事件列表', cat: '系统设置',
      desc: 'Events → List 双形态事件表（ctx.mode）：inbox 收件箱态（行复选 + 已读/未读 + 「Mark as Read」链接 + Mark ALL as Read / Delete 工具钮，六列）/ log 日志态（Export 主按钮，Time / Type / Message 三列）。两态共用 240px 定宽搜索 + 41px 斑马纹表格 + 分页器（左刷新与 Total 计数，右页码 / 每页条数 / 前往跳页）。Figma 两列同题「Type」为设计稿复制痕迹，实现语义 = 已读状态列 + 事件类型列，ctx.columns 可覆写表头文案。事件：eg71-event-search {keyword} / eg71-event-read {index} / eg71-event-read-all / eg71-event-delete / eg71-event-export / eg71-event-select {index, checked} / eg71-event-select-all {checked} / eg71-event-refresh / eg71-event-page {page} / eg71-event-page-size {size} / eg71-event-jump {page} / eg71-event-ops {index}。',
      atoms: ['table', 'checkbox', 'input', 'button', 'icon', 'pagination', 'select'],
      entityHint: 'gateway',
      tags: ['Events', '事件', '已读', 'Mark as Read', 'Delete', 'Export', '搜索', '分页', '斑马纹', 'EG71'],
      render(ctx) {
        const mode = ctx.mode === 'log' ? 'log' : 'inbox';
        const cols = Object.assign({ type: 'Type', type2: 'Type', time: 'Time', message: 'Message' }, ctx.columns || {});
        const rows = (ctx.rows && ctx.rows.length ? ctx.rows : [
          { read: true }, { read: false }, { read: false }
        ]).map(r => ({ checked: !!r.checked, read: !!r.read, type: r.type || '-', time: r.time || '2024-12-24 00:23:23', message: r.message || '-' }));
        const total = ctx.total != null ? ctx.total : 312;
        const size = ctx.size || 10;
        const page = Math.max(1, ctx.page || 1);
        const last = Math.max(1, Math.ceil(total / size));
        const win = [];
        for (let p = 1; p <= Math.min(5, last); p++) win.push(p);
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-event-toolbar">
                <div class="bc-eg71-event-toolbar-left">${mode === 'inbox'
                  ? `<button type="button" class="ms-btn" data-event-read-all>${ico('check', 16)}Mark ALL as Read</button>
                     <button type="button" class="ms-btn" data-event-delete>${ico('trash', 16)}Delete</button>`
                  : `<button type="button" class="ms-btn ms-btn--filled" data-event-export>${ico('download', 16)}Export</button>`}
                </div>
                <label class="ms-input bc-eg71-event-search"><input placeholder="Search" data-event-search value="${esc(ctx.keyword || '')}">${ico('search', 16)}</label>
              </div>
              <table class="bc-eg71-event-table">
                <thead><tr>
                  ${mode === 'inbox' ? `<th class="bc-eg71-event-col-check"><label class="ms-checkbox"><input type="checkbox" data-event-select-all aria-label="Select all"><span class="ms-checkbox-box"></span></label></th><th class="bc-eg71-event-col-type">${esc(cols.type)}</th>` : ''}
                  <th class="${mode === 'inbox' ? 'bc-eg71-event-col-type' : 'bc-eg71-event-col-type-l'}">${esc(mode === 'inbox' ? cols.type2 : cols.type)}</th>
                  <th class="${mode === 'inbox' ? 'bc-eg71-event-col-time' : 'bc-eg71-event-col-time-l'}">${esc(cols.time)}</th>
                  <th>${esc(cols.message)}</th>
                  ${mode === 'inbox' ? `<th class="bc-eg71-event-col-ops" aria-label="操作"></th>` : ''}
                </tr></thead>
                <tbody>
                  ${rows.map((r, i) => `<tr>
                    ${mode === 'inbox' ? `<td class="bc-eg71-event-col-check"><label class="ms-checkbox"><input type="checkbox" data-event-select="${i}"${r.checked ? ' checked' : ''}><span class="ms-checkbox-box"></span></label></td>` : ''}
                    ${mode === 'inbox' ? `<td>${r.read ? '<span class="bc-eg71-event-read">Read</span>' : `<button type="button" class="bc-eg71-event-link" data-event-read="${i}">Mark as Read</button>`}</td>` : ''}
                    <td>${esc(r.type)}</td>
                    <td>${esc(r.time)}</td>
                    <td>${esc(r.message)}</td>
                    ${mode === 'inbox' ? `<td class="bc-eg71-event-col-ops"><button type="button" class="bc-eg71-snmp-del" data-event-ops="${i}" aria-label="More">${ico('moreHoriz', 16)}</button></td>` : ''}
                  </tr>`).join('')}
                </tbody>
              </table>
              <div class="bc-eg71-event-pager">
                <div class="bc-eg71-event-pager-left">
                  <button type="button" class="ms-btn bc-eg71-event-refresh" data-event-refresh aria-label="Refresh">${ico('refresh', 16)}</button>
                  <span class="bc-eg71-event-total">Total:${total}</span>
                </div>
                <span class="ms-pagination">
                  <span class="ms-page-item" data-event-page="${Math.max(1, page - 1)}" aria-label="Previous">‹</span>
                  ${win.map(p => `<span class="ms-page-item${p === page ? ' ms-page-item--active' : ''}" data-event-page="${p}">${p}</span>`).join('')}
                  ${last > 5 ? `<span class="ms-page-item">…</span><span class="ms-page-item${page === last ? ' ms-page-item--active' : ''}" data-event-page="${last}">${last}</span>` : ''}
                  <span class="ms-page-item" data-event-page="${Math.min(last, page + 1)}" aria-label="Next">›</span>
                  <span class="ms-select ms-select--sm bc-eg71-event-pagesize"><select data-event-page-size aria-label="Page size">${[10, 20, 50].map(n => `<option value="${n}"${n === size ? ' selected' : ''}>${n}条/页</option>`).join('')}</select></span>
                  <span class="ms-page-jump">前往<input data-event-jump value="${page}" aria-label="Jump to page"></span>
                </span>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const fire = (el, ev, detail) => el.dispatchEvent(new CustomEvent(ev, { bubbles: true, detail: detail || {} }));
        rootEl.querySelectorAll('[data-event-search]').forEach(i => i.addEventListener('input', () => fire(i, 'eg71-event-search', { keyword: i.value })));
        rootEl.querySelectorAll('[data-event-read]').forEach(b => b.addEventListener('click', () => fire(b, 'eg71-event-read', { index: Number(b.getAttribute('data-event-read')) })));
        const readAll = rootEl.querySelector('[data-event-read-all]');
        if (readAll) readAll.addEventListener('click', () => fire(readAll, 'eg71-event-read-all'));
        const del = rootEl.querySelector('[data-event-delete]');
        if (del) del.addEventListener('click', () => fire(del, 'eg71-event-delete'));
        const exp = rootEl.querySelector('[data-event-export]');
        if (exp) exp.addEventListener('click', () => fire(exp, 'eg71-event-export'));
        rootEl.querySelectorAll('[data-event-select]').forEach(c => c.addEventListener('change', () => fire(c, 'eg71-event-select', { index: Number(c.getAttribute('data-event-select')), checked: c.checked })));
        const selAll = rootEl.querySelector('[data-event-select-all]');
        if (selAll) selAll.addEventListener('change', () => fire(selAll, 'eg71-event-select-all', { checked: selAll.checked }));
        const rf = rootEl.querySelector('[data-event-refresh]');
        if (rf) rf.addEventListener('click', () => fire(rf, 'eg71-event-refresh'));
        rootEl.querySelectorAll('[data-event-page]').forEach(p => p.addEventListener('click', () => fire(p, 'eg71-event-page', { page: Number(p.getAttribute('data-event-page')) })));
        const ps = rootEl.querySelector('[data-event-page-size]');
        if (ps) ps.addEventListener('change', () => fire(ps, 'eg71-event-page-size', { size: Number(ps.value) }));
        const jp = rootEl.querySelector('[data-event-jump]');
        if (jp) jp.addEventListener('change', () => fire(jp, 'eg71-event-jump', { page: Number(jp.value) }));
        rootEl.querySelectorAll('[data-event-ops]').forEach(b => b.addEventListener('click', () => fire(b, 'eg71-event-ops', { index: Number(b.getAttribute('data-event-ops')) })));
      }
    },
    {
      id: 'bc-eg71-event-notify', cn: 'EG71 事件通知矩阵', cat: '系统设置',
      desc: 'Events → Notification（矩阵版 92:16508）：「Enable」总闸 + Phone / Email for Notification 两个通知端下拉 + 12 类事件 × Record / Email 双动作开关矩阵（斑马纹，Events 列 344px，Email 列头带 help 图标）。总闸关闭时通知端与矩阵整体禁用。事件：eg71-event-notify-toggle {enabled} / eg71-event-phone {value} / eg71-event-mail {value} / eg71-event-record {index, enabled} / eg71-event-email {index, enabled}。',
      atoms: ['form', 'select', 'switch', 'table', 'icon'],
      entityHint: 'gateway',
      tags: ['Events', '事件通知', 'Record', 'Email', 'Phone', 'Cellular', 'WAN', 'VPN', 'UPS', '矩阵', 'EG71'],
      render(ctx) {
        const enabled = ctx.enabled !== false;
        const EVENTS = ctx.events && ctx.events.length ? ctx.events : [
          'Cellular Up', 'Cellular Down', 'WAN Up', 'WAN Down', 'VPN Up', 'VPN Down',
          'Power On', 'Connect to UPS External Power Supplies', 'Connect to UPS Internal Battery',
          'UPS Low Power (20%)', 'UPS Abnormal Charging', 'Disconnect the UPS'
        ];
        const rows = EVENTS.map(e => typeof e === 'string' ? { name: e, record: true, email: true } : { name: e.name || '', record: e.record !== false, email: e.email !== false });
        const phones = ctx.phoneOptions && ctx.phoneOptions.length ? ctx.phoneOptions : [''];
        const mails = ctx.mailOptions && ctx.mailOptions.length ? ctx.mailOptions : [''];
        const phone = ctx.phone != null && phones.indexOf(ctx.phone) >= 0 ? ctx.phone : phones[0];
        const mail = ctx.mail != null && mails.indexOf(ctx.mail) >= 0 ? ctx.mail : mails[0];
        const sw = (attr, on) => `<label class="ms-switch ms-switch--xs"><input type="checkbox" ${attr}${on ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>`;
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-event-head">
                <span class="ms-h4">Enable</span>
                ${sw('data-event-notify-toggle', enabled)}
              </div>
              <div class="bc-eg71-event-body${enabled ? '' : ' bc-eg71-event-body--disabled'}">
                <div class="bc-eg71-event-fieldsrow">
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Phone for Notification</label></div>
                    <span class="ms-select"><select data-event-phone>${phones.map(o => `<option${o === phone ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                  </div>
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">Email for Notification</label></div>
                    <span class="ms-select"><select data-event-mail>${mails.map(o => `<option${o === mail ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                  </div>
                </div>
                <table class="bc-eg71-event-table bc-eg71-event-table--stack">
                  <thead><tr>
                    <th class="bc-eg71-event-col-events">Events</th>
                    <th>Record</th>
                    <th><span class="bc-eg71-event-thhelp">Email${ico('question', 16)}</span></th>
                  </tr></thead>
                  <tbody>
                    ${rows.map((r, i) => `<tr>
                      <td class="bc-eg71-event-col-events">${esc(r.name)}</td>
                      <td>${sw(`data-event-record="${i}"`, r.record)}</td>
                      <td>${sw(`data-event-email="${i}"`, r.email)}</td>
                    </tr>`).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const t = rootEl.querySelector('[data-event-notify-toggle]');
        if (t) t.addEventListener('change', () => t.dispatchEvent(new CustomEvent('eg71-event-notify-toggle', { bubbles: true, detail: { enabled: t.checked } })));
        const ph = rootEl.querySelector('[data-event-phone]');
        if (ph) ph.addEventListener('change', () => ph.dispatchEvent(new CustomEvent('eg71-event-phone', { bubbles: true, detail: { value: ph.value } })));
        const ml = rootEl.querySelector('[data-event-mail]');
        if (ml) ml.addEventListener('change', () => ml.dispatchEvent(new CustomEvent('eg71-event-mail', { bubbles: true, detail: { value: ml.value } })));
        rootEl.querySelectorAll('[data-event-record]').forEach(s => s.addEventListener('change', () => s.dispatchEvent(new CustomEvent('eg71-event-record', { bubbles: true, detail: { index: Number(s.getAttribute('data-event-record')), enabled: s.checked } }))));
        rootEl.querySelectorAll('[data-event-email]').forEach(s => s.addEventListener('change', () => s.dispatchEvent(new CustomEvent('eg71-event-email', { bubbles: true, detail: { index: Number(s.getAttribute('data-event-email')), enabled: s.checked } }))));
      }
    },
    {
      id: 'bc-eg71-event-channel', cn: 'EG71 事件通知渠道卡', cat: '系统设置',
      desc: 'Events → Notification（渠道版 205:2483）：单渠道卡（SMS / Email / SNMP …，ctx.channel 为卡标题）= 标题 + 28×16 渠道开关 + Sender / Event Type 标签多选（tag 可删，chevron 展开选择）。渠道开关关闭仅禁用本卡字段，不影响其他渠道卡。事件：eg71-event-channel-toggle {channel, enabled} / eg71-event-tag-remove {field, index} / eg71-event-tag-open {field}。',
      atoms: ['form', 'switch', 'icon', 'tag', 'select'],
      entityHint: 'gateway',
      tags: ['Events', '通知渠道', 'SMS', 'Email', 'SNMP', 'Sender', 'Event Type', '标签多选', 'EG71'],
      render(ctx) {
        const channel = ctx.channel || 'SMS';
        const enabled = ctx.enabled !== false;
        const fields = (ctx.fields && ctx.fields.length ? ctx.fields : [
          { label: 'Sender', tags: ['+86 13860235632', 'Operation and Maintenance Group'] },
          { label: 'Event Type', tags: ['Ethernet goes online', 'VPN goes live'] }
        ]);
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-event-head" data-event-channel="${esc(channel)}">
                <span class="ms-h4">${esc(channel)}</span>
                <label class="ms-switch ms-switch--xs"><input type="checkbox" data-event-channel-toggle${enabled ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
              </div>
              <div class="bc-eg71-event-fieldsrow${enabled ? '' : ' bc-eg71-event-body--disabled'}">
                ${fields.map((f, fi) => `<div class="ms-form-item">
                  <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">${esc(f.label)}</label></div>
                  <div class="bc-eg71-event-tags" data-event-tag-open="${fi}" role="combobox" aria-expanded="false" tabindex="0">
                    ${(f.tags || []).map((t, ti) => `<span class="bc-eg71-event-tag">${esc(t)}<button type="button" class="bc-eg71-event-tagclose" data-event-tag-remove="${fi}:${ti}" aria-label="Remove ${esc(t)}">${ico('close', 14)}</button></span>`).join('')}
                    <span class="bc-eg71-event-tags-arrow">${ico('chevronDown', 16)}</span>
                  </div>
                </div>`).join('')}
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const t = rootEl.querySelector('[data-event-channel-toggle]');
        if (t) t.addEventListener('change', () => {
          const head = t.closest ? t.closest('[data-event-channel]') : null;
          t.dispatchEvent(new CustomEvent('eg71-event-channel-toggle', { bubbles: true, detail: { channel: head ? head.getAttribute('data-event-channel') : '', enabled: t.checked } }));
        });
        rootEl.querySelectorAll('[data-event-tag-remove]').forEach(b => b.addEventListener('click', e => {
          e.stopPropagation();
          const p = String(b.getAttribute('data-event-tag-remove')).split(':');
          b.dispatchEvent(new CustomEvent('eg71-event-tag-remove', { bubbles: true, detail: { field: Number(p[0]), index: Number(p[1]) } }));
        }));
        rootEl.querySelectorAll('[data-event-tag-open]').forEach(el => el.addEventListener('click', () => {
          el.dispatchEvent(new CustomEvent('eg71-event-tag-open', { bubbles: true, detail: { field: Number(el.getAttribute('data-event-tag-open')) } }));
        }));
      }
    },
    {
      id: 'bc-eg71-event-mqtt', cn: 'EG71 事件 MQTT 通知卡', cat: '系统设置',
      desc: 'Events → Notification（渠道版 205:2483 · MQTT 渠道）：标题 + 渠道开关 + 表格化配置：Event Type / MQTT connection（引用数据服务已建连接）/ Topic / Keep messages（复选）/ QoS（0·1·2）五列 + 行尾 more 操作 + 底部居中「添加」（45px 行高）。事件：eg71-event-mqtt-toggle {enabled} / eg71-event-mqtt-field {index, field, value} / eg71-event-mqtt-keep {index, checked} / eg71-event-mqtt-ops {index} / eg71-event-mqtt-add。',
      atoms: ['table', 'select', 'checkbox', 'switch', 'button', 'icon'],
      entityHint: 'gateway',
      tags: ['Events', 'MQTT', '通知渠道', 'Topic', 'QoS', 'Keep messages', '行内编辑', 'EG71'],
      render(ctx) {
        const enabled = ctx.enabled !== false;
        const conns = ctx.connections && ctx.connections.length ? ctx.connections : [''];
        const topics = ctx.topics && ctx.topics.length ? ctx.topics : ['All'];
        const qoss = ['QoS 0', 'QoS 1', 'QoS 2'];
        const rows = (ctx.rows && ctx.rows.length ? ctx.rows : [{ event: 'System Restart' }]).map(r => ({
          event: r.event || '',
          connection: r.connection != null && conns.indexOf(r.connection) >= 0 ? r.connection : conns[0],
          topic: r.topic != null && topics.indexOf(r.topic) >= 0 ? r.topic : topics[0],
          keep: !!r.keep,
          qos: qoss.indexOf(r.qos) >= 0 ? r.qos : 'QoS 1'
        }));
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-event-head" data-event-channel="MQTT">
                <span class="ms-h4">MQTT</span>
                <label class="ms-switch ms-switch--xs"><input type="checkbox" data-event-mqtt-toggle${enabled ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
              </div>
              <div class="${enabled ? '' : 'bc-eg71-event-body--disabled'}">
                <table class="bc-eg71-event-table bc-eg71-event-table--tall">
                  <thead><tr>
                    <th>Event Type</th><th>MQTT connection</th><th>Topic</th>
                    <th class="bc-eg71-event-col-keep">Keep messages</th><th>QoS</th>
                    <th class="bc-eg71-event-col-ops" aria-label="操作"></th>
                  </tr></thead>
                  <tbody>
                    ${rows.map((r, i) => `<tr>
                      <td>${esc(r.event)}</td>
                      <td><span class="ms-select ms-select--sm"><select data-event-mqtt-field="connection" data-index="${i}">${conns.map(o => `<option${o === r.connection ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span></td>
                      <td><span class="ms-select ms-select--sm"><select data-event-mqtt-field="topic" data-index="${i}">${topics.map(o => `<option${o === r.topic ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span></td>
                      <td class="bc-eg71-event-col-keep"><label class="ms-checkbox"><input type="checkbox" data-event-mqtt-keep="${i}"${r.keep ? ' checked' : ''}><span class="ms-checkbox-box"></span></label></td>
                      <td><span class="ms-select ms-select--sm"><select data-event-mqtt-field="qos" data-index="${i}">${qoss.map(o => `<option${o === r.qos ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span></td>
                      <td class="bc-eg71-event-col-ops"><button type="button" class="bc-eg71-snmp-del" data-event-mqtt-ops="${i}" aria-label="More">${ico('moreHoriz', 16)}</button></td>
                    </tr>`).join('')}
                  </tbody>
                </table>
                <div class="bc-eg71-snmp-addrow"><button type="button" class="ms-btn ms-btn--xs" data-event-mqtt-add>添加</button></div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const t = rootEl.querySelector('[data-event-mqtt-toggle]');
        if (t) t.addEventListener('change', () => t.dispatchEvent(new CustomEvent('eg71-event-mqtt-toggle', { bubbles: true, detail: { enabled: t.checked } })));
        rootEl.querySelectorAll('[data-event-mqtt-field]').forEach(s => s.addEventListener('change', () => s.dispatchEvent(new CustomEvent('eg71-event-mqtt-field', { bubbles: true, detail: { index: Number(s.getAttribute('data-index')), field: s.getAttribute('data-event-mqtt-field'), value: s.value } }))));
        rootEl.querySelectorAll('[data-event-mqtt-keep]').forEach(c => c.addEventListener('change', () => c.dispatchEvent(new CustomEvent('eg71-event-mqtt-keep', { bubbles: true, detail: { index: Number(c.getAttribute('data-event-mqtt-keep')), checked: c.checked } }))));
        rootEl.querySelectorAll('[data-event-mqtt-ops]').forEach(b => b.addEventListener('click', () => b.dispatchEvent(new CustomEvent('eg71-event-mqtt-ops', { bubbles: true, detail: { index: Number(b.getAttribute('data-event-mqtt-ops')) } }))));
        const add = rootEl.querySelector('[data-event-mqtt-add]');
        if (add) add.addEventListener('click', () => add.dispatchEvent(new CustomEvent('eg71-event-mqtt-add', { bubbles: true })));
      }
    },

    /* ---------- EG71 应用 APP（B_Eg71App* · Node RED / Python 三页签 · Figma 41:19864） ---------- */
    {
      id: 'bc-eg71-app-tabs',
      cn: 'EG71 应用页签壳',
      cat: '应用管理',
      desc: 'APP 菜单 Python 页三页签（Python / AppManager Configuration / Python APP），48px 白底 + 2px 墨条',
      atoms: ['S_Tab'],
      entityHint: 'gateway',
      tags: ['app', 'python', 'tabs', '页签'],
      render(ctx) {
        ctx = ctx || {};
        const tabs = ctx.tabs && ctx.tabs.length ? ctx.tabs : [
          { key: 'python', label: 'Python' },
          { key: 'manager', label: 'AppManager Configuration' },
          { key: 'app', label: 'Python APP' }
        ];
        const cur = ctx.tab || 'python';
        return `<div class="bc-eg71-app-bar">${tabs.map(t =>
          `<button type="button" class="bc-eg71-app-tab${t.key === cur ? ' bc-eg71-app-tab--active' : ''}" data-app-tab="${esc(t.key)}">${esc(t.label)}</button>`).join('')}</div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-app-tab]').forEach(b => b.addEventListener('click', () =>
          b.dispatchEvent(new CustomEvent('eg71-app-tab', { bubbles: true, detail: { tab: b.getAttribute('data-app-tab') } }))));
      }
    },
    {
      id: 'bc-eg71-app-nodered',
      cn: 'EG71 Node RED 应用卡',
      cat: '应用管理',
      desc: 'APP 菜单 Node RED 页：Enable 开关 + Reset/Export/Launch 头部按钮 + 版本只读 + Node Library 升级导入；禁用收起内容并禁用按钮（41:18749 / 41:19865 双态）',
      atoms: ['S_Switch', 'S_Form', 'S_Select', 'S_Button', 'S_Card'],
      entityHint: 'gateway',
      tags: ['app', 'nodered', '升级', '开关', '只读'],
      render(ctx) {
        ctx = ctx || {};
        const enabled = ctx.enabled !== false;
        const files = ctx.upgradeFiles && ctx.upgradeFiles.length ? ctx.upgradeFiles : [''];
        const file = files.indexOf(ctx.file) >= 0 ? ctx.file : files[0];
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-app-head">
                <span class="ms-h4">Enable</span>
                <label class="ms-switch ms-switch--xs"><input type="checkbox" data-app-nodered-toggle${enabled ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
                <div class="bc-eg71-app-head-actions">
                  <button type="button" class="ms-btn" data-app-nodered-reset${enabled ? '' : ' disabled'}>Reset</button>
                  <button type="button" class="ms-btn" data-app-nodered-export${enabled ? '' : ' disabled'}>Export</button>
                  <button type="button" class="ms-btn ms-btn--primary" data-app-nodered-launch${enabled ? '' : ' disabled'}>Launch</button>
                </div>
              </div>
              ${enabled ? `<div class="bc-eg71-app-body">
                <div class="bc-eg71-app-fieldsrow">
                  <div class="ms-form-item">
                    <label class="ms-form-label">Node-RED Version</label>
                    <label class="ms-input ms-input--disabled"><input value="${esc(ctx.nodeRedVersion != null ? ctx.nodeRedVersion : '3.0.2')}" readonly></label>
                  </div>
                  <div class="ms-form-item">
                    <label class="ms-form-label">Node Library Version</label>
                    <label class="ms-input ms-input--disabled"><input value="${esc(ctx.nodeLibraryVersion != null ? ctx.nodeLibraryVersion : '1.0.13')}" readonly></label>
                  </div>
                </div>
                <div class="bc-eg71-app-fieldsrow">
                  <div class="bc-eg71-app-inline">
                    <div class="ms-form-item">
                      <label class="ms-form-label">Upgrade Node Library</label>
                      <span class="ms-select ms-select--sm"><select data-app-nodered-file>${files.map(o => `<option${o === file ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                    </div>
                    <button type="button" class="ms-btn ms-btn--primary" data-app-nodered-import>Import</button>
                    <button type="button" class="ms-btn" data-app-nodered-upgrade${file ? '' : ' disabled'}>Upgrade</button>
                  </div>
                </div>
              </div>` : ''}
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const t = rootEl.querySelector('[data-app-nodered-toggle]');
        if (t) t.addEventListener('change', () => t.dispatchEvent(new CustomEvent('eg71-app-nodered-toggle', { bubbles: true, detail: { enabled: t.checked } })));
        ['reset', 'export', 'launch', 'import', 'upgrade'].forEach(act => {
          const b = rootEl.querySelector('[data-app-nodered-' + act + ']');
          if (b) b.addEventListener('click', () => b.dispatchEvent(new CustomEvent('eg71-app-nodered-' + act, { bubbles: true })));
        });
        const sel = rootEl.querySelector('[data-app-nodered-file]');
        if (sel) sel.addEventListener('change', () => sel.dispatchEvent(new CustomEvent('eg71-app-nodered-file', { bubbles: true, detail: { value: sel.value } })));
      }
    },
    {
      id: 'bc-eg71-app-sdk',
      cn: 'EG71 AppManager 状态卡',
      cat: '应用管理',
      desc: 'Python 页签 AppManager Status 卡：状态标签 + SDK Version/Path 只读 + Available Storage 选择 + Upgrade Files 导入升级（92:19752）',
      atoms: ['S_Form', 'S_Select', 'S_Button', 'S_Tag', 'S_Card'],
      entityHint: 'gateway',
      tags: ['app', 'python', 'sdk', '升级', '状态标签'],
      render(ctx) {
        ctx = ctx || {};
        const status = ctx.status || 'Uninstalled';
        const storages = ctx.storages && ctx.storages.length ? ctx.storages : ['Local'];
        const storage = storages.indexOf(ctx.storage) >= 0 ? ctx.storage : storages[0];
        const files = ctx.upgradeFiles && ctx.upgradeFiles.length ? ctx.upgradeFiles : [''];
        const file = files.indexOf(ctx.file) >= 0 ? ctx.file : files[0];
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body bc-eg71-app-card--tight">
              <div class="bc-eg71-app-head">
                <span class="ms-h4">AppManager Status</span>
                <span class="bc-eg71-app-tag">${esc(status)}</span>
              </div>
              <div class="bc-eg71-app-body">
                <div class="bc-eg71-app-fieldsrow">
                  <div class="ms-form-item">
                    <label class="ms-form-label">SDK Version</label>
                    <label class="ms-input ms-input--disabled"><input value="${esc(ctx.sdkVersion || '')}" readonly></label>
                  </div>
                  <div class="ms-form-item">
                    <label class="ms-form-label">SDK Path</label>
                    <label class="ms-input ms-input--disabled"><input value="${esc(ctx.sdkPath || '')}" readonly></label>
                  </div>
                </div>
                <div class="bc-eg71-app-fieldsrow">
                  <div class="ms-form-item">
                    <label class="ms-form-label">Available Storage</label>
                    <span class="ms-select ms-select--sm"><select data-app-sdk-storage>${storages.map(o => `<option${o === storage ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                  </div>
                  <div class="bc-eg71-app-inline">
                    <div class="ms-form-item">
                      <label class="ms-form-label">Upgrade Files</label>
                      <span class="ms-select ms-select--sm"><select data-app-sdk-file>${files.map(o => `<option${o === file ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>
                    </div>
                    <button type="button" class="ms-btn ms-btn--primary" data-app-sdk-import>Import</button>
                    <button type="button" class="ms-btn" data-app-sdk-upgrade${file ? '' : ' disabled'}>Upgrade</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        [['storage', 'eg71-app-sdk-storage'], ['file', 'eg71-app-sdk-file']].forEach(pair => {
          const s = rootEl.querySelector('[data-app-sdk-' + pair[0] + ']');
          if (s) s.addEventListener('change', () => s.dispatchEvent(new CustomEvent(pair[1], { bubbles: true, detail: { value: s.value } })));
        });
        ['import', 'upgrade'].forEach(act => {
          const b = rootEl.querySelector('[data-app-sdk-' + act + ']');
          if (b) b.addEventListener('click', () => b.dispatchEvent(new CustomEvent('eg71-app-sdk-' + act, { bubbles: true })));
        });
      }
    },
    {
      id: 'bc-eg71-app-manager',
      cn: 'EG71 AppManager 管理页',
      cat: '应用管理',
      desc: 'AppManager Configuration 页签：Enable 总闸 + App Management 表（ID/命令/日志上限/卸载开关）+ App Status 表（名称/版本/SDK），空表显 No data 空态（41:33359）',
      atoms: ['S_Switch', 'S_Table', 'S_Title', 'S_Icon', 'S_Card'],
      entityHint: 'gateway',
      tags: ['app', 'appmanager', '表格', '空态', '总闸'],
      render(ctx) {
        ctx = ctx || {};
        const enabled = ctx.enabled !== false;
        const manage = ctx.manageRows || [];
        const status = ctx.statusRows || [];
        const empty = `<div class="bc-eg71-app-empty">${ico('data', 32)}<span>No data</span></div>`;
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-app-head">
                <span class="ms-h4">Enable</span>
                <label class="ms-switch ms-switch--xs"><input type="checkbox" data-app-manager-toggle${enabled ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>
              </div>
              <div class="${enabled ? '' : 'bc-eg71-event-body--disabled'}">
                <div class="bc-eg71-app-subcard">
                  <div class="bc-eg71-app-subhead"><span class="ms-h4">App Management</span></div>
                  ${manage.length ? `<table class="bc-eg71-app-table">
                    <thead><tr>
                      <th class="bc-eg71-app-col-id">ID</th><th>App Command</th>
                      <th>Logfile Size <span class="bc-eg71-app-thunit">(MB)</span></th><th>Uninstall</th>
                    </tr></thead>
                    <tbody>${manage.map((r, i) => `<tr>
                      <td class="bc-eg71-app-col-id">${esc(r.id != null ? r.id : i + 1)}</td>
                      <td>${esc(r.command || '')}</td>
                      <td>${esc(r.logSize != null ? r.logSize : '-')}</td>
                      <td><label class="ms-switch ms-switch--xs"><input type="checkbox" data-app-uninstall="${i}"${r.uninstall ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label></td>
                    </tr>`).join('')}</tbody>
                  </table>` : empty}
                </div>
                <div class="bc-eg71-app-subcard">
                  <div class="bc-eg71-app-subhead"><span class="ms-h4">App Status</span></div>
                  ${status.length ? `<table class="bc-eg71-app-table">
                    <thead><tr><th>App Name</th><th>App Version</th><th>SDK Version</th></tr></thead>
                    <tbody>${status.map(r => `<tr>
                      <td>${esc(r.name || '')}</td><td>${esc(r.version || '-')}</td><td>${esc(r.sdk || '-')}</td>
                    </tr>`).join('')}</tbody>
                  </table>` : empty}
                </div>
              </div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const t = rootEl.querySelector('[data-app-manager-toggle]');
        if (t) t.addEventListener('change', () => t.dispatchEvent(new CustomEvent('eg71-app-manager-toggle', { bubbles: true, detail: { enabled: t.checked } })));
        rootEl.querySelectorAll('[data-app-uninstall]').forEach(s => s.addEventListener('change', () =>
          s.dispatchEvent(new CustomEvent('eg71-app-uninstall', { bubbles: true, detail: { index: Number(s.getAttribute('data-app-uninstall')), enabled: s.checked } }))));
      }
    },
    {
      id: 'bc-eg71-app-card',
      cn: 'EG71 应用导入卡',
      cat: '应用管理',
      desc: '通用「标题 + 两列字段行 + 行内主钮」导入卡：Import App Package / Import App Configuration / Debug Script 三卡同形态复用（92:19840）',
      atoms: ['S_Form', 'S_Select', 'S_Input', 'S_Button', 'S_Card'],
      entityHint: 'gateway',
      tags: ['app', '导入', '配置', '通用卡'],
      render(ctx) {
        ctx = ctx || {};
        const rows = ctx.rows || [];
        const cellHtml = (cell, r, c) => {
          const ctl = cell.type === 'input'
            ? `<span class="ms-input"><input data-app-card-field="${r}:${c}" value="${esc(cell.value || '')}"${cell.placeholder ? ` placeholder="${esc(cell.placeholder)}"` : ''}></span>`
            : `<span class="ms-select ms-select--sm"><select data-app-card-field="${r}:${c}">${(cell.options && cell.options.length ? cell.options : ['']).map(o => `<option${o === cell.value ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>`;
          const inner = `<div class="ms-form-item"><label class="ms-form-label">${esc(cell.label || '')}</label>${ctl}</div>`;
          if (!cell.button) return inner;
          const b = cell.button;
          return `<div class="bc-eg71-app-inline">${inner}<button type="button" class="ms-btn${b.kind === 'primary' ? ' ms-btn--primary' : ''}" data-app-card-button="${r}:${c}"${b.disabled ? ' disabled' : ''}>${esc(b.label)}</button></div>`;
        };
        return `<div class="bc-eg71-maint-body">
          <section class="ms-card">
            <div class="ms-card-body">
              <div class="bc-eg71-app-head"><span class="ms-h4">${esc(ctx.title || '')}</span></div>
              ${rows.map((row, r) => `<div class="bc-eg71-app-fieldsrow">${(Array.isArray(row) ? row : []).map((cell, c) => cellHtml(cell, r, c)).join('')}</div>`).join('')}
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-app-card-field]').forEach(s => s.addEventListener('change', () => {
          const pos = s.getAttribute('data-app-card-field').split(':');
          s.dispatchEvent(new CustomEvent('eg71-app-card-field', { bubbles: true, detail: { row: Number(pos[0]), col: Number(pos[1]), value: s.value } }));
        }));
        rootEl.querySelectorAll('[data-app-card-button]').forEach(b => b.addEventListener('click', () => {
          const pos = b.getAttribute('data-app-card-button').split(':');
          b.dispatchEvent(new CustomEvent('eg71-app-card-button', { bubbles: true, detail: { row: Number(pos[0]), col: Number(pos[1]) } }));
        }));
      }
    },
    /* ==================== EG71 · REQ-012 LoRaWAN 扫描入网（7 新组件） ==================== */
    {
      id: 'bc-eg71-alert-bar', cn: '页内业务横幅', cat: '反馈',
      desc: 'EG71 页内业务横幅：S_Alert 的业务封装（info 引导 / error 异常），标题可选、正文必填（desc 为空整体不渲染），可带关闭钮；关闭以 eg71-alert-close 冒泡事件对外通知。扫描 Key 导入 4 种失败场景横幅与页内引导横幅共用本组件。',
      atoms: ['alert', 'icon'],
      entityHint: 'gateway',
      tags: ['横幅', 'Alert', '提示', '引导', '导入失败', '异常', 'EG71'],
      render(ctx) {
        ctx = ctx || {};
        if (!ctx.desc) return '';
        const tone = ctx.tone === 'error' ? 'error' : 'info';
        const icon = tone === 'error' ? 'warn' : 'info';
        return `<div class="bc-eg71-alert-bar">
          <div class="ms-alert ms-alert--${tone}">
            <span class="ms-alert-icon">${ico(icon, 16)}</span>
            <div class="ms-alert-body">
              ${ctx.title ? `<div class="ms-alert-title">${esc(ctx.title)}</div>` : ''}
              <div class="ms-alert-desc">${esc(ctx.desc)}</div>
            </div>
            ${ctx.closable ? `<button type="button" class="bc-eg71-alert-close" data-alert-close aria-label="关闭">${ico('close', 16)}</button>` : ''}
          </div>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('[data-alert-close]').forEach(btn => btn.addEventListener('click', () => {
          const bar = btn.closest('.bc-eg71-alert-bar');
          if (bar) bar.hidden = true;
          btn.dispatchEvent(new CustomEvent('eg71-alert-close', { bubbles: true, detail: {} }));
        }));
      }
    },
    {
      id: 'bc-eg71-scan-banner', cn: '全局扫描提示条', cat: '数据服务',
      desc: 'EG71 LoRaWAN 全局扫描提示条：扫描中常驻，LoRaWAN 图标 + 红点/未添加设备数角标（active 态蓝、visited 态去红点变灰、设备数保留）；整条可点击跳扫描确认页。结构类 div + data-route 委托（迁移自 bc-eg71-protocol-card，不嵌 <a>），点击以 eg71-scan-navigate {route} 冒泡。',
      atoms: ['icon', 'badge', 'typography'],
      entityHint: 'gateway',
      tags: ['扫描', 'LoRaWAN', '全局提示', '红点', '角标', '导航', 'EG71'],
      render(ctx) {
        ctx = ctx || {};
        if (!ctx.scanning) return '';
        const visited = !!ctx.visited;
        const count = Number(ctx.unaddedCount || 0);
        const route = ctx.route || '/data-services/data-acquisition/lorawan-scan/confirm';
        const badge = count > 0 ? `${visited ? '' : '<i class="ms-badge-dot"></i>'}<span class="ms-badge-count">${esc(count)}</span>` : '';
        return `<div class="bc-eg71-scan-banner${visited ? ' bc-eg71-scan-banner--visited' : ' bc-eg71-scan-banner--active'}" data-route="${esc(route)}" role="link" tabindex="0" aria-label="查看扫描确认页">
          <span class="ms-badge bc-eg71-scan-banner-badge">${ico('lorawan', 20)}${badge}</span>
          <span class="ms-text bc-eg71-scan-banner-text">正在LoRaWAN扫描中</span>
          <span class="ms-text ms-text--secondary ms-text--sm bc-eg71-scan-banner-count">未添加设备 <b class="bc-num">${esc(count)}</b></span>
          <span class="bc-eg71-scan-banner-arrow">${ico('chevronRight', 16)}</span>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('.bc-eg71-scan-banner[data-route]').forEach(el => {
          el.addEventListener('click', () => {
            el.dispatchEvent(new CustomEvent('eg71-scan-navigate', { bubbles: true, detail: { route: el.getAttribute('data-route'), visited: el.classList.contains('bc-eg71-scan-banner--visited') } }));
          });
          el.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
          });
        });
      }
    },
    {
      id: 'bc-eg71-activation-card', cn: '激活设置灰卡', cat: '数据服务',
      desc: 'EG71 LoRaWAN 激活设置灰卡：单选组「默认值/自定义值」（非 Milesight 设备禁用默认值）+ AppKey 输入（32 位十六进制校验；OTAA 态才渲染，ABP 态只渲染单选组）。单选切换保留已输入 AppKey（交互 #8）；切换以 eg71-activation-change {kind, mode, appKey} 冒泡，输入以 eg71-activation-appkey {value, valid} 冒泡。ABP 默认值置灰联动由消费方（bc-eg71-device-form）监听 eg71-activation-change 实现，本组件不越界。',
      atoms: ['radio', 'form', 'input', 'icon'],
      entityHint: 'device',
      tags: ['激活', 'OTAA', 'ABP', 'AppKey', '默认值', '自定义值', 'LoRaWAN', 'EG71'],
      render(ctx) {
        ctx = ctx || {};
        const kind = ctx.kind === 'abp' ? 'abp' : 'otaa';
        const value = ctx.value || {};
        const mode = value.mode === 'custom' ? 'custom' : 'default';
        const appKey = value.appKey || '';
        const milesight = !!ctx.milesight;
        const readonly = !!ctx.readonly;
        const keyBad = !!appKey && !/^[0-9A-Fa-f]{32}$/.test(appKey);
        const radioBtn = (label, val, disabled) => `<span class="ms-radio-btn${mode === val ? ' ms-radio-btn--checked' : ''}${disabled ? ' bc-eg71-activation-btn--disabled' : ''}" role="radio" aria-checked="${mode === val}" aria-disabled="${disabled ? 'true' : 'false'}" tabindex="-1" data-activation-mode="${val}">${esc(label)}</span>`;
        return `<div class="ms-form-item bc-eg71-subarea bc-eg71-activation-card" data-activation-kind="${kind}">
          <div class="bc-eg71-form-item-labelrow">
            <label class="ms-form-label ms-form-label--required">${kind === 'otaa' ? '激活设置（OTAA）' : '激活设置（ABP）'}${ico('info', 16)}</label>
          </div>
          <div class="ms-radio-btn-group bc-eg71-form-item-radio-group bc-eg71-activation-group" role="radiogroup" aria-label="激活设置">
            ${radioBtn('默认值', 'default', !milesight)}
            ${radioBtn('自定义值', 'custom', false)}
          </div>
          ${kind === 'otaa' ? `<div class="bc-eg71-activation-key">
            <div class="bc-eg71-form-item-labelrow">
              <label class="ms-form-label ms-form-label--required">应用程序密钥 AppKey${ico('info', 16)}</label>
              <span class="bc-eg71-form-item-count">${appKey.length}/32</span>
            </div>
            <label class="ms-input${keyBad ? ' ms-input--error' : ''}${readonly ? ' ms-input--disabled' : ''}">
              <input data-activation-appkey value="${esc(appKey)}" maxlength="32" placeholder="请输入 32 位十六进制 AppKey"${readonly ? ' readonly' : ''}>
            </label>
            <div class="bc-eg71-form-item-msg${keyBad ? ' bc-eg71-form-item-msg--error' : ''}">${keyBad ? 'AppKey 必须为 32 位十六进制字符（0-9 / A-F）' : 'Milesight 设备默认密钥出厂内置；自定义值需与节点侧配置一致。'}</div>
          </div>` : ''}
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        rootEl.querySelectorAll('.bc-eg71-activation-group').forEach(group => {
          const card = group.closest('.bc-eg71-activation-card');
          if (!card) return;
          group.querySelectorAll('.ms-radio-btn[data-activation-mode]').forEach(btn => {
            if (btn.getAttribute('aria-disabled') === 'true') return;
            btn.addEventListener('click', () => {
              const mode = btn.getAttribute('data-activation-mode');
              group.querySelectorAll('.ms-radio-btn').forEach(b => {
                const on = b === btn;
                b.classList.toggle('ms-radio-btn--checked', on);
                b.setAttribute('aria-checked', on ? 'true' : 'false');
              });
              // 交互 #8：切换只读输入框取当前值，绝不清空（保留用户输入）
              const keyInput = card.querySelector('[data-activation-appkey]');
              btn.dispatchEvent(new CustomEvent('eg71-activation-change', { bubbles: true, detail: { kind: card.getAttribute('data-activation-kind') || 'otaa', mode, appKey: keyInput ? keyInput.value : '' } }));
            });
          });
        });
        rootEl.querySelectorAll('[data-activation-appkey]').forEach(input => {
          const card = input.closest('.bc-eg71-activation-card');
          const syncErr = () => {
            if (!card) return;
            const count = card.querySelector('.bc-eg71-form-item-count');
            if (count) count.textContent = input.value.length + '/32';
            const bad = !!input.value && !/^[0-9A-Fa-f]{32}$/.test(input.value);
            const box = input.closest('.ms-input');
            if (box) box.classList.toggle('ms-input--error', bad);
            const msg = card.querySelector('.bc-eg71-form-item-msg');
            if (msg) {
              msg.classList.toggle('bc-eg71-form-item-msg--error', bad);
              msg.textContent = bad ? 'AppKey 必须为 32 位十六进制字符（0-9 / A-F）' : 'Milesight 设备默认密钥出厂内置；自定义值需与节点侧配置一致。';
            }
          };
          input.addEventListener('input', syncErr);
          input.addEventListener('change', () => {
            syncErr();
            input.dispatchEvent(new CustomEvent('eg71-activation-appkey', { bubbles: true, detail: { value: input.value, valid: /^[0-9A-Fa-f]{32}$/.test(input.value) } }));
          });
        });
      }
    },
    {
      id: 'bc-eg71-scan-appkey-card', cn: '扫描 Key 配置卡', cat: '数据服务',
      desc: 'EG71 LoRaWAN 扫描配置卡：Milesight 默认 Key 勾选 + 自定义 AppKey 列表（逐条添加 / CSV 文件导入 / 搜索过滤 / 危险描边清空——仅清自定义 Key、无确认弹窗）+ N/1000 容量计数。勾选/增/删/搜索以 eg71-scan-keys-change {keys, defaultKeyChecked, canStart} 冒泡（canStart = 默认勾选 || 自定义非空，驱动【开始扫描】置灰）；导入 4 种失败场景以 eg71-scan-import-error {case: size|count|no-header|invalid, remaining?} 冒泡，由页内 bc-eg71-alert-bar 横幅呈现。',
      atoms: ['checkbox', 'button', 'upload', 'input', 'tag', 'icon', 'empty'],
      entityHint: 'gateway',
      tags: ['扫描', 'AppKey', 'LoRaWAN', '导入', 'CSV', '清空', '搜索', 'EG71'],
      render(ctx) {
        ctx = ctx || {};
        const keys = Array.isArray(ctx.keys) ? ctx.keys.slice() : [];
        const maxKeys = ctx.maxKeys != null ? ctx.maxKeys : 1000;
        const keyword = ctx.keyword || '';
        const defaultChecked = ctx.defaultKeyChecked !== false;
        const rowHtml = k => `<div class="bc-eg71-scan-key-row" data-scan-key="${esc(k)}">
            <span class="ms-text bc-num bc-eg71-scan-key-text">${esc(k)}</span>
            <button type="button" class="bc-eg71-scan-key-del" data-scan-key-del="${esc(k)}" aria-label="删除该 Key">${ico('trash', 16)}</button>
          </div>`;
        const listHtml = keys.length
          ? keys.map(rowHtml).join('')
          : '';
        return `<div class="bc-eg71-scan-appkey-card" data-scan-max="${esc(maxKeys)}">
          <section class="ms-card">
            <div class="ms-card-body bc-eg71-scan-key-body">
              <label class="ms-checkbox bc-eg71-scan-key-default"><input type="checkbox" data-scan-key-default${defaultChecked ? ' checked' : ''}><span class="ms-checkbox-box"></span><span class="ms-text">Milesight 默认 AppKey</span></label>
              <div class="ms-space ms-space--12 bc-eg71-scan-key-actions">
                <button type="button" class="ms-btn" data-scan-key-import>${ico('download', 16)}导入文件</button>
                <button type="button" class="ms-btn ms-btn--danger" data-scan-key-clear${keys.length ? '' : ' disabled'}>${ico('trash', 16)}清空</button>
                <label class="ms-upload bc-eg71-scan-key-upload" hidden><input type="file" accept=".csv,.xlsx" data-scan-key-file></label>
              </div>
              <label class="ms-input bc-eg71-scan-key-search"><input data-scan-key-search value="${esc(keyword)}" placeholder="搜索 AppKey">${ico('search', 16)}</label>
              <div class="bc-eg71-scan-key-head">
                <span class="ms-h5">自定义 AppKey</span>
                <span class="ms-tag ms-tag--round ms-tag--outline">${keys.length}/${esc(maxKeys)}</span>
              </div>
              <div class="bc-eg71-scan-key-list" data-scan-key-list${keys.length ? '' : ' hidden'}>${listHtml}</div>
              <div class="bc-eg71-scan-key-empty"${keys.length ? ' hidden' : ''}><div class="ms-empty"><span class="ms-empty-illu">${ico('lorawan', 32)}</span><div class="ms-empty-text">暂无自定义 AppKey，可逐条添加或从文件导入</div></div></div>
              <div class="bc-eg71-scan-key-addrow">
                <label class="ms-input"><input data-scan-key-input maxlength="32" placeholder="请输入 32 位十六进制 AppKey"></label>
                <button type="button" class="ms-btn" data-scan-key-add>${ico('plus', 16)}添加</button>
              </div>
              <div class="bc-eg71-form-item-msg bc-eg71-scan-key-msg" hidden></div>
            </div>
          </section>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const card = rootEl.classList && rootEl.classList.contains('bc-eg71-scan-appkey-card') ? rootEl : rootEl.querySelector('.bc-eg71-scan-appkey-card');
        if (!card) return;
        const maxKeys = Number(card.getAttribute('data-scan-max')) || 1000;
        const listEl = card.querySelector('[data-scan-key-list]');
        const emptyEl = card.querySelector('.bc-eg71-scan-key-empty');
        const countTag = card.querySelector('.bc-eg71-scan-key-head .ms-tag');
        const clearBtn = card.querySelector('[data-scan-key-clear]');
        const searchInput = card.querySelector('[data-scan-key-search]');
        const addInput = card.querySelector('[data-scan-key-input]');
        const msgEl = card.querySelector('.bc-eg71-scan-key-msg');
        const defaultBox = card.querySelector('[data-scan-key-default]');
        const fire = (ev, detail) => card.dispatchEvent(new CustomEvent(ev, { bubbles: true, detail }));
        let keys = Array.prototype.slice.call(card.querySelectorAll('[data-scan-key-del]')).map(b => b.getAttribute('data-scan-key-del'));
        const canStart = () => !!(defaultBox && defaultBox.checked) || keys.length > 0;
        const notify = () => fire('eg71-scan-keys-change', { keys: keys.slice(), defaultKeyChecked: !!(defaultBox && defaultBox.checked), canStart: canStart() });
        const setMsg = (text, isErr) => {
          if (!msgEl) return;
          if (!text) { msgEl.hidden = true; msgEl.textContent = ''; }
          else { msgEl.hidden = false; msgEl.textContent = text; }
          msgEl.classList.toggle('bc-eg71-form-item-msg--error', !!isErr);
        };
        const rowHtml = k => `<div class="bc-eg71-scan-key-row" data-scan-key="${esc(k)}"><span class="ms-text bc-num bc-eg71-scan-key-text">${esc(k)}</span><button type="button" class="bc-eg71-scan-key-del" data-scan-key-del="${esc(k)}" aria-label="删除该 Key">${ico('trash', 16)}</button></div>`;
        const applyFilter = () => {
          const kw = ((searchInput && searchInput.value) || '').trim().toLowerCase();
          card.querySelectorAll('.bc-eg71-scan-key-row').forEach(row => {
            const k = row.getAttribute('data-scan-key') || '';
            row.hidden = !!kw && k.toLowerCase().indexOf(kw) < 0;
          });
        };
        const sync = () => {
          if (countTag) countTag.textContent = keys.length + '/' + maxKeys;
          if (clearBtn) clearBtn.disabled = keys.length === 0;
          if (listEl) listEl.hidden = keys.length === 0;
          if (emptyEl) emptyEl.hidden = keys.length > 0;
          applyFilter();
        };
        if (defaultBox) defaultBox.addEventListener('change', notify);
        if (searchInput) searchInput.addEventListener('input', () => { applyFilter(); notify(); });
        // 删除行：容器级事件委托（增删后无需重挂）
        if (listEl) listEl.addEventListener('click', e => {
          const btn = e.target && e.target.closest ? e.target.closest('[data-scan-key-del]') : null;
          if (!btn) return;
          const k = btn.getAttribute('data-scan-key-del');
          keys = keys.filter(x => x !== k);
          const row = btn.closest('.bc-eg71-scan-key-row');
          if (row) row.remove();
          sync(); notify();
        });
        if (clearBtn) clearBtn.addEventListener('click', () => {
          // 仅清空自定义 Key（不动默认 Key 勾选），危险描边 + 无确认弹窗（mapping §4.2）
          keys = [];
          if (listEl) listEl.innerHTML = '';
          sync(); notify();
        });
        const addBtn = card.querySelector('[data-scan-key-add]');
        if (addBtn) addBtn.addEventListener('click', () => {
          const v = ((addInput && addInput.value) || '').trim();
          if (!v) { setMsg('请输入 AppKey 后再添加', true); return; }
          if (!/^[0-9A-Fa-f]{32}$/.test(v)) { setMsg('AppKey 必须为 32 位十六进制字符（0-9 / A-F）', true); return; }
          if (keys.indexOf(v) >= 0) { setMsg('该 AppKey 已存在', true); return; }
          if (keys.length >= maxKeys) { setMsg('自定义 AppKey 数量已达上限 ' + maxKeys, true); return; }
          keys.push(v);
          if (listEl) listEl.insertAdjacentHTML('beforeend', rowHtml(v));
          if (addInput) addInput.value = '';
          setMsg('', false); sync(); notify();
        });
        const importBtn = card.querySelector('[data-scan-key-import]');
        const fileInput = card.querySelector('[data-scan-key-file]');
        if (importBtn && fileInput) importBtn.addEventListener('click', () => fileInput.click());
        if (fileInput) fileInput.addEventListener('change', () => {
          const f = fileInput.files && fileInput.files[0];
          fileInput.value = '';
          if (!f) return;
          const fail = c => fire('eg71-scan-import-error', c === 'count' ? { case: 'count', remaining: Math.max(0, maxKeys - keys.length) } : { case: c });
          const name = f.name || '';
          if (!/\.(csv|xlsx)$/i.test(name)) return fail('invalid');
          if (f.size > 1 * 1024 * 1024) return fail('size');
          const done = text => {
            const lines = String(text || '').split(/\r?\n/).filter(l => l.trim());
            if (!lines.length || !/appkey/i.test(lines[0])) return fail('no-header');
            const vals = lines.slice(1).map(l => l.split(/[,;\t]/)[0].trim()).filter(Boolean);
            if (!vals.length || keys.length + vals.length > maxKeys) return fail('count');
            vals.forEach(x => { if (keys.indexOf(x) < 0) keys.push(x); });
            if (listEl) listEl.innerHTML = keys.map(rowHtml).join('');
            sync(); notify();
          };
          if (/\.csv$/i.test(name)) {
            const fr = new FileReader();
            fr.onload = () => done(fr.result);
            fr.onerror = () => fail('invalid');
            fr.readAsText(f);
          } else {
            // xlsx 为二进制，前端无解析库：demo 语义按「文件无效」冒泡，由宿主接真实解析
            fail('invalid');
          }
        });
      }
    },
    {
      id: 'bc-eg71-scan-edit-drawer', cn: '扫描编辑抽屉', cat: '数据服务',
      desc: 'EG71 LoRaWAN 扫描确认页编辑抽屉：single = DevEUI 只读 + 设备名/描述/型号 + 公共 4 项（配置文件——过滤 ABP/fPort/超时分钟/帧计数校验开关），multi = 仅公共 4 项；标题「编辑设备 / 编辑多个设备」。开合骨架镜像 bc-eg71-protocol-detail（hidden + is-open + [data-*-close] + 遮罩点击关闭 + 内部 stopPropagation），保存以 eg71-scan-save {mode, targets, value} 冒泡后自动 close。',
      atoms: ['drawer', 'form', 'input', 'input-number', 'select', 'switch', 'button', 'icon'],
      entityHint: 'device',
      tags: ['抽屉', 'Drawer', '扫描', '批量编辑', '编辑设备', 'LoRaWAN', 'EG71'],
      render(ctx) {
        ctx = ctx || {};
        const mode = ctx.mode === 'single' ? 'single' : 'multi';
        const v = Object.assign({ profile: 'ClassA-OTAA', fPort: 1, timeout: 1440, frameCheck: false, name: '', description: '', model: 'None' }, ctx.value || {});
        const profiles = (ctx.profiles && ctx.profiles.length ? ctx.profiles : ['ClassA-OTAA']).filter(p => !/ABP/i.test(p));
        const models = (ctx.models && ctx.models.length ? ctx.models : []).concat(['None']).filter((m, i, a) => a.indexOf(m) === i);
        const device = ctx.device || {};
        const targets = Array.isArray(ctx.targets) ? ctx.targets : [];
        const title = mode === 'single' ? '编辑设备' : '编辑多个设备';
        const devEui = device.devEui || (targets.length === 1 ? targets[0] : '');
        const opt = (list, val) => list.map(o => `<option${o === val ? ' selected' : ''}>${esc(o)}</option>`).join('');
        const num = field => `<span class="ms-input-number"><input data-scan-edit-field="${field}"><span class="ms-input-number-step"><button type="button" aria-label="减小">−</button><button type="button" aria-label="增大">+</button></span></span>`;
        const singleFields = mode === 'single' ? `
          <div class="ms-form-item">
            <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">DevEUI</label></div>
            <label class="ms-input ms-input--disabled"><input value="${esc(devEui)}" readonly></label>
          </div>
          <div class="ms-form-item">
            <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label ms-form-label--required">设备名称</label></div>
            <label class="ms-input"><input data-scan-edit-field="name" value="${esc(v.name || devEui)}" placeholder="默认为 DevEUI"></label>
          </div>
          <div class="ms-form-item">
            <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">设备描述</label></div>
            <label class="ms-input"><input data-scan-edit-field="description" value="${esc(v.description || '')}" placeholder="选填"></label>
          </div>
          <div class="ms-form-item">
            <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">设备型号</label></div>
            <span class="ms-select"><select data-scan-edit-field="model">${opt(models, v.model || 'None')}</select></span>
          </div>` : '';
        return `<div class="bc-eg71-scan-edit-drawer" data-scan-mode="${mode}" data-scan-targets="${esc(targets.join(','))}" hidden>
          <div class="ms-mask ms-mask--drawer">
            <div class="ms-drawer bc-eg71-scan-edit-drawer-panel" role="dialog" aria-modal="true" aria-label="${esc(title)}">
              <div class="ms-drawer-head">
                <span class="ms-h4">${esc(title)}</span>
                <span class="ms-modal-close" data-scan-drawer-close aria-label="关闭">${ico('close', 20)}</span>
              </div>
              <div class="ms-drawer-body">
                <div class="ms-form bc-eg71-scan-edit-form">
                  ${singleFields}
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label ms-form-label--required">配置文件</label><span class="bc-eg71-form-item-unit">（不含 ABP 模式）</span></div>
                    <span class="ms-select"><select data-scan-edit-field="profile">${opt(profiles, v.profile)}</select></span>
                  </div>
                  <div class="bc-eg71-formgrid">
                    <div class="ms-form-item">
                      <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label ms-form-label--required">fPort</label><span class="bc-eg71-form-item-unit">(1-223)</span></div>
                      ${num('fPort')}
                    </div>
                    <div class="ms-form-item">
                      <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label ms-form-label--required">超时时间</label><span class="bc-eg71-form-item-unit">(min)</span></div>
                      ${num('timeout')}
                    </div>
                  </div>
                  <div class="ms-form-item">
                    <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label">帧计数校验</label></div>
                    <label class="ms-switch"><input type="checkbox" data-scan-edit-field="frameCheck"${v.frameCheck ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span><span class="ms-text">启用帧计数校验</span></label>
                  </div>
                </div>
              </div>
              <div class="ms-drawer-foot ms-space ms-space--12">
                <button type="button" class="ms-btn" data-scan-drawer-cancel>取消</button>
                <button type="button" class="ms-btn ms-btn--filled" data-scan-drawer-save>保存</button>
              </div>
            </div>
          </div>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelector) ? root : document;
        const wrap = rootEl.classList && rootEl.classList.contains('bc-eg71-scan-edit-drawer') ? rootEl : rootEl.querySelector('.bc-eg71-scan-edit-drawer');
        if (!wrap) return;
        const open = () => { wrap.hidden = false; wrap.classList.add('is-open'); };
        const close = () => { wrap.hidden = true; wrap.classList.remove('is-open'); };
        wrap.querySelectorAll('[data-scan-drawer-close], [data-scan-drawer-cancel]').forEach(el => el.addEventListener('click', close));
        const mask = wrap.querySelector('.ms-mask');
        if (mask) mask.addEventListener('click', e => { if (e.target === mask) close(); });
        const panel = wrap.querySelector('.ms-drawer');
        if (panel) panel.addEventListener('click', e => e.stopPropagation());
        // 数值步进（L2 S_InputNumber 契约：步进钮组内上减下加）
        wrap.querySelectorAll('.ms-input-number').forEach(numBox => {
          const input = numBox.querySelector('input');
          numBox.querySelectorAll('.ms-input-number-step button').forEach((btn, i) => btn.addEventListener('click', () => {
            if (!input) return;
            input.value = Math.max(0, (parseInt(input.value, 10) || 0) + (i === 0 ? -1 : 1));
          }));
        });
        const saveBtn = wrap.querySelector('[data-scan-drawer-save]');
        if (saveBtn) saveBtn.addEventListener('click', () => {
          const value = { profile: 'ClassA-OTAA', fPort: 1, timeout: 1440, frameCheck: false };
          wrap.querySelectorAll('[data-scan-edit-field]').forEach(el => {
            const field = el.getAttribute('data-scan-edit-field');
            if (field === 'frameCheck') value.frameCheck = el.checked;
            else if (field === 'fPort' || field === 'timeout') value[field] = parseInt(el.value, 10) || 0;
            else value[field] = el.value;
          });
          saveBtn.dispatchEvent(new CustomEvent('eg71-scan-save', { bubbles: true, detail: { mode: wrap.getAttribute('data-scan-mode') || 'multi', targets: (wrap.getAttribute('data-scan-targets') || '').split(',').filter(Boolean), value } }));
          close();
        });
        wrap.open = open;
        wrap.close = close;
      }
    },
    {
      id: 'bc-eg71-scan-device-table', cn: '扫描设备双页签表', cat: '数据服务',
      desc: 'EG71 LoRaWAN 扫描确认页设备表：页签条（发现设备/已忽略设备，带计数）→ 分 Tab 工具栏（编辑/忽略 或 取消忽略 随勾选启停；添加设备主钮 + 放弃扫描危险钮）→ 8 列表（选择/DevEUI/设备名/描述/设备型号——单值行内下拉、多匹配 Tag 展示/信号强度三档条+SNR·RSSI 常显/更新时间倒序/操作）→ 空态保留表头「扫描进行中，离开此页面不会打断扫描」→ 表尾刷新。行内编辑 blur 以 eg71-scan-row-edit 冒泡；忽略/取消忽略以 eg71-scan-ignore 冒泡；添加设备经内嵌 bc-eg71-modal 确认后 eg71-scan-add + Toast「xx个设备添加成功」+ 移除行；超限（D4）经确认弹窗拦截；放弃扫描经删除弹窗确认后 eg71-scan-abandon + 行淡出移除；批量/单台编辑以 eg71-scan-edit-multi / eg71-scan-edit-single 冒泡由宿主开 bc-eg71-scan-edit-drawer。',
      atoms: ['tabs', 'button', 'table', 'checkbox', 'input', 'select', 'tag', 'icon', 'empty', 'message', 'modal'],
      entityHint: 'device',
      tags: ['扫描', 'LoRaWAN', '设备表', '页签', '发现设备', '已忽略', '添加设备', '放弃扫描', '行内编辑', 'EG71'],
      render(ctx) {
        ctx = ctx || {};
        const tab = ctx.tab === 'ignored' ? 'ignored' : 'found';
        const rowsAll = (Array.isArray(ctx.rows) ? ctx.rows : [
          { devEui: '24E124FFFE00A001', name: 'AM319-车间A', description: '温湿度传感器', model: 'AM319', rssi: -78, snr: 9.5, level: 'good', lastUpdateAt: '2024-12-23 09:34:12' },
          { devEui: '24E124FFFE00A002', name: 'AM102-仓库', description: '', model: ['AM102', 'AM102L'], rssi: -102, snr: -2.5, level: 'medium', lastUpdateAt: '2024-12-23 09:33:58' },
          { devEui: '0018B20000AB12F4', name: '0018B20000AB12F4', description: '第三方节点', model: 'None', rssi: -121, snr: -15, level: 'poor', lastUpdateAt: '2024-12-23 09:31:20' },
          { devEui: '24E124FFFE00A003', name: 'WS202-门口', description: '门磁', model: 'WS202', rssi: -95, snr: 4, level: 'medium', lastUpdateAt: '2024-12-23 09:30:02', ignored: true }
        ]).slice().sort((a, b) => String(b.lastUpdateAt || '').localeCompare(String(a.lastUpdateAt || '')));
        const found = rowsAll.filter(r => !r.ignored);
        const ignored = rowsAll.filter(r => r.ignored);
        const active = tab === 'ignored' ? ignored : found;
        const MODEL_OPTIONS = ['None', 'AM102', 'AM103', 'AM319', 'EM500-PT100', 'WS202', 'UC50x'];
        const SIGNAL_BARS = { good: 4, medium: 3, poor: 2 };
        const modelHtml = m => {
          if (Array.isArray(m) && m.length > 1) {
            const cands = m.concat(['None']).filter((x, i, a) => a.indexOf(x) === i);
            return `<span class="bc-eg71-scan-model-tags">${cands.map(x => `<span class="ms-tag ms-tag--round${x === 'None' ? ' ms-tag--outline' : ''}">${esc(x)}</span>`).join('')}</span>`;
          }
          const cur = (Array.isArray(m) ? m[0] : m) || 'None';
          const opts = [cur].concat(MODEL_OPTIONS.filter(o => o !== cur));
          return `<span class="ms-select ms-select--sm bc-eg71-scan-model-select"><select data-scan-row-field="model">${opts.map(o => `<option${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select></span>`;
        };
        const signalHtml = r => {
          if (!r || !r.level) return '<span class="ms-text">—</span>';
          const on = SIGNAL_BARS[r.level] || 2;
          const bars = [1, 2, 3, 4].map(n => `<i class="bc-eg71-scan-signal-bar${n <= on ? ' bc-eg71-scan-signal-bar--' + esc(r.level) : ''}"></i>`).join('');
          return `<span class="bc-eg71-scan-signal"><span class="bc-eg71-scan-signal-bars">${bars}</span><span class="bc-num bc-eg71-scan-signal-vals">RSSI ${r.rssi != null ? esc(r.rssi) : '-'}dBm / SNR ${r.snr != null ? esc(r.snr) : '-'}dB</span></span>`;
        };
        const OPS = tab === 'ignored'
          ? [['unignore', 'check', '取消忽略', '']]
          : [['edit', 'edit', '编辑', ''], ['ignore', 'minus', '忽略', ' ms-btn--danger']];
        const opsHtml = OPS.map(o => `<button type="button" class="ms-btn ms-btn--sm${o[3]}" data-scan-op="${o[0]}" aria-label="${o[2]}" title="${o[2]}">${ico(o[1], 16)}${o[2]}</button>`).join('');
        const rowHtml = r => `<tr data-scan-row="${esc(r.devEui)}" class="bc-eg71-scan-row">
            <td class="bc-col-check"><label class="ms-checkbox"><input type="checkbox" data-scan-check><span class="ms-checkbox-box"></span></label></td>
            <td><span class="ms-text bc-num">${esc(r.devEui)}</span></td>
            <td><label class="ms-input ms-input--sm"><input data-scan-row-field="name" value="${esc(r.name || r.devEui)}"></label></td>
            <td><label class="ms-input ms-input--sm"><input data-scan-row-field="description" value="${esc(r.description || '')}" placeholder="-"></label></td>
            <td>${modelHtml(r.model)}</td>
            <td>${signalHtml(r)}</td>
            <td><span class="ms-text bc-time">${esc(r.lastUpdateAt || '—')}</span></td>
            <td class="bc-eg71-table-ops">${opsHtml}</td>
          </tr>`;
        const batch = tab === 'ignored'
          ? `<button type="button" class="ms-btn ms-btn--sm" data-scan-batch="unignore" disabled>${ico('check', 16)}取消忽略</button>`
          : `<button type="button" class="ms-btn ms-btn--sm" data-scan-batch="edit" disabled>${ico('edit', 16)}编辑</button>
             <button type="button" class="ms-btn ms-btn--sm ms-btn--danger" data-scan-batch="ignore" disabled>${ico('minus', 16)}忽略</button>`;
        const toolbar = `<div class="ms-space ms-space--12 bc-eg71-scan-toolbar">
            ${batch}
            ${tab === 'found' ? `<span class="bc-eg71-scan-toolbar-spacer"></span>
            <button type="button" class="ms-btn ms-btn--sm ms-btn--filled" data-scan-add disabled>${ico('plus', 16)}添加设备</button>
            <button type="button" class="ms-btn ms-btn--sm ms-btn--danger" data-scan-abandon>${ico('close', 16)}放弃扫描</button>` : ''}
          </div>`;
        const emptyHtml = tab === 'ignored'
          ? `<div class="ms-empty"><span class="ms-empty-illu">${ico('device', 32)}</span><div class="ms-empty-text">暂无已忽略设备</div></div>`
          : `<div class="ms-empty"><span class="ms-empty-illu">${ico('lorawan', 32)}</span><div class="ms-empty-text">扫描进行中，离开此页面不会打断扫描</div></div>`;
        const foot = `<div class="bc-table-foot">
            <button type="button" class="ms-btn ms-btn--sm" data-scan-refresh>${ico('refresh', 16)}刷新</button>
            <span class="ms-text ms-text--secondary ms-text--sm" data-scan-total>共 ${active.length} 台</span>
          </div>`;
        const modalHtml = (id, mctx) => window.MS_BIZ_INDEX && window.MS_BIZ_INDEX['bc-eg71-modal']
          ? `<div class="bc-eg71-scan-modal" data-scan-modal="${id}">${window.MS_BIZ_INDEX['bc-eg71-modal'].render(mctx)}</div>`
          : '';
        return `<div class="bc-eg71-scan-device-table" data-scan-tab="${tab}" data-scan-max-devices="${esc(ctx.maxDevices != null ? ctx.maxDevices : 2000)}" data-scan-existing="${esc(ctx.existingDevices != null ? ctx.existingDevices : 0)}">
          <section class="ms-card">
            <div class="bc-eg71-event-bar" role="tablist" aria-label="扫描设备页签">
              <button type="button" class="bc-eg71-event-tab${tab === 'found' ? ' bc-eg71-event-tab--active' : ''}" role="tab" aria-selected="${tab === 'found'}" data-scan-tab="found">发现设备<span class="ms-tag ms-tag--round ms-tag--outline bc-count" data-scan-count="found">${found.length}</span></button>
              <button type="button" class="bc-eg71-event-tab${tab === 'ignored' ? ' bc-eg71-event-tab--active' : ''}" role="tab" aria-selected="${tab === 'ignored'}" data-scan-tab="ignored">已忽略设备<span class="ms-tag ms-tag--round ms-tag--outline bc-count" data-scan-count="ignored">${ignored.length}</span></button>
            </div>
            <div class="ms-card-body bc-eg71-scan-body">
              ${toolbar}
              <div class="ms-table-wrap">
                <table class="ms-table">
                  <thead><tr>
                    <th class="bc-col-check"><label class="ms-checkbox"><input type="checkbox" data-scan-check-all><span class="ms-checkbox-box"></span></label></th>
                    <th>DevEUI</th><th>设备名</th><th>描述</th><th>设备型号</th><th>信号强度</th><th>更新时间</th>
                    <th class="bc-eg71-table-ops">操作</th>
                  </tr></thead>
                  ${active.length
                    ? `<tbody>${active.map(rowHtml).join('')}</tbody>`
                    : `<tbody><tr><td colspan="8">${emptyHtml}</td></tr></tbody>`}
                </table>
              </div>
              ${foot}
            </div>
          </section>
          ${modalHtml('add', { action: 'confirm', title: '添加设备', desc: '确认将所选设备添加到设备列表？', okText: '确认' })}
          ${modalHtml('abandon', { action: 'delete', title: '放弃扫描', desc: '放弃后将终止本次扫描并清空扫描结果，已扫描到的设备将全部丢弃。', okText: '放弃扫描' })}
          ${modalHtml('limit', { action: 'confirm', title: '超过数量上限', desc: '所选设备数量超过设备上限（2000 台），请减少选择后重试。', okText: '知道了' })}
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const wrap = rootEl.classList && rootEl.classList.contains('bc-eg71-scan-device-table') ? rootEl : rootEl.querySelector('.bc-eg71-scan-device-table');
        if (!wrap) return;
        const BIZ = window.MS_BIZ_INDEX || {};
        const fire = (el, ev, detail) => el.dispatchEvent(new CustomEvent(ev, { bubbles: true, detail }));
        const currentTab = () => wrap.getAttribute('data-scan-tab') || 'found';
        // 三个弹窗：bindEg71Modal 收敛到 root 内第一个 .bc-eg71-modal —— 每实例独立 wrapper 分别 bind
        const modals = {};
        wrap.querySelectorAll('[data-scan-modal]').forEach(w => {
          if (BIZ['bc-eg71-modal']) BIZ['bc-eg71-modal'].bind(w);
          const m = w.querySelector('.bc-eg71-modal');
          if (m) modals[w.getAttribute('data-scan-modal')] = m;
        });
        // Toast：L2 .ms-message-stack / .ms-message 直组（无独立 S_Message 运行时助手）
        const toast = text => {
          let stack = document.querySelector('.ms-message-stack');
          if (!stack) { stack = document.createElement('div'); stack.className = 'ms-message-stack'; document.body.appendChild(stack); }
          const item = document.createElement('div');
          item.className = 'ms-message';
          item.innerHTML = `${ico('check', 16)}<span>${esc(text)}</span>`;
          stack.appendChild(item);
          setTimeout(() => item.remove(), 2400);
        };
        const sync = () => {
          const checks = Array.prototype.slice.call(wrap.querySelectorAll('[data-scan-check]'));
          const n = checks.filter(c => c.checked).length;
          ['edit', 'ignore', 'unignore', 'add'].forEach(k => {
            const b = wrap.querySelector(k === 'add' ? '[data-scan-add]' : `[data-scan-batch="${k}"]`);
            if (b) b.disabled = n === 0;
          });
          const all = wrap.querySelector('[data-scan-check-all]');
          if (all) {
            all.checked = checks.length > 0 && n === checks.length;
            all.indeterminate = n > 0 && n < checks.length;
          }
        };
        const updateCounts = () => {
          const n = wrap.querySelectorAll('tbody tr[data-scan-row]').length;
          const tag = wrap.querySelector('[data-scan-count]');
          if (tag) tag.textContent = n;
          const totalEl = wrap.querySelector('[data-scan-total]');
          if (totalEl) totalEl.textContent = `共 ${n} 台`;
        };
        const removeRows = trs => {
          if (!trs.length) return;
          trs.forEach(tr => tr.classList.add('bc-eg71-scan-row--leaving'));
          setTimeout(() => {
            trs.forEach(tr => tr.remove());
            sync(); updateCounts();
          }, 240);
        };
        const checkedTrs = () => Array.prototype.slice.call(wrap.querySelectorAll('[data-scan-check]')).filter(c => c.checked).map(c => c.closest('tr'));
        const trEuis = trs => trs.map(tr => tr.getAttribute('data-scan-row'));
        wrap.querySelectorAll('[data-scan-check]').forEach(c => c.addEventListener('change', sync));
        const all = wrap.querySelector('[data-scan-check-all]');
        if (all) all.addEventListener('change', () => {
          wrap.querySelectorAll('[data-scan-check]').forEach(c => { c.checked = all.checked; });
          sync();
        });
        // 页签 / 刷新
        wrap.querySelectorAll('.bc-eg71-event-tab[data-scan-tab]').forEach(btn => btn.addEventListener('click', () => {
          if (btn.getAttribute('data-scan-tab') === currentTab()) return;
          fire(btn, 'eg71-scan-tab', { tab: btn.getAttribute('data-scan-tab') });
        }));
        const refreshBtn = wrap.querySelector('[data-scan-refresh]');
        if (refreshBtn) refreshBtn.addEventListener('click', () => fire(refreshBtn, 'eg71-scan-refresh', { tab: currentTab() }));
        // 行内编辑：change（文本 blur / 下拉选中即触发）→ eg71-scan-row-edit
        wrap.querySelectorAll('[data-scan-row-field]').forEach(el => el.addEventListener('change', () => {
          const tr = el.closest('tr[data-scan-row]');
          if (!tr) return;
          fire(el, 'eg71-scan-row-edit', { devEui: tr.getAttribute('data-scan-row'), field: el.getAttribute('data-scan-row-field'), value: el.value });
        }));
        // 行操作：编辑（单台）/ 忽略 / 取消忽略
        wrap.querySelectorAll('[data-scan-op]').forEach(btn => btn.addEventListener('click', () => {
          const tr = btn.closest('tr[data-scan-row]');
          if (!tr) return;
          const devEui = tr.getAttribute('data-scan-row');
          const op = btn.getAttribute('data-scan-op');
          if (op === 'edit') fire(btn, 'eg71-scan-edit-single', { devEui });
          else if (op === 'ignore') fire(btn, 'eg71-scan-ignore', { devEuis: [devEui], ignored: true });
          else if (op === 'unignore') fire(btn, 'eg71-scan-ignore', { devEuis: [devEui], ignored: false });
        }));
        // 工具栏：批量编辑 / 批量忽略 / 取消忽略
        const editBtn = wrap.querySelector('[data-scan-batch="edit"]');
        if (editBtn) editBtn.addEventListener('click', () => fire(editBtn, 'eg71-scan-edit-multi', { devEuis: trEuis(checkedTrs()) }));
        const igBtn = wrap.querySelector('[data-scan-batch="ignore"]');
        if (igBtn) igBtn.addEventListener('click', () => fire(igBtn, 'eg71-scan-ignore', { devEuis: trEuis(checkedTrs()), ignored: true }));
        const unigBtn = wrap.querySelector('[data-scan-batch="unignore"]');
        if (unigBtn) unigBtn.addEventListener('click', () => fire(unigBtn, 'eg71-scan-ignore', { devEuis: trEuis(checkedTrs()), ignored: false }));
        // 添加设备：确认弹窗 → 超限拦截（D4）或 eg71-scan-add + Toast + 移除行
        const addBtn = wrap.querySelector('[data-scan-add]');
        if (addBtn) {
          const addOk = modals.add ? modals.add.querySelector('[data-modal-ok]') : null;
          if (addOk) addOk.addEventListener('click', () => {
            const trs = checkedTrs();
            if (!trs.length) return;
            fire(addBtn, 'eg71-scan-add', { devEuis: trEuis(trs) });
            toast(`${trs.length}个设备添加成功`);
            removeRows(trs);
          });
          addBtn.addEventListener('click', () => {
            const trs = checkedTrs();
            const max = Number(wrap.getAttribute('data-scan-max-devices')) || 2000;
            const existing = Number(wrap.getAttribute('data-scan-existing')) || 0;
            if (modals.limit && existing + trs.length > max) { modals.limit.open(); return; }
            if (modals.add) { modals.add.open(); return; }
            fire(addBtn, 'eg71-scan-add', { devEuis: trEuis(trs) });
            toast(`${trs.length}个设备添加成功`);
            removeRows(trs);
          });
        }
        // 放弃扫描：删除确认弹窗 → eg71-scan-abandon + 全部行淡出移除（时长走 --duration-normal 令牌）
        const abandonBtn = wrap.querySelector('[data-scan-abandon]');
        if (abandonBtn) {
          const allRows = () => Array.prototype.slice.call(wrap.querySelectorAll('tbody tr[data-scan-row]'));
          const doAbandon = () => {
            fire(abandonBtn, 'eg71-scan-abandon', {});
            removeRows(allRows());
          };
          const abOk = modals.abandon ? modals.abandon.querySelector('[data-modal-ok]') : null;
          if (abOk) abOk.addEventListener('click', doAbandon);
          abandonBtn.addEventListener('click', () => {
            if (modals.abandon) { modals.abandon.open(); return; }
            doAbandon();
          });
        }
      }
    },
    {
      id: 'bc-eg71-device-form', cn: 'LoRaWAN 设备添加/编辑表单', cat: '数据服务',
      desc: 'EG71 LoRaWAN 设备添加/编辑整页表单：基本信息卡（DevEUI 添加可填/编辑只读 + 名称/描述/型号）→ 配置文件卡（配置文件/fPort/超时分钟/帧计数校验开关）→ 激活设置区（内嵌 bc-eg71-activation-card 灰卡；OTAA 编辑态附 DevAddr/NwkSKey/AppSKey 三只读字段；ABP 态为 ABP 参数卡——三密钥 + Uplink/Downlink Frame-counter/Timeout 三计数器，默认值态三密钥置灰、计数器保持可编辑）。内部消费 eg71-activation-change 做 ABP 置灰联动（#7），单选切换全程保留输入（#8）；切换配置文件/型号/激活类型走组件内 stash 暂存/恢复（#9），保存（eg71-footer-action action=save）清除暂存；值变更统一以 eg71-device-form-change {dirty, activation, values} 冒泡。',
      atoms: ['card', 'form', 'input', 'input-number', 'select', 'switch', 'icon'],
      entityHint: 'device',
      tags: ['设备', '表单', 'LoRaWAN', 'OTAA', 'ABP', '添加', '编辑', 'AppKey', '暂存', 'EG71'],
      render(ctx) {
        ctx = ctx || {};
        const mode = ctx.mode === 'edit' ? 'edit' : 'add';
        const activation = ctx.activation === 'abp' ? 'abp' : 'otaa';
        const devEui = ctx.devEui || '';
        const model0 = ctx.model || '';
        // Milesight 判定（03-ued §6.3）：DevEUI OUI 24E124 前缀，或型号命中 Milesight SKU 族
        const milesight = /^24e124/i.test(devEui) || /^(am|em|ws|uc|wt|vs|gs|ts)\d/i.test(model0);
        const v = Object.assign({
          name: '', description: '', model: model0 || 'None', profile: 'ClassA-OTAA', fPort: 1, timeout: 1440, frameCheck: false,
          activation: { mode: milesight ? 'default' : 'custom', appKey: '' },
          abp: { devAddr: '', nwkSKey: '', appSKey: '', uplink: 0, downlink: 0, timeout: 1440 }
        }, ctx.values || {});
        const PROFILES = ['ClassA-OTAA', 'ClassB-OTAA', 'ClassC-OTAA', 'ClassA-ABP'];
        const MODELS = ['None', 'AM102', 'AM102L', 'AM103', 'AM319', 'EM500-PT100', 'WS202', 'UC50x'];
        const BIZ = window.MS_BIZ_INDEX || {};
        const opt = (list, val) => list.map(o => `<option${o === val ? ' selected' : ''}>${esc(o)}</option>`).join('');
        const fitem = (label, inner, required, unit) => `<div class="ms-form-item">
            <div class="bc-eg71-form-item-labelrow"><label class="ms-form-label${required === false ? '' : ' ms-form-label--required'}">${esc(label)}${unit ? `<span class="bc-eg71-form-item-unit">(${esc(unit)})</span>` : ''}</label></div>
            ${inner}
          </div>`;
        const input = (field, val, ph, dis) => `<label class="ms-input${dis ? ' ms-input--disabled' : ''}"><input data-form-field="${field}" value="${esc(val != null ? val : '')}"${ph ? ` placeholder="${esc(ph)}"` : ''}${dis ? ' disabled' : ''}></label>`;
        const roInput = val => `<label class="ms-input ms-input--disabled"><input value="${esc(val != null ? val : '')}" readonly></label>`;
        const num = field => `<span class="ms-input-number"><input data-form-field="${field}"><span class="ms-input-number-step"><button type="button" aria-label="减小">−</button><button type="button" aria-label="增大">+</button></span></span>`;
        const switchHtml = (field, on) => `<label class="ms-switch"><input type="checkbox" data-form-field="${field}"${on ? ' checked' : ''}><span class="ms-switch-track"></span><span class="ms-switch-thumb"></span></label>`;
        const actCard = kind => BIZ['bc-eg71-activation-card']
          ? BIZ['bc-eg71-activation-card'].render({ kind, value: v.activation, milesight, readonly: false })
          : '';
        const basicCard = `<section class="ms-card">
          <div class="ms-card-head"><span class="ms-card-title ms-h4">基本信息</span></div>
          <div class="ms-card-body">
            <div class="bc-eg71-formgrid">
              ${fitem('DevEUI', mode === 'add' ? input('devEui', devEui, '请输入 16 位十六进制 DevEUI') : roInput(devEui), mode === 'add')}
              ${fitem('设备名称', input('name', v.name || devEui, '默认为 DevEUI'), false)}
              ${fitem('设备描述', input('description', v.description, '选填'), false)}
              ${fitem('设备型号', `<span class="ms-select"><select data-form-field="model">${opt(MODELS, v.model || 'None')}</select></span>`, false)}
            </div>
          </div>
        </section>`;
        const profilesCard = `<section class="ms-card">
          <div class="ms-card-head"><span class="ms-card-title ms-h4">配置文件</span></div>
          <div class="ms-card-body">
            <div class="bc-eg71-formgrid">
              ${fitem('配置文件', `<span class="ms-select"><select data-form-field="profile">${opt(PROFILES, v.profile)}</select></span>`, true)}
              ${fitem('fPort', num('fPort'), true, '1-223')}
              ${fitem('超时时间', num('timeout'), true, 'min')}
              ${fitem('启用帧计数校验', switchHtml('frameCheck', v.frameCheck), false)}
            </div>
          </div>
        </section>`;
        const otaaBlock = `<div class="bc-eg71-subarea bc-eg71-device-form-act" data-device-form-act="otaa"${activation === 'otaa' ? '' : ' hidden'}>
          ${actCard('otaa')}
          ${mode === 'edit' ? `<div class="bc-eg71-formgrid bc-eg71-device-form-rokeys">
            ${fitem('设备地址 DevAddr', roInput(v.abp.devAddr), false)}
            ${fitem('网络会话秘钥 NwkSKey', roInput(v.abp.nwkSKey), false)}
            ${fitem('应用程序会话秘钥 AppSKey', roInput(v.abp.appSKey), false)}
          </div>` : ''}
        </div>`;
        const keyInput = (field, label) => fitem(label, input('abp.' + field, v.abp[field], ''), false);
        const abpBlock = `<div class="bc-eg71-device-form-act" data-device-form-act="abp"${activation === 'abp' ? '' : ' hidden'}>
          <div class="bc-eg71-subarea">${actCard('abp')}</div>
          <section class="ms-card">
            <div class="ms-card-head"><span class="ms-card-title ms-h4">ABP 参数</span></div>
            <div class="ms-card-body">
              <div class="bc-eg71-formgrid">
                ${keyInput('devAddr', '设备地址 DevAddr')}
                ${keyInput('nwkSKey', '网络会话秘钥 NwkSKey')}
                ${keyInput('appSKey', '应用程序会话秘钥 AppSKey')}
              </div>
              <div class="bc-eg71-formgrid">
                ${fitem('Uplink Frame-counter', num('abp.uplink'), false)}
                ${fitem('Downlink Frame-counter', num('abp.downlink'), false)}
                ${fitem('超时时间', num('abp.timeout'), false, 'min')}
              </div>
            </div>
          </section>
        </div>`;
        return `<div class="bc-eg71-device-form" data-mode="${mode}" data-activation="${activation}">
          <div class="bc-eg71-content">
            ${basicCard}
            ${profilesCard}
            <section class="ms-card">
              <div class="ms-card-head">
                <span class="ms-card-title ms-h4">激活设置</span>
                <span class="ms-card-extra ms-select ms-select--sm"><select data-form-switch="activation" aria-label="激活类型">
                  <option value="otaa"${activation === 'otaa' ? ' selected' : ''}>OTAA</option>
                  <option value="abp"${activation === 'abp' ? ' selected' : ''}>ABP</option>
                </select></span>
              </div>
              <div class="ms-card-body">
                ${otaaBlock}
                ${abpBlock}
              </div>
            </section>
          </div>
        </div>`;
      },
      bind(root) {
        const rootEl = (root && root.querySelectorAll) ? root : document;
        const wrap = rootEl.classList && rootEl.classList.contains('bc-eg71-device-form') ? rootEl : rootEl.querySelector('.bc-eg71-device-form');
        if (!wrap) return;
        const fire = (detail) => wrap.dispatchEvent(new CustomEvent('eg71-device-form-change', { bubbles: true, detail }));
        const currentAct = () => wrap.getAttribute('data-activation') || 'otaa';
        const setActivation = act => {
          wrap.setAttribute('data-activation', act);
          const otaaEl = wrap.querySelector('[data-device-form-act="otaa"]');
          const abpEl = wrap.querySelector('[data-device-form-act="abp"]');
          if (otaaEl) otaaEl.hidden = act !== 'otaa';
          if (abpEl) abpEl.hidden = act !== 'abp';
        };
        const q = k => wrap.querySelector(`[data-form-field="${k}"]`);
        const collect = () => {
          const values = { devEui: '', name: '', description: '', model: 'None', profile: 'ClassA-OTAA', fPort: 1, timeout: 1440, frameCheck: false, activation: { mode: 'default', appKey: '' }, abp: { devAddr: '', nwkSKey: '', appSKey: '', uplink: 0, downlink: 0, timeout: 1440 } };
          wrap.querySelectorAll('[data-form-field]').forEach(el => {
            const key = el.getAttribute('data-form-field');
            if (key === 'frameCheck') values.frameCheck = el.checked;
            else if (key === 'fPort' || key === 'timeout') values[key] = parseInt(el.value, 10) || 0;
            else if (key.indexOf('abp.') === 0) {
              const f = key.slice(4);
              values.abp[f] = (f === 'uplink' || f === 'downlink' || f === 'timeout') ? (parseInt(el.value, 10) || 0) : el.value;
            } else values[key] = el.value;
          });
          const checkedRadio = wrap.querySelector('.bc-eg71-activation-group .ms-radio-btn--checked');
          if (checkedRadio) values.activation.mode = checkedRadio.getAttribute('data-activation-mode') || 'default';
          const appkeyInput = wrap.querySelector('[data-activation-appkey]');
          if (appkeyInput) values.activation.appKey = appkeyInput.value;
          return values;
        };
        const apply = values => {
          const set = (k, val) => {
            const el = q(k);
            if (!el) return;
            if (el.type === 'checkbox') el.checked = !!val;
            else el.value = val != null ? val : '';
          };
          ['devEui', 'name', 'description', 'fPort', 'timeout', 'frameCheck', 'abp.devAddr', 'abp.nwkSKey', 'abp.appSKey', 'abp.uplink', 'abp.downlink', 'abp.timeout'].forEach(k => set(k, k.indexOf('abp.') === 0 ? values.abp[k.slice(4)] : values[k]));
          if (q('model')) q('model').value = values.model;
          if (q('profile')) q('profile').value = values.profile;
        };
        const notify = dirty => fire({ dirty: !!dirty, activation: currentAct(), values: collect() });
        // 场景切换暂存（交互 #9）：key = activation:profile:model，切回恢复、保存清除
        const stash = new Map();
        const scenarioKey = () => `${currentAct()}:${(q('profile') || {}).value || ''}:${(q('model') || {}).value || ''}`;
        const scenarioSwitch = recompute => {
          const oldKey = stash.get('__current');
          if (oldKey) stash.set(oldKey, collect());
          if (recompute) recompute();
          stash.set('__current', scenarioKey());
          const snap = stash.get(stash.get('__current'));
          if (snap) apply(snap);
          notify(true);
        };
        const profileSel = q('profile');
        if (profileSel) profileSel.addEventListener('change', () => {
          scenarioSwitch(() => setActivation(/ABP/i.test(profileSel.value) ? 'abp' : 'otaa'));
        });
        const modelSel = q('model');
        if (modelSel) modelSel.addEventListener('change', () => scenarioSwitch(null));
        const actSel = wrap.querySelector('[data-form-switch="activation"]');
        if (actSel) actSel.addEventListener('change', () => {
          const act = actSel.value === 'abp' ? 'abp' : 'otaa';
          scenarioSwitch(() => {
            setActivation(act);
            if (profileSel) profileSel.value = act === 'abp' ? 'ClassA-ABP' : 'ClassA-OTAA';
          });
        });
        // 普通字段变更 → 统一冒泡（profile/model 已由场景切换处理）
        wrap.querySelectorAll('[data-form-field]').forEach(el => {
          if (['profile', 'model'].indexOf(el.getAttribute('data-form-field')) >= 0) return;
          el.addEventListener('change', () => notify(true));
        });
        // 数值步进（S_InputNumber 契约）
        wrap.querySelectorAll('.ms-input-number').forEach(numBox => {
          const input = numBox.querySelector('input');
          numBox.querySelectorAll('.ms-input-number-step button').forEach((btn, i) => btn.addEventListener('click', () => {
            if (!input) return;
            input.value = Math.max(0, (parseInt(input.value, 10) || 0) + (i === 0 ? -1 : 1));
            notify(true);
          }));
        });
        // 消费内嵌激活卡的 eg71-activation-change：ABP 默认值三密钥置灰、自定义恢复，全程保留输入（#7/#8）
        wrap.addEventListener('eg71-activation-change', e => {
          const lock = e.detail && e.detail.mode === 'default';
          ['abp.devAddr', 'abp.nwkSKey', 'abp.appSKey'].forEach(k => {
            const inp = q(k);
            if (!inp) return;
            inp.disabled = lock;
            const box = inp.closest('.ms-input');
            if (box) box.classList.toggle('ms-input--disabled', lock);
          });
          notify(true);
        });
        // 保存（页尾 bc-eg71-form-footer 的 eg71-footer-action）：清除暂存（#9）
        wrap.addEventListener('eg71-footer-action', e => {
          if (e.detail && e.detail.action === 'save') {
            stash.clear();
            notify(false);
          }
        });
      }
    }
  ];

  /* ---------- 维护域 140x140 插图（升级/重启/备份/结果态 · 颜色全走 L1 令牌） ---------- */
  function maintIllu(kind) {
    const SVGS = {
      upgrade: '<svg class="bc-eg71-maint-illu" viewBox="0 0 140 140" fill="none" aria-hidden="true">'
        + '<ellipse cx="70" cy="126" rx="46" ry="6" fill="var(--color-primary-bg)"/>'
        + '<rect x="16" y="24" width="68" height="92" rx="8" fill="var(--color-primary-bg)"/>'
        + '<path d="M30 44h40M30 58h40M30 72h24" stroke="var(--color-icon-auxiliary)" stroke-width="3" stroke-linecap="round"/>'
        + '<rect x="50" y="40" width="60" height="60" rx="12" fill="var(--color-primary-normal)"/>'
        + '<path d="M74 60l24 9-24 23 6-16z" fill="var(--color-text-constant-normal)"/>'
        + '<rect x="22" y="92" width="20" height="20" rx="4" fill="var(--color-success-normal)"/>'
        + '<circle cx="108" cy="44" r="6" fill="var(--color-remind-normal)"/>'
        + '</svg>',
      restart: '<svg class="bc-eg71-maint-illu" viewBox="0 0 140 140" fill="none" aria-hidden="true">'
        + '<circle cx="70" cy="70" r="46" fill="var(--color-primary-bg)"/>'
        + '<path d="M46 52A30 30 0 0 1 100 62" stroke="var(--color-primary-normal)" stroke-width="8" stroke-linecap="round"/>'
        + '<path d="M104 48l4 20-20-6z" fill="var(--color-primary-normal)"/>'
        + '<path d="M94 88A30 30 0 0 1 40 78" stroke="var(--color-primary-normal)" stroke-width="8" stroke-linecap="round" opacity="0.45"/>'
        + '<path d="M36 92l-4-20 20 6z" fill="var(--color-primary-normal)" opacity="0.45"/>'
        + '<circle cx="70" cy="70" r="10" fill="var(--color-bg-card)" stroke="var(--color-primary-normal)" stroke-width="4"/>'
        + '</svg>',
      backupRun: '<svg class="bc-eg71-maint-illu" viewBox="0 0 140 140" fill="none" aria-hidden="true">'
        + '<ellipse cx="70" cy="122" rx="46" ry="6" fill="var(--color-primary-bg)"/>'
        + '<rect x="14" y="26" width="76" height="58" rx="8" fill="var(--color-primary-bg)"/>'
        + '<path d="M14 42h76" stroke="var(--color-icon-auxiliary)" stroke-width="3"/>'
        + '<circle cx="24" cy="34" r="2.5" fill="var(--color-icon-auxiliary)"/><circle cx="32" cy="34" r="2.5" fill="var(--color-icon-auxiliary)"/><circle cx="40" cy="34" r="2.5" fill="var(--color-icon-auxiliary)"/>'
        + '<path d="M52 48l14 5v12c0 8-6 13-14 16-8-3-14-8-14-16V53z" fill="var(--color-success-normal)"/>'
        + '<path d="M46 66l5 5 9-10" stroke="var(--color-text-constant-normal)" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        + '<rect x="82" y="60" width="44" height="54" rx="8" fill="var(--color-primary-normal)"/>'
        + '<path d="M92 74h24M92 86h24M92 98h16" stroke="var(--color-text-constant-normal)" stroke-width="3" stroke-linecap="round" opacity="0.7"/>'
        + '</svg>',
      backupReset: '<svg class="bc-eg71-maint-illu" viewBox="0 0 140 140" fill="none" aria-hidden="true">'
        + '<ellipse cx="70" cy="122" rx="46" ry="6" fill="var(--color-primary-bg)"/>'
        + '<rect x="14" y="26" width="76" height="58" rx="8" fill="var(--color-primary-bg)"/>'
        + '<path d="M14 42h76" stroke="var(--color-icon-auxiliary)" stroke-width="3"/>'
        + '<circle cx="34" cy="58" r="5" fill="var(--color-primary-normal)"/>'
        + '<circle cx="66" cy="58" r="5" fill="var(--color-primary-normal)"/>'
        + '<path d="M39 58h22" stroke="var(--color-primary-normal)" stroke-width="3"/>'
        + '<circle cx="52" cy="84" r="13" fill="none" stroke="var(--color-icon-secondary)" stroke-width="5"/>'
        + '<path d="M52 63v-7M52 112v-7M31 84h-7M80 84h-7M37 69l-5-5M72 99l-5-5M67 69l5-5M32 99l5-5" stroke="var(--color-icon-secondary)" stroke-width="4" stroke-linecap="round"/>'
        + '<circle cx="30" cy="104" r="16" fill="var(--color-success-bg)"/>'
        + '<path d="M22 104a8 8 0 1 1 3 6.2" stroke="var(--color-success-normal)" stroke-width="3.5" fill="none" stroke-linecap="round"/>'
        + '<path d="M18 96l1 9 9-2z" fill="var(--color-success-normal)"/>'
        + '</svg>',
      success: '<svg class="bc-eg71-maint-illu" viewBox="0 0 140 140" fill="none" aria-hidden="true">'
        + '<circle cx="70" cy="70" r="46" fill="var(--color-success-bg)"/>'
        + '<circle cx="70" cy="70" r="30" fill="var(--color-success-normal)"/>'
        + '<path d="M58 70l9 9 16-17" stroke="var(--color-text-constant-normal)" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'
        + '</svg>',
      error: '<svg class="bc-eg71-maint-illu" viewBox="0 0 140 140" fill="none" aria-hidden="true">'
        + '<circle cx="70" cy="70" r="46" fill="var(--color-error-bg)"/>'
        + '<circle cx="70" cy="70" r="30" fill="var(--color-error-normal)"/>'
        + '<path d="M60 60l20 20M80 60l-20 20" stroke="var(--color-text-constant-normal)" stroke-width="5" stroke-linecap="round"/>'
        + '</svg>',
      info: '<svg class="bc-eg71-maint-illu" viewBox="0 0 140 140" fill="none" aria-hidden="true">'
        + '<circle cx="70" cy="70" r="46" fill="var(--color-primary-bg)"/>'
        + '<circle cx="70" cy="70" r="30" fill="var(--color-primary-normal)"/>'
        + '<path d="M70 58v22" stroke="var(--color-text-constant-normal)" stroke-width="5" stroke-linecap="round"/>'
        + '<circle cx="70" cy="50" r="3.5" fill="var(--color-text-constant-normal)"/>'
        + '</svg>'
    };
    return SVGS[kind] || SVGS.info;
  }

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
