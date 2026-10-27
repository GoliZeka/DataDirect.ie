/* ===== Card states (v0.8.3, tracker i013) - samo u kodu: Figma has no Added / Volume Nudge / Stock Limit states yet.
   - Stock: every counter gets max = DEMO stock of its product (PRODUCTS.qty via the LINKS route); 0 = to order = no limit.
   - Stock Limit: typing more than the stock shows "Only N in stock"; Enter / leaving the field sets the quantity to N.
   - Volume Nudge: 25 or more shows "Ordering 25+? Get a volume quote  →" above the counter.
   - Added ✓: after a successful Add the button shows "✓ Added" for 1.5 s, then goes back. ===== */
const CardStates = (() => {
  const NUDGE = 25, ADDED_MS = 1500;
  const skuOf = el => {
    const box = el.closest('[data-link]');
    const u = box && LINKS[box.dataset.link];
    const m = u && u.match(/^#\/product\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  };
  // 1. stock per counter
  Counter.all.forEach(c => {
    const sku = skuOf(c.el); const p = sku && PRODUCTS.find(x => x.sku === sku);
    if (p && p.qty > 0) c.setMax(p.qty);
  });
  // 2. hint bubble (one per counter, created on demand, lives inside the counter so hover cards stay open)
  const hint = el => el.querySelector('.qhint') || el.appendChild(Object.assign(document.createElement('div'), { className: 'qhint', role: 'status' }));
  const show = (el, kind, html) => { const h = hint(el); h.className = 'qhint is-' + kind; h.innerHTML = html; h.hidden = false; };
  const hide = el => { const h = el.querySelector('.qhint'); if (h) h.hidden = true; };
  const nudge = el => show(el, 'nudge', `Ordering ${NUDGE}+? <a data-link="qty-volume-quote" href="${LINKS['qty-volume-quote'] || '#'}">Get a volume quote  →</a>`);
  const timers = new WeakMap();
  const later = (el, ms) => { clearTimeout(timers.get(el)); timers.set(el, setTimeout(() => {
    const c = Counter.all.find(x => x.el === el); if (c && c.value >= NUDGE) nudge(el); else hide(el); }, ms)); };
  document.addEventListener('qty:typing', e => {
    const el = e.target, { typed, max } = e.detail; clearTimeout(timers.get(el));
    if (typed > max) show(el, 'limit', `Only ${max} in stock`);
    else if (typed >= NUDGE) nudge(el); else hide(el);
  });
  document.addEventListener('qty:set', e => { const el = e.target; clearTimeout(timers.get(el)); e.detail.value >= NUDGE ? nudge(el) : hide(el); });
  document.addEventListener('qty:clamped', e => { const el = e.target;
    show(el, 'limit', `Only ${e.detail.max} in stock · quantity set to ${e.detail.max}`); later(el, 2500); });
  // 3. Added ✓ (MiniCart handles Add in the document capture phase; window capture runs first, so we read the cart before and after)
  const total = () => MiniCart.lines.reduce((s, l) => s + l.qty, 0);
  const CHECK = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  window.addEventListener('click', e => {
    const atc = e.target.closest('.atc'); if (!atc || atc.classList.contains('is-added')) return;
    const before = total(), q = (atc.closest('.sd-item, .pmaxi, .bmaxi, .plc, .plr, .pdp-bb') || document).querySelector('.qty');
    setTimeout(() => {
      if (total() <= before) return;
      if (!atc.dataset.label) atc.dataset.label = atc.innerHTML;
      atc.innerHTML = CHECK + 'Added'; atc.classList.add('is-added'); atc.setAttribute('aria-live', 'polite');
      if (q) hide(q);
      setTimeout(() => { atc.innerHTML = atc.dataset.label; atc.classList.remove('is-added'); }, ADDED_MS);
    }, 0);
  }, true);
  return { NUDGE };
})();
