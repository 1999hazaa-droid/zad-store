# -*- coding: utf-8 -*-
# توسعة: مهارات حياتية 1 و2، علوم 6، إنجليزي 6
from libspecs10 import *
from libspecs3 import _h

def ls2b():
    C, T = '#db2777', '#fde7f1'
    F = [('1f604', 'فرحان'), ('1f622', 'حزين'), ('1f620', 'غاضب'), ('1f628', 'خائف'), ('1f634', 'نعسان'), ('1f914', 'أفكّر')]
    P = [('مشاعري', 'كل الناس يشعرون بمشاعر مختلفة. تعرّف عليها.', tiles([(a, f'<b>{n}</b>') for a, n in F], 3, 26), 'ws')]
    Q = [('حصلتُ على هدية جميلة، فأشعر أنني…', ['فرحان', 'حزين', 'خائف'], 'فرحان'), ('ضاعت لعبتي المفضّلة، فأشعر أنني…', ['فرحان', 'حزين', 'نعسان'], 'حزين'), ('أخذ أخي لعبتي دون إذن، فأشعر أنني…', ['غاضب', 'نعسان', 'فرحان'], 'غاضب'), ('سمعتُ صوتًا عاليًا ومفاجئًا، فأشعر أنني…', ['خائف', 'فرحان', 'غاضب'], 'خائف')]
    P.append(('ماذا أشعر؟', 'ضع دائرة حول الشعور المناسب.', mcq(Q), 'ws'))
    t = [('أتنفّس بهدوء عندما أغضب.', 'صح'), ('أضرب من أغضبني.', 'خطأ'), ('أخبر شخصًا كبيرًا بما أشعر به.', 'صح'), ('أصرخ على الجميع عندما أغضب.', 'خطأ')]
    body = tf(t) + '<p class="ins" style="margin-top:5mm">ارسم وجهك عندما تكون سعيدًا:</p><div class="q" style="min-height:60mm"></div>'
    P.append(('كيف أتصرّف؟', 'اختر صح أو خطأ ثم ارسم.', body, 'ws'))
    key = K('ماذا أشعر', [a for *_, a in Q]) + K('كيف أتصرّف', [a for _, a in t]) + '<p>الرسم حرّ.</p>'
    return fin(S5('g2-my-feelings', 'مشاعري', 'أتعرّف على مشاعري وأتصرّف بهدوء', ['الصف الثاني', 'المهارات الحياتية', 'المشاعر', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def ls1b():
    C, T = '#0891b2', '#dcf4fa'
    Q = [('أعطاني صديقي قلمًا، فأقول له…', ['شكرًا', 'من فضلك', 'آسف'], 'شكرًا'), ('أريد كوب ماء، فأقول…', ['من فضلك أعطني ماءً', 'أعطني ماءً', 'لا أريد'], 'من فضلك أعطني ماءً'), ('دخلتُ البيت، فأقول…', ['السلام عليكم', 'لا شيء', 'وداعًا'], 'السلام عليكم'), ('أخطأتُ في حق صديقي، فأقول…', ['آسف', 'لا يهمّني', 'أنت المخطئ'], 'آسف')]
    P = [('الكلمات الجميلة', 'نستعمل كلمات جميلة مع الناس. اختر الكلمة المناسبة.', mcq(Q), 'ws')]
    W = ['شكرًا', 'من فضلك', 'آسف']; S_ = ['عندما يساعدني أحد', 'عندما أطلب شيئًا', 'عندما أخطئ']
    body = '<p class="ins">صِل كل كلمة بالموقف المناسب:</p>' + line_match(W, shuf(S_, 2))
    pairs = dict(zip(W, S_))
    P.append(('أصِل الكلمة بموقفها', 'اقرأ بعناية ثم صِل بخط.', body, 'ws'))
    t = [('أقول «شكرًا» لمن يساعدني.', 'صح'), ('أقول «من فضلك» عندما أطلب شيئًا.', 'صح'), ('لا أعتذر أبدًا إذا أخطأت.', 'خطأ')]
    body = tf(t) + '<p class="ins" style="margin-top:5mm">ارسم موقفًا قلتَ فيه كلمة جميلة:</p><div class="q" style="min-height:60mm"></div>'
    P.append(('صح أم خطأ؟', 'اختر الإجابة ثم ارسم.', body, 'ws'))
    key = K('الكلمات الجميلة', [a for *_, a in Q]) + '<p><b>التوصيل:</b> ' + '، '.join(f'{w} ← {pairs[w]}' for w in W) + '</p>' + K('صح وخطأ', [a for _, a in t]) + '<p>الرسم حرّ.</p>'
    return fin(S5('g1-polite-words', 'كلماتي الجميلة', 'أتعلّم شكرًا ومن فضلك وآسف والسلام', ['الصف الأول', 'المهارات الحياتية', 'الآداب', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def sci6b():
    C, T = '#ca8a04', '#fdf3cf'
    forms = ['حرارية', 'ضوئية', 'صوتية', 'كهربائية', 'حركية']
    it = [('x_hand', 'المدفأة', 'حرارية')] if False else [('1f4a1', 'المصباح المضيء', 'ضوئية'), ('1f941', 'الطبل', 'صوتية'), ('1f697', 'السيارة المتحرّكة', 'حركية')]
    ex = [('المدفأة', 'حرارية'), ('الأسلاك التي يمرّ فيها التيار', 'كهربائية')]
    rows = [(a, n, f) for a, n, f in it]
    cells = ''.join(f'<div class="bx" style="display:flex;align-items:center;gap:5mm">{I(a, 18)}<div style="font-size:14pt"><b>{i+1}) {n}</b><br>{chips(forms)}</div></div>' for i, (a, n, f) in enumerate(rows))
    cells += ''.join(f'<div class="bx" style="font-size:14pt"><b>{i+4}) {n}</b><br>{chips(forms)}</div>' for i, (n, f) in enumerate(ex))
    P = [('أشكال الطاقة', 'للطاقة أشكال كثيرة: حرارية وضوئية وصوتية وكهربائية وحركية. حدّد شكل الطاقة في كل مثال.', cells, 'ws')]
    t = [('الطاقة تتحوّل من شكل إلى آخر.', 'صح'), ('المصباح الكهربائي يحوّل الطاقة الكهربائية إلى ضوئية.', 'صح'), ('الصوت ينتج عن اهتزاز.', 'صح'), ('الشمس مصدر الطاقة الأساسي على الأرض.', 'صح'), ('الطاقة الحرارية لا تنتقل أبدًا.', 'خطأ')]
    P.append(('صح أم خطأ؟', 'اقرأ العبارة واختر.', tf(t), 'ws'))
    D = ['المصباح', 'المدفأة الكهربائية', 'مكبّر الصوت']; R = ['كهربائية ← ضوئية', 'كهربائية ← حرارية', 'كهربائية ← صوتية']
    body = '<p class="ins">صِل كل جهاز بتحوّل الطاقة فيه:</p>' + line_match(D, shuf(R, 6))
    P.append(('تحوّلات الطاقة', 'الأجهزة تحوّل الطاقة من شكل إلى آخر.', body, 'ws'))
    key = K('الصفحة 2', [f for *_, f in rows] + [f for _, f in ex]) + K('الصفحة 3', [a for _, a in t]) + '<p>الطاقة الحرارية تنتقل من الأجسام الساخنة إلى الباردة.</p><p><b>التوصيل:</b> ' + '، '.join(f'{d} ← {r}' for d, r in zip(D, R)) + '</p>'
    return fin(S5('g6-energy-forms', 'أشكال الطاقة', 'الطاقة الحرارية والضوئية والصوتية والكهربائية والحركية', ['الصف السادس', 'العلوم', 'الطاقة', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def comp(a):
    if a in ('beautiful', 'interesting', 'expensive', 'difficult'): return 'more ' + a
    if a.endswith('y'): return a[:-1] + 'ier'
    if a.endswith('e'): return a + 'r'
    if a in ('big', 'hot', 'fat', 'thin'): return a + a[-1] + 'er'
    return a + 'er'
def en6b():
    C, T = '#7c3aed', '#efe6ff'
    rule = ('<div class="bx" style="line-height:2.3">' + f'{EN("tall → taller than")} &nbsp; (كلمة قصيرة: نضيف er)<br>{EN("nice → nicer than")} &nbsp; (تنتهي بـ e: نضيف r)<br>{EN("big → bigger than")} &nbsp; (نكرّر الحرف الأخير)<br>{EN("happy → happier than")} &nbsp; (نحوّل y إلى ier)<br>{EN("beautiful → more beautiful than")} &nbsp; (كلمة طويلة: نضيف more)</div>')
    A = ['tall', 'fast', 'nice', 'big', 'happy', 'beautiful']
    body = rule + '<p class="ins" style="margin-top:4mm">اكتب صيغة المقارنة:</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm">' + ''.join('<div class="q">' + LR(EN(f'{a} →'), ans_line(34)) + '</div>' for a in A) + '</div>'
    P = [('Comparatives', 'نقارن بين شيئين باستعمال صيغة المقارنة وكلمة than.', body, 'ws')]
    Q = [('An elephant is ___ than a cat.', ['big', 'bigger'], 'bigger'), ('My brother is ___ than me.', ['tall', 'taller'], 'taller'), ('A car is ___ than a bike.', ['fast', 'faster'], 'faster'),
         ('This book is ___ than that one.', ['more interesting', 'interestinger'], 'more interesting'), ('Today is ___ than yesterday.', ['hot', 'hotter'], 'hotter')]
    P.append(('Choose the correct form', 'اختر الصيغة الصحيحة.', eng_choice(Q), 'ws'))
    U = [('than / is / faster / a / car / bike / a', 'A car is faster than a bike.'), ('is / than / taller / Ali / Omar', 'Ali is taller than Omar.'), ('happier / today / am / I / than / yesterday', 'I am happier today than yesterday.')]
    body = '<p class="ins">رتّب الكلمات لتكوّن جملة صحيحة:</p>' + ''.join(f'<div class="bx"><b>{i+1})</b> ' + LR(EN(w)) + '<br>' + LR(ans_line(120)) + '</div>' for i, (w, _) in enumerate(U))
    P.append(('Make a sentence', 'ابدأ بحرف كبير وانتهِ بنقطة.', body, 'ws'))
    key = K('Page 2', [EN(comp(a)) for a in A]) + K('Page 3', [EN(a) for *_, a in Q]) + K('Page 4', [EN(a) for _, a in U])
    return fin(S5('g6-english-comparatives', 'Comparatives', 'المقارنة بين شيئين: er و more وthan', ['الصف السادس', 'اللغة الإنجليزية', 'القواعد', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

en6b = _h(en6b)
ALL.update(ls2b=ls2b, ls1b=ls1b, sci6b=sci6b, en6b=en6b)
