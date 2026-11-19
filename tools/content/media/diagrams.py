# -*- coding: utf-8 -*-
import math
from common import *
NOTE = 'رسم توضيحي أصلي من إعداد زاد (رسم برمجي)، بلا نسب إلى كتاب أو منهج محدد، ولم يُراجَع من جهة تعليمية رسمية.'
def SP(**k): k.setdefault('kind', 'diagram'); k.setdefault('note', NOTE); return k
def P(sp, t, s, body): return [page(sp, t, s, body)]
def T(x, y, t, size=26, fill='#1b1430', w=700, anchor='middle'):
    return f'<text x="{x}" y="{y}" font-size="{size}" font-weight="{w}" fill="{fill}" text-anchor="{anchor}" dominant-baseline="central" font-family="C,sans-serif">{E(t)}</text>'

@spec('dg-plant-parts')
def _():
    sp = SP(title='أجزاء النبتة', desc='رسم توضيحي لنبتة كاملة بتسمية أجزائها: الجذور والساق والأوراق والزهرة والتربة.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='النبات', orient='portrait', sort=1)
    pet = ''.join(f'<ellipse cx="300" cy="150" rx="26" ry="46" fill="#ec407a" transform="rotate({a} 300 200)"/>' for a in range(0, 360, 45))
    svg = f'''<svg viewBox="0 0 900 780" style="width:100%;height:100%" font-family="C,sans-serif">
<rect x="0" y="560" width="900" height="220" fill="#8d6e63" opacity=".25"/><ellipse cx="450" cy="560" rx="360" ry="22" fill="#6d4c41" opacity=".45"/>
<g stroke="#8d5a3b" stroke-width="9" fill="none" stroke-linecap="round"><path d="M450,565 C450,640 440,700 430,745"/><path d="M450,575 C410,620 360,650 330,700"/><path d="M450,575 C490,620 540,650 575,700"/><path d="M445,610 C400,640 380,690 365,730"/><path d="M452,610 C500,650 520,690 530,735"/></g>
<path d="M450,565 C446,450 454,330 450,230" stroke="#43a047" stroke-width="22" fill="none" stroke-linecap="round"/>
<path d="M450,470 C380,470 320,430 300,360 C380,360 440,400 450,470 Z" fill="#66bb6a" stroke="#2e7d32" stroke-width="4"/>
<path d="M452,400 C520,400 590,360 610,290 C530,290 462,330 452,400 Z" fill="#66bb6a" stroke="#2e7d32" stroke-width="4"/>
<g transform="translate(150,0)">{pet}</g><circle cx="450" cy="200" r="34" fill="#fdd835" stroke="#f9a825" stroke-width="4"/>
{"".join(f'<path d="M{x},{y} L{450 + (x - 450) * .62:.0f},{y + (200 - y) * .0:.0f}" stroke="none"/>' for x, y in [])}
<g font-size="34" font-weight="700">
<path d="M495,185 L700,120" stroke="#ec407a" stroke-width="4"/><circle cx="495" cy="185" r="7" fill="#ec407a"/><rect x="690" y="92" width="190" height="54" rx="27" fill="#ec407a"/>{T(785, 120, 'الزهرة', 32, '#fff')}
<path d="M585,305 L700,300" stroke="#43a047" stroke-width="4"/><circle cx="585" cy="305" r="7" fill="#43a047"/><rect x="690" y="273" width="190" height="54" rx="27" fill="#43a047"/>{T(785, 300, 'الأوراق', 32, '#fff')}
<path d="M452,430 L700,470" stroke="#2e7d32" stroke-width="4"/><circle cx="452" cy="430" r="7" fill="#2e7d32"/><rect x="690" y="443" width="190" height="54" rx="27" fill="#2e7d32"/>{T(785, 470, 'الساق', 32, '#fff')}
<path d="M200,560 L260,520" stroke="#6d4c41" stroke-width="4"/><circle cx="260" cy="520" r="0" fill="#6d4c41"/><rect x="20" y="533" width="190" height="54" rx="27" fill="#6d4c41"/>{T(115, 560, 'التربة', 32, '#fff')}
<path d="M360,690 L210,690" stroke="#8d5a3b" stroke-width="4"/><circle cx="360" cy="690" r="7" fill="#8d5a3b"/><rect x="20" y="663" width="190" height="54" rx="27" fill="#8d5a3b"/>{T(115, 690, 'الجذور', 32, '#fff')}
</g></svg>'''
    body = f'<div style="flex:1;min-height:0">{svg}</div><div style="display:flex;gap:3mm;font-size:11.5pt;text-align:center;margin-top:2mm"><div style="flex:1;background:var(--t);border-radius:4mm;padding:2mm">الجذور: تثبّت النبتة وتمتصّ الماء</div><div style="flex:1;background:var(--t);border-radius:4mm;padding:2mm">الساق: تحمل النبتة وتنقل الماء</div><div style="flex:1;background:var(--t);border-radius:4mm;padding:2mm">الأوراق: تصنع الغذاء بالضوء</div></div>'
    return sp, P(sp, 'أجزاء النبتة', 'نتعرّف على أجزاء النبتة ووظيفة كل جزء', body)

def pie(n, k, r=90, col='#e53935'):
    cx = cy = r + 6
    out = f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="#fff" stroke="#1b1430" stroke-width="4"/>'
    for i in range(n):
        a0 = -math.pi / 2 + 2 * math.pi * i / n; a1 = -math.pi / 2 + 2 * math.pi * (i + 1) / n
        x0, y0, x1, y1 = cx + r * math.cos(a0), cy + r * math.sin(a0), cx + r * math.cos(a1), cy + r * math.sin(a1)
        d = f'M{cx},{cy} L{x0:.1f},{y0:.1f} A{r},{r} 0 0 1 {x1:.1f},{y1:.1f} Z'
        out += f'<path d="{d}" fill="{col if i < k else "#fff"}" stroke="#1b1430" stroke-width="3"/>'
    return f'<svg viewBox="0 0 {2 * r + 12} {2 * r + 12}" style="width:46mm;height:46mm">{out}</svg>'

@spec('dg-fractions')
def _():
    sp = SP(title='الكسور: النصف والثلث والربع', desc='رسم توضيحي للكسور البسيطة بأشكال دائرية مقسّمة، مع شرح البسط والمقام.', levels=['g3', 'g4'], subject='الرياضيات', topic='الكسور', orient='landscape', sort=2)
    items = [(1, 2, 'النصف', '#e53935'), (1, 3, 'الثلث', '#fb8c00'), (1, 4, 'الربع', '#43a047'), (3, 4, 'ثلاثة أرباع', '#1e88e5')]
    cells = ''
    for a, b, n, c in items:
        fr = f'<div style="display:inline-flex;flex-direction:column;align-items:center;font-size:26pt;font-weight:700;line-height:1.1;color:{c}"><span>{AD(a)}</span><span style="width:12mm;border-top:.9mm solid {c}"></span><span>{AD(b)}</span></div>'
        cells += f'<div class="cell" style="border-color:{c};background:{c}10;gap:2mm">{pie(b, a, 90, c)}{fr}<div style="font-size:17pt;font-weight:700;color:{c}">{n}</div></div>'
    note = '<div style="display:flex;gap:4mm;margin-top:3mm"><div style="flex:1;background:var(--t);border-radius:4mm;padding:2.5mm 5mm;font-size:13pt;text-align:center"><b>البسط</b> (العدد العلوي): عدد الأجزاء المظلّلة</div><div style="flex:1;background:var(--t);border-radius:4mm;padding:2.5mm 5mm;font-size:13pt;text-align:center"><b>المقام</b> (العدد السفلي): عدد الأجزاء المتساوية الكلّي</div></div>'
    return sp, P(sp, 'الكسور: النصف والثلث والربع', 'الشكل يُقسَم إلى أجزاء متساوية', f'<div class="grid" style="grid-template-columns:repeat(4,1fr);flex:1;min-height:0">{cells}</div>{note}')

def clock(h, m, s=170, col='#6a2bd9'):
    cx = cy = 100
    o = f'<circle cx="100" cy="100" r="94" fill="#fff" stroke="{col}" stroke-width="7"/>'
    for i in range(60):
        a = math.radians(i * 6); r1 = 86 if i % 5 else 80
        o += f'<line x1="{cx + 90 * math.sin(a):.1f}" y1="{cy - 90 * math.cos(a):.1f}" x2="{cx + r1 * math.sin(a):.1f}" y2="{cy - r1 * math.cos(a):.1f}" stroke="#1b1430" stroke-width="{2.5 if i % 5 == 0 else 1}"/>'
    for n in range(1, 13):
        a = math.radians(n * 30); o += f'<text x="{cx + 67 * math.sin(a):.1f}" y="{cy - 67 * math.cos(a):.1f}" font-size="19" font-weight="700" text-anchor="middle" dominant-baseline="central" font-family="C,sans-serif" fill="#1b1430">{n}</text>'
    ha = math.radians((h % 12) * 30 + m * .5); ma = math.radians(m * 6)
    o += f'<line x1="100" y1="100" x2="{cx + 45 * math.sin(ha):.1f}" y2="{cy - 45 * math.cos(ha):.1f}" stroke="#e53935" stroke-width="8" stroke-linecap="round"/><line x1="100" y1="100" x2="{cx + 68 * math.sin(ma):.1f}" y2="{cy - 68 * math.cos(ma):.1f}" stroke="#1e88e5" stroke-width="5" stroke-linecap="round"/><circle cx="100" cy="100" r="6" fill="#1b1430"/>'
    return f'<svg viewBox="0 0 200 200" style="width:{s}px;height:{s}px">{o}</svg>'

@spec('dg-clock')
def _():
    sp = SP(title='قراءة الساعة', desc='رسم توضيحي لقراءة الساعة العادية: العقرب القصير للساعات والطويل للدقائق، مع أربعة أمثلة محلولة.', levels=['a6', 'g1', 'g2'], subject='الرياضيات', topic='الزمن', orient='landscape', sort=3)
    ex = [(3, 0, 'الثالثة تمامًا', '٣:٠٠'), (6, 30, 'السادسة والنصف', '٦:٣٠'), (9, 15, 'التاسعة والربع', '٩:١٥'), (12, 45, 'الواحدة إلا ربعًا', '١٢:٤٥')]
    big = f'<div style="flex:none;width:90mm;display:flex;flex-direction:column;align-items:center;gap:2mm">{clock(10, 10, 300)}<div style="display:flex;gap:4mm;font-size:13pt;font-weight:700"><span style="color:#e53935">● العقرب القصير: الساعات</span><span style="color:#1e88e5">● العقرب الطويل: الدقائق</span></div><div style="font-size:11.5pt;text-align:center;line-height:1.6">العقرب الطويل على ١٢ = الساعة تمامًا · على ٦ = النصف · على ٣ = الربع</div></div>'
    cells = ''.join(f'<div class="cell" style="gap:1mm">{clock(h, m, 150)}<div style="font-size:15pt;font-weight:700;color:var(--c)">{a}</div><div class="l" style="font-size:15pt;font-weight:700">{d}</div></div>' for h, m, a, d in ex)
    return sp, P(sp, 'قراءة الساعة', 'العقرب القصير للساعات والطويل للدقائق', f'<div style="display:flex;gap:6mm;flex:1;min-height:0">{big}<div class="grid" style="grid-template-columns:1fr 1fr;flex:1">{cells}</div></div>')

@spec('dg-number-line')
def _():
    sp = SP(title='خط الأعداد: الجمع والطرح', desc='رسم توضيحي لخط الأعداد من ٠ إلى ٢٠ مع مثالين محلولين بالقفزات: ٧ + ٥ = ١٢ و ١٥ − ٦ = ٩.', levels=['g1', 'g2'], subject='الرياضيات', topic='الجمع والطرح', orient='landscape', sort=4)
    X0, STEP = 70, 58
    px = lambda n: X0 + n * STEP
    def line(y, arcs, title, c):
        o = f'<line x1="{px(0) - 20}" y1="{y}" x2="{px(20) + 20}" y2="{y}" stroke="#1b1430" stroke-width="5"/>'
        for n in range(21):
            o += f'<line x1="{px(n)}" y1="{y - 12}" x2="{px(n)}" y2="{y + 12}" stroke="#1b1430" stroke-width="4"/>' + T(px(n), y + 34, str(n), 24)
        for a, b, lab in arcs:
            mx = (px(a) + px(b)) / 2; rr = abs(px(b) - px(a)) / 2
            o += f'<path d="M{px(a)},{y - 8} A{rr},{rr * .8} 0 0 {1 if b > a else 0} {px(b)},{y - 8}" fill="none" stroke="{c}" stroke-width="6"/>' + T(mx, y - rr * .8 - 22, lab, 26, c)
        return o
    A = [(7, 8, '+١'), (8, 9, '+١'), (9, 10, '+١'), (10, 11, '+١'), (11, 12, '+١')]
    B = [(15, 14, '−١'), (14, 13, '−١'), (13, 12, '−١'), (12, 11, '−١'), (11, 10, '−١'), (10, 9, '−١')]
    svg = f'<svg viewBox="0 0 1330 660" style="width:100%;height:100%" font-family="C,sans-serif">{T(665, 40, "\u202d٧ + ٥ = ١٢\u202c  نبدأ من ٧ ونقفز ٥ قفزات إلى اليمين", 32, "#1e88e5")}{line(210, A, "", "#1e88e5")}{T(665, 380, "\u202d١٥ − ٦ = ٩\u202c  نبدأ من ١٥ ونقفز ٦ قفزات إلى اليسار", 32, "#e53935")}{line(560, B, "", "#e53935")}</svg>'
    return sp, P(sp, 'خط الأعداد: الجمع والطرح', 'الجمع قفز إلى الأمام والطرح قفز إلى الخلف', f'<div style="flex:1;min-height:0;direction:ltr">{svg}</div>')

@spec('dg-solids-3d')
def _():
    sp = SP(title='المجسّمات الهندسية', desc='رسم توضيحي لأربعة مجسّمات: المكعب والكرة والأسطوانة والمخروط، مع عدد الأوجه والحروف والرؤوس لكل منها.', levels=['g2', 'g3', 'g4'], subject='الرياضيات', topic='الهندسة', orient='landscape', sort=5, note='الأوجه والحروف (الأحرف) والرؤوس: معلومات هندسية ثابتة. ' + NOTE)
    cube = '<svg viewBox="0 0 200 200" style="width:100%;height:46mm"><polygon points="40,70 120,70 120,150 40,150" fill="#ef9a9a" stroke="#1b1430" stroke-width="3"/><polygon points="40,70 80,35 160,35 120,70" fill="#ffcdd2" stroke="#1b1430" stroke-width="3"/><polygon points="120,70 160,35 160,115 120,150" fill="#e57373" stroke="#1b1430" stroke-width="3"/></svg>'
    sph = '<svg viewBox="0 0 200 200" style="width:100%;height:46mm"><defs><radialGradient id="g1" cx="35%" cy="30%"><stop offset="0" stop-color="#e1f5fe"/><stop offset="1" stop-color="#039be5"/></radialGradient></defs><circle cx="100" cy="100" r="68" fill="url(#g1)" stroke="#1b1430" stroke-width="3"/></svg>'
    cyl = '<svg viewBox="0 0 200 200" style="width:100%;height:46mm"><path d="M45,55 L45,145 A55,20 0 0 0 155,145 L155,55" fill="#a5d6a7" stroke="#1b1430" stroke-width="3"/><ellipse cx="100" cy="55" rx="55" ry="20" fill="#c8e6c9" stroke="#1b1430" stroke-width="3"/></svg>'
    con = '<svg viewBox="0 0 200 200" style="width:100%;height:46mm"><path d="M100,25 L45,145 A55,20 0 0 0 155,145 Z" fill="#ffcc80" stroke="#1b1430" stroke-width="3"/></svg>'
    data = [('المكعب', cube, '٦ أوجه مستوية · ١٢ حرفًا · ٨ رؤوس', '#e53935'), ('الكرة', sph, 'سطح منحنٍ واحد · بلا حروف ولا رؤوس', '#039be5'), ('الأسطوانة', cyl, 'وجهان دائريان مستويان وسطح منحنٍ · لا رؤوس', '#43a047'), ('المخروط', con, 'قاعدة دائرية واحدة وسطح منحنٍ · رأس واحد', '#fb8c00')]
    cells = ''.join(f'<div class="cell" style="border-color:{c};background:{c}10;gap:2mm">{s}<div style="font-size:19pt;font-weight:700;color:{c}">{n}</div><div style="font-size:11.5pt;line-height:1.6">{d}</div></div>' for n, s, d, c in data)
    return sp, P(sp, 'المجسّمات الهندسية', 'أشكال لها ثلاثة أبعاد', f'<div class="grid" style="grid-template-columns:repeat(4,1fr);flex:1;min-height:0">{cells}</div>')
