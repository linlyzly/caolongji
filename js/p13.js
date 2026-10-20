
const KEY = 'caolongji_single_v7';
let notes = [];
let curChapter = 0;
let lastMyText = '';
let lastAdvice = '';

const CHAPTERS = [
  { seal:'草', stage:'起 · 来处', main:'田里的一把草',
    body:'每个普通人的来处，都从一把最寻常的秸秆开始。手艺还没出现，故事还没名字——草，只是草。' },
  { seal:'雨', stage:'衬 · 守候', main:'平凡的日日夜夜',
    body:'在等待里蓄着力。雨没来，日子照过，编龙的手在草里一遍遍摩挲，把平凡编进年轮。' },
  { seal:'鳞', stage:'转 · 生长', main:'手艺无声地生长',
    body:'一编一编，鳞片落成。看不见的功夫，在指节间一寸寸长出来，像龙在草里翻身。' },
  { seal:'龙', stage:'成 · 成全', main:'一节一节亮起来',
    body:'草，终于成了器。龙醒在展厅的灯下，每一节秸秆，都记得自己曾是田里的草。' },
  { seal:'田', stage:'合 · 归去', main:'器成之日回田里',
    body:'把根还给土地。龙完成使命，回到稻浪深处，等下一场雨，等下一双手。' },
  { seal:'手', stage:'开 · 续写', main:'这一卷，由你续写',
    body:'你，就是那个后来的人。草不是终点——你写下的每一句，都是龙的新鳞。' }
];

/* ============ 安慰话术知识库（离线 · 14 类 + 情绪兜底 · 面向大众） ============ */
const ADVICE_LIB = [
  { label:'学业·考试', keys:['上岸','专升本','高考','考研','考试','落榜','分数','录取','没过','没考','挂科','复读','考砸','笔试','初试','复试','考编','考公','考证','考级','院校','大学','专业','毕业','学位','论文','绩点','奖学金','报志愿','调剂','没考上','没录取'],
    items:[
      '榜上无名，不代表脚下无路。你为这场考试熬过的每个夜，都算数。',
      '没上岸，不代表没游远。这场雨没落在这里，是留给下一段河道的。',
      '一场考试定义不了一生。你把名字写进草里，来年的龙会替你游过去。',
      '上岸不是唯一的答案。你坚持过、认真过，这本身就是成绩。'
    ]},
  { label:'失恋·情感', keys:['分手','失恋','对象','喜欢','爱','告白','被拒','前任','感情','吵架','离婚','复合','不爱了','男朋友','女朋友','心动','暗恋','表白','感情破裂','放下'],
    items:[
      '先变成光，才能和日后相见的那个人互相照亮。这一段没编成的节，拆开是为了重新来过。',
      '一星陨落，黯淡不了星空灿烂。你还有一整片稻田的黄昏可以等。',
      '有些人来去像风过稻田。他没有停，不代表你不好，只是你们的风向不同。',
      '把难过留给昨天，把自己留给明天。你值得被好好珍惜。'
    ]},
  { label:'工作·求职', keys:['工作','辞职','失业','被裁','裁员','面试','工资','加班','老板','同事','上班','简历','升职','转正','offer','职场','公司','项目','绩效','年终奖','找工作','没找到','上班累','打工人'],
    items:[
      '工作暂时的挫折会过去。你织了那么久的龙鳞，不会因为一场浪就散。',
      '这一程没被选中，不代表你不行。稻子总要先弯腰，才能等到风。',
      '暂时的停留，是为了更稳地奔赴远方。你不是没走，你是在蓄力。',
      '打工是为了生活，不是生活的全部。你的价值，从来不止工牌上那行字。'
    ]},
  { label:'迷茫·方向', keys:['迷茫','不知道','未来','方向','没用','废物','没意思','想放弃','坚持不住','该怎么办','怎么办','活着的意义','人生','没目标','摆烂','emo了','很emo'],
    items:[
      '迷茫不是迷路，是龙还没醒，正在草里找方向。你不用急着知道答案。',
      '看不清路的时候，先把手里这一节草编好。路会自己在脚底下长出来。',
      '人生是旷野，不是单行道。这一条走不通，换一条，风景照样亮。',
      '暂时不知道要去哪也没关系，你已经在路上，就比原地踏步强。'
    ]},
  { label:'经济·压力', keys:['钱','负债','穷','还不起','工资少','月光','信用卡','花呗','网贷','学费','房贷','车贷','欠','养不起','压力大','负担'],
    items:[
      '钱是攥出来的，日子是一垅一垅犁出来的。慢慢来，田不会辜负犁地的人。',
      '苦日子是一时的。你把根扎深，来年自有收成。',
      '你不是穷，你是正在攒一场大雨。等雨落下来，整片田都会记得你。'
    ]},
  { label:'家庭·关系', keys:['父母','爸妈','家里','家人','亲戚','家庭','不理解','偏心','重男轻女','骂我','管我','控制','打压','否定我','我妈','我爸','原生家庭'],
    items:[
      '家人的话再重，也重不过你自己长出的鳞。你早就不是那个只能听的孩子了。',
      '他们不理解，是因为没见过你编龙的样子。你不需要他们懂，你需要自己看得起自己。',
      '有些田给不了你要的雨水，可你已经学会自己找水了。',
      '你已经从那个家里长出来了。往后你的日子，你自己说了算。'
    ]},
  { label:'人际·朋友', keys:['朋友','同学','室友','被孤立','误会','闹掰','绝交','背叛','背后','排挤','合不来','被冷落','小人','塑料'],
    items:[
      '有些人只是你这条河的一段支流。合流又分开，都是常事。',
      '真正的朋友会在你落雨的时候递伞，而不是只在晴天才出现。',
      '稻穗越沉越低头，人也一样。看清了人，就看清了路。',
      '把你当朋友的人，不会让你一个人淋雨。其他的，不必放在心上。'
    ]},
  { label:'健康·身体', keys:['生病','病','痛','住院','失眠','睡不着','累垮','体检','吃药','手术','发炎','复发','耳鸣','头疼','难受','身体','熬坏'],
    items:[
      '身体是田，歇一歇不是荒废，是让土回气。你先照顾好自己，龙才有力气长。',
      '痛是真的，累也是真的。允许自己慢下来，这不是软弱。',
      '好好吃饭，好好睡觉，比什么都重要。你好了，世界才好。'
    ]},
  { label:'催婚·年龄', keys:['催婚','催','年纪','年龄','30岁','三十','结婚','相亲','单身','还没对象','老大不小'],
    items:[
      '结婚不是人生进度条，你的田，按你的节气来种。',
      '合适的人像合适的雨，急不来。你先把自己这株稻养好。',
      '别人交卷早，不代表你的卷子就晚了。你的春天，按你的日历算。'
    ]},
  { label:'宠物·失去', keys:['我的猫','我的狗','宠物','猫走','狗走','喵','汪','毛孩子','它走了','宠物去世'],
    items:[
      '它只是换了一个地方，继续陪着你。你记得它，它就没离开。',
      '它来你这儿一趟，是因为知道你会好好爱它。它把爱留下了。'
    ]},
  { label:'等待·期盼', keys:['等','雨','来年','盼','待','明年','以后','期望','会来','早晚','总有一天'],
    items:[
      '雨会来的。你已经把这一年编成了鳞，来年自有来年的雨。',
      '等待不是空白，是龙在草里翻身。你等的，正在路上。',
      '好东西都值得等。等来的雨，浇出来的都是好苗。'
    ]},
  { label:'疲惫·坚持', keys:['累','苦','难','坚持','撑','扛','熬','好久','辛苦','扛不住','撑不住','崩溃','心累'],
    items:[
      '辛苦了。那些没人看见的日日夜夜，龙鳞都替你记着。',
      '不用急着成龙。今天能把自己编好，就已经很了不起了。',
      '你走到这里，已经很不容易了。剩下的路，一节一节来。',
      '先歇一会儿。草也要喘口气，才有力气长高。'
    ]},
  { label:'离别·思念', keys:['回','家','走','离开','想念','想家','远方','故乡','稻浪','田','离乡','漂泊','北漂','在外'],
    items:[
      '根还留在田里，多远都不算走丢。想家了，就看看稻浪的方向。',
      '离别只是这一段的路。你长鳞的地方，永远有一块田认得你。',
      '你在外面好好生活，就是对家最好的回答。'
    ]},
  { label:'希望·成长', keys:['龙','鳞','长','成','希望','未来','新','开始','变','努力','变好','加油','进步','越来越好'],
    items:[
      '你写下的每一句，都是龙的新鳞。长着长着，就成龙了。',
      '过去是一把草，现在在长鳞，将来就是龙。急什么？',
      '你已经在变的路上。龙就是那么一节一节，把自己亮起来的。',
      '慢慢来，比较快。你走过的路，都会变成翅膀。'
    ]}
];
const MOOD_FALLBACK = [
  { keys:['难过','伤心','委屈','想哭','哭','泪','心酸','不开心'],
    items:['想哭就哭出来。雨落在草上，也是草在喝水。哭过之后，你还会继续长。'] },
  { keys:['生气','愤怒','气死','烦','恼火','不爽','气'],
    items:['生气是正常的。你还能在生气的时候把自己编好，已经很了不起了。'] },
  { keys:['焦虑','紧张','慌','担心','害怕','不安','睡不着'],
    items:['焦虑是你太想把事情做好了。深呼吸，一节一节来，龙就是这么编成的。'] },
  { keys:['失望','绝望','灰心','无助','没劲','低','丧'],
    items:['失望是因为你认真过。认真过的人，都有资格等到下一场雨。'] }
];
const ADVICE_DEFAULT = [
  '草成器，器归田。你写的这一句，已经让龙多长了一片鳞。',
  '这句话我收下了。你不是在等雨，你是在长鳞。',
  '你把心事落成了跋，龙就替你记住了。慢慢来，都会好的。'
];
function matchAdvice(text){
  if(!text) return ADVICE_DEFAULT[0];
  let best = null, bestScore = 0;
  for(const cat of ADVICE_LIB){
    let s = 0;
    for(const k of cat.keys){
      if(text.indexOf(k) > -1) s += k.length;
    }
    if(s > bestScore){ bestScore = s; best = cat; }
  }
  if(best){
    const items = best.items;
    return items[Math.floor(Math.random()*items.length)];
  }
  let moodBest = null, moodScore = 0;
  for(const cat of MOOD_FALLBACK){
    let s = 0;
    for(const k of cat.keys){
      if(text.indexOf(k) > -1) s += k.length;
    }
    if(s > moodScore){ moodScore = s; moodBest = cat; }
  }
  if(moodBest){
    return moodBest.items[Math.floor(Math.random()*moodBest.items.length)];
  }
  return ADVICE_DEFAULT[Math.floor(Math.random()*ADVICE_DEFAULT.length)];
}

/* ============ 声音 ============
   统一交给外层甲板的音效总线（js/audio.js）播放：
   全站只有一个声音出口，音色一致、能一起被静音键关掉。
   单独打开本页时静默，不会报错。 */
const AudioMgr = {
  _out(k){
    try{
      if(window.parent && window.parent !== window){
        window.parent.postMessage({__cl:1, t:'sfx', k:k}, '*');
      }
    }catch(e){}
  },
  init(){}, ensure(){},
  thud(){ this._out('stamp'); },
  seal(){ this._out('stamp'); },
  bell(){ this._out('bell'); },
  drop(){ this._out('water'); },
  startAmb(){}          /* 环境底噪由外层 bed_drone 统一提供，页内不再叠 */
};

/* ============ 开场序列 ============ */
function runIntroSequence(){
  const intro = document.getElementById('introScreen');
  const main = document.getElementById('mainPage');
  const seal = document.getElementById('mainSeal');
  const title = document.getElementById('titleBlock');
  const quote = document.getElementById('rightQuote');
  const bottom = document.getElementById('bottomArea');
  const card = document.getElementById('infoCard');

  setTimeout(()=>{ AudioMgr.thud(); }, 300);
  setTimeout(()=>{ AudioMgr.startAmb(); }, 700);
  setTimeout(()=>{ intro.classList.add('hide'); main.classList.add('show'); }, 1350);
  setTimeout(()=>{ seal.classList.add('stamp-in'); AudioMgr.seal(); }, 1600);
  setTimeout(()=>{ title.classList.add('fade-in'); }, 1950);
  setTimeout(()=>{ quote.classList.add('fade-in'); }, 2450);
  setTimeout(()=>{ bottom.classList.add('fade-in'); }, 2650);
}

/* ============ 中央信息板：默认收起，点锚点弹出，可手动收回 ============ */
function openCard(){
  const card = document.getElementById('infoCard');
  card.classList.remove('open');
  void card.offsetWidth;
  card.classList.add('open');
  AudioMgr._out('open');
}
function closeCard(){
  const card = document.getElementById('infoCard');
  card.classList.remove('open');
  AudioMgr._out('close');
}

/* ============ 六章切换 ============ */
function renderChapter(i){
  curChapter = i;
  const c = CHAPTERS[i];
  /* 印章已替换为固定「口旋湖草」篆印，章节字不再写入印章元素 */
  // document.getElementById('chSeal').textContent = c.seal;
  document.getElementById('chStage').textContent = c.stage;
  document.getElementById('chMain').textContent = c.main;
  document.getElementById('chBody').innerHTML = c.body + '<span class="dot">· · ·</span>';
  document.querySelectorAll('.anchor-btn').forEach((b,idx)=>{
    b.classList.toggle('active', idx===i);
  });
}
function initChapters(){
  const row = document.getElementById('anchorRow');
  const card = document.getElementById('infoCard');
  document.getElementById('cardClose').addEventListener('click',()=>{
    closeCard();
  });
  CHAPTERS.forEach((c,idx)=>{
    const b = document.createElement('button');
    b.className = 'anchor-btn' + (idx===0?' active':'');
    b.textContent = c.seal;
    b.addEventListener('click',()=>{
      if(idx===curChapter && card.classList.contains('open')){
        closeCard();
        return;
      }
      renderChapter(idx);
      openCard();
    });
    row.appendChild(b);
  });
  renderChapter(0);
}

/* ============ 题跋存取 ============ */
function load(){
  try{
    const s = localStorage.getItem(KEY);
    if(s){
      notes = JSON.parse(s);
      document.getElementById('emptyTip').style.display = 'none';
      notes.forEach(t=>addChip(t,false));
    }else{
      /* 本页没有记录：向父页面要备份（双保险） */
      try{ window.parent.postMessage({__cl:'p13ask'}, '*'); }catch(e){}
    }
  }catch(e){ notes = []; }
}
function save(){
  try{ localStorage.setItem(KEY, JSON.stringify(notes)); }catch(e){}
  /* 同步备份到父页面，防止 iframe 存储丢失 */
  try{ window.parent.postMessage({__cl:'p13save', v:notes}, '*'); }catch(e){}
}
/* 父页面回传备份 */
window.addEventListener('message', function(e){
  const d = e.data;
  if(!d || d.__cl !== 'p13restore' || !d.v || !d.v.length) return;
  if(notes && notes.length) return;
  notes = d.v.slice();
  save();
  document.getElementById('emptyTip').style.display = 'none';
  notes.forEach(t=>addChip(t,false));
});
function addChip(text, animate=true){
  const strip = document.getElementById('notesStrip');
  const tip = document.getElementById('emptyTip');
  if(tip) tip.style.display = 'none';
  const c = document.createElement('div');
  c.className = 'note-chip';
  c.textContent = text;
  const del = document.createElement('button');
  del.className = 'note-del';
  del.textContent = '×';
  del.addEventListener('click',(e)=>{
    e.stopPropagation();
    deleteNote(text, c);
  });
  c.appendChild(del);
  strip.appendChild(c);
  strip.scrollLeft = strip.scrollWidth;
  if(animate) setTimeout(()=>c.classList.add('fallen'),50);
  else c.classList.add('fallen');
}
function deleteNote(text, chipEl){
  const idx = notes.indexOf(text);
  if(idx > -1) notes.splice(idx, 1);
  save();
  chipEl.style.opacity = '0';
  chipEl.style.transform = 'translateY(10px)';
  setTimeout(()=>{
    chipEl.remove();
    if(notes.length === 0){
      document.getElementById('emptyTip').style.display = 'block';
    }
  }, 300);
}

/* 龙鳞金光 */
function spawnScales(){
  const stage = document.getElementById('stage');
  for(let i=0;i<18;i++){
    const s = document.createElement('div');
    s.className = 'scale-particle';
    s.style.left = (Math.random()*80 + 10) + '%';
    s.style.top = (Math.random()*40 + 25) + '%';
    const dx = (Math.random()*200 - 100) + 'px';
    const dy = (Math.random()*220 - 140) + 'px';
    const rot = (Math.random()*360 - 180) + 'deg';
    s.style.setProperty('--dx', dx);
    s.style.setProperty('--dy', dy);
    s.style.setProperty('--rot', rot);
    s.style.animationDelay = (Math.random()*0.3) + 's';
    stage.appendChild(s);
    setTimeout(()=>s.remove(), 1900);
  }
}

/* 水滴 */
function spawnRainDrops(){
  const count = 8;
  for(let i=0;i<count;i++){
    setTimeout(()=>{
      const drop = document.createElement('div');
      drop.className = 'rain-drop';
      drop.style.left = (Math.random()*80 + 10) + 'vw';
      drop.style.animationDuration = (1.5 + Math.random()) + 's';
      document.body.appendChild(drop);
      AudioMgr.drop();
      setTimeout(()=>drop.remove(), 2500);
    }, i * 130);
  }
}

/* 光点 / 萤火 */
function genSparks(){
  const bg = document.getElementById('bgScene');
  for(let i=0;i<36;i++){
    const s = document.createElement('div');
    s.className = 'grain-spark';
    s.style.left = Math.random()*100+'%';
    s.style.top = (8+Math.random()*86)+'%';
    s.style.animationDelay = Math.random()*4+'s';
    s.style.animationDuration = (2+Math.random()*3)+'s';
    bg.appendChild(s);
  }
}
function genFireflies(){
  const bg = document.getElementById('bgScene');
  for(let i=0;i<22;i++){
    const f = document.createElement('div');
    f.className = 'firefly';
    f.style.left = Math.random()*100+'%';
    f.style.top = (8+Math.random()*82)+'%';
    f.style.animationDelay = Math.random()*8+'s';
    f.style.animationDuration = (5+Math.random()*6)+'s';
    bg.appendChild(f);
  }
}

/* 点击涟漪 */
function bgClick(){
  const bg = document.getElementById('bgScene');
  bg.addEventListener('click',(e)=>{
    const r = bg.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rp = document.createElement('div');
    rp.className = 'rice-ripple';
    rp.style.left = x+'px'; rp.style.top = y+'px';
    bg.appendChild(rp);
    setTimeout(()=>rp.remove(),1500);
  });
}

/* ============ 书写弹窗 + 话术 + 分享 ============ */
function initCheckin(){
  const btn = document.getElementById('checkinBtn');
  const ov = document.getElementById('checkinOverlay');
  const close = document.getElementById('closeBtn');
  const writePhase = document.getElementById('writePhase');
  const writeOk = document.getElementById('writeOk');
  const input = document.getElementById('writeInput');
  const submit = document.getElementById('writeSubmit');

  btn.addEventListener('click',()=>{
    AudioMgr.ensure();
    writePhase.style.display = 'block';
    writeOk.classList.remove('show');
    input.value = '';
    ov.classList.add('show');
    AudioMgr.drop();
  });
  close.addEventListener('click',()=>ov.classList.remove('show'));
  ov.addEventListener('click',(e)=>{ if(e.target===ov) ov.classList.remove('show'); });

  document.querySelectorAll('.preset-btn').forEach(b=>{
    b.addEventListener('click',()=>{
      input.value = b.getAttribute('data-t');
      AudioMgr.drop();
    });
  });

  submit.addEventListener('click',()=>{
    let t = input.value.trim();
    if(!t){
      input.focus();
      input.style.borderBottomColor = 'var(--vermilion)';
      setTimeout(()=>{ input.style.borderBottomColor = ''; }, 600);
      return;
    }
    notes.push(t);
    save();
    addChip(t,true);
    spawnScales();
    spawnRainDrops();
    AudioMgr.bell();

    lastMyText = t;
    lastAdvice = matchAdvice(t);
    document.getElementById('okMyText').textContent = '「' + t + '」';
    document.getElementById('okAdvice').textContent = lastAdvice;

    writePhase.style.display = 'none';
    writeOk.classList.add('show');
  });
}

/* 分享卡片绘制（升级版 · 字大清晰 · 装裱感） */
function wrapLines(ctx, text, maxWidth){
  const chars = text.split('');
  let line = '', lines = [];
  for(const ch of chars){
    if(ctx.measureText(line + ch).width > maxWidth){
      lines.push(line.trim()); line = ch;
    }else{ line += ch; }
  }
  if(line.trim()) lines.push(line.trim());
  return lines;
}
function drawShareCard(cb){
  const canvas = document.getElementById('shareCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const img = new Image();
  img.onload = function(){
    // 背景铺满 + 强暗化（保证字清晰）
    ctx.drawImage(img, 0, 0, W, H);
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0, 'rgba(10,7,4,.62)');
    g.addColorStop(.30, 'rgba(10,7,4,.34)');
    g.addColorStop(.62, 'rgba(10,7,4,.52)');
    g.addColorStop(1, 'rgba(10,7,4,.84)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);
    // 外框
    ctx.strokeStyle = 'rgba(222,178,92,.95)';
    ctx.lineWidth = 7;
    ctx.strokeRect(15,15,W-30,H-30);
    ctx.strokeStyle = 'rgba(222,178,92,.45)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(30,30,W-60,H-60);
    // 四角回纹
    ctx.strokeStyle = 'rgba(222,178,92,.95)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(15,58); ctx.lineTo(15,15); ctx.lineTo(58,15);          // TL
    ctx.moveTo(W-58,15); ctx.lineTo(W-15,15); ctx.lineTo(W-15,58);    // TR
    ctx.moveTo(W-15,H-58); ctx.lineTo(W-15,H-15); ctx.lineTo(W-58,H-15); // BR
    ctx.moveTo(58,H-15); ctx.lineTo(15,H-15); ctx.lineTo(15,H-58);    // BL
    ctx.stroke();
    // 顶部印章 + 标题
    ctx.save();
    ctx.translate(56, 82);
    ctx.rotate(-0.12);
    ctx.fillStyle = '#C3272B';
    ctx.fillRect(0,0,80,80);
    ctx.strokeStyle = 'rgba(243,229,200,.7)';
    ctx.lineWidth = 3.5;
    ctx.strokeRect(0,0,80,80);
    ctx.fillStyle = '#F6EAD2';
    ctx.font = 'bold 32px "KaiTi","STKaiti","SimSun"';
    ctx.textAlign = 'center';
    ctx.fillText('拾贰跋', 40, 53);
    ctx.restore();
    ctx.textAlign = 'left';
    ctx.fillStyle = '#F5D48B';
    ctx.font = 'bold 38px "KaiTi","STKaiti","SimSun"';
    ctx.fillText('草 龙 记', 168, 80);
    ctx.font = '20px "KaiTi","STKaiti","SimSun"';
    ctx.fillStyle = 'rgba(245,232,200,.95)';
    ctx.fillText('卷尾 · 题跋 · 等雨的人', 168, 116);
    // —— 题跋 ——
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(245,232,200,.8)';
    ctx.font = '18px "KaiTi","STKaiti","SimSun"';
    ctx.fillText('—— 你落下的题跋 ——', 390, 196);
    // 题跋引用条（用绘制字体测量分行）
    ctx.font = 'bold 31px "KaiTi","STKaiti","SimSun"';
    const tLines = wrapLines(ctx, '「' + lastMyText + '」', 600);
    const tH = tLines.length * 50 + 34;
    ctx.fillStyle = 'rgba(14,10,6,.72)';
    ctx.fillRect(68, 222, 644, tH);
    ctx.strokeStyle = 'rgba(222,178,92,.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(68, 222, 644, tH);
    ctx.fillStyle = '#FAF3E2';
    tLines.forEach((l,i)=>ctx.fillText(l, 390, 262 + i*50));
    // —— 话术 ——
    let ty = 222 + tH + 52;
    ctx.fillStyle = 'rgba(222,178,92,.9)';
    ctx.font = '18px "KaiTi","STKaiti","SimSun"';
    ctx.fillText('龙 在 听 · 安 慰 话 术', 390, ty);
    ctx.font = 'bold 27px "KaiTi","STKaiti","SimSun"';
    const aLines = wrapLines(ctx, lastAdvice, 560);
    const aH = aLines.length * 44 + 36;
    ctx.fillStyle = 'rgba(16,11,6,.74)';
    ctx.fillRect(88, ty+16, 604, aH);
    ctx.strokeStyle = 'rgba(222,178,92,.9)';
    ctx.lineWidth = 2;
    ctx.strokeRect(88, ty+16, 604, aH);
    ctx.fillStyle = '#F7EDD6';
    aLines.forEach((l,i)=>ctx.fillText(l, 390, ty+60 + i*44));
    // 落款
    let fy = ty + 16 + aH + 58;
    ctx.fillStyle = 'rgba(222,178,92,.95)';
    ctx.font = 'bold 25px "KaiTi","STKaiti","SimSun"';
    ctx.fillText('草成器，器归田', 390, fy);
    ctx.font = '17px "KaiTi","STKaiti","SimSun"';
    ctx.fillStyle = 'rgba(245,232,200,.75)';
    ctx.fillText('—— 写给每个等雨的普通人', 390, fy + 38);
    // 底部印章
    ctx.save();
    ctx.fillStyle = 'rgba(198,44,44,.92)';
    ctx.font = 'bold 23px "KaiTi","STKaiti","SimSun"';
    ctx.textAlign = 'center';
    ctx.fillText('当下的草 · 来日的龙', 390, H - 74);
    ctx.restore();
    ctx.font = '15px "KaiTi","STKaiti","SimSun"';
    ctx.fillStyle = 'rgba(245,232,200,.6)';
    ctx.fillText('—— 草龙记 · 给每一个正在长鳞的你 ——', 390, H - 44);
    if(cb) cb();
  };
  img.onerror = function(){ if(cb) cb(); };
  img.src = document.getElementById('bgImg').src;
}
function wrapText(ctx, text, x, y, maxWidth, lineHeight){
  const chars = text.split('');
  let line = '';
  let yy = y;
  for(const ch of chars){
    if(ctx.measureText(line + ch).width > maxWidth){
      ctx.fillText(line.trim(), x, yy);
      line = ch; yy += lineHeight;
    }else{
      line += ch;
    }
  }
  if(line.trim()) ctx.fillText(line.trim(), x, yy);
}
function initShare(){
  const ov = document.getElementById('shareOverlay');
  const close = document.getElementById('shareClose');
  const shareBtn = document.getElementById('shareBtn');
  const saveBtn = document.getElementById('shareSave');
  const copyBtn = document.getElementById('shareCopy');
  shareBtn.addEventListener('click',()=>{
    ov.classList.add('show');
    drawShareCard(()=>{});
  });
  close.addEventListener('click',()=>ov.classList.remove('show'));
  ov.addEventListener('click',(e)=>{ if(e.target===ov) ov.classList.remove('show'); });
  saveBtn.addEventListener('click',()=>{
    const canvas = document.getElementById('shareCanvas');
    try{
      const a = document.createElement('a');
      a.download = '草龙记·题跋卡.png';
      a.href = canvas.toDataURL('image/png');
      document.body.appendChild(a);
      a.click();
      a.remove();
    }catch(e){
      alert('保存失败，可截图保存卡片');
    }
  });
  copyBtn.addEventListener('click',()=>{
    const txt = '《草龙记·卷尾题跋》\n' +
      '我落下的题跋：「' + lastMyText + '」\n' +
      '龙在听 · 安慰话术：' + lastAdvice + '\n' +
      '草成器，器归田。\n—— 写给每个等雨的普通人';
    const done = function(){
      copyBtn.textContent = '已复制';
      setTimeout(()=>{ copyBtn.textContent = '复制文案'; }, 1500);
    };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(done).catch(()=>fallbackCopy(txt, done));
    }else{
      fallbackCopy(txt, done);
    }
  });
}
function fallbackCopy(text, done){
  try{
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    done();
  }catch(e){ alert('复制失败，可手动复制'); }
}

/* 启动 */
document.addEventListener('DOMContentLoaded',()=>{
  load();
  genSparks();
  genFireflies();
  bgClick();
  initChapters();
  initCheckin();
  initShare();
  runIntroSequence();
  document.getElementById('mainSeal').addEventListener('click',function(){
    AudioMgr.ensure();
    AudioMgr.seal();
    this.style.transform='scale(.92) rotate(-8deg)';
    setTimeout(()=>{this.style.transform='';},300);
  });
});

window.CaoLongJi = {
  addNote(t){ notes.push(t); save(); addChip(t,true); spawnRainDrops(); }
};
