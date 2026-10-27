/* ===== MiniCart (v0.6): front-only DEMO cart. Max 7 lines, Add adds the counter quantity, counter goes back to 1.
   Same product again = more Qty on the same line. Badge = number of lines.
   v0.6.1: no dim / blur (Overlay is kept for search and, later, the checkout popup).
   v0.6.2: after Add the mini cart is fixed bottom-right: 24 px from the screen edge, or 24 px inside the right edge
   of the 1440 frame on wider screens (= Figma x 1016). Cart button keeps the header spot (y 64).
   v0.6.3: on screens >= 2336 it sits outside the frame (frame right edge + 24), see v063.css. ===== */
const MiniCart = (() => {
  const el = document.getElementById('miniCart');
  const list = el.querySelector('.mc-items');
  const title = el.querySelector('.mc-title');
  const count = el.querySelector('.mc-cn');
  const btn = document.getElementById('cartBtn');
  const MAX_LINES = 7, MAX_QTY = 9999;
  // SKU from DEMO / Cart Item 3274:1872 (7 fixed products); search rows carry their own; everything else = DEMO
  const DEMO_SKU = {
    'HP ProBook 450 G10 15.6" Intel Core i5 16GB 512GB SSD': '8A5K5EA',
    'Lenovo ThinkPad E16 Gen 1 16" Intel Core i7 16GB 512GB SSD': '21JT000QUK',
    'Dell Latitude 5540 15.6" Intel Core i7 16GB 256GB SSD': 'N024L554015',
    'Apple MacBook Air 13" M3 Chip 8GB 256GB SSD': 'MRXV3ZP/A',
    'ASUS ExpertBook B5 Flip 14" Intel Core i5 16GB 512GB SSD': 'B5402FEA',
    'HP EliteBook 840 G10 14" Intel Core i7 16GB 512GB SSD': '819T4EA',
    'Microsoft Surface Laptop 5 13.5" Intel Core i5 16GB 512GB SSD': 'RBG-00027'
  };
  const lines = [];
  const money = n => '€' + n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = s => parseFloat(String(s).replace(/[^0-9.]/g, '')) || 0;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  // v0.12: product photo in the row (Cart / Line Item Size=Compact has a thumb); DEMO lines without a product keep the grey tile
  const thumb = l => { const p = PRODUCTS.find(x => x.sku === l.sku) || PRODUCTS.find(x => x.name === l.name);
    return p && p.img && ASSETS['p/' + p.img] ? `<img alt="" src="${ASSETS['p/' + p.img]}">` : ''; };
  // v0.13.2 (i089): Quantity Counter Size=Mini (5831:3385) in each row; line price = unit price x quantity (decided 21 Oct, i017)
  const MI = { minus: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H13" stroke-width="2" stroke="currentColor"/></svg>',
    plus: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H13M8 3V13" stroke-width="2" stroke="currentColor"/></svg>' };
  const maxOf = l => { const p = PRODUCTS.find(x => x.sku === l.sku); return p && p.qty > 0 ? p.qty : MAX_QTY; };
  const mini = l => `<div class="qty qty-m" data-max="${maxOf(l)}"><button class="qty-btn dec" aria-label="Decrease">${MI.minus}</button>` +
    `<input class="qty-val" type="text" inputmode="numeric" maxlength="4" value="${l.qty}" role="spinbutton" aria-label="Quantity" aria-valuemin="1">` +
    `<button class="qty-btn inc" aria-label="Increase">${MI.plus}</button></div>`;
  const bindRows = () => { Counter.bind(list);
    list.querySelectorAll('.mc-row').forEach((row, i) => { const l = lines[i], q = row.querySelector('.qty'); if (!l || !q) return;
      const c = Counter.all.find(x => x.el === q); if (c) c.set(l.qty);
      q.addEventListener('qty:set', e => { if (e.detail.value === l.qty) return; l.qty = e.detail.value;
        row.querySelector('.mc-amt').textContent = money(l.unit * l.qty); }); }); };
  let mode = 'view';
  const render = () => {
    const empty = lines.length === 0;
    el.classList.toggle('is-empty', empty);
    title.textContent = empty ? 'Your cart' : mode === 'added' ? '✓  Added to cart' : mode === 'full' ? 'Cart is full (7 items)' : 'Your cart';
    count.textContent = lines.length;
    list.innerHTML = lines.map((l, i) =>
      `<div class="mc-row"><div class="mc-thumb">${thumb(l)}</div><div class="mc-info"><p class="mc-name">${esc(l.name)}</p><p class="mc-sku">SKU: ${esc(l.sku)}</p></div>` +
      `<div class="mc-price"><p class="mc-amt">${money(l.unit * l.qty)}</p>${mini(l)}</div>` +   // v0.13.2: mini counter instead of "Qty N"
      `<button class="mc-rm" type="button" data-i="${i}" aria-label="Remove ${esc(l.name)}">✕</button></div>`).join('');   // v0.13.1: ✕ per row
    bindRows();
    Cart.count = lines.length; Cart.render();
  };
  const isOpen = () => !el.hidden;
  const search = document.getElementById('search');
  // v0.12 (i082): first item in an empty cart = short focus blur behind the floating card (fade in / out, ~1 s, no click block).
  // i083: the floating card (after Add / Cart is full) fades out after 5 s if the pointer never went over it; one hover keeps it open.
  // Figma: DEV NOTE next to Overlay / Mini Cart (30_PLP_SEARCH). Click on Cart (view) is not timed.
  const flash = document.createElement('div'); flash.className = 'mc-flash'; flash.setAttribute('aria-hidden', 'true');
  el.parentNode.insertBefore(flash, el);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const blur = () => { if (reduce.matches) return; flash.classList.remove('is-on'); void flash.offsetWidth; flash.classList.add('is-on'); };
  flash.addEventListener('animationend', () => flash.classList.remove('is-on'));
  const AUTO_MS = 5000, FADE_MS = 300;
  let timer = 0, fadeT = 0, hovered = false;
  const stopTimer = () => { clearTimeout(timer); clearTimeout(fadeT); timer = fadeT = 0; el.classList.remove('is-leaving'); };
  el.addEventListener('mouseenter', () => { hovered = true; stopTimer(); });
  const open = m => {
    // v0.7.1: samo klik na Cart (view) zatvara search; Add iz search liste ostavlja listu otvorenu
    if (m === 'view' && search && search.classList.contains('is-active')) Search.close();
    mode = m; render(); el.hidden = false; el.classList.toggle('is-float', m !== 'view');
    stopTimer(); hovered = false;
    if (m !== 'view') timer = setTimeout(() => { if (hovered || !isOpen()) return;
      el.classList.add('is-leaving'); fadeT = setTimeout(close, reduce.matches ? 0 : FADE_MS); }, AUTO_MS);
  };
  const close = () => { stopTimer(); if (!isOpen()) return; el.hidden = true; el.classList.remove('is-float'); };
  // v0.8.5 (i015 / i068): while the search panel is open, Add only updates the cart and pulses the badge (Added state on the button
  // is the feedback); the mini cart does not open over the panel. "Cart is full" still opens it, because the Add did not happen.
  const pulse = () => { btn.classList.remove('is-pulse'); void btn.offsetWidth; btn.classList.add('is-pulse'); };
  const added = () => { if (search && search.classList.contains('is-active')) { render(); pulse(); } else open('added'); };
  const add = item => {
    const hit = lines.find(l => l.name === item.name);
    if (hit) { hit.qty = Math.min(MAX_QTY, hit.qty + item.qty); added(); return true; }
    if (lines.length >= MAX_LINES) { open('full'); return false; }
    const first = lines.length === 0;
    lines.push(item); added();
    if (first && isOpen() && el.classList.contains('is-float')) blur();   // i082: only when the card really opened
    return true;
  };
  // Add buttons: search panel rows, single maxi, bundle maxi
  const read = atc => {
    // v0.9 / v0.10: anything that carries its SKU (PLP card, comparison button, PDP buy box, PDP rail cards)
    const own = !atc.closest('.sd-item') && atc.closest('[data-sku]');
    const p0 = own && PRODUCTS.find(x => x.sku === own.dataset.sku);
    if (p0) { const q = own.querySelector('.qty'); const c = q && Counter.all.find(x => x.el === q);
      return { item: { name: p0.name, sku: p0.sku, unit: p0.price, qty: c ? c.value : 1 }, ctr: c }; }
    const sd = atc.closest('.sd-item'), pm = atc.closest('.pmaxi, .plc'), bm = atc.closest('.bmaxi');   // v0.9: .plc = PLP card
    const box = sd || pm || bm; if (!box) return null;
    const q = box.querySelector('.qty');
    const ctr = q && Counter.all.find(c => c.el === q);
    let name, price, sku;
    if (sd) {
      name = sd.querySelector('.sd-info .name').textContent.trim();
      const amts = sd.querySelectorAll('.sd-price .amt'); price = amts[amts.length - 1].textContent;
      const meta = (sd.querySelector('.sd-info .meta') || {}).textContent || '';
      sku = sd.classList.contains('is-bundle') ? 'DEMO' : meta.split('·')[0].trim();
    } else {
      name = box.querySelector('.nm').textContent.trim();
      price = box.querySelector('.price .amt').textContent;
    }
    sku = sku || box.dataset.sku || DEMO_SKU[name] || 'DEMO';
    return { item: { name, sku, unit: num(price), qty: ctr ? ctr.value : 1 }, ctr };
  };
  document.addEventListener('click', e => {
    const atc = e.target.closest('.atc'); if (!atc) return;
    const r = read(atc); if (!r) return;
    e.preventDefault(); e.stopPropagation();
    if (add(r.item) && r.ctr) r.ctr.reset();
  }, true);
  btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); isOpen() ? close() : open('view'); });
  el.querySelector('.mc-x').addEventListener('click', close);
  // v0.13.1: ✕ on a row removes it; Clear cart (right of the count) empties the cart -> empty state. Figma: PLP / Mini Cart / Desktop 3275:30795
  list.addEventListener('click', e => { const b = e.target.closest('.mc-rm'); if (!b) return; e.stopPropagation(); lines.splice(+b.dataset.i, 1); mode = 'view'; render(); });
  el.querySelector('.mc-clear').addEventListener('click', e => { e.stopPropagation(); lines.length = 0; mode = 'view'; render(); });
  addEventListener('resize', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) close(); });
  document.addEventListener('mousedown', e => { if (isOpen() && !el.contains(e.target) && !btn.contains(e.target) && !e.target.closest('.atc') && e.target !== Overlay.el) close(); });
  // v0.11 (i040 / i041): the cart popup edits the same lines (quantity, remove) and the order clears them
  const setQty = (i, q) => { if (lines[i]) { lines[i].qty = Math.min(MAX_QTY, Math.max(1, q)); render(); } };
  const remove = i => { lines.splice(i, 1); render(); };
  const clear = () => { lines.length = 0; render(); };
  render();
  return { add, open, close, lines, setQty, remove, clear };
})();

