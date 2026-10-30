// 共享序列化内核（build-scene.js 与 verify-scene.js 同源消费）；
// 运行时注入 demo 页：逐态 walk DOM + computed style 生成 scene 节点树
const BOOTSTRAP = `(function(){
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',fn); else fn(); }
  var sleep=function(ms){return new Promise(function(r){setTimeout(r,ms)})};
  function px(v){var n=parseFloat(v);return isNaN(n)?0:n}
  function parseRgba(s){var m=(s||'').match(/rgba?\\(([^)]+)\\)/);if(!m)return null;var p=m[1].split(',').map(parseFloat);return{c:[p[0]/255,p[1]/255,p[2]/255],a:p.length>3?p[3]:1}}
  function splitTop(s){var out=[],d=0,c='';for(var i=0;i<s.length;i++){var ch=s[i];if(ch==='(')d++;if(ch===')')d--;if(ch===','&&d===0){out.push(c);c=''}else c+=ch}out.push(c);return out}
  function shadows(s){var out=[];if(!s||s==='none')return out;splitTop(s).forEach(function(ps){var inset=/inset/i.test(ps);ps=ps.replace(/inset/gi,'').trim();var cm=ps.match(/rgba?\\([^)]+\\)/);if(!cm)return;var nums=ps.replace(/rgba?\\([^)]+\\)/,'').trim().split(/\\s+/).map(parseFloat);if(nums.length<4)return;var c=parseRgba(cm[0]);out.push({k:inset?'in':'out',c:c.c,a:c.a,x:nums[0],y:nums[1],b:nums[2],s:nums[3]||0})});return out}
  function radii(cs,w,h){
    // 支持 px/em/pt 与百分比（含椭圆 "rx.. / ry.." 语法，取水平垂直均值近似——Figma 圆角每角单值）
    var s=cs.borderRadius||'0';if(!s||s==='none'||s==='initial')s='0';
    var sp=s.split('/'),hs=sp[0].trim().split(/\\s+/),vs=(sp[1]||sp[0]).trim().split(/\\s+/);
    function val(tok,base){var m=/^(-?[\\d.]+)(%|px|em|rem|pt)?$/.exec(tok||'');if(!m)return 0;var v=parseFloat(m[1]);return m[2]==='%'?v*base/100:v}
    function pick(arr,i){return arr[i]||arr[arr.length-1]||'0'}
    return{tl:(val(pick(hs,0),w)+val(pick(vs,0),h))/2,tr:(val(pick(hs,1),w)+val(pick(vs,1),h))/2,
      br:(val(pick(hs,2),w)+val(pick(vs,2),h))/2,bl:(val(pick(hs,3),w)+val(pick(vs,3),h))/2}
  }
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
  // 颜色令牌反查（build-scene 注入 __MS_TOK_NAMES__=tokens.css 全量色令牌名；verify 注入 absent 时整体关闭，输出与基线一致）。
  // 值->名映射走 getComputedStyle(:root)：自动跟随页面主题（暗色块/级联覆写）；同值多候选按站点家族优先（文本/填充/图标/描边），
  // 家族内语义名再压色阶名（primary-normal > blue-06）；仅不透明色参与（透明令牌库变量不含）。
  // 注意：自定义属性 getPropertyValue 返回声明字面量（tokens.css 为 #HEX / var() 别名，非 rgb() 计算值），
  // 解析需覆盖 rgb()/rgba()、#RGB/#RGBA/#RRGGBB/#RRGGBBAA、var() 链（≤4 跳，防环）。
  function tokParse(v,rs,depth){
    v=String(v==null?'':v).trim();
    if(!v||depth>4)return null;
    var m=v.match(/^rgba?\\(([^)]+)\\)/);
    if(m){var p=m[1].split(/[ ,\\/]+/).map(parseFloat);if(p.length>3&&p[3]<1)return null;
      return[Math.round(p[0]),Math.round(p[1]),Math.round(p[2])]}
    m=v.match(/^#([0-9a-fA-F]{3,8})$/);
    if(m){var h=m[1];
      if(h.length===3||h.length===4){h=h.split('').map(function(c){return c+c}).join('')}
      if(h.length===6||h.length===8){
        if(h.length===8&&parseInt(h.slice(6,8),16)<255)return null;
        return[parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)]}
      return null}
    m=v.match(/^var\\((--[^),\\s]+)/);
    if(m)return tokParse(rs.getPropertyValue(m[1]),rs,depth+1);
    return null;
  }
  var TOK_BY_VAL=null;
  var TOK_FAM={text:['color-text-'],fill:['color-fill-','color-bg-','color-base-','color-mask','color-primary-'],icon:['color-icon-'],stroke:['color-border-','color-divider-']};
  function tokOf(cArr,site){
    if(!window.__MS_TOK_NAMES__||!cArr)return undefined;
    if(!TOK_BY_VAL){
      TOK_BY_VAL={};
      var rs=getComputedStyle(document.documentElement);
      window.__MS_TOK_NAMES__.forEach(function(nm){
        var v=tokParse(rs.getPropertyValue(nm),rs,0);if(!v)return;
        var k=v[0]+','+v[1]+','+v[2];
        (TOK_BY_VAL[k]=TOK_BY_VAL[k]||[]).push(nm.slice(2));
      });
    }
    var cand=TOK_BY_VAL[Math.round(cArr[0]*255)+','+Math.round(cArr[1]*255)+','+Math.round(cArr[2]*255)];
    if(!cand||!cand.length)return undefined;
    var fam=TOK_FAM[site]||[],best=null,bs=-1;
    cand.forEach(function(nm){
      var s=(fam.some(function(p){return nm.indexOf(p)===0})?100:0)+(/\\d\\d$/.test(nm)?0:10);
      if(s>bs){bs=s;best=nm}
    });
    return best;
  }
  var iconSigMap=null;
  function iconName(el){
    if(!window.MS_ICONS)return null;
    if(!iconSigMap){iconSigMap={};for(var k in MS_ICONS){var m=MS_ICONS[k].match(/<svg[^>]*>([\\S\\s]*?)<\\/svg>/);if(m)iconSigMap[iconSig(m[1])]=k}}
    return iconSigMap[iconSig(el.innerHTML)]||null;
  }
  // 伪元素序列化：设计系统大量装饰画在 ::before/::after（分隔线/必填星号/Tab 下划线/气泡箭头），
  // 不提取则 Figma 缺件。定位两类：绝对定位（left/top/right/bottom + translate 精确解）与
  // 流内（文本前缀/后缀按文本框定位；块级装饰按内容起终点近似，flex:1 分隔线宽度 Chrome 已解析为 px）。
  function lenPx(v,base){var m=/^(-?[\\d.]+)(%|px)?$/.exec((v||'').trim());if(!m)return 0;var n=parseFloat(m[1]);return m[2]==='%'?n*base/100:n}
  function pseudoNode(el,which,elW,elH,textRect,elRect){
    var pcs=getComputedStyle(el,which);
    if(!pcs||pcs.display==='none'||pcs.visibility==='hidden')return null;
    var c=pcs.content;
    if(!c||c==='none'||c==='normal')return null;
    var rawTxt=c.replace(/^['"]|['"]$/g,'');
    var isTxt=!!rawTxt;
    var short=which.indexOf(':')>=0?which.slice(1):which;
    var w=parseFloat(pcs.width)||0,h=parseFloat(pcs.height)||0;
    var fs=parseFloat(pcs.fontSize)||14;
    var lh=pcs.lineHeight==='normal'?fs*1.4:(parseFloat(pcs.lineHeight)||fs*1.4);
    if(isTxt&&(!w||!h)){w=Math.max(1,rawTxt.length*fs*0.6);h=lh}
    var bg=parseRgba(pcs.backgroundColor),bgL=bgLayers(pcs,(pcs.backgroundSize||'').split(',')[0]||'');
    var eff=shadows(pcs.boxShadow);
    // 仅边框伪元素：等宽单边 → CSS 三角 polygon；其余（双边 L 形下拉箭头等）→ 逐边线条 SVG，纯旋转矩阵折进 SVG 绕中心旋转
    var tri=null;
    if(!isTxt&&(!bg||bg.a<=0)&&!bgL.length&&!eff.length){
      var bC=[parseRgba(pcs.borderTopColor),parseRgba(pcs.borderBottomColor),parseRgba(pcs.borderLeftColor),parseRgba(pcs.borderRightColor)];
      var bW=[parseFloat(pcs.borderTopWidth)||0,parseFloat(pcs.borderBottomWidth)||0,parseFloat(pcs.borderLeftWidth)||0,parseFloat(pcs.borderRightWidth)||0];
      var onSide=bC.map(function(cc,i2){return cc&&cc.a>0&&bW[i2]>0?i2:-1}).filter(function(i2){return i2>=0});
      if(!onSide.length)return null;
      var seg='';
      if(onSide.length===1&&bW[0]===bW[1]&&bW[1]===bW[2]&&bW[2]===bW[3]&&bW[0]>0){
        var s=onSide[0],col=bC[s];
        if(s===0||s===1){w=bW[2]+bW[3];h=bW[s]}
        else{w=bW[s];h=bW[0]+bW[1]}
        var tw=w,th=h;
        var pts=s===0?'0,0 '+tw+',0 '+(tw/2)+','+th:s===1?'0,'+th+' '+tw+','+th+' '+(tw/2)+',0':s===2?'0,0 0,'+th+' '+tw+','+(th/2):tw+',0 '+tw+','+th+' 0,'+(th/2);
        var rgb='rgb('+Math.round(col.c[0]*255)+','+Math.round(col.c[1]*255)+','+Math.round(col.c[2]*255)+')';
        seg='<polygon points="'+pts+'" fill="'+rgb+'" fill-opacity="'+(col.a==null?1:col.a)+'"/>';
      } else {
        for(var sd=0;sd<4;sd++){
          if(onSide.indexOf(sd)<0)continue;
          var sc=bC[sd],scn='rgb('+Math.round(sc.c[0]*255)+','+Math.round(sc.c[1]*255)+','+Math.round(sc.c[2]*255)+')';
          var sw=Math.max(bW[sd],0.1),ins=sw/2;
          var pp=sd===0?'M '+ins+' '+ins+' L '+(w-ins)+' '+ins:sd===1?'M '+(w-ins)+' '+ins+' L '+(w-ins)+' '+(h-ins):sd===2?'M '+ins+' '+(h-ins)+' L '+(w-ins)+' '+(h-ins):'M '+ins+' '+ins+' L '+ins+' '+(h-ins);
          seg+='<path d="'+pp+'" stroke="'+scn+'" stroke-width="'+sw+'" stroke-opacity="'+(sc.a==null?1:sc.a)+'" fill="none" stroke-linecap="square"/>';
        }
      }
      var rotG='';
      var tm2=(pcs.transform||'none').match(/matrix\\(([^)]+)\\)/);
      if(tm2){var rv=tm2[1].split(',').map(parseFloat);
        if(Math.abs(rv[0]*rv[3]-rv[1]*rv[2]-1)<0.02&&Math.abs(rv[0]-rv[3])<0.02&&Math.abs(rv[1]+rv[2])<0.02){
          var ang2=Math.atan2(rv[1],rv[0])*180/Math.PI;
          if(Math.abs(ang2)>0.05)rotG=' transform="rotate('+ang2.toFixed(2)+' '+(w/2)+' '+(h/2)+')"';
        }
      }
      tri={t:'s',svg:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+Math.max(w,0.1)+' '+Math.max(h,0.1)+'"><g'+rotG+'>'+seg+'</g></svg>',w:w,h:h,n:'pseudo-'+short};
    }
    if(w<0.5||h<0.5)return null;
    var x=0,y=0;
    if(pcs.position==='absolute'){
      // Chrome 对绝对定位伪元素回 used left/top，参照系是包含块（向上找首个非 static 祖先，含本元素）的内边距盒——换算回本元素 border-box 坐标
      var cb=null,cbEl=el;
      while(cbEl&&cbEl.nodeType===1){
        var ccs=getComputedStyle(cbEl);
        if(ccs.position!=='static'||(ccs.transform&&ccs.transform!=='none')||(ccs.filter&&ccs.filter!=='none')){cb=cbEl;break}
        cbEl=cbEl.parentElement;
      }
      if(cb===el){
        var ebx=parseFloat(getComputedStyle(el).borderLeftWidth)||0,eby=parseFloat(getComputedStyle(el).borderTopWidth)||0;
        x=px(pcs.left)+ebx;y=px(pcs.top)+eby;
      } else if(cb){
        var cr2=cb.getBoundingClientRect(),ccs2=getComputedStyle(cb);
        var cbx2=cr2.left+(parseFloat(ccs2.borderLeftWidth)||0),cby2=cr2.top+(parseFloat(ccs2.borderTopWidth)||0);
        x=cbx2+px(pcs.left)-elRect.left;
        y=cby2+px(pcs.top)-elRect.top;
      } else {
        x=px(pcs.left);y=px(pcs.top);
      }
      var tm=(pcs.transform||'none').match(/matrix\\(([^)]+)\\)/);
      if(tm){var tv=tm[1].split(',').map(parseFloat);x+=tv[4]||0;y+=tv[5]||0}
    } else if(pcs.position==='fixed'){
      x=lenPx(pcs.left,elW);y=lenPx(pcs.top,elH);
      var tmf=(pcs.transform||'none').match(/matrix\\(([^)]+)\\)/);
      if(tmf){var tf=tmf[1].split(',').map(parseFloat);x+=tf[4]||0;y+=tf[5]||0}
    } else if(isTxt&&textRect){
      if(which==='before')x=textRect.tx-Math.max(1,rawTxt.length*fs*0.6)-lenPx(pcs.marginRight,1);
      else x=textRect.tx+textRect.w+lenPx(pcs.marginLeft,1);
      y=textRect.ty;
    } else {
      x=which==='before'?lenPx(pcs.marginLeft,1):elW-w-lenPx(pcs.marginRight,1);
      y=(elH-h)/2;
    }
    if(tri){tri.x=x;tri.y=y;tri.o=1;return tri}
    if(isTxt){
      var pcol=parseRgba(pcs.color)||{c:[0,0,0],a:1};
      var ptn={t:'t',text:rawTxt,fs:fs,fw:(parseInt(pcs.fontWeight)||400),lh:Math.max(lh,fs),ls:parseFloat(pcs.letterSpacing)||0,col:pcol.c,al:'left',x:x,y:y,w:w,h:h,o:1,n:'pseudo-'+short};
      if(pcol.a>=1){var ptk=tokOf(pcol.c,'text');if(ptk)ptn.tk=ptk}
      return ptn;
    }
    var pfFills=bg&&bg.a>0?[{c:bg.c,a:bg.a}]:[];
    var pfn={t:'f',f:pfFills,e:eff,r:radii(pcs,w,h),clip:false,x:x,y:y,w:w,h:h,o:1,n:'pseudo-'+short,ch:[]};
    if(bg&&bg.a>=1){var pftk=tokOf(bg.c,'fill');if(pftk)pfn.ftk=pftk}
    return pfn;
  }
  function serEl(el,origin,path){
    if(el.nodeType!==1)return null;
    var cs=getComputedStyle(el);
    if(cs.display==='none'||cs.visibility==='hidden')return null;
    var rect=el.getBoundingClientRect();
    var x=rect.left-origin.x,y=rect.top-origin.y,w=rect.width,h=rect.height;
    var rot=null;
    if(cs.transform&&cs.transform!=='none'){
      // 纯旋转（无缩放/剪切）才捕获；rect 是外接框，改用布局盒 + 中心对齐
      var mm=cs.transform.match(/^matrix\\(([^)]+)\\)/);
      if(mm){
        var tv=mm[1].split(',').map(parseFloat),a0=tv[0],b0=tv[1],c0=tv[2],d0=tv[3];
        if(Math.abs(a0*d0-b0*c0-1)<0.02&&Math.abs(a0-d0)<0.02&&Math.abs(b0+c0)<0.02){
          var ang=Math.atan2(b0,a0)*180/Math.PI;
          if(Math.abs(ang)>0.05){
            rot=Math.round(ang*100)/100;
            var ow=el.offsetWidth||w,oh=el.offsetHeight||h;
            x=rect.left+rect.width/2-ow/2-origin.x;y=rect.top+rect.height/2-oh/2-origin.y;w=ow;h=oh;
          }
        }
      }
    }
    var tag=(el.tagName||'').toLowerCase();
    // 同源链接标记（仅 ext 模式注入 __MS_LINKMARK__ 后生效）：标记 <a> 自身与锚内叶子
    // （img/svg），供插件挂原型连线 ON_CLICK → 对应页帧；跨源/自跳转不标
    function linkMark(node){
      if(!window.__MS_LINKMARK__)return undefined;
      var a=null;
      try{a=(tag==='a'&&el.getAttribute('href'))?el:(el.closest?el.closest('a[href]'):null)}catch(e){}
      if(!a)return undefined;
      try{
        var u=new URL(a.getAttribute('href'),location.href);
        // 本地多文件场景（zip 解包/本地批量）：链接按 file: 解析 → 取文件名做连线键（build-scene 同规则记 cell.u）
        if(u.protocol==='file:'||u.origin==='null'){
          var bn=u.pathname.split('/').pop();
          return bn&&bn!==location.pathname.split('/').pop()?bn:undefined;
        }
        if(u.origin!==location.origin)return undefined;
        if(u.pathname===location.pathname&&u.search===location.search)return undefined;
        var pk=u.pathname+(u.search||'');
        return pk.replace(/\\/(index|default)\\.html?(?=\\?|$)/i,'/');
      }catch(e2){return undefined}
    }
    if(tag==='svg'){
      var cl=el.cloneNode(true);
      cl.setAttribute('width',Math.max(1,Math.round(w)));cl.setAttribute('height',Math.max(1,Math.round(h)));
      var n={t:'s',svg:cl.outerHTML,x:x,y:y,w:w,h:h,o:isNaN(parseFloat(cs.opacity))?1:parseFloat(cs.opacity),n:(el.getAttribute('class')||'').slice(0,40)||undefined};
      var slk=linkMark(n);if(slk)n.lk=slk;
      if(rot)n.rot=rot;
      if(path!==undefined)n.p=path;
      var icn=iconName(el);
      if(icn){n.ic=icn;var icc=parseRgba(cs.color);if(icc){n.col=icc.c;if(icc.a>=1){var ctk=tokOf(icc.c,'icon');if(ctk)n.ctk=ctk}}}
      return n;
    }
    // 高清图取源（PRO high-res images 对标）：srcset 取最大 w/x 候选替代 currentSrc（浏览器在 1440 视口
    // 只选够用的小图），<picture> 的 <source> 一并参与；懒加载占位（data:/pixel/placeholder）回退 data-src
    function bestImgSrc(el){
      var sets=[];
      var ss=(el.getAttribute&&el.getAttribute('srcset'))||'';
      if(ss)sets.push(ss);
      var par=el.parentElement;
      if(par&&/^picture$/i.test(par.tagName)){
        Array.prototype.forEach.call(par.querySelectorAll('source[srcset]'),function(so){sets.push(so.getAttribute('srcset'))});
      }
      var best='',bw=-1;
      sets.forEach(function(one){
        String(one).split(',').forEach(function(part){
          var seg=part.trim().split(/\\s+/),u=seg[0];if(!u)return;
          var d=seg[1]||'',mw=/(\\d+)w/i.exec(d),mx=/([\\d.]+)x/i.exec(d);
          var score=mw?parseFloat(mw[1]):(mx?parseFloat(mx[1])*1000:0);
          if(score>=0&&score>bw){bw=score;best=u}
        });
      });
      if(best){try{return new URL(best,document.baseURI).href}catch(e4){return best}}
      var cur=el.currentSrc||el.getAttribute('src')||'';
      if(/^data:|pixel|placeholder|blank|loading|spinner/i.test(cur)){
        var ds=(el.getAttribute&&el.getAttribute('data-src'))||el.getAttribute('data-original')||'';
        if(ds){try{return new URL(ds,document.baseURI).href}catch(e5){return ds}}
      }
      return cur;
    }
    if(tag==='img'||tag==='canvas'){
      if(w<0.01||h<0.01)return null;
      var src='';
      if(tag==='img')src=bestImgSrc(el);
      else{try{src=el.toDataURL('image/png')}catch(e2){return null}}
      if(!src||/^\\s*$/.test(src))return null;
      var nimg={t:'img',src:src,x:x,y:y,w:w,h:h,o:isNaN(parseFloat(cs.opacity))?1:parseFloat(cs.opacity),r:radii(cs,w,h),fit:(cs.objectFit||'fill')};
      var ilk=linkMark(nimg);if(ilk)nimg.lk=ilk;
      if(rot)nimg.rot=rot;
      if(path!==undefined)nimg.p=path;
      var imgCls=(typeof el.className==='string'?el.className:'').trim();
      if(imgCls)nimg.n=imgCls.slice(0,40);
      window.__imgCount=(window.__imgCount||0)+1;
      return nimg;
    }
    if(tag==='script'||tag==='style'||tag==='link'||tag==='meta')return null;
    var fills=[],bg=parseRgba(cs.backgroundColor);if(bg&&bg.a>0)fills.push({c:bg.c,a:bg.a});
    var eff=shadows(cs.boxShadow);
    var node={t:'f',f:fills,e:eff,r:radii(cs,w,h),clip:((cs.overflowX==='hidden'||cs.overflowX==='clip')||(cs.overflowY==='hidden'||cs.overflowY==='clip')),x:x,y:y,w:w,h:h,o:isNaN(parseFloat(cs.opacity))?1:parseFloat(cs.opacity),n:undefined,ch:[]};
    if(bg&&bg.a>=1){var ftk=tokOf(bg.c,'fill');if(ftk)node.ftk=ftk}
    if(rot)node.rot=rot;
    if(path!==undefined)node.p=path;
    var cls=(typeof el.className==='string'?el.className:'').trim();if(cls)node.n=cls.slice(0,80);
    var alk=linkMark(node);if(alk)node.lk=alk;
    // fixed/sticky 吸顶元素标记：插件侧提升为页面帧直接子节点（不被 overflow 滚走）
    if(cs.position==='fixed'||cs.position==='sticky')node.fix=1;
    var bgL=bgLayers(cs,(cs.backgroundSize||'').split(',')[0]||'');
    if(bgL.length){if(bgL.length>4)bgL=bgL.slice(0,4);node.bg=bgL;window.__bgCount=(window.__bgCount||0)+bgL.length;}
    var txt='';for(var i=0;i<el.childNodes.length;i++){var cn=el.childNodes[i];if(cn.nodeType===3)txt+=cn.data}
    txt=txt.replace(/\\s+/g,' ').trim();
    // 文本变换（computed 不改变 textContent，需自行应用）
    var tt=cs.textTransform||'none';
    if(tt==='uppercase')txt=txt.toUpperCase();
    else if(tt==='lowercase')txt=txt.toLowerCase();
    else if(tt==='capitalize')txt=txt.toLowerCase().replace(/(^|\\s)([a-z])/g,function(m0,s1,s2){return s1+s2.toUpperCase()});
    if(txt){
      var fs=px(cs.fontSize)||14;
      var lh=cs.lineHeight==='normal'?fs*1.4:(px(cs.lineHeight)||fs*1.4);
      var col=parseRgba(cs.color)||{c:[0,0,0],a:1};
      var al=cs.textAlign==='center'?'center':(cs.textAlign==='right'||cs.textAlign==='end')?'right':'left';
      var ty=0,th=lh,trInfo=null;
      try{var rg=document.createRange();rg.selectNodeContents(el);var tr=rg.getBoundingClientRect();if(tr.height>0){ty=tr.top-rect.top;th=tr.height;trInfo={tx:tr.left-rect.left,ty:tr.top-rect.top,w:tr.width}}}catch(e){}
      var tn={t:'t',text:txt,fs:fs,fw:(parseInt(cs.fontWeight)||400),lh:Math.max(lh,fs),ls:px(cs.letterSpacing)||0,col:col.c,al:al,x:0,y:ty,w:w,h:th,o:1};
      var ffam=(cs.fontFamily||'').split(',')[0].replace(/["']/g,'').trim();
      if(ffam)tn.ff=ffam.slice(0,40);
      if(col.a>=1){var ttk=tokOf(col.c,'text');if(ttk)tn.tk=ttk}
      if(cs.fontStyle==='italic'||cs.fontStyle==='oblique')tn.it=1;
      if(cs.textOverflow==='ellipsis'&&cs.overflowX!=='visible'&&cs.whiteSpace==='nowrap')tn.tr=1;
      var dl=cs.textDecorationLine||'none';
      if(/underline/.test(dl))tn.td='u';else if(/line-through/.test(dl))tn.td='s';
      node.ch.push(tn);
    }
    var sides=['Top','Right','Bottom','Left'];
    var bws=[px(cs.borderTopWidth),px(cs.borderRightWidth),px(cs.borderBottomWidth),px(cs.borderLeftWidth)];
    var bcx=[parseRgba(cs.borderTopColor),parseRgba(cs.borderRightColor),parseRgba(cs.borderBottomColor),parseRgba(cs.borderLeftColor)];
    var bst=[cs.borderTopStyle,cs.borderRightStyle,cs.borderBottomStyle,cs.borderLeftStyle];
    var ubw=bws[0]===bws[1]&&bws[1]===bws[2]&&bws[2]===bws[3];
    var ubst=bst[0]===bst[1]&&bst[1]===bst[2]&&bst[2]===bst[3];
    var ubc=bcx[0]&&bcx[1]&&bcx[2]&&bcx[3]&&bcx[0].c.join()===bcx[1].c.join()&&bcx[1].c.join()===bcx[2].c.join()&&bcx[2].c.join()===bcx[3].c.join()&&bcx[0].a===bcx[1].a&&bcx[1].a===bcx[2].a&&bcx[2].a===bcx[3].a;
    if(ubst&&bst[0]!=='solid'&&bst[0]!=='none'&&ubw&&ubc&&bws[0]>0){
      // 非实线边框：色条表达不了 dash，整体转描边（strokeDashes）
      node.stk={w:bws[0],c:bcx[0].c,a:bcx[0].a,dash:bst[0]};
      if(bcx[0].a>=1){var stkTk=tokOf(bcx[0].c,'stroke');if(stkTk)node.stk.tk=stkTk}
    } else for(var k=0;k<4;k++){
      var side=sides[k];
      var bc=bcx[k],bwid=bws[k];
      if(bwid>0&&bc&&bc.a>0){
        var geo=k===0?{x:0,y:0,w:w,h:bwid}:k===1?{x:w-bwid,y:0,w:bwid,h:h}:k===2?{x:0,y:h-bwid,w:w,h:bwid}:{x:0,y:0,w:bwid,h:h};
        node.ch.push({t:'f',f:[{c:bc.c,a:bc.a}],e:[],r:{tl:0,tr:0,br:0,bl:0},clip:false,x:geo.x,y:geo.y,w:geo.w,h:geo.h,o:1,n:'border-'+side.toLowerCase()});
      }
    }
    if(cs.mixBlendMode&&cs.mixBlendMode!=='normal')node.bm=cs.mixBlendMode;
    for(var j=0;j<el.children.length;j++){
      var c=serEl(el.children[j],{x:rect.left,y:rect.top},(path===undefined?'0':path)+'/'+j);
      if(c){
        try{var zj=parseInt(getComputedStyle(el.children[j]).zIndex);if(!isNaN(zj))c.__zi=zj}catch(e3){}
        node.ch.push(c);
      }
    }
    // z-index 重排（CSS 有 z-index 的元素改变绘制顺序；Figma appendChild 顺序=图层顺序，稳定排序仅移动显式 z 的子节点）
    if(node.ch.some(function(c){return c.__zi})){
      var idx=node.ch.map(function(c,i2){return{n:c,z:c.__zi||0,i:i2}});
      idx.sort(function(A,B){return A.z-B.z||A.i-B.i});
      node.ch=idx.map(function(E){delete E.n.__zi;return E.n});
    } else node.ch.forEach(function(c){delete c.__zi});
    var pb=pseudoNode(el,':before',w,h,trInfo,rect);
    var pa=pseudoNode(el,':after',w,h,trInfo,rect);
    // 自动布局置信转换（设计师视角：能增删内容的弹性容器，改文案不错位）：
    // 条件全过才打 al 标——display:flex 且 nowrap、方向非 reverse、justify/align 在 Figma 可映射集、
    // 子节点全流内（无 absolute/fixed、无 visibility:hidden）、无「文本+元素」混排、边框统一（转描边）或无、
    // 主轴总宽吻合（无 grow/shrink 拉伸失真）、无伪元素（伪元素入 AL 子序会错位，保持绝对定位）；
    // 任一不过保持绝对定位（宁可不转，不可转错）
    var alv=cs.display;
    if((alv==='flex'||alv==='inline-flex')&&(cs.flexWrap==='nowrap'||!cs.flexWrap)&&w>=2&&h>=2&&!node.stk&&!pb&&!pa){
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
              if(ubw&&(bws[0]===0||ubc)){
                var row=fd==='row';
                var pT=px(cs.paddingTop),pR=px(cs.paddingRight),pB=px(cs.paddingBottom),pL=px(cs.paddingLeft);
                var gap=row?px(cs.columnGap):px(cs.rowGap);
                if(!isFinite(gap)||gap<0)gap=0; // column-gap 未设时 computed='normal'，NaN 会毒化 itemSpacing
                var need=row?pL+pR+gap*(kids.length-1)+kids.reduce(function(s,k){return s+k.w},0):pT+pB+gap*(kids.length-1)+kids.reduce(function(s,k){return s+k.h},0);
                if(need<=(row?w:h)+1){
                  var alo={dir:row?'row':'col',gap:gap,just:jj,align:aa,pt:pT,pr:pR,pb:pB,pl:pL};
                  if(bws[0]>0){alo.bw=bws[0];alo.bc=bcx[0].c;alo.ba=bcx[0].a;
                    if(bcx[0].a>=1){var altk=tokOf(bcx[0].c,'stroke');if(altk)alo.btk=altk}
                    node.ch=node.ch.filter(function(c2){return ['border-top','border-right','border-bottom','border-left'].indexOf(c2.n)<0});}
                  node.al=alo;window.__alCount=(window.__alCount||0)+1;
                }
              }
            }
          }
        }
      }
    }
    if(pb)node.ch.unshift(pb);
    if(pa)node.ch.push(pa);
    if((!fills.length&&!eff.length&&!node.ch.length&&!bgL.length)||w<0.01)return null;
    return node;
  }
  ready(async function(){
    // 外部网页多页转录（__MS_EXT_CRAWL__ = 原始链接，build-scene --ext --site 注入）：
    // 收集可见同源链接（导航区 nav/header/aside 优先、pathname+search 去重、排除资源文件），
    // 写 ms-ext-links 标记 → Node 侧逐页抓取转录（对齐 demo 侧 MS_FIGMA_EXPORT 多态铺开）
    if(window.__MS_EXT_CRAWL__){
      try{
        var org2=new URL(window.__MS_EXT_CRAWL__),seenL={},listL=[];
        Array.prototype.forEach.call(document.querySelectorAll('a[href]'),function(a){
          try{
            var u=new URL(a.getAttribute('href'),org2);
            if(u.protocol!=='http:'&&u.protocol!=='https:')return;
            if(u.host!==org2.host)return;
            var key=u.pathname+u.search;
            if(!key||seenL[key])return;
            if(/\\.(pdf|zip|rar|7z|png|jpe?g|gif|svg|webp|ico|mp4|mp3|css|js|mjs|json|xml|csv|xlsx?|docx?|pptx?|txt)(\\?|$)/i.test(u.pathname))return;
            if(!a.getClientRects().length)return;
            seenL[key]=1;
            listL.push({u:key,t:(a.textContent||'').replace(/\\s+/g,' ').trim().slice(0,24),nav:a.closest('nav,header,aside')?1:0,url:u.origin+key});
          }catch(e2){}
        });
        listL.sort(function(a,b){return b.nav-a.nav});
        var lsc=document.createElement('script');lsc.id='ms-ext-links';lsc.type='application/json';
        lsc.textContent=JSON.stringify(listL.slice(0,30)).replace(/</g,'\\\\u003c');
        document.documentElement.appendChild(lsc);
      }catch(e3){}
    }
    var hook=window.MS_FIGMA_EXPORT||{rootSelector:'#app',states:[{name:'默认态',setup:function(){}}],columns:1,frameWidth:0,settleMs:200};
    var root=document.querySelector(hook.rootSelector||'#app')||document.body;
    var settle=hook.settleMs!=null?hook.settleMs:200;
    // 无契约页（外部网页）宽度取渲染视口（build-scene --viewport 注入），自家 demo 契约显式 frameWidth 优先
    var cols=hook.columns||1,W=hook.frameWidth||window.__MS_VIEWPORT__||1440,GAP=64;
    if(typeof hook.ready==='function'){try{await hook.ready()}catch(e){}}
    var cells=[],colH=[];for(var c0=0;c0<cols;c0++)colH.push(0);
    // 原型连线素材：捕获 setup 真实派发的 click（capture，最多 3 个）+ DOM 路径（与节点 p 同一索引方案）
    var trigAll=[],trigNow=null;
    function pathFor(el2){var seg=[];while(el2&&el2!==root&&el2.parentElement){var pp=el2.parentElement;seg.unshift([].indexOf.call(pp.children,el2));el2=pp}return seg.length?'0/'+seg.join('/'):'0'}
    document.addEventListener('click',function(e2){if(!trigNow||trigNow.evs.length>=3)return;trigNow.evs.push({tp:'click',path:pathFor(e2.target)})},true);
    for(var i=0;i<hook.states.length;i++){
      var s=hook.states[i],failed=false;
      trigNow={state:i,evs:[]};
      try{
        if(typeof hook.reset==='function'){hook.reset();await sleep(settle)}
        s.setup();await sleep(settle);
      }catch(e){failed=true;console.error('[scene] 状态 '+s.name+' setup 失败:',e)}
      if(trigNow.evs.length)trigAll.push(trigNow);
      trigNow=null;
      // trigger 选择器（可选，函数驱动型 setup 用）：setup 后解析目标元素路径——此时 DOM 已是第 i 态，元素可查
      if(typeof s.trigger==='string'&&!trigAll.some(function(t2){return t2.state===i})){
        try{var te=root.querySelector(s.trigger)||document.querySelector(s.trigger);
          if(te)trigAll.push({state:i,evs:[{tp:'click',path:pathFor(te)}]})}catch(e7){}
      }
      var rr=root.getBoundingClientRect();
      var tree=serEl(root,{x:rr.left,y:rr.top},'0')||{t:'f',f:[],e:[],r:{tl:0,tr:0,br:0,bl:0},clip:false,x:0,y:0,w:W,h:600,o:1,ch:[]};
      var col=i%cols,x=col*(W+GAP),y=colH[col];
      var hh=Math.max(root.scrollHeight,600);
      colH[col]+=hh+GAP;
      cells.push({label:(i+1)+'. '+s.name+(failed?'（导出失败，按前态快照）':''),x:x,y:y,w:W,h:hh,root:tree});
      if(window.__MS_AUDIT__&&typeof window.__MS_AUDIT_FN__==='function'){
        try{window.__MS_AUDIT_RESULTS__=window.__MS_AUDIT_RESULTS__||[];window.__MS_AUDIT_RESULTS__.push(window.__MS_AUDIT_FN__(cells[cells.length-1],i))}
        catch(e){console.error('[audit] 状态 '+i+' 审计失败:',e)}
      }
    }
    var scene={v:1,generatedAt:new Date().toISOString(),cells:cells,proto:trigAll.length?trigAll:undefined,stats:{al:window.__alCount||0,img:window.__imgCount||0,bg:window.__bgCount||0}};
    if(TOK_BY_VAL)scene.tokMap=TOK_BY_VAL; // 值->候选令牌名映射，Node 侧（build-scene walkLib）反查 lib.tcols 用
    var sc=document.createElement('script');sc.id='ms-scene-json';sc.type='application/json';
    sc.textContent=JSON.stringify(scene).replace(/</g,'\\\\u003c');
    document.documentElement.appendChild(sc);
    if(window.__MS_AUDIT__&&window.__MS_AUDIT_RESULTS__&&window.__MS_AUDIT_RESULTS__.length){
      var asc=document.createElement('script');asc.id='ms-audit-json';asc.type='application/json';
      asc.textContent=JSON.stringify(window.__MS_AUDIT_RESULTS__).replace(/</g,'\\\\u003c');
      document.documentElement.appendChild(asc);
    }
    document.title='__MS_SCENE_READY__';
    console.log('[scene] 序列化完成: '+cells.length+' 屏');
  });
})()`;

module.exports = { BOOTSTRAP };
