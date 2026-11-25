# -*- coding: utf-8 -*-
import os, re, sys, random, json
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
sys.path.insert(0, ROOT + '/tools/content/dict'); sys.path.insert(0, ROOT + '/tools/content/bank')
import dcommon as dc, d_words
from bcommon import ICONS
WD = {w['ar']: w for w in dc.WORDS}
LV9 = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
CATS = ['early', 'arabic', 'math', 'english', 'science', 'values']
QZ = []; _n = {}
HK = 'ً-ْ'  # الحركات: تُسمح فقط في اختبار الحركات
AR = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9ـ]+$'); ARM = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9\+\−\×\÷\=ـ]+$')
ENR = re.compile(r"^[_ء-يA-Za-z0-9\s\.\،\,\؟\?\!\:'\-]+$"); ARH = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9ـ' + HK + ']+$')
BADW = re.compile(r'غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت|خطأ فادح')
def ic(ar):
    return WD[ar]['icon']
def sk(s): return s
def MC(q, right, wrong, why, s, img=None, say=None, oi=None, cnt=None, ps=None):
    d = dict(t='mc', q=q, o=[right] + list(wrong), why=why, sk=s)
    for k, v in (('img', img), ('say', say), ('oi', oi), ('cnt', cnt), ('ps', ps)):
        if v: d[k] = v
    return d
def FILL(q, right, wrong, why, s, img=None): return dict(MC(q, right, wrong, why, s, img=img), t='fill')
def PIC(ar, wrong, s, q=None, labels=True):
    ws = [ar] + list(wrong)
    return dict(t='pic', q=q or 'أين صورة %s؟' % ar, o=[ic(x) for x in ws], nm=[x for x in ws] if labels else [], why='هذه صورة %s.' % ar, sk=s, say=ar)
def PICI(q, right_icon, wrong_icons, why, s, nm=None, say=None):
    d = dict(t='pic', q=q, o=[right_icon] + list(wrong_icons), nm=nm or [], why=why, sk=s)
    if say: d['say'] = say
    return d
def TF(q, a, why, s): return dict(t='tf', q=q, a=bool(a), why=why, sk=s)
def LISTEN(say, q, right, wrong, why, s, en=False, icons=False):
    d = dict(t='listen', say=say, q=q, o=[right] + list(wrong), why=why, sk=s)
    if en: d['en'] = True
    if icons: d['oi'] = True
    return d
def MATCH(q, pairs, why, s):  # pairs: (left text, right text or None, right icon or None)
    return dict(t='match', q=q, pairs=[list(p) for p in pairs], why=why, sk=s)
def DND(q, groups, why, s):  # groups: (name, icon|None, [(text, icon|None)])
    gs = [dict(n=g[0], i=g[1]) for g in groups]; its = []
    for gi, g in enumerate(groups):
        for x in g[2]: its.append(dict(t=x[0], i=x[1], g=gi))
    return dict(t='dnd', q=q, groups=gs, items=its, why=why, sk=s)
def ORD(q, items, why, s): return dict(t='order', q=q, items=[dict(t=x[0], i=(x[1] if len(x) > 1 else None)) for x in items], why=why, sk=s)
def BUILD(word, s, img=None, q=None, en=False):
    d = dict(t='build', q=q or 'رتب الحروف لتكوين الكلمة', w=word, why='الكلمة هي %s.' % word, sk=s)
    if img: d['img'] = img
    if en: d['en'] = True
    return d
def PROB(q, icon, a, b, op, wrong, s):
    r = a + b if op == '+' else a - b
    assert r >= 0 and r not in wrong and len(set(wrong)) == len(wrong)
    return dict(t='prob', q=q, pr=dict(i=icon, a=a, b=b, op=op), o=[str(r)] + [str(x) for x in wrong], why='%d %s %d = %d' % (a, '+' if op == '+' else '−', b, r), sk=s)
def SEQ(q, seq, right, wrong, why, s):  # right/wrong: (label, icon)
    o = [right] + list(wrong)
    return dict(t='mc', q=q, seq=list(seq), o=[x[0] for x in o], oi=[x[1] for x in o], why=why, sk=s)
def OBS(q, items, correct, why, s):
    return dict(t='obs', q=q, items=[dict(i=x[0], t=(x[1] if len(x) > 1 else None)) for x in items], c=list(correct), why=why, sk=s)
def MEM(ics, s, q='اقلب البطاقات وابحث عن كل صورتين متشابهتين'): return dict(t='mem', q=q, ic=list(ics), why='أحسنت، وجدت كل الأزواج.', sk=s)
def CNT(q, icon, n, wrong, s, why=None):
    return dict(t='mc', q=q, cnt=[icon, n], o=[str(n)] + [str(x) for x in wrong], why=why or 'العدد هو %d.' % n, sk=s)
def quiz(cat, title, icon, lv, subject, skill, diff, descr, qs, link, tags=(), minutes=None, hk=False, en=False, math=False):
    _n[cat] = _n.get(cat, 0) + 1
    QZ.append(dict(slug='q_%s%02d' % (cat[:3], _n[cat]), cat=cat, title=title, icon=icon, levels=lv, subject=subject, skill=skill, difficulty=diff, descr=descr, qs=qs, link=dict(href=link[0], label=link[1]), tags=list(tags) + (['tashkeel'] if hk and 'tashkeel' not in tags else []), minutes=minutes or max(2, round(len(qs) * 0.5)), hk=hk, en=en, math=math, sort=CATS.index(cat) * 100 + _n[cat]))
def lint():
    bad = []; seen = set()
    for z in QZ:
        k = z['slug']
        rx = ARH if z['hk'] else (ENR if z['en'] else (ARM if z['math'] else AR))
        rxs = ENR if z['en'] else (ARH if z['hk'] else (ARM if z['math'] else AR))
        def T(t, what='', r=None):
            t = str(t)
            if not (r or rxs).match(t): bad.append(f'{k} charset {what}: {t[:40]}')
            if BADW.search(t): bad.append(f'{k} badword {t[:30]}')
        for f in ('title', 'subject', 'skill', 'descr'): T(z[f], f, ENR if z['en'] and f in ('descr',) else AR if f != 'skill' else rxs)
        if z['icon'] not in ICONS: bad.append(k + ' icon ' + z['icon'])
        if not z['levels'] or set(z['levels']) - set(LV9): bad.append(k + ' levels')
        if not 4 <= len(z['qs']) <= 10: bad.append(k + ' nq %d' % len(z['qs']))
        hrefp = os.path.join(ROOT, z['link']['href'].split('?')[0], 'index.html')
        if not os.path.exists(hrefp): bad.append(k + ' link ' + z['link']['href'])
        T(z['link']['label'], 'linklabel', AR)
        young = bool(set(z['levels']) & {'a2', 'a3'})
        for i, q in enumerate(z['qs']):
            w = f'{k}#{i+1}'; t = q['t']
            for f in ('q', 'why', 'sk'): T(q[f], f + ' ' + w, AR if f == 'sk' and not z['en'] else None)
            if t in ('mc', 'fill', 'listen', 'prob'):
                o = q['o']
                if len(set(o)) != len(o) or not 2 <= len(o) <= 4: bad.append(w + ' opts')
                for x in o:
                    if not (t == 'listen' and q.get('oi')): T(x, 'opt ' + w)
                if t in ('mc', 'fill') and q.get('ps'): T(q['ps'], 'ps ' + w)
                if t == 'mc' and q.get('oi'):
                    if len(q['oi']) != len(o): bad.append(w + ' oi len')
                    for x in q['oi']:
                        if x not in ICONS: bad.append(w + ' icon ' + str(x))
                if q.get('img') and q['img'] not in ICONS: bad.append(w + ' img ' + str(q['img']))
                for x in q.get('seq') or []:
                    if x not in ICONS: bad.append(w + ' seq icon ' + x)
                if q.get('cnt') and q['cnt'][0] not in ICONS: bad.append(w + ' cnt icon')
                if t == 'listen' and q.get('oi'):
                    for x in o:
                        if x not in ICONS: bad.append(w + ' listen icon ' + x)
                if t == 'prob' and q['pr']['i'] not in ICONS: bad.append(w + ' pr icon')
                if t == 'fill' and '___' not in q['q']: bad.append(w + ' fill blank')
                if young and len(o) > 3: bad.append(w + ' young opts')
            elif t == 'pic':
                if len(q['o']) not in (3, 4) or len(set(q['o'])) != len(q['o']): bad.append(w + ' pic opts')
                if young and len(q['o']) > 3: bad.append(w + ' young pic opts')
                for x in q['o']:
                    if x not in ICONS: bad.append(w + ' pic icon ' + x)
                for x in q['nm']: T(x, 'nm ' + w)
            elif t == 'tf':
                if young: bad.append(w + ' tf for young')
            elif t == 'match':
                p = q['pairs']
                if not 3 <= len(p) <= 5 or len({x[0] for x in p}) != len(p) or len({(x[1], x[2]) for x in p}) != len(p): bad.append(w + ' pairs')
                if young and len(p) > 3: bad.append(w + ' young pairs')
                for x in p:
                    T(x[0], 'pl ' + w)
                    if x[1]: T(x[1], 'pr ' + w)
                    if x[2] and x[2] not in ICONS: bad.append(w + ' micon ' + x[2])
                    if not x[1] and not x[2]: bad.append(w + ' empty pair')
            elif t == 'dnd':
                for it in q['items']:
                    T(it['t'], 'dnd ' + w)
                    if it['i'] and it['i'] not in ICONS: bad.append(w + ' dicon ' + it['i'])
                for g in q['groups']:
                    T(g['n'], 'g ' + w)
                    if g['i'] and g['i'] not in ICONS: bad.append(w + ' gicon')
                if len({x['t'] for x in q['items']}) != len(q['items']) or not 3 <= len(q['items']) <= 6 or len(q['groups']) != 2 and len(q['groups']) != 3: bad.append(w + ' dnd shape')
                if young and len(q['items']) > 4: bad.append(w + ' young dnd')
            elif t == 'order':
                it = q['items']
                if not 3 <= len(it) <= 6 or len({x['t'] for x in it}) != len(it): bad.append(w + ' order')
                for x in it:
                    T(x['t'], 'ord ' + w)
                    if x['i'] and x['i'] not in ICONS: bad.append(w + ' oicon')
            elif t == 'build':
                if not 3 <= len(q['w']) <= 8 or len(set(q['w'])) < 3: bad.append(w + ' build ' + q['w'])
                T(q['w'], 'bw ' + w)
                if q.get('img') and q['img'] not in ICONS: bad.append(w + ' bicon')
            elif t == 'obs':
                if not q['c'] or len(q['items']) not in (4, 5, 6) or max(q['c']) >= len(q['items']) or len(q['c']) >= len(q['items']): bad.append(w + ' obs')
                for x in q['items']:
                    if x['i'] not in ICONS: bad.append(w + ' obs icon ' + str(x['i']))
                    if x['t']: T(x['t'], 'obt ' + w)
            elif t == 'mem':
                if len(set(q['ic'])) != len(q['ic']) or not 3 <= len(q['ic']) <= 6: bad.append(w + ' mem')
                if young and len(q['ic']) > 3: bad.append(w + ' young mem')
                for x in q['ic']:
                    if x not in ICONS: bad.append(w + ' mem icon ' + x)
            else: bad.append(w + ' type ' + t)
        if k in seen: bad.append('dup ' + k)
        seen.add(k)
    return bad
