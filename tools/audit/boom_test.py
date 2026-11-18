import asyncio,sys,re
sys.path.insert(0,'/tmp')
from kidlib import wiz
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); ctx=await b.new_context(viewport={'width':390,'height':844},service_workers='block',is_mobile=True,has_touch=True); pg=await ctx.new_page()
        await pg.route('**/*supabase.co/**',lambda r:r.abort())
        async def h(r):
            resp=await r.fetch(); t=await resp.text()
            assert 'try{t.run(y("#stage"))}' in t
            t=t.replace('try{t.run(y("#stage"))}','try{if(localStorage.getItem("boom"))throw new Error("boom");t.run(y("#stage"))}',1)
            await r.fulfill(response=resp,body=t)
        await pg.route(re.compile(r'.*/games\.js.*'),h)
        await pg.goto('http://localhost:8765/games/'); await wiz(pg,'سالم','b',age=3); await pg.wait_for_timeout(500)
        await pg.evaluate("localStorage.setItem('boom','1')"); await pg.add_init_script("window.__life=[];document.addEventListener('zlife',e=>window.__life.push(e.detail.ev))")
        await pg.goto('http://localhost:8765/games/#g=k_feed'); await pg.reload(); await pg.wait_for_timeout(1000)
        print('lv',await pg.evaluate("!!document.querySelector('.lvpick')"))
        await pg.evaluate("(document.querySelector('.lvpick button, .lvpick .lvb, .lvpick [data-l]')||{click(){}}).click()"); await pg.wait_for_timeout(1500)
        print('zerr',await pg.evaluate("!!document.querySelector('.zerr')"), await pg.evaluate("(document.querySelector('.zerr')||{}).innerText"))
        print('life',await pg.evaluate("window.__life"),'hg_err',await pg.evaluate("Object.keys(localStorage).filter(k=>k.startsWith('hg_err')).map(k=>localStorage[k].slice(0,120))"))
        await pg.screenshot(path='/tmp/boom.png')
        await pg.click('#zerrb'); await pg.wait_for_timeout(800)
        print('after back: stage?',await pg.evaluate("!!document.querySelector('#stage')"),await pg.evaluate("location.hash"))
        await b.close()
asyncio.run(main())
