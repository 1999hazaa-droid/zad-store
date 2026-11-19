// NODE_PATH=$(npm root -g) node tools/content/songs/test_songs.js  (خادم 8765 من جذر المستودع، و /tmp/song_mock.json من sbuild.py)
const {chromium}=require('playwright');const fs=require('fs');
const IT=JSON.parse(fs.readFileSync('/tmp/song_mock.json','utf8'));const CORS={'access-control-allow-origin':'*'};
const STUB=`(()=>{window.__sp={spoken:[],active:0,max:0,cancels:0,vols:[],fail:false};
class U{constructor(t){this.text=t;this.volume=1}}window.SpeechSynthesisUtterance=U;
let cur=null,tm=null;Object.defineProperty(window,'speechSynthesis',{configurable:true,value:{getVoices:()=>[],addEventListener(){},cancel(){window.__sp.cancels++;if(tm){clearTimeout(tm);tm=null;window.__sp.active=0;}cur=null},
speak(u){const s=window.__sp;if(s.fail){setTimeout(()=>u.onerror&&u.onerror({error:'synthesis-failed'}),10);return;}s.spoken.push(u.text);s.vols.push(u.volume);s.active++;s.max=Math.max(s.max,s.active);cur=u;tm=setTimeout(()=>{s.active--;tm=null;u.onend&&u.onend()},120)}}});})();`;
(async()=>{const b=await chromium.launch();const errs=[];
for(const vp of [{width:390,height:800},{width:1200,height:900}]){
const ctx=await b.newContext({viewport:vp});await ctx.addInitScript(STUB);const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('response',r=>{if(r.url().startsWith('http://localhost')&&r.status()>=400)errs.push('http '+r.status()+' '+r.url())});
await p.route('**/rest/v1/song_items*',r=>r.fulfill({json:IT,headers:CORS}));
const B='http://localhost:8765/songs/';const SP=()=>p.evaluate(()=>window.__sp);
const ST=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('zad-learn-v3')).kids.k1.songs);
const ov=async t=>{if(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth))errs.push('overflow '+t+' '+vp.width)};
// كل مرحلة فيها أناشيد
for(const lv of ['a2','a3','a4','a5','a6','g1','g2','g3','g4']){const n=IT.filter(x=>x.levels.includes(lv)).length;if(n<3)errs.push('few songs '+lv+' '+n);}
await p.goto(B+'?lv=g1');await p.waitForSelector('.sgcard');const n=await p.locator('.sgcard').count();console.log(vp.width,'cards',n,'expected',IT.filter(x=>x.levels.includes('g1')).length);if(n!==IT.filter(x=>x.levels.includes('g1')).length)errs.push('card count');await ov('hub');
if((await SP()).spoken.length)errs.push('autoplay on hub');
await p.screenshot({path:`/tmp/sg_hub${vp.width}.png`,fullPage:true});
// فلتر
await p.click('[data-f="math"]');const nm=await p.locator('.sgcard').count();if(nm!==IT.filter(x=>x.levels.includes('g1')&&x.cat==='math').length)errs.push('filter math '+nm);
await p.click('[data-f="fav"]');if(!(await p.textContent('#sglist')).includes('لا توجد أناشيد'))errs.push('fav empty');
await p.click('[data-f="all"]');
// تشغيل من البطاقة، وواحدة فقط في الوقت نفسه
const first=await p.locator('.sgplay').nth(0), second=await p.locator('.sgplay').nth(1);
await first.click();await p.waitForTimeout(200);if(await first.getAttribute('aria-pressed')!=='true')errs.push('play state');
await second.click();await p.waitForTimeout(300);let s=await SP();if(s.max>1)errs.push('concurrent '+s.max);if(await first.getAttribute('aria-pressed')==='true')errs.push('first still playing');
await second.click();await p.waitForTimeout(100);if(await second.getAttribute('aria-pressed')==='true')errs.push('pause failed');
// صفحة الأنشودة
const sl=IT.find(x=>x.levels.includes('g1')&&x.cat==='letters');
await p.goto(`${B}play/?s=${sl.slug}&lv=g1`);await p.waitForSelector('#sgmain');await ov('play');
let before=(await SP()).spoken.length;if(before)errs.push('autoplay on play page');
if((await p.textContent('#sgst')).trim()!=='جاهزة للتشغيل')errs.push('status idle');
await p.click('#sgmain');await p.waitForTimeout(160);if(!(await p.textContent('#sgst')).includes('يعمل'))errs.push('status playing');
await p.click('#sgmain');await p.waitForTimeout(100);if(!(await p.textContent('#sgst')).includes('متوقفة'))errs.push('status paused');
const idxPaused=await p.evaluate(()=>[...document.querySelectorAll('#sgly li')].length);
await p.click('#sgmain');await p.waitForTimeout(150);s=await SP();if(s.spoken.length<2)errs.push('resume');
// الصوت
await p.fill('#sgv','0.3');await p.dispatchEvent('#sgv','input');await p.waitForTimeout(300);s=await SP();if(!s.vols.includes(0.3))errs.push('volume not applied '+JSON.stringify(s.vols.slice(-3)));
// إعادة التشغيل
await p.click('#sgre');await p.waitForTimeout(100);s=await SP();if(!s.spoken.slice(-2).some(t=>t===sl.lyrics[0]))errs.push('restart first line');
// نهاية الأنشودة
await p.waitForTimeout(sl.lyrics.length*520);if(!(await p.textContent('#sgst')).includes('انتهت'))errs.push('status ended');
// شريط التقدم
const w=await p.evaluate(()=>document.querySelector('.sgp [data-bar]').style.width);console.log('bar',w);if(w!=='100%')errs.push('bar end '+w);
// المفضلة
await p.click('#sgfav');let st=await ST();if(!st.fav.includes(sl.slug))errs.push('fav not saved');await p.click('#sgfav');st=await ST();if(st.fav.includes(sl.slug))errs.push('fav not removed');await p.click('#sgfav');
if(!st.heard[sl.slug]&&!(await ST()).heard[sl.slug])errs.push('heard not saved');
// نشاط: خطأ ثم صواب
const q=sl.quiz;
await p.locator('.opt',{hasText:q.o[1]}).first().click();if(!(await p.textContent('#fb')).includes('قريب'))errs.push('wrong fb');
await p.locator('.opt',{hasText:new RegExp('^\\s*'+q.o[0]+'\\s*$')}).first().click();await p.waitForFunction(()=>document.querySelector('.qq')&&document.querySelector('.qq').textContent.includes('أي كلمة'),null,{timeout:4000}).catch(()=>{});
// سؤال الكلمات
const qq=await p.textContent('.qq');if(!qq.includes('أي كلمة وردت'))errs.push('word q');
const own=new Set(sl.lyrics.join(' ').split(/\s+/));const opts=await p.$$eval('.opt',a=>a.map(x=>x.textContent.trim()));const good=opts.find(o=>own.has(o));if(!good)errs.push('word opts');else await p.locator('.opt',{hasText:new RegExp('^\\s*'+good+'\\s*$')}).first().click();
await p.waitForSelector('.res',{timeout:4000}).catch(()=>errs.push('no result'));st=await ST();if(!st.done[sl.slug])errs.push('done not saved');
// أناشيد مقترحة
if(!(await p.locator('.sgcard').count()))errs.push('no suggestions');
// خطأ الصوت
await p.evaluate(()=>{window.__sp.fail=true});await p.click('#sgre');await p.waitForTimeout(200);if(!(await p.textContent('#sgst')).includes('تعذر'))errs.push('error msg');await p.evaluate(()=>{window.__sp.fail=false});
// صفحات
await p.goto(`${B}progress/?lv=g1`);await p.waitForSelector('.pg2');const pt=await p.textContent('#aview');for(const t of ['الأناشيد التي استمع إليها','الأنشطة المرتبطة التي أكملها','المهارات التي تدرب عليها','عدد مرات الاستماع وحده لا يعني إتقان'])if(!pt.includes(t))errs.push('progress missing '+t);await ov('progress');
await p.goto(B+'guide/');await p.waitForSelector('.hero');await ov('guide');
// الإنجليزية LTR
const en=IT.find(x=>x.cat==='english');await p.goto(`${B}play/?s=${en.slug}&lv=a5`);await p.waitForSelector('#sgly');if(await p.getAttribute('#sgly','dir')!=='ltr')errs.push('en dir');
await p.screenshot({path:`/tmp/sg_play${vp.width}.png`,fullPage:true});
// بلا صوت
const c2=await b.newContext({viewport:vp});await c2.addInitScript("Object.defineProperty(window,'speechSynthesis',{configurable:true,get(){return undefined}});delete window.SpeechSynthesisUtterance;");const p2=await c2.newPage();await p2.route('**/rest/v1/song_items*',r=>r.fulfill({json:IT,headers:CORS}));await p2.goto(`${B}play/?s=${sl.slug}&lv=g1`);await p2.waitForSelector('#sgmain');await p2.click('#sgmain');if(!(await p2.textContent('#sgst')).includes('غير متاح'))errs.push('no-tts msg');await c2.close();
await ctx.close();}
await b.close();console.log('DONE errs',JSON.stringify(errs));})();
