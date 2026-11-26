// NODE_PATH=$(npm root -g) node tools/content/libt/test_devices.js  (خادم 8765 من جذر المستودع؛ Supabase مُحاكى بردود فارغة)
// يفتح صفحات المكتبة العامة بمقاسات الهاتف 390 واللوحي 768 والحاسوب 1280 (Chromium فقط) ويتحقق: لا تمرير أفقي، لا أخطاء JavaScript، لا نص خارج الشاشة.
// يطبع JSON في السطر الأخير. السرعة هنا محلية ولا تمثل شبكة حقيقية.
const {chromium}=require('playwright');const fs=require('fs');
const PAGES=['library','activities','bank','projects','stories','songs','videos','find','fav','saved','recent','paths','skills','goals','packs','quizzes','learn','ready','life','values','explore','integrated','daily','tasks','week','gallery','skp','eval'].filter(p=>fs.existsSync(p+'/index.html'));
const DEV={phone:{width:390,height:844},tablet:{width:768,height:1024},desktop:{width:1280,height:800}};
(async()=>{const b=await chromium.launch();const out={pages:PAGES,dev:{}};
for(const [d,vp] of Object.entries(DEV)){const bad=[];let n=0;const times=[];
 const ctx=await b.newContext({viewport:vp});await ctx.route(/supabase\.co/,r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:r.request().method()==='OPTIONS'?'':'[]'}));
 for(const pg of PAGES){const p=await ctx.newPage();p.setDefaultTimeout(8000);const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,120)));
  try{const t0=Date.now();await p.goto('http://localhost:8765/'+pg+'/',{waitUntil:'domcontentloaded'});times.push(Date.now()-t0);await p.waitForTimeout(500);n++;
   const r=await p.evaluate(()=>{const de=document.documentElement;const over=de.scrollWidth>de.clientWidth+1;let off=0;document.querySelectorAll('body *').forEach(e=>{const c=getComputedStyle(e);if(c.position==='fixed'||c.display==='none')return;const b=e.getBoundingClientRect();if(b.width>0&&(b.left<-2||b.right>de.clientWidth+2)&&!e.closest('[style*="overflow"],.scroll,.tabs,.chips,table,pre'))off++});return{over,off,sw:de.scrollWidth,cw:de.clientWidth,empty:document.body.innerText.trim().length<20}});
   if(r.over)bad.push(pg+': تمرير أفقي ('+r.sw+'>'+r.cw+')');if(r.empty)bad.push(pg+': صفحة شبه فارغة');if(errs.length)bad.push(pg+': خطأ JS '+errs[0])}
  catch(e){bad.push(pg+': تعذّر الفتح')}await p.close()}
 await ctx.close();out.dev[d]={tested:n,bad,avg_ms:times.length?Math.round(times.reduce((a,c)=>a+c,0)/times.length):null}}
await b.close();console.log(JSON.stringify(out));process.exit(0)})();
