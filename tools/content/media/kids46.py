# -*- coding: utf-8 -*-
from toddlers import *
from posters import C, gridcells
import math
NK = 'محتوى وتصميم أصليان من إعداد زاد للأطفال، يُستعمل بمرافقة الكبار. لم يُراجَع من جهة تعليمية رسمية.'
def K(**k): k.setdefault('note', NK); k.setdefault('orient', 'portrait'); k.setdefault('kind', 'poster'); return SP(**k)

@spec('poster-short-vowels')
def _():
    sp = K(title='الحركات القصيرة', desc='ملصق الحركات القصيرة الثلاث (الفتحة والضمة والكسرة) مع ستة حروف مثال، لتدريب الطفل على نطق الحرف مع كل حركة.', levels=['a5', 'a6', 'g1', 'g2'], subject='اللغة العربية', topic='الحركات', sort=70)
    cols = [('الفتحة', 'َ', '#e53935'), ('الضمّة', 'ُ', '#43a047'), ('الكسرة', 'ِ', '#039be5')]
    head = ''.join(f'<div style="background:{c};color:#fff;border-radius:4mm;text-align:center;padding:2mm;font-size:20pt;font-weight:700">{n}<div style="font-size:30pt;line-height:1">ب{h}</div></div>' for n, h, c in cols)
    rows = ''
    for L_ in 'بتسمنر':
        rows += ''.join(f'<div style="display:grid;place-items:center;font-size:40pt;font-weight:700;color:{c};background:{c}10;border-radius:4mm;border:.5mm solid {c}55">{L_}{h}</div>' for n, h, c in cols)
    body = f'<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin-bottom:3mm">{head}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(6,1fr);gap:3mm;flex:1;min-height:0">{rows}</div><div style="text-align:center;font-size:13pt;margin-top:3mm">الفتحة فوق الحرف · الضمّة فوق الحرف · الكسرة تحت الحرف</div>'
    return sp, P(sp, 'الحركات القصيرة', 'نقرأ الحرف مع كل حركة', body)

@spec('poster-community-helpers')
def _():
    sp = K(title='مساعدو المجتمع', desc='ملصق ثمان مهن يخدم أصحابها المجتمع: الطبيب والمعلم والشرطي ورجل الإطفاء والطيار والطباخ والمزارع والبنّاء، مع وصف قصير لعمل كل مهنة.', levels=['a4', 'a5', 'a6', 'g1', 'g2'], subject='المهارات الحياتية', topic='المهن', sort=71)
    return sp, P(sp, 'مساعدو المجتمع', 'من يساعدنا كل يوم؟', cellgrid([('x_doctor', 'طبيب', 'يعالج المرضى'), ('x_teacher', 'معلم', 'يعلّم الأطفال'), ('x_police', 'شرطي', 'يحفظ الأمان'), ('x_firefighter', 'رجل إطفاء', 'يطفئ الحرائق'), ('x_pilot', 'طيار', 'يقود الطائرة'), ('x_chef', 'طباخ', 'يطبخ الطعام'), ('x_farmer', 'مزارع', 'يزرع الغذاء'), ('x_builder', 'بنّاء', 'يبني البيوت')], 2, 4, 26, 22))

@spec('poster-clothes')
def _():
    sp = K(title='ماذا أرتدي؟', desc='ملصق ثماني قطع ملابس وأدوات للطقس: الجاكيت وقبعة الشمس والوشاح والمظلة والحذاء والجوارب والفستان والبنطال، لتعليم الطفل الاختيار حسب الجو.', levels=['a3', 'a4', 'a5', 'a6'], subject='المهارات الحياتية', topic='الملابس', sort=72)
    return sp, P(sp, 'ماذا أرتدي؟', 'أختار ملابسي حسب الجو', cellgrid([('x_jacket', 'جاكيت', 'في الجو البارد'), ('x_sunhat', 'قبعة', 'في الجو المشمس'), ('x_scarf', 'وشاح', 'في الجو البارد'), ('x_umbrella', 'مظلة', 'في المطر'), ('x_shoes', 'حذاء'), ('x_socks', 'جوارب'), ('x_dress', 'فستان'), ('x_pants', 'بنطال')], 2, 4, 26, 22))

@spec('poster-numbers-11-20')
def _():
    W = ['أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر', 'عشرون']
    sp = K(title='الأعداد من ١١ إلى ٢٠', desc='ملصق الأعداد من أحد عشر إلى عشرين بالأرقام والكلمات، مع لوني العشرة والآحاد لإظهار تركيب كل عدد.', levels=['a5', 'a6', 'g1'], subject='الرياضيات', topic='الأعداد', sort=73)
    cs = ''
    for i, w in enumerate(W):
        n = 11 + i; c = PAL[i % 8]
        tens = '٢' if n == 20 else '١'; ones = '٠' if n == 20 else AD(n - 10)
        cs += C(f'<div style="font-size:34pt;font-weight:700;line-height:1;color:{c};direction:ltr"><span style="color:#999">{tens}</span>{ones}</div><div style="font-size:16pt;font-weight:700">{w}</div><div style="font-size:10pt;color:#4b4666">{"عشرون = عشرتان" if n == 20 else f"عشرة و{AD(n - 10)}"}</div>', c)
    return sp, P(sp, 'الأعداد من ١١ إلى ٢٠', 'عشرة وآحاد', gridcells(cs, 2, 5))

@spec('cc-patterns')
def _():
    sp = K(kind='concept_cards', title='الأنماط: ما التالي؟', desc='ملصق ست أنماط لونية يكمل الطفل التالي فيها: تكرار لونين، ولونين وواحد، وثلاثة ألوان، مع صف إجابات محسوب برمجيًا.', levels=['a4', 'a5', 'a6', 'g1', 'g2'], subject='الرياضيات', topic='الأنماط', sort=74, note=NK)
    col = {'أ': '#e53935', 'ب': '#039be5', 'ج': '#43a047', 'د': '#fb8c00'}; nm = {'أ': 'أحمر', 'ب': 'أزرق', 'ج': 'أخضر', 'د': 'برتقالي'}
    pats = ['أب', 'أأب', 'أبب', 'أبج', 'أبأج', 'أبجد']
    def dot(k, shape, q=False):
        if q: return f'<div style="width:20mm;height:20mm;border:.8mm dashed #999;border-radius:{"50%" if shape == 0 else "3mm"};display:grid;place-items:center;font-size:20pt;color:#999;font-weight:700">؟</div>'
        return f'<div style="width:20mm;height:20mm;background:{col[k]};border-radius:{"50%" if shape == 0 else "3mm"}"></div>'
    rows = ''; ans = []
    for i, p in enumerate(pats):
        seq = [p[j % len(p)] for j in range(len(p) * 2 + 1 if len(p) < 4 else len(p) + 3)]
        shown = seq[:-1]; a = seq[-1]; ans.append(a)
        rows += f'<div style="display:flex;align-items:center;gap:3mm;flex:1;border:.5mm solid {PAL[i]}55;border-radius:5mm;padding:0 5mm;background:{PAL[i]}0d"><b style="font-size:18pt;color:{PAL[i]};width:9mm">{AD(i + 1)}</b>' + ''.join(dot(k, i % 2) for k in shown) + dot('', i % 2, True) + '</div>'
    key = ' · '.join(f'{AD(i + 1)}: {nm[a]}' for i, a in enumerate(ans))
    body = f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0;direction:ltr">{rows}</div><div style="text-align:center;font-size:12.5pt;margin-top:3mm"><b>الإجابات:</b> {key}</div>'
    return sp, P(sp, 'ما التالي؟', 'نلاحظ التكرار ونكمل النمط', body)

@spec('poster-recycling')
def _():
    sp = K(title='نفرز النفايات', desc='ملصق ست قطع نفايات مألوفة مع وجهتها: الورق والقنينة البلاستيكية والجرة الزجاجية تذهب لسلة التدوير، وقشور الطعام لسلة بقايا الطعام، لتعليم الفرز وحب البيئة.', levels=['a4', 'a5', 'a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='البيئة', sort=75, note=NK + ' الألوان المستعملة للسلال في الملصق للتوضيح فقط وقد تختلف عن سلال منطقتك.')
    it = [('x_paper', 'ورق', 'سلة التدوير', 'x_recbin'), ('x_pbottle', 'قنينة بلاستيك', 'سلة التدوير', 'x_recbin'), ('x_jar', 'جرة زجاج', 'سلة التدوير', 'x_recbin'), ('x_peel', 'قشر فاكهة', 'سلة بقايا الطعام', 'x_bucket')]
    rows = ''.join(f'<div style="flex:1;display:flex;align-items:center;gap:5mm;border:.8mm solid {PAL[i * 2 % 8]};background:{PAL[i * 2 % 8]}12;border-radius:6mm;padding:0 8mm">{I(a, 24)}<div style="font-size:20pt;font-weight:700;width:48mm">{n}</div><div style="font-size:30pt;color:#999">←</div>{I(b, 24)}<div style="font-size:15pt;font-weight:700;flex:1">{d}</div></div>' for i, (a, n, d, b) in enumerate(it))
    return sp, P(sp, 'نفرز النفايات', 'كل شيء في السلة المناسبة', f'<div style="display:flex;flex-direction:column;gap:4mm;flex:1;min-height:0">{rows}</div><div style="text-align:center;font-size:12pt;margin-top:3mm">نحافظ على نظافة بيئتنا · نرمي النفايات في السلة</div>')

@spec('poster-en-first-words')
def _():
    sp = K(title='My First English Words', desc='ملصق ثماني كلمات إنجليزية أولى بصور كبيرة ومعناها بالعربية: قطة وكلب وسمكة وتفاحة وبيت وسيارة وكتاب وشجرة.', levels=['a4', 'a5', 'a6', 'g1'], subject='اللغة الإنجليزية', topic='Vocabulary', sort=76)
    W = [('1f431', 'Cat', 'قطة'), ('1f436', 'Dog', 'كلب'), ('1f41f', 'Fish', 'سمكة'), ('1f34e', 'Apple', 'تفاحة'), ('1f3e0', 'House', 'بيت'), ('1f697', 'Car', 'سيارة'), ('1f4d6', 'Book', 'كتاب'), ('1f333', 'Tree', 'شجرة')]
    cs = ''.join(f'<div class="cell" style="border-color:{PAL[i]};background:{PAL[i]}14;gap:1mm;border-width:1mm">{I(ic, 26)}<div class="l" style="font-size:24pt;font-weight:700;color:{PAL[i]}">{e}</div><div style="font-size:13pt;font-weight:700">{a}</div></div>' for i, (ic, e, a) in enumerate(W))
    return sp, P(sp, 'My First English Words', 'نقول الكلمة بالإنجليزية', f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,1fr);flex:1;min-height:0;gap:3.5mm">{cs}</div>')

@spec('pr-tracing-lines')
def _():
    sp = K(kind='printable', title='أتتبّع الخطوط', desc='ورقة تتبّع للخطوط التمهيدية للكتابة بخطوط منقّطة: مستقيمة ومتعرجة وموجية وحلقات ودرجات وأقواس ودوائر، مع نقطة بداية خضراء ونقطة نهاية حمراء، مناسبة لتقوية اليد قبل الكتابة.', levels=['a4', 'a5', 'a6', 'g1'], subject='المهارات الحياتية', topic='مهارات اليد والكتابة', sort=77, note=NK + ' ورقة للطباعة؛ يُنصح بأقلام سميكة للأطفال الصغار.')
    W, H = 150, 24
    def path(kind):
        if kind == 'straight': return f'M6 12 H {W - 6}'
        if kind == 'zigzag': return 'M6 19 ' + ' '.join(f'L {6 + 9 * (k + 1)} {5 if k % 2 == 0 else 19}' for k in range(15))
        if kind == 'wave': return 'M6 12 ' + ' '.join(f'Q {6 + 12 * k + 6} {0 if k % 2 == 0 else 24} {6 + 12 * (k + 1)} 12' for k in range(12))
        if kind == 'loops':
            pts = [(6 + t * 2.4 - 5 * math.sin(t), 12 - 7 * math.cos(t)) for t in [i * 0.15 for i in range(0, 200)]]
            return 'M' + ' L'.join(f'{x:.1f} {y:.1f}' for x, y in pts if x < W - 6)
        if kind == 'steps': return 'M6 20 ' + ' '.join(f'H {6 + 14 * (k + 1)} V {20 - 3 * (k + 1)}' for k in range(9))
        if kind == 'arcs': return 'M6 18 ' + ' '.join('a 7 8 0 0 1 14 0' for _ in range(10))
        return ''
    kinds = [('مستقيم', 'straight'), ('متعرّج', 'zigzag'), ('موجي', 'wave'), ('حلقات', 'loops'), ('درجات', 'steps'), ('أقواس', 'arcs')]
    rows = ''
    for n, k in kinds:
        d = path(k)
        import re
        ends = re.findall(r'(-?\d+\.?\d*) (-?\d+\.?\d*)', d)
        sx, sy = ends[0]
        svg = f'<svg viewBox="0 0 {W} {H}" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style="display:block"><g transform="translate({W},0) scale(-1,1)"><path d="{d}" fill="none" stroke="#7d7599" stroke-width="2.2" stroke-dasharray="2.5 5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="{sx}" cy="{sy}" r="3.4" fill="#43a047"/></g></svg>'
        rows += f'<div style="flex:1;display:flex;align-items:center;gap:4mm;border-bottom:.3mm solid #e6e1f5"><div style="width:22mm;font-size:13pt;font-weight:700;color:var(--c)">{n}</div><div style="flex:1;height:100%;padding:1mm 0">{svg}</div></div>'
    circ = ''.join(f'<svg viewBox="0 0 30 30" width="22mm" height="22mm"><circle cx="15" cy="15" r="12" fill="none" stroke="#7d7599" stroke-width="1.6" stroke-dasharray="2 4"/><circle cx="15" cy="3" r="2.4" fill="#43a047"/></svg>' for _ in range(5))
    body = f'<div style="display:flex;flex-direction:column;flex:1;min-height:0">{rows}<div style="display:flex;align-items:center;gap:4mm;height:28mm"><div style="width:22mm;font-size:13pt;font-weight:700;color:var(--c)">دوائر</div><div style="flex:1;display:flex;justify-content:space-around">{circ}</div></div></div><div style="text-align:center;font-size:12pt;margin-top:2mm">نبدأ من النقطة الخضراء ونتتبّع الخط المنقّط بالقلم · الاسم: ........................</div>'
    return sp, P(sp, 'أتتبّع الخطوط', 'خطوط تساعد يدي قبل الكتابة', body)

@spec('sl-community-helpers')
def _():
    sp = SSP(title='عرض: مساعدو المجتمع', desc='عرض تقديمي من ثماني شرائح للأطفال عن ست مهن تخدم المجتمع، شريحة لكل مهنة بصورة كبيرة وجملة بسيطة، مع سؤال تفكير وخلاصة.', levels=['a4', 'a5', 'a6', 'g1', 'g2'], subject='المهارات الحياتية', topic='المهن', sort=78, note=NK)
    A = [('x_doctor', 'الطبيب', 'يفحص المرضى ويعطيهم الدواء'), ('x_teacher', 'المعلم', 'يعلّمنا القراءة والكتابة'), ('x_police', 'الشرطي', 'يحفظ الأمان ويساعد الناس'), ('x_firefighter', 'رجل الإطفاء', 'يطفئ الحرائق وينقذ الناس'), ('x_pilot', 'الطيار', 'يقود الطائرة بين المدن'), ('x_farmer', 'المزارع', 'يزرع الخضار والفواكه')]
    def one(i, ic, n, d):
        c = PAL[i % 8]
        return S(sp, n, f'<div style="display:flex;align-items:center;justify-content:center;gap:14mm;flex:1"><div style="width:84mm;height:84mm;border-radius:50%;background:{c}18;border:1.2mm solid {c};display:grid;place-items:center">{I(ic, 60)}</div><div style="max-width:100mm;text-align:center"><div style="font-size:48pt;font-weight:700;color:{c}">{n}</div><div style="font-size:24pt;line-height:1.5">{d}</div></div></div>')
    P_ = [title_slide(sp, 'مساعدو المجتمع', 'من يساعدنا كل يوم؟', ['x_doctor', 'x_teacher', 'x_police', 'x_firefighter'])] + [one(i, *a) for i, a in enumerate(A)] + [summary(sp, ['كل مهنة تخدم الناس بطريقتها', 'نشكر من يعمل من أجلنا', 'ماذا تحب أن تعمل حين تكبر؟'])]
    return sp, P_
