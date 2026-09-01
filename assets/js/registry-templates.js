/* ==========================================================================
   L5 · 页面模板层 (Templates)
   --------------------------------------------------------------------------
   模板 = 模块的有序组合 + 导航上下文。planner 先用一句话打分选模板，
   再按识别出的动作 / 形态做模块的增删微调（不是整体替换），
   这样同一句话的微小差异也能产出结构不同的页面。
   ========================================================================== */
window.MS_TEMPLATES = [
  {
    id: 'tpl-overview', cn: '概览看板', nav: '概览',
    desc: '首屏总览：指标 + 遥测 + 列表，适合「看板 / 总览 / 首页 / 监控」类需求。',
    modules: ['mod-quick-actions', 'mod-metrics', 'mod-telemetry', 'mod-filter-list'],
    kw: { 概览: 3, 总览: 3, 看板: 3, 首屏: 2, 首页: 3, 驾驶舱: 3, 监控: 2, 大盘: 3, 概况: 2, dashboard: 3, overview: 3 },
    entities: ['device', 'gateway', 'sensor']
  },
  {
    id: 'tpl-list', cn: '列表管理', nav: '设备管理',
    desc: '以表格为核心的管理页：筛选 + 列表 + 批量，适合「管理 / 维护 / 查询」类需求。',
    modules: ['mod-quick-actions', 'mod-filter-list'],
    kw: { 列表: 3, 管理: 3, 维护: 2, 查询: 2, 表格: 3, 明细: 2, 清单: 2, 台账: 3, 批量: 2, 导出: 2, 检索: 2 },
    entities: ['device', 'gateway', 'sensor', 'firmware']
  },
  {
    id: 'tpl-detail', cn: '详情页', nav: '设备详情',
    desc: '单个对象的深挖：卡片属性 + 遥测 + 操作记录，适合「详情 / 详情查看」类需求。',
    modules: ['mod-entity-cards', 'mod-telemetry', 'mod-log'],
    kw: { 详情: 3, 明细页: 3, 单台: 2, 属性: 2, 档案: 3, 画像: 3, 详情查看: 3, detail: 3 },
    entities: ['device', 'gateway', 'sensor']
  },
  {
    id: 'tpl-alarm', cn: '告警中心', nav: '告警中心',
    desc: '告警闭环：指标 + 告警列表 + 处理抽屉，适合「告警 / 预警 / 异常」类需求。',
    modules: ['mod-metrics', 'mod-filter-list', 'mod-detail-drawer'],
    kw: { 告警: 4, 报警: 4, 预警: 4, 异常: 3, 告警中心: 5, 故障: 3, 事件: 2, alarm: 4 },
    entities: ['alarm']
  },
  {
    id: 'tpl-upgrade', cn: '固件升级', nav: '固件升级',
    desc: 'OTA 任务：指标 + 设备列表 + 升级弹窗，适合「升级 / OTA / 推送」类需求。',
    modules: ['mod-metrics', 'mod-filter-list', 'mod-upgrade-task'],
    kw: { 升级: 4, 固件: 4, ota: 4, 推送: 3, 灰度: 3, 版本: 2, 批处理: 2, 下发: 3, firmware: 4 },
    entities: ['firmware', 'device']
  },
  {
    id: 'tpl-dashboard', cn: '数据分析', nav: '数据分析',
    desc: '以图表为主的分析页：指标 + 多图表 + 日志，适合「分析 / 报表 / 趋势」类需求。',
    modules: ['mod-metrics', 'mod-telemetry', 'mod-log'],
    kw: { 分析: 3, 报表: 3, 趋势: 3, 图表: 3, 统计: 2, 可视化: 3, 大屏: 2, 洞察: 3, 对比: 2, analytics: 3 },
    entities: ['sensor', 'device']
  },
  {
    id: 'tpl-topology', cn: '网关拓扑', nav: '网关管理',
    desc: '网络结构：拓扑图 + 网关列表，适合「网关 / 拓扑 / 网络结构」类需求。',
    modules: ['mod-topology', 'mod-filter-list'],
    kw: { 拓扑: 4, 网关: 4, 网络: 3, 结构: 2, 连接: 2, 架构: 2, 基站: 3, gateway: 4 },
    entities: ['gateway']
  },
  {
    id: 'tpl-permission', cn: '权限管理', nav: '组织与权限',
    desc: '成员与角色：权限表 + 组织概览，适合「权限 / 成员 / 角色 / 组织」类需求。',
    modules: ['mod-metrics', 'mod-member'],
    kw: { 权限: 4, 成员: 4, 角色: 4, 组织: 3, 用户: 3, 人员: 2, 账号: 2, 授权: 3, 团队: 2, 邀请: 2 },
    entities: ['member']
  },
  {
    id: 'tpl-config', cn: '配置页', nav: '系统配置',
    desc: '参数配置：配置表单 + 变更日志，适合「配置 / 设置 / 规则 / 参数」类需求。',
    modules: ['mod-rule-config', 'mod-log'],
    kw: { 配置: 4, 设置: 4, 规则: 3, 参数: 3, 阈值: 3, 新增: 2, 创建: 3, 编辑: 2, 表单: 3, 开关: 2 },
    entities: ['alarm', 'device', 'sensor']
  },
  {
    id: 'tpl-audit', cn: '审计日志', nav: '审计日志',
    desc: '操作留痕：指标 + 时间轴 + 筛选列表，适合「日志 / 审计 / 追溯」类需求。',
    modules: ['mod-metrics', 'mod-log', 'mod-filter-list'],
    kw: { 日志: 4, 审计: 4, 流水: 3, 追溯: 3, 操作记录: 4, 留痕: 3, 安全: 2, log: 3, audit: 4 },
    entities: ['log']
  },
  {
    id: 'tpl-onboard', cn: '空态引导', nav: '接入引导',
    desc: '零数据场景：空态 + 接入引导，适合「首次接入 / 空态 / 初始化」类需求。',
    modules: ['mod-empty', 'mod-quick-actions'],
    kw: { 空态: 4, 引导: 3, 首次: 3, 接入: 3, 初始化: 3, 开通: 2, 无数据: 4, onboard: 4 },
    entities: []
  }
];

window.MS_TEMPLATE_INDEX = Object.fromEntries(window.MS_TEMPLATES.map(t => [t.id, t]));

/* ---------- 控制台导航（生成稿侧边栏，按模板高亮当前项） ---------- */
window.MS_NAV = [
  { group: '监控', items: [{ cn: '概览', icon: 'dashboard' }, { cn: '告警中心', icon: 'alarm', count: 18 }, { cn: '数据分析', icon: 'chart' }] },
  { group: '设备', items: [{ cn: '设备管理', icon: 'device', count: '12.8k' }, { cn: '网关管理', icon: 'gateway' }, { cn: '固件升级', icon: 'firmware' }, { cn: '测点配置', icon: 'sensor' }] },
  { group: '系统', items: [{ cn: '组织与权限', icon: 'member' }, { cn: '审计日志', icon: 'log' }, { cn: '系统配置', icon: 'edit' }] }
];
