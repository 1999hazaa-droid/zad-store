// NODE_PATH=$(npm root -g) [VW=390] node tools/content/integrated/test_integadm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,768,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.ME={roles:['content_editor']};window.went=null;window.ASK=true;window.NEXT_ERR=null;
  const DB={skills:[{id:'S1',slug:'a',domain:'math',name:'العد',levels:['a4','a5','a6'],status:'active',sort:1},{id:'S2',slug:'b',domain:'math',name:'الأشكال',levels:['a5','a6'],status:'active',sort:2}],
   skill_links:[{skill_id:'S1',item_key:'bank:b1'},{skill_id:'S2',item_key:'lib:l1'}],
   quality_items:[{key:'bank:b1',title:'نعد النجوم',levels:['a4','a5'],status:'published',gone:false},{key:'lib:l1',title:'ورقة الأشكال',levels:['a5','a6'],status:'published',gone:false},{key:'lib:l2',title:'مسودة',levels:['a5'],status:'draft',gone:false}]};
  let ROWS=[{id:'X1',name:'سوق الأعداد',kind:'langmath',item:'bank:b1',main:'S1',extra:['S2'],levels:['a5'],goal:'هدف',tools:null,instr:'تعليمات',steps:['خطوة'],inter:null,feedback:null,extra_key:null,status:'draft',missing:['S2']}];
  const q=(tb)=>{const st={f:[]};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(){return api},range(a,b2){st.rg=[a,b2];return api},then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r))})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};if(n==='integ_admin')return{data:JSON.parse(JSON.stringify(ROWS))};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='integ_save'){const p=a.p;let r=p.id&&ROWS.find(x=>x.id===p.id);if(!r){r={id:'N'+ROWS.length,status:'draft',missing:[]};ROWS.push(r)}Object.assign(r,{name:p.name,kind:p.kind,item:p.item,main:p.main,extra:p.extra,levels:p.levels,goal:p.goal,tools:p.tools,instr:p.instr,steps:p.steps,inter:p.inter,feedback:p.feedback,extra_key:p.extra_key});return{data:r.id}}
   if(n==='integ_status'){ROWS.find(x=>x.id===a.p_id).status=a.p_status}if(n==='integ_delete'){ROWS=ROWS.filter(x=>x.id!==a.p_id)}
   return{data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:()=>Promise.resolve(window.ASK)};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/integadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.integadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 await open();let t=await p.innerText('#m');T(t.includes('سوق الأعداد')&&t.includes('ينقصه ربط منشور'),'قائمة وتنبيه نقص الربط');T(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تجاوز عرض');
 await p.click('#igNew');await p.fill('#igName','رحلة الأشكال');await p.selectOption('#igMain','S2');
 const lvs=await p.$$eval('[data-l]',e=>e.map(x=>x.dataset.l));T(lvs.join()==='a5,a6','أعمار المهارة الأساسية فقط: '+lvs);
 await p.check('[data-x=S1]');await p.check('[data-l=a5]');
 const opts=await p.$$eval('#igItem option',e=>e.map(x=>x.value).filter(Boolean));T(opts.includes('bank:b1')&&opts.includes('lib:l1')&&!opts.includes('lib:l2'),'الموارد المنشورة المرتبطة فقط: '+opts);
 await p.selectOption('#igItem','lib:l1');await p.fill('#igGoal','نتعرف على الأشكال');await p.fill('#igInstr','ابحث عن شكل');await p.fill('#igSteps','نبحث\nنصنف');await p.click('#igSave');await p.waitForTimeout(200);
 const c=await p.evaluate(()=>window.calls.filter(x=>x[0]==='integ_save').pop());T(c&&c[1].p.main==='S2'&&c[1].p.extra.join()==='S1'&&c[1].p.steps.length===2&&c[1].p.item==='lib:l1','يرسل الحفظ: '+JSON.stringify(c&&c[1].p));
 T((await p.evaluate(()=>window.msgs)).includes('تم الحفظ.'),'رسالة نجاح');T(await p.$('#igPub')===null,'المحرر لا يرى النشر');
 await p.evaluate(()=>{window.NEXT_ERR='النشاط الشامل يجمع مهارتين على الأقل'});await p.click('#igSave');await p.waitForTimeout(150);T((await p.evaluate(()=>window.msgs)).some(m=>m.includes('مهارتين')),'خطأ القاعدة يظهر');
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer']}});await open();await p.click('[data-e=X1]');T((await p.innerText('#m')).includes('لا علاقة منشورة بين الأساسية'),'تحذير الربط ناقص');T(await p.$('#igPub')!==null&&await p.$('#igDel')!==null,'المراجع يرى النشر والحذف');
 await p.click('#igPub');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('ظاهر للزوار'),'نُشر');await p.click('#igHide');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('غير ظاهر'),'أُخفي');
 await p.evaluate(()=>{window.ASK=false});await p.click('#igDel');await p.waitForTimeout(150);T(await p.evaluate(()=>!window.calls.some(x=>x[0]==='integ_delete')),'الحذف يحتاج تأكيدًا');
 await p.evaluate(()=>{window.ASK=true});await p.click('#igDel');await p.waitForTimeout(250);T(await p.evaluate(()=>window.calls.some(x=>x[0]==='integ_delete')),'حُذف بعد التأكيد');
 await p.click('[data-go=relsadm]');T(await p.evaluate(()=>window.went)==='relsadm','اختصار الربط');
 await p.evaluate(()=>{window.ME={roles:[]}});await open();T((await p.innerText('#m')).includes('ليست لديك صلاحية'),'بلا دور لا دخول');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
