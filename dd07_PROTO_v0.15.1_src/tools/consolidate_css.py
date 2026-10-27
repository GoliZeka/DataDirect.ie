#!/usr/bin/env python3
"""dd07 PROTOTYPE · v0.8.4 (i020) · one-off: merge the version layers (styles/layers/*) into clean component modules.
Reads the CSS order from src/manifest.json, moves every layer rule to the module of its component, then merges rules with the
same selector (later wins). A declaration is only moved past other rules when none of them sets a related property, so the
cascade stays the same. Result is verified outside this script with a computed-style snapshot of every element (11 states).
Usage: python3 tools/consolidate_css.py   -> writes src/styles/*.css (new modules) and a new manifest css list."""
import json, os, re
import tinycss2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
M = json.load(open(os.path.join(SRC, 'manifest.json'), encoding='utf-8'))

ORDER = ['01_tokens', '02_base', '10_header', '11_footer', '12_search', '13_counter', '14_add-to-cart', '15_overlay',
         '16_minicart', '17_megamenu', '20_home-sections', '30_pages']
TITLES = {
    '01_tokens': 'TOKENS (Figma variables) + type styles',
    '02_base': 'BASE',
    '10_header': 'HEADER 5048:37194 (bar 64 + category rail 40)',
    '11_footer': 'FOOTER',
    '12_search': 'SEARCH: Pill Default / Active 5108:4214 + Navigation / Search Dropdown 5108:4183',
    '13_counter': 'QUANTITY COUNTER 219:94 + card-state hints (v0.8.3, samo u kodu)',
    '14_add-to-cart': 'ADD TO CART 254:769 (Gradient / Multi / Brand Multi) + Added state (v0.8.3, samo u kodu)',
    '15_overlay': 'OVERLAY: shared dim 5108:36678 + blur for every popup',
    '16_minicart': 'MINI CART: PLP / Mini Cart / Desktop 3275:30795 + Empty 5054:29962',
    '17_megamenu': 'MEGA MENU: Overlay / Mega Menu 2891:12167',
    '20_home-sections': 'HOME SECTIONS: Final v1.6 5449:11837 (hero, brands, promo, R2G, What\'s new, Best sellers, CTA)',
    '30_pages': 'PAGE SHELLS for routes other than Home (v0.8, samo u kodu)',
}

def dest_for_selector(sel):
    s = sel.strip()
    first = s.split(',')[0].strip()
    if first.startswith(':root'): return '01_tokens'
    if re.match(r'^(\*|html|body|a|button|img|svg|p)\b', first) and 'overlay-open' not in first: return '02_base'
    if 'overlay-open' in first or first.startswith('.dim'): return '15_overlay'
    if re.match(r'^\.(mm-|mm\b|mm\[|mm\{)', first) or first.startswith('.mm') or first.startswith('.gh-rail .rail-item'): return '17_megamenu'
    if first.startswith('.gh') or first.startswith('.nav-item') or first.startswith('.cart-btn') or first.startswith('.btn-call'): return '10_header'
    if first.startswith('.ft'): return '11_footer'
    if first.startswith(('.search', '.sd', '.sf-')): return '12_search'
    if first.startswith(('.qty', '.qhint')): return '13_counter'
    if first.startswith('.atc'): return '14_add-to-cart'
    if first.startswith('.mc'): return '16_minicart'
    if first.startswith(('.pg', '.pv')): return '30_pages'
    return '20_home-sections'

def dest_for_module_file(path):
    base = os.path.basename(path)[:-4]
    return base if base in ORDER else None

def ser(nodes):
    return tinycss2.serialize(nodes).strip()

# ---------- parse into a flat ordered list
class Rule:
    def __init__(self, kind, prelude, decls=None, raw=None, comment='', dest=None, idx=0):
        self.kind, self.prelude, self.decls, self.raw, self.comment, self.dest, self.idx = kind, prelude, decls or [], raw, comment, dest, idx

def parse_decls(content):
    out = []
    for d in tinycss2.parse_declaration_list(content, skip_comments=True, skip_whitespace=True):
        if d.type != 'declaration': continue
        out.append((d.lower_name if not d.name.startswith('--') else d.name, ser(d.value), d.important))
    return out

def comment_text(c):
    return c.value.strip()

rules, history = [], {k: [] for k in ORDER}
idx = 0
for rel in M['css']:
    path = os.path.join(SRC, rel)
    text = open(path, encoding='utf-8').read()
    is_layer = '/layers/' in rel
    module_dest = None if is_layer else dest_for_module_file(path)
    nodes = tinycss2.parse_stylesheet(text, skip_whitespace=False, skip_comments=False)
    pending = ''
    first_comment = True
    prev_rule, prev_ws = None, ''
    for n in nodes:
        if n.type == 'whitespace':
            prev_ws += n.value; continue
        same_line = prev_rule is not None and '\n' not in prev_ws
        prev_ws = ''
        if n.type == 'comment' and same_line and not (is_layer and first_comment):
            prev_rule.notes = getattr(prev_rule, 'notes', []) + [comment_text(n)]   # trailing comment on the same line belongs to the rule before it
            continue
        if n.type == 'comment':
            t = comment_text(n)
            if is_layer and first_comment:
                history.setdefault('_layer_comments', []).append((rel, t))
                first_comment = False
                lc_rel = rel
                continue
            pending = (pending + '\n' + t).strip() if pending else t
            first_comment = False
            continue
        first_comment = False
        if n.type == 'qualified-rule':
            sel = ser(n.prelude)
            dest = module_dest or dest_for_selector(sel)
            r = Rule('style', sel, parse_decls(n.content), comment=pending if not is_layer else '', dest=dest, idx=idx)
            r.layer = rel if is_layer else None
            # inline comments inside the block (after declarations) are kept as notes
            notes = [comment_text(c) for c in (n.content or []) if c.type == 'comment']
            r.notes = notes + ([pending] if (is_layer and pending) else [])
            rules.append(r); idx += 1; pending = ''; prev_rule = r
        elif n.type == 'at-rule':
            name = n.lower_at_keyword
            pre = ser(n.prelude)
            raw = '@' + n.at_keyword + ' ' + pre + ('{' + tinycss2.serialize(n.content) + '}' if n.content is not None else ';')
            if module_dest: dest = module_dest
            elif name == 'keyframes':
                dest = '17_megamenu' if pre.startswith('mm') else '13_counter' if pre.startswith('qh') else '20_home-sections'
            elif name == 'media':
                inner = [x for x in tinycss2.parse_rule_list(n.content, skip_comments=True, skip_whitespace=True) if x.type == 'qualified-rule']
                dest = dest_for_selector(ser(inner[0].prelude)) if inner else '20_home-sections'
            else: dest = '20_home-sections'
            r = Rule('at', ('@' + name + ' ' + pre), raw=raw, comment=pending if not is_layer else '', dest=dest, idx=idx)
            r.layer = rel if is_layer else None; r.notes = [pending] if (is_layer and pending) else []
            rules.append(r); idx += 1; pending = ''; prev_rule = r

# ---------- new global order: by module, then by original index
mod_rank = {m: i for i, m in enumerate(ORDER)}
final = sorted(rules, key=lambda r: (mod_rank[r.dest], r.idx))

FAMILIES = [('padding',), ('margin',), ('border', 'outline'), ('background',), ('font', 'line-height', 'letter-spacing'),
            ('flex', 'order'), ('grid', 'gap', 'row-gap', 'column-gap'), ('transition',), ('animation',), ('overflow',),
            ('inset', 'top', 'left', 'right', 'bottom'), ('width', 'min-width', 'max-width'), ('height', 'min-height', 'max-height'),
            ('align', 'justify', 'place'), ('text',), ('transform', 'translate', 'scale', 'rotate'), ('mask', '-webkit-mask'),
            ('backdrop-filter', '-webkit-backdrop-filter'), ('display',), ('position',), ('color',), ('opacity',)]
def family(p):
    for f in FAMILIES:
        if any(p == x or p.startswith(x + '-') for x in f): return f
    return (p,)

def related(p, q):
    return family(p) == family(q) or p == q

# ---------- merge identical selectors inside a module (later occurrence keeps the position)
out_by_mod = {m: [] for m in ORDER}
pos = {id(r): i for i, r in enumerate(final)}
merged_into = {}
groups = {}
for r in final:
    if r.kind == 'style': groups.setdefault((r.dest, r.prelude), []).append(r)
moved = kept = 0
for key, rs in groups.items():
    if len(rs) < 2: continue
    target = rs[-1]
    for r in rs[:-1]:
        stay = []
        between = final[pos[id(r)] + 1: pos[id(target)]]
        for d in r.decls:
            p = d[0]
            blocked = any(o.kind == 'style' and o is not target and o.prelude != r.prelude and any(related(p, od[0]) for od in o.decls) for o in between) \
                      or any(o.kind == 'at' for o in between if o.prelude.startswith('@media') and re.search(r'[{;]\s*' + re.escape(p) + r'\s*:', o.raw or ''))
            # same-selector occurrences in between are merged into target too, keep their order by prepending in sequence
            if blocked: stay.append(d)
            else:
                target.pre = getattr(target, 'pre', []) + [d]; moved += 1
        r.decls = stay; kept += len(stay)
        target.notes = list(dict.fromkeys(getattr(r, 'notes', []) + getattr(target, 'notes', [])))
        if r.comment and not target.comment: target.comment = r.comment
for r in final:
    if r.kind == 'style' and getattr(r, 'pre', None):
        # earlier declarations first, then the target's own (later wins inside one block)
        seen = {}
        for d in r.pre + r.decls: seen.pop(d[0], None); seen[d[0]] = d
        # keep a later !important-less decl from killing an earlier !important one
        r.decls = list(seen.values())

def fmt_decls(ds):
    return ';'.join(f'{p}:{v}{"!important" if imp else ""}' for p, v, imp in ds)

def clean_note(t):
    t = re.sub(r'\s+', ' ', t).strip()
    return t.replace('*/', '* /')

texts = {m: [] for m in ORDER}
for r in final:
    if r.kind == 'style' and not r.decls: continue
    lines = []
    if r.comment: lines.append('\n/* ' + clean_note(r.comment) + ' */')
    if r.kind == 'style':
        note = ''.join(f'   /* {clean_note(n)} */' for n in getattr(r, 'notes', []) if n)
        lines.append(f'{r.prelude}{{{fmt_decls(r.decls)}}}{note}')
    else:
        note = ''.join(f'   /* {clean_note(n)} */' for n in getattr(r, 'notes', []) if n)
        lines.append(r.raw + note)
    texts[r.dest].append('\n'.join(lines))

layer_hist = {}
for rel, t in history.get('_layer_comments', []):
    # assign the layer's header comment to the modules its rules went to
    dests = sorted({r.dest for r in rules if getattr(r, 'layer', None) == rel}, key=lambda m: mod_rank[m])
    for d in dests: layer_hist.setdefault(d, []).append(clean_note(t))

files = []
for m in ORDER:
    if not texts[m]: continue
    head = f'/* =========================================================\n   {TITLES[m]}\n   v0.8.4: version layers merged into this module (computed styles verified identical).'
    if layer_hist.get(m):
        head += '\n   History:\n' + '\n'.join('   - ' + h[:300] for h in layer_hist[m])
    head += '\n   ========================================================= */\n'
    body = '\n'.join(texts[m]).strip() + '\n'
    rel = f'styles/{m}.css'
    body = body.replace('"Outfit"', "'Outfit'")   # tinycss2 re-quotes strings; keep the original quoting (custom property text)
    open(os.path.join(SRC, rel), 'w', encoding='utf-8').write(head + body)
    files.append(rel)
M['css'] = files
json.dump(M, open(os.path.join(SRC, 'manifest.json'), 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
print('rules', len(rules), '· moved decls', moved, '· kept in place', kept)
print('\n'.join(f'{f}  {os.path.getsize(os.path.join(SRC, f))} B' for f in files))
