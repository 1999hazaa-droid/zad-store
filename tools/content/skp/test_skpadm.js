// NODE_PATH=$(npm root -g) [VW=390] node tools/content/skp/test_skpadm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const DOM=[{slug:'math',name:'مهارات الرياضيات'},{slug:'arabic',name:'مهارات اللغة العربية'}];
const SKS=[{id:'s1',slug:'m-count',domain:'math',name:'العد',descr:'',levels:['a4','a5','a6','g1'],sstatus:'active',info:{goal:'يعد الطفل الأشياء ويعرف عددها.',goal_kid:'أعد الأشياء.',examples:['يعد الأشكال'],min_proj:2,status:'draft'},res:5},
 {id:'s2',slug:'ar-letters',domain:'arabic',name:'التعرف على الحروف',descr:'',levels:['a3','a4','a5'],sstatus:'active',info:null,res:3},
 {id:'s9',slug:'hi',domain:'math',name:'خارج النطاق',descr:'',levels:['g4','g5'],sstatus:'active',info:null,res:0}];
const PJS=[{slug:'pj_a',title:'لوحة الأرقام',levels:['g1','g2'],status:'published',cat:'math'},{slug:'pj_b',title:'مشروع صغار',levels:['a2','a3'],status:'published',cat:'x'}];
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,1100])){
 for(const role of ['edu_reviewer','content_editor']){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ROLE=${JSON.stringify(role)};
  window.D={domains:${JSON.stringify(DOM)},skills:${JSON.stringify(SKS)},plinks:[],projects:${JSON.stringify(PJS)}};
  window.sb={rpc:async(fn,a)=>{window.calls.push([fn,JSON.parse(JSON.stringify(a||{}))]);
   if(fn==='quality_my')return {data:{roles:[window.ROLE]}};
   if(fn==='skp_admin')return {data:JSON.parse(JSON.stringify(window.D))};
   if(window.NEXT_ERR){const m=window.NEXT_ERR;window.NEXT_ERR=null;return {error:{message:'P0001: '+m}}}
   if(fn==='skill_save'){const p=a.p;let id=p.id;if(!id){id='s'+(window.D.skills.length+1);window.D.skills.push({id,slug:'x-'+id,domain:p.domain,name:p.name,descr:p.descr,levels:p.levels,sstatus:p.status,info:null,res:0})}else Object.assign(window.D.skills.find(s=>s.id===id),{name:p.name,domain:p.domain,descr:p.descr,levels:p.levels});return {data:{id}}}
   if(fn==='skp_info_save'){const p=a.p,s=window.D.skills.find(x=>x.id===p.skill);const st=s.info?s.info.status:'draft';s.info={goal:p.goal,goal_kid:p.goal_kid,examples:p.examples,min_proj:p.min_proj,status:window.ROLE==='content_editor'&&st==='active'?'draft':st};return {data:p.skill}}
   if(fn==='skp_info_status'){window.D.skills.find(s=>s.id===a.p_skill).info.status=a.p_status;return {data:null}}
   if(fn==='skp_link_save'){const p=a.p;let id=p.id;if(!id){id='l'+(window.D.plinks.length+1);window.D.plinks.push({id,project:p.project,skill:p.skill,role:p.role,goal:p.goal,ord:0,status:'draft'})}else Object.assign(window.D.plinks.find(l=>l.id===id),{role:p.role,goal:p.goal});return {data:id}}
   if(fn==='skp_link_status'){window.D.plinks.find(l=>l.id===a.p_id).status=a.p_status;return {data:null}}
   if(fn==='skp_link_delete'){window.D.plinks=window.D.plinks.filter(l=>l.id!==a.p_id);return {data:null}}
   return {data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=()=>{};
  window.__zp={sb:window.sb,$,$$,esc,toast:(m,k)=>window.msgs.push((k==='err'?'ERR:':'')+m),SUB:{},ask:async()=>true};
 `});
 await p.addScriptTag({path:'manage/skpadm.js'});
 const rev=role==='edu_reviewer',tag=role+'@'+VW;
 const T=()=>p.textContent('#m'),msg=()=>p.evaluate(()=>window.msgs.slice(-1)[0]||''),calls=()=>p.evaluate(()=>window.calls);
 await p.evaluate(()=>window.__zp.SUB.skpadm.fn(document.getElementById('m')));await p.waitForSelector('.sp-row');
 let ok=(c,m)=>{if(!c)E(tag+' '+m)};
 ok(await p.locator('.sp-row').count()===2,'list hides out-of-scope skill '+await p.locator('.sp-row').count());
 ok((await T()).includes('بلا صفحة')&&(await T()).includes('مسودة'),'status badges');
 ok(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'no overflow list');
 // مهارة جديدة
 await p.click('#spNew');await p.fill('#fName','مقارنة الأحجام');await p.selectOption('#fDom','math');
 await p.click('input[data-l=a5]');await p.click('input[data-l=g1]');
 await p.fill('#fDescr','يقارن الطفل بين الأحجام');await p.fill('#fGoal','يقارن الطفل بين شيئين بحسب الحجم');await p.fill('#fKid','أقارن بين الأحجام');await p.fill('#fEx','يرتب الكرات\nيحدد الأكبر');await p.selectOption('#fMin','3');
 await p.click('#spPv');ok((await p.textContent('#spPvBox')).includes('يرتب الكرات')&&(await p.textContent('#spPvBox')).includes('عتبة «يواصل التعلم»: ٣'),'preview shows fields + threshold');
 await p.click('#spSave');await p.waitForTimeout(150);
 let c=await calls();const ss=c.find(x=>x[0]==='skill_save'),si=c.find(x=>x[0]==='skp_info_save');
 ok(ss&&ss[1].p.status==='hidden'&&ss[1].p.levels.join()==='a5,g1','new skill created hidden in scope');
 ok(si&&si[1].p.examples.length===2&&si[1].p.min_proj===3&&si[1].p.skill==='s4','info saved with examples+criteria '+JSON.stringify(si));
 ok((await msg())==='تم الحفظ كمسودة.','saved msg');
 ok(rev?await p.locator('#spPub').count()===1:await p.locator('#spPub').count()===0,'publish button only for reviewer');
 // خطأ من القاعدة (عبارة إتقان) يُعرض ولا يُحفظ
 await p.fill('#fGoal','يتقن الطفل العد');await p.evaluate(()=>{window.NEXT_ERR='تجنّب عبارات الإتقان والدرجات والمنافسة؛ هذا المركز يعرض الممارسة لا الإتقان.'});
 await p.click('#spSave');await p.waitForTimeout(120);ok((await msg()).startsWith('ERR:')&&(await msg()).includes('الإتقان'),'db error shown');
 await p.fill('#fGoal','يقارن الطفل بين شيئين بحسب الحجم');await p.click('#spSave');await p.waitForTimeout(120);
 if(rev){await p.click('#spPub');await p.waitForTimeout(120);ok((await calls()).some(x=>x[0]==='skp_info_status'&&x[1].p_status==='active'),'publish rpc');ok((await T()).includes('ظاهرة للزوار'),'active note');await p.click('#spHide');await p.waitForTimeout(100);ok((await T()).includes('غير ظاهرة'),'hidden');}
 // نطاق: لا مستويات
 await p.click('#spBack');await p.click('#spNew');await p.fill('#fName','مهارة بلا عمر');await p.fill('#fGoal','هدف تعليمي طويل');await p.fill('#fKid','هدف الطفل');await p.click('#spSave');await p.waitForTimeout(80);ok((await msg()).startsWith('ERR:'),'requires levels');
 await p.click('#spBack');
 // ربط المشاريع
 await p.click('[data-tab=links]');await p.selectOption('#lPj','pj_a');await p.click('#lNew');
 const opts=await p.locator('#lSk option').allTextContents();ok(opts.some(o=>o.includes('العد'))&&!opts.some(o=>o.includes('التعرف على الحروف'))&&!opts.some(o=>o.includes('خارج النطاق')),'only skills overlapping project levels '+opts);
 await p.selectOption('#lSk','s1');await p.selectOption('#lRole','main');await p.fill('#lGoal','يعد الأشياء في اللوحة');await p.click('#lSave');await p.waitForTimeout(120);
 c=await calls();const ls=c.find(x=>x[0]==='skp_link_save');ok(ls&&ls[1].p.project==='pj_a'&&ls[1].p.skill==='s1'&&ls[1].p.role==='main','link saved with project/skill/role');
 ok((await T()).includes('أساسية')&&(await T()).includes('مسودة'),'link row shows role+draft');
 await p.click('.lEdit');await p.selectOption('#lRole','support');await p.click('#lSave');await p.waitForTimeout(100);ok((await T()).includes('مساندة'),'edit role to support');
 ok(rev?await p.locator('.lPub').count()===1:await p.locator('.lPub').count()===0,'link publish only reviewer');
 if(rev){await p.click('.lPub');await p.waitForTimeout(100);ok((await calls()).some(x=>x[0]==='skp_link_status'&&x[1].p_status==='active'),'link publish');await p.click('.lDel');await p.waitForTimeout(100);ok((await calls()).some(x=>x[0]==='skp_link_delete'),'link delete');ok(!(await T()).includes('يعد الأشياء في اللوحة'),'deleted row gone');}
 await p.evaluate(()=>{window.NEXT_ERR='أعمار المهارة لا تتقاطع مع أعمار المشروع.'});await p.click('#lNew');await p.selectOption('#lSk','s1');await p.fill('#lGoal','هدف ما');await p.click('#lSave');await p.waitForTimeout(100);ok((await msg()).startsWith('ERR:'),'link error shown');
 ok(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'no overflow links');
 await ctx.close();}}
await b.close();console.log(errs.length?'FAIL '+errs.length:'PASS test_skpadm');process.exit(errs.length?1:0)})();
