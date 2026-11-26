// NODE_PATH=$(npm root -g) [VW=390] node tools/content/map/test_relsadm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,768,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.ME={roles:['content_editor']};window.went=null;window.ASK=true;window.NEXT_ERR=null;
  const DB={skills:[{id:'S1',slug:'a',domain:'math',name:'العد',levels:['a4','a5','a6'],status:'active',sort:1},{id:'S2',slug:'b',domain:'math',name:'مقارنة الكميات',levels:['a5','a6','g1'],status:'active',sort:2}],
   skill_links:[{skill_id:'S1',item_key:'bank:b1'},{skill_id:'S2',item_key:'lib:l1'},{skill_id:'S2',item_key:'lib:l2'}],
   quality_items:[{key:'bank:b1',title:'نعد النجوم',levels:['a4','a5'],status:'published',gone:false},{key:'lib:l1',title:'ورقة المقارنة',levels:['a5','a6'],status:'published',gone:false},{key:'lib:l2',title:'مسودة',levels:['a5'],status:'draft',gone:false}]};
  let RELS=[{id:'R1',from:'S1',to:'S2',kind:'base',expl:'العد يساعد على المقارنة',levels:['a5'],items:[{k:'bank:b1',bridge:true}],status:'draft'}];
  const q=(tb)=>{const st={f:[]};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(){return api},range(a,b2){st.rg=[a,b2];return api},then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r))})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};if(n==='rel_admin')return{data:JSON.parse(JSON.stringify(RELS))};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='rel_save'){let r=a.p_id&&RELS.find(x=>x.id===a.p_id);if(!r){r={id:'N'+RELS.length,status:'draft'};RELS.push(r)}Object.assign(r,{from:a.p_from,to:a.p_to,kind:a.p_kind,expl:a.p_expl,levels:a.p_levels,items:a.p_items});return{data:r.id}}
   if(n==='rel_status'){RELS.find(x=>x.id===a.p_id).status=a.p_status}if(n==='rel_delete'){RELS=RELS.filter(x=>x.id!==a.p_id)}
   return{data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:()=>Promise.resolve(window.ASK)};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/relsadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.relsadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 await open();let t=await p.innerText('#m');T(t.includes('العد ← مقارنة الكميات')&&t.includes('مسودة'),'قائمة العلاقات');T(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تجاوز عرض');
 await p.click('#rlNew');await p.selectOption('#rlFrom','S1');await p.selectOption('#rlTo','S2');t=await p.innerText('#m');
 const lvs=await p.$$eval('[data-l]',e=>e.map(x=>x.dataset.l));T(lvs.join()==='a5,a6','الأعمار المشتركة فقط: '+lvs);
 await p.fill('#rlExpl','شرح العلاقة');await p.check('[data-l=a5]');
 const keys=await p.$$eval('[data-k]',e=>e.map(x=>x.dataset.k));T(keys.includes('bank:b1')&&keys.includes('lib:l1')&&!keys.includes('lib:l2'),'الموارد المنشورة المناسبة فقط: '+keys);
 await p.check('[data-k="lib:l1"]');await p.check('[data-b="lib:l1"]');await p.selectOption('#rlKind','cross');await p.click('#rlSave');await p.waitForTimeout(200);
 const c=await p.evaluate(()=>window.calls.filter(x=>x[0]==='rel_save').pop());T(c&&c[1].p_from==='S1'&&c[1].p_kind==='cross'&&c[1].p_levels.join()==='a5'&&c[1].p_items.length===1&&c[1].p_items[0].bridge===true,'يرسل الحفظ: '+JSON.stringify(c&&c[1]));
 T((await p.evaluate(()=>window.msgs)).includes('تم الحفظ.'),'رسالة نجاح');T(await p.$('#rlPub')===null,'المحرر لا يرى زر النشر');
 await p.evaluate(()=>{window.NEXT_ERR='هذا الربط يصنع دائرة في ترتيب المهارات السابقة واللاحقة.'});await p.click('#rlSave');await p.waitForTimeout(150);T((await p.evaluate(()=>window.msgs)).some(m=>m.includes('دائرة')),'خطأ القاعدة يظهر');
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer']}});await open();await p.click('[data-e=R1]');T(await p.$('#rlPub')!==null&&await p.$('#rlDel')!==null,'المراجع يرى النشر والحذف');
 await p.click('#rlPub');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('ظاهرة للزوار')&&await p.$('#rlHide')!==null,'نُشرت');
 await p.click('#rlHide');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('غير ظاهرة'),'أُخفيت');
 await p.evaluate(()=>{window.ASK=false});await p.click('#rlDel');await p.waitForTimeout(150);T(await p.evaluate(()=>!window.calls.some(x=>x[0]==='rel_delete')),'الحذف يحتاج تأكيدًا');
 await p.evaluate(()=>{window.ASK=true});await p.click('#rlDel');await p.waitForTimeout(250);T(await p.evaluate(()=>window.calls.some(x=>x[0]==='rel_delete')),'حُذفت بعد التأكيد');
 await p.click('[data-go=skillsadm]');T(await p.evaluate(()=>window.went)==='skillsadm','اختصار');
 await p.evaluate(()=>{window.ME={roles:[]}});await open();T((await p.innerText('#m')).includes('ليست لديك صلاحية'),'بلا دور لا دخول');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
