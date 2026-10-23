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
    if(tag==='img'||tag==='canvas'||tag==='script'||tag==='style'||tag==='link'||tag==='meta')return null;
    var fills=[],bg=parseRgba(cs.backgroundColor);if(bg&&bg.a>0)fills.push({c:bg.c,a:bg.a});
    var eff=shadows(cs.boxShadow);
    var node={t:'f',f:fills,e:eff,r:radii(cs),clip:(cs.overflow==='hidden'||cs.overflow==='clip'),x:x,y:y,w:w,h:h,o:parseFloat(cs.opacity)||1,n:undefined,ch:[]};
    var cls=(typeof el.className==='string'?el.className:'').trim();if(cls)node.n=cls.slice(0,40);
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
    if((!fills.length&&!eff.length&&!node.ch.length)||w<0.01)return null;
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
    var scene={v:1,generatedAt:new Date().toISOString(),cells:cells};
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
  ['--headless', '--disable-gpu', '--virtual-time-budget=20000', '--dump-dom', 'file://' + tmp],
  { maxBuffer: 256 * 1024 * 1024 }).toString('utf8');
fs.unlinkSync(tmp);

const m = dump.match(/<script id="ms-scene-json" type="application\/json">([\s\S]*?)<\/script>/);
if (!m) { console.error('未找到 scene.json 标记——渲染未完成或注入脚本异常'); process.exit(3); }

const scene = JSON.parse(m[1]);

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

fs.writeFileSync(path.join(outDir, 'scene.json'), JSON.stringify(scene));

const tiled = buildExportPage(html, path.basename(demoPath, '.html'));
if (tiled.states) fs.writeFileSync(path.join(outDir, 'figma-export.html'), tiled.html);

const count = n => 1 + (n.ch || []).reduce((a, c) => a + count(c), 0);
scene.cells.forEach(c => console.log('  屏 ' + c.label + '｜' + count(c.root) + ' 节点｜' + c.w + '×' + Math.round(c.h)));
console.log('完成 → ' + path.join(outDir, 'scene.json') +
  (tiled.states ? ' + figma-export.html（全状态铺开参考页）' : '（无契约，单态）'));
if (iconStats) console.log('图标: 库实例 ' + iconStats.inst + '｜识别但无映射(矢量) ' + iconStats.nomap + '｜其他矢量 ' + iconStats.plain);

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
