// NODE_PATH=$(npm root -g) node tools/content/portfolio/test_pf.js  (خادم 8765 من جذر المستودع، و /tmp/pf_certs.json من توليد البذور)
const {chromium}=require('playwright');const fs=require('fs');
const CERTS=JSON.parse(fs.readFileSync('/tmp/pf_certs.json','utf8'));
const B='http://localhost:8765/portfolio/';const errs=[];const E=(m)=>{console.log('ERR',m);errs.push(m)};
const now=Date.now(),DAY=864e5;
const kid1={name:'سارة',age:'5',
 acts:{a1:{d:new Date(now-2*DAY).toISOString().slice(0,10),how:'platform'},a2:{d:new Date(now-3*DAY).toISOString().slice(0,10),how:'parent'},a3:{d:new Date(now-40*DAY).toISOString().slice(0,10),how:'platform'}},
 bank:{done:{b1:{d:1,t:now-1*DAY},b2:{d:2,t:now-5*DAY}}},life:{it:{l1:{d:1,w:0,t:now-4*DAY},l2:{d:1,w:0,t:now-6*DAY}}},ready:{it:{r1:{d:1,w:0,t:now-2*DAY}}},
 stories:{s1:{t:now-3*DAY},s2:{t:now-2*DAY},s3:{t:now-1*DAY}},vid:{done:{v1:{d:1,t:now-1*DAY}}},proj:{done:{p1:{d:1,t:now-2*DAY}}},
 quiz:{h:{q_ara01:{n:2,best:5,tot:6,cat:'arabic',title:'حروف',last:now-DAY},q_ara02:{n:1,best:4,tot:6,cat:'arabic',title:'حركات',last:now-2*DAY},q_mat01:{n:1,best:3,tot:6,cat:'math',title:'عد',last:now-DAY},'c:letters':{n:1,best:5,tot:8,cat:'contest',title:'تحدي الحروف',last:now-DAY}},
  log:[{k:'q_ara01',t:'حروف',c:'arabic',ok:3,n:6,ts:now-3*DAY},{k:'q_ara01',t:'حروف',c:'arabic',ok:5,n:6,ts:now-DAY},{k:'q_ara02',t:'حركات',c:'arabic',ok:4,n:6,ts:now-2*DAY},{k:'q_mat01',t:'عد',c:'math',ok:3,n:6,ts:now-DAY},{k:'c:letters',t:'x',c:'contest',ok:5,n:8,ts:now-DAY}],
  sk:{'الجمع':{ok:2,n:5,c:'math'},'الحروف':{ok:7,n:8,c:'arabic'}},pts:50,badges:{},rw:{},rv:{},ev:[]}};
const seed={cur:'k1',kids:{k1:kid1,k2:{name:'ليث'}}};
const GSEED={hg_profiles:JSON.stringify(['سارة']),'hg_kid:سارة':JSON.stringify({n:'سارة',ch:'girl1',age:5}),'hg_prog:سارة':JSON.stringify({len:3,clock1:2,clock2:3,add2:1,sub2:2}),'hg_gt:سارة':JSON.stringify({len:now-2*DAY,clock1:now-1*DAY,clock2:now-3*DAY,add2:now-4*DAY})};
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');
const AR=s=>+s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
(async()=>{const b=await chromium.launch();
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
 const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();let issued=[],perrs=[];
 await ctx.addInitScript(([s,g])=>{if(!localStorage.getItem('zad-learn-v3')){localStorage.setItem('zad-learn-v3',s);Object.entries(g).forEach(([k,v])=>localStorage.setItem(k,v))}},[JSON.stringify(seed),GSEED]);
 await p.route('**/rest/v1/**',async r=>{const u=new URL(r.request().url());const tb=u.pathname.split('/').pop();const h={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
  if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:h});
  if(r.request().method()==='POST'){const j=JSON.parse(r.request().postData()||'{}');if(tb==='pf_issued')issued.push(j.cert_slug);if(tb==='pf_errors')perrs.push(j);return r.fulfill({status:201,headers:h,body:''})}
  if(tb==='pf_certs')return r.fulfill({status:200,headers:{...h,'content-type':'application/json'},body:JSON.stringify(CERTS)});
  const m=(u.search.match(/slug=in\.\(([^)]*)\)/)||[])[1];const slugs=m?decodeURIComponent(m).split(','):[];
  const rows=slugs.filter(x=>!x.startsWith('zz')).map(s=>({slug:s,title:'عمل '+s,icon:'i_puzzle',skill:'مهارة '+s[0],descr:'وصف '+s,pdf_url:s==='a1'?'files/x.pdf':null,summary:'ملخص'}));
  r.fulfill({status:200,headers:{...h,'content-type':'application/json'},body:JSON.stringify(rows)})});
 const ov=async(n)=>{const o=await p.evaluate(()=>[document.documentElement.scrollWidth>innerWidth+1,[...document.querySelectorAll('img:not(.pfph)')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src.split('/').slice(-2).join('/'))]);if(o[0])E(vp.width+' overflow '+n);if(o[1].length)E(vp.width+' broken img '+n+' '+o[1].join(','))};
 await p.goto(B);await p.waitForSelector('.pfstats');await ov('hub');
 const nums=await p.locator('.pfstat b').allTextContents();
 // أنشطة: acts3+bank2+life2+ready1+proj1=9 ; قصص ودروس: stories3+vid1=4 ; محفوظ: ws(acts3+bank2)+proj(life2+ready1+proj1)=9 ; اختبارات3
 const exp=[14,4,14,3];exp.forEach((v,i)=>{if(AR(nums[i])!==v)E(vp.width+' hub stat '+i+' got '+nums[i]+' want '+v)});
 // شهادات متوقعة للمرحلة a5
 const want=['letters_explorer','small_story_reader','early_activities','skill_progress','contest_participant','video_learner','game_explorer'].sort();
 const got=await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.pf.certs).sort());
 // letters_explorer: quiz arabic n2 ✔, small_story n2 stories3 ✔, early_activities n5 (acts,bank,life,ready =8)✔, skill_progress الحروف 7/8 minAns6 ✔, contest ✔, video n3 vid1+songs0 ✘
 const want2=want.filter(x=>x!=='video_learner');
 if(JSON.stringify(got)!==JSON.stringify(want2))E(vp.width+' certs got '+got+' want '+want2);
 if(AR(nums[4])!==want2.length)E(vp.width+' cert count stat '+nums[4]);
 const issuedN=issued.length;if(issuedN!==want2.length)E('issued posts '+issuedN);
 // إعادة التحميل لا تكرر
 await p.reload();await p.waitForSelector('.pfstats');if(issued.length!==issuedN)E('re-issue on reload '+issued.length);
 // تاريخ الشهادة = تاريخ تحقق الشرط (وليس اليوم)
 const fs_=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.pf.certs.small_story_reader.t);if(Math.abs(fs_-(now-2*DAY))>2000)E('cert date not evidence date '+(now-fs_)/DAY);
 // الأعمال
 for(const tab of ['ws','proj','les','quiz','cert']){await p.goto(B+'works/?tab='+tab);await p.waitForSelector('#pftab *');await ov('tab '+tab)}
 await p.goto(B+'works/?tab=ws');await p.waitForSelector('.pfc');let n0=await p.locator('.pfc').count();if(n0!==5)E('ws cards '+n0);
 if(!(await p.locator('.pfc a:has-text("طباعة نسخة")').count()))E('print copy link missing');
 // لا عمل غير موجود في الجدول (zz)
 // إخفاء عمل
 p.once('dialog',d=>d.accept());await p.locator('.pfhide').first().click();await p.waitForSelector('.pfc');let n1=await p.locator('.pfc').count();if(n1!==4)E('hide failed '+n1);
 // ملاحظة
 p.once('dialog',d=>d.accept('ملاحظة تجريبية'));await p.locator('.pfnote').first().click();await p.waitForSelector('.pfc');if(!(await p.locator('.pfc').first().innerText()).includes('ملاحظة تجريبية'))E('note not saved');
 // الصورة: موافقة ثم حفظ محلي
 await p.goto(B+'works/?tab=ws');await p.waitForSelector('.pfc');p.once('dialog',d=>d.accept());const [fc]=await Promise.all([p.waitForEvent('filechooser'),p.locator('.pfpic').first().click()]);await fc.setFiles({name:'a.png',mimeType:'image/png',buffer:PNG});await p.waitForSelector('.pfc');await p.waitForSelector('.pfph:not([hidden])',{timeout:4000}).catch(()=>E('photo not shown after save'));
 if(!(await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.pf.photoOk)))E('photo consent not recorded');
 const src=await p.locator('.pfph:not([hidden])').first().getAttribute('src').catch(()=>'');if(!/^data:image\/jpeg/.test(src||''))E('photo not stored as local jpeg');
 await p.reload();await p.waitForSelector('.pfph:not([hidden])',{timeout:4000}).catch(()=>E('photo lost after reload'));
 let sent=0;p.on('request',r=>{if(r.method()==='POST'&&/image|photo/.test(r.postData()||''))sent++});
 p.once('dialog',d=>d.accept());await Promise.all([p.waitForNavigation(),p.locator('.pfpdel:not([hidden])').first().click()]);await p.waitForSelector('.pfc');if(await p.locator('.pfph:not([hidden])').count())E('photo not deleted');
 // الألعاب في تبويب المشروعات والأنشطة
 await p.goto(B+'works/?tab=proj');await p.waitForSelector('.pfc');const pj=await p.locator('.pfc').count();if(pj!==9)E('proj tab count '+pj+' (want 9 incl games)');if(!(await p.locator('#pftab').innerText()).includes('تاريخ غير مسجل'))E('undated game label missing');if(!(await p.locator('.pfc a[href*="games/#g="]').count()))E('game link missing');
 // الاختبارات
 await p.goto(B+'works/?tab=quiz');const qt=await p.locator('#pftab').innerText();if(!qt.includes('حروف')||!qt.includes('تحدي الحروف')||!qt.includes('أعد التدريب'))E('quiz tab content');if(!qt.includes('الجمع'))E('skill review missing');
 // الشهادات
 await p.goto(B+'works/?tab=cert');const ct=await p.locator('#pftab').innerText();if(!ct.includes('مستكشف الحروف')||!ct.includes('خطوات قادمة'))E('cert tab');
 await p.goto(B+'cert/?c=letters_explorer');await p.waitForSelector('#pfcert');await ov('cert');const ctext=await p.locator('#pfcert').innerText();if(!ctext.includes('سارة')||!ctext.includes('مستكشف الحروف')||!ctext.includes('زاد'))E('cert text');
 await p.goto(B+'cert/?c=video_learner');await p.waitForSelector('.pfempty');if(!(await p.locator('#aview').innerText()).includes('لم تصدر'))E('unearned cert shown');
 await p.goto(B+'cert/?c=nope');await p.waitForSelector('.pfempty');if(await p.locator('#pfcert').count())E('bad cert shown');
 // التقرير
 await p.goto(B+'report/');await p.waitForSelector('.pfchart');await ov('report');let rt=await p.locator('#aview').innerText();if(!rt.includes('الجمع'))E('report need skill');
 const w1=await p.locator('.pfstat b').allTextContents();await p.goto(B+'report/?p=month');await p.waitForSelector('.pfchart');const w2=await p.locator('.pfstat b').allTextContents();if(AR(w2[0])<AR(w1[0]))E('month smaller than week '+w1[0]+'/'+w2[0]);
 const f=new Date(now-50*DAY).toISOString().slice(0,10),t=new Date(now-30*DAY).toISOString().slice(0,10);await p.goto(B+`report/?p=custom&from=${f}&to=${t}`);await p.waitForSelector('.pfchart');const w3=await p.locator('.pfstat b').allTextContents();if(AR(w3[0])!==1)E('custom period acts '+w3[0]);
 // عزل الأطفال
 await p.goto(B);await p.selectOption('#pfkid','k2');await p.waitForSelector('.pfstats');const z=await p.locator('.pfstat b').allTextContents();if(z.some(x=>AR(x)!==0))E('kid2 sees kid1 data '+z);if(!(await p.locator('.pfempty').count()))E('empty state missing');
 await p.selectOption('#pfkid','k1');await p.waitForSelector('.pfstats');
 // تعديل الملف الشخصي
 await p.click('#pfedit');await p.fill('#pfn','سارة الصغيرة');await p.check('input[value=girl1]');await p.selectOption('#pfl','g2');await p.click('#pff button[type=submit]');await p.waitForSelector('.pfhead');if(!(await p.locator('.pfwho h1').innerText()).includes('سارة الصغيرة'))E('profile edit');
 // عند تغيير المرحلة تبقى الشهادات الصادرة
 await p.waitForSelector('.pfstats');const kept=await p.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.pf.certs).length);if(kept<want2.length)E('certs lost on level change');
 // إظهار المخفي + حذف الملف
 await p.click('#pfhid');await p.waitForSelector('.pfstats');await p.goto(B);p.once('dialog',d=>d.accept());await p.click('#pfdel');await Promise.all([p.waitForNavigation(),p.click('#pfdel')]);await p.waitForSelector('.pfstats');const pf2=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.pf);if(pf2&&pf2.nick)E('portfolio delete kept nick');
 // لا نفاذ لبيانات في رابط عام
 const urls=await p.evaluate(()=>[...document.querySelectorAll('a')].map(a=>a.href).filter(h=>/سارة|%D8%B3/.test(h)));if(urls.length)E('personal data in links');
 if(perrs.length)E('error reports '+JSON.stringify(perrs).slice(0,150));
 await ctx.close();console.log(vp.width,'done')}
// تصدير/استيراد بين جهازين (سياقان منفصلان)
{const mk=async(seedIt)=>{const c=await b.newContext({viewport:{width:390,height:800},acceptDownloads:true});if(seedIt)await c.addInitScript(([s,g])=>{if(!localStorage.getItem('zad-learn-v3')){localStorage.setItem('zad-learn-v3',s);Object.entries(g).forEach(([k,v])=>localStorage.setItem(k,v))}},[JSON.stringify(seed),GSEED]);const pg=await c.newPage();await pg.route('**/rest/v1/**',async r=>{const u=new URL(r.request().url());const tb=u.pathname.split('/').pop();const h={'access-control-allow-origin':'*','access-control-allow-headers':'*','content-type':'application/json'};if(r.request().method()!=='GET')return r.fulfill({status:201,headers:h,body:''});if(tb==='pf_certs')return r.fulfill({status:200,headers:h,body:JSON.stringify(CERTS)});const m=(u.search.match(/slug=in\.\(([^)]*)\)/)||[])[1];const sl=m?decodeURIComponent(m).split(','):[];r.fulfill({status:200,headers:h,body:JSON.stringify(sl.map(x=>({slug:x,title:'عمل '+x,icon:'i_puzzle'})))})});return {c,pg}};
 const A=await mk(true);await A.pg.goto(B+'works/?tab=ws');await A.pg.waitForSelector('.pfc');A.pg.once('dialog',d=>d.accept());const [fc2]=await Promise.all([A.pg.waitForEvent('filechooser'),A.pg.locator('.pfpic').first().click()]);await fc2.setFiles({name:'a.png',mimeType:'image/png',buffer:PNG});await A.pg.waitForSelector('.pfph:not([hidden])',{timeout:5000}).catch(()=>E('xfer: photo missing'));
 await A.pg.goto(B);await A.pg.waitForSelector('#pfexp');const [dl]=await Promise.all([A.pg.waitForEvent('download'),A.pg.click('#pfexp')]);const path='/tmp/zad-portfolio-test.json';await dl.saveAs(path);const ex=JSON.parse(fs.readFileSync(path,'utf8'));if(ex.kind!=='zad-portfolio'||!ex.kid.acts||!Object.keys(ex.photos).length||!ex.games||!ex.games.prog)E('export content incomplete');
 const certA=await A.pg.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.pf.certs));
 const Bc=await mk(false);await Bc.pg.goto(B);await Bc.pg.waitForSelector('#pfimp');
 // ملف غير صالح يُرفض
 fs.writeFileSync('/tmp/bad.json','{"x":1}');let [f1]=await Promise.all([Bc.pg.waitForEvent('filechooser'),Bc.pg.click('#pfimp')]);await f1.setFiles('/tmp/bad.json');await Bc.pg.waitForTimeout(500);if(!(await Bc.pg.locator('#pftm').innerText()).includes('ليس ملف'))E('bad import not rejected');if(Object.keys(await Bc.pg.evaluate(()=>(JSON.parse(localStorage.getItem('zad-learn-v3'))||{kids:{k1:1}}).kids)).length!==1)E('bad import changed data');
 Bc.pg.once('dialog',d=>d.accept());[f1]=await Promise.all([Bc.pg.waitForEvent('filechooser'),Bc.pg.click('#pfimp')]);await Promise.all([Bc.pg.waitForNavigation(),f1.setFiles(path)]);await Bc.pg.waitForSelector('.pfstats');await Bc.pg.waitForFunction(()=>[...document.querySelectorAll('.pfstat b')].some(b=>b.textContent!=='٠'),null,{timeout:6000}).catch(()=>{});
 const kidsB=await Bc.pg.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('zad-learn-v3')).kids).length);if(kidsB!==2)E('import should add a kid, got '+kidsB);
 await Bc.pg.waitForSelector('.pfstats');const nb=await Bc.pg.locator('.pfstat b').allTextContents();if(AR(nb[0])!==14||AR(nb[4])<6)E('imported stats '+nb);
 const certB=await Bc.pg.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return JSON.stringify(d.kids[d.cur].pf.certs)});if(certB!==certA)E('imported certificates/dates differ');
 await Bc.pg.goto(B+'works/?tab=ws');await Bc.pg.waitForSelector('.pfph:not([hidden])',{timeout:5000}).catch(()=>E('imported photo missing'));
 await A.c.close();await Bc.c.close();console.log('transfer done')}
// مسار التعطل: فشل جلب الشهادات
{const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();await ctx.addInitScript(s=>localStorage.setItem('zad-learn-v3',s),JSON.stringify(seed));let rep=0;
 await p.route('**/rest/v1/**',r=>{if(r.request().method()==='POST'){rep++;return r.fulfill({status:201,headers:{'access-control-allow-origin':'*'},body:''})}r.fulfill({status:500,headers:{'access-control-allow-origin':'*'},body:'x'})});
 await p.goto(B);await p.waitForSelector('.pfstats',{timeout:8000}).catch(()=>E('hub failed to render under REST failure'));await p.waitForTimeout(500);if(!rep)E('no error report on REST failure');await ctx.close()}
await b.close();console.log(errs.length?'ERRORS '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
