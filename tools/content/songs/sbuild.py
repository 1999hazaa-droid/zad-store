# -*- coding: utf-8 -*-
"""python3 sbuild.py <out.sql> : SQL + /tmp/song_mock.json"""
import json, sys
import s_a, s_b
import scommon as c
bad = c.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
J = lambda o: "$j$" + json.dumps(o, ensure_ascii=False) + "$j$::jsonb"
RN = 'الكلمات أصلية كتبت لمنصة زاد، لا تنسخ نصا محميا. فُحصت بنيتها آليا، ولم يراجعها مختص لغوي أو تربوي بعد. لا يوجد تسجيل صوتي بعد، والمشغل يقرأ الكلمات بصوت الجهاز.'
cols = 'slug,cat,title,icon,levels,skill,lyrics,quiz,review_note,reviewed,status,sort_order'
rows = [f"({q(a['slug'])},{q(a['cat'])},{q(a['title'])},{q(a['icon'])},{arr(a['levels'])},{q(a['skill'])},{arr(a['lyrics'])},{J(a['quiz'])},{q(RN)},true,'published',{a['sort']})" for a in sorted(c.SONGS, key=lambda x: x['sort'])]
sql = f"insert into public.song_items({cols}) values\n" + ",\n".join(rows) + "\non conflict (slug) do update set " + ",".join(f"{k}=excluded.{k}" for k in cols.split(',') if k != 'slug') + ",updated_at=now();\n"
open(sys.argv[1], 'w', encoding='utf-8').write(sql)
json.dump([dict(slug=a['slug'], cat=a['cat'], title=a['title'], icon=a['icon'], levels=a['levels'], skill=a['skill'], lyrics=a['lyrics'], quiz=a['quiz'], audio_url=None, sort_order=a['sort']) for a in c.SONGS], open('/tmp/song_mock.json', 'w', encoding='utf-8'), ensure_ascii=False)
print(len(c.SONGS), 'songs')
