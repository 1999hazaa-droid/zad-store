// NODE_PATH=$(npm root -g) node tools/content/gallery/test_gallink.js  (أزرار «أضف إلى معرضي» في صفحة المشروع + بطاقة ملف الإنجاز)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/proj_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const FAST=`(()=>{const o=window.setTimeout;window.setTimeout=(f,d,...a)=>o(f,d>=800?30:d,...a);})()`;
const AD=s=>String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const it=IT.find(x=>x.kind==='project'),d=it.data,lv=it.levels[0];
(async()=>{const b=await chromium.launch();const errs=[];const ck=(c,m)=>{if(!c)errs.push(m)};
const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(FAST);const p=await ctx.newPage();p.setDefaultTimeout(6000);
p.on('pageerror',e=>errs.push('pageerror '+e.message));
await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:IT,headers:CORS}));
await p.route('**/rest/v1/rpc/eval_public',r=>r.fulfill({json:{items:[]},headers:CORS}));
await p.goto(`http://localhost:8765/projects/play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('#go');
ck(await p.locator('#galtop #galadd').count()===1,'add button while in progress');
await p.click('#galadd');await p.waitForTimeout(100);
let g=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-gallery-v1')));ck(g&&g.kids.k1.e['p:'+it.slug]&&g.kids.k1.e['p:'+it.slug].ref===it.slug,'added to gallery');
ck(await p.locator('#galtop a[href*="gallery/#/v/"]').count()===1,'button turns into view link');
ck(!('status' in g.kids.k1.e['p:'+it.slug]),'no copy of progress');
await p.click('#go');for(let k=0;k<d.steps.length;k++){await p.waitForSelector('.pjstep');await p.click('#next');}
for(let i=0;i<2;i++){await p.waitForSelector('.qq');const q=d.qs[i];for(const bt of await p.locator('.opt').all()){if((await bt.textContent()).trim()===(it.cat==='english'?q.o[0]:AD(q.o[0]))){await bt.click();break;}}await p.waitForTimeout(150);}
await p.waitForSelector('#fin');await p.click('#fin');await p.waitForSelector('.res');await p.waitForTimeout(200);
ck(await p.locator('#galfin a[href*="gallery/#/v/"]').count()===1,'finish shows already-in-gallery (no duplicate)');
g=await p.evaluate(()=>JSON.parse(localStorage.getItem('zad-gallery-v1')));ck(Object.keys(g.kids.k1.e).length===1,'still one entry');
// مشروع آخر: زر إضافة عند الإكمال
const it2=IT.filter(x=>x.kind==='project')[1];
await p.goto(`http://localhost:8765/projects/play/?s=${it2.slug}&lv=${it2.levels[0]}`);await p.waitForSelector('#go');ck(await p.locator('#galtop #galadd').count()===1,'second project not in gallery');
// بطاقة ملف الإنجاز
await p.route(/rest\/v1\/(?!rpc\/eval_public|proj_items)/,r=>r.fulfill({json:[],headers:CORS}));
await p.goto('http://localhost:8765/portfolio/');await p.waitForSelector('.pfgal');
const t=await p.textContent('.pfgal');ck(t.includes('في معرضك')&&t.includes('مشروع'),'portfolio card shows real count: '+t.slice(0,80));
ck(await p.locator('.pfgal a[href*="gallery/"]').count()===2,'portfolio links to gallery');
await b.close();console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS gallink');process.exit(errs.length?1:0)})();
