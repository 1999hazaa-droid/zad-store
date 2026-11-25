// NODE_PATH=$(npm root -g) node tools/content/find/test_find.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
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
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:1200,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let posts=[],reqs=[],failProd=false,allFree=false;
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'){posts.push([tb,r.request().postData()]);return r.fulfill({status:201,headers:CORS,body:''})}
  reqs.push(tb+u.search);if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([{product_id:'p1',uses:1}]);
  if(tb==='products'){if(failProd)return J({},500);return J(allFree?PRODS.map(x=>({...x,price:0,file_url:'files/a.pdf'})):PRODS)}
  if(DATA[tb])return J(DATA[tb]);return J([])});
 await p.route(/localhost:8765\/zad-store\//,r=>{const f=path.join(process.cwd(),decodeURIComponent(new URL(r.request().url()).pathname.replace('/zad-store/','')));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const g=path.join(f,'index.html');if(fs.existsSync(g)&&fs.statSync(f).isDirectory())return r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:fs.readFileSync(g)});return r.fulfill({status:404,body:''})}r.fulfill({status:200,contentType:MIME[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)})});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const go=async(qs)=>{posts=[];await p.goto(B+'find/'+(qs||''));await p.waitForSelector('#fzres .fzcard, #fzres .fzempty');await p.waitForTimeout(150)};
 const titles=()=>p.$$eval('#fzres .fzgrid:first-of-type .fzcard h3',e=>e.map(x=>x.textContent));
 const click=async(s)=>{await p.click(s);await p.waitForTimeout(150)};
 const ask=async(q)=>{await p.fill('#fzq',q);await p.press('#fzq','Enter');await p.waitForTimeout(450)};
 // 1) النطاق والمحتوى المنشور فقط
 await go('');const X=await p.evaluate(()=>{const x=ZFIND.X;return{n:x.items.length,lvs:[...new Set(x.items.flatMap(i=>i.lv))],keys:x.items.map(i=>i.key),games:x.items.filter(i=>i.src==='games').length,failed:x.failed}});
 if(X.lvs.some(l=>!/^(a[2-6]|g[1-4])$/.test(l)))E(W+' مستوى خارج النطاق '+X.lvs);if(X.keys.includes('lib:s-p9'))E(W+' ملف مخفي ظهر');if(X.keys.includes('lib:s-p10')||X.keys.includes('lib:s-p11'))E(W+' ملف خارج النطاق/بلا مستوى');
 if(X.games<1)E(W+' لا ألعاب من الكتالوج الحقيقي');if(X.n!==8+1+1+1+1+1+1+X.games-0&&X.n!==8+7+X.games)E(W+' عدد العناصر '+X.n+' ألعاب '+X.games);
 if(!reqs.some(r=>r.startsWith('products')&&r.includes('is_visible=eq.true')&&r.includes('lib_status=eq.published')))E(W+' شروط النشر لملفات المكتبة');
 if(!reqs.filter(r=>/^(stories|bank_items|qz_quizzes|activities)/.test(r)).every(r=>r.includes('status=eq.published')))E(W+' جداول بلا شرط النشر');
 if(!(await p.textContent('.zbc')).includes('ابحث في المكتبة'))E(W+' مسار التنقل');if(!(await p.$('.zfbox input[placeholder="ابحث عن قصة، ورقة عمل، نشاط أو درس…"]')))E(W+' نص الإرشاد');
 await ov('home');
 // 2) كلمات مفتاحية وعربية ذكية
 const T=async(q)=>{await ask(q);return titles()};
 let t=await T('قصص');if(!t.includes('قصص الحيوانات المصوّرة')||!t.includes('قصة الحروف'))E(W+' قصص/قصة '+t);if(t.some(x=>/الأشكال|الهجاء|الجمع/.test(x)))E(W+' قصص أعادت غير ذي صلة '+t);
 t=await T('قصص الحيوانات');if(t[0]!=='قصص الحيوانات المصوّرة')E(W+' قصص الحيوانات '+t);
 t=await T('الحروف العربية');if(!t.includes('حروف الهجاء للتلوين'))E(W+' الحروف العربية '+t);
 t=await T('اوراق عمل الاشكال');if(!t.includes('ورقة عمل الأشكال'))E(W+' همزة/ألف '+t);
 t=await T('العد من 1 إلى 10');if(t[0]!=='العد من 1 إلى 10')E(W+' العد من 1 إلى 10 '+t);
 t=await T('الجمع والطرح');if(!t.includes('أوراق عمل الجمع والطرح'))E(W+' الجمع والطرح '+t);
 t=await T('مفردات اللغة الانجليزيه');if(!t.includes('مفردات اللغة الإنجليزية'))E(W+' إنجليزية '+t);
 t=await T('أنشطة الألوان');if(!t.includes('نشاط الألوان في البيت'))E(W+' أنشطة الألوان '+t);
 t=await T('الحيوانت');if(!t.includes('قصص الحيوانات المصوّرة'))E(W+' خطأ إملائي بسيط '+t);
 t=await T('حكايات');if(!t.includes('قصة الحروف'))E(W+' مرادف مدمج '+t);
 t=await T('تسلية');if(!t.includes('نشاط الألوان في البيت'))E(W+' كلمة بديلة من الإدارة '+t);
 t=await T('جدول الجمع');if(!t.includes('نشاط الجمع حتى ١٠'))E(W+' كلمة مفتاحية من الإدارة '+t);
 t=await T('   قصص    الحيوانات   ');if(t[0]!=='قصص الحيوانات المصوّرة')E(W+' مسافات زائدة '+t);
 // مجال وكلمة المهارة
 t=await T('ملاحظة نمو النبات');if(!t.includes('نزرع حبة فول'))E(W+' مهارة '+t);
 // 3) لا نتائج
 posts=[];await ask('ديناصورات');if(!(await p.textContent('#fzres')).includes('لم نعثر على محتوى مطابق. جرّب كلمة أخرى أو غيّر الفلاتر'))E(W+' رسالة عدم النتائج');
 if((await p.$$('#fzres .fzcard')).length)E(W+' نتائج غير مرتبطة عند عدم الوجود');if(!(await p.$('#fzres [data-dom]')))E(W+' تصفح المجالات');
 const z=posts.filter(x=>x[0]==='search_queries');if(z.length!==1||z[0][1]!==JSON.stringify({q:'ديناصورات'}))E(W+' تسجيل الكلمة بلا نتيجة '+JSON.stringify(z));
 posts=[];await ask('ليث 5 سنوات yousef@mail.com');if(posts.some(x=>x[0]==='search_queries'))E(W+' سُجّلت كلمة فيها بيانات شخصية');
 await ask('ديناصورات');if(posts.some(x=>x[0]==='search_queries'))E(W+' تكرار تسجيل في الجلسة');
 await ask('قصص ديناصورات');if(!(await p.$('#fzres [data-q]')))E(W+' اقتراح كلمة أقصر');else{await click('#fzres [data-q]');if(!(await titles()).length)E(W+' كلمة أقصر بلا نتائج')}
 // 4) فلاتر مجتمعة
 await go('');await click('#fzftog');
 const pills=await p.$$eval('#fzf [data-f]',e=>e.map(x=>x.dataset.f+':'+x.dataset.v));
 if(pills.includes('dom:values'))E(W+' فلتر بلا محتوى ظاهر');if(!pills.includes('av:paid')||!pills.includes('ct:game'))E(W+' فلاتر ناقصة '+pills.join());
 await click('#fzf [data-f=lv][data-v=a5]');let cs=await p.$$eval('#fzres .fzcard',e=>e.map(x=>x.textContent));if(!cs.length||!(await p.evaluate(()=>ZFIND.search('',{lv:new Set(['a5'])},'rel').every(r=>r.it.lv.includes('a5')))))E(W+' فلتر العمر');
 await click('#fzf [data-f=ct][data-v=ws]');t=await titles();if(!t.includes('ورقة عمل الأشكال')||t.includes('قصة الحروف'))E(W+' عمر+نوع '+t);
 await click('#fzf [data-f=av][data-v=free]');t=await titles();if(t.some(x=>/الجمع والطرح/.test(x)))E(W+' مجاني+... أظهر مدفوعًا');
 await ask('الأشكال');t=await titles();if(t.length!==1||t[0]!=='ورقة عمل الأشكال')E(W+' بحث+فلاتر '+t);
 await click('#fzact .fzx');await click('#fzact .fzx');await click('#fzact .fzx');if((await p.$$('#fzact .fzx')).length)E(W+' إزالة الفلاتر واحدًا واحدًا');
 await click('#fzf [data-f=av][data-v=paid]');t=await titles();if(t.length!==0&&!t.every(x=>/الجمع والطرح/.test(x)))E(W+' مدفوع '+t);
 await click('[data-f=clear]');if((await p.$$('#fzact .fzx')).length)E(W+' مسح الفلاتر');
 await go('?q=&ct=story&lv=a4');t=await titles();if(!t.includes('قصة الحروف')||!t.includes('قصص الحيوانات المصوّرة')||t.some(x=>/الأشكال/.test(x)))E(W+' فلاتر من الرابط '+t);
 await go('?av=paid');t=await titles();if(t.join()!=='أوراق عمل الجمع والطرح')E(W+' مدفوع فقط '+t);
 const paid=await p.textContent('#fzres .fzcard');if(!paid.includes('مدفوع')||!paid.includes('1.500 ر.ع')||!paid.includes('المعاينة متاحة قبل الطلب'))E(W+' بطاقة مدفوعة '+paid);
 await go('?av=print');if(!(await p.evaluate(()=>ZFIND.search('',{av:new Set(['print'])},'rel').every(r=>r.it.src==='lib'))))E(W+' قابل للطباعة');
 await go('?av=inter');if(!(await p.evaluate(()=>ZFIND.search('',{av:new Set(['inter'])},'rel').every(r=>r.it.src!=='lib'))))E(W+' تفاعلي');
 // 5) الترتيب
 await go('');if(await p.$('#fzsort option[value=pop]'))E(W+' ترتيب الاستخدام بلا بيانات كافية');
 await p.selectOption('#fzsort','new');await p.waitForTimeout(150);t=await titles();if(t[0]!=='قصص الحيوانات المصوّرة')E(W+' الأحدث '+t.slice(0,3));
 await p.selectOption('#fzsort','lv');await p.waitForTimeout(150);const lo=await p.evaluate(()=>ZFIND.search('',{},'lv').map(r=>ZFIND.LVK.indexOf(r.it.lv[0])));if(lo.some((v,i)=>i&&v<lo[i-1]))E(W+' ترتيب العمر');
 await p.selectOption('#fzsort','ct');await p.waitForTimeout(150);const co=await p.evaluate(()=>ZFIND.search('',{},'ct').map(r=>ZFIND.CTK.indexOf(r.it.ct)));if(co.some((v,i)=>i&&v<co[i-1]))E(W+' ترتيب النوع');
 // 6) حسب الاحتياج
 await go('');const nc=await p.$$eval('[data-need]',e=>e.map(x=>x.textContent));if(nc.length<5)E(W+' احتياجات '+nc);
 await click('[data-need=letters]');t=await titles();if(!t.includes('حروف الهجاء للتلوين')||!t.includes('نصل الحرف بصورته ١')||t.some(x=>/الأشكال|الجمع/.test(x)))E(W+' احتياج الحروف '+t);
 await click('[data-need=story]');t=await titles();if(!t.includes('قصة الحروف')||t.some(x=>!/قص/.test(x)))E(W+' قصة قصيرة '+t);
 await click('[data-need=print]');t=await titles();if(t.some(x=>/قصة الحروف|نصل/.test(x)))E(W+' ورقة للطباعة '+t);
 await click('[data-need=think]');await p.waitForTimeout(100);
 // 7) الاقتراحات أثناء الكتابة
 await go('');await p.fill('#fzq','حرو');await p.waitForSelector('.zf-sug:not([hidden]) li');const sg=await p.$$eval('.zf-sug li span',e=>e.map(x=>x.textContent));if(sg.length>6||!sg.length)E(W+' عدد الاقتراحات '+sg.length);
 const okS=await p.evaluate((a)=>a.every(x=>ZFIND.X.sugg.some(s=>s.text===x)),sg);if(!okS)E(W+' اقتراح غير مستند إلى بيانات المكتبة '+sg);
 const h=await p.$eval('.zf-sug',e=>e.getBoundingClientRect().height);if(h>320)E(W+' قائمة اقتراحات طويلة '+h);
 await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');await p.waitForTimeout(250);if(!(await titles()).length)E(W+' اختيار اقتراح بلا نتائج');
 await ov('after-suggest');
 // 8) البطاقات والروابط
 await go('');const cd=await p.$$eval('#fzres .fzcard',e=>e.map(c=>({img:!!c.querySelector('img'),h:c.querySelector('h3').textContent,meta:c.querySelector('.mt').textContent,a:c.querySelector('.ac a').href,plan:!!c.querySelector('[data-a=plan]'),fav:!!c.querySelector('.fv'),txt:c.querySelector('.ac a').textContent})));
 if(cd.some(c=>!c.img||!c.h||!c.meta||!c.fav||c.txt!=='عرض المحتوى'))E(W+' بطاقة ناقصة');
 const hrefs=[...new Set(cd.map(c=>c.a.split('#')[0]))];for(const h of hrefs){const r=await ctx.request.get(h);if(r.status()!==200)E(W+' رابط لا يفتح '+h+' '+r.status())}
 if(!cd.some(c=>c.a.includes('library/#f=s-p1')))E(W+' رابط ملف المكتبة');if(!cd.some(c=>c.a.includes('bank/play/?s=bank-y')))E(W+' رابط النشاط');
 const lib=await p.$eval('[data-k="lib:s-p1"]',e=>({plan:!!e.querySelector('[data-a=plan]')}));if(lib.plan)E(W+' زر الخطة على ملف مكتبة غير مناسب');
 if((await p.$$('[data-k^="games:"] [data-a=plan]')).length)E(W+' زر الخطة على لعبة');
 // 9) المفضلة
 await click('[data-k="lib:s-p1"] .fv');await click('[data-k="bank:bank-y"] .fv');const fv=await p.evaluate(()=>[localStorage.getItem('zad.lib.fav'),localStorage.getItem('zad.find.fav')]);if(fv[0]!=='["p1"]'||fv[1]!=='["bank:bank-y"]')E(W+' المفضلة '+fv);
 await go('?sv=1');t=await titles();if(t.length!==2)E(W+' المحفوظة فقط '+t);
 // 10) إضافة إلى خطتي
 await go('');await p.evaluate(()=>{localStorage.removeItem('zad-learn-v3');localStorage.removeItem('zad-rec-lv')});await click('[data-k="bank:bank-y"] [data-a=plan]');if(!(await p.textContent('[data-k="bank:bank-y"] .fzplan')).includes('اختر عمر'))E(W+' بدون مستوى');
 await p.evaluate(()=>localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{name:'سارة',age:'5',acts:{}}}})));await go('');
 await click('[data-k="bank:bank-g"] [data-a=plan]');await click('[data-k="bank:bank-g"] [data-a=planok]');if(!(await p.textContent('[data-k="bank:bank-g"] .fzplan')).includes('غير مناسب'))E(W+' محتوى لمستوى آخر');
 await click('[data-k="bank:bank-y"] [data-a=plan]');await click('[data-k="bank:bank-y"] [data-a=planok]');let k=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return d.kids.k1.plan});const items=Object.values((k&&k.weeks)||{}).flatMap(w=>w.items);if(items.length!==1||items[0].key!=='bank:bank-y'||items[0].st!=='todo')E(W+' إضافة للخطة '+JSON.stringify(items));
 await click('[data-k="bank:bank-y"] [data-a=planok]');if(!(await p.textContent('[data-k="bank:bank-y"] .fzplan')).includes('مضاف مسبقًا'))E(W+' تكرار الإضافة');
 const k2=await p.evaluate(()=>Object.values(JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.plan.weeks).flatMap(w=>w.items).length);if(k2!==1)E(W+' تكرر العنصر في الخطة');
 // 11) رابط مباشر وأزرار
 await go('?q=%D9%82%D8%B5%D8%B5');if((await p.inputValue('#fzq'))!=='قصص'||!(await titles()).includes('قصة الحروف'))E(W+' رابط البحث المباشر');
 await ov('final');
 // 12) تعذّر التحميل
 failProd=true;await p.goto(B+'find/?q=قصص');await p.waitForSelector('#fzres .fzcard, #fzres .fzempty');if(!(await p.textContent('#fzres')).includes('تعذّر تحميل بعض الأقسام'))E(W+' تنبيه تعذّر التحميل');if((await p.textContent('#fzcount')).match(/\d/))E(W+' عدد غير دقيق مع تحميل ناقص');failProd=false;
 // 13) فلتر بلا بيانات: لا مدفوع
 allFree=true;await go('');await click('#fzftog');if(await p.$('#fzf [data-v=paid]'))E(W+' فلتر «مدفوع» ظاهر بلا محتوى مدفوع');allFree=false;
 // 14) مربع البحث في الصفحات الأخرى
 await p.goto(B+'library/');await p.waitForSelector('#lq');if((await p.getAttribute('#lq','placeholder'))!=='ابحث عن قصة، ورقة عمل، نشاط أو درس…')E(W+' نص الإرشاد في المكتبة');
 await p.fill('#lq','قصص');await p.press('#lq','Enter');await p.waitForURL(/find\/\?q=/);await p.waitForSelector('#fzres .fzcard');if(!(await titles()).includes('قصة الحروف'))E(W+' بحث من المكتبة');
 await p.goto(B+'library/');await p.fill('#lq','حروف');await p.click('#lfind');await p.waitForURL(/find\/\?q=/);if(!p.url().includes('q='+encodeURIComponent('حروف')))E(W+' رابط البحث المتقدم لا يحمل الكلمة '+p.url());
 await p.goto(B);await p.waitForSelector('[data-zfind] input');const act=await p.$eval('[data-zfind] form',f=>f.getAttribute('action'));if(!/find\/$/.test(act))E(W+' action '+act);await p.fill('[data-zfind] input','قصص');await p.press('[data-zfind] input','Enter');await p.waitForURL(/find\/\?q=/);await p.waitForSelector('#fzres .fzcard');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
