// NODE_PATH=$(npm root -g) node tools/content/packs/test_packsadm.js   (لوحة إدارة الحزم: واجهة حقيقية + قاعدة بيانات وهمية في الذاكرة)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();
 const jserr=[];p.on('pageerror',e=>jserr.push(String(e)));
 await p.setContent('<!doctype html><meta charset=utf-8><body dir=rtl><div id="m"></div></body>');
 await p.addScriptTag({content:`
  window.msgs=[];window.confirmAns=true;window.confirm=()=>window.confirmAns;
  let n=0;const uid=()=>'id'+(++n);
  const DB={packs:[{id:'pA',slug:'pk-a',title:'حزمة منشورة',summary:'',cover:'images/zad/i_book.webp',levels:['a5'],dom:'arabic',skills:[],est_min:null,status:'published',sort_order:10,starts:4},{id:'pB',slug:'pk-b',title:'مسودة بها مورد ميت',summary:'',cover:'images/zad/i_book.webp',levels:['a5'],dom:'arabic',skills:[],est_min:null,status:'draft',sort_order:20,starts:0}],
   pack_items:[{pack_id:'pA',key:'bank:b1',pos:1},{pack_id:'pA',key:'bank:b2',pos:2},{pack_id:'pA',key:'bank:b3',pos:3},{pack_id:'pB',key:'bank:b1',pos:1},{pack_id:'pB',key:'bank:gone',pos:2}]};
  window.DB=DB;
  const q=(tb)=>{const st={tb,op:'select',f:[],ord:null,pay:null,opt:null,single:false};
   const api={select(c){if(st.op==='select')st.op='select';return api},order(c,o){st.ord=c;return api},limit(){return api},eq(c,v){st.f.push(r=>r[c]===v);return api},in(c,a){st.f.push(r=>a.includes(r[c]));return api},single(){st.single=true;return api},
    insert(r){st.op='insert';st.pay=r;return api},update(r){st.op='update';st.pay=r;return api},upsert(r,o){st.op='upsert';st.pay=r;st.opt=o;return api},delete(){st.op='delete';return api},
    then(res,rej){try{res(run(st))}catch(e){rej(e)}}};return api};
  function run(st){const T=DB[st.tb];
   if(st.op==='select'){let r=T.filter(x=>st.f.every(f=>f(x)));if(st.ord)r=r.slice().sort((a,b)=>a[st.ord]-b[st.ord]);return{data:JSON.parse(JSON.stringify(r)),error:null}}
   if(st.op==='insert'){if(st.tb==='packs'&&T.some(x=>x.slug===st.pay.slug))return{error:{code:'23505'}};const row=Object.assign({id:uid(),starts:0},st.pay);T.push(row);return{data:st.single?{id:row.id}:[{id:row.id}],error:null}}
   if(st.op==='update'){T.filter(x=>st.f.every(f=>f(x))).forEach(x=>Object.assign(x,st.pay));return{error:null}}
   if(st.op==='upsert'){st.pay.forEach(r=>{const e=T.find(x=>x.pack_id===r.pack_id&&x.key===r.key);if(e)Object.assign(e,r);else T.push(Object.assign({},r))});return{error:null}}
   if(st.op==='delete'){DB[st.tb]=T.filter(x=>!st.f.every(f=>f(x)));if(st.tb==='packs')DB.pack_items=DB.pack_items.filter(i=>DB.packs.some(p=>p.id===i.pack_id));return{error:null}}}
  const $=(s,r)=>(r||document).querySelector(s),$$=(s,r)=>[...(r||document).querySelectorAll(s)];
  const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.__zp={sb:{from:q},$,$$,esc,toast:m=>window.msgs.push(m),SUB:{}};
  const LVN={a2:'سنة إلى سنتين',a3:'3 سنوات',a4:'4 سنوات',a5:'5 سنوات',a6:'6 سنوات',g1:'الصف الأول',g2:'الصف الثاني',g3:'الصف الثالث',g4:'الصف الرابع'};
  const mk=(k,t,lv,o={})=>Object.assign({key:k,title:t,lv,ct:'res',paid:false,hidden:false,skill:'',it:null},o);
  const ALL=[mk('bank:b1','نصل الحرف ١',['a5']),mk('bank:b2','نصل الحرف ٢',['a5','a6']),mk('bank:b3','ذاكرة الكلمات',['a5']),mk('bank:b4','حرف الباء',['a5']),mk('bank:b5','حرف التاء',['a5','a6']),mk('bank:b6','حروف الصف الأول',['g1']),mk('bank:hid','مخفي',['a5'],{hidden:true}),mk('bank:paid','ورقة مدفوعة',['a5'],{paid:true})];
  window.ZFIND={load:async()=>{},X:{all:ALL,items:ALL.filter(i=>!i.hidden),doms:[{slug:'arabic',title:'اللغة العربية'},{slug:'math',title:'الرياضيات'}]},LV:Object.entries(LVN),LVN,LVK:Object.keys(LVN),CT:{res:'موارد تعليمية'},
   search:(q,F)=>ALL.filter(i=>!i.hidden&&i.lv.some(l=>F.lv.has(l))&&(i.title.includes(q)||q==='حرف'&&i.title.includes('حرف'))).map(it=>({it,score:1}))};
 `});
 await p.addScriptTag({content:fs.readFileSync('manage/packsadm.js','utf8')});
 const go=async()=>{await p.evaluate(()=>window.__zp.SUB.packsadm.fn(document.getElementById('m')));await p.waitForTimeout(80)};
 const ck=async(s)=>{await p.evaluate((s)=>document.querySelector(s).click(),s);await p.waitForTimeout(60)};
 const msgs=async()=>p.evaluate(()=>window.msgs.splice(0));
 const db=()=>p.evaluate(()=>JSON.parse(JSON.stringify(window.DB)));
 const txt=()=>p.textContent('#m');
 // 1) القائمة وحالة الموارد
 await go();let t=await txt();if(!t.includes('حزمة منشورة')||!t.includes('3 مورد صالح')||!t.includes('بدأها 4'))E('القائمة '+t.slice(0,300));
 if(!t.includes('مسودة بها مورد ميت')||!t.includes('1 به مشكلة'))E('مورد ميت لا يظهر '+t.slice(0,300));
 if(!t.includes('لا يوجد اشتراك'))E('توضيح الاشتراك');
 // الفلاتر
 await ck('#pkst [data-s=draft]');t=await txt();if(t.includes('حزمة منشورة')||!t.includes('مسودة بها'))E('فلتر المسودات');await ck('#pkst [data-s=""]');
 // 2) نشر حزمة بها مورد ميت يُرفض
 await p.evaluate(()=>document.querySelector('[data-e=pB]').click());await p.waitForTimeout(60);
 await p.selectOption('#pst','published');await ck('#psave');let m=(await msgs()).join('|');if(!m.includes('لا يمكن النشر'))E('نشر بمورد ميت سُمح '+m);
 let d=await db();if(d.packs.find(x=>x.id==='pB').status!=='draft')E('تغيّرت الحالة رغم الرفض');
 // إزالة المورد الميت ثم رفض النشر لقلة الموارد
 await ck('[data-x="1"]');await p.selectOption('#pst','published');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('3 موارد صالحة'))E('نشر بمورد واحد سُمح '+m);
 // إضافة موارد من البحث (تظهر المناسبة للمستوى فقط، لا المخفي ولا غير المطابق)
 await p.fill('#pq','حرف');await p.waitForTimeout(450);let r=await p.$$eval('#pres [data-a]',e=>e.map(x=>x.dataset.a));
 if(r.includes('bank:hid')||r.includes('bank:b6')||r.includes('bank:b1'))E('نتائج الإضافة تشمل غير مناسب '+r);if(!r.includes('bank:b4'))E('نتائج الإضافة '+r);
 await ck('#pres [data-a="bank:b4"]');await p.fill('#pq','حرف');await p.waitForTimeout(450);await ck('#pres [data-a="bank:b5"]');
 await p.selectOption('#pst','published');await ck('#ppv');if(!(await p.textContent('#pprev')).includes('الحزمة جاهزة للنشر'))E('معاينة '+await p.textContent('#pprev'));
 // ترتيب: رفع الثالث للأعلى ثم حفظ (تحديث في المكان بلا نسخة جديدة)
 await ck('[data-u="2"]');const nPacks=(await db()).packs.length;await ck('#psave');m=(await msgs()).join('|');if(!m.includes('تم الحفظ'))E('الحفظ '+m);
 d=await db();if(d.packs.length!==nPacks)E('أُنشئت نسخة مكررة');const ks=d.pack_items.filter(x=>x.pack_id==='pB').sort((a,b)=>a.pos-b.pos).map(x=>x.key);if(ks.join()!=='bank:b1,bank:b5,bank:b4')E('ترتيب الموارد بعد الحفظ '+ks);
 if(d.packs.find(x=>x.id==='pB').status!=='published')E('لم تُنشر الحزمة الصالحة');
 // 3) حزمة جديدة: تحقق الإدخال
 await ck('#pknew');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('عنوان الحزمة'))E('عنوان فارغ '+m);
 await p.fill('#pt','حزمة جديدة تجريبية');await p.fill('#ps','Bad Slug!');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('رمز الحزمة'))E('رمز غير صالح '+m);
 await p.fill('#ps','pk-a');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('مستخدم'))E('رمز مكرر '+m);
 await p.fill('#ps','pk-new');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('اختر عمرًا'))E('بلا مستوى '+m);
 const lvb=await p.$$eval('#plv [data-l]',e=>e.map(x=>x.dataset.l));if(lvb.join()!=='a2,a3,a4,a5,a6,g1,g2,g3,g4')E('المستويات المتاحة '+lvb);
 await ck('#plv [data-l=a5]');await p.fill('#pq','حرف');await p.waitForTimeout(450);await ck('#pres [data-a]');
 await p.selectOption('#pst','published');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('3 موارد صالحة'))E('نشر بمورد واحد '+m);
 await p.selectOption('#pst','draft');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('تم إنشاء'))E('إنشاء مسودة '+m);
 d=await db();const np=d.packs.find(x=>x.slug==='pk-new');if(!np||np.status!=='draft'||np.levels.join()!=='a5'||d.pack_items.filter(x=>x.pack_id===np.id).length!==1)E('الحزمة المنشأة '+JSON.stringify(np));
 // مستوى لا يناسب الموارد يمنع النشر
 await p.evaluate((id)=>document.querySelector('[data-e="'+id+'"]').click(),np.id);await p.waitForTimeout(60);
 await ck('#plv [data-l=a5]');await ck('#plv [data-l=g1]');await p.selectOption('#pst','published');await ck('#psave');m=(await msgs()).join('|');if(!m.includes('لا يمكن النشر'))E('مستوى غير مناسب سُمح '+m);
 await ck('#pkback');
 // 4) حذف الحزمة بتأكيد؛ الإلغاء لا يحذف
 await p.evaluate((id)=>document.querySelector('[data-e="'+id+'"]').click(),np.id);await p.waitForTimeout(60);await p.evaluate(()=>{window.confirmAns=false});await ck('#pdel');if(!(await db()).packs.some(x=>x.slug==='pk-new'))E('حُذفت بلا تأكيد');
 await p.evaluate(()=>{window.confirmAns=true});await ck('#pdel');d=await db();if(d.packs.some(x=>x.slug==='pk-new')||d.pack_items.some(x=>x.pack_id===np.id))E('لم تُحذف الحزمة وقائمة مواردها');
 // 5) نطاق الفئات في بيانات الاختبار
 if(await p.evaluate(()=>window.__packsTest.validate({title:'عنوان صالح',slug:'ok-slug',levels:['g5'],keys:[],status:'draft'},{ok:0,dead:0},new Set())===''))E('قبل مستوى الصف الخامس');
 if(jserr.length)E('أخطاء JS '+jserr);
 await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
