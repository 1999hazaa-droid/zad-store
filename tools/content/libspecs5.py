# -*- coding: utf-8 -*-
# المرحلة 4: قصة مصوّرة، بطاقات مراجعة، خرائط مفاهيم، قص ولصق (فنّ زاد الكرتوني الموجود + محتوى أصلي)
from libspecs4 import *

def S5(slug, title, sub, chips_, color, tint, note):
    return spec(slug=slug, title=title, subtitle=sub, chips=chips_, color=color, tint=tint, note=note)

# ---------- قصة مصوّرة ----------
def scene(imgs, text, c, t, h=84):
    pics = ''.join(I(i, h) for i in imgs)
    return (f'<div style="height:{h+14}mm;border-radius:7mm;border:.8mm solid {c};background:linear-gradient(180deg,{t},#fff);display:flex;align-items:center;justify-content:center;gap:8mm">{pics}</div>'
            f'<div class="bx" style="font-size:20pt;line-height:2.4;margin-top:8mm;padding:6mm 7mm;border-style:solid">{text}</div>')

def story1():
    C, T = '#16a34a', '#e0f7e8'
    sc = [(['x_farmer', 'x_seed'], 'في صباح هادئ، أخذ المزارع سالم بذرة صغيرة اسمها «بُذَيرة». قال لها بابتسامة: «سأدفنك في التراب لتصبحي نبتة جميلة».'),
          (['x_soil', 'x_water'], 'دفن سالم البذرة في التراب، وسقاها بالماء كل يوم. كانت بذيرة تنتظر تحت التراب وتقول: «متى سأرى الشمس؟»'),
          (['x_sunrise', 'x_plant'], 'وفي صباح جميل أشرقت الشمس، وظهرت من التراب ورقتان خضراوان صغيرتان. قالت بذيرة: «أخيرًا رأيت الضوء!»'),
          (['x_flowerpot', '1f337'], 'ومرّت الأسابيع، وبقي سالم يسقيها ويعتني بها، حتى صارت بذيرة وردة جميلة. فرح سالم، وعرفت بذيرة أن الصبر والعناية يصنعان الأشياء الجميلة.')]
    P = [(f'الصفحة {n}', 'اقرأ القصة مع أسرتك وانظر إلى الصور.', scene(im, tx, C, T), 'card') for n, (im, tx) in enumerate(sc, 1)]
    qs = [('من الذي دفن البذرة في التراب؟', ['المزارع سالم', 'القطة', 'الصياد'], 'المزارع سالم'), ('ماذا فعل سالم كل يوم؟', ['سقى التربة بالماء', 'قطع الشجرة', 'نام طويلًا'], 'سقى التربة بالماء'), ('ماذا أصبحت البذرة في النهاية؟', ['حجرًا', 'وردة جميلة', 'سيارة'], 'وردة جميلة')]
    ev = ['ظهرت ورقتان خضراوان', 'دفن سالم البذرة في التراب', 'سقى سالم التربة بالماء', 'أصبحت بذيرة وردة جميلة']
    order = [ev[1], ev[2], ev[0], ev[3]]
    body = mcq(qs) + '<p class="ins" style="margin-top:3mm"><b>رتّب الأحداث</b> بكتابة الأرقام من 1 إلى 4:</p>' + order_rows(shuf(ev, 4)).replace('padding:2mm 5mm','padding:1mm 4mm') + '<p class="ins" style="margin-top:2mm">ارسم ما تحتاجه البذرة لتنمو:</p><div class="q" style="min-height:22mm"></div>'
    P.append(('أتذكّر القصة', 'أجب عن الأسئلة.', body, 'ws'))
    key = K('الاختيار', [a for *_, a in qs]) + '<p><b>الترتيب:</b> ' + ' ← '.join(f'{i+1}) {e}' for i, e in enumerate(order)) + '</p><p>الرسم حرّ: ماء، شمس، تراب، هواء.</p>'
    return fin(S5('g1-story-the-little-seed', 'قصة بُذَيرة الصغيرة', 'قصة مصوّرة عن رحلة بذرة حتى تصبح وردة', ['الصف الأول والثاني', 'قصة مصوّرة', 'النباتات', 'مع الأسئلة'], C, T, 'اقرأ القصة بصوت واضح مع طفلك، ثم أجب عن الأسئلة في الصفحة الأخيرة.'), P, key)

# ---------- بطاقات مراجعة ----------
def rcard(q, a, c, t):
    return (f'<div style="flex:1;border:.9mm dashed {c};border-radius:6mm;background:#fff;display:flex;flex-direction:column;overflow:hidden;min-height:0">'
            f'<div style="flex:1;display:grid;place-items:center;text-align:center;padding:2mm 4mm;font-size:13.5pt;font-weight:700;line-height:1.6"><div>{q}</div></div>'
            f'<div style="border-top:.6mm dotted {c};text-align:center;font-size:8.5pt;color:#8a82a8;padding:.5mm">اطوِ هنا ثم انظر للجواب</div>'
            f'<div style="flex:1;display:grid;place-items:center;text-align:center;padding:2mm 4mm;background:{t};color:{c};font-size:13.5pt;font-weight:700;line-height:1.6"><div>{a}</div></div></div>')
def rpage(cards, c, t):
    rows = ''.join(f'<div style="display:flex;gap:5mm;flex:1;min-height:0">{rcard(*x, c, t)}{rcard(*y, c, t)}</div>' for x, y in zip(cards[::2], cards[1::2]))
    return f'<div style="display:flex;flex-direction:column;gap:5mm;flex:1;min-height:0">{rows}</div>'
def review1():
    C, T = '#7c3aed', '#efe6ff'
    cs = [('ما حالات المادة الثلاث؟', 'صلبة وسائلة وغازية'), ('ماذا يحدث للثلج عندما نسخّنه؟', 'يتحوّل إلى ماء'),
          ('ما الذي تحتاجه النباتات لتنمو؟', 'الماء والضوء والهواء'), ('ما اسم صغير الضفدع الذي يعيش في الماء؟', 'الشرغوف'),
          ('من أول حلقة في السلسلة الغذائية؟', 'النبات'), ('الحيوان الذي يأكل النباتات فقط يسمّى…', 'آكل أعشاب'),
          ('أيّهما كائن حي: الحجر أم السمكة؟', 'السمكة'), ('ما جمع كلمة ' + EN('cat') + ' بالإنجليزية؟', EN('cats')),
          ('نقول ' + EN('an') + ' قبل الكلمة ' + EN('apple') + ' أم ' + EN('a') + '؟', EN('an apple')), ('كيف نقول «تفاحة» بالإنجليزية؟', EN('apple')),
          ('ماذا نفعل قبل عبور الشارع؟', 'ننظر إلى الجهتين ونتأكد أن الطريق خالٍ'), ('كم صلاة نصلّي في اليوم والليلة؟', 'خمس صلوات')]
    P = [('كيف نستعمل البطاقات؟', 'مراجعة سريعة وممتعة.', TIPS(['اطبع الصفحات الثلاث وقصّ كل بطاقة على الخط المتقطع.', 'اطوِ البطاقة من الخط المنقّط في المنتصف: السؤال في الأعلى والجواب في الأسفل.', 'اقرأ السؤال، وفكّر، ثم اكشف الجواب.', 'العب مع صديق: كل جواب صحيح يعني نقطة.', 'ضع البطاقات التي أخطأت فيها في كومة خاصة وراجعها غدًا.']), 'tip')]
    for i in range(0, 12, 4):
        P.append(('بطاقات المراجعة', 'قصّ البطاقات على الخط المتقطع.', rpage(cs[i:i + 4], C, T), 'card'))
    return spec(slug='g2-review-cards-mixed', title='بطاقات المراجعة', subtitle='12 بطاقة سؤال وجواب: علوم وإنجليزي وإسلامية ومهارات', chips=['الصف الثاني إلى الرابع', 'بطاقات مراجعة', 'مراجعة عامة'], color=C, tint=T, note='قصّ البطاقات وراجع بها مع صديق أو أحد أفراد الأسرة.'), P

# ---------- خرائط مفاهيم ----------
def node(x, y, w, h, text, c, t, blank=False, big=False, fs=20):
    if blank: return f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="16" fill="#fff" stroke="{c}" stroke-width="3" stroke-dasharray="9 6"/>'
    f = c if big else t
    tc = '#fff' if big else c
    return f'<rect x="{x-w/2}" y="{y-h/2}" width="{w}" height="{h}" rx="16" fill="{f}" stroke="{c}" stroke-width="3"/><text x="{x}" y="{y+fs*0.35}" text-anchor="middle" font-size="{fs}" font-weight="700" fill="{tc}" direction="rtl">{text}</text>'
def cmap(center, kids, c, t, blank=()):
    """kids: [(x, text, [leaf texts], leafw)], وكل عقدة اسمها تُملأ أو تُترك فارغة حسب blank (أسماء)"""
    s = ['<svg viewBox="0 0 680 560" width="100%" style="direction:ltr" xmlns="http://www.w3.org/2000/svg" font-family="C">']
    cx, cy = 340, 70; lines = []; nodes = []
    nodes.append(node(cx, cy, 200, 70, center, c, t, big=True, fs=26))
    for kx, kt, leaves, lw in kids:
        lines.append(f'<line x1="{cx}" y1="{cy+35}" x2="{kx}" y2="175" stroke="{c}" stroke-width="3"/>')
        nodes.append(node(kx, 210, 170 if lw > 120 else 150, 62, kt, c, t, blank=kt in blank, fs=22))
        for j, (lx, lt) in enumerate(leaves):
            ly = 350 + j * 105 if lw > 120 else 350
            lines.append(f'<line x1="{kx}" y1="241" x2="{lx}" y2="{ly-36}" stroke="{c}" stroke-width="2.5"/>')
            nodes.append(node(lx, ly, lw, 72, lt, '#9a8fc2' if False else c, '#fff', blank=lt in blank, fs=18 if lw > 120 else 19))
    s += lines + nodes + ['</svg>']
    return ''.join(s)
def states_kids(): return [(110, 'صلب', [(110, 'له شكل ثابت'), (110, 'الحجر')], 190), (340, 'سائل', [(340, 'يأخذ شكل الإناء'), (340, 'الماء')], 190), (570, 'غاز', [(570, 'ينتشر ويملأ المكان'), (570, 'الهواء')], 190)]
def plant_kids(): return [(170, 'أجزاء النبات', [(60, 'الجذر'), (170, 'الساق'), (280, 'الورقة')], 104), (510, 'حاجات النبات', [(400, 'الماء'), (510, 'الضوء'), (620, 'الهواء')], 104)]
def maps1():
    C, T = '#0891b2', '#dcf4fa'
    st, pl = states_kids(), plant_kids()
    P = [('خريطة المادة', 'اقرأ الخريطة من الأعلى إلى الأسفل: المادة لها ثلاث حالات، ولكل حالة خاصية ومثال.', cmap('المادة', st, C, T), 'card')]
    blanks = ['له شكل ثابت', 'الماء', 'ينتشر ويملأ المكان', 'الحجر']
    bank = ['له شكل ثابت', 'الماء', 'ينتشر ويملأ المكان', 'الحجر']
    P.append(('أكمل خريطة المادة', 'اكتب في الصناديق الفارغة الكلمات والعبارات من الصندوق.', f'<div class="bx" style="text-align:center">{chips(shuf(bank, 2))}</div>' + cmap('المادة', st, C, T, blank=blanks), 'ws'))
    pb = ['الجذر', 'الورقة', 'الماء', 'الهواء']
    P.append(('أكمل خريطة النبات', 'اكتب في الصناديق الفارغة الكلمات من الصندوق.', f'<div class="bx" style="text-align:center">{chips(shuf(pb, 7))}</div>' + cmap('النبات', pl, C, T, blank=pb), 'ws'))
    key = '<p><b>خريطة المادة:</b> صلب ← له شكل ثابت، مثاله الحجر. سائل ← يأخذ شكل الإناء، مثاله الماء. غاز ← ينتشر ويملأ المكان، مثاله الهواء.</p><p><b>خريطة النبات:</b> أجزاؤه: الجذر والساق والورقة. حاجاته: الماء والضوء والهواء. الكلمات الأربع تُكتب في أماكنها الصحيحة (الجذر والورقة تحت «أجزاء النبات»، والماء والهواء تحت «حاجات النبات»).</p>'
    return fin(S5('g3-concept-maps-matter-plants', 'خرائط المفاهيم: المادة والنبات', 'أقرأ الخريطة ثم أكملها بنفسي', ['الصف الثالث والرابع', 'خرائط مفاهيم', 'العلوم', 'مع الحلول'], C, T, 'خرائط المفاهيم تساعد على تنظيم الأفكار وتذكّرها.'), P, key)

# ---------- قص ولصق ----------
def pastebox(n, c, hint=''):
    return f'<div style="flex:1;border:.8mm dashed {c};border-radius:6mm;min-height:55mm;display:grid;place-items:center;background:#fff;position:relative"><span class="no" style="position:absolute;top:2mm;right:2mm">{n}</span><span style="color:#b9b2d4;font-size:11pt">{hint}</span></div>'
def piece(im, label, c, h=34):
    return f'<div style="border:.9mm dashed {c};border-radius:5mm;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1mm;padding:3mm;min-height:{h+22}mm"><span style="font-size:7pt;color:#bbb">✂</span>{I(im, h)}<div style="font-size:13pt;font-weight:700;color:{c}">{label}</div></div>'
def cutpaste1():
    C, T = '#ea580c', '#ffeadb'
    fr_ = [('x_frogspawn', 'بيض الضفدع'), ('x_tadpole', 'الشرغوف'), ('1f438', 'الضفدع')]
    P = [('كيف نعمل؟', 'نشاط قص ولصق ممتع.', TIPS(['اطلب من شخص كبير مساعدتك في استعمال المقص.', 'في صفحة «القص» ستجد صورًا؛ قصّها على الخط المتقطع.', 'ألصق كل صورة في مكانها الصحيح على لوحة اللصق.', 'تحقّق من إجابتك في صفحة الحلول الأخيرة.', 'ضع المخلّفات في سلة المهملات بعد انتهائك.']), 'tip')]
    brd = f'<div style="display:grid;grid-template-columns:1fr;gap:8mm;margin-top:4mm">' + ''.join(pastebox(i + 1, C, 'ألصق هنا') for i in range(3)) + '</div><p class="ins" style="text-align:center;margin-top:5mm">ثم اكتب تحت كل صورة اسم المرحلة.</p>'
    P.append(('مراحل حياة الضفدع (اللصق)', 'ألصق الصور بالترتيب من الأولى إلى الثالثة.', brd, 'ws'))
    cut = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6mm">' + ''.join(piece(a, l, C) for a, l in shuf(fr_, 8)) + '</div>'
    P.append(('صور مراحل الضفدع (القص)', 'قصّ الصور على الخط المتقطع.', cut, 'card'))
    sb = '<div style="display:flex;gap:8mm;margin-top:4mm">' + ''.join(f'<div style="flex:1;border:.8mm solid {C};border-radius:6mm;background:#fff;min-height:150mm;display:flex;flex-direction:column"><div style="background:{C};color:#fff;text-align:center;font-weight:700;font-size:18pt;border-radius:4mm 4mm 0 0;padding:2mm">{h}</div><div style="flex:1"></div></div>' for h in ['كائنات حية', 'أشياء غير حية']) + '</div>'
    P.append(('أصنّف الصور (اللصق)', 'ألصق كل صورة في العمود المناسب.', sb, 'ws'))
    sort = [('1f431', 'قطة', 'حي'), ('1f333', 'شجرة', 'حي'), ('1f41f', 'سمكة', 'حي'), ('1f337', 'وردة', 'حي'), ('26bd', 'كرة', 'غير حي'), ('1f697', 'سيارة', 'غير حي'), ('1f388', 'بالون', 'غير حي'), ('x_stone', 'حجر', 'غير حي')]
    cut2 = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm">' + ''.join(piece(a, l, C, 26) for a, l, _ in shuf(sort, 3)) + '</div>'
    P.append(('صور التصنيف (القص)', 'قصّ الصور على الخط المتقطع.', cut2, 'card'))
    key = '<p><b>دورة حياة الضفدع:</b> 1) بيض الضفدع ← 2) الشرغوف ← 3) الضفدع.</p><p><b>كائنات حية:</b> قطة، شجرة، سمكة، وردة.</p><p><b>أشياء غير حية:</b> كرة، سيارة، بالون، حجر.</p>'
    return fin(S5('g2-cut-paste-frog-living', 'قص ولصق: الضفدع والكائنات الحية', 'أقصّ الصور وأرتّبها وأصنّفها', ['الصف الثاني والثالث', 'قص ولصق', 'العلوم', 'مع الحلول'], C, T, 'تحتاج إلى مقص آمن وغراء. اطلب مساعدة شخص كبير.'), P, key)

ALL.update(story1=story1, review1=review1, maps1=maps1, cutpaste1=cutpaste1)
