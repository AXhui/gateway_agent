/* ==========================================================================
   引擎 ③ · 页面渲染 (Renderer)
   --------------------------------------------------------------------------
   输入：装配计划 plan
   输出：一份完整、可直接交付前端的静态 HTML（内联全部样式，零外部依赖）
   关键：样式只来自 library/*.css（令牌层 + 基础层 + 业务层），
        因此生成稿与线上产品在视觉上同源 —— 这是还原度可校验的前提。
   ========================================================================== */
window.MSRenderer = (function () {
  const U = MS_BIZ_UTIL, esc = U.esc, ico = U.ico;

  function sidebar(plan) {
    const active = plan.template.nav;
    return `<aside class="ms-sidebar">
      <div class="ms-sidebar-brand">
        <span class="ms-sidebar-brand-mark">M</span>
        <span class="ms-sidebar-brand-name">Milesight IoT</span>
      </div>
      <div class="ms-sidebar-body">
        ${MS_NAV.map(g => `
          <div class="ms-nav-group">${esc(g.group)}</div>
          <nav class="ms-nav">
            ${g.items.map(it => `<a class="ms-nav-item${it.cn === active ? ' ms-nav-item--active' : ''}">
              ${ico(it.icon, 16)}<span>${esc(it.cn)}</span>
              ${it.count ? `<span class="ms-nav-count">${esc(it.count)}</span>` : ''}
            </a>`).join('')}
          </nav>`).join('')}
      </div>
      <div class="ms-sidebar-foot">
        <div class="bc-user">
          <span class="ms-avatar">陈</span>
          <span>
            <span class="ms-list-title">陈亦然</span>
            <span class="ms-list-desc">平台运维 · 超级管理员</span>
          </span>
        </div>
      </div>
    </aside>`;
  }

  function header(plan) {
    return `<header class="ms-header">
      <div class="ms-header-left">
        <nav class="ms-breadcrumb">
          <a>首页</a><span class="ms-breadcrumb-sep">/</span>
          <a>${esc(plan.entity.cn)}管理</a><span class="ms-breadcrumb-sep">/</span>
          <span>${esc(plan.title)}</span>
        </nav>
      </div>
      <div class="ms-header-right">
        <label class="ms-input ms-input--sm" style="width:220px">${ico('search', 14)}<input placeholder="搜索设备 / 网关 / 告警"></label>
        <span class="ms-badge">${ico('alarm', 20)}<span class="ms-badge-count">18</span></span>
        <span class="ms-badge">${ico('log', 20)}</span>
        <span class="ms-avatar">陈</span>
      </div>
    </header>`;
  }

  function pageHeader(plan) {
    return `<div class="ms-page-header">
      <div class="ms-page-header-main">
        <div class="ms-page-header-title"><h1 class="ms-h3">${esc(plan.title)}</h1><span class="bc-generated-badge">AI 生成 · ${esc(plan.template.cn)}</span></div>
        <div class="ms-page-header-desc">需求原文：${esc(plan.intent.raw || '—')}</div>
      </div>
      <div class="ms-page-header-extra">
        <button class="ms-btn">${ico('refresh', 14)}刷新</button>
        <button class="ms-btn">${ico('download', 14)}导出</button>
        <button class="ms-btn ms-btn--filled">${ico('plus', 14)}新增${esc(plan.entity.cn)}</button>
      </div>
    </div>`;
  }

  function body(plan) {
    const rows = MS_DATA.build(plan.entity, 6);
    const ctx = { entity: plan.entity, rows, icon: plan.entity.key };
    return `<main class="ms-main">
      ${header(plan)}
      <div class="ms-content">
        ${pageHeader(plan)}
        ${plan.modules.map(m => {
          const mod = MS_MODULE_INDEX[m.id];
          const html = mod.render(Object.assign({}, ctx, { plain: m.biz.length > 1 }));
          return `<!-- module:${m.id} -->\n${html}`;
        }).join('\n')}
      </div>
    </main>`;
  }

  function document(plan) {
    const css = [MS_CSS.tokens, MS_CSS.base, MS_CSS.business].join('\n');
    return `<!doctype html>
<html lang="zh-CN" data-theme="${esc(plan.theme)}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${esc(plan.title)} · Milesight IoT</title>
<!-- 样式来源：library/tokens.css（L1 令牌）+ library/base.css（L2 基础组件）+ library/business.css（L3 业务组件） -->
<style>
${css}
</style>
</head>
<body class="bc-page">
<div class="ms-shell">
${sidebar(plan)}
${body(plan)}
</div>
</body>
</html>`;
  }

  return { document, body };
})();
