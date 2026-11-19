/* إدارة الملخصات والمراجعات — داخل لوحة زاد المحمية */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const KINDS = [["lesson_summary", "ملخص درس"], ["unit_summary", "ملخص وحدة"], ["semester_review", "مراجعة فصل"], ["subject_review", "مراجعة شاملة للمادة"], ["concept_map", "خريطة مفاهيم"], ["review_cards", "بطاقات مراجعة"], ["practice", "أسئلة تدريبية"], ["mixed_practice", "تدريبات متنوعة"], ["exam_prep", "نموذج مراجعة قبل الاختبار"], ["lesson_review", "مراجعة بعد الدرس"], ["unit_review", "مراجعة بعد الوحدة"], ["midterm_review", "مراجعة منتصف الفصل"]];
const KN = Object.fromEntries(KINDS);
const FULL = ["lesson_summary", "unit_summary", "concept_map"];
const GR = ["الأول", "الثاني", "الثالث", "الرابع"];
const ST = [["draft", "مسودة"], ["published", "منشورة"], ["unpublished", "غير منشورة"]];
const SN = Object.fromEntries(ST);
const IU = (u) => /^https?:/.test(u || "") ? u : "../" + String(u || "");
let ALL = [], FS = "", FG = "", FQ = "";
const norm = (s) => String(s || "").toLowerCase();
const lines = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
/* صيغة الأسئلة: سطر لكل سؤال (JSON)  */
const qLine = (q) => JSON.stringify(q);
function parseQs(t) {
  const out = [];
  for (const [i, l] of lines(t).entries()) {
    let q; try { q = JSON.parse(l); } catch { throw new Error("السؤال رقم " + (i + 1) + " ليس بصيغة صحيحة"); }
    if (!q || !q.q || !["mcq", "tf", "fill", "short"].includes(q.type)) throw new Error("السؤال رقم " + (i + 1) + ": النوع أو النص ناقص");
    if (q.type === "mcq" && (!Array.isArray(q.opts) || q.opts.length < 2 || !(q.a >= 0 && q.a < q.opts.length))) throw new Error("السؤال رقم " + (i + 1) + ": الخيارات أو رقم الإجابة غير صحيح");
    if (q.type === "tf" && typeof q.a !== "boolean") throw new Error("السؤال رقم " + (i + 1) + ": الإجابة يجب أن تكون true أو false");
    if ((q.type === "fill" || q.type === "short") && !String(q.a || "").trim()) throw new Error("السؤال رقم " + (i + 1) + ": الإجابة ناقصة");
    out.push(q);
  }
  return out;
}
function readiness(d) {
  const m = [];
  if (!(d.title || "").trim()) m.push("العنوان"); if (!(d.description || "").trim()) m.push("الوصف"); if (!(d.subject || "").trim()) m.push("المادة");
  if (!d.cover_url) m.push("صورة الغلاف"); if (!d.pdf_url) m.push("ملف PDF"); if (!d.points.length) m.push("نقاط المراجعة"); if (!d.questions.length) m.push("الأسئلة");
  if (FULL.includes(d.kind)) { if (!d.goals.length) m.push("أهداف التعلم"); if (!d.concepts.length) m.push("المفاهيم"); if (!d.explanation.length) m.push("الشرح"); }
  return m;
}
async function load() { const r = await sb.from("summaries").select("*").order("grade").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, kind, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `summaries/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
SUB.summariesadm = { title: "إدارة الملخصات والمراجعات", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="sn">➕ ملخص أو مراجعة جديدة</button></div>
  <input type="search" id="sqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="sch" style="margin-top:8px"></div><div class="chips" id="scg" style="margin-top:6px"></div><div id="sls"></div>`;
  const draw = () => {
    $("#sch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#scg").innerHTML = [["", "كل الصفوف"], ...GR.map((g, i) => [String(i + 1), g])].map(([k, l]) => `<button class="chip ${FG === k ? "on" : ""}" data-g="${k}">${l}</button>`).join("");
    const q = norm(FQ), list = ALL.filter((x) => (!FS || x.status === FS) && (!FG || String(x.grade) === FG) && (!q || norm(x.title + " " + x.subject + " " + (x.unit || "") + " " + (x.lesson || "")).includes(q)));
    $("#sls").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}">${x.cover_url ? `<img loading="lazy" src="${esc(IU(x.cover_url))}" alt="" style="object-fit:cover">` : `<div class="ph">📄</div>`}<div class="tx"><b>${esc(x.title)}</b><small>الصف ${GR[x.grade - 1]} · ${esc(x.subject)} · ${esc(KN[x.kind] || x.kind)} · ${SN[x.status]}${ms.length ? " · ينقص: " + esc(ms.join("، ")) : ""}</small></div></div>`; }).join("") : '<p class="mut">لا توجد عناصر مطابقة.</p>';
    $$("#sch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#scg [data-g]").forEach((b) => b.onclick = () => { FG = b.dataset.g; draw(); });
    $$("#sls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#sqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#sn").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { goals: (a.goals || []).slice(), points: (a.points || []).slice(), concepts: (a.concepts || []).slice(), explanation: (a.explanation || []).slice(), examples: (a.examples || []).slice(), questions: (a.questions || []).slice(), links: a.links || {} })
    : { slug: "sum-" + Date.now().toString(36), kind: "lesson_summary", title: "", grade: 1, subject: "", semester: null, unit: "", lesson: "", description: "", goals: [], concepts: [], explanation: [], examples: [], points: [], questions: [], links: {}, cover_url: "", pdf_url: "", bw_url: "", pages: null, review_note: "", status: "draft", sort_order: ALL.length + 1 };
  const T = (id, l, v, ex) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v)}" ${ex || ""}></label>`;
  const TA = (id, l, v, r, ex) => `<label class="f"><span>${l}</span><textarea id="${id}" rows="${r || 3}" dir="auto" ${ex || ""}>${esc(v)}</textarea></label>`;
  const fileRow = (k, l, v, acc) => `<p style="margin:12px 2px 4px;font-weight:700">${l}</p><small class="mut" id="${k}t">${v ? "✔ " + esc(v) : "لم يُرفع بعد"}</small><label class="btn g" style="display:block;text-align:center;margin-top:4px">رفع<input type="file" id="${k}f" accept="${acc}" hidden></label>`;
  const conc = d.concepts.map((c) => `${c.t} | ${c.d}`).join("\n");
  const s = sheet(`<h2>${isNew ? "عنصر جديد" : "تعديل"}</h2>
  ${T("st", "العنوان", d.title)}
  <label class="f"><span>النوع</span><select id="sk">${KINDS.map(([k, v]) => `<option value="${k}" ${d.kind === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <label class="f"><span>الصف</span><select id="sg">${GR.map((g, i) => `<option value="${i + 1}" ${d.grade === i + 1 ? "selected" : ""}>${g}</option>`).join("")}</select></label>
  ${T("sb", "المادة", d.subject)}
  <label class="f"><span>الفصل الدراسي (اتركه فارغاً إن لم يُتحقَّق منه)</span><select id="sse"><option value="">غير محدد</option><option value="1" ${d.semester === 1 ? "selected" : ""}>الأول</option><option value="2" ${d.semester === 2 ? "selected" : ""}>الثاني</option></select></label>
  ${T("su", "الوحدة", d.unit || "")}${T("sl", "الدرس", d.lesson || "")}
  ${TA("sd", "وصف مختصر", d.description, 2)}
  ${TA("sgo", "أهداف التعلم (هدف في كل سطر)", d.goals.join("\n"), 3)}
  ${TA("sco", "أهم المفاهيم (سطر لكل مفهوم: المفهوم | الشرح)", conc, 4)}
  ${TA("sex", "الشرح المبسّط (فقرة في كل سطر)", d.explanation.join("\n"), 4)}
  ${TA("ssm", "أمثلة (مثال في كل سطر)", d.examples.join("\n"), 3)}
  ${TA("spo", "نقاط المراجعة (نقطة في كل سطر)", d.points.join("\n"), 3)}
  ${TA("sq", "الأسئلة (سطر JSON لكل سؤال، مثال: {\"type\":\"mcq\",\"q\":\"...\",\"opts\":[\"أ\",\"ب\"],\"a\":0} — الأنواع: mcq و tf و fill و short)", d.questions.map(qLine).join("\n"), 6, 'dir="ltr" style="font-size:13px"')}
  <p style="margin:12px 2px 4px;font-weight:700">صورة الغلاف (إلزامية)</p>${d.cover_url ? `<img class="thumb" id="sim" src="${esc(IU(d.cover_url))}" style="max-height:160px;object-fit:contain">` : `<div class="thumb c" id="sim" style="padding:26px 0;font-size:34px">🖼️</div>`}
  <label class="btn g" style="display:block;text-align:center;margin-top:6px">رفع صورة<input type="file" id="sif" accept="image/*" hidden></label>
  ${fileRow("sp", "ملف PDF (إلزامي)", d.pdf_url, "application/pdf")}${fileRow("sw", "نسخة PDF أبيض وأسود (اختياري)", d.bw_url, "application/pdf")}
  ${TA("srn", "ملاحظة المراجعة (من راجع المحتوى وكيف؛ تلزم قبل النشر)", d.review_note || "", 2)}
  <label class="f" style="margin-top:12px"><span>حالة النشر</span><select id="sst">${ST.map(([k, v]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <p id="smiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="ssv">حفظ</button><button class="btn g" id="spv">معاينة</button></div><div class="row"><button class="btn g" id="sx">إغلاق</button></div>`);
  $("#sx", s).onclick = closeSheet;
  const pick = (id, key, tid, label) => { $("#" + id, s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); d[key] = await up(d.slug, key, f); $("#" + tid, s).textContent = "✔ " + d[key]; toast("تم رفع " + label); if (key === "cover_url") $("#sim", s).outerHTML = `<img class="thumb" id="sim" src="${esc(d.cover_url)}" style="max-height:160px;object-fit:contain">`; } catch (x) { fail(x); } }; };
  pick("sif", "cover_url", "sim", "الغلاف"); pick("spf", "pdf_url", "spt", "الملف"); pick("swf", "bw_url", "swt", "الملف");
  const collect = () => {
    d.title = $("#st", s).value.trim(); d.kind = $("#sk", s).value; d.grade = +$("#sg", s).value; d.subject = $("#sb", s).value.trim();
    d.semester = $("#sse", s).value ? +$("#sse", s).value : null; d.unit = $("#su", s).value.trim() || null; d.lesson = $("#sl", s).value.trim() || null;
    d.description = $("#sd", s).value.trim(); d.goals = lines($("#sgo", s).value);
    d.concepts = lines($("#sco", s).value).map((l) => { const i = l.indexOf("|"); if (i < 1) throw new Error("المفهوم يجب أن يكون بصيغة: المفهوم | الشرح"); return { t: l.slice(0, i).trim(), d: l.slice(i + 1).trim() }; });
    d.explanation = lines($("#sex", s).value); d.examples = lines($("#ssm", s).value); d.points = lines($("#spo", s).value);
    d.questions = parseQs($("#sq", s).value); d.review_note = $("#srn", s).value.trim(); d.status = $("#sst", s).value;
  };
  $("#spv", s).onclick = () => {
    try { collect(); } catch (x) { $("#smiss", s).textContent = x.message; return; }
    const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99;
    o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;overflow:hidden;background:#fff;padding-bottom:8px">${d.cover_url ? `<img src="${esc(IU(d.cover_url))}" style="width:100%;max-height:220px;object-fit:contain;background:#f3eeff">` : '<div style="padding:30px;color:#c62828;font-weight:700;text-align:center">لا يوجد غلاف بعد</div>'}<div style="padding:8px 12px"><b style="font-size:18px">${esc(d.title)}</b><p class="mut">الصف ${GR[d.grade - 1]} · ${esc(d.subject)} · ${esc(KN[d.kind])}${d.semester ? " · الفصل " + d.semester : ""}</p><p>${esc(d.description)}</p><b>الأهداف</b><ul>${d.goals.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><b>المفاهيم</b><ul>${d.concepts.map((x) => `<li>${esc(x.t)}: ${esc(x.d)}</li>`).join("")}</ul><b>النقاط</b><ul>${d.points.map((x) => `<li>${esc(x)}</li>`).join("")}</ul><b>الأسئلة (${d.questions.length})</b><ol>${d.questions.map((x) => `<li>${esc(x.q)}</li>`).join("")}</ol>${d.pdf_url ? `<a href="${esc(IU(d.pdf_url))}" target="_blank" rel="noopener">فتح ملف PDF</a>` : '<p style="color:#c62828">لا يوجد ملف PDF</p>'}</div></div><div class="row"><button class="btn g" id="vx">إغلاق المعاينة</button></div></div>`;
    document.body.appendChild(o); o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); };
  };
  $("#ssv", s).onclick = async () => {
    try { collect(); } catch (x) { $("#smiss", s).textContent = x.message; return; }
    if (!d.title) { $("#smiss", s).textContent = "اكتب العنوان"; return; }
    if (d.status === "published") {
      const miss = readiness(d); if (!d.review_note) miss.push("ملاحظة المراجعة");
      if (miss.length) { $("#smiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; }
    }
    $("#smiss", s).textContent = ""; $("#ssv", s).disabled = true;
    try {
      const row = { slug: d.slug, kind: d.kind, title: d.title, grade: d.grade, subject: d.subject, semester: d.semester, unit: d.unit, lesson: d.lesson, description: d.description, goals: d.goals, concepts: d.concepts, explanation: d.explanation, examples: d.examples, points: d.points, questions: d.questions, links: d.links || {}, cover_url: d.cover_url || null, pdf_url: d.pdf_url || null, bw_url: d.bw_url || null, pages: d.pages, review_note: d.review_note || null, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("summaries").insert(row) : await sb.from("summaries").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#ssv", s).disabled = false; }
  };
}
})();
