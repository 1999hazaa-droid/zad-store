# -*- coding: utf-8 -*-
# توسعة: الصف الأول (علوم وإنجليزي)
from libspecs5 import *
from libspecs3 import _h

def swatch(c, w=26, h=14):
    return f'<span style="display:inline-block;width:{w}mm;height:{h}mm;border-radius:4mm;background:{c};border:.6mm solid #777"></span>'

def sci1a():
    C, T = '#ea580c', '#ffeadb'
    O = [('x_eye', 'العين', 'أرى'), ('x_ear', 'الأذن', 'أسمع'), ('x_nose', 'الأنف', 'أشمّ'), ('x_mouth', 'الفم', 'أتذوّق'), ('x_hand', 'اليد', 'ألمس')]
    P = [('حواسي الخمس', 'لكل حاسّة عضو نستعمله. انظر وردّد معي.', tiles([(a, f'<b>{n}</b><br>{v}') for a, n, v in O], 3, 24), 'ws')]
    Q = [('1f339', 'رائحة الوردة', 'الأنف', ['الأنف', 'الأذن', 'العين']), ('1f3b5', 'صوت الموسيقى', 'الأذن', ['اليد', 'الأذن', 'الفم']),
         ('1f34b', 'طعم الليمون', 'الفم', ['العين', 'الفم', 'الأنف']), ('x_ice', 'برودة الثلج', 'اليد', ['اليد', 'الأذن', 'الأنف']),
         ('1f308', 'ألوان قوس قزح', 'العين', ['الفم', 'العين', 'اليد'])]
    body = ''.join(f'<div class="bx" style="display:flex;align-items:center;gap:5mm">{I(a, 20)}<div style="font-size:14pt"><b>{i+1})</b> {t}<br>{chips(o)}</div></div>' for i, (a, t, _, o) in enumerate(Q))
    P.append(('أي عضو أستعمل؟', 'انظر إلى الصورة وضع دائرة حول العضو الذي أستعمله.', body, 'ws'))
    t = [('نرى بالعين.', 'صح'), ('نسمع بالأنف.', 'خطأ'), ('نشمّ الرائحة بالأنف.', 'صح'), ('نتذوّق الطعام بالفم.', 'صح'), ('نلمس الأشياء بالعين.', 'خطأ'), ('عدد حواسّنا الأساسية خمس.', 'صح')]
    P.append(('صح أم خطأ؟', 'اقرأ العبارة وضع دائرة حول الإجابة.', tf(t) + f'<p class="ins" style="margin-top:5mm">أكمل: حواسّي هي: البصر و{ans_line(24)} و{ans_line(24)} و{ans_line(24)} و{ans_line(24)}.</p>', 'ws'))
    key = K('أي عضو؟', [a for *_, a, _ in Q]) + K('صح وخطأ', [a for _, a in t]) + '<p>الإكمال: السمع، الشمّ، الذوق، اللمس.</p>'
    return fin(S5('g1-five-senses', 'حواسّي الخمس', 'أتعرّف على العين والأذن والأنف والفم واليد', ['الصف الأول', 'العلوم', 'الجسم والحواس', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def sci1b():
    C, T = '#2563eb', '#dfe9ff'
    it = [('2600', 'الشمس', 'نهار'), ('x_sunrise', 'شروق الشمس', 'نهار'), ('1f3c3', 'الركض في الحديقة', 'نهار'), ('2b50', 'النجوم', 'ليل'), ('x_sleep', 'النوم', 'ليل'), ('x_night', 'الليل المظلم', 'ليل')]
    P = [('نهار أم ليل؟', 'انظر إلى الصورة وضع دائرة حول الوقت المناسب.', tiles([(a, f'<b>{n}</b><br>{chips(["نهار", "ليل"])}') for a, n, _ in it], 3, 22), 'ws')]
    ev = ['أستيقظ من النوم', 'أذهب إلى المدرسة', 'ألعب بعد المدرسة', 'أنام في الليل']
    P.append(('أرتّب يومي', 'رقّم الأحداث من 1 إلى 4 حسب ترتيبها خلال اليوم.', order_rows(shuf(ev, 6)), 'ws'))
    t = [('الشمس تظهر في النهار.', 'صح'), ('نرى النجوم في الليل.', 'صح'), ('ننام عادةً في الليل.', 'صح'), ('اللعب في الحديقة يكون غالبًا في النهار.', 'صح'), ('الشمس تضيء السماء ليلًا.', 'خطأ')]
    body = tf(t) + '<p class="ins" style="margin-top:4mm">ارسم ما تراه في النهار وما تراه في الليل:</p><div style="display:flex;gap:6mm"><div class="q" style="flex:1;min-height:55mm;justify-content:center">في النهار</div><div class="q" style="flex:1;min-height:55mm;justify-content:center">في الليل</div></div>'
    P.append(('أحكم وأرسم', 'اختر صح أو خطأ ثم ارسم.', body, 'ws'))
    key = K('نهار أم ليل', [f'{n}: {a}' for _, n, a in it]) + '<p><b>ترتيب اليوم:</b> ' + ' ← '.join(f'{i+1}) {e}' for i, e in enumerate(ev)) + '</p>' + K('صح وخطأ', [a for _, a in t]) + '<p>الرسم حرّ.</p>'
    return fin(S5('g1-day-and-night', 'النهار والليل', 'أفرّق بين ما نراه ونفعله في النهار والليل', ['الصف الأول', 'العلوم', 'الزمن', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

COL = [('red', 'أحمر', '#dc2626'), ('blue', 'أزرق', '#2563eb'), ('yellow', 'أصفر', '#facc15'), ('green', 'أخضر', '#16a34a'), ('orange', 'برتقالي', '#f97316'), ('purple', 'بنفسجي', '#7e22ce'), ('pink', 'وردي', '#ec4899'), ('black', 'أسود', '#111111'), ('white', 'أبيض', '#ffffff')]
def en1a():
    C, T = '#7c3aed', '#efe6ff'
    cards = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5mm">' + ''.join(f'<div class="q" style="flex-direction:column;justify-content:center;gap:2mm;min-height:42mm">{swatch(c)}<div style="font-size:18pt">{EN(e)}</div><div style="font-size:12pt;color:#6d6684">{a}</div></div>' for e, a, c in COL) + '</div>'
    P = [('Colours', 'تعرّف على أسماء الألوان بالإنجليزية وردّدها.', cards, 'ws')]
    pick = [COL[i] for i in (0, 1, 2, 3, 4, 6)]
    body = '<p class="ins">' + EN('What colour is it?') + ' ضع دائرة حول الاسم الصحيح.</p>' + ''.join(
        f'<div class="bx" style="display:flex;align-items:center;gap:6mm">{swatch(c, 24, 13)}<div>' + LR(*[f'<span class="opt">{EN(o)}</span>' for o in shuf([e, COL[(k + 3) % 9][0], COL[(k + 6) % 9][0]], k)]) + '</div></div>' for k, (e, a, c) in enumerate(pick))
    P.append(('What colour is it?', 'انظر إلى اللون واختر اسمه.', body, 'ws'))
    sh = [('red', '#dc2626'), ('blue', '#2563eb'), ('green', '#16a34a'), ('yellow', '#facc15'), ('purple', '#7e22ce'), ('orange', '#f97316')]
    sq = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5mm">' + ''.join(f'<div class="q" style="flex-direction:column;justify-content:center;min-height:52mm;gap:3mm"><svg viewBox="0 0 100 100" width="34mm"><{"circle cx=50 cy=50 r=42" if i % 2 == 0 else "rect x=10 y=10 width=80 height=80 rx=10"} fill="#fff" stroke="#555" stroke-width="3"/></svg><div style="font-size:13pt">{EN("Colour me " + e + ".")}</div></div>' for i, (e, c) in enumerate(sh)) + '</div>'
    P.append(('Colour the shapes', 'لوّن كل شكل باللون المكتوب تحته.', sq, 'ws'))
    key = K('Page 3', [EN(o) for o in [e for e, *_ in pick]]) + '<p>Page 4: كل شكل يُلوَّن باللون المكتوب تحته.</p>'
    return fin(S5('g1-english-colours', 'Colours', 'ألوان بالإنجليزية: أتعرّف وأختار وألوّن', ['الصف الأول', 'اللغة الإنجليزية', 'المفردات', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

def en1b():
    C, T = '#0d9488', '#dcf7f2'
    B = [('x_eye', 'eyes', 'العينان'), ('x_ear', 'ears', 'الأذنان'), ('x_nose', 'nose', 'الأنف'), ('x_mouth', 'mouth', 'الفم'), ('x_hand', 'hand', 'اليد'), ('x_foot', 'foot', 'القدم')]
    P = [('Body parts', 'انظر إلى الصورة وردّد الكلمة.', tiles([(a, f'{EN(w)}<br>{ar}') for a, w, ar in B], 3, 24), 'ws')]
    wb = f'<p class="ins">{chips([EN(w) for _, w, _ in sorted(B, key=lambda x: x[1])])}</p>'
    P.append(('Write the word', 'اكتب الكلمة تحت الصورة من الصندوق.', wb + tiles([(a, LR(ans_line(36))) for a, _, _ in B], 3, 24), 'ws'))
    Q = [('I see with my', ['eyes', 'ears', 'nose'], 'eyes'), ('I smell with my', ['mouth', 'nose', 'foot'], 'nose'), ('I hear with my', ['ears', 'hand', 'eyes'], 'ears'), ('I eat with my', ['mouth', 'foot', 'nose'], 'mouth')]
    body = '<p class="ins">اختر الكلمة الصحيحة:</p>' + ''.join(f'<div class="bx"><b>{i+1})</b> ' + LR(EN(q), '<span style="font-size:1pt">&nbsp;</span>', *[f'<span class="opt">{EN(o)}</span>' for o in os_]) + '</div>' for i, (q, os_, _) in enumerate(Q))
    P.append(('Choose the word', 'اقرأ الجملة واختر الكلمة المناسبة.', body, 'ws'))
    key = K('Page 3', [EN(w) for _, w, _ in B][:6]) + K('Page 4', [EN(a) for *_, a in Q])
    return fin(S5('g1-english-body-parts', 'Body parts', 'أجزاء الجسم بالإنجليزية: eyes, ears, nose, mouth...', ['الصف الأول', 'اللغة الإنجليزية', 'المفردات', 'مع الحلول'], C, T, 'اطبع الصفحات وأجب عنها، ثم راجع الإجابات في الصفحة الأخيرة.'), P, key)

en1a, en1b = _h(en1a), _h(en1b)
ALL.update(sci1a=sci1a, sci1b=sci1b, en1a=en1a, en1b=en1b)
