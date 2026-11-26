// NODE_PATH=$(npm root -g) node tools/content/paths/test_paths.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});
const RANK={recognize:1,understand:2,practice:3,apply:4,review:5};
const srt=(a)=>a.slice().sort((x,y)=>RANK[x.s]-RANK[y.s]);
const PATHS=[
 P('1','arabic','ar-letter','ربط الحرف بصوته','g-ar-letter','يربط الحرف بصوته','سلسلة ربط الحرف بصوته',['a4','a5'],srt([I('bank:bank-y','practice'),I('stories:story-x','understand'),I('lib:s-p1','apply',false)]),{est:25}),
 P('3','arabic','ar-letter','ربط الحرف بصوته','g-ar-letter2','يتعرف الحرف','سلسلة أخرى لنفس المهارة',['a4'],srt([I('acts:act-1','practice'),I('bank:bank-y','practice'),I('lib:s-p1','review')])),
 P('2','math','m-addsub','الجمع والطرح الأساسيان','g-m-addsub','يجمع ويطرح','سلسلة الجمع والطرح',['g1','g2'],srt([I('lib:s-p3','practice'),I('quiz:qz-1','review'),I('bank:bank-g','practice')]))
];
const NOTES={'p-1':{'stories:story-x':{i:'اقرأ القصة مع طفلك',h:'انظر إلى أول الكلمة',v:'الحرف هو ب'},'lib:s-p1':{h:'خذ وقتك'}}};
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let failP=false;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='paths_public'){if(failP)return J({},500);return J({paths:PATHS})}
  if(m==='POST'&&tb==='series_public')return J(NOTES);
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:[],links:[]});
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(h)=>{await p.goto(B+'series/'+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(150)};
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};
 const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 const LS=(k)=>p.evaluate((k)=>JSON.parse(localStorage.getItem(k)),k);
 await go();let n=await names();
 console.log(W,'series:',n.join(' | '),await p.evaluate(()=>window.__seriesTest.SL.map(s=>s.slug+':'+s.st.length).join(',')));
 T(n.length>=2&&n.some(x=>x.includes('ربط الحرف')),'قائمة السلاسل');await ov('list');
 let body=await p.innerText('body');T(!/أكمل طفلك/.test(body),'لا تقدم قبل أي إنجاز');T(!/ضعيف|غير قادر/.test(body),'لا عبارات سلبية');
 await p.click('.skdom[data-d=math]');n=await names();T(n.length===1&&n[0].includes('الجمع'),'تصفية المجال');await p.click('.skdom[data-d=math]');
 await p.selectOption('#sage','a5');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'تصفية العمر: '+n);await p.selectOption('#sage','');
 const g=await p.$$eval('#sgr option',e=>e.map(x=>x.value));T(!g.some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع');
 // صفحة السلسلة
 await go('#s=p-1');let txt=await p.innerText('#skbody');
 T(await p.$$eval('.srdot',e=>e.length)===3,'ثلاث خطوات');T(await p.$$eval('.srdot.now',e=>e.length)===1,'مؤشر حالي واحد');
 T(txt.includes('الفهم')&&txt.includes('اقرأ القصة مع طفلك'),'الخطوة الأولى فهم مع التعليمات');
 T(!txt.includes('الحرف هو ب')&&!txt.includes('انظر إلى أول الكلمة'),'التلميح والإجابة مخفيان');
 await p.click('#srhint');T((await p.innerText('#srdet')).includes('انظر إلى أول الكلمة'),'التلميح يظهر عند الطلب');
 await p.click('#sransw');T((await p.innerText('#srdet')).includes('الحرف هو ب'),'الإجابة تظهر عند الطلب');
 T(await p.$('#srgo')!==null&&(await p.getAttribute('#srgo','href')).includes('stories'),'زر البدء برابط النشاط');
 T(await p.$eval('#srprev',e=>e.disabled),'السابق معطل في الأولى');
 await p.click('#srnext');txt=await p.innerText('#srdet');T(txt.includes('التدريب')&&!txt.includes('أحتاج تلميحًا'),'الخطوة الثانية بلا تلميح مكتوب: لا زر تلميح');
 T(await p.$('#sransw')===null,'لا زر إجابة بلا إجابة مكتوبة');
 T(txt.includes('يُسجَّل إنجازه تلقائيًا')&&await p.$('#srdone')===null,'بنك الأنشطة: تسجيل تلقائي بلا خانة يدوية');
 await p.click('#srnext');txt=await p.innerText('#srdet');T(txt.includes('اختياري')&&txt.includes('أحتاج تلميحًا'),'الثالثة اختيارية وفيها تلميح فقط');T(await p.$eval('#srnext',e=>e.disabled),'التالي معطل في الأخيرة');
 await p.click('#srprev');await p.click('#srprev');T((await p.innerText('#srdet')).includes('الفهم'),'الرجوع إلى نشاط سابق');
 // فتح النشاط لا يُحتسب
 await p.evaluate(()=>{const e=document.querySelector('#srgo');e.addEventListener('click',ev=>ev.preventDefault())});await p.click('#srgo');
 T((await p.innerText('#skbody')).includes('لم يكمل طفلك'),'الفتح وحده لا يُحتسب');
 T(await p.evaluate(()=>!!sessionStorage.getItem('zad-path-cur')),'يُحفظ سياق شريط التنقل عند البدء');
 // تخطي
 await p.click('#srskip');T(await p.$$eval('.srdot.skip',e=>e.length)===1&&await p.$$eval('.srdot.now',e=>e.length)===1,'تخطّى: الخطوة تُوسم والحالية تتقدم');
 T(!(await p.innerText('#skbody')).includes('أكمل طفلك'),'التخطي ليس إنجازًا');
 await p.click('.srdot[data-i="0"]');T((await p.innerText('#srdet')).includes('أعد هذا النشاط'),'إعادة الخطوة المتخطاة');await p.click('#srskip');T(await p.$$eval('.srdot.skip',e=>e.length)===0,'إلغاء التخطي');
 // إنجاز يدوي من ولي الأمر
 await p.click('.srdot[data-i="0"]');await p.click('#srdone');txt=await p.innerText('#skbody');T(/أكمل طفلك ١ من ٣/.test(txt),'إنجاز ولي الأمر يُحتسب: '+txt.slice(0,200));T(await p.$$eval('.srdot.done',e=>e.length)===1,'خطوة منجزة');
 let st=await LS('zad-series-v1');T(st&&Object.values(st.kids)[0]['p-1'].done.length===1,'التخزين المحلي');
 // إنجاز تلقائي من بنك الأنشطة
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'))||{cur:'k1',kids:{k1:{}}};const k=d.kids[d.cur]||d.kids[Object.keys(d.kids)[0]];k.bank=k.bank||{done:{}};k.bank.done['bank-y']={d:1,w:2,best:3,t:1,last:1};localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 await go('#s=p-1');T(/أكمل طفلك ٢ من ٣/.test(await p.innerText('#skbody')),'إنجاز البنك تلقائيًا');
 T(await p.$$eval('.srdot.done',e=>e.length)===2,'خطوتان منجزتان');
 // ولي الأمر
 await p.click('.srpar summary');const par=await p.innerText('.srpar');T(par.includes('ربط الحرف بصوته')&&par.includes('نصل الحرف')&&par.includes('يمكن ممارسة هذه المهارة مرة أخرى'),'لوحة ولي الأمر');
 await p.click('[data-reopen]');T((await p.innerText('#srdet')).length>0,'إعادة فتح نشاط سابق');await p.click('.srpar summary');
 await p.check('#srrev');await go('');T((await p.innerText('body')).includes('للمراجعة المنزلية'),'اختيار للمراجعة المنزلية');await p.click('#srv');n=await names();T(n.length===1,'تصفية المراجعة المنزلية: '+n);
 // الإكمال والاقتراحات
 await go('#s=p-1');await p.click('.srdot[data-i="2"]');await p.click('#srdone');txt=await p.innerText('#skbody');
 T(txt.includes('أنهيتم هذه السلسلة'),'رسالة الإنهاء');T(await p.$$eval('.srsug a',e=>e.length)>=1,'اقتراح محتوى مرتبط من نفس المهارة');
 T(!/ضعيف|غير قادر/.test(txt),'لغة داعمة');await ov('series');
 // مسار غير موجود
 await go('#s=nope');T((await p.innerText('#skbody')).includes('لم نجد هذه السلسلة'),'سلسلة غير موجودة');
 // فشل التحميل
 failP=true;await p.goto(B+'series/');await p.reload();await p.waitForSelector('#sretry');T((await p.innerText('#skbody')).includes('تعذّر'),'رسالة فشل');failP=false;
 T(await p.$$eval('a[href*="library"]',e=>e.length)>0,'رابط المكتبة');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
