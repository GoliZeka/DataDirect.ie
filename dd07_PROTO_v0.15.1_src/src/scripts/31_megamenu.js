/* ===== Mega Menu (v0.8): built from DATA. Figma: Overlay / Mega Menu 2891:12167 (Navigation / Mega Menu / Desktop) + DEV NOTE
   - hover on a rail item (~150 ms) opens the menu on that category; "All Categories" opens it on Computers (or the last one)
   - hover on the left list switches the panel; click goes to the Parent page; column heading / "View all <child>" -> Child listing
   - 3rd level items = filter presets on the Child listing (?f=<slug>); Shop by Brand -> Parent page (?brand=<slug>)
   - Esc, click outside (dim) or leaving rail + menu with the mouse (~300 ms) closes. Shared Overlay (dim + blur) like search.
   samo u kodu: "View all ..." links that match no column go to the end of the last column; hover colour on links. ===== */
const MegaMenu = (() => {
  const el = document.getElementById('megaMenu');
  const rail = document.querySelector('.gh-rail');
  if (!el || !rail) return null;
  const OPEN_MS = 150, CLOSE_MS = 300;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const cats = DATA.categories;
  let cur = cats[0].slug, tOpen = 0, tClose = 0;

  const colHtml = (c, col, extra) => {
    const href = it => col.brand ? `#/${c.slug}?brand=${it.slug}` : `#/${c.slug}/${col.child}?f=${it.slug}`;
    const head = col.child ? `<a class="mm-colhead" href="#/${c.slug}/${col.child}">${esc(col.head)}</a>`
                           : `<p class="mm-colhead">${esc(col.head)}</p>`;
    const links = col.items.map(it => `<a class="mm-link" href="${href(it)}">${esc(it.label)}</a>`).join('');
    const more = extra.map(l => `<a class="mm-link" href="${l.href}">${esc(l.label)}</a>`).join('');
    return `<div class="mm-col">${head}<div class="mm-colsp"></div>${links}${more}</div>`;
  };
  const panel = c => {
    const cols = c.menu.columns;
    const extras = cols.map(() => []);
    c.menu.links.forEach(l => {
      let k = -1, href = `#/${c.slug}`;
      if (l.child === '#brands') k = cols.findIndex(x => x.brand);
      else if (l.child) { k = cols.findIndex(x => x.child === l.child); href = `#/${c.slug}/${l.child}`; }
      extras[k >= 0 ? k : cols.length - 1].push({ label: l.label, href });
    });
    const f = DATA.menuFooter;
    return `<a class="mm-title" href="#/${c.slug}">${esc(c.name)}</a><div class="mm-div"></div>` +
      `<div class="mm-cols">${cols.map((col, k) => colHtml(c, col, extras[k])).join('')}</div><div class="mm-flex"></div>` +
      `<div class="mm-support"><a class="mm-box" data-link="mm-book-a-call"><p class="mm-bt">${esc(f.title)}</p><p class="mm-bl">${esc(f.actions[0])}</p></a>` +
      `<a class="mm-box" data-link="mm-request-a-quote"><p class="mm-bt">${esc(f.actions[1])}</p><p class="mm-bn">${esc(f.note)}</p></a></div>`;
  };
  el.innerHTML = `<div class="mm-index"><p class="mm-eyebrow">All Product Categories</p><div class="mm-hsp"></div><div class="mm-list">` +
    cats.map(c => `<a class="mm-cat" href="#/${c.slug}" data-cat="${c.slug}">${esc(c.name)}</a>`).join('') +
    `</div></div><div class="mm-content"></div>`;
  const content = el.querySelector('.mm-content');
  el.querySelectorAll('[data-link]').forEach(a => a.setAttribute('href', LINKS[a.dataset.link] || '#'));

  const show = slug => {
    const c = cats.find(x => x.slug === slug) || cats[0];
    if (c.slug === cur && content.childElementCount) return;
    cur = c.slug; content.innerHTML = panel(c);
    content.querySelectorAll('[data-link]').forEach(a => a.setAttribute('href', LINKS[a.dataset.link] || '#'));
    el.querySelectorAll('.mm-cat').forEach(a => a.classList.toggle('is-active', a.dataset.cat === cur));
  };
  const isOpen = () => !el.hidden;
  const open = slug => {
    clearTimeout(tOpen); clearTimeout(tClose);
    show(slug || cur);
    if (isOpen()) return;
    el.hidden = false; Overlay.open(api);
    rail.querySelectorAll('.rail-item').forEach(a => a.setAttribute('aria-expanded', 'true'));
  };
  const close = () => {
    clearTimeout(tOpen); clearTimeout(tClose);
    if (!isOpen()) return;
    el.hidden = true; Overlay.close(api);
    rail.querySelectorAll('.rail-item').forEach(a => a.setAttribute('aria-expanded', 'false'));
  };
  const api = { close };
  const later = () => { clearTimeout(tOpen); clearTimeout(tClose); tClose = setTimeout(close, CLOSE_MS); };
  const keep = () => clearTimeout(tClose);

  // rail: data-cat on each item (All Categories = no slug)
  rail.querySelectorAll('.rail-item').forEach(a => {
    const name = a.textContent.trim();
    const c = cats.find(x => x.name === name);
    a.dataset.cat = c ? c.slug : '';
    a.setAttribute('aria-haspopup', 'true'); a.setAttribute('aria-expanded', 'false');
    a.addEventListener('mouseenter', () => {
      keep();
      if (isOpen()) { show(a.dataset.cat || cur); return; }
      clearTimeout(tOpen); tOpen = setTimeout(() => open(a.dataset.cat || cur), OPEN_MS);
    });
  });
  // "All Categories": click toggles (keyboard + touch), never navigates
  const all = rail.querySelector('[data-link="cat-all-categories"]');
  all.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); isOpen() ? close() : open(cur); });
  all.addEventListener('keydown', e => { if (e.key === 'ArrowDown') { e.preventDefault(); open(cur); el.querySelector('.mm-cat.is-active').focus(); } });
  rail.addEventListener('mouseleave', () => { clearTimeout(tOpen); if (isOpen()) later(); });
  rail.addEventListener('mouseenter', keep);
  el.addEventListener('mouseenter', keep);
  el.addEventListener('mouseleave', later);
  el.addEventListener('mouseover', e => { const a = e.target.closest('.mm-cat'); if (a) show(a.dataset.cat); });
  el.addEventListener('focusin', e => { const a = e.target.closest('.mm-cat'); if (a) show(a.dataset.cat); });
  // any link inside the menu (or a rail category) navigates and closes
  el.addEventListener('click', e => { if (e.target.closest('a[href^="#/"]')) close(); });
  rail.addEventListener('click', e => { const a = e.target.closest('.rail-item'); if (a && a.dataset.cat) close(); });
  document.addEventListener('overlay:dismiss', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) { close(); all.focus(); } });
  document.addEventListener('mousedown', e => { if (isOpen() && !el.contains(e.target) && !rail.contains(e.target) && e.target !== Overlay.el) close(); });
  show(cur);
  return { open, close, show, get isOpen(){ return isOpen(); } };
})();
