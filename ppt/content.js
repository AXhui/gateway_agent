/* Local content only. All evidence is copied from the supplied M3 material. */
const A = 'assets/';
const shot = (file, alt, cls = '') => `<button class="evidence ${cls}" data-image="${file}" data-caption="${alt}" aria-label="放大：${alt}"><img src="${A + file}" alt="${alt}" loading="eager"><span class="image-affordance">查看原图 ↗</span></button>`;
const reveal = (step, html, cls = '') => `<div class="reveal ${cls}" data-step="${step}">${html}</div>`;
const path = (items, cls = '') => `<div class="path ${cls}">${items.map((x,i)=>`<div class="path-node reveal" data-step="${i}"><span class="node-index">0${i+1}</span><strong>${x}</strong></div>`).join('')}</div>`;
const head = (kicker,title,desc='') => `<div class="section-heading"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${desc?`<p class="intro">${desc}</p>`:''}</div>`;
const movie = (id, start, end, poster, rate=1) => `<div class="media-shell" data-media="${id}" data-start="${start}" data-end="${end}" data-rate="${rate}" data-poster="${poster}"><div class="media-top"><span><i class="blue-dot"></i>真实项目录屏 <span class="muted">/ EG71</span></span><span class="clip-label">${start}–${end} 秒${rate!==1?' · '+rate+'×':''}</span></div><div class="media-screen"><video id="${id}" controls playsinline preload="metadata" poster="${A+poster}" aria-label="EG71 真实流程录屏"><source src="${A}workflow.mp4" type="video/mp4"></video><div class="video-fallback" hidden><img src="${A+poster}" alt="录屏备用截图"></div></div><div class="media-actions"><button data-video-action="play">播放片段</button><button data-video-action="restart">从片段开头重播</button><button data-video-action="fallback">切换截图</button><span class="media-status" role="status">手动播放 · 到片段结尾自动暂停</span></div></div>`;

const DECK = [
  {
    title:'让 AI 懂业务', chapter:'01 / THE NEXT WAY', duration:25, steps:3, className:'cover',
    html:`<p class="eyebrow cover-kicker">MS AI COLLABORATOR / 基于飞书生态的 AI 解决方案</p><h1 class="cover-title">让 AI 懂业务，<br>让设计经验<br>成为<span class="blue">团队能力。</span></h1><div class="cover-side"><span class="vertical-rule"></span><p>懂公司业务<br>会设计<br>能协作</p><span class="mini-label">A NEW WAY TO WORK</span></div><div class="cover-bottom"><div><p class="cover-team">UED Next</p><p class="muted">游贤辉 · 陈文昆 / UED × 视频制作</p></div>${path(['需求','生成','核对','交付'],'cover-path')}</div>`,
    notes:'各位评委、小伙伴们，大家好！我们是 UED Next。今天分享的是基于飞书打造的一名懂公司业务、会设计、能协作的 AI 协作伙伴。我们希望把个人的设计经验，变成整个团队都能调用的能力。',
    cues:['先停一拍，让评委读到主张。','推进：需求进入。','推进：生成与核对。','推进：交付，进入业务背景。']
  },
  {
    title:'时间，应该留给体验',chapter:'02 / THE PROBLEM',duration:35,steps:2,
    html:head('THE PROBLEM / 真实的工作现场','忙于出稿，<br>留给体验的时间越来越少。')+`<div class="pressure-metrics"><div><span class="number">1</span><span>位设计师</span></div><div><span class="number">3</span><span>个项目组</span></div><div><span class="number blue">9</span><span>份并行需求</span></div></div><p class="source-note">并行需求口径：原方案所述 10 月提交需求；团队整体支撑 7 条产品线。</p>${reveal(1,`<div class="workload"><span>理解需求</span><span>重复画稿</span><span>多轮对齐</span><span>返工修改</span><b>体验判断？</b></div>`)}${reveal(2,'<p class="statement">我们想要的，是把时间还给<span class="blue">设计师。</span></p>')}`,
    notes:'我们要支撑 7 条产品线。以当前岗位为例，一个设计师对接三个项目组，10 月同时处理九份需求。需求理解、重复搭页面、多轮对齐消耗了大量时间，真正应该投入的用户体验和业务思考反而被挤占。所以我们想，能不能让 AI 承担重复工作，把时间还给设计师？',cues:['先讲真实工作量。','推进：时间消耗在重复环节。','推进：把时间还给设计师。']
  },
  {
    title:'快，还不够',chapter:'03 / THREE QUESTIONS',duration:30,steps:2,
    html:head('THE GAP / 普通 AI 还缺什么','会生成界面，<br>还要真正理解工作。')+`<div class="questions"><div><span>01</span><h2>懂业务</h2><p>理解产品与真实场景</p></div>${reveal(1,'<span>02</span><h2>守标准</h2><p>遵循组件与交互规范</p>')}${reveal(2,'<span>03</span><h2>能协作</h2><p>让成果进入团队流程</p>')}</div><div class="bottom-thesis">生成一次 Demo 很快。<span class="blue">让下一次依然可靠，才是关键。</span></div>`,
    notes:'我们试过直接让 AI 生成界面，确实快，但漂亮不等于符合产品规范。换个人、换个工具，经验也未必能够复用。因此我们要解决三个问题：怎么懂业务，怎么符合标准，怎么真正进入团队协作？',cues:['懂业务。','推进：守标准。','推进：能协作。']
  },
  {
    title:'业务大脑 × 协作骨架',chapter:'04 / THE SYSTEM',duration:40,steps:2,
    html:head('THE SYSTEM / 三层能力','给 AI 业务大脑，<br>用飞书连接团队。')+`<div class="architecture"><div class="arch-layer"><span class="layer-tag">01 / 底座</span><div><h2>Agent · 业务能力</h2><p>组件资产 / 业务规则 / 设计规范</p></div><span class="layer-out">按公司标准生成</span></div>${reveal(1,'<span class="layer-tag">02 / 骨架</span><div><h2>飞书 · 协作能力</h2><p>需求文档 / 台账 / 评论 / 工作流 / 通知</p></div><span class="layer-out">让过程可追踪</span>','arch-layer')}${reveal(2,'<span class="layer-tag">03 / 产出</span><div><h2>Demo ＋ Figma · 交付能力</h2><p>可交互原型 / 可编辑设计稿 / 人工审核精修</p></div><span class="layer-out">让成果可使用</span>','arch-layer')}</div>`,
    notes:'我们的思路是把公司的设计经验教给 AI。底座是业务能力，让 AI 调用组件与规范；骨架是飞书协作，让版本、质量、问题和审核进入团队流程；最终产出可交互 Demo 与可编辑 Figma 稿。人来负责最终审核和体验判断。',cues:['底座：业务能力。','推进：飞书连接协作。','推进：形成可用交付物。']
  },
  {
    title:'把经验教给 AI',chapter:'05 / BUSINESS KNOWLEDGE',duration:35,steps:2,
    html:head('BUSINESS KNOWLEDGE / 资产同源','把经验沉淀下来，<br>每一次生成都有依据。')+`<div class="asset-equation"><div><span class="number">63</span><p>基础组件</p></div><b>＋</b><div><span class="number">85</span><p>业务组件</p></div><b>＝</b><div class="token-anchor" data-token-anchor></div></div>${reveal(1,'<div class="asset-rule"><span>统一规则</span><span>GitHub 同源维护</span><span>组件与规范复用</span></div>')}${reveal(2,'<div class="product-lines"><span>云平台</span><span>CCTV</span><span>CV</span><span>网关</span><span>路由器</span><span>uink</span><span>其他产品线</span></div><p class="source-note">团队覆盖 7 条产品线；具体分类以项目台账为准。</p>')}`,
    notes:'目前已经整理了 63 个基础组件和 85 个业务组件，一共 148 个。组件、设计规范和 Agent 规则统一维护，让生成有据可依。团队覆盖七条产品线，新产品线仍需补充对应业务规则。这里展示的是共同资产底座，而不是声称所有产品线已全面上线。',cues:['63＋85＝148。','推进：同源维护与统一规则。','推进：支撑多产品线复用。']
  },
  {
    title:'飞书，让协作真正发生',chapter:'06 / CONNECTED BY FEISHU',duration:30,steps:3,
    html:head('CONNECTED BY FEISHU / 协作骨架','生成之后，<br>每一步都有人接住。')+path(['文档 · 提交需求','台账 · 记录成果','评论 · 核对差异','通知 · 推动确认'],'feishu-path')+`<div class="feishu-details"><p>需求源头<br><b>有据可查</b></p><p>版本与质量<br><b>统一留痕</b></p><p>问题回到原文<br><b>就地确认</b></p><p>任务送达负责人<br><b>继续流转</b></p></div><div class="foundation"><div class="token-anchor small" data-token-anchor></div><p>业务知识持续复用</p><span></span><strong>AI 工具可换，协作流程持续沉淀。</strong></div>`,
    notes:'如果只生成 Demo，不一定要用飞书。但团队协作需要统一的需求源头、版本与质量台账、差异评论和负责人通知。飞书把这些连接起来。模型和工具可以替换，流程与数据仍然沉淀在飞书。',cues:['文档是源头。','推进：成果自动入账。','推进：差异回到原文。','推进：通知推动人工确认。']
  },
  {
    title:'一次真实需求',chapter:'07 / SEE IT WORK',duration:75,steps:2,className:'demo-slide',
    html:head('SEE IT WORK / EG71 真实项目','从一份 PRD，到可评审的 Demo。')+`<div class="demo-layout"><div class="demo-rail"><button class="demo-step" data-clip="0,18,prd.png" data-go-step="0"><span>01</span><h2>读取需求</h2><p>理解 PRD，匹配组件</p></button><button class="demo-step" data-clip="18,45,demo.png" data-go-step="1"><span>02</span><h2>生成 Demo</h2><p>可点击、可操作</p></button><button class="demo-step" data-clip="45,57,ledger.png" data-go-step="2"><span>03</span><h2>自动入账</h2><p>版本、质量、链接留痕</p></button></div>${movie('workflow',0,18,'prd.png')}</div><p class="source-note">真实录屏按阶段播放；生成结果仍需 UED 审核。</p>`,
    notes:'接下来给协作伙伴安排一个真实任务。第一步，读取产品提交的 PRD，拆解需求并匹配组件。第二步，生成可点击、可操作的 HTML Demo。第三步，预览链接、版本和质量结果自动进入飞书台账。三个片段均需手动点击播放；讲解完成后按下一步切换阶段。',cues:['播放 0–18 秒：需求与生成过程。','播放 18–45 秒：体验真实 Demo。','播放 45–57 秒：飞书台账留痕。']
  },
  {
    title:'让问题回到需求源头',chapter:'08 / THE QUALITY LOOP',duration:45,steps:3,className:'loop-slide',
    html:head('THE QUALITY LOOP / 最关键的闭环','生成之后，<span class="blue">再核对一次。</span>')+`<div class="loop-layout"><div class="focus-frame">${shot('prd-comments.png','PRD 原文与差异评论：建议、链接和负责人确认','focus-evidence')}<span class="focus-callout reveal" data-step="1">差异，定位回 PRD 原文</span></div><div class="loop-steps"><div><span>01</span><h2>发现差异</h2><p>Demo 对照 PRD 逐条比对</p></div>${reveal(1,'<span>02</span><h2>定位原文</h2><p>附修改建议与预览链接</p>')}${reveal(2,'<span>03</span><h2>提醒负责人</h2><p>在需求源头确认与回复</p>')}${reveal(3,'<div class="human-decision">AI 辅助检查<br><b>最终由人判断。</b></div>')}</div></div>`,
    notes:'这是最想强调的区别：生成后，系统还会把 Demo 与 PRD 逐条核对。发现差异，就把建议和预览链接定位回需求原文，并提醒负责人。产品不用反复翻找 Demo，可以在源头确认。AI 辅助检查，最终由人判断和确认。可点击截图放大证据。',cues:['展示全貌：生成后继续检查。','推进：画面聚焦评论。','推进：提醒负责人。','推进：明确人工判断。']
  },
  {
    title:'交付，可以继续编辑',chapter:'09 / READY FOR HANDOFF',duration:40,steps:1,className:'demo-slide',
    html:head('READY FOR HANDOFF / 真正的设计资产','可交互，也可继续编辑。')+`<div class="handoff-layout"><div class="handoff-copy"><div class="delivery-label">HTML DEMO</div><h2>可体验的原型</h2><p>产品评审 / 售前演示</p><div class="handoff-arrow">↓ <span>自研转换脚本</span></div><div class="delivery-label blue">FIGMA DESIGN</div><h2>可编辑的设计稿</h2><p>组件衔接 / 设计精修 / 研发交付</p>${reveal(1,'<div class="human-decision">UED 审核与精修<br><b>对最终体验负责。</b></div>')}</div>${movie('figma',76,129,'figma.png',1.5)}</div><p class="source-note">真实转稿片段以 1.5× 播放，约 35 秒；保留人工审核与设计精修。</p>`,
    notes:'通过审核后，自研脚本把 HTML 转为可编辑的 Figma 稿。这里用约 35 秒展示转稿与图层编辑。交付的不只是一张图片：产品能体验 Demo，设计师能继续编辑精修，研发能使用设计资产。UED 始终对最终体验负责。',cues:['手动播放 Figma 转稿片段，1.5×。','推进：强调人工审核与精修。']
  },
  {
    title:'不仅快，还要算得清',chapter:'10 / MEASURABLE VALUE',duration:55,steps:2,
    html:head('MEASURABLE VALUE / 价值与口径','把重复劳动压缩，<br>把价值留给团队。')+`<div class="value-layout"><div class="time-chart"><p class="chart-title">设计初稿阶段 <span>同一时间标尺 / 天</span></p><div class="time-row"><span>传统方式</span><div class="bar-track"><div class="time-bar traditional"><span>4–10 天</span></div></div></div><div class="time-row"><span>方案辅助</span><div class="bar-track"><div class="time-bar improved"></div><b class="blue half-day">约半天</b></div></div><div class="axis"><span>0</span><span>5</span><span>10 天</span></div><p class="source-note">比较设计初稿，不等同于完整项目交付周期。<br>基于现有项目实践口径，推广效果需持续验证。</p></div><div class="value-results">${reveal(1,'<div class="value-number"><strong>300</strong><span>人天 / 年</span></div><p>预计年化节省 · 保守测算</p><div class="value-number secondary"><strong>15<span>万</span></strong><span>元 / 年</span></div>')}${reveal(2,'<div class="value-formula">133 个历史已完成需求 × 约 75% 覆盖<br>≈ 100 个 × 净省 3 人天 × 500 元 / 人天</div><p class="source-note">金额按保守内部成本折算，正式标准待 HR / 财务核定。<br>年化收益未扣除建设、维护及模型运行费用。</p>')}</div></div>`,
    notes:'效率比较的是设计初稿：过去四到十天，现在约半天，不是整个项目交付周期。规模化收益是保守测算：历史全年 133 个已完成需求，假设覆盖约 75%，约 100 个项目，每个净省三人天，预计年省三百人天。按五百元每人天折算约十五万元。这不是已经实现的全年收益，也未扣除建设、维护与模型费用。',cues:['先讲初稿时间对比。','推进：展示年化保守测算。','推进：公开计算依据与边界。']
  },
  {
    title:'让个人经验，成为组织能力',chapter:'11 / BUILT TO SCALE',duration:35,steps:2,
    html:head('BUILT TO SCALE / 从个人到团队','协作骨架固定，<br>业务知识可以生长。')+`<div class="scale-layout"><div class="fixed-spine"><p class="eyebrow">共同的执行骨架</p><h2>飞书协作流程</h2><p>需求 → 生成 → 校验 → 留痕 → 通知</p><div class="knowledge-slot"><span>换上部门知识</span><b>规则 / 模板 / 评分标准</b></div></div><div class="scale-examples">${reveal(0,'<span class="status-tag">已验证 · 设计主链路</span><h2>设计协作</h2><p>组件规范 → Demo / Figma</p>')}${reveal(1,'<span class="status-tag">已有拓展示例</span><h2>问题收集 · 学习培训</h2><p>统一接收与分发 / 任务与点评闭环</p>')}${reveal(2,'<span class="status-tag planned">未来规划</span><h2>连接产品与研发</h2><p>知识库 → 组件 → 代码与测试</p>')}</div></div>`,
    notes:'如果只解决一个人的问题，价值有限。我们希望飞书协作骨架可以复用，不同部门装入自己的规则、模板和标准。问题收集与学习培训已经有拓展示例。未来希望上接产品知识库、下接研发代码；这部分属于规划，不能当成已落地结果。',cues:['设计主链路已验证。','推进：已有拓展示例。','推进：未来连接产品与研发。']
  },
  {
    title:'UED Next',chapter:'12 / THE NEXT WAY',duration:25,steps:1,className:'closing',
    html:`<p class="eyebrow">THE NEXT WAY / 一种新的工作方式</p><div class="closing-title"><p>AI 负责把事情<span class="blue">做出来。</span></p>${reveal(1,'<p>UED 负责把事情<br><span class="blue">做对、做好、做出价值。</span></p>')}</div><div class="closing-bottom"><div class="closing-brand">UED<span>Next</span><i></i></div><p>让 AI 承担重复执行。<br>让人专注判断与创造。</p><span class="thanks">谢谢。</span></div>`,
    notes:'AI 可以越来越快地生成页面，但理解用户、判断体验和做出设计决策仍需要人。UED Next 代表一种新的工作方式：让协作伙伴承担重复执行，让飞书连接人与任务，让设计师专注判断与创造。AI 负责把事情做出来，UED 负责把事情做对、做好、做出价值。谢谢大家！',cues:['AI 承担执行。','推进后停留：UED 对价值负责。']
  },
  {
    title:'备用 / 功能与证据',chapter:'APPENDIX A / CAPABILITIES',duration:0,steps:0,className:'appendix',
    html:head('APPENDIX A / 已落地功能','从输入到回流，全程有据可查。')+`<div class="capability-grid"><div><h2>输入与生成</h2><p>PRD 读取与需求拆解<br>匹配组件与业务规范<br>生成交互 HTML Demo</p>${shot('demo.png','真实 HTML Demo')}</div><div><h2>留痕与校验</h2><p>版本、质量、链接入账<br>5 维质量校验与组件统计<br>差异回写 PRD 原文</p>${shot('ledger.png','飞书质量与成果台账')}</div><div><h2>审核与交付</h2><p>机器人提醒与工作流审核<br>自研 HTML → Figma 转稿<br>UED 人工审核与精修</p>${shot('notification.jpg','Figma 转稿通知与成果链接')}</div></div>`,
    notes:'备用页：根据评委问题选择放大证据。质量评分是辅助机制，不等同于完全自动保证可交付。具体五维名称未在提供的文字材料中列清，不额外编造。',cues:['点击截图查看原图。']
  },
  {
    title:'备用 / 成本口径',chapter:'APPENDIX B / COST & ASSUMPTIONS',duration:0,steps:0,className:'appendix',
    html:head('APPENDIX B / 成本与边界','收益预测，和真实投入分开看。')+`<div class="cost-table"><div><b>历史需求</b><strong>133 个 / 年</strong><span>原方案统计：全年已完成需求</span></div><div><b>年化收益预测</b><strong>约 300 人天 / 15 万元</strong><span>75% 覆盖 × 3 人天净省；未扣除投入及运行费</span></div><div><b>一次性建设</b><strong>15 人天 / 约 0.75 万元</strong><span>原方案记录，按 500 元 / 人天折算</span></div><div><b>静态回本点</b><strong>约 5 个项目</strong><span>15 ÷ 3；仅覆盖建设人力，不含维护和运行费用</span></div><div><b>长会话费用样本</b><strong>约 26–49 元</strong><span>13 轮修订、约 3.2 小时；按原方案模型价格折算，非单需求账单</span></div></div><p class="source-note">维护口径待统一，暂不计入投入倍数。模型费用以实际平台账单为准；金额标准待 HR / 财务核定。</p>`,
    notes:'区分三类数据：历史需求量是原方案统计，年化节省是预测，建设投入是原方案记录。五个项目回本只计算建设人力。长会话费用是价格折算样本，不是单条需求成本。原稿维护成本存在冲突，未使用相关年化维护值及投入倍数。',cues:['口径透明，不把预测说成实绩。']
  },
  {
    title:'备用 / 评委问答',chapter:'APPENDIX C / QUESTIONS',duration:0,steps:0,className:'appendix',
    html:head('APPENDIX C / 评委问答','六个问题，把方案讲透。')+`<div class="qa-grid"><div><h2>与普通 AI 生图有什么不同？</h2><p>企业组件与业务规范约束生成；飞书承接质量、差异核对和审核交付。</p></div><div><h2>为什么必须强调飞书？</h2><p>需求、台账、评论、通知共同形成团队协作闭环，生成成果持续留痕。</p></div><div><h2>半天是完整交付周期吗？</h2><p>是可评审设计初稿阶段。人工审核、体验优化和研发实现仍需时间。</p></div><div><h2>AI 的质量如何保证？</h2><p>规范约束＋质量校验＋PRD 差异核对，最终由 UED 人工审核与精修。</p></div><div><h2>300 人天是否已经实现？</h2><p>是基于历史需求量、75% 覆盖率与单项目净省 3 人天的推广测算。</p></div><div><h2>其他人能独立复用吗？</h2><p>核心链路已在网关项目验证，已具备复制基础；跨产品线仍需补业务规则。</p></div></div>`,
    notes:'答辩时先给结论，再用真实截图补充。避免将未来规划表述为当前能力。',cues:['也可通过目录切换到对应证据页。']
  },
  {
    title:'备用 / 拓展实录',chapter:'APPENDIX D / OTHER SCENARIOS',duration:0,steps:0,className:'appendix',
    html:head('APPENDIX D / 已有拓展示例','同一套协作方法，走进更多场景。')+`<div class="extension-grid"><div><h2>问题收集机器人</h2><p>统一收件 → 自动入表 → 分发负责人</p><video controls preload="metadata" playsinline aria-label="问题收集机器人真实录屏" src="${A}feedback.mp4" poster="${A}feedback-poster.jpg"></video></div><div><h2>知识学习闭环</h2><p>定时任务 → 导师点评 → 记录与复盘</p><video controls preload="metadata" playsinline aria-label="知识学习闭环真实录屏" src="${A}learning.mp4" poster="${A}learning-poster.jpg"></video></div></div>`,
    notes:'备用拓展录屏，仅在答辩或时间充裕时手动播放。主讲 9 分半不包含这两段视频。',cues:['两个视频互斥播放，离开页面自动暂停。']
  }
];

// P0 precedes the 12-screen presentation; existing main and appendix links stay stable.
DECK.push({
  title:'先用一段视频，认识这名协作伙伴',chapter:'P0 / INTRODUCTION FILM',duration:71,steps:0,className:'intro-film',
  html:`<div class="intro-film-heading"><p class="eyebrow">P0 <span>整体介绍 · 视频</span></p><h1>先用一段视频，认识这名<span class="blue">协作伙伴</span></h1><span class="film-badge">▶ VIDEO</span></div><div class="intro-film-panel"><video id="intro-video" controls playsinline preload="metadata" poster="${A}intro-poster.jpg" aria-label="MS AI 协作伙伴整体方案介绍视频"><source src="${A}intro.mp4" type="video/mp4"></video><div class="intro-film-fallback" hidden><img src="${A}intro-poster.jpg" alt="方案介绍视频封面"><p>视频暂时无法播放，可直接进入正式开场。</p></div><div class="intro-film-caption"><strong>方案介绍</strong><span>完整链路一镜到底</span><b>现场可播可跳过</b><button id="skip-intro">进入正式开场 →</button></div></div>`,
  notes:'先用约 71 秒的方案介绍视频，整体认识这名协作伙伴。视频有声音，请在正式演讲前确认音量。按 V 或在讲稿窗口点播放可播放 / 暂停；也可直接按右方向键跳过，进入原来的正式开场。介绍视频不计入原定 9 分 30 秒主讲，完整播放后的总时长约 10 分 41 秒。',
  cues:['可播放，也可跳过。播放结束后按 → 进入正式开场。']
});
