# -*- coding: utf-8 -*-
import os, re, json
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')} | {f[:-4] for f in os.listdir(ROOT + '/images/ready') if f.endswith('.svg')} | {f[:-4] for f in os.listdir(ROOT + '/images/dig') if f.endswith('.svg')}
CATS = {'lang': 'الاستعداد اللغوي', 'math': 'الاستعداد الرياضي', 'percep': 'المهارات الإدراكية', 'focus': 'التركيز والذاكرة', 'motor': 'المهارات الحركية الدقيقة', 'social': 'الاستعداد النفسي والاجتماعي', 'indep': 'الاستقلالية والمهارات التنظيمية'}
AREAS = ['letters', 'numbers', 'shapes', 'sorting', 'listening', 'memory', 'motor']
TRACES = ['line', 'wave', 'zigzag', 'circle', 'square', 'triangle']
ITEMS = []; _n = {}
LV7 = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2']
L2 = ['a2', 'a3', 'a4']; L3 = ['a4', 'a5', 'a6', 'g1', 'g2']; L4 = ['a3', 'a4', 'a5']; L5 = ['a6', 'g1', 'g2']; L6 = ['a4', 'a5', 'a6', 'g1', 'g2']; L7 = ['a5', 'a6', 'g1', 'g2']; L8 = ['g1', 'g2']; L9 = ['a2', 'a3', 'a4']
def _add(slug, cat, kind, title, icon, lv, step, data, fam=None):
    _n[cat] = _n.get(cat, 0) + 1
    ITEMS.append(dict(slug=slug, cat=cat, kind=kind, title=title, icon=icon, levels=lv, step=step, data=data, family=fam, sort=(list(CATS) + ['day', 'chk']).index(cat) * 100 + _n[cat]))
def LE(slug, cat, title, icon, goal, pages, chk, fam=None): _add(slug, cat, 'lesson', title, icon, LV7, 1, dict(goal=goal, pages=[dict(t=p[0], img=p[1], k=p[2]) for p in pages], check=dict(q=chk[0], o=chk[1], a=0, why=chk[2])), fam)
def CH(slug, cat, title, icon, lv, step, scene, q, o, fb, area=None):
    d = dict(scene=scene, q=q, o=o, a=0, fb=fb)
    if area: d['area'] = area
    _add(slug, cat, 'choose', title, icon, lv, step, d)
def OD(slug, cat, title, icon, lv, step, q, same, odd, area=None): _add(slug, cat, 'odd', title, icon, lv, step, dict(q=q, same=same, odd=odd, **({'area': area} if area else {})))
def QU(slug, cat, title, icon, lv, step, q, groups, o, area=None): _add(slug, cat, 'quant', title, icon, lv, step, dict(q=q, groups=[dict(img=g[0], n=g[1]) for g in groups], o=o, a=0, **({'area': area} if area else {})))
def PA(slug, cat, title, icon, lv, step, q, seq, o, area=None): _add(slug, cat, 'pattern', title, icon, lv, step, dict(q=q, seq=seq, o=o, a=0, **({'area': area} if area else {})))
def ME(slug, cat, title, icon, lv, step, q, icons): _add(slug, cat, 'memory', title, icon, lv, step, dict(q=q, icons=icons))
def MA(slug, cat, title, icon, lv, step, q, pairs, adult=False): _add(slug, cat, 'match', title, icon, lv, step, dict(q=q, pairs=[dict(l=dict(t=p[0][0], img=p[0][1]), r=(dict(t=p[1][0], img=p[1][1]) if isinstance(p[1], tuple) else dict(t=p[1]))) for p in pairs], adult=adult))
def OR(slug, cat, title, icon, lv, step, q, steps): _add(slug, cat, 'order', title, icon, lv, step, dict(q=q, steps=steps))
def SO(slug, cat, title, icon, lv, step, q, groups, items): _add(slug, cat, 'sort', title, icon, lv, step, dict(q=q, groups=groups, items=[dict(t=x[0], g=x[1], **({'img': x[2]} if len(x) > 2 else {})) for x in items]))
def TR(slug, cat, title, icon, lv, step, q, shape, area=None): _add(slug, cat, 'trace', title, icon, lv, step, dict(q=q, shape=shape, **({'area': area} if area else {})))
def FO(slug, cat, title, icon, lv, step, q, imgs, ph, seq, hide=False, area=None): _add(slug, cat, 'follow', title, icon, lv, step, dict(q=q, imgs=imgs, ph=ph, seq=seq, hide=hide, **({'area': area} if area else {})))
def TK(slug, cat, title, icon, step, steps, fam, lv=L9): _add(slug, cat, 'task', title, icon, lv, step, dict(steps=steps, adult=True), fam)
AR_RE = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$')
OKA2 = {'lesson', 'match', 'task', 'odd'}; OKA3 = OKA2 | {'memory', 'quant', 'choose', 'trace', 'follow'}
def lint():
    bad = []; slugs = set()
    def chk(s, t):
        if not AR_RE.match(str(t).strip()): bad.append(f'{s} charset «{str(t)[:30]}»')
    def ico(s, i):
        if i not in ICONS: bad.append(f'{s} icon {i}')
    for it in ITEMS:
        s, d, k, c = it['slug'], it['data'], it['kind'], it['cat']
        if s in slugs: bad.append('dup ' + s)
        slugs.add(s); ico(s, it['icon']); chk(s, it['title'])
        if it['family']: chk(s, it['family'])
        if not it['levels'] or set(it['levels']) - set(LV7): bad.append(s + ' levels')
        if 'a2' in it['levels'] and k not in OKA2: bad.append(s + ' a2 kind')
        if 'a3' in it['levels'] and k not in OKA3: bad.append(s + ' a3 kind')
        if k in ('match', 'task') and 'a2' in it['levels'] and not d.get('adult'): bad.append(s + ' adult')
        if k == 'lesson':
            chk(s, d['goal'])
            if not 3 <= len(d['pages']) <= 4 or not any(p['k'] == 'example' for p in d['pages']): bad.append(s + ' pages')
            for p in d['pages']: chk(s, p['t']); ico(s, p['img'])
            q = d['check']; chk(s, q['q']); chk(s, q['why']); [chk(s, o) for o in q['o']]
            if len(set(q['o'])) != 3: bad.append(s + ' check opts')
        elif k in ('choose', 'quant', 'pattern'):
            chk(s, d['q']); [chk(s, o) for o in d['o']] if k != 'pattern' else None
            if len(set(d['o'])) != 3: bad.append(s + ' opts')
            if k == 'choose':
                chk(s, d['scene']); [chk(s, f) for f in d['fb']]
                if len(d['fb']) != 3: bad.append(s + ' fb')
            if k == 'quant':
                if not 1 <= len(d['groups']) <= 2 or any(not 1 <= g['n'] <= 9 for g in d['groups']): bad.append(s + ' groups')
                [ico(s, g['img']) for g in d['groups']]
                if len(d['groups']) == 2 and d['groups'][0]['n'] <= d['groups'][1]['n'] and d['o'][0] == 'المجموعة الأولى': bad.append(s + ' quant logic')
            if k == 'pattern':
                [ico(s, i) for i in d['seq'] + d['o']]
                if len(d['seq']) < 4: bad.append(s + ' seq')
        elif k == 'odd':
            chk(s, d['q']); ico(s, d['same']); ico(s, d['odd'])
            if d['same'] == d['odd']: bad.append(s + ' odd=same')
        elif k == 'memory':
            chk(s, d['q']); [ico(s, i) for i in d['icons']]
            if not 3 <= len(d['icons']) <= 6 or len(set(d['icons'])) != len(d['icons']): bad.append(s + ' memory')
        elif k == 'order':
            chk(s, d['q']); [chk(s, x) for x in d['steps']]
            if not 4 <= len(d['steps']) <= 6 or len(set(d['steps'])) != len(d['steps']): bad.append(s + ' steps')
        elif k == 'sort':
            chk(s, d['q']); [chk(s, g) for g in d['groups']]
            if len(d['items']) < 6 or {x['g'] for x in d['items']} != set(range(len(d['groups']))) or len({x['t'] for x in d['items']}) != len(d['items']): bad.append(s + ' sort')
            for x in d['items']:
                chk(s, x['t'])
                if x.get('img'): ico(s, x['img'])
        elif k == 'match':
            chk(s, d['q'])
            if not 3 <= len(d['pairs']) <= 4: bad.append(s + ' pairs')
            for p in d['pairs']:
                for side in ('l', 'r'):
                    t = p[side].get('t'); i = p[side].get('img')
                    if t: chk(s, t)
                    if i: ico(s, i)
                    if not t and not i: bad.append(s + ' empty side')
            for side in ('l', 'r'):
                v = [json.dumps(p[side], ensure_ascii=False) for p in d['pairs']]
                if len(set(v)) != len(v): bad.append(s + ' match dup')
        elif k == 'trace':
            chk(s, d['q'])
            if d['shape'] not in TRACES: bad.append(s + ' shape')
        elif k == 'follow':
            chk(s, d['q']); [ico(s, i) for i in d['imgs']]; [chk(s, p) for p in d['ph']]
            if not 4 <= len(d['imgs']) <= 6 or len(d['ph']) != len(d['imgs']) or len(set(d['imgs'])) != len(d['imgs']): bad.append(s + ' follow imgs')
            if not 2 <= len(d['seq']) <= 3 or len(set(d['seq'])) != len(d['seq']) or any(not 0 <= i < len(d['imgs']) for i in d['seq']): bad.append(s + ' follow seq')
        elif k == 'task':
            [chk(s, x) for x in d['steps']]
            if not 3 <= len(d['steps']) <= 5 or not it['family']: bad.append(s + ' task')
        if c == 'chk':
            if d.get('area') not in AREAS: bad.append(s + ' area')
            if k not in ('choose', 'odd', 'quant', 'follow', 'trace', 'pattern'): bad.append(s + ' chk kind')
            if set(it['levels']) != {'a4', 'a5', 'a6', 'g1', 'g2'}: bad.append(s + ' chk levels')
    for c in CATS:
        for lv in LV7:
            n = sum(1 for i in ITEMS if i['cat'] == c and lv in i['levels'])
            if n < 2: bad.append(f'coverage {c} {lv} = {n}')
    if sum(1 for i in ITEMS if i['cat'] == 'day') != 8: bad.append('day != 8')
    for a in AREAS:
        if sum(1 for i in ITEMS if i['cat'] == 'chk' and i['data'].get('area') == a) != 3: bad.append('chk area ' + a)
    return bad
