// NODE_PATH=$(npm root -g) node tools/content/rec/test_recadm.js
const fs=require('fs');const src=fs.readFileSync(__dirname+'/../../../manage/recadm.js','utf8');const errs=[];const E=m=>{console.log('ERR',m);errs.push(m)};
global.window={__zp:{sb:{},$:()=>0,$$:()=>[],esc:x=>x,toast(){},sheet(){},closeSheet(){},fail(){},SUB:{}}};
new Function('window',src)(global.window);const T=window.__recTest;
const o={src:'bank',slug:'x',status:'on',levels:['a5','g1'],rtype:'review',priority:1,reason:null};
if(T.chkOv(o).length)E('سليم رُفض '+T.chkOv(o));
if(!T.chkOv({...o,levels:['g5']}).length)E('صف خامس قُبل');
if(!T.chkOv({...o,levels:['g6']}).length)E('صف سادس قُبل');
if(!T.chkOv({...o,levels:['a7']}).length)E('عمر 7 قُبل');
if(!T.chkOv({...o,src:'fake'}).length)E('مصدر وهمي قُبل');
if(!T.chkOv({...o,rtype:'x'}).length)E('نوع خاطئ قُبل');
if(!T.chkOv({...o,priority:9}).length)E('ترتيب خارج النطاق قُبل');
if(!T.chkOv({...o,status:'maybe'}).length)E('حالة خاطئة قُبلت');
if(T.chkOv({...o,reason:'مقترح لأن طفلك مارس مجال {domain} مؤخرًا.'}).length)E('سبب سليم رُفض');
if(!T.chkOv({...o,reason:'هذا أفضل من غيره عند الأطفال كثيرا.'}).length)E('مقارنة قُبلت');
if(!T.chkOv({...o,reason:'مقترح لأن 5 أطفال أحبوه كثيرا جدا.'}).length)E('رقم قُبل');
if(!T.chkReason('مقترح لـ {x} سببه واضح جدا',false).length)E('متغير مجهول قُبل');
if(!T.chkReason('نشاط بلا عنوان وسببه واضح جدا',true).length)E('بلا title قُبل');
console.log(errs.length?'FAILED '+errs.length:'ALL OK');process.exit(errs.length?1:0);
