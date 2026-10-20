/* engine.js —— 外层甲板：13 个页面各占一个独立 iframe，垂直滑行翻页
 *
 * 为什么用 iframe：每一页都是独立文档，页面自己的 CSS / JS / 动画 / 交互
 * 在自己的视口里原样运行，position:fixed、100vh、canvas 粒子全部与单独打开
 * 原模块时完全一致，不存在样式污染与选择器改造。
 *
 * 位移用 transform 驱动（不用原生滚动）：
 * 页面内的触摸手势经 bridge.js 转发上来后，直接换算成 translateY，
 * 不会和浏览器原生滚动互相抢位置。
 */
(function () {
  var PAGES = window.__CL_PAGES || [];
  var N = PAGES.length;
  var stage = document.getElementById('stage');
  var deck = document.getElementById('deck');
  var dots = document.getElementById('dots');

  var frames = [], H = 0, cur = 0, pos = 0, hot = false, wheelTimer = 0, animId = 0;
  /* 设计稿尺寸：所有页面按 390x844 设计，iframe 内坐标系恒定，
     父层用等比 scale 适配任意屏幕 —— 布局/动画/交互坐标完全不受影响 */
  var DW = 390, DH = 844, SCALE = 1;
  /* 输入仲裁：
     - supressUntil：页面自身脚本已发出 next（如封面"开始探索"），
       此后短时间内忽略 bridge 转发的同类滚轮/按键，避免双触发翻两页；
     - lastWheel：桌面滚轮逐页翻，250ms 锁定，避免一次滚动连翻多页。 */
  var supressUntil = 0, lastWheel = 0;

  // ---------- 构建 ----------
  PAGES.forEach(function (p, i) {
    var slot = document.createElement('div');
    slot.className = 'slot';
    var f = document.createElement('iframe');
    f.setAttribute('scrolling', 'no');
    f.setAttribute('frameborder', '0');
    f.setAttribute('allow', 'autoplay; fullscreen');
    f.setAttribute('title', p.title);
    f.dataset.src = p.page;
    slot.appendChild(f);
    deck.appendChild(slot);
    frames.push(f);

    var d = document.createElement('i');
    d.dataset.i = i;
    d.addEventListener('click', function () { go(i, true); });
    dots.appendChild(d);
  });

  function sizeAll() {
    H = window.innerHeight;
    /* 等比适配：页面设计稿 390x844，按视口缩放（0.5~2 倍，不变形、不裁切），
       iframe 内坐标系恒定 → 每页布局/动画/交互原样，只是整体跟随屏幕大小 */
    var w = window.innerWidth, h = H;
    SCALE = Math.max(0.5, Math.min(w / DW, h / DH, 2));
    var slots = deck.querySelectorAll('.slot');
    for (var i = 0; i < slots.length; i++) slots[i].style.height = H + 'px';
    for (var i = 0; i < frames.length; i++) {
      var f = frames[i];
      f.style.width = DW + 'px';
      f.style.height = DH + 'px';
      f.style.position = 'absolute';
      f.style.left = '50%';
      f.style.top = '50%';
      f.style.transform = 'translate(-50%,-50%) scale(' + SCALE + ')';
      f.style.transformOrigin = 'center center';
      f.style.willChange = 'transform';   /* 提前建合成层，翻页/动画更流畅 */
    }
    pos = cur * H;
    apply();
  }
  window.addEventListener('resize', sizeAll);
  window.addEventListener('orientationchange', function () { setTimeout(sizeAll, 260); });

  // ---------- 懒加载窗口：当前 ±2 预加载（翻到前页面已就绪，翻页不卡不闪），
  //    超出 3 页卸载释放内存；可见窗口 ±1，其余隐藏暂停渲染（手机端省 GPU） ----------
  function load(i) {
    var f = frames[i];
    if (!f || f.dataset.loaded) return;
    f.dataset.loaded = '1';
    f.src = f.dataset.src;
  }
  function ensure(i) {
    for (var k = i - 2; k <= i + 2; k++) if (k >= 0 && k < N) load(k);
    for (var k = 0; k < N; k++) {
      if (Math.abs(k - i) > 3 && frames[k].dataset.loaded) {
        delete frames[k].dataset.loaded;
        frames[k].src = 'about:blank';
      }
    }
    /* 可见窗口 ±1（当前页+相邻页）：翻页滑入的目标页始终可见，
       更远的页隐藏暂停渲染 —— 手机端 13 页动画不会同时跑，滑动不卡 */
    for (var k = 0; k < N; k++) {
      var v = (Math.abs(k - i) <= 1) ? 'visible' : 'hidden';
      if (frames[k].style.visibility !== v) frames[k].style.visibility = v;
    }
  }

  // ---------- 位移 ----------
  function apply() {
    deck.style.transform = 'translate3d(0,' + (-pos) + 'px,0)';
    var i = Math.max(0, Math.min(N - 1, Math.round(pos / H)));
    if (i !== cur) { cur = i; ensure(i); update(); }
  }

  function animateTo(target, dur) {
    cancelAnimationFrame(animId);
    var from = pos, t0 = performance.now();
    if (Math.abs(target - from) < 0.5) { pos = target; apply(); return; }
    function loop(t) {
      var k = Math.min(1, (t - t0) / dur);
      // easeOutQuint：快起慢停，衔接更柔和，不会有硬收尾
      var e = 1 - Math.pow(1 - k, 5);
      pos = from + (target - from) * e;
      apply();
      if (k < 1) animId = requestAnimationFrame(loop);
      else { pos = target; apply(); }
    }
    animId = requestAnimationFrame(loop);
  }

  /* 翻页开始时重播目标页入场动画。
     此刻目标页还在视口外（deck 位移未开始），重播导致的透明/位移瞬变
     发生在不可见区域，滑入时看到的只是自然的淡入 —— 有入场动画、不闪屏。 */
  function replay(i) {
    var f = frames[i];
    if (f) {
      try { if (f.style.visibility === 'hidden') f.style.visibility = 'visible'; } catch (e) {}  // 远跳/翻页目标先显示
      if (f.contentWindow) {
        try { f.contentWindow.postMessage({ __cl: 1, t: 'replay' }, '*'); } catch (e) {}
      }
    }
  }

  function go(i, smooth) {
    i = Math.max(0, Math.min(N - 1, i));
    cancelAnimationFrame(animId);
    if (i !== cur) replay(i);        // 目标页换页 → 重播入场（不可见时，无闪）
    load(i);                       // 先确保目标页已开始加载（点阵远跳不留白）
    if (smooth) animateTo(i * H, 520);
    else { pos = i * H; apply(); }
    cur = i; ensure(i); update();
  }
  /* 松手吸附：以「出发页」为基准，位移超过 18% 页高即翻页，
     这样轻轻一甩就能翻，又不会被页面内的短距离拖拽误触。 */
  function snap(from, ratio) {
    var basePage = Math.round(from / H);
    var delta = pos - basePage * H;
    var thr = H * (ratio || 0.18);
    var target = basePage;
    if (delta > thr) target = basePage + Math.max(1, Math.round(delta / H));
    else if (delta < -thr) target = basePage - Math.max(1, Math.round(-delta / H));
    go(target, true);
  }

  function update() {
    var ds = dots.children;
    for (var i = 0; i < ds.length; i++) ds[i].className = (i === cur) ? 'on' : '';
  }

  // ---------- 页面消息（bridge 转发） ----------
  var dragStart = 0, dragY0 = 0;
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (!d || !d.__cl) return;
    if (d.t === 'next') {
      /* 页面脚本自己请求翻页（封面按钮/上滑/滚轮）—— 直接翻，
         并丢弃 bridge 可能转发的同一手势（begin/drag/end），避免双翻页 */
      supressUntil = Date.now() + 600;
      hot = false;
      if (cur >= N - 1) go(0, true); else go(cur + 1, true);
    }
    else if (d.t === 'begin') {
      if (Date.now() < supressUntil) return;   // 刚由页面 next 翻页，忽略本次触摸
      hot = true;
      cancelAnimationFrame(animId);
      dragStart = pos;
      dragY0 = d.y;
    }
    else if (d.t === 'drag') {
      if (!hot) return;
      /* iframe 内坐标是设计稿逻辑值，换算到窗口像素（视觉位移 = Δy * SCALE） */
      var p = dragStart + (dragY0 - d.y) * SCALE;
      // 两端做橡皮筋阻尼
      var max = (N - 1) * H;
      if (p < 0) p = p * 0.35;
      else if (p > max) p = max + (p - max) * 0.35;
      pos = p; apply();
    }
    else if (d.t === 'end') {
      if (hot) { hot = false; snap(dragStart); }
    }
    else if (d.t === 'wheel') {
      if (Date.now() < supressUntil) return;   // 页面 next 刚翻过页，忽略
      if (Math.abs(d.dy) < 8) return;
      if (Date.now() < lastWheel) return;      // 250ms 锁：一次滚动只翻一页
      lastWheel = Date.now() + 250;
      if (d.dy > 0) go(cur + 1, true); else go(cur - 1, true);
    }    else if (d.t === 'key') {
      if (Date.now() < supressUntil) return;
      if (d.k === 'ArrowDown' || d.k === 'PageDown' || d.k === ' ') go(cur + 1, true);
      else if (d.k === 'ArrowUp' || d.k === 'PageUp') go(cur - 1, true);
      else if (d.k === 'Home') go(0, true);
      else if (d.k === 'End') go(N - 1, true);
    }
  });

  // 父层自身键盘（焦点在外层时）
  window.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown') go(cur + 1, true);
    else if (k === 'ArrowUp' || k === 'PageUp') go(cur - 1, true);
    else if (k === 'Home') go(0, true);
    else if (k === 'End') go(N - 1, true);
  });

  // ---------- 启动 ----------
  sizeAll();
  ensure(0);
  update();

  /* 首屏加载动画：p01 页面加载完成后淡出（至少展示 1 秒防闪），5 秒兜底 */
  var bootT0 = Date.now(), bootDone = false;
  function hideBoot() {
    if (bootDone) return; bootDone = true;
    var el = document.getElementById('boot'); if (!el) return;
    var wait = Math.max(0, 1000 - (Date.now() - bootT0));
    setTimeout(function () {
      el.classList.add('hide');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 700);
    }, wait);
  }
  frames[0].addEventListener('load', hideBoot);
  setTimeout(hideBoot, 5000);

  window.__dsh = {
    go: go,
    cur: function () { return cur; },
    pos: function () { return pos; },
    n: N
  };
})();
