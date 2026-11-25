// NODE_PATH=$(npm root -g) node tools/content/quality/test_gate_msg.js  (رسالة منع النشر الظاهرة في لوحة الإدارة)
const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();let bad=0;
 await p.route('https://x.test/**',r=>{const u=r.request().url();if(u.includes('gate'))r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({code:'P0001',message:'QUALITY_GATE: لا يمكن نشر «قصة» قبل اجتياز مراجعة الجودة. احفظه كمسودة ثم أرسله للمراجعة من «مركز الجودة».'})});else if(u.includes('other'))r.fulfill({status:400,body:'{"message":"duplicate key"}'});else r.fulfill({status:200,body:'{}'})});
 await p.goto('about:blank');await p.evaluate(()=>{window.msgs=[]});
 const src=fs.readFileSync('manage/panel.js','utf8');const i=src.indexOf('{ const of = window.fetch');const j=src.indexOf('const sb = supabase');
 await p.evaluate(({code})=>{window.toast=m=>window.msgs.push(m);eval(code)},{code:src.slice(i,j)});
 await p.evaluate(async()=>{await fetch('https://x.test/gate');await fetch('https://x.test/other');await fetch('https://x.test/ok')});await p.waitForTimeout(500);
 const m=await p.evaluate(()=>window.msgs);if(m.length!==1||!m[0].includes('قبل اجتياز مراجعة الجودة')||m[0].includes('QUALITY_GATE'))(bad++,console.log('ERR',JSON.stringify(m)));
 await b.close();console.log(bad?'FAILED':'ALL OK');process.exit(bad)})();
