// اختبار محاكي: NODE_PATH=$(npm root -g) node tools/content/wiki/test_wiki.js (يحتاج خادمًا على 8765 و /tmp/wiki_mock.json من build.py)
const {chromium}=require('playwright');const fs=require('fs');
const G=JSON.parse(fs.readFileSync('/tmp/wiki_mock.json','utf8'));
(async()=>{const b=await chromium.launch();const errs=[];let solved=0;
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const p=await b.newPage({viewport:vp});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.route('**/rest/v1/wiki_topics*',r=>{const u=new URL(r.request().url());const s=u.searchParams.get('slug');r.fulfill({json:s?G.filter(g=>'eq.'+g.slug===s):G,headers:{'access-control-allow-origin':'*'}})});
await p.route(/rest\/v1\/(stories|cards|activities|media_aids)/,r=>r.fulfill({json:[{slug:'x',title:'عنصر مرتبط'}],headers:{'access-control-allow-origin':'*'}}));
await p.goto('http://localhost:8765/wiki/');await p.waitForSelector('.tc');
console.log(vp.width,'cards',await p.locator('#sres .tc').count(),'facts',await p.locator('#dyk .fc').count(),'cats',await p.locator('.mk').count());
await p.click('[data-k=cat][data-v=space]');console.log('space',await p.locator('#sres .tc').count());
await p.click('.mk.on');await p.fill('#sq','نحلة');console.log('search',await p.locator('#sres .tc').count());
await p.screenshot({path:`/tmp/wl${vp.width}.png`});
for(const tier of [1,2,3]){
 const lv={1:'a4',2:'a6',3:'g3'}[tier];
 for(const slug of (vp.width===390?G.map(g=>g.slug):['wk-pets','wk-sound'])){
  await p.goto(`http://localhost:8765/wiki/view/?s=${slug}&lv=${lv}`);await p.waitForSelector('.hero');
  const t=G.find(g=>g.slug===slug);const acts=t.acts.filter(a=>a.ts.includes(tier));
  const n=await p.locator('.act').count();if(n!==acts.length)errs.push(`${slug} t${tier} acts ${n}!=${acts.length}`);
  for(let i=0;i<acts.length;i++){const a=acts[i];const box=p.locator('.act').nth(i);
   if(a.k==='mc'||a.k==='fill')await box.locator('.opt',{hasText:new RegExp('^'+a.o[a.a].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).click();
   else if(a.k==='tf')await box.locator(`.opt[data-j="${a.a?1:0}"]`).click();
   else if(a.k==='odd')await box.locator(`.opt[data-j="${a.a}"]`).click();
   else if(a.k==='match'){for(let j=0;j<a.p.length;j++){await box.locator(`.opt.L[data-j="${j}"]`).click();await box.locator(`.opt.R[data-j="${j}"]`).click();}}
   else if(a.k==='sort'){for(let j=0;j<a.i.length;j++){await box.locator(`.opt[data-j="${j}"]`).click();await box.locator(`.gb[data-g="${a.i[j][1]}"]`).click();}}
   solved++;
  }
  const sc=await p.locator('#score').textContent();if(!sc.includes('أنهيت'))errs.push(`${slug} t${tier} score: ${sc}`);
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(ov)errs.push(slug+' overflow '+vp.width);
  const bad=await p.$$eval('img',a=>a.filter(i=>!i.complete||i.naturalWidth===0).length);if(bad)errs.push(slug+' broken imgs '+bad);
 }
}
await p.goto('http://localhost:8765/wiki/view/?s=wk-sea&lv=g3');await p.waitForSelector('#lib:not([hidden])');console.log('lib links',await p.locator('#lib a').count(),'more',await p.locator('#more .tc').count());
await p.screenshot({path:`/tmp/wv${vp.width}.png`,fullPage:vp.width===390});
await p.goto('http://localhost:8765/wiki/view/?s=none');await p.waitForSelector('.sempty');
}
console.log('solved',solved,'errs',errs);await b.close()})();
