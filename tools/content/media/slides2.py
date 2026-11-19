# -*- coding: utf-8 -*-
from slides import *
def pie(num, den, c, size=46):
    deg = 360 * num / den
    cuts = ''.join(f',#fff 0 0' for _ in range(0))
    lines = ''.join(f'<div style="position:absolute;left:50%;top:50%;width:50%;height:.6mm;background:#fff;transform-origin:0 50%;transform:rotate({k * 360 / den - 90}deg)"></div>' for k in range(den)) if den > 1 else ''
    return f'<div style="position:relative;width:{size}mm;height:{size}mm;border-radius:50%;background:conic-gradient(from 0deg,{c} 0 {deg}deg,{c}22 {deg}deg 360deg);border:.8mm solid {c};overflow:hidden">{lines}</div>'
def frac(n, d, c='#6a2bd9', s=30):
    return f'<div style="display:inline-flex;flex-direction:column;align-items:center;font-weight:700;font-size:{s}pt;color:{c};line-height:1.1"><span>{AD(n)}</span><span style="border-top:.9mm solid {c};padding:0 3mm">{AD(d)}</span></div>'
def pieslide(sp, title, items, note=''):
    cells = ''.join(f'<div style="display:flex;flex-direction:column;align-items:center;gap:3mm">{pie(n, d, PAL[i % 8])}{frac(n, d, PAL[i % 8])}<div style="font-size:17pt;font-weight:700">{w}</div></div>' for i, (n, d, w) in enumerate(items))
    return S(sp, title, f'<div style="display:flex;justify-content:space-around;align-items:center;flex:1">{cells}</div>' + (f'<div style="text-align:center;font-size:17pt;margin-top:2mm">{note}</div>' if note else ''))

import math
SUN = '<svg viewBox="-60 -60 120 120" width="60mm" height="60mm"><g stroke="#f9a825" stroke-width="6" stroke-linecap="round">' + ''.join(f'<line x1="{38*math.cos(k*math.pi/6):.1f}" y1="{38*math.sin(k*math.pi/6):.1f}" x2="{54*math.cos(k*math.pi/6):.1f}" y2="{54*math.sin(k*math.pi/6):.1f}"/>' for k in range(12)) + '</g><circle r="32" fill="#ffca28" stroke="#f9a825" stroke-width="4"/></svg>'
@spec('sl-solar-system')
def _():
    sp = SP(title='عرض: المجموعة الشمسية', desc='عرض تقديمي من ثماني شرائح عن المجموعة الشمسية: الشمس والكواكب الداخلية والخارجية والقمر وحركة الأرض، مع أسئلة مراجعة وخلاصة.', levels=['g4', 'g5', 'g6'], subject='العلوم', topic='الفضاء', sort=30)
    P = [title_slide(sp, 'المجموعة الشمسية', 'رحلة بين الشمس والكواكب', ['x_earth', 'x_saturn', 'x_astro', 'i_rocket']),
         goals(sp, ['أذكر الكواكب الثمانية بترتيبها', 'أميّز الكواكب الداخلية من الخارجية', 'أفسّر الليل والنهار والسنة']),
         S(sp, 'الشمس', f'<div style="display:flex;gap:10mm;align-items:center;flex:1"><div style="flex:none;width:80mm;height:100%;border-radius:8mm;background:#f9a82514;border:.8mm solid #f9a825;display:flex;align-items:center;justify-content:center">{SUN}</div><div style="flex:1;display:flex;flex-direction:column;gap:5mm;justify-content:center">' + ''.join(f'<div style="display:flex;gap:4mm;font-size:21pt;line-height:1.5"><span style="color:#f9a825">●</span><span>{t}</span></div>' for t in ['الشمس <b>نجم</b> مضيء', 'مصدر الضوء والحرارة للأرض', 'تدور حولها الكواكب']) + '</div></div>'),
         duo(sp, 'الكواكب الداخلية', ['x_earth'], ['الأقرب إلى الشمس', 'عطارد · الزهرة · الأرض · المريخ', 'كواكب صخرية'], '#e53935'),
         duo(sp, 'الكواكب الخارجية', ['x_saturn'], ['الأبعد عن الشمس', 'المشتري · زحل · أورانوس · نبتون', 'كواكب عملاقة وغازية'], '#039be5'),
         duo(sp, 'القمر وحركة الأرض', ['x_fullmoon'], ['القمر تابع للأرض ويدور حولها', 'دوران الأرض حول نفسها يعطي الليل والنهار', 'دورانها حول الشمس يعطي السنة'], '#8e24aa'),
         qs(sp, 'راجع معي', ['كم عدد الكواكب في المجموعة الشمسية؟ (ثمانية)', 'ما اسم الكوكب الذي نعيش عليه؟ (الأرض)', 'ما الذي يسبّب الليل والنهار؟ (دوران الأرض حول نفسها)', 'أيّ الكواكب أبعد عن الشمس: المريخ أم نبتون؟ (نبتون)']),
         summary(sp, ['الشمس نجم تدور حوله ثمانية كواكب', 'الكواكب الداخلية صخرية والخارجية عملاقة', 'الأرض تدور حول نفسها وحول الشمس'])]
    return deck(sp, P)

@spec('sl-food-chain')
def _():
    sp = SP(title='عرض: السلسلة الغذائية', desc='عرض تقديمي من ثماني شرائح عن السلسلة الغذائية: المنتجات والمستهلكات والمحلّلات ومصدر الطاقة مع مثال مرسوم.', levels=['g4', 'g5'], subject='العلوم', topic='الكائنات الحية', sort=31)
    ch = [('x_leaf', 'عشب'), ('1f98b', 'فراشة'), ('1f438', 'ضفدع'), ('1f40d', 'ثعبان'), ('1f985', 'نسر')]
    chain = '<div style="display:flex;align-items:center;justify-content:center;gap:3mm;flex:1">' + '<span style="font-size:26pt;color:#6a2bd9">‹</span>'.join(f'<div style="text-align:center;border:.7mm solid {PAL[i]};background:{PAL[i]}12;border-radius:6mm;padding:4mm 5mm">{I(ic, 22)}<div style="font-size:17pt;font-weight:700;margin-top:2mm">{nm}</div></div>' for i, (ic, nm) in enumerate(ch)) + '</div><div style="text-align:center;font-size:16pt">السهم يشير إلى من يأكل: الضفدع يأكل الفراشة</div>'
    P = [title_slide(sp, 'السلسلة الغذائية', 'من يأكل من؟', ['x_leaf', '1f98b', '1f438', '1f985']),
         goals(sp, ['أعرف أن الشمس مصدر الطاقة', 'أميّز المنتجات والمستهلكات والمحلّلات', 'أرتّب سلسلة غذائية بسيطة']),
         duo(sp, 'المنتجات', ['x_plant'], ['النباتات الخضراء', 'تصنع غذاءها بنفسها بالضوء', 'بداية كل سلسلة غذائية'], '#43a047'),
         duo(sp, 'المستهلكات', ['1f430', '1f981'], ['عاشبة: تأكل النباتات', 'لاحمة: تأكل الحيوانات', 'قارتة: تأكل النباتات والحيوانات'], '#fb8c00'),
         duo(sp, 'المحلّلات', ['1f331'], ['فطريات وبكتيريا', 'تحلّل الكائنات الميتة', 'تعيد المواد إلى التربة'], '#6d4c41'),
         S(sp, 'مثال على سلسلة غذائية', chain),
         qs(sp, 'راجع معي', ['ما مصدر الطاقة الأول؟ (الشمس)', 'من المنتج في السلسلة المرسومة؟ (العشب)', 'هل الأسد عاشب أم لاحم؟ (لاحم)']),
         summary(sp, ['الشمس مصدر الطاقة', 'المنتجات تصنع الغذاء والمستهلكات تأكل', 'المحلّلات تحلّل الميتة وتفيد التربة'])]
    return deck(sp, P)

@spec('sl-fractions')
def _():
    sp = SP(title='عرض: الكسور', desc='عرض تقديمي من ثماني شرائح للتعرّف على الكسور بالرسم: البسط والمقام ونصف وثلث وربع والكسور المتكافئة، مع أسئلة وخلاصة.', levels=['g3', 'g4', 'g5'], subject='الرياضيات', topic='الكسور', sort=32)
    P = [title_slide(sp, 'الكسور', 'جزء من كل', ['x_icecream', '1f34a', '1f355']),
         goals(sp, ['أقرأ الكسر وأعرف البسط والمقام', 'أمثّل الكسور بالرسم', 'أتعرّف على كسور متساوية']),
         S(sp, 'ما الكسر؟', f'<div style="display:flex;align-items:center;gap:12mm;flex:1"><div style="flex:none;width:80mm;display:flex;flex-direction:column;align-items:center;gap:4mm">{pie(3, 4, "#6a2bd9", 52)}{frac(3, 4, "#6a2bd9", 36)}</div><div style="flex:1;font-size:21pt;line-height:1.7"><b style="color:#e53935">البسط</b> (العلوي): عدد الأجزاء المأخوذة، وهنا ٣<br><b style="color:#039be5">المقام</b> (السفلي): عدد الأجزاء المتساوية كلها، وهنا ٤<br>نقرأ: ثلاثة أرباع</div></div>'),
         pieslide(sp, 'نصف وثلث وربع', [(1, 2, 'نصف'), (1, 3, 'ثلث'), (1, 4, 'ربع')]),
         pieslide(sp, 'كسور متساوية', [(1, 2, 'نصف'), (2, 4, 'اثنان من أربعة'), (4, 8, 'أربعة من ثمانية')], 'كلها تغطي نصف الدائرة، فهي كسور متساوية'),
         qs(sp, 'راجع معي', ['في الكسر ثلاثة أرباع، ما المقام؟ (٤)', 'كم ربعًا في النصف؟ (ربعان)', 'إذا قُسمت بيتزا إلى ٨ أجزاء وأكلت ٣، فما الكسر المأكول؟ (ثلاثة أثمان)']),
         summary(sp, ['الكسر جزء من كل مقسوم إلى أجزاء متساوية', 'البسط فوق والمقام تحت', 'قد يكون لكسرين الشكل نفسه مختلفين وهما متساويان'])]
    return deck(sp, P)

@spec('sl-multiplication-review')
def _():
    sp = SP(title='عرض مراجعة: جدول الضرب', desc='عرض مراجعة من سبع شرائح لتدريبات الضرب على جدول ٢ إلى ٩ مع شريحة إجابات محسوبة برمجيًا.', levels=['g3', 'g4'], subject='الرياضيات', topic='الضرب', sort=33)
    A = [(3, 4), (6, 7), (8, 5), (9, 6)]; B = [(7, 8), (4, 9), (6, 6), (9, 9)]
    qq = lambda L: [EQ(f'{AD(a)} × {AD(b)} = ؟') for a, b in L]
    P = [title_slide(sp, 'مراجعة الضرب', 'هيّا نتدرّب على الجدول', ['2b50', '1f9e0']),
         goals(sp, ['أحفظ نواتج الضرب حتى ٩ × ٩', 'أستخدم الجمع المتكرر عند النسيان', 'أتحقّق من إجابتي']),
         qs(sp, 'التدريب الأول', qq(A)), qs(sp, 'التدريب الثاني', qq(B)),
         qs(sp, 'إجابات التدريب الأول', [EQ(f'{AD(a)} × {AD(b)} = {AD(a * b)}') for a, b in A]), qs(sp, 'إجابات التدريب الثاني', [EQ(f'{AD(a)} × {AD(b)} = {AD(a * b)}') for a, b in B]),
         summary(sp, ['الضرب جمع متكرر', 'ترتيب العوامل لا يغيّر الناتج', 'المراجعة اليومية تثبّت الحفظ'])]
    return deck(sp, P)

@spec('sl-english-tenses')
def _():
    sp = SP(title='Slides: Verb Tenses (أزمنة الفعل)', desc='عرض تقديمي بالإنجليزية من ست شرائح لأزمنة الفعل الثلاثة: الحاضر البسيط والماضي البسيط والمستقبل مع جمل وأسئلة.', levels=['g4', 'g5', 'g6'], subject='اللغة الإنجليزية', topic='Grammar', sort=34)
    L = lambda t: f'<span class="l" dir="ltr">{t}</span>'
    def one(title, rule, ex, c): return S(sp, title, f'<div style="display:flex;flex-direction:column;justify-content:center;gap:6mm;flex:1"><div style="font-size:21pt;background:{c}14;border:.7mm solid {c};border-radius:6mm;padding:4mm 7mm">{rule}</div>' + ''.join(f'<div style="font-size:26pt;font-weight:700;color:{c};text-align:center">{L(e)}</div>' for e in ex) + '</div>')
    P = [title_slide(sp, 'Verb Tenses · أزمنة الفعل', 'الحاضر والماضي والمستقبل', ['23f3', 'i_clock']),
         goals(sp, ['I know present, past and future', 'أختار الزمن المناسب للجملة', 'أكتب جملًا صحيحة']),
         one('Present simple', 'نستعمله للعادات والحقائق', ['I play football.', 'She plays football.'], '#43a047'),
         one('Past simple', 'نستعمله للأفعال التي انتهت', ['I played yesterday.', 'He watched a film.'], '#e53935'),
         one('Future with will', 'نستعمل will مع الفعل للمستقبل', ['I will play tomorrow.', 'They will visit us.'], '#039be5'),
         qs(sp, 'Choose the tense', [f'{L("I walked to school.")} ← الماضي', f'{L("We will travel next week.")} ← المستقبل', f'{L("He drinks milk every day.")} ← الحاضر']),
         summary(sp, ['Present: habits and facts', 'Past: finished actions', 'Future: will + verb'])]
    return deck(sp, P)

@spec('sl-study-skills')
def _():
    sp = SP(title='عرض: مهارات الدراسة', desc='عرض تقديمي من سبع شرائح عن مهارات الدراسة: تنظيم الوقت والمكان الهادئ والتلخيص والمراجعة والنوم الكافي قبل الاختبار.', levels=['g4', 'g5', 'g6'], subject='المهارات الحياتية', topic='مهارات الدراسة', sort=35)
    P = [title_slide(sp, 'مهارات الدراسة', 'كيف أتعلّم بشكل أفضل؟', ['i_notebook', 'i_clock', 'i_brain']),
         goals(sp, ['أنظّم وقتي للدراسة', 'ألخّص وأراجع بانتظام', 'أستعدّ للاختبار بهدوء']),
         duo(sp, 'أنظّم وقتي', ['i_clock'], ['أضع جدولًا يوميًا', 'أخصّص وقتًا للدراسة ووقتًا للراحة', 'أبدأ بالأصعب'], '#e53935'),
         duo(sp, 'مكان هادئ', ['i_desk'], ['إضاءة جيدة', 'بعيدًا عن الألعاب والتلفاز', 'الكتب والأقلام أمامي'], '#43a047'),
         duo(sp, 'ألخّص وأراجع', ['i_pencil'], ['أكتب الأفكار المهمة بكلماتي', 'أرسم خريطة ذهنية', 'أراجع قليلًا كل يوم'], '#039be5'),
         duo(sp, 'قبل الاختبار', ['x_sleep'], ['أراجع بهدوء دون استعجال', 'أنام نومًا كافيًا', 'أتناول فطورًا صحيًا'], '#8e24aa'),
         summary(sp, ['الوقت المنظّم يسهّل الدراسة', 'التلخيص والمراجعة يثبّتان المعلومة', 'الراحة والنوم جزء من النجاح'])]
    return deck(sp, P)

@spec('sl-arabic-sentences')
def _():
    sp = SP(title='عرض: الجملة الاسمية والفعلية', desc='عرض تقديمي من سبع شرائح للتمييز بين الجملة الاسمية والجملة الفعلية بالأمثلة مع تدريب وخلاصة.', levels=['g4', 'g5', 'g6'], subject='اللغة العربية', topic='قواعد اللغة', sort=36)
    P = [title_slide(sp, 'الجملة الاسمية والفعلية', 'كيف نميّز بينهما؟', ['1f4da', 'i_pencil']),
         goals(sp, ['أعرّف الجملة الاسمية والفعلية', 'أميّز بينهما من أول كلمة', 'أكوّن جملًا من النوعين']),
         duo(sp, 'الجملة الاسمية', ['i_book'], ['تبدأ <b>باسم</b>', 'تتكوّن من: مبتدأ + خبر', 'مثال: الطالبُ مجتهدٌ', 'مثال: السماءُ صافيةٌ'], '#43a047', 40),
         duo(sp, 'الجملة الفعلية', ['i_pencil'], ['تبدأ <b>بفعل</b>', 'تتكوّن من: فعل + فاعل', 'مثال: كتبَ الطالبُ', 'مثال: يلعبُ الأطفالُ'], '#e53935', 40),
         qs(sp, 'ما نوع الجملة؟', ['الشمسُ مشرقةٌ ← اسمية', 'ذهبَ الولدُ إلى المدرسة ← فعلية', 'الحديقةُ جميلةٌ ← اسمية', 'تقرأُ البنتُ قصةً ← فعلية']),
         qs(sp, 'أكوّن جملتين', ['أبدأ باسم: (الكتابُ ...) فأكوّن جملة اسمية', 'أبدأ بفعل: (قرأَ ...) فأكوّن جملة فعلية']),
         summary(sp, ['أول كلمة تحدّد نوع الجملة', 'اسم أولًا: جملة اسمية', 'فعل أولًا: جملة فعلية'])]
    return deck(sp, P)
