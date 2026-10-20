
(function(){
  var f=document.getElementById('page2').querySelector('.frame');
  if(!f)return;
  var b=f.querySelector('.pgbtn'),t=b.querySelector('.btn-txt');
  b.addEventListener('click',function(){
    f.classList.toggle('flipped');
    t.textContent=f.classList.contains('flipped')?'‹ 上页':'下页 ›';
  });
})();
