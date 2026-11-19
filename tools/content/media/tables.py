# -*- coding: utf-8 -*-
from common import *
NOTE = 'جدول أصلي من إعداد زاد؛ القيم محسوبة برمجيًا أو معلومات ثابتة. لم يُراجَع من جهة تعليمية رسمية.'
def SP(**k): k.setdefault('kind', 'table'); k.setdefault('orient', 'portrait'); k.setdefault('note', NOTE); return k
def P(sp, t, s, body): return [page(sp, t, s, body)]

@spec('tbl-multiplication')
def _():
    sp = SP(title='جدول الضرب من ١ إلى ١٠', desc='جدول ضرب كامل بالأعداد من ١ إلى ١٠، ألوان الصفوف مختلفة، والنواتج محسوبة برمجيًا.', levels=['g2', 'g3', 'g4'], subject='الرياضيات', topic='الضرب', sort=1)
    H = '<div style="background:var(--c);color:#fff;font-size:15pt;font-weight:700">×</div>' + ''.join(f'<div style="background:{PAL[(j - 1) % 8]};color:#fff">{AD(j)}</div>' for j in range(1, 11))
    R = ''
    for i in range(1, 11):
        c = PAL[(i - 1) % 8]
        R += f'<div style="background:{c};color:#fff">{AD(i)}</div>' + ''.join(f'<div style="background:{c}{"30" if i == j else "10"};{"font-weight:700;" if i == j else ""}">{AD(i * j)}</div>' for j in range(1, 11))
    css = '<style>.mg{display:grid;grid-template-columns:repeat(11,1fr);grid-template-rows:11mm repeat(10,1fr);gap:.8mm;height:100%;direction:ltr}.mg>div{display:grid;place-items:center;font-size:14pt;font-weight:700;border-radius:1.5mm}</style>'
    return sp, P(sp, 'جدول الضرب من ١ إلى ١٠', 'حاصل ضرب العدد في الصف × العدد في العمود', f'{css}<div style="flex:1;min-height:0"><div class="mg">{H}{R}</div></div><div style="text-align:center;font-size:11.5pt;margin-top:2mm;color:#4b4666">الخلايا الأغمق قليلًا هي مربّعات الأعداد: ١×١ ، ٢×٢ ، ٣×٣ …</div>')

@spec('tbl-hundred-chart')
def _():
    sp = SP(title='لوحة الأعداد من ١ إلى ١٠٠', desc='لوحة الأعداد من ١ إلى ١٠٠ في عشرة صفوف، لكل عشرة لون، تساعد على العد بالعشرات وفهم ترتيب الأعداد.', levels=['a6', 'g1', 'g2'], subject='الرياضيات', topic='الأعداد', sort=2)
    rows = ''
    for r in range(10):
        c = PAL[r % 8]
        rows += '<tr>' + ''.join(f'<td style="background:{c}{"30" if k == 9 else "14"};color:{c if k != 9 else "#1b1430"};">{AD(r * 10 + k + 1)}</td>' for k in range(10)) + '</tr>'
    css = '<style>.hc td{border:.5mm solid #fff;text-align:center;font-size:19pt;font-weight:700;padding:0} .hc{width:100%;height:100%;table-layout:fixed;direction:ltr}</style>'
    return sp, P(sp, 'لوحة الأعداد من ١ إلى ١٠٠', 'نعدّ بالآحاد والعشرات', f'{css}<div style="flex:1;min-height:0"><table class="hc">{rows}</table></div><div style="text-align:center;font-size:11.5pt;margin-top:2mm;color:#4b4666">آخر عدد في كل صف هو عدد صحيح من العشرات: ١٠ ، ٢٠ ، ٣٠ …</div>')

@spec('tbl-letter-forms')
def _():
    sp = SP(title='أشكال الحروف العربية', desc='جدول الحروف الثمانية والعشرين بأشكالها: منفصل وأول الكلمة ووسطها وآخرها، وتظهر الحروف التي لا تتصل بما بعدها.', levels=['g1', 'g2'], subject='اللغة العربية', topic='الكتابة', sort=3, note='الحروف الستة (ا د ذ ر ز و) لا تتصل بما بعدها فليس لها شكل أول ولا وسط. ' + NOTE)
    L = [('أ', 'ألف', 0), ('ب', 'باء', 1), ('ت', 'تاء', 1), ('ث', 'ثاء', 1), ('ج', 'جيم', 1), ('ح', 'حاء', 1), ('خ', 'خاء', 1), ('د', 'دال', 0), ('ذ', 'ذال', 0), ('ر', 'راء', 0), ('ز', 'زاي', 0), ('س', 'سين', 1), ('ش', 'شين', 1), ('ص', 'صاد', 1), ('ض', 'ضاد', 1), ('ط', 'طاء', 1), ('ظ', 'ظاء', 1), ('ع', 'عين', 1), ('غ', 'غين', 1), ('ف', 'فاء', 1), ('ق', 'قاف', 1), ('ك', 'كاف', 1), ('ل', 'لام', 1), ('م', 'ميم', 1), ('ن', 'نون', 1), ('هـ', 'هاء', 1), ('و', 'واو', 0), ('ي', 'ياء', 1)]
    def tab(items):
        r = '<tr><th>الحرف</th><th>منفصل</th><th>أول</th><th>وسط</th><th>آخر</th></tr>'
        for k, (ch, nm, con) in enumerate(items):
            base = 'ه' if ch == 'هـ' else ch; c = PAL[k % 8]
            z = '‍'
            ini = base + z if con else '—'; mid = z + base + z if con else '—'; fin = z + base
            r += f'<tr><td style="font-size:11pt;color:#4b4666">{nm}</td><td style="color:{c}">{base}</td><td style="color:{c}">{ini}</td><td style="color:{c}">{mid}</td><td style="color:{c}">{fin}</td></tr>'
        return f'<table class="lf">{r}</table>'
    css = '<style>.lf{width:100%;height:100%;table-layout:fixed;border-collapse:collapse}.lf td,.lf th{border:.35mm solid #d8d2ee;text-align:center;font-size:21pt;font-weight:700;padding:0}.lf th{background:var(--c);color:#fff;font-size:11pt;height:7mm}.lf tr:nth-child(even) td{background:#f6f2ff}</style>'
    body = f'{css}<div style="display:flex;gap:5mm;flex:1;min-height:0"><div style="flex:1">{tab(L[:14])}</div><div style="flex:1">{tab(L[14:])}</div></div>'
    return sp, P(sp, 'أشكال الحروف العربية', 'كيف يتغيّر شكل الحرف في الكلمة؟', body)

@spec('tbl-measure-units')
def _():
    sp = SP(title='جدول وحدات القياس', desc='جدول لتحويل وحدات القياس الشائعة: الطول والكتلة والسعة والزمن.', levels=['g2', 'g3', 'g4'], subject='الرياضيات', topic='القياس', sort=4)
    T = [('الطول', '#e53935', [('١ سنتيمتر (سم)', '١٠ مليمترات (ملم)'), ('١ متر (م)', '١٠٠ سنتيمتر'), ('١ كيلومتر (كم)', '١٠٠٠ متر')]),
         ('الكتلة', '#fb8c00', [('١ كيلوجرام (كجم)', '١٠٠٠ جرام (جم)')]),
         ('السعة', '#43a047', [('١ لتر (ل)', '١٠٠٠ مليلتر (مل)')]),
         ('الزمن', '#1e88e5', [('١ دقيقة', '٦٠ ثانية'), ('١ ساعة', '٦٠ دقيقة'), ('١ يوم', '٢٤ ساعة'), ('١ أسبوع', '٧ أيام'), ('١ سنة', '١٢ شهرًا')])]
    out = ''
    for t, c, rows in T:
        r = ''.join(f'<tr><td>{a}</td><td style="font-weight:700;color:{c}">=</td><td>{b}</td></tr>' for a, b in rows)
        out += f'<div style="flex:{len(rows) + 1.4};display:flex;flex-direction:column;border:.6mm solid {c};border-radius:5mm;overflow:hidden"><div style="background:{c};color:#fff;font-size:17pt;font-weight:700;padding:1.5mm 6mm">{t}</div><table class="mu">{r}</table></div>'
    css = '<style>.mu{width:100%;flex:1;border-collapse:collapse}.mu td{text-align:center;font-size:15pt;font-weight:700;padding:1mm;border-top:.3mm dashed #cfc8ea}.mu tr:first-child td{border-top:0}</style>'
    return sp, P(sp, 'جدول وحدات القياس', 'الطول · الكتلة · السعة · الزمن', f'{css}<div style="display:flex;flex-direction:column;gap:3.5mm;flex:1;min-height:0">{out}</div>')
