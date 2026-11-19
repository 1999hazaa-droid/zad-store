# -*- coding: utf-8 -*-
"""python3 bbuild.py out.sql : يولّد SQL وبيانات المحاكاة /tmp/bank_mock.json"""
import json, sys, re
import b_ma, b_ar, b_en, b_sc, b_fc, b_va, b_ar2, b_links
import bcommon as c
bad = c.lint(); sheets = json.load(open(c.D + '/sheets.json', encoding='utf-8'))
import os
for s in sheets + b_links.LK:
    cre = c.EN if s['cat'] == 'english' else c.AR
    for f in ['title', 'subject', 'skill', 'descr']:
        if not cre.match(s[f]): bad.append(s['slug'] + ' txt ' + f)
    if s['icon'] not in c.ICONS: bad.append(s['slug'] + ' icon')
    if 'href' in s and not os.path.exists(c.ROOT + '/' + s['href'] + 'index.html'): bad.append(s['slug'] + ' href')
for s in sheets:
    for e in ('pdf', 'webp'):
        p = f"{c.ROOT}/files/bank/{s['slug']}.{e}"
        if not os.path.exists(p) or os.path.getsize(p) < 3000: bad.append(s['slug'] + ' ' + e)
    if not open(f"{c.ROOT}/files/bank/{s['slug']}.pdf", 'rb').read(5) == b'%PDF-': bad.append(s['slug'] + ' notpdf')
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: 'null' if s is None else "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = {'play': 'نشاط أصلي من إنتاج زاد: فُحصت الإجابات والبنية آليا وحُلّ كل نشاط آليا في الاختبار، ولم يراجعه مختص لغوي أو تربوي بعد.', 'sheet': 'ورقة أصلية من إنتاج زاد: فُحصت الصفحات بصريا وبقي دور مراجعة المختص اللغوي والتربوي.', 'link': 'رابط إلى نشاط أو قسم موجود في المكتبة دون تكرار محتواه. فُحص الرابط آليا.'}
rows = []; mock = []
for a in sorted(c.ACTS, key=lambda x: x['sort']):
    rows.append(f"({q(a['slug'])},{q(a['cat'])},{q(a['type'])},{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{q(a['subject'])},{q(a['skill'])},{q(a['difficulty'])},{q(a['descr'])},{q(a['instr'])},{J(a['data'])},null,null,null,{J(a['link'])},{q(RN['play'])},true,'published',{a['sort']})")
    mock.append(dict(slug=a['slug'], cat=a['cat'], type=a['type'], title=a['title'], icon=a['icon'], levels=a['levels'], subject=a['subject'], skill=a['skill'], difficulty=a['difficulty'], descr=a['descr'], instr=a['instr'], data=a['data'], href=None, pdf_url=None, preview_url=None, link=a['link'], sort_order=a['sort'], created_at='2026-11-20T00:00:00Z'))
for s in sheets:
    pu, pv = f"files/bank/{s['slug']}.pdf", f"files/bank/{s['slug']}.webp"
    rows.append(f"({q(s['slug'])},{q(s['cat'])},'sheet',{q(s['title'])},{q(s['icon'])},{arr(s['levels'])},{q(s['subject'])},{q(s['skill'])},{q(s['difficulty'])},{q(s['descr'])},'اطبع الورقة بحجم A4 وأنجز النشاط بمشاركة الكبير.','{{}}'::jsonb,null,{q(pu)},{q(pv)},'{{}}'::jsonb,{q(RN['sheet'])},true,'published',{s['sort']})")
    mock.append(dict(slug=s['slug'], cat=s['cat'], type='sheet', title=s['title'], icon=s['icon'], levels=s['levels'], subject=s['subject'], skill=s['skill'], difficulty=s['difficulty'], descr=s['descr'], instr='اطبع الورقة بحجم A4 وأنجز النشاط بمشاركة الكبير.', data={}, href=None, pdf_url=pu, preview_url=pv, link={}, sort_order=s['sort'], created_at='2026-11-20T00:00:00Z'))
for s in b_links.LK:
    rows.append(f"({q(s['slug'])},{q(s['cat'])},'link',{q(s['title'])},{q(s['icon'])},{arr(s['levels'])},{q(s['subject'])},{q(s['skill'])},{q(s['difficulty'])},{q(s['descr'])},'افتح النشاط في القسم الأصلي.','{{}}'::jsonb,{q(s['href'])},null,null,'{{}}'::jsonb,{q(RN['link'])},true,'published',{s['sort']})")
    mock.append(dict(slug=s['slug'], cat=s['cat'], type='link', title=s['title'], icon=s['icon'], levels=s['levels'], subject=s['subject'], skill=s['skill'], difficulty=s['difficulty'], descr=s['descr'], instr='افتح النشاط في القسم الأصلي.', data={}, href=s['href'], pdf_url=None, preview_url=None, link={}, sort_order=s['sort'], created_at='2026-11-20T00:00:00Z'))
cols = 'slug,cat,type,title,icon,levels,subject,skill,difficulty,descr,instr,data,href,pdf_url,preview_url,link,review_note,reviewed,status,sort_order'
sql = f"insert into public.bank_items({cols}) values\n" + ",\n".join(rows) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
json.dump(mock, open('/tmp/bank_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(c.ACTS), 'play', len(sheets), 'sheets', len(b_links.LK), 'links')
