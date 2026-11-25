// NODE_PATH=$(npm root -g) node tools/content/feedback/test_admin.js   (لوحة ملاحظات أولياء الأمور: واجهة حقيقية + قاعدة وهمية)
// قواعد الحالات والصلاحيات والإخفاء والتصعيد اختُبرت على قاعدة البيانات الحقيقية؛ هنا نختبر ما تعرضه الواجهة وما ترسله.
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+(process.env.VW||1100),height:900}});const p=await ctx.newPage();const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ME={roles:['library_manager'],name:'المدير',id:'U1'};window.ASKS=[];
  const F=(i,ref,key,title,kind,st,pr,at,o={})=>Object.assign({id:'F'+i,ref,item_key:key,item_title:title,item_src:key.split(':')[0],kind,body:'نص الملاحظة '+i,status:st,priority:pr,assignee:null,assignee_name:null,internal_note:null,repro:null,reply:null,dup_of:null,fix_tested:false,redacted:false,created_at:at,updated_at:at,resolved_at:null},o);
  const DB={fb_items:[F(1,'ZF-AAAA11','bank:b1','نشاط العد','info_error','new','high','2026-11-20T10:00:00Z'),F(2,'ZF-BBBB22','bank:b1','نشاط العد','design','in_review','normal','2026-11-21T10:00:00Z',{assignee:'U2',assignee_name:'سارة'}),F(3,'ZF-CCCC33','lib:l1','ورقة الحروف','file_link','resolved','normal','2026-11-22T10:00:00Z',{resolved_at:'2026-11-22T13:00:00Z'}),F(4,'ZF-DDDD44','vid:v1','فيديو الألوان','suggestion','new','low','2026-11-23T10:00:00Z'),F(5,'ZF-EEEE55','lib:gone','مورد قديم','other','duplicate','low','2026-11-24T10:00:00Z',{dup_of:'F3'})],
   fb_log:[{id:1,fb_id:'F1',at:'2026-11-20T10:00:00Z',actor_name:'ولي أمر',event:'created',note:null,detail:{}}],
   quality_items:[{key:'bank:b1',title:'نشاط العد',src:'bank',status:'published',recheck:false,recheck_reason:null},{key:'lib:l1',title:'ورقة الحروف',src:'lib',status:'published',recheck:true,recheck_reason:'ملاحظة من ولي أمر'}],
   src_links:[{id:'L1',source_id:'S1',item_key:'bank:b1',use_type:'derived',verify:true}],src_sources:[{id:'S1',title:'مرجع الرياضيات',status:'needs_review',rights:'unclear',link_status:'unchecked'}]};
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:null,asc:true};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},in(c,v){st.f.push(r=>v.includes(r[c]));return api},order(c,o){st.ord=c;st.asc=!o||o.ascending!==false;return api},limit(){return api},then(res){let r=DB[tb].filter(x=>st.f.every(f=>f(x)));if(st.ord)r=r.slice().sort((a,b)=>String(a[st.ord]).localeCompare(String(b[st.ord]))*(st.asc?1:-1));res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='fb_assignees')return{data:[{id:'U1',name:'المدير'},{id:'U2',name:'سارة'}]};
   if(n==='fb_dashboard'){const by={};DB.fb_items.forEach(i=>by[i.status]=(by[i.status]||0)+1);return{data:{total:DB.fb_items.length,by_status:by,kinds:[{k:'info_error',n:1},{k:'design',n:1}],multi:[{key:'bank:b1',title:'نشاط العد',n:2}],avg_hours:3,avg_n:1}}}
   if(n==='fb_update'){const r=DB.fb_items.find(x=>x.id===a.p_id);Object.assign(r,{status:a.p.status,priority:a.p.priority,internal_note:a.p.internal_note||null,reply:a.p.reply||null,assignee:a.p.assignee||null});return{data:{ok:true},error:null}}
   if(n==='fb_escalate'){const r=DB.fb_items.find(x=>x.id===a.p_id);r.priority='urgent';return{data:{ok:true,flagged:true},error:null}}
   if(n==='fb_redact'){const r=DB.fb_items.find(x=>x.id===a.p_id);r.redacted=true;r.body='[أُخفي النص بقرار الإدارة]';return{data:{ok:true},error:null}}
   return{data:{ok:true},error:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:(m)=>{window.ASKS.push(m);return Promise.resolve(true)}};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/feedbackadm.js','utf8')});
 const go=async(reset)=>{await p.evaluate((r)=>{const S=window.__feedbackTest.S;S.sel=null;S.tab='list';S.page=0;if(r)S.f={kind:'',st:'',res:'',from:'',to:'',pr:'',mine:false};return window.__zp.SUB.feedbackadm.fn(document.getElementById('m'))},reset!==false);await p.waitForTimeout(150)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(150)};
 const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));const calls=async()=>p.evaluate(()=>window.calls.splice(0));const txt=()=>p.textContent('#m');const rowsN=()=>p.$$eval('.fb-row[data-o]',e=>e.length);
 const ov=async(w)=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0)E('تجاوز أفقي '+w+' '+o)};
 // 1) القائمة
 await go();let t=await txt();if(await rowsN()!==5)E('عدد الملاحظات '+await rowsN());
 for(const c of ['ZF-AAAA11','نشاط العد','خطأ في معلومة تعليمية','جديدة','قيد المراجعة','تمت المعالجة','مكررة','مرتفعة','عادية','سارة'])if(!t.includes(c))E('عنصر ناقص في القائمة '+c);
 if(!t.includes('لا تُعدّ الملاحظة صحيحة تلقائيًا'))E('تنبيه عدم الاعتماد التلقائي');await ov('القائمة');
 // 2) البحث والتصفية
 await p.selectOption('#fk','design');if(await rowsN()!==1)E('فلتر النوع');await p.selectOption('#fk','');
 await p.selectOption('#fs','new');if(await rowsN()!==2)E('فلتر الحالة');await p.selectOption('#fs','');
 await p.selectOption('#fp','low');if(await rowsN()!==2)E('فلتر الأولوية');await p.selectOption('#fp','');
 await p.fill('#fq','العد');await p.waitForTimeout(400);if(await rowsN()!==2)E('البحث بالمورد');await p.fill('#fq','zf-cccc');await p.waitForTimeout(400);if(await rowsN()!==1)E('البحث بالرقم المرجعي');await p.fill('#fq','');await p.waitForTimeout(400);
 await p.fill('#ff','2026-11-22');await p.dispatchEvent('#ff','change');await p.waitForTimeout(250);if(await rowsN()!==3)E('فلتر من تاريخ '+await rowsN());await p.fill('#ft','2026-11-22');await p.dispatchEvent('#ft','change');await p.waitForTimeout(250);if(await rowsN()!==1)E('فلتر إلى تاريخ');
 // 3) صفحة ملاحظة تعليمية: ربط بالمورد، المصادر، الشروط
 await go();await ck('[data-o=F1]');t=await txt();
 if(!t.includes('نص الملاحظة 1')||!t.includes('نشاط العد'))E('تفاصيل الملاحظة');if(!t.includes('لا تُعتبر «تمت المعالجة» قبل إعادة مراجعة المورد'))E('قاعدة الملاحظة التعليمية');
 if(!t.includes('مرجع الرياضيات')||!t.includes('ينتظر التحقق'))E('مصادر المورد');if(!t.includes('ملاحظات أخرى على المورد نفسه: ZF-BBBB22'))E('ملاحظات المورد نفسه');
 if(await p.$('#frp'))E('خطوات إعادة الظهور لملاحظة تعليمية');await ov('صفحة الملاحظة');
 await ck('#fbopen');if(await p.evaluate(()=>window.went)!=='bankadm')E('الانتقال للمورد');
 await go();await ck('[data-o=F1]');await ck('#fbq');if(await p.evaluate(()=>window.went)!=='qualityadm'||await p.evaluate(()=>window.__qualityOpen)!=='bank:b1')E('الانتقال لمركز الجودة');
 await go();await ck('[data-o=F1]');await ck('#fbsrc');if(await p.evaluate(()=>window.went)!=='sourcesadm')E('الانتقال للمصادر');
 // 4) معالجة: حفظ الحالة والأولوية والمسؤول والرد الجاهز
 await go();await ck('[data-o=F1]');await calls();await p.selectOption('#fst','in_review');await p.selectOption('#fpr','urgent');await p.selectOption('#fas','U2');await ck('[data-rep=in_review]');
 if(!(await p.inputValue('#frs')).includes('قيد المراجعة'))E('الرد الجاهز');await p.fill('#frs',(await p.inputValue('#frs'))+' (معدّل)');await p.fill('#fin','تم فحص الإجابة');await ck('#fbsave');
 let cs=await calls();const up=cs.find(c=>c[0]==='fb_update');if(!up||up[1].p_id!=='F1'||up[1].p.status!=='in_review'||up[1].p.priority!=='urgent'||up[1].p.assignee!=='U2'||!up[1].p.reply.includes('(معدّل)')||up[1].p.internal_note!=='تم فحص الإجابة')E('حفظ المعالجة '+JSON.stringify(up));
 if(!(await msgs()).join('|').includes('حُفظت المعالجة'))E('رسالة الحفظ');
 // رفض القاعدة (معالجة تعليمية قبل إعادة المراجعة) برسالة واضحة دون نجاح
 await p.selectOption('#fst','resolved');await p.evaluate(()=>{window.NEXT_ERR='لا تُعدّ الملاحظة التعليمية معالَجة قبل إعادة مراجعة المورد في مركز الجودة وعودته منشورًا.'});await ck('#fbsave');const mm=(await msgs()).join('|');if(!mm.includes('قبل إعادة مراجعة المورد')||mm.includes('حُفظت'))E('رفض المعالجة المبكرة '+mm);
 // 5) تصعيد
 await go();await ck('[data-o=F4]');await calls();await ck('#fbesc');cs=await calls();if(!cs.find(c=>c[0]==='fb_escalate'))E('التصعيد');if(!(await msgs()).join('|').includes('طُلبت إعادة تقييم المورد'))E('رسالة التصعيد');
 // 6) ملاحظة تقنية: خطوات الإعادة وشرط الاختبار
 await go();await ck('[data-o=F2]');if(!(await p.$('#frp'))||!(await p.$('#fft')))E('حقول الملاحظة التقنية');
 // 7) الحالة «مكررة»: اختيار الأصلية
 await p.selectOption('#fst','duplicate');if(await p.$eval('#fdupw',e=>e.hidden))E('اختيار الأصلية للمكررة');
 // 8) إخفاء النص للمدير فقط
 await go();await ck('[data-o=F4]');if(!(await p.$('#fbred')))E('زر الإخفاء للمدير');await ck('#fbred');cs=await calls();if(!cs.find(c=>c[0]==='fb_redact'))E('الإخفاء');const ak=await p.evaluate(()=>window.ASKS);if(!ak.length||!ak[ak.length-1].includes('نهائيًا'))E('تأكيد الإخفاء');
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر',id:'U3'}});await go();await ck('[data-o=F1]');if(await p.$('#fbred'))E('الإخفاء لغير المدير');
 // 9) المؤشرات: أرقام فعلية
 await go();await ck('[data-t=dash]');t=await txt();const ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
 if(!t.includes(ar(5)+'إجمالي'))E('إجمالي الملاحظات '+t.slice(0,200));if(!t.includes('أكثر أنواع المشكلات تكرارًا')||!t.includes('خطأ في معلومة تعليمية'))E('أكثر الأنواع');if(!t.includes('موارد تلقّت ملاحظات متعددة')||!t.includes(ar(2)+' ملاحظات'))E('موارد متعددة الملاحظات');if(!t.includes(ar(3)+' ساعة'))E('متوسط المدة');await ov('المؤشرات');
 await ck('[data-res]');if(await rowsN()!==2)E('الانتقال من المؤشر إلى ملاحظات المورد '+await rowsN());
 // متوسط المدة لا يُختلق عند غياب البيانات
 await p.evaluate(()=>{const o=window.sb.rpc;window.sb.rpc=async(n,a)=>n==='fb_dashboard'?{data:{total:0,by_status:{},kinds:[],multi:[],avg_hours:null,avg_n:0}}:o(n,a)});await go();await ck('[data-t=dash]');t=await txt();if(!t.includes('لا توجد بيانات كافية')||!t.includes('لا توجد ملاحظات بعد'))E('غياب البيانات');
 // 10) فتح من مركز الجودة بفلتر المورد + بلا صلاحية + فارغ
 await p.evaluate(()=>{window.__fbFilter={res:'bank:b1'}});await go(false);if(await rowsN()!==2)E('فلتر المورد القادم من مركز الجودة '+await rowsN());
 await p.evaluate(()=>{window.ME={roles:[],name:'',id:'U9'}});await go();if(!(await txt()).includes('ليست لديك صلاحية'))E('مستخدم بلا دور');
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'م',id:'U1'};window.DB.fb_items.length=0});await go();t=await txt();if(await rowsN()!==0||!t.includes('لم تصل أي ملاحظة بعد'))E('الحالة الفارغة');
 if(jserr.length)E('أخطاء JS '+jserr);
 await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
