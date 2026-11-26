// NODE_PATH=$(npm root -g) [VW=390] node tools/content/proj/test_projadm2.js  (واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على Supabase الحقيقي)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const EX=JSON.parse(fs.readFileSync('/tmp/pj2/examples.json','utf8'));const BASE=JSON.parse(fs.readFileSync('/tmp/proj_mock.json','utf8'));
const ROWS=[...BASE.filter(x=>x.slug==='pj_sci01'||x.slug==='ch_01').map((x,i)=>({...x,id:100+i,span:'short',status:'published',reviewed:true,review_note:'ok'})),...EX.map((x,i)=>({...x,id:i+1,kind:'project',type:'project',link:{},status:'draft',reviewed:false,review_note:null}))];
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.ROWS=${JSON.stringify(ROWS)};window.NEXT_ERR=null;window.confirm=()=>true;
  const q=()=>{const st={};const api={select(){st.m='s';return api},order(){return api},limit(){return api},insert(r){st.m='i';st.r=r;return api},update(r){st.m='u';st.r=r;return api},delete(){st.m='d';return api},eq(c,v){st.id=v;return api},
   then(res){if(st.m==='s')return res({data:JSON.parse(JSON.stringify(window.ROWS))});if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return res({error:{message:e}})}
    window.calls.push([st.m,JSON.parse(JSON.stringify(st.r||{})),st.id]);if(st.m==='i')window.ROWS.push({...st.r,id:900+window.ROWS.length});if(st.m==='u'){const r=window.ROWS.find(x=>x.id===st.id);Object.assign(r,st.r)}return res({data:null,error:null})}};return api};
  window.sb={from:q};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=()=>{};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),fail:e=>window.msgs.push('ERR:'+(e&&e.message)),SUB:{},
   sheet:h=>{const o=document.createElement('div');o.className='ov';o.innerHTML='<div class="sheet">'+h+'</div>';document.body.appendChild(o);return o},closeSheet:()=>$$('.ov').forEach(x=>x.remove())};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/projadm.js','utf8')});
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.projadm.fn(document.getElementById('m')));await p.waitForTimeout(150)};
 const edit=async id=>{await p.evaluate(()=>window.__zp.closeSheet());await open();await p.click('#fls [data-i="'+id+'"]');await p.waitForSelector('#fsv')};
 const miss=()=>p.textContent('#fmiss');
 const tryPub=async(fn)=>{await edit(fn.id);await fn.set();await p.selectOption('#fst','published');await p.click('#fsv');await p.waitForTimeout(100);return miss()};
 await open();
 T(await p.$$eval('#fcs [data-sp]',e=>e.length)===4,'أزرار المدة');
 await p.click('#fcs [data-sp=weekly]');T(await p.$$eval('#fls .item',e=>e.length)===3,'أسبوعية 3');
 await p.click('#fcs [data-sp=monthly]');T(await p.$$eval('#fls .item',e=>e.length)===2,'شهرية 2');
 await p.click('#fcs [data-sp=""]');
 // نموذج المشروع الأسبوعي
 await edit(1);
 T(await p.inputValue('#fsp')==='weekly','span محمّلة');
 const st=await p.inputValue('#fst2');T(st.split('\n').length===9&&st.split('\n')[0].endsWith('| اليوم الأول'),'خطوات بمراحلها');
 T((await p.inputValue('#fpa')).includes('ساعد طفلك')&&(await p.inputValue('#frf')).includes('أجمل صفحة')&&(await p.inputValue('#fres')).split('\n').length===3,'دور ولي الأمر والتأمل والروابط');
 await p.click('#fpv');await p.waitForSelector('#pvx');const pv=await p.innerText('.ov:last-child');
 T(pv.includes('أسبوعي')&&pv.includes('[اليوم الأول]')&&pv.includes('دور ولي الأمر')&&pv.includes('موارد المكتبة')&&pv.includes('سؤال التأمل'),'المعاينة');
 T(pv.includes('تأكيد المراجعة')&&pv.includes('ملاحظة المراجعة'),'ناقص المراجعة');T(!/مرحلة الخطوة|سؤال التأمل\s*،|دور ولي الأمر\s*،/.test(pv.split('ناقص:')[1]||''),'لا نواقص أخرى: '+(pv.split('ناقص:')[1]||''));
 await p.click('#pvx');
 // نشر بلا مراجعة
 await p.selectOption('#fst','published');await p.click('#fsv');await p.waitForTimeout(100);T((await miss()).includes('لا يمكن النشر قبل اكتمال'),'منع النشر بلا مراجعة');
 // نشر صحيح
 await p.fill('#frv','راجعها المختص التربوي');await p.check('#frc');await p.click('#fsv');await p.waitForTimeout(150);
 const u=await p.evaluate(()=>window.calls.filter(x=>x[0]==='u').pop());
 T(u&&u[1].span==='weekly'&&u[1].status==='published'&&u[1].data.res.length===3&&u[1].data.res[0].href==='stories/'&&u[1].data.steps[0].g==='اليوم الأول'&&u[1].data.parent.length>10&&u[1].data.reflect.length>10,'الحفظ يحمل المدة والمراحل والروابط');
 T((await p.evaluate(()=>window.msgs)).includes('تم الحفظ'),'رسالة نجاح');
 // سلبيات
 T((await tryPub({id:2,set:()=>p.fill('#fpa','')})).includes('دور ولي الأمر'),'دور ولي الأمر مطلوب');
 T((await tryPub({id:2,set:()=>p.fill('#frf','')})).includes('سؤال التأمل'),'سؤال التأمل مطلوب');
 T((await tryPub({id:2,set:async()=>{await p.click('#flv [data-l=a3]')}})).includes('المدة لا تناسب العمر'),'أسبوعي لا يناسب ٣ سنوات');
 // شهري بعمر ٤ سنوات
 T((await tryPub({id:3,set:async()=>{await p.click('#flv [data-l=a4]')}})).includes('المدة لا تناسب العمر'),'شهري لا يناسب ٤ سنوات');
 // مرحلة واحدة فقط
 T((await tryPub({id:1,set:async()=>{const v=(await p.inputValue('#fst2')).split('\n').map(l=>l.replace(/\| [^|]+$/,'| اليوم الأول')).join('\n');await p.fill('#fst2',v)}})).includes('الأسبوعي من يومين'),'عدد الأيام');
 // أداة خطرة وخرز
 T((await tryPub({id:2,set:()=>p.fill('#ftl','سكين\nورق')})).includes('الأدوات'),'أداة حادة مرفوضة');
 T((await tryPub({id:2,set:()=>p.fill('#fres','رابط خارجي | https://evil.com/x')})).includes('روابط المكتبة'),'رابط خارجي مرفوض');
 T((await tryPub({id:2,set:()=>p.fill('#fst2','نصنع شيئا | i_book | | اليوم الأول')})).includes('الخطوات من'),'عدد الخطوات');
 // صغير قصير مع خرز
 await edit(100);await p.click('#flv [data-l=a3]');await p.fill('#ftl','خرز ملون\nورق كبير');await p.selectOption('#fst','published');await p.click('#fsv');await p.waitForTimeout(100);T((await miss()).includes('الاختناق'),'اختناق للصغار: '+await miss());
 // مشروع قديم قصير بلا مدة يبقى صالحا
 await edit(100);await p.selectOption('#fst','published');await p.click('#fsv');await p.waitForTimeout(150);T(!(await p.$('#fmiss'))&&(await p.evaluate(()=>window.calls.filter(x=>x[0]==='u').pop()))[1].slug==='pj_sci01','مشروع قصير قديم يُحفظ');
 // جديد
 await p.evaluate(()=>window.__zp.closeSheet());await open();await p.click('#fnp');await p.waitForSelector('#fsp');T(await p.inputValue('#fsp')==='short','افتراضي قصير');
 await p.evaluate(()=>window.__zp.closeSheet());await p.click('#fnc');await p.waitForSelector('#fdt');T(!(await p.$('#fsp')),'التحدي بلا مدة');
 // خطأ قاعدة البيانات يظهر
 await p.evaluate(()=>window.__zp.closeSheet());await edit(1);await p.evaluate(()=>{window.NEXT_ERR='SPAN: المشروع الأسبوعي من ٥ إلى ١٤ خطوة.'});await p.click('#fsv');await p.waitForTimeout(100);T((await p.evaluate(()=>window.msgs)).some(m=>m.includes('SPAN')),'خطأ القاعدة يظهر');
 T(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'لا تجاوز أفقي');
 await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL PASS');process.exit(errs.length?1:0)})();
