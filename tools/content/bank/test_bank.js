// NODE_PATH=$(npm root -g) node tools/content/bank/test_bank.js  (خادم 8765 من جذر المستودع و /tmp/bank_mock.json من bbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/bank_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const FAST=`(()=>{const o=window.setTimeout;window.setTimeout=(f,d,...a)=>o(f,d>=800?30:d,...a);const st=document;window.__sp=[];class U{constructor(t){this.text=t}}window.SpeechSynthesisUtterance=U;Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],addEventListener(){},cancel(){},speak(u){window.__sp.push(u.text)}}});})();`;
const AD=s=>String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const norm=(it,s)=>it.cat==='english'?s:AD(s);
(async()=>{const b=await chromium.launch();const errs=[];let solved=0;
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(FAST);const p=await ctx.newPage();p.setDefaultTimeout(5000);p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+r.url())});
await p.route('**/rest/v1/bank_items*',r=>r.fulfill({json:IT,headers:CORS}));
const B='http://localhost:8765/bank/';
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
const ST=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.bank);
// ===== المحور
await p.goto(B+'?lv=g1');await p.waitForSelector('.bkc');await ov('hub');
const g1=IT.filter(x=>x.levels.includes('g1'));const nc=await p.locator('#bkres .bkc').count();if(nc!==g1.length)errs.push('hub cards '+nc+' vs '+g1.length);
for(const lv of ['a2','a3','a4','a5','a6','g1','g2','g3','g4']){const n=IT.filter(x=>x.levels.includes(lv)).length;const kinds=new Set(IT.filter(x=>x.levels.includes(lv)).map(x=>x.type));if(n<8)errs.push('few '+lv+' '+n);}
for(const c of ['arabic','math','english','science','focus','motor','values','art'])if(IT.filter(x=>x.cat===c).length<5)errs.push('thin '+c);
await p.selectOption('#fc','math');await p.waitForTimeout(80);if(await p.locator('#bkres .bkc').count()!==g1.filter(x=>x.cat==='math').length)errs.push('filter cat');
await p.selectOption('#fc','');await p.selectOption('#ft','sheet');await p.waitForTimeout(80);if(await p.locator('#bkres .bkc').count()!==g1.filter(x=>x.type==='sheet').length)errs.push('filter type');
await p.selectOption('#ft','');await p.selectOption('#fd','adv');await p.waitForTimeout(80);if(await p.locator('#bkres .bkc').count()!==g1.filter(x=>x.difficulty==='adv').length)errs.push('filter diff');
await p.selectOption('#fd','');await p.selectOption('#fm','print');await p.waitForTimeout(80);if(await p.locator('#bkres .bkc').count()!==g1.filter(x=>x.type==='sheet').length)errs.push('filter mode');
await p.click('#fclr');await p.waitForTimeout(80);if(await p.locator('#bkres .bkc').count()!==g1.length)errs.push('clear filters');
await p.fill('#bq','زهزهز');await p.waitForTimeout(80);if(!(await p.textContent('#bkres')).includes('لا توجد أنشطة'))errs.push('empty search');
await p.screenshot({path:`/tmp/bk_hub${vp.width}.png`,fullPage:false});
// ===== حل كل نشاط تفاعلي
for(const it of IT.filter(x=>!['sheet','link'].includes(x.type)&&(!process.env.ONLY||new RegExp(process.env.ONLY).test(x.slug)))){
 const lv=it.levels[0];p.setDefaultTimeout(5000);console.log('act',it.slug,it.type);await p.goto(`${B}play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('#go');await ov('play '+it.slug);
 if(!(await p.textContent('.bkex')).includes('مثال'))errs.push('no example '+it.slug);
 await p.click('#go');await p.waitForSelector('#area section');const A=p.locator('#area');
 try{
 if(it.type==='mcq'){for(let i=0;i<it.data.qs.length;i++){const q=it.data.qs[i];await p.waitForSelector('.qq');const exp=norm(it,q.o[0]);
   if(i===0){const wrongBtn=p.locator('.opt',{hasText:norm(it,q.o[1])}).first();await wrongBtn.click();if(!(await p.textContent('#fb')).includes('قريب'))errs.push('no wrong fb '+it.slug);}
   const btns=await p.locator('.opt').all();let hit=null;for(const bt of btns){const tx=(await bt.textContent()).trim();if(tx===exp){hit=bt;break;}}if(!hit){errs.push('no right opt '+it.slug+' '+exp);break;}
   await hit.click();await p.waitForTimeout(150);}}
 else if(it.type==='match'){for(const pr of it.data.pairs){const l=p.locator('[data-l]:not([disabled])',{hasText:new RegExp('^\\s*'+norm(it,pr[0]).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$')}).first();await l.click();const r=p.locator('[data-r]:not([disabled])',{hasText:norm(it,pr[1])}).first();await r.click();}}
 else if(it.type==='order'){for(let i=0;i<it.data.items.length;i++){await p.locator(`.bkt2[data-i="${i}"]`).first().click();}}
 else if(it.type==='sort'){const items=await p.locator('#pool .bkt2').all();const map={};it.data.groups.forEach((g,gi)=>g.items.forEach(x=>map[norm(it,x.t)]=gi));for(const bt of items){const tx=(await bt.textContent()).trim();const gi=map[tx];if(gi==null){errs.push('sort unknown '+it.slug+' '+tx);continue;}await bt.click();await p.locator('.bkgp').nth(gi).click();}}
 else if(it.type==='memory'){const n=it.data.pairs.length;for(let k=0;k<n;k++){const pr=it.data.pairs[k];const tcard=p.locator('.bkcard:not(.good)',{hasText:norm(it,pr[0])}).first();const icard=p.locator(`.bkcard:not(.good):has(img[src*="${pr[1]}."])`).first();await tcard.click();await icard.click();await p.waitForTimeout(40);}}
 else if(it.type==='color'){const cm={red:0,blue:1,green:2,yellow:3,orange:4,purple:5,brown:6,pink:7};for(const t of it.data.tasks){await p.locator('.bkcol[data-c="'+t.c+'"]').click();const parts=await p.locator(`.pt[data-p="${t.p}"]`).all();for(const pt of parts)await pt.dispatchEvent('click');}}
 await p.waitForSelector('.res',{timeout:6000});solved++;
 const st=await ST();if(!st.done[it.slug])errs.push('not recorded '+it.slug);
 if(it.type==='memory'||it.type==='match'){}
 }catch(e){errs.push('FAIL '+it.slug+' '+it.type+' '+e.message.split('\n').slice(0,6).join(' / ').slice(0,420));}
 if(vp.width===1200&&solved%25===0)null;
}
// حل خاطئ ثم نتيجة: توصيل خاطئ
const m1=IT.find(x=>x.type==='match');await p.goto(`${B}play/?s=${m1.slug}&lv=${m1.levels[0]}`);await p.click('#go');await p.locator('[data-l]').first().click();await p.locator('[data-r]').first().click();await p.locator('[data-r]').nth(1).click();const fbm=await p.textContent('#fb');if(!fbm.length)errs.push('match fb');
// أوراق
for(const s of IT.filter(x=>x.type==='sheet')){await p.goto(`${B}play/?s=${s.slug}&lv=${s.levels[0]}`);await p.waitForSelector('.bkprev');await ov('sheet '+s.slug);
 const hr=await p.getAttribute('#dl','href');const r=await p.request.get(hr);if(r.status()!==200||!(await r.body()).slice(0,5).toString().startsWith('%PDF'))errs.push('pdf bad '+s.slug);if(await p.getAttribute('#dl','download')===null)errs.push('no download attr');
 const pv=await p.request.get(await p.getAttribute('.bkprev','src'));if(pv.status()!==200)errs.push('preview bad '+s.slug);}
const s0=IT.find(x=>x.type==='sheet');await p.goto(`${B}play/?s=${s0.slug}&lv=${s0.levels[0]}`);await p.click('#dn');await p.waitForTimeout(100);if(!(await ST()).done[s0.slug])errs.push('sheet not done');
// روابط
for(const l of IT.filter(x=>x.type==='link')){const r=await p.request.get('http://localhost:8765/'+l.href);if(r.status()!==200)errs.push('link bad '+l.href);}
for(const x of IT.filter(a=>a.link&&a.link.href)){const r=await p.request.get('http://localhost:8765/'+x.link.href);if(r.status()!==200)errs.push('rel bad '+x.link.href);}
// متابعة
await p.goto(`${B}progress/?lv=g1`);await p.waitForSelector('.pg2');await ov('progress');const pt=await p.textContent('#aview');if(!pt.includes('مقارنته بأي طفل'))errs.push('progress note');if(!(await p.locator('.bkbd.on').count()))errs.push('no badges');
await p.screenshot({path:`/tmp/bk_prog${vp.width}.png`,fullPage:false});
await p.goto(`${B}guide/`);await p.waitForSelector('.hero');await ov('guide');
await p.goto(`${B}play/?s=nope&lv=g1`);await p.waitForSelector('.sempty');
await ctx.close();console.log(vp.width,'done solved',solved);}
console.log(errs.length?'ERRORS\n'+errs.join('\n'):'ALL OK');console.log('DONE');await b.close();})();
