// NODE_PATH=$(npm root -g) node tools/content/digital/test_dig.js  (خادم 8765 من جذر المستودع، و /tmp/dig_mock.json من dbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/dig_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const POSTS=[];const KIN={};
const DR=[[-1,0],[0,1],[1,0],[0,-1]];
function run1(n,s,W,c){let [r,k,d]=s;if(c==='l')d=(d+3)%4;else if(c==='r')d=(d+1)%4;else for(let i=0;i<(c==='f3'?3:1);i++){r+=DR[d][0];k+=DR[d][1];if(r<0||k<0||r>=n||k>=n||W.has(r+','+k))return null;}return [r,k,d];}
function bfs(d){const W=new Set(d.walls.map(w=>w.join(',')));const q=[[d.start,[]]],seen=new Set([d.start.join(',')]);while(q.length){const [s,p]=q.shift();if(p.length&&s[0]===d.goal[0]&&s[1]===d.goal[1])return p;for(const c of d.cmds){const t=run1(d.size,s,W,c);if(t&&!seen.has(t.join(','))){seen.add(t.join(','));q.push([t,p.concat(c)]);}}}return null;}
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{const u=r.url();if(u.startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+u)});
await p.route('**/rest/v1/dig_items*',r=>r.fulfill({json:IT,headers:CORS}));
await p.route('**/rest/v1/dig_events*',r=>{if(r.request().method()==='POST'){POSTS.push(r.request().postData());return r.fulfill({status:201,body:'',headers:CORS});}r.fulfill({json:[],headers:CORS})});
const B='http://localhost:8765/digital/';
const prog=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.dig);
const ov=async(t)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('overflow '+t+' '+vp.width)};
await p.goto(B+'?lv=g1');await p.waitForSelector('.dgc');const nc=await p.locator('.dgc').count();console.log(vp.width,'cats',nc);if(nc!==8)errs.push('cats '+nc);await ov('hub');
await p.screenshot({path:`/tmp/dig_hub${vp.width}.png`,fullPage:true});
await p.goto(B+'?c=dev&lv=g1');await p.waitForSelector('.dgstep');
const locks=await p.locator('.dgstep.lock').count();const open=await p.locator('.dgstep:not(.lock) .dgi').count();console.log('dev g1 locks',locks,'open',open);if(locks<1||open!==1)errs.push(`lock ${locks}/${open}`);
for(const lv of ['a2','a3']){for(const c of ['dev','basic','logic','code','create','search','safe','ai']){await p.goto(`${B}?c=${c}&lv=${lv}`);await p.waitForSelector('.dgstep');const ks=await p.$$eval('.dgi small',a=>a.map(x=>x.textContent));if(ks.some(t=>/اختيار|ترتيب|تصنيف|برمجة|كتابة|مشروع|اكتشاف/.test(t)))errs.push('young kinds '+c+lv+ks);}}
const click=async t=>p.locator('.opt',{hasText:new RegExp('^\\s*'+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first().click();
const optImg=async ic=>p.locator(`.opt:has(img[src*="/${ic}."])`).first();
const solve=async(it,lv)=>{
 await p.goto(`${B}play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('.qh');const d=it.data;KIN[it.kind]=(KIN[it.kind]||0)+1;
 if(['lesson','pattern'].includes(it.kind)||true){await ov(it.slug);}
 if(it.kind==='lesson'){if(!(await p.textContent('.hint')).includes(d.goal))errs.push(it.slug+' goal');for(let i=0;i<d.pages.length;i++){const tx=(await p.textContent('.stx')).trim();if(tx!==d.pages[i].t)errs.push(it.slug+' page '+i);await p.click('#nx');}await click(d.check.o[0]);}
 else if(it.kind==='choose'){await click(d.o[1]);const f=await p.textContent('#fb');if(!f.includes(d.fb[1].slice(0,10)))errs.push(it.slug+' wrong fb');await click(d.o[0]);if(!(await p.textContent('#fb')).includes(d.fb[0].slice(0,10)))errs.push(it.slug+' right fb');}
 else if(it.kind==='pattern'){await (await optImg(d.o[1])).click();if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' pat wrong');await (await optImg(d.o[0])).click();}
 else if(it.kind==='match'){await p.click('.dgm[data-s="l"][data-i="0"]');await p.click('.dgm[data-s="r"][data-i="1"]');if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' match wrong');
  for(let i=0;i<d.pairs.length;i++){await p.click(`.dgm[data-s="l"][data-i="${i}"]`);await p.click(`.dgm[data-s="r"][data-i="${i}"]`);}}
 else if(it.kind==='order'){const rev=[...d.steps].reverse();for(const s of rev)await click(s);await p.click('#chk');if(!(await p.textContent('#fb')).includes('راجع الخطوة'))errs.push(it.slug+' order msg');await p.click('#clr');for(const s of d.steps)await click(s);await p.click('#chk');}
 else if(it.kind==='sort'){const wg=d.items[0].g===0?1:0;const cs=x=>p.locator('.dgcard[data-i]',{hasText:new RegExp('^\\s*'+x.t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();
  await cs(d.items[0]).click();await p.locator(`.dgg[data-g="${wg}"]`).click();if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' sort wrong');
  for(const x of d.items){await cs(x).click();await p.locator(`.dgg[data-g="${x.g}"]`).click();}}
 else if(it.kind==='code'){const sol=bfs(d);if(!sol){errs.push(it.slug+' nosol');return;}
  await p.click('.dgcmd[data-c="r"]');await p.click('#run');await p.waitForFunction(()=>/لم يصل|اصطدم/.test(document.querySelector('#fb').textContent),null,{timeout:15000}).catch(()=>errs.push(it.slug+' code wrong msg'));
  await p.click('#clr');for(const c of sol)await p.click(`.dgcmd[data-c="${c}"]`);await p.click('#run');await p.waitForSelector('.res',{timeout:30000}).catch(()=>errs.push(it.slug+' code no win'));}
 else if(it.kind==='type'){await p.click(`.dgkey[data-k="${d.text[0]}"]`);await p.click('#ok');if(!(await p.textContent('#fb')).includes('رقم'))errs.push(it.slug+' type wrong');await p.click('#bk');
  for(const ch of d.text)if(ch!==' ')await p.click(`.dgkey[data-k="${ch}"]`);await p.click('#ok');}
 else if(it.kind==='make'){
  if(d.type==='draw'){const cv=await p.locator('#cv').boundingBox();for(let k=0;k<3;k++){await p.mouse.move(cv.x+30+k*30,cv.y+30);await p.mouse.down();await p.mouse.move(cv.x+80+k*30,cv.y+90,{steps:5});await p.mouse.up();}
   if(await p.locator('#sv').isDisabled())errs.push(it.slug+' save disabled');await p.click('#sv');}
  else{const F=d.type==='slides'?3:1;if(!(await p.locator('#sv').isDisabled()))errs.push(it.slug+' save enabled early');
   for(let f=0;f<F;f++){await p.locator('.dgsk').nth(f).click();await p.fill('#tx','كلمة جميلة');if(f<F-1)await p.click('#nx');}
   if(await p.locator('#sv').isDisabled())errs.push(it.slug+' save still disabled');
   await p.fill('#tx','12345678');await p.click('#sv');if(!(await p.textContent('#ltoast').catch(()=>''))&&!(await p.locator('#ltoast').count()))errs.push(it.slug+' phone digits not blocked');await p.fill('#tx','كلمة جميلة');await p.click('#sv');}}
 else if(it.kind==='task'){for(const c of await p.locator('.dgck input').all())await c.check();await p.click('#dn');}
 await p.waitForSelector('.res',{timeout:5000}).catch(()=>errs.push(it.slug+' no result'));
};
const lvs=vp.width===390?['a2','a4','g1','g3']:['a6'];
for(const lv of lvs){for(const cat of ['dev','basic','logic','code','create','search','safe','ai']){
  if(vp.width===1200&&!['code','create','safe'].includes(cat))continue;
  const its=IT.filter(x=>x.cat===cat&&x.levels.includes(lv)).sort((a,b)=>a.step-b.step||a.sort_order-b.sort_order);
  for(const it of its)await solve(it,lv);}}
const pr=await prog();console.log(vp.width,'done',Object.keys(pr.it).length,'pts',pr.pts,'proj',(pr.proj||[]).length);if(!Object.keys(pr.it).length)errs.push('no progress');
const lvT=lvs[lvs.length-1];await p.goto(`${B}?c=code&lv=${lvT}`);await p.waitForSelector('.dgstep');if(await p.locator('.dgstep.lock').count())errs.push('still locked');
// سحب وإفلات بالفأرة
const sIt=IT.filter(x=>x.kind==='sort'&&x.levels.includes('g1'))[0];await p.goto(`${B}play/?s=${sIt.slug}&lv=g1`);await p.waitForSelector('.dgcard[data-i]');
const x0=sIt.data.items[0];const card=p.locator('.dgcard[data-i]',{hasText:new RegExp('^\\s*'+x0.t+'\\s*$')}).first();const cb=await card.boundingBox();const gb=await p.locator(`.dgg[data-g="${x0.g}"]`).boundingBox();
await p.mouse.move(cb.x+cb.width/2,cb.y+cb.height/2);await p.mouse.down();await p.mouse.move(gb.x+gb.width/2,gb.y+gb.height/2,{steps:8});await p.mouse.up();
if(!(await p.textContent('#fb')).includes('صحيح'))errs.push('drag failed');
// لوحة ولي الأمر
await p.goto(B+'progress/');await p.waitForSelector('.pg2');const pt=await p.textContent('.dg main, #aview');if(!/درسا مكتملا/.test(pt))errs.push('progress txt');if(vp.width===390&&!(await p.locator('.dgpj img').count()))errs.push('no project thumbs');await ov('progress');
await p.screenshot({path:`/tmp/dig_prog${vp.width}.png`,fullPage:true});
await p.goto(B+'print/');await p.waitForSelector('.dgi');const links=await p.$$eval('.dgi',a=>a.map(x=>x.href));if(links.length!==6)errs.push('print links');for(const l of links){const r=await p.request.get(l);if(r.status()!==200)errs.push('pdf '+l+' '+r.status());}
await ctx.close();}
await b.close();console.log('kinds',JSON.stringify(KIN));console.log('events posted',POSTS.length);if(!POSTS.length)errs.push('no events');console.log('DONE errs',JSON.stringify(errs));})();
