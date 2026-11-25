// NODE_PATH=$(npm root -g) node tools/content/find/test_searchadm.js  (خادم 8765 من جذر المستودع)
const {chromium}=require('playwright');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const mk=(slug,title,levels,extra={})=>({slug,title,skill:null,subject:null,cat:'x',icon:'i_puzzle',levels,created_at:'2026-11-06T00:00:00Z',...extra});
const PRODS=[{id:'p1',name:'حروف الهجاء',slug:'s-p1',price:0,file_url:'f.pdf',lib_section:'letters',lib_levels:['a4'],lib_keywords:'حروف',lib_skill:'التعرّف على الحروف',created_at:'2026-11-01T00:00:00Z',pages:3},{id:'p2',name:'ملف بلا مستوى',slug:'s-p2',price:0,file_url:'f.pdf',lib_section:'ws',lib_levels:[],created_at:'2026-11-01T00:00:00Z'}];
const DATA={stories:[mk('story-x','قصة الحروف',['a4'],{topic:'arabic'})],bank_items:[mk('bank-y','نصل الحرف',['a4','a5'],{cat:'arabic'})]};
const OVS=[{src:'bank',slug:'bank-y',hidden:true,keywords:'',skills:'',levels:null}];
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:800}});const p=await ctx.newPage();p.on('pageerror',e=>E('pageerror '+e.message));
await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o)=>r.fulfill({status:200,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m!=='GET')return r.fulfill({status:201,headers:CORS,body:''});
 if(tb==='rp_config')return J([{slug:'arabic',title:'اللغة العربية',data:{words:['حرف']},sort_order:0},{slug:'math',title:'الرياضيات',data:{},sort_order:1}]);if(tb==='search_overrides')return J(OVS);if(tb==='products')return J(PRODS);if(DATA[tb])return J(DATA[tb]);return J([])});
await p.goto('http://localhost:8765/find/');await p.waitForSelector('#fzres .fzcard, #fzres .fzempty');
const W=[];await p.exposeFunction('rec',(o)=>W.push(o));
await p.evaluate(()=>{const mkq=(res)=>{const q={_op:null,_f:[],select(){return q},order(){return q},limit(){return q},eq(c,v){q._f.push([c,v]);return q},gt(c,v){q._f.push([c,v]);return q},ilike(){return q},
  then(ok){let r=res; if(q._op) { window.rec({tb:q._t,op:q._op,row:q._row,f:q._f,opt:q._opt}); r={error:null,data:null}; } return Promise.resolve(r).then(ok)}};return q};
 const data={search_synonyms:[{id:'s1',term:'تسلية',alts:['نشاط'],status:'on',created_at:'2026-11-01'}],search_queries:[{q:'ديناصورات',created_at:new Date().toISOString()},{q:'ديناصورات',created_at:new Date().toISOString()},{q:'فضاء',created_at:new Date().toISOString()}],rp_config:[{slug:'arabic',title:'اللغة العربية'},{slug:'math',title:'الرياضيات'}]};
 const sb={from(t){const q=mkq({error:null,data:data[t]||[]});q._t=t;const w=(op)=>(row,opt)=>{q._op=op;q._row=row;q._opt=opt;return q};q.insert=w('insert');q.update=w('update');q.upsert=w('upsert');q.delete=()=>{q._op='delete';return q};return q}};
 window.__go=()=>{};window.__toasts=[];window.__fails=[];
 window.__zp={sb,$:(s,r)=>(r||document).querySelector(s),$$:(s,r)=>[...(r||document).querySelectorAll(s)],esc:x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])),toast:(m)=>window.__toasts.push(m),sheet:(h)=>{let d=document.getElementById('__sheet');if(d)d.remove();d=document.createElement('div');d.id='__sheet';d.innerHTML=h;document.body.appendChild(d);return d},closeSheet:()=>{const d=document.getElementById('__sheet');if(d)d.remove()},fail:(e)=>window.__fails.push(String(e&&e.message||e)),SUB:{}};
 window.confirm=()=>true;const m=document.createElement('div');m.id='__m';document.body.appendChild(m)});
await p.addScriptTag({path:__dirname+'/../../../manage/searchadm.js'});
const cl=(sel)=>p.evaluate((s)=>document.querySelector(s).click(),sel);const T=await p.evaluate(()=>window.__searchTest&&1);if(!T)E('لا مدقّق');
const ck=(f,c)=>p.evaluate(([f,c])=>window.__searchTest.chkItem(f,c),[f,c]);const cs=(f)=>p.evaluate((f)=>window.__searchTest.chkSyn(f),f);const C={doms:['arabic','math']};
if((await ck({title:'قصة جيدة',keywords:'قصة، حروف',skills:'القراءة',ctype:'story',domain:'arabic',levels:['a4']},C)).length)E('سليم رُفض '+await ck({title:'قصة جيدة',keywords:'قصة، حروف',levels:['a4']},C));
for(const [n,f] of [['عنوان قصير',{title:'قص'}],['رابط في العنوان',{title:'زر https://x.com الآن'}],['بريد',{keywords:'a@b.com'}],['رقم طويل',{keywords:'01234567'}],['كلمة طويلة',{keywords:'ا'.repeat(31)}],['نوع وهمي',{ctype:'zzz'}],['مجال وهمي',{domain:'zzz'}],['صف خامس',{levels:['g5']}],['عمر سبعة',{levels:['a7']}],['بلا مستوى',{levels:[],mustLevel:true}],['ملاحظة طويلة',{note:'ا'.repeat(201)}]])if(!(await ck(f,C)).length)E('قُبل: '+n);
if((await cs({term:'تسلية',alts:['نشاط','لعب'],status:'on'})).length)E('بديل سليم رُفض');
for(const [n,f] of [['بلا بدائل',{term:'تسلية',alts:[],status:'on'}],['بديل مطابق',{term:'قصة',alts:['القصة'],status:'on'}],['رابط',{term:'http://x.com',alts:['ب'],status:'on'}],['9 بدائل',{term:'كلمة',alts:Array(9).fill('بديل'),status:'on'}],['حالة وهمية',{term:'كلمة',alts:['بديل'],status:'x'}]])if(!(await cs(f)).length)E('قُبل: '+n);
// الواجهة
await p.evaluate(()=>window.__zp.SUB.searchadm.fn(document.getElementById('__m')));await p.waitForSelector('#scb .item');await p.waitForFunction(()=>{const n=document.querySelector('#scb [data-k]');return n&&n.onclick});
let txt=await p.textContent('#scb');if(!txt.includes('بلا مستوى صالح'))E('تنبيه ملف بلا مستوى');if(!txt.includes('مخفي من البحث'))E('عنصر مخفي غير ظاهر للمسؤول');
const n=await p.$$eval('#scb .item',e=>e.length);if(n<4)E('عناصر المحتوى '+n);
// تعديل ملف مكتبة
await cl('#scb [data-k="lib:s-p1"]');await p.waitForSelector('#sc1');await p.fill('#sc1','حروف الهجاء 2');await p.fill('#sc2','تلوين، هجاء');await cl('#scs');await p.waitForTimeout(400);
let w=W.filter(x=>x.tb==='products');if(w.length!==1||w[0].op!=='update'||w[0].row.name!=='حروف الهجاء 2'||w[0].row.lib_keywords!=='تلوين، هجاء'||JSON.stringify(w[0].f)!=='[["id","p1"]]')E('تحديث ملف المكتبة '+JSON.stringify(w));
const ov=W.filter(x=>x.tb==='search_overrides'&&x.op==='upsert');if(ov.length!==1||ov[0].row.src!=='lib'||ov[0].row.slug!=='s-p1'||ov[0].row.hidden!==false||ov[0].row.keywords!=='')E('override ملف المكتبة '+JSON.stringify(ov));
// قيمة غير صالحة لا تُكتب
await p.waitForFunction(()=>{const n=document.querySelector('#scb [data-k="stories:story-x"]');return n&&n.onclick});W.length=0;await cl('#scb [data-k="stories:story-x"]');await p.waitForSelector('#sc1');await p.fill('#sc2','a@b.com');await cl('#scs');await p.waitForTimeout(200);if(W.length)E('كُتبت قيمة غير صالحة '+JSON.stringify(W));if(!(await p.textContent('#sce')).includes('كلمة مفتاحية غير صالحة'))E('رسالة التحقق');
await p.fill('#sc2','قصة، أخلاق');await p.$$eval('#sc6 .chip',e=>e.forEach(x=>{if(x.classList.contains('on'))x.click()}));await cl('#scs');await p.waitForTimeout(200);if(W.length)E('كُتب بلا مستوى');
await cl('#sc6 [data-l=a5]');await cl('#sc7');await cl('#scs');await p.waitForTimeout(400);
const st=W.filter(x=>x.tb==='stories');if(st.length!==1||JSON.stringify(st[0].row.levels)!=='["a5"]'||JSON.stringify(st[0].f)!=='[["slug","story-x"]]')E('تحديث القصة '+JSON.stringify(st));
const so=W.filter(x=>x.tb==='search_overrides');if(so.length!==1||so[0].row.hidden!==true||so[0].row.keywords!=='قصة، أخلاق')E('إخفاء/كلمات القصة '+JSON.stringify(so));
// كلمات بديلة
await p.evaluate(()=>{TAB='x'});await cl('#sct [data-t=syn]');await p.waitForSelector('#scb .item');if(!(await p.textContent('#scb')).includes('تسلية'))E('قائمة البدائل');
W.length=0;await cl('#ssn');await p.fill('#sy1','ممتع');await p.fill('#sy2','نشاط، لعبة');await cl('#sys');await p.waitForTimeout(300);const sy=W.find(x=>x.tb==='search_synonyms');if(!sy||sy.op!=='insert'||sy.row.term!=='ممتع'||sy.row.alts.length!==2)E('إضافة بديل '+JSON.stringify(sy));
W.length=0;await cl('[data-i="s1"]');await cl('#syd');await p.waitForTimeout(300);if(!W.some(x=>x.tb==='search_synonyms'&&x.op==='delete'))E('حذف بديل');
// مراجعة النتائج
await cl('#sct [data-t=rev]');await p.fill('#srq','حروف');await p.waitForSelector('#srr .item');if(!(await p.textContent('#srr')).includes('حروف الهجاء'))E('مراجعة النتائج');
W.length=0;await cl('#srr [data-h]');await p.waitForTimeout(300);if(!W.some(x=>x.tb==='search_overrides'&&x.row.hidden===true))E('إخفاء من المراجعة');
// بلا نتائج
await cl('#sct [data-t=zero]');await p.waitForSelector('#scb .item');const zt=await p.textContent('#scb');if(!zt.includes('ديناصورات')||!zt.includes('2 مرة')||!zt.includes('فضاء'))E('كلمات بلا نتائج '+zt.slice(0,120));
W.length=0;await cl('[data-d="فضاء"]');await p.waitForTimeout(300);if(!W.some(x=>x.tb==='search_queries'&&x.op==='delete'&&JSON.stringify(x.f)==='[["q","فضاء"]]'))E('حذف كلمة من السجل');
const fl=await p.evaluate(()=>window.__fails);if(fl.length)E('أخطاء '+fl);
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
