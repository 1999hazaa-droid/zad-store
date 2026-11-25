// NODE_PATH=$(npm root -g) node tools/content/plan/test_planadm.js
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../../../manage/planadm.js','utf8');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
global.window={__zp:{sb:{},$:()=>0,$$:()=>[],esc:x=>x,toast(){},sheet(){},closeSheet(){},fail(){},SUB:{}}};
new Function('window',src)(global.window);const T=window.__planTest;
const r={maxN:14,defN:{young:3,mid:5,school:5},perDay:{young:1,mid:2,school:2},defDays:{young:3,mid:4,school:4}};
if(T.chkRules(r).length)E('قواعد سليمة رُفضت '+T.chkRules(r));
if(!T.chkRules({...r,maxN:99}).length)E('maxN كبير قُبل');
if(!T.chkRules({...r,perDay:{...r.perDay,mid:9}}).length)E('أنشطة يوميًا كثيرة قُبلت');
if(!T.chkRules({...r,defN:{...r.defN,young:5}}).length)E('افتراضي يتجاوز سعة الأيام قُبل');
const doms=['arabic','math','arts'];const t={title:'أسبوع متوازن',data:{groups:['mid'],n:4,days:3,doms:['arabic'],review:true}};
if(T.chkTpl(t,doms,r).length)E('نموذج سليم رُفض '+T.chkTpl(t,doms,r));
if(!T.chkTpl({...t,data:{...t.data,groups:['g5']}},doms,r).length)E('فئة خارج النطاق قُبلت');
if(!T.chkTpl({...t,data:{...t.data,doms:['fake']}},doms,r).length)E('مجال وهمي قُبل');
if(!T.chkTpl({...t,data:{...t.data,n:9}},doms,r).length)E('عدد أكبر من سعة الأيام قُبل');
if(!T.chkTpl({...t,data:{...t.data,groups:['young'],n:4}},doms,r).length)E('صغار 4 أنشطة في 3 أيام قُبلت');
if(!T.chkTpl({...t,title:'<b>x</b>'},doms,r).length)E('عنوان غير عربي قُبل');
console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0);
