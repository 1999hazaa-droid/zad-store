# -*- coding: utf-8 -*-
"""python3 lpdf.py : ينشئ files/life/*.pdf (7 ملفات) بخط Cairo ورسوم المنصة"""
import base64, os, html
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..'); OUT = ROOT + '/files/life'; os.makedirs(OUT, exist_ok=True)
b64 = lambda p, m: 'data:%s;base64,%s' % (m, base64.b64encode(open(p, 'rb').read()).decode())
FREG = b64(ROOT + '/fonts/cairo-regular.woff', 'font/woff'); FBLD = b64(ROOT + '/fonts/cairo-bold.woff', 'font/woff')
_c = {}
def ic(n):
    if n not in _c: _c[n] = b64(ROOT + '/images/zad/' + n + '.webp', 'image/webp')
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
P = {}
P['life-daily-routine'] = doc('جدول الروتين اليومي', 'أنجز كل خطوة وضع نجمة', 'i_clock', grid([('أستيقظ من النوم', 'x_sunrise'), ('أغسل وجهي', '1f4a7'), ('أفرش أسناني', '1faa5'), ('أتناول فطوري', '1f35e'), ('أرتب سريري', 'x_bed'), ('أجهز حقيبتي', 'i_bag'), ('أنام في موعدي', 'x_night')]))
wk = '<table><tr><th style="width:30mm">اليوم</th><th>قبل المدرسة</th><th>بعد المدرسة</th><th>المساء</th></tr>' + ''.join(f'<tr><td class="l">{d}</td><td class="box" style="height:16mm"></td><td></td><td></td></tr>' for d in DAYS) + '</table><h2>أهم ثلاث مهام لهذا الأسبوع</h2><div class="line"></div><div class="line"></div><div class="line"></div>'
P['life-weekly-plan'] = doc('جدول الأسبوع', 'نكتب مهامنا وننظم وقتنا', 'i_notebook', wk)
P['life-chores'] = doc('جدول المهام المنزلية', 'مهام بسيطة وآمنة بإشراف الكبار', 'i_home', grid([('أرتب ألعابي', 'i_teddy'), ('أجهز حقيبتي', 'i_bag'), ('أساعد في ترتيب المائدة', 'x_spoon'), ('أسقي النبتة بمساعدة الكبير', 'x_flowerpot'), ('أضع ملابسي المتسخة في السلة', 'x_wardrobe')], 'المهمة'), 'المهام بإشراف شخص كبير.')
NW = [('ماء للشرب', 0, 'x_water'), ('لعبة جديدة', 1, 'i_teddy'), ('حذاء مناسب', 0, 'x_shoes'), ('حلوى إضافية', 1, 'x_icecream'), ('كتاب مدرسي', 0, 'i_book'), ('لعبة إلكترونية', 1, 'i_tablet'), ('ملابس نظيفة', 0, 'x_dress'), ('عصير ملون إضافي', 1, 'x_bottle' if False else 'i_bottle')]
nw = '<p>اقرأ كل شيء ثم ضع علامة في الخانة المناسبة: هل هو حاجة نحتاجها أم رغبة نحبها؟</p><table><tr><th>الشيء</th><th style="width:30mm">حاجة</th><th style="width:30mm">رغبة</th></tr>' + ''.join(f'<tr><td class="l"><img src="{ic(i)}">{E(t)}</td><td><span class="ck"></span></td><td><span class="ck"></span></td></tr>' for t, g, i in NW) + '</table><h2>أفكر وأتحدث</h2><div class="line"></div><p class="sm">اشرح لأسرتك لماذا اخترت إجابة معينة.</p><div style="page-break-before:always"></div><h2>للكبير: الإجابات</h2><p>' + '، '.join(f'{E(t)}: {"حاجة" if g == 0 else "رغبة"}' for t, g, i in NW) + '.</p><p class="sm">قد تختلف بعض الحالات بحسب ظروف كل أسرة، والمهم أن يتحدث الطفل عن سبب اختياره.</p>'
P['life-needs-wants'] = doc('ورقة عمل: حاجة أم رغبة', 'أميز بين ما أحتاجه وما أحبه', 'x_coin', nw)
sv = '<h2>هدفي الذي أريد أن أشتريه</h2><div class="line"></div><h2>ثمنه بنقود اللعبة</h2><div class="line"></div><h2>كم أدخر كل أسبوع؟</h2><div class="line"></div><br><table><tr><th>الأسبوع</th><th>ما ادخرته</th><th>المجموع</th></tr>' + ''.join(f'<tr><td>{n}</td><td class="box"></td><td></td></tr>' for n in ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس', 'السابع', 'الثامن']) + '</table><p class="sm">هذه خطة تعليمية بنقود لعبة أو أرقام فقط، دون أي معاملات مالية حقيقية. يلوّن الطفل مربعا كلما اقترب من هدفه.</p><div style="display:flex;gap:2mm;margin-top:4mm">' + '<span style="flex:1;height:10mm;border:1.5px solid #6d28d9;border-radius:2mm"></span>' * 10 + '</div>'
P['life-savings'] = doc('خطة الادخار التعليمية', 'هدف صغير وخطوات منتظمة', 'i_target', sv)
SF = [('أمسك يد الكبير عند عبور الطريق', 'x_hand'), ('لا ألمس الأدوية، فالكبير يعطيها', 'i_lock'), ('أمشي بهدوء على الدرج', '1f6b6'), ('أخبر شخصا كبيرا أثق به إذا احتجت إلى مساعدة', 'x_doctor'), ('لا أذهب مع أحد دون إذن أهلي', 'i_heart'), ('أبتعد عن الأشياء الساخنة والحادة', 'i_lock')]
P['life-safety'] = doc('بطاقات قواعد السلامة', 'قواعد هادئة نتذكرها معا. قصّها وعلّقها', 'i_lock', '<div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b></div>' for t, i in SF) + '</div>', 'اشرحوا القواعد بهدوء دون تخويف.')
RC = [('أستيقظ', 'x_sunrise'), ('أغسل وجهي', '1f4a7'), ('أفرش أسناني', '1faa5'), ('أرتدي ملابسي', 'x_dress'), ('أتناول فطوري', '1f35e'), ('أذهب إلى المدرسة', 'i_bag'), ('ألعب وأرتب', 'i_teddy'), ('أنام', 'x_night')]
P['life-cards'] = doc('بطاقات الروتين', 'قصّ البطاقات ورتبها كما يحدث في يومك', 'i_puzzle', '<div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b></div>' for t, i in RC) + '</div>', 'استعمل مقصا آمنا بإشراف الكبير.')
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for k, h in P.items():
        pg.set_content(h); pg.wait_for_timeout(300); pg.pdf(path=f'{OUT}/{k}.pdf', format='A4', print_background=True); print(k, os.path.getsize(f'{OUT}/{k}.pdf'))
    b.close()
