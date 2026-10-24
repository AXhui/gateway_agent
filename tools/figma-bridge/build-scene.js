#!/usr/bin/env node
// scene.json 生成器 —— html-to-figma-internal 插件（~/Desktop）的数据源。
// 原理：向 demo 注入序列化脚本 → 无头 Chrome 真实渲染 → 逐态 walk DOM + computed style
// → scene.json（插件 code.js 的消费格式）落桌面；无 MS_FIGMA_EXPORT 契约时回退单态。
// 用法: node build-scene.js <demo.html> [--out-dir ~/Desktop]

const fs = require('fs'), path = require('path'), os = require('os'), cp = require('child_process');
const { buildExportPage } = require('./export-page');

const BOOTSTRAP = `(function(){
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
  function px(v){var n=parseFloat(v);return isNaN(n)?0:n}
  function parseRgba(s){var m=(s||'').match(/rgba?\\(([^)]+)\\)/);if(!m)return null;var p=m[1].split(',').map(parseFloat);return{c:[p[0]/255,p[1]/255,p[2]/255],a:p.length>3?p[3]:1}}
  function splitTop(s){var out=[],d=0,c='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='(')d++;if(ch===')')d--;if(ch===','&&d===0){out.push(c);c=''}else c+=ch}out.push(c);return out}
  function shadows(s){var out=[];if(!s||s==='none')return out;splitTop(s).forEach(function(ps){var inset=/inset/i.test(ps);ps=ps.replace(/inset/gi,'').trim();var cm=ps.match(/rgba?\\([^)]+\\)/);if(!cm)return;var nums=ps.replace(/rgba?\\([^)]+\\)/,'').trim().split(/\\s+/).map(parseFloat);if(nums.length<4)return;var c=parseRgba(cm[0]);out.push({k:inset?'in':'out',c:c.c,a:c.a,x:nums[0],y:nums[1],b:nums[2],s:nums[3]||0})});return out}
  function radii(cs){var s=cs.borderRadius||'0';var f=s.split('/')[0].trim().split(/\\s+/).map(px);var tl=f[0]||0,tr=f.length>1?f[1]:tl,br=f.length>2?f[2]:tl,bl=f.length>3?f[3]:tr;return{tl:tl,tr:tr,br:br,bl:bl}}
  // 背景图层解析：CSS backgroundImage（computed，Chrome 归一为 rgba()）→ url 层 + linear/radial 渐变层
  // 停靠点无位置时按最近已知位置插值；radial 一律近似内切圆映射（CSS 默认 farthest-corner 视觉近似）
  function bgLayers(cs,biSize){
    var out=[],bi=cs.backgroundImage||'none';
    if(bi==='none'||!bi||bi==='initial')return out;
    var KW={'to right':90,'to left':270,'to top':0,'to bottom':180,'to top right':45,'to right top':45,'to bottom right':135,'to right bottom':135,'to bottom left':225,'to left bottom':225,'to top left':315,'to left top':315};
    splitTop(bi).forEach(function(L){
      L=L.trim();if(!L||L==='none')return;
      var um=L.match(/^url\\(['"]?([^)'"]*)['"]?\\)$/);
      if(um){out.push({k:'u',src:um[1],fit:/contain/.test(biSize||'')?'contain':'cover'});return}
      var gm=L.match(/^(linear|radial)-gradient\\((.*)\\)$/);
      if(!gm)return;
      var rad=gm[1]==='radial',parts=splitTop(gm[2]),stops=[],ang=180,i=0;
      if(!rad&&parts.length&&/deg|turn|^to /.test(parts[0].trim())&&!/rgba?\\(/.test(parts[0])){
        var A=parts[0].trim(),dm=A.match(/^-?([\\d.]+)deg/);
        if(dm)ang=parseFloat(dm[1]);
        else if(A.indexOf('turn')>=0){var tm=A.match(/^-?([\\d.]+)/);if(tm)ang=parseFloat(tm[1])*360}
        else if(KW[A]!=null)ang=KW[A];
        i=1;
      }
      if(rad)while(i<parts.length&&!/rgba?\\(/.test(parts[i]))i++;
      for(;i<parts.length;i++){
        var seg=parts[i].trim();if(!seg)continue;
        var cm=seg.match(/rgba?\\(([^)]+)\\)/);if(!cm)continue;
        var col=parseRgba(cm[0]);if(!col)continue;
        var pm=seg.replace(/rgba?\\([^)]+\\)/,'').trim().match(/(-?[\\d.]+)%/);
        stops.push({c:col.c,a:col.a,p:pm?Math.max(0,Math.min(1,parseFloat(pm[1])/100)):null});
      }
      if(stops.length<2)return;
      stops.forEach(function(s,ix){
        if(s.p!=null)return;
        var L2=ix-1,R2=ix+1;
        while(L2>=0&&stops[L2].p==null)L2--;
        while(R2<stops.length&&stops[R2].p==null)R2++;
        if(L2<0&&R2>=stops.length)s.p=ix/(stops.length-1||1);
        else if(L2<0)s.p=stops[R2].p*ix/R2;
        else if(R2>=stops.length)s.p=stops[L2].p+(1-stops[L2].p)*(ix-L2)/(stops.length-1-L2);
        else s.p=stops[L2].p+(stops[R2].p-stops[L2].p)*(ix-L2)/(R2-L2);
      });
      out.push(rad?{k:'r',stops:stops}:{k:'l',ang:ang,stops:stops});
    });
    return out;
  }
  function iconSig(s){return s.replace(/\\s+/g,'').replace(/<\\/[a-zA-Z]+>/g,'').replace(/\\/>/g,'>')}
  var iconSigMap=null;
  function iconName(el){
    if(!window.MS_ICONS)return null;
    if(!iconSigMap){iconSigMap={};for(var k in MS_ICONS){var m=MS_ICONS[k].match(/<svg[^>]*>([\\S\\s]*?)<\\/svg>/);if(m)iconSigMap[iconSig(m[1])]=k}}
    return iconSigMap[iconSig(el.innerHTML)]||null;
  }
  function serEl(el,origin){
    if(el.nodeType!==1)return null;
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden')return null;
    var rect=el.getBoundingClientRect();
    var x=rect.left-origin.x,y=rect.top-origin.y,w=rect.width,h=rect.height;
    var tag=(el.tagName||'').toLowerCase();
    if(tag==='svg'){
      var cl=el.cloneNode(true);
      cl.setAttribute('width',Math.max(1,Math.round(w)));cl.setAttribute('height',Math.max(1,Math.round(h)));
      var n={t:'s',svg:cl.outerHTML,x:x,y:y,w:w,h:h,o:parseFloat(cs.opacity)||1,n:(el.getAttribute('class')||'').slice(0,40)||undefined};
      var icn=iconName(el);
      if(icn){n.ic=icn;var icc=parseRgba(cs.color);if(icc)n.col=icc.c}
      return n;
    }
    if(tag==='img'||tag==='canvas'){
      if(w<0.01||h<0.01)return null;
      var src='';
      if(tag==='img')src=el.currentSrc||el.getAttribute('src')||'';
      else{try{src=el.toDataURL('image/png')}catch(e2){return null}}
      if(!src||/^\\s*$/.test(src))return null;
      var nimg={t:'img',src:src,x:x,y:y,w:w,h:h,o:parseFloat(cs.opacity)||1,r:radii(cs),fit:(cs.objectFit||'fill')};
      var imgCls=(typeof el.className==='string'?el.className:'').trim();
      if(imgCls)nimg.n=imgCls.slice(0,40);
      window.__imgCount=(window.__imgCount||0)+1;
      return nimg;
    }
    if(tag==='script'||tag==='style'||tag==='link'||tag==='meta')return null;
    var fills=[],bg=parseRgba(cs.backgroundColor);if(bg&&bg.a>0)fills.push({c:bg.c,a:bg.a});
    var eff=shadows(cs.boxShadow);
    var node={t:'f',f:fills,e:eff,r:radii(cs),clip:(cs.overflow==='hidden'||cs.overflow==='clip'),x:x,y:y,w:w,h:h,o:parseFloat(cs.opacity)||1,n:undefined,ch:[]};
    var cls=(typeof el.className==='string'?el.className:'').trim();if(cls)node.n=cls.slice(0,80);
    var bgL=bgLayers(cs,(cs.backgroundSize||'').split(',')[0]||'');
    if(bgL.length){if(bgL.length>4)bgL=bgL.slice(0,4);node.bg=bgL;window.__bgCount=(window.__bgCount||0)+bgL.length;}
    var txt='';for(var i=0;i<el.childNodes.length;i++){var cn=el.childNodes[i];if(cn.nodeType===3)txt+=cn.data}
    txt=txt.replace(/\\s+/g,' ').trim();
    if(txt){
      var fs=px(cs.fontSize)||14;
      var lh=cs.lineHeight==='normal'?fs*1.4:(px(cs.lineHeight)||fs*1.4);
      var col=parseRgba(cs.color)||{c:[0,0,0],a:1};
      var al=cs.textAlign==='center'?'center':(cs.textAlign==='right'||cs.textAlign==='end')?'right':'left';
      var ty=0,th=lh;
      try{var rg=document.createRange();rg.selectNodeContents(el);var tr=rg.getBoundingClientRect();if(tr.height>0){ty=tr.top-rect.top;th=tr.height}}catch(e){}
      node.ch.push({t:'t',text:txt,fs:fs,fw:(parseInt(cs.fontWeight)||400),lh:Math.max(lh,fs),ls:px(cs.letterSpacing)||0,col:col.c,al:al,x:0,y:ty,w:w,h:th,o:1});
    }
    var sides=['Top','Right','Bottom','Left'];
    for(var k=0;k<4;k++){
      var side=sides[k];
      var bc=parseRgba(cs['border'+side+'Color']),bwid=px(cs['border'+side+'Width']);
      if(bwid>0&&bc&&bc.a>0){
        var geo=k===0?{x:0,y:0,w:w,h:bwid}:k===1?{x:w-bwid,y:0,w:bwid,h:h}:k===2?{x:0,y:h-bwid,w:w,h:bwid}:{x:0,y:0,w:bwid,h:h};
        node.ch.push({t:'f',f:[{c:bc.c,a:bc.a}],e:[],r:{tl:0,tr:0,br:0,bl:0},clip:false,x:geo.x,y:geo.y,w:geo.w,h:geo.h,o:1,n:'border-'+side.toLowerCase()});
      }
    }
    for(var j=0;j<el.children.length;j++){
      var c=serEl(el.children[j],{x:rect.left,y:rect.top});
      if(c)node.ch.push(c);
    }
    // 自动布局置信转换（设计师视角：能增删内容的弹性容器，改文案不错位）：
    // 条件全过才打 al 标——display:flex 且 nowrap、方向非 reverse、justify/align 在 Figma 可映射集、
    // 子节点全流内（无 absolute/fixed、无 visibility:hidden）、无「文本+元素」混排、边框统一（转描边）或无、
    // 主轴总宽吻合（无 grow/shrink 拉伸失真）；任一不过保持绝对定位（宁可不转，不可转错）
    var alv=cs.display;
    if((alv==='flex'||alv==='inline-flex')&&(cs.flexWrap==='nowrap'||!cs.flexWrap)&&w>=2&&h>=2){
      var fd=cs.flexDirection||'row';
      if(fd==='row'||fd==='column'){
        var JM={'flex-start':'MIN','start':'MIN','left':'MIN','center':'CENTER','flex-end':'MAX','end':'MAX','right':'MAX','space-between':'SPACE_BETWEEN'};
        var AM={'stretch':'STRETCH','normal':'STRETCH','flex-start':'MIN','start':'MIN','center':'CENTER','flex-end':'MAX','end':'MAX','baseline':'BASELINE'};
        var jj=JM[cs.justifyContent||'flex-start']||null,aa=AM[cs.alignItems||'normal']||null;
        if(jj&&aa){
          var ok=true;
          for(var q=0;q<el.children.length;q++){
            var ccs=getComputedStyle(el.children[q]);
            if(ccs.position==='absolute'||ccs.position==='fixed'||ccs.visibility==='hidden'){ok=false;break}
          }
          var hasTxt=!!txt,hasElCh=node.ch.some(function(c){return c.t!=='t'});
          if(ok&&!(hasTxt&&hasElCh)){
            var kids=node.ch.filter(function(c){return ['border-top','border-right','border-bottom','border-left'].indexOf(c.n)<0});
            if(kids.length>=1){
              var bws=[px(cs.borderTopWidth),px(cs.borderRightWidth),px(cs.borderBottomWidth),px(cs.borderLeftWidth)];
              var ub=bws[0]===bws[1]&&bws[1]===bws[2]&&bws[2]===bws[3];
              var bcA=parseRgba(cs.borderTopColor),bcB=parseRgba(cs.borderRightColor),bcC=parseRgba(cs.borderBottomColor),bcD=parseRgba(cs.borderLeftColor);
              var uc=bcA&&bcB&&bcC&&bcD&&bcA.c.join()===bcB.c.join()&&bcB.c.join()===bcC.c.join()&&bcC.c.join()===bcD.c.join()&&bcA.a===bcB.a&&bcB.a===bcC.a&&bcC.a===bcD.a;
              if(ub&&(bws[0]===0||uc)){
                var row=fd==='row';
                var pT=px(cs.paddingTop),pR=px(cs.paddingRight),pB=px(cs.paddingBottom),pL=px(cs.paddingLeft);
                var gap=row?px(cs.columnGap):px(cs.rowGap);
                var need=row?pL+pR+gap*(kids.length-1)+kids.reduce(function(s,k){return s+k.w},0):pT+pB+gap*(kids.length-1)+kids.reduce(function(s,k){return s+k.h},0);
                if(need<=(row?w:h)+1){
                  var alo={dir:row?'row':'col',gap:gap,just:jj,align:aa,pt:pT,pr:pR,pb:pB,pl:pL};
                  if(bws[0]>0){alo.bw=bws[0];alo.bc=bcA.c;alo.ba=bcA.a;
                    node.ch=node.ch.filter(function(c2){return ['border-top','border-right','border-bottom','border-left'].indexOf(c2.n)<0});}
                  node.al=alo;window.__alCount=(window.__alCount||0)+1;
                }
              }
            }
          }
        }
      }
    }
    if((!fills.length&&!eff.length&&!node.ch.length&&!bgL.length)||w<0.01)return null;
    return node;
  }
  ready(async function(){
    var hook=window.MS_FIGMA_EXPORT||{rootSelector:'#app',states:[{name:'默认态',setup:function(){}}],columns:1,frameWidth:1440,settleMs:200};
    var root=document.querySelector(hook.rootSelector||'#app')||document.body;
    var settle=hook.settleMs!=null?hook.settleMs:200;
    var cols=hook.columns||1,W=hook.frameWidth||1440,GAP=64;
    if(typeof hook.ready==='function'){try{await hook.ready()}catch(e){}}
    var cells=[],colH=[];for(var c0=0;c0<cols;c0++)colH.push(0);
    for(var i=0;i<hook.states.length;i++){
      var s=hook.states[i],failed=false;
      try{
        if(typeof hook.reset==='function'){hook.reset();await sleep(settle)}
        s.setup();await sleep(settle);
      }catch(e){failed=true;console.error('[scene] 状态 '+s.name+' setup 失败:',e)}
      var rr=root.getBoundingClientRect();
      var tree=serEl(root,{x:rr.left,y:rr.top})||{t:'f',f:[],e:[],r:{tl:0,tr:0,br:0,bl:0},clip:false,x:0,y:0,w:W,h:600,o:1,ch:[]};
      var col=i%cols,x=col*(W+GAP),y=colH[col];
      var hh=Math.max(root.scrollHeight,600);
      colH[col]+=hh+GAP;
      cells.push({label:(i+1)+'. '+s.name+(failed?'（导出失败，按前态快照）':''),x:x,y:y,w:W,h:hh,root:tree});
    }
    var scene={v:1,generatedAt:new Date().toISOString(),cells:cells,stats:{al:window.__alCount||0,img:window.__imgCount||0,bg:window.__bgCount||0}};
    var sc=document.createElement('script');sc.id='ms-scene-json';sc.type='application/json';
    sc.textContent=JSON.stringify(scene).replace(/</g,'\\\\u003c');
    document.documentElement.appendChild(sc);
    document.title='__MS_SCENE_READY__';
    console.log('[scene] 序列化完成: '+cells.length+' 屏');
  });
})()`;

const args = process.argv.slice(2);
const demoPath = args.find(a => !a.startsWith('--'));
const outDirIdx = args.indexOf('--out-dir');
const outDir = outDirIdx >= 0 ? args[outDirIdx + 1] : path.join(os.homedir(), 'Desktop');
if (!demoPath || !fs.existsSync(demoPath)) {
  console.error('用法: node build-scene.js <demo.html> [--out-dir <dir>]');
  process.exit(1);
}

const html = fs.readFileSync(demoPath, 'utf8');
const inject = '\n<script>' + BOOTSTRAP + '<\/script>';
const built = /<\/body>/i.test(html) ? html.replace(/<\/body>/i, inject + '\n</body>') : html + inject;
const tmp = '/tmp/ms-scene-in-' + Date.now() + '.html';
fs.writeFileSync(tmp, built);

const chrome = process.env.CHROME && fs.existsSync(process.env.CHROME) ? process.env.CHROME
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!fs.existsSync(chrome)) { console.error('找不到 Chrome: ' + chrome + '（可用 CHROME 环境变量指定）'); process.exit(2); }

console.log('无头 Chrome 渲染中（' + (built.length / 1024).toFixed(0) + 'KB）…');
const dump = cp.execFileSync(chrome,
  ['--headless', '--disable-gpu', '--window-size=1440,900', '--virtual-time-budget=20000', '--dump-dom', 'file://' + tmp],
  { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
fs.unlinkSync(tmp);

const m = dump.match(/<script id="ms-scene-json" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error('未找到 scene.json 标记——渲染未完成或注入脚本异常'); process.exit(3); }

const scene = JSON.parse(m[1]);

// 命名规范：demo <title>（回退文件名）→ scene.name；插件侧主画板/组件画板/变体集按此命名——
// 画板名 = 功能名（"EG71 · Data Library · Inbuilt Update"），组件名 = 类名家族 + 文本变体，不出现无名层
const titleM = html.match(/<title>([^<]*)<\/title>/i);
scene.name = (titleM && titleM[1].trim()) || path.basename(demoPath, '.html');

// 去多余嵌套：无视觉贡献（无填充/阴影/圆角/裁切、不透明）且无 bc-/ms- 语义类的透传容器拍平，
// 子树坐标换算进父级——图层树不留空壳帧（设计师展开图层不剥洋葱）
let flatCut = 0;
function flattenWrappers(node) {
  if (!node.ch) return;
  for (const c of node.ch) flattenWrappers(c);
  const out = [];
  for (const c of node.ch) {
    const r = c.r || {};
    if (c.t === 'f' && !c.lib && !(c.f || []).length && !(c.e || []).length && !(c.bg || []).length && !c.al
      && !(r.tl || r.tr || r.br || r.bl) && !c.clip && (c.o == null || c.o === 1)
      && !(c.n && /^(bc|ms)-/.test(c.n))) {
      flatCut++;
      (c.ch || []).forEach(k => { k.x += c.x; k.y += c.y; out.push(k); });
    } else out.push(c);
  }
  node.ch = out;
}
scene.cells.forEach(c => flattenWrappers(c.root));

// 图标实例化：页内已反查出 MS_ICONS 名（node.ic），命中 icon-keys.json 的升级为 t:'ic'（携带库组件 key）
let iconStats = null;
try {
  const keys = JSON.parse(fs.readFileSync(path.join(__dirname, 'icon-keys.json'), 'utf8')).icons;
  let inst = 0, nomap = 0, plain = 0;
  function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.t === 's') {
      if (n.ic) {
        const e = keys[n.ic];
        if (e) { n.t = 'ic'; n.k = e.key; n.f = e.figmaName; inst++; }
        else { delete n.ic; delete n.col; nomap++; }
      } else plain++;
    }
    (n.ch || []).forEach(walk);
  }
  scene.cells.forEach(c => walk(c.root));
  iconStats = { inst, nomap, plain };
} catch (e) { console.warn('icon-keys.json 缺失或损坏，图标全部走矢量: ' + e.message); }

// 库组件实例化二期：component-keys.json 命中的控件块打 n.lib 标记（子树原样保留——插件导入库失败时整块回退重绘）。
// 插件侧 importComponentByKeyAsync → set 按修饰类择变体 → createInstance → 覆写文本。
let libStats = null;
try {
  const libCfg = JSON.parse(fs.readFileSync(path.join(__dirname, 'component-keys.json'), 'utf8'));
  const comps = (libCfg.components || []).filter(c => c.enabled && c.cls && c.key);
  function walkLib(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walkLib); return; }
    if (n.t === 'f' && n.n) {
      const toks = String(n.n).trim().split(/\s+/);
      const ent = comps.find(c => toks.includes(c.cls));
      if (ent && !(ent.exclude || []).some(x => toks.includes(x))) {
        const vt = [];
        toks.forEach(t => { if (t.startsWith(ent.cls + '--')) { const m = (ent.tokens || {})[t.slice(ent.cls.length + 2)]; if (m && !vt.includes(m)) vt.push(m); } });
        n.lib = {
          k: ent.key, f: ent.figmaName, cls: String(n.n).slice(0, 80), tok: vt,
          text: ((n.ch || []).filter(c => c.t === 't').map(c => c.text).join(' ').trim().slice(0, 40)) || undefined,
          ic: (function hasVec(m) { return (m.ch || []).some(c => c.t === 'ic' || c.t === 's' || hasVec(c)); })(n)
        };
      }
    }
    (n.ch || []).forEach(walkLib);
  }
  scene.cells.forEach(c => walkLib(c.root));
  const hits = new Map();
  scene.cells.forEach(c => (function cc(n) {
    if (n.lib) { const k = n.lib.cls.split(/\s+/)[0]; hits.set(k, (hits.get(k) || 0) + 1); }
    else (n.ch || []).forEach(cc);
  })(c.root));
  const total = [...hits.values()].reduce((a, b) => a + b, 0);
  if (total) libStats = { total, by: [...hits].map(([k, v]) => k.split(/\s+/)[0] + '×' + v).join(' ') };
} catch (e) { console.warn('component-keys.json 缺失或损坏，库组件实例化跳过: ' + e.message); }

// 重复块自动成组件：bc-* / ms-* 块级类做结构签名（类名+几何+填充+阴影+圆角+文本全量哈希），
// 跨屏出现 ≥2 次的块 → scene.defs 定义一份 + 原位替换为 {t:'inst'} 引用；插件侧 createComponent/createInstance。
// 变体分组（写明，设计师视角）：同名（同家族）的多个 def = 同一组件的不同形态，互为变体——
// scene.defs 逐个带 vname（取块内首段文本做变体名），插件侧 figma.combineAsVariants 合成 COMPONENT_SET，
// 不散落成 N 个孤立组件；组件定义统一收进「组件定义」画板按家族分节网格排版。
let compStats = null;
(function componentize(scene) {
  const MIN_DUP = 2, MIN_AREA = 64;
  function isBlockClass(n) { return n && !n.lib && n.n && /^(bc|ms)-/.test(n.n) && n.w * n.h >= MIN_AREA; }
  function sig(n) {
    if (n.t === 'inst') return 'i' + n.d;
    const r10 = v => Math.round(v * 10);
    const parts = [n.t, n.n || '', r10(n.w), r10(n.h), JSON.stringify(n.f || []),
      JSON.stringify((n.e || []).map(e => [e.k, e.c, e.a, e.x, e.y, e.b, e.s])),
      JSON.stringify(n.r || {}), n.clip ? 1 : 0, n.o == null ? 1 : r10(n.o * 100) / 100,
      JSON.stringify(n.bg || []), n.al ? JSON.stringify(n.al) : ''];
    if (n.t === 't') parts.push(n.text, n.fs, n.fw, n.lh, n.ls, JSON.stringify(n.col), n.al, r10(n.w), r10(n.h));
    if (n.t === 's' || n.t === 'ic') parts.push(n.k || n.svg || '');
    (n.ch || []).forEach(c => parts.push(sig(c), r10(c.x), r10(c.y)));
    return parts.join('|');
  }
  const candidates = [];
  scene.cells.forEach(c => (function cc(n) {
    if (n.lib) return; // 库组件子树保留原样（回退用），不参与去重
    if (n.t === 'f' && isBlockClass(n)) candidates.push(n);
    (n.ch || []).forEach(cc);
  })(c.root));
  const countBySig = new Map();
  candidates.forEach(n => { const s = sig(n); countBySig.set(s, (countBySig.get(s) || 0) + 1); });
  const countTree = n => 1 + (n.ch || []).reduce((a, c) => a + countTree(c), 0);
  const defById = new Map();
  let defSeq = 0;
  const stats = { defs: 0, insts: 0, cutNodes: 0 };
  function process(node) {
    if (!node.ch) return;
    const out = [];
    for (const c of node.ch) {
      if (c.lib) { out.push(c); continue; } // 不改写库组件子树内部
      if (c.t === 'f' && isBlockClass(c) && (countBySig.get(sig(c)) || 0) >= MIN_DUP) {
        const s = sig(c);
        let def = defById.get(s);
        if (!def) { def = { id: 'c' + (++defSeq), name: (c.n || 'block').split(/\s+/)[0].slice(0, 40), root: c }; defById.set(s, def); }
        stats.insts++; stats.cutNodes += countTree(c) - 1;
        out.push({ t: 'inst', d: def.id, x: c.x, y: c.y, w: c.w, h: c.h, o: c.o == null ? 1 : c.o });
        continue;
      }
      process(c);
      out.push(c);
    }
    node.ch = out;
  }
  scene.cells.forEach(cell => process(cell.root));
  // 嵌套成组件：def 内部子块同样去重（迭代到不动点，组件内含组件实例）
  for (let round = 0; round < 5; round++) {
    const before = stats.insts;
    defById.forEach(d => process(d.root));
    if (stats.insts === before) break;
  }
  if (stats.insts) {
    stats.defs = defById.size;
    // 变体分组元数据：家族内 ≥2 个 def 互为变体，vname 取块内首段文本（去重后）做变体名
    const famCount = new Map();
    defById.forEach(d => famCount.set(d.name, (famCount.get(d.name) || 0) + 1));
    const famUsed = new Map();
    defById.forEach(d => {
      if ((famCount.get(d.name) || 0) < 2) return;
      let label = '';
      (function firstText(n) {
        if (label) return;
        if (n.t === 't' && n.text) { label = String(n.text).replace(/\s+/g, ' ').trim().slice(0, 16); return; }
        (n.ch || []).some(firstText);
      })(d.root);
      let base = label || ('v' + d.id.slice(1));
      let v = base, k = 2;
      const used = famUsed.get(d.name) || new Set();
      while (used.has(v)) v = base + ' ' + k++;
      used.add(v); famUsed.set(d.name, used);
      d.vname = v;
    });
    stats.families = famCount.size;
    stats.variantSets = [...famCount.values()].filter(c => c >= 2).length;
    scene.defs = {};
    defById.forEach(d => { scene.defs[d.id] = { name: d.name, vname: d.vname, root: d.root }; });
    scene.v = 2;
    compStats = stats;
  }
})(scene);

fs.writeFileSync(path.join(outDir, 'scene.json'), JSON.stringify(scene));

const tiled = buildExportPage(html, path.basename(demoPath, '.html'));
if (tiled.states) fs.writeFileSync(path.join(outDir, 'figma-export.html'), tiled.html);

const count = n => 1 + (n.ch || []).reduce((a, c) => a + count(c), 0);
scene.cells.forEach(c => console.log('  屏 ' + c.label + '｜' + count(c.root) + ' 节点｜' + c.w + '×' + Math.round(c.h)));
console.log('完成 → ' + path.join(outDir, 'scene.json') +
  (tiled.states ? ' + figma-export.html（全状态铺开参考页）' : '（无契约，单态）'));
if (iconStats) console.log('图标: 库实例 ' + iconStats.inst + '｜识别但无映射(矢量) ' + iconStats.nomap + '｜其他矢量 ' + iconStats.plain);
if (scene.stats) console.log('自动布局: flex 置信转换 ' + (scene.stats.al || 0) + ' 容器｜图片 ' + (scene.stats.img || 0) + '｜背景图层(渐变/底图) ' + (scene.stats.bg || 0));
if (flatCut) console.log('拍平: 透传空壳帧 ' + flatCut + ' 层（无视觉无语义类）');
if (libStats) console.log('库组件: 命中 ' + libStats.total + ' 处（' + libStats.by + '）→ 插件 importComponentByKeyAsync 实例化');
if (compStats) console.log('组件化: 定义 ' + compStats.defs + ' 个（家族 ' + compStats.families + '，变体集 ' + compStats.variantSets + ' 个待 combineAsVariants）｜实例引用 ' + compStats.insts + ' 处｜省节点 ' + compStats.cutNodes + '（scene v2 defs）');

// 端口空闲时自动拉起插件数据服务（serve.py，CORS 静态服务）
try {
  cp.execSync('lsof -i :8123 -sTCP:LISTEN', { stdio: 'ignore' });
} catch (e) {
  const serve = path.join(os.homedir(), 'Desktop/html-to-figma-internal/serve.py');
  if (fs.existsSync(serve)) {
    cp.spawn('python3', [serve], { detached: true, stdio: 'ignore' }).unref();
    console.log('已自动启动 serve.py（localhost:8123）');
  }
}
