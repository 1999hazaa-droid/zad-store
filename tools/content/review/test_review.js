// NODE_PATH=$(npm root -g) node tools/content/paths/test_paths.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});
const sk=(id,slug,domain,name,levels)=>({id,slug,domain,name,descr:'وصف '+name,levels,path:false,parent:null});
const SKILLS=[sk('S0','ar-shapes','arabic','أشكال الحروف',['a4','a5']),sk('S1','ar-letter-sound','arabic','ربط الحرف بصوته',['a4','a5','a6']),sk('S2','m-addsub','math','الجمع والطرح الأساسيان',['g1','g2']),sk('S3','m-shapes','math','التعرف على الأشكال',['a5','a6'])];
const LK=(s,k,g)=>({s,k,g:g||'practice',r:'main',o:1});
const LINKS=[LK('S1','bank:bank-y'),LK('S1','lib:s-p1','recognize'),LK('S1','stories:story-x','recognize'),LK('S1','proj:proj-1','apply'),LK('S2','bank:bank-g'),LK('S2','quiz:qz-1','review'),LK('S2','lib:s-p3'),LK('S3','lib:s-p2'),LK('S3','vid:vid-1','recognize'),LK('S3','proj:proj-1','apply')];
const REVS={items:[
 {s:'ar-letter-sound',intro:'تعلمنا أصوات الحروف وربطها بالكلمات.',example:'ما صوت حرف الباء في كلمة بطة؟',summary:'تدربت على ربط الحرف بصوته.',pre:[{s:'ar-shapes',rev:false}],next:['m-addsub']},
 {s:'m-addsub',intro:'تعلمنا الجمع والطرح البسيطين.',example:null,summary:null,pre:[{s:'m-shapes',rev:true}],next:[]},
 {s:'m-shapes',intro:'تعلمنا أن نميّز الأشكال.',example:null,summary:null,pre:[],next:['m-addsub']}]};
const SUP={groups:[{slug:'arabic',name:'دعم اللغة العربية',color:'#e6dcff'},{slug:'math',name:'دعم الرياضيات',color:'#dff3ff'},{slug:'visual',name:'دعم المهارات البصرية',color:'#dff6e7'},{slug:'thinking',name:'دعم مهارات التفكير',color:'#fff0d1'},{slug:'motor',name:'حركية',color:'#fff'}],gs:[{g:'arabic',s:'ar-letter-sound'},{g:'math',s:'m-addsub'},{g:'visual',s:'m-shapes'}]};
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let fail=false,reviews=REVS;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='review_public'){if(fail)return J({},500);return J(reviews)}
  if(m==='POST'&&tb==='support_public')return J(SUP);
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:SKILLS,links:LINKS});
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(path,h)=>{await p.goto(B+path+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(150)};
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 await go('review/');let n=await names();
 console.log(W,n.join(' | '));
 T(n.length===3,'ثلاث مراجعات: '+n);await ov('home');
 const ch=await p.$$eval('.skdom',e=>e.map(x=>x.dataset.g));T(ch.join()==='arabic,math,visual','المجالات المتاحة فقط من الأربعة (بلا حركية): '+ch);
 let body=await p.innerText('body');T(!/راجعتها|سجل المراجعة/.test(body),'لا سجل قبل أي جلسة');T(!/ضعيف|فشل/.test(body),'لا عبارات سلبية');
 await p.click('.skdom[data-g=math]');n=await names();T(n.length===1&&n[0].includes('الجمع'),'تصفية المجال');await p.click('.skdom[data-g=math]');
 await p.selectOption('#rage','a4');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'عمر 4: '+n);await p.selectOption('#rage','');
 const gs=await p.$$eval('#rgr option',e=>e.map(x=>x.value));T(!gs.some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع');
 // جلسة
 await go('review/','#s=ar-letter-sound');let t=await p.innerText('#skbody');
 T(t.includes('تعلمنا أصوات الحروف')&&t.includes('ما صوت حرف الباء'),'الشرح والمثال');
 T(t.includes('أشكال الحروف')&&t.includes('فتح المهارة'),'مهارة سابقة بلا مراجعة: رابط المهارة');
 T(await p.$$eval('.srcard',e=>e.length)===3,'مراجعة سريعة: ثلاثة أنشطة');
 const kinds=await p.$$eval('[data-kind]',e=>e.map(x=>x.dataset.kind));T(kinds.includes('quick')&&kinds.includes('inter')&&kinds.includes('ws')&&!kinds.includes('game')&&!kinds.includes('cards'),'أنواع المراجعة المتاحة فقط: '+kinds);
 T(!/\d\s*%|٪/.test(t),'لا نسب');T(!t.includes('ملخص جلستك'),'لا ملخص قبل أي نشاط');
 await p.click('[data-kind=ws]');T(await p.$$eval('.srcard',e=>e.length)>=1&&(await p.innerText('#skbody')).includes('ورقة عمل'),'نوع ورقة العمل');await p.click('[data-kind=quick]');
 await p.click('#rmore');T(await p.$$eval('.srcard',e=>e.length)===4,'نشاط آخر');
 // فتح النشاط لا يُحتسب
 T(!(await p.innerText('#skbody')).includes('ملخص جلستك'),'الفتح لا يُحتسب');
 await p.click('[data-done]');t=await p.innerText('#skbody');T(t.includes('ملخص جلستك')&&/راجعت ١ من ٤/.test(t),'ملخص بعد مراجعة نشاط: '+t.slice(0,60));T(/رائع|أنت تتدرب|أحسنت/.test(t),'تغذية راجعة لطيفة');T(t.includes('تدربت على ربط الحرف'),'ملخص المحتوى');
 await p.click('[data-done]');T(!(await p.innerText('#skbody')).includes('ملخص جلستك'),'إلغاء المراجعة');
 // توقف وعودة
 await p.click('[data-done]');await go('review/','#s=ar-letter-sound');T((await p.innerText('#skbody')).includes('ملخص جلستك'),'العودة بعد التوقف تحفظ ما راجعه');
 await p.click('#rfin');t=await p.innerText('#skbody');T(t.includes('رائع، لقد راجعت هذه المهارة'),'رسالة الإنهاء');T(await p.$$eval('.srsug a',e=>e.length)>=2,'اقتراح مهارة مرتبطة ونشاط إضافي');
 T(await p.$('a[href*="skills/#s=ar-letter-sound"]')!==null,'خيار تخطي المراجعة وفتح المهارة');
 await p.check('#ragain');await go('review/');body=await p.innerText('body');T(/سجل المراجعة/.test(body)&&/١ جلسة مكتملة/.test(body)&&body.includes('تريد مراجعتها مرة أخرى'),'السجل بعد جلسة فعلية');
 let st=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-review-v1')));T(Object.values(st.kids)[0].skills['ar-letter-sound'].sessions===1,'تخزين محلي');
 // مهارة سابقة لها مراجعة
 await go('review/','#s=m-addsub');T(await p.$('a[href="#s=m-shapes"]')!==null,'رابط مراجعة المهارة السابقة');
 // ولي الأمر
 await p.click('.srpar summary');T((await p.innerText('.srpar')).includes('لا نحكم على مستوى طفلك'),'لوحة ولي الأمر');await ov('session');
 // صفحة المهارة: راجع ما تعلمته أولًا
 await p.goto(B+'skills/#s=m-addsub');await p.reload();await p.waitForSelector('#skbody .skback, #skbody .skcard');await p.waitForTimeout(150);
 t=await p.innerText('#skbody');T(t.includes('راجع ما تعلمته أولًا')&&t.includes('التعرف على الأشكال')&&t.includes('ابدأ هذه المهارة مباشرة'),'قسم المراجعة في صفحة المهارة');
 T(await p.$('#skrev a[href*="review/#s=m-shapes"]')!==null,'رابط المراجعة القصيرة');T(await p.$('#skstart')!==null&&await p.$$eval('.skres',e=>e.length)>0,'موارد المهارة متاحة بلا شرط');await ov('skill');
 await p.goto(B+'skills/#s=m-shapes');await p.reload();await p.waitForTimeout(300);T(!(await p.innerText('#skbody')).includes('راجع ما تعلمته أولًا'),'لا قسم بلا مهارات سابقة');
 // لا مراجعات منشورة
 reviews={items:[]};await go('review/');T((await p.innerText('#skbody')).includes('لا توجد مراجعات متاحة'),'فارغة بلا مراجعات منشورة');
 // فشل
 fail=true;await p.goto(B+'review/');await p.reload();await p.waitForSelector('#rretry');T((await p.innerText('#skbody')).includes('تعذّر'),'رسالة فشل');fail=false;
 await p.goto(B+'skills/#s=m-addsub');await p.reload();await p.waitForTimeout(300);T(!(await p.innerText('#skbody')).includes('راجع ما تعلمته أولًا')&&(await p.$$eval('.skres',e=>e.length))>0,'فشل المراجعات لا يكسر صفحة المهارة');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
