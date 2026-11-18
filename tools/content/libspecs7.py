# -*- coding: utf-8 -*-
# توسعة: الصفوف 5 و6 (علوم وإنجليزي)
from libspecs6 import *
from libspecs3 import _h

def third(v):
    if v.endswith('y') and v[-2] not in 'aeiou': return v[:-1] + 'ies'
    if v.endswith(('s', 'sh', 'ch', 'x', 'o')): return v + 'es'
    return v + 's'
def past_reg(v):
    if v.endswith('e'): return v + 'd'
    if v.endswith('y') and v[-2] not in 'aeiou': return v[:-1] + 'ied'
    if v in ('stop', 'plan'): return v + v[-1] + 'ed'
    return v + 'ed'
def eng_choice(rows):
    return ''.join(f'<div class="bx"><b>{i+1})</b> ' + LR(EN(q), *[f'<span class="opt">{EN(o)}</span>' for o in os_]) + '</div>' for i, (q, os_, _) in enumerate(rows))

def en5():
    C, T = '#7c3aed', '#efe6ff'
    rule = ('<div class="bx" style="line-height:2.3">' + f'{EN("I / you / we / they + play")}<br>{EN("he / she / it + plays")} &nbsp; (نضيف s)<br>{EN("watch → watches ، go → goes")} &nbsp; (بعد s, sh, ch, x, o نضيف es)<br>{EN("study → studies")} &nbsp; (حرف ساكن + y نحوّل y إلى ies)</div>')
    V = ['play', 'watch', 'study', 'go', 'wash', 'eat']
    body = rule + '<p class="ins" style="margin-top:4mm">اكتب الفعل مع he / she / it:</p>' + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm">' + ''.join(f'<div class="q">' + LR(EN(f'{v} →'), ans_line(30)) + '</div>' for v in V) + '</div>'
    P = [('Simple present: he / she / it', 'في المضارع البسيط نضيف s أو es للفعل مع he / she / it.', body, 'ws')]
    S_ = [('She ___ to school every day.', ['go', 'goes'], 'goes'), ('They ___ football on Friday.', ['play', 'plays'], 'play'), ('He ___ his hands before lunch.', ['wash', 'washes'], 'washes'),
          ('My mother ___ in the kitchen.', ['cook', 'cooks'], 'cooks'), ('We ___ English at school.', ['study', 'studies'], 'study'), ('The cat ___ milk.', ['drink', 'drinks'], 'drinks')]
    P.append(('Choose the correct verb', 'اختر الفعل الصحيح.', eng_choice(S_), 'ws'))
    U = [('school / goes / to / he', 'He goes to school.'), ('watch / they / TV', 'They watch TV.'), ('she / apples / eats', 'She eats apples.'), ('plays / Ali / football', 'Ali plays football.')]
    body = '<p class="ins">رتّب الكلمات لتكوّن جملة صحيحة:</p>' + ''.join(f'<div class="bx"><b>{i+1})</b> ' + LR(EN(w)) + '<br>' + LR(ans_line(120)) + '</div>' for i, (w, _) in enumerate(U))
    P.append(('Make a sentence', 'ابدأ كل جملة بحرف كبير وانتهِ بنقطة.', body, 'ws'))
    key = K('Page 2', [EN(third(v)) for v in V]) + K('Page 3', [EN(a) for *_, a in S_]) + K('Page 4', [EN(a) for _, a in U])
    return fin(S5('g5-english-simple-present', 'Simple present', 'المضارع البسيط: s و es مع he / she / it', ['الصف الخامس', 'اللغة الإنجليزية', 'القواعد', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def en6():
    C, T = '#0891b2', '#dcf4fa'
    reg = ['play', 'walk', 'like', 'study', 'stop', 'open']
    rule = ('<div class="bx" style="line-height:2.3">' + f'{EN("walk → walked")} &nbsp; (نضيف ed)<br>{EN("like → liked")} &nbsp; (إذا انتهى الفعل بـ e نضيف d)<br>{EN("study → studied")} &nbsp; (حرف ساكن + y نحوّل y إلى ied)<br>{EN("stop → stopped")} &nbsp; (نكرّر الحرف الأخير)</div>')
    body = rule + '<p class="ins" style="margin-top:4mm">اكتب الماضي لكل فعل:</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm">' + ''.join('<div class="q">' + LR(EN(f'{v} →'), ans_line(30)) + '</div>' for v in reg) + '</div>'
    P = [('Simple past: regular verbs', 'الأفعال المنتظمة تأخذ ed في الماضي.', body, 'ws')]
    irr = [('go', 'went'), ('eat', 'ate'), ('see', 'saw'), ('have', 'had'), ('make', 'made'), ('come', 'came')]
    right = shuf([p for _, p in irr], 9)
    P.append(('Irregular verbs', 'هذه أفعال ماضيها خاص نحفظه. صِل الفعل بماضيه.', line_match([EN(b) for b, _ in irr], [EN(x) for x in right]), 'ws'))
    Q = [('Yesterday I ___ to the park.', ['go', 'went'], 'went'), ('She ___ the door.', ['opened', 'open'], 'opened'), ('We ___ a movie last night.', ['saw', 'see'], 'saw'), ('He ___ football yesterday.', ['played', 'play'], 'played'), ('They ___ lunch at two.', ['had', 'have'], 'had')]
    P.append(('Choose the past form', 'الكلمات yesterday و last night تدل على الماضي.', eng_choice(Q), 'ws'))
    ans2 = [f'{b} → {p}' for b, p in irr]
    key = K('Page 2', [EN(past_reg(v)) for v in reg]) + K('Page 3', [EN(a) for a in ans2]) + K('Page 4', [EN(a) for *_, a in Q])
    return fin(S5('g6-english-simple-past', 'Simple past', 'الماضي البسيط: ed والأفعال الشاذة', ['الصف السادس', 'اللغة الإنجليزية', 'القواعد', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def sci5():
    C, T = '#0891b2', '#dcf4fa'
    st = [('2600', 'التبخّر', 'تسخّن الشمس ماء البحار فيتحوّل إلى بخار ويصعد إلى الأعلى.'), ('2601', 'التكاثف', 'يبرد بخار الماء في الأعلى فيتحوّل إلى قطرات صغيرة تكوّن السحاب.'),
          ('1f327', 'الهطول', 'تكبر القطرات في السحاب وتسقط على الأرض مطرًا أو ثلجًا.'), ('x_water', 'التجمّع', 'يجتمع الماء في الأنهار والبحار والبحيرات ثم تعود دورة الماء من جديد.')]
    body = '<p class="ins">دورة الماء في الطبيعة أربع مراحل:</p>' + ''.join(f'<div class="bx" style="display:flex;align-items:center;gap:5mm">{I(a, 20)}<div style="font-size:14pt"><b style="color:{C}">{i+1}) {n}</b><br>{d}</div></div>' for i, (a, n, d) in enumerate(st))
    P = [('دورة الماء', 'اقرأ مراحل دورة الماء وانظر إلى الصور.', body, 'ws')]
    names = [n for _, n, _ in st]
    body = '<p class="ins">رقّم المراحل من 1 إلى 4 حسب ترتيبها في الدورة بدءًا من تسخين الشمس للماء:</p>' + order_rows(shuf(names, 5))
    P.append(('أرتّب المراحل', 'اكتب الرقم في المربع.', body, 'ws'))
    right = shuf([n for _, n, _ in st], 2)
    desc = [d for *_, d in [(a, n, d) for a, n, d in st]]
    short = ['الماء يصبح بخارًا ويصعد', 'البخار يبرد ويكوّن السحاب', 'المطر أو الثلج يسقط على الأرض', 'الماء يجتمع في البحار والأنهار']
    P.append(('أصِل المرحلة بوصفها', 'صِل كل وصف بالمرحلة التي تناسبه.', line_match(short, shuf(names, 4)) , 'ws'))
    t = [('الشمس هي مصدر الحرارة الذي يبخّر الماء.', 'صح'), ('التكاثف يحدث عندما يسخن بخار الماء.', 'خطأ'), ('المطر والثلج من أشكال الهطول.', 'صح')]
    P.append(('صح أم خطأ؟', 'اختر الإجابة الصحيحة.', tf(t), 'ws'))
    key = '<p><b>الترتيب:</b> ' + ' ← '.join(f'{i+1}) {n}' for i, n in enumerate(names)) + '</p><p><b>التوصيل:</b> ' + '، '.join(f'{s} ← {n}' for s, n in zip(short, names)) + '</p>' + K('صح وخطأ', [a for _, a in t]) + '<p>التكاثف يحدث عندما يبرد بخار الماء وليس عندما يسخن.</p>'
    return fin(S5('g5-science-water-cycle', 'دورة الماء', 'التبخّر والتكاثف والهطول والتجمّع', ['الصف الخامس', 'العلوم', 'الماء', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def sci6():
    C, T = '#ea580c', '#ffeadb'
    it = [('x_nail', 'مسمار حديدي', 'موصل'), ('x_coin', 'عملة معدنية', 'موصل'), ('x_paper', 'ورقة', 'عازل'), ('x_pbottle', 'زجاجة بلاستيك', 'عازل')]
    P = [('موصلات وعوازل', 'المادة الموصلة تسمح بمرور الكهرباء (مثل المعادن)، والعازلة تمنعها (مثل البلاستيك والورق والخشب والمطاط).', tiles([(a, f'<b>{n}</b><br>{chips(["موصل", "عازل"])}') for a, n, _ in it], 2, 26), 'ws')]
    W = [('سلك نحاسي', 'موصل'), ('قطعة خشب', 'عازل'), ('قطعة مطاط', 'عازل'), ('ورق ألمنيوم', 'موصل')]
    rows = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td style="font-size:14pt">{w}</td>' + ''.join('<td style="text-align:center;width:28mm"><span class="opt" style="min-width:12mm;height:9mm"></span></td>' for _ in range(2)) + '</tr>' for i, (w, _) in enumerate(W))
    P.append(('أصنّف المواد', 'ضع علامة في الخانة المناسبة لكل مادة.', f'<table><tr><th>#</th><th>المادة</th><th>موصل</th><th>عازل</th></tr>{rows}</table>', 'ws'))
    qs = [('لماذا تُغطّى أسلاك الكهرباء بالبلاستيك؟', ['لأنه عازل', 'لأنه موصل جيد', 'لأنه ثقيل'], 'لأنه عازل'), ('أيّ من هذه يلزم لتشغيل مصباح بسيط؟', ['بطارية وأسلاك', 'ورقة وحجر', 'ماء وسكر'], 'بطارية وأسلاك'), ('أيّ تصرّف من هذه خطير؟', ['نلمس المقابس بأيدٍ مبللة', 'نطلب مساعدة شخص كبير', 'نبتعد عن الأسلاك المكشوفة'], 'نلمس المقابس بأيدٍ مبللة')]
    P.append(('الكهرباء وسلامتنا', 'ضع دائرة حول الإجابة الصحيحة.', mcq(qs), 'ws'))
    key = K('الصفحة 2', [f'{n}: {a}' for _, n, a in it]) + K('الصفحة 3', [f'{w}: {a}' for w, a in W]) + K('الصفحة 4', [a for *_, a in qs])
    return fin(S5('g6-science-conductors-insulators', 'الموصلات والعوازل', 'أي المواد تمرّر الكهرباء وأيها تمنعها؟', ['الصف السادس', 'العلوم', 'الكهرباء', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

en5, en6 = _h(en5), _h(en6)
ALL.update(en5=en5, en6=en6, sci5=sci5, sci6=sci6)
