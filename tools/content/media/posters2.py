# -*- coding: utf-8 -*-
from common import *
import math
PN = 'محتوى وتصميم أصليان من إعداد زاد، غير منسوبين إلى منهج أو كتاب محدد. لم يُراجَع من جهة تعليمية رسمية.'
def SP(**k): k.setdefault('kind', 'poster'); k.setdefault('orient', 'portrait'); k.setdefault('note', PN); return k
def P(sp, t, s, body): return [page(sp, t, s, body)]
LRO = lambda s: '‭' + s + '‬'
def frac(n, d, c='#333', s=18):
    return f'<span style="display:inline-flex;flex-direction:column;align-items:center;font-weight:700;font-size:{s}pt;color:{c};line-height:1.05;vertical-align:middle"><span>{AD(n)}</span><span style="border-top:.6mm solid {c};padding:0 1.5mm">{AD(d)}</span></span>'

@spec('poster-planets')
def _():
    sp = SP(title='كواكب المجموعة الشمسية', desc='ملصق الكواكب الثمانية مرتبة من الأقرب إلى الشمس إلى الأبعد، مع نوع كل كوكب ومعلومة سهلة عنه.', levels=['g3', 'g4', 'g5', 'g6'], subject='العلوم', topic='الفضاء', sort=40)
    D = [('عطارد', 'صخري', 'الأقرب إلى الشمس', '#757575', 8), ('الزهرة', 'صخري', 'أشدّ الكواكب حرارة', '#f9a825', 11), ('الأرض', 'صخري', 'الكوكب الذي نعيش عليه', '#039be5', 11), ('المريخ', 'صخري', 'يُسمّى الكوكب الأحمر', '#e53935', 9), ('المشتري', 'عملاق غازي', 'أكبر الكواكب', '#fb8c00', 22), ('زحل', 'عملاق غازي', 'له حلقات واضحة', '#d4a017', 19), ('أورانوس', 'عملاق', 'يدور مائلًا على جانبه', '#26c6da', 15), ('نبتون', 'عملاق', 'أبعد الكواكب عن الشمس', '#3949ab', 14)]
    rows = ''
    for i, (n, t, f, c, r) in enumerate(D):
        ring = f'<div style="position:absolute;left:50%;top:50%;width:{r * 1.7:.0f}mm;height:{r * .5:.0f}mm;border:.9mm solid {c}aa;border-radius:50%;transform:translate(-50%,-50%) rotate(-15deg)"></div>' if n == 'زحل' else ''
        rows += f'<div style="display:flex;align-items:center;gap:4mm;flex:1;border:.6mm solid {c};background:{c}12;border-radius:5mm;padding:0 4mm"><div style="width:11mm;height:11mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:16pt;font-weight:700;flex:none">{AD(i + 1)}</div><div style="width:30mm;height:24mm;display:grid;place-items:center;flex:none;position:relative"><div style="width:{r}mm;height:{r}mm;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff8,{c} 55%)"></div>{ring}</div><div style="flex:1"><div style="font-size:21pt;font-weight:700;color:{c}">{n}</div><div style="font-size:12.5pt">{f}</div></div><div style="font-size:12pt;font-weight:700;background:#fff;border-radius:99px;padding:1mm 4mm;border:.4mm solid {c}">{t}</div></div>'
    body = f'<div style="display:flex;flex-direction:column;gap:2mm;flex:1;min-height:0">{rows}</div><div style="text-align:center;font-size:12pt;margin-top:2mm;color:#4b4666">الشمس نجم في الوسط، وتدور حولها الكواكب الثمانية · الأحجام تقريبية للتوضيح</div>'
    return sp, P(sp, 'كواكب المجموعة الشمسية', 'من الأقرب إلى الشمس إلى الأبعد', body)

@spec('poster-angles')
def _():
    sp = SP(title='أنواع الزوايا', desc='ملصق أنواع الزوايا مرسومة بدقة بالقياس: حادة (٤٥°) وقائمة (٩٠°) ومنفرجة (١٣٥°) ومستقيمة (١٨٠°).', levels=['g3', 'g4', 'g5'], subject='الرياضيات', topic='الهندسة', sort=41, orient='portrait')
    def ang(deg, c, nm, desc):
        R = 50; ox, oy = 18, 62
        x2, y2 = ox + R * math.cos(math.radians(deg)), oy - R * math.sin(math.radians(deg))
        ar = 18; ax, ay = ox + ar * math.cos(math.radians(deg)), oy - ar * math.sin(math.radians(deg))
        large = 1 if deg > 180 else 0
        mark = f'<path d="M {ox + 12} {oy} L {ox + 12} {oy - 12} L {ox} {oy - 12}" fill="none" stroke="{c}" stroke-width="1.6"/>' if deg == 90 else f'<path d="M {ox + ar} {oy} A {ar} {ar} 0 {large} 0 {ax:.1f} {ay:.1f}" fill="none" stroke="{c}" stroke-width="2"/>'
        svg = f'<svg viewBox="0 0 80 70" width="100%" height="100%" style="direction:ltr"><line x1="{ox}" y1="{oy}" x2="{ox + R + 6}" y2="{oy}" stroke="#333" stroke-width="2" stroke-linecap="round"/><line x1="{ox}" y1="{oy}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="#333" stroke-width="2" stroke-linecap="round"/>{mark}<circle cx="{ox}" cy="{oy}" r="2.2" fill="{c}"/></svg>'
        return f'<div class="cell" style="border-color:{c};background:{c}12;gap:1mm;padding:3mm"><div style="flex:1;width:100%;min-height:0">{svg}</div><div style="font-size:20pt;font-weight:700;color:{c}">{nm} ({LRO(AD(deg) + "°")})</div><div style="font-size:12pt;text-align:center">{desc}</div></div>'
    cells = ang(45, '#e53935', 'زاوية حادة', 'أصغر من القائمة') + ang(90, '#43a047', 'زاوية قائمة', 'مثل ركن الورقة') + ang(135, '#039be5', 'زاوية منفرجة', 'أكبر من القائمة وأصغر من المستقيمة') + ang(180, '#8e24aa', 'زاوية مستقيمة', 'ضلعاها على خط مستقيم')
    return sp, P(sp, 'أنواع الزوايا', 'نقيس الزاوية بالدرجات', f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;flex:1;min-height:0;gap:4mm">{cells}</div>')

@spec('poster-primes')
def _():
    pr = [n for n in range(2, 51) if all(n % k for k in range(2, int(n ** .5) + 1))]
    sp = SP(title='الأعداد الأولية حتى ٥٠', desc='لوحة الأعداد من ١ إلى ٥٠ تُظهر الأعداد الأولية بلون مميّز، والقائمة محسوبة برمجيًا، مع تعريف العدد الأولي.', levels=['g5', 'g6'], subject='الرياضيات', topic='الأعداد', sort=42)
    cells = ''
    for n in range(1, 51):
        p = n in pr
        cells += f'<div style="display:grid;place-items:center;border-radius:2mm;font-size:17pt;font-weight:700;background:{"#6a2bd9" if p else "#f4f1fb"};color:{"#fff" if p else "#8a84a3"}">{AD(n)}</div>'
    grid = f'<div style="display:grid;grid-template-columns:repeat(10,1fr);grid-template-rows:repeat(5,1fr);gap:1.4mm;flex:1;min-height:0;direction:ltr">{cells}</div>'
    info = f'<div style="margin-top:3mm;font-size:13.5pt;line-height:1.7;background:#f1e9ff;border-radius:4mm;padding:3mm 5mm"><b>العدد الأولي</b>: عدد أكبر من ١ لا يقبل القسمة إلا على ١ وعلى نفسه.<br>الأعداد الأولية حتى ٥٠ (عددها {AD(len(pr))}): {LRO("، ".join(AD(x) for x in pr))}<br>العدد ١ ليس أوليًّا، والعدد ٢ هو العدد الأولي الزوجي الوحيد.</div>'
    return sp, P(sp, 'الأعداد الأولية حتى ٥٠', 'الأعداد الملوّنة بالبنفسجي أولية', grid + info)

@spec('poster-place-value')
def _():
    sp = SP(title='القيمة المكانية حتى الملايين', desc='ملصق القيمة المكانية للعدد ٣٬٤٨٢٬١٥٧: اسم كل منزلة وقيمة كل رقم فيها، محسوبة برمجيًا.', levels=['g4', 'g5', 'g6'], subject='الرياضيات', topic='القيمة المكانية', sort=43, orient='landscape')
    num = 3482157; ds = str(num); names = ['آحاد الملايين', 'مئات الآلاف', 'عشرات الآلاف', 'آلاف', 'مئات', 'عشرات', 'آحاد']
    cls = [('الملايين', 1), ('الآلاف', 3), ('الآحاد', 3)]
    cols = ''
    for i, d in enumerate(ds):
        c = PAL[[0, 1, 1, 1, 3, 3, 3][i] + (0 if i else 0)]; v = int(d) * 10 ** (6 - i)
        cols += f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:space-around;gap:2mm;border:.6mm solid {c};background:{c}12;border-radius:4mm;padding:3mm 1mm"><div style="font-size:15pt;font-weight:700;color:{c};text-align:center;line-height:1.2;height:16mm">{names[i]}</div><div style="font-size:54pt;font-weight:700;color:{c};line-height:1">{AD(d)}</div><div style="font-size:13pt;color:#4b4666">قيمته</div><div style="font-size:19pt;font-weight:700">{LRO(AD(f"{v:,}"))}</div></div>'
    body = f'<div style="text-align:center;font-size:40pt;font-weight:700;color:var(--c);margin-bottom:3mm">{LRO(AD("3,482,157"))}</div><div style="display:flex;gap:2.5mm;direction:ltr;flex:1">{cols}</div><div style="text-align:center;font-size:17pt;margin-top:4mm;line-height:1.8">نقرأ العدد: ثلاثة ملايين وأربعمئة واثنان وثمانون ألفًا ومئة وسبعة وخمسون<br>العدد = ٣٬٠٠٠٬٠٠٠ + ٤٠٠٬٠٠٠ + ٨٠٬٠٠٠ + ٢٬٠٠٠ + ١٠٠ + ٥٠ + ٧</div>'.replace('٣٬٠٠٠٬٠٠٠ + ٤٠٠٬٠٠٠ + ٨٠٬٠٠٠ + ٢٬٠٠٠ + ١٠٠ + ٥٠ + ٧', LRO(AD('3,000,000 + 400,000 + 80,000 + 2,000 + 100 + 50 + 7')))
    return sp, P(sp, 'القيمة المكانية', 'قيمة الرقم تعتمد على مكانه في العدد', body)

@spec('poster-en-parts-of-speech')
def _():
    sp = SP(title='Parts of Speech (أقسام الكلام)', desc='ملصق أقسام الكلام الستة في الإنجليزية بجملة ملوّنة تُظهر كل قسم، مع تعريف قصير لكل قسم بالعربية والإنجليزية.', levels=['g4', 'g5', 'g6'], subject='اللغة الإنجليزية', topic='Grammar', sort=44)
    T = [('Noun', 'اسم', 'person, place or thing', '#e53935'), ('Verb', 'فعل', 'an action word', '#43a047'), ('Adjective', 'صفة', 'describes a noun', '#fb8c00'), ('Adverb', 'ظرف', 'describes a verb', '#8e24aa'), ('Pronoun', 'ضمير', 'replaces a noun', '#039be5'), ('Preposition', 'حرف جر', 'shows place or time', '#00897b')]
    words = [('The happy', '#fb8c00'), ('girl', '#e53935'), ('quickly', '#8e24aa'), ('reads', '#43a047'), ('a book', '#e53935'), ('in', '#00897b'), ('the garden.', '#e53935')]
    sent = ''.join(f'<span style="color:{c}">{w}</span> ' for w, c in words)
    ex = f'<div style="text-align:center;direction:ltr;font-size:21pt;font-weight:700;background:#fff;border:.6mm dashed #cfc8ea;border-radius:5mm;padding:4mm 3mm;margin-bottom:3mm;line-height:1.5">{sent}<div style="font-size:12pt;font-weight:400;color:#4b4666;margin-top:1mm">She reads it too: <span style="color:#039be5;font-weight:700">She</span> = pronoun</div></div>'
    cells = ''.join(f'<div class="cell" style="border-color:{c};background:{c}14;gap:1mm"><div class="l" style="font-size:22pt;font-weight:700;color:{c}">{e}</div><div style="font-size:15pt;font-weight:700">{a}</div><div class="l" style="font-size:12pt;direction:ltr">{d}</div></div>' for e, a, d, c in T)
    return sp, P(sp, 'Parts of Speech', 'أقسام الكلام في الإنجليزية', ex + f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);flex:1;min-height:0;gap:3mm">{cells}</div>')

def tcss(extra=''): return '<style>.tb{width:100%;border-collapse:collapse;table-layout:fixed}.tb td,.tb th{border:.4mm solid #d8d2ee;text-align:center;padding:1.5mm 1mm;font-weight:700}.tb th{background:var(--c);color:#fff;font-size:13pt}' + extra + '</style>'
def TS(**k): k.setdefault('kind', 'table'); k.setdefault('orient', 'portrait'); k.setdefault('note', 'جدول أصلي من إعداد زاد؛ القيم محسوبة برمجيًا أو معلومات ثابتة. لم يُراجَع من جهة تعليمية رسمية.'); return k

@spec('tbl-squares-cubes')
def _():
    sp = TS(title='جدول المربّعات والمكعّبات', desc='جدول مربّع كل عدد ومكعّبه من ١ إلى ١٢، والقيم محسوبة برمجيًا، مع شرح معنى المربّع والمكعّب.', levels=['g5', 'g6'], subject='الرياضيات', topic='الأسس', sort=45)
    r = ''.join(f'<tr style="background:{PAL[(n - 1) % 8]}12"><td style="font-size:19pt;color:{PAL[(n - 1) % 8]}">{AD(n)}</td><td style="font-size:17pt">{LRO(AD(f"{n} × {n}"))}</td><td style="font-size:20pt">{AD(n * n)}</td><td style="font-size:17pt">{LRO(AD(f"{n} × {n} × {n}"))}</td><td style="font-size:20pt">{AD(n ** 3)}</td></tr>' for n in range(1, 13))
    body = f'{tcss()}<table class="tb" style="flex:1"><tr><th>العدد</th><th>المربّع (ضرب العدد في نفسه)</th><th>ناتجه</th><th>المكعّب (ثلاث مرات)</th><th>ناتجه</th></tr>{r}</table><div style="margin-top:3mm;font-size:12.5pt;line-height:1.7;text-align:center">المربّع: العدد × نفسه · المكعّب: العدد × نفسه × نفسه</div>'
    return sp, P(sp, 'المربّعات والمكعّبات', 'من ١ إلى ١٢', body)

@spec('tbl-equivalent-fractions')
def _():
    sp = TS(title='جدول الكسور المتكافئة', desc='جدول يعرض لكل كسر أبسط ثلاثة كسور مكافئة له بضرب البسط والمقام في ٢ و٣ و٤ و٥، محسوب برمجيًا.', levels=['g4', 'g5', 'g6'], subject='الرياضيات', topic='الكسور', sort=46)
    F = [(1, 2), (1, 3), (1, 4), (2, 3), (3, 4), (2, 5)]
    r = ''
    for i, (n, d) in enumerate(F):
        c = PAL[i % 8]
        r += f'<tr style="background:{c}12"><td>{frac(n, d, c, 22)}</td>' + ''.join(f'<td>{frac(n * k, d * k, "#333", 20)}</td>' for k in (2, 3, 4, 5)) + '</tr>'
    body = f'{tcss()}<table class="tb" style="flex:1"><tr><th>الكسر</th><th>× ٢</th><th>× ٣</th><th>× ٤</th><th>× ٥</th></tr>{r}</table><div style="margin-top:3mm;font-size:12.5pt;line-height:1.7;text-align:center">نضرب البسط والمقام في العدد نفسه فنحصل على كسر مكافئ، أي له القيمة نفسها</div>'
    return sp, P(sp, 'الكسور المتكافئة', 'القيمة واحدة والشكل مختلف', body)

@spec('tbl-time-units')
def _():
    sp = TS(title='جدول وحدات الزمن', desc='جدول التحويل بين وحدات الزمن: الثانية والدقيقة والساعة واليوم والأسبوع والشهر والسنة والعقد والقرن.', levels=['g3', 'g4', 'g5'], subject='الرياضيات', topic='القياس', sort=47, note='السنة العادية ٣٦٥ يومًا والكبيسة ٣٦٦. ' + 'جدول أصلي من إعداد زاد؛ معلومات ثابتة. لم يُراجَع من جهة تعليمية رسمية.')
    D = [('١ دقيقة', '٦٠ ثانية'), ('١ ساعة', '٦٠ دقيقة'), ('١ يوم', '٢٤ ساعة'), ('١ أسبوع', '٧ أيام'), ('١ شهر', '٢٨ إلى ٣١ يومًا'), ('١ سنة', '١٢ شهرًا'), ('١ سنة عادية', '٣٦٥ يومًا'), ('١ سنة كبيسة', '٣٦٦ يومًا'), ('١ عقد', '١٠ سنوات'), ('١ قرن', '١٠٠ سنة')]
    r = ''.join(f'<tr style="background:{PAL[i % 8]}12"><td style="font-size:20pt;color:{PAL[i % 8]}">{a}</td><td style="font-size:18pt;color:#999">=</td><td style="font-size:20pt">{b}</td></tr>' for i, (a, b) in enumerate(D))
    body = f'{tcss()}<table class="tb" style="flex:1"><tr><th>الوحدة</th><th></th><th>تساوي</th></tr>{r}</table>'
    return sp, P(sp, 'وحدات الزمن', 'نحوّل بين الثواني والدقائق والساعات والأيام', body)
