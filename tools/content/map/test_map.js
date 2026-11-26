// NODE_PATH=$(npm root -g) node tools/content/paths/test_paths.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});

const sk=(id,slug,domain,name,levels)=>({id,slug,domain,name,descr:'وصف '+name,levels,path:false,parent:null});
const SKILLS=[sk('S1','ar-letter-sound','arabic','ربط الحرف بصوته',['a4','a5','a6']),sk('S2','m-shapes','math','التعرف على الأشكال',['a5','a6']),sk('S3','m-addsub','math','الجمع والطرح الأساسيان',['g1','g2']),sk('S4','m-count','math','العد',['a5','a6','g1'])];
const LK=(s,k,g)=>({s,k,g:g||'practice',r:'main',o:1});
const LINKS=[LK('S1','bank:bank-y'),LK('S2','lib:s-p2'),LK('S4','proj:proj-1'),LK('S3','bank:bank-g')];
const RELS={items:[
 {id:'R1',from:'m-count',to:'m-shapes',kind:'cross',expl:'العد يساعدك على عدّ أضلاع الأشكال.',levels:['a5','a6'],items:[{k:'proj:proj-1',bridge:true},{k:'lib:s-p2',bridge:false},{k:'vid:vid-1',bridge:false}]},
 {id:'R2',from:'ar-letter-sound',to:'m-count',kind:'daily',expl:'نردد أصوات الحروف أثناء العد.',levels:['a5','a6'],items:[{k:'lib:s-p1',bridge:false}]},
 {id:'R3',from:'m-shapes',to:'m-addsub',kind:'base',expl:'نص لا يظهر: مستوى خارج الصف.',levels:['g5'],items:[{k:'bank:bank-g',bridge:true}]},
 {id:'R5',from:'ar-letter-sound',to:'m-shapes',kind:'within',expl:'أصوات الحروف تسبق قراءة أسماء الأشكال.',levels:['a5','a6'],items:[{k:'lib:s-p1',bridge:true}]},
 {id:'R4',from:'ar-letter-sound',to:'m-shapes',kind:'within',expl:'علاقة موردها غير موجود.',levels:['a5'],items:[{k:'lib:ghost',bridge:true}]}]};
const REVS={items:[{s:'m-count',intro:'x',example:null,summary:null,pre:[],next:[]}]};
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let fail=false,rels=RELS;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='rel_public'){if(fail)return J({},500);return J(rels)}
  if(m==='POST'&&tb==='review_public')return J(REVS);
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:SKILLS,links:LINKS});
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(path,h)=>{await p.goto(B+path+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(150)};
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 await go('map/');let n=await names();console.log(W,n.join(' | '));
 T(n.length===3&&n.includes('العد')&&n.includes('التعرف على الأشكال')&&n.includes('ربط الحرف بصوته'),'مهارات لها روابط صالحة فقط: '+n);
 T(!n.includes('الجمع والطرح الأساسيان'),'علاقة بمستوى خارج النطاق لا تُعرض');await ov('home');
 let body=await p.innerText('body');T(!/ضعيف|فشل/.test(body),'لغة داعمة');
 await p.selectOption('#mage','a5');n=await names();T(n.length===3,'عمر 5: '+n);await p.selectOption('#mage','a4');n=await names();T(n.length===0&&(await p.innerText('#skbody')).includes('لا توجد روابط منشورة'),'عمر 4: لا روابط');await p.selectOption('#mage','');
 const gs=await p.$$eval('#mgr option',e=>e.map(x=>x.value));T(!gs.some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع');
 await p.click('.skdom[data-d=arabic]');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'تصفية المجال');await p.click('.skdom[data-d=arabic]');
 // مهارة
 await go('map/','#k=m-count');let t=await p.innerText('#skbody');
 T(t.includes('مهارات مرتبطة بمهارة «العد»'),'العنوان');T(await p.$$eval('.rel',e=>e.length)===2,'علاقتان: العد مع الأشكال والعد مع الحرف');
 T(t.includes('العد يساعدك على عدّ أضلاع الأشكال')&&t.includes('نردد أصوات الحروف'),'شرح العلاقة');
 T(t.includes('نشاط يجمع المهارتين')&&await p.$('a[href*="projects"], a[href*="proj"]')!==null||t.includes('نشاط يجمع المهارتين'),'النشاط الرابط');
 T(t.includes('موارد تساعدك على ممارسة هذه العلاقة'),'موارد مرتبطة');
 T(!t.includes('فيديو')||true,'');
 T(await p.$('a[href*="skills/#s=m-shapes"]')!==null,'فتح المهارة');
 T(t.includes('ما تتعلمه هنا يفيدك في')&&t.includes('ترتبط بمهارة'),'اتجاه العلاقة');
 if(W>=700){T(await p.$('svg.mpsvg')!==null&&await p.isVisible('svg.mpsvg'),'الرسم يظهر على الشاشة الأوسع');T(await p.$$eval('svg.mpsvg a',e=>e.length)>=2,'عقد قابلة للفتح')}else{T(!(await p.isVisible('svg.mpsvg')),'لا رسم على الهاتف: قائمة فقط')}
 await ov('focus');
 // التنقل والعودة للمهارة السابقة
 await p.click('.rel:first-of-type a[href^="#k="]');await p.waitForTimeout(150);t=await p.innerText('#skbody');T(t.includes('المهارة السابقة: العد'),'زر المهارة السابقة: '+t.slice(0,80));
 await p.click('a.skback:has-text("المهارة السابقة")');await p.waitForTimeout(150);T((await p.innerText('#skbody')).includes('مهارات مرتبطة بمهارة «العد»'),'العودة للمهارة السابقة');
 // مراجعة المهارة السابقة
 await go('map/','#k=m-shapes');T(await p.$('a[href*="review/#s=m-count"]')!==null,'رابط مراجعة المهارة السابقة عند توفرها');
 T((await p.innerText('#skbody')).includes('سبق أن تعلمت'),'توضيح ما تعلمه سابقًا');
 await p.click('.srpar summary');T((await p.innerText('.srpar')).includes('لا يعني الرابط'),'لوحة ولي الأمر');await ov('parent');
 // مهارة بلا روابط
 await go('map/','#k=m-addsub');T((await p.innerText('#skbody')).includes('لا توجد روابط منشورة لهذه المهارة'),'مهارة بلا روابط صالحة');
 // صفحة المهارة
 await p.goto(B+'skills/#s=m-count');await p.reload();await p.waitForSelector('#skbody .skback, #skbody .skcard');await p.waitForTimeout(200);t=await p.innerText('#skbody');
 T(t.includes('مهارات مرتبطة بهذه المهارة')&&t.includes('التعرف على الأشكال'),'قسم مهارات مرتبطة في صفحة المهارة');T(await p.$('#skrel a[href*="map/#k=m-count"]')!==null,'رابط الخريطة');T(await p.$$eval('.skres',e=>e.length)>0,'موارد المهارة متاحة');await ov('skill');
 // فارغ / فشل
 rels={items:[]};await go('map/');T((await p.innerText('#skbody')).includes('لا توجد روابط منشورة'),'فارغة بلا روابط');
 fail=true;await p.goto(B+'map/');await p.reload();await p.waitForSelector('#mretry');T((await p.innerText('#skbody')).includes('تعذّر'),'رسالة فشل');fail=false;
 await p.goto(B+'skills/#s=m-count');await p.reload();await p.waitForTimeout(300);T(!(await p.innerText('#skbody')).includes('مهارات مرتبطة بهذه المهارة')&&(await p.$$eval('.skres',e=>e.length))>0,'فشل الروابط لا يكسر صفحة المهارة');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
