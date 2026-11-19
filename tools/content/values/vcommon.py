# -*- coding: utf-8 -*-
import os, re, json
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')} | {f[:-4] for f in os.listdir(ROOT + '/images/ready') if f.endswith('.svg')} | {f[:-4] for f in os.listdir(ROOT + '/images/dig') if f.endswith('.svg')}
CATS = {'honesty': 'الصدق والأمانة', 'respect': 'الاحترام والتقدير', 'coop': 'التعاون والمشاركة', 'empathy': 'التعاطف ومراعاة الآخرين', 'resp': 'المسؤولية والاعتماد على النفس', 'patience': 'الصبر والانضباط', 'forgive': 'التسامح وحل الخلافات', 'clean': 'النظافة والمحافظة على البيئة', 'conf': 'الثقة بالنفس والمبادرة', 'what': 'ماذا ستفعل؟', 'chal': 'التحديات'}
LV9 = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
LS = ['a3', 'a4', 'a5', 'a6', 'g1', 'g2']          # قصة بسيطة
LS2 = ['a5', 'a6', 'g1', 'g2', 'g3', 'g4']        # قصة أعمق
LC1 = ['a4', 'a5', 'a6', 'g1', 'g2']              # موقف
LC2 = ['g1', 'g2', 'g3', 'g4']
LSO = ['a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
LOR = ['a5', 'a6', 'g1', 'g2', 'g3', 'g4']
LYG = ['a2', 'a3', 'a4']
ITEMS = []; _n = {}
def _add(slug, cat, kind, title, icon, lv, step, data, fam=None):
    _n[cat] = _n.get(cat, 0) + 1
    ITEMS.append(dict(slug=slug, cat=cat, kind=kind, title=title, icon=icon, levels=lv, step=step, data=data, family=fam, sort=(list(CATS)).index(cat) * 100 + _n[cat]))
def LE(slug, cat, title, icon, goal, pages, chk, fam=None): _add(slug, cat, 'lesson', title, icon, LV9, 1, dict(goal=goal, pages=[dict(t=p[0], img=p[1], k=p[2]) for p in pages], check=dict(q=chk[0], o=chk[1], a=0, why=chk[2])), fam)
def ST(slug, cat, title, icon, lv, step, pages, dq, opts, qq, act, fam=None): _add(slug, cat, 'story', title, icon, lv, step, dict(pages=[dict(t=p[0], img=p[1]) for p in pages], dilemma=dict(q=dq, opts=[dict(t=o[0], res=o[1]) for o in opts]), quiz=dict(q=qq[0], o=qq[1], a=0, why=qq[2]), act=act), fam)
def CH(slug, cat, title, icon, lv, step, scene, q, o, fb): _add(slug, cat, 'choose', title, icon, lv, step, dict(scene=scene, q=q, o=o, a=0, fb=fb))
def OR(slug, cat, title, icon, lv, step, q, steps): _add(slug, cat, 'order', title, icon, lv, step, dict(q=q, steps=steps))
def SO(slug, cat, title, icon, lv, step, q, groups, items): _add(slug, cat, 'sort', title, icon, lv, step, dict(q=q, groups=groups, items=[dict(t=x[0], g=x[1]) for x in items]))
def MA(slug, cat, title, icon, lv, step, q, pairs, adult=False): _add(slug, cat, 'match', title, icon, lv, step, dict(q=q, pairs=[dict(l=dict(t=p[0][0], img=p[0][1]), r=dict(t=p[1])) for p in pairs], adult=adult))
def TK(slug, cat, title, icon, step, steps, fam, lv=None): _add(slug, cat, 'task', title, icon, lv or LV9, step, dict(steps=steps, adult=True), fam)
def CL(slug, title, icon, lv, goal, days, fam): _add(slug, 'chal', 'challenge', title, icon, lv, 1, dict(goal=goal, days=days), fam)
AR_RE = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$')
BADW = re.compile(r'كاذب|سيئ|شرير|غبي|فاشل|أحمق|مخطئ دائما|عنيد|أناني|كسول')
def lint():
    bad = []; slugs = set()
    def chk(s, t):
        t = str(t).strip()
        if not AR_RE.match(t): bad.append(f'{s} charset «{t[:30]}»')
        if BADW.search(t): bad.append(f'{s} word «{t[:30]}»')
    def ico(s, i):
        if i not in ICONS: bad.append(f'{s} icon {i}')
    for it in ITEMS:
        s, d, k = it['slug'], it['data'], it['kind']
        if s in slugs: bad.append('dup ' + s)
        slugs.add(s); ico(s, it['icon']); chk(s, it['title'])
        if it['family']: chk(s, it['family'])
        L = it['levels']
        if not L or set(L) - set(LV9): bad.append(s + ' levels')
        if 'a2' in L and k not in ('lesson', 'match', 'task'): bad.append(s + ' a2 kind')
        if k == 'lesson':
            chk(s, d['goal'])
            if not 3 <= len(d['pages']) <= 4 or not any(p['k'] == 'example' for p in d['pages']): bad.append(s + ' pages')
            for p in d['pages']: chk(s, p['t']); ico(s, p['img'])
            q = d['check']; chk(s, q['q']); chk(s, q['why']); [chk(s, o) for o in q['o']]
            if len(set(q['o'])) != 3: bad.append(s + ' check opts')
        elif k == 'story':
            if len(d['pages']) != 3: bad.append(s + ' story pages')
            for p in d['pages']: chk(s, p['t']); ico(s, p['img'])
            dl = d['dilemma']; chk(s, dl['q'])
            if not 2 <= len(dl['opts']) <= 3: bad.append(s + ' opts n')
            for o in dl['opts']: chk(s, o['t']); chk(s, o['res'])
            if len({o['t'] for o in dl['opts']}) != len(dl['opts']): bad.append(s + ' dil dup')
            q = d['quiz']; chk(s, q['q']); chk(s, q['why']); [chk(s, o) for o in q['o']]
            if len(set(q['o'])) != 3: bad.append(s + ' quiz opts')
            chk(s, d['act'])
            if not it['family']: bad.append(s + ' family')
        elif k == 'choose':
            chk(s, d['scene']); chk(s, d['q']); [chk(s, o) for o in d['o']]; [chk(s, f) for f in d['fb']]
            if len(set(d['o'])) != 3 or len(d['fb']) != 3: bad.append(s + ' choose')
        elif k == 'order':
            chk(s, d['q']); [chk(s, x) for x in d['steps']]
            if not 4 <= len(d['steps']) <= 6 or len(set(d['steps'])) != len(d['steps']): bad.append(s + ' steps')
        elif k == 'sort':
            chk(s, d['q']); [chk(s, g) for g in d['groups']]
            if len(d['items']) < 6 or {x['g'] for x in d['items']} != set(range(len(d['groups']))) or len({x['t'] for x in d['items']}) != len(d['items']): bad.append(s + ' sort')
            [chk(s, x['t']) for x in d['items']]
        elif k == 'match':
            chk(s, d['q'])
            if not 3 <= len(d['pairs']) <= 4: bad.append(s + ' pairs')
            for p in d['pairs']:
                ico(s, p['l']['img']); chk(s, p['r']['t'])
                if p['l']['t']: chk(s, p['l']['t'])
            if len({p['r']['t'] for p in d['pairs']}) != len(d['pairs']) or len({p['l']['img'] for p in d['pairs']}) != len(d['pairs']): bad.append(s + ' match dup')
            if 'a2' in L and not d.get('adult'): bad.append(s + ' adult')
        elif k == 'task':
            [chk(s, x) for x in d['steps']]
            if not 3 <= len(d['steps']) <= 5 or not it['family']: bad.append(s + ' task')
        elif k == 'challenge':
            chk(s, d['goal']); [chk(s, x) for x in d['days']]
            if len(d['days']) not in (3, 5) or not it['family']: bad.append(s + ' challenge')
    return bad
