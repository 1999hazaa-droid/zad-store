# -*- coding: utf-8 -*-
"""إطار الأدلة الإرشادية: محتوى منظّم (كتل) → PDF + غلاف + SQL. نفس الكتل يعرضها الموقع."""
import os, html, json
E = html.escape
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
FONT = 'file://' + ROOT + '/fonts/'
LOGO = 'file://' + ROOT + '/images/logo-zad-s.png'
GUIDES = {}
AUD = {'parent': ('أولياء الأمور', '#6a2bd9', '#8e5cf0', '1f468-1f469-1f467'), 'teacher': ('المعلمون', '#00796b', '#26a69a', 'x_teacher'), 'child': ('الأطفال', '#ef6c00', '#ffa726', '1f9d2')}
KIND = {'guide': 'دليل', 'age': 'دليل حسب العمر والصف', 'section': 'دليل قسم من المكتبة', 'template': 'نموذج جاهز للطباعة'}
LV = {'a2': 'سنة إلى سنتين', 'a3': '٣ سنوات', 'a4': '٤ سنوات', 'a5': '٥ سنوات', 'a6': '٦ سنوات', 'g1': 'الصف الأول', 'g2': 'الصف الثاني', 'g3': 'الصف الثالث', 'g4': 'الصف الرابع'}
AD = lambda n: str(n).translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))
def lv_text(levels):
    ages = sorted(x for x in levels if x[0] == 'a'); gr = sorted(x for x in levels if x[0] == 'g'); o = []
    if ages:
        f = 'سنة' if ages[0] == 'a2' else AD(ages[0][1:]) + ' سنوات'; l = AD(ages[-1][1:]) + ' سنوات'
        o.append(f if len(ages) == 1 else f'العمر: {f} إلى {l}')
    if gr:
        N = {'g1': 'الأول', 'g2': 'الثاني', 'g3': 'الثالث', 'g4': 'الرابع'}
        o.append('الصف ' + N[gr[0]] if len(gr) == 1 else f'الصفوف: {N[gr[0]]} إلى {N[gr[-1]]}')
    return ' · '.join(o)
AD = lambda n: str(n).translate(str.maketrans('0123456789', '٠١٢٣٤٥٦٧٨٩'))
def guide(slug):
    def d(f): GUIDES[slug] = f; return f
    return d
def G(slug, audience, kind, title, description, levels, topic, goals, intro, body, summary, sort=0, note=''):
    return dict(slug=slug, audience=audience, kind=kind, title=title, description=description, levels=levels, topic=topic, goals=goals, intro=intro, body=body, summary=summary, sort=sort, note=note)
# كتل المحتوى
H = lambda x: {'t': 'h', 'x': x}
P = lambda x: {'t': 'p', 'x': x}
def STEPS(items, title=''): return {'t': 'steps', 'title': title, 'items': [dict(h=i[0], x=i[1], **({'ic': i[2]} if len(i) > 2 else {})) for i in items]}
def TIPS(items, title='نصائح عملية'): return {'t': 'tips', 'title': title, 'items': items}
def EX(x, title='مثال تطبيقي'): return {'t': 'ex', 'title': title, 'x': x}
def TABLE(head, rows): return {'t': 'table', 'head': head, 'rows': rows}
def FORM(title='', fields=(), checks=(), grid=None, lines=0): return {'t': 'form', 'title': title, 'fields': list(fields), 'checks': list(checks), 'grid': grid, 'lines': lines}

def icsrc(c): return 'file://' + ROOT + '/images/zad/' + c + '.webp'
def block_html(b):
    t = b['t']
    if t == 'h': return f'<h2>{E(b["x"])}</h2>'
    if t == 'p': return f'<p>{E(b["x"])}</p>'
    if t == 'steps':
        o = (f'<h3>{E(b["title"])}</h3>' if b.get('title') else '') + '<ol class="st">'
        for i, s in enumerate(b['items'], 1):
            ic = f'<img class="sic" src="{icsrc(s["ic"])}">' if s.get('ic') else ''
            o += f'<li><span class="n">{AD(i)}</span>{ic}<div><b>{E(s["h"])}</b>' + (f'<span>{E(s["x"])}</span>' if s.get('x') else '') + '</div></li>'
        return o + '</ol>'
    if t == 'tips':
        return f'<div class="tips"><h3>{E(b.get("title") or "نصائح عملية")}</h3><ul>' + ''.join(f'<li>{E(x)}</li>' for x in b['items']) + '</ul></div>'
    if t == 'ex':
        return f'<div class="ex"><h3>{E(b.get("title") or "مثال تطبيقي")}</h3>' + ''.join(f'<p>{E(l)}</p>' for l in b['x'].split('\n')) + '</div>'
    if t == 'table':
        return '<table class="tb"><tr>' + ''.join(f'<th>{E(h)}</th>' for h in b['head']) + '</tr>' + ''.join('<tr>' + ''.join(f'<td>{E(c)}</td>' for c in r) + '</tr>' for r in b['rows']) + '</table>'
    if t == 'form':
        o = '<div class="form">' + (f'<h3>{E(b["title"])}</h3>' if b.get('title') else '')
        o += ''.join(f'<div class="fl"><span>{E(f)}</span><i></i></div>' for f in b.get('fields', []))
        if b.get('checks'): o += '<div class="chk">' + ''.join(f'<div><u></u>{E(c)}</div>' for c in b['checks']) + '</div>'
        g = b.get('grid')
        if g: o += '<table class="tb fg"><tr>' + ''.join(f'<th>{E(h)}</th>' for h in g['head']) + '</tr>' + ('<tr>' + '<td></td>' * len(g['head']) + '</tr>') * g['rows'] + '</table>'
        o += '<div class="ln"></div>' * b.get('lines', 0)
        return o + '</div>'
    if t == 'img': return f'<figure><img src="{E(b["u"])}">' + (f'<figcaption>{E(b["cap"])}</figcaption>' if b.get('cap') else '') + '</figure>'
    return ''

CSS = f"""
@font-face{{font-family:C;src:url({FONT}cairo-regular.woff);font-weight:400}}
@font-face{{font-family:C;src:url({FONT}cairo-bold.woff);font-weight:700}}
@page{{size:A4;margin:12mm 13mm 17mm;@bottom-center{{content:"مكتبة زاد التعليمية · " counter(page);font:400 9pt C,sans-serif;color:#6d6684}}}}
*{{box-sizing:border-box}} html,body{{margin:0}}
body{{font:400 12.5pt/1.85 C,sans-serif;color:#1b1430;direction:rtl}}
.top{{background:linear-gradient(135deg,var(--c),var(--c2));color:#fff;border-radius:6mm;padding:7mm 8mm;margin-bottom:5mm;display:flex;align-items:center;gap:6mm}}
.top img{{height:24mm}} .top h1{{margin:0;font-size:24pt;line-height:1.35;font-weight:700}}
.top .m{{font-size:10.5pt;opacity:.95;margin-top:1.5mm}}
.top .m span{{display:inline-block;background:#ffffff30;border-radius:9mm;padding:0 3.5mm;margin-left:2mm}}
.lead{{font-weight:700;color:#3a2a6a;margin:0 0 4mm}}
h2{{font-size:17pt;color:var(--c);margin:6mm 0 2mm;border-bottom:.6mm solid var(--c);padding-bottom:1mm;break-after:avoid}}
h3{{font-size:13.5pt;margin:0 0 1.5mm;color:var(--c);break-after:avoid}}
p{{margin:0 0 2.5mm}}
.box{{border-radius:5mm;padding:4mm 6mm;margin:3mm 0;break-inside:avoid}}
.goals{{background:var(--t);border:.5mm solid var(--c)}} .goals ul{{margin:0;padding-right:6mm}}
.summary{{background:#fff8e1;border:.5mm solid #f9a825}} .summary h3{{color:#8a5a00}} .summary ul{{margin:0;padding-right:6mm}}
ol.st{{list-style:none;margin:2mm 0 3mm;padding:0}}
ol.st li{{display:flex;gap:4mm;align-items:flex-start;margin-bottom:2.5mm;break-inside:avoid;background:#faf8ff;border:.4mm solid #ddd5f3;border-radius:4mm;padding:3mm 4mm}}
ol.st .n{{flex:none;width:9mm;height:9mm;border-radius:50%;background:var(--c);color:#fff;font-weight:700;text-align:center;line-height:9mm;font-size:12pt}}
ol.st .sic{{flex:none;height:18mm}}
ol.st li div b{{display:block;font-size:13pt}} ol.st li div span{{display:block;color:#3b3358}}
.tips{{background:#e8f5e9;border:.5mm solid #43a047;border-radius:5mm;padding:3.5mm 6mm;margin:3mm 0;break-inside:avoid}} .tips h3{{color:#2e7d32}} .tips ul{{margin:0;padding-right:6mm}} .tips li{{margin-bottom:1mm}}
.ex{{background:#e3f2fd;border:.5mm solid #039be5;border-radius:5mm;padding:3.5mm 6mm;margin:3mm 0;break-inside:avoid}} .ex h3{{color:#0277bd}} .ex p:last-child{{margin:0}}
table.tb{{width:100%;border-collapse:collapse;margin:3mm 0;break-inside:avoid;font-size:11.5pt}} .tb th{{background:var(--c);color:#fff;padding:2mm;border:.3mm solid var(--c)}} .tb td{{border:.3mm solid #cfc7ee;padding:2mm 3mm;vertical-align:top}}
.tb.fg td{{height:11mm}}
.form{{border:.5mm solid #cfc7ee;border-radius:5mm;padding:4mm 6mm;margin:3mm 0;break-inside:avoid}}
.fl{{display:flex;gap:3mm;align-items:flex-end;margin:3mm 0}} .fl span{{font-weight:700;flex:none}} .fl i{{flex:1;border-bottom:.4mm solid #8f86b8;height:7mm}}
.chk div{{margin:2.5mm 0}} .chk u{{display:inline-block;width:5mm;height:5mm;border:.5mm solid #6d6684;border-radius:1mm;vertical-align:middle;margin-left:3mm}}
.ln{{border-bottom:.4mm solid #8f86b8;height:9mm}}
figure{{margin:3mm 0;text-align:center}} figure img{{max-width:100%;max-height:90mm}} figcaption{{font-size:10.5pt;color:#6d6684}}
.src{{font-size:9.5pt;color:#6d6684;margin-top:6mm;border-top:.3mm dashed #cfc7ee;padding-top:2mm}}
"""
def guide_html(g):
    a = AUD[g['audience']]; c, c2 = a[1], a[2]
    tint = {'parent': '#f1e9ff', 'teacher': '#e0f2f1', 'child': '#fff3e0'}[g['audience']]
    lv = lv_text(g['levels'])
    o = f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{E(g["title"])}</title><style>{CSS}</style></head><body style="--c:{c};--c2:{c2};--t:{tint}">'
    o += f'<div class="top"><img src="{icsrc(a[3])}"><div><h1>{E(g["title"])}</h1><div class="m"><span>{E(KIND[g["kind"]])}</span><span>الفئة: {E(a[0])}</span>' + (f'<span>{E(lv)}</span>' if lv else '') + '</div></div></div>'
    o += f'<p class="lead">{E(g["description"])}</p>'
    if g['goals']: o += '<div class="box goals"><h3>أهداف الدليل</h3><ul>' + ''.join(f'<li>{E(x)}</li>' for x in g['goals']) + '</ul></div>'
    if g['intro']: o += f'<h2>مقدمة</h2><p>{E(g["intro"])}</p>'
    o += ''.join(block_html(b) for b in g['body'])
    if g['summary']: o += '<div class="box summary"><h3>ملخص أهم النقاط</h3><ul>' + ''.join(f'<li>{E(x)}</li>' for x in g['summary']) + '</ul></div>'
    o += '<div class="src">محتوى أصلي من إعداد منصة زاد التعليمية، غير منسوب إلى منهج أو جهة تعليمية محددة. إرشادات عامة للاستئناس ولا تغني عن توجيه المعلم أو المختص.</div>'
    return o + '</body></html>'

def cover_html(g):
    a = AUD[g['audience']]; c, c2 = a[1], a[2]
    return f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>@font-face{{font-family:C;src:url({FONT}cairo-bold.woff);font-weight:700}}*{{box-sizing:border-box}}body{{margin:0;width:440px;height:330px;font-family:C;direction:rtl;background:linear-gradient(135deg,{c},{c2});color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:22px;text-align:center}}img{{height:120px}}h1{{margin:0;font-size:25px;line-height:1.4;font-weight:700}}span{{background:#ffffff33;border-radius:99px;padding:2px 16px;font-size:15px;font-weight:700}}</style></head><body><img src="{icsrc(g.get("icon") or a[3])}"><h1>{E(g["title"])}</h1><span>{E(a[0])} · {E(KIND[g["kind"]])}</span></body></html>'
