# -*- coding: utf-8 -*-
from common import *
NOTE = 'عرض تقديمي أصلي من إعداد زاد، بلا نسب إلى كتاب أو منهج محدد، ولم يُراجَع من جهة تعليمية رسمية.'
EQ = lambda s: '‭' + s + '‬'
def SP(**k): k.setdefault('kind', 'slides'); k.setdefault('orient', 'slide'); k.setdefault('note', NOTE); return k
def S(sp, title, body): return page(sp, title, '', body)
def title_slide(sp, title, sub, icons, c='#6a2bd9'):
    ic = ''.join(I(x, 34) for x in icons)
    return f'<section class="pg slide" style="background:linear-gradient(135deg,var(--c),var(--c2));color:#fff;align-items:center;justify-content:center;text-align:center;gap:6mm"><div style="display:flex;gap:6mm;background:#fff;border-radius:8mm;padding:4mm 8mm">{ic}</div><div style="font-size:40pt;font-weight:700;line-height:1.3;padding:0 14mm">{title}</div><div style="font-size:18pt;opacity:.95">{sub}</div><div style="position:absolute;bottom:5mm;font-size:10pt;opacity:.85">مكتبة زاد · زاد التعليمية</div></section>'
def goals(sp, items, extra=''):
    li = ''.join(f'<div style="display:flex;align-items:center;gap:5mm;font-size:21pt;line-height:1.5;background:{PAL[i % 8]}12;border-radius:5mm;padding:2.5mm 6mm"><span style="color:{PAL[(i * 3) % 8]};font-size:24pt">✔</span>{t}</div>' for i, t in enumerate(items))
    return S(sp, 'أهداف التعلّم', f'<div style="display:flex;flex-direction:column;justify-content:center;gap:4mm;flex:1">{li}</div>')
def duo(sp, title, icons, bullets, c, h=48):
    ic = ''.join(I(x, h if len(icons) == 1 else h * .62) for x in icons)
    li = ''.join(f'<div style="display:flex;gap:4mm;font-size:21pt;line-height:1.5"><span style="color:{c}">●</span><span>{t}</span></div>' for t in bullets)
    return S(sp, title, f'<div style="display:flex;gap:10mm;align-items:center;flex:1"><div style="flex:none;width:80mm;height:100%;border-radius:8mm;background:{c}14;border:.8mm solid {c};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3mm">{ic}</div><div style="flex:1;display:flex;flex-direction:column;gap:5mm;justify-content:center">{li}</div></div>')
def qs(sp, title, items, big=False):
    li = ''.join(f'<div style="font-size:{19 if len(items) > 3 else 22}pt;line-height:1.5;background:{PAL[i % 8]}12;border-radius:5mm;padding:2mm 6mm;border:.5mm solid {PAL[i % 8]}"><b style="color:{PAL[i % 8]}">{AD(i + 1)}.</b> {t}</div>' for i, t in enumerate(items))
    return S(sp, title, f'<div style="display:flex;flex-direction:column;justify-content:center;gap:3.5mm;flex:1">{li}</div>')
def summary(sp, pts):
    li = ''.join(f'<div style="display:flex;gap:5mm;align-items:center;font-size:20pt;line-height:1.5;border-bottom:.3mm dashed #cfc8ea;padding:2mm 0"><span style="background:var(--c);color:#fff;border-radius:50%;width:10mm;height:10mm;display:grid;place-items:center;font-size:15pt;flex:none">{AD(i + 1)}</span>{t}</div>' for i, t in enumerate(pts))
    return S(sp, 'الخلاصة', f'<div style="display:flex;flex-direction:column;justify-content:center;flex:1">{li}</div>')
def deck(sp, pages): return sp, pages

@spec('sl-five-senses')
def _():
    sp = SP(title='عرض: حواسي الخمس', desc='عرض تقديمي من تسع شرائح عن الحواس الخمس: العضو المسؤول عن كل حاسة وماذا نعرف بها، مع نشاط تطبيقي وخلاصة.', levels=['a6', 'g1', 'g2'], subject='العلوم', topic='جسم الإنسان', sort=1)
    P = [title_slide(sp, 'حواسي الخمس', 'نتعرّف على العالم بأجسامنا', ['x_eye', 'x_ear', 'x_nose', 'x_mouth', 'x_hand']),
         goals(sp, ['أسمّي الحواس الخمس', 'أعرف العضو المسؤول عن كل حاسة', 'أعطي أمثلة على ما أحسّ به']),
         duo(sp, 'البصر', ['x_eye'], ['نبصر بـ <b>العينين</b>', 'نرى الألوان والأشكال والأحجام', 'نرى قوس قزح والنجوم'], '#e53935'),
         duo(sp, 'السمع', ['x_ear'], ['نسمع بـ <b>الأذنين</b>', 'نسمع الأصوات: الصوت العالي والخافت', 'نسمع الموسيقى وصوت المعلّمة'], '#fb8c00'),
         duo(sp, 'الشمّ', ['x_nose'], ['نشمّ بـ <b>الأنف</b>', 'نميّز الروائح الطيبة والكريهة', 'نشمّ رائحة الوردة والخبز'], '#43a047'),
         duo(sp, 'التذوّق', ['x_mouth'], ['نتذوّق بـ <b>اللسان</b>', 'الطعم: حلو · مالح · حامض · مرّ', 'نتذوّق الليمون والعسل'], '#039be5'),
         duo(sp, 'اللمس', ['x_hand'], ['نلمس بـ <b>الجلد</b> وخاصة اليدين', 'نحسّ: ناعم · خشن · حارّ · بارد', 'نلمس الثلج والقطن'], '#8e24aa'),
         qs(sp, 'نشاط: أيّ حاسة تساعدني؟', ['أسمع صوت الجرس ← الأذنان (السمع)', 'أرى قوس قزح ← العينان (البصر)', 'أشمّ وردة ← الأنف (الشمّ)', 'أتذوّق ليمونة ← اللسان (التذوّق)', 'ألمس مكعّب ثلج ← الجلد (اللمس)']),
         summary(sp, ['لدينا خمس حواس: البصر والسمع والشمّ والتذوّق واللمس', 'لكل حاسة عضو خاص بها', 'نحافظ على حواسنا بالنظافة والحذر'])]
    return deck(sp, P)

@spec('sl-plant-parts')
def _():
    sp = SP(title='عرض: أجزاء النبات', desc='عرض تقديمي من تسع شرائح عن أجزاء النبات ووظائفها: الجذر والساق والأوراق والزهرة والبذرة، مع أسئلة مراجعة وخلاصة.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='النبات', sort=2)
    P = [title_slide(sp, 'أجزاء النبات', 'ماذا يفعل كل جزء؟', ['1f331', 'x_plant', '1f33b', 'x_seed']),
         goals(sp, ['أسمّي أجزاء النبات', 'أذكر وظيفة كل جزء', 'أعرف ما تحتاجه البذرة لتنبت']),
         duo(sp, 'الجذر', ['x_soil'], ['يثبّت النبات في التربة', 'يمتصّ الماء والأملاح من التربة'], '#6d4c41'),
         duo(sp, 'الساق', ['1f33f'], ['تحمل النبات وتجعله منتصبًا', 'تنقل الماء والغذاء بين الجذور والأوراق'], '#2e7d32'),
         duo(sp, 'الأوراق', ['x_leaf'], ['تصنع غذاء النبات بوجود الضوء', 'فيها مادة خضراء'], '#43a047'),
         duo(sp, 'الزهرة', ['1f33b'], ['تنتج الثمار والبذور', 'لها ألوان وروائح مختلفة'], '#f9a825'),
         duo(sp, 'البذرة', ['x_seed'], ['ينمو منها نبات جديد', 'تحتاج إلى: ماء · هواء · دفء'], '#8e24aa'),
         qs(sp, 'راجع معي', ['أيّ جزء يمتصّ الماء من التربة؟ (الجذر)', 'أيّ جزء يصنع الغذاء؟ (الأوراق)', 'أيّ جزء يحمل النبات؟ (الساق)', 'ماذا تحتاج البذرة لتنبت؟ (ماء وهواء ودفء)']),
         summary(sp, ['للنبات جذر وساق وأوراق وزهرة', 'لكل جزء وظيفة مهمة', 'البذرة تعطي نباتًا جديدًا'])]
    return deck(sp, P)

@spec('sl-column-addition')
def _():
    sp = SP(title='عرض: الجمع بالحمل', desc='عرض تقديمي من تسع شرائح لتعليم الجمع العمودي مع الحمل: مثالان محلولان وتدريبات ثم إجاباتها المحسوبة برمجيًا.', levels=['g2', 'g3'], subject='الرياضيات', topic='الجمع', sort=3)
    def ex(a, b, c):
        s = a + b; o = a % 10 + b % 10; t = a // 10 + b // 10 + o // 10
        li = [f'الآحاد: {EQ(f"{a % 10} + {b % 10} = {o}")} ← نكتب {o % 10} ونحمل {o // 10}', f'العشرات: {EQ(f"{a // 10} + {b // 10} + {o // 10} = {t}")}', f'الناتج: {EQ(f"{a} + {b} = {s}")}']
        return qs(sp, f'مثال: {EQ(f"{a} + {b}")}', li)
    pr = [(35, 28), (46, 17), (59, 24), (38, 45)]
    P = [title_slide(sp, 'الجمع بالحمل', 'نجمع الآحاد ثم العشرات', ['1f9e0', '270f']),
         goals(sp, ['أرتّب العددين عموديًا', 'أجمع الآحاد ثم العشرات', 'أحمل عند الحاجة']),
         S(sp, 'متى نحمل؟', '<div style="display:flex;flex-direction:column;justify-content:center;gap:6mm;flex:1;font-size:23pt;line-height:1.6;text-align:center"><div>إذا كان مجموع الآحاد <b style="color:#e53935">أكبر من ٩</b></div><div>نكتب رقم الآحاد في الناتج</div><div>ونحمل العشرة الجديدة إلى خانة العشرات</div></div>'),
         ex(47, 36, 0), ex(58, 27, 0),
         qs(sp, 'الآن حاول أنت', [EQ(f'{a} + {b} = ؟') for a, b in pr]),
         qs(sp, 'الإجابات', [EQ(f'{a} + {b} = {a + b}') for a, b in pr]),
         summary(sp, ['نبدأ دائمًا من الآحاد', 'إذا زاد المجموع عن ٩ نحمل إلى العشرات', 'نتحقّق من الناتج بإعادة الجمع'])]
    return deck(sp, P)

@spec('sl-animal-groups')
def _():
    sp = SP(title='عرض: مجموعات الحيوانات', desc='عرض تقديمي من عشر شرائح عن تصنيف الحيوانات إلى ست مجموعات مع صفات وأمثلة لكل مجموعة وأسئلة مراجعة.', levels=['g2', 'g3', 'g4'], subject='العلوم', topic='الكائنات الحية', sort=4)
    G = [('الثدييات', ['1f404', '1f981', '1f40b'], ['جسمها مغطّى بالشعر أو الفرو', 'معظمها تلد صغارها وترضعهم الحليب', 'تتنفس بالرئتين'], '#8e24aa'),
         ('الطيور', ['1f985', '1f427'], ['جسمها مغطّى بالريش', 'لها جناحان ومنقار وتبيض', 'بعضها لا يطير مثل البطريق'], '#039be5'),
         ('الأسماك', ['1f41f'], ['تعيش في الماء', 'تتنفس بالخياشيم', 'جسمها مغطّى بالحراشف وتسبح بالزعانف'], '#00897b'),
         ('الزواحف', ['1f422', '1f40d', '1f40a'], ['جلدها جاف وفيه حراشف', 'تتنفس بالرئتين', 'معظمها يبيض'], '#43a047'),
         ('البرمائيات', ['1f438', 'x_tadpole'], ['تعيش في الماء وعلى اليابسة', 'جلدها رطب أملس', 'تبدأ حياتها في الماء'], '#fb8c00'),
         ('الحشرات', ['1f98b', '1f41d', 'x_ladybug'], ['لها ست أرجل', 'جسمها: رأس وصدر وبطن', 'لها قرنا استشعار'], '#e53935')]
    P = [title_slide(sp, 'مجموعات الحيوانات', 'نصنّف الحيوانات حسب صفاتها', ['1f981', '1f985', '1f41f', '1f422', '1f438', '1f98b']),
         goals(sp, ['أذكر مجموعات الحيوانات الست', 'أعرف صفات كل مجموعة', 'أصنّف حيوانًا إلى مجموعته'])]
    P += [duo(sp, t, ic, b, c, 40) for t, ic, b, c in G]
    P += [qs(sp, 'راجع معي', ['حيوان له ريش ومنقار: (طائر)', 'حيوان يتنفس بالخياشيم: (سمكة)', 'حيوان له ست أرجل: (حشرة)', 'الحوت يرضع صغاره: إذن هو من (الثدييات)']),
          summary(sp, ['نصنّف الحيوانات إلى ست مجموعات', 'لكل مجموعة صفات تميّزها', 'الحوت من الثدييات وليس من الأسماك'])]
    return deck(sp, P)

@spec('sl-noun-verb-particle')
def _():
    sp = SP(title='عرض: الاسم والفعل والحرف', desc='عرض تقديمي من تسع شرائح لتعليم أقسام الكلام في العربية: الاسم والفعل والحرف، مع جملة تحليلية ونشاط تصنيف وخلاصة.', levels=['g2', 'g3'], subject='اللغة العربية', topic='قواعد اللغة', sort=5)
    P = [title_slide(sp, 'الاسم والفعل والحرف', 'أقسام الكلام في لغتنا الجميلة', ['1f4da', '270d']),
         goals(sp, ['أعرّف الاسم والفعل والحرف', 'أعطي أمثلة على كل قسم', 'أصنّف كلمات الجملة']),
         S(sp, 'الاسم', '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:5mm;font-size:21pt;line-height:1.6"><div style="color:#e53935;font-weight:700">كلمة تدلّ على إنسان أو حيوان أو نبات أو جماد أو مكان</div><div>إنسان: <b>خالد</b> · حيوان: <b>أسد</b> · نبات: <b>وردة</b></div><div>جماد: <b>كتاب</b> · مكان: <b>مدرسة</b></div></div>'),
         S(sp, 'الفعل', '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:5mm;font-size:21pt;line-height:1.6"><div style="color:#1e88e5;font-weight:700">كلمة تدلّ على عمل أو حدث في زمن</div><div>الماضي: <b>كتبَ</b> · المضارع: <b>يكتبُ</b> · الأمر: <b>اكتبْ</b></div></div>'),
         S(sp, 'الحرف', '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:5mm;font-size:21pt;line-height:1.6"><div style="color:#43a047;font-weight:700">كلمة لا يكتمل معناها إلا مع غيرها</div><div>أمثلة: <b>في</b> · <b>على</b> · <b>من</b> · <b>إلى</b> · <b>عن</b></div><div>نقول: <b>في</b> البيت · <b>على</b> المكتب</div></div>'),
         S(sp, 'نحلّل جملة', '<div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:6mm;text-align:center"><div style="font-size:30pt;line-height:1.6"><b style="color:#1e88e5">ذهبَ</b> <b style="color:#e53935">عليٌّ</b> <b style="color:#43a047">إلى</b> <b style="color:#e53935">المدرسةِ</b></div><div style="font-size:18pt;line-height:1.7">ذهبَ: فعل · عليٌّ: اسم · إلى: حرف · المدرسةِ: اسم</div></div>'),
         qs(sp, 'نشاط: صنّف الكلمة', ['فاطمة ← اسم', 'تقرأ ← فعل', 'في ← حرف', 'قطّة ← اسم', 'يلعبُ ← فعل', 'على ← حرف']),
         summary(sp, ['الاسم يدلّ على إنسان أو حيوان أو نبات أو جماد أو مكان', 'الفعل يدلّ على عمل في زمن', 'الحرف لا يكتمل معناه وحده'])]
    return deck(sp, P)

@spec('sl-fruits-en')
def _():
    sp = SP(title='Slides: Fruits (الفواكه)', desc='عرض تقديمي بالإنجليزية للمبتدئين من ثماني شرائح لتعلّم ثماني فواكه: الاسم والرسمة ونطق الأحرف الأولى، مع نشاط ما هذه الفاكهة؟', levels=['a5', 'a6', 'g1', 'g2'], subject='اللغة الإنجليزية', topic='Vocabulary', sort=6)
    def two(a, b, c):
        def cell(n, ic, col): return f'<div style="flex:1;border:.8mm solid {col};background:{col}12;border-radius:8mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm">{I(ic, 42)}<div class="l" style="font-size:34pt;font-weight:700;color:{col}">{n}</div></div>'
        return S(sp, 'Fruits', f'<div style="display:flex;gap:10mm;flex:1">{cell(a[0], a[1], "#e53935")}{cell(b[0], b[1], "#43a047")}</div>')
    P = [title_slide(sp, 'Fruits · الفواكه', 'نتعلّم أسماء الفواكه بالإنجليزية', ['1f34e', '1f34c', '1f347', '1f353']),
         goals(sp, ['I know the names of eight fruits', 'أنطق اسم الفاكهة بالإنجليزية', 'أطابق الاسم مع الرسمة']),
         two(('Apple', '1f34e'), ('Banana', '1f34c'), 1), two(('Orange', '1f34a'), ('Grapes', '1f347'), 1), two(('Strawberry', '1f353'), ('Lemon', '1f34b'), 1), two(('Watermelon', '1f349'), ('Cherries', '1f352'), 1),
         S(sp, 'What is this?', '<div style="display:flex;gap:6mm;flex:1;align-items:center">' + ''.join(f'<div style="flex:1;text-align:center;border:.6mm solid {PAL[i]};border-radius:6mm;padding:4mm;background:{PAL[i]}10">{I(ic, 26)}<div class="l" style="font-size:19pt;font-weight:700;margin-top:2mm">{o}</div></div>' for i, (ic, o) in enumerate([('1f34a', 'Orange? Lemon?'), ('1f353', 'Strawberry? Apple?'), ('1f349', 'Watermelon? Banana?'), ('1f352', 'Cherries? Grapes?')])) + '</div>'),
         summary(sp, ['Apple · Banana · Orange · Grapes', 'Strawberry · Lemon · Watermelon · Cherries', 'نحبّ الفواكه لأنها صحية'])]
    return deck(sp, P)

@spec('sl-story-tortoise')
def _():
    sp = SP(title='قصة: الأرنب والسلحفاة', desc='قصة تعليمية مصوّرة في تسع شرائح عن المثابرة والتواضع، بصياغة أصلية من زاد لحكاية شعبية قديمة، مع أسئلة للحوار.', levels=['a5', 'a6', 'g1', 'g2', 'g3'], subject='المهارات الحياتية', topic='القيم والسلوك', sort=7, note='حكاية شعبية قديمة معروفة، والنص بصياغة أصلية من زاد. ' + NOTE)
    def st(t, ics, n):
        return S(sp, f'القصة · {AD(n)}', f'<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8mm;flex:1"><div style="display:flex;gap:10mm">{"".join(I(x, 46) for x in ics)}</div><div style="font-size:23pt;line-height:1.7;text-align:center;padding:0 10mm">{t}</div></div>')
    P = [title_slide(sp, 'الأرنب والسلحفاة', 'قصة عن المثابرة والتواضع', ['1f430', '1f422']),
         st('في غابة خضراء عاش أرنب سريع يحبّ أن يتفاخر بسرعته.', ['1f430'], 1),
         st('وبجانبه سلحفاة هادئة تمشي ببطء وتبتسم لكل من يمرّ.', ['1f422'], 2),
         st('ضحك الأرنب وقال: لا أحد يسبقني! فاقترحت السلحفاة أن يتسابقا.', ['1f430', '1f422'], 3),
         st('انطلق الأرنب كالسهم، أمّا السلحفاة فمشت خطوة بعد خطوة بلا توقّف.', ['1f430', '1f422'], 4),
         st('رأى الأرنب أنه تقدّم كثيرًا، فاستلقى تحت شجرة ونام.', ['1f430', '1f333'], 5),
         st('واصلت السلحفاة طريقها ولم تتوقّف حتى وصلت إلى خطّ النهاية.', ['1f422', '1f3c6'], 6),
         st('استيقظ الأرنب فرأى السلحفاة قد فازت، فهنّأها وتعلّم ألّا يستهين بأحد.', ['1f430', '1f60a'], 7),
         qs(sp, 'نتحاور', ['لماذا فازت السلحفاة؟ (لأنها استمرّت ولم تتوقف)', 'ماذا تعلّم الأرنب؟ (ألّا يستهين بغيره)', 'ماذا تفعل أنت حين تشعر بالتعب في عمل مهم؟'])]
    return deck(sp, P)

@spec('sl-review-add-sub')
def _():
    sp = SP(title='عرض مراجعة: الجمع والطرح', desc='عرض مراجعة من ست شرائح لتدريبات الجمع والطرح حتى ٢٠ مع شريحة إجابات محسوبة برمجيًا.', levels=['g1', 'g2'], subject='الرياضيات', topic='الجمع والطرح', sort=8)
    A = [(8, 5, '+'), (14, 6, '−'), (9, 7, '+'), (20, 12, '−')]; B = [(6, 6, '+'), (17, 9, '−'), (11, 8, '+'), (15, 7, '−')]
    f = lambda a, b, o: (a + b) if o == '+' else (a - b)
    qq = lambda L: [EQ(f'{a} {o} {b} = ؟') for a, b, o in L]
    P = [title_slide(sp, 'مراجعة الجمع والطرح', 'هيّا نحلّ ونتحقّق', ['2b50', '1f9e0']),
         goals(sp, ['أجمع وأطرح حتى ٢٠', 'أستخدم خط الأعداد أو الأصابع', 'أتحقّق من إجابتي']),
         qs(sp, 'التدريب الأول', qq(A)), qs(sp, 'التدريب الثاني', qq(B)),
         qs(sp, 'الإجابات', [EQ(f'{a} {o} {b} = {f(a, b, o)}') for a, b, o in A + B]),
         summary(sp, ['الجمع يزيد والطرح ينقص', 'نتحقّق: الطرح عكس الجمع', 'التدريب يجعلنا أسرع'])]
    return deck(sp, P)

@spec('sl-count-1-10')
def _():
    sp = SP(title='عرض: نعدّ من ١ إلى ١٠', desc='عرض تقديمي لأصغر الأطفال من سبع شرائح للعدّ من واحد إلى عشرة بالرسومات، كل شريحة بها رقمان وعدد الأشياء المقابلة.', levels=['a3', 'a4', 'a5', 'a6'], subject='الرياضيات', topic='العدّ', sort=9)
    W = ['واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة', 'عشرة']; IC = ['1f34e', '1f438', '1f41f', '1f347', '1f42d', '1f34c', '1f431', '1f353', '1f41d', '1f34a']
    def two(a):
        def cell(n):
            c = PAL[n % 8]
            return f'<div style="flex:1;border:.8mm solid {c};background:{c}10;border-radius:8mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2mm"><div style="font-size:48pt;font-weight:700;color:{c};line-height:1">{n} <span style="font-size:34pt">{AD(n)}</span></div><div style="font-size:20pt;font-weight:700">{W[n - 1]}</div><div style="display:flex;flex-wrap:wrap;gap:1.5mm;justify-content:center;padding:0 5mm">{"".join(I(IC[n - 1], 11) for _ in range(n))}</div></div>'
        return S(sp, 'نعدّ معًا', f'<div style="display:flex;gap:8mm;flex:1;direction:ltr">{cell(a)}{cell(a + 1)}</div>')
    P = [title_slide(sp, 'نعدّ من ١ إلى ١٠', 'نعدّ الأشياء معًا', ['1f34e', '1f438', '1f41f', '1f347'])] + [two(a) for a in (1, 3, 5, 7, 9)] + [summary(sp, ['عددنا من ١ إلى ١٠', 'كل رقم له اسم وعدد', 'نعدّ الأشياء بإصبعنا ونحن نقول الأرقام'])]
    return deck(sp, P)
