/* ===== Overlay: one shared dim + blur layer for every popup ===== */
const Overlay = (() => {
  const el = document.getElementById('dim');
  let owner = null;
  return {
    open(o){ if (owner && owner !== o && owner.close) owner.close(); owner = o; document.body.classList.add('overlay-open'); },
    close(o){ if (!o || owner === o) { owner = null; document.body.classList.remove('overlay-open'); } },
    el
  };
})();
Overlay.el.addEventListener('click', () => { const o = Overlay; document.dispatchEvent(new CustomEvent('overlay:dismiss')); });

