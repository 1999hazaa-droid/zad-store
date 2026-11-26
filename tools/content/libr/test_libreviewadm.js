// NODE_PATH=$(npm root -g) node tools/content/libr/test_libreviewadm.js  (واجهة مركز مراجعة المكتبة: واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة الفعلية تُختبر في اختبار SQL)
const {chromium}=require('playwright');const fs=require('fs');let fails=0;const T=(c,m)=>{if(c)console.log('PASS',m);else{console.log('FAIL',m);fails++}};
(async()=>{const b=await chromium.launch();
for(const VW of [390,768,1100]){
 const ctx=await b.newContext({viewport:{width:VW,height:900},acceptDownloads:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.went=null;window.NEXT_ERR=null;
  const iss=(id,key,src,title,kind,pr,st,lv,detail)=>({id,fp:id,key,src,sec:src,title,levels:lv,kind,detail:detail||'',priority:pr,status:st||'open',auto:true,assignee:null,review_date:null,note:null,found_at:'2026-11-26T10:00:00Z'});
  const DB={libr_issues:[iss('i1','bank:b1','bank','نصل الحرف','missing_skill','normal','open',['a4','a5'],'غير مرتبط بمهارة'),iss('i2','lib:x','lib','ورقة عمل الأرقام','file_unverified','high','open',['g1'],'لا يوجد رابط ملف'),iss('i3','lib:y','lib','قصة بلا قسم','no_section','high','open',['a6'],'بلا قسم'),iss('i4','tax:g5','tax','الصف الخامس','taxonomy_scope','high','open',null,'تصنيف أعلى'),iss('i5','vid:v1','vid','فيديو','broken_link','urgent','open',['a4'],'404'),iss('i6','bank:b2','bank','حروف','missing_descr','normal','done',['a4'],'وصف'),iss('i7','acts:a1','acts','نشاط القص','safety_verify','normal','open',['a5'],'تحقق')],
   quality_items:[{key:'bank:b1',src:'bank',title:'نصل الحرف بصورته',status:'published',gone:false},{key:'lib:x',src:'lib',title:'ورقة عمل الأرقام',status:'published',gone:false}],
   libr_reports:[]};
  window.DB=DB;window.SUM={sections_total:13,sections_published:12,published:921,drafts:7,needs_review:2,missing_data:5,open_issues:6,urgent_open:1,dups_pending:1,links:{total:229,private:1,ok:0,bad:1,pending:0,unchecked:227},empty_cats:[{kind:'type',key:'exercises',label:'تدريبات'}],last_run:null};
  const chain=(tb)=>{const st={f:[]};const api={select(){return api},order(){return api},limit(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},ilike(c,v){const w=v.replace(/%/g,'');st.f.push(r=>String(r[c]).includes(w));return api},single(){st.one=1;return api},then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));res(st.one?{data:r[0]||null,error:r[0]?null:{message:'x'}}:{data:r,error:null})}};return api};
  const SECS=[{id:'lib:ws',label:'أوراق العمل',kind:'lib',total:62,pub:62,drafts:0,issues:3,urgent:0,high:3,auto_status:'review',status:'review',manual:false,note:null,ord:1},{id:'vid',label:'الفيديو',kind:'src',total:26,pub:26,drafts:0,issues:0,urgent:0,high:0,auto_status:'complete',status:'complete',manual:false,note:null,ord:2},{id:'lib:think',label:'التفكير والذكاء',kind:'lib',total:0,pub:0,drafts:0,issues:0,urgent:0,high:0,auto_status:'unused',status:'unused',manual:false,note:null,ord:3}];
  window.sb={from:chain,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   switch(n){
    case'libr_summary':return{data:window.SUM};
    case'libr_run':window.SUM.last_run={at:'2026-11-26T11:00:00Z',by_name:'المدير',scope:a.p_scope||'all',found:7,fixed:0,reopened:0};return{data:{found:7,fixed:0,reopened:0,dup_pairs:1}};
    case'libr_sections':return{data:SECS};
    case'libr_section_items':return{data:[{key:'lib:x',src:'lib',slug:'x',title:'ورقة عمل الأرقام',status:'published',levels:['g1'],issues:['file_unverified'],checks:0}]};
    case'libr_coverage':return{data:{cells:[{dom:'math',lvl:'g1',n:4},{dom:'arabic',lvl:'a4',n:0}],targets:[{dom:'math',lvl:'g1',target:6,note:null}],goals_empty:[{slug:'g1',name:'هدف بلا موارد',domain:'arabic',status:'draft',levels:['a4']}],goals_total:30}};
    case'libr_dup_list':return{data:[{a:'bank:b1',b:'bank:b2',reasons:['title','descr'],status:'pending',ta:'حروف ملونة',tb:'حروف ملونة',sa:'published',sb:'published',srca:'bank',srcb:'bank',la:['a4'],lb:['a4']}]};
    case'libr_links_list':return{data:[{key:'lib:x',title:'ورقة عمل الأرقام',src:'lib',field:'file',url:'files/lib/x.pdf',verdict:'unchecked'},{key:'vid:v1',title:'فيديو',src:'vid',field:'file',url:'files/v.mp4',verdict:'broken',code:404},{key:'lib:y',title:'قصة',src:'lib',field:'file',url:'files/y.pdf',verdict:'ok',code:206,ctype:'application/pdf'}]};
    case'libr_links_start':return{data:{started:228,skipped_private:1}};
    case'libr_links_collect':return{data:{collected:228,still_pending:0}};
    case'libr_rescan':return{data:{found:1,fixed:0,reopened:0}};
    case'libr_item':return{data:{key:a.p_key,src:'lib',slug:'x',title:'ورقة عمل الأرقام',status:'published',levels:['g1'],descr:'d',subject:'الرياضيات',typ:'worksheet',sec:'ws',file:null,rights:null,skills:['العد'],paths:[],goals:[],issues:[{id:'i2',kind:'file_unverified',detail:'لا يوجد رابط ملف',priority:'high',status:'open'}],checks:[]}};
    case'libr_report_create':return{data:{id:'R1',title:a.p_title||'تقرير مراجعة المكتبة',data:{created_at:'2026-11-26T12:00:00Z',by:'المدير',summary:window.SUM,sections:SECS.map(s=>({id:s.id,label:s.label,status:s.status,manual:false,total:s.total,pub:s.pub,drafts:s.drafts,issues:s.issues})),missing_data:[{key:'lib:x',title:'ورقة عمل الأرقام',kinds:['file_unverified']}],dups:[{a:'bank:b1',b:'bank:b2',ta:'حروف ملونة',tb:'حروف ملونة',reasons:['title']}],links:[{key:'vid:v1',field:'file',url:'files/v.mp4',verdict:'broken',code:404}],class_issues:[{key:'lib:y',title:'قصة بلا قسم',kind:'no_section',detail:''}],tasks_open:[{key:'lib:x',title:'ورقة عمل الأرقام',kind:'file_unverified',priority:'high',status:'open',assignee:null}],tasks_done:[{key:'bank:b2',title:'حروف',kind:'missing_descr',status:'done',at:null}],counts:{open:6,done:1,ignored:0}}}};
    default:return{data:null};
   }}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=n=>{window.went=n};window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{}};`});
 await p.addScriptTag({content:fs.readFileSync('manage/libreviewadm.js','utf8')});
 const txt=()=>p.evaluate(()=>document.getElementById('m').innerText);
 const tab=async t=>{await p.click('#lrtabs [data-t="'+t+'"]');await p.waitForTimeout(150)};
 const calls=n=>p.evaluate(n=>window.calls.filter(c=>c[0]===n),n);
 await p.evaluate(()=>window.__zp.SUB.libreviewadm.fn(document.getElementById('m')));await p.waitForTimeout(250);
 const L=VW+'px ';
 // الملخص
 let t=await txt();
 T(/921/.test(t.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)))&&/موارد منشورة/.test(t),L+'summary from RPC data');
 T(/لم تُجرَ أي مراجعة بعد/.test(t),L+'honest no-run state');
 T(await p.evaluate(()=>!!document.getElementById('lrback')),L+'back button');
 await p.click('#lrback');T(await p.evaluate(()=>window.went)==='libadm',L+'back -> libadm');
 // بدء مراجعة
 await p.click('#lrrun');await p.waitForTimeout(250);t=await txt();
 T((await calls('libr_run')).length===1&&(await calls('libr_run'))[0][1].p_scope===null,L+'start full review');
 T(/آخر مراجعة/.test(t)&&!/لم تُجرَ أي مراجعة/.test(t),L+'last run shown after review');
 // الأقسام
 await tab('sec');t=await txt();T(/أوراق العمل/.test(t)&&/يحتاج إلى مراجعة/.test(t)&&/مكتمل مبدئيًا/.test(t)&&/غير مستخدم حاليًا/.test(t),L+'sections statuses incl unused');
 await p.click('[data-sscan="lib:ws"]');await p.waitForTimeout(200);T((await calls('libr_run')).some(c=>c[1].p_scope==='lib:ws'),L+'scan single section');
 await tab('sec');await p.click('[data-sopen="lib:ws"]');await p.waitForTimeout(200);t=await txt();T(/ورقة عمل الأرقام/.test(t)&&/تعديل المورد/.test(t),L+'section opens resources');
 await p.click('.lr [data-open]');T(await p.evaluate(()=>window.went)==='libadm',L+'edit resource -> lib admin');
 await tab('sec');await p.click('[data-sset="lib:ws"]');await p.selectOption('#lrss','not_ready');await p.click('#lrssave');await p.waitForTimeout(150);
 T((await calls('libr_section_set')).some(c=>c[1].p_status==='not_ready'),L+'manual section status');
 // الناقص + تصفية
 await tab('miss');t=await txt();T(/غير مرتبط بمهارة|بلا مهارة مرتبطة/.test(t)&&/ملف غير مسجّل/.test(t),L+'missing items shown with element name');
 T(!/قصة بلا قسم/.test(t),L+'classification issues not in missing tab');
 await p.selectOption('#fl','g1');await p.waitForTimeout(150);t=await txt();T(/ورقة عمل الأرقام/.test(t)&&!/نصل الحرف/.test(t),L+'filter by grade');
 await p.selectOption('#fl','');await p.selectOption('#fk','missing_skill');await p.waitForTimeout(150);t=await txt();T(/نصل الحرف/.test(t)&&!/ورقة عمل الأرقام/.test(t),L+'filter by kind');
 await p.click('.lr [data-open]');T(await p.evaluate(()=>window.went)==='bankadm',L+'open bank resource -> bankadm');
 // التصنيف
 await tab('class');t=await txt();T(/قصة بلا قسم/.test(t)&&/تصنيف صف أعلى من الرابع/.test(t),L+'classification issues incl out-of-scope taxonomy');
 // التغطية
 await tab('cov');t=await txt();T(/ليست مشكلة تلقائيًا/.test(t)&&/اللغة العربية/.test(t)&&/المشاريع التعليمية/.test(t)&&/هدف بلا موارد/.test(t),L+'coverage table + no-auto-problem note + empty goals');
 T(await p.evaluate(()=>[...document.querySelectorAll('.lr th')].filter(x=>/ص4|ص1/.test(x.textContent)).length>0)&&!(await p.evaluate(()=>/ص5|ص6/.test(document.querySelector('.lr table').innerText))),L+'coverage limited to grades 1-4');
 await p.click('td.cell[data-cd="arabic"][data-cl="a4"]');await p.fill('#ctv','3');await p.click('#ctsv');await p.waitForTimeout(150);
 T((await calls('libr_target_set')).some(c=>c[1].p_dom==='arabic'&&c[1].p_target===3),L+'set coverage target');
 // المكرر
 await tab('dup');t=await txt();T(/سبب الاشتباه/.test(t)&&/عنوان متطابق/.test(t)&&/وصف متطابق/.test(t)&&/لا يُحذف أي مورد/.test(t),L+'duplicates with reason');
 await p.click('[data-hd="0"]');await p.fill('.hn','نسخة مكررة تمامًا');await p.click('.hc');await p.waitForTimeout(150);
 const hd=(await calls('libr_dup_hide'))[0];T(hd&&hd[1].p_hide==='bank:b2'&&/مكررة/.test(hd[1].p_note),L+'hide duplicate after confirmation (no delete)');
 await tab('dup');await p.click('[data-nd="0"]');await p.waitForTimeout(150);T((await calls('libr_dup_decide')).some(c=>c[1].p_status==='not_dup'),L+'mark not duplicate');
 // الروابط
 await tab('links');t=await txt();T(/لم يتم الفحص/.test(t)&&/غير موجود \(404\)/.test(t)&&/سليم/.test(t),L+'link states incl "not checked"');
 await p.click('#lstart');await p.waitForTimeout(150);T((await calls('libr_links_start')).length===1,L+'start link check');
 await tab('links');await p.click('#lcol');await p.waitForTimeout(150);T((await calls('libr_links_collect')).length===1,L+'collect link results');
 // الجودة
 await tab('qc');await p.fill('#qcq','ورقة');await p.click('#qcgo');await p.waitForTimeout(200);await p.click('[data-det]');await p.waitForTimeout(200);
 T(await p.evaluate(()=>document.querySelectorAll('.lr-modal .lr-qc .r').length)===9,L+'9-item quality checklist');
 await p.evaluate(()=>{const r=document.querySelector('.lr-modal [data-qk="age"]');r.querySelector('.qv').value='bad';r.querySelector('.qn').value='أصعب من العمر';r.querySelector('.qs').click()});await p.waitForTimeout(250);
 const cs=(await calls('libr_check_save'))[0];T(cs&&cs[1].p_item==='age'&&cs[1].p_verdict==='bad',L+'record quality result');
 await p.evaluate(()=>{document.querySelectorAll('.lr-modal').forEach(x=>x.remove());return window.__zp.SUB.libreviewadm.fn(document.getElementById('m'))});await p.waitForTimeout(250);await tab('qc');await p.fill('#qcq','ورقة');await p.click('#qcgo');await p.waitForTimeout(200);await p.click('[data-det]');await p.waitForTimeout(200);
 await p.click('#mrescan');await p.waitForTimeout(200);T((await calls('libr_rescan')).length===1,L+'rescan resource after edit');
 // المهام
 await tab('tasks');t=await txt();T(/عاجلة/.test(t)&&/مرتفعة/.test(t)&&/عادية/.test(t)&&/فتح المورد/.test(t)&&/تحديد كمكتمل/.test(t),L+'tasks with priority + buttons');
 await p.selectOption('#fp','urgent');await p.waitForTimeout(150);t=await txt();T(/فيديو/.test(t)&&!/نصل الحرف/.test(t),L+'filter by priority');
 await p.selectOption('#fp','');await p.click('[data-edt]');await p.fill('.as','المحررة');await p.click('.sv');await p.waitForTimeout(150);
 T((await calls('libr_task_set')).some(c=>c[1].p_assignee==='المحررة'),L+'assign task');
 await p.click('[data-done]');await p.waitForTimeout(150);T((await calls('libr_task_set')).some(c=>c[1].p_status==='done'),L+'mark done');
 await p.click('#addtask');await p.fill('#tk','lib:x');await p.fill('#td','راجعي الملف');await p.click('#tsv');await p.waitForTimeout(150);T((await calls('libr_task_add')).length===1,L+'create manual task');
 // التقارير
 await tab('rep');await p.fill('#rtt','تقرير الأسبوع');await p.click('#rmk');await p.waitForTimeout(250);t=await txt();
 T(/أُنشئ:/.test(t)&&/الأقسام التي تمت مراجعتها/.test(t)&&/موارد ببيانات ناقصة/.test(t)&&/موارد مكررة محتملة/.test(t)&&/مشكلات التصنيف/.test(t)&&/المهام التي عولجت/.test(t)&&/المهام المفتوحة/.test(t),L+'report sections + creation date');
 const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#rcsv')]);T(/\.csv$/.test(dl.suggestedFilename()),L+'export CSV');
 // لا حذف ولا كتابة مباشرة
 const names=await p.evaluate(()=>window.calls.map(c=>c[0]));T(!names.some(n=>/delete|remove|drop/.test(n)),L+'no delete rpc was ever called');
 T(!/\.(delete|update|insert|upsert)\(/.test(fs.readFileSync('manage/libreviewadm.js','utf8')),L+'ui has no direct table writes (RPC only)');
 // خطأ من الخادم يظهر كرسالة
 await p.evaluate(()=>{window.NEXT_ERR='QUALITY_PERM: ليست لديك صلاحية لهذا الإجراء.'});await tab('sum');await p.click('#lrrun');await p.waitForTimeout(200);
 T((await p.evaluate(()=>window.msgs)).some(m=>/ليست لديك صلاحية/.test(m)),L+'server error shown');
 // تخطيط
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);T(ov<=2,L+'no horizontal page overflow ('+ov+')');
 for(const tb of ['sum','sec','miss','class','cov','dup','links','qc','tasks','rep']){await p.evaluate(()=>window.__zp.SUB.libreviewadm.fn(document.getElementById('m')));await p.waitForTimeout(150);await tab(tb);const o=await p.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);if(o>2){T(false,L+tb+' overflow '+o)}}
 T(errs.length===0,L+'no page errors '+errs.join('|'));
 if(VW===390)await p.screenshot({path:'/tmp/lr390.png'});
 await ctx.close();
}
await b.close();console.log(fails?('FAILED '+fails):'ALL PASS');process.exit(fails?1:0)})();
