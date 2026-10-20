
(function(){
  var sec=document.getElementById('p6');
  function enter(){ if(sec){ sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter'); } }
  if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(function(){ setTimeout(enter,60); }); }
  else setTimeout(enter,220);
  window.addEventListener('pageshow',function(){ setTimeout(enter,60); });

  var track=document.getElementById('p6Track');
  var sickle=document.getElementById('p6Sickle');
  var done=document.getElementById('p6Done');
  var say=document.getElementById('p6Say');
  var chibi=document.getElementById('p6Chibi');
  var mask=document.getElementById('p6Mask'), pop=document.getElementById('p6Pop');
  var x=document.getElementById('p6X'), ok=document.getElementById('p6Ok');
  var open=false, dragging=false, prog=0;

  function railW(){ return track.clientWidth; }
  function paint(p){
    prog=p;
    var w=railW();
    sickle.style.transform='translate3d('+(p*w).toFixed(1)+'px,0,0)';
    done.style.width=(p*w).toFixed(1)+'px';
  }
  function openPop(){
    if(open) return; open=true;
    track.classList.add('done');
    if(say) say.classList.add('gone');
    if(chibi) chibi.classList.add('gone');     /* 弹窗弹出时小人先退场,免得被挡在后面 */
    mask.classList.add('on'); pop.classList.add('on');
  }
  function closePop(){ open=false; mask.classList.remove('on'); pop.classList.remove('on'); }

  function ptX(e){ return (e.touches&&e.touches[0])?e.touches[0].clientX:e.clientX; }
  function onDown(e){
    dragging=true; sickle.classList.add('drag');
    try{ sickle.setPointerCapture&&sickle.setPointerCapture(e.pointerId); }catch(err){}
    e.preventDefault();
  }
  function onMove(e){
    if(!dragging) return;
    var r=track.getBoundingClientRect(), w=railW();
    if(w<=0) return;
    var p=(ptX(e)-r.left)/w;
    if(p<0) p=0; if(p>1) p=1;
    paint(p);
    e.preventDefault();
  }
  function onUp(){
    if(!dragging) return;
    dragging=false; sickle.classList.remove('drag');
    if(prog>=0.55){ paint(1); openPop(); }
    else paint(0);
  }
  sickle.addEventListener('pointerdown',onDown);
  window.addEventListener('pointermove',onMove,{passive:false});
  window.addEventListener('pointerup',onUp);
  window.addEventListener('pointercancel',onUp);
  sickle.addEventListener('touchstart',function(e){ e.preventDefault(); },{passive:false});

  sickle.setAttribute('tabindex','0');
  sickle.addEventListener('keydown',function(e){ if(e.key==='Enter'||e.key===' '){ paint(1); openPop(); } });

  x.addEventListener('click',function(e){ e.stopPropagation(); closePop(); });
  ok.addEventListener('click',function(e){ e.stopPropagation(); closePop(); });
  mask.addEventListener('click',closePop);

  paint(0);
  window.addEventListener('resize',function(){ paint(prog); });
})();
