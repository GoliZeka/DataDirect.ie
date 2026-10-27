/* ===== Campaign landing page (v0.15, i073 / i074): one template, 4 themes. Figma 15_CAMPAIGNS:
   Black Friday 5746:3 · iPhone 17 for Business 5867:1252 · Dell Pro Workplace Upgrade 5867:1875 · ThinkPad Built to go further 5867:2498.
   Route #/campaign/<slug>. Sections: hero (theme tint) · benefits (Campaign / USP Tile 5866:1252) · how it works · bundles (optional)
   · products rail (PDP rail = canonical maxi) · offer terms · CTA band. Products are DEMO catalogue items picked per theme. ===== */
const Campaign = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ART = (k, s) => PRODUCTS.filter(p => p.type !== 'bundle' && k(p)).slice(0, s || 8);
  const C = {
    'black-friday': { name: 'Black Friday', tint: 'tint-warm', pill: 'BLACK FRIDAY · 3-30 NOVEMBER', pillCls: 'is-yellow', img: 'hero12_bf',
      title: ['Black Friday', 'starts early.'], lead: 'Free USB-C dock or wireless headset with selected ready-to-go bundles. Business pricing ex VAT, delivered across Ireland in 1-2 days.',
      cta: ['Shop Black Friday bundles', '#/computers/laptops'],
      ben: 'Why buy on Black Friday', usp: [['Free gift', 'USB-C dock or wireless headset with every marked bundle.'], ['Business pricing', 'Every price ex VAT, with volume quotes from 10 units.'], ['Delivered in 1-2 days', 'Shipped to one office or many, anywhere in Ireland.'], ['One invoice', 'Laptop, screen and accessories in one order.']],
      how: 'How the offer works', steps: [['Pick a ready-to-go bundle', 'Any bundle marked Black Friday: hybrid desk, meeting-ready or full workstation.'], ['Order by 30 November', 'Business pricing ex VAT. Ordering 25+ units? Ask for a volume quote.'], ['Choose your gift', 'A free USB-C dock or wireless headset ships together with the bundle.']],
      bundles: true, rail: 'Laptops on offer', all: '#/computers/laptops', items: () => ART(p => p.child === 'laptops'),
      terms: 'Valid 3-30 November 2026 or while stocks last. One gift per bundle, chosen at checkout. Applies to ready-to-go bundles marked Black Friday. Prices ex VAT, delivery to Ireland only. Cannot be combined with project or volume pricing.' },
    'iphone-17-business': { name: 'iPhone 17 for Business', tint: 'tint-lilac', pill: 'APPLE FOR BUSINESS · iPHONE 17', pillCls: 'is-purple', img: 'hero11_iphone', fit: true,
      title: ['iPhone 17.', 'Ready for work.'], lead: 'Business pricing ex VAT, zero-touch enrolment with Apple Business Manager and devices that arrive ready on day one.',
      cta: ['Shop iPhone for business', '#/mobile-tablets/mobile'],
      ben: 'Why buy Apple through DataDirect', usp: [['Business pricing', 'Every price ex VAT, with volume quotes from 10 devices.'], ['Zero-touch enrolment', 'Devices enrolled in Apple Business Manager before they ship.'], ['Trade-in', 'Credit for your old iPhones and Macs against the new order.'], ['Delivered in 1-2 days', 'Shipped to one office or many, anywhere in Ireland.']],
      how: 'How it works', steps: [['Choose your devices', 'iPhone 17, iPad and Mac at business prices, ex VAT.'], ['We enrol and configure', 'Zero-touch setup with your MDM, apps and Wi-Fi in place.'], ['Your team switches on', 'Devices arrive ready, old ones go back for trade-in.']],
      bundles: false, rail: 'Mobile and tablets for your team', all: '#/mobile-tablets', items: () => ART(p => p.cat === 'mobile-tablets'),
      terms: 'Prices ex VAT. Zero-touch enrolment included on orders of 5 or more Apple devices placed by 31 December 2026. Trade-in value depends on device condition and is credited after inspection. Delivery to Ireland only.' },
    'dell-pro': { name: 'Dell Pro · Workplace Upgrade', tint: 'tint-warm', pill: 'DELL PRO · WORKPLACE UPGRADE', pillCls: 'is-dark', img: 'dell_photo', right: true,
      title: ['Upgrade the', 'whole workplace.'], lead: 'Dell Pro laptops, monitors and docks in one order. Business pricing ex VAT, delivered across Ireland in 1-2 days.',
      cta: ['Shop Dell Pro', '#/computers?brand=dell'],
      ben: 'Everything for the upgrade, in one order', usp: [['Save up to 15%', 'On Dell Pro laptop + monitor + dock bundles.'], ['3-year on-site warranty', 'Dell ProSupport included on every Dell Pro laptop.'], ['Free delivery over €500', 'Delivered in 1-2 days, anywhere in Ireland.'], ['Volume quotes', 'Ordering 10 or more? Get project pricing in 24 hours.']],
      how: 'How the upgrade works', steps: [['Pick your setup', 'Start from a Dell Pro laptop or a ready-to-go bundle.'], ['Add screens and docks', 'Monitors and docks that are tested to work together.'], ['We deliver, you switch on', 'One delivery, one invoice, warranty from day one.']],
      bundles: true, rail: 'Dell for business', all: '#/computers?brand=dell', items: () => ART(p => p.brand === 'Dell'),
      terms: 'Bundle savings apply to Dell Pro laptops bought together with a Dell monitor and dock in one order, until 31 January 2027. Prices ex VAT. Free delivery on orders over €500 to Ireland. Volume pricing cannot be combined with bundle savings.' },
    'thinkpad': { name: 'ThinkPad · Built to go further', tint: 'tint-yellow', pill: 'LENOVO THINKPAD · FIELD READY', pillCls: 'is-yellow', img: 'hero12_waterfall',
      title: ['Built to go', 'further.'], lead: 'ThinkPad laptops tested for site, van and warehouse: MIL-STD durability, all-day battery and next-day replacement for your team.',
      cta: ['Shop ThinkPad', '#/computers/laptops?brand=lenovo'],
      ben: 'Made for teams that work on the move', usp: [['MIL-STD-810H tested', 'Drops, dust, heat and cold: tested on 12 military standards.'], ['Next-day replacement', 'If a ThinkPad fails, a replacement ships the next working day.'], ['3-year Premier Support', 'Direct line to senior Lenovo engineers, on site if needed.'], ['Volume quotes', 'Fleet of 10 or more? Get project pricing in 24 hours.']],
      how: 'How it works', steps: [['Choose rugged or everyday', 'From the X1 Carbon for the office to rugged models for the field.'], ['Add field accessories', 'Docks, backpacks and spare chargers that fit every model.'], ['Covered on site', 'Premier Support and next-day replacement on every order.']],
      bundles: true, rail: 'ThinkPad for every role', all: '#/computers?brand=lenovo', items: () => ART(p => p.brand === 'Lenovo' && p.cat === 'computers'),
      terms: 'Next-day replacement and 3-year Premier Support apply to ThinkPad laptops ordered by 31 January 2027, for business customers in Ireland. Prices ex VAT. Volume pricing on request for 10 or more devices.' }
  };
  const TICK = '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="currentColor"/><path d="M13 20.5l4.5 4.5L27 15.5" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const render = slug => {
    if (slug === 'iphone-18') return Campaign18.render();   // v0.15.1: designer's own layout
    const d = C[slug]; if (!d) return null;
    const crumbs = `<nav class="pv-crumbs t-caption cmp-crumbs" aria-label="Breadcrumb"><a href="#/">Home</a><span aria-hidden="true">/</span><span aria-current="page">${esc(d.name)}</span></nav>`;
    const hero = `<section class="cmp-hero cmp-${d.tint}"><div class="cmp-in cmp-hin"><div class="cmp-txt"><span class="cmp-pill t-caption-upper ${d.pillCls}">${esc(d.pill)}</span>` +
      `<h1 class="t-display cmp-ttl">${d.title.map(esc).join('<br>')}</h1><p class="t-body cmp-lead">${esc(d.lead)}</p>` +
      `<div class="cmp-act"><a class="cmp-btn theme-gradient t-body-sb" href="${d.cta[1]}">${esc(d.cta[0])}</a><a class="cmp-link t-body-sb" href="#/campaign/${slug}" data-cmp-terms>See offer terms  →</a></div></div>` +
      `<div class="cmp-media${d.fit ? ' is-fit' : ''}${d.right ? ' is-right' : ''}"><img alt="" src="${ASSETS[d.img] || ''}"></div></div></section>`;
    const ben = `<section class="cmp-ben"><div class="cmp-in"><h2 class="t-h1">${esc(d.ben)}</h2><div class="cmp-tiles">` +
      d.usp.map(u => `<div class="cmp-tile"><span class="cmp-ic">${TICK}</span><p class="t-title">${esc(u[0])}</p><p class="t-small">${esc(u[1])}</p></div>`).join('') + `</div></div></section>`;
    const how = `<section class="cmp-how"><div class="cmp-in"><h2 class="t-h2">${esc(d.how)}</h2><div class="cmp-steps">` +
      d.steps.map((s, i) => `<div class="cmp-step"><p class="t-caption-upper">Step ${i + 1}</p><p class="t-title">${esc(s[0])}</p><p class="t-small">${esc(s[1])}</p></div>`).join('') + `</div></div></section>`;
    const bundles = d.bundles ? PDP.r2g('Ready-to-go bundles', 'Pre-matched kits for desks, meetings and full workstations. One order, one invoice.') : '';
    const rail = `<div class="pdp-recs cmp-recs">${PDP.rail(d.rail, d.items(), d.all)}</div>`;
    const terms = `<section class="cmp-terms" id="cmp-terms"><div class="cmp-in"><p class="t-title">Offer terms</p><p class="t-caption">${esc(d.terms)}</p></div></section>`;
    const cta = document.querySelector('#pgHome .sec-cta');
    return { title: d.name, html: `<div class="cmp">${crumbs}${hero}${ben}${how}${bundles}${rail}${terms}</div>` + (cta ? cta.outerHTML : ''), state: null, pdp: true };
  };
  // "See offer terms" scrolls to the terms block (stays on the page)
  document.getElementById('pgView').addEventListener('click', e => {
    const t = e.target.closest('[data-cmp-terms]'); if (!t) return;
    e.preventDefault(); const el = document.getElementById('cmp-terms'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  return { render, slugs: Object.keys(C) };
})();

/* ===== iPhone 18 · The Next Chapter (v0.15.1): own layout, 1/1 Figma 15_CAMPAIGNS 5884:3061 (designer's concept).
   Hero 5884:3084 · Ready 5884:3094 · Find your Pro 5885:3078 · Choose yours 5885:3124 · CTA 5885:3221 · Mini Footer 5885:3231.
   Prices are "to be confirmed" in Figma, so Add to Cart opens Request a quote with the model (samo u kodu). ===== */
const Campaign18 = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const A = k => ASSETS[k] || '';
  const SW = ['#2b2b2d', '#e9e8e4', '#a9bbd3', '#6b2b35'];
  const IC = {
    team: '<path d="M16 13.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM7 15a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 7 15zM25 15a2.75 2.75 0 1 0 0-5.5A2.75 2.75 0 0 0 25 15zM9.5 26c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5M2.5 26c0-2.6 2-4.6 4.5-4.6 1.2 0 2.3.4 3.1 1.2M29.5 26c0-2.6-2-4.6-4.5-4.6-1.2 0-2.3.4-3.1 1.2"/>',
    day: '<rect x="5" y="7" width="22" height="20" rx="2"/><path d="M5 12h22M11 4v5M21 4v5M13 20h6M16 17v6"/>',
    move: '<path d="M5.5 27v-8h5v8h-5zM14 27V13h5v14h-5zM22.5 27V6h5v21h-5z"/>'
  };
  const icon = k => `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#1F1B18" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`;
  const SPECS = {
    pro: [['Display', '6.3-inch Super Retina XDR'], ['Chip', 'A20 Pro chip'], ['Camera', '48MP Pro Fusion camera system'], ['Battery', 'Up to 36 hours video playback'], ['Storage', '256GB · 512GB · 1TB · 2TB']],
    max: [['Display', '6.9-inch Super Retina XDR'], ['Chip', 'A20 Pro chip'], ['Camera', '48MP Pro Fusion camera system'], ['Battery', 'Up to 45 hours video playback'], ['Storage', '256GB · 512GB · 1TB · 2TB']]
  };
  const PRODS = [['iPhone 18 Pro', '256GB · Black', 'c18_p1', 0], ['iPhone 18 Pro', '512GB · Glacier', 'c18_p2', 2], ['iPhone 18 Pro Max', '256GB · Silver', 'c18_p3', 1], ['iPhone 18 Pro Max', '512GB · Burgundy', 'c18_p4', 3]];
  const CART = '<svg width="20" height="20" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M1.875 1.875H5.15625L7.03125 14.0625H18.2812L20.625 5.625H8.4375" stroke="currentColor" stroke-width="1.875" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7.96875" cy="18.2812" r="1.40625" fill="currentColor"/><circle cx="15.4688" cy="18.2812" r="1.40625" fill="currentColor"/></svg>';
  const quote = m => '#/quote?model=' + encodeURIComponent(m);
  const render = () => {
    const cmp = (name, img, k) => `<div class="c18-cmp"><div class="c18-cmp-img"><img alt="" src="${A(img)}"></div><div class="c18-specs"><p class="c18-model">${name}</p>` +
      `<div class="c18-table">${SPECS[k].map(r => `<div class="c18-row"><span class="c18-lbl">${r[0]}</span><span class="c18-val">${r[1]}</span></div>`).join('')}</div></div></div>`;
    const card = (p, i) => `<div class="c18-card" data-c18="${i}"><div class="c18-card-img"><img alt="" src="${A(p[2])}"></div><p class="c18-cm">${esc(p[0])}</p><p class="c18-cv">${esc(p[1])}</p>` +
      `<div class="c18-sw" role="radiogroup" aria-label="Colour">${SW.map((c, j) => `<button type="button" class="c18-dot${j === p[3] ? ' is-on' : ''}" role="radio" aria-checked="${j === p[3]}" aria-label="Colour ${j + 1}"><i style="background:${c}"></i></button>`).join('')}</div>` +
      `<p class="c18-price"><span class="c18-pv">€—</span><span class="c18-pn">ex VAT</span></p><a class="c18-add" href="${quote(p[0] + ' ' + p[1])}">${CART}Add to Cart</a></div>`;
    const logo = (document.querySelector('.gh-logo') || {}).innerHTML || 'DataDirect';
    const html = `<div class="c18">` +
      `<section class="c18-hero"><div class="c18-htxt"><p class="c18-eye">Built around your business.</p><h1 class="c18-ttl">The Next Chapter<br>for Your Team</h1>` +
      `<p class="c18-lead">For people who push your business forward.</p><div class="c18-act"><a class="c18-btn" href="#/quote">Request a quote</a><a class="c18-link" href="#/mobile-tablets/mobile">Explore the range  →</a></div></div>` +
      `<img class="c18-phones" alt="iPhone 18 Pro in black, silver, blue and burgundy" src="${A('c18_hero')}"></section>` +
      `<section class="c18-ready"><div class="c18-intro"><h2 class="c18-rt">Ready for<br><em>what’s next.</em></h2><p class="c18-rl">Explore smartphones for your team. Tell us what you need and we’ll help you find the right fit.</p></div>` +
      `<div class="c18-pillars"><div class="c18-pil">${icon('team')}<p class="c18-pt">For your team</p><p class="c18-px">Explore options for individual roles or a wider team upgrade.</p></div>` +
      `<div class="c18-pil">${icon('day')}<p class="c18-pt">For your workday</p><p class="c18-px">Choose the devices that suit how your people work.</p></div>` +
      `<div class="c18-pil">${icon('move')}<p class="c18-pt">For your next move</p><p class="c18-px">Talk through your requirements with DataDirect.</p></div></div></section>` +
      `<section class="c18-find"><div class="c18-head"><h2 class="c18-st">Find your Pro.</h2><p class="c18-sl">Compare iPhone 18 Pro and iPhone 18 Pro Max.</p></div>` +
      `<div class="c18-cmps">${cmp('iPhone 18 Pro', 'c18_cmp_pro', 'pro')}${cmp('iPhone 18 Pro Max', 'c18_cmp_max', 'max')}</div><p class="c18-note">Battery figures refer to video playback. Actual results vary.</p></section>` +
      `<section class="c18-choose"><div class="c18-head"><h2 class="c18-st">Choose yours.</h2><p class="c18-sl">Select a model, colour and capacity.</p></div>` +
      `<div class="c18-cards">${PRODS.map(card).join('')}</div><p class="c18-note">Prices and availability to be confirmed.</p></section>` +
      `<section class="c18-cta"><i class="g g1"></i><i class="g g2"></i><i class="g g3"></i><i class="g g4"></i><h2 class="c18-st">Let’s plan your<br>next upgrade.</h2><p class="c18-lead">Tell us what your team needs.</p><a class="c18-btn" href="#/quote">Request a quote</a></section>` +
      `<footer class="c18-foot"><a class="gh-logo" href="#/" aria-label="DataDirect">${logo}</a><nav class="c18-fl"><a href="#/mobile-tablets/mobile">Business phones</a><a href="#/next-phase">Contact</a><span>© 2026 DataDirect</span></nav></footer></div>`;
    return { title: 'iPhone 18 · The Next Chapter', html, state: null, pdp: true };
  };
  document.getElementById('pgView').addEventListener('click', e => {   // colour swatches: select one per card
    const d = e.target.closest('.c18-dot'); if (!d) return;
    d.parentElement.querySelectorAll('.c18-dot').forEach(x => { x.classList.toggle('is-on', x === d); x.setAttribute('aria-checked', x === d); });
  });
  return { render };
})();
