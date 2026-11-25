// NODE_PATH=$(npm root -g) node tools/content/reports/test_rp.js  (خادم 8765 من جذر المستودع؛ الخادم الحقيقي مُحاكى)
const {chromium}=require('playwright');const fs=require('fs');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
const CORS={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};
const NOW=new Date('2026-11-25T12:00:00+04:00');const T=(s)=>new Date(s+'T10:00:00+04:00').getTime();
const AR=s=>+String(s).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d));
const DOM=[['arabic','اللغة العربية','🔤',{quiz:['arabic'],src:['stories:arabic'],words:['حرف','حروف','كلمة','قراءة']}],['math','الرياضيات','🔢',{quiz:['math'],src:[],words:['جمع','طرح','عد','رقم']}],['english','اللغة الإنجليزية','🔠',{quiz:['english'],src:[],words:['english']}],['science','العلوم والمعرفة العامة','🔬',{quiz:['science'],src:['exp'],words:['علوم']}],['thinking','مهارات التفكير والتعلم المبكر','🧩',{quiz:['early'],src:['ready'],words:['تفكير','ذاكرة']}],['life','المهارات الحياتية','🧼',{quiz:[],src:['life'],words:['نظافة']}],['values','القيم والسلوك الإيجابي','🤝',{quiz:['values'],src:['val'],words:['قيم']}],['arts','الفنون والإبداع','🎨',{quiz:[],src:['songs'],words:['تلوين']}]];
const CFG=DOM.map(([slug,title,icon,d],i)=>({slug,kind:'domain',title,data:{...d,icon}}))
 .concat([{slug:'rule_complete',kind:'indicator',title:'x',data:{gameStars:1,quizMinQ:3}},{slug:'ind_retrain',kind:'indicator',title:'x',data:{}},{slug:'ind_progress',kind:'indicator',title:'x',data:{}},{slug:'ind_need',kind:'indicator',title:'x',data:{minAns:3,rate:0.6}},{slug:'ind_chart',kind:'indicator',title:'x',data:{}}])
 .concat([['low_skill','أعد اختبار «{title}»، فقد كانت أفضل نتيجة سابقة فيه {best} من {tot}.'],['retrain','أعد النشاط «{title}» الذي أتممته سابقًا، فلم يتدرب الطفل على مجال «{domain}» في هذه الفترة.'],['story','اقرأ القصة «{title}»، فهي مناسبة لمستوى الطفل ولم يقرأها بعد.'],['worksheet','جرّب النشاط «{title}»، فهو مناسب لمستوى الطفل في مجال «{domain}».'],['empty','لم يبدأ الطفل مجال «{domain}» بعد. ابدأ بـ «{title}».'],['quiz','جرّب الاختبار «{title}».']].map(([t,x])=>({slug:'reco_'+t,kind:'reco',title:'x',data:{type:t,text:x}})));
const ACT={a1:{subject:'اللغة العربية',skill:'تمييز الحروف',title:'نشاط حروف'},a2:{subject:'العلوم',skill:'الحواس الخمس',title:'نشاط حواس'},a3:{subject:'الفنون',skill:'التلوين',title:'نشاط تلوين'}};
const BANK={b1:{subject:'الرياضيات',skill:'جمع وطرح',title:'بطاقة جمع'},bx:{subject:'العلوم',skill:'علوم',title:'بنك علوم'}};
const iso=(t)=>new Date(t).toISOString().slice(0,10);
const kid1={name:'سارة',age:'5',acts:{a1:{d:'2026-11-22',how:'platform'},a2:{d:'2026-11-15',how:'platform'},a3:{d:'2026-10-05',how:'platform'}},bank:{done:{b1:{d:1,t:T('2026-11-23')}}},stories:{s1:{t:T('2026-11-24'),d:1}},
 quiz:{h:{q_ara01:{n:2,best:5,tot:6,cat:'arabic',title:'حروف',last:T('2026-11-23')},q_mat01:{n:1,best:4,tot:6,cat:'math',title:'عد',last:T('2026-11-24')},q_low:{n:1,best:2,tot:6,cat:'math',title:'طرح',last:T('2026-10-01')},q_sh:{n:1,best:2,tot:2,cat:'math',title:'قصير',last:T('2026-11-24')}},
 log:[{k:'q_sh',t:'قصير',c:'math',ok:2,n:2,ts:T('2026-11-24')},{k:'q_mat01',t:'عد',c:'math',ok:4,n:6,ts:T('2026-11-24')},{k:'q_ara01',t:'حروف',c:'arabic',ok:5,n:6,ts:T('2026-11-23')},{k:'q_ara01',t:'حروف',c:'arabic',ok:3,n:6,ts:T('2026-11-10')},{k:'q_low',t:'طرح',c:'math',ok:2,n:6,ts:T('2026-10-01')}],sk:{'الجمع':{ok:1,n:5,c:'math'},'الحروف':{ok:6,n:6,c:'arabic'}},pts:0,badges:{},rw:{},rv:{},ev:[]}};
const kid2={name:'ليث',age:'8',acts:{a1:{d:'2026-11-22',how:'platform'},a2:{d:'2026-11-23',how:'platform'}}};
const seed={cur:'k1',kids:{k1:kid1,k2:kid2}};
const G={hg_profiles:JSON.stringify(['سارة']),'hg_kid:سارة':JSON.stringify({n:'سارة',ch:'girl1',age:5}),'hg_prog:سارة':JSON.stringify({len:2,clock1:0}),'hg_gt:سارة':JSON.stringify({len:T('2026-11-23')})};
(async()=>{const b=await chromium.launch();
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
 const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(([s,g])=>{if(!localStorage.getItem('zad-learn-v3')){localStorage.setItem('zad-learn-v3',s);Object.entries(g).forEach(([k,v])=>localStorage.setItem(k,v))}},[JSON.stringify(seed),G]);
 const p=await ctx.newPage();const stats=[];let cfgFail=false;p.on('pageerror',e=>E(vp.width+' pageerror '+e.message));
 await p.clock.install({time:NOW});
 await p.route('**/rest/v1/**',async r=>{const u=new URL(r.request().url()),tb=u.pathname.split('/').pop(),m=r.request().method();const J=(o,c=200)=>r.fulfill({status:c,headers:{...CORS,'content-type':'application/json'},body:JSON.stringify(o)});
  if(m==='OPTIONS')return r.fulfill({status:204,headers:CORS});if(m==='POST'){if(tb==='rp_stats')stats.push(JSON.parse(r.request().postData()).kind);return r.fulfill({status:201,headers:CORS,body:''})}
  if(tb==='rp_config')return cfgFail?J({message:'x'},500):J(CFG);if(tb==='pf_certs')return J([]);
  const rowsOf=(M)=>{const m=(u.search.match(/slug=in\.\(([^)]*)\)/)||[])[1];return m?decodeURIComponent(m).split(',').filter(x=>M[x]).map(x=>({slug:x,icon:'i_puzzle',...M[x]})):null};
  if(tb==='activities')return J(rowsOf(ACT)||[]);if(tb==='bank_items'){const r2=rowsOf(BANK);if(r2)return J(r2);return J(Object.entries(BANK).map(([slug,v])=>({slug,...v})).concat([{slug:'bnew',title:'جديد حروف',skill:'ربط الحرف بالكلمة',subject:'اللغة العربية'}]))}
  if(tb==='stories'){const sl=(u.search.match(/slug=in/));if(sl)return J([{slug:'s1',title:'قصة قرأتها',topic:'arabic'}]);return J([{slug:'s1',title:'قصة قرأتها',topic:'arabic'},{slug:'st2',title:'قصة جديدة',topic:'arabic'}])}
  if(tb==='qz_quizzes')return J([{slug:'q_ara01',title:'حروف',cat:'arabic'},{slug:'q_new',title:'اختبار جديد',cat:'math'}]);
  return J([])});
 await p.route('**/games/catalog.json',r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{id:'len',t:'كم حرفاً؟',s:'x',subj:'اللغة العربية',skill:'تكوين الكلمات'},{id:'clock1',t:'ساعة',s:'x',subj:'الرياضيات',skill:'الساعة'}])}));
 const R='http://localhost:8765/reports/';
 const nums=async()=>(await p.locator('.pfstat').evaluateAll(e=>e.map(x=>[x.querySelector('span').textContent,x.querySelector('b').textContent])));
 const N=async()=>Object.fromEntries((await nums()).map(([k,v])=>[k,AR(v)]));
 const ov=async(n)=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))E(vp.width+' overflow '+n)};
 // الأسبوع الحالي
 await p.goto(R+'view/?t=week');await p.waitForSelector('.rphead');await p.waitForSelector('.rprec, .rpkid');await ov('week');
 let n=await N();const wantW={'أنشطة مكتملة':3,'دروس وقصص':1,'أوراق عمل ومشروعات':2,'ألعاب':1,'اختبارات':2,'مرات إعادة التدريب':1,'مهارات تدرب عليها':3};
 for(const [k,v] of Object.entries(wantW)) if(n[k]!==v)E(vp.width+' week '+k+' got '+n[k]+' want '+v);
 const head=await p.textContent('.rphead');if(!head.includes('٢١')||!head.includes('٢٥'))E(vp.width+' week range '+head.slice(0,90));
 const txt=await p.textContent('#aview');
 if((await p.textContent('.rpdoms')).includes('نشاط تلوين'))E('أنشطة خارج الفترة ظهرت');if(txt.includes('بطاقة جمع')===false)E('نشاط الأسبوع غير ظاهر');
 if(!txt.includes('من ٣ من ٦ إلى ٥ من ٦'))E('التقدم غير معروض');if(!txt.includes('الجمع')||!txt.includes('١ إجابات صحيحة من ٥'))E('المهارة الضعيفة غير معروضة');
 if(txt.includes('قصير'))E('اختبار قصير احتُسب');
 const rec=await p.evaluate(()=>window.__rp.rec.map(r=>r.ty+'|'+r.url));
 if(!rec.some(x=>x.startsWith('low_skill|')&&x.includes('q_low')))E('توصية low_skill غائبة '+rec);
 if(!rec.some(x=>x.startsWith('story|')&&x.includes('st2')))E('توصية story غائبة '+rec);if(rec.some(x=>x.includes('s=s1')))E('توصية قصة مقروءة');
 if(!rec.some(x=>x.startsWith('retrain|')))E('retrain غائبة (علوم نشاط سابق a2) '+rec);
 console.log('step روابط التوصيات');// روابط التوصيات والأنشطة تعمل
 const links=await p.$$eval('.rprec a, .rpdom a',a=>[...new Set(a.map(x=>x.href))]);let bad=0;for(const h of links){const u=new URL(h);const r=await ctx.request.get('http://localhost:8765'+u.pathname).catch(()=>null);if(!r||r.status()>=400){bad++;console.log('رابط لا يعمل',u.pathname)}}
 if(bad)E('روابط لا تعمل '+bad);
 console.log('step const kidtxt');const kidtxt=await p.textContent('.rpkid');if(!kidtxt.includes('أكملت أنشطة جميلة')||/\d|[٠-٩]/.test(kidtxt))E('صندوق الطفل: '+kidtxt);
 if(stats.filter(x=>x==='week').length!==1)E('rp_stats week '+stats);
 console.log('step المجالات');// المجالات
 const doms=await p.$$eval('.rpdom',e=>e.map(x=>x.dataset.dom));for(const d of ['arabic','math'])if(!doms.includes(d))E('مجال غائب '+d);
 const ar=await p.textContent('[data-dom=arabic]');if(!ar.includes('نشاط حروف'))E('نشاط الحروف خارج مجاله');
 console.log('step الأسبوع السابق');// الأسبوع السابق
 await p.goto(R+'view/?t=week&off=-1');await p.waitForSelector('.rphead');n=await N();if(n['أنشطة مكتملة']!==1||n['اختبارات']!==0)E('prev week '+JSON.stringify(n));
 console.log('step الشهر');// الشهر
 await p.goto(R+'view/?t=month');await p.waitForSelector('.rphead');n=await N();if(n['أنشطة مكتملة']!==4||n['اختبارات']!==2)E('month '+JSON.stringify(n));
 if(!(await p.textContent('.rphead')).includes('نوفمبر'))E('اسم الشهر');
 await p.goto(R+'view/?t=month&off=-1');await p.waitForSelector('.rphead');n=await N();if(n['أنشطة مكتملة']!==1||n['اختبارات']!==1)E('oct '+JSON.stringify(n));
 console.log('step مخصص');// مخصص
 await p.goto(R+'view/?t=custom&from=2026-11-23&to=2026-11-23');await p.waitForSelector('.rphead');n=await N();if(n['أنشطة مكتملة']!==2||n['اختبارات']!==1)E('custom 23 '+JSON.stringify(n));
 await p.goto(R+'view/?t=custom&from=2026-11-24&to=2026-11-23');await p.waitForSelector('.pfempty');
 console.log('step الصفحة الرئيسية');// الصفحة الرئيسية + الإعدادات
 await p.goto(R);await p.waitForSelector('#rpsf');await ov('hub');
 await p.fill('#rpf','2026-11-24');await p.fill('#rpt','2026-11-22');await p.click('#rpcf button');await p.waitForTimeout(200);if(!(await p.textContent('#rpcm')).includes('اختر'))E('تحقق الفترة غير صحيح');
 await p.fill('#rpf','2026-11-22');await p.fill('#rpt','2026-11-24');await Promise.all([p.waitForURL(/view/),p.click('#rpcf button')]);await p.waitForSelector('.rphead');n=await N();if(n['أنشطة مكتملة']!==3)E('custom form '+JSON.stringify(n));
 await p.goto(R);await p.waitForSelector('#rpsf');
 await p.uncheck('[data-d=arabic]');await p.check('[data-h=certs]');await p.check('#rpnf');await p.click('#rpsf button');await p.waitForTimeout(200);
 await p.goto(R+'view/?t=week');await p.waitForSelector('.rphead');if((await p.$$eval('.rpdom',e=>e.map(x=>x.dataset.dom))).includes('arabic'))E('المجال المخفي ظهر');if((await p.textContent('#aview')).includes('الشهادات في الفترة'))E('إخفاء الشهادات لم يعمل');
 if((window=0,false)){}
 await p.goto(R);await p.waitForSelector('#rpsf');const last=await p.textContent('#aview');if(!last.includes('أسبوعي'))E('آخر تقرير غير ظاهر');
 if(!(await p.$('.rpbanner')))E('تذكير الأسبوع الماضي غائب');
 await p.goto(R+'view/?t=week&off=-1');await p.waitForSelector('.rphead');await p.goto(R);await p.waitForSelector('#rpsf');if(await p.$('.rpbanner'))E('التذكير بقي بعد الاطلاع');
 console.log('step الطباعة');// الطباعة
 await p.goto(R+'view/?t=week');await p.waitForSelector('.rphead');await p.emulateMedia({media:'print'});
 if(await p.$$eval('.nopr',e=>e.some(x=>getComputedStyle(x).display!=='none')))E('عناصر nopr تظهر في الطباعة');
 const pdf=await p.pdf({format:'A4',printBackground:true});if(pdf.length<5000)E('PDF صغير');require('fs').writeFileSync('/tmp/rp_week.pdf',pdf);
 await p.emulateMedia({media:'screen'});
 console.log('step طفل آخر');// طفل آخر لا يرى بيانات الأول
 await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('zad-learn-v3'));d.cur='k2';localStorage.setItem('zad-learn-v3',JSON.stringify(d))});
 await p.goto(R+'view/?t=week');await p.waitForSelector('.rphead');const t2=await p.textContent('.rpdoms');if(t2.includes('بطاقة جمع')||t2.includes('تلوين'))E('بيانات طفل آخر');n=await N();if(n['أنشطة مكتملة']!==2||n['اختبارات']!==0)E('kid2 '+JSON.stringify(n));
 console.log('step فشل تحميل');// فشل تحميل الإعدادات: لا يتعطل
 cfgFail=true;await p.goto(R+'view/?t=week');await p.waitForSelector('.rphead');if(!(await p.textContent('#aview')).includes('تعذر تحميل تصنيف'))E('لا رسالة فشل الإعدادات');
 console.log('step حذف الإعدادات');// حذف الإعدادات
 cfgFail=false;await p.goto(R);await p.waitForSelector('#rpdel');p.once('dialog',d=>d.accept());await p.click('#rpdel');await p.waitForTimeout(900);await p.waitForSelector('#rpsf');
 if(await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k2.pf.rp))E('الحذف لم يمسح rp');
 console.log('done',vp.width);await ctx.close()}
await b.close();console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0)})();
