/* إدارة الثقافة العامة والمعرفة والاستكشاف (دروس، قصص، اختبارات قصيرة، تصنيف، ترتيب، مطابقة، استكشاف منزلي) + متابعة الاستخدام — داخل لوحة زاد المحمية. لا نشر قبل مراجعة المعلومات. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["animals", "عالم الحيوانات"], ["plants", "عالم النباتات"], ["space", "الفضاء والكواكب"], ["earth", "الأرض والطبيعة"], ["body", "جسم الإنسان والحواس"], ["transport", "وسائل النقل"], ["jobs", "المهن والأعمال"], ["places", "البلدان والمعالم"], ["invent", "الاختراعات والتقنية"], ["culture", "الثقافة والمعرفة العامة"]];
const KINDS = [["lesson", "درس مصور"], ["story", "قصة تعليمية"], ["quiz", "اختبار قصير"], ["order", "ترتيب"], ["sort", "تصنيف"], ["match", "مطابقة"], ["task", "استكشاف مع الأسرة"]];
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const STEPS = [[1, "١ أتعرف"], [2, "٢ أكتشف"], [3, "٣ أفهم"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "مخفي"]];
const CN = Object.fromEntries(CATS), KN = Object.fromEntries(KINDS), SN = Object.fromEntries(ST);
const IC = (c) => (String(c).startsWith("dg_") ? `../images/dig/${c}.svg` : String(c).startsWith("rd_") ? `../images/ready/${c}.svg` : `../images/zad/${c}.webp`);
const AR_RE = /^[ء-ي٠-٩\s.،؟!:\-0-9]+$/;
const EX = {
  lesson: '{"goal":"هدف الدرس","pages":[{"t":"جملة الشرح.","img":"i_smile","k":"explain"},{"t":"جملة الشرح الثانية.","img":"i_smile","k":"explain"},{"t":"مثال قصير.","img":"i_smile","k":"example"}],"check":{"q":"سؤال؟","o":["الصحيح","خطأ","خطأ"],"a":0,"why":"تفسير قصير"}}',
  story: '{"pages":[{"t":"بداية القصة.","img":"i_smile"},{"t":"وسط القصة.","img":"i_smile"},{"t":"نهاية القصة.","img":"i_smile"}],"quiz":{"q":"سؤال فهم؟","o":["الصحيح","خطأ","خطأ"],"a":0,"why":"تفسير"},"act":"نشاط تطبيقي بسيط"}',
  quiz: '{"qs":[{"q":"سؤال ١؟","o":["الصحيح","خطأ","خطأ"],"a":0,"why":"تفسير"},{"q":"سؤال ٢؟","o":["الصحيح","خطأ","خطأ"],"a":0,"why":"تفسير"},{"q":"سؤال ٣؟","o":["الصحيح","خطأ","خطأ"],"a":0,"why":"تفسير"},{"q":"سؤال ٤؟","o":["الصحيح","خطأ","خطأ"],"a":0,"why":"تفسير"}]}',
  order: '{"q":"رتب الخطوات","steps":["الخطوة الأولى","الخطوة الثانية","الخطوة الثالثة","الخطوة الرابعة"]}',
  sort: '{"q":"ضع كل تصرف في مكانه","groups":["تصرف جميل","تصرف نغيره"],"items":[{"t":"أ1","g":0},{"t":"أ2","g":0},{"t":"أ3","g":0},{"t":"ب1","g":1},{"t":"ب2","g":1},{"t":"ب3","g":1}]}',
  match: '{"q":"وصل كل صورة بما يناسبها","pairs":[{"l":{"t":"","img":"1f60a"},"r":{"t":"فرح"}},{"l":{"t":"","img":"1f622"},"r":{"t":"حزن"}},{"l":{"t":"","img":"1f620"},"r":{"t":"غضب"}}],"adult":false}',
  task: '{"steps":["خطوة أولى","خطوة ثانية","خطوة ثالثة"],"adult":true}',
};
function checkData(d, kind, family) {
  const e = [], ch = (t, w) => { if (!AR_RE.test(String(t == null ? "" : t).trim())) e.push("نص غير عربي أو يحتوي رموزا غير مقبولة" + (w || "") + ": " + String(t).slice(0, 20)); };
  const opts = (o, a, w) => { if (!Array.isArray(o) || o.length !== 3 || new Set(o).size !== 3) e.push("ثلاثة خيارات مختلفة" + (w || "")); else o.forEach((x) => ch(x, w)); if (a !== 0) e.push("الإجابة الصحيحة هي الخيار الأول في المصدر (a=0)" + (w || "")); };
  if (!d || typeof d !== "object") return ["البيانات ناقصة"];
  if (kind === "lesson") { if (!Array.isArray(d.pages) || d.pages.length < 3 || d.pages.length > 4) e.push("الدرس من ثلاث إلى أربع صفحات"); else d.pages.forEach((p, i) => { ch(p.t, " (صفحة " + (i + 1) + ")"); if (!/^[0-9a-z_-]+$/i.test(p.img || "")) e.push("رمز صورة الصفحة " + (i + 1)); }); if (!d.check) e.push("سؤال التحقق ناقص"); else { ch(d.check.q); ch(d.check.why); opts(d.check.o, d.check.a); } }
  else if (kind === "order") { ch(d.q); if (!Array.isArray(d.steps) || d.steps.length < 4 || d.steps.length > 6 || new Set(d.steps).size !== d.steps.length) e.push("من أربع إلى ست خطوات مختلفة بالترتيب الصحيح"); else d.steps.forEach((x) => ch(x)); }
  else if (kind === "sort") { ch(d.q); if (!Array.isArray(d.groups) || d.groups.length < 2 || d.groups.length > 3) e.push("مجموعتان أو ثلاث"); else d.groups.forEach((x) => ch(x)); if (!Array.isArray(d.items) || d.items.length < 6) e.push("ست بطاقات على الأقل"); else { d.items.forEach((x) => { ch(x.t); if (!(x.g >= 0 && x.g < (d.groups || []).length)) e.push("مجموعة بطاقة غير صحيحة: " + x.t); }); if (new Set(d.items.map((x) => x.g)).size !== (d.groups || []).length) e.push("كل مجموعة تحتاج بطاقة واحدة على الأقل"); } }
  else if (kind === "story") { if (!Array.isArray(d.pages) || d.pages.length !== 3) e.push("القصة من ثلاث صفحات"); else d.pages.forEach((p, i) => { ch(p.t, " (صفحة " + (i + 1) + ")"); if (!/^[0-9a-z_-]+$/i.test(p.img || "")) e.push("رمز صورة الصفحة " + (i + 1)); }); const qz = d.quiz || {}; ch(qz.q); ch(qz.why); opts(qz.o, qz.a); ch(d.act); if (!family) e.push("اقتراح الأسرة ناقص"); }
  else if (kind === "quiz") { if (!Array.isArray(d.qs) || d.qs.length !== 4) e.push("اختبار من أربعة أسئلة"); else d.qs.forEach((q, i) => { ch(q.q, " (سؤال " + (i + 1) + ")"); ch(q.why); opts(q.o, q.a, " (سؤال " + (i + 1) + ")"); }); }
  else if (kind === "match") { ch(d.q); if (!Array.isArray(d.pairs) || d.pairs.length < 3 || d.pairs.length > 4) e.push("ثلاثة أو أربعة أزواج"); else d.pairs.forEach((p) => ["l", "r"].forEach((k) => { const x = p[k] || {}; if (x.t) ch(x.t); if (x.img && !/^[0-9a-z_-]+$/i.test(x.img)) e.push("رمز صورة غير صالح"); if (!x.t && !x.img) e.push("طرف فارغ في زوج"); })); }
  else if (kind === "task") { if (!Array.isArray(d.steps) || d.steps.length < 3 || d.steps.length > 5) e.push("من ثلاث إلى خمس خطوات"); else d.steps.forEach((x) => ch(x)); if (!family) e.push("اقتراح الأسرة ناقص"); else ch(family, " (الأسرة)"); }
  return e;
}
const readiness = (d) => { const m = []; if (!d.title) m.push("العنوان"); const L = d.levels || []; if (!L.length) m.push("العمر أو الصف"); if (L.includes("a2") && !["lesson", "match", "task"].includes(d.kind)) m.push("عمر سنة إلى سنتين: دروس وتوصيل ومهام فقط"); if (L.includes("a2") && ["task", "match"].includes(d.kind) && !(d.data && d.data.adult)) m.push("نشاط السنة إلى السنتين يحتاج adult=true"); if (d.kind === "story" && L.includes("a2")) m.push("القصص من ٤ سنوات"); if (!d.reviewed) m.push("تأكيد مراجعة المعلومات"); if (!d.review_note) m.push("ملاحظة المراجعة"); return m.concat(checkData(d.data, d.kind, d.family)); };
let ALL = [], FS = "", FC = "", FK = "", FQ = "", USE = {};
async function load() {
  const r = await sb.from("exp_items").select("*").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || [];
  const e = await sb.from("exp_events").select("slug,wrong").order("id", { ascending: false }).limit(5000); USE = {};
  (e.data || []).forEach((x) => { const u = (USE[x.slug] = USE[x.slug] || { n: 0, w: 0 }); u.n++; u.w += x.wrong || 0; });
}
SUB.expadm = { title: "إدارة الثقافة العامة", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length;
  const top = Object.entries(USE).sort((a, b) => b[1].n - a[1].n).slice(0, 5), err = Object.entries(USE).filter((x) => x[1].n >= 2).sort((a, b) => b[1].w / b[1].n - a[1].w / a[1].n).slice(0, 5);
  const ttl = (slug) => (ALL.find((x) => x.slug === slug) || { title: slug }).title;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div></div>
  <details style="margin:8px 0"><summary style="font-weight:700">الأنشطة الأكثر استخدامًا والأخطاء</summary><p class="mut">الأعلى استخدامًا: ${top.length ? top.map(([s, u]) => esc(ttl(s)) + " (" + u.n + ")").join("، ") : "لا بيانات بعد"}</p><p class="mut">أكثر أخطاء لكل محاولة: ${err.length ? err.map(([s, u]) => esc(ttl(s)) + " (" + (u.w / u.n).toFixed(1) + ")").join("، ") : "لا بيانات بعد"}</p><p class="mut">تُسجَّل عند إكمال النشاط: رمز النشاط وعدد الأخطاء فقط، دون أي بيانات شخصية.</p></details>
  <p class="mut">التصنيفات ثابتة. ملفات PDF للطباعة تُنشأ من أداة المستودع. لا تضع أوصافا سلبية للطفل في أي نص، ولا مواقف مخيفة أو محرجة. ملفات PDF للطباعة تُنشأ من أداة المستودع، ولا يوجد رفع مباشر لها من هنا.</p>
  <div class="row"><button class="btn" id="fn">➕ نشاط جديد</button></div>
  <input type="search" id="fqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="fch" style="margin-top:8px"></div><div class="chips" id="fcc" style="margin-top:6px"></div><div class="chips" id="fkc" style="margin-top:6px"></div><div id="fls"></div>`;
  const draw = () => {
    $("#fch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#fcc").innerHTML = [["", "كل التصنيفات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    $("#fkc").innerHTML = [["", "كل الأنواع"], ...KINDS].map(([k, l]) => `<button class="chip ${FK === k ? "on" : ""}" data-k="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.cat === FC) && (!FK || x.kind === FK) && (!q || x.title.toLowerCase().includes(q)));
    $("#fls").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "i_smile"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.cat])} · ${esc(KN[x.kind])} · مستوى ${x.step} · ${esc(SN[x.status])}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا يوجد محتوى.</p>`;
    $$("#fch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#fcc [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#fkc [data-k]").forEach((b) => b.onclick = () => { FK = b.dataset.k; draw(); });
    $$("#fls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#fqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#fn").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice() }) : { slug: "ex-" + Date.now().toString(36), cat: "animals", kind: "quiz", title: "", icon: "", levels: [], step: 1, data: JSON.parse(EX.quiz), family: "", review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}"></label>`;
  const SEL = (id, l, o, v) => `<label class="f"><span>${l}</span><select id="${id}">${o.map(([k, x]) => `<option value="${k}" ${String(v) === String(k) ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
  const s = sheet(`<h2>${isNew ? "نشاط جديد" : "تعديل النشاط"}</h2>
  <p class="mut">الصق بنية البيانات بصيغة JSON حسب النوع. يفحص النظام الأحرف والإجابات والبنية قبل الحفظ، ولا يُنشر قبل تأكيد المراجعة. الإجابة الصحيحة تُكتب أولًا في الخيارات وتُخلط تلقائيًا للطفل. لا تضع عبارات تحرج الطفل أو تصفه بصفة سلبية.</p>
  ${T("ft", "العنوان", d.title)}${SEL("fc", "التصنيف", CATS, d.cat)}${SEL("fk", "النوع", KINDS, d.kind)}${SEL("fsp", "المستوى (مبتدئ … متقدم)", STEPS, d.step)}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="flv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("fic", "رمز الرسمة الكرتونية (اسم ملف من images/zad أو اسم رسمة rd_/dg_ بدون الامتداد)", d.icon)}${T("ffm", "اقتراح للأسرة (يلزم للمهام)", d.family)}
  <label class="f"><span>البيانات (JSON)</span><textarea id="fd" rows="12" dir="ltr" style="font-family:monospace">${esc(JSON.stringify(d.data, null, 1))}</textarea></label><button type="button" class="btn g" id="fex">إدراج مثال لهذا النوع</button>
  <label class="f"><span>ملاحظة المراجعة (من راجع المعنى والسلامة والملاءمة للعمر؛ تلزم قبل النشر)</span><textarea id="frv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="frc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ المحتوى وأؤكد أنه آمن ودقيق ومناسب للفئة العمرية</span></label>
  ${SEL("fst", "حالة النشر (مخفي يخفيه عن الأطفال)", ST, d.status)}
  <p id="fmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="fsv">حفظ</button><button class="btn g" id="fpv">معاينة</button></div><div class="row"><button class="btn g" id="fx">إغلاق</button></div>`);
  $("#fx", s).onclick = closeSheet;
  $$("#flv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  $("#fex", s).onclick = () => { $("#fd", s).value = JSON.stringify(JSON.parse(EX[$("#fk", s).value]), null, 1); };
  const collect = () => {
    d.title = $("#ft", s).value.trim(); d.cat = $("#fc", s).value; d.kind = $("#fk", s).value; d.step = +$("#fsp", s).value; d.icon = $("#fic", s).value.trim() || null; d.family = $("#ffm", s).value.trim() || null;
    d.review_note = $("#frv", s).value.trim(); d.reviewed = $("#frc", s).checked; d.status = $("#fst", s).value;
    try { d.data = JSON.parse($("#fd", s).value); } catch { throw new Error("صيغة JSON للبيانات غير صحيحة"); }
  };
  $("#fpv", s).onclick = () => { try { collect(); } catch (x) { $("#fmiss", s).textContent = x.message; return; } const er = checkData(d.data, d.kind, d.family); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><b>${esc(d.title)}</b><p>${esc(CN[d.cat])} · ${esc(KN[d.kind])} · مستوى ${d.step}</p><pre dir="ltr" style="white-space:pre-wrap;font-size:12px">${esc(JSON.stringify(d.data, null, 1))}</pre></div>${er.length ? `<p style="color:var(--no);font-weight:700">أخطاء: ${esc(er.join("؛ "))}</p>` : `<p style="color:#1f7a3a;font-weight:700">البنية سليمة</p>`}<div class="row"><button class="btn g" id="fpx">إغلاق المعاينة</button></div></div>`; document.body.appendChild(o); $("#fpx", o).onclick = () => o.remove(); };
  $("#fsv", s).onclick = async () => {
    try { collect(); } catch (x) { $("#fmiss", s).textContent = x.message; return; }
    if (!d.title) { $("#fmiss", s).textContent = "اكتب العنوان"; return; }
    if (d.status === "published") { const miss = readiness(d); if (miss.length) { $("#fmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#fmiss", s).textContent = ""; $("#fsv", s).disabled = true;
    try {
      const row = { slug: d.slug, cat: d.cat, kind: d.kind, title: d.title, icon: d.icon, levels: d.levels, step: d.step, data: d.data, family: d.family, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("exp_items").insert(row) : await sb.from("exp_items").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#fsv", s).disabled = false; }
  };
}
})();
