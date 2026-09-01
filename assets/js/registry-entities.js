/* ==========================================================================
   L3 前置 · 业务实体词典 (Entity Lexicon)
   --------------------------------------------------------------------------
   作用：① 供 parser 做实体识别；② 供业务组件的 slots 做字段装配；
        ③ 供 learner 在「新业务场景」下自动迁移字段，无需人工补写。
   每个实体含：aliases（一句话里的同义说法）、fields（列表列/表单项/详情项）、
              metrics（概览指标）、actions（行操作）、statuses（状态枚举）
   ========================================================================== */
window.MS_ENTITIES = {
  device: {
    key: 'device', cn: '设备', aliases: ['设备', '终端', '传感器设备', '节点', 'device', '节点设备', '感知设备'],
    fields: [
      { key: 'name', cn: '设备名称', type: 'text', w: 200 },
      { key: 'eui', cn: '设备 EUI', type: 'code', w: 190 },
      { key: 'model', cn: '型号', type: 'text', w: 140 },
      { key: 'status', cn: '状态', type: 'status', w: 100 },
      { key: 'group', cn: '所属分组', type: 'text', w: 140 },
      { key: 'rssi', cn: '信号强度', type: 'num', unit: 'dBm', w: 110 },
      { key: 'battery', cn: '电量', type: 'percent', w: 120 },
      { key: 'lastSeen', cn: '最后上报', type: 'time', w: 160 }
    ],
    formFields: ['name', 'model', 'group', 'status'],
    metrics: [
      { cn: '设备总数', value: '12,846', trend: '+128', dir: 'up', suffix: '台' },
      { cn: '在线设备', value: '11,204', trend: '87.2%', dir: 'up', suffix: '台' },
      { cn: '离线设备', value: '1,642', trend: '-36', dir: 'down', suffix: '台' },
      { cn: '今日告警', value: '37', trend: '+9', dir: 'up', suffix: '条' }
    ],
    actions: ['详情', '编辑', '远程配置', '删除'],
    statuses: [
      { cn: '在线', tone: 'success' }, { cn: '离线', tone: 'muted' },
      { cn: '告警', tone: 'error' }, { cn: '未激活', tone: 'muted' }
    ]
  },
  gateway: {
    key: 'gateway', cn: '网关', aliases: ['网关', '基站', 'gateway', '路由', '汇聚节点', 'LoRaWAN 网关'],
    fields: [
      { key: 'name', cn: '网关名称', type: 'text', w: 180 },
      { key: 'sn', cn: '序列号', type: 'code', w: 170 },
      { key: 'model', cn: '型号', type: 'text', w: 140 },
      { key: 'status', cn: '状态', type: 'status', w: 100 },
      { key: 'devices', cn: '接入设备', type: 'num', unit: '台', w: 110 },
      { key: 'firmware', cn: '固件版本', type: 'code', w: 120 },
      { key: 'heartbeat', cn: '最近心跳', type: 'time', w: 160 }
    ],
    formFields: ['name', 'model', 'sn', 'status'],
    metrics: [
      { cn: '网关总数', value: '326', trend: '+4', dir: 'up', suffix: '台' },
      { cn: '在线网关', value: '318', trend: '97.5%', dir: 'up', suffix: '台' },
      { cn: '接入设备', value: '12,846', trend: '+312', dir: 'up', suffix: '台' },
      { cn: '今日上行', value: '1.42', trend: '+6.1%', dir: 'up', suffix: 'M 条' }
    ],
    actions: ['详情', '配置', '重启', '删除'],
    statuses: [{ cn: '在线', tone: 'success' }, { cn: '离线', tone: 'muted' }, { cn: '异常', tone: 'error' }]
  },
  alarm: {
    key: 'alarm', cn: '告警', aliases: ['告警', '报警', '警报', '异常', '告警规则', '规则', 'alarm', '预警'],
    fields: [
      { key: 'rule', cn: '规则名称', type: 'text', w: 200 },
      { key: 'level', cn: '级别', type: 'level', w: 100 },
      { key: 'condition', cn: '触发条件', type: 'text', w: 220 },
      { key: 'target', cn: '触发对象', type: 'text', w: 160 },
      { key: 'time', cn: '触发时间', type: 'time', w: 160 },
      { key: 'status', cn: '处理状态', type: 'status', w: 110 }
    ],
    formFields: ['rule', 'level', 'condition', 'status'],
    metrics: [
      { cn: '未处理告警', value: '18', trend: '+5', dir: 'up', suffix: '条' },
      { cn: '紧急告警', value: '3', trend: '+1', dir: 'up', suffix: '条' },
      { cn: '今日已处理', value: '46', trend: '+12', dir: 'up', suffix: '条' },
      { cn: '平均响应', value: '4.2', trend: '-0.8', dir: 'down', suffix: '分钟' }
    ],
    actions: ['处理', '指派', '忽略', '详情'],
    statuses: [{ cn: '未处理', tone: 'error' }, { cn: '处理中', tone: 'warm' }, { cn: '已关闭', tone: 'muted' }]
  },
  firmware: {
    key: 'firmware', cn: '固件', aliases: ['固件', 'OTA', '升级', '版本', '固件升级', 'firmware', '批处理'],
    fields: [
      { key: 'version', cn: '版本号', type: 'code', w: 120 },
      { key: 'model', cn: '适用型号', type: 'text', w: 160 },
      { key: 'size', cn: '包大小', type: 'num', unit: 'KB', w: 110 },
      { key: 'progress', cn: '升级进度', type: 'percent', w: 160 },
      { key: 'devices', cn: '覆盖设备', type: 'num', unit: '台', w: 110 },
      { key: 'status', cn: '任务状态', type: 'status', w: 110 }
    ],
    formFields: ['version', 'model', 'status'],
    metrics: [
      { cn: '升级中', value: '1,208', trend: '+240', dir: 'up', suffix: '台' },
      { cn: '升级成功', value: '9,640', trend: '92.4%', dir: 'up', suffix: '台' },
      { cn: '升级失败', value: '86', trend: '-14', dir: 'down', suffix: '台' },
      { cn: '待推送', value: '1,912', trend: '+58', dir: 'up', suffix: '台' }
    ],
    actions: ['推送', '重试', '暂停', '详情'],
    statuses: [{ cn: '升级中', tone: 'primary' }, { cn: '已完成', tone: 'success' }, { cn: '失败', tone: 'error' }, { cn: '待推送', tone: 'muted' }]
  },
  member: {
    key: 'member', cn: '成员', aliases: ['成员', '用户', '人员', '账号', '角色', '权限', '组织', '团队', 'member', 'user'],
    fields: [
      { key: 'name', cn: '成员', type: 'user', w: 200 },
      { key: 'role', cn: '角色', type: 'role', w: 150 },
      { key: 'email', cn: '邮箱', type: 'text', w: 220 },
      { key: 'group', cn: '所属组织', type: 'text', w: 150 },
      { key: 'status', cn: '状态', type: 'status', w: 110 },
      { key: 'lastLogin', cn: '最后登录', type: 'time', w: 160 }
    ],
    formFields: ['name', 'role', 'email', 'status'],
    metrics: [
      { cn: '组织成员', value: '248', trend: '+6', dir: 'up', suffix: '人' },
      { cn: '管理员', value: '12', trend: '0', dir: 'flat', suffix: '人' },
      { cn: '待激活', value: '19', trend: '+3', dir: 'up', suffix: '人' },
      { cn: '本月新增', value: '27', trend: '+11', dir: 'up', suffix: '人' }
    ],
    actions: ['编辑权限', '重置密码', '停用', '移除'],
    statuses: [{ cn: '已激活', tone: 'success' }, { cn: '待激活', tone: 'warm' }, { cn: '已停用', tone: 'muted' }]
  },
  sensor: {
    key: 'sensor', cn: '测点', aliases: ['测点', '传感器', '遥测数据', '数据点', 'sensor', '采集点'],
    fields: [
      { key: 'name', cn: '测点名称', type: 'text', w: 180 },
      { key: 'metric', cn: '物理量', type: 'text', w: 130 },
      { key: 'unit', cn: '单位', type: 'text', w: 90 },
      { key: 'range', cn: '量程', type: 'text', w: 140 },
      { key: 'rate', cn: '采样频率', type: 'text', w: 120 },
      { key: 'status', cn: '状态', type: 'status', w: 100 }
    ],
    formFields: ['name', 'metric', 'unit', 'range', 'rate'],
    metrics: [
      { cn: '测点总数', value: '48,920', trend: '+820', dir: 'up', suffix: '个' },
      { cn: '今日采集', value: '3.28', trend: '+4.7%', dir: 'up', suffix: 'M 条' },
      { cn: '异常测点', value: '64', trend: '-8', dir: 'down', suffix: '个' },
      { cn: '采集成功率', value: '99.4', trend: '+0.2', dir: 'up', suffix: '%' }
    ],
    actions: ['配置', '校准', '导出', '详情'],
    statuses: [{ cn: '采集中', tone: 'success' }, { cn: '暂停', tone: 'muted' }, { cn: '异常', tone: 'error' }]
  },
  log: {
    key: 'log', cn: '日志', aliases: ['日志', '操作日志', '审计', '审计日志', '记录', '流水', 'log', 'audit'],
    fields: [
      { key: 'time', cn: '时间', type: 'time', w: 170 },
      { key: 'actor', cn: '操作人', type: 'user', w: 160 },
      { key: 'action', cn: '操作类型', type: 'level', w: 130 },
      { key: 'target', cn: '操作对象', type: 'text', w: 200 },
      { key: 'result', cn: '结果', type: 'status', w: 100 }
    ],
    formFields: ['actor', 'action', 'result'],
    metrics: [
      { cn: '今日操作', value: '1,428', trend: '+96', dir: 'up', suffix: '条' },
      { cn: '风险操作', value: '7', trend: '+2', dir: 'up', suffix: '条' },
      { cn: '失败操作', value: '13', trend: '-4', dir: 'down', suffix: '条' },
      { cn: '活跃操作人', value: '86', trend: '+9', dir: 'up', suffix: '人' }
    ],
    actions: ['查看详情', '导出', '标记'],
    statuses: [{ cn: '成功', tone: 'success' }, { cn: '失败', tone: 'error' }, { cn: '待审', tone: 'warm' }]
  }
};

/* 未命中词典时的通用兜底实体：保证 learner 对任意新业务也能产出结构完整页面 */
window.MS_ENTITY_FALLBACK = {
  key: 'generic', cn: '对象', aliases: [],
  fields: [
    { key: 'name', cn: '名称', type: 'text', w: 200 },
    { key: 'code', cn: '编号', type: 'code', w: 160 },
    { key: 'owner', cn: '负责人', type: 'user', w: 150 },
    { key: 'status', cn: '状态', type: 'status', w: 110 },
    { key: 'updatedAt', cn: '更新时间', type: 'time', w: 160 }
  ],
  formFields: ['name', 'code', 'owner', 'status'],
  metrics: [
    { cn: '总数量', value: '1,284', trend: '+42', dir: 'up', suffix: '条' },
    { cn: '进行中', value: '186', trend: '+12', dir: 'up', suffix: '条' },
    { cn: '已完成', value: '1,022', trend: '+30', dir: 'up', suffix: '条' },
    { cn: '异常', value: '12', trend: '-5', dir: 'down', suffix: '条' }
  ],
  actions: ['详情', '编辑', '删除'],
  statuses: [{ cn: '正常', tone: 'success' }, { cn: '异常', tone: 'error' }, { cn: '待处理', tone: 'warm' }]
};

/* ---------- 确定性造数：同一实体永远产出同一批样例数据，便于回归比对 ---------- */
window.MS_DATA = (function () {
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let s = seed || 1; return function () { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; }; }

  const NAMES = ['星海园区', '云谷工厂', '临江仓库', '南山基站', '滨江楼宇', '西溪实验室', '钱塘泵站', '运河管廊', '未来城 A 区', '太湖渔场', '钟楼变电站', '石桥冷链'];
  const MODELS = ['VS121', 'VS133', 'WS202', 'WS301', 'EM300-TH', 'AM107', 'UC500', 'SG50'];
  const GROUPS = ['默认分组', '生产车间', '仓储物流', '办公区', '室外环境', '能源计量'];
  const PEOPLE = ['陈亦然', '林见川', '苏若彤', '周砚青', '何知远', '许清和', '罗砚书', '沈南枝'];
  const ROLES = ['超级管理员', '组织管理员', '运维人员', '只读成员'];
  const MAIL = ['chenyr', 'linjc', 'surt', 'zhouyq', 'hezy', 'xuqh', 'luoys', 'shennz'];

  function pick(arr, r) { return arr[Math.floor(r() * arr.length) % arr.length]; }

  function build(entity, n) {
    const r = rng(hash(entity.key) + 7);
    const list = [];
    for (let i = 0; i < (n || 6); i++) {
      const st = entity.statuses[Math.floor(r() * entity.statuses.length) % entity.statuses.length];
      const row = { _status: st, _name: pick(NAMES, r) + ' ' + (i + 1) + ' 号' };
      entity.fields.forEach(f => {
        switch (f.type) {
          case 'code': row[f.key] = f.key === 'eui' || f.key === 'sn' ? ('24E1' + Math.floor(r() * 1e12).toString(16).toUpperCase().padStart(12, '0').slice(0, 12)) : ('v' + (1 + Math.floor(r() * 4)) + '.' + Math.floor(r() * 10) + '.' + Math.floor(r() * 10)); break;
          case 'status': row[f.key] = st.cn; break;
          case 'level': row[f.key] = ['紧急', '重要', '提示', '配置变更', '登录', '下发'][Math.floor(r() * 6)]; break;
          case 'num': row[f.key] = f.key === 'rssi' ? '-' + (60 + Math.floor(r() * 60)) : (1 + Math.floor(r() * 900)); break;
          case 'percent': row[f.key] = 20 + Math.floor(r() * 80); break;
          case 'time': row[f.key] = '2026-08-3' + Math.floor(r() * 9) + ' ' + String(8 + Math.floor(r() * 12)).padStart(2, '0') + ':' + String(Math.floor(r() * 60)).padStart(2, '0'); break;
          case 'user': row[f.key] = pick(PEOPLE, r); break;
          case 'role': row[f.key] = pick(ROLES, r); break;
          default:
            if (f.key === 'model') row[f.key] = pick(MODELS, r);
            else if (f.key === 'group') row[f.key] = pick(GROUPS, r);
            else if (f.key === 'email') row[f.key] = pick(MAIL, r) + '@milesight.com';
            else if (f.key === 'condition') row[f.key] = ['温度 > 45℃', '湿度 < 20%', '电量 < 15%', '离线超过 30 分钟', 'CO₂ > 1200ppm'][Math.floor(r() * 5)];
            else row[f.key] = pick(NAMES, r) + (f.key === 'metric' ? '' : ' 对象') + (i + 1);
        }
      });
      list.push(row);
    }
    return list;
  }

  /* 生成稳定的遥测序列（用于 SVG 图表，不使用任何第三方图表库） */
  function series(seedText, points, base, amp) {
    const r = rng(hash(String(seedText)) + 3);
    const out = []; let v = base;
    for (let i = 0; i < points; i++) { v = Math.max(0, v + (r() - 0.5) * amp); out.push(Math.round(v * 10) / 10); }
    return out;
  }
  return { build, series, rng, hash };
})();
