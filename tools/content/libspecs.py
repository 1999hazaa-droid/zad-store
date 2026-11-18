# -*- coding: utf-8 -*-
import random
from fractions import Fraction as F
from decimal import Decimal as D
from libgen import *
Kf = K

def ans_f(f): f=F(f); return mixed(f) if f>1 and f.denominator!=1 else fr(f)
def lines(n, h=11): return ''.join(f'<div style="border-bottom:.3mm solid #b8b0d6;height:{h}mm"></div>' for _ in range(n))
def spec(**k): return k
def fx(f): return fr(f)

# ---------- 1) الصف الخامس: جمع الكسور وطرحها ----------
def g5_fractions():
    r = random.Random(501); P = []; KK = []
    # A) مقام واحد: جمع
    A, ka = [], []
    from math import gcd
    for d in [5, 6, 7, 8, 9, 10, 8, 12, 9, 11]:
        while True:
            a = r.randint(1, d - 1); b = r.randint(1, d - 1)
            if gcd(a, d) == 1 and gcd(b, d) == 1: break
        A.append(pair(fr_raw(a, d), '+', fr_raw(b, d))); ka.append(F(a, d) + F(b, d))
    P.append(('أجمع الكسور التي لها المقام نفسه', 'نجمع البسطين ونُبقي المقام كما هو، ثم نكتب الناتج في أبسط صورة (كسرًا أو عددًا كسريًا).', grid(A, 'tall'), 'ws'))
    KK.append(('الصفحة 2: الجمع', ka))
    # B) مقام واحد: طرح
    B, kb = [], []
    for d in [5, 7, 8, 9, 10, 12, 6, 11, 9, 8]:
        while True:
            a = r.randint(3, d - 1); b = r.randint(1, a - 1)
            if gcd(a, d) == 1 and gcd(b, d) == 1: break
        B.append(pair(fr_raw(a, d), '−', fr_raw(b, d))); kb.append(F(a, d) - F(b, d))
    P.append(('أطرح الكسور التي لها المقام نفسه', 'نطرح البسطين ونُبقي المقام كما هو، ثم نبسّط الناتج إن أمكن.', grid(B, 'tall'), 'ws'))
    KK.append(('الصفحة 3: الطرح', kb))
    # C) مقامان مختلفان (أحدهما مضاعف للآخر)
    C, kc = [], []
    pairs = [(F(1, 2), F(1, 4), '+'), (F(1, 3), F(1, 6), '+'), (F(3, 4), F(1, 8), '−'), (F(2, 5), F(3, 10), '+'), (F(5, 6), F(1, 3), '−'), (F(1, 2), F(1, 6), '+'), (F(7, 8), F(1, 4), '−'), (F(2, 3), F(1, 9), '+')]
    for a, b, op in pairs:
        C.append(pair(fr(a), op, fr(b))); kc.append(a + b if op == '+' else a - b)
    P.append(('أجمع وأطرح كسورًا مقاماتها مختلفة', 'وحّد المقامين أولًا بتحويل أحد الكسرين إلى كسر مكافئ، ثم احسب. اكتب الناتج في أبسط صورة.', grid(C, 'tall'), 'ws'))
    KK.append(('الصفحة 4: مقامات مختلفة', kc))
    # D) مقارنة + مسائل
    cmp_ = [(F(3, 8), F(5, 8)), (F(2, 3), F(3, 4)), (F(4, 5), F(8, 10)), (F(5, 6), F(3, 4)), (F(1, 2), F(3, 7)), (F(7, 10), F(2, 3))]
    Dg = ''.join(Q(i + 1, ltr(f'{fr(a)}<span class="opt" style="min-width:9mm;height:9mm"></span>{fr(b)}')) for i, (a, b) in enumerate(cmp_))
    kd = ['>' if a > b else '<' if a < b else '=' for a, b in cmp_]
    wp = [('شرب سالمٌ <b>2/7</b> من زجاجة عصير صباحًا و<b>3/7</b> منها مساءً. ما الكسر الذي شربه من الزجاجة في اليوم كله؟', F(2, 7) + F(3, 7)),
          ('كان في الوعاء <b>7/9</b> لتر ماء، واستُعمل منه <b>4/9</b> لتر. كم لترًا بقي في الوعاء؟', F(7, 9) - F(4, 9)),
          ('قطع أحمدُ <b>1/2</b> كيلومتر مشيًا ثم <b>1/4</b> كيلومتر ركضًا. كم كيلومترًا قطع في المجموع؟', F(1, 2) + F(1, 4))]
    body = f'<p class="ins" style="margin:0 0 2mm"><b>أ)</b> ضع العلامة المناسبة ( &lt; أو &gt; أو = ) داخل المربع:</p><div class="grid">{Dg}</div><p class="ins" style="margin:5mm 0 2mm"><b>ب)</b> حلّ المسائل الآتية واكتب الجملة الحسابية والناتج:</p>' + ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>{t}<div class="ans" style="min-width:60mm;margin-top:1mm"></div></div>' for i, (t, _) in enumerate(wp))
    P.append(('أقارن الكسور وأحلّ مسائل', 'اختر العلامة المناسبة، ثم حلّ المسائل في المساحة المخصصة.', body, 'ws'))
    KK.append(('الصفحة 5: المقارنة', kd)); KK.append(('الصفحة 5: المسائل', [x for _, x in wp]))
    ans = ''
    for h, v in KK:
        if v and isinstance(v[0], str): ans += Kf(h, [ltr(x.replace('<', '&lt;').replace('>', '&gt;')) for x in v])
        else: ans += Kf(h, [ltr(ans_f(x)) for x in v])
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر. الناتج المكتوب في أبسط صورة (والعدد الكسري إن كان الكسر أكبر من 1).', ans, 'key'))
    return spec(slug='g5-fractions-add-subtract', title='جمع الكسور وطرحها', subtitle='مقامات متشابهة ومختلفة، ومقارنة، ومسائل', chips=['الصف الخامس', 'الرياضيات', 'الكسور', 'مع الحلول'], color='#2563eb', tint='#e4edff', note='اطبع الصفحات واحلّ في المساحات المخصصة، ثم راجع الحلول في الصفحة الأخيرة.'), P

# ---------- 2) الصف الخامس: الأعداد العشرية ----------
def g5_decimals():
    r = random.Random(502); P = []; keys = []
    names = {'o': 'آحاد', 't': 'أجزاء من عشرة', 'h': 'أجزاء من مئة'}
    A = []; ka = []
    nums = ['7.45', '3.08', '12.64', '0.52', '4.97', '9.30', '6.14', '2.75']
    pos = ['t', 'h', 't', 'h', 'o', 'h', 't', 'o']  # أي رقم نسأل عنه
    idx = {'o': 0, 't': 1, 'h': 2}
    for n, p in zip(nums, pos):
        ip, fp = (n.split('.') + [''])[:2]
        digs = {'o': ip[-1], 't': fp[0], 'h': fp[1]}
        d = digs[p]
        shown = {'o': f'{ip[:-1]}<mark>{ip[-1]}</mark>.{fp}', 't': f'{ip}.<mark>{fp[0]}</mark>{fp[1:]}', 'h': f'{ip}.{fp[0]}<mark>{fp[1]}</mark>'}[p]
        A.append(f'<div style="font-size:13pt">ما منزلة الرقم الملوّن في العدد <span class="ln">{shown}</span>؟<br><span class="opt">آحاد</span><span class="opt">أجزاء من عشرة</span><span class="opt">أجزاء من مئة</span></div>')
        ka.append(names[p])
    P.append(('منزلة الأرقام في العدد العشري', 'انظر إلى الرقم الملوّن واختر منزلته بوضع دائرة حول الإجابة الصحيحة.', grid(A, 'tall').replace('<mark>', '<mark style="background:#fde68a;border-radius:1mm">'), 'ws'))
    # ب مقارنة
    pairs = [('0.5', '0.05'), ('3.4', '3.40'), ('2.35', '2.53'), ('0.7', '0.69'), ('5.08', '5.8'), ('1.2', '1.02'), ('4.50', '4.5'), ('0.99', '1.0')]
    Bq = [ltr(f'{a}<span class="opt" style="min-width:9mm;height:9mm"></span>{b}') for a, b in pairs]
    kb = ['>' if D(a) > D(b) else '<' if D(a) < D(b) else '=' for a, b in pairs]
    P.append(('أقارن الأعداد العشرية', 'قارن الأعداد بدءًا من الآحاد ثم الأجزاء من عشرة ثم الأجزاء من مئة، وضع ( &lt; أو &gt; أو = ).', grid(Bq, 'tall'), 'ws'))
    # ج جمع وطرح عمودي
    ops = [('3.45', '+', '2.30'), ('12.60', '+', '4.75'), ('0.85', '+', '0.40'), ('8.50', '−', '3.25'), ('10.00', '−', '4.65'), ('6.72', '−', '1.9')]
    def vert(a, op, b):
        w = max(len(a), len(b)) + 2
        return f'<table dir="ltr" style="width:42mm;border:0"><tr><td style="border:0;text-align:right;font-size:15pt">{a}</td></tr><tr><td style="border:0;border-bottom:.5mm solid #1b1430;text-align:right;font-size:15pt">{op} {b}</td></tr><tr><td style="border:0;height:9mm"></td></tr></table>'
    kc = []
    for a, op, b in ops: kc.append(str(D(a) + D(b) if op == '+' else D(a) - D(b)))
    P.append(('أجمع وأطرح الأعداد العشرية', 'اكتب الفاصلة العشرية تحت الفاصلة وضع الأرقام في أعمدتها، ثم احسب.', grid([vert(*o) for o in ops], 'tall'), 'ws'))
    # د مسائل
    wp = [('اشترت منى قلمًا بسعر <b>0.75</b> ريال ودفترًا بسعر <b>1.25</b> ريال. كم دفعت؟', '+', '0.75', '1.25'),
          ('كان مع سعيدٍ <b>5.50</b> ريال، واشترى عصيرًا بـ<b>1.35</b> ريال. كم بقي معه؟', '−', '5.50', '1.35'),
          ('قطعت ليلى حبلًا طوله <b>2.4</b> متر، ثم قطعت حبلًا آخر طوله <b>1.85</b> متر. كم طول الحبلين معًا؟', '+', '2.4', '1.85'),
          ('وزن كيس الأرز <b>3.25</b> كيلوغرام، ووزن كيس السكر <b>1.5</b> كيلوغرام. بكم كيلوغرام يزيد كيس الأرز عن السكر؟', '−', '3.25', '1.5')]
    kd = [str(D(a) + D(b) if op == '+' else D(a) - D(b)) for _, op, a, b in wp]
    body = ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>{t}<div class="ans" style="min-width:70mm;margin-top:1mm"></div></div>' for i, (t, *_ ) in enumerate(wp))
    P.append(('مسائل على الأعداد العشرية', 'اقرأ المسألة، واكتب الجملة الحسابية، ثم الناتج مع الوحدة.', body, 'ws'))
    units = ['ريال', 'ريال', 'متر', 'كيلوغرام']
    esc = lambda x: x.replace('<', '&lt;').replace('>', '&gt;')
    ans = K('منزلة الرقم الملوّن', ka) + K('المقارنة', [ltr(esc(x)) for x in kb]) + K('الجمع والطرح', [ltr(x) for x in kc]) + K('المسائل', [f'{ltr(x)}&nbsp;{u}' for x, u in zip(kd, units)])
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', ans, 'key'))
    return spec(slug='g5-decimals-place-compare-add', title='الأعداد العشرية', subtitle='المنزلة والمقارنة والجمع والطرح', chips=['الصف الخامس', 'الرياضيات', 'الأعداد العشرية', 'مع الحلول'], color='#0d9488', tint='#dcf7f2', note='اطبع الصفحات واحلّ في المساحات المخصصة، ثم راجع الحلول في الصفحة الأخيرة.'), P

# ---------- 3) الصف السادس: النسبة المئوية ----------
def g6_percent():
    r = random.Random(601); P = []
    A = [F(1, 2), F(1, 4), F(3, 4), F(1, 5), F(3, 5), F(7, 10), F(9, 20), F(13, 25)]
    ka = [f'{int(a * 100)}%' for a in A]
    P.append(('أكتب الكسر نسبةً مئوية', 'حوّل المقام إلى 100 (أو اضرب الكسر في 100). مثال: 3/5 = 60/100 = 60%.', grid([ltr(f'{fr(a)}<span>=</span><span class="ans" style="min-width:20mm"></span>%') for a in A], 'tall'), 'ws'))
    B = [(10, 80), (25, 120), (50, 64), (20, 150), (75, 40), (10, 350), (25, 36), (5, 200), (30, 90), (60, 50)]
    kb = [x * p // 100 for p, x in B]
    assert all(x * p % 100 == 0 for p, x in B)
    P.append(('أحسب النسبة المئوية من العدد', 'مثال: 25% من 80 = 80 ÷ 4 = 20. اكتب الجواب في الفراغ.', grid([f'<span class="ln">{p}%</span> من <span class="ln">{x}</span> = <span class="ans" style="min-width:18mm"></span>' for p, x in B], 'tall'), 'ws'))
    W = [(40, 25), (60, 50), (80, 10), (50, 20)]
    kw = [(p * x // 100, p - p * x // 100) for p, x in W]
    assert all(p * x % 100 == 0 for p, x in W)
    body = ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>سعر حقيبة <b>{p}</b> ريالًا، وعليها خصم <b>{x}%</b>.<br>كم مقدار الخصم؟ <span class="ans"></span> &nbsp; وكم السعر بعد الخصم؟ <span class="ans"></span></div>' for i, (p, x) in enumerate(W))
    P.append(('مسائل الخصم', 'اكتب مقدار الخصم أولًا ثم السعر بعد الخصم (السعر الأصلي − الخصم).', body, 'ws'))
    T = [('كسر', F(1, 2), None, None), ('كسر', F(1, 4), None, None), ('نسبة', None, None, '75%'), ('عشري', None, '0.2', None), ('كسر', F(2, 5), None, None), ('نسبة', None, None, '10%'), ('عشري', None, '0.3', None), ('نسبة', None, None, '5%')]
    def row(kind, f, dec, pct):
        if f is not None: base = f
        elif dec is not None: base = F(dec)
        else: base = F(int(pct[:-1]), 100)
        cells = [fr(base) if f is not None else '', (str(float(base)).rstrip('0').rstrip('.') if True else '') if dec is not None else '', f'{int(base*100)}%' if pct else '']
        return base, cells
    rows = ''; kt = []
    for i, t in enumerate(T):
        base, shown = row(*t); kt.append(base)
        c1 = fr(base) if t[1] is not None else ''
        c2 = t[2] if t[2] is not None else ''
        c3 = t[3] if t[3] is not None else ''
        rows += f'<tr><td style="text-align:center;height:17mm">{i+1}</td><td style="text-align:center">{c1}</td><td style="text-align:center">{ltr(c2)}</td><td style="text-align:center">{ltr(c3)}</td></tr>'
    P.append(('أكمل الجدول', 'اكتب كل عدد بالصور الثلاث: كسر عادي، وعدد عشري، ونسبة مئوية.', f'<table><tr><th>#</th><th>الكسر</th><th>العدد العشري</th><th>النسبة المئوية</th></tr>{rows}</table>', 'ws'))
    def dec(b): return str(float(b)).rstrip('0').rstrip('.') if b != int(b) else str(int(b))
    ans = K('الكسر ← نسبة مئوية', [ltr(x) for x in ka]) + K('النسبة من العدد', [ltr(x) for x in kb]) + K('الخصم / السعر بعد الخصم (ريال)', [ltr(f'{a} / {b}') for a, b in kw]) + K('الجدول (كسر / عشري / نسبة)', [ltr(f'{fr(b)} / {dec(b)} / {int(b*100)}%') for b in kt])
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', ans, 'key'))
    return spec(slug='g6-percent-basics', title='النسبة المئوية', subtitle='من الكسر إلى النسبة، وحساب الخصم', chips=['الصف السادس', 'الرياضيات', 'النسبة المئوية', 'مع الحلول'], color='#ea580c', tint='#ffeadb', note='اطبع الصفحات واحلّ في المساحات المخصصة، ثم راجع الحلول في الصفحة الأخيرة.'), P

# ---------- 4) الصف السادس: النسبة والتناسب ----------
def g6_ratio():
    from math import gcd
    P = []
    A = [(8, 12), (10, 15), (6, 18), (14, 21), (20, 30), (9, 27), (16, 24), (25, 10), (12, 8), (30, 45)]
    ka = [f'{a // gcd(a, b)} : {b // gcd(a, b)}' for a, b in A]
    P.append(('أكتب النسبة في أبسط صورة', 'اقسم حدّي النسبة على أكبر عدد يقسمهما معًا. مثال: 8 : 12 = 2 : 3.', grid([ltr(f'{a} : {b}<span>=</span><span class="ans" style="min-width:20mm"></span>') for a, b in A], 'tall'), 'ws'))
    B = [((2, 3), 4), ((1, 5), 3), ((3, 4), 5), ((2, 7), 6), ((5, 2), 4), ((4, 3), 2)]
    kb = [(a * m, b * m) for (a, b), m in B]
    Bq = [ltr(f'{a} : {b}<span>=</span><span class="ans" style="min-width:14mm"></span><span>:</span>{b * m}') if i % 2 == 0 else ltr(f'{a} : {b}<span>=</span>{a * m}<span>:</span><span class="ans" style="min-width:14mm"></span>') for i, ((a, b), m) in enumerate(B)]
    kb2 = [(a * m) if i % 2 == 0 else (b * m) for i, ((a, b), m) in enumerate(B)]
    P.append(('أكمل النسب المتكافئة', 'اضرب حدّي النسبة في العدد نفسه لتحصل على نسبة مكافئة. اكتب العدد الناقص.', grid(Bq), 'ws'))
    W = [('في صفٍّ <b>12</b> ولدًا و<b>18</b> بنتًا. ما نسبة عدد الأولاد إلى عدد البنات في أبسط صورة؟', (12, 18)),
         ('في سلة <b>15</b> تفاحة و<b>10</b> برتقالات. ما نسبة التفاح إلى البرتقال في أبسط صورة؟', (15, 10)),
         ('قرأ علي <b>20</b> صفحة وقرأت أخته <b>35</b> صفحة. ما نسبة ما قرأه علي إلى ما قرأته أخته؟', (20, 35)),
         ('طول لوحة <b>40</b> سم وعرضها <b>30</b> سم. ما نسبة الطول إلى العرض في أبسط صورة؟', (40, 30))]
    kw = [f'{a // gcd(a, b)} : {b // gcd(a, b)}' for _, (a, b) in W]
    body = ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>{t}<div class="ans" style="min-width:50mm;margin-top:1mm"></div></div>' for i, (t, _) in enumerate(W))
    P.append(('مسائل على النسبة', 'اكتب النسبة ثم بسّطها.', body, 'ws'))
    U = [('ثمن <b>3</b> دفاتر <b>6</b> ريالات. كم ثمن <b>5</b> دفاتر؟', 6 // 3 * 5, 'ريالات'), ('تقطع سيارة <b>240</b> كيلومترًا في <b>3</b> ساعات بسرعة ثابتة. كم كيلومترًا تقطع في <b>5</b> ساعات؟', 240 // 3 * 5, 'كيلومتر'), ('تحتاج وصفةُ الكعك إلى <b>2</b> كوب دقيق مقابل كل <b>3</b> بيضات. كم كوبًا من الدقيق يلزم لـ<b>9</b> بيضات؟', 2 * 3, 'أكواب'), ('طبعت آلة <b>45</b> ورقة في <b>3</b> دقائق. كم ورقة تطبع في <b>10</b> دقائق بالسرعة نفسها؟', 45 // 3 * 10, 'ورقة')]
    body = ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>{t}<div class="ans" style="min-width:50mm;margin-top:1mm"></div></div>' for i, (t, _, _) in enumerate(U))
    P.append(('المعدّل والتناسب', 'أوجد قيمة الوحدة أولًا (مثلًا ثمن دفتر واحد) ثم اضرب.', body, 'ws'))
    ans = K('أبسط صورة', [ltr(x) for x in ka]) + K('النسب المتكافئة (العدد الناقص)', [ltr(x) for x in kb2]) + K('مسائل النسبة', [ltr(x) for x in kw]) + K('المعدّل والتناسب', [f'{ltr(x)}&nbsp;{u}' for _, x, u in U])
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', ans, 'key'))
    return spec(slug='g6-ratio-and-proportion', title='النسبة والتناسب', subtitle='أبسط صورة، ونسب متكافئة، ومسائل المعدّل', chips=['الصف السادس', 'الرياضيات', 'النسبة والتناسب', 'مع الحلول'], color='#7c3aed', tint='#efe6ff', note='اطبع الصفحات واحلّ في المساحات المخصصة، ثم راجع الحلول في الصفحة الأخيرة.'), P

# ---------- 5) الصف السادس: المحيط والمساحة ----------
def rect_svg(w, h, lw, lh, unit='سم'):
    k = min(84 / w, 56 / h); rw = w * k; rh = h * k
    x0 = (150 - rw) / 2 - 14; y0 = 6
    st = 'font-size="12" direction="ltr" font-family="C" fill="#1b1430" paint-order="stroke" stroke="#fff" stroke-width="3"'
    return (f'<svg viewBox="0 0 150 100" style="direction:ltr;unicode-bidi:isolate" direction="ltr"><rect x="{x0:.1f}" y="{y0}" width="{rw:.1f}" height="{rh:.1f}" fill="#dcfce7" stroke="#16a34a" stroke-width="2.5"/>'
            f'<text x="{x0+rw/2:.1f}" y="{y0+rh+15:.1f}" text-anchor="middle" {st}>{lw} {unit}</text>'
            f'<text x="{x0+rw+6:.1f}" y="{y0+rh/2+4:.1f}" {st}>{lh} {unit}</text></svg>')
def tri_svg(b, h):
    st = 'font-size="12" direction="ltr" font-family="C" fill="#1b1430" paint-order="stroke" stroke="#fff" stroke-width="3"'
    return (f'<svg viewBox="0 0 150 100" style="direction:ltr;unicode-bidi:isolate" direction="ltr"><polygon points="20,76 120,76 55,6" fill="#dcfce7" stroke="#16a34a" stroke-width="2.5"/>'
            f'<line x1="55" y1="6" x2="55" y2="76" stroke="#16a34a" stroke-dasharray="4 3" stroke-width="1.8"/>'
            f'<text x="70" y="94" text-anchor="middle" {st}>{b} سم</text>'
            f'<text x="62" y="62" {st}>{h} سم</text></svg>')
def g6_area():
    P = []
    R = [(8, 5), (12, 7), (9, 9), (15, 4)]
    cells = []; ka = []
    for w, h in R:
        ka.append((2 * (w + h), w * h))
        cells.append(f'<div class="geo">{rect_svg(w, h, w, h)}<div>المحيط = <span class="ans" style="min-width:18mm"></span> سم<br>المساحة = <span class="ans" style="min-width:18mm"></span> سم²</div></div>')
    P.append(('محيط المستطيل ومساحته', 'المحيط = 2 × (الطول + العرض) ، المساحة = الطول × العرض.', grid(cells, 'tall'), 'ws'))
    S = [4, 7, 10]; T = [(10, 6), (8, 5), (12, 9)]
    cells2 = []; kb = []
    for s in S:
        kb.append(('مربع', 4 * s, s * s)); cells2.append(f'<div class="geo">{rect_svg(s, s, s, s)}<div>المحيط = <span class="ans" style="min-width:16mm"></span> سم<br>المساحة = <span class="ans" style="min-width:16mm"></span> سم²</div></div>')
    for b, h in T:
        kb.append(('مثلث', None, b * h // 2)); assert b * h % 2 == 0
        cells2.append(f'<div class="geo">{tri_svg(b, h)}<div>المساحة = <span class="ans" style="min-width:16mm"></span> سم²</div></div>')
    P.append(('المربع والمثلث', 'مساحة المربع = الضلع × الضلع ، مساحة المثلث = ½ × القاعدة × الارتفاع.', grid(cells2, 'tall'), 'ws'))
    W = [('حديقة مستطيلة طولها <b>12</b> م وعرضها <b>8</b> م. ما طول السياج اللازم لإحاطتها؟', 2 * (12 + 8), 'م'),
         ('غرفة مستطيلة طولها <b>6</b> م وعرضها <b>4</b> م. كم متر مربع من السجاد يغطي أرضيتها كاملة؟', 24, 'م²'),
         ('مستطيل مساحته <b>56</b> سم² وطوله <b>8</b> سم. كم عرضه؟', 7, 'سم'),
         ('مربع محيطه <b>36</b> سم. كم طول ضلعه؟ وما مساحته؟', 9, 'سم، والمساحة 81 سم²')]
    body = ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>{t}<div class="ans" style="min-width:60mm;margin-top:1mm"></div></div>' for i, (t, _, _) in enumerate(W))
    P.append(('مسائل حياتية', 'ارسم الشكل إن احتجت، واكتب القانون ثم الحل مع الوحدة.', body, 'ws'))
    ans = K('المستطيلات (المحيط / المساحة)', [ltr(f'{p} / {a}') for p, a in ka]) + K('المربعات والمثلثات', [(ltr(f'{p} / {a}') if k == 'مربع' else ltr(a)) for k, p, a in kb]) + K('المسائل', [f'{ltr(x)}&nbsp;{u}' for _, x, u in W]) + '<small>الأشكال غير مرسومة بمقياس رسم دقيق. في المربعات: المحيط / المساحة؛ وفي المثلثات: المساحة فقط.</small>'
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', ans, 'key'))
    return spec(slug='g6-perimeter-area', title='المحيط والمساحة', subtitle='المستطيل والمربع والمثلث ومسائل حياتية', chips=['الصف السادس', 'الرياضيات', 'المحيط والمساحة', 'مع الحلول'], color='#16a34a', tint='#e0f7e8', note='اطبع الصفحات واحلّ في المساحات المخصصة، ثم راجع الحلول في الصفحة الأخيرة.'), P

# ---------- 6) الصف الخامس: الجملة الاسمية والفعلية ----------
def g5_sentences():
    P = []
    ex = '<div class="bx"><b>الجملة الاسمية</b> تبدأ باسم، وتتكوّن من <b>مبتدأ</b> و<b>خبر</b>. &nbsp; مثال: <b>العلمُ نورٌ</b>.<br><b>الجملة الفعلية</b> تبدأ بفعل، وتتكوّن من <b>فعل</b> و<b>فاعل</b>. &nbsp; مثال: <b>كتبَ الطالبُ الدرسَ</b>.</div>'
    S = [('الشمسُ مشرقةٌ', 'اسمية'), ('ذهبَ أحمدُ إلى المدرسةِ', 'فعلية'), ('الحديقةُ جميلةٌ', 'اسمية'), ('تلعبُ الفتياتُ في الساحةِ', 'فعلية'), ('أبي طبيبٌ', 'اسمية'), ('رسمتْ هندُ وردةً', 'فعلية'), ('السماءُ صافيةٌ', 'اسمية'), ('سقطَ المطرُ', 'فعلية'), ('الكتابُ مفيدٌ', 'اسمية'), ('يقرأُ الولدُ القصةَ', 'فعلية')]
    rows = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td class="ar" style="font-size:15pt">{E(s)}</td><td style="text-align:center;width:28mm"><span class="opt">اسمية</span></td><td style="text-align:center;width:28mm"><span class="opt">فعلية</span></td></tr>' for i, (s, _) in enumerate(S))
    P.append(('الجملة الاسمية والجملة الفعلية', 'اقرأ التعريف ثم ضع دائرة حول نوع كل جملة.', ex + f'<table style="margin-top:3mm"><tr><th>#</th><th>الجملة</th><th>اسمية</th><th>فعلية</th></tr>{rows}</table>', 'ws'))
    N = [('العلمُ نورٌ', 'العلمُ', 'نورٌ'), ('السماءُ صافيةٌ', 'السماءُ', 'صافيةٌ'), ('أبي طبيبٌ', 'أبي', 'طبيبٌ'), ('الكتابُ مفيدٌ', 'الكتابُ', 'مفيدٌ')]
    V = [('ذهبَ أحمدُ إلى المدرسةِ', 'ذهبَ', 'أحمدُ'), ('تلعبُ الفتياتُ في الساحةِ', 'تلعبُ', 'الفتياتُ'), ('سقطَ المطرُ', 'سقطَ', 'المطرُ'), ('يقرأُ الولدُ القصةَ', 'يقرأُ', 'الولدُ')]
    t1 = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td class="ar">{E(s)}</td><td style="width:42mm"><div class="ans" style="width:100%"></div></td><td style="width:42mm"><div class="ans" style="width:100%"></div></td></tr>' for i, (s, *_ ) in enumerate(N))
    t2 = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td class="ar">{E(s)}</td><td style="width:42mm"><div class="ans" style="width:100%"></div></td><td style="width:42mm"><div class="ans" style="width:100%"></div></td></tr>' for i, (s, *_ ) in enumerate(V))
    P.append(('المبتدأ والخبر، والفعل والفاعل', 'اكتب في كل جملة ما يُطلب منك.', f'<p class="ins" style="margin:0 0 2mm"><b>أ) جمل اسمية:</b> استخرج المبتدأ والخبر.</p><table><tr><th>#</th><th>الجملة</th><th>المبتدأ</th><th>الخبر</th></tr>{t1}</table><p class="ins" style="margin:6mm 0 2mm"><b>ب) جمل فعلية:</b> استخرج الفعل والفاعل.</p><table><tr><th>#</th><th>الجملة</th><th>الفعل</th><th>الفاعل</th></tr>{t2}</table>', 'ws'))
    body = f'<p class="ins" style="margin:0 0 2mm"><b>أ)</b> أكمل كل جملة بكلمة مناسبة من عندك، ثم اكتب نوعها:</p><div class="bx ar">١) الطالبُ ................ &nbsp; (نوعها: ..........)<br>٢) ................ الولدُ الكرةَ &nbsp; (نوعها: ..........)<br>٣) الحديقةُ ................ &nbsp; (نوعها: ..........)<br>٤) ................ أبي الجريدةَ &nbsp; (نوعها: ..........)</div><p class="ins" style="margin:6mm 0 2mm"><b>ب)</b> اكتب جملة اسمية وجملة فعلية عن موضوع «الحديقة»:</p><div class="ar">جملة اسمية:{lines(1)}جملة فعلية:{lines(1)}</div>'
    P.append(('أكمل وأكوّن جمل', 'استعمل كلمات تعلّمتها، وانتبه لبداية الجملة: اسم أم فعل؟', body, 'ws'))
    ans = '<div class="key ar" style="font-size:12.5pt"><b>نوع الجمل:</b> ' + '، '.join(f'({i+1}) {t}' for i, (_, t) in enumerate(S)) + '<br><br><b>المبتدأ والخبر:</b><br>' + '<br>'.join(f'({i+1}) {a} ← مبتدأ، {b} ← خبر' for i, (_, a, b) in enumerate(N)) + '<br><br><b>الفعل والفاعل:</b><br>' + '<br>'.join(f'({i+1}) {a} ← فعل، {b} ← فاعل' for i, (_, a, b) in enumerate(V)) + '<br><br><b>صفحة الإكمال:</b> الإجابات حرّة. أمثلة: «الطالبُ مجتهدٌ» (اسمية)، «ركلَ الولدُ الكرةَ» (فعلية)، «الحديقةُ واسعةٌ» (اسمية)، «قرأَ أبي الجريدةَ» (فعلية). جملة اسمية عن الحديقة: «الحديقةُ خضراءُ». جملة فعلية: «يلعبُ الأطفالُ في الحديقةِ».</div>'
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', ans, 'key'))
    return spec(slug='g5-nominal-verbal-sentences', title='الجملة الاسمية والجملة الفعلية', subtitle='التمييز بينهما واستخراج أركانهما', chips=['الصف الخامس', 'اللغة العربية', 'النحو', 'مع الحلول'], color='#db2777', tint='#fde4f0', note='اطبع الصفحات وأجب في المساحات المخصصة، ثم راجع الإجابات في الصفحة الأخيرة.'), P

# ---------- 7) الصف السادس: علامات الترقيم ----------
def g6_punct():
    P = []
    T = [('.', 'النقطة', 'في نهاية الجملة الخبرية', 'أحبُّ وطني.'), ('،', 'الفاصلة', 'بين الكلمات أو الجمل المتتابعة', 'اشتريتُ تفاحًا، وموزًا، وبرتقالًا.'), ('؟', 'علامة الاستفهام', 'بعد السؤال', 'كم عمرُكَ؟'), ('!', 'علامة التعجب', 'بعد التعجب أو الفرح أو الدهشة', 'ما أجملَ الربيعَ!'), (':', 'النقطتان', 'بعد القول وقبل التفصيل', 'قال أبي: اجتهدْ.'), ('« »', 'علامتا التنصيص', 'يوضع بينهما كلام المتحدث كما قاله', 'قال المعلمُ: «النظافةُ من الإيمانِ.»')]
    rows = ''.join(f'<tr><td style="text-align:center;font-size:20pt;font-weight:700;width:20mm">{m}</td><td style="font-weight:700;width:36mm">{n}</td><td>{u}</td><td class="ar" style="font-size:13pt">{e}</td></tr>' for m, n, u, e in T)
    P.append(('علامات الترقيم وما تفيده', 'علامات الترقيم تساعدنا على فهم المقروء وإظهار معنى الجملة. تعرّف إلى العلامات الشائعة:', f'<table><tr><th>العلامة</th><th>اسمها</th><th>متى نستعملها؟</th><th>مثال</th></tr>{rows}</table>', 'ws'))
    S = [('ما اسمُ مدينتِكَ', '؟'), ('ذهبَ الأولادُ إلى الحديقةِ', '.'), ('ما أروعَ هذا المنظرَ', '!'), ('أينَ وضعتَ حقيبتَكَ', '؟'), ('يحبُّ سالمٌ كرةَ القدمِ', '.'), ('كم الساعةُ الآنَ', '؟'), ('ما أجملَ صوتَ العصفورِ', '!'), ('أشرقتِ الشمسُ', '.'), ('هل أنهيتَ واجبَكَ', '؟'), ('يا لها من مفاجأةٍ سعيدةٍ', '!')]
    rows = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td class="ar">{s}</td><td style="width:22mm"><span class="ans" style="min-width:14mm"></span></td></tr>' for i, (s, _) in enumerate(S))
    P.append(('أضع العلامة المناسبة في نهاية الجملة', 'اختر من: ( . ) أو ( ؟ ) أو ( ! ) حسب معنى الجملة.', f'<table><tr><th>#</th><th>الجملة</th><th>العلامة</th></tr>{rows}</table>', 'ws'))
    C = ['اشتريتُ من السوقِ تفاحًا وموزًا وعنبًا', 'زرعَ الفلاحُ قمحًا وشعيرًا وذرةً', 'في حقيبتي كتابٌ ودفترٌ وقلمٌ']
    Q2 = ['قال المعلمُ اجتهدوا في دروسِكم.', 'قالت أمي الصدقُ منجاةٌ.', 'قال الأبُ لابنِه احترمْ معلمَكَ.']
    body = '<p class="ins" style="margin:0 0 2mm"><b>أ)</b> ضع الفاصلة ( ، ) بين الأشياء المعدودة ثم أعد كتابة الجملة:</p>' + ''.join(f'<div class="bx ar" style="font-size:12.5pt;line-height:1.7;padding:2mm 5mm">{i+1}) {s}<div class="ans" style="width:100%;height:8mm"></div></div>' for i, s in enumerate(C)) + '<p class="ins" style="margin:5mm 0 2mm"><b>ب)</b> ضع النقطتين ( : ) وعلامتي التنصيص ( « » ) في المكان الصحيح:</p>' + ''.join(f'<div class="bx ar" style="font-size:12.5pt;line-height:1.7;padding:2mm 5mm">{i+1}) {s}<div class="ans" style="width:100%;height:8mm"></div></div>' for i, s in enumerate(Q2))
    P.append(('الفاصلة والنقطتان والتنصيص', 'أعد كتابة كل جملة بعد إضافة علامات الترقيم الناقصة.', body, 'ws'))
    M = [('؟', 'علامة الاستفهام'), ('!', 'علامة التعجب'), (':', 'النقطتان'), ('.', 'النقطة'), ('،', 'الفاصلة'), ('« »', 'علامتا التنصيص')]
    left = ['النقطة', 'علامة التعجب', 'الفاصلة', 'علامتا التنصيص', 'علامة الاستفهام', 'النقطتان']
    ml = '<div style="display:flex;justify-content:space-around;margin-top:3mm"><div>' + ''.join(f'<div class="q" style="min-height:14mm;margin-bottom:3mm;justify-content:center;font-size:22pt;font-weight:700">{m}</div>' for m, _ in M) + '</div><div>' + ''.join(f'<div class="q" style="min-height:14mm;margin-bottom:3mm;justify-content:center;font-size:13pt">{n}</div>' for n in left) + '</div></div>'
    body = '<p class="ins" style="margin:0 0 2mm"><b>أ)</b> صِل كل علامة باسمها بخط:</p>' + ml + f'<p class="ins" style="margin:4mm 0 2mm"><b>ب)</b> اكتب جملة تنتهي بعلامة استفهام، وجملة تنتهي بعلامة تعجب:</p><div class="ar">{lines(2, 10)}</div>'
    P.append(('أصِل وأكوّن جملًا', 'اقرأ بعناية ثم أجب.', body, 'ws'))
    kkC = ['اشتريتُ من السوقِ تفاحًا، وموزًا، وعنبًا.', 'زرعَ الفلاحُ قمحًا، وشعيرًا، وذرةً.', 'في حقيبتي كتابٌ، ودفترٌ، وقلمٌ.']
    kkQ = ['قال المعلمُ: «اجتهدوا في دروسِكم.»', 'قالت أمي: «الصدقُ منجاةٌ.»', 'قال الأبُ لابنِه: «احترمْ معلمَكَ.»']
    ans = '<div class="key ar" style="font-size:12.5pt"><b>نهاية الجمل:</b> ' + '، '.join(f'({i+1}) {dict(zip("؟.!", ("علامة الاستفهام", "النقطة", "علامة التعجب")))[m]}' for i, (_, m) in enumerate(S)) + '<br><br><b>الفاصلة:</b><br>' + '<br>'.join(f'({i+1}) {s}' for i, s in enumerate(kkC)) + '<br><br><b>النقطتان والتنصيص:</b><br>' + '<br>'.join(f'({i+1}) {s}' for i, s in enumerate(kkQ)) + '<br><br><b>التوصيل:</b> علامة الاستفهام (؟)، علامة التعجب (!)، النقطتان (:)، النقطة (.)، الفاصلة (،)، علامتا التنصيص (« »).<br><br><b>صفحة «أصِل وأكوّن»، بند ب:</b> الإجابة حرّة، مثال: «كم عدد طلابِ صفِّكَ؟» و«ما أجملَ هذا اليومَ!».</div>'
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', ans, 'key'))
    return spec(slug='g6-punctuation-marks', title='علامات الترقيم', subtitle='النقطة والفاصلة والاستفهام والتعجب والنقطتان والتنصيص', chips=['الصف السادس', 'اللغة العربية', 'الإملاء والكتابة', 'مع الحلول'], color='#4f46e5', tint='#e6e7ff', note='اطبع الصفحات وأجب في المساحات المخصصة، ثم راجع الإجابات في الصفحة الأخيرة.'), P

ALL = dict(g5_fractions=g5_fractions, g5_decimals=g5_decimals, g6_percent=g6_percent, g6_ratio=g6_ratio, g6_area=g6_area, g5_sentences=g5_sentences, g6_punct=g6_punct)

# ================= المرحلة 2: عمر سنة إلى سنتين =================
IMGS = 'file://' + ROOT + '/images/zad/'
def bigcard(img, word, sub, color, tint, cut=True):
    return (f'<div style="flex:1;border:1.2mm {"dashed" if cut else "solid"} {color};border-radius:9mm;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm;padding:3mm;position:relative;min-height:0;overflow:hidden">'
            f'<img src="{IMGS}{img}.webp" style="height:56mm;max-width:100%;object-fit:contain">'
            f'<div style="font-size:32pt;font-weight:700;color:{color};line-height:1.1">{word}</div>'
            f'{sub}</div>')
def cardpage(cards): return '<div style="display:flex;flex-direction:column;gap:6mm;flex:1;min-height:0">' + ''.join(cards) + '</div>'
TIPS = lambda items: '<div class="bx" style="font-size:13.5pt;line-height:2.1"><ol style="margin:0;padding-inline-start:7mm">' + ''.join(f'<li>{x}</li>' for x in items) + '</ol></div>'

def a2_animals():
    C, T = '#ea580c', '#ffeadb'
    A = [('1f431', 'القطة', 'مياو'), ('1f436', 'الكلب', 'هاو هاو'), ('1f404', 'البقرة', 'موووو'), ('1f411', 'الخروف', 'مااع'),
         ('1f413', 'الديك', 'كوكو كوكو'), ('1f986', 'البطة', 'بطّ بطّ'), ('1f438', 'الضفدع', 'نقّ نقّ'), ('1f981', 'الأسد', 'غررررر')]
    sub = lambda s: f'<div style="background:{C};color:#fff;border-radius:7mm;padding:.5mm 8mm;font-size:20pt;font-weight:700">يقول «{s}»</div>'
    P = [('كيف نستعمل البطاقات؟', 'للأم والأب: نصف ساعة ممتعة مع طفلك.', TIPS([
        'اطبع الصفحات وقصّ البطاقات على الخط المتقطع، ويفضّل تغليفها أو طباعتها على ورق سميك.',
        'أرِ الطفل بطاقة واحدة فقط في كل مرة، وقل الاسم بوضوح: «هذه القطة».',
        'قلّد صوت الحيوان بحماس: «القطة تقول مياو!» ودع الطفل يحاول معك دون إجبار.',
        'اسأله: «أين القطة؟» ليشير إليها بين بطاقتين، ثم بين ثلاث.',
        'كرّر اللعبة في أيام مختلفة؛ التكرار الممتع هو سرّ التعلّم في هذا العمر.',
        'ابتعد عن البطاقات الصغيرة التي يمكن أن يضعها الطفل في فمه، وابقَ بجانبه دائمًا.'
    ]), 'tip')]
    for i in range(0, 8, 2):
        P.append(('حيوانات وأصواتها', 'بطاقتان في الصفحة: قصّهما على الخط المتقطع.', cardpage([bigcard(a, w, sub(s), C, T) for a, w, s in A[i:i + 2]]), 'card'))
    return spec(slug='a2-animals-and-sounds-cards', title='حيوانات وأصواتها', subtitle='ثماني بطاقات كبيرة للتعرّف على الحيوان وصوته', chips=['سنة إلى سنتين', 'بطاقات', 'الحيوانات', 'الأصوات'], color=C, tint=T, note='قصّ البطاقات وأرِها لطفلك واحدة واحدة، وقلّد صوت كل حيوان معه.'), P

def a2_colors():
    C, T = '#7c3aed', '#efe6ff'
    A = [('1f34e', 'أحمر', 'التفاحة حمراء', '#dc2626'), ('1f34c', 'أصفر', 'الموزة صفراء', '#ca8a04'), ('1f4a7', 'أزرق', 'قطرة الماء زرقاء', '#2563eb'),
         ('1f34f', 'أخضر', 'التفاحة خضراء', '#16a34a'), ('1f34a', 'برتقالي', 'البرتقالة برتقالية', '#ea580c'), ('1f347', 'بنفسجي', 'العنب بنفسجي', '#7e22ce')]
    def card(a, w, s, c):
        return (f'<div style="flex:1;border:1.2mm dashed {c};border-radius:9mm;background:#fff;display:flex;overflow:hidden">'
                f'<div style="width:38%;background:{c};display:grid;place-items:center;color:#fff;font-size:34pt;font-weight:700">{w}</div>'
                f'<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm;padding:3mm 0"><img src="{IMGS}{a}.webp" style="height:38mm"><div style="font-size:20pt;font-weight:700;color:{c}">{s}</div></div></div>')
    P = [('كيف نستعمل البطاقات؟', 'للأم والأب: ألوان بسيطة تُعرَّف بالأشياء الحقيقية.', TIPS([
        'قصّ البطاقات الست على الخط المتقطع.',
        'أرِ الطفل بطاقة اللون وقل: «هذا اللون أحمر» ثم أرِه تفاحة حقيقية أو شيئًا أحمر من البيت.',
        'ابدأ بلونين فقط (أحمر وأزرق)، وأضف لونًا جديدًا كل بضعة أيام.',
        'اسأله: «أين الأحمر؟» وشجّعه عند الإشارة حتى لو أخطأ.',
        'لا تتوقع أن يسمّي الألوان بنفسه قبل أن يسمعها كثيرًا؛ الفهم يسبق الكلام.'
    ]), 'tip')]
    for i in range(0, 6, 3):
        P.append(('الألوان الأساسية', 'ثلاث بطاقات في الصفحة: قصّها على الخط المتقطع.', cardpage([card(*x) for x in A[i:i + 3]]), 'card'))
    return spec(slug='a2-basic-colors-cards', title='ألواني الأولى', subtitle='ست بطاقات للألوان الأساسية مع أشياء مألوفة', chips=['سنة إلى سنتين', 'بطاقات', 'الألوان'], color=C, tint=T, note='قصّ البطاقات وطابق كل لون بشيء حقيقي في البيت.'), P

ALL.update(a2_animals=a2_animals, a2_colors=a2_colors)
