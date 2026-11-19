// NODE_PATH=$(npm root -g) node tools/content/values/test_values.js  (خادم 8765 من جذر المستودع، و /tmp/exp_mock.json من vbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/exp_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const seenCh=new Set();const POSTS=[];const KIN={};const esc=t=>t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{const u=r.url();if(u.startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+u)});
await p.route('**/rest/v1/exp_items*',r=>r.fulfill({json:IT,headers:CORS}));
await p.route('**/rest/v1/exp_events*',r=>{if(r.request().method()==='POST'){POSTS.push(r.request().postData());return r.fulfill({status:201,body:'',headers:CORS});}r.fulfill({json:[],headers:CORS})});
const B='http://localhost:8765/explore/';
const S=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.exp);
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('overflow '+t+' '+vp.width)};
await p.goto(B+'?lv=g1');await p.waitForSelector('.vcard');const nc=await p.locator('.vcard').count();console.log(vp.width,'cards',nc);if(nc!==10)errs.push('cards '+nc);await ov('hub');
await p.screenshot({path:`/tmp/ex_hub${vp.width}.png`,fullPage:true});
await p.goto(B+'?c=animals&lv=g1');await p.waitForSelector('.dgstep');if(await p.locator('.dgstep.lock').count())errs.push('locked');await ov('cat');
for(const lv of ['a2','a3']){const bad=IT.filter(x=>x.levels.includes(lv)&&(lv==='a2'?!['lesson','match','task'].includes(x.kind):false));if(bad.length)errs.push('young kinds '+lv+bad.map(x=>x.slug));}
const click=async t=>p.locator('.opt',{hasText:new RegExp('^\\s*'+esc(t)+'\\s*$')}).first().click();
const solve=async(it,lv,wf)=>{
 await p.goto(`${B}play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('.qh');const d=it.data;KIN[it.kind]=(KIN[it.kind]||0)+1;await ov(it.slug);
 const hard=async()=>{const t=await p.textContent('#aview');if(/خطأ فادح|فشلت|راسب|عقاب|سيئ|كاذب/.test(t))errs.push(it.slug+' harsh');};
 if(it.kind==='lesson'){if(!(await p.textContent('.hint')).includes(d.goal))errs.push(it.slug+' goal');for(let i=0;i<d.pages.length;i++){if((await p.textContent('.stx')).trim()!==d.pages[i].t)errs.push(it.slug+' page '+i);await p.click('#nx');}if(wf)await click(d.check.o[1]);await click(d.check.o[0]);}
 else if(it.kind==='story'){for(let i=0;i<d.pages.length;i++){if((await p.textContent('.stx')).trim()!==d.pages[i].t)errs.push(it.slug+' spage '+i);await p.click('#nx');}
  await p.waitForSelector('.qq');if(wf)await click(d.quiz.o[1]);await click(d.quiz.o[0]);await p.waitForSelector('#dn',{timeout:4000}).catch(()=>errs.push(it.slug+' no act'));await p.click('#dn');}
 else if(it.kind==='quiz'){for(let k=0;k<d.qs.length;k++){await p.waitForSelector('.qq');if(!(await p.textContent('.qq')).includes(d.qs[k].q))errs.push(it.slug+' qs '+k);if(wf&&k===1)await click(d.qs[k].o[1]);await click(d.qs[k].o[0]);await p.waitForTimeout(1300);}}
 else if(it.kind==='choose'){if(wf){await click(d.o[1]);if(!(await p.textContent('#fb')).includes(d.fb[1].slice(0,10)))errs.push(it.slug+' wrong fb');await hard();}await click(d.o[0]);}
 else if(it.kind==='match'){await p.click('.dgm[data-s="l"][data-i="0"]');await p.click('.dgm[data-s="r"][data-i="1"]');if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' match wrong');for(let i=0;i<d.pairs.length;i++){await p.click(`.dgm[data-s="l"][data-i="${i}"]`);await p.click(`.dgm[data-s="r"][data-i="${i}"]`);}}
 else if(it.kind==='order'){for(const s of [...d.steps].reverse())await click(s);await p.click('#chk');if(!(await p.textContent('#fb')).includes('راجع الخطوة'))errs.push(it.slug+' order msg');await p.click('#clr');for(const s of d.steps)await click(s);await p.click('#chk');}
 else if(it.kind==='sort'){const wg=d.items[0].g===0?1:0;const cs=x=>p.locator('.dgcard[data-i]',{hasText:new RegExp('^\\s*'+esc(x.t)+'\\s*$')}).first();await cs(d.items[0]).click();await p.locator(`.dgg[data-g="${wg}"]`).click();if(!(await p.textContent('#fb')).includes('جرّب'))errs.push(it.slug+' sort wrong');for(const x of d.items){await cs(x).click();await p.locator(`.dgg[data-g="${x.g}"]`).click();}}
 else if(it.kind==='task'){for(const c of await p.locator('.dgck input').all())await c.check();await p.click('#dn');}
 await p.waitForSelector('.res',{timeout:6000}).catch(()=>errs.push(it.slug+' no result'));
};
const lvs=vp.width===390?['a2','a4','g1']:['g3'];
for(const lv of lvs){for(const cat of ['animals','plants','space','earth','body','transport','jobs','places','invent','culture']){
  if(vp.width===1200&&!['animals','places'].includes(cat))continue;
  const its=IT.filter(x=>x.cat===cat&&x.levels.includes(lv)).sort((a,b)=>a.step-b.step||a.sort_order-b.sort_order);
  let n=0;for(const it of its)await solve(it,lv,n++%2===0);}}
const pr=await S();console.log(vp.width,'done',Object.keys(pr.it).length,'pts',pr.pts);if(!Object.keys(pr.it).length)errs.push('no progress');

await p.goto(`${B}progress/?lv=g1`);await p.waitForSelector('.pg2');const pt=await p.textContent('#aview');
for(const w of ['نشاطا مكتملا','الموضوعات التي اكتشفها الطفل','نتائج الاختبارات القصيرة','المهارات التي تدرب عليها','التقدم في كل تصنيف','أفكار استكشاف للأسرة'])if(!pt.includes(w))errs.push('progress missing '+w);
if(/قارن|أفضل من|أسوأ/.test(pt.replace('لا نقارنه بغيره','').replace('ولا نقارنه',''))&&/ترتيب الأطفال/.test(pt))errs.push('compare');
await ov('progress');await p.screenshot({path:`/tmp/ex_prog${vp.width}.png`,fullPage:true});
await p.goto(B+'guide/');await p.waitForSelector('.hero');if(!(await p.textContent('h1')).includes('دليل ولي الأمر'))errs.push('guide');await ov('guide');
await p.goto(B+'print/');await p.waitForSelector('.dgi');const links=await p.$$eval('.dgi',a=>a.map(x=>x.href));console.log('pdf links',links.length);if(links.length!==8)errs.push('print links '+links.length);for(const l of links){const r=await p.request.get(l);if(r.status()!==200)errs.push('pdf '+l+' '+r.status());}await ov('print');
// قصة: لقطة
if(vp.width===390){await p.goto(`${B}play/?s=an_s1&lv=a4`);await p.waitForSelector('.spage');await p.click('#nx');await p.click('#nx');await p.click('#nx');await p.locator('.opt').first().click();await p.screenshot({path:'/tmp/ex_story.png'});}
await ctx.close();}
await b.close();console.log('kinds',JSON.stringify(KIN));console.log('events posted',POSTS.length);if(!POSTS.length)errs.push('no events');console.log('DONE errs',JSON.stringify(errs));})();
