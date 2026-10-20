
(function(){
  var btn=document.getElementById('btn');
  var vpop=document.getElementById('vpop'), vclose=document.getElementById('vclose');
  var loader=document.getElementById('loader'), tv=document.getElementById('tv');
  var artcard=document.getElementById('artcard');
  var tabs=document.querySelectorAll('.tab'), blocks=document.querySelectorAll('.block');
  var vOpened=false;
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(x){x.classList.remove('on')});
      t.classList.add('on');
      var k=t.getAttribute('data-t');
      blocks.forEach(function(b){
        if(b.getAttribute('data-b')===k) b.classList.add('on');
        else b.classList.remove('on');
      });
    });
  });
  function openV(){
    if(vOpened) return;
    vOpened=true;
    vpop.classList.add('on');
    loader.classList.remove('hide');
    /* 视频播放期间：打断所有音频（postMessage 通知外层；iframe 内直调 parent 在 file:// 下可能跨源受限，全部 try 保护，绝不影响视频主流程） */
    try { window.parent.postMessage({t:'video', on:true}, '*'); } catch(e){}
    try { if (window.parent && window.parent.__clAudio && window.parent.__clAudio.pauseAll) window.parent.__clAudio.pauseAll(); } catch(e){}
    /* 无视频源时兜底 */
    if(!tv.getAttribute('src')){
      document.querySelector('.loader .t2').textContent='视频即将上线 · 敬请期待';
      loader.classList.add('hide');
      return;
    }
    var started=false;
    function hideLoader(){
      if(started) return; started=true;
      loader.classList.add('hide');
    }
    /* 手势内先请求播放（有声音也能过自动播放策略）：视频加载好后自动开始 */
    var p=tv.play(); if(p&&p.catch) p.catch(function(){ hideLoader(); });
    if(tv.readyState>=3){ hideLoader(); return; }
    tv.addEventListener('canplay',hideLoader,{once:true});
    tv.addEventListener('canplaythrough',hideLoader,{once:true});
    /* 加载失败提示（5MB 视频慢网时给出反馈，避免一直转圈） */
    tv.addEventListener('error',function(){
      var t2=document.querySelector('.loader .t2'); if(t2) t2.textContent='视频加载失败 · 请检查网络后重试';
      hideLoader();
    },{once:true});
    /* 兜底：最多转圈 15 秒（preload=none 后点击才下载 5MB，慢网需要更久） */
    setTimeout(hideLoader,15000);
  }
  function closeV(){
    vpop.classList.remove('on'); vOpened=false;
    if(tv.getAttribute('src')) tv.pause();
    /* 关闭弹窗：恢复背景音乐 */
    try { window.parent.postMessage({t:'video', on:false}, '*'); } catch(e){}
    try { if (window.parent && window.parent.__clAudio && window.parent.__clAudio.resumeAll) window.parent.__clAudio.resumeAll(); } catch(e){}
  }
  btn.addEventListener('click',openV);
  artcard.addEventListener('click',openV);
  vclose.addEventListener('click',closeV);
  vpop.addEventListener('click',function(e){ if(e.target===vpop) closeV(); });
})();
