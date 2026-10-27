# dd07 PROTOTYPE - izvori (v0.15.1)
Build: `python3 build.py [verzija]` -> `dist/dd07_PROTO_v<verzija>.html` (jedan self-contained fajl) + `_src.zip`.
Katalog / IA: `python3 tools/gen_catalog.py` (piše `src/scripts/01_data.js` i `02_products.js`), pa build.
Redosled delova (CSS kaskada, JS, HTML) je u `src/manifest.json`.

- `src/styles/` (od v0.8.4 bez slojeva po verzijama, svaki modul ima u zaglavlju Figma izvor i istoriju):
  00 font · 01 tokens + tipografija · 02 base · 10 header · 11 footer · 12 search · 13 counter + hint oblačići ·
  14 add to cart · 15 overlay · 16 mini cart · 17 mega menu · 20 home sekcije · 30 privremene strane (shells) · 31 PLP · 32 PDP · 33 cart + checkout popup
- Nova CSS izmena: ide direktno u modul svoje komponente, sa komentarom (verzija, tracker stavka, Figma node).
- `src/scripts/` 00 LINKS · 01 DATA · 02 PRODUCTS · 10 Cart · 11 Overlay · 12 Search · 20 Carousel · 21 Rails ·
  22 klik na linkove · 23 Counter · 24 MiniCart · 25 stanja kartica · 31 MegaMenu · 33 PLP · 34 PDP · 35 Cart + Checkout popup · 30 Router · 32 hero klik
- `src/partials/` body, header (search panel, mini cart, rail), mega menu, dim, footer · `src/pages/home/` sekcije + main omotači
- `src/assets/assets.json` slike (WebP/SVG base64; proizvodi pod `p/<tip>/<nn>`)
- `tools/` gen_catalog.py, ia_data_002.json, img/ (WebP 640), consolidate_css.py (jednokratno, v0.8.4)
