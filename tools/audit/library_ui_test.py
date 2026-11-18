import asyncio,json,re,sys
from playwright.async_api import async_playwright
fr=[("a2-big-shapes","ألوّن الأشكال الكبيرة","color",["a2","a3"],"الألوان والأشكال"),("a2-first-picture-cards","بطاقات صوري الأولى","cards",["a2","a3"],"اللغة والمفردات"),("a4-letters-trace-alef-khaa","أتتبّع حروفي","letters",["a4","a5"],"اللغة العربية"),("a4-count-and-match-1-10","عُدّ وصِل","math",["a4","a5"],"الرياضيات"),("g1-addition-within-20","الجمع حتى 20","ws",["g1"],"الرياضيات"),("g2-taa-marbuta-maftuha","التاء المربوطة","ws",["g2","g3"],"اللغة العربية"),("g4-fractions-review","مراجعة الكسور","review",["g3","g4"],"الرياضيات"),("g3-reading-comprehension","أقرأ وأفهم","ws",["g3","g4"],"اللغة العربية")]
rows=[]
for i,(f,n,sec,lv,sub) in enumerate(fr):
    rows.append(dict(id=f"id{i}",name=n,slug=f,price="0.000",old_price=None,image_url="images/zad/i_books.webp",thumb_url=None,description="وصف",file_url=f"files/lib/{f}.pdf",bw_url=f"files/lib/{f}-bw.pdf",lib_section=sec,lib_levels=lv,lib_subject=sub,lib_skill="مهارة",pages=6,file_type="PDF",created_at=f"2026-11-{17-i:02d}T10:00:00Z",is_available=True))
rows.append(dict(rows[0],id="p1",name="مدفوع",price="2.000",file_url="private:x",bw_url=None,created_at="2026-10-01T00:00:00Z",slug="p1"))
async def main(W,H,tag):
    async with async_playwright() as p:
        b=await p.chromium.launch();ctx=await b.new_context(viewport={'width':W,'height':H},is_mobile=W<700,has_touch=W<1100,service_workers='block');pg=await ctx.new_page()
        errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        async def h(r):
            u=r.request.url
            if '/rest/v1/products' in u: await r.fulfill(json=rows)
            elif 'lib_stats' in u: await r.fulfill(json=[dict(product_id="id3",uses=9),dict(product_id="id2",uses=5),dict(product_id="id4",uses=2)])
            else: await r.fulfill(json=[])
        await pg.route('**/*supabase.co/**',h)
        await pg.goto('http://localhost:8765/library/');await pg.wait_for_timeout(1200)
        await pg.evaluate("localStorage.setItem('zad.lib.recent',JSON.stringify(['id2']))");await pg.reload();await pg.wait_for_timeout(1200)
        print(tag,'h2:',await pg.evaluate("[...document.querySelectorAll('#lres h2')].map(h=>h.innerText.trim())"),'hscroll',await pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
        await pg.screenshot(path=f'/tmp/lib_{tag}.png',full_page=True)
        await pg.click('[data-subj]');await pg.wait_for_timeout(500)
        print('subj filter ->',await pg.evaluate("document.querySelector('.lbar')?.innerText"),await pg.evaluate("document.querySelectorAll('.lc').length"))
        await pg.click('[data-clear]');await pg.wait_for_timeout(300)
        await pg.fill('#lq','xyzxyz');await pg.wait_for_timeout(600);print('empty:',await pg.evaluate("(document.querySelector('.lempty h3')||{}).innerText"))
        print('errs',errs);await b.close()
asyncio.run(main(390,844,'m'));asyncio.run(main(1280,800,'d'))
