/* مركز تحديث المحتوى وإدارة النسخ — لا يُعدَّل المورد المنشور مباشرة: تُنشأ نسخة عمل، تُراجَع، وتُنشر بعد الاعتماد.
   القواعد (الترقيم، نسخة نشطة واحدة، الصلاحيات، شروط الاعتماد والنشر، الاستعادة، السجل) مفروضة في قاعدة البيانات لا في هذه الواجهة.
   المقارنة المعروضة حقلًا بحقل (قبل/بعد) وليست مقارنة ذكية للملفات. النطاق: من سنة إلى 6 سنوات والصفوف 1–4. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const TYPE = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع أو تحدٍّ", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف وتجارب", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", pack: "حزمة تعليمية" };
const ADM = { lib: "libadm", acts: "activitiesadm", bank: "bankadm", proj: "projadm", life: "lifeadm", ready: "readyadm", val: "valadm", exp: "expadm", vid: "videoadm", songs: "songadm", stories: "storiesadm", quiz: "quizadm", pack: "packsadm" };
const PUB = { acts: "activities/view/?a=", bank: "bank/play/?s=", proj: "projects/play/?s=", life: "life/play/?s=", ready: "ready/play/?s=", val: "values/play/?s=", exp: "explore/play/?s=", vid: "videos/play/?s=", songs: "songs/play/?s=", stories: "stories/read/?s=", quiz: "quizzes/quiz/?q=", pack: "packs/view/?p=" };
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SCOPE = Object.keys(LV);
const ST = { working: "قيد التعديل", in_review: "تنتظر المراجعة", needs_changes: "تحتاج إلى تعديل", approved: "معتمدة وتنتظر النشر", published: "منشورة (الحالية)", superseded: "سابقة", cancelled: "أُوقف التحديث" };
const STC = { working: "#6b3fd4", in_review: "#2d7fd0", needs_changes: "#d9822b", approved: "#1f9a63", published: "#2e7d32", superseded: "#888", cancelled: "#999" };
const KIND = { base: "نسخة أساسية", update: "تحديث", restore: "استعادة", hotfix: "تصحيح عاجل" };
const CT = { fix_info: "تصحيح معلومة", fix_answer: "تعديل إجابة", improve_instructions: "تحسين التعليمات", update_design: "تحديث التصميم", add_activity: "إضافة نشاط", remove_part: "حذف جزء غير مناسب", fix_file_link: "إصلاح ملف أو رابط", device_compat: "تحسين التوافق مع الأجهزة", restore: "استعادة نسخة سابقة" };
const ASP = [["accuracy", "صحة المعلومات التعليمية"], ["age", "مناسبة العمر أو الصف"], ["instructions", "وضوح التعليمات"], ["design", "جودة التصميم"], ["files", "سلامة الملفات"], ["links", "صحة الروابط"], ["rights", "حقوق الاستخدام"], ["goals", "توافق المورد مع أهدافه التعليمية"]];
const RES = { approved: "اعتُمدت", needs_changes: "طُلب تعديل" };
const EVT = { created: "أُنشئت النسخة", saved: "حُفظت تعديلات", submitted: "أُرسلت للمراجعة", review_saved: "حُفظ تقييم المراجعة", changes_requested: "طُلب تعديل", approved: "اعتُمدت", reopened: "أُعيدت إلى العمل", published: "نُشرت", restored: "استعادة نسخة سابقة", cancelled: "أُوقف التحديث", deleted: "حُذفت نسخة غير منشورة", suspended: "أُوقف المورد مؤقتًا", enforce_on: "فُعّلت حماية المنشور", enforce_off: "أُوقفت حماية المنشور" };
const LBL = { title: "العنوان", name: "الاسم", icon: "الأيقونة", goal: "الهدف", summary: "الملخص", descr: "الوصف", description: "الوصف", name_en: "الاسم بالإنجليزية", description_en: "الوصف بالإنجليزية", instr: "التعليمات", steps: "الخطوات", parent_role: "دور ولي الأمر", completion: "معيار الإكمال", tools: "الأدوات", minutes: "المدة (دقيقة)", difficulty: "الصعوبة", image_url: "رابط الصورة", pdf_url: "رابط ملف PDF", bw_url: "رابط النسخة بالأبيض والأسود", preview_url: "رابط المعاينة", interactive_url: "رابط النسخة التفاعلية", pages: "عدد الصفحات", data: "المحتوى", href: "الرابط", scenes: "المشاهد", video_url: "رابط الفيديو", poster_url: "رابط الصورة المصغرة", source: "المصدر", license: "الترخيص", duration_s: "المدة (ثانية)", quiz: "الأسئلة", lyrics: "الكلمات", audio_url: "رابط الصوت", cover_url: "رابط الغلاف", activities_pdf_url: "رابط ملف الأنشطة", questions: "الأسئلة", tags: "الوسوم", cover: "الغلاف", est_min: "المدة التقديرية", file_url: "رابط الملف", file_type: "نوع الملف", thumb_url: "رابط الصورة المصغرة", lib_difficulty: "مستوى الصعوبة", lib_keywords: "الكلمات المفتاحية", lib_unit: "الوحدة" };
const LINES = ["tools", "tags", "lyrics", "lib_keywords"];
const PAGE = 30;
const PEND = ["working", "in_review", "needs_changes", "approved", "cancelled"];
const S = { tab: "pending", me: { roles: [] }, enforce: true, pend: [], res: [], tt: {}, f: { q: "", type: "", lv: "", owner: "", st: "", from: "", to: "" }, rf: { q: "", type: "", lv: "" }, page: 0, key: null };
let M = null, D = null;
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const fmt = (d) => { try { return d ? new Date(d).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }) : "—"; } catch (e) { return "—"; } };
const day = (d) => { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const clean = (e) => String((e && e.message) || e || "").replace(/^(QUALITY_PERM|QUALITY_GATE|VERSION_REQUIRED|VER_CONFIRM|SRC_CONFIRM):\s*/, "");
const fail = (e) => { console.error(e); toast(clean(e) || "تعذّر تنفيذ الطلب. حاول مرة ثانية"); };
const has = (...r) => S.me.roles.includes("library_manager") || r.some((x) => S.me.roles.includes(x));
const isMgr = () => S.me.roles.includes("library_manager");
const lab = (v) => v.major + "." + v.minor;
const badge = (s) => `<span class="vc-b" style="background:${STC[s] || "#888"}">${ST[s] || esc(s)}</span>`;
const inScope = (lv) => (lv || []).some((l) => SCOPE.includes(l));
const CSS = `.vc *{box-sizing:border-box}.vc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.vc-tabs .chip.on{background:#6b3fd4;color:#fff}.vc-b{color:#fff;border-radius:99px;padding:2px 10px;font-size:12px;white-space:nowrap}.vc-b.urg{background:#c62f4a}
.vc-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border:1px solid #e3dcf6;border-radius:12px;padding:10px;margin:6px 0;background:#fff;cursor:pointer}.vc-row .t{flex:1 1 220px;min-width:0;font-weight:600}.vc-row .m{font-size:12px;color:#666;font-weight:400}
.vc-box{border:1px solid #e3dcf6;border-radius:14px;padding:12px;background:#fff;margin:10px 0}.vc-cur{border:2px solid #6b3fd4;background:#f6f1ff}.vc-filters{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:8px 0}
.vc input,.vc select,.vc textarea{font:inherit;border:1px solid #cfc4ee;border-radius:10px;padding:8px;background:#fff;max-width:100%;width:100%}.vc input[type=checkbox],.vc input[type=radio]{width:auto}.vc textarea{min-height:70px}.vc textarea.big{min-height:120px;font-family:inherit}.vc textarea.json{direction:ltr;text-align:left;font-family:monospace;font-size:13px}
.vc-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.vc-acts .chip.pri{background:#6b3fd4;color:#fff}.vc-acts .chip.bad{background:#c62f4a;color:#fff}.vc-acts .chip:disabled{opacity:.5}
.vc-warn{background:#ffeef0;border:1px solid #f1b3bb;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}.vc-ok{background:#e9f8f0;border:1px solid #a9dcc3;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}.vc-info{background:#f3efff;border:1px solid #d9ccf7;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}
.vc-tl{border-inline-start:3px solid #d9ccf7;padding:2px 10px;margin:10px 0}.vc-tl small,.vc-tl .m{color:#666;display:block;font-size:13px}.vc-chk{display:flex;gap:6px;flex-wrap:wrap}.vc-chk label{display:flex;gap:4px;align-items:center;border:1px solid #d9ccf7;border-radius:99px;padding:3px 10px;font-size:13px;background:#fff}
.vc-fld{margin:10px 0}.vc-fld>b{display:block;margin-bottom:4px;font-size:14px}.vc-cmp{display:grid;gap:8px;grid-template-columns:1fr}@media(min-width:700px){.vc-cmp{grid-template-columns:1fr 1fr}}.vc-cmp div{white-space:pre-wrap;border-radius:10px;padding:8px;font-size:13px;word-break:break-word}.vc-cmp .o{background:#fbeef0}.vc-cmp .n{background:#e9f8f0}.vc-asp{display:grid;gap:4px;border-bottom:1px solid #eee;padding:8px 0}.vc-asp .r{display:flex;gap:12px;flex-wrap:wrap}.vc-asp .r label{display:flex;gap:4px;align-items:center}`;

async function loadMe() { const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data; return S.me.roles.length > 0; }
async function loadCfg() { const c = await sb.from("ver_cfg").select("*").eq("id", 1); const r = (c.data || [])[0]; S.enforce = r ? r.enforce !== false : true; }
async function loadPend() {
  const v = await sb.from("ver_versions").select("id,item_key,src,slug,major,minor,kind,status,summary,change_types,urgent,created_by_name,created_at,updated_at,review_result").in("status", PEND).order("created_at", { ascending: false }).limit(1000);
  if (v.error) toast("تعذّر تحميل التحديثات"); S.pend = v.data || [];
  const keys = [...new Set(S.pend.map((x) => x.item_key))];
  S.tt = {}; if (keys.length) { const q = await sb.from("quality_items").select("key,title,levels,status").in("key", keys.slice(0, 300)); (q.data || []).forEach((x) => (S.tt[x.key] = x)); }
}
async function loadRes() {
  const q = await sb.from("quality_items").select("key,src,slug,title,levels,status,gone").in("status", ["published", "suspended"]).limit(3000);
  S.res = (q.data || []).filter((x) => !x.gone && inScope(x.levels));
}
SUB.versionsadm = { title: "مركز تحديث المحتوى", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const ok = await loadMe();
  if (!ok) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى مركز تحديث المحتوى.</p>'; return; }
  await loadCfg();
  if (window.__verOpen) { S.key = window.__verOpen; window.__verOpen = null; }
  if (S.key) return detail(m, S.key);
  paint(m);
} };
function shell(inner) {
  return `<style>${CSS}</style><div class="vc"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <p class="mut">لا يُعدَّل المورد المنشور مباشرة: تُنشأ نسخة عمل مستقلة، تُراجَع، وتحل محل المنشور بعد الاعتماد والنشر فقط. النسخ السابقة محفوظة ولا تُحذف. النطاق: من سنة إلى 6 سنوات والصفوف 1–4.</p>
  <div class="${S.enforce ? "vc-ok" : "vc-warn"}">${S.enforce ? "حماية المنشور مفعّلة: يرفض النظام أي تعديل مباشر على محتوى مورد منشور من لوحة الإدارة." : "حماية المنشور متوقفة: يمكن تعديل الموارد المنشورة مباشرة (يظل التعديل يطلب إعادة تقييم)."}${isMgr() ? ` <button class="chip" id="vcenf">${S.enforce ? "إيقاف الحماية" : "تفعيل الحماية"}</button>` : ""}</div>
  <div class="vc-tabs" id="vctabs">${[["pending", "التحديثات المعلقة"], ["res", "الموارد المنشورة"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`;
}
async function paint(m) {
  m = m || M; S.key = null; D = null;
  m.innerHTML = '<p class="mut">جارٍ التحميل…</p>';
  if (S.tab === "pending") await loadPend(); else await loadRes();
  m.innerHTML = shell(S.tab === "pending" ? pendHtml() : resHtml());
  $$("#vctabs [data-t]", m).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.page = 0; paint(m); }));
  bindEnf(m);
  if (S.tab === "pending") bindPend(m); else bindRes(m);
}
function bindEnf(m) {
  const en = $("#vcenf", m); if (en) en.onclick = async () => { const nx = !S.enforce; if (!(await Z.ask(nx ? "تفعيل حماية المنشور؟" : "إيقاف حماية المنشور يسمح بتعديل الموارد المنشورة مباشرة دون نسخة ومراجعة. هل تريد المتابعة؟", nx ? "نعم، فعّل" : "نعم، أوقف"))) return; const x = await sb.rpc("ver_enforce_set", { p_on: nx }); if (x.error) return fail(x.error); S.enforce = nx; toast(nx ? "فُعّلت الحماية" : "أُوقفت الحماية"); paint(m); };
}
/* ---------- التحديثات المعلقة ---------- */
const optsOf = (obj, cur, all) => `<option value="">${all}</option>` + Object.entries(obj).map(([k, l]) => `<option value="${k}" ${cur === k ? "selected" : ""}>${l}</option>`).join("");
function pendFiltered() {
  const f = S.f, q = f.q.trim().toLowerCase();
  return S.pend.filter((v) => { const it = S.tt[v.item_key] || {}; return (!q || (it.title || "").toLowerCase().includes(q) || v.item_key.toLowerCase().includes(q)) && (!f.type || v.src === f.type) && (!f.lv || (it.levels || []).includes(f.lv)) && (!f.owner || (v.created_by_name || "").toLowerCase().includes(f.owner.trim().toLowerCase())) && (!f.st || v.status === f.st) && (!f.from || day(v.created_at) >= f.from) && (!f.to || day(v.created_at) <= f.to); })
    .sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0) || String(b.created_at).localeCompare(String(a.created_at)));
}
function pendHtml() {
  const f = S.f, rows = pendFiltered(), pages = Math.max(1, Math.ceil(rows.length / PAGE)); if (S.page >= pages) S.page = pages - 1;
  const stOpts = Object.fromEntries(PEND.map((k) => [k, ST[k]]));
  return `<div class="vc-filters"><input id="fq" type="search" placeholder="اسم المورد" value="${esc(f.q)}" aria-label="اسم المورد"><select id="ft" aria-label="نوع المحتوى">${optsOf(TYPE, f.type, "كل الأنواع")}</select><select id="fl" aria-label="العمر أو الصف">${optsOf(LV, f.lv, "كل الأعمار والصفوف")}</select><input id="fo" type="search" placeholder="المسؤول" value="${esc(f.owner)}" aria-label="المسؤول"><select id="fs" aria-label="حالة التحديث">${optsOf(stOpts, f.st, "كل الحالات")}</select>
  <label class="mut" style="font-size:12px">من تاريخ<input id="ff" type="date" value="${esc(f.from)}"></label><label class="mut" style="font-size:12px">إلى تاريخ<input id="fe" type="date" value="${esc(f.to)}"></label></div>
  <p class="mut">${AD(rows.length)} تحديث${S.pend.length ? "" : " — لا توجد تحديثات معلقة. لبدء تحديث افتح تبويب «الموارد المنشورة»."}</p>
  <div>${rows.slice(S.page * PAGE, S.page * PAGE + PAGE).map((v) => { const it = S.tt[v.item_key] || {}; return `<div class="vc-row" data-k="${esc(v.item_key)}" role="button" tabindex="0"><div class="t">${esc(it.title || v.item_key)}<div class="m">${esc(TYPE[v.src] || v.src)} · النسخة ${AD(lab(v))} · ${esc(v.created_by_name || "—")} · ${fmt(v.created_at)}</div><div class="m">${esc(v.summary || "")}</div></div>${v.urgent ? '<span class="vc-b urg">عاجل</span>' : ""}${badge(v.status)}</div>`; }).join("")}</div>
  <div class="vc-acts"><button class="chip" id="pprev" ${S.page === 0 ? "disabled" : ""}>السابق</button><span class="mut">صفحة ${AD(S.page + 1)} من ${AD(pages)}</span><button class="chip" id="pnext" ${S.page >= pages - 1 ? "disabled" : ""}>التالي</button></div>`;
}
function bindPend(m) {
  const re = () => { const id = document.activeElement && document.activeElement.id; S.page = 0; m.innerHTML = shell(pendHtml()); rebind(); const e = id && $("#" + id, m); if (e) { e.focus(); try { e.setSelectionRange(e.value.length, e.value.length); } catch (x) {} } };
  function rebind() {
    $$("#vctabs [data-t]", m).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.page = 0; paint(m); }));
    let t; $("#fq", m).oninput = (e) => { S.f.q = e.target.value; clearTimeout(t); t = setTimeout(re, 200); }; $("#fo", m).oninput = (e) => { S.f.owner = e.target.value; clearTimeout(t); t = setTimeout(re, 200); };
    [["#ft", "type"], ["#fl", "lv"], ["#fs", "st"], ["#ff", "from"], ["#fe", "to"]].forEach(([s, k]) => ($(s, m).onchange = (e) => { S.f[k] = e.target.value; re(); }));
    $("#pprev", m).onclick = () => { S.page--; m.innerHTML = shell(pendHtml()); rebind(); }; $("#pnext", m).onclick = () => { S.page++; m.innerHTML = shell(pendHtml()); rebind(); };
    $$("[data-k]", m).forEach((r) => { const open = () => detail(m, r.dataset.k); r.onclick = open; r.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }; });
    bindEnf(m);
  }
  rebind();
}
/* ---------- الموارد المنشورة ---------- */
function resFiltered() { const f = S.rf, q = f.q.trim().toLowerCase(); return S.res.filter((x) => (!q || (x.title || "").toLowerCase().includes(q) || x.key.toLowerCase().includes(q)) && (!f.type || x.src === f.type) && (!f.lv || (x.levels || []).includes(f.lv))); }
function resHtml() {
  const f = S.rf, rows = resFiltered(), pages = Math.max(1, Math.ceil(rows.length / PAGE)); if (S.page >= pages) S.page = pages - 1;
  return `<div class="vc-filters"><input id="rq" type="search" placeholder="ابحث باسم المورد" value="${esc(f.q)}" aria-label="اسم المورد"><select id="rt" aria-label="نوع المحتوى">${optsOf(TYPE, f.type, "كل الأنواع")}</select><select id="rl" aria-label="العمر أو الصف">${optsOf(LV, f.lv, "كل الأعمار والصفوف")}</select></div>
  <p class="mut">${AD(rows.length)} مورد منشور أو موقوف. اختر موردًا لعرض سجل نسخه أو إنشاء نسخة جديدة للتعديل.</p>
  <div>${rows.slice(S.page * PAGE, S.page * PAGE + PAGE).map((x) => `<div class="vc-row" data-k="${esc(x.key)}" role="button" tabindex="0"><div class="t">${esc(x.title || x.key)}<div class="m">${esc(TYPE[x.src] || x.src)} · ${(x.levels || []).filter((l) => LV[l]).map((l) => LV[l]).join("، ")}</div></div>${x.status === "suspended" ? '<span class="vc-b urg">موقوف مؤقتًا</span>' : ""}</div>`).join("")}</div>
  <div class="vc-acts"><button class="chip" id="pprev" ${S.page === 0 ? "disabled" : ""}>السابق</button><span class="mut">صفحة ${AD(S.page + 1)} من ${AD(pages)}</span><button class="chip" id="pnext" ${S.page >= pages - 1 ? "disabled" : ""}>التالي</button></div>`;
}
function bindRes(m) {
  function rebind() {
    $$("#vctabs [data-t]", m).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.page = 0; paint(m); }));
    const re = () => { const id = document.activeElement && document.activeElement.id; S.page = 0; m.innerHTML = shell(resHtml()); rebind(); const e = id && $("#" + id, m); if (e) e.focus(); };
    let t; $("#rq", m).oninput = (e) => { S.rf.q = e.target.value; clearTimeout(t); t = setTimeout(re, 200); };
    [["#rt", "type"], ["#rl", "lv"]].forEach(([s, k]) => ($(s, m).onchange = (e) => { S.rf[k] = e.target.value; re(); }));
    $("#pprev", m).onclick = () => { S.page--; m.innerHTML = shell(resHtml()); rebind(); }; $("#pnext", m).onclick = () => { S.page++; m.innerHTML = shell(resHtml()); rebind(); };
    $$("[data-k]", m).forEach((r) => { const open = () => detail(m, r.dataset.k); r.onclick = open; r.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }; });
    bindEnf(m);
  }
  rebind();
}
/* ---------- صفحة المورد: النسخة الحالية + سجل النسخ ---------- */
const J = (v) => JSON.stringify(v === undefined ? null : v);
function changedKeys(v) { const a = v.data || {}, b = v.base_data || {}; return [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => J(a[k]) !== J(b[k])).sort(); }
function show(v) { if (v == null || v === "") return "—"; if (typeof v === "string") return v; if (Array.isArray(v) && v.every((x) => typeof x === "string" || typeof x === "number")) return v.map((x) => "• " + x).join("\n"); return JSON.stringify(v, null, 1); }
function cmpHtml(v) {
  const ks = changedKeys(v); if (!ks.length) return '<p class="mut">لا توجد حقول مختلفة عن المحتوى قبل التحديث.</p>';
  return `<p class="mut" style="font-size:12px">مقارنة حقلًا بحقل: القيمة قبل التحديث وبعده. لا تُقارَن محتويات الملفات المرفقة، بل روابطها فقط.</p>` + ks.map((k) => `<div class="vc-fld"><b>${esc(LBL[k] || k)}</b><div class="vc-cmp"><div class="o"><small class="mut">قبل</small>\n${esc(show((v.base_data || {})[k]))}</div><div class="n"><small class="mut">بعد</small>\n${esc(show((v.data || {})[k]))}</div></div></div>`).join("");
}
async function detail(m, key) {
  S.key = key; m.innerHTML = '<p class="mut">جارٍ التحميل…</p>';
  const [it, vs, lg, fb, sl] = await Promise.all([sb.from("quality_items").select("key,src,slug,title,levels,status,recheck,recheck_reason,suspend_reason,suspended_at").eq("key", key), sb.from("ver_versions").select("*").eq("item_key", key).order("major", { ascending: false }).order("minor", { ascending: false }), sb.from("ver_log").select("*").eq("item_key", key).order("at", { ascending: false }).limit(100), sb.from("fb_items").select("id,ref,status,kind").eq("item_key", key), sb.from("src_links").select("*").eq("item_key", key)]);
  const item = (it.data || [])[0]; if (!item) { S.key = null; toast("المورد غير موجود"); return paint(m); }
  D = { item, vers: vs.data || [], log: lg.data || [], fb: (fb.data || []).filter((x) => ["new", "in_review", "need_info", "accepted"].includes(x.status)), links: sl.data || [], form: null, open: new Set(), sel: null };
  draw(m);
}
function active() { return D.vers.find((v) => ["working", "in_review", "needs_changes", "approved"].includes(v.status)); }
function pubUrl(item) { const p = PUB[item.src]; if (!p) return ""; try { return new URL("../" + p + encodeURIComponent(item.slug), document.baseURI).href; } catch (e) { return ""; } }
function verCard(v) {
  const cur = v.status === "published", ks = changedKeys(v), op = D.open.has(v.id), url = cur ? pubUrl(D.item) : "";
  return `<div class="vc-tl"><b>النسخة ${AD(lab(v))}</b> ${badge(v.status)} ${v.urgent ? '<span class="vc-b urg">عاجل</span>' : ""} <span class="mut">(${KIND[v.kind] || v.kind})</span>
  <span class="m">أُنشئت: ${fmt(v.created_at)} · بواسطة: ${esc(v.created_by_name || "—")}</span><span class="m">نُشرت: ${v.published_at ? fmt(v.published_at) + " · " + esc(v.published_by_name || "") : "لم تُنشر"}</span>
  <span class="m">ملخص التغييرات: ${esc(v.summary || "—")}</span>${(v.change_types || []).length ? `<span class="m">النوع: ${v.change_types.map((c) => esc(CT[c] || c)).join("، ")}</span>` : ""}
  <span class="m">نتيجة مراجعة الجودة: ${v.review_result ? (RES[v.review_result] || v.review_result) + (v.approved_by_name ? " · " + esc(v.approved_by_name) : "") : v.kind === "base" ? "نسخة أساسية سابقة لنظام النسخ" : "لم تكتمل"}</span>
  <span class="m">رابط المعاينة: ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">فتح صفحة المورد</a>` : "لا يوجد رابط عام لهذه النسخة"}</span>
  <div class="vc-acts" style="margin-top:4px">${v.kind !== "base" ? `<button class="chip" data-tg="${esc(v.id)}">${op ? "إخفاء التفاصيل" : "عرض التغييرات"}</button>` : ""}${v.status === "superseded" && has("publisher") ? `<button class="chip" data-rs="${esc(v.id)}">استعادة هذه النسخة</button>` : ""}</div>${op ? `<div style="margin-top:6px">${cmpHtml(v)}</div>` : ""}</div>`;
}
function fieldEditor(v) {
  const d = v.data || {};
  const keys = Object.keys(d).sort((a, b) => (a === "title" || a === "name" ? -1 : b === "title" || b === "name" ? 1 : 0));
  return keys.map((k) => { const x = d[k], isJ = x !== null && typeof x === "object" && !(Array.isArray(x) && x.every((y) => typeof y === "string") && (x.length || LINES.includes(k))), lines = Array.isArray(x) && !isJ;
    const val = lines ? x.join("\n") : isJ ? JSON.stringify(x, null, 1) : x == null ? "" : String(x), long = isJ || lines || String(val).length > 70 || ["descr", "description", "instr", "summary", "goal", "completion", "parent_role"].includes(k);
    return `<div class="vc-fld"><b>${esc(LBL[k] || k)}</b>${long ? `<textarea class="${isJ ? "json" : "big"}" data-f="${esc(k)}" data-ty="${isJ ? "j" : lines ? "l" : "s"}" ${isJ ? 'dir="ltr"' : ""}>${esc(val)}</textarea>` : `<input data-f="${esc(k)}" data-ty="${typeof x === "number" ? "n" : "s"}" value="${esc(val)}" ${/_url$|^href$/.test(k) ? 'dir="ltr" inputmode="url"' : ""}>`}${isJ ? '<small class="mut">بيانات منظمة بصيغة JSON — حافظ على صحة الصيغة.</small>' : lines ? '<small class="mut">عنصر في كل سطر.</small>' : ""}</div>`; }).join("");
}
function readFields(v, m) {
  const out = {}, d = v.data || {};
  for (const el of $$("[data-f]", m)) {
    const k = el.dataset.f, ty = el.dataset.ty, raw = el.value; let nv;
    if (ty === "j") { try { nv = raw.trim() ? JSON.parse(raw) : null; } catch (e) { throw new Error("صيغة JSON غير صحيحة في حقل «" + (LBL[k] || k) + "»"); } }
    else if (ty === "l") nv = raw.split("\n").map((s) => s.trim()).filter(Boolean);
    else if (ty === "n") { if (raw.trim() === "") nv = null; else { nv = Number(raw); if (Number.isNaN(nv)) throw new Error("قيمة رقمية غير صحيحة في حقل «" + (LBL[k] || k) + "»"); } }
    else nv = raw === "" && (d[k] == null || /_url$|^href$/.test(k)) ? null : raw;
    if (J(nv) !== J(d[k])) out[k] = nv;
  }
  return out;
}
function typesHtml(sel) { return `<div class="vc-chk">${Object.entries(CT).filter(([k]) => k !== "restore" || (sel || []).includes("restore")).map(([k, l]) => `<label><input type="checkbox" data-ct="${k}" ${(sel || []).includes(k) ? "checked" : ""}>${l}</label>`).join("")}</div>`; }
function pickTypes(m) { return $$("[data-ct]", m).filter((c) => c.checked).map((c) => c.dataset.ct); }
function reviewHtml(v) {
  const r = v.review || {}, a = r.aspects || {}, n = r.notes || {};
  return `<div class="vc-box"><b>مراجعة النسخة ${AD(lab(v))}</b><p class="mut" style="font-size:13px">قيّم كل جانب ثم احفظ. لا تُعتمد النسخة إلا إذا اجتازت كل الجوانب، وإذا مسّ التحديث معلومة أو إجابة فلا يصح «لا ينطبق» لصحة المعلومات ومناسبة العمر والأهداف.</p>
  ${ASP.map(([k, l]) => `<div class="vc-asp"><b>${l}</b><div class="r">${[["pass", "اجتاز"], ["fail", "لم يجتز"], ["na", "لا ينطبق"]].map(([x, t]) => `<label><input type="radio" name="as_${k}" value="${x}" ${a[k] === x ? "checked" : ""}>${t}</label>`).join("")}</div><input data-n="${k}" placeholder="ملاحظة (إلزامية عند «لم يجتز»)" value="${esc(n[k] || "")}"></div>`).join("")}
  <label style="display:block;margin-top:8px">ملاحظة القرار (إلزامية عند طلب التعديل)<textarea id="vdn">${esc(v.review_note || "")}</textarea></label>
  <div class="vc-acts"><button class="chip" id="vrsave">حفظ التقييم</button><button class="chip pri" id="vrok">اعتماد النسخة</button><button class="chip bad" id="vrchg">طلب تعديل</button><button class="chip" id="vrx">إغلاق</button></div></div>`;
}
function activeBox(v) {
  const it = D.item, st = v.status, edit = D.form === "edit", rev = D.form === "review";
  const canEdit = has("content_editor") || (v.urgent && has("edu_reviewer", "publisher"));
  const fbw = D.fb.length ? `<div class="vc-warn">${AD(D.fb.length)} ملاحظة مفتوحة من أولياء الأمور على هذا المورد؛ راجعها قبل الاعتماد.</div>` : "";
  const srcw = D.links.some((l) => l.verify) ? '<div class="vc-warn">يوجد مصدر مرتبط بالمورد ينتظر التحقق؛ سيمنع النظام الاعتماد والنشر حتى يُحسم في مركز المصادر.</div>' : "";
  let acts = "";
  if (st === "working" || st === "needs_changes") acts = `${canEdit ? `<button class="chip pri" id="vedit">${edit ? "إغلاق التعديل" : "تعديل نسخة العمل"}</button><button class="chip" id="vsub">إرسال للمراجعة</button>` : ""}<button class="chip" id="vprev">معاينة قبل النشر</button>${canEdit ? '<button class="chip bad" id="vcan">إيقاف التحديث</button>' : ""}${isMgr() ? '<button class="chip bad" id="vdel">حذف النسخة</button>' : ""}`;
  else if (st === "in_review") acts = `${has("edu_reviewer", "design_reviewer") ? `<button class="chip pri" id="vrev">${rev ? "إغلاق المراجعة" : "فتح بطاقة المراجعة"}</button>` : ""}<button class="chip" id="vprev">معاينة قبل النشر</button>${canEdit ? '<button class="chip" id="vreo">إعادة إلى العمل</button><button class="chip bad" id="vcan">إيقاف التحديث</button>' : ""}`;
  else if (st === "approved") acts = `<button class="chip" id="vprev">معاينة قبل النشر</button>${has("publisher") ? '<button class="chip pri" id="vpub">نشر النسخة الجديدة</button>' : ""}${canEdit ? '<button class="chip" id="vreo">إعادة إلى العمل</button><button class="chip bad" id="vcan">إيقاف التحديث</button>' : ""}`;
  const prev = D.form === "preview" ? `<div class="vc-box" style="background:#faf8ff"><b>معاينة قبل النشر — ما الذي سيتغيّر في المنشور</b>${cmpHtml(v)}<p class="mut" style="font-size:12px">لا يرى المستخدمون هذه النسخة حتى النشر.</p></div>` : "";
  const editor = edit ? `<div class="vc-box"><b>تعديل نسخة العمل ${AD(lab(v))}</b><p class="mut" style="font-size:13px">التعديل هنا لا يغيّر المنشور. العمر والصف والمجال والمعرّف والرابط لا تتغير من هذه الشاشة.</p><div class="vc-fld"><b>ملخص التغييرات (إلزامي)</b><textarea id="vsum">${esc(v.summary || "")}</textarea></div><div class="vc-fld"><b>نوع التغيير (إلزامي)</b>${typesHtml(v.change_types)}</div>${fieldEditor(v)}<div class="vc-acts"><button class="chip pri" id="vsave">حفظ التعديلات</button><button class="chip" id="vecl">إغلاق</button></div></div>` : "";
  return `<div class="vc-box"><b>تحديث جارٍ — النسخة ${AD(lab(v))}</b> ${badge(st)} ${v.urgent ? '<span class="vc-b urg">تصحيح عاجل</span>' : ""}
   <div class="mut" style="font-size:13px">${esc(v.summary || "")} — ${esc(v.created_by_name || "")}</div>${v.urgent && v.urgent_reason ? `<div class="vc-warn">سبب الاستعجال: ${esc(v.urgent_reason)}</div>` : ""}${st === "needs_changes" && v.review_note ? `<div class="vc-warn">المطلوب تعديله: ${esc(v.review_note)}</div>` : ""}${st === "cancelled" ? "" : fbw + srcw}
   <div class="vc-acts">${acts}</div></div>${prev}${editor}${rev ? reviewHtml(v) : ""}`;
}
function draw(m) {
  const { item, vers, log } = D, act = active(), cur = vers.find((v) => v.status === "published"), susp = item.status === "suspended";
  const form = D.form;
  const canCreate = has("content_editor"), canHot = has("edu_reviewer", "publisher"), canSusp = has("publisher", "edu_reviewer", "design_reviewer");
  const curBox = `<div class="vc-box vc-cur"><div class="mut" style="font-size:13px">النسخة الحالية للمستخدمين</div><h3 style="margin:2px 0 4px">${esc(item.title || item.key)} — ${cur ? "النسخة " + AD(lab(cur)) : "النسخة 1.0 (لم يُنشأ تحديث بعد)"}</h3>
   <div class="mut" style="font-size:13px">${esc(TYPE[item.src] || item.src)} · ${(item.levels || []).filter((l) => LV[l]).map((l) => LV[l]).join("، ")}${cur ? " · نُشرت " + fmt(cur.published_at) + (cur.published_by_name ? " · " + esc(cur.published_by_name) : "") : ""}</div>
   ${susp ? `<div class="vc-warn"><b>المورد موقوف مؤقتًا</b> ولا يراه المستخدمون${item.suspend_reason ? ": " + esc(item.suspend_reason) : ""}. أنشئ نسخة تصحيحية؛ عند نشرها بعد اعتمادها يعود المورد متاحًا.</div>` : ""}${item.recheck ? `<div class="vc-warn">عليه طلب إعادة تقييم (${esc(item.recheck_reason || "")}).</div>` : ""}
   <div class="vc-acts">${!act && canCreate ? '<button class="chip pri" id="vnew">إنشاء نسخة جديدة للتعديل</button>' : ""}${!act && canHot ? '<button class="chip bad" id="vhot">تصحيح عاجل</button>' : ""}${!susp && canSusp ? '<button class="chip bad" id="vsus">إيقاف المورد مؤقتًا</button>' : ""}${ADM[item.src] ? '<button class="chip" id="vadm">فتح المورد في الإدارة</button>' : ""}<button class="chip" id="vq">مركز الجودة</button></div>
   ${act ? '<p class="mut" style="font-size:12px">يوجد تحديث غير منتهٍ لهذا المورد؛ أنهِه أو أوقفه قبل إنشاء نسخة أخرى.</p>' : ""}${!act && !canCreate && !canHot ? '<p class="mut" style="font-size:12px">لا تملك صلاحية إنشاء نسخة جديدة.</p>' : ""}</div>`;
  const create = (form === "create" || form === "hotfix") ? `<div class="vc-box"><b>${form === "hotfix" ? "إنشاء نسخة تصحيحية عاجلة" : "إنشاء نسخة جديدة للتعديل"}</b><p class="mut" style="font-size:13px">تُنشأ نسخة عمل مستقلة من المحتوى الحالي. يبقى المنشور متاحًا ولا يتغير حتى اعتماد التحديث ونشره.</p>
   <div class="vc-fld"><b>نوع التغيير (إلزامي)</b>${typesHtml([])}</div><div class="vc-fld"><b>ملخص التغييرات (إلزامي)</b><textarea id="csum" placeholder="ماذا ستغيّر ولماذا؟"></textarea></div>
   ${form === "hotfix" ? '<div class="vc-fld"><b>سبب الاستعجال وأثره على الطفل (إلزامي)</b><textarea id="crea"></textarea></div>' : `<label style="font-size:14px"><input type="checkbox" id="cmaj"> نسخة رئيسية (يرتفع الرقم الأول، مثل 2.0)</label>`}
   <div class="vc-acts"><button class="chip pri" id="cgo">إنشاء النسخة</button><button class="chip" id="ccl">إلغاء</button></div></div>` : "";
  const susBox = form === "suspend" ? `<div class="vc-box"><b>إيقاف المورد مؤقتًا</b><p class="mut" style="font-size:13px">يختفي المورد عن المستخدمين فورًا ويُسجَّل السبب. يعود متاحًا بعد نشر نسخة تصحيحية معتمدة.</p><div class="vc-fld"><b>سبب الإيقاف (5 أحرف على الأقل)</b><textarea id="srea"></textarea></div><div class="vc-acts"><button class="chip bad" id="sgo">إيقاف المورد</button><button class="chip" id="scl">إلغاء</button></div></div>` : "";
  const rsBox = form && form.restore ? (() => { const v = vers.find((x) => x.id === form.restore); return v ? `<div class="vc-box"><b>استعادة النسخة ${AD(lab(v))}</b><p class="mut" style="font-size:13px">ستُنشأ <b>نسخة عمل جديدة</b> بمحتوى هذه النسخة وتمر بالمراجعة قبل النشر. لا يتغير المنشور الآن ولا تُحذف أي نسخة أحدث.</p><div class="mut" style="font-size:13px">أُنشئت ${fmt(v.created_at)} · ${esc(v.created_by_name || "")}<br>${esc(v.summary || "")}</div>${cmpHtml(v)}<div class="vc-acts"><button class="chip pri" id="rgo">تأكيد الاستعادة</button><button class="chip" id="rcl">إلغاء</button></div></div>` : ""; })() : "";
  const hist = vers.length ? vers.map(verCard).join("") : '<p class="mut">لا توجد نسخ مسجّلة. تبدأ النسخ عند أول تحديث؛ والمحتوى الحالي هو النسخة 1.0 تلقائيًا.</p>';
  const lg = log.map((l) => { const d = l.detail || {}; return `<div class="vc-tl"><b>${EVT[l.event] || esc(l.event)}</b><span class="m">${esc(l.actor_name || "")} · ${fmt(l.at)}</span>${l.note ? `<span class="m">${esc(l.note)}</span>` : ""}${d.fields ? `<span class="m">الحقول: ${esc((d.fields || []).map((f) => LBL[f] || f).join("، "))}</span>` : ""}</div>`; }).join("") || '<p class="mut">لا يوجد سجل.</p>';
  m.innerHTML = `<style>${CSS}</style><div class="vc"><button class="chip" id="vback">→ رجوع إلى المركز</button>${curBox}${create}${susBox}${rsBox}${act ? activeBox(act) : ""}
   <div class="vc-box"><b>سجل النسخ والتحديثات</b>${hist}</div><div class="vc-box"><b>سجل العمليات</b>${lg}</div></div>`;
  bind(m);
}
function bind(m) {
  const item = D.item, act = active(), go = (id, f) => { const e = $(id, m); if (e) e.onclick = f; };
  const reload = async () => { const f = D.form; await detail(m, item.key); if (f && typeof f === "string" && ["edit", "review"].includes(f) && active()) { D.form = f; draw(m); } };
  const setForm = (f) => { D.form = f; draw(m); };
  go("#vback", () => { S.key = null; paint(m); });
  go("#vnew", () => setForm("create")); go("#vhot", () => setForm("hotfix")); go("#vsus", () => setForm("suspend"));
  go("#ccl", () => setForm(null)); go("#scl", () => setForm(null)); go("#rcl", () => setForm(null)); go("#vecl", () => setForm(null)); go("#vrx", () => setForm(null));
  go("#vadm", () => { S.key = null; window.__go(ADM[item.src]); });
  go("#vq", () => { S.key = null; window.__qualityOpen = item.key; window.__go("qualityadm"); });
  $$("[data-tg]", m).forEach((b) => (b.onclick = () => { const id = b.dataset.tg; D.open.has(id) ? D.open.delete(id) : D.open.add(id); draw(m); }));
  $$("[data-rs]", m).forEach((b) => (b.onclick = () => setForm({ restore: b.dataset.rs })));
  go("#cgo", async () => {
    const hot = D.form === "hotfix", types = pickTypes(m), sum = $("#csum", m).value, reason = hot ? $("#crea", m).value : null;
    const x = await sb.rpc("ver_create", { p_key: item.key, p_major: hot ? false : !!($("#cmaj", m) || {}).checked, p_types: types, p_summary: sum, p_urgent: hot, p_reason: reason });
    if (x.error) return fail(x.error); toast("أُنشئت نسخة العمل " + AD(x.data.label) + ". المنشور لم يتغير"); D.form = "edit"; await detail(m, item.key); D.form = "edit"; draw(m); });
  go("#sgo", async () => { const x = await sb.rpc("ver_suspend", { p_key: item.key, p_reason: $("#srea", m).value }); if (x.error) return fail(x.error); toast("أُوقف المورد مؤقتًا"); reload(); });
  go("#rgo", async () => { const id = D.form.restore; const x = await sb.rpc("ver_restore", { p_id: id, p_confirm: true }); if (x.error) return fail(x.error); toast("أُنشئت نسخة عمل " + AD(x.data.label) + " من النسخة المستعادة. راجعها ثم انشرها"); D.form = null; reload(); });
  if (!act) return;
  go("#vedit", () => setForm(D.form === "edit" ? null : "edit"));
  go("#vprev", () => setForm(D.form === "preview" ? null : "preview"));
  go("#vrev", () => setForm(D.form === "review" ? null : "review"));
  go("#vsave", async () => {
    let p; try { p = readFields(act, m); } catch (e) { return toast(e.message); }
    const types = pickTypes(m), sum = $("#vsum", m).value;
    const x = await sb.rpc("ver_save", { p_id: act.id, p_data: p, p_types: types.length ? types : null, p_summary: sum }); if (x.error) return fail(x.error); toast("حُفظت التعديلات في نسخة العمل. المنشور لم يتغير"); const f = D.form; await detail(m, item.key); D.form = f; draw(m); });
  go("#vsub", async () => { const x = await sb.rpc("ver_submit", { p_id: act.id, p_note: null }); if (x.error) return fail(x.error); toast("أُرسلت النسخة إلى مراجعة الجودة"); reload(); });
  go("#vreo", async () => { if (!(await Z.ask("ستعود النسخة إلى حالة العمل ويُمسح تقييم المراجعة الحالي. متابعة؟", "نعم، أعدها"))) return; const x = await sb.rpc("ver_reopen", { p_id: act.id }); if (x.error) return fail(x.error); toast("أُعيدت إلى العمل"); reload(); });
  go("#vcan", async () => { const r = window.prompt ? null : null; const reason = await askReason(m, "سبب إيقاف التحديث"); if (reason == null) return; const x = await sb.rpc("ver_cancel", { p_id: act.id, p_reason: reason }); if (x.error) return fail(x.error); toast("أُوقف التحديث. النسخة محفوظة في السجل"); reload(); });
  go("#vdel", async () => { if (!(await Z.ask("تُحذف نسخة العمل غير المنشورة نهائيًا، ويبقى أثر الحذف ومحتواها في سجل العمليات. متابعة؟", "نعم، احذف"))) return; const x = await sb.rpc("ver_delete", { p_id: act.id }); if (x.error) return fail(x.error); toast("حُذفت النسخة غير المنشورة"); reload(); });
  go("#vpub", async () => { if (!(await Z.ask(`ستصبح النسخة ${lab(act)} هي النسخة الحالية للمستخدمين، وتُحفظ النسخة السابقة في السجل. متابعة؟`, "نعم، انشر"))) return; const x = await sb.rpc("ver_publish", { p_id: act.id }); if (x.error) return fail(x.error); toast(x.data && x.data.reinstated ? "نُشرت النسخة وأُعيد إتاحة المورد" : "نُشرت النسخة الجديدة"); reload(); });
  const rv = () => { const aspects = {}, notes = {}; ASP.forEach(([k]) => { const c = $(`input[name=as_${k}]:checked`, m); if (c) { aspects[k] = c.value; notes[k] = $(`[data-n=${k}]`, m).value; } }); return { aspects, notes }; };
  go("#vrsave", async () => { const x = await sb.rpc("ver_review", { p_id: act.id, p: rv() }); if (x.error) return fail(x.error); toast("حُفظ تقييم المراجعة"); const f = D.form; await detail(m, item.key); D.form = f; draw(m); });
  go("#vrok", async () => { const s = await sb.rpc("ver_review", { p_id: act.id, p: rv() }); if (s.error) return fail(s.error); const x = await sb.rpc("ver_decide", { p_decision: "approve", p_id: act.id, p_note: $("#vdn", m).value || null }); if (x.error) { fail(x.error); const f = D.form; await detail(m, item.key); D.form = f; draw(m); return; } toast("اعتُمدت النسخة وتنتظر النشر"); reload(); });
  go("#vrchg", async () => { const s = await sb.rpc("ver_review", { p_id: act.id, p: rv() }); if (s.error) return fail(s.error); const x = await sb.rpc("ver_decide", { p_decision: "changes", p_id: act.id, p_note: $("#vdn", m).value }); if (x.error) { fail(x.error); const f = D.form; await detail(m, item.key); D.form = f; draw(m); return; } toast("أُعيدت النسخة للتعديل"); reload(); });
}
function askReason(m, title) {
  return new Promise((res) => {
    const box = document.createElement("div"); box.className = "vc-box"; box.innerHTML = `<b>${esc(title)}</b><textarea id="vcr"></textarea><div class="vc-acts"><button class="chip pri" id="vcro">تأكيد</button><button class="chip" id="vcrc">إلغاء</button></div>`;
    $(".vc", m).prepend(box); box.querySelector("#vcr").focus();
    box.querySelector("#vcro").onclick = () => { const v = box.querySelector("#vcr").value; box.remove(); res(v); }; box.querySelector("#vcrc").onclick = () => { box.remove(); res(null); };
  });
}
window.__verTest = { S, TYPE, ST, CT, ASP, pendFiltered, changedKeys };
})();
