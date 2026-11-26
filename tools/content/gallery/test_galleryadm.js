// NODE_PATH=$(npm root -g) [VW=390] node tools/content/gallery/test_galleryadm.js
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CFG={domains:[{slug:'science',title:'العلوم',on:true},{slug:'art',title:'الفنون',on:true}],types:[{slug:'project',title:'مشروع',on:true}],msgs:['أحسنت! أضفت إنجازًا'],allow_print:true,allow_photos:true};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,1100])){for(const role of ['edu_reviewer','viewer']){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ROLE=${JSON.stringify(role)};window.C=${JSON.stringify(CFG)};
  window.sb={rpc:async(fn,a)=>{window.calls.push([fn,JSON.parse(JSON.stringify(a||{}))]);
   if(fn==='quality_my')return {data:{roles:window.ROLE==='viewer'?[]:[window.ROLE]}};
   if(fn==='gallery_cfg_admin')return {data:JSON.parse(JSON.stringify(window.C))};
   if(window.NEXT_ERR){const m=window.NEXT_ERR;window.NEXT_ERR=null;return {error:{message:'P0001: '+m}}}
   if(fn==='gallery_cfg_save'){window.C=JSON.parse(JSON.stringify(a.p));return {data:null}}return {data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=()=>{};window.__zp={sb:window.sb,$,$$,esc,toast:(m,k)=>window.msgs.push((k==='err'?'ERR:':'')+m),SUB:{}};`});
 await p.addScriptTag({content:fs.readFileSync('manage/galleryadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' '+role+' FAIL '+m)};
 await p.evaluate(()=>window.__zp.SUB.galleryadm.fn(document.getElementById('m')));await p.waitForTimeout(150);
 if(role==='viewer'){T((await p.textContent('#m')).includes('ليست لديك صلاحية'),'no access for roleless user');await ctx.close();continue;}
 T((await p.textContent('#m')).includes('معطّل دائمًا'),'public gallery disabled notice');
 T(!(await p.locator('input[id*=public],[id*=Public]').count()),'no public toggle exists');
 T(!(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1)),'overflow');
 await p.locator('[data-k=domains][data-i="1"] .gOn').uncheck();await p.fill('#n_types_s','building');await p.fill('#n_types_t','بناء وتركيب');await p.click('[data-add=types]');
 await p.uncheck('#gPrint');await p.fill('#gMsgs','أحسنت! إنجاز جديد\nمشروع جميل');await p.click('#gSave');await p.waitForTimeout(150);
 const c=(await p.evaluate(()=>window.calls)).filter(x=>x[0]==='gallery_cfg_save').pop()[1].p;
 T(c.domains[1].on===false&&c.types.length===2&&c.types[1].slug==='building','domain toggle + type add payload '+JSON.stringify(c.types));
 T(c.allow_print===false&&c.allow_photos===true&&c.msgs.length===2,'flags and msgs payload');
 T(!('public' in c)&&!('allow_public' in c),'payload has no public-sharing option');
 T((await p.evaluate(()=>window.msgs)).includes('تم الحفظ.'),'saved toast');
 await p.evaluate(()=>{window.NEXT_ERR='الرسائل مشجعة بلا مقارنة ولا ترتيب.'});await p.click('#gSave');await p.waitForTimeout(100);
 T((await p.evaluate(()=>window.msgs)).some(m=>m.startsWith('ERR:')&&m.includes('مقارنة')),'server error surfaced');
 await p.locator('[data-k=types][data-i="1"] .gRm').click();T(await p.locator('[data-k=types]').count()===1,'remove type');
 await ctx.close();}}
await b.close();console.log(errs.length?'FAIL '+errs.length:'PASS galleryadm');process.exit(errs.length?1:0)})();
