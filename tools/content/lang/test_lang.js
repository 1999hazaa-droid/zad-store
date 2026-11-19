// NODE_PATH=$(npm root -g) node tools/content/lang/test_lang.js  (خادم 8765 من جذر المستودع، و /tmp/lang_mock.json من lbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/lang_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const mk=(slug,cat,sub,ar,en,img,extra={},ages=[3,4,5,6],grades=[1,2])=>({slug,cat,sub,word_ar:ar,word_en:en,image_url:'images/zad/'+img+'.webp',audio_url:null,example:'مثال '+ar,extra,ages,grades,skill:'مفردات'});
const CARDS=[mk('c1','animals','أليفة','قطة','cat','1f431'),mk('c2','animals','برية','أسد','lion','1f981'),mk('c3','animals','أليفة','كلب','dog','1f436'),mk('c4','animals','بحرية','سمكة','fish','1f41f'),mk('c5','animals','طيور','عصفور','bird','1f426'),mk('c6','food','فواكه','تفاحة','apple','1f34e'),mk('c7','food','فواكه','موز','banana','1f34c'),
mk('c8','vocab','البيت والمدرسة','كتاب','book','1f4d6'),mk('c9','vocab','البيت والمدرسة','قلم','pen','270f'),mk('c10','vocab','البيت والمدرسة','باب','door','1f6aa'),mk('c11','vocab','الطبيعة','شمس','sun','2600'),mk('c12','vocab','المهن','طبيب','doctor','x_doctor'),
mk('l1','letters','الحروف','أ','',  '1f34e',{ch:'أ',order:1}),mk('l2','letters','الحروف','ب','','1f34c',{ch:'ب',order:2}),mk('l3','letters','الحروف','ت','','1f34f',{ch:'ت',order:3}),
mk('e1','english','الحروف الإنجليزية','تفاحة','Apple','1f34e',{ch:'A',word:'Apple',order:1}),mk('e2','english','الحروف الإنجليزية','كرة','Ball','26bd',{ch:'B',word:'Ball',order:2}),
mk('e3','english','الحيوانات','قطة','cat','1f431'),mk('e4','english','الحيوانات','كلب','dog','1f436'),mk('e5','english','الحيوانات','أسد','lion','1f981'),mk('e6','english','الحيوانات','فيل','elephant','1f418'),mk('e7','english','الحيوانات','سمكة','fish','1f41f'),mk('e8','english','الحيوانات','بقرة','cow','1f404')];
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.addInitScript(()=>{window.__said=[];try{window.speechSynthesis.speak=(u)=>{window.__said.push([u.text,u.lang])};}catch{}});
await p.route('**/rest/v1/cards*',r=>r.fulfill({json:CARDS,headers:CORS}));
await p.route('**/rest/v1/lang_items*',r=>{const u=new URL(r.request().url());const l=(u.searchParams.get('lang')||'').replace('eq.','');r.fulfill({json:IT.filter(x=>!l||x.lang===l),headers:CORS})});
const B='http://localhost:8765/language/';
const prog=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.lang);
await p.goto(B);await p.waitForSelector('.tl');console.log(vp.width,'tiles',await p.locator('.tl').count());
if(await p.locator('.tl').count()!==10)errs.push('tiles');
await p.click('[data-lv=a2]');if(!(await p.locator('text=القواميس المصورة').count()))errs.push('a2 hub');await p.click('[data-lv=g3]');
const href=await p.getAttribute('#t-ar .lks a[href*="cards/?cat=letters&gr=3"]','href').catch(()=>null);if(!href)errs.push('cards link gr param');
if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('hub overflow '+vp.width);
await p.screenshot({path:`/tmp/lh${vp.width}.png`});
// القواميس
await p.goto(B+'dict/?d=animals');await p.waitForSelector('.dc');const n1=await p.locator('.dc').count();await p.fill('#dq','lion');const n2=await p.locator('.dc').count();console.log('dict',n1,n2);if(n1!==5||n2!==1)errs.push('dict counts '+n1+' '+n2);
await p.click('[data-d=school]');if(await p.locator('.dc').count()!==2)errs.push('school dict');
await p.locator('.spk').first().click();const said=await p.evaluate(()=>window.__said.length);if(!said)errs.push('no speech');
// التدريب: كل الأنواع
const solve=async(lang,kind,tier)=>{
 await p.goto(`${B}practice/?lang=${lang}&kind=${kind}&tier=${tier}`);await p.waitForSelector('.qh, .sempty');
 if(await p.locator('.sempty').count()){errs.push(`${lang} ${kind} t${tier} empty`);return;}
 let guard=0;
 while(!(await p.locator('.res').count())&&guard++<12){
  if(kind==='order'){const it=IT.filter(x=>x.lang===lang&&x.kind==='order'&&x.levels.some(l=>({1:['a3','a4'],2:['a5','a6','g1','g2'],3:['g3','g4']}[tier]).includes(l)));
   const bank=await p.$$eval('.bank .tk',a=>a.map(x=>x.textContent));const hit=it.find(x=>[...x.data.words].sort().join('|')===[...bank].sort().join('|'));if(!hit){errs.push('order no match '+bank);break;}
   for(const w of hit.data.words){await p.locator('.bank .tk',{hasText:new RegExp('^'+w+'$')}).first().click();}await p.click('#chk');}
  else if(kind==='build'){const bank=await p.$$eval('.bank .tk',a=>a.map(x=>x.textContent));const w=(lang==='ar'?CARDS.filter(c=>c.cat!=='english'&&c.cat!=='letters'):CARDS.filter(c=>c.word_en)).map(c=>lang==='ar'?c.word_ar:c.word_en.toLowerCase()).find(x=>[...x].sort().join('')===[...bank].sort().join(''));if(!w){errs.push('build no word '+bank);break;}
   for(const ch of w){await p.locator('.bank .tk:not(.on)',{hasText:new RegExp('^'+ch+'$')}).first().click();}await p.click('#chk');}
  else if(kind==='write'){const ws=await p.$$eval('.wds .tk',a=>a.map(x=>x.textContent));await p.fill('#wt',ws.join(' ')+(lang==='ar'?' جدا':' very'));await p.click('#chk');}
  else if(kind==='events'){}
  else{ // mc / fill / opp / odd / passage
   const qt=await p.evaluate(()=>(document.querySelector('.qq')||document.querySelector('.sent')||{}).textContent||'');
   if(await p.locator('.evs').count()||qt.includes('رتّب أحداث')||qt.includes('events in order')){const px=IT.find(x=>x.kind==='passage'&&x.data.events&&x.data.events.every(e=>true)&&qt);const ev=IT.filter(x=>x.lang===lang&&x.kind==='passage'&&x.data.events);const first=await p.$$eval('.opt',a=>a.map(x=>x.textContent));const hit=ev.find(x=>x.data.events.every(e=>first.includes(e)));for(const e of hit.data.events){await p.locator('.opt',{hasText:e}).first().click();}}
   else{let ans=null;
    if(kind==='fill'){const s=(await p.textContent('.sent')).replace('؟','___');const it=IT.find(x=>x.lang===lang&&x.kind==='fill'&&x.data.s.replace(/\s+/g,' ')===s.replace(/\s+/g,' '));ans=it&&it.data.o[it.data.a];}
    if(kind==='opp'){const m=qt.match(/[«"]([^»"]+)[»"]/);const w=m&&m[1];for(const x of IT.filter(y=>y.lang===lang&&y.kind==='opp'))for(const pr of x.data.pairs){if(pr[0]===w)ans=pr[1];if(pr[1]===w)ans=pr[0];}}
    if(kind==='odd'){const opts=await p.$$eval('.opt',a=>a.map(x=>x.textContent));for(const x of IT.filter(y=>y.lang===lang&&y.kind==='odd'))for(const q of x.data.qs)if([...q.items].sort().join('|')===[...opts].sort().join('|'))ans=q.items[q.a];}
    if(kind==='passage'){const q=(await p.textContent('.qq'));for(const x of IT.filter(y=>y.lang===lang&&y.kind==='passage'))for(const z of x.data.qs)if(z.q===q)ans=z.o[z.a];}
    if(!ans){errs.push(`${lang} ${kind} t${tier} answer not found: ${qt}`);break;}
    await p.locator('.opt',{hasText:new RegExp('^'+ans.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first().click();}}
  await p.waitForTimeout(850);
 }
 const res=await p.textContent('.res').catch(()=>'');if(!res.includes('ممتاز'))errs.push(`${lang} ${kind} t${tier} result: ${res.slice(0,60)}`);
};
const kinds={ar:['order','fill','opp','odd','passage','write','build'],en:['order','fill','opp','odd','passage','write','build']};const has=(lang,k,t)=>k==='build'||IT.some(x=>x.lang===lang&&x.kind===k&&x.levels.some(l=>({1:['a3','a4'],2:['a5','a6','g1','g2'],3:['g3','g4']}[t]).includes(l)));
const tiers=vp.width===390?[1,2,3]:[2];
for(const lang of ['ar','en'])for(const k of kinds[lang])for(const t of tiers)if(has(lang,k,t))await solve(lang,k,t);
await p.evaluate(()=>localStorage.removeItem('zad-lang-lv'));await p.goto(B+'practice/?lang=en&kind=passage');await p.waitForSelector('.tiers');if(await p.locator('.tiers a').count()!==2)errs.push('en passage tiers '+await p.locator('.tiers a').count());
const pr=await prog();console.log('skills',Object.keys(pr.sk).length,'rounds',pr.rounds);if(pr.rounds<10)errs.push('rounds');
const bad=Object.entries(pr.sk).filter(([k,v])=>v.w>0);if(bad.length)errs.push('unexpected wrong '+JSON.stringify(bad));
// خطأ مقصود لا يرفع الإتقان
await p.goto(`${B}practice/?lang=ar&kind=fill&tier=1`);await p.waitForSelector('.opt');const before=(await prog()).sk;await p.locator('.opt').filter({hasNotText:/^(الماء|النهار|مياو)$/}).first().click();const after=(await prog()).sk;const sumw=Object.values(after).reduce((a,v)=>a+v.w,0);if(sumw<1)errs.push('wrong answer not recorded');
// الاستماع
await p.goto(`${B}listen/?lang=en&mode=choose`);await p.waitForSelector('.spk');
for(let i=0;i<6;i++){await p.click('.spk');const w=await p.getAttribute('.spk','data-say');const c=CARDS.find(c=>c.word_en===w);const pic=p.locator(`.pic:has(img[src$="/${c.image_url}"])`);await pic.first().click();await p.waitForTimeout(1150);}
if(!(await p.locator('.res').count()))errs.push('listen no result');
const said2=await p.evaluate(()=>window.__said.filter(x=>x[1].startsWith('en')).length);if(!said2)errs.push('listen not spoken');
await p.goto(`${B}listen/?lang=ar&mode=repeat`);await p.waitForSelector('.rp');await p.click('#nx');
// عدم التشغيل التلقائي
await p.goto(`${B}listen/?lang=en&mode=choose`);await p.waitForSelector('.spk');await p.waitForTimeout(500);if(await p.evaluate(()=>window.__said.length))errs.push('autoplay!');
// الكتابة
await p.goto(`${B}write/?lang=en&mode=trace`);await p.waitForSelector('#dc');await p.waitForTimeout(500);
await p.evaluate(()=>{window.__box=document.getElementById('dc').getBoundingClientRect()});
const pts=await p.evaluate(()=>{const g=document.getElementById('gc').getContext('2d').getImageData(0,0,480,480).data;const o=[];for(let y=0;y<480;y+=14)for(let x=0;x<480;x+=14)if(g[(y*480+x)*4+3]>40)o.push([x,y]);return o});
await p.evaluate(()=>document.getElementById('dc').scrollIntoView({block:'center'}));await p.waitForTimeout(300);const bb=await p.locator('#dc').boundingBox();
await p.click('#tck');if(!(await p.textContent('#fb')).includes('تتبّع'))errs.push('empty trace msg');
const rows={};pts.forEach(([x,y])=>{(rows[y]=rows[y]||[]).push(x)});
for(const y of Object.keys(rows)){const xs=rows[y];await p.mouse.move(bb.x+xs[0]*bb.width/480,bb.y+y*bb.height/480);await p.mouse.down();for(const x of xs)await p.mouse.move(bb.x+x*bb.width/480,bb.y+y*bb.height/480);await p.mouse.up();}
await p.click('#tck');const tm=await p.textContent('#fb');console.log('trace:',tm);if(!tm.includes('أحسنت'))errs.push('trace fail '+tm);
await p.click('#tcl');await p.mouse.move(bb.x+5,bb.y+5);await p.mouse.down();await p.mouse.move(bb.x+bb.width-5,bb.y+bb.height-5);await p.mouse.up();await p.click('#tck');const tm2=await p.textContent('#fb');if(tm2.includes('أحسنت'))errs.push('bad trace accepted '+tm2);
await p.goto(`${B}write/?lang=ar&mode=copy`);await p.waitForSelector('#ct');const wd=await p.textContent('.rp h2');await p.fill('#ct','خطأ');await p.click('#cb');if(!(await p.textContent('#fb')).includes('قارن'))errs.push('copy wrong');await p.fill('#ct',wd);await p.click('#cb');await p.waitForTimeout(150);
for(const u of ['','dict/','practice/?lang=en&kind=order&tier=2','listen/?lang=en','write/?lang=ar']){await p.goto(B+u);await p.waitForTimeout(500);if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('overflow '+u+' '+vp.width);const badi=await p.$$eval('img',a=>a.filter(i=>!i.complete||i.naturalWidth===0).length);if(badi)errs.push('broken imgs '+u+' '+badi);}
await p.goto(B);await p.waitForSelector('#prog');console.log('prog',(await p.textContent('#prog')).slice(0,160).replace(/\s+/g,' '));await p.screenshot({path:`/tmp/lp${vp.width}.png`,fullPage:vp.width===390});
}
console.log('errs',errs);await b.close()})();
