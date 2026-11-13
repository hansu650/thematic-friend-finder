(() => {
  'use strict';
  const button=document.querySelector('[data-theme-open]');
  if(!button||!window.MingleTheme)return;
  const zh=document.documentElement.lang.startsWith('zh');
  const options=[
    ['auto',zh?'跟随页面':'By destination','conic-gradient(from 30deg,#ebe3f2,#deedf0,#f4e3eb,#f1eadb,#ebe3f2)','#827291'],
    ['violet',zh?'雾紫':'Soft lilac','#eee8f4','#9270b5'],
    ['cyan',zh?'冰蓝':'Ice blue','#e5f0f3','#548d9a'],
    ['rose',zh?'樱粉':'Petal pink','#f8eaf0','#bd7696'],
    ['mint',zh?'薄荷':'Mint leaf','#eaf2e7','#699978'],
    ['amber',zh?'奶油':'Warm cream','#f7f0e1','#b08a56']
  ];
  const title=zh?'主题配色':'Colour theme';
  const dialog=document.createElement('dialog');dialog.className='theme-menu';dialog.setAttribute('aria-labelledby','theme-title');
  dialog.innerHTML='<form method="dialog"><button class="dialog-close" type="submit" aria-label="'+(zh?'关闭':'Close')+'">×</button></form><h2 id="theme-title">'+title+'</h2><div class="theme-options" role="group" aria-label="'+(zh?'主题配色':'Colour theme')+'"></div>';
  const group=dialog.querySelector('.theme-options');
  options.forEach(([value,label,colour,ink])=>{
    const item=document.createElement('button');item.type='button';item.dataset.themeValue=value;
    const swatch=document.createElement('span');swatch.className='theme-swatch';swatch.style.setProperty('--swatch',colour);swatch.style.setProperty('--swatch-ink',ink);swatch.setAttribute('aria-hidden','true');
    swatch.innerHTML='<span class="swatch-rail"></span><span class="swatch-orbit"></span><span class="swatch-dot"></span>';
    const text=document.createElement('span');text.textContent=label;item.append(swatch,text);
    item.onclick=()=>{window.MingleTheme.set(value);dialog.close();window.MingleFeedback?.tell(value==='auto'?(zh?'配色已跟随当前页面':'Colours now follow each destination'):(zh?'已切换为':'Switched to ')+label);};group.append(item);
  });
  const choices=[...group.children];
  const sync=()=>{
    choices.forEach(item=>item.setAttribute('aria-pressed',String(item.dataset.themeValue===window.MingleTheme.choice)));
    const label=options.find(([value])=>value===window.MingleTheme.choice)[1];
    button.setAttribute('aria-label',(zh?'主题配色：':'Colour theme: ')+label);button.title=(zh?'切换配色 · ':'Change colours · ')+label;
  };
  function position(){
    const box=button.getBoundingClientRect(),width=dialog.offsetWidth,height=dialog.offsetHeight;
    dialog.style.left=Math.max(14,Math.min(innerWidth-width-14,box.left))+'px';
    dialog.style.top=Math.max(14,Math.min(innerHeight-height-14,innerWidth<900?box.bottom+12:box.top-height-12))+'px';
  }
  document.body.append(dialog);sync();button.hidden=false;
  button.onclick=()=>{sync();dialog.showModal();position();button.setAttribute('aria-expanded','true');choices.find(item=>item.dataset.themeValue===window.MingleTheme.choice)?.focus();document.dispatchEvent(new CustomEvent('mingle:overlay'));};
  group.onkeydown=event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))return;
    const index=choices.indexOf(document.activeElement);if(index<0)return;event.preventDefault();
    const target=event.key==='Home'?0:event.key==='End'?choices.length-1:(index+({ArrowLeft:-1,ArrowRight:1,ArrowUp:-2,ArrowDown:2}[event.key])+choices.length)%choices.length;
    choices[target].focus();
  };
  dialog.addEventListener('click',event=>{if(event.target===dialog){const box=dialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{button.setAttribute('aria-expanded','false');document.dispatchEvent(new CustomEvent('mingle:overlay'));});
  document.addEventListener('mingle:theme',sync);window.addEventListener('resize',()=>{if(dialog.open)position();});
})();
