# -*- coding: utf-8 -*-
"""python3 b_sheets.py : files/bank/*.pdf + معاينات webp، ويحفظ sheets.json"""
import base64, os, html, random, json, math
from playwright.sync_api import sync_playwright
from PIL import Image
import b_pics
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..'); OUT = ROOT + '/files/bank'; os.makedirs(OUT, exist_ok=True)
b64 = lambda p, m: 'data:%s;base64,%s' % (m, base64.b64encode(open(p, 'rb').read()).decode())
FREG = b64(ROOT + '/fonts/cairo-regular.woff', 'font/woff'); FBLD = b64(ROOT + '/fonts/cairo-bold.woff', 'font/woff')
_c = {}
def ic(n):
    if n not in _c:
        p = ROOT + '/images/dig/' + n + '.svg' if n.startswith('dg_') else ROOT + '/images/ready/' + n + '.svg' if n.startswith('rd_') else ROOT + '/images/zad/' + n + '.webp'
        _c[n] = b64(p, 'image/svg+xml' if p.endswith('.svg') else 'image/webp')
    return _c[n]
E = html.escape
CSS = f'''@font-face{{font-family:C;src:url({FREG});font-weight:400}}@font-face{{font-family:C;src:url({FBLD});font-weight:700}}
@page{{size:A4;margin:0}}*{{box-sizing:border-box}}html,body{{margin:0}}body{{font:400 13pt/1.6 C,sans-serif;color:#1b1430;direction:rtl}}
.pg{{width:210mm;height:297mm;padding:11mm 12mm;page-break-after:always;overflow:hidden;position:relative}}.pg:last-child{{page-break-after:auto}}
.top{{background:linear-gradient(135deg,#6d28d9,#a78bfa);color:#fff;border-radius:5mm;padding:4mm 7mm;display:flex;align-items:center;gap:5mm;margin-bottom:5mm}}.top img{{height:16mm}}.top h1{{margin:0;font-size:20pt}}.top p{{margin:0;font-size:11pt}}
.nm{{display:flex;justify-content:space-between;font-size:11pt;margin-bottom:4mm}}.nm span{{border-bottom:1.5px solid #8f7fc4;min-width:60mm;display:inline-block;height:7mm}}
.foot{{position:absolute;bottom:8mm;left:12mm;right:12mm;font-size:9pt;color:#5a4d80;text-align:center}}
table{{width:100%;border-collapse:collapse}}th,td{{border:1.5px solid #b9a8e8;padding:2mm;text-align:center;font-size:11pt}}th{{background:#efe8ff}}
.row{{display:flex;align-items:center;gap:4mm;border:1.5px solid #d9cff5;border-radius:4mm;padding:2mm 4mm;margin-bottom:3mm}}.row img{{height:15mm}}
.trace{{font:700 40pt/1 C;color:#d6cff0;letter-spacing:3mm;white-space:nowrap}}.box{{display:inline-block;width:12mm;height:12mm;border:2px solid #6d28d9;border-radius:3mm;vertical-align:middle}}
.line{{border-bottom:1.5px solid #b9a8e8;height:9mm;margin:1mm 0}}.sm{{font-size:10pt;color:#5a4d80}}h2{{color:#6d28d9;font-size:14pt;margin:3mm 0 2mm}}
.g2{{display:grid;grid-template-columns:1fr 1fr;gap:4mm}}.g3{{display:grid;grid-template-columns:1fr 1fr 1fr;gap:4mm}}.g4{{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm}}
svg.pic{{width:100%;height:auto}}svg.pic .pt{{fill:#fff;stroke:#3b1a85;stroke-width:3;stroke-linejoin:round}}.dash{{fill:none;stroke:#6d28d9;stroke-width:3;stroke-dasharray:2 7;stroke-linecap:round}}'''
def doc(title, sub, icon, pages, foot='زاد التعليمية: اطبع الورقة واستمتع بالنشاط بمشاركة الكبير. التشجيع أهم من الكمال.'):
    ps = ''.join(f'<div class="pg"><div class="top"><img src="{ic(icon)}"><div><h1>{E(title)}</h1><p>{E(sub)}</p></div></div><div class="nm"><div>الاسم: <span></span></div><div>التاريخ: <span style="min-width:40mm"></span></div></div>{b}<div class="foot">{E(foot)}</div></div>' for b in pages)
    return f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>{CSS}</style></head><body>{ps}</body></html>'
SH = []
def sheet(slug, cat, title, icon, lv, subject, skill, diff, descr, sub, pages):
    SH.append(dict(slug=slug, cat=cat, title=title, icon=icon, levels=lv, subject=subject, skill=skill, difficulty=diff, descr=descr, html=doc(title, sub, icon, pages), sort=list(['arabic', 'math', 'english', 'science', 'focus', 'motor', 'values', 'art']).index(cat) * 100 + 50 + len(SH)))
# ---- العربية
LT = [('أ', 'أرنب', '1f430'), ('ب', 'بطة', '1f986'), ('ت', 'تفاحة', '1f34e'), ('ث', 'ثعلب', '1f98a'), ('ج', 'جمل', '1f42a'), ('ح', 'حصان', '1f434')]
sheet('bs-ar-trace', 'arabic', 'ورقة تتبع الحروف', '1f430', ['a3', 'a4', 'a5'], 'اللغة العربية', 'تتبع الحروف وربطها بالكلمات', 'easy', 'نتتبع الحرف بالقلم ونتعرف على كلمة تبدأ به.', 'تتبع الحرف ثم لونه', ['\n'.join(f'<div class="row"><img src="{ic(i)}"><div style="min-width:28mm"><b style="font-size:16pt">{w}</b></div><div class="trace">{l} {l} {l} {l}</div></div>' for l, w, i in LT)])
r = random.Random(5); rt = LT[:]; r.shuffle(rt)
sheet('bs-ar-match', 'arabic', 'ورقة وصل الحرف بالصورة', '1f98a', ['a4', 'a5', 'a6'], 'اللغة العربية', 'ربط الحرف بالكلمة التي تبدأ به', 'easy', 'نرسم خطا من الحرف إلى صورته.', 'صل كل حرف بصورته', [f'<div style="display:flex;justify-content:space-between;padding:6mm 14mm">' + '<div>' + ''.join(f'<div style="height:30mm;display:flex;align-items:center"><span class="trace" style="font-size:44pt;color:#6d28d9;letter-spacing:0">{l}</span></div>' for l, w, i in LT) + '</div><div>' + ''.join(f'<div style="height:30mm;display:flex;align-items:center;gap:3mm"><img src="{ic(i)}" style="height:22mm"><b>{w}</b></div>' for l, w, i in rt) + '</div></div>'])
WD = [('ج ـ ل', 'جمل', '1f42a'), ('ف ـ ل', 'فيل', '1f418'), ('ك ـ ب', 'كلب', '1f436'), ('ق ـ ر', 'قمر', '1f319'), ('و ـ د', 'ورد', '1f339'), ('س ـ ك', 'سمك', '1f41f')]
sheet('bs-ar-words', 'arabic', 'ورقة الكلمات والجمل', 'i_pencil', ['g1', 'g2'], 'اللغة العربية', 'إكمال كلمات وكتابة جمل قصيرة', 'mid', 'نكمل الحرف الناقص ونكتب جملة عن كل صورة.', 'أكمل الحرف الناقص ثم اكتب', ['<h2>أكمل الحرف الناقص</h2><div class="g3">' + ''.join(f'<div class="row" style="flex-direction:column"><img src="{ic(i)}"><b style="font-size:20pt">{a}</b><span class="box"></span></div>' for a, w, i in WD) + '</div><h2>اكتب جملة قصيرة عن صورة تحبها</h2>' + '<div class="line"></div>' * 5 + '<h2>رتب الكلمات: الطفل / يقرأ / الكتاب</h2><div class="line"></div><div class="line"></div>'])
# ---- الرياضيات
cnt = ''.join(f'<div class="row"><div style="flex:1">' + ''.join(f'<img src="{ic(["1f34e", "2b50", "1f41f", "1f338", "1f34c"][(n - 1) % 5])}" style="height:11mm">' for n in range(n)) + f'</div><span class="box"></span><b style="font-size:16pt;min-width:14mm">{n}</b></div>' for n in range(1, 11))
sheet('bs-ma-count', 'math', 'ورقة العد من ١ إلى ١٠', 'u_n10', ['a3', 'a4', 'a5'], 'الرياضيات', 'العد وكتابة الأرقام', 'easy', 'نعد الأشياء ونكتب الرقم في المربع.', 'عد ثم اكتب الرقم', [f'<div style="transform:scale(.93);transform-origin:top right">{cnt}</div>'])
rr = random.Random(9); add = [(rr.randint(1, 9), rr.randint(1, 10)) for _ in range(16)]; sub = [(a + b, b) for a, b in [(rr.randint(1, 9), rr.randint(1, 9)) for _ in range(16)]]
eq = lambda l, op: '<div class="g2">' + ''.join(f'<div class="row" style="justify-content:center;font:700 18pt C;direction:ltr"><span>{a} {op} {b} =</span><span class="box"></span></div>' for a, b in l) + '</div>'
key = lambda l, f: '<div class="g4" style="direction:ltr">' + ''.join(f'<div class="sm">{a} {"+" if f == "+" else "−"} {b} = <b>{a + b if f == "+" else a - b}</b></div>' for a, b in l) + '</div>'
sheet('bs-ma-add', 'math', 'ورقة الجمع والطرح', 'u_plus', ['g1', 'g2'], 'الرياضيات', 'الجمع والطرح ضمن عشرين', 'mid', 'اثنتان وثلاثون مسألة جمع وطرح ومعها صفحة إجابات لولي الأمر.', 'احسب واكتب الناتج', [f'<h2>الجمع</h2>{eq(add[:8], "+")}<h2>الطرح</h2>{eq(sub[:8], "−")}', f'<h2>الجمع</h2>{eq(add[8:], "+")}<h2>الطرح</h2>{eq(sub[8:], "−")}', f'<h2>صفحة الإجابات لولي الأمر</h2><h2 class="sm">الجمع</h2>{key(add, "+")}<h2 class="sm">الطرح</h2>{key(sub, "−")}'])
mt = [(a, b) for a in (2, 3, 4, 5) for b in range(1, 11)]; rr.shuffle(mt); mt = mt[:24]
sheet('bs-ma-mult', 'math', 'ورقة جدول الضرب', 'i_numbers', ['g3', 'g4'], 'الرياضيات', 'حفظ نواتج الضرب الأساسية', 'mid', 'جداول 2 و3 و4 و5 مع صفحة إجابات.', 'احسب واكتب الناتج', [f'<h2>أكمل جدول الضرب</h2><div class="g4" style="direction:ltr">' + ''.join(f'<table style="font-size:11pt">' + ''.join(f'<tr><td>{a} × {b}</td><td style="width:16mm"></td></tr>' for b in range(1, 11)) + '</table>' for a in (2, 3, 4, 5)) + '</div>', '<h2>مسائل متنوعة</h2><div class="g2">' + ''.join(f'<div class="row" style="justify-content:center;font:700 17pt C;direction:ltr"><span>{a} × {b} =</span><span class="box"></span></div>' for a, b in mt[:12]) + '</div>' + '<h2>حل المسائل</h2><div class="row"><b>في كل علبة 5 أقلام. كم قلما في 4 علب؟</b></div><div class="line"></div><div class="row"><b>وزع معلم 20 كتابا على 4 طلاب بالتساوي. كم كتابا لكل طالب؟</b></div><div class="line"></div>', '<h2>صفحة الإجابات لولي الأمر</h2><div class="g4" style="direction:ltr">' + ''.join(f'<div class="sm">{a} × {b} = <b>{a * b}</b></div>' for a, b in mt[:12]) + '</div><p class="sm">الجدول: ناتج الضرب يساوي العدد مضروبا في الرقم. المسألة الأولى 20 قلما، والثانية 5 كتب لكل طالب.</p>'])
# ---- الإنجليزية
EW = [('apple', '1f34e'), ('cat', '1f431'), ('dog', '1f436'), ('fish', '1f41f'), ('bird', '1f426'), ('ball', '26bd')]
sheet('bs-en-abc', 'english', 'ABC letters sheet', 'u_abc', ['a4', 'a5', 'a6'], 'English', 'Writing the capital and small letters', 'easy', 'Trace and write A to H.', 'Trace and write', ['<table><tr><th>Letter</th><th>Trace</th><th>Write</th><th>Picture</th></tr>' + ''.join(f'<tr style="height:25mm"><td style="font:700 28pt C;direction:ltr">{c.upper()}{c}</td><td class="trace" style="direction:ltr;font-size:30pt;letter-spacing:2mm">{c.upper()}{c}</td><td></td><td><img src="{ic(i)}" style="height:17mm"><div style="direction:ltr;font-weight:700">{w}</div></td></tr>' for c, w, i in [('a', 'apple', '1f34e'), ('b', 'ball', '26bd'), ('c', 'cat', '1f431'), ('d', 'dog', '1f436'), ('e', 'egg', 'x_egg'), ('f', 'fish', '1f41f'), ('g', 'grapes', '1f347')]) + '</table>'])
sheet('bs-en-words', 'english', 'Picture words sheet', '1f431', ['g1', 'g2'], 'English', 'Writing familiar words', 'mid', 'Look and write the word.', 'Look and write', ['<div style="direction:ltr;text-align:center"><p class="sm">Word bank: apple · cat · dog · fish · bird · ball</p></div><div class="g2">' + ''.join(f'<div class="row" style="flex-direction:column"><img src="{ic(i)}" style="height:24mm"><div style="width:100%;border-bottom:1.5px solid #b9a8e8;height:10mm"></div></div>' for w, i in EW) + '</div>', '<h2 style="direction:ltr">Answers (for parents)</h2><div class="g3" style="direction:ltr">' + ''.join(f'<div class="row"><img src="{ic(i)}" style="height:13mm"><b>{w}</b></div>' for w, i in EW) + '</div>'])
# ---- العلوم
sheet('bs-sc-plant', 'science', 'ورقة ملاحظة نبتة', '1f331', ['a5', 'a6', 'g1', 'g2', 'g3'], 'العلوم', 'الملاحظة وتسجيل ما نراه', 'mid', 'نلاحظ نبتة خمسة أيام ونرسم ما نراه.', 'نلاحظ ونرسم', ['<table><tr><th>اليوم</th><th>ماذا لاحظت؟</th><th>رسمتي</th></tr>' + ''.join(f'<tr style="height:26mm"><td><b>{d}</b></td><td></td><td></td></tr>' for d in ['الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس']) + '</table><h2>هل كبرت النبتة؟ ماذا احتاجت؟</h2><div class="line"></div><div class="line"></div>'])
sheet('bs-sc-animals', 'science', 'ورقة تصنيف الحيوانات', '1f981', ['a5', 'a6', 'g1', 'g2'], 'العلوم', 'تصنيف الحيوانات حسب بيئتها', 'mid', 'نكتب كل حيوان تحت بيئته.', 'اكتب كل حيوان في مكانه', ['<div class="g4">' + ''.join(f'<div class="row" style="flex-direction:column"><img src="{ic(i)}" style="height:17mm"><b>{n}</b></div>' for n, i in [('بقرة', '1f404'), ('أسد', '1f981'), ('سمكة', '1f41f'), ('خروف', '1f411'), ('فيل', '1f418'), ('حوت', '1f40b'), ('دجاجة', '1f414'), ('زرافة', '1f992')]) + '</div><table style="margin-top:6mm"><tr><th>المزرعة</th><th>البرية</th><th>البحر</th></tr>' + '<tr style="height:30mm"><td></td><td></td><td></td></tr>' * 2 + '</table>'])
# ---- التركيز
ODD = [[('1f34e', 0), ('1f34c', 0), ('1f431', 1), ('1f347', 0)], [('1f436', 0), ('1f431', 0), ('1f697', 1), ('1f434', 0)], [('2600', 1), ('1f339', 0), ('1f337', 0), ('1f33b', 0)], [('1f41f', 0), ('1f40b', 0), ('1f42c', 0), ('1f98b', 1)], [('1f68c', 0), ('1f697', 0), ('1f6b2', 0), ('1f41d', 1)]]
sheet('bs-fc-odd', 'focus', 'ورقة اكتشف المختلف', '1f50d', ['a4', 'a5', 'a6', 'g1'], 'الإدراك والتركيز', 'اكتشاف العنصر المختلف', 'easy', 'نضع دائرة حول الصورة المختلفة.', 'ضع دائرة حول المختلف', ['<div>' + ''.join('<div class="row" style="justify-content:space-around">' + ''.join(f'<img src="{ic(i)}" style="height:22mm">' for i, o in rw) + '</div>' for rw in ODD) + '</div>', '<h2>الإجابات لولي الأمر</h2><p class="sm">الصف الأول: القطة. الثاني: السيارة. الثالث: الشمس. الرابع: الفراشة. الخامس: النحلة.</p>'])
def maze(n, seed):
    r = random.Random(seed); g = [[{'N': 1, 'S': 1, 'E': 1, 'W': 1, 'v': 0} for _ in range(n)] for _ in range(n)]; st = [(0, 0)]; g[0][0]['v'] = 1
    while st:
        x, y = st[-1]; nb = [(x + dx, y + dy, a, b) for dx, dy, a, b in [(1, 0, 'E', 'W'), (-1, 0, 'W', 'E'), (0, 1, 'S', 'N'), (0, -1, 'N', 'S')] if 0 <= x + dx < n and 0 <= y + dy < n and not g[y + dy][x + dx]['v']]
        if not nb: st.pop(); continue
        nx, ny, a, b = r.choice(nb); g[y][x][a] = 0; g[ny][nx][b] = 0; g[ny][nx]['v'] = 1; st.append((nx, ny))
    s = 22; ln = ''
    for y in range(n):
        for x in range(n):
            c = g[y][x]; X, Y = 10 + x * s, 10 + y * s
            if c['N'] and not (x == 0 and y == 0): ln += f'<line x1="{X}" y1="{Y}" x2="{X + s}" y2="{Y}"/>'
            if c['W']: ln += f'<line x1="{X}" y1="{Y}" x2="{X}" y2="{Y + s}"/>'
            if y == n - 1 and c['S'] and not (x == n - 1): ln += f'<line x1="{X}" y1="{Y + s}" x2="{X + s}" y2="{Y + s}"/>'
            if x == n - 1 and c['E']: ln += f'<line x1="{X + s}" y1="{Y}" x2="{X + s}" y2="{Y + s}"/>'
    w = 20 + n * s
    return f'<svg viewBox="0 0 {w} {w}" style="width:150mm;display:block;margin:auto" stroke="#3b1a85" stroke-width="3" stroke-linecap="round">{ln}<text x="{10 + s / 2}" y="7" font-size="9" text-anchor="middle" fill="#2e9d57" stroke="none" font-family="C">ابدأ</text><text x="{w - 10 - s / 2}" y="{w - 1}" font-size="9" text-anchor="middle" fill="#c0392b" stroke="none" font-family="C">النهاية</text></svg>'
sheet('bs-fc-maze', 'focus', 'ورقة المتاهة', '1f9ed', ['a5', 'a6', 'g1', 'g2'], 'الإدراك والتركيز', 'التركيز وتخطيط الطريق', 'mid', 'نرسم طريقا من البداية إلى النهاية.', 'ارسم الطريق من ابدأ إلى النهاية', [maze(10, 3)])
# ---- الحركية
def path(d): return f'<svg viewBox="0 0 400 40" style="width:100%;height:20mm"><path class="dash" d="{d}"/></svg>'
LNS = ['M10 20 H390', 'M10 30 L50 10 L90 30 L130 10 L170 30 L210 10 L250 30 L290 10 L330 30 L370 10', 'M10 20 Q50 0 90 20 T170 20 T250 20 T330 20 T390 20', 'M10 30 C60 -10 110 -10 160 30 S260 70 310 10 S380 10 390 20']
sheet('bs-mo-lines', 'motor', 'ورقة تتبع الخطوط', 'i_pencil', ['a3', 'a4', 'a5'], 'المهارات الحركية', 'تتبع الخطوط والتآزر بين العين واليد', 'easy', 'نتتبع الخطوط المنقطة بالقلم.', 'تتبع الخطوط بالقلم', ['<div>' + ''.join(f'<div class="row">{path(d)}</div>' for d in LNS * 2) + '</div>'])
def dots(pts, n=None):
    s = ''.join(f'<circle cx="{x}" cy="{y}" r="4" fill="#3b1a85"/><text x="{x + 8}" y="{y - 6}" font-size="14" font-family="C" fill="#6d28d9">{i + 1}</text>' for i, (x, y) in enumerate(pts))
    return f'<svg viewBox="0 0 300 300" style="width:150mm;display:block;margin:auto;border:1.5px dashed #d9cff5;border-radius:6mm">{s}</svg>'
STAR = [(150 + 110 * math.sin(math.radians(a)), 160 - 110 * math.cos(math.radians(a))) for a in [0, 144, 288, 72, 216]]
HOUSE = [(60, 250), (60, 150), (30, 150), (150, 40), (270, 150), (240, 150), (240, 250), (180, 250), (180, 190), (120, 190)]
sheet('bs-mo-dots', 'motor', 'ورقة توصيل النقاط', '2b50', ['a4', 'a5', 'a6', 'g1'], 'المهارات الحركية', 'توصيل النقاط بالترتيب', 'easy', 'نوصل النقاط بالترتيب لنكتشف الرسمة.', 'صل النقاط بالترتيب', [f'<h2>ما الرسمة؟ (نجمة)</h2>{dots([(round(x), round(y)) for x, y in STAR])}', f'<h2>ما الرسمة؟ (بيت)</h2>{dots(HOUSE)}'])
sheet('bs-mo-cut', 'motor', 'ورقة القص واللصق الآمن', 'i_scissors', ['a5', 'a6', 'g1', 'g2'], 'المهارات الحركية', 'القص على الخطوط بإشراف الكبار', 'mid', 'نقص الأشكال على الخط بمقص آمن وبإشراف كبير.', 'قص بمقص آمن وبإشراف كبير', ['<p class="sm"><b>تنبيه:</b> يستعمل الطفل مقصا آمنا مدور الرأس وبإشراف شخص كبير.</p><div class="g3">' + ''.join(f'<div style="border:3px dashed #6d28d9;border-radius:5mm;padding:4mm;text-align:center"><img src="{ic(i)}" style="height:26mm"><div><b>{n}</b></div></div>' for n, i in [('دائرة', 'rd_circle_blue'), ('مربع', 'rd_square_red'), ('مثلث', 'rd_triangle_green'), ('مستطيل', 'rd_rect_yellow'), ('دائرة', 'rd_circle_red'), ('مربع', 'rd_square_green')]) + '</div><h2>الصق الأشكال هنا لتصنع بيتا أو سيارة أو وجها</h2><div style="border:2px solid #b9a8e8;border-radius:5mm;height:105mm"></div>'])
# ---- القيم
sheet('bs-va-feel', 'values', 'ورقة المشاعر', '1f604', ['a3', 'a4', 'a5', 'a6', 'g1'], 'القيم والسلوك', 'التعرف على المشاعر والتعبير عنها', 'easy', 'نتعرف على المشاعر ونتحدث عنها.', 'تحدث عن كل شعور', ['<div class="g2">' + ''.join(f'<div class="row" style="flex-direction:column"><img src="{ic(i)}" style="height:24mm"><b style="font-size:16pt">{n}</b><div class="sm">متى تشعر بهذا الشعور؟</div><div class="line" style="width:100%"></div></div>' for n, i in [('سعيد', '1f604'), ('حزين', '1f622'), ('غاضب', '1f620'), ('خائف', '1f628')]) + '</div>'])
sheet('bs-va-good', 'values', 'جدول الأفعال الطيبة', '1f64f', ['a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'], 'القيم والسلوك', 'ممارسة سلوكيات إيجابية يوميا', 'easy', 'نضع نجمة كلما فعلنا فعلا طيبا.', 'ضع نجمة عند كل فعل طيب', ['<table><tr><th style="width:55mm">الفعل الطيب</th>' + ''.join(f'<th>{d}</th>' for d in ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']) + '</tr>' + ''.join(f'<tr style="height:15mm"><td><b>{t}</b></td>' + '<td></td>' * 7 + '</tr>' for t in ['أقول شكرا', 'أساعد في البيت', 'أرتب ألعابي', 'أغسل يدي', 'أقول الصدق', 'أحترم الآخرين']) + '</table>'])
# ---- الفنون
sheet('bs-ar-color1', 'art', 'لوحة تلوين: البيت والشجرة', '1f3a8', ['a3', 'a4', 'a5', 'a6', 'g1', 'g2'], 'الفنون والإبداع', 'التلوين والإبداع', 'easy', 'نلون البيت والشجرة كما نحب.', 'لون الرسمة بألوانك', ['<div class="g2"><div>' + b_pics.svg('house', cls='pic') + '</div><div>' + b_pics.svg('tree', cls='pic') + '</div></div><p class="sm">يمكنك إضافة ما تحب من رسوم حولهما.</p>'])
sheet('bs-ar-color2', 'art', 'لوحة تلوين: السمكة والزهرة', '1f41f', ['a3', 'a4', 'a5', 'a6', 'g1', 'g2'], 'الفنون والإبداع', 'التلوين والإبداع', 'easy', 'نلون السمكة والزهرة.', 'لون الرسمة بألوانك', ['<div class="g2"><div>' + b_pics.svg('fish', cls='pic') + '</div><div>' + b_pics.svg('flower', cls='pic') + '</div></div>'])
sheet('bs-ar-card', 'art', 'تصميم بطاقة تهنئة', '1f48c' if False else '1f389', ['a5', 'a6', 'g1', 'g2', 'g3', 'g4'], 'الفنون والإبداع', 'تصميم عمل فني وكتابة عبارة طيبة', 'mid', 'نصمم بطاقة لشخص نحبه.', 'صمم بطاقتك', ['<div class="g2"><div style="border:3px dashed #6d28d9;border-radius:5mm;height:200mm;padding:6mm;text-align:center"><h2>الواجهة</h2><p class="sm">ارسم وزخرف ولون</p></div><div style="border:3px dashed #6d28d9;border-radius:5mm;height:200mm;padding:6mm"><h2>الداخل</h2><p class="sm">اكتب عبارة طيبة</p>' + '<div class="line"></div>' * 6 + '</div></div><p class="sm">اطو الورقة من المنتصف لتصنع بطاقة.</p>'])
if __name__ == '__main__':
    meta = []
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 794, 'height': 1123})
        for s in SH:
            pg.set_content(s['html']); pg.wait_for_timeout(250)
            pg.pdf(path=f"{OUT}/{s['slug']}.pdf", format='A4', print_background=True)
            pg.screenshot(path='/tmp/_pv.png', clip={'x': 0, 'y': 0, 'width': 794, 'height': 1123})
            Image.open('/tmp/_pv.png').convert('RGB').resize((400, 566)).save(f"{OUT}/{s['slug']}.webp", quality=80)
            meta.append({k: v for k, v in s.items() if k != 'html'}); print(s['slug'], os.path.getsize(f"{OUT}/{s['slug']}.pdf"))
        b.close()
    json.dump(meta, open(D + '/sheets.json', 'w', encoding='utf-8'), ensure_ascii=False)
