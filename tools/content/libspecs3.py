# -*- coding: utf-8 -*-
# المرحلة 3: العلوم والإنجليزي للصفوف 2-4
from libspecs import *
I = lambda n, h=24: f'<img src="{IMGS}{n}.webp" style="height:{h}mm;max-width:100%;object-fit:contain">'
EN = lambda s: f'<span class="en" dir="ltr" style="unicode-bidi:isolate;font-weight:700">{s}</span>'
def tiles(items, cols=3, h=22):
    """items: list of (img, html_below)"""
    return f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);gap:4mm">' + ''.join(
        f'<div class="q" style="flex-direction:column;justify-content:center;text-align:center;min-height:{h+22}mm;gap:2mm;font-size:13pt"><span class="no" style="align-self:flex-start">{i+1}</span>{I(im, h)}<div>{b}</div></div>' for i, (im, b) in enumerate(items)) + '</div>'
LR = lambda *p: '<span dir="ltr" style="unicode-bidi:isolate;display:inline-flex;align-items:center;gap:3mm;flex-wrap:wrap">' + ''.join(p) + '</span>'
def chips(opts): return ''.join(f'<span class="opt">{o}</span>' for o in opts)
def ans_line(w=60): return f'<span class="ans" style="min-width:{w}mm"></span>'
def tf(items):
    return '<table><tr><th>#</th><th>العبارة</th><th style="width:30mm">صح</th><th style="width:30mm">خطأ</th></tr>' + ''.join(
        f'<tr><td style="text-align:center">{i+1}</td><td>{t}</td><td style="text-align:center"><span class="opt" style="min-width:12mm;height:9mm"></span></td><td style="text-align:center"><span class="opt" style="min-width:12mm;height:9mm"></span></td></tr>' for i, (t, _) in enumerate(items)) + '</table>'
def kv(title, pairs): return K(title, pairs)
def line_match(left, right):
    rows = ''.join(f'<div style="display:flex;justify-content:space-between;align-items:center;margin:4mm 0"><div class="bx" style="margin:0;min-width:62mm;text-align:center">{l}</div><div style="flex:1;border-bottom:.3mm dotted #b8b0d6;margin:0 3mm"></div><div class="bx" style="margin:0;min-width:62mm;text-align:center">{r}</div></div>' for l, r in zip(left, right))
    return rows

# ---------- علوم 2 ----------
def sci2():
    C, T = '#16a34a', '#e0f7e8'
    items = [('1f431', 'القطة', 'حي'), ('1f333', 'الشجرة', 'حي'), ('26bd', 'الكرة', 'غير حي'), ('1f697', 'السيارة', 'غير حي'),
             ('1f41f', 'السمكة', 'حي'), ('1f337', 'الوردة', 'حي'), ('1f388', 'البالون', 'غير حي'), ('1f438', 'الضفدع', 'حي')]
    P = [('كائن حي أم غير حي؟', 'الكائن الحي ينمو ويتغذى ويتنفّس ويتكاثر. ضع دائرة حول الإجابة الصحيحة.',
          tiles([(a, f'<b>{n}</b><br>{chips(["حي", "غير حي"])}') for a, n, _ in items], 4, 18), 'ws')]
    t = [('الكائنات الحية تحتاج إلى الماء والغذاء والهواء.', 'صح'), ('السيارة تحتاج إلى الطعام لتعيش.', 'خطأ'), ('النباتات كائنات حية.', 'صح'),
         ('الكرة تنمو وتكبر مع الوقت.', 'خطأ'), ('الحيوانات تتنفّس.', 'صح'), ('الصخرة تحتاج إلى الماء لتنمو.', 'خطأ')]
    P.append(('أضع علامة: صح أم خطأ؟', 'اقرأ كل عبارة وضع دائرة حول الإجابة المناسبة.', tf(t), 'ws'))
    body = (f'<p class="ins"><b>أ)</b> أكمل بكلمة من الصندوق: {chips(["الماء", "الهواء", "الغذاء"])}</p><div class="bx">١) النبات يحتاج إلى الضوء و{ans_line(28)} ليعيش.<br>٢) نتنفّس {ans_line(28)} من حولنا.<br>٣) القطة تحصل على {ans_line(28)} عندما تأكل.</div>'
            f'<p class="ins" style="margin-top:5mm"><b>ب)</b> ارسم كائنًا حيًّا في المربع الأول، وشيئًا غير حي في المربع الثاني:</p><div style="display:flex;gap:6mm"><div class="q" style="flex:1;min-height:60mm;justify-content:center">كائن حي</div><div class="q" style="flex:1;min-height:60mm;justify-content:center">شيء غير حي</div></div>')
    P.append(('أكمل وأرسم', 'استعمل ما تعلّمته عن الكائنات الحية.', body, 'ws'))
    key = K('الصفحة 2', [f'{n}: {a}' for _, n, a in items]) + K('الصفحة 3', [a for _, a in t]) + '<p>الصفحة 4: (١) الماء (٢) الهواء (٣) الغذاء. الرسم حرّ.</p>'
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', key, 'key'))
    return spec(slug='g2-living-nonliving', title='الكائنات الحية وغير الحية', subtitle='أصنّف، وأتعرّف على احتياجات الكائن الحي', chips=['الصف الثاني', 'العلوم', 'الكائنات الحية', 'مع الحلول'], color=C, tint=T, note='اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P

# ---------- علوم 3 ----------
def sci3():
    C, T = '#0891b2', '#dcf4fa'
    W = [('الحجر', 'صلب'), ('الماء', 'سائل'), ('الهواء', 'غاز'), ('العصير', 'سائل'), ('الكتاب', 'صلب'), ('بخار الماء', 'غاز'), ('الحليب', 'سائل'), ('القلم', 'صلب')]
    rows = ''.join(f'<tr><td style="text-align:center;width:12mm">{i+1}</td><td style="font-size:14pt">{w}</td>' + ''.join(f'<td style="text-align:center;width:24mm"><span class="opt" style="min-width:12mm;height:9mm"></span></td>' for _ in range(3)) + '</tr>' for i, (w, _) in enumerate(W))
    P = [('حالات المادة', 'المادة تكون صلبة أو سائلة أو غازية. ضع علامة في الخانة المناسبة لكل مادة.',
          f'<table><tr><th>#</th><th>المادة</th><th>صلب</th><th>سائل</th><th>غاز</th></tr>{rows}</table>', 'ws')]
    body = '<p class="ins">صِل كل حالة بخاصيتها المناسبة:</p>' + line_match(['المادة الصلبة', 'المادة السائلة', 'المادة الغازية'], ['تأخذ شكل الإناء الذي توضع فيه', 'تنتشر وتملأ المكان المتاح', 'لها شكل ثابت'])
    body += '<p class="ins" style="margin-top:6mm">اكتب مثالًا واحدًا لكل حالة من حياتك اليومية:</p><div class="bx">صلب: ' + ans_line(40) + ' &nbsp; سائل: ' + ans_line(40) + '<br>غاز: ' + ans_line(40) + '</div>'
    P.append(('خصائص الحالات الثلاث', 'اقرأ بعناية ثم صِل بخط.', body, 'ws'))
    ch = [('عند تسخين الثلج فإنه يتحوّل إلى', ['ماء', 'هواء', 'حجر'], 'ماء'), ('عند وضع الماء في المجمّد يتحوّل إلى', ['بخار', 'ثلج', 'عصير'], 'ثلج'), ('عند غلي الماء يتصاعد منه', ['بخار الماء', 'حجر', 'ثلج'], 'بخار الماء')]
    body = '<div style="display:flex;gap:6mm;justify-content:center;margin-bottom:5mm">' + f'<div style="text-align:center">{I("x_ice", 30)}<br><b>ثلج</b></div><div style="font-size:30pt;color:{C}">←</div><div style="text-align:center">{I("1f4a7", 30)}<br><b>ماء</b></div></div>'
    body += ''.join(f'<div class="bx"><b>{i+1})</b> {q} &nbsp; {chips(o)}</div>' for i, (q, o, _) in enumerate(ch))
    body += '<p class="ins" style="margin-top:4mm">ماذا يحدث لقطعة ثلج تُترك في الشمس؟ اكتب جملة:</p><div class="ans" style="width:100%"></div>'
    P.append(('تغيّر الحالة', 'عند التسخين أو التبريد قد تتغيّر حالة المادة.', body, 'ws'))
    key = K('الصفحة 2', [f'{w}: {a}' for w, a in W]) + '<p>الصفحة 3: المادة الصلبة ← لها شكل ثابت، السائلة ← تأخذ شكل الإناء، الغازية ← تنتشر وتملأ المكان. الأمثلة حرّة.</p>' + K('الصفحة 4', [a for _, _, a in ch]) + '<p>الجملة الأخيرة: تذوب قطعة الثلج وتتحوّل إلى ماء.</p>'
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', key, 'key'))
    return spec(slug='g3-states-of-matter', title='حالات المادة', subtitle='صلب وسائل وغاز، وتغيّر الحالة بالتسخين والتبريد', chips=['الصف الثالث', 'العلوم', 'المادة', 'مع الحلول'], color=C, tint=T, note='اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P

# ---------- علوم 4 ----------
def sci4():
    C, T = '#65a30d', '#eef8d8'
    chain = [('2600', 'الشمس'), ('1f33f', 'العشب'), ('1f430', 'الأرنب'), ('1f98a', 'الثعلب')]
    body = '<p class="ins">السلسلة الغذائية تبيّن من يأكل من. السهم يشير إلى من يتغذّى. اقرأ السلسلة:</p><div style="display:flex;align-items:center;justify-content:center;gap:3mm;margin:6mm 0">' + f'<span style="font-size:26pt;color:{C}">←</span>'.join(f'<div class="q" style="flex-direction:column;text-align:center;padding:3mm 4mm;font-size:13pt;font-weight:700">{I(a, 24)}{n}</div>' for a, n in chain[::-1]) + '</div>'
    body += '<div class="bx"><b>المنتِج:</b> نبات يصنع غذاءه بنفسه بمساعدة ضوء الشمس (مثل العشب).<br><b>المستهلِك:</b> كائن يحصل على غذائه بأكل غيره (مثل الأرنب والثعلب).</div>'
    body += '<p class="ins" style="margin-top:4mm">أجب:</p><div class="bx">١) من المنتِج في السلسلة؟ ' + ans_line(40) + '<br>٢) من يأكل الأرنب؟ ' + ans_line(40) + '<br>٣) من مصدر الطاقة الأول؟ ' + ans_line(40) + '</div>'
    P = [('السلسلة الغذائية', 'نتعرّف على المنتِج والمستهلِك.', body, 'ws')]
    A = [('1f430', 'الأرنب', 'آكل أعشاب'), ('1f404', 'البقرة', 'آكل أعشاب'), ('1f981', 'الأسد', 'آكل لحوم'), ('1f989', 'البومة', 'آكل لحوم'), ('1f43b', 'الدب', 'آكل أعشاب ولحوم'), ('1f414', 'الدجاجة', 'آكل أعشاب ولحوم')]
    P.append(('ماذا يأكل كل حيوان؟', 'ضع دائرة حول نوع غذاء كل حيوان.', tiles([(a, f'<b>{n}</b><br>{chips(["آكل أعشاب", "آكل لحوم", "آكل أعشاب ولحوم"])}') for a, n, _ in A], 2, 15).replace('class="opt"', 'class="opt" style="font-size:11pt;margin:1mm"'), 'ws'))
    body = '<p class="ins">رتّب كل سلسلة بوضع الأرقام (1، 2، 3) تحت الصور، من المنتِج إلى المستهلِك الأخير:</p>'
    seqs = [[('1f989', 'البومة', 3), ('1f33f', 'العشب', 1), ('1f430', 'الأرنب', 2)]]
    for s in seqs:
        body += '<div style="display:flex;justify-content:center;gap:8mm;margin:4mm 0">' + ''.join(f'<div class="q" style="flex-direction:column;text-align:center;font-size:13pt;font-weight:700;padding:3mm 5mm">{I(a, 24)}{n}<span class="ans" style="min-width:12mm"></span></div>' for a, n, _ in s) + '</div>'
    body += '<p class="ins" style="margin-top:4mm">فكّر: ماذا يحدث للثعلب إذا اختفت الأرانب من الغابة؟ اكتب إجابتك:</p><div class="ans" style="width:100%"></div><div class="ans" style="width:100%;margin-top:3mm"></div>'
    P.append(('أرتّب السلسلة وأفكّر', 'السلسلة تبدأ دائمًا بالمنتِج.', body, 'ws'))
    key = K('الصفحة 2', ['العشب', 'الثعلب', 'الشمس']) + K('الصفحة 3', [f'{n}: {a}' for _, n, a in A]) + '<p>الصفحة 4: العشب (1) ← الأرنب (2) ← البومة (3). قد يجوع الثعلب أو يبحث عن غذاء آخر؛ الإجابة حرّة إذا ذكرت أنه يتأثر.</p>'
    P.append(('الإجابات النموذجية', 'للمعلّم أو ولي الأمر.', key, 'key'))
    return spec(slug='g4-food-chains', title='السلاسل الغذائية', subtitle='المنتِج والمستهلِك وما تأكله الحيوانات', chips=['الصف الرابع', 'العلوم', 'السلاسل الغذائية', 'مع الحلول'], color=C, tint=T, note='اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P

# ---------- English 2 ----------
def en2():
    C, T = '#2563eb', '#e4edff'
    A = [('1f431', 'cat', ['cat', 'cot', 'cap']), ('1f436', 'dog', ['dig', 'dog', 'dot']), ('1f404', 'cow', ['cow', 'cob', 'cod']), ('1f986', 'duck', ['deck', 'dock', 'duck']),
         ('1f438', 'frog', ['frog', 'flag', 'fog']), ('1f981', 'lion', ['line', 'lion', 'loin']), ('1f411', 'sheep', ['ship', 'sheet', 'sheep']), ('1f437', 'pig', ['pig', 'peg', 'big'])]
    P = [('Animals: circle the word', 'انظر إلى الصورة وضع دائرة حول الكلمة الإنجليزية الصحيحة.', tiles([(a, '<br>'.join([''] ) + ' '.join(f'<span class="opt">{EN(w)}</span>' for w in o)) for a, _, o in A], 2, 14), 'ws')]
    M = [('1f431', 'c_t', 'a'), ('1f436', 'd_g', 'o'), ('1f404', 'c_w', 'o'), ('1f986', 'd_ck', 'u'), ('1f438', 'fr_g', 'o'), ('1f981', 'l_on', 'i')]
    P.append(('Missing letters', 'أكمل الحرف الناقص: a, e, i, o, u', tiles([(a, f'{EN(w)}<br>{ans_line(14)}') for a, w, _ in M], 3, 24), 'ws'))
    S = [('1f434', 'horse'), ('1f43b', 'bear'), ('1f414', 'hen'), ('1f41f', 'fish')]
    body = f'<p class="ins">اكتب اسم الحيوان من الصندوق: {chips([EN(w) for _, w in S])}</p>' + ''.join(f'<div class="bx" style="display:flex;align-items:center;gap:6mm">{I(a, 22)}<div style="font-size:15pt">{LR(EN("I can see a"), ans_line(40))}</div></div>' for a, _ in S)
    P.append(('I can see a ...', 'انظر إلى الصورة وأكمل الجملة.', body, 'ws'))
    key = K('Page 2', [EN(w) for _, w, _ in A]) + K('Page 3', [EN(w.replace('_', l)) for _, w, l in M]) + K('Page 4', [EN(w) for _, w in S])
    P.append(('Answer key', 'للمعلّم أو ولي الأمر.', key, 'key'))
    return spec(slug='g2-english-animals', title='Animals', subtitle='كلمات الحيوانات بالإنجليزية: أتعرّف وأكتب', chips=['الصف الثاني', 'اللغة الإنجليزية', 'المفردات', 'مع الحلول'], color=C, tint=T, note='اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P

# ---------- English 3 ----------
def en3():
    C, T = '#db2777', '#fde4f0'
    F = [('1f34e', 'apple'), ('1f34c', 'banana'), ('1f34a', 'orange'), ('1f347', 'grapes'), ('1f353', 'strawberry'), ('1f34b', 'lemon'), ('1f352', 'cherries'), ('1f349', 'watermelon')]
    P = [('Fruit words', 'اكتب اسم كل فاكهة من الصندوق.', f'<p class="ins">{chips([EN(w) for _, w in sorted(F, key=lambda x: x[1])])}</p>' + tiles([(a, ans_line(34)) for a, _ in F], 4, 20), 'ws')]
    N = [('x_egg', 'egg', 'an'), ('1f34e', 'apple', 'an'), ('1f34c', 'banana', 'a'), ('1f34a', 'orange', 'an'), ('1f34b', 'lemon', 'a'), ('1f418', 'elephant', 'an'), ('1f981', 'lion', 'a'), ('x_umbrella', 'umbrella', 'an')]
    P.append(('a or an?', f'نستعمل {EN("an")} قبل الكلمة التي تبدأ بحرف من هذه الحروف: {EN("a e i o u")}. ونستعمل {EN("a")} في غير ذلك. اكتب {EN("a")} أو {EN("an")}.', tiles([(im, LR(ans_line(12), EN(w))) for im, w, _ in N], 4, 20), 'ws'))
    Cx = [('1f34e', 'apple', ['red', 'blue', 'green'], 'red'), ('1f34c', 'banana', ['yellow', 'purple', 'red'], 'yellow'), ('1f34a', 'orange', ['orange', 'blue', 'white'], 'orange'), ('1f347', 'grapes', ['purple', 'yellow', 'pink'], 'purple'), ('1f34b', 'lemon', ['green', 'yellow', 'black'], 'yellow'), ('1f353', 'strawberry', ['red', 'blue', 'brown'], 'red')]
    body = f'<p class="ins">{EN("What colour is it?")} ضع دائرة حول اللون الصحيح.</p>' + ''.join(f'<div class="bx" style="display:flex;align-items:center;gap:5mm">{I(a, 18)}<div style="font-size:14pt">' + LR(EN("The " + w + " is"), ' '.join(f'<span class="opt">{EN(c)}</span>' for c in o)) + '</div></div>' for a, w, o, _ in Cx)
    P.append(('What colour is it?', 'اقرأ الجملة وانظر إلى الصورة.', body, 'ws'))
    key = K('Page 2', [EN(w) for _, w in F]) + K('Page 3', [EN(f'{a} {w}') for _, w, a in N]) + K('Page 4', [EN(c) for *_, c in Cx])
    P.append(('Answer key', 'للمعلّم أو ولي الأمر.', key, 'key'))
    return spec(slug='g3-english-fruits-a-an', title='Fruits, a / an and colours', subtitle='الفواكه وأدوات التنكير a / an والألوان', chips=['الصف الثالث', 'اللغة الإنجليزية', 'المفردات', 'مع الحلول'], color=C, tint=T, note='اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P

# ---------- English 4 ----------
def en4():
    C, T = '#7c3aed', '#efe6ff'
    rules = ('<div class="bx" style="line-height:2.2">' + f'{EN("one cat → two cats")} &nbsp; (نضيف s)<br>{EN("one box → two boxes")} &nbsp; (بعد s, x, ch, sh نضيف es)<br>{EN("one child → two children")} &nbsp; (جمع شاذ يُحفظ)</div>')
    A = [('1f431', 'cat', 'cats', 3), ('1f436', 'dog', 'dogs', 2), ('1f34e', 'apple', 'apples', 4), ('x_box', 'box', 'boxes', 2), ('1f68c', 'bus', 'buses', 2), ('1f437', 'pig', 'pigs', 3)]
    cells = [(f'{I(a, 14) * n}', f'{EN("one " + s)}<br>{EN(str(n) + " ...")} {ans_line(26)}') for a, s, p, n in A]
    P = [('Singular and plural', 'المفرد يدل على واحد والجمع على أكثر من واحد. تعلّم القاعدة ثم عُدّ واكتب الجمع.', rules + '<div style="height:3mm"></div>' + tiles([(a, b) for a, b in []], 1) + '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:4mm">' + ''.join(f'<div class="q" style="flex-direction:column;text-align:center;min-height:46mm;justify-content:center;gap:2mm"><div style="display:flex;gap:1mm;justify-content:center">{I(a, 14) * n}</div><div>{EN("one " + s)}<br>{EN(str(n))} {ans_line(26)}</div></div>' for a, s, p, n in A) + '</div>', 'ws')]
    Ch = [('There are two ___.', ['cat', 'cats'], 'cats'), ('I have one ___.', ['book', 'books'], 'book'), ('Look at the three ___!', ['bus', 'buses'], 'buses'), ('She has four ___.', ['pen', 'pens'], 'pens'), ('He has two ___.', ['box', 'boxes'], 'boxes'), ('This is my ___.', ['dog', 'dogs'], 'dog')]
    body = '<p class="ins">اختر الكلمة الصحيحة:</p>' + ''.join(f'<div class="bx"><b>{i+1})</b> ' + LR(EN(q), ' '.join(f'<span class="opt">{EN(o)}</span>' for o in os_)) + '</div>' for i, (q, os_, _) in enumerate(Ch))
    P.append(('Choose the correct word', 'انتبه: one = مفرد، two / three / four = جمع.', body, 'ws'))
    Irr = [('child', 'children'), ('man', 'men'), ('woman', 'women'), ('foot', 'feet'), ('tooth', 'teeth'), ('mouse', 'mice')]
    import random
    r = random.Random(4); right = [p for _, p in Irr]; r.shuffle(right)
    body = '<p class="ins">هذه كلمات جمعها لا يأخذ s. صِل المفرد بجمعه:</p>' + line_match([EN(s) for s, _ in Irr], [EN(x) for x in right])
    P.append(('Irregular plurals', 'بعض الكلمات لها جمع خاص نحفظه.', body, 'ws'))
    key = K('Page 2', [EN(p) for _, _, p, _ in A]) + K('Page 3', [EN(a) for *_, a in Ch]) + K('Page 4', [EN(f'{s} → {p}') for s, p in Irr])
    P.append(('Answer key', 'للمعلّم أو ولي الأمر.', key, 'key'))
    return spec(slug='g4-english-plural-nouns', title='Plural nouns', subtitle='المفرد والجمع في الإنجليزية: s و es والجمع الشاذ', chips=['الصف الرابع', 'اللغة الإنجليزية', 'القواعد', 'مع الحلول'], color=C, tint=T, note='اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P

def _h(f):
    def g():
        s, P = f()
        return s, [(EN(h) if h.isascii() or h.endswith('...') else h, i, b, k) for h, i, b, k in P]
    return g
en2, en3, en4 = _h(en2), _h(en3), _h(en4)
ALL.update(sci2=sci2, sci3=sci3, sci4=sci4, en2=en2, en3=en3, en4=en4)
