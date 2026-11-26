// NODE_PATH=$(npm root -g) [VW=390] node tools/content/tasks/test_dtasksadm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
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
  let ROWS=[{id:'X1',title:'مهام الحروف',descr:null,cat:'arabic',skill:'S1',levels:['a5'],est:10,from:null,to:null,tasks:[{t:'العب',d:'',kind:'game',item:'bank:b1',min:5}],status:'draft'}];
  const q=(tb)=>{const st={f:[]};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(){return api},range(a,b2){st.rg=[a,b2];return api},then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r))})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};if(n==='dtask_admin')return{data:JSON.parse(JSON.stringify(ROWS))};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='dtask_save'){const p=a.p;let r=p.id&&ROWS.find(x=>x.id===p.id);if(!r){r={id:'N'+ROWS.length,status:'draft'};ROWS.push(r)}Object.assign(r,{title:p.title,descr:p.descr,cat:p.cat,skill:p.skill,levels:p.levels,est:p.est,from:p.from,to:p.to,tasks:p.tasks});return{data:r.id}}
   if(n==='dtask_status'){ROWS.find(x=>x.id===a.p_id).status=a.p_status}if(n==='dtask_delete'){ROWS=ROWS.filter(x=>x.id!==a.p_id)}
   return{data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:()=>Promise.resolve(window.ASK)};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/dtasksadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.dtasksadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 await open();let t=await p.innerText('#m');T(t.includes('مهام الحروف')&&t.includes('مسودة'),'قائمة');T(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تجاوز عرض');
 await p.click('#dtNew');await p.fill('#dtTitle','مهام العد');await p.selectOption('#dtSkill','S1');
 const lvs=await p.$$eval('[data-l]',e=>e.map(x=>x.dataset.l));T(lvs.join()==='a4,a5,a6','أعمار المهارة فقط: '+lvs);
 await p.click('[data-l=a5]');
 const opts=await p.$$eval('.tI option',e=>e.map(x=>x.value).filter(Boolean));T(opts.join()==='bank:b1','الموارد المنشورة المرتبطة بالمهارة فقط: '+opts);
 await p.fill('.tT','عدّ النجوم');await p.selectOption('.tK','game');await p.selectOption('.tI','bank:b1');
 await p.click('#dtAdd');T(await p.$$eval('[data-i]',e=>e.length)===2,'إضافة مهمة');await p.fill('[data-i="1"] .tT','مهمة ثانية');await p.selectOption('[data-i="1"] .tI','bank:b1');
 await p.click('[data-up="1"]');T((await p.$$eval('.tT',e=>e.map(x=>x.value))).join()==='مهمة ثانية,عدّ النجوم','ترتيب المهام');
 for(let i=0;i<3;i++){if(await p.$('#dtAdd'))await p.click('#dtAdd')}T(await p.$('#dtAdd')===null&&await p.$$eval('[data-i]',e=>e.length)===5,'حد خمس مهام');
 for(let c=5;c>2;c--)await p.click('[data-rm="'+(c-1)+'"]');T(await p.$$eval('[data-i]',e=>e.length)===2,'حذف مهمة');
 await p.click('#dtSave');await p.waitForTimeout(200);
 const c=await p.evaluate(()=>window.calls.filter(x=>x[0]==='dtask_save').pop());T(c&&c[1].p.skill==='S1'&&c[1].p.levels.join()==='a5'&&c[1].p.tasks.length===2&&c[1].p.tasks[0].t==='مهمة ثانية'&&c[1].p.tasks[1].item==='bank:b1','يرسل الحفظ: '+JSON.stringify(c&&c[1].p));
 T((await p.evaluate(()=>window.msgs)).includes('تم الحفظ.'),'رسالة نجاح');T(await p.$('#dtPub')===null,'المحرر لا يرى النشر');
 await p.evaluate(()=>{window.NEXT_ERR='P0001: مورد المهمة غير منشور'});await p.click('#dtSave');await p.waitForTimeout(150);T((await p.evaluate(()=>window.msgs)).some(m=>m.includes('غير منشور')),'خطأ القاعدة يظهر');
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer']}});await open();await p.click('[data-e=X1]');T(await p.$('#dtPub')!==null&&await p.$('#dtDel')!==null,'المراجع يرى النشر والحذف');
 await p.click('#dtPub');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('ظاهرة للزوار'),'نُشرت');await p.click('#dtHide');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('غير ظاهرة'),'أُخفيت');
 await p.evaluate(()=>{window.ASK=false});await p.click('#dtDel');await p.waitForTimeout(150);T(await p.evaluate(()=>!window.calls.some(x=>x[0]==='dtask_delete')),'الحذف يحتاج تأكيدًا');
 await p.evaluate(()=>{window.ASK=true});await p.click('#dtDel');await p.waitForTimeout(250);T(await p.evaluate(()=>window.calls.some(x=>x[0]==='dtask_delete')),'حُذفت بعد التأكيد');
 await p.click('[data-go=dailyadm]');T(await p.evaluate(()=>window.went)==='dailyadm','اختصار');
 await p.evaluate(()=>{window.ME={roles:[]}});await open();T((await p.innerText('#m')).includes('ليست لديك صلاحية'),'بلا دور لا دخول');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
