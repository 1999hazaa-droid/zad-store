// NODE_PATH=$(npm root -g) VW=390 node tools/content/goals/test_goalsadm.js   (واجهة إدارة الأهداف: واجهة حقيقية + قاعدة وهمية)
// قواعد القاعدة نفسها (الفعل القابل للملاحظة، المبالغة، التكرار، العمر، ربط مهارة الهدف فقط، حد الأهداف للمورد، الصلاحيات، النشر، تعليم المراجعة) اختُبرت على قاعدة البيانات الحقيقية؛ هنا نختبر الواجهة واستدعاءاتها.
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+(process.env.VW||1100),height:900}});const p=await ctx.newPage();const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ME={roles:['library_manager'],name:'المدير'};window.ASKS=[];window.ASK_YES=true;window.went=null;
  const sk=(id,dom,name,lv)=>({id,slug:id,domain:dom,name,descr:'',levels:lv,has_path:false,parent_id:null,sort:1,status:'active'});
  const gl=(id,dom,skill,name,lv,st,o={})=>Object.assign({id,slug:'g-'+id,domain:dom,skill_id:skill,name,name_norm:name,descr:'وصف',levels:lv,outcomes:['مخرج واضح أول','مخرج واضح ثان'],verify:'اعرض واطلب',tip:'إرشاد',sort:1,status:st,extra:false},o);
  const DB={skill_domains:[{slug:'arabic',name:'مهارات اللغة العربية',icon:'book.svg',color:'#e6dcff',sort:1},{slug:'math',name:'مهارات الرياضيات',icon:'numbers.svg',color:'#dff3ff',sort:2},{slug:'motor',name:'المهارات الحركية',icon:'hand.svg',color:'#fff',sort:6}],
   skills:[sk('S1','arabic','ربط الحرف بصوته',['a4','a5','a6']),sk('S3','math','العد',['a5','a6','g1']),sk('M1','motor','التتبع',['a4'])],
   goals:[gl('G1','arabic','S1','يربط الحرف بصوته وبكلمة تبدأ به',['a4','a5'],'draft',{sort:1}),gl('G2','arabic','S1','يميز بين الأصوات المتشابهة في الكلمات',['a5','a6'],'active',{sort:2}),gl('G3','math','S3','يعد الأشياء بالترتيب حتى عدد مناسب لعمره',['a5','a6'],'hidden',{sort:1,extra:true})],
   goal_links:[{id:'L1',goal_id:'G1',item_key:'bank:b1',role:'main',stage:'practice',ord:1,origin:'rule',reviewed:false},{id:'L2',goal_id:'G1',item_key:'vid:v1',role:'sub',stage:'recognize',ord:1,origin:'manual',reviewed:true},{id:'L3',goal_id:'G3',item_key:'acts:a1',role:'main',stage:'practice',ord:1,origin:'rule',reviewed:false}],
   skill_links:[{id:'K1',skill_id:'S1',item_key:'bank:b1'},{id:'K2',skill_id:'S1',item_key:'vid:v1'},{id:'K3',skill_id:'S1',item_key:'bank:b2'},{id:'K4',skill_id:'S1',item_key:'bank:b3'},{id:'K5',skill_id:'S1',item_key:'bank:b4'},{id:'K6',skill_id:'S3',item_key:'acts:a1'}],
   quality_items:[{key:'bank:b1',src:'bank',title:'نصل الحرف بصورته',levels:['a4','a5','a6'],status:'published',gone:false},{key:'vid:v1',src:'vid',title:'فيديو الحروف',levels:['a4'],status:'published',gone:false},{key:'acts:a1',src:'acts',title:'نعد الألعاب',levels:['a5'],status:'published',gone:false},{key:'bank:b2',src:'bank',title:'حروف ملونة',levels:['a5'],status:'published',gone:false},{key:'bank:b3',src:'bank',title:'حروف الصف الأول',levels:['g1'],status:'published',gone:false},{key:'bank:b4',src:'bank',title:'حروف مسودة',levels:['a5'],status:'draft',gone:false},{key:'bank:b5',src:'bank',title:'حروف خارج المهارة',levels:['a5'],status:'published',gone:false}]};
  window.DB=DB;
  const q=(tb)=>{const st={f:[],ord:[],rg:null};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},order(c,o){st.ord.push([c,!o||o.ascending!==false]);return api},range(a,b){st.rg=[a,b];return api},
   then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));st.ord.slice().reverse().forEach(([c,a])=>r=r.slice().sort((x,y)=>(x[c]>y[c]?1:x[c]<y[c]?-1:0)*(a?1:-1)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='goal_save'){const p=a.p;if(p.id){Object.assign(DB.goals.find(g=>g.id===p.id),{name:p.name,descr:p.descr,skill_id:p.skill_id,levels:p.levels,outcomes:p.outcomes,verify:p.verify,tip:p.tip});return{data:{id:p.id,links_to_review:2}}}DB.goals.push(gl('N'+DB.goals.length,'arabic',p.skill_id,p.name,p.levels,p.status,{sort:9,outcomes:p.outcomes,extra:true}));return{data:{id:'N'}}}
   if(n==='goal_order'){a.p_ids.forEach((id,i)=>DB.goals.find(g=>g.id===id).sort=i+1);return{data:null}}
   if(n==='goal_status'){DB.goals.find(g=>g.id===a.p_id).status=a.p_status;return{data:null}}
   if(n==='goal_publish_all'){let c=0;DB.goals.forEach(g=>{if(g.status==='draft'){g.status='active';c++}});return{data:c}}
   if(n==='goal_link'){DB.goal_links.push({id:'L'+(DB.goal_links.length+1),goal_id:a.p_goal,item_key:a.p_key,role:a.p_role,stage:a.p_stage,ord:5,origin:'manual',reviewed:true});return{data:{id:'x'}}}
   if(n==='goal_link_update'){Object.assign(DB.goal_links.find(l=>l.id===a.p_id),{stage:a.p_stage,role:a.p_role,reviewed:false});return{data:null}}
   if(n==='goal_unlink'){DB.goal_links=DB.goal_links.filter(l=>l.id!==a.p_id);return{data:null}}
   if(n==='goal_review'){DB.goal_links.forEach(l=>{if(a.p_ids.includes(l.id))l.reviewed=true});return{data:null}}
   if(n==='goal_delete'){DB.goals=DB.goals.filter(g=>g.id!==a.p_id);return{data:null}}
   if(n==='goals_check')return{data:[{t:'dup',goal:'G1',msg:'هدفان متقاربان'},{t:'verb',goal:'G2',msg:'صياغة غير قابلة للملاحظة'},{t:'levelres',goal:'G3',link:'L3',msg:'عمر المورد لا يتقاطع'}]};
   return{data:null,error:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:(m)=>{window.ASKS.push(m);return Promise.resolve(window.ASK_YES)}};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/goalsadm.js','utf8')});
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.goalsadm.fn(document.getElementById('m')));await p.waitForTimeout(150)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(150)};
 const calls=async()=>p.evaluate(()=>window.calls.splice(0));const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));const txt=()=>p.textContent('#m');
 const ov=async(w)=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0)E('تجاوز أفقي '+w+' '+o)};
 const T=(c,m)=>{if(!c)E('FAIL '+m)};
 // 1 القائمة: المجالات الخمسة المعتمدة فقط (الحركي مستبعد)
 await open();let t=await txt();
 T(await p.$$eval('.gl-dom',e=>e.length)===2,'مجالان فقط (الحركي لا يظهر)');T(await p.$$eval('.gl-row[data-id]',e=>e.length)===3,'ثلاثة أهداف');
 T(t.includes('مسودة')&&t.includes('منشور')&&t.includes('مخفي')&&t.includes('غير مراجع')&&t.includes('مضاف يدويًا'),'شارات الحالة');await ov('list');
 await p.selectOption('#glfd','math');T(await p.$$eval('.gl-row[data-id]',e=>e.length)===1,'فلتر المجال');await p.selectOption('#glfs','hidden');T(await p.$$eval('.gl-row[data-id]',e=>e.length)===1,'فلتر الحالة');await p.selectOption('#glfd','');await p.selectOption('#glfs','');
 // 2 هدف جديد: خطأ الفعل ظاهر ثم حفظ
 await ck('#glnew');t=await txt();T(!t.includes('التتبع'),'مهارات الحركي لا تظهر في اختيار المهارة');
 await p.fill('#gfn','يفهم الحروف');await p.evaluate(()=>{window.NEXT_ERR='P0001: ابدأ الهدف بفعل قابل للملاحظة.'});await ck('#gfsave');
 T((await p.textContent('#gfm')).includes('فعل قابل للملاحظة'),'خطأ الفعل ظاهر');await calls();
 await p.fill('#gfn','يتعرف على الحروف المتحركة في كلمات قصيرة');await p.fill('#gfo','يشير إلى الحرف المطلوب\nيقرأ كلمة قصيرة مشكولة\n');
 T(await p.$$eval('#gflv input',e=>e.map(x=>x.value).join())==='a4,a5,a6','العمر محصور في عمر المهارة');await p.check('#gflv input[value=a5]');await ck('#gfsave');
 let c=await calls();const sv=c.find(x=>x[0]==='goal_save');T(sv&&sv[1].p.name.startsWith('يتعرف')&&sv[1].p.levels.join()==='a5'&&sv[1].p.outcomes.length===2&&sv[1].p.status==='draft'&&sv[1].p.skill_id==='S1'&&sv[1].p_force===false,'حمولة الحفظ: '+JSON.stringify(sv));
 T((await txt()).includes('يتعرف على الحروف المتحركة'),'الهدف الجديد في القائمة');
 // 3 تكرار: المدير يؤكَّد ثم يُجبر؛ المحرر لا
 await ck('#glnew');await p.fill('#gfn','يربط الحرف بصوته وبكلمة تبدأ بها');await p.fill('#gfo','يشير إلى الحرف المطلوب');await p.check('#gflv input[value=a5]');await p.evaluate(()=>{window.NEXT_ERR='P0001: يوجد هدف مماثل أو متقارب لهذه المهارة: «يربط الحرف بصوته وبكلمة تبدأ به». استعمله أو غيّر الصياغة.';window.ASKS.length=0});await ck('#gfsave');await p.waitForTimeout(200);
 c=await calls();T(c.filter(x=>x[0]==='goal_save').length===2&&c.filter(x=>x[0]==='goal_save')[1][1].p_force===true,'المدير: إعادة بالإجبار بعد التأكيد');T((await p.evaluate(()=>window.ASKS.length))===1,'سُئل المدير قبل الإجبار');
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر'}});await open();await ck('#glnew');await p.fill('#gfn','يربط الحرف بصوته وبكلمة تبدأ بها');await p.fill('#gfo','يشير إلى الحرف المطلوب');await p.check('#gflv input[value=a5]');await p.evaluate(()=>{window.NEXT_ERR='P0001: يوجد هدف مماثل أو متقارب لهذه المهارة: «x».';window.ASKS.length=0});await ck('#gfsave');await p.waitForTimeout(150);
 c=await calls();T(c.filter(x=>x[0]==='goal_save').length===1,'المحرر لا يعيد بالإجبار');T((await p.textContent('#gfm')).includes('متقارب'),'المحرر يرى الخطأ');T(!(await txt()).includes('حذف الهدف'),'لا حذف للمحرر');
 await ck('#gfcan');T(await p.$$eval('[data-a=publish]',e=>e.length)===0,'المحرر بلا زر نشر');
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'المدير'}});await open();
 // 4 تعديل
 await ck('.gl-row[data-id=G2] [data-a=edit]');T((await p.inputValue('#gfn'))==='يميز بين الأصوات المتشابهة في الكلمات','نموذج التعديل يملأ الاسم');T((await p.inputValue('#gfo')).split('\n').length===2,'المخرجات سطر لكل مخرج');await p.fill('#gfn','يميز بين الأصوات المتقاربة في الكلمات');await ck('#gfsave');c=await calls();
 const ed=c.find(x=>x[0]==='goal_save');T(ed&&ed[1].p.id==='G2','تعديل يرسل المعرّف');T((await msgs()).some(m=>m.includes('وُسم')),'رسالة وسم الروابط للمراجعة');
 // 5 الترتيب
 await ck('.gl-row[data-id=G2] [data-a=up]');c=await calls();const od=c.find(x=>x[0]==='goal_order');T(od&&od[1].p_ids[0]==='G2'&&od[1].p_ids[1]==='G1','ترتيب: تبديل');
 // 6 النشر والإخفاء
 await open();await ck('.gl-row[data-id=G1] [data-a=publish]');c=await calls();const pb=c.find(x=>x[0]==='goal_status');T(pb&&pb[1].p_id==='G1'&&pb[1].p_status==='active','نشر');
 await ck('.gl-row[data-id=G1] [data-a=hide]');c=await calls();T(c.some(x=>x[0]==='goal_status'&&x[1].p_status==='hidden'),'إخفاء مؤقت');
 await p.evaluate(()=>{window.NEXT_ERR='P0001: نشر الهدف يحتاج مراجعًا تعليميًا.'});await ck('.gl-row[data-id=G1] [data-a=publish]');T((await msgs()).some(m=>m.includes('مراجعًا')),'خطأ النشر يظهر');
 // 7 الروابط
 await open();await ck('.gl-row[data-id=G1] [data-a=links]');t=await txt();T(t.includes('نصل الحرف بصورته')&&t.includes('فيديو الحروف'),'روابط الهدف');T(t.includes('ربط آلي أولي'),'يعلن أن الربط الآلي أولي');
 await p.fill('#glq','ح');T(!(await txt()).includes('حروف ملونة'),'بحث أقل من حرفين لا يعرض');
 await p.fill('#glq','حروف');t=await txt();T(t.includes('حروف ملونة')&&!t.includes('حروف الصف الأول')&&!t.includes('حروف مسودة')&&!t.includes('حروف خارج المهارة'),'المرشحون: ضمن مهارة الهدف، عمر متقاطع، منشور فقط');
 await p.selectOption('.gl-row[data-k="bank:b2"] [data-f=st]','review');await ck('.gl-row[data-k="bank:b2"] [data-a=add]');c=await calls();const ad=c.find(x=>x[0]==='goal_link');T(ad&&ad[1].p_key==='bank:b2'&&ad[1].p_stage==='review'&&ad[1].p_goal==='G1','حمولة الربط: '+JSON.stringify(ad));
 await p.selectOption('.gl-row[data-l=L1] [data-f=stage]','apply');c=await calls();const up=c.find(x=>x[0]==='goal_link_update');T(up&&up[1].p_id==='L1'&&up[1].p_stage==='apply','تغيير المستوى');
 await p.evaluate(()=>{window.NEXT_ERR='P0001: للمورد هدف رئيسي بالفعل.'});await p.selectOption('.gl-row[data-l=L2] [data-f=role]','main');T((await msgs()).some(m=>m.includes('رئيسي بالفعل')),'خطأ الدور يظهر');
 await ck('.gl-row[data-l=L2] [data-a=unlink]');c=await calls();T(c.some(x=>x[0]==='goal_unlink'&&x[1].p_id==='L2'),'فك الربط');
 await ck('#glapp');c=await calls();const rv=c.find(x=>x[0]==='goal_review');T(rv&&rv[1].p_ids.length>=1,'اعتماد الروابط');T(!(await txt()).includes('اعتماد'),'لا زر اعتماد بعد اعتماد الكل');await ov('links');
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'محرر'}});await open();await ck('.gl-row[data-id=G3] [data-a=links]');T(!(await txt()).includes('اعتماد'),'المحرر بلا اعتماد');
 await p.evaluate(()=>{window.ME={roles:['edu_reviewer'],name:'مراجع'}});await open();await ck('.gl-row[data-id=G3] [data-a=links]');T((await txt()).includes('اعتماد'),'المراجع يرى اعتماد');
 // 8 المراجعة
 await p.evaluate(()=>{window.ME={roles:['library_manager'],name:'المدير'}});await open();await ck('#gltabs [data-t=review]');await p.waitForTimeout(200);t=await txt();
 T(t.includes('تكرار')&&t.includes('صياغة غير قابلة للملاحظة')&&t.includes('عمر المورد لا يتقاطع'),'فحص الجودة يعرض المشكلات بعناوين عربية');T(t.includes('لا تظهر للمستخدمين قبل أن يراجعها'),'يوضح أن المسودات لا تُعرض');T(/أهداف فيها روابط غير مراجعة/.test(t),'قسم غير المراجع');await ov('review');
 await p.evaluate(()=>{window.ASKS.length=0});await ck('#glpuball');c=await calls();T(c.some(x=>x[0]==='goal_publish_all'),'نشر المسودات');T((await p.evaluate(()=>window.ASKS.length))===1,'سؤال تأكيد قبل نشر الجميع');
 await ck('.gl-row[data-id] [data-a=open]');T((await txt()).includes('كل الأهداف'),'فتح الروابط من المراجعة');
 // 9 بلا صلاحية
 await p.evaluate(()=>{window.ME={roles:[],name:'x'}});await open();T((await txt()).includes('ليست لديك صلاحية'),'بلا صلاحية');
 if(jserr.length)E('JS '+jserr.join('|'));
 await b.close();console.log(errs.length?('FAILED '+errs.length):'ALL PASS');process.exit(errs.length?1:0)})();
