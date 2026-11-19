# -*- coding: utf-8 -*-
from posters2 import *
from slides import title_slide, goals, summary, S, SP as SSP
NT = 'محتوى وتصميم أصليان من إعداد زاد للصغار، بصور كبيرة وكلمات قليلة، يُستعمل بمرافقة الكبار. لم يُراجَع من جهة تعليمية أو طبية رسمية.'
def T(sp_extra, **k):
    d = dict(note=NT); d.update(k); return SP(**d)
def cellgrid(items, cols, rows, icsz, fs, tail=None):
    cs = ''
    for i, it in enumerate(items):
        c = PAL[i % 8]; ic, w = it[0], it[1]; sub = it[2] if len(it) > 2 else ''
        cs += f'<div class="cell" style="border-color:{c};background:{c}14;gap:2mm;border-width:1mm">{I(ic, icsz)}<div style="font-size:{fs}pt;font-weight:700;color:{c};line-height:1.1">{w}</div>' + (f'<div style="font-size:{fs * .58:.0f}pt;color:#4b4666;font-weight:700">{sub}</div>' if sub else '') + '</div>'
    return f'<div class="grid" style="grid-template-columns:repeat({cols},1fr);grid-template-rows:repeat({rows},1fr);flex:1;min-height:0;gap:4mm">{cs}</div>'

@spec('poster-first-words')
def _():
    sp = T(0, kind='poster', orient='portrait', title='كلماتي الأولى', desc='ملصق بست كلمات أولى للطفل الصغير بصور كبيرة: أنا والعائلة والماء والحليب والنوم والدبدوب.', levels=['a2', 'a3'], subject='اللغة العربية', topic='الكلمات الأولى', sort=60)
    return sp, P(sp, 'كلماتي الأولى', 'نشير إلى الصورة ونقول الكلمة', cellgrid([('1f9d2', 'أنا'), ('1f468-1f469-1f467', 'عائلتي'), ('1f4a7', 'ماء'), ('1f37c', 'حليب'), ('x_sleep', 'نوم'), ('1f9f8', 'دبدوب')], 2, 3, 38, 30))

@spec('poster-animal-sounds')
def _():
    sp = T(0, kind='poster', orient='portrait', title='أصوات الحيوانات', desc='ملصق ستة حيوانات مألوفة وأصواتها بالعربية: القطة والكلب والبقرة والخروف والبطة والديك، لتشجيع الطفل على التقليد والنطق.', levels=['a2', 'a3', 'a4'], subject='اللغة العربية', topic='الحيوانات', sort=61)
    return sp, P(sp, 'أصوات الحيوانات', 'ماذا يقول الحيوان؟', cellgrid([('1f431', 'قطة', 'مياو'), ('1f436', 'كلب', 'هو هو'), ('1f404', 'بقرة', 'موو'), ('1f411', 'خروف', 'ماع'), ('1f986', 'بطة', 'واك واك'), ('1f413', 'ديك', 'كو كو كو')], 2, 3, 36, 26))

@spec('poster-body-baby')
def _():
    sp = T(0, kind='poster', orient='portrait', title='أين أجزاء جسمي؟', desc='ملصق ستة أجزاء من الجسم بصور كبيرة للصغار: العين والأذن والأنف والفم واليد والقدم، مع جملة سؤال يلعب بها الطفل.', levels=['a2', 'a3', 'a4'], subject='العلوم', topic='جسم الإنسان', sort=62)
    return sp, P(sp, 'أين أجزاء جسمي؟', 'نلمس الجزء ونقول اسمه', cellgrid([('x_eye', 'عين'), ('x_ear', 'أذن'), ('x_nose', 'أنف'), ('x_mouth', 'فم'), ('x_hand', 'يد'), ('x_foot', 'قدم')], 2, 3, 34, 30))

@spec('poster-fruits-baby')
def _():
    sp = T(0, kind='poster', orient='portrait', title='فواكهي المفضلة', desc='ملصق ست فواكه مألوفة بصور كبيرة وأسماء واضحة للصغار: التفاحة والموزة والبرتقالة والعنب والفراولة والبطيخ.', levels=['a2', 'a3', 'a4'], subject='المهارات الحياتية', topic='الطعام الصحي', sort=63)
    return sp, P(sp, 'فواكهي المفضلة', 'نسمّي الفاكهة ونتذوّقها', cellgrid([('1f34e', 'تفاحة'), ('1f34c', 'موزة'), ('1f34a', 'برتقالة'), ('1f347', 'عنب'), ('1f353', 'فراولة'), ('1f349', 'بطيخ')], 2, 3, 36, 28))

@spec('poster-feelings-baby')
def _():
    sp = T(0, kind='poster', orient='portrait', title='مشاعري', desc='ملصق ست مشاعر بوجوه كبيرة تساعد الطفل الصغير على التعبير: فرحان وحزين وغاضب وخائف ونعسان ويفكّر.', levels=['a3', 'a4', 'a5'], subject='المهارات الحياتية', topic='المشاعر', sort=64)
    return sp, P(sp, 'مشاعري', 'كيف أشعر اليوم؟', cellgrid([('1f604', 'فرحان'), ('1f622', 'حزين'), ('1f620', 'غاضب'), ('1f628', 'خائف'), ('1f634', 'نعسان'), ('1f914', 'يفكّر')], 2, 3, 36, 28))

@spec('cc-vehicles-baby')
def _():
    sp = T(0, kind='concept_cards', orient='portrait', title='بطاقات وسائل النقل', desc='ست بطاقات كبيرة لوسائل النقل المألوفة: السيارة والحافلة والقطار والمروحية والدراجة والسفينة، تُقصّ وتُستعمل للتسمية والمطابقة.', levels=['a2', 'a3', 'a4'], subject='العلوم', topic='وسائل النقل', sort=65)
    return sp, P(sp, 'وسائل النقل', 'نسمّيها ونقلّد أصواتها', cellgrid([('1f697', 'سيارة'), ('1f68c', 'حافلة'), ('1f682', 'قطار'), ('1f681', 'مروحية'), ('1f6b2', 'دراجة'), ('1f6a2', 'سفينة')], 2, 3, 36, 28))

@spec('poster-count-1-3')
def _():
    sp = T(0, kind='poster', orient='portrait', title='نعدّ من ١ إلى ٣', desc='ملصق للعدّ من واحد إلى ثلاثة لأصغر الأطفال: رقم كبير وكلمته وعدد مطابق من الرسومات في كل صف.', levels=['a2', 'a3', 'a4'], subject='الرياضيات', topic='العدّ', sort=66)
    rows = ''
    for i, (n, w, ic) in enumerate([(1, 'واحد', '1f34e'), (2, 'اثنان', '1f41f'), (3, 'ثلاثة', '1f986')]):
        c = PAL[i * 3 % 8]
        rows += f'<div style="flex:1;display:flex;align-items:center;gap:6mm;border:1mm solid {c};background:{c}12;border-radius:8mm;padding:0 8mm"><div style="width:44mm;text-align:center"><div style="font-size:84pt;font-weight:700;color:{c};line-height:1">{AD(n)}</div><div style="font-size:24pt;font-weight:700">{w}</div></div><div style="flex:1;display:flex;gap:4mm;justify-content:center;align-items:center">{"".join(I(ic, 38) for _ in range(n))}</div></div>'
    return sp, P(sp, 'نعدّ من ١ إلى ٣', 'نعدّ بإصبعنا', f'<div style="display:flex;flex-direction:column;gap:5mm;flex:1;min-height:0">{rows}</div>')

@spec('poster-shapes-baby')
def _():
    sp = T(0, kind='poster', orient='portrait', title='أشكالي الأولى', desc='ملصق ثلاثة أشكال كبيرة للصغار: الدائرة والمربع والمثلث، بلون واحد لكل شكل ومثال من الحياة.', levels=['a2', 'a3', 'a4'], subject='الرياضيات', topic='الأشكال', sort=67)
    sh = [('دائرة', 'مثل الكرة', '#e53935', 'border-radius:50%'), ('مربع', 'مثل النافذة', '#039be5', 'border-radius:4mm'), ('مثلث', 'مثل قطعة البيتزا', '#43a047', 'clip-path:polygon(50% 0,100% 100%,0 100%)')]
    rows = ''.join(f'<div style="flex:1;display:flex;align-items:center;gap:8mm;border:1mm solid {c};background:{c}12;border-radius:8mm;padding:0 10mm"><div style="width:56mm;height:56mm;background:{c};{st};flex:none"></div><div><div style="font-size:42pt;font-weight:700;color:{c}">{n}</div><div style="font-size:20pt;font-weight:700">{d}</div></div></div>' for n, d, c, st in sh)
    return sp, P(sp, 'أشكالي الأولى', 'ثلاثة أشكال', f'<div style="display:flex;flex-direction:column;gap:5mm;flex:1;min-height:0">{rows}</div>')

@spec('bd-routine-baby')
def _():
    sp = T(0, kind='board', orient='landscape', title='لوحة روتيني اليومي', desc='لوحة للحائط بأربع صور كبيرة لعادات الطفل اليومية: ننام وناكل ونغسل أيدينا ونلعب، تُستعمل لترتيب اليوم مع الكبار.', levels=['a2', 'a3', 'a4', 'a5'], subject='المهارات الحياتية', topic='الروتين اليومي', sort=68)
    it = [('x_sleep', 'ننام'), ('1f37d', 'نأكل'), ('1f9fc', 'نغسل أيدينا'), ('1f9f8', 'نلعب')]
    cs = ''.join(f'<div class="cell" style="border-color:{PAL[i * 2 % 8]};background:{PAL[i * 2 % 8]}14;border-width:1mm;gap:3mm">{I(ic, 52)}<div style="font-size:30pt;font-weight:700;color:{PAL[i * 2 % 8]}">{w}</div></div>' for i, (ic, w) in enumerate(it))
    return sp, P(sp, 'روتيني اليومي', 'أرتّب يومي مع ماما وبابا', f'<div class="grid" style="grid-template-columns:repeat(4,1fr);flex:1;min-height:0;gap:5mm">{cs}</div>')

@spec('sl-animal-sounds')
def _():
    sp = SSP(title='عرض: أصوات الحيوانات', desc='عرض تقديمي قصير من ثماني شرائح لأصغر الأطفال: كل شريحة حيوان بصورة كبيرة وصوته، للمشاهدة مع الكبار والتقليد.', levels=['a2', 'a3', 'a4'], subject='اللغة العربية', topic='الحيوانات', sort=69, note=NT)
    A = [('1f431', 'قطة', 'مياو'), ('1f436', 'كلب', 'هو هو'), ('1f404', 'بقرة', 'موو'), ('1f411', 'خروف', 'ماع'), ('1f986', 'بطة', 'واك واك'), ('1f413', 'ديك', 'كو كو كو')]
    def one(i, ic, n, snd):
        c = PAL[i % 8]
        return S(sp, n, f'<div style="display:flex;align-items:center;justify-content:center;gap:16mm;flex:1"><div style="width:90mm;height:90mm;border-radius:50%;background:{c}18;border:1.2mm solid {c};display:grid;place-items:center">{I(ic, 64)}</div><div style="text-align:center"><div style="font-size:60pt;font-weight:700;color:{c}">{n}</div><div style="font-size:42pt;font-weight:700">{snd}</div></div></div>')
    P_ = [title_slide(sp, 'أصوات الحيوانات', 'نسمع ونقلّد', ['1f431', '1f436', '1f404', '1f986'])] + [one(i, *a) for i, a in enumerate(A)] + [summary(sp, ['القطة تقول: مياو', 'الكلب يقول: هو هو', 'نقلّد أصوات الحيوانات ونضحك'])]
    return sp, P_
