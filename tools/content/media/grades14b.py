# -*- coding: utf-8 -*-
from grades14 import *
from toddlers import cellgrid
import math

@spec('poster-transport')
def _():
    sp = G(title='وسائل النقل: برّية وبحرية وجوّية', desc='ملصق ثماني وسائل نقل مصنّفة إلى برّية وبحرية وجوّية بصور كبيرة: السيارة والحافلة والقطار والدراجة والسفينة والطائرة والمروحية والصاروخ.', levels=['a5', 'a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='وسائل النقل', sort=90)
    items = [('1f697', 'سيارة', 'برّية'), ('1f68c', 'حافلة', 'برّية'), ('1f682', 'قطار', 'برّية'), ('1f6b2', 'دراجة', 'برّية'), ('1f6a2', 'سفينة', 'بحرية'), ('2708', 'طائرة', 'جوّية'), ('1f681', 'مروحية', 'جوّية'), ('1f680', 'صاروخ', 'جوّية')]
    return sp, P(sp, 'وسائل النقل', 'برّية · بحرية · جوّية', cellgrid(items, 2, 4, 24, 20))

@spec('poster-frog-life')
def _():
    sp = G(title='دورة حياة الضفدع', desc='ملصق مراحل حياة الضفدع الأربع بالترتيب: بيض الضفدع، ثم الشرغوف، ثم الضفدع الصغير، ثم الضفدع البالغ، مع وصف قصير لكل مرحلة.', levels=['g2', 'g3', 'g4'], subject='العلوم', topic='دورات الحياة', sort=91)
    S_ = [('x_frogspawn', 'البيض', 'تضعه الضفدعة في الماء'), ('x_tadpole', 'الشرغوف', 'يعيش في الماء ويتنفس بالخياشيم'), ('x_froglet', 'ضفدع صغير', 'تنمو له أرجل ويخرج من الماء'), ('1f438', 'ضفدع بالغ', 'يعيش على اليابسة وقرب الماء')]
    cs = ''
    for i, (ic, n, d) in enumerate(S_):
        c = PAL[i % 8]
        cs += f'<div class="cell" style="border-color:{c};background:{c}14;gap:2mm;border-width:1mm;position:relative"><div style="position:absolute;top:3mm;right:3mm;width:11mm;height:11mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:17pt;font-weight:700">{AD(i + 1)}</div>{I(ic, 32)}<div style="font-size:20pt;font-weight:700;color:{c}">{n}</div><div style="font-size:12.5pt;text-align:center;padding:0 3mm">{d}</div></div>'
    body = f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;flex:1;min-height:0;gap:4mm">{cs}</div><div style="text-align:center;font-size:13pt;margin-top:3mm">ثم تعيد الضفدعة الدورة من جديد بوضع البيض في الماء</div>'
    return sp, P(sp, 'دورة حياة الضفدع', 'من البيضة إلى الضفدع', body)

@spec('poster-weather-words')
def _():
    sp = G(title='حالات الطقس', desc='ملصق ست حالات للطقس بصور كبيرة: مشمس وغائم وماطر وعاصف وثلجي وقوس قزح، لتعليم الأطفال وصف الجو.', levels=['a5', 'a6', 'g1', 'g2'], subject='العلوم', topic='الطقس', sort=92)
    items = [('2600', 'مشمس'), ('2601', 'غائم'), ('1f327', 'ماطر'), ('x_wind', 'عاصف'), ('x_snowflake', 'ثلجي'), ('1f308', 'قوس قزح')]
    return sp, P(sp, 'كيف الجو اليوم؟', 'نصف حالة الطقس', cellgrid(items, 2, 3, 30, 22))

@spec('poster-healthy-habits')
def _():
    sp = G(title='عاداتي الصحية', desc='ملصق ست عادات تحافظ على الصحة: غسل اليدين، وتنظيف الأسنان، والنوم الكافي، وأكل الخضار، والرياضة، وشرب الماء.', levels=['a5', 'a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='الصحة', sort=93)
    items = [('1f9fc', 'أغسل يديّ', 'قبل الأكل وبعده'), ('1f9b7', 'أنظّف أسناني', 'مرتين كل يوم'), ('1f634', 'أنام جيدًا', 'ليلًا في وقت مبكر'), ('1f955', 'آكل الخضار', 'كل يوم'), ('1f4aa', 'أمارس الرياضة', 'لتقوى عضلاتي'), ('1f4a7', 'أشرب الماء', 'أكثر من مرة')]
    return sp, P(sp, 'عاداتي الصحية', 'أعتني بجسمي كل يوم', cellgrid(items, 2, 3, 26, 19))

@spec('poster-plant-needs')
def _():
    sp = G(title='ماذا يحتاج النبات ليعيش؟', desc='ملصق الحاجات الأربع للنبات: ضوء الشمس والماء والهواء والتربة، بصور كبيرة وجملة توضح فائدة كل حاجة.', levels=['g1', 'g2', 'g3', 'g4'], subject='العلوم', topic='النبات', sort=94)
    items = [('2600', 'ضوء الشمس', 'يساعده على صنع غذائه'), ('1f4a7', 'الماء', 'يمتصه من التربة بجذوره'), ('x_wind', 'الهواء', 'يأخذ منه غازًا يحتاجه'), ('x_soil', 'التربة', 'تثبّته وتعطيه الأملاح')]
    return sp, P(sp, 'ماذا يحتاج النبات؟', 'أربع حاجات تُنمّي النبتة', cellgrid(items, 2, 2, 34, 22))

@spec('poster-moon-phases')
def _():
    sp = G(title='أطوار القمر', desc='ملصق أطوار القمر الثمانية مرسومة برمجيًا: المحاق والهلال المتزايد والتربيع الأول والأحدب المتزايد والبدر والأحدب المتناقص والتربيع الأخير والهلال المتناقص.', levels=['g3', 'g4'], subject='العلوم', topic='الفضاء', sort=95, note=NG + ' الرسم كما يُرى من نصف الكرة الشمالي، ويبدو معكوسًا في نصف الكرة الجنوبي.')
    names = ['المحاق', 'هلال متزايد', 'التربيع الأول', 'أحدب متزايد', 'البدر', 'أحدب متناقص', 'التربيع الأخير', 'هلال متناقص']
    def moon(p):
        r = 40; cx = cy = 50
        base = f'<circle cx="50" cy="50" r="40" fill="#2b2250"/>'
        if p == 0: lit = ''
        elif p == 4: lit = f'<circle cx="50" cy="50" r="40" fill="#ffe082"/>'
        else:
            k = abs(math.cos(math.pi * (p % 4) / 4)) if p % 4 else 0
            k = abs(math.cos(math.pi * (p if p < 4 else 8 - p) / 4))
            ph = p if p < 4 else 8 - p
            rx = r * k
            sw = 0 if ph < 2 else 1
            d = f'M50 10 A40 40 0 0 1 50 90 A{rx:.2f} 40 0 0 {sw} 50 10 Z'
            tf = '' if p < 4 else ' transform="translate(100,0) scale(-1,1)"'
            lit = f'<path d="{d}" fill="#ffe082"{tf}/>'
        return f'<svg viewBox="0 0 100 100" width="34mm" height="34mm">{base}{lit}<circle cx="50" cy="50" r="40" fill="none" stroke="#7c3aed" stroke-width="2"/></svg>'
    cs = ''.join(C(f'{moon(i)}<div style="font-size:15pt;font-weight:700;margin-top:1mm">{names[i]}</div><div style="font-size:11pt;color:#777">{AD(i + 1)}</div>', PAL[i % 8]) for i in range(8))
    return sp, P(sp, 'أطوار القمر', 'يتغيّر شكل القمر خلال الشهر', gridcells(cs, 2, 4))

@spec('poster-ar-demonstratives')
def _():
    sp = G(title='أسماء الإشارة', desc='ملصق أسماء الإشارة الأساسية: هذا وهذه للقريب، وذلك وتلك للبعيد، وهؤلاء للجمع، مع مثال لكل اسم إشارة.', levels=['g2', 'g3', 'g4'], subject='اللغة العربية', topic='النحو', sort=96)
    Q = [('هذا', 'للمفرد المذكر القريب', 'هذا كتابٌ جميل', '#e53935'), ('هذه', 'للمفرد المؤنث القريب', 'هذه حديقةٌ واسعة', '#fb8c00'), ('ذلك', 'للمفرد المذكر البعيد', 'ذلك جبلٌ عالٍ', '#43a047'), ('تلك', 'للمفرد المؤنث البعيد', 'تلك شجرةٌ كبيرة', '#039be5'), ('هؤلاء', 'للجمع القريب', 'هؤلاء طلابٌ مجتهدون', '#8e24aa')]
    rows = ''.join(f'<div style="display:flex;align-items:center;gap:4mm;flex:1;border:.6mm solid {c};background:{c}12;border-radius:5mm;padding:0 5mm"><div style="font-size:28pt;font-weight:700;color:{c};width:34mm;flex:none">{w}</div><div style="flex:1"><div style="font-size:15pt;font-weight:700">{d}</div><div style="font-size:15pt;color:#4b4666">{e}</div></div></div>' for w, d, e, c in Q)
    return sp, P(sp, 'أسماء الإشارة', 'نشير إلى القريب والبعيد', f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{rows}</div>')

@spec('poster-en-colors')
def _():
    sp = G(title='English Colors (الألوان)', desc='ملصق عشرة ألوان بالإنجليزية مع دائرة ملوّنة وترجمة عربية لكل لون: red وblue وgreen وyellow وorange وpurple وpink وbrown وblack وwhite.', levels=['a4', 'a5', 'a6', 'g1', 'g2'], subject='اللغة الإنجليزية', topic='Colors', sort=97)
    Cs = [('red', 'أحمر', '#e53935'), ('blue', 'أزرق', '#1e88e5'), ('green', 'أخضر', '#43a047'), ('yellow', 'أصفر', '#fdd835'), ('orange', 'برتقالي', '#fb8c00'), ('purple', 'بنفسجي', '#8e24aa'), ('pink', 'وردي', '#ec407a'), ('brown', 'بنّي', '#795548'), ('black', 'أسود', '#212121'), ('white', 'أبيض', '#ffffff')]
    cs = ''.join(f'<div class="cell" style="border-color:{c if c != "#ffffff" else "#999"};background:#fff;gap:1.5mm"><div style="width:15mm;height:15mm;border-radius:50%;background:{c};border:.6mm solid #999"></div><div style="font-size:16pt;font-weight:700;direction:ltr;line-height:1">{e}</div><div style="font-size:12pt;line-height:1">{a}</div></div>' for e, a, c in Cs)
    body = '<div style="display:flex;flex-direction:column;flex:1;min-height:0;direction:ltr">' + gridcells(cs, 2, 5) + '</div>'
    return sp, P(sp, 'Colors', 'نسمّي الألوان بالإنجليزية', body)
