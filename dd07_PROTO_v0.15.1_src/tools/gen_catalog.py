#!/usr/bin/env python3
"""dd07 PROTOTYPE · v0.8 · generates src/scripts/01_data.js (DATA, from the IA model) and 02_products.js (PRODUCTS, DEMO).
Usage: python3 tools/gen_catalog.py      (run from the project root, before build.py)
Products are DEMO only. Image rule (DD07_PRODUCT_IMAGES_004): explicit img key -> first variant of the type
-> category icon. Neighbouring cards in a listing never share the same image (checked here)."""
import json, os, re, hashlib

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IA = json.load(open(os.path.join(ROOT, 'tools', 'ia_data_002.json'), encoding='utf-8'))
IMG_DIR = os.path.join(ROOT, 'tools', 'img')
HAVE = sorted(f[:-5] for f in os.listdir(IMG_DIR) if f.endswith('.webp'))   # e.g. laptop-03
HAVE_KEYS = {re.sub(r'-(\d\d)$', r'/\1', h) for h in HAVE}                  # e.g. laptop/03

def slug(s):
    s = s.lower().replace('&', ' ').replace('+', ' plus ')
    s = re.sub(r'[^a-z0-9]+', '-', s).strip('-')
    return s

# ------------------------------------------------------------------ DATA (IA model -> routes)
def build_data():
    by_name = {c['name']: c for c in IA['categories']}
    cats = []
    for name in IA['megaMenuLeftColumn']:
        c = by_name[name]
        mm = c['megaMenu']; child_names = [k['name'] for k in c['children']]
        cols = []
        for head, items in mm.items():
            if head == 'links': continue
            is_brand = head.lower() == 'shop by brand'
            cols.append({'head': 'Shop by Brand' if is_brand else head,
                         'child': None if is_brand else slug(head),
                         'brand': is_brand,
                         'items': [{'label': i, 'slug': slug(i)} for i in items]})
        links = []
        for l in mm.get('links', []):
            t = l.rstrip(' >').strip()
            m = re.match(r'View all (.+)$', t, re.I)
            target = None
            if m:
                rest = m.group(1).lower()
                for k in c['children']:
                    if k['name'].lower() == rest: target = k['slug']
                if rest == 'brands': target = '#brands'
            links.append({'label': l, 'child': target})
        cats.append({
            'name': c['name'], 'slug': c['slug'], 'rail': c.get('rail'), 'eyebrow': c['eyebrow'],
            'longName': c.get('longName'), 'description': c.get('description', ''),
            'productCount': c.get('productCount'),
            'children': [{'name': k['name'], 'slug': k['slug'], 'description': k.get('description', ''),
                          'filters': k.get('filters', []), 'productCount': k.get('productCount')} for k in c['children']],
            'menu': {'columns': cols, 'links': links},
        })
    return {'rail': IA['categoryRail'], 'categories': cats, 'menuFooter': IA['megaMenuFooter'],
            'helpStrip': IA['parentCategoryHelpStrip'], 'availability': IA['availabilityStates']}

# ------------------------------------------------------------------ PRODUCTS (DEMO)
# "Brand | Name | preset (3rd level label) | img type | price | spec; spec; spec | sku | img key | flags"
P = {}
P['computers/laptops'] = """
HP | HP ProBook 450 G10 15.6" Intel Core i5 16GB 512GB SSD | Business Laptops | laptop | 1249.00 | Intel Core i5; 16 GB RAM · 512 GB SSD; 15.6" FHD display | 8A5K5EA | laptop/02 | best
Lenovo | Lenovo ThinkPad E16 Gen 1 16" Intel Core i7 16GB 512GB SSD | Business Laptops | laptop | 1399.00 | Intel Core i7; 16 GB RAM · 512 GB SSD; 16" FHD display | 21JT000QUK | laptop/01 | best
Dell | Dell Latitude 5540 15.6" Intel Core i7 16GB 256GB SSD | Business Laptops | laptop | 1649.00 | Intel Core i7; 16 GB RAM · 256 GB SSD; 15.6" FHD display | N024L554015 | laptop/03 | best
Apple | Apple MacBook Air 13" M3 Chip 8GB 256GB SSD | MacBooks | macbook | 1299.00 | Apple M3; 8 GB RAM · 256 GB SSD; 13.6" Liquid Retina display | MRXV3ZP/A | macbook/01 | new
ASUS | ASUS ExpertBook B5 Flip 14" Intel Core i5 16GB 512GB SSD | Business Laptops | laptop | 1189.00 | Intel Core i5; 16 GB RAM · 512 GB SSD; 14" FHD touch display | B5402FEA | laptop/04 | best
Lenovo | Lenovo ThinkPad X1 Carbon Gen 11 14" Intel Core i7 32GB 1TB SSD | Business Laptops | laptop | 2199.00 | Intel Core i7; 32 GB RAM · 1 TB SSD; 14" 2.8K OLED display | 21HM006EUK | laptop/05 | new
HP | HP EliteBook 840 G10 14" Intel Core i7 16GB 512GB SSD | Business Laptops | laptop | 1849.00 | Intel Core i7; 16 GB RAM · 512 GB SSD; 14" FHD display | 819T4EA | laptop/06 | new
Dell | Dell XPS 15 9530 15.6" Intel Core i9 32GB 1TB SSD | Business Laptops | laptop | 2449.00 | Intel Core i9; 32 GB RAM · 1 TB SSD; 15.6" 3.5K OLED display | XPS9530-I9 | laptop/02 |
Microsoft | Microsoft Surface Laptop 5 13.5" Intel Core i5 16GB 512GB SSD | Business Laptops | laptop | 1499.00 | Intel Core i5; 16 GB RAM · 512 GB SSD; 13.5" PixelSense display | RBG-00027 | laptop/03 | new
Lenovo | Lenovo ThinkPad E16 Gen 1 16" Intel Core i7 | Business Laptops | laptop | 1278.49 | Intel Core i7; 16 GB RAM · 512 GB SSD; 16" FHD display | 21JN0073UK | laptop/01 |
Lenovo | Lenovo ThinkPad E16 Gen 2 16" Intel Core Ultra 7 | Business Laptops | laptop | 1389.99 | Intel Core Ultra 7; 16 GB RAM · 512 GB SSD; 16" WUXGA display | 21MA002QUK | laptop/05 |
HP | HP ZBook Power G10 16" Intel Core i7 32GB 1TB SSD RTX A1000 | Mobile Workstations | laptop | 2349.00 | Intel Core i7; 32 GB RAM · 1 TB SSD; NVIDIA RTX A1000 | 866B2EA | laptop/06 |
ASUS | ASUS Chromebook CX1 14" Intel Celeron 8GB 64GB eMMC | Chromebooks | chromebook | 329.00 | Intel Celeron N4500; 8 GB RAM · 64 GB eMMC; ChromeOS | CX1400CKA-EK0153 | chromebook/01 |
"""
P['computers/desktops-workstations'] = """
Dell | Dell OptiPlex 7010 SFF Intel Core i5-13500 16GB 512GB SSD | Small Form Factor PCs | desktop-sff | 849.73 | Intel Core i5-13500; 16 GB RAM · 512 GB SSD; Small form factor · Win 11 Pro | 7010-SFF-I5 | desktop-sff/01 | best
HP | HP Elite Mini 800 G9 Intel Core i5-13500 16GB 512GB SSD | Desktop PCs | desktop-mini | 938.99 | Intel Core i5-13500; 16 GB RAM · 512 GB SSD; Mini PC · Win 11 Pro | 6U4Q1EA | | best
Lenovo | Lenovo ThinkCentre M70q Gen 4 Tiny Intel Core i5-13400T 16GB 512GB SSD | Desktop PCs | desktop-mini | 686.32 | Intel Core i5-13400T; 16 GB RAM · 512 GB SSD; Tiny form factor · Win 11 Pro | 12E30022UK | | best
HP | HP Z2 G9 Tower Workstation Intel Core i7-13700 32GB 1TB SSD | Workstations | workstation-tower | 1674.00 | Intel Core i7-13700; 32 GB RAM · 1 TB SSD; Tower workstation · Win 11 Pro | 5F0A7EA | | best
HP | HP Pro SFF 400 G9 Intel Core i5-12500 8GB 256GB SSD | Small Form Factor PCs | desktop-sff | 629.00 | Intel Core i5-12500; 8 GB RAM · 256 GB SSD; Small form factor | 6U4X2EA | desktop-sff/02 |
Dell | Dell OptiPlex 7410 All-in-One 23.8" Intel Core i5 16GB 512GB SSD | All-in-One PCs | all-in-one | 1129.00 | Intel Core i5-13500T; 16 GB RAM · 512 GB SSD; 23.8" FHD touch | 7410-AIO-I5 | |
Lenovo | Lenovo ThinkCentre M70t Gen 4 Tower Intel Core i7 16GB 512GB SSD | Tower PCs | desktop-tower | 899.00 | Intel Core i7-13700; 16 GB RAM · 512 GB SSD; Tower | 12DL000GUK | |
Lenovo | Lenovo ThinkCentre M90s Gen 4 SFF Intel Core i7 16GB 512GB SSD | Small Form Factor PCs | desktop-sff | 1049.00 | Intel Core i7-13700; 16 GB RAM · 512 GB SSD; Small form factor | 12HA000AUK | desktop-sff/01 |
Dell | Dell Precision 3660 Tower Intel Core i9 32GB 1TB SSD RTX A2000 | Workstations | workstation-tower | 2799.00 | Intel Core i9-13900; 32 GB RAM · 1 TB SSD; NVIDIA RTX A2000 | P3660-I9 | |
HP | HP t640 Thin Client AMD Ryzen R1505G 8GB 32GB | Thin Clients | thin-client | 449.00 | AMD Ryzen Embedded R1505G; 8 GB RAM · 32 GB flash; HP ThinPro | 6TV50EA | |
"""
# Other children: compact rows "Brand | Name | preset | img type | price | specs"
P['displays/monitors'] = """
Dell | Dell P2425H 24" FHD IPS Monitor | Business Monitors | monitor | 189.00 | 23.8" FHD IPS; 100 Hz; HDMI · DP · USB
Dell | Dell P2725HE 27" USB-C Hub Monitor | USB-C & Docking Monitors | monitor | 329.00 | 27" FHD IPS; USB-C 90 W; RJ45
LG | LG 34WP65C-B 34" Curved UltraWide | Ultrawide Monitors | monitor | 399.00 | 34" WQHD VA; 160 Hz; HDR10
Samsung | Samsung ViewFinity S6 27" QHD | Business Monitors | monitor | 279.00 | 27" QHD IPS; 100 Hz; USB-C
HP | HP E24 G5 24" FHD Monitor | Business Monitors | monitor | 179.00 | 23.8" FHD IPS; 75 Hz; HDMI · DP | 6N6E9AA | hp-e24-desk/01 |
Lenovo | Lenovo ThinkVision T27h-30 27" QHD | USB-C & Docking Monitors | monitor | 369.00 | 27" QHD IPS; USB-C 90 W; daisy chain
Lenovo | Lenovo ThinkVision M14t Gen 2 14" Portable | Portable Monitors | monitor | 319.00 | 14" 2.2K touch; USB-C; 0.6 kg
Philips | Philips 346B1C 34" Curved USB-C | Ultrawide Monitors | monitor | 449.00 | 34" WQHD VA; USB-C 90 W; KVM
Dell | Dell MDA20 Dual Monitor Arm | Monitor Accessories | display-mount | 129.00 | Up to 27"; 2 × 10 kg; Desk clamp
"""
P['displays/commercial-displays'] = """
Samsung | Samsung QM55C 55" 4K Smart Signage | Large Format Displays | commercial-display | 1149.00 | 55" UHD; 500 nits; 24/7
LG | LG 65UH5N-E 65" UHD Signage | Large Format Displays | commercial-display | 1499.00 | 65" UHD; 500 nits; webOS
Philips | Philips 43BDL4550D 43" Signage | Digital Signage | commercial-display | 699.00 | 43" FHD; 500 nits; Android SoC
Samsung | Samsung OM46B 46" Window Display | Digital Signage | commercial-display | 1899.00 | 46" FHD; 3,000 nits; Window-facing
Samsung | Samsung Flip Pro WM65B 65" Interactive | Interactive Displays | interactive-display | 2699.00 | 65" UHD touch; 20-point; Wireless share
LG | LG CreateBoard 75" Interactive Display | Interactive Displays | interactive-display | 3299.00 | 75" UHD touch; 40-point; Android
Philips | Philips 75BDL3650Q 75" Signage | Large Format Displays | commercial-display | 1999.00 | 75" UHD; 400 nits; 18/7
Dell | Dell Mobile Display Stand MDS19 | Display Mounts & Stands | display-mount | 549.00 | 55" to 86"; Height adjustable; Castors
"""
P['accessories/connectivity'] = """
HP | HP Renew Executive 16" Backpack | Laptop Bags & Cases | laptop-bag | 69.00 | Up to 16"; Recycled; RFID pocket | 6B8Y1AA | hp-renew-backpack/01 |
HP | HP USB-C Dock G5 | Docking Stations | dock | 149.00 | USB-C; 100 W PD; 2 × DP · HDMI | 5TW10AA | hp-dock-g5/01 |
Dell | Dell WD19S USB-C Dock 130W | Docking Stations | dock | 219.00 | USB-C; 130 W PD; 2 × DP · HDMI
Lenovo | Lenovo ThinkPad Universal USB-C Dock | Docking Stations | dock | 249.99 | USB-C; 90 W PD; 3 × 4K | 40AY0090UK
HP | HP Thunderbolt Dock G4 120W | Docking Stations | dock | 289.00 | Thunderbolt 4; 120 W; 2 × 4K
Anker | Anker 7-in-1 USB-C Hub | USB Hubs | usb-hub | 39.00 | USB-C; 100 W pass-through; HDMI 4K
Belkin | Belkin USB-C to USB-C Cable 2m 240W | Cables & Adapters | cable | 24.00 | USB-C; 240 W; 2 m
StarTech | StarTech USB-C to HDMI 2.1 Adapter | Cables & Adapters | cable | 34.00 | USB-C; HDMI 2.1; 8K
Lenovo | Lenovo 65W USB-C GaN Charger | Chargers & Power Adapters | charger | 59.00 | 65 W; USB-C; GaN
Targus | Targus 15.6" Classic Backpack | Laptop Bags & Cases | laptop-bag | 49.00 | Up to 15.6"; Padded; Water resistant
Dell | Dell EcoLoop Pro Sleeve 15 | Laptop Bags & Cases | laptop-bag | 35.00 | Up to 15.6"; Recycled; Slim
"""
P['accessories/peripherals'] = """
HP | HP 435 Multi-Device Wireless Mouse | Mice & Trackballs | mouse | 39.00 | Wireless · Bluetooth; 4 devices; Quiet clicks | 3B4Q5AA | hp-435-mouse/01 |
Logitech | Logitech MX Keys S Wireless Keyboard | Keyboards | keyboard | 109.00 | Wireless · Bluetooth; Backlit; UK layout
Microsoft | Microsoft Designer Compact Keyboard | Keyboards | keyboard | 69.00 | Bluetooth; Low profile; UK layout
Logitech | Logitech MX Master 3S Mouse | Mice & Trackballs | mouse | 99.00 | Wireless; 8K DPI; Quiet clicks
Logitech | Logitech Pebble Mouse 2 M350s | Mice & Trackballs | mouse | 24.00 | Bluetooth; Compact; Silent
Logitech | Logitech Brio 505 Webcam | Webcams | webcam | 119.00 | 1080p; Auto light; Privacy shutter
Jabra | Jabra Evolve2 65 Flex Headset | Headsets | headset | 229.00 | Wireless; ANC; Teams certified
Poly | Poly Blackwire 3320 USB Headset | Headsets | headset | 49.00 | USB-A; Stereo; Noise-cancelling mic
Logitech | Logitech Z207 Bluetooth Speakers | Speakers | speaker | 49.00 | Bluetooth · 3.5 mm; 10 W; Pair
"""
P['accessories/workspace'] = """
Ergotron | Ergotron LX Single Monitor Arm | Monitor Arms & Stands | monitor-arm | 189.00 | Up to 34"; Gas spring; Desk clamp
Dell | Dell Single Monitor Arm MSA20 | Monitor Arms & Stands | monitor-arm | 119.00 | Up to 38"; 10 kg; Cable routing
3M | 3M Privacy Filter 14" 16:9 | Privacy Accessories | privacy-filter | 59.00 | 14" 16:9; Matte; Reversible
Kensington | Kensington Privacy Screen 24" | Privacy Accessories | privacy-filter | 79.00 | 24" 16:9; Magnetic; Blue light
Rain Design | Rain Design mStand Laptop Stand | Laptop Stands | laptop-stand | 59.00 | Aluminium; 15.6" max; Fixed height
Kensington | Kensington SmartFit Easy Riser | Laptop Stands | laptop-stand | 45.00 | Adjustable; Up to 17"; Foldable
Fellowes | Fellowes Screen Cleaning Kit | Cleaning & Care | cleaning-kit | 12.00 | Spray + cloth; 250 ml; Anti-static
Kensington | Kensington Screen Cleaning Wipes (50) | Cleaning & Care | cleaning-kit | 9.00 | 50 wipes; Alcohol-free; Lint-free
"""
P['components-power/core-components'] = """
Kingston | Kingston FURY 32GB (2×16GB) DDR5 5600 | Memory | ram | 109.00 | 32 GB kit; DDR5 5600; CL36
Crucial | Crucial 16GB DDR5 4800 SODIMM | Memory | ram | 49.00 | 16 GB; DDR5 4800; SODIMM
Samsung | Samsung 990 PRO 1TB M.2 NVMe SSD | Internal Storage | ssd | 119.00 | 1 TB; PCIe 4.0; 7,450 MB/s
Crucial | Crucial MX500 1TB 2.5" SATA SSD | Internal Storage | ssd | 69.00 | 1 TB; SATA III; 560 MB/s
PNY | PNY NVIDIA RTX A2000 12GB | Graphics Cards | graphics-card | 649.00 | 12 GB GDDR6; 4 × mDP; 70 W
Intel | Intel Core i7-14700 Processor | Processors | cpu | 389.00 | 20 cores; 5.4 GHz; LGA1700
AMD | AMD Ryzen 7 7700 Processor | Processors | cpu | 289.00 | 8 cores; 5.3 GHz; AM5
ASUS | ASUS PRIME B760-PLUS ATX Motherboard | Motherboards | motherboard | 159.00 | LGA1700; DDR5; ATX
"""
P['components-power/power-protection'] = """
Corsair | Corsair RM750e 750W PSU | Power Supplies | psu | 109.00 | 750 W; 80+ Gold; Modular
be quiet! | be quiet! Pure Power 12 650W | Power Supplies | psu | 89.00 | 650 W; 80+ Gold; ATX 3.0
APC | APC Back-UPS Pro 1500VA | UPS Systems | ups | 289.00 | 1500 VA / 900 W; Tower; LCD
Eaton | Eaton 5PX 2200VA Rack UPS | UPS Systems | ups | 1249.00 | 2200 VA; 2U rack; Network card ready
Lenovo | Lenovo ThinkPad Battery 57+ | Batteries | battery | 129.00 | 57 Wh; Li-ion; ThinkPad T/X series
Dell | Dell 65W USB-C Adapter | Charging | charger | 49.00 | 65 W; USB-C; 1 m cable
StarTech | StarTech C13 Power Cord 2m (10 pack) | Power Cables | power-cable | 45.00 | C13 to UK; 2 m; 10 pack
APC | APC Smart-UPS 1000VA LCD | UPS Systems | ups | 549.00 | 1000 VA / 670 W; Tower; SmartConnect
"""
P['components-power/upgrade-paths'] = """
Kingston | Kingston Laptop Upgrade Kit 16GB + 1TB | Laptop Upgrades | upgrade-kit | 149.00 | 16 GB DDR5; 1 TB NVMe; Tested kit
Crucial | Crucial Laptop RAM Upgrade 32GB DDR4 | Laptop Upgrades | ram | 79.00 | 32 GB kit; DDR4 3200; SODIMM
Samsung | Samsung 870 EVO 2TB Desktop Upgrade | Desktop Upgrades | ssd | 149.00 | 2 TB; SATA; 5-year warranty
Kingston | Kingston Desktop Upgrade Kit 32GB + 2TB | Desktop Upgrades | upgrade-kit | 219.00 | 32 GB DDR5; 2 TB NVMe; Tested kit
Dell | Dell 32GB DDR5 RDIMM Server Memory | Server Upgrades | ram | 229.00 | 32 GB; DDR5 4800; ECC RDIMM
HPE | HPE 1.92TB SATA SSD Server Drive | Server Upgrades | ssd | 449.00 | 1.92 TB; SATA; Hot plug
Lenovo | Lenovo ThinkSystem 16GB TruDDR5 | Server Upgrades | ram | 139.00 | 16 GB; DDR5; ECC
Crucial | Crucial P3 Plus 2TB Laptop Upgrade | Laptop Upgrades | ssd | 119.00 | 2 TB; PCIe 4.0; M.2 2280
"""
P['print-pos/printing'] = """
HP | HP LaserJet Pro 4002dn Mono Laser | Laser Printers | laser-printer | 329.00 | Mono laser; 40 ppm; Duplex · LAN
Brother | Brother HL-L5210DN Mono Laser | Black and White Printers | laser-printer | 279.00 | Mono laser; 48 ppm; Duplex
HP | HP Color LaserJet Pro 4202dw | Color Printers | laser-printer | 449.00 | Colour laser; 33 ppm; Wi-Fi
Epson | Epson EcoTank ET-5850 | Inkjet Printers | inkjet-printer | 699.00 | Colour inkjet; Ink tank; Duplex
Canon | Canon i-SENSYS MF465dw MFP | Multifunction Printers | mfp | 399.00 | Mono laser MFP; 40 ppm; Scan · Copy · Fax
Brother | Brother MFC-L8690CDW Colour MFP | Multifunction Printers | mfp | 549.00 | Colour laser MFP; 31 ppm; NFC
HP | HP 149X High Yield Toner | Toner & Ink | toner | 189.00 | Black; 9,500 pages; Genuine
HP | HP 550-sheet Paper Tray | Printer Accessories | toner | 149.00 | 550 sheets; LaserJet Pro 4000; Add-on
"""
P['print-pos/scanning-pos'] = """
Epson | Epson WorkForce DS-790WN Scanner | Document Scanners | document-scanner | 749.00 | 45 ppm; 100-sheet ADF; Network
Canon | Canon imageFORMULA DR-C230 | Document Scanners | document-scanner | 399.00 | 30 ppm; 60-sheet ADF; USB
Zebra | Zebra DS2208 Barcode Scanner | Barcode Scanners | barcode-scanner | 119.00 | 1D/2D; USB; Stand included
Honeywell | Honeywell Voyager 1470g | Barcode Scanners | barcode-scanner | 99.00 | 1D/2D; USB; Area imager
Zebra | Zebra ZD421d Label Printer | Label Printers | label-printer | 389.00 | Direct thermal; 203 dpi; USB · LAN
Brother | Brother QL-820NWB Label Printer | Label Printers | label-printer | 189.00 | 62 mm; Wi-Fi · BT; Red/black
Star Micronics | Star Micronics TSP143IV Receipt Printer | Receipt Printers | receipt-printer | 279.00 | 80 mm; Cloud ready; USB · LAN
Epson | Epson TM-T20III Receipt Printer | Receipt Printers | receipt-printer | 159.00 | 80 mm; 250 mm/s; USB · serial
HP | HP Engage One Prime POS Terminal | POS Hardware | pos-terminal | 999.00 | 14" touch; Android; Built-in printer
"""
P['networking/network-infrastructure'] = """
Ubiquiti | Ubiquiti UniFi U7 Pro Access Point | Wireless Access Points | access-point | 189.00 | Wi-Fi 7; 6 GHz; PoE+
Cisco | Cisco Meraki MR46 Access Point | Wireless Access Points | access-point | 899.00 | Wi-Fi 6; Cloud managed; PoE
Cisco | Cisco CBS350-24P-4G Switch | Network Switches | switch | 549.00 | 24 × GbE PoE+; 4 × SFP; Managed
Netgear | Netgear GS308E 8-Port Switch | Network Switches | switch | 39.00 | 8 × GbE; Desktop; Smart managed
HPE | HPE Aruba Instant On 1930 48G Switch | Network Switches | switch | 649.00 | 48 × GbE; 4 × SFP+; Managed
DrayTek | DrayTek Vigor 2865 Router | Routers & Gateways | router | 329.00 | VDSL2 · Ethernet WAN; VPN; Dual WAN
Fortinet | Fortinet FortiGate 40F Firewall | Firewalls | firewall | 449.00 | 5 Gbps FW; SD-WAN; Desktop
Ubiquiti | Ubiquiti UniFi Cloud Gateway Ultra | Network Controllers | router | 129.00 | UniFi controller; IDS/IPS; Compact
"""
P['networking/network-accessories'] = """
StarTech | StarTech USB-C to 2.5GbE Adapter | Network Adapters | network-adapter | 39.00 | USB-C; 2.5 Gbps; Aluminium
Intel | Intel X710-DA2 10GbE Adapter | Network Adapters | network-adapter | 399.00 | 2 × SFP+; PCIe 3.0; 10 GbE
Cisco | Cisco SFP-10G-SR Transceiver | SFP & Transceivers | sfp | 179.00 | 10 GbE; Multimode; 300 m
Ubiquiti | Ubiquiti UACC-OM-MM-1G-D-2 (pair) | SFP & Transceivers | sfp | 19.00 | 1 GbE; Multimode; Pair
Excel | Excel Cat6 Patch Cable 2m Blue (10 pack) | Network Cables | network-cable | 29.00 | Cat6 U/UTP; 2 m; 10 pack
Excel | Excel Cat6A Patch Cable 5m Grey | Network Cables | network-cable | 7.00 | Cat6A; 5 m; LSOH
Lande | Lande 12U Wall Cabinet Glass Door | Racks & Cabinets | rack-cabinet | 249.00 | 12U; 600 × 450 mm; Glass door
TP-Link | TP-Link TL-POE160S PoE+ Injector | Power over Ethernet | poe-injector | 35.00 | 802.3at; 30 W; Gigabit
"""
P['networking/security-continuity'] = """
Fortinet | Fortinet FortiGate 60F Firewall | Security Appliances | firewall | 649.00 | 10 Gbps FW; SD-WAN; UTM
Sophos | Sophos XGS 107 Firewall | Security Appliances | firewall | 599.00 | 7 Gbps FW; Xstream; Desktop
WatchGuard | WatchGuard Firebox T45 | Security Appliances | firewall | 799.00 | 3.9 Gbps; PoE port; Total Security ready
APC | APC Smart-UPS 1500VA Rack 2U | UPS & Power Protection | ups | 899.00 | 1500 VA; 2U rack; SmartConnect
Eaton | Eaton 9SX 1000VA Online UPS | UPS & Power Protection | ups | 749.00 | 1000 VA; Online double conversion; Tower
Synology | Synology DS224+ 2-Bay NAS | Backup Devices | nas | 349.00 | 2 bays; Intel Celeron; 2 × GbE
Seagate | Seagate Expansion 4TB External Drive | Backup Devices | external-drive | 109.00 | 4 TB; USB 3.0; Portable
QNAP | QNAP TS-464 4-Bay NAS | Backup Devices | nas | 599.00 | 4 bays; 2.5 GbE; M.2 slots
"""
P['servers-storage/servers'] = """
Dell | Dell PowerEdge R660xs 1U Rack Server | Rack Servers | rack-server | 3499.00 | Intel Xeon Silver; 32 GB RDIMM; 1U
HPE | HPE ProLiant DL380 Gen11 2U | Rack Servers | rack-server | 5299.00 | Intel Xeon Gold; 64 GB; 2U · 8 SFF
Lenovo | Lenovo ThinkSystem SR250 V3 | Rack Servers | rack-server | 1899.00 | Intel Xeon E; 16 GB; 1U
Dell | Dell PowerEdge T360 Tower Server | Tower Servers | tower-server | 2199.00 | Intel Xeon E-2400; 16 GB; 4 × 3.5"
HPE | HPE ProLiant ML30 Gen11 | Tower Servers | tower-server | 1499.00 | Intel Xeon E-2414; 16 GB; Tower
Dell | Dell PowerEdge MX7000 Chassis | Blade Servers | blade-server | 12999.00 | 7U; 8 compute sleds; Modular
HPE | HPE 750W Flex Slot PSU | Server Components | psu | 329.00 | 750 W; Hot plug; Platinum
Dell | Dell Intel Xeon Silver 4410Y Upgrade | Server Memory & Processors | cpu | 899.00 | 12 cores; 2.0 GHz; PowerEdge 16G
"""
P['servers-storage/storage-backup'] = """
Synology | Synology DS923+ 4-Bay NAS | NAS Storage | nas | 649.00 | 4 bays; AMD Ryzen; 10 GbE ready
QNAP | QNAP TS-873A 8-Bay NAS | NAS Storage | nas | 1199.00 | 8 bays; AMD Ryzen; 2.5 GbE
Synology | Synology RS1221+ 8-Bay Rack NAS | NAS Storage | nas | 1499.00 | 8 bays; 2U rack; ECC
Dell | Dell PowerVault ME5012 SAN | SAN Storage | rack-server | 9999.00 | 12 bays; 2U; FC / iSCSI
Seagate | Seagate One Touch 5TB Portable | External Storage | external-drive | 149.00 | 5 TB; USB 3.0; Password protected
Samsung | Samsung T7 Shield 2TB Portable SSD | External Storage | external-drive | 179.00 | 2 TB; USB 3.2; IP65
Synology | Synology ActiveProtect DP320 | Backup Appliances | nas | 2499.00 | Backup appliance; 2 × 8 TB; Dedup
HPE | HPE LTO-9 Ultrium Data Cartridge | Backup Media | backup-tape | 129.00 | 18 TB native; LTO-9; WORM option
"""
P['servers-storage/infrastructure'] = """
APC | APC NetShelter SX 42U Rack | Racks & Cabinets | rack-cabinet | 1499.00 | 42U; 600 × 1070 mm; Perforated
Lande | Lande 24U Floor Cabinet | Racks & Cabinets | rack-cabinet | 549.00 | 24U; 600 × 800 mm; Glass door
APC | APC Smart-UPS 3000VA Rack 2U | UPS & Power Protection | ups | 1899.00 | 3000 VA; 2U; Network card
Eaton | Eaton 9PX 6kVA Online UPS | UPS & Power Protection | ups | 4299.00 | 6 kVA; Online; Rack/tower
Cisco | Cisco MDS 9124V Fibre Channel Switch | Storage Networking | switch | 6999.00 | 24 × 64G FC; 1U; SAN
HPE | HPE SN3600B 32Gb FC Switch | Storage Networking | switch | 7999.00 | 24 × 32G FC; 1U; SAN
Dell | Dell 32Gb FC HBA Dual Port | Storage Networking | network-adapter | 999.00 | 2 × 32G FC; PCIe; Low profile
APC | APC Rack PDU 2G Metered 1U | UPS & Power Protection | power-cable | 549.00 | 16 A; 12 × C13; Metered
"""
P['software/business-software'] = """
Microsoft | Microsoft 365 Business Standard (annual, per user) | Microsoft 365 | software | 140.40 | Annual subscription; Per user; Teams · Office apps
Microsoft | Microsoft 365 Business Premium (annual, per user) | Microsoft 365 | software | 264.00 | Annual subscription; Per user; Intune · Defender
Microsoft | Microsoft Office LTSC Standard 2024 | Productivity Suites | software | 449.00 | Perpetual; Volume licence; Windows
Adobe | Adobe Acrobat Pro for teams (annual) | Productivity Suites | software | 239.88 | Annual; Per user; PDF
Zoom | Zoom Workplace Business (annual) | Collaboration Tools | software | 199.90 | Annual; Per user; 300 participants
Microsoft | Microsoft Windows 11 Pro Upgrade | Operating Systems | software | 199.00 | Upgrade licence; ESD; 64-bit
Microsoft | Microsoft Windows Server 2025 Standard 16 Core | Operating Systems | software | 1049.00 | 16 cores; Perpetual; 2 VMs
VMware | VMware vSphere Foundation (per core, 1 yr) | Virtualisation | software | 135.00 | Per core; 1 year; Subscription
"""
P['software/security-continuity'] = """
Sophos | Sophos Intercept X Advanced (1 yr, per user) | Endpoint Protection | software | 39.00 | 1 year; Per user; EDR ready
ESET | ESET PROTECT Entry (1 yr, per seat) | Endpoint Protection | software | 32.00 | 1 year; Per seat; Cloud console
Bitdefender | Bitdefender GravityZone Business Security | Endpoint Protection | software | 29.00 | 1 year; Per device; Central console
Veeam | Veeam Data Platform Essentials (5 inst.) | Backup & Recovery | software | 999.00 | 5 instances; 1 year; Backup · replication
Acronis | Acronis Cyber Protect Standard Workstation | Backup & Recovery | software | 85.00 | 1 year; Per workstation; Backup + AV
Fortinet | FortiClient VPN/ZTNA (1 yr, 25 users) | Firewall & VPN | software | 499.00 | 25 users; 1 year; ZTNA
Microsoft | Microsoft Entra ID P1 (annual, per user) | Identity & Access Management | software | 64.80 | Annual; Per user; Conditional access
Okta | Okta Workforce SSO (annual, per user) | Identity & Access Management | software | 24.00 | Annual; Per user; SSO
"""
P['software/licensing-support'] = """
DataDirect | Microsoft Volume Licensing Review | Volume Licensing | software | 0.00 | Service; Free consultation; EA · CSP
DataDirect | Licence Management Service (per 100 seats) | License Management | software | 450.00 | Service; Per 100 seats; Quarterly report
DataDirect | Subscription Advisory Session | Subscription Advisory | software | 250.00 | Service; 2 hours; Remote
DataDirect | Renewal Management (annual) | Renewal Services | software | 600.00 | Service; Annual; Alerts · co-terming
DataDirect | Software Compliance Audit Prep | Compliance & Audit | software | 1200.00 | Service; Per audit; Report
DataDirect | Vendor Program Enrolment (Adobe VIP) | Vendor Programs | software | 0.00 | Service; Adobe VIP; Free
DataDirect | Vendor Program Enrolment (Microsoft CSP) | Vendor Programs | software | 0.00 | Service; Microsoft CSP; Free
DataDirect | Licence Optimisation Workshop | License Management | software | 950.00 | Service; Half day; On-site
"""
P['mobile-tablets/mobile'] = """
Apple | Apple iPhone 15 128GB | Business Smartphones | smartphone | 799.00 | 6.1"; 128 GB; 5G
Samsung | Samsung Galaxy S24 Enterprise Edition 128GB | Business Smartphones | smartphone | 749.00 | 6.2"; 128 GB; Knox Suite
Samsung | Samsung Galaxy XCover7 Enterprise | Rugged Devices | rugged-phone | 349.00 | 6.6"; IP68; Replaceable battery
Zebra | Zebra TC22 Mobile Computer | Rugged Devices | rugged-phone | 599.00 | 6"; Barcode imager; Android
Google | Google Pixel 8a 128GB | 5G Devices | smartphone | 469.00 | 6.1"; 128 GB; 5G
Samsung | Samsung Galaxy A35 5G 128GB | 5G Devices | smartphone | 349.00 | 6.6"; 128 GB; 5G
Apple | Apple iPhone 15 Pro 256GB | Business Smartphones | smartphone | 1199.00 | 6.1"; 256 GB; Titanium
OtterBox | OtterBox Defender Case iPhone 15 | Mobile Accessories | smartphone | 49.00 | Rugged case; Holster; iPhone 15
"""
P['mobile-tablets/tablets'] = """
Apple | Apple iPad 10.9" Wi-Fi 64GB | iPad | tablet | 399.00 | 10.9"; 64 GB; Wi-Fi
Apple | Apple iPad Air 11" M2 128GB | iPad | tablet | 649.00 | 11"; 128 GB; Apple M2
Samsung | Samsung Galaxy Tab Active5 Enterprise | Business Tablets | tablet | 499.00 | 8"; IP68; S Pen
Lenovo | Lenovo Tab M11 with Pen | Android Tablets | tablet | 229.00 | 11"; 128 GB; Pen included
Samsung | Samsung Galaxy Tab S9 FE | Android Tablets | tablet | 449.00 | 10.9"; 128 GB; S Pen
Microsoft | Microsoft Surface Pro 11 Intel Core Ultra 5 | Windows Tablets | windows-tablet | 1299.00 | 13"; 16 GB · 256 GB; Kickstand
HP | HP Elite x2 G4 Tablet | Windows Tablets | windows-tablet | 1399.00 | 13"; Intel Core i7; Detachable
Amazon | Amazon Fire HD 10 Tablet | Consumer Tablets | tablet | 149.00 | 10.1"; 32 GB; Wi-Fi
"""
P['audiovisual/video'] = """
Epson | Epson EB-L210W Laser Projector | Projectors | projector | 899.00 | WXGA; 4,500 lm; Laser
BenQ | BenQ MW560 Business Projector | Projectors | projector | 449.00 | WXGA; 4,000 lm; HDMI × 2
Samsung | Samsung QB65C 65" Meeting Display | Displays & Screens | commercial-display | 1299.00 | 65" UHD; 350 nits; 16/7
Logitech | Logitech PTZ Pro 2 Camera | Cameras & Capture | conference-camera | 849.00 | 1080p; 10× zoom; PTZ
Elgato | Elgato Cam Link 4K | Cameras & Capture | conference-camera | 129.00 | 4K capture; USB; HDMI in
Poly | Poly Studio X50 Video Bar | Video Conferencing | video-bar | 2999.00 | 4K; Teams / Zoom; All-in-one
Logitech | Logitech Rally Bar Mini | Video Conferencing | video-bar | 3199.00 | 4K; Small rooms; RightSight
Jabra | Jabra PanaCast 50 | Video Conferencing | video-bar | 1499.00 | 180° 4K; Teams; Whiteboard
"""
P['audiovisual/audio'] = """
Jabra | Jabra Evolve2 85 Headset | Headsets & Earbuds | headset | 389.00 | Wireless; ANC; Teams
Sennheiser | Sennheiser EPOS ADAPT 660 | Headsets & Earbuds | headset | 299.00 | Bluetooth; ANC; UC certified
Jabra | Jabra Evolve2 Buds | Headsets & Earbuds | headset | 249.00 | True wireless; ANC; Teams
Jabra | Jabra Speak2 75 Speakerphone | Speakerphones | speakerphone | 299.00 | Bluetooth · USB; 4 mics; Teams
Poly | Poly Sync 20 Speakerphone | Speakerphones | speakerphone | 129.00 | Bluetooth · USB; Small rooms
Bose | Bose S1 Pro+ Portable PA | PA & Sound Systems | pa-speaker | 699.00 | Bluetooth; Battery; Mixer
Shure | Shure MV7+ USB Microphone | Microphones | microphone | 279.00 | USB-C · XLR; Podcast; Touch panel
Sennheiser | Sennheiser TeamConnect Ceiling Medium | Microphones | microphone | 1999.00 | Ceiling array; Dante; Mid-size rooms
"""

BUNDLES = [  # Home R2G (DEMO). Card links -> #/product/<sku>
    ('R2G-HDS-01', 'Hybrid Desk Starter', 1449.00, 1550.00, ['Laptop', 'Dock', '24" Monitor']),
    ('R2G-MRK-02', 'Meeting-Ready Kit', 1649.00, 1780.00, ['Laptop', 'Dock', '24" Monitor', 'Headset']),
    ('R2G-FWP-03', 'Full Workstation Pack', 1779.00, 1940.00, ['Laptop', 'Dock', '24" Monitor', 'Keyboard', 'Headset']),
    ('R2G-FWP-04', 'Full Workstation Pack', 1779.00, 1940.00, ['Laptop', 'Dock', '24" Monitor', 'Keyboard', 'Headset']),
    ('R2G-RWK-05', 'Remote Worker Kit', 1329.00, 1420.00, ['Laptop', 'Dock', '24" Monitor']),
    ('R2G-DSS-06', 'Dual Screen Setup', 919.00, 980.00, ['Laptop', '24" Monitor']),
    ('R2G-ONB-07', 'Onboarding Starter', 1569.00, 1690.00, ['Laptop', 'Dock', '24" Monitor', 'Headset']),
    ('R2G-CRP-08', 'Conference Room Pack', 2149.00, 2310.00, ['Headset', 'Dock', '24" Monitor', 'Webcam', 'Speakerphone']),
    ('BND-E16-DOCK-24', 'ThinkPad E16 Gen 1 + USB-C Dock + 24" Monitor', 1742.48, 1842.47, ['Laptop', 'Dock', '24" Monitor']),
]

STOCK = [('In Stock', 64), ('In Stock', 120), ('In Stock', 38), ('Low Stock', 9), ('In Stock', 210),
         ('Low Stock', 3), ('In Stock', 55), ('To Order', 0), ('In Stock', 17), ('On Request', 0), ('In Stock', 92), ('Low Stock', 6)]

def h(s, n=6):
    return hashlib.md5(s.encode()).hexdigest()[:n].upper()

def first_variant(t):
    ks = sorted(k for k in HAVE_KEYS if k.split('/')[0] == t)
    return ks[0] if ks else None

# v0.9 (i029 / i081): 4 stock states (Limited merged into Low Stock); PLP Figma 5764:14455 stock per product; previous price
OVERRIDE = {
    '8A5K5EA': {'was': 1449.00},   # v0.10: PDP 5810:22999 shows Save €200 / 14%
    'N024L554015': {'stock': 'Low Stock', 'qty': 6}, 'B5402FEA': {'stock': 'Low Stock', 'qty': 4, 'was': 1278.49},
    '12E30022UK': {'stock': 'Low Stock', 'qty': 5}, 'XPS9530-I9': {'stock': 'To Order', 'qty': 0},
    '5F0A7EA': {'stock': 'To Order', 'qty': 0}, '21HM006EUK': {'stock': 'On Request', 'qty': 0},
}

def facets(p):
    """v0.9 (i031): filter fields for the PLP sidebar, parsed from name + specs (computers only)."""
    if p['cat'] != 'computers' or p['type'] == 'bundle': return None
    txt = p['name'] + ' ' + ' '.join(p['specs'])
    f = {}
    m = re.search(r'(\d{2}(?:\.\d)?)"', p['name'])
    if m: f['screen'] = m.group(1) + '"'
    for k, rx in [('Intel Core Ultra 7', r'Core Ultra 7'), ('Intel Core i9', r'Core i9'), ('Intel Core i7', r'Core i7'),
                  ('Intel Core i5', r'Core i5'), ('Intel Celeron', r'Celeron'), ('Apple M3', r'Apple M3|M3 Chip'), ('AMD Ryzen', r'Ryzen')]:
        if re.search(rx, txt): f['cpu'] = k; break
    m = re.search(r'(\d+) GB RAM', txt)
    if m: f['ram'] = m.group(1) + ' GB'
    m = re.search(r'RAM · (\d+) (GB|TB)', txt)
    if m: f['storage'] = m.group(1) + ' ' + m.group(2)
    f['os'] = 'macOS' if p['brand'] == 'Apple' else 'ChromeOS' if 'ChromeOS' in txt else 'HP ThinPro' if 'ThinPro' in txt else 'Windows 11 Pro'
    return f

def build_products():
    out = []
    for key, block in P.items():
        cat, child = key.split('/')
        rows = [r for r in block.strip().split('\n') if r.strip()]
        last_img = None
        for i, r in enumerate(rows):
            f = [x.strip() for x in r.split('|')] + [''] * 9
            brand, name, preset, typ, price, specs, sku, img, flags = f[:9]
            sku = sku or (re.sub(r'[^A-Z0-9]', '', brand.upper())[:3] + '-' + h(name))
            img = img if img in HAVE_KEYS else (first_variant(typ) if not img else None)
            # neighbour rule: if the same image as the previous card, try the next variant of the type
            if img and img == last_img:
                vs = sorted(k for k in HAVE_KEYS if k.split('/')[0] == typ)
                alt = [v for v in vs if v != last_img]
                img = alt[0] if alt else img
            st, qty = STOCK[(i + len(key)) % len(STOCK)]
            if flags: st, qty = 'In Stock', 40 + 7 * i      # Home cards show "In Stock"
            out.append({'sku': sku, 'mpn': sku, 'brand': brand, 'name': name, 'cat': cat, 'child': child,
                        'preset': slug(preset), 'type': typ, 'price': float(price),
                        'specs': [s.strip() for s in specs.split(';') if s.strip()],
                        'stock': st, 'qty': qty, 'img': img, 'tags': [t for t in flags.split(',') if t]})
            last_img = img
            o = out[-1]; o.update(OVERRIDE.get(o['sku'], {}))
            fx = facets(o)
            if fx: o['f'] = fx
    for sku, name, price, was, items in BUNDLES:
        out.append({'sku': sku, 'mpn': sku, 'brand': 'Bundle', 'name': name, 'cat': 'computers', 'child': 'laptops',
                    'preset': 'bundles', 'type': 'bundle', 'price': price, 'was': was,
                    'specs': [f'{len(items)} items'] + [', '.join(items)], 'stock': 'In Stock', 'qty': 40,
                    'img': None, 'tags': ['bundle'], 'items': items})
    skus = [p['sku'] for p in out]
    assert len(skus) == len(set(skus)), 'duplicate SKU'
    return out

def check(products):
    from collections import defaultdict
    g = defaultdict(list)
    for p in products:
        if p['type'] != 'bundle': g[(p['cat'], p['child'])].append(p)
    for k, ps in g.items():
        assert 8 <= len(ps) <= 13, (k, len(ps))
        for a, b in zip(ps, ps[1:]):
            assert not (a['img'] and a['img'] == b['img']), ('same image on neighbours', k, a['name'], b['name'])
    return {f'{k[0]}/{k[1]}': len(v) for k, v in g.items()}

if __name__ == '__main__':
    data = build_data(); products = build_products(); counts = check(products)
    hdr = '/* GENERATED by tools/gen_catalog.py from tools/ia_data_002.json - do not edit by hand */\n'
    open(os.path.join(ROOT, 'src/scripts/01_data.js'), 'w', encoding='utf-8').write(
        hdr + 'const DATA = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n')
    open(os.path.join(ROOT, 'src/scripts/02_products.js'), 'w', encoding='utf-8').write(
        hdr.replace('from tools/ia_data_002.json', '(DEMO catalogue)') +
        'const PRODUCTS = [\n' + ',\n'.join(json.dumps(p, ensure_ascii=False, separators=(',', ':')) for p in products) + '\n];\n')
    print(len(data['categories']), 'categories ·', len(products), 'products ·', len(counts), 'listings')
    print(counts)
