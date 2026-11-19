# -*- coding: utf-8 -*-
"""python3 vbuild.py <out.sql> : يكتب SQL و /tmp/val_mock.json"""
import json, sys
import v_a, v_b, v_c, v_d
import vcommon as c
bad = c.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = 'كُتب النشاط برمجيا بصياغة أصلية مناسبة للعمر، وفُحصت بنيته آليا (الإجابات والخيارات والأحرف والرسوم)، وخلا من العبارات المخيفة أو المحرجة. لم يراجعه مربٍّ متخصص بعد.'
cols = 'slug,cat,kind,title,icon,levels,step,data,family,review_note,reviewed,status,sort_order'
rows = [f"({q(a['slug'])},{q(a['cat'])},{q(a['kind'])},{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{a['step']},{J(a['data'])},{q(a['family']) if a['family'] else 'null'},{q(RN)},true,'published',{a['sort']})" for a in sorted(c.ITEMS, key=lambda x: x['sort'])]
sql = f"insert into public.val_items({cols}) values\n" + ",\n".join(rows) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
json.dump([dict(slug=a['slug'], cat=a['cat'], kind=a['kind'], title=a['title'], icon=a['icon'], levels=a['levels'], step=a['step'], data=a['data'], family=a['family'], sort_order=a['sort']) for a in c.ITEMS], open('/tmp/val_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
from collections import Counter
print(len(c.ITEMS), 'items', len(sql), 'bytes', dict(Counter(a['kind'] for a in c.ITEMS)))
