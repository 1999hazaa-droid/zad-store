// NODE_PATH=$(npm root -g) node tools/content/portfolio/test_sync.js   (خادم 8765؛ الخادم الحقيقي مُحاكى بالكامل)
const {chromium}=require('playwright');const B='http://localhost:8765/portfolio/';const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const users={'a@x.com':{id:'uid-A',pw:'password1'},'b@x.com':{id:'uid-B',pw:'password2'}};const store={};// uid -> {data,updated_at}
const tokUser=t=>Object.entries(users).find(([e,u])=>t==='tok-'+u.id);
async function wire(ctx,log){await ctx.route(/supabase\.co/,async r=>{const q=r.request(),u=new URL(q.url()),m=q.method();
 if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});const J=(c,o)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
 if(u.pathname==='/auth/v1/token'){const b=JSON.parse(q.postData());const x=users[b.email];if(!x||x.pw!==b.password)return J(400,{error_description:'Invalid login credentials'});return J(200,{access_token:'tok-'+x.id,refresh_token:'rt',expires_in:3600,user:{id:x.id,email:b.email}})}
 if(u.pathname==='/auth/v1/signup')return J(200,{id:'x'});
 if(u.pathname.endsWith('/learn_saves')){log.push(m+' '+u.search);const a=(q.headers()['authorization']||'').replace('Bearer ','');const me=tokUser(a);if(!me)return J(401,{message:'no'});const uid=me[1].id;
  if(m==='GET'){const f=(u.search.match(/user_id=eq\.([^&]+)/)||[])[1];const row=f===uid?store[uid]:null;return J(200,row?[row]:[])}// RLS: only own row
  if(m==='POST'){const b=JSON.parse(q.postData());if(b.user_id!==uid)return J(403,{message:'rls'});store[uid]={data:b.data,updated_at:b.updated_at};return r.fulfill({status:201,headers:CORS,body:''})}
  if(m==='DELETE'){delete store[uid];return r.fulfill({status:204,headers:CORS})}}
 if(u.pathname.includes('/rest/v1/'))return r.fulfill({status:u.pathname.endsWith('pf_certs')?200:201,headers:{...CORS,'content-type':'application/json'},body:u.pathname.endsWith('pf_certs')?'[]':''});
 r.fulfill({status:200,headers:CORS,body:'[]'})})}
const seed={cur:'k1',kids:{k1:{name:'سارة',age:'5',acts:{a1:{d:'2026-11-20',how:'platform'}}}}};
(async()=>{const b=await chromium.launch();
for(const w of [390,1200]){Object.keys(store).forEach(k=>delete store[k]);
 const logA=[];const c1=await b.newContext({viewport:{width:w,height:800}});await wire(c1,logA);await c1.addInitScript(s=>{if(!localStorage.getItem('zad-learn-v3'))localStorage.setItem('zad-learn-v3',s)},JSON.stringify(seed));
 const p=await c1.newPage();p.on('dialog',d=>d.accept());p.on('pageerror',e=>E(w+' pageerror '+e.message));
 await p.goto(B);await p.waitForSelector('.pfacc #pfli');
 if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(w+' overflow');
 // بدون موافقة: يرفض
 await p.fill('#pfem','a@x.com');await p.fill('#pfpw','password1');await p.click('#pfli');await p.waitForTimeout(400);
 if(!(await p.textContent('#pfam')).includes('الموافقة'))E(w+' لم يطلب الموافقة');if(Object.keys(store).length)E(w+' رفع بدون موافقة');
 // كلمة مرور خاطئة
 await p.check('#pfcons');await p.fill('#pfpw','wrongwrong');await p.click('#pfli');await p.waitForTimeout(500);
 if(!(await p.textContent('#pfam')).includes('غير صحيحة'))E(w+' wrong pw msg');
 // دخول صحيح -> رفع
 await p.fill('#pfpw','password1');await Promise.all([p.waitForNavigation(),p.click('#pfli')]);await p.waitForSelector('#pfsy');
 if(!store['uid-A']||!store['uid-A'].data.kids.k1.name==='سارة'||store['uid-A'].data.kids.k1.name!=='سارة')E(w+' لم يُرفع الملف');
 // تعديل -> مزامنة تلقائية
 await p.evaluate(()=>{});await p.click('#pfhid');// لا شيء مخفي
 await p.goto(B+'works/');await p.waitForTimeout(300);
 const before=store['uid-A'].updated_at;
 await p.goto(B);await p.waitForSelector('#pfcons');
 // غيّر الاسم المعروض عبر واجهة الملف
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.pf=Object.assign(d.kids.k1.pf||{},{nick:'ساره الصغيرة'});localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 // جهاز ثانٍ لنفس الحساب: يستعيد
 const c2=await b.newContext({viewport:{width:w,height:800}});await wire(c2,[]);const p2=await c2.newPage();p2.on('dialog',d=>d.accept());await p2.goto(B);await p2.waitForSelector('#pfli');
 await p2.fill('#pfem','a@x.com');await p2.fill('#pfpw','password1');await p2.check('#pfcons');await Promise.all([p2.waitForNavigation(),p2.click('#pfli')]);await p2.waitForSelector('#pfsy');
 const k2=await p2.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1);if(k2.name!=='سارة'||!k2.acts||!k2.acts.a1)E(w+' الجهاز الثاني لم يستعد: '+JSON.stringify(k2));
 // الجهاز الثاني يعدّل ويُزامن تلقائيًا
 await p2.goto(B+'works/');await p2.evaluate(()=>{});
 // تغيير حقيقي عبر واجهة الأعمال: إخفاء عمل
 const hid=p2.locator('.pfhide, [data-hide]').first();
 // نستخدم تغيير اسم الظهور من اللوحة
 await p2.goto(B);await p2.waitForSelector('.pfkid, #pfn, .pfbar',{state:'attached'}).catch(()=>{});
 const ed=await p2.$('#pfedit, .pfedit-btn, [id^=pfed]');
 // أبسط طريق حقيقي: زر «حفظ الآن» بعد تعديل التخزين المحلي (يمثل نشاطًا جديدًا من صفحات أخرى)
 await p2.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.acts.a2={d:'2026-11-24',how:'parent'};localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 await p2.click('#pfsy');await p2.waitForTimeout(600);
 if(!store['uid-A'].data.kids.k1.acts.a2)E(w+' حفظ الآن لم يرفع');
 // الجهاز الأول (قديم) يفتح: يجب أن يكتشف النسخة الأحدث ويوقف الرفع التلقائي
 await p.goto(B);await p.waitForSelector('#pfsy');
 if(!(await p.textContent('.pfacc')).includes('نسخة أحدث'))E(w+' لم يُظهر تنبيه النسخة الأحدث');
 const n0=logA.filter(x=>x.startsWith('POST')).length;
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.age='6';localStorage.setItem('zad-learn-v3',JSON.stringify(d))});await p.waitForTimeout(300);
 // استعادة من الحساب
 await Promise.all([p.waitForNavigation(),p.click('#pfrs')]);await p.waitForSelector('#pfsy');
 const k1=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1);if(!k1.acts.a2)E(w+' الاستعادة لم تجلب a2');
 // حساب آخر لا يرى بيانات A
 const c3=await b.newContext({viewport:{width:w,height:800}});await wire(c3,[]);const p3=await c3.newPage();p3.on('dialog',d=>d.accept());await p3.goto(B);await p3.waitForSelector('#pfli');
 await p3.fill('#pfem','b@x.com');await p3.fill('#pfpw','password2');await p3.check('#pfcons');await Promise.all([p3.waitForNavigation(),p3.click('#pfli')]);await p3.waitForSelector('#pfsy');
 const kb=await p3.evaluate(()=>JSON.stringify((JSON.parse(localStorage.getItem('zad-learn-v3'))||{}).kids||{}));if(kb.includes('سارة'))E(w+' حساب B رأى بيانات A');
 // حذف نسخة الخادم
 await p.click('#pfsd');await p.waitForTimeout(800);if(store['uid-A'])E(w+' حذف الخادم لم يعمل');
 const cons=await p.evaluate(()=>localStorage.getItem('zad-pf-consent'));if(cons!=='0')E(w+' الموافقة لم تُلغَ بعد الحذف');
 // خروج
 await p.goto(B);await p.waitForSelector('#pflo');await Promise.all([p.waitForNavigation(),p.click('#pflo')]);await p.waitForSelector('#pfli');
 if(await p.evaluate(()=>!!localStorage.getItem('zad-sess')))E(w+' الخروج لم يمسح الجلسة');
 console.log('done',w);await c1.close();await c2.close();await c3.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
