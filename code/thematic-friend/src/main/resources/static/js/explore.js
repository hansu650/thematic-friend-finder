(() => {
  'use strict';
  const cosmos=document.querySelector('[data-cosmos]');if(!cosmos)return;
  const positions=[[49,21],[77,28],[84,59],[64,76],[39,74],[23,51],[49,48],[23,24],[78,81],[65,45],[41,91],[18,79]];
  const nodes=[...cosmos.querySelectorAll('.person-star')],map=cosmos.querySelector('.star-map');
  const canvas=cosmos.querySelector('canvas'),context=canvas.getContext('2d');
  const pause=cosmos.querySelector('[data-orbit-pause]'),zh=document.documentElement.lang.startsWith('zh');
  let frame=0,pointerFrame=0,last=0,paused=false,visible=true,overlay=false,hovered=-1;
  let width=0,height=0,dpr=1,motionTime=0,meteor=null,nextMeteor=3200;
  let pointer={x:0,y:0},points=[],accent='181,184,230';
  const reduced=()=>window.MingleFeedback?.reduced()||matchMedia('(prefers-reduced-motion:reduce)').matches;
  const active=()=>context&&!document.hidden&&visible&&!reduced()&&!paused&&!overlay;
  const stars=Array.from({length:100},(_,index)=>({x:Math.random(),y:Math.random(),r:Math.random()*1.05+.25,phase:Math.random()*6.28,speed:Math.random()*.6+.3,depth:index%3+1}));
  const edges=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[6,0],[6,3],[7,5],[8,3],[9,1],[10,4],[11,5]];

  function resize(){
    width=cosmos.clientWidth;height=cosmos.clientHeight;dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    points=nodes.map((node,index)=>({x:map.offsetLeft+map.clientWidth*positions[index%positions.length][0]/100,y:map.offsetTop+map.clientHeight*positions[index%positions.length][1]/100-14}));
    draw();
  }
  function draw(){
    if(!context||!width)return;
    context.setTransform(dpr,0,0,dpr,0,0);context.clearRect(0,0,width,height);
    for(const star of stars){
      const alpha=(reduced()||paused) ? .30 : .16+(Math.sin(motionTime*.0004*star.speed+star.phase)+1)*.16;
      context.fillStyle='rgba('+accent+','+alpha+')';context.beginPath();
      context.arc(star.x*width+pointer.x*star.depth*1.5,star.y*height+pointer.y*star.depth*1.5,star.r,0,Math.PI*2);context.fill();
    }
    for(const [from,to] of edges){
      if(!points[from]||!points[to])continue;
      const selected=from===hovered||to===hovered;
      context.strokeStyle='rgba('+accent+','+(selected ? .21 : .045)+')';context.lineWidth=selected ? .8 : .5;
      context.beginPath();context.moveTo(points[from].x,points[from].y);context.lineTo(points[to].x,points[to].y);context.stroke();
    }
    if(active()&&motionTime>=nextMeteor&&!meteor){
      meteor={at:motionTime,x:width*(.35+Math.random()*.55),y:height*.06,length:Math.min(width*.14,110)};
      nextMeteor=motionTime+8500+Math.random()*6500;
    }
    if(meteor&&!reduced()&&!paused){
      const progress=(motionTime-meteor.at)/1200;
      if(progress>=1){meteor=null;return;}
      const x=meteor.x-width*.32*progress,y=meteor.y+height*.42*progress;
      const fade=Math.sin(Math.PI*progress)*.65;
      const gradient=context.createLinearGradient(x+meteor.length,y-meteor.length*.58,x,y);
      gradient.addColorStop(0,'rgba('+accent+',0)');gradient.addColorStop(1,'rgba('+accent+','+fade+')');
      context.strokeStyle=gradient;context.lineWidth=1.3;context.beginPath();context.moveTo(x+meteor.length,y-meteor.length*.58);context.lineTo(x,y);context.stroke();
      context.fillStyle='rgba(236,230,255,'+fade+')';context.beginPath();context.arc(x,y,1.3,0,Math.PI*2);context.fill();
    }
  }
  function tick(time){
    if(!active()){frame=0;return;}
    if(time-last>35){motionTime+=Math.min(time-last,60);last=time;draw();}
    frame=requestAnimationFrame(tick);
  }
  function update(){
    cancelAnimationFrame(frame);frame=0;last=performance.now();
    overlay=Boolean(document.querySelector('dialog[open]'));
    cosmos.classList.toggle('is-paused',!active());
    cosmos.dataset.motionState=active()?'running':'paused';
    pause.disabled=reduced();pause.setAttribute('aria-pressed',String(paused||reduced()));
    pause.textContent=reduced()?(zh?'动态已减少':'Motion reduced'):paused?(zh?'继续动态':'Resume motion'):(zh?'暂停动态':'Pause motion');
    if(reduced()){pointer={x:0,y:0};map.style.setProperty('--map-rx','0deg');map.style.setProperty('--map-ry','0deg');}
    draw();if(active())frame=requestAnimationFrame(tick);
  }
  nodes.forEach((node,index)=>{
    const [x,y]=positions[index%positions.length];node.style.setProperty('--sx',x+'%');node.style.setProperty('--sy',y+'%');
    node.style.setProperty('--duration',(5+index*.57)+'s');node.style.setProperty('--delay',(-index*.79)+'s');
    node.addEventListener('click',()=>{document.getElementById(node.dataset.starTarget)?.showModal();update();});
    for(const type of ['pointerenter','focus'])node.addEventListener(type,()=>{hovered=index;if(!active())draw();});
    for(const type of ['pointerleave','blur'])node.addEventListener(type,()=>{hovered=-1;if(!active())draw();});
  });
  document.querySelectorAll('.star-profile').forEach(dialog=>{
    dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
    dialog.addEventListener('close',update);
    dialog.querySelector('.star-like-form')?.addEventListener('submit',event=>{const button=event.currentTarget.querySelector('button');if(button.disabled)event.preventDefault();else button.disabled=true;});
  });
  pause.onclick=()=>{paused=!paused;update();};
  cosmos.addEventListener('pointermove',event=>{
    if(!active()||event.pointerType==='touch')return;
    cancelAnimationFrame(pointerFrame);
    pointerFrame=requestAnimationFrame(()=>{
      const b=cosmos.getBoundingClientRect();pointer={x:(event.clientX-b.left-b.width/2)/b.width,y:(event.clientY-b.top-b.height/2)/b.height};
      map.style.setProperty('--map-rx',(-pointer.y*3)+'deg');map.style.setProperty('--map-ry',(pointer.x*4)+'deg');
    });
  });
  cosmos.addEventListener('pointerleave',()=>{cancelAnimationFrame(pointerFrame);pointer={x:0,y:0};map.style.setProperty('--map-rx','0deg');map.style.setProperty('--map-ry','0deg');});
  document.querySelectorAll('.destination').forEach(tile=>{
    let pending=0;
    tile.addEventListener('pointermove',event=>{
      if(reduced()||event.pointerType==='touch')return;cancelAnimationFrame(pending);
      pending=requestAnimationFrame(()=>{const box=tile.getBoundingClientRect(),x=(event.clientX-box.left)/box.width,y=(event.clientY-box.top)/box.height;tile.style.setProperty('--shine-x',x*100+'%');tile.style.setProperty('--shine-y',y*100+'%');tile.style.setProperty('--tilt-x',(0.5-y)*3+'deg');tile.style.setProperty('--tilt-y',(x-.5)*3+'deg');});
    });
    tile.addEventListener('pointerleave',()=>{cancelAnimationFrame(pending);tile.style.setProperty('--tilt-x','0deg');tile.style.setProperty('--tilt-y','0deg');});
  });
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;update();});observer.observe(cosmos);
  new ResizeObserver(resize).observe(cosmos);
  document.addEventListener('visibilitychange',update);
  document.addEventListener('mingle:motion',update);
  document.addEventListener('mingle:overlay',update);
  document.addEventListener('mingle:theme',()=>{accent=getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim()||accent;draw();});
  window.addEventListener('resize',resize);
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);cancelAnimationFrame(pointerFrame);});
  window.addEventListener('pageshow',update);
  accent=getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim()||accent;
  resize();update();
})();
