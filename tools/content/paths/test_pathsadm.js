// NODE_PATH=$(npm root -g) VW=390 node tools/content/paths/test_pathsadm.js   (واجهة إدارة المسارات: واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة نفسها اختُبرت على قاعدة البيانات الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,768,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ME={roles:['library_manager'],name:'المدير'};window.ASKS=[];window.ASK_YES=true;window.went=null;
  const qi=(key,src,title,lv,st)=>({key,src,title,levels:lv,status:st||'published',gone:false});
  const pa=(id,goal,name,lv,st,sort,o)=>Object.assign({id,slug:'p-'+id,goal_id:goal,name,name_norm:name,descr:'',levels:lv,est_min:null,sort,status:st,extra:false},o||{});
  const pi=(id,path,key,stage,ord,req)=>({id,path_id:path,item_key:key,stage,ord,required:req!==false,origin:'rule'});
  const DB={skill_domains:[{slug:'arabic',name:'مهارات اللغة العربية',icon:'b',color:'#fff',sort:1},{slug:'math',name:'مهارات الرياضيات',icon:'n',color:'#fff',sort:2},{slug:'motor',name:'المهارات الحركية',icon:'h',color:'#fff',sort:6}],
   goals:[{id:'G1',name:'يربط الحرف بصوته',domain:'arabic',levels:['a4','a5','a6'],status:'active',skill_id:'S1',sort:1},{id:'G2',name:'يعد الأشياء',domain:'math',levels:['a5','a6','g1'],status:'active',skill_id:'S2',sort:2},{id:'GM',name:'يتتبع الخطوط',domain:'motor',levels:['a4'],status:'active',skill_id:'S3',sort:3}],
   paths:[pa('P1','G1','مسار ربط الحرف بصوته — ٤ إلى ٥ سنوات',['a4','a5'],'draft',1),pa('P2','G1','مسار ربط الحرف — ٦ سنوات',['a6'],'active',2),pa('P3','G2','مسار العد — ٥ إلى ٦',['a5','a6'],'hidden',1,{extra:true})],
   path_items:[pi('I1','P1','bank:b1','practice',1),pi('I2','P1','bank:b2','practice',2),pi('I3','P1','vid:v1','understand',1),pi('I4','P1','lib:gone','practice',3)],
   goal_links:[{goal_id:'G1',item_key:'bank:b1'},{goal_id:'G1',item_key:'bank:b2'},{goal_id:'G1',item_key:'vid:v1'},{goal_id:'G1',item_key:'bank:b3'},{goal_id:'G1',item_key:'bank:b4'},{goal_id:'G1',item_key:'bank:b5'},{goal_id:'G2',item_key:'acts:a1'}],
   quality_items:[qi('bank:b1','bank','نصل الحرف بصورته',['a4','a5','a6']),qi('bank:b2','bank','حروف ملونة',['a4','a5']),qi('vid:v1','vid','فيديو الحروف',['a4']),qi('bank:b3','bank','حروف للصف الأول',['g1']),qi('bank:b4','bank','حرف مسودة',['a4'],'draft'),qi('bank:b5','bank','حرف مفقود الربط ألوان',['a5']),qi('acts:a1','acts','نعد الألعاب',['a5']),qi('lib:gone','lib','ملف قديم',['a4'],'draft')]};
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:[],rg:null};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(c,o){st.ord.push([c,!o||o.ascending!==false]);return api},range(a,b){st.rg=[a,b];return api},
   then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));st.ord.slice().reverse().forEach(([c,a])=>r=r.slice().sort((x,y)=>(x[c]>y[c]?1:x[c]<y[c]?-1:0)*(a?1:-1)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='path_save'){const p=a.p;if(p.id){Object.assign(DB.paths.find(x=>x.id===p.id),{name:p.name,descr:p.descr,levels:p.levels,est_min:p.est_min,goal_id:p.goal_id});return{data:{id:p.id}}}DB.paths.push(pa('N','x',p.name,p.levels,'draft',9));DB.paths[DB.paths.length-1].goal_id=p.goal_id;return{data:{id:'N'}}}
   if(n==='path_order'){a.p_ids.forEach((id,i)=>DB.paths.find(x=>x.id===id).sort=i+1);return{data:null}}
   if(n==='path_status'){DB.paths.find(x=>x.id===a.p_id).status=a.p_status;return{data:null}}
   if(n==='path_publish_all'){let c=0;DB.paths.forEach(x=>{if(x.status==='draft'){x.status='active';c++}});return{data:c}}
   if(n==='path_item_add'){DB.path_items.push(pi('I'+(DB.path_items.length+1),a.p_path,a.p_key,a.p_stage,9,a.p_required));return{data:{id:'x'}}}
   if(n==='path_item_update'){Object.assign(DB.path_items.find(x=>x.id===a.p_id),{stage:a.p_stage,required:a.p_required});return{data:null}}
   if(n==='path_item_remove'){DB.path_items=DB.path_items.filter(x=>x.id!==a.p_id);return{data:null}}
   if(n==='path_items_order'){a.p_ids.forEach((id,i)=>DB.path_items.find(x=>x.id===id).ord=i+1);return{data:null}}
   if(n==='path_delete'){DB.paths=DB.paths.filter(x=>x.id!==a.p_id);return{data:null}}
   if(n==='paths_check')return{data:[{t:'gone',block:true,path:'P1',item:'I4',msg:'مورد محذوف أو غير منشور في مسار ربط الحرف'},{t:'few',block:true,path:'P1',msg:'موارد قليلة'}]};
   return{data:null,error:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:(m)=>{window.ASKS.push(m);return Promise.resolve(window.ASK_YES)}};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/pathsadm.js','utf8')});
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.pathsadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(150)};
 const calls=async()=>p.evaluate(()=>window.calls.splice(0));const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));const txt=()=>p.textContent('#m');
 const ov=async(w)=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0)E(VW+' تجاوز أفقي '+w+' '+o)};
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 // 1 القائمة
 await open();let t=await txt();
 T(await p.$$eval('.pa-dom',e=>e.length)===2,'مجالان (الحركي مستبعد)');T(await p.$$eval('.pa-row[data-id]',e=>e.length)===3,'ثلاثة مسارات');
 T(t.includes('مضاف يدويًا'),'وسم المضاف يدويًا');T(t.includes('مسودة')&&t.includes('منشور')&&t.includes('مخفي'),'الحالات');await ov('list');
 // الجودة: P1 فيه 3 صالحة من 4
 T(/٣ صالح|3 صالح/.test(t),'عدد الموارد الصالحة يعتمد على الواقع: '+t.slice(0,300));
 // 2 تصفية
 await p.selectOption('#pafd','math');T(await p.$$eval('.pa-row[data-id]',e=>e.length)===1,'تصفية المجال');await p.selectOption('#pafd','');
 await p.selectOption('#pafs','active');T(await p.$$eval('.pa-row[data-id]',e=>e.length)===1,'تصفية الحالة');await p.selectOption('#pafs','');
 // 3 ترتيب
 await p.evaluate(()=>document.querySelectorAll('.pa-row[data-id="P2"] [data-a=up]')[0].click());await p.waitForTimeout(200);let c=await calls();
 const o=c.find(x=>x[0]==='path_order');T(o&&o[1].p_ids.join()==='P2,P1','ترتيب المسارات: '+JSON.stringify(o));
 // 4 مسار جديد: عمر ضمن عمر الهدف
 await ck('#panew');t=await txt();T(await p.$$eval('#pflv input',e=>e.map(x=>x.value).join())==='a4,a5,a6','أعمار الهدف فقط');
 T(!(await p.$$eval('#pfg option',e=>e.map(x=>x.textContent).join())).includes('يتتبع'),'هدف الحركي غير متاح');
 await p.selectOption('#pfg','G2');T(await p.$$eval('#pflv input',e=>e.map(x=>x.value).join())==='a5,a6,g1','الأعمار تتبع الهدف');await ov('form');
 await p.fill('#pfn','مسار جديد للعد');await p.evaluate(()=>document.querySelector('#pflv input[value=a5]').click());await p.fill('#pfe','15');
 await p.evaluate(()=>window.NEXT_ERR='path_save: اسم قصير');await ck('#pfsave');T((await txt()).includes('اسم قصير'),'خطأ القاعدة يظهر للمستخدم');
 await ck('#pfsave');c=await calls();const sv=c.filter(x=>x[0]==='path_save').pop();T(sv&&sv[1].p.goal_id==='G2'&&sv[1].p.levels.join()==='a5'&&sv[1].p.est_min===15&&sv[1].p.status==='draft','حمولة الحفظ: '+JSON.stringify(sv));
 T(await p.$('#paback')!==null,'بعد الإنشاء تفتح صفحة الموارد');
 // 5 موارد P1
 await ck('#paback');await ck('.pa-row[data-id="P2"] [data-a=edit]');await ck('#pfcan');
 await p.evaluate(()=>document.querySelector('.pa-row[data-id="P1"] [data-a=items]').click());await p.waitForTimeout(200);t=await txt();
 const rows=await p.$$eval('.pa-row[data-l] b',e=>e.map(x=>x.textContent));T(rows[0].includes('فيديو')&&rows[1].includes('نصل')&&rows[2].includes('حروف ملونة'),'ترتيب بالمراحل: '+rows);
 T(t.includes('غير صالح للعرض'),'المورد المحذوف/غير المنشور موسوم');await ov('items');
 // نقل داخل المرحلة
 await p.evaluate(()=>document.querySelector('.pa-row[data-l="I2"] [data-a=up]').click());await p.waitForTimeout(200);c=await calls();const io=c.find(x=>x[0]==='path_items_order');
 T(io&&io[1].p_path==='P1'&&io[1].p_ids.length===4&&io[1].p_ids.join()!=='I1,I2,I3,I4','ترتيب الموارد قائمة كاملة: '+JSON.stringify(io));
 T(await p.$eval('.pa-row[data-l="I3"] [data-a=up]',e=>e.disabled),'لا نقل بين مرحلتين');
 // مرحلة وأهمية
 await p.selectOption('.pa-row[data-l="I1"] [data-f=stage]','apply');c=await calls();const iu=c.find(x=>x[0]==='path_item_update');T(iu&&iu[1].p_stage==='apply'&&iu[1].p_required===true,'تغيير المرحلة: '+JSON.stringify(iu));
 await p.selectOption('.pa-row[data-l="I1"] [data-f=req]','0');c=await calls();T(c.find(x=>x[0]==='path_item_update')[1].p_required===false,'اختياري');
 // 6 بحث الإضافة: منشور + مرتبط بالهدف + عمر متقاطع + غير مضاف
 await p.fill('#paq','حرف');await p.waitForTimeout(150);const cand=await p.$$eval('.pa-row[data-k]',e=>e.map(x=>x.dataset.k));
 T(cand.join()==='bank:b5','المرشحون: منشور ومرتبط بالهدف ومتقاطع العمر وغير مضاف فقط: '+cand);
 T(!cand.includes('bank:b3')&&!cand.includes('bank:b4'),'لا مورد بعمر خارج المسار ولا مسودة');
 await p.evaluate(()=>document.querySelector('.pa-row[data-k] [data-a=add]').click());await p.waitForTimeout(200);c=await calls();const ad=c.find(x=>x[0]==='path_item_add');T(ad&&ad[1].p_key==='bank:b5'&&ad[1].p_path==='P1','استدعاء الإضافة: '+JSON.stringify(ad));
 await p.fill('#paq','لا شيء بهذا');await p.waitForTimeout(100);T((await txt()).includes('لا نتائج'),'رسالة لا نتائج');
 // إزالة بتأكيد
 await p.evaluate(()=>window.ASK_YES=false);await p.evaluate(()=>document.querySelector('.pa-row[data-l="I4"] [data-a=rm]').click());await p.waitForTimeout(150);c=await calls();T(!c.find(x=>x[0]==='path_item_remove'),'الإلغاء لا يحذف');
 await p.evaluate(()=>window.ASK_YES=true);await p.evaluate(()=>document.querySelector('.pa-row[data-l="I4"] [data-a=rm]').click());await p.waitForTimeout(150);c=await calls();T(c.find(x=>x[0]==='path_item_remove'),'الإزالة بعد التأكيد');
 // معاينة
 await ck('#paprev');t=await txt();T(t.includes('معاينة كما يراها الزائر')&&t.includes('غير ظاهر للزوار'),'المعاينة تذكر أن المسودة غير ظاهرة');
 // 7 نشر/إيقاف
 await ck('#paback');await p.evaluate(()=>document.querySelector('.pa-row[data-id="P1"] [data-a=publish]').click());await p.waitForTimeout(200);c=await calls();const ps=c.find(x=>x[0]==='path_status');T(ps&&ps[1].p_status==='active','نشر');
 await p.evaluate(()=>document.querySelector('.pa-row[data-id="P1"] [data-a=hide]').click());await p.waitForTimeout(200);c=await calls();T(c.find(x=>x[0]==='path_status')[1].p_status==='hidden','إيقاف');
 // خطأ نشر
 await p.evaluate(()=>window.NEXT_ERR='path_status: لا يُنشر مسار فيه موارد غير صالحة');await p.evaluate(()=>document.querySelector('.pa-row[data-id="P3"] [data-a=publish]').click());await p.waitForTimeout(200);T((await msgs()).some(m=>m.includes('لا يُنشر')),'رسالة منع النشر');
 // 8 المراجعة
 await ck('#patabs [data-t=review]');await p.waitForTimeout(250);t=await txt();T(t.includes('فحص جودة المسارات')&&t.includes('يمنع النشر')&&t.includes('مورد محذوف'),'نتائج الفحص');T(await p.$('#papuball')!==null,'نشر المسودات للمراجع');await ov('review');
 // 9 الصلاحيات: محرر لا ينشر ولا يحذف
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر'}});await open();T(await p.$('[data-a=publish]')===null,'المحرر لا يرى النشر');T(await p.$('#panew')!==null,'المحرر ينشئ');
 await ck('.pa-row[data-id="P1"] [data-a=edit]');T(await p.$('#pfdel')===null,'المحرر لا يحذف');await ck('#pfcan');
 // بلا صلاحية
 await p.evaluate(()=>{window.ME={roles:[],name:'زائر'}});await open();T((await txt()).includes('ليست لديك صلاحية'),'بلا صلاحية');
 // مدير: حذف بتأكيد
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'م'}});await open();await ck('.pa-row[data-id="P3"] [data-a=edit]');await ck('#pfdel');c=await calls();T(c.find(x=>x[0]==='path_delete'&&x[1].p_id==='P3'),'حذف المدير بعد التأكيد');
 await ctx.close();console.log('vw',VW,'done');
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'PASS');process.exit(errs.length?1:0)})();
