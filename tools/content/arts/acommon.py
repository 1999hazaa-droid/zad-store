# -*- coding: utf-8 -*-
import os, re, json
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')}
TPL = json.load(open(ROOT + '/arts/templates.json', encoding='utf-8'))
TIDS = {t['id']: t for t in TPL['items']}
CATS = {'color': 'عالم التلوين', 'draw': 'عالم الرسم', 'craft': 'الأشغال اليدوية', 'cutpaste': 'عالم القص واللصق', 'design': 'عالم التصميم والإبداع'}
ACTS = []
BAN = ['نار', 'لهب', 'شمعة', 'حرق', 'ساخن', 'سخّن', 'تسخين', 'يغلي', 'سكين', 'إبرة', 'دبوس', 'حمض', 'كلور', 'منظف', 'تذوق', 'اشرب', 'كهرباء', 'بطارية', 'ولاعة', 'موقد', 'فرن', 'مسدس', 'شفرة', 'كتر', 'طلاء', 'بخاخ', 'سبراي', 'زيتي', 'مذيب', 'مبيد', 'دواء']
def A(slug, cat, sub, title, icon, levels, skill, summary, goal, adult, mats, steps, outcome, tips, template, pdf, links, sort):
    ACTS.append(dict(slug=slug, cat=cat, sub=sub, title=title, icon=icon, levels=levels, skill=skill, summary=summary, goal=goal, adult=adult, mats=[list(m) for m in mats], steps=[list(s) for s in steps], outcome=outcome, tips=tips, template=template, pdf=pdf, links=links, sort=sort))
def L(t, **k): return dict(type=t, **k)
TIER_OK = {'a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'}
def lint():
    bad = []
    for a in ACTS:
        txt = [m[0] for m in a['mats']] + [s[0] for s in a['steps']] + [a['summary'], a['goal'], a['outcome'], a['tips']]
        for t in txt:
            for b in BAN:
                if b in t: bad.append(f"{a['slug']}: '{b}' in «{t[:40]}»")
        if a['cat'] not in CATS: bad.append(a['slug'] + ': cat')
        if not a['levels'] or set(a['levels']) - TIER_OK: bad.append(a['slug'] + ': levels')
        if 'a2' in a['levels'] and a['adult'] != 'required': bad.append(a['slug'] + ': a2 needs adult required')
        if len(a['steps']) < 3: bad.append(a['slug'] + ': few steps')
        if a['template'] and a['template'] not in TIDS: bad.append(a['slug'] + ': template ' + a['template'])
        for ic in [a['icon']] + [m[1] for m in a['mats']] + [s[1] for s in a['steps']]:
            if ic and ic not in ICONS: bad.append(f"{a['slug']}: icon {ic}")
        if not a['pdf']: bad.append(a['slug'] + ': no pdf')
    return bad
