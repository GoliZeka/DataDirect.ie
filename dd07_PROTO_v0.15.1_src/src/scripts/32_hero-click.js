/* ===== Hero card click (v0.8, tracker i027): a card visible at least ~1/2 in the window opens its link;
   a mostly hidden card (the peeking ones at the edges) first slides into view, the next click opens it. ===== */
(() => {
  const root = document.getElementById('heroCarousel');
  if (!root) return;
  document.addEventListener('click', e => {
    const card = e.target.closest('#heroCarousel .h11');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const seen = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
    if (seen >= r.width / 2) return;                     // normal link click (22_links-click)
    e.preventDefault(); e.stopPropagation();
    Carousel.go(r.left + r.width / 2 < innerWidth / 2 ? -1 : 1);
  }, true);
})();
