# -*- coding: utf-8 -*-
from pcommon import *
A = 'اللغة العربية'; EN_ = 'اللغة الإنجليزية'; RL = ('language/', 'اللغة والبطاقات'); RS = ('stories/', 'القصص التعليمية')
P('arabic', 'لوحة الحروف', 'u_abc', ['a4', 'a5', 'a6', 'g1'], A, 'التعرف على الحروف الهجائية', 'easy', 25, 'نصنع لوحة نكتب فيها حروفا ونرسم بجانب كل حرف صورة.', 'أن أعرف الحروف وأربطها بكلمات.',
  ['ورقة كبيرة', 'أقلام تلوين', 'قلم رصاص'],
  [('نكتب ستة حروف كبيرة في مربعات: أ ب ت ث ج ح.', 'u_abc', 'ساعد الطفل على الكتابة بخط كبير.'), ('نختار لكل حرف كلمة تبدأ به: أرنب بطة تفاحة.', '1f430'), ('نرسم بجانب كل حرف صورة كلمته.', '1f986'), ('نلون اللوحة ونقرأ الحروف من اليمين إلى اليسار.', '1f4d6'), ('نعلق اللوحة في مكان نراه كل يوم.', 'i_board')],
  'نستعمل أقلاما وأوراقا فقط.', 'يتعرف الطفل على الحروف ويربطها بصور وكلمات.', ['معرفة الحروف', 'ربط الحرف بالكلمة', 'القراءة من اليمين'],
  [('بأي حرف تبدأ كلمة أرنب؟', 'أ', ['ب', 'ت'], 'أرنب تبدأ بحرف الألف.'), ('من أي جهة نقرأ العربية؟', 'من اليمين', ['من اليسار', 'من الأسفل'], 'نقرأ العربية من اليمين إلى اليسار.')], True, RL)
P('arabic', 'بطاقات الحروف والصور', 'u_letters', ['a4', 'a5', 'a6', 'g1'], A, 'مطابقة الحرف بالصورة', 'easy', 20, 'نصنع بطاقات حروف وبطاقات صور ثم نطابقها.', 'أن أطابق كل حرف بصورة تبدأ به.',
  ['ست بطاقات من الورق المقوى', 'قلم', 'أقلام تلوين'],
  [('نكتب على ثلاث بطاقات الحروف ب ج د.', 'u_letters', 'يقص الكبير الورق ويكتب الطفل ما يستطيع.'), ('نرسم على ثلاث بطاقات: بطة وجمل ودب.', '1f986'), ('نخلط البطاقات ثم نطابق كل حرف بصورته.', 'i_puzzle'), ('نقول الكلمة بصوت عال ونصفق عند كل مطابقة.', '1f44f')],
  'القص يقوم به الكبير بمقص مناسب.', 'يربط الطفل الحرف بصوته وبكلمة تبدأ به.', ['المطابقة', 'أصوات الحروف', 'المفردات'],
  [('أي صورة تناسب حرف ب؟', 'بطة', ['جمل', 'دب'], 'كلمة بطة تبدأ بحرف الباء.'), ('أي صورة تناسب حرف ج؟', 'جمل', ['بطة', 'دب'], 'كلمة جمل تبدأ بحرف الجيم.')], True, RL)
P('arabic', 'قاموسي المصور الصغير', 'i_book', ['g1', 'g2', 'g3'], A, 'تنظيم المفردات الجديدة', 'mid', 30, 'نصنع دفترا صغيرا نكتب فيه كلمات ونرسم معانيها.', 'أن أجمع كلمات جديدة في قاموس خاص بي.',
  ['ورقتان تطويان على شكل دفتر', 'قلم', 'أقلام تلوين'],
  [('نطوي الورق ونصنع غلافا ونكتب عليه قاموسي.', 'i_notebook', 'ساعده في كتابة الغلاف وترتيب الصفحات.'), ('نختار كلمة جديدة من قصة قرأناها ونكتبها في أعلى الصفحة.', '1f4d6'), ('نرسم صورة تشرح معناها ونكتب جملة تحتوي الكلمة.', '270f'), ('نكرر مع كلمة في كل صفحة ثم نرتبها بحسب الحروف.', 'u_abc'), ('نقرأ قاموسنا لشخص من الأسرة.', '1f5e3')],
  'نستعمل أقلاما وأوراقا فقط.', 'يتعلم الطفل كلمات جديدة ويستعملها في جمل، ويتدرب على الترتيب الهجائي.', ['المفردات', 'كتابة الجمل', 'الترتيب الهجائي'],
  [('ماذا نكتب تحت الكلمة؟', 'جملة تحتويها', ['رقما فقط', 'لا شيء'], 'الجملة تثبت معنى الكلمة.'), ('لماذا نرسم صورة؟', 'لتوضح المعنى', ['لنملأ الورقة فقط', 'لنخفي الكلمة'], 'الصورة تساعدنا على تذكر المعنى.')], False, RL)
P('arabic', 'نحكي قصة بالصور', 'i_books', ['a5', 'a6', 'g1', 'g2', 'g3', 'g4'], A, 'سرد قصة وترتيب أحداثها', 'mid', 25, 'نرسم أربع صور لأحداث قصة قصيرة ثم نحكيها بأصواتنا.', 'أن أرتب أحداث قصة وأرويها.',
  ['أربع ورقات صغيرة', 'أقلام تلوين', 'قصة قصيرة نختارها'],
  [('نختار قصة قصيرة نحبها أو نبتكر قصة عن طفل وقطة.', 'i_book', 'يمكن أن يحكي الطفل لك القصة أولا.'), ('نرسم أربع صور: البداية ثم المشكلة ثم الحل ثم النهاية.', '1f3a8'), ('نرقم الصور من ١ إلى ٤ ونرتبها.', 'i_n1'), ('نحكي القصة بالترتيب ونستعمل كلمات مثل أولا ثم وأخيرا.', '1f5e3'), ('نقدم القصة لشخص من الأسرة.', '1f44f')],
  'نستعمل أقلاما وأوراقا فقط.', 'يرتب الطفل أحداث القصة ويعبر عنها شفهيا بجمل مترابطة.', ['ترتيب الأحداث', 'التعبير الشفهي', 'الإبداع'],
  [('ماذا نرسم في الصورة الأولى؟', 'بداية القصة', ['النهاية', 'اسم الكاتب'], 'نبدأ برسم بداية القصة.'), ('ماذا نقول في نهاية الحكاية؟', 'وأخيرا', ['أولا', 'ثم'], 'كلمة أخيرا تدل على النهاية.')], False, RS)
P('arabic', 'لوحة الكلمات الجديدة', 'i_board', ['g1', 'g2', 'g3', 'g4'], A, 'تعلم المفردات واستعمالها', 'easy', 20, 'نعلق لوحة نضيف إليها كلمة جديدة كل يوم.', 'أن أتعلم كلمة جديدة كل يوم وأستعملها.',
  ['ورقة كبيرة', 'قصاصات صغيرة', 'قلم', 'قطعة لاصقة آمنة'],
  [('نعلق الورقة الكبيرة في غرفة الجلوس ونكتب عليها كلماتنا.', 'i_board'), ('نكتب كلمة جديدة على قصاصة ونكتب معناها.', '270f', 'اختر كلمات من قصة أو درس أو حديث اليوم.'), ('نلصق القصاصة على اللوحة ونقرأ الكلمة بصوت عال.', '1f5e3'), ('نستعمل الكلمة في جملة خلال اليوم.', '1f4ac'.replace('1f4ac', '1f604')), ('نراجع الكلمات أسبوعيا ونختار الأحب إلينا.', 'i_star')],
  'نستعمل أوراقا خفيفة ونعلقها بمساعدة الكبير.', 'يزيد الطفل مفرداته ويستعملها في كلامه وكتابته.', ['المفردات', 'استعمال الكلمة', 'المراجعة'],
  [('ماذا نفعل بعد كتابة الكلمة؟', 'نقرأها ونستعملها', ['نخفيها', 'نمزقها'], 'الاستعمال يثبت الكلمة.'), ('كم كلمة نضيف كل يوم؟', 'كلمة واحدة', ['عشر كلمات', 'لا شيء'], 'كلمة واحدة كل يوم تكفي.')], False, RL)
P('english', 'English letter cards', 'u_letters', ['a5', 'a6', 'g1', 'g2'], EN_, 'Matching letters with pictures', 'easy', 20, 'We make cards with a letter on one side and a picture on the other.', 'To match English letters with words.',
  ['Six small cards', 'A pencil', 'Colored pencils'],
  [('Write A, B and C on three cards.', 'u_abc', 'The adult cuts the cards and the child writes with help.'), ('Draw an apple, a ball and a cat on three other cards.', '1f34e'), ('Match each letter with its picture.', 'i_puzzle'), ('Say the word aloud: A for apple.', '1f5e3')],
  'Use paper and pencils only.', 'The child links letters with their sounds and with simple words.', ['Letter recognition', 'Letter sounds', 'Simple words'],
  [('What does apple start with?', 'A', ['B', 'C'], 'Apple starts with the letter A.'), ('What does cat start with?', 'C', ['A', 'B'], 'Cat starts with the letter C.')], True, RL)
P('english', 'My picture dictionary', 'i_book', ['a6', 'g1', 'g2', 'g3', 'g4'], EN_, 'Learning new words with pictures', 'mid', 30, 'We make a small book with a word and a picture on every page.', 'To collect new English words and use them.',
  ['Two folded papers', 'A pencil', 'Colored pencils'],
  [('Fold the papers and write My dictionary on the cover.', 'i_notebook', 'Help with the cover and the page order.'), ('Choose a word like dog and write it at the top of a page.', '1f436'), ('Draw the picture and write a short sentence: This is a dog.', '270f'), ('Add a new word on every page and read the book aloud.', '1f4d6')],
  'Use paper and pencils only.', 'The child learns words, links them with pictures and writes a simple sentence.', ['New vocabulary', 'Writing simple sentences', 'Reading aloud'],
  [('What do we write under the picture?', 'A short sentence', ['A phone number', 'Nothing'], 'A sentence shows how the word is used.'), ('Why do we draw a picture?', 'To remember the meaning', ['To hide the word', 'To waste paper'], 'Pictures help us remember.')], False, RL)
P('english', 'Colors and numbers poster', 'i_palette', ['a4', 'a5', 'a6'], EN_, 'Learning colors and numbers', 'easy', 20, 'We make a poster of colors and numbers from one to five.', 'To say colors and numbers in English.',
  ['A big paper', 'Colored pencils', 'A pencil'],
  [('Write red, blue and green in three boxes.', 'rd_square_red', 'Say each color with the child.'), ('Color each box with its color.', '1f3a8'), ('Write the numbers one to five and draw dots next to each.', 'i_n1'), ('Point and say the words aloud: one, two, three.', '1f446')],
  'Use paper and pencils only.', 'The child says colors and counts to five in English.', ['Colors in English', 'Numbers in English', 'Speaking'],
  [('What color is the apple?', 'red', ['blue', 'green'], 'The apple here is red.'), ('How many dots next to three?', 'three', ['one', 'five'], 'Three dots means number three.')], True, RL)
