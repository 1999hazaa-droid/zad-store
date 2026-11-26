// NODE_PATH=$(npm root -g) node tools/content/libt/test_accept_ui.js  (خادم 8765؛ Supabase مُحاكى بردود فارغة). فحص أهداف اللمس وحجم الخط وقص النص على الهاتف 390.
const {chromium}=require('playwright');const fs=require('fs');
const PAGES=['library','activities','bank','projects','stories','songs','videos','find','fav','saved','recent','paths','skills','goals','packs','quizzes','learn','ready','life','values','explore'].filter(p=>fs.existsSync(p+'/index.html'));
(async()=>{const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
await ctx.route(/supabase\.co/,r=>r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*'},body:r.request().method()==='OPTIONS'?'':'[]'}));
const rows=[];
for(const pg of PAGES){const p=await ctx.newPage();p.setDefaultTimeout(8000);try{await p.goto('http://localhost:8765/'+pg+'/',{waitUntil:'domcontentloaded'});await p.waitForTimeout(600);
 const r=await p.evaluate(()=>{const vis=e=>{const c=getComputedStyle(e),b=e.getBoundingClientRect();return c.display!=='none'&&c.visibility!=='hidden'&&b.width>0&&b.height>0};let small=[],tiny=0,clip=0,tot=0;
  document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button]').forEach(e=>{if(!vis(e))return;tot++;const b=e.getBoundingClientRect();if((b.height<32||b.width<32)&&!(e.tagName==='A'&&e.closest('p,li,.crumb,.zbc,nav,footer')&&b.height>=18))small.push((e.innerText||e.getAttribute('aria-label')||e.tagName).trim().slice(0,24)+' '+Math.round(b.width)+'x'+Math.round(b.height))});
  document.querySelectorAll('body *').forEach(e=>{if(!vis(e)||!e.childNodes.length)return;const t=[...e.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim()).length;if(!t)return;const f=parseFloat(getComputedStyle(e).fontSize);if(f<11)tiny++;});
  return{tot,small:small.slice(0,6),nsmall:small.length,tiny}});
 rows.push({pg,...r})}catch(e){rows.push({pg,err:String(e).slice(0,60)})}await p.close()}
await b.close();console.log(JSON.stringify(rows,null,0));})();
