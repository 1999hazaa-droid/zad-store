# -*- coding: utf-8 -*-
from pract import *
from posters import C, gridcells

@spec('pr-color-shapes')
def _():
    sp = PR(title='ألوّن الأشكال', desc='ستة أشكال كبيرة غير ملوّنة (دائرة ومربع ومثلث ومستطيل ونجمة وقلب) مع اسم كل شكل، ليلوّنها الطفل بحرية وهو يتعلم أسماءها.', levels=['a4', 'a5', 'a6', 'g1'], subject='الرياضيات', topic='الأشكال', sort=30)
    star = ' '.join(f'{50 + (42 if i % 2 == 0 else 18) * math.cos(-math.pi / 2 + i * math.pi / 5):.1f},{52 + (42 if i % 2 == 0 else 18) * math.sin(-math.pi / 2 + i * math.pi / 5):.1f}' for i in range(10))
    S_ = [('دائرة', '<circle cx="50" cy="50" r="40"/>'), ('مربع', '<rect x="12" y="12" width="76" height="76"/>'), ('مثلث', '<polygon points="50,10 92,88 8,88"/>'), ('مستطيل', '<rect x="6" y="24" width="88" height="52"/>'), ('نجمة', f'<polygon points="{star}"/>'), ('قلب', '<path d="M50 88 C10 55 5 25 28 15 C40 10 50 20 50 28 C50 20 60 10 72 15 C95 25 90 55 50 88Z"/>')]
    cs = ''.join(C(f'<svg viewBox="0 0 100 100" style="flex:1;min-height:0;width:85%"><g fill="#fff" stroke="#2b2250" stroke-width="2.2" stroke-linejoin="round">{d}</g></svg><div style="font-size:19pt;font-weight:700;color:{PAL[i]}">{n}</div>', PAL[i], 'background:#fff;gap:1mm') for i, (n, d) in enumerate(S_))
    return sp, [page(sp, 'ألوّن الأشكال', 'نلوّن كل شكل بلون نحبه', NAME + gridcells(cs, 2, 3))]

@spec('pr-shadow-match')
def _():
    sp = PR(title='أصِل الصورة بظلّها', desc='خمس صور حيوانات تقابلها خمسة ظلال بترتيب مختلف، يصل الطفل كل صورة بظلّها الصحيح لتنمية الملاحظة والتمييز البصري، مع صفحة الإجابات.', levels=['a4', 'a5', 'a6', 'g1'], subject='المهارات الحياتية', topic='التفكير', sort=31)
    ics = ['1f436', '1f431', '1f418', '1f422', '1f41f']; perm = [3, 0, 4, 2, 1]; rnd_names = ['أ', 'ب', 'ج', 'د', 'هـ']
    def col(sil, order):
        o = ''
        for k, j in enumerate(order):
            o += f'<div style="flex:1;display:flex;align-items:center;justify-content:center">{I(ics[j], 30, "", "filter:brightness(0);opacity:.78" if sil else "")}</div>'
        return f'<div style="display:flex;flex-direction:column;flex:1;border:.6mm dashed #b9b0dd;border-radius:5mm;padding:2mm">{o}</div>'
    def sheet():
        return f'<div style="display:flex;gap:40mm;flex:1;min-height:0;padding:0 12mm;direction:ltr">{col(False, range(5))}{col(True, perm)}</div><div style="text-align:center;font-size:13pt;margin-top:3mm">نرسم خطًا من كل حيوان إلى ظلّه</div>'
    def ans():
        r = ''.join(f'<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:15mm;direction:ltr">{I(ics[j], 24)}<span style="font-size:30pt;color:#999">=</span>{I(ics[j], 24, "", "filter:brightness(0);opacity:.78")}</div>' for j in range(5))
        return f'<div style="display:flex;flex-direction:column;flex:1;min-height:0">{r}</div>'
    return sp, [page(sp, 'أصل الصورة بظلّها', 'أي ظلّ يخصّ هذا الحيوان؟', NAME + sheet()), page(sp, 'الإجابات', 'صفحة الإجابات', ans())]

@spec('pr-cut-paste-sort')
def _():
    sp = PR(title='أقصّ وألصق: فواكه وحيوانات', desc='نشاط قص ولصق: صفحة فيها صندوقان (فواكه وحيوانات) وصفحة بطاقات للقص، يفرزها الطفل ويلصقها في الصندوق المناسب، مع صفحة الإجابات.', levels=['a4', 'a5', 'a6', 'g1'], subject='المهارات الحياتية', topic='التصنيف', sort=32)
    F = ['1f34e', '1f34c', '1f347', '1f34a']; A = ['1f431', '1f436', '1f42d', '1f430']
    def boxes(fill):
        def b(t, c, ic): return f'<div style="flex:1;border:.9mm solid {c};background:{c}0d;border-radius:6mm;display:flex;flex-direction:column"><div style="background:{c};color:#fff;text-align:center;font-size:20pt;font-weight:700;padding:2mm;border-radius:4mm 4mm 0 0">{t}</div><div style="flex:1;display:flex;flex-wrap:wrap;gap:3mm;align-items:center;justify-content:center;padding:4mm">{"".join(I(x, 22) for x in ic) if fill else ""}</div></div>'
        return f'<div style="display:flex;flex-direction:column;gap:6mm;flex:1;min-height:0">{b("فواكه", "#e53935", F)}{b("حيوانات", "#039be5", A)}</div>'
    allc = F + A; rnd = random.Random(3); rnd.shuffle(allc)
    cards = ''.join(f'<div style="border:.5mm dashed #888;border-radius:3mm;display:grid;place-items:center;background:#fff">{I(x, 30)}</div>' for x in allc)
    cut = f'<div style="display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(4,1fr);gap:6mm;flex:1;min-height:0;padding:3mm">{cards}</div><div style="text-align:center;font-size:12.5pt">✂ نقصّ على الخط المنقّط</div>'
    return sp, [page(sp, 'ألصق في الصندوق المناسب', 'نفرز البطاقات: فواكه أو حيوانات', NAME + boxes(False)), page(sp, 'بطاقات للقصّ', 'نقصّ البطاقات ثم نلصقها', cut), page(sp, 'الإجابات', 'صفحة الإجابات', boxes(True))]

@spec('pr-big-small')
def _():
    sp = PR(title='كبير وصغير', desc='خمسة صفوف في كل صف صورتان متشابهتان إحداهما كبيرة والأخرى صغيرة، يضع الطفل دائرة حول الكبيرة لتعلم مفهوم الحجم، مع صفحة الإجابات.', levels=['a3', 'a4', 'a5', 'a6'], subject='الرياضيات', topic='المقارنة', sort=33)
    ics = ['1f34e', '1f436', '1f333', '1f697', '1f338']; rnd = random.Random(9); pos = [rnd.randrange(2) for _ in ics]
    def sheet(a):
        o = ''
        for i, ic in enumerate(ics):
            c = PAL[i]; cells = ''
            for j in range(2):
                big = (j == pos[i]); h = 32 if big else 15
                cells += f'<div style="flex:1;display:grid;place-items:center;border:.5mm solid {c}55;border-radius:5mm;background:#fff;{"outline:1.3mm solid #e53935;" if a and big else ""}">{I(ic, h)}</div>'
            o += f'<div style="display:flex;align-items:center;gap:3mm;flex:1"><b style="font-size:20pt;color:{c};width:9mm">{AD(i + 1)}</b><div style="display:flex;gap:6mm;flex:1;height:100%;direction:ltr">{cells}</div></div>'
        return f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{o}</div>'
    return sp, [page(sp, 'أين الكبير؟', 'نضع دائرة حول الصورة الكبيرة', NAME + sheet(False)), page(sp, 'الإجابات', 'الكبيرة محاطة بإطار أحمر', sheet(True))]

@spec('pr-trace-letters')
def _():
    sp = PR(title='أتتبّع الحروف الهجائية', desc='ثلاث ورقات لتتبّع الحروف العربية الثمانية والعشرين: لكل حرف شكل ملوّن وثلاثة حروف رمادية للتتبّع ومربعان فارغان للكتابة، لتدريب اليد قبل الكتابة.', levels=['a6', 'g1', 'g2'], subject='اللغة العربية', topic='الحروف', sort=34)
    AL = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split()
    CH = [AL[0:10], AL[10:20], AL[20:28]]
    def pg(L, t):
        o = ''
        for i, ch in enumerate(L):
            c = PAL[i % 8]
            tr = ''.join(f'<span style="font-size:34pt;font-weight:700;color:#d7d1ea;width:16mm;text-align:center">{ch}</span>' for _ in range(3))
            bl = ''.join('<span style="width:11mm;height:11mm;border:.4mm dashed #b9b0dd;border-radius:2mm"></span>' for _ in range(2))
            o += f'<div style="display:flex;align-items:center;gap:5mm;flex:1;border-bottom:.3mm solid #e5e0f5"><div style="width:13mm;height:13mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:21pt;font-weight:700;flex:none">{ch}</div><div style="display:flex;gap:4mm;align-items:center;flex:1;justify-content:space-around">{tr}{bl}</div></div>'
        return page(sp, t, 'أتتبّع الحرف الرمادي ثم أكتبه بنفسي', NAME + f'<div style="display:flex;flex-direction:column;flex:1;min-height:0">{o}</div>')
    return sp, [pg(CH[i], f'أتتبّع الحروف ({AD(i + 1)})') for i in range(3)]

@spec('pr-maze-easy')
def _():
    sp = PR(title='متاهة سهلة للصغار', desc='متاهة كبيرة بسيطة بحجم ٦ × ٨ مربعات بممرات واسعة تناسب الصغار، لها حل واحد، مع صفحة الحل.', levels=['a4', 'a5', 'a6', 'g1'], subject='المهارات الحياتية', topic='التفكير', sort=35)
    w, pth = maze(6, 8, 77)
    return sp, [page(sp, 'متاهة سهلة', 'نرسم طريقًا من البداية إلى النهاية', NAME + maze_svg(w, 6, 8, 28)), page(sp, 'حلّ المتاهة', 'صفحة الإجابات', maze_svg(w, 6, 8, 28, pth))]

@spec('pr-dot-house')
def _():
    sp = PR(title='وصل النقاط: بيت', desc='ورقة وصل النقاط من ١ إلى ٩ ترسم بيتًا بسقف وباب عند الوصل بالترتيب، للصغار في بدايات العدّ، مع صفحة الشكل النهائي.', levels=['a4', 'a5', 'a6'], subject='الرياضيات', topic='العدّ', sort=36)
    P_ = [(25, 110), (25, 62), (65, 20), (105, 62), (105, 110), (78, 110), (78, 80), (52, 80), (52, 110)]
    def svg(done):
        o = ''
        if done: o += '<polygon points="' + ' '.join(f'{x},{y}' for x, y in P_) + '" fill="#ffe08277" stroke="#fb8c00" stroke-width="1.6" stroke-linejoin="round"/>'
        for i, (x, y) in enumerate(P_):
            dx = -8 if x < 60 else 8 if x > 70 else 0; dy = -7 if y < 70 and abs(x - 65) < 10 else 0
            o += f'<circle cx="{x}" cy="{y}" r="2" fill="#4a2a9c"/><text x="{x + dx}" y="{y + dy}" font-size="8" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#4a2a9c" font-family="C,sans-serif">{AD(i + 1)}</text>'
        return f'<svg viewBox="0 0 130 130" style="flex:1;min-height:0;width:100%">{o}</svg>'
    return sp, [page(sp, 'أصِل النقاط', 'نصل النقاط بالترتيب من ١ إلى ٩ ثم نلوّن البيت', NAME + svg(False)), page(sp, 'الشكل النهائي', 'صفحة الإجابات', svg(True))]
