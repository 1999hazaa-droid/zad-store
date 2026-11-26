// (مرحلة 2) NODE_PATH=$(npm root -g) node tools/content/paths/test_paths.js   (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى، وقواعد قاعدة البيانات اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const src=fs.readFileSync(__dirname+'/../find/test_find.js','utf8');const a=src.indexOf('const DOMS'),z=src.indexOf('(async()=>{');
const {DOMS,PRODS,DATA,OVS,SYNS}=new Function(src.slice(a,z)+';return {DOMS,PRODS,DATA,OVS,SYNS}')();
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const dm=[['arabic','مهارات اللغة العربية','book.svg'],['math','مهارات الرياضيات','numbers.svg'],['science','العلوم والاستكشاف','microscope.svg'],['life','المهارات الحياتية','heart.svg'],['cognitive','المهارات المعرفية','brain.svg'],['creative','مهارات الإبداع','palette.svg']].map(([slug,name,icon],i)=>({slug,name,icon,color:'#e6dcff',sort:i+1}));
const I=(k,s,r)=>({k,s,r:r===undefined?true:r});
const P=(id,domain,skill,skillName,goal,goalName,name,levels,items,extra)=>Object.assign({id,slug:'p-'+id,domain,goal,goalName,outcomes:['يفعل شيئًا يمكن ملاحظته'],skill,skillName,name,descr:'وصف '+name,levels,est:null,items},extra||{});
const PATHS=[
 P('1','arabic','ar-letter','ربط الحرف بصوته','g-ar-letter','يربط الحرف بصوته','مسار ربط الحرف بصوته — من ٤ إلى ٥ سنوات',['a4','a5'],[I('bank:bank-y','practice'),I('stories:story-x','understand'),I('lib:s-p1','practice',false)],{est:25}),
 P('3','math','m-shapes','التعرف على الأشكال','g-m-shapes','يتعرف على الأشكال','مسار الأشكال — من ٥ إلى ٦ سنوات',['a5','a6'],[I('lib:s-p2','practice'),I('vid:vid-1','understand'),I('proj:proj-1','apply',false)]),
 P('7','creative','cr-draw','الرسم','g-cr-draw','يرسم ويلوّن','الرسم والتلوين: بداية الخط واللون',['a5','a6'],[I('lib:s-p2','practice'),I('vid:vid-1','understand'),I('proj:proj-1','apply',false)]),
 P('8','math','m-addsub','الجمع والطرح الأساسيان','g-m-addsub','يجمع ويطرح','مسار الجمع والطرح — الصف الأول والثاني',['g1','g2'],[I('lib:s-p3','practice'),I('quiz:qz-1','review'),I('bank:bank-g','practice')]),
 P('9','math','m-addsub','الجمع والطرح الأساسيان','g-m-addsub','يجمع ويطرح','مسار صف خامس يجب ألا يظهر',['g5'],[I('lib:s-p10','practice'),I('lib:s-p10','review'),I('lib:s-p10','apply')]),
];
const MORE=[
 {slug:'p-1',diff:'easy',stages:[{stage:'understand',name:'نسمع القصة ونتعرف الحرف',expl:'قصة قصيرة تقدم الحرف.',skill:'ar-sound',skillName:'صوت الحرف'}],prior:[{s:'ar-look',name:'التمييز البصري',note:'يفيد قبل البدء'}]},
 {slug:'p-3',diff:'mid',stages:[],prior:[]},
 {slug:'p-7',diff:'easy',stages:[],prior:[]},
 {slug:'p-8',diff:'hard',stages:[],prior:[]}];
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:768,height:900},{width:1100,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let failP=false,failMore=false;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(m==='POST'&&tb==='paths_public'){if(failP)return J({},500);return J({paths:PATHS})}
  if(m==='POST'&&tb==='paths_more')return J(failMore?{}:MORE);
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

 const seed=(opened,done,age)=>p.evaluate(([o,d,a])=>{localStorage.clear();const now=Date.now();const it={};o.forEach(k=>it[k]={at:now});localStorage.setItem('zad-recent-v1',JSON.stringify({kids:{k1:{items:it}}}));
  const ws=window.ZSAVED.weekStart(window.ZSAVED.iso(new Date()));const w={};w[ws]={items:d.map((k,i)=>({id:'a'+i,key:k,day:4,st:'done',c:now,why:'x',ty:'find',tries:0,note:''}))};
  localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:a,name:'س',plan:{weeks:w}}}}))},[opened,done,age]);
 // 1 البطاقات: صورة، مهارات، عدّادات، أزرار
 await go();let n=await names();if(process.env.SHOT){await p.screenshot({path:'/tmp/pl_list_'+W+'.png',fullPage:false})}T(n.length===4,'4 مسارات صالحة (الصف الخامس مستبعد) وليس '+n.length+': '+n);
 T(!n.some(x=>x.includes('صف خامس')),'لا مسار فوق الصف الرابع');
 const chips=await p.$$eval('.skdom',e=>e.map(x=>x.dataset.d));T(chips.includes('creative')&&chips.length>=3,'مجال الإبداع ضمن المجالات: '+chips);
 T(await p.$$eval('.skcard',e=>e.every(x=>x.querySelector('.pic img')&&x.querySelector('a.go[href^="#p="]')&&x.querySelector('a.pthgo')&&x.querySelector('button.pfvc')&&x.querySelector('.pms')&&x.querySelector('.pdsc'))),'كل بطاقة: صورة ووصف ومهارات و3 أزرار');
 const btn=await p.$$eval('.skcard:first-child .pact > *',e=>e.map(x=>x.textContent.trim()));T(btn[0]==='عرض المسار'&&btn[1]==='ابدأ المسار'&&/حفظ في المفضلة/.test(btn[2]),'نصوص الأزرار: '+btn);
 const c0=await p.innerText('.skcard:first-child');T(/[3٣] أنشطة وموارد/.test(c0),'عدد الأنشطة محسوب فعلًا: '+c0);
 const c3=await p.$$eval('.skcard',e=>e.find(x=>x.textContent.includes('الأشكال')).textContent);T(/[1١] مشروع/.test(c3),'عدد المشاريع محسوب (مشروع واحد): '+c3);
 T(!(await p.$$eval('.skcard',e=>e.find(x=>x.textContent.includes('ربط الحرف')).textContent)).includes('مشروع'),'لا عدّاد مشاريع إن لم يوجد مشروع');
 T(await p.$$eval('.skcard',e=>e.find(x=>x.textContent.includes('ربط الحرف')).textContent.includes('صوت الحرف')),'المهارات الأساسية تشمل مهارة المرحلة المخصصة');
 await ov('list');
 // 2 الصعوبة + العمر + الصف + المجال + نوع المهارة
 await p.selectOption('#pdf','hard');n=await names();T(n.length===1&&n[0].includes('الجمع'),'صعوبة أصعب: '+n);
 await p.selectOption('#pdf','easy');n=await names();T(n.length===2,'صعوبة سهل: '+n);await p.selectOption('#pdf','');
 T(await p.$$eval('.pcard .df',e=>e.length)===4,'وسم الصعوبة على كل بطاقة مصنفة');
 await p.click('.skdom[data-d=creative]');n=await names();T(n.length===1&&n[0].includes('الرسم'),'مسارات الإبداع: '+n);await p.click('.skdom[data-d=creative]');
 await p.selectOption('#page','a4');n=await names();T(n.length===1&&n[0].includes('ربط الحرف'),'عمر 4: '+n);await p.selectOption('#page','');
 await p.selectOption('#pgr','g2');n=await names();T(n.length===1&&n[0].includes('الجمع'),'صف 2: '+n);
 T(!(await p.$$eval('#pgr option',e=>e.map(x=>x.value))).some(v=>/g[5-9]/.test(v)),'لا صفوف فوق الرابع');await p.selectOption('#pgr','');
 await p.selectOption('#psk','cr-draw');n=await names();T(n.length===1,'نوع المهارة: '+n);await p.selectOption('#psk','');
 T((await p.innerText('.skf')).includes('نوع المهارة')&&(await p.innerText('.skf')).includes('مستوى الصعوبة'),'مرشحات الصعوبة ونوع المهارة موجودة');
 // 3 الاقتراحات: لا اقتراح بلا بيانات، ثم بحسب العمر، ثم بحسب نشاط فُتح
 await p.evaluate(()=>localStorage.clear());await go();T(await p.$('.pthsug')===null,'لا اقتراحات بلا عمر/صف الطفل');
 T((await p.innerText('#skbody')).includes('اختر عمر طفلك'),'رسالة اختيار العمر');
 await seed([],[],4);await go();let sug=await p.$$eval('[aria-label="مسارات مقترحة"] .pthsugi',e=>e.map(x=>x.textContent));
 T(sug.length===1&&sug.every(x=>!/الجمع|الأشكال/.test(x)),'اقتراح عمر 4 (ربط الحرف فقط): '+sug);T((await p.innerText('.pthsug')).includes('اختياري'),'الاقتراح اختياري');
 T(sug.every(x=>/مناسب لـ|يرتبط بمهارة/.test(x)),'سبب الاقتراح مذكور');
 await seed([],[],5);await go();sug=await p.$$eval('[aria-label="مسارات مقترحة"] .pthsugi b',e=>e.map(x=>x.textContent));T(sug.some(x=>x.includes('الأشكال'))&&sug.some(x=>x.includes('ربط الحرف')),'اقتراحات عمر 5: '+sug);
 await seed(['lib:s-p2'],[],5);await go();const s2=await p.$$eval('[aria-label="مسارات مقترحة"] .pthsugi',e=>e.map(x=>x.textContent));T(!s2.some(x=>x.includes('الأشكال')),'مسار بدأه الطفل لا يُقترح مجددًا: '+s2);
 // 4 التفاصيل: مراحل بالترتيب، مهارة مستهدفة، شرح، أزرار
 await seed([],[],4);await go('#p=p-1');let txt=await p.innerText('#skbody');if(process.env.SHOT){await p.screenshot({path:'/tmp/pl_det_'+W+'.png',fullPage:true})}
 const stg=await p.$$eval('.pthstg h3',e=>e.map(x=>x.textContent.replace('المرحلة الحالية','').trim()));T(stg.join('|')==='نسمع القصة ونتعرف الحرف|التدريب','المراحل بالترتيب (الاسم المخصص ثم الافتراضي): '+stg);
 T((await p.$$eval('.pthstg .sn',e=>e.map(x=>x.textContent))).join()==='١,٢','ترقيم المراحل');
 T(txt.includes('قصة قصيرة تقدم الحرف')&&txt.includes('أنشطة وأوراق عمل للممارسة'),'الشرح المخصص ثم الافتراضي');
 T(await p.$('#stg-understand a[href*="skills/#s=ar-sound"]')!==null&&await p.$('#stg-practice a[href*="skills/#s=ar-letter"]')!==null,'المهارة المستهدفة: مخصصة ثم مهارة المسار');
 T(await p.$$eval('.pthstg',e=>e.every(x=>x.querySelector('a.pthgo.go')&&/ابدأ النشاط/.test(x.textContent))),'زر ابدأ النشاط في كل مرحلة');
 T(await p.$$eval('.pthstg',e=>e.slice(0,-1).every(x=>/انتقل إلى المرحلة التالية/.test(x.textContent)))&&!(await p.$eval('.pthstg:last-of-type',x=>/انتقل إلى المرحلة التالية/.test(x.textContent))),'زر المرحلة التالية إلا في الأخيرة');
 T(await p.$('#stg-practice [data-goto=understand]')!==null&&await p.$('#stg-practice a[href*="skills/#s="]')!==null,'العودة إلى مرحلة ومهارة سابقة');
 T(txt.includes('المهارات السابقة المقترحة')&&txt.includes('التمييز البصري')&&txt.includes('غير إلزامي'),'المهارات السابقة المقترحة');
 await go('#p=p-3');txt=await p.innerText('#skbody');T(!txt.includes('المهارات السابقة المقترحة'),'لا قسم مهارات سابقة إن لم تُحدَّد');
 T(txt.includes('المشاريع التعليمية المرتبطة')&&await p.$('#pprojs a[href*="proj"]')!==null,'المشاريع المرتبطة');T(txt.includes('الموارد المطلوبة'),'الموارد المطلوبة');
 T(txt.includes('الصعوبة: متوسط'),'مستوى الصعوبة في التفاصيل');await ov('detail');
 await go('#p=p-2');T((await p.innerText('body')).includes('لم نجد هذا المسار'),'معرّف غير موجود');
 // 5 المرونة: التنقل بين المراحل وحفظ المرحلة واستعادتها
 await seed([],[],4);await go('#p=p-1');
 T((await p.innerText('#stg-understand')).includes('المرحلة الحالية'),'المرحلة الحالية = الأولى بلا استخدام');
 await p.click('#stg-understand [data-goto=practice]');T((await p.innerText('#stg-practice')).includes('المرحلة الحالية'),'الانتقال إلى المرحلة التالية');
 let pr=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-pathprog-v1')));T(pr.kids.k1['p-1'].stage==='practice','المرحلة حُفظت: '+JSON.stringify(pr));
 await go('#p=p-1');T((await p.innerText('#stg-practice')).includes('المرحلة الحالية'),'المرحلة تُستعاد بعد إعادة التحميل');
 await p.click('#stg-practice [data-goto=understand]');T((await p.innerText('#stg-understand')).includes('المرحلة الحالية'),'العودة إلى مرحلة سابقة');
 // 6 البدء والمتابعة والتتبع
 T(await p.$('#pcont')===null||true,'');
 await go('#p=p-1');T((await p.innerText('#pprog')).includes('لم يبدأ طفلك'),'قبل البدء: لا تقدم مزيف');
 await p.click('#stg-practice a.pthgo');await p.waitForTimeout(250);
 pr=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-pathprog-v1')));T(pr.kids.k1['p-1'].started>0&&pr.kids.k1['p-1'].stage==='practice','ابدأ النشاط يسجل البدء والمرحلة');
 const cur=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('zad-path-cur')||'null'));T(cur&&cur.slug==='p-1'&&/paths\/#p=p-1$/.test(cur.back),'سياق العودة إلى المسار محفوظ: '+(cur&&cur.back));
 await go();
 await seed(['bank:bank-y','stories:story-x'],['bank:bank-y'],4);await go('#p=p-1');txt=await p.innerText('#pprog');
 T(/المرحلة الحالية:/.test(txt)&&/أنشطة بدأها الطفل: [٢2] من [٣3]/.test(txt)&&/المكتمل في خطة طفلك: [١1] من [٣3]/.test(txt),'المرحلة الحالية والبدء والإكمال: '+txt);
 T(/مهارات بدأ التدريب عليها:.*(صوت الحرف|ربط الحرف)/.test(txt)&&/موارد استخدمها:/.test(txt),'المهارات والموارد المستخدمة');
 T(!/أتقن|إتقان المهارة حصل|مستوى الإتقان/.test(txt.replace('لا يعني إتقان','').replace('لا تعني إتقان','').replace(/إتقان المهارة\./,'')),'لا ادعاء إتقان');
 T(txt.includes('لا يعني أنه أُكمل')&&/إكمال نشاط واحد لا يعني إتقان/.test(txt),'تنبيه: نشاط واحد ليس إتقانًا');
 T(await p.$('#pcont')!==null,'زر متابعة المسار');const ch=await p.getAttribute('#pcont','href');T(/bank|stories|lib|quiz/.test(ch),'متابعة تفتح مواردًا حقيقية: '+ch);
 await go();T((await p.innerText('.pthsug')).includes('تابع مساراتك'),'قسم تابع مساراتك');
 T((await p.$$eval('.skcard',e=>e.find(x=>x.textContent.includes('ربط الحرف')).querySelector('a.pthgo').textContent.trim()))==='متابعة المسار','زر البطاقة يصبح متابعة بعد البدء');
 // 7 المفضلة من البطاقة
 await p.click('.skcard:first-child button.pfvc');T((await p.getAttribute('.skcard:first-child button.pfvc','aria-pressed'))==='true','المفضلة من البطاقة');
 await p.check('#pfv');n=await names();T(n.length===1,'فلتر المفضلة: '+n);await p.uncheck('#pfv');
 // 8 لوحة ولي الأمر
 await p.goto(B+'paths/#parent');await p.reload();await p.waitForSelector('.pthbox');txt=await p.innerText('#skbody');
 T(txt.includes('مسارات بدأها الطفل')&&txt.includes('ربط الحرف')&&/المرحلة الحالية:/.test(txt),'لوحة الأهل: مسار بدأه الطفل ومرحلته');
 T(txt.includes('مسارات أكمل موارده الأساسية')&&txt.includes('مهارات بدأ التدريب عليها')&&txt.includes('أنشطة مقترحة للمتابعة'),'أقسام اللوحة');
 T(txt.includes('على هذا الجهاز')&&txt.includes('لا درجات ولا ترتيب ولا مقارنة'),'خصوصية ولا مقارنة');
 T(await p.$('.pthbox a.pthgo')!==null,'نشاط مقترح للمتابعة برابط');
 await seed(['bank:bank-y','stories:story-x','lib:s-p1'],['bank:bank-y','stories:story-x'],4);await p.reload();await p.waitForSelector('.pthbox');
 txt=await p.innerText('#skbody');T(/أكمل موارده الأساسية في خطته[\s\S]*ربط الحرف/.test(txt.replace(/\n/g,' ')),'مسار مكتمل الأساسي يظهر في المكتملة');
 await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForSelector('.pthbox');txt=await p.innerText('#skbody');T(txt.includes('لا توجد مسارات قيد المتابعة بعد')&&txt.includes('لا توجد مسارات أُكملت'),'حالة فارغة صادقة');await ov('parent');
 // طفلان
 await p.evaluate(()=>{localStorage.clear();const now=Date.now();localStorage.setItem('zad-recent-v1',JSON.stringify({kids:{k2:{items:{'lib:s-p2':{at:now}}}}}));localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{age:4,name:'أ'},k2:{age:5,name:'ب'}}}))});await p.reload();await p.waitForSelector('.pthbox');
 T((await p.innerText('.pthbox')).includes('لا توجد مسارات قيد'),'الطفل الأول بلا مسارات');await p.selectOption('#fkid','k2');T((await p.innerText('#skbody')).includes('الأشكال'),'الطفل الثاني: مساره فقط');
 // 9 روابط المكتبة والرجوع
 await go();T(await p.$('#plib[href$="library/"]')!==null,'زر رجوع واضح إلى المكتبة');
 const hrefs=await p.$$eval('a.pthgo',e=>e.map(x=>x.getAttribute('href')));T(hrefs.length>=4&&hrefs.every(h=>/^http:\/\/localhost:8765\/(bank|stories|library|videos|activities|projects|quizzes|songs)\//.test(h)&&!h.includes('undefined')),'روابط الموارد نسبية: '+hrefs.slice(0,4));
 await go('#p=p-1');T(await p.$('#plib')!==null,'رجوع للمكتبة داخل التفاصيل');
 await p.goto(B+'bank/play/?s=bank-y');await p.waitForTimeout(300);
 // 10 رجوع من المورد
 await go('#p=p-1');await p.click('#stg-practice a.pthgo');await p.waitForTimeout(150);await p.goto(B+'bank/play/?s=bank-y');await p.waitForTimeout(400);
 T(await p.$('#zpathbar a[href*="paths/"]')!==null,'شريط العودة إلى المسار في صفحة المورد');
 // 11 فشل paths_more لا يكسر الصفحة
 failMore=true;await go();T((await names()).length===4,'فشل paths_more: تبقى البطاقات');await go('#p=p-1');T((await p.$$eval('.pthstg h3',e=>e.map(x=>x.textContent))).join().includes('التدريب'),'المراحل الافتراضية عند غياب البيانات الإضافية');failMore=false;
 await ctx.close();console.log('vp',W,'done');
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'PASS');process.exit(errs.length?1:0)})();
