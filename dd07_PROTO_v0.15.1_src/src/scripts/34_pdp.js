/* ===== PDP (v0.10, m05 - i036 Single / i037 Bundle): one renderer = Figma PDP / Page Template / Desktop 5810:20136 (40_PDP).
   Screens: Single 5810:22999 (HP ProBook 450 G10), Bundle 5810:23498 (Hybrid Desk Starter).
   Parts: Breadcrumbs (Type=Product), Gallery (PDP / Gallery / Carousel 5585:1112), Product Identity, Buy Box
   (Commerce / Buy Box / PDP 5810:1758, Type=Single | Bundle), Product Overview, Information Panel (tabs), rails, CTA Band.
   PDP_DATA = the Figma content for the two designed products. Every other product uses the same layout filled from the
   DEMO catalogue (samo u kodu: shorter overview, specs from the catalogue, one image or none). ===== */
const PDP_DATA = {
  '8A5K5EA': {
    short: 'HP ProBook 450 G10',
    title: 'HP ProBook 450 G10 15.6" Business Laptop - Intel Core i5-1335U, 16GB DDR4, 512GB NVMe SSD',
    ids: 'SKU: 8A5K5EA  ·  MPN: ProBook 450 G10  ·  EAN: 196786725791',
    images: 10,
    quick: [['Processor', 'Intel Core i5-1335U (10C/12T, up to 4.6 GHz)'], ['Memory', '16 GB DDR4-3200'], ['Storage', '512 GB PCIe NVMe M.2 SSD'],
      ['Display', '15.6" FHD IPS Anti-Glare (1920×1080)'], ['Operating System', 'Windows 11 Pro'], ['Warranty', '1 Year On-Site']],
    overview: ['The HP ProBook 450 G10 combines dependable performance, modern connectivity and business-grade security in a portable 15.6-inch design.',
      'Its Intel Core i5 processor, 16 GB DDR4 memory, 512 GB NVMe SSD and Windows 11 Pro configuration support everyday office work, hybrid collaboration, multi-tasking and standard business-device deployments.'],
    specTitle: 'Technical specifications',
    groups: [
      [['PERFORMANCE', [['Processor', 'Intel Core i5-1335U (10C/12T, up to 4.6 GHz)'], ['Memory', '16 GB DDR4-3200'], ['Storage', '512 GB PCIe NVMe M.2 SSD'], ['Graphics', 'Integrated Intel Graphics']]],
       ['DISPLAY', [['Display size', '15.6-inch'], ['Resolution', 'Full HD (1920 × 1080)'], ['Panel type', 'IPS Anti-Glare']]]],
      [['SOFTWARE & CONNECTIVITY', [['Operating system', 'Windows 11 Pro'], ['Connectivity', 'Wi‑Fi 6E · Bluetooth 5.3'], ['Ports', 'USB-C · USB-A · HDMI · Audio']]],
       ['PHYSICAL & SUPPORT', [['Dimensions & weight', '318 × 224 × 19 mm · 1.4 kg'], ['Warranty', '1-year on-site warranty']]]]]
  },
  'R2G-HDS-01': {
    short: 'Hybrid Desk Starter',
    sub: 'Laptop · Dock · 24″ Monitor',
    images: 3,
    items: [['HP ProBook 450 G10', 'Laptop · 15.6″ · Intel Core i5, 16 GB, 512 GB SSD', 1], ['HP USB-C Dock G5', 'Docking station · USB-C', 2], ['HP E24 G5 FHD Monitor', '24″ FHD monitor', 3]],
    overview: ['Hybrid Desk Starter is a ready-to-go desk setup for a new starter or a hybrid workspace: one business laptop, a single-cable USB-C dock and a 24″ Full HD monitor.',
      'All three items are matched to work together, so IT can order, deploy and support one standard setup instead of three separate products.'],
    specTitle: 'Specifications by item',
    groups: [
      [['LAPTOP · HP PROBOOK 450 G10', [['Processor', 'Intel Core i5-1335U (10C/12T, up to 4.6 GHz)'], ['Memory', '16 GB DDR4-3200'], ['Storage', '512 GB PCIe NVMe M.2 SSD'], ['Display', '15.6″ FHD IPS Anti-Glare (1920 × 1080)']]],
       ['MONITOR · HP E24 G5 FHD', [['Panel', '23.8″ IPS · Full HD (1920 × 1080)'], ['Inputs', 'HDMI · DisplayPort · USB hub'], ['Stand', 'Height, tilt, swivel and pivot']]]],
      [['DOCK · HP USB-C DOCK G5', [['Connection', 'Single USB-C cable to the laptop'], ['Video outputs', '2 × DisplayPort · 1 × HDMI'], ['Ports', 'USB-A · USB-C · RJ-45 Ethernet']]],
       ['BUNDLE', [['Items', '3 · laptop, monitor, dock'], ['Warranty', 'Per item, see Documents tab']]]]]
  }
};

const PDP = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const money = n => '€' + n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const stockCls = s => ({ 'In Stock': 'ok', 'Low Stock': 'low', 'To Order': 'order', 'On Request': 'req' }[s] || 'req');
  const ic = {
    cart: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 2H4.13333L6.26667 14H15.8667L18 5.6H5.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="white"/><circle cx="8.5" cy="16.5" r="1.5" fill="white"/><circle cx="15.5" cy="16.5" r="1.5" fill="white"/></svg>',
    minus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H13" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H8M8 8H13M8 8V3M8 8V13" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor"/></svg>',
    mark: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.5 1.75h7v10.5L7 9.9l-3.5 2.35z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>'
  };
  const qty = max => `<div class="qty qty-d" data-max="${max}"><button class="qty-btn dec is-min" aria-label="Decrease">${ic.minus}</button>` +
    `<input class="qty-val t-small-sb" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" value="1" role="spinbutton" aria-label="Quantity" aria-valuemin="1" aria-valuemax="${max}">` +
    `<button class="qty-btn inc" aria-label="Increase">${ic.plus}</button></div>`;
  const img = k => ASSETS[k] ? `<img alt="" src="${ASSETS[k]}">` : '';
  const pimg = p => p && p.img ? img('p/' + p.img) : '';
  const crumbs = items => `<nav class="plp-row plp-crumbs t-caption" aria-label="Breadcrumb">${items.map((it, k) => k < items.length - 1
    ? `<a href="${it[1]}">${esc(it[0])}</a><span class="sep" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 4.5L10 8l-3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
    : `<span class="t-caption-sb" aria-current="page">${esc(it[0])}</span>`).join('')}</nav>`;

  // ---------- content: Figma data or built from the catalogue ----------
  const content = p => {
    const d = PDP_DATA[p.sku] || {};
    const isB = p.type === 'bundle';
    const f = p.f || {};
    const gal = d.images ? Array.from({ length: d.images }, (_, i) => 'pdp/' + p.sku + '/' + String(i + 1).padStart(2, '0')) : (p.img ? ['p/' + p.img] : []);
    let quick = d.quick, groups = d.groups;
    if (!quick && !isB) {
      quick = p.cat === 'computers'
        ? [['Processor', p.specs[0]], ['Memory', f.ram ? f.ram + ' RAM' : p.specs[1]], ['Storage', f.storage ? f.storage : '-'], ['Display', f.screen ? p.specs[2] : '-'], ['Operating System', f.os || '-']].filter(r => r[1] && r[1] !== '-')
        : p.specs.map((s, i) => ['Key feature ' + (i + 1), s]);
    }
    if (!groups) {
      groups = isB ? [[['BUNDLE', [['Items', p.items.length + ' · ' + p.items.join(', ').toLowerCase()], ['Warranty', 'Per item, see Documents tab']]]], []]
        : p.cat === 'computers'
          ? [[['PERFORMANCE', [['Processor', p.specs[0]], ['Memory', f.ram || '-'], ['Storage', f.storage || '-']]]].concat(f.screen ? [['DISPLAY', [['Display', p.specs[2]]]]] : []),
             [['SOFTWARE', [['Operating system', f.os || '-']]], ['IDENTIFIERS', [['SKU', p.sku], ['MPN', p.mpn]]]]]
          : [[['KEY SPECIFICATIONS', p.specs.map((s, i) => ['Feature ' + (i + 1), s])]], [['IDENTIFIERS', [['SKU', p.sku], ['MPN', p.mpn]]]]];
    }
    return {
      isB, gal, quick, groups,
      short: d.short || p.name,
      title: d.title || p.name,
      ids: d.ids || (isB ? '' : `SKU: ${p.sku}  ·  MPN: ${p.mpn}`),
      sub: d.sub || (isB ? p.items.join(' · ') : ''),
      items: d.items || (isB ? p.items.map(x => [x, 'Included', 0]) : null),
      overview: d.overview || (isB ? [`${p.name} is a ready-to-go set: ${p.items.join(', ').toLowerCase()}, matched to work together.`, 'Order, deploy and support one standard setup instead of separate products.']
        : [`${p.name} from ${p.brand}.`, p.specs.join(' · ') + '.']),
      specTitle: d.specTitle || (isB ? 'Specifications by item' : 'Technical specifications')
    };
  };

  // ---------- parts ----------
  const gallery = (p, c) => {
    const n = c.gal.length;
    const slides = n ? c.gal.map((k, i) => `<div class="gl-slide${i ? '' : ' is-on'}">${img(k)}</div>`).join('') : `<div class="gl-slide is-on is-empty"></div>`;
    const thumbs = c.gal.map((k, i) => `<button class="gl-th${i ? '' : ' is-on'}" type="button" data-th="${i}" aria-label="Image ${i + 1}">${img(k)}</button>`).join('');
    const arrows = n > 5;
    return `<div class="pdp-gal" data-n="${n}">${c.isB ? `<span class="pdp-badge t-caption-sb">${p.items.length} items</span>` : ''}` +
      `<div class="gl-view">${slides}</div>` +
      (n > 1 ? `<div class="gl-strip">${arrows ? `<button class="gl-arr prev t-small-sb" type="button" data-th-step="-1" aria-label="Previous image">←</button>` : ''}` +
        `<div class="gl-row"><div class="gl-rtrack">${thumbs}</div></div>${arrows ? `<button class="gl-arr next t-small-sb" type="button" data-th-step="1" aria-label="Next image">→</button>` : ''}</div>` : '') +
      (n > 1 ? `<button class="gl-all" type="button" data-th="0">View all images (${n}) →</button>` : '') + `</div>`;
  };

  const priceBlock = (p, isB) => {
    const st = stockCls(p.stock);
    const save = p.was ? p.was - p.price : 0;
    const promo = p.was ? `<div class="bb-promo"><span class="t-small bb-was">${money(p.was)}</span>${isB ? '' : `<span class="t-caption-sb bb-save">Save ${money(save).replace('.00', '')} / ${Math.round(save / p.was * 100)}%</span>`}</div>` : '';
    const stock = isB ? `<span class="stk t-caption is-ok"><i></i>All in stock</span>` : `<span class="stk t-caption is-${st}"><i></i>${esc(p.stock)}</span>`;
    return `<div class="bb-price">${promo}<div class="bb-prow"><div class="price"><span class="amt t-h2">${money(p.price)}</span><span class="vat t-caption">ex VAT</span></div>${stock}</div></div>`;
  };
  const buyBox = (p, c) => {
    const max = p.qty > 0 ? p.qty : 9999;
    const top = c.isB
      ? `<div class="bb-items"><p class="t-caption bb-l">Included in this bundle</p>${c.items.map(it => `<div class="bb-item"><span class="bb-th">${it[2] && c.gal[it[2] - 1] ? img(c.gal[it[2] - 1]) : ''}</span>` +
          `<span class="bb-it"><span class="t-small-sb">${esc(it[0])}</span><span class="t-caption bb-l">${esc(it[1])}</span></span></div>`).join('')}</div>` +
        (p.was ? `<div class="sticker pdp-sticker t-caption-sb"><div><span class="s1">Saving</span><span class="s2">${money(p.was - p.price).replace('.00', '')}</span></div></div>` : '')
      : `<div class="bb-quick">${c.quick.map(r => `<div class="bb-q"><p class="t-caption bb-l">${esc(r[0])}</p><p class="t-small">${esc(r[1])}</p></div>`).join('')}</div>`;
    return `<div class="pdp-bb${c.isB ? ' is-bundle' : ''}" data-sku="${esc(p.sku)}">${top}<hr class="bb-div">${priceBlock(p, c.isB)}` +
      `<div class="bb-act"><button class="atc ${c.isB ? 'theme-multi-brand' : 'theme-gradient'} bb-add t-small-sb">${ic.cart}Add to Cart</button>${qty(max)}</div>` +
      `<div class="bb-util"><div class="bb-ul"><label class="plc-cmp t-caption-sb"><input type="checkbox"><span class="box" aria-hidden="true"></span>Compare</label>` +
      `</div><a class="pm-quote t-caption-sb" data-link="pdp-quote">Get a quote  →</a></div></div>`;
  };

  const panel = (p, c) => {
    const grp = g => `<div class="ip-grp"><p class="t-caption-upper">${esc(g[0])}</p><div class="ip-rows">${g[1].map(r => `<div class="ip-r t-small"><span class="ip-k">${esc(r[0])}</span><span>${esc(r[1])}</span></div>`).join('')}</div></div>`;
    const col = gs => `<div class="ip-col">${gs.map(grp).join('')}</div>`;
    const specs = `<div class="ip-pane is-on" data-pane="spec"><p class="t-title">${esc(c.specTitle)}</p><div class="ip-cols">${col(c.groups[0])}${col(c.groups[1] || [])}</div>` +
      `<a class="t-small-sb ip-more" data-link="pdp-full-specs">View full specifications →</a></div>`;
    // v0.14 (i091): Documents + Fulfilment & Support as in Figma PDP / Information Panel 2153:473 (Active Tab=Documents 2153:409, Fulfilment 2153:446)
    const warranty = ((c.quick || []).find(r => r[0] === 'Warranty') || [0, '1 Year On-Site'])[1];
    const docRow = (t, d) => `<div class="ip-doc"><div class="ip-doc-i"><p class="t-small-sb">${t}</p><p class="t-caption ip-meta"><span>${d}</span><span>PDF</span></p></div><a class="ip-dl t-caption-sb" data-link="pdp-doc">Download</a></div>`;
    const docs = `<div class="ip-pane" data-pane="docs"><div class="ip-head"><p class="ip-t">Documents</p><p class="t-small ip-sub">Product documentation and warranty information</p></div><div class="ip-list">` +
      docRow('Product datasheet', 'Technical specifications and product information') + docRow('Warranty information', 'Support coverage and service terms') + docRow('User guide', 'Setup and device documentation') +
      `</div><p class="t-caption ip-sub">${esc(warranty.replace(/^1 Year On-Site$/i, '1-year on-site'))} warranty included.<br>Extended coverage options may be available on request.</p></div>`;
    const fulRow = (k, v) => `<div class="ip-ful"><p class="t-small-sb ip-ful-k">${k}</p><p class="t-caption ip-meta">${v}</p></div>`;
    const ful = `<div class="ip-pane" data-pane="ful"><div class="ip-head"><p class="ip-t">Fulfilment & support</p><p class="t-small ip-sub">Operational information for ordering, delivery and product support.</p></div><div class="ip-list">` +
      fulRow('Availability & lead time', 'Availability and dispatch timing are confirmed for the selected configuration before ordering.') +
      fulRow('Delivery', 'Delivery options and estimated timing are confirmed for your delivery address before checkout.') +
      fulRow('Business purchasing', `<a class="ip-lk" href="#/quote?sku=${encodeURIComponent(p.sku)}&qty=1">Request a quote</a> for volume pricing, alternative configurations and purchase-order requirements.`) +
      fulRow('Support coverage', 'Warranty information and product documentation are available in the <button class="ip-lk" type="button" data-tab="docs">Documents section</button>.') + `</div></div>`;
    return `<section class="plp-row pdp-ip"><div class="ip-tabs" role="tablist"><button class="ip-tab is-on t-small-sb" type="button" role="tab" aria-selected="true" data-tab="spec">Specifications</button>` +
      `<button class="ip-tab t-small" type="button" role="tab" aria-selected="false" data-tab="docs">Documents</button><button class="ip-tab t-small" type="button" role="tab" aria-selected="false" data-tab="ful">Fulfilment & Support</button></div>` +
      specs + docs + ful + `<a class="ip-pdf t-small" data-link="pdp-pdf">Download product PDF</a></section>`;
  };

  // ---------- rails (Home / Section / Products Rail, Short Card + hover maxi; bundle cards cloned from Home R2G) ----------
  const link = p => { const k = 'p-' + p.sku; LINKS[k] = Catalog.href(p); return k; };
  const short = p => {
    const k = link(p), st = stockCls(p.stock), max = p.qty > 0 ? p.qty : 9999;
    const price = `<div class="price"><span class="amt t-title">${money(p.price)}</span><span class="vat t-caption">ex VAT</span></div>`;
    const avail = `<div class="avail stk t-caption is-${st}"><i></i>${esc(p.stock)}</div>`;
    return `<div class="pslot" data-link="${k}" tabindex="0"><article class="pcard"><div class="pimg"><div class="pic fit-contain">${pimg(p)}</div></div>` +
      `<div class="pid"><p class="brand t-caption">${esc(p.brand)}</p><p class="nm t-body-sb">${esc(p.name)}</p></div>` +
      `<div class="pbuy"><div class="price-row">${price}${avail}</div></div></article>` +
      `<div class="pmaxi" aria-hidden="true" data-sku="${esc(p.sku)}"><a class="pm-img fit-contain" data-link="${k}" href="${LINKS[k]}" tabindex="-1">${pimg(p)}</a>` +
      `<div class="pid"><p class="brand t-caption">${esc(p.brand)}</p><p class="nm t-body-sb">${esc(p.name)}</p></div>` +
      `<div class="pm-hl t-caption">${p.specs.map(s => `<p>${esc(s)}</p>`).join('')}</div><div class="pm-sp"></div>` +
      `<div class="pm-buy"><div class="price-row">${price}<div class="pm-stock">${avail}${st !== 'req' ? `<span class="t-caption pm-del">· 1–2 days</span>` : ''}</div></div></div>` +
      `<div class="pm-cta"><button class="atc theme-gradient pm-add t-small-sb" tabindex="-1">${ic.cart}Add</button>${qty(max)}</div>` +
      `<div class="pm-foot"><a class="pm-quote t-caption-sb" data-link="pdp-quote" tabindex="-1">Get a quote  →</a></div></div></div>`;
  };
  const homeBundle = sku => { // clone a Home R2G bundle card (Bundle Card / Short + hover maxi), counters re-bound later
    const k = Object.keys(LINKS).find(x => /^r2g-bundle-\d+$/.test(x) && LINKS[x] === '#/product/' + sku);
    const el = k && document.querySelector(`#pgHome .bslot[data-link="${k}"]`);
    if (!el) return '';
    const c = el.cloneNode(true); c.querySelectorAll('[data-bound]').forEach(x => x.removeAttribute('data-bound'));
    return c.outerHTML;
  };
  const rail = (title, slots, all) => !slots.length ? '' : `<section class="sec-rail pdp-rail"><div class="inner rail" data-rail><div class="rail-head"><h2 class="ttl t-h1">${esc(title)}</h2>` +
    `<a class="all t-body-sb" href="${all}">View all →</a></div><div class="rail-view"><div class="rail-track">${slots.join('')}</div></div>` +
    `<button class="rail-arrow prev t-small-sb" aria-label="Previous">←</button><button class="rail-arrow next t-small-sb" aria-label="Next">→</button></div></section>`;
  const r2g = (title, sub, skip) => {
    const s = document.querySelector('#pgHome .sec-r2g'); if (!s) return '';
    const c = s.cloneNode(true);
    c.querySelectorAll('[data-bound]').forEach(x => x.removeAttribute('data-bound')); c.querySelectorAll('[data-rail-bound]').forEach(x => x.removeAttribute('data-rail-bound'));
    c.querySelector('.r2g-head .ttl').textContent = title; c.querySelector('.r2g-head .sub').textContent = sub;
    const own = Object.keys(LINKS).find(x => /^r2g-bundle-\d+$/.test(x) && LINKS[x] === '#/product/' + skip);
    if (own) { const sl = c.querySelector(`.bslot[data-link="${own}"]`); if (sl) sl.remove(); }
    c.classList.add('pdp-r2g');
    return c.outerHTML;
  };
  const ACCESSORIES = ['5TW10AA', '6B8Y1AA', '3B4Q5AA', '6N6E9AA'];   // HP USB-C Dock G5, Renew backpack, 435 mouse, E24 G5 (Figma rails)
  const rails = p => {
    const by = s => Catalog.bySku(s);
    if (p.type === 'bundle') {
      const custom = ['6B8Y1AA', '3B4Q5AA', '6N6E9AA', '5TW10AA'].map(by).filter(Boolean);
      return rail('Customise this bundle', custom.map(short), '#/accessories') +
        r2g('Other ready-to-go bundles', 'Pre-matched kits for desks, meetings and full workstations. One order, one invoice.', p.sku);
    }
    const acc = ACCESSORIES.slice(0, 3).map(by).filter(x => x && x.sku !== p.sku);
    const first = p.cat === 'computers' ? homeBundle('R2G-HDS-01') : '';
    const mates = PRODUCTS.filter(x => x.cat === p.cat && x.child === p.child && x.type !== 'bundle' && x.sku !== p.sku).slice(0, 8);
    const k = Catalog.child(Catalog.cat(p.cat), p.child);
    return rail('Complete your workspace', (first ? [first] : []).concat(acc.map(short)), '#/accessories') +
      rail('Compare other ' + (k ? k.name.toLowerCase() : 'products'), mates.map(short), '#/' + p.cat + '/' + p.child);
  };

  // ---------- page ----------
  const render = p => {
    const c = content(p);
    const cat = Catalog.cat(p.cat), k = Catalog.child(cat, p.child);
    const trail = c.isB ? [['Home', '#/'], ['Ready-to-go bundles', '#/'], [c.short, '']]
      : [['Home', '#/'], [cat.name, '#/' + cat.slug]].concat(k ? [[k.name, '#/' + cat.slug + '/' + k.slug]] : []).concat([[c.short, '']]);
    const html = `<div class="pdp">${crumbs(trail)}` +
      `<section class="pdp-hero"><div class="plp-row pdp-hin">${gallery(p, c)}<div class="pdp-info"><div class="pdp-id"><h1 class="pdp-ttl t-h2">${esc(c.title)}</h1>` +
      `<p class="t-caption pdp-ids">${esc(c.isB ? c.sub : c.ids)}</p></div>${buyBox(p, c)}</div></div></section>` +
      `<section class="pdp-ov"><div class="plp-row"><p class="t-title">${c.isB ? "What's in the bundle" : 'Product overview'}</p>${c.overview.map(t => `<p class="t-small">${esc(t)}</p>`).join('')}</div></section>` +
      `<div class="pdp-det">${panel(p, c)}</div><div class="pdp-recs">${rails(p)}</div></div>`;
    const cta = document.querySelector('#pgHome .sec-cta');
    return { title: c.short, html: html + (cta ? cta.outerHTML : ''), state: null, pdp: true };
  };

  // ---------- behaviour ----------
  const view = document.getElementById('pgView');
  const show = (g, i) => {
    const n = +g.dataset.n; if (!n) return; i = (i + n) % n;
    g.querySelectorAll('.gl-slide').forEach((s, k) => s.classList.toggle('is-on', k === i));
    g.querySelectorAll('.gl-th').forEach((t, k) => t.classList.toggle('is-on', k === i));
    const row = g.querySelector('.gl-rtrack'); if (row) row.style.setProperty('--ti', Math.max(0, Math.min(i - 2, n - 5)));
    g.dataset.i = i;
  };
  view.addEventListener('click', e => {
    if (!document.body.dataset.route || document.body.dataset.route !== 'product') return;
    const g = e.target.closest('.pdp-gal');
    if (g) { const th = e.target.closest('[data-th]'); const st = e.target.closest('[data-th-step]');
      if (th) show(g, +th.dataset.th); else if (st) show(g, +(g.dataset.i || 0) + +st.dataset.thStep); return; }
    const tab = e.target.closest('[data-tab]');   // v0.14: tabs + the "Documents section" link
    if (tab) { const box = tab.closest('.pdp-ip');
      box.querySelectorAll('.ip-tab').forEach(t => { const on = t.dataset.tab === tab.dataset.tab; t.classList.toggle('is-on', on); t.classList.toggle('t-small-sb', on); t.classList.toggle('t-small', !on); t.setAttribute('aria-selected', on); });
      box.querySelectorAll('.ip-pane').forEach(pn => pn.classList.toggle('is-on', pn.dataset.pane === tab.dataset.tab)); return; }
    const save = e.target.closest('.pdp-bb .plc-save');
    if (save) { save.classList.toggle('is-on'); save.lastChild.textContent = save.classList.contains('is-on') ? 'Saved' : 'Save'; }
  });
  // v0.15 (i073): rails + bundles reused by the campaign template (36_campaign.js)
  return { render, rail: (t, ps, all) => rail(t, ps.map(short), all), r2g: (t, sub) => r2g(t, sub, '') };
})();
