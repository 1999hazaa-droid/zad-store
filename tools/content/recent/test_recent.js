// NODE_PATH=$(npm root -g) node tools/content/saved/test_recent.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
const {chromium}=require('playwright');const fs=require('fs'),path=require('path');const MIME={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.woff':'font/woff','.woff2':'font/woff2','.jpg':'image/jpeg','.ico':'image/x-icon'};const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const DOMS=[["arabic","اللغة العربية",{src:["stories:arabic"],words:["حرف","حروف","كلمة","كلمات","قراءة"]}],["math","الرياضيات",{src:[],words:["رياض","عد","أعداد","رقم","جمع","طرح","أشكال"]}],["english","اللغة الإنجليزية",{src:[],words:["english","إنجليز"]}],["science","العلوم والمعرفة العامة",{src:["exp","stories:science"],words:["علوم","نبات","حيوان","فول"]}],["thinking","مهارات التفكير والتعلم المبكر",{src:["ready"],words:["تفكير","تصنيف","ألغاز"]}],["life","المهارات الحياتية",{src:["life"],words:["نظافة"]}],["values","القيم والسلوك الإيجابي",{src:["val"],words:["قيم"]}],["arts","الفنون والإبداع",{src:["songs"],words:["تلوين","ألوان","رسم"]}]].map(([slug,title,data],i)=>({slug,title,data,sort_order:i}));
const P=(id,name,o)=>({id,name,slug:'s-'+id,price:0,image_url:null,thumb_url:null,description:'',file_url:'files/'+id+'.pdf',lib_section:'ws',lib_levels:['a5'],lib_subject:'متنوع',lib_skill:null,pages:4,file_type:'PDF',created_at:'2026-11-01T00:00:00Z',is_available:true,lib_type:null,lib_unit:null,lib_keywords:null,...o});
const PRODS=[
 P('p1','حروف الهجاء للتلوين',{lib_section:'letters',lib_levels:['a4','a5'],description:'تلوين الحروف العربية بطريقة ممتعة',lib_skill:'التعرّف على الحروف',created_at:'2026-11-10T00:00:00Z'}),
 P('p2','ورقة عمل الأشكال',{lib_levels:['a5','a6'],lib_subject:'الرياضيات',lib_skill:'الأشكال الهندسية',created_at:'2026-11-12T00:00:00Z'}),
 P('p3','أوراق عمل الجمع والطرح',{lib_section:'math',lib_levels:['g1','g2'],price:1.5,file_url:'private:x',lib_skill:'الجمع والطرح',created_at:'2026-11-05T00:00:00Z'}),
 P('p4','قصص الحيوانات المصوّرة',{lib_section:'stories',lib_type:'story',lib_levels:['a3','a4'],created_at:'2026-11-14T00:00:00Z'}),
 P('p5','بطاقات الألوان',{lib_section:'cards',lib_levels:['a2','a3'],created_at:'2026-11-03T00:00:00Z'}),
 P('p6','العد من 1 إلى 10',{lib_section:'math',lib_levels:['a5','a6'],lib_keywords:'عدّ أرقام',created_at:'2026-11-08T00:00:00Z'}),
 P('p7','مفردات اللغة الإنجليزية',{lib_levels:['g1'],lib_subject:'اللغة الإنجليزية',lib_skill:'English words',created_at:'2026-10-20T00:00:00Z'}),
 P('p8','نشاط الألوان في البيت',{lib_section:'home',lib_type:'home_activity',lib_levels:['a3','a4'],created_at:'2026-11-02T00:00:00Z'}),
 P('p9','ملف مخفي من البحث',{lib_section:'extra',lib_levels:['a4']}),
 P('p10','ملف الصف الخامس',{lib_levels:['g5']}),
 P('p11','ملف بلا مستوى',{lib_levels:[]}),
];
const mk=(slug,title,levels,extra={})=>({slug,title,skill:null,subject:null,cat:'x',icon:'i_puzzle',levels,created_at:'2026-11-06T00:00:00Z',...extra});
const DATA={stories:[mk('story-x','قصة الحروف',['a4','a5','a6'],{topic:'arabic',summary:'قصة قصيرة عن حرف ضائع',cover_url:null})],
 bank_items:[mk('bank-y','نصل الحرف بصورته ١',['a4','a5','a6'],{cat:'arabic',subject:'اللغة العربية',skill:'ربط الحرف بالكلمة التي تبدأ به'}),mk('bank-g','نشاط الجمع حتى ١٠',['g1'],{cat:'math',subject:'الرياضيات',skill:'الجمع'})],
 qz_quizzes:[mk('qz-1','اختبار الجمع',['g1','g2'],{cat:'math',skill:'الجمع'})],video_items:[mk('vid-1','درس مرئي: الأشكال',['a5'],{cat:'math',skill:'الأشكال',poster_url:null})],
 proj_items:[mk('proj-1','نزرع حبة فول',['a5','a6'],{cat:'science',subject:'العلوم',skill:'ملاحظة نمو النبات'})],
 activities:[{slug:'act-1',title:'أصنّف ألعابي حسب اللون',skill:'التصنيف',subject:'الألوان',cat:'early',image_url:null,summary:'نجمع ألعاب الطفل في أكياس حسب اللون.',ages:[3,4],grades:[],created_at:'2026-11-07T00:00:00Z'}]};
const OVS=[{src:'lib',slug:'s-p9',hidden:true,keywords:'',skills:'',levels:null},{src:'bank',slug:'bank-g',hidden:false,keywords:'جدول الجمع',skills:'',levels:null,ctype:'quiz'}];
const SYNS=[{term:'تسلية',alts:['نشاط']}];



const LK='zad-learn-v3',RK='zad-recent-v1';
const CAT=JSON.parse(fs.readFileSync('games/catalog.json','utf8'));const GID=CAT.find(g=>g.id&&g.t).id;
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:1200,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();
 let posts=[],failProd=false,RCFG=[];
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'||m==='DELETE'||m==='PATCH'){posts.push([tb,r.request().postData()||'']);return r.fulfill({status:201,headers:CORS,body:''})}
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);if(tb==='saved_off')return J([]);if(tb==='recent_cfg')return J(RCFG);
  if(tb==='products'){if(failProd)return J({},500);return J(PRODS)}
  if(DATA[tb]){const sl=u.searchParams.get('slug');if(sl&&sl.startsWith('eq.')){const s=decodeURIComponent(sl.slice(3));return J(DATA[tb].filter(x=>x.slug===s))}return J(DATA[tb])}
  return J([])});
 await p.route(/localhost:8765\/zad-store\//,r=>{const f=path.join(process.cwd(),decodeURIComponent(new URL(r.request().url()).pathname.replace('/zad-store/','')));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const g=path.join(f,'index.html');if(fs.existsSync(g)&&fs.statSync(f).isDirectory())return r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:fs.readFileSync(g)});return r.fulfill({status:404,body:''})}r.fulfill({status:200,contentType:MIME[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)})});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const rc=()=>p.evaluate((RK)=>{const d=JSON.parse(localStorage.getItem(RK)||'null');return d},RK);
 const kidItems=async()=>{const d=await rc();if(!d)return[];const D=await p.evaluate((LK)=>{const x=JSON.parse(localStorage.getItem(LK)||'null');return x&&x.cur||'k1'},LK);return d.kids[D]?Object.keys(d.kids[D].items):[]};
 const open=async(u)=>{await p.goto(B+u);await p.waitForTimeout(700)};
 const goR=async()=>{await p.goto(B+'recent/');await p.waitForFunction(()=>!document.querySelector('#zrres .zr-sk'));await p.waitForTimeout(120)};
 const tt=()=>p.$$eval('#zrres .zr-c h3',e=>e.map(x=>x.textContent));
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(120)};
 const MSG='ابدأ باستكشاف المكتبة التعليمية، وستجد هنا المحتوى الذي استخدمته مؤخرًا';
 // 1) لا سجل: الرسالة المطلوبة في المكتبة وصفحة السجل
 await p.goto(B+'library/');await p.waitForSelector('[data-zrecent=lib] .zr-sec');if(!(await p.textContent('[data-zrecent=lib]')).includes(MSG))E(W+' رسالة الفراغ في المكتبة');
 if((await rc()))E(W+' زيارة المكتبة سجّلت شيئًا (لم يُفتح محتوى)');
 await goR();if(!(await p.textContent('#zrres')).includes(MSG))E(W+' رسالة الفراغ في الصفحة');if(!(await p.textContent('.zbc')).includes('تابع من حيث توقفت')||!(await p.$('.zbc a[href="../library/"]')))E(W+' مسار التنقل');await ov('empty');
 // 2) الفتح الفعلي يُسجَّل (كل الأنواع) بعد التحقق من النشر
 const OPENS=[['stories/read/?s=story-x','stories:story-x'],['videos/play/?s=vid-1','vid:vid-1'],['bank/play/?s=bank-y','bank:bank-y'],['projects/play/?s=proj-1','proj:proj-1'],['activities/view/?a=act-1','acts:act-1'],['quizzes/quiz/?q=qz-1','quiz:qz-1']];
 for(const [u,k] of OPENS){await open(u);await p.waitForTimeout(40)}
 let ks=await kidItems();for(const [,k] of OPENS)if(!ks.includes(k))E(W+' لم يُسجَّل '+k+' '+ks);
 // لعبة: فتح فعلي من الرابط
 await open('games/#g='+GID);ks=await kidItems();if(!ks.includes('games:'+GID))E(W+' لم تُسجَّل اللعبة '+GID);
 // ورقة عمل من المكتبة: معاينة
 await p.goto(B+'library/');await p.waitForSelector('.lc[data-id="p1"]');await ck('.lc[data-id="p1"] [data-a=pv]');await p.waitForTimeout(500);ks=await kidItems();if(!ks.includes('lib:s-p1'))E(W+' لم تُسجَّل معاينة ملف المكتبة '+ks);
 // غير منشور / غير موجود / بلا معامل: لا يُسجَّل، ويُسجَّل خطأ
 posts=[];await open('bank/play/?s=bank-draft');ks=await kidItems();if(ks.includes('bank:bank-draft'))E(W+' سُجّل محتوى غير منشور');
 if(!posts.some(x=>x[0]==='pf_errors'&&x[1].includes('recent-skip')&&x[1].includes('bank:bank-draft')))E(W+' لا خطأ لمحتوى غير منشور '+JSON.stringify(posts));
 await open('bank/play/');if((await kidItems()).some(k=>k==='bank:'||k==='bank:null'))E(W+' سُجّل بلا معرّف');
 // 3) الترتيب: الأحدث أولًا + حقول البطاقة
 await open('quizzes/quiz/?q=qz-1');await goR();let t=await tt();if(t[0]!=='اختبار الجمع')E(W+' الأحدث أولًا '+t.slice(0,3));
 const cards=await p.$$eval('#zrres .zr-c',cs=>cs.map(c=>({k:c.dataset.k,img:!!c.querySelector('img'),go:c.querySelector('.zr-go')&&c.querySelector('.zr-go').getAttribute('href'),rm:!!c.querySelector('[data-zr=rm]'),d:c.querySelector('.zr-d').textContent,mt:c.querySelector('.zr-mt').textContent})));
 for(const c of cards){if(!c.img||!c.go||!c.rm||!c.d.includes('اليوم')||!c.d.includes('آخر استخدام')||!c.mt)E(W+' بطاقة ناقصة '+JSON.stringify(c))}
 const sx=cards.find(c=>c.k==='stories:story-x');if(!sx.go.includes('stories/read/?s=story-x'))E(W+' رابط متابعة القصة '+sx.go);
 await ov('list');
 // 4) لا إنجاز من الفتح
 const kid=await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK)||'null');return D&&D.kids?D.kids[D.cur]:null},LK);
 const dn=kid?JSON.stringify([kid.acts,kid.stories,kid.bank&&kid.bank.done,kid.proj&&kid.proj.done,kid.vid&&kid.vid.done,kid.pf&&kid.pf.certs]):'';if(/\{"[^}]+/.test(dn.replace(/null|\[\]|\{\}/g,'')))E(W+' الفتح سجّل إنجازًا '+dn);
 // الخصوصية: المخزن مفاتيح وتواريخ فقط
 const raw=JSON.stringify(await rc());if(/title|name|email|t":"/.test(raw))E(W+' بيانات زائدة في السجل '+raw.slice(0,200));
 // 5) الحالة والموضع من سجلات الطفل الموجودة فقط
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK)||'null')||{cur:'k1',kids:{k1:{}}};const k=D.kids[D.cur];k.vid={pos:{'vid-1':2},done:{}};k.bank={done:{'bank-y':{d:1}},started:{}};k.proj={steps:{'proj-1':1},started:{'proj-1':1},done:{}};localStorage.setItem(LK,JSON.stringify(D))},LK);
 await goR();const gt=async(k)=>p.$eval('.zr-c[data-k="'+k+'"]',c=>({s:c.querySelector('.zr-s').textContent,go:c.querySelector('.zr-go').textContent.trim(),rs:c.querySelector('.zr-rs')?c.querySelector('.zr-rs').textContent:''}));
 let g1=await gt('vid:vid-1');if(g1.s!=='بدأت النشاط'||g1.go!=='متابعة'||!g1.rs.includes('٣'))E(W+' فيديو بموضع محفوظ '+JSON.stringify(g1));
 g1=await gt('bank:bank-y');if(g1.s!=='أكملت النشاط'||g1.go!=='إعادة فتح')E(W+' نشاط مكتمل '+JSON.stringify(g1));
 g1=await gt('stories:story-x');if(g1.s!=='فتحت المحتوى'||g1.go!=='إعادة فتح'||g1.rs)E(W+' قصة بلا موضع محفوظ تعرض متابعة مضللة '+JSON.stringify(g1));
 g1=await gt('proj:proj-1');if(g1.go!=='متابعة'||!g1.rs.includes('٢'))E(W+' مشروع بخطوة محفوظة '+JSON.stringify(g1));
 // 6) الفلاتر معًا
 await ck('#zrftog');await ck('#zrf [data-f=status][data-v=done]');t=await tt();if(t.length!==1||t[0]!=='نصل الحرف بصورته ١')E(W+' فلتر المكتملة '+t);
 await ck('#zrf [data-f=status][data-v=notdone]');t=await tt();if(t.includes('نصل الحرف بصورته ١')||t.length<5)E(W+' فلتر لم تكتمل '+t);
 const cts=await p.$$eval('#zrf [data-f=ct]',e=>e.map(x=>x.dataset.v));if(cts.length<3)E(W+' فلاتر النوع '+cts);
 await ck('#zrf [data-f=ct][data-v=video]');t=await tt();if(t.length!==1)E(W+' نوع+حالة '+t);await ck('#zract [data-f=clear]');if((await tt()).length<8)E(W+' مسح الفلاتر');
 // 7) إزالة عنصر، ويتحدث في كل الأقسام
 const n0=(await tt()).length;await ck('.zr-c[data-k="quiz:qz-1"] [data-zr=rm]');if((await tt()).length!==n0-1||(await kidItems()).includes('quiz:qz-1'))E(W+' إزالة عنصر');
 await p.goto(B+'library/');await p.waitForSelector('[data-zrecent=lib] .zr-c');const lc=await p.$$eval('[data-zrecent=lib] .zr-c',c=>c.length);if(lc>4)E(W+' أكثر من 4 في المكتبة '+lc);if(!(await p.$('[data-zrecent=lib] a[href$="recent/"]')))E(W+' رابط عرض السجل الكامل');
 await ck('[data-zrecent=lib] .zr-c [data-zr=rm]');await p.waitForTimeout(250);if((await kidItems()).length!==n0-2)E(W+' إزالة من قسم المكتبة');
 // 8) إخفاء القسم وإظهاره
 await goR();await ck('#zrhide');await p.goto(B+'library/');await p.waitForTimeout(700);if(await p.$('[data-zrecent=lib] .zr-sec'))E(W+' القسم لم يُخفَ');await goR();await ck('#zrhide');await p.goto(B+'library/');await p.waitForSelector('[data-zrecent=lib] .zr-sec');
 // 9) فتح المحتوى مجددًا يرفعه للأعلى (إعادة فتح)
 await open('songs/play/?s=none');await open('stories/read/?s=story-x');await goR();t=await tt();if(t[0]!=='قصة الحروف')E(W+' إعادة الفتح لا ترفع العنصر '+t[0]);
 // 10) حفظ في المفضلة وإضافة للخطة من السجل
 await ck('.zr-c[data-k="bank:bank-y"] [data-zr=fav]');if(!(await p.evaluate(()=>ZSAVED.has('bank:bank-y'))))E(W+' حفظ من السجل');if(!(await p.textContent('.zr-c[data-k="bank:bank-y"] [data-zr=fav]')).includes('تم الحفظ'))E(W+' حالة الحفظ');
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.kids[D.cur].age=5;localStorage.setItem(LK,JSON.stringify(D))},LK);
 await ck('.zr-c[data-k="proj:proj-1"] [data-zr=plan]');await ck('.zr-c[data-k="proj:proj-1"] [data-zr=planok]');if(!(await p.textContent('.zr-c[data-k="proj:proj-1"] [data-r=msg]')).includes('تمت الإضافة'))E(W+' إضافة للخطة '+await p.textContent('.zr-c[data-k="proj:proj-1"] [data-r=msg]'));
 await ck('.zr-c[data-k="proj:proj-1"] [data-zr=planok]');if(!(await p.textContent('.zr-c[data-k="proj:proj-1"] [data-r=msg]')).includes('مضاف مسبقًا'))E(W+' تكرار الخطة');
 const pl=await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));const k=D.kids[D.cur];return Object.values(k.plan.weeks).flatMap(w=>w.items).map(i=>i.st)},LK);if(pl.join()!=='todo')E(W+' عنصر الخطة '+pl);
 // 11) محتوى لم يعد متاحًا + مدة الاحتفاظ
 await p.evaluate((RK)=>{const d=JSON.parse(localStorage.getItem(RK));const k=Object.keys(d.kids)[0];d.kids[k].items['bank:gone-x']={at:Date.now()-1000};d.kids[k].items['stories:old-one']={at:Date.now()-45*864e5};localStorage.setItem(RK,JSON.stringify(d))},RK);
 posts=[];await goR();if(!(await p.textContent('.zr-c[data-k="bank:gone-x"]')).includes('لم يعد متاحًا'))E(W+' حالة غير متاح');if(await p.$('.zr-c[data-k="bank:gone-x"] a.zr-go'))E(W+' رابط معطل');if(await p.$('.zr-c[data-k="stories:old-one"]'))E(W+' ظهر عنصر أقدم من مدة الاحتفاظ');
 await p.goto(B+'library/');await p.waitForSelector('[data-zrecent=lib] .zr-c');if(await p.$('[data-zrecent=lib] .zr-c[data-k="bank:gone-x"]'))E(W+' غير متاح في قسم المكتبة');
 await ck('[data-zrecent=lib] .zr-all');await p.waitForTimeout(100);
 await p.goto(B+'library/');await p.waitForSelector('.lc[data-id="p1"]');await ck('.lc[data-id="p1"] [data-a=pv]');await p.waitForTimeout(500);failProd=true;await goR();const ff=await p.textContent('.zr-c[data-k="lib:s-p1"]');if(ff.includes('لم يعد متاحًا')||!ff.includes('تعذّر'))E(W+' فشل التحميل اعتُبر حذفًا '+ff);failProd=false;
 // 12) مسح السجل بتأكيد
 await goR();await ck('#zrclr');if(!(await p.textContent('#zrconf')).includes('مسح السجل بالكامل'))E(W+' رسالة تأكيد المسح');await ck('[data-zr=clrno]');if(!(await tt()).length)E(W+' إلغاء المسح مسح السجل');
 await ck('#zrclr');await ck('[data-zr=clrok]');if((await tt()).length||!(await p.textContent('#zrres')).includes(MSG))E(W+' مسح السجل');if(!(await p.evaluate(()=>ZSAVED.has('bank:bank-y'))))E(W+' مسح السجل أثّر على المحفوظات');
 // 13) فصل الأطفال
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.kids.k2={name:'أخت'};D.kids.k1=D.kids.k1||D.kids[D.cur];D.cur='k1';localStorage.setItem(LK,JSON.stringify(D))},LK);
 await open('stories/read/?s=story-x');const k1=await kidItems();await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.cur='k2';localStorage.setItem(LK,JSON.stringify(D))},LK);
 await goR();if((await tt()).length)E(W+' ظهر سجل طفل في ملف طفل آخر');await open('videos/play/?s=vid-1');const k2=await kidItems();if(k2.join()!=='vid:vid-1'||k1.join()!=='stories:story-x')E(W+' اختلاط السجلات '+k1+' / '+k2);
 await goR();if(!(await p.$('#zrk')))E(W+' لا مبدّل أطفال');await p.selectOption('#zrk','k1');await p.waitForFunction(()=>!document.querySelector('#zrres .zr-sk'));await p.waitForTimeout(150);t=await tt();if(t.join()!=='قصة الحروف')E(W+' مبدّل الطفل '+t);
 // 14) إعدادات المسؤول: نوع/مصدر مستبعد، موضع معطّل
 RCFG=[{k:'off_types',v:['quiz']},{k:'off_srcs',v:['games']},{k:'pos',v:false}];await p.evaluate(()=>localStorage.removeItem('zad-recent-cfg'));
 await open('quizzes/quiz/?q=qz-1');if((await kidItems()).includes('quiz:qz-1'))E(W+' سُجّل نوع مستبعد');await p.evaluate(()=>localStorage.removeItem('zad-recent-cfg'));await open('games/#g='+GID);if((await kidItems()).includes('games:'+GID))E(W+' سُجّل مصدر مستبعد');
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.cur='k2';localStorage.setItem(LK,JSON.stringify(D))},LK);await p.evaluate(()=>localStorage.removeItem('zad-recent-cfg'));await goR();const gv=await gt('vid:vid-1');if(gv.go!=='إعادة فتح'||gv.rs)E(W+' تعطيل الموضع '+JSON.stringify(gv));RCFG=[];
 // 15) الصفحات الأخرى والفئات
 const home=fs.readFileSync('index.html','utf8')+fs.readFileSync('js/views.js','utf8'),learn=fs.readFileSync('learn/index.html','utf8');if(!home.includes('data-zrecent="home"')||!learn.includes('data-zrecent="kid"')||!fs.readFileSync('portfolio/index.html','utf8').includes('data-zrecent="pf"'))E(W+' مواضع القسم');
 const sc=await p.evaluate(()=>[...new Set(ZFIND.X.items.flatMap(i=>i.lv))].sort().join());if(!/^(a2|a3|a4|a5|a6|g1|g2|g3|g4)(,(a2|a3|a4|a5|a6|g1|g2|g3|g4))*$/.test(sc))E(W+' فئات '+sc);
 await p.goto(B+'recent/');await p.waitForTimeout(200);await ov('final');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
