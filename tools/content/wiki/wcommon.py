# -*- coding: utf-8 -*-
import os, json
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')}
TOPICS = []
ALLL = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
def S(h, x, t=1, ic=None): return {'h': h, 'x': x, 't': t, **({'ic': ic} if ic else {})}
def F(title, x, ic, t=1): return {'h': title, 'x': x, 'ic': ic, 't': t}
def V(w, m, t=1, ic=None): return {'w': w, 'm': m, 't': t, **({'ic': ic} if ic else {})}
def MC(q, opts, a, ts=(1, 2, 3)): return {'k': 'mc', 'q': q, 'o': opts, 'a': a, 'ts': list(ts)}
def TF(q, a, ts=(1, 2, 3)): return {'k': 'tf', 'q': q, 'a': a, 'ts': list(ts)}
def FILL(q, opts, a, ts=(2, 3)): return {'k': 'fill', 'q': q, 'o': opts, 'a': a, 'ts': list(ts)}
def MATCH(pairs, ts=(1, 2, 3)): return {'k': 'match', 'p': [list(p) for p in pairs], 'ts': list(ts)}
def SORT(groups, items, ts=(1, 2, 3)): return {'k': 'sort', 'g': list(groups), 'i': [list(i) for i in items], 'ts': list(ts)}
def ODD(items, a, why, ts=(2, 3)): return {'k': 'odd', 'i': [list(i) for i in items], 'a': a, 'why': why, 'ts': list(ts)}
def T(slug, cat, sub, title, icon, kw, intro, secs, facts, vocab, acts, related, links, sort, levels=ALLL, src=None):
    TOPICS.append(dict(slug=slug, category=cat, sub=sub, title=title, icon=icon, levels=levels, keywords=kw, intro=intro, sections=secs, facts=facts, vocab=vocab, acts=acts, related=related, links=links, sort=sort, src=src))
def L(t, **k): return dict(type=t, **k)
def check():
    bad = []; slugs = {t['slug'] for t in TOPICS}
    def ic(c, w):
        if c and c not in ICONS: bad.append(f'{w}: icon {c}')
    for t in TOPICS:
        ic(t['icon'], t['slug'])
        for s in t['sections'] + t['facts'] + t['vocab']: ic(s.get('ic'), t['slug'])
        for a in t['acts']:
            for x in a.get('p', []): ic(x[0], t['slug'])
            for x in a.get('i', []): 
                if len(x) > 2 and isinstance(x[-1], str): ic(x[-1], t['slug'])
            if a['k'] in ('mc', 'fill'): assert 0 <= a['a'] < len(a['o']), (t['slug'], a['q'])
            if a['k'] == 'fill': assert '___' in a['q'], (t['slug'], a['q'])
            if a['k'] == 'odd': assert 0 <= a['a'] < len(a['i'])
        for r in t['related']:
            if r not in slugs: bad.append(f"{t['slug']}: related {r}")
        assert t['facts'] and t['vocab'] and t['acts'] and t['sections'], t['slug']
        for k in (1, 2, 3):
            if not any(a for a in t['acts'] if k in a['ts']): bad.append(f"{t['slug']}: no act tier {k}")
    return bad
