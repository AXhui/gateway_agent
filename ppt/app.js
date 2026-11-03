(() => {
  'use strict';
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const params = new URLSearchParams(location.search);
  const isPresenter = params.has('presenter');
  const isPreview = params.has('preview');
  const MAIN_COUNT = 12;
  const INTRO_INDEX = DECK.length-1;
  let index=0, step=0, reduced=false, speakerWindow=null, controlsTimer, toastTimer;
  let lastMain={index:11,step:1};
  const rawHash=location.hash.slice(1).split('.').map(Number);
  index=!location.hash||rawHash[0]===0?INTRO_INDEX:clamp((rawHash[0]||1)-1,0,DECK.length-1);
  step=clamp(rawHash[1]||0,0,DECK[index].steps);
  try { reduced=localStorage.getItem('ued-next-reduced')==='true'; } catch {}
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) reduced=true;
  document.body.classList.toggle('reduced',reduced);

  function clamp(x,a,b){return Math.min(b,Math.max(a,x));}
  function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500);}
  function snapshot(){return {type:'ued-state',index,step,reduced};}
  function sendState(){if(speakerWindow&&!speakerWindow.closed)speakerWindow.postMessage(snapshot(),'*');}
  function setHash(){const hash=index===INTRO_INDEX?'#0':`#${index+1}.${step}`;try{history.replaceState(null,'',hash);}catch{location.hash=hash;}}
  function resize(){document.documentElement.style.setProperty('--scale',Math.min(innerWidth/1920,innerHeight/1080));requestAnimationFrame(positionToken);}
  function positionToken(){
    if(isPresenter)return;
    const token=$('#asset-token'),anchor=$('.slide.active [data-token-anchor]');
    if(!anchor){token.style.opacity='0';return;}
    const rect=anchor.getBoundingClientRect(),stage=$('#stage').getBoundingClientRect();
    const scale=stage.width/1920;
    token.style.width=`${rect.width/scale}px`;token.style.height=`${rect.height/scale}px`;
    token.style.transform=`translate(${(rect.left-stage.left)/scale}px,${(rect.top-stage.top)/scale}px)`;
    token.classList.toggle('compact',index===5);token.style.opacity='1';
  }
  function pauseAll(except){$$('video').forEach(v=>{if(v!==except)v.pause();});}
  function setClip(shell,start,end,poster,rate=1){
    const video=$('video',shell);video.pause();
    shell.dataset.start=start;shell.dataset.end=end;shell.dataset.rate=rate;shell.dataset.poster=poster;
    video.poster=A+poster;$('.video-fallback img',shell).src=A+poster;
    $('.clip-label',shell).textContent=`${start}–${end} 秒${rate!==1?' · '+rate+'×':''}`;
    video.playbackRate=rate;shell._needsSeek=true;
    if(video.readyState>=1){try{video.currentTime=start;shell._needsSeek=false;}catch{}}
    $('.media-status',shell).textContent='手动播放 · 到片段结尾自动暂停';
    $('[data-video-action="play"]',shell).textContent='播放片段';
    $('[data-video-action="fallback"]',shell).textContent='切换截图';
    $('.video-fallback',shell).hidden=true;
  }
  function showFallback(shell,show=true){
    const v=$('video',shell);v.pause();$('.video-fallback',shell).hidden=!show;
    $('[data-video-action="fallback"]',shell).textContent=show?'返回视频':'切换截图';
    $('.media-status',shell).textContent=show?'已切换备用截图，讲解可继续':'手动播放 · 到片段结尾自动暂停';
  }
  async function playClip(shell,restart=false){
    const v=$('video',shell),start=Number(shell.dataset.start),end=Number(shell.dataset.end);
    if(v.error){showFallback(shell);toast('视频无法播放，已切换截图。');return;}
    if(!v.paused&&!restart){v.pause();return;}
    pauseAll(v);showFallback(shell,false);
    if(restart||shell._needsSeek||v.currentTime<start||v.currentTime>=end-.12){try{v.currentTime=start;shell._needsSeek=false;}catch{}}
    v.playbackRate=Number(shell.dataset.rate);
    try{await v.play();}catch{showFallback(shell);toast('视频未能播放，已切换备用截图。');}
  }
  function go(i,s=0,opts={}){
    const nextIndex=clamp(i,0,DECK.length-1),nextStep=clamp(s,0,DECK[nextIndex].steps);
    const changed=nextIndex!==index||nextStep!==step;
    if(index<MAIN_COUNT&&nextIndex>=MAIN_COUNT)lastMain={index,step};
    index=nextIndex;step=nextStep;
    if(changed||opts.reset)pauseAll();
    render(changed||opts.reset);
    if(!isPreview)setHash();
    if(!isPreview)sendState();
  }
  function next(){
    if(index===INTRO_INDEX){go(0,0);return;}
    if(step<DECK[index].steps)go(index,step+1);
    else if(index<MAIN_COUNT-1)go(index+1,0);
    else if(index===MAIN_COUNT-1)toast('演讲结束。按 M 可进入备用答辩页。');
    else if(index<INTRO_INDEX-1)go(index+1,0);
  }
  function previous(){if(index===INTRO_INDEX)return;if(step>0)go(index,step-1);else if(index>0)go(index-1,DECK[index-1].steps);else go(INTRO_INDEX,0);}
  function replay(){
    const active=$('.slide.active');active.classList.remove('active');
    active.querySelectorAll('.reveal').forEach(el=>el.classList.remove('visible'));
    void active.offsetWidth;
    go(index,0,{reset:true});
    const shell=$('.media-shell',active);if(shell)setClip(shell,+shell.dataset.start,+shell.dataset.end,shell.dataset.poster,+shell.dataset.rate);
    if(index===INTRO_INDEX)$('#intro-video').currentTime=0;
  }
  function render(resetVideo=false){
    $$('.slide').forEach((el,i)=>{
      const active=i===index;el.classList.toggle('active',active);el.inert=!active;el.setAttribute('aria-hidden',String(!active));
      el.dataset.currentStep=active?step:0;
      $$('.reveal',el).forEach(r=>r.classList.toggle('visible',active&&Number(r.dataset.step)<=step));
    });
    $('#chapter-label').textContent=DECK[index].chapter;
    $('#stage').classList.toggle('intro-active',index===INTRO_INDEX);
    $('#page-label').textContent=index===INTRO_INDEX?'P0 / VIDEO':index<MAIN_COUNT?`${String(index+1).padStart(2,'0')} / 12`:`A${index-MAIN_COUNT+1} / 04`;
    $('#step-label').textContent=`${step+1} / ${DECK[index].steps+1}`;
    $('#progress').style.width=(index===INTRO_INDEX?0:index<MAIN_COUNT?((index+(step+1)/(DECK[index].steps+1))/MAIN_COUNT*100):100)+'%';
    $('#previous').disabled=index===INTRO_INDEX;
    $('#next').disabled=(index===11||index===INTRO_INDEX-1)&&step===DECK[index].steps;
    $('#motion').setAttribute('aria-pressed',String(reduced));
    if(index===6){
      const active=$('.slide.active');
      $$('.demo-step',active).forEach((b,i)=>b.classList.toggle('selected',i===step));
      if(resetVideo){const selected=$$('.demo-step',active)[step],parts=selected.dataset.clip.split(',');setClip($('.media-shell',active),Number(parts[0]),Number(parts[1]),parts[2]);}
    }
    positionToken();
  }
  function openMenu(){
    $('#menu-grid').innerHTML=`<button data-menu-index="${INTRO_INDEX}" class="${index===INTRO_INDEX?'current':''}"><span class="menu-num">P0</span><span><span class="menu-name">整体介绍 · 视频</span><span class="menu-time">约 71 秒 · 可播放或跳过</span></span></button>`+DECK.slice(0,INTRO_INDEX).map((d,i)=>`${i===12?'<p class="menu-divider">备用页 / 答辩与证据</p>':''}<button data-menu-index="${i}" class="${i===index?'current':''}"><span class="menu-num">${i<12?String(i+1).padStart(2,'0'):'A'+(i-11)}</span><span><span class="menu-name">${d.title.replace('备用 / ','')}</span><span class="menu-time">${i<12?'主讲 · '+d.duration+' 秒':'备用 · 不计入主讲时长'}</span></span></button>`).join('');
    pauseAll();$('#menu').showModal();
  }
  function toggleMotion(){reduced=!reduced;document.body.classList.toggle('reduced',reduced);$('#motion').setAttribute('aria-pressed',String(reduced));try{localStorage.setItem('ued-next-reduced',String(reduced));}catch{}sendState();}
  function openPresenter(){
    if(speakerWindow&&!speakerWindow.closed){speakerWindow.focus();sendState();return;}
    const url=new URL(location.href);url.search='?presenter=1';
    speakerWindow=window.open(url.href,'ued-next-presenter','width=1320,height=900');
    if(!speakerWindow)toast('讲稿窗口被浏览器拦截，请允许此文件打开弹出窗口。');
  }
  function command(name){
    if(name==='next')next();if(name==='previous')previous();if(name==='replay')replay();
    if(name==='play'){
      if(index===INTRO_INDEX){const v=$('#intro-video');if(v.paused){pauseAll(v);v.play().catch(()=>toast('视频未能播放，可直接进入正式开场。'));}else v.pause();}
      else {const shell=$('.slide.active .media-shell');if(shell)playClip(shell);else toast('当前屏没有主流程视频。');}
    }
    if(name==='return')go(lastMain.index,lastMain.step);
  }
  async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{toast('浏览器未进入全屏，可使用 F11。');}}
  function controlsVisible(){document.body.classList.add('controls-visible');clearTimeout(controlsTimer);controlsTimer=setTimeout(()=>document.body.classList.remove('controls-visible'),2600);}

  // The only cross-window messages accepted come from windows created by this deck.
  addEventListener('message',e=>{
    const msg=e.data;if(!msg||typeof msg!=='object')return;
    if(isPresenter&&e.source===window.opener&&msg.type==='ued-state'){presenterState(msg);return;}
    if(isPreview&&e.source===parent&&msg.type==='ued-state'){reduced=!!msg.reduced;document.body.classList.add('reduced');go(msg.index,msg.step);return;}
    if(!isPresenter&&!isPreview&&e.source===speakerWindow){
      if(msg.type==='ued-ready')sendState();
      if(msg.type==='ued-command'&&['next','previous','replay','play','return'].includes(msg.name))command(msg.name);
    }
  });

  function keyboard(e){
    if(e.altKey||e.ctrlKey||e.metaKey||e.isComposing)return;
    if($('dialog[open]'))return;
    if(e.target.closest('input,textarea,select,video,[contenteditable=true]'))return;
    if(e.target.closest('button,a')&&(e.key===' '||e.key==='Enter'))return;
    const send=name=>isPresenter?presenterCommand(name):command(name);
    if(['ArrowRight','ArrowDown',' ','PageDown','Enter'].includes(e.key)){e.preventDefault();send('next');}
    else if(['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)){e.preventDefault();send('previous');}
    else if(e.key.toLowerCase()==='r')send('replay');
    else if(e.key.toLowerCase()==='v')send('play');
    else if(!isPresenter&&e.key.toLowerCase()==='m')openMenu();
    else if(!isPresenter&&e.key.toLowerCase()==='f')fullscreen();
    else if(!isPresenter&&e.key.toLowerCase()==='p')openPresenter();
    else if(!isPresenter&&e.key==='Home'){e.preventDefault();go(INTRO_INDEX,0);}
    else if(!isPresenter&&e.key==='End'){e.preventDefault();go(11,1);}
  }
  addEventListener('keydown',keyboard);
  // One wheel gesture advances one step. Wait for both gesture end and transition
  // cooldown, so trackpad inertia or a fast wheel cannot skip several reveals.
  if(!isPresenter&&!isPreview){
    let wheelSum=0,lastWheelAt=0,lastTurnAt=-Infinity,wheelLocked=false;
    addEventListener('wheel',e=>{
      if(e.defaultPrevented||e.ctrlKey||e.metaKey||e.altKey||$('dialog[open]'))return;
      if(e.target instanceof Element&&e.target.closest('video,#toolbar,input,textarea,select,[contenteditable=true]'))return;
      if(Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
      e.preventDefault();
      const now=performance.now();
      if(now-lastWheelAt>180){wheelSum=0;if(now-lastTurnAt>=650)wheelLocked=false;}
      lastWheelAt=now;
      if(wheelLocked||now-lastTurnAt<650)return;
      const delta=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
      if(Math.sign(delta)!==Math.sign(wheelSum))wheelSum=0;
      wheelSum+=delta;
      if(Math.abs(wheelSum)<40)return;
      wheelLocked=true;lastTurnAt=now;
      if(wheelSum>0)next();else previous();
      wheelSum=0;
    },{passive:false});
  }
  if(isPresenter){initPresenter();return;}

  $('#slides').innerHTML=DECK.map((d,i)=>`<section class="slide ${d.className||''}" data-index="${i}" aria-label="${i+1}：${d.title}" aria-hidden="true" inert>${d.html}</section>`).join('');
  $$('.media-shell').forEach(shell=>{
    const v=$('video',shell);
    v.addEventListener('loadedmetadata',()=>{if(shell._needsSeek){v.currentTime=Number(shell.dataset.start);shell._needsSeek=false;}v.playbackRate=Number(shell.dataset.rate);});
    v.addEventListener('timeupdate',()=>{
      if(!v.paused&&v.currentTime>=Number(shell.dataset.end)){v.pause();$('.media-status',shell).textContent='本段已结束 · 下一步继续讲解';}
    });
    v.addEventListener('seeking',()=>{
      const start=Number(shell.dataset.start),end=Number(shell.dataset.end);
      if(v.currentTime<start-.2)v.currentTime=start;
      if(v.currentTime>end+.2)v.currentTime=end;
    });
    v.addEventListener('error',()=>{showFallback(shell);$('.media-status',shell).textContent='视频加载失败 · 已显示备用截图';});
    v.addEventListener('play',()=>{pauseAll(v);$('[data-video-action="play"]',shell).textContent='暂停片段';$('.media-status',shell).textContent='播放中 · 片段结束自动暂停';});
    v.addEventListener('pause',()=>{$('[data-video-action="play"]',shell).textContent='继续播放';});
    setClip(shell,+shell.dataset.start,+shell.dataset.end,shell.dataset.poster,+shell.dataset.rate);
  });
  $$('video').forEach(v=>v.addEventListener('play',()=>pauseAll(v)));
  $('#skip-intro').onclick=()=>go(0,0);
  $('#intro-video').addEventListener('error',()=>{$('.intro-film-fallback').hidden=false;});
  $('#intro-video').addEventListener('ended',()=>toast('介绍视频已结束，按 → 进入正式开场。'));
  $('#next').onclick=next;$('#previous').onclick=previous;$('#open-menu').onclick=openMenu;
  $('#replay').onclick=replay;$('#presenter').onclick=openPresenter;$('#fullscreen').onclick=fullscreen;$('#motion').onclick=toggleMotion;
  document.addEventListener('click',e=>{
    const close=e.target.closest('[data-close]');if(close){close.closest('dialog').close();return;}
    const menuItem=e.target.closest('[data-menu-index]');if(menuItem){go(+menuItem.dataset.menuIndex,0);$('#menu').close();return;}
    const clip=e.target.closest('[data-clip]');if(clip){go(index,+clip.dataset.goStep);return;}
    const action=e.target.closest('[data-video-action]');
    if(action){const shell=action.closest('.media-shell');if(action.dataset.videoAction==='fallback')showFallback(shell,$('.video-fallback',shell).hidden);else playClip(shell,action.dataset.videoAction==='restart');return;}
    const image=e.target.closest('[data-image]');if(image)openImage(image.dataset.image,image.dataset.caption);
  });
  $$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}}));
  addEventListener('hashchange',()=>{const [i,s]=location.hash.slice(1).split('.').map(Number);go(!location.hash||i===0?INTRO_INDEX:(i||1)-1,s||0);});
  addEventListener('resize',resize);addEventListener('pointermove',controlsVisible,{passive:true});
  addEventListener('pagehide',()=>pauseAll());
  if(isPreview){$('#toolbar').hidden=true;document.body.classList.add('reduced');}
  resize();render(true);controlsVisible();
  document.fonts.ready.then(()=>{
    resize();
    if(!document.fonts.check('28px "UED Sans"'))toast('内置字体未加载，请保留完整的 assets/fonts 文件夹后重新打开。');
  });

  // Evidence viewer: bounded zoom, pointer capture and pan.
  let zoom=1,panX=0,panY=0,drag=null;
  function paintZoom(){const im=$('#lightbox-image');im.style.setProperty('--zoom',zoom);im.style.setProperty('--pan-x',panX+'px');im.style.setProperty('--pan-y',panY+'px');}
  function setZoom(value){zoom=clamp(value,1,5);if(zoom===1){panX=0;panY=0;}paintZoom();}
  function openImage(file,caption){pauseAll();$('#lightbox-image').src=A+file;$('#lightbox-image').alt=caption;$('#lightbox-caption').textContent=caption;zoom=1;panX=panY=0;paintZoom();$('#lightbox').showModal();}
  $('#zoom-in').onclick=()=>setZoom(zoom+.35);$('#zoom-out').onclick=()=>setZoom(zoom-.35);$('#zoom-reset').onclick=()=>setZoom(1);
  $('#lightbox-surface').addEventListener('wheel',e=>{e.preventDefault();setZoom(zoom+(e.deltaY<0?.2:-.2));},{passive:false});
  $('#lightbox-surface').addEventListener('pointerdown',e=>{drag={x:e.clientX,y:e.clientY,px:panX,py:panY};e.currentTarget.setPointerCapture(e.pointerId);});
  $('#lightbox-surface').addEventListener('pointermove',e=>{if(!drag)return;const r=e.currentTarget.getBoundingClientRect();panX=clamp(drag.px+e.clientX-drag.x,-r.width*(zoom-1)/2,r.width*(zoom-1)/2);panY=clamp(drag.py+e.clientY-drag.y,-r.height*(zoom-1)/2,r.height*(zoom-1)/2);paintZoom();});
  $('#lightbox-surface').addEventListener('pointerup',()=>drag=null);$('#lightbox-surface').addEventListener('pointercancel',()=>drag=null);
  $('#lightbox').addEventListener('close',()=>drag=null);

  // Presenter notes. postMessage works for file:// windows without requiring a server.
  function presenterCommand(name){if(window.opener&&!window.opener.closed)window.opener.postMessage({type:'ued-command',name},'*');else toast('主演讲窗口已关闭，请从主窗口重新打开讲稿。');}
  function initPresenter(){
    document.body.classList.add('presenter-mode');document.title='UED Next · 演讲者讲稿';
    const previewURL=new URL(location.href);previewURL.search='?preview=1';
    const shell=document.createElement('main');shell.className='presenter-shell';
    shell.innerHTML=`<header class="presenter-top"><div><h1>UED Next / 演讲者视图</h1><p>将主窗口投到大屏，本窗口放在笔记本上。主讲建议 09:30。</p></div><div><div class="presenter-clock">00:00</div><button id="clock-toggle">开始计时</button> <button id="clock-reset">归零</button></div></header><div class="presenter-grid"><div><iframe class="presenter-preview" title="当前投影画面预览" src="${previewURL.href}"></iframe><div class="presenter-controls"><button data-command="previous">← 上一步</button><button class="primary" data-command="next">下一步 →</button><button data-command="play">播放 / 暂停视频</button><button data-command="replay">重播当前屏</button><button data-command="return">返回主讲</button></div><p class="presenter-progress"></p><p class="presenter-next"></p><p class="presenter-warning"></p></div><div class="presenter-panel"><p class="eyebrow">SPEAKER NOTES / 独立讲稿</p><h2 id="note-title"></h2><p id="note-copy"></p><div class="presenter-cue"></div></div></div>`;
    document.body.append(shell);
    $$('.presenter-controls button').forEach(b=>b.onclick=()=>presenterCommand(b.dataset.command));
    $('.presenter-preview').addEventListener('load',()=>$('.presenter-preview').contentWindow.postMessage(snapshot(),'*'));
    let elapsed=0,running=false,started=0;
    function drawClock(){const seconds=Math.floor((elapsed+(running?Date.now()-started:0))/1000);$('.presenter-clock').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
    $('#clock-toggle').onclick=()=>{if(running){elapsed+=Date.now()-started;running=false;}else{started=Date.now();running=true;}$('#clock-toggle').textContent=running?'暂停计时':'继续计时';drawClock();};
    $('#clock-reset').onclick=()=>{elapsed=0;started=Date.now();drawClock();};setInterval(drawClock,500);
    presenterState(snapshot());
    if(window.opener)window.opener.postMessage({type:'ued-ready'},'*');
    setInterval(()=>{$('.presenter-warning').textContent=window.opener&&!window.opener.closed?'已连接主演讲窗口 · 讲稿不会出现在投影画面中':'未连接主窗口，请从主演讲页面点击「讲稿」重新打开。';},1500);
  }
  function presenterState(state){
    index=clamp(state.index,0,DECK.length-1);step=clamp(state.step,0,DECK[index].steps);reduced=!!state.reduced;
    $('#note-title').textContent=DECK[index].title;$('#note-copy').textContent=DECK[index].notes;
    $('.presenter-cue').textContent=DECK[index].cues[step]||DECK[index].cues[0];
    $('.presenter-progress').textContent=`${index===INTRO_INDEX?'P0 / 介绍视频 · 可跳过':index<12?'主讲 '+(index+1)+' / 12':'备用页 '+(index-11)+' / 4'} · 本屏步骤 ${step+1} / ${DECK[index].steps+1} · 建议 ${DECK[index].duration||'按需'} 秒`;
    $('.presenter-next').textContent=index===INTRO_INDEX?'下一屏：'+DECK[0].title:index<11?'下一屏：'+DECK[index+1].title:index===11?'主讲结束。备用页从主窗口目录进入。':index<INTRO_INDEX-1?'下一备用页：'+DECK[index+1].title:'备用页结束。';
    const frame=$('.presenter-preview');if(frame&&frame.contentWindow)frame.contentWindow.postMessage(snapshot(),'*');
  }
})();
