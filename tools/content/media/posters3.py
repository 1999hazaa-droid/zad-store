# -*- coding: utf-8 -*-
from posters2 import *
L = lambda t: f'<span dir="ltr" class="l">{t}</span>'

@spec('poster-ar-punctuation')
def _():
    sp = SP(title='علامات الترقيم', desc='ملصق علامات الترقيم الثماني الشائعة: النقطة والفاصلة والفاصلة المنقوطة والنقطتان وعلامة الاستفهام وعلامة التعجب وعلامتا التنصيص والقوسان، لكل علامة وظيفتها ومثال.', levels=['g3', 'g4', 'g5', 'g6'], subject='اللغة العربية', topic='علامات الترقيم', sort=50)
    D = [('.', 'النقطة', 'في آخر الجملة التامة', 'ذهبتُ إلى المدرسة.'), ('،', 'الفاصلة', 'تفصل بين الكلمات والجمل القصيرة', 'اشتريتُ تفاحًا، وموزًا، وبرتقالًا.'), ('؛', 'الفاصلة المنقوطة', 'تفصل بين جملتين الثانية سبب الأولى', 'تأخرتُ؛ فقد تعطّلت الحافلة.'), (':', 'النقطتان', 'قبل القول أو التعداد', 'قال المعلم: اجتهدوا.'), ('؟', 'علامة الاستفهام', 'بعد السؤال', 'ما اسمك؟'), ('!', 'علامة التعجب', 'عند الفرح أو الدهشة', 'ما أجمل الحديقة!'), ('« »', 'علامتا التنصيص', 'حول كلام منقول', 'قال الولد: «صباح الخير».'), ('( )', 'القوسان', 'حول توضيح أو تفسير', 'القمر (تابع للأرض) يدور حولها.')]
    cells = ''.join(f'<div class="cell" style="border-color:{PAL[i]};background:{PAL[i]}14;gap:1.5mm"><div style="font-size:40pt;font-weight:700;color:{PAL[i]};line-height:1">{a}</div><div style="font-size:15pt;font-weight:700">{n}</div><div style="font-size:11pt;text-align:center">{w}</div><div style="font-size:12pt;font-weight:700;color:{PAL[i]};text-align:center">{e}</div></div>' for i, (a, n, w, e) in enumerate(D))
    return sp, P(sp, 'علامات الترقيم', 'تجعل الكتابة واضحة', f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(4,1fr);flex:1;min-height:0;gap:3mm">{cells}</div>')

@spec('poster-ar-verbs')
def _():
    sp = SP(title='الفعل: الماضي والمضارع والأمر', desc='ملصق أزمنة الفعل الثلاثة في العربية: الماضي للحدث المنتهي والمضارع للحدث الجاري أو القادم والأمر للطلب، بثلاثة أفعال مثال.', levels=['g3', 'g4', 'g5', 'g6'], subject='اللغة العربية', topic='قواعد اللغة', sort=51)
    T = [('الفعل الماضي', 'حدث انتهى وقته', [('كتبَ', 'كتبَ الولدُ الدرسَ'), ('لعبَ', 'لعبَ الأطفالُ في الساحة'), ('قرأَ', 'قرأتِ البنتُ القصةَ')], '#e53935'), ('الفعل المضارع', 'حدث يحدث الآن أو سيحدث', [('يكتبُ', 'يكتبُ الولدُ الدرسَ'), ('يلعبُ', 'يلعبُ الأطفالُ في الساحة'), ('يقرأُ', 'تقرأُ البنتُ القصةَ')], '#43a047'), ('فعل الأمر', 'طلب حدوث الفعل', [('اكتبْ', 'اكتبْ الدرسَ'), ('العبْ', 'العبْ بهدوءٍ'), ('اقرأْ', 'اقرأِ القصةَ')], '#039be5')]
    cells = ''.join(f'<div class="cell" style="border-color:{c};background:{c}12;gap:2mm;justify-content:flex-start;padding:4mm"><div style="font-size:21pt;font-weight:700;color:{c}">{t}</div><div style="font-size:12.5pt;color:#4b4666;margin-bottom:2mm">{d}</div>' + ''.join(f'<div style="width:100%;background:#fff;border-radius:3mm;padding:2mm 3mm;text-align:center"><div style="font-size:19pt;font-weight:700;color:{c}">{v}</div><div style="font-size:11pt">{s}</div></div>' for v, s in ex) + '</div>' for t, d, ex, c in T)
    return sp, P(sp, 'أقسام الفعل', 'ثلاثة أزمنة للفعل', f'<div class="grid" style="grid-template-columns:repeat(3,1fr);flex:1;min-height:0;gap:3mm">{cells}</div>')

@spec('tbl-ar-pronouns')
def _():
    sp = TS(title='جدول الضمائر المنفصلة', desc='جدول الضمائر العربية المنفصلة للمتكلم والمخاطب والغائب بالمفرد والمثنى والجمع مذكّرًا ومؤنثًا.', levels=['g4', 'g5', 'g6'], subject='اللغة العربية', topic='قواعد اللغة', sort=52)
    R = [('المتكلم', 'أنا', 'أنا', 'نحن', 'نحن'), ('المخاطب', 'أنتَ', 'أنتِ', 'أنتما', 'أنتم · أنتنّ'), ('الغائب', 'هو', 'هي', 'هما', 'هم · هنّ')]
    r = ''.join(f'<tr style="background:{PAL[i]}12"><td style="font-size:18pt;color:{PAL[i]}">{a}</td><td style="font-size:24pt">{b}</td><td style="font-size:24pt">{c}</td><td style="font-size:24pt">{d}</td><td style="font-size:22pt">{e}</td></tr>' for i, (a, b, c, d, e) in enumerate(R))
    body = f'{tcss()}<table class="tb" style="flex:.8"><tr><th></th><th>مفرد مذكر</th><th>مفرد مؤنث</th><th>مثنى</th><th>جمع (مذكر · مؤنث)</th></tr>{r}</table><div style="margin-top:4mm;font-size:13pt;line-height:1.8;text-align:center">الضمير كلمة تنوب عن الاسم: «الطالبُ مجتهدٌ» ← «<b>هو</b> مجتهدٌ»<br>للمتكلم لفظ واحد للمذكر والمؤنث في المفرد (أنا) وفي الجمع (نحن)</div>'
    return sp, P(sp, 'الضمائر المنفصلة', 'أنا · أنتَ · هو …', body)

@spec('tbl-ar-singular-plural')
def _():
    sp = TS(title='جدول المفرد والمثنى والجمع', desc='جدول يعرض أمثلة للاسم في المفرد والمثنى والجمع بأنواعه: جمع المذكر السالم وجمع المؤنث السالم وجمع التكسير.', levels=['g3', 'g4', 'g5', 'g6'], subject='اللغة العربية', topic='قواعد اللغة', sort=53)
    R = [('طالب', 'طالبان', 'طلّاب', 'جمع تكسير'), ('طالبة', 'طالبتان', 'طالبات', 'جمع مؤنث سالم'), ('مهندس', 'مهندسان', 'مهندسون', 'جمع مذكر سالم'), ('كتاب', 'كتابان', 'كتب', 'جمع تكسير'), ('مدرسة', 'مدرستان', 'مدارس', 'جمع تكسير'), ('معلّمة', 'معلّمتان', 'معلّمات', 'جمع مؤنث سالم'), ('مسلم', 'مسلمان', 'مسلمون', 'جمع مذكر سالم'), ('قلم', 'قلمان', 'أقلام', 'جمع تكسير')]
    r = ''.join(f'<tr style="background:{PAL[i % 8]}12"><td style="font-size:20pt;color:{PAL[i % 8]}">{a}</td><td style="font-size:20pt">{b}</td><td style="font-size:20pt">{c}</td><td style="font-size:12pt">{d}</td></tr>' for i, (a, b, c, d) in enumerate(R))
    body = f'{tcss()}<table class="tb" style="flex:1"><tr><th>المفرد (واحد)</th><th>المثنى (اثنان)</th><th>الجمع (أكثر من اثنين)</th><th>نوع الجمع</th></tr>{r}</table><div style="margin-top:3mm;font-size:12.5pt;line-height:1.7;text-align:center">المثنى بزيادة ألف ونون «ان» · جمع التكسير يتغيّر فيه شكل المفرد</div>'
    return sp, P(sp, 'المفرد والمثنى والجمع', 'نغيّر الاسم حسب العدد', body)

@spec('poster-en-irregular-verbs')
def _():
    sp = SP(title='Irregular Verbs (الأفعال الشاذة)', desc='ملصق اثني عشر فعلًا شاذًا في الإنجليزية بصيغها الثلاث: المصدر والماضي البسيط واسم المفعول، مع معنى كل فعل بالعربية.', levels=['g5', 'g6'], subject='اللغة الإنجليزية', topic='Grammar', sort=54)
    V = [('go', 'went', 'gone', 'يذهب'), ('eat', 'ate', 'eaten', 'يأكل'), ('see', 'saw', 'seen', 'يرى'), ('write', 'wrote', 'written', 'يكتب'), ('take', 'took', 'taken', 'يأخذ'), ('come', 'came', 'come', 'يأتي'), ('run', 'ran', 'run', 'يركض'), ('give', 'gave', 'given', 'يعطي'), ('buy', 'bought', 'bought', 'يشتري'), ('make', 'made', 'made', 'يصنع'), ('have', 'had', 'had', 'يملك'), ('do', 'did', 'done', 'يفعل')]
    r = ''.join(f'<tr style="background:{PAL[i % 8]}12"><td style="direction:ltr;font-size:19pt;color:{PAL[i % 8]}">{a}</td><td style="direction:ltr;font-size:19pt">{b}</td><td style="direction:ltr;font-size:19pt">{c}</td><td style="font-size:14pt">{d}</td></tr>' for i, (a, b, c, d) in enumerate(V))
    body = f'{tcss()}<table class="tb" style="flex:1"><tr><th>Base</th><th>Past</th><th>Past participle</th><th>المعنى</th></tr>{r}</table><div style="margin-top:3mm;font-size:12.5pt;text-align:center">الفعل الشاذ لا يأخذ {L('ed')} في الماضي، لذلك نحفظ صيغه</div>'
    return sp, P(sp, 'Irregular Verbs', 'نحفظ الصيغ الثلاث', body)

@spec('poster-en-question-words')
def _():
    sp = SP(title='Question Words (كلمات السؤال)', desc='ملصق كلمات السؤال الست في الإنجليزية: What وWhere وWhen وWho وWhy وHow، مع معنى كل كلمة ومثال بالعربية والإنجليزية.', levels=['g3', 'g4', 'g5', 'g6'], subject='اللغة الإنجليزية', topic='Grammar', sort=55)
    Q = [('What', 'ماذا / ما', 'What is your name?', '#e53935'), ('Where', 'أين', 'Where do you live?', '#fb8c00'), ('When', 'متى', 'When is your birthday?', '#43a047'), ('Who', 'مَن', 'Who is your teacher?', '#039be5'), ('Why', 'لماذا', 'Why are you happy?', '#8e24aa'), ('How', 'كيف', 'How are you?', '#00897b')]
    cells = ''.join(f'<div class="cell" style="border-color:{c};background:{c}14;gap:1.5mm"><div class="l" style="font-size:34pt;font-weight:700;color:{c}">{w}</div><div style="font-size:17pt;font-weight:700">{a}</div><div class="l" style="font-size:13pt;direction:ltr;text-align:center">{e}</div></div>' for w, a, e, c in Q)
    return sp, P(sp, 'Question Words', 'كلمات السؤال', f'<div class="grid" style="grid-template-columns:1fr 1fr;grid-template-rows:repeat(3,1fr);flex:1;min-height:0;gap:3mm">{cells}</div>')

@spec('poster-en-comparatives')
def _():
    sp = SP(title='Comparing Adjectives (المقارنة)', desc='ملصق المقارنة بالصفات في الإنجليزية: الصفة وصيغة المقارنة وصيغة التفضيل مع أمثلة منتظمة وغير منتظمة.', levels=['g5', 'g6'], subject='اللغة الإنجليزية', topic='Grammar', sort=56)
    V = [('tall', 'taller', 'tallest', 'طويل'), ('fast', 'faster', 'fastest', 'سريع'), ('big', 'bigger', 'biggest', 'كبير'), ('happy', 'happier', 'happiest', 'سعيد'), ('beautiful', 'more beautiful', 'most beautiful', 'جميل'), ('good', 'better', 'best', 'جيّد'), ('bad', 'worse', 'worst', 'سيّئ')]
    r = ''.join(f'<tr style="background:{PAL[i % 8]}12"><td style="direction:ltr;font-size:18pt;color:{PAL[i % 8]}">{a}</td><td style="direction:ltr;font-size:17pt">{b}</td><td style="direction:ltr;font-size:17pt">{c}</td><td style="font-size:14pt">{d}</td></tr>' for i, (a, b, c, d) in enumerate(V))
    body = f'{tcss()}<table class="tb" style="flex:1"><tr><th>Adjective</th><th>Comparative (than)</th><th>Superlative (the)</th><th>المعنى</th></tr>{r}</table><div style="margin-top:3mm;font-size:12.5pt;line-height:1.7;text-align:center"><span dir="ltr">She is taller than Sara. She is the tallest in the class.</span><br>الصفات الطويلة تأخذ {L('more')} أو {L('most')} ، وبعض الصفات لها صيغ خاصة</div>'
    return sp, P(sp, 'Comparing Adjectives', 'Big · bigger · biggest', body)

@spec('tbl-en-plurals')
def _():
    sp = TS(title='Plural Nouns (جمع الأسماء)', desc='جدول جمع الأسماء في الإنجليزية: القاعدة العادية وأسماء تنتهي بـ s وx وch وy وf وأمثلة شاذة مثل child وman وtooth وfoot وsheep.', levels=['g3', 'g4', 'g5', 'g6'], subject='اللغة الإنجليزية', topic='Grammar', sort=57)
    R = [(f'عادي: نضيف {L("s")}', 'cat', 'cats'), (f'ينتهي بـ {L("s / x / ch / sh")}: نضيف {L("es")}', 'box', 'boxes'), (f'ينتهي بـ {L("s / x / ch / sh")}: نضيف {L("es")}', 'bus', 'buses'), (f'ينتهي بحرف ساكن + {L("y")}: نحوّل {L("y")} إلى {L("ies")}', 'city', 'cities'), (f'ينتهي بـ {L("f")} أو {L("fe")}: غالبًا {L("ves")}', 'leaf', 'leaves'), ('شاذ', 'child', 'children'), ('شاذ', 'man', 'men'), ('شاذ', 'tooth', 'teeth'), ('شاذ', 'foot', 'feet'), ('شاذ: لا يتغيّر', 'sheep', 'sheep')]
    r = ''.join(f'<tr style="background:{PAL[i % 8]}12"><td style="font-size:12pt;text-align:right;padding-right:3mm">{a}</td><td style="direction:ltr;font-size:20pt;color:{PAL[i % 8]}">{b}</td><td style="direction:ltr;font-size:20pt">{c}</td></tr>' for i, (a, b, c) in enumerate(R))
    body = f'{tcss()}<table class="tb" style="flex:1"><tr><th style="width:52%">القاعدة</th><th>Singular</th><th>Plural</th></tr>{r}</table>'
    return sp, P(sp, 'Plural Nouns', 'كيف نجمع الاسم؟', body)
