/* ===== Links: every clickable element has a data-link key; URLs live in LINKS (one place) ===== */
document.querySelectorAll('[data-link]').forEach(el => {
  const u = LINKS[el.dataset.link] || '#';
  if (el.tagName === 'A') el.setAttribute('href', u);
});
document.addEventListener('click', e => {
  const el = e.target.closest('[data-link]');
  if (!el || e.target.closest('button, input, .qty')) return;
  const u = LINKS[el.dataset.link] || '#';
  if (u === '#') { e.preventDefault(); return; }
  if (el.tagName !== 'A') location.href = u;
});

