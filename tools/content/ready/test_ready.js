// NODE_PATH=$(npm root -g) node tools/content/ready/test_ready.js  (خادم 8765 من جذر المستودع، و /tmp/ready_mock.json من rbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/ready_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const POSTS=[];const KIN={};const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{const u=r.url();if(u.startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+u)});
await p.route('**/rest/v1/ready_items*',r=>r.fulfill({json:IT,headers:CORS}));
await p.route('**/rest/v1/ready_events*',r=>{if(r.request().method()==='POST'){POSTS.push(r.request().postData());return r.fulfill({status:201,body:'',headers:CORS});}r.fulfill({json:[],headers:CORS})});
const B='http://localhost:8765/ready/';
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.ready);
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('overflow '+t+' '+vp.width)};
await p.goto(B+'?lv=g1');await p.waitForSelector('.dgc');const nc=await p.locator('.dgcats .dgc').count();console.log(vp.width,'paths',nc);if(nc!==5)errs.push('paths '+nc);await ov('hub');
await p.screenshot({path:`/tmp/rd_hub${vp.width}.png`,fullPage:true});
await p.goto(B+'?c=lang&lv=g1');await p.waitForSelector('.dgstep');
const locks=await p.locator('.dgstep.lock').count();const open=await p.locator('.dgstep:not(.lock) .dgi').count();console.log('lang g1 locks',locks,'open',open);if(locks<1||open<1)errs.push(`lock ${locks}/${open}`);await ov('cat');
for(const lv of ['a2','a3']){const bad=IT.filter(x=>x.levels.includes(lv)&&(lv==='a2'?!['lesson','match','task','odd'].includes(x.kind):!['lesson','match','task','odd','memory','quant','choose','trace','follow'].includes(x.kind)));if(bad.length)errs.push('young kinds '+lv+bad.map(x=>x.slug));}
const click=async t=>p.locator('.opt',{hasText:new RegExp('^\\s*'+esc(t)+'\\s*$')}).first().click();
const optImg=ic=>p.locator(`.opt:has(img[src*="/${ic}."])`).first();
async function trace(d,good){const pts=await p.evaluate(([s])=>window.__rdPath(s,480,300),[d.shape]);const cv=await p.locator('#cv').boundingBox();const f=q=>[cv.x+q[0]*cv.width/480,cv.y+q[1]*cv.height/300];
 const path=good?pts:[pts[0],[400,20],[300,15],[200,10],[100,15],[30,20]];let s0=f(path[0]);await p.mouse.move(s0[0],s0[1]);await p.mouse.down();for(const q of path){const z=f(q);await p.mouse.move(z[0],z[1]);}await p.mouse.up();}
const solve=async(it,lv,wrongFirst)=>{
 await p.goto(`${B}play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('.qh');const d=it.data;KIN[it.kind]=(KIN[it.kind]||0)+1;await ov(it.slug);
 const wf=async(sel)=>{if(!(await p.textContent('#fb')).trim())errs.push(it.slug+' no wrong fb');};
 if(it.kind==='lesson'){if(!(await p.textContent('.hint')).includes(d.goal))errs.push(it.slug+' goal');for(let i=0;i<d.pages.length;i++){const tx=(await p.textContent('.stx')).trim();if(tx!==d.pages[i].t)errs.push(it.slug+' page '+i);await p.click('#nx');}if(wrongFirst){await click(d.check.o[1]);if(/خطأ|خاطئ|فشل|سيئ/.test(await p.textContent('#fb')))errs.push(it.slug+' harsh');}await click(d.check.o[0]);}
 else if(it.kind==='choose'||it.kind==='quant'){if(wrongFirst){await click(d.o[1]);await wf();}await click(d.o[0]);}
 else if(it.kind==='pattern'){if(wrongFirst){await (await optImg(d.o[1])).click();await wf();}await (await optImg(d.o[0])).click();}
 else if(it.kind==='odd'){if(wrongFirst){await p.locator('.opt[data-o="0"]').first().click();await wf();}await p.locator('.opt[data-o="1"]').first().click();}
 else if(it.kind==='memory'){const ics=d.icons;if(ics.length>1){await p.locator(`.rdcard[data-ic="${ics[0]}"]`).first().click();await p.locator(`.rdcard[data-ic="${ics[1]}"]`).first().click();await p.waitForTimeout(1000);}
  for(const ic of ics){const c=p.locator(`.rdcard[data-ic="${ic}"]`);await c.nth(0).click();await c.nth(1).click();}}
 else if(it.kind==='match'){await p.click('.dgm[data-s="l"][data-i="0"]');await p.click('.dgm[data-s="r"][data-i="1"]');if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' match wrong');for(let i=0;i<d.pairs.length;i++){await p.click(`.dgm[data-s="l"][data-i="${i}"]`);await p.click(`.dgm[data-s="r"][data-i="${i}"]`);}}
 else if(it.kind==='order'){for(const s of [...d.steps].reverse())await click(s);await p.click('#chk');if(!(await p.textContent('#fb')).includes('راجع الخطوة'))errs.push(it.slug+' order msg');await p.click('#clr');for(const s of d.steps)await click(s);await p.click('#chk');}
 else if(it.kind==='sort'){const wg=d.items[0].g===0?1:0;const cs=x=>p.locator('.dgcard[data-i]',{hasText:new RegExp('^\\s*'+esc(x.t)+'\\s*$')}).first();await cs(d.items[0]).click();await p.locator(`.dgg[data-g="${wg}"]`).click();if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' sort wrong');for(const x of d.items){await cs(x).click();await p.locator(`.dgg[data-g="${x.g}"]`).click();}}
 else if(it.kind==='trace'){if(wrongFirst===undefined||!wrongFirst){}if(wrongFirst){await trace(d,false);await p.waitForTimeout(1100);}await trace(d,true);}
 else if(it.kind==='follow'){const other=[...Array(d.imgs.length).keys()].find(i=>i!==d.seq[0]);if(wrongFirst){await p.locator('.rdimgs .opt').nth(other).click();await wf();}for(const i of d.seq)await p.locator('.rdimgs .opt').nth(i).click();}
 else if(it.kind==='task'){for(const c of await p.locator('.dgck input').all())await c.check();await p.click('#dn');}
 await p.waitForSelector('.res',{timeout:6000}).catch(()=>errs.push(it.slug+' no result'));
};
const lvs=vp.width===390?['a2','a4','g1']:['a6'];
for(const lv of lvs){for(const cat of ['lang','math','percep','focus','motor','social','indep']){
  if(vp.width===1200&&!['math','motor','focus'].includes(cat))continue;
  const its=IT.filter(x=>x.cat===cat&&x.levels.includes(lv)).sort((a,b)=>a.step-b.step||a.sort_order-b.sort_order);
  let n=0;for(const it of its)await solve(it,lv,n++%2===0&&it.kind!=='trace'||(it.kind==='trace'&&n%3===0));}}
const pr=await S();console.log(vp.width,'done',Object.keys(pr.it).length,'pts',pr.pts);if(!Object.keys(pr.it).length)errs.push('no progress');
// يومي الأول
const dlv=vp.width===390?'a4':'a6';await p.goto(`${B}day/?lv=${dlv}`);await p.waitForSelector('#go');await ov('day');await p.click('#go');
const scenes=IT.filter(x=>x.cat==='day'&&x.levels.includes(dlv)).sort((a,b)=>a.sort_order-b.sort_order);console.log('day scenes',scenes.length);if(scenes.length!==8)errs.push('day scenes '+scenes.length);
for(let i=0;i<scenes.length;i++){await p.waitForSelector('.qh small');const lab=await p.textContent('.qh small');if(!lab.includes('المشهد'))errs.push('day label '+lab);const t=await p.textContent('.stx');if(t.trim()!==scenes[i].data.scene.trim())errs.push('day scene txt '+i);const d=scenes[i].data;await click(d.o[1]);await click(d.o[0]);await p.waitForFunction(k=>k===7?!!document.querySelector('.res'):document.querySelector('.stx')&&document.querySelector('.stx').textContent.trim()!==document.querySelector('.stx').dataset.prev,i,{timeout:4000}).catch(()=>{});await p.waitForTimeout(1400);}
if(!(await p.textContent('#aview')).includes('أنهيت يومك الأول'))errs.push('day end');
// اختبار المهارات
const clv=vp.width===390?'g1':'a5';await p.goto(`${B}check/?lv=${clv}`);await p.waitForSelector('#go');if(!(await p.textContent('#aview')).includes('ليست تشخيصا طبيا'))errs.push('no disclaimer');await p.click('#go');
const chk=IT.filter(x=>x.cat==='chk'&&x.levels.includes(clv)).sort((a,b)=>a.sort_order-b.sort_order);console.log('chk items',chk.length);let sawNeutral=false;
for(const it of chk){await p.waitForSelector('.qh small');const d=it.data;const wrongThis=d.area==='memory'||d.area==='motor';
 if(it.kind==='choose'||it.kind==='quant'){await click(wrongThis?d.o[1]:d.o[0]);}
 else if(it.kind==='odd'){await p.locator(`.opt[data-o="${wrongThis?0:1}"]`).first().click();}
 else if(it.kind==='pattern'){await (await optImg(wrongThis?d.o[1]:d.o[0])).click();}
 else if(it.kind==='follow'){const other=[...Array(d.imgs.length).keys()].find(i=>i!==d.seq[0]);if(wrongThis)await p.locator('.rdimgs .opt').nth(other).click();else for(const i of d.seq)await p.locator('.rdimgs .opt').nth(i).click();}
 else if(it.kind==='trace'){await trace(d,!wrongThis);}
 if(wrongThis&&(await p.textContent('#fb').catch(()=>'')).includes('شكرا لمحاولتك'))sawNeutral=true;
 await p.waitForTimeout(1600);}
await p.waitForFunction(()=>/مؤشرات المهارات/.test(document.body.textContent),null,{timeout:8000}).catch(()=>errs.push('no check results'));
const rt=await p.textContent('#aview');if(!rt.includes('ليست تشخيصا طبيا'))errs.push('result disclaimer');if(!/تحتاج إلى مزيد من التدريب|يمكن التدرب عليها/.test(rt))errs.push('no weak indicator');if(!/تظهر المهارة بوضوح/.test(rt))errs.push('no strong indicator');if(/فشل|راسب|ضعيف|متأخر|غير مستعد/.test(rt))errs.push('harsh words in results');if(!sawNeutral)errs.push('neutral wrong msg not seen');await ov('results');
await p.screenshot({path:`/tmp/rd_res${vp.width}.png`,fullPage:true});
// لوحة ولي الأمر
await p.goto(`${B}progress/?lv=${clv}`);await p.waitForSelector('.pg2');const pt=await p.textContent('#aview');if(!/نشاطا مكتملا/.test(pt))errs.push('progress txt');if(!/آخر مؤشرات للمهارات/.test(pt))errs.push('progress no indicators');if(!/مهارات تحتاج إلى مزيد من التدريب/.test(pt))errs.push('progress no weak');if(!(await p.locator('.rdtips li').count()))errs.push('no home tips');if(!pt.includes('يومي الأول في المدرسة'))errs.push('progress no day');await ov('progress');
await p.screenshot({path:`/tmp/rd_prog${vp.width}.png`,fullPage:true});
await p.goto(B+'guide/');await p.waitForSelector('.hero');if(!(await p.textContent('h1')).includes('دليل ولي الأمر'))errs.push('guide');await ov('guide');
await p.goto(B+'print/');await p.waitForSelector('.dgi');const links=await p.$$eval('.dgi',a=>a.map(x=>x.href));console.log('pdf links',links.length);if(links.length!==8)errs.push('print links '+links.length);for(const l of links){const r=await p.request.get(l);if(r.status()!==200)errs.push('pdf '+l+' '+r.status());}await ov('print');
await ctx.close();}
await b.close();console.log('kinds',JSON.stringify(KIN));console.log('events posted',POSTS.length);if(!POSTS.length)errs.push('no events');console.log('DONE errs',JSON.stringify(errs));})();
