/* إدارة الأنشطة التعليمية — داخل لوحة زاد المحمية */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["early", "الطفولة المبكرة"], ["arabic", "اللغة العربية"], ["math", "الرياضيات"], ["science", "العلوم"], ["english", "الإنجليزية"], ["life", "المهارات الحياتية"]];
const CN = Object.fromEntries(CATS);
const KINDS = [["worksheet", "ورقة عمل"], ["cutpaste", "قص ولصق"], ["coloring", "تلوين"], ["matching", "توصيل ومطابقة"], ["sorting", "ترتيب وتصنيف"], ["home", "نشاط منزلي"], ["creative", "إبداعي وفني"], ["discovery", "ملاحظة واكتشاف"], ["interactive", "تفاعلي في الموقع"]];
const KN = Object.fromEntries(KINDS);
const PRINT = ["worksheet", "cutpaste", "coloring", "matching", "sorting"];
const DIFF = [["easy", "سهل"], ["medium", "متوسط"], ["hard", "متقدم"]];
const GR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
const ST = [["draft", "مسودة"], ["published", "منشورة"], ["unpublished", "غير منشورة"]];
const SN = Object.fromEntries(ST);
const IU = (u) => /^https?:/.test(u || "") ? u : "../" + String(u || "");
let ALL = [], FS = "", FC = "", FQ = "";
const norm = (s) => String(s || "").toLowerCase();
const lines = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
/* جاهزية النشر (القاعدة في قاعدة البيانات ترفض النشر الناقص أيضاً) */
function readiness(d) {
  const m = [];
  if (!(d.title || "").trim()) m.push("العنوان"); if (!(d.goal || "").trim()) m.push("الهدف التعليمي"); if (!(d.summary || "").trim()) m.push("الوصف المختصر");
  if (!(d.image_url || "").trim()) m.push("الصورة"); if (!(d.subject || "").trim()) m.push("المادة"); if (!(d.skill || "").trim()) m.push("المهارة");
  if (!d.ages.length && !d.grades.length) m.push("العمر أو الصف"); if (!d.difficulty) m.push("مستوى الصعوبة");
  if (!d.steps.length) m.push("خطوات النشاط"); if (!(d.completion || "").trim()) m.push("طريقة الإكمال");
  if (PRINT.includes(d.kind) && !(d.pdf_url || "").trim()) m.push("ملف PDF");
  if (d.kind === "interactive" && !(d.interactive_url || "").trim()) m.push("رابط النشاط التفاعلي");
  return m;
}
async function load() { const r = await sb.from("activities").select("*").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, kind, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `activities/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
SUB.activitiesadm = { title: "إدارة الأنشطة", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>كل الأنشطة</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="an">➕ نشاط جديد</button></div>
  <input type="search" id="aqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="ach" style="margin-top:8px"></div><div class="chips" id="acs" style="margin-top:6px"></div><div id="als"></div>`;
  const draw = () => {
    $("#ach").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#acs").innerHTML = [["", "كل التصنيفات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = norm(FQ), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.cat === FC) && (!q || norm(x.title + " " + x.skill).includes(q)));
    $("#als").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}">${x.image_url ? `<img loading="lazy" src="${esc(IU(x.image_url))}" alt="" style="object-fit:contain">` : `<div class="ph">🖼️</div>`}<div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.cat] || "")} · ${esc(KN[x.kind] || "")} · ${SN[x.status]}${ms.length ? " · ينقص: " + esc(ms.join("، ")) : ""}</small></div></div>`; }).join("") : '<p class="mut">لا توجد أنشطة مطابقة.</p>';
    $$("#ach [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#acs [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#als [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#aqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#an").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { ages: (a.ages || []).slice(), grades: (a.grades || []).slice(), tools: (a.tools || []).slice(), steps: (a.steps || []).slice() })
    : { slug: "act-" + Date.now().toString(36), title: "", cat: "early", kind: "home", goal: "", summary: "", ages: [], grades: [], subject: "", skill: "", difficulty: "easy", minutes: null, tools: [], steps: [], parent_role: "", completion: "", image_url: "", pdf_url: "", bw_url: "", preview_url: "", interactive_url: "", pages: null, status: "draft", sort_order: ALL.length + 1 };
  const T = (id, l, v, ex) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v)}" ${ex || ""}></label>`;
  const TA = (id, l, v, r) => `<label class="f"><span>${l}</span><textarea id="${id}" rows="${r || 3}" dir="auto">${esc(v)}</textarea></label>`;
  const fileRow = (k, l, v, acc) => `<p style="margin:12px 2px 4px;font-weight:700">${l}</p><small class="mut" id="${k}t">${v ? "✔ " + esc(v) : "لم يُرفع بعد"}</small><label class="btn g" style="display:block;text-align:center;margin-top:4px">رفع<input type="file" id="${k}f" accept="${acc}" hidden></label>`;
  const s = sheet(`<h2>${isNew ? "نشاط جديد" : "تعديل النشاط"}</h2>
  ${T("at", "عنوان النشاط", d.title)}
  <label class="f"><span>التصنيف</span><select id="ac">${CATS.map(([k, v]) => `<option value="${k}" ${d.cat === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <label class="f"><span>نوع النشاط</span><select id="ak">${KINDS.map(([k, v]) => `<option value="${k}" ${d.kind === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  ${TA("ag", "الهدف التعليمي", d.goal, 2)}${TA("asu", "وصف مختصر", d.summary, 2)}
  <p style="margin:10px 2px 4px;font-weight:700">العمر</p><div class="chips" id="aag" style="flex-wrap:wrap">${[1, 2, 3, 4, 5, 6].map((x) => `<button type="button" class="chip ${d.ages.includes(x) ? "on" : ""}" data-a="${x}">${x === 1 ? "سنة" : x === 2 ? "سنتان" : x + " سنوات"}</button>`).join("")}</div>
  <p style="margin:10px 2px 4px;font-weight:700">الصف</p><div class="chips" id="agr" style="flex-wrap:wrap">${GR.map((g, i) => `<button type="button" class="chip ${d.grades.includes(i + 1) ? "on" : ""}" data-g="${i + 1}">${g}</button>`).join("")}</div>
  ${T("asb", "المادة", d.subject)}${T("ask", "المهارة", d.skill)}
  <label class="f"><span>الصعوبة</span><select id="adf">${DIFF.map(([k, v]) => `<option value="${k}" ${d.difficulty === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  ${T("amn", "الوقت التقريبي بالدقائق (اختياري)", d.minutes || "", 'inputmode="numeric"')}
  ${TA("atl", "الأدوات المطلوبة (كل أداة في سطر؛ أدوات آمنة فقط)", d.tools.join("\n"), 3)}
  ${TA("ast", "الخطوات (كل خطوة في سطر)", d.steps.join("\n"), 5)}
  ${TA("apr", "دور ولي الأمر", d.parent_role, 2)}${TA("acm", "طريقة إكمال النشاط", d.completion, 2)}
  <p style="margin:12px 2px 4px;font-weight:700">الصورة الكرتونية (إلزامية)</p>${d.image_url ? `<img class="thumb" id="aim" src="${esc(IU(d.image_url))}" style="max-height:160px;object-fit:contain">` : `<div class="thumb c" id="aim" style="padding:26px 0;font-size:34px">🖼️</div>`}
  <label class="btn g" style="display:block;text-align:center;margin-top:6px">رفع صورة<input type="file" id="aif" accept="image/*" hidden></label>
  <div id="apd">${fileRow("ap", "ملف PDF (إلزامي لأنواع الطباعة)", d.pdf_url, "application/pdf")}${fileRow("ab", "نسخة PDF أبيض وأسود (اختياري)", d.bw_url, "application/pdf")}${T("apg", "عدد صفحات الملف (اختياري؛ للمعاينة داخل الموقع تلزم صور معاينة جاهزة)", d.pages || "", 'inputmode="numeric"')}</div>
  <div id="ain">${T("aiu", "رابط النشاط التفاعلي (مثل: cards/?cat=colors&mode=choice&age=2)", d.interactive_url || "", 'dir="ltr"')}</div>
  <label class="f" style="margin-top:12px"><span>حالة النشر</span><select id="ast2">${ST.map(([k, v]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <p id="amiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="asv">حفظ</button><button class="btn g" id="apv">معاينة</button></div><div class="row"><button class="btn g" id="ax">إغلاق</button></div>`);
  const sync = () => { const k = $("#ak", s).value; $("#apd", s).hidden = !PRINT.includes(k) && k !== "worksheet"; $("#ain", s).hidden = k !== "interactive"; };
  $("#ak", s).onchange = sync; sync();
  $$("#aag .chip, #agr .chip", s).forEach((b) => b.onclick = () => b.classList.toggle("on"));
  $("#ax", s).onclick = closeSheet;
  const pick = (id, key, tid, label) => { $("#" + id, s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); d[key] = await up(d.slug, key, f); $("#" + tid, s).textContent = "✔ " + d[key]; toast("تم رفع " + label); if (key === "image_url") $("#aim", s).outerHTML = `<img class="thumb" id="aim" src="${esc(d.image_url)}" style="max-height:160px;object-fit:contain">`; } catch (x) { fail(x); } }; };
  pick("aif", "image_url", "aim", "الصورة"); pick("apf", "pdf_url", "apt", "الملف"); pick("abf", "bw_url", "abt", "الملف");
  const collect = () => {
    d.title = $("#at", s).value.trim(); d.cat = $("#ac", s).value; d.kind = $("#ak", s).value; d.goal = $("#ag", s).value.trim(); d.summary = $("#asu", s).value.trim();
    d.ages = $$("#aag .chip.on", s).map((b) => +b.dataset.a); d.grades = $$("#agr .chip.on", s).map((b) => +b.dataset.g);
    d.subject = $("#asb", s).value.trim(); d.skill = $("#ask", s).value.trim(); d.difficulty = $("#adf", s).value; d.minutes = parseInt($("#amn", s).value, 10) || null;
    d.tools = lines($("#atl", s).value); d.steps = lines($("#ast", s).value); d.parent_role = $("#apr", s).value.trim(); d.completion = $("#acm", s).value.trim();
    d.pages = parseInt($("#apg", s).value, 10) || null; d.interactive_url = $("#aiu", s).value.trim(); d.status = $("#ast2", s).value;
    if (!PRINT.includes(d.kind)) { /* الأنواع غير المطبوعة تحتفظ بالملف إن وُجد */ }
    if (d.kind !== "interactive") d.interactive_url = "";
  };
  $("#apv", s).onclick = () => {
    collect(); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99;
    o.innerHTML = `<div class="sheet"><h2>معاينة النشاط</h2><div style="border:3px solid #7c4dff;border-radius:22px;overflow:hidden;background:#fff;padding-bottom:8px">${d.image_url ? `<img src="${esc(IU(d.image_url))}" style="width:100%;max-height:220px;object-fit:contain;background:#f3eeff">` : '<div style="padding:30px;color:#c62828;font-weight:700;text-align:center">لا توجد صورة بعد</div>'}<div style="padding:8px 12px"><b style="font-size:18px">${esc(d.title)}</b><p class="mut">${esc(CN[d.cat] || "")} · ${esc(KN[d.kind] || "")} · ${esc(d.subject)} · ${esc(d.skill)}</p><p><b>الهدف:</b> ${esc(d.goal)}</p><p><b>الأدوات:</b> ${esc(d.tools.join("، ") || "—")}</p><ol>${d.steps.map((x) => `<li>${esc(x)}</li>`).join("")}</ol><p><b>دور ولي الأمر:</b> ${esc(d.parent_role || "—")}</p><p><b>الإكمال:</b> ${esc(d.completion)}</p>${d.pdf_url ? `<a href="${esc(IU(d.pdf_url))}" target="_blank" rel="noopener">فتح ملف PDF</a>` : ""}</div></div><div class="row"><button class="btn g" id="vx">إغلاق المعاينة</button></div></div>`;
    document.body.appendChild(o); o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); };
  };
  $("#asv", s).onclick = async () => {
    collect();
    if (!d.title) { $("#amiss", s).textContent = "اكتب عنوان النشاط"; return; }
    const miss = readiness(d);
    if (d.status === "published" && miss.length) { $("#amiss", s).textContent = "لا يمكن نشر النشاط قبل اكتمال: " + miss.join("، "); return; }
    $("#amiss", s).textContent = ""; $("#asv", s).disabled = true;
    try {
      const row = { slug: d.slug, title: d.title, cat: d.cat, kind: d.kind, goal: d.goal || null, summary: d.summary || null, ages: d.ages, grades: d.grades, subject: d.subject || null, skill: d.skill || null, difficulty: d.difficulty || null, minutes: d.minutes, tools: d.tools, steps: d.steps, parent_role: d.parent_role || null, completion: d.completion || null, image_url: d.image_url || null, pdf_url: d.pdf_url || null, bw_url: d.bw_url || null, preview_url: d.preview_url || null, interactive_url: d.interactive_url || null, pages: d.pages, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("activities").insert(row) : await sb.from("activities").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#asv", s).disabled = false; }
  };
}
})();
