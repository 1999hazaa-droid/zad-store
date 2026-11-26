// NODE_PATH=$(npm root -g) node tools/content/tasks/test_tasks.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});


const sk=(id,slug,domain,name,levels)=>({id,slug,domain,name,descr:'وصف '+name,levels,path:false,parent:null});
const SKILLS=[sk('S1','m-count','math','العد',['a4','a5','a6']),sk('S2','m-shapes','math','التعرف على الأشكال',['a4','a5','a6']),sk('S3','ar-letter-sound','arabic','ربط الحرف بصوته',['a4','a5','a6']),sk('S4','m-addsub','math','الجمع والطرح',['g1','g2'])];
const mk=(slug,title,cat,levels,tasks)=>({slug,title,descr:'وصف '+title,cat,skill:'m-count',levels,est:10,tasks});
const TK=(t,kind,item,min)=>({t,d:'وصف قصير',kind,item,min:min||null});
const ACT={items:[
 mk('t-1','مهام الحروف','arabic',['a4','a5'],[TK('العب بالحروف','game','bank:bank-y',5),TK('ورقة الحرف','worksheet','lib:s-p1'),TK('قصة قصيرة','story','stories:story-x'),TK('بطاقة الحرف','card','lib:s-p2')]),
 mk('t-2','مهام العد','math',['a5','a6'],[TK('عد النجوم','interactive','bank:bank-y',4),TK('مشروع صغير','home','proj:proj-1'),TK('ورقة العد','worksheet','lib:s-p1')]),
 mk('t-3','مهام ناقصة','think',['a5'],[TK('مورد غير موجود','game','lib:ghost')]),
 mk('t-4','صف خامس','life',['g5'],[TK('x','game','bank:bank-y')])]};
const REVS={items:[{s:'m-count',intro:'x',example:null,summary:null,pre:[],next:[]}]};
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let fail=false,act=ACT;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='dtask_public'){if(fail)return J({},500);return J(act)}
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
 const go5=async(h)=>{await p.goto(B+'tasks/'+(h||''));await p.reload();await p.waitForSelector('#skbody .tkcard, #skbody .fzempty, #skbody .skback, #skbody .tktabs');await p.waitForTimeout(150)};
 await p.addInitScript(()=>{window.__tkNow=()=>window.__D||'2026-11-26'});
 await go5();let t=await p.innerText('#skbody');T(t.includes('اختر عمر طفلك'),'بلا عمر: يطلب الاختيار');
 await p.selectOption('#tage','a5');let n=await tit();console.log(W,n.join(' | '));
 T(n.length===3,'ثلاث مهام يوميًا كحد أقصى: '+n.length);
 const kinds=await p.evaluate(()=>window.__tkTest.today().map(x=>x.kind));T(new Set(kinds).size===kinds.length,'أنواع متنوعة: '+kinds);
 T(!n.includes('مورد غير موجود'),'لا مهمة مواردها مفقودة');await ov('today');
 await p.reload();await p.waitForSelector('.tkcard');T((await tit()).join()===n.join(),'ثبات الاقتراح وتذكّر العمر خلال اليوم');
 const yk=await p.evaluate(()=>{window.__D='2026-11-25';const k=window.__tkTest.today().map(x=>x.kind);window.__D=undefined;return k});
 const tk2=await p.evaluate(()=>window.__tkTest.today().map(x=>x.kind));
 T(!tk2.some(k=>yk.includes(k)),'تجنّب أنواع الأمس المعروضة فعلًا: '+yk+' / '+tk2);
 body=await p.innerText('body');T(!/ضعيف|فشل/.test(body),'لغة داعمة');
 T(!/أكملت \d|أكملت [٠-٩]/.test(body),'لا تقدم قبل أي إكمال');
 T((await p.getAttribute('.tkcard [data-a=start]','href')).length>5,'زر ابدأ يفتح المورد');
 await p.click('.tkcard [data-a=done]');await p.waitForTimeout(100);t=await p.innerText('#skbody');T(/أكملت ١ من ٣ اليوم/.test(t),'التقدم بعد الضغط فقط: '+t.slice(0,80));
 let sg=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-dtask-v1')));T(Object.keys(Object.values(sg.kids)[0].done).length===1,'تخزين محلي');
 await p.click('.tkcard [data-a=undo]');T(!/أكملت ١ من/.test(await p.innerText('#skbody')),'التراجع');
 const before=(await tit()).join();await p.click('#tshuf');T((await tit()).length===3,'اقتراح آخر');
 await p.click('.tkcard [data-a=save]');await p.click('[data-tab=saved]');T((await tit()).length===1,'قائمة المحفوظات');await p.click('.tkcard [data-a=done]');await p.click('[data-tab=done]');T((await tit()).length===1,'قائمة السابقة');
 await p.click('[data-tab=sets]');T(await p.$$eval('.skcard',e=>e.length)>=2,'مجموعات');const ch=await p.$$eval('.skdom',e=>e.map(x=>x.dataset.c));T(ch.join()==='arabic,math','أنواع متاحة فقط: '+ch);
 await p.selectOption('#tage','a6');T((await p.$$eval('.skcard h3',e=>e.map(x=>x.textContent))).join()==='مهام العد','عمر 6: مجموعة العد فقط');
 const gs=await p.$$eval('#tgr option',e=>e.map(x=>x.value));T(!gs.some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع');
 await go5('#s=t-1');T((await p.innerText('#skbody')).includes('العب بالحروف')&&(await tit()).length===4,'تفاصيل المجموعة');await ov('detail');
 await p.click('.srpar summary');T((await p.innerText('.srpar')).includes('وليست')||(await p.innerText('.srpar')).includes('اقتراحات'),'لوحة ولي الأمر مرنة');
 await go5('#s=t-3');T((await p.innerText('#skbody')).includes('لم نجد هذه المجموعة'),'مجموعة مواردها مفقودة لا تُفتح');
 act={items:[]};await go5();await p.selectOption('#tage','a5');T((await p.innerText('#skbody')).includes('لا توجد مهام'),'فارغة');
 fail=true;await p.goto(B+'tasks/');await p.reload();await p.waitForSelector('#tretry');T((await p.innerText('#skbody')).includes('تعذّر'),'رسالة فشل');fail=false;
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
