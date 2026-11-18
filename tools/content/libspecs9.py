# -*- coding: utf-8 -*-
# توسعة: رياضيات ولغة عربية للصفين 5 و6
from libspecs8 import *
import random
from decimal import Decimal as D
MN = '−'
def sg(n): return f'{MN}{abs(n)}' if n < 0 else str(n)
def esc(x): return x.replace('<', '&lt;').replace('>', '&gt;')
def box_(): return '<span class="opt" style="min-width:9mm;height:9mm"></span>'

def math5():
    C, T = '#0d9488', '#dcf7f2'; r = random.Random(551); P = []
    m1 = [(r.randint(120, 480), r.randint(3, 9)) for _ in range(4)] + [(r.randint(12, 49), r.randint(11, 29)) for _ in range(4)]
    body = grid([ltr(f'{a}<span>×</span>{b}<span>=</span><span class="ans" style="min-width:26mm"></span>') for a, b in m1], 'tall')
    P.append(('الضرب', 'احسب ناتج الضرب في المساحة المخصصة.', body, 'ws'))
    d1 = []
    for _ in range(4):
        b = r.randint(3, 9); q = r.randint(40, 180); d1.append((b * q, b, 0))
    for _ in range(4):
        b = r.randint(3, 9); q = r.randint(30, 120); rem = r.randint(1, b - 1); d1.append((b * q + rem, b, rem))
    body = grid([ltr(f'{a}<span>÷</span>{b}<span>=</span><span class="ans" style="min-width:18mm"></span>') + ('' if i < 4 else '<div style="font-size:11pt;margin-top:1mm">الباقي: <span class="ans" style="min-width:14mm"></span></div>') for i, (a, b, _) in enumerate(d1)], 'tall')
    P.append(('القسمة', 'احسب ناتج القسمة، واكتب الباقي إن وُجد.', body, 'ws'))
    wp = [(f'في مدرسة {a} صفًّا، وفي كل صف {b} طالبًا. كم طالبًا في المدرسة؟', a * b) for a, b in [(12, 25), (8, 34), (15, 22)]]
    q1, q2 = 6, 144; wp.append((f'وزّعت المعلّمة {q2} قلمًا بالتساوي على {q1} طلاب. كم قلمًا أخذ كل طالب؟', q2 // q1))
    body = ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>{t}<div class="ans" style="min-width:60mm;margin-top:1mm"></div></div>' for i, (t, _) in enumerate(wp))
    P.append(('مسائل كلامية', 'اقرأ المسألة، واكتب العملية، ثم الناتج.', body, 'ws'))
    key = K('الضرب', [ltr(str(a * b)) for a, b in m1]) + K('القسمة', [ltr(f'{a // b}' + (f' والباقي {a % b}' if a % b else '')) for a, b, _ in d1]) + K('المسائل', [ltr(str(v)) for _, v in wp])
    return fin(S5('g5-multiplication-division', 'الضرب والقسمة', 'ضرب أعداد كبيرة وقسمة مع باقٍ ومسائل كلامية', ['الصف الخامس', 'الرياضيات', 'الضرب والقسمة', 'مع الحلول'], C, T, 'اطبع الصفحات واحلّ في المساحات المخصصة، ثم راجع الحلول في الصفحة الأخيرة.'), P, key)

def math6():
    C, T = '#7c3aed', '#efe6ff'; r = random.Random(661); P = []
    pairs = [(-3, 2), (-7, -4), (5, -8), (0, -1), (-10, -12), (6, -6)]
    body = '<p class="ins">العدد الأقرب إلى اليمين على خط الأعداد هو الأكبر. ضع ( &lt; أو &gt; ) :</p>' + grid([ltr(f'{sg(a)}<span class="opt" style="min-width:9mm;height:9mm"></span>{sg(b)}') for a, b in pairs], 'tall')
    sets = [[3, -5, 0, -2], [-8, 4, -1, 7], [-6, -9, 2, -3]]
    body += '<p class="ins" style="margin-top:4mm">رتّب كل مجموعة من الأصغر إلى الأكبر:</p>' + ''.join(f'<div class="bx">' + ltr('، '.join(sg(x) for x in s)) + f' &nbsp; ← &nbsp; {ans_line(60)}</div>' for s in sets)
    P.append(('الأعداد الصحيحة: المقارنة والترتيب', 'الأعداد الصحيحة تشمل الموجبة والسالبة والصفر.', body, 'ws'))
    ops = [(-3, '+', 5), (4, '+', -7), (-2, '+', -6), (3, '−', 7), (-2, '−', 5), (-4, '+', 9), (8, '+', -8), (5, '−', 9)]
    def ev(a, o, b): return a + b if o == '+' else a - b
    exprs = [ltr(f'{sg(a)}<span>{o}</span>' + (f'({sg(b)})' if b < 0 else sg(b)) + '<span>=</span><span class="ans" style="min-width:20mm"></span>') for a, o, b in ops]
    P.append(('الجمع والطرح', 'استعن بخط الأعداد: الجمع يعني التحرّك يمينًا، والطرح يعني التحرّك يسارًا.', grid(exprs, 'tall'), 'ws'))
    tp = [('كانت درجة الحرارة صباحًا ' + sg(-3) + ' ثم ارتفعت 8 درجات. كم أصبحت؟', -3 + 8), ('غاص غوّاص إلى عمق 12 مترًا تحت سطح البحر (' + sg(-12) + ') ثم صعد 5 أمتار. أين أصبح؟', -12 + 5),
          ('كان رصيد سالم ' + sg(-4) + ' ريال (دين)، ثم دفع 6 ريالات أخرى. كم أصبح رصيده؟', -4 - 6), ('درجة الحرارة في مدينة ' + sg(-2) + ' وفي أخرى 5. كم الفرق بينهما؟', 5 - (-2))]
    body = ''.join(f'<div class="bx"><span class="no" style="display:inline-grid;margin-inline-end:2mm">{i+1}</span>{t}<div class="ans" style="min-width:60mm;margin-top:1mm"></div></div>' for i, (t, _) in enumerate(tp))
    P.append(('مسائل من الحياة', 'السالب يدل على ما هو أقل من الصفر، كالدين أو تحت سطح البحر.', body, 'ws'))
    cmp_ = ['&gt;' if a > b else '&lt;' for a, b in pairs]
    key = K('المقارنة', [ltr(c) for c in cmp_]) + K('الترتيب', [ltr('، '.join(sg(x) for x in sorted(s))) for s in sets]) + K('الجمع والطرح', [ltr(sg(ev(*o))) for o in ops]) + K('المسائل', [ltr(sg(v)) for _, v in tp])
    return fin(S5('g6-integers-intro', 'الأعداد الصحيحة', 'الأعداد الموجبة والسالبة: مقارنة وترتيب وجمع وطرح', ['الصف السادس', 'الرياضيات', 'الأعداد الصحيحة', 'مع الحلول'], C, T, 'اطبع الصفحات واحلّ في المساحات المخصصة، ثم راجع الحلول في الصفحة الأخيرة.'), P, key)

def ar5():
    C, T = '#db2777', '#fde7f1'
    V = [('كَتَبَ', 'ماضٍ'), ('يَكْتُبُ', 'مضارع'), ('اكْتُبْ', 'أمر'), ('لَعِبَ', 'ماضٍ'), ('يَلْعَبُ', 'مضارع'), ('اجْلِسْ', 'أمر'), ('قَرَأَ', 'ماضٍ'), ('يَقْرَأُ', 'مضارع')]
    ex = '<div class="bx"><b>الفعل الماضي</b> يدل على حدث انتهى: كَتَبَ.<br><b>الفعل المضارع</b> يدل على حدث يحدث الآن أو سيحدث، ويبدأ بأحد حروف «أنيت»: يَكْتُبُ.<br><b>فعل الأمر</b> يدل على طلب: اكْتُبْ.</div>'
    rows = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td class="ar" style="font-size:15pt">{v}</td>' + ''.join(f'<td style="text-align:center;width:24mm"><span class="opt">{t}</span></td>' for t in ['ماضٍ', 'مضارع', 'أمر']) + '</tr>' for i, (v, _) in enumerate(V))
    P = [('الفعل: ماضٍ ومضارع وأمر', 'اقرأ التعريفات ثم ضع دائرة حول نوع كل فعل.', ex + f'<table style="margin-top:3mm"><tr><th>#</th><th>الفعل</th><th colspan="3">نوعه</th></tr>{rows}</table>', 'ws')]
    T3 = [('ذَهَبَ', 'يَذْهَبُ', 'اذْهَبْ'), ('أَكَلَ', 'يَأْكُلُ', 'كُلْ'), ('فَتَحَ', 'يَفْتَحُ', 'افْتَحْ')]
    body = '<p class="ins">أكمل الجدول بالصيغة الناقصة:</p><table><tr><th>الماضي</th><th>المضارع</th><th>الأمر</th></tr>' + f'<tr><td class="ar">{T3[0][0]}</td><td class="ar">{T3[0][1]}</td><td><div class="ans" style="width:100%"></div></td></tr><tr><td class="ar">{T3[1][0]}</td><td><div class="ans" style="width:100%"></div></td><td class="ar">{T3[1][2]}</td></tr><tr><td><div class="ans" style="width:100%"></div></td><td class="ar">{T3[2][1]}</td><td class="ar">{T3[2][2]}</td></tr></table>'
    Q = [('أيّ هذه الأفعال فعل أمر؟', ['كَتَبَ', 'يَكْتُبُ', 'اكْتُبْ'], 'اكْتُبْ'), ('أيّ هذه الأفعال ماضٍ؟', ['لَعِبَ', 'يَلْعَبُ', 'العَبْ'], 'لَعِبَ'), ('أيّ هذه الأفعال مضارع؟', ['قَرَأَ', 'يَقْرَأُ', 'اقْرَأْ'], 'يَقْرَأُ')]
    body += '<div style="height:4mm"></div>' + mcq(Q).replace('class="bx"', 'class="bx ar"')
    P.append(('أكمل الجدول وأختار', 'انتبه لشكل الفعل في كل زمن.', body, 'ws'))
    SS = [('<b>كَتَبَ</b> الطالبُ الدرسَ.', 'ماضٍ'), ('<b>يَلْعَبُ</b> الأولادُ في الحديقةِ.', 'مضارع'), ('<b>اجْلِسْ</b> في مكانِكَ.', 'أمر'), ('<b>قَرَأَتْ</b> سارةُ القصةَ.', 'ماضٍ'), ('<b>اكْتُبْ</b> اسمَكَ على الدفترِ.', 'أمر')]
    body = '<p class="ins">اقرأ كل جملة، وحدّد زمن الفعل الغامق:</p>' + ''.join(f'<div class="bx ar" style="font-size:14pt"><b>{i+1})</b> {t}<br>{chips(["ماضٍ", "مضارع", "أمر"])}</div>' for i, (t, _) in enumerate(SS))
    P.append(('زمن الفعل في الجملة', 'انتبه: الأمر طلب، والماضي انتهى، والمضارع يبدأ بأحد حروف «أنيت».', body, 'ws'))
    key = '<p><b>الصفحة 2:</b> ' + '، '.join(f'({i+1}) {t}' for i, (_, t) in enumerate(V)) + '.</p><p><b>الجدول:</b> أمر «ذَهَبَ»: اذْهَبْ. مضارع «أَكَلَ»: يَأْكُلُ. ماضي «يَفْتَحُ»: فَتَحَ.</p>' + K('الاختيار', [a for *_, a in Q]) + K('زمن الفعل في الجملة', [a for _, a in SS])
    return fin(S5('g5-verb-tenses', 'الفعل: ماضٍ ومضارع وأمر', 'أميّز أنواع الفعل وأحوّل بينها', ['الصف الخامس', 'اللغة العربية', 'النحو', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def ar6():
    C, T = '#ea580c', '#ffeadb'
    S_ = [('الماءُ ضروريٌّ للحياةِ.', 'خبرية'), ('هل ذاكرتَ دروسَكَ؟', 'استفهام'), ('اجلسْ بهدوءٍ.', 'أمر'), ('لا تُهملْ واجبَكَ.', 'نهي'), ('ما أجملَ الربيعَ!', 'تعجب'), ('ما اسمُكَ؟', 'استفهام'), ('اكتبْ الدرسَ.', 'أمر'), ('لا تكذبْ.', 'نهي')]
    ex = '<div class="bx" style="line-height:2">الخبرية: تُخبر بشيء. &nbsp; الاستفهام: يسأل. &nbsp; الأمر: يطلب فعل شيء. &nbsp; النهي: يطلب ترك شيء. &nbsp; التعجب: يعبّر عن الدهشة.</div>'
    rows = ''.join(f'<tr><td style="text-align:center;width:10mm">{i+1}</td><td class="ar" style="font-size:14pt">{s}</td><td>' + ''.join(f'<span class="opt" style="font-size:11pt">{t}</span>' for t in ['خبرية', 'استفهام', 'أمر', 'نهي', 'تعجب']) + '</td></tr>' for i, (s, _) in enumerate(S_))
    P = [('أنواع الجمل', 'اقرأ ثم ضع دائرة حول نوع كل جملة.', ex + f'<table style="margin-top:3mm"><tr><th>#</th><th>الجملة</th><th>نوعها</th></tr>{rows}</table>', 'ws')]
    W = [('هل أنتَ جاهزٌ', '؟'), ('ما أجملَ السماءَ', '!'), ('الطقسُ باردٌ اليومَ', '.'), ('كم عمرُكَ', '؟'), ('ما أروعَ هذا المنظرَ', '!'), ('ذهبَ الطلابُ إلى الملعبِ', '.')]
    body = '<p class="ins">اكتب علامة الترقيم المناسبة في آخر الجملة ( . أو ؟ أو ! ):</p>' + ''.join(f'<div class="bx ar" style="font-size:14pt"><b>{i+1})</b> {s} <span class="opt" style="min-width:12mm;height:9mm"></span></div>' for i, (s, _) in enumerate(W))
    P.append(('علامة نهاية الجملة', 'الجملة الخبرية تنتهي بنقطة، والاستفهام بعلامة استفهام، والتعجب بعلامة تعجب.', body, 'ws'))
    body = '<p class="ins">اكتب جملة من إنشائك لكل نوع:</p><div class="bx ar" style="line-height:3.2">جملة خبرية: ' + ans_line(90) + '<br>جملة استفهامية: ' + ans_line(85) + '<br>جملة أمر: ' + ans_line(100) + '<br>جملة نهي: ' + ans_line(100) + '<br>جملة تعجب: ' + ans_line(95) + '</div>'
    P.append(('أكتب جملي', 'استعمل علامة الترقيم المناسبة في آخر كل جملة.', body, 'ws'))
    key = K('أنواع الجمل', [t for _, t in S_]) + K('علامات الترقيم', [e for _, e in W]) + '<p>صفحة كتابة الجمل: الإجابة حرّة بشرط مطابقة نوع الجملة وعلامتها.</p>'
    return fin(S5('g6-sentence-types', 'أنواع الجمل', 'الخبر والاستفهام والأمر والنهي والتعجب', ['الصف السادس', 'اللغة العربية', 'النحو والأساليب', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

ALL.update(math5=math5, math6=math6, ar5=ar5, ar6=ar6)
