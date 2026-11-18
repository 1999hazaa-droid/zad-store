# -*- coding: utf-8 -*-
"""مولّد ملفات المكتبة (أوراق عمل A4 عربية). الأسئلة والإجابات الرياضية تُحسب برمجيًا. الاستخدام: python3 libgen.py <slug|all>"""
import sys, os, random, json, html, subprocess, shutil
from fractions import Fraction
from decimal import Decimal
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OWL = 'file://' + ROOT + '/images/zad/zozo-think.webp'
LOGO = 'file://' + ROOT + '/images/logo-zad-s.png'
FONT = 'file://' + ROOT + '/fonts/'
E = html.escape

def fr(f, big=False):
    f = Fraction(f)
    if f.denominator == 1: return f'<b class="n">{f.numerator}</b>'
    return f'<span class="fr"><i>{f.numerator}</i><u></u><i>{f.denominator}</i></span>'
def mixed(f):
    f = Fraction(f)
    if f.denominator == 1: return fr(f)
    w, r = divmod(f.numerator, f.denominator)
    return (f'<b class="n">{w}</b>' if w else '') + fr(Fraction(r, f.denominator))
def ltr(x): return f'<span class="l" dir="ltr">{x}</span>'

CSS = f"""
@font-face{{font-family:C;src:url({FONT}cairo-regular.woff);font-weight:400}}
@font-face{{font-family:C;src:url({FONT}cairo-bold.woff);font-weight:700}}
@page{{size:A4;margin:0}}
*{{box-sizing:border-box}} html,body{{margin:0}} body{{font-family:C,sans-serif;color:#1b1430;direction:rtl}}
.page{{width:210mm;height:297mm;padding:9mm;page-break-after:always;position:relative;overflow:hidden;background:linear-gradient(180deg,var(--t) 0,#fff 55mm)}}
.frame{{height:100%;border:2.2mm solid var(--c);border-radius:8mm;padding:7mm 9mm;display:flex;flex-direction:column;background:transparent}}
.top{{display:flex;justify-content:space-between;align-items:center;font-size:10pt;color:#6d6684;border-bottom:.3mm dashed #cfc8ea;padding-bottom:3mm}}
.brand{{display:flex;align-items:center;gap:2mm;font-weight:700;color:var(--c)}} .brand img{{height:7mm}}
.tag{{background:var(--c);color:#fff;border-radius:6mm;padding:1mm 4mm;font-weight:700}}
.foot{{margin-top:auto;display:flex;justify-content:space-between;font-size:9pt;color:#6d6684;padding-top:2mm}}
.pn{{background:var(--c);color:#fff;border-radius:50%;width:7mm;height:7mm;display:grid;place-items:center;font-weight:700}}
.cover .box{{margin-top:12mm;border:1.2mm solid var(--c);border-radius:8mm;background:#fff;text-align:center;padding:10mm 6mm}}
.cover h1{{margin:0;font-size:34pt;color:var(--c);line-height:1.3}} .cover p{{margin:3mm 0 0;font-size:14pt;color:#5a5473}}
.chips{{display:flex;gap:3mm;justify-content:center;flex-wrap:wrap;margin-top:7mm}} .chips span{{background:var(--c);color:#fff;border-radius:7mm;padding:2mm 6mm;font-weight:700;font-size:13pt}}
.art{{flex:1;display:grid;place-items:center}} .art img{{height:80mm}}
.note{{text-align:center;color:#6d6684;font-size:11pt;line-height:1.9}}
h2{{margin:5mm 0 1mm;font-size:19pt;color:var(--c)}} .ins{{margin:0 0 3mm;color:#4b4666;font-size:12.5pt}}
.who{{display:flex;gap:8mm;font-size:11pt;margin-top:3mm;color:#4b4666}} .who span{{flex:1;border-bottom:.3mm solid #b8b0d6;padding-bottom:1mm}}
.grid{{display:grid;grid-template-columns:1fr 1fr;gap:4mm 6mm}}
.q{{border:.4mm solid #d8d2ee;border-radius:4mm;padding:3mm 4mm;background:#fff;display:flex;align-items:center;gap:3mm;min-height:20mm;font-size:16pt}}
.q.tall{{min-height:30mm}} .q.full{{grid-column:1/-1}}
.no{{flex:none;background:var(--t);color:var(--c);border-radius:50%;width:7.5mm;height:7.5mm;display:grid;place-items:center;font-weight:700;font-size:11pt}}
.l{{direction:ltr;unicode-bidi:isolate;display:inline-flex;align-items:center;gap:2.2mm;font-weight:700}}
.fr{{display:inline-flex;flex-direction:column;align-items:center;line-height:1.05;font-size:15pt;min-width:7mm}} .fr i{{font-style:normal}} .fr u{{display:block;width:100%;border-top:.5mm solid #1b1430;text-decoration:none}}
.n{{font-size:16pt}} .ans{{display:inline-block;min-width:22mm;border-bottom:.4mm solid #8f86b8;height:9mm}}
.ar{{font-size:15pt;line-height:2;}} .wp{{font-size:13pt;line-height:1.9}}
.opt{{display:inline-block;border:.4mm solid #b8b0d6;border-radius:3mm;padding:0 3mm;margin:0 1mm;font-size:13pt}}
table{{border-collapse:collapse;width:100%}} td,th{{border:.4mm solid #d8d2ee;padding:2mm 3mm;font-size:13pt}} th{{background:var(--t);color:var(--c)}}
.keyp .l{{font-size:13pt}} .key{{font-size:12.5pt;line-height:1.95}} .key b{{color:var(--c)}}
.bx{{border:.4mm dashed var(--c);border-radius:4mm;padding:3mm 5mm;background:#fff;margin:2mm 0;font-size:13pt;line-height:1.9}}
svg{{max-width:100%}}
.ln{{direction:ltr;unicode-bidi:isolate;font-weight:700}}
.kr{{margin-bottom:5mm}} .kg{{display:flex;flex-wrap:wrap;gap:2.5mm 8mm;margin-top:1.5mm}} .ki{{display:inline-flex;align-items:center;gap:1.5mm;white-space:nowrap;font-size:13pt}} .ki i{{font-style:normal;color:var(--c);font-weight:700;font-size:10.5pt}}
.geo{{display:flex;flex-direction:column;align-items:center;gap:1mm;width:100%;font-size:13pt;line-height:1.9;text-align:center}} .geo svg{{width:46mm;height:32mm}}
"""

def wrap(spec, pages):
    c, t = spec['color'], spec['tint']
    out = [f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{E(spec["title"])}</title><style>{CSS}</style></head><body style="--c:{c};--t:{t}">']
    total = len(pages) + 1
    def page(n, inner, cover=False):
        return f'<section class="page {"cover" if cover else ""}"><div class="frame"><div class="top"><span class="brand"><img src="{LOGO}" alt="">زاد التعليمية</span><span class="tag">ملف مجاني</span><span>مكتبة زاد</span></div>{inner}<div class="foot"><span class="pn">{n}</span><span>للاستخدام الشخصي أو داخل الفصل · منصة زاد التعليمية</span></div></div></section>'
    chips = ''.join(f'<span>{E(x)}</span>' for x in spec['chips'])
    out.append(page(1, f'<div class="box"><h1>{E(spec["title"])}</h1><p>{E(spec["subtitle"])}</p></div><div class="chips">{chips}</div><div class="art"><img src="{OWL}" alt=""></div><div class="note">{spec["note"]}<br>جاهز للطباعة على ورق A4 · {total} صفحات</div>', True))
    for i, (h, ins, body, kind) in enumerate(pages, 2):
        who = '<div class="who"><span>الاسم:</span><span>التاريخ:</span></div>' if kind == 'ws' else ''
        out.append(page(i, f'<h2>{h}</h2><p class="ins">{ins}</p>{who}<div style="height:3mm"></div>{body}'))
    out.append('</body></html>')
    return ''.join(out)

def Q(i, inner, cls=''): return f'<div class="q {cls}"><span class="no">{i}</span><div>{inner}</div></div>'
def grid(items, cls=''): return '<div class="grid">' + ''.join(Q(i + 1, x, cls) for i, x in enumerate(items)) + '</div>'
def key(lines): return '<div class="key">' + '<br>'.join(lines) + '</div>'
LTRS = lambda *a: ltr(' '.join(a))
def pair(a, op, b, eq=True): return ltr(f'{a}<span>{op}</span>{b}' + ('<span>=</span><span class="ans"></span>' if eq else ''))

def K(title, items):
    return f'<div class="kr"><b>{title}</b><div class="kg">' + ''.join(f'<span class="ki"><i>({n})</i>{v}</span>' for n, v in enumerate(items, 1)) + '</div></div>'
def fr_raw(n, d): return f'<span class="fr"><i>{n}</i><u></u><i>{d}</i></span>'
