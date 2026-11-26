// NODE_PATH=$(npm root -g) node tools/content/skp/test_skplink.js  (يحتاج /tmp/proj_mock.json من pbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/proj_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const pr=IT.find(x=>x.kind==='project'&&x.levels.includes('g1'));
const SK=[{slug:'m-count',name:'العد',domain:'math',color:'#2d7fd0',icon:'numbers.svg',role:'main',goal:'يعد الأشياء في اللوحة',goal_kid:'أعد',levels:['a5','g1']},
 {slug:'m-compare',name:'المقارنة',domain:'math',color:'#2d7fd0',icon:'numbers.svg',role:'support',goal:'يقارن بين الأعداد',goal_kid:'أقارن',levels:['g1','g2']},
 {slug:'hi',name:'خارج النطاق',domain:'math',color:'#2d7fd0',icon:'numbers.svg',role:'support',goal:'هدف',goal_kid:'x',levels:['g5']}];
(async()=>{const b=await chromium.launch();const errs=[];const ck=(c,m)=>{if(!c)errs.push(m)};
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
 const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();p.setDefaultTimeout(6000);
 p.on('pageerror',e=>errs.push('pageerror '+e.message));
 let mode='ok',asked=[];
 await p.route('**/rest/v1/proj_items*',r=>r.fulfill({json:IT,headers:CORS}));
 await p.route('**/rest/v1/rpc/skp_project',r=>{asked.push(r.request().postData());if(mode==='err')return r.fulfill({status:500,json:{},headers:CORS});r.fulfill({json:mode==='empty'?[]:SK,headers:CORS})});
 await p.route(/rest\/v1\/rpc\/(?!skp_project)/,r=>r.fulfill({json:{},headers:CORS}));
 const U='http://localhost:8765/projects/play/?s='+pr.slug+'&lv=g1';
 await p.goto(U);await p.waitForSelector('#stage');await p.waitForSelector('#skpbox:not([hidden])');
 const t=await p.textContent('#skpbox');
 ck(asked[0]&&JSON.parse(asked[0]).p_slug===pr.slug,'asked for this project');
 ck(t.includes('العد')&&t.includes('مهارة أساسية')&&t.includes('يعد الأشياء في اللوحة'),'main skill + goal');
 ck(t.includes('المقارنة')&&t.includes('مهارة مساندة'),'support skill');
 ck(!t.includes('خارج النطاق'),'out-of-scope hidden');
 ck(await p.locator('#skpbox a[href*="skp/#/s/m-count/acts"]').count()===1,'activities link');
 ck(!/أتقنت المهارة|درجة/.test(t)&&t.includes('لا يعني أنك أتقنت'),'no mastery claim');
 ck(!await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),'no overflow '+vp.width);
 // مستوى لا تناسبه مهارة المقارنة
 await p.goto(U.replace('lv=g1','lv=a5'));await p.waitForSelector('#stage');await p.waitForTimeout(300);
 const box=await p.locator('#skpbox').count()?await p.textContent('#skpbox'):'';ck(!box.includes('المقارنة'),'level-filtered at a5');
 mode='empty';await p.goto(U);await p.waitForSelector('#stage');await p.waitForTimeout(300);ck(await p.locator('#skpbox[hidden]').count()===1,'empty -> section hidden');
 mode='err';await p.goto(U);await p.waitForSelector('#stage');await p.waitForTimeout(300);ck(await p.locator('#skpbox[hidden]').count()===1,'error -> section hidden');
 await ctx.close();}
await b.close();console.log(errs.length?'FAIL\n'+[...new Set(errs)].join('\n'):'PASS test_skplink');process.exit(errs.length?1:0)})();
