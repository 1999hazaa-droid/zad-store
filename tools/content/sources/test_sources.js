// NODE_PATH=$(npm root -g) node tools/content/sources/test_sources.js   (واجهة مركز المصادر: واجهة حقيقية + قاعدة وهمية في الذاكرة)
// قواعد الاعتماد والحذف والصلاحيات والفحص نفسها اختُبرت على قاعدة البيانات الحقيقية (انظر LIMITS.md)؛ هنا نختبر الواجهة وما ترسله وما تعرضه.
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+(process.env.VW||1100),height:900}});const p=await ctx.newPage();
 const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.__srcPoll=0;window.ME={roles:['library_manager'],name:'المدير'};window.ASKS=[];
  const S0=(id,t,o={})=>Object.assign({id,title:t,author:null,kind:'book',publisher:null,pub_date:null,upd_date:null,url:null,edition:null,lang:'unknown',dom:null,levels:[],summary:null,team_notes:null,status:'needs_review',rights:'unclear',rights_terms:null,checklist:{},last_review:null,next_review:null,review_note:null,link_status:'unchecked',link_checked_at:null,updated_at:'2026-11-20T10:00:00Z'},o);
  const DB={src_sources:[
   S0('S1','دليل تعليم القراءة المبكرة',{author:'جهة تربوية',kind:'literacy',dom:'arabic',levels:['a5','a6'],status:'active',rights:'quote_limited',link_status:'ok',url:'https://example-edu.org/guide'}),
   S0('S2','مرجع الرياضيات الأساسية',{kind:'math',dom:'math',levels:['g1','g2'],status:'needs_review',rights:'unclear',link_status:'broken',next_review:'2020-01-01'}),
   S0('S3','=HYPERLINK("x")',{kind:'article',status:'unapproved',rights:'reference_only',review_note:'مصدر غير موثّق'}),
   S0('S4','مصدر مرتبط بمورد منشور',{author:'مؤلف',kind:'science',dom:'math',levels:['a4'],status:'needs_review',rights:'licensed'})],
   src_links:[{id:'L1',source_id:'S2',item_key:'bank:b1',use_type:'derived',location:'الفصل 3',info_used:'عد الأشياء',changes:'بسّطنا الأمثلة',needs_review:false,verify:true,qnote:null},{id:'L2',source_id:'S4',item_key:'bank:b1',use_type:'direct',location:'',info_used:'',changes:'',needs_review:false,verify:false,qnote:null}],
   src_log:[{id:1,source_id:'S2',at:'2026-11-20T10:00:00Z',actor_name:'سارة',event:'created',note:null,detail:{}}],
   quality_items:[{key:'bank:b1',title:'نشاط العد',src:'bank',status:'published',levels:['g1'],gone:false},{key:'stories:s1',title:'قصة الحروف',src:'stories',status:'draft',levels:['a5'],gone:false},{key:'lib:nosrc',title:'ورقة بلا مصدر',src:'lib',status:'published',levels:['a5'],gone:false}]};
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:null,asc:true};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},in(c,v){st.f.push(r=>v.includes(r[c]));return api},order(c,o){st.ord=c;st.asc=!o||o.ascending!==false;return api},limit(){return api},then(res){let r=DB[tb].filter(x=>st.f.every(f=>f(x)));if(st.ord)r=r.slice().sort((a,b)=>String(a[st.ord]).localeCompare(String(b[st.ord]))*(st.asc?1:-1));res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);
   if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='src_save'){let s=a.p.id&&DB.src_sources.find(x=>x.id===a.p.id);if(!s){s=Object.assign({},DB.src_sources[0],{id:'N'+DB.src_sources.length,status:'needs_review',rights:'unclear',checklist:{},levels:[]});DB.src_sources.push(s)}
     ['title','author','kind','publisher','pub_date','upd_date','url','edition','lang','dom','summary','team_notes','rights_terms'].forEach(k=>{if(k in a.p)s[k]=a.p[k]||null});s.title=a.p.title;s.levels=a.p.levels||[];if(a.p.status)s.status=a.p.status;if(a.p.checklist)s.checklist=a.p.checklist;return{data:{id:s.id,status:s.status},error:null}}
   if(n==='src_link_save'){DB.src_links.push(Object.assign({id:'L'+(DB.src_links.length+1),qnote:null},a.p));return{data:{ok:true},error:null}}
   if(n==='src_link_remove'){DB.src_links=DB.src_links.filter(l=>l.id!==a.p_id);return{data:{ok:true},error:null}}
   if(n==='src_delete'){const pl=DB.src_links.filter(l=>l.source_id===a.p_id);if(pl.length&&!a.p_confirm)return{error:{message:'SRC_CONFIRM: هذا المصدر مرتبط بموارد منشورة: نشاط العد. سيُحفظ توثيقه في الأرشيف.'}};DB.src_sources=DB.src_sources.filter(s=>s.id!==a.p_id);DB.src_links=DB.src_links.filter(l=>l.source_id!==a.p_id);return{data:{ok:true},error:null}}
   if(n==='src_check_start')return{data:{started:true},error:null};
   if(n==='src_check_collect'){const s=DB.src_sources.find(x=>x.link_status!=='ok'&&x.url)||DB.src_sources[0];return{data:{done:1,pending:0},error:null}}
   return{data:{ok:true},error:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:(m,ok)=>{window.ASKS.push(m);return Promise.resolve(true)}};
  window.ZFIND={load:async()=>{},X:{all:[],doms:[{slug:'arabic',title:'اللغة العربية'},{slug:'math',title:'الرياضيات'}]},LVN:{a2:'سنة إلى سنتين',a3:'3 سنوات',a4:'4 سنوات',a5:'5 سنوات',a6:'6 سنوات',g1:'الصف الأول',g2:'الصف الثاني',g3:'الصف الثالث',g4:'الصف الرابع'}};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/sourcesadm.js','utf8')});
 const T=()=>p.evaluate(()=>window.__sourcesTest);
 const go=async(reset)=>{await p.evaluate((r)=>{const S=window.__sourcesTest.S;S.sel=null;S.tab='list';S.page=0;if(r)S.f={q:'',author:'',kind:'',dom:'',lv:'',st:'',rights:'',res:''};return window.__zp.SUB.sourcesadm.fn(document.getElementById('m'))},reset!==false);await p.waitForTimeout(120)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(120)};
 const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));const calls=async()=>p.evaluate(()=>window.calls.splice(0));const txt=()=>p.textContent('#m');
 const rowsN=()=>p.$$eval('.sc-row[data-o]',e=>e.length);const ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
 const noOverflow=async(w)=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0)E('تجاوز أفقي '+w+' '+o)};
 // 1) القائمة: أنواع وحالات وحقوق واضحة، والمجهول لا يُختلق
 await go();let t=await txt();
 if(await rowsN()!==4)E('عدد المصادر '+await rowsN());
 if(!t.includes('المؤلف غير معروف'))E('المؤلف المجهول يجب أن يظهر «غير معروف»');
 if(!t.includes('فعّال')||!t.includes('يحتاج إلى مراجعة')||!t.includes('غير معتمد'))E('حالات المصدر');
 if(!t.includes('حقوق الاستخدام غير واضحة وتحتاج مراجعة')||!t.includes('يُسمح بالاقتباس ضمن حدود الترخيص'))E('وضوح حقوق الاستخدام');
 if(!t.includes('الرابط معطّل')||!t.includes('موعد المراجعة متأخر'))E('تنبيهات الصف');
 if(!t.includes('لا يُعدّ كل رابط')||!t.includes('لا يغني عن مراجعة محتوى المورد'))E('تنبيه عدم الاعتماد التلقائي');
 await noOverflow('القائمة');
 // 2) البحث والتصفية
 await p.fill('#fq','الرياضيات');await p.waitForTimeout(350);if(await rowsN()!==1)E('بحث العنوان');
 await p.fill('#fq','');await p.waitForTimeout(350);await p.fill('#fa','تربوية');await p.waitForTimeout(350);if(await rowsN()!==1||!(await txt()).includes('دليل تعليم'))E('بحث المؤلف');
 await p.fill('#fa','');await p.waitForTimeout(350);
 await p.selectOption('#fk','math');if(await rowsN()!==1)E('فلتر النوع');await p.selectOption('#fk','');
 await p.selectOption('#fd','arabic');if(await rowsN()!==1)E('فلتر المجال');await p.selectOption('#fd','');
 await p.selectOption('#fl','g2');if(await rowsN()!==1)E('فلتر الصف');await p.selectOption('#fl','');
 await p.selectOption('#fs','unapproved');if(await rowsN()!==1)E('فلتر الحالة');await p.selectOption('#fs','');
 await p.selectOption('#fr','licensed');if(await rowsN()!==1)E('فلتر الحقوق');await p.selectOption('#fr','');
 await p.fill('#fres','نشاط العد');await p.waitForTimeout(350);if(await rowsN()!==2)E('البحث بالمورد المرتبط '+await rowsN());await p.fill('#fres','');await p.waitForTimeout(350);
 const lv=await p.$$eval('#fl option',e=>e.map(x=>x.value).filter(Boolean));if(lv.join()!=='a2,a3,a4,a5,a6,g1,g2,g3,g4')E('المستويات خارج النطاق '+lv);
 if(!(await txt()).includes('')&&false)E('x');
 // 3) إضافة مصدر جديد: الحقول المجهولة تُرسل فارغة لا مختلقة
 await ck('#scnew');t=await txt();if(!t.includes('اترك الحقل فارغًا ليظهر «غير معروف»'))E('تنبيه عدم الاختلاق');
 if(await p.$eval('#f_status',e=>e.disabled)!==true)E('حالة المصدر الجديد يجب أن تكون مقفلة');
 await p.fill('#f_title','مصدر تجريبي جديد');await p.fill('#f_url','https://example-source.org/x');await p.evaluate(()=>{document.querySelector('[data-lv=a5]').checked=true});await ck('#ssave');
 let cs=await calls();let sv=cs.find(c=>c[0]==='src_save');if(!sv||sv[1].p.title!=='مصدر تجريبي جديد'||sv[1].p.author!==''||sv[1].p.publisher!==''||sv[1].p.levels.join()!=='a5'||sv[1].p.id!==null)E('حفظ مصدر جديد '+JSON.stringify(sv));
 if(!(await msgs()).join('|').includes('أُضيف المصدر'))E('رسالة الإضافة');
 // رفض القاعدة (تكرار) برسالة عربية واضحة
 await go();await ck('#scnew');await p.fill('#f_title','مكرر');await p.evaluate(()=>{window.NEXT_ERR='يوجد مصدر مسجّل بالعنوان والمؤلف نفسيهما أو بالرابط نفسه. افتح المصدر الموجود بدل تكراره.'});await ck('#ssave');if(!(await msgs()).join('|').includes('افتح المصدر الموجود بدل تكراره'))E('رسالة التكرار');
 // 4) صفحة المصدر المعتمد S2: بطاقة كاملة، قائمة الموثوقية، تحذيرات
 await go();await p.fill('#fq','الرياضيات');await p.waitForTimeout(350);await ck('.sc-row[data-o]');t=await txt();
 for(const c of ['هل الجهة الناشرة معروفة أو موثوقة؟','هل المصدر مناسب للمجال التعليمي؟','هل المعلومات حديثة بما يكفي للموضوع؟','هل يمكن التحقق من المعلومات الواردة فيه؟','هل يتناسب مع الفئة العمرية المستهدفة؟','هل توجد قيود على استخدام المحتوى؟','هل يحتاج إلى مراجعة من مختص؟'])if(!t.includes(c))E('بند موثوقية ناقص '+c);
 if(!t.includes('الرابط الإلكتروني معطّل')||!t.includes('حقوق الاستخدام غير واضحة؛ لا تُنسخ')||!t.includes('موعد المراجعة المقترح متأخر'))E('تحذيرات صفحة المصدر');
 if(!t.includes('لا يُعتمد المصدر بسبب كثرة معلوماته أو تصميمه الجذاب'))E('قاعدة عدم الاعتماد بسبب التصميم');
 if(!t.includes('معلومة أعاد')&&!t.includes('نشاط أو استنتاج أُعدّ'))E('نوع الاستفادة');
 if(!t.includes('ينتظر التحقق قبل النشر')||!t.includes('عد الأشياء')||!t.includes('بسّطنا الأمثلة'))E('توثيق الربط');
 if(!t.includes('نشاط العد'))E('المورد المرتبط لا يظهر');if(!t.includes('أُضيف المصدر'))E('السجل');
 await noOverflow('صفحة المصدر');
 // تعديل قائمة الموثوقية وتفعيل الحالة (مراجع/مدير)
 await calls();await p.selectOption('[data-ck=publisher]','yes');await p.selectOption('#f_status','active');await ck('#ssave');cs=await calls();sv=cs.find(c=>c[0]==='src_save');
 if(!sv||sv[1].p.checklist.publisher!=='yes'||sv[1].p.status!=='active'||sv[1].p.id!=='S2')E('حفظ المراجعة '+JSON.stringify(sv));
 // 5) ربط مورد: بحث + نوع الاستفادة إلزامي + علامة التحقق
 await go();await p.fill('#fq','القراءة');await p.waitForTimeout(350);await ck('.sc-row[data-o]');
 if(await p.$eval('#lsave',e=>e.disabled)!==true)E('زر الربط يجب أن يكون مقفلًا قبل اختيار مورد');
 await p.fill('#lq','قصة');await p.waitForTimeout(300);await ck('[data-pick="stories:s1"]');await p.selectOption('#l_use','direct');await p.fill('#l_loc','الصفحة 12');await p.fill('#l_info','قائمة الحروف');await p.evaluate(()=>{document.querySelector('#l_vf').checked=true});await ck('#lsave');
 cs=await calls();const ls=cs.find(c=>c[0]==='src_link_save');if(!ls||ls[1].p.item_key!=='stories:s1'||ls[1].p.use_type!=='direct'||ls[1].p.verify!==true||ls[1].p.location!=='الصفحة 12'||ls[1].p.source_id!=='S1')E('ربط مورد '+JSON.stringify(ls));
 t=await txt();if(!t.includes('قصة الحروف')||!t.includes('معلومة منقولة مباشرة'))E('الربط لا يظهر بعد الحفظ');
 await p.evaluate(()=>{window.NEXT_ERR='المصدر مرتبط بهذا المورد من قبل.'});await p.fill('#lq','قصة');await p.waitForTimeout(300);await ck('[data-pick="stories:s1"]');await ck('#lsave');if(!(await msgs()).join('|').includes('مرتبط بهذا المورد'))E('رفض الربط المكرر');
 // إزالة الربط
 await ck('[data-lr]');cs=await calls();if(!cs.find(c=>c[0]==='src_link_remove'))E('إزالة الربط');
 // 6) فحص الرابط
 await go();await p.fill('#fq','دليل');await p.waitForTimeout(350);await ck('.sc-row[data-o]');await ck('#schk');await p.waitForTimeout(300);cs=await calls();if(!cs.find(c=>c[0]==='src_check_start')||!cs.find(c=>c[0]==='src_check_collect'))E('فحص الرابط');
 if(!(await txt()).includes('ليس معناه أن الرابط معطّل'))E('تنبيه الفحص الآلي');
 // 7) الحذف: تحذير يذكر الموارد المتأثرة ثم تأكيد
 await go();await p.fill('#fq','مصدر مرتبط');await p.waitForTimeout(350);await ck('.sc-row[data-o]');await ck('#sdel');cs=await calls();
 const dels=cs.filter(c=>c[0]==='src_delete');if(dels.length!==2||dels[0][1].p_confirm!==false||dels[1][1].p_confirm!==true)E('الحذف بخطوتين '+JSON.stringify(dels));
 const asks=await p.evaluate(()=>window.ASKS);const la=asks[asks.length-1]||'';if(!la.includes('نشاط العد')||la.includes('SRC_CONFIRM'))E('نص تحذير الحذف '+asks);
 if(await p.evaluate(()=>window.DB.src_sources.some(s=>s.id==='S4')))E('لم يُحذف بعد التأكيد');
 // 8) التنبيهات: أرقام من البيانات
 await go();await ck('[data-t=alerts]');t=await txt();
 if(!t.includes('مصادر غير فعّالة مرتبطة بموارد منشورة')||!t.includes('روابط معطّلة')||!t.includes('موعد المراجعة متأخر')||!t.includes('حقوق الاستخدام غير واضحة')||!t.includes('معلومات تنتظر التحقق'))E('أقسام التنبيهات '+t.slice(0,300));
 if(!t.includes('موارد منشورة بلا أي مصدر موثّق')||!t.includes('ورقة بلا مصدر')||!t.includes('غياب التوثيق لا يعني خطأ المحتوى'))E('الموارد بلا مصدر (معلومة لا اتهام)');
 await noOverflow('التنبيهات');
 // 9) CSV: BOM، تحييد المعادلات، المجهول فارغ
 const csv=await p.evaluate(()=>window.__sourcesTest.csvText(window.__sourcesTest.S.src));
 if(!csv.startsWith('﻿'))E('BOM');if(csv.includes(',"=HYPERLINK')||!csv.includes(`'=HYPERLINK`))E('تحييد المعادلات في CSV');if(!csv.includes('حقوق الاستخدام'))E('رأس CSV');
 // 10) الصلاحيات: محرر المحتوى لا يغيّر الاعتماد ولا يحذف
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر'}});await go();await p.fill('#fq','دليل');await p.waitForTimeout(350);await ck('.sc-row[data-o]');
 if(await p.$('#sdel'))E('زر حذف لغير المدير');
 if(!(await p.$eval('#f_status',e=>e.disabled))||!(await p.$$eval('[data-ck]',e=>e.every(x=>x.disabled))))E('أقفال المراجعة للمحرر');
 await ck('#ssave');cs=await calls();sv=cs.find(c=>c[0]==='src_save');if(!sv||'status' in sv[1].p||'checklist' in sv[1].p)E('المحرر لا يرسل الحالة/القائمة '+JSON.stringify(sv));
 // مراجع التصميم: لا يضيف مصادر
 await p.evaluate(()=>{window.ME={roles:['design_reviewer'],name:'مصمم'}});await go();if(await p.$('#scnew'))E('مراجع التصميم لا يضيف مصدرًا');
 // بلا دور
 await p.evaluate(()=>{window.ME={roles:[],name:''}});await go();if(!(await txt()).includes('ليست لديك صلاحية'))E('مستخدم بلا دور');
 // 11) مصادر فارغة: لا بيانات وهمية
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'م'};window.DB.src_sources.length=0;window.DB.src_links.length=0});await go();t=await txt();if(await rowsN()!==0||!t.includes('لا توجد مصادر مسجّلة بعد'))E('الحالة الفارغة');
 if(jserr.length)E('أخطاء JS '+jserr);
 await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
