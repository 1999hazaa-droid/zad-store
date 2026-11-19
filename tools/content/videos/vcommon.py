# -*- coding: utf-8 -*-
import os, re
D = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.abspath(D + '/../../..')
ICONS = {f[:-5] for f in os.listdir(ROOT + '/images/zad') if f.endswith('.webp')} | {f[:-4] for f in os.listdir(ROOT + '/images/ready') if f.endswith('.svg')} | {f[:-4] for f in os.listdir(ROOT + '/images/dig') if f.endswith('.svg')}
CATS = {'letters': 'الحروف واللغة العربية', 'math': 'الأرقام والرياضيات', 'english': 'اللغة الإنجليزية', 'science': 'العلوم والطبيعة', 'living': 'الحيوانات والنباتات', 'body': 'جسم الإنسان والصحة', 'space': 'الفضاء والاكتشاف', 'values': 'القيم والسلوك الإيجابي', 'life': 'المهارات الحياتية', 'ready': 'الاستعداد المدرسي', 'art': 'الرسم والأشغال الفنية', 'songs': 'الأناشيد التعليمية', 'review': 'المراجعة والشرح المدرسي'}
LINKS = {'letters': ('language/', 'بطاقات وأنشطة اللغة'), 'math': ('tests/', 'التمارين والاختبارات'), 'english': ('language/', 'مفردات وأنشطة اللغة'), 'science': ('wiki/', 'الموسوعة التعليمية'), 'living': ('explore/?c=animals', 'عالم الحيوانات والنباتات'), 'body': ('explore/?c=body', 'جسم الإنسان والحواس'), 'space': ('explore/?c=space', 'الفضاء والكواكب'), 'values': ('values/', 'القصص والأنشطة التربوية'), 'life': ('life/', 'المهارات الحياتية'), 'ready': ('ready/', 'الاستعداد المدرسي'), 'art': ('arts/', 'عالم الإبداع والفنون'), 'songs': ('songs/', 'الأناشيد التعليمية'), 'review': ('summaries/', 'الملخصات والمراجعات')}
LV9 = ['a2', 'a3', 'a4', 'a5', 'a6', 'g1', 'g2', 'g3', 'g4']
Y = ['a2', 'a3']; YM = ['a2', 'a3', 'a4']; M = ['a4', 'a5', 'a6']; MG = ['a4', 'a5', 'a6', 'g1', 'g2']; G12 = ['g1', 'g2']; G34 = ['g3', 'g4']; G14 = ['g1', 'g2', 'g3', 'g4']; ALL = LV9
VIDS = []
def V(slug, cat, title, icon, lv, subject, skill, descr, scenes, quiz):
    VIDS.append(dict(slug=slug, cat=cat, title=title, icon=icon, levels=lv, subject=subject, skill=skill, descr=descr, scenes=[dict(t=s[0], img=s[1]) for s in scenes], quiz=dict(q=quiz[0], o=quiz[1], a=0, why=quiz[2]), link=dict(href=LINKS[cat][0], label=LINKS[cat][1]), duration=len(scenes) * 8, sort=list(CATS).index(cat) * 100 + len([x for x in VIDS if x['cat'] == cat]) + 1))
AR = re.compile(r'^[ء-ي٠-٩\s\.\،\؟\!\:\-0-9]+$'); EN = re.compile(r'^[ء-يA-Za-z0-9\s\.\،\,\؟\?\!\:\'\-]+$')
BADW = re.compile(r'غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت')
def lint():
    bad = []; seen = set()
    for v in VIDS:
        k = v['slug']
        if k in seen: bad.append('dup ' + k)
        seen.add(k)
        ok = EN if v['cat'] == 'english' else AR
        if v['icon'] not in ICONS: bad.append(k + ' icon')
        if not v['levels'] or set(v['levels']) - set(LV9): bad.append(k + ' levels')
        if not 4 <= len(v['scenes']) <= 6: bad.append(k + ' scenes')
        for t in [v['title'], v['subject'], v['skill'], v['descr'], v['quiz']['q'], v['quiz']['why']] + v['quiz']['o'] + [s['t'] for s in v['scenes']]:
            if not ok.match(t): bad.append(k + ' txt ' + t[:25])
            if BADW.search(t): bad.append(k + ' word ' + t[:20])
        for s in v['scenes']:
            if s['img'] not in ICONS: bad.append(k + ' scene icon ' + s['img'])
        if len(set(v['quiz']['o'])) != 3: bad.append(k + ' opts')
        if 'a2' in v['levels'] and len(v['scenes']) > 4: bad.append(k + ' a2 long')
    return bad
