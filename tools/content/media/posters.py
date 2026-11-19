# -*- coding: utf-8 -*-
from common import *
import os
NOTE = 'محتوى وتصميم أصليان من إعداد زاد؛ الرسومات من مكتبة زاد الكرتونية. لم يُراجَع من جهة تعليمية رسمية.'
def P(sp, title, sub, body): return [page(sp, title, sub, body)]
def SP(**k):
    k.setdefault('kind', 'poster'); k.setdefault('orient', 'portrait'); k.setdefault('note', NOTE); return k
def gridcells(cells, cols, rows=None, gap=3.2):
    r = f'grid-template-rows:repeat({rows},1fr);' if rows else ''
    return f'<div class="grid" style="grid-template-columns:repeat({cols},1fr);{r}flex:1;min-height:0;gap:{gap}mm">{cells}</div>'
def C(inner, col, extra=''): return f'<div class="cell" style="border-color:{col};background:{col}14;overflow:hidden;{extra}">{inner}</div>'

@spec('poster-ar-letters')
def _():
    txt = open(os.path.join(ROOT, 'tools/content/cards/data.py'), encoding='utf-8').read()
    a = txt.index('LET = ['); b = txt.index(']\nfor i,(id,ch,nm'); ns = {}; exec(txt[a:b + 1], ns)
    sp = SP(title='الحروف الهجائية العربية', desc='ملصق بالحروف الثمانية والعشرين، لكل حرف كلمة ورسمة توضّحها. مناسب للتعليق في الصف أو غرفة الطفل.', levels=['a5', 'a6', 'g1'], subject='اللغة العربية', topic='الحروف', sort=1)
    cells = ''
    for i, (id, ch, nm, con, w, im, aw, ex) in enumerate(ns['LET']):
        col = PAL[i % len(PAL)]; ic = I(im[1:] if im.startswith('@') else im, 12)
        cells += C(f'<div style="font-size:26pt;font-weight:700;color:{col};line-height:1">{ch}</div>{ic}<div style="font-size:10.5pt;font-weight:700">{w}</div>', col)
    return sp, P(sp, 'الحروف الهجائية العربية', 'ثمانية وعشرون حرفًا · لكل حرف كلمة ورسمة', gridcells(cells, 4, 7))

@spec('poster-en-letters')
def _():
    W = [('A', 'Apple', '1f34e'), ('B', 'Ball', '26bd'), ('C', 'Cat', '1f431'), ('D', 'Dog', '1f436'), ('E', 'Elephant', '1f418'), ('F', 'Fish', '1f41f'), ('G', 'Giraffe', '1f992'), ('H', 'House', '1f3e0'), ('I', 'Ice cream', 'x_icecream'), ('J', 'Jigsaw', '1f9e9'), ('K', 'Kite', '1fa81'), ('L', 'Lion', '1f981'), ('M', 'Monkey', '1f435'), ('N', 'Notebook', 'i_notebook'), ('O', 'Octopus', '1f419'), ('P', 'Penguin', '1f427'), ('Q', 'Queen', 'images/cards/obj/queen'), ('R', 'Rabbit', '1f430'), ('S', 'Sun', '2600'), ('T', 'Tiger', '1f42f'), ('U', 'Umbrella', 'x_umbrella'), ('V', 'Van', 'images/cards/obj/van'), ('W', 'Whale', '1f40b'), ('X', 'Xylophone', 'images/cards/obj/xylophone'), ('Y', 'Yo-yo', 'images/cards/obj/yoyo'), ('Z', 'Zebra', '1f993')]
    sp = SP(title='English Alphabet', desc='ملصق الحروف الإنجليزية من A إلى Z، لكل حرف كلمة ورسمة. الحرفان الكبير والصغير ظاهران بوضوح.', levels=['a5', 'a6', 'g1', 'g2'], subject='اللغة الإنجليزية', topic='Alphabet', sort=2)
    cells = ''
    for i, (l, w, im) in enumerate(W):
        col = PAL[i % len(PAL)]; code = im if '/' not in im else im + '.webp'
        cells += C(f'<div class="l" style="font-size:25pt;font-weight:700;color:{col};line-height:1">{l}{l.lower()}</div>' + (I(code, 12) if '/' in im else I(im, 12)) + f'<div class="l" style="font-size:10.5pt;font-weight:700">{w}</div>', col)
    for t in ('abc.svg',): pass
    cells += C(f'<div class="l" style="font-size:20pt;font-weight:700;color:var(--c)">A to Z</div><div style="font-size:11pt;font-weight:700">٢٦ حرفًا</div>', '#6a2bd9')
    cells += C(f'{I("1f989", 13)}<div class="l" style="font-size:11pt;font-weight:700">Let\'s learn!</div>', '#6a2bd9')
    return sp, P(sp, 'English Alphabet', 'الأبجدية الإنجليزية · ٢٦ حرفًا', gridcells(cells, 4, 7).replace('<div class="grid" ', '<div class="grid" dir="ltr" ', 1))

@spec('poster-numbers')
def _():
    NW = ['واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة']; NE = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']
    sp = SP(title='الأرقام من ١ إلى ١٠', desc='ملصق الأرقام من واحد إلى عشرة: الرقم بالعربية والإنجليزية واسمه ونقاط للعدّ.', levels=['a3', 'a4', 'a5', 'a6', 'g1'], subject='الرياضيات', topic='الأعداد', sort=3)
    cells = ''
    for i in range(10):
        col = PAL[i % len(PAL)]; n = i + 1
        rows = [5, 5] if n > 5 else [n]
        dots = ''
        for r, k in enumerate(rows): dots += ''.join(f'<circle cx="{14 + c * 24}" cy="{14 + r * 24}" r="9.5" fill="{col}"/>' for c in range(k))
        svg = f'<svg viewBox="0 0 {14 + 24 * 5 - 2} {len(rows) * 24 + 4}" style="width:36mm;height:{len(rows) * 7.2 + 1}mm">{dots}</svg>'
        cells += C(f'<div style="display:flex;align-items:center;gap:4mm;direction:ltr"><div style="font-size:44pt;font-weight:700;color:{col};line-height:1">{n}</div><div style="font-size:30pt;font-weight:700;color:{col};opacity:.8">{AD(n)}</div></div><div style="font-size:15pt;font-weight:700">{NW[i]} · <span class="l">{NE[i]}</span></div>{svg}', col)
    return sp, P(sp, 'الأرقام من ١ إلى ١٠', 'نعدّ معًا: رقم · اسم · عدد النقاط', gridcells(cells, 2, 5))

@spec('poster-colors')
def _():
    L = [('أحمر', 'Red', 'red'), ('أزرق', 'Blue', 'blue'), ('أصفر', 'Yellow', 'yellow'), ('أخضر', 'Green', 'green'), ('برتقالي', 'Orange', 'orange'), ('بنفسجي', 'Purple', 'purple'), ('وردي', 'Pink', 'pink'), ('بني', 'Brown', 'brown'), ('أسود', 'Black', 'black'), ('أبيض', 'White', 'white')]
    ex = {'red': '1f34e', 'yellow': '1f34c', 'green': '1f33f', 'orange': '1f34a', 'purple': '1f347', 'pink': '1f338', 'brown': '1f43b', 'blue': '1f40b', 'white': '2601', 'black': None}
    cols = {'red': '#e53935', 'blue': '#1e88e5', 'yellow': '#f9a825', 'green': '#43a047', 'orange': '#fb8c00', 'purple': '#8e24aa', 'pink': '#ec407a', 'brown': '#6d4c41', 'black': '#333', 'white': '#90a4ae'}
    sp = SP(title='الألوان', desc='ملصق عشرة ألوان أساسية بأسمائها بالعربية والإنجليزية مع رسمة تذكّر بكل لون.', levels=['a2', 'a3', 'a4', 'a5', 'a6'], subject='المهارات الحياتية', topic='الألوان', sort=4)
    cells = ''
    for a, e, k in L:
        c = cols[k]
        art = I('images/cards/col/' + k + '.webp', 21) + (I(ex[k], 15) if ex[k] else '')
        cells += C(f'<div style="display:flex;align-items:center;gap:3mm">{art}</div><div style="font-size:19pt;font-weight:700;color:{c}">{a}</div><div class="l" style="font-size:13pt;font-weight:700">{e}</div>', c)
    return sp, P(sp, 'الألوان', 'نتعرّف على الألوان ونسمّيها', gridcells(cells, 2, 5))

@spec('poster-shapes')
def _():
    L = [('دائرة', 'Circle', 'circle', 'بلا أضلاع ولا زوايا، مستديرة تمامًا'), ('مربع', 'Square', 'square', '٤ أضلاع متساوية و٤ زوايا قائمة'), ('مستطيل', 'Rectangle', 'rect', '٤ أضلاع، كل ضلعين متقابلين متساويان'), ('مثلث', 'Triangle', 'triangle', '٣ أضلاع و٣ زوايا'), ('معيّن', 'Diamond', 'diamond', '٤ أضلاع متساوية، زواياه ليست قائمة'), ('سداسي', 'Hexagon', 'hexa', '٦ أضلاع و٦ زوايا'), ('بيضاوي', 'Oval', 'oval', 'مستدير ومستطيل الشكل كالبيضة'), ('نجمة', 'Star', 'star', 'لها خمس رؤوس مدبّبة'), ('قلب', 'Heart', 'heart', 'شكل القلب')]
    sp = SP(title='الأشكال الهندسية', desc='ملصق تسعة أشكال هندسية مع اسم كل شكل بالعربية والإنجليزية وعدد أضلاعه وخصائصه البسيطة.', levels=['a3', 'a4', 'a5', 'a6', 'g1', 'g2'], subject='الرياضيات', topic='الهندسة', sort=5)
    cells = ''
    for i, (a, e, k, d) in enumerate(L):
        col = PAL[i % len(PAL)]
        cells += C(I('images/cards/shp/' + k + '.webp', 30) + f'<div style="font-size:19pt;font-weight:700;color:{col};line-height:1.2">{a}</div><div class="l" style="font-size:12pt;font-weight:700;color:#4b4666">{e}</div><div style="font-size:10.5pt;line-height:1.5">{d}</div>', col)
    return sp, P(sp, 'الأشكال الهندسية', 'نسمّي الشكل ونعدّ أضلاعه', gridcells(cells, 3, 3))

@spec('poster-days')
def _():
    D = [('الأحد', 'Sunday'), ('الاثنين', 'Monday'), ('الثلاثاء', 'Tuesday'), ('الأربعاء', 'Wednesday'), ('الخميس', 'Thursday'), ('الجمعة', 'Friday'), ('السبت', 'Saturday')]
    sp = SP(title='أيام الأسبوع', desc='ملصق أيام الأسبوع السبعة بالعربية والإنجليزية بألوان مختلفة، من الأحد إلى السبت.', levels=['a5', 'a6', 'g1', 'g2'], subject='المهارات الحياتية', topic='الزمن', sort=6)
    rows = ''
    for i, (a, e) in enumerate(D):
        c = PAL[i]
        rows += f'<div style="display:flex;align-items:center;gap:6mm;background:{c}16;border:.7mm solid {c};border-radius:6mm;padding:0 8mm;flex:1"><div style="width:15mm;height:15mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:20pt;font-weight:700">{AD(i + 1)}</div><div style="font-size:30pt;font-weight:700;color:{c};flex:1">{a}</div><div class="l" style="font-size:24pt;font-weight:700">{e}</div></div>'
    body = f'<div style="display:flex;flex-direction:column;gap:3.5mm;flex:1;min-height:0">{rows}</div><div style="text-align:center;font-size:13pt;margin-top:3mm;color:#4b4666">الأسبوع سبعة أيام · يبدأ هنا بيوم الأحد</div>'
    return sp, P(sp, 'أيام الأسبوع', 'سبعة أيام · عربي وإنجليزي', body)

@spec('poster-months')
def _():
    M = [('يناير', 'January', 31), ('فبراير', 'February', 28), ('مارس', 'March', 31), ('أبريل', 'April', 30), ('مايو', 'May', 31), ('يونيو', 'June', 30), ('يوليو', 'July', 31), ('أغسطس', 'August', 31), ('سبتمبر', 'September', 30), ('أكتوبر', 'October', 31), ('نوفمبر', 'November', 30), ('ديسمبر', 'December', 31)]
    sp = SP(title='أشهر السنة الميلادية', desc='ملصق الأشهر الاثني عشر بالعربية والإنجليزية مع ترتيب كل شهر وعدد أيامه.', levels=['g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='الزمن', sort=7)
    cells = ''
    for i, (a, e, d) in enumerate(M):
        c = PAL[i % len(PAL)]
        dd = '٢٨ أو ٢٩ يومًا' if d == 28 else f'{AD(d)} يومًا'
        cells += C(f'<div style="width:11mm;height:11mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:15pt;font-weight:700">{AD(i + 1)}</div><div style="font-size:22pt;font-weight:700;color:{c}">{a}</div><div class="l" style="font-size:13pt;font-weight:700">{e}</div><div style="font-size:10.5pt;color:#4b4666">{dd}</div>', c)
    return sp, P(sp, 'أشهر السنة الميلادية', 'اثنا عشر شهرًا في السنة', gridcells(cells, 3, 4))

@spec('poster-hijri')
def _():
    M = ['محرّم', 'صفر', 'ربيع الأول', 'ربيع الآخر', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوّال', 'ذو القعدة', 'ذو الحجّة']
    sp = SP(title='الأشهر الهجرية', desc='ملصق الأشهر الهجرية الاثني عشر مرتّبة من محرّم إلى ذي الحجّة.', levels=['g2', 'g3', 'g4'], subject='التربية الإسلامية', topic='التقويم الهجري', sort=8, note='أسماء الأشهر الهجرية وترتيبها معلومة ثابتة. لم يراجعها معلّم تربية إسلامية بعد.')
    cells = ''
    for i, a in enumerate(M):
        c = PAL[i % len(PAL)]
        cells += C(f'<div style="width:12mm;height:12mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:16pt;font-weight:700">{AD(i + 1)}</div><div style="font-size:21pt;font-weight:700;color:{c};line-height:1.3">{a}</div>', c)
    body = gridcells(cells, 3, 4) + '<div style="text-align:center;font-size:12.5pt;margin-top:3mm;color:#4b4666">الشهر الهجري ٢٩ أو ٣٠ يومًا · السنة الهجرية اثنا عشر شهرًا</div>'
    return sp, P(sp, 'الأشهر الهجرية', 'من محرّم إلى ذي الحجّة', body)

@spec('poster-operations')
def _():
    def dots(groups, col, r=8):
        out = ''; x = 8
        for g in groups:
            for c, (n, cc) in enumerate(g):
                for k in range(n): out += f'<circle cx="{x + 9}" cy="{14 + 0}" r="{r}" fill="{cc}"/>'; x += 20
            x += 14
        return out
    def svgrow(items, h=26):
        o = ''; x = 8
        for (n, cc, cross) in items:
            for k in range(n):
                o += f'<circle cx="{x + 9}" cy="14" r="8" fill="{cc}"/>'
                if cross: o += f'<path d="M{x + 3},8 L{x + 15},20 M{x + 15},8 L{x + 3},20" stroke="#fff" stroke-width="3"/>'
                x += 20
            x += 10
        return f'<svg viewBox="0 0 {max(x, 40)} {h}" style="height:8mm;width:{max(x, 40) * .3:.0f}mm">{o}</svg>'
    sp = SP(title='العمليات الحسابية الأربع', desc='ملصق الجمع والطرح والضرب والقسمة: الرمز والمصطلح ومثال محسوب مع رسم بالنقاط.', levels=['g1', 'g2', 'g3'], subject='الرياضيات', topic='العمليات الحسابية', sort=9)
    R, B, G, O = '#e53935', '#1e88e5', '#43a047', '#fb8c00'
    items = [
        ('+', 'الجمع', 'Addition', ltr('5 + 3 = 8'), 'المجموع = ناتج الجمع · نقول: زائد، أضف', svgrow([(5, R, 0), (3, B, 0)]), R),
        ('−', 'الطرح', 'Subtraction', ltr('9 − 4 = 5'), 'الفرق = ناتج الطرح · نقول: ناقص، أنقص', svgrow([(5, B, 0), (4, '#9e9e9e', 1)]), B),
        ('×', 'الضرب', 'Multiplication', ltr('3 × 4 = 12'), 'حاصل الضرب · هو جمع المتساوي: ٤ + ٤ + ٤', svgrow([(4, G, 0), (4, O, 0), (4, '#8e24aa', 0)]), G),
        ('÷', 'القسمة', 'Division', ltr('12 ÷ 3 = 4'), 'خارج القسمة · نوزّع ١٢ على ٣ بالتساوي: لكل واحد ٤', svgrow([(4, '#8e24aa', 0), (4, '#00897b', 0), (4, O, 0)]), O),
    ]
    cells = ''
    for sym, a, e, ex, d, art, c in items:
        cells += C(f'<div style="width:22mm;height:22mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:42pt;font-weight:700;line-height:1">{sym}</div><div style="font-size:24pt;font-weight:700;color:{c}">{a} · <span class="l" style="font-size:15pt">{e}</span></div><div style="font-size:26pt;font-weight:700;margin:1mm 0">{ex}</div>{art}<div style="font-size:11.5pt;line-height:1.6;margin-top:2mm">{d}</div>', c)
    return sp, P(sp, 'العمليات الحسابية الأربع', 'الجمع · الطرح · الضرب · القسمة', gridcells(cells, 2, 2, 4))

@spec('poster-animals')
def _():
    G = [('الثدييات', ['1f404', '1f981', '1f418', '1f40b'], 'جسمها مغطّى بالشعر أو الفرو · معظمها تلد صغارها وترضعهم الحليب · تتنفس بالرئتين', '#8e24aa'),
         ('الطيور', ['1f985', '1f427', '1f986', '1f413'], 'جسمها مغطّى بالريش · لها جناحان ومنقار · تبيض (وبعضها لا يطير كالبطريق)', '#039be5'),
         ('الأسماك', ['1f41f'], 'تعيش في الماء · تتنفس بالخياشيم · جسمها مغطّى بالحراشف وتسبح بالزعانف', '#00897b'),
         ('الزواحف', ['1f422', '1f40d', '1f40a'], 'جلدها جاف وفيه حراشف · تتنفس بالرئتين · معظمها يبيض', '#43a047'),
         ('البرمائيات', ['1f438', 'x_tadpole'], 'تعيش في الماء وعلى اليابسة · جلدها رطب أملس · تبدأ حياتها في الماء (شرغوف)', '#fb8c00'),
         ('الحشرات', ['1f98b', '1f41d', 'x_ladybug'], 'لها ست أرجل · جسمها ثلاثة أجزاء: رأس وصدر وبطن · لها قرنا استشعار', '#e53935')]
    sp = SP(title='تصنيف الحيوانات', desc='ملصق ست مجموعات للحيوانات: الثدييات والطيور والأسماك والزواحف والبرمائيات والحشرات، مع صفات كل مجموعة وأمثلة مرسومة.', levels=['g2', 'g3', 'g4'], subject='العلوم', topic='الكائنات الحية', sort=10)
    cells = ''
    for t, ics, d, c in G:
        cells += C(f'<div style="font-size:22pt;font-weight:700;color:{c}">{t}</div><div style="display:flex;gap:2mm;margin:1mm 0">{"".join(I(x, 17) for x in ics)}</div><div style="font-size:11pt;line-height:1.6">{d}</div>', c)
    return sp, P(sp, 'تصنيف الحيوانات', 'نصنّف الحيوانات حسب صفاتها', gridcells(cells, 2, 3))

@spec('poster-body')
def _():
    sp = SP(title='أجزاء جسم الإنسان', desc='ملصق برسم طفل وتسمية أجزاء الجسم الظاهرة: الرأس والعينان والأذن والأنف والفم والرقبة والكتف والذراع واليد والصدر والبطن والساق والركبة والقدم.', levels=['a4', 'a5', 'a6', 'g1', 'g2'], subject='العلوم', topic='جسم الإنسان', sort=11)
    cx = 450; skin = '#ffd2a8'
    fig = f'''<g stroke="#1b1430" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
<path d="M{cx-120},205 L{cx-196},340" stroke="#7e57c2" stroke-width="40" fill="none"/><path d="M{cx+120},205 L{cx+196},340" stroke="#7e57c2" stroke-width="40" fill="none"/>
<circle cx="{cx-205}" cy="365" r="24" fill="{skin}"/><circle cx="{cx+205}" cy="365" r="24" fill="{skin}"/>
<rect x="{cx-52}" y="360" width="46" height="190" rx="20" fill="#3949ab"/><rect x="{cx+6}" y="360" width="46" height="190" rx="20" fill="#3949ab"/>
<ellipse cx="{cx-36}" cy="572" rx="40" ry="18" fill="#6d4c41"/><ellipse cx="{cx+36}" cy="572" rx="40" ry="18" fill="#6d4c41"/>
<rect x="{cx-78}" y="190" width="156" height="190" rx="46" fill="#7e57c2"/><rect x="{cx-14}" y="152" width="28" height="44" fill="{skin}"/>
<circle cx="{cx-72}" cy="108" r="14" fill="{skin}"/><circle cx="{cx+72}" cy="108" r="14" fill="{skin}"/>
<circle cx="{cx}" cy="100" r="72" fill="{skin}"/><path d="M{cx-72},92 C{cx-72},20 {cx+72},20 {cx+72},92 C{cx+40},60 {cx-40},60 {cx-72},92 Z" fill="#4e342e"/>
<circle cx="{cx-26}" cy="104" r="7" fill="#1b1430"/><circle cx="{cx+26}" cy="104" r="7" fill="#1b1430"/>
<path d="M{cx},112 L{cx-5},128 L{cx+5},128" fill="none" stroke-width="3"/><path d="M{cx-22},142 Q{cx},160 {cx+22},142" fill="none" stroke="#c62828" stroke-width="5"/></g>'''
    L = [('الرأس', cx, 50, 'R', 60), ('العينان', cx + 26, 104, 'R', 130), ('الأذن', cx + 86, 108, 'R', 200), ('الكتف', cx + 90, 205, 'R', 270), ('الصدر', cx + 40, 250, 'R', 340), ('الأصابع', cx + 214, 380, 'R', 410), ('الساق', cx + 30, 470, 'R', 480),
         ('الأنف', cx, 122, 'L', 90), ('الفم', cx - 12, 150, 'L', 160), ('الرقبة', cx, 175, 'L', 230), ('البطن', cx - 30, 330, 'L', 300), ('الذراع', cx - 152, 265, 'L', 370), ('اليد', cx - 205, 365, 'L', 440), ('الركبة', cx - 30, 440, 'L', 510), ('القدم', cx - 50, 575, 'L', 580)]
    lab = ''
    for k, (t, x, y, s, ly) in enumerate(L):
        c = PAL[k % len(PAL)]; lx = 40 if s == 'L' else 860; ly = min(ly, 600)
        ex = lx + (190 if s == 'L' else -190)
        lab += f'<path d="M{ex},{ly} L{x},{y}" stroke="{c}" stroke-width="3.5" fill="none"/><circle cx="{x}" cy="{y}" r="6" fill="{c}"/>'
        rx = lx if s == 'L' else lx - 190
        lab += f'<rect x="{rx}" y="{ly - 24}" width="190" height="48" rx="24" fill="{c}"/><text x="{rx + 95}" y="{ly}" font-size="28" font-weight="700" fill="#fff" text-anchor="middle" dominant-baseline="central">{t}</text>'
    svg = f'<svg viewBox="0 0 900 640" style="width:100%;height:100%" font-family="C,sans-serif">{lab}{fig}</svg>'
    return sp, P(sp, 'أجزاء جسم الإنسان', 'نسمّي أجزاء جسمنا', f'<div style="flex:1;min-height:0">{svg}</div>')

@spec('poster-hygiene')
def _():
    L = [('نغسل أيدينا بالماء والصابون', 'قبل الأكل وبعده وبعد استخدام الحمّام', '1f9fc'), ('ننظّف أسناننا', 'بالفرشاة والمعجون مرتين في اليوم', '1faa5'), ('نستحمّ بانتظام', 'لنبقى أنظف وأنشط', '1fae7'), ('نغطّي الفم عند العطاس', 'بالمنديل أو بثني المرفق', '1f927'), ('نشرب الماء', 'ماء نظيف على مدار اليوم', '1f4a7'), ('ننام نومًا كافيًا', 'ليرتاح الجسم والعقل', '1f634')]
    sp = SP(title='قواعد النظافة الشخصية', desc='ملصق ست عادات يومية للنظافة والصحة بجمل قصيرة ورسمة لكل عادة.', levels=['a3', 'a4', 'a5', 'a6', 'g1', 'g2'], subject='المهارات الحياتية', topic='النظافة والصحة', sort=12)
    cells = ''
    for i, (t, d, ic) in enumerate(L):
        c = PAL[(i * 2 + 3) % 8]
        cells += C(I(ic, 28) + f'<div style="font-size:16pt;font-weight:700;color:{c};line-height:1.4;margin-top:1mm">{t}</div><div style="font-size:11pt;line-height:1.5">{d}</div>', c)
    return sp, P(sp, 'قواعد النظافة الشخصية', 'عادات صغيرة تحفظ صحتنا', gridcells(cells, 2, 3))

@spec('poster-behavior')
def _():
    L = [('نقول من فضلك وشكرًا', 'كلمات لطيفة تفرّح الآخرين', '1f64f'), ('نرفع أيدينا قبل الكلام', 'ننتظر دورنا في الحديث', '1f590'), ('نستمع بهدوء', 'نصغي لمن يتحدث', 'x_ear'), ('نحترم المعلّم والزملاء', 'نتعامل بلطف ونتجنّب الأذى', '1f60a'), ('نشارك الآخرين', 'نتشارك الأدوات والألعاب', '1f932'), ('نرتّب أدواتنا', 'مكان لكل شيء وكل شيء في مكانه', '1f392')]
    sp = SP(title='قواعد السلوك في الصف', desc='ملصق ست قواعد للسلوك الحسن في الصف والمدرسة بجمل قصيرة ورسومات توضيحية.', levels=['a4', 'a5', 'a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='السلوك والآداب', sort=13)
    cells = ''
    for i, (t, d, ic) in enumerate(L):
        c = PAL[(i * 2 + 1) % 8]
        cells += C(I(ic, 28) + f'<div style="font-size:16pt;font-weight:700;color:{c};line-height:1.4;margin-top:1mm">{t}</div><div style="font-size:11pt;line-height:1.5">{d}</div>', c)
    return sp, P(sp, 'قواعد السلوك في الصف', 'نتعاون ونحترم بعضنا', gridcells(cells, 2, 3))

@spec('poster-grammar-parts')
def _():
    sp = SP(title='الاسم والفعل والحرف', desc='ملصق أقسام الكلام الثلاثة في اللغة العربية: الاسم والفعل والحرف، مع تعريف مبسّط وأمثلة وجملة تطبيقية.', levels=['g2', 'g3', 'g4'], subject='اللغة العربية', topic='قواعد اللغة', sort=14)
    items = [('الاسم', '#e53935', 'كلمة تدلّ على إنسان أو حيوان أو نبات أو جماد أو مكان', 'محمد · قطّة · وردة · كتاب · مدرسة'),
             ('الفعل', '#1e88e5', 'كلمة تدلّ على عمل أو حدث في زمن: ماضٍ أو مضارع أو أمر', 'كتبَ (ماضٍ) · يكتبُ (مضارع) · اكتبْ (أمر)'),
             ('الحرف', '#43a047', 'كلمة لا يكتمل معناها إلا إذا جاءت مع كلمات أخرى', 'في · على · من · إلى · عن')]
    cells = ''
    for t, c, d, ex in items:
        cells += f'<div style="flex:1;border:.7mm solid {c};background:{c}12;border-radius:6mm;padding:5mm 8mm;display:flex;flex-direction:column;justify-content:center;gap:2mm"><div style="font-size:30pt;font-weight:700;color:{c}">{t}</div><div style="font-size:14pt;line-height:1.7">{d}</div><div style="font-size:14pt;font-weight:700;background:#fff;border-radius:4mm;padding:2mm 4mm">أمثلة: {ex}</div></div>'
    sent = '<div style="margin-top:3mm;background:var(--t);border-radius:6mm;padding:4mm 8mm;text-align:center;font-size:16pt;line-height:1.9">جملة: <b style="color:#1e88e5">ذهبَ</b> <b style="color:#e53935">عليٌّ</b> <b style="color:#43a047">إلى</b> <b style="color:#e53935">المدرسةِ</b><br><span style="font-size:12pt">ذهبَ: فعل · عليٌّ والمدرسةِ: اسمان · إلى: حرف</span></div>'
    return sp, P(sp, 'الاسم والفعل والحرف', 'أقسام الكلام في اللغة العربية', f'<div style="display:flex;flex-direction:column;gap:3.5mm;flex:1;min-height:0">{cells}</div>{sent}')

@spec('poster-sun-moon')
def _():
    sp = SP(title='اللام الشمسية واللام القمرية', desc='ملصق يفرّق بين الحروف الشمسية والقمرية مع القاعدة ومثال لكل نوع. أربعة عشر حرفًا في كل مجموعة.', levels=['g1', 'g2', 'g3'], subject='اللغة العربية', topic='قواعد اللغة', sort=15)
    def box(t, c, letters, rule, ex):
        ch = ''.join(f'<span style="display:inline-grid;place-items:center;width:15mm;height:15mm;border-radius:4mm;background:{c};color:#fff;font-size:22pt;font-weight:700;margin:1.2mm">{l}</span>' for l in letters)
        return f'<div style="flex:1;border:.7mm solid {c};background:{c}12;border-radius:6mm;padding:5mm 8mm;display:flex;flex-direction:column;gap:2mm;justify-content:center;text-align:center"><div style="font-size:26pt;font-weight:700;color:{c}">{t}</div><div>{ch}</div><div style="font-size:13.5pt;line-height:1.7">{rule}</div><div style="font-size:17pt;font-weight:700;background:#fff;border-radius:4mm;padding:2mm">{ex}</div></div>'
    s = box('الحروف القمرية', '#039be5', 'أ ب ج ح خ ع غ ف ق ك م ه و ي'.split(), 'ننطق «ال» ونكتبها: اللام ساكنة والحرف بعدها بلا شدّة', 'الْقَمَر · الْبَاب · الْكِتاب')
    m = box('الحروف الشمسية', '#fb8c00', 'ت ث د ذ ر ز س ش ص ض ط ظ ل ن'.split(), 'نكتب «ال» ولا ننطق اللام، ويُشدَّد الحرف بعدها', 'الشَّمْس · الرَّجُل · النَّجْمة')
    return sp, P(sp, 'اللام الشمسية واللام القمرية', 'كيف ننطق «ال» التعريف؟', f'<div style="display:flex;flex-direction:column;gap:4mm;flex:1;min-height:0">{s}{m}</div>')
