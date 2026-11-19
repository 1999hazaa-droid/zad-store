/* ===== لوحة ولي الأمر ===== */
let rstArm = false;
function progressPage() {
  const box = $("#aview"), lv = getLv(), core = ITEMS.filter((x) => VALS.includes(x.cat) || x.cat === "what" || x.cat === "chal"), done = core.filter((x) => isDone(x.slug)), rec = (x) => S.val.it[x.slug], bd = badges();
  const wk = done.filter((x) => rec(x).t > Date.now() - 7 * 864e5), days = new Set(wk.map((x) => new Date(rec(x).t).toDateString())).size;
  const known = VALS.filter((k) => done.some((x) => x.cat === k));
  const skills = Array.from(new Set(done.map((x) => SKILL[x.kind]))).filter(Boolean);
  const review = core.filter((x) => { const r = rec(x); return r && r.w >= 2 && r.d <= 1 && x.kind !== "challenge"; }).slice(0, 8);
  const ratio = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return its.length ? d / its.length : 1; };
  const order = VALS.slice().sort((a, b) => ratio(a) - ratio(b)).slice(0, 3);
  const tips = order.map((k) => ITEMS.find((x) => x.kind === "task" && x.cat === k)).filter(Boolean);
  const chs = ITEMS.filter((x) => x.kind === "challenge" && S.val.ch && S.val.ch[x.slug]);
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة ولي الأمر: القيم والسلوك الإيجابي</h1><p>ما تعرّف عليه الطفل وما أكمله، للتشجيع والتأمل معا. لا نحكم على أخلاق الطفل ولا نقارنه بغيره.</p></div></div>
<div class="pg2"><div><b>${AD(done.length)}</b>نشاطا مكتملا</div><div><b>${AD(known.length)}</b>قيم تعرّف عليها</div><div><b>${AD(days)}</b>أيام نشاط هذا الأسبوع</div><div><b>${AD(S.val.pts)}</b>نقطة</div></div>
<section class="art"><h2>ملخص هذا الأسبوع</h2><p class="tx">${wk.length ? `أكمل الطفل ${AD(wk.length)} نشاطا في ${AD(days)} ${days > 2 ? "أيام" : "يوم"}. الحديث القصير بعد كل قصة عن مشاعر شخصياتها أنفع من الأسئلة الطويلة.` : "لم تُسجَّل أنشطة هذا الأسبوع. قصة واحدة قصيرة تكفي للبداية، دون ضغط."}</p></section>
<section class="art"><h2>القيم التي تعرّف عليها</h2>${known.length ? `<div class="rvc">${known.map((k) => `<span class="chp">${esc(PATHS[k][0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر هنا القيم بعد إكمال الأنشطة.</p>`}</section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${skills.length ? `<ul class="tx">${skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="tx">ستظهر المهارات بعد إكمال الأنشطة.</p>`}</section>
<section class="art"><h2>التقدم في كل قيمة</h2><p class="hint">المرحلة المعروضة: ${esc(LV[lv])}</p><div class="sks">${VALS.map((k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<div><span>${esc(PATHS[k][0])}</span><b>${AD(d)} من ${AD(its.length)}</b><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></div>`; }).join("")}</div></section>
${chs.length ? `<section class="art"><h2>التحديات</h2><div class="sks">${chs.map((x) => { const a = S.val.ch[x.slug], n = a.filter(Boolean).length; return `<div><span>${esc(x.title)}</span><b>${AD(n)} من ${AD(a.length)} أيام</b><span class="bar"><i style="width:${(n / a.length) * 100}%"></i></span></div>`; }).join("")}</div></section>` : ""}
${review.length ? `<section class="art"><h2>أنشطة مقترحة للمراجعة</h2><p class="tx">لا بأس، التفكير في هذه المواقف مرة أخرى يرسخ القيمة بهدوء.</p><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>أفكار تطبيقية للأسرة</h2><ul class="rdtips">${tips.map((t) => `<li><b>${esc(t.title)}</b><p>${esc(t.family)}</p><ol>${t.data.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></li>`).join("")}</ul></section>
<section class="art"><h2>الشارات</h2>${bd.length ? `<div class="dgbd2">${bd.map((b) => `<span><img src="${icon(b[1])}" alt="" width="40" height="40"> ${esc(b[0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر الشارات بعد إكمال الأنشطة. الشارات تكافئ الجهد والتعلم وليست حكما على شخصية الطفل.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط، ولا تُرسل إلى أي حساب، ولا تظهر لأي زائر آخر. يُرسل فقط عدد الأخطاء المجهول لكل نشاط لتحسين المحتوى، دون اسم أو أي بيانات شخصية. لا تُستعمل النتائج للحكم على أخلاق الطفل أو شخصيته.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح تقدم الطفل في هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">متابعة الأنشطة</a><a class="abtn" href="../guide/">دليل ولي الأمر</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
  $("#rst").onclick = () => { if (!rstArm) { rstArm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد: سيُمسح التقدم"; return; } S.val = { it: {}, pts: 0 }; save(); rstArm = false; progressPage(); toast("تم مسح تقدم هذا القسم."); };
}
/* ===== دليل ولي الأمر ===== */
function guidePage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>كيف نغرس القيم بهدوء من خلال القصة والموقف اليومي.</p></div></div>
<section class="art"><h2>كيف تستخدم القسم؟</h2><ul class="tx"><li>اختر مرحلة طفلك. الأعمار الصغيرة تلعب بمشاركة الكبار الذين يقرؤون لهم.</li><li>اقرؤوا القصة معا، ثم اتركوا الطفل يختار، ثم تحدثوا عن النتيجة.</li><li>جلسة قصيرة من ١٠ دقائق أنفع من جلسة طويلة.</li><li>لا تصححوا إجابات الطفل بقسوة، فكل خيار يعرض له نتيجة لطيفة.</li></ul></section>
<section class="art"><h2>حسب العمر</h2><ul class="tx"><li><b>١ إلى ٣ سنوات:</b> كلمات لطيفة مثل شكرا ومن فضلك، والتعرف على الفرح والحزن والغضب، وترتيب الألعاب مع الكبار.</li><li><b>٤ إلى ٦ سنوات:</b> قصص قصيرة عن الصدق والتعاون، ومواقف مصورة لاختيار التصرف المناسب، وانتظار الدور.</li><li><b>الصفوف ١ إلى ٤:</b> مواقف تتطلب قرارا، وتحمل المسؤولية، وحل الخلافات بهدوء، وأعمال جماعية بسيطة.</li></ul></section>
<section class="art"><h2>كيف نتحدث بعد القصة؟</h2><ul class="tx"><li>اسألوا: كيف شعر كل واحد في القصة؟</li><li>اسألوا: ماذا كنت ستفعل أنت؟ ولماذا؟</li><li>احكوا موقفا مشابها حدث لكم.</li><li>امدحوا الجهد والاختيار الجيد، لا الطفل كحكم على شخصيته.</li></ul></section>
<section class="art"><h2>ما نتجنبه</h2><ul class="tx"><li>لا نصف الطفل بصفة سلبية، بل نتحدث عن التصرف.</li><li>لا نقارنه بإخوته أو بزملائه.</li><li>لا نطلب منه صورا أو دليلا لإثبات إنجاز تحدٍّ.</li><li>لا نخيفه ولا نحرجه أمام الآخرين.</li></ul></section>
<section class="art"><h2>أفكار منزلية سريعة</h2><ul class="tx"><li>ساعة للكلمات اللطيفة كل يوم.</li><li>ركن ثابت لترتيب الألعاب.</li><li>مهمة صغيرة ثابتة لكل طفل.</li><li>جدار للفخر بالمحاولات.</li></ul></section>
<div class="btns"><a class="abtn go" href="../">التربية والقيم</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
}
/* ===== الطباعة ===== */
const PDFS = [["val-values-cards", "بطاقات القيم", "تسع بطاقات مصورة يمكن قصها وتعليقها.", "1f60a"], ["val-positive-chart", "لوحة السلوك الإيجابي", "لوحة يضع عليها الطفل نجمة لكل تصرف جميل.", "i_star"], ["val-tidy-schedule", "جدول ترتيب الأدوات", "جدول أسبوعي مصور لترتيب الألعاب والحقيبة.", "i_bag"], ["val-kind-words", "بطاقات الكلمات اللطيفة", "كلمات مثل شكرا ومن فضلك وآسف مع رسوم.", "1f64f"], ["val-challenges", "جدول التحديات", "ستة تحديات اختيارية بعلامات يومية.", "1f3c6"], ["val-feelings", "بطاقات المشاعر", "وجوه الفرح والحزن والغضب والخوف.", "1f622"], ["val-family-tracker", "جدول متابعة الأسرة", "ملاحظات إيجابية للأسرة بلا مقارنات.", "i_chart"], ["val-parent-guide", "دليل ولي الأمر للطباعة", "صفحة نصائح مختصرة.", "i_book"]];
function printPage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_notebook")}" alt=""><div><h1>أوراق وبطاقات للطباعة</h1><p>ملفات PDF جاهزة للتحميل والطباعة على ورق A4.</p></div></div><div class="dgl">${PDFS.map((x) => `<a class="dgi" href="${ROOT}files/values/${x[0]}.pdf" target="_blank" rel="noopener"><img src="${icon(x[3])}" alt="" width="52" height="52"><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></a>`).join("")}</div><p class="hint">تُفتح الملفات في نافذة جديدة. عاين الملف قبل الطباعة.</p><p><a class="abtn" href="../">العودة إلى التربية والقيم</a></p>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else if (PAGE === "print") printPage(); else hubPage(); })();
})();
