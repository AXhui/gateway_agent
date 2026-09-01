/* ==========================================================================
   引擎 ④ · 还原度校验 (Validator)
   --------------------------------------------------------------------------
   「还原度 100%」不是一个形容词，而是四条可计算规则的结果：
   R1 令牌合规率：组件层与生成稿中不得出现任何硬编码色值，必须引用 L1 令牌
   R2 组件溯源率：生成稿使用的每一个 class 都必须能在资产库中溯源
   R3 依赖闭环率：业务组件声明的每一个基础组件依赖都必须是已封装状态
   R4 结构覆盖率：计划中的每一个模块都必须在生成稿中落地
   ========================================================================== */
window.MSValidator = (function () {

  function cssClasses(css) {
    const set = new Set();
    const re = /\.([a-zA-Z][\w-]*)/g;
    let m;
    while ((m = re.exec(css))) set.add(m[1]);
    return set;
  }

  function htmlClasses(html) {
    const set = new Set();
    const re = /class="([^"]*)"/g;
    let m;
    while ((m = re.exec(html))) {
      m[1].split(/\s+/).forEach(c => { if (c) set.add(c); });
    }
    return set;
  }

  function findHardcodedColors(text) {
    const out = [];
    const hex = /#([0-9a-fA-F]{3,8})\b/g;
    let m;
    while ((m = hex.exec(text))) out.push(m[0]);
    const rgb = /rgba?\([^)]*\)/g;
    while ((m = rgb.exec(text))) out.push(m[0]);
    return out;
  }

  function check(html, plan) {
    const rules = [];

    /* ---- R1 令牌合规 ---- */
    const cssUnderTest = MS_CSS.base + '\n' + MS_CSS.business;
    const bodyStart = html.indexOf('<body');
    const bodyHtml = bodyStart > -1 ? html.slice(bodyStart) : html;
    const badCss = findHardcodedColors(cssUnderTest);
    const badHtml = findHardcodedColors(bodyHtml);
    const totalColorRefs = (cssUnderTest.match(/var\(--/g) || []).length + (bodyHtml.match(/var\(--/g) || []).length;
    rules.push({
      id: 'R1', name: '令牌合规率', weight: 30,
      desc: '组件层与生成稿中所有视觉值必须引用 L1 令牌，不得出现硬编码色值',
      total: totalColorRefs, bad: badCss.length + badHtml.length,
      evidence: badCss.concat(badHtml).slice(0, 6)
    });

    /* ---- R2 组件溯源 ---- */
    const allowed = new Set();
    cssClasses(MS_CSS.base).forEach(c => allowed.add(c));
    cssClasses(MS_CSS.business).forEach(c => allowed.add(c));
    const used = htmlClasses(bodyHtml);
    const unknown = [];
    used.forEach(c => { if (!allowed.has(c)) unknown.push(c); });
    rules.push({
      id: 'R2', name: '组件溯源率', weight: 30,
      desc: '生成稿出现的每一个 class 都必须能在 L2/L3 资产库中溯源',
      total: used.size, bad: unknown.length,
      evidence: unknown.slice(0, 6)
    });

    /* ---- R3 依赖闭环 ---- */
    let deps = 0, badDeps = 0; const brokenDeps = [];
    plan.biz.forEach(b => {
      const comp = MS_BIZ_INDEX[b];
      if (!comp) { badDeps++; brokenDeps.push(b + '(未注册)'); return; }
      comp.atoms.forEach(a => {
        deps++;
        const base = MS_BASE_INDEX[a];
        if (!base) { badDeps++; brokenDeps.push(comp.id + '→' + a + '(不在册)'); }
        else if (!base.implemented) { badDeps++; brokenDeps.push(comp.id + '→' + a + '(未封装)'); }
      });
    });
    rules.push({
      id: 'R3', name: '依赖闭环率', weight: 25,
      desc: '业务组件声明的基础组件依赖必须全部为已封装状态',
      total: deps, bad: badDeps,
      evidence: brokenDeps.slice(0, 6)
    });

    /* ---- R4 结构覆盖 ---- */
    const planned = plan.modules.length;
    const landed = plan.modules.filter(m => html.indexOf('<!-- module:' + m.id + ' -->') !== -1).length;
    rules.push({
      id: 'R4', name: '结构覆盖率', weight: 15,
      desc: '装配计划中的每个模块都必须在生成稿中落地',
      total: planned, bad: planned - landed,
      evidence: plan.modules.filter(m => html.indexOf('<!-- module:' + m.id + ' -->') === -1).map(m => m.id)
    });

    rules.forEach(r => {
      r.pass = r.bad === 0;
      r.rate = r.total === 0 ? 1 : Math.max(0, (r.total - r.bad) / r.total);
    });

    const score = Math.round(rules.reduce((s, r) => s + r.rate * r.weight, 0) * 10) / 10;

    return {
      score,
      rules,
      counts: {
        atoms: plan.atoms.length,
        biz: plan.biz.length,
        modules: plan.modules.length,
        bytes: html.length
      }
    };
  }

  return { check, cssClasses, htmlClasses, findHardcodedColors };
})();
