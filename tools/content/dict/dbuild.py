# -*- coding: utf-8 -*-
import sys, json, collections
import dcommon as dc, d_words
bad = dc.lint()
if bad: print('\n'.join(bad)); sys.exit(1)
out = sys.argv[1] if len(sys.argv) > 1 else 'dict1.sql'
q = lambda s: 'null' if s is None else "'" + str(s).replace("'", "''") + "'"
rows = []; mock = []
for i, w in enumerate(dc.WORDS):
    slug = 'w%03d' % (i + 1); w['slug'] = slug; w['sort'] = i + 1
    arr = "array[" + ",".join(q(x) for x in w['levels']) + "]::text[]"
    rows.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,true,'published',%d)" % (q(slug), q(w['ar']), q(w['en']), q(w['topic']), q(w['sub']), q(w['letter']), q(w['en_letter']), q(w['icon']), q(w['meaning']), q(w['example']), q(w['pl']), q(w['syn']), q(w['opp']), q(w['seq']), 'null' if w['seq_n'] is None else w['seq_n'], arr, q(w['review_note']), w['sort']))
    mock.append(dict(slug=slug, ar=w['ar'], en=w['en'], topic=w['topic'], sub=w['sub'], letter=w['letter'], en_letter=w['en_letter'], icon=w['icon'], meaning=w['meaning'], example=w['example'], pl=w['pl'], syn=w['syn'], opp=w['opp'], seq=w['seq'], seq_n=w['seq_n'], levels=w['levels'], audio_url=None, sort_order=w['sort']))
sql = "insert into public.dict_words (slug,ar,en,topic,sub,letter,en_letter,icon,meaning,example,pl,syn,opp,seq,seq_n,levels,review_note,reviewed,status,sort_order) values\n" + ",\n".join(rows) + "\non conflict (slug) do nothing;\n"
open(out, 'w', encoding='utf-8').write(sql)
json.dump(mock, open('/tmp/dict_mock.json', 'w'), ensure_ascii=False)
c = collections.Counter(w['topic'] for w in dc.WORDS)
print(len(dc.WORDS), 'words', dict(c))
