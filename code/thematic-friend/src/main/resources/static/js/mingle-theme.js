(() => {
  'use strict';
  const allowed=['auto','violet','cyan','rose','mint','amber'];
  const route=location.pathname;
  const pageTheme=route.startsWith('/discover')||route.startsWith('/matches')?'rose':route.startsWith('/connections')||route.startsWith('/conversations')?'cyan':route.startsWith('/safety')||route.startsWith('/reports')?'mint':route.startsWith('/profile')||route.startsWith('/change-password')?'amber':'violet';
  const read=()=>{try{const value=localStorage.getItem('mingle.theme.v1');return allowed.includes(value)?value:'auto';}catch{return 'auto';}};
  let choice=read();
  function apply(){
    document.documentElement.dataset.theme=choice==='auto'?pageTheme:choice;
    document.documentElement.dataset.themeChoice=choice;
    document.dispatchEvent(new CustomEvent('mingle:theme'));
  }
  window.MingleTheme={get choice(){return choice;},get current(){return choice==='auto'?pageTheme:choice;},set(value){if(!allowed.includes(value))return;choice=value;try{localStorage.setItem('mingle.theme.v1',value);}catch{}apply();}};
  window.addEventListener('storage',event=>{if(!event.key||event.key==='mingle.theme.v1'){choice=read();apply();}});
  apply();
})();
