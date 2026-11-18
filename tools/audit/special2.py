import asyncio,sys,json,time
sys.path.insert(0,'/tmp'); sys.path.insert(0,'/tmp/rd'); sys.path.insert(0,'/tmp/rd/aud')
from special import setup,open_game,won,trace,draw
from playwright.async_api import async_playwright
GRID_JS=r"""(sel)=>{const cs=[...document.querySelectorAll(sel)];const n=Math.round(Math.sqrt(cs.length));const W=cs.map(c=>{const b=getComputedStyle(c);return [b.borderTopWidth,b.borderRightWidth,b.borderBottomWidth,b.borderLeftWidth].map(v=>parseFloat(v)>1?1:0)});return {n,W,goal:cs.findIndex(c=>c.classList.contains('goal')),stars:cs.map((c,i)=>c.querySelector('.tg-ams')?i:-1).filter(i=>i>=0)}}"""
def bfs(n,W,s,g):
    from collections import deque
    pr={s:None};q=deque([s]);D=[(0,-1),(1,0),(0,1),(-1,0)]
    while q:
        a=q.popleft()
        if a==g:break
        x,y=a%n,a//n
        for d,(dx,dy) in enumerate(D):
            if W[a][d]:continue
            nx,ny=x+dx,y+dy
            if 0<=nx<n and 0<=ny<n:
                b=ny*n+nx
                if b not in pr: pr[b]=(a,d);q.append(b)
    if g not in pr:return None
    path=[];c=g
    while pr[c] is not None: a,d=pr[c];path.append((c,d));c=a
    return path[::-1]
async def maze(pg):
    for k in range(400):
        if await won(pg): return True
        if not await pg.query_selector('.tg-mc'): await pg.wait_for_timeout(500);continue
        G=await pg.evaluate(GRID_JS,'.tg-mc'); cur=await pg.evaluate("[...document.querySelectorAll('.tg-mc')].findIndex(c=>c.querySelector('.tg-hero'))")
        p=bfs(G['n'],G['W'],cur,G['goal'])
        if not p: await pg.wait_for_timeout(400);continue
        await pg.evaluate("(i)=>document.querySelectorAll('.tg-mc')[i].click()",p[0][0]); await pg.wait_for_timeout(120 if len(p)>1 else 1800)
    return await won(pg)
async def amaze(pg):
    keys=['ArrowUp','ArrowRight','ArrowDown','ArrowLeft']
    for k in range(60):
        if await won(pg): return True
        if not await pg.query_selector('.tg-amc'): await pg.wait_for_timeout(500);continue
        await pg.wait_for_timeout(500)
        G=await pg.evaluate(GRID_JS,'.tg-amc'); n=G['n']
        hx=await pg.evaluate("(()=>{const h=document.querySelector('#tghero');const s=getComputedStyle(h);return [parseInt(h.style.getPropertyValue('--x')||0),parseInt(h.style.getPropertyValue('--y')||0)]})()")
        cur=hx[1]*n+hx[0]; todo=list(G['stars'])
        while True:
            if todo:
                best=None
                for s_ in todo:
                    pth=bfs(n,G['W'],cur,s_)
                    if pth and (best is None or len(pth)<len(best[1])): best=(s_,pth)
                tgt,pth=best; todo.remove(tgt)
            else: pth=bfs(n,G['W'],cur,G['goal']); tgt=G['goal']
            for c,d in pth: await pg.keyboard.press(keys[d]); await pg.wait_for_timeout(60)
            cur=tgt
            if tgt==G['goal']: break
        await pg.wait_for_timeout(1800)
    return await won(pg)
async def code(pg):
    for k in range(20):
        if await won(pg): return True
        if not await pg.query_selector('.tg-cc'): await pg.wait_for_timeout(500);continue
        await pg.wait_for_timeout(500)
        info=await pg.evaluate("""()=>{const cs=[...document.querySelectorAll('.tg-cc')];const n=Math.round(Math.sqrt(cs.length));const h=document.querySelector('#tghero');if(!h||!cs.length)return null;return {n,ob:cs.map((c,i)=>c.classList.contains('ob')?i:-1).filter(i=>i>=0),g:cs.findIndex(c=>{const im=c.querySelector('img');return im&&/flag/.test(im.src)}),s:parseInt(h.style.getPropertyValue('--y'))*n+parseInt(h.style.getPropertyValue('--x'))}}""")
        if not info: await pg.wait_for_timeout(500);continue
        n=info['n'];W=[[0,0,0,0] for _ in range(n*n)]
        for o in info['ob']:
            x,y=o%n,o//n
            for d,(dx,dy) in enumerate([(0,-1),(1,0),(0,1),(-1,0)]):
                a=(y-dy)*n+(x-dx)
                if 0<=x-dx<n and 0<=y-dy<n: W[a][d]=1
        pth=bfs(n,W,info['s'],info['g'])
        if not pth: return False
        for c,d in pth[:10]: await pg.evaluate("(d)=>document.querySelector('.tg-cb[data-d=\"'+d+'\"]').click()",d); await pg.wait_for_timeout(60)
        await pg.evaluate("document.querySelector('#tggo').click()"); await pg.wait_for_timeout(600*len(pth)+2200)
    return await won(pg)
async def simon(pg):
    await pg.evaluate("""()=>{window.__sq=[];const obs=new MutationObserver(ms=>{const st=document.querySelector('#tgst');ms.forEach(m=>{const e=m.target;if(e.classList&&e.classList.contains('tg-sip')&&e.classList.contains('on')&&st&&/watch/.test(st.className)){window.__sq.push([...document.querySelectorAll('.tg-sip')].indexOf(e))}})});obs.observe(document.querySelector('#stage'),{attributes:true,subtree:true,attributeFilter:['class']});window.__obs=obs}""")
    for k in range(60):
        if await won(pg): return True
        st=await pg.evaluate("(document.querySelector('#tgst')||{}).className||''")
        if 'go' in st:
            sq=await pg.evaluate("window.__sq.splice(0)")
            for j in sq: await pg.evaluate("(j)=>document.querySelectorAll('.tg-sip')[j].click()",j); await pg.wait_for_timeout(300)
            await pg.wait_for_timeout(2200)
        else: await pg.wait_for_timeout(250)
    return await won(pg)
async def catch(pg):
    await pg.evaluate("""()=>{window.__ct=setInterval(()=>{const sc=document.querySelector('#tgsc');if(!sc)return;const tgsrc=(document.querySelector('.tg-ctt img')||{}).src;const its=[...sc.querySelectorAll('.tg-fall')].filter(e=>{const im=e.querySelector('img');return im&&im.src===tgsrc}).map(e=>[parseFloat(e.style.top),parseFloat(e.style.left)]).filter(a=>a[0]<86).sort((a,b)=>b[0]-a[0]);if(!its.length)return;const r=sc.getBoundingClientRect();const x=r.left+its[0][1]/100*r.width;const o={clientX:x,clientY:r.top+r.height*.5,pointerId:1,bubbles:true};sc.dispatchEvent(new PointerEvent('pointerdown',o));sc.dispatchEvent(new PointerEvent('pointerup',o))},80)}""")
    for k in range(120):
        if await won(pg): return True
        await pg.wait_for_timeout(500)
    return await won(pg)
async def paint(pg):
    for k in range(20):
        if await won(pg): return True
        await pg.evaluate("[...document.querySelectorAll('#stage [data-r]')].forEach((e,i)=>{const c=document.querySelectorAll('.tg-clr');c.length&&c[i%c.length].click();e.dispatchEvent(new MouseEvent('click',{bubbles:true}))})"); await pg.wait_for_timeout(2600)
    return await won(pg)
async def share(pg):
    for k in range(20):
        if await won(pg): return True
        n=await pg.evaluate("document.querySelectorAll('#tgpile .tg-ck').length"); pl=await pg.evaluate("document.querySelectorAll('.tg-pl2').length")
        if not n: await pg.wait_for_timeout(600); continue
        for j in range(n): await pg.evaluate("(j)=>document.querySelectorAll('.tg-pl2')[j].click()", j%pl); await pg.wait_for_timeout(80)
        await pg.wait_for_timeout(2500)
    return await won(pg)
async def plant(pg):
    M={'الجذور':'root','الساق':'stem','الأوراق':'leaf','الزهرة':'flower'}
    for k in range(20):
        if await won(pg): return True
        t=await pg.evaluate("(document.querySelector('.tg-plq b')||{}).textContent||''")
        if t in M: await pg.evaluate("(p)=>document.querySelector('.pp[data-p=\"'+p+'\"]').dispatchEvent(new MouseEvent('click',{bubbles:true}))",M[t])
        await pg.wait_for_timeout(2600)
    return await won(pg)
async def feed(pg):
    for k in range(40):
        if await won(pg): return True
        fds=await pg.evaluate("document.querySelectorAll('.fd').length")
        for j in range(fds):
            await pg.evaluate("""(j)=>{const e=document.querySelectorAll('.fd')[j];if(!e)return;const r=e.getBoundingClientRect(),o={clientX:r.left+r.width/2,clientY:r.top+r.height/2,pointerId:1,bubbles:true};e.dispatchEvent(new PointerEvent('pointerdown',o));e.dispatchEvent(new PointerEvent('pointerup',o));const a=document.querySelector('#an');a&&a.click()}""",j)
            await pg.wait_for_timeout(200)
        await pg.wait_for_timeout(2700)
    return await won(pg)
async def shop(pg):
    for k in range(20):
        if await won(pg): return True
        P=await pg.evaluate("parseInt((document.querySelector('.tg-tag')||{}).innerText||'0')")
        if not P: await pg.wait_for_timeout(500); continue
        await pg.evaluate("(P)=>{const cs=[...document.querySelectorAll('.tg-coin')];cs.slice(0,P).forEach(c=>c.click());document.querySelector('#tgbuy').click()}",P)
        await pg.wait_for_timeout(2600)
    return await won(pg)
F={'k5_shop':shop,'k5_maze':maze,'k6_amaze':amaze,'k6_code':code,'k6_simon':simon,'k6_catch':catch,'k_paint':paint,'k5_share':share,'k5_plant':plant,'k_feed':feed,'k5_trace':trace,'k4_draw':draw}
ST={'k5_shop':'a5','k5_maze':'a4','k6_amaze':'a6','k6_code':'a6','k6_simon':'a6','k6_catch':'a6','k_paint':'a3','k5_share':'a5','k5_plant':'a4','k_feed':'a2','k5_trace':'a5','k4_draw':'a4'}
async def main():
    gs=sys.argv[1:] or list(F)
    res={}
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for g in gs:
            ctx,pg,errs=await setup(b,ST[g]); await open_game(pg,g)
            try: ok=await F[g](pg)
            except Exception as e: ok=False; errs.append('EXC '+str(e)[:120])
            await pg.screenshot(path=f'/tmp/rd/aud/sp_{g}.png')
            again=None
            if ok:
                await pg.wait_for_timeout(500); await pg.evaluate("document.querySelector('#again').click()"); await pg.wait_for_timeout(1200)
                again=await pg.evaluate("!document.querySelector('.win')&&document.querySelector('#stage').children.length>0")
            res[g]=(ok,again,errs); print(g,'WON' if ok else 'NOT','again',again,errs,flush=True)
            await ctx.close()
        await b.close()
    json.dump(res,open('/tmp/rd/aud/special_res.json','w'),ensure_ascii=False)
asyncio.run(main())
