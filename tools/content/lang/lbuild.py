# -*- coding: utf-8 -*-
"""python3 lbuild.py <out.sql>"""
import json, sys
import l_ar, l_en
import lcommon as c
bad = c.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = 'كُتب المحتوى برمجيًا بصياغة أصلية وفُحصت بنيته آليًا (الإجابات الصحيحة والخيارات والأحرف)، وراجعت زاد التهجئة والمعنى للفئة العمرية. لم يراجعه معلم لغة متخصص بعد.'
def row(a):
    return f"({q(a['slug'])},{q(a['lang'])},{q(a['kind'])},{q(a['cat'])},{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{q(a['skill'])},{J(a['data'])},{q(RN)},true,'published',{a['sort']})"
cols = 'slug,lang,kind,cat,title,icon,levels,skill,data,review_note,reviewed,status,sort_order'
sql = f"insert into public.lang_items({cols}) values\n" + ",\n".join(row(a) for a in sorted(c.ITEMS, key=lambda x: (x['lang'], x['sort']))) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
print(len(c.ITEMS), 'items', len(sql), 'bytes')
json.dump([dict(slug=a['slug'], lang=a['lang'], kind=a['kind'], cat=a['cat'], title=a['title'], icon=a['icon'], levels=a['levels'], skill=a['skill'], data=a['data'], sort_order=a['sort']) for a in c.ITEMS], open('/tmp/lang_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
