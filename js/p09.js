
(function(){
  var page=document.getElementById('page');

  /* ---- 状态机: phase0 初始 -> phase1 弹窗 -> phase2 有龙+雨 ---- */
  page.addEventListener('click',function(){
    if(page.className.indexOf('phase0')>-1) page.className='page phase1';
  });
  document.getElementById('closeBtn').addEventListener('click',function(e){
    e.stopPropagation();
    page.className='page phase2';
    startRain();
  });

  /* ---- 雨效(细小雨丝,无光点) ---- */
  var cv=document.getElementById('rain'),ctx=cv.getContext('2d');
  var W=390,H=844,DPR=Math.min(window.devicePixelRatio||1,2);
  cv.width=W*DPR;cv.height=H*DPR;ctx.scale(DPR,DPR);
  var drops=[],running=false;
  function spawn(n){
    for(var i=0;i<n;i++)drops.push({
      x:Math.random()*W,y:Math.random()*H*0.6,
      v:3.5+Math.random()*3,len:18+Math.random()*16,
      a:0.5+Math.random()*0.2});
  }
  function frame(){
    if(running){
      ctx.clearRect(0,0,W,H);
      ctx.lineCap='round';
      for(var i=drops.length-1;i>=0;i--){
        var d=drops[i];
        d.v=Math.min(d.v+0.024,12.5);      /* 重力加速 */
        d.y+=d.v;d.x-=d.v*0.2;
        /* 细长雨滴: 头实尾虚两段 */
        var slope=d.v*0.2*2.4;
        var hx=d.x, hy=d.y;                 /* 头部(下) */
        var mx=d.x-slope*0.45, my=d.y-d.len*0.5;
        var tx=d.x-slope, ty=d.y-d.len;     /* 尾部(上) */
        ctx.lineWidth=0.95;
        ctx.strokeStyle='rgba(226,236,250,'+d.a.toFixed(3)+')';
        ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(mx,my);ctx.stroke();
        ctx.strokeStyle='rgba(226,236,250,'+(d.a*0.28).toFixed(3)+')';
        ctx.beginPath();ctx.moveTo(mx,my);ctx.lineTo(tx,ty);ctx.stroke();
        if(d.y>H*0.94)drops.splice(i,1);
      }
      if(drops.length<36)spawn(1);
    }
    requestAnimationFrame(frame);
  }
  function startRain(){running=true;spawn(22)}

  /* ---- 知识卡翻页 ---- */
  var pages=[
    {tag:'湖口草龙',body:'国家级非遗，起于隋唐、盛于明清。整条龙以稻草编扎，编、插、嵌十多种工艺，不用一根铁丝。它是鄱阳湖畔的“谷龙”，农人庆丰收、祈风调雨顺的群龙之首。'},
    {tag:'为何蛰伏',body:'秋收之后，田水放干，土地休养。草龙生于稻草、归于田野，只在节庆祭祀时抬出巡游。它静静卧着——不是不出山，是时候未到。'},
    {tag:'雨的时机',body:'草龙管雨。雨不来，巡游祭祀便没有由头，龙不出世；雨至，大地复苏、新耕开始，它才登场。雨，就是龙等的那场时机。'},
    {tag:'一句立意',body:'蛰伏，不是认命——是在等一场属于自己的雨。你已备好，只待时机；雨来，便出师。'}
  ];
  var pi=0, icBody=document.getElementById('icBody'),
      icTag=document.getElementById('icTag'), icPg=document.getElementById('icPg'),
      icPrev=document.getElementById('icPrev'), icNext=document.getElementById('icNext');
  function renderCard(){
    icBody.classList.add('fade');
    setTimeout(function(){
      icTag.textContent=pages[pi].tag;
      icPg.textContent=(pi+1)+' / '+pages.length;
      icBody.innerHTML=pages[pi].body;
      icBody.classList.remove('fade');
      icPrev.classList.toggle('dis',pi===0);
      icNext.classList.toggle('dis',pi===pages.length-1);
    },240);
  }
  icPrev.addEventListener('click',function(){ if(pi>0){pi--;renderCard()} });
  icNext.addEventListener('click',function(){ if(pi<pages.length-1){pi++;renderCard()} });
  renderCard();
  frame();
})();
