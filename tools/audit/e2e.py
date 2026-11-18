import asyncio,sys,re,json,time
sys.path.insert(0,'/tmp');sys.path.insert(0,'/tmp/rd')
from kidlib import wiz
from botlib import STEP_JS
from playwright.async_api import async_playwright
GAMES=sys.argv[1].split(',') if len(sys.argv)>1 else ['k4_lsnd','k4_num','k_mem']
async def play(pg,g):
    await pg.goto(f'http://localhost:8765/games/#g={g}');await pg.reload();await pg.wait_for_timeout(900)
    t0=time.time()
    while time.time()-t0<70:
        a=await pg.evaluate(STEP_JS)
        if a=='win':break
        await pg.wait_for_timeout(700 if a=='none' else 250)
    else:return None
    await pg.wait_for_timeout(700)
    return await pg.evaluate("(document.querySelector('.win .stars')||{}).children?document.querySelectorAll('.win .stars .on,.win .stars .full,.win .stars svg.on').length:0")
async def main():
    ok=True;rep=[]
    def chk(n,c,info=''):
        nonlocal ok;ok&=bool(c);rep.append(('PASS' if c else 'FAIL',n,info));print(rep[-1],flush=True)
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844});pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:120]));await pg.route('**/*supabase.co/**',lambda r:r.abort())
        await pg.goto('http://localhost:8765/games/');await wiz(pg,'سالم','b',age=5);await pg.wait_for_timeout(500)
        for g in GAMES:
            r=await play(pg,g);chk(f'فوز {g}',r is not None)
        # state after
        st=await pg.evaluate("""()=>{const t=Object.keys(localStorage);const g=k=>{const x=t.find(a=>a.startsWith(k));return x?JSON.parse(localStorage.getItem(x)):null};return{log:g('hg_log'),lv:g('hg_lv'),awd:g('hg_awd'),reg:ZREG.all().filter(r=>r.done).map(r=>({id:r.id,att:r.attempts,st:r.stars}))}}""")
        logids=[x['i'] for x in (st['log'] or [])]
        for g in GAMES:chk(f'سجلّ التقدم يحوي {g}',g in logids)
        regd={r['id']:r for r in st['reg']}
        for g in GAMES:chk(f'السجلّ الموحّد يعدّ {g} مكتملة',g in regd,json.dumps(regd.get(g)))
        n0=len(logids)
        awd0=json.dumps(st['awd'],sort_keys=True)
        # إعادة لعب نفس اللعبة: لا تتضاعف الشارات ولا تُحسب لعبة جديدة
        await play(pg,GAMES[0])
        st2=await pg.evaluate("""()=>{const t=Object.keys(localStorage);const g=k=>{const x=t.find(a=>a.startsWith(k));return x?JSON.parse(localStorage.getItem(x)):null};return{log:g('hg_log'),awd:g('hg_awd'),done:ZREG.all().filter(r=>r.done).length,done5:ZREG.all().filter(r=>r.done&&r.stages.includes('a5')).length}}""")
        chk('إعادة اللعب تُسجَّل محاولة',len(st2['log'])==n0+1,f'{n0}->{len(st2["log"])}')
        chk('عدد الألعاب المكتملة لم يتضاعف',st2['done']==len(st['reg']),f"{len(st['reg'])}->{st2['done']}")
        # صفحة إنجازاتي
        await pg.goto('http://localhost:8765/games/');await pg.wait_for_selector('.zhb');await pg.click('#zka2');await pg.wait_for_selector('.ach-stats')
        ach=await pg.evaluate("[...document.querySelectorAll('.ach-stats>div')].map(d=>d.innerText.replace(/\\s+/g,' '))")
        stars_ach=int(re.findall(r'\d+',ach[0])[0]);done_ach=int(re.findall(r'\d+',ach[1])[0])
        chk('إنجازاتي: ألعاب المرحلة المكتملة = السجلّ الموحّد',done_ach==st2['done5'],str(ach))
        chk('إنجازاتي: النجوم > 0',stars_ach>0,str(stars_ach))
        have=await pg.evaluate("[...document.querySelectorAll('.ach-bd>div.on b')].map(x=>x.innerText)")
        chk('شارة «البداية» مُنحت بعد اللعب','البداية' in have,str(have))
        await pg.click('#back');await pg.wait_for_selector('.zhb')
        # لوحة ولي الأمر
        await pg.click('#zkpd');await pg.wait_for_selector('.zpd-gate input')
        txt=await pg.inner_text('.zpd-gate');m=re.findall(r'(\d+)\s*[×x✕*]\s*(\d+)',txt);a,c=m[0]
        await pg.fill('.zpd-gate input',str(int(a)*int(c)));await pg.click('.zpd-gate .zpd-btn');await pg.wait_for_selector('.zpd-aw')
        aw=await pg.inner_text('.zpd-aw')
        sp=int(re.findall(r'\d+',aw.split('نجمة')[0])[-1])
        chk('لوحة ولي الأمر: النجوم = صفحة إنجازاتي',sp==stars_ach,f'{sp} vs {stars_ach}')
        pthn=await pg.evaluate("document.querySelector('.zpd-pth')?document.querySelector('.zpd-pth').innerText:''")
        chk('لوحة ولي الأمر: قسم المسار موجود',len(pthn)>20)
        # التوصية لا تقترح لعبة مكتملة بنجوم كاملة إلا عند انتهاء كل شيء + موجودة
        await pg.click('.zpd-x,#zpdx,.zpd-close') if await pg.locator('.zpd-x,#zpdx,.zpd-close').count() else await pg.goto('http://localhost:8765/games/')
        await pg.wait_for_selector('.zhb');rec=await pg.evaluate("(document.querySelector('.zrec-go')||{dataset:{}}).dataset.zrec||''")
        chk('توصية «ماذا ألعب الآن؟» لعبة موجودة',bool(rec) and await pg.evaluate("(g)=>!!ZREG.get(g)",rec),rec)
        chk('لا أخطاء JavaScript',not errs,str(errs[:2]))
        await b.close()
    print('RESULT','OK' if ok else 'FAIL')
asyncio.run(main())
