/* ==========================================================================
   引擎 ⑤ · 新业务组件学习生成 (Learner Agent)
   --------------------------------------------------------------------------
   目标：面对「资产库里没有的新业务」，agent 自主完成
        检索相似 → 抽取搭建逻辑 → 迁移字段 → 生成并注册新组件 → 装配成页
   关键机制：
     ① 搭建逻辑 = 业务组件声明的 atoms 依赖 + render 骨架，而非样式细节；
        样式细节由 L1 令牌保证，所以新组件天然继承线上视觉规范。
     ② 字段迁移 = 从最相似实体借用字段结构，改名后作为新实体的字段定义，
        因此新业务页面不会出现「结构空壳」。
     ③ 生成物全部注册回资产库，下次即可被 planner 直接复用，形成正循环。
   ========================================================================== */
window.MSLearner = (function () {

  const SURFACE_ATOM_HINT = {
    图表: ['card', 'tabs', 'segmented', 'statistic'],
    表格: ['table', 'checkbox', 'pagination'],
    筛选: ['input', 'select', 'button'],
    表单: ['form', 'input', 'select', 'switch'],
    弹窗: ['modal', 'steps', 'progress'],
    抽屉: ['drawer', 'descriptions', 'timeline'],
    时间轴: ['timeline', 'tag'],
    卡片: ['card', 'descriptions'],
    拓扑: ['card', 'badge', 'tag'],
    指标: ['statistic', 'card'],
    空态: ['empty', 'button']
  };

  function tokenize(text) {
    return String(text).toLowerCase().match(/[\u4e00-\u9fa5]{2,4}|[a-z]{2,}/g) || [];
  }

  /* 依「标签重合 + 依赖重合 + 形态提示」给业务组件打分 */
  function rankComponents(intent) {
    const toks = tokenize(intent.raw);
    const wantAtoms = new Set();
    (intent.surfaces || []).forEach(s => (SURFACE_ATOM_HINT[s] || []).forEach(a => wantAtoms.add(a)));

    return MS_BIZ_COMPONENTS.map(c => {
      let score = 0; const why = [];
      const tagText = (c.tags.join('') + c.cn).toLowerCase();
      toks.forEach(t => { if (tagText.indexOf(t) !== -1) { score += 2; why.push('语义:' + t); } });
      (intent.surfaces || []).forEach(s => { if (tagText.indexOf(s) !== -1) { score += 3; why.push('形态:' + s); } });
      (intent.actions || []).forEach(a => { if (tagText.indexOf(a) !== -1) { score += 2; why.push('动作:' + a); } });
      c.atoms.forEach(a => { if (wantAtoms.has(a)) { score += 1; why.push('依赖:' + a); } });
      return { c, score, why: Array.from(new Set(why)).slice(0, 4) };
    }).sort((a, b) => b.score - a.score);
  }

  /* 铸造新实体：借用最相似实体的字段结构，仅替换业务名词 */
  function mintEntity(name, base) {
    const metrics = (base.metrics || []).map(m => ({
      cn: String(m.cn).replace(base.cn, name), value: m.value, trend: m.trend, dir: m.dir, suffix: m.suffix
    }));
    const fields = (base.fields || []).map((f, i) => (i === 0 ? Object.assign({}, f, { cn: name + '名称' }) : f));
    return {
      key: 'x-' + MS_DATA.hash(name),
      cn: name,
      aliases: [name],
      fields, formFields: base.formFields || ['name', 'status'],
      metrics, actions: base.actions || ['详情', '编辑', '删除'],
      statuses: base.statuses || MS_ENTITY_FALLBACK.statuses,
      derivedFrom: base.cn
    };
  }

  /* 推断「用哪个已有实体做字段迁移的母本」：
     先按新名词与实体别名的字符重合度找；找不到就反推 —— 用最相似业务组件
     的 entityHint 所属实体作为母本（图表类组件 → 测点，列表类 → 设备…）。 */
  function pickBaseEntity(intent, topComponents) {
    if (intent.entity) return intent.entity;
    const name = intent.newEntityName;
    if (name) {
      let best = null, bestScore = 0;
      Object.values(MS_ENTITIES).forEach(e => {
        let s = 0;
        tokenize(e.cn + e.aliases.join('')).forEach(t => { if (name.indexOf(t) !== -1) s += t.length; });
        if (s > bestScore) { bestScore = s; best = e; }
      });
      if (best && bestScore > 0) return best;
    }
    if (topComponents && topComponents.length) {
      const hint = topComponents[0].c.entityHint;
      if (hint && MS_ENTITIES[hint]) return MS_ENTITIES[hint];
    }
    return MS_ENTITY_FALLBACK;
  }

  function run(raw, opts) {
    const o = opts || {};
    const trace = [];

    /* --- Step 1 意图解析 --- */
    const intent = MSParser.parse(raw);
    trace.push({
      title: '意图解析',
      detail: `实体「${intent.entity ? intent.entity.cn : '未命中'}」· 场景 ${intent.scenes.join('/') || '—'} · 形态 ${intent.surfaces.join('/') || '—'} · 动作 ${intent.actions.join('/') || '—'}`,
      chips: [].concat(intent.scenes, intent.surfaces, intent.actions)
    });

    /* --- Step 2 实体判定与字段迁移 --- */
    const preRank = rankComponents(intent);
    const base = pickBaseEntity(intent, preRank);
    let entity = intent.entity, minted = null;
    if (!entity) {
      const name = intent.newEntityName || '新业务对象';
      entity = mintEntity(name, base);
      minted = { name, from: base.cn };
      window.MS_ENTITIES[entity.key] = entity;
      trace.push({
        title: '铸造新实体',
        detail: `资产库无「${name}」。字段母本取自「${base.cn}」（依据：${preRank.length && preRank[0].c.entityHint === base.key ? '最相似业务组件的实体归属' : '名词重合度'}），迁移 ${entity.fields.length} 个字段 / ${entity.metrics.length} 个指标后注册进实体词典`,
        chips: entity.fields.slice(0, 5).map(f => f.cn)
      });
    } else {
      trace.push({
        title: '实体命中',
        detail: `命中已有实体「${entity.cn}」，直接复用其 ${entity.fields.length} 个字段定义`,
        chips: entity.fields.slice(0, 5).map(f => f.cn)
      });
    }

    /* --- Step 3 相似业务组件检索 --- */
    const ranked = rankComponents(intent);
    const top = ranked.slice(0, 3);
    trace.push({
      title: '检索相似业务组件',
      detail: `按「语义 + 形态 + 动作 + 依赖」四维打分，Top3：${top.map(t => `${t.c.cn}(${t.score})`).join(' · ')}`,
      chips: top.map(t => t.c.cn + ' ' + t.score)
    });

    /* --- Step 4 抽取搭建逻辑 --- */
    const skeletons = top.filter(t => t.score > 0).slice(0, 2);
    if (!skeletons.length) skeletons.push({ c: MS_BIZ_INDEX['bc-data-table'], score: 0, why: ['兜底'] });
    const atomUnion = [];
    skeletons.forEach(s => s.c.atoms.forEach(a => { if (atomUnion.indexOf(a) === -1) atomUnion.push(a); }));
    trace.push({
      title: '抽取搭建逻辑',
      detail: `从 ${skeletons.map(s => s.c.cn).join(' + ')} 抽出基础组件依赖序列：${atomUnion.join(' → ')}（共 ${atomUnion.length} 个原子组件，样式由令牌层统一保证）`,
      chips: atomUnion
    });

    /* --- Step 5 生成并注册新业务组件 --- */
    const suffix = skeletons[0].c.id.replace(/^bc-/, '');
    const newBizId = `bc-${entity.key}-${suffix}`;
    let reused = MS_BIZ_INDEX[newBizId];
    let newBiz;
    if (reused) {
      newBiz = reused;
      trace.push({ title: '命中已生成组件', detail: `「${newBiz.cn}」此前已由 agent 生成，本次直接复用（资产库具备记忆能力）`, chips: [newBizId] });
    } else {
      newBiz = {
        id: newBizId,
        cn: entity.cn + skeletons[0].c.cn,
        cat: skeletons[0].c.cat,
        desc: `由 Learner Agent 基于「${skeletons.map(s => s.c.cn).join(' + ')}」的搭建逻辑，迁移到「${entity.cn}」场景自动生成。`,
        atoms: atomUnion,
        tags: Array.from(new Set([].concat(entity.cn, intent.surfaces, intent.actions, skeletons[0].c.tags))),
        generated: true,
        derivedFrom: skeletons.map(s => s.c.id),
        render(ctx) {
          return skeletons.length === 1
            ? skeletons[0].c.render(ctx)
            : `<div class="ms-stack">${skeletons.map(s => s.c.render(ctx)).join('')}</div>`;
        }
      };
      MS_BIZ_COMPONENTS.push(newBiz);
      MS_BIZ_INDEX[newBiz.id] = newBiz;
      trace.push({
        title: '生成并注册新业务组件',
        detail: `新组件 ${newBizId}（${newBiz.cn}）已写入资产库，复用 ${atomUnion.length} 个已封装基础组件，0 行新样式`,
        chips: [newBizId, '0 行新样式']
      });
    }

    /* --- Step 6 注册承载模块 --- */
    const newModuleId = `mod-${entity.key}-${suffix}`;
    let newModule = MS_MODULE_INDEX[newModuleId];
    if (!newModule) {
      newModule = {
        id: newModuleId, cn: entity.cn + '区块', biz: [newBiz.id],
        tags: newBiz.tags, generated: true,
        render(ctx) {
          return `<section class="bc-section">
            <div class="bc-section-head">
              <div><div class="bc-section-title">${entity.cn}${skeletons[0].c.cn}</div><div class="bc-section-desc">由 Learner Agent 装配 · 复用 ${atomUnion.length} 个基础组件</div></div>
              <span class="bc-generated-badge">新业务组件</span>
            </div>
            ${newBiz.render(ctx)}
          </section>`;
        }
      };
      MS_MODULES.push(newModule);
      MS_MODULE_INDEX[newModule.id] = newModule;
    }

    /* --- Step 7 装配与渲染 --- */
    const plan = MSPlanner.plan(Object.assign({}, intent, { entity }), { theme: o.theme, prependModule: newModule.id });
    trace.push({
      title: '装配页面',
      detail: `模板「${plan.template.cn}」（${plan.templateReason}）+ 新组件区块，共 ${plan.modules.length} 个模块 / ${plan.biz.length} 个业务组件 / ${plan.atoms.length} 个基础组件`,
      chips: plan.modules.map(m => m.cn)
    });

    const html = MSRenderer.document(plan);
    const report = MSValidator.check(html, plan);
    trace.push({
      title: '还原度校验',
      detail: `${report.score}% · ${report.rules.map(r => `${r.name} ${r.bad === 0 ? '通过' : r.bad + ' 项异常'}`).join(' · ')}`,
      chips: report.rules.map(r => r.id + ' ' + Math.round(r.rate * 100) + '%')
    });

    return { intent, entity, minted, newBiz, newModule, skeletons: skeletons.map(s => ({ id: s.c.id, cn: s.c.cn, score: s.score, why: s.why })), plan, html, report, trace };
  }

  return { run, rankComponents, mintEntity };
})();
