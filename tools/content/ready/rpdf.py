# -*- coding: utf-8 -*-
"""python3 rpdf.py : ينشئ files/ready/*.pdf (7 ملفات) بخط Cairo ورسوم المنصة"""
import base64, os, html
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..'); OUT = ROOT + '/files/ready'; os.makedirs(OUT, exist_ok=True)
b64 = lambda p, m: 'data:%s;base64,%s' % (m, base64.b64encode(open(p, 'rb').read()).decode())
FREG = b64(ROOT + '/fonts/cairo-regular.woff', 'font/woff'); FBLD = b64(ROOT + '/fonts/cairo-bold.woff', 'font/woff')
_c = {}
def ic(n):
    if n not in _c: _c[n] = b64(ROOT + '/images/dig/' + n + '.svg', 'image/svg+xml') if n.startswith('dg_') else b64(ROOT + '/images/ready/' + n + '.svg', 'image/svg+xml') if n.startswith('rd_') else b64(ROOT + '/images/zad/' + n + '.webp', 'image/webp')
    return _c[n]
E = html.escape
DAYS = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
CSS = f'''@font-face{{font-family:C;src:url({FREG});font-weight:400}}@font-face{{font-family:C;src:url({FBLD});font-weight:700}}
@page{{size:A4;margin:11mm 12mm}}*{{box-sizing:border-box}}body{{margin:0;font:400 12pt/1.6 C,sans-serif;color:#1b1430;direction:rtl}}
.top{{background:linear-gradient(135deg,#6d28d9,#a78bfa);color:#fff;border-radius:5mm;padding:4mm 7mm;display:flex;align-items:center;gap:5mm;margin-bottom:5mm}}.top img{{height:16mm}}.top h1{{margin:0;font-size:20pt}}.top p{{margin:0;font-size:10.5pt}}
table{{width:100%;border-collapse:collapse}}th,td{{border:1.5px solid #b9a8e8;padding:2.2mm;text-align:center;font-size:10.5pt}}th{{background:#efe8ff;font-weight:700}}td.l{{text-align:right;font-weight:700}}td.l img{{height:9mm;vertical-align:middle;margin-left:2mm}}
.box{{height:9mm}}.foot{{margin-top:5mm;font-size:9.5pt;color:#5a4d80;text-align:center}}.pg{{page-break-after:always}}.pg:last-child{{page-break-after:auto}}
.cards{{display:grid;grid-template-columns:1fr 1fr;gap:5mm}}.cd{{border:2px dashed #6d28d9;border-radius:5mm;padding:5mm;text-align:center;min-height:46mm;display:flex;flex-direction:column;align-items:center;justify-content:center}}.cd img{{height:20mm}}.cd b{{font-size:13.5pt;margin-top:3mm}}
.line{{border-bottom:1.5px solid #b9a8e8;height:9mm}}.ck{{display:inline-block;width:6mm;height:6mm;border:1.5px solid #6d28d9;border-radius:1.5mm;vertical-align:middle;margin:0 1.5mm}}
.sm{{font-size:10pt;color:#5a4d80}}h2{{color:#6d28d9;font-size:14pt;margin:4mm 0 2mm}}'''
def doc(title, sub, icon, body, note=''):
    return f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{CSS}</style></head><body><div class="top"><img src="{ic(icon)}"><div><h1>{E(title)}</h1><p>{E(sub)}</p></div></div>{body}<div class="foot">{E(note) if note else ""} منصة زاد التعليمية · المهارات الحياتية</div></body></html>'
def grid(rows, title2='النشاط'):
    h = f'<table><tr><th style="width:62mm">{title2}</th>' + ''.join(f'<th>{d}</th>' for d in DAYS) + '</tr>'
    for t, i in rows: h += f'<tr><td class="l"><img src="{ic(i)}">{E(t)}</td>' + '<td class="box"></td>' * 7 + '</tr>'
    return h + '</table><p class="sm">ضع نجمة أو علامة في الخانة عندما تنجز النشاط. التشجيع أهم من الكمال.</p>'


def tbl(head, rows):
    h = '<table><tr>' + ''.join(f'<th>{E(x)}</th>' for x in head) + '</tr>'
    for r in rows: h += '<tr>' + ''.join(r) + '</tr>'
    return h + '</table>'
P = {}
DASH = 'fill="none" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round"'
def tsv(path, label):
    return f'<div style="margin:2mm 0"><b style="color:#6d28d9">{E(label)}</b><svg viewBox="0 0 480 130" style="width:100%;height:30mm;border:1.5px solid #e4daff;border-radius:3mm"><path d="{path}" {DASH}/><circle cx="440" cy="65" r="6" fill="#22c55e"/></svg></div>'
import math
wave = 'M440 65 ' + ' '.join(f'L{440 - t * 4.0:.0f} {65 + 38 * math.sin(t / 100 * math.pi * 4):.0f}' for t in range(0, 101, 4))
P['ready-trace-lines'] = doc('ورقة تتبع الخطوط', 'تتبع الخط المنقط بالقلم من النقطة الخضراء', 'i_pencil', tsv('M440 65 H40', 'خط مستقيم') + tsv(wave, 'موجة') + tsv('M440 100 L360 30 L280 100 L200 30 L120 100 L40 30', 'خط متعرج') + '<div style="display:flex;gap:3mm">' + ''.join(f'<svg viewBox="0 0 160 160" style="width:56mm;height:56mm;border:1.5px solid #e4daff;border-radius:3mm"><path d="{pth}" {DASH}/></svg>' for pth in ['M80 20 A60 60 0 1 0 80.1 20', 'M30 30 H130 V130 H30 Z', 'M80 20 L140 135 H20 Z']) + '</div>', 'أمسك القلم بالإبهام والسبابة، وتتبع بهدوء. التشجيع أهم من الإتقان.')
sh = [('دائرة', 'rd_circle_red'), ('مربع', 'rd_square_blue'), ('مثلث', 'rd_triangle_green'), ('مستطيل', 'rd_rect_yellow')]
shp = '<p>لوّن كل شكل باللون المناسب ثم صله باسمه.</p>' + tbl(['الشكل', 'اسمه', 'لوّنه'], [(f'<td><img src="{ic(i)}" style="height:20mm"></td><td class="l">{E(t)}</td><td class="box" style="height:22mm"></td>') for t, i in sh]) + '<h2>ألوان</h2><div style="display:flex;gap:6mm">' + ''.join(f'<div style="text-align:center"><img src="{ic(i)}" style="height:20mm"><br>{E(t)}</div>' for t, i in [('أحمر', 'rd_circle_red'), ('أزرق', 'rd_circle_blue'), ('أصفر', 'rd_circle_yellow'), ('أخضر', 'rd_circle_green')]) + '</div>'
P['ready-shapes-colors'] = doc('ورقة الأشكال والألوان', 'أتعرف على الأشكال والألوان', 'rd_circle_red', shp)
cn = [('1f34e', 3), ('2b50', 5), ('1f41f', 2), ('1f34c', 4)]
cnt = '<p>عد الصور واكتب العدد أو ضع علامة في الخانة.</p>' + tbl(['الصور', 'العدد'], [(f'<td style="text-align:right">' + ''.join(f'<img src="{ic(i)}" style="height:11mm">' for _ in range(n)) + '</td><td class="box" style="height:16mm;width:30mm"></td>') for i, n in cn]) + '<h2>صل الرقم بالاسم</h2>' + tbl(['الرقم', 'الاسم'], [(f'<td><img src="{ic(i)}" style="height:12mm"></td><td class="box" style="height:14mm">{E(t)}</td>') for i, t in [('i_n1', 'واحد'), ('i_n2', 'اثنان'), ('i_n3', 'ثلاثة')]])
P['ready-counting'] = doc('ورقة العد والمطابقة', 'أعد وأطابق', 'i_n3', cnt)
def pat():
    seqs = [['rd_circle_red', 'rd_square_blue', 'rd_circle_red', 'rd_square_blue'], ['1f431', '1f436', '1f431', '1f436'], ['rd_triangle_green', 'rd_triangle_green', 'rd_circle_blue', 'rd_triangle_green', 'rd_triangle_green', 'rd_circle_blue'], ['1f34e', '1f34c', '1f34e', '1f34c']]
    h = '<p>انظر إلى الصور وارسم الصورة التي تأتي بعدها في الفراغ.</p>'
    for s in seqs: h += '<div style="display:flex;gap:3mm;align-items:center;margin:5mm 0">' + ''.join(f'<img src="{ic(x)}" style="height:15mm">' for x in s) + '<div style="width:17mm;height:17mm;border:2px dashed #6d28d9;border-radius:3mm"></div></div>'
    return h + '<h2>ما الصورة المختلفة؟ ضع دائرة حولها</h2><div style="display:flex;gap:4mm">' + ''.join(f'<img src="{ic(x)}" style="height:16mm">' for x in ['1f431', '1f431', '1f436', '1f431']) + '</div>'
P['ready-patterns'] = doc('ورقة الأنماط', 'ما الصورة التالية؟', '1f9e9', pat())
bag = [('كتب', 'i_book'), ('دفتر', 'i_notebook'), ('قلم رصاص', 'i_pencil'), ('ممحاة', 'i_eraser'), ('مقص آمن', 'i_scissors'), ('وجبة صغيرة', '1f34e'), ('زجاجة ماء', 'i_bottle')]
P['ready-school-bag'] = doc('قائمة تجهيز الحقيبة', 'ضع علامة عندما تجهز كل شيء بنفسك', 'i_bag', tbl(['الأداة', 'جاهزة؟'], [(f'<td class="l"><img src="{ic(i)}">{E(t)}</td><td class="box" style="height:14mm;width:40mm"></td>') for t, i in bag]), 'جهز الحقيبة في المساء قبل النوم.')
sch = [('أستيقظ', 'x_sunrise'), ('أغسل وجهي', '1f4a7'), ('أفرش أسناني', '1faa5'), ('أرتدي ملابسي', 'x_dress'), ('أتناول فطوري', '1f35e'), ('أحمل حقيبتي', 'i_bag'), ('أرتب أدواتي', 'i_pencil'), ('أنام مبكرا', 'x_sleep')]
P['ready-daily-schedule'] = doc('جدول الروتين المدرسي', 'أنجز كل خطوة وضع نجمة', 'i_clock', grid(sch))
ar = ['التعرف على الحروف', 'الأرقام والعد', 'الأشكال والألوان', 'المطابقة والتصنيف', 'الاستماع وفهم التعليمات', 'الذاكرة والانتباه', 'المهارات الحركية الدقيقة', 'الثقة والاستقلالية']
P['ready-skills-tracker'] = doc('جدول متابعة المهارات', 'للأسرة: سجلوا ما يتقدم فيه الطفل بكلمات إيجابية', 'i_chart', tbl(['المهارة', 'ما لاحظناه من تقدم', 'نلعب بها هذا الأسبوع'], [(f'<td class="l">{E(a)}</td><td class="box" style="height:15mm"></td><td></td>') for a in ar]), 'هذا الجدول للأسرة فقط، وليس تقييما ولا تشخيصا، ولا يقارن الطفل بغيره.')
g = '<h2>كيف ندعم طفلنا؟</h2><ul><li>جلسة لعب قصيرة كل يوم أفضل من جلسة طويلة.</li><li>شجعوا المحاولة قبل الصواب.</li><li>ابدؤوا بالمستوى المبتدئ ولا تنتقلوا لأصعب قبل أن يرتاح الطفل.</li><li>تحدثوا عن المدرسة بإيجابية وبكلمات بسيطة.</li><li>اتركوه يجهز حقيبته بنفسه وراجعوها معه بهدوء.</li></ul><h2>كيف نفهم المؤشرات؟</h2><p>مؤشرات المهارات للتدريب فقط، وليست تشخيصا أو حكما على استعداد الطفل للمدرسة. الأطفال ينمون بإيقاعات مختلفة ولا نقارنهم ببعض.</p><h2>متى نسأل مختصا؟</h2><p>إن لاحظتم قلقا مستمرا أو صعوبة واضحة ومتكررة في الكلام أو الحركة أو الانتباه فاسألوا معلمة الطفل أو مختصا في الطفولة المبكرة.</p>'
P['ready-parent-guide'] = doc('دليل ولي الأمر', 'الاستعداد المدرسي بهدوء وثقة', 'i_book', g)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for k, h in P.items():
        pg.set_content(h); pg.wait_for_timeout(300); pg.pdf(path=f'{OUT}/{k}.pdf', format='A4', print_background=True); print(k, os.path.getsize(f'{OUT}/{k}.pdf'))
    b.close()
