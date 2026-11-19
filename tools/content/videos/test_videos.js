// NODE_PATH=$(npm root -g) node tools/content/videos/test_videos.js  (خادم 8765 من جذر المستودع و /tmp/vid_mock.json من vbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/vid_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const STUB=`(()=>{window.__sp={spoken:[],active:0,max:0,vols:[],fail:false};
class U{constructor(t){this.text=t;this.volume=1}}window.SpeechSynthesisUtterance=U;
let tm=null;Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],addEventListener(){},cancel(){if(tm){clearTimeout(tm);tm=null;window.__sp.active=0;}},
speak(u){const s=window.__sp;if(s.fail){setTimeout(()=>u.onerror&&u.onerror({error:'synthesis-failed'}),10);return;}s.spoken.push(u.text);s.vols.push(u.volume);s.active++;s.max=Math.max(s.max,s.active);tm=setTimeout(()=>{s.active--;tm=null;u.onend&&u.onend()},120)}}});})();`;
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:820,height:1000},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(STUB);const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+r.url())});
await p.route('**/rest/v1/video_items*',r=>r.fulfill({json:IT,headers:CORS}));
const B='http://localhost:8765/videos/';const SP=()=>p.evaluate(()=>window.__sp);
const ST=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.vid);
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))errs.push('overflow '+t+' '+vp.width)};
for(const lv of ['a2','a3','a4','a5','a6','g1','g2','g3','g4']){const n=IT.filter(x=>x.levels.includes(lv)).length;if(n<3)errs.push('few videos '+lv+' '+n);}
for(const c of ['letters','math','english','science','living','body','space','values','life','ready','art','songs','review'])if(IT.filter(x=>x.cat===c).length<2)errs.push('cat thin '+c);
await p.goto(B+'?lv=g1');await p.waitForSelector('.vcardx');await ov('hub');
if((await SP()).spoken.length)errs.push('autoplay hub');
const g1=IT.filter(x=>x.levels.includes('g1'));
// بحث وفلاتر
await p.fill('#vq','الشكل');await p.waitForTimeout(100);let t=await p.textContent('#vres');if(!t.includes('نتيجة'))errs.push('search');
const nS=await p.locator('#vres .vcardx').count();if(nS!==g1.filter(x=>(x.title+' '+x.skill+' '+x.descr).includes('الشكل')).length)errs.push('search count '+nS);
await p.fill('#vq','');await p.selectOption('#fc','math');await p.waitForTimeout(100);
if(await p.locator('#vres .vcardx').count()!==g1.filter(x=>x.cat==='math').length)errs.push('cat filter');
await p.selectOption('#fc','');await p.selectOption('#ft','file');await p.waitForTimeout(100);if(!(await p.textContent('#vres')).includes('لا توجد نتائج'))errs.push('file filter should be empty');
await p.selectOption('#ft','');await p.selectOption('#fd','short');await p.waitForTimeout(100);if(await p.locator('#vres .vcardx').count()!==g1.filter(x=>x.duration_s<=40).length)errs.push('dur filter');
await p.selectOption('#fd','');await p.waitForTimeout(100);if(await p.locator('#vsecs').isHidden())errs.push('sections not restored');
await p.screenshot({path:`/tmp/vd_hub${vp.width}.png`,fullPage:true});
// صفحة درس
const v=IT.find(x=>x.levels.includes('g1')&&x.cat==='review');
await p.goto(`${B}play/?s=${v.slug}&lv=g1`);await p.waitForSelector('#vmain');await ov('play');
if((await SP()).spoken.length)errs.push('autoplay play');
if(!(await p.textContent('#vst')).includes('جاهز'))errs.push('idle status');
await p.click('#vmain');await p.waitForTimeout(160);if(!(await p.textContent('#vst')).includes('يعمل'))errs.push('playing status');
await p.click('#vmain');await p.waitForTimeout(80);if(!(await p.textContent('#vst')).includes('متوقف'))errs.push('paused status');
const iP=await p.textContent('#vcnt');await p.click('#vmain');await p.waitForTimeout(500);let s=await SP();if(s.spoken.length<2)errs.push('resume');if(s.max>1)errs.push('concurrent speech');
await p.fill('#vv','0.3');await p.dispatchEvent('#vv','input');await p.waitForTimeout(300);s=await SP();if(!s.vols.includes(0.3))errs.push('volume');
await p.click('#vnext');await p.click('#vprev');
await p.waitForFunction(()=>document.querySelector('#vst').textContent.includes('انتهى'),null,{timeout:15000}).catch(()=>errs.push('did not end'));
if(await p.evaluate(()=>document.querySelector('#vbar').style.width)!=='100%')errs.push('bar not full');
let st=await ST();if(!st.watched[v.slug])errs.push('not watched');
await p.click('#vre');await p.waitForTimeout(200);if(!(await p.textContent('#vst')).includes('يعمل'))errs.push('restart');
await p.click('#vmain');await p.waitForTimeout(100);
// استئناف المشاهدة بعد المغادرة
await p.goto(B+'?lv=g1');await p.waitForSelector('.vcardx');
st=await ST();
// نشاط
await p.goto(`${B}play/?s=${v.slug}&lv=g1`);await p.waitForSelector('.opt');
const rightText=v.quiz.o[0];await p.locator('.opt',{hasText:new RegExp('^'+rightText+'$')}).click().catch(()=>errs.push('no right opt'));
await p.waitForSelector('.fb.g');
// خطأ ثم صحيح للسؤال الثاني
for(let k=0;k<2&&await p.locator('.res').count()===0;k++){await p.waitForTimeout(1500);if(await p.locator('.opt').count()){const q=await p.textContent('.qq');if(q.includes('أي كلمة')){await p.locator('.opt').first().click();await p.waitForTimeout(100);const bad=await p.locator('.opt.bad').count();if(bad)await p.waitForTimeout(0);const all=await p.locator('.opt:not([disabled])').count();for(let j=0;j<all;j++){if(await p.locator('.fb.g').count())break;const o=p.locator('.opt:not([disabled])').nth(0);await o.click();await p.waitForTimeout(80);}await p.waitForTimeout(1500);}}}
await p.waitForSelector('.res',{timeout:8000}).catch(()=>errs.push('no result'));
st=await ST();if(!st.done[v.slug])errs.push('not done');
if(await p.locator('#again').count())await p.click('#again');if(!(await p.locator('.opt').count()))errs.push('retry');
// زر النشاط المرتبط
const href=await p.getAttribute('#vlink','href');if(!href||!href.includes(v.link.href))errs.push('link '+href);
const r=await p.request.get(href);if(r.status()>=400)errs.push('link broken '+href);
// مفضلة ولاحقا
await p.click('#vfav');await p.click('#vlater');st=await ST();if(!st.fav.includes(v.slug)||!st.later.includes(v.slug))errs.push('fav/later');
// مرتبطة
if(!(await p.locator('.vrow .vcardx').count()))errs.push('no related');
// درس غير موجود
await p.goto(`${B}play/?s=nope&lv=g1`);await p.waitForSelector('.sempty');
// فشل الصوت => يكمل بالنص
await p.evaluate(()=>{window.__sp.fail=true});await p.goto(`${B}play/?s=${v.slug}&lv=g1`);await p.evaluate(()=>{window.__sp.fail=true});await p.waitForSelector('#vmain');await p.click('#vmain');await p.waitForTimeout(300);if(!(await p.textContent('#vst')).includes('تعذر'))errs.push('tts error msg');
// لوحة المتابعة
await p.goto(`${B}progress/?lv=g1`);await p.waitForSelector('.pg2');await ov('progress');if(!(await p.textContent('.pg2')).includes('٠'))null;const pt=await p.textContent('#aview');if(!pt.includes('المشاهدة وحدها'))errs.push('progress note');if(!pt.includes(v.title))errs.push('progress lacks title');
await p.screenshot({path:`/tmp/vd_prog${vp.width}.png`,fullPage:true});
await p.goto(`${B}guide/`);await p.waitForSelector('.hero');await ov('guide');
// ملف فيديو مرخص (عنصر تجريبي في الاختبار فقط)
const F=Object.assign({},IT[0],{slug:'zz_file',kind:'file',video_url:'http://localhost:8765/none.mp4',scenes:[]});
await p.route('**/rest/v1/video_items*',r=>r.fulfill({json:IT.concat([F]),headers:CORS}));
await p.goto(`${B}play/?s=zz_file&lv=${F.levels[0]}`);await p.waitForSelector('#vvid');const at=await p.evaluate(()=>{const v=document.querySelector('#vvid');return {auto:v.autoplay,pre:v.preload,ctl:v.controls}});if(at.auto||at.pre!=='none'||!at.ctl)errs.push('video attrs '+JSON.stringify(at));
await p.evaluate(()=>document.querySelector('#vvid').load());await p.waitForFunction(()=>document.querySelector('#vst').textContent.includes('تعذر'),null,{timeout:8000}).catch(()=>errs.push('video error msg'));
await ctx.close();console.log(vp.width,'done');}
console.log(errs.length?'ERRORS\n'+errs.join('\n'):'ALL OK');console.log('DONE');await b.close();})();
