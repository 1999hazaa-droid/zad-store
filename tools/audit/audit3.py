import asyncio,sys,json,time,os
sys.path.insert(0,'/tmp'); sys.path.insert(0,'/tmp/rd')
from kidlib import wiz
from botlib import STEP_JS,CHECK_JS,EMO
from playwright.async_api import async_playwright
ST={'a2':('a',1),'a3':('a',3),'a4':('a',4),'a5':('a',5),'a6':('a',6),'g1':('g',1),'g2':('g',2),'g3':('g',3),'g4':('g',4)}
D=json.load(open('/tmp/rd/stages.json'))
W=int(os.environ.get('VW','390')); H=int(os.environ.get('VH','844')); TAG=os.environ.get('TAG','p')
pairs=[];seen=set()
for sid in ST:
    for cat,gl in D[sid]['cats'].items():
        for g in gl:
            if g not in seen: seen.add(g);pairs.append((sid,g))
only=sys.argv[1:]
if only: pairs=[p for p in pairs if p[1] in only]
OUT=f'/tmp/rd/aud/res_{TAG}.json'
try: res=json.load(open(OUT)) if not only else {}
except: res={}
pairs=[p for p in pairs if p[1] not in res]
print('todo',len(pairs),flush=True)
EXTRA=r"""()=>{const S=document.querySelector('#stage');if(!S)return{};const vh=innerHeight;const out={};
const im=[...S.querySelectorAll('img,.zxe,svg.qv')].filter(e=>{const r=e.getBoundingClientRect();return r.width>8&&r.height>8&&!e.closest('#buddy')});
let mx=0,mxe='';im.forEach(e=>{const r=e.getBoundingClientRect();const f=r.height/vh;if(f>mx){mx=f;mxe=String(e.className||e.tagName).slice(0,20)+':'+(e.getAttribute&&e.getAttribute('src')||'').split('/').pop()}});out.imgmax=Math.round(mx*100);out.imgmaxe=mxe;
const dist=[];S.querySelectorAll('img').forEach(i=>{const r=i.getBoundingClientRect();if(r.width<10||!i.naturalWidth)return;const of=getComputedStyle(i).objectFit;if(of==='contain'||of==='cover'||of==='scale-down')return;const a=r.width/r.height,b=i.naturalWidth/i.naturalHeight;if(Math.abs(a-b)/b>.1)dist.push(i.getAttribute('src').split('/').pop())});out.dist=[...new Set(dist)].slice(0,4);
const rep=document.querySelector('#rep');if(rep){const a=rep.getBoundingClientRect();out.rep=Math.round(a.width)+'x'+Math.round(a.height);let ov=[];S.querySelectorAll('img,.zxe,button,h2,h3,.q,b,p').forEach(e=>{if(e===rep||rep.contains(e)||e.contains(rep))return;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return;const x=Math.max(0,Math.min(a.right,r.right)-Math.max(a.left,r.left)),y=Math.max(0,Math.min(a.bottom,r.bottom)-Math.max(a.top,r.top));if(x*y>a.width*a.height*.15)ov.push(String(e.className||e.tagName).slice(0,16))});out.repov=[...new Set(ov)].slice(0,4)}
out.prog=!!document.querySelector('.hud .hq');out.progtxt=((document.querySelector('.hud .hq')||{}).innerText||'').slice(0,20);
out.hint=!!document.querySelector('.hintbtn');out.sh=Math.round(S.getBoundingClientRect().height);out.dh=document.documentElement.scrollHeight;
return out}"""
async def worker(b,q,k):
    ctx=None;cur=None;pg=None
    while q:
        sid,g=q.pop(0)
        if cur!=sid:
            if ctx: await ctx.close()
            ctx=await b.new_context(viewport={'width':W,'height':H},service_workers='block',is_mobile=W<700,has_touch=W<1100);pg=await ctx.new_page()
            errs=[];bad=[]
            pg.on('pageerror',lambda e:errs.append(str(e)[:140]))
            pg.on('console',lambda m:m.type=='error' and 'supabase' not in m.text and 'Failed to load resource' not in m.text and errs.append('c:'+m.text[:120]))
            pg.on('response',lambda r:r.status>=400 and 'localhost' in r.url and bad.append(r.url.split('8765/')[-1]))
            pg.on('dialog',lambda d:asyncio.ensure_future(d.dismiss()))
            await pg.route('**/*supabase.co/**',lambda r:r.abort())
            await pg.goto('http://localhost:8765/games/'); m,v=ST[sid]
            await (wiz(pg,'سالم','b',age=v) if m=='a' else wiz(pg,'سالم','b',grade=v)); await pg.wait_for_timeout(500); cur=sid
        errs.clear();bad.clear(); t0=time.time(); r={'stage':sid}
        try:
            await pg.goto(f'http://localhost:8765/games/#g={g}'); await pg.reload(); await pg.wait_for_timeout(800)
            r['lvpick']=await pg.evaluate("!!document.querySelector('.lvpick')")
            r['title']=await pg.evaluate("(document.querySelector('.bar .title')||{}).innerText||''")
            r['start']=await pg.evaluate(CHECK_JS,EMO)
            if r['lvpick']: await pg.screenshot(path=f'/tmp/rd/aud/sh/{TAG}_{g}_0.png')
            st=await pg.evaluate(STEP_JS); await pg.wait_for_timeout(1300)
            r['first']=await pg.evaluate(CHECK_JS,EMO); r['x1']=await pg.evaluate(EXTRA)
            await pg.screenshot(path=f'/tmp/rd/aud/sh/{TAG}_{g}_1.png')
            acts={};fin=False;n=0;mid=False
            while time.time()-t0<50 and n<240:
                a=await pg.evaluate(STEP_JS); n+=1
                if a=='win': fin=True;break
                if n==6 and not mid:
                    mid=True; r['x2']=await pg.evaluate(EXTRA); r['mid']=await pg.evaluate(CHECK_JS,EMO)
                key=a.split(':')[0];acts[key]=acts.get(key,0)+1
                await pg.wait_for_timeout(700 if a=='none' else 260)
            r.update(finished=fin,steps=n,acts=acts,secs=round(time.time()-t0,1))
            if fin:
                await pg.wait_for_timeout(600)
                r['win']=await pg.evaluate(CHECK_JS,EMO)
                r['winstars']=await pg.evaluate("(document.querySelector('.win .zwr')||{}).innerText||''"); r['wbtn']=await pg.evaluate("[...document.querySelectorAll('.win button')].map(b=>b.id).join(',')"); r['stats']=await pg.evaluate("!!document.querySelector('.win .zws,.win .zwst,.win .wstat')")
                r['reg']=await pg.evaluate("(g)=>{const r=ZREG.get(g);return r?{done:r.done,att:r.attempts,stars:r.stars}:null}",g)
                await pg.evaluate("document.querySelectorAll('.unlock').forEach(x=>x.remove())")
                await pg.screenshot(path=f'/tmp/rd/aud/sh/{TAG}_{g}_w.png')
                if await pg.locator('#again').count():
                    await pg.click('#again'); await pg.wait_for_timeout(1300)
                    r['again']=await pg.evaluate("!document.querySelector('.win')&&!!(document.querySelector('.lvpick')||(document.querySelector('#stage')&&document.querySelector('#stage').children.length))")
            await pg.click('#back'); await pg.wait_for_timeout(700)
            r['backok']=await pg.evaluate("!document.querySelector('#stage')")
            r['backhash']=await pg.evaluate("location.hash")
        except Exception as e:
            r['fail']=str(e)[:160]
        r['errs']=list(dict.fromkeys(errs))[:4]; r['404']=list(dict.fromkeys(bad))[:6]
        res[g]=r
        json.dump(res,open(OUT,'w'),ensure_ascii=False)
        print(k,sid,g,'fin' if r.get('finished') else 'NOFIN',r.get('steps'),r.get('secs'),'ERR' if r['errs'] or r.get('fail') else '','404' if r['404'] else '',flush=True)
    if ctx: await ctx.close()
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        q=list(pairs)
        await asyncio.gather(*[worker(b,q,k) for k in range(int(os.environ.get('NW','6')))])
asyncio.run(main())
