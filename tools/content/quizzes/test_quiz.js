// NODE_PATH=$(npm root -g) node tools/content/quizzes/test_quiz.js  (خادم 8765 من جذر المستودع و /tmp/quiz_mock.json من qbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/quiz_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const FAST=`(()=>{const o=window.setTimeout;window.setTimeout=(f,d,...a)=>o(f,d>=800?30:d,...a);window.__sp=[];class U{constructor(t){this.text=t;}}window.SpeechSynthesisUtterance=U;Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],addEventListener(){},cancel(){},speak(u){window.__sp.push(u.text)}}});window.__errposts=[];})();`;
// حل سؤال واحد داخل الصفحة: mode = right | wrong2 | wrong1
const SOLVE=`window.__solve=async(q,en,mode)=>{
const AD=n=>String(n).replace(/\\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);const T=s=>en?String(s):AD(s);const $$=(s,r)=>Array.from((r||document).querySelectorAll(s));const wait=ms=>new Promise(r=>setTimeout(r,ms));
const body=document.querySelector('#qbody');const imgOf=b=>{const i=b.querySelector('img');return i?i.getAttribute('src'):''};const hasIc=(b,ic)=>$$('img',b).some(i=>new RegExp('/'+ic.replace(/[-]/g,'\\\\-')+'\\\\.(webp|svg)').test(i.getAttribute('src')));
if(['mc','fill','listen','pic','prob','tf'].includes(q.t)){
 const bs=$$('.qzo',body);const isRight=(b)=>{ if(q.t==='tf'){return b.textContent.trim()===(q.a?'صح':'خطأ')} if(q.t==='pic'||(q.t==='listen'&&q.oi))return hasIc(b,q.o[0]); const sp=b.querySelector('span');return sp&&sp.textContent===T(q.o[0])};
 const right=bs.find(isRight);const wrongs=bs.filter(b=>b!==right);
 if(!right)return 'no-right-btn';
 if(mode==='wrong2'){wrongs[0].click();await wait(10);if(wrongs[1]&&!wrongs[1].disabled)wrongs[1].click();else if(!document.querySelector('.qzo.ok'))right.click()}
 else if(mode==='wrong1'){wrongs[0].click();await wait(10);right.click()}
 else right.click();return 'ok'}
if(q.t==='match'){const L=$$('#ml .qzm'),Rr=$$('#mr .qzm');for(let k=0;k<q.pairs.length;k++){const p=q.pairs[k];const l=L.find(b=>b.textContent===T(p[0]));l.click();const r=Rr.find(b=>p[2]?hasIc(b,p[2]):b.textContent===T(p[1]));r.click();await wait(5)}return 'ok'}
if(q.t==='dnd'){const chips=$$('.qzchip',body),gs=$$('.qzg',body);for(const it of q.items){const ch=chips.find(c=>c.textContent===T(it.t)&&!c.classList.contains('on'));ch.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,clientX:5,clientY:5}));document.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,clientX:5,clientY:5}));gs[it.g].click();await wait(5)}return 'ok'}
if(q.t==='order'||q.t==='build'){const seq=q.t==='build'?Array.from(q.w):q.items.map(x=>x.t);const chk=document.querySelector('#schk');
 const doSeq=async(s)=>{for(const t of s){const c=$$('#spool .qzchip').find(x=>x.textContent===t);if(!c)return 'missing '+t;c.click();await wait(5)}};
 if(mode==='wrong2'||mode==='wrong1'){const rev=seq.slice().reverse();const same=rev.join('|')===seq.join('|');await doSeq(same?seq.slice(1).concat(seq.slice(0,1)):rev);chk.click();await wait(10);if(mode==='wrong2'){await doSeq(same?seq.slice(1).concat(seq.slice(0,1)):rev);chk.click();return 'ok'}}
 const r=await doSeq(seq);if(r)return r;chk.click();return 'ok'}
if(q.t==='obs'){const bs=$$('.qzobs .qzo');if(mode==='wrong2'||mode==='wrong1'){bs.forEach(b=>b.classList.contains('sel')||b.click());document.querySelector('#ochk').click();await wait(10);if(mode==='wrong2'){document.querySelector('#ochk').click();return 'ok'}bs.forEach(b=>b.classList.contains('sel')&&b.click())}
 for(const k of q.c)bs[k].click();document.querySelector('#ochk').click();return 'ok'}
if(q.t==='mem'){const cards=$$('.qzcd');const groups={};cards.forEach((c,k)=>{const s=c.querySelector('.f img').getAttribute('src');(groups[s]=groups[s]||[]).push(c)});for(const s in groups){groups[s][0].click();groups[s][1].click();await wait(5)}return 'ok'}
return 'unknown'};`;
(async()=>{const b=await chromium.launch();const errs=[],note=[];const _ep=errs.push.bind(errs);errs.push=(...a)=>{console.log('ERR',...a);return _ep(...a)};
const ctx0=await b.newContext();
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(FAST);const p=await ctx.newPage();p.setDefaultTimeout(6000);
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+r.url())});
let posts=0;await p.route('**/rest/v1/qz_quizzes*',r=>r.fulfill({json:IT,headers:CORS}));await p.route('**/rest/v1/qz_errors*',r=>{posts++;r.fulfill({status:201,body:'',headers:CORS})});
const B='http://localhost:8765/quizzes/';const sub=vp.width===1200;
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
const broken=async t=>{const bad=await p.evaluate(()=>Array.from(document.images).filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.getAttribute('src')));if(bad.length)errs.push('broken img '+t+' '+bad.join(','))};
const QS=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.quiz);
await p.goto(B+'?lv=a5');await p.addScriptTag({content:SOLVE});
// ===== المحور
await p.waitForSelector('.qzc');await ov('hub');await broken('hub');
{const el=IT.filter(z=>z.levels.includes('a5')).length;const n=await p.locator('#qlist .qzc').count();if(n!==el)errs.push('hub list a5 '+n+' vs '+el);if(await p.locator('#qch .qzc').count()!==8)errs.push('contests count');
 for(const [k,c] of [['early','early'],['math','math']]){await p.click(`.qzcat[data-c="${c}"]`);await p.waitForTimeout(40);const e=IT.filter(z=>z.levels.includes('a5')&&z.cat===k).length;if(await p.locator('#qlist .qzc').count()!==e)errs.push('hub cat '+k)}}
if(await p.evaluate(()=>window.__sp.length)!==0)errs.push('autoplay on hub');
// ===== عدد أسئلة المسابقات لكل مرحلة
const LVS=['a2','a3','a4','a5','a6','g1','g2','g3','g4'];const CHS=['letters','numbers','pictures','vocab','science','memory','discover','review'];
if(!sub)for(const lv of LVS){await p.goto(B+'?lv='+lv);await p.waitForSelector('#qch .qzc');const off=await p.locator('#qch .qzc.off').evaluateAll(a=>a.map(x=>x.dataset.c));note.push(lv+' contests off: '+(off.join(',')||'none'));await ov('hub '+lv)}
// ===== حل كل اختبار صحيحا في كل مرحلة مناسبة (جوال: كل المراحل لكل اختبار، مكتب: اختبار من كل أربعة)
let nq=0;
for(let zi=0;zi<IT.length;zi++){const z=IT[zi];if(sub&&zi%4)continue;
 const lvs=sub?[z.levels[z.levels.length-1]]:(z.levels.length>2?[z.levels[0],z.levels[z.levels.length-1]]:z.levels);
 for(const lv of lvs){
  await p.goto(B+'quiz/?q='+z.slug+'&lv='+lv);await p.waitForSelector('.qzdet');await ov('intro '+z.slug);
  const dt=await p.locator('.qzdet').innerText();for(const w of ['الفئة المناسبة','المادة','المهارة','عدد الأسئلة','مستوى الصعوبة','مدة مقترحة'])if(!dt.includes(w))errs.push(z.slug+' intro missing '+w);
  await p.click('#qgo');await p.waitForSelector('#qbody');await p.addScriptTag({content:SOLVE});
  for(let i=0;i<z.questions.length;i++){const q=z.questions[i];nq++;
   await p.waitForFunction(i=>document.querySelector('#qpg').textContent.includes(String.fromCharCode(0)+'')||true,i);
   const en=z.cat==='english';const r=await p.evaluate(([q,en])=>window.__solve(q,en,'right'),[q,en]).catch(e=>'EXC '+e.message.slice(0,80)+' @'+p.url().slice(-40));if(r!=='ok')errs.push(`${z.slug}#${i+1} ${q.t} solve ${r}`);
   const nxt=p.locator('#qnext');try{await p.waitForFunction(()=>!document.querySelector('#qnext').disabled,{timeout:3000})}catch{errs.push(`${z.slug}#${i+1} ${q.t} next not enabled (${await p.locator('#qfb').innerText()})`);break}
   await ov(`${z.slug}#${i+1}`);await broken(`${z.slug}#${i+1}`);
   const fbt=await p.locator('#qfb').innerText();if(!/أحسنت|رائع|تقدم|ممتاز/.test(fbt))errs.push(`${z.slug}#${i+1} no cheer: ${fbt}`);if(/فشل|خطأ فادح/.test(fbt))errs.push('negative '+fbt);
   if(await p.evaluate(()=>window.__sp.length)!==0&&i===0&&!['listen'].includes(q.t)&&false)errs.push('autoplay');
   await nxt.click();}
  await p.waitForSelector('.qzres',{timeout:4000}).catch(()=>errs.push(z.slug+' no result'));
  const stat=await p.locator('.qzstat b').allTextContents();const AD=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
  if(stat[1]!==AD(z.questions.length)||stat[0]!==AD(z.questions.length))errs.push(`${z.slug} result stats ${stat.join('/')}`);
  if(!(await p.locator('.qzres h1').innerText()).includes('أحسنت'))errs.push(z.slug+' result msg');
  if((await p.locator('.qzlesson').count())<1)errs.push(z.slug+' no lesson button');
  await ov('result '+z.slug);
  if(await p.evaluate(()=>window.__sp.length)!==0)errs.push(z.slug+' autoplayed speech');
 }}
note.push(vp.width+': solved '+nq+' questions');
// ===== حفظ التقدم
{const s=await QS();const n=Object.keys(s.h).length;note.push('saved quizzes '+n+' pts '+s.pts+' badges '+Object.keys(s.badges).join(','));if(!n)errs.push('nothing saved');if(!s.pts)errs.push('no points');if(!s.log.length)errs.push('no log')}
// ===== حساب النتيجة: مسارات خطأ ومحاولات وتخطي
if(!sub){const z=IT.find(x=>x.slug==='q_mat07'||x.cat==='math'&&x.questions.length>=6&&x.questions.every(q=>q.t==='mc'));const lv=z.levels[0];
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.quiz={};localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 await p.goto(B+'play/?q='+z.slug+'&lv='+lv);await p.waitForSelector('#qbody');await p.addScriptTag({content:SOLVE});
 const plan=['right','right','wrong1','wrong2','skip','right'];let want=0;
 for(let i=0;i<z.questions.length;i++){const m=plan[i]||'right';
  if(m==='skip'){await p.click('#qskip')}else{await p.evaluate(([q,m])=>window.__solve(q,false,m),[z.questions[i],m]);if(m==='right')want++;
   await p.waitForFunction(()=>!document.querySelector('#qnext').disabled);
   if(m==='wrong2'){const t=await p.locator('#qfb').innerText();if(!/لنراجع/.test(t))errs.push('wrong2 no review msg');if(await p.locator('.qzo.ok').count()!==1)errs.push('wrong2 not revealed')}
   if(m==='wrong1'){const t=await p.locator('#qfb').innerText();if(!t.trim()||/فشل|غبي|خطأ فادح/.test(t))errs.push('wrong1 feedback empty/discouraging')}
   await p.click('#qnext')}
  if(i===z.questions.length-1&&m==='skip'){await p.click('#qnext')}}
 await p.waitForSelector('.qzres');const stat=await p.locator('.qzstat b').allTextContents();const AD=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
 if(stat[1]!==AD(want))errs.push(`score mismatch got ${stat[1]} want ${want}`);if(stat[0]!==AD(z.questions.length-1))errs.push('answered count '+stat[0]);
 const txt=await p.locator('.qzres').innerText();if(/فشل|رسوب/.test(txt))errs.push('discouraging text');if(!/نراجعها معًا/.test(txt))errs.push('no review list');
 const s1=await QS();const h=s1.h[z.slug];if(!h||h.best!==want||h.n!==1)errs.push('saved best '+JSON.stringify(h));const rvN=Object.keys(s1.rv).length;if(rvN!==z.questions.length-want)errs.push('rv count '+rvN+' vs '+(z.questions.length-want));
 const p1=s1.pts;if(p1!==10+2*want)errs.push('points '+p1+' vs '+(10+2*want));
 // إعادة المحاولة بنتيجة أفضل
 await p.click('#qretry');await p.waitForSelector('#qbody');await p.addScriptTag({content:SOLVE});
 for(let i=0;i<z.questions.length;i++){await p.evaluate(q=>window.__solve(q,false,'right'),z.questions[i]);await p.waitForFunction(()=>!document.querySelector('#qnext').disabled);await p.click('#qnext')}
 await p.waitForSelector('.qzres');const s2=await QS();const h2=s2.h[z.slug];if(h2.n!==2||h2.best!==z.questions.length)errs.push('retry saved '+JSON.stringify(h2));if(s2.pts!==p1+10+2*z.questions.length+5)errs.push('retry points '+s2.pts);if(!s2.badges.retry)errs.push('retry badge missing');if(Object.keys(s2.rv).length)errs.push('rv not cleared');
 if(!(await p.locator('.qzres').innerText()).includes('أفضل من محاولتك'))errs.push('no improvement note');
 // مكافأة الدرس مرة واحدة
 const pts=s2.pts;const href=await p.locator('.qzlesson').first().getAttribute('href');await p.evaluate(()=>{document.querySelectorAll('.qzlesson').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))});await p.locator('.qzlesson').first().click();await p.locator('.qzlesson').first().click();const s3=await QS();if(s3.pts!==pts+3)errs.push('lesson reward '+(s3.pts-pts));if(!s3.badges.review)errs.push('review badge');
 // تنقل السابق والمراجعة
 await p.goto(B+'play/?q='+z.slug+'&lv='+lv);await p.waitForSelector('#qbody');await p.addScriptTag({content:SOLVE});await p.evaluate(q=>window.__solve(q,false,'right'),z.questions[0]);await p.waitForFunction(()=>!document.querySelector('#qnext').disabled);await p.click('#qnext');
 if(await p.locator('#qprev').isDisabled())errs.push('prev disabled at q2');await p.click('#qprev');if(!(await p.locator('#qbody').innerText()).includes('أجبت'))errs.push('prev review view');if(await p.locator('#qnext').isDisabled())errs.push('next disabled on answered');
 // progress dashboard
 await p.goto(B+'progress/?lv='+lv);await p.waitForSelector('.qzstat');await ov('progress');const pt=await p.locator('#aview').innerText();for(const w of ['التقدم حسب المادة','مهارات أتقنها','نتائج الاختبارات السابقة','سجل الإنجازات','خاصة بالطفل'])if(!pt.includes(w))errs.push('progress missing '+w);if(!pt.includes(z.title))errs.push('progress lacks result '+z.title);
 // الاستجابة لزر مسح (تأكيد مزدوج)
 await p.click('#qreset');if(!(await QS()).h)errs.push('reset first click wiped');await p.click('#qreset');await p.waitForLoadState();const s4=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.quiz);if(s4&&Object.keys(s4.h||{}).length)errs.push('reset failed');
}
// ===== المسابقات
const solveRun=async(n)=>{for(let i=0;i<n;i++){const q=await p.evaluate(()=>0);}};
if(true)for(const lv of (sub?['g2']:['a3','a5','g1','g4'])){for(const c of CHS){
  await p.goto(B+'?lv='+lv);await p.waitForSelector('#qch .qzc');const off=await p.locator(`#qch .qzc[data-c="${c}"].off`).count();if(off)continue;
  const team=(c.length+lv.length)%2===0;const timer=sub&&c==='science';
  await p.goto(B+`play/?c=${c}&lv=${lv}`);await p.waitForSelector('#qgo');await ov('contest intro');
  if(team)await p.check('input[name="qm"][value="1"]');if(timer&&await p.locator('#qtm').count())await p.check('#qtm');
  await p.click('#qgo');if(!(await p.waitForSelector('#qbody',{timeout:3000}).catch(()=>null))){errs.push(`contest ${c}/${lv} did not start: `+(await p.locator('#aview').innerText()).slice(0,80));continue}await p.addScriptTag({content:SOLVE});
  const n=await p.evaluate(()=>document.querySelector('#qpg').textContent);const total=+n.replace(/[^٠-٩]/g,'').slice(-1)||0;
  // نحل بتحديد السؤال الحالي من محتوى الصفحة عبر مطابقة نص السؤال مع بيانات المحاكاة
  let guard=0;while(guard++<10){
   const qt=await p.locator('#qbody .qzq').first().innerText().catch(()=>null);if(!qt)break;
   const AD=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
   let found=null;for(const z of IT)for(const q of z.questions){if((z.cat==='english'?q.q:AD(q.q))===qt.trim()){ // قد يتكرر النص، نختار الأقرب بنوع الواجهة
     found=found||{q,en:z.cat==='english',z};}}
   let okk=false;{const r=await p.evaluate(()=>{const c=window.ZQ&&window.ZQ._cur;return c?window.__solve(c.q,c.en,'right'):'nocur'}).catch(()=>'err');okk=r==='ok';if(!okk)errs.push('solve result '+r)}
   if(!okk){errs.push(`contest ${c}/${lv} cannot solve ${qt}`);break}
   try{await p.waitForFunction(()=>!document.querySelector('#qnext').disabled,{timeout:2500})}catch{errs.push(`contest ${c}/${lv} next disabled after ${qt}`);break}
   const last=(await p.locator('#qnext').innerText())==='عرض النتيجة';await ov('contest q');await p.click('#qnext');if(last)break}
  await p.waitForSelector('.qzres',{timeout:3000}).catch(()=>errs.push(`contest ${c}/${lv} no result`));
  const st=await p.locator('.qzstat b').allTextContents();if(st[0]!==st[2]&&team===false&&false)errs.push('x');
  if(team&&!((await p.locator('.qzres').innerText({timeout:1500}).catch(()=>''))).includes('فريقنا'))errs.push('team result msg');
  note.push(`contest ${c}/${lv} ${team?'team':'solo'}${timer?'+timer':''}: ${st[1]}/${st[2]}`);
}}
await ctx.close();
}
// ===== زر الاستماع ومنع التشغيل التلقائي + مسار أخطاء السؤال التالف
{const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(FAST);const p=await ctx.newPage();let posts=[];
 const bad=JSON.parse(JSON.stringify(IT.find(z=>z.cat==='english')));bad.slug='q_bad01';bad.questions[1]={t:'mc',q:'سؤال تالف',o:['أ'],why:'x',sk:'x'};const MK=IT.concat([bad]);
 await p.route('**/rest/v1/qz_quizzes*',r=>r.fulfill({json:MK,headers:CORS}));await p.route('**/rest/v1/qz_errors*',r=>{posts.push(r.request().postData());r.fulfill({status:201,body:'',headers:CORS})});
 await p.goto(B0('play/?q='+IT.find(z=>z.questions.some(q=>q.t==='listen')).slug+'&lv='+IT.find(z=>z.questions.some(q=>q.t==='listen')).levels[0]));await p.waitForSelector('#qbody');
 if(await p.evaluate(()=>window.__sp.length)!==0)errs.push('autoplay at start');
 const sp=p.locator('.qzspk').first();if(await sp.count()){await sp.click();if(await p.evaluate(()=>window.__sp.length)!==1)errs.push('speaker button did not speak')}
 await p.goto(B0('play/?q=q_bad01&lv='+bad.levels[0]));await p.waitForSelector('#qbody');
 // السؤال الأول سليم؛ نحله ثم نصل إلى التالف
 await p.addScriptTag({content:SOLVE});await p.evaluate(q=>window.__solve(q,true,'right'),bad.questions[0]);await p.waitForFunction(()=>!document.querySelector('#qnext').disabled);await p.click('#qnext');
 await p.waitForTimeout(300);if(!(await p.locator('#qbody').innerText()).includes('تعذر عرض هذا السؤال'))errs.push('invalid question not handled');if(!posts.length||!/q_bad01/.test(posts[0]))errs.push('error not reported');else if(/zad-learn|kid|اسم/.test(posts[0]))errs.push('error post leaks data');
 await ctx.close()}
await b.close();
console.log(note.join('\n'));
console.log(errs.length?('ERRORS ('+errs.length+')\n'+[...new Set(errs)].slice(0,60).join('\n')):'ALL OK');console.log('DONE');
})().catch(e=>{console.log('Error',e.stack);process.exit(1)});
process.on('exit',()=>{});
function B0(x){return 'http://localhost:8765/quizzes/'+x}
