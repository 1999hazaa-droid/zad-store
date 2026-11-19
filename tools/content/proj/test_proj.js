// NODE_PATH=$(npm root -g) node tools/content/proj/test_proj.js  (خادم 8765 من جذر المستودع و /tmp/proj_mock.json من pbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/proj_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const FAST=`(()=>{const o=window.setTimeout;window.setTimeout=(f,d,...a)=>o(f,d>=800?30:d,...a);window.__sp=[];class U{constructor(t){this.text=t}}window.SpeechSynthesisUtterance=U;Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],addEventListener(){},cancel(){},speak(u){window.__sp.push(u.text)}}});})();`;
const AD=s=>String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const norm=(it,s)=>it.cat==='english'?s:AD(s);
const rx=s=>new RegExp('^\\s*'+norm({cat:'x'},s).replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$');
(async()=>{const b=await chromium.launch();const errs=[];let solvedC=0,solvedP=0;
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(FAST);const p=await ctx.newPage();p.setDefaultTimeout(6000);
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+r.url())});
await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:IT,headers:CORS}));
const B='http://localhost:8765/projects/';
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
const ST=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.proj);
const cnt=()=>p.locator('#bkres .bkc').count();
// ===== المحور
await p.goto(B+'?lv=g1');await p.waitForSelector('.bkc');await ov('hub');
const g1=IT.filter(x=>x.levels.includes('g1'));if(await cnt()!==g1.length)errs.push('hub cards '+await cnt()+' vs '+g1.length);
for(const lv of ['a2','a3','a4','a5','a6','g1','g2','g3','g4']){const L=IT.filter(x=>x.levels.includes(lv));if(L.filter(x=>x.kind==='project').length<2||L.filter(x=>x.kind==='challenge').length<2)errs.push('few '+lv+' '+L.length);}
await p.selectOption('#fk','project');await p.waitForTimeout(80);if(await cnt()!==g1.filter(x=>x.kind==='project').length)errs.push('filter kind');
await p.selectOption('#fk','challenge');await p.waitForTimeout(80);if(await cnt()!==g1.filter(x=>x.kind==='challenge').length)errs.push('filter kind2');
await p.selectOption('#fk','');await p.selectOption('#fc','science');await p.waitForTimeout(80);if(await cnt()!==g1.filter(x=>x.cat==='science').length)errs.push('filter cat');
await p.selectOption('#fc','');await p.selectOption('#fd','adv');await p.waitForTimeout(80);if(await cnt()!==g1.filter(x=>x.difficulty==='adv').length)errs.push('filter diff');
await p.selectOption('#fd','');await p.selectOption('#fm','mid');await p.waitForTimeout(80);if(await cnt()!==g1.filter(x=>x.kind==='project'&&x.minutes>10&&x.minutes<=25).length)errs.push('filter time');
await p.click('#fclr');await p.waitForTimeout(80);if(await cnt()!==g1.length)errs.push('clear filters');
await p.fill('#bq','زهزهز');await p.waitForTimeout(80);if(!(await p.textContent('#bkres')).includes('لا توجد نتائج'))errs.push('empty search');
await p.screenshot({path:`/tmp/pj_hub${vp.width}.png`});
// ===== المشاريع
for(const it of IT.filter(x=>x.kind==='project')){
 const d=it.data,lv=it.levels[0];console.log('proj',it.slug);
 try{
 await p.goto(`${B}play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('#go');await ov('proj '+it.slug);
 const tx=await p.textContent('#stage');for(const w of [d.goal,d.safety,d.outcome,...d.tools])if(!tx.includes(norm(it,w)))errs.push('missing text '+it.slug+' '+w.slice(0,20));
 if(d.adult&&!tx.includes('شخص بالغ'))errs.push('no adult note '+it.slug);
 await p.click('#go');const n=d.steps.length;
 for(let k=0;k<n;k++){await p.waitForSelector('.pjstep');
  if(!(await p.textContent('#pjcnt')).includes(AD(k+1)+' من '+AD(n)))errs.push('step counter '+it.slug+k);
  if(!(await p.textContent('#pjtxt')).includes(norm(it,d.steps[k].t).slice(0,12)))errs.push('step text '+it.slug+k);
  if(d.steps[k].p&&!(await p.textContent('.pjpar')).includes('إرشاد للوالدين'))errs.push('no parent note '+it.slug+k);
  const im=await p.getAttribute('.pjimg','src');if(!im)errs.push('no step img');
  if(k===1){await p.click('#prev');if(!(await p.textContent('#pjcnt')).includes(AD(1)+' من'))errs.push('prev failed '+it.slug);await p.click('#next');}
  if(k===0&&await p.locator('#prev:disabled').count()!==1)errs.push('prev not disabled at first');
  if(k===1&&n>3&&it.slug.endsWith('01')&&false){}
  await p.click('#next');}
 // أسئلة
 for(let i=0;i<2;i++){await p.waitForSelector('.qq');const q=d.qs[i];
  if(i===0){await p.locator('.opt',{hasText:norm(it,q.o[1])}).first().click();if(!(await p.textContent('#fb')).includes('قريب'))errs.push('no wrong fb '+it.slug);}
  let hit=null;for(const bt of await p.locator('.opt').all()){if((await bt.textContent()).trim()===norm(it,q.o[0])){hit=bt;break;}}
  if(!hit){errs.push('no right opt '+it.slug);break;}await hit.click();await p.waitForTimeout(150);}
 await p.waitForSelector('#note');await p.fill('#note','تجربة جميلة '+it.slug);await p.locator('#sk .chip').first().click();
 await p.click('#fin');await p.waitForSelector('.res');
 const st=await ST();const r=st.done[it.slug];if(!r||!r.note.includes(it.slug)||!(r.skills||[]).includes(d.skills[0]))errs.push('not recorded '+it.slug);solvedP++;
 }catch(e){errs.push('FAIL '+it.slug+' '+e.message.split('\n').slice(0,3).join(' / ').slice(0,300));}
}
// استئناف مشروع من منتصفه
const rp=IT.find(x=>x.kind==='project'&&x.data.steps.length>=4&&!x.levels.includes('a2'));
await p.evaluate(s=>{const D=JSON.parse(localStorage.getItem('zad-learn-v3'));delete D.kids.k1.proj.done[s];D.kids.k1.proj.steps={};localStorage.setItem('zad-learn-v3',JSON.stringify(D));},rp.slug);
await p.goto(`${B}play/?s=${rp.slug}&lv=${rp.levels[0]}`);await p.click('#go');await p.click('#next');await p.click('#next');
await p.goto(`${B}play/?s=${rp.slug}&lv=${rp.levels[0]}`);await p.waitForSelector('#go');if(!(await p.textContent('#go')).includes('تابع'))errs.push('no resume label');await p.click('#go');if(!(await p.textContent('#pjcnt')).includes(AD(3)+' من'))errs.push('resume wrong step');
await p.screenshot({path:`/tmp/pj_step${vp.width}.png`});
// ===== التحديات
for(const it of IT.filter(x=>x.kind==='challenge'&&(!process.env.ONLY||new RegExp(process.env.ONLY).test(x.slug)))){
 const lv=it.levels[0];console.log('ch',it.slug,it.type);
 await p.goto(`${B}play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('#go');await ov('ch '+it.slug);
 if(!(await p.textContent('.bkex')).includes('مثال'))errs.push('no example '+it.slug);
 await p.click('#go');await p.waitForSelector('#area section');
 try{
 if(it.type==='mcq'){for(let i=0;i<it.data.qs.length;i++){const q=it.data.qs[i];await p.waitForSelector('.qq');const exp=norm(it,q.o[0]);
   if(q.seq&&await p.locator('.pjseq').count()!==1)errs.push('no seq '+it.slug);
   if(i===0){await p.locator('.opt',{hasText:norm(it,q.o[1])}).first().click();if(!(await p.textContent('#fb')).includes('قريب'))errs.push('no wrong fb '+it.slug);}
   let hit=null;for(const bt of await p.locator('.opt').all()){if((await bt.textContent()).trim()===exp){hit=bt;break;}}if(!hit){errs.push('no right opt '+it.slug+' '+exp);break;}
   await hit.click();await p.waitForTimeout(150);}}
 else if(it.type==='diff'){for(let i=0;i<it.data.rounds.length;i++){const r=it.data.rounds[i];await p.waitForSelector('.pjdf');
   if(i===0){const w=(r.idx+1)%r.base.length;await p.locator(`button.pjc[data-i="${w}"]`).click();if(!(await p.textContent('#fb')).includes('ليس هذا'))errs.push('diff wrong fb '+it.slug);}
   await p.locator(`button.pjc[data-i="${r.idx}"]`).click();await p.waitForTimeout(150);}}
 else if(it.type==='match'){for(const pr of it.data.pairs){await p.locator('[data-l]:not([disabled])',{hasText:rx(pr[0])}).first().click();await p.locator('[data-r]:not([disabled])',{hasText:norm(it,pr[1])}).first().click();}}
 else if(it.type==='order'){for(let i=0;i<it.data.items.length;i++){await p.locator(`.bkt2[data-i="${i}"]`).first().click();}}
 else if(it.type==='sort'){const map={};it.data.groups.forEach((g,gi)=>g.items.forEach(x=>map[norm(it,x.t)]=gi));for(const bt of await p.locator('#pool .bkt2').all()){const gi=map[(await bt.textContent()).trim()];if(gi==null){errs.push('sort unknown '+it.slug);continue;}await bt.click();await p.locator('.bkgp').nth(gi).click();}}
 else if(it.type==='memory'){for(const pr of it.data.pairs){await p.locator('.bkcard:not(.good)',{hasText:norm(it,pr[0])}).first().click();await p.locator(`.bkcard:not(.good):has(img[src*="${pr[1]}."])`).first().click();await p.waitForTimeout(40);}}
 else if(it.type==='color'){for(const t of it.data.tasks){await p.locator('.bkcol[data-c="'+t.c+'"]').click();for(const pt of await p.locator(`.pt[data-p="${t.p}"]`).all())await pt.dispatchEvent('click');}}
 await p.waitForSelector('.res');solvedC++;
 if(!(await ST()).done[it.slug])errs.push('not recorded '+it.slug);
 }catch(e){errs.push('FAIL '+it.slug+' '+it.type+' '+e.message.split('\n').slice(0,3).join(' / ').slice(0,300));}
}
// ===== المتابعة
await p.goto(`${B}progress/?lv=g1`);await p.waitForSelector('.pg2');await ov('progress');const pt=await p.textContent('#aview');
for(const w of ['مقارنته بأي طفل','ملاحظات الطفل','التحديات التي شارك فيها','مشروعات مقترحة','تجربة جميلة'])if(!pt.includes(w))errs.push('progress missing '+w);
if(!(await p.locator('.bkbd.on').count()))errs.push('no badges');
await p.screenshot({path:`/tmp/pj_prog${vp.width}.png`});
await p.goto(`${B}guide/`);await p.waitForSelector('.hero');await ov('guide');
await p.goto(`${B}play/?s=nope&lv=g1`);await p.waitForSelector('.sempty');
await ctx.close();console.log(vp.width,'done projects',solvedP,'challenges',solvedC);}
console.log(errs.length?'ERRORS\n'+errs.join('\n'):'ALL OK');console.log('DONE');await b.close();})();
