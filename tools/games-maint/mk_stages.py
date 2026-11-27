import asyncio,json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch();pg=await b.new_page()
        await pg.route('**/*supabase.co/**',lambda r:r.abort())
        await pg.goto('http://localhost:8765/games/');await pg.wait_for_function('window.ZREG')
        rows=await pg.evaluate("ZREG.all().map(r=>({id:r.id,ages:r.ages,grades:r.grades}))")
        await b.close()
    D={s:{'cats':{'all':[]}} for s in ['a2','a3','a4','a5','a6','g1','g2','g3','g4']}
    un=[];odd=set()
    for r in rows:
        st=[*(r['ages'] or []),*(r['grades'] or [])]
        for s in st:
            if s not in D: odd.add(s)
        st=[s for s in st if s in D]
        if st: D[st[0]]['cats']['all'].append(r['id'])
        else: un.append(r['id'])
    json.dump(D,open('/tmp/rd/stages.json','w'),ensure_ascii=False)
    print({s:len(x['cats']['all']) for s,x in D.items()},'unlisted',len(un),'odd levels',odd)
asyncio.run(main())
