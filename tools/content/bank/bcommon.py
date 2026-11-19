# -*- coding: utf-8 -*-
import os, re, random
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
Z = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')}
RDY = {f[:-4] for f in os.listdir(ROOT + '/images/ready') if f.endswith('.svg')}
DIG = {f[:-4] for f in os.listdir(ROOT + '/images/dig') if f.endswith('.svg')}
ICONS = Z | RDY | DIG
CATS = {'arabic': 'أنشطة اللغة العربية', 'math': 'أنشطة الرياضيات', 'english': 'أنشطة اللغة الإنجليزية', 'science': 'أنشطة العلوم والاكتشاف', 'focus': 'أنشطة الإدراك والتركيز', 'motor': 'أنشطة المهارات الحركية الدقيقة', 'values': 'أنشطة القيم والسلوك', 'art': 'أنشطة الإبداع والفنون'}
LV9 = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
E2 = ['a2', 'a3']; E3 = ['a2', 'a3', 'a4']; M3 = ['a4', 'a5', 'a6']; M5 = ['a5', 'a6']; MG = ['a5', 'a6', 'g1']; A46 = ['a4', 'a5', 'a6']; G12 = ['g1', 'g2']; G34 = ['g3', 'g4']; G14 = ['g1', 'g2', 'g3', 'g4']; A56G = ['a5', 'a6', 'g1', 'g2']; ALL = LV9; A36 = ['a3', 'a4', 'a5', 'a6']
ACTS = []; _n = {}
def act(cat, typ, title, icon, lv, subject, skill, diff, descr, instr, data, rel=None):
    _n[cat] = _n.get(cat, 0) + 1
    ACTS.append(dict(slug=f'bk_{cat[:3]}{_n[cat]:02d}', cat=cat, type=typ, title=title, icon=icon, levels=lv, subject=subject, skill=skill, difficulty=diff, descr=descr, instr=instr, data=data, link=dict(href=rel[0], label=rel[1]) if rel else {}, sort=list(CATS).index(cat) * 100 + _n[cat]))
def Q(q, right, wrong, why, say=None, img=None, cnt=None, oi=None):
    d = dict(q=q, o=[right] + list(wrong), why=why)
    if say: d['say'] = say
    if img: d['img'] = img
    if cnt: d['cnt'] = list(cnt)
    if oi: d['oi'] = list(oi)
    return d
def mcq(cat, title, icon, lv, subject, skill, diff, descr, instr, qs, rel=None): act(cat, 'mcq', title, icon, lv, subject, skill, diff, descr, instr, dict(qs=qs), rel)
def match(cat, title, icon, lv, subject, skill, diff, descr, instr, pairs, rel=None): act(cat, 'match', title, icon, lv, subject, skill, diff, descr, instr, dict(pairs=[list(p) for p in pairs]), rel)
def order(cat, title, icon, lv, subject, skill, diff, descr, instr, items, rel=None): act(cat, 'order', title, icon, lv, subject, skill, diff, descr, instr, dict(items=[dict(t=i[0], i=i[1] if len(i) > 1 else None) for i in items]), rel)
def sort(cat, title, icon, lv, subject, skill, diff, descr, instr, groups, rel=None): act(cat, 'sort', title, icon, lv, subject, skill, diff, descr, instr, dict(groups=[dict(n=g[0], i=g[1], items=[dict(t=x[0], i=x[1]) for x in g[2]]) for g in groups]), rel)
def memory(cat, title, icon, lv, subject, skill, diff, descr, instr, pairs, rel=None): act(cat, 'memory', title, icon, lv, subject, skill, diff, descr, instr, dict(pairs=[list(p) for p in pairs]), rel)
def color(cat, title, icon, lv, subject, skill, diff, descr, instr, pic, tasks, rel=None): act(cat, 'color', title, icon, lv, subject, skill, diff, descr, instr, dict(pic=pic, tasks=[dict(p=t[0], c=t[1], n=t[2]) for t in tasks]), rel)
AR = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$'); ARM = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9\+\−\×\÷\=]+$'); EN = re.compile(r"^[_ء-يA-Za-z0-9\s\.\،\,\؟\?\!\:'\-]+$")
BADW = re.compile(r'غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت')
PIC_PARTS = {'house': {'wall', 'roof', 'door', 'window', 'sun'}, 'tree': {'trunk', 'leaves', 'apple', 'sky', 'grass'}, 'fish': {'body', 'tail', 'fin', 'water'}, 'flower': {'petals', 'center', 'stem', 'leaf'}}
COLORS = {'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'brown', 'pink'}
def lint():
    bad = []; seen = set()
    for a in ACTS:
        k = a['slug']; seen.add(k)
        cre = EN if a['cat'] == 'english' else ARM if a['cat'] == 'math' else AR
        def T(t, rx=cre, what=''):
            t = str(t)
            if not rx.match(t): bad.append(f'{k} txt {what} {t[:30]}')
            if BADW.search(t): bad.append(f'{k} word {t[:20]}')
        for f in ['title', 'subject', 'skill', 'descr']: T(a[f], cre if a['cat'] == 'english' else AR, f)
        T(a['instr'], AR, 'instr')
        if a['icon'] not in ICONS: bad.append(k + ' icon ' + a['icon'])
        if not a['levels'] or set(a['levels']) - set(LV9): bad.append(k + ' levels')
        d = a['data']; t = a['type']
        ic = lambda x: x is None or x in ICONS or bad.append(k + ' icon ' + str(x))
        if t == 'mcq':
            if not 3 <= len(d['qs']) <= 6: bad.append(k + ' nq')
            for q in d['qs']:
                for x in [q['q'], q['why']] + q['o'] + ([q['say']] if q.get('say') else []): T(x, cre, 'q')
                if len(set(q['o'])) != len(q['o']) or len(q['o']) not in (3, 4): bad.append(k + ' opts ' + q['q'][:15])
                if q.get('oi') and len(q['oi']) != len(q['o']): bad.append(k + ' oi len')
                for x in (q.get('oi') or []) + [q.get('img')] + ([q['cnt'][0]] if q.get('cnt') else []): ic(x)
        elif t == 'match':
            p = d['pairs']
            if not 3 <= len(p) <= 6 or len({x[0] for x in p}) != len(p) or len({x[1] for x in p}) != len(p): bad.append(k + ' pairs')
            for x in p: T(x[0], cre); T(x[1], cre); ic(x[2] if len(x) > 2 else None)
        elif t == 'order':
            it = d['items']
            if not 3 <= len(it) <= 6 or len({x['t'] for x in it}) != len(it): bad.append(k + ' order')
            for x in it: T(x['t'], cre); ic(x['i'])
        elif t == 'sort':
            g = d['groups']; allt = [x['t'] for y in g for x in y['items']]
            if not 2 <= len(g) <= 3 or len(set(allt)) != len(allt) or len(allt) < 6: bad.append(k + ' sort')
            for y in g:
                T(y['n'], cre); ic(y['i'])
                for x in y['items']: T(x['t'], cre); ic(x['i'])
        elif t == 'memory':
            p = d['pairs']
            if not 3 <= len(p) <= 6 or len({x[0] for x in p}) != len(p): bad.append(k + ' mem')
            for x in p: T(x[0], cre); ic(x[1])
        elif t == 'color':
            if d['pic'] not in PIC_PARTS: bad.append(k + ' pic')
            for x in d['tasks']:
                if x['p'] not in PIC_PARTS.get(d['pic'], ()) or x['c'] not in COLORS: bad.append(k + ' task')
                T(x['n'], AR)
        if 'a2' in a['levels'] and (t not in ('mcq', 'match', 'memory') or (t == 'mcq' and any(len(q['o']) != 3 for q in d['qs']) or t == 'match' and len(d['pairs']) > 3 or t == 'memory' and len(d['pairs']) > 3)): bad.append(k + ' a2 rules')
    return bad
def sh(l, seed):
    r = random.Random(seed); l = l[:]; r.shuffle(l); return l
