(() => {
  'use strict';
  const list = document.getElementById('messages');
  if (!list) return;
  const status = document.getElementById('chat-status');
  const form = document.getElementById('message-form');
  const loadOlder = document.getElementById('load-older');
  const loadOlderLabel = loadOlder ? loadOlder.textContent.trim() : '';
  const csrf = document.querySelector('meta[name="_csrf"]');
  const csrfHeader = document.querySelector('meta[name="_csrf_header"]');
  let cursor = Number(list.dataset.cursor || 0), stopped = false, loadingOlder = false;
  let acknowledged = 0, acknowledging = false, scrollTimer = 0;

  const messageRows = () => Array.from(list.querySelectorAll('.message[data-message-id]'));
  const numericId = row => Number(row.dataset.messageId || 0);
  const newestId = () => Math.max(cursor, ...messageRows().map(numericId));
  const oldestId = () => Math.min(...messageRows().map(numericId));
  const atBottom = () => list.scrollHeight - list.clientHeight - list.scrollTop < 65;

  function makeRow(message) {
    const row = document.createElement('div');
    row.className = 'message' + (message.mine ? ' mine' : '');
    row.dataset.messageId = String(message.id);
    const body = document.createElement('p');
    body.textContent = message.body;
    const time = document.createElement('time');
    time.textContent = message.time;
    row.append(body, time);
    return row;
  }

  function mergeMessages(messages, prepend) {
    const rows = new Map(messageRows().map(row => [numericId(row), row]));
    const wasAtBottom = atBottom(), oldHeight = list.scrollHeight, oldTop = list.scrollTop;
    for (const message of messages) {
      const id = Number(message.id);
      if (id > 0 && !rows.has(id)) rows.set(id, makeRow(message));
    }
    const ordered = Array.from(rows.entries()).sort(([a], [b]) => a - b).map(([, row]) => row);
    list.replaceChildren(...ordered);
    cursor = Math.max(cursor, ...ordered.map(numericId));
    if (prepend && !wasAtBottom) list.scrollTop = oldTop + list.scrollHeight - oldHeight;
    else if (wasAtBottom) list.scrollTop = list.scrollHeight;
    return ordered;
  }

  function stop(text) {
    stopped = true;
    status.textContent = text;
    form.querySelectorAll('textarea,button').forEach(input => { input.disabled = true; });
    if (loadOlder) loadOlder.disabled = true;
  }

  function accessFailure(response) {
    if (![401, 403, 404].includes(response.status)) return false;
    stop(response.status === 401 ? list.dataset.expired : list.dataset.closed);
    return true;
  }

  async function acknowledge(id) {
    if (!list.dataset.readUrl || !id || id <= acknowledged || acknowledging || document.hidden || !csrf || !csrfHeader) return;
    acknowledging = true;
    try {
      const response = await fetch(list.dataset.readUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
          [csrfHeader.content]: csrf.content
        },
        body: new URLSearchParams({throughMessageId: String(id)})
      });
      if (accessFailure(response)) return;
      if (!response.ok) return;
      const receipt = await response.json();
      acknowledged = Math.max(acknowledged, Number(receipt.lastReadMessageId || 0));
    } catch (_) {
      // Polling remains available; the next visible acknowledgement can retry.
    } finally {
      acknowledging = false;
    }
  }

  async function loadHistory() {
    if (!loadOlder || loadingOlder || stopped) return;
    const before = oldestId();
    if (!Number.isFinite(before) || before <= 0) return;
    loadingOlder = true;
    loadOlder.disabled = true;
    loadOlder.textContent = loadOlder.dataset.loading;
    try {
      const response = await fetch(`${loadOlder.dataset.url}?before=${before}`, {
        headers: {'Accept': 'application/json'}, cache: 'no-store'
      });
      if (accessFailure(response)) return;
      if (!response.ok) throw new Error('history failed');
      const page = await response.json();
      mergeMessages(page.messages, true);
      if (!page.hasOlder || page.nextBefore == null) loadOlder.remove();
      else {
        loadOlder.disabled = false;
        loadOlder.textContent = loadOlderLabel;
      }
      status.textContent = list.dataset.polling;
    } catch (_) {
      status.textContent = list.dataset.retry;
      loadOlder.disabled = false;
    } finally {
      loadingOlder = false;
    }
  }

  form.addEventListener('submit', event => {
    const body = form.querySelector('textarea');
    if (!body.value.trim()) {
      event.preventDefault();
      body.setCustomValidity(list.dataset.empty);
      body.reportValidity();
      return;
    }
    form.querySelector('button').disabled = true;
  });
  form.querySelector('textarea').addEventListener('input', event => event.target.setCustomValidity(''));
  if (loadOlder) loadOlder.addEventListener('click', loadHistory);

  list.scrollTop = list.scrollHeight;
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && atBottom()) acknowledge(newestId());
  });
  list.addEventListener('scroll', () => {
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      if (!document.hidden && atBottom()) acknowledge(newestId());
    }, 150);
  });
  if (newestId() > 0 && !document.hidden) acknowledge(newestId());

  async function poll() {
    if (stopped) return;
    if (!document.hidden) {
      try {
        const response = await fetch(`${list.dataset.url}?after=${cursor}`, {
          headers: {'Accept': 'application/json'}, cache: 'no-store'
        });
        if (accessFailure(response)) return;
        if (!response.ok) throw new Error('poll failed');
        const messages = await response.json();
        const arrivedAtBottom = atBottom();
        const hasNew = messages.some(message => Number(message.id) > cursor);
        mergeMessages(messages, false);
        if (hasNew && arrivedAtBottom && !document.hidden) await acknowledge(newestId());
        status.textContent = list.dataset.polling;
      } catch (_) {
        status.textContent = list.dataset.retry;
      }
    }
    window.setTimeout(poll, 3000);
  }
  window.setTimeout(poll, 3000);
})();
