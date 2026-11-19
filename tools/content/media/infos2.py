# -*- coding: utf-8 -*-
from pract import *
from posters import C, gridcells
NI = 'محتوى وتصميم أصليان من إعداد زاد، معلومات علمية مبسّطة. لم يُراجَع من جهة تعليمية رسمية.'
def IN(**k): k.setdefault('note', NI); return SP(**k)
def row(c, left, text, h=None):
    return f'<div style="display:flex;align-items:center;gap:5mm;flex:1;border:.6mm solid {c};background:{c}12;border-radius:5mm;padding:0 5mm"><div style="flex:none;width:30mm;display:flex;justify-content:center">{left}</div><div style="font-size:16pt;font-weight:700;line-height:1.5">{text}</div></div>'

@spec('inf-day-night')
def _():
    sp = IN(kind='infographic', title='الليل والنهار', desc='رسم معلوماتي يشرح باختصار سبب تعاقب الليل والنهار: الأرض تدور حول نفسها دورة كاملة كل ٢٤ ساعة، فيواجه النصف المقابل للشمس النهار وينعم الآخر بالليل.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='الأرض والشمس', sort=60)
    def pan(c, ic1, t, items):
        li = ''.join(f'<div style="font-size:15pt;padding:1.5mm 0">• {x}</div>' for x in items)
        return f'<div style="flex:1;border:.8mm solid {c};background:{c}12;border-radius:6mm;padding:5mm;display:flex;flex-direction:column;align-items:center;gap:2mm">{I(ic1, 34)}<div style="font-size:26pt;font-weight:700;color:{c}">{t}</div><div style="text-align:center">{li}</div></div>'
    top = f'<div style="display:flex;gap:5mm;flex:1.3;min-height:0">{pan("#f9a825", "2600", "النهار", ["نرى الشمس في السماء", "الضوء ساطع والجو أدفأ", "نذهب إلى المدرسة والعمل"])}{pan("#3949ab", "1f319", "الليل", ["نرى القمر والنجوم", "الظلام يعمّ", "ننام ونرتاح"])}</div>'
    bot = f'<div style="display:flex;align-items:center;gap:6mm;border:.7mm solid #43a047;background:#43a04712;border-radius:6mm;padding:4mm 6mm;margin-top:4mm">{I("x_earth", 28)}<div style="font-size:17pt;font-weight:700;line-height:1.6">لماذا يتعاقبان؟<br><span style="font-weight:400;font-size:15pt">الأرض تدور حول نفسها دورة كاملة كل ٢٤ ساعة تقريبًا، فيواجه كل مكان الشمس ثم يبتعد عنها.</span></div></div>'
    return sp, P(sp, 'الليل والنهار', 'الأرض تدور فيتغيّر الوقت', f'<div style="display:flex;flex-direction:column;flex:1;min-height:0">{top}{bot}</div>')

@spec('inf-food-groups')
def _():
    sp = IN(kind='infographic', title='مجموعات الغذاء الصحي', desc='رسم معلوماتي بخمس مجموعات غذائية: الخضار والفواكه والخبز والحبوب والحليب ومشتقاته والأسماك والبقوليات، مع فائدة مبسّطة لكل مجموعة.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='التغذية', sort=61)
    G_ = [('1f955', 'الخضار', 'تحمي جسمي وتساعد هضمي', '#43a047'), ('1f34e', 'الفواكه', 'فيها فيتامينات وسكر طبيعي', '#e53935'), ('1f35e', 'الخبز والحبوب', 'تعطيني الطاقة للعب والدراسة', '#fb8c00'), ('1f9c0', 'الحليب ومشتقاته', 'تقوّي عظامي وأسناني', '#039be5'), ('1f41f', 'الأسماك والبقوليات', 'تبني عضلاتي وتنمّي جسمي', '#8e24aa')]
    rows = ''.join(row(c, I(ic, 20), f'<span style="color:{c};font-size:20pt">{t}</span><br><span style="font-weight:400;font-size:14pt">{d}</span>') for ic, t, d, c in G_)
    return sp, P(sp, 'مجموعات الغذاء الصحي', 'جسمي يحتاج أنواعًا مختلفة من الطعام', f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{rows}</div>')

@spec('inf-water-uses')
def _():
    sp = IN(kind='infographic', title='فوائد الماء في حياتنا', desc='رسم معلوماتي بأربع استعمالات رئيسية للماء: الشرب والطبخ والنظافة وسقي النباتات، مع جملة بسيطة لكل استعمال.', levels=['a5', 'a6', 'g1', 'g2', 'g3'], subject='العلوم', topic='الماء', sort=62)
    G_ = [('1f95b', 'نشرب', 'الماء يروي عطشنا ويحفظ صحة أجسامنا', '#039be5'), ('x_pot', 'نطبخ', 'نستعمله لطبخ الطعام وغسل الخضار', '#fb8c00'), ('1f9fc', 'ننظّف', 'نغسل به أيدينا وملابسنا وبيوتنا', '#00897b'), ('x_wcan', 'نسقي', 'تحتاجه النباتات لتنمو وتعطينا الغذاء', '#43a047')]
    rows = ''.join(row(c, I(ic, 22), f'<span style="color:{c};font-size:22pt">{t}</span><br><span style="font-weight:400;font-size:14.5pt">{d}</span>') for ic, t, d, c in G_)
    return sp, P(sp, 'فوائد الماء', 'لا حياة بدون ماء', f'<div style="display:flex;flex-direction:column;gap:3.5mm;flex:1;min-height:0">{rows}</div>')

@spec('inf-living-things')
def _():
    sp = IN(kind='infographic', title='الكائنات الحية وغير الحية', desc='رسم معلوماتي يقارن بين الكائنات الحية (النبات والحيوان والإنسان) وغير الحية (الصخرة والماء والكرسي) مع خمس صفات للكائن الحي: يتغذى ويتنفس وينمو ويتكاثر ويستجيب لما حوله.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='الكائنات الحية', sort=63)
    liv = ''.join(f'<div style="display:grid;place-items:center">{I(ic, 30)}</div>' for ic in ['1f331', '1f436', '1f9d2'])
    non = ''.join(f'<div style="display:grid;place-items:center">{I(ic, 30)}</div>' for ic in ['x_stone', '1f4a7', 'i_chair'])
    def box(t, c, ics): return f'<div style="flex:1;border:.8mm solid {c};background:{c}12;border-radius:6mm;padding:4mm;display:flex;flex-direction:column;gap:2mm"><div style="background:{c};color:#fff;text-align:center;font-size:20pt;font-weight:700;border-radius:3mm;padding:1.5mm">{t}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);flex:1;align-items:center">{ics}</div></div>'
    props = ['يتغذى', 'يتنفس', 'ينمو', 'يتكاثر', 'يستجيب لما حوله']
    pr = ''.join(f'<span style="border:.5mm solid {PAL[i]};background:{PAL[i]}14;color:{PAL[i]};border-radius:8mm;padding:2mm 6mm;font-size:16pt;font-weight:700">{p}</span>' for i, p in enumerate(props))
    body = f'<div style="display:flex;gap:5mm;height:105mm">{box("كائنات حية", "#43a047", liv)}{box("أشياء غير حية", "#78909c", non)}</div><div style="font-size:19pt;font-weight:700;text-align:center;margin:8mm 0 4mm">الكائن الحي</div><div style="display:flex;flex-wrap:wrap;gap:3mm;justify-content:center">{pr}</div><div style="margin-top:6mm;font-size:14pt;text-align:center;line-height:1.7">الأشياء غير الحية لا تتغذى ولا تنمو ولا تتكاثر</div>'
    return sp, P(sp, 'حيّ أم غير حيّ؟', 'نتعرّف إلى صفات الكائن الحي', body)

@spec('dg-bar-chart')
def _():
    sp = IN(kind='diagram', title='قراءة الأعمدة البيانية', desc='رسم أعمدة بيانية لفواكه يفضّلها ٢٥ طفلًا (تفاح ٨ وموز ٦ وبرتقال ٤ وعنب ٧) مع أسئلة قراءة الرسم وصفحة إجابات محسوبة برمجيًا.', levels=['g2', 'g3', 'g4'], subject='الرياضيات', topic='معالجة البيانات', sort=64)
    D = [('تفاح', 8, '#e53935'), ('موز', 6, '#f9a825'), ('برتقال', 4, '#fb8c00'), ('عنب', 7, '#8e24aa')]
    mx = 10; W, H = 200, 120; bw = 30
    o = ''
    for k in range(mx + 1):
        y = H - k * H / mx
        o += f'<line x1="22" y1="{y}" x2="{W}" y2="{y}" stroke="#e1dcf3" stroke-width=".4"/><text x="18" y="{y}" font-size="5" text-anchor="end" dominant-baseline="central" fill="#555" font-family="C,sans-serif">{AD(k)}</text>'
    for i, (n, v, c) in enumerate(D):
        x = 35 + i * 42
        o += f'<rect x="{x}" y="{H - v * H / mx}" width="{bw}" height="{v * H / mx}" fill="{c}" rx="1.5"/><text x="{x + bw / 2}" y="{H + 9}" font-size="7" font-weight="700" text-anchor="middle" fill="{c}" font-family="C,sans-serif">{n}</text>'
    svg = f'<svg viewBox="0 -4 {W + 4} {H + 16}" style="width:100%;direction:ltr;flex:none"><line x1="22" y1="0" x2="22" y2="{H}" stroke="#333" stroke-width=".8"/><line x1="22" y1="{H}" x2="{W}" y2="{H}" stroke="#333" stroke-width=".8"/>{o}</svg>'
    Q = [('أي فاكهة فضّلها أكبر عدد من الأطفال؟', 'تفاح'), ('كم طفلًا فضّل الموز؟', AD(6)), ('أي فاكهة فضّلها أقل عدد؟', 'برتقال'), ('كم طفلًا فضّل التفاح والعنب معًا؟', AD(15)), ('كم طفلًا شارك في الاستطلاع كله؟', AD(25))]
    qs = lambda a: ''.join(f'<div style="font-size:15pt;padding:2mm 0;border-bottom:.3mm dashed #cfc7ee"><b style="color:{PAL[i]}">{AD(i + 1)}.</b> {q} <span style="color:#e53935;font-weight:700">{ans if a else "........"}</span></div>' for i, (q, ans) in enumerate(Q))
    title = '<div style="text-align:center;font-size:18pt;font-weight:700;margin-bottom:2mm">الفاكهة المفضّلة لدى ٢٥ طفلًا</div>'
    return sp, [page(sp, 'الأعمدة البيانية', 'نقرأ الرسم ونجيب عن الأسئلة', NAME + title + svg + f'<div style="margin-top:3mm">{qs(False)}</div>'), page(sp, 'الإجابات', 'صفحة الإجابات', title + svg + f'<div style="margin-top:3mm">{qs(True)}</div>')]

@spec('dg-pictograph')
def _():
    sp = IN(kind='diagram', title='الرسم بالصور (المخطط التصويري)', desc='مخطط تصويري لعدد الحيوانات الأليفة عند أطفال الصف (قطط ٥، أرانب ٣، أسماك ٦، عصافير ٤) مع أسئلة قراءة وصفحة إجابات، كل صورة تمثّل حيوانًا واحدًا.', levels=['g1', 'g2', 'g3'], subject='الرياضيات', topic='معالجة البيانات', sort=65)
    D = [('1f431', 'قطط', 5), ('1f430', 'أرانب', 3), ('1f41f', 'أسماك', 6), ('1f426', 'عصافير', 4)]
    rows = ''.join(f'<div style="display:flex;align-items:center;gap:4mm;flex:1;border-bottom:.4mm solid #e1dcf3"><div style="width:30mm;font-size:17pt;font-weight:700;color:{PAL[i]};flex:none">{t}</div><div style="display:flex;gap:2mm;direction:ltr;flex:1">{"".join(I(ic, 13) for _ in range(n))}</div></div>' for i, (ic, t, n) in enumerate(D))
    chart = f'<div style="border:.7mm solid #4a2a9c;border-radius:5mm;padding:2mm 5mm;display:flex;flex-direction:column;height:80mm"><div style="text-align:center;font-size:15pt;font-weight:700;color:#4a2a9c;margin-bottom:1mm">حيواناتنا الأليفة — كل صورة = حيوان واحد</div>{rows}</div>'
    Q = [('كم قطة في الصف؟', AD(5)), ('أي حيوان عدده الأكبر؟', 'الأسماك'), ('كم أرنبًا؟', AD(3)), ('كم عدد القطط والعصافير معًا؟', AD(9)), ('بكم يزيد عدد الأسماك على عدد الأرانب؟', AD(3))]
    qs = lambda a: ''.join(f'<div style="font-size:15pt;padding:2mm 0;border-bottom:.3mm dashed #cfc7ee"><b style="color:{PAL[i]}">{AD(i + 1)}.</b> {q} <span style="color:#e53935;font-weight:700">{ans if a else "........"}</span></div>' for i, (q, ans) in enumerate(Q))
    return sp, [page(sp, 'الرسم بالصور', 'نقرأ المخطط ونجيب', NAME + chart + f'<div style="margin-top:4mm">{qs(False)}</div>'), page(sp, 'الإجابات', 'صفحة الإجابات', chart + f'<div style="margin-top:4mm">{qs(True)}</div>')]

@spec('dg-symmetry')
def _():
    sp = IN(kind='diagram', title='خطوط التماثل', desc='رسم لستة أشكال مع خطوط التماثل المنقّطة: المربع (٤) والمستطيل (٢) والمثلث المتطابق الأضلاع (٣) والمثلث المتطابق الضلعين (١) والقلب (١) والدائرة (عدد لا نهائي)، لتعليم مفهوم التماثل.', levels=['g2', 'g3', 'g4'], subject='الرياضيات', topic='الهندسة', sort=66)
    ST = 'stroke="#2b2250" stroke-width="2" stroke-linejoin="round"'
    L_ = lambda x1, y1, x2, y2: f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#e53935" stroke-width="1.8" stroke-dasharray="4 3"/>'
    h = 86.6
    S_ = [('المربع', f'<rect x="15" y="15" width="70" height="70" fill="#e5393522" {ST}/>' + L_(50, 8, 50, 92) + L_(8, 50, 92, 50) + L_(10, 10, 90, 90) + L_(90, 10, 10, 90), '٤'),
          ('المستطيل', f'<rect x="8" y="26" width="84" height="48" fill="#039be522" {ST}/>' + L_(50, 18, 50, 82) + L_(0, 50, 100, 50), '٢'),
          ('مثلث متطابق الأضلاع', f'<polygon points="50,12 90,81 10,81" fill="#43a04722" {ST}/>' + L_(50, 8, 50, 88) + L_(95, 85, 29, 47) + L_(5, 85, 71, 47), '٣'),
          ('مثلث متطابق الضلعين', f'<polygon points="50,10 82,88 18,88" fill="#fb8c0022" {ST}/>' + L_(50, 6, 50, 92), '١'),
          ('القلب', f'<path d="M50 88 C10 55 5 25 28 15 C40 10 50 20 50 28 C50 20 60 10 72 15 C95 25 90 55 50 88Z" fill="#ec407a22" {ST}/>' + L_(50, 6, 50, 94), '١'),
          ('الدائرة', f'<circle cx="50" cy="50" r="38" fill="#8e24aa22" {ST}/>' + L_(50, 8, 50, 92) + L_(8, 50, 92, 50) + L_(20, 20, 80, 80) + L_(80, 20, 20, 80), 'عدد لا نهائي')]
    cs = ''.join(C(f'<svg viewBox="0 0 100 100" style="flex:1;min-height:0;width:80%">{d}</svg><div style="font-size:14pt;font-weight:700">{n}</div><div style="font-size:13pt;color:#e53935;font-weight:700">خطوط التماثل: {c}</div>', PAL[i], 'background:#fff;gap:1mm') for i, (n, d, c) in enumerate(S_))
    body = gridcells(cs, 2, 3) + '<div style="text-align:center;font-size:13pt;margin-top:3mm">خط التماثل يقسم الشكل إلى نصفين متطابقين تمامًا إذا طويناه عليه</div>'
    return sp, P(sp, 'خطوط التماثل', 'نصفان متطابقان', body)
