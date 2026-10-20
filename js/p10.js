
(function(){
  var sec=document.getElementById('p11');
  function enter(){ if(sec){ sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter'); } }
  setTimeout(enter,150);

  /* ── 锚点:点一下,出一句唱词 ── */
  /* 唱词库:目前只有策划书给的一句真唱词。
     补词时把整句话加进这个数组即可,随机逻辑不用改。 */
  var CHANTS = [
    '保护风调又雨顺，保护五谷再丰登。'
  ];
  var anchor=document.getElementById('p11Anchor');
  var pg1=document.getElementById('p11pg1'), pg2=document.getElementById('p11pg2');
  var pgno=document.getElementById('p11pgno'), nextBtn=document.getElementById('p11next');
  var onSecond=false;
  if(nextBtn){ nextBtn.addEventListener('click',function(e){ e.stopPropagation();
    onSecond=!onSecond;
    pg1.classList.toggle('on',!onSecond); pg2.classList.toggle('on',onSecond);
    pgno.textContent=onSecond?'二 / 二':'一 / 二';
    nextBtn.textContent=onSecond?'上一页':'下一页';
  }); }
  var slip=document.getElementById('p11Slip');
  var pg1=document.getElementById('p11pg1'), pg2=document.getElementById('p11pg2');
  var pgno=document.getElementById('p11pgno'), nextBtn=document.getElementById('p11next');
  var onSecond=false;
  var lastIdx=-1;
  function pick(){
    if(CHANTS.length===1) return CHANTS[0];
    var i=lastIdx;
    while(i===lastIdx) i=Math.floor(Math.random()*CHANTS.length);
    lastIdx=i; return CHANTS[i];
  }
  if(anchor&&slip){
    anchor.addEventListener('click',function(e){
      e.stopPropagation();
      if(slip.classList.contains('on')){ slip.classList.remove('on'); sec.classList.remove('showing'); return; }
      onSecond=false; pg1.classList.add('on'); pg2.classList.remove('on');
      pgno.textContent='一 / 二'; nextBtn.textContent='下一页';
      slip.classList.add('on');
      sec.classList.add('showing');
    });
    document.addEventListener('click',function(e){
      if(!slip.classList.contains('on')) return;
      if(slip.contains(e.target)||anchor.contains(e.target)) return;
      slip.classList.remove('on');
      sec.classList.remove('showing');
    });
  }
})();
