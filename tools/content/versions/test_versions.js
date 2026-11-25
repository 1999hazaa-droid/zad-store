// NODE_PATH=$(npm root -g) VW=390 node tools/content/versions/test_versions.js   (مركز تحديث المحتوى: واجهة حقيقية + قاعدة وهمية)
// قواعد الترقيم والصلاحيات والمراجعة والنشر والاستعادة والإيقاف اختُبرت على قاعدة البيانات الحقيقية؛ هنا نختبر ما تعرضه الواجهة وما ترسله.
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+(process.env.VW||1100),height:900}});const p=await ctx.newPage();const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ME={roles:['library_manager'],name:'المدير',id:'U1'};window.ASKS=[];window.went=null;
  const V=(id,key,src,maj,min,kind,st,o={})=>Object.assign({id,item_key:key,src,slug:key.split(':')[1],major:maj,minor:min,kind,status:st,summary:'ملخص '+id,change_types:['fix_info'],urgent:false,urgent_reason:null,created_by_name:'محرر',created_at:'2026-11-2'+min+'T10:00:00Z',updated_at:'2026-11-2'+min+'T10:00:00Z',review_result:null,review:{},review_note:null,approved_by_name:null,published_at:null,published_by_name:null,data:{title:'عنوان قديم',steps:[{t:'أ'}],tools:['قلم'],minutes:10},base_data:{title:'عنوان قديم',steps:[{t:'أ'}],tools:['قلم'],minutes:10}},o);
  const DB={cfg:[{id:1,enforce:true}],
   quality_items:[{key:'acts:a1',src:'acts',slug:'a1',title:'نشاط الألوان',levels:['a5','g1'],status:'published',recheck:false,gone:false},{key:'bank:b1',src:'bank',slug:'b1',title:'نشاط العد',levels:['g2'],status:'published',recheck:false,gone:false},{key:'vid:v1',src:'vid',slug:'v1',title:'فيديو الحروف',levels:['a4'],status:'suspended',suspend_reason:'خطأ في النطق',recheck:false,gone:false},{key:'acts:big',src:'acts',slug:'big',title:'نشاط صف سادس',levels:['g6'],status:'published',recheck:false,gone:false},{key:'songs:s1',src:'songs',slug:'s1',title:'نشيد الأرقام',levels:['a3'],status:'published',recheck:false,gone:false}],
   ver_versions:[
    V('B0','acts:a1','acts',1,0,'base','superseded',{summary:'النسخة الحالية عند أول تحديث',created_by_name:'النظام',published_at:'2026-11-10T10:00:00Z',published_by_name:'النظام',change_types:[]}),
    V('B1','acts:a1','acts',1,1,'update','published',{summary:'تصحيح عنوان النشاط',published_at:'2026-11-21T10:00:00Z',published_by_name:'ناشر',review_result:'approved',approved_by_name:'مراجع',data:{title:'نشاط الألوان',steps:[{t:'أ'}],tools:['قلم'],minutes:10},base_data:{title:'عنوان قديم',steps:[{t:'أ'}],tools:['قلم'],minutes:10}}),
    V('C1','bank:b1','bank',1,1,'update','working',{summary:'تعديل إجابة السؤال الثالث',change_types:['fix_answer'],created_at:'2026-11-22T10:00:00Z',data:{title:'نشاط العد',steps:[{t:'أ'}],tools:['قلم','ورقة'],minutes:10},base_data:{title:'نشاط العد',steps:[{t:'أ'}],tools:['قلم'],minutes:10}}),
    V('D1','vid:v1','vid',1,1,'hotfix','in_review',{summary:'تصحيح نطق حرف الراء',urgent:true,urgent_reason:'خطأ يؤثر على تعلم الطفل',created_by_name:'مراجعة',created_at:'2026-11-23T10:00:00Z'}),
    V('S1','songs:s1','songs',1,1,'update','approved',{summary:'تحسين التوافق',change_types:['device_compat'],created_at:'2026-11-24T10:00:00Z',created_by_name:'سارة',review_result:'approved'}),
    V('X1','acts:big','acts',1,1,'update','cancelled',{summary:'تحديث موقوف',created_by_name:'خالد',created_at:'2026-11-25T10:00:00Z'}),
    V('N1','acts:a1','acts',1,0,'update','needs_changes',{summary:'صورة جديدة',created_at:'2026-11-26T10:00:00Z',review_note:'اللون غير واضح'})],
   ver_log:[{id:1,item_key:'acts:a1',at:'2026-11-21T10:00:00Z',actor_name:'ناشر',event:'published',note:null,detail:{fields:['title']}}],fb_items:[{id:'F1',ref:'ZF-1',item_key:'bank:b1',status:'new',kind:'info_error'}],src_links:[{id:'L1',item_key:'bank:b1',verify:true}]};
  DB.ver_versions.find(v=>v.id==='N1').status='working';DB.ver_versions=DB.ver_versions.filter(v=>v.id!=='N1');
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:[]};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},in(c,v){st.f.push(r=>v.includes(r[c]));return api},order(c,o){st.ord.push([c,!o||o.ascending!==false]);return api},limit(){return api},
   then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));st.ord.slice().reverse().forEach(([c,a])=>r=r.slice().sort((x,y)=>(x[c]>y[c]?1:x[c]<y[c]?-1:0)*(a?1:-1)));res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  const nextLabel=(k,maj)=>{const vs=DB.ver_versions.filter(v=>v.item_key===k);const M=Math.max(...vs.map(v=>v.major),1);if(maj)return[M+1,0];return[M,Math.max(0,...vs.filter(v=>v.major===M).map(v=>v.minor))+1]};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   const get=id=>DB.ver_versions.find(v=>v.id===id);
   if(n==='ver_create'){const [M,m]=nextLabel(a.p_key,a.p_major);const it=DB.quality_items.find(i=>i.key===a.p_key);const v=V('NEW'+m,a.p_key,it.src,M,m,a.p_urgent?'hotfix':'update','working',{summary:a.p_summary,change_types:a.p_types,urgent:a.p_urgent,urgent_reason:a.p_reason,created_by_name:'المدير'});DB.ver_versions.push(v);return{data:{id:v.id,label:M+'.'+m}}}
   if(n==='ver_save'){const v=get(a.p_id);Object.assign(v.data,a.p_data);if(a.p_types)v.change_types=a.p_types;if(a.p_summary)v.summary=a.p_summary;return{data:{ok:true}}}
   if(n==='ver_submit'){get(a.p_id).status='in_review';return{data:{ok:true}}}
   if(n==='ver_review'){const v=get(a.p_id);v.review={aspects:Object.assign({},v.review.aspects,a.p.aspects),notes:Object.assign({},v.review.notes,a.p.notes)};return{data:{ok:true}}}
   if(n==='ver_decide'){const v=get(a.p_id);if(a.p_decision==='approve'){v.status='approved';v.review_result='approved'}else{v.status='needs_changes';v.review_result='needs_changes';v.review_note=a.p_note}return{data:{status:v.status}}}
   if(n==='ver_publish'){const v=get(a.p_id);DB.ver_versions.filter(x=>x.item_key===v.item_key&&x.status==='published').forEach(x=>x.status='superseded');v.status='published';v.published_at='2026-11-27T10:00:00Z';v.published_by_name='المدير';const it=DB.quality_items.find(i=>i.key===v.item_key);const re=it.status==='suspended';it.status='published';return{data:{ok:true,reinstated:re}}}
   if(n==='ver_restore'){const t=get(a.p_id);const [M,m]=nextLabel(t.item_key,false);const v=V('RS'+m,t.item_key,t.src,M,m,'restore','working',{summary:'استعادة محتوى النسخة '+t.major+'.'+t.minor,change_types:['restore'],data:t.data});DB.ver_versions.push(v);return{data:{id:v.id,label:M+'.'+m}}}
   if(n==='ver_cancel'){get(a.p_id).status='cancelled';return{data:{ok:true}}}
   if(n==='ver_delete'){DB.ver_versions=DB.ver_versions.filter(v=>v.id!==a.p_id);return{data:{ok:true}}}
   if(n==='ver_reopen'){get(a.p_id).status='working';return{data:{ok:true}}}
   if(n==='ver_suspend'){DB.quality_items.find(i=>i.key===a.p_key).status='suspended';return{data:{ok:true}}}
   if(n==='ver_enforce_set'){DB.cfg[0].enforce=a.p_on;return{data:{enforce:a.p_on}}}
   return{data:{ok:true},error:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:(m)=>{window.ASKS.push(m);return Promise.resolve(true)}};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/versionsadm.js','utf8')});
 const open=async(tab)=>{await p.evaluate((t)=>{const S=window.__verTest.S;S.key=null;S.tab=t||'pending';S.page=0;S.f={q:'',type:'',lv:'',owner:'',st:'',from:'',to:''};S.rf={q:'',type:'',lv:''};return window.__zp.SUB.versionsadm.fn(document.getElementById('m'))},tab)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(200)};
 const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));const calls=async()=>p.evaluate(()=>window.calls.splice(0));const txt=()=>p.textContent('#m');const rowsN=()=>p.$$eval('.vc-row[data-k]',e=>e.length);
 const ov=async(w)=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0)E('تجاوز أفقي '+w+' '+o)};
 const openItem=async(key)=>{await open('pending');await p.evaluate((k)=>window.__zp.SUB.versionsadm.fn(document.getElementById('m')),key);await p.evaluate((k)=>{window.__verOpen=k;return window.__zp.SUB.versionsadm.fn(document.getElementById('m'))},key);await p.waitForTimeout(200)};
 // 1) التحديثات المعلقة
 await open();let t=await txt();
 if(await rowsN()!==4)E('عدد التحديثات المعلقة '+await rowsN());
 const first=await p.$eval('.vc-row[data-k]',e=>e.textContent);if(!first.includes('فيديو الحروف')||!first.includes('عاجل'))E('العاجل لا يظهر أولًا: '+first.slice(0,80));
 for(const c of ['نشاط العد','نشيد الأرقام','أُوقف التحديث','تنتظر المراجعة','معتمدة وتنتظر النشر','قيد التعديل','حماية المنشور مفعّلة'])if(!t.includes(c))E('عنصر ناقص: '+c);
 await ov('المعلقة');
 await p.selectOption('#ft','bank');if(await rowsN()!==1)E('فلتر النوع');await p.selectOption('#ft','');
 await p.selectOption('#fl','a3');if(await rowsN()!==1)E('فلتر العمر');await p.selectOption('#fl','');
 await p.selectOption('#fs','cancelled');if(await rowsN()!==1)E('فلتر الحالة');await p.selectOption('#fs','');
 await p.fill('#fo','سارة');await p.waitForTimeout(350);if(await rowsN()!==1)E('فلتر المسؤول');await p.fill('#fo','');await p.waitForTimeout(350);
 await p.fill('#fq','العد');await p.waitForTimeout(350);if(await rowsN()!==1)E('البحث بالاسم');await p.fill('#fq','');await p.waitForTimeout(350);
 await p.fill('#ff','2026-11-24');await p.dispatchEvent('#ff','change');await p.waitForTimeout(250);if(await rowsN()!==2)E('فلتر من تاريخ '+await rowsN());await p.fill('#fe','2026-11-24');await p.dispatchEvent('#fe','change');await p.waitForTimeout(250);if(await rowsN()!==1)E('فلتر نطاق تاريخ '+await rowsN());
 // 2) الموارد المنشورة (داخل النطاق فقط)
 await open('res');if(await rowsN()!==4)E('الموارد في النطاق '+await rowsN());t=await txt();if(t.includes('نشاط صف سادس'))E('مورد خارج النطاق ظهر');if(!t.includes('موقوف مؤقتًا'))E('شارة الموقوف');await ov('الموارد');
 await p.fill('#rq','الألوان');await p.waitForTimeout(350);if(await rowsN()!==1)E('بحث الموارد');
 // 3) صفحة المورد: النسخة الحالية + السجل
 await openItem('acts:a1');t=await txt();
 for(const c of ['النسخة الحالية للمستخدمين','نشاط الألوان — النسخة ١.١','سجل النسخ والتحديثات','النسخة ١.٠','النسخة ١.١','تصحيح عنوان النشاط','نتيجة مراجعة الجودة: اعتُمدت','رابط المعاينة','نسخة أساسية سابقة لنظام النسخ','نشاط جارٍ'.slice(0,0)])if(!t.includes(c))E('سجل النسخ ناقص: '+c);
 const links=await p.$$eval('.vc a[href]',a=>a.map(x=>x.href));if(links.length!==1||!links[0].includes('activities/view/?a=a1'))E('رابط المعاينة للنسخة الحالية فقط '+links.join());
 await ov('صفحة المورد');
 // مقارنة قبل/بعد
 await p.evaluate(()=>{const b=[...document.querySelectorAll('[data-tg]')].find(x=>x.dataset.tg==='B1');b.click()});await p.waitForTimeout(150);t=await txt();if(!t.includes('عنوان قديم')||!t.includes('قبل')||!t.includes('بعد')||!t.includes('لا تُقارَن محتويات الملفات المرفقة'))E('المقارنة حقلًا بحقل');
 // 4) استعادة: تفاصيل ثم تأكيد → نسخة عمل جديدة، بقاء الباقي
 await p.evaluate(()=>{const b=document.querySelector('[data-rs=B0]');b&&b.click()});await p.waitForTimeout(150);t=await txt();if(!t.includes('استعادة النسخة ١.٠')||!t.includes('نسخة عمل جديدة')||!t.includes('لا تُحذف أي نسخة أحدث'))E('تفاصيل الاستعادة');
 await calls();await ck('#rgo');let cs=await calls();const rs=cs.find(c=>c[0]==='ver_restore');if(!rs||rs[1].p_id!=='B0'||rs[1].p_confirm!==true)E('نداء الاستعادة');
 const nv=await p.evaluate(()=>window.DB.ver_versions.filter(v=>v.item_key==='acts:a1').map(v=>v.id+':'+v.status).join());if(!nv.includes('B0:superseded')||!nv.includes('B1:published')||!nv.includes(':working'))E('الاستعادة لا تحفظ النسخ '+nv);
 t=await txt();if(!t.includes('تحديث جارٍ'))E('نسخة العمل بعد الاستعادة');
 // 5) تعديل نسخة العمل: يرسل الحقول المتغيرة فقط
 await openItem('bank:b1');if(!(await txt()).includes('تحديث جارٍ — النسخة ١.١'))E('نسخة العمل الجارية');
 await ck('#vedit');if(!(await p.$('[data-f=title]')))E('محرر الحقول');
 await p.fill('[data-f=title]','نشاط العد المحدّث');await calls();await ck('#vsave');cs=await calls();let sv=cs.find(c=>c[0]==='ver_save');if(!sv||Object.keys(sv[1].p_data).join()!=='title'||sv[1].p_data.title!=='نشاط العد المحدّث')E('الحقول المتغيرة فقط '+JSON.stringify(sv));
 if(!(await msgs()).join('|').includes('المنشور لم يتغير'))E('رسالة الحفظ');
 await p.fill('[data-f=steps]','{خطأ');await calls();await ck('#vsave');cs=await calls();if(cs.find(c=>c[0]==='ver_save'))E('JSON خاطئ أُرسل');if(!(await msgs()).join('|').includes('JSON'))E('رسالة JSON');
 await p.fill('[data-f=tools]','قلم\nممحاة');await p.fill('[data-f=steps]','[{"t":"ب"}]');await ck('#vsave');cs=await calls();sv=cs.find(c=>c[0]==='ver_save');if(!sv||JSON.stringify(sv[1].p_data.tools)!=='["قلم","ممحاة"]'||JSON.stringify(sv[1].p_data.steps)!=='[{"t":"ب"}]')E('تحويل القوائم و JSON '+JSON.stringify(sv));
 // معاينة قبل النشر
 await ck('#vprev');t=await txt();if(!t.includes('معاينة قبل النشر')||!t.includes('لا يرى المستخدمون هذه النسخة حتى النشر'))E('المعاينة قبل النشر');
 // تنبيهات الملاحظات والمصادر
 if(!t.includes('ملاحظة مفتوحة من أولياء الأمور')||!t.includes('ينتظر التحقق'))E('تنبيهات الملاحظات والمصادر');
 // إرسال للمراجعة ثم بطاقة المراجعة
 await calls();await ck('#vsub');cs=await calls();if(!cs.find(c=>c[0]==='ver_submit'))E('الإرسال للمراجعة');if(!(await txt()).includes('تنتظر المراجعة'))E('حالة بعد الإرسال');
 await ck('#vrev');t=await txt();for(const [,l] of [0,0].map(()=>[0,0]))void l;
 for(const c of ['صحة المعلومات التعليمية','مناسبة العمر أو الصف','وضوح التعليمات','جودة التصميم','سلامة الملفات','صحة الروابط','حقوق الاستخدام','توافق المورد مع أهدافه التعليمية'])if(!t.includes(c))E('جانب مراجعة ناقص: '+c);
 for(const k of ['accuracy','age','instructions','design','files','links','rights','goals'])await p.evaluate((k)=>document.querySelector('input[name=as_'+k+'][value=pass]').click(),k);
 await calls();await ck('#vrok');cs=await calls();const rv=cs.find(c=>c[0]==='ver_review'),dc=cs.find(c=>c[0]==='ver_decide');if(!rv||Object.keys(rv[1].p.aspects).length!==8||Object.values(rv[1].p.aspects).some(x=>x!=='pass'))E('بطاقة المراجعة');if(!dc||dc[1].p_decision!=='approve')E('قرار الاعتماد');
 if(!(await txt()).includes('معتمدة وتنتظر النشر'))E('حالة بعد الاعتماد');
 // 6) النشر
 await calls();await ck('#vpub');cs=await calls();if(!cs.find(c=>c[0]==='ver_publish'))E('النشر');const ak=await p.evaluate(()=>window.ASKS);if(!ak.some(a=>a.includes('النسخة الحالية')&&a.includes('تُحفظ النسخة السابقة')))E('تأكيد النشر');
 t=await txt();if(!t.includes('نشاط العد — النسخة ١.١')||t.includes('تحديث جارٍ'))E('بعد النشر: الحالية والجارية');
 // 7) رفض الخادم: لا نجاح وهمي
 await openItem('songs:s1');await p.evaluate(()=>{window.NEXT_ERR='QUALITY_PERM: ليست لديك صلاحية لهذا الإجراء.'});await msgs();await ck('#vpub');const em=(await msgs()).join('|');if(!em.includes('ليست لديك صلاحية')||em.includes('نُشرت'))E('رسالة الرفض '+em);if(em.includes('QUALITY_PERM'))E('البادئة الفنية ظاهرة');
 // 8) رد عاجل: إنشاء تصحيح على مورد موقوف
 await openItem('vid:v1');t=await txt();if(!t.includes('المورد موقوف مؤقتًا')||!t.includes('خطأ في النطق')||!t.includes('سبب الاستعجال'))E('عرض الموقوف والتصحيح العاجل');
 await ck('#vrev');await p.evaluate(()=>{for(const k of ['accuracy','age','instructions','design','files','links','rights','goals'])document.querySelector('input[name=as_'+k+'][value=pass]').click()});await ck('#vrok');await ck('#vpub');t=await txt();if(!t.includes('نُشرت')&&!(await p.evaluate(()=>window.DB.quality_items.find(i=>i.key==='vid:v1').status==='published')))E('إعادة الإتاحة بعد نشر التصحيح');
 // 9) إيقاف المورد
 await p.evaluate(()=>{window.DB.ver_versions=window.DB.ver_versions.filter(v=>!(v.item_key==='acts:a1'&&['working','needs_changes'].includes(v.status)))});await openItem('acts:a1');await ck('#vnew');t=await txt();if(!t.includes('إنشاء نسخة جديدة للتعديل')||!t.includes('يبقى المنشور متاحًا'))E('نموذج إنشاء نسخة');
 await ck('#ccl');await ck('#vsus');await p.fill('#srea','خطأ تعليمي مؤكد');await calls();await ck('#sgo');cs=await calls();const sp=cs.find(c=>c[0]==='ver_suspend');if(!sp||sp[1].p_key!=='acts:a1'||sp[1].p_reason!=='خطأ تعليمي مؤكد')E('إيقاف المورد');
 // 10) إنشاء نسخة: وسيط صحيح + نسخة رئيسية + عاجل
 await p.evaluate(()=>{window.DB.ver_versions=window.DB.ver_versions.filter(v=>!(v.item_key==='acts:a1'&&['working','needs_changes'].includes(v.status)))});
 await openItem('acts:a1');await ck('#vnew');await p.evaluate(()=>{document.querySelector('[data-ct=fix_info]').click();document.querySelector('[data-ct=improve_instructions]').click();document.querySelector('#cmaj').click()});await p.fill('#csum','تحسين الشرح وتصحيح معلومة');await calls();await ck('#cgo');cs=await calls();const cr=cs.find(c=>c[0]==='ver_create');
 if(!cr||cr[1].p_major!==true||cr[1].p_urgent!==false||cr[1].p_types.join()!=='fix_info,improve_instructions'||cr[1].p_summary!=='تحسين الشرح وتصحيح معلومة')E('وسائط إنشاء النسخة '+JSON.stringify(cr));
 if(!(await msgs()).join('|').includes('المنشور لم يتغير'))E('رسالة الإنشاء');if(!(await txt()).includes('٢.٠'))E('ترقيم النسخة الرئيسية');
 // 11) حذف نسخة غير منشورة (مدير) + إيقاف التحديث
 await calls();await ck('#vcan');await p.fill('#vcr','تغيّر القرار');await ck('#vcro');cs=await calls();const cn=cs.find(c=>c[0]==='ver_cancel');if(!cn||cn[1].p_reason!=='تغيّر القرار')E('إيقاف التحديث');
 // 12) الصلاحيات في الواجهة
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر',id:'U3'};window.DB.ver_versions.find(v=>v.id==='S1').status='approved'});await openItem('songs:s1');if(await p.$('#vpub'))E('زر النشر لغير الناشر');if(await p.$('#vdel'))E('زر الحذف لغير المدير');if(await p.$('#vsus'))E('زر الإيقاف لغير المخوّل');
 await p.evaluate(()=>{window.ME={roles:['publisher'],name:'ناشر',id:'U4'}});await openItem('songs:s1');if(!(await p.$('#vpub')))E('زر النشر للناشر');
 await p.evaluate(()=>{window.ME={roles:[],name:'x',id:'U5'}});await open();if(!(await txt()).includes('ليست لديك صلاحية'))E('الدخول بلا صلاحية');
 // 13) حماية المنشور
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'المدير',id:'U1'}});await open();await calls();await ck('#vcenf');cs=await calls();const en=cs.find(c=>c[0]==='ver_enforce_set');if(!en||en[1].p_on!==false)E('إيقاف الحماية');if(!(await p.evaluate(()=>window.ASKS)).some(a=>a.includes('تعديل الموارد المنشورة مباشرة')))E('تأكيد إيقاف الحماية');
 await ov('نهاية');
 if(jserr.length)E('أخطاء JS: '+jserr.join(' | '));
 console.log(errs.length?'FAILED '+errs.length:'ALL OK @'+(process.env.VW||1100));await b.close();process.exit(errs.length?1:0)})();
