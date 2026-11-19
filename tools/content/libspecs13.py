# -*- coding: utf-8 -*-
# الملخصات والمراجعات: PDF من بيانات summaries/data.py (محتوى أصلي، الأجوبة مكتوبة في البيانات وتُراجع آلياً).
import os, sys, re, html
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'summaries'))
from libspecs11 import *
import data as SD
E = lambda t: html.escape(t, quote=False)
MATH = re.compile(r'\d[\d./\s+×÷−=<>%()]*\d%?|\d%?')
def fm(t): return MATH.sub(lambda m: '<bdi dir="ltr">' + m.group(0).strip() + '</bdi>' + (' ' if m.group(0).endswith(' ') else ''), E(t))
LAT = re.compile(r'[A-Za-z]')
def ar(t): return f'<span dir="auto">{fm(t)}</span>' if LAT.search(t) else fm(t)
def para(t): return f'<p style="font-size:13.5pt;line-height:1.95;margin:1.5mm 0" dir="auto">{fm(t)}</p>'
def qhtml(i, q):
    t = q['type']; body = f'<b dir="auto">{fm(q["q"])}</b>'
    if t == 'mcq': body += '<div style="margin-top:2mm">' + ''.join(f'<span class="opt" dir="auto">{fm(o)}</span>' for o in q['opts']) + '</div>'
    elif t == 'tf': body += '<div style="margin-top:2mm"><span class="opt">صح ✓</span><span class="opt">خطأ ✗</span></div>'
    elif t == 'short': body += '<div style="border-bottom:.4mm dotted #888;height:8mm"></div><div style="border-bottom:.4mm dotted #888;height:8mm"></div>'
    return f'<div class="q"><span class="no">{i}</span><div style="flex:1">{body}</div></div>'
def ans(q):
    if q['type'] == 'mcq': return q['opts'][q['a']]
    if q['type'] == 'tf': return 'صح' if q['a'] else 'خطأ'
    return q['a']
def build(it):
    C, T = SD.COL.get(it['subj'], ('#7c3aed', '#efe7ff'))
    sname = SD.SUBJ.get(it['subj'], 'مراجعة شاملة')
    kindname = 'نموذج مراجعة قبل الاختبار' if it['kind'] == 'exam_prep' else 'خريطة مفاهيم' if it['kind'] == 'concept_map' else 'ملخص درس'
    sp = spec(slug=it['slug'], title=it['title'], subtitle=kindname, chips=[f'الصف {["الأول","الثاني","الثالث","الرابع","الخامس","السادس"][it["grade"]-1]}', sname, kindname], color=C, tint=T,
              note='محتوى أصلي من إعداد منصة زاد، غير منسوب لكتاب مدرسي أو منهج محدد. يُستعمل للمراجعة والتدريب.')
    P = []
    qs = it['questions']
    if it['kind'] != 'exam_prep':
        g = '<div class="bx"><b>أهداف التعلّم</b><br>' + '<br>'.join('• ' + ar(x) for x in it['goals']) + '</div>'
        if it['kind'] == 'concept_map':
            tb = ('<div style="text-align:center"><div style="display:inline-block;background:%s;color:#fff;border-radius:6mm;padding:3mm 9mm;font-size:17pt;font-weight:800">%s</div><div style="font-size:18pt;color:%s;line-height:1">&#9660;</div></div>' % (C, ar(it['lesson']), C)
                  + '<div style="display:flex;flex-wrap:wrap;gap:3mm;justify-content:center">' + ''.join(
                      f'<div style="flex:1 1 42%;min-width:60mm;border:.6mm solid {C};background:{T};border-radius:4mm;padding:3mm;text-align:center"><div style="font-weight:800;font-size:14pt;color:{C};margin-bottom:1mm">{ar(c["t"])}</div><div style="font-size:12pt;line-height:1.7" dir="auto">{ar(c["d"])}</div></div>' for c in it['concepts']) + '</div>')
        else:
            tb = '<table><tr><th style="width:30%">المفهوم</th><th>المعنى</th></tr>' + ''.join(f'<tr><td><b>{ar(c["t"])}</b></td><td dir="auto">{ar(c["d"])}</td></tr>' for c in it['concepts']) + '</table>'
        P.append((('خريطة المفاهيم: ' if it['kind'] == 'concept_map' else 'الملخص: ') + it['lesson'], f'{sname} · وحدة: {it["unit"]}', g + '<div style="height:3mm"></div>' + tb, 'sum'))
        ex = ''.join(para(x) for x in it['explanation'])
        exs = '<div class="bx"><b>أمثلة</b><br>' + '<br>'.join(f'<span dir="auto">{fm(x)}</span>' for x in it['examples']) + '</div>' if it['examples'] else ''
        P.append(('الشرح المبسّط والأمثلة', 'اقرأ الشرح ببطء ثم انظر إلى الأمثلة.', ex + '<div style="height:3mm"></div>' + exs, 'sum'))
        pts = '<div class="bx" style="border-style:solid"><b>نقاط للمراجعة</b><br>' + '<br>'.join('✔ ' + ar(x) for x in it['points']) + '</div>'
        P.append(('أسئلة للتأكد من الفهم', 'أجب بنفسك ثم قارن بالإجابات في آخر الملف.', ''.join(qhtml(i, q) for i, q in enumerate(qs, 1)) + '<div style="height:3mm"></div>' + pts, 'ws'))
    else:
        h = len(qs) // 2
        P.append(('القسم الأول', 'اقرأ كل سؤال جيداً وأجب.', ''.join(qhtml(i, q) for i, q in enumerate(qs[:h], 1)), 'ws'))
        P.append(('القسم الثاني', 'تابع الإجابة عن بقية الأسئلة.', ''.join(qhtml(i, q) for i, q in enumerate(qs[h:], h + 1)), 'ws'))
        P.append(('نصائح للمراجعة', 'قبل الاختبار وبعده.', '<div class="bx" style="border-style:solid">' + '<br>'.join('✔ ' + ar(x) for x in it['points']) + '</div>', 'sum'))
    key = '<div class="key">' + '<br>'.join(f'<b>{i}.</b> {ar(str(ans(q)))}' for i, q in enumerate(qs, 1)) + '</div>'
    return fin(sp, P, key)
for _it in SD.items:
    ALL['sum_' + _it['slug'].replace('-', '_')] = (lambda it=_it: build(it))
