// NODE_PATH=$(npm root -g) node tools/content/arts/test_arts.js (خادم على 8765 و /tmp/arts_mock.json من abuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const G=JSON.parse(fs.readFileSync('/tmp/arts_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
(async()=>{const b=await chromium.launch();const errs=[];let views=0;
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const p=await b.newPage({viewport:vp});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.route('**/rest/v1/art_activities*',r=>{const u=new URL(r.request().url());const s=u.searchParams.get('slug');r.fulfill({json:s?G.filter(g=>'eq.'+g.slug===s):G,headers:CORS})});
await p.route('**/rest/v1/wiki_topics*',r=>r.fulfill({json:[{slug:'x',title:'موضوع مرتبط'}],headers:CORS}));
await p.route('**/rest/v1/cards*',r=>r.fulfill({json:[{slug:'x'}],headers:CORS}));
await p.route('**/rest/v1/art_gallery*',r=>r.fulfill({json:[],headers:CORS}));
await p.goto('http://localhost:8765/arts/');await p.waitForSelector('.tc');
const n=await p.locator('#sres .tc').count();console.log(vp.width,'cards',n,'cats',await p.locator('.mk').count());if(n!==G.length)errs.push('cards '+n);
await p.click('[data-k=cat][data-v=cutpaste]');console.log('cutpaste',await p.locator('#sres .tc').count());
await p.click('#sclr');await p.click('[data-k=stage][data-v=age]');await p.click('[data-k=lv][data-v=a2]');const a2=await p.locator('#sres .tc').count();console.log('a2',a2);if(a2!==2)errs.push('a2 '+a2);
await p.click('#sclr');await p.fill('#sq','سمكة');console.log('search',await p.locator('#sres .tc').count());
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('list overflow '+vp.width);
await p.screenshot({path:`/tmp/al${vp.width}.png`});
for(const e of (vp.width===390?G:G.filter(g=>['co-animals','cp-puzzle','dr-free'].includes(g.slug)))){
 await p.goto(`http://localhost:8765/arts/view/?s=${e.slug}`);await p.waitForSelector('.hero');await p.waitForSelector('#back');views++;
 if(await p.locator('.stp li').count()!==e.steps.length)errs.push(e.slug+' steps');
 if(await p.locator('.mats div').count()!==e.materials.length)errs.push(e.slug+' mats');
 const href=await p.getAttribute('#pdf','href');const rs=await p.request.get(href);if(rs.status()!==200||!(await rs.body()).slice(0,4).toString().startsWith('%PDF'))errs.push(e.slug+' pdf '+rs.status());
 const st=await p.locator('#start').count();if(!!(e.template||e.slug==='dr-free')!==!!st)errs.push(e.slug+' start btn '+st);
 if(e.template){const sv=await p.locator('section svg').count();if(!sv)errs.push(e.slug+' no picture');}
 const bad=await p.$$eval('img',a=>a.filter(i=>!i.complete||i.naturalWidth===0).length);if(bad)errs.push(e.slug+' broken imgs '+bad);
 if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push(e.slug+' overflow '+vp.width);
 if(e.slug==='co-animals'){await p.waitForSelector('#lib a');console.log('lib',await p.locator('#lib a').count());await p.screenshot({path:`/tmp/av${vp.width}.png`,fullPage:vp.width===390});
  const h=await p.getAttribute('#start','href');await p.goto(new URL(h,'http://localhost:8765/arts/view/').href);await p.waitForSelector('#pc');console.log('studio ok',h);}
}
await p.goto('http://localhost:8765/arts/view/?s=none');await p.waitForSelector('.sempty');
await p.goto('http://localhost:8765/arts/gallery/');await p.waitForSelector('.sempty');console.log('gallery empty ok');
await p.unroute('**/rest/v1/art_gallery*');await p.route('**/rest/v1/art_gallery*',r=>r.fulfill({json:[{id:'1',image:'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',activity_slug:'x'}],headers:CORS}));
await p.goto('http://localhost:8765/arts/gallery/');await p.waitForSelector('.gal img');console.log('gallery items',await p.locator('.gal img').count());
}
console.log('views',views,'errs',errs);await b.close()})();
