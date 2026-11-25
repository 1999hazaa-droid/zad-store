/* مركز تقييم جودة المحتوى التعليمي — لوحة الإدارة.
   سير العمل: مسودة ← قيد المراجعة ← (يحتاج إلى تعديل | مقبول) ← منشور ← موقوف مؤقتًا.
   القواعد الأساسية مفروضة في قاعدة البيانات نفسها (لا يكفي إخفاء الأزرار هنا):
   لا نشر قبل الاعتماد، ولا اعتماد مع مشكلة مانعة، والصلاحيات حسب الدور، وسجل المراجعات لا يُعدَّل ولا يُحذف.
   الدرجات (1–5) داخلية للمراجع فقط ولا تظهر للمستخدم النهائي. النطاق: من سنة إلى 6 سنوات والصفوف 1–4 فقط. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const F = () => window.ZFIND;

const ST = { draft: "مسودة", in_review: "قيد المراجعة", needs_changes: "يحتاج إلى تعديل", accepted: "مقبول", published: "منشور", suspended: "موقوف مؤقتًا" };
const STC = { draft: "#7c7c8c", in_review: "#2f6fe0", needs_changes: "#d9822b", accepted: "#1f9a63", published: "#6b3fd4", suspended: "#c62f4a" };
const TYPE = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع أو تحدٍّ", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف وتجارب", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", pack: "حزمة تعليمية" };
const ADM = { lib: "libadm", acts: "activitiesadm", bank: "bankadm", proj: "projadm", life: "lifeadm", ready: "readyadm", val: "valadm", exp: "expadm", vid: "videoadm", songs: "songadm", stories: "storiesadm", quiz: "quizadm", pack: "packsadm" };
const LVN0 = { a2: "سنة إلى سنتين", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const LV_OK = Object.keys(LVN0);
const lvn = (l) => ((F() && F().LVN) || {})[l] || LVN0[l] || l;
/* المعايير السبعة: edu = المراجع التعليمي، dsg = مراجع التصميم */
const CRIT = [
  ["accuracy", "صحة المعلومات", "edu", "المعلومات والإجابات النموذجية والأمثلة صحيحة وغير متناقضة"],
  ["age", "ملاءمة العمر والصف", "edu", "مفردات مفهومة، ومهارات مناسبة للفئة، ونشاط قابل للتنفيذ"],
  ["goals", "الأهداف التعليمية", "edu", "هدف واضح والأنشطة مرتبطة به دون حشو"],
  ["design", "جودة التصميم", "dsg", "نصوص ورسومات واضحة، لا ازدحام ولا عناصر متداخلة"],
  ["usability", "سهولة الاستخدام", "dsg", "تعليمات واضحة، وإرشاد لولي الأمر، ويعمل على الهاتف والكمبيوتر"],
  ["files", "جودة الملفات", "dsg", "الملف يفتح، صفحات الطباعة مكتملة، لا صفحات فارغة"],
  ["safety", "السلامة والخصوصية", "edu", "لا سلوك غير آمن، ولا طلب بيانات شخصية، وروابط خارجية آمنة"]
];
const CNAME = Object.fromEntries(CRIT.map((c) => [c[0], c[1]]));
const ROLES = [["content_editor", "مسؤول إضافة المحتوى", "يرسل الموارد للمراجعة"], ["edu_reviewer", "مراجع تعليمي", "يقيّم المعايير التعليمية ويعتمد"], ["design_reviewer", "مراجع تصميم", "يقيّم التصميم وسهولة الاستخدام والملفات"], ["publisher", "مسؤول نشر", "ينشر المقبول ويوقف مؤقتًا"], ["library_manager", "مدير المكتبة", "كل الصلاحيات وإدارة الأدوار"]];
const RECHECK = ["خطأ تعليمي", "تحديث منهج أو معلومة", "ملاحظة من ولي أمر", "رابط أو ملف معطل", "مشكلة تصميم أو تفاعل", "تغيّر صلاحيات الوصول"];
const EVT = { submit: "أُرسل للمراجعة", card_save: "حُفظ التقييم", accepted: "اعتُمد", needs_changes: "طُلب تعديل", keep: "اجتاز إعادة التقييم ويبقى منشورًا", published: "نُشر", suspended: "أُوقف مؤقتًا", edit: "تعديل", recheck: "طُلبت إعادة تقييم", legacy: "نُشر دون مراجعة", seed: "سجل أولي", created: "أُضيف كمسودة", deleted: "حُذف من المصدر", renamed: "تغيّر رمزه", roles: "تغيير أدوار", version_created: "أُنشئت نسخة تحديث", version_submitted: "أُرسلت نسخة للمراجعة", version_changes: "نسخة تحتاج إلى تعديل", version_approved: "اعتُمدت نسخة", version_published: "نُشرت نسخة جديدة", version_reinstated: "نُشرت نسخة وأُعيد إتاحة المورد", version_restored: "استعادة نسخة سابقة", version_cancelled: "أُوقف تحديث", version_deleted: "حُذفت نسخة عمل" };
const PAGE = 40;

const S = { tab: "dash", me: { roles: [], name: "" }, items: [], dash: null, f: { q: "", st: "", type: "", lv: "", flag: "" }, page: 0, sel: null, staff: null };
let M = null, card = null, DET = null;

const clean = (e) => String((e && e.message) || e || "").replace(/^(QUALITY_PERM|QUALITY_GATE):\s*/, "");
const fail = (e) => { console.error(e); toast(clean(e) || "تعذّر تنفيذ الطلب. حاول مرة ثانية"); };
const can = (...r) => S.me.roles.includes("library_manager") || r.some((x) => S.me.roles.includes(x));
const fmt = (d) => { try { return d ? new Date(d).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }) : "—"; } catch (e) { return "—"; } };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const badge = (s) => `<span class="qc-b" style="background:${STC[s]}">${ST[s] || s}</span>`;
const flags = (it) => (it.status === "published" && it.legacy ? '<span class="qc-f">منشور دون مراجعة سابقة</span>' : "") + (it.status === "published" && it.recheck ? `<span class="qc-f w">يحتاج إعادة مراجعة${it.recheck_reason ? ": " + esc(it.recheck_reason) : ""}</span>` : "");
const domOf = (key) => { const f = F(); if (!f || !f.X || !f.X.all) return "—"; const x = f.X.all.find((i) => i.key === key); if (!x) return "—"; const d = (f.X.doms || []).find((d) => d.slug === x.dom); return d ? d.title : "—"; };

const CSS = `.qc{--p:#6b3fd4}.qc *{box-sizing:border-box}.qc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.qc-tabs .chip.on{background:var(--p);color:#fff}
.qc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:10px 0}.qc-card{border:1px solid #e3dcf6;border-radius:14px;padding:12px;background:#fff;cursor:pointer;text-align:center}.qc-card b{display:block;font-size:26px;color:var(--p)}.qc-card span{font-size:13px;color:#555}
.qc-b{color:#fff;border-radius:99px;padding:2px 10px;font-size:12px;white-space:nowrap}.qc-f{display:inline-block;border:1px solid #e0c86a;background:#fff8d9;color:#7a5b00;border-radius:8px;padding:1px 8px;font-size:12px;margin-inline-start:6px}.qc-f.w{border-color:#e9a46a;background:#ffeede;color:#8a4700}
.qc-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border:1px solid #e3dcf6;border-radius:12px;padding:10px;margin:6px 0;background:#fff;cursor:pointer}.qc-row .t{flex:1 1 200px;min-width:0;font-weight:600}.qc-row .m{font-size:12px;color:#666}
.qc-filters{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.qc-filters input,.qc-filters select,.qc textarea,.qc input.qi{font:inherit;border:1px solid #cfc4ee;border-radius:10px;padding:8px;background:#fff;max-width:100%}.qc textarea{width:100%;min-height:54px}
.qc-det{display:grid;gap:14px}@media(min-width:900px){.qc-det{grid-template-columns:3fr 2fr}}.qc-box{border:1px solid #e3dcf6;border-radius:14px;padding:12px;background:#fff}
.qc-cr{border-top:1px solid #eee;padding:10px 0}.qc-cr:first-of-type{border-top:0}.qc-sc{display:flex;gap:6px;margin:6px 0}.qc-sc button{width:38px;height:38px;border-radius:10px;border:1px solid #cfc4ee;background:#fff;font:inherit;cursor:pointer}.qc-sc button.on{background:var(--p);color:#fff;border-color:var(--p)}.qc-sc button.lo.on{background:#c62f4a;border-color:#c62f4a}.qc-sc button:disabled{opacity:.45;cursor:not-allowed}
.qc-g{font-size:11px;border-radius:6px;padding:1px 6px;background:#efe7ff;color:#4b2aa0;margin-inline-start:6px}.qc-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.qc-acts .chip{cursor:pointer}.qc-acts .chip.pri{background:var(--p);color:#fff}.qc-acts .chip.bad{background:#c62f4a;color:#fff}
.qc-tl{border-inline-start:3px solid #d9ccf7;padding:2px 10px;margin:8px 0;font-size:13px}.qc-tl small{color:#666;display:block}.qc-prob{background:#ffeef0;border:1px solid #f1b3bb;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}.qc-ok{background:#e9f8f0;border:1px solid #a9dcc3;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}`;

/* ---------- التحميل ---------- */
async function loadMe() { const r = await sb.rpc("quality_my"); S.me = r.error || !r.data ? { roles: [], name: "" } : r.data; return !r.error; }
async function loadItems() {
  const r = await sb.from("quality_items").select("*").eq("gone", false).order("updated_at", { ascending: false }).limit(3000);
  if (r.error) { toast("تعذّر تحميل الموارد"); S.items = []; return; } S.items = r.data || [];
}
async function loadDash() { const r = await sb.rpc("quality_dashboard"); S.dash = r.error ? null : r.data; if (r.error) toast(clean(r.error)); }
const byKey = () => new Map(S.items.map((i) => [i.key, i]));

/* ---------- الهيكل ---------- */
SUB.qualityadm = { title: "مركز جودة المحتوى", fn: async function view(m) {
  M = m;
  m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  if (F() && F().load) await F().load().catch(() => {});
  const ok = await loadMe();
  if (!ok || !S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى مركز الجودة.</p>'; return; }
  await Promise.all([loadItems(), loadDash()]);
  if (window.__qualityOpen) { S.sel = window.__qualityOpen; window.__qualityOpen = null; }
  if (S.sel) return detail(m, S.sel);
  paint(m);
} };

function shell(inner) {
  const tabs = [["dash", "لوحة المتابعة"], ["list", "الموارد"]].concat(can() && S.me.roles.includes("library_manager") ? [["roles", "الأدوار والصلاحيات"]] : []);
  return `<style>${CSS}</style><div class="qc"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <p class="mut">يراجع المركز جودة الموارد والحزم قبل نشرها وبعده. لا يُنشر مورد جديد تلقائيًا بمجرد رفعه، ووجود خطأ تعليمي أو مشكلة سلامة يمنع النشر مهما كانت بقية الدرجات. النطاق: من سنة إلى 6 سنوات والصفوف 1–4. دورك: <b>${esc(S.me.roles.map((r) => (ROLES.find((x) => x[0] === r) || [0, r])[1]).join("، ") || "—")}</b></p>
  <div class="qc-tabs" id="qctabs">${tabs.map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`;
}
function paint(m) {
  m = m || M; S.sel = null;
  m.innerHTML = shell(S.tab === "dash" ? dashHtml() : S.tab === "roles" ? '<p class="mut">جارٍ التحميل…</p>' : listHtml());
  $$("#qctabs [data-t]", m).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; paint(m); }));
  if (S.tab === "dash") bindDash(m); else if (S.tab === "roles") rolesView(m); else bindList(m);
}

/* ---------- لوحة المتابعة (كل الأرقام من قاعدة البيانات) ---------- */
function dashHtml() {
  const d = S.dash; if (!d) return '<p class="mut">تعذّر تحميل بيانات اللوحة.</p>';
  const c = d.counts || {}, n = (k) => AD(c[k] || 0);
  const cards = [["in_review", "قيد المراجعة"], ["needs_changes", "تحتاج إلى تعديل"], ["accepted", "مقبولة"], ["published", "منشورة"], ["suspended", "موقوفة مؤقتًا"], ["draft", "مسودات"]];
  const rc = S.items.filter((i) => i.status === "published" && i.recheck).slice(0, 30);
  return `<div class="qc-grid">${cards.map(([k, l]) => `<div class="qc-card" data-st="${k}" role="button" tabindex="0"><b>${n(k)}</b><span>${l}</span></div>`).join("")}</div>
  <div class="qc-grid"><div class="qc-card" data-flag="legacy" role="button" tabindex="0"><b>${AD(d.legacy || 0)}</b><span>منشورة دون مراجعة جودة سابقة</span></div>
  <div class="qc-card" data-flag="recheck" role="button" tabindex="0"><b>${AD(d.recheck || 0)}</b><span>تحتاج إعادة مراجعة</span></div>
  <div class="qc-card" style="cursor:default"><b style="font-size:20px">${d.avg_hours == null ? "—" : "≈ " + AD(d.avg_hours) + " ساعة"}</b><span>${d.avg_hours == null ? "متوسط مدة المراجعة: لا توجد بيانات كافية بعد" : "متوسط مدة المراجعة (من " + AD(d.avg_n) + " مراجعة)"}</span></div>
  <div class="qc-card" style="cursor:default"><b>${AD(d.reviews || 0)}</b><span>مراجعة مسجّلة</span></div></div>
  <div class="qc-box"><b>أكثر أنواع المشكلات تكرارًا</b>${(d.issues || []).length ? (d.issues || []).map((x) => `<div>${esc(CNAME[x.c] || x.c)} — ${AD(x.n)}</div>`).join("") : '<p class="mut">لا توجد مشكلات مسجّلة بعد (تظهر بعد أول مراجعة تُسجَّل فيها مشكلة).</p>'}</div>
  <div class="qc-box" style="margin-top:10px"><b>أسباب طلبات إعادة المراجعة</b>${(d.reasons || []).length ? (d.reasons || []).map((x) => `<div>${esc(x.r || "—")} — ${AD(x.n)}</div>`).join("") : '<p class="mut">لا توجد طلبات حاليًا.</p>'}</div>
  <div class="qc-box" style="margin-top:10px"><b>موارد تحتاج إلى إعادة مراجعة</b>${rc.length ? rc.map(rowHtml).join("") : '<p class="mut">لا يوجد مورد مُعلَّم لإعادة المراجعة حاليًا. يمكن عرض «المنشورة دون مراجعة سابقة» من البطاقة أعلاه لبدء المراجعة.</p>'}</div>`;
}
function bindDash(m) {
  const go = (patch) => { S.f = Object.assign({ q: "", st: "", type: "", lv: "", flag: "" }, patch); S.page = 0; S.tab = "list"; paint(m); };
  $$("[data-st]", m).forEach((b) => (b.onclick = () => go({ st: b.dataset.st })));
  $$("[data-flag]", m).forEach((b) => (b.onclick = () => go({ flag: b.dataset.flag, st: "published" })));
  bindRows(m);
}

/* ---------- قائمة الموارد ---------- */
const rowHtml = (it) => `<div class="qc-row" data-o="${esc(it.key)}" role="button" tabindex="0"><div class="t">${esc(it.title || it.slug)}<div class="m">${esc(TYPE[it.src] || it.src)} · ${esc((it.levels || []).map(lvn).join("، ") || "بلا مستوى")}</div></div>${badge(it.status)}${flags(it)}</div>`;
function filtered() {
  const f = S.f, q = f.q.trim().toLowerCase();
  return S.items.filter((i) => (!q || (i.title || "").toLowerCase().includes(q) || i.slug.toLowerCase().includes(q)) && (!f.st || i.status === f.st) && (!f.type || i.src === f.type) && (!f.lv || (i.levels || []).includes(f.lv))
    && (!f.flag || (f.flag === "legacy" ? i.status === "published" && i.legacy : i.status === "published" && i.recheck)));
}
function listHtml() {
  const f = S.f, rows = filtered(), pages = Math.max(1, Math.ceil(rows.length / PAGE)); if (S.page >= pages) S.page = pages - 1;
  return `<div class="qc-filters"><input id="qq" type="search" placeholder="ابحث باسم المورد" value="${esc(f.q)}" aria-label="بحث باسم المورد">
  <select id="qst" aria-label="الحالة"><option value="">كل الحالات</option>${Object.entries(ST).map(([k, l]) => `<option value="${k}" ${f.st === k ? "selected" : ""}>${l}</option>`).join("")}</select>
  <select id="qty" aria-label="النوع"><option value="">كل الأنواع</option>${Object.entries(TYPE).map(([k, l]) => `<option value="${k}" ${f.type === k ? "selected" : ""}>${l}</option>`).join("")}</select>
  <select id="qlv" aria-label="العمر أو الصف"><option value="">كل الأعمار والصفوف</option>${LV_OK.map((k) => `<option value="${k}" ${f.lv === k ? "selected" : ""}>${lvn(k)}</option>`).join("")}</select>
  <select id="qfl" aria-label="علامة"><option value="">بلا علامة</option><option value="legacy" ${f.flag === "legacy" ? "selected" : ""}>منشورة دون مراجعة سابقة</option><option value="recheck" ${f.flag === "recheck" ? "selected" : ""}>تحتاج إعادة مراجعة</option></select></div>
  <p class="mut" id="qcount">${AD(rows.length)} مورد</p><div id="qlist">${rows.slice(S.page * PAGE, S.page * PAGE + PAGE).map(rowHtml).join("") || '<p class="mut">لا توجد موارد مطابقة.</p>'}</div>
  <div class="qc-acts"><button class="chip" id="qprev" ${S.page === 0 ? "disabled" : ""}>السابق</button><span class="mut">صفحة ${AD(S.page + 1)} من ${AD(pages)}</span><button class="chip" id="qnext" ${S.page >= pages - 1 ? "disabled" : ""}>التالي</button></div>`;
}
function bindList(m) {
  const re = () => { const keep = document.activeElement && document.activeElement.id; S.page = 0; paint(m); if (keep) { const e = $("#" + keep, m); if (e) { e.focus(); try { e.setSelectionRange(e.value.length, e.value.length); } catch (x) { /* */ } } } };
  let t; $("#qq", m).oninput = (e) => { S.f.q = e.target.value; clearTimeout(t); t = setTimeout(re, 200); };
  [["#qst", "st"], ["#qty", "type"], ["#qlv", "lv"], ["#qfl", "flag"]].forEach(([s, k]) => ($(s, m).onchange = (e) => { S.f[k] = e.target.value; re(); }));
  $("#qprev", m).onclick = () => { S.page--; paint(m); }; $("#qnext", m).onclick = () => { S.page++; paint(m); };
  bindRows(m);
}
function bindRows(m) { $$("[data-o]", m).forEach((r) => { const open = () => detail(m, r.dataset.o); r.onclick = open; r.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }; }); }

/* ---------- صفحة المورد وبطاقة التقييم ---------- */
async function detail(m, key) {
  S.sel = key; const it = S.items.find((i) => i.key === key);
  if (!it) { S.sel = null; return paint(m); }
  m.innerHTML = '<p class="mut">جارٍ التحميل…</p>';
  const [rv, lg] = await Promise.all([sb.from("quality_reviews").select("*").eq("key", key).order("decided_at", { ascending: false }), sb.from("quality_log").select("*").eq("key", key).order("at", { ascending: false }).limit(100)]);
  const pk = it.src === "pack" ? await packInfo(it) : null;
  const sl = await sb.from("src_links").select("*").eq("item_key", key), ids = (sl.data || []).map((x) => x.source_id);
  const ss = ids.length ? await sb.from("src_sources").select("id,title,author,status,rights,link_status,next_review").in("id", ids) : { data: [] };
  const fbr = await sb.from("fb_items").select("id,ref,kind,status,priority").eq("item_key", key);
  const vrs = await sb.from("ver_versions").select("id,major,minor,kind,status,summary,created_at,created_by_name,published_at,review_result,urgent").eq("item_key", key).order("major", { ascending: false }).order("minor", { ascending: false });
  DET = { it, reviews: rv.data || [], log: lg.data || [], pack: pk, fb: fbr.data || [], ver: vrs.data || [], sources: { links: sl.data || [], src: ss.data || [], err: !!(sl.error || ss.error) } };
  card = JSON.parse(JSON.stringify({ scores: (it.card || {}).scores || {}, notes: (it.card || {}).notes || {}, blockers: (it.card || {}).blockers || [], summary: (it.card || {}).summary || "" }));
  drawDetail(m);
}
async function packInfo(it) {
  const p = await sb.from("packs").select("id,levels").eq("slug", it.slug), id = p.data && p.data[0] && p.data[0].id;
  const items = id ? await sb.from("pack_items").select("key,pos").eq("pack_id", id).order("pos", { ascending: true }) : { data: [] };
  const chk = await sb.rpc("quality_pack_check", { p_slug: it.slug }), by = byKey(), f = F(), all = f && f.X && f.X.all ? f.X.all : [], pl = (p.data && p.data[0] && p.data[0].levels) || it.levels || [];
  const rows = (items.data || []).map((x) => { const q = by.get(x.key), z = all.find((a) => a.key === x.key); let lvm = "—"; if (z) lvm = z.lv.some((l) => pl.includes(l)) ? "ok" : "bad"; return { key: x.key, title: (q && q.title) || (z && z.title) || x.key, qs: q ? q.status : x.key.startsWith("games:") ? "static" : "missing", lvm }; });
  const problems = (chk.data && chk.data.problems) || [], extra = rows.filter((r) => r.lvm === "bad").map((r) => "لا يناسب عمر/صف الحزمة: " + r.title);
  return { rows, problems: problems.concat(extra) };
}
const scoreEditable = (grp) => (DET.it.status === "in_review" || DET.it.status === "published") && (can() && S.me.roles.includes("library_manager") || (grp === "edu" ? S.me.roles.includes("edu_reviewer") : S.me.roles.includes("design_reviewer")));
function avgOf() { const v = Object.values(card.scores).map(Number); return v.length ? (v.reduce((a, b) => a + b, 0) / v.length).toFixed(1) : null; }
function drawDetail(m) {
  const { it, reviews, log, pack } = DET, st = it.status, lvs = (it.levels || []).map(lvn).join("، ") || "—";
  const crit = CRIT.map(([k, l, g, h]) => {
    const ed = scoreEditable(g), sc = card.scores[k], bl = card.blockers.includes(k), low = sc != null && sc <= 2;
    return `<div class="qc-cr" data-c="${k}"><b>${l}</b><span class="qc-g">${g === "edu" ? "تعليمي" : "تصميم"}</span><div class="mut" style="font-size:12px">${h}</div>
    <div class="qc-sc" role="group" aria-label="${l}">${[1, 2, 3, 4, 5].map((v) => `<button type="button" data-s="${v}" class="${sc === v ? "on" : ""} ${v <= 2 ? "lo" : ""}" ${ed ? "" : "disabled"} aria-pressed="${sc === v}">${AD(v)}</button>`).join("")}</div>
    <label style="font-size:13px"><input type="checkbox" data-bl ${bl ? "checked" : ""} ${ed ? "" : "disabled"}> مشكلة مانعة للنشر (خطأ تعليمي أو سلامة)</label>
    <textarea data-n ${ed ? "" : "disabled"} maxlength="500" placeholder="${sc != null && low || bl ? "اكتب ملاحظة واضحة ومحددة" : "ملاحظة (إلزامية إن لم يجتز المعيار)"}">${esc(card.notes[k] || "")}</textarea></div>`;
  }).join("");
  const a = [];
  const gotoAdm = ADM[it.src] ? `<button class="chip" id="qedit">فتح في إدارة المحتوى للتعديل</button>` : "";
  if (["draft", "needs_changes", "suspended"].includes(st) && can("content_editor")) a.push('<button class="chip pri" id="qsub">إرسال للمراجعة</button>');
  if (st === "in_review" || st === "published") { if (can("edu_reviewer", "design_reviewer")) a.push('<button class="chip pri" id="qsave">حفظ التقييم</button>'); }
  if (st === "in_review" && can("edu_reviewer", "design_reviewer")) a.push('<button class="chip bad" id="qnc">طلب تعديل</button>');
  if (st === "in_review" && can("edu_reviewer")) a.push('<button class="chip pri" id="qacc">اعتماد</button>');
  if (st === "published" && can("edu_reviewer")) a.push('<button class="chip pri" id="qkeep">اجتاز ويبقى منشورًا</button>');
  if (st === "accepted" && can("publisher")) a.push('<button class="chip pri" id="qpub">نشر</button>');
  if (st === "published" && can("publisher", "edu_reviewer", "design_reviewer")) a.push('<button class="chip bad" id="qsus">إيقاف مؤقت</button>');
  const av = avgOf();
  const SRC_ST = { active: "فعّال", needs_review: "يحتاج إلى مراجعة", unapproved: "غير معتمد" }, SRC_RT = { conditions: "وفق شروط محددة", licensed: "مرخّص", quote_limited: "اقتباس ضمن حدود الترخيص", reference_only: "للاطلاع فقط", unclear: "حقوق غير واضحة" }, SRC_USE = { direct: "منقولة مباشرة", rephrased: "أُعيدت صياغتها", derived: "نشاط/استنتاج مبني على المصدر" };
  const sx = DET.sources, smap = new Map(sx.src.map((x) => [x.id, x])), bad = sx.links.filter((l) => { const s_ = smap.get(l.source_id) || {}; return s_.status !== "active" || s_.rights === "unclear" || s_.link_status === "broken"; });
  const srcBox = `<div class="qc-box" style="margin-top:12px" id="qsrc"><b>المصادر والمراجع</b>${sx.err ? '<p class="mut">تعذّر تحميل المصادر.</p>' : ""}
    ${sx.links.length ? "" : '<p class="mut">لا يوجد مصدر موثّق لهذا المورد. غياب التوثيق لا يعني أن المحتوى خاطئ، لكنه يعني أن مصدر معلوماته غير مسجّل.</p>'}
    ${sx.links.some((l) => l.verify) ? '<div class="qc-prob">توجد معلومات يجب التحقق من مصدرها قبل النشر؛ لا يُعتمد المورد حتى يزيل المراجع علامة التحقق.</div>' : ""}${bad.length ? `<div class="qc-prob">${AD(bad.length)} من المصادر غير معتمد أو يحتاج مراجعة أو حقوقه غير واضحة أو رابطه معطّل.</div>` : ""}
    ${sx.links.map((l) => { const s_ = smap.get(l.source_id) || {}; return `<div class="qc-row" style="cursor:default;display:block"><b>${esc(s_.title || "مصدر محذوف")}</b> <span class="qc-f ${s_.status === "active" ? "" : "w"}">${SRC_ST[s_.status] || "—"}</span><span class="qc-f">${SRC_RT[s_.rights] || "—"}</span>${l.verify ? '<span class="qc-f w">ينتظر التحقق</span>' : ""}
      <div style="font-size:13px">${esc(SRC_USE[l.use_type] || l.use_type)}${l.location ? " — " + esc(l.location) : ""}${l.info_used ? "<div>المعلومة: " + esc(l.info_used) + "</div>" : ""}${l.qnote ? '<div class="qc-prob">ملاحظة جودة: ' + esc(l.qnote) + "</div>" : ""}</div>
      ${can("edu_reviewer", "design_reviewer") ? `<div class="qc-acts"><input class="qi" data-sn="${esc(l.id)}" maxlength="400" placeholder="ملاحظة جودة مرتبطة بهذا المصدر" aria-label="ملاحظة جودة" value=""><button class="chip" data-snb="${esc(l.id)}">حفظ الملاحظة</button></div>` : ""}</div>`; }).join("")}
    <p class="mut" style="font-size:12px">وجود مصدر موثّق ليس دليلًا كافيًا على صحة المورد؛ يبقى تقييم المحتوى نفسه مطلوبًا في البطاقة أعلاه.</p>
    <div class="qc-acts">${S.me.roles.length ? '<button class="chip" id="qsrcgo">فتح مركز المصادر</button>' : ""}</div></div>`;
  const FBK = { new: "جديدة", in_review: "قيد المراجعة", need_info: "تحتاج معلومات", accepted: "مقبولة", resolved: "تمت معالجتها", unactionable: "غير قابلة للتنفيذ", duplicate: "مكررة" }, fbOpen = (DET.fb || []).filter((x) => ["new", "in_review", "need_info", "accepted"].includes(x.status));
  const VST = { working: "قيد التعديل", in_review: "تنتظر المراجعة", needs_changes: "تحتاج إلى تعديل", approved: "معتمدة وتنتظر النشر", published: "الحالية", superseded: "سابقة", cancelled: "أُوقف التحديث" };
  const verBox = `<div class="qc-box" style="margin-top:12px" id="qver"><b>سجل النسخ والتحديثات</b>${(DET.ver || []).length ? DET.ver.slice(0, 5).map((v) => `<div class="mut" style="font-size:13px">• النسخة ${AD(v.major + "." + v.minor)} — ${VST[v.status] || v.status}${v.urgent ? " (عاجل)" : ""} — ${esc(v.summary || "")}</div>`).join("") + ((DET.ver || []).length > 5 ? `<div class="mut" style="font-size:12px">و${AD(DET.ver.length - 5)} نسخة أخرى…</div>` : "") : '<p class="mut">لا توجد نسخ مسجّلة؛ يبدأ السجل عند أول تحديث.</p>'}<div class="qc-acts"><button class="chip" id="qvergo">فتح مركز تحديث المحتوى</button></div></div>`;
  const fbBox = (DET.fb || []).length ? `<div class="qc-box" style="margin-top:12px" id="qfb"><b>ملاحظات أولياء الأمور</b>${fbOpen.length ? `<div class="qc-prob">${AD(fbOpen.length)} ملاحظة مفتوحة على هذا المورد؛ راجعها قبل الاعتماد أو إعادة النشر.</div>` : '<p class="mut">لا توجد ملاحظات مفتوحة.</p>'}${DET.fb.map((x) => `<div class="mut" style="font-size:13px">• ${esc(x.ref)} — ${FBK[x.status] || x.status}</div>`).join("")}<div class="qc-acts"><button class="chip" id="qfbgo">فتح ملاحظات أولياء الأمور</button></div></div>` : "";
  const noteBox = ["in_review", "published", "draft", "needs_changes", "suspended"].includes(st) ? `<label class="mut" for="qnote">${st === "published" ? "سبب القرار / الإيقاف" : st === "in_review" ? "التعديل المطلوب (لطلب التعديل) أو ملاحظة" : "ملاحظة تُسجَّل مع الإجراء"}</label><textarea id="qnote" maxlength="400"></textarea>` : "";
  const recheckBox = st === "published" && !it.recheck && can("content_editor", "edu_reviewer", "design_reviewer", "publisher") ? `<div class="qc-acts"><select id="qrs" aria-label="سبب إعادة التقييم">${RECHECK.map((r) => `<option>${r}</option>`).join("")}</select><button class="chip" id="qrc">طلب إعادة تقييم</button></div>` : "";
  const packBox = pack ? `<div class="qc-box" style="margin-top:12px"><b>مراجعة الحزمة كاملة</b>${pack.problems.length ? pack.problems.map((p) => `<div class="qc-prob">${esc(p)}</div>`).join("") : '<div class="qc-ok">كل الموارد منشورة وصالحة ومناسبة لعمر/صف الحزمة وعددها كافٍ.</div>'}
    ${pack.rows.map((r, i) => `<div class="qc-row" style="cursor:default"><div class="t">${AD(i + 1)}. ${esc(r.title)}</div>${r.qs === "static" ? '<span class="qc-f">لعبة ثابتة</span>' : r.qs === "missing" ? '<span class="qc-f w">غير موجود</span>' : badge(r.qs)}${r.lvm === "bad" ? '<span class="qc-f w">لا يناسب المستوى</span>' : ""}</div>`).join("")}
    <p class="mut" style="font-size:12px">لا تُقبل الحزمة ولا تُنشر إلا إذا كان كل مورد فيها منشورًا وصالحًا. ترتيب الموارد والتسلسل التعليمي والهدف يراجعهما المراجع ضمن المعايير أعلاه، وتُعدَّل من «إدارة الحزم».</p></div>` : "";
  const rvH = reviews.length ? reviews.map((r) => `<div class="qc-tl"><b>${{ accepted: "اعتماد", needs_changes: "طلب تعديل", keep: "اجتاز ويبقى منشورًا", suspended: "إيقاف مؤقت" }[r.decision] || r.decision}</b> — الجولة ${AD(r.round)} — ${esc(r.reviewer_name)}<small>${fmt(r.decided_at)} · متوسط داخلي ${r.avg == null ? "—" : AD(r.avg)}</small>
    <small>${CRIT.map(([k, l]) => r.scores && r.scores[k] != null ? `${l}: ${AD(r.scores[k])}${(r.blockers || []).includes(k) ? " (مانع)" : ""}` : "").filter(Boolean).join(" · ")}</small>${Object.entries(r.notes || {}).filter(([, v]) => v).map(([k, v]) => `<small>• ${esc(CNAME[k] || k)}: ${esc(v)}</small>`).join("")}${r.todo ? `<small>المطلوب: ${esc(r.todo)}</small>` : ""}</div>`).join("") : '<p class="mut">لا توجد مراجعات مسجّلة بعد.</p>';
  const lgH = log.map((l) => { const d = l.detail || {}, fields = d.fields ? `<small>الحقول: ${esc(d.fields.join("، "))}</small>` : "", chg = d.changes ? Object.entries(d.changes).slice(0, 6).map(([k, v]) => `<small>${esc(k)}: «${esc(v[0] || "")}» ← «${esc(v[1] || "")}»</small>`).join("") : ""; return `<div class="qc-tl"><b>${EVT[l.event] || l.event}</b>${l.from_status && l.to_status && l.from_status !== l.to_status ? ` (${ST[l.from_status] || ""} ← ${ST[l.to_status] || ""})` : ""}<small>${esc(l.actor_name)} · ${fmt(l.at)}</small>${l.note ? `<small>${esc(l.note)}</small>` : ""}${fields}${chg}</div>`; }).join("") || '<p class="mut">لا يوجد سجل.</p>';
  m.innerHTML = `<style>${CSS}</style><div class="qc"><button class="chip" id="qback">→ رجوع إلى المركز</button>
  <div class="qc-box" style="margin-top:8px"><h3 style="margin:0 0 6px">${esc(it.title || it.slug)} ${badge(st)}${flags(it)}</h3>
  <div class="mut" style="font-size:13px">النوع: ${esc(TYPE[it.src] || it.src)} · العمر/الصف: ${esc(lvs)} · المجال: ${esc(domOf(it.key))} · المراجع: ${esc(it.reviewer || "—")} · تاريخ المراجعة: ${fmt(it.reviewed_at)} · عدد الجولات: ${AD(it.round || 0)}</div>
  ${it.status === "suspended" ? `<div class="qc-prob">موقوف مؤقتًا: ${esc(it.suspend_reason || "")}</div>` : ""}${st === "needs_changes" ? '<div class="qc-prob">يحتاج إلى تعديل — راجع الملاحظات في السجل، عدّل المورد من إدارة المحتوى، ثم أعد إرساله للمراجعة.</div>' : ""}
  ${it.legacy && st === "published" ? '<div class="qc-prob">هذا المورد نُشر قبل تفعيل مركز الجودة ولم تُسجَّل له مراجعة. ابدأ بالتقييم ثم اضغط «اجتاز ويبقى منشورًا» أو أوقفه مؤقتًا.</div>' : ""}</div>
  <div class="qc-det"><div><div class="qc-box"><b>بطاقة التقييم</b> <span class="mut" style="font-size:12px">(الدرجات داخلية للمراجع فقط ولا تُعرض للمستخدم)</span>${crit}
  <label class="mut" for="qsum">ملخص المراجعة</label><textarea id="qsum" maxlength="500" ${scoreEditable("edu") || scoreEditable("dsg") ? "" : "disabled"}>${esc(card.summary || "")}</textarea>
  <p class="mut" style="font-size:13px">المتوسط الداخلي: <b>${av == null ? "—" : AD(av)}</b> — لا يحدد القرار وحده؛ أي معيار أقل من 3 أو مشكلة مانعة يمنع الاعتماد.</p>${noteBox}<div class="qc-acts">${a.join("")}${gotoAdm}</div>${recheckBox}</div>${packBox}${srcBox}${fbBox}${verBox}</div>
  <div><div class="qc-box"><b>المراجعات السابقة</b>${rvH}</div><div class="qc-box" style="margin-top:12px"><b>سجل التغييرات</b>${lgH}</div></div></div></div>`;
  bindDetail(m);
}
function readCard(m) { card.summary = ($("#qsum", m) || {}).value || ""; $$(".qc-cr", m).forEach((r) => { const k = r.dataset.c, t = $("[data-n]", r); if (t && !t.disabled) { const v = t.value.trim(); if (v) card.notes[k] = v; else delete card.notes[k]; } }); }
function bindDetail(m) {
  $("#qback", m).onclick = () => { S.sel = null; S.tab = S.tab === "dash" ? "dash" : "list"; M = m; Promise.all([loadItems(), loadDash()]).then(() => paint(m)); };
  $$(".qc-cr", m).forEach((r) => { const k = r.dataset.c;
    $$("[data-s]", r).forEach((b) => (b.onclick = () => { readCard(m); card.scores[k] = +b.dataset.s; drawDetail(m); }));
    const bl = $("[data-bl]", r); if (bl) bl.onchange = () => { readCard(m); card.blockers = card.blockers.filter((x) => x !== k); if (bl.checked) card.blockers.push(k); drawDetail(m); }; });
  const it = DET.it, key = it.key;
  const run = async (fn, okMsg, keepOpen) => { try { const r = await fn(); if (r.error) return fail(r.error); toast(okMsg); await Promise.all([loadItems(), loadDash()]); await detail(m, key); } catch (e) { fail(e); } };
  const note = () => (($("#qnote", m) || {}).value || "").trim();
  const sv = () => { readCard(m); /* يُرسل فقط ما يملك المراجع صلاحيته؛ القاعدة ترفض غيره */
    const allow = (g) => scoreEditable(g), sc = {}, nt = {}, bl = [];
    CRIT.forEach(([k, , g]) => { if (!allow(g)) return; if (card.scores[k] != null) sc[k] = card.scores[k]; nt[k] = card.notes[k] || ""; if (card.blockers.includes(k)) bl.push(k); });
    return sb.rpc("quality_card_save", { p_key: key, p_scores: sc, p_notes: nt, p_blockers: bl, p_summary: card.summary }); };
  const b = (id, f) => { const e = $(id, m); if (e) e.onclick = f; };
  b("#qvergo", () => { S.sel = null; window.__verOpen = key; window.__go("versionsadm"); });
  b("#qfbgo", () => { S.sel = null; window.__fbFilter = { res: key }; window.__go("feedbackadm"); });
  b("#qsrcgo", () => { S.sel = null; window.__go("sourcesadm"); });
  $$("[data-snb]", m).forEach((bt) => (bt.onclick = () => { const v = (($(`[data-sn="${bt.dataset.snb}"]`, m) || {}).value || "").trim(); if (!v) return toast("اكتب الملاحظة أولًا"); run(() => sb.rpc("src_note", { p_link: bt.dataset.snb, p_note: v }), "حُفظت ملاحظة المصدر"); }));
  b("#qedit", () => { S.sel = null; window.__go(ADM[it.src]); });
  b("#qsub", () => run(() => sb.rpc("quality_submit", { p_key: key, p_note: note() }), "أُرسل للمراجعة"));
  b("#qsave", () => run(sv, "حُفظ التقييم"));
  b("#qnc", async () => { const r = await sv(); if (r.error) return fail(r.error); run(() => sb.rpc("quality_decide", { p_key: key, p_decision: "needs_changes", p_note: note() }), "أُعيد المورد إلى «يحتاج إلى تعديل»"); });
  b("#qacc", async () => { const r = await sv(); if (r.error) return fail(r.error); run(() => sb.rpc("quality_decide", { p_key: key, p_decision: "accepted", p_note: note() }), "اعتُمد المورد (لم يُنشر بعد)"); });
  b("#qkeep", async () => { const r = await sv(); if (r.error) return fail(r.error); run(() => sb.rpc("quality_decide", { p_key: key, p_decision: "keep", p_note: note() }), "اجتاز المورد المراجعة ويبقى منشورًا"); });
  b("#qpub", () => run(() => sb.rpc("quality_publish", { p_key: key }), "نُشر المورد"));
  b("#qsus", () => run(() => sb.rpc("quality_decide", { p_key: key, p_decision: "suspended", p_note: note() }), "أُوقف المورد مؤقتًا"));
  b("#qrc", () => run(() => sb.rpc("quality_recheck", { p_key: key, p_reason: ($("#qrs", m) || {}).value }), "طُلبت إعادة التقييم"));
}

/* ---------- الأدوار ---------- */
async function rolesView(m) {
  const r = await sb.rpc("quality_staff"); if (r.error) { $(".qc", m).insertAdjacentHTML("beforeend", `<p class="mut">${esc(clean(r.error))}</p>`); return; }
  S.staff = r.data || [];
  const box = $(".qc", m), tail = `<div id="qroles"><p class="mut">كل مشرف في اللوحة بلا دور محدد يُعدّ «مدير المكتبة». يمكن إعطاء أي مشرف دورًا أو أكثر؛ ويجب أن يبقى مدير مكتبة واحد على الأقل. إضافة مشرف جديد للوحة تتم من حساباته، ثم تُحدَّد أدواره هنا. كل تغيير في الأدوار يُسجَّل.</p>
  ${S.staff.map((u, i) => `<div class="qc-box" style="margin:8px 0" data-u="${esc(u.id)}"><b>مشرف ${AD(i + 1)} <span class="mut">(…${esc(String(u.id).slice(-4))})</span></b><div style="margin:6px 0"><input class="qi" data-nm maxlength="40" placeholder="الاسم الظاهر في سجل المراجعات" value="${esc(u.name)}" aria-label="الاسم"></div>
  <div>${ROLES.map(([k, l, d]) => `<label style="display:block;font-size:14px"><input type="checkbox" data-r="${k}" ${u.roles.includes(k) ? "checked" : ""}> ${l} <span class="mut" style="font-size:12px">— ${d}</span></label>`).join("")}</div><div class="qc-acts"><button class="chip pri" data-save>حفظ</button></div></div>`).join("")}</div>`;
  const old = $("#qroles", m); if (old) old.remove(); box.insertAdjacentHTML("beforeend", tail);
  $$("#qroles [data-u]", m).forEach((row) => { $("[data-save]", row).onclick = async () => { const roles = $$("[data-r]", row).filter((c) => c.checked).map((c) => c.dataset.r); const res = await sb.rpc("quality_roles_set", { p_user: row.dataset.u, p_name: $("[data-nm]", row).value.trim(), p_roles: roles }); if (res.error) return fail(res.error); toast("حُفظت الأدوار"); await loadMe(); rolesView(m); }; });
}

window.__qualityTest = { clean, can, filtered, S, CRIT, ST };
})();
