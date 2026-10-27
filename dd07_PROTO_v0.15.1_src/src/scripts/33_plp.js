/* ===== PLP (v0.9, m04): Parent category + product listing, one template.
   Figma: PLP / Page Template / Desktop 5764:13872 (30_PLP_SEARCH), screens Computers (Parent) 5773:18196,
   Laptops Default 5764:14455, Filtered 5764:15219.
   - i030 Parent: Context Banner (title), Child Categories (C-PLP / Category Badge), Toolbar, Parent Grid 4 x 304, pagination.
   - i031 Listing: Context Banner (title + count + description), Active Filters Bar 2929:12237, Filter Sidebar 2800:10435
     (Filter / Accordion Header 5786:6767, Form / Checkbox), Quick Order 2877:11763, grid 3 x 304.
   - i032 Sort (Relevance, price, name) + pagination (9 per page on listings, 8 on the parent).
   State lives in the URL: #/<cat>/<child>?brand=lenovo,hp&ram=16-gb&sort=price-asc&page=2 (?f=<preset> from the mega menu).
   samo u kodu: counts are the DEMO catalogue (PRODUCTS), not the Figma placeholder numbers; List view is not designed yet. ===== */
const PLP = (() => {
  // v0.12: Child Categories badge shows the first product photo of that list (Figma badges are still placeholder circles)
  const kidImg = (c, x) => { const p = PRODUCTS.find(q => q.cat === c.slug && q.child === x.slug && q.img && ASSETS['p/' + q.img]);
    return p ? `<img alt="" src="${ASSETS['p/' + p.img]}">` : ''; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const slug = s => String(s).toLowerCase().replace(/"/g, '').replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '');
  const money = n => '€' + n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = s => parseFloat(s) * (/TB/.test(s) ? 1024 : 1);

  // Commerce / Product Availability 254:656: 4 states, dot + label share one token
  const STOCK = ['In Stock', 'Low Stock', 'To Order', 'On Request'];
  const stockCls = s => ({ 'In Stock': 'ok', 'Low Stock': 'low', 'To Order': 'order', 'On Request': 'req' }[s] || 'req');
  const PRICE = [['Under €1,000', 0, 1000], ['€1,000 to €1,500', 1000, 1500], ['€1,500 to €2,000', 1500, 2000], ['Over €2,000', 2000, Infinity]];
  // Filter sets (Filter / Accordion / ...): category filters, then common filters under the group divider
  const FACETS = [
    { key: 'brand', title: 'Brand', get: p => p.brand, order: 'count' },
    { key: 'screen', title: 'Screen Size', get: p => p.f && p.f.screen, order: 'num' },
    { key: 'cpu', title: 'Processor', get: p => p.f && p.f.cpu },
    { key: 'ram', title: 'Memory', get: p => p.f && p.f.ram, order: 'num' },
    { key: 'storage', title: 'Storage', get: p => p.f && p.f.storage, order: 'num' },
    { key: 'os', title: 'Operating System', get: p => p.f && p.f.os, order: 'count' },
    { key: 'price', title: 'Price Range', common: true, get: p => (PRICE.find(r => p.price >= r[1] && p.price < r[2]) || [])[0], order: 'fixed', fixed: PRICE.map(r => r[0]) },
    { key: 'stock', title: 'Availability', common: true, get: p => p.stock, order: 'fixed', fixed: STOCK }
  ];
  const SORTS = [['relevance', 'Relevance'], ['price-asc', 'Price: Low to High'], ['price-desc', 'Price: High to Low'], ['name', 'Name: A to Z']];
  const open = { brand: true };               // accordion state (Brand expanded by default, as in Figma)

  const ic = {
    cart: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M2 2H4.13333L6.26667 14H15.8667L18 5.6H5.2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" stroke="white"/><circle cx="8.5" cy="16.5" r="1.5" fill="white"/><circle cx="15.5" cy="16.5" r="1.5" fill="white"/></svg>',
    minus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H13" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H8M8 8H13M8 8V3M8 8V13" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor"/></svg>',
    mark: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M3.5 1.75h7v10.5L7 9.9l-3.5 2.35z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>'
  };

  // ---------- state from the URL ----------
  const read = (q, facets) => {
    const sel = {};
    facets.forEach(f => { const v = q.get(f.key); if (v) sel[f.key] = v.split(',').filter(Boolean); });
    const sort = SORTS.some(s => s[0] === q.get('sort')) ? q.get('sort') : 'relevance';
    return { sel, sort, page: Math.max(1, parseInt(q.get('page') || '1', 10) || 1), preset: q.get('f'), q: (q.get('q') || '').trim() };
  };
  const qs = st => {
    const q = new URLSearchParams();
    if (st.q) q.set('q', st.q);
    if (st.preset) q.set('f', st.preset);
    Object.keys(st.sel).forEach(k => { if (st.sel[k].length) q.set(k, st.sel[k].join(',')); });
    if (st.sort !== 'relevance') q.set('sort', st.sort);
    if (st.page > 1) q.set('page', st.page);
    const s = q.toString().replace(/%2C/g, ',').replace(/\+/g, '%20');
    return s ? '?' + s : '';
  };
  const matches = (p, sel, skip) => Object.keys(sel).every(k => k === skip || !sel[k].length ||
    sel[k].includes(slug(FACETS.find(f => f.key === k).get(p) || '')));
  const sorted = (items, sort) => {
    const a = items.slice();
    if (sort === 'price-asc') a.sort((x, y) => x.price - y.price);
    else if (sort === 'price-desc') a.sort((x, y) => y.price - x.price);
    else if (sort === 'name') a.sort((x, y) => x.name.localeCompare(y.name));
    return a;
  };
  const presetLabel = (c, s) => { for (const col of c.menu.columns) { const it = col.items.find(i => i.slug === s); if (it) return it.label; } return s; };

  // ---------- pieces ----------
  const crumbs = items => `<nav class="plp-row plp-crumbs t-caption" aria-label="Breadcrumb">${items.map((it, k) => k < items.length - 1
    ? `<a href="${it[1]}">${esc(it[0])}</a><span class="sep" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.5 4.5L10 8l-3.5 3.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`
    : `<span class="t-caption-sb" aria-current="page">${esc(it[0])}</span>`).join('')}</nav>`;

  const banner = (title, count, desc) => `<header class="plp-row plp-banner"><div class="plp-ttl"><h1 class="t-h1">${esc(title)}</h1>` +
    (count != null ? `<span class="t-small plp-count">${count} products</span>` : '') + `</div>` +
    (desc ? `<p class="t-small plp-desc">${esc(desc)}</p>` : '') + `</header>`;

  const pic = p => p.img && ASSETS['p/' + p.img] ? `<img alt="" src="${ASSETS['p/' + p.img]}">` : '';
  // v0.14.4 (i100): list view = PLP / Product Row / Desktop 2363:4803 (image · identity + SKU/MPN · specs · availability · price + Add + Quote · Compare)
  let mode = 'grid';
  try { mode = localStorage.getItem('dd-plp-view') === 'list' ? 'list' : 'grid'; } catch (e) {}
  const row = (p, compared) => {
    const st = stockCls(p.stock), href = Catalog.href(p), max = p.qty > 0 ? p.qty : 9999;
    return `<article class="plr" data-sku="${esc(p.sku)}">` +
      `<a class="plr-img fit-contain" href="${href}" tabindex="-1" aria-hidden="true">${pic(p)}</a>` +
      `<div class="plr-id"><p class="t-caption plr-brand">${esc(p.brand)}</p><a class="t-small-sb plr-nm" href="${href}">${esc(p.name)}</a>` +
      `<p class="t-caption plr-meta"><span>SKU: ${esc(p.sku)}</span><span>MPN: ${esc(p.mpn)}</span></p></div>` +
      `<div class="plr-spec t-caption">${p.specs.slice(0, 3).map(x => `<p>${esc(x)}</p>`).join('')}</div>` +
      `<div class="plr-av"><span class="stk t-caption-sb is-${st}"><i></i>${esc(p.stock)}${p.qty > 0 ? ' · ' + p.qty : ''}</span>` +
      (st !== 'req' ? `<p class="t-caption plr-del">Dispatch: 1–2 business days</p>` : '') + `</div>` +
      `<div class="plr-act">${p.was ? `<span class="t-caption plr-was">${money(p.was)}</span>` : ''}<p class="t-small-sb plr-price">${money(p.price)} <span class="t-caption">ex VAT</span></p>` +
      `<div class="plr-cta"><button class="atc theme-gradient pm-add t-small-sb">${ic.cart}Add</button>` +
      `<div class="qty qty-d" data-max="${max}"><button class="qty-btn dec is-min" aria-label="Decrease">${ic.minus}</button>` +
      `<input class="qty-val t-small-sb" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" value="1" role="spinbutton" aria-label="Quantity" aria-valuemin="1" aria-valuemax="${max}">` +
      `<button class="qty-btn inc" aria-label="Increase">${ic.plus}</button></div></div>` +
      `<a class="pm-quote t-caption-sb" data-link="plp-quote">Get a quote  →</a></div>` +
      `<div class="plr-ut"><label class="plc-cmp t-caption-sb"><input type="checkbox" data-compare="${esc(p.sku)}"${compared ? ' checked' : ''}><span class="box" aria-hidden="true"></span>Compare</label></div></article>`;
  };
  const card = (p, compared) => {
    const st = stockCls(p.stock), href = Catalog.href(p), max = p.qty > 0 ? p.qty : 9999;
    return `<article class="plc" data-sku="${esc(p.sku)}">` +
      `<a class="plc-img fit-contain" href="${href}" tabindex="-1" aria-hidden="true">${pic(p)}</a>` +
      `<div class="pid"><p class="brand t-caption"><span>${esc(p.brand)}</span>${p.was ? `<span class="was">${money(p.was)}</span>` : ''}</p><a class="nm t-body-sb" href="${href}">${esc(p.name)}</a></div>` +
      `<div class="pm-hl t-caption">${p.specs.map(s => `<p>${esc(s)}</p>`).join('')}</div><div class="pm-sp"></div>` +
      `<div class="plc-buy"><div class="price-row"><div class="plc-price">` +
            `<div class="price"><span class="amt t-title">${money(p.price)}</span><span class="vat t-caption">ex VAT</span></div></div>` +
      `<div class="pm-stock"><span class="stk t-caption is-${st}"><i></i>${esc(p.stock)}</span>` +
      (st !== 'req' ? `<span class="t-caption pm-del">· 1–2 days</span>` : '') + `</div></div></div>` +
      `<div class="pm-cta"><button class="atc theme-gradient pm-add t-small-sb">${ic.cart}Add</button>` +
      `<div class="qty qty-d" data-max="${max}"><button class="qty-btn dec is-min" aria-label="Decrease">${ic.minus}</button>` +
      `<input class="qty-val t-small-sb" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="4" value="1" role="spinbutton" aria-label="Quantity" aria-valuemin="1" aria-valuemax="${max}">` +
      `<button class="qty-btn inc" aria-label="Increase">${ic.plus}</button></div></div>` +
      `<div class="plc-foot"><label class="plc-cmp t-caption-sb"><input type="checkbox" data-compare="${esc(p.sku)}"${compared ? ' checked' : ''}><span class="box" aria-hidden="true"></span>Compare</label>` +
      `<a class="pm-quote t-caption-sb" data-link="plp-quote">Get a quote  →</a></div></article>`;
  };

  const toolbar = st => `<div class="plp-row plp-toolbar"><div class="plp-tb-r">` +
    `<label class="plp-sort"><span class="t-small">Sort by</span><span class="plp-dd"><select class="t-small" data-plp="sort" aria-label="Sort by">` +
    SORTS.map(s => `<option value="${s[0]}"${s[0] === st.sort ? ' selected' : ''}>${s[1]}</option>`).join('') +
    `</select><span class="chev t-caption" aria-hidden="true">▾</span></span></label>` +
    `<div class="plp-view" role="group" aria-label="View"><button class="t-body${mode === 'grid' ? ' is-on' : ''}" type="button" data-plp="view-grid" aria-pressed="${mode === 'grid'}" aria-label="Grid view">⊞</button>` +
    `<button class="t-body${mode === 'list' ? ' is-on' : ''}" type="button" data-plp="view-list" aria-pressed="${mode === 'list'}" aria-label="List view">☰</button></div></div></div>`;

  const pager = (total, page, per) => {
    const pages = Math.max(1, Math.ceil(total / per));
    const from = total ? (page - 1) * per + 1 : 0, to = Math.min(total, page * per);
    let list = [];
    if (pages <= 6) list = Array.from({ length: pages }, (_, i) => i + 1);
    else {
      const s = new Set([1, pages, page - 1, page, page + 1]);
      if (page <= 3) [2, 3, 4].forEach(n => s.add(n));
      if (page >= pages - 2) [pages - 3, pages - 2, pages - 1].forEach(n => s.add(n));
      const a = [...s].filter(n => n >= 1 && n <= pages).sort((x, y) => x - y);
      a.forEach((n, i) => { if (i && n - a[i - 1] > 1) list.push('…'); list.push(n); });
    }
    const b = (n, lbl, dis, aria) => `<button class="pg-b${n === page && !aria ? ' is-on' : ''}" type="button" data-page="${n}"${dis ? ' disabled' : ''}${aria ? ` aria-label="${aria}"` : ''}${n === page && !aria ? ' aria-current="page"' : ''}>${lbl}</button>`;
    return `<div class="plp-pager"><div class="pg-ctrl"${pages < 2 ? ' hidden' : ''}>${b(page - 1, '⟨', page <= 1, 'Previous page')}` +
      list.map(n => n === '…' ? '<span class="pg-gap">...</span>' : b(n, n)).join('') +
      `${b(page + 1, '⟩', page >= pages, 'Next page')}</div><p class="pg-info">Showing ${from}-${to} of ${total} products</p></div>`;
  };

  const sidebar = (base, st, facets) => {
    const groups = facets.map(f => {
      const pool = base.filter(p => matches(p, st.sel, f.key));
      const vals = new Map();
      const all = new Map();   // option order uses the unfiltered counts, so rows do not jump while filtering
      base.forEach(p => { const v = f.get(p); if (v) { all.set(v, (all.get(v) || 0) + 1); if (!vals.has(v)) vals.set(v, 0); } });
      pool.forEach(p => { const v = f.get(p); if (v) vals.set(v, vals.get(v) + 1); });
      let opts = [...vals.entries()];
      if (!opts.length) return null;
      if (f.order === 'count') opts.sort((a, b) => all.get(b[0]) - all.get(a[0]) || a[0].localeCompare(b[0]));
      else if (f.order === 'num') opts.sort((a, b) => num(a[0]) - num(b[0]));
      else if (f.order === 'fixed') opts.sort((a, b) => f.fixed.indexOf(a[0]) - f.fixed.indexOf(b[0]));
      const on = st.sel[f.key] || [];
      const isOpen = open[f.key] || (open[f.key] === undefined && on.length > 0);
      const rows = opts.map(([v, n]) => { const s = slug(v), ck = on.includes(s);
        return `<label class="fcb${ck ? ' is-on' : ''}${!n && !ck ? ' is-zero' : ''}"><input type="checkbox" data-facet="${f.key}" value="${s}"${ck ? ' checked' : ''}>` +
          `<span class="box" aria-hidden="true"></span><span class="lbl t-small-sb">${esc(v)}</span><span class="n t-caption">${n}</span></label>`; }).join('');
      return { common: f.common, html: `<div class="facc${isOpen ? ' is-open' : ''}"><button class="facc-h" type="button" data-acc="${f.key}" aria-expanded="${isOpen}">` +
        `<span class="t-small-sb">${f.title}</span>${on.length ? `<span class="facc-n t-caption-sb">${on.length}</span>` : ''}</button>` +
        `<div class="facc-b">${rows}</div></div>` };
    }).filter(Boolean);
    const join = gs => gs.map(g => g.html).join('<hr class="fdiv">');
    return `<aside class="plp-side"><div class="fbox"><p class="t-caption-upper fbox-l">Filters</p>` +
      `<div class="fgrp">${join(groups.filter(g => !g.common))}</div><hr class="fdiv">` +
      `<div class="fgrp">${join(groups.filter(g => g.common))}</div></div>` +
      `<form class="qobox" data-plp="quick-order"><p class="t-body-sb">Quick Order</p><div class="qo-row">` +
      `<input class="qo-in t-body" type="text" placeholder="Enter SKU..." aria-label="SKU" autocomplete="off">` +
      `<button class="atc theme-multi-brand qo-add t-small-sb" type="submit">${ic.cart}Add to Cart</button></div></form></aside>`;
  };

  const chips = (c, st, facets) => {
    const out = [];
    if (c && st.preset && !/^all-/.test(st.preset)) out.push(['Category', presetLabel(c, st.preset), 'f', st.preset]);   // v0.14.2 (i080): [group, value, key, slug]
    facets.forEach(f => (st.sel[f.key] || []).forEach(s => {
      const v = PRODUCTS.map(f.get).find(x => x && slug(x) === s) || s;
      out.push([f.title, v, f.key, s]);
    }));
    const prim = st.q ? `<button class="fchip is-primary" type="button" data-chip="q"><span class="t-small fc-pre">Search:</span><span class="t-small-sb">"${esc(st.q)}"</span><span class="t-caption" aria-hidden="true">✕</span><span class="sr">Remove search</span></button>` : '';
    if (!out.length) return prim ? `<div class="plp-row plp-afb">${prim}</div>` : '';
    return `<div class="plp-row plp-afb">${prim}${out.map(o => `<button class="fchip" type="button" data-chip="${o[2]}" value="${esc(o[3])}">` +
      `<span class="t-small fc-pre">${esc(o[0])}:</span><span class="t-small-sb">${esc(o[1])}</span><span class="t-caption" aria-hidden="true">✕</span><span class="sr">Remove</span></button>`).join('')}` +
      `<button class="fclear t-small-sb" type="button" data-plp="clear">Clear all</button></div>`;
  };

  const cta = () => { const el = document.querySelector('#pgHome .sec-cta'); return el ? el.outerHTML : ''; };

  // ---------- compare (i034): Compare Tray 5764:17560 + Product Comparison 5769:17230; max 4 per listing ----------
  const MAXC = 4;
  const cmpSets = new Map();      // listing path -> Set of SKUs
  const cmpOf = path => { if (!cmpSets.has(path)) cmpSets.set(path, new Set()); return cmpSets.get(path); };
  const tray = (path, set) => {
    if (!set.size) return '';
    const ps = [...set].map(Catalog.bySku).filter(Boolean);
    const slots = ps.map(p => `<div class="ct-item"><span class="ct-thumb" aria-hidden="true">${pic(p)}</span><span class="ct-info">` +
      `<span class="t-caption-upper ct-brand">${esc(p.brand)}</span><span class="t-caption-sb ct-name">${esc(p.name)}</span></span>` +
      `<button class="ct-x t-body" type="button" data-uncompare="${esc(p.sku)}" aria-label="Remove ${esc(p.name)}">×</button></div>`);
    for (let i = ps.length; i < MAXC; i++) slots.push(`<div class="ct-item is-empty t-caption">${i === ps.length ? 'Select another product' : ''}</div>`);
    const ok = ps.length >= 2;
    return `<section class="ctray" aria-label="Compare"><div class="plp-row ct-in"><div class="ct-sel">${slots.join('')}</div>` +
      `<div class="ct-act"><p class="t-caption ct-n">${ps.length} product${ps.length > 1 ? 's' : ''} selected</p><div class="ct-row">` +
      `<a class="ct-go t-small-sb${ok ? '' : ' is-off'}" ${ok ? `href="${path}/compare?skus=${ps.map(p => encodeURIComponent(p.sku)).join(',')}"` : 'aria-disabled="true"'}>Compare Products</a>` +
      `<button class="ct-clear t-caption" type="button" data-plp="cmp-clear">Clear all</button></div></div></div></section>`;
  };

  // ---------- pages ----------
  const listing = (o) => {
    // o: { c, k, q, base, trail, title, count, desc, kids, search }
    const isParent = !!o.kids;
    const st = read(o.q, FACETS);
    let base = o.base;
    const total = base.length;
    if (o.c && st.preset && !/^all-/.test(st.preset)) base = base.filter(p => p.preset === st.preset);
    const hits = sorted(base.filter(p => matches(p, st.sel)), st.sort);
    const per = isParent ? 8 : 9, pages = Math.max(1, Math.ceil(hits.length / per));
    st.page = Math.min(st.page, pages);
    const shown = hits.slice((st.page - 1) * per, st.page * per);
    const set = cmpOf(o.path);
    const grid = shown.length ? `<div class="plp-grid${mode === 'list' ? ' is-list' : ''}">${shown.map(p => (mode === 'list' ? row : card)(p, set.has(p.sku))).join('')}</div>${pager(hits.length, st.page, per)}`
      : `<div class="plp-empty"><p class="t-title">No products match these filters</p><button class="fclear t-small-sb" type="button" data-plp="clear">Clear all filters</button></div>`;
    let html = crumbs(o.trail) + banner(o.title, o.count, o.desc) + chips(o.c, st, FACETS);
    if (isParent) {
      html += o.kids + toolbar(st) + `<div class="plp-row plp-main is-parent"><div class="plp-res">${grid}</div></div>`;
    } else {
      html += `<div class="ct-slot">${tray(o.path, set)}</div>` + toolbar(st) + `<div class="plp-row plp-main">${sidebar(base, st, FACETS)}<div class="plp-res">${grid}</div></div>`;
    }
    return { html: `<div class="plp${isParent ? ' plp-parent' : ''}">${html}</div>${cta()}`, state: st, path: o.path };
  };

  const category = (c, k, q) => {
    let base = Catalog.list(c.slug, k && k.slug);
    if (!k) { // Parent "Relevance" (Figma 5773:18196): the first 4 of every child category, then the rest
      const head = c.children.flatMap(x => base.filter(p => p.child === x.slug).slice(0, 4));
      base = head.concat(base.filter(p => !head.includes(p)));
    }
    const sel = q.get('brand'), brandQ = sel ? '?brand=' + sel : '';
    const trail = [['Home', '#/'], [c.name, k ? '#/' + c.slug : '']];
    if (k) trail.push([k.name, '']);
    const r = listing({ c, k, q, base, trail, path: '#/' + c.slug + (k ? '/' + k.slug : ''),
      title: k ? k.name : c.name, count: k ? base.length : null, desc: k ? k.description : '',
      kids: k ? null : `<div class="plp-row plp-kids">${c.children.map(x => `<a class="cbadge" href="#/${c.slug}/${x.slug}${brandQ}"><span class="cb-img" aria-hidden="true">${kidImg(c, x)}</span><span class="t-title">${esc(x.name)}</span></a>`).join('')}</div>` });
    r.title = k ? k.name + ' · ' + c.name : c.name;
    return r;
  };

  // i033: Search Results 5764:15995 (Context Banner Type=Search, chip Type=Primary) and No Results 5764:16773
  const hay = p => (p.brand + ' ' + p.name + ' ' + p.sku + ' ' + (p.mpn || '') + ' ' + p.specs.join(' ')).toLowerCase();
  const search = q => {
    const term = (q.get('q') || '').trim();
    const words = term.toLowerCase().split(/\s+/).filter(Boolean);
    const pool = PRODUCTS.filter(p => p.type !== 'bundle');
    const phrase = pool.filter(p => words.length > 1 && hay(p).includes(words.join(' ')));   // exact phrase first ("gen 2" must not match Gen 1)
    const base = phrase.length ? phrase : words.length ? pool.filter(p => words.every(w => hay(p).includes(w))) : [];
    const trail = [['Home', '#/'], ['Search', '']];
    if (!base.length) {
      const st = read(q, FACETS);
      const html = crumbs(trail) + banner('No matching products found', null, 'Try checking the product name, SKU, MPN or EAN, or remove one or more filters.') +
        chips(null, st, FACETS) +
        `<div class="plp-row plp-none"><div class="nr-act"><button class="nr-btn t-small-sb" type="button" data-plp="nr-clear">Clear filters</button>` +
        `<button class="nr-btn t-small-sb" type="button" data-plp="nr-browse">Browse all categories</button></div>` +
        `<div class="nr-help"><p class="t-small-sb">Need help sourcing a product?</p><p class="t-caption"><a data-link="nr-quote">Request a quote</a> or <a data-link="nr-talk">speak to our team</a>.</p></div></div>`;
      return { title: 'No results', html: `<div class="plp plp-noresults">${html}</div>${cta()}`, state: st, path: '#/search' };
    }
    const r = listing({ c: null, k: null, q, base, trail, path: '#/search', title: 'Search results', count: base.length, desc: `Results for "${term}"` });
    r.title = 'Search: ' + term;
    return r;
  };

  const SPEC_ROWS = [['Processor', p => p.specs[0]], ['Memory', p => p.f && p.f.ram ? p.f.ram + ' RAM' : p.specs[1]],
    ['Storage', p => p.f && p.f.storage ? p.f.storage + (/eMMC|flash/.test(p.specs[1]) ? '' : ' SSD') : '-'], ['Display', p => p.specs[2] || '-']];
  const comparison = (c, k, q) => {
    const path = '#/' + c.slug + '/' + k.slug;
    const skus = (q.get('skus') || '').split(',').map(decodeURIComponent).filter(Boolean);
    const ps = skus.map(Catalog.bySku).filter(Boolean).slice(0, MAXC);
    const set = cmpOf(path); set.clear(); ps.forEach(p => set.add(p.sku));
    const trail = [['Home', '#/'], [c.name, '#/' + c.slug], [k.name, path], ['Compare', '']];
    const isPC = c.slug === 'computers';
    const specRows = isPC ? SPEC_ROWS : [0, 1, 2].map(i => ['Key spec ' + (i + 1), p => p.specs[i] || '-']);
    const cols = ps.length || 1;
    const row = (label, f) => `<div class="cx-row"><div class="cx-l t-small">${label}</div>${ps.map(p => `<div class="cx-v t-small">${esc(f(p))}</div>`).join('')}</div>`;
    const sec = t => `<div class="cx-sec t-small-sb">${t}</div>`;
    const head = ps.map(p => { const st = stockCls(p.stock); return `<div class="cx-h"><a class="cx-img" href="${Catalog.href(p)}">${pic(p)}</a>` +
      `<p class="t-caption cx-brand">${esc(p.brand)}</p><a class="t-small-sb cx-name" href="${Catalog.href(p)}">${esc(p.name)}</a>` +
      `<p class="t-caption cx-muted">SKU: ${esc(p.sku)}</p><p class="t-caption cx-muted">MPN: ${esc(p.mpn)}</p>` +
      `<p class="t-body-sb cx-price">${money(p.price)} <span class="t-caption cx-muted">ex VAT</span></p>` +
      `<p class="t-caption-sb stk is-${st}"><i></i>${esc(p.stock)}</p>` + (st !== 'req' ? `<p class="t-caption cx-muted">Dispatch: 1–2 business days</p>` : '') +
      `<button class="cx-rm t-caption" type="button" data-cx-remove="${esc(p.sku)}">Remove</button></div>`; }).join('');
    const dispatch = p => stockCls(p.stock) === 'req' ? 'On request' : 'Dispatch: 1–2 business days';
    const html = crumbs(trail) + `<div class="plp-row cx"><header class="cx-top"><h1 class="t-h1">Compare ${esc(k.name.toLowerCase())}</h1>` +
      `<p class="t-small plp-desc">Compare key specifications, availability and pricing to choose the right configuration.</p></header>` +
      (ps.length ? `<div class="cx-t" style="--cx-n:${cols}"><div class="cx-row cx-heads"><div class="cx-l"></div>${head}</div>` +
        sec('Product overview') + row('Brand', p => p.brand) + row('Product name', p => p.name) + row('SKU', p => p.sku) + row('MPN', p => p.mpn) +
        sec('Key specifications') + specRows.map(r => row(r[0], r[1])).join('') +
        sec('Buying information') + row('Price', p => money(p.price) + ' ex VAT') + row('Availability', p => p.stock) + row('Dispatch', dispatch) +
        `<div class="cx-row cx-cta"><div class="cx-l"></div>${ps.map(p => `<div class="cx-v"><button class="atc theme-gradient t-small-sb" data-sku="${esc(p.sku)}">${ic.cart}Add</button>` +
          `<a class="pm-quote t-caption-sb" data-link="plp-quote">Get a quote  →</a></div>`).join('')}</div></div>`
        : `<div class="plp-empty"><p class="t-title">No products selected</p><a class="fclear t-small-sb" href="${path}">Back to ${esc(k.name)}  →</a></div>`) + `</div>`;
    return { title: 'Compare · ' + k.name, html: `<div class="plp plp-compare">${html}</div>${cta()}`, state: { sel: {}, sort: 'relevance', page: 1, q: '' }, path: path + '/compare', cmp: { path, skus: ps.map(p => p.sku) } };
  };

  // ---------- behaviour (one delegated set of listeners on #pgView) ----------
  let cur = null;   // { path, state, cmp }
  const go = (st, opts = {}) => {
    history.replaceState(null, '', cur.path + qs(st));
    Router.render({ keepScroll: !opts.toGrid });
    if (opts.toGrid) { const g = document.querySelector('.plp-main'); if (g) window.scrollTo(0, g.getBoundingClientRect().top + scrollY - 24); }
  };
  // re-render the tray in place (no page re-render; the content below moves, so keep the viewport on the same card)
  const repaintTray = anchor => {
    const slot = document.querySelector('.ct-slot'); if (!slot) return;
    const y0 = anchor ? anchor.getBoundingClientRect().top : 0;
    slot.innerHTML = tray(cur.path, cmpOf(cur.path));
    if (anchor && anchor.isConnected) window.scrollBy(0, anchor.getBoundingClientRect().top - y0);
    document.querySelectorAll('#pgView input[data-compare]').forEach(i => { i.checked = cmpOf(cur.path).has(i.dataset.compare); });
  };
  const view = document.getElementById('pgView');
  view.addEventListener('change', e => {
    if (!cur) return;
    const t = e.target, st = cur.state;
    if (t.dataset.facet) {
      const k = t.dataset.facet, a = new Set(st.sel[k] || []);
      t.checked ? a.add(t.value) : a.delete(t.value);
      st.sel[k] = [...a]; st.page = 1; open[k] = true; go(st);
    } else if (t.dataset.plp === 'sort') { st.sort = t.value; st.page = 1; go(st); }
    else if (t.dataset.compare) {
      const set = cmpOf(cur.path), sku = t.dataset.compare;
      if (t.checked && set.size >= MAXC) { t.checked = false; const n = document.querySelector('.ct-n'); if (n) { n.textContent = 'Up to ' + MAXC + ' products'; n.classList.add('is-max'); } return; }
      t.checked ? set.add(sku) : set.delete(sku);
      repaintTray(t.closest('.plc, .plr'));
    }
  });
  view.addEventListener('click', e => {
    if (!cur) return;
    const st = cur.state;
    const acc = e.target.closest('[data-acc]');
    if (acc) { const k = acc.dataset.acc, box = acc.parentElement, o = !box.classList.contains('is-open');
      open[k] = o; box.classList.toggle('is-open', o); acc.setAttribute('aria-expanded', o); return; }
    const chip = e.target.closest('[data-chip]');
    if (chip) { const k = chip.dataset.chip;
      if (k === 'q') { location.hash = '#/'; return; }   // removing the search query leaves the search
      if (k === 'f') st.preset = null; else st.sel[k] = (st.sel[k] || []).filter(v => v !== chip.value);
      st.page = 1; go(st); return; }
    const act = e.target.closest('[data-plp]'); const a = act && act.dataset.plp;
    if (a === 'view-grid' || a === 'view-list') { const m = a === 'view-list' ? 'list' : 'grid'; if (m === mode) return;   // v0.14.4 (i100)
      mode = m; try { localStorage.setItem('dd-plp-view', m); } catch (er) {} Router.render({ keepScroll: true }); return; }
    if (a === 'clear') { st.sel = {}; st.preset = null; st.page = 1; go(st); return; }
    if (a === 'nr-clear') { location.hash = '#/'; return; }
    if (a === 'nr-browse') { window.scrollTo(0, 0); if (typeof MegaMenu !== 'undefined' && MegaMenu) setTimeout(() => MegaMenu.open('computers'), 0); return; }
    if (a === 'cmp-clear') { cmpOf(cur.path).clear(); repaintTray(null); return; }
    const un = e.target.closest('[data-uncompare]');
    if (un) { cmpOf(cur.path).delete(un.dataset.uncompare); repaintTray(null); return; }
    const rm = e.target.closest('[data-cx-remove]');
    if (rm && cur.cmp) { const left = cur.cmp.skus.filter(s => s !== rm.dataset.cxRemove);
      location.hash = left.length ? cur.cmp.path + '/compare?skus=' + left.map(encodeURIComponent).join(',') : cur.cmp.path; return; }
    const pg = e.target.closest('[data-page]');
    if (pg && !pg.disabled) { st.page = +pg.dataset.page; go(st, { toGrid: true }); return; }
    const save = e.target.closest('.plc-save');
    if (save) { save.classList.toggle('is-on'); save.lastChild.textContent = save.classList.contains('is-on') ? 'Saved' : 'Save'; }
  });
  // v0.13 (i043): sidebar Quick Order opens the Quick Order popup with the typed code looked up
  view.addEventListener('submit', e => { if (!e.target.matches('[data-plp="quick-order"]')) return; e.preventDefault();
    const v = e.target.querySelector('.qo-in').value.trim(); location.hash = '#/quick-order' + (v ? '?code=' + encodeURIComponent(v) : ''); });

  const keep = r => { cur = { path: r.path, state: r.state, cmp: r.cmp || null }; return r; };
  return {
    render: (c, k, q) => keep(category(c, k, q)),
    search: q => keep(search(q)),
    compare: (c, k, q) => keep(comparison(c, k, q)),
    leave() { cur = null; }
  };
})();
