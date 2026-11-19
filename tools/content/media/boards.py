# -*- coding: utf-8 -*-
from common import *
NOTE = 'لوحة تعليمية أصلية من إعداد زاد؛ الرسومات من مكتبة زاد الكرتونية. لم تُراجَع من جهة تعليمية رسمية.'
def SP(**k): k.setdefault('kind', 'board'); k.setdefault('orient', 'landscape'); k.setdefault('note', NOTE); return k

@spec('bd-weather')
def _():
    sp = SP(title='لوحة الطقس اليومي', desc='لوحة تفاعلية للحائط: يكتب الطفل اليوم والتاريخ ويلوّن حالة الطقس من خمس حالات (مشمس، غائم، ماطر، عاصف، ريحي).', levels=['a4', 'a5', 'a6', 'g1', 'g2', 'g3'], subject='العلوم', topic='الطقس', sort=1)
    W = [('مشمس', '2600', '#f9a825'), ('غائم', '2601', '#78909c'), ('ماطر', '1f327', '#039be5'), ('عاصف', '26c8', '#5e35b1'), ('رياح', 'x_wind', '#00897b')]
    cells = ''.join(f'<div style="flex:1;border:.8mm solid {c};background:{c}12;border-radius:8mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm">{I(ic, 34)}<div style="font-size:20pt;font-weight:700;color:{c}">{t}</div><div style="width:14mm;height:14mm;border:.6mm dashed {c};border-radius:50%"></div></div>' for t, ic, c in W)
    top = '<div style="display:flex;gap:6mm;margin-bottom:5mm">' + ''.join(f'<div style="flex:1;border-bottom:.6mm solid #8f86b8;padding:2mm 0;font-size:18pt;font-weight:700;color:var(--c)">{t}: <span style="color:#bbb">............</span></div>' for t in ['اليوم', 'التاريخ', 'الشهر']) + '</div>'
    body = f'{top}<div style="font-size:19pt;font-weight:700;text-align:center;margin-bottom:3mm">كيف الطقس اليوم؟ ضع علامة أو لوّن الدائرة</div><div style="display:flex;gap:5mm;flex:1;min-height:0">{cells}</div>'
    return sp, [page(sp, 'لوحة الطقس اليومي', 'نراقب الطقس كل يوم', body)]

@spec('bd-class-jobs')
def _():
    sp = SP(title='لوحة مسؤوليات الصف', desc='لوحة للحائط بست مسؤوليات صفية مع خط لكتابة اسم الطالب المسؤول، لتعزيز المشاركة وتحمّل المسؤولية.', levels=['g1', 'g2', 'g3', 'g4'], subject='المهارات الحياتية', topic='المسؤولية', sort=2)
    J = [('مسؤول الطابور', '1f6b6'), ('مسؤول السبورة', 'i_board'), ('مسؤول النظافة', '1f9fc'), ('مسؤول الدفاتر', '1f4da'), ('مسؤول النباتات', 'x_wcan'), ('مسؤول الأدوات', '1f9f0')]
    cells = ''.join(f'<div class="cell" style="border-color:{PAL[i % 8]};background:{PAL[i % 8]}10;gap:1.5mm">{I(ic, 24)}<div style="font-size:17pt;font-weight:700;color:{PAL[i % 8]}">{t}</div><div style="width:85%;border-bottom:.5mm solid #8f86b8;height:9mm;font-size:11pt;color:#9a93b8;text-align:start">الاسم:</div></div>' for i, (t, ic) in enumerate(J))
    return sp, [page(sp, 'لوحة مسؤوليات الصف', 'كل واحد منّا له دور', f'<div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);flex:1;min-height:0;gap:5mm">{cells}</div>')]

@spec('bd-seasons')
def _():
    sp = SP(title='لوحة فصول السنة الأربعة', desc='لوحة تعليمية للفصول الأربعة: الربيع والصيف والخريف والشتاء، مع صفة بسيطة لكل فصل ومساحة للرسم.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='الفصول', sort=3, note='الأوصاف عامة للمناطق المعتدلة وقد يختلف شكل الفصول بحسب المنطقة. ' + NOTE)
    S = [('الربيع', '1f338', 'الجو معتدل وتتفتّح الأزهار', '#ec407a'), ('الصيف', '2600', 'الجو حارّ والنهار طويل', '#f9a825'), ('الخريف', 'x_leaf', 'الجو معتدل وتتساقط أوراق بعض الأشجار', '#fb8c00'), ('الشتاء', 'x_snowflake', 'الجو بارد والنهار أقصر', '#039be5')]
    cells = ''.join(f'<div class="cell" style="border-color:{c};background:{c}12;gap:2mm">{I(ic, 34)}<div style="font-size:24pt;font-weight:700;color:{c}">{t}</div><div style="font-size:12.5pt;line-height:1.6;padding:0 3mm">{d}</div><div style="width:85%;height:25mm;border:.5mm dashed {c};border-radius:4mm;background:#fff;font-size:10.5pt;color:#9a93b8">ارسم ما تحبّه في هذا الفصل</div></div>' for t, ic, d, c in S)
    return sp, [page(sp, 'فصول السنة الأربعة', 'أربعة فصول تتكرّر كل سنة', f'<div class="grid" style="grid-template-columns:repeat(4,1fr);flex:1;min-height:0;gap:5mm">{cells}</div>')]
