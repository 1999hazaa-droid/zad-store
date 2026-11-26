// NODE_PATH=$(npm root -g) node tools/content/support/test_engine.js
// تدقيق فعلي لمحرك الأنشطة التفاعلية (بنك الأنشطة) الذي تعتمد عليه شارات «يمكن إعادة المحاولة / يشرح الإجابة / قراءة صوتية»: نشغّل نشاطًا حقيقيًا بالمتصفح ونتحقق من السلوك.
const {chromium}=require('playwright');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const mk=(slug,type,data)=>({slug,cat:'arabic',type,title:'نشاط '+slug,icon:'puzzle.svg',levels:['a5'],subject:'اللغة العربية',skill:'ربط الحرف بصوته',difficulty:'easy',descr:'وصف',instr:'اضغط الإجابة الصحيحة.',data,href:null,pdf_url:null,preview_url:null,link:null,review_note:null,reviewed:true,status:'published',sort_order:1});
const ITEMS=[mk('t1','mcq',{qs:[{q:'ما صوت الحرف ب؟',o:['با','تا','ثا'],why:'الباء تنطق با.',say:'ما صوت الحرف ب'},{q:'اختر الحرف ت',o:['ت','ب','ن'],why:'هذه التاء.'}]}),
 mk('t2','match',{pairs:[['أ','أسد'],['ب','بطة'],['ت','تفاحة']]}),
 mk('t3','order',{items:['أولًا','ثانيًا','ثالثًا']}),
 mk('t4','sort',{groups:[{n:'حيوانات',items:[{t:'قط'},{t:'أسد'}]},{n:'فواكه',items:[{t:'تفاح'},{t:'موز'}]}]}),
 mk('t5','memory',{pairs:[['أ','أسد'],['ب','بطة']]})];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e.message));
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop();if(r.request().method()==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(tb==='bank_items')return r.fulfill({status:200,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(ITEMS)});return r.fulfill({status:200,headers:{...CORS,'content-type':'application/json'},body:'[]'})});
 const B='http://localhost:8765/bank/play/?lv=a5&s=';const T=(c,m)=>{if(!c)E('FAIL '+m)};
 // mcq
 await p.goto(B+'t1');await p.waitForSelector('#go');const pre=await p.innerText('#stage');T(pre.includes('اضغط الإجابة الصحيحة')&&pre.includes('مثال'),'تعليمات ومثال قبل البدء: '+pre);await p.click('#go');await p.waitForSelector('.opt');
 T(await p.$('#say')!==null,'زر الاستماع يظهر للسؤال الذي فيه نص صوتي');
 T(await p.$('.qztm, #qtm, [class*=timer]')===null,'لا مؤقت في النشاط');
 let wrongBtn=null;
 // اكتشف الإجابة الخاطئة بالنص
 const opts=await p.$$eval('.opt',e=>e.map(x=>x.textContent.trim()));
 const wrongIdx=opts.findIndex(x=>x!=='با');await p.click(`.opt[data-j="${wrongIdx}"]`);
 const fb=await p.innerText('#fb');T(/قريب|فكّر/.test(fb)&&!/خطأ|فاشل|سيء|غلط/.test(fb),'رسالة الخطأ لطيفة: '+fb);
 T(await p.$$eval('.opt:not([disabled])',e=>e.length)===2,'بعد الخطأ تبقى بقية الخيارات متاحة (إعادة المحاولة)');
 const ptsBefore=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3')||'null');return d&&d.kids?Object.values(d.kids)[0].bank&&Object.values(d.kids)[0].bank.pts||0:0});
 const goodIdx=opts.findIndex(x=>x==='با');await p.click(`.opt[data-j="${goodIdx}"]`);
 T((await p.innerText('#fb')).includes('الباء تنطق با'),'شرح الإجابة يظهر بعد الإجابة الصحيحة');
 await p.waitForSelector('.qq:has-text("اختر الحرف ت")',{timeout:5000});T(await p.$('#say')===null,'لا زر استماع للسؤال بلا نص صوتي');
 const o2=await p.$$eval('.opt',e=>e.map(x=>x.textContent.trim()));await p.click(`.opt[data-j="${o2.findIndex(x=>x==='ت')}"]`);
 await p.waitForSelector('.res',{timeout:5000});const rt=await p.innerText('.res');T(/أحسنت|ممتاز/.test(rt)&&rt.includes('أعد النشاط'),'نهاية مشجعة وزر إعادة: '+rt.slice(0,120));
 T(!/ضعيف|فشل|خسرت|خصم|-\s*\d/.test(rt),'لا لغة سلبية ولا خصم');
 const ptsAfter=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));const k=Object.values(d.kids)[0];return k.bank.pts});T(ptsAfter>=ptsBefore&&ptsAfter>0,'النقاط لا تنقص بسبب الخطأ: '+ptsBefore+'→'+ptsAfter);
 const rec=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return Object.values(d.kids)[0].bank.done.t1});T(rec&&rec.d===1&&rec.w>=1,'يُسجَّل عدد مرات الإكمال فعلًا: '+JSON.stringify(rec));
 await p.click('#again');await p.waitForSelector('.opt');
 // بقية الأنواع: تعمل بلا أخطاء وبلا مؤقت وتسمح بإعادة المحاولة
 for(const s of ['t2','t3','t4','t5']){await p.goto(B+s);await p.waitForSelector('#go');T((await p.innerText('#stage')).includes('مثال'),s+' تعليمات ومثال');await p.click('#go');await p.waitForSelector('#area button, #area .bkt2, #area [data-l]',{timeout:5000}).catch(()=>E('FAIL '+s+' لم يُعرض'));
  T(await p.$('.qztm, #qtm, [class*=timer]')===null,s+' لا مؤقت');T((await p.innerText('#area')).length>10,s+' عرض نشاطًا');}
 // نشاط خاطئ في match لا يغلق المحاولة
 await p.goto(B+'t2');await p.waitForSelector('#go');await p.click('#go');await p.waitForSelector('[data-l]');await p.click('[data-l="0"]');const rs=await p.$$eval('[data-r]',e=>e.map(x=>x.dataset.r));await p.click(`[data-r="${rs.find(x=>x!=='0')}"]`);
 T(/ليس هذا|جرّ/.test(await p.innerText('#fb')),'match: خطأ لطيف');T(await p.$$eval('[data-r]:not([disabled])',e=>e.length)>=2,'match: يمكن إعادة المحاولة');
 await b.close();console.log(errs.length?'FAILED '+errs.length:'PASS');process.exit(errs.length?1:0)})();
