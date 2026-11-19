# -*- coding: utf-8 -*-
import os, re, json
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')}
ITEMS = []
T1 = ['a3', 'a4']; T1b = ['a4', 'a5']; T2 = ['a5', 'a6', 'g1', 'g2']; T2b = ['a6', 'g1', 'g2']; T3 = ['g3', 'g4']; T23 = ['g1', 'g2', 'g3', 'g4']
def I(slug, lang, kind, cat, title, icon, levels, skill, data, sort):
    ITEMS.append(dict(slug=slug, lang=lang, kind=kind, cat=cat, title=title, icon=icon, levels=levels, skill=skill, data=data, sort=sort))
def ORD(slug, lang, title, icon, levels, words, sort): I(slug, lang, 'order', 'sentences', title, icon, levels, 'ترتيب الكلمات وتكوين الجملة' if lang == 'ar' else 'ترتيب الكلمات وتكوين جملة إنجليزية', dict(words=words), sort)
def FILL(slug, lang, title, icon, levels, s, o, a, skill, sort): I(slug, lang, 'fill', 'fill', title, icon, levels, skill, dict(s=s, o=o, a=a), sort)
def PAS(slug, lang, title, icon, levels, text, vocab, qs, events, sort):
    d = dict(text=text, vocab=vocab, qs=[dict(q=q[0], o=q[1], a=q[2]) for q in qs])
    if events: d['events'] = events
    I(slug, lang, 'passage', 'reading', title, icon, levels, 'القراءة وفهم المقروء' if lang == 'ar' else 'قراءة نص إنجليزي قصير وفهمه', d, sort)
def OPP(slug, lang, title, icon, levels, pairs, sort): I(slug, lang, 'opp', 'opposites', title, icon, levels, 'الكلمات المتقابلة', dict(pairs=pairs), sort)
def ODD(slug, lang, title, icon, levels, qs, sort): I(slug, lang, 'odd', 'odd', title, icon, levels, 'التصنيف واكتشاف الكلمة المختلفة', dict(qs=[dict(items=q[0], a=q[1], why=q[2]) for q in qs]), sort)
def WRT(slug, lang, title, icon, levels, prompt, words, sort): I(slug, lang, 'write', 'writing', title, icon, levels, 'الكتابة والتعبير عن الصورة' if lang == 'ar' else 'كتابة جملة إنجليزية قصيرة', dict(prompt=prompt, words=words), sort)
AR_RE = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$'); EN_RE = re.compile(r"^[A-Za-z0-9\s\.\,\?\!\'\-]+$")
def lint():
    bad = []; slugs = set()
    for it in ITEMS:
        s = it['slug']
        if s in slugs: bad.append('dup ' + s)
        slugs.add(s)
        if it['icon'] and it['icon'] not in ICONS: bad.append(s + ' icon ' + str(it['icon']))
        if not it['levels'] or set(it['levels']) - {'a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'}: bad.append(s + ' levels')
        RE = AR_RE if it['lang'] == 'ar' else EN_RE
        def chk(t):
            if not RE.match(t.strip()): bad.append(f'{s} charset «{t[:30]}»')
        d = it['data']; k = it['kind']
        if k == 'order':
            if len(d['words']) < 3 or len(set(d['words'])) != len(d['words']): bad.append(s + ' order words')
            for w in d['words']: chk(w)
        elif k == 'fill':
            if d['s'].count('___') != 1: bad.append(s + ' blank')
            if not 0 <= d['a'] < len(d['o']) or len(set(d['o'])) != len(d['o']) or len(d['o']) < 3: bad.append(s + ' opts')
            chk(d['s'].replace('___', 'ـ' if it['lang'] == 'ar' else 'x')); [chk(o) for o in d['o']]
        elif k == 'passage':
            chk(d['text']); 
            if len(d['qs']) < 2: bad.append(s + ' few qs')
            for q in d['qs']:
                chk(q['q']); [chk(o) for o in q['o']]
                if not 0 <= q['a'] < len(q['o']) or len(set(q['o'])) != len(q['o']): bad.append(s + ' q opts')
            for v in d['vocab']: chk(v[0])
            if 'events' in d and len(d['events']) < 3: bad.append(s + ' events')
            if 'events' in d: [chk(e) for e in d['events']]
        elif k == 'opp':
            if len(d['pairs']) < 5: bad.append(s + ' pairs')
            allw = [w for p in d['pairs'] for w in p]
            if len(set(allw)) != len(allw): bad.append(s + ' dup words in pairs')
            [chk(w) for w in allw]
        elif k == 'odd':
            for q in d['qs']:
                if len(q['items']) != 4 or not 0 <= q['a'] < 4 or len(set(q['items'])) != 4: bad.append(s + ' odd')
                [chk(w) for w in q['items']]
        elif k == 'write':
            if len(d['words']) < 2: bad.append(s + ' words')
            [chk(w) for w in d['words']]
    return bad
