# -*- coding: utf-8 -*-
# توسعة: علوم 4 و5، إنجليزي 2 و5
from libspecs9 import *
from libspecs3 import _h

def sci4b():
    C, T = '#d97706', '#fff0d6'
    it = [('زجاج النافذة', 'يمرّ'), ('لوح خشبي', 'لا يمرّ'), ('ماء صافٍ', 'يمرّ'), ('كتاب', 'لا يمرّ'), ('علبة معدنية', 'لا يمرّ'), ('كيس بلاستيك شفاف', 'يمرّ')]
    rows = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td style="font-size:14pt">{w}</td>' + ''.join('<td style="text-align:center;width:30mm"><span class="opt" style="min-width:12mm;height:9mm"></span></td>' for _ in range(2)) + '</tr>' for i, (w, _) in enumerate(it))
    P = [('الضوء والمواد', 'الضوء ينتقل في خطوط مستقيمة. بعض المواد يمرّ الضوء من خلالها (شفافة) وبعضها لا يمرّ (معتمة). ضع علامة.', f'<table><tr><th>#</th><th>المادة</th><th>يمرّ الضوء</th><th>لا يمرّ</th></tr>{rows}</table>', 'ws')]
    body = f'<p class="ins">يتكوّن الظل عندما يعترض جسم معتم طريق الضوء. أكمل بكلمة من الصندوق:</p><div class="bx" style="text-align:center">{chips(["مستقيمة", "معتم", "خلف", "الشمس"])}</div><div class="bx" style="line-height:2.6">١) الضوء ينتقل في خطوط {ans_line(28)}.<br>٢) يتكوّن الظل عندما يعترض جسم {ans_line(28)} الضوء.<br>٣) يظهر الظل {ans_line(28)} الجسم بعيدًا عن مصدر الضوء.<br>٤) من مصادر الضوء الطبيعية {ans_line(28)}.</div><p class="ins" style="margin-top:4mm">ارسم شخصًا واقفًا في الشمس وظلّه:</p><div class="q" style="min-height:60mm"></div>'
    P.append(('كيف يتكوّن الظل؟', 'استعمل الكلمات التي تعلّمتها.', body, 'ws'))
    t = [('الضوء ينتقل في خطوط مستقيمة.', 'صح'), ('الظل يتكوّن خلف الجسم المعتم.', 'صح'), ('الزجاج الشفاف يمنع مرور الضوء تمامًا.', 'خطأ'), ('الشمس مصدر طبيعي للضوء.', 'صح'), ('يكون الظل أطول في الصباح الباكر وقبل الغروب.', 'صح')]
    P.append(('صح أم خطأ؟', 'اقرأ العبارة واختر.', tf(t), 'ws'))
    key = K('الصفحة 2', [a for _, a in it]) + '<p>الصفحة 3: (١) مستقيمة (٢) معتم (٣) خلف (٤) الشمس. الرسم حرّ.</p>' + K('الصفحة 4', [a for _, a in t]) + '<p>الزجاج الشفاف يسمح بمرور الضوء.</p>'
    return fin(S5('g4-light-and-shadow', 'الضوء والظل', 'مرور الضوء في المواد وتكوّن الظل', ['الصف الرابع', 'العلوم', 'الضوء', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def sci5b():
    C, T = '#4f46e5', '#e6e7ff'
    O = [('2600', 'الشمس', 'نجم'), ('x_earth', 'الأرض', 'كوكب'), ('1f319', 'القمر', 'تابع طبيعي للأرض'), ('x_saturn', 'زحل', 'كوكب له حلقات')]
    P = [('المجموعة الشمسية', 'تضمّ الشمس وثمانية كواكب وأقمارها. تعرّف على بعضها.', tiles([(a, f'<b>{n}</b><br>{d}') for a, n, d in O], 2, 30), 'ws')]
    pl = ['عطارد', 'الزهرة', 'الأرض', 'المريخ']
    body = '<p class="ins">أقرب الكواكب إلى الشمس بالترتيب: عطارد، الزهرة، الأرض، المريخ، المشتري، زحل، أورانوس، نبتون.</p><p class="ins">رقّم هذه الكواكب (1 للأقرب إلى الشمس):</p>' + order_rows(shuf(pl, 9)) + '<p class="ins" style="margin-top:4mm">صِل كل جسم بوصفه:</p>' + line_match(['الشمس', 'الأرض', 'القمر'], shuf(['تابع طبيعي للأرض', 'نجم', 'كوكب نعيش عليه'], 3))
    P.append(('أرتّب وأصِل', 'استعمل الترتيب المكتوب في الأعلى.', body, 'ws'))
    t = [('الشمس كوكب.', 'خطأ'), ('عدد كواكب المجموعة الشمسية ثمانية.', 'صح'), ('القمر يدور حول الأرض.', 'صح'), ('الأرض هي الكوكب الثالث بعد الشمس.', 'صح'), ('زحل له حلقات.', 'صح')]
    P.append(('صح أم خطأ؟', 'اقرأ العبارة واختر.', tf(t), 'ws'))
    key = '<p><b>الترتيب:</b> ' + ' ← '.join(f'{i+1}) {p}' for i, p in enumerate(pl)) + '</p><p><b>التوصيل:</b> الشمس ← نجم، الأرض ← كوكب نعيش عليه، القمر ← تابع طبيعي للأرض.</p>' + K('صح وخطأ', [a for _, a in t]) + '<p>الشمس نجم وليست كوكبًا.</p>'
    return fin(S5('g5-solar-system', 'المجموعة الشمسية', 'الشمس والكواكب والقمر', ['الصف الخامس', 'العلوم', 'الفضاء', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def en5b():
    C, T = '#0d9488', '#dcf7f2'
    pr = [('in', 'داخل'), ('on', 'فوق / على سطح'), ('under', 'تحت'), ('next to', 'بجانب'), ('in front of', 'أمام'), ('behind', 'خلف')]
    body = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4mm">' + ''.join(f'<div class="q" style="flex-direction:column;justify-content:center;gap:1mm;min-height:30mm"><div style="font-size:18pt">{EN(w)}</div><div style="font-size:12pt;color:#6d6684">{a}</div></div>' for w, a in pr) + '</div>'
    P = [('Prepositions of place', 'حروف الجر تبيّن مكان الشيء. تعرّف عليها.', body, 'ws')]
    Q = [('The cat is ___ the table. (تحت)', ['under', 'on', 'in'], 'under'), ('The book is ___ the desk. (فوق)', ['in', 'on', 'behind'], 'on'), ('The milk is ___ the fridge. (داخل)', ['in', 'under', 'on'], 'in'),
         ('The garden is ___ the house. (خلف)', ['behind', 'on', 'in'], 'behind'), ('Ali sits ___ Omar. (بجانب)', ['under', 'next to', 'in'], 'next to'), ('The car is ___ the school. (أمام)', ['in front of', 'behind', 'in'], 'in front of')]
    P.append(('Choose the preposition', 'اقرأ الجملة وانتبه للمعنى بين القوسين.', eng_choice(Q), 'ws'))
    U = [('the / the / bag / is / on / chair', 'The bag is on the chair.'), ('under / is / dog / the / table / the', 'The dog is under the table.'), ('in / pen / my / is / the / box', 'My pen is in the box.')]
    body = '<p class="ins">رتّب الكلمات لتكوّن جملة صحيحة:</p>' + ''.join(f'<div class="bx"><b>{i+1})</b> ' + LR(EN(w)) + '<br>' + LR(ans_line(120)) + '</div>' for i, (w, _) in enumerate(U))
    P.append(('Make a sentence', 'ابدأ الجملة بحرف كبير وانتهِ بنقطة.', body, 'ws'))
    key = K('Page 3', [EN(a) for *_, a in Q]) + K('Page 4', [EN(a) for _, a in U])
    return fin(S5('g5-english-prepositions', 'Prepositions of place', 'حروف الجر: in, on, under, next to, in front of, behind', ['الصف الخامس', 'اللغة الإنجليزية', 'القواعد', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def en2b():
    C, T = '#ea580c', '#ffeadb'
    N = [(1, 'one', 'واحد'), (2, 'two', 'اثنان'), (3, 'three', 'ثلاثة'), (4, 'four', 'أربعة'), (5, 'five', 'خمسة'), (6, 'six', 'ستة'), (7, 'seven', 'سبعة'), (8, 'eight', 'ثمانية'), (9, 'nine', 'تسعة'), (10, 'ten', 'عشرة')]
    body = '<div style="display:grid;direction:ltr;grid-template-columns:repeat(5,1fr);gap:3mm">' + ''.join(f'<div class="q" style="flex-direction:column;justify-content:center;gap:1mm;min-height:36mm"><div style="font-size:30pt;font-weight:700;color:{C}" dir="ltr">{n}</div><div style="font-size:15pt">{EN(w)}</div><div style="font-size:11pt;color:#6d6684">{a}</div></div>' for n, w, a in N) + '</div>'
    P = [('Numbers 1 – 10', 'اقرأ الأرقام وردّد أسماءها بالإنجليزية.', body, 'ws')]
    sel = [N[i] for i in (2, 6, 0, 8, 4, 9)]
    right = shuf([w for _, w, _ in sel], 5)
    P.append(('Match', 'صِل كل رقم باسمه.', line_match([f'<span dir="ltr" style="font-size:20pt;font-weight:700">{n}</span>' for n, _, _ in sel], [EN(w) for w in right]), 'ws'))
    sel2 = [N[i] for i in (3, 1, 7, 5, 9, 4)]
    wb = f'<p class="ins">{chips([EN(w) for _, w, _ in sorted(sel2, key=lambda x: x[1])])}</p>'
    body = wb + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm">' + ''.join('<div class="q" style="min-height:24mm">' + LR(f'<span style="font-size:24pt;font-weight:700" dir="ltr">{n} →</span>', ans_line(40)) + '</div>' for n, _, _ in sel2) + '</div>'
    P.append(('Write the number word', 'اكتب اسم الرقم من الصندوق.', body, 'ws'))
    key = K('Page 3', [EN(f'{n} = {w}') for n, w, _ in sel]) + K('Page 4', [EN(w) for _, w, _ in sel2])
    return fin(S5('g2-english-numbers-1-10', 'Numbers 1 – 10', 'الأرقام من 1 إلى 10 بالإنجليزية', ['الصف الثاني', 'اللغة الإنجليزية', 'المفردات', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

en5b, en2b = _h(en5b), _h(en2b)
ALL.update(sci4b=sci4b, sci5b=sci5b, en5b=en5b, en2b=en2b)
