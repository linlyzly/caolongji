/* bridge.js —— 页面手势转发（注入每一页 iframe，在页面脚本【之后】加载）
 *
 * 设计原则：不改动页面任何原有逻辑，只做"转发"。
 * 本文件在页面脚本之后加载，因此能读到 e.defaultPrevented ——
 * 页面自己在控件上吃掉的手势（擦除/拖拽/拼板）不会被误判成翻页。
 *
 * 手势用 Pointer Events 统一处理（触摸 + 鼠标拖动都支持）：
 *   pointerdown  记录起点，进入 probe
 *   pointermove  位移 >10px 判定为翻页（hot），后续位移原样转发
 *   pointerup    抬手，父层做吸附
 * 排除区域：canvas（点睛擦除等绘制交互）、按钮/链接（点击不误判）。
 *
 * 协议（→ 父层）：
 *   {t:'begin', y:N}          开始跟手滑动（绝对Y，父层用起点换算）
 *   {t:'drag', y:N}           手指位移（绝对Y）
 *   {t:'end'}                 抬手，父层做吸附
 *   {t:'wheel', dy:N}         滚轮
 *   {t:'key', k:'...'}        方向键/空格
 *   {t:'next'}                页面请求"去下一页"（封面按钮等）
 *   {t:'ready'}               页面加载完成
 */
(function () {
  var P = window.parent;
  if (P === window) return;                       // 单独打开时静默

  /* 手机端关键：触摸手势全部归本桥接处理。
     禁止 iframe 内原生滚动/缩放抢占触摸（否则浏览器会拦截手势导致滑不动）。 */
  try {
    var r = document.documentElement;
    r.style.touchAction = 'none';
    if (document.body) document.body.style.touchAction = 'none';
  } catch (e) {}

  function post(o) { o.__cl = 1; try { P.postMessage(o, '*'); } catch (e) {} }

  // 封面等页面脚本会检查 window.__dshGoNext —— 由 bridge 提供，翻到下一页
  window.__dshGoNext = function () { post({ t: 'next' }); };

  /* ============================================================
     交互音效 —— 把每一页的动作翻译成声音，交给父层统一播放
     ------------------------------------------------------------
     为什么不在页内播：13 个 iframe 各存一份音频，翻页会断、会叠、会失步。
     统一由外层甲板（js/audio.js）出声，页内只发一个轻量消息 {t:'sfx',k}。

     规则按页面编号写：动作 → 音色。没写到的按钮统一 'tap'。
     规则格式：[选择器, 音色, 只响一次?]
     ============================================================ */
  var PKEY = (function () {
    var m = location.pathname.match(/p(\d{2})\.html/);
    return m ? m[1] : '';
  })();

  var RULES = {
    '01': [['#startBtn', 'gong']],
    '02': [['.pgbtn', 'flip']],
    '03': [['#nbtn', 'turn']],
    '04': [['.p4-hot', 'pick']],
    '05': [['#p6Sickle', 'chop']],
    '06': [['.p7-tile', 'pick']],
    '07': [['#p8Begin', 'pick'], ['#p8Plq', 'stamp']],
    '08': [['#brush', 'ink']],
    '09': [['#icPrev,#icNext', 'turn'], ['#page', 'water']],
    '10': [['#p11Anchor', 'open'], ['#p11next', 'turn']],
    '11': [['#btn', 'pick'], ['#page', 'fire', 1]],
    '12': [['#btn', 'pick'], ['.tab', 'bell']]
    // 弹窗的开关不写在这里 —— 见下面的"弹窗自动配音"（避免同一动作响两声）
    // '13' 页有自己的 AudioMgr，统一转发到外层，不重复配
  };

  /* 拖动类交互：手指划过时按节流连续出声，像真的在割、在编、在擦 */
  var DRAG = {
    '05': { sel: '#p6Sickle', k: 'chop', gap: 110 },
    '07': { sel: '#p8Grab,#p8Board', k: 'bamboo', gap: 120 },
    '08': { sel: '#brush', k: 'ink', gap: 80 }
  };

  var firedOnce = {}, drag = null, dragT = 0;

  function sfx(k) { if (k) post({ t: 'sfx', k: k }); }

  function ruleFor(target) {
    if (!target || !target.closest) return null;
    var list = RULES[PKEY] || [];
    for (var i = 0; i < list.length; i++) {
      var el = target.closest(list[i][0]);
      if (el) return { k: list[i][1], once: !!list[i][2] };
    }
    // 兜底：普通按钮/链接一律给一声轻木
    if (PKEY !== '13' && target.closest('button,a,[role="button"],label')) return { k: 'tap' };
    return null;
  }

  /* ============================================================
     弹窗自动配音（游戏演示的弹窗）
     ------------------------------------------------------------
     各页弹窗的写法不统一（on / in / open / show），逐个写规则既容易漏、
     又容易和点击音重复。所以改成"监听状态"：
       一出现 → 弹窗开（modal）；一消失 → 弹窗关（modal_off）；
       出现的是"达成/完成"类 → 达成音（reward），比开窗更亮。
     同一帧里 mask + pop 一起变，只发一声；点击音会等 70ms，
     若期间弹窗响了就自动撤销 —— 保证一次动作只有一个声音。
     ============================================================ */
  var POP_SEL = [
    '[id*="Pop"]', '[id*="pop"]', '[id*="Mask"]', '[id*="mask"]',
    '[class*="pop"]', '[class*="mask"]', '[id*="Succ"]', '[class*="succ"]',
    '[id*="End"]', '[class*="modal"]'
  ].join(',');
  var REWARD_SEL = '#p8Succ,#p7End,[class*="succ"]';
  var REVEAL_SEL = '.pop-done';
  var SHOW = /(?:^|\s)(?:on|in|open|show|visible|active)(?:\s|$)/;

  function shown(el) {
    var c = (el.getAttribute && el.getAttribute('class')) || '';
    if (SHOW.test(' ' + c + ' ')) return true;
    var st = el.style;
    if (st && (st.display === 'block' || st.display === 'flex')) return true;
    return false;
  }
  function isReward(el) { return !!(el.matches && el.matches(REWARD_SEL)); }
  function isReveal(el) { return !!(el.matches && el.matches(REVEAL_SEL)); }

  var popQ = [], popTimer = 0, lastPopAt = 0;

  function flushPop() {
    popTimer = 0;
    var q = popQ; popQ = [];
    var opened = null, closed = false;
    for (var i = 0; i < q.length; i++) {
      if (q[i].on) { if (!opened || isReward(q[i].el) || isReveal(q[i].el)) opened = q[i].el; }
      else closed = true;
    }
    var now = Date.now();
    if (now - lastPopAt < 120) return;             // 同一帧的 mask+pop 只发一声
    if (opened) {
      lastPopAt = now;
      clearTimeout(fbTimer);                        // 撤销这次点击的兜底轻木
      sfx(isReveal(opened) ? 'reveal' : (isReward(opened) ? 'reward' : 'modal'));
    } else if (closed) {
      lastPopAt = now;
      clearTimeout(fbTimer);
      sfx('modal_off');
    }
  }

  function queuePop(el, s) {
    popQ.push({ el: el, on: s });
    clearTimeout(fbTimer);                          // 这一下是弹窗动作，撤销点击的兜底音
    if (!popTimer) popTimer = setTimeout(flushPop, 60);
  }

  var mo = (typeof MutationObserver !== 'undefined') ? new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var el = list[i].target, s = shown(el);
      if (s === !!el.__clPopOn) continue;
      el.__clPopOn = s;
      queuePop(el, s);
    }
  }) : null;

  function bindPops() {
    if (!mo) return;
    var els = document.querySelectorAll(POP_SEL);
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.__clBound) continue;
      el.__clBound = 1;
      el.__clPopOn = shown(el);                    // 记录初始状态：进页不误响
      mo.observe(el, { attributes: true, attributeFilter: ['class', 'style'] });
    }
  }
  bindPops();
  window.addEventListener('load', bindPops);
  setTimeout(bindPops, 700);
  setTimeout(bindPops, 1800);

  /* 兜底点击音延后 70ms：如果这一下其实是在开/关弹窗，
     弹窗音会在 60ms 时先响，这里就被撤销了 —— 一次动作只留一个声音。 */
  var fbTimer = 0;
  function tapLater(k) {
    clearTimeout(fbTimer);
    fbTimer = setTimeout(function () { sfx(k); }, 70);
  }

  window.addEventListener('pointerdown', function (e) {
    var r = ruleFor(e.target);
    if (r) {
      if (r.once && firedOnce[r.k]) { /* 已响过 */ }
      else {
        if (r.once) firedOnce[r.k] = 1;
        if (r.k === 'tap') tapLater('tap'); else sfx(r.k);
      }
    }
    var d = DRAG[PKEY];
    if (d && e.target.closest && e.target.closest(d.sel)) {
      drag = d; dragT = Date.now();
    }
  }, true);

  window.addEventListener('pointermove', function (e) {
    if (!drag) return;
    if (!e.buttons && !(e.touches && e.touches.length) && e.pointerType === 'mouse') return;
    var now = Date.now();
    if (now - dragT < drag.gap) return;
    dragT = now;
    sfx(drag.k);
  }, { passive: true });

  function endDrag() { drag = null; }
  window.addEventListener('pointerup', endDrag);
  window.addEventListener('pointercancel', endDrag);
  window.addEventListener('touchend', endDrag, { passive: true });


  var mode = 'idle', y0 = 0, pId = 0;

  function isInteractive(t) {
    if (!t || !t.closest) return false;
    return !!t.closest('canvas,button,a,input,textarea,select,label,[contenteditable],.dots,.nav');
  }

  window.addEventListener('pointerdown', function (e) {
    if (e.defaultPrevented) { mode = 'idle'; return; }   // 页面自己要用这个手势
    if (isInteractive(e.target)) { mode = 'idle'; return; }  // 控件上的点击不翻页
    y0 = e.clientY;
    pId = e.pointerId;
    mode = 'probe';
  });

  window.addEventListener('pointermove', function (e) {
    if (e.pointerId !== pId) return;
    if (e.defaultPrevented) {                       // 页面中途接管（擦除等）
      if (mode === 'hot') post({ t: 'end' });
      mode = 'idle';
      return;
    }
    var y = e.clientY;
    if (mode === 'probe') {
      if (Math.abs(y - y0) > 10) {                  // 越过阈值 → 判定为翻页
        mode = 'hot';
        post({ t: 'begin', y: y0 });                // 带上起点，父层用绝对位置换算
        post({ t: 'drag', y: y });
      }
    } else if (mode === 'hot') {
      post({ t: 'drag', y: y });
    }
  });

  function finish(e) {
    if (e && e.pointerId !== undefined && e.pointerId !== pId) return;
    if (mode === 'hot') {
      mode = 'idle';
      /* 延迟一帧再发 end：触摸时 pointerup 先于页面自身脚本的 touchend 派发，
         若页面自己会发 next（封面），必须先让它翻页（next 清掉 hot 后 end 自然失效），
         避免 end 先 snap 翻一页、next 再翻一页造成双翻。 */
      setTimeout(function () { post({ t: 'end' }); }, 0);
    } else {
      mode = 'idle';
    }
  }
  window.addEventListener('pointerup', finish);
  window.addEventListener('pointercancel', finish);

  // 兜底：某些浏览器不派发 pointerup（如触摸被系统吃掉），用 touch/mouse 收尾
  window.addEventListener('touchend', finish, { passive: true });
  window.addEventListener('mouseup', finish);

  window.addEventListener('wheel', function (e) {
    if (e.defaultPrevented) return;
    post({ t: 'wheel', dy: e.deltaY });
  }, { passive: true });

  window.addEventListener('keydown', function (e) {
    if (e.defaultPrevented) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'Home', 'End'].indexOf(e.key) >= 0) {
      post({ t: 'key', k: e.key });
    }
  });

  window.addEventListener('load', function () { post({ t: 'ready' }); });
  setTimeout(function () { post({ t: 'ready' }); }, 400);

  /* ── 入场动画重播（由父层在【翻页开始时】触发，此时本页还在视口外，
       重播的透明度/位移变化发生在不可见区域 → 滑入时看到的是自然的淡入，
       既保证"每页都有入场动画"，又不会闪屏 ──
       只重播一次性入场动画（infinite 持续动画不动），且只强制一次回流，
       避免动画元素多的大页面重播时阻塞主线程导致翻页卡顿。 */
  function replayEnter() {
    var sec = document.querySelector('.stage > section') || document.querySelector('section');
    if (sec) {
      // ① 有 .enter 类的页面（p04/p05/p06/p07/p10 等）：重加类触发入场
      sec.classList.remove('enter');
      void sec.offsetWidth;
      sec.classList.add('enter');
    }
    // ② 无条件入场的页面（p02/p03 等）：只重设一次性动画元素的 animation
    var all = (document.body || document.documentElement).querySelectorAll('*');
    var changed = [], i, el, cs, a, it;
    for (i = 0; i < all.length; i++) {
      el = all[i];
      if (el.tagName === 'CANVAS') continue;
      try { cs = el.ownerDocument.defaultView.getComputedStyle(el); } catch (e) { continue; }
      if (!cs) continue;
      a = cs.animationName;
      if (!a || a === 'none') continue;
      it = cs.animationIterationCount;
      if (it === 'infinite') continue;          // 持续动画不动（kenburns/呼吸等）
      el.style.animation = 'none';
      changed.push(el);
    }
    if (changed.length) {
      void document.body.offsetWidth;           // 只回流一次
      for (i = 0; i < changed.length; i++) changed[i].style.animation = '';
    }
  }
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (d && d.__cl && d.t === 'replay') replayEnter();
  });
})();
