# -*- coding: utf-8 -*-
"""python3 vbuild.py out.sql"""
import json, sys
import v_a, vcommon as c
bad = c.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = 'درس مصور أصلي من إنتاج زاد: رسوم ثابتة متتابعة مع نص وقراءة بصوت الجهاز، وليس ملف فيديو. فُحصت بنيته آليا، ولم يراجعه مختص لغوي أو تربوي بعد.'
cols = 'slug,cat,title,icon,levels,subject,skill,descr,kind,scenes,duration_s,quiz,link,source,license,review_note,reviewed,status,sort_order'
rows = [f"({q(a['slug'])},{q(a['cat'])},{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{q(a['subject'])},{q(a['skill'])},{q(a['descr'])},'anim',{J(a['scenes'])},{a['duration']},{J(a['quiz'])},{J(a['link'])},'إنتاج زاد التعليمية','محتوى أصلي لمنصة زاد',{q(RN)},true,'published',{a['sort']})" for a in sorted(c.VIDS, key=lambda x: x['sort'])]
sql = f"insert into public.video_items({cols}) values\n" + ",\n".join(rows) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
json.dump([dict(slug=a['slug'], cat=a['cat'], title=a['title'], icon=a['icon'], levels=a['levels'], subject=a['subject'], skill=a['skill'], descr=a['descr'], kind='anim', scenes=a['scenes'], video_url=None, poster_url=None, duration_s=a['duration'], quiz=a['quiz'], link=a['link'], sort_order=a['sort'], created_at='2026-11-19T00:00:00Z') for a in c.VIDS], open('/tmp/vid_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(c.VIDS), 'videos')
