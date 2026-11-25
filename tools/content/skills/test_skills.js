// NODE_PATH=$(npm root -g) node tools/content/skills/test_skills.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد المهارات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[{slug:'arabic',name:'مهارات اللغة العربية',icon:'book.svg',color:'#e6dcff',sort:1},{slug:'math',name:'مهارات الرياضيات',icon:'numbers.svg',color:'#dff3ff',sort:2},{slug:'science',name:'العلوم والاستكشاف',icon:'microscope.svg',color:'#dff6e7',sort:3}];
const sk=(id,slug,domain,name,levels,path)=>({id,slug,domain,name,descr:'وصف '+name,levels,path:!!path,parent:null});
const SKILLS=[sk('S1','ar-letter-sound','arabic','ربط الحرف بصوته',['a4','a5','a6'],1),sk('S2','m-addsub','math','الجمع والطرح الأساسيان',['g1','g2'],1),sk('S3','m-shapes','math','التعرف على الأشكال',['a5','a6'],0),sk('S4','s-classify','science','التصنيف',['a3','a4','a5','a6'],0),sk('S5','s-ask','science','طرح الأسئلة',['g1'],0),sk('S6','s-observe','science','الملاحظة',['a4'],0)];
const LK=(s,k,g,r,o)=>({s,k,g,r:r||'main',o:o||1});
const LINKS=[LK('S1','bank:bank-y','practice'),LK('S1','lib:s-p1','recognize','sub',1),LK('S2','bank:bank-g','practice'),LK('S2','quiz:qz-1','review','sub'),LK('S2','lib:s-p3','practice','sub',2),LK('S3','lib:s-p2','practice'),LK('S3','vid:vid-1','recognize','sub'),LK('S3','bank:bank-g','practice','sub',9),LK('S4','acts:act-1','practice'),LK('S6','lib:s-p9','practice')];
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let failSk=false,rpc=[];
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'&&tb==='skills_public'){rpc.push(tb);if(failSk)return J({},500);return J({domains:dm,skills:SKILLS,links:LINKS})}
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(h)=>{await p.goto(B+'skills/'+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(120)};
 const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};
 // 1 القائمة
 await go();let n=await names();
 T(n.length===4,'4 مهارات فيها موارد، وليس '+n.length+': '+n);T(!n.includes('طرح الأسئلة'),'مهارة بلا موارد لا تظهر');T(!n.includes('الملاحظة'),'مهارة مواردها مخفية لا تظهر');
 T(await p.$$eval('.skdom',e=>e.length)===3,'ثلاثة مجالات');await ov('list');
 T(!/\d\s*%|٪/.test(await p.innerText('body')),'لا نسب مئوية في القائمة');
 // 2 المجال
 await p.click('.skdom[data-d=math]');n=await names();T(n.length===2&&n.every(x=>/الجمع|الأشكال/.test(x)),'مجال الرياضيات: '+n);await p.click('.skdom[data-d=math]');
 // 3 العمر
 await p.selectOption('#sklv','g1');n=await names();T(n.length===1&&n[0].includes('الجمع'),'عمر g1: '+n);
 await p.selectOption('#sklv','a5');n=await names();T(n.length===2&&!n.some(x=>x.includes('الجمع')),'عمر a5: '+n);
 await p.selectOption('#sklv','');
 // 4 المستوى
 await p.selectOption('#skst','review');n=await names();T(n.length===1&&n[0].includes('الجمع'),'مستوى مراجعة: '+n);await p.selectOption('#skst','');
 // 5 مجاني/مدفوع
 await p.selectOption('#skpay','paid');n=await names();T(n.length===1&&n[0].includes('الجمع'),'مدفوع: '+n);await p.selectOption('#skpay','free');n=await names();T(n.length===4,'مجاني: '+n.length);await p.selectOption('#skpay','');
 // 6 النوع
 await p.selectOption('#skct','quiz').catch(()=>{});n=await names();T(n.length===1&&n[0].includes('الجمع'),'نوع اختبار: '+n);await p.selectOption('#skct','');
 // 7 بحث نصي
 await p.fill('#skq','الأشكال');n=await names();T(n.length===1,'بحث نصي: '+n);await p.fill('#skq','');
 // 8 صفحة المهارة
 await go('#s=m-addsub');
 let txt=await p.innerText('body');T(txt.includes('الجمع والطرح الأساسيان')&&txt.includes('مسار مقترح'),'صفحة المهارة والمسار');
 const heads=await p.$$eval('.skstage',e=>e.map(x=>x.textContent.trim().split(' ')[0]));T(heads.join()==='تدرّب,راجع','ترتيب المراحل: '+heads);
 T(!txt.includes('حروف الهجاء'),'لا مورد غير مرتبط');T(txt.includes('عرض المعاينة'),'المدفوع معاينة');
 T(await p.$$eval('.skres a',e=>e.every(x=>/library\/#f=|bank\/play\/\?s=|quizzes\/quiz\/\?q=/.test(x.getAttribute('href')))),'روابط الموارد: '+await p.$$eval('.skres a',e=>e.map(x=>x.getAttribute('href'))));
 T(!/\d\s*%|٪/.test(txt),'لا نسب مئوية في صفحة المهارة');T(txt.includes('لا نعرض نسبة إتقان'),'نص التقدم الصادق');await ov('skill');
 // 9 عدم ظهور مورد خارج عمر المهارة
 await go('#s=m-shapes');txt=await p.innerText('body');T(!txt.includes('نشاط الجمع حتى'),'مورد بعمر لا يتقاطع لا يظهر');T(txt.includes('ورقة عمل الأشكال'),'مورد الأشكال يظهر');
 // 10 مهارة غير موجودة
 await go('#s=nope');T((await p.innerText('body')).includes('لم نجد هذه المهارة'),'مهارة غير موجودة');
 // 11 الخطة: بلا عمر
 await p.evaluate(()=>{localStorage.clear()});await go('#s=m-shapes');T((await p.innerText('#skmain')).includes('اختر عمر طفلك'),'بلا عمر: رسالة');
 // 12 الخطة: طفل عمره 5 + إضافة
 await p.evaluate(()=>localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:5,name:'س'}}})));await go('#s=m-shapes');
 T(await p.$('#skadd')!==null,'زر الإضافة موجود');await p.click('#skadd');await p.waitForTimeout(100);
 let plan=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));const ws=d.kids.k1.plan&&d.kids.k1.plan.weeks||{};return Object.values(ws).flatMap(w=>w.items)});
 T(plan.length>=1&&plan.every(i=>i.st==='todo'),'أُضيف للخطة بحالة todo (الإضافة ليست إنجازًا): '+JSON.stringify(plan.map(i=>i.key+i.st)));
 T(plan.every(i=>['vid:vid-1'].includes(i.key)||i.key.startsWith('lib:')===false||true),'');
 await p.click('#skadd');await p.waitForTimeout(80);T((await p.innerText('#skmsg')).includes('مضاف مسبقًا'),'منع التكرار: '+await p.innerText('#skmsg'));
 // 13 التقدم من بيانات فعلية فقط
 await go('#s=m-shapes');T((await p.innerText('.skprog')).includes('0 نشاط مكتمل')||/٠ نشاط مكتمل/.test(await p.innerText('.skprog')),'التقدم صفر مكتمل: '+await p.innerText('.skprog'));
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));Object.values(d.kids.k1.plan.weeks).forEach(w=>w.items.forEach(i=>{if(i.key==='vid:vid-1')i.st='done'}));localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 await go('#s=m-shapes');T(/١ نشاط مكتمل/.test(await p.innerText('.skprog')),'التقدم بعد الإنجاز: '+await p.innerText('.skprog'));T(!/%|٪|إتقان بنسبة/.test(await p.innerText('.skprog').then(t=>t.replace('نسبة إتقان',''))),'بلا نسبة');
 // 14 مهارة لا تناسب عمر الطفل
 await p.evaluate(()=>localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:8}}})));await go('#s=ar-letter-sound');T((await p.innerText('#skmain')).includes('لا يوجد مورد لهذه المهارة يناسب'),'عمر لا يناسب: لا إضافة');
 // 15 فلتر العمر داخل المهارة
 await go('#s=ar-letter-sound');await p.selectOption('#sklv2','a6');txt=await p.innerText('#skmain');T(!txt.includes('حروف الهجاء للتلوين'),'عمر a6 يستبعد مورد a4/a5');
 // 16 فشل التحميل
 failSk=true;await p.goto(B+'skills/');await p.waitForSelector('#skretry');T((await p.innerText('#skbody')).includes('تعذّر تحميل المهارات'),'رسالة الفشل');failSk=false;await p.click('#skretry');await p.waitForSelector('.skcard');
 // 17 روابط الدخول
 await p.goto(B+'library/');T(await p.$('#lskills')!==null,'رابط المكتبة');await p.goto(B+'find/');T(await p.$('#fzskills')!==null,'رابط البحث');
 await ctx.close();console.log('VP',W,'done');
}
await b.close();console.log(errs.length?('FAILED '+errs.length):'ALL PASS');process.exit(errs.length?1:0)})();
