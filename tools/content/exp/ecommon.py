# -*- coding: utf-8 -*-
import os, re, sys
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')}
EXPS = []
TOPICS = {'water': 'تجارب الماء', 'colors': 'تجارب الألوان', 'plants': 'تجارب النباتات', 'light': 'تجارب الضوء والظل', 'air': 'تجارب الهواء والطقس', 'daily': 'تجارب العلوم اليومية',
          'space': 'مشاريع الفضاء', 'animals': 'مشاريع الحيوانات', 'body': 'مشاريع جسم الإنسان', 'env': 'مشاريع البيئة', 'math': 'مشاريع المجسمات', 'sense': 'استكشاف حسي'}
def MC(q, o, a, ts=(1, 2, 3)): return {'k': 'mc', 'q': q, 'o': o, 'a': a, 'ts': list(ts)}
def TF(q, a, ts=(1, 2, 3)): return {'k': 'tf', 'q': q, 'a': a, 'ts': list(ts)}
def FILL(q, o, a, ts=(2, 3)): return {'k': 'fill', 'q': q, 'o': o, 'a': a, 'ts': list(ts)}
def MATCH(p, ts=(1, 2, 3)): return {'k': 'match', 'p': [list(x) for x in p], 'ts': list(ts)}
def SORT(g, i, ts=(1, 2, 3)): return {'k': 'sort', 'g': list(g), 'i': [list(x) for x in i], 'ts': list(ts)}
def ODD(i, a, why, ts=(2, 3)): return {'k': 'odd', 'i': [list(x) for x in i], 'a': a, 'why': why, 'ts': list(ts)}
def E(slug, kind, topic, title, icon, levels, goal, diff, minutes, adult, learn, mats, safety, steps, expect, happened, why, learned, acts, wiki, links, sort, adapt=''):
    EXPS.append(dict(slug=slug, kind=kind, topic=topic, title=title, icon=icon, levels=levels, goal=goal, diff=diff, minutes=minutes, adult=adult, learn=learn, mats=[list(m) for m in mats], safety=safety, steps=[list(s) for s in steps], expect=expect, happened=happened, why=why, learned=learned, acts=acts, wiki=wiki, links=links, sort=sort, adapt=adapt))
def L(t, **k): return dict(type=t, **k)
BAN = ['نار', 'لهب', 'شمع', 'حرق', 'يحرق', 'ساخن', 'سخّن', 'سخن', 'تسخين', 'غلي', 'يغلي', 'سكين', 'مقص', 'إبرة', 'دبوس', 'حمض', 'صودا', 'بيكربونات', 'كلور', 'منظف', 'تذوق', 'تذوّق', 'اشرب', 'يشرب', 'استنشق', 'كهرباء', 'بطارية', 'قابس', 'ولاعة', 'موقد', 'فرن', 'ميكروويف', 'خل', 'دواء', 'مبيد']
def lint():
    bad = []
    for e in EXPS:
        txt = [m[0] for m in e['mats']] + [s[0] for s in e['steps']] + [e['expect'], e['happened'], e['why']] + e['learn']
        for t in txt:
            for b in BAN:
                hit = re.search(r'(?<![ء-ي])' + re.escape(b) + r'(?![ء-ي])', t) if b in ('خل', 'غلي') else (b in t)
                if hit: bad.append(f"{e['slug']}: '{b}' in «{t[:40]}»")
        if not e['safety']: bad.append(e['slug'] + ': no safety')
        if e['adult'] not in ('none', 'near', 'required'): bad.append(e['slug'] + ': adult')
        if e['kind'] != 'sensory' and len(e['steps']) < 3: bad.append(e['slug'] + ': few steps')
        if len(e['mats']) < 1: bad.append(e['slug'] + ': mats')
        ics = [e['icon']] + [m[1] for m in e['mats']] + [s[1] for s in e['steps'] if len(s) > 1]
        for a in e['acts']:
            ics += [x[0] for x in a.get('p', [])]
            if a['k'] == 'odd': ics += [x[1] for x in a['i']]
            if a['k'] == 'sort': ics += [x[2] for x in a['i']]
            if a['k'] in ('mc', 'fill'): assert 0 <= a['a'] < len(a['o']), (e['slug'], a['q'])
            if a['k'] == 'fill': assert '___' in a['q'], e['slug']
        for c in ics:
            if c and c not in ICONS: bad.append(f"{e['slug']}: icon {c}")
        TIER = {'a2':1,'a3':1,'a4':1,'a5':2,'a6':2,'g1':2,'g2':2,'g3':3,'g4':3}
        for k in sorted({TIER[l] for l in e['levels']}):
            if not any(k in a['ts'] for a in e['acts']): bad.append(f"{e['slug']}: no act tier {k}")
        if e['kind'] == 'sensory' and set(e['levels']) - {'a2'}: bad.append(e['slug'] + ': sensory must be a2 only')
        if e['kind'] != 'sensory' and 'a2' in e['levels']: bad.append(e['slug'] + ': a2 only sensory')
        if set(e['levels']) & {'g5', 'g6'}: bad.append(e['slug'] + ': g5/g6')
    return bad
