// NODE_PATH=$(npm root -g) node tools/content/exp/test_exp.js (خادم على 8765 و /tmp/exp_mock.json من build.py)
const {chromium}=require('playwright');const fs=require('fs');
const G=JSON.parse(fs.readFileSync('/tmp/exp_mock.json','utf8'));
const T={a2:1,a3:1,a4:1,a5:2,a6:2,g1:2,g2:2,g3:3,g4:3};
(async()=>{const b=await chromium.launch();const errs=[];let solved=0;
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const p=await b.newPage({viewport:vp});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.route('**/rest/v1/experiments*',r=>{const u=new URL(r.request().url());const s=u.searchParams.get('slug');r.fulfill({json:s?G.filter(g=>'eq.'+g.slug===s):G,headers:{'access-control-allow-origin':'*'}})});
await p.route(/rest\/v1\/(stories|cards|activities|media_aids)/,r=>r.fulfill({json:[{slug:'x',title:'عنصر مرتبط'}],headers:{'access-control-allow-origin':'*'}}));
await p.goto('http://localhost:8765/experiments/');await p.waitForSelector('.tc');
console.log(vp.width,'cards',await p.locator('#sres .tc').count(),'topics',await p.locator('.mk').count());
await p.click('[data-k=kind][data-v=sensory]');console.log('sensory',await p.locator('#sres .tc').count());
await p.click('[data-k=kind][data-v=""]');await p.click('[data-k=adult][data-v=required]');console.log('required',await p.locator('#sres .tc').count());
await p.click('#sclr');await p.fill('#sq','ظل');console.log('search',await p.locator('#sres .tc').count());
await p.screenshot({path:`/tmp/el${vp.width}.png`});
for(const e of (vp.width===390?G:G.filter(g=>['ex-sink-float','sn-light-spot','pr-garden'].includes(g.slug)))){
 const tiers=[...new Set(e.levels.map(l=>T[l]))];
 for(const tier of tiers){
  const lv=e.levels.find(l=>T[l]===tier);
  await p.goto(`http://localhost:8765/experiments/view/?s=${e.slug}&lv=${lv}`);await p.waitForSelector('.hero');
  if(!(await p.locator('#safe li').count()))errs.push(e.slug+' no safety shown');
  const first=await p.evaluate(()=>{const a=[...document.querySelectorAll('#aview > *')];return a.findIndex(x=>x.id==='safe')});if(first>1)errs.push(e.slug+' safety not first '+first);
  const href=await p.getAttribute('#sheet','href');const rs=await p.request.get(href);if(rs.status()!==200)errs.push(e.slug+' sheet '+rs.status());
  if(e.kind==='sensory'){if(await p.locator('.act').count())errs.push(e.slug+' sensory has acts');continue;}
  const acts=e.acts.filter(a=>a.ts.includes(tier));
  const n=await p.locator('.act').count();if(n!==acts.length+1)errs.push(`${e.slug} t${tier} acts ${n}!=${acts.length+1}`);
  for(let i=0;i<acts.length;i++){const a=acts[i];const box=p.locator('.act').nth(i);
   if(a.k==='mc'||a.k==='fill')await box.locator('.opt',{hasText:new RegExp('^'+a.o[a.a].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).click();
   else if(a.k==='tf')await box.locator(`.opt[data-j="${a.a?1:0}"]`).click();
   else if(a.k==='odd')await box.locator(`.opt[data-j="${a.a}"]`).click();
   else if(a.k==='match'){for(let j=0;j<a.p.length;j++){await box.locator(`.opt.L[data-j="${j}"]`).click();await box.locator(`.opt.R[data-j="${j}"]`).click();}}
   else if(a.k==='sort'){for(let j=0;j<a.i.length;j++){await box.locator(`.opt[data-j="${j}"]`).click();await box.locator(`.gb[data-g="${a.i[j][1]}"]`).click();}}
   solved++;}
  const ob=p.locator('.act[data-k=order]');for(let j=0;j<e.steps.length;j++)await ob.locator(`.opt[data-j="${j}"]`).click();solved++;
  const sc=await p.locator('#score').textContent();if(!sc.includes('أنهيت'))errs.push(`${e.slug} t${tier} score: ${sc}`);
  await p.fill('#reflt','تعلمت');const cv=p.locator('#pad');const bb=await cv.boundingBox();await p.mouse.move(bb.x+20,bb.y+20);await p.mouse.down();await p.mouse.move(bb.x+80,bb.y+60);await p.mouse.up();
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(ov)errs.push(e.slug+' overflow '+vp.width);
  const bad=await p.$$eval('img',a=>a.filter(i=>!i.complete||i.naturalWidth===0).length);if(bad)errs.push(e.slug+' broken imgs '+bad);
 }
}
await p.goto('http://localhost:8765/experiments/view/?s=ex-ice-melt&lv=g3');await p.waitForSelector('#lib a');console.log('lib',await p.locator('#lib a').count());
await p.screenshot({path:`/tmp/ev${vp.width}.png`,fullPage:vp.width===390});
await p.goto('http://localhost:8765/experiments/view/?s=none');await p.waitForSelector('.sempty');
}
console.log('solved',solved,'errs',errs);await b.close()})();
