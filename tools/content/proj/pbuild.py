# -*- coding: utf-8 -*-
# python3 pbuild.py proj1.sql  -> ملف SQL و /tmp/proj_mock.json
import sys, json
import pcommon as c
import p_sc, p_ma, p_ar, p_ln, p_ch
bad = c.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: 'null' if s is None else "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = {'project': 'مشروع أصلي من إنتاج زاد: خطواته وأدواته آمنة ومن مواد البيت، وفُحصت لغته وبنيته آليا، ولم يراجعه مختص تربوي بعد.', 'challenge': 'تحد أصلي من إنتاج زاد: فُحصت إجاباته وبنيته آليا وحُل آليا في الاختبار، ولم يراجعه مختص تربوي بعد.'}
rows = []; mock = []
for a in sorted(c.PJ + c.CH, key=lambda x: x['sort']):
    rows.append(f"({q(a['slug'])},{q(a['kind'])},{q(a['cat'])},{q(a['type'])},{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{q(a['subject'])},{q(a['skill'])},{q(a['difficulty'])},{q(a['descr'])},{q(a['instr'])},{a['minutes'] if a['minutes'] else 'null'},{J(a['data'])},{J(a['link'])},{q(RN[a['kind']])},true,'published',{a['sort']})")
    mock.append({k: a[k] for k in ('slug', 'kind', 'cat', 'type', 'title', 'icon', 'levels', 'subject', 'skill', 'difficulty', 'descr', 'instr', 'minutes', 'data', 'link')} | dict(sort_order=a['sort']))
cols = 'slug,kind,cat,type,title,icon,levels,subject,skill,difficulty,descr,instr,minutes,data,link,review_note,reviewed,status,sort_order'
sql = f"insert into public.proj_items({cols}) values\n" + ",\n".join(rows) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
json.dump(mock, open('/tmp/proj_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(c.PJ), 'projects', len(c.CH), 'challenges')
