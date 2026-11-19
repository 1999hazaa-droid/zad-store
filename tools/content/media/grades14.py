# -*- coding: utf-8 -*-
from posters2 import *
from posters import C, gridcells
L = lambda t: f'<span dir="ltr" class="l">{t}</span>'
NG = 'محتوى وتصميم أصليان من إعداد زاد، غير منسوبين إلى منهج أو كتاب محدد. لم يُراجَع من جهة تعليمية رسمية.'
def G(**k): k.setdefault('note', NG); return SP(**k)
def TG(**k): return TS(**k)

@spec('poster-even-odd')
def _():
    sp = G(title='الأعداد الزوجية والفردية', desc='ملصق يفرّق بين العدد الزوجي (يقبل القسمة على ٢ دون باقٍ) والفردي، مع الأعداد من ١ إلى ٢٠ ملوّنة حسب نوعها وقاعدة الأرقام الأخيرة.', levels=['g1', 'g2', 'g3'], subject='الرياضيات', topic='الأعداد', sort=80)
    cs = ''.join(f'<div style="display:grid;place-items:center;font-size:26pt;font-weight:700;border-radius:3mm;color:#fff;background:{"#7c3aed" if n % 2 == 0 else "#fb8c00"}">{AD(n)}</div>' for n in range(1, 21))
    body = f'<div style="display:grid;grid-template-columns:repeat(5,1fr);grid-template-rows:repeat(4,1fr);gap:2.5mm;flex:1;min-height:0;direction:ltr">{cs}</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-top:3mm"><div style="background:#7c3aed14;border:.6mm solid #7c3aed;border-radius:4mm;padding:3mm;text-align:center;font-size:13pt;line-height:1.6"><b style="color:#7c3aed;font-size:16pt">زوجي (بنفسجي)</b><br>ينتهي بأحد الأرقام: {LRO('٠ ، ٢ ، ٤ ، ٦ ، ٨')}<br>نقسمه إلى مجموعتين متساويتين</div><div style="background:#fb8c0014;border:.6mm solid #fb8c00;border-radius:4mm;padding:3mm;text-align:center;font-size:13pt;line-height:1.6"><b style="color:#e65100;font-size:16pt">فردي (برتقالي)</b><br>ينتهي بأحد الأرقام: {LRO('١ ، ٣ ، ٥ ، ٧ ، ٩')}<br>يبقى منه واحد دون زوج</div></div>'
    return sp, P(sp, 'زوجي أم فردي؟', 'ننظر إلى رقم الآحاد', body)

@spec('tbl-skip-counting')
def _():
    sp = TG(title='جدول العدّ القفزي', desc='جدول العدّ القفزي بالأعداد ٢ و٣ و٥ و١٠: عشرة أعداد متتالية لكل عدّ، محسوبة برمجيًا، لتمهيد جدول الضرب.', levels=['g1', 'g2', 'g3'], subject='الرياضيات', topic='العدّ', sort=81)
    r = ''
    for i, s in enumerate([2, 3, 5, 10]):
        c = PAL[i % 8]
        r += f'<tr style="background:{c}12"><td style="font-size:20pt;color:{c}">نعدّ بـ {AD(s)}</td>' + ''.join(f'<td style="font-size:20pt">{AD(s * k)}</td>' for k in range(1, 11)) + '</tr>'
    body = f'{tcss()}<table class="tb" style="flex:1;direction:ltr"><tr><th style="direction:rtl">العدّ</th>' + ''.join(f'<th>{AD(k)}</th>' for k in range(1, 11)) + f'</tr>{r}</table><div style="margin-top:4mm;font-size:14pt;line-height:1.9;text-align:center">كل عدد في الصف = العدد الذي قبله + خطوة القفز<br>مثال: نعدّ بـ ٥ : {LRO("٥ ، ١٠ ، ١٥ ، ٢٠ ، ٢٥")}</div>'
    return sp, P(sp, 'العدّ القفزي', 'نقفز بالأعداد ٢ و٣ و٥ و١٠', body)

@spec('poster-rounding')
def _():
    sp = G(title='التقريب لأقرب عشرة', desc='ملصق قاعدة التقريب لأقرب عشرة: إن كان رقم الآحاد ٠ إلى ٤ نُبقي رقم العشرات، وإن كان ٥ إلى ٩ نزيده واحدًا، مع أمثلة محسوبة وخط أعداد.', levels=['g2', 'g3', 'g4'], subject='الرياضيات', topic='التقريب', sort=82)
    def rd(n): return (n // 10) * 10 + (10 if n % 10 >= 5 else 0)
    ex = [23, 37, 45, 52, 68, 74, 81, 96]
    cs = ''.join(C(f'<div style="font-size:15pt;font-weight:700">{LRO(AD(n))}</div><div style="font-size:12pt;color:#666">الآحاد {AD(n % 10)}</div><div style="font-size:22pt;font-weight:700;color:{"#43a047" if n % 10 < 5 else "#e53935"}">{LRO(AD(rd(n)))}</div>', "#43a047" if n % 10 < 5 else "#e53935") for n in ex)
    rule = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3mm;margin-bottom:3mm"><div style="background:#43a04718;border:.6mm solid #43a047;border-radius:4mm;padding:3mm;text-align:center;font-size:14pt;line-height:1.6"><b style="font-size:17pt;color:#2e7d32">الآحاد من ٠ إلى ٤</b><br>نبقي العشرات كما هي<br>(نقرّب إلى الأسفل)</div><div style="background:#e5393518;border:.6mm solid #e53935;border-radius:4mm;padding:3mm;text-align:center;font-size:14pt;line-height:1.6"><b style="font-size:17pt;color:#c62828">الآحاد من ٥ إلى ٩</b><br>نزيد العشرات واحدًا<br>(نقرّب إلى الأعلى)</div></div>'
    return sp, P(sp, 'التقريب لأقرب عشرة', 'ننظر إلى رقم الآحاد', rule + gridcells(cs, 4, 2))

@spec('tbl-division-facts')
def _():
    sp = TG(title='جدول القسمة', desc='جدول حقائق القسمة المرتبطة بالضرب لأعداد القسمة ٢ و٣ و٤ و٥: عشر معادلات لكل عدد، محسوبة برمجيًا، مع تذكير بأن القسمة عكس الضرب.', levels=['g3', 'g4'], subject='الرياضيات', topic='القسمة', sort=83)
    cols = ''
    for i, d in enumerate([2, 3, 4, 5]):
        c = PAL[i % 8]
        rows = ''.join(f'<div style="font-size:11.5pt;padding:.2mm 0;border-bottom:.3mm solid #e5e0f5">{LRO(AD(f"{d * k} ÷ {d} = {k}"))}</div>' for k in range(1, 11))
        cols += f'<div style="border:.6mm solid {c};border-radius:4mm;overflow:hidden;text-align:center;background:{c}0f"><div style="background:{c};color:#fff;font-size:15pt;font-weight:700;padding:1.2mm">القسمة على {AD(d)}</div>{rows}</div>'
    body = f'<div style="display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:3mm;flex:1;min-height:0">{cols}</div><div style="margin-top:3mm;font-size:13pt;text-align:center">القسمة عكس الضرب: نستعين بجدول الضرب لنجد ناتج القسمة</div>'
    return sp, P(sp, 'جدول القسمة', 'القسمة عكس الضرب', body)

@spec('poster-ar-ta-marbuta')
def _():
    sp = G(title='التاء المربوطة والتاء المفتوحة', desc='ملصق يفرّق بين التاء المربوطة (ة) التي تأتي في آخر الاسم المفرد المؤنث، والتاء المفتوحة (ت) في آخر الأفعال وبعض الأسماء، مع أمثلة.', levels=['g2', 'g3', 'g4'], subject='اللغة العربية', topic='الإملاء', sort=84)
    A = [('مدرسة', 'حديقة', 'وردة', 'شجرة', 'مكتبة', 'طالبة')]
    B = [('بيت', 'وقت', 'صوت', 'أخت', 'بنت', 'كتبتُ')]
    def col(title, sub, words, c, big):
        ws = ''.join(f'<div style="font-size:24pt;font-weight:700;padding:2mm;border-bottom:.3mm solid #e5e0f5">{w}</div>' for w in words)
        return f'<div style="border:.7mm solid {c};border-radius:5mm;background:{c}0f;overflow:hidden;text-align:center;display:flex;flex-direction:column"><div style="background:{c};color:#fff;padding:3mm"><div style="font-size:42pt;line-height:1;font-weight:700">{big}</div><div style="font-size:17pt;font-weight:700">{title}</div><div style="font-size:12pt">{sub}</div></div><div style="flex:1;display:flex;flex-direction:column;justify-content:space-around">{ws}</div></div>'
    body = f'<div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;flex:1;min-height:0">{col("التاء المربوطة", "نقف عليها بالهاء: مدرسهْ", A[0], "#e91e63", "ة")}{col("التاء المفتوحة", "نقف عليها بالتاء: بيتْ", B[0], "#039be5", "ت")}</div><div style="margin-top:3mm;font-size:12.5pt;line-height:1.7;text-align:center">المربوطة تأتي غالبًا في آخر الاسم المفرد المؤنث · المفتوحة تأتي في آخر الفعل وفي بعض الأسماء</div>'
    return sp, P(sp, 'التاء المربوطة والمفتوحة', 'نفرّق بينهما عند الكتابة', body)

@spec('poster-en-numbers-20')
def _():
    W = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty']
    sp = G(title='English Numbers 1–20', desc='ملصق الأعداد من ١ إلى ٢٠ بالإنجليزية: الرقم وكتابته الإنجليزية، ملوّنة لتسهيل الحفظ.', levels=['a5', 'a6', 'g1', 'g2', 'g3'], subject='اللغة الإنجليزية', topic='Numbers', sort=85)
    cs = ''.join(C(f'<div style="font-size:30pt;font-weight:700;line-height:1;color:{PAL[i % 8]};direction:ltr">{i + 1}</div><div class="l" style="font-size:15pt;font-weight:700;direction:ltr">{w}</div>', PAL[i % 8]) for i, w in enumerate(W))
    return sp, P(sp, 'Numbers 1–20', 'نقرأ الأعداد بالإنجليزية', '<div style="display:flex;flex-direction:column;flex:1;min-height:0;direction:ltr">'+gridcells(cs, 4, 5, 2.5)+'</div>')

@spec('poster-en-prepositions')
def _():
    sp = G(title='Prepositions of Place (حروف الجر للمكان)', desc='ملصق حروف الجر الستة للمكان في الإنجليزية: in وon وunder وbehind وnext to وin front of، مع المعنى بالعربية ومثال لكل حرف.', levels=['g2', 'g3', 'g4'], subject='اللغة الإنجليزية', topic='Grammar', sort=86)
    Q = [('in', 'في (داخل)', 'The ball is in the box.', '#e53935'), ('on', 'على', 'The book is on the table.', '#fb8c00'), ('under', 'تحت', 'The cat is under the chair.', '#43a047'), ('behind', 'خلف', 'The bag is behind the door.', '#039be5'), ('next to', 'بجانب', 'The pen is next to the book.', '#8e24aa'), ('in front of', 'أمام', 'The car is in front of the house.', '#00897b')]
    cells = ''.join(f'<div class="cell" style="border-color:{c};background:{c}14;gap:1.5mm"><div style="font-size:30pt;font-weight:700;color:{c};direction:ltr">{w}</div><div style="font-size:16pt;font-weight:700">{a}</div><div style="font-size:12.5pt;direction:ltr;text-align:center">{e}</div></div>' for w, a, e, c in Q)
    return sp, P(sp, 'Prepositions of Place', 'أين الشيء؟', f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);flex:1;min-height:0;gap:3mm">{cells}</div>')

@spec('poster-road-safety')
def _():
    sp = G(title='سلامتي في الطريق', desc='ملصق ست قواعد للسلامة على الطريق للأطفال: العبور من الممر المخصص، والنظر يمينًا ويسارًا، وعدم اللعب في الشارع، وربط حزام الأمان، والإمساك بيد الكبير، واحترام إشارة المرور.', levels=['a5', 'a6', 'g1', 'g2', 'g3', 'g4'], subject='المهارات الحياتية', topic='السلامة', sort=87)
    R = [('١', 'أعبر من ممر المشاة فقط', '#e53935'), ('٢', 'أنظر يمينًا ثم يسارًا ثم يمينًا', '#fb8c00'), ('٣', 'لا ألعب بالكرة في الشارع', '#43a047'), ('٤', 'أربط حزام الأمان في السيارة', '#039be5'), ('٥', 'أمسك بيد الكبير عند العبور', '#8e24aa'), ('٦', 'أقف عند الإشارة الحمراء وأعبر عند الخضراء', '#00897b')]
    rows = ''.join(f'<div style="display:flex;align-items:center;gap:4mm;flex:1;border:.6mm solid {c};background:{c}12;border-radius:5mm;padding:0 5mm"><div style="width:15mm;height:15mm;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:24pt;font-weight:700;flex:none">{n}</div><div style="font-size:19pt;font-weight:700">{t}</div></div>' for n, t, c in R)
    return sp, P(sp, 'سلامتي في الطريق', 'قواعد تحميني كل يوم', f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{rows}</div>')

@spec('poster-water-saving')
def _():
    sp = G(title='نحافظ على الماء', desc='ملصق ست عادات بسيطة لتوفير الماء: إغلاق الصنبور أثناء تنظيف الأسنان، والاستحمام السريع، وإصلاح التسرب، وسقي النباتات بقدر الحاجة، وغسل الخضار في وعاء، وعدم هدر الماء في اللعب.', levels=['a5', 'a6', 'g1', 'g2', 'g3', 'g4'], subject='المهارات الحياتية', topic='البيئة', sort=88)
    R = [('أغلق الصنبور وأنا أنظّف أسناني', '#039be5'), ('أستحمّ بسرعة دون إسراف', '#00897b'), ('أخبر الكبار عند وجود تسرّب', '#8e24aa'), ('أسقي النبات بقدر حاجته', '#43a047'), ('أغسل الخضار في وعاء لا تحت الصنبور المفتوح', '#fb8c00'), ('لا أهدر الماء في اللعب', '#e53935')]
    rows = ''.join(f'<div style="display:flex;align-items:center;gap:4mm;flex:1;border:.6mm solid {c};background:{c}12;border-radius:5mm;padding:0 5mm"><div style="width:15mm;height:15mm;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:{c};flex:none"></div><div style="font-size:18pt;font-weight:700;margin-right:3mm">{t}</div></div>' for t, c in R)
    return sp, P(sp, 'نحافظ على الماء', 'الماء نعمة فلا نُسرف فيه', f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{rows}</div>')
