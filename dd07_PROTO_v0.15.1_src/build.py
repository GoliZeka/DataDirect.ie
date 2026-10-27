#!/usr/bin/env python3
"""dd07 PROTOTYPE · build: src/ -> dist/<name>.html (one self-contained file) + dist/<name>_src.zip
Usage: python3 build.py [version]      (default version from VERSION file)
Order of CSS / JS / HTML parts lives in src/manifest.json (cascade order matters)."""
import json, os, sys, zipfile
ROOT = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(ROOT, 'src')
rd = lambda p: open(os.path.join(SRC, p), encoding='utf-8').read()
M = json.load(open(os.path.join(SRC, 'manifest.json'), encoding='utf-8'))
ver = sys.argv[1] if len(sys.argv) > 1 else open(os.path.join(ROOT, 'VERSION')).read().strip()

def assets_js():
    return rd('assets/assets_head.js') + rd('assets/assets.json') + rd('assets/assets_tail.js')

def build():
    css = ''.join(rd(p) for p in M['css'])
    out = [M['head'], M['style_tags'][0], rd('styles/00_font.css'), '</style>', M['mid_head'],
           M['style_tags'][1], css, '</style>', M['after_css'], ''.join(rd(p) for p in M['body'])]
    groups = M['js_groups']
    for k, g in enumerate(groups):
        out.append(M['script_tags'][k])
        out.append(assets_js() if g == 'ASSETS' else ''.join(rd(p) for p in g))
        out.append('</script>')
        if k < len(M['glue']): out.append(M['glue'][k])
    out.append(M['tail'])
    return ''.join(out)

if __name__ == '__main__':
    name = M.get('name', 'dd07_PROTO') + f'_v{ver}'
    dist = os.path.join(ROOT, 'dist'); os.makedirs(dist, exist_ok=True)
    html = build(); open(os.path.join(dist, name + '.html'), 'w', encoding='utf-8', newline='').write(html)
    with zipfile.ZipFile(os.path.join(dist, name + '_src.zip'), 'w', zipfile.ZIP_DEFLATED) as z:
        for base in ('build.py', 'VERSION', 'README.md'):
            if os.path.exists(os.path.join(ROOT, base)): z.write(os.path.join(ROOT, base), base)
        for d, _, fs in [w for top in (SRC, os.path.join(ROOT, 'tools')) for w in os.walk(top)]:
            for f in fs: z.write(os.path.join(d, f), os.path.relpath(os.path.join(d, f), ROOT))
    print(f'{name}.html  {len(html.encode())/1024:.1f} KB')
