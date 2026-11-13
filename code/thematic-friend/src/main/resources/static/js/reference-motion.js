(() => {
 'use strict';
 const system=matchMedia('(prefers-reduced-motion:reduce)');
 const reduced=()=>{if(window.MingleFeedback)return window.MingleFeedback.reduced();try{return system.matches||localStorage.getItem('mingle.motion.v1')==='reduced';}catch{return system.matches;}};
 const running=new Set(),ease='cubic-bezier(.2,.75,.2,1)';let nativeArrival=false;
 const navigationStyle=document.createElement('style');document.head.append(navigationStyle);
 function preference(){
  navigationStyle.textContent=reduced()?'@view-transition{navigation:none}':'@view-transition{navigation:auto}';
  if(reduced())for(const effect of running)effect.cancel();
 }
 preference();system.addEventListener('change',preference);
 new MutationObserver(preference).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 function animate(node,frames,options={}){
  if(!node||reduced()||!node.animate)return;
  const effect=node.animate(frames,{duration:420,easing:ease,fill:'backwards',...options});
  running.add(effect);effect.finished.catch(()=>{}).finally(()=>running.delete(effect));return effect;
 }
 function cancelPhotoEntrance(){for(const effect of running)if(effect.effect?.target?.classList.contains('tilted-photo'))effect.cancel();}
 function handlePromises(transition){transition.ready.catch(()=>{});transition.finished.catch(()=>{});transition.updateCallbackDone.catch(()=>{});}

 // Register before the first paint: pagereveal can precede DOMContentLoaded.
 window.addEventListener('pageswap',event=>{
  const transition=event.viewTransition;if(!transition)return;handlePromises(transition);
  if(reduced()||document.querySelector('#swipe-card.exiting')){transition.skipTransition();return;}
  const destination=event.activation?.entry?.url;
  const card=[...document.querySelectorAll('.event-card,.people-card')].find(item=>item.href===destination);if(!card)return;
  const person=card.classList.contains('people-card'),name=person?'person-photo':'event-photo';
  const target=card.querySelector(person?'.card-cover':'.card-cover img');if(!target)return;
  const current=document.querySelector(person?'#swipe-card':'.event-page .detail-aside .tilted-photo>img');
  if(current){current.dataset.travelPhoto='restore';current.style.viewTransitionName='none';}
  target.dataset.travelPhoto=name;target.style.viewTransitionName=name;
  transition.finished.catch(()=>{}).finally(()=>{target.style.viewTransitionName='';if(current)current.style.viewTransitionName='';});
 });
 window.addEventListener('pagereveal',event=>{
  const transition=event.viewTransition;if(!transition)return;handlePromises(transition);
  if(reduced()){transition.skipTransition();return;}
  nativeArrival=true;cancelPhotoEntrance();
 });
 window.addEventListener('pageshow',event=>{if(event.persisted)document.querySelectorAll('[data-travel-photo]').forEach(node=>{node.style.viewTransitionName='';delete node.dataset.travelPhoto;});});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)for(const effect of running)effect.finish();});
 function init(){
  const dock=document.querySelector('.action-dock');
  if(dock){
   const reserve=()=>document.documentElement.style.setProperty('--action-space',Math.ceil(dock.getBoundingClientRect().height)+64+'px');
   new ResizeObserver(reserve).observe(dock);reserve();
  }
  const reveal=new IntersectionObserver(entries=>{
   let order=0;for(const entry of entries){if(!entry.isIntersecting)continue;
    animate(entry.target,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],{delay:Math.min(order++,3)*55});reveal.unobserve(entry.target);
   }
  },{threshold:.08});
  document.querySelectorAll('.event-card,.people-card').forEach(card=>reveal.observe(card));
  animate(document.querySelector('.page-heading,.detail-copy>h1'),[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:360});
  if(!nativeArrival)animate(document.querySelector('.detail-aside .tilted-photo'),[{opacity:0,transform:'perspective(1000px) rotateY(-5deg) translateY(14px) scale(.975)'},{opacity:1,transform:'perspective(1000px) rotateY(0deg) translateY(0) scale(1)'}],{duration:520});
  animate(document.querySelector('.detail-aside .event-info'),[{opacity:0,translate:'0 12px'},{opacity:1,translate:'0 0'}],{duration:400,delay:90});
  animate(dock,[{opacity:0},{opacity:1}],{duration:280,delay:130});
  document.querySelector('#swipe-card')?.addEventListener('pointerdown',cancelPhotoEntrance,{passive:true});
  document.addEventListener('click',event=>{if(event.isTrusted&&event.target.closest('.button,.icon-button,.topic-pill'))window.MingleFeedback?.tone('tap');});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
