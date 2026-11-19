/* الملخصات والمراجعات - زاد: قائمة + عرض (المعاينة تُرسم من محتوى منظّم، والطباعة من الصفحة نفسها) */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const IN_VIEW = /\/summaries\/view\/?$/.test(location.pathname) || /\/summaries\/view\//.test(location.pathname);
const ROOT = new URL(IN_VIEW ? "../../" : "../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const U = (u) => /^https?:/.test(u || "") ? u : ROOT + String(u || "");
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const GR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
const KINDS = { lesson_summary: "ملخص درس", unit_summary: "ملخص وحدة", semester_review: "مراجعة فصل", subject_review: "مراجعة شاملة للمادة", concept_map: "خريطة مفاهيم", review_cards: "بطاقات مراجعة", practice: "أسئلة تدريبية", mixed_practice: "تدريبات متنوعة", exam_prep: "نموذج مراجعة قبل الاختبار", lesson_review: "مراجعة بعد الدرس", unit_review: "مراجعة بعد الوحدة", midterm_review: "مراجعة منتصف الفصل" };
const SEM = { 1: "الفصل الأول", 2: "الفصل الثاني" };
const CACHE = "zad-sums-v1";
/* أرقام/عبارات لاتينية داخل نص عربي: تُعزل لتبقى بترتيبها الصحيح */
const fm = (t) => esc(t).replace(/(\d[\d.,/\s+×÷−=<>%()-]*\d%?|\d%?|[A-Za-z][A-Za-z0-9 ,.'’?!/:+\-()]*[A-Za-z0-9?!.)])/g, (m) => `<bdi dir="ltr">${m}</bdi>`);

let all = [];
async function load() {
  try {
    const r = await fetch(SB + "/rest/v1/summaries?status=eq.published&order=grade.asc,sort_order.asc&select=*", { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad");
    all = j; try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {}
    return true;
  } catch {
    try { all = JSON.parse(localStorage.getItem(CACHE)) || []; } catch { all = []; }
    return false;
  }
}

/* ===== القائمة ===== */
const F = { gr: "", sub: "", kind: "", sem: "", unit: "", lesson: "", q: "" };
const pill = (k, v, l) => `<button type="button" class="zpill${F[k] === v ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${F[k] === v}">${esc(l)}</button>`;
function base(skip) {
  const q = norm(F.q).trim();
  return all.filter((a) => (skip === "gr" || !F.gr || a.grade === +F.gr) && (skip === "sub" || !F.sub || a.subject === F.sub) && (skip === "kind" || !F.kind || a.kind === F.kind) &&
    (skip === "sem" || !F.sem || a.semester === +F.sem) && (skip === "unit" || !F.unit || a.unit === F.unit) && (skip === "lesson" || !F.lesson || a.lesson === F.lesson) &&
    (!q || norm([a.title, a.description, "الصف " + GR[a.grade - 1], a.subject, a.unit, a.lesson, KINDS[a.kind], a.semester ? SEM[a.semester] : ""].join(" ")).includes(q)));
}
const sub = (arr, f) => [...new Set(arr.map(f).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar"));
function card(a) {
  const lk = `view/?s=${encodeURIComponent(a.slug)}`;
  return `<article class="sc"><a class="im" href="${lk}" tabindex="-1" aria-hidden="true"><img src="${esc(U(a.cover_url))}" alt="" loading="lazy" width="420" height="262"></a>
<div class="bd"><h3>${esc(a.title)}</h3><div class="mt"><span>الصف ${esc(GR[a.grade - 1])}</span><span>${esc(a.subject)}</span><span class="k">${esc(KINDS[a.kind] || a.kind)}</span>${a.semester ? `<span>${esc(SEM[a.semester])}</span>` : ""}<span>PDF</span></div>
<p>${esc([a.unit, a.lesson].filter(Boolean).join(" · "))}</p><p>${esc(a.description)}</p>
<div class="bt"><a class="abtn go" href="${lk}">عرض</a><a class="abtn" href="${esc(U(a.pdf_url))}" download>تحميل PDF</a></div></div></article>`;
}
function drawList() {
  const set = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };
  const grs = [1, 2, 3, 4, 5, 6].filter((n) => all.some((a) => a.grade === n));
  set("#fgr", "<b>الصف</b>" + pill("gr", "", "الكل") + grs.map((n) => pill("gr", String(n), GR[n - 1])).join(""));
  const pool = base("sub");
  set("#fsub", "<b>المادة</b>" + pill("sub", "", "الكل") + sub(base("sub"), (a) => a.subject).map((s) => pill("sub", s, s)).join(""));
  set("#fkind", "<b>النوع</b>" + pill("kind", "", "الكل") + Object.keys(KINDS).filter((k) => all.some((a) => a.kind === k)).map((k) => pill("kind", k, KINDS[k])).join(""));
  const hasSem = all.some((a) => a.semester), fs = $("#fsem");
  if (fs) { fs.hidden = !hasSem; if (hasSem) fs.innerHTML = "<b>الفصل</b>" + pill("sem", "", "الكل") + [1, 2].filter((n) => all.some((a) => a.semester === n)).map((n) => pill("sem", String(n), SEM[n])).join(""); }
  const so = (id, vals, k) => { const e = $(id); if (e) e.innerHTML = '<option value="">الكل</option>' + vals.map((v) => `<option value="${esc(v)}"${F[k] === v ? " selected" : ""}>${esc(v)}</option>`).join(""); };
  so("#funit", sub(base("unit"), (a) => a.unit), "unit"); so("#flesson", sub(base("lesson"), (a) => a.lesson), "lesson");
  const r = base(), any = Object.values(F).some(Boolean);
  const c = $("#sclr"); if (c) c.hidden = !any;
  const st = $("#sstat"); if (st) st.innerHTML = `<span>${AD(all.length)} ملخص ومراجعة</span><span>${AD(grs.length)} صفوف</span><span>${AD(new Set(all.map((a) => a.subject)).size)} مواد</span>`;
  void pool;
  $("#sres").innerHTML = !all.length ? `<div class="sempty"><h3>تعذّر تحميل الملخصات</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p><button class="abtn go" type="button" id="sretry">إعادة المحاولة</button></div>`
    : r.length ? `<p class="sfoot" style="margin:6px 0">${AD(r.length)} نتيجة</p><div class="sgrid">${r.map(card).join("")}</div>`
    : `<div class="sempty"><h3>لا توجد نتائج مطابقة</h3><p>جرّب إزالة بعض الفلاتر.</p></div>`;
}
function initList() {
  const p = new URLSearchParams(location.search);
  ["gr", "sub", "kind", "sem", "unit", "lesson"].forEach((k) => { if (p.get(k)) F[k] = p.get(k); });
  D.addEventListener("click", (e) => {
    const b = e.target.closest(".zpill"); if (b) { F[b.dataset.k] = b.dataset.v; drawList(); return; }
    if (e.target.id === "sclr") { Object.keys(F).forEach((k) => (F[k] = "")); const q = $("#sq"); if (q) q.value = ""; $("#sqx").hidden = true; drawList(); }
    if (e.target.id === "sretry") boot();
  });
  $("#funit").addEventListener("change", (e) => { F.unit = e.target.value; drawList(); });
  $("#flesson").addEventListener("change", (e) => { F.lesson = e.target.value; drawList(); });
  const q = $("#sq"), x = $("#sqx");
  q.addEventListener("input", () => { F.q = q.value; x.hidden = !q.value; drawList(); });
  x.addEventListener("click", () => { q.value = ""; F.q = ""; x.hidden = true; drawList(); q.focus(); });
}

/* ===== العرض ===== */
const sec = (t, h) => `<section class="sec"><h2>${t}</h2>${h}</section>`;
const ul = (a, o) => `<${o ? "ol" : "ul"}>${(a || []).map((s) => `<li>${fm(s)}</li>`).join("")}</${o ? "ol" : "ul"}>`;
const TFL = ["صح ✓", "خطأ ✗"];
function qhtml(q) {
  const t = q.type, ans = t === "mcq" ? (q.opts || [])[q.a] : t === "tf" ? (q.a ? "صح" : "خطأ") : q.a;
  let b = `${fm(q.q)}`;
  if (t === "mcq") b += `<div class="op">${(q.opts || []).map((o) => `<span>${fm(o)}</span>`).join("")}</div>`;
  else if (t === "tf") b += `<div class="op">${TFL.map((o) => `<span>${o}</span>`).join("")}</div>`;
  else if (t === "short") b += `<div class="ln"></div>`;
  return `<li>${b}<div class="an">الإجابة: ${fm(ans)}</div></li>`;
}
let SA = false;
async function related(a) {
  const L = a.links || {}, out = [];
  const acts = Array.isArray(L.acts) ? L.acts.filter(Boolean) : [];
  if (acts.length) {
    try {
      const r = await fetch(SB + "/rest/v1/activities?status=eq.published&select=slug,title&slug=in.(" + acts.map(encodeURIComponent).join(",") + ")", { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
      const j = r.ok ? await r.json() : []; (Array.isArray(j) ? j : []).forEach((x) => out.push(`<a href="${ROOT}activities/view/?a=${encodeURIComponent(x.slug)}">نشاط: ${esc(x.title)}</a>`));
    } catch {}
  }
  (Array.isArray(L.lib) ? L.lib : []).filter(Boolean).forEach((n) => out.push(`<a href="${ROOT}library/#q=${encodeURIComponent(n)}">ملفات للطباعة في المكتبة: ${esc(n)}</a>`));
  if (L.cards) out.push(`<a href="${ROOT}cards/?cat=${encodeURIComponent(L.cards)}">البطاقات التعليمية المرتبطة</a>`);
  if (L.quiz) {
    const lv = String(L.quiz).split(":")[0];
    try { const r = await fetch(ROOT + "tests/quizzes.json"); const j = r.ok ? await r.json() : []; const qs = Array.isArray(j) ? j : j.quizzes || []; if (qs.some((x) => x.lv === lv)) out.push(`<a href="${ROOT}tests/#lv=${encodeURIComponent(lv)}">اختبارات الصف ${esc(GR[a.grade - 1])} في المنصة</a>`); } catch {}
  }
  return out;
}
function drawView(a) {
  D.title = a.title + " | منصة زاد التعليمية"; const bc = $("#abc"); if (bc) bc.textContent = a.title;
  const body = [];
  if ((a.goals || []).length) body.push(sec("أهداف التعلّم", ul(a.goals)));
  if (a.kind === "concept_map" && (a.concepts || []).length) body.push(sec("خريطة المفاهيم", `<div class="cmap"><div class="cm-c">${fm(a.lesson || a.title)}</div><div class="cm-a" aria-hidden="true">▼</div><div class="cm-b">${a.concepts.map((c) => `<div class="cm-n"><b>${fm(c.t)}</b><span>${fm(c.d)}</span></div>`).join("")}</div></div>`));
  else if ((a.concepts || []).length) body.push(sec("أهم المفاهيم", `<table class="ct"><tbody>${a.concepts.map((c) => `<tr><th scope="row">${fm(c.t)}</th><td>${fm(c.d)}</td></tr>`).join("")}</tbody></table>`));
  if ((a.explanation || []).length) body.push(sec("الشرح المبسّط", a.explanation.map((p) => `<p>${fm(p)}</p>`).join("")));
  if ((a.examples || []).length) body.push(sec("أمثلة", ul(a.examples)));
  if ((a.points || []).length) body.push(sec("نقاط المراجعة", ul(a.points)));
  if ((a.questions || []).length) body.push(sec("أسئلة للتأكد من الفهم", `<button type="button" class="abtn noprint" id="sans" style="margin-bottom:8px">${SA ? "إخفاء الإجابات" : "إظهار الإجابات"}</button><ol class="qs">${a.questions.map(qhtml).join("")}</ol>`));
  const acts = `<a class="abtn go" href="${esc(U(a.pdf_url))}" target="_blank" rel="noopener">فتح PDF</a><a class="abtn" href="${esc(U(a.pdf_url))}" download>تحميل PDF</a>${a.bw_url ? `<a class="abtn" href="${esc(U(a.bw_url))}" download>PDF أبيض وأسود</a>` : ""}<button type="button" class="abtn" id="sprt">طباعة</button><a class="abtn" href="../">العودة إلى القائمة</a>`;
  $("#aview").innerHTML = `<div class="hd"><img src="${esc(U(a.cover_url))}" alt="" width="110" height="146"><div><h1>${esc(a.title)}</h1><div class="mt"><span>الصف ${esc(GR[a.grade - 1])}</span><span>${esc(a.subject)}</span><span class="k">${esc(KINDS[a.kind] || a.kind)}</span>${a.semester ? `<span>${esc(SEM[a.semester])}</span>` : ""}</div><p style="margin:8px 0 0;font:500 14px/1.7 var(--z-font);color:var(--z-ink2)">${esc([a.unit, a.lesson].filter(Boolean).join(" · "))}</p></div></div>
<div class="acts">${acts}</div>${body.join("")}<div id="srel"></div>
<p class="note">محتوى أصلي من إعداد منصة زاد، لم تُراجعه جهة تعليمية رسمية، وغير منسوب إلى منهج أو كتاب مدرسي محدد.</p>`;
  D.body.classList.toggle("sa", SA);
  const on = (id, f) => { const e = $(id); if (e) e.addEventListener("click", f); };
  on("#sans", () => { SA = !SA; D.body.classList.toggle("sa", SA); $("#sans").textContent = SA ? "إخفاء الإجابات" : "إظهار الإجابات"; });
  on("#sprt", () => W.print());
  related(a).then((o) => { const e = $("#srel"); if (e && o.length) e.innerHTML = sec("مرتبط بهذا الدرس", `<div class="rel">${o.join("")}</div>`); });
}
function initView() {
  const slug = new URLSearchParams(location.search).get("s");
  const a = all.find((x) => x.slug === slug);
  if (!a) { $("#aview").innerHTML = `<div class="sempty"><h3>لم نجد هذا الملخص</h3><p>قد يكون غير منشور أو الرابط غير صحيح.</p><a class="abtn go" href="../">العودة إلى القائمة</a></div>`; return; }
  drawView(a);
}
async function boot() {
  await load();
  if (IN_VIEW) initView(); else { if (!boot.i) { initList(); boot.i = 1; } drawList(); }
}
boot();
})();
