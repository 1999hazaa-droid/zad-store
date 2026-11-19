// NODE_PATH=$(npm root -g) node tools/content/dict/test_dict.js  (خادم 8765 من جذر المستودع و /tmp/dict_mock.json من dbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/dict_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const FAST=`(()=>{const o=window.setTimeout;window.setTimeout=(f,d,...a)=>o(f,d>=800?30:d,...a);window.__sp=[];class U{constructor(t){this.text=t;}}window.SpeechSynthesisUtterance=U;Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],addEventListener(){},cancel(){},speak(u){window.__sp.push(u.text)}}});})();`;
const TOP={letters:'الحروف والكلمات',colors:'الألوان والأشكال',animals:'الحيوانات',food:'الفواكه والخضروات والأطعمة',body:'جسم الإنسان والحواس',home:'المنزل والمدرسة',nature:'الطبيعة والبيئة',jobs:'المهن ووسائل النقل',math:'المفاهيم الرياضية',feelings:'المشاعر والسلوكيات'};
const LVS=['a2','a3','a4','a5','a6','g1','g2','g3','g4'];
const norm=s=>s.replace(/[أإآ]/g,'ا');
(async()=>{const b=await chromium.launch();const errs=[];const note=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(FAST);const p=await ctx.newPage();p.setDefaultTimeout(5000);
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+r.url())});
await p.route('**/rest/v1/dict_words*',r=>r.fulfill({json:IT,headers:CORS}));
const B='http://localhost:8765/dict/';
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
const DS=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.dict);
const sp=()=>p.evaluate(()=>window.__sp.length);
// ===== المحور والبحث
await p.goto(B+'?lv=g1');await p.waitForSelector('.dwc');await ov('hub');
if(await sp()!==0)errs.push('autoplay on hub');
if(await p.locator('#dtopics .bkct').count()!==10)errs.push('topics count');
const more=async()=>{while(await p.locator('#dmore:visible').count())await p.click('#dmore')};
await more();if(await p.locator('#dres .dwc').count()!==IT.length)errs.push('hub all '+await p.locator('#dres .dwc').count()+' vs '+IT.length);
const cnt=()=>p.locator('#dres .dwc').count();
await p.fill('#dq','قطة');await p.waitForTimeout(60);if(!(await p.locator('#dres .dwc b').allTextContents()).includes('قطة'))errs.push('search ar');
await p.fill('#dq','cat');await p.waitForTimeout(60);if(!(await p.locator('#dres .dwc b').allTextContents()).includes('قطة'))errs.push('search en');
await p.fill('#dq','الارنب');await p.waitForTimeout(60);if(!(await p.locator('#dres .dwc b').allTextContents()).includes('أرنب'))errs.push('search normalized');
await p.fill('#dq','zzzz');await p.waitForTimeout(60);if(await cnt()!==0||!(await p.locator('#dres').innerText()).includes('لا توجد'))errs.push('search empty');
await p.click('#dclr');await p.waitForTimeout(60);
await p.selectOption('#ft','animals');await p.waitForTimeout(60);if(await cnt()!==Math.min(48,IT.filter(x=>x.topic==='animals').length))errs.push('filter topic '+await cnt());
await p.selectOption('#fs','animals:sea');await p.waitForTimeout(60);if(await cnt()!==IT.filter(x=>x.topic==='animals'&&x.sub==='sea').length)errs.push('filter sub');
await p.click('#dclr');await p.selectOption('#fl','a2');await p.waitForTimeout(60);{const n=await cnt(),e=IT.filter(x=>x.levels.includes('a2')).length;if(n!==Math.min(48,e))errs.push('filter lv '+n+' '+e)}
await p.click('#dclr');await p.selectOption('#fa','ق');await p.waitForTimeout(60);if(await cnt()!==IT.filter(x=>x.letter==='ق').length)errs.push('filter letter');
await p.click('#dclr');await p.selectOption('#fa','C');await p.waitForTimeout(60);if(await cnt()!==IT.filter(x=>x.en_letter==='C').length)errs.push('filter en letter');
// الفهرس
await p.click('#dclr');await p.click('#dlet .dlt[data-l="ع"]');await p.waitForTimeout(80);if(await cnt()!==IT.filter(x=>x.letter==='ع').length)errs.push('index ar ع');
await p.click('#ixe');await p.waitForTimeout(60);await p.click('#dlet .dlt[data-l="S"]');await p.waitForTimeout(80);if(await cnt()!==IT.filter(x=>x.en_letter==='S').length)errs.push('index en S');
{const want=IT.filter(x=>x.letter==='ا').length;await p.click('#dclr');await p.click('#ixa');await p.waitForTimeout(40);const t=await p.locator('#dlet .dlt[data-l="ا"] small').innerText();if(t.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d))!==String(want))errs.push('index count ا '+t+' '+want)}
await ov('hub-filtered');
// ===== بطاقة كل كلمة
let W_OK=0;
for(const w of IT){await p.goto(B+'word/?w='+w.slug+'&lv=g1');await p.waitForSelector('.dar',{timeout:4000}).catch(()=>{});
 const h=await p.locator('.dar').innerText().catch(()=>'');if(h!==w.ar){errs.push('word h1 '+w.slug+' '+h);continue}
 const ok=await p.evaluate(()=>{const i=document.querySelector('.dpic');return i&&i.complete&&i.naturalWidth>0});
 if(!ok)errs.push('img '+w.slug+' '+w.icon);
 const t=await p.locator('.dbody').innerText();if(!t.includes(w.meaning)||!t.includes(w.example))errs.push('text '+w.slug);
 if(w.en&&!t.includes(w.en))errs.push('en '+w.slug);
 if(await p.locator('.dar ~ .dsnd').count()!==1)errs.push('snd '+w.slug);
 if(await p.locator('#dprac').count()!==1)errs.push('prac '+w.slug);
 if(w.slug==='w001'||w.slug==='w100'||w.slug==='w200'){await ov('word '+w.slug);const before=await sp();await p.click('.dar ~ .dsnd');if(await sp()!==before+1)errs.push('tts not called '+w.slug);const last=await p.evaluate(()=>window.__sp.slice(-1)[0]);if(last!==w.ar)errs.push('tts text '+last);}
 W_OK++;}
note.push(vp.width+': word cards ok '+W_OK+'/'+IT.length);
// الاستماع والرؤية لا يعني الإتقان
{const s=await DS();const seen=Object.values(s.w).filter(r=>r.s>0).length,mast=Object.values(s.w).filter(r=>r.ok>=3).length;if(seen<IT.length||mast!==0)errs.push('mastery from viewing '+seen+' '+mast)}
// ===== مستويات وألعاب
const gamesPerLv={};
for(const lv of LVS){await p.goto(B+'play/?lv='+lv);await p.waitForSelector('.dgm');const ids=await p.$$eval('a.dgm',a=>a.map(x=>x.dataset.g));gamesPerLv[lv]=ids;await ov('playhub '+lv);
 if(ids.length<2)errs.push('few games '+lv+' '+ids.length);
 if((lv==='a2'||lv==='a3')&&(ids.length!==2||ids.some(i=>!['listen','match'].includes(i))))errs.push('young games '+ids);
 const E=IT.filter(x=>x.levels.includes(lv)).length;if(E<20)errs.push('few words '+lv+' '+E);
 for(const g of ids){
  await p.goto(B+'play/?g='+g+'&lv='+lv);await p.waitForSelector('#area .art');await ov('game '+g+' '+lv);
  if(await sp()!==0)errs.push('autoplay game');
  let guard=0;
  const first=await p.locator('#area .opt').count()>0;
  if(first){ // mcq
   let n=0;let wrongTried=false;
   while(await p.locator('#area .opt').count()&&guard++<12){
    const q=await p.evaluate(()=>window.__dq);const wi=q.opts.findIndex(o=>!o.ok),ri=q.opts.findIndex(o=>o.ok);
    if(q.opts.filter(o=>o.ok).length!==1)errs.push('mcq not exactly one right '+g+' '+lv);
    if(new Set(q.opts.map(o=>o.txt||o.img)).size!==q.opts.length)errs.push('mcq dup opts '+g+' '+lv);
    if(!wrongTried&&wi>=0){await p.click(`#area .opt[data-j="${wi}"]`);const f=await p.locator('#fb').getAttribute('class');if(!/b/.test(f.replace('fb','')))errs.push('no wrong fb '+g);wrongTried=true;}
    const f2=await p.evaluate((ri)=>{document.querySelector('#area .opt[data-j="'+ri+'"]').click();const e=document.querySelector('#fb');return e?e.textContent:'!'},ri);if(!f2.includes('!')&&!f2.includes('،')&&f2.length<5)errs.push('no right fb '+g);
    n++;await p.waitForTimeout(120);
    if(await p.locator('.res').count())break;
   }
  }else if(await p.locator('#area .bkn').count()){ // match
   const k=await p.locator('#area [data-l]').count();let tried=false;
   for(let i=0;i<k;i++){ if(!tried&&k>1){await p.click(`#area [data-l="0"]`);await p.click(`#area [data-r="1"]`);tried=true}
    await p.click(`#area [data-l="${i}"]`);await p.click(`#area [data-r="${i}"]`);}
  }else if(await p.locator('#area .bkpool').count()&&await p.locator('#area .bkgp').count()){ // sort
   const tiles=await p.$$eval('#area .bkt2',a=>a.map(x=>x.innerText.trim()));const groups=await p.$$eval('#area .bkgp',a=>a.map(x=>x.querySelector('b').innerText));
   const want=ar=>{const w=IT.find(x=>x.ar===ar);return [TOP[w.topic],w.sub]};
   const SUBL={"animals:pet":"حيوانات أليفة","animals:wild":"حيوانات برية","animals:sea":"حيوانات بحرية","animals:bird":"طيور","animals:insect":"حشرات","food:fruit":"فواكه","food:veg":"خضروات","food:other":"أطعمة ومشروبات","home:furniture":"أثاث","home:kitchen":"أدوات المطبخ","home:school":"أدوات المدرسة","home:clothes":"ملابس","nature:sky":"السماء والطقس","nature:plant":"نباتات","nature:earth":"الأرض","nature:care":"العناية بالبيئة","jobs:job":"مهن","jobs:tool":"أدوات","jobs:land":"مركبات برية","jobs:air":"مركبات جوية","jobs:sea":"مركبات بحرية","math:num":"أرقام","math:op":"عمليات حسابية","math:tool":"أدوات ومفاهيم","colors:color":"ألوان","colors:shape":"أشكال","colors:size":"أحجام","colors:pos":"مواقع","feelings:feel":"مشاعر","feelings:manners":"سلوكيات وآداب","letters:lang":"اللغة والقراءة"};
   let tried=false;
   for(let i=0;i<tiles.length;i++){const w=IT.find(x=>x.ar===tiles[i]);const gi=groups.findIndex(n=>n===TOP[w.topic]||n===SUBL[w.topic+':'+w.sub]);if(gi<0){errs.push('sort group missing '+tiles[i]+' '+groups);continue}
    await p.click(`#area .bkt2[data-i="${i}"]`);
    if(!tried){const wg=groups.findIndex((n,j)=>j!==gi);await p.click(`#area .bkgp[data-g="${wg}"]`);tried=true}
    await p.click(`#area .bkgp[data-g="${gi}"]`);}
  }else if(await p.locator('#area .bkt2').count()){ // order
   const k=await p.locator('#area .bkt2').count();let tried=false;
   for(let i=0;i<k;i++){ if(!tried&&k>1){await p.click(`#area .bkt2[data-i="${k-1}"]`);tried=true}
    await p.click(`#area .bkt2[data-i="${i}"]`);}
  }else errs.push('unknown game ui '+g+' '+lv);
  await p.waitForSelector('.res',{timeout:5000}).catch(()=>errs.push('no result '+g+' '+lv));
  if(await p.locator('.res .st').count()){const st=await p.locator('.res .st').getAttribute('aria-label');if(!/نجوم|نجمة/.test(st))errs.push('stars label')}
  if(await p.locator('#again').count()!==1)errs.push('no retry '+g+' '+lv);
 }
}
note.push(vp.width+': games '+JSON.stringify(gamesPerLv));
// إعادة المحاولة تعمل
await p.goto(B+'play/?g=listen&lv=a5');await p.waitForSelector('#area .opt');
for(let i=0;i<6;i++){const q=await p.evaluate(()=>window.__dq);await p.click(`#area .opt[data-j="${q.opts.findIndex(o=>o.ok)}"]`);await p.waitForTimeout(100);}
await p.waitForSelector('.res');await p.click('#again');await p.waitForSelector('#area .opt');
// ===== الإتقان بالتدريب على كلمة
await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.dict={w:{},tp:{},g:{},badges:{},pts:0};localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
const cat=IT.find(x=>x.ar==='قطة');
for(let r=0;r<3;r++){await p.goto(B+'play/?w='+cat.slug+'&lv=a5');await p.waitForSelector('#area .opt');
 for(let i=0;i<8;i++){if(!await p.locator('#area .opt').count())break;const q=await p.evaluate(()=>window.__dq);await p.click(`#area .opt[data-j="${q.opts.findIndex(o=>o.ok)}"]`);await p.waitForTimeout(110);}
 await p.waitForSelector('.res');}
{const s=await DS();const r=s.w[cat.slug];if(!r||r.ok<3)errs.push('mastery not recorded '+JSON.stringify(r));}
// خطأ ثم مراجعة
await p.evaluate((slug)=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.dict.w['w002']={s:1,h:0,he:0,ok:0,oke:0,bad:2,t:1};localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
await p.goto(B+'progress/?lv=a5');await p.waitForSelector('.pg2');await ov('progress');
{const m=await p.locator('#pgm').innerText(),r=await p.locator('#pgr').innerText();if(!(parseInt(m.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)))>=1))errs.push('progress mastered '+m);if(r!=='١')errs.push('progress review '+r);if(!(await p.locator('body').innerText()).includes(IT[1].ar))errs.push('review word missing');}
await p.click('#drev');await p.waitForSelector('.dgm');
// الدليل
await p.goto(B+'guide/');await p.waitForSelector('.hero');await ov('guide');
// بطاقة غير موجودة
await p.goto(B+'word/?w=nope');await p.waitForSelector('.sempty');
// a2: بطاقة بلا ترجمة مفروضة
await p.goto(B+'word/?w=w001&lv=a2');await p.waitForSelector('.dar');await ov('word a2');
await ctx.close();}
await b.close();
console.log(note.join('\n'));console.log(errs.length?'ERRORS:\n'+errs.slice(0,60).join('\n'):'ALL OK');console.log('DONE');})();
