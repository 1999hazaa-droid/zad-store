# -*- coding: utf-8 -*-
"""python3 build.py <out.sql> : يتحقق من الموضوعات ويولّد SQL (upsert) + wiki.json"""
import json, sys, os
import w_animals, w_plants, w_body, w_space, w_science, w_geo, w_culture, w_values
import wcommon as w
bad = w.check()
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]" if a else "'{}'::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
SRC = 'معلومات علمية وتعليمية عامة ومستقرة، كُتبت بصياغة أصلية من إعداد زاد ولم تُنسخ من كتاب أو موقع.'
RN = 'كُتب المحتوى برمجيًا وراجعته زاد مراجعة عامة، وتحقق من المعلومات المحلية (مثل رقم الطوارئ) من مصادر منشورة. لم يراجعه مختص علمي أو تربوي بعد.'
rows = []
for t in sorted(w.TOPICS, key=lambda x: x['sort']):
    rows.append(f"({q(t['slug'])},{q(t['category'])},{q(t['sub'])},{q(t['title'])},{q(t['icon'])},{arr(t['levels'])},{arr(t['keywords'])},{q(t['intro'])},{J(t['sections'])},{J(t['facts'])},{J(t['vocab'])},{J(t['acts'])},{arr(t['related'])},{J(t['links'])},{q(t['src'] or SRC)},{q(RN)},'published',{t['sort']})")
sql = "insert into public.wiki_topics(slug,category,sub,title,icon,levels,keywords,intro,sections,facts,vocab,acts,related,links,sources,review_note,status,sort_order) values\n" + ",\n".join(rows) + "\non conflict (slug) do update set category=excluded.category,sub=excluded.sub,title=excluded.title,icon=excluded.icon,levels=excluded.levels,keywords=excluded.keywords,intro=excluded.intro,sections=excluded.sections,facts=excluded.facts,vocab=excluded.vocab,acts=excluded.acts,related=excluded.related,links=excluded.links,sources=excluded.sources,review_note=excluded.review_note,status=excluded.status,sort_order=excluded.sort_order,updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
print(len(rows), 'topics', len(sql), 'bytes', sum(len(t['facts']) for t in w.TOPICS), 'facts', sum(len(t['acts']) for t in w.TOPICS), 'acts')
json.dump([dict(slug=t['slug'], category=t['category'], sub=t['sub'], title=t['title'], icon=t['icon'], levels=t['levels'], keywords=t['keywords'], intro=t['intro'], sections=t['sections'], facts=t['facts'], vocab=t['vocab'], acts=t['acts'], related=t['related'], links=t['links'], sources='s', review_note='r', sort_order=t['sort']) for t in sorted(w.TOPICS, key=lambda x: x['sort'])], open(os.path.join(os.environ.get('TMPDIR', '/tmp'), 'wiki_mock.json'), 'w', encoding='utf-8'), ensure_ascii=False)
