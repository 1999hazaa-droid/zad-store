// NODE_PATH=$(npm root -g) [VW=390] node tools/content/week/test_wplansadm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,768,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.ME={roles:['content_editor']};window.went=null;window.ASK=true;window.NEXT_ERR=null;
  const DB={skills:[{id:'S1',slug:'a',domain:'math',name:'العد',levels:['a4','a5','a6'],status:'active',sort:1},{id:'S2',slug:'b',domain:'math',name:'الأشكال',levels:['a5','a6'],status:'active',sort:2}],
   skill_links:[{skill_id:'S1',item_key:'bank:b1'},{skill_id:'S1',item_key:'lib:l1'},{skill_id:'S1',item_key:'lib:l3'},{skill_id:'S2',item_key:'lib:l1'}],
   quality_items:[{key:'bank:b1',title:'نعد النجوم',levels:['a4','a5'],status:'published',gone:false},{key:'lib:l1',title:'ورقة الأشكال',levels:['a5','a6'],status:'published',gone:false},{key:'lib:l3',title:'ورقة بديلة',levels:['a5'],status:'published',gone:false},{key:'lib:l2',title:'مسودة',levels:['a5'],status:'draft',gone:false}]};
  let ROWS=[{id:'X1',title:'أسبوع العد',goals:'هدف',levels:['a5'],skills:['S1'],entries:[{day:0,t:'ابدأ',d:'',kind:'game',domain:'math',skill:'S1',item:'bank:b1',alt:null},{day:2,t:'تابع',d:'',kind:'worksheet',domain:'review',skill:'S1',item:'lib:l1',alt:null}],status:'draft'}];
  const q=(tb)=>{const st={f:[]};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(){return api},range(a,b2){st.rg=[a,b2];return api},then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r))})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};if(n==='wplan_admin')return{data:JSON.parse(JSON.stringify(ROWS))};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='wplan_save'){const p=a.p;let r=p.id&&ROWS.find(x=>x.id===p.id);if(!r){r={id:'N'+ROWS.length,status:'draft',skills:[]};ROWS.push(r)}Object.assign(r,{title:p.title,goals:p.goals,levels:p.levels,entries:p.entries});return{data:r.id}}
   if(n==='wplan_status'){ROWS.find(x=>x.id===a.p_id).status=a.p_status}if(n==='wplan_delete'){ROWS=ROWS.filter(x=>x.id!==a.p_id)}
   return{data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:()=>Promise.resolve(window.ASK)};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/wplansadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.wplansadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 await open();let t=await p.innerText('#m');T(t.includes('أسبوع العد')&&t.includes('مسودة'),'قائمة');T(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تجاوز عرض');
 await p.click('#wpNew');await p.fill('#wpTitle','أسبوع جديد');await p.fill('#wpGoals','نمارس العد');await p.click('[data-l=a5]');
 T(await p.$$eval('[data-i]',e=>e.length)===2,'نشاطان افتراضيان');
 await p.selectOption('[data-i="0"] .eS','S1');
 const opts=await p.$$eval('[data-i="0"] .eI option',e=>e.map(x=>x.value).filter(Boolean));T(opts.includes('bank:b1')&&opts.includes('lib:l1')&&!opts.includes('lib:l2'),'الموارد المنشورة المرتبطة فقط: '+opts);
 const sks=await p.$$eval('[data-i="0"] .eS option',e=>e.map(x=>x.value).filter(Boolean));T(sks.join()==='S1,S2','مهارات تشمل عمر الخطة: '+sks);
 await p.fill('[data-i="0"] .eT','نبدأ بالعد');await p.selectOption('[data-i="0"] .eK','story');await p.selectOption('[data-i="0"] .eM','math');await p.selectOption('[data-i="0"] .eI','bank:b1');
 await p.selectOption('[data-i="1"] .eS','S1');await p.fill('[data-i="1"] .eT','نراجع');await p.selectOption('[data-i="1"] .eD','4');await p.selectOption('[data-i="1"] .eM','review');await p.selectOption('[data-i="1"] .eI','lib:l1');await p.selectOption('[data-i="1"] .eA','lib:l3');
 T((await p.innerText('#m')).includes('الأربعاء: ١'),'معاينة التوزيع');
 await p.click('#wpAdd');await p.selectOption('[data-i="2"] .eD','0');await p.selectOption('[data-i="3"]'.replace('3','2')+' .eM','math');await p.click('#wpAdd');await p.click('#wpAdd');await p.click('#wpAdd');
 await p.click('[data-i="0"] [data-dn]');T((await p.$$eval('.eT',e=>e.map(x=>x.value)))[1]==='نبدأ بالعد','ترتيب الأنشطة');
 await p.selectOption('[data-i="0"] .eD','0');await p.selectOption('[data-i="1"] .eD','0');await p.selectOption('[data-i="2"] .eD','0');
 T((await p.innerText('#m')).includes('أكثر من'),'تحذير ازدحام اليوم');
 for(let c=6;c>2;c--)await p.click('[data-rm="'+(c-1)+'"]');T(await p.$$eval('[data-i]',e=>e.length)===2,'حذف أنشطة');
 await p.selectOption('[data-i="0"] .eD','0');await p.selectOption('[data-i="1"] .eD','4');
 await p.click('#wpSave');await p.waitForTimeout(200);
 const c=await p.evaluate(()=>window.calls.filter(x=>x[0]==='wplan_save').pop());T(c&&c[1].p.levels.join()==='a5'&&c[1].p.entries.length===2&&c[1].p.entries.some(x=>x.alt==='lib:l3'&&x.skill==='S1')&&c[1].p.entries.every(x=>x.skill&&x.item),'يرسل الحفظ: '+JSON.stringify(c&&c[1].p).slice(0,300));
 T((await p.evaluate(()=>window.msgs)).includes('تم الحفظ.'),'رسالة نجاح');T(await p.$('#wpPub')===null,'المحرر لا يرى النشر');
 await p.evaluate(()=>{window.NEXT_ERR='P0001: توزيع غير متوازن'});await p.click('#wpSave');await p.waitForTimeout(150);T((await p.evaluate(()=>window.msgs)).some(m=>m.includes('غير متوازن')),'خطأ القاعدة يظهر');
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer']}});await open();await p.click('[data-e=X1]');T(await p.$('#wpPub')!==null&&await p.$('#wpDel')!==null,'المراجع يرى النشر والحذف');
 await p.click('#wpPub');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('ظاهرة للزوار'),'نُشرت');await p.click('#wpHide');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('غير ظاهرة'),'أُخفيت');
 await p.evaluate(()=>{window.ASK=false});await p.click('#wpDel');await p.waitForTimeout(150);T(await p.evaluate(()=>!window.calls.some(x=>x[0]==='wplan_delete')),'الحذف يحتاج تأكيدًا');
 await p.evaluate(()=>{window.ASK=true});await p.click('#wpDel');await p.waitForTimeout(250);T(await p.evaluate(()=>window.calls.some(x=>x[0]==='wplan_delete')),'حُذفت بعد التأكيد');
 await p.click('[data-go=dtasksadm]');T(await p.evaluate(()=>window.went)==='dtasksadm','اختصار');
 await p.evaluate(()=>{window.ME={roles:[]}});await open();T((await p.innerText('#m')).includes('ليست لديك صلاحية'),'بلا دور لا دخول');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
