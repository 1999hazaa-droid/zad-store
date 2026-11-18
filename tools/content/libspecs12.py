# -*- coding: utf-8 -*-
# قسم الأنشطة: أوراق عمل أنشطة (مطابقة، قص ولصق، تلوين، ترتيب، تتبّع). الأجوبة تُحسب برمجيًا.
import random, importlib.util, os
from libspecs11 import *
from libspecs3 import _h
_d = importlib.util.spec_from_file_location('cdata', os.path.join(os.path.dirname(__file__), 'cards', 'data.py'))
_cd = importlib.util.module_from_spec(_d); _d.loader.exec_module(_cd)
LETS = [(r[1], r[2], r[4], r[5]) for r in _cd.LET if r[5] and not r[5].startswith('@')]
ALLL = [r[1] for r in _cd.LET]   # حرف، اسم، كلمة، صورة
GRAY = 'filter:grayscale(1) brightness(1.3) contrast(.9) drop-shadow(0 0 .35mm #222) drop-shadow(0 0 .35mm #222)'
def gimg(n, h): return f'<img src="{IMGS}{n}.webp" style="height:{h}mm;max-width:100%;object-fit:contain;{GRAY}">'
def noans(): return ''
def swatch(c): return f'<span style="display:inline-block;width:13mm;height:13mm;border-radius:50%;background:{c};border:.8mm solid #fff;box-shadow:0 0 0 .5mm #bbb"></span>'
def lm(left, right, lh=None):
    return line_match(left, right)
def board(cols, c, h=120):
    return '<div style="display:flex;gap:8mm;margin-top:4mm">' + ''.join(f'<div style="flex:1;border:.8mm solid {c};border-radius:6mm;background:#fff;min-height:{h}mm;display:flex;flex-direction:column"><div style="background:{c};color:#fff;text-align:center;font-weight:700;font-size:16pt;border-radius:4mm 4mm 0 0;padding:2mm">{t}</div><div style="flex:1"></div></div>' for t in cols) + '</div>'
def cutgrid(items, c, h=30, cols=2):
    return f'<div style="display:grid;grid-template-columns:repeat({cols},1fr);gap:5mm">' + ''.join(piece(a, l, c, h) for a, l in items) + '</div>'
def tbl(head, rows): return '<table><tr>' + ''.join(f'<th>{h}</th>' for h in head) + '</tr>' + ''.join('<tr>' + ''.join(f'<td style="text-align:center">{c}</td>' for c in r) + '</tr>' for r in rows) + '</table>'
def note(t): return S5  # placeholder

def act_colors():
    C, T = '#e11d48', '#ffe4ea'
    pairs = [('#e53935', '1f34e', 'أحمر', 'التفاحة'), ('#fdd835', '1f34c', 'أصفر', 'الموزة'), ('#8e24aa', '1f347', 'بنفسجي', 'العنب'), ('#43a047', '1f952', 'أخضر', 'الخيار'), ('#1e88e5', '1fad0', 'أزرق', 'التوت الأزرق'), ('#fb8c00', '1f34a', 'برتقالي', 'البرتقالة')]
    right = shuf(pairs, 4)
    L = [f'<div style="display:flex;align-items:center;justify-content:center;gap:4mm">{swatch(c)}<b style="font-size:15pt">{n}</b></div>' for c, _, n, _ in pairs]
    R = [I(im, 14) for _, im, _, _ in right]
    P = [('أصِل اللون بالفاكهة', 'صِل كل لون بالفاكهة التي لها هذا اللون.', lm(L, R), 'ws')]
    cells = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm">' + ''.join(f'<div class="q" style="flex-direction:column;justify-content:center;text-align:center;min-height:62mm">{gimg(im, 38)}<div style="font-size:15pt;font-weight:700">{w}</div></div>' for _, im, _, w in pairs) + '</div>'
    P.append(('ألوّن كل ثمرة بلونها', 'استعمل ألوان الخشب أو الشمع. اللون الصحيح مكتوب في الصفحة السابقة.', cells, 'ws'))
    key = '<p><b>التوصيل:</b> ' + '، '.join(f'{n} ← {w}' for _, _, n, w in pairs) + '</p><p>التلوين حرّ لكن اللون الصحيح للثمرة كما في صفحة التوصيل.</p>'
    return fin(S5('act-colors-fruit-match', 'أطابق الألوان وألوّن', 'أصل اللون بالفاكهة ثم ألوّنها', ['من سنتين إلى 4 سنوات', 'أنشطة الألوان', 'مطابقة وتلوين', 'مع الحلول'], C, T, 'يجلس ولي الأمر بجانب الطفل ويسمّي الألوان معه.'), P, key)

def act_landsea():
    C, T = '#0284c7', '#dbf0fb'
    items = [('1f404', 'بقرة', 'برّ'), ('1f434', 'حصان', 'برّ'), ('1f414', 'دجاجة', 'برّ'), ('1f41f', 'سمكة', 'ماء'), ('1f419', 'أخطبوط', 'ماء'), ('1f42c', 'دلفين', 'ماء')]
    P = [('كيف نعمل؟', 'نصنّف الحيوانات حسب مكان عيشها.', TIPS(['اطلب من شخص كبير مساعدتك في استعمال المقص.', 'قصّ الصور من صفحة «القص» على الخط المتقطع.', 'ألصق كل حيوان في العمود الذي يعيش فيه: على اليابسة أو في الماء.', 'قل اسم كل حيوان بصوت عالٍ وأنت تلصقه.']), 'ws')]
    P.append(('ألصق الحيوانات', 'أين يعيش كل حيوان؟', board(['يعيش على اليابسة', 'يعيش في الماء'], C, 170), 'ws'))
    P.append(('صور الحيوانات (القص)', 'قصّ الصور على الخط المتقطع.', cutgrid(shuf([(a, l) for a, l, _ in items], 5), C, 32, 2), 'card'))
    key = '<p><b>على اليابسة:</b> بقرة، حصان، دجاجة.</p><p><b>في الماء:</b> سمكة، أخطبوط، دلفين.</p>'
    return fin(S5('act-land-sea-sorting', 'أصنّف الحيوانات: برّ وماء', 'قص ولصق: أين يعيش الحيوان؟', ['من 3 إلى 6 سنوات', 'قص ولصق', 'تصنيف الحيوانات', 'مع الحلول'], C, T, 'تحتاج إلى مقص آمن وغراء. اطلب مساعدة شخص كبير.'), P, key)

def act_plant():
    C, T = '#16a34a', '#dcf5e4'
    st = [('x_seed', 'البذور'), ('x_soil', 'البذرة تنبت في التراب'), ('x_plant', 'نبتة صغيرة'), ('x_flowerpot', 'نبتة مزهرة')]
    P = [('كيف نعمل؟', 'نرتّب مراحل نموّ النبتة.', TIPS(['قصّ الصور الأربع من صفحة «القص» بمساعدة شخص كبير.', 'فكّر: ماذا يحدث أولاً؟ ثم ماذا؟', 'ألصق الصور في المربعات من ١ إلى ٤ بالترتيب.', 'احكِ لشخص كبير قصة النبتة بكلماتك.']), 'ws')]
    boxes = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6mm;margin-top:4mm">' + ''.join(pastebox(i + 1, C, 'ألصق هنا').replace('flex:1;', '') for i in range(4)) + '</div>'
    P.append(('ألصق المراحل بالترتيب', 'من الأولى إلى الرابعة.', boxes, 'ws'))
    P.append(('صور المراحل (القص)', 'قصّ الصور على الخط المتقطع.', cutgrid(shuf(st, 11), C, 36, 2), 'card'))
    key = '<p><b>الترتيب الصحيح:</b> 1) ' + ' ← 2) '.join([st[0][1], st[1][1], st[2][1], st[3][1]]).replace(' ← 2)', ' ← 2)') + '</p>'
    key = '<p><b>الترتيب الصحيح:</b> ' + ' ← '.join(f'{i + 1}) {l}' for i, (_, l) in enumerate(st)) + '</p>'
    return fin(S5('act-plant-growth-order', 'أرتّب مراحل نموّ النبتة', 'قص ولصق: من البذرة إلى الزهرة', ['من 4 إلى 6 سنوات', 'ترتيب وتسلسل', 'العلوم', 'مع الحلول'], C, T, 'تحتاج إلى مقص آمن وغراء. اطلب مساعدة شخص كبير.'), P, key)

def act_letters():
    C, T = '#7c3aed', '#ece4fd'
    L = LETS[:10]; r = random.Random(21)
    P = []; key = []
    for pg in (0, 1):
        sub = L[pg * 5:(pg + 1) * 5]; right = shuf(sub, 30 + pg)
        left = [f'<div style="text-align:center;font-size:36pt;font-weight:700;color:{C};line-height:1.1">{a}</div>' for a, *_ in sub]
        P.append((f'أصِل الحرف بالصورة ({pg + 1})', 'انطق اسم الصورة، وصِل بالحرف الذي تبدأ به.', lm(left, [I(im, 20) for *_, im in right]), 'ws'))
        key.append('، '.join(f'{a} ← {w}' for a, _, w, _ in sub))
    return fin(S5('act-letters-pictures-match', 'أصِل الحرف بالصورة', 'كل صورة تبدأ بحرف', ['من 4 إلى 6 سنوات', 'الحروف العربية', 'توصيل ومطابقة', 'مع الحلول'], C, T, 'انطق الكلمات مع الطفل ببطء ليسمع الحرف الأول.'), P, '<p>' + '</p><p>'.join(key) + '</p>')

def act_trace():
    C, T = '#0d9488', '#d8f5f1'
    P = []
    for pg in range(5):
        sub = [(a,) for a in ALLL[pg * 6:(pg + 1) * 6]]
        rows = ''.join(f'<div class="q" style="min-height:30mm;gap:4mm"><span class="no">{pg * 6 + i + 1}</span><b style="font-size:36pt;color:{C}">{a}</b>' + ''.join(f'<span style="font-size:36pt;color:#d3ccea;font-weight:700">{a}</span>' for _ in range(4)) + '<span class="opt" style="min-width:20mm;height:18mm"></span></div>' for i, (a, *_) in enumerate(sub))
        P.append((f'أتتبّع الحروف ({pg + 1})', 'ضع القلم فوق الحرف الباهت، ثم اكتب الحرف بنفسك في المربع.', '<div style="display:flex;flex-direction:column;gap:3mm">' + rows + '</div>', 'ws'))
    return S5('act-trace-letters', 'أتتبّع الحروف وأكتبها', 'تدريب على كتابة الحروف الهجائية', ['من 5 إلى 6 سنوات', 'الحروف العربية', 'كتابة'], C, T, 'يُفضّل قلم رصاص. كل حرف يُكتب من الأعلى وبحركة هادئة.'), P

def act_scramble():
    C, T = '#ea580c', '#ffeadb'
    W3 = [('قطة', '1f431'), ('بيت', '1f3e0'), ('شمس', '2600'), ('قمر', '1f319')]
    W4 = [('سمكة', '1f41f'), ('جمل', '1f42a'), ('تفاحة', '1f34e'), ('أرنب', '1f430')]
    def pg(ws, seed):
        out = ''
        for i, (w, im) in enumerate(ws):
            ls = list(w)
            sh_ = ls[:]; rr = random.Random(seed + i)
            for _ in range(20):
                rr.shuffle(sh_)
                if sh_ != ls: break
            out += f'<div class="q" style="min-height:34mm;gap:5mm"><span class="no">{i + 1}</span>{I(im, 24)}<div style="flex:1"><div style="display:flex;gap:3mm;justify-content:center">' + ''.join(f'<span class="opt" style="font-size:24pt;padding:1mm 4mm">{x}</span>' for x in sh_) + '</div><div style="margin-top:3mm"><span class="ans" style="min-width:70mm"></span></div></div></div>'
        return '<div style="display:flex;flex-direction:column;gap:3mm">' + out + '</div>'
    P = [('أرتّب الحروف: كلمات من ثلاثة حروف', 'انظر إلى الصورة ثم رتّب الحروف واكتب الكلمة.', pg(W3[:4], 40), 'ws'), ('أرتّب الحروف: كلمات أطول', 'الحروف مبعثرة. اكتب الكلمة مرتّبة على الخط.', pg(W4[:4], 50), 'ws')]
    key = K('ثلاثة حروف', [w for w, _ in W3]) + K('كلمات أطول', [w for w, _ in W4])
    return fin(S5('act-scrambled-words', 'أرتّب الحروف وأكوّن كلمة', 'من الحروف المبعثرة إلى الكلمة', ['الصف الأول والثاني', 'اللغة العربية', 'تكوين الكلمات', 'مع الحلول'], C, T, 'اكتب الحروف متصلة كما تكتب الكلمة عادة.'), P, key)

def act_count():
    C, T = '#2563eb', '#dfe9fd'
    fr_ = [('1f34e', 3), ('1f34c', 5), ('1f347', 2), ('1f34a', 4), ('1f353', 6), ('1f952', 1)]
    r = shuf(fr_, 9)
    left = [f'<div style="text-align:center">{"".join(I(im, 11) for _ in range(n))}</div>' for im, n in fr_]
    right = [f'<div style="text-align:center;font-size:26pt;font-weight:700;color:{C}">{n}</div>' for _, n in r]
    P = [('أعدّ وأصِل', 'عُدّ الصور في كل مربع وصِل بالرقم المناسب.', lm(left, right), 'ws')]
    qs = ''.join(f'<div class="bx"><b>{i + 1})</b> {"".join(I(im, 13) for _ in range(n))}<br>{chips([str(x) for x in sorted({n, max(1, n - 1), n + 1})])}</div>' for i, (im, n) in enumerate(shuf(fr_, 3)[:4]))
    P.append(('كم عددها؟', 'عُدّ وضع دائرة حول الرقم الصحيح.', qs, 'ws'))
    shown = shuf(fr_, 3)[:4]
    key = '<p><b>التوصيل:</b> ' + '، '.join(f'{n}' for _, n in fr_) + ' (عدد الصور في المربعات بالترتيب)</p>' + K('كم عددها', [n for _, n in shown])
    return fin(S5('act-count-number-match', 'أعدّ وأطابق الرقم بالكمية', 'عدّ الصور وربطها بالرقم', ['من 3 إلى 6 سنوات', 'الأرقام والعدّ', 'مطابقة', 'مع الحلول'], C, T, 'عُدّ مع الطفل بإصبعه على كل صورة.'), P, key)

def act_addsub():
    C, T = '#7c3aed', '#ece4fd'
    adds = [(2, 1), (3, 2), (4, 3), (5, 2), (6, 3), (4, 5)]; subs = [(5, 2), (7, 3), (6, 4), (9, 5), (8, 3), (10, 4)]
    def row(i, a, b, op, im):
        pics = ''.join(I(im, 9) for _ in range(a)) + f'<b style="font-size:20pt;margin:0 3mm">{op}</b>' + ''.join(I(im, 9) for _ in range(b))
        return Q(i, f'<div dir="ltr" style="display:flex;align-items:center;flex-wrap:wrap">{pics}<b style="font-size:20pt;margin:0 3mm">=</b><span class="ans" style="min-width:16mm"></span></div>', 'full')
    ims = ['1f34e', '1f34a', '1f353', '1f347', '1f34c', '1f34e']
    P = [('أجمع بالصور', 'عُدّ الصور واجمعها واكتب الناتج.', '<div class="grid">' + ''.join(row(i + 1, a, b, '+', ims[i]) for i, (a, b) in enumerate(adds)) + '</div>', 'ws')]
    P.append(('أطرح', 'الصور التي نطرحها عددها بعد علامة (−). اكتب الناتج.', '<div class="grid">' + ''.join(Q(i + 1, ltr(f'{a} − {b} = <span class="ans" style="min-width:16mm"></span>'), 'full') for i, (a, b) in enumerate(subs)) + '</div>', 'ws'))
    key = K('الجمع', [a + b for a, b in adds]) + K('الطرح', [a - b for a, b in subs])
    return fin(S5('act-add-subtract-10', 'أجمع وأطرح حتى 10', 'جمع بالصور وطرح بالأرقام', ['الصف الأول', 'الجمع والطرح', 'الرياضيات', 'مع الحلول'], C, T, 'استعمل أصابعك أو حبّات صغيرة للعدّ إن احتجت.'), P, key)

def act_order():
    C, T = '#0891b2', '#dcf4fa'
    seqs = [(1, 2, None, 4, 5), (6, None, 8, 9, 10), (2, 4, None, 8, 10), (10, 9, None, 7, 6), (11, 12, 13, None, 15), (5, 10, None, 20, 25)]
    full = [(1, 2, 3, 4, 5), (6, 7, 8, 9, 10), (2, 4, 6, 8, 10), (10, 9, 8, 7, 6), (11, 12, 13, 14, 15), (5, 10, 15, 20, 25)]
    def srow(i, s): return Q(i, ltr(''.join(f'<b style="font-size:20pt;margin:0 2mm">{x}</b>' if x is not None else '<span class="ans" style="min-width:14mm"></span>' for x in s)), 'full')
    P = [('أكمل العدّ', 'اكتب العدد الناقص في كل صف.', '<div class="grid">' + ''.join(srow(i + 1, s) for i, s in enumerate(seqs)) + '</div>', 'ws')]
    sets = [[7, 2, 9, 4], [15, 11, 18, 12], [30, 10, 50, 20], [8, 3, 6, 1]]
    srt = [sorted(x) for x in sets]
    body = '<div class="grid">' + ''.join(Q(i + 1, ltr(' ، '.join(f'<b style="font-size:18pt">{x}</b>' for x in s) + ' ← <span class="ans" style="min-width:60mm"></span>'), 'full') for i, s in enumerate(sets)) + '</div>'
    P.append(('أرتّب من الأصغر إلى الأكبر', 'اكتب الأعداد بالترتيب من الأصغر إلى الأكبر.', body, 'ws'))
    pr = [(7, 4), (12, 15), (20, 10), (9, 19), (30, 3), (45, 54)]
    body = '<div class="grid">' + ''.join(Q(i + 1, ltr(f'{chips([str(a)])}<b>؟</b>{chips([str(b)])}') + '<span style="font-size:11pt;margin-inline-start:3mm">ضع دائرة حول الأكبر</span>', 'full') for i, (a, b) in enumerate(pr)) + '</div>'
    P.append(('أيّهما أكبر؟', 'قارن بين العددين وضع دائرة حول العدد الأكبر.', body, 'ws'))
    key = '<p><b>الأعداد الناقصة:</b> ' + '، '.join(str(f[s.index(None)]) for f, s in zip(full, seqs)) + '</p><p><b>الترتيب:</b> ' + ' | '.join(' ، '.join(map(str, s)) for s in srt) + '</p>' + K('الأكبر', [max(a, b) for a, b in pr])
    return fin(S5('act-order-compare-numbers', 'أرتّب الأعداد وأقارن', 'العدّ الناقص والترتيب والمقارنة', ['الصف الأول والثاني', 'ترتيب الأعداد', 'الرياضيات', 'مع الحلول'], C, T, 'اقرأ الأعداد بصوت عالٍ أثناء الحل.'), P, key)

def act_senses():
    C, T = '#db2777', '#fde7f1'
    S_ = [('x_eye', 'العين', 'البصر'), ('x_ear', 'الأذن', 'السمع'), ('x_nose', 'الأنف', 'الشمّ'), ('x_mouth', 'الفم واللسان', 'التذوّق'), ('x_hand', 'اليد', 'اللمس')]
    right = shuf(S_, 13)
    P = [('أصِل العضو بحاسّته', 'صِل صورة كل عضو بالحاسة التي نستعملها به.', lm([I(im, 15) + f'<div style="font-size:11pt;font-weight:700">{n}</div>' for im, n, _ in S_], [f'<div style="font-size:18pt;font-weight:700;text-align:center">{h}</div>' for *_, h in right]), 'ws')]
    Qs = [('أسمع صوت الجرس بـ…', ['العين', 'الأذن', 'اليد'], 'الأذن'), ('أشمّ رائحة الوردة بـ…', ['الأنف', 'الفم', 'الأذن'], 'الأنف'), ('أرى الألوان بـ…', ['اليد', 'العين', 'الأنف'], 'العين'), ('أحسّ بنعومة القطن بـ…', ['العين', 'الأذن', 'اليد'], 'اليد'), ('أتذوّق طعم العسل بـ…', ['اللسان', 'الأنف', 'الأذن'], 'اللسان')]
    P.append(('أيّ حاسّة أستعمل؟', 'ضع دائرة حول الإجابة الصحيحة.', mcq(Qs), 'ws'))
    key = '<p><b>التوصيل:</b> ' + '، '.join(f'{n} ← {h}' for _, n, h in S_) + '</p>' + K('أيّ حاسّة', [a for *_, a in Qs])
    return fin(S5('act-five-senses-match', 'حواسّي الخمس', 'أصِل العضو بالحاسّة وأتعرّف على استعمالها', ['الصف الأول والثاني', 'الحواس الخمس', 'العلوم', 'مع الحلول'], C, T, 'اطلب من الطفل أن يجرّب كل حاسة بشيء حقيقي حوله.'), P, key)

def act_hygiene():
    C, T = '#0891b2', '#dcf4fa'
    days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    tasks = [('1faa5', 'أنظّف أسناني صباحاً'), ('1f9fc', 'أغسل يديّ قبل الأكل'), ('1f9fc', 'أغسل يديّ بعد الحمّام'), ('1faa5', 'أنظّف أسناني مساءً')]
    chk = '<span class="opt" style="min-width:9mm;height:9mm"></span>'
    rows = [[f'<div style="display:flex;align-items:center;gap:3mm;text-align:start">{I(im, 12)}<b style="font-size:12pt">{t}</b></div>'] + [chk] * 7 for im, t in tasks]
    P = [('لوحة نظافتي الأسبوعية', 'لوّن المربع أو ضع علامة ✓ بعد كل مرة. يؤكّد ولي الأمر معك.', tbl(['المهمة'] + days, rows), 'ws')]
    steps = ['أبلّل يديّ بالماء', 'أضع الصابون', 'أفرك كفّيّ وأصابعي', 'أفرك ظهر اليدين', 'أشطف بالماء', 'أجفّف يديّ بمنشفة نظيفة']
    body = '<p class="ins">رتّب خطوات غسل اليدين بوضع الأرقام من ١ إلى ٦. الخطوة الأولى مرقّمة لك.</p>' + order_rows([f'{t}' for t in shuf(steps, 3)])
    P.append(('أرتّب خطوات غسل اليدين', 'اكتب رقم الخطوة في المربع.', body, 'ws'))
    key = '<p><b>الترتيب الصحيح:</b> ' + ' ← '.join(f'{i + 1}) {t}' for i, t in enumerate(steps)) + '</p><p>اللوحة الأسبوعية يملؤها الطفل مع ولي الأمر خارج المنصة.</p>'
    return fin(S5('act-hygiene-chart', 'لوحة نظافتي اليومية', 'أتابع عادات النظافة طوال الأسبوع', ['من 3 إلى 6 سنوات', 'النظافة الشخصية', 'المهارات الحياتية', 'مع الحلول'], C, T, 'علّقها في مكان يراه الطفل، وأثنِ عليه عند كل إنجاز.'), P, key)

def act_tasks():
    C, T = '#d97706', '#fdf0d3'
    days = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة']
    tasks = ['أرتّب سريري', 'أضع ملابسي المتّسخة في السلّة', 'أعيد ألعابي إلى مكانها', 'أساعد في وضع الأطباق على المائدة', 'أسقي النبتة بمساعدة شخص كبير']
    chk = '<span class="opt" style="min-width:9mm;height:9mm"></span>'
    P = [('لوحة مهامّي', 'اختر مهامّ مناسبة لك مع ولي الأمر، ثم ضع ✓ عند إنجازها.', tbl(['المهمة'] + days, [[f'<b style="font-size:11.5pt">{t}</b>'] + [chk] * 7 for t in tasks]), 'ws')]
    body = '<p class="ins">اكتب أو ارسم مهمة تحبّ أن تتحمّل مسؤوليتها هذا الأسبوع:</p><div class="q" style="min-height:50mm"></div><p class="ins" style="margin-top:6mm">كيف شعرت عندما أنجزتها؟</p><div class="q" style="min-height:40mm"></div>'
    P.append(('أتحمّل مسؤوليتي', 'فكّر ثم اكتب أو ارسم.', body, 'ws'))
    return S5('act-tasks-board', 'لوحة مهامّي ومسؤوليتي', 'أتعلّم تحمّل المسؤولية خطوة خطوة', ['من 4 إلى 6 سنوات', 'تحمّل المسؤولية', 'المهارات الحياتية'], C, T, 'اختر مهامّ بسيطة وآمنة، ولا تُحمّل الطفل ما يفوق عمره.'), P

def act_color_farm():
    C, T = '#ea580c', '#ffeadb'
    an = [('1f404', 'بقرة'), ('1f434', 'حصان'), ('1f414', 'دجاجة'), ('1f411', 'خروف'), ('1f42a', 'جمل'), ('1f430', 'أرنب')]
    P = []
    for pg in (0, 1):
        cells = '<div style="display:grid;grid-template-columns:1fr;gap:6mm">' + ''.join(f'<div class="q" style="justify-content:center;gap:10mm;min-height:62mm">{gimg(im, 46)}<div style="font-size:26pt;font-weight:700;color:{C}">{w}</div></div>' for im, w in an[pg * 3:pg * 3 + 3]) + '</div>'
        P.append((f'ألوّن الحيوانات ({pg + 1})', 'ألوّن كل حيوان بألوانه المفضّلة ثم قل اسمه.', cells, 'ws'))
    return S5('act-color-farm-animals', 'ألوّن حيوانات المزرعة', 'تلوين وتعرّف على أسماء الحيوانات', ['من 2 إلى 5 سنوات', 'تلوين', 'الحيوانات'], C, T, 'استعمل ألوان خشب أو شمع آمنة للأطفال.'), P

def act_en_match():
    C, T = '#4f46e5', '#e3e1fc'
    E_ = [('A', '1f34e', 'Apple'), ('B', '26bd', 'Ball'), ('C', '1f431', 'Cat'), ('D', '1f436', 'Dog'), ('E', '1f418', 'Elephant'), ('F', '1f41f', 'Fish')]
    right = shuf(E_, 17)
    P = [('Match the letter to the picture', 'Draw a line from each letter to its picture.', lm([f'<div style="text-align:center;font-size:28pt;font-weight:700;color:{C}" dir="ltr">{a}</div>' for a, *_ in E_], [I(im, 14) for _, im, _ in right]), 'ws')]
    qs = ''.join(f'<div class="bx" style="display:flex;align-items:center;gap:6mm">{I(im, 18)}<div><b>{i + 1})</b> <span dir="ltr" style="unicode-bidi:isolate">{w[1:]}</span> … ؟ {chips([x for x in shuf(["A", "B", "C", "D", "E", "F"], 60 + i)[:3] if x != a] + [a])}</div></div>' for i, (a, im, w) in enumerate(shuf(E_, 8)[:4]))
    P.append(('Which letter does it start with?', 'Circle the first letter of the word.', qs, 'ws'))
    key = '<p dir="ltr"><b>Match:</b> ' + ', '.join(f'{a} = {w}' for a, _, w in E_) + '</p>'
    return fin(S5('act-en-letters-pictures', 'Match letters and pictures', 'ABC: letters A to F', ['Grade 1-2', 'English letters', 'Matching', 'With answers'], C, T, 'Say each word aloud with your child.'), P, key)

ALL.update(act_colors=act_colors, act_landsea=act_landsea, act_plant=act_plant, act_letters=act_letters, act_trace=act_trace,
           act_scramble=act_scramble, act_count=act_count, act_addsub=act_addsub, act_order=act_order, act_senses=act_senses,
           act_hygiene=act_hygiene, act_tasks=act_tasks, act_color_farm=act_color_farm, act_en_match=act_en_match)
