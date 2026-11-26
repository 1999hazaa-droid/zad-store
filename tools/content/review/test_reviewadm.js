// NODE_PATH=$(npm root -g) [VW=390] node tools/content/review/test_reviewadm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,768,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.ME={roles:['content_editor']};window.went=null;window.ASK=true;window.NEXT_ERR=null;
  const DB={skill_domains:[{slug:'arabic',name:'مهارات اللغة العربية',sort:1},{slug:'math',name:'مهارات الرياضيات',sort:2}],
   skills:[{id:'S1',slug:'a',domain:'arabic',name:'ربط الحرف بصوته',status:'active',sort:1,updated_at:'2026-11-01'},{id:'S2',slug:'b',domain:'arabic',name:'أشكال الحروف',status:'active',sort:2,updated_at:'2026-11-01'},{id:'S3',slug:'c',domain:'math',name:'الجمع',status:'active',sort:1,updated_at:'2026-11-20'}]};
  let REV={rows:[{skill:'S3',intro:'سبق الجمع',example:null,summary:null,status:'draft',upd:'2026-11-10',sup:'2026-11-20',ready:5,pre:['S1']}],ready:{S1:5,S2:1,S3:5}};
  const q=(tb)=>{const st={f:[]};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(){return api},then(res){res({data:JSON.parse(JSON.stringify((DB[tb]||[]).filter(x=>st.f.every(f=>f(x)))))})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};if(n==='review_admin')return{data:JSON.parse(JSON.stringify(REV))};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='review_save'){let r=REV.rows.find(x=>x.skill===a.p_skill);if(!r){r={skill:a.p_skill,status:'draft',upd:'2026-11-26',sup:'2026-11-01'};REV.rows.push(r)}Object.assign(r,{intro:a.p_intro,example:a.p_example,summary:a.p_summary,pre:a.p_prereqs,upd:'2026-11-26'})}
   if(n==='review_status'){REV.rows.find(x=>x.skill===a.p_skill).status=a.p_status}
   if(n==='review_delete'){REV.rows=REV.rows.filter(x=>x.skill!==a.p_skill)}
   return{data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:()=>Promise.resolve(window.ASK)};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/reviewadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.reviewadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 await open();let t=await p.innerText('#m');
 T(t.includes('ربط الحرف بصوته')&&t.includes('الجمع'),'قائمة المهارات');T(t.includes('عُدّلت المهارة بعد آخر تحديث'),'تنبيه تعديل المهارة بعد المراجعة');T(t.includes('إنشاء مراجعة')&&t.includes('تحرير المراجعة'),'إنشاء/تحرير');
 T(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تجاوز عرض');
 await p.click('[data-o=S1]');T((await p.innerText('#m')).includes('يلزم ثلاثة على الأقل')===false,'S1 جاهزة');
 await p.fill('#raIntro','تعلمنا الحروف');await p.check('[data-p=S2]');await p.click('#raSave');await p.waitForTimeout(200);
 const c=await p.evaluate(()=>window.calls.filter(x=>x[0]==='review_save').pop());T(c&&c[1].p_skill==='S1'&&c[1].p_intro==='تعلمنا الحروف'&&c[1].p_prereqs.join()==='S2','يرسل الحفظ مع المهارات السابقة');
 T(await p.$('#raPub')===null,'المحرر لا يرى زر النشر');
 await p.evaluate(()=>{window.NEXT_ERR='هذا الربط يصنع دائرة بين المهارات.'});await p.click('#raSave');await p.waitForTimeout(150);T((await p.evaluate(()=>window.msgs)).some(m=>m.includes('دائرة')),'خطأ القاعدة يظهر');
 await p.click('#raBack');await p.click('[data-o=S2]');T((await p.innerText('#m')).includes('يلزم ثلاثة على الأقل'),'تنبيه قلة الأنشطة');
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer']}});await open();await p.click('[data-o=S1]');
 T(await p.$('#raPub')!==null&&await p.$('#raDel')!==null,'المراجع يرى النشر والحذف');
 await p.click('#raPub');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('منشورة')&&await p.$('#raHide')!==null,'نُشرت');
 await p.click('#raHide');await p.waitForTimeout(200);T((await p.innerText('#m')).includes('مخفية'),'أُخفيت');
 await p.evaluate(()=>{window.ASK=false});await p.click('#raDel');await p.waitForTimeout(150);T(await p.evaluate(()=>!window.calls.some(x=>x[0]==='review_delete')),'الحذف يحتاج تأكيدًا');
 await p.evaluate(()=>{window.ASK=true});await p.click('#raDel');await p.waitForTimeout(250);T(await p.evaluate(()=>window.calls.some(x=>x[0]==='review_delete')),'حُذفت بعد التأكيد');
 await p.click('[data-go=skillsadm]');T(await p.evaluate(()=>window.went)==='skillsadm','اختصار ربط الأنشطة');
 await p.evaluate(()=>{window.ME={roles:[]}});await open();T((await p.innerText('#m')).includes('ليست لديك صلاحية'),'بلا دور لا دخول');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
