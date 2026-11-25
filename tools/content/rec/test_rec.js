// NODE_PATH=$(npm root -g) node tools/content/rec/test_rec.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const ROOT=__dirname+'/../../../';
const DOM=[['arabic','اللغة العربية',{words:['حرف','حروف','قراءة'],src:['stories:arabic'],skills:[],quiz:[]}],['math','الرياضيات',{words:['جمع','عد','أرقام'],src:[],skills:[],quiz:[]}],['science','العلوم',{words:['حواس','تجربة'],src:[],skills:[],quiz:[]}],['arts','الفنون',{words:['تلوين','رسم'],src:[],skills:[],quiz:[]}],['life','المهارات الحياتية',{words:[],src:['life'],skills:[],quiz:[]}]];
const CFG=DOM.map(([slug,title,d])=>({slug,kind:'domain',title,data:d,sort_order:1}))
 .concat([['rr_continue','مقترح لأن طفلك تدرب على «{skill}» سابقًا.'],['rr_continue_domain','مقترح لأن طفلك مارس مجال «{domain}» مؤخرًا.'],['rr_review','لنراجع «{skill}» من خلال نشاط ممتع.'],['rr_explore','نشاط جديد مناسب لمرحلة طفلك.'],['rr_general','اقتراح عام مناسب لعمر طفلك.'],['rr_again','لنعيد «{title}» بطريقة مختلفة.']].map(([slug,text])=>({slug,kind:'rreason',title:slug,data:{text}})))
 .concat([{slug:'rec_mode',kind:'rset',title:'m',data:{mode:'auto'}}]);
const mk=(slug,title,skill,levels,extra={})=>({slug,title,skill,subject:'x',cat:'x',icon:'i_puzzle',levels,...extra});
const DATA={
 bank_items:[mk('b_let','نشاط الحروف','تمييز الحروف',['a4','a5','a6']),mk('b_add','بطاقة الجمع','جمع وطرح',['a5','a6','g1','g2']),mk('b_col','ألوان وأشكال','الألوان',['a2','a3']),mk('b_g5','عنصر خارج النطاق','x',['g5','g6'])],
 proj_items:[mk('p_art','مشروع تلوين','تلوين وإبداع',['a5','a6','g1']),mk('p_gr','مشروع علوم','تجربة علمية',['g1','g2','g3','g4'])],
 life_items:[mk('l_1','ترتيب الغرفة','x',['a4','a5','a6','g1'])],ready_items:[],val_items:[],video_items:[],song_items:[mk('s_1','نشيد الحروف','الحروف',['a2','a3','a4'])],
 stories:[mk('st_1','قصة الحروف','x',['a4','a5','a6'],{topic:'arabic',cover_url:null}),mk('st_2','قصة الصف الثالث','x',['g3','g4'],{topic:'arabic'})],
 activities:[{slug:'ac_1',title:'ورقة حروف',skill:'تمييز الحروف',subject:'اللغة العربية',cat:'x',minutes:10,image_url:null,summary:'',ages:[5,6],grades:[]},{slug:'ac_2',title:'ورقة جمع',skill:'جمع وطرح',subject:'الرياضيات',cat:'x',minutes:null,image_url:null,summary:'',ages:[],grades:[1,2]}]
};
const T=(s)=>new Date(s+'T10:00:00+04:00').getTime();
const kid1={name:'سارة',age:'5',acts:{ac_1:{d:'2026-11-22',how:'platform'}},bank:{done:{}},stories:{},quiz:{h:{}},rec:{}};
const kid2={name:'ليث',age:'8',acts:{},rec:{}};
const seed={cur:'k1',kids:{k1:kid1,k2:kid2}};
function filt(tb,u){const or=(u.search.match(/or=\(([^&]*)\)/)||[])[1];if(!or)return DATA[tb]||[];const o=decodeURIComponent(or);
 const L=(o.match(/levels\.cs\.\{(\w+)\}/)||[])[1];let rows=DATA[tb]||[];
 if(tb==='activities'){const a=o.match(/ages\.cs\.\{(\d)\}/),g=o.match(/grades\.cs\.\{(\d)\}/),ov=o.match(/ages\.ov/);return rows.filter(r=>a?r.ages.includes(+a[1]):g?r.grades.includes(+g[1]):ov?r.ages.some(x=>x<=2):false)}
 return rows.filter(r=>(r.levels||[]).includes(L))}
(async()=>{const b=await chromium.launch();const events=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let ovr=[],cfgOff=false,empty=false,mode='auto';
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'){if(tb==='rec_events')events.push(JSON.parse(r.request().postData()));return r.fulfill({status:201,headers:CORS,body:''})}
  if(tb==='rp_config')return J(CFG.map(x=>x.slug==='rec_mode'?{...x,data:{mode}}:x));if(tb==='rec_overrides')return J(ovr);
  if(DATA[tb])return J(empty?[]:filt(tb,u));return J([])});
 await p.route(/js\/store\.js/,r=>r.abort());// الرئيسية المبنيّة مسبقًا (الخادم الحقيقي يعيد رسم simpleHome من views.js وفيه القسم نفسه)
 await p.route(/games\/catalog\.json/,r=>r.fulfill({status:200,headers:CORS,contentType:'application/json',body:empty?'[]':fs.readFileSync(ROOT+'games/catalog.json')}));
 await p.route(/\/zad-store\//,r=>{if(/js\/store\.js/.test(r.request().url()))return r.abort();const f=ROOT+new URL(r.request().url()).pathname.replace(/^\/zad-store\//,'');if(fs.existsSync(f)&&fs.statSync(f).isFile()){const ext=f.split('.').pop();return r.fulfill({status:200,contentType:{js:'text/javascript',css:'text/css',html:'text/html',svg:'image/svg+xml',webp:'image/webp',json:'application/json'}[ext]||'application/octet-stream',body:fs.readFileSync(f)})}return r.fulfill({status:404,body:''})});
 const B='http://localhost:8765/';
 const setKid=async(s)=>{await p.goto(B+'next/');await p.evaluate(([s])=>{localStorage.clear();if(s)localStorage.setItem('zad-learn-v3',JSON.stringify(s))},[s])};
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const cards=async()=>{await p.$$eval('#nxrec img',i=>i.forEach(x=>{x.loading='eager';x.scrollIntoView()}));await p.waitForTimeout(600);return cards0()};
 const cards0=()=>p.$$eval('#nxrec .rcard',c=>c.map(x=>({k:x.dataset.k,t:x.querySelector('h3').textContent,why:x.querySelector('.rwhy')&&x.querySelector('.rwhy').textContent,tag:x.querySelector('.rtag').textContent,href:x.querySelector('.rgo').href,hasHide:!!x.querySelector('.rhide'),hasLater:!!x.querySelector('.rlater'),img:x.querySelector('img').complete&&x.querySelector('img').naturalWidth>0})));
 const wait=()=>p.waitForSelector('#nxrec .rcard, #nxrec .rempty, #nxrec .rask',{timeout:8000});
 // 1) زائر بلا بيانات: يُسأل عن المستوى فقط
 await setKid(null);await p.goto(B+'next/');await wait();
 if(!(await p.$('#nxrec .rask')))E(W+' لم يُطلب المستوى');
 const lvbtns=await p.$$eval('.rlv',x=>x.map(y=>y.dataset.l).join());if(lvbtns!=='a2,a3,a4,a5,a6,g1,g2,g3,g4')E(W+' مستويات خارج النطاق: '+lvbtns);
 await p.click('.rlv[data-l=a5]');await p.waitForSelector('#nxrec .rcard');await ov('next');
 let cs=await cards();if(!cs.length)E(W+' لا توصيات عامة');
 if(!(await p.textContent('#nxrec')).includes('اقتراحات عامة'))E(W+' لم يُوضَّح أنها عامة');
 cs.forEach(c=>{if(!c.hasHide||!c.hasLater)E(W+' أزرار الإخفاء ناقصة '+c.t);if(!c.img)E(W+' صورة مفقودة '+c.t);if(!c.why)E(W+' بلا سبب '+c.t);if(c.k.includes('b_g5')||c.k.includes('b_col')||c.k.includes('st_2')||c.k.includes('p_gr'))E(W+' محتوى غير مناسب للعمر '+c.k)});
 if(new Set(cs.map(c=>c.k)).size!==cs.length)E(W+' توصيات مكررة');
 const srcs=cs.map(c=>c.k.split(':')[0]);if(srcs.length>=4&&new Set(srcs).size<2)E(W+' نوع واحد فقط '+srcs);
 for(const c of cs){const u=new URL(c.href);const r=await ctx.request.get('http://localhost:8765'+u.pathname.replace('/zad-store',''));if(r.status()>=400)E(W+' رابط لا يعمل '+c.href)}
 console.log(W,'step عام',cs.map(c=>c.t).join(' | '));
 // 2) إخفاء
 const first=cs[0].k;await p.click(`#nxrec [data-k="${first}"] .rhide`);await p.waitForTimeout(400);cs=await cards();if(cs.some(c=>c.k===first))E(W+' الإخفاء لم يعمل');
 await p.reload();await wait();cs=await cards();if(cs.some(c=>c.k===first))E(W+' الإخفاء لم يثبت بعد التحديث');
 const later=cs[0].k;await p.click(`#nxrec [data-k="${later}"] .rlater`);await p.waitForTimeout(400);if((await cards()).some(c=>c.k===later))E(W+' ليس الآن لم يعمل');
 if(!events.some(e=>e.action==='hide'&&e.slug)||!events.some(e=>e.action==='shown'))E(W+' أحداث التفاعل لم تُسجَّل');
 if(events.some(e=>JSON.stringify(e).match(/سارة|name|kid/)))E(W+' حدث يحمل بيانات طفل');
 // 3) ضغط «ابدأ» يسجل بدء ولا يخفي
 // 4) طفل له سجل: توصيات شخصية بأسباب حقيقية
 await setKid({cur:'k1',kids:{k1:{...kid1,acts:{ac_1:{d:'2026-11-22',how:'platform'}}},k2:kid2}});await p.goto(B+'next/');await wait();cs=await cards();
 if(!cs.length)E(W+' لا توصيات للطفل ذي السجل');if(cs.some(c=>c.k==='acts:ac_1'))E(W+' نشاط مكتمل حديثًا اقترح كجديد');
 const cont=cs.filter(c=>c.tag.includes('متابعة'));if(!cont.length)E(W+' لا توصية متابعة بعد نشاط حروف');
 if(cont.length&&!cont.some(c=>c.why.includes('تمييز الحروف')||c.why.includes('اللغة العربية')))E(W+' سبب المتابعة غير مرتبط بالبيانات: '+cont.map(c=>c.why));
 if(cs.some(c=>c.tag.includes('اقتراح عام')))E(W+' توصية عامة رغم وجود بيانات');
 console.log(W,'step شخصي',cs.map(c=>c.tag+':'+c.t).join(' | '));
 // 5) الإعدادات
 await p.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));
 await p.check('[data-o=arabic]');await p.click('#nxsave');await wait();await p.waitForTimeout(300);cs=await cards();
 if(cs.some(c=>/ورقة حروف|نشاط الحروف|قصة الحروف/.test(c.t)))E(W+' مجال مخفي ما زال يظهر '+cs.map(c=>c.t));
 await p.uncheck('[data-o=arabic]');await p.check('[data-p=arts]');await p.selectOption('#nxvar','high');await p.click('#nxsave');await p.waitForTimeout(400);
 if(!(await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.rec.pref.arts)))E(W+' المجال المفضل لم يُحفظ');
 await p.uncheck('#nxper');await p.click('#nxsave');await p.waitForTimeout(400);cs=await cards();
 if(!(await p.textContent('#nxrec')).includes('اقتراحات عامة'))E(W+' إيقاف الشخصية لم يُظهر عامة');
 await p.check('#nxper');await p.click('#nxsave');
 p.once('dialog',d=>d.accept());await p.click('#nxreset');await p.waitForTimeout(900);
 const rc=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.rec);if(Object.keys(rc.hide).length||Object.keys(rc.pref).length||Object.keys(rc.off).length)E(W+' إعادة الضبط لم تمسح '+JSON.stringify(rc));
 if(!(await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.acts.ac_1)))E(W+' إعادة الضبط حذفت نشاط الطفل!');
 // 6) عزل الأطفال والنطاق: ليث (٨ سنوات = الصف الثاني)
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.kids.k1.rec={hide:{'bank:b_add':1},off:{},pref:{},later:{}};d.cur='k2';localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 await p.goto(B+'next/');await wait();cs=await cards();
 if(!cs.length)E(W+' لا توصيات للصف الثاني');
 cs.forEach(c=>{if(/b_let|st_1|b_col|s_1|p_art|b_g5/.test(c.k))E(W+' عنصر لا يناسب الصف الثاني '+c.k)});
 if(!cs.some(c=>c.k==='bank:b_add'))E(W+' إخفاء الطفل الأول أثر على الثاني');
 if((await p.textContent('#aview')).includes('عنصر خارج النطاق'))E(W+' محتوى خارج النطاق ظهر');
 // 7) لا محتوى مناسب
 empty=true;await p.evaluate(()=>{sessionStorage.clear()});await p.reload();await wait();
 if(!(await p.textContent('#nxrec')).includes('سنضيف المزيد من الأنشطة المناسبة قريبًا')||(await p.$$('#nxrec .rcard')).length)E(W+' حالة عدم وجود محتوى');empty=false;
 // 8) وضع المراجعة قبل الظهور: لا يظهر شيء غير معتمد
 mode='approve';await p.reload();await wait();if((await p.$$('#nxrec .rcard')).length)E(W+' وضع الاعتماد عرض محتوى غير معتمد');
 ovr=[{src:'bank',slug:'b_add',status:'on',levels:['g2'],domain:null,rtype:'explore',priority:3,reason:'مقترح لأن «{title}» يناسب مرحلة طفلك.',note:null}];await p.reload();await wait();cs=await cards();
 if(cs.length!==1||cs[0].k!=='bank:b_add'||!cs[0].why.includes('بطاقة الجمع'))E(W+' عنصر معتمد/سبب مخصص '+JSON.stringify(cs));
 mode='auto';ovr=[{src:'bank',slug:'b_add',status:'off',levels:[],domain:null,rtype:null,priority:0,reason:null,note:null}];await p.reload();await wait();cs=await cards();
 if(cs.some(c=>c.k==='bank:b_add'))E(W+' توصية موقوفة ظهرت');ovr=[];
 // 9) الأماكن الثلاثة
 await p.goto(B+'index.html');await p.evaluate(()=>localStorage.setItem('zad-rec-lv','a5'));
 await p.goto(B+'zad-store/'+'');
 for(const [name,url,sel] of [['الرئيسية','zad-store/index.html','.rec-mount'],['المكتبة','library/','.rec-mount'],['اللغة','language/','.rec-mount[data-domain=arabic]'],['ملف الإنجاز','portfolio/','.pfnext .rec-mount']]){
  await p.goto(B+url);await p.evaluate(()=>{localStorage.removeItem('zad-learn-v3');localStorage.setItem('zad-rec-lv','a5')});await p.reload();
  try{await p.waitForSelector(sel+' .rcard, '+sel+' .rempty',{timeout:9000})}catch{E(W+' لا بطاقات في '+name+' '+await p.evaluate(()=>{const m=document.querySelector('.rec-mount');return m?m.className+'|'+m.innerHTML.slice(0,150):'no mount; url='+location.href}));continue}
  const n=await p.$$eval(sel+' .rcard',x=>x.length);if(name!=='اللغة'&&!n)E(W+' بلا بطاقات '+name);
  if(name==='اللغة'){const t=await p.$$eval(sel+' .rcard h3',x=>x.map(y=>y.textContent));if(t.some(x=>/جمع|تلوين/.test(x)))E(W+' توصية خارج مجال اللغة '+t)}
  const bad=await p.$$eval(sel+' .rcard',x=>x.filter(c=>!/\/next\/|\/(bank|projects|life|ready|activities|stories|songs|videos|values|digital|explore|quizzes|games)\//.test(c.querySelector('.rgo').href)).length);if(bad)E(W+' رابط غريب في '+name);
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+name);
  console.log(W,'step مكان',name,n);
 }
 await ctx.close();
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
