(() => {
  'use strict';
  const zh = document.documentElement.lang.startsWith('zh');
  const words = zh ? {
    soundOn:'轻提示音已开启',soundOff:'提示音已关闭',motionOn:'已减少动态效果',motionOff:'动态效果跟随系统设置',
    intro:'第一次来到 Mingle？',introText:'从发现同好到说上第一句话，用四步熟悉这里。',start:'带我看看',close:'关闭',skip:'跳过，我自己探索',next:'下一步',back:'上一步',finish:'开始探索',step:'新手指南',
    steps:[
      ['🪐','先找到一点共同点','点开星球上的头像，看看你们共同喜欢什么。你也可以切换到大照片卡，按兴趣筛选。','去星球看看','/explore'],
      ['🫶','喜欢是一次轻轻的招呼','爱心表示想认识对方，叉号是暂时跳过。蓝色星形用来查看资料；只有双方都喜欢，才能开始聊天。','试试发现卡片','/discover'],
      ['💬','匹配之后，说一句你好','到“消息”选择联系人，发送文字、表情或贴纸。','打开消息','/connections'],
      ['🌱','按自己的节奏相处','在“我”里填写兴趣，决定是否展示资料。聊天菜单提供结束联系、举报和拉黑；左侧也能随时重看指南、开关音效。','完善我的资料','/profile']
    ]
  } : {
    soundOn:'Soft sounds on',soundOff:'Sounds off',motionOn:'Motion reduced',motionOff:'Motion follows your system setting',
    intro:'New to Mingle?',introText:'Find your way from a shared interest to a first hello in four small steps.',start:'Show me around',close:'Close',skip:'Skip, I will explore',next:'Next',back:'Back',finish:'Start exploring',step:'QUICK START',
    steps:[
      ['🪐','Start with something in common','Tap a person on the planet to see your shared interests. Prefer a bigger photo? Switch to Cards and try an interest filter.','Explore the planet','/explore'],
      ['🫶','A like is a little hello','The heart means you would like to meet. The cross skips for now. The blue star opens their profile. Chat begins only after you both like each other.','Try the photo cards','/discover'],
      ['💬','A match starts a conversation','Choose a connection in Messages and send a message, emoji or sticker.','Open messages','/connections'],
      ['🌱','Go at your own pace','Add your interests and control discovery in Me. End contact, block or report from the chat menu. Reopen this guide and control sounds from the sidebar.','Edit my profile','/profile']
    ]
  };
  const read = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const write = (key, value) => { try { localStorage.setItem(key, value); } catch {} };
  const system = matchMedia('(prefers-reduced-motion: reduce)');
  let sound = read('mingle.sound.v1','off') === 'on';
  let manualReduced = read('mingle.motion.v1','system') === 'reduced';
  let context, lastClick = 0;
  const reduced = () => manualReduced || system.matches;
  function sync() {
    document.documentElement.dataset.motion = reduced() ? 'reduced' : 'system';
    document.querySelectorAll('[data-sound-toggle]').forEach(el => el.setAttribute('aria-pressed',String(sound)));
    document.querySelectorAll('[data-motion-toggle]').forEach(el => el.setAttribute('aria-pressed',String(reduced())));
    document.dispatchEvent(new CustomEvent('mingle:motion'));
  }
  let toast, toastTimer;
  function tell(text) {
    if (!toast) { toast=document.createElement('div');toast.className='feedback-toast';toast.setAttribute('role','status');document.body.append(toast); }
    toast.textContent=text;toast.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('visible'),2200);
  }
  async function tone(kind='click') {
    if (!sound) return;
    try {
      const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
      context ||= new Audio();if(context.state==='suspended')await context.resume();if(!sound||context.state!=='running')return;
      const notes=kind==='sent'?[640,820]:kind==='received'?[740,610]:[530];
      notes.forEach((frequency,index)=>{
        const osc=context.createOscillator(),gain=context.createGain(),at=context.currentTime+index*.085;
        osc.type='sine';osc.frequency.setValueAtTime(frequency,at);osc.frequency.exponentialRampToValueAtTime(frequency*.82,at+.10);
        gain.gain.setValueAtTime(0,at);gain.gain.linearRampToValueAtTime(.018,at+.007);gain.gain.exponentialRampToValueAtTime(.0001,at+.13);
        osc.connect(gain);gain.connect(context.destination);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(at);osc.stop(at+.14);
      });
    } catch { /* Optional sound never prevents an action. */ }
  }
  window.MingleFeedback={reduced,tone,tell};
  document.addEventListener('click',event=>{
    const control=event.target.closest('button,a[href],summary');if(!control||control.disabled)return;
    if(control.matches('[data-sound-toggle]')){sound=!sound;write('mingle.sound.v1',sound?'on':'off');sync();tell(sound?words.soundOn:words.soundOff);if(sound)tone();else context?.suspend().catch(()=>{});return;}
    if(control.matches('[data-motion-toggle]')){manualReduced=!manualReduced;write('mingle.motion.v1',manualReduced?'reduced':'system');sync();tell(reduced()?words.motionOn:words.motionOff);return;}
    if(event.isTrusted&&performance.now()-lastClick>90){lastClick=performance.now();tone();}
  });
  system.addEventListener('change',sync);
  window.addEventListener('storage',event=>{if(!event.key||['mingle.sound.v1','mingle.motion.v1'].includes(event.key)){sound=read('mingle.sound.v1','off')==='on';manualReduced=read('mingle.motion.v1','system')==='reduced';sync();if(!sound)context?.suspend().catch(()=>{});}});
  sync();

  // A skip-able, keyboard-friendly introduction, with links to real actions.
  const sidebar=document.querySelector('.sidebar');
  if(!sidebar)return;
  const settings=sidebar.querySelector('.experience-settings'), settingsSlot=document.createComment('experience settings');
  settings.before(settingsSlot);
  const compact=matchMedia('(max-width:899px)');
  const placeSettings=()=>{if(compact.matches)document.body.insertBefore(settings,document.querySelector('main'));else settingsSlot.after(settings);};
  compact.addEventListener('change',placeSettings);placeSettings();
  const owner=sidebar.dataset.guideOwner||'member', key='mingle.guide.v2.'+owner;
  let dialog,step=0,nudge;
  const done=()=>{write(key,'seen');nudge?.remove();};
  function renderStep(){
    const item=words.steps[step];dialog.querySelector('.guide-glyph').textContent=item[0];dialog.querySelector('.guide-step').textContent=`${words.step} · 0${step+1} / 04`;
    dialog.querySelector('h2').textContent=item[1];dialog.querySelector('.guide-description').textContent=item[2];
    const route=dialog.querySelector('.guide-route');route.textContent=item[3]+' ↗';route.href=item[4];
    dialog.querySelector('.guide-back').disabled=step===0;dialog.querySelector('.guide-next').textContent=step===3?words.finish:words.next;
    dialog.querySelectorAll('.guide-progress span').forEach((el,i)=>el.classList.toggle('active',i<=step));
  }
  function openGuide(){
    if(!dialog){
      dialog=document.createElement('dialog');dialog.className='guide-dialog';dialog.setAttribute('aria-labelledby','guide-title');
      dialog.innerHTML='<form method="dialog"><button class="dialog-close" aria-label="'+words.close+'">×</button></form><div class="guide-visual" aria-hidden="true"><span class="guide-glyph"></span></div><div class="guide-content"><p class="guide-step"></p><h2 id="guide-title" aria-live="polite"></h2><p class="guide-description"></p><a class="guide-route"></a><div class="guide-progress" aria-hidden="true"><span></span><span></span><span></span><span></span></div><div class="guide-actions"><button type="button" class="guide-back">'+words.back+'</button><button type="button" class="guide-next"></button></div><button type="button" class="guide-skip">'+words.skip+'</button></div>';
      document.body.append(dialog);
      dialog.querySelector('.guide-back').onclick=()=>{if(step>0){step--;renderStep();}};
      dialog.querySelector('.guide-next').onclick=()=>{if(step<3){step++;renderStep();}else{done();dialog.close();}};
      dialog.querySelector('.guide-skip').onclick=()=>{done();dialog.close();};
      dialog.querySelector('.guide-route').onclick=done;
      dialog.addEventListener('close',()=>{done();document.dispatchEvent(new CustomEvent('mingle:overlay'));});
      dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});
    }
    step=0;renderStep();dialog.showModal();document.dispatchEvent(new CustomEvent('mingle:overlay'));
  }
  document.addEventListener('click',event=>{if(event.target.closest('[data-guide-open]'))openGuide();});
  if(!read(key,'')&&(document.body.classList.contains('discover-page')||document.body.classList.contains('planet-page'))){
    nudge=document.createElement('section');nudge.className='welcome-nudge';nudge.setAttribute('aria-label',words.intro);
    nudge.innerHTML='<span class="nudge-star" aria-hidden="true">✧</span><span><strong>'+words.intro+'</strong><span>'+words.introText+'</span></span><button type="button" data-guide-open>'+words.start+'</button><button type="button" class="nudge-dismiss" aria-label="'+words.close+'">×</button>';
    document.querySelector('.app-main>header')?.after(nudge);nudge.querySelector('.nudge-dismiss').onclick=done;
  }
})();
