// NODE_PATH=$(npm root -g) node tools/content/skp/test_skp.js  (خادم 8765 من جذر المستودع)
const {chromium}=require('playwright');
const CORS={'access-control-allow-origin':'*'};
const NOW=Date.parse('2026-11-26T12:00:00Z');
const DOM=[{slug:'math',name:'مهارات الرياضيات',icon:'numbers.svg',color:'#2d7fd0'},{slug:'arabic',name:'مهارات اللغة العربية',icon:'book.svg',color:'#6b3fd4'}];
const SKS=[
 {id:'s1',slug:'m-count',domain:'math',name:'العد',descr:'يعد الطفل الأشياء.',levels:['a4','a5','a6','g1'],goal:'يعد الطفل الأشياء ويعرف عددها.',goal_kid:'أعد الأشياء.',examples:['يعد الأشكال في الصورة','يعد مرات إنجاز عادته'],min_proj:2},
 {id:'s2',slug:'ar-letters',domain:'arabic',name:'التعرف على الحروف',descr:'',levels:['a3','a4','a5'],goal:'يتعرف الطفل على شكل الحرف.',goal_kid:'أتعرف على الحروف.',examples:['يشير إلى حرف اسمه'],min_proj:2},
 {id:'s9',slug:'bad-high',domain:'math',name:'مهارة صف خامس',descr:'',levels:['g4','g5'],goal:'هدف خارج النطاق للاختبار.',goal_kid:'خارج النطاق',examples:[],min_proj:2}
];
const PJS=[{slug:'pj_p1',title:'لوحة الأرقام',icon:null,cat:'math',levels:['a5','g1'],goal:'عد'},{slug:'pj_p2',title:'جدول العد',icon:null,cat:'math',levels:['a5','g1'],goal:'عد'}];
const PL=[{p:'pj_p1',s:'s1',r:'main',g:'يعد الأشياء في اللوحة',o:0},{p:'pj_p2',s:'s1',r:'support',g:'يعد البيانات المسجلة',o:1},{p:'pj_p1',s:'s2',r:'support',g:'يقرأ أرقام اللوحة',o:0}];
const LK=[{s:'s1',k:'proj:pj_res1',r:'main',g:'practice',o:0},{s:'s1',k:'proj:pj_res2',r:'main',g:'practice',o:1}];
const RES=[{slug:'pj_res1',title:'مشروع تدريبي على العد',icon:'i_star',skill:'العد',subject:'رياضيات',cat:'math',levels:['a5','g1'],created_at:'2026-10-01T00:00:00Z'},{slug:'pj_res2',title:'نشاط للصف الأول فقط',icon:'i_star',skill:'العد',subject:'رياضيات',cat:'math',levels:['g1'],created_at:'2026-10-01T00:00:00Z'}];
const PUB={domains:DOM,skills:SKS,projects:PJS,plinks:PL,links:LK};
(async()=>{const b=await chromium.launch();const errs=[];const ck=(c,m)=>{if(!c)errs.push(m)};
for(const vp of [{width:390,height:800},{width:768,height:900},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(6000);
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('request',r=>{if(/skp_(admin|info_|link_)/.test(r.url()))errs.push('public page called admin rpc '+r.url())});
let pub=PUB,fail=false;
await p.route('**/rest/v1/rpc/skp_public',r=>fail?r.fulfill({status:500,json:{},headers:CORS}):r.fulfill({json:pub,headers:CORS}));
await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:RES,headers:CORS}));
await p.route(/rest\/v1\/(?!rpc\/skp_public|proj_items)/,r=>r.fulfill({json:[],headers:CORS}));
const B='http://localhost:8765/skp/';
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
const T=()=>p.textContent('#skbody');
const seed=(done,skp)=>p.evaluate(([d,s,n])=>{localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{name:'ليلى',proj:{done:Object.fromEntries(d.map(x=>[x,{d:1,t:n}]))}},k2:{name:'سالم',proj:{done:{}}}}}));if(s)localStorage.setItem('zad-skp-v1',JSON.stringify(s));else localStorage.removeItem('zad-skp-v1')},[done,skp||null,NOW]);
// ===== الرئيسية
await p.goto(B);await p.waitForSelector('.skpc');await ov('hub');
ck(await p.locator('.skpc').count()===2,'hub 2 cards (bad-high hidden) '+await p.locator('.skpc').count());
let t=await T();ck(!/مهارة صف خامس|الصف الخامس|g5/.test(t),'nothing above grade 4');
ck(t.includes('عرض المشاريع')&&t.includes('عرض الأنشطة التدريبية'),'card buttons');
ck(await p.locator('.skback[href$="library/"]').count()>=1,'back to library');
ck(await p.locator('.skpc img.ic').count()===2,'card illustrations');
ck(t.includes('لوحة الأرقام'),'card shows example project');
ck(t.includes('لم تبدأ بعد'),'initial status none');
// تصنيف بالعمر والصف
await p.selectOption('#fage','a3');await p.waitForTimeout(60);ck(await p.locator('.skpc').count()===1&&(await T()).includes('التعرف على الحروف'),'age a3 only letters');
await p.selectOption('#fgr','g1');await p.waitForTimeout(60);ck(await p.locator('.skpc').count()===1&&(await T()).includes('العد'),'grade g1 only count');
await p.selectOption('#fgr','');await p.waitForTimeout(60);ck(await p.locator('.skpc').count()===2,'clear level shows both');
await p.selectOption('#fpj','pj_p2');await p.waitForTimeout(60);ck(await p.locator('.skpc').count()===1&&(await T()).includes('العد'),'filter by linked project');
await p.selectOption('#fpj','');await p.waitForTimeout(60);
await p.click('.skpdoms button[data-d="arabic"]');await p.waitForTimeout(60);ck(await p.locator('.skpc').count()===1,'domain chip');
await p.click('.skpdoms button[data-d="arabic"]');await p.waitForTimeout(60);
// ===== صفحة المهارة
await p.click('.skpc:has-text("العد") a:has-text("عرض المشاريع")');await p.waitForSelector('.skphead');await ov('skill');
t=await T();ck(t.includes('يعد الطفل الأشياء ويعرف عددها.')&&t.includes('أعد الأشياء.'),'goal + kid goal');
ck(t.includes('يعد الأشكال في الصورة'),'examples');
ck(await p.locator('.skpproj').count()===2,'2 linked projects');
ck((await p.textContent('.skpproj:has-text("لوحة الأرقام")')).includes('مهارة أساسية')&&(await p.textContent('.skpproj:has-text("جدول العد")')).includes('مهارة مساندة'),'main vs support');
ck((await p.textContent('.skpproj:has-text("لوحة الأرقام")')).includes('يعد الأشياء في اللوحة'),'project-specific goal');
ck(await p.locator('a[href*="projects/play/?s=pj_p1"]').count()===1,'project link');
ck(await p.locator('#skpacts .skprow').count()===2,'2 activities (no lv filter)');
ck(await p.locator('#skpacts a[href*="projects/play/?s=pj_res1"]').count()===1,'activity link resolves');
ck(!/أتقن المهارة|أتقنت المهارة/.test(t)&&t.includes('الفرق بين الممارسة والإتقان'),'practice vs mastery explained, no mastery claim');
await p.selectOption('#flv','a5');await p.waitForTimeout(60);ck(await p.locator('#skpacts .skprow').count()===1,'activity filtered by level (g1-only hidden)');
await p.selectOption('#flv','');await p.waitForTimeout(60);
// الربط الصحيح: مهارة الحروف ترتبط بمشروع واحد فقط
await p.goto(B+'#/s/ar-letters');await p.waitForSelector('.skphead');
ck(await p.locator('.skpproj').count()===1&&(await p.textContent('.skpproj')).includes('لوحة الأرقام')&&!(await T()).includes('جدول العد'),'letters linked only to pj_p1');
ck((await T()).includes('لا توجد أنشطة منشورة'),'no activities message honest');
// صفحة غير موجودة
await p.goto(B+'#/s/nope');await p.waitForSelector('.fzempty');ck((await T()).includes('لم نجد هذه المهارة'),'unknown skill');
// ===== حالة الممارسة من بيانات حقيقية
await seed([]);await p.goto(B+'#/s/m-count');await p.reload();await p.waitForSelector('.skphead');
ck((await T()).includes('لم تبدأ بعد'),'none without data');
await seed(['pj_p1']);await p.reload();await p.waitForSelector('.skphead');
ck((await p.textContent('.skpbox:has-text("حالة ممارسة") .lvl'))==='بدأت التدريب','one project -> بدأت التدريب');
ck((await T()).includes('أكملته في'),'completion date from real record');
// تسجيل نشاط جديد يحدّث الحالة (عتبة 2)
await p.click('[data-act="proj:pj_res1"]');await p.waitForTimeout(80);
ck((await p.textContent('.skpbox:has-text("حالة ممارسة") .lvl'))==='يواصل التعلم','new activity updates status -> يواصل التعلم');
ck((await p.locator('[data-act="proj:pj_res1"]').getAttribute('aria-pressed'))==='true','activity pressed');
// حفظ واستعادة
await p.reload();await p.waitForSelector('.skphead');
ck((await p.textContent('.skpbox:has-text("حالة ممارسة") .lvl'))==='يواصل التعلم','persisted after reload');
const sv=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-skp-v1')));ck(sv.kids.k1.acts['proj:pj_res1'].s==='m-count','stored with skill slug');
await p.click('[data-act="proj:pj_res1"]');await p.waitForTimeout(80);ck((await p.textContent('.skpbox:has-text("حالة ممارسة") .lvl'))==='بدأت التدريب','undo activity returns status');
// تدرب أكثر
await p.click('[data-more="m-count"]');await p.waitForTimeout(80);ck((await p.textContent('.skpbox:has-text("حالة ممارسة") .lvl'))==='تدرب أكثر','mark more');
// طفل آخر لا يتأثر
await p.goto(B+'#/me');await p.waitForSelector('.evtabs');await p.selectOption('#fkid','k2');await p.waitForTimeout(80);
ck((await T()).includes('لم تُسجَّل ممارسة بعد'),'other kid has none (isolated)');
await p.selectOption('#fkid','k1');await p.waitForTimeout(80);
// ===== عرض الطفل
t=await T();ck(t.includes('مارست هذه المهارة: العد')&&t.includes('لوحة الأرقام')&&t.includes('تدرب على هذه المهارة'),'child view real data');
ck(!/أتقنت|درجة|ترتيبك|أفضل من/.test(t.replace('أتقنت كل مهاراته','')),'child view no mastery/grades/ranking');
ck(t.includes('يمكنك التدرب عليها لاحقًا')&&t.includes('التعرف على الحروف'),'later skills suggested');
await ov('me');
// ===== لوحة ولي الأمر
await p.goto(B+'#/parent');await p.waitForSelector('.skpbox');t=await T();
ck(t.includes('العد')&&t.includes('لوحة الأرقام')&&t.includes('مهارات تحتاج إلى تدريب إضافي'),'parent shows practiced + need');
ck(await p.locator('.skpbox a[href*="projects/play/?s=pj_res1"],.skpbox a[href*="pj_p2"]').count()>=1,'parent suggestions link real items');
ck(!/أتقن|درجة|ترتيب الأطفال|مقارنة بين الأطفال/.test(t.replace('ولا تقارن الطفل بغيره','').replace('لا درجات ولا ترتيب ولا مقارنة','')),'parent no ranking/grades');
await ov('parent');
// وسم من لوحة مراجعات التقييم (zad-eval-v1.need) يُحتسب
await seed([],null);await p.evaluate(()=>localStorage.setItem('zad-eval-v1',JSON.stringify({kids:{k1:{ev:{},need:{'ar-letters':true},again:{}}}})));await p.goto(B+'#/s/ar-letters');await p.reload();await p.waitForSelector('.skphead');
ck((await p.textContent('.skpbox:has-text("حالة ممارسة") .lvl'))==='تدرب أكثر','eval need flag counted');
await p.evaluate(()=>localStorage.removeItem('zad-eval-v1'));
// ===== حالة فارغة وخطأ
pub={domains:DOM,skills:[],projects:[],plinks:[],links:[]};await p.goto(B);await p.reload();await p.waitForSelector('.fzempty');ck((await T()).includes('لم تُنشر مهارات'),'empty state honest');
fail=true;await p.reload();await p.waitForSelector('.fzempty');ck((await T()).includes('تعذّر تحميل'),'error state');
await ctx.close();}
await b.close();console.log(errs.length?'FAIL\n'+[...new Set(errs)].join('\n'):'PASS test_skp');process.exit(errs.length?1:0)})();
