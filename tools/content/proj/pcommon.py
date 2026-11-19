# -*- coding: utf-8 -*-
import os, re, sys
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../bank'))
import bcommon as bc
from bcommon import ICONS, LV9, Q, AR, ARM, EN, BADW
CATS = {'science': 'العلوم والاستكشاف', 'math': 'الرياضيات', 'arabic': 'اللغة العربية', 'english': 'اللغة الإنجليزية', 'art': 'الفنون والإبداع', 'nature': 'البيئة والطبيعة', 'life': 'المهارات الحياتية'}
E2 = bc.E2; E3 = bc.E3; M3 = bc.M3; M5 = bc.M5; MG = bc.MG; A46 = bc.A46; G12 = bc.G12; G34 = bc.G34; G14 = bc.G14; A56G = bc.A56G
CHCATS = {'observe': 'الملاحظة والاكتشاف', 'think': 'الألغاز والتفكير', 'words': 'اللغة والكلمات', 'numbers': 'الأرقام والأنماط', 'create': 'الإبداع الفني'}
PJ = []; CH = []; _p = {}; _c = [0]
UNSAFE = re.compile(r'سكين|نار|موقد|إبر|مسمار|زجاج|كهرب|كيميائ|حمض|ساخن|غليان|لهب|مبيد|اشتر|حاد')
def P(cat, title, icon, lv, subject, skill, diff, minutes, descr, goal, tools, steps, safety, outcome, skills, qs, adult=False, rel=None):
    _p[cat] = _p.get(cat, 0) + 1
    PJ.append(dict(slug=f'pj_{cat[:3]}{_p[cat]:02d}', kind='project', cat=cat, type='project', title=title, icon=icon, levels=lv, subject=subject, skill=skill, difficulty=diff, descr=descr, instr=goal, minutes=minutes,
        data=dict(goal=goal, tools=tools, steps=[dict(t=s[0], i=s[1], **({'p': s[2]} if len(s) > 2 and s[2] else {})) for s in steps], safety=safety, outcome=outcome, adult=adult, skills=skills, qs=[dict(q=q[0], o=[q[1]] + list(q[2]), why=q[3]) for q in qs]),
        link=dict(href=rel[0], label=rel[1]) if rel else {}, sort=list(CATS).index(cat) * 100 + _p[cat]))
def C(cat, typ, title, icon, lv, subject, skill, diff, descr, instr, data, rel=None):
    _c[0] += 1
    CH.append(dict(slug=f'ch_{_c[0]:02d}', kind='challenge', cat=cat, type=typ, title=title, icon=icon, levels=lv, subject=subject, skill=skill, difficulty=diff, descr=descr, instr=instr, minutes=None, data=data, link=dict(href=rel[0], label=rel[1]) if rel else {}, sort=1000 + list(CHCATS).index(cat) * 100 + _c[0]))
def Cmcq(cat, title, icon, lv, subject, skill, diff, descr, instr, qs, rel=None): C(cat, 'mcq', title, icon, lv, subject, skill, diff, descr, instr, dict(qs=qs), rel)
def Cord(cat, title, icon, lv, subject, skill, diff, descr, instr, items, rel=None): C(cat, 'order', title, icon, lv, subject, skill, diff, descr, instr, dict(items=[dict(t=i[0], i=i[1] if len(i) > 1 else None) for i in items]), rel)
def Csort(cat, title, icon, lv, subject, skill, diff, descr, instr, groups, rel=None): C(cat, 'sort', title, icon, lv, subject, skill, diff, descr, instr, dict(groups=[dict(n=g[0], i=g[1], items=[dict(t=x[0], i=x[1]) for x in g[2]]) for g in groups]), rel)
def Cmem(cat, title, icon, lv, subject, skill, diff, descr, instr, pairs, rel=None): C(cat, 'memory', title, icon, lv, subject, skill, diff, descr, instr, dict(pairs=[list(p) for p in pairs]), rel)
def Cmatch(cat, title, icon, lv, subject, skill, diff, descr, instr, pairs, rel=None): C(cat, 'match', title, icon, lv, subject, skill, diff, descr, instr, dict(pairs=[list(p) for p in pairs]), rel)
def Ccolor(cat, title, icon, lv, subject, skill, diff, descr, instr, pic, tasks, rel=None): C(cat, 'color', title, icon, lv, subject, skill, diff, descr, instr, dict(pic=pic, tasks=[dict(p=t[0], c=t[1], n=t[2]) for t in tasks]), rel)
def Cdiff(cat, title, icon, lv, subject, skill, diff, descr, instr, rounds, rel=None): C(cat, 'diff', title, icon, lv, subject, skill, diff, descr, instr, dict(rounds=[dict(base=r[0], idx=r[1], alt=r[2]) for r in rounds]), rel)
def lint():
    bad = []; seen = set()
    for a in PJ + CH:
        k = a['slug']
        if k in seen: bad.append('dup ' + k)
        seen.add(k)
        cre = EN if a['cat'] == 'english' else ARM if a['cat'] == 'math' else AR
        def T(t, rx=cre, what=''):
            t = str(t)
            if not rx.match(t): bad.append(f'{k} txt {what} {t[:30]}')
            if BADW.search(t) or UNSAFE.search(t): bad.append(f'{k} word {what} {t[:24]}')
        for f in ['title', 'subject', 'skill', 'descr', 'instr']: T(a[f], cre if a['cat'] == 'english' else AR, f)
        if a['icon'] not in ICONS: bad.append(k + ' icon ' + a['icon'])
        if not a['levels'] or set(a['levels']) - set(LV9): bad.append(k + ' levels')
        if a['type'] == 'project':
            d = a['data']; young = 'a2' in a['levels'] or 'a3' in a['levels']
            for f in ('goal', 'safety', 'outcome'): T(d[f], cre, f)
            if not 2 <= len(d['tools']) <= 6: bad.append(k + ' tools')
            for x in d['tools']: T(x, cre, 'tool')
            n = len(d['steps'])
            if not (3 <= n <= 7) or (young and n > 4): bad.append(k + f' steps {n}')
            for s in d['steps']:
                T(s['t'], cre, 'step')
                if len(s['t']) > 130: bad.append(k + ' long step')
                if s['i'] not in ICONS: bad.append(k + ' sicon ' + s['i'])
                if s.get('p'): T(s['p'], cre, 'p')
            if young and (not d['adult'] or (a['minutes'] or 99) > 12): bad.append(k + ' young rules')
            if not 5 <= (a['minutes'] or 0) <= 45: bad.append(k + ' minutes')
            if not 3 <= len(d['skills']) <= 4: bad.append(k + ' skills')
            for x in d['skills']: T(x, cre, 'skill')
            if len(d['qs']) != 2: bad.append(k + ' qs')
            for q in d['qs']:
                for x in [q['q'], q['why']] + q['o']: T(x, cre, 'q')
                if len(q['o']) != 3 or len(set(q['o'])) != 3: bad.append(k + ' qopts')
        else:
            d = a['data']; t = a['type']
            if t == 'diff':
                if not 3 <= len(d['rounds']) <= 5: bad.append(k + ' rounds')
                for r in d['rounds']:
                    if len(r['base']) not in (4, 6) or not 0 <= r['idx'] < len(r['base']) or r['alt'] == r['base'][r['idx']] or len(set(r['base'])) < 3: bad.append(k + ' round')
                    for x in r['base'] + [r['alt']]:
                        if x not in ICONS: bad.append(k + ' dicon ' + x)
                if 'a2' in a['levels']: bad.append(k + ' diff a2')
            else:
                bc.ACTS = [dict(a, sort=0)]; bad += [f'{k} ' + z for z in bc.lint() if 'a2 rules' not in z or t in ('mcq', 'match', 'memory')]
                if t == 'mcq':
                    for q in d['qs']:
                        for x in q.get('seq') or []:
                            if x not in ICONS and x != '?': bad.append(k + ' seq ' + x)
    return bad

def QS(q, right, wrong, why, seq=None, oi=None, img=None, cnt=None, say=None):
    d = Q(q, right, wrong, why, say=say, img=img, cnt=cnt, oi=oi)
    if seq: d['seq'] = list(seq)
    return d
