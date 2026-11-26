// NODE_PATH=$(npm root -g) node tools/content/week/test_week.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});


const sk=(id,slug,domain,name,levels)=>({id,slug,domain,name,descr:'وصف '+name,levels,path:false,parent:null});
const SKILLS=[sk('S1','m-count','math','العد',['a4','a5','a6']),sk('S2','m-shapes','math','التعرف على الأشكال',['a4','a5','a6']),sk('S3','ar-letter-sound','arabic','ربط الحرف بصوته',['a4','a5','a6']),sk('S4','m-addsub','math','الجمع والطرح',['g1','g2'])];
const EN=(day,t,kind,domain,item,alt,skill)=>({day,t,d:'وصف '+t,kind,domain,item,alt:alt||null,skill:skill||'m-count'});
const ACT={items:[
 {slug:'w-1',title:'أسبوع العد والأشكال',goals:'نمارس العد والأشكال',levels:['a4','a5'],entries:[EN(0,'نتعرف على العد','story','math','stories:story-x'),EN(2,'نلعب ونعد','game','math','bank:bank-y','lib:s-p2'),EN(3,'ورقة العد','worksheet','math','lib:s-p1'),EN(5,'مراجعة','review','review','proj:proj-1'),EN(1,'نشاط مفقود','game','math','lib:ghost')]},
 {slug:'w-2',title:'خطة الصفوف',goals:'x',levels:['g1'],entries:[EN(0,'تمرين','worksheet','math','bank:bank-g')]},
 {slug:'w-3',title:'خطة فارغة الموارد',goals:'x',levels:['a5'],entries:[EN(0,'مفقود','game','math','lib:ghost')]},
 {slug:'w-4',title:'صف خامس',goals:'x',levels:['g5'],entries:[EN(0,'x','game','math','bank:bank-y')]}]};
const REVS={items:[{s:'m-count',intro:'x',example:null,summary:null,pre:[],next:[]}]};
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let fail=false,act=ACT;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='wplan_public'){if(fail)return J({},500);return J(act)}
  if(m==='POST'&&tb==='review_public')return J(REVS);
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:SKILLS,links:[]});
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(h)=>{await p.goto(B+'tasks/'+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(150)};
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 const tit=()=>p.$$eval('.tkcard h3',e=>e.map(x=>x.textContent));
 const go5=async(h)=>{await p.goto(B+'week/'+(h||''));await p.reload();await p.waitForSelector('#skbody .tkcard, #skbody .fzempty, #skbody .skback, #skbody .tktabs');await p.waitForTimeout(150)};
 await p.addInitScript(()=>{window.__wkNow=()=>window.__D||'2026-11-26'});
 await go5();let t=await p.innerText('#skbody');T(t.includes('اختر عمر طفلك'),'بلا عمر: يطلب الاختيار');
 await p.selectOption('#wage','a5');let pn=await p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));T(pn.join()==='أسبوع العد والأشكال','خطة صالحة فقط (بلا مورد مفقود ولا صف خامس): '+pn);await ov('home');
 await p.reload();await p.waitForSelector('.skcard');T((await p.$$eval('.skcard h3',e=>e.length))===1,'تذكّر العمر');
 const gs=await p.$$eval('#wgr option',e=>e.map(x=>x.value));T(!gs.some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع');
 await go5('#s=w-1');t=await p.innerText('#skbody');
 T(await p.$$eval('.wkday',e=>e.length)===7,'سبعة أيام');T(t.includes('نتعرف على العد')&&t.includes('نلعب ونعد')&&t.includes('مراجعة')&&!t.includes('نشاط مفقود'),'أنشطة الخطة الصالحة فقط');
 T(await p.$$eval('.wkday.today',e=>e.length)===1&&(await p.innerText('.wkday.today')).includes('الخميس'),'تمييز اليوم (الخميس)');await ov('detail');
 T(!/ضعيف|فشل|تأخرت|فاتك/.test(t),'لا رسائل ذنب أو ضعف');T(!t.includes('أكملت '),'لا ملخص بلا إكمال: '+t.slice(t.indexOf('ملخص')));
 T(!(await p.$('.wksum')),'لا ملخص قبل أي نشاط');
 T((await p.getAttribute('.tkcard [data-a=start]','href')).length>5,'زر ابدأ يفتح المورد');
 const ds=()=>p.evaluate(()=>[...document.querySelectorAll('.wkday')].map(d=>[...d.querySelectorAll('.tkcard h3')].map(x=>x.textContent)));
 let d0=await ds();T(d0[0].join()==='نتعرف على العد'&&d0[2].join()==='نلعب ونعد','توزيع الأيام الأصلي');
 await p.selectOption('[data-k="w-1|bank:bank-y"] select[data-a=mv]','3');d0=await ds();T(d0[3].join()==='نلعب ونعد,ورقة العد'||d0[3].includes('نلعب ونعد'),'نقل نشاط إلى يوم آخر: '+JSON.stringify(d0[3]));
 await p.click('[data-k="w-1|bank:bank-y"] [data-a=up]');d0=await ds();T(d0[3][0]==='نلعب ونعد','تقديم الترتيب داخل اليوم: '+d0[3]);
 await p.click('[data-k="w-1|bank:bank-y"] [data-a=dn]');d0=await ds();T(d0[3][1]==='نلعب ونعد','تأخير الترتيب: '+d0[3]);
 await p.click('[data-k="w-1|lib:s-p1"] [data-a=post]');d0=await ds();T(d0[4].includes('ورقة العد')&&(await p.innerText('[data-k="w-1|lib:s-p1"]')).includes('أُجّل ١ مرة'),'تأجيل إلى اليوم التالي');
 const h0=await p.getAttribute('[data-k="w-1|bank:bank-y"] [data-a=start]','href');await p.click('[data-k="w-1|bank:bank-y"] [data-a=alt]');const h1=await p.getAttribute('[data-k="w-1|bank:bank-y"] [data-a=start]','href');T(h0!==h1&&h1.length>5,'النشاط البديل يغيّر الرابط');
 T(await p.$('[data-k="w-1|lib:s-p1"] [data-a=alt]')===null,'لا زر بديل بلا بديل');
 await p.click('[data-k="w-1|stories:story-x"] [data-a=rm]');T(!(await p.innerText('#skbody')).includes('نتعرف على العد</h3>')&&(await p.innerText('#skbody')).includes('أنشطة حذفتها من خطتي'),'حذف من خطتي');await p.click('[data-r]');T((await tit()).includes('نتعرف على العد'),'إعادة المحذوف');
 await p.click('[data-k="w-1|bank:bank-y"] [data-a=done]');t=await p.innerText('#skbody');T(/أكملت ١ من ٤ نشاطًا/.test(t)&&t.includes('مهارات مارستها'),'الملخص بعد الضغط فقط: '+t.slice(t.indexOf('ملخص'),t.indexOf('ملخص')+80));T(/لا يقيّم قدرات/.test(t),'الملخص غير تقييمي');
 await p.click('[data-k="w-1|bank:bank-y"] [data-a=done]');t=await p.innerText('#skbody');T(t.includes('أنشطة أعدتها'),'الأنشطة المعادة');
 await p.click('[data-k="w-1|bank:bank-y"] [data-a=undo]');await p.click('[data-k="w-1|bank:bank-y"] [data-a=undo]');T(!(await p.$('.wksum .wkbar')),'التراجع');
 await p.click('#wpause');T((await p.innerText('#skbody')).includes('متوقفة مؤقتًا'),'إيقاف مؤقت');await p.click('#wresume');T(!(await p.innerText('#skbody')).includes('متوقفة مؤقتًا'),'استئناف');
 await p.fill('#wnotes','ملاحظة لي');await p.dispatchEvent('#wnotes','change');await go5('#s=w-1');T((await p.inputValue('#wnotes'))==='ملاحظة لي','حفظ الملاحظات محليًا');
 await p.click('[data-f="m-count"]');T((await tit()).length>0,'التركيز على مهارة');await p.click('[data-f="m-count"]');
 let st=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-week-v1')));T(Object.keys(Object.values(st.kids)[0].plans)[0]==='w-1@2026-11-21','مفتاح الأسبوع يبدأ السبت: '+Object.keys(Object.values(st.kids)[0].plans));
 await p.click('[data-tab=mine]').catch(async()=>{await go5();await p.click('[data-tab=mine]')});
 await p.evaluate(()=>{window.__D='2026-12-03'});await go5();await p.addInitScript(()=>{window.__D='2026-12-03'});await p.reload();await p.waitForSelector('#skbody');await p.click('[data-tab=past]');T((await p.innerText('#skbody')).includes('أسبوع العد والأشكال')&&/أكملت|بلا أنشطة/.test(await p.innerText('#skbody')),'الأسابيع السابقة');
 await p.click('.skcard .skgo');await p.waitForSelector('.tkcard');T((await tit()).length>0,'فتح أسبوع سابق');
 await p.click('.srpar summary');T((await p.innerText('.srpar')).includes('ليست جدولًا إلزاميًا')||(await p.innerText('.srpar')).includes('مرن'),'لوحة ولي الأمر');
 await go5('#s=w-3');T((await p.innerText('#skbody')).includes('لم نجد هذه الخطة'),'خطة مواردها مفقودة لا تُفتح');
 act={items:[]};await go5();await p.selectOption('#wage','a5');T((await p.innerText('#skbody')).includes('لا توجد خطط'),'فارغة');
 fail=true;await p.goto(B+'week/');await p.reload();await p.waitForSelector('#wretry');T((await p.innerText('#skbody')).includes('تعذّر'),'رسالة فشل');fail=false;
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
