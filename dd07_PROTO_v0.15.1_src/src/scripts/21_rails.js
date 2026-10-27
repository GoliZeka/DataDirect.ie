/* ===== Rail: product rails, 4 visible (data-visible overrides, bundles = 3 since v0.8.5), step 1 card, arrows disabled at the ends.
   v0.10: Rails.bind(root) also wires rails rendered later (PDP). ===== */
const Rails = (() => {
  const all = [];
  const make = root => {
    const track = root.querySelector('.rail-track');
    const prev = root.querySelector('.rail-arrow.prev'), next = root.querySelector('.rail-arrow.next');
    const VISIBLE = +(root.dataset.visible || 4), max = Math.max(0, track.children.length - VISIBLE);
    let i = 0;
    const render = () => {
      track.style.setProperty('--ri', i);
      prev.setAttribute('aria-disabled', i === 0); next.setAttribute('aria-disabled', i === max);
      [...track.children].forEach((c, k) => { const v = k >= i && k < i + VISIBLE; c.inert = !v; });
    };
    const go = d => { const n = Math.min(max, Math.max(0, i + d)); if (n !== i) { i = n; render(); } };
    prev.addEventListener('click', () => go(-1)); next.addEventListener('click', () => go(1));
    render();
    return { root, go, get index(){ return i; }, max };
  };
  const bind = scope => { for (let k = all.length - 1; k >= 0; k--) if (!all[k].root.isConnected) all.splice(k, 1);
    scope.querySelectorAll('[data-rail]').forEach(r => { if (r.dataset.railBound) return; r.dataset.railBound = '1'; all.push(make(r)); }); };
  bind(document);
  return Object.assign(all, { bind });
})();
