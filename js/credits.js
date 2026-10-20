/* ═══ 素材来源浮层（赛事要求：素材需注明来源）═══
   外壳层组件，所有页面共用。右下角一枚小「源」印，点开浮层。
   数据在 CREDITS_DATA 里维护，改来源只改这一处。 */
(function () {
  'use strict';

  var DATA = [
    { g: '原创插画（AI 生成）', ic: '✒', items: [
      ['p01_01 / p01_02', 'AI 生成插画 · 卷轴题签与「开始探索」印钮'],
      ['p03_03 / p04_05 / p04_06 / p05_08', 'AI 生成插画 · 童子编龙 / 卷轴 / 山水'],
      ['p05_09 ~ p05_11', 'AI 生成插画 · 麦田 / 镰刀 / 麦秆'],
      ['p06_12 ~ p06_14', 'AI 生成插画 · 草编鳞片 / 工坊'],
      ['p07_15 ~ p07_21 及弹窗底纹', 'AI 生成插画 · 龙首线稿 / 竹纹纸'],
      ['p08_22 ~ p08_26', 'AI 生成插画 · 龙首 / 毛笔'],
      ['p09_27 / p09_28 / p10_29 / p10_30', 'AI 生成插画 · 田野 / 夜巡 / 撞花灯'],
      ['p11_31 ~ p11_33', 'AI 生成插画 · 送龙上天三联'],
      ['p12_34 / p13_36', 'AI 生成插画 · 展厅 / 田野'],
      ['chat_icon / stamp 印章', 'AI 生成 + 原创排版 · 对话头像 / 湖口草龙印章']
    ]},
    { g: '实拍照片', ic: '▣', items: [
      ['p03_04', '实景照片 · 源自中国网（china.com.cn）图库', '网络图片'],
      ['p04_07', '巡游草龙（龙头 / 龙身 / 龙尾）实拍 · 图片来源于网络平台', '抖音 / 小红书'],
      ['p07_18', '展馆草龙实拍 · 图片来源于网络平台', '抖音 / 小红书'],
      ['p12_35', '馆藏草龙实拍 · 图片来源于网络平台', '抖音 / 小红书']
    ]},
    { g: '视频素材', ic: '▶', items: [
      ['cl_dragon.mp4（展厅宣传片）', '视频素材 · 来源于网络平台，版权归原作者所有，仅供赛事演示', '哔哩哔哩']
    ]},
    { g: '音频（全部原创合成，零采样）', ic: '♪', items: [
      ['13 首逐页配乐', 'Python 数值合成原创配乐 · 见 audio/page'],
      ['23 个交互音效 + 低音垫', '同上 · 工具链 tools/']
    ]},
    { g: '非遗内容参考', ic: '册', items: [
      ['湖口草龙', '国家级非物质文化遗产（编号 Ⅶ-54）'],
      ['工艺叙事', '参考湖口草龙扎制技艺公开资料整理']
    ]}
  ];

  var css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = 'css/credit.css?v=2026102045';
  document.head.appendChild(css);

  var ov, panel;

  function openPanel() {
    if (ov) { ov.classList.add('on'); return; }
    ov = document.createElement('div');
    ov.id = 'srcOverlay';
    panel = document.createElement('div');
    panel.id = 'srcPanel';
    var h = '<div class="src-head"><span class="t">素材来源</span><i id="srcX">✕</i></div>'
          + '<div class="src-body">'
          + '<p class="src-lead">本作为大学生绿色会展创新创意挑战赛参赛作品。'
          + '插画部分由 AI 生成并经人工筛选排版，实拍照片来源逐张列明如下；'
          + '音频与交互音效均为 Python 数值合成原创，未使用任何采样素材。</p>';
    DATA.forEach(function (sec) {
      h += '<div class="src-card"><div class="src-card-head">'
         + '<span class="src-ic">' + sec.ic + '</span>'
         + '<span class="src-t">' + sec.g + '</span>'
         + '<span class="src-n">' + sec.items.length + ' 项</span></div><ul>';
      sec.items.forEach(function (it) {
        var tag = it.length > 2 ? '<span class="src-tag">' + it[2] + '</span>' : '';
        h += '<li><b>' + it[0] + '</b><span>' + it[1] + '</span>' + tag + '</li>';
      });
      h += '</ul></div>';
    });
    h += '</div><div class="src-foot">图片版权归原作者所有 · 仅用于赛事演示 · 不得商用</div>';
    panel.innerHTML = h;
    ov.appendChild(panel);
    document.body.appendChild(ov);
    requestAnimationFrame(function () { ov.classList.add('on'); });
    ov.addEventListener('click', function (e) {
      if (e.target === ov || e.target.id === 'srcX') ov.classList.remove('on');
    });
  }

  /* 入口收进芨芨龙聊天浮窗（chat.js 调用），不再单独占用右下角画面 */
  window.__clOpenCredits = function () { openPanel(); };
})();
