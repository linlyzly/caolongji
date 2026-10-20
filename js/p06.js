
(function(){
  var sec=document.getElementById('p7');
  function enter(){ if(sec){ sec.classList.remove('enter'); void sec.offsetWidth; sec.classList.add('enter'); } }
  setTimeout(enter,120);
  var tiles=[].slice.call(document.querySelectorAll('#p7 .p7-tile'));
  var done=document.getElementById('p7Done');
  var n=0, lock=false;
  tiles.forEach(function(t){
    t.addEventListener('click',function(e){
      e.preventDefault();
      if(lock||t.classList.contains('on')) return;
      t.classList.add('on'); n++;
      if(n===1){ var tp=document.getElementById('p7Tap'); if(tp) tp.classList.add('gone'); }
      if(n>=tiles.length){
        lock=true;
        var fan=document.getElementById('p7Fan');
        setTimeout(function(){ if(fan) fan.classList.add('done'); }, 380);   /* 等最后一格翻完 */
        setTimeout(function(){ done.classList.add('on'); }, 1180);           /* 化完之后再出字 */
        setTimeout(function(){                                            /* 停一下,整页翻出 */
          var ep=document.getElementById('p7End'); if(ep) ep.classList.add('in');
          var mk=document.getElementById('p7Mask'); if(mk) mk.classList.add('in');
        }, 2180);
      }
    });
  });
  var backBtn=document.getElementById('p7Back');
  if(backBtn){ backBtn.addEventListener('click',function(e){
    e.stopPropagation();
    var ep=document.getElementById('p7End'); if(ep) ep.classList.remove('in');
  }); }
  function closeEnd(){
    var ep=document.getElementById('p7End'), mk=document.getElementById('p7Mask');
    if(ep) ep.classList.remove('in');
    if(mk) mk.classList.remove('in');
  }
  var xBtn=document.getElementById('p7X'), mk=document.getElementById('p7Mask');
  if(xBtn) xBtn.addEventListener('click',function(e){ e.stopPropagation(); closeEnd(); });
  if(mk) mk.addEventListener('click',closeEnd);
})();
