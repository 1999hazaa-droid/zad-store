# -*- coding: utf-8 -*-
"""python3 gen_sql.py <out.sql> <slug>… — يولّد upsert لهذه الوسائل من meta.json"""
import json, sys, os
d = os.path.dirname(os.path.abspath(__file__)); m = json.load(open(d + '/meta.json', encoding='utf-8'))
old = open(d + '/media.sql', encoding='utf-8').read()
q = lambda s: "'" + str(s).replace("'", "''") + "'"
arr = lambda a: "array[" + ",".join(q(x) for x in a) + "]::text[]"
rows = []
for s in sys.argv[2:]:
    a = m[s]; rn = 'محتوى أصلي من إعداد زاد (توليد برمجي)؛ لم يراجعه معلم أو جهة تعليمية بعد. ' + a['note']
    pages = [f'images/media/{s}/p{k + 1:02d}.webp' for k in range(a['pages'])]
    rows.append(f"({q(s)},{q(a['kind'])},{q(a['title'])},{q(a['desc'])},{arr(a['levels'])},{q(a['subject'])},{q(a['topic'])},{q(a['orient'])},{a['pages']},{q(f'images/media/{s}/thumb.webp')},{q(f'files/media/{s}.pdf')},{q(f'files/media/{s}-bw.pdf')},{arr(pages)},{q(rn)},'published',{a['sort']})")
open(sys.argv[1], 'w', encoding='utf-8').write(old[:old.index('values') + 7] + ",\n".join(rows) + "\n" + old[old.index('on conflict'):])
print(len(rows))
