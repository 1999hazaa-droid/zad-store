# -*- coding: utf-8 -*-
from common import *
NOTE = 'إنفوجرافيك أصلي من إعداد زاد؛ الرسومات من مكتبة زاد الكرتونية. لم يُراجَع من جهة تعليمية رسمية ولا ينسب إلى منهج محدد.'
def SP(**k): k.setdefault('kind', 'infographic'); k.setdefault('orient', 'portrait'); k.setdefault('note', NOTE); return k
def arrow(c): return f'<div style="text-align:center;color:{c};font-size:20pt;line-height:.8;height:7mm">▼</div>'
def flow(items, h=24):
    out = ''
    for i, (ic, t, d) in enumerate(items):
        c = PAL[(i * 2 + 4) % 8] if False else PAL[[0, 4, 3, 1, 5, 6, 7][i % 7]]
        out += f'<div style="display:flex;align-items:center;gap:6mm;background:{c}12;border:.6mm solid {c};border-radius:6mm;padding:3mm 6mm;flex:1;min-height:0"><div style="width:11mm;height:11mm;flex:none;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:18pt;font-weight:700">{AD(i + 1)}</div>{I(ic, h)}<div style="flex:1"><div style="font-size:18pt;font-weight:700;color:{c};line-height:1.3">{t}</div><div style="font-size:12.5pt;line-height:1.55">{d}</div></div></div>'
        if i < len(items) - 1: out += arrow(c)
    return f'<div style="display:flex;flex-direction:column;flex:1;min-height:0">{out}</div>'
def P(sp, t, s, body): return [page(sp, t, s, body)]

@spec('inf-water-cycle')
def _():
    sp = SP(title='دورة الماء في الطبيعة', desc='إنفوجرافيك من أربع خطوات يشرح دورة الماء: التبخّر ثم التكثّف ثم الهطول ثم الجريان والتجمّع.', levels=['g2', 'g3', 'g4'], subject='العلوم', topic='الماء', sort=1)
    b = flow([('2600', 'التبخّر', 'حرارة الشمس تسخّن ماء البحار والأنهار فيتحوّل جزء منه إلى بخار يصعد إلى الجو'), ('2601', 'التكثّف', 'يبرد بخار الماء في الأعلى فيتحوّل إلى قطرات صغيرة تتجمّع وتكوّن الغيوم'), ('1f327', 'الهطول', 'تكبر القطرات وتثقل فتسقط على الأرض مطرًا'), ('1f4a7', 'الجريان والتجمّع', 'يجري الماء إلى الأنهار والبحار ويتسرّب إلى الأرض، وتبدأ الدورة من جديد')], 22)
    return sp, P(sp, 'دورة الماء في الطبيعة', 'الماء لا يختفي، بل يتنقّل في دورة مستمرة', b)

@spec('inf-plant-growth')
def _():
    sp = SP(title='كيف تنمو النبتة؟', desc='إنفوجرافيك من ست مراحل يوضح نمو النبتة من البذرة إلى الثمرة.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='النبات', sort=2)
    b = flow([('x_seed', 'البذرة', 'بذرة صغيرة بداخلها نبتة جديدة'), ('x_soil', 'الزراعة', 'نضع البذرة في تربة رطبة'), ('x_wcan', 'السقي', 'ماء ودفء وهواء تساعد البذرة على الإنبات'), ('1f331', 'البادرة', 'يخرج جذر صغير وساق خضراء'), ('x_plant', 'النبتة', 'تكبر وتظهر الأوراق وتصنع غذاءها بالضوء'), ('1f33b', 'الزهرة والثمرة', 'تزهر النبتة ثم تعطي ثمارًا فيها بذور جديدة')], 17)
    return sp, P(sp, 'كيف تنمو النبتة؟', 'من البذرة الصغيرة إلى نبتة كبيرة', b)

@spec('inf-butterfly')
def _():
    sp = SP(title='دورة حياة الفراشة', desc='إنفوجرافيك يوضح مراحل حياة الفراشة الأربع: البيضة ثم اليرقة ثم الشرنقة ثم الفراشة.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='الكائنات الحية', sort=3)
    b = flow([('x_buteggs', 'البيضة', 'تضع الفراشة بيضها الصغير على ورقة نبات'), ('x_caterpillar', 'اليرقة', 'تفقس البيضة عن يرقة تأكل أوراق النبات كثيرًا وتكبر'), ('x_chrysalis', 'الشرنقة', 'تتحوّل اليرقة إلى شرنقة وتتغيّر بداخلها'), ('1f98b', 'الفراشة', 'تخرج فراشة جميلة بجناحين وتطير، ثم تضع بيضًا جديدًا')], 22)
    return sp, P(sp, 'دورة حياة الفراشة', 'أربع مراحل تتكرّر في حياتها', b)

@spec('inf-states-matter')
def _():
    sp = SP(title='حالات المادة الثلاث', desc='إنفوجرافيك يقارن بين المادة الصلبة والسائلة والغازية برسم الجسيمات، ويوضّح تحوّلات الانصهار والتجمّد والتبخّر والتكثّف.', levels=['g3', 'g4', 'g5'], subject='العلوم', topic='المادة', sort=4)
    def parts(kind, c):
        o = ''
        import random; rnd = random.Random(kind)
        if kind == 's':
            for r in range(5):
                for k in range(6): o += f'<circle cx="{18 + k * 20}" cy="{18 + r * 20}" r="8.5" fill="{c}"/>'
        elif kind == 'l':
            pts = []
            for r in range(5):
                for k in range(6): pts.append((18 + k * 20 + rnd.uniform(-5, 5), 20 + r * 19 + rnd.uniform(-5, 5)))
            for x, y in pts[:24]: o += f'<circle cx="{x:.0f}" cy="{y + 14:.0f}" r="8.5" fill="{c}"/>'
        else:
            for _ in range(9): o += f'<circle cx="{rnd.uniform(12, 108):.0f}" cy="{rnd.uniform(12, 98):.0f}" r="8.5" fill="{c}"/>'
        return f'<svg viewBox="0 0 120 110" style="width:50mm;height:48mm;border:.5mm solid {c};border-radius:3mm;background:#fff">{o}</svg>'
    cols = [('صلبة', '#8e24aa', 's', 'جسيماتها متراصّة ومرتّبة', 'شكل ثابت وحجم ثابت', 'x_stone', 'الحجر'), ('سائلة', '#039be5', 'l', 'جسيماتها قريبة وتنزلق فوق بعضها', 'تأخذ شكل الإناء وحجمها ثابت', 'x_water', 'الماء'), ('غازية', '#43a047', 'g', 'جسيماتها متباعدة وتتحرّك بحرّية', 'تملأ المكان المتاح', 'x_wind', 'الهواء')]
    cells = ''
    for t, c, k, a, b, ic, ex in cols:
        cells += f'<div style="flex:1;border:.6mm solid {c};background:{c}10;border-radius:5mm;padding:3mm;display:flex;flex-direction:column;align-items:center;gap:2mm;text-align:center"><div style="font-size:19pt;font-weight:700;color:{c}">{t}</div>{parts(k, c)}<div style="font-size:11pt;line-height:1.5">{a}</div><div style="font-size:11pt;font-weight:700;line-height:1.5">{b}</div>{I(ic, 15)}<div style="font-size:11pt">مثال: {ex}</div></div>'
    ch = [('الانصهار', 'صلب ← سائل بالتسخين', '#e53935'), ('التجمّد', 'سائل ← صلب بالتبريد', '#1e88e5'), ('التبخّر', 'سائل ← غاز بالتسخين', '#fb8c00'), ('التكثّف', 'غاز ← سائل بالتبريد', '#00897b')]
    chg = ''.join(f'<div style="flex:1;background:{c}14;border:.5mm solid {c};border-radius:4mm;padding:2mm 3mm;text-align:center"><div style="font-size:14pt;font-weight:700;color:{c}">{a}</div><div style="font-size:10.5pt">{b}</div></div>' for a, b, c in ch)
    body = f'<div style="display:flex;gap:3mm;flex:none">{cells}</div><div style="font-size:15pt;font-weight:700;color:var(--c);margin:5mm 0 2mm;text-align:center">تحوّلات المادة</div><div style="display:flex;gap:2.5mm">{chg}</div><div style="margin-top:4mm;background:var(--t);border-radius:5mm;padding:3mm 6mm;text-align:center;font-size:12.5pt;line-height:1.7">الماء يمكن أن يوجد في الحالات الثلاث: جليد (صلب) · ماء (سائل) · بخار الماء (غاز)</div>'
    exp = '<div style="margin-top:5mm;border:.6mm dashed var(--c);border-radius:5mm;padding:4mm 6mm;flex:1;display:flex;flex-direction:column;justify-content:center;gap:3mm"><div style="font-size:15pt;font-weight:700;color:var(--c);text-align:center">فكّر: ماذا يحدث لمكعب الثلج عند تسخينه؟</div><div style="display:flex;align-items:center;justify-content:center;gap:6mm">' + I('x_ice', 22) + '<span style="font-size:22pt;color:var(--c)">◄</span>' + I('x_water', 22) + '<span style="font-size:22pt;color:var(--c)">◄</span>' + I('1f4a8', 22) + '</div><div style="text-align:center;font-size:12pt">ينصهر الجليد فيصير ماءً، ثم يتبخّر الماء فيصير بخارًا</div></div>'
    return sp, P(sp, 'حالات المادة الثلاث', 'صلبة · سائلة · غازية', body + exp)

@spec('inf-planets')
def _():
    sp = SP(title='كواكب المجموعة الشمسية', desc='إنفوجرافيك يرتّب الكواكب الثمانية من الأقرب إلى الشمس إلى الأبعد، مع تقسيمها إلى كواكب صخرية وكواكب عملاقة.', levels=['g3', 'g4', 'g5', 'g6'], subject='العلوم', topic='الفضاء', sort=5, note='الأحجام والألوان تقريبية والمسافات غير مرسومة بمقياس. ' + NOTE)
    P8 = [('عطارد', 8, '#9e9e9e', 'صخري'), ('الزهرة', 14, '#f9a825', 'صخري'), ('الأرض', 15, '#1e88e5', 'صخري'), ('المريخ', 10, '#e53935', 'صخري'), ('المشتري', 34, '#d7a86e', 'غازي عملاق'), ('زحل', 29, '#e0c068', 'غازي عملاق'), ('أورانوس', 20, '#4dd0e1', 'جليدي عملاق'), ('نبتون', 19, '#3949ab', 'جليدي عملاق')]
    rows = f'<div style="display:flex;align-items:center;gap:5mm;padding:2mm 6mm;background:#fff3c4;border:.6mm solid #f9a825;border-radius:6mm"><div style="width:22mm;height:22mm;border-radius:50%;background:radial-gradient(circle at 35% 35%,#ffe082,#fb8c00);flex:none"></div><div><div style="font-size:17pt;font-weight:700;color:#e65100">الشمس</div><div style="font-size:12pt">نجم في مركز المجموعة الشمسية، تدور حوله الكواكب</div></div></div>'
    for i, (n, d, c, k) in enumerate(P8):
        rows += f'<div style="display:flex;align-items:center;gap:5mm;padding:1.2mm 6mm;border-bottom:.3mm dashed #cfc8ea;flex:1"><div style="width:9mm;height:9mm;border-radius:50%;background:var(--c);color:#fff;display:grid;place-items:center;font-weight:700;flex:none">{AD(i + 1)}</div><div style="width:34mm;flex:none;display:grid;place-items:center"><div style="width:{d}mm;height:{d}mm;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff9,{c} 55%);{"box-shadow:0 0 0 1.3mm #e0c06880" if n == "زحل" else ""}"></div></div><div style="font-size:16pt;font-weight:700;width:30mm">{n}</div><div style="font-size:12pt;color:#4b4666">{k}{" · نعيش عليه" if n == "الأرض" else ""}</div></div>'
    foot = '<div style="display:flex;gap:3mm;margin-top:2mm"><div style="flex:1;background:var(--t);border-radius:4mm;padding:2mm 4mm;font-size:11.5pt;text-align:center">الكواكب الأربعة الأولى صخرية</div><div style="flex:1;background:var(--t);border-radius:4mm;padding:2mm 4mm;font-size:11.5pt;text-align:center">الكواكب الأربعة الأخيرة كبيرة وبعيدة وباردة</div></div>'
    return sp, P(sp, 'كواكب المجموعة الشمسية', 'ثمانية كواكب تدور حول الشمس', f'<div style="display:flex;flex-direction:column;flex:1;min-height:0;gap:1mm">{rows}</div>{foot}')

@spec('inf-healthy-food')
def _():
    sp = SP(title='طعامي الصحي', desc='إنفوجرافيك لمجموعات الغذاء الصحي: الخضروات والفواكه والخبز والحبوب والحليب ومنتجاته والبروتين والماء، مع نصيحة التقليل من الحلويات.', levels=['a4', 'a5', 'a6', 'g1', 'g2', 'g3'], subject='العلوم', topic='الغذاء والصحة', sort=6)
    G = [('الخضروات', ['1f955', '1f952'], 'نأكل منها كل يوم'), ('الفواكه', ['1f34e', '1f347', '1f34c'], 'حلوة وفيها فيتامينات'), ('الخبز والحبوب', ['1f35e', '1f33e'], 'تعطينا الطاقة'), ('الحليب ومنتجاته', ['1f95b', '1f9c0'], 'تقوّي العظام والأسنان'), ('البروتين', ['1f41f', 'x_egg'], 'يبني الجسم: سمك وبيض ولحم وبقوليات'), ('الماء', ['1f4a7'], 'نشرب منه كثيرًا')]
    cells = ''
    for i, (t, ics, d) in enumerate(G):
        c = PAL[[3, 0, 2, 4, 5, 6][i]]
        cells += f'<div class="cell" style="border-color:{c};background:{c}12"><div style="display:flex;gap:1mm">{"".join(I(x, 19) for x in ics)}</div><div style="font-size:16pt;font-weight:700;color:{c};margin-top:1mm">{t}</div><div style="font-size:11pt;line-height:1.5">{d}</div></div>'
    body = f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);flex:1;min-height:0">{cells}</div><div style="margin-top:3mm;display:flex;align-items:center;gap:5mm;background:#fff3e0;border:.6mm dashed #fb8c00;border-radius:5mm;padding:2mm 6mm">{I("1f36c", 12)}<div style="font-size:13pt;line-height:1.6"><b>نقلّل من الحلويات والمشروبات المحلّاة</b> ونتناولها بين الحين والآخر</div></div>'
    return sp, P(sp, 'طعامي الصحي', 'نأكل من كل مجموعة ليكون جسمنا قويًا', body)
