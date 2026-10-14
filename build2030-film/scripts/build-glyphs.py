"""
Contornos vetoriais da Mona Sans (instância wght 680 / wdth 112, a display N1 do filme V3),
com kerning do GPOS e o tracking do filme (−0,045 em), para animar tipografia como linha:
desenhar o contorno, morphing, extrair hastes, nós e réguas a partir das próprias letras.

Saída: src/data/glyphs.json, coordenadas em milésimos de em, y para baixo, baseline em 0.
Uso: python3 scripts/build-glyphs.py
"""
import json

from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

SRC = 'public/fonts/MonaSans-var.woff2'
WORDS = [
    'DIRECTION', 'BUILD 2030', 'BUILD', 'SCALE', 'LEAD',
    'BRAND & MARKETING DIRECTION', 'NEW TECHNOLOGIES & AI',
    'UMA GAVEA.', 'MÚLTIPLAS CAPACIDADES.', 'ONE STOP SHOP',
    'PLANEJAR.', 'PRIORIZAR.', 'CONECTAR.', 'ACOMPANHAR.',
    'DUAS FRENTES.', 'UMA MESMA DIREÇÃO.',
    'MARCA.', 'PRESENÇA.', 'OPORTUNIDADES.', 'CONEXÃO.', 'INTELIGÊNCIA.',
    'PROCESSOS.', 'CONHECIMENTO.', 'DECISÃO.', 'CONSTRUIR.', 'ESCALAR.', 'LIDERAR.', 'AERA',
]
TRACKING = -0.02  # em, igual a displayStyle()

font = TTFont(SRC)
axes = {a.axisTag: (a.minValue, a.maxValue) for a in font['fvar'].axes}
loc = {}
if 'wght' in axes:
    loc['wght'] = 680
if 'wdth' in axes:
    loc['wdth'] = 112
font = instancer.instantiateVariableFont(font, loc, overlap=instancer.OverlapMode.REMOVE)  # contornos fundidos: o modo contorno não mostra sobreposição
upem = font['head'].unitsPerEm
S = 1000 / upem
cmap = font.getBestCmap()
gs = font.getGlyphSet()
hmtx = font['hmtx']
os2 = font['OS/2']


def pair_kerning():
    """Pares de kerning (Format 1 e 2) da feature kern do GPOS."""
    kern = {}
    if 'GPOS' not in font:
        return kern
    gpos = font['GPOS'].table
    lookups = set()
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag == 'kern':
            lookups.update(fr.Feature.LookupListIndex)
    for li in sorted(lookups):
        lk = gpos.LookupList.Lookup[li]
        for st in lk.SubTable:
            if lk.LookupType == 9:
                st = st.ExtSubTable
            if getattr(st, 'Format', None) == 1 and hasattr(st, 'PairSet'):
                cov = st.Coverage.glyphs
                for i, ps in enumerate(st.PairSet):
                    for pvr in ps.PairValueRecord:
                        v = getattr(pvr.Value1, 'XAdvance', 0) if pvr.Value1 else 0
                        if v:
                            kern.setdefault((cov[i], pvr.SecondGlyph), v)
            elif getattr(st, 'Format', None) == 2:
                cov = st.Coverage.glyphs
                c1 = st.ClassDef1.classDefs if st.ClassDef1 else {}
                c2 = st.ClassDef2.classDefs if st.ClassDef2 else {}
                for g1 in cov:
                    k1 = c1.get(g1, 0)
                    rec = st.Class1Record[k1]
                    for g2, k2 in list(c2.items()) + []:
                        v = rec.Class2Record[k2].Value1
                        x = getattr(v, 'XAdvance', 0) if v else 0
                        if x:
                            kern.setdefault((g1, g2), x)
    return kern


KERN = pair_kerning()


def glyph(ch):
    name = cmap[ord(ch)]
    pen = SVGPathPen(gs)
    # y para baixo, em milésimos de em
    gs[name].draw(TransformPen(pen, (S, 0, 0, -S, 0, 0)))
    bp = BoundsPen(gs)
    gs[name].draw(bp)
    xmin, ymin, xmax, ymax = bp.bounds or (0, 0, 0, 0)
    return name, pen.getCommands(), hmtx[name][0] * S, [xmin * S, -ymax * S, xmax * S, -ymin * S]


out = {
    'upem': upem,
    'tracking': TRACKING,
    'capHeight': getattr(os2, 'sCapHeight', 0) * S,
    'xHeight': getattr(os2, 'sxHeight', 0) * S,
    'ascender': os2.sTypoAscender * S,
    'descender': os2.sTypoDescender * S,
    'words': {},
}
for word in WORDS:
    x = 0.0
    glyphs = []
    prev = None
    for ch in word:
        name, d, adv, bbox = glyph(ch)
        if prev is not None:
            x += KERN.get((prev, name), 0) * S
        glyphs.append({'ch': ch, 'x': round(x, 2), 'adv': round(adv, 2), 'd': d, 'bbox': [round(v, 2) for v in bbox]})
        x += adv + TRACKING * 1000
        prev = name
    inked = [g for g in glyphs if g['d']]
    width = inked[-1]['x'] + inked[-1]['bbox'][2]
    out['words'][word] = {'width': round(width, 2), 'glyphs': glyphs}
    print(f'{word:26s} width {width / 1000:.3f} em · kerning pairs aplicados: {sum(1 for a, b in zip(word, word[1:]) if (cmap[ord(a)], cmap[ord(b)]) in KERN)}')

json.dump(out, open('src/data/glyphs.json', 'w'))
print('capHeight', out['capHeight'], 'axes', axes, '→', loc, '· pares de kerning', len(KERN))
