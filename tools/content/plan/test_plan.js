// NODE_PATH=$(npm root -g) node tools/content/plan/test_plan.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const ROOT=__dirname+'/../../../';
const DOM=[['arabic','اللغة العربية',{words:['حرف','حروف','قراءة'],src:['stories:arabic'],skills:[],quiz:[]}],['math','الرياضيات',{words:['جمع','عد','أرقام'],src:[],skills:[],quiz:[]}],['science','العلوم',{words:['حواس','تجربة'],src:[],skills:[],quiz:[]}],['arts','الفنون',{words:['تلوين','رسم'],src:[],skills:[],quiz:[]}],['life','المهارات الحياتية',{words:[],src:['life'],skills:[],quiz:[]}]];
const CFG=DOM.map(([slug,title,d])=>({slug,kind:'domain',title,data:d,sort_order:1,status:'active'}))
 .concat([['rr_continue','مقترح لأن طفلك تدرب على «{skill}» سابقًا.'],['rr_continue_domain','مقترح لأن طفلك مارس مجال «{domain}» مؤخرًا.'],['rr_review','لنراجع «{skill}» من خلال نشاط ممتع.'],['rr_explore','نشاط جديد مناسب لمرحلة طفلك.'],['rr_general','اقتراح عام مناسب لعمر طفلك.'],['rr_again','لنعيد «{title}» بطريقة مختلفة.']].map(([slug,text])=>({slug,kind:'rreason',title:slug,data:{text}})))
 .concat([{slug:'rec_mode',kind:'rset',title:'m',data:{mode:'auto'}},{slug:'plan_rules',kind:'pset',title:'r',data:{maxN:14,defN:{young:3,mid:5,school:5},perDay:{young:1,mid:2,school:2},defDays:{young:3,mid:4,school:4},review:true}},{slug:'pt_mid',kind:'ptpl',title:'أسبوع متوازن (٤ إلى ٦ سنوات)',data:{groups:['mid'],n:4,days:3,doms:['arabic','math','arts'],review:false}}]);
const mk=(slug,title,skill,levels,extra={})=>({slug,title,skill,subject:'x',cat:'x',icon:'i_puzzle',levels,...extra});
const DATA={
 bank_items:[mk('b_let','نشاط الحروف','تمييز الحروف',['a4','a5','a6']),mk('b_add','بطاقة الجمع','جمع وطرح',['a5','a6','g1','g2']),mk('b_cnt','عد الأشياء','عد',['a5']),mk('b_g5','عنصر خارج النطاق','x',['g5','g6']),mk('b_col','ألوان','الألوان',['a2','a3'])],
 proj_items:[mk('p_art','مشروع تلوين','تلوين وإبداع',['a5','a6','g1']),mk('p_dr','رسم الحيوانات','رسم',['a5']),mk('p_sc','تجربة الماء','تجربة علمية',['a5','g1','g2'])],
 life_items:[mk('l_1','ترتيب الغرفة','x',['a4','a5','a6','g1'])],ready_items:[],val_items:[],video_items:[],song_items:[],
 stories:[mk('st_1','قصة الحروف','x',['a4','a5','a6'],{topic:'arabic'}),mk('st_2','قصة الصف الثالث','x',['g3','g4'],{topic:'arabic'})],
 activities:[{slug:'ac_1',title:'ورقة حروف',skill:'تمييز الحروف',subject:'اللغة العربية',cat:'x',minutes:10,image_url:null,summary:'',ages:[5,6],grades:[]}]};
function filt(tb,u){const or=(u.search.match(/or=\(([^&]*)\)/)||[])[1];const sl=(u.search.match(/slug=in\.\(([^)]*)\)/)||[])[1];let rows=DATA[tb]||[];
 if(sl){const w=decodeURIComponent(sl).split(',');return rows.filter(r=>w.includes(r.slug))}
 if(!or)return rows;const o=decodeURIComponent(or),L=(o.match(/levels\.cs\.\{(\w+)\}/)||[])[1];
 if(tb==='activities'){const a=o.match(/ages\.cs\.\{(\d)\}/),g=o.match(/grades\.cs\.\{(\d)\}/);return rows.filter(r=>a?r.ages.includes(+a[1]):g?r.grades.includes(+g[1]):false)}
 return rows.filter(r=>(r.levels||[]).includes(L))}
const NOW=new Date('2026-11-25T10:00:00+04:00');// الأربعاء
const kidA=()=>({name:'سارة',age:'5',acts:{},rec:{}});
const KS=()=>JSON.stringify({cur:'k1',kids:{k1:kidA(),k2:{name:'ليث',age:'8',acts:{}}}});
(async()=>{const b=await chromium.launch();
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
 const W=vp.width,ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>E(W+' pageerror '+e.message));
 let ovr=[],empty=false;const posts=[];let learnPost=null;
 await p.clock.install({time:NOW});
 await p.route(/supabase\.co/,async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});
  if(tb==='learn_saves'){if(m==='POST'){learnPost=JSON.parse(r.request().postData());return r.fulfill({status:201,headers:CORS,body:''})}return J([{updated_at:'2020-01-01T00:00:00Z'}])}
  if(m==='POST'){posts.push([tb,r.request().postData()]);return r.fulfill({status:201,headers:CORS,body:''})}
  if(tb==='rp_config'){const k=(u.search.match(/kind=in\.\(([^)]*)\)/)||[])[1];return J(k?CFG.filter(x=>k.includes(x.kind)):CFG)}if(tb==='rec_overrides')return J(ovr);
  if(DATA[tb])return J(empty?[]:filt(tb,u));return J([])});
 await p.route(/games\/catalog\.json/,r=>r.fulfill({status:200,headers:CORS,contentType:'application/json',body:'[]'}));
 const B='http://localhost:8765/';
 const reset=async(s)=>{await p.goto(B+'plan/');await p.evaluate(([s])=>{localStorage.clear();sessionStorage.clear();if(s)localStorage.setItem('zad-learn-v3',s)},[s]);await p.reload();await p.waitForSelector('#pcreate, .pweek')};
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(W+' overflow '+n)};
 const kid=()=>p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));return d.kids[d.cur]});
 const items=async()=>(await kid()).plan.weeks['2026-11-21'].items;
 const make=async(days,n,extra)=>{await p.click('#pcreate');await p.waitForSelector('.pwiz');await p.click('#wlv [data-l=a5]');
  for(let i=0;i<7;i++){const on=await p.$eval(`#wdy [data-y="${i}"]`,e=>e.classList.contains('on'));if(on!==days.includes(i))await p.click(`#wdy [data-y="${i}"]`)}
  await p.fill('#wn',String(n));if(extra)await extra();await p.click('#wgo')};
 // 1) مستويات المعالج داخل النطاق، والتحقق
 await reset(KS());await p.click('#pcreate');await p.waitForSelector('.pwiz');
 const lv=await p.$$eval('#wlv [data-l]',x=>x.map(y=>y.dataset.l).join());if(lv!=='a2,a3,a4,a5,a6,g1,g2,g3,g4')E(W+' مستويات المعالج '+lv);
 await ov('wizard');
 await p.click('#wlv [data-l=a5]');for(let i=0;i<7;i++){const on=await p.$eval(`#wdy [data-y="${i}"]`,e=>e.classList.contains('on'));if(on)await p.click(`#wdy [data-y="${i}"]`)}
 await p.click('#wgo');if(!(await p.textContent('#wer')).includes('يومًا واحدًا'))E(W+' لا خطأ لعدم اختيار يوم');
 await p.click('#wdy [data-y="1"]');await p.fill('#wn','9');await p.click('#wgo');if(!(await p.textContent('#wer')).includes('الإرهاق'))E(W+' لم يمنع كثرة الأنشطة');
 if(await p.evaluate(()=>!!(JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.plan&&Object.keys(JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.plan.weeks).length)))E(W+' أُنشئت خطة رغم الخطأ');
 // 2) إنشاء خطة صحيحة
 await p.click('#wx');await make([1,2,3,5],5);await p.waitForSelector('.pweek .pcard');await ov('plan');
 let it=await items();if(it.length!==5)E(W+' عدد الأنشطة '+it.length);
 const cnt={};it.forEach(i=>cnt[i.day]=(cnt[i.day]||0)+1);if(Object.values(cnt).some(v=>v>2))E(W+' أكثر من نشاطين في اليوم '+JSON.stringify(cnt));if(it.some(i=>![1,2,3,5].includes(i.day)))E(W+' يوم غير مختار');
 const cardsInfo=await p.$$eval('.pcard',c=>c.map(x=>({t:x.querySelector('h3').textContent,doms:x.querySelector('.ptag').textContent,why:x.querySelector('.pwhy').textContent,href:x.querySelector('a.go').href,btn:[...x.querySelectorAll('[data-a]')].map(e=>e.dataset.a).join(),img:(x.querySelector('img').loading='eager',1)})));
 const doms=new Set(cardsInfo.map(c=>c.doms));if(doms.size<3)E(W+' توازن المجالات ضعيف '+[...doms]);
 cardsInfo.forEach(c=>{if(!c.why)E(W+' بلا سبب '+c.t);for(const a of ['go','done','chg'])if(!c.btn.includes(a))E(W+' زر ناقص '+a+' '+c.t);if(/b_g5|st_2|b_col/.test(c.href))E(W+' محتوى خارج المستوى')});
 for(const c of cardsInfo){const u=new URL(c.href);const r=await ctx.request.get('http://localhost:8765'+u.pathname);if(r.status()>=400)E(W+' رابط لا يعمل '+c.href)}
 if(new Set(it.map(i=>i.key)).size!==it.length)E(W+' تكرار في الخطة');
 const ks=it.map(i=>i.key.split(':')[0]);if(ks.includes('games'))E(W+' لعبة في الخطة');
 await p.waitForTimeout(500);const imgs=await p.$$eval('.pcard img',x=>x.map(i=>i.complete&&i.naturalWidth>0));if(imgs.some(x=>!x))E(W+' صورة مفقودة');
 console.log(W,'step خطة',cardsInfo.map(c=>c.doms+':'+c.t).join(' | '));
 // 3) تم الإنجاز: تسجيل واحد فقط
 const first=it[0];await p.click(`[data-i="${first.id}"] [data-a=done]`);await p.waitForTimeout(300);
 let k=await kid();const [s0,...r0]=first.key.split(':');const slug0=r0.join(':');
 const rec=()=>{const kk=k;return s0==='acts'?kk.acts&&kk.acts[slug0]:['bank','proj','vid','songs'].includes(s0)?kk[s0]&&kk[s0].done&&kk[s0].done[slug0]:['life','ready','val','dig','exp'].includes(s0)?kk[s0]&&kk[s0].it&&kk[s0].it[slug0]:kk.stories&&kk.stories[slug0]};
 if(!rec())E(W+' لم يُسجَّل الإنجاز في سجل الطفل '+first.key);
 const t1=JSON.stringify(rec());
 if((await p.textContent('.pstats')).replace(/\s/g,'').indexOf('١مكتملة')<0)E(W+' عداد المكتملة '+(await p.textContent('.pstats')));
 if(!(await p.textContent('.pmsg')).match(/خطوة|أنجزت/))E(W+' رسالة تشجيع');
 if(/متأخر|فشل|خسر|ثانية|ينتهي/.test(await p.textContent('#pview')))E(W+' عبارة مقلقة');
 await p.reload();await p.waitForSelector('.pweek');k=await kid();if(JSON.stringify(rec())!==t1)E(W+' السجل تغيّر بعد التحديث (تكرار احتساب)');
 await p.click(`[data-i="${first.id}"] [data-a=go]`).catch(()=>{});// إعادة التجربة تُحسب
 await p.goBack().catch(()=>{});await p.waitForSelector('.pweek');
 k=await kid();const tr=(await items()).find(i=>i.id===first.id).tries;if(tr!==1)E(W+' إعادة التجربة لم تُحسب '+tr);
 // التراجع يزيل السجل الذي أضافته الخطة فقط
 await p.click(`[data-i="${first.id}"] [data-a=undo]`);await p.waitForTimeout(300);k=await kid();if(rec())E(W+' التراجع لم يزل السجل');
 // 4) تغيير ونقل وتأجيل وملاحظة وحذف
 const second=it[1];await p.click(`[data-i="${second.id}"] [data-a=chg]`);await p.waitForTimeout(800);
 let it2=await items();const ch=it2.find(i=>i.id===second.id);if(ch.key===second.key)E(W+' تغيير النشاط لم يتغير');if(new Set(it2.map(i=>i.key)).size!==it2.length)E(W+' تغيير أنتج تكرارًا');
 await p.click(`[data-i="${second.id}"] summary`);await p.fill(`[data-i="${second.id}"] textarea`,'احتاج الطفل إلى مساعدة');await p.dispatchEvent(`[data-i="${second.id}"] textarea`,'change');
 if((await items()).find(i=>i.id===second.id).note!=='احتاج الطفل إلى مساعدة')E(W+' الملاحظة لم تُحفظ');
 if((await p.textContent('#pview')).includes('احتاج الطفل إلى مساعدة')&&!(await p.$('textarea')))E(W+' ملاحظة معروضة خارج الحقل');
 const third=it[2];await p.click(`[data-i="${third.id}"] summary`);await p.click(`[data-i="${third.id}"] [data-a=later]`);await p.waitForTimeout(300);
 if((await items()).find(i=>i.id===third.id).st!=='later')E(W+' التأجيل');if(!(await p.textContent('.pstats')).replace(/\s/g,'').includes('١مؤجّلة'))E(W+' عداد المؤجلة');
 // نقل إلى يوم (الأحد idx1) — الممتلئ يُرفض
 const mvTarget=[...new Set([1,2,3,5].filter(d=>(it2.filter(i=>i.day===d).length>=2)))][0];const fourth=it2.find(i=>i.day!==mvTarget);
 if(mvTarget!=null){p.once('dialog',d=>d.accept());await p.click(`[data-i="${fourth.id}"] summary`).catch(()=>{});await p.selectOption(`[data-i="${fourth.id}"] select[data-a=mv]`,String(mvTarget));await p.waitForTimeout(300);if((await items()).find(i=>i.id===fourth.id).day===mvTarget)E(W+' النقل إلى يوم ممتلئ قُبل')}
 const free=[0,4,6][0];await p.click(`[data-i="${fourth.id}"] summary`).catch(()=>{});await p.selectOption(`[data-i="${fourth.id}"] select[data-a=mv]`,'4');await p.waitForTimeout(300);if((await items()).find(i=>i.id===fourth.id).day!==4)E(W+' النقل لم يعمل');
 const last=(await items())[4];await p.click(`[data-i="${last.id}"] summary`).catch(()=>{});await p.click(`[data-i="${last.id}"] [data-a=del]`);await p.waitForTimeout(300);if((await items()).some(i=>i.id===last.id))E(W+' الحذف لم يعمل');
 // 5) إعادة الجدولة (اليوم الأربعاء idx4)
 if(await p.$('#presch')){await p.click('#presch');await p.waitForTimeout(300);const bad=(await items()).filter(i=>i.st!=='done'&&i.day<4);if(bad.length)E(W+' إعادة الجدولة لم تنقل '+bad.length)}else if((await items()).some(i=>i.st!=='done'&&i.day<4))E(W+' لا زر إعادة جدولة');
 // 6) إضافة من المكتبة
 await p.click('#padd');await p.waitForSelector('#alist .arow');const nAdd=(await items()).length;await p.selectOption('#ad','6');await p.click('#alist [data-k]');await p.waitForTimeout(400);if((await items()).length!==nAdd+1)E(W+' الإضافة من المكتبة');
 const ai=(await items()).find(i=>i.ty==='manual');if(!ai||!/^(bank|proj|life|stories|acts):/.test(ai.key))E(W+' عنصر مضاف غير مرتبط بالمكتبة');
 // 7) إيقاف مؤقت
 await p.click('#ppause');await p.waitForTimeout(300);if(!(await p.textContent('.pmsg')).includes('متوقفة'))E(W+' الإيقاف المؤقت');await p.click('#ppause');
 // 8) اكتشاف تلقائي من سجلات الطفل نفسها
 const cur=(await items()).find(i=>i.st==='todo'&&i.key.startsWith('acts:'))||(await items()).find(i=>i.st==='todo');const [s2,...r2]=cur.key.split(':');
 await p.evaluate(([s,sl])=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));const kk=d.kids[d.cur];if(s==='acts'){kk.acts=kk.acts||{};kk.acts[sl]={d:'2026-11-25',how:'platform'}}else if(s==='stories'){kk.stories=kk.stories||{};kk.stories[sl]={t:Date.now(),d:1}}else if(['life','ready','val'].includes(s)){kk[s]=kk[s]||{it:{}};kk[s].it=kk[s].it||{};kk[s].it[sl]={d:1,t:Date.now()}}else{kk[s]=kk[s]||{};kk[s].done=kk[s].done||{};kk[s].done[sl]={d:1,t:Date.now()}}localStorage.setItem('zad-learn-v3',JSON.stringify(d))},[s2,r2.join(':')]);
 await p.reload();await p.waitForSelector('.pweek');if(!(await p.textContent(`[data-i="${cur.id}"]`)).includes('أنجزتَ'))E(W+' الإنجاز من صفحة النشاط لم يُكتشف');
 // 9) المزامنة مع حساب وليّ الأمر وعدم الحفظ بدون موافقة
 learnPost=null;await p.evaluate(()=>{localStorage.setItem('zad-sess',JSON.stringify({at:'t',rt:'r',exp:Date.now()+3.6e6,email:'a@b.c',uid:'u1'}));localStorage.setItem('zad-sync-last','2026-01-01T00:00:00Z')});
 await p.click(`[data-i="${cur.id}"] summary`).catch(()=>{});
 const dn=()=>p.$eval('.pcard [data-a=done]',e=>e.closest('.pcard').dataset.i);await p.click(`[data-i="${await dn()}"] [data-a=done]`);await p.waitForTimeout(3500);if(learnPost)E(W+' رُفعت البيانات بدون موافقة');
 await p.evaluate(()=>localStorage.setItem('zad-pf-consent','1'));if(await p.$('.pcard [data-a=done]')){await p.click(`[data-i="${await dn()}"] [data-a=done]`);await p.waitForTimeout(3500);if(!learnPost||!learnPost.data.kids.k1.plan||!Object.keys(learnPost.data.kids.k1.plan.weeks).length)E(W+' الخطة لم تُرسل إلى الحساب')}
 // 10) عزل الأطفال
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.cur='k2';localStorage.setItem('zad-learn-v3',JSON.stringify(d))});await p.reload();await p.waitForSelector('#pcreate, .pweek');
 if(!(await p.$('#pcreate'))||(await p.$('.pweek')))E(W+' خطة طفل ظهرت لطفل آخر');
 if((await p.textContent('#pview')).includes('احتاج الطفل'))E(W+' ملاحظة ظهرت لطفل آخر');
 // طفل الصف الثاني: خطة ضمن مستواه
 await p.click('#pcreate');await p.click('#wlv [data-l=g2]');await p.click('#wgo');await p.waitForSelector('.pweek .pcard');const k2=await kid();const items2=Object.values(k2.plan.weeks)[0].items;
 if(items2.some(i=>/b_let|st_1|p_dr|b_cnt|l_1|b_g5/.test(i.key)))E(W+' خطة الصف الثاني تحوي ما لا يناسبه '+items2.map(i=>i.key));
 // 11) أسبوع تالٍ + حذف
 await p.click('#pnew');await p.waitForTimeout(800);if(!Object.keys((await kid()).plan.weeks).includes('2026-11-28'))E(W+' خطة الأسبوع التالي');
 await p.click('#pprev');await p.waitForSelector('.pweek');p.once('dialog',d=>d.accept());await p.click('#pdel');await p.waitForTimeout(300);if(Object.keys((await kid()).plan.weeks).includes('2026-11-21'))E(W+' حذف الخطة');
 // 12) محتوى معطّل لم يعد منشورًا
 await reset(KS());await make([1,2,3,5],4);await p.waitForSelector('.pcard');const keys=(await items()).map(i=>i.key);
 ovr=[{src:keys[0].split(':')[0],slug:keys[0].split(':').slice(1).join(':'),status:'off',levels:[],domain:null,rtype:null,priority:0,reason:null}];posts.length=0;await p.reload();await p.waitForSelector('.pweek');
 if(!(await p.$('.pbad')))E(W+' نشاط موقوف لم يُعلَّم');if(!posts.some(x=>x[0]==='pf_errors'&&x[1].includes('plan-link')))E(W+' لم يُسجَّل خطأ الرابط');
 await p.click('.pbad [data-a=chg]');await p.waitForTimeout(800);if(await p.$('.pbad'))E(W+' تغيير النشاط الموقوف لم يعالجه');ovr=[];
 // 13) لا محتوى مناسب
 empty=true;await reset(KS());await p.click('#pcreate');await p.click('#wlv [data-l=a5]');await p.click('#wgo');await p.waitForTimeout(800);if(!(await p.textContent('#wer')).includes('سنضيف المزيد من الأنشطة المناسبة قريبًا'))E(W+' حالة عدم وجود محتوى');empty=false;
 // 14) نموذج جاهز
 await reset(KS());await p.click('#pcreate');await p.click('#wlv [data-l=a5]');await p.selectOption('#wt','pt_mid');if((await p.inputValue('#wn'))!=='4')E(W+' النموذج لم يملأ العدد');
 // 15) أماكن الدخول
 await p.goto(B+'next/');if(!(await p.textContent('body')).includes('خطتي التعليمية'))E(W+' رابط الخطة في صفحة التوصيات');
 await ctx.close();
}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
