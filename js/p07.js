
(function(){
  var sec=document.getElementById('p8'), spec=document.getElementById('p8Spec'), plq=document.getElementById('p8Plq');
  function enter(){
    sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter');
    setTimeout(function(){ spec.classList.add('show'); }, 900);
  }
  setTimeout(enter,120);
  window.__p8Done=function(){ spec.classList.add('done'); };

  var mask=document.getElementById('p8Mask'), pop=document.getElementById('p8Pop');
  var board=document.getElementById('p8Board'), grab=document.getElementById('p8Grab');
  var startMask=document.getElementById('p8Start'), beginBtn=document.getElementById('p8Begin');
  var xBtn=document.getElementById('p8X'), succ=document.getElementById('p8Succ'), succOk=document.getElementById('p8SuccOk');
  var tally=[].slice.call(document.querySelectorAll('#p8Tally i'));
  var tallyTxt=document.getElementById('p8TallyTxt');
  var segs=[].slice.call(document.querySelectorAll('#p8Strip i'));
  var stripTxt=document.getElementById('p8StripTxt');
  var drops=[], got=0, running=false, grabX=0, raf=null, lastT=0, spawnAcc=0;

  function boardW(){ return board.clientWidth; }
  function boardH(){ return board.clientHeight; }
  function openPop(){ mask.classList.add('in'); pop.classList.add('in'); startMask.classList.remove('gone'); resetGame(); }
  function closePop(){ mask.classList.remove('in'); pop.classList.remove('in'); running=false; }
  function resetGame(){
    running=false; got=0; spawnAcc=0; lastT=0;
    drops.forEach(function(d){ d.remove(); }); drops=[];
    tally.forEach(function(t){ t.classList.remove('on'); });
    segs.forEach(function(t){ t.classList.remove('on'); });
    stripTxt.classList.remove('on'); if(succ) succ.classList.remove('in');
    tallyTxt.textContent='接到 0 / 11';
    grabX=boardW()/2; setGrabX(grabX);
    if(spec) spec.classList.remove('done');
  }
  function setGrabX(x){
    grabX=x;
    grab.style.transform='translate3d('+(x-boardW()/2)+'px,0,0)';
  }
  function startGame(){
    startMask.classList.add('gone'); running=true; lastT=0; spawnAcc=0;
    if(!raf) raf=requestAnimationFrame(loop);
  }
  function spawn(){
    if(drops.length>12) return;
    var d=document.createElement('div'); d.className='drop';
    var w=boardW();
    d._x=26+Math.random()*(w-52); d._y=-34;
    d._v=2026102045.5+Math.random()*0.9; d._r=Math.random()*40-20;
    d.style.left=d._x+'px'; d.style.top='0px';
    d._t='rotate('+d._r+'deg)';
    d.style.transform='translate3d(0,-34px,0) '+d._t;
    d.style.backgroundImage='url(../img/p07_15.png)'; d.style.backgroundSize='contain';
    d.style.backgroundRepeat='no-repeat'; d.style.backgroundPosition='center';
    board.appendChild(d); drops.push(d);
  }
  function ring(x,y){ var r=document.createElement('div'); r.className='ring';
    r.style.left=x+'px'; r.style.top=y+'px'; board.appendChild(r);
    setTimeout(function(){ r.remove(); },520); }
  function miss(x,y){ var m=document.createElement('div'); m.className='miss';
    m.style.left=x+'px'; m.style.top=y+'px'; board.appendChild(m);
    setTimeout(function(){ m.remove(); },520); }
  function loop(t){
    raf=requestAnimationFrame(loop);
    if(!running) return;
    if(!lastT) lastT=t;
    var dt=Math.min(48, t-lastT); lastT=t;
    var h=boardH(), w=boardW();
    spawnAcc+=dt;
    if(spawnAcc>640){ spawnAcc=0; spawn(); }
    var gy=h-72;   /* 篮口：IP形象完整显示(高约116px)，接住点对齐篮口区域 */
    for(var i=drops.length-1;i>=0;i--){
      var d=drops[i];
      d._y += d._v*dt/16;
      d.style.transform='translate3d(0,'+d._y+'px,0) '+d._t;
      if(d._y>gy-22 && d._y<gy+44){
        if(Math.abs(d._x-grabX)<46){
          d.classList.add('caught');
          ring(d._x, gy+4);
          var el=d; setTimeout(function(){ el.remove(); },170);
          drops.splice(i,1);
          got++;
          if(tally[got-1]) tally[got-1].classList.add('on');
          tallyTxt.textContent='接到 '+got+' / 11';
          if(got>=11) finish();
          continue;
        }
      }
      if(d._y>h+26){ miss(d._x, h-8); d.remove(); drops.splice(i,1); }
    }
  }
  function finish(){
    running=false;
    drops.forEach(function(d){ d.remove(); }); drops=[];
    var n=0, iv=setInterval(function(){
      if(n<segs.length){ segs[n].classList.add('on'); n++; }
      else{ clearInterval(iv); stripTxt.classList.add('on'); }
    },130);
    setTimeout(function(){ window.__p8Done(); }, 1200);
    setTimeout(function(){ if(succ) succ.classList.add('in'); }, 2000);   /* 成功提示卡 */
  }
  function onMove(e){
    if(!board) return;
    var r=board.getBoundingClientRect();
    var x=(e.touches&&e.touches[0]?e.touches[0].clientX:e.clientX)-r.left;
    if(x<34) x=34; if(x>r.width-34) x=r.width-34;
    setGrabX(x);
  }
  board.addEventListener('pointerdown',function(e){ e.preventDefault(); onMove(e); });
  board.addEventListener('pointermove',function(e){ if(e.buttons||e.pointerType==='mouse'){ onMove(e); } });
  board.addEventListener('pointercancel',function(){});
  board.addEventListener('touchstart',function(e){ e.preventDefault(); onMove(e); },{passive:false});
  board.addEventListener('touchmove',function(e){ e.preventDefault(); onMove(e); },{passive:false});

  /* 手机端修复：弹窗内按钮在游戏板上，板的 touchstart 有 preventDefault，
     手机触摸时 click 事件被拦截合成不出来 → 改用 pointerdown 直接触发（桌面一致），
     click 保留兜底（幂等，重复调用无副作用）。 */
  function bindBtn(el, fn) {
    if (!el) return;
    el.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); fn(); });
    el.addEventListener('click', function (e) { e.stopPropagation(); fn(); });
  }
  bindBtn(beginBtn, startGame);
  bindBtn(xBtn, closePop);
  if (mask) mask.addEventListener('click', closePop);
  bindBtn(succOk, closePop);

  if (plq) {
    var plqFn = function () {
      if (plq.classList.contains('press')) return;
      plq.classList.add('press');
      setTimeout(function () { plq.classList.remove('press'); openPop(); }, 540);
    };
    plq.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); plqFn(); });
    plq.addEventListener('click', function (e) { e.stopPropagation(); plqFn(); });
  }
})();
