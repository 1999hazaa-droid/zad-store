// NODE_PATH=$(npm root -g) node tools/content/quality/test_quality.js   (واجهة مركز الجودة: واجهة حقيقية + قاعدة بيانات وهمية في الذاكرة)
// منطق القاعدة نفسه (البوابة، الصلاحيات، السجل) اختُبر على قاعدة البيانات الحقيقية؛ هنا نختبر الواجهة وما ترسله.
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+(process.env.VW||1100),height:900}});const p=await ctx.newPage();
 const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;
  window.ME={roles:['library_manager'],name:'المدير'};
  const mk=(k,t,st,lv,o={})=>Object.assign({key:k,src:k.split(':')[0],slug:k.split(':')[1],title:t,kind:null,levels:lv,status:st,legacy:false,recheck:false,recheck_reason:null,gone:false,card:{},round:0,reviewer:null,reviewed_at:null,suspend_reason:null,updated_at:'2026-11-20T10:00:00Z'},o);
  const items=[];for(let i=0;i<95;i++)items.push(mk('bank:leg'+i,'نشاط قديم '+i,'published',['a5'],{legacy:true}));
  items.push(mk('stories:s1','قصة قيد المراجعة','in_review',['a4','a5'],{round:1}));
  items.push(mk('stories:s2','قصة تحتاج تعديل','needs_changes',['g1']));
  items.push(mk('lib:l1','ورقة عمل الحروف','published',['a5'],{recheck:true,recheck_reason:'رابط أو ملف معطل'}));
  items.push(mk('vid:v1','فيديو موقوف','suspended',['g2'],{suspend_reason:'خطأ في المعلومة'}));
  items.push(mk('quiz:q1','اختبار مقبول','accepted',['g3']));
  items.push(mk('life:d1','درس مسودة','draft',['a3']));
  items.push(mk('pack:pk1','حزمة الحروف','in_review',['a5'],{round:1}));
  const DB={quality_items:items,quality_reviews:[{key:'stories:s2',round:1,reviewer_name:'مراجع',decided_at:'2026-11-19T10:00:00Z',decision:'needs_changes',scores:{accuracy:2,age:4},notes:{accuracy:'الإجابة خاطئة'},blockers:['accuracy'],avg:3,todo:'صحّح الإجابة'}],
   quality_log:[{key:'stories:s2',at:'2026-11-19T10:00:00Z',actor_name:'مراجع',event:'needs_changes',from_status:'in_review',to_status:'needs_changes',note:'صحّح الإجابة'},{key:'stories:s2',at:'2026-11-18T10:00:00Z',actor_name:'النظام',event:'edit',from_status:'draft',to_status:'draft',note:'تعديل على المورد',detail:{fields:['title'],changes:{title:['قديم','جديد']}}}],
   src_links:[{id:'L1',source_id:'S1',item_key:'stories:s1',use_type:'rephrased',location:'الفصل 2',info_used:'ترتيب الحروف',changes:'',needs_review:false,verify:true,qnote:null}],src_sources:[{id:'S1',title:'مرجع تعليم القراءة',author:'جهة معروفة',status:'needs_review',rights:'unclear',link_status:'unchecked',next_review:null}],packs:[{id:'P1',slug:'pk1',levels:['a5']}],pack_items:[{pack_id:'P1',key:'bank:leg1',pos:1},{pack_id:'P1',key:'bank:leg2',pos:2},{pack_id:'P1',key:'bank:ghost',pos:3}]};
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:null,asc:true};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},in(c,vs){st.f.push(r=>vs.includes(r[c]));return api},order(c,o){st.ord=c;st.asc=!o||o.ascending!==false;return api},limit(){return api},then(res){let r=DB[tb].filter(x=>st.f.every(f=>f(x)));if(st.ord)r=r.slice().sort((a,b)=>String(a[st.ord]).localeCompare(String(b[st.ord]))*(st.asc?1:-1));res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  const R={quality_my:()=>({data:window.ME}),
   quality_dashboard:()=>({data:{counts:DB.quality_items.reduce((o,i)=>(o[i.status]=(o[i.status]||0)+1,o),{}),legacy:95,recheck:1,avg_hours:null,avg_n:0,reviews:1,issues:[{c:'accuracy',n:3},{c:'safety',n:1}],reasons:[{r:'رابط أو ملف معطل',n:1}]}}),
   quality_pack_check:()=>({data:{problems:['مورد غير موجود: bank:ghost']}}),
   quality_staff:()=>({data:[{id:'aaaaaaaa-1111',name:'',roles:['library_manager'],explicit:false},{id:'bbbbbbbb-2222',name:'سارة',roles:['edu_reviewer'],explicit:true}]})};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,a]);if(window.NEXT_ERR&&!['quality_my','quality_dashboard','quality_staff','quality_pack_check'].includes(n)){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
    if(R[n])return R[n](a);
    const it=DB.quality_items.find(i=>i.key===(a&&a.p_key));
    if(n==='quality_card_save'){it.card={scores:Object.assign({},it.card.scores,a.p_scores),notes:Object.assign({},it.card.notes,a.p_notes),blockers:a.p_blockers,summary:a.p_summary}}
    if(n==='quality_decide'){it.status={accepted:'accepted',needs_changes:'needs_changes',keep:'published',suspended:'suspended'}[a.p_decision];if(a.p_decision==='keep')it.legacy=false}
    if(n==='quality_submit')it.status='in_review';if(n==='quality_publish')it.status='published';
    return{data:{ok:true},error:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{}};
  window.ZFIND={load:async()=>{},X:{all:[{key:'stories:s1',dom:'arabic',lv:['a4']},{key:'bank:leg1',lv:['a5'],dom:'math'},{key:'bank:leg2',lv:['g1'],dom:'math'}],doms:[{slug:'arabic',title:'اللغة العربية'}]},LVN:{a2:'سنة إلى سنتين',a3:'3 سنوات',a4:'4 سنوات',a5:'5 سنوات',a6:'6 سنوات',g1:'الصف الأول',g2:'الصف الثاني',g3:'الصف الثالث',g4:'الصف الرابع'}};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/qualityadm.js','utf8')});
 const go=async()=>{await p.evaluate(()=>{window.__qualityTest.S.sel=null;return window.__zp.SUB.qualityadm.fn(document.getElementById('m'))});await p.waitForTimeout(120)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(100)};
 const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));
 const calls=async()=>p.evaluate(()=>window.calls.splice(0));
 const txt=()=>p.textContent('#m');
 // 1) لوحة المتابعة: أرقام من البيانات لا ثابتة
 await go();let t=await txt();
 if(!t.includes('مركز')&&!t.includes('المتابعة'))E('اللوحة '+t.slice(0,200));
 const num=async(st)=>p.evaluate((st)=>document.querySelector('[data-st='+st+'] b').textContent,st);
 const ar=n=>String(n).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
 if(await num('published')!==ar(96))E('عدد المنشورة '+await num('published'));if(await num('in_review')!==ar(2))E('عدد قيد المراجعة '+await num('in_review'));if(await num('needs_changes')!==ar(1))E('تحتاج تعديل');
 if(await num('suspended')!==ar(1)||await num('accepted')!==ar(1)||await num('draft')!==ar(1))E('أرقام الحالات الأخرى');
 if(!t.includes('لا توجد بيانات كافية'))E('متوسط المدة يجب ألا يُختلق');
 if(!t.includes('صحة المعلومات')||!t.includes('السلامة والخصوصية'))E('أكثر المشكلات');
 if(!t.includes('ورقة عمل الحروف')||!t.includes('رابط أو ملف معطل'))E('قائمة إعادة المراجعة');
 // 2) تصفية الموارد
 {const ov0=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(ov0>0)E('تجاوز أفقي في اللوحة '+ov0)}
 await ck('[data-st=in_review]');t=await txt();if(!t.includes('قصة قيد المراجعة')||!t.includes('حزمة الحروف')||t.includes('نشاط قديم')||!t.includes(ar(2)+' مورد'))E('فلتر قيد المراجعة '+t.slice(0,300));
 await ck('[data-t=dash]');await ck('[data-flag=legacy]');t=await txt();if(!t.includes(ar(95)+' مورد')||!t.includes('منشور دون مراجعة سابقة'))E('فلتر دون مراجعة');
 let rows=await p.$$eval('#qlist [data-o]',e=>e.length);if(rows!==40)E('الترقيم '+rows);await ck('#qnext');await ck('#qnext');rows=await p.$$eval('#qlist [data-o]',e=>e.length);if(rows!==15)E('الصفحة الأخيرة '+rows);
 await p.evaluate(()=>{window.__qualityTest.S.f={q:'',st:'',type:'',lv:'',flag:''};window.__qualityTest.S.page=0});await go();await ck('[data-t=list]');
 await p.fill('#qq','حزمة');await p.waitForTimeout(400);t=await p.textContent('#qlist');if(!t.includes('حزمة الحروف')||t.includes('قصة'))E('البحث بالاسم');
 await p.fill('#qq','');await p.waitForTimeout(400);await p.selectOption('#qlv','g1');t=await p.textContent('#qlist');if(!t.includes('قصة تحتاج تعديل')||t.includes('قيد المراجعة'))E('فلتر الصف');
 await p.selectOption('#qlv','');await p.selectOption('#qty','vid');t=await p.textContent('#qlist');if(!t.includes('فيديو موقوف')||t.includes('قصة'))E('فلتر النوع');await p.selectOption('#qty','');
 const lvOpts=await p.$$eval('#qlv option',e=>e.map(x=>x.value).filter(Boolean));if(lvOpts.join()!=='a2,a3,a4,a5,a6,g1,g2,g3,g4')E('المستويات '+lvOpts);
 // 3) مورد قيد المراجعة بدور مدير: بطاقة تقييم كاملة
 await p.fill('#qq','قيد المراجعة');await p.waitForTimeout(400);await ck('#qlist [data-o]');t=await txt();
 for(const c of ['صحة المعلومات','ملاءمة العمر والصف','الأهداف التعليمية','جودة التصميم','سهولة الاستخدام','جودة الملفات','السلامة والخصوصية'])if(!t.includes(c))E('معيار ناقص '+c);
 if(!t.includes('داخلية للمراجع فقط'))E('تنبيه الدرجات الداخلية');const ov=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(ov>0)E('تجاوز أفقي في صفحة المورد '+ov);if(!t.includes('اللغة العربية'))E('المجال');
 // 3ب) قسم «المصادر والمراجع» داخل بطاقة المورد
 if(!t.includes('المصادر والمراجع')||!t.includes('مرجع تعليم القراءة')||!t.includes('يحتاج إلى مراجعة')||!t.includes('حقوق غير واضحة')||!t.includes('ينتظر التحقق')||!t.includes('ليس دليلًا كافيًا'))E('قسم المصادر '+t.slice(-700));
 await p.fill('[data-sn=L1]','المصدر قديم نسبيًا');await ck('[data-snb=L1]');const cs0=await calls();const sn=cs0.find(c=>c[0]==='src_note');if(!sn||sn[1].p_link!=='L1'||sn[1].p_note!=='المصدر قديم نسبيًا')E('ملاحظة جودة المصدر '+JSON.stringify(sn));
 await ck('#qsrcgo');if(await p.evaluate(()=>window.went)!=='sourcesadm')E('الانتقال لمركز المصادر');await p.evaluate(()=>{window.__qualityTest.S.sel=null});await go();await ck('[data-t=list]');await p.fill('#qq','قيد المراجعة');await p.waitForTimeout(400);await ck('#qlist [data-o]');

 for(const k of ['accuracy','age','goals','design','usability','files','safety'])await ck('[data-c='+k+'] [data-s="4"]');
 await ck('[data-c=accuracy] [data-bl]');await p.fill('[data-c=accuracy] [data-n]','خطأ في الإجابة الثالثة');
 await ck('#qsave');let cs=await calls();let sv=cs.find(c=>c[0]==='quality_card_save');if(!sv||Object.keys(sv[1].p_scores).length!==7||sv[1].p_blockers.join()!=='accuracy'||!sv[1].p_notes.accuracy.includes('خطأ'))E('حفظ التقييم '+JSON.stringify(sv));
 // اعتماد مع مشكلة مانعة: رفض القاعدة يظهر برسالة واضحة
 await p.evaluate(()=>{window.NEXT_ERR='QUALITY_PERM: توجد مشكلة مانعة (خطأ تعليمي أو سلامة)، فلا يمكن الاعتماد'});await ck('#qacc');let m=(await msgs()).join('|');if(!m.includes('توجد مشكلة مانعة')||m.includes('QUALITY_PERM'))E('رسالة رفض الاعتماد '+m);
 // طلب تعديل يرسل الملاحظة المطلوبة
 await p.fill('#qnote','صحّح الإجابة الثالثة');await ck('#qnc');cs=await calls();const dc=cs.find(c=>c[0]==='quality_decide');if(!dc||dc[1].p_decision!=='needs_changes'||!dc[1].p_note.includes('صحّح'))E('طلب التعديل '+JSON.stringify(cs));
 t=await txt();if(!t.includes('يحتاج إلى تعديل'))E('الحالة بعد طلب التعديل');
 if(!(await p.$('#qsub')))E('زر إعادة الإرسال بعد التعديل');await ck('#qsub');cs=await calls();if(!cs.find(c=>c[0]==='quality_submit'))E('إعادة الإرسال');
 await ck('#qback');await p.fill('#qq','فيديو');await p.waitForTimeout(400);await ck('#qlist [data-o]');t=await txt();if(!t.includes('لا يوجد مصدر موثّق لهذا المورد'))E('مورد بلا مصدر');
 // 4) مورد تحتاج تعديل: السجل والمراجعات السابقة محفوظة
 await ck('#qback');await p.fill('#qq','تحتاج');await p.waitForTimeout(400);await ck('#qlist [data-o]');t=await txt();
 if(!t.includes('الإجابة خاطئة')||!t.includes('صحّح الإجابة')||!t.includes('الحقول: title')||!t.includes('«قديم» ← «جديد»'))E('سجل المراجعات والتعديلات '+t.slice(0,400));
 await ck('#qedit');if(await p.evaluate(()=>window.went)!=='storiesadm')E('الانتقال لإدارة المحتوى');
 // 5) منشور دون مراجعة سابقة: أزرار إعادة التقييم
 await go();await ck('[data-t=list]');await p.fill('#qq','نشاط قديم 7');await p.waitForTimeout(400);await ck('#qlist [data-o]');t=await txt();
 if(!t.includes('نُشر قبل تفعيل مركز الجودة'))E('تنبيه دون مراجعة');if(!(await p.$('#qkeep'))||!(await p.$('#qsus'))||!(await p.$('#qrc')))E('أزرار المنشور');
 await p.selectOption('#qrs','تحديث منهج أو معلومة');await ck('#qrc');cs=await calls();const rc=cs.find(c=>c[0]==='quality_recheck');if(!rc||rc[1].p_reason!=='تحديث منهج أو معلومة')E('طلب إعادة التقييم');
 await p.fill('#qnote','معلومة قديمة');await ck('#qsus');cs=await calls();const su=cs.find(c=>c[0]==='quality_decide');if(!su||su[1].p_decision!=='suspended'||su[1].p_note!=='معلومة قديمة')E('الإيقاف المؤقت');
 t=await txt();if(!t.includes('موقوف مؤقتًا'))E('الحالة بعد الإيقاف');
 // 6) مقبول: زر النشر فقط للناشر/المدير
 await go();await ck('[data-t=list]');await p.fill('#qq','مقبول');await p.waitForTimeout(400);await ck('#qlist [data-o]');if(!(await p.$('#qpub')))E('زر النشر للمقبول');await ck('#qpub');cs=await calls();if(!cs.find(c=>c[0]==='quality_publish'))E('النشر');
 // 7) حزمة: مراجعة الحزمة كاملة
 await go();await ck('[data-t=list]');await p.fill('#qq','حزمة الحروف');await p.waitForTimeout(400);await ck('#qlist [data-o]');t=await txt();
 if(!t.includes('مراجعة الحزمة كاملة')||!t.includes('مورد غير موجود: bank:ghost')||!t.includes('لا يناسب عمر/صف الحزمة'))E('مراجعة الحزمة '+t.slice(0,600));
 // 8) الأدوار: مراجع تعليمي فقط لا يرى أزرار التصميم والنشر والإرسال
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer'],name:'سارة'}});await go();
 if(await p.$('[data-t=roles]'))E('تبويب الأدوار لغير المدير');
 await ck('[data-t=list]');await p.fill('#qq','قصة قيد');await p.waitForTimeout(400);await ck('#qlist [data-o]');
 const dis=await p.$$eval('[data-c=design] [data-s]',e=>e.every(x=>x.disabled)),en=await p.$$eval('[data-c=accuracy] [data-s]',e=>e.every(x=>!x.disabled));if(!dis||!en)E('أقفال المعايير حسب الدور');
 if(await p.$('#qpub')||await p.$('#qsub'))E('أزرار خارج الدور');if(!(await p.$('#qacc')))E('زر الاعتماد للمراجع التعليمي');
 // 9) مستخدم بلا دور
 await p.evaluate(()=>{window.ME={roles:[],name:''}});await go();if(!(await txt()).includes('ليست لديك صلاحية'))E('مستخدم بلا دور');
 // 10) إدارة الأدوار للمدير
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'المدير'}});await go();await ck('[data-t=roles]');await p.waitForTimeout(150);t=await txt();
 if(!t.includes('مراجع تعليمي')||!t.includes('مسؤول نشر')||!t.includes('مدير المكتبة'))E('الأدوار '+t.slice(0,300));
 await p.evaluate(()=>{document.querySelector('[data-u=bbbbbbbb-2222] [data-r=publisher]').checked=true});await ck('[data-u=bbbbbbbb-2222] [data-save]');cs=await calls();const rs=cs.find(c=>c[0]==='quality_roles_set');if(!rs||rs[1].p_roles.sort().join()!=='edu_reviewer,publisher'||rs[1].p_name!=='سارة')E('حفظ الأدوار '+JSON.stringify(rs));
 if(jserr.length)E('أخطاء JS '+jserr);
 await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
