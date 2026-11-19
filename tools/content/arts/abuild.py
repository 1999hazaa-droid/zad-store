# -*- coding: utf-8 -*-
"""python3 abuild.py <out.sql> [--nopdf]"""
import json, sys, os, html
import a_color, a_rest
import acommon as c
bad = c.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
ROOT = c.ROOT; OUT = ROOT + '/files/arts'; os.makedirs(OUT, exist_ok=True)
Ec = html.escape
import base64
def b64(p, m): return 'data:%s;base64,%s' % (m, base64.b64encode(open(p, 'rb').read()).decode())
FREG = b64(ROOT + '/fonts/cairo-regular.woff', 'font/woff'); FBLD = b64(ROOT + '/fonts/cairo-bold.woff', 'font/woff')
_ic = {}
def icon(n):
    if n not in _ic: _ic[n] = b64(ROOT + '/images/zad/' + n + '.webp', 'image/webp')
    return _ic[n]
LV = {'a2': 'عمر 1–2', 'a3': 'عمر 3', 'a4': 'عمر 4', 'a5': 'عمر 5', 'a6': 'عمر 6', 'g1': 'الصف 1', 'g2': 'الصف 2', 'g3': 'الصف 3', 'g4': 'الصف 4'}
ADULT = {'none': 'يمكن للطفل تنفيذه مع متابعة بسيطة', 'near': 'يلزم وجود شخص كبير بجانب الطفل', 'required': 'يُنفَّذ بإشراف مباشر من شخص كبير'}
WORD = {'house': 'بيت', 'cat': 'قط', 'sun': 'شمس', 'star': 'نجمة', 'fish': 'سمكة', 'flower': 'زهرة'}
def svg(tid, w='100%', vb='0 0 600 450', extra=''):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" style="width:{w};display:block" {extra}>{c.TIDS[tid]["svg"]}</svg>'
CSS = f'''@font-face{{font-family:C;src:url({FREG});font-weight:400}}@font-face{{font-family:C;src:url({FBLD});font-weight:700}}
@page{{size:A4;margin:11mm 13mm 12mm}}*{{box-sizing:border-box}}body{{margin:0;font:400 12pt/1.6 C,sans-serif;color:#1b1430;direction:rtl}}
.pg{{page-break-after:always;min-height:272mm;position:relative}}.pg:last-child{{page-break-after:auto}}
.top{{background:linear-gradient(135deg,#6d28d9,#a78bfa);color:#fff;border-radius:5mm;padding:4mm 7mm;display:flex;align-items:center;gap:5mm;margin-bottom:4mm}}.top img{{height:18mm}}.top h1{{margin:0;font-size:19pt;line-height:1.35}}.top p{{margin:0;font-size:10pt;opacity:.92}}
.nm{{display:flex;gap:6mm;margin:2mm 0 3mm}}.nm span{{flex:1;border-bottom:.4mm solid #8f86b8;padding-bottom:1mm;font-weight:700;font-size:11pt}}
.ft{{position:absolute;bottom:0;left:0;right:0;text-align:center;font-size:8.5pt;color:#6d6684}}
.fr{{border:.6mm solid #8b5cf6;border-radius:3mm;background:#fff}}.cut{{border:.5mm dashed #777;border-radius:2mm;padding:2mm;background:#fff}}
.g{{display:grid;gap:4mm}}.c2{{grid-template-columns:1fr 1fr}}.c3{{grid-template-columns:1fr 1fr 1fr}}
.n{{display:inline-block;background:#6d28d9;color:#fff;border-radius:50%;width:7mm;height:7mm;text-align:center;line-height:7mm;font-weight:700;font-size:10pt}}
.st{{display:flex;gap:3mm;align-items:flex-start;margin:1.5mm 0}}
.sc{{font-size:9.5pt;color:#555;text-align:center}}.ln{{border-bottom:.35mm solid #b8b0d8;height:9mm}}
.tt{{color:#5b21b6;font-weight:700}}'''
def page(a, body, sub, first=True):
    ic = icon(a['icon'])
    return f'''<div class="pg"><div class="top"><img src="{ic}"><div><h1>{Ec(a['title'])}</h1><p>{Ec(sub)}</p></div></div>
<div class="nm"><span>الاسم:</span><span>التاريخ:</span></div>{body}<div class="ft">مكتبة زاد التعليمية · {Ec(ADULT[a['adult']])} · لا تقصّ إلا بمقص أطفال آمن وبوجود شخص كبير</div></div>'''
def steps_html(a):
    return ''.join(f'<div class="st"><span class="n">{i+1}</span><span>{Ec(s[0])}</span></div>' for i, s in enumerate(a['steps']))
def mats_html(a):
    return '<div class="tt">الأدوات:</div><div>' + '، '.join(Ec(m[0]) for m in a['mats']) + '</div>'
def box(h, inner='', cls='fr'): return f'<div class="{cls}" style="height:{h}mm;padding:2mm">{inner}</div>'
def build(a):
    p = a['pdf']; t = p['type']; sub = c.CATS[a['cat']] + ' · ' + a['sub']; pages = []
    if t == 'color':
        ids = p['ids']
        for i in ids:
            T = c.TIDS[i]
            pages.append(page(a, f'<div class="fr" style="padding:6mm">{svg(i)}</div><p class="sc" style="font-size:12pt;margin-top:4mm">لوّن «{Ec(T["title"])}» بالألوان التي تحبها. لا يوجد لون خاطئ.</p>', sub))
    elif t == 'draw':
        i = p['ids'][0]
        st = ''.join(f'<div class="fr" style="padding:3mm;height:52mm"><span class="n">{k+1}</span> {Ec(s)}</div>' for k, s in enumerate(p['steps']))
        grid = ''.join(box(52, '<div class="sc">ارسم هنا</div>') for _ in range(4))
        pages.append(page(a, f'<div class="fr" style="padding:4mm;width:110mm;margin:0 auto">{svg(i) if i != 'free' else '<div style="height:70mm;text-align:center;padding-top:28mm" class="sc">لوحة بيضاء: ارسم ما تحب</div>'}</div><p class="sc">النموذج للإرشاد فقط، ارسم بطريقتك.</p><div class="g c2" style="margin-top:3mm">{st}</div>', sub))
        pages.append(page(a, f'<p class="tt">الآن ارسم أنت خطوة بخطوة في الإطارات:</p><div class="g c2">{grid}</div><div class="fr" style="height:90mm;margin-top:4mm;padding:2mm"><div class="sc">ارسم رسمتك الكاملة هنا</div></div>', sub))
    elif t == 'craft':
        i = p['ids'][0]
        pages.append(page(a, f'{mats_html(a)}<div class="tt" style="margin-top:3mm">الخطوات:</div>{steps_html(a)}<div class="fr" style="padding:5mm;margin-top:3mm;width:150mm;margin-inline:auto">{svg(i)}</div><p class="sc">{Ec(p["title"])}</p>', sub))
    elif t == 'cards':
        fr = ''.join(f'<div class="cut" style="height:62mm;padding:3mm"><div class="sc">الوجه الأول: الكلمة</div></div>' for _ in range(6))
        pages.append(page(a, f'{mats_html(a)}<div class="tt" style="margin-top:3mm">الخطوات:</div>{steps_html(a)}', sub))
        pages.append(page(a, f'<p class="tt">قصّ على الخطوط المتقطعة (بمساعدة شخص كبير) واكتب الكلمة، ثم ارسم صورتها على الوجه الآخر:</p><div class="g c2">{fr}</div>', sub))
    elif t == 'cube':
        w = 38
        def f(n, col): return f'<div style="width:{w}mm;height:{w}mm;border:.5mm dashed #444;background:{col};display:flex;align-items:center;justify-content:center;font-size:20pt;font-weight:700;color:#5b21b6">{n}</div>'
        net = '<div style="display:grid;grid-template-columns:repeat(4,%dmm);margin:6mm auto;width:%dmm;direction:ltr">' % (w, w * 4)
        cells = {(0, 1): 1, (1, 0): 2, (1, 1): 3, (1, 2): 4, (1, 3): 5, (2, 1): 6}
        for r in range(3):
            for k in range(4):
                net += f(cells[(r, k)], '#fff') if (r, k) in cells else '<div></div>'
        net += '</div>'
        pages.append(page(a, f'{mats_html(a)}{steps_html(a)}<p class="tt" style="margin-top:2mm">شبكة المكعب: لوّن كل وجه بلون مختلف، يقصّها الكبير (أو بمساعدته) على الخط المتقطع، ثم اطوِها وألصق الأطراف.</p>{net}<p class="sc">أضف لسانات صغيرة للصق عند الحافة (يرسمها الكبير) ثم أغلق المكعب.</p>', sub))
    elif t == 'match':
        ids = p['ids']; ws = p['words']
        pics = ''.join(f'<div class="cut"><div style="width:34mm;margin:auto">{svg(i)}</div></div>' for i in ids)
        wds = ''.join(f'<div class="cut" style="display:flex;align-items:center;justify-content:center;font-size:20pt;font-weight:700;color:#5b21b6;height:{34*0.75+4}mm">{Ec(w)}</div>' for w in ws)
        sl = ''.join(f'<div class="fr" style="height:{34*0.75+4}mm"></div>' for _ in ids)
        pages.append(page(a, f'{steps_html(a)}<p class="tt">1) قصّ الصور:</p><div class="g c3">{pics}</div><p class="tt" style="margin-top:4mm">2) قصّ الكلمات:</p><div class="g c3">{wds}</div>', sub))
        pages.append(page(a, f'<p class="tt">ألصق كل كلمة تحت صورتها: (الصق الصورة في الإطار ثم الكلمة بجانبها)</p><div class="g c3">{sl}</div><div class="g c3" style="margin-top:4mm">{sl}</div>', sub))
    elif t == 'compose':
        S = 'fill="%s" stroke="#2b2150" stroke-width="3"'
        pieces = [('مربع', f'<rect x="10" y="10" width="80" height="80" {S % "#f9d56e"}/>', 100, 100), ('مثلث', f'<polygon points="10,90 100,90 55,10" {S % "#f59e9e"}/>', 110, 100), ('مستطيل', f'<rect x="10" y="20" width="90" height="60" {S % "#9ee0a8"}/>', 110, 100), ('مستطيل', f'<rect x="20" y="10" width="40" height="80" {S % "#8ec5f2"}/>', 80, 100), ('مربع صغير', f'<rect x="25" y="25" width="45" height="45" {S % "#cdb3f5"}/>', 95, 95)]
        cs = ''.join(f'<div class="cut"><svg viewBox="0 0 {w} {h}" style="width:36mm;display:block;margin:auto">{s}</svg><div class="sc">{n}</div></div>' for n, s, w, h in pieces)
        pages.append(page(a, f'{steps_html(a)}<p class="tt">قصّ الأشكال:</p><div class="g c3">{cs}</div>', sub))
        pages.append(page(a, f'<p class="tt">ركّب أشكالك هنا لتصنع بيتًا (أو أي شيء تخترعه):</p><div class="fr" style="padding:4mm;opacity:.55">{svg("shapes-house")}</div><div class="fr" style="height:90mm;margin-top:4mm"></div>', sub))
    elif t == 'puzzle':
        i = p['ids'][0]; qs = [('0 0 300 225', 'أعلى اليمين'), ('300 0 300 225', 'أعلى اليسار'), ('0 225 300 225', 'أسفل اليمين'), ('300 225 300 225', 'أسفل اليسار')]
        cs = ''.join(f'<div class="cut" style="padding:1mm">{svg(i, vb=vb)}</div>' for vb, n in [(q[0], q[1]) for q in qs])
        pages.append(page(a, f'{steps_html(a)}<p class="tt">قصّ الأجزاء الأربعة ثم اخلطها:</p><div class="g c2" style="width:130mm;margin:auto">{cs}</div>', sub))
        pages.append(page(a, f'<p class="tt">ألصق الأجزاء هنا بالترتيب الصحيح:</p><div class="g c2" style="width:130mm;margin:auto">{"".join(box(50) for _ in range(4))}</div>', sub))
    elif t == 'sequence':
        ids = p['ids']; cs = ''.join(f'<div class="cut" style="padding:1mm"><div class="sc">{Ec(c.TIDS[i]["title"])}</div>{svg(i)}</div>' for i in ids)
        sl = ''.join(f'<div class="fr" style="height:48mm;position:relative"><span class="n" style="position:absolute;top:2mm;right:2mm">{k+1}</span></div>' for k in range(4))
        pages.append(page(a, f'{steps_html(a)}<p class="tt">قصّ البطاقات الأربع واخلطها:</p><div class="g c2">{cs}</div>', sub))
        pages.append(page(a, f'<p class="tt">ألصق البطاقات بالترتيب من 1 إلى 4:</p><div class="g c2">{sl}</div>', sub))
    elif t == 'words':
        rows = ''; cutl = ''
        for i, w in WORD.items():
            L = [ch for ch in w]
            slots = ''.join('<span class="fr" style="display:inline-block;width:13mm;height:13mm;margin:0 1mm"></span>' for _ in L)
            rows += f'<div style="display:flex;align-items:center;gap:5mm;margin:2mm 0"><div style="width:30mm">{svg(i)}</div><div>{slots}</div></div>'
            cutl += '<div style="display:flex;gap:2mm;margin:1.5mm 0">' + ''.join(f'<span class="cut" style="width:13mm;height:13mm;display:flex;align-items:center;justify-content:center;font-size:18pt;font-weight:700;color:#5b21b6">{ch}</span>' for ch in L[::-1]) + '</div>'
        pages.append(page(a, f'{steps_html(a)}<p class="tt">انظر إلى الصورة وركّب الكلمة بالحروف المقصوصة:</p>{rows}', sub))
        pages.append(page(a, f'<p class="tt">قصّ بطاقات الحروف (كل صف كلمة):</p>{cutl}<p class="sc">الكلمات: بيت، قط، شمس، نجمة، سمكة، زهرة</p>', sub))
    elif t == 'classify':
        items = ''.join(f'<div class="cut" style="padding:1mm"><div style="width:30mm;margin:auto">{svg(i)}</div></div>' for g, ids in p['groups'] for i in ids)
        gb = ''.join(f'<div class="fr" style="height:70mm;padding:2mm"><div class="tt" style="text-align:center">{Ec(g)}</div></div>' for g, _ in p['groups'])
        pages.append(page(a, f'{steps_html(a)}<p class="tt">قصّ الصور:</p><div class="g" style="grid-template-columns:repeat(4,1fr)">{items}</div>', sub))
        pages.append(page(a, f'<p class="tt">ألصق كل صورة في مجموعتها:</p><div class="g c3">{gb}</div>', sub))
    elif t == 'greeting':
        pages.append(page(a, f'{steps_html(a)}<div class="fr" style="height:80mm;margin-top:4mm;padding:3mm"><div class="sc">واجهة البطاقة: ارسم وزيّن</div></div><div style="border-top:.6mm dashed #777;text-align:center;font-size:9pt;color:#777;margin:2mm 0">اطوِ هنا</div><div class="fr" style="height:80mm;padding:3mm"><div class="sc">داخل البطاقة: اكتب كلمة تهنئة</div></div>', sub))
    elif t == 'board':
        fr = ''.join(f'<div class="fr" style="height:65mm;padding:2mm"><div class="sc">صورة {k+1}</div><div class="ln" style="margin-top:44mm"></div></div>' for k in range(6))
        pages.append(page(a, f'{steps_html(a)}<div class="fr" style="padding:3mm;margin:3mm 0"><b>عنوان لوحتي:</b><div class="ln"></div></div><div class="g c2">{fr}</div>', sub))
    elif t == 'collage':
        items = ''.join(f'<div class="cut" style="padding:1mm"><div style="width:36mm;margin:auto">{svg(i)}</div></div>' for i in p['ids'])
        pages.append(page(a, f'{steps_html(a)}<p class="tt">قصّ الصور التي تعجبك:</p><div class="g c3">{items}</div>', sub))
        pages.append(page(a, f'<p class="tt">ألصق صورك هنا وارسم الخلفية:</p><div class="fr" style="height:200mm"></div><div class="ln"></div><p class="sc">اسم لوحتي</p>', sub))
    elif t == 'character':
        pages.append(page(a, f'{steps_html(a)}<div class="fr" style="height:150mm;margin:3mm 0;padding:3mm"><div class="sc">ارسم شخصيتك هنا</div></div><b>اسم شخصيتي:</b><div class="ln"></div><b>ثلاث صفات تحبها شخصيتي:</b><div class="ln"></div><div class="ln"></div><div class="ln"></div>', sub))
    elif t == 'patterns':
        def row(shapes):
            cells = ''.join(f'<div class="fr" style="width:24mm;height:24mm;display:flex;align-items:center;justify-content:center">{s}</div>' for s in shapes)
            return f'<div style="display:flex;gap:3mm;margin:3mm 0">{cells}</div>'
        C = lambda col: f'<svg viewBox="0 0 40 40" style="width:16mm"><circle cx="20" cy="20" r="16" fill="{col}" stroke="#2b2150" stroke-width="2"/></svg>'
        Q = lambda col: f'<svg viewBox="0 0 40 40" style="width:16mm"><rect x="4" y="4" width="32" height="32" fill="{col}" stroke="#2b2150" stroke-width="2"/></svg>'
        T = lambda col: f'<svg viewBox="0 0 40 40" style="width:16mm"><polygon points="4,36 36,36 20,4" fill="{col}" stroke="#2b2150" stroke-width="2"/></svg>'
        r1 = row([C('#f59e9e'), Q('#8ec5f2'), C('#f59e9e'), Q('#8ec5f2'), '', '']); r2 = row([C('#f9d56e'), C('#f9d56e'), T('#9ee0a8'), C('#f9d56e'), C('#f9d56e'), '']); r3 = row([T('#cdb3f5'), Q('#f9d56e'), C('#8ec5f2'), T('#cdb3f5'), Q('#f9d56e'), ''])
        r4 = row(['', '', '', '', '', ''])
        pages.append(page(a, f'{steps_html(a)}<p class="tt">أكمل النمط في الإطارات الفارغة بالأشكال والألوان نفسها:</p>{r1}{r2}{r3}<p class="tt" style="margin-top:5mm">صمّم نمطك الخاص:</p>{r4}{r4}', sub))
    elif t == 'express':
        ps = ['ارسم شيئًا يجعلك سعيدًا', 'ارسم مكانًا تحب أن تذهب إليه', 'ارسم حلمًا تتمنى أن يتحقق', 'ارسم شعورك اليوم بالألوان']
        fr = ''.join(f'<div class="fr" style="height:100mm;padding:3mm"><div class="tt">{k+1}) {Ec(x)}</div></div>' for k, x in enumerate(ps))
        pages.append(page(a, f'<div class="g c2">{fr}</div><p class="sc" style="margin-top:3mm">لا توجد رسمة صحيحة أو خاطئة، المهم أن تعبّر عن نفسك.</p>', sub))
    elif t in ('a2colors', 'a2shapes'):
        if t == 'a2colors': items = [('أحمر', '#e53935'), ('أزرق', '#1e88e5'), ('أصفر', '#fdd835'), ('أخضر', '#43a047')]; shp = lambda col: f'<rect x="10" y="10" width="180" height="180" rx="18" fill="{col}"/>'
        else: items = [('دائرة', '#e53935'), ('مربع', '#1e88e5'), ('مثلث', '#43a047'), ('نجمة', '#fb8c00')]
        for k, (n, col) in enumerate(items):
            if t == 'a2colors': s = shp(col)
            else: s = ['<circle cx="100" cy="100" r="90" fill="%s"/>', '<rect x="15" y="15" width="170" height="170" fill="%s"/>', '<polygon points="10,185 190,185 100,15" fill="%s"/>', '<polygon points="100,8 124,72 192,76 138,118 156,186 100,148 44,186 62,118 8,76 76,72" fill="%s"/>'][k] % col
            pages.append(f'<div class="pg" style="text-align:center"><svg viewBox="0 0 200 200" style="width:170mm;margin-top:18mm">{s}</svg><div style="font-size:48pt;font-weight:700;color:#5b21b6">{n}</div><div class="ft">مكتبة زاد التعليمية · بطاقة كبيرة · يعرضها الكبير على الطفل ويسمّي اللون أو الشكل · لا يُترك الطفل مع الورق وحده</div></div>')
    else: raise SystemExit('unknown pdf type ' + t)
    return f'<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><title>{Ec(a["title"])}</title><style>{CSS}</style></head><body>' + ''.join(pages) + '</body></html>'
if '--nopdf' not in sys.argv:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for a in c.ACTS:
            pg = b.new_page(); pg.set_content(build(a)); pg.wait_for_timeout(250)
            pg.pdf(path=f"{OUT}/{a['slug']}.pdf", prefer_css_page_size=True, print_background=True); pg.close()
        b.close()
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = 'كُتب النشاط برمجيًا وفُحص بقائمة سلامة زاد (لا حرارة ولا أدوات حادة ولا مواد كيميائية، ومقص أطفال بوجود كبير فقط)، والملف يُفتح ويُطبع. لم يراجعه مختص تربوي بعد.'
def row(a):
    return f"({q(a['slug'])},{q(a['cat'])},{q(a['sub'])},{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{q(a['skill'])},{q(a['summary'])},{q(a['goal'])},{q(a['adult'])},{J(a['mats'])},{J(a['steps'])},{q(a['outcome'])},{q(a['tips'])},{q(a['template']) if a['template'] else 'null'},{q('files/arts/' + a['slug'] + '.pdf')},{J(a['links'])},{q(a['skill'])},{q(RN)},true,'published',{a['sort']})"
cols = 'slug,category,sub,title,icon,levels,skill,summary,goal,adult,materials,steps,outcome,tips,template,pdf_url,links,learn,review_note,reviewed,status,sort_order'
sql = f"insert into public.art_activities({cols}) values\n" + ",\n".join(row(a) for a in sorted(c.ACTS, key=lambda x: x['sort'])) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
print(len(c.ACTS), 'items', len(sql), 'bytes')
mock = [dict(slug=a['slug'], category=a['cat'], sub=a['sub'], title=a['title'], icon=a['icon'], levels=a['levels'], skill=a['skill'], summary=a['summary'], goal=a['goal'], adult=a['adult'], materials=a['mats'], steps=a['steps'], outcome=a['outcome'], tips=a['tips'], template=a['template'], pdf_url='files/arts/' + a['slug'] + '.pdf', links=a['links'], learn=a['skill'], status='published', sort_order=a['sort']) for a in c.ACTS]
json.dump(mock, open('/tmp/arts_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
