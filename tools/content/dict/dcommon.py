# -*- coding: utf-8 -*-
import os, re, sys
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../bank'))
import bcommon as bc
from bcommon import ICONS, AR, EN, BADW
TOPICS = {'letters': 'الحروف والكلمات', 'colors': 'الألوان والأشكال', 'animals': 'الحيوانات', 'food': 'الفواكه والخضروات والأطعمة', 'body': 'جسم الإنسان والحواس', 'home': 'المنزل والمدرسة', 'nature': 'الطبيعة والبيئة', 'jobs': 'المهن ووسائل النقل', 'math': 'المفاهيم الرياضية', 'feelings': 'المشاعر والسلوكيات'}
LV = {'a': ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'], 'e': ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2'], 'm': ['a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4'], 'h': ['g1', 'g2', 'g3', 'g4'], 'x': ['g3', 'g4']}
WORDS = []
NOTE = 'راجعت المنصة الكلمة والترجمة والمثال داخليا، ولم يراجعها مختص لغوي بعد.'
def W(topic, ar, en, icon, meaning, example, lv='e', sub=None, pl=None, opp=None, syn=None, seq=None, sn=None):
    first = ar.split()[0]
    core = first[2:] if first.startswith('ال') and len(first) > 4 else first
    L = core[0]; L = 'ا' if L in 'أإآ' else L
    WORDS.append(dict(topic=topic, sub=sub or topic, ar=ar, en=en, letter=L, en_letter=en[0].upper(), icon=icon, meaning=meaning, example=example, pl=pl, opp=opp, syn=syn, seq=seq, seq_n=sn, levels=LV[lv], review_note=NOTE))
def lint():
    bad = []; ars = set(); icons = {}
    for i, w in enumerate(WORDS):
        k = w['ar']
        if k in ars: bad.append('dup ' + k)
        ars.add(k)
        for f in ('ar', 'meaning', 'example', 'pl', 'syn', 'opp'):
            if w[f] and not AR.match(w[f]): bad.append(f'{k} charset {f}: {w[f][:30]}')
            if w[f] and BADW.search(w[f]): bad.append(f'{k} badword {f}')
        if not EN.match(w['en']) or re.search(r'[ء-ي]', w['en']): bad.append(k + ' en')
        if w['icon'] not in ICONS: bad.append(k + ' icon ' + w['icon'])
        key = (w['sub'], w['icon'])
        if key in icons: bad.append(f'{k} icon duplicates {icons[key]} in {w["sub"]}')
        icons[key] = k
        stem = w['ar'].split()[0]
        stem = re.sub(r'[ةي]$', '', stem) if len(stem) > 3 else stem
        if stem.startswith('ال') and len(stem) > 4: stem = stem[2:]
        if stem not in w['example']: bad.append(f'{k} example lacks word: {w["example"]}')
        if len(w['meaning']) > 90 or len(w['example']) > 70: bad.append(k + ' long')
        if len(w['meaning']) < 8: bad.append(k + ' short meaning')
    for w in WORDS:
        if w['opp'] and w['opp'] not in ars: bad.append(w['ar'] + ' opp missing ' + w['opp'])
    return bad
