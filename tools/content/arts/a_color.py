# -*- coding: utf-8 -*-
from acommon import *
CR = [('أوراق التلوين المطبوعة أو شاشة الاستوديو', 'x_paper'), ('أقلام تلوين خشبية أو شمعية آمنة للأطفال', 'i_pencils')]
SF = lambda t: t
def C(slug, sub, title, icon, levels, skill, goal, tmpl, ids, links, sort):
    A(slug, 'color', sub, title, icon, levels, skill, 'لوّن ' + sub + ' رقميًا في استوديو زاد أو اطبع الصفحات وأنت تلوّن.', goal, 'none' if 'a3' not in levels else 'near', CR,
      [('نختار القالب الذي يعجبنا.', icon), ('نختار لونًا ونلوّن المساحات الكبيرة أولًا.', 'i_palette'), ('نلوّن التفاصيل الصغيرة بلون مختلف.', 'i_pencils'), ('نراجع عملنا ونضيف خلفية بألواننا المفضلة.', '1f3a8')],
      'لوحة ملونة بألوان يختارها الطفل بنفسه؛ لا يوجد لون صحيح واحد.', 'شجّع الطفل على اختيار ألوانه، ولا تصحّح اختياراته. للأعمار الصغيرة استعمل أقلامًا سميكة.', tmpl, dict(type='color', ids=ids), links, sort)
C('co-animals', 'الحيوانات', 'تلوين الحيوانات', '1f981', ['a3','a4','a5','a6','g1','g2'], 'التآزر بين العين واليد والتعرف على الحيوانات', 'أن ألوّن حيوانات وأسمّي ما فيها.', 'fish', ['fish','butterfly','cat','bird','turtle','elephant'], [L('wiki', slug='wk-pets'), L('cards', cat='animals', label='بطاقات الحيوانات')], 1)
C('co-fruits', 'الفواكه', 'تلوين الفواكه', '1f34e', ['a3','a4','a5','a6','g1'], 'التعرف على ألوان الفواكه', 'أن أختار لون كل فاكهة وأتعرف على أسمائها.', 'apple', ['apple','orange','strawberry','watermelon','banana'], [L('wiki', slug='wk-fruit-veg'), L('cards', cat='food', label='بطاقات الطعام')], 2)
C('co-veg', 'الخضروات', 'تلوين الخضروات', '1f955', ['a3','a4','a5','a6','g1'], 'التعرف على ألوان الخضروات', 'أن ألوّن خضروات وأتعرف على أسمائها.', 'carrot', ['carrot','tomato','eggplant'], [L('wiki', slug='wk-fruit-veg')], 3)
C('co-letters', 'الحروف العربية', 'تلوين الحروف العربية', 'i_notebook', ['a4','a5','a6','g1'], 'تعرّف شكل الحرف واليد الدقيقة', 'أن ألوّن حرفًا وأنطق اسمه.', 'l-alif', ['l-alif','l-baa','l-taa','l-thaa','l-jeem','l-haa','l-dal','l-raa','l-seen','l-meem','l-noon'], [L('cards', cat='letters', label='بطاقات الحروف')], 4)
C('co-numbers', 'الأرقام', 'تلوين الأرقام', 'i_numbers', ['a3','a4','a5','a6','g1'], 'تعرّف الأرقام والعدّ', 'أن ألوّن رقمًا وأعدّ بعدد كل رقم.', 'n-1', ['n-1','n-2','n-3','n-4','n-5','n-6','n-7','n-8','n-9'], [L('cards', cat='numbers', label='بطاقات الأرقام')], 5)
C('co-shapes', 'الأشكال الهندسية', 'تلوين الأشكال الهندسية', 'i_blocks', ['a3','a4','a5','a6','g1','g2'], 'تمييز الأشكال الهندسية', 'أن ألوّن شكلًا وأقول اسمه.', 'circle', ['circle','square','triangle','rectangle','oval','star','heart','diamond'], [L('cards', cat='shapes', label='بطاقات الأشكال')], 6)
C('co-transport', 'وسائل النقل', 'تلوين وسائل النقل', '1f697', ['a3','a4','a5','a6','g1','g2'], 'التعرف على وسائل النقل', 'أن ألوّن وسيلة نقل وأذكر أين تسير.', 'car', ['car','boat','airplane','bus','rocket','train'], [L('wiki', slug='wk-transport')], 7)
C('co-nature', 'الطبيعة', 'تلوين الطبيعة', 'x_plant', ['a3','a4','a5','a6','g1','g2'], 'ملاحظة ألوان الطبيعة', 'أن ألوّن مشاهد من الطبيعة بألوانها المناسبة.', 'sun', ['sun','flower','tree','mountains','rainbow','cloud-rain','house'], [L('wiki', slug='wk-weather-seasons')], 8)
C('co-chars', 'الشخصيات الكرتونية الأصلية', 'تلوين شخصيات زاد الأصلية', 'i_palette', ['a3','a4','a5','a6','g1','g2'], 'الخيال واختيار الألوان', 'أن أخترع ألوانًا لشخصية كرتونية أصلية.', 'robot', ['robot','monster','star-kid'], [], 9)
