// NODE_PATH=$(npm root -g) node tools/content/proj/test_proj2.js  (خادم 8765 من جذر المستودع، /tmp/proj_mock.json و /tmp/pj2/examples.json)
const {chromium}=require('playwright');const fs=require('fs');
const BASE=JSON.parse(fs.readFileSync('/tmp/proj_mock.json','utf8'));const EX=JSON.parse(fs.readFileSync('/tmp/pj2/examples.json','utf8'));
const CORS={'access-control-allow-origin':'*'};
const NOW=Date.parse('2026-11-26T12:00:00Z'),DAY=864e5;
const FAST=`(()=>{const o=window.setTimeout;window.setTimeout=(f,d,...a)=>o(f,d>=800?30:d,...a);window.__pjNow=${NOW};window.print=()=>{window.__printed=(window.__printed||0)+1};})()`;
const AD=s=>String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const IT=[...BASE.map(x=>({...x,span:'short',created_at:'2026-10-01T00:00:00Z'})),...EX.map((x,i)=>({...x,kind:'project',type:'project',link:{},span:x.span,created_at:new Date(NOW-(x.slug==='pj_wk_book'?3:40)*DAY).toISOString()}))];
const byS=s=>IT.find(x=>x.slug===s);
(async()=>{const b=await chromium.launch();const errs=[];const ck=(c,m)=>{if(!c)errs.push(m)};
for(const vp of [{width:390,height:800},{width:768,height:900},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(FAST);const p=await ctx.newPage();p.setDefaultTimeout(6000);
p.on('pageerror',e=>errs.push('pageerror '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:IT,headers:CORS}));
const B='http://localhost:8765/projects/';
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
const ST=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.proj);
const cnt=()=>p.locator('#bkres .bkc').count();
// ===== المحور: g2
await p.goto(B+'?lv=g2');await p.waitForSelector('.bkc');await ov('hub');
const g2=IT.filter(x=>x.levels.includes('g2'));
ck(await p.locator('#bkres .bkc').count()>=g2.filter(x=>x.kind==='project').length,'hub shows projects');
const sections=await p.locator('#bkres .art h2').allTextContents();ck(sections.some(t=>t.includes('مشاريع أسبوعية')),'weekly section');ck(sections.some(t=>t.includes('مشاريع شهرية')),'monthly section');
ck(!(await p.locator('#pjnospan').count()),'no empty-note when spans exist');
// فلتر المدة
await p.selectOption('#fsp','weekly');await p.waitForTimeout(80);ck(await cnt()===g2.filter(x=>x.span==='weekly').length,'filter weekly '+await cnt());
await p.selectOption('#fsp','monthly');await p.waitForTimeout(80);ck(await cnt()===g2.filter(x=>x.span==='monthly').length,'filter monthly');
await p.selectOption('#fsp','short');await p.waitForTimeout(80);ck(await cnt()===g2.filter(x=>x.kind==='project'&&x.span==='short').length,'filter short');
await p.selectOption('#fsp','');
// المجال: متعدد + البيئة والنظافة + العربية والقراءة والكتابة
const cats=await p.locator('#fc option').allTextContents();ck(cats.includes('متعدد المجالات')&&cats.includes('البيئة والنظافة')&&cats.includes('اللغة العربية والقراءة والكتابة'),'domains list');
// الجديد
await p.click('#fnew');await p.waitForTimeout(80);const nn=await cnt();ck(nn===g2.filter(x=>x.slug==='pj_wk_book').length,'new filter '+nn);
ck((await p.textContent('#bkres')).includes('جديد'),'new badge');
await p.click('#fclr');await p.waitForTimeout(80);
// المفضلة
const card=p.locator('.bkc[data-slug="pj_wk_book"]').first();ck((await card.locator('.bkfav').textContent()).includes('حفظ في المفضلة'),'fav label');
await card.locator('.bkfav').click();await p.waitForTimeout(80);
ck((await ST()).favs.pj_wk_book>0,'fav saved');ck((await p.locator('.bkc[data-slug="pj_wk_book"] .bkfav').first().getAttribute('aria-pressed'))==='true','fav pressed');
await p.click('#ffav');await p.waitForTimeout(80);ck(await cnt()===1,'fav filter '+await cnt());
await p.click('#ffav');await p.waitForTimeout(80);
// بطاقة: عمر ومدة وبدء
const ct=await card.textContent();ck(ct.includes('أسبوعي')&&ct.includes('للجلسة')&&ct.includes('ابدأ المشروع'),'card text');ck(/الصف الثاني|٦ سنوات/.test(ct),'card age');
// حالة فارغة صادقة: مرحلة لا فيها مشاريع مدد
await p.goto(B+'?lv=a2');await p.waitForSelector('.bkc');ck((await p.locator('#pjnospan').count())===1,'honest empty for a2');
ck(!(await p.textContent('#bkres')).includes('كتابي المصور'),'toddler sees no weekly');
await p.selectOption('#fsp','weekly');await p.waitForTimeout(80);ck(await cnt()===0,'a2 weekly none');
await p.goto(B+'?lv=a4');await p.waitForSelector('.bkc');await p.selectOption('#fsp','monthly');await p.waitForTimeout(80);ck(await cnt()===0,'a4 monthly none');
for(const x of IT)for(const l of x.levels)if(!/^(a[2-6]|g[1-4])$/.test(l))errs.push('level out of scope '+x.slug+l);
// ===== صفحة المشروع الأسبوعي
const it=byS('pj_wk_book'),n=it.data.steps.length;
await p.goto(`${B}play/?s=pj_wk_book&lv=g2`);await p.waitForSelector('#go');await ov('play');
ck(await p.locator('#pjflow li').count()===6,'flow 6');ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='1','flow starts at 1');
const tx=await p.textContent('#stage');for(const w of [it.data.goal,it.data.safety,it.data.outcome,...it.data.tools])ck(tx.includes(AD(w)),'missing '+w.slice(0,16));
ck(tx.includes('دور ولي الأمر')&&tx.includes(it.data.parent.slice(0,20)),'parent role');ck(tx.includes('اليوم الأول')&&tx.includes('اليوم الخامس'),'days list');
ck((await p.textContent('.vmeta')).includes('أسبوعي'),'meta span');
ck((await p.textContent('#pjres')).includes('قصص المكتبة'),'resources');ck((await p.getAttribute('#pjres a','href')).endsWith('/stories/'),'resource href');
// أدوات
await p.locator('.pjtk').first().check();ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='2','flow 2 after tool');
ck((await ST()).flow.pj_wk_book.tl.length===1,'tool saved');
await p.reload();await p.waitForSelector('#go');ck(await p.locator('.pjtk').first().isChecked(),'tool restored');ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='2','flow restored 2');
// الخطوات
await p.click('#go');await p.waitForSelector('.pjstep');ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='3','flow 3');
ck((await p.textContent('#pjcnt')).includes(AD(1)+' من '+AD(n)),'counter 1');ck((await p.textContent('#pjstg')).includes('اليوم الأول'),'stage label');
ck(await p.locator('#prev').isDisabled(),'prev disabled first');
await p.click('#next');ck((await p.textContent('#pjcnt')).includes(AD(2)+' من '+AD(n)),'step 2');
ck(await p.locator('#pjpause').count()===1,'pause note at stage end');
await p.click('#next');ck((await p.textContent('#pjstg')).includes('اليوم الثاني'),'stage 2 label');
await p.click('#prev');ck((await p.textContent('#pjcnt')).includes(AD(2)+' من '+AD(n)),'back works');
await p.click('#next');await p.click('#next');// الخطوة 4
ck((await ST()).steps.pj_wk_book===3,'step saved 3');
// استعادة
await p.reload();await p.waitForSelector('#go');ck((await p.textContent('#go')).includes('تابع من حيث توقفت'),'resume label');ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='3','flow restored 3');
await p.click('#go');await p.waitForSelector('.pjstep');ck((await p.textContent('#pjcnt')).includes(AD(4)+' من '+AD(n)),'resumed at 4');
// لوحة ولي الأمر أثناء المشروع
await p.goto(`${B}progress/?lv=g2`);await p.waitForSelector('#pgcur');await ov('progress');
const pc=await p.textContent('#pgcur');ck(pc.includes('كتابي المصور')&&pc.includes('الخطوة '+AD(4)+' من '+AD(n))&&pc.includes('اليوم الثاني'),'progress current step '+pc.slice(0,120));
ck((await p.textContent('#pghelp')).includes(it.data.parent.slice(0,25)),'help guidance');ck((await p.textContent('#pgfav')).includes('كتابي المصور'),'favs in dashboard');
ck((await p.textContent('#pgtools')).length>40,'tools upcoming');
ck(!(await p.locator('input[type=file]').count()),'no file inputs');ck((await p.textContent('main')).includes('صورة وجه الطفل'),'privacy text');
// إكمال
await p.goto(`${B}play/?s=pj_wk_book&lv=g2`);await p.waitForSelector('#go');await p.click('#go');await p.waitForSelector('.pjstep');
for(let k=3;k<n;k++){await p.click("#next");}
await p.waitForSelector('.qq');ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='4','flow 4');
for(const q of it.data.qs){await p.waitForSelector('.qq');const o=q.o[0];await p.locator('.opt',{hasText:o}).first().click();await p.waitForTimeout(120);}
await p.waitForSelector('#note');ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='5','flow 5');
ck((await p.textContent('#pjref')).includes(it.data.reflect.slice(0,20)),'reflect question');
await p.fill('#note','أعجبتني الصفحة الثانية');await p.locator('#sk .chip').first().click();await p.click('#fin');await p.waitForSelector('.res');
ck((await p.locator('#pjflow li.on').getAttribute('data-f'))==='6','flow 6');
const S=await ST();ck(S.done.pj_wk_book&&S.done.pj_wk_book.note.includes('الصفحة الثانية'),'done saved');ck(S.steps.pj_wk_book==null,'steps cleared');
// طباعة
await p.click('#pjprintbtn');ck(await p.evaluate(()=>window.__printed)===1,'print called');
await p.emulateMedia({media:'print'});
const pr=await p.evaluate(()=>{const e=document.getElementById('pjprint'),cs=getComputedStyle(e),top=getComputedStyle(document.querySelector('.ztop')).visibility,st=getComputedStyle(document.getElementById('stage')).visibility;return {disp:cs.display,vis:cs.visibility,top,st,t:e.innerText}});
ck(pr.disp==='block'&&pr.vis==='visible','print box visible');ck(pr.top==='hidden'&&pr.st==='hidden','rest hidden in print');
for(const s of it.data.steps)ck(pr.t.includes(AD(s.t).slice(0,14)),'print has step '+s.t.slice(0,10));
ck(pr.t.includes('☐')&&pr.t.includes('تعليمات السلامة')&&pr.t.includes('دور ولي الأمر')&&pr.t.includes('سؤال للتفكير')&&pr.t.includes('اليوم الأول'),'print sections');
await p.emulateMedia({media:'screen'});
const sc=await p.evaluate(()=>getComputedStyle(document.getElementById('pjprint')).display);ck(sc==='none','print box hidden on screen');
// شهري + مرحلة أسبوع
await p.goto(`${B}play/?s=pj_mo_plant&lv=g3`);await p.waitForSelector('#go');ck((await p.textContent('#stage')).includes('الأسبوع الرابع'),'monthly stages');
await p.click('#go');await p.waitForSelector('.pjstep');ck((await p.textContent('#pjstg')).includes('الأسبوع الأول'),'monthly stage label');
// طفل صغير: مشروع قصير قديم يعمل بلا مراحل
await p.goto(`${B}play/?s=pj_sci08&lv=a2`);await p.waitForSelector('#go');await p.click('#go');await p.waitForSelector('.pjstep');ck(await p.locator('#pjstg').count()===0,'short has no stage label');ck(await p.locator('#pjpause').count()===0,'short has no pause');
// دليل
await p.goto(`${B}guide/`);await p.waitForSelector('.art');ck((await p.textContent('main')).includes('الأسبوعية والشهرية'),'guide section');
console.log('vp',vp.width,'done');await ctx.close();}
await b.close();console.log(errs.length?'ERRORS:\n'+errs.join('\n'):'ALL OK');process.exit(errs.length?1:0)})();
