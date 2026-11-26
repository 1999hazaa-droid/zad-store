// NODE_PATH=$(npm root -g) node tools/content/eval/test_evlink.js  (رابط «راجع مشروعك» عند الإكمال يظهر فقط إن وُجد تقييم منشور)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/proj_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const FAST=`(()=>{const o=window.setTimeout;window.setTimeout=(f,d,...a)=>o(f,d>=800?30:d,...a);})()`;
const AD=s=>String(s).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]);
const it=IT.find(x=>x.kind==='project'),d=it.data,lv=it.levels[0];
(async()=>{const b=await chromium.launch();const errs=[];
for(const has of [true,false]){
 const ctx=await b.newContext({viewport:{width:390,height:800}});await ctx.addInitScript(FAST);const p=await ctx.newPage();p.setDefaultTimeout(6000);
 p.on('pageerror',e=>errs.push('pageerror '+e.message));
 await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:IT,headers:CORS}));
 await p.route('**/rest/v1/rpc/eval_public',r=>r.fulfill({json:{items:has?[{slug:it.slug}]:[]},headers:CORS}));
 await p.goto(`http://localhost:8765/projects/play/?s=${it.slug}&lv=${lv}`);await p.waitForSelector('#go');await p.click('#go');
 for(let k=0;k<d.steps.length;k++){await p.waitForSelector('.pjstep');await p.click('#next');}
 for(let i=0;i<2;i++){await p.waitForSelector('.qq');const q=d.qs[i];for(const bt of await p.locator('.opt').all()){if((await bt.textContent()).trim()===(it.cat==='english'?q.o[0]:AD(q.o[0]))){await bt.click();break;}}await p.waitForTimeout(150);}
 await p.waitForSelector('#fin');await p.click('#fin');await p.waitForSelector('.res');await p.waitForTimeout(300);
 const n=await p.locator('#evlk a').count();
 if(has&&n!==1)errs.push('link missing when eval exists');
 if(!has&&n!==0)errs.push('fake link when no eval');
 if(has){const h=await p.locator('#evlk a').getAttribute('href');if(!h.includes('eval/#/p/'+it.slug))errs.push('bad href '+h);}
 if(!(await p.locator('#again').count()))errs.push('finish flow broke');
 await ctx.close();}
await b.close();console.log(errs.length?'FAIL\n'+errs.join('\n'):'PASS evlink');process.exit(errs.length?1:0)})();
