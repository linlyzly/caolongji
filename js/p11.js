
(function(){
  'use strict';
  var page=document.getElementById('page');
  var guide=document.getElementById('guide');
  var ambient=document.getElementById('glowambient');
  var glow=document.getElementById('fireglow');
  var ground=document.getElementById('glowground');
  var panel=document.getElementById('panel'), btn=document.getElementById('btn');
  var hint=document.getElementById('scrollHint');
  var bBefore=document.querySelector('.b-before'), bBurning=document.querySelector('.b-burning'),
      bAfter=document.querySelector('.b-after');
  var cv=document.getElementById('fx'), ctx=cv.getContext('2d');
  var W=390, H=844; cv.width=W; cv.height=H;

  var DRAGON={x:W*0.5, y:H*0.70};

  var sparks=[], rises=[], ashes=[];
  var fireOn=false, phase=0, fired=false, done=false;

  function addSparks(from){
    var n=7, i;
    for(i=0;i<n;i++){
      sparks.push({
        x0:from.x+(Math.random()*10-5), y0:from.y+(Math.random()*10-5),
        cp:{x:(from.x+DRAGON.x)/2+(Math.random()*80-40), y:(from.y+DRAGON.y)/2+(Math.random()*60-30)},
        tx:DRAGON.x+(Math.random()*30-15), ty:DRAGON.y+(Math.random()*10-5),
        t:0, sp:0.45+Math.random()*0.4, r:1+Math.random()*0.8, a:0.85
      });
    }
  }
  function sparkPos(s,k){
    var u=1-k;
    return {x:u*u*s.x0+2*u*k*s.cp.x+k*k*s.tx, y:u*u*s.y0+2*u*k*s.cp.y+k*k*s.ty};
  }
  function addRise(){
    var i;
    for(i=0;i<1;i++){
      rises.push({
        x:DRAGON.x+(Math.random()*90-45), y:DRAGON.y-(Math.random()*20),
        vx:(Math.random()*8-4), vy:-0.9-Math.random()*1.0,
        r:0.8+Math.random()*0.9, a:0.65, life:1, dec:0.009+Math.random()*0.005,
        wob:Math.random()*6.28, wobv:0.02+Math.random()*0.04
      });
    }
  }
  function addAsh(){
    var i;
    for(i=0;i<3;i++){
      ashes.push({
        x:Math.random()*W, y:-8-Math.random()*20,
        vx:(Math.random()*10-5), vy:0.35+Math.random()*0.4,
        r:1+Math.random()*2.2, a:0.75, life:1, dec:0.0035,
        wob:Math.random()*6.28, wobv:0.015+Math.random()*0.03
      });
    }
  }

  var raf=null, lastT=0, accRise=0, accAsh=0;
  function loop(t){
    raf=requestAnimationFrame(loop);
    if(!lastT) lastT=t;
    var dt=Math.min(48, t-lastT); lastT=t;
    ctx.clearRect(0,0,W,H);

    var i,s,r,a,p,k;

    for(i=sparks.length-1;i>=0;i--){
      s=sparks[i]; s.t+=dt*s.sp/1000;
      if(s.t>=1){ sparks.splice(i,1); continue; }
      p=sparkPos(s,s.t); k=s.t<0.5?2*s.t:2*(1-s.t);
      ctx.globalAlpha=s.a*k; ctx.fillStyle='#ffb25e';
      ctx.beginPath(); ctx.arc(p.x,p.y,s.r,0,6.28); ctx.fill();
    }

    for(i=rises.length-1;i>=0;i--){
      r=rises[i]; r.wob+=r.wobv; r.x+=r.vx+Math.sin(r.wob)*1.0; r.y+=r.vy; r.life-=r.dec;
      if(r.life<=0||r.y<-30){ rises.splice(i,1); continue; }
      ctx.globalAlpha=r.life*r.a; ctx.fillStyle='#ff9540';
      ctx.beginPath(); ctx.arc(r.x,r.y,r.r,0,6.28); ctx.fill();
    }

    for(i=ashes.length-1;i>=0;i--){
      a=ashes[i]; a.wob+=a.wobv; a.x+=a.vx+Math.sin(a.wob)*0.9; a.y+=a.vy; a.life-=a.dec;
      if(a.life<=0||a.y>H+20){ ashes.splice(i,1); continue; }
      ctx.globalAlpha=a.life*a.a*0.8; ctx.fillStyle='#cfc3a8';
      ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,6.28); ctx.fill();
    }
    ctx.globalAlpha=1;

    if(phase>=1&&fireOn){ accRise+=dt; if(accRise>160){ accRise=0; addRise(); } }
    if(phase>=2){ accAsh+=dt; if(accAsh>200){ accAsh=0; addAsh(); } }
  }
  raf=requestAnimationFrame(loop);

  function fireAt(){
    fired=true;
    guide.classList.add('gone');
    ambient.classList.add('on');
    glow.classList.add('on');
    ground.classList.add('on');
    phase=1; fireOn=true;
    setTimeout(function(){
      bBefore.classList.remove('show'); bBefore.classList.add('out');
      bBurning.classList.add('show');
    }, 2600);
    setTimeout(function(){
      fireOn=false;
      ambient.classList.remove('on');
      glow.classList.remove('on'); glow.classList.add('dim');
      ground.classList.remove('on');
    }, 7200);
    setTimeout(function(){
      bBurning.classList.remove('show'); bBurning.classList.add('out');
      bAfter.classList.add('show');
      phase=2;
      setTimeout(function(){ ashes.length=0; for(var i=0;i<50;i++) addAsh(); }, 400);
    }, 7800);
    setTimeout(function(){ phase=3; panel.classList.add('on'); }, 10100);
  }

  btn.addEventListener('click', function(){
    panel.classList.remove('on');
    hint.classList.add('on');
    done=true;
  });

  page.addEventListener('pointerdown', function(e){
    if(fired||done) return;
    var rect=page.getBoundingClientRect();
    var x=(e.touches&&e.touches[0]?e.touches[0].clientX:e.clientX)-rect.left;
    var y=(e.touches&&e.touches[0]?e.touches[0].clientY:e.clientY)-rect.top;
    x=x/W*390; y=y/H*844;
    addSparks({x:x,y:y});
    setTimeout(fireAt, 1250);
  });
})();
