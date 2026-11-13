(() => {
  'use strict';
  document.querySelectorAll('form[data-confirm]').forEach(form => {
    form.addEventListener('submit', event => {
      if (!window.confirm(form.dataset.confirm)) event.preventDefault();
    });
  });
  const card = document.getElementById('swipe-card');
  // History can restore a live DOM, including disabled buttons and a submitted
  // card. Fetch current eligibility instead of reviving that stale decision.
  if (document.querySelector('.discovery-summary')) {
    window.addEventListener('pageshow', event => {
      if (event.persisted) window.location.reload();
    });
  }
  if (!card) return;
  const like = document.getElementById('like-form');
  const skip = document.getElementById('skip-form');
  const reduced = () => window.MingleFeedback?.reduced() ?? window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let origin = null, delta = 0, horizontal = false, committed = false;
  const threshold = () => Math.min(105, card.getBoundingClientRect().width * 0.27);
  const reset = () => {
    card.classList.remove('dragging'); card.style.transform = '';
    card.querySelector('.like-label').style.opacity = '0';
    card.querySelector('.skip-label').style.opacity = '0';
    origin = null; delta = 0; horizontal = false;
  };
  const commit = form => {
    if (committed) return;
    committed = true;
    card.setAttribute('aria-busy', 'true');
    const status = document.getElementById('decision-status');
    if (status) status.textContent = status.dataset.pending;
    card.classList.remove('dragging'); card.classList.add('exiting');
    const direction = form === like ? 1 : -1;
    card.style.transform = `translateX(${direction * (card.offsetWidth + 160)}px) rotate(${direction * 18}deg)`;
    card.style.opacity = '0';
    document.querySelectorAll('.action-button').forEach(button => { button.disabled = true; });
    // Native submission preserves the server-generated CSRF field and filters.
    window.setTimeout(() => HTMLFormElement.prototype.submit.call(form), reduced() ? 0 : 240);
  };
  [like, skip].forEach(form => form.addEventListener('submit', event => { event.preventDefault(); commit(form); }));
  card.addEventListener('pointerdown', event => {
    if (committed || (event.pointerType === 'mouse' && event.button !== 0)) return;
    origin = {x:event.clientX, y:event.clientY, pointer:event.pointerId};
    delta = 0; horizontal = false;
  });
  card.addEventListener('pointermove', event => {
    if (!origin || origin.pointer !== event.pointerId || committed) return;
    const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
    if (!horizontal && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 12) { reset(); return; }
    if (!horizontal && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) {
      horizontal = true; card.setPointerCapture(event.pointerId); card.classList.add('dragging');
    }
    if (!horizontal) return;
    delta = dx;
    card.style.transform = `translateX(${dx}px) translateY(${Math.abs(dx) * -0.025}px) rotate(${dx / 24}deg)`;
    card.querySelector('.like-label').style.opacity = String(Math.max(0, Math.min(1, dx / threshold())));
    card.querySelector('.skip-label').style.opacity = String(Math.max(0, Math.min(1, -dx / threshold())));
  });
  card.addEventListener('pointerup', event => {
    if (!origin || origin.pointer !== event.pointerId) return;
    if (horizontal && Math.abs(delta) >= threshold()) commit(delta > 0 ? like : skip);
    else reset();
  });
  card.addEventListener('pointercancel', reset);
  card.addEventListener('lostpointercapture', event => {
    // Touch starts with implicit capture on a child; transferring it to the
    // card bubbles the child's lost event. Only our own capture ends a drag.
    if (event.target === card && !committed) reset();
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); commit(event.key === 'ArrowRight' ? like : skip);
    }
  });
})();
