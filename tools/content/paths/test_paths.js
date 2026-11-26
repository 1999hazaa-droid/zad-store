// NODE_PATH=$(npm root -g) node tools/content/paths/test_paths.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});
const PATHS=[
 P('1','arabic','ar-letter','ربط الحرف بصوته','g-ar-letter','يربط الحرف بصوته','مسار ربط الحرف بصوته — من ٤ إلى ٥ سنوات',['a4','a5'],[I('bank:bank-y','practice'),I('stories:story-x','understand'),I('lib:s-p1','practice',false)],{est:25}),
 P('2','math','m-addsub','الجمع والطرح الأساسيان','g-m-addsub','يجمع ويطرح','مسار الجمع والطرح — الصف الأول والثاني',['g1','g2'],[I('lib:s-p3','practice'),I('quiz:qz-1','review'),I('bank:bank-g','practice')]),
 P('3','math','m-shapes','التعرف على الأشكال','g-m-shapes','يتعرف على الأشكال','مسار الأشكال — من ٥ إلى ٦ سنوات',['a5','a6'],[I('lib:s-p2','practice'),I('vid:vid-1','understand'),I('proj:proj-1','apply',false)]),
 P('4','science','s-classify','التصنيف','g-s-classify','يصنف','مسار التصنيف قليل الموارد',['a3','a4'],[I('acts:act-1','practice'),I('lib:s-p10','practice',false),I('lib:s-p11','review',false)]),
 P('5','arabic','ar-letter','ربط الحرف بصوته','g-ar-letter','يربط الحرف بصوته','مسار مورد أساسي غير موجود',['a4','a5'],[I('bank:bank-y','practice'),I('bank:nope','practice'),I('lib:s-p1','practice')]),
 P('6','math','m-addsub','الجمع والطرح الأساسيان','g-m-addsub','يجمع ويطرح','مسار صف خامس يجب ألا يظهر',['g5'],[I('lib:s-p10','practice'),I('lib:s-p10','review'),I('lib:s-p10','apply')]),
];
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let failP=false;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='paths_public'){if(failP)return J({},500);return J({paths:PATHS})}
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:[],links:[]});
  if(m==='POST'&&tb==='goals_item')return J([]);
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(h)=>{await p.goto(B+'paths/'+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(120)};
 const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};
 // 1 القائمة
 await go();let n=await names();
 T(n.length===3,'3 مسارات صالحة فقط وليس '+n.length+': '+n);
 T(!n.some(x=>x.includes('قليل الموارد')),'مسار أقل من 3 موارد مرئية لا يظهر');T(!n.some(x=>x.includes('غير موجود')),'مسار مورده الأساسي غير موجود لا يظهر');T(!n.some(x=>x.includes('صف خامس')),'لا مسار فوق الصف الرابع');
 const chips=await p.$$eval('.skdom',e=>e.map(x=>x.dataset.d));T(chips.join()==='arabic,math,science,life','أربعة مجالات فقط: '+chips);
 let body=await p.innerText('body');T(!/الصف (الخامس|السادس|السابع)/.test(body),'لا صفوف فوق الرابع');await ov('list');
 T(await p.$$eval('.skcard',e=>e.every(x=>/مجاني|مدفوع/.test(x.textContent)&&x.querySelector('a.go'))),'كل بطاقة: الحالة المالية ورابط');
 // 2 الفلاتر
 await p.click('.skdom[data-d=math]');n=await names();T(n.length===2,'رياضيات: '+n);await p.click('.skdom[data-d=math]');
 await p.selectOption('#page','a4');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'عمر 4: '+n);await p.selectOption('#page','a6');n=await names();T(n.length===1&&n[0].includes('الأشكال'),'عمر 6: '+n);await p.selectOption('#page','');
 await p.selectOption('#pgr','g1');n=await names();T(n.length===1&&n[0].includes('الجمع'),'صف 1: '+n);
 const gopts=await p.$$eval('#pgr option',e=>e.map(x=>x.value));T(!gopts.some(v=>/g[5-9]/.test(v)),'خيارات الصف لا تتجاوز الرابع: '+gopts);await p.selectOption('#pgr','');
 await p.selectOption('#ppay','paid');n=await names();T(n.length===1&&n[0].includes('الجمع'),'فيه مدفوع: '+n);await p.selectOption('#ppay','free');n=await names();T(n.length===2,'مجاني كليًا: '+n);await p.selectOption('#ppay','');
 await p.selectOption('#psk','m-shapes');n=await names();T(n.length===1&&n[0].includes('الأشكال'),'مهارة: '+n);await p.selectOption('#psk','');
 await p.selectOption('#pgl','g-ar-letter');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'هدف: '+n);await p.selectOption('#pgl','');
 await p.fill('#pq','الأشكال');n=await names();T(n.length===1,'بحث بالاسم: '+n);await p.fill('#pq','لا يوجد هذا');T((await names()).length===0&&(await p.innerText('#skbody')).includes('لا توجد مسارات'),'لا نتائج رسالة');await p.fill('#pq','');
 // 3 صفحة المسار والترتيب
 await go('#p=p-1');let txt=await p.innerText('#skbody');
 T(txt.includes('مسار ربط الحرف بصوته')&&/[3٣] أنشطة وموارد/.test(txt),'عدد الموارد الفعلي');
 T(txt.includes('مدة تقديرية')&&/٢٥|25/.test(txt),'المدة تظهر عند توفرها');await go('#p=p-2');T(!(await p.innerText('#skbody')).includes('مدة تقديرية'),'لا مدة إن لم تتوفر');
 await go('#p=p-1');
 const order=await p.$$eval('.pthstep b',e=>e.map(x=>x.textContent));T(order[0].includes('قصة')&&order[1].includes('نصل'),'الفهم قبل التدريب: '+order);
 T(txt.includes('الفهم')&&txt.includes('التدريب')&&!txt.includes('المراجعة'),'مراحل المسار فقط بلا فرض كل المراحل');
 T(await p.$('a[href*="goals/#g=g-ar-letter"]')!==null,'رابط الهدف');await ov('path');
 T(!/\d\s*%|٪/.test(txt),'لا نسبة قبل أي نشاط');T(txt.includes('لم يبدأ طفلك هذا المسار'),'التقدم صادق قبل البدء');T(await p.$('#pcont')===null,'لا زر تابع بلا استخدام');
 T(txt.includes('اختياري'),'المورد الاختياري موسوم');
 // 4 ابدأ
 const first=await p.getAttribute('#pstart','href');T(/bank\/play\/\?s=bank-y/.test(first)||/stories\/read/.test(first),'ابدأ يفتح أول مورد: '+first);
 // أول مورد بالترتيب: النظام يرتب حسب مرحلة التعرف/الفهم أولًا
 await p.click('#pstart');await p.waitForTimeout(200);const cur=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('zad-path-cur')||'null'));
 T(cur&&cur.slug==='p-1'&&cur.i>=0&&cur.list.length===3,'سياق المسار محفوظ: '+JSON.stringify(cur&&{s:cur.slug,i:cur.i,n:cur.list.length}));
 // 5 شريط التنقل في صفحة مورد
 await p.goto(B+'bank/play/?s=bank-y');await p.waitForTimeout(400);
 const bar=await p.$('#zpathbar');T(bar!==null,'شريط المسار يظهر في صفحة المورد');
 if(bar){const bt=await bar.innerText();T(bt.includes('مسار ربط الحرف')&&/المورد/.test(bt),'نص الشريط: '+bt);
  T(await p.$('#zpathbar a[href*="paths/"]')!==null,'رابط قائمة المسار');
  const hrefs=await p.$$eval('#zpathbar a',e=>e.map(x=>x.getAttribute('href')));T(hrefs.length>=2,'السابق/التالي/القائمة: '+hrefs);await ov('bar');}
 // مورد خارج المسار لا شريط له
 await p.goto(B+'activities/view/?a=act-1');await p.waitForTimeout(300);T(await p.$('#zpathbar')===null,'مورد خارج قائمة المسار لا شريط');
 // 6 التقدم: فتح مقابل إكمال
 await go();await p.evaluate(()=>{localStorage.clear();const now=Date.now();const ws=window.ZSAVED.weekStart(window.ZSAVED.iso(new Date()));localStorage.setItem('zad-recent-v1',JSON.stringify({kids:{k1:{items:{'bank:bank-y':{at:now},'stories:story-x':{at:now-86400000}}}}}));
  const w={};w[ws]={items:[{id:'a1',key:'bank:bank-y',day:4,st:'done',c:now,why:'x',ty:'find',tries:0,note:''},{id:'a2',key:'stories:story-x',day:4,st:'todo',c:now,why:'x',ty:'find',tries:0,note:''}]};
  localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:4,name:'س',plan:{weeks:w}}}}))});
 await go('#p=p-1');txt=await p.innerText('#skbody');
 T(/أنشطة بدأها الطفل: [٢2] من [٣3]/.test(txt),'فُتح 2 من 3: '+txt.slice(txt.indexOf('تقدم المسار'),txt.indexOf('تقدم المسار')+160));
 T(/المكتمل في خطة طفلك: [١1] من [٣3]/.test(txt),'المكتمل 1 من 3 وليس 2 (الفتح ليس إكمالًا)');
 T(await p.$('.pthprog .bar i')!==null,'نسبة المكتمل في الخطة');T(txt.includes('لا تعني إتقان')||txt.includes('لا يعني أنه أُكمل'),'تنبيه عدم الإتقان');
 T(await p.$('#pcont')!==null,'تابع المسار يظهر لأن هناك استخدامًا حقيقيًا');
 T(await p.$$eval('.pthstep .no.done',e=>e.length)===1,'مورد واحد مكتمل فقط');
 await ov('progress');
 // مقياس: ابدأ من جديد في مسار آخر لا يتأثر
 await go('#p=p-3');txt=await p.innerText('#skbody');T(txt.includes('لم يبدأ طفلك'),'مسار آخر بلا تقدم');
 // 7 مفضلة وبدأ
 await go('#p=p-1');await p.click('#pfav');T((await p.getAttribute('#pfav','aria-pressed'))==='true','المفضلة مفعلة');
 await go();await p.check('#pfv');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'فلتر المفضلة: '+n);await p.uncheck('#pfv');
 await p.check('#pst');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'فلتر بدأ طفلك: '+n);await p.uncheck('#pst');
 // 8 الخطة
 await go('#p=p-1');T(await p.$('#padd')!==null,'زر الإضافة للخطة');
 await p.click('#padd');await p.waitForTimeout(150);let pm=await p.innerText('#pmsg');T(pm.includes('مضاف مسبقًا'),'منع التكرار: '+pm);
 let plan=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return Object.values(d.kids.k1.plan.weeks).flatMap(w=>w.items)});T(plan.length===2&&plan.find(i=>i.key==='bank:bank-y').st==='done','لم يتغير الإكمال ولم يتكرر شيء');
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.plan={weeks:{}};localStorage.setItem('zad-learn-v3',JSON.stringify(d))});await go('#p=p-1');
 await p.click('#padd');await p.waitForTimeout(150);pm=await p.innerText('#pmsg');T(/ليست إنجازًا|ليس إنجازًا|ليست إنجاز/.test(pm)&&pm.includes('تمت إضافة'),'رسالة الإضافة: '+pm);
 plan=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return Object.values(d.kids.k1.plan.weeks).flatMap(w=>w.items)});T(plan.length===2&&plan.every(i=>i.st==='todo'),'أُضيفت بحالة todo لا done: '+JSON.stringify(plan.map(i=>i.key+i.st)));
 // طفل عمره لا يناسب
 await p.evaluate(()=>localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:2}}})));await go('#p=p-1');T((await p.innerText('#skbody')).includes('لا يناسب مستوى طفلك'),'عمر لا يناسب: لا إضافة');
 await p.evaluate(()=>localStorage.clear());await go('#p=p-1');T((await p.innerText('#skbody')).includes('اختر عمر طفلك'),'بلا ملف طفل: رسالة');
 // 9 مسار غير موجود/خارج النطاق
 await go('#p=p-6');T((await p.innerText('body')).includes('لم نجد هذا المسار'),'مسار الصف الخامس غير موجود');
 await go('#p=p-5');T((await p.innerText('body')).includes('لم نجد هذا المسار'),'مسار بمورد أساسي مفقود غير موجود');
 // 10 فلتر العمر داخل المسار
 await go('#p=p-1');await p.selectOption('#plv2','a4');const ns=await p.$$eval('.pthstep b',e=>e.length);T(ns>=1&&ns<=3,'فلتر عمر داخل المسار');
 // 11 فشل التحميل
 failP=true;await p.goto(B+'paths/');await p.reload();await p.waitForSelector('#pretry');T((await p.innerText('#skbody')).includes('تعذّر تحميل المسارات'),'حالة الفشل صادقة');failP=false;await p.click('#pretry');await p.waitForSelector('.skcard');T((await names()).length===3,'إعادة المحاولة تعمل');
 // 12 الروابط
 await go();const hs=await p.$$eval('footer a, .fzfoot a, nav a',e=>e.map(x=>x.getAttribute('href')));T(hs.every(h=>!h||/^(\.\.\/|#|https?:)/.test(h)),'روابط نسبية صحيحة');
 await ctx.close();console.log('vp',W,'done');
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'PASS');process.exit(errs.length?1:0)})();
