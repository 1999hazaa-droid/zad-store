// NODE_PATH=$(npm root -g) node tools/content/feedback/test_public.js   (نافذة إرسال الملاحظة: متصفح حقيقي + خادم وهمي عبر اعتراض الشبكة)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const VW=+(process.env.VW||390);const ctx=await b.newContext({viewport:{width:VW,height:800}});const p=await ctx.newPage();const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 const js=fs.readFileSync('feedback/zfeedback.js','utf8');
 let reqs=[],mode='ok',itemOk=true,delay=0;
 await p.route('https://t.test/**',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><body dir=rtl><main style="padding:16px"><h1>نشاط تجريبي</h1><p>محتوى الصفحة</p></main></body>'}));
 await p.route('https://zcnwzpevehudhnsuljdy.supabase.co/rest/v1/rpc/*',async r=>{const u=r.request().url().split('/').pop(),body=JSON.parse(r.request().postData()||'{}');reqs.push([u,body]);
  if(u==='fb_item')return r.fulfill({contentType:'application/json',body:JSON.stringify(itemOk?{ok:true,title:'نشاط العد للصف الأول'}:{ok:false})});
  if(u==='fb_submit'){if(delay)await new Promise(x=>setTimeout(x,delay));if(mode==='abort')return r.abort();if(mode==='server')return r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({message:'لا تكتب أرقام هواتف أو بريدًا إلكترونيًا أو بيانات شخصية في الملاحظة.'})});if(mode==='noref')return r.fulfill({contentType:'application/json',body:'{}'});return r.fulfill({contentType:'application/json',body:JSON.stringify({ref:'ZF-AB12CD',repeat:false})})}
  if(u==='fb_status')return r.fulfill({contentType:'application/json',body:JSON.stringify(body.p_ref==='ZF-AB12CD'?{found:true,status:'resolved',item_title:'نشاط العد للصف الأول',reply:'شكرًا لك، عالجنا المشكلة.'}:{found:false})});
  r.fulfill({status:404,body:'{}'})});
 const load=async(path)=>{reqs=[];await p.goto('https://t.test'+path);await p.addScriptTag({content:'window.ZFEEDBACK=undefined'});await p.addScriptTag({content:js});await p.waitForTimeout(300)};
 const ov=async()=>p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
 // 1) الزر يظهر على صفحة مورد منشور
 await load('/zad-store/bank/play/?s=bk_ara01');
 if(!(await p.$('.zfb-btn.fl')))E('الزر لا يظهر');else{const t=await p.textContent('.zfb-btn.fl');if(!t.includes('إرسال ملاحظة حول هذا المحتوى'))E('نص الزر '+t)}
 if(!reqs.some(r=>r[0]==='fb_item'&&r[1].p_key==='bank:bk_ara01'))E('مفتاح المورد غير صحيح '+JSON.stringify(reqs));
 if(await ov()>0)E('تجاوز أفقي مع الزر');
 // 2) صفحة بلا مورد أو مورد غير مقبول: لا زر
 await load('/zad-store/home/');if(await p.$('.zfb-btn'))E('زر في صفحة ليست مورد');
 itemOk=false;await load('/zad-store/bank/play/?s=hidden');if(await p.$('.zfb-btn'))E('زر لمورد غير منشور');itemOk=true;
 // 3) النافذة: اسم المورد تلقائي، بلا حقول شخصية
 await load('/zad-store/bank/play/?s=bk_ara01');await p.click('.zfb-btn.fl');
 let t=await p.textContent('.zfb-d');if(!t.includes('نشاط العد للصف الأول'))E('اسم المورد لا يُملأ تلقائيًا');
 const inputs=await p.$$eval('.zfb-d [data-v=form] input, .zfb-d [data-v=form] textarea, .zfb-d [data-v=form] select',e=>e.map(x=>x.id));if(inputs.join()!=='zfbk,zfbt')E('حقول النموذج '+inputs);
 const kinds=await p.$$eval('#zfbk option',e=>e.map(x=>x.textContent).filter((x,i)=>i>0));if(kinds.length!==10||!kinds.includes('عدم مناسبة المورد للعمر أو الصف')||!kinds.includes('طلب إضافة محتوى جديد'))E('أنواع الملاحظات '+kinds.length);
 if(!t.includes('لا نطلب أي بيانات شخصية'))E('تنبيه الخصوصية');
 if(await ov()>0)E('تجاوز أفقي مع النافذة');
 const box=await p.$eval('.zfb-d',e=>{const r=e.getBoundingClientRect();return[r.left,r.right,r.bottom,innerWidth,innerHeight]});if(box[0]<-1||box[1]>box[3]+1)E('النافذة خارج الشاشة '+box);
 // 4) تحقق قبل الإرسال لا يرسل شيئًا
 reqs=[];await p.click('#zfbs');if(!(await p.textContent('#zfbe')).includes('اختر نوع الملاحظة'))E('تحقق النوع');await p.selectOption('#zfbk','info_error');await p.fill('#zfbt','ab');await p.click('#zfbs');if(!(await p.textContent('#zfbe')).includes('5 أحرف'))E('تحقق الوصف');if(reqs.some(r=>r[0]==='fb_submit'))E('أُرسل طلب رغم عدم اكتمال النموذج');
 // 5) فشل الشبكة: لا رسالة نجاح، الزر يعود، والنص محفوظ
 await p.fill('#zfbt','الإجابة في السؤال الثالث غير صحيحة');mode='abort';await p.click('#zfbs');await p.waitForTimeout(300);
 t=await p.textContent('.zfb-d');if(t.includes('شكرًا لك، وصلت')||!t.includes('لم تُحفظ الملاحظة'))E('فشل الشبكة يجب ألا يعرض نجاحًا: '+t.slice(0,200));if(await p.$eval('#zfbs',e=>e.disabled))E('الزر مقفل بعد الفشل');if((await p.inputValue('#zfbt'))!=='الإجابة في السؤال الثالث غير صحيحة')E('ضاع النص بعد الفشل');
 // 6) رفض الخادم: الرسالة العربية تظهر بلا نجاح
 mode='server';await p.click('#zfbs');await p.waitForTimeout(300);t=await p.textContent('#zfbe');if(!t.includes('لا تكتب أرقام هواتف'))E('رسالة الخادم '+t);if((await p.textContent('.zfb-d')).includes('ZF-'))E('نجاح وهمي بعد رفض الخادم');
 // 7) رد بلا رقم مرجعي ليس نجاحًا
 mode='noref';await p.click('#zfbs');await p.waitForTimeout(300);if((await p.textContent('.zfb-d')).includes('شكرًا لك، وصلت'))E('نجاح دون رقم مرجعي');
 // 8) ضغط مزدوج سريع: طلب واحد فقط، وإعادة المحاولة بالرمز نفسه
 const clients=reqs.filter(r=>r[0]==='fb_submit').map(r=>r[1].p_client);if(new Set(clients).size!==1)E('رمز العملية يجب أن يثبت عند إعادة المحاولة '+clients);
 mode='ok';delay=500;reqs=[];await p.evaluate(()=>{const b=document.querySelector('#zfbs');b.click();b.click();b.click()});await p.waitForTimeout(900);delay=0;
 const subs=reqs.filter(r=>r[0]==='fb_submit');if(subs.length!==1)E('الضغط المتعدد أرسل '+subs.length+' طلبات');
 const body=subs[0]&&subs[0][1];if(!body||Object.keys(body).sort().join()!=='p_body,p_client,p_dev,p_key,p_kind'||body.p_key!=='bank:bk_ara01'||body.p_kind!=='info_error')E('محتوى الطلب '+JSON.stringify(body));
 if(body&&/https?:|t\.test/.test(JSON.stringify(body)))E('الطلب يحمل رابطًا لا حاجة له');
 t=await p.textContent('.zfb-d');if(!t.includes('ZF-AB12CD')||!t.includes('شكرًا لك'))E('رسالة النجاح والرقم المرجعي '+t.slice(0,200));
 if(await ov()>0)E('تجاوز أفقي بعد الإرسال');
 await p.click('#zfbd');if(await p.$('.zfb-ov'))E('لا تُغلق بعد «تم»');
 // 9) إلغاء وEsc وإرجاع التركيز
 await p.click('.zfb-btn.fl');await p.click('#zfbx');if(await p.$('.zfb-ov'))E('إلغاء');
 await p.click('.zfb-btn.fl');await p.keyboard.press('Escape');if(await p.$('.zfb-ov'))E('Esc');if(!(await p.evaluate(()=>document.activeElement.classList.contains('zfb-btn'))))E('التركيز لا يعود للزر');
 // 10) تتبع بالرقم المرجعي
 await p.click('.zfb-btn.fl');await p.click('#zfbq');await p.fill('#zfbr','zf-ab12cd');await p.click('#zfbg');await p.waitForTimeout(250);t=await p.textContent('#zfbo');if(!t.includes('تمت المعالجة')||!t.includes('عالجنا المشكلة'))E('تتبع الحالة '+t);
 await p.fill('#zfbr','ZF-XXXXXX');await p.click('#zfbg');await p.waitForTimeout(250);if(!(await p.textContent('#zfbo')).includes('لم نجد'))E('رقم غير موجود');
 // 11) طباعة: الزر مخفي
 await p.keyboard.press('Escape');await p.emulateMedia({media:'print'});if(await p.$eval('.zfb-btn.fl',e=>getComputedStyle(e).display)!=='none')E('الزر يظهر في الطباعة');await p.emulateMedia({media:'screen'});
 if(jserr.length)E('أخطاء JS '+jserr);
 await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
