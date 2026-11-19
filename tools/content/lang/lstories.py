# -*- coding: utf-8 -*-
"""قصص لغوية مصورة (kind=story). python3 lstories.py <out.sql> ; يكتب /tmp/lang2_mock.json للاختبار"""
import json, sys, re
import lcommon as c
T1 = c.T1; T2 = c.T2; T3 = c.T3
def ST(slug, lang, title, icon, levels, pages, vocab, qs, events, sort):
    d = dict(pages=[dict(t=p[0], img=p[1]) for p in pages], vocab=vocab, qs=[dict(q=q[0], o=q[1], a=0) for q in qs], events=events)
    c.I(slug, lang, 'story', 'stories', title, icon, levels, 'القراءة وفهم المقروء' if lang == 'ar' else 'قراءة قصة إنجليزية قصيرة وفهمها', d, sort)
# الإجابة الصحيحة هي الخيار الأول دائمًا في المصدر، ثم تُخلط عند العرض ويُحسب رقمها هنا
def fix(it):
    pass
ST('ar-s01', 'ar', 'الأرنب والجزرة', '1f430', T1, [('أرنب صغير اسمه نونو. نونو جائع.', '1f430'), ('رأى نونو جزرة كبيرة تحت الشجرة.', '1f955'), ('أكل نونو الجزرة. شبع نونو وفرح.', '1f604')],
   [['جائع', 'يريد أن يأكل'], ['الشجرة', 'نبات كبير له جذع وأوراق'], ['شبع', 'لم يعد يريد الأكل']],
   [('ماذا رأى نونو؟', ['جزرة كبيرة', 'كرة حمراء', 'كتابا جديدا']), ('أين كانت الجزرة؟', ['تحت الشجرة', 'فوق البيت', 'في الماء']), ('كيف أصبح نونو في النهاية؟', ['فرحا', 'حزينا', 'غاضبا'])],
   ['نونو جائع', 'رأى نونو جزرة', 'أكل نونو الجزرة'], 200)
ST('ar-s02', 'ar', 'البطة والسمكة', '1f986', T1, [('بطة بيضاء تعيش قرب النهر.', '1f986'), ('نزلت البطة إلى الماء وسبحت.', '1f4a7'), ('رأت سمكة صغيرة وقالت: مرحبا.', '1f41f'), ('قالت السمكة: مرحبا يا بطة، هيا نلعب.', '1f604')],
   [['النهر', 'ماء جار بين ضفتين'], ['سبحت', 'تحركت فوق الماء'], ['مرحبا', 'كلمة نقولها عند اللقاء']],
   [('أين تعيش البطة؟', ['قرب النهر', 'في الصحراء', 'فوق الجبل']), ('ماذا فعلت البطة في الماء؟', ['سبحت', 'أكلت خبزا', 'كتبت درسا']), ('من رأت البطة؟', ['سمكة صغيرة', 'قطة كبيرة', 'أسدا'])],
   ['البطة قرب النهر', 'نزلت البطة إلى الماء', 'رأت البطة سمكة'], 201)
ST('ar-s03', 'ar', 'علي والمطر', '1f327', T2, [('استيقظ علي صباحا فرأى المطر ينزل من السماء.', '1f327'), ('أخذ علي مظلته الزرقاء وذهب إلى المدرسة.', '1f392'), ('في الطريق توقف المطر وخرجت الشمس.', '2600'), ('ظهر في السماء قوس قزح جميل بألوان كثيرة، ففرح علي كثيرا.', '1f308')],
   [['مظلة', 'شيء نفتحه فوق رؤوسنا لنحتمي من المطر'], ['توقف', 'لم يعد ينزل'], ['قوس قزح', 'ألوان جميلة تظهر في السماء بعد المطر']],
   [('ماذا أخذ علي إلى المدرسة؟', ['مظلة زرقاء', 'كرة حمراء', 'قبعة صفراء']), ('متى خرجت الشمس؟', ['بعد أن توقف المطر', 'قبل الصباح', 'في الليل']), ('ماذا ظهر في السماء؟', ['قوس قزح', 'طائرة صغيرة', 'ثلج أبيض']), ('لماذا فرح علي؟', ['لأنه رأى قوس قزح جميلا', 'لأنه وجد لعبة', 'لأن المدرسة أغلقت'])],
   ['استيقظ علي ورأى المطر', 'أخذ علي مظلته وذهب', 'توقف المطر', 'ظهر قوس قزح'], 202)
ST('ar-s04', 'ar', 'النحلة العاملة', '1f41d', T2, [('تخرج النحلة كل صباح من خليتها وتطير بين الأزهار.', '1f41d'), ('تجمع النحلة رحيق الأزهار بحذر وتحمله إلى الخلية.', '1f33c'), ('هناك تصنع النحلات العسل اللذيذ مع صديقاتها.', '1f36f'), ('نحن نحب العسل، فلنشكر النحلة العاملة.', '1f60a')],
   [['خلية', 'بيت النحل'], ['رحيق', 'سائل حلو داخل الأزهار'], ['تجمع', 'تضم الأشياء إلى بعضها']],
   [('أين تعيش النحلة؟', ['في الخلية', 'في البحر', 'في الثلج']), ('ماذا تجمع النحلة من الأزهار؟', ['الرحيق', 'الماء', 'الورق']), ('ماذا تصنع النحلات؟', ['العسل', 'الخبز', 'الحليب'])],
   ['خرجت النحلة من الخلية', 'جمعت النحلة الرحيق', 'صنعت النحلات العسل'], 203)
ST('ar-s05', 'ar', 'حديقة المدرسة', '1f331', T3, [('قررت معلمة الصف الثالث أن يزرع التلاميذ حديقة صغيرة في ساحة المدرسة.', '1f331'), ('وزعت المعلمة المهام: حفرت ليلى التراب، ووضع سالم البذور، وسقى حمد الماء كل صباح.', '1f4a7'), ('مرت أسابيع وهم ينتظرون بصبر، وفي يوم من الأيام ظهرت براعم خضراء صغيرة.', '1f33f'), ('كبرت النباتات وتفتحت الأزهار الملونة، فعرف التلاميذ أن التعاون والصبر يصنعان الجمال.', '1f33b')],
   [['وزعت', 'أعطت كل واحد نصيبه'], ['براعم', 'أوراق وأزهار صغيرة تبدأ بالظهور'], ['التعاون', 'أن يعمل الجميع معا'], ['بصبر', 'دون استعجال أو ضجر']],
   [('من وضع البذور؟', ['سالم', 'ليلى', 'حمد']), ('ماذا كان يفعل حمد كل صباح؟', ['يسقي النباتات', 'يحفر التراب', 'يقطف الأزهار']), ('ماذا ظهر بعد أسابيع؟', ['براعم خضراء صغيرة', 'ثمار كبيرة', 'ثلج أبيض']), ('ما الدرس الذي تعلمه التلاميذ؟', ['التعاون والصبر يصنعان الجمال', 'الأقوى يفوز دائما', 'الكسل أفضل من العمل'])],
   ['قررت المعلمة زراعة حديقة', 'وزعت المعلمة المهام', 'ظهرت البراعم الخضراء', 'تفتحت الأزهار الملونة'], 204)
ST('ar-s06', 'ar', 'طائرة يوسف الورقية', '1f9d2', T3, [('صنع يوسف طائرة ورقية حمراء بمساعدة جده، وكتب اسمه على ذيلها.', '1f9d2'), ('في اليوم التالي هبت رياح قوية، فركض يوسف إلى التلة وأطلق طائرته.', '1f4a8'), ('ارتفعت الطائرة عاليا حتى صارت قرب السحب، لكن الخيط انقطع فجأة.', '2601'), ('حزن يوسف قليلا، ثم قال له جده: لا بأس، سنصنع طائرة أجمل. فابتسم يوسف وبدأ العمل من جديد.', '1f60a')],
   [['ذيل', 'الجزء الذي يتدلى من خلف الشيء'], ['هبت', 'تحركت وانتشرت وهذا يقال للرياح'], ['انقطع', 'انفصل وانكسر'], ['فجأة', 'دون أن نتوقع']],
   [('من ساعد يوسف في صنع الطائرة؟', ['جده', 'أخوه', 'معلمه']), ('ما لون الطائرة؟', ['حمراء', 'زرقاء', 'خضراء']), ('ماذا حدث للخيط؟', ['انقطع', 'التف حول الشجرة', 'بقي قويا']), ('ماذا فعل يوسف في النهاية؟', ['بدأ يصنع طائرة جديدة', 'ترك اللعب نهائيا', 'بكى طويلا'])],
   ['صنع يوسف الطائرة', 'أطلق يوسف الطائرة على التلة', 'انقطع الخيط', 'بدأ يوسف عملا جديدا'], 205)
ST('en-s01', 'en', 'Tom and the Cat', '1f431', T1, [('Tom has a small cat. The cat is white.', '1f431'), ('The cat is thirsty. It drinks milk.', '1f95b'), ('Now the cat is sleepy. Good night, cat.', '1f634')],
   [['thirsty', 'عطشان'], ['sleepy', 'نعسان'], ['milk', 'حليب']],
   [('What color is the cat?', ['white', 'black', 'red']), ('What does the cat drink?', ['milk', 'juice', 'tea']), ('How is the cat at the end?', ['sleepy', 'hungry', 'sad'])],
   ['Tom has a cat', 'The cat drinks milk', 'The cat is sleepy'], 200)
ST('en-s02', 'en', 'The Red Ball', '26bd', T1, [('Sam has a red ball. He plays in the park.', '26bd'), ('A dog runs to Sam. The dog wants the ball.', '1f436'), ('Sam and the dog play together. They are happy.', '1f604')],
   [['park', 'حديقة عامة'], ['together', 'معا'], ['happy', 'سعيد']],
   [('What does Sam have?', ['a red ball', 'a blue bag', 'a yellow kite']), ('Who runs to Sam?', ['a dog', 'a cat', 'a bird']), ('How are they at the end?', ['happy', 'angry', 'tired'])],
   ['Sam plays with the ball', 'A dog runs to Sam', 'They play together'], 201)
ST('en-s03', 'en', 'A Rainy Day', '1f327', T2, [('It is a rainy morning. Lina takes her umbrella and walks to school.', '1f327'), ('She sees a little bird under a tree. The bird is wet and cold.', '1f426'), ('Lina opens her umbrella over the bird until the rain stops.', '1f60a'), ('Then the sun comes out and the bird flies away. Lina smiles all day.', '2600')],
   [['umbrella', 'مظلة'], ['wet', 'مبلل'], ['until', 'حتى'], ['smiles', 'تبتسم']],
   [('How is the weather in the morning?', ['rainy', 'sunny', 'snowy']), ('Where is the bird?', ['under a tree', 'in a house', 'on a bus']), ('What does Lina do for the bird?', ['She opens her umbrella over it', 'She gives it a toy', 'She takes it to school']), ('What happens at the end?', ['The sun comes out', 'It starts to snow', 'The bus arrives'])],
   ['Lina walks to school', 'She sees a wet bird', 'She covers the bird with her umbrella', 'The sun comes out'], 202)
ST('en-s04', 'en', 'The Little Garden', '1f331', T2, [('Omar plants a small seed in a pot. He puts the pot near the window.', '1f331'), ('Every day he gives it some water.', '1f4a7'), ('After two weeks, a green plant grows. After a month, a yellow flower opens.', '1f33b'), ('Omar is proud of his flower.', '1f604')],
   [['seed', 'بذرة'], ['grows', 'ينمو'], ['window', 'نافذة'], ['proud', 'فخور']],
   [('Where does Omar put the pot?', ['near the window', 'on the table', 'under the bed']), ('What does he give the seed every day?', ['water', 'milk', 'sand']), ('What color is the flower?', ['yellow', 'purple', 'orange']), ('How does Omar feel?', ['proud', 'scared', 'bored'])],
   ['Omar plants a seed', 'He gives it water every day', 'A green plant grows', 'A yellow flower opens'], 203)
ST('en-s05', 'en', 'The Lost Key', '1f511', T3, [('On Friday afternoon, Huda could not find her house key. She looked in her bag, but it was not there.', '1f511'), ('She thought carefully and remembered that she was playing in the yard after school.', '1f50d'), ('She walked back to the yard and found the key under a small bench.', '1f333'), ('Huda learned an important lesson. Always put important things in the same place.', '1f4a1')],
   [['afternoon', 'بعد الظهر'], ['carefully', 'بانتباه'], ['remembered', 'تذكرت'], ['lesson', 'درس']],
   [('When did Huda lose her key?', ['On Friday afternoon', 'On Monday morning', 'At night']), ('Where did she look first?', ['In her bag', 'Under her bed', 'In the kitchen']), ('Where did she find the key?', ['Under a small bench', 'In the car', 'In a shoe']), ('What did Huda learn?', ['Put important things in the same place', 'Never go to the yard', 'Always lose things'])],
   ['Huda cannot find her key', 'She remembers the yard', 'She finds the key under a bench', 'She learns a lesson'], 204)
ST('en-s06', 'en', 'A Trip to the Sea', '1f3dd', T3, [('Last Saturday, Nasser and his family went to the beach by car. The journey took one hour.', '1f697'), ('Nasser built a big sand castle, and his sister collected colorful shells.', '1f3dd'), ('In the afternoon, they saw a small boat far away on the blue water.', '1f6a2'), ('Before going home, the family collected the rubbish. They wanted to keep the beach clean.', '1f60a')],
   [['beach', 'شاطئ'], ['shells', 'أصداف'], ['rubbish', 'نفايات'], ['journey', 'رحلة']],
   [('How did the family go to the beach?', ['by car', 'by bus', 'by plane']), ('What did Nasser build?', ['a sand castle', 'a boat', 'a house']), ('What did his sister collect?', ['colorful shells', 'small fish', 'old toys']), ('Why did they collect the rubbish?', ['to keep the beach clean', 'to take it home as a gift', 'because it was a game'])],
   ['The family goes to the beach', 'Nasser builds a sand castle', 'They see a small boat', 'They collect the rubbish'], 205)
# lint للقصص
bad = []
RE = {'ar': c.AR_RE, 'en': c.EN_RE}
norm = lambda s: re.sub('[إأآ]', 'ا', s).replace('ة', 'ه').replace('ى', 'ي').lower()
for it in c.ITEMS:
    s, d, R = it['slug'], it['data'], RE[it['lang']]
    if it['icon'] not in c.ICONS: bad.append(s + ' icon')
    if not 3 <= len(d['pages']) <= 4: bad.append(s + ' pages')
    txt = ' '.join(p['t'] for p in d['pages'])
    for p in d['pages']:
        if not R.match(p['t']): bad.append(f'{s} charset «{p["t"][:25]}»')
        if p['img'] not in c.ICONS: bad.append(f'{s} img {p["img"]}')
    for q in d['qs']:
        if not R.match(q['q']) or not all(R.match(o) for o in q['o']): bad.append(s + ' q charset ' + q['q'])
        if len(set(q['o'])) != len(q['o']) or len(q['o']) != 3: bad.append(s + ' opts')
    if len(d['qs']) < 3: bad.append(s + ' qs')
    for w, m in d['vocab']:
        if not R.match(w) or norm(w)[:-1] not in norm(txt): bad.append(f'{s} vocab {w} not in text')
        if len(m) < 2: bad.append(s + ' meaning')
    if len(set(d['events'])) != len(d['events']) or not all(R.match(e) for e in d['events']): bad.append(s + ' events')
    if len(d['events']) != len(d['pages']) and len(d['events']) < 3: bad.append(s + ' events n')
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = 'كُتبت القصة برمجيًا بصياغة أصلية للفئة العمرية، وفُحصت بنيتها آليًا (الإجابات والخيارات والأحرف وورود المفردات في النص). الصور من رسوم المنصة الأصلية وهي رموز توضيحية للمشهد. لم يراجعها معلم لغة متخصص بعد.'
cols = 'slug,lang,kind,cat,title,icon,levels,skill,data,review_note,reviewed,status,sort_order'
rows = []
for a in sorted(c.ITEMS, key=lambda x: (x['lang'], x['sort'])):
    rows.append(f"({q(a['slug'])},{q(a['lang'])},'story','stories',{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{q(a['skill'])},{J(a['data'])},{q(RN)},true,'published',{a['sort']})")
sql = "insert into public.lang_items(" + cols + ") values\n" + ",\n".join(rows) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
json.dump([dict(slug=a['slug'], lang=a['lang'], kind='story', cat='stories', title=a['title'], icon=a['icon'], levels=a['levels'], skill=a['skill'], data=a['data'], sort_order=a['sort']) for a in c.ITEMS], open('/tmp/lang2_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(c.ITEMS), 'stories', len(sql), 'bytes')
