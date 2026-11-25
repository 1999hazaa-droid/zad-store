# -*- coding: utf-8 -*-
import sys, json, re, collections
import q_early, q_arabic, q_math, q_eng, q_sci, q_val
from qcommon import *
bad = lint()
# تحقق حسابي مستقل: كل معادلة في السؤال يجب أن تطابق الإجابة الصحيحة
for z in QZ:
    for i, q in enumerate(z['qs']):
        m = re.match(r'^(\d+) ([+−×÷]) (\d+) = ؟$', q.get('q', ''))
        if m:
            a, op, b = int(m[1]), m[2], int(m[3])
            r = {'+': a + b, '−': a - b, '×': a * b, '÷': (a // b if b and a % b == 0 else -1)}[op]
            if str(r) != q['o'][0]: bad.append(f"{z['slug']}#{i+1} math mismatch {q['q']} -> {q['o'][0]}")
        if q['t'] == 'prob':
            p = q['pr']; r = p['a'] + p['b'] if p['op'] == '+' else p['a'] - p['b']
            if str(r) != q['o'][0]: bad.append(f"{z['slug']}#{i+1} prob mismatch")
            nums = [int(x) for x in re.findall(r'\d+', q['q'])]
            if q['q'] and nums and sorted(nums) != sorted([p['a'], p['b']]) and 'الصور' not in q['q']: bad.append(f"{z['slug']}#{i+1} prob text numbers {nums} vs {p['a']},{p['b']}")
        if q['t'] == 'mc' and q.get('cnt'):
            if str(q['cnt'][1]) != q['o'][0]: bad.append(f"{z['slug']}#{i+1} count mismatch")
        if q['t'] == 'obs':
            pass
if bad: print('\n'.join(bad)); sys.exit(1)
out = sys.argv[1] if len(sys.argv) > 1 else 'quiz1.sql'
q = lambda s: 'null' if s is None else "'" + str(s).replace("'", "''") + "'"
NOTE = 'راجعت المنصة الأسئلة والإجابات داخليا بفحص آلي ومراجعة نصية، ولم يراجعها مختص تربوي بعد.'
rows = []; mock = []
for z in sorted(QZ, key=lambda x: x['sort']):
    lv = "array[" + ",".join(q(x) for x in z['levels']) + "]::text[]"
    tg = "array[" + ",".join(q(x) for x in z['tags']) + "]::text[]" if z['tags'] else "'{}'::text[]"
    qj = json.dumps(z['qs'], ensure_ascii=False, separators=(',', ':')); lj = json.dumps(z['link'], ensure_ascii=False)
    d = {'easy': 'easy', 'mid': 'mid', 'adv': 'adv'}[z['difficulty']]
    rows.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%d,%s,%s::jsonb,%s::jsonb,%s,true,'published',%d)" % (q(z['slug']), q(z['cat']), q(z['title']), q(z['icon']), lv, q(z['subject']), q(z['skill']), q(d), q(z['descr']), z['minutes'], tg, q(qj), q(lj), q(NOTE), z['sort']))
    mock.append(dict(slug=z['slug'], cat=z['cat'], title=z['title'], icon=z['icon'], levels=z['levels'], subject=z['subject'], skill=z['skill'], difficulty=d, descr=z['descr'], minutes=z['minutes'], tags=z['tags'], questions=z['qs'], link=z['link'], sort_order=z['sort'], status='published'))
sql = "insert into public.qz_quizzes (slug,cat,title,icon,levels,subject,skill,difficulty,descr,minutes,tags,questions,link,review_note,reviewed,status,sort_order) values\n" + ",\n".join(rows) + "\non conflict (slug) do nothing;\n"
open(out, 'w', encoding='utf-8').write(sql)
json.dump(mock, open('/tmp/quiz_mock.json', 'w'), ensure_ascii=False)
c = collections.Counter(z['cat'] for z in QZ); t = collections.Counter(x['t'] for z in QZ for x in z['qs'])
print(len(QZ), 'quizzes', sum(len(z['qs']) for z in QZ), 'questions', dict(c), dict(t), len(sql) // 1024, 'KB')
