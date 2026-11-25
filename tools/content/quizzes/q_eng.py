# -*- coding: utf-8 -*-
from qcommon import *
E4 = ['a5', 'a6', 'g1', 'g2']
S = 'الحروف الإنجليزية وأصواتها'
def pl(L, ans, wr): return PIC(ans, wr, S, q='أين صورة تبدأ بحرف %s؟' % L, labels=False)
quiz('english', 'الحروف الإنجليزية وأصواتها', 'u_abc', E4, 'اللغة الإنجليزية', S, 'easy', 'أجد الصورة التي تبدأ بالحرف الإنجليزي.', [
    pl('A', 'تفاحة', ['كلب', 'سمكة']), pl('B', 'موزة', ['قطة', 'أسد']), pl('C', 'قطة', ['كلب', 'موزة']), pl('D', 'كلب', ['سمكة', 'تفاحة']), pl('F', 'سمكة', ['أسد', 'قطة']), pl('L', 'أسد', ['تفاحة', 'كلب']),
], ('language/', 'دروس اللغة الإنجليزية'), tags=['letters'], en=True, minutes=3)
S = 'الأرقام والألوان بالإنجليزية'
def ln(word, ans, wr, why): return LISTEN(word, 'استمع ثم اختر الصورة الصحيحة', ans, wr, why, S, en=True, icons=True)
quiz('english', 'الأرقام والألوان بالإنجليزية', 'i_numbers', ['a4', 'a5', 'a6', 'g1'], 'اللغة الإنجليزية', S, 'easy', 'أسمع الرقم أو اللون وأختار الصورة.', [
    ln('three', 'i_n3', ['i_n5', 'i_n1'], 'three تعني ثلاثة.'), ln('five', 'i_n5', ['i_n2', 'i_n4'], 'five تعني خمسة.'), ln('two', 'i_n2', ['i_n6', 'i_n3'], 'two تعني اثنان.'),
    ln('red', 'rd_circle_red', ['rd_circle_blue', 'rd_circle_green'], 'red تعني أحمر.'), ln('blue', 'rd_circle_blue', ['rd_circle_yellow', 'rd_circle_red'], 'blue تعني أزرق.'), ln('green', 'rd_circle_green', ['rd_circle_red', 'rd_circle_yellow'], 'green تعني أخضر.'),
], ('dict/?t=colors', 'المعجم المصور: الألوان والأرقام'), tags=['numbers', 'letters'], en=True, minutes=3)
S = 'المفردات الإنجليزية'
def lv(ar, wr): return LISTEN(WD[ar]['en'], 'استمع ثم اختر الصورة', ic(ar), [ic(x) for x in wr], '%s تعني %s.' % (WD[ar]['en'], ar), S, en=True, icons=True)
def mn(ar, wr): return MC('ما معنى %s؟' % WD[ar]['en'], ar, wr, '%s تعني %s.' % (WD[ar]['en'], ar), S, img=ic(ar))
quiz('english', 'مفردات إنجليزية', 'i_books', ['a4', 'a5', 'a6', 'g1', 'g2'], 'اللغة الإنجليزية', S, 'easy', 'أتعلم كلمات إنجليزية جديدة.', [
    lv('قطة', ['كلب', 'أسد']), lv('تفاحة', ['موزة', 'عنب']), lv('بيت', ['باب', 'سيارة']),
    MC('ما معنى dog؟', 'كلب', ['قطة', 'سمكة'], 'dog تعني كلب.', S), MC('ما معنى book؟', 'كتاب', ['قلم رصاص', 'حقيبة'], 'book تعني كتاب.', S), MC('ما معنى sun؟', 'شمس', ['قمر', 'نجمة'], 'sun تعني شمس.', S),
], ('dict/play/', 'ألعاب المعجم المصور'), tags=['vocab'], en=True, minutes=3)
S = 'مطابقة الكلمات بالصور'
quiz('english', 'مطابقة الكلمات بالصور', 'i_search', E4, 'اللغة الإنجليزية', S, 'mid', 'أطابق الكلمة الإنجليزية بصورتها وأكونها من حروفها.', [
    MATCH('صل الكلمة بالصورة', [('cat', None, ic('قطة')), ('dog', None, ic('كلب')), ('fish', None, ic('سمكة'))], 'طابقت الكلمات بصورها.', S),
    MATCH('صل الكلمة بالصورة', [('apple', None, ic('تفاحة')), ('banana', None, ic('موزة')), ('grapes', None, ic('عنب'))], 'طابقت الكلمات بصورها.', S),
    MATCH('صل الكلمة بالصورة', [('car', None, ic('سيارة')), ('bus', None, ic('حافلة')), ('train', None, ic('قطار'))], 'طابقت الكلمات بصورها.', S),
    BUILD('cat', S, ic('قطة'), en=True), BUILD('dog', S, ic('كلب'), en=True), BUILD('sun', S, ic('شمس'), en=True),
], ('dict/play/', 'ألعاب المعجم المصور'), tags=['vocab'], en=True, minutes=4)
S = 'الاستماع والفهم'
def sn(say, ar, wr): return LISTEN(say, 'استمع إلى الجملة ثم اختر الصورة', ic(ar), [ic(x) for x in wr], 'الجملة تتحدث عن %s.' % ar, S, en=True, icons=True)
quiz('english', 'أستمع وأختار', 'i_sound', ['a6', 'g1', 'g2'], 'اللغة الإنجليزية', S, 'mid', 'أسمع جملة قصيرة وأختار الصورة.', [
    sn('I see a cat', 'قطة', ['كلب', 'أسد']), sn('I like apples', 'تفاحة', ['موزة', 'عنب']), sn('This is a book', 'كتاب', ['حقيبة', 'مسطرة']),
    sn('I have a red car', 'سيارة', ['حافلة', 'قطار']), sn('The fish is in the water', 'سمكة', ['بطة', 'قطة']), sn('The sun is hot', 'شمس', ['قمر', 'غيمة']),
], ('songs/', 'الأناشيد والاستماع'), tags=['vocab'], en=True, minutes=4)
S = 'الكلمات والجمل'
def so(txt): return ORD('رتب الكلمات لتكوين جملة', [(w,) for w in txt.split()], 'الجملة الصحيحة: %s' % txt, S)
quiz('english', 'جمل إنجليزية', 'i_pencil', ['g1', 'g2', 'g3', 'g4'], 'اللغة الإنجليزية', S, 'mid', 'أرتب الكلمات وأكمل الجمل.', [
    so('I am a boy'), so('She has a red bag'), so('We like to play'),
    FILL('I ___ a student.', 'am', ['is', 'are'], 'نقول I am.', S), FILL('She ___ happy.', 'is', ['am', 'are'], 'نقول She is.', S), FILL('They ___ friends.', 'are', ['is', 'am'], 'نقول They are.', S),
], ('language/', 'دروس اللغة الإنجليزية'), tags=['vocab'], en=True, minutes=4)
S = 'القراءة والفهم بالإنجليزية'
PE = 'Sara has a small cat. The cat is white. It likes milk. Every morning Sara gives the cat milk.'
quiz('english', 'قراءة وفهم بالإنجليزية', 'i_book', ['g2', 'g3', 'g4'], 'اللغة الإنجليزية', S, 'mid', 'أقرأ نصا قصيرا بالإنجليزية وأجيب.', [
    MC('Who has a cat?', 'Sara', ['Mona', 'Ali'], 'النص يقول Sara has a small cat.', S, ps=PE),
    MC('What color is the cat?', 'white', ['black', 'red'], 'The cat is white.', S, ps=PE),
    MC('What does the cat like?', 'milk', ['fish', 'bread'], 'It likes milk.', S, ps=PE),
    MC('When does Sara give milk?', 'every morning', ['at night', 'on Friday'], 'Every morning Sara gives the cat milk.', S, ps=PE),
    TF('The cat is big.', False, 'The cat is small.', S),
    TF('Sara gives the cat milk.', True, 'Sara gives the cat milk every morning.', S),
], ('language/story/', 'قصص اللغة'), tags=['review'], en=True, minutes=5)
