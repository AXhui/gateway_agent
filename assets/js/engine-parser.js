/* ==========================================================================
   引擎 ① · 意图解析 (Parser)
   --------------------------------------------------------------------------
   输入：一句中文产品需求
   输出：结构化意图 DSL —— { entity, scenes, surfaces, actions, modifiers, slot }
   方法：词典驱动的分词 + 权重打分 + 未知名词捕获
   说明：纯前端确定性实现，不依赖任何大模型接口，结果可复现、可回归。
   ========================================================================== */
window.MSParser = (function () {

  /* 形态：决定页面上必须出现哪种容器 / 控件 */
  const SURFACES = {
    弹窗: ['弹窗', '对话框', '模态', 'modal', '弹出'],
    抽屉: ['抽屉', '侧滑', 'drawer', '侧边面板'],
    表单: ['表单', '填写', '录入', '提交', '新增页', '创建页'],
    图表: ['图表', '趋势', '曲线', '折线', '柱状', '报表', '可视化', '走势'],
    表格: ['表格', '列表', '明细', '清单', '台账'],
    筛选: ['筛选', '过滤', '搜索', '查询', '检索', '条件'],
    批量: ['批量', '多选', '全选', '一起'],
    时间轴: ['时间轴', '时间线', '流水'],
    卡片: ['卡片', '卡片墙', '瓷砖'],
    拓扑: ['拓扑', '结构图', '关系图', '网络图'],
    空态: ['空态', '无数据', '没有数据', '空白'],
    导出: ['导出', '下载', 'excel', 'csv'],
    指标: ['指标', '概览', '总览', '统计', '看板', '大盘']
  };

  /* 动作：决定行操作与页头主按钮 */
  const ACTIONS = {
    新增: ['新增', '创建', '添加', '新建', '注册', '接入'],
    编辑: ['编辑', '修改', '配置', '设置', '调整'],
    删除: ['删除', '移除', '注销'],
    升级: ['升级', '推送', '下发', '更新固件', 'ota'],
    处理: ['处理', '指派', '关闭', '确认', '审核'],
    查看: ['查看', '详情', '详情查看', '浏览'],
    导出: ['导出', '下载'],
    筛选: ['筛选', '过滤', '搜索', '查询']
  };

  /* 场景：与模板强相关的意图词 */
  const SCENES = {
    概览: ['概览', '总览', '看板', '首页', '首屏', '大盘', '驾驶舱'],
    管理: ['管理', '维护', '运营', '治理'],
    详情: ['详情', '明细', '档案', '画像', '单台'],
    分析: ['分析', '统计', '洞察', '对比', '趋势'],
    配置: ['配置', '设置', '参数', '规则', '阈值'],
    审计: ['审计', '日志', '留痕', '追溯'],
    权限: ['权限', '成员', '角色', '组织', '授权'],
    升级: ['升级', '固件', 'ota', '灰度'],
    拓扑: ['拓扑', '网络', '结构'],
    引导: ['空态', '引导', '首次', '初始化', '接入引导']
  };

  const MODIFIERS = {
    实时: ['实时', '实时刷新', '秒级'],
    时间范围: ['最近', '近', '今日', '今天', '本周', '本月', '7 天', '7天', '30 天', '30天', '小时', '24'],
    状态: ['在线', '离线', '异常', '告警中', '未激活', '待处理'],
    级别: ['紧急', '严重', '重要', '提示', '警告'],
    规模: ['大屏', '全量', '灰度', '分批']
  };

  function hit(text, words) { return words.filter(w => text.indexOf(w) !== -1); }
  function keysOf(lex, text) {
    const out = [];
    Object.keys(lex).forEach(k => { if (hit(text, lex[k]).length) out.push(k); });
    return out;
  }

  /* 捕获词典外的业务名词：用于 learner 铸造新实体 */
  function captureNouns(text, known) {
    const stop = '的一个页面页面功能需求需要支持可以能够并且或者还有以及展示显示查看管理列表页面前端界面包含带含有有个做成生成帮我我想要请给我关于相关模块区域区块使用通过进行并且还要同时右侧左侧顶部底部弹窗抽屉表单图表';
    const cleaned = text.replace(/[，。、；：！？,.!?;:\/（）()"'「」【】\s]+/g, ' ');
    const out = [];
    // 连续中文片段切成 2~4 字窗口，取高频且非停用词的片段作为候选名词
    cleaned.split(' ').forEach(seg => {
      const zh = seg.match(/[\u4e00-\u9fa5]+/g);
      if (!zh) return;
      zh.forEach(s => {
        for (let len = 4; len >= 2; len--) {
          for (let i = 0; i + len <= s.length; i++) {
            const w = s.slice(i, i + len);
            if (stop.indexOf(w) !== -1) continue;
            if (known.indexOf(w) !== -1) continue;
            out.push(w);
          }
        }
      });
    });
    const freq = {};
    out.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    return Object.keys(freq).sort((a, b) => (freq[b] - freq[a]) || (b.length - a.length)).slice(0, 12);
  }

  function detectEntity(text) {
    const t = text.toLowerCase();
    const scores = [];
    Object.values(MS_ENTITIES).forEach(e => {
      let s = 0;
      e.aliases.forEach(a => { if (t.indexOf(a.toLowerCase()) !== -1) s += a.length; });
      if (s > 0) scores.push({ entity: e, score: s });
    });
    scores.sort((a, b) => b.score - a.score);
    return scores;
  }

  /* 从整句里剥离「动词前缀 + 页面类型后缀 + 修饰从句」，取出核心业务名词 */
  const LEAD_VERBS = /^(请|帮我|帮|给我|我想|我想要|我需要|需要|想要|要|做一个|做个|做一条|做|生成一个|生成个|生成|创建一个|创建|新建一个|新建|搭一个|搭|设计|产出|来一个|来个|新增|加一个|加)+/;
  const TAIL_TYPE = /(列表页面|列表页|管理页面|管理页|详情页面|详情页|配置页面|配置页|页面|界面|看板|大盘|驾驶舱|中心|系统|模块|功能|的需求|需求|原型|demo|DEMO|Demo)+$/;
  const SPLIT_MOD = /带|需要|要有|包含|支持|包括|展示|显示|呈现|以及|并且|和|与|还有|，|,|。|\.|；|;/;

  function extractEntityName(text) {
    let s = String(text || '').trim();
    s = s.replace(/^(一句话|用一句话)/, '');
    s = s.replace(LEAD_VERBS, '');
    s = s.replace(/^(一个|个)/, '');
    s = s.split(SPLIT_MOD)[0].trim();
    s = s.replace(TAIL_TYPE, '').trim();
    s = s.replace(/^(的|关于)/, '').trim();
    if (s.length > 8) s = s.slice(0, 8);
    return s;
  }

  function parse(raw) {
    const text = String(raw || '').trim();
    const t = text.toLowerCase();
    const entityHits = detectEntity(text);
    const entity = entityHits.length ? entityHits[0].entity : null;

    const knownWords = [];
    Object.values(MS_ENTITIES).forEach(e => knownWords.push.apply(knownWords, e.aliases));
    Object.values(SURFACES).concat(Object.values(ACTIONS), Object.values(SCENES)).forEach(arr => knownWords.push.apply(knownWords, arr));
    const nouns = captureNouns(text, knownWords);

    const scenes = keysOf(SCENES, t);
    const surfaces = keysOf(SURFACES, t);
    const actions = keysOf(ACTIONS, t);
    const modifiers = keysOf(MODIFIERS, t);

    /* 置信度：实体命中 40% + 场景命中 30% + 形态命中 30% */
    const conf = Math.min(1, (entity ? 0.4 : 0) + (scenes.length ? 0.3 : 0) + (surfaces.length ? 0.3 : 0.15));

    return {
      raw: text,
      entity, entityCandidates: entityHits,
      scenes, surfaces, actions, modifiers,
      nouns,
      confidence: Math.round(conf * 100) / 100,
      /* 用于 learner 铸造新实体的候选名：整句剥离动词与页面类型后的核心名词 */
      newEntityName: (!entity) ? (extractEntityName(text) || (nouns.length ? nouns[0] : null)) : null
    };
  }

  return { parse, SURFACES, ACTIONS, SCENES, MODIFIERS, detectEntity, extractEntityName };
})();
