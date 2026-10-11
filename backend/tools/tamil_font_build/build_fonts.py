"""Convert the owner's STMZH legacy Tamil fonts (8-bit "symbol" encoding) into
Unicode OpenType fonts for the Tamil-style panel.

Usage (from the folder that contains backend/):
    pip install fonttools brotli
    python backend/tools/tamil_font_build/build_fonts.py "path/to/tamil font" out_dir

Writes out_dir/MLATamil-NNN.ttf (copy to backend/app/fonts) and
out_dir/MLATamil-NNN.woff2 (copy to frontend/public/fonts/tamil).
map_final.json = legacy byte -> Unicode text (checked glyph by glyph).
"""
import json, sys, os, glob, unicodedata
from fontTools.ttLib import TTFont, newTable
from fontTools.ttLib.tables._c_m_a_p import cmap_format_4
from fontTools.feaLib.builder import addOpenTypeFeaturesFromString
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

HERE = os.path.dirname(os.path.abspath(__file__))
MAP = {int(k): v for k, v in json.load(open(os.path.join(HERE, 'map_final.json'), encoding='utf-8')).items()}
NOTO = TTFont(os.path.join(HERE, '..', '..', 'app', 'fonts', 'NotoSansTamil.ttf'))
MARKS_FROM_NOTO = [0x0BBF, 0x0BC0, 0x0BC1, 0x0BC2, 0x0BCD]   # ி ீ ு ூ ் (standalone fallbacks)

def build(src, out_ttf, out_woff2, family, ps, scale=1.0):
    f = TTFont(src)
    # device-metric / hinting tables are invalid after renaming, adding and scaling glyphs
    for tag in ('hdmx', 'LTSH', 'VDMX', 'kern', 'fpgm', 'prep', 'cvt ', 'gasp'):
        if tag in f: del f[tag]
    for gname in f.getGlyphOrder():
        gl = f['glyf'][gname]
        if hasattr(gl, 'program'): gl.program = __import__('fontTools.ttLib.tables.ttProgram', fromlist=['Program']).Program(); gl.program.fromBytecode(b'')
    order = f.getGlyphOrder()
    old = f['cmap'].getcmap(3, 0).cmap            # 0xF0xx -> glyph name
    glyf, hmtx = f['glyf'], f['hmtx']
    def nonempty(g):
        gl = glyf[g]
        return gl.numberOfContours != 0
    uni = {}            # codepoint -> glyph
    ligs = []           # (component codepoints, glyph)
    used = {}
    for code, text in MAP.items():
        g = old.get(0xF000 + code)
        if not g or not nonempty(g):
            continue
        # rename glyph to a meaningful unique name
        cps = [ord(c) for c in text]
        new = 'tam_' + '_'.join(f'{c:04X}' for c in cps)
        used[g] = new
        if len(cps) == 1:
            uni[cps[0]] = new
        else:
            ligs.append((cps, new))
    # extra aliases
    if 0x2019 in uni: uni.setdefault(0x0027, uni[0x2019])
    if 0x002D in uni: uni.setdefault(0x2212, uni[0x002D])
    sp = old.get(0xF020)
    if sp: used[sp] = 'space'; uni[0x20] = 'space'; uni[0xA0] = 'space'
    # rename glyphs
    rename = {g: used.get(g, g if g in ('.notdef', '.null', 'nonmarkingreturn') else f'legacy{i:03d}')
              for i, g in enumerate(order)}
    f.setGlyphOrder([rename[g] for g in order])
    newglyf = {rename[g]: glyf[g] for g in order}
    newhm = {rename[g]: hmtx[g] for g in order}
    glyf.glyphs = newglyf; glyf.glyphOrder = f.getGlyphOrder()
    hmtx.metrics = newhm
    if 'post' in f:
        f['post'].formatType = 2.0; f['post'].extraNames = []; f['post'].mapping = {}
    # standalone vowel-sign / pulli fallbacks copied from Noto Sans Tamil (both UPM 1000)
    ncmap = NOTO.getBestCmap(); ngs = NOTO.getGlyphSet()
    order2 = f.getGlyphOrder()
    for cp in MARKS_FROM_NOTO:
        if cp in uni: continue
        name = f'tam_{cp:04X}'
        pen = TTGlyphPen(None)
        ngs[ncmap[cp]].draw(pen)
        glyf.glyphs[name] = pen.glyph()
        hmtx.metrics[name] = (NOTO['hmtx'][ncmap[cp]][0], NOTO['hmtx'][ncmap[cp]][1])
        order2.append(name); uni[cp] = name
    # zero-width joiners
    for cp in (0x200C, 0x200D):
        name = f'uni{cp:04X}'
        glyf.glyphs[name] = TTGlyphPen(None).glyph(); hmtx.metrics[name] = (0, 0)
        order2.append(name); uni[cp] = name
    f.setGlyphOrder(order2); glyf.glyphOrder = order2
    f['maxp'].numGlyphs = len(order2)
    # two-part vowel signs ொ ோ ௌ: give them a cmap entry so no engine falls back to another
    # font for them; shapers decompose them (and 'ccmp' does it here as a safety net).
    split = {}
    for cp, parts in ((0x0BCA, (0x0BC6, 0x0BBE)), (0x0BCB, (0x0BC7, 0x0BBE)), (0x0BCC, (0x0BC6, 0x0BD7))):
        if cp in uni or not all(p in uni for p in parts): continue
        name = f'tam_{cp:04X}'
        glyf.glyphs[name] = TTGlyphPen(None).glyph(); hmtx.metrics[name] = (0, 0)
        order2.append(name); uni[cp] = name; split[name] = [uni[p] for p in parts]
    f.setGlyphOrder(order2); glyf.glyphOrder = order2
    f['maxp'].numGlyphs = len(order2)
    # every ligature component must exist
    ligs = [(c, g) for c, g in ligs if all(x in uni for x in c)]
    # cmap: Unicode BMP (3,1) + (0,3)
    cm = newTable('cmap'); cm.tableVersion = 0; cm.tables = []
    for pid, eid in ((0, 3), (3, 1)):
        t = cmap_format_4(4); t.platformID = pid; t.platEncID = eid; t.language = 0; t.cmap = dict(uni)
        cm.tables.append(t)
    f['cmap'] = cm
    # GSUB: ligatures, longest first
    ligs.sort(key=lambda x: -len(x[0]))
    rules = '\n'.join('    sub ' + ' '.join(uni[c] for c in comps) + f' by {g};' for comps, g in ligs)
    feats = ['akhn', 'pres', 'abvs', 'blws', 'psts', 'haln', 'liga']
    fea = ['languagesystem DFLT dflt;', 'languagesystem tml2 dflt;', 'languagesystem taml dflt;',
           'lookup TAMIL_LIGS {', rules, '} TAMIL_LIGS;']
    if split:
        fea.append('feature ccmp { ' + ' '.join(f'sub {g} by {" ".join(p)};' for g, p in split.items()) + ' } ccmp;')
    for ft in feats:
        fea.append(f'feature {ft} {{ lookup TAMIL_LIGS; }} {ft};')
    # GDEF: every glyph is a base glyph -> no mark zeroing / fallback mark positioning
    allg = ' '.join(g for g in order2 if g not in ('.notdef',))
    fea.append(f'table GDEF {{ GlyphClassDef [{allg}], , , ; }} GDEF;')
    addOpenTypeFeaturesFromString(f, '\n'.join(fea))
    # metrics: fit the real glyph box so nothing is clipped
    gs = f.getGlyphSet(); ymax = 0; ymin = 0
    for g in order2:
        bp = BoundsPen(gs); gs[g].draw(bp)
        if bp.bounds: ymin = min(ymin, bp.bounds[1]); ymax = max(ymax, bp.bounds[3])
    asc, desc = int(max(ymax, f['hhea'].ascent)) + 20, int(min(ymin, f['hhea'].descent)) - 20
    f['hhea'].ascent, f['hhea'].descent, f['hhea'].lineGap = asc, desc, 0
    o = f['OS/2']
    o.usWinAscent, o.usWinDescent = asc, -desc
    o.sTypoAscender, o.sTypoDescender, o.sTypoLineGap = asc, desc, 0
    o.fsSelection |= (1 << 7)                     # USE_TYPO_METRICS
    o.usFirstCharIndex, o.usLastCharIndex = min(uni), min(max(uni), 0xFFFF)
    o.ulUnicodeRange1 = (1 << 0) | (1 << 20)      # Basic Latin + Tamil (bit 20)
    o.ulUnicodeRange2 = o.ulUnicodeRange3 = o.ulUnicodeRange4 = 0
    if o.version < 4:
        o.version = 4
        o.sxHeight, o.sCapHeight, o.usDefaultChar, o.usBreakChar, o.usMaxContext = 500, 700, 0, 32, 4
    o.ulCodePageRange1, o.ulCodePageRange2 = 1, 0
    # names
    name = f['name']; name.names = []
    for nid, val in ((0, 'Converted to Unicode from the owner-supplied STMZH legacy font.'), (1, family), (2, 'Regular'),
                     (3, f'{ps};Unicode'), (4, family), (5, 'Version 2.0 (Unicode)'), (6, ps)):
        name.setName(val, nid, 3, 1, 0x409); name.setName(val, nid, 1, 0, 0)
    f['head'].created = f['head'].modified = 3786543600
    if abs(scale - 1.0) > 1e-3:   # match Noto Sans Tamil's visual size (consonant height)
        from fontTools.ttLib.scaleUpem import scale_upem
        scale_upem(f, round(1000 * scale))
        f['head'].unitsPerEm = 1000
    f.save(out_ttf)
    f.flavor = 'woff2'; f.save(out_woff2)
    return len(uni), len(ligs)

SCALE = {'089': 1.348, '090': 1.474, '103': 1.36, '105': 1.333, '108': 1.335, '111': 1.509, '123': 1.359,
         '126': 1.222, '130': 1.856, '132': 1.474, '133': 1.391, '138': 1.463, '144': 1.303}

if __name__ == '__main__':
    src_dir, out_dir = sys.argv[1], sys.argv[2]
    os.makedirs(out_dir, exist_ok=True)
    for src in sorted(glob.glob(os.path.join(src_dir, '*.TTF')) + glob.glob(os.path.join(src_dir, '*.ttf'))):
        num = os.path.basename(src).lower().replace('.ttf', '').replace('st-', '').replace('st_', '')
        fam = f'MLA Tamil {num}'; ps = f'MLATamil-{num}'
        n, l = build(src, os.path.join(out_dir, f'MLATamil-{num}.ttf'), os.path.join(out_dir, f'MLATamil-{num}.woff2'), fam, ps, SCALE[num])
        print(src, '->', ps, 'chars', n, 'ligatures', l)
