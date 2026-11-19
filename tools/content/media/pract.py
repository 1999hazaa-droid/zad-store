# -*- coding: utf-8 -*-
import math, random
from posters2 import *
from toddlers import *
NP = 'وسيلة قابلة للطباعة أصلية من إعداد زاد، تُطبع بحجم ١٠٠٪ على ورق A4، وفي آخرها صفحة إجابات للمعلم أو ولي الأمر. لم تُراجَع من جهة تعليمية رسمية.'
def PR(**k): k.setdefault('kind', 'printable'); k.setdefault('orient', 'portrait'); k.setdefault('note', NP); return SP(**k)
NAME = '<div style="font-size:12.5pt;margin-bottom:2mm;display:flex;justify-content:space-between"><span>الاسم: ........................................</span><span>التاريخ: ................</span></div>'
def box(body): return f'<div style="display:flex;flex-direction:column;flex:1;min-height:0">{body}</div>'

# ---------- متاهة ----------
def maze(cols, rows, seed):
    rnd = random.Random(seed)
    walls = {(c, r): {'N': 1, 'S': 1, 'E': 1, 'W': 1} for c in range(cols) for r in range(rows)}
    seen = {(0, 0)}; st = [(0, 0)]
    D = {'N': (0, -1, 'S'), 'S': (0, 1, 'N'), 'E': (1, 0, 'W'), 'W': (-1, 0, 'E')}
    while st:
        c, r = st[-1]
        nb = [(d, c + dx, r + dy, o) for d, (dx, dy, o) in D.items() if 0 <= c + dx < cols and 0 <= r + dy < rows and (c + dx, r + dy) not in seen]
        if not nb: st.pop(); continue
        d, nc, nr, o = rnd.choice(nb); walls[(c, r)][d] = 0; walls[(nc, nr)][o] = 0; seen.add((nc, nr)); st.append((nc, nr))
    # حل بالبحث بالعرض
    prev = {(0, 0): None}; q = [(0, 0)]
    for cur in q:
        c, r = cur
        for d, (dx, dy, o) in D.items():
            n = (c + dx, r + dy)
            if not walls[cur][d] and n not in prev: prev[n] = cur; q.append(n)
    path = []; cur = (cols - 1, rows - 1)
    while cur: path.append(cur); cur = prev[cur]
    return walls, path[::-1]
def maze_svg(walls, cols, rows, cs, path=None):
    W, H = cols * cs, rows * cs; o = ''
    for (c, r), w in walls.items():
        x, y = c * cs, r * cs
        if w['N'] and not (c == 0 and r == 0): o += f'<line x1="{x}" y1="{y}" x2="{x + cs}" y2="{y}"/>'
        if w['W']: o += f'<line x1="{x}" y1="{y}" x2="{x}" y2="{y + cs}"/>'
        if r == rows - 1 and w['S'] and not (c == cols - 1): o += f'<line x1="{x}" y1="{y + cs}" x2="{x + cs}" y2="{y + cs}"/>'
        if c == cols - 1 and w['E']: o += f'<line x1="{x + cs}" y1="{y}" x2="{x + cs}" y2="{y + cs}"/>'
    s = f'<g stroke="#4a2a9c" stroke-width="1.2" stroke-linecap="round">{o}</g>'
    if path: s += '<polyline fill="none" stroke="#e53935" stroke-width="2.2" stroke-linejoin="round" points="' + ' '.join(f'{c * cs + cs / 2},{r * cs + cs / 2}' for c, r in path) + '"/>'
    s += f'<text x="{cs / 2}" y="-3" font-size="7" font-weight="700" text-anchor="middle" fill="#43a047" font-family="C,sans-serif">ابدأ</text><text x="{W - cs / 2}" y="{H + 9}" font-size="7" font-weight="700" text-anchor="middle" fill="#e53935" font-family="C,sans-serif">النهاية</text>'
    return f'<svg viewBox="-3 -10 {W + 6} {H + 22}" style="flex:1;min-height:0;width:100%;direction:ltr">{s}</svg>'

@spec('pr-maze')
def _():
    sp = PR(title='متاهة: ساعد الأرنب', desc='متاهة مولّدة برمجيًا بحجم ١٢ × ١٦ مربعًا لها حل واحد فقط، مع صفحة الحل. تنمّي التركيز والتخطيط وتحكّم اليد.', levels=['a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='التفكير', sort=20)
    w, pth = maze(12, 16, 2026)
    return sp, [page(sp, 'متاهة', 'نرسم طريقًا من البداية إلى النهاية دون أن نمرّ عبر الجدران', NAME + maze_svg(w, 12, 16, 15)), page(sp, 'حلّ المتاهة', 'صفحة الإجابات', maze_svg(w, 12, 16, 15, pth))]

# ---------- وصل النقاط ----------
@spec('pr-dot-to-dot')
def _():
    sp = PR(title='وصل النقاط: نجمة', desc='ورقة وصل النقاط من ١ إلى ٢٠ ترسم نجمة عند الوصل بالترتيب، لتدريب الطفل على العدّ المتسلسل وتحكّم اليد، مع صفحة الشكل النهائي.', levels=['a5', 'a6', 'g1'], subject='الرياضيات', topic='العدّ', sort=21)
    pts = []
    for i in range(20):
        ang = -math.pi / 2 + i * math.pi / 10; r = 66 if i % 2 == 0 else 34
        pts.append((80 + r * math.cos(ang), 80 + r * math.sin(ang), ang, r))
    def svg(done):
        o = ''
        if done: o += '<polygon points="' + ' '.join(f'{x:.1f},{y:.1f}' for x, y, a, r in pts) + '" fill="#ffe08266" stroke="#fb8c00" stroke-width="1.6" stroke-linejoin="round"/>'
        for i, (x, y, a, r) in enumerate(pts):
            lx, ly = x + 8 * math.cos(a), y + 8 * math.sin(a)
            o += f'<circle cx="{x:.1f}" cy="{y:.1f}" r="1.8" fill="#4a2a9c"/><text x="{lx:.1f}" y="{ly:.1f}" font-size="7" font-weight="700" text-anchor="middle" dominant-baseline="central" fill="#4a2a9c" font-family="C,sans-serif">{AD(i + 1)}</text>'
        return f'<svg viewBox="-6 -6 172 172" style="flex:1;min-height:0;width:100%">{o}</svg>'
    return sp, [page(sp, 'أصِل النقاط', 'نصل النقاط بالترتيب من ١ إلى ٢٠ ثم نلوّن الشكل', NAME + svg(False)), page(sp, 'الشكل النهائي', 'صفحة الإجابات', svg(True))]

# ---------- بحث كلمات ----------
@spec('pr-word-search')
def _():
    sp = PR(title='لغز الكلمات: في المدرسة', desc='لغز كلمات ٩ × ٩ فيه ست كلمات عن المدرسة والحديقة تُقرأ أفقيًا من اليمين إلى اليسار أو عموديًا من الأعلى إلى الأسفل، مع صفحة الحل.', levels=['g2', 'g3', 'g4'], subject='اللغة العربية', topic='الإملاء', sort=22)
    words = ['مدرسة', 'كتاب', 'قلم', 'معلم', 'شجرة', 'حديقة']
    N = 9; rnd = random.Random(7); g = [[None] * N for _ in range(N)]; pos = {}
    for w in words:
        for _ in range(500):
            L_ = list(w); horiz = rnd.random() < .5
            r = rnd.randrange(N if horiz else N - len(L_) + 1); c = rnd.randrange(len(L_) - 1, N) if horiz else rnd.randrange(N)
            cells = [(r, c - i) if horiz else (r + i, c) for i in range(len(L_))]
            if all(g[a][b] in (None, L_[i]) for i, (a, b) in enumerate(cells)):
                for i, (a, b) in enumerate(cells): g[a][b] = L_[i]
                pos[w] = cells; break
        else: raise SystemExit('تعذر وضع ' + w)
    pool = 'ابتجحدرسعفقكلمنهوي'
    for r in range(N):
        for c in range(N):
            if g[r][c] is None: g[r][c] = rnd.choice(pool)
    def grid(hl):
        sel = {x for cs in pos.values() for x in cs} if hl else set()
        cs_ = ''.join(f'<div style="display:grid;place-items:center;font-size:24pt;font-weight:700;border:.3mm solid #cfc7ee;{"background:#ffe082;color:#b71c1c" if (r, c) in sel else "color:#2b2250"}">{g[r][c]}</div>' for r in range(N) for c in range(N))
        return f'<div style="display:grid;grid-template-columns:repeat({N},1fr);grid-template-rows:repeat({N},1fr);aspect-ratio:1;width:150mm;margin:0 auto;direction:ltr;border:.8mm solid #4a2a9c">{cs_}</div>'
    wl = '<div style="display:flex;flex-wrap:wrap;gap:3mm;justify-content:center;margin-top:5mm">' + ''.join(f'<span style="border:.5mm solid {PAL[i]};border-radius:3mm;padding:1.5mm 5mm;font-size:17pt;font-weight:700;color:{PAL[i]}">{w}</span>' for i, w in enumerate(words)) + '</div>'
    note = '<div style="text-align:center;font-size:12.5pt;margin-top:3mm">الكلمات تُقرأ أفقيًا من اليمين إلى اليسار، أو عموديًا من الأعلى إلى الأسفل</div>'
    return sp, [page(sp, 'ابحث عن الكلمات', 'نضع دائرة حول كل كلمة نجدها', NAME + grid(False) + wl + note), page(sp, 'حلّ اللغز', 'صفحة الإجابات', grid(True) + wl)]

# ---------- جمع وطرح ----------
@spec('pr-add-sub-sheet')
def _():
    sp = PR(title='ورقة تدريب: جمع وطرح حتى ٢٠', desc='ورقة تدريب فيها ١٢ مسألة جمع و١٢ مسألة طرح ضمن العدد ٢٠ مولّدة برمجيًا، مع صفحة إجابات محسوبة.', levels=['g1', 'g2'], subject='الرياضيات', topic='الجمع والطرح', sort=23)
    rnd = random.Random(11); A = []; S = []
    while len(A) < 12:
        a, b = rnd.randint(1, 12), rnd.randint(1, 9)
        if a + b <= 20 and (a, b) not in A: A.append((a, b))
    while len(S) < 12:
        a, b = rnd.randint(5, 20), rnd.randint(1, 10)
        if b < a and (a, b) not in S: S.append((a, b))
    def col(title, eqs, c, ans):
        r = ''.join(f'<div style="font-size:19pt;font-weight:700;padding:2.6mm 0;border-bottom:.3mm dashed #cfc7ee;direction:ltr;text-align:center">{LRO(AD(x) + " " + op + " " + AD(y) + " = " + (AD(res) if ans else "........"))}</div>' for x, y, op, res in eqs)
        return f'<div style="border:.7mm solid {c};border-radius:5mm;overflow:hidden;background:{c}0d"><div style="background:{c};color:#fff;text-align:center;font-size:17pt;font-weight:700;padding:2mm">{title}</div>{r}</div>'
    def sheet(ans):
        a = [(x, y, '+', x + y) for x, y in A]; s = [(x, y, '−', x - y) for x, y in S]
        return f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:5mm;flex:1;min-height:0">{col("مسائل الجمع", a, "#e53935", ans)}{col("مسائل الطرح", s, "#039be5", ans)}</div>'
    return sp, [page(sp, 'جمع وطرح', 'نحلّ المسائل ثم نراجع الإجابات', NAME + sheet(False)), page(sp, 'الإجابات', 'صفحة الإجابات', sheet(True))]

# ---------- المختلف ----------
@spec('pr-odd-one-out')
def _():
    sp = PR(title='أضع دائرة حول المختلف', desc='ستة صفوف من الصور في كل صف أربع صور ثلاث منها من مجموعة واحدة وواحدة مختلفة، لتنمية التصنيف والتفكير، مع صفحة الإجابات.', levels=['a5', 'a6', 'g1', 'g2'], subject='المهارات الحياتية', topic='التفكير', sort=24)
    G_ = [(['1f34e', '1f34c', '1f347'], '1f436'), (['1f431', '1f436', '1f42d'], '1f34e'), (['1f697', '1f68c', '1f682'], '1f333'), (['x_jacket', 'x_pants', 'x_socks'], '1f34c'), (['x_doctor', 'x_teacher', 'x_chef'], '1f697'), (['1f34a', '1f353', '1f352'], 'x_shoes')]
    rnd = random.Random(5); rows = []; ans = []
    for same, odd in G_:
        k = rnd.randrange(4); r = same[:]; r.insert(k, odd); rows.append(r); ans.append(k)
    def sheet(a):
        o = ''
        for i, r in enumerate(rows):
            c = PAL[i]
            cells = ''.join(f'<div style="display:grid;place-items:center;border:.5mm solid {c}55;border-radius:4mm;background:#fff;{"outline:1.2mm solid #e53935;" if a and j == ans[i] else ""}">{I(ic, 24)}</div>' for j, ic in enumerate(r))
            o += f'<div style="display:flex;align-items:center;gap:3mm;flex:1"><b style="font-size:20pt;color:{c};width:9mm">{AD(i + 1)}</b><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;flex:1;height:100%;direction:ltr">{cells}</div></div>'
        return f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{o}</div>'
    return sp, [page(sp, 'أين المختلف؟', 'في كل صف صورة مختلفة، نضع حولها دائرة', NAME + sheet(False)), page(sp, 'الإجابات', 'المختلف محاط بإطار أحمر', sheet(True))]

# ---------- عدّ واكتب ----------
@spec('pr-count-write')
def _():
    sp = PR(title='أعدّ وأكتب العدد', desc='ست مجموعات من الصور بأعداد مختلفة من ٤ إلى ١٢ يعدّها الطفل ويكتب العدد في المربع، مع صفحة الإجابات.', levels=['a5', 'a6', 'g1'], subject='الرياضيات', topic='العدّ', sort=25)
    items = ['1f34e', '1f41f', '1f98b', '2b50', '1f338', '1f34a']; cnt = [5, 8, 4, 11, 7, 9]
    def sheet(a):
        o = ''
        for i, (ic, n) in enumerate(zip(items, cnt)):
            c = PAL[i]
            im = ''.join(I(ic, 14) for _ in range(n))
            o += f'<div style="display:flex;align-items:center;gap:4mm;flex:1;border:.6mm solid {c};background:{c}0d;border-radius:5mm;padding:2mm 5mm"><div style="flex:1;display:flex;flex-wrap:wrap;gap:1.5mm;align-items:center;direction:ltr">{im}</div><div style="width:24mm;height:24mm;border:.8mm solid {c};border-radius:4mm;background:#fff;display:grid;place-items:center;font-size:34pt;font-weight:700;color:#e53935;flex:none">{AD(n) if a else ""}</div></div>'
        return f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{o}</div>'
    return sp, [page(sp, 'أعدّ وأكتب', 'نعدّ الصور ونكتب العدد في المربع', NAME + sheet(False)), page(sp, 'الإجابات', 'صفحة الإجابات', sheet(True))]

# ---------- كتابة الأعداد ----------
@spec('pr-write-numbers')
def _():
    sp = PR(title='أكتب الأعداد من ١ إلى ١٠', desc='ورقة كتابة الأعداد من ١ إلى ١٠: عدد كبير ملوّن للنظر وأعداد رمادية لتتبّعها ثم مربعات فارغة للكتابة بخط اليد.', levels=['a6', 'g1'], subject='الرياضيات', topic='كتابة الأعداد', sort=26)
    o = ''
    for n in range(1, 11):
        c = PAL[(n - 1) % 8]
        tr = ''.join(f'<span style="font-size:27pt;font-weight:700;color:#d7d1ea">{AD(n)}</span>' for _ in range(3))
        bl = ''.join('<span style="width:11mm;height:11mm;border:.4mm dashed #b9b0dd;border-radius:2mm"></span>' for _ in range(2))
        o += f'<div style="display:flex;align-items:center;gap:5mm;flex:1;border-bottom:.3mm solid #e5e0f5"><div style="width:13mm;height:13mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:21pt;font-weight:700;flex:none">{AD(n)}</div><div style="display:flex;gap:5mm;align-items:center;flex:1;justify-content:space-around">{tr}{bl}</div></div>'
    return sp, [page(sp, 'أكتب الأعداد', 'أتتبّع العدد الرمادي ثم أكتبه بنفسي', NAME + f'<div style="display:flex;flex-direction:column;flex:1;min-height:0">{o}</div>')]
