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
  const DB={skills:[{id:'S1',slug:'ar-letter',name:'ربط الحرف بصوته',domain:'arabic',levels:['a4','a5','a6'],status:'active'},{id:'S3',slug:'ar-look',name:'التمييز البصري',domain:'arabic',levels:['a3','a4','a5'],status:'active'},{id:'S4',slug:'ar-sound',name:'صوت الحرف',domain:'arabic',levels:['a4','a5'],status:'active'},{id:'S5',slug:'cr-draw',name:'الرسم',domain:'creative',levels:['a2','a3'],status:'active'}],path_stage_info:[],path_prior:[],skill_domains:[{slug:'creative',name:'مهارات الإبداع',icon:'p',color:'#fff',sort:7},{slug:'arabic',name:'مهارات اللغة العربية',icon:'b',color:'#fff',sort:1},{slug:'math',name:'مهارات الرياضيات',icon:'n',color:'#fff',sort:2},{slug:'motor',name:'المهارات الحركية',icon:'h',color:'#fff',sort:6}],
   goals:[{id:'GC',name:'يرسم ويلوّن',domain:'creative',levels:['a3','a4','a5'],status:'draft',skill_id:'S5',sort:9},{id:'G1',name:'يربط الحرف بصوته',domain:'arabic',levels:['a4','a5','a6'],status:'active',skill_id:'S1',sort:1},{id:'G2',name:'يعد الأشياء',domain:'math',levels:['a5','a6','g1'],status:'active',skill_id:'S2',sort:2},{id:'GM',name:'يتتبع الخطوط',domain:'motor',levels:['a4'],status:'active',skill_id:'S3',sort:3}],
   paths:[pa('P1','G1','مسار ربط الحرف بصوته — ٤ إلى ٥ سنوات',['a4','a5'],'draft',1),pa('P2','G1','مسار ربط الحرف — ٦ سنوات',['a6'],'active',2),pa('P3','G2','مسار العد — ٥ إلى ٦',['a5','a6'],'hidden',1,{extra:true})],
   path_items:[pi('I1','P1','bank:b1','practice',1),pi('I2','P1','bank:b2','practice',2),pi('I3','P1','vid:v1','understand',1),pi('I4','P1','lib:gone','practice',3)],
   goal_links:[{goal_id:'G1',item_key:'bank:b1'},{goal_id:'G1',item_key:'bank:b2'},{goal_id:'G1',item_key:'vid:v1'},{goal_id:'G1',item_key:'bank:b3'},{goal_id:'G1',item_key:'bank:b4'},{goal_id:'G1',item_key:'bank:b5'},{goal_id:'G2',item_key:'acts:a1'}],
   quality_items:[qi('bank:b1','bank','نصل الحرف بصورته',['a4','a5','a6']),qi('bank:b2','bank','حروف ملونة',['a4','a5']),qi('vid:v1','vid','فيديو الحروف',['a4']),qi('bank:b3','bank','حروف للصف الأول',['g1']),qi('bank:b4','bank','حرف مسودة',['a4'],'draft'),qi('bank:b5','bank','حرف مفقود الربط ألوان',['a5']),qi('acts:a1','acts','نعد الألعاب',['a5']),qi('lib:gone','lib','ملف قديم',['a4'],'draft')]};
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:[],rg:null};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(c,o){st.ord.push([c,!o||o.ascending!==false]);return api},range(a,b){st.rg=[a,b];return api},
   then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));st.ord.slice().reverse().forEach(([c,a])=>r=r.slice().sort((x,y)=>(x[c]>y[c]?1:x[c]<y[c]?-1:0)*(a?1:-1)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='path_save'){const p=a.p;if(p.id){Object.assign(DB.paths.find(x=>x.id===p.id),{name:p.name,descr:p.descr,levels:p.levels,est_min:p.est_min,goal_id:p.goal_id,diff:p.diff});return{data:{id:p.id}}}DB.paths.push(pa('N','x',p.name,p.levels,'draft',9));DB.paths[DB.paths.length-1].goal_id=p.goal_id;return{data:{id:'N'}}}
   if(n==='path_order'){a.p_ids.forEach((id,i)=>DB.paths.find(x=>x.id===id).sort=i+1);return{data:null}}
   if(n==='path_status'){DB.paths.find(x=>x.id===a.p_id).status=a.p_status;return{data:null}}
   if(n==='path_publish_all'){let c=0;DB.paths.forEach(x=>{if(x.status==='draft'){x.status='active';c++}});return{data:c}}
   if(n==='path_item_add'){DB.path_items.push(pi('I'+(DB.path_items.length+1),a.p_path,a.p_key,a.p_stage,9,a.p_required));return{data:{id:'x'}}}
   if(n==='path_item_update'){Object.assign(DB.path_items.find(x=>x.id===a.p_id),{stage:a.p_stage,required:a.p_required});return{data:null}}
   if(n==='path_item_remove'){DB.path_items=DB.path_items.filter(x=>x.id!==a.p_id);return{data:null}}
   if(n==='path_items_order'){a.p_ids.forEach((id,i)=>DB.path_items.find(x=>x.id===id).ord=i+1);return{data:null}}
   if(n==='path_delete'){DB.paths=DB.paths.filter(x=>x.id!==a.p_id);return{data:null}}
   if(n==='path_stage_save'){const o=DB.path_stage_info.find(x=>x.path_id===a.p_path&&x.stage===a.p_stage);const v={path_id:a.p_path,stage:a.p_stage,name:a.p_name,expl:a.p_expl,skill_id:a.p_skill};if(o)Object.assign(o,v);else DB.path_stage_info.push(v);return{data:{ok:true}}}
   if(n==='path_stage_clear'){DB.path_stage_info=DB.path_stage_info.filter(x=>!(x.path_id===a.p_path&&x.stage===a.p_stage));return{data:{ok:true}}}
   if(n==='path_prior_save'){DB.path_prior.push({id:'R'+DB.path_prior.length,path_id:a.p_path,skill_id:a.p_skill,note:a.p_note,ord:DB.path_prior.length+1});return{data:{ok:true}}}
   if(n==='path_prior_remove'){DB.path_prior=DB.path_prior.filter(x=>!(x.path_id===a.p_path&&x.skill_id===a.p_skill));return{data:{ok:true}}}
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

 // 1 مجال الإبداع ضمن المجالات وصعوبة المسار
 await open();let t=await txt();
 T(await p.$$eval('.pa-dom',e=>e.length)===3,'ثلاثة مجالات بينها الإبداع (الحركي مستبعد)');T(t.includes('مهارات الإبداع'),'قسم الإبداع ظاهر');await ov('list');
 await ck('#panew');await p.selectOption('#pfg','GC');
 T(await p.$$eval('#pflv input',e=>e.map(x=>x.value).join())==='a3,a4,a5','أعمار هدف الإبداع فقط');
 T(await p.$('#pfdf')!==null&&(await p.$$eval('#pfdf option',e=>e.map(x=>x.textContent).join())).includes('أصعب قليلًا'),'حقل مستوى الصعوبة');
 await p.fill('#pfn','رسم وتلوين للصغار جدًا');await p.evaluate(()=>document.querySelector('#pflv input[value=a3]').click());await p.selectOption('#pfdf','easy');await ck('#pfsave');
 let c=await calls();let sv=c.filter(x=>x[0]==='path_save').pop();T(sv&&sv[1].p.goal_id==='GC'&&sv[1].p.diff==='easy'&&sv[1].p.status==='draft','حمولة الحفظ تشمل الصعوبة: '+JSON.stringify(sv&&sv[1].p));
 await ck('#paback');await ck('.pa-row[data-id="P2"] [data-a=edit]');T((await p.$eval('#pfdf',x=>x.value))==='','مسار بلا صعوبة: غير محدد');await p.selectOption('#pfdf','hard');await ck('#pfsave');c=await calls();sv=c.filter(x=>x[0]==='path_save').pop();T(sv&&sv[1].p.id==='P2'&&sv[1].p.diff==='hard','حفظ الصعوبة عند التعديل');
 T((await txt()).includes('أصعب قليلًا'),'وسم الصعوبة في القائمة');
 // 2 لوحة المراحل
 await p.evaluate(()=>document.querySelector('.pa-row[data-id="P1"] [data-a=items]').click());await p.waitForTimeout(200);t=await txt();
 T(await p.$$eval('.pa-form[data-st]',e=>e.length)===5,'خمسة أنواع مراحل قابلة للتعديل');
 T(t.includes('ترتيب أنواع المراحل ثابت'),'توضيح أن ترتيب المراحل ثابت');
 T((await p.$eval('[data-st=understand] [data-f=sname]',x=>x.value))==='الفهم','الاسم الافتراضي');
 const so=await p.$$eval('[data-st=understand] [data-f=sskill] option',e=>e.map(x=>x.textContent));T(so.length===3&&so[0].includes('ربط الحرف بصوته')&&so.some(x=>x.includes('التمييز'))&&!so.some(x=>x.includes('الرسم')),'خيارات المهارة: مهارة المسار والمتقاطعة عمرًا فقط: '+so);
 await p.fill('[data-st=understand] [data-f=sname]','نسمع القصة');await p.fill('[data-st=understand] [data-f=sexpl]','قصة قصيرة تقدم الحرف.');await p.selectOption('[data-st=understand] [data-f=sskill]','S4');
 await p.evaluate(()=>window.NEXT_ERR='path_stage_save: لا تستعمل عبارات إتقان أو درجات أو مقارنة في نص المرحلة.');await ck('[data-st=understand] [data-a=ssave]');
 T((await msgs()).some(m=>m.includes('لا تستعمل عبارات إتقان')),'خطأ القاعدة يظهر للمحرر');
 await ck('[data-st=understand] [data-a=ssave]');c=await calls();const ss=c.filter(x=>x[0]==='path_stage_save').pop();
 T(ss&&ss[1].p_path==='P1'&&ss[1].p_stage==='understand'&&ss[1].p_name==='نسمع القصة'&&ss[1].p_skill==='S4','حمولة حفظ المرحلة: '+JSON.stringify(ss));
 T((await p.$eval('[data-st=understand] [data-f=sname]',x=>x.value))==='نسمع القصة'&&await p.$('[data-st=understand] [data-a=sclear]')!==null,'المرحلة المحفوظة تُعرض وفيها زر الإعادة');
 // معاينة قبل النشر
 await ck('#paprev');t=await txt();T(t.includes('نسمع القصة')&&t.includes('المهارة المستهدفة: صوت الحرف')&&t.includes('قصة قصيرة تقدم الحرف'),'المعاينة تعرض اسم المرحلة والمهارة والشرح');
 T(t.includes('المهارة المستهدفة: ربط الحرف بصوته'),'المرحلة بلا تخصيص تعرض مهارة المسار');await ck('#paprev');
 await ck('[data-st=understand] [data-a=sclear]');c=await calls();T(c.some(x=>x[0]==='path_stage_clear'&&x[1].p_stage==='understand'),'إعادة المرحلة إلى الافتراضي');
 T((await p.$eval('[data-st=understand] [data-f=sname]',x=>x.value))==='الفهم','عاد الاسم الافتراضي');
 // 3 المهارات السابقة
 T((await txt()).includes('لا مهارات سابقة محددة'),'حالة فارغة للمهارات السابقة');
 await p.selectOption('#pa-pradd [data-f=pskill]','S3');await p.fill('#pa-pradd [data-f=pnote]','يفيد قبل البدء');await ck('#pa-pradd [data-a=padd]');
 c=await calls();const pp=c.find(x=>x[0]==='path_prior_save');T(pp&&pp[1].p_path==='P1'&&pp[1].p_skill==='S3'&&pp[1].p_note==='يفيد قبل البدء','حمولة المهارة السابقة: '+JSON.stringify(pp));
 T(await p.$('.pa-row[data-pr="S3"]')!==null,'المهارة السابقة ظاهرة');
 await ck('#paprev');T((await txt()).includes('المهارات السابقة المقترحة: التمييز البصري'),'المعاينة تعرض المهارة السابقة');await ck('#paprev');
 await ck('.pa-row[data-pr="S3"] [data-a=prm]');c=await calls();T(c.some(x=>x[0]==='path_prior_remove'&&x[1].p_skill==='S3'),'إزالة المهارة السابقة');
 await ov('stages');
 // 4 صلاحيات: دور بلا تحرير لا يرى لوحة المراحل
 await p.evaluate(()=>{window.ME={roles:['publisher'],name:'ن'}});await open();await p.evaluate(()=>document.querySelector('.pa-row[data-id="P1"] [data-a=items]')&&document.querySelector('.pa-row[data-id="P1"] [data-a=items]').click());await p.waitForTimeout(150);
 T(await p.$('.pa-form[data-st]')===null,'من لا يملك صلاحية التحرير لا يرى لوحة المراحل');
 await ctx.close();console.log('vp',VW,'done');
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'PASS');process.exit(errs.length?1:0)})();
