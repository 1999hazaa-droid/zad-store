# -*- coding: utf-8 -*-
import os, re
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')} | {f[:-4] for f in os.listdir(ROOT + '/images/ready') if f.endswith('.svg')} | {f[:-4] for f in os.listdir(ROOT + '/images/dig') if f.endswith('.svg')}
CATS = {'letters': 'أناشيد الحروف واللغة العربية', 'math': 'أناشيد الأرقام والرياضيات', 'colors': 'أناشيد الألوان والأشكال', 'english': 'أناشيد اللغة الإنجليزية', 'nature': 'أناشيد الحيوانات والطبيعة', 'science': 'أناشيد العلوم والاكتشاف', 'values': 'أناشيد السلوك والقيم', 'routine': 'أناشيد الروتين اليومي'}
LV9 = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
Y = ['a2', 'a3']; YM = ['a2', 'a3', 'a4']; M = ['a4', 'a5', 'a6']; MG = ['a4', 'a5', 'a6', 'g1', 'g2']; G12 = ['g1', 'g2']; G34 = ['g3', 'g4']; ALL = LV9
SONGS = []
def S(slug, cat, title, icon, lv, skill, lines, quiz):
    SONGS.append(dict(slug=slug, cat=cat, title=title, icon=icon, levels=lv, skill=skill, lyrics=lines, quiz=dict(q=quiz[0], o=quiz[1], a=0, why=quiz[2]), sort=list(CATS).index(cat) * 100 + len([x for x in SONGS if x['cat'] == cat]) + 1))
AR = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$'); EN = re.compile(r'^[A-Za-z0-9\s\.\,\?\!\'\-]+$')
BADW = re.compile(r'غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت')
def lint():
    bad = []; seen = set()
    for s in SONGS:
        k = s['slug']
        if k in seen: bad.append('dup ' + k)
        seen.add(k)
        if s['icon'] not in ICONS: bad.append(k + ' icon')
        if not s['levels'] or set(s['levels']) - set(LV9): bad.append(k + ' levels')
        if not 4 <= len(s['lyrics']) <= 8: bad.append(k + ' lines')
        for t in [s['title'], s['skill'], s['quiz']['q'], s['quiz']['why']] + s['quiz']['o']:
            if not AR.match(t) and not (s['cat'] == 'english' and (EN.match(t) or re.match(r'^[ء-يA-Za-z0-9\s\.\،\؟\!\:\-\']+$', t))): bad.append(k + ' txt ' + t[:25])
            if BADW.search(t): bad.append(k + ' word ' + t[:20])
        for t in s['lyrics']:
            ok = AR.match(t) or (s['cat'] == 'english' and re.match(r'^[ء-يA-Za-z0-9\s\.\،\؟\!\:\-\'\,]+$', t))
            if not ok: bad.append(k + ' lyric ' + t[:25])
            if BADW.search(t): bad.append(k + ' lyric word ' + t[:20])
        if len(set(s['quiz']['o'])) != 3: bad.append(k + ' quiz opts')
        if len(set(s['lyrics'])) < len(s['lyrics']) - 1: bad.append(k + ' dup lines')
    return bad
