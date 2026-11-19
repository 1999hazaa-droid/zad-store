# -*- coding: utf-8 -*-
"""إطار توليد الوسائل التعليمية (ملصقات، خرائط ذهنية، عروض، إنفوجرافيك…). كل ملف يُولَّد برمجيًا من بيانات أصلية."""
import os, html, math
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
E = html.escape
FONT = 'file://' + ROOT + '/fonts/'
LOGO = 'file://' + ROOT + '/images/logo-zad-s.png'
REG = {}   # slug -> function returning spec
def spec(slug):
    def d(f): REG[slug] = f; return f
    return d

def src(code):
    if '/' in code: return 'file://' + ROOT + '/' + code
    return 'file://' + ROOT + '/images/zad/' + code + '.webp'
def I(code, h=14, cls='', st=''):
    return f'<img class="ic {cls}" src="{src(code)}" style="height:{h}mm;{st}" alt="">'
AD = lambda n: str(n).translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))
def ltr(x): return f'<span class="l" dir="ltr">{x}</span>'

PAL = ['#e53935', '#fb8c00', '#f9a825', '#43a047', '#039be5', '#8e24aa', '#d81b60', '#00897b']
SIZES = {'portrait': ('210mm', '297mm'), 'landscape': ('297mm', '210mm'), 'slide': ('297mm', '167mm')}

CSS = f"""
@font-face{{font-family:C;src:url({FONT}cairo-regular.woff);font-weight:400}}
@font-face{{font-family:C;src:url({FONT}cairo-bold.woff);font-weight:700}}
*{{box-sizing:border-box}} html,body{{margin:0}}
body{{font-family:C,sans-serif;color:#1b1430;direction:rtl}}
.pg{{position:relative;overflow:hidden;page-break-after:always;background:#fff;display:flex;flex-direction:column}}
.pg.portrait{{width:210mm;height:297mm}} .pg.landscape{{width:297mm;height:210mm}} .pg.slide{{width:297mm;height:167mm}}
.hd{{background:linear-gradient(135deg,var(--c),var(--c2));color:#fff;padding:7mm 10mm 6mm;text-align:center;position:relative}}
.slide .hd{{padding:4mm 10mm 3mm}}
.hd h1{{margin:0;font-size:34pt;line-height:1.25;font-weight:700}} .slide .hd h1{{font-size:24pt}} .landscape .hd h1{{font-size:26pt}}
.hd p{{margin:1mm 0 0;font-size:14pt;opacity:.95}} .slide .hd p{{font-size:11pt}}
.bd{{flex:1;padding:6mm 9mm;display:flex;flex-direction:column;min-height:0}}
.ft{{display:flex;justify-content:space-between;align-items:center;padding:2mm 10mm;font-size:9pt;color:#6d6684;border-top:.3mm dashed #cfc8ea}}
.ft b{{display:flex;align-items:center;gap:2mm;color:var(--c)}} .ft img{{height:6mm}}
.ic{{display:block;object-fit:contain}}
.l{{direction:ltr;unicode-bidi:isolate;display:inline-block}}
.grid{{display:grid;gap:3.5mm}}
.cell{{background:#fff;border:.6mm solid var(--c);border-radius:4mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2mm;min-width:0}}
.tint{{background:var(--t)}}
svg{{display:block}}
table{{border-collapse:collapse}}
"""

def doc(sp, pages):
    w, h = SIZES[sp['orient']]
    c, c2, t = sp.get('color', '#6a2bd9'), sp.get('color2', '#8e5cf0'), sp.get('tint', '#f1e9ff')
    out = [f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{E(sp["title"])}</title><style>{CSS}@page{{size:{w} {h};margin:0}}</style></head><body style="--c:{c};--c2:{c2};--t:{t}">']
    n = len(pages)
    for i, p in enumerate(pages, 1):
        out.append(p.replace('%%PN%%', (f'{i}/{n}' if n > 1 else '')))
    out.append('</body></html>')
    return ''.join(out)

def page(sp, title, sub, body, n_label=True, head=True):
    o = sp['orient']
    hd = f'<div class="hd"><h1>{title}</h1>' + (f'<p>{sub}</p>' if sub else '') + '</div>' if head else ''
    ft = f'<div class="ft"><b><img src="{LOGO}" alt="">زاد التعليمية</b><span>مكتبة زاد · وسيلة تعليمية أصلية للاستخدام الشخصي أو داخل الفصل</span><span>%%PN%%</span></div>'
    return f'<section class="pg {o}">{hd}<div class="bd">{body}</div>{ft}</section>'

# ---------------- الخرائط الذهنية (SVG) ----------------
def wrap(text, n):
    import re
    text = re.sub(r'(?<=[0-9٠-٩+\-−×÷=<>]) (?=[0-9٠-٩+\-−×÷=<>])', '\u00a0', text)
    words, lines, cur = text.split(' '), [], ''
    for w in words:
        if cur and len(cur) + 1 + len(w) > n: lines.append(cur); cur = w
        else: cur = (cur + ' ' + w).strip()
    if cur: lines.append(cur)
    return lines
def svgtext(x, y, lines, size, fill, weight=700):
    lh = size * 1.32
    y0 = y - lh * (len(lines) - 1) / 2
    import re
    def iso(l): return re.sub(r'[0-9٠-٩+\-−×÷=<>][0-9٠-٩\u00a0 +\-−×÷=<>]*[0-9٠-٩+\-−×÷=<>]|[<>=+−×÷]', lambda m: '\u202d' + m.group(0) + '\u202c', l)
    def d(l): return '' if re.search('[\u0600-\u06ff]', l) else ' direction="ltr" unicode-bidi="isolate"'
    return ''.join(f'<text x="{x}" y="{y0 + i * lh:.1f}" font-size="{size}" font-weight="{weight}" fill="{fill}" text-anchor="middle" dominant-baseline="central"{d(l)}>{E(iso(l))}</text>' for i, l in enumerate(lines))

def mindmap_svg(center, branches, W=1485, H=1010, top=90, icon=None):
    """branches: [(title, [leaves], icon_code|None)] — حتى 6 فروع. المركز في الوسط والفروع على الجانبين."""
    cx, cy = W / 2, top + (H - top) / 2
    n = len(branches); right = (n + 1) // 2; left = n - right
    out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="100%" height="100%" font-family="C,sans-serif">']
    lines = []; nodes = []
    def side(items, sx, start_idx):
        k = len(items)
        if not k: return
        band = (H - top - 20) / k
        for j, it in enumerate(items):
            bt, leaves = it[0], it[1]
            col = PAL[(start_idx + j) % len(PAL)]
            by = top + 10 + band * (j + .5)
            bx = cx + sx * 285
            m = len(leaves); sp_ = min(104, (band - 14) / max(m, 1))
            for q, lv in enumerate(leaves):
                ly = by + (q - (m - 1) / 2) * sp_
                lx = cx + sx * 575
                lines.append(f'<path d="M{bx + sx * 115:.1f},{by:.1f} C{bx + sx * 150:.1f},{by:.1f} {lx - sx * 190:.1f},{ly:.1f} {lx - sx * 150:.1f},{ly:.1f}" stroke="{col}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".75"/>')
                ll = wrap(lv, 20); hh = 26 * 1.32 * len(ll) + 18
                nodes.append(f'<rect x="{lx - 150:.1f}" y="{ly - hh / 2:.1f}" width="300" height="{hh:.1f}" rx="18" fill="#fff" stroke="{col}" stroke-width="3.5"/>' + svgtext(lx, ly, ll, 25, '#1b1430', 600))
            lines.append(f'<path d="M{cx + sx * 135:.1f},{cy:.1f} C{cx + sx * 190:.1f},{cy:.1f} {bx - sx * 170:.1f},{by:.1f} {bx - sx * 115:.1f},{by:.1f}" stroke="{col}" stroke-width="9" fill="none" stroke-linecap="round"/>')
            bl = wrap(bt, 13); bh = max(72, 31 * 1.3 * len(bl) + 24)
            nodes.append(f'<rect x="{bx - 115:.1f}" y="{by - bh / 2:.1f}" width="230" height="{bh:.1f}" rx="26" fill="{col}"/>' + svgtext(bx, by, bl, 30, '#fff', 700))
    side(branches[:right], 1, 0)
    side(branches[right:], -1, right)
    cl = wrap(center, 11); chh = max(120, 40 * 1.3 * len(cl) + 40)
    cen = f'<ellipse cx="{cx}" cy="{cy}" rx="140" ry="{chh / 2 + 8:.0f}" fill="var(--c)"/><ellipse cx="{cx}" cy="{cy}" rx="150" ry="{chh / 2 + 18:.0f}" fill="none" stroke="var(--c2)" stroke-width="5" stroke-dasharray="3 12" stroke-linecap="round"/>' + svgtext(cx, cy + (30 if icon else 0) * 0, cl, 40, '#fff')
    if icon: cen += f'<image href="{src(icon)}" x="{cx - 38}" y="{cy - chh / 2 - 58:.0f}" width="76" height="76"/>'
    out += lines + nodes + [cen, '</svg>']
    return ''.join(out)
