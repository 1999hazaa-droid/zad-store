# -*- coding: utf-8 -*-
from common import *
NOTE = 'وسيلة شرح مصورة أصلية من إعداد زاد، بلا نسب إلى كتاب أو منهج محدد، ولم تُراجَع من جهة تعليمية رسمية.'
def SP(**k): k.setdefault('kind', 'explainer'); k.setdefault('orient', 'portrait'); k.setdefault('note', NOTE); return k
def P(sp, t, s, body): return [page(sp, t, s, body)]
def steps(items, h=19):
    o = ''
    for i, (ic, t, d) in enumerate(items):
        c = PAL[[0, 4, 3, 1, 5, 6, 7][i % 7]]
        o += f'<div style="display:flex;align-items:center;gap:5mm;border:.6mm solid {c};background:{c}10;border-radius:6mm;padding:2mm 6mm;flex:1;min-height:0"><div style="width:12mm;height:12mm;flex:none;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:20pt;font-weight:700">{AD(i + 1)}</div>{I(ic, h)}<div style="flex:1"><div style="font-size:16pt;font-weight:700;color:{c}">{t}</div><div style="font-size:12pt;line-height:1.5">{d}</div></div></div>'
    return f'<div style="display:flex;flex-direction:column;gap:3mm;flex:1;min-height:0">{o}</div>'

@spec('ex-handwashing')
def _():
    sp = SP(title='خطوات غسل اليدين', desc='وسيلة شرح مصورة لخمس خطوات صحيحة لغسل اليدين بالماء والصابون.', levels=['a3', 'a4', 'a5', 'a6', 'g1', 'g2'], subject='المهارات الحياتية', topic='النظافة والصحة', sort=1)
    b = steps([('1f4a7', 'نبلّل اليدين بالماء', 'نفتح الصنبور ونبلّل اليدين'), ('1f9fc', 'نضع الصابون', 'كمية صغيرة تكفي لتغطية اليدين'), ('1f590', 'نفرك جيدًا', 'الكفّان وظهر اليدين وبين الأصابع والأظافر، لمدة ٢٠ ثانية تقريبًا'), ('x_water', 'نشطف بالماء', 'نزيل الصابون كله'), ('x_sheet', 'نجفّف اليدين', 'بمنشفة نظيفة أو منديل ورقي')])
    return sp, P(sp, 'خطوات غسل اليدين', 'نغسل أيدينا قبل الأكل وبعده وبعد الحمّام', b)

def colsum(a, b):
    s = a + b; ones = a % 10 + b % 10; carry = ones // 10
    cells = lambda x: ''.join(f'<td>{AD(d)}</td>' for d in str(x).rjust(3))
    return s, ones, carry

def coltab(a, b, carry='', res=('', '', ''), hl=None):
    """جدول عمودي للجمع: خانات المئات/العشرات/الآحاد."""
    def td(v, c='', hlt=False): return f'<td style="{"background:#fff3c4;" if hlt else ""}color:{c or "#1b1430"}">{v}</td>'
    A = str(a).rjust(3, ' '); B = str(b).rjust(3, ' ')
    r = f'<tr class="cy"><td></td>' + ''.join(td(carry if i == 1 else '', '#e53935') for i in range(3)) + '</tr>'
    r += '<tr><td></td>' + ''.join(td(AD(ch) if ch != ' ' else '', hlt=(hl == i)) for i, ch in enumerate(A)) + '</tr>'
    r += '<tr><td style="font-size:17pt">+</td>' + ''.join(td(AD(ch) if ch != ' ' else '', hlt=(hl == i)) for i, ch in enumerate(B)) + '</tr>'
    r += '<tr class="res"><td></td>' + ''.join(td(res[i], '#1e88e5', hlt=(hl == i)) for i in range(3)) + '</tr>'
    return f'<table class="ct">{r}</table>'

@spec('ex-column-addition')
def _():
    sp = SP(title='الجمع بالحمل (الجمع العمودي)', desc='وسيلة شرح مصورة لطريقة الجمع العمودي مع الحمل بمثالين محلولين خطوة بخطوة، والنواتج محسوبة برمجيًا.', levels=['g2', 'g3'], subject='الرياضيات', topic='الجمع', sort=2)
    css = '<style>.ct{border-collapse:collapse;direction:ltr;margin:0 auto}.ct td{width:9mm;height:11mm;text-align:center;font-size:21pt;font-weight:700;padding:0}.ct tr.cy td{height:6mm;font-size:13pt}.ct tr.res td{border-top:.8mm solid #1b1430}</style>'
    def example(a, b, col):
        s = a + b; o1 = a % 10 + b % 10; d0 = o1 % 10; c1 = o1 // 10
        t1 = (a // 10) % 10 + (b // 10) % 10 + c1
        assert s == a + b and t1 == s // 10
        cards = [
            ('نبدأ من الآحاد', '\u202d' + f'{AD(a % 10)} + {AD(b % 10)} = {AD(o1)}' + '\u202c', coltab(a, b, '', ('', '', ''), 2)),
            ('نكتب الآحاد ونحمل العشرات', f'نكتب {AD(d0)} ونحمل {AD(c1)}' if c1 else f'نكتب {AD(d0)}', coltab(a, b, AD(c1) if c1 else '', ('', '', AD(d0)), 2)),
            ('نجمع العشرات مع الحمل', '\u202d' + f'{AD((a // 10) % 10)} + {AD((b // 10) % 10)} + {AD(c1)} = {AD(t1)}' + '\u202c', coltab(a, b, AD(c1) if c1 else '', ('', '', AD(d0)), 1)),
            ('الناتج النهائي', '\u202d' + f'{AD(a)} + {AD(b)} = {AD(s)}' + '\u202c', coltab(a, b, AD(c1) if c1 else '', ('', AD(t1), AD(d0)), None))]
        h = ''.join(f'<div class="cell" style="border-color:{col};background:{col}0d;gap:1.5mm"><div style="font-size:11.5pt;font-weight:700;color:{col};text-align:center;line-height:1.4">{AD(i + 1)}) {t}</div>{tb}<div style="font-size:11.5pt;font-weight:700;text-align:center;line-height:1.5">{eq}</div></div>' for i, (t, eq, tb) in enumerate(cards))
        return h
    ex1 = example(47, 36, '#e53935'); ex2 = example(58, 27, '#1e88e5')
    body = f'{css}<div style="font-size:15pt;font-weight:700;color:#e53935;margin-bottom:1mm">المثال الأول: ٤٧ + ٣٦</div><div class="grid" style="grid-template-columns:repeat(4,1fr);flex:1;min-height:0">{ex1}</div><div style="font-size:15pt;font-weight:700;color:#1e88e5;margin:3mm 0 1mm">المثال الثاني: ٥٨ + ٢٧</div><div class="grid" style="grid-template-columns:repeat(4,1fr);flex:1;min-height:0">{ex2}</div><div style="margin-top:3mm;background:var(--t);border-radius:4mm;padding:2.5mm 5mm;text-align:center;font-size:12.5pt">إذا زاد مجموع الآحاد عن ٩ نكتب رقم الآحاد ونحمل الباقي إلى العشرات</div>'
    return sp, P(sp, 'الجمع بالحمل (الجمع العمودي)', 'نجمع الآحاد أولًا ثم العشرات', body)

@spec('ex-problem-solving')
def _():
    sp = SP(title='خطوات حل المسألة الكلامية', desc='وسيلة شرح مصورة لست خطوات لحل المسائل الكلامية مع مثال محلول: ١٢ − ٥ = ٧ والتحقق ٧ + ٥ = ١٢.', levels=['g2', 'g3', 'g4'], subject='الرياضيات', topic='حل المسائل', sort=3)
    q = '<div style="background:#fff8e1;border:.6mm dashed #f9a825;border-radius:5mm;padding:3mm 6mm;font-size:14pt;line-height:1.7;margin-bottom:3mm"><b>المسألة:</b> مع سالم <b>١٢</b> تفاحة، أعطى أخته <b>٥</b> تفاحات. كم تفاحة بقيت معه؟</div>'
    S = [('1f4d6', 'أقرأ المسألة جيدًا', 'أقرؤها مرتين وأفهم القصة', ''), ('1f50d', 'أحدّد المعطيات', 'مع سالم ١٢ · أعطى ٥', ''), ('1f3af', 'أحدّد المطلوب', 'كم بقي مع سالم؟', ''), ('1f9e0', 'أختار العملية', 'أعطى = نُقص ← الطرح', ''), ('270f', 'أحسب', f'{ltr("12 − 5 = 7")}', ''), ('2b50', 'أتحقّق من الجواب', f'{ltr("7 + 5 = 12")} ✓ الجواب: بقيت ٧ تفاحات', '')]
    o = ''
    for i, (ic, t, d, _) in enumerate(S):
        c = PAL[[0, 4, 3, 1, 5, 6][i]]
        o += f'<div style="display:flex;align-items:center;gap:5mm;border:.6mm solid {c};background:{c}10;border-radius:6mm;padding:1.5mm 6mm;flex:1;min-height:0"><div style="width:11mm;height:11mm;flex:none;border-radius:50%;background:{c};color:#fff;display:grid;place-items:center;font-size:18pt;font-weight:700">{AD(i + 1)}</div>{I(ic, 15)}<div style="flex:1"><div style="font-size:16pt;font-weight:700;color:{c}">{t}</div><div style="font-size:13pt">{d}</div></div></div>'
    return sp, P(sp, 'خطوات حل المسألة الكلامية', 'ستّ خطوات تقودنا إلى الجواب الصحيح', q + f'<div style="display:flex;flex-direction:column;gap:2.5mm;flex:1;min-height:0">{o}</div>')

@spec('ex-seed-experiment')
def _():
    sp = SP(title='تجربة إنبات البذور', desc='وسيلة شرح مصورة لتجربة بسيطة لإنبات فاصولياء في كأس شفاف بالقطن والماء، مع الأدوات وخطوات المراقبة.', levels=['g1', 'g2', 'g3'], subject='العلوم', topic='النبات', sort=4, note='تجربة منزلية آمنة بإشراف شخص بالغ؛ مدة الإنبات تختلف بحسب الظروف. ' + NOTE)
    tools = '<div style="display:flex;gap:4mm;justify-content:center;margin-bottom:3mm">' + ''.join(f'<div class="cell tint" style="flex:1;gap:1mm;padding:2mm">{I(ic, 14)}<div style="font-size:11.5pt;font-weight:700">{t}</div></div>' for ic, t in [('x_seed', 'بذور فاصولياء'), ('x_paper', 'قطن أو ورق'), ('x_water', 'كأس شفاف'), ('x_wcan', 'ماء')]) + '</div>'
    b = steps([('x_water', 'نضع القطن المبلّل في الكأس', 'نبلّل القطن قليلًا ونملأ به الكأس'), ('x_seed', 'نضع البذور', 'نثبّتها بين القطن وجدار الكأس لنراها'), ('2600', 'نضعها في مكان دافئ ومضيء', 'بعيدًا عن الحرارة الشديدة'), ('x_wcan', 'نحافظ على رطوبة القطن', 'نضيف قليلًا من الماء كل يوم ولا نغرق البذور'), ('1f50d', 'نراقب ونسجّل', 'نرسم ما نراه كل يوم: الجذر ثم الساق ثم الأوراق')], 16)
    return sp, P(sp, 'تجربة إنبات البذور', 'ماذا تحتاج البذرة لتنبت؟ ماء ودفء وهواء', tools + b)
