/* ===== Image fallback (v0.12, i024 temp): every DEMO product without its own photo borrows one of the images we already have,
   picked by product type and rotated so neighbours differ. Placeholder only ("any image" for now); real photos replace this
   per product later (tools/gen_catalog.py img key). Aliases point to the same data, so the file does not grow. ===== */
(() => {
  const G = {
    laptop: ['p/laptop/01', 'p/laptop/03', 'p/laptop/05', 'bs16_2', 'bs16_3', 'wn16_c1'],
    tablet: ['bs16_4', 'p/macbook/02'],
    phone: ['p/phone/01'],
    desktop: ['p/desktop-sff/01', 'p/desktop-sff/02', 'bs16_5', 'bs16_6'],
    display: ['r2g_monitor', 'p/hp-e24-desk/01', 'bs16_7', 'pdp/R2G-HDS-01/03'],
    bundle: ['pdp/R2G-HDS-01/03', 'r2g_monitor', 'bs16_7', 'r2g_dock1', 'wn16_feature', 'p/hp-e24-desk/01'],
    dock: ['r2g_dock', 'pdp/R2G-HDS-01/02', 'p/hp-dock-g5/01'],
    input: ['p/hp-435-mouse/01'],
    bag: ['p/hp-renew-backpack/01'],
    av: ['r2g_monitor', 'bs16_7', 'pdp/R2G-HDS-01/03'],
    box: ['p/desktop-sff/01', 'bs16_6', 'bs16_5', 'p/desktop-sff/02'],
    any: ['wn16_c1', 'wn16_c2', 'bs16_1', 'bs16_3', 'r2g_dock', 'bs16_4']
  };
  const T = {
    bundle: 'bundle', 'desktop-mini': 'desktop', 'desktop-tower': 'desktop', 'workstation-tower': 'desktop', 'all-in-one': 'display', 'thin-client': 'desktop',
    monitor: 'display', 'commercial-display': 'display', 'interactive-display': 'display', 'display-mount': 'display', 'monitor-arm': 'display', projector: 'display',
    smartphone: 'phone', 'rugged-phone': 'phone', tablet: 'tablet', 'windows-tablet': 'tablet',
    dock: 'dock', cable: 'dock', 'network-adapter': 'dock', sfp: 'dock', 'network-cable': 'dock',
    keyboard: 'input', mouse: 'input', 'laptop-bag': 'bag',
    headset: 'av', speakerphone: 'av', microphone: 'av', 'conference-camera': 'av', 'video-bar': 'av',
    'rack-server': 'box', 'tower-server': 'box', nas: 'box', ups: 'box', psu: 'box', 'rack-cabinet': 'box', 'external-drive': 'box',
    switch: 'box', router: 'box', firewall: 'box', 'access-point': 'box', 'laser-printer': 'box', mfp: 'box', 'label-printer': 'box',
    'receipt-printer': 'box', 'document-scanner': 'box', 'barcode-scanner': 'box'
  };
  const n = {};
  PRODUCTS.forEach(p => {
    if (p.img && ASSETS['p/' + p.img]) return;
    const g = G[T[p.type]] ? T[p.type] : 'any', list = G[g].filter(k => ASSETS[k]);
    if (!list.length) return;
    const src = list[(n[g] = (n[g] || 0) + 1) % list.length];
    ASSETS['p/x/' + src] = ASSETS[src]; p.img = 'x/' + src;
  });
})();
