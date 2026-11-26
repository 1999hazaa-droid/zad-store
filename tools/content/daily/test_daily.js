// NODE_PATH=$(npm root -g) node tools/content/daily/test_daily.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});


const sk=(id,slug,domain,name,levels)=>({id,slug,domain,name,descr:'وصف '+name,levels,path:false,parent:null});
const SKILLS=[sk('S1','m-count','math','العد',['a4','a5','a6']),sk('S2','m-shapes','math','التعرف على الأشكال',['a4','a5','a6']),sk('S3','ar-letter-sound','arabic','ربط الحرف بصوته',['a4','a5','a6']),sk('S4','m-addsub','math','الجمع والطرح',['g1','g2'])];
const ACT={items:[
 {slug:'d-1',name:'رتّب حقيبتك',kind:'school',item:'bank:bank-y',print:'lib:s-p1',main:'m-count',extra:['m-shapes'],levels:['a4','a5'],goal:'نصنف الأدوات ونعدها.',scene:'حقيبة مدرسية وأدوات مصورة.',tools:'حقيبة وثلاثة أقلام',instr:'اختر الأدوات المناسبة للحقيبة.',steps:['نختار الأدوات','نعدها','نرتبها'],inter:'اختيار وترتيب',feedback:'نشجعك ونعيد المحاولة.',parent:'نفذوا النشاط معًا ولا تستعجلوا.',extra_key:'lib:s-p2'},
 {slug:'d-2',name:'جهّز المائدة',kind:'food',item:'proj:proj-1',print:null,main:'m-count',extra:[],levels:['a5','a6'],goal:'نعد أدوات الطعام.',scene:'مائدة طعام مصورة.',tools:null,instr:'اختر الأدوات المطلوبة.',steps:['نختار','نعد'],inter:null,feedback:null,parent:null,extra_key:null},
 {slug:'d-3',name:'مورد غير موجود',kind:'home',item:'lib:ghost',print:null,main:'m-count',extra:[],levels:['a5'],goal:'x',scene:'s',tools:null,instr:'y',steps:['z'],inter:null,feedback:null,parent:null,extra_key:null},
 {slug:'d-4',name:'صف خامس',kind:'env',item:'bank:bank-y',print:null,main:'m-count',extra:[],levels:['g5'],goal:'x',scene:'s',tools:null,instr:'y',steps:['z'],inter:null,feedback:null,parent:null,extra_key:null}]};
const REVS={items:[{s:'m-count',intro:'x',example:null,summary:null,pre:[],next:[]}]};
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let fail=false,act=ACT;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='daily_public'){if(fail)return J({},500);return J(act)}
  if(m==='POST'&&tb==='review_public')return J(REVS);
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:SKILLS,links:[]});
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(h)=>{await p.goto(B+'daily/'+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(150)};
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 await go();let n=await names();console.log(W,n.join(' | '));
 T(n.length===2&&n.includes('رتّب حقيبتك')&&n.includes('جهّز المائدة'),'موقفان صالحان فقط (بلا مورد مفقود ولا صف خامس): '+n);await ov('home');
 let body=await p.innerText('body');T(!/ضعيف|فشل/.test(body),'لغة داعمة');T(!/جرّبته/.test(body),'لا سجل قبل أي تجربة');
 const ch=await p.$$eval('.skdom',e=>e.map(x=>x.dataset.k));T(ch.join()==='school,food','أنواع متاحة فقط: '+ch);
 await p.click('.skdom[data-k=food]');n=await names();T(n.length===1&&n[0].includes('المائدة'),'تصفية النوع');await p.click('.skdom[data-k=food]');
 await p.selectOption('#iage','a4');n=await names();T(n.length===1&&n[0].includes('حقيبتك'),'عمر 4: '+n);await p.selectOption('#iage','a6');n=await names();T(n.length===1&&n[0].includes('المائدة'),'عمر 6: '+n);await p.selectOption('#iage','');
 const gs=await p.$$eval('#igr option',e=>e.map(x=>x.value));T(!gs.some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع');
 await go('#a=d-1');let t=await p.innerText('#skbody');
 T(t.includes('نصنف الأدوات')&&t.includes('حقيبة مدرسية')&&t.includes('حقيبة وثلاثة أقلام')&&t.includes('اختر الأدوات المناسبة')&&t.includes('اختيار وترتيب')&&t.includes('نشجعك'),'كل عناصر الموقف');
 T(await p.$$eval('ol.igst li',e=>e.length)===3,'ثلاث خطوات');T(t.includes('العد')&&t.includes('التعرف على الأشكال'),'المهارات');
 T((await p.getAttribute('#igstart','href')).includes('bank/play'),'زر البدء يفتح النشاط الفعلي: '+await p.getAttribute('#igstart','href'));
 T(await p.$('#igprint')!==null&&(await p.getAttribute('#igprint','href')).length>5,'زر النسخة القابلة للطباعة');
 T(t.includes('ماذا بعد؟')&&t.includes('نشاط إضافي')&&t.includes('مراجعة قصيرة'),'اقتراحات بعد الموقف');
 T(await p.$('a[href*="review/#s=m-count"]')!==null,'رابط المراجعة');T(!/\d\s*%|٪/.test(t),'لا نسب');T(!t.includes('جرّبته'),'لا سجل بلا ضغط');
 await p.click('#igdone');t=await p.innerText('#skbody');T(t.includes('جرّبته ١ مرة')&&/رائع|أنت تتدرب|يمكنك العودة/.test(t),'تسجيل التجربة بالضغط فقط: '+t.slice(0,40));
 let st=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-daily-v1')));T(Object.values(st.kids)[0]['d-1'].n===1,'تخزين محلي');
 await p.click('#igundo');T(!(await p.innerText('#skbody')).includes('جرّبته ١'),'التراجع');
 await p.click('.srpar summary');const pt=await p.innerText('.srpar');T(pt.includes('الأدوات')&&pt.includes('نفذوا النشاط معًا')&&pt.includes('النسخة القابلة للطباعة')&&pt.includes('وليس تقييم'),'لوحة ولي الأمر');await ov('detail');
 await go('#a=d-2');t=await p.innerText('#skbody');T(!t.includes('الأدوات أو الموارد')&&!t.includes('طريقة التفاعل')&&!t.includes('التغذية الراجعة')&&await p.$('#igprint')===null,'لا حقول فارغة ولا زر طباعة بلا ملف');
 await go('#a=d-3');T((await p.innerText('#skbody')).includes('لم نجد هذا الموقف'),'موقف مورده مفقود لا يُفتح');
 act={items:[]};await go();T((await p.innerText('#skbody')).includes('لا توجد مواقف'),'فارغة');
 fail=true;await p.goto(B+'daily/');await p.reload();await p.waitForSelector('#iretry');T((await p.innerText('#skbody')).includes('تعذّر'),'رسالة فشل');fail=false;
 T(await p.$$eval('a[href*="library"]',e=>e.length)>0,'رابط المكتبة');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
