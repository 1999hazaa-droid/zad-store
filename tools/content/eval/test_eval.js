// NODE_PATH=$(npm root -g) node tools/content/eval/test_eval.js  (خادم 8765 من جذر المستودع)
const {chromium}=require('playwright');
const CORS={'access-control-allow-origin':'*'};
const AD=s=>String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const cr=(id,y,p,k,stage,skill,res)=>({id,young:y,pre:p,kid:k,stage,skill:skill||null,res:res||[]});
const SKP={slug:'sk-grow',name:'ملاحظة النمو'};
const EV=[
 {slug:'pj_e1',name:'مراجعة مشروع النبتة الصغيرة',levels:['a2','a3'],closing:{young:'ما الذي أعجبه أكثر؟'},msgs:{done:['أحسنت! لقد تعلمت شيئًا جديدًا'],help:[],retry:[]},project:{title:'نبتة صغيرة',icon:'i_rocket',goal:'ملاحظة نمو النبتة',cat:'science',span:'short',levels:['a2','a3']},
  criteria:[cr('c1','شارك في الاستكشاف','فهمت','فهمت الفكرة','',null),cr('c2','جرّب الخطوات','اتبعت','اتبعت الخطوات','',null),cr('c3','استكشف الأدوات','استخدمت','اخترت الأدوات','',null),cr('c4','شارك حتى النهاية','أكملت','أكملت الجزء','',null),cr('c5','أظهر فرحته','عرفت','فكرت فيما تعلمته','',null)]},
 {slug:'pj_e2',name:'مراجعة مشروع الأشكال',levels:['a5','g2'],closing:{},msgs:{},project:{title:'أشكال حولنا',icon:null,goal:'التعرف على الأشكال',cat:'math',span:'weekly',levels:['a5','g2']},
  criteria:[cr('d1','فهم','فهمت فكرة المشروع','فهمت فكرة المشروع وهدفه','اليوم الأول',SKP,['proj:pj_res1']),cr('d2','خطوات','اتبعت الخطوات','اتبعت الخطوات الأساسية بالترتيب','اليوم الأول',null,[]),cr('d3','عبّر','حكيت ما فعلته','عبّرت عن النتيجة','اليوم الثاني',{slug:'sk-say',name:'التعبير'},['proj:pj_res2'])]},
 {slug:'pj_e3',name:'مراجعة مشروع إعادة الاستخدام',levels:['g3','g4'],closing:{late:'ما نصيحتك لصديق؟'},msgs:{retry:['كل محاولة تساعدك على التعلم']},project:{title:'إعادة الاستخدام',icon:'i_star',goal:'إعادة استخدام المواد',cat:'life',span:'monthly',levels:['g3','g4']},
  criteria:[cr('e1','a','b','أطبق المهارة','',SKP,['proj:pj_res1']),cr('e2','a','b','أرتب الأدوات','',null)]}
];
const RES=[{slug:'pj_res1',title:'مشروع تدريبي على النمو',icon:'i_star',skill:'ملاحظة',subject:'علوم',cat:'science',levels:['a5','g2','g3'],created_at:'2026-10-01T00:00:00Z'},{slug:'pj_res2',title:'نشاط التعبير',icon:'i_star',skill:'تعبير',subject:'لغة',cat:'arabic',levels:['a5','g2'],created_at:'2026-10-01T00:00:00Z'}];
const NOW=Date.parse('2026-11-26T12:00:00Z');
(async()=>{const b=await chromium.launch();const errs=[];const ck=(c,m)=>{if(!c)errs.push(m)};
for(const vp of [{width:390,height:800},{width:768,height:900},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(6000);
await p.addInitScript(()=>{window.print=()=>{window.__printed=(window.__printed||0)+1}});
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
let sent=[];p.on('request',r=>{if(r.method()==='POST'&&/rest\/v1\/rpc/.test(r.url()))sent.push(r.url().split('/rpc/')[1]);if(/eval_(save|status)|evalc_/.test(r.url()))errs.push('public page called admin rpc '+r.url())});
await p.route('**/rest/v1/rpc/eval_public',r=>r.fulfill({json:{items:EV},headers:CORS}));
await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:RES,headers:CORS}));
await p.route(/rest\/v1\/(?!rpc\/eval_public|proj_items)/,r=>r.fulfill({json:[],headers:CORS}));
const B='http://localhost:8765/eval/';
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
const L=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-eval-v1')||'{"kids":{}}'));
// ===== المحور
await p.goto(B);await p.waitForSelector('.evpc');await ov('hub');
ck(await p.locator('.evpc').count()===3,'hub shows 3 evals');
ck((await p.textContent('#skbody')).includes('اختياري'),'optional mentioned');
await p.selectOption('#egr','g3');await p.waitForTimeout(60);ck(await p.locator('.evpc').count()===1,'filter grade g3');
await p.selectOption('#egr','');await p.waitForTimeout(60);
// ===== صغار 1-3
await p.goto(B+'#/p/pj_e1');await p.waitForSelector('.evcr');await ov('young');
ck(await p.locator('.evcr').count()===4,'young capped at 4 '+await p.locator('.evcr').count());
ck(!(await p.locator('#said,#learned,#skillUsed').count()),'young has no child questions');
ck((await p.locator('.evst button').first().textContent()).length>0,'young state labels');
const yl=await p.locator('.evcr').first().locator('.evst button').allTextContents();ck(yl[1].includes('يحتاج')&&!yl[1].includes('أحتاج'),'young third person '+yl);
ck((await p.textContent('.evcr p')).includes('شارك في الاستكشاف'),'young wording');
ck((await p.textContent('.evbox')).includes('ما الذي أعجبه أكثر؟')||(await p.textContent('.evintro')).length>0,'young closing');
// اختيار + إلغاء
const c1=p.locator('.evcr[data-c="c1"]');await c1.locator('[data-s=done]').click();ck((await p.locator('.evcr[data-c="c1"] [data-s=done]').getAttribute('aria-checked'))==='true','choose done');
await p.locator('.evcr[data-c="c1"] [data-s=done]').click();ck((await p.locator('.evcr[data-c="c1"] [data-s=done]').getAttribute('aria-checked'))==='false','toggle off');
await p.locator('.evcr[data-c="c1"] [data-s=done]').click();await p.locator('.evcr[data-c="c2"] [data-s=help]').click();await p.locator('.evcr[data-c="c3"] [data-s=retry]').click();
await p.fill('#parent','يحب لمس الأشياء');
ck(!(await p.locator('#evmsg .evmsg').count()),'no msg before save');
await p.click('#evsave');await p.waitForSelector('#evmsg .evmsg');
const m1=await p.textContent('#evmsg');ck(/كل محاولة|فكّر في شيء/.test(m1),'retry-state encouraging msg '+m1);
ck(!/فشل|ضعيف|سيئ|راسب|ناجح/.test(m1),'no negative words');
let st=await L();ck(st.kids.k1.ev.pj_e1.st.c1==='done'&&st.kids.k1.ev.pj_e1.st.c2==='help'&&st.kids.k1.ev.pj_e1.st.c3==='retry','saved states');ck(st.kids.k1.ev.pj_e1.parent==='يحب لمس الأشياء','saved parent note');
// استعادة عند العودة
await p.goto(B+'#/');await p.waitForSelector('.evpc');await p.reload();await p.waitForSelector('.evpc');await p.goto(B+'#/p/pj_e1');await p.waitForSelector('.evcr');
ck((await p.locator('.evcr[data-c="c1"] [data-s=done]').getAttribute('aria-checked'))==='true','restored c1');ck((await p.locator('.evcr[data-c="c3"] [data-s=retry]').getAttribute('aria-checked'))==='true','restored c3');ck((await p.inputValue('#parent'))==='يحب لمس الأشياء','restored note');
// زر العودة للمشروع
ck((await p.locator('#evback').getAttribute('href')).includes('projects/play/?s=pj_e1&lv=a2'),'back to project href '+await p.locator('#evback').getAttribute('href'));
// ===== بدون تقييم: إكمال المشروع لا يُمنع
await p.goto(B+'#/p/pj_e3');await p.waitForSelector('.evcr');
let ld=await p.evaluate(()=>localStorage.getItem('zad-learn-v3'));ck(!ld||!JSON.parse(ld).kids.k1?.proj?.done?.pj_e3,'not done yet');
// ===== ما قبل المدرسة 4-6 (a5) والصف الثاني
await p.goto(B+'#/p/pj_e2');await p.waitForSelector('.evcr');await ov('pre');
await p.click('.pills [data-lv=a5]');await p.waitForSelector('#said');
ck((await p.locator('.evstage').allTextContents()).join().includes('اليوم الأول')&&(await p.locator('.evstage').count())===2,'stage headings');
ck((await p.textContent('.evcr p')).includes('فهمت فكرة المشروع')&&!(await p.textContent('.evcr p')).includes('وهدفه'),'pre short phrase');
ck(!(await p.locator('#learned,#skillUsed').count()),'pre has no late questions');
await p.fill('#said','صنعت أشكالًا');
await p.click('.pills [data-lv=g2]');await p.waitForSelector('#learned');
ck((await p.textContent('label[for=learned]')).includes('ما الشيء الذي تعلمته؟'),'g2 learned question');
ck((await p.textContent('.evcr p')).includes('وهدفه'),'g2 clear criterion');
await p.fill('#learned','تعلمت الأشكال');await p.locator('.evcr[data-c="d1"] [data-s=done]').click();await p.locator('.evcr[data-c="d3"] [data-s=help]').click();await p.fill('#parent','ممتازة المحاولة');
await p.click('#evsave');await p.waitForSelector('#evmsg .evmsg');
ck(/عمل رائع|طلب المساعدة/.test(await p.textContent('#evmsg')),'help msg');
// ===== التقرير
await p.click('text=عرض التقرير');await p.waitForSelector('#evprint');await ov('report');
let rep=await p.textContent('#skbody');
ck(rep.includes('لم يُسجَّل إكمال هذا المشروع'),'no fake completion date');
ck(rep.includes('ملاحظة النمو'),'skill practiced');
ck(rep.includes('تعلمت الأشكال')&&rep.includes('ممتازة المحاولة'),'notes in report');
ck(!/\d+\s*\/\s*\d+|%|درجة|ترتيب|الأول على/.test(await p.locator('.evbox').allTextContents().then(a=>a.join(' '))),'no scores in report');
const link=p.locator('.evsug a');ck(await link.count()>=1,'resource suggestions');ck((await link.first().getAttribute('href')).includes('s=pj_res2'),'resource is tied to the skill needing support '+await link.first().getAttribute('href'));
ck(!(await p.locator('.evsug').textContent()).includes('مشروع تدريبي على النمو'),'done-criterion skill resource not suggested');
// فتح المورد المقترح
const href=await link.first().getAttribute('href');const rr=await p.request.get(href);ck(rr.status()===200,'resource opens '+rr.status());
await p.click('#evprint');ck(await p.evaluate(()=>window.__printed)===1,'print works');
// إكمال المشروع ثم تاريخ حقيقي
await p.goto(B+'#/p/pj_e2');await p.waitForSelector('.evcr');await p.click('#evfin');await p.waitForSelector('#evmsg .evmsg');
const dn=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.proj.done.pj_e2);ck(dn.d===1&&dn.t>0&&dn.best===3,'completion recorded '+JSON.stringify(dn));
ck(JSON.parse(await p.evaluate(()=>localStorage.getItem('zad-learn-v3'))).kids.k1.proj.pts===15,'points first completion');
await p.goto(B+'#/r/pj_e2');await p.reload();await p.waitForSelector('#evprint');const dt=new Date(dn.t).toLocaleDateString('ar',{year:'numeric',month:'long',day:'numeric'});ck((await p.textContent('.evhead')).includes(dt),'real completion date shown');
ck((await p.textContent('.evbox:nth-of-type(1)')).length>0,'report sections');
// ===== صفوف عليا
await p.goto(B+'#/p/pj_e3');await p.waitForSelector('#skillUsed');
ck((await p.textContent('#evcrs')).includes('أطبق المهارة'),'late criteria');
const qs=await p.locator('label.lab').allTextContents();ck(qs.some(t=>t.includes('ما المهارة التي استخدمتها؟'))&&qs.some(t=>t.includes('ما أكثر خطوة أعجبتك؟'))&&qs.some(t=>t.includes('ما الذي ستفعله بطريقة مختلفة في المرة القادمة؟'))&&qs.some(t=>t.includes('ما نصيحتك لصديق؟')),'late questions '+qs);
await p.locator('.evcr[data-c="e1"] [data-s=done]').click();await p.locator('.evcr[data-c="e2"] [data-s=retry]').click();
const sm=await p.textContent('.evbox h3:has-text("مراجعتي")').catch(()=>null);const sumTxt=await p.textContent('#skbody');ck(sumTxt.includes('ما أتقنته')&&sumTxt.includes('ما أريد تحسينه'),'self review mastered vs improve');
await p.click('#evsave');await p.waitForSelector('#evmsg .evmsg');ck((await p.textContent('#evmsg')).includes('كل محاولة تساعدك على التعلم'),'custom retry msg');
// ===== لوحة ولي الأمر
await p.goto(B+'#/dash');await p.waitForSelector('.evbox');await ov('dash');
ck(await p.locator('article.evbox').count()===3,'dash lists 3 evals '+await p.locator('article.evbox').count());
ck(!(await p.locator('#evkid').count()),'single kid no selector');
await p.fill('#n_pj_e1','ملاحظة جديدة قصيرة');await p.click('[data-note=pj_e1]');st=await L();ck(st.kids.k1.ev.pj_e1.parent==='ملاحظة جديدة قصيرة','dashboard note saved');
await p.click('[data-need=sk-grow]');st=await L();ck(!!st.kids.k1.need['sk-grow'],'skill needing practice flagged');
await p.locator('article[data-s=pj_e1] [data-again=c1]').click();st=await L();ck((st.kids.k1.again.pj_e1||[]).includes('c1'),'retry step suggested');
await p.goto(B+'#/p/pj_e1');await p.waitForSelector('.evcr');ck(await p.locator('.evcr.sug').count()===1,'suggestion visible to child');
// المهارة المعلّمة تُظهر مواردها في تقرير مشروع آخر
await p.goto(B+'#/r/pj_e3');await p.reload();await p.waitForSelector('#evprint');ck((await p.locator('.evsug a').count())>=1,'flagged skill resources in report');
ck(!/ترتيب الأطفال|منافسة|الأول على/.test(await p.textContent('#skbody')),'no ranking text');
ck(!sent.some(x=>!/^(eval_public)$/.test(x)),'only eval_public rpc '+sent);
await ctx.close();}
await b.close();
console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS eval public');process.exit(errs.length?1:0)})();
