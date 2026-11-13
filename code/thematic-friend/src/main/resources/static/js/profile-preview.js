(() => {
  'use strict';
  const form = document.getElementById('profile-form');
  if (!form) return;
  const field = id => document.getElementById(id);
  const name = field('nickname'), bio = field('bio'), goal = field('goal');
  const interests = [...form.querySelectorAll('input[name="interests"]')];
  const feedback = field('interest-feedback'), status = field('preview-status');
  const maximum = Number(feedback.dataset.max);
  const selected = () => interests.filter(input => input.checked);
  const state = () => JSON.stringify([
    name.value, bio.value, goal.value, selected().map(input => input.value),
    field('discoverable').checked
  ]);
  const initial = state();
  let announcement;
  const label = input => input.labels[0].querySelector('span').textContent.trim();
  const counter = () => feedback.dataset.count.replace('{count}', selected().length).replace('{max}', maximum);
  const render = () => {
    // Never parse user input as HTML; no draft values leave the browser.
    field('preview-name').textContent = name.value.trim() || field('preview-name').dataset.empty;
    field('preview-initial').textContent = Array.from(name.value.trim())[0]?.toLocaleUpperCase() || '?';
    field('preview-bio').textContent = bio.value || field('preview-bio').dataset.empty;
    field('preview-goal').textContent = goal.selectedOptions[0]?.textContent || '';
    field('preview-interests').replaceChildren(...selected().map(input => {
      const tag = document.createElement('span');
      tag.textContent = label(input);
      return tag;
    }));
    feedback.textContent = counter() + (selected().length > maximum ? ' ' + feedback.dataset.over : '');
    feedback.classList.toggle('at-limit', selected().length >= maximum);
    form.dataset.dirty = String(state() !== initial);
    clearTimeout(announcement);
    // Announce save state after typing pauses, not the whole card on every key.
    announcement = setTimeout(() => {
      status.textContent = state() !== initial ? status.dataset.unsaved :
        form.dataset.hasErrors === 'true' ? status.dataset.invalid : status.dataset.saved;
    }, 300);
  };
  form.addEventListener('input', event => {
    if (interests.includes(event.target)) return; // change handles the limit first
    render();
  });
  form.addEventListener('change', event => {
    const input = event.target;
    if (interests.includes(input) && input.checked && selected().length > maximum) {
      input.checked = false; // Preserve the existing five choices and focus.
      render();
      feedback.textContent = counter() + ' ' + feedback.dataset.limit.replace('{interest}', label(input));
      return;
    }
    render();
  });
  form.addEventListener('reset', () => setTimeout(render, 0));
  window.addEventListener('pageshow', event => {
    if (event.persisted) window.location.reload();
  });
  render();
})();
