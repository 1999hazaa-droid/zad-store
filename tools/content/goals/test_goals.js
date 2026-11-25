// NODE_PATH=$(npm root -g) node tools/content/goals/test_goals.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد الأهداف اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg'],['motor','المهارات الحركية','hand.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const gl=(id,slug,domain,skill,skillName,name,levels,oc,verify,tip)=>({id,slug,domain,skill,skillName,name,descr:'وصف '+name,levels,outcomes:oc,verify:verify||'',tip:tip||''});
const GOALS=[gl('G1','g-ar-letter-sound','arabic','ar-letter-sound','ربط الحرف بصوته','يربط الحرف بصوته وبكلمة تبدأ به',['a4','a5','a6'],['ينطق صوت الحرف الذي يراه','يذكر كلمة تبدأ بالحرف المعروض'],'اعرض حرفًا واطلب صوته','انطق الصوت قبله'),
 gl('G2','g-m-addsub','math','m-addsub','الجمع والطرح الأساسيان','يطبق الجمع والطرح على أعداد مناسبة لصفه',['g1','g2'],['يجد ناتج جمع عددين صغيرين'],'اعرض مسألتين','استعن بأشياء ملموسة'),
 gl('G3','g-m-shapes','math','m-shapes','التعرف على الأشكال','يتعرف على الأشكال الهندسية ويسميها',['a5','a6'],['يسمّي الشكل الذي يراه'],'',''),
 gl('G4','g-s-classify','science','s-classify','التصنيف','يصنف الأشياء حسب خاصية واحدة',['a3','a4','a5','a6'],['يصنف أشياء إلى مجموعتين'],'',''),
 gl('G5','g-s-ask','science','s-ask','طرح الأسئلة','يطرح أسئلة عمّا يلاحظه',['g1'],['يطرح سؤالًا عن شيء رآه'],'',''),
 gl('G6','g-s-observe','science','s-observe','الملاحظة','يلاحظ الأشياء ويصف ما يراه',['a4'],['يصف شيئًا بثلاث صفات'],'','')];
const LK=(g,k,s,r,o)=>({g,k,s,r:r||'main',o:o||1});
const LINKS=[LK('G1','bank:bank-y','practice'),LK('G1','lib:s-p1','recognize','sub',1),LK('G2','bank:bank-g','practice'),LK('G2','quiz:qz-1','review','sub'),LK('G2','lib:s-p3','practice','sub',2),LK('G3','lib:s-p2','practice'),LK('G3','vid:vid-1','recognize','sub'),LK('G3','bank:bank-g','practice','sub',9),LK('G4','acts:act-1','practice'),LK('G6','lib:s-p9','practice')];
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let failG=false,itemRes=[];
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='goals_public'){if(failG)return J({},500);return J({goals:GOALS,links:LINKS})}
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:[],links:[]});
  if(m==='POST'&&tb==='goals_item')return J(itemRes);
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(h)=>{await p.goto(B+'goals/'+(h||''));await p.reload();await p.waitForSelector('#skbody .skcard, #skbody .fzempty, #skbody .skback');await p.waitForTimeout(120)};
 const names=()=>p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};
 // 1 القائمة: لا هدف بلا موارد مرئية
 await go();let n=await names();
 T(n.length===4,'4 أهداف فيها موارد، وليس '+n.length+': '+n);T(!n.some(x=>x.includes('يطرح أسئلة')),'هدف بلا موارد لا يظهر');T(!n.some(x=>x.includes('يلاحظ الأشياء')),'هدف مواده غير موجودة في الفهرس لا يظهر');
 const chips=await p.$$eval('.skdom',e=>e.map(x=>x.dataset.d));T(chips.join()==='arabic,math,science,life,cognitive','خمسة مجالات فقط بلا الحركي: '+chips);
 await ov('list');T(!/\d\s*%|٪/.test(await p.innerText('body')),'لا نسب مئوية');
 T(!/الصف (الخامس|السادس|السابع)/.test(await p.innerText('body')),'لا صفوف فوق الرابع');
 // 2 المجال
 await p.click('.skdom[data-d=math]');n=await names();T(n.length===2&&n.every(x=>/الجمع|الأشكال/.test(x)),'مجال الرياضيات: '+n);
 T((await p.$$eval('.skcard',e=>e.every(x=>x.textContent.includes('مهارات الرياضيات')))),'كل بطاقة تعرض مجالها');
 await p.click('.skdom[data-d=math]');
 // 3 العمر
 await p.selectOption('#gllv','g1');n=await names();T(n.length===1&&n[0].includes('الجمع'),'عمر g1: '+n);
 await p.selectOption('#gllv','a5');n=await names();T(n.length===2&&!n.some(x=>x.includes('الجمع'))&&!n.some(x=>x.includes('يصنف')),'عمر a5: '+n);await p.selectOption('#gllv','');
 // 4 المستوى والدفع والمهارة والبحث
 await p.selectOption('#glst','review');n=await names();T(n.length===1&&n[0].includes('الجمع'),'مستوى مراجعة: '+n);await p.selectOption('#glst','');
 await p.selectOption('#glpay','paid');n=await names();T(n.length===1&&n[0].includes('الجمع'),'مدفوع: '+n);await p.selectOption('#glpay','');
 await p.selectOption('#glsk','m-shapes');n=await names();T(n.length===1&&n[0].includes('الأشكال'),'مهارة: '+n);await p.selectOption('#glsk','');
 await p.fill('#glq','تصنيف');n=await names();T(n.length===1&&n[0].includes('يصنف'),'بحث بالمهارة: '+n);
 await p.fill('#glq','ينطق صوت');n=await names();T(n.length===1&&n[0].includes('يربط الحرف'),'بحث بالمخرج: '+n);await p.fill('#glq','');
 // 5 صفحة الهدف
 await go('#g=g-m-addsub');let txt=await p.innerText('#skmain');
 T(txt.includes('يطبق الجمع والطرح')&&txt.includes('ما الذي يُتوقع أن يستطيعه الطفل؟')&&txt.includes('يجد ناتج جمع عددين صغيرين'),'الهدف والمخرجات');
 T(txt.includes('كيف تلاحظ ذلك؟')&&txt.includes('ملاحظة منك وليست اختبارًا آليًا'),'طريقة التحقق صادقة');T(txt.includes('إرشاد لولي الأمر')&&txt.includes('استعن بأشياء ملموسة'),'إرشاد ولي الأمر');
 T(txt.includes('لا يعني أن الطفل أتقن الهدف'),'تنبيه عدم الإتقان');T(txt.includes('الجمع والطرح الأساسيان'),'المهارة المرتبطة');
 const heads=await p.$$eval('.skstage',e=>e.map(x=>x.textContent.trim().split(' ')[0]));T(heads.join()==='تدرّب,راجع','ترتيب المراحل: '+heads);
 T(!txt.includes('حروف الهجاء'),'لا مورد غير مرتبط');T(txt.includes('عرض المعاينة'),'المدفوع معاينة');
 T(await p.$$eval('.skres a',e=>e.every(x=>/library\/#f=|bank\/play\/\?s=|quizzes\/quiz\/\?q=/.test(x.getAttribute('href')))),'روابط الموارد');
 T(!/\d\s*%|٪/.test(txt.replace('نسبة إتقان','')),'لا نسب مئوية في صفحة الهدف');await ov('goal');
 // 6 عدم ظهور مورد خارج عمر الهدف
 await go('#g=g-m-shapes');txt=await p.innerText('#skmain');T(!txt.includes('نشاط الجمع حتى'),'مورد بعمر لا يتقاطع لا يظهر');T(txt.includes('ورقة عمل الأشكال'),'مورد الأشكال يظهر');
 T(!txt.includes('كيف تلاحظ ذلك؟'),'لا قسم تحقق إن لم تُكتب طريقة');
 // 7 هدف غير موجود/غير منشور
 await go('#g=g-s-ask');T((await p.innerText('body')).includes('لم نجد هذا الهدف')||(await p.innerText('body')).includes('لا توجد موارد'),'هدف بلا موارد');
 await go('#g=nope');T((await p.innerText('body')).includes('لم نجد هذا الهدف'),'هدف غير موجود');
 // 8 الخطة
 await p.evaluate(()=>{localStorage.clear()});await go('#g=g-m-shapes');T((await p.innerText('#skmain')).includes('اختر عمر طفلك'),'بلا عمر: رسالة');
 await p.evaluate(()=>localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:5,name:'س'}}})));await go('#g=g-m-shapes');
 T(await p.$('#gladd')!==null,'زر الإضافة موجود');T((await p.innerText('#glplan')).includes('لا يعني أن الطفل أتقن الهدف'),'تنبيه في صندوق الخطة');
 await p.click('#gladd');await p.waitForTimeout(100);
 let plan=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));const ws=d.kids.k1.plan&&d.kids.k1.plan.weeks||{};return Object.values(ws).flatMap(w=>w.items)});
 T(plan.length>=1&&plan.every(i=>i.st==='todo'),'أُضيف للخطة بحالة todo: '+JSON.stringify(plan.map(i=>i.key+i.st)));
 T((await p.innerText('#glmsg')).includes('ليست إنجازًا'),'رسالة الإضافة: '+await p.innerText('#glmsg'));
 await p.click('#gladd');await p.waitForTimeout(80);T((await p.innerText('#glmsg')).includes('مضاف مسبقًا'),'منع التكرار');
 // 9 لا نتيجة إتقان من الإكمال
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));Object.values(d.kids.k1.plan.weeks).forEach(w=>w.items.forEach(i=>i.st='done'));localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 await go('#g=g-m-shapes');txt=await p.innerText('#skmain');T(!/أتقن الطفل|إتقان بنسبة|مستوى الإتقان|\d\s*%/.test(txt.replace('لا يعني أن الطفل أتقن الهدف','').replace('نسبة إتقان','').replace('بلا إتقان','')),'لا مخرجات إتقان بعد الإكمال');
 // 10 طفل بعمر لا يناسب
 await p.evaluate(()=>localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:8}}})));await go('#g=g-ar-letter-sound');T((await p.innerText('#skmain')).includes('لا يوجد مورد لهذا الهدف يناسب'),'عمر لا يناسب: لا إضافة');
 // 11 فشل التحميل
 failG=true;await p.goto(B+'goals/');await p.waitForSelector('#glretry');T((await p.innerText('#skbody')).includes('تعذّر تحميل الأهداف'),'رسالة الفشل');failG=false;await p.click('#glretry');await p.waitForSelector('.skcard');
 // 12 صندوق «ماذا سيتعلم الطفل؟» في صفحة مورد
 itemRes=[{name:'يربط الحرف بصوته وبكلمة تبدأ به',skill:'ربط الحرف بصوته',domain:'مهارات اللغة العربية',outcomes:['ينطق صوت الحرف الذي يراه','يذكر كلمة تبدأ بالحرف المعروض','مخرج ثالث للتجربة','مخرج رابع لا يظهر'],tip:'انطق الصوت قبله',role:'main',levels:['a4']},{name:'يميز بين الحروف المتشابهة في الشكل',skill:'التمييز',domain:'مهارات اللغة العربية',outcomes:['x'],tip:'',role:'sub',levels:['a5']}];
 await p.goto(B+'bank/play/?s=bank-y');await p.waitForSelector('#zgoalbox',{timeout:5000}).catch(()=>E(W+' FAIL صندوق الأهداف لم يظهر'));
 if(await p.$('#zgoalbox')){const t=await p.innerText('#zgoalbox');T(t.includes('ماذا سيتعلم الطفل؟')&&t.includes('يربط الحرف بصوته')&&t.includes('المهارة: ربط الحرف بصوته')&&t.includes('ينطق صوت الحرف')&&t.includes('إرشاد لولي الأمر'),'محتوى الصندوق');T(!t.includes('مخرج رابع'),'ثلاثة مخرجات كحد أقصى');T(t.includes('يدعم أيضًا')&&t.includes('يميز بين الحروف'),'الأهداف الداعمة');T(t.includes('لا يعني أن الطفل أتقن الهدف'),'تنبيه الإتقان');await ov('zgoalbox')}
 itemRes=[];await p.goto(B+'bank/play/?s=bank-y');await p.waitForTimeout(900);T(await p.$('#zgoalbox')===null,'لا صندوق إن لم يرتبط هدف منشور');
 // 13 روابط الدخول
 await p.goto(B+'library/');T(await p.$('#lgoals')!==null,'رابط المكتبة');await p.goto(B+'find/');T(await p.$('#fzgoals')!==null,'رابط البحث');
 await ctx.close();console.log('VP',W,'done');
}
await b.close();console.log(errs.length?('FAILED '+errs.length):'ALL PASS');process.exit(errs.length?1:0)})();
