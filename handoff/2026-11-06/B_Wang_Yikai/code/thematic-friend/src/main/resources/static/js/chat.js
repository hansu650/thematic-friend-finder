(() => {
  'use strict';
  const list = document.getElementById('messages');
  if (!list) return;
  const status = document.getElementById('chat-status');
  const form = document.getElementById('message-form');
  let cursor = Number(list.dataset.cursor || 0), stopped = false;
  list.scrollTop = list.scrollHeight;
  form.addEventListener('submit', event => {
    const body = form.querySelector('textarea');
    if (!body.value.trim()) { event.preventDefault(); body.setCustomValidity(list.dataset.empty); body.reportValidity(); return; }
    form.querySelector('button').disabled = true;
  });
  form.querySelector('textarea').addEventListener('input', event => event.target.setCustomValidity(''));
  async function poll() {
    if (stopped) return;
    if (!document.hidden) {
      try {
        const response = await fetch(`${list.dataset.url}?after=${cursor}`, {headers:{'Accept':'application/json'},cache:'no-store'});
        if ([401,403,404].includes(response.status)) {
          stopped = true;
          status.textContent = response.status === 401 ? list.dataset.expired : list.dataset.closed;
          form.querySelectorAll('textarea,button').forEach(input => { input.disabled = true; }); return;
        }
        if (!response.ok) throw new Error('poll failed');
        const messages = await response.json();
        const atBottom = list.scrollHeight - list.clientHeight - list.scrollTop < 65;
        for (const message of messages) {
          if (message.id <= cursor) continue;
          const row = document.createElement('div'); row.className = 'message' + (message.mine ? ' mine' : '');
          row.dataset.messageId = String(message.id);
          const body = document.createElement('p'); body.textContent = message.body;
          const time = document.createElement('time'); time.textContent = message.time;
          row.append(body,time); list.append(row); cursor = message.id;
        }
        if (atBottom) list.scrollTop = list.scrollHeight;
        status.textContent = list.dataset.polling;
      } catch (_) { status.textContent = list.dataset.retry; }
    }
    window.setTimeout(poll,3000);
  }
  window.setTimeout(poll,3000);
})();
