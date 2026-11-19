# -*- coding: utf-8 -*-
from boards import *
NB = 'لوحة تعليمية أصلية من إعداد زاد، تُطبع بحجم ١٠٠٪ على ورق A4 وتُعلّق أو تُستعمل في الصف أو البيت. لم تُراجَع من جهة تعليمية رسمية.'
def BD(**k): k.setdefault('note', NB); return SP(**k)
STAR = lambda c='#d9d3ee', s=11: f'<svg viewBox="0 0 24 24" width="{s}mm" height="{s}mm"><polygon points="12,2 15,9 22,9.5 16.5,14 18.5,21.5 12,17.5 5.5,21.5 7.5,14 2,9.5 9,9" fill="none" stroke="{c}" stroke-width="1.2" stroke-dasharray="2 1.5" stroke-linejoin="round"/></svg>'
LN = '<div style="border-bottom:.4mm solid #8f86b8;height:8mm"></div>'

@spec('bd-birthdays')
def _():
    sp = BD(title='لوحة أعياد ميلاد الصف', desc='لوحة للحائط بالأشهر الميلادية الاثني عشر يكتب كل طالب اسمه تحت شهر ميلاده، لتبادل التهنئة وتعلّم أسماء الأشهر.', levels=['g1', 'g2', 'g3', 'g4'], subject='المهارات الحياتية', topic='المناسبات', sort=10)
    M = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    cs = ''.join(f'<div style="border:.7mm solid {PAL[i % 8]};background:{PAL[i % 8]}0f;border-radius:5mm;overflow:hidden;display:flex;flex-direction:column"><div style="background:{PAL[i % 8]};color:#fff;text-align:center;font-size:16pt;font-weight:700;padding:1.2mm;display:flex;align-items:center;justify-content:center;gap:2mm">{I("1f382", 7)}{m}</div><div style="flex:1;padding:0 3mm;display:flex;flex-direction:column;justify-content:space-evenly">{LN}{LN}</div></div>' for i, m in enumerate(M))
    return sp, [page(sp, 'أعياد ميلادنا', 'نكتب اسمنا تحت شهر ميلادنا', f'<div class="grid" style="grid-template-columns:repeat(4,1fr);grid-template-rows:repeat(3,1fr);flex:1;min-height:0;gap:4mm">{cs}</div>')]

@spec('bd-star-chart')
def _():
    sp = BD(title='لوحة النجوم الأسبوعية', desc='لوحة تحفيز: جدول بأيام الأسبوع من الأحد إلى الخميس وسبعة أسطر لأسماء الطلاب، يلوّن المعلم نجمة لكل يوم يلتزم فيه الطالب بهدف الأسبوع.', levels=['a5', 'a6', 'g1', 'g2', 'g3', 'g4'], subject='المهارات الحياتية', topic='التحفيز', sort=11)
    D = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
    th = '<th style="width:42mm">الاسم</th>' + ''.join(f'<th>{d}</th>' for d in D)
    rows = ''.join('<tr><td style="height:15mm"></td>' + ''.join(f'<td>{STAR()}</td>' for _ in D) + '</tr>' for _ in range(7))
    body = f'{tcss_()}<div style="font-size:16pt;font-weight:700;margin-bottom:3mm">هدف الأسبوع: ..............................................................</div><table class="tb" style="flex:1">{"<tr>" + th + "</tr>"}{rows}</table>'
    return sp, [page(sp, 'لوحة النجوم', 'نجمة لكل يوم نلتزم فيه بهدفنا', body)]

def tcss_(): return '<style>.tb{width:100%;border-collapse:collapse;table-layout:fixed}.tb td,.tb th{border:.4mm solid #d8d2ee;text-align:center;padding:1mm;font-weight:700}.tb th{background:var(--c);color:#fff;font-size:14pt}.tb td{background:#fff}</style>'

@spec('bd-timetable')
def _():
    sp = BD(title='الجدول الأسبوعي للحصص', desc='جدول فارغ بأيام الدراسة من الأحد إلى الخميس وست حصص في اليوم تُكتب فيه المواد بخط اليد، مع خانة للاستراحة.', levels=['g1', 'g2', 'g3', 'g4'], subject='المهارات الحياتية', topic='التنظيم', sort=12)
    D = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس']
    th = '<th style="width:30mm"></th>' + ''.join(f'<th>الحصة {AD(i)}</th>' for i in range(1, 7))
    rows = ''.join(f'<tr><td style="background:{PAL[i]};color:#fff;font-size:15pt;height:19mm">{d}</td>' + ''.join('<td></td>' for _ in range(6)) + '</tr>' for i, d in enumerate(D))
    body = f'{tcss_()}<table class="tb" style="flex:1"><tr>{th}</tr>{rows}</table><div style="margin-top:3mm;font-size:12pt;color:#4b4666;text-align:center">نكتب اسم المادة في كل خانة، ونلوّن كل مادة بلون خاص بها</div>'
    return sp, [page(sp, 'جدول حصصي', 'أنظّم أسبوعي الدراسي', body)]

@spec('bd-reading-log')
def _():
    sp = BD(title='سجل قراءتي', desc='سجل قراءة من ثمانية أسطر: اسم الكتاب وعدد صفحاته وتاريخ القراءة وتقييم الطالب بخمس نجوم، لتشجيع القراءة المنتظمة.', levels=['g1', 'g2', 'g3', 'g4'], subject='اللغة العربية', topic='القراءة', sort=13)
    th = '<th style="width:12mm">م</th><th>اسم الكتاب</th><th style="width:30mm">الصفحات</th><th style="width:36mm">التاريخ</th><th style="width:60mm">رأيي</th>'
    rows = ''.join(f'<tr><td style="height:13mm;font-size:15pt;color:{PAL[i % 8]}">{AD(i + 1)}</td><td></td><td></td><td></td><td><div style="display:flex;justify-content:center;gap:1mm;flex-wrap:nowrap">{"".join(STAR("#e0b100", 8) for _ in range(5))}</div></td></tr>' for i in range(8))
    body = f'{tcss_()}<div style="font-size:14pt;margin-bottom:2mm">الاسم: ........................................</div><table class="tb" style="flex:1"><tr>{th}</tr>{rows}</table>'
    return sp, [page(sp, 'سجل قراءتي', 'كل كتاب أقرؤه يزيدني معرفة', body)]

@spec('bd-word-wall')
def _():
    sp = BD(title='حائط الكلمات', desc='لوحة بالحروف الهجائية الثمانية والعشرين، في كل مربع حرف كبير ومساحة لكتابة الكلمات الجديدة التي يتعلمها الطالب وتبدأ بهذا الحرف.', levels=['g1', 'g2', 'g3'], subject='اللغة العربية', topic='المفردات', sort=14)
    AL = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split()
    cs = ''.join(f'<div style="border:.5mm solid {PAL[i % 8]};background:{PAL[i % 8]}0d;border-radius:3mm;display:flex;flex-direction:column;overflow:hidden"><div style="background:{PAL[i % 8]};color:#fff;text-align:center;font-size:17pt;font-weight:700;line-height:1.15">{ch}</div><div style="flex:1;padding:0 2mm;display:flex;flex-direction:column;justify-content:space-evenly"><div style="border-bottom:.3mm solid #8f86b8"></div><div style="border-bottom:.3mm solid #8f86b8"></div></div></div>' for i, ch in enumerate(AL))
    return sp, [page(sp, 'حائط الكلمات', 'نكتب كلماتنا الجديدة تحت حرفها', f'<div class="grid" style="grid-template-columns:repeat(7,1fr);grid-template-rows:repeat(4,1fr);flex:1;min-height:0;gap:2.5mm">{cs}</div>')]

@spec('bd-feelings-checkin')
def _():
    sp = BD(title='لوحة مشاعري اليوم', desc='لوحة بست مشاعر بوجوه كرتونية (فرحان وحزين وغاضب وخائف ونعسان ومستغرب) يكتب الطفل اسمه أو يلصق بطاقته تحت الشعور الذي يحسّ به، لتعزيز التعبير عن المشاعر.', levels=['a4', 'a5', 'a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='المشاعر', sort=15)
    F = [('1f604', 'فرحان'), ('1f622', 'حزين'), ('1f620', 'غاضب'), ('1f628', 'خائف'), ('1f634', 'نعسان'), ('1f914', 'متفكّر')]
    cs = ''.join(f'<div style="border:.8mm solid {PAL[i]};background:{PAL[i]}10;border-radius:6mm;display:flex;flex-direction:column;align-items:center;padding:3mm;gap:2mm">{I(ic, 26)}<div style="font-size:18pt;font-weight:700;color:{PAL[i]}">{t}</div><div style="flex:1;width:100%;border:.5mm dashed {PAL[i]};border-radius:3mm;background:#fff"></div></div>' for i, (ic, t) in enumerate(F))
    return sp, [page(sp, 'كيف أشعر اليوم؟', 'أكتب اسمي أو ألصق بطاقتي تحت شعوري', f'<div class="grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);flex:1;min-height:0;gap:4mm">{cs}</div>')]
