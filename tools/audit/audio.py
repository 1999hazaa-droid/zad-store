import asyncio,sys,time,json
sys.path.insert(0,'/tmp');sys.path.insert(0,'/tmp/rd')
from kidlib import wiz
from botlib import STEP_JS
from playwright.async_api import async_playwright
SPY="""()=>{window.__a={play:[],start:0};const P=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(){window.__a.play.push([Date.now(),(this.currentSrc||this.src||'').slice(-40),this.volume]);return P.apply(this,arguments)};if(window.AudioBufferSourceNode){const S=AudioBufferSourceNode.prototype.start;AudioBufferSourceNode.prototype.start=function(){window.__a.start++;return S.apply(this,arguments)}}}"""
async def run(b,sid,kind,g,muted):
    ctx=await b.new_context(viewport={'width':390 if kind=='a' else 1366,'height':844 if kind=='a' else 768},service_workers='block');pg=await ctx.new_page()
    await pg.route('**/*supabase.co/**',lambda r:r.abort())
    await pg.add_init_script("localStorage.setItem('hg_vmute','%s')"%('1' if muted else '0'))
    await pg.goto('http://localhost:8765/games/');await (wiz(pg,'سالم','b',age=sid) if kind=='a' else wiz(pg,'سالم','b',grade=sid))
    await pg.evaluate(SPY)
    await pg.goto(f'http://localhost:8765/games/#g={g}');await pg.reload();await pg.evaluate(SPY);await pg.wait_for_timeout(900)
    btns=await pg.evaluate("[!!document.querySelector('#vmute'),!!document.querySelector('#mute')]")
    t0=time.time()
    while time.time()-t0<40:
        a=await pg.evaluate(STEP_JS)
        if a=='win':break
        await pg.wait_for_timeout(600 if a=='none' else 250)
    a=await pg.evaluate("window.__a");await ctx.close()
    pl=[x for x in a['play'] if 'bgm' not in x[1] and not x[1].startswith('data:')]
    # أسرع تكرار لنفس الملف خلال 250ms
    rep=0
    for i,x in enumerate(pl):
        if any(y[1]==x[1] and 0<x[0]-y[0]<250 for y in pl[:i]):rep+=1
    return dict(game=g,muted=muted,btns=btns,files=len(pl),webaudio=a['start'],rapid_repeat=rep,vol=sorted({round(x[2],2) for x in a['play']}))
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for sid,kind,g in [(2,'a','k_col'),(4,'a','k4_lsnd'),(5,'a','k5_spell'),(1,'g','opp')]:
            for m in (False,True):print(json.dumps(await run(b,sid,kind,g,m),ensure_ascii=False),flush=True)
        await b.close()
asyncio.run(main())
