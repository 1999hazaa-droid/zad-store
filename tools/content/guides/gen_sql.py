# -*- coding: utf-8 -*-
"""python3 gen_sql.py <out.sql> <slug…|all> — upsert للأدلة من guides.json"""
import json, sys, os
d = os.path.dirname(os.path.abspath(__file__)); m = json.load(open(d + '/guides.json', encoding='utf-8'))
names = list(m) if sys.argv[2:] == ['all'] else sys.argv[2:]
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
rows = []
for s in names:
    a = m[s]; rn = 'محتوى أصلي من إعداد زاد؛ كُتب برمجيًا ولم يراجعه مختص تربوي أو جهة تعليمية بعد، وهو إرشادات عامة للاستئناس. ' + a.get('note', '')
    js = json.dumps(a['body'], ensure_ascii=False)
    rows.append(f"({q(s)},{q(a['audience'])},{q(a['kind'])},{q(a['title'])},{q(a['description'])},{arr(a['levels'])},{q(a['topic'])},{arr(a['goals'])},{q(a['intro'])},$j${js}$j$::jsonb,{arr(a['summary'])},{q(f'images/guides/{s}/cover.webp')},{q(f'files/guides/{s}.pdf')},{q(rn)},'published',{a['sort']})")
sql = "insert into public.guides(slug,audience,kind,title,description,levels,topic,goals,intro,body,summary,cover_url,pdf_url,review_note,status,sort_order) values\n" + ",\n".join(rows) + "\non conflict (slug) do update set audience=excluded.audience,kind=excluded.kind,title=excluded.title,description=excluded.description,levels=excluded.levels,topic=excluded.topic,goals=excluded.goals,intro=excluded.intro,body=excluded.body,summary=excluded.summary,cover_url=excluded.cover_url,pdf_url=excluded.pdf_url,review_note=excluded.review_note,status=excluded.status,sort_order=excluded.sort_order,updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql); print(len(rows))
