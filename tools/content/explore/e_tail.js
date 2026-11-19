/* ===== لوحة متابعة الطفل وولي الأمر ===== */
let rstArm = false;
function progressPage() {
  const box = $("#aview"), lv = getLv(), core = ITEMS, done = core.filter((x) => isDone(x.slug)), rec = (x) => S.exp.it[x.slug], bd = badges();
  const wk = done.filter((x) => rec(x).t > Date.now() - 7 * 864e5), days = new Set(wk.map((x) => new Date(rec(x).t).toDateString())).size;
  const disc = (S.exp.disc || []).map((sl) => ITEMS.find((x) => x.slug === sl)).filter(Boolean);
  const lessons = done.filter((x) => x.kind === "lesson"), acts = done.filter((x) => x.kind !== "lesson" && x.kind !== "quiz" && x.kind !== "task");
  const qzs = ITEMS.filter((x) => x.kind === "quiz" && S.exp.qz && S.exp.qz[x.slug] != null);
  const skills = Array.from(new Set(done.map((x) => SKILL[x.kind]))).filter(Boolean);
  const review = core.filter((x) => { const r = rec(x); return r && r.w >= 2 && r.d <= 1; }).slice(0, 8);
  const ratio = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return its.length ? d / its.length : 1; };
  const order = VALS.slice().sort((a, b) => ratio(a) - ratio(b)).slice(0, 3);
  const tips = order.map((k) => ITEMS.find((x) => x.kind === "task" && x.cat === k)).filter(Boolean);
  const known = VALS.filter((k) => done.some((x) => x.cat === k));
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة المتابعة: الثقافة العامة والاستكشاف</h1><p>ما اكتشفه الطفل وما أكمله، للتشجيع والمراجعة معا. لا مقارنة بين الأطفال.</p></div></div>
<div class="pg2"><div><b>${AD(done.length)}</b>نشاطا مكتملا</div><div><b>${AD(lessons.length)}</b>درسا مكتملا</div><div><b>${AD(disc.length)}</b>موضوعا اكتشفه</div><div><b>${AD(S.exp.pts)}</b>نقطة</div></div>
<section class="art"><h2>ملخص هذا الأسبوع</h2><p class="tx">${wk.length ? `أكمل الطفل ${AD(wk.length)} نشاطا في ${AD(days)} ${days > 2 ? "أيام" : "يوم"}. اسألوه: ما أغرب معلومة عرفتها اليوم؟` : "لم تُسجَّل أنشطة هذا الأسبوع. درس واحد قصير يكفي للبداية، دون ضغط."}</p></section>
<section class="art"><h2>الموضوعات التي اكتشفها الطفل</h2>${disc.length ? `<div class="rvc">${disc.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">تظهر هنا الموضوعات بعد إكمال نشاط اكتشف العالم من الصفحة الرئيسية.</p>`}</section>
<section class="art"><h2>الدروس المكتملة</h2>${lessons.length ? `<div class="rvc">${lessons.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">ستظهر الدروس هنا بعد إكمالها.</p>`}</section>
<section class="art"><h2>الأنشطة التي أنجزها</h2>${acts.length ? `<p class="tx">${AD(acts.length)} نشاطا بين قصص وأسئلة ومطابقة وتصنيف وترتيب.</p><div class="rvc">${acts.slice(0, 20).map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">ستظهر الأنشطة بعد إكمالها.</p>`}</section>
<section class="art"><h2>نتائج الاختبارات القصيرة</h2>${qzs.length ? `<div class="sks">${qzs.map((x) => { const n = S.exp.qz[x.slug], t = x.data.qs.length; return `<div><span>${esc(x.title)}</span><b>${AD(n)} من ${AD(t)} من المحاولة الأولى</b><span class="bar"><i style="width:${(n / t) * 100}%"></i></span></div>`; }).join("")}</div><p class="hint">النتيجة أفضل محاولة، وللطفل أن يعيد الاختبار كما يشاء.</p>` : `<p class="tx">ستظهر النتائج بعد إكمال اختبار قصير.</p>`}</section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${skills.length ? `<ul class="tx">${skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="tx">ستظهر المهارات بعد إكمال الأنشطة.</p>`}</section>
<section class="art"><h2>التقدم في كل تصنيف</h2><p class="hint">المرحلة المعروضة: ${esc(LV[lv])}</p><div class="sks">${VALS.map((k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<div><span>${esc(PATHS[k][0])}</span><b>${AD(d)} من ${AD(its.length)}</b><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></div>`; }).join("")}</div></section>
${review.length ? `<section class="art"><h2>موضوعات يمكن مراجعتها</h2><p class="tx">لا بأس، العودة إلى هذه الموضوعات مرة أخرى تثبت المعلومة بهدوء.</p><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>أفكار استكشاف للأسرة</h2><ul class="rdtips">${tips.map((t) => `<li><b>${esc(t.title)}</b><p>${esc(t.family)}</p><ol>${t.data.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></li>`).join("")}</ul></section>
<section class="art"><h2>الشارات والإنجازات</h2>${bd.length ? `<div class="dgbd2">${bd.map((b) => `<span><img src="${icon(b[1])}" alt="" width="40" height="40"> ${esc(b[0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر الشارات بعد إكمال الأنشطة. الشارات تكافئ الجهد والفضول.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط، ولا تُرسل إلى أي حساب، ولا تظهر لأي زائر آخر. يُرسل فقط عدد الأخطاء المجهول لكل نشاط لتحسين المحتوى، دون اسم أو أي بيانات شخصية.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح تقدم الطفل في هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">متابعة الأنشطة</a><a class="abtn" href="../guide/">دليل ولي الأمر</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
  $("#rst").onclick = () => { if (!rstArm) { rstArm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد: سيُمسح التقدم"; return; } S.exp = { it: {}, pts: 0 }; save(); rstArm = false; progressPage(); toast("تم مسح تقدم هذا القسم."); };
}
/* ===== دليل ولي الأمر ===== */
function guidePage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>كيف ننمي فضول الطفل ومعرفته بالعالم بهدوء ومتعة.</p></div></div>
<section class="art"><h2>كيف تستخدم القسم؟</h2><ul class="tx"><li>اختر مرحلة طفلك. الأعمار الصغيرة تلعب بمشاركة الكبار الذين يقرؤون لهم.</li><li>ابدأ بنشاط اكتشف العالم من الصفحة الرئيسية، فهو يعرض موضوعا جديدا في كل مرة.</li><li>المستويات: أتعرف ثم أكتشف ثم أفهم، وكلها مفتوحة للطفل.</li><li>جلسة قصيرة من عشر دقائق أنفع من جلسة طويلة.</li></ul></section>
<section class="art"><h2>حسب العمر</h2><ul class="tx"><li><b>سنة إلى ٣ سنوات:</b> صور وأصوات ومطابقة بسيطة، مع قراءة الكبير وتسمية الأشياء.</li><li><b>٤ إلى ٦ سنوات:</b> بيئات الحيوانات وأجزاء النبات والكواكب والمهن ووسائل النقل بأسئلة قصيرة.</li><li><b>الصف الأول والثاني:</b> مبادئ العلوم والأرض والفضاء والبلدان والاختراعات والصحة.</li><li><b>الصف الثالث والرابع:</b> الظواهر الطبيعية والمجموعة الشمسية والقارات والمخترعون والطاقة.</li></ul></section>
<section class="art"><h2>كيف نتحدث بعد النشاط؟</h2><ul class="tx"><li>اسألوا: ماذا تعلمت اليوم؟ وما الذي أدهشك؟</li><li>اسألوا لماذا وكيف، وشجعوا الطفل على التخمين قبل الإجابة.</li><li>ابحثوا معا عن الجواب في كتاب أو موسوعة عندما لا تعرفون.</li><li>امدحوا الفضول والمحاولة لا النتيجة وحدها.</li></ul></section>
<section class="art"><h2>الأمان في الاستكشاف المنزلي</h2><ul class="tx"><li>كل نشاط استكشاف في القسم بمشاركة شخص بالغ.</li><li>لا نستخدم النار أو الأدوات الحادة أو المواد الكيميائية.</li><li>نغسل اليدين بعد لمس التراب والنباتات والحيوانات.</li><li>لا نأكل شيئا من الطبيعة قبل أن يتأكد الكبير منه.</li></ul></section>
<section class="art"><h2>عن صحة المعلومات</h2><p class="tx">كُتبت المعلومات بصياغة مبسطة وفُحصت بنيتها آليا، ولم تُراجع بعد من مختص تعليمي. إن وجدتم معلومة تحتاج تصحيحا فأخبرونا لنصححها.</p></section>
<div class="btns"><a class="abtn go" href="../">الثقافة العامة</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
}
/* ===== الطباعة ===== */
const PDFS = [["exp-animal-cards", "بطاقات الحيوانات", "ست بطاقات مصورة يمكن قصها واللعب بها.", "1f981"], ["exp-plant-parts", "ورقة أجزاء النبات", "صل بين جزء النبات ووظيفته.", "1f331"], ["exp-planets", "جدول الكواكب", "ترتيب الكواكب بالصور وأماكن للكتابة.", "1f680"], ["exp-senses", "ورقة الحواس الخمس", "اربط كل حاسة بعضوها وبما تفعله.", "1f440"], ["exp-jobs", "بطاقات المهن وأدواتها", "اربط المهنة بأداتها.", "x_doctor"], ["exp-transport", "تصنيف وسائل النقل", "صنف: بر وبحر وجو.", "1f697"], ["exp-explore-log", "سجل المستكشف الصغير", "صفحة لتسجيل ما اكتشفناه في المنزل.", "1f50d"], ["exp-parent-guide", "دليل ولي الأمر للطباعة", "صفحة نصائح مختصرة وآمنة.", "i_book"]];
function printPage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_notebook")}" alt=""><div><h1>أوراق وبطاقات للطباعة</h1><p>ملفات PDF جاهزة للتحميل والطباعة على ورق A4.</p></div></div><div class="dgl">${PDFS.map((x) => `<a class="dgi" href="${ROOT}files/explore/${x[0]}.pdf" target="_blank" rel="noopener"><img src="${icon(x[3])}" alt="" width="52" height="52"><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></a>`).join("")}</div><p class="hint">تُفتح الملفات في نافذة جديدة. عاين الملف قبل الطباعة.</p><p><a class="abtn" href="../">العودة إلى الثقافة العامة</a></p>`;
}
