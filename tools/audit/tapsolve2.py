import asyncio,sys,time
sys.path.insert(0,'/tmp')
from kidlib import wiz
from playwright.async_api import async_playwright
WIN="!!document.querySelector('.win')"
async def start(pg,g):
    await pg.goto('http://localhost:8765/games/#g='+g); await pg.reload(); await pg.wait_for_timeout(900)
    await pg.evaluate("(()=>{const b=document.querySelector('.lvcard[data-l=\"1\"]');b&&b.click()})()"); await pg.wait_for_timeout(1000)
    await pg.evaluate("document.querySelector('.zst-go')&&document.querySelector('.zst-go').click()"); await pg.wait_for_timeout(1500)
async def taps(pg,sel,dl=60):
    t=time.time()
    while time.time()-t<dl:
        if await pg.evaluate(WIN):return True
        await pg.evaluate("(s)=>document.querySelectorAll(s).forEach(b=>{['pointerdown','pointerup'].forEach(t=>b.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:1,isPrimary:true})));b.click()})",sel);await pg.wait_for_timeout(500)
    return await pg.evaluate(WIN)
async def place(pg,pc,tg,dl=60):
    t=time.time()
    while time.time()-t<dl:
        if await pg.evaluate(WIN):return True
        ps=await pg.query_selector_all(f'{pc}:not([data-done])')
        if not ps: await pg.wait_for_timeout(500);continue
        p0=ps[0];kk=await p0.get_attribute('data-k')
        try:
            await p0.tap();await pg.wait_for_timeout(200)
            tt=await pg.query_selector(f'{tg}[data-k="{kk}"]') if tg!='#an' else await pg.query_selector('#an')
            if tt: await tt.tap()
        except Exception:pass
        await pg.wait_for_timeout(500)
    return await pg.evaluate(WIN)
G0={'k_bubble':('t','.tgb'),'k_bal':('t','.bl'),'k_fly':('t','.tgb'),'k_shape':('p','.pc','.hole2'),'k_puz':('p','.pz-pc','.pz-slot'),'k_feed':('p','.fd','#an')}
G={k:v for k,v in G0.items() if k in ('k_bubble','k_bal','k_fly')}
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for g,sp in G.items():
            c=await b.new_context(viewport={'width':390,'height':844},service_workers='block',has_touch=True);pg=await c.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:100]));await pg.route('**/*supabase.co/**',lambda r:r.abort())
            await pg.goto('http://localhost:8765/games/');await wiz(pg,'سالم','b',age=1);await pg.wait_for_timeout(300)
            await start(pg,g);ok=await (taps(pg,sp[1]) if sp[0]=='t' else place(pg,sp[1],sp[2]))
            again=None
            if ok:
                await pg.wait_for_timeout(600);r=await pg.evaluate("!!document.querySelector('#again')")
                if r:
                    await pg.click('#again');await pg.wait_for_timeout(1200)
                    await pg.evaluate("document.querySelector('.zst-go')&&document.querySelector('.zst-go').click()");await pg.wait_for_timeout(1200)
                    again=await (taps(pg,sp[1]) if sp[0]=='t' else place(pg,sp[1],sp[2]))
            print(g,'WON' if ok else 'NOT','again',again,errs,flush=True);await c.close()
        await b.close()
asyncio.run(main())
