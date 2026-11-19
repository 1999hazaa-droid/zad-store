# -*- coding: utf-8 -*-
"""python3 vpdf.py : ينشئ files/explore/*.pdf (8 ملفات) بخط Cairo ورسوم المنصة"""
import base64, os, html
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..'); OUT = ROOT + '/files/explore'; os.makedirs(OUT, exist_ok=True)
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


def cards(items, cols=3):
    return f'<style>.cards{{grid-template-columns:{"1fr " * cols}}}.cd{{min-height:50mm;padding:3mm}}</style><div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b><span class="sm">{E(d)}</span></div>' for t, i, d in items) + '</div>'
P['exp-animal-cards'] = doc('بطاقات الحيوانات', 'قصوا البطاقات والعبوا: من أنا؟ وأين أعيش؟', '1f981', cards([('الأسد', '1f981', 'يعيش في السهول'), ('الجمل', '1f42a', 'يعيش في الصحراء'), ('الدلفين', '1f42c', 'يعيش في البحر'), ('النسر', '1f985', 'يطير في السماء'), ('النحلة', '1f41d', 'تعيش في الخلية'), ('البطريق', '1f427', 'يعيش في الأماكن الباردة')], 3), 'اقرؤوا البطاقة مع الطفل واسألوه: أين يعيش هذا الحيوان؟')
parts = tbl(['جزء النبات', 'وظيفته'], [[f'<td class="l"><img src="{ic(i)}">{E(a)}</td>', '<td class="box"></td>'] for a, i in [('الجذور', 'x_soil'), ('الساق', '1f33f'), ('الأوراق', 'x_leaf'), ('الزهرة', '1f337')]])
P['exp-plant-parts'] = doc('ورقة أجزاء النبات', 'اكتب عمل كل جزء من أجزاء النبات', '1f331', parts + '<h2>ارسم نباتا وسم أجزاءه</h2><div style="height:90mm;border:2px dashed #b9a8e8;border-radius:4mm"></div>', 'الإجابات: الجذور تمتص الماء، الساق تحمل النبات، الأوراق تأخذ الضوء، الزهرة تصنع الثمار.')
pl = [('عطارد', 'x_earth'), ('الزهرة', 'x_earth'), ('الأرض', 'x_earth'), ('المريخ', 'x_earth'), ('المشتري', 'x_saturn'), ('زحل', 'x_saturn'), ('أورانوس', 'x_saturn'), ('نبتون', 'x_saturn')]
P['exp-planets'] = doc('جدول الكواكب', 'ثمانية كواكب تدور حول الشمس', 'x_saturn', tbl(['الترتيب', 'الكوكب', 'ما أعرفه عنه'], [[f'<td>{n + 1}</td>', f'<td class="l">{E(a)}</td>', '<td class="box"></td>'] for n, (a, i) in enumerate(pl)]), 'الأرض هي الكوكب الثالث، وهو الكوكب الذي نعيش عليه. الرسوم في اللعبة رمزية.')
P['exp-senses'] = doc('ورقة الحواس الخمس', 'صل كل عضو بحاسته', '1f440', tbl(['العضو', 'ماذا نفعل به؟'], [[f'<td class="l"><img src="{ic(i)}">{E(a)}</td>', '<td class="box"></td>'] for a, i in [('العين', 'x_eye'), ('الأذن', 'x_ear'), ('الأنف', 'x_nose'), ('اللسان', 'x_mouth'), ('اليد', 'x_hand')]]), 'الإجابات: نرى، نسمع، نشم، نتذوق، نلمس.')
P['exp-jobs'] = doc('بطاقات المهن وأدواتها', 'قص البطاقات وصل المهنة بأداتها', 'x_doctor', cards([('الطبيب', 'x_doctor', 'السماعة'), ('المعلمة', 'x_teacher', 'السبورة'), ('الطباخ', 'x_chef', 'القدر'), ('رجل الإطفاء', 'x_firefighter', 'سيارة الإطفاء'), ('الطيار', 'x_pilot', 'الطائرة'), ('المزارع', 'x_farmer', 'البذور')], 3), 'تحدثوا مع الطفل عن فائدة كل مهنة للناس.')
P['exp-transport'] = doc('تصنيف وسائل النقل', 'ضع كل وسيلة في عمودها: بر وبحر وجو', '1f697', tbl(['بر', 'بحر', 'جو'], [['<td class="box"></td>'] * 3] * 4) + cards([('سيارة', '1f697', ''), ('سفينة', '1f6a2', ''), ('طائرة', '2708', ''), ('قطار', '1f682', ''), ('قارب', '1f6a2', ''), ('دراجة', '1f6b2', '')], 6), 'قصوا الصور والصقوها في العمود الصحيح.')
P['exp-explore-log'] = doc('سجل المستكشف الصغير', 'اكتب أو ارسم ما اكتشفته في البيت أو الحديقة', '1f50d', tbl(['التاريخ', 'ماذا اكتشفت؟', 'رسمتي'], [['<td class="box"></td>'] * 3] * 8), 'اكتشفوا مع شخص بالغ، ولا تلمسوا الحيوانات أو النباتات المجهولة.')
g = '<h2>كيف ننمي الفضول؟</h2><ul><li>نرحب بكل سؤال ونبحث عن الجواب معا.</li><li>نمدح المحاولة لا النتيجة فقط.</li></ul><h2>الأمان في الاستكشاف</h2><ul><li>كل الأنشطة بمشاركة شخص بالغ.</li><li>نبتعد عن النار والأدوات الحادة والمواد الكيميائية.</li><li>نغسل الأيدي بعد لمس التراب والنباتات.</li><li>لا نأكل شيئا من الطبيعة قبل تأكد الكبير.</li></ul><h2>بعد كل نشاط</h2><ul><li>ماذا اكتشفنا اليوم؟</li><li>ما السؤال الذي بقي عندنا؟</li></ul>'
P['exp-parent-guide'] = doc('دليل ولي الأمر', 'فضول ومعرفة بأمان ومتعة', 'i_book', g)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for k, h in P.items():
        pg.set_content(h); pg.wait_for_timeout(300); pg.pdf(path=f'{OUT}/{k}.pdf', format='A4', print_background=True); print(k, os.path.getsize(f'{OUT}/{k}.pdf'))
    b.close()
