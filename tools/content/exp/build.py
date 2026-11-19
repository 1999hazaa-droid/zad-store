# -*- coding: utf-8 -*-
"""python3 build.py <out.sql> [--nopdf]"""
import json, sys, os, html
import e_water, e_colors, e_plants, e_light, e_air, e_daily, e_projects, e_sensory, e_more
import ecommon as c
bad = c.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
ROOT = c.ROOT; OUT = ROOT + '/files/experiments'; os.makedirs(OUT, exist_ok=True)
Ec = html.escape
FONT = 'file://' + ROOT + '/fonts/'
LV = {'a2': 'عمر 1–2', 'a3': 'عمر 3', 'a4': 'عمر 4', 'a5': 'عمر 5', 'a6': 'عمر 6', 'g1': 'الصف 1', 'g2': 'الصف 2', 'g3': 'الصف 3', 'g4': 'الصف 4'}
ADULT = {'none': 'يمكن للطفل تنفيذه مع متابعة بسيطة', 'near': 'يلزم وجود شخص كبير بجانب الطفل', 'required': 'يُنفَّذ بإشراف مباشر من شخص كبير'}
def sheet_html(e):
    sens = e['kind'] == 'sensory'
    ic = 'file://' + ROOT + '/images/zad/' + e['icon'] + '.webp'
    lines = lambda n: ''.join('<i></i>' for _ in range(n))
    qs = [('ماذا لاحظ الطفل؟ (يكتب الكبير)' if sens else 'ماذا توقعت؟', 2), ('ماذا لاحظت؟' if not sens else 'كيف كان تفاعل الطفل؟', 3)]
    if not sens: qs += [('ماذا تغيّر؟', 2), ('ماذا تعلمت؟', 2)]
    body = ''.join(f'<div class="q"><b>{Ec(q)}</b>{lines(n)}</div>' for q, n in qs)
    return f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><style>
@font-face{{font-family:C;src:url({FONT}cairo-regular.woff);font-weight:400}}@font-face{{font-family:C;src:url({FONT}cairo-bold.woff);font-weight:700}}
@page{{size:A4;margin:12mm 14mm 14mm}}*{{box-sizing:border-box}}body{{margin:0;font:400 12.5pt/1.7 C,sans-serif;color:#1b1430;direction:rtl}}
.top{{background:linear-gradient(135deg,#6d28d9,#a78bfa);color:#fff;border-radius:5mm;padding:5mm 7mm;display:flex;align-items:center;gap:6mm}}.top img{{height:22mm}}.top h1{{margin:0;font-size:21pt;line-height:1.35}}.top p{{margin:0;font-size:10.5pt;opacity:.95}}
.nm{{display:flex;gap:6mm;margin:4mm 0}}.nm span{{flex:1;border-bottom:.4mm solid #8f86b8;padding-bottom:1mm;font-weight:700}}
.sf{{background:#fff7e0;border:.5mm solid #f1b92f;border-radius:3mm;padding:2mm 4mm;font-size:10.5pt;margin-bottom:3mm}}
.q{{margin:3mm 0}}.q b{{display:block;color:#5b21b6;font-size:13pt}}.q i{{display:block;border-bottom:.35mm solid #b8b0d8;height:8mm}}
.dr{{border:.6mm dashed #8b5cf6;border-radius:4mm;height:70mm;padding:2mm 4mm;margin-top:3mm}}.dr b{{color:#5b21b6}}
.ft{{text-align:center;font-size:9pt;color:#6d6684;margin-top:3mm}}</style></head><body>
<div class="top"><img src="{ic}"><div><h1>{Ec(e['title'])}</h1><p>ورقة سجل الملاحظات · {Ec(c.TOPICS[e['topic']])}</p></div></div>
<div class="nm"><span>الاسم:</span><span>التاريخ:</span></div>
<div class="sf"><b>تنبيه سلامة:</b> {Ec(e['safety'][0])}</div>
{body}
<div class="dr"><b>{'يرسم الكبير أو الطفل ما شوهد:' if sens else 'ارسم ما شاهدته:'}</b></div>
<div class="ft">مكتبة زاد التعليمية · {Ec(ADULT[e['adult']])}</div></body></html>'''
if '--nopdf' not in sys.argv:
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); 
        for e in c.EXPS:
            pg = b.new_page(); pg.set_content(sheet_html(e)); pg.wait_for_timeout(250)
            pg.pdf(path=f"{OUT}/{e['slug']}-sheet.pdf", prefer_css_page_size=True, print_background=True); pg.close()
        b.close()
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = 'كُتبت التجربة برمجيًا وفُحصت بقائمة سلامة زاد (لا لهب ولا حرارة ولا أدوات حادة ولا مواد كيميائية ولا تذوق ولا استنشاق)، وراجعها فريق زاد مراجعة عامة. لم يراجعها مختص علمي أو تربوي بعد.'
def row(e):
    links = [dict(l) for l in e['links']]
    return f"({q(e['slug'])},{q(e['kind'])},{q(e['topic'])},{q(e['title'])},{q(e['icon'])},{arr(e['levels'])},{q(e['goal'])},{e['diff']},{e['minutes']},{q(e['adult'])},{arr(e['learn'])},{J(e['mats'])},{arr(e['safety'])},{J(e['steps'])},{q(e['expect'])},{q(e['happened'])},{q(e['why'])},{arr(e['learned'])},{J(e['acts'])},{q('files/experiments/'+e['slug']+'-sheet.pdf')},{q(e['wiki']) if e['wiki'] else 'null'},{J(links)},{q(e['adapt'])},{q(RN)},true,'published',{e['sort']})"
cols = 'slug,kind,topic,title,icon,levels,goal,difficulty,minutes,adult,learn,materials,safety,steps,expect,happened,why,learned,acts,sheet_url,wiki_slug,links,adapt,review_note,safety_reviewed,status,sort_order'
sql = f"insert into public.experiments({cols}) values\n" + ",\n".join(row(e) for e in sorted(c.EXPS, key=lambda x: x['sort'])) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
print(len(c.EXPS), 'items', len(sql), 'bytes')
mock = [dict(slug=e['slug'], kind=e['kind'], topic=e['topic'], title=e['title'], icon=e['icon'], levels=e['levels'], goal=e['goal'], difficulty=e['diff'], minutes=e['minutes'], adult=e['adult'], learn=e['learn'], materials=e['mats'], safety=e['safety'], steps=e['steps'], expect=e['expect'], happened=e['happened'], why=e['why'], learned=e['learned'], acts=e['acts'], sheet_url='files/experiments/' + e['slug'] + '-sheet.pdf', wiki_slug=e['wiki'], links=e['links'], adapt=e['adapt'], sort_order=e['sort'], status='published') for e in sorted(c.EXPS, key=lambda x: x['sort'])]
json.dump(mock, open('/tmp/exp_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
