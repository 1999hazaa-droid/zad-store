// NODE_PATH=$(npm root -g) [VW=390] node tools/content/eval/test_evaladm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const PROJ=[{slug:'pj_a',title:'مشروع الأشكال',levels:['a5','a6','g1','g2'],status:'published',stages:['اليوم الأول','اليوم الثاني']},{slug:'pj_b',title:'مشروع صغار',levels:['a2','a3'],status:'published',stages:[]}];
const CRIT=[{id:'c1',std:'understand',young:'شارك واستكشف',pre:'فهمت',kid:'فهمت فكرة المشروع',skill:null,status:'active',used:0},{id:'c2',std:'steps',young:'جرّب الخطوات',pre:'اتبعت الخطوات',kid:'اتبعت الخطوات الأساسية',skill:null,status:'draft',used:0}];
const SK=[{id:'s1',slug:'sk1',name:'ملاحظة النمو',levels:['a5'],status:'active',sort:1}];
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,1100])){
 for(const role of ['edu_reviewer','content_editor']){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ROLE=${JSON.stringify(role)};
  window.D={criteria:${JSON.stringify(CRIT)},evals:[],projects:${JSON.stringify(PROJ)}};
  const from=()=>{const api={select(){return api},eq(){return api},order(){return api},then(res){return res({data:${JSON.stringify(SK)}})}};return api};
  window.sb={from,rpc:async(fn,a)=>{window.calls.push([fn,JSON.parse(JSON.stringify(a||{}))]);
   if(fn==='quality_my')return {data:{roles:[window.ROLE]}};
   if(fn==='eval_admin')return {data:JSON.parse(JSON.stringify(window.D))};
   if(window.NEXT_ERR){const m=window.NEXT_ERR;window.NEXT_ERR=null;return {error:{message:'P0001: '+m}}}
   if(fn==='evalc_save'){const p=a.p;let id=p.id;if(!id){id='c'+(window.D.criteria.length+1);window.D.criteria.push({id,std:p.std,young:p.young,pre:p.pre,kid:p.kid,skill:p.skill,status:'draft',used:0})}else Object.assign(window.D.criteria.find(c=>c.id===id),{young:p.young,pre:p.pre,kid:p.kid,skill:p.skill});return {data:id}}
   if(fn==='evalc_status'){window.D.criteria.find(c=>c.id===a.p_id).status=a.p_status;return {data:null}}
   if(fn==='eval_save'){const p=a.p;let id=p.id;const row={id:id||'e'+(window.D.evals.length+1),project:p.project,name:p.name,levels:p.levels,criteria:p.criteria,closing:p.closing,msgs:p.msgs,status:'draft'};if(!id)window.D.evals.push(row);else Object.assign(window.D.evals.find(e=>e.id===id),row);return {data:row.id}}
   if(fn==='eval_status'){window.D.evals.find(e=>e.id===a.p_id).status=a.p_status;return {data:null}}
   if(fn==='eval_delete'){window.D.evals=window.D.evals.filter(e=>e.id!==a.p_id);return {data:null}}
   if(fn==='evalc_delete'){window.D.criteria=window.D.criteria.filter(c=>c.id!==a.p_id);return {data:null}}
   return {data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=()=>{};
  window.__zp={sb:window.sb,$,$$,esc,toast:(m,k)=>window.msgs.push((k==='err'?'ERR:':'')+m),SUB:{},ask:async()=>true};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/evaladm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' '+role+' FAIL '+m)};
 await p.evaluate(()=>window.__zp.SUB.evaladm.fn(document.getElementById('m')));await p.waitForTimeout(150);
 const calls=()=>p.evaluate(()=>window.calls);const msgs=()=>p.evaluate(()=>window.msgs);
 T(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'overflow list');
 // المعايير
 await p.click('[data-tab=crit]');T(await p.locator('[data-ec]').count()===2,'two criteria listed');
 await p.click('#evNewC');await p.fill('#cYoung','يحاول مع أهله');await p.fill('#cPre','حاولت');await p.fill('#cKid','حاولت تنفيذ الخطوة بنفسي');await p.selectOption('#cStd','tools');await p.selectOption('#cSkill','s1');await p.click('#cSave');await p.waitForTimeout(120);
 let c=(await calls()).filter(x=>x[0]==='evalc_save').pop();T(c&&c[1].p.std==='tools'&&c[1].p.skill==='s1'&&c[1].p.kid==='حاولت تنفيذ الخطوة بنفسي','criterion payload '+JSON.stringify(c));
 T((await msgs()).includes('تم الحفظ.'),'saved toast');
 T(!!(await p.locator('#cPub').count())===(role==='edu_reviewer'),'publish visible only to reviewer');
 await p.click('#evCBack');
 if(role==='edu_reviewer'){await p.click('[data-ec=c2]');await p.click('#cPub');await p.waitForTimeout(100);T((await calls()).some(x=>x[0]==='evalc_status'&&x[1].p_id==='c2'&&x[1].p_status==='active'),'publish criterion');await p.click('#evCBack');}
 // الأخطاء من الخادم تظهر
 await p.click('[data-tab=crit]');await p.click('[data-ec=c1]');await p.evaluate(()=>{window.NEXT_ERR='تجنّب الدرجات والمنافسة'});await p.click('#cSave');await p.waitForTimeout(100);T((await msgs()).some(m=>m.startsWith('ERR:')&&m.includes('تجنّب الدرجات')),'server error surfaced');await p.click('#evCBack');
 // تقييم
 await p.click('[data-tab=evals]');await p.click('#evNew');
 await p.selectOption('#eProj','pj_a');await p.waitForTimeout(60);
 T(await p.locator('[data-l]').count()===4,'levels limited to project '+await p.locator('[data-l]').count());
 await p.fill('#eName','مراجعة الأشكال');await p.check('[data-l=a5]');await p.check('[data-l=g2]');
 await p.locator('[data-cid=c1] .cSel').check();await p.waitForTimeout(60);
 await p.selectOption('[data-cid=c1] .cStage','اليوم الأول');await p.selectOption('[data-cid=c1] .cSk','s1');
 await p.locator('[data-cid=c2] .cSel').check();await p.waitForTimeout(60);
 T(await p.locator('.cl').count()===2,'closing fields only for chosen bands '+await p.locator('.cl').count());
 await p.fill('.cl[data-b=early]','ما أجمل شيء تعلمته؟');await p.fill('#mDone','أحسنت! لقد تعلمت شيئًا جديدًا\nعمل رائع');await p.fill('#mRetry','كل محاولة تساعدك على التعلم');
 await p.click('#evPv');const pv=await p.textContent('#evPvBox');
 T(pv.includes('الصف الثاني')&&pv.includes('فهمت فكرة المشروع')&&pv.includes('أنجزت')&&pv.includes('أحتاج إلى مساعدة')&&pv.includes('سأحاول مرة أخرى'),'preview shows criteria and 3 states');
 T(pv.includes('فهمت')&&pv.includes('4 سنوات')===false&&pv.includes('5 سنوات'),'preview per level');
 T(pv.includes('ما أجمل شيء تعلمته؟')&&pv.includes('احكِ بكلماتك ما فعلته'),'preview questions');
 T(!/درجة|ترتيب|\d+\s*\/\s*\d+/.test(pv),'preview has no scores');
 await p.click('#evSave');await p.waitForTimeout(120);
 const s=(await calls()).filter(x=>x[0]==='eval_save').pop()[1].p;
 T(s.project==='pj_a'&&JSON.stringify(s.levels)==='["a5","g2"]','levels payload '+JSON.stringify(s.levels));
 T(s.criteria.length===2&&s.criteria[0].stage==='اليوم الأول'&&s.criteria[0].skill==='s1','criteria stage/skill payload '+JSON.stringify(s.criteria));
 T(JSON.stringify(s.msgs.done)==='["أحسنت! لقد تعلمت شيئًا جديدًا","عمل رائع"]'&&s.msgs.help.length===0,'msgs split by line '+JSON.stringify(s.msgs));
 T(s.closing.early==='ما أجمل شيء تعلمته؟'&&!('pre' in s.closing),'closing payload '+JSON.stringify(s.closing));
 T(await p.locator('#evPub').count()===(role==='edu_reviewer'?1:0),'eval publish role gate');
 if(role==='edu_reviewer'){await p.click('#evPub');await p.waitForTimeout(100);T((await calls()).some(x=>x[0]==='eval_status'&&x[1].p_status==='active'),'publish eval');T(await p.locator('a[href*="eval/#/p/pj_a"]').count()===1,'live link after publish');await p.click('#evHide');await p.waitForTimeout(100);T((await calls()).some(x=>x[0]==='eval_status'&&x[1].p_status==='hidden'),'hide eval');await p.click('#evDel');await p.waitForTimeout(100);T((await p.evaluate(()=>window.D.evals.length))===0,'delete eval');}
 T(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'overflow form');
 await ctx.close();}}
await b.close();console.log(errs.length?'FAIL '+errs.length:'PASS evaladm');process.exit(errs.length?1:0)})();
