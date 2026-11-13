(() => {
 'use strict';
 const zh=document.documentElement.lang.startsWith('zh'),system=matchMedia('(prefers-reduced-motion:reduce)');
 const read=(key,fallback)=>{try{return localStorage.getItem(key)||fallback;}catch{return fallback;}};
 const write=(key,value)=>{try{localStorage.setItem(key,value);}catch{}};
 let sound=read('mingle.sound.v1','off')==='on',manual=read('mingle.motion.v1','system')==='reduced',audioContext;
 const reduced=()=>manual||system.matches;
 let toast,timer;
 function tell(message){if(!toast){toast=document.createElement('div');toast.className='feedback-toast';toast.setAttribute('role','status');document.body.append(toast);}toast.textContent=message;toast.classList.add('visible');clearTimeout(timer);timer=setTimeout(()=>toast.classList.remove('visible'),2300);}
 async function tone(kind){if(!sound)return;try{audioContext||=new (window.AudioContext||window.webkitAudioContext)();await audioContext.resume();const oscillator=audioContext.createOscillator(),gain=audioContext.createGain(),at=audioContext.currentTime;oscillator.frequency.value=kind==='received'?620:740;gain.gain.setValueAtTime(.012,at);gain.gain.exponentialRampToValueAtTime(.0001,at+.1);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(at);oscillator.stop(at+.12);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};}catch{}}
 window.MingleFeedback={reduced,tell,tone};
 const video=document.querySelector('[data-hero-video]'),toggle=document.querySelector('[data-video-toggle]');let paused=false,visible=true;
 function updateVideo(){if(!video)return;const play=!paused&&!reduced()&&visible&&!document.hidden;if(play)video.play().catch(()=>{if(toggle)toggle.setAttribute('aria-label',zh?'播放视频':'Play video');});else video.pause();if(toggle){toggle.disabled=reduced();toggle.setAttribute('aria-pressed',String(!play));toggle.setAttribute('aria-label',play?(zh?'暂停视频':'Pause video'):(zh?'播放视频':'Play video'));toggle.querySelector('path').setAttribute('d',play?'M6 4h4v16H6zm8 0h4v16h-4z':'m8 4 12 8-12 8z');}video.dataset.playState=play?'playing':'paused';}
 function sync(){document.documentElement.dataset.motion=reduced()?'reduced':'system';document.querySelectorAll('[data-sound-preference]').forEach(e=>e.checked=sound);document.querySelectorAll('[data-motion-preference]').forEach(e=>e.checked=manual);updateVideo();}
 if(video){toggle.hidden=false;toggle.onclick=()=>{paused=!paused;updateVideo();};new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;updateVideo();},{threshold:.05}).observe(video.closest('section'));document.addEventListener('visibilitychange',updateVideo);}
 system.addEventListener('change',sync);sync();
 document.querySelectorAll('[data-sound-preference]').forEach(input=>input.addEventListener('change',()=>{sound=input.checked;write('mingle.sound.v1',sound?'on':'off');sync();if(sound)tone('sent');}));
 document.querySelectorAll('[data-motion-preference]').forEach(input=>input.addEventListener('change',()=>{manual=input.checked;write('mingle.motion.v1',manual?'reduced':'system');sync();}));
 window.addEventListener('storage',event=>{if(!event.key||['mingle.sound.v1','mingle.motion.v1'].includes(event.key)){sound=read('mingle.sound.v1','off')==='on';manual=read('mingle.motion.v1','system')==='reduced';sync();}});
 const menus=[...document.querySelectorAll('.mobile-nav,.nav-dropdown,.site-account')];
 document.addEventListener('click',event=>menus.forEach(menu=>{if(menu.open&&!menu.contains(event.target))menu.open=false;}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape')menus.forEach(menu=>{if(menu.open){menu.open=false;menu.querySelector('summary')?.focus();}});});
 menus.forEach(menu=>menu.addEventListener('toggle',()=>{if(menu.open)menus.forEach(other=>{if(other!==menu)other.open=false;});}));
 document.querySelectorAll('[data-share-page]').forEach(button=>button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);tell(zh?'链接已复制':'Link copied');}catch{tell(zh?'请复制地址栏中的链接':'Copy the link from your address bar');}}));
 document.querySelectorAll('[data-open-photo]').forEach(button=>button.addEventListener('click',()=>document.getElementById(button.dataset.openPhoto)?.showModal()));
 document.querySelectorAll('dialog').forEach(dialog=>dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)dialog.close();}}));
})();
