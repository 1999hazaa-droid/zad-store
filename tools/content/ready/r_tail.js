/* ===== يومي الأول في المدرسة ===== */
function dayPage() {
  const box = $("#aview"), lv = getLv(), its = ITEMS.filter((x) => x.cat === "day" && x.levels.includes(lv)).sort((a, b) => a.sort_order - b.sort_order); setLv(lv);
  const intro = () => { box.innerHTML = `<div class="hero"><img src="${icon("i_bag")}" alt=""><div><h1>يومي الأول في المدرسة</h1><p>ثمانية مشاهد كرتونية قصيرة: من الاستيقاظ إلى ترتيب الأدوات. في كل مشهد تختار ما تفعله، ويمكنك إعادة المحاولة بلا أي عقوبة.</p></div></div>${stagePills(lv, "./")}${its.length ? `<div class="btns"><button type="button" class="abtn go" id="go">ابدأ يومي</button><a class="abtn" href="../?lv=${lv}">رجوع</a></div>` : `<div class="sempty"><h3>لا مشاهد لهذه المرحلة</h3><p class="hint">هذه التجربة لعمر ٤ سنوات فأكثر. للأصغر سنا جرّب المسارات.</p><a class="abtn go" href="../?lv=${lv}">المسارات</a></div>`}`; const g = $("#go"); if (g) g.onclick = go; };
  let i = 0;
  const end = () => { MODE = null; S.ready.day = { n: ((S.ready.day || {}).n || 0) + 1, t: Date.now() }; S.ready.pts += 20; save(); box.innerHTML = `<div class="res"><div class="st">🎒</div><h2>أنهيت يومك الأول في المدرسة!</h2><p>مررت بثمانية مشاهد وتعلمت كيف يسير اليوم المدرسي. حصلت على ٢٠ نقطة إضافية. مجموع نقاطك ${AD(S.ready.pts)}.</p><div class="rv"><b>مع الأسرة:</b><p>تحدثوا مع الطفل عن المشهد الذي أعجبه أكثر، وعن أي شيء يقلقه بهدوء.</p></div><div class="btns"><button type="button" class="abtn go" id="ag">أعد اليوم</button><a class="abtn" href="../?lv=${lv}">المسارات</a></div></div>`; $("#ag").onclick = () => { i = 0; go(); }; };
  const go = () => { if (i >= its.length) return end(); MODE = { chk: false, label: () => `المشهد ${AD(i + 1)} من ${AD(its.length)}`, back: `<p><a class="abtn" href="../?lv=${lv}">خروج</a></p>`, fn: (it, wrong) => { record(it, wrong); i++; go(); } }; playPage(its[i]); };
  intro();
}
/* ===== اختبار المهارات الأولية: مؤشرات وليست تشخيصا ===== */
function checkPage() {
  const box = $("#aview"), lv = getLv(), its = ITEMS.filter((x) => x.cat === "chk" && x.levels.includes(lv)).sort((a, b) => a.sort_order - b.sort_order); setLv(lv);
  const young = lv === "a2" || lv === "a3";
  box.innerHTML = `<div class="hero"><img src="${icon("i_target")}" alt=""><div><h1>اختبار المهارات الأولية</h1><p>ألعاب قصيرة تساعدنا على معرفة ما يمكن أن نلعب به لاحقا. ليست امتحانا، ولا توجد درجات.</p></div></div>${stagePills(lv, "./")}
<section class="art"><h2>قبل أن نبدأ</h2><ul class="tx"><li>النتائج مؤشرات للتعلم والتدريب فقط، وليست تشخيصا طبيا أو حكما على استعداد الطفل للمدرسة.</li><li>يجلس الكبير بجانب الطفل ويشجعه ولا يصحح له.</li><li>يمكن إعادة الاختبار في أي وقت، وتُحفظ النتيجة في هذا الجهاز فقط.</li></ul></section>
${young || !its.length ? `<div class="sempty"><h3>هذا الاختبار لعمر ٤ سنوات فأكثر</h3><p class="hint">للأعمار الأصغر نقترح ملاحظة الطفل أثناء اللعب بمساعدة جدول متابعة المهارات في صفحة الطباعة.</p><a class="abtn go" href="../print/">أوراق وجداول للطباعة</a></div>` : `<div class="btns"><button type="button" class="abtn go" id="go">ابدأ الألعاب</button><a class="abtn" href="../?lv=${lv}">رجوع</a></div>`}`;
  const g = $("#go"); if (!g) return; let i = 0; const res = {};
  const end = () => { MODE = null; S.ready.chk = { res, t: Date.now(), lv }; save(); showRes(box, res, lv); };
  const go = () => { if (i >= its.length) return end(); MODE = { chk: true, label: () => `لعبة ${AD(i + 1)} من ${AD(its.length)}`, back: `<p class="hint">لا توجد إجابة خاطئة هنا. نلعب لنتعرف على ما يمكن التدرب عليه.</p>`, fn: (it, wrong) => { const a = it.data.area; (res[a] = res[a] || { c: 0, n: 0 }).n++; if (!wrong) res[a].c++; try { fetch(SB + "/rest/v1/ready_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ slug: it.slug, wrong: Math.min(wrong, 50) }) }).catch(() => {}); } catch {} i++; go(); } }; playPage(its[i]); };
  g.onclick = go;
}
const IND = (c, n) => (c >= n ? ["تظهر المهارة بوضوح، استمر في اللعب بها", "g"] : c >= n - 1 ? ["تظهر المهارة وتحتاج إلى مزيد من التدريب", "m"] : ["مهارة يمكن التدرب عليها بالألعاب", "t"]);
function showRes(box, res, lv) {
  const keys = Object.keys(AREAS).filter((a) => res[a]);
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>مؤشرات المهارات</h1><p>شكرا للعب! هذه مؤشرات لطيفة تساعدنا على اختيار الألعاب المناسبة.</p></div></div>
<section class="art"><div class="sks">${keys.map((a) => { const r = res[a], ind = IND(r.c, r.n); return `<div><span>${esc(AREAS[a][0])}</span><b>${esc(ind[0])}</b><span class="bar"><i style="width:${(r.c / r.n) * 100}%"></i></span>${r.c < r.n ? `<a class="abtn" href="../?c=${AREAS[a][1]}&lv=${lv}">ألعاب للتدرب</a>` : ""}</div>`; }).join("")}</div></section>
<div class="rv"><b>تذكير:</b><p>هذه النتائج ليست تشخيصا طبيا ولا حكما على استعداد الطفل للمدرسة، فالأطفال يتعلمون بإيقاعات مختلفة. إن كانت لديكم أسئلة عن نمو الطفل فمعلمته أو مختص في الطفولة المبكرة أقدر على مساعدتكم.</p></div>
<div class="btns"><a class="abtn go" href="../progress/?lv=${lv}">لوحة ولي الأمر</a><a class="abtn" href="../?lv=${lv}">المسارات</a></div>`;
}
/* ===== لوحة ولي الأمر ===== */
let rstArm = false;
function progressPage() {
  const box = $("#aview"), lv = getLv(), pk = Object.keys(PATHS), core = ITEMS.filter((x) => x.cat !== "day" && x.cat !== "chk"), done = core.filter((x) => isDone(x.slug)), rec = (x) => S.ready.it[x.slug], bd = badges();
  const wk = done.filter((x) => rec(x).t > Date.now() - 7 * 864e5), days = new Set(wk.map((x) => new Date(rec(x).t).toDateString())).size;
  const practiced = pk.filter((k) => done.some((x) => PATHS[k][2].includes(x.cat)));
  const review = core.filter((x) => { const r = rec(x); return r && r.w >= 2 && r.d <= 1; }).slice(0, 8);
  const chk = S.ready.chk, weak = chk ? Object.keys(chk.res).filter((a) => chk.res[a].c <= chk.res[a].n - 2) : [];
  const ratio = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return its.length ? d / its.length : 1; };
  const order = Array.from(new Set(weak.map((a) => AREAS[a][1]).concat(pk.slice().sort((a, b) => ratio(a) - ratio(b))))).slice(0, 3);
  const tips = order.map((k) => ITEMS.find((x) => x.kind === "task" && PATHS[k][2].includes(x.cat))).filter(Boolean);
  const dd = S.ready.day;
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة ولي الأمر: الاستعداد المدرسي</h1><p>ما تدرب عليه الطفل وما أكمله وما يحتاج إلى تدريب. للتشجيع وليس للمقارنة بين الأطفال.</p></div></div>
<div class="pg2"><div><b>${AD(done.length)}</b>نشاطا مكتملا</div><div><b>${AD(practiced.length)}</b>مهارات تدرب عليها</div><div><b>${AD(days)}</b>أيام نشاط هذا الأسبوع</div><div><b>${AD(S.ready.pts)}</b>نقطة</div></div>
<section class="art"><h2>ملخص هذا الأسبوع</h2><p class="tx">${wk.length ? `أكمل الطفل ${AD(wk.length)} نشاطا في ${AD(days)} ${days > 2 ? "أيام" : "يوم"}. استمرار اللعب القصير كل يوم أنفع من جلسة طويلة.` : "لم تُسجَّل أنشطة هذا الأسبوع. بضع دقائق من اللعب تكفي للبداية، دون ضغط."}${dd ? ` أنهى الطفل «يومي الأول في المدرسة» ${AD(dd.n)} ${dd.n > 2 ? "مرات" : "مرة"}.` : ""}</p></section>
<section class="art"><h2>التقدم في كل مجال</h2><p class="hint">المرحلة المعروضة: ${esc(LV[lv])}</p><div class="sks">${pk.map((k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length, inf = stepInfo(k, lv), cur = Object.keys(inf).map(Number).find((q) => inf[q].d < inf[q].n); return `<div><span>${esc(PATHS[k][0])}</span><b>${AD(d)} من ${AD(its.length)}${cur ? " · المستوى: " + STEPS[cur][0] : its.length ? " · أنهى كل المستويات" : ""}</b><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></div>`; }).join("")}</div></section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${practiced.length ? `<div class="rvc">${practiced.map((k) => `<span class="chp">${esc(PATHS[k][0].replace("مسار ", ""))}</span>`).join("")}</div>` : `<p class="tx">ستظهر هنا المهارات بعد إكمال الأنشطة.</p>`}</section>
${chk ? `<section class="art"><h2>آخر مؤشرات للمهارات</h2><div class="sks">${Object.keys(AREAS).filter((a) => chk.res[a]).map((a) => `<div><span>${esc(AREAS[a][0])}</span><b>${esc(IND(chk.res[a].c, chk.res[a].n)[0])}</b></div>`).join("")}</div><p class="hint">هذه مؤشرات للتدريب وليست تشخيصا. أعيدوا الاختبار بعد أسابيع من اللعب.</p></section>` : ""}
${review.length || weak.length ? `<section class="art"><h2>مهارات تحتاج إلى مزيد من التدريب</h2><p class="tx">لا بأس، هذه فرص للعب والتدريب بهدوء.</p><div class="lks">${weak.map((a) => `<a class="abtn" href="../?c=${AREAS[a][1]}&lv=${lv}">${esc(AREAS[a][0])}</a>`).join("")}${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>أنشطة منزلية مقترحة</h2><ul class="rdtips">${tips.map((t) => `<li><b>${esc(t.title)}</b><p>${esc(t.family)}</p><ol>${t.data.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></li>`).join("")}</ul></section>
<section class="art"><h2>الشارات</h2>${bd.length ? `<div class="dgbd2">${bd.map((b) => `<span><img src="${icon(b[1])}" alt="" width="40" height="40"> ${esc(b[0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر الشارات بعد إكمال الأنشطة.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط، ولا تُرسل إلى أي حساب، ولا تظهر لأي زائر آخر. يُرسل فقط عدد الأخطاء المجهول لكل نشاط لتحسين المحتوى، دون اسم أو أي بيانات شخصية.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح تقدم الطفل في هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">متابعة الأنشطة</a><a class="abtn" href="../guide/">دليل ولي الأمر</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
  $("#rst").onclick = () => { if (!rstArm) { rstArm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد: سيُمسح التقدم"; return; } S.ready = { it: {}, pts: 0 }; save(); rstArm = false; progressPage(); toast("تم مسح تقدم هذا القسم."); };
}
/* ===== دليل ولي الأمر ===== */
function guidePage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>خطوات بسيطة لدعم استعداد طفلك للمدرسة بهدوء وثقة.</p></div></div>
<section class="art"><h2>كيف تستخدم القسم؟</h2><ul class="tx"><li>اختر مرحلة طفلك من الصفحة الرئيسية. الأعمار الصغيرة تلعب بمشاركة الكبار.</li><li>جلسة قصيرة من ١٠ إلى ١٥ دقيقة كل يوم أفضل من جلسة طويلة.</li><li>ابدأ من المستوى المبتدئ، ولا تنتقل لأصعب قبل أن يرتاح الطفل.</li><li>شجع المحاولة قبل الصواب، وكرر النشاط الذي يحبه.</li></ul></section>
<section class="art"><h2>حسب العمر</h2><ul class="tx"><li><b>١ إلى ٣ سنوات:</b> أسماء الأشياء والألوان والأشكال، والمطابقة، وأجزاء الجسم، وألعاب الحركة الآمنة معكم.</li><li><b>٤ و٥ سنوات:</b> الحروف والأرقام والعد، والتتبع بالقلم، والقصص، وتعليمات قصيرة من خطوتين أو ثلاث.</li><li><b>٦ سنوات:</b> مراجعة الأصوات، وكلمات وجمل قصيرة، وجمع وطرح بالصور، وتجهيز الحقيبة وتنظيم الوقت.</li><li><b>الصفان الأول والثاني:</b> تقوية المهارات الأساسية بتدريب إضافي لطيف، وتنظيم وقت الواجب.</li></ul></section>
<section class="art"><h2>كيف نقرأ المؤشرات؟</h2><p class="tx">اختبار المهارات الأولية يعطي مؤشرات للتدريب فقط، وليس تشخيصا ولا حكما نهائيا. الأطفال ينمون بإيقاعات مختلفة، ونتائج اليوم قد تتغير بعد أسابيع من اللعب. لا تقارنوا طفلكم بغيره.</p></section>
<section class="art"><h2>متى نسأل مختصا؟</h2><p class="tx">إن لاحظتم قلقا مستمرا أو صعوبة واضحة ومتكررة في فهم الكلام أو الحركة أو الانتباه، فاسألوا معلمة الطفل أو مختصا في الطفولة المبكرة. هذا القسم للتدريب واللعب ولا يغني عن رأي المختص.</p></section>
<section class="art"><h2>أفكار منزلية سريعة</h2><ul class="tx"><li>عدوا الدرجات والملاعق وأصابع اليد.</li><li>اقرؤوا قصة قصيرة كل يوم واسألوا: ماذا حدث بعد ذلك؟</li><li>ابحثوا عن أشكال وألوان في البيت.</li><li>اتركوه يجهز حقيبته مساء ثم راجعوها معه بهدوء.</li><li>العبوا لعبة المعلمة والطالب للتعود على المدرسة.</li></ul></section>
<div class="btns"><a class="abtn go" href="../">الاستعداد المدرسي</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
}
/* ===== الطباعة ===== */
const PDFS = [["ready-trace-lines", "ورقة تتبع الخطوط", "خطوط منقطة متدرجة لتدريب اليد على القلم.", "i_pencil"], ["ready-shapes-colors", "ورقة الأشكال والألوان", "تلوين الأشكال ووصلها بأسمائها.", "rd_circle_red"], ["ready-counting", "ورقة العد والمطابقة", "عد الصور ومطابقتها بالأرقام.", "i_n3"], ["ready-patterns", "ورقة الأنماط", "أنماط من الصور يكملها الطفل.", "1f9e9"], ["ready-school-bag", "قائمة تجهيز الحقيبة", "قائمة مصورة يضع الطفل عليها علامة.", "i_bag"], ["ready-daily-schedule", "جدول الروتين المدرسي", "جدول مصور للأسبوع.", "i_clock"], ["ready-skills-tracker", "جدول متابعة المهارات", "جدول للأسرة تضع فيه ملاحظاتها الإيجابية.", "i_chart"], ["ready-parent-guide", "دليل ولي الأمر للطباعة", "صفحة نصائح مختصرة للأسرة.", "i_book"]];
function printPage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_notebook")}" alt=""><div><h1>أوراق وجداول للطباعة</h1><p>ملفات PDF جاهزة للتحميل والطباعة على ورق A4.</p></div></div><div class="dgl">${PDFS.map((x) => `<a class="dgi" href="${ROOT}files/ready/${x[0]}.pdf" target="_blank" rel="noopener"><img src="${icon(x[3])}" alt="" width="52" height="52"><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></a>`).join("")}</div><p class="hint">تُفتح الملفات في نافذة جديدة. عاين الملف قبل الطباعة.</p><p><a class="abtn" href="../">العودة إلى الاستعداد المدرسي</a></p>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "day") dayPage(); else if (PAGE === "check") checkPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else if (PAGE === "print") printPage(); else hubPage(); })();
})();
