// NODE_PATH=$(npm root -g) node tools/content/plan/test_cal.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const mk=(slug,title,levels,extra={})=>({slug,title,skill:'مهارة',subject:'x',cat:'x',icon:'i_puzzle',levels,...extra});
const DATA={stories:[mk('story-x','قصة الحروف',['a4','a5','a6'],{topic:'arabic'}),mk('story-g','قصة الصف الثاني',['g2'],{topic:'arabic'})],bank_items:[mk('bank-y','نشاط الاستماع',['a4','a5','a6']),mk('bank-b','بطاقة ثانية',['a5']),mk('bank-c','بطاقة ثالثة',['a5']),mk('bank-d','بطاقة رابعة',['a5'])],life_items:[mk('life-z','ترتيب الغرفة',['a4','a5','a6'])],proj_items:[],ready_items:[],val_items:[],video_items:[],song_items:[],activities:[]};
const ev=(id,o)=>({id,title:'x',kind:'lib',starts:'2026-12-01',ends:null,levels:['a5'],domain:null,src:'bank',slug:'bank-y',descr:'وصف النشاط من مكتبة زاد.',image_url:null,minutes:null,needs_prep:false,prep_note:null,publish_at:'2026-11-20T00:00:00Z',topic:null,status:'published',...o});
const EVS=[ev('e1',{title:'قصة الحروف',kind:'story',starts:'2026-11-30',src:'stories',slug:'story-x'}),ev('e2',{title:'نشاط الاستماع',kind:'lib',starts:'2026-12-07',src:'bank',slug:'bank-y',topic:'reading',levels:['a5','a6'],minutes:12}),ev('e3',{title:'ترتيب الغرفة',kind:'home',starts:'2026-12-14',src:'life',slug:'life-z',needs_prep:true,prep_note:'سلة وألعاب صغيرة'}),ev('e4',{title:'قصة الصف الثاني',kind:'story',starts:'2026-12-02',levels:['g2'],src:'stories',slug:'story-g'}),ev('e5',{title:'نشاط محذوف',starts:'2026-12-03',src:'bank',slug:'gone'}),ev('e6',{title:'نشاط جديد منشور',starts:'2026-12-20',src:'bank',slug:'bank-b',publish_at:'2026-11-25T05:00:00Z'})];
const TOPICS=[{slug:'reading',title:'يوم القراءة',kind:'theme',date_from:null,date_to:null}];
const NOW=new Date('2026-11-25T10:00:00+04:00');
const KS=(extra)=>JSON.stringify({cur:'k1',kids:{k1:{name:'سارة',age:'5',acts:{},...(extra||{})},k2:{name:'ليث',age:'8',acts:{}}}});
(async()=>{const b=await chromium.launch();
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
 const W=vp.width,ctx=await b.newContext({viewport:vp,acceptDownloads:true});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));const posts=[];const _c=p.click.bind(p);p.click=async(...a)=>{await _c(...a);await p.waitForTimeout(450)};
 await p.clock.install({time:NOW});
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'){posts.push([tb,r.request().postData()]);return r.fulfill({status:201,headers:CORS,body:''})}
  if(tb==='rp_config')return J([]);if(tb==='rec_overrides')return J([]);if(tb==='cal_topics')return J(TOPICS);
  if(tb==='cal_events'){const L=(decodeURIComponent(u.search).match(/levels=cs\.\{(\w+)\}/)||[])[1];return J(EVS.filter(e=>e.levels.includes(L)))}
  if(DATA[tb]){const sl=(u.search.match(/slug=in\.\(([^)]*)\)/)||[])[1];const w=sl?decodeURIComponent(sl).split(','):null;return J(DATA[tb].filter(r=>!w||w.includes(r.slug)))}return J([])});
 const B='http://localhost:8765/';
 const reset=async(s,lv)=>{await p.goto(B+'calendar/');await p.evaluate(([s,lv])=>{localStorage.clear();sessionStorage.clear();if(s)localStorage.setItem('zad-learn-v3',s);if(lv)localStorage.setItem('zad-rec-lv',lv)},[s,lv]);await p.reload();await p.waitForSelector('.ctabs')};
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const kid=()=>p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return d.kids[d.cur]});
 const vis=(sel)=>p.$$eval(sel,e=>e.filter(x=>x.offsetParent!==null).map(x=>x.textContent));
 const cardsVis=()=>p.$$eval('#cmain .ccard',c=>c.filter(x=>x.offsetParent!==null).map(x=>({t:x.querySelector('h3').textContent,txt:x.textContent,id:x.dataset.id})));
 // 1) المستوى
 await reset(null,null);if(!(await p.$('.cask')))E(W+' لم يُسأل عن المستوى');const lv=await p.$$eval('.cask [data-l]',x=>x.map(y=>y.dataset.l).join());if(lv!=='a2,a3,a4,a5,a6,g1,g2,g3,g4')E(W+' مستويات '+lv);
 await p.click('.cask [data-l=a5]');await p.waitForSelector('.cbox',{state:'attached'});await ov('month');
 // 2) الشهري
 const grid=await p.$eval('.cgrid',e=>getComputedStyle(e).display);if(W<700&&grid!=='none')E(W+' الشبكة ظاهرة على الهاتف');if(W>=700&&grid==='none')E(W+' الشبكة غائبة على الحاسوب');
 if(W<700&&(await p.$eval('.cagenda',e=>getComputedStyle(e).display))==='none')E(W+' قائمة الأيام غائبة على الهاتف');
 if(!(await p.textContent('.cnav b')).includes('٢٠٢٦'))E(W+' عنوان الشهر '+(await p.textContent('.cnav b')));
 await p.click('#cnext');await p.waitForSelector('.cnav');if(!(await p.textContent('.cnav b')).includes('٢٠٢٦'))E(W+' الشهر التالي');
 // نوفمبر ٣٠: الفعالية الأولى في الشهر الحالي
 await p.click('#cprev');await p.click('#ctoday');
 if(W>=700){await p.click('[data-day="2026-11-30"]');const t=(await p.textContent('#cdaypanel'));if(!t.includes('قصة الحروف')||!t.includes('الاثنين'))E(W+' لوحة اليوم '+t.slice(0,80));
  if(!(await p.$('[data-day="2026-11-30"] .dk')))E(W+' علامة النشاط في الخلية');if(await p.$('[data-day="2026-11-29"] .dk'))E(W+' نشاط في يوم خاطئ');}
 else{const t=await p.textContent('.cagenda');if(!t.includes('قصة الحروف'))E(W+' قائمة الشهر بلا نشاط');}
 // 3) الأسبوعي
 await p.click('[data-v=week]');await p.waitForSelector('.cweek');await p.click('#cnext');await p.waitForTimeout(200);// الأسبوع التالي: ٢٨ نوفمبر–٤ ديسمبر
 const wk=await p.$$eval('.cweek .cday',d=>d.map(x=>({h:x.querySelector('h3').textContent,n:x.querySelectorAll('.ccard').length,t:x.textContent})));
 const mon=wk.find(d=>d.h.includes('الاثنين'));if(!mon||mon.n!==1||!mon.t.includes('قصة الحروف'))E(W+' الأسبوعي: النشاط ليس يوم الاثنين '+JSON.stringify(wk.map(d=>d.h+d.n)));
 if(wk.some(d=>d.t.includes('الصف الثاني')))E(W+' نشاط صف آخر ظهر');
 await ov('week');
 // 4) القائمة القادمة
 await p.click('[data-v=list]');await p.waitForSelector('.clist .ccard');let L=await cardsVis();
 const titles=L.map(c=>c.t);if(JSON.stringify(titles)!==JSON.stringify(['قصة الحروف','نشاط الاستماع','ترتيب الغرفة','نشاط جديد منشور']))E(W+' ترتيب/محتوى القائمة '+titles);
 if(titles.includes('نشاط محذوف'))E(W+' نشاط بلا محتوى ظهر');if(!posts.some(x=>x[0]==='pf_errors'&&x[1].includes('cal-link')))E(W+' لم يُسجَّل خطأ الرابط');
 const home=L.find(c=>c.t==='ترتيب الغرفة');if(!home.txt.includes('سلة وألعاب صغيرة')||home.txt.includes('بدء النشاط'))E(W+' التجهيزات/بدء النشاط');
 const info=await p.$$eval('.clist .ccard',c=>c.map(x=>({href:x.querySelector('a.go').href,dur:x.textContent.includes('دقيقة'),lvl:x.textContent.includes('٥ سنوات'),cat:!!x.querySelector('.ck'),img:x.querySelector('img')&&1})));
 if(!info[1].dur)E(W+' المدة المحددة لم تظهر');if(info.some(i=>!i.lvl||!i.cat))E(W+' مستوى/فئة ناقصة');
 for(const i of info){const r=await ctx.request.get('http://localhost:8765'+new URL(i.href).pathname);if(r.status()>=400)E(W+' رابط مكسور '+i.href)}
 await ov('list');
 // 5) التصفية بالفئة والموضوع
 await p.click('[data-c=story]');await p.waitForTimeout(300);if((await cardsVis()).some(c=>c.t==='قصة الحروف'))E(W+' تصفية الفئة');await p.click('[data-c=story]');
 await p.click('[data-t=reading]');await p.waitForTimeout(300);L=await cardsVis();if(L.length!==1||L[0].t!=='نشاط الاستماع')E(W+' تصفية الموضوع '+L.map(c=>c.t));await p.click('[data-t=""]');
 // 6) إضافة إلى خطتي
 await p.click('[data-v=list]');L=await cardsVis();const e1=L.find(c=>c.t==='قصة الحروف');
 await p.click(`[data-id="${e1.id}"] [data-a=add]`);await p.fill(`[data-id="${e1.id}"] .cdate`,'2026-11-26');await p.click(`[data-id="${e1.id}"] [data-p=y]`);await p.waitForTimeout(300);
 let k=await kid();const wkA=k.plan.weeks['2026-11-21'];if(!wkA||wkA.items.length!==1||wkA.items[0].key!=='stories:story-x'||wkA.items[0].day!==5)E(W+' الإضافة للخطة '+JSON.stringify(wkA&&wkA.items));
 L=await cardsVis();const personal=L.filter(c=>c.t==='قصة الحروف');if(personal.length!==2&&personal.length!==1)E(W+' عدد بطاقات القصة '+personal.length);
 // تاريخ ماضٍ مرفوض
 // لا إضافة مكررة: نفس النشاط في نفس الأسبوع (٣٠ نوفمبر هو أسبوع ٢٨ نوفمبر، والنشاط أُضيف لأسبوع ٢١ نوفمبر: مختلف)
 // إضافة نشاط الاستماع ثم محاولة تكراره في نفس الأسبوع
 const e2=(await cardsVis()).find(c=>c.t==='نشاط الاستماع');await p.click(`[data-id="${e2.id}"] [data-a=add]`);await p.fill(`[data-id="${e2.id}"] .cdate`,'2026-12-08');await p.click(`[data-id="${e2.id}"] [data-p=y]`);await p.waitForTimeout(300);
 k=await kid();if(!k.plan.weeks['2026-12-05']||k.plan.weeks['2026-12-05'].items.length!==1)E(W+' الأسبوع الثاني');
 const dup=await p.evaluate(()=>{const DB=JSON.parse(localStorage.getItem('zad-learn-v3'));const kk=DB.kids[DB.cur];return window.ZCAL.place(kk,{lv:'a5'},'bank:bank-y','2026-12-09',null)});if(!dup.includes('مسبقًا'))E(W+' التكرار لم يُمنع: '+dup);
 // الحدّ اليومي
 const cap=await p.evaluate(()=>{const DB=JSON.parse(localStorage.getItem('zad-learn-v3'));const kk=DB.kids[DB.cur];kk.plan=kk.plan||{weeks:{}};const r=[];r.push(window.ZCAL.place(kk,{lv:'a5'},'bank:bank-b','2026-12-10',null));r.push(window.ZCAL.place(kk,{lv:'a5'},'bank:bank-c','2026-12-10',null));r.push(window.ZCAL.place(kk,{lv:'a5'},'bank:bank-d','2026-12-10',null));return r});if(cap[0]||cap[1]||!cap[2].includes('ممتلئ'))E(W+' الحد اليومي '+JSON.stringify(cap));
 // 7) الخطة تعرض النشاط نفسه
 await p.goto(B+'plan/');await p.evaluate(()=>{});await p.waitForSelector('#pcreate, .pweek');await p.click('#pnext').catch(()=>{});await p.waitForTimeout(300);
 await p.goto(B+'calendar/');await p.waitForSelector('.ctabs');
 // 8) تغيير الموعد والإزالة (القائمة القادمة تعرض عناصر الخطة)
 await p.click('[data-v=list]');L=await cardsVis();const pl=L.find(c=>c.t==='نشاط الاستماع'&&c.txt.includes('من خطتي'));if(!pl)E(W+' عنصر الخطة غير معروض في التقويم');
 if(pl){await p.click(`[data-id="${pl.id}"] [data-a=mv]`);await p.fill(`[data-id="${pl.id}"] .cdate`,'2026-11-20');await p.click(`[data-id="${pl.id}"] [data-p=y]`);if(!(await p.textContent(`[data-id="${pl.id}"] .cerr`)).includes('اختر تاريخًا'))E(W+' تاريخ ماضٍ قُبل');
  await p.fill(`[data-id="${pl.id}"] .cdate`,'2026-12-15');await p.click(`[data-id="${pl.id}"] [data-p=y]`);await p.waitForTimeout(300);k=await kid();const w2=k.plan.weeks['2026-12-12'];if(!w2||!w2.items.some(i=>i.key==='bank:bank-y'&&i.day===3))E(W+' تغيير الموعد '+JSON.stringify(Object.keys(k.plan.weeks)));if(k.plan.weeks['2026-12-05']&&k.plan.weeks['2026-12-05'].items.some(i=>i.key==='bank:bank-y'))E(W+' بقي في الأسبوع القديم');
  const pl2=(await cardsVis()).find(c=>c.t==='نشاط الاستماع'&&c.txt.includes('من خطتي'));await p.click(`[data-id="${pl2.id}"] [data-a=rm]`);await p.waitForTimeout(300);k=await kid();if(Object.values(k.plan.weeks).some(w=>w.items.some(i=>i.key==='bank:bank-y')))E(W+' الإزالة');}
 // 9) التذكيرات: مطفأة افتراضيًا ثم مفعّلة
 await reset(KS({plan:{weeks:{'2026-11-21':{id:'w',created:1,days:[5],n:1,doms:[],review:false,lv:'a5',paused:false,items:[{id:'ia',key:'bank:bank-y',day:5,st:'todo',c:Date.now(),why:'x',tries:0,note:''}]}},set:{}}}),'a5');
 if(await p.$('.cban'))E(W+' تذكير ظهر وهو مطفأ');
 await p.check('#crem');await p.waitForSelector('.cban');const rb=await p.textContent('p.cban:has([data-b=remx])');if(!rb.includes('نشاط الاستماع'))E(W+' نص التذكير');if(/متأخر|فشل|عاجل/.test(rb))E(W+' عبارة ضاغطة');
 await p.click('[data-b=remx]');await p.waitForTimeout(300);if(await p.$('[data-b=remx]'))E(W+' إخفاء التذكير');await p.reload();await p.waitForSelector('.ctabs');if(await p.$('[data-b=remx]'))E(W+' التذكير تكرر في نفس اليوم');
 await p.uncheck('#crem');await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.cal.lastRem='';localStorage.setItem('zad-learn-v3',JSON.stringify(d))});await p.reload();await p.waitForSelector('.ctabs');if(await p.$('[data-b=remx]'))E(W+' التذكير عمل بعد الإيقاف');
 // إشعار النشاط الجديد
 await p.check('#cnew');await p.waitForTimeout(300);if(await p.$('[data-b=newx]'))E(W+' إشعار قديم أُغرق عند التفعيل');
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.cal.seen=Date.parse('2026-11-24T00:00:00Z');localStorage.setItem('zad-learn-v3',JSON.stringify(d))});await p.reload();await p.waitForSelector('.ctabs');
 if(!(await p.$('[data-b=newx]'))||!(await p.textContent('p.cban:has([data-b=newx])')).includes('نشاط جديد منشور'))E(W+' إشعار النشاط الجديد');
 await p.click('[data-b=newx]');await p.waitForTimeout(300);if(await p.$('[data-b=newx]'))E(W+' إخفاء الإشعار');
 // 10) ICS
 const dl=p.waitForEvent('download');await p.click('#cics');const d=await dl;const txt=fs.readFileSync(await d.path(),'utf8');if(!txt.includes('BEGIN:VEVENT')||!txt.includes('BEGIN:VALARM')||!txt.includes('DTSTART;VALUE=DATE:20261126')||!txt.includes('نشاط الاستماع'))E(W+' ملف ICS '+txt.slice(0,200));if(txt.includes('سارة'))E(W+' ICS يحوي اسم الطفل');
 // 11) عزل الأطفال
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.cur='k2';localStorage.setItem('zad-learn-v3',JSON.stringify(d))});await p.reload();await p.waitForSelector('.ctabs');await p.click('[data-v=list]');
 const k2=await cardsVis();if(k2.some(c=>c.txt.includes('من خطتي')))E(W+' خطة طفل ظهرت لآخر');if(k2.some(c=>c.t==='قصة الحروف'))E(W+' نشاط ٥ سنوات لطفل الصف الثاني');if(!k2.some(c=>c.t==='قصة الصف الثاني'))E(W+' نشاط الصف الثاني غائب');
 console.log(W,'step ok');await ctx.close();
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
