// فحص ثابت للروابط الداخلية في صفحات الموقع العامة: كل href/src نسبي أو يبدأ بـ /zad-store/ يجب أن يشير إلى ملف/مجلد موجود.
// node tools/content/libt/check_links.js  → يطبع JSON بالنتيجة؛ يخرج 1 إن وُجد رابط مكسور
const fs=require('fs'),path=require('path');const root=process.cwd();
const SKIP=new Set(['manage','tools','node_modules','.git','docs','files']);
const pages=[];(function walk(d){for(const f of fs.readdirSync(d,{withFileTypes:true})){if(f.isDirectory()){if(!SKIP.has(f.name)&&!f.name.startsWith('.'))walk(path.join(d,f.name))}else if(f.name.endsWith('.html')&&!/^(admin|upload-files)\.html$/.test(f.name))pages.push(path.join(d,f.name))}})(root);
let total=0;const broken=[];
for(const pg of pages){const h=fs.readFileSync(pg,'utf8').replace(/<!--[\s\S]*?-->/g,'').replace(/<script[\s\S]*?<\/script>/gi,m=>m.startsWith('<script')&&/src=/.test(m.slice(0,200))?m.slice(0,200):'');
 for(const m of h.matchAll(/\b(?:href|src)="([^"]+)"/g)){let u=m[1].trim();if(!u||/^(https?:|mailto:|tel:|data:|javascript:|#|\/\/|blob:)/.test(u)||u.includes('${')||u.includes('{{'))continue;
  u=u.split('#')[0].split('?')[0];if(!u)continue;try{u=decodeURIComponent(u)}catch(e){}let t;if(u.startsWith('/zad-store/'))t=path.join(root,u.slice(10));else if(u.startsWith('/'))continue;else t=path.resolve(path.dirname(pg),u);
  total++;let ok=false;try{const s=fs.statSync(t);ok=s.isFile()||(s.isDirectory()&&fs.existsSync(path.join(t,'index.html')))}catch(e){}
  if(!ok)broken.push({page:path.relative(root,pg),link:m[1]})}}
const out={pages:pages.length,links:total,broken:broken.length,list:broken.slice(0,40)};console.log(JSON.stringify(out,null,1));process.exit(broken.length?1:0);
