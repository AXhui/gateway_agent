/* ==========================================================================
   引擎 ② · 装配规划 (Planner)
   --------------------------------------------------------------------------
   输入：parser 产出的意图 DSL
   输出：装配计划 plan = { template, modules:[{id, reason, delta}], entity, title }
   策略：
     step1 模板打分：模板关键词权重 + 实体偏好 + 场景命中
     step2 模块微调：按识别出的「形态 / 动作」对模板做增删，而不是整体替换
           —— 这是同一模板能产出不同页面结构的关键
     step3 依赖展开：模块 → 业务组件 → 基础组件，生成三层依赖清单
   ========================================================================== */
window.MSPlanner = (function () {

  /* 形态 → 需要补挂的模块（reason 会展示在推理链里） */
  const SURFACE_RULE = [
    { surface: '弹窗', module: 'mod-upgrade-task', why: '识别到「弹窗 / 模态」，补充批量任务弹窗区块' },
    { surface: '抽屉', module: 'mod-detail-drawer', why: '识别到「抽屉 / 侧滑」，补充详情抽屉区块' },
    { surface: '图表', module: 'mod-telemetry', why: '识别到「图表 / 趋势」，补充遥测图表区块' },
    { surface: '筛选', module: 'mod-filter-list', why: '识别到「筛选 / 搜索」，确保列表带筛选栏' },
    { surface: '表格', module: 'mod-filter-list', why: '识别到「表格 / 列表」，确保存在主数据表格' },
    { surface: '表单', module: 'mod-rule-config', why: '识别到「表单 / 录入」，补充配置表单区块' },
    { surface: '时间轴', module: 'mod-log', why: '识别到「时间轴 / 流水」，补充操作记录区块' },
    { surface: '卡片', module: 'mod-entity-cards', why: '识别到「卡片」，补充卡片墙区块' },
    { surface: '拓扑', module: 'mod-topology', why: '识别到「拓扑 / 结构图」，补充网络拓扑区块' },
    { surface: '空态', module: 'mod-empty', why: '识别到「空态 / 无数据」，切换为空态引导区块' },
    { surface: '指标', module: 'mod-metrics', why: '识别到「指标 / 概览」，补充指标卡区块' }
  ];

  const ACTION_RULE = [
    { action: '升级', module: 'mod-upgrade-task', why: '动作「升级 / 推送」需要任务弹窗承载执行流程' },
    { action: '处理', module: 'mod-detail-drawer', why: '动作「处理 / 指派」需要详情抽屉承载闭环操作' },
    { action: '查看', module: 'mod-entity-cards', why: '动作「查看 / 详情」补充对象卡片区' },
    { action: '导出', module: 'mod-filter-list', why: '动作「导出」依赖列表区的批量选择' },
    { action: '编辑', module: 'mod-rule-config', why: '动作「编辑 / 配置」需要表单区块' },
    { action: '新增', module: 'mod-quick-actions', why: '动作「新增 / 创建」补充快捷入口' }
  ];

  const SCENE_TEMPLATE = {
    概览: 'tpl-overview', 管理: 'tpl-list', 详情: 'tpl-detail', 分析: 'tpl-dashboard',
    配置: 'tpl-config', 审计: 'tpl-audit', 权限: 'tpl-permission', 升级: 'tpl-upgrade',
    拓扑: 'tpl-topology', 引导: 'tpl-onboard'
  };

  function scoreTemplates(intent) {
    const text = intent.raw.toLowerCase();
    return MS_TEMPLATES.map(t => {
      let score = 0; const hits = [];
      Object.keys(t.kw).forEach(w => {
        if (text.indexOf(w.toLowerCase()) !== -1) { score += t.kw[w]; hits.push(w); }
      });
      /* 实体偏好：弱信号，仅作加分项 */
      if (intent.entity && t.entities.indexOf(intent.entity.key) !== -1) { score += 2; hits.push('实体偏好:' + intent.entity.cn); }
      /* 场景命中：强信号 —— 「分析 / 审计 / 配置」这类场景词比实体更能决定页面骨架 */
      intent.scenes.forEach(s => {
        if (SCENE_TEMPLATE[s] === t.id) { score += 3; hits.push('场景:' + s); }
      });
      return { t, score, hits };
    }).sort((a, b) => b.score - a.score);
  }

  function pickTemplate(intent) {
    const ranked = scoreTemplates(intent);
    if (ranked[0].score > 0) return { ranked, chosen: ranked[0], reason: `关键词命中 ${ranked[0].hits.join(' / ')}，得分 ${ranked[0].score}` };
    /* 无关键词命中时，退回到场景映射，再退回到「列表管理」 */
    for (const s of intent.scenes) {
      const id = SCENE_TEMPLATE[s];
      if (id) {
        const chosen = { t: MS_TEMPLATE_INDEX[id], score: 1, hits: ['场景:' + s] };
        return { ranked, chosen, reason: `无关键词命中，按场景「${s}」映射到模板 ${MS_TEMPLATE_INDEX[id].cn}` };
      }
    }
    const fallback = { t: MS_TEMPLATE_INDEX['tpl-list'], score: 0, hits: ['兜底'] };
    return { ranked, chosen: fallback, reason: '未识别到明确场景，使用通用列表管理模板兜底' };
  }

  function plan(intent, opts) {
    const o = opts || {};
    const entity = intent.entity || MS_ENTITY_FALLBACK;
    const pick = pickTemplate(intent);
    const tpl = pick.chosen.t;

    let modules = tpl.modules.slice();
    const deltas = [];

    /* 形态驱动的模块增补 */
    SURFACE_RULE.forEach(r => {
      if (intent.surfaces.indexOf(r.surface) === -1) return;
      if (modules.indexOf(r.module) !== -1) return;
      if (r.surface === '空态') { modules = ['mod-empty', 'mod-quick-actions']; deltas.push({ type: 'replace', module: r.module, why: r.why }); return; }
      modules.push(r.module); deltas.push({ type: 'add', module: r.module, why: r.why });
    });

    /* 动作驱动的模块增补 */
    ACTION_RULE.forEach(r => {
      if (intent.actions.indexOf(r.action) === -1) return;
      if (modules.indexOf(r.module) !== -1) return;
      modules.push(r.module); deltas.push({ type: 'add', module: r.module, why: r.why });
    });

    /* 长度控制：保留模板既有顺序，附加模块按相关度追加，最多 5 个 */
    if (modules.length > 5) {
      const trimmed = modules.slice(modules.length - 5);
      deltas.push({ type: 'trim', module: trimmed[0], why: `模块数超过 5 个，按相关度裁剪，保留最相关的 5 个区块` });
      modules = trimmed;
    }

    /* 若用户显式指定了要复用的业务组件（learner 场景），插到首位 */
    if (o.prependModule && modules.indexOf(o.prependModule) === -1) {
      modules.unshift(o.prependModule);
      deltas.push({ type: 'add', module: o.prependModule, why: '新业务组件首次装配，置于页面首屏' });
    }

    const planModules = modules.map(id => ({
      id,
      cn: MS_MODULE_INDEX[id].cn,
      biz: MS_MODULE_INDEX[id].biz.slice(),
      reason: (deltas.find(d => d.module === id) || {}).why || (tpl.modules.indexOf(id) !== -1 ? '模板默认区块' : '相关性补充')
    }));

    /* 三层依赖展开 */
    const bizSet = new Set(), atomSet = new Set();
    planModules.forEach(m => m.biz.forEach(b => {
      bizSet.add(b);
      (MS_BIZ_INDEX[b] ? MS_BIZ_INDEX[b].atoms : []).forEach(a => atomSet.add(a));
    }));

    return {
      intent,
      template: tpl,
      templateScore: pick.chosen.score,
      templateReason: pick.reason,
      rankedTemplates: pick.ranked.slice(0, 3).map(r => ({ id: r.t.id, cn: r.t.cn, score: r.score })),
      entity,
      modules: planModules,
      deltas,
      biz: Array.from(bizSet),
      atoms: Array.from(atomSet),
      title: buildTitle(intent, tpl, entity),
      theme: o.theme || 'light'
    };
  }

  function buildTitle(intent, tpl, entity) {
    const raw = intent.raw.replace(/^请?帮我?/, '').replace(/[，。,.！!？?].*$/, '').trim();
    if (raw.length >= 4 && raw.length <= 18) return raw;
    return entity.cn + tpl.cn;
  }

  return { plan, scoreTemplates };
})();
