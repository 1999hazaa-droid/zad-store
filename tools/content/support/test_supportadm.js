// NODE_PATH=$(npm root -g) node tools/content/support/test_supportadm.js   (واجهة الإدارة: واجهة حقيقية + قاعدة وهمية؛ قواعد القاعدة اختُبرت على القاعدة الحقيقية)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();
for(const VW of (process.env.VW?[+process.env.VW]:[390,768,1100])){
 const ctx=await b.newContext({viewport:{width:VW,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e));
 await p.setContent('<!doctype html><meta charset=utf-8><base href="https://zad.test/manage/"><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.calls=[];window.NEXT_ERR=null;window.ME={roles:['library_manager'],name:'المدير'};window.ASK_YES=true;window.went=null;
  const DB={support_groups:[{slug:'arabic',name:'دعم اللغة العربية',descr:'أنشطة للحروف.',icon:'b',color:'#fff',sort:1,status:'active'},{slug:'math',name:'دعم الرياضيات',descr:'أنشطة للعد.',icon:'n',color:'#fff',sort:2,status:'hidden'}],
   support_group_skills:[{group_slug:'arabic',skill_id:'S1',ord:1},{group_slug:'arabic',skill_id:'S2',ord:2},{group_slug:'math',skill_id:'S3',ord:1}],
   skill_domains:[{slug:'arabic',name:'مهارات اللغة العربية',sort:1},{slug:'math',name:'مهارات الرياضيات',sort:2}],
   skill_links:[{skill_id:'S1',item_key:'bank:b1'},{skill_id:'S1',item_key:'vid:v1'},{skill_id:'S2',item_key:'proj:p1'},{skill_id:'S4',item_key:'ready:r1'}],
   quality_items:[{key:'bank:b1',src:'bank',title:'نصل الحرف',levels:['a4'],status:'published',gone:false},{key:'vid:v1',src:'vid',title:'فيديو الحروف',levels:['a4'],status:'published',gone:false},{key:'proj:p1',src:'proj',title:'مشروع الحروف',levels:['a4'],status:'published',gone:false},{key:'ready:r1',src:'ready',title:'جاهز خارج',levels:['g1'],status:'published',gone:false}],
   support_levels:[],
   skills:[{id:'S1',slug:'a',name:'ربط الحرف بصوته',status:'active',levels:['a4'],sort:1},{id:'S2',slug:'b',name:'التعرف على الحروف',status:'active',levels:['a4'],sort:2},{id:'S3',slug:'c',name:'العد',status:'active',levels:['a4'],sort:3},{id:'S4',slug:'d',name:'الجمع',status:'active',levels:['g1'],sort:4},{id:'S5',slug:'e',name:'مهارة مخفية',status:'hidden',levels:['g1'],sort:5}]};
  window.DB=DB;
  const q=(tb)=>{const st={ord:[],f:[],rg:null};const api={select(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},range(a,b){st.rg=[a,b];return api},order(c,o){st.ord.push([c,!o||o.ascending!==false]);return api},then(res){let r=(DB[tb]||[]).filter(x=>st.f.every(f=>f(x)));st.ord.slice().reverse().forEach(([c,a])=>r=r.sort((x,y)=>(x[c]>y[c]?1:x[c]<y[c]?-1:0)*(a?1:-1)));if(st.rg)r=r.slice(st.rg[0],st.rg[1]+1);res({data:JSON.parse(JSON.stringify(r)),error:null})}};return api};
  window.sb={from:q,rpc:async(n,a)=>{window.calls.push([n,JSON.parse(JSON.stringify(a||{}))]);if(n==='quality_my')return{data:window.ME};
   if(window.NEXT_ERR){const e=window.NEXT_ERR;window.NEXT_ERR=null;return{error:{message:e}}}
   if(n==='support_group_update'){Object.assign(DB.support_groups.find(g=>g.slug===a.p_slug),{name:a.p_name,descr:a.p_descr});return{data:null}}
   if(n==='support_group_status'){DB.support_groups.find(g=>g.slug===a.p_slug).status=a.p_status;return{data:null}}
   if(n==='support_group_order'){a.p_slugs.forEach((s,i)=>DB.support_groups.find(g=>g.slug===s).sort=i+1);return{data:null}}
   if(n==='support_skill_add'){DB.support_group_skills.push({group_slug:a.p_group,skill_id:a.p_skill,ord:9});return{data:null}}
   if(n==='support_skill_remove'){DB.support_group_skills=DB.support_group_skills.filter(x=>!(x.group_slug===a.p_group&&x.skill_id===a.p_skill));return{data:null}}
   if(n==='support_skills_order'){a.p_ids.forEach((id,i)=>DB.support_group_skills.find(x=>x.group_slug===a.p_group&&x.skill_id===id).ord=i+1);return{data:null}}
   if(n==='support_public')return{data:{diff:{'bank:b1':'easy'}}};
   if(n==='support_set_level'){DB.support_levels=DB.support_levels.filter(x=>x.item_key!==a.p_key);if(a.p_diff)DB.support_levels.push({item_key:a.p_key,difficulty:a.p_diff});return{data:null}}
   if(n==='skill_save'){if(/متقارب/.test(a.p.name))return{error:{message:'توجد مهارة مماثلة'}};DB.skills.push({id:'NS',slug:'x',name:a.p.name,status:'active',levels:a.p.levels,sort:9});return{data:{id:'NS'}}}
   if(n==='support_check')return{data:[{t:'noitems',group:'math',skill:'S3',msg:'المهارة «العد» في «دعم الرياضيات» بلا موارد منشورة، لذلك لا تظهر للزوار.'}]};
   return{data:null}}};
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__go=(n)=>{window.went=n};
  window.__zp={sb:window.sb,$,$$,esc,toast:m=>window.msgs.push(m),SUB:{},ask:()=>Promise.resolve(window.ASK_YES)};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/supportadm.js','utf8')});
 const open=async()=>{await p.evaluate(()=>window.__zp.SUB.supportadm.fn(document.getElementById('m')));await p.waitForTimeout(200)};
 const calls=async()=>p.evaluate(()=>window.calls.splice(0));const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));const txt=()=>p.textContent('#m');
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(150)};
 const ov=async(w)=>{const o=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>0)E(VW+' تجاوز أفقي '+w)};
 const T=(c,m)=>{if(!c)E(VW+' FAIL '+m)};
 await open();let t=await txt();
 T(await p.$$eval('.su-row[data-g]',e=>e.length)===2,'مجموعتان');T(t.includes('ظاهرة')&&t.includes('مخفية'),'الحالات');await ov('list');
 // ترتيب
 await p.evaluate(()=>document.querySelector('.su-row[data-g=math] [data-a=up]').click());await p.waitForTimeout(150);let c=await calls();T(c.find(x=>x[0]==='support_group_order')[1].p_slugs.join()==='math,arabic','ترتيب المجموعات');
 // تعديل نص مرفوض
 await ck('.su-row[data-g=arabic] [data-a=edit]');await p.fill('#sfn','دعم اللغة العربية');await p.evaluate(()=>window.NEXT_ERR='QUALITY: لا تستخدم ألفاظًا تصف الطفل');await ck('#sfsave');T((await txt()).includes('لا تستخدم ألفاظًا'),'خطأ القاعدة يظهر');
 await ck('#sfsave');c=await calls();T(c.filter(x=>x[0]==='support_group_update').length===2,'حفظ');
 // مهارات
 await p.evaluate(()=>document.querySelector('.su-row[data-g=arabic] [data-a=skills]').click());await p.waitForTimeout(150);t=await txt();
 T(await p.$$eval('.su-row[data-s]',e=>e.length)===2,'مهارتان');
 const opts=await p.$$eval('#sadd option',e=>e.map(x=>x.textContent));T(opts.join()==='العد,الجمع'&&!opts.includes('مهارة مخفية')&&!opts.includes('ربط الحرف بصوته'),'المرشحون: منشورة وغير مضافة فقط: '+opts);
 await p.evaluate(()=>document.querySelector('.su-row[data-s=S2] [data-a=up]').click());await p.waitForTimeout(150);c=await calls();T(c.find(x=>x[0]==='support_skills_order')[1].p_ids.join()==='S2,S1','ترتيب المهارات قائمة كاملة');
 await ck('#saddgo');c=await calls();T(c.find(x=>x[0]==='support_skill_add')&&c.find(x=>x[0]==='support_skill_add')[1].p_group==='arabic','إضافة مهارة');
 await p.evaluate(()=>window.ASK_YES=false);await p.evaluate(()=>document.querySelector('.su-row[data-s=S1] [data-a=rm]').click());await p.waitForTimeout(100);c=await calls();T(!c.find(x=>x[0]==='support_skill_remove'),'الإلغاء لا يزيل');
 await p.evaluate(()=>window.ASK_YES=true);await p.evaluate(()=>document.querySelector('.su-row[data-s=S1] [data-a=rm]').click());await p.waitForTimeout(100);c=await calls();T(c.find(x=>x[0]==='support_skill_remove'),'الإزالة بعد التأكيد');
 T((await txt()).includes('فتح المجموعة في الصفحة العامة'),'رابط المعاينة');await ov('skills');
 // إظهار/إخفاء
 await ck('#suback');await p.evaluate(()=>document.querySelector('.su-row[data-g=math] [data-a=show]').click());await p.waitForTimeout(150);c=await calls();T(c.find(x=>x[0]==='support_group_status')[1].p_status==='active','إظهار');
 await p.evaluate(()=>document.querySelector('.su-row[data-g=arabic] [data-a=hide]').click());await p.waitForTimeout(150);c=await calls();T(c.find(x=>x[0]==='support_group_status')[1].p_status==='hidden','إخفاء');
 // مراجعة
 await ck('#sutabs [data-t=review]');await p.waitForTimeout(200);t=await txt();T(t.includes('بلا موارد منشورة')&&t.includes('فحص جودة المركز'),'الفحص');await ov('review');
 // مستوى الأنشطة
 await p.evaluate(()=>{DB.support_group_skills.push({group_slug:'arabic',skill_id:'S1',ord:3})});await open();await ck('#sutabs [data-t=levels]');await p.waitForTimeout(300);t=await txt();
 T(t.includes('2 نشاطًا')||t.includes('٢ نشاطًا'),'نشاطان بلا مستوى داخل مهارات المركز (الخارجي لا يُحتسب): '+t.slice(0,260));
 T(!t.includes('جاهز خارج'),'نشاط مهارة ليست في أي مجموعة لا يظهر');T(t.includes('دعم بسيط (من بيانات النشاط)'),'مستوى النشاط من بياناته ثابت');
 await p.selectOption('.su-row[data-k="vid:v1"] [data-f=lv]','mid');await p.waitForTimeout(150);c=await calls();const sl=c.find(x=>x[0]==='support_set_level');T(sl&&sl[1].p_key==='vid:v1'&&sl[1].p_diff==='mid','حفظ المستوى');
 await p.selectOption('.su-row[data-k="vid:v1"] [data-f=lv]','');await p.waitForTimeout(150);c=await calls();T(c.find(x=>x[0]==='support_set_level')[1].p_diff===null,'إزالة المستوى');
 await ov('levels');
 // إنشاء مهارة
 await ck('#sutabs [data-t=create]');await p.waitForTimeout(150);T(await p.$$eval('[data-go]',e=>e.map(x=>x.dataset.go).join())==='skillsadm,bankadm,quizadm,libadm,activitiesadm,qualityadm','الاختصارات');
 await ck('[data-go=bankadm]');T((await p.evaluate(()=>window.went))==='bankadm','الاختصار ينقل لإدارة بنك الأنشطة');
 await p.fill('#cnn','مهارة جديدة للتجربة');await p.evaluate(()=>document.querySelector('#cnl input[value=a4]').click());await ck('#cngo');await p.waitForTimeout(200);c=await calls();
 const ss=c.find(x=>x[0]==='skill_save'),sa=c.find(x=>x[0]==='support_skill_add');T(ss&&ss[1].p.levels.join()==='a4'&&sa&&sa[1].p_skill==='NS','إنشاء ثم إضافة للمجموعة: '+JSON.stringify([ss,sa]));
 await p.fill('#cnn','مهارة متقاربة');await p.evaluate(()=>{document.querySelector('#cnl input[value=a4]').click()});await ck('#cngo');T((await txt()).includes('توجد مهارة مماثلة'),'رفض القاعدة للمتقارب يظهر');await ov('create');
 // صلاحيات
 await p.evaluate(()=>{window.ME={roles:['content_editor'],name:'ح'}});await open();T(await p.$('[data-a=show]')===null,'المحرر لا يرى الإظهار');T(await p.$('[data-a=edit]')!==null,'المحرر يعدل');
 await p.evaluate(()=>{window.ME={roles:[],name:'ز'}});await open();T((await txt()).includes('ليست لديك صلاحية'),'بلا صلاحية');
 await ctx.close();console.log('vw',VW,'done');
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'PASS');process.exit(errs.length?1:0)})();
