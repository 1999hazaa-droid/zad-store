// NODE_PATH=$(npm root -g) node tools/content/packs/test_packs.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
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



const PK_ALL=[
 {slug:'pk-letters',title:'حزمة الحروف التجريبية',summary:'حروف وقصة ومشروع.',cover:'images/zad/i_book.webp',levels:['a5'],dom:'arabic',skills:['الحروف','الكتابة'],est_min:null,status:'published',sort_order:10,starts:5,created_at:new Date().toISOString(),keys:['vid:vid-1','stories:story-x','bank:bank-y','proj:proj-1','lib:s-p1','lib:s-p2']},
 {slug:'pk-add',title:'حزمة الجمع التجريبية',summary:'جمع وطرح للصف الأول.',cover:'images/zad/i_numbers.webp',levels:['g1'],dom:'math',skills:['الجمع'],est_min:null,status:'published',sort_order:20,starts:0,created_at:'2026-01-01T00:00:00Z',keys:['bank:bank-g','quiz:qz-1','lib:s-p3','lib:s-p7']},
 {slug:'pk-thin',title:'حزمة ناقصة',summary:'لا تكفي مواردها.',cover:'images/zad/i_book.webp',levels:['a5'],dom:'arabic',skills:[],est_min:null,status:'published',sort_order:30,starts:0,created_at:'2026-01-01T00:00:00Z',keys:['vid:vid-1','bank:bank-gone','lib:s-p9']},
 {slug:'pk-mis',title:'حزمة مستوى خاطئ',summary:'مواردها لا تناسب مستواها.',cover:'images/zad/i_book.webp',levels:['a2'],dom:'arabic',skills:[],est_min:null,status:'published',sort_order:40,starts:0,created_at:'2026-01-01T00:00:00Z',keys:['vid:vid-1','stories:story-x','bank:bank-y','proj:proj-1']},
 {slug:'pk-draft',title:'مسودة',summary:'',cover:'images/zad/i_book.webp',levels:['a5'],dom:'arabic',skills:[],est_min:null,status:'draft',sort_order:50,starts:0,created_at:'2026-01-01T00:00:00Z',keys:['vid:vid-1','stories:story-x','bank:bank-y','proj:proj-1']}];
const LK='zad-learn-v3',RK='zad-recent-v1',PKK='zad-packs-v1';
const CAT=JSON.parse(fs.readFileSync('games/catalog.json','utf8'));const GID=CAT.find(g=>g.id&&g.t).id;
(async()=>{const b=await chromium.launch();
for(const vp of (process.env.VP?[{width:+process.env.VP,height:800}]:[{width:390,height:800},{width:1200,height:900}])){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();
 let posts=[],failProd=false,RCFG=[],starts=[],failPacks=false,jserr=[];
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'||m==='DELETE'||m==='PATCH'){posts.push([tb,r.request().postData()||'']);return r.fulfill({status:201,headers:CORS,body:''})}
  if(tb==='packs'){if(failPacks)return J({},500);return J(PK_ALL.filter(x=>x.status==='published').map(({keys,...r})=>r))}
  if(tb==='pack_items'){const o=[];PK_ALL.filter(x=>x.status==='published').forEach(x=>x.keys.forEach((k,i)=>o.push({pack_id:x.slug,key:k,pos:i+1,packs:{slug:x.slug}})));return J(o)}
  if(tb==='pack_start'){starts.push(r.request().postData());return r.fulfill({status:204,headers:CORS})}
  if(tb==='rp_config')return J(DOMS);if(tb==='search_overrides')return J(OVS);if(tb==='search_synonyms')return J(SYNS);if(tb==='lib_stats')return J([]);if(tb==='saved_off')return J([]);if(tb==='recent_cfg')return J(RCFG);
  if(tb==='products'){if(failProd)return J({},500);return J(PRODS)}
  if(DATA[tb]){const sl=u.searchParams.get('slug');if(sl&&sl.startsWith('eq.')){const s=decodeURIComponent(sl.slice(3));return J(DATA[tb].filter(x=>x.slug===s))}return J(DATA[tb])}
  return J([])});
 await p.route(/localhost:8765\/zad-store\//,r=>{const f=path.join(process.cwd(),decodeURIComponent(new URL(r.request().url()).pathname.replace('/zad-store/','')));if(!fs.existsSync(f)||fs.statSync(f).isDirectory()){const g=path.join(f,'index.html');if(fs.existsSync(g)&&fs.statSync(f).isDirectory())return r.fulfill({status:200,contentType:'text/html; charset=utf-8',body:fs.readFileSync(g)});return r.fulfill({status:404,body:''})}r.fulfill({status:200,contentType:MIME[path.extname(f)]||'application/octet-stream',body:fs.readFileSync(f)})});

 const B='http://localhost:8765/';
 p.on('pageerror',e=>jserr.push(String(e)+' @ '+p.url()+' '+String(e.stack).split('\n').slice(1,3).join(' ')));
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const open=async(u)=>{await p.goto(B+u);await p.waitForTimeout(500)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(150)};
 const goP=async()=>{await p.goto(B+'packs/');await p.waitForFunction(()=>!document.querySelector('#pkres .pk-sk'));await p.waitForTimeout(100)};
 const goV=async(s)=>{await p.goto(B+'packs/view/?p='+s);await p.waitForFunction(()=>!document.querySelector('#pkbody .pk-sk'));await p.waitForTimeout(100)};
 const titles=()=>p.$$eval('#pkres .pk-c h3',e=>e.map(x=>x.textContent.trim()));
 const kid=(o)=>p.evaluate(([LK,o])=>{const D=JSON.parse(localStorage.getItem(LK)||'null')||{cur:'k1',kids:{k1:{}}};Object.assign(D.kids[D.cur],o);localStorage.setItem(LK,JSON.stringify(D))},[LK,o]);
 const store=()=>p.evaluate((k)=>JSON.parse(localStorage.getItem(k)||'null'),PKK);
 const startsN=()=>posts.filter(x=>x[0]==='pack_start').length;
 const L=(t)=>p.$$eval(t,e=>e.map(x=>x.textContent.trim()));
 const SEC=async(id)=>p.$eval('#'+id,e=>e.closest('section').textContent).catch(()=>null);
 // 1) الصفحة الرئيسية: العنوان والوصف والتصنيف
 await goP();
 const h1=await p.textContent('h1'),ds=await p.textContent('.zph p');
 if(!h1.includes('الحزم التعليمية الجاهزة'))E(W+' العنوان '+h1);
 if(!ds.includes('اختر حزمة تعليمية مناسبة لعمر طفلك أو صفه، وابدأ رحلة تعلم منظمة تجمع بين الأنشطة والقصص والبطاقات وأوراق العمل.'))E(W+' الوصف '+ds);
 if(!(await p.textContent('.zbc')).includes('المكتبة التعليمية'))E(W+' مسار التنقل');
 let all=await p.$$eval('#pkres .pk-c h3',e=>[...new Set(e.map(x=>x.textContent.trim()))]);
 if(all.length!==2||!all.includes('حزمة الحروف التجريبية')||!all.includes('حزمة الجمع التجريبية'))E(W+' الحزم الظاهرة '+all);
 for(const bad of ['حزمة ناقصة','حزمة مستوى خاطئ','مسودة'])if(all.includes(bad))E(W+' ظهرت حزمة غير جاهزة/غير منشورة: '+bad);
 const g5=await SEC('pk-a2');if(!g5||!g5.includes('5 سنوات')||g5.includes('الجمع التجريبية'))E(W+' تصنيف الطفولة المبكرة '+g5);
 const gp=await SEC('pk-g1');if(!gp||!gp.includes('الصف الأول')||gp.includes('الحروف التجريبية'))E(W+' تصنيف الابتدائية '+gp);
 if(!(await p.textContent('#pkres')).includes('اختر عمره'))E(W+' تلميح اختيار العمر');
 const pops=await SEC('pk-pop');if(!pops||!pops.includes('الحروف التجريبية')||pops.includes('الجمع التجريبية'))E(W+' الأكثر استخدامًا '+pops);
 const nw=await SEC('pk-new');if(!nw||!nw.includes('الحروف التجريبية')||nw.includes('الجمع التجريبية'))E(W+' الحزم الجديدة');
 const fr=await SEC('pk-free'),pd=await SEC('pk-paid');if(!fr||!fr.includes('الحروف')||fr.includes('الجمع')||!pd||!pd.includes('الجمع')||pd.includes('الحروف'))E(W+' مجانية/مدفوعة');
 if(await SEC('pk-sug'))E(W+' مقترحة بلا عمر محدد');if(await SEC('pk-started'))E(W+' قسم متابعة بلا تقدم');if(await SEC('pk-fav'))E(W+' مفضلة بلا حفظ');
 const card=await p.$eval('.pk-c[data-s="pk-letters"]',c=>({img:!!c.querySelector('img'),lv:c.querySelector('.pk-lvb').textContent,mt:c.querySelector('.pk-mt').textContent,go:c.querySelector('.pk-go').textContent.trim(),href:c.querySelector('.pk-go').getAttribute('href')}));
 if(!card.img||card.lv!=='5 سنوات'||!card.mt.includes('٦ موارد')||!card.mt.includes('مجانية')||card.go!=='ابدأ الحزمة'||!card.href.includes('view/?p=pk-letters'))E(W+' بطاقة الحزمة '+JSON.stringify(card));
 await ov('packs');
 // مقترحة حسب عمر الطفل
 await kid({age:5});await goP();let sg=await SEC('pk-sug');if(!sg||!sg.includes('الحروف التجريبية')||sg.includes('الجمع التجريبية'))E(W+' مقترحة لعمر ٥ '+sg);
 await kid({age:7});await goP();sg=await SEC('pk-sug');if(!sg||!sg.includes('الجمع التجريبية')||sg.includes('الحروف التجريبية'))E(W+' مقترحة للصف الأول '+sg);
 await kid({age:5});
 // 2) البحث والتصفية
 await goP();
 const F=async(sel,val)=>{await p.selectOption(sel,val);await p.waitForTimeout(120);return [...new Set(await titles())]};
 let t=await F('#pklv','g1');if(t.join()!=='حزمة الجمع التجريبية')E(W+' فلتر الصف '+t);await F('#pklv','');
 t=await F('#pklv','a5');if(t.join()!=='حزمة الحروف التجريبية')E(W+' فلتر العمر '+t);await F('#pklv','');
 t=await F('#pkdom','math');if(t.join()!=='حزمة الجمع التجريبية')E(W+' فلتر المجال '+t);await F('#pkdom','');
 t=await F('#pkct','quiz');if(t.join()!=='حزمة الجمع التجريبية')E(W+' فلتر نوع الموارد '+t);await F('#pkct','');
 t=await F('#pkacc','free');if(t.join()!=='حزمة الحروف التجريبية')E(W+' فلتر مجانية '+t);
 t=await F('#pkacc','paid');if(t.join()!=='حزمة الجمع التجريبية')E(W+' فلتر مدفوعة '+t);await F('#pkacc','');
 await p.fill('#pkq','حروف');await p.waitForTimeout(150);t=[...new Set(await titles())];if(t.join()!=='حزمة الحروف التجريبية')E(W+' بحث حروف '+t);
 await p.fill('#pkq','جمع');await p.waitForTimeout(150);t=[...new Set(await titles())];if(t.join()!=='حزمة الجمع التجريبية')E(W+' بحث جمع '+t);
 await p.fill('#pkq','زززز');await p.waitForTimeout(150);if(!(await p.textContent('#pkres')).includes('لا توجد حزم تطابق'))E(W+' رسالة لا نتائج');
 await ck('#pkres [data-clear]');if([...new Set(await titles())].length!==2)E(W+' مسح الفلاتر');
 await p.check('#pkst');await p.waitForTimeout(120);if(!(await p.textContent('#pkres')).includes('لا توجد حزم تطابق'))E(W+' فلتر بدأتها بلا تقدم');await p.uncheck('#pkst');
 // 3) صفحة الحزمة
 await goV('pk-letters');
 const rows=await L('.pk-r h3');const exp=['درس مرئي: الأشكال','قصة الحروف','نصل الحرف بصورته ١','نزرع حبة فول','حروف الهجاء للتلوين','ورقة عمل الأشكال'];
 if(rows.join('|')!==exp.join('|'))E(W+' ترتيب الموارد '+rows.join('|'));
 const meta=await p.textContent('.pk-hero');if(!meta.includes('٦ موارد')||!meta.includes('مجانية')||!meta.includes('5 سنوات')||!meta.includes('الحروف')||!meta.includes('المهارات التي تنمّيها'))E(W+' بيانات الحزمة '+meta);
 if(meta.includes('المدة التقديرية'))E(W+' مدة تقديرية غير موثوقة');
 const mb=await L('.pk-main>*');if(!mb.includes('ابدأ الحزمة')||!mb.some(x=>x.includes('إضافة إلى المفضلة'))||!mb.some(x=>x.includes('إضافة إلى الخطة الأسبوعية')))E(W+' أزرار الحزمة '+mb);
 if(mb.some(x=>x.startsWith('متابعة')))E(W+' زر متابعة بلا تقدم');
 let pgx;const pg=await p.textContent('.pk-prog');if(!pg.includes('فتحتَ ٠ من ٦')||!pg.includes('٠٪')||!pg.includes('لا يُعدّ إكمالًا'))E(W+' تقدم صفري '+pg);
 if(await p.$('.pk-r .ra button[data-a=plan][data-k^="lib:"]'))E(W+' زر خطة لملف مكتبة');
 if(!(await p.$('.pk-r .ra button[data-a=plan][data-k="proj:proj-1"]')))E(W+' زر خطة للمشروع');
 await ov('view');
 await goV('pk-draft');if(!(await p.textContent('#pkbody')).includes('غير متاحة'))E(W+' مسودة تظهر');
 await goV('pk-thin');if(!(await p.textContent('#pkbody')).includes('غير جاهزة'))E(W+' حزمة ناقصة تظهر جاهزة');
 await goV('pk-mis');if(!(await p.textContent('#pkbody')).includes('غير جاهزة'))E(W+' موارد بمستوى خاطئ');
 await goV('none-x');if(!(await p.textContent('#pkbody')).includes('غير متاحة'))E(W+' حزمة غير موجودة');
 await p.goto(B+'packs/view/?p=%3Cscript%3E');await p.waitForTimeout(300);if(!(await p.textContent('#pkbody')).includes('لم نجد'))E(W+' رابط غير صالح');
 // المدفوع: معاينة فقط ولا رابط ملف
 await goV('pk-add');const prow=await p.$eval('.pk-r[data-k="lib:s-p3"]',r=>({t:r.textContent,href:r.querySelector('.ra a').getAttribute('href')}));
 if(!prow.t.includes('مدفوع')||!prow.t.includes('معاينة')||!prow.href.includes('library/')||/private|\.pdf/.test(prow.href))E(W+' مورد مدفوع '+JSON.stringify(prow));
 if((await p.content()).includes('private:'))E(W+' ظهر رابط ملف خاص');
 if(!(await p.textContent('.pk-hero')).includes('تتضمن ١ مدفوعة من ٤'))E(W+' حالة الوصول');
 // 4) البدء والتنقل بين الموارد وتتبع الفتح
 await goV('pk-letters');const n0=startsN();
 await p.click('.pk-main .pk-go');await p.waitForURL(/videos\/play\/\?s=vid-1&pk=pk-letters&pi=1/);await p.waitForSelector('.zpk-bar');
 let bt=await p.textContent('.zpk-bar');if(!bt.includes('حزمة الحروف التجريبية')||!bt.includes('المورد ١ من ٦'))E(W+' شريط الحزمة '+bt);
 if(await p.$('.zpk-bar a.zpk-p'))E(W+' السابق متاح في أول مورد');
 const nx=await p.$eval('.zpk-bar a.zpk-n',a=>a.getAttribute('href'));if(!nx.includes('stories/read/?s=story-x&pk=pk-letters&pi=2'))E(W+' رابط التالي '+nx);
 if(!(await p.$('.zpk-bar a.zpk-h[href*="packs/view/?p=pk-letters"]'))||!(await p.$('.zpk-bar a.zpk-l[href$="library/"]')))E(W+' روابط الرجوع');
 await ov('bar-vid');
 await p.click('.zpk-bar a.zpk-n');await p.waitForURL(/stories\/read\/\?s=story-x&pk=pk-letters&pi=2/);await p.waitForSelector('.zpk-bar');
 bt=await p.textContent('.zpk-bar');if(!bt.includes('المورد ٢ من ٦'))E(W+' شريط المورد الثاني '+bt);if(!(await p.$('.zpk-bar a.zpk-p')))E(W+' لا زر سابق');
 await p.click('.zpk-bar a.zpk-p');await p.waitForURL(/videos\/play\/\?s=vid-1&pk=pk-letters&pi=1/);
 let s=await store();const rec=s&&s.kids&&Object.values(s.kids)[0].p['pk-letters'];
 if(!rec||!rec.o['vid:vid-1']||!rec.o['stories:story-x']||Object.keys(rec.o).length!==2)E(W+' سجل الفتح '+JSON.stringify(rec));
 if(startsN()-n0!==1)E(W+' عدّاد البدء يجب أن يُرسل مرة واحدة: '+(startsN()-n0));
 if(/title|name|email/.test(JSON.stringify(s)))E(W+' بيانات زائدة في مخزن الحزم');
 const dn=await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK)||'null');const k=D&&D.kids&&D.kids[D.cur];return k?JSON.stringify([k.acts,k.bank&&k.bank.done,k.proj&&k.proj.done,k.vid&&k.vid.done,k.pf&&k.pf.certs]):''},LK);
 if(/\{"[^}]+/.test(dn.replace(/null|\[\]|\{\}/g,'')))E(W+' فتح موارد الحزمة سجّل إنجازًا '+dn);
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));delete D.kids[D.cur].stories;localStorage.setItem(LK,JSON.stringify(D))},LK);
 await goV('pk-letters');pgx=await p.textContent('.pk-prog');if(!pgx.includes('فتحتَ ٢ من ٦')||!pgx.includes('لم تُفتح بعد: ٤')||!pgx.includes('آخر استخدام'))E(W+' تقدّم بعد فتح موردين '+pgx);
 let main=await L('.pk-main>*');if(!main.some(x=>x.includes('متابعة: نصل الحرف بصورته ١')))E(W+' زر المتابعة يجب أن يشير للمورد التالي '+main);
 // ملف مكتبة داخل حزمة: الشريط يعمل في صفحة المكتبة
 const lh=await p.$eval('.pk-r[data-k="lib:s-p1"] .ra a',a=>a.getAttribute('href'));if(!/library\/\?pk=pk-letters&pi=5#f=s-p1/.test(lh))E(W+' رابط ملف المكتبة '+lh);
 await p.click('.pk-r[data-k="lib:s-p1"] .ra a');await p.waitForURL(/library\/\?pk=pk-letters&pi=5/);await p.waitForSelector('.zpk-bar');if(!(await p.textContent('.zpk-bar')).includes('المورد ٥ من ٦'))E(W+' شريط في المكتبة');
 // 5) الإكمال الفعلي يختلف عن الفتح
 await kid({bank:{done:{'bank-y':{d:1}},started:{}}});await goV('pk-letters');
 pgx=await p.textContent('.pk-prog');if(!pgx.includes('أكملتَ ١ من ٤ موارد يمكن تتبّع إكمالها')||!pgx.includes('٢٥٪'))E(W+' نسبة الإكمال '+pgx);
 const st3=await p.$eval('.pk-r[data-k="bank:bank-y"] .st',e=>e.textContent),st1=await p.$eval('.pk-r[data-k="vid:vid-1"] .st',e=>e.textContent);if(!st3.includes('أكملتَها')||st1.includes('أكملتَها'))E(W+' حالات الموارد '+st3+' | '+st1);
 if(!(await p.$eval('.pk-r[data-k="lib:s-p1"] .st',e=>e.textContent)).includes('لا يتوفر تتبع'))E(W+' ملف مكتبة بلا ملاحظة تتبع');
 main=await L('.pk-main>*');if(!main.some(x=>x.includes('متابعة: نزرع حبة فول')))E(W+' المتابعة بعد الإكمال '+main);
 // 6) المفضلة
 await ck('.pk-main button[data-a=fav]');if(!(await p.evaluate(()=>ZSAVED.has('pack:pk-letters'))))E(W+' حفظ الحزمة');
 await goP();const fv=await SEC('pk-fav');if(!fv||!fv.includes('الحروف التجريبية'))E(W+' قسم المفضلة');
 await open('saved/');await p.waitForFunction(()=>!document.querySelector('#szres .sz-sk')&&document.querySelector('.fzcard,.fzempty'));const sv=await p.textContent('#szres');
 if(!sv.includes('حزمة الحروف التجريبية')||!sv.includes('حزم تعليمية'))E(W+' الحزمة في محتواي المحفوظ ');
 const shr=await p.$eval('#szres .fzcard .ac a',a=>a.getAttribute('href'));if(!shr.includes('packs/view/?p=pk-letters'))E(W+' رابط الحزمة المحفوظة '+shr);
 await goP();await ck('.pk-c[data-s="pk-letters"] [data-fav]');if(await p.evaluate(()=>ZSAVED.has('pack:pk-letters')))E(W+' إزالة المفضلة');
 // 7) إضافة مورد من الحزمة إلى الخطة
 await goV('pk-letters');await ck('.pk-r[data-k="proj:proj-1"] [data-a=plan]');await ck('.pk-r[data-k="proj:proj-1"] [data-a=planok]');
 let pm=await p.textContent('.pk-r[data-k="proj:proj-1"] [data-r=msg]');if(!pm.includes('تمت الإضافة'))E(W+' إضافة للخطة '+pm);
 await ck('.pk-r[data-k="proj:proj-1"] [data-a=planok]');pm=await p.textContent('.pk-r[data-k="proj:proj-1"] [data-r=msg]');if(!pm.includes('مضاف مسبقًا'))E(W+' تكرار الخطة '+pm);
 const pl=await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));const k=D.kids[D.cur];return Object.values(k.plan.weeks).flatMap(w=>w.items).map(i=>i.key+':'+i.st)},LK);if(pl.join()!=='proj:proj-1:todo')E(W+' عنصر الخطة '+pl);
 await ck('.pk-main button[data-a=plannext]');if(!(await p.textContent('#pkplan')).includes('سيُضاف'))E(W+' إضافة المورد التالي للخطة');
 // 8) فصل الأطفال ومسح التقدم
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.kids.k2={name:'أخت',age:5};D.kids.k1=D.kids.k1||D.kids[D.cur];D.cur='k2';localStorage.setItem(LK,JSON.stringify(D))},LK);
 await goV('pk-letters');pgx=await p.textContent('.pk-prog');if(!pgx.includes('فتحتَ ٠ من ٦'))E(W+' ظهر تقدم طفل في ملف آخر '+pgx);
 if((await L('.pk-main>*')).some(x=>x.startsWith('متابعة')))E(W+' متابعة لطفل بلا تقدم');
 await p.evaluate((LK)=>{const D=JSON.parse(localStorage.getItem(LK));D.cur='k1';localStorage.setItem(LK,JSON.stringify(D))},LK);
 await goV('pk-letters');await ck('[data-a=reset]');if(!(await p.textContent('.pk-prog')).includes('فتحتَ ١ من ٦'))E(W+' مسح التقدم '+await p.textContent('.pk-prog'));
 // 9) فشل التحميل
 failPacks=true;await goP();if(!(await p.textContent('#pkres')).includes('تعذّر تحميل'))E(W+' فشل تحميل الحزم');failPacks=false;
 failProd=true;await goP();if(!(await p.textContent('#pkres')).includes('تعذّر تحميل بعض'))E(W+' فشل تحميل المكتبة بلا تنبيه');failProd=false;
 // 10) روابط غير مكسورة وتطابق الفئات
 await goP();const hr=await p.$$eval('#pkres a[href],.zph a[href]',a=>[...new Set(a.map(x=>x.getAttribute('href')))]);
 for(const h of hr){if(/^(https?:|#)/.test(h))continue;let f=path.join(process.cwd(),'packs',h.split('#')[0].split('?')[0]);if(!fs.existsSync(f))E(W+' رابط مكسور '+h);else if(fs.statSync(f).isDirectory()&&!fs.existsSync(path.join(f,'index.html')))E(W+' رابط بلا صفحة '+h)}
 const lvs=PK_ALL.flatMap(x=>x.levels);if(lvs.some(l=>!/^(a2|a3|a4|a5|a6|g1|g2|g3|g4)$/.test(l)))E(W+' مستوى خارج النطاق');
 await ov('final');
 const je=jserr.filter(x=>!/videos\/vid\.js|stories\/read/.test(x));/* مشغّل الفيديو لا يجد مشاهد في بيانات المحاكاة؛ ليس من الحزم */ if(je.length)E(W+' أخطاء JS '+je.slice(0,3));
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
