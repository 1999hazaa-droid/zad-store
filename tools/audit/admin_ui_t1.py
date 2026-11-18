import asyncio,sys,json
sys.path.insert(0,'/tmp/adm')
from mock import *
from playwright.async_api import async_playwright
async def main():
    db=DB()
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block');pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.on('console',lambda m:m.type=='error' and errs.append('C:'+m.text[:100]))
        await pg.add_init_script("localStorage.setItem('zad-admin-auth',%s)"%json.dumps(SESSION))
        await pg.route('**/*supabase.co/**',install(pg,db))
        await pg.goto('http://localhost:8765/manage/#libadm');await pg.wait_for_timeout(1500)
        t=lambda s:pg.evaluate(s)
        print('title',await t("document.querySelector('#ttl').innerText"))
        print('stats',await t("[...document.querySelectorAll('.stat')].map(e=>e.innerText.replace(/\\n/g,':'))"))
        print('rows',await t("document.querySelectorAll('#lls .item').length"))
        # filter by status draft
        await pg.click('#lch [data-s=draft]');print('draft rows',await t("document.querySelectorAll('#lls .item').length"))
        await pg.click('#lch [data-s=""]')
        await pg.fill('#lq','رقم 5');print('search rows',await t("document.querySelectorAll('#lls .item').length"))
        await pg.fill('#lq','')
        # open draft row actions -> try publish (should be blocked: short description)
        await pg.click('#lch [data-s=draft]');await pg.click('#lls .item');await pg.wait_for_timeout(300)
        await pg.click('[data-st=published]');await pg.wait_for_timeout(400)
        print('publish blocked toast:',await t("(document.querySelector('.toast')||{}).innerText"),'| db status',[r['lib_status'] for r in db.p if r['name']=='مسودة تجريبية'])
        await pg.screenshot(path='/tmp/adm/a1.png')
        print('errs',errs)
        await b.close()
asyncio.run(main())
