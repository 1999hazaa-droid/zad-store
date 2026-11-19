# -*- coding: utf-8 -*-
"""python3 vpdf.py : ينشئ files/values/*.pdf (8 ملفات) بخط Cairo ورسوم المنصة"""
import base64, os, html
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..'); OUT = ROOT + '/files/values'; os.makedirs(OUT, exist_ok=True)
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

VALS = [('الصدق والأمانة', '1f511', 'أقول ما حدث فعلا وأحافظ على الأمانات.'), ('الاحترام والتقدير', '1f64f', 'أستمع وأقول كلمات لطيفة.'), ('التعاون والمشاركة', '1f9e9', 'نعمل معا ونتشارك الأدوات.'), ('التعاطف', '1f60a', 'أفهم مشاعر غيري وأساعده.'), ('المسؤولية', '1f4aa', 'أقوم بمهمتي المناسبة لعمري.'), ('الصبر', '23f3', 'أنتظر دوري وأكمل خطوة خطوة.'), ('التسامح', 'i_heart', 'أعتذر وأسامح وأحل الخلاف بهدوء.'), ('النظافة والبيئة', '1f9fc', 'أحافظ على نظافتي ونظافة بيئتي.'), ('الثقة بالنفس', '2b50', 'أحاول وأتعلم من الخطأ.')]
cards = '<style>.cards{grid-template-columns:1fr 1fr 1fr}.cd{min-height:58mm;padding:3mm}</style><div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b><span class="sm">{E(d)}</span></div>' for t, i, d in VALS) + '</div>'
P['val-values-cards'] = doc('بطاقات القيم', 'قصوا البطاقات وعلقوها في ركن مناسب', '1f60a', cards, 'لكل بطاقة قيمة وجملة قصيرة يقرؤها الكبير مع الطفل.')
pos = [('قلت شكرا', '1f64f'), ('ساعدت أحدا', 'x_hand'), ('رتبت أغراضي', 'i_bag'), ('انتظرت دوري', '23f3'), ('قلت الحقيقة', '1f511'), ('حافظت على النظافة', '1f9fc'), ('جربت شيئا جديدا', '2b50')]
P['val-positive-chart'] = doc('لوحة السلوك الإيجابي', 'ضع نجمة عندما تفعل تصرفا جميلا', 'i_star', grid(pos, 'التصرف الجميل'), 'اللوحة للتشجيع فقط، ولا مقارنة بين الأطفال.')
tidy = [('أرتب ألعابي', '1f9f8'), ('أجهز حقيبتي', 'i_bag'), ('أرتب كتبي', 'i_book'), ('أرتب سريري', 'x_bed'), ('أضع ملابسي في مكانها', 'x_wardrobe'), ('أرتب مكان دراستي', 'i_desk')]
P['val-tidy-schedule'] = doc('جدول ترتيب الأدوات', 'أنجز المهمة وضع علامة', 'i_bag', grid(tidy, 'المهمة'), 'ابدؤوا بمهمة واحدة ثم زيدوا تدريجيا.')
kw = [('من فضلك', '1f64f', 'عندما أطلب شيئا'), ('شكرا لك', '1f60a', 'عندما يساعدني أحد'), ('آسف', '1f622', 'عندما أخطئ'), ('تفضل', 'x_hand', 'عندما أشارك'), ('لا بأس', 'i_heart', 'عندما يعتذر لي أحد'), ('هل أستطيع مساعدتك؟', '1f4aa', 'عندما يحتاج أحد إلى مساعدة')]
P['val-kind-words'] = doc('بطاقات الكلمات اللطيفة', 'نقرأ الكلمة ونقولها في موقفها', '1f64f', '<div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b><span class="sm">{E(d)}</span></div>' for t, i, d in kw) + '</div>')
ch = [('تحدي الكلمة الطيبة', '1f60a', 5), ('تحدي التعاون', '1f9e9', 3), ('تحدي ترتيب الأدوات', 'i_pencils', 5), ('تحدي المحافظة على النظافة', '1f9fc', 5), ('تحدي الاستماع واحترام الدور', '23f3', 3), ('تحدي تحمل المسؤولية', '1f4aa', 5)]
chrows = [f'<td class="l"><img src="{ic(i)}">{E(t)}</td>' + ''.join('<td class="box"></td>' for _ in range(5)) for t, i, n in ch]
P['val-challenges'] = doc('جدول التحديات', 'تحديات اختيارية، ضع علامة لكل يوم تنجزه', '1f3c6', tbl(['التحدي', 'يوم ١', 'يوم ٢', 'يوم ٣', 'يوم ٤', 'يوم ٥'], chrows), 'لا نحتاج إلى صور أو إثبات. العلامة تكفي، ومن لم يكمل فلا بأس.')
fe = [('فرح', '1f60a', 'أبتسم وأخبر من أحب'), ('حزن', '1f622', 'أطلب حضنا أو كلمة طيبة'), ('غضب', '1f620', 'أتنفس بهدوء وأقول ما يزعجني'), ('خوف', '1f628', 'أخبر شخصا كبيرا أثق به')]
P['val-feelings'] = doc('بطاقات المشاعر', 'كل المشاعر مقبولة، ونتعلم كيف نتصرف معها', '1f60a', '<div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b><span class="sm">{E(d)}</span></div>' for t, i, d in fe) + '</div>')
ar = [E(x) for x in ['الصدق والأمانة', 'الاحترام والتقدير', 'التعاون والمشاركة', 'التعاطف', 'المسؤولية', 'الصبر والانضباط', 'التسامح وحل الخلافات', 'النظافة والبيئة', 'الثقة بالنفس']]
P['val-family-tracker'] = doc('جدول متابعة الأسرة', 'سجلوا ما تلاحظونه من تقدم بكلمات إيجابية', 'i_chart', tbl(['القيمة', 'موقف جميل لاحظناه', 'نلعب به هذا الأسبوع'], [(f'<td class="l">{a}</td><td class="box" style="height:15mm"></td><td></td>') for a in ar]), 'هذا الجدول للأسرة فقط، ولا يحكم على أخلاق الطفل ولا يقارنه بغيره.')
g = '<h2>كيف نغرس القيم؟</h2><ul><li>القدوة أقوى من الكلام، فالطفل يقلد ما يرى.</li><li>نتحدث عن التصرف لا عن شخصية الطفل.</li><li>نمدح الجهد والمحاولة.</li><li>نقرأ قصة قصيرة ثم نتحدث: كيف شعر كل واحد؟</li><li>نعطيه مهمة صغيرة ثابتة تناسب عمره.</li></ul><h2>ما نتجنبه</h2><ul><li>لا نخيف الطفل ولا نحرجه أمام الآخرين.</li><li>لا نقارنه بإخوته أو زملائه.</li><li>لا نصفه بصفة سلبية.</li></ul><h2>إن احتجنا إلى مساعدة</h2><p>إن لاحظتم صعوبة مستمرة في التعامل مع المشاعر أو السلوك فاسألوا معلمة الطفل أو مختصا في تربية الطفل.</p>'
P['val-parent-guide'] = doc('دليل ولي الأمر', 'التربية الإيجابية بهدوء ومحبة', 'i_book', g)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for k, h in P.items():
        pg.set_content(h); pg.wait_for_timeout(300); pg.pdf(path=f'{OUT}/{k}.pdf', format='A4', print_background=True); print(k, os.path.getsize(f'{OUT}/{k}.pdf'))
    b.close()
