// NODE_PATH=$(npm root -g) node tools/content/support/test_support.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['cognitive','المهارات المعرفية','brain.svg'],['motor','المهارات الحركية','hand.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const SK=[{id:'SA',slug:'ar-letter-sound',domain:'arabic',name:'ربط الحرف بصوته',descr:'نربط شكل الحرف بصوته.',levels:['a4','a5','a6','g1'],path:false},
 {id:'SB',slug:'m-addsub',domain:'math',name:'الجمع والطرح الأساسيان',descr:'نجمع ونطرح أعدادًا صغيرة.',levels:['g1','g2'],path:false},
 {id:'SC',slug:'c-visual',domain:'cognitive',name:'التمييز البصري',descr:'نميّز الأشكال.',levels:['a4','a5'],path:false},
 {id:'SE',slug:'m-shapes',domain:'math',name:'التعرف على الأشكال',descr:'نسمّي الأشكال.',levels:['a5','a6','g5'],path:false}];
const L=(k,s,g,r,o)=>({k,s,g,r:r||'main',o:o||1});
const LINKS=[L('stories:story-x','SA','recognize'),L('bank:bank-y','SA','practice'),L('lib:s-p1','SA','practice','sub',2),L('acts:act-1','SA','review','sub',3),
 L('bank:bank-g','SB','practice'),L('quiz:qz-1','SB','review'),L('lib:s-p3','SB','practice','sub',2),
 L('bank:ghost','SC','practice'),
 L('lib:s-p2','SE','practice'),L('lib:s-p10','SE','practice','sub',2)];
const SUPD={groups:[{slug:'arabic',name:'دعم اللغة العربية',descr:'أنشطة للحروف.',icon:'book.svg',color:'#ffe3ec'},{slug:'math',name:'دعم الرياضيات',descr:'أنشطة للعد.',icon:'numbers.svg',color:'#dff3ff'},{slug:'visual',name:'دعم المهارات البصرية',descr:'أنشطة بصرية.',icon:'palette.svg',color:'#e6f7d9'},{slug:'motor',name:'دعم المهارات الحركية الدقيقة',descr:'تتبع.',icon:'pencil.svg',color:'#e6dcff'}],
 gs:[{g:'arabic',s:'ar-letter-sound',o:1},{g:'math',s:'m-addsub',o:1},{g:'math',s:'m-shapes',o:2},{g:'visual',s:'c-visual',o:1},{g:'visual',s:'m-shapes',o:2}],
 diff:{'bank:bank-y':'easy','bank:bank-g':'mid','quiz:qz-1':'adv','acts:act-1':'mid'}};
const GOALS=[{skill:'ar-letter-sound',outcomes:['ينطق صوت الحرف الذي يراه']}];
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let fail=false;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='support_public'){if(fail)return J({},500);return J(SUPD)}
  if(m==='POST'&&tb==='skills_public')return J({domains:dm,skills:SK,links:LINKS});
  if(m==='POST'&&tb==='goals_public')return J({goals:GOALS,links:[]});
  if(m==='POST'&&tb==='paths_public')return J({paths:[]});
  if(m==='POST')return r.fulfill({status:201,headers:CORS,body:''});
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);
  if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(h)=>{await p.goto(B+'support/'+(h||''));await p.reload();await p.waitForSelector('#skbody .supg, #skbody .fzempty, #skbody .supback');await p.waitForTimeout(120)};
 const T=(c,m)=>{if(!c)E(W+' FAIL '+m)};
 const BAD=/ضعيف|متأخر|متفوق|تشخيص|اضطراب|موهوب|خصم|مؤقت|نقاط/;
 // 1 القائمة
 await go();if(process.env.SHOT)await p.screenshot({path:'/tmp/sup_list_'+W+'.png',fullPage:true});let t=await p.innerText('body');
 T(await p.$$eval('.supg',e=>e.length)===4,'أربع مجموعات');T(await p.$('a.supback[href*="library"]')!==null,'زر العودة إلى المكتبة');
 T(!BAD.test(t.replace(/نقاط الحرف/g,'')),'لا ألفاظ تصنيف أو ضغط: '+(t.match(BAD)||[]));T(!/\d\s*%|٪/.test(t),'لا نسب');
 const lo=await p.$$eval('#suplv option',e=>e.map(x=>x.value));T(!lo.some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع: '+lo);await ov('list');
 T(/٢ مهارة فيها أنشطة|2 مهارة/.test(await p.innerText('.supg[href="#g=math"]')),'عدّاد الرياضيات (المهارة المخفية لا تُحتسب)');
 T(/٠ مهارة|0 مهارة/.test(await p.innerText('.supg[href="#g=motor"]')),'المجموعة الفارغة تُظهر صفرًا');
 T((await p.innerText('#suplog')).includes('لا يوجد شيء هنا بعد'),'سجل فارغ صادق');
 // 2 المجموعة
 await go('#g=visual');let names=await p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));T(names.length===1&&names[0].includes('الأشكال'),'مجموعة البصري: المهارة بلا موارد لا تظهر: '+names);
 await go('#g=math');names=await p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));T(names.length===2,'رياضيات مهارتان: '+names);
 await p.selectOption('#suplv','a5');names=await p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));T(names.length===1&&names[0].includes('الأشكال'),'عمر 5: '+names);await p.selectOption('#suplv','g1');names=await p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));T(names.length===1&&names[0].includes('الجمع'),'صف 1: '+names);
 await p.click('[data-sup=adv]');names=await p.$$eval('.skcard h3',e=>e.map(x=>x.textContent));T(names.length===1&&names[0].includes('الجمع'),'تحدٍ: '+names);
 await p.click('[data-sup=""]');await p.selectOption('#suplv','');
 await go('#g=nope');T((await p.innerText('body')).includes('لم نجد هذه المجموعة'),'مجموعة غير موجودة');
 // 3 المهارة
 await go('#g=arabic&s=ar-letter-sound');if(process.env.SHOT)await p.screenshot({path:'/tmp/sup_skill_'+W+'.png',fullPage:true});t=await p.innerText('#skbody');
 T(t.includes('ما الذي سنتدرب عليه')&&t.includes('نربط شكل الحرف'),'وصف مبسط');T(t.includes('ينطق صوت الحرف'),'مخرج الهدف يظهر');
 const heads=await p.$$eval('.skstage',e=>e.map(x=>x.textContent.trim().split(' ')[0]+' '+x.textContent.trim().split(' ')[1]));T(heads[0].startsWith('نبدأ')&&heads[1].startsWith('أنشطة')&&heads[heads.length-1].includes('للممارسة')||heads.some(h=>h.startsWith('مراجعة')),'ترتيب المراحل: '+heads);
 T(await p.$$eval('.supres a',e=>e.every(x=>/stories\/read|bank\/play|library\/#f=|activities\/view/.test(x.getAttribute('href')))),'روابط الأنشطة صحيحة');
 T(t.includes('دعم بسيط')&&t.includes('دعم تدريبي')&&t.includes('تحدٍ إضافي'),'المستويات الثلاثة');T(t.includes('وليست وصفًا للطفل'),'تنبيه عدم التصنيف');
 T(!BAD.test(t),'لا ألفاظ تصنيف في المهارة: '+(t.match(BAD)||[]));await ov('skill');
 const allT=await p.$$eval('.supres b',e=>e.map(x=>x.textContent));T(allT.length>=4,'كل الأنشطة: '+allT);
 // مستوى
 await p.click('[data-sup=easy]');let rt=await p.$$eval('.supres b',e=>e.map(x=>x.textContent));T(rt.length===1&&rt[0].includes('نصل'),'دعم بسيط: '+rt);T((await p.innerText('#skbody')).includes('لم يُحدَّد مستواه'),'ملاحظة الأنشطة بلا مستوى');
 await p.click('[data-sup=adv]');T((await p.innerText('#skbody')).includes('لا أنشطة بهذه الاختيارات'),'تحدٍ بلا أنشطة: رسالة لطيفة');await p.click('[data-sup=""]');
 // عمر
 await p.selectOption('#suplv2','g1');rt=await p.$$eval('.supres b',e=>e.map(x=>x.textContent));T(!rt.some(x=>x.includes('أصنّف')),'نشاط عمره لا يناسب الصف الأول لا يظهر: '+rt);await p.selectOption('#suplv2','');
 // العودة لاحقًا واختيار المهارة
 await p.click('.supbk');T((await p.getAttribute('.supbk','aria-pressed'))==='true','حفظ للعودة');
 await p.click('#supchoose');T((await p.getAttribute('#supchoose','aria-pressed'))==='true','اختيار المهارة');
 const st=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-support-v1')));const kk=Object.values(st.kids)[0];T(kk.skills.includes('ar-letter-sound')&&kk.back.length===1,'التخزين: '+JSON.stringify(st));
 await go();t=await p.innerText('#suplog');T(t.includes('ربط الحرف بصوته')&&t.includes('أريد العودة'),'السجل يعرض الاختيارات: '+t);T(!/محاولات: |عدد المحاولات: [٠-٩0-9]/.test(t),'لا عدد محاولات مختلق');
 // سجل الفتح والإكمال (حقيقي من الجهاز)
 await p.evaluate(()=>{localStorage.setItem('zad-recent-v1',JSON.stringify({kids:{k1:{items:{'bank:bank-y':{at:Date.now()}}}}}));});await go();t=await p.innerText('#suplog');T(t.includes('أنشطة فتحتها مؤخرًا')&&t.includes('نصل الحرف'),'الفتح الأخير');T(t.includes('لا يعني إتقان'),'تنبيه عدم الإتقان');
 // 4 الخطة
 await p.evaluate(()=>{localStorage.clear();localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:4,name:'س'}}}))});await go('#g=arabic&s=ar-letter-sound');
 T(await p.$('#supadd')!==null,'زر الخطة');await p.click('#supadd');await p.waitForTimeout(150);const pm=await p.innerText('#supmsg');T(pm.includes('تمت إضافة')&&pm.includes('ليست إنجازًا'),'رسالة الإضافة: '+pm);
 const plan=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return Object.values(d.kids.k1.plan.weeks).flatMap(w=>w.items)});T(plan.length>=1&&plan.every(i=>i.st==='todo'),'أُضيف todo');
 await p.evaluate(()=>localStorage.clear());await go('#g=arabic&s=ar-letter-sound');T((await p.innerText('#skbody')).includes('اختر عمر طفلك'),'بلا عمر: رسالة');
 // 5 مهارة بمستوى فوق الرابع لا تعرض موردها
 await go('#g=math&s=m-shapes');rt=await p.$$eval('.supres b',e=>e.map(x=>x.textContent));T(!rt.some(x=>x.includes('صف خامس')||x.includes('s-p10')),'لا مورد للصف الخامس: '+rt);
 // 6 فشل
 fail=true;await p.goto(B+'support/');await p.reload();await p.waitForSelector('#supretry');T((await p.innerText('#skbody')).includes('تعذّر تحميل المركز'),'حالة الفشل');fail=false;await p.click('#supretry');await p.waitForSelector('.supg');T(await p.$$eval('.supg',e=>e.length)===4,'إعادة المحاولة');
 await ctx.close();console.log('vp',W,'done');
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'PASS');process.exit(errs.length?1:0)})();
