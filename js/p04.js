
(function(){
  var sec=document.getElementById('p4');
  function enter(){ if(sec){ sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter'); } }
  if(document.fonts&&document.fonts.ready){ document.fonts.ready.then(function(){ setTimeout(enter,60); }); }
  else setTimeout(enter,220);
  window.addEventListener('pageshow',function(){ setTimeout(enter,60); });

  var DATA={
    head:{t:'龙头细节',b:['龙头造型类似狮头，龙角则像鹿角，','制作精巧，甚至能做到七孔通透。']},
    body:{t:'龙身细节',b:['蜿蜒，龙鳞由一片片麦秆编成，','每一片都清晰分明。','节段通常为单数，如 9 至 21 节。']},
    tail:{t:'龙尾细节',b:['稻草排列讲究“粗细有别、疏密有致”，','靠近龙身的部分较粗较密，','尾部末端则逐渐变细变疏，','形成自然的过渡。']}
  };
  var write=document.getElementById('p4Write');
  var scroll=document.getElementById('p4Scroll');
  var title=document.getElementById('p4Title');
  var hots=[].slice.call(document.querySelectorAll('.p4-hot'));
  var mask=document.getElementById('p4Mask'), pop=document.getElementById('p4Pop');
  var x=document.getElementById('p4X');
  var timers=[], cur=null;
  var PER_COL=9;      /* 卷轴横放、只有两百来像素高,一列放不下太多字 */

  function clearTimers(){ timers.forEach(clearTimeout); timers=[]; }
  function empty(){                       /* 收回:清空文字,装饰重新显出来 */
    clearTimers(); write.innerHTML=''; scroll.classList.remove('has-text');
  }
  /* 横排:一行一行写。逐字浮现,和卷轴"现写"的感觉一致。 */
  function writeOn(d){
    clearTimers(); write.innerHTML=''; scroll.classList.add('has-text');
    var total=0;
    function line(txt, cls){
      var el=document.createElement('div');
      el.className='p4-line '+cls;
      for(var i=0;i<txt.length;i++){
        var sp=document.createElement('span');
        sp.textContent=txt[i];
        el.appendChild(sp);
        (function(sp,dd){ timers.push(setTimeout(function(){
          sp.style.animation='p4_ink .32s cubic-bezier(.16,1,.3,1) both';
          sp.style.opacity='1'; sp.style.transform='none'; },dd)); })(sp,total*34);
        total++;
      }
      write.appendChild(el);
    }
    line(d.t,'title');
    d.b.forEach(function(t){ line(t,'body'); });
  }
  function toggle(h){
    var k=h.getAttribute('data-k');
    if(cur===h){ h.classList.remove('on'); cur=null; empty(); return; }   /* 再点收回 */
    if(cur) cur.classList.remove('on');
    cur=h; h.classList.add('on');
    writeOn(DATA[k]||DATA.head);
  }
  hots.forEach(function(h){ h.addEventListener('click',function(e){ e.stopPropagation(); toggle(h); }); });

  /* 题签 = 第四个锚点,点了弹出一张实拍照片 */
  function showPop(){ mask.classList.add('on'); pop.classList.add('on'); }
  function hidePop(){ mask.classList.remove('on'); pop.classList.remove('on'); }
  title.addEventListener('click',function(e){ e.stopPropagation(); showPop(); });
  x.addEventListener('click',function(e){ e.stopPropagation(); hidePop(); });
  mask.addEventListener('click',hidePop);

  empty();
})();
