#!/usr/bin/env python3
"""يبني games/registry.json: السجلّ الموحّد للألعاب (البيانات الثابتة من الكود + نتيجة الفحص الآلي لكل شاشة).
الاستعمال: python3 tools/build_registry.py phone=/path/res_p.json tablet=/path/res_t.json desktop=/path/res_d.json
يحتاج خادمًا محليًا على 8765 من جذر المستودع."""
import sys,json,datetime,asyncio
from playwright.async_api import async_playwright
args=dict(a.split('=',1) for a in sys.argv[1:] if '=' in a)
async def static():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page()
        await pg.goto('http://localhost:8765/games/');await pg.wait_for_function('window.ZREG')
        rows=await pg.evaluate("ZREG.all().map(r=>({id:r.id,title:r.title,ages:r.ages,grades:r.grades,section:r.section,skills:r.skills,path:r.path,levels:r.levels}))")
        await b.close();return rows
rows=asyncio.run(static())
res={v:json.load(open(f)) for v,f in args.items() if v!='life'}
FLAG=('broken','off','clip','emo','small')
def issues(r):
    out=[]
    for ph in ('start','first','mid','win'):
        c=r.get(ph) or {}
        for k in FLAG:
            if c.get(k): out.append(f'{ph}:{k}')
        if c.get('sw'): out.append(f'{ph}:hscroll')
    return sorted(set(out))
import re,os
LEG=json.load(open(os.path.join(os.path.dirname(__file__),'audit','legacy.json')))
LIFE=json.load(open(args['life'])) if 'life' in args else {}
res.pop('life',None)
OV=json.load(open(os.path.join(os.path.dirname(__file__),'audit','overrides.json')))
games={};summ={'legacy':0,'contract_ok':0,'contract_checked':0,'total':0,'approved':0,'needs_review':0,'errors':0,'not_tested':0,'needs_update':0,'unlisted':0}
for g in rows:
    t={}
    for v,d in res.items():
        r=d.get(g['id'])
        if not r: continue
        t[v]={'finished':bool(r.get('finished')),'steps':r.get('steps'),'replay':r.get('again'),'back':r.get('backok'),'errors':r.get('errs',[])+([r['fail']] if r.get('fail') else []),'missing_files':r.get('404',[]),'layout':issues(r)}
    for v in t:
        if g['id'] in OV: t[v]['layout_note']=OV[g['id']];t[v]['layout']=[]
    if not t and g['id'] in LEG:
        L=LEG[g['id']];status='legacy' if L['opened'] and L['won'] and not L['errors'] else 'needs_review';t={'phone':{'finished':L['won'],'steps':None,'replay':None,'back':None,'errors':L['errors'],'missing_files':[],'layout':[]}}
    elif not t: status='unlisted' if not (g['ages'] or g['grades']) else 'not_tested'
    else:
        err=any(x['errors'] or x['missing_files'] or 'start:broken' in x['layout'] for x in t.values())
        fin=all(x['finished'] and x['back'] is not False and x['replay'] is not False for x in t.values())
        lay=any(x['layout'] for x in t.values())
        status='errors' if err else 'needs_review' if not fin else 'needs_update' if lay else 'approved'
    summ['total']+=1;k={'approved':'approved','errors':'errors','needs_review':'needs_review','needs_update':'needs_update','not_tested':'not_tested','unlisted':'unlisted','legacy':'legacy'}[status];summ[k]+=1
    pt=((res.get('phone',{}).get(g['id'],{}).get('x1') or {}).get('progtxt') or '');m=re.search(r'من\s*(\d+)',pt)
    games[g['id']]={**g,'activities':int(m.group(1)) if m else None,'difficulty':'3 مستويات (تعلّم / تدريب / إتقان)' if g['levels']==3 else 'مستوى واحد','tested_on':list(t),'status':status,'tests':t}
    lf=LIFE.get(g['id'])
    if lf is not None:
        ev=[e for e in lf.get('life',[]) if not e.startswith('srv_')];ok=bool(ev) and ev[0]=='open' and 'begin' in ev and ('end+' in ev or 'end' in ev or not lf.get('finished')) and 'error' not in ev
        games[g['id']]['contract']={'events':ev,'ok':ok};summ['contract_checked']+=1;summ['contract_ok']+=int(ok)
out={'generated':datetime.date.today().isoformat(),'viewports':list(res),'summary':summ,'notes':'activities = عدد الأنشطة كما يعرضها عدّاد اللعبة عند أول مستوى. unlisted = ألعاب قديمة في الكود وغير ظاهرة في أي مرحلة (لا تُعرض للأطفال). approved = اكتملت اللعبة (فوز + إعادة + رجوع) على كل الشاشات المفحوصة بلا أخطاء ولا مشاكل عرض. needs_update = تعمل لكن فيها ملاحظة عرض. الفحص بمحاكي متصفح وليس بأجهزة حقيقية.','games':games}
json.dump(out,open('games/registry.json','w'),ensure_ascii=False,separators=(',',':'))
print(json.dumps(summ,ensure_ascii=False))
