# -*- coding: utf-8 -*-
import os, re, json
from collections import deque
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')} | {f[:-4] for f in os.listdir(ROOT + '/images/dig') if f.endswith('.svg')}
CATS = {'dev': 'التعرف على الأجهزة والتقنية', 'basic': 'أساسيات استخدام الحاسوب', 'logic': 'التفكير الحاسوبي والمنطقي', 'code': 'مقدمة إلى البرمجة', 'create': 'الإبداع الرقمي', 'search': 'البحث والمعلومات', 'safe': 'السلامة والخصوصية الرقمية', 'ai': 'التعرف على الذكاء الاصطناعي'}
ITEMS = []
LA = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2']; LS = ['a3', 'a4', 'a5']; LML = ['a6', 'g1', 'g2', 'g3', 'g4']; LSM = ['a4', 'a5', 'a6', 'g1']; LL = ['g2', 'g3', 'g4']
LO = ['a4', 'a5', 'a6', 'g1', 'g2']; LOL = ['g1', 'g2', 'g3', 'g4']; LT = ['a5', 'a6', 'g1', 'g2', 'g3', 'g4']; LTA = ['a2', 'a3', 'a4']; LM = ['a2', 'a3', 'a4']
_n = {}
def _add(slug, cat, kind, title, icon, lv, step, data, fam=None):
    _n[cat] = _n.get(cat, 0) + 1
    ITEMS.append(dict(slug=slug, cat=cat, kind=kind, title=title, icon=icon, levels=lv, step=step, data=data, family=fam, sort=list(CATS).index(cat) * 100 + _n[cat]))
def LE(slug, cat, title, icon, goal, pages, chk, fam=None, lv=LA): _add(slug, cat, 'lesson', title, icon, lv, 1, dict(goal=goal, pages=[dict(t=p[0], img=p[1], k=p[2]) for p in pages], check=dict(q=chk[0], o=chk[1], a=0, why=chk[2])), fam)
def CH(slug, cat, title, icon, lv, step, scene, q, opts, fbs): _add(slug, cat, 'choose', title, icon, lv, step, dict(scene=scene, q=q, o=opts, a=0, fb=fbs))
def PA(slug, cat, title, icon, lv, step, q, seq, opts): _add(slug, cat, 'pattern', title, icon, lv, step, dict(q=q, seq=seq, o=opts, a=0))
def OR(slug, cat, title, icon, lv, step, q, steps): _add(slug, cat, 'order', title, icon, lv, step, dict(q=q, steps=steps))
def SO(slug, cat, title, icon, lv, step, q, groups, items): _add(slug, cat, 'sort', title, icon, lv, step, dict(q=q, groups=groups, items=[dict(t=x[0], g=x[1], **({'img': x[2]} if len(x) > 2 else {})) for x in items]))
def MA(slug, cat, title, icon, lv, step, q, pairs, adult=False): _add(slug, cat, 'match', title, icon, lv, step, dict(q=q, pairs=[dict(l=dict(t=p[0][0], img=p[0][1]) if isinstance(p[0], tuple) else dict(t=p[0]), r=dict(t=p[1][0], img=p[1][1]) if isinstance(p[1], tuple) else dict(t=p[1])) for p in pairs], adult=adult))
def CD(slug, cat, title, icon, lv, step, q, size, start, goal, walls, cmds): 
    par = solve(size, start, goal, walls, cmds)
    _add(slug, cat, 'code', title, icon, lv, step, dict(q=q, size=size, start=start, goal=goal, walls=walls, cmds=cmds, par=par, slots=min(par + 2, 12) if par else 0))
def TY(slug, cat, title, icon, lv, step, q, text): _add(slug, cat, 'type', title, icon, lv, step, dict(q=q, text=text))
def MK(slug, cat, title, icon, lv, step, typ, prompt, stickers): _add(slug, cat, 'make', title, icon, lv, step, dict(type=typ, prompt=prompt, stickers=stickers))
def TK(slug, cat, title, icon, lv, step, steps, fam, adult=False): _add(slug, cat, 'task', title, icon, lv, step, dict(steps=steps, adult=adult), fam)
DR = [(-1, 0), (0, 1), (1, 0), (0, -1)]
def run(size, st, walls, prog):
    r, c, d = st; W = {tuple(w) for w in walls}
    for cm in prog:
        if cm == 'l': d = (d + 3) % 4
        elif cm == 'r': d = (d + 1) % 4
        else:
            for _ in range(3 if cm == 'f3' else 1):
                r += DR[d][0]; c += DR[d][1]
                if not (0 <= r < size and 0 <= c < size) or (r, c) in W: return None
    return (r, c, d)
def solve(size, start, goal, walls, cmds):
    q = deque([(tuple(start), 0)]); seen = {tuple(start): 0}
    while q:
        s, n = q.popleft()
        if (s[0], s[1]) == tuple(goal) and n > 0: return n
        for cm in cmds:
            t = run(size, s, walls, [cm])
            if t and t not in seen: seen[t] = n + 1; q.append((t, n + 1))
    return 0
AR_RE = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$')
OKA2 = {'lesson', 'match', 'task'}
def lint():
    bad = []; slugs = set()
    def chk(s, t):
        if not AR_RE.match(str(t).strip()): bad.append(f'{s} charset «{str(t)[:30]}»')
    def ico(s, i):
        if i not in ICONS: bad.append(f'{s} icon {i}')
    for it in ITEMS:
        s, d, k = it['slug'], it['data'], it['kind']
        if s in slugs: bad.append('dup ' + s)
        slugs.add(s); ico(s, it['icon']); chk(s, it['title'])
        if it['family']: chk(s, it['family'])
        if not it['levels'] or set(it['levels']) - {'a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'}: bad.append(s + ' levels')
        if 'a2' in it['levels'] and k not in OKA2: bad.append(s + ' a2 kind')
        if 'a2' in it['levels'] and k in ('task', 'match') and not d.get('adult'): bad.append(s + ' a2 adult')
        if k in ('type', 'code', 'make', 'sort') and set(it['levels']) & {'a2', 'a3'}: bad.append(s + ' too young')
        if k == 'lesson':
            chk(s, d['goal'])
            if not 3 <= len(d['pages']) <= 4: bad.append(s + ' pages')
            if not any(p['k'] == 'example' for p in d['pages']): bad.append(s + ' no example')
            for p in d['pages']: chk(s, p['t']); ico(s, p['img'])
            c = d['check']; chk(s, c['q']); chk(s, c['why']); [chk(s, o) for o in c['o']]
            if len(set(c['o'])) != 3: bad.append(s + ' check opts')
        elif k == 'choose':
            chk(s, d['scene']); chk(s, d['q']); [chk(s, o) for o in d['o']]; [chk(s, f) for f in d['fb']]
            if len(set(d['o'])) != 3 or len(d['fb']) != 3: bad.append(s + ' opts')
        elif k == 'pattern':
            chk(s, d['q']); [ico(s, i) for i in d['seq'] + d['o']]
            if len(set(d['o'])) != 3 or len(d['seq']) < 4: bad.append(s + ' pattern')
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
            ls = [json.dumps(p['l'], ensure_ascii=False) for p in d['pairs']]; rs = [json.dumps(p['r'], ensure_ascii=False) for p in d['pairs']]
            if len(set(ls)) != len(ls) or len(set(rs)) != len(rs): bad.append(s + ' match dup')
        elif k == 'code':
            chk(s, d['q'])
            if not d['par']: bad.append(s + ' UNSOLVABLE')
            if run(d['size'], d['start'], d['walls'], []) is None or tuple(d['start'][:2]) == tuple(d['goal']): bad.append(s + ' start')
            if any(tuple(w) in (tuple(d['start'][:2]), tuple(d['goal'])) for w in d['walls']): bad.append(s + ' wall on start/goal')
        elif k == 'type':
            chk(s, d['q']); chk(s, d['text'])
        elif k == 'make':
            chk(s, d['prompt']); [ico(s, i) for i in d['stickers']]
            if d['type'] not in ('card', 'poster', 'draw', 'slides'): bad.append(s + ' make type')
        elif k == 'task':
            [chk(s, x) for x in d['steps']]
            if not 3 <= len(d['steps']) <= 5 or not it['family']: bad.append(s + ' task')
    for c in CATS:
        for lv in ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']:
            n = sum(1 for i in ITEMS if i['cat'] == c and lv in i['levels'])
            if n < 2: bad.append(f'coverage {c} {lv} = {n}')
    return bad
