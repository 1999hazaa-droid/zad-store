import asyncio,sys,time
sys.path.insert(0,'/tmp')
from kidlib import wiz
from playwright.async_api import async_playwright
async def go(pg):
    t=time.time()
    while time.time()-t<60 and not await pg.evaluate("!!document.querySelector('.win')"):
        await pg.evaluate("(()=>{const o=[...document.querySelectorAll('.sn-bank .sn-w:not(.used)')].sort((a,b)=>a.dataset.i-b.dataset.i);o.length&&o[0].click()})()");await pg.wait_for_timeout(350)
    return await pg.evaluate("!!document.querySelector('.win')")
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for vw,g in [((390,844),2),((820,1180),2),((1366,768),2)]:
            c=await b.new_context(viewport={'width':vw[0],'height':vw[1]},service_workers='block');pg=await c.new_page()
            errs=[];pg.on('pageerror',lambda e:errs.append(str(e)[:100]));await pg.route('**/*supabase.co/**',lambda r:r.abort())
            await pg.goto('http://localhost:8765/games/');await wiz(pg,'سالم','b',grade=g);await pg.wait_for_timeout(400)
            await pg.goto('http://localhost:8765/games/#g=sentence');await pg.reload();await pg.wait_for_timeout(900)
            await pg.evaluate("(()=>{const b=document.querySelector('.lvcard[data-l=\"1\"]');b&&b.click()})()");await pg.wait_for_timeout(800)
            ok=await go(pg);again=None
            if ok:
                await pg.wait_for_timeout(500);await pg.click('#again');await pg.wait_for_timeout(1000)
                await pg.evaluate("(()=>{const b=document.querySelector('.lvcard[data-l=\"1\"]');b&&b.click()})()");await pg.wait_for_timeout(800);again=await go(pg)
            print(vw,'WON' if ok else 'NOT','again',again,errs,flush=True);await c.close()
        await b.close()
asyncio.run(main())
