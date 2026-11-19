# -*- coding: utf-8 -*-
import os, re, json
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')}
CATS = {'hyg': 'النظافة والعناية الشخصية', 'time': 'تنظيم الوقت والمسؤوليات', 'money': 'المهارات المالية المبسطة', 'manners': 'آداب التعامل والتواصل', 'safety': 'السلامة والتصرف السليم', 'home': 'مهارات المنزل والحياة اليومية', 'think': 'التفكير وحل المشكلات', 'env': 'البيئة والمسؤولية المجتمعية'}
ITEMS = []
LA = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2']; LS = ['a3', 'a4', 'a5']; LML = ['a6', 'g1', 'g2', 'g3', 'g4']; LSM = ['a4', 'a5', 'a6', 'g1']; LL = ['g2', 'g3', 'g4']
LO = ['a4', 'a5', 'a6', 'g1', 'g2']; LOL = ['g1', 'g2', 'g3', 'g4']; LT = ['a5', 'a6', 'g1', 'g2', 'g3', 'g4']; LTA = ['a2', 'a3', 'a4']
_n = {}
def _add(slug, cat, kind, title, icon, lv, step, data, fam=None):
    _n[cat] = _n.get(cat, 0) + 1
    ITEMS.append(dict(slug=slug, cat=cat, kind=kind, title=title, icon=icon, levels=lv, step=step, data=data, family=fam, sort=list(CATS).index(cat) * 100 + _n[cat]))
def LE(slug, cat, title, icon, lv, pages, chk, fam=None): _add(slug, cat, 'lesson', title, icon, lv, 1, dict(pages=[dict(t=p[0], img=p[1]) for p in pages], check=dict(q=chk[0], o=chk[1], a=0, why=chk[2])), fam)
def CH(slug, cat, title, icon, lv, step, scene, q, opts, fbs, fam=None): _add(slug, cat, 'choose', title, icon, lv, step, dict(scene=scene, q=q, o=opts, a=0, fb=fbs), fam)
def OR(slug, cat, title, icon, lv, q, steps, fam=None): _add(slug, cat, 'order', title, icon, lv, 4, dict(q=q, steps=steps), fam)
def SO(slug, cat, title, icon, lv, q, groups, items): _add(slug, cat, 'sort', title, icon, lv, 4, dict(q=q, groups=groups, items=[dict(t=t, g=g) for t, g in items]))
def TK(slug, cat, title, icon, lv, steps, fam, adult=False): _add(slug, cat, 'task', title, icon, lv, 5, dict(steps=steps, adult=adult), fam)
AR_RE = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$')
def lint():
    bad = []; slugs = set()
    def chk(s, t):
        if not AR_RE.match(str(t).strip()): bad.append(f'{s} charset «{str(t)[:30]}»')
    for it in ITEMS:
        s, d, k = it['slug'], it['data'], it['kind']
        if s in slugs: bad.append('dup ' + s)
        slugs.add(s)
        if it['icon'] not in ICONS: bad.append(s + ' icon ' + str(it['icon']))
        if not it['levels'] or set(it['levels']) - {'a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'}: bad.append(s + ' levels')
        if 'a2' in it['levels'] and k not in ('lesson', 'task'): bad.append(s + ' a2 kind')
        if 'a2' in it['levels'] and k == 'task' and not d['adult']: bad.append(s + ' a2 needs adult')
        chk(s, it['title'])
        if it['family']: chk(s, it['family'])
        if k == 'lesson':
            if not 3 <= len(d['pages']) <= 4: bad.append(s + ' pages')
            for p in d['pages']:
                chk(s, p['t'])
                if p['img'] not in ICONS: bad.append(s + ' img ' + p['img'])
            c = d['check']; chk(s, c['q']); chk(s, c['why']); [chk(s, o) for o in c['o']]
            if len(set(c['o'])) != 3: bad.append(s + ' check opts')
        elif k == 'choose':
            chk(s, d['scene']); chk(s, d['q']); [chk(s, o) for o in d['o']]; [chk(s, f) for f in d['fb']]
            if len(d['o']) != 3 or len(set(d['o'])) != 3 or len(d['fb']) != 3: bad.append(s + ' opts/fb')
        elif k == 'order':
            chk(s, d['q'])
            if not 4 <= len(d['steps']) <= 6 or len(set(d['steps'])) != len(d['steps']): bad.append(s + ' steps')
            [chk(s, x) for x in d['steps']]
        elif k == 'sort':
            chk(s, d['q']); [chk(s, g) for g in d['groups']]
            if len(d['items']) < 6 or {x['g'] for x in d['items']} != set(range(len(d['groups']))): bad.append(s + ' sort')
            if len({x['t'] for x in d['items']}) != len(d['items']): bad.append(s + ' sort dup')
            [chk(s, x['t']) for x in d['items']]
        elif k == 'task':
            if not 3 <= len(d['steps']) <= 5: bad.append(s + ' task steps')
            [chk(s, x) for x in d['steps']]
            if not it['family']: bad.append(s + ' family')
    for c in CATS:
        for lv in ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']:
            n = sum(1 for i in ITEMS if i['cat'] == c and lv in i['levels'])
            if n < 2: bad.append(f'coverage {c} {lv} = {n}')
    return bad
