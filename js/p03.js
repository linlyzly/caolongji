
(function(){
  var pgs=[document.getElementById('pg1'),document.getElementById('pg2'),document.getElementById('pg3')];
  var dots=document.querySelectorAll('.dot');
  var cur=0;
  document.getElementById('nbtn').addEventListener('click',function(){
    pgs[cur].classList.remove('act');
    cur=(cur+1)%pgs.length;
    pgs[cur].classList.add('act');
    dots.forEach(function(d,i){d.classList.toggle('on',i===cur);});
  });
})();
