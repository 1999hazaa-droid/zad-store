// NODE_PATH=$(npm root -g) node tools/content/gallery/test_gallery.js  (خادم 8765 من جذر المستودع)
const {chromium}=require('playwright');
const CORS={'access-control-allow-origin':'*'};
const PJ=[
 {slug:'pj_a',kind:'project',cat:'science',title:'نبتة صغيرة',icon:'i_microscope',levels:['a5','a6','g1'],descr:'ملاحظة نمو النبتة',span:'short',data:{skills:['الملاحظة'],steps:[{t:'جهّز الأدوات'},{t:'ازرع البذرة'},{t:'اسقِ النبتة'}]}},
 {slug:'pj_b',kind:'project',cat:'math',title:'أشكال حولنا',icon:'i_numbers',levels:['g1','g2'],descr:'',span:'weekly',data:{skills:['الأشكال'],steps:[{t:'ابحث'},{t:'ارسم'}]}},
 {slug:'ch_1',kind:'challenge',cat:'think',title:'تحدي',icon:'i_puzzle',levels:['g1'],descr:'',span:'short',data:{}}];
const CFGR={domains:[{slug:'science',title:'العلوم والاستكشاف',on:true},{slug:'math',title:'الرياضيات',on:true},{slug:'art',title:'الفنون والإبداع',on:false},{slug:'multi',title:'متعدد المجالات',on:true}],types:[{slug:'project',title:'مشروع',on:true},{slug:'craft',title:'عمل يدوي وفني',on:true}],msgs:['أحسنت! أضفت إنجازًا جديدًا إلى معرضك'],allow_print:true,allow_photos:true};
const SKR={skills:[{id:'s1',name:'الملاحظة',slug:'obs',levels:['a5','g1','g2']},{id:'s2',name:'التعبير',slug:'say',levels:['g1']}],domains:[],links:[]};
const NOW=Date.parse('2026-11-26T12:00:00Z');
(async()=>{const b=await chromium.launch();const errs=[];const ck=(c,m)=>{if(!c)errs.push(m)};
for(const vp of [{width:390,height:800},{width:768,height:900},{width:1200,height:900}]){
 const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(6000);
 let dialogs=[];let accept=true;p.on('dialog',d=>{dialogs.push(d.message());accept?d.accept():d.dismiss()});
 await p.addInitScript(()=>{window.print=()=>{window.__printed=(window.__printed||0)+1}});
 p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
 const outgoing=[];p.on('request',r=>{if(r.method()!=='GET'&&/supabase/.test(r.url()))outgoing.push(r.url().split('/rpc/')[1]||r.url());});
 await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:PJ,headers:CORS}));
 await p.route('**/rest/v1/rpc/gallery_cfg_public',r=>r.fulfill({json:CFGR,headers:CORS}));
 await p.route('**/rest/v1/rpc/skills_public',r=>r.fulfill({json:SKR,headers:CORS}));
 await p.route(/rest\/v1\/(?!rpc\/gallery_cfg_public|rpc\/skills_public|proj_items)/,r=>r.fulfill({json:[],headers:CORS}));
 // سجل الطفل: pj_a قيد التنفيذ (خطوة 2)، pj_b مكتمل بتاريخ حقيقي
 await p.addInitScript(({T})=>{if(!localStorage.getItem('zad-learn-v3'))localStorage.setItem('zad-learn-v3',JSON.stringify({cur:'k1',kids:{k1:{name:'',proj:{done:{pj_b:{d:1,w:0,best:3,t:T,last:0,skills:['التعبير']}},started:{pj_a:1},steps:{pj_a:2},badges:{},favs:{},flow:{},pts:15}}}}));
  if(!localStorage.getItem('zad-eval-v1'))localStorage.setItem('zad-eval-v1',JSON.stringify({kids:{k1:{ev:{pj_b:{st:{c1:'done',c2:'help'},ts:T}},need:{},again:{}}}}));},{T:NOW});
 const B='http://localhost:8765/gallery/';
 const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
 const G=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-gallery-v1')||'{"kids":{}}'));
 await p.goto(B);await p.waitForSelector('.fzempty');await ov('empty');
 ck((await p.textContent('#skbody')).includes('معرضك ما زال فارغًا'),'empty state');
 ck(!(await p.evaluate(()=>localStorage.getItem('zad-gallery-v1'))),'private by default: nothing stored until add');
 // إضافة من المنصة (بلا تكرار)
 await p.goto(B+'#/add');await p.waitForSelector('[data-addref]');
 ck(await p.locator('[data-addref]').count()===2,'two candidates (challenge excluded) '+await p.locator('[data-addref]').count());
 await p.click('[data-addref=pj_b]');await p.waitForSelector('.evhead');
 ck((await p.textContent('.evmsg')).includes('أحسنت! أضفت إنجازًا جديدًا إلى معرضك'),'encouraging msg on add');
 let g=await G();ck(Object.keys(g.kids.k1.e).length===1&&g.kids.k1.e['p:pj_b'].ref==='pj_b','one entry saved');
 ck(!('status' in g.kids.k1.e['p:pj_b'])&&!('doneAt' in g.kids.k1.e['p:pj_b']),'no duplicate of project record fields');
 const dt=new Date(NOW).toLocaleDateString('ar',{year:'numeric',month:'long',day:'numeric'});
 let vt=await p.textContent('#glprint');ck(vt.includes(dt)&&vt.includes('مكتمل'),'real completion date + status '+vt.slice(0,160));
 ck(vt.includes('الأشكال')&&vt.includes('التعبير'),'skills from project and child record');
 ck(vt.includes('أنجزت 1')||vt.includes('أنجزت ١'),'eval summary linked');ck(vt.includes('ابحث')&&vt.includes('ارسم'),'steps listed');
 ck((await p.locator('.glsteps li.on').count())===2,'all steps complete for done project');
 ck((await p.locator('a[href*="portfolio/works"]').count())===1,'link to achievements file');ck((await p.locator('a[href*="eval/#/r/pj_b"]').count())===1,'link to eval report');
 await p.goto(B+'#/add');await p.waitForSelector('.evbox');ck(await p.locator('[data-addref=pj_b]').count()===0,'no duplicate candidate after adding');
 await p.click('[data-addref=pj_a]');await p.waitForSelector('.evhead');
 ck((await p.locator('.glsteps li.on').count())===2&&(await p.locator('.glsteps li').count())===3,'in-progress steps 2 of 3');
 ck((await p.textContent('.evhead')).includes('قيد التنفيذ')&&!(await p.textContent('.evhead')).includes('تاريخ الإنجاز'),'in progress has no fake completion date');
 // إضافة يدوية مع التحقق
 await p.goto(B+'#/add');await p.waitForSelector('#glNewM');await p.click('#glNewM');await p.waitForSelector('#gTitle');await ov('form');
 await p.fill('#gTitle','أ');await p.click('#gSave');ck((await p.textContent('#gErr')).includes('حرفين'),'title length error');
 await p.fill('#gTitle','برج الكراتين');await p.fill('#gDescr','اتصل على 0501234567');await p.click('#gSave');ck((await p.textContent('#gErr')).includes('خصوصية'),'phone rejected');
 await p.fill('#gDescr','بنيت برجًا من علب مستعملة');await p.fill('#gNote','زوروا www.example.com');await p.click('#gSave');ck((await p.textContent('#gErr')).includes('خصوصية'),'link rejected');
 await p.fill('#gNote','أعجبني الارتفاع');
 await p.click('#gSave');ck((await p.textContent('#gErr')).includes('العمر'),'level required');
 await p.selectOption('#gLv','g1');await p.selectOption('#gDom','math');await p.selectOption('#gType','craft');
 ck(!(await p.locator('#gDom option[value=art]').count()),'disabled domain not offered');
 await p.click('[data-sk="الملاحظة"]');ck((await p.locator('[data-sk="الملاحظة"]').getAttribute('aria-pressed'))==='true','skill chip toggled');
 ck(await p.locator('[data-sk="التعبير"]').count()===1,'skills by level');
 // صورة: موافقة ولي الأمر
 ck(await p.locator('#gPhoto').count()===1,'photo input available (IndexedDB works)');
 accept=false;await p.setInputFiles('#gPhoto','/tmp/pic.png');await p.click('#gSave');await p.waitForTimeout(150);
 ck((await p.textContent('#gErr')).includes('لم تُحفظ الصورة'),'photo refused without consent');ck(dialogs.some(d=>d.includes('موافقة وليّ الأمر')),'consent dialog shown');
 accept=true;await p.setInputFiles('#gPhoto','/tmp/pic.png');await p.click('#gSave');await p.waitForSelector('.evhead');
 ck((await p.locator('.glbig').count())===1,'photo restored on view');
 g=await G();const mid=Object.keys(g.kids.k1.e).find(k=>k.startsWith('m'));ck(mid&&g.kids.k1.e[mid].lv==='g1'&&g.kids.k1.e[mid].status==='doing','manual entry saved');
 ck(!JSON.stringify(g).includes('data:image'),'photo not stored in localStorage');
 ck(JSON.parse(await p.evaluate(()=>localStorage.getItem('zad-learn-v3'))).kids.k1.pf.photoOk>0,'consent recorded');
 // تعديل → مكتمل بتاريخ
 await p.click('text=تعديل بيانات المشروع');await p.waitForSelector('#gTitle');await p.selectOption('#gSt','done');await p.fill('#gNote','أنهيته اليوم');await p.click('#gSave');await p.waitForSelector('.evhead');
 g=await G();ck(g.kids.k1.e[mid].status==='done'&&g.kids.k1.e[mid].doneAt>0&&g.kids.k1.e[mid].note==='أنهيته اليوم','edit saved with real doneAt');ck((await p.textContent('#glprint')).includes('تاريخ الإنجاز'),'date shown after completion');
 // المعرض والتصفح
 await p.goto(B);await p.waitForSelector('.glc');ck(await p.locator('.glc').count()===3,'3 cards '+await p.locator('.glc').count());await ov('hub');
 ck((await p.locator('.glc').first().locator('img').count())>=1,'cards have picture');
 for(const [sel,val,n] of [['#fDom','math',2],['#fSt','done',2],['#fSt','doing',1],['#fType','weekly',1],['#fLv','g1',3],['#fLv','a5',1],['#fType','craft',1]]){await p.selectOption(sel,val);await p.waitForTimeout(80);ck(await p.locator('.glc').count()===n,'filter '+sel+'='+val+' => '+await p.locator('.glc').count());await p.selectOption(sel,'');await p.waitForTimeout(60);}
 await p.selectOption('#fPer','week');await p.waitForTimeout(80);ck(await p.locator('.glc').count()>=1,'period filter works');await p.selectOption('#fPer','');
 ck(!(await p.textContent('#skbody')).match(/ترتيب الأطفال|الأول على|منافسة/),'no ranking text');
 // إخفاء
 await p.locator('.glc').first().locator('[data-hide]').click();await p.waitForTimeout(100);ck(await p.locator('.glc').count()===2,'hidden removed from gallery');
 await p.click('#fHid');await p.waitForTimeout(150);ck(await p.locator('.glc').count()===1,'hidden list');await p.locator('.glc [data-hide]').click();await p.waitForTimeout(100);await p.click('#fHid');await p.waitForTimeout(100);ck(await p.locator('.glc').count()===3,'unhide');
 // الطباعة بموافقة
 await p.goto(B+'#/v/'+encodeURIComponent(mid));await p.waitForSelector('#glprintbtn');accept=false;dialogs=[];await p.click('#glprintbtn');ck(!(await p.evaluate(()=>window.__printed)),'print blocked without consent');accept=true;await p.click('#glprintbtn');ck((await p.evaluate(()=>window.__printed))===1,'print after consent');
 // لوحة ولي الأمر (أرقام فعلية)
 await p.goto(B+'#/dash');await p.waitForSelector('.glnum');const nums=await p.locator('.glnum b').allTextContents();ck(nums.join()==='٣,٢,١,٢','dash real counts '+nums);
 await p.fill('textarea[id^="pn_"]','عمل جميل يا بطل');await p.locator('[data-pnote]').first().click();await p.waitForTimeout(80);g=await G();ck(Object.values(g.kids.k1.e).some(e=>e.pnote==='عمل جميل يا بطل'),'parent note saved');
 // حذف مع تأكيد
 await p.goto(B);await p.waitForSelector('.glc');accept=false;await p.locator('.glc').first().locator('[data-del]').click();await p.waitForTimeout(80);ck(await p.locator('.glc').count()===3,'delete cancelled');
 accept=true;dialogs=[];await p.locator('[data-id="'+mid+'"] [data-del]').click();await p.waitForTimeout(150);ck(await p.locator('.glc').count()===2,'deleted');ck(dialogs.some(d=>d.includes('نهائيًا')),'delete confirmation');
 g=await G();ck(!g.kids.k1.e[mid],'entry removed');
 ck(JSON.parse(await p.evaluate(()=>localStorage.getItem('zad-learn-v3'))).kids.k1.proj.done.pj_b.t===NOW,'platform project record untouched by gallery delete');
 await p.locator('.glc [data-del]').first().click();await p.waitForTimeout(100);ck(JSON.parse(await p.evaluate(()=>localStorage.getItem('zad-learn-v3'))).kids.k1.proj.done.pj_b.d===1,'deleting from gallery keeps achievement record');
 // الخصوصية: لا طلبات كتابة إلى الخادم
 ck(outgoing.filter(x=>!/gallery_cfg_public|skills_public/.test(x)).length===0,'no child data sent to server: '+outgoing);
 await ov('dash');
 await ctx.close();}
await b.close();console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS gallery');process.exit(errs.length?1:0)})();
