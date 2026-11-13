/* Presentation-only enhancements. Existing server forms remain usable without JS. */
(() => {
  'use strict';
  const profile = document.getElementById('profile-details');
  document.querySelectorAll('[data-open-profile]').forEach(button => button.addEventListener('click', () => profile.showModal()));
  if (profile) profile.addEventListener('click', event => { if (event.target === profile) { const bounds = profile.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) profile.close(); } });
  const search = document.getElementById('contact-search');
  if (!search) return;
  const contacts = [...document.querySelectorAll('[data-contact-name]')];
  const empty = document.getElementById('contact-no-results');
  let filter = 'all';
  const buttons = [...document.querySelectorAll('[data-inbox-filter]')];
  const update = () => {
    const term = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    contacts.forEach(contact => {
      const matches = contact.dataset.contactName.toLocaleLowerCase().includes(term) && (filter === 'all' || Number(contact.dataset.unread) > 0);
      contact.hidden = !matches;
      if (matches) visible++;
    });
    empty.hidden = visible > 0 || contacts.length === 0;
  };
  search.addEventListener('input', update);
  buttons.forEach(button => button.addEventListener('click', () => {
    filter = button.dataset.inboxFilter;
    buttons.forEach(item => { const selected = item === button; item.classList.toggle('selected', selected); item.setAttribute('aria-pressed', String(selected)); });
    update();
  }));
})();
