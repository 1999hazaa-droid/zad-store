// NODE_PATH=$(npm root -g) node tools/content/life/test_life.js  (خادم 8765 من جذر المستودع، و /tmp/life_mock.json من lbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/life_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const POSTS=[];
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp,hasTouch:false});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.route('**/rest/v1/life_items*',r=>r.fulfill({json:IT,headers:CORS}));
await p.route('**/rest/v1/life_events*',r=>{if(r.request().method()==='POST'){POSTS.push(r.request().postData());return r.fulfill({status:201,body:'',headers:CORS});}r.fulfill({json:[],headers:CORS})});
const B='http://localhost:8765/life/';
const prog=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.life);
// الرئيسية
await p.goto(B+'?lv=g1');await p.waitForSelector('.lfc');const nc=await p.locator('.lfc').count();console.log(vp.width,'cats',nc);if(nc!==8)errs.push('cats '+nc);
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('hub overflow '+vp.width);
await p.screenshot({path:`/tmp/life_hub${vp.width}.png`});
// تصنيف: قفل المستويات
await p.goto(B+'?c=hyg&lv=g1');await p.waitForSelector('.lfstep');
const locks=await p.locator('.lfstep.lock').count();const open=await p.locator('.lfstep:not(.lock) .lfi').count();console.log('hyg g1 locks',locks,'open items',open);
if(locks<1||open!==1)errs.push(`lock logic ${locks}/${open}`);
// a2: دروس ومهام فقط
await p.goto(B+'?c=safety&lv=a2');await p.waitForSelector('.lfstep');const a2k=await p.$$eval('.lfi small',a=>a.map(x=>x.textContent));if(a2k.some(t=>/اختيار|ترتيب|سحب/.test(t)))errs.push('a2 kinds '+a2k);
// حل كل الأنشطة: مرحلة g1 (كل المستويات تُفتح بالتتابع)
const solve=async(it,lv)=>{
 await p.goto(`${B}play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('.qh');const d=it.data;
 const click=async t=>p.locator('.opt',{hasText:new RegExp('^\\s*'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first().click();
 if(it.kind==='lesson'){for(let i=0;i<d.pages.length;i++){const tx=(await p.textContent('.stx')).trim();if(tx!==d.pages[i].t)errs.push(it.slug+' page '+i);await p.click('#nx');}await click(d.check.o[0]);}
 else if(it.kind==='choose'){ // خطأ أولًا ثم صحيح
  await click(d.o[1]);const f=await p.textContent('#fb');if(!f.includes(d.fb[1].slice(0,10)))errs.push(it.slug+' wrong fb');if(/فاشل|ضعيف|غبي/.test(f))errs.push('harsh fb');
  await click(d.o[0]);const g=await p.textContent('#fb');if(!g.includes(d.fb[0].slice(0,10)))errs.push(it.slug+' right fb');}
 else if(it.kind==='order'){ // ترتيب خاطئ أولًا
  const rev=[...d.steps].reverse();for(const s of rev)await click(s);await p.click('#chk');if(!(await p.textContent('#fb')).includes('راجع الخطوة'))errs.push(it.slug+' order wrong msg');await p.click('#clr');
  for(const s of d.steps)await click(s);await p.click('#chk');}
 else if(it.kind==='sort'){
  const wrongG=d.items[0].g===0?1:0;await p.locator('.lfcard[data-i]',{hasText:new RegExp('^'+d.items[0].t+'$')}).first().click();await p.locator(`.lfg[data-g="${wrongG}"]`).click();if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' sort wrong msg');
  for(const x of d.items){const c=p.locator('.lfcard[data-i]',{hasText:new RegExp('^'+x.t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first();await c.click();await p.locator(`.lfg[data-g="${x.g}"]`).click();}}
 else if(it.kind==='task'){for(const c of await p.locator('.lfck input').all())await c.check();await p.click('#dn');}
 await p.waitForSelector('.res',{timeout:5000}).catch(()=>errs.push(it.slug+' no result'));
};
const lvs=vp.width===390?['a2','a4','g1','g3']:['a6'];
for(const lv of lvs){
 for(const cat of ['hyg','time','money','manners','safety','home','think','env']){
  if(vp.width===1200&&cat!=='safety'&&cat!=='money')continue;
  const its=IT.filter(x=>x.cat===cat&&x.levels.includes(lv)).sort((a,b)=>a.step-b.step||a.sort_order-b.sort_order);
  for(const it of its)await solve(it,lv);
 }
}
const pr=await prog();const done=Object.keys(pr.it).length;console.log(vp.width,'done',done,'pts',pr.pts);
if(!done)errs.push('no progress');
// فتح المستويات بعد الإكمال
const lvT=lvs[lvs.length-1];await p.goto(`${B}?c=safety&lv=${lvT}`);await p.waitForSelector('.lfstep');if(await p.locator('.lfstep.lock').count())errs.push('still locked after completing');
// سحب وإفلات بالفأرة (سطح المكتب) على نشاط سحب
const sorts=IT.filter(x=>x.kind==='sort'&&x.levels.includes('g1'));const sIt=sorts[0];
await p.goto(`${B}play/?s=${sIt.slug}&lv=g1`);await p.waitForSelector('.lfcard[data-i]');
const x0=sIt.data.items[0];const card=p.locator('.lfcard[data-i]',{hasText:new RegExp('^'+x0.t+'$')}).first();const cb=await card.boundingBox();const gb=await p.locator(`.lfg[data-g="${x0.g}"]`).boundingBox();
await p.mouse.move(cb.x+cb.width/2,cb.y+cb.height/2);await p.mouse.down();await p.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2,{steps:8});await p.mouse.up();
if(!(await p.textContent('#fb')).includes('صحيح'))errs.push('drag drop failed');
if(await p.locator(`.lfg[data-g="${x0.g}"] .lfcard.on`).count()!==1)errs.push('dropped card not placed');
// التقدم
await p.goto(B+'progress/');await p.waitForSelector('.pg2');if(!(await p.textContent('.pg2')).includes('نشاطا'))errs.push('progress');
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('progress overflow');
await p.screenshot({path:`/tmp/life_prog${vp.width}.png`});
// الطباعة
await p.goto(B+'print/');await p.waitForSelector('.lfi');const links=await p.$$eval('.lfi',a=>a.map(x=>x.href));if(links.length!==7)errs.push('print links');
for(const l of links){const r=await p.request.get(l);if(r.status()!==200)errs.push('pdf '+l+' '+r.status());}
// الصوت لا يعمل تلقائيا
await p.addInitScript(()=>{window.__sp=0;try{speechSynthesis.speak=()=>{window.__sp++}}catch{}});
await ctx.close();}
await b.close();console.log('events posted',POSTS.length,POSTS[0]);if(!POSTS.length)errs.push('no events');console.log('errs',JSON.stringify(errs));})();
