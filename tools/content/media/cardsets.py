# -*- coding: utf-8 -*-
from common import *
NOTE = 'بطاقات مفاهيم أصلية من إعداد زاد؛ الرسومات من مكتبة زاد الكرتونية. لم تُراجَع من جهة تعليمية رسمية.'
EQ = lambda s: '‭' + s + '‬'
def SP(**k): k.setdefault('kind', 'concept_cards'); k.setdefault('orient', 'landscape'); k.setdefault('note', NOTE); return k
def sheet(sp, title, cards, cols=4):
    pages = []
    for i in range(0, len(cards), 8):
        chunk = cards[i:i + 8]
        g = ''.join(f'<div style="border:.5mm dashed #8f86b8;border-radius:5mm;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2mm;background:{c}0f;gap:1mm;min-width:0">{h}</div>' for h, c in chunk)
        body = f'<div class="grid" style="grid-template-columns:repeat({cols},1fr);grid-template-rows:repeat(2,1fr);flex:1;min-height:0;gap:3mm">{g}</div>'
        pages.append(page(sp, title, 'قصّ البطاقات على الخطوط المتقطعة', body))
    return pages

@spec('cc-opposites')
def _():
    sp = SP(title='بطاقات الأضداد', desc='ستّ عشرة بطاقة لثمانية أزواج من الأضداد مع رسمة لكل كلمة، للقص واللعب والمطابقة.', levels=['a3', 'a4', 'a5', 'a6', 'g1'], subject='اللغة العربية', topic='الأضداد', sort=1)
    pairs = [('كبير', '1f418', 'صغير', '1f42d'), ('طويل', '1f992', 'قصير', '1f439'), ('ثقيل', 'x_stone', 'خفيف', '1fae7'), ('سريع', '1f430', 'بطيء', '1f422'), ('حارّ', '1f525', 'بارد', 'x_snowflake'), ('نهار', '2600', 'ليل', '1f319'), ('سعيد', '1f604', 'حزين', '1f622'), ('نائم', '1f634', 'مستيقظ', '1f60a')]
    cards = []
    for i, (a, ia, b, ib) in enumerate(pairs):
        c = PAL[i % 8]
        for w, ic, o in ((a, ia, b), (b, ib, a)):
            cards.append((f'{I(ic, 26)}<div style="font-size:24pt;font-weight:700;color:{c}">{w}</div><div style="font-size:11pt;color:#4b4666">ضدّها: {o}</div>', c))
    return sp, sheet(sp, 'بطاقات الأضداد', cards)

@spec('cc-positions')
def _():
    sp = SP(title='بطاقات الأماكن والاتجاهات', desc='ثماني بطاقات مرسومة تعبّر عن كلمات المكان: فوق وتحت وداخل وخارج وأمام وخلف وبجانب وبين.', levels=['a4', 'a5', 'a6', 'g1'], subject='اللغة العربية', topic='مفاهيم المكان', sort=2)
    BX = lambda x, y, w, h: f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="6" fill="#ffb74d" stroke="#6d4c41" stroke-width="4"/>'
    BL = lambda x, y: f'<circle cx="{x}" cy="{y}" r="22" fill="#e53935" stroke="#7f0000" stroke-width="4"/><circle cx="{x - 7}" cy="{y - 8}" r="6" fill="#fff" opacity=".6"/>'
    S = {'فوق': BX(60, 80, 80, 55) + BL(100, 48), 'تحت': BX(60, 20, 80, 45) + BL(100, 105),
         'داخل': f'<path d="M62,60 L62,130 L138,130 L138,60" fill="#ffb74d" stroke="#6d4c41" stroke-width="4"/>' + BL(100, 95) + '<rect x="62" y="95" width="76" height="35" fill="#ffb74d" stroke="#6d4c41" stroke-width="4"/>',
         'خارج': f'<path d="M30,60 L30,130 L100,130 L100,60" fill="#ffb74d" stroke="#6d4c41" stroke-width="4"/>' + BL(150, 108),
         'أمام': BX(60, 40, 80, 80) + BL(100, 112), 'خلف': BL(115, 55) + BX(60, 50, 80, 80),
         'بجانب': BX(40, 70, 70, 60) + BL(145, 108), 'بين': BX(15, 70, 55, 60) + BX(130, 70, 55, 60) + BL(100, 108)}
    sent = {'فوق': 'الكرة فوق الصندوق', 'تحت': 'الكرة تحت الصندوق', 'داخل': 'الكرة داخل الصندوق', 'خارج': 'الكرة خارج الصندوق', 'أمام': 'الكرة أمام الصندوق', 'خلف': 'الكرة خلف الصندوق', 'بجانب': 'الكرة بجانب الصندوق', 'بين': 'الكرة بين الصندوقين'}
    cards = []
    for i, k in enumerate(S):
        c = PAL[i % 8]
        cards.append((f'<svg viewBox="0 0 200 150" style="width:100%;height:30mm">{S[k]}</svg><div style="font-size:22pt;font-weight:700;color:{c}">{k}</div><div style="font-size:11pt">{sent[k]}</div>', c))
    return sp, sheet(sp, 'بطاقات الأماكن والاتجاهات', cards)

@spec('cc-math-concepts')
def _():
    sp = SP(title='بطاقات مفاهيم الرياضيات', desc='ثماني بطاقات لمفاهيم أساسية: أكبر من وأصغر من ويساوي والعدد الزوجي والفردي والمجموع والفرق وحاصل الضرب، مع مثال لكل مفهوم.', levels=['g1', 'g2', 'g3'], subject='الرياضيات', topic='مفاهيم أساسية', sort=3)
    D = [('أكبر من', EQ('7 > 3'), 'العدد الأكبر في الجهة المفتوحة'), ('أصغر من', EQ('2 < 8'), 'العدد الأصغر في الجهة المغلقة'), ('يساوي', EQ('5 = 5'), 'العددان لهما القيمة نفسها'), ('عدد زوجي', EQ('2 , 4 , 6 , 8 , 10'), 'ينتهي بـ ٠ أو ٢ أو ٤ أو ٦ أو ٨'), ('عدد فردي', EQ('1 , 3 , 5 , 7 , 9'), 'ينتهي بـ ١ أو ٣ أو ٥ أو ٧ أو ٩'), ('المجموع', EQ('3 + 4 = 7'), 'ناتج الجمع'), ('الفرق', EQ('9 − 4 = 5'), 'ناتج الطرح'), ('حاصل الضرب', EQ('3 × 4 = 12'), 'ناتج الضرب')]
    cards = [(f'<div style="font-size:21pt;font-weight:700;color:{PAL[i % 8]}">{t}</div><div style="font-size:23pt;font-weight:700;margin:2mm 0">{e}</div><div style="font-size:11pt;line-height:1.5;color:#4b4666">{d}</div>', PAL[i % 8]) for i, (t, e, d) in enumerate(D)]
    return sp, sheet(sp, 'بطاقات مفاهيم الرياضيات', cards)

@spec('cc-science-words')
def _():
    sp = SP(title='بطاقات مفاهيم علمية', desc='ثماني بطاقات لمفاهيم علمية بسيطة: الضوء والصوت والحرارة والماء والهواء والتربة والنبات والحيوان، بتعريف قصير ورسمة.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='مفاهيم علمية', sort=4)
    D = [('الضوء', '1f4a1', 'يساعدنا على رؤية الأشياء'), ('الصوت', '1f3b5', 'ينتج عن اهتزاز الأشياء'), ('الحرارة', '1f525', 'تجعل الأشياء ساخنة'), ('الماء', '1f4a7', 'سائل شفاف لا نعيش بدونه'), ('الهواء', 'x_wind', 'غاز حولنا لا نراه لكنه يتحرّك'), ('التربة', 'x_soil', 'تنمو فيها النباتات'), ('النبات', '1f331', 'كائن حيّ يصنع غذاءه بالضوء'), ('الحيوان', '1f43e', 'كائن حيّ يتحرّك ويحتاج إلى غذاء')]
    cards = [(f'{I(ic, 24)}<div style="font-size:22pt;font-weight:700;color:{PAL[i % 8]}">{t}</div><div style="font-size:11.5pt;line-height:1.5;color:#4b4666">{d}</div>', PAL[i % 8]) for i, (t, ic, d) in enumerate(D)]
    return sp, sheet(sp, 'بطاقات مفاهيم علمية', cards)
