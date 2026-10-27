
/* ===== Carousel: hero, infinite (clones: 2 before, 2 after), arrows only ===== */
const Carousel = (() => {
  const root = document.getElementById('heroCarousel');
  const track = document.getElementById('hcPages');
  const pages = [...track.children];               // [clones..., real 1..REAL, clones...]
  const REAL = +(track.dataset.real || 6), LEAD = +(track.dataset.lead || 2);
  const VIS = +(track.dataset.visible || 1);
  let i = LEAD + +(track.dataset.start ?? 3);      // v1.1: start on card 1 (iPhone); v0.4: page 4
  let busy = false;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const set = (n, anim) => {
    track.classList.toggle('no-anim', !anim);
    track.style.setProperty('--hc-i', n);
    if (!anim) void track.offsetWidth;             // commit jump before re-enabling transition
    pages.forEach((p, k) => {
      if (p.classList.contains('is-clone')) return;
      const on = [0, REAL, -REAL].some(o => k - o >= n && k - o < n + VIS);
      p.toggleAttribute('aria-current', on && (k === n || k === n + REAL || k === n - REAL));
      p.setAttribute('aria-hidden', on ? 'false' : 'true');
      p.setAttribute('tabindex', on ? '0' : '-1');   // v0.5.4: no inert, so every card reacts to hover
    });
  };
  const normalize = () => {
    if (i < LEAD) { i += REAL; set(i, false); }
    else if (i >= LEAD + REAL) { i -= REAL; set(i, false); }
    busy = false;
  };
  const go = d => {
    if (busy) return;
    busy = true; i += d; set(i, true);
    if (reduce.matches) normalize();
  };
  track.addEventListener('transitionend', e => { if (e.target === track && e.propertyName === 'transform') normalize(); });
  document.getElementById('hcPrev').addEventListener('click', () => go(-1));
  document.getElementById('hcNext').addEventListener('click', () => go(1));
  root.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });
  set(i, false);
  return { go, get index(){ return ((i - LEAD) % REAL + REAL) % REAL + 1; } };
})();

