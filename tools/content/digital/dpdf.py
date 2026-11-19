# -*- coding: utf-8 -*-
"""python3 dpdf.py : ينشئ files/digital/*.pdf (7 ملفات) بخط Cairo ورسوم المنصة"""
import base64, os, html
from playwright.sync_api import sync_playwright
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..'); OUT = ROOT + '/files/digital'; os.makedirs(OUT, exist_ok=True)
b64 = lambda p, m: 'data:%s;base64,%s' % (m, base64.b64encode(open(p, 'rb').read()).decode())
FREG = b64(ROOT + '/fonts/cairo-regular.woff', 'font/woff'); FBLD = b64(ROOT + '/fonts/cairo-bold.woff', 'font/woff')
_c = {}
def ic(n):
    if n not in _c: _c[n] = b64(ROOT + '/images/dig/' + n + '.svg', 'image/svg+xml') if n.startswith('dg_') else b64(ROOT + '/images/zad/' + n + '.webp', 'image/webp')
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

def tbl(head, rows, widths=None):
    h = '<table><tr>' + ''.join(f'<th>{E(x)}</th>' for x in head) + '</tr>'
    for r in rows: h += '<tr>' + ''.join(c for c in r) + '</tr>'
    return h + '</table>'
P = {}
DV = [('الحاسوب المكتبي', 'dg_desktop', 'نكتب ونلعب ونتعلم عليه'), ('الحاسوب المحمول', 'dg_laptop', 'نحمله معنا بسهولة'), ('الجهاز اللوحي', 'dg_tablet', 'شاشته نلمسها بإصبعنا'), ('الهاتف', 'dg_phone', 'نتحدث به مع من نعرف بإذن الكبار'), ('لوحة المفاتيح', 'dg_keyboard', 'نكتب بها الحروف والأرقام'), ('الفأرة', 'dg_mouse', 'نحرك بها السهم ونضغط'), ('الطابعة', 'dg_printer', 'تطبع الورق'), ('السماعات', 'dg_headphones', 'نسمع بها بهدوء'), ('الكاميرا', 'dg_camera', 'تلتقط الصور بإذن الكبار')]
P['dig-device-cards'] = doc('بطاقات الأجهزة ووظائفها', 'قصّ البطاقات وطابق كل جهاز بما يفعله', 'dg_tablet', '<div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b><span class="sm">{E(f)}</span></div>' for t, i, f in DV) + '</div>', 'نستخدم الأجهزة مع شخص كبير وبوقت مناسب.')
kb = '<p>صل كل صورة بما نفعله بها: ارسم خطا من الجهاز إلى عمله.</p>' + tbl(['الجهاز', 'ماذا نفعل به؟'], [(f'<td class="l"><img src="{ic(i)}">{E(t)}</td><td class="box" style="height:16mm"></td>') for t, i in [('لوحة المفاتيح', 'dg_keyboard'), ('الفأرة', 'dg_mouse'), ('الشاشة', 'dg_screen'), ('السماعة', 'dg_speaker'), ('الطابعة', 'dg_printer')]]) + '<h2>أكمل الكلمات</h2><p>نكتب بـ <span class="line" style="display:inline-block;width:45mm"></span> ونحرك السهم بـ <span class="line" style="display:inline-block;width:45mm"></span></p>'
P['dig-keyboard-mouse'] = doc('ورقة عمل: لوحة المفاتيح والفأرة', 'أتعرف على أدوات الحاسوب', 'dg_keyboard', kb)
def maze():
    n = 5; g = '<table style="width:90mm;margin:4mm auto;direction:ltr">'
    for r in range(n):
        g += '<tr>' + ''.join('<td style="height:17mm;width:17mm;%s">%s</td>' % ('background:#6b5a9b;' if (r, c) in [(1, 1), (2, 1), (3, 3)] else ('background:#fff7d6;' if (r, c) == (0, 4) else ''), f'<img src="{ic("dg_bot")}" style="height:12mm">' if (r, c) == (4, 0) else (f'<img src="{ic("dg_goal")}" style="height:12mm">' if (r, c) == (0, 4) else '')) for c in range(n)) + '</tr>'
    g += '</table>'
    cmds = ''.join(f'<span style="display:inline-block;margin:1.5mm;padding:1.5mm 3mm;border:1.5px solid #6d28d9;border-radius:3mm"><img src="{ic(i)}" style="height:7mm;vertical-align:middle"> {t}</span>' for t, i in [('للأمام', 'dg_up'), ('ادر لليسار', 'dg_left'), ('ادر لليمين', 'dg_right'), ('كرر', 'dg_repeat')])
    sl = '<div style="display:flex;gap:2mm;flex-wrap:wrap;direction:rtl">' + ''.join('<div class="box" style="width:20mm;height:14mm;border:1.5px dashed #6d28d9;border-radius:2mm"></div>' for _ in range(8)) + '</div>'
    return '<p>الروبوت يبدأ من الأسفل ويريد الوصول إلى الهدف. المربعات الداكنة جدران. اختر الأوامر ورتبها في الخانات.</p>' + g + '<h2>الأوامر</h2>' + cmds + '<h2>رتب أوامرك</h2>' + sl
P['dig-commands-grid'] = doc('شبكة الأوامر والروبوت', 'أرسم الطريق بالأوامر', 'dg_bot', maze(), 'جرب الطريق بإصبعك أو بقلم الرصاص قبل أن تكتب الأوامر.')
SR = [('لا أقول كلمة المرور لأحد إلا لوالدي', 'dg_pw'), ('لا أكلم شخصا لا أعرفه', 'dg_stranger'), ('لا أكتب اسمي الكامل أو عنواني أو رقم هاتفي', 'dg_card'), ('لا أفتح رابطا مجهولا وأسأل كبيرا', 'dg_wifi'), ('أخبر شخصا كبيرا إذا شعرت بالقلق', '1f464'), ('أستخدم الجهاز في مكان يراني فيه أهلي', '1f3e0')]
P['dig-safety-rules'] = doc('بطاقة قواعد السلامة الرقمية', 'قواعد قصيرة نتذكرها معا. قصّها وعلّقها قرب الجهاز', 'dg_pw', '<div class="cards">' + ''.join(f'<div class="cd"><img src="{ic(i)}"><b>{E(t)}</b></div>' for t, i in SR) + '</div>', 'لن يعاقبك أحد إذا أخبرتنا بشيء أقلقك.')
SU = [('أستخدم الجهاز مع أهلي', 1), ('أعطي كلمة المرور لصديق', 0), ('أسأل قبل الضغط على رابط', 1), ('أكلم شخصا لا أعرفه', 0), ('أخبر أمي بما يقلقني', 1), ('أرسل صورتي لأي أحد', 0)]
su = '<p>اقرأ كل تصرف مع شخص كبير. لوّن الخانة الخضراء إذا كان آمنا، واشطب الخانة الحمراء إذا كان غير آمن.</p>' + tbl(['التصرف', 'آمن', 'غير آمن'], [(f'<td class="l">{E(t)}</td><td class="box" style="height:14mm"></td><td></td>') for t, _ in SU]) + '<p class="sm">اجلس مع طفلك وناقش سبب كل إجابة بهدوء.</p>'
P['dig-safe-unsafe'] = doc('ورقة عمل: آمن أم غير آمن', 'أميز التصرفات الآمنة', 'dg_pw', su)
def pat():
    seqs = [(['dg_up', 'dg_right', 'dg_up', 'dg_right'], 'الأسهم'), (['2b50', '1f319', '2b50', '1f319'], 'النجمة والقمر'), (['dg_ai', 'dg_bot', 'dg_ai', 'dg_bot'], 'الذكاء والروبوت'), (['dg_mouse', 'dg_keyboard', 'dg_mouse', 'dg_keyboard'], 'الأجهزة'), (['dg_up', 'dg_up', 'dg_right', 'dg_up', 'dg_up', 'dg_right'], 'نمط أطول')]
    h = '<p>انظر إلى الصور وارسم الصورة التي تأتي بعدها في الفراغ.</p>'
    for s, t in seqs: h += f'<h2>{E(t)}</h2><div style="display:flex;gap:3mm;align-items:center;direction:rtl">' + ''.join(f'<img src="{ic(x)}" style="height:14mm">' for x in s) + '<div style="width:16mm;height:16mm;border:2px dashed #6d28d9;border-radius:3mm"></div></div>'
    return h
P['dig-patterns'] = doc('ورقة عمل: اكتشف النمط', 'ما الصورة التالية؟', '1f9e9', pat())
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for k, h in P.items():
        pg.set_content(h); pg.wait_for_timeout(300); pg.pdf(path=f'{OUT}/{k}.pdf', format='A4', print_background=True); print(k, os.path.getsize(f'{OUT}/{k}.pdf'))
    b.close()
