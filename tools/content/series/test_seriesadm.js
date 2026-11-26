// NODE_PATH=$(npm root -g) [VW=390] node tools/content/series/test_seriesadm.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,768,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.ME={roles:['content_editor']};window.went=null;window.NEXT_ERR=null;
  const DB={paths:[{id:'P1',slug:'p-1',name:'سلسلة الحروف',status:'active',levels:['a4']},{id:'P2',slug:'p-2',name:'سلسلة العد',status:'draft',levels:['a5']}],
   path_items:[{id:'I1',path_id:'P1',item_key:'bank:b1',stage:'practice',ord:1,required:true},{id:'I2',path_id:'P1',item_key:'vid:v1',stage:'understand',ord:1,required:true},{id:'I3',path_id:'P2',item_key:'bank:b2',stage:'practice',ord:1,required:true}],
   quality_items:[{key:'bank:b1',title:'نصل الحرف',gone:false},{key:'vid:v1',title:'فيديو الحروف',gone:false},{key:'bank:b2',title:'عد النجوم',gone:false}]};
  const NOTES={I2:{i:'شاهدوا الفيديو معًا',h:null,v:null}};
  const q=(tb)=>{const st={f:[],ord:[]};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(){return api},range(a,b2){st.rg=[a,b2];return api},then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r))})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(n==='series_notes_admin'){const o={};DB.path_items.filter(x=>x.path_id===a.p_path).forEach(x=>{if(NOTES[x.id])o[x.id]=NOTES[x.id]});return{data:o}}
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='series_note_save'){NOTES[a.p_item]={i:a.p_instr||null,h:a.p_hint||null,v:a.p_verify||null};return{data:null}}
   return{data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:()=>Promise.resolve(true)};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/seriesadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.seriesadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 await open();let t=await p.innerText('#m');T(t.includes('سلسلة الحروف')&&t.includes('سلسلة العد'),'قائمة السلاسل');T(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تجاوز عرض');
 await p.click('[data-o=P1]');await p.waitForTimeout(150);t=await p.innerText('#m');
 const order=await p.$$eval('.sa-row[data-x] b',e=>e.map(x=>x.textContent));T(order[0].includes('فيديو')&&order[1].includes('نصل'),'الترتيب حسب المرحلة: '+order);
 T(await p.inputValue('.sa-row[data-x="I2"] [data-f=i]')==='شاهدوا الفيديو معًا','تُحمَّل الملاحظة المحفوظة');
 T(t.includes('فيه تعليمات'),'المعاينة تذكر ما كُتب');
 await p.fill('.sa-row[data-x="I1"] [data-f=h]','تذكّر الصوت');await p.fill('.sa-row[data-x="I1"] [data-f=v]','الإجابة: ب');await p.click('.sa-row[data-x="I1"] [data-a=save]');await p.waitForTimeout(200);
 const call=await p.evaluate(()=>window.calls.filter(c=>c[0]==='series_note_save').pop());T(call&&call[1].p_item==='I1'&&call[1].p_hint==='تذكّر الصوت'&&call[1].p_verify==='الإجابة: ب','يُرسل الحفظ للقاعدة');
 T(await p.inputValue('.sa-row[data-x="I1"] [data-f=h]')==='تذكّر الصوت','تبقى القيمة بعد الحفظ');T((await p.evaluate(()=>window.msgs)).includes('تم الحفظ.'),'رسالة نجاح');
 await p.evaluate(()=>{window.NEXT_ERR='تجنّب عبارات تصف الطفل بالضعف'});await p.fill('.sa-row[data-x="I1"] [data-f=i]','أنت ضعيف');await p.click('.sa-row[data-x="I1"] [data-a=save]');await p.waitForTimeout(150);
 T((await p.evaluate(()=>window.msgs)).some(m=>m.includes('تجنّب')),'خطأ القاعدة يظهر للمحرر');
 await p.click('#saPaths');T(await p.evaluate(()=>window.went)==='pathsadm','اختصار مركز المسارات');
 await p.click('#saBack');T((await p.innerText('#m')).includes('سلسلة العد'),'العودة للقائمة');
 await p.click('[data-o=P2]');T((await p.innerText('#m')).includes('غير ظاهرة للزوار'),'سلسلة المسودة غير ظاهرة');
 await p.evaluate(()=>{window.ME={roles:['content_editor']}});
 await p.evaluate(()=>{window.ME={roles:[]}});await open();T((await p.innerText('#m')).includes('ليست لديك صلاحية'),'بلا دور: لا دخول');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
