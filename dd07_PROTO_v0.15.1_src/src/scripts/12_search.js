/* ===== Search (Pill Default/Active + Search Dropdown, DEMO content) ===== */
const Search = (() => {
  const root = document.getElementById('search');
  const pill = root.querySelector('.search-pill');
  const input = document.getElementById('searchInput');
  const dim = document.getElementById('dim');
  const clr = root.querySelector('.sf-clear');
  const rows = [...document.querySelectorAll('#sdSuggest .sd-row')];
  let hi = 0;
  const setHi = i => { hi = (i + rows.length) % rows.length; rows.forEach((r,k) => r.classList.toggle('is-active', k === hi)); };
  const sync = () => {
    const open = root.classList.contains('is-active') && input.value.trim().length > 0;
    root.classList.toggle('is-open', open);
    clr.hidden = input.value.length === 0;
  };
  const activate = () => {
    root.classList.add('is-active');
    Overlay.open(api);
    input.focus(); sync();
  };
  const close = () => {
    root.classList.remove('is-active','is-open');
    Overlay.close(api);
    input.value = ''; setHi(0); input.blur(); clr.hidden = true;
  };
  // v0.7.1: clear (X) brise tekst, lista se zatvara, polje ostaje aktivno i u fokusu
  clr.addEventListener('mousedown', e => e.preventDefault());
  clr.addEventListener('click', () => { input.value = ''; setHi(0); sync(); input.focus(); });
  pill.addEventListener('click', activate);
  pill.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  input.addEventListener('input', sync);
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
    else if (e.key === 'Enter' && input.value.trim()) { e.preventDefault(); location.hash = '#/search?q=' + encodeURIComponent(input.value.trim()); }   // v0.9 (i033): Enter = Search Results
    else if (root.classList.contains('is-open') && e.key === 'ArrowDown') { e.preventDefault(); setHi(hi + 1); }
    else if (root.classList.contains('is-open') && e.key === 'ArrowUp') { e.preventDefault(); setHi(hi - 1); }
  });
  rows.forEach((r,k) => r.addEventListener('mouseenter', () => setHi(k)));
  document.addEventListener('overlay:dismiss', () => { if (root.classList.contains('is-active')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && root.classList.contains('is-active')) close(); });
  document.addEventListener('mousedown', e => { if (root.classList.contains('is-active') && !root.contains(e.target) && e.target !== dim) close(); });
  const api = { close };
  root.querySelector(".sd-close").addEventListener("click", close);
  return { activate, close };
})();

