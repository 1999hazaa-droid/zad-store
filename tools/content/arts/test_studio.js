const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const ctx=await b.newContext({viewport:{width:390,height:900},hasTouch:true,acceptDownloads:true});const p=await ctx.newPage();
p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
p.on('dialog',d=>d.accept());
let posted=null;await p.route('**/rest/v1/art_gallery',r=>{posted=JSON.parse(r.request().postData());r.fulfill({status:201,body:''})});
await p.goto('http://localhost:8765/arts/studio/?t=circle');await p.waitForSelector('.tpl.on');await p.waitForTimeout(600);
const px=(x,y)=>p.evaluate(([x,y])=>{const d=document.getElementById('pc').getContext('2d').getImageData(x,y,1,1).data;return [...d].slice(0,3).join(',')},[x,y]);
const at=async(fx,fy)=>{await p.locator('#pc').scrollIntoViewIfNeeded();await p.evaluate(()=>document.getElementById('pc').scrollIntoView({block:'center'}));const box=await p.locator('#pc').boundingBox();return [box.x+box.width*fx,box.y+box.height*fy]};
// fill inside circle (center), with red
let [cx,cy]=await at(.5,.5);await p.mouse.click(cx,cy);console.log('inside',await px(450,337));
console.log('outside',await px(20,20));
// outline barrier: fill didn't leak
// choose blue and fill outside
await p.click('.sw[data-c="#2563eb"]');[cx,cy]=await at(.03,.03);await p.mouse.click(cx,cy);console.log('outside after',await px(20,20),'inside kept',await px(450,337));
// brush
await p.click('[data-tool=brush]');await p.click('.sw[data-c="#22c55e"]');const [x1,y1]=await at(.45,.45);await p.mouse.move(x1,y1);await p.mouse.down();await p.mouse.move(x1+60,y1+30,{steps:5});await p.mouse.up();
const sc=900/(await p.locator('#pc').boundingBox()).width;const mx=Math.round(.45*900+30*sc),my=Math.round(.45*675+15*sc);console.log('brush px',await px(mx,my));
// eraser
await p.click('[data-tool=eraser]');const [e1,e2]=await at(.45,.45);await p.mouse.move(e1,e2);await p.mouse.down();await p.mouse.move(e1+60,e2+30,{steps:5});await p.mouse.up();console.log('erased',await px(mx,my));
await p.click('#undo');console.log('undo (brush back)',await px(mx,my));
// template switch to another and fill
await p.click('.tpl[data-id="star"]');await p.waitForTimeout(500);await p.click('[data-tool=fill]');[cx,cy]=await at(.5,.55);await p.mouse.click(cx,cy);console.log('star fill',await px(450,371));
// save/download
await p.click('#save');await p.waitForSelector('#minel img');console.log('saved',await p.locator('#minel img').count());
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#dl')]);console.log('download',dl.suggestedFilename());
await p.click('#clear');console.log('after clear',await px(450,371));
// gallery consent
await p.click('#pub');await p.click('#dsend');console.log('no consent msg',await p.locator('#dm').textContent());await p.check('#cons');await p.click('#dsend');await p.waitForFunction(()=>/تم الإرسال/.test(document.getElementById('dm').textContent));console.log('posted',posted&&posted.consent,posted&&posted.status,posted&&posted.image.slice(0,22),Object.keys(posted).join(','));
// every template loads & mask nonzero
const n=await p.locator('.tpl').count();console.log('templates',n);
const ov=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth);console.log('overflow',ov);
await p.screenshot({path:'/tmp/studio.png',fullPage:true});
console.log('errs',errs);await b.close()})();
