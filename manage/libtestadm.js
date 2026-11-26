/* مركز الاختبار النهائي للمكتبة التعليمية (إدارة). كل الأرقام من نتائج مسجّلة فعليًا في قاعدة البيانات (libt_*)؛ لا قيم افتراضية.
   أنواع الاختبارات: «آلي» يحسبه الخادم من بيانات المكتبة الحية، «اختبار الأداة» نتيجة مستوردة من اختبار تشغيل فعلي (متصفح محاكى/SQL) مع مصدره وتاريخه،
   و«يدوي» يسجّله المدير بعد تجربته بنفسه. ما لم يُجرَّب يبقى «لم يتم الاختبار» ولا يُحسب نجاحًا.
   لا حذف ولا تعديل لأي مورد من هنا. النطاق: من سنة إلى 6 سنوات والصفوف 1–4. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const ADM = { lib: "libadm", acts: "activitiesadm", bank: "bankadm", proj: "projadm", life: "lifeadm", ready: "readyadm", val: "valadm", exp: "expadm", vid: "videoadm", songs: "songadm", stories: "storiesadm", quiz: "quizadm", pack: "packsadm", tax: "libadm" };
const TABS = [["sum", "الملخص"], ["sec", "الأقسام"], ["fn", "الوظائف"], ["adm", "إدارة المحتوى"], ["qc", "الجودة والحماية"], ["sc", "تجربة الطفل"], ["dev", "الأجهزة والمتصفحات"], ["lnk", "الروابط والملفات"], ["iss", "المشكلات"], ["rep", "التقرير والاعتماد"]];
const GRP = { fn: "وظائف المكتبة", adm: "لوحة إدارة المحتوى", qc: "جودة المحتوى", priv: "حماية بيانات الطفل", sc: "سيناريوهات تجربة الطفل", dev: "الأجهزة والمتصفحات", lnk: "الروابط والملفات" };
const GRP_TAB = { fn: ["fn"], adm: ["adm"], qc: ["qc", "priv"], sc: ["sc"], dev: ["dev"], lnk: ["lnk"] };
const ST = { pass: ["نجح", "ok"], fail: ["مشكلة", "bad"], not_tested: ["لم يتم الاختبار", "mut"] };
const KIND = { auto: "فحص آلي", tool: "اختبار الأداة", manual: "يدوي" };
const VERD = { not_run: ["لم يبدأ الاختبار", "mut"], incomplete: ["لم يكتمل الاختبار", "warn"], needs_fix: ["تحتاج إلى معالجة قبل الإطلاق", "bad"], ready_notes: ["جاهزة مع ملاحظات غير حرجة", "warn"], ready: ["جاهزة", "ok"] };
const ISS_ST = { new: "جديدة", doing: "قيد المعالجة", fixed: "تم الإصلاح", retested: "تم إعادة الاختبار", closed: "مغلقة" };
const ISS_C = { new: "bad", doing: "warn", fixed: "warn", retested: "ok", closed: "mut" };
const PR = { critical: "حرجة", high: "مرتفعة", normal: "عادية" };
const AD = (n) => String(n == null ? 0 : n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const fdt = (t) => { try { return t ? new Date(t).toLocaleString("ar-OM", { dateStyle: "medium", timeStyle: "short" }) : "—"; } catch (e) { return t || "—"; } };
const CSS = `.lt *{box-sizing:border-box}.lt{--p:#6b3fd4}.lt-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.lt-tabs .chip.on{background:var(--p);color:#fff}
.lt-cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px;margin:10px 0}.lt-card{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px 12px}.lt-card b{display:block;font-size:24px;color:#4b2aa5;line-height:1.1}.lt-card span{font-size:12px;color:#5f5877}.lt-card.bad b{color:#b3261e}.lt-card.warn b{color:#8a5200}.lt-card.ok b{color:#17683a}
.lt-verd{border-radius:16px;padding:12px 14px;margin:10px 0;border:2px solid #e4d9ff;background:#faf7ff}.lt-verd.bad{border-color:#e8a7a0;background:#fff0ee}.lt-verd.ok{border-color:#9fdcbc;background:#effaf3}.lt-verd.warn{border-color:#f0d58a;background:#fff9e8}.lt-verd h2{margin:0 0 4px;font-size:20px;color:#3a1a85}.lt-verd ul{margin:6px 0 0;padding-inline-start:20px;font-size:13px}
.lt-grid{display:grid;grid-template-columns:1fr;gap:8px}@media(min-width:700px){.lt-grid{grid-template-columns:1fr 1fr}}@media(min-width:1050px){.lt-grid{grid-template-columns:1fr 1fr 1fr}}
.lt-t{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:9px 11px;display:flex;flex-direction:column;gap:5px;min-width:0}.lt-t.bad{border-color:#e8a7a0}.lt-t.ok{border-color:#9fdcbc}.lt-t .h{font-weight:700;overflow-wrap:anywhere}.lt-t .m{font-size:12px;color:#5f5877;overflow-wrap:anywhere}
.lt-bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85;white-space:nowrap;align-self:flex-start}.lt-bd.bad{background:#ffe3e0;color:#9a1d12}.lt-bd.ok{background:#dff6e7;color:#17683a}.lt-bd.warn{background:#fff0d1;color:#8a5200}.lt-bd.mut{background:#eee;color:#555}
.lt-acts{display:flex;gap:6px;flex-wrap:wrap}.lt .chip.pri{background:var(--p);color:#fff}.lt .chip.bad{background:#c62f4a;color:#fff}
.lt h3{margin:14px 0 4px;color:#4b2aa5}.lt .mut{color:#5f5877;font-size:13px}.lt-note{background:#fff7e0;border:1px solid #f0d58a;border-radius:12px;padding:8px 10px;font-size:13px;margin:8px 0}
.lt-f{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.lt-f select,.lt-form select,.lt-form input,.lt-form textarea{border:2px solid #e4d9ff;border-radius:10px;padding:6px;font:inherit;min-height:36px;background:#fff}
.lt-form{background:#faf7ff;border:1px solid #e4d9ff;border-radius:14px;padding:12px;margin:10px 0;display:flex;flex-direction:column;gap:8px}.lt-form label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px}
.lt-modal{position:fixed;inset:0;background:rgba(30,10,70,.45);z-index:9000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:16px}.lt-box{background:#fff;border-radius:18px;max-width:640px;width:100%;padding:14px;margin:auto}
.lt-i{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:9px 11px;margin:6px 0;display:flex;flex-direction:column;gap:5px}.lt-i .r{display:flex;gap:6px;flex-wrap:wrap;align-items:center}.lt-i .t{font-weight:700;flex:1;min-width:160px;overflow-wrap:anywhere}
.lt-rep table{border-collapse:collapse;width:100%;font-size:13px;background:#fff}.lt-rep th,.lt-rep td{border:1px solid #e4d9ff;padding:5px 7px;text-align:right}.lt-rep th{background:#f1eaff;color:#3a1a85}.lt-tw{overflow-x:auto}
@media print{body *{visibility:hidden}.lt-rep,.lt-rep *{visibility:visible}.lt-rep{position:absolute;inset:0;padding:12px}.lt-acts,.chip{display:none!important}}`;
const S = { tab: "sum", sum: null, list: null, issues: [], reps: [], f: { s: "open" }, repView: null, busy: false };
let M = null;
const rpc = async (n, a) => { const r = await sb.rpc(n, a || {}); if (r.error) throw r.error; return r.data; };
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^[A-Z_]+:\s*/, ""), "err");
const act = async (fn) => { if (S.busy) return; S.busy = true; try { return await fn(); } catch (e) { fail(e); } finally { S.busy = false; } };
const back = () => `<button class="chip" id="ltback" onclick="window.__go('libadm')">→ رجوع إلى لوحة إدارة المكتبة</button>`;
const badge = (txt, c) => `<span class="lt-bd ${c || ""}">${esc(txt)}</span>`;

SUB.libtestadm = { title: "مركز الاختبار النهائي للمكتبة", fn: async function (m) {
  M = m; S.tab = "sum"; m.innerHTML = back() + '<p class="mut">جارٍ التحميل…</p>';
  try { await load(); } catch (e) { m.innerHTML = back() + '<p class="mut">ليست لديك صلاحية الدخول إلى مركز الاختبار النهائي (للمحرر أو المراجع أو مدير المكتبة).</p>'; return; }
  paint();
} };
async function load() {
  S.sum = await rpc("libt_summary"); S.list = await rpc("libt_list");
  const i = await sb.from("libt_issues").select("*").order("found_at", { ascending: false }).limit(1000); S.issues = i.data || [];
  const r = await sb.from("libt_reports").select("id,created_at,by_name,title,verdict").order("created_at", { ascending: false }).limit(30); S.reps = r.data || [];
}
function shell(inner) {
  return `<style>${CSS}</style><div class="lt">${back()}
  <p class="mut">اختبار فعلي لجاهزية المكتبة قبل اعتمادها. ما لم يُختبر يظهر «لم يتم الاختبار» ولا يُحسب نجاحًا. لا يحذف هذا المركز أي مورد.</p>
  <div class="lt-tabs" id="lttabs">${TABS.map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div><div id="ltbody">${inner}</div></div>`;
}
function paint() {
  M.innerHTML = shell("");
  $$("#lttabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.repView = null; paint(); }));
  const body = $("#ltbody", M);
  const fn = { sum: vSum, sec: vSec, iss: vIss, rep: vRep }[S.tab] || (() => vGroup(S.tab));
  body.innerHTML = fn();
  const b = { sum: bSum, sec: bSec, iss: bIss, rep: bRep }[S.tab] || bGroup; b(body);
}
const refresh = async () => { await load(); paint(); };
const runAll = () => act(async () => { toast("جارٍ تشغيل الفحوص الآلية…", "ok"); await rpc("libt_run"); await load(); toast("اكتمل الفحص الآلي", "ok"); paint(); });

/* ---------- نافذة ---------- */
function modal(html, onbind) {
  const d = document.createElement("div"); d.className = "lt-modal"; d.innerHTML = `<div class="lt-box">${html}</div>`;
  d.onclick = (e) => { if (e.target === d) d.remove(); }; document.body.appendChild(d);
  $$("[data-x]", d).forEach((b) => (b.onclick = () => d.remove())); if (onbind) onbind(d); return d;
}
function ask(title, fields, okLabel, cb) {
  modal(`<h3 style="margin-top:0">${esc(title)}</h3><div class="lt-form">${fields.map((f) => f.type === "select" ? `<label>${esc(f.label)}<select data-f="${f.k}">${f.opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join("")}</select></label>` : `<label>${esc(f.label)}<textarea data-f="${f.k}" rows="3" placeholder="${esc(f.ph || "")}"></textarea></label>`).join("")}</div>
  <div class="lt-acts"><button class="chip pri" data-ok>${esc(okLabel)}</button><button class="chip" data-x>إلغاء</button></div>`, (d) => {
    $("[data-ok]", d).onclick = () => { const v = {}; $$("[data-f]", d).forEach((e) => (v[e.dataset.f] = e.value.trim())); act(async () => { await cb(v); d.remove(); }); };
  });
}

/* ---------- الملخص ---------- */
function vSum() {
  const s = S.sum, v = s.verdict, [vl, vc] = VERD[v.verdict] || ["—", "mut"], c = (n, t, cls) => `<div class="lt-card ${cls || ""}"><b>${AD(n)}</b><span>${t}</span></div>`;
  const ap = s.approval && v.verdict !== "needs_fix" && v.verdict !== "incomplete" && v.verdict !== "not_run" ? s.approval : null;
  const secNot = s.sections_total - s.sections_tested;
  return `<div class="lt-verd ${vc}"><h2>حالة الجاهزية النهائية: ${esc(vl)}</h2>
  ${v.verdict === "not_run" ? '<p class="mut">لم يُشغَّل أي فحص بعد؛ اضغط «تشغيل الفحوص الآلية».</p>' : ""}
  ${(v.reasons || []).length ? `<ul>${v.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}
  ${ap ? `<p class="mut">اعتُمدت بتاريخ ${fdt(ap.at)} بواسطة ${esc(ap.by_name || "")}.</p>` : '<p class="mut">لا يوجد اعتماد نهائي ساري.</p>'}</div>
  <div class="lt-cards">${c(s.sections_tested, "أقسام تم اختبارها (من " + AD(s.sections_total) + ")")}${c(secNot, "أقسام لم يكتمل اختبارها", secNot ? "warn" : "")}${c(s.tests_pass, "اختبارات ناجحة", "ok")}${c(s.tests_fail, "اختبارات تحتاج إلى معالجة", s.tests_fail ? "bad" : "")}${c(s.tests_not, "اختبارات لم تُجرَ", s.tests_not ? "warn" : "")}${c(s.issues_open, "مشكلات مفتوحة", s.issues_open ? "bad" : "")}${c(s.issues_fixed, "مشكلات تم إصلاحها")}${c(s.issues_closed, "مشكلات مغلقة بعد إعادة الاختبار")}</div>
  ${s.last_run ? `<p class="mut">آخر تشغيل للفحص الآلي: ${fdt(s.last_run.at)} — ${esc(s.last_run.by_name || "")}</p>` : ""}
  <div class="lt-acts"><button class="chip pri" id="ltrun">تشغيل الفحوص الآلية</button><button class="chip" data-go="rep">التقرير والاعتماد</button><button class="chip" data-go="iss">سجل المشكلات</button></div>
  <p class="mut">«المشكلات الحرجة» هي ما يمنع الاستخدام أو يمس سلامة الطفل أو يخرج عن نطاق سنة–الصف الرابع. لا تُعرض المكتبة «جاهزة» وهي موجودة.</p>`;
}
function bSum(root) { $("#ltrun", root).onclick = runAll; $$("[data-go]", root).forEach((b) => (b.onclick = () => { S.tab = b.dataset.go; paint(); })); }

/* ---------- بطاقة اختبار ---------- */
function card(t) {
  const [l, c] = ST[t.status] || ST.not_tested;
  return `<div class="lt-t ${c}" data-code="${esc(t.code)}"><div class="h">${esc(t.label)}</div><div class="r">${badge(l, c)} ${t.critical ? badge("حرج", "warn") : ""} ${t.kind ? badge(KIND[t.kind] || t.kind, "") : ""}</div>
  <div class="m">${esc(t.detail || (t.status === "not_tested" ? (t.hint || "لم يُجرَّب بعد") : ""))}</div>
  <div class="m">${t.run_at ? "آخر اختبار: " + fdt(t.run_at) + (t.run_by ? " — " + esc(t.run_by) : "") : ""}</div>
  ${t.kind === "manual" ? `<div class="lt-acts"><button class="chip" data-rec="pass">سجّلت: نجح</button><button class="chip bad" data-rec="fail">سجّلت: مشكلة</button>${t.status !== "not_tested" ? '<button class="chip" data-rec="not_tested">إلغاء النتيجة</button>' : ""}</div>` : ""}
  ${t.kind === "tool" && t.status === "not_tested" ? '<div class="m">تأتي نتيجته من اختبار تشغيل فعلي للأداة.</div>' : ""}</div>`;
}
function bCards(root) {
  $$("[data-rec]", root).forEach((b) => (b.onclick = () => {
    const code = b.closest("[data-code]").dataset.code, st = b.dataset.rec, t = (S.list.results || []).find((x) => x.code === code);
    if (st === "not_tested") return act(async () => { await rpc("libt_record", { p_code: code, p_status: st, p_detail: "" }); await refresh(); });
    ask((st === "pass" ? "تسجيل نجاح: " : "تسجيل مشكلة: ") + t.label, [{ k: "d", label: "ماذا جرّبت وكيف؟ (يُحفظ مع النتيجة)", ph: t.hint || "" }], "حفظ النتيجة", async (v) => { await rpc("libt_record", { p_code: code, p_status: st, p_detail: v.d }); toast("سُجّلت النتيجة", "ok"); await refresh(); });
  }));
}
function vGroup(tab) {
  const gs = GRP_TAB[tab] || [tab], rows = (S.list.results || []).filter((r) => gs.includes(r.grp));
  const pass = rows.filter((r) => r.status === "pass").length, fl = rows.filter((r) => r.status === "fail").length, nt = rows.filter((r) => r.status === "not_tested").length;
  const notes = { fn: "تُختبر الوظائف الموجودة فعليًا فقط؛ زر بلا تنفيذ لا يُحسب نجاحًا. النتائج مستوردة من اختبارات تشغيل فعلية بمتصفح محاكى.", adm: "اختبارات الإدارة تُنفَّذ على قاعدة البيانات بهوية مدير داخل معاملة تُلغى (لا تُنشأ بيانات حقيقية).", sc: "السيناريوهات الخمسة: اختبارات الأداة تحاكي خطوات الطفل؛ التجربة الحقيقية مع طفل أو ولي أمر تُسجَّل يدويًا.", dev: "الفحص بمتصفح Chromium محاكى بثلاثة مقاسات. المتصفحات الأخرى والأجهزة الفعلية والسرعة الحقيقية تُسجَّل يدويًا ولا تُحسب ناجحة قبل ذلك.", lnk: "الروابط الداخلية بفحص ثابت لملفات الموقع. الطباعة والتنزيل الفعليان على الأجهزة يُسجَّلان يدويًا.", qc: "عينة الجودة تأتي من قوائم مركز مراجعة المكتبة (تسعة بنود لكل مورد). مراجعة اللغة والمعلومات بشرية." }[tab] || "";
  return `<div class="lt-cards"><div class="lt-card ok"><b>${AD(pass)}</b><span>نجح</span></div><div class="lt-card ${fl ? "bad" : ""}"><b>${AD(fl)}</b><span>مشكلة</span></div><div class="lt-card ${nt ? "warn" : ""}"><b>${AD(nt)}</b><span>لم يتم الاختبار</span></div></div>
  <div class="lt-note">${esc(notes)}</div>
  ${tab === "qc" ? '<div class="lt-acts"><button class="chip" id="ltrvw">فتح مركز مراجعة المكتبة (الجودة)</button></div>' : ""}
  <div class="lt-grid">${rows.map(card).join("") || '<p class="mut">لا اختبارات في هذا القسم.</p>'}</div>
  <div class="lt-acts" style="margin-top:10px"><button class="chip pri" id="ltrun2">إعادة تشغيل الفحوص الآلية</button></div>`;
}
function bGroup(root) { bCards(root); const r = $("#ltrun2", root); if (r) r.onclick = runAll; const q = $("#ltrvw", root); if (q) q.onclick = () => window.__go("libreviewadm"); }

/* ---------- الأقسام ---------- */
function vSec() {
  const secs = S.list.sections || [];
  return `<div class="lt-note">لكل قسم أربعة اختبارات آلية على بياناته الحية: فتح القسم وعرض المحتوى، التصنيف، النطاق العمري، الملفات. اختبارات «البحث داخل القسم» و«فتح المورد» و«العودة» و«توافق الأجهزة» عامة لكل المكتبة وتجدها في تبويبات الوظائف والأجهزة. «تشغيل الفحص» يعيد حساب كل الأقسام.</div>
  <div class="lt-grid">${secs.map((s) => {
    const nt = s.tests.filter((t) => t.status === "not_tested").length, fl = s.tests.filter((t) => t.status === "fail").length, c = fl ? "bad" : nt ? "warn" : s.tests.length ? "ok" : "mut";
    return `<div class="lt-t ${c === "bad" ? "bad" : c === "ok" ? "ok" : ""}"><div class="h">${esc(s.label)}</div><div class="r">${badge(fl ? fl + " مشكلة" : nt ? "لم يكتمل الاختبار" : s.tests.length ? "تم اختباره" : "لم يتم الاختبار", c)}</div>
    <div class="m">${AD(s.pub)} منشور من ${AD(s.total)}</div>
    ${s.tests.map((t) => `<div class="m">${t.status === "pass" ? "✔" : t.status === "fail" ? "✖" : "◌"} ${esc(t.label.replace(/^«[^»]*»: /, ""))}${t.critical ? " (حرج)" : ""} — ${esc(t.detail || "لم يُجرَّب")}</div>`).join("") || '<div class="m">لم تُشغَّل الفحوص بعد</div>'}
    <div class="lt-acts"><button class="chip" data-opn="${esc(s.id)}">فتح القسم في لوحة الإدارة</button></div></div>`;
  }).join("")}</div><div class="lt-acts" style="margin-top:10px"><button class="chip pri" id="ltrun2">تشغيل الفحص</button></div>`;
}
function bSec(root) {
  $("#ltrun2", root).onclick = runAll;
  $$("[data-opn]", root).forEach((b) => (b.onclick = () => { const id = b.dataset.opn; const src = id.startsWith("lib:") ? "lib" : id; window.__go(ADM[src] || "libadm"); }));
}

/* ---------- المشكلات ---------- */
function vIss() {
  const f = S.f.s, rows = S.issues.filter((i) => f === "all" ? true : f === "open" ? i.status !== "closed" : i.status === f);
  return `<div class="lt-f"><select id="ltf">${[["open", "المفتوحة (غير المغلقة)"], ["all", "الكل"]].concat(Object.entries(ISS_ST)).map(([k, l]) => `<option value="${k}" ${f === k ? "selected" : ""}>${l}</option>`).join("")}</select><button class="chip" id="ltadd">+ تسجيل مشكلة يدويًا</button></div>
  <div class="lt-note">لا تُغلق المشكلة بمجرد تعديلها: بعد «تم الإصلاح» يجب «إعادة الاختبار»، وبعد نجاحه فقط يمكن «الإغلاق». فشل إعادة الاختبار يعيدها إلى «قيد المعالجة».</div>
  ${rows.map((i) => `<div class="lt-i" data-id="${i.id}"><div class="r"><span class="t">${esc(i.item || i.section || "—")}</span>${badge(ISS_ST[i.status], ISS_C[i.status])}${badge(PR[i.priority] || i.priority, i.priority === "critical" ? "bad" : i.priority === "high" ? "warn" : "")}</div>
  <div class="m mut">القسم: ${esc(i.section || "—")} · النوع: ${esc(i.auto ? "فحص آلي" : i.kind || "—")} · اكتُشفت: ${fdt(i.found_at)} · المسؤول: ${esc(i.assignee || "غير معيّن")}</div>
  <div>${esc(i.detail)}</div>${i.note ? `<div class="m mut">ملاحظة: ${esc(i.note)}</div>` : ""}${i.retest ? `<div class="m mut">آخر إعادة اختبار: ${i.retest === "pass" ? "نجحت" : "فشلت"}</div>` : ""}
  <div class="lt-acts"><button class="chip" data-op>فتح المشكلة</button>${i.status === "fixed" ? '<button class="chip pri" data-rt>إعادة الاختبار</button>' : ""}${i.status === "retested" ? '<button class="chip pri" data-cl>إغلاق</button>' : ""}</div></div>`).join("") || '<p class="mut">لا مشكلات بهذه الحالة.</p>'}`;
}
function bIss(root) {
  $("#ltf", root).onchange = (e) => { S.f.s = e.target.value; paint(); };
  $("#ltadd", root).onclick = () => modal(`<h3 style="margin-top:0">تسجيل مشكلة</h3><div class="lt-form"><label>القسم<input data-f="section"></label><label>المورد أو الوظيفة<input data-f="item"></label><label>وصف المشكلة<textarea data-f="detail" rows="3"></textarea></label><label>الأولوية<select data-f="priority"><option value="normal">عادية</option><option value="high">مرتفعة</option><option value="critical">حرجة</option></select></label><label>المسؤول (اختياري)<input data-f="assignee"></label></div><div class="lt-acts"><button class="chip pri" data-ok>حفظ</button><button class="chip" data-x>إلغاء</button></div>`, (d) => {
    $("[data-ok]", d).onclick = () => { const v = {}; $$("[data-f]", d).forEach((e) => (v[e.dataset.f] = e.value.trim())); act(async () => { await rpc("libt_issue_add", { p_section: v.section, p_item: v.item, p_kind: "manual", p_detail: v.detail, p_priority: v.priority, p_assignee: v.assignee || null }); d.remove(); toast("سُجّلت المشكلة", "ok"); await refresh(); }); };
  });
  $$(".lt-i", root).forEach((el) => {
    const id = el.dataset.id, i = S.issues.find((x) => x.id === id);
    $("[data-op]", el).onclick = () => modal(`<h3 style="margin-top:0">${esc(i.item || "مشكلة")}</h3><p class="mut">${esc(i.detail)}</p><div class="lt-form"><label>الحالة<select data-f="status"><option value="">(بلا تغيير)</option><option value="new">جديدة</option><option value="doing">قيد المعالجة</option><option value="fixed">تم الإصلاح</option></select></label><label>المسؤول<input data-f="assignee" value="${esc(i.assignee || "")}"></label><label>ملاحظة<textarea data-f="note" rows="2">${esc(i.note || "")}</textarea></label></div><p class="mut">«تم إعادة الاختبار» و«مغلقة» تأتيان من زر إعادة الاختبار ثم الإغلاق فقط.</p><div class="lt-acts"><button class="chip pri" data-ok>حفظ</button><button class="chip" data-x>إغلاق النافذة</button></div>`, (d) => {
      $("[data-ok]", d).onclick = () => { const g = (k) => $(`[data-f="${k}"]`, d).value; act(async () => { await rpc("libt_issue_set", { p_id: id, p_status: g("status") || null, p_assignee: g("assignee"), p_note: g("note") }); d.remove(); await refresh(); }); };
    });
    const rt = $("[data-rt]", el); if (rt) rt.onclick = () => {
      if (i.auto) return act(async () => { const r = await rpc("libt_retest", { p_id: id }); toast(r.retest === "pass" ? "نجحت إعادة الاختبار" : "فشلت إعادة الاختبار: ما زالت المشكلة قائمة", r.retest === "pass" ? "ok" : "err"); await refresh(); });
      ask("إعادة اختبار: " + (i.item || ""), [{ k: "r", type: "select", label: "النتيجة", opts: [["pass", "نجح"], ["fail", "فشل"]] }, { k: "n", label: "كيف أعدت الاختبار؟" }], "حفظ", async (v) => { await rpc("libt_retest", { p_id: id, p_result: v.r, p_note: v.n }); await refresh(); });
    };
    const cl = $("[data-cl]", el); if (cl) cl.onclick = () => act(async () => { await rpc("libt_issue_close", { p_id: id }); toast("أُغلقت المشكلة بعد نجاح إعادة الاختبار", "ok"); await refresh(); });
  });
}

/* ---------- التقرير والاعتماد ---------- */
function vRep() {
  const v = S.sum.verdict, [vl] = VERD[v.verdict] || ["—"], ap = S.sum.approval;
  const okAp = ap && (v.verdict === "ready" || v.verdict === "ready_notes");
  if (S.repView) return reportHtml(S.repView);
  return `<div class="lt-verd ${(VERD[v.verdict] || [])[1] || ""}"><h2>التوصية الحالية: ${esc(vl)}</h2>${(v.reasons || []).length ? `<ul>${v.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}</div>
  <h3>الاعتماد النهائي</h3><p class="mut">لا يُعتمد إلا عند «جاهزة» أو «جاهزة مع ملاحظات غير حرجة»، ويتم بصلاحية المراجع التربوي أو مدير المكتبة. إن عادت الحالة إلى «تحتاج إلى معالجة» يبطل الاعتماد تلقائيًا.</p>
  ${okAp ? `<p>معتمدة منذ ${fdt(ap.at)} بواسطة ${esc(ap.by_name || "")} (${esc((VERD[ap.verdict] || [""])[0])}).</p>` : ap ? '<p class="mut">اعتماد سابق أُبطل لأن الحالة تغيّرت.</p>' : ""}
  <div class="lt-acts"><button class="chip pri" id="ltap">اعتماد المكتبة</button>${ap && !ap.revoked_at ? '<button class="chip bad" id="ltunap">سحب الاعتماد</button>' : ""}<button class="chip pri" id="ltmk">إنشاء تقرير الجاهزية النهائية</button></div>
  <h3>التقارير السابقة</h3>${S.reps.map((r) => `<div class="lt-i"><div class="r"><span class="t">${esc(r.title)}</span>${badge((VERD[r.verdict] || [r.verdict])[0], (VERD[r.verdict] || [])[1])}</div><div class="m mut">${fdt(r.created_at)} — ${esc(r.by_name || "")}</div><div class="lt-acts"><button class="chip" data-vr="${r.id}">عرض</button></div></div>`).join("") || '<p class="mut">لا تقارير بعد.</p>'}`;
}
function reportHtml(d) {
  const [vl, vc] = VERD[d.verdict.verdict] || ["—", "mut"], res = d.results || [], secs = d.sections || [];
  const by = (g) => res.filter((r) => r.grp === g || (g === "qc" && r.grp === "priv"));
  const cnt = (rows) => `${AD(rows.filter((r) => r.status === "pass").length)} نجح · ${AD(rows.filter((r) => r.status === "fail").length)} مشكلة · ${AD(rows.filter((r) => r.status === "not_tested").length)} لم يُختبر`;
  const un = res.filter((r) => r.grp === "lnk" && r.status === "not_tested");
  const t = (rows) => `<div class="lt-tw"><table><tr><th>الاختبار</th><th>الحالة</th><th>التفصيل</th></tr>${rows.map((r) => `<tr><td>${esc(r.label)}${r.critical ? " (حرج)" : ""}</td><td>${(ST[r.status] || [""])[0]}</td><td>${esc(r.detail || "—")}</td></tr>`).join("")}</table></div>`;
  return `<div class="lt-rep"><div class="lt-acts"><button class="chip" id="ltbk">→ رجوع</button><button class="chip" id="ltpr">طباعة التقرير</button></div>
  <h2>تقرير الجاهزية النهائية للمكتبة التعليمية</h2><p class="mut">أُنشئ ${fdt(d.created_at)} — ${esc(d.by || "")}. النطاق: من سنة إلى 6 سنوات والصفوف 1–4.</p>
  <div class="lt-verd ${vc}"><h2>التوصية: ${esc(vl)}</h2>${(d.verdict.reasons || []).length ? `<ul>${d.verdict.reasons.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}</div>
  <h3>الأقسام التي تم اختبارها</h3><p>${AD(d.summary.sections_tested)} من ${AD(d.summary.sections_total)} قسمًا اكتمل اختبارها.</p><div class="lt-tw"><table><tr><th>القسم</th><th>منشور</th><th>نتائج اختباراته</th></tr>${secs.map((s) => `<tr><td>${esc(s.label)}</td><td>${AD(s.pub)} / ${AD(s.total)}</td><td>${s.tests.map((x) => (x.status === "pass" ? "✔" : x.status === "fail" ? "✖" : "◌")).join(" ")} ${esc(s.tests.filter((x) => x.status === "fail").map((x) => x.detail).join("؛ "))}</td></tr>`).join("")}</table></div>
  <h3>الوظائف التي تم اختبارها (${cnt(by("fn"))})</h3>${t(by("fn"))}
  <h3>لوحة إدارة المحتوى (${cnt(by("adm"))})</h3>${t(by("adm"))}
  <h3>جودة المحتوى وحماية بيانات الطفل (${cnt(by("qc"))})</h3>${t(by("qc"))}
  <h3>تجربة الطفل (${cnt(by("sc"))})</h3>${t(by("sc"))}
  <h3>توافق الأجهزة والمتصفحات (${cnt(by("dev"))})</h3>${t(by("dev"))}
  <h3>الروابط والملفات (${cnt(by("lnk"))})</h3>${t(by("lnk"))}${un.length ? `<p class="mut">لم يتم اختبار: ${un.map((r) => esc(r.label)).join("، ")}</p>` : ""}
  <h3>المشكلات التي تم إصلاحها</h3>${(d.issues_fixed || []).length ? `<ul>${d.issues_fixed.map((i) => `<li>${esc(i.item)} — ${esc(ISS_ST[i.status] || i.status)}${i.retest ? " (إعادة الاختبار: " + (i.retest === "pass" ? "نجحت" : "فشلت") + ")" : ""}</li>`).join("")}</ul>` : '<p class="mut">لا مشكلات مُصلَحة بعد.</p>'}
  <h3>المشكلات المتبقية</h3>${(d.issues_remaining || []).length ? `<ul>${d.issues_remaining.map((i) => `<li>[${esc(PR[i.priority] || i.priority)}] ${esc(i.item)} (${esc(i.section || "")}): ${esc(i.detail)}</li>`).join("")}</ul>` : '<p class="mut">لا مشكلات متبقية في السجل.</p>'}
  <p class="mut">مشكلات عاجلة مفتوحة في مركز المراجعة: ${AD(d.review_urgent)} · مرتفعة: ${AD(d.review_high)}.</p></div>`;
}
function bRep(root) {
  if (S.repView) { $("#ltbk", root).onclick = () => { S.repView = null; paint(); }; $("#ltpr", root).onclick = () => window.print(); return; }
  $("#ltmk", root).onclick = () => act(async () => { const r = await rpc("libt_report_create"); S.repView = r.data; await load(); toast("أُنشئ التقرير وحُفظ في السجل", "ok"); paint(); });
  $("#ltap", root).onclick = () => ask("اعتماد المكتبة", [{ k: "n", label: "ملاحظة الاعتماد (اختياري)" }], "اعتماد", async (v) => { await rpc("libt_approve", { p_note: v.n }); toast("تم الاعتماد", "ok"); await refresh(); });
  const u = $("#ltunap", root); if (u) u.onclick = () => act(async () => { await rpc("libt_unapprove", {}); await refresh(); });
  $$("[data-vr]", root).forEach((b) => (b.onclick = () => act(async () => { const r = await sb.from("libt_reports").select("data").eq("id", b.dataset.vr).single(); if (r.error) throw r.error; S.repView = r.data.data; paint(); })));
}
})();
