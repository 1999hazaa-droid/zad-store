// NODE_PATH=$(npm root -g) node tools/content/saved/test_saved.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
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

const LK='zad-learn-v3';
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:1200,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let posts=[],failProd=false,SOFF=[];
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'||m==='DELETE'||m==='PATCH'){posts.push([tb,r.request().postData()||'']);return r.fulfill({status:tb==='learn_saves'?201:201,headers:CORS,body:''})}
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);if(tb==='saved_off')return J(SOFF);
  if(tb==='products'){if(failProd)return J({},500);return J(PRODS)}
  if(tb==='learn_saves')return J([]);if(DATA[tb])return J(DATA[tb]);return J([])});
 await p.route(/localhost:8765\/zad-store\//,r=>{const f=path.join(process.cwd(),decodeURIComponent(new URL(r.request().url()).pathname.replace('/zad-store/','')));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const g=path.join(f,'index.html');if(fs.existsSync(g)&&fs.statSync(f).isDirectory())return r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:fs.readFileSync(g)});return r.fulfill({status:404,body:''})}r.fulfill({status:200,contentType:MIME[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)})});
 const B='http://localhost:8765/';
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const kid=()=>p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK)||'null');return D&&D.kids?D.kids[D.cur].saved||null:null},LK);
 const keysIn=async()=>{const s=await kid();return s?Object.keys(s.items).sort():[]};
 const seed=async(o)=>{await p.addInitScript(([LK,o])=>{if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');if(o.db)localStorage.setItem(LK,JSON.stringify(o.db));for(const k in (o.ls||{}))localStorage.setItem(k,o.ls[k])}},[LK,o])};
 const goS=async()=>{await p.goto(B+'saved/');await p.waitForFunction(()=>!document.querySelector('#szres .fzsk'));await p.waitForTimeout(120)};
 const goF=async(q)=>{await p.goto(B+'find/'+(q||''));await p.waitForSelector('#fzres .fzcard, #fzres .fzempty');await p.waitForTimeout(120)};
 const tt=()=>p.$$eval('#szres .fzcard h3',e=>e.map(x=>x.textContent));
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(120)};
 // 1) الصفحة فارغة: الرسالة المطلوبة
 await goS();let txt=await p.textContent('#szres');if(!txt.includes('لم تحفظ أي محتوى بعد. استكشف المكتبة وأضف الأنشطة التي تعجبك'))E(W+' رسالة الفراغ '+txt);
 if(!(await p.textContent('.zbc')).includes('محتواي المحفوظ')||!(await p.$('.zbc a[href="../library/"]')))E(W+' مسار التنقل');if(!(await p.textContent('h1')).includes('محتواي المحفوظ'))E(W+' العنوان');
 if(await p.$('#szftog:not([hidden])'))E(W+' فلاتر ظاهرة بلا بيانات');await ov('empty');
 // 2) زر الحفظ في البحث: حفظ، تم الحفظ، لا تكرار، إزالة
 await goF('?q=قصص');let btn='#fzres .fzcard[data-k="stories:story-x"] [data-a=fav]';
 if((await p.textContent(btn)).trim()!=='حفظ')E(W+' نص الزر قبل الحفظ');
 await ck(btn);if((await p.textContent(btn)).trim()!=='تم الحفظ'||(await p.getAttribute(btn,'aria-pressed'))!=='true')E(W+' حالة الزر بعد الحفظ');
 if(!(await p.textContent('.zs-toast').catch(()=>'')).includes('تم الحفظ'))E(W+' رسالة التأكيد');
 let k=await keysIn();if(k.join()!=='stories:story-x')E(W+' المخزن '+k);
 const dup=await p.evaluate(()=>{const it=ZFIND.X.items.find(i=>i.key==='stories:story-x');const m={key:it.key,title:it.title,ct:it.ct,dom:it.dom,lv:it.lv};ZSAVED.save(m);ZSAVED.save(m);return ZSAVED.count()});if(dup!==1)E(W+' تكرار العنصر '+dup);
 await ck(btn);if((await p.textContent(btn)).trim()!=='حفظ'||(await keysIn()).length)E(W+' الإزالة من البحث');
 // 3) كل أنواع المحتوى القابلة للحفظ + الألعاب
 await ck(btn);const types=await p.evaluate(()=>{const X=ZFIND.X;const seen={};X.items.forEach(i=>{if(!seen[i.ct])seen[i.ct]=i});Object.values(seen).forEach(it=>ZSAVED.save({key:it.key,title:it.title,ct:it.ct,dom:it.dom,lv:it.lv,paid:it.paid}));return Object.keys(seen).sort()});
 for(const c of ['cards','game','home','project','quiz','res','story','video','ws'])if(!types.includes(c))E(W+' نوع غير ممثل في الاختبار '+c);
 await goS();const SS=await kid(),EXP=Object.keys(SS.items).length,CNT={};Object.values(SS.items).forEach(i=>{CNT[i.ct]=(CNT[i.ct]||0)+1});const n1=(await tt()).length;if(n1!==EXP||EXP<types.length)E(W+' عدد المحفوظات '+n1+' / '+EXP);
 if(!(await p.textContent('#szcount')).includes(String(EXP).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d])))E(W+' العدد '+await p.textContent('#szcount'));
 await ov('list');
 const cards=await p.$$eval('#szres .fzcard',cs=>cs.map(c=>({k:c.dataset.k,open:!!c.querySelector('.ac a'),rm:!!c.querySelector('[data-a=rm]'),img:!!c.querySelector('img'),mt:c.querySelector('.mt').textContent,sd:c.querySelector('.sd')?c.querySelector('.sd').textContent:''})));
 for(const c of cards){if(!c.open||!c.rm||!c.img||!c.sd.includes('حُفظ'))E(W+' بطاقة ناقصة '+JSON.stringify(c))}
 // روابط «فتح المحتوى» تعمل (ملفات موجودة أو صفحات منصة)
 const hrefs=await p.$$eval('#szres .ac a',a=>a.map(x=>x.getAttribute('href')));if(hrefs.some(h=>!h||h==='#'))E(W+' رابط فارغ');
 // 4) الفلاتر معًا والإلغاء
 await ck('#szftog');const ctChips=await p.$$eval('#szf [data-f=ct]',e=>e.map(x=>x.dataset.v));if(ctChips.length<2)E(W+' فلاتر النوع '+ctChips);
 await ck('#szf [data-f=ct][data-v=story]');let t=await tt();if(t.length!==CNT.story)E(W+' فلتر النوع '+t.length);
 await ck('#szf [data-f=ct][data-v=game]');t=await tt();if(t.length!==CNT.story+CNT.game)E(W+' فلتران من نفس المجموعة '+t.length);
 const doms=await p.$$eval('#szf [data-f=dom]',e=>e.map(x=>x.dataset.v));if(doms.length){await ck('#szf [data-f=dom]');const t2=await tt();if(t2.length>CNT.story+CNT.game)E(W+' فلتر المجال مع النوع')}
 await ck('#szact [data-f=clear]');if((await tt()).length!==EXP)E(W+' مسح الفلاتر');
 await p.selectOption('#szsort','title');const ts=await tt();const sorted=[...ts].sort((a,b)=>a.localeCompare(b,'ar'));if(ts.join()!==sorted.join())E(W+' الترتيب حسب العنوان');
 // 5) قوائم خاصة: إنشاء (اختياري)، اسم مكرر، تعديل، نقل، حذف بتأكيد
 await ck('#szlists [data-a=newlist]');await ck('#szlmg [data-sg="قصص أريد قراءتها"]');await ck('#szlmg [data-a=mknew]');
 if((await p.textContent('#szlists [aria-selected=true]')).indexOf('قصص أريد قراءتها')<0)E(W+' إنشاء قائمة');
 await ck('#szlists [data-a=newlist]');await p.fill('#szln','قصص أريد قراءتها');await ck('#szlmg [data-a=mknew]');if(!(await p.textContent('#szlmg [data-r=msg]')).includes('بهذا الاسم'))E(W+' اسم مكرر');await ck('#szlmg [data-a=mgx]');
 if(!(await p.textContent('#szres')).includes('هذه القائمة فارغة'))E(W+' قائمة فارغة');
 await ck('#szlists [data-l=""]');await ck('#szsel');
 await p.evaluate(()=>{const c=[...document.querySelectorAll('#szres .fzcard')].filter(c=>/stories|bank/.test(c.dataset.k)||c.dataset.k==='stories:story-x');(c.length?c:[document.querySelector('#szres .fzcard')]).slice(0,1).forEach(x=>x.querySelector('.ck').click())});await p.waitForTimeout(120);
 const lid=await p.$eval('#szlists button[data-l]:not([data-l=""])',e=>e.dataset.l);await p.selectOption('#szmv',lid);await ck('#szbulk [data-a=mv]');
 let s=await kid();if(Object.values(s.items).filter(i=>(i.lists||[]).includes(lid)).length!==1)E(W+' نقل إلى قائمة');
 await ck('#szsel');await ck('#szlists [data-l="'+lid+'"]');if((await tt()).length!==1)E(W+' محتوى القائمة');
 await ck('#szlmg [data-a=ren]');await p.fill('#szln','قصص للمراجعة');await ck('#szlmg [data-a=mkren]');if(!(await p.textContent('#szlists')).includes('قصص للمراجعة'))E(W+' تعديل الاسم');
 await ck('#szlmg [data-a=del]');if(!(await p.textContent('#szlmg')).includes('نعم، احذف'))E(W+' تأكيد الحذف');await ck('#szlmg [data-a=mgx]');if(!(await kid()).lists.length)E(W+' إلغاء الحذف حذف القائمة');
 await ck('#szlmg [data-a=del]');await ck('#szlmg [data-a=mkdel]');s=await kid();if(s.lists.length||Object.keys(s.items).length!==EXP)E(W+' حذف القائمة يجب أن يُبقي المحتوى '+Object.keys(s.items).length);
 // 6) إزالة عدة عناصر
 await ck('#szsel');await ck('#szbulk [data-a=all]');await ck('#szbulk [data-a=rmsel]');if((await keysIn()).length)E(W+' إزالة عدة عناصر');if(!(await p.textContent('#szres')).includes('لم تحفظ أي محتوى بعد'))E(W+' فراغ بعد الإزالة');
 // 7) المكتبة: القلب يحفظ في المخزن الموحد وتتحدث الحالة في كل الصفحات
 await p.goto(B+'library/');await p.waitForSelector('.lc[data-id="p1"] .lfav');await ck('.lc[data-id="p1"] .lfav');
 if((await keysIn()).join()!=='lib:s-p1')E(W+' المكتبة لم تحفظ في المخزن الموحد '+await keysIn());
 await goF('?q=حروف');if((await p.getAttribute('#fzres .fzcard[data-k="lib:s-p1"] [data-a=fav]','aria-pressed'))!=='true')E(W+' حالة الحفظ لا تظهر في نتائج البحث');
 await ck('#fzftog');if(!(await p.textContent('#fzf')).includes('المحتوى المحفوظ'))E(W+' فلتر المحتوى المحفوظ');
 await ck('#fzf [data-f=saved]');t=await p.$$eval('#fzres .fzcard h3',e=>e.map(x=>x.textContent));if(t.join()!=='حروف الهجاء للتلوين')E(W+' فلتر المحفوظ فقط '+t);
 await goS();await ck('#szres [data-a=rm]');await p.goto(B+'library/');await p.waitForSelector('.lc[data-id="p1"] .lfav');if((await p.getAttribute('.lc[data-id="p1"] .lfav','aria-pressed'))!=='false')E(W+' الإزالة لم تنعكس على المكتبة');
 // 8) مدفوع: يبقى ويُوضّح ويُعرض معاينته
 await goF('?q=الجمع');await ck('#fzres .fzcard[data-k="lib:s-p3"] [data-a=fav]');await goS();txt=await p.textContent('#szres');if(!txt.includes('مدفوع')||!txt.includes('محتوى مدفوع'))E(W+' وسم المدفوع');
 if(!(await p.textContent('#szres .ac a')).includes('عرض المعاينة'))E(W+' زر المعاينة للمدفوع');
 // 9) إضافة إلى الخطة من المحفوظات: لا إنجاز، لا تكرار
 await goF('?q=نصل');await ck('#fzres .fzcard[data-k="bank:bank-y"] [data-a=fav]');await goS();
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK)||'{}');D.kids=D.kids||{k1:{}};D.cur=D.cur||'k1';D.kids[D.cur].age=5;localStorage.setItem(LK,JSON.stringify(D))},LK);
 await ck('#szres .fzcard[data-k="bank:bank-y"] [data-a=plan]');await ck('#szres .fzcard[data-k="bank:bank-y"] [data-a=planok]');
 if(!(await p.textContent('#szres .fzcard[data-k="bank:bank-y"] [data-r=msg]')).includes('تمت الإضافة'))E(W+' إضافة للخطة '+await p.textContent('#szres .fzcard[data-k="bank:bank-y"] [data-r=msg]'));
 const pl=await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));const k=D.kids[D.cur];const w=Object.values(k.plan.weeks);return{items:w.flatMap(x=>x.items),done:k.bank&&k.bank.done}},LK);
 if(pl.items.length!==1||pl.items[0].key!=='bank:bank-y'||pl.items[0].st!=='todo')E(W+' عنصر الخطة '+JSON.stringify(pl.items));if(pl.done&&Object.keys(pl.done).length)E(W+' المحفوظ سُجّل إنجازًا');
 await ck('#szres .fzcard[data-k="bank:bank-y"] [data-a=planok]');if(!(await p.textContent('#szres .fzcard[data-k="bank:bank-y"] [data-r=msg]')).includes('مضاف مسبقًا'))E(W+' منع تكرار الخطة');
 if(await p.$('#szres .fzcard[data-k="lib:s-p3"] [data-a=plan]'))E(W+' زر الخطة على ملف مكتبة');
 // 10) محتوى لم يعد متاحًا
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.kids[D.cur].saved.items['bank:deleted-one']={t:'نشاط محذوف',ct:'res',dom:'math',lv:['a5'],at:Date.now(),lists:[]};localStorage.setItem(LK,JSON.stringify(D))},LK);
 posts=[];await goS();let gc='#szres .fzcard[data-k="bank:deleted-one"]';if(!(await p.textContent(gc)).includes('لم يعد متاحًا'))E(W+' حالة غير متاح');
 if(await p.$(gc+' .ac a'))E(W+' رابط معطّل لمحتوى غير متاح');if(!(await p.$(gc+' [data-a=rm]')))E(W+' لا إزالة لغير المتاح');
 const er=posts.filter(x=>x[0]==='pf_errors');if(!er.length||!er[0][1].includes('saved-link')||!er[0][1].includes('bank:deleted-one')||/uid|user|email/i.test(er[0][1]))E(W+' تسجيل رابط غير متاح '+JSON.stringify(er));
 await ck(gc+' [data-a=rm]');if(await p.$(gc))E(W+' إزالة غير المتاح');
 // فشل مصدر: لا نعتبر المحتوى غير متاح
 await goF('?q=حروف');await ck('#fzres .fzcard[data-k="lib:s-p1"] [data-a=fav]');failProd=true;posts=[];await goS();
 txt=await p.textContent('#szres');if(txt.includes('لم يعد متاحًا'))E(W+' فشل التحميل اعتُبر حذفًا');if(!txt.includes('تعذّر'))E(W+' لا تنبيه عند فشل التحميل');if(posts.some(x=>x[0]==='pf_errors'))E(W+' خطأ رابط كاذب عند فشل الشبكة');failProd=false;
 // 11) الخصوصية: طفل آخر لا يرى قائمة غيره، والاحتفاظ بعد إعادة التحميل
 await p.goto(B+'saved/');await p.waitForTimeout(300);const mine=(await keysIn()).length;
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.kids.k2={name:'آخر'};D.kids.k1=D.kids[D.cur];D.cur='k2';localStorage.setItem(LK,JSON.stringify(D))},LK);await goS();
 if((await tt()).length)E(W+' ظهرت قائمة طفل في حساب طفل آخر');await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.cur='k1';localStorage.setItem(LK,JSON.stringify(D))},LK);await goS();if(!(await tt()).length&&mine)E(W+' المحفوظات اختفت بعد إعادة التحميل');
 // 12) المزامنة مع الحساب (تبقى بعد الخروج والدخول): يُدفع kid.saved ضمن learn_saves
 await p.evaluate(()=>{localStorage.setItem('zad-pf-consent','1');localStorage.setItem('zad-sess',JSON.stringify({at:'t',rt:'r',exp:Date.now()+3600000,email:'x@y.z',uid:'00000000-0000-0000-0000-000000000001'}))});
 posts=[];await goF('?q=قصص');await ck('#fzres .fzcard[data-k="stories:story-x"] [data-a=fav]');await p.waitForTimeout(3300);
 const ls=posts.find(x=>x[0]==='learn_saves');if(!ls||!ls[1].includes('"saved"')||!ls[1].includes('stories:story-x'))E(W+' المزامنة لا تحمل المحفوظات '+(ls&&ls[1].slice(0,120)));
 // 13) ترحيل المفضلة القديمة
 await p.evaluate((LK)=>{localStorage.removeItem(LK);localStorage.removeItem('zad-sess');localStorage.setItem('zad.lib.fav',JSON.stringify(['p2']));localStorage.setItem('zad.find.fav',JSON.stringify(['bank:bank-y']))},LK);
 await p.evaluate(()=>sessionStorage.setItem('seeded','1'));await goS();t=await tt();if(!t.includes('ورقة عمل الأشكال')||!t.includes('نصل الحرف بصورته ١'))E(W+' ترحيل المفضلة القديمة '+t);
 const leg=await p.evaluate(()=>[localStorage.getItem('zad.lib.fav'),localStorage.getItem('zad.find.fav')]);if(leg.join()!=='[],[]')E(W+' لم تُفرّغ المفضلة القديمة '+leg);
 // 14) إيقاف الإدارة: نوع وعنصر
 await p.evaluate((LK)=>{localStorage.removeItem(LK)},LK);SOFF=[{kind:'item',ref:'stories:story-x'},{kind:'type',ref:'game'}];
 await goF('?q=قصص');await ck('#fzres .fzcard[data-k="stories:story-x"] [data-a=fav]');if((await keysIn()).length)E(W+' حُفظ عنصر أوقفته الإدارة');if(!(await p.textContent('.zs-toast')).includes('أوقف المسؤول'))E(W+' رسالة الإيقاف');
 const gb=await p.evaluate(()=>{const it=ZFIND.X.items.find(i=>i.ct==='game');return ZSAVED.save({key:it.key,title:it.title,ct:'game',lv:it.lv}).ok});if(gb)E(W+' حُفظ نوع موقوف');
 SOFF=[];
 // 15) صفحات أخرى والروابط
 for(const [u,sel] of [['library/','#lsaved'],['find/','#fzsaved'],['plan/','a[href="../saved/"]']]){await p.goto(B+u);await p.waitForSelector(sel,{timeout:4000}).catch(()=>E(W+' رابط محتواي المحفوظ مفقود في '+u))}
 await p.goto(B+'saved/');await p.waitForTimeout(200);await ov('final');
 // نطاق الفئات
 const lv=await p.evaluate(()=>Object.keys(ZSAVED.LVN));if(lv.join()!=='a2,a3,a4,a5,a6,g1,g2,g3,g4')E(W+' الفئات '+lv);
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
