/* audio.js —— 单背景音乐版（2026-10-20 按用户要求精简）
 *
 * 全项目只播一首背景音乐《水墨成长·冉冉升起版》（audio/page/bed_drone.mp3，循环）。
 * 逐页配乐（p01~p13）与全部互动音效（sfx）已按用户要求全部删除。
 */
(function () {
  var CFG = {
    dir: 'audio/page/',
    bedVol: 0.25            // 背景音乐音量（可闻且克制）
  };

  var on = false, muted = false;
  try { muted = localStorage.getItem('cl_mute') === '1'; } catch (e) {}

  // ---------- 背景音源（循环） ----------
  function mk(loop) {
    var a = new Audio();
    a.preload = 'auto';
    a.volume = 0;
    a._e = 0;
    a.loop = !!loop;
    a.setAttribute('playsinline', '');
    return a;
  }
  var bed = mk(true);
  bed.src = CFG.dir + 'bed_drone.mp3';

  // ---------- 音量引擎 ----------
  function clamp01(v) { return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function ease(k) { return k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; }
  function tween(a, mode, to, ms, done) {
    a._tw = { mode: mode, from: a._e || 0, to: to, t0: performance.now(), ms: ms, done: done };
  }
  function stepEnv(a, now) {
    var tw = a._tw;
    if (!tw) return;
    var k = tw.ms > 0 ? Math.min(1, (now - tw.t0) / tw.ms) : 1;
    if (tw.mode === 'in') a._e = tw.to * Math.sin(k * Math.PI / 2);
    else if (tw.mode === 'out') a._e = tw.from * Math.cos(k * Math.PI / 2);
    else a._e = tw.from + (tw.to - tw.from) * ease(k);
    if (k >= 1) { a._e = (tw.mode === 'out') ? 0 : tw.to; a._tw = null; if (tw.done) tw.done(); }
  }
  function pump() {
    requestAnimationFrame(pump);
    stepEnv(bed, performance.now());
    bed.volume = clamp01(bed._e * CFG.bedVol);
  }
  requestAnimationFrame(pump);

  // ---------- 声音钮（视觉已移除，静音走聊天浮窗 ♪） ----------
  var btn = document.createElement('button');
  btn.id = 'sndBtn';
  btn.setAttribute('aria-label', '声音开关');
  btn.innerHTML = '<i class="bar b1"></i><i class="bar b2"></i><i class="bar b3"></i>'
                + '<span class="lab">声音</span><i class="slash"></i>';
  document.body.appendChild(btn);
  btn.style.display = 'none';

  function paint() {
    btn.classList.toggle('off', muted || !on);
    btn.classList.toggle('playing', on && !muted);
    btn.classList.toggle('nudge', !on && !muted);
  }

  // ---------- 开声 / 静音 ----------
  function start() {
    if (on && !muted) return;
    muted = false;
    try { localStorage.setItem('cl_mute', '0'); } catch (e) {}
    on = true;
    bed._e = 0;
    var bp = bed.play();
    if (bp && bp.catch) bp.catch(function () {});
    tween(bed, 'lin', 1, 900);
    paint();
  }

  function silence() {
    muted = true;
    try { localStorage.setItem('cl_mute', '1'); } catch (e) {}
    tween(bed, 'lin', 0, 450, function () { try { bed.pause(); } catch (e) {} });
    paint();
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (!on || muted) start();
    else silence();
  });

  function steal() { if (!on && !muted) start(); }
  window.addEventListener('pointerdown', steal, { once: true });
  window.addEventListener('keydown', steal, { once: true });
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d) return;
    if (d.t === 'video') { if (d.on) pauseAll(); else resumeAll(); return; }  // 视频弹窗：打断/恢复背景（消息不带 __cl，需提前处理）
    if (!d.__cl) return;
    if (d.__cl === 'p13save') { try { localStorage.setItem('caolongji_v7_backup', JSON.stringify(d.v)); } catch (x) {} return; }
    if (d.__cl === 'p13ask') { try {
      var b = localStorage.getItem('caolongji_v7_backup');
      if (b && e.source) e.source.postMessage({ __cl: 'p13restore', v: JSON.parse(b) }, '*');
    } catch (x) {} return; }
    if (d.t === 'next' || d.t === 'begin') steal();
  });

  // ---------- 后台静音，回来续播 ----------
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      try { bed.pause(); } catch (e) {}
    } else if (on && !muted) {
      bed.play().catch(function () {});
    }
  });

  paint();
  if (!muted) setTimeout(function () { if (!on) btn.classList.add('nudge'); }, 1600);

  // ---------- 视频播放期间的全局暂停/恢复（供 p12 弹窗调用） ----------
  function pauseAll() {
    try { bed.pause(); } catch (e) {}
  }
  function resumeAll() {
    if (!on || muted) return;
    try { var bp = bed.play(); if (bp && bp.catch) bp.catch(function () {}); } catch (e) {}
  }
  window.__clAudio = { pauseAll: pauseAll, resumeAll: resumeAll };
})();
