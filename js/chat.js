/* chat.js —— 芨芨龙聊天小窗：拖动/吸附/开合/聊天/静音联动 */
(function () {
  if (document.getElementById('chatFab')) return;

  /* ---------- 图标 ---------- */
  var fab = document.createElement('button');
  fab.id = 'chatFab';
  fab.setAttribute('aria-label', '芨芨龙聊天');
  fab.innerHTML = '<img src="img/chat_icon.webp" alt="芨芨龙">';

  /* ---------- 面板 ---------- */
  var panel = document.createElement('div');
  panel.id = 'chatPanel';
  panel.innerHTML =
    '<div id="chatHead">'
    + '<span class="av"><img src="img/chat_icon.webp" alt=""></span>'
    + '<span class="nm"><b>芨芨龙</b><i>湖口草龙 · 守护小灵兽</i></span>'
    + '<button class="hd-btn" id="chatCredit" aria-label="素材来源">源</button>'
    + '<button class="hd-btn" id="chatMute" aria-label="音乐静音">♪</button>'
    + '<button class="hd-btn" id="chatClose" aria-label="收起">×</button>'
    + '</div>'
    + '<div id="chatBody"></div>'
    + '<div class="quick" id="chatQuick"></div>'
    + '<div id="chatInput"><input id="chatText" type="text" placeholder="问芨芨龙点草龙的事…" autocomplete="off">'
    + '<button id="chatSend" aria-label="发送">➤</button></div>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  /* 初始位置：距右缘 120px（不贴边），之后拖动完全自由 */
  (function () {
    var vw = document.documentElement.clientWidth;
    fab.style.left = Math.max(8, vw - 120) + 'px';
    fab.style.top = '42%';
    fab.style.right = 'auto';
  })();

  var body = document.getElementById('chatBody');
  var quicks = document.getElementById('chatQuick');
  var text = document.getElementById('chatText');
  var muteBtn = document.getElementById('chatMute');
  var creditBtn = document.getElementById('chatCredit');
  var closeBtn = document.getElementById('chatClose');
  var sendBtn = document.getElementById('chatSend');

  /* ---------- 拖动（自由停靠，不吸附边缘） ---------- */
  var dragging = false, moved = false, sx = 0, sy = 0, ox = 0, oy = 0;
  fab.style.right = 'auto'; fab.style.top = '46%';

  fab.addEventListener('pointerdown', function (e) {
    e.preventDefault();
    var r = fab.getBoundingClientRect();
    sx = e.clientX; sy = e.clientY;
    ox = r.left; oy = r.top;
    moved = false;
    dragging = true;
    fab.classList.add('dragging');
    fab.style.left = ox + 'px'; fab.style.top = oy + 'px';
    try { fab.setPointerCapture(e.pointerId); } catch (err) {}
  });
  fab.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    var dx = e.clientX - sx, dy = e.clientY - sy;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
    var vw = document.documentElement.clientWidth;
    var vh = document.documentElement.clientHeight;
    var nx = Math.max(2, Math.min(ox + dx, vw - fab.offsetWidth - 2));
    var ny = Math.max(2, Math.min(oy + dy, vh - fab.offsetHeight - 2));
    fab.style.left = nx + 'px'; fab.style.top = ny + 'px';
  });
  fab.addEventListener('pointerup', function () {
    if (!dragging) return;
    dragging = false;
    fab.classList.remove('dragging');
    if (!moved) toggle(true);   // 没拖动=点击，打开面板
  });
  fab.addEventListener('pointercancel', function () {
    dragging = false; fab.classList.remove('dragging');
  });

  /* ---------- 面板开合 ---------- */
  function toggle(open) {
    var willOpen = (open === undefined) ? !panel.classList.contains('open') : open;
    panel.classList.toggle('open', willOpen);
    fab.classList.toggle('mini', willOpen);
    if (willOpen && text) setTimeout(function () { text.focus(); }, 520);
  }
  fab.addEventListener('click', function () {});
  closeBtn.addEventListener('click', function () { toggle(false); });

  /* ---------- 素材来源（复用来源浮层，入口收进聊天浮窗） ---------- */
  creditBtn.addEventListener('click', function () {
    if (window.__clOpenCredits) window.__clOpenCredits();
  });

  /* ---------- 静音联动（复用外层 sndBtn） ---------- */
  muteBtn.addEventListener('click', function () {
    var s = document.getElementById('sndBtn');
    if (s) s.click();
  });
  setInterval(function () {
    var s = document.getElementById('sndBtn');
    if (s) muteBtn.classList.toggle('mute-off', s.classList.contains('off'));
  }, 800);

  /* ---------- 聊天 ---------- */
  function addMsg(kind, html) {
    var m = document.createElement('div');
    m.className = 'msg ' + kind;
    if (kind === 'bot') {
      m.innerHTML = '<span class="mav"><img src="img/chat_icon.webp" alt=""></span><span class="bub"></span>';
      m.querySelector('.bub').innerHTML = html;
    } else {
      m.innerHTML = '<span class="bub"></span>';
      m.querySelector('.bub').innerHTML = html;
    }
    body.appendChild(m);
    body.scrollTop = body.scrollHeight;
    return m;
  }

  var typingEl = null;
  function showTyping() {
    if (typingEl) return;
    typingEl = document.createElement('div');
    typingEl.id = 'typing';
    typingEl.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(typingEl);
    body.scrollTop = body.scrollHeight;
  }
  function hideTyping() {
    if (typingEl) { typingEl.remove(); typingEl = null; }
  }

  function pick(ans) {
    return ans[Math.floor(Math.random() * ans.length)];
  }
  function reply(text2) {
    var t = (text2 || '').trim().toLowerCase();
    var kb = window.__KB || [], best = null, bestScore = 0;
    for (var i = 0; i < kb.length; i++) {
      var keys = kb[i].keys;
      for (var j = 0; j < keys.length; j++) {
        var k = keys[j].toLowerCase(), score = 0;
        if (t === k) score = 100;
        else if (t.indexOf(k) >= 0) score = 55 + Math.min(k.length, 14);
        else if (k.indexOf(t) >= 0 && t.length >= 2) score = 20;
        if (score > bestScore) { bestScore = score; best = kb[i]; }
      }
    }
    if (best) return pick(best.ans);
    var fb = window.__KB_FALLBACK || [];
    return pick(fb);
  }

  function send(text2) {
    var v = (text2 || text.value || '').trim();
    if (!v) return;
    text.value = '';
    addMsg('user', escapeHtml(v));
    showTyping();
    var delay = 620 + Math.random() * 520;
    setTimeout(function () {
      hideTyping();
      var ans = reply(v);
      var isMulti = ans.length > 46;
      addMsg('bot', isMulti ? ans.replace(/\n/g, '<br>') : ans);
      if (quicks.children.length === 0) showQuick();
    }, delay);
  }
  function escapeHtml(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  sendBtn.addEventListener('click', function () { send(); });
  text.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') send();
  });

  /* ---------- 快捷问题 ---------- */
  var QUICK = ['草龙是什么', '草龙是怎么编的', '端午为什么要舞龙'];
  function showQuick() {
    QUICK.forEach(function (q) {
      var b = document.createElement('button');
      b.textContent = q;
      b.addEventListener('click', function () {
        text.value = q; send(q);
        this.remove();
      });
      quicks.appendChild(b);
    });
  }

  /* ---------- 欢迎 ---------- */
  setTimeout(function () {
    addMsg('bot', '你好呀，我是<b>芨芨龙</b>！<br>关于湖口草龙——它的历史、十三道工序、端午民俗、非遗传承，你都可以问我。先从下面挑一个试试？');
    showQuick();
  }, 900);
})();
