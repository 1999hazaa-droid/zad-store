import asyncio,sys,json
sys.path.insert(0,'/tmp/adm')
from mock import *
from playwright.async_api import async_playwright
async def main():
    db=DB()
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':390,'height':844},is_mobile=True,has_touch=True,service_workers='block',accept_downloads=True);pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        await pg.add_init_script("if(location.pathname.startsWith('/manage'))localStorage.setItem('zad-admin-auth',%s)"%json.dumps(SESSION))
        await pg.route('**/*supabase.co/**',install(pg,db))
        pub=await ctx.new_page();pub.on('pageerror',lambda e:errs.append('PUB:'+str(e)))
        await pub.route('**/*supabase.co/**',install(pub,db))
        async def lib_titles():
            await pub.goto('http://localhost:8765/library/');await pub.evaluate("localStorage.clear()");await pub.reload();await pub.wait_for_timeout(1000)
            await pub.evaluate("document.querySelector('[data-more=new]')&&document.querySelector('[data-more=new]').click()");await pub.wait_for_timeout(300)
            return await pub.evaluate("(document.querySelector('.lbar')||{}).innerText")
        R=lambda n,v:print(n,'=>',v)
        R('lib shows (all, anon)',(await lib_titles()).replace('\n',' '))
        await pg.goto('http://localhost:8765/manage/#libadm');await pg.wait_for_timeout(1500)
        t=pg.evaluate;toast=lambda:t("(document.querySelector('.toast')||{}).innerText")
        # unpublish item 5 -> disappears from library
        await pg.fill('#lq','رقم 5');await pg.click('#lls .item');await pg.click('[data-st=unpublished]');await pg.wait_for_timeout(600)
        R('after unpublish: lib count',(await lib_titles()).replace('\n',' '))
        # delete + restore
        await pg.fill('#lq','رقم 6');await pg.click('#lls .item');await pg.click('#ax');await pg.wait_for_timeout(300);await pg.click('#y');await pg.wait_for_timeout(700)
        R('deleted',(len([r for r in db.p if r['name']=='ملف رقم 6']),await toast()))
        await pg.click('#la');await pg.wait_for_timeout(400)
        R('audit has delete',await t("[...document.querySelectorAll('#ov .card b')].map(b=>b.innerText).slice(0,3)"))
        await pg.click('#ov [data-r]');await pg.wait_for_timeout(300);await pg.click('#y');await pg.wait_for_timeout(700)
        R('restored',len([r for r in db.p if r['name']=='ملف رقم 6']))
        # taxonomy
        await pg.click('#lt');await pg.wait_for_timeout(500)
        await pg.fill('#tnew','العلوم');await pg.click('#tadd');await pg.wait_for_timeout(600)
        R('subject added',[x['label'] for x in db.tax if x['kind']=='subject'])
        await pg.click('[data-k=grade]');await pg.wait_for_timeout(400);await pg.fill('#tnew','الصف الخامس');await pg.click('#tadd');await pg.wait_for_timeout(600)
        R('grade added',[(x['key'],x['label']) for x in db.tax if x['kind']=='grade'])
        await pg.click('[data-k=subject]');await pg.wait_for_timeout(400)
        R('in-use subject has no delete btn',await t("[...document.querySelectorAll('#ov .item')].map(i=>[i.querySelector('b').innerText,!!i.querySelector('[data-rm]')])"))
        await pg.click('[data-ed]');await pg.fill('#tn','الرياضيات (معدل)');await pg.click('#ty');await pg.wait_for_timeout(700)
        R('rename cascaded',sorted(set(r['lib_subject'] for r in db.p)))
        # backup download
        await pg.keyboard.press('Escape');await pg.mouse.click(5,5);await pg.wait_for_timeout(300)
        async with pg.expect_download() as dl: await pg.click('#lb')
        d=await dl.value;path=await d.path();j=json.load(open(path));R('backup',(d.suggested_filename,len(j['products']),len(j['taxonomy'])))
        # library reflects: title edit + new age tile
        db.tax.append(dict(kind='grade',key='g5',label='الصف الخامس',sort=5,active=True))
        r0=[r for r in db.p if r['name']=='ملف رقم 2'][0];r0['name']='عنوان معدّل ظاهر';r0['lib_levels']=['g5']
        await pub.goto('http://localhost:8765/library/');await pub.evaluate("localStorage.clear()");await pub.reload();await pub.wait_for_timeout(1200)
        R('lib tiles',await pub.evaluate("[...document.querySelectorAll('.ltile[data-lv]')].map(b=>b.innerText.replace(/\\n/g,' '))"))
        await pub.fill('#lq','عنوان معدّل');await pub.wait_for_timeout(500);R('lib finds renamed',await pub.evaluate("document.querySelectorAll('.lc').length"))
        print('errs',errs);await b.close()
asyncio.run(main())
