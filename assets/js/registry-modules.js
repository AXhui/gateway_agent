/* ==========================================================================
   L4 · 页面模块层 (Modules / Blocks)
   --------------------------------------------------------------------------
   模块 = 1~N 个业务组件 + 区块标题 + 版式栅格。
   模块不认识具体业务，只做「区块级装配」，实体字段由 ctx 注入 —— 因此
   同一模块换一个实体即可复用到新业务页面（learner 的复用单元就是模块）。
   ========================================================================== */
(function () {
  const U = MS_BIZ_UTIL, esc = U.esc;

  function section(title, desc, inner, extra) {
    return `<section class="bc-section">
      <div class="bc-section-head">
        <div><div class="bc-section-title">${esc(title)}</div>${desc ? `<div class="bc-section-desc">${esc(desc)}</div>` : ''}</div>
        ${extra || ''}
      </div>
      ${inner}
    </section>`;
  }
  function biz(id, ctx) { return MS_BIZ_INDEX[id].render(ctx); }

  window.MS_MODULES = [
    {
      id: 'mod-quick-actions', cn: '快捷操作区', biz: ['bc-quick-actions'],
      tags: ['快捷', '操作', '入口', '新建', '常用'],
      render(ctx) { return biz('bc-quick-actions', ctx); }
    },
    {
      id: 'mod-metrics', cn: '指标概览区', biz: ['bc-metric-card'],
      tags: ['指标', '概览', '总览', '统计', '看板', '首屏', '数据', '监控', '大屏'],
      render(ctx) { return section(ctx.entity.cn + '概览', '数据每 5 分钟刷新一次', biz('bc-metric-card', ctx)); }
    },
    {
      id: 'mod-filter-list', cn: '列表管理区', biz: ['bc-filter-bar', 'bc-data-table'],
      tags: ['列表', '管理', '筛选', '搜索', '查询', '批量', '表格', '明细', '分页', '导出', '维护'],
      render(ctx) {
        return section(ctx.entity.cn + '列表', '支持多选、批量操作与导出',
          `<div class="ms-stack">${biz('bc-filter-bar', ctx)}${biz('bc-data-table', ctx)}</div>`);
      }
    },
    {
      id: 'mod-entity-cards', cn: '卡片墙区', biz: ['bc-entity-card'],
      tags: ['卡片', '视图', '墙', '概览', '属性', '信息'],
      render(ctx) { return section(ctx.entity.cn + '卡片', '点击卡片进入详情', biz('bc-entity-card', ctx)); }
    },
    {
      id: 'mod-telemetry', cn: '遥测数据区', biz: ['bc-telemetry-panel'],
      tags: ['数据', '遥测', '图表', '趋势', '曲线', '监控', '报表', '分析', '统计', '可视化'],
      render(ctx) { return section('遥测数据', '按小时聚合 · 支持导出原始采样', biz('bc-telemetry-panel', ctx)); }
    },
    {
      id: 'mod-rule-config', cn: '规则配置区', biz: ['bc-rule-form'],
      tags: ['配置', '规则', '表单', '新增', '编辑', '设置', '创建', '参数', '阈值'],
      render(ctx) { return section('配置', '修改后需保存并启用才生效', biz('bc-rule-form', ctx)); }
    },
    {
      id: 'mod-detail-drawer', cn: '详情抽屉区', biz: ['bc-detail-drawer'],
      tags: ['详情', '抽屉', '查看', '处理', '单条', '记录'],
      render(ctx) { return section('详情与处理', '在列表中点击任意一行打开', biz('bc-detail-drawer', ctx)); }
    },
    {
      id: 'mod-upgrade-task', cn: '批量任务区', biz: ['bc-upgrade-modal'],
      tags: ['升级', '固件', 'OTA', '批量', '推送', '弹窗', '任务', '灰度', '下发'],
      render(ctx) { return section('批量任务', '分步执行，可随时暂停', biz('bc-upgrade-modal', ctx)); }
    },
    {
      id: 'mod-topology', cn: '网络拓扑区', biz: ['bc-topology'],
      tags: ['拓扑', '网络', '结构', '关系', '连接', '架构', '网关'],
      render(ctx) { return section('网络拓扑', '展示两层连接关系与实时状态', biz('bc-topology', ctx)); }
    },
    {
      id: 'mod-member', cn: '成员权限区', biz: ['bc-member-table'],
      tags: ['成员', '权限', '角色', '组织', '用户', '人员', '账号', '授权', '团队'],
      render(ctx) { return section('成员与权限', '角色变更即时生效', biz('bc-member-table', ctx)); }
    },
    {
      id: 'mod-log', cn: '日志审计区', biz: ['bc-log-timeline'],
      tags: ['日志', '审计', '流水', '记录', '操作记录', '追踪', '安全'],
      render(ctx) { return section(ctx.entity.cn + '记录', '保留 180 天', biz('bc-log-timeline', ctx)); }
    },
    {
      id: 'mod-empty', cn: '空态引导区', biz: ['bc-empty-state'],
      tags: ['空态', '引导', '无数据', '首次', '开通', '初始化', '新建'],
      render(ctx) { return section(ctx.entity.cn + '接入', '尚未产生数据时的页面形态', biz('bc-empty-state', ctx)); }
    }
  ];

  window.MS_MODULE_INDEX = Object.fromEntries(window.MS_MODULES.map(m => [m.id, m]));
})();
