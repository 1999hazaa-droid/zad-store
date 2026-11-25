// NODE_PATH=$(npm root -g) VW=390 node tools/content/skills/test_skillsadm.js   (واجهة إدارة المهارات: واجهة حقيقية + قاعدة وهمية)
// قواعد القاعدة نفسها (منع التكرار، تقاطع العمر، الحد الأقصى، الصلاحيات، تعليم المراجعة، الحذف) اختُبرت على قاعدة البيانات الحقيقية؛ هنا نختبر الواجهة واستدعاءاتها.
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+(process.env.VW||1100),height:900}});const p=await ctx.newPage();const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ME={roles:['library_manager'],name:'المدير'};window.ASKS=[];window.ASK_YES=true;window.went=null;
  const sk=(id,dom,name,lv,o={})=>Object.assign({id,slug:id,domain:dom,name,descr:'وصف '+name,levels:lv,has_path:false,parent_id:null,sort:0,status:'active'},o);
  const DB={skill_domains:[{slug:'arabic',name:'مهارات اللغة العربية',icon:'book.svg',color:'#e6dcff',sort:1},{slug:'math',name:'مهارات الرياضيات',icon:'numbers.svg',color:'#dff3ff',sort:2}],
   skills:[sk('S1','arabic','التعرف على الحروف',['a4','a5'],{sort:1,has_path:true}),sk('S2','arabic','ربط الحرف بصوته',['a4','a5','a6'],{sort:2}),sk('S3','math','العد',['a5','a6'],{sort:1}),sk('S4','math','الجمع والطرح',['g1','g2'],{sort:2,status:'hidden'})],
   skill_links:[{id:'L1',skill_id:'S1',item_key:'bank:b1',role:'main',stage:'practice',ord:1,origin:'rule',reviewed:false},{id:'L2',skill_id:'S1',item_key:'vid:v1',role:'sub',stage:'recognize',ord:1,origin:'manual',reviewed:true},{id:'L3',skill_id:'S3',item_key:'acts:a1',role:'main',stage:'practice',ord:1,origin:'rule',reviewed:false}],
   quality_items:[{key:'bank:b1',src:'bank',title:'نصل الحرف بصورته',levels:['a4','a5','a6'],status:'published',gone:false},{key:'vid:v1',src:'vid',title:'فيديو الحروف',levels:['a4'],status:'published',gone:false},{key:'acts:a1',src:'acts',title:'نعد الألعاب',levels:['a5'],status:'published',gone:false},{key:'bank:b2',src:'bank',title:'حروف ملونة',levels:['a5'],status:'published',gone:false},{key:'bank:b3',src:'bank',title:'حروف الصف الثالث',levels:['g3'],status:'published',gone:false},{key:'bank:b4',src:'bank',title:'حروف مسودة',levels:['a5'],status:'draft',gone:false},{key:'stories:s1',src:'stories',title:'قصة بلا مهارة',levels:['a4'],status:'published',gone:false}]};
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:[],rg:null};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(c,o){st.ord.push([c,!o||o.ascending!==false]);return api},range(a,b){st.rg=[a,b];return api},
   then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));st.ord.slice().reverse().forEach(([c,a])=>r=r.slice().sort((x,y)=>(x[c]>y[c]?1:x[c]<y[c]?-1:0)*(a?1:-1)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='skill_save'){const p=a.p;if(p.id){Object.assign(DB.skills.find(s=>s.id===p.id),{name:p.name,descr:p.descr,domain:p.domain,levels:p.levels,status:p.status,has_path:p.has_path,parent_id:p.parent_id});return{data:{id:p.id,links_to_review:2}}}DB.skills.push(sk('N'+DB.skills.length,p.domain,p.name,p.levels,{sort:9,descr:p.descr,has_path:p.has_path,status:p.status}));return{data:{id:'N'}}}
   if(n==='skill_order'){a.p_ids.forEach((id,i)=>DB.skills.find(s=>s.id===id).sort=i+1);return{data:null}}
   if(n==='skill_link'){DB.skill_links.push({id:'L'+(DB.skill_links.length+1),skill_id:a.p_skill,item_key:a.p_key,role:a.p_role,stage:a.p_stage,ord:5,origin:'manual',reviewed:true});return{data:{id:'x'}}}
   if(n==='skill_link_update'){Object.assign(DB.skill_links.find(l=>l.id===a.p_id),{stage:a.p_stage,role:a.p_role,reviewed:false});return{data:null}}
   if(n==='skill_unlink'){DB.skill_links=DB.skill_links.filter(l=>l.id!==a.p_id);return{data:null}}
   if(n==='skill_review'){DB.skill_links.forEach(l=>{if(a.p_ids.includes(l.id))l.reviewed=true});return{data:null}}
   if(n==='skill_delete'){DB.skills=DB.skills.filter(s=>s.id!==a.p_id);return{data:null}}
   if(n==='skills_check')return{data:[{t:'dup',skill:'S1',msg:'«التعرف على الحروف» و«ربط الحرف» متقاربتان'},{t:'level',skill:'S3',link:'L3',msg:'مورد لا يتقاطع عمره مع المهارة'}]};
   return{data:null,error:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:(m)=>{window.ASKS.push(m);return Promise.resolve(window.ASK_YES)}};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/skillsadm.js','utf8')});
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.skillsadm.fn(document.getElementById('m')));await p.waitForTimeout(150)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(150)};
 const calls=async()=>p.evaluate(()=>window.calls.splice(0));const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));const txt=()=>p.textContent('#m');
 const ov=async(w)=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0)E('تجاوز أفقي '+w+' '+o)};
 const T=(c,m)=>{if(!c)E('FAIL '+m)};
 // 1 القائمة
 await open();let t=await txt();
 T(await p.$$eval('.sk-dom',e=>e.length)===2,'مجالان');T(await p.$$eval('.sk-row[data-id]',e=>e.length)===4,'أربع مهارات');
 T(t.includes('مخفية')&&t.includes('غير مراجع')&&t.includes('متسلسلة'),'شارات الحالة');await ov('list');
 await p.selectOption('#skfd','math');T(await p.$$eval('.sk-row[data-id]',e=>e.length)===2,'فلتر المجال');await p.selectOption('#skfs','hidden');T(await p.$$eval('.sk-row[data-id]',e=>e.length)===1,'فلتر الحالة');await p.selectOption('#skfd','');await p.selectOption('#skfs','');
 // 2 مهارة جديدة: خطأ ظاهر
 await ck('#sknew');await p.fill('#sfn','');await p.evaluate(()=>{window.NEXT_ERR='P0001: اكتب اسم المهارة.'});await ck('#sfsave');
 T((await p.textContent('#sfm')).includes('اكتب اسم المهارة'),'خطأ الاسم ظاهر');await calls();
 await p.fill('#sfn','مهارة الاختبار');await p.fill('#sfd','وصف قصير');await p.selectOption('#sfdm','math');await p.check('#sflv input[value=g1]');await p.check('#sflv input[value=g2]');await ck('#sfsave');
 let c=await calls();const sv=c.find(x=>x[0]==='skill_save');T(sv&&sv[1].p.name==='مهارة الاختبار'&&sv[1].p.domain==='math'&&sv[1].p.levels.join()==='g1,g2'&&sv[1].p_force===false,'حمولة الحفظ: '+JSON.stringify(sv));
 T((await txt()).includes('مهارة الاختبار'),'المهارة الجديدة في القائمة');
 // 3 تكرار قريب: المدير يؤكَّد ثم يُجبر
 await ck('#sknew');await p.fill('#sfn','التعرف على الحروف الهجائية');await p.evaluate(()=>{window.NEXT_ERR='P0001: توجد مهارة مماثلة أو متقاربة في هذا المجال: «التعرف على الحروف».';window.ASKS.length=0});await ck('#sfsave');await p.waitForTimeout(200);
 c=await calls();T(c.filter(x=>x[0]==='skill_save').length===2&&c.filter(x=>x[0]==='skill_save')[1][1].p_force===true,'المدير: إعادة بالإجبار بعد التأكيد');T((await p.evaluate(()=>window.ASKS.length))===1,'سُئل المدير قبل الإجبار');
 // 3b المحرر لا يُجبر
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر'}});await open();await ck('#sknew');await p.fill('#sfn','التعرف على الحروف الهجائية');await p.evaluate(()=>{window.NEXT_ERR='P0001: توجد مهارة مماثلة أو متقاربة في هذا المجال: «التعرف على الحروف».';window.ASKS.length=0});await ck('#sfsave');await p.waitForTimeout(150);
 c=await calls();T(c.filter(x=>x[0]==='skill_save').length===1,'المحرر لا يعيد بالإجبار');T((await p.textContent('#sfm')).includes('متقاربة'),'المحرر يرى الخطأ');T(!(await txt()).includes('حذف المهارة'),'لا حذف للمحرر');
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'المدير'}});await open();
 // 4 تعديل
 await ck('.sk-row[data-id=S2] [data-a=edit]');T((await p.inputValue('#sfn'))==='ربط الحرف بصوته','نموذج التعديل يملأ الاسم');await p.fill('#sfn','ربط الحرف بصوته ٢');await ck('#sfsave');c=await calls();
 const ed=c.find(x=>x[0]==='skill_save');T(ed&&ed[1].p.id==='S2','تعديل يرسل المعرّف');T((await msgs()).some(m=>m.includes('وُسم')),'رسالة وسم الروابط للمراجعة');
 // 5 الترتيب
 await ck('.sk-row[data-id=S2] [data-a=up]');c=await calls();const od=c.find(x=>x[0]==='skill_order');T(od&&od[1].p_ids[0]==='S2'&&od[1].p_ids[1]==='S1','ترتيب: تبديل');
 // 6 الروابط
 await open();await ck('.sk-row[data-id=S1] [data-a=links]');t=await txt();T(t.includes('نصل الحرف بصورته')&&t.includes('فيديو الحروف'),'روابط المهارة');T(t.includes('ربط آلي أولي'),'يعلن أن الربط الآلي أولي');
 await p.fill('#skq','ح');T(!(await txt()).includes('حروف ملونة'),'بحث أقل من حرفين لا يعرض');
 await p.fill('#skq','حروف');t=await txt();T(t.includes('حروف ملونة')&&!t.includes('حروف الصف الثالث')&&!t.includes('حروف مسودة'),'المرشحون: عمر متقاطع ومنشور فقط');T(!t.includes('نصل الحرف بصورته')||(await p.$$eval('.sk-row[data-k]',e=>e.length))===1,'لا يعرض المربوط أصلًا');
 await p.selectOption('.sk-row[data-k="bank:b2"] [data-f=st]','review');await ck('.sk-row[data-k="bank:b2"] [data-a=add]');c=await calls();const ad=c.find(x=>x[0]==='skill_link');T(ad&&ad[1].p_key==='bank:b2'&&ad[1].p_stage==='review'&&ad[1].p_skill==='S1','حمولة الربط: '+JSON.stringify(ad));
 await p.selectOption('.sk-row[data-l=L1] [data-f=stage]','apply');c=await calls();const up=c.find(x=>x[0]==='skill_link_update');T(up&&up[1].p_id==='L1'&&up[1].p_stage==='apply','تغيير المستوى');
 // تعديل الدور يُفشل: الخطأ يظهر
 await p.evaluate(()=>{window.NEXT_ERR='P0001: للمورد مهارة رئيسية بالفعل.'});await p.selectOption('.sk-row[data-l=L2] [data-f=role]','main');T((await msgs()).some(m=>m.includes('رئيسية بالفعل')),'خطأ الدور يظهر');
 // فك الربط بتأكيد
 await p.evaluate(()=>{window.ASKS.length=0});await ck('.sk-row[data-l=L2] [data-a=unlink]');c=await calls();T(c.some(x=>x[0]==='skill_unlink'&&x[1].p_id==='L2'),'فك الربط');
 // اعتماد
 await ck('#skapp');c=await calls();const rv=c.find(x=>x[0]==='skill_review');T(rv&&rv[1].p_ids.length>=1,'اعتماد الروابط');T(!(await txt()).includes('اعتماد'),'لا زر اعتماد بعد اعتماد الكل')
 await ov('links');
 // المحرر لا يرى اعتماد
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر'}});await open();await ck('.sk-row[data-id=S3] [data-a=links]');T(!(await txt()).includes('اعتماد'),'المحرر بلا اعتماد');
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer'],name:'مراجع'}});await open();await ck('.sk-row[data-id=S3] [data-a=links]');T((await txt()).includes('اعتماد'),'المراجع يرى اعتماد');
 // 7 المراجعة
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'المدير'}});await open();await ck('#sktabs [data-t=review]');await p.waitForTimeout(200);t=await txt();
 T(t.includes('تكرار')&&t.includes('عمر لا يتقاطع'),'فحص الجودة يعرض المشكلات بعناوين عربية');T(t.includes('مورد منشور بلا مهارة'),'ملخص غير المربوطة');T(/مهارات فيها روابط غير مراجعة/.test(t),'قسم غير المراجع');await ov('review');
 await ck('.sk-row[data-id] [data-a=open]');T((await txt()).includes('كل المهارات'),'فتح الروابط من المراجعة');
 // 8 بلا صلاحية
 await p.evaluate(()=>{window.ME={roles:[],name:'x'}});await open();T((await txt()).includes('ليست لديك صلاحية'),'بلا صلاحية');
 if(jserr.length)E('JS '+jserr.join('|'));
 await b.close();console.log(errs.length?('FAILED '+errs.length):'ALL PASS');process.exit(errs.length?1:0)})();
