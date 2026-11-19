// NODE_PATH=$(npm root -g) node tools/content/lang/test_lang2.js  (خادم 8765 من جذر المستودع، و /tmp/lang2_mock.json من lstories.py)
const {chromium}=require('playwright');const fs=require('fs');
const ST=JSON.parse(fs.readFileSync('/tmp/lang2_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const mk=(slug,cat,sub,ar,en,img,ages=[3,4,5,6],grades=[1,2])=>({slug,cat,sub,word_ar:ar,word_en:en,image_url:'images/zad/'+img+'.webp',audio_url:null,example:'',extra:{},ages,grades,skill:'مفردات'});
const CARDS=[mk('c1','animals','أليفة','قطة','cat','1f431'),mk('c2','animals','برية','أسد','lion','1f981'),mk('c3','animals','أليفة','كلب','dog','1f436'),mk('c4','animals','بحرية','سمكة','fish','1f41f'),mk('c5','food','فواكه','تفاحة','apple','1f34e'),mk('c6','food','فواكه','موزة','banana','1f34c'),mk('c7','vocab','الطبيعة','شجرة','tree','1f333'),mk('c8','vocab','البيت والمدرسة','كتاب','book','1f4d6'),
mk('n1','numbers','أرقام','واحد','One','1f34e'),mk('n2','numbers','أرقام','اثنان','Two','1f34e'),mk('m1','numbers','جمع','٢ + ٣ = ٥','2 + 3 = 5','1f34e')];
CARDS[8].image_url='images/cards/num/1.webp';CARDS[9].image_url='images/cards/num/2.webp';CARDS[10].image_url='images/cards/math/add-2-3.webp';
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
await p.addInitScript(()=>{window.__said=[];try{window.speechSynthesis.speak=(u)=>{window.__said.push([u.text,u.lang])};}catch{}});
await p.route('**/rest/v1/cards*',r=>r.fulfill({json:CARDS,headers:CORS}));
await p.route('**/rest/v1/lang_items*',r=>{const u=new URL(r.request().url());const l=(u.searchParams.get('lang')||'').replace('eq.','');r.fulfill({json:ST.filter(x=>!l||x.lang===l),headers:CORS})});
const B='http://localhost:8765/language/';
// قاموس الأرقام: بطاقتان فقط (تُستبعد معادلة الجمع)
await p.goto(B+'dict/?d=numbers');await p.waitForSelector('.dc');const nn=await p.locator('.dc').count();console.log(vp.width,'numbers dict',nn);if(nn!==2)errs.push('numbers dict '+nn);
if(!(await p.locator('[data-d=numbers]').count()))errs.push('no numbers tab');
// مواضع الحروف
for(const lang of ['ar','en'])for(const tier of [1,3]){
 await p.evaluate(()=>localStorage.removeItem('zad-lang-lv'));
 await p.goto(`${B}practice/?lang=${lang}&kind=pos&tier=${tier}`);await p.waitForSelector('.qh, .sempty');
 if(await p.locator('.sempty').count()){errs.push(`pos ${lang} t${tier} empty`);continue;}
 let g=0;while(!(await p.locator('.res').count())&&g++<8){
  const word=(await p.textContent('.wshow')).trim();const qt=await p.textContent('.qq');const opts=await p.$$eval('.opt',a=>a.map(x=>x.textContent));
  const strip=s=>s.replace(/[ً-ٰـ]/g,'');const w=[...(lang==='ar'?strip(word):word.toLowerCase())];
  let ans;if(/تبدأ|start/.test(qt))ans=w[0];else if(/تنتهي|end/.test(qt))ans=w[w.length-1];else if(/قبل منتصف|just before/.test(qt))ans=w[w.length/2-1];else ans=w[Math.floor(w.length/2)];
  if(!opts.includes(ans)){errs.push(`pos ${lang} answer missing: ${word} | ${qt} | ${opts} | ${ans}`);break;}
  // لا خيار مضلّل يطابق حرفًا موجودًا في موضع السؤال نفسه
  if(new Set(opts).size!==opts.length)errs.push('dup opts');
  await p.locator('.opt',{hasText:new RegExp('^'+ans+'$')}).first().click();await p.waitForTimeout(800);}
 const res=await p.textContent('.res').catch(()=>'');if(!res.includes('ممتاز'))errs.push(`pos ${lang} t${tier} result: ${res.slice(0,50)}`);
}
// القصص: قائمة + قراءة + أسئلة
await p.evaluate(()=>localStorage.removeItem('zad-lang-lv'));
for(const lang of ['ar','en']){
 await p.goto(`${B}story/?lang=${lang}`);await p.waitForSelector('.mk, .sempty');const n=await p.locator('.mk').count();console.log(lang,'stories',n);if(n!==6)errs.push(lang+' stories '+n);
 for(const x of ST.filter(s=>s.lang===lang)){
  await p.goto(`${B}story/?lang=${lang}&s=${x.slug}`);await p.waitForSelector('.spage');
  const pages=x.data.pages.length;for(let k=0;k<pages-1;k++){const t=await p.textContent('.stx');if(t.trim()!==x.data.pages[k].t)errs.push(x.slug+' page text '+k);await p.click('#sn');await p.waitForSelector('.spage');}
  if(!(await p.locator('.vc b').count()))errs.push(x.slug+' no vocab');
  if((await p.locator('.vc b').count())!==x.data.vocab.length)errs.push(x.slug+' vocab count');
  if(vp.width===390&&x.slug.endsWith('s01')){await p.locator('.spk').first().click();if(!(await p.evaluate(()=>window.__said.length)))errs.push('story no speech');}
  if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push(x.slug+' overflow '+vp.width);
  // الأسئلة
  await p.click('a:has-text("أسئلة الفهم")');await p.waitForSelector('.qh');
  let g=0;while(!(await p.locator('.res').count())&&g++<8){
   if(await p.locator('.evs').count()||(await p.textContent('.qq')).includes('رتّب أحداث')){for(const e of x.data.events){await p.locator('.opt',{hasText:new RegExp('^'+e.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first().click();}}
   else{const q=(await p.textContent('.qq')).trim();const z=x.data.qs.find(y=>y.q===q);if(!z){errs.push(x.slug+' q not found '+q);break;}
    await p.locator('.opt',{hasText:new RegExp('^'+z.o[z.a].replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$')}).first().click();}
   await p.waitForTimeout(850);}
  const res=await p.textContent('.res').catch(()=>'');if(!res.includes('ممتاز'))errs.push(x.slug+' result '+res.slice(0,40));
 }
}
const pr=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.lang);
const done=Object.keys(pr.it).filter(k=>/-s0/.test(k)).length;console.log('story items recorded',done);if(done<12)errs.push('story progress '+done);
await ctx.close();}
await b.close();console.log('errs',JSON.stringify(errs));})();
