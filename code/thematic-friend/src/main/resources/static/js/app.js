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
  let hoverFrame = 0, snapEffect;
  const stopHover = () => {
    cancelAnimationFrame(hoverFrame); hoverFrame = 0;
    card.style.setProperty('--card-glow', '0');
    if (!origin && !committed) card.style.transform = '';
  };
  const stopSnap = () => { snapEffect?.cancel(); snapEffect = undefined; };
  const threshold = () => Math.min(105, card.getBoundingClientRect().width * 0.27);
  const reset = () => {
    if (committed) return;
    const from = card.style.transform, distance = delta, returning = horizontal;
    stopSnap();
    card.classList.remove('dragging'); card.style.transform = '';
    card.querySelector('.like-label').style.opacity = '0';
    card.querySelector('.skip-label').style.opacity = '0';
    origin = null; delta = 0; horizontal = false;
    if (returning && from && !reduced()) snapEffect = window.MingleMotion?.animate(card, [
      {transform: from},
      {transform: 'translateX(' + distance * -.06 + 'px) rotate(' + distance * -.002 + 'deg)', offset: .7},
      {transform: 'translateX(0) rotate(0)'}
    ], {duration: 460});
  };
  const commit = form => {
    if (committed) return;
    stopHover(); stopSnap();
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
    stopHover(); stopSnap();
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
    if (event.target === card && origin && !committed) reset();
  });
  card.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); commit(event.key === 'ArrowRight' ? like : skip);
    }
  });
  card.addEventListener('pointermove', event => {
    if (origin || committed || snapEffect?.playState === 'running' || reduced() || event.pointerType !== 'mouse') return;
    cancelAnimationFrame(hoverFrame);
    const x = event.clientX, y = event.clientY;
    hoverFrame = requestAnimationFrame(() => {
      if (origin || committed || reduced()) return;
      const bounds = card.parentElement.getBoundingClientRect();
      const px = Math.max(0, Math.min(1, (x - bounds.left) / bounds.width));
      const py = Math.max(0, Math.min(1, (y - bounds.top) / bounds.height));
      card.style.transform = 'perspective(900px) rotateX(' + (.5 - py) * 6 + 'deg) rotateY(' + (px - .5) * 8 + 'deg) translateY(-2px)';
      card.style.setProperty('--card-x', px * 100 + '%'); card.style.setProperty('--card-y', py * 100 + '%');
      card.style.setProperty('--card-glow', '1');
    });
  }, {passive: true});
  card.addEventListener('pointerleave', stopHover);
  const preferenceChanged = () => { if (reduced()) { stopHover(); stopSnap(); } };
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', preferenceChanged);
  new MutationObserver(preferenceChanged).observe(document.documentElement, {attributes: true, attributeFilter: ['data-motion']});
  document.addEventListener('visibilitychange', () => { if (document.hidden) { stopHover(); stopSnap(); } });
  window.addEventListener('pagehide', () => { stopHover(); stopSnap(); });
})();
