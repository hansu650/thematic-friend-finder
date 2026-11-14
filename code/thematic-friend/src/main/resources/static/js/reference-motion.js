(() => {
  'use strict';
  const system = matchMedia('(prefers-reduced-motion:reduce)');
  const reduced = () => {
    if (window.MingleFeedback) return window.MingleFeedback.reduced();
    try { return system.matches || localStorage.getItem('mingle.motion.v1') === 'reduced'; }
    catch { return system.matches; }
  };
  const running = new Set(), ease = 'cubic-bezier(.16,1,.3,1)';
  let nativeArrival = false, arrival;
  const navigationStyle = document.createElement('style');
  document.head.append(navigationStyle);

  function animate(node, frames, options = {}) {
    if (!node || reduced() || document.hidden || !node.animate) return;
    const effect = node.animate(frames, {duration: 480, easing: ease, fill: 'backwards', ...options});
    running.add(effect);
    effect.finished.catch(() => {}).finally(() => running.delete(effect));
    return effect;
  }
  function preference() {
    navigationStyle.textContent = reduced() ? '@view-transition{navigation:none}' : '@view-transition{navigation:auto}';
    if (reduced()) for (const effect of running) effect.cancel();
  }
  function cancelPhotoEntrance() {
    for (const effect of running) if (effect.effect?.target?.classList.contains('tilted-photo')) effect.cancel();
  }
  function handlePromises(transition) {
    transition.ready.catch(() => {});
    transition.finished.catch(() => {});
    transition.updateCallbackDone.catch(() => {});
  }
  function afterArrival(action) {
    if (arrival) arrival.finished.catch(() => {}).then(action);
    else action();
  }
  preference();
  system.addEventListener('change', preference);
  new MutationObserver(preference).observe(document.documentElement, {attributes: true, attributeFilter: ['data-motion']});

  // Register in the head: pagereveal can run before DOMContentLoaded.
  window.addEventListener('pageswap', event => {
    const transition = event.viewTransition;
    if (!transition) return;
    handlePromises(transition);
    if (reduced() || document.querySelector('#swipe-card.exiting')) { transition.skipTransition(); return; }
    const destination = event.activation?.entry?.url;
    const card = [...document.querySelectorAll('.event-card,.people-card')].find(item => item.href === destination);
    if (!card) return;
    const person = card.classList.contains('people-card'), name = person ? 'person-photo' : 'event-photo';
    const target = card.querySelector(person ? '.card-cover' : '.card-cover img');
    if (!target) return;
    const current = document.querySelector(person ? '#swipe-card' : '.event-page .detail-aside .tilted-photo>img');
    if (current) { current.dataset.travelPhoto = 'restore'; current.style.viewTransitionName = 'none'; }
    target.dataset.travelPhoto = name; target.style.viewTransitionName = name;
    transition.finished.catch(() => {}).finally(() => {
      target.style.viewTransitionName = '';
      if (current) current.style.viewTransitionName = '';
    });
  });
  window.addEventListener('pagereveal', event => {
    const transition = event.viewTransition;
    if (!transition) return;
    handlePromises(transition);
    if (reduced()) { transition.skipTransition(); return; }
    nativeArrival = true; arrival = transition; cancelPhotoEntrance();
  });
  window.addEventListener('pageshow', event => {
    preference();
    if (event.persisted) document.querySelectorAll('[data-travel-photo]').forEach(node => {
      node.style.viewTransitionName = ''; delete node.dataset.travelPhoto;
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) for (const effect of running) effect.cancel();
  });

  function particles(button) {
    if (reduced() || document.hidden || !button?.isConnected) return;
    const bounds = button.getBoundingClientRect();
    if (bounds.bottom < 0 || bounds.top > innerHeight) return;
    const x = bounds.left + bounds.width / 2, y = bounds.top + bounds.height / 2;
    const layer = document.createElement('div');
    layer.className = 'motion-particles'; layer.setAttribute('aria-hidden', 'true');
    const effects = [];
    for (let index = 0; index < 12; index++) {
      const dot = document.createElement('i'), angle = index * Math.PI / 6;
      const distance = 38 + (index % 3) * 10;
      const dx = Math.cos(angle) * distance, dy = Math.sin(angle) * distance;
      dot.className = 'motion-particle';
      dot.style.left = x + 'px'; dot.style.top = y + 'px';
      dot.style.setProperty('--particle-color', ['#a585bb','#c47b95','#c5a46c'][index % 3]);
      layer.append(dot);
      const effect = animate(dot, [
        {opacity: 0, transform: 'translate(-3px,-3px) scale(.2)'},
        {opacity: 1, transform: 'translate(' + dx * .45 + 'px,' + dy * .45 + 'px) rotate(70deg) scale(1)', offset: .28},
        {opacity: 0, transform: 'translate(' + dx + 'px,' + (dy + 12) + 'px) rotate(150deg) scale(.2)'}
      ], {duration: 620, delay: (index % 3) * 18, easing: 'cubic-bezier(.15,.65,.3,1)'});
      if (effect) effects.push(effect);
    }
    const ring = document.createElement('i');
    ring.className = 'motion-ring'; ring.style.left = x - 19 + 'px'; ring.style.top = y - 19 + 'px'; layer.append(ring);
    document.body.append(layer);
    const ripple = animate(ring, [{opacity: .65, transform: 'scale(.55)'}, {opacity: 0, transform: 'scale(2.2)'}], {duration: 520});
    if (ripple) effects.push(ripple);
    Promise.allSettled(effects.map(effect => effect.finished)).then(() => layer.remove());
    animate(button.querySelector('svg'), [
      {transform: 'scale(.72)'}, {transform: 'scale(1.24)', offset: .48}, {transform: 'scale(1)'}
    ], {duration: 420});
  }

  function message(row, delay = 0) {
    const direction = row.classList.contains('mine') ? 1 : -1;
    animate(row.querySelector('p'), [
      {opacity: 0, transform: 'translate(' + direction * 12 + 'px,14px) scale(.86)'},
      {opacity: 1, transform: 'translate(0,-2px) scale(1.018)', offset: .72},
      {opacity: 1, transform: 'translate(0,0) scale(1)'}
    ], {duration: 390, delay});
    animate(row.querySelector('time'), [{opacity: 0}, {opacity: 1}], {duration: 220, delay: delay + 130});
  }
  window.MingleMotion = {animate, reduced, message};

  function initMatch() {
    const pair = document.querySelector('.match-pair');
    if (!pair) return;
    afterArrival(() => {
      const cards = pair.querySelectorAll('.match-avatar');
      cards.forEach((card, index) => {
        const sign = index ? 1 : -1;
        const travel = innerWidth < 640 ? 24 : 65;
        animate(card, [
          {opacity: 0, transform: 'translateX(' + sign * travel + 'px) translateY(20px) rotate(' + sign * 24 + 'deg) scale(.86)'},
          {opacity: 1, transform: 'translateX(' + -sign * 13 + 'px) translateY(-4px) rotate(' + sign * 5 + 'deg) scale(1.025)', offset: .7},
          {opacity: 1, transform: 'translateX(' + -sign * 8 + 'px) translateY(0) rotate(' + sign * 9 + 'deg) scale(1)'}
        ], {duration: 760, delay: index * 40});
      });
      animate(pair.querySelector('.match-heart'), [
        {opacity: 0, transform: 'translate(-50%,-50%) scale(.1) rotate(-20deg)'},
        {opacity: 1, transform: 'translate(-50%,-50%) scale(1.2) rotate(8deg)', offset: .65},
        {opacity: 1, transform: 'translate(-50%,-50%) scale(1) rotate(0)'}
      ], {duration: 480, delay: 320});
      animate(pair.querySelector('.match-orbit'), [{opacity: 0, scale: '.6'}, {opacity: .55, scale: '1.15', offset: .55}, {opacity: .35, scale: '1'}], {duration: 950, delay: 250});
      animate(document.querySelector('.match-confirmation'), [{opacity: 0, translate: '0 10px'}, {opacity: 1, translate: '0 0'}], {delay: 420});
    });
  }

  function initSaves() {
    const key = 'mingle.motion.save.v1';
    // The destination's confirmed state is the source of truth, not the click.
    let pending;
    try { pending = JSON.parse(sessionStorage.getItem(key)); sessionStorage.removeItem(key); } catch {}
    const forms = [...document.querySelectorAll('form[action$="/save"]')];
    if (pending && pending.path === location.pathname && Date.now() - pending.at < 20000 && pending.saved) {
      const confirmed = forms.find(form => form.getAttribute('action') === pending.action)?.querySelector('button[aria-pressed=true]');
      if (confirmed) afterArrival(() => particles(confirmed));
    }
    forms.forEach(form => form.addEventListener('submit', event => {
      if (event.defaultPrevented) return;
      try {
        sessionStorage.setItem(key, JSON.stringify({
          action: form.getAttribute('action'), path: location.pathname,
          saved: form.querySelector('input[name=saved]')?.value === 'true', at: Date.now()
        }));
      } catch {}
    }));
  }

  function init() {
    // A native POST may return a bare error page without transition support.
    // Let the confirmed result provide feedback instead of animating that navigation.
    document.addEventListener('submit', event => {
      if (!event.defaultPrevented && event.target instanceof HTMLFormElement && event.target.method.toLowerCase() === 'post') {
        navigationStyle.textContent = '@view-transition{navigation:none}';
      }
    });
    const dock = document.querySelector('.action-dock');
    if (dock) {
      const reserve = () => document.documentElement.style.setProperty('--action-space', Math.ceil(dock.getBoundingClientRect().height) + 64 + 'px');
      new ResizeObserver(reserve).observe(dock); reserve();
    }
    const reveal = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        animate(entry.target, [
          {opacity: 0, transform: 'translateY(28px) scale(.975)'},
          {opacity: 1, transform: 'translateY(0) scale(1)'}
        ], {duration: 580, delay: Math.min(order++, 3) * 75});
        reveal.unobserve(entry.target);
      }
    }, {threshold: .06});
    document.querySelectorAll('.event-card,.people-card,.messenger-contact').forEach(card => reveal.observe(card));
    animate(document.querySelector('.page-heading,.detail-copy>h1'), [{opacity: 0, translate: '0 16px'}, {opacity: 1, translate: '0 0'}], {duration: 460});
    animate(document.querySelector('.feed-filters'), [{opacity: 0, translate: '0 12px'}, {opacity: 1, translate: '0 0'}], {duration: 420, delay: 70});
    if (!nativeArrival) animate(document.querySelector('.detail-aside .tilted-photo'), [
      {opacity: 0, transform: 'perspective(1000px) rotateY(-5deg) translateY(14px) scale(.975)'},
      {opacity: 1, transform: 'perspective(1000px) rotateY(0deg) translateY(0) scale(1)'}
    ], {duration: 520});
    animate(document.querySelector('.detail-aside .event-info'), [{opacity: 0, translate: '0 12px'}, {opacity: 1, translate: '0 0'}], {duration: 400, delay: 90});
    animate(dock, [{opacity: 0}, {opacity: 1}], {duration: 280, delay: 130});
    document.querySelector('#swipe-card')?.addEventListener('pointerdown', cancelPhotoEntrance, {passive: true});
    document.addEventListener('click', event => {
      if (event.isTrusted && event.target.closest('.button,.icon-button,.topic-pill')) window.MingleFeedback?.tone('tap');
    });
    initMatch(); initSaves();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once: true});
  else init();
})();
