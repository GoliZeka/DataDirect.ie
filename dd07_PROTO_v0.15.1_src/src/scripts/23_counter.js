/* ===== Counter: every Quantity Counter on the page. Model A (quantity to add), min 1, max data-max or 9999.
   +/- = one step; click the number and type (digits only, 4 max); Enter/blur commits, Esc reverts, Up/Down = one step. ===== */
const Counter = (() => {
  const all = [];
  // v0.9: bind(root) also wires counters rendered later (PLP cards); counters that left the page are dropped
  const bind = root => { for (let i = all.length - 1; i >= 0; i--) if (!all[i].el.isConnected) all.splice(i, 1);
  root.querySelectorAll('.qty').forEach(el => { if (el.dataset.bound) return; el.dataset.bound = '1';
    const dec = el.querySelector('.qty-btn.dec'), inc = el.querySelector('.qty-btn.inc');
    const field = el.querySelector('input.qty-val');
    let max = Math.min(9999, parseInt(el.dataset.max || '9999', 10));
    const emit = (type, detail) => el.dispatchEvent(new CustomEvent(type, { bubbles: true, detail: Object.assign({ value, max }, detail) }));   // v0.8.3
    let value = 1;
    const valid = s => /^\d{1,4}$/.test(s) && +s >= 1 && +s <= max;
    const paint = () => {
      dec.classList.toggle('is-min', value <= 1); inc.classList.toggle('is-max', value >= max);
      dec.setAttribute('aria-disabled', value <= 1); inc.setAttribute('aria-disabled', value >= max);
      field.setAttribute('aria-valuenow', value);
    };
    const set = v => { value = Math.min(max, Math.max(1, v)); field.value = value; el.classList.remove('is-error'); paint(); emit('qty:set'); };
    // v0.8.3: a typed number over the stock is clamped to the stock (Stock Limit), anything else invalid reverts
    const commit = () => {
      const d = field.value;
      if (valid(d)) set(+d);
      else if (/^\d{1,4}$/.test(d) && +d > max) { set(max); emit('qty:clamped', { asked: +d }); }
      else set(value);
    };
    dec.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (value > 1) set(value - 1); });
    inc.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (value < max) set(value + 1); });
    field.addEventListener('click', e => e.stopPropagation());
    field.addEventListener('focus', () => { el.classList.add('is-focus'); field.select(); });
    field.addEventListener('blur', () => { el.classList.remove('is-focus'); commit(); });
    field.addEventListener('input', () => {
      const digits = field.value.replace(/\D/g, '').slice(0, 4);
      if (digits !== field.value) field.value = digits;
      el.classList.toggle('is-error', !valid(digits));          // empty, 0 or over max = Error while typing
      emit('qty:typing', { typed: digits === '' ? 0 : +digits });
    });
    field.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); commit(); field.select(); }
      else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); set(value); field.blur(); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault(); const base = valid(field.value) ? +field.value : value;
        set(base + (e.key === 'ArrowUp' ? 1 : -1)); field.select();
      }
    });
    set(1);
    all.push({ el, get value(){ return value; }, get max(){ return max; }, set, reset: () => set(1),
      setMax(n){ max = Math.min(9999, Math.max(1, n || 9999)); field.setAttribute('aria-valuemax', max); if (value > max) set(max); else paint(); } });   // reset() = after Add (v0.6)
  }); };
  bind(document);
  return { all, bind };
})();

