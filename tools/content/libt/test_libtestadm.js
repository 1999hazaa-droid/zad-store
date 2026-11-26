// NODE_PATH=$(npm root -g) node tools/content/libt/test_libtestadm.js  (واجهة مركز الاختبار النهائي: واجهة حقيقية + قاعدة وهمية بحالة؛ قواعد القاعدة الفعلية في اختبار SQL)
const {chromium}=require('playwright');const fs=require('fs');let fails=0;const T=(c,m)=>{if(c)console.log('PASS',m);else{console.log('FAIL',m);fails++}};
const src=fs.readFileSync('manage/libtestadm.js','utf8');
T(!/\.from\(["'][a-z_]+["']\)\.(insert|update|delete|upsert)/.test(src),'no direct table writes');
(async()=>{const b=await chromium.launch();
for(const VW of [390,768,1100]){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.setDefaultTimeout(4000);const errs=[];p.on('pageerror',e=>errs.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.went=null;
  const R=(code,grp,label,kind,critical,status,detail)=>({code,grp,label,kind,critical,status,detail,run_at:status==='not_tested'?null:'2026-11-26T10:00:00Z',run_by:'x',hint:'جرّب بنفسك',ord:1});
  window.RES=[R('fn:search','fn','البحث عن الموارد','tool',true,'not_tested',null),R('qc:taxscope','qc','لا تصنيفات لصفوف أعلى من الرابع','auto',true,'fail','g5، g6'),R('priv:child','priv','حماية بيانات الطفل','auto',true,'pass','لا جداول'),R('lnk:back','lnk','زر الرجوع','manual',false,'not_tested',null),R('dev:phone','dev','الهاتف','tool',true,'not_tested',null)];
  window.ISS=[{id:'u1',code:'qc:taxscope',section:'qc',item:'لا تصنيفات لصفوف أعلى من الرابع',kind:'test',detail:'g5، g6',priority:'critical',status:'new',retest:null,assignee:null,auto:true,note:null,found_at:'2026-11-26T10:00:00Z'},{id:'u2',code:null,section:'القصص',item:'قصة',kind:'manual',detail:'وصف المشكلة هنا',priority:'high',status:'fixed',retest:null,assignee:'سارة',auto:false,note:null,found_at:'2026-11-26T09:00:00Z'},{id:'u3',code:null,section:'x',item:'مهمة',kind:'manual',detail:'وصف مهمة ثانية',priority:'normal',status:'retested',retest:'pass',assignee:null,auto:false,note:null,found_at:'2026-11-26T08:00:00Z'}];
  window.V={verdict:'not_run',reasons:[]};window.AP=null;
  window.SECS=[{id:'lib:ws',label:'أوراق العمل',kind:'lib',total:62,pub:62,tests:[{code:'sec:lib:ws:content',label:'«أوراق العمل»: فتح القسم وعرض المحتوى',status:'pass',detail:'62 مورد منشور',critical:false},{code:'sec:lib:ws:links',label:'«أوراق العمل»: الملفات الأساسية تفتح',status:'not_tested',detail:'1 ملف لم يُفحص',critical:false}]},{id:'stories',label:'القصص',kind:'src',total:30,pub:28,tests:[{code:'sec:stories:scope',label:'«القصص»: الفئات ضمن النطاق',status:'fail',detail:'2 مورد بعمر مفقود',critical:true}]}];
  const chain=(tb)=>{const st={};const api={select(){return api},order(){return api},limit(){return api},eq(c,v){st.v=v;return api},single(){st.one=1;return api},then(res){const d=tb==='libt_issues'?window.ISS:tb==='libt_reports'?[{id:'R1',created_at:'2026-11-26T12:00:00Z',by_name:'المدير',title:'تقرير الجاهزية النهائية للمكتبة',verdict:'needs_fix'}]:[];res(st.one?{data:{data:window.REPDATA},error:null}:{data:d,error:null})}};return api};
  const summary=()=>({verdict:window.V,approval:window.AP,last_run:window.V.verdict==='not_run'?null:{at:'2026-11-26T11:00:00Z',by_name:'المدير'},sections_total:23,sections_tested:window.V.verdict==='not_run'?0:22,tests_pass:window.RES.filter(r=>r.status==='pass').length,tests_fail:window.RES.filter(r=>r.status==='fail').length,tests_not:window.RES.filter(r=>r.status==='not_tested').length,issues_open:window.ISS.filter(i=>i.status!=='closed').length,issues_fixed:window.ISS.filter(i=>['fixed','retested','closed'].includes(i.status)).length,issues_closed:window.ISS.filter(i=>i.status==='closed').length});
  window.sb={from:chain,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);
   switch(n){
    case'libt_summary':return{data:summary()};
    case'libt_list':return{data:{results:window.RES,sections:window.SECS}};
    case'libt_run':window.V={verdict:'needs_fix',reasons:['لا تصنيفات لصفوف أعلى من الرابع: g5، g6','لم يُختبر (حرج): البحث عن الموارد']};return{data:{ok:true}};
    case'libt_record':{const r=window.RES.find(x=>x.code===a.p_code);r.status=a.p_status;r.detail=a.p_detail;return{data:null}}
    case'libt_issue_add':window.ISS.unshift({id:'n1',section:a.p_section,item:a.p_item,kind:a.p_kind,detail:a.p_detail,priority:a.p_priority,status:'new',assignee:a.p_assignee,auto:false,found_at:'2026-11-26T13:00:00Z'});return{data:'n1'};
    case'libt_issue_set':{const i=window.ISS.find(x=>x.id===a.p_id);if(a.p_status)i.status=a.p_status;return{data:null}}
    case'libt_retest':{const i=window.ISS.find(x=>x.id===a.p_id);if(i.auto){return{data:{retest:'fail'}}}i.retest=a.p_result;i.status=a.p_result==='pass'?'retested':'doing';return{data:{retest:a.p_result}}}
    case'libt_issue_close':{const i=window.ISS.find(x=>x.id===a.p_id);if(i.status!=='retested')return{error:{message:'لا تُغلق المشكلة قبل إعادة اختبارها بنجاح.'}};i.status='closed';return{data:null}}
    case'libt_approve':return{error:{message:'لا يمكن اعتماد المكتبة الآن: الحالة «needs_fix».'}};
    case'libt_report_create':window.REPDATA={created_at:'2026-11-26T12:00:00Z',by:'المدير',verdict:window.V,summary:summary(),sections:window.SECS,results:window.RES,issues_fixed:window.ISS.filter(i=>['fixed','retested','closed'].includes(i.status)).map(i=>({item:i.item,status:i.status,retest:i.retest})),issues_remaining:window.ISS.filter(i=>['new','doing'].includes(i.status)).map(i=>({item:i.item,section:i.section,detail:i.detail,priority:i.priority,status:i.status})),review_urgent:0,review_high:93};return{data:{id:'R1',title:'تقرير',data:window.REPDATA}};
    default:return{data:null};
   }}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=n=>{window.went=n};window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{}};`});
 await p.addScriptTag({content:src});
 const txt=()=>p.evaluate(()=>document.getElementById('m').innerText);
 const tab=async t=>{await p.click('#lttabs [data-t="'+t+'"]');await p.waitForTimeout(120)};
 const calls=n=>p.evaluate(n=>window.calls.filter(c=>c[0]===n),n);
 const fixd=s=>s.replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
 await p.evaluate(()=>window.__zp.SUB.libtestadm.fn(document.getElementById('m')));await p.waitForTimeout(250);
 const L=VW+'px ';let t=await txt();
 T(/لم يبدأ الاختبار/.test(t)&&/تشغيل الفحوص الآلية/.test(t),L+'honest not-run state');
 T(/0|٠/.test(fixd(t))&&!/جاهزة\b(?! مع)/.test(t.replace('لم يبدأ','')),L+'never shows ready when not run');
 await p.click('#ltback');T(await p.evaluate(()=>window.went)==='libadm',L+'back -> libadm');
 await p.click('#ltrun');await p.waitForTimeout(250);t=await txt();
 T((await calls('libt_run')).length===1&&/تحتاج إلى معالجة قبل الإطلاق/.test(t)&&/g5/.test(t),L+'run -> needs_fix with reasons');
 T(/22/.test(fixd(t))&&/23/.test(fixd(t)),L+'sections tested from RPC');
 // مجموعات
 await tab('fn');t=await txt();T(/البحث عن الموارد/.test(t)&&/لم يتم الاختبار/.test(t)&&/اختبار الأداة/.test(t),L+'tool test shown not_tested honestly');
 T(!(await p.$('#m [data-code="fn:search"] [data-rec]')),L+'tool tests cannot be recorded by hand');
 await tab('qc');t=await txt();T(/g5/.test(t)&&/مشكلة/.test(t)&&/حماية بيانات الطفل/.test(t),L+'qc+privacy tests shown');
 await tab('lnk');await p.click('[data-code="lnk:back"] [data-rec="pass"]');await p.fill('.lt-modal textarea','جرّبت الرجوع من صفحة مورد');await p.click('.lt-modal [data-ok]');await p.waitForTimeout(250);
 T((await calls('libt_record')).some(c=>c[1].p_code==='lnk:back'&&c[1].p_status==='pass'&&c[1].p_detail.includes('جرّبت')),L+'manual record with note');
 t=await txt();T(/نجح/.test(t),L+'manual result reflected');
 // أقسام
 await tab('sec');t=await txt();T(/أوراق العمل/.test(t)&&/القصص/.test(t)&&/لم يكتمل الاختبار/.test(t)&&/مشكلة/.test(t),L+'sections with honest status');
 await p.click('[data-opn="stories"]');T(await p.evaluate(()=>window.went)==='storiesadm',L+'open section -> stories admin');
 await tab('sec');await p.click('[data-opn="lib:ws"]');T(await p.evaluate(()=>window.went)==='libadm',L+'open lib section -> lib admin');
 // مشكلات
 await tab('iss');t=await txt();T(/جديدة/.test(t)&&/تم الإصلاح/.test(t)&&/سارة/.test(t),L+'issues list statuses+assignee');
 T(!!(await p.$('.lt-i[data-id="u2"] [data-rt]'))&&!(await p.$('.lt-i[data-id="u1"] [data-rt]'))&&!(await p.$('.lt-i[data-id="u2"] [data-cl]'))&&!!(await p.$('.lt-i[data-id="u3"] [data-cl]')),L+'retest only when fixed; close only when retested');
 await p.click('.lt-i[data-id="u1"] [data-op]');t=await p.evaluate(()=>document.querySelector('.lt-modal').innerText);T(!/مغلقة<|value="closed"/.test(await p.evaluate(()=>document.querySelector('.lt-modal').innerHTML)),L+'cannot pick retested/closed manually');
 await p.click('.lt-modal [data-x]');
 await p.click('.lt-i[data-id="u2"] [data-rt]');await p.selectOption('.lt-modal [data-f="r"]','fail');await p.fill('.lt-modal textarea','ما زالت المشكلة');await p.click('.lt-modal [data-ok]');await p.waitForTimeout(250);
 T(await p.evaluate(()=>window.ISS.find(i=>i.id==='u2').status)==='doing',L+'failed retest -> doing');
 await p.click('.lt-i[data-id="u3"] [data-cl]');await p.waitForTimeout(250);T(await p.evaluate(()=>window.ISS.find(i=>i.id==='u3').status)==='closed',L+'close after pass retest');
 await tab('iss');await p.click('#ltadd');await p.fill('.lt-modal [data-f="item"]','نشاط');await p.fill('.lt-modal [data-f="detail"]','وصف كافٍ للمشكلة');await p.click('.lt-modal [data-ok]');await p.waitForTimeout(250);
 T((await calls('libt_issue_add')).length===1,L+'add issue via RPC');
 // تقرير واعتماد
 await tab('rep');t=await txt();T(/التوصية الحالية: تحتاج إلى معالجة قبل الإطلاق/.test(t),L+'recommendation needs_fix');
 await p.click('#ltap');await p.click('.lt-modal [data-ok]');await p.waitForTimeout(250);
 T(/لا يمكن اعتماد/.test(await p.evaluate(()=>window.msgs.join('|'))),L+'approval refused when needs_fix (server message shown)');
 await p.evaluate(()=>document.querySelectorAll('.lt-modal').forEach(m=>m.remove()));await p.click('#ltmk');await p.waitForTimeout(300);t=await txt();T((await calls('libt_report_create')).length===1&&/تقرير الجاهزية النهائية للمكتبة التعليمية/.test(t)&&/الأقسام التي تم اختبارها/.test(t)&&/المشكلات المتبقية/.test(t)&&/توافق الأجهزة والمتصفحات/.test(t)&&/لم يُختبر/.test(t),L+'report created with all parts');
 // الأجهزة: بلا تمرير أفقي
 for(const tb of ['sum','sec','fn','iss','rep']){await p.click('#ltbk').catch(()=>{});await tab(tb);const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);T(!ov,L+tb+' no horizontal overflow');}
 T(errs.length===0,L+'no page errors '+errs.join('|'));
 await ctx.close();}
await b.close();console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0)})();
