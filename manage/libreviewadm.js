/* مركز مراجعة المكتبة واكتشاف المحتوى الناقص (إدارة). كل الأرقام تأتي من قاعدة البيانات الفعلية عبر دوال libr_*؛ لا قيم افتراضية.
   المراجعة لا تحذف ولا تعدّل أي مورد: الكشف والتسجيل والمهام فقط. إخفاء المكرر يمر بمسار «الإيقاف المؤقت» المعتمد في مركز الجودة (صلاحية المراجع) ويُسجَّل في سجله.
   النطاق: من سنة إلى 6 سنوات والصفوف 1–4. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const ADM = { lib: "libadm", acts: "activitiesadm", bank: "bankadm", proj: "projadm", life: "lifeadm", ready: "readyadm", val: "valadm", exp: "expadm", vid: "videoadm", songs: "songadm", stories: "storiesadm", quiz: "quizadm", pack: "packsadm", tax: "libadm" };
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const LVS = Object.keys(LV);
const LVSH = { a2: "سنتان", a3: "3", a4: "4", a5: "5", a6: "6", g1: "ص1", g2: "ص2", g3: "ص3", g4: "ص4" };
const DOM = [["arabic", "اللغة العربية"], ["literacy", "القراءة والكتابة"], ["math", "الرياضيات"], ["science", "العلوم والملاحظة"], ["arts", "الفنون والإبداع"], ["life", "المهارات الحياتية"], ["stories", "القصص والأنشطة"], ["projects", "المشاريع التعليمية"], ["other", "مجالات أخرى (خارج الثمانية)"]];
const SRC = { lib: "المكتبة", acts: "نشاط", bank: "بنك الأنشطة", proj: "مشروع", life: "مهارة حياتية", ready: "استعداد مدرسي", val: "قيم", exp: "استكشاف", vid: "فيديو", songs: "أنشودة", stories: "قصة", quiz: "اختبار", pack: "حزمة", tax: "تصنيف" };
const KIND = { missing_title: "عنوان ناقص", missing_levels: "العمر/الصف غير محدد", out_of_scope: "مستوى خارج النطاق", missing_descr: "وصف ناقص", missing_domain: "المجال غير محدد", missing_type: "النوع غير محدد", missing_skill: "بلا مهارة مرتبطة", no_content: "بلا ملف أو محتوى", file_unverified: "ملف غير مسجّل (تحقق)", missing_img: "بلا صورة توضيحية", missing_instr: "تعليمات ناقصة", safety_verify: "تحقق من السلامة (فحص تقريبي)", missing_rights: "المصدر/الحقوق غير مذكورة", no_section: "بلا قسم", bad_class: "تصنيف غير مناسب", taxonomy_scope: "تصنيف صف أعلى من الرابع", broken_link: "ملف/رابط لا يعمل", link_type: "نوع الملف لا يوافق المسجل", manual: "مهمة يدوية", qc_accuracy: "جودة: صحة المعلومات", qc_arabic: "جودة: اللغة العربية", qc_age: "جودة: مناسبة العمر", qc_instructions: "جودة: وضوح التعليمات", qc_quality: "جودة: الملف/النشاط", qc_safety: "جودة: السلامة", qc_skill: "جودة: ارتباط المهارة", qc_privacy: "جودة: معلومات شخصية", qc_rights: "جودة: الحقوق/المصدر" };
const CLASS_K = ["missing_levels", "out_of_scope", "missing_domain", "missing_type", "no_section", "bad_class", "taxonomy_scope"];
const MISS_K = ["missing_title", "missing_descr", "missing_skill", "no_content", "file_unverified", "missing_img", "missing_instr", "safety_verify", "missing_rights"];
const PR = { urgent: "عاجلة", high: "مرتفعة", normal: "عادية" };
const STS = { open: "مفتوحة", doing: "قيد المعالجة", done: "مكتملة", ignored: "مُتجاهلة", fixed: "عولجت (لم تعد مكتشفة)" };
const SEC = { complete: "مكتمل مبدئيًا", needs_more: "يحتاج إلى محتوى إضافي", review: "يحتاج إلى مراجعة", not_ready: "غير جاهز للنشر", unused: "غير مستخدم حاليًا" };
const SEC_C = { complete: "ok", needs_more: "warn", review: "warn", not_ready: "bad", unused: "mut" };
const VERD = { ok: "سليم", broken: "غير موجود (404)", error: "تعذّر الفتح", mismatch: "نوع الملف لا يوافق", pending: "قيد الفحص", skip: "ملف خاص — لم يُفحص", unchecked: "لم يتم الفحص" };
const VERD_C = { ok: "ok", broken: "bad", error: "bad", mismatch: "bad", pending: "warn", skip: "mut", unchecked: "mut" };
const DUPR = { title: "عنوان متطابق أو شبه متطابق", descr: "وصف متطابق", file: "ملف متطابق", skill: "المهارة والعمر والنوع نفسها" };
const QC = [["accuracy", "صحة المعلومات التعليمية"], ["arabic", "سلامة اللغة العربية"], ["age", "مناسبة المحتوى للعمر أو الصف"], ["instructions", "وضوح التعليمات"], ["quality", "جودة الملف أو النشاط"], ["safety", "سلامة الأدوات والمواد (عند وجود نشاط عملي)"], ["skill", "ارتباط المورد بالمهارة المستهدفة"], ["privacy", "خلو المحتوى من معلومات شخصية غير ضرورية"], ["rights", "وضوح حقوق الاستخدام أو المصدر"]];
const TABS = [["sum", "الملخص"], ["sec", "الأقسام"], ["miss", "الناقص"], ["class", "التصنيف"], ["cov", "التغطية"], ["dup", "المكرر"], ["links", "الملفات والروابط"], ["qc", "الجودة"], ["tasks", "المهام"], ["rep", "التقارير"]];
const AD = (n) => String(n == null ? 0 : n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const fdt = (t) => { try { return t ? new Date(t).toLocaleString("ar-OM", { dateStyle: "medium", timeStyle: "short" }) : "—"; } catch (e) { return t || "—"; } };
const CSS = `.lr *{box-sizing:border-box}.lr{--p:#6b3fd4}.lr-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.lr-tabs .chip.on{background:var(--p);color:#fff}
.lr-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:10px 0}.lr-card{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px 12px}.lr-card b{display:block;font-size:24px;color:#4b2aa5;line-height:1.1}.lr-card span{font-size:12px;color:#5f5877}.lr-card.bad b{color:#b3261e}.lr-card.warn b{color:#8a5200}
.lr-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:8px 10px;margin:6px 0}.lr-row .t{flex:1;min-width:170px;font-weight:700}.lr-row .m{font-size:12px;color:#5f5877}
.lr-bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85;white-space:nowrap}.lr-bd.bad{background:#ffe3e0;color:#9a1d12}.lr-bd.ok{background:#dff6e7;color:#17683a}.lr-bd.warn{background:#fff0d1;color:#8a5200}.lr-bd.mut{background:#eee;color:#555}
.lr-f{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.lr-f select,.lr-f input,.lr-form select,.lr-form input,.lr-form textarea,.lr-row select{border:2px solid #e4d9ff;border-radius:10px;padding:6px;font:inherit;min-height:36px;background:#fff}
.lr-form{background:#faf7ff;border:1px solid #e4d9ff;border-radius:14px;padding:12px;margin:10px 0;display:flex;flex-direction:column;gap:8px}.lr-form label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px}
.lr-tw{overflow-x:auto}.lr table{border-collapse:collapse;width:100%;font-size:13px;background:#fff}.lr th,.lr td{border:1px solid #e4d9ff;padding:5px 7px;text-align:center}.lr th{background:#f1eaff;color:#3a1a85}.lr td.l{text-align:right}
.lr td.cell{cursor:pointer;min-width:46px}.lr td.cell.z{background:#f6f6f6;color:#888}.lr td.cell.lo{background:#fff0d1}.lr td.cell.hi{background:#e8f8ee}.lr-acts{display:flex;gap:6px;flex-wrap:wrap}.lr .chip.pri{background:var(--p);color:#fff}.lr .chip.bad{background:#c62f4a;color:#fff}
.lr h3{margin:14px 0 4px;color:#4b2aa5}.lr .mut{color:#5f5877;font-size:13px}.lr-note{background:#fff7e0;border:1px solid #f0d58a;border-radius:12px;padding:8px 10px;font-size:13px;margin:8px 0}
.lr-modal{position:fixed;inset:0;background:rgba(30,10,70,.45);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:16px}.lr-box{background:#fff;border-radius:18px;max-width:760px;width:100%;padding:14px;margin:auto}.lr-qc{display:grid;grid-template-columns:1fr;gap:6px}.lr-qc .r{border:1px solid #e4d9ff;border-radius:12px;padding:8px}
@media(min-width:700px){.lr-qc{grid-template-columns:1fr 1fr}}`;
const S = { tab: "sum", sum: null, secs: null, issues: [], dups: null, links: null, cov: null, reps: null, f: { k: "", l: "", p: "", s: "active", q: "" }, secOpen: null, secItems: null, dupF: "pending", linkF: "", repView: null, cell: null, busy: false };
let M = null;
const rpc = async (n, a) => { const r = await sb.rpc(n, a || {}); if (r.error) throw r.error; return r.data; };
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^[A-Z_]+:\s*/, ""), "err");
const gor = (key, src, title) => { const m = ADM[src || (key || "").split(":")[0]] || "libadm"; window.__go(m); setTimeout(() => toast("ابحث عن: «" + (title || key) + "» داخل صفحة التعديل", "ok"), 400); };

SUB.libreviewadm = { title: "مركز مراجعة المكتبة", fn: async function (m) {
  M = m; S.tab = "sum"; m.innerHTML = back() + '<p class="mut">جارٍ التحميل…</p>';
  try { S.sum = await rpc("libr_summary"); } catch (e) { m.innerHTML = back() + '<p class="mut">ليست لديك صلاحية الدخول إلى مركز مراجعة المكتبة (للمحرر أو المراجع أو مدير المكتبة).</p>'; return; }
  await loadIssues(); paint();
} };
const back = () => `<button class="chip" id="lrback" onclick="window.__go('libadm')">→ رجوع إلى لوحة إدارة المكتبة</button>`;
async function loadIssues() { const r = await sb.from("libr_issues").select("*").order("found_at", { ascending: false }).limit(2000); S.issues = r.data || []; }
async function refresh() { S.sum = await rpc("libr_summary"); await loadIssues(); S.secs = null; S.dups = null; S.links = null; S.cov = null; }
function shell(inner) {
  return `<style>${CSS}</style><div class="lr">${back()}
  <p class="mut">أداة مراجعة فعلية: تفحص بيانات المكتبة وتسجّل المشكلات والمهام. لا تحذف أي مورد ولا تعدّل محتواه؛ التعديل يتم من صفحة المورد نفسه.</p>
  <div class="lr-tabs" id="lrtabs">${TABS.map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div><div id="lrbody">${inner}</div></div>`;
}
async function paint() {
  M.innerHTML = shell('<p class="mut">جارٍ التحميل…</p>');
  $$("#lrtabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.f = { k: "", l: "", p: "", s: "active", q: "" }; S.secOpen = null; S.repView = null; S.cell = null; paint(); }));
  const body = $("#lrbody", M);
  try {
    const fn = { sum: vSum, sec: vSec, miss: () => vIssues(MISS_K, "ناقص"), class: () => vIssues(CLASS_K, "تصنيف"), cov: vCov, dup: vDup, links: vLinks, qc: vQc, tasks: () => vIssues(null, "مهام"), rep: vRep }[S.tab];
    body.innerHTML = await fn(); bindCommon(body);
    const b = { sum: bSum, sec: bSec, miss: bIssues, class: bIssues, cov: bCov, dup: bDup, links: bLinks, qc: bQc, tasks: bIssues, rep: bRep }[S.tab]; if (b) b(body);
  } catch (e) { body.innerHTML = '<p class="mut">تعذّر تحميل هذا القسم: ' + esc(e.message || e) + "</p>"; }
}
function bindCommon(root) {
  $$("[data-open]", root).forEach((b) => (b.onclick = () => gor(b.dataset.open, b.dataset.src, b.dataset.title)));
  $$("[data-det]", root).forEach((b) => (b.onclick = () => detail(b.dataset.det)));
}
const act = async (label, fn) => { if (S.busy) return; S.busy = true; try { const r = await fn(); return r; } catch (e) { fail(e); } finally { S.busy = false; } };

/* ---------- الملخص ---------- */
function vSum() {
  const s = S.sum, l = s.links || {}, lr = s.last_run;
  const c = (n, t, cls) => `<div class="lr-card ${cls || ""}"><b>${AD(n)}</b><span>${t}</span></div>`;
  return `<div class="lr-cards">${c(s.sections_published, "أقسام منشورة (من " + AD(s.sections_total) + ")")}${c(s.published, "موارد منشورة")}${c(s.drafts, "موارد مسودة")}${c(s.needs_review, "موارد تحتاج إلى مراجعة", s.needs_review ? "warn" : "")}${c(s.missing_data, "موارد ببيانات ناقصة", s.missing_data ? "warn" : "")}${c(l.unchecked || 0, "ملفات/روابط لم تُفحص", l.unchecked ? "warn" : "")}${c(l.bad, "ملفات/روابط فُحصت وفيها مشكلة", l.bad ? "bad" : "")}${c((s.empty_cats || []).length, "تصنيفات بلا محتوى")}${c(s.urgent_open, "مشكلات عاجلة مفتوحة", s.urgent_open ? "bad" : "")}${c(s.dups_pending, "تكرار محتمل بانتظار المراجعة")}</div>
  ${lr ? `<p class="mut">آخر مراجعة: ${fdt(lr.at)} — ${esc(lr.by_name || "")} (النطاق: ${esc(lr.scope === "all" ? "كل الأقسام" : lr.scope)})، اكتشفت ${AD(lr.found)} مشكلة.</p>` : `<div class="lr-note">لم تُجرَ أي مراجعة بعد، ولذلك لا توجد مشكلات مسجّلة. اضغط «بدء مراجعة جديدة» لفحص المكتبة فعليًا.</div>`}
  <div class="lr-acts"><button class="chip pri" id="lrrun">بدء مراجعة جديدة (كل الأقسام)</button><button class="chip" data-go="links">فحص الملفات والروابط</button><button class="chip" data-go="rep">إنشاء تقرير</button></div>
  <h3>تصنيفات بلا محتوى</h3>${(s.empty_cats || []).length ? s.empty_cats.map((e) => `<span class="lr-bd mut">${esc(e.label)} (${e.kind === "type" ? "نوع" : e.kind === "section" ? "قسم" : "مادة"})</span> `).join("") : '<p class="mut">لا توجد تصنيفات فارغة.</p>'}
  <p class="mut">ملاحظة: الروابط الخاصة (${AD(l.private)}) لا يمكن فحصها من هنا وتُحسب «لم تُفحص».</p>`;
}
function bSum(root) {
  $("#lrrun", root).onclick = () => act("run", async () => { toast("جارٍ فحص المكتبة…", "ok"); const r = await rpc("libr_run", { p_scope: null }); await refresh(); toast("اكتملت المراجعة: " + r.found + " مشكلة مسجّلة، " + r.fixed + " عولجت، " + r.reopened + " أُعيد فتحها", "ok"); S.tab = "sum"; paint(); });
  $$("[data-go]", root).forEach((b) => (b.onclick = () => { S.tab = b.dataset.go; paint(); }));
}

/* ---------- الأقسام ---------- */
async function vSec() {
  if (!S.secs) S.secs = await rpc("libr_sections");
  if (S.secOpen) return secItemsHtml();
  return `<p class="mut">حالة كل قسم تُحسب من موارده ومشكلاته المفتوحة، ويمكن للمحرر تثبيت حالة يدوية مع ملاحظة (تظهر بعلامة «يدوي»).</p>
  <div class="lr-tw"><table><tr><th>القسم</th><th>الموارد</th><th>منشور</th><th>مسودة</th><th>مشكلات مفتوحة</th><th>الحالة</th><th></th></tr>${S.secs.map((r) => `<tr><td class="l">${esc(r.label)}</td><td>${AD(r.total)}</td><td>${AD(r.pub)}</td><td>${AD(r.drafts)}</td><td>${AD(r.issues)}${r.urgent ? ` <span class="lr-bd bad">${AD(r.urgent)} عاجلة</span>` : ""}</td>
  <td><span class="lr-bd ${SEC_C[r.status]}">${SEC[r.status]}</span>${r.manual ? ' <span class="lr-bd">يدوي</span>' : ""}${r.note ? `<div class="m">${esc(r.note)}</div>` : ""}</td>
  <td><div class="lr-acts"><button class="chip" data-sopen="${esc(r.id)}">مراجعة موارده</button><button class="chip" data-sscan="${esc(r.id)}">فحص القسم</button><button class="chip" data-sset="${esc(r.id)}">تثبيت حالة</button></div></td></tr>`).join("")}</table></div><div id="lrsetbox"></div>`;
}
function bSec(root) {
  $$("[data-sopen]", root).forEach((b) => (b.onclick = async () => { S.secOpen = b.dataset.sopen; try { S.secItems = await rpc("libr_section_items", { p_id: S.secOpen }); } catch (e) { fail(e); S.secOpen = null; return; } paint(); }));
  $$("[data-sscan]", root).forEach((b) => (b.onclick = () => act("scan", async () => { const id = b.dataset.sscan; const r = await rpc("libr_run", { p_scope: id === "lib:-" ? "lib:-" : id }); await refresh(); toast("فُحص القسم: " + r.found + " مشكلة", "ok"); paint(); })));
  $$("[data-sset]", root).forEach((b) => (b.onclick = () => { const id = b.dataset.sset, r = S.secs.find((x) => x.id === id); $("#lrsetbox", root).innerHTML = `<div class="lr-form"><b>تثبيت حالة القسم: ${esc(r.label)}</b><label>الحالة<select id="lrss">${Object.entries(SEC).map(([k, v]) => `<option value="${k}" ${r.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label><label>ملاحظة<input id="lrsn" value="${esc(r.note || "")}" maxlength="300"></label><div class="lr-acts"><button class="chip pri" id="lrssave">حفظ</button><button class="chip" id="lrsclr">إلغاء التثبيت (العودة للحساب التلقائي)</button></div></div>`;
    $("#lrssave", root).onclick = () => act("s", async () => { await rpc("libr_section_set", { p_id: id, p_status: $("#lrss", root).value, p_note: $("#lrsn", root).value }); S.secs = null; toast("حُفظت حالة القسم", "ok"); paint(); });
    $("#lrsclr", root).onclick = () => act("s", async () => { await rpc("libr_section_set", { p_id: id, p_status: null, p_note: null }); S.secs = null; toast("عاد القسم للحساب التلقائي", "ok"); paint(); }); }));
  const bk = $("#lrsecback", root); if (bk) bk.onclick = () => { S.secOpen = null; paint(); };
}
function secItemsHtml() {
  const r = S.secs.find((x) => x.id === S.secOpen) || { label: S.secOpen };
  return `<button class="chip" id="lrsecback">← كل الأقسام</button><h3>${esc(r.label)} — ${AD(S.secItems.length)} مورد</h3>${S.secItems.length ? S.secItems.map((i) => `<div class="lr-row"><span class="t">${esc(i.title)}</span><span class="lr-bd">${SRC[i.src] || i.src}</span><span class="lr-bd ${i.status === "published" ? "ok" : "warn"}">${i.status === "published" ? "منشور" : "غير منشور"}</span>${(i.issues || []).length ? `<span class="lr-bd warn">${AD(i.issues.length)} مشكلة</span>` : '<span class="lr-bd ok">بلا مشكلات</span>'}<div class="lr-acts"><button class="chip" data-det="${esc(i.key)}">تفاصيل ومراجعة</button><button class="chip" data-open="${esc(i.key)}" data-src="${i.src}" data-title="${esc(i.title)}">تعديل المورد</button></div></div>`).join("") : '<p class="mut">لا توجد موارد في هذا القسم.</p>'}`;
}

/* ---------- المشكلات (الناقص / التصنيف / المهام) ---------- */
function filtered(kinds) {
  const f = S.f; return S.issues.filter((i) => (!kinds || kinds.includes(i.kind) || (kinds === MISS_K && false)) && (!f.k || i.kind === f.k) && (!f.l || (i.levels || []).includes(f.l)) && (!f.p || i.priority === f.p) && (!f.s || (f.s === "active" ? ["open", "doing"].includes(i.status) : i.status === f.s)) && (!f.q || (i.title || "").includes(f.q)));
}
function vIssues(kinds, kind) {
  const f = S.f, ks = kinds || Object.keys(KIND), list = filtered(kinds), all = kinds ? S.issues.filter((i) => kinds.includes(i.kind)) : S.issues;
  const ord = { urgent: 0, high: 1, normal: 2 }; list.sort((a, b) => ord[a.priority] - ord[b.priority]);
  const head = `<div class="lr-f"><select id="fk"><option value="">كل الأنواع</option>${ks.map((k) => `<option value="${k}" ${f.k === k ? "selected" : ""}>${KIND[k]}</option>`).join("")}</select><select id="fl"><option value="">كل الأعمار/الصفوف</option>${LVS.map((l) => `<option value="${l}" ${f.l === l ? "selected" : ""}>${LV[l]}</option>`).join("")}</select><select id="fp"><option value="">كل الأولويات</option>${Object.entries(PR).map(([k, v]) => `<option value="${k}" ${f.p === k ? "selected" : ""}>${v}</option>`).join("")}</select><select id="fs"><option value="active" ${f.s === "active" ? "selected" : ""}>المفتوحة وقيد المعالجة</option><option value="open" ${f.s === "open" ? "selected" : ""}>مفتوحة</option>${["doing", "done", "fixed", "ignored"].map((k) => `<option value="${k}" ${f.s === k ? "selected" : ""}>${STS[k]}</option>`).join("")}<option value="" ${f.s === "" ? "selected" : ""}>كل الحالات</option></select><input id="fq" placeholder="بحث بالعنوان" value="${esc(f.q)}"></div>`;
  const intro = kind === "ناقص" ? '<p class="mut">موارد ينقصها عنصر أساسي. العناصر التي لا ينطبق وجودها على نوع المورد (مثل وصف التجارب أو صورة الفيديو) لا تُعدّ نقصًا. فحص السلامة تقريبي ويحتاج مراجعتك.</p>' : kind === "تصنيف" ? '<p class="mut">موارد بلا قسم أو بتصنيف غير مناسب أو خارج نطاق المنصة. لا يُحذف أي تصنيف تلقائيًا.</p>' : '<div class="lr-acts"><button class="chip pri" id="addtask">+ مهمة تصحيحية يدوية</button></div><div id="taskbox"></div>';
  return intro + head + `<p class="mut">${AD(list.length)} من ${AD(all.length)} مسجّلة.</p>` + (list.length ? list.slice(0, 300).map(issueRow).join("") : `<p class="mut">${S.sum.last_run ? "لا توجد نتائج بهذه الشروط." : "لم تُجرَ مراجعة بعد."}</p>`) + (list.length > 300 ? '<p class="mut">يُعرض أول 300؛ ضيّق الفلتر لعرض الباقي.</p>' : "");
}
function issueRow(i) {
  return `<div class="lr-row" data-iid="${i.id}"><span class="lr-bd ${i.priority === "urgent" ? "bad" : i.priority === "high" ? "warn" : ""}">${PR[i.priority]}</span><span class="t">${esc(i.title || i.key)}<div class="m">${esc(KIND[i.kind] || i.kind)} — ${esc(i.detail || "")}</div><div class="m">${i.src ? SRC[i.src] || i.src : ""}${(i.levels || []).length ? " · " + (i.levels || []).map((l) => LV[l] || l).join("، ") : ""}${i.assignee ? " · المسؤول: " + esc(i.assignee) : ""}${i.review_date ? " · موعد: " + esc(i.review_date) : ""}${i.note ? " · " + esc(i.note) : ""}</div></span>
  <span class="lr-bd ${i.status === "done" || i.status === "fixed" ? "ok" : i.status === "ignored" ? "mut" : "warn"}">${STS[i.status]}</span>
  <div class="lr-acts">${i.key && i.src !== "tax" ? `<button class="chip" data-open="${esc(i.key)}" data-src="${i.src}" data-title="${esc(i.title || "")}">فتح المورد</button><button class="chip" data-det="${esc(i.key)}">تفاصيل</button>` : i.src === "tax" ? `<button class="chip" data-open="tax" data-src="tax" data-title="التصنيفات">فتح التصنيفات</button>` : ""}${["open", "doing"].includes(i.status) ? `<button class="chip pri" data-done="${i.id}">تحديد كمكتمل</button><button class="chip" data-edt="${i.id}">تعيين/تحديث</button>` : `<button class="chip" data-reopen="${i.id}">إعادة فتح</button>`}</div></div>`;
}
function bIssues(root) {
  const bind = (id, k) => { const e = $(id, root); if (e) e.onchange = e.oninput = () => { S.f[k] = e.value; if (k === "q") { clearTimeout(bind.t); bind.t = setTimeout(paint, 250); } else paint(); }; };
  bind("#fk", "k"); bind("#fl", "l"); bind("#fp", "p"); bind("#fs", "s"); bind("#fq", "q");
  $$("[data-done]", root).forEach((b) => (b.onclick = () => act("d", async () => { await rpc("libr_task_set", { p_id: b.dataset.done, p_status: "done" }); await refresh(); toast("حُدّدت كمكتملة (إن بقيت المشكلة مكتشفة ستُعاد فتحها عند الفحص التالي)", "ok"); paint(); })));
  $$("[data-reopen]", root).forEach((b) => (b.onclick = () => act("r", async () => { await rpc("libr_task_set", { p_id: b.dataset.reopen, p_status: "open" }); await refresh(); paint(); })));
  $$("[data-edt]", root).forEach((b) => (b.onclick = () => { const i = S.issues.find((x) => x.id === b.dataset.edt); const row = b.closest(".lr-row"); const old = $(".lr-form", row); if (old) { old.remove(); return; } row.insertAdjacentHTML("beforeend", `<div class="lr-form" style="width:100%"><label>المسؤول<input class="as" maxlength="60" value="${esc(i.assignee || "")}"></label><label>موعد المراجعة<input class="rd" type="date" value="${esc(i.review_date || "")}"></label><label>الحالة<select class="st"><option value="open" ${i.status === "open" ? "selected" : ""}>مفتوحة</option><option value="doing" ${i.status === "doing" ? "selected" : ""}>قيد المعالجة</option><option value="ignored">تجاهل (مع ذكر السبب)</option></select></label><label>ملاحظة<input class="nt" maxlength="500" value="${esc(i.note || "")}"></label><div class="lr-acts"><button class="chip pri sv">حفظ</button></div></div>`);
    $(".sv", row).onclick = () => act("e", async () => { const st = $(".st", row).value, nt = $(".nt", row).value; if (st === "ignored" && nt.trim().length < 3) throw new Error("اكتب سبب التجاهل في الملاحظة."); await rpc("libr_task_set", { p_id: i.id, p_status: st, p_assignee: $(".as", row).value, p_note: nt, p_review: $(".rd", row).value || null }); await refresh(); toast("حُفظت المهمة", "ok"); paint(); }); }));
  const at = $("#addtask", root); if (at) at.onclick = () => { $("#taskbox", root).innerHTML = `<div class="lr-form"><label>مفتاح المورد (مثل lib:slug) — أو افتح «تفاصيل» أي مورد وأضف المهمة من هناك<input id="tk" placeholder="lib:..."></label><label>وصف المهمة<input id="td" maxlength="500"></label><label>الأولوية<select id="tp"><option value="normal">عادية</option><option value="high">مرتفعة</option><option value="urgent">عاجلة</option></select></label><label>المسؤول<input id="ta" maxlength="60"></label><button class="chip pri" id="tsv">إنشاء المهمة</button></div>`; $("#tsv", root).onclick = () => act("t", async () => { await rpc("libr_task_add", { p_key: $("#tk", root).value.trim(), p_detail: $("#td", root).value, p_priority: $("#tp", root).value, p_assignee: $("#ta", root).value }); await refresh(); toast("أُنشئت المهمة", "ok"); paint(); }); };
}

/* ---------- التغطية ---------- */
async function vCov() {
  if (!S.cov) S.cov = await rpc("libr_coverage");
  const cells = {}, tg = {}; S.cov.cells.forEach((c) => (cells[c.dom + "|" + c.lvl] = c.n)); S.cov.targets.forEach((t) => (tg[t.dom + "|" + t.lvl] = t.target));
  const tot = {}; S.cov.cells.forEach((c) => (tot[c.dom] = (tot[c.dom] || 0) + c.n));
  const rows = DOM.map(([d, n]) => `<tr><td class="l">${n}</td>${LVS.map((l) => { const c = cells[d + "|" + l] || 0, t = tg[d + "|" + l]; const cls = t == null ? (c === 0 ? "z" : "") : c < t ? "lo" : "hi"; return `<td class="cell ${cls}" data-cd="${d}" data-cl="${l}" title="${t == null ? "لا توجد خطة محددة" : "المستهدف " + t}">${AD(c)}${t != null ? `<div class="m">/ ${AD(t)}</div>` : ""}</td>`; }).join("")}</tr>`).join("");
  const hasT = S.cov.targets.length;
  const ge = S.cov.goals_empty;
  return `<div class="lr-note">قلة الموارد في خانة ليست مشكلة تلقائيًا. تُقارن الخانة بالمستهدف فقط إذا حدّده المحرر من خطة المحتوى؛ الخانة بلا مستهدف تُعرض بلا حكم. العدد = موارد منشورة بالعمر/الصف. موارد يتجاوز عمرها مستوى واحدًا تُحسب في كل مستوى. مجال القراءة والكتابة يُحسب حاليًا من قسم الحروف فقط.</div>
  <div class="lr-tw"><table><tr><th>المجال</th>${LVS.map((l) => `<th>${LVSH[l]}</th>`).join("")}</tr>${rows}</table></div><div id="lrcellbox"></div>
  <p class="mut">${hasT ? "المستهدفات المحددة: " + AD(hasT) : "لم يُحدَّد أي مستهدف بعد. اضغط خانة لتحديد المستهدف من خطة المحتوى."} (لون أصفر = دون المستهدف، أخضر = حقق المستهدف، رمادي = صفر بلا خطة)</p>
  <h3>أهداف تعليمية بلا موارد منشورة مرتبطة (${AD(ge.length)} من ${AD(S.cov.goals_total)})</h3>${ge.length ? ge.slice(0, 40).map((g) => `<div class="lr-row"><span class="t">${esc(g.name)}</span><span class="lr-bd">${esc(g.domain)}</span><span class="lr-bd ${g.status === "active" ? "ok" : "warn"}">${g.status === "active" ? "منشور" : "مسودة"}</span></div>`).join("") + (ge.length > 40 ? '<p class="mut">يُعرض أول 40.</p>' : "") : '<p class="mut">لكل هدف مورد منشور واحد على الأقل.</p>'}`;
}
function bCov(root) {
  $$("td.cell", root).forEach((td) => (td.onclick = () => { const d = td.dataset.cd, l = td.dataset.cl; const t = S.cov.targets.find((x) => x.dom === d && x.lvl === l); const dn = (DOM.find((x) => x[0] === d) || [0, d])[1];
    if (d === "other") { $("#lrcellbox", root).innerHTML = '<div class="lr-note">لا يُحدَّد مستهدف لمجالات خارج الثمانية.</div>'; return; }
    $("#lrcellbox", root).innerHTML = `<div class="lr-form"><b>${esc(dn)} — ${LV[l]}</b><label>عدد الموارد المستهدف من خطة المحتوى<input id="ctv" type="number" min="0" max="500" value="${t ? t.target : ""}"></label><label>ملاحظة (اختياري)<input id="ctn" maxlength="200" value="${esc(t && t.note || "")}"></label><div class="lr-acts"><button class="chip pri" id="ctsv">حفظ المستهدف</button><button class="chip" id="ctdel">إزالة المستهدف</button></div></div>`;
    $("#ctsv", root).onclick = () => act("t", async () => { const v = $("#ctv", root).value; if (v === "") throw new Error("اكتب رقمًا أو استخدم «إزالة المستهدف»."); await rpc("libr_target_set", { p_dom: d, p_lvl: l, p_target: Number(v), p_note: $("#ctn", root).value }); S.cov = null; toast("حُفظ المستهدف", "ok"); paint(); });
    $("#ctdel", root).onclick = () => act("t", async () => { await rpc("libr_target_set", { p_dom: d, p_lvl: l, p_target: null, p_note: null }); S.cov = null; paint(); }); }));
}

/* ---------- المكرر ---------- */
async function vDup() {
  if (!S.dups) S.dups = await rpc("libr_dup_list");
  const L = S.dups.filter((d) => !S.dupF || d.status === S.dupF);
  const nm = { pending: "بانتظار المراجعة", not_dup: "ليس مكررًا", hidden: "أُخفي أحدهما" };
  return `<div class="lr-note">التشابه احتمال فقط: لا يُحذف أي مورد ولا يُخفى شيء تلقائيًا. بعد المراجعة اختر «ليسا مكررين» أو أخفِ أحدهما (إيقاف مؤقت يُسجَّل في مركز الجودة ويحتاج صلاحية المراجع). دمج البيانات يتم يدويًا من صفحة تعديل المورد.</div>
  <div class="lr-f"><select id="dupf">${Object.entries(nm).map(([k, v]) => `<option value="${k}" ${S.dupF === k ? "selected" : ""}>${v}</option>`).join("")}<option value="" ${S.dupF === "" ? "selected" : ""}>الكل</option></select></div><p class="mut">${AD(L.length)} زوجًا.</p>` +
    (L.length ? L.slice(0, 200).map((d, n) => `<div class="lr-row" data-n="${n}"><div class="t">① ${esc(d.ta)} <span class="lr-bd">${SRC[d.srca]}</span> <span class="lr-bd ${d.sa === "published" ? "ok" : "warn"}">${d.sa === "published" ? "منشور" : d.sa === "suspended" ? "موقوف" : "غير منشور"}</span><br>② ${esc(d.tb)} <span class="lr-bd">${SRC[d.srcb]}</span> <span class="lr-bd ${d.sb === "published" ? "ok" : "warn"}">${d.sb === "published" ? "منشور" : d.sb === "suspended" ? "موقوف" : "غير منشور"}</span><div class="m">سبب الاشتباه: ${(d.reasons || []).map((r) => DUPR[r] || r).join(" + ")}</div>${d.status !== "pending" ? `<div class="m">${nm[d.status]}${d.note ? " — " + esc(d.note) : ""}</div>` : ""}</div>
    <div class="lr-acts"><button class="chip" data-open="${esc(d.a)}" data-src="${d.srca}" data-title="${esc(d.ta)}">فتح ①</button><button class="chip" data-open="${esc(d.b)}" data-src="${d.srcb}" data-title="${esc(d.tb)}">فتح ②</button>${d.status === "pending" ? `<button class="chip" data-nd="${n}">ليسا مكررين</button><button class="chip bad" data-hd="${n}">إخفاء أحدهما…</button>` : d.status === "not_dup" ? `<button class="chip" data-rp="${n}">إعادة للمراجعة</button>` : ""}</div></div>`).join("") : '<p class="mut">لا توجد أزواج بهذه الحالة.</p>');
}
function bDup(root) {
  const L = S.dups.filter((d) => !S.dupF || d.status === S.dupF);
  $("#dupf", root).onchange = (e) => { S.dupF = e.target.value; paint(); };
  $$("[data-nd]", root).forEach((b) => (b.onclick = () => act("n", async () => { const d = L[b.dataset.nd]; await rpc("libr_dup_decide", { p_a: d.a, p_b: d.b, p_status: "not_dup", p_note: "رُوجع: ليسا مكررين" }); S.dups = null; toast("سُجّل أنهما ليسا مكررين", "ok"); paint(); })));
  $$("[data-rp]", root).forEach((b) => (b.onclick = () => act("n", async () => { const d = L[b.dataset.rp]; await rpc("libr_dup_decide", { p_a: d.a, p_b: d.b, p_status: "pending", p_note: null }); S.dups = null; paint(); })));
  $$("[data-hd]", root).forEach((b) => (b.onclick = () => { const d = L[b.dataset.hd], row = b.closest(".lr-row"); if ($(".lr-form", row)) { $(".lr-form", row).remove(); return; }
    row.insertAdjacentHTML("beforeend", `<div class="lr-form" style="width:100%"><b>تأكيد الإخفاء (إيقاف مؤقت، ليس حذفًا، ويمكن إعادة نشره من مركز الجودة)</b><label>المورد المراد إخفاؤه<select class="hk"><option value="${esc(d.b)}">② ${esc(d.tb)}</option><option value="${esc(d.a)}">① ${esc(d.ta)}</option></select></label><label>سبب الإخفاء (5 أحرف على الأقل)<input class="hn" maxlength="300"></label><button class="chip bad hc">أؤكد إخفاء هذا المورد</button></div>`);
    $(".hc", row).onclick = () => act("h", async () => { await rpc("libr_dup_hide", { p_a: d.a, p_b: d.b, p_hide: $(".hk", row).value, p_note: $(".hn", row).value }); await refresh(); toast("أُخفي المورد (إيقاف مؤقت) وسُجّل في مركز الجودة", "ok"); paint(); }); }));
}

/* ---------- الملفات والروابط ---------- */
async function vLinks() {
  if (!S.links) S.links = await rpc("libr_links_list");
  const c = {}; S.links.forEach((l) => (c[l.verdict] = (c[l.verdict] || 0) + 1));
  const L = S.links.filter((l) => !S.linkF || l.verdict === S.linkF);
  return `<div class="lr-note">يفحص الخادم كل ملف/رابط مسجّل بطلب GET فعلي (الملفات النسبية تُفحص على موقع المنصة) ويتحقق من رمز الاستجابة ونوع المحتوى مقابل الامتداد. ما لم يُفحص يظهر «لم يتم الفحص»، ولا يُعدّ سليمًا. الملفات الخاصة لا تُفحص من هنا. لا يمكن اكتشاف خطأ محتوى الملف نفسه، فهذا تقيّمه مراجعة الجودة.</div>
  <div class="lr-acts"><button class="chip pri" id="lstart">بدء فحص كل الملفات والروابط</button><button class="chip" id="lcol">تحديث النتائج</button></div>
  <div class="lr-cards">${Object.keys(VERD).map((k) => `<div class="lr-card ${VERD_C[k] === "bad" ? "bad" : VERD_C[k] === "warn" ? "warn" : ""}"><b>${AD(c[k] || 0)}</b><span>${VERD[k]}</span></div>`).join("")}</div>
  <div class="lr-f"><select id="lflt"><option value="">كل النتائج</option>${Object.entries(VERD).map(([k, v]) => `<option value="${k}" ${S.linkF === k ? "selected" : ""}>${v}</option>`).join("")}</select></div>
  ${L.slice(0, 300).map((l) => `<div class="lr-row"><span class="t">${esc(l.title)}<div class="m">${l.field === "file" ? "الملف الأساسي" : "الملف الثاني"}: <bdi>${esc(l.url)}</bdi>${l.code ? " · رمز " + l.code : ""}${l.ctype ? " · " + esc(l.ctype) : ""}${l.at ? " · " + fdt(l.at) : ""}</div></span><span class="lr-bd ${VERD_C[l.verdict]}">${VERD[l.verdict]}</span><button class="chip" data-open="${esc(l.key)}" data-src="${l.src}" data-title="${esc(l.title)}">تعديل المورد</button></div>`).join("")}${L.length > 300 ? '<p class="mut">يُعرض أول 300.</p>' : ""}`;
}
function bLinks(root) {
  $("#lflt", root).onchange = (e) => { S.linkF = e.target.value; paint(); };
  $("#lstart", root).onclick = () => act("l", async () => { const r = await rpc("libr_links_start", { p_src: null, p_key: null, p_limit: 1000 }); S.links = null; toast("بدأ فحص " + r.started + " ملفًا. اضغط «تحديث النتائج» بعد دقيقة.", "ok"); paint(); });
  $("#lcol", root).onclick = () => act("c", async () => { const r = await rpc("libr_links_collect", { p_key: null }); await refresh(); toast("وصلت " + r.collected + " نتيجة" + (r.still_pending ? "، ما زال " + r.still_pending + " قيد الفحص" : ""), "ok"); paint(); });
}

/* ---------- الجودة ---------- */
function vQc() {
  return `<p class="mut">قائمة الجودة تُسجَّل لكل مورد على حدة (تسع بنود: سليم / مشكلة / لا ينطبق، مع اسم المسجّل والتاريخ). ابحث عن المورد ثم افتح قائمته. تسجيل «مشكلة» ينشئ مهمة تصحيحية تلقائيًا؛ مشكلة العمر أو السلامة في مورد منشور تُعدّ عاجلة.</p>
  <div class="lr-f"><input id="qcq" placeholder="ابحث بعنوان المورد" style="flex:1"><button class="chip pri" id="qcgo">بحث</button></div><div id="qcres"></div>`;
}
function bQc(root) {
  const go = async () => { const q = $("#qcq", root).value.trim(); if (q.length < 2) { toast("اكتب حرفين على الأقل", "err"); return; } const r = await sb.from("quality_items").select("key,src,title,status").eq("gone", false).ilike("title", "%" + q.replace(/[%_]/g, "") + "%").limit(30); const a = r.data || [];
    $("#qcres", root).innerHTML = a.length ? a.map((i) => `<div class="lr-row"><span class="t">${esc(i.title)}</span><span class="lr-bd">${SRC[i.src]}</span><button class="chip pri" data-det="${esc(i.key)}">قائمة الجودة والتفاصيل</button></div>`).join("") : '<p class="mut">لا نتائج.</p>'; bindCommon($("#qcres", root)); };
  $("#qcgo", root).onclick = go; $("#qcq", root).onkeydown = (e) => { if (e.key === "Enter") go(); };
}

/* ---------- نافذة المورد: التفاصيل + الجودة + إعادة الفحص ---------- */
async function detail(key) {
  let it; try { it = await rpc("libr_item", { p_key: key }); } catch (e) { return fail(e); }
  const ck = {}; it.checks.forEach((c) => (ck[c.item] = c));
  const box = document.createElement("div"); box.className = "lr-modal"; box.innerHTML = `<div class="lr-box lr" role="dialog" aria-label="تفاصيل المورد"><div class="lr-acts" style="justify-content:space-between"><b>${esc(it.title)}</b><button class="chip" id="mx">إغلاق ✕</button></div>
  <p class="mut">${SRC[it.src]} · ${it.status === "published" ? "منشور" : "غير منشور"} · ${esc((it.levels || []).map((l) => LV[l] || l).join("، ") || "العمر غير محدد")}${it.subject ? " · " + esc(it.subject) : ""}${it.typ ? " · النوع: " + esc(it.typ) : ""}</p>
  <p class="mut">المهارات: ${it.skills.length ? esc(it.skills.join("، ")) : "—"} · المسارات: ${it.paths.length ? esc(it.paths.join("، ")) : "—"} · الأهداف: ${it.goals.length ? esc(it.goals.join("، ")) : "—"}</p>
  <h3>المشكلات المفتوحة (${AD(it.issues.length)})</h3>${it.issues.length ? it.issues.map((i) => `<div class="lr-row"><span class="lr-bd ${i.priority === "urgent" ? "bad" : i.priority === "high" ? "warn" : ""}">${PR[i.priority]}</span><span class="t">${esc(KIND[i.kind] || i.kind)}<div class="m">${esc(i.detail)}</div></span></div>`).join("") : '<p class="mut">لا مشكلات مفتوحة.</p>'}
  <div class="lr-acts"><button class="chip pri" id="mopen">تعديل المورد</button><button class="chip" id="mrescan">إعادة فحص المورد بعد التعديل</button></div>
  <h3>قائمة مراجعة الجودة</h3><div class="lr-qc">${QC.map(([k, l]) => { const c = ck[k]; return `<div class="r" data-qk="${k}"><b>${l}</b>${c ? `<div class="m">آخر تسجيل: ${c.verdict === "ok" ? "سليم" : c.verdict === "bad" ? "مشكلة" : "لا ينطبق"} — ${esc(c.by || "")} ${fdt(c.at)}${c.note ? " — " + esc(c.note) : ""}</div>` : '<div class="m">لم تُسجَّل بعد</div>'}<div class="lr-f"><select class="qv"><option value="ok">سليم</option><option value="bad">مشكلة</option><option value="na">لا ينطبق</option></select><input class="qn" maxlength="500" placeholder="ملاحظة (إلزامية عند وجود مشكلة)"><button class="chip qs">تسجيل</button></div></div>`; }).join("")}</div>
  <h3>إضافة مهمة تصحيحية لهذا المورد</h3><div class="lr-form"><label>وصف المهمة<input id="mtd" maxlength="500"></label><label>الأولوية<select id="mtp"><option value="normal">عادية</option><option value="high">مرتفعة</option><option value="urgent">عاجلة</option></select></label><label>المسؤول<input id="mta" maxlength="60"></label><button class="chip" id="mtsv">إنشاء المهمة</button></div></div>`;
  document.body.appendChild(box); const close = () => box.remove(); $("#mx", box).onclick = close; box.onclick = (e) => { if (e.target === box) close(); };
  $("#mopen", box).onclick = () => { close(); gor(key, it.src, it.title); };
  $("#mrescan", box).onclick = () => act("rs", async () => { const r = await rpc("libr_rescan", { p_key: key }); toast("أُعيد فحص المورد: " + r.found + " مشكلة قائمة، " + r.fixed + " عولجت", "ok"); await refresh(); close(); paint(); });
  $$(".qs", box).forEach((b) => (b.onclick = () => act("q", async () => { const r = b.closest(".r"); await rpc("libr_check_save", { p_key: key, p_item: r.dataset.qk, p_verdict: $(".qv", r).value, p_note: $(".qn", r).value }); toast("سُجّل البند", "ok"); await refresh(); close(); detail(key); })));
  $("#mtsv", box).onclick = () => act("t", async () => { await rpc("libr_task_add", { p_key: key, p_detail: $("#mtd", box).value, p_priority: $("#mtp", box).value, p_assignee: $("#mta", box).value }); toast("أُنشئت المهمة", "ok"); await refresh(); close(); paint(); });
}

/* ---------- التقارير ---------- */
async function vRep() {
  if (S.repView) return repHtml(S.repView);
  const r = await sb.from("libr_reports").select("id,created_at,by_name,title").order("created_at", { ascending: false }).limit(50); S.reps = r.data || [];
  return `<p class="mut">يُنشأ التقرير من بيانات المراجعة المسجّلة وقت إنشائه، ويحمل تاريخه واسم من أنشأه، ويُحفظ كما هو (لقطة) للرجوع إليه. إن لم تُجرَ مراجعة قبله فسيذكر ذلك.</p>
  <div class="lr-form"><label>عنوان التقرير (اختياري)<input id="rtt" maxlength="120" placeholder="تقرير مراجعة المكتبة"></label><button class="chip pri" id="rmk">إنشاء تقرير جديد</button></div>
  <h3>التقارير المحفوظة (${AD(S.reps.length)})</h3>${S.reps.length ? S.reps.map((x) => `<div class="lr-row"><span class="t">${esc(x.title)}<div class="m">${fdt(x.created_at)} — ${esc(x.by_name || "")}</div></span><button class="chip" data-rv="${x.id}">عرض</button></div>`).join("") : '<p class="mut">لا توجد تقارير بعد.</p>'}`;
}
function repHtml(rp) {
  const d = rp.data, s = d.summary, sec = (st) => d.sections.filter((x) => st.includes(x.status));
  const lst = (a, f, empty) => a.length ? "<ul>" + a.map((x) => "<li>" + f(x) + "</li>").join("") + "</ul>" : `<p class="mut">${empty}</p>`;
  return `<div class="lr-acts"><button class="chip" id="rback">← التقارير</button><button class="chip pri" id="rcsv">تنزيل CSV</button><button class="chip" id="rprint">طباعة</button></div>
  <div id="rbody"><h3>${esc(rp.title)}</h3><p class="mut">أُنشئ: ${fdt(d.created_at)} — ${esc(d.by || "")}${s.last_run ? " · آخر مراجعة قبله: " + fdt(s.last_run.at) : " · لم تكن قد أُجريت مراجعة قبله"}</p>
  <div class="lr-cards"><div class="lr-card"><b>${AD(s.published)}</b><span>موارد منشورة</span></div><div class="lr-card"><b>${AD(d.counts.open)}</b><span>مهام مفتوحة</span></div><div class="lr-card"><b>${AD(d.counts.done)}</b><span>مهام عولجت</span></div><div class="lr-card"><b>${AD(s.dups_pending)}</b><span>تكرار محتمل</span></div></div>
  <h3>الأقسام التي تمت مراجعتها (${AD(d.sections.length)})</h3>${lst(d.sections, (x) => esc(x.label) + " — " + SEC[x.status] + (x.manual ? " (يدوي)" : "") + " (" + AD(x.total) + " مورد)", "—")}
  <h3>أقسام تحتاج إلى استكمال (${AD(sec(["needs_more", "review", "not_ready"]).length)})</h3>${lst(sec(["needs_more", "review", "not_ready"]), (x) => esc(x.label) + " — " + SEC[x.status], "لا توجد.")}
  <h3>موارد ببيانات ناقصة (${AD(d.missing_data.length)})</h3>${lst(d.missing_data.slice(0, 80), (x) => esc(x.title || x.key) + " — " + x.kinds.map((k) => KIND[k] || k).join("، "), "لا توجد.")}${d.missing_data.length > 80 ? '<p class="mut">يُعرض أول 80 هنا؛ القائمة الكاملة في ملف CSV.</p>' : ""}
  <h3>موارد مكررة محتملة (${AD(d.dups.length)})</h3>${lst(d.dups.slice(0, 60), (x) => esc(x.ta) + " ↔ " + esc(x.tb) + " (" + x.reasons.map((r) => DUPR[r] || r).join(" + ") + ")", "لا توجد.")}
  <h3>ملفات/روابط تحتاج إلى فحص</h3><p class="mut">لم تُفحص: ${AD(s.links.unchecked)} · فُحصت وفيها مشكلة: ${AD(s.links.bad)} · سليمة: ${AD(s.links.ok)} · خاصة لا تُفحص: ${AD(s.links.private)}</p>${lst(d.links.slice(0, 60), (x) => esc(x.key) + " — " + (VERD[x.verdict] || x.verdict) + " <bdi>" + esc(x.url || "") + "</bdi>", "لا توجد روابط مسجّلة بمشكلة.")}
  <h3>مشكلات التصنيف (${AD(d.class_issues.length)})</h3>${lst(d.class_issues.slice(0, 60), (x) => esc(x.title || x.key) + " — " + (KIND[x.kind] || x.kind), "لا توجد.")}
  <h3>المهام التي عولجت (${AD(d.counts.done)})</h3>${lst(d.tasks_done.filter((x) => ["done", "fixed"].includes(x.status)).slice(0, 40), (x) => esc(x.title || x.key) + " — " + (KIND[x.kind] || x.kind), "لا توجد.")}
  <h3>المهام المفتوحة (${AD(d.counts.open)})</h3>${lst(d.tasks_open.slice(0, 60), (x) => "[" + PR[x.priority] + "] " + esc(x.title || x.key) + " — " + (KIND[x.kind] || x.kind) + (x.assignee ? " — " + esc(x.assignee) : ""), "لا توجد.")}</div>`;
}
function bRep(root) {
  const mk = $("#rmk", root); if (mk) mk.onclick = () => act("r", async () => { const r = await rpc("libr_report_create", { p_title: $("#rtt", root).value }); S.repView = { title: r.title, data: r.data }; toast("أُنشئ التقرير", "ok"); paint(); });
  $$("[data-rv]", root).forEach((b) => (b.onclick = async () => { const r = await sb.from("libr_reports").select("title,data").eq("id", b.dataset.rv).single(); if (r.error) return fail(r.error); S.repView = r.data; paint(); }));
  const bk = $("#rback", root); if (bk) bk.onclick = () => { S.repView = null; paint(); };
  const cs = $("#rcsv", root); if (cs) cs.onclick = () => { const d = S.repView.data, q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const rows = [["النوع", "المورد", "المشكلة", "الأولوية", "الحالة", "المسؤول"]].concat(d.tasks_open.map((x) => ["مفتوحة", x.title || x.key, KIND[x.kind] || x.kind, PR[x.priority], STS[x.status], x.assignee || ""])).concat(d.tasks_done.map((x) => ["عولجت", x.title || x.key, KIND[x.kind] || x.kind, "", STS[x.status] || x.status, ""]));
    const blob = new Blob(["﻿" + rows.map((r) => r.map(q).join(",")).join("\n")], { type: "text/csv;charset=utf-8" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "library-review-report.csv"; document.body.appendChild(a); a.click(); a.remove(); };
  const pr = $("#rprint", root); if (pr) pr.onclick = () => { const w = window.open("", "_blank"); if (!w) return toast("اسمح بالنوافذ المنبثقة للطباعة", "err"); w.document.write('<html dir="rtl" lang="ar"><meta charset="utf-8"><body style="font-family:sans-serif;padding:16px">' + $("#rbody", root).innerHTML + "</body></html>"); w.document.close(); w.focus(); w.print(); };
}
})();
