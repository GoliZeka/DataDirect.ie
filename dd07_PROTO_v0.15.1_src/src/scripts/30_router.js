/* ===== Router (v0.8): hash routes. Home = the static page as before; every other route renders into #pgView.
   #/                      Home
   #/<cat>                 Parent category (C-PLP template, v0.9)        ?brand=<slug>
   #/<cat>/<child>         Child listing (PLP template, v0.9)            ?f=<preset>  ?brand=<slug>
   #/product/<sku>         Product page (v0.10)
   #/cart  #/checkout[/2|/3|/done]   cart + checkout popup over the current page (v0.11, 35_checkout.js)
   #/quick-order  #/quote[/sent]     Quick Order + Request a quote, same popup (v0.13)
   #/next-phase            Coming in next phase (v0.14.1, links outside the prototype)
   #/campaign/<slug>       Campaign landing page (v0.15, 36_campaign.js)
   samo u kodu: the shells below are placeholders so links and data can be tested; final layouts come from Figma in v0.9+. ===== */
const Catalog = (() => {
  const cat = s => DATA.categories.find(c => c.slug === s);
  const child = (c, s) => c && c.children.find(k => k.slug === s);
  const bySku = s => PRODUCTS.find(p => p.sku === s);
  const list = (c, k) => PRODUCTS.filter(p => p.cat === c && (!k || p.child === k) && p.type !== 'bundle');
  const money = n => '€' + n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const href = p => '#/product/' + encodeURIComponent(p.sku);
  return { cat, child, bySku, list, money, href };
})();

const Router = (() => {
  const home = document.getElementById('pgHome');
  const view = document.getElementById('pgView');
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const { money } = Catalog;
  const ICONS = { // category icons for products without a photo (samo u kodu), 48 px, stroke = text/muted
    computers: '<rect x="9" y="12" width="30" height="19" rx="2"/><path d="M5 36h38"/>',
    displays: '<rect x="6" y="9" width="36" height="23" rx="2"/><path d="M24 32v6M16 39h16"/>',
    accessories: '<rect x="6" y="18" width="36" height="14" rx="3"/><path d="M12 25h2M18 25h2M24 25h2M30 25h2M36 25h0"/>',
    'components-power': '<rect x="13" y="13" width="22" height="22" rx="2"/><path d="M19 8v5M24 8v5M29 8v5M19 35v5M24 35v5M29 35v5M8 19h5M8 24h5M8 29h5M35 19h5M35 24h5M35 29h5"/>',
    'print-pos': '<path d="M15 18V8h18v10"/><rect x="8" y="18" width="32" height="14" rx="2"/><path d="M15 28h18v12H15z"/>',
    networking: '<rect x="7" y="27" width="34" height="9" rx="2"/><path d="M13 31.5h2M19 31.5h2M24 27v-8M17 17a10 10 0 0 1 14 0M13 13a16 16 0 0 1 22 0"/>',
    'servers-storage': '<rect x="9" y="8" width="30" height="10" rx="2"/><rect x="9" y="19" width="30" height="10" rx="2"/><rect x="9" y="30" width="30" height="10" rx="2"/><path d="M14 13h2M14 24h2M14 35h2"/>',
    software: '<rect x="8" y="10" width="32" height="28" rx="3"/><path d="M8 17h32M19 25l-4 4 4 4M29 25l4 4-4 4"/>',
    'mobile-tablets': '<rect x="15" y="6" width="18" height="36" rx="3"/><path d="M22 37h4"/>',
    audiovisual: '<rect x="6" y="14" width="26" height="20" rx="3"/><path d="M32 21l10-5v16l-10-5"/>',
    bundle: '<path d="M8 17l16-8 16 8v15l-16 8-16-8z"/><path d="M8 17l16 8 16-8M24 25v15"/>'
  };
  const icon = k => `<svg class="pv-ic" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k] || ICONS.bundle}</svg>`;
  const pic = p => p.img && ASSETS['p/' + p.img]
    ? `<img alt="" src="${ASSETS['p/' + p.img]}">` : icon(p.type === 'bundle' ? 'bundle' : p.cat);
  const stockCls = s => /^in stock/i.test(s) ? 'ok' : /low/i.test(s) ? 'low' : /to order/i.test(s) ? 'order' : 'req';   // v0.9 (i081): 4 states
  const crumbs = items => `<nav class="pv-crumbs t-caption" aria-label="Breadcrumb">${items.map((it, k) =>
    k < items.length - 1 ? `<a href="${it[1]}">${esc(it[0])}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(it[0])}</span>`).join('')}</nav>`;
  const shellTag = t => `<p class="pv-shell t-caption">${esc(t)}</p>`;
  const pages = {
    // v0.9 (i030 / i031): parent + listing come from the PLP template (33_plp.js)
    parent: (c, q) => PLP.render(c, null, q),
    child: (c, k, q) => PLP.render(c, k, q),
    product(p) {
      const c = Catalog.cat(p.cat), k = Catalog.child(c, p.child);
      const isB = p.type === 'bundle';
      const trail = [['Home', '#/'], [c.name, '#/' + c.slug]];
      if (k && !isB) trail.push([k.name, `#/${c.slug}/${k.slug}`]);
      trail.push([p.name, '']);
      return { title: p.name, html: crumbs(trail) + shellTag('v0.8 shell: Product page layout comes in v0.10') +
        `<div class="pv-pdp"><div class="pv-pdp-pic">${pic(p)}</div><div class="pv-pdp-info">` +
        `<p class="t-caption-upper pv-eyebrow">${esc(isB ? 'Bundle · ' + p.items.length + ' items' : p.brand)}</p><h1 class="t-h2">${esc(p.name)}</h1>` +
        `<p class="t-caption pv-muted">SKU ${esc(p.sku)}${isB ? '' : ' · MPN ' + esc(p.mpn)}</p>` +
        `<ul class="pv-spec t-small">${(isB ? p.items : p.specs).map(s => `<li>${esc(s)}</li>`).join('')}</ul>` +
        `<div class="pv-price">${p.was ? `<span class="pv-was t-small">${money(p.was)}</span>` : ''}<span class="t-h2">${money(p.price)}</span><span class="t-small pv-vat">ex VAT</span></div>` +
        `<p class="pv-stock t-small is-${stockCls(p.stock)}">${esc(p.stock)}${p.qty ? ' · ' + p.qty + ' available' : ''}</p></div></div>` };
    },
    // v0.14.1 (i093): one shell for every link that is outside the prototype (samo u kodu, same layout as Page not found)
    nextPhase: () => ({ title: 'Coming in next phase', html: crumbs([['Home', '#/'], ['Coming in next phase', '']]) +
      `<h1 class="t-h1">Coming in next phase</h1><p class="t-body pv-desc">This part of the site is planned for a later phase. The prototype covers the buying journey: browse, product pages, cart, checkout, quick order and quotes.</p><p><a class="t-small-sb pv-go" href="#/">Back to Home  →</a></p>` }),
    notFound: () => ({ title: 'Page not found', html: crumbs([['Home', '#/'], ['Not found', '']]) +
      `<h1 class="t-h1">Page not found</h1><p class="t-body pv-desc">This page is not part of the prototype yet.</p><p><a class="t-small-sb pv-go" href="#/">Back to Home  →</a></p>` })
  };

  const parse = () => {
    const raw = location.hash.replace(/^#\/?/, '');
    const [path, qs] = raw.split('?');
    return { parts: path.split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(qs || '') };
  };
  let first = true, pageKey = null, pageHash = '#/';
  // v0.11 (i040 / i041): #/cart and #/checkout[/2|/3|/done] open the popup over the page that is already rendered
  // (on a direct load that page is Home). Any other route closes the popup; going back to the same page does not re-render it.
  const render = (opts = {}) => {
    const { parts, q } = parse();
    if (['cart', 'checkout', 'quick-order', 'quote'].includes(parts[0])) {   // v0.13: + Quick Order / RFQ
      if (pageKey === null) renderPage([], new URLSearchParams(), opts);
      if (typeof MegaMenu !== 'undefined' && MegaMenu) MegaMenu.close();
      if (typeof MiniCart !== 'undefined') MiniCart.close();
      if (typeof Search !== 'undefined' && document.getElementById('search').classList.contains('is-active')) Search.close();
      CheckoutPopup.show(parts, pageHash, q);
      first = false; return;
    }
    const wasOpen = CheckoutPopup.isOpen();
    CheckoutPopup.hide();
    const key = location.hash.replace(/^#\/?/, '');
    pageHash = '#/' + key;
    if (wasOpen && key === pageKey) return;   // closed the popup: the page under it stays as it was
    renderPage(parts, q, opts);
  };
  const renderPage = (parts, q, opts) => {
    pageKey = parts.length ? location.hash.replace(/^#\/?/, '') : '';
    PLP.leave();
    if (typeof MegaMenu !== 'undefined' && MegaMenu) MegaMenu.close();
    if (typeof MiniCart !== 'undefined') MiniCart.close();   // v0.8.1 (i065): every page change closes the mini cart
    if (typeof Search !== 'undefined' && document.getElementById('search').classList.contains('is-active')) Search.close();
    if (!parts.length) {
      view.hidden = true; view.innerHTML = ''; home.hidden = false;
      document.title = 'DataDirect Home'; document.body.dataset.route = 'home';
    } else {
      let r;
      const [a, b] = parts;
      if (a === 'next-phase') r = pages.nextPhase();   // v0.14.1 (i093)
      else if (a === 'campaign') { r = Campaign.render(b) || pages.notFound(); }   // v0.15 (i073)
      else if (a === 'product') { const p = Catalog.bySku(b); r = p ? PDP.render(p) : pages.notFound(); }   // v0.10 (i036 / i037)
      else if (a === 'search') r = PLP.search(q);   // v0.9 (i033)
      else { const c = Catalog.cat(a); const k = Catalog.child(c, b);
             r = !c ? pages.notFound() : !b ? pages.parent(c, q) : !k ? pages.notFound()
               : parts[2] === 'compare' ? PLP.compare(c, k, q) : parts[2] ? pages.notFound() : pages.child(c, k, q); }   // v0.9 (i034): #/<cat>/<child>/compare?skus=
      view.innerHTML = (r.state || r.pdp) ? r.html : `<div class="pv-wrap">${r.html}</div>`;   // PLP + PDP pages are full width   // v0.9: PLP pages are full width
      view.querySelectorAll('[data-link]').forEach(el => { if (el.tagName === 'A') el.setAttribute('href', LINKS[el.dataset.link] || '#'); });
      Counter.bind(view); Rails.bind(view);
      home.hidden = true; view.hidden = false;
      document.title = r.title + ' · DataDirect'; document.body.dataset.route = a;
    }
    if (!first && !opts.keepScroll) window.scrollTo(0, 0);
    first = false;
  };
  addEventListener('hashchange', () => render());
  render();
  return { render, go: h => { location.hash = h; } };
})();
