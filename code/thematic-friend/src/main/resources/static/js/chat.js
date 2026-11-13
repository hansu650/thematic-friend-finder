(() => {
  'use strict';
  const list = document.getElementById('messages');
  if (!list) return;
  const status = document.getElementById('chat-status');
  const form = document.getElementById('message-form');
  const draft = form.querySelector('textarea');
  const sendButton = form.querySelector('button[type=submit]');
  const loadOlder = document.getElementById('load-older');
  const loadOlderLabel = loadOlder ? loadOlder.textContent.trim() : '';
  const csrfToken = list.dataset.csrf, csrfHeader = list.dataset.csrfHeader;
  const zh = document.documentElement.lang.startsWith('zh');
  const toggle = document.getElementById('emoji-toggle');
  const picker = document.getElementById('emoji-popover');
  const stickerButtons = [...picker.querySelectorAll('[data-sticker-id]')];
  const stickers = new Map(stickerButtons.map(button => [
    '[[sticker:' + button.dataset.stickerId + ']]',
    {id:button.dataset.stickerId, label:button.dataset.stickerLabel, preview:button.dataset.stickerPreview}
  ]));
  // The polling cursor only advances over fetched pages. A local send can arrive
  // ahead of a large incoming backlog without making those messages disappear.
  let cursor = Number(list.dataset.cursor || 0), stopped = false, loadingOlder = false;
  let acknowledged = 0, acknowledging = false, scrollTimer = 0, sending = false, pollTimer = 0;
  let sendProblem = '', polling = false;
  const rows = () => [...list.querySelectorAll('.message[data-message-id]')];
  const numericId = row => Number(row.dataset.messageId || 0);
  const oldestId = () => Math.min(...rows().map(numericId));
  const atBottom = () => list.scrollHeight - list.clientHeight - list.scrollTop < 65;
  const headers = () => ({
    'Accept':'application/json', 'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8', [csrfHeader]:csrfToken
  });
  const updateStatus = () => {
    if (!stopped) status.textContent = sending ? list.dataset.sending : (sendProblem || list.dataset.polling);
  };

  function makeRow(message, animate) {
    const row = document.createElement('div');
    row.className = 'message' + (message.mine ? ' mine' : '');
    row.dataset.messageId = String(message.id);
    const body = document.createElement('p'), sticker = stickers.get(message.body);
    if (sticker) {
      body.className = 'sticker-bubble'; body.dataset.sticker = sticker.id;
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.classList.add('sticker-art'); svg.setAttribute('aria-hidden','true');
      const use = document.createElementNS('http://www.w3.org/2000/svg','use');
      use.setAttribute('href','/images/mingle-stickers.svg#' + sticker.id); svg.append(use);
      const caption = document.createElement('span');
      caption.className = 'sticker-caption'; caption.textContent = sticker.label;
      body.append(svg,caption);
    } else body.textContent = message.body;
    const time = document.createElement('time'); time.textContent = message.time;
    row.append(body,time);
    if (animate) {
      row.classList.add('arriving');
      row.addEventListener('animationend',()=>row.classList.remove('arriving'),{once:true});
    }
    return row;
  }

  function mergeMessages(messages, history = false, own = false) {
    const existing = rows(), known = new Set(existing.map(numericId));
    const wasAtBottom = atBottom(), oldHeight = list.scrollHeight, oldTop = list.scrollTop;
    let added = 0, received = false;
    for (const message of messages) {
      const id = Number(message.id);
      if (id <= 0 || known.has(id)) continue;
      const row = makeRow(message,!history), before = rows().find(item => numericId(item) > id);
      list.insertBefore(row,before || null); known.add(id); added++;
      received ||= !message.mine;
    }
    // Leave existing DOM and scroll position completely alone on an empty poll.
    if (added) {
      if (own || wasAtBottom) list.scrollTop = list.scrollHeight;
      else if (history) list.scrollTop = oldTop + list.scrollHeight - oldHeight;
      if (received && !history && !document.hidden) window.MingleFeedback?.tone('received');
    }
    return added;
  }

  function closePicker(focus = false) {
    picker.hidden = true; toggle.setAttribute('aria-expanded','false');
    if (focus) toggle.focus();
  }
  function stop(text) {
    stopped = true; clearTimeout(pollTimer); status.textContent = text;
    document.querySelector('.composer-shell').querySelectorAll('textarea,button').forEach(input => { input.disabled = true; });
    closePicker(); if (loadOlder) loadOlder.disabled = true;
  }
  function accessFailure(response) {
    if (![401,403,404].includes(response.status)) return false;
    stop(response.status === 401 ? list.dataset.expired : list.dataset.closed); return true;
  }

  async function acknowledge(id) {
    if (!list.dataset.readUrl || !id || id <= acknowledged || acknowledging || stopped || document.hidden || !csrfToken || !csrfHeader) return;
    acknowledging = true;
    try {
      const response = await fetch(list.dataset.readUrl,{method:'POST',headers:headers(),body:new URLSearchParams({throughMessageId:String(id)})});
      if (accessFailure(response) || !response.ok) return;
      const receipt = await response.json();
      acknowledged = Math.max(acknowledged,Number(receipt.lastReadMessageId || 0));
      const selected = document.querySelector('.messenger-contact.selected');
      if (selected) {
        selected.dataset.unread=String(receipt.unreadCount || 0);
        const badge=selected.querySelector('.unread-badge');
        if (badge && !receipt.unreadCount) badge.remove();
        else if (badge) badge.textContent=String(receipt.unreadCount);
      }
    } catch {
      // A visible poll or scroll will retry; reading never interferes with sending.
    } finally { acknowledging = false; }
  }

  async function loadHistory() {
    if (!loadOlder || loadingOlder || stopped) return;
    const before = oldestId(); if (!Number.isFinite(before) || before <= 0) return;
    loadingOlder = true; loadOlder.disabled = true; loadOlder.textContent = loadOlder.dataset.loading;
    try {
      const response = await fetch(loadOlder.dataset.url + '?before=' + before,{headers:{Accept:'application/json'},cache:'no-store'});
      if (accessFailure(response)) return;
      if (!response.ok) throw new Error('history failed');
      const page = await response.json(); mergeMessages(page.messages,true);
      if (!page.hasOlder || page.nextBefore == null) loadOlder.remove();
      updateStatus();
    } catch { if (!stopped) status.textContent = list.dataset.retry; }
    finally {
      loadingOlder = false;
      if (!stopped) { loadOlder.disabled = false; loadOlder.textContent = loadOlderLabel; }
    }
  }

  async function sendMessage(body, clearDraft) {
    if (stopped || sending) return;
    if (!body.trim()) { draft.setCustomValidity(list.dataset.empty); draft.reportValidity(); return; }
    const submittedDraft = draft.value;
    sending = true; sendProblem = ''; sendButton.disabled = true;
    stickerButtons.forEach(button=>{button.disabled=true;}); updateStatus();
    try {
      const response = await fetch(list.dataset.url,{method:'POST',headers:headers(),body:new URLSearchParams({body})});
      if (accessFailure(response)) return;
      if (!response.ok) {
        const error = await response.json().catch(()=>({}));
        throw new Error(response.status === 400 && error.error ? error.error : list.dataset.sendFailed);
      }
      const message = await response.json();
      mergeMessages([message],false,true);
      if (clearDraft && draft.value === submittedDraft) { draft.value=''; resizeDraft(); }
      updateContactPreview(message.body);
      closePicker(); draft.focus(); window.MingleFeedback?.tone('sent');
    } catch (error) {
      if (!stopped) sendProblem = error.message === 'Failed to fetch' ? list.dataset.sendFailed : (error.message || list.dataset.sendFailed);
    } finally {
      sending = false;
      if (!stopped) { sendButton.disabled=false; stickerButtons.forEach(button=>{button.disabled=false;}); updateStatus(); }
    }
  }

  function updateContactPreview(body) {
    const preview = document.querySelector('.messenger-contact.selected small');
    const sticker = stickers.get(body);
    if (preview) preview.textContent = sticker ? sticker.preview + ' ' + sticker.label : body;
  }
  function resizeDraft() {
    draft.style.height='48px'; draft.style.height=Math.min(144,Math.max(48,draft.scrollHeight+2))+'px';
  }
  form.addEventListener('submit',event=>{event.preventDefault();sendMessage(draft.value,true);});
  draft.addEventListener('input',()=>{draft.setCustomValidity('');resizeDraft();});
  draft.addEventListener('keydown',event=>{
    if (event.key==='Enter' && !event.shiftKey && !event.isComposing && event.keyCode!==229) {
      event.preventDefault(); form.requestSubmit(sendButton);
    }
  });

  const emojis = [
    ['😊','Smile','微笑'],['😄','Happy','开心'],['🥰','Love','喜欢'],['😂','Laugh','大笑'],['🥹','Touched','感动'],['😎','Cool','酷'],['🤔','Thinking','思考'],
    ['👋','Wave','挥手'],['🫶','Heart hands','比心'],['👍','Thumbs up','赞'],['👏','Clap','鼓掌'],['🙌','Celebrate','庆祝'],['🤝','Handshake','握手'],['💪','Cheer on','加油'],
    ['❤️','Heart','爱心'],['💜','Purple heart','紫色爱心'],['✨','Sparkles','闪耀'],['🌻','Sunflower','向日葵'],['🌙','Moon','月亮'],['☀️','Sun','太阳'],['🌈','Rainbow','彩虹'],
    ['☕','Coffee','咖啡'],['🍰','Cake','蛋糕'],['🎵','Music','音乐'],['📚','Books','书籍'],['🎬','Film','电影'],['🐱','Cat','猫咪'],['🎉','Party','欢庆']
  ];
  for (const [emoji,en,cn] of emojis) {
    const button = document.createElement('button'); button.type='button'; button.textContent=emoji;
    button.setAttribute('aria-label',zh?cn:en); button.title=zh?cn:en;
    button.onclick=()=>{
      const start=draft.selectionStart,end=draft.selectionEnd;
      if (draft.value.length-(end-start)+emoji.length>draft.maxLength) return;
      draft.setRangeText(emoji,start,end,'end'); draft.setCustomValidity(''); resizeDraft(); closePicker(); draft.focus();
    };
    document.getElementById('emoji-grid').append(button);
  }
  const tabs=[...picker.querySelectorAll('[role=tab]')];
  function selectTab(tab,focus=false) {
    tabs.forEach(item=>{
      const active=item===tab;item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1;item.classList.toggle('selected',active);
      document.getElementById(item.getAttribute('aria-controls')).hidden=!active;
    });
    if(focus)tab.focus();
  }
  tabs.forEach((tab,index)=>{
    tab.onclick=()=>selectTab(tab);
    tab.onkeydown=event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
      event.preventDefault();
      selectTab(tabs[event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+1)%tabs.length],true);
    };
  });
  toggle.onclick=()=>{const open=picker.hidden;picker.hidden=!open;toggle.setAttribute('aria-expanded',String(open));if(open)tabs.find(tab=>tab.tabIndex===0).focus();};
  stickerButtons.forEach(button=>{button.onclick=()=>sendMessage('[[sticker:'+button.dataset.stickerId+']]',false);});
  document.addEventListener('click',event=>{if(!picker.hidden&&!picker.contains(event.target)&&!toggle.contains(event.target))closePicker();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!picker.hidden){event.preventDefault();closePicker(true);}});
  document.querySelector('.composer-toolbar').hidden=false;
  if (loadOlder) loadOlder.addEventListener('click',loadHistory);

  list.scrollTop=list.scrollHeight;
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden&&!stopped){if(atBottom())acknowledge(cursor);clearTimeout(pollTimer);poll();}
  });
  list.addEventListener('scroll',()=>{
    clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{if(!document.hidden&&atBottom())acknowledge(cursor);},150);
  });
  if(cursor>0&&!document.hidden)acknowledge(cursor);

  async function poll() {
    if(stopped||polling)return;
    polling=true;
    let backlog=false;
    if(!document.hidden){
      try{
        const response=await fetch(list.dataset.url+'?after='+cursor,{headers:{Accept:'application/json'},cache:'no-store'});
        if(accessFailure(response))return;
        if(!response.ok)throw new Error('poll failed');
        const messages=await response.json(),arrivedAtBottom=atBottom();
        mergeMessages(messages);
        for(const message of messages)cursor=Math.max(cursor,Number(message.id));
        backlog=messages.length===100;
        if(messages.length)updateContactPreview(messages[messages.length-1].body);
        if(arrivedAtBottom&&!document.hidden)await acknowledge(cursor);
        updateStatus();
      }catch{if(!stopped&&!sending&&!sendProblem)status.textContent=list.dataset.retry;}
    }
    polling=false;
    if(!stopped)pollTimer=setTimeout(poll,backlog?100:3000);
  }
  pollTimer=setTimeout(poll,3000);
  window.addEventListener('pagehide',()=>{clearTimeout(pollTimer);clearTimeout(scrollTimer);});
  window.addEventListener('pageshow',event=>{if(event.persisted&&!stopped){clearTimeout(pollTimer);poll();}});
})();
