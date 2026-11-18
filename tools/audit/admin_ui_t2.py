import asyncio,sys,json
sys.path.insert(0,'/tmp/adm')
from mock import *
from playwright.async_api import async_playwright
async def main():
    db=DB();fails={}
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block');pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script("localStorage.setItem('zad-admin-auth',%s)"%json.dumps(SESSION))
        await pg.route('**/*supabase.co/**',install(pg,db,fails))
        await pg.goto('http://localhost:8765/manage/#libadm');await pg.wait_for_timeout(1500)
        t=pg.evaluate
        toast=lambda:t("(document.querySelector('.toast')||{}).innerText")
        R=lambda n,v:print(n,'=>',v)
        # --- A) edit draft: fix description, publish via editor
        await pg.click('#lch [data-s=draft]');await pg.click('#lls .item');await pg.click('#ae');await pg.wait_for_timeout(400)
        await pg.fill('#ds','وصف كامل وواضح للمحتوى التعليمي المسودة');await pg.select_option('#lst','published')
        R('A vi synced',await t("document.querySelector('#vi').checked"))
        await pg.click('#sv');await pg.wait_for_timeout(700)
        R('A db',[(r['lib_status'],r['is_visible']) for r in db.p if r['name']=='مسودة تجريبية']);R('A toast',await toast())
        # --- B) unpublish through quick action
        await pg.click('#lch [data-s=published]');await pg.wait_for_timeout(200)
        await pg.fill('#lq','مسودة');await pg.click('#lls .item');await pg.click('[data-st=unpublished]');await pg.wait_for_timeout(700)
        R('B db',[(r['lib_status'],r['is_visible']) for r in db.p if r['name']=='مسودة تجريبية']);R('B toast',await toast())
        # --- C) reorder
        await pg.fill('#lq','');await pg.click('#lch [data-s=""]');await pg.wait_for_timeout(200)
        first=await t("document.querySelector('#lls .item b').innerText")
        await pg.click('#lls .item');await pg.click('#ad');await pg.wait_for_timeout(800)
        second=await t("document.querySelectorAll('#lls .item b')[1].innerText")
        R('C moved down',(first==second,first,second))
        # --- D) change section/title of an item -> reflected in db
        await pg.fill('#lq','رقم 7');await pg.click('#lls .item');await pg.click('#ae');await pg.wait_for_timeout(300)
        await pg.fill('#nm','عنوان جديد 7');await pg.select_option('#lsec','math');await pg.select_option('#ltyp','worksheet');await pg.fill('#lkw','جمع، طرح');await pg.fill('#lunit','الوحدة 2')
        await pg.click('#sv');await pg.wait_for_timeout(700)
        r=[x for x in db.p if x['name']=='عنوان جديد 7'][0];R('D',(r['lib_section'],r['lib_type'],r['lib_keywords'],r['lib_unit']))
        # --- E) preview
        await pg.fill('#lq','عنوان جديد');await pg.click('#lls .item');await pg.click('#ae');await pg.wait_for_timeout(300)
        await pg.click('#lprev');await pg.wait_for_timeout(300)
        R('E preview text',(await t("document.querySelector('#ovp').innerText")).replace('\n',' | ')[:200]);await pg.screenshot(path='/tmp/adm/preview.png')
        await pg.click('#pvx');R('E sheet still there',await t("!!document.querySelector('#nm')"))
        # --- F) file validation
        for f,exp in [('empty.pdf','فارغ'),('fake.pdf','تالف')]:
            await pg.set_input_files('#lff',f'/tmp/adm/{f}');await pg.wait_for_timeout(500);R('F '+f,await toast())
        await pg.click('#sv');await pg.wait_for_timeout(500)
        # --- G) upload error shown
        fails['upload']=True;await pg.fill('#lq','عنوان جديد');await pg.click('#lls .item');await pg.click('#ae');await pg.wait_for_timeout(300)
        await pg.set_input_files('#lff','/tmp/adm/ok.pdf');await pg.wait_for_timeout(1500);R('G upload fail msg',(await t("document.querySelector('#lfs').innerText"),await toast()))
        fails['upload']=False
        # --- H) draft recovery: upload ok then reload before save
        await pg.set_input_files('#lff','/tmp/adm/ok.pdf');await pg.wait_for_timeout(4500)
        R('H draft saved',await t("!!localStorage.getItem(Object.keys(localStorage).find(k=>k.startsWith('zad.libdraft.')))"))
        await pg.reload();await pg.wait_for_timeout(1500)
        await pg.fill('#lq','عنوان جديد');await pg.click('#lls .item');await pg.click('#ae');await pg.wait_for_timeout(500)
        R('H restore btn',await t("[...document.querySelectorAll('#libc button')].some(b=>b.innerText.includes('استعادة ملفات'))"))
        await pg.click('#ov .sheet >> text=✕') if False else None
        print('errs',errs);print('upl log',[l for l in db.log if l[0]=='upload'][:3]);await b.close()
asyncio.run(main())
