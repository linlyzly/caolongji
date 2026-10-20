
(function(){
  var p=document.getElementById('pageCover');
  requestAnimationFrame(function(){requestAnimationFrame(function(){p.classList.add('in');});});

  /* 跳转目标。合成成一个文件后,由外层设置 window.__dshGoNext 接管。 */
  var NEXT = '模块02_一根稻草_v4_竖版.html';
  var busy = false;
  function goNext(){
    /* 合成环境：外层接管翻页，可反复点击（翻回来还能再点） */
    if (typeof window.__dshGoNext === 'function') { window.__dshGoNext(); return; }
    /* 单独打开：跳转页面后本页销毁，busy 防重复跳转 */
    if (busy) return; busy = true;
    location.href = NEXT;
  }
  window.__dshGoNext = window.__dshGoNext || null;

  /* ① 点击「开始探索」 */
  var btn = document.getElementById('startBtn');
  btn.addEventListener('click', function(e){ e.preventDefault(); goNext(); });

  /* ② 上滑手势(阈值 42px,太灵敏会误触) */
  var sy = null;
  window.addEventListener('touchstart', function(e){
    sy = e.touches && e.touches[0] ? e.touches[0].clientY : null;
  }, {passive:true});
  window.addEventListener('touchend', function(e){
    if (sy === null) return;
    var ty = e.changedTouches && e.changedTouches[0] ? e.changedTouches[0].clientY : sy;
    var dy = sy - ty; sy = null;
    if (dy > 42) goNext();
  }, {passive:true});

  /* ③ 桌面端滚轮(带锁,避免一次滚动触发多次) */
  window.addEventListener('wheel', function(e){
    if (e.deltaY > 12) goNext();
  }, {passive:true});

  /* ④ 键盘(演示用) */
  window.addEventListener('keydown', function(e){
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') goNext();
  });
})();
