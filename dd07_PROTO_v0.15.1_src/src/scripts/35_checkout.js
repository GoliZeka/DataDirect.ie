/* ===== Cart + Checkout popup (v0.11, m06 - i040 Cart / i041 Checkout).
   Figma: Checkout / Popup / Desktop 5819:2896 (50_CART_CHECKOUT > 02b_PAGE_TEMPLATES), one variant per screen:
   Screen=Cart 5819:1542 · Step 1 5819:1890 · Step 2 5819:2237 · Step 3 5819:2584 · Confirmation 5819:2895.
   Parts: Commerce / Order Summary 5818:314 (Type=Cart | Checkout), Checkout / Stepper 5818:357, Form / Radio Card 5818:366,
   Checkout / Recap Tile 5818:404, Cart / Line Item 5446:32988 (Default | Summary), Form / Input 5680:3354,
   Form / Checkbox 2548:6883, Commerce / Delivery Info Chip 5717:3410, Button / Primary Theme=Checkout 5663:3626, Button / Close 5726:3214.
   Routes: #/cart · #/checkout (step 1) · #/checkout/2 · #/checkout/3 · #/checkout/done.
   v0.13 (m07 - i043 Quick Order / i044 RFQ): same popup. Figma: Quick Order & RFQ / Popup / Desktop 5828:24175 (60_QUICK_ORDER_RFQ):
   QO Empty 5828:1094 · QO Items 5826:22889 · QO Invalid Code 5828:1604 · RFQ Form 5826:22927 · RFQ Sent 5826:22969, DEV NOTE 5828:25533.
   Routes: #/quick-order[?code=&qty=] · #/quote[?sku=&qty= | ?from=qo] · #/quote/sent. The popup opens over the page that was
   open (that page stays rendered under the blur); close (✕, Esc, click on the dim, Continue shopping) goes back to it.
   Lines come from MiniCart (DEMO cart, max 7). Prices ex VAT; Delivery €15 ex VAT (Ireland only); VAT 23% on subtotal + delivery.
   v0.12 (i084): now in Figma too: Screen=Cart Empty 5823:1144, Screen=Step 1 Error 5823:1648 (Form / Input State=Error 5822:22576,
   State=Focus 5822:22574), Screen=Step 3 Error 5823:1922, DEV NOTE / Cart & checkout popup 5823:24369. ===== */
const CheckoutPopup = (() => {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const money = n => '€' + n.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const DELIVERY = 15, VAT = 0.23;
  const ic = {
    minus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H13" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor"/></svg>',
    plus: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8H8M8 8H13M8 8V3M8 8V13" stroke-width="1.5" stroke-linejoin="round" stroke="currentColor"/></svg>',
    close: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.33" stroke-linecap="round"/></svg>',
    truck: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"><path d="M1.33 3.33h8.67v7.34H1.33zM10 6h2.67l2 2.33v2.34H10"/><circle cx="4.33" cy="12" r="1.33"/><circle cx="11.67" cy="12" r="1.33"/></svg>',
    check: '<svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="M6 14.5l5 5L22 8.5" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  // DEMO content from Figma (same on every screen)
  const form = {
    company: 'Acme Logistics Ltd', vat: 'IE1234567T', first: 'Aoife', last: 'Murphy', email: 'aoife.murphy@acmelogistics.ie',
    phone: '+353 1 555 0142', po: 'PO-24-0815', addr1: 'Unit 4, Park West Business Park', addr2: 'Nangor Road', town: 'Dublin 12',
    eircode: 'D12 X2K7', sameBilling: true, pay: 'card', terms: false,
    needBy: '15 Nov 2026', notes: 'Delivery to two sites, please quote 3-year warranty.'
  };
  const PAY = { card: 'Credit / debit card', bank: 'Bank transfer (pro forma invoice)' };
  const STEPS = ['Company & contact', 'Delivery address', 'Review & pay'];
  const F1 = [['company', 'Company', 1], ['vat', 'VAT number (optional)'], ['first', 'First name', 1], ['last', 'Last name', 1],
    ['email', 'Email', 1, 'email'], ['phone', 'Phone', 1, 'tel'], ['po', 'PO reference (optional)']];
  const F2 = [['addr1', 'Address line 1', 1], ['addr2', 'Address line 2 (optional)'], ['town', 'Town / City', 1], ['eircode', 'Eircode', 1]];
  const F3 = [['company', 'Company', 1], ['email', 'Email', 1, 'email'], ['first', 'First name', 1], ['last', 'Last name', 1], ['phone', 'Phone', 1, 'tel'], ['needBy', 'Quote needed by']];
  let orderNo = 104582, placed = null;
  // Quick Order list (own list until Add all to cart) + RFQ
  const qo = []; let qoErr = false, qoCode = '';
  let rfqNo = 20431, rfqLines = [], rfqSent = null;   // placed = snapshot for the confirmation screen

  const root = document.createElement('div');
  root.className = 'co'; root.hidden = true;
  root.innerHTML = '<div class="co-dim"></div><div class="co-panel" role="dialog" aria-modal="true" aria-label="Cart"><div class="co-body"></div>' +
    `<button class="co-x" type="button" aria-label="Close">${ic.close}</button></div>`;
  document.body.appendChild(root);
  const panel = root.querySelector('.co-panel'), body = root.querySelector('.co-body');
  let screen = null, back = '#/';

  // ---------- data ----------
  const product = l => PRODUCTS.find(p => p.sku === l.sku) || PRODUCTS.find(p => p.name === l.name);
  const thumb = p => p && p.img && ASSETS['p/' + p.img] ? `<img alt="" src="${ASSETS['p/' + p.img]}">` : '';
  const totals = lines => { const sub = lines.reduce((s, l) => s + l.unit * l.qty, 0); const del = lines.length ? DELIVERY : 0;
    const vat = Math.round((sub + del) * VAT * 100) / 100; return { sub, del, vat, total: sub + del + vat }; };

  // ---------- parts ----------
  // Commerce / Order Summary 5818:314
  const summary = (lines, withItems, title = 'Order summary', rm = '') => { const t = totals(lines);   // rm = remove action (✕ on rows, v0.13.1); empty = read-only
    const row = (a, b, cls = '') => `<div class="co-sl${cls}"><span>${a}</span><span>${b}</span></div>`;
    return `<aside class="co-sum${withItems ? ' is-checkout' : ''}"><h2 class="co-sum-t">${title}</h2>` +
      (withItems ? `<div class="co-sum-items">${lines.map((l, i) => { const p = product(l);
        return `<div class="co-li-s"><div class="co-th s48">${thumb(p)}</div><div class="co-li-tx"><p class="t-small-sb co-nm">${esc(l.name)}</p>` +
          `<p class="t-caption co-li-m"><span class="t-caption-sb">Qty ${l.qty}</span>· ${money(l.unit)} ex VAT</p></div>` +
          (rm ? `<button class="co-rm" type="button" data-act="${rm}" data-i="${i}" aria-label="Remove ${esc(l.name)}">✕</button>` : '') + `</div>`; }).join('')}</div><hr class="co-div">` : '') +
      row('Subtotal (ex VAT)', money(t.sub)) + row('Delivery (ex VAT)', money(t.del)) + row('VAT (23%)', money(t.vat)) +
      '<hr class="co-div">' + row('Total (inc VAT)', money(t.total), ' is-total') + '</aside>';
  };
  // Checkout / Stepper 5818:357 (Step=N)
  const stepper = n => `<nav class="co-steps" aria-label="Checkout steps">${STEPS.map((s, i) => { const k = i + 1;
    const st = k < n ? 'done' : k === n ? 'active' : 'up';
    const inner = `<span class="co-idx">${st === 'done' ? '✓' : k}</span><span class="co-sl-t">${s}</span>`;
    return st === 'done' ? `<a class="co-step is-done" href="#/checkout${k > 1 ? '/' + k : ''}">${inner}</a>`
      : `<span class="co-step is-${st} s${k}"${st === 'active' ? ' aria-current="step"' : ''}>${inner}</span>`; }).join('')}</nav>`;
  const field = ([k, label, req, type]) => `<label class="co-f"><span class="t-caption-sb co-lb">${label}${req ? ' *' : ''}</span>` +
    `<input class="co-in t-body" name="${k}" type="${type || 'text'}" value="${esc(form[k])}"${req ? ' required' : ''} autocomplete="off"></label>`;
  const cb = (name, label, on) => `<label class="co-cb"><input type="checkbox" name="${name}"${on ? ' checked' : ''}><span class="box" aria-hidden="true"></span><span class="t-small-sb">${label}</span></label>`;
  const btn = (label, act) => `<button class="co-btn t-body-sb" type="button" data-act="${act}">${label}</button>`;
  const backLink = to => `<a class="co-back t-small-sb" href="${to}">←  Back</a>`;
  // Checkout / Recap Tile 5818:404
  const tile = (title, lines, edit) => `<div class="co-tile"><div class="co-tile-h"><span class="t-small-sb">${title}</span>${edit ? `<a class="t-caption-sb co-edit" href="${edit}">Edit</a>` : ''}</div>` +
    `<p class="t-caption co-tile-b">${lines.map(esc).join('<br>')}</p></div>`;
  const recapCompany = () => [`${form.company}${form.vat ? ' · VAT ' + form.vat : ''}`, `${form.first} ${form.last} · ${form.email}`, [form.phone, form.po].filter(Boolean).join(' · ')];
  const recapAddr = (billing = true) => [[form.addr1, form.addr2].filter(Boolean).join(', '), `${form.town}, ${form.eircode}, Ireland`]
    .concat(billing ? [form.sameBilling ? 'Billing address same as delivery' : 'Separate billing address (on the invoice)'] : []);

  // ---------- screens ----------
  // Cart / Line Item Size=Default (cart + Quick Order rows). Low stock = "· Low stock · only N available" in status/warning (QO Items 5826:22889)
  const lineRow = (l, i) => { const p = product(l);
    const low = p && /low/i.test(p.stock) && p.qty > 0;
    const stock = p ? p.stock.charAt(0) + p.stock.slice(1).toLowerCase() : 'In stock';   // Figma: "In stock"
    return `<div class="co-li" data-i="${i}"><div class="co-th">${thumb(p)}</div><div class="co-li-tx">` +
      `<p class="t-caption-sb co-eb">${esc(p ? p.brand : '')}</p><p class="t-body co-nm">${esc(l.name)}</p>` +
      `<p class="t-caption ${low ? 'co-warn' : 'co-muted'}">${esc(l.sku)} · ${esc(stock)}${low ? ' · only ' + p.qty + ' available' : ''}</p></div>` +
      `<div class="co-pr"><p class="t-body-sb">${money(l.unit)}</p><p class="t-caption co-muted">ex VAT</p></div>` +
      `<div class="qty" data-max="${p && p.qty > 0 ? p.qty : 9999}"><button class="qty-btn dec" aria-label="Decrease">${ic.minus}</button>` +
      `<input class="qty-val t-small-sb" type="text" inputmode="numeric" maxlength="4" value="${l.qty}" role="spinbutton" aria-label="Quantity" aria-valuemin="1">` +
      `<button class="qty-btn inc" aria-label="Increase">${ic.plus}</button></div>` +
      `<button class="co-rm" type="button" aria-label="Remove ${esc(l.name)}">✕</button></div>`; };
  const counter = () => `<div class="qty" data-max="9999"><button class="qty-btn dec" aria-label="Decrease">${ic.minus}</button>` +
    `<input class="qty-val t-small-sb" type="text" inputmode="numeric" maxlength="4" value="1" role="spinbutton" aria-label="Quantity" aria-valuemin="1">` +
    `<button class="qty-btn inc" aria-label="Increase">${ic.plus}</button></div>`;
  const btn2 = (label, act, dis) => `<button class="co-btn2 t-body-sb" type="button" data-act="${act}"${dis ? ' disabled' : ''}>${label}</button>`;   // Button / Secondary 5826:8973
  const head = (title, sub) => `<div class="co-head"><h1 class="co-title">${title}</h1><p class="t-body co-sec">${sub}</p></div>`;
  const cartScreen = () => { const lines = MiniCart.lines;
    if (!lines.length) return `<h1 class="co-title">Your cart</h1><div class="co-cols"><div class="co-main co-list is-empty">` +
      `<p class="t-body-sb">Your cart is empty</p><p class="t-small co-muted">Browse categories, or reorder fast by SKU with Quick Order.</p></div>` +
      `<div class="co-side">${summary(lines)}<a class="co-btn t-body-sb is-brand" href="#/">Start shopping</a></div></div>`;
    return `<h1 class="co-title">Your cart</h1><div class="co-cols"><div class="co-main co-list">${lines.map(lineRow).join('')}</div>` +
      `<div class="co-side">${summary(lines)}${btn('Proceed to checkout', 'checkout')}<a class="co-cont t-caption-sb" href="#" data-act="close">Continue shopping  →</a></div></div>`;
  };
  // Quick Order (QO Empty / Items / Invalid Code)
  const qoScreen = () => { const empty = !qo.length;
    return head('Quick Order', 'Add products by SKU, MPN or EAN, set the quantity, then add everything to the cart in one go. Prices ex VAT.') +
      `<div class="qk-look"><form class="qk-row" data-act-form="look" novalidate>` +
      `<input class="co-in t-body${qoErr ? ' is-error' : ''}" name="code" placeholder="Enter SKU, MPN or EAN" value="${esc(qoCode)}" autocomplete="off" aria-label="SKU, MPN or EAN">` +
      `${counter()}<button class="co-btn t-body-sb is-brand" type="submit">Add</button>${btn2('Upload CSV', 'csv')}</form>` +
      `<p class="t-caption qk-err"${qoErr ? '' : ' hidden'} role="alert">We couldn’t find a product with this SKU, MPN or EAN. Check the code and try again.</p></div>` +
      `<div class="co-cols"><div class="co-main co-list${empty ? ' is-empty' : ''}">` +
      (empty ? `<p class="t-body-sb">Your quick order list is empty</p><p class="t-small co-muted">Type a SKU, MPN or EAN above, set the quantity and press Add (or Enter).</p>` : qo.map(lineRow).join('')) +
      `</div><div class="co-side">${summary(qo)}<div class="qk-acts">` +
      `<button class="co-btn t-body-sb is-brand" type="button" data-act="qo-add"${empty ? ' disabled' : ''}>Add all to cart</button>${btn2('Request a quote', 'qo-quote', empty)}</div>` +
      `<a class="co-cont t-caption-sb" href="#" data-act="close">Continue shopping  →</a></div></div>`;
  };
  // Request a quote (RFQ Form / RFQ Sent)
  const rfqScreen = () => head('Request a quote', 'Tell us what you need. Our sales team replies within 1 business day with prices for your quantities.') +
    `<div class="co-cols"><form class="co-main co-box" novalidate><h2 class="t-h2">Your details</h2><div class="co-grid">${F3.map(field).join('')}</div>` +
    `<label class="co-f"><span class="t-caption-sb co-lb">Notes (optional)</span><textarea class="co-in co-ta t-body" name="notes" rows="2">${esc(form.notes)}</textarea></label>` +
    `<div class="co-act"><p class="t-caption co-muted">Prices in the summary are indicative until we send the quote.</p>` +
    `<button class="co-btn t-body-sb is-brand" type="button" data-act="rfq-send">Send request</button></div></form>` +
    `<div class="co-side">${summary(rfqLines, true, 'Quote summary', 'rfq-rm')}</div></div>`;
  const rfqSentScreen = () => { const o = rfqSent, units = o.lines.reduce((s, l) => s + l.qty, 0);
    return `<div class="co-steps co-ok-line"><span class="co-ok">${ic.check}</span></div><div class="co-cols"><div class="co-main"><div class="co-conf">` +
      `<h1 class="t-h1">Quote requested</h1><p class="t-h2">Reference RFQ-${o.no}</p><p class="t-body co-sec">Our sales team will email ${esc(o.email)} within 1 business day.</p>` +
      `<div class="co-recap is-3">${tile('Company & contact', o.company)}${tile('Quote needed by', [o.needBy || 'No date given'].concat(o.notes ? ['Notes: ' + o.notes] : []))}` +
      `${tile('Items', [`${o.lines.length} product${o.lines.length === 1 ? '' : 's'} · ${units} unit${units === 1 ? '' : 's'}`, money(o.total) + ' inc VAT (indicative)'])}</div>` +
      `<a class="co-cont t-caption-sb" href="#/" data-act="close">Continue shopping  →</a></div></div><div class="co-side">${summary(o.lines, true, 'Quote summary')}</div></div>`;
  };
  const stepScreen = n => { const lines = MiniCart.lines; let main;
    if (n === 1) main = `<h2 class="t-h2">Company & contact</h2><div class="co-grid">${F1.map(field).join('')}</div>` +
      `<div class="co-act"><span></span>${btn('Continue to address', 'next')}</div>`;
    else if (n === 2) main = `<h2 class="t-h2">Delivery address</h2><div class="co-grid">${F2.map(field).join('')}</div>` +
      `<div class="co-bd"><div class="co-bill">${cb('sameBilling', 'Billing address is the same as delivery', form.sameBilling)}` +
      `<p class="t-caption co-muted">Uncheck for a different billing address.</p></div>` +
      `<div class="co-dlv"><div class="co-chip"><span class="co-chip-ic">${ic.truck}</span><span><span class="co-chip-t">Ireland delivery</span><span class="co-chip-p">€15 ex VAT</span></span></div>` +
      `<p class="t-caption co-muted">Irish addresses only</p></div></div>` +
      `<div class="co-act">${backLink('#/checkout')}${btn('Continue to review', 'next')}</div>`;
    else main = `<h2 class="t-h2">Review & pay</h2><div class="co-recap">${tile('Company & contact', recapCompany(), '#/checkout')}${tile('Delivery address', recapAddr(), '#/checkout/2')}</div>` +
      `<h3 class="co-h3">Select payment method</h3><div class="co-pay" role="radiogroup" aria-label="Payment method">${Object.keys(PAY).map(k =>
        `<label class="co-radio${form.pay === k ? ' is-on' : ''}"><input type="radio" name="pay" value="${k}"${form.pay === k ? ' checked' : ''}><span class="dot" aria-hidden="true"></span><span class="t-small">${PAY[k]}</span></label>`).join('')}</div>` +
      `<div class="co-terms">${cb('terms', 'I agree to the Terms & Conditions', form.terms)}</div>` +
      `<div class="co-act">${backLink('#/checkout/2')}${btn('Place order', 'place')}</div>`;
    return stepper(n) + `<div class="co-cols"><form class="co-main co-box" novalidate>${main}</form><div class="co-side">${summary(lines, true, 'Order summary', 'sum-rm')}</div></div>`;
  };
  const doneScreen = () => { const o = placed;
    return `<div class="co-steps co-ok-line"><span class="co-ok">${ic.check}</span></div><div class="co-cols"><div class="co-main"><div class="co-conf">` +
      `<h1 class="t-h1">Order confirmed</h1><p class="t-h2">Order DD-${o.no}</p><p class="t-body co-sec">A confirmation has been sent to ${esc(o.email)}.</p>` +
      `<div class="co-recap is-3">${tile('Company & contact', o.company)}${tile('Delivery address', o.addr)}${tile('Payment method', [PAY[o.pay], money(o.total) + ' inc VAT'])}</div>` +
      `<a class="co-cont t-caption-sb" href="#/" data-act="close">Continue shopping  →</a></div></div><div class="co-side">${summary(o.lines, true)}</div></div>`;
  };

  // ---------- render ----------
  const LABEL = { cart: 'Your cart', qo: 'Quick Order', rfq: 'Request a quote', 'rfq-sent': 'Quote requested' };
  const LIST = { cart: 1, qo: 1 };   // list layout (natural height); everything else = form layout (518 columns)
  const render = () => {
    panel.setAttribute('aria-label', LABEL[screen] || 'Checkout');
    panel.dataset.screen = screen; panel.dataset.layout = LIST[screen] ? 'list' : 'form';
    body.innerHTML = screen === 'cart' ? cartScreen() : screen === 'qo' ? qoScreen() : screen === 'rfq' ? rfqScreen()
      : screen === 'rfq-sent' ? rfqSentScreen() : screen === 'done' ? doneScreen() : stepScreen(screen);
    if (screen === 'cart') bindRows(MiniCart.lines, (i, q) => MiniCart.setQty(i, q), i => MiniCart.remove(i));
    if (screen === 'qo') { bindRows(qo, (i, q) => { qo[i].qty = q; }, i => qo.splice(i, 1)); }
  };
  const bindRows = (lines, setQty, remove) => {
    Counter.bind(body);
    body.querySelectorAll('.co-li').forEach(row => { const i = +row.dataset.i, l = lines[i];
      const c = Counter.all.find(x => x.el === row.querySelector('.qty')); if (c) c.set(l.qty);
      row.querySelector('.qty').addEventListener('qty:set', e => { if (e.detail.value !== l.qty) { setQty(i, e.detail.value); refreshSum(lines); } });
      row.querySelector('.co-rm').addEventListener('click', () => { remove(i); render(); });
    });
  };
  // Quick Order lookup: SKU or MPN, case and spaces ignored (DEMO catalogue has no EAN); same product again = more quantity
  const norm = v => String(v || '').toUpperCase().replace(/[\s-]/g, '');
  const lookup = (code, qty) => { const c = norm(code); if (!c) return false;
    const p = PRODUCTS.find(x => norm(x.sku) === c || norm(x.mpn) === c);
    if (!p) { qoErr = true; qoCode = code; return false; }
    const max = p.qty > 0 ? p.qty : 9999, hit = qo.find(l => l.sku === p.sku);
    if (hit) hit.qty = Math.min(max, hit.qty + qty); else qo.push({ name: p.name, sku: p.sku, unit: p.price, qty: Math.min(max, qty) });
    qoErr = false; qoCode = ''; return true; };
  const focusCode = () => { const i = body.querySelector('input[name="code"]'); if (i) i.focus(); };
  const refreshSum = lines => { const s = body.querySelector('.co-sum'); if (s) s.outerHTML = summary(lines); };
  const read = () => body.querySelectorAll('input[name]:not([name="code"]), textarea[name]').forEach(el => {
    if (el.type === 'checkbox') form[el.name] = el.checked; else if (el.type === 'radio') { if (el.checked) form.pay = el.value; } else form[el.name] = el.value.trim(); });
  const valid = () => { let ok = true;
    body.querySelectorAll('.co-in[required]').forEach(el => { const bad = !el.value.trim() || (el.type === 'email' && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
      el.classList.toggle('is-error', bad); if (bad && ok) { el.focus(); ok = false; } });
    return ok; };
  body.addEventListener('click', e => {
    const a = e.target.closest('[data-act]'); if (!a) return;
    const act = a.dataset.act;
    if (act === 'close') { e.preventDefault(); close(); }
    else if (act === 'checkout') location.hash = '#/checkout';
    else if (act === 'csv') { const t = a.textContent; a.textContent = 'Coming soon'; setTimeout(() => { a.textContent = t; }, 1500); }   // visual only in v1.0 (DEV NOTE)
    else if (act === 'qo-add') {   // Add all to cart -> mini cart "Added to cart" after the popup closes
      while (qo.length && MiniCart.add(Object.assign({}, qo[0]))) qo.shift();
      if (qo.length) render(); else close(); }
    else if (act === 'qo-quote') location.hash = '#/quote?from=qo';
    else if (act === 'sum-rm') { read(); MiniCart.remove(+a.dataset.i); if (MiniCart.lines.length) render(); else location.hash = '#/cart'; }   // v0.13.1
    else if (act === 'rfq-rm') { read(); rfqLines.splice(+a.dataset.i, 1); render(); }
    else if (act === 'rfq-send') { read(); if (!valid()) return;
      rfqSent = { no: rfqNo++, email: form.email, company: [form.company, `${form.first} ${form.last} · ${form.email}`, form.phone],
        needBy: form.needBy, notes: form.notes, lines: rfqLines.map(l => Object.assign({}, l)), total: totals(rfqLines).total };
      location.hash = '#/quote/sent'; }
    else if (act === 'next') { read(); if (valid()) location.hash = screen === 1 ? '#/checkout/2' : '#/checkout/3'; }
    else if (act === 'place') { read(); const t = body.querySelector('.co-terms');
      if (!form.terms) { t.classList.add('is-error'); return; }
      const lines = MiniCart.lines.map(l => Object.assign({}, l));
      placed = { no: orderNo++, email: form.email, company: recapCompany(), addr: recapAddr(false), pay: form.pay, lines, total: totals(lines).total };
      MiniCart.clear(); form.terms = false; location.hash = '#/checkout/done'; }
  });
  body.addEventListener('change', e => { const el = e.target;
    if (el.name === 'pay') { read(); body.querySelectorAll('.co-radio').forEach(r => r.classList.toggle('is-on', r.querySelector('input').checked)); }
    if (el.name === 'terms') { form.terms = el.checked; el.closest('.co-terms').classList.remove('is-error'); }
    if (el.name === 'sameBilling') form.sameBilling = el.checked; });
  body.addEventListener('input', e => { if (e.target.classList.contains('co-in')) e.target.classList.remove('is-error');
    if (e.target.name === 'code' && qoErr) { qoErr = false; const m = body.querySelector('.qk-err'); if (m) m.hidden = true; } });
  // Enter in the code field = Add (a page-level key handler eats the implicit form submit)
  body.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.name === 'code') { e.preventDefault(); e.target.form.requestSubmit(); } });
  body.addEventListener('submit', e => { const f = e.target.closest('[data-act-form="look"]'); if (!f) return; e.preventDefault();
    const c = Counter.all.find(x => x.el === f.querySelector('.qty')); const code = f.querySelector('input[name="code"]').value;
    if (!code.trim()) { focusCode(); return; }
    lookup(code, c ? c.value : 1); render(); focusCode(); });

  // ---------- open / close ----------
  const api = { close: () => close() };
  const show = (parts, from, q = new URLSearchParams()) => {
    const [a, b] = parts;
    if (from) back = from;
    if (a === 'quick-order' || a === 'quote') {
      if (typeof screen === 'number') read();
      if (a === 'quick-order') { screen = 'qo'; if (q.get('code')) lookup(q.get('code'), Math.max(1, parseInt(q.get('qty'), 10) || 1)); }
      else if (b === 'sent' && rfqSent) screen = 'rfq-sent';
      else { screen = 'rfq';
        const p = q.get('sku') && PRODUCTS.find(x => x.sku === q.get('sku'));
        rfqLines = p ? [{ name: p.name, sku: p.sku, unit: p.price, qty: Math.max(1, parseInt(q.get('qty'), 10) || 1) }]
          : (q.get('from') === 'qo' ? qo : MiniCart.lines).map(l => Object.assign({}, l)); }
      open(); if (screen === 'qo') focusCode(); return;
    }
    let s = a === 'cart' ? 'cart' : b === 'done' ? 'done' : b === '3' ? 3 : b === '2' ? 2 : 1;
    if (s === 'done' && !placed) s = 'cart';
    if (typeof s === 'number' && !MiniCart.lines.length) s = 'cart';   // nothing to check out
    if (s !== (a === 'cart' ? 'cart' : b === 'done' ? 'done' : +(b || 1))) { history.replaceState(null, '', s === 'cart' ? '#/cart' : s === 1 ? '#/checkout' : '#/checkout/' + s); }
    if (typeof s === 'number' && typeof screen === 'number') read();   // keep typed values between steps
    screen = s; open();
  };
  let lastFocus = null;
  const open = () => {
    if (root.hidden) { lastFocus = document.activeElement; root.hidden = false; document.body.classList.add('co-open'); Overlay.open(api); }
    render(); panel.scrollTop = 0; const b0 = body.querySelector('.co-box'); if (b0) b0.scrollTop = 0;
    panel.focus({ preventScroll: true });
  };
  const hide = () => { if (root.hidden) return; root.hidden = true; document.body.classList.remove('co-open'); Overlay.close(api);
    if (lastFocus && lastFocus.isConnected) lastFocus.focus({ preventScroll: true }); lastFocus = null;   // v0.13.3 (i046): focus goes back
    if (screen === 'done') placed = null; if (screen === 'rfq-sent') rfqSent = null; screen = null; };
  const close = () => { location.hash = back; };
  panel.tabIndex = -1;
  // v0.13.3 (i046): Tab / Shift+Tab stay inside the popup (aria-modal)
  root.addEventListener('keydown', e => { if (e.key !== 'Tab') return;
    const f = [...panel.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])')].filter(x => x.offsetParent !== null);
    if (!f.length) return; const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } });
  root.querySelector('.co-x').addEventListener('click', close);
  root.querySelector('.co-dim').addEventListener('click', close);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !root.hidden && !e.defaultPrevented) close(); });
  // v0.13: "Get a quote" / volume quote inside a product card, buy box or hover card quotes that product (qty = its counter)
  document.addEventListener('click', e => {
    const lk = e.target.closest('a[data-link$="quote"]'); if (!lk || e.button) return;
    const box = lk.closest('[data-sku], .plc, .pmaxi, .bmaxi, .sd-item'); let p = null;
    if (box) { p = box.dataset.sku && PRODUCTS.find(x => x.sku === box.dataset.sku);
      const nm = !p && box.querySelector('.nm, .name'); if (nm) p = PRODUCTS.find(x => x.name === nm.textContent.trim()); }
    if (!p) return;
    const qel = box.querySelector('.qty'), c = qel && Counter.all.find(x => x.el === qel);
    e.preventDefault(); e.stopPropagation(); location.hash = `#/quote?sku=${encodeURIComponent(p.sku)}&qty=${c ? c.value : 1}`;
  }, true);
  return { show, hide, isOpen: () => !root.hidden };
})();
