/* مركز إدارة مصادر المحتوى والمراجع التعليمية — لوحة الإدارة.
   توثيق مصدر كل معلومة وربطه بالموارد. القواعد مفروضة في قاعدة البيانات (الواجهة لا تكفي):
   لا يُعتمد مصدر دون مراجعة موثوقية مكتملة وحقوق استخدام واضحة، والحذف لمدير المكتبة مع أرشفة نسخة، وتغيّر بيانات مؤثرة يعيد المصدر للمراجعة.
   وجود مصدر موثّق لا يُعدّ دليلًا كافيًا على صحة المورد، ولا يُحدَّث أي محتوى تلقائيًا بسبب تغيّر مصدر. النطاق: من سنة إلى 6 سنوات والصفوف 1–4. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const F = () => window.ZFIND;

const KIND = { book: "كتاب تعليمي", reference: "مرجع تربوي", curriculum: "منهج أو وثيقة تعليمية رسمية", website: "موقع تعليمي موثوق", article: "مقال علمي أو تربوي", early_childhood: "تعليم الطفولة المبكرة", literacy: "تعليم القراءة والكتابة", math: "الرياضيات الأساسية", science: "العلوم والاستكشاف", play: "التعلم باللعب والأنشطة العملية" };
const ST = { active: "فعّال", needs_review: "يحتاج إلى مراجعة", unapproved: "غير معتمد" };
const STC = { active: "#1f9a63", needs_review: "#d9822b", unapproved: "#c62f4a" };
const RIGHTS = { conditions: "متاح للاستخدام وفق شروط محددة", licensed: "محتوى مرخّص", quote_limited: "يُسمح بالاقتباس ضمن حدود الترخيص", reference_only: "للاطلاع والاستناد المعرفي فقط", unclear: "حقوق الاستخدام غير واضحة وتحتاج مراجعة" };
const LINKST = { unchecked: "لم يُفحص", ok: "يعمل", broken: "معطّل", unverified: "تعذّر التحقق آليًا" };
const LANG = { ar: "العربية", en: "الإنجليزية", other: "لغة أخرى", unknown: "غير معروفة" };
const USE = { direct: "معلومة منقولة مباشرة", rephrased: "معلومة أعاد فريق زاد صياغتها", derived: "نشاط أو استنتاج أُعدّ اعتمادًا على المصدر" };
const TYPE = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع أو تحدٍّ", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف وتجارب", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", pack: "حزمة تعليمية" };
const QST = { draft: "مسودة", in_review: "قيد المراجعة", needs_changes: "يحتاج إلى تعديل", accepted: "مقبول", published: "منشور", suspended: "موقوف مؤقتًا" };
const CHK = [["publisher", "هل الجهة الناشرة معروفة أو موثوقة؟", "yn"], ["field", "هل المصدر مناسب للمجال التعليمي؟", "yn"], ["recent", "هل المعلومات حديثة بما يكفي للموضوع؟", "yn"], ["verifiable", "هل يمكن التحقق من المعلومات الواردة فيه؟", "yn"], ["age", "هل يتناسب مع الفئة العمرية المستهدفة؟", "yn"], ["restrictions", "هل توجد قيود على استخدام المحتوى؟", "info"], ["specialist", "هل يحتاج إلى مراجعة من مختص؟", "info"]];
const LVN0 = { a2: "سنة إلى سنتين", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const LV_OK = Object.keys(LVN0);
const lvn = (l) => ((F() && F().LVN) || {})[l] || LVN0[l] || l;
const EVT = { created: "أُضيف المصدر", edited: "تعديل بيانات", status: "تغيّرت الحالة", linked: "رُبط بمورد", link_edit: "تعديل ربط", unlinked: "أُزيل الربط", quality_note: "ملاحظة جودة", link_check: "فحص الرابط", deleted: "حُذف" };
const PAGE = 30;

const S = { tab: "list", me: { roles: [] }, src: [], links: [], q: [], f: { q: "", author: "", kind: "", dom: "", lv: "", st: "", rights: "", res: "" }, page: 0, sel: null };
let M = null, DET = null;
const clean = (e) => String((e && e.message) || e || "").replace(/^(QUALITY_PERM|QUALITY_GATE|SRC_CONFIRM):\s*/, "");
const fail = (e) => { console.error(e); toast(clean(e) || "تعذّر تنفيذ الطلب. حاول مرة ثانية"); };
const can = (...r) => S.me.roles.includes("library_manager") || r.some((x) => S.me.roles.includes(x));
const isRev = () => can("edu_reviewer");
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const fmt = (d) => { try { return d ? new Date(d).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }) : "—"; } catch (e) { return "—"; } };
const unk = (v) => (v ? esc(v) : '<span class="mut">غير معروف</span>');
const today = () => new Date().toISOString().slice(0, 10);
const askQ = (m, ok) => (Z.ask ? Z.ask(m, ok) : Promise.resolve(window.confirm(m)));
const domName = (s) => { const f = F(); const d = f && f.X && (f.X.doms || []).find((x) => x.slug === s); return d ? d.title : s ? (s === "other" ? "متنوع" : s) : "—"; };
const doms = () => { const f = F(); return f && f.X && f.X.doms && f.X.doms.length ? f.X.doms.map((d) => [d.slug, d.title]) : []; };
const badge = (s) => `<span class="sc-b" style="background:${STC[s]}">${ST[s] || s}</span>`;
const linksOf = (id) => S.links.filter((l) => l.source_id === id);
const qmap = () => new Map(S.q.map((i) => [i.key, i]));
const overdue = (s) => s.next_review && s.next_review < today();
const pubLinked = (s) => { const q = qmap(); return linksOf(s.id).filter((l) => (q.get(l.item_key) || {}).status === "published"); };

const CSS = `.sc *{box-sizing:border-box}.sc{--p:#6b3fd4}.sc-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.sc-tabs .chip.on{background:var(--p);color:#fff}
.sc-b{color:#fff;border-radius:99px;padding:2px 10px;font-size:12px;white-space:nowrap}.sc-f{display:inline-block;border:1px solid #e9a46a;background:#ffeede;color:#8a4700;border-radius:8px;padding:1px 8px;font-size:12px;margin-inline-start:6px}.sc-f.ok{border-color:#a9dcc3;background:#e9f8f0;color:#146c45}.sc-f.g{border-color:#ccc;background:#f2f2f2;color:#555}
.sc-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border:1px solid #e3dcf6;border-radius:12px;padding:10px;margin:6px 0;background:#fff;cursor:pointer}.sc-row .t{flex:1 1 220px;min-width:0;font-weight:600}.sc-row .m{font-size:12px;color:#666;font-weight:400}
.sc-box{border:1px solid #e3dcf6;border-radius:14px;padding:12px;background:#fff;margin:10px 0}.sc-filters{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px;margin:8px 0}
.sc input,.sc select,.sc textarea{font:inherit;border:1px solid #cfc4ee;border-radius:10px;padding:8px;background:#fff;max-width:100%;width:100%}.sc input[type=checkbox]{width:auto}.sc textarea{min-height:60px}
.sc-form{display:grid;gap:10px;grid-template-columns:repeat(auto-fill,minmax(240px,1fr))}.sc-form label{display:block;font-size:13px;color:#444}.sc-form .w{grid-column:1/-1}
.sc-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.sc-acts .chip{cursor:pointer}.sc-acts .chip.pri{background:var(--p);color:#fff}.sc-acts .chip.bad{background:#c62f4a;color:#fff}
.sc-det{display:grid;gap:14px}@media(min-width:900px){.sc-det{grid-template-columns:3fr 2fr}}.sc-tl{border-inline-start:3px solid #d9ccf7;padding:2px 10px;margin:8px 0;font-size:13px}.sc-tl small{color:#666;display:block}
.sc-warn{background:#ffeef0;border:1px solid #f1b3bb;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}.sc-ok{background:#e9f8f0;border:1px solid #a9dcc3;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}.sc-ck{display:grid;grid-template-columns:1fr 120px;gap:8px;align-items:center;border-top:1px solid #eee;padding:6px 0}`;

/* ---------- التحميل ---------- */
async function loadAll() {
  const [me, s, l, q] = await Promise.all([sb.rpc("quality_my"), sb.from("src_sources").select("*").order("updated_at", { ascending: false }).limit(3000), sb.from("src_links").select("*").limit(10000), sb.from("quality_items").select("key,title,src,status,levels,gone").eq("gone", false).limit(5000)]);
  S.me = me.error || !me.data ? { roles: [] } : me.data; S.src = s.data || []; S.links = l.data || []; S.q = q.data || [];
  if (s.error || l.error) toast("تعذّر تحميل المصادر");
  return !me.error;
}
SUB.sourcesadm = { title: "مركز المصادر والمراجع", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  if (F() && F().load) await F().load().catch(() => {});
  const ok = await loadAll();
  if (!ok || !S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى مركز المصادر.</p>'; return; }
  if (S.sel) return detail(m, S.sel);
  paint(m);
} };
function shell(inner) {
  return `<style>${CSS}</style><div class="sc"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <p class="mut">يوثّق هذا المركز مصدر كل معلومة تعليمية ويربطها بالموارد. لا يُعدّ كل رابط مرجعًا موثوقًا، ولا يُعتمد مصدر قبل مراجعة موثوقيته ووضوح حقوق استخدامه. وجود مصدر موثّق لا يغني عن مراجعة محتوى المورد، ولا يتغير أي محتوى تلقائيًا بتغيّر مصدره. النطاق: من سنة إلى 6 سنوات والصفوف 1–4.</p>
  <div class="sc-tabs" id="sctabs">${[["list", "المصادر"], ["alerts", "تنبيهات المراجعة"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}${k === "alerts" ? " (" + AD(alertCount()) + ")" : ""}</button>`).join("")}</div>${inner}</div>`;
}
function paint(m) {
  m = m || M; S.sel = null; m.innerHTML = shell(S.tab === "alerts" ? alertsHtml() : listHtml());
  $$("#sctabs [data-t]", m).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; paint(m); }));
  if (S.tab === "alerts") bindRows(m); else bindList(m);
}

/* ---------- القائمة والبحث ---------- */
function filtered() {
  const f = S.f, q = f.q.trim().toLowerCase(), au = f.author.trim().toLowerCase(), rs = f.res.trim().toLowerCase(), qm = qmap();
  return S.src.filter((s) => (!q || s.title.toLowerCase().includes(q)) && (!au || (s.author || "").toLowerCase().includes(au) || (s.publisher || "").toLowerCase().includes(au)) && (!f.kind || s.kind === f.kind) && (!f.dom || s.dom === f.dom)
    && (!f.lv || (s.levels || []).includes(f.lv)) && (!f.st || s.status === f.st) && (!f.rights || s.rights === f.rights)
    && (!rs || linksOf(s.id).some((l) => ((qm.get(l.item_key) || {}).title || l.item_key).toLowerCase().includes(rs))));
}
const rowHtml = (s) => { const n = linksOf(s.id).length, np = pubLinked(s).length;
  return `<div class="sc-row" data-o="${esc(s.id)}" role="button" tabindex="0"><div class="t">${esc(s.title)}<div class="m">${esc(s.author || "المؤلف غير معروف")} · ${esc(KIND[s.kind] || s.kind)}${s.levels && s.levels.length ? " · " + esc(s.levels.map(lvn).join("، ")) : ""}</div></div>${badge(s.status)}
  <span class="sc-f ${s.rights === "unclear" ? "" : "g"}">${esc(RIGHTS[s.rights] || s.rights)}</span>${s.link_status === "broken" ? '<span class="sc-f">الرابط معطّل</span>' : ""}${overdue(s) ? '<span class="sc-f">موعد المراجعة متأخر</span>' : ""}<span class="sc-f g">${AD(n)} مورد${np ? " (" + AD(np) + " منشور)" : ""}</span></div>`; };
function listHtml() {
  const f = S.f, rows = filtered(), pages = Math.max(1, Math.ceil(rows.length / PAGE)); if (S.page >= pages) S.page = pages - 1;
  const opt = (obj, cur, all) => `<option value="">${all}</option>` + Object.entries(obj).map(([k, l]) => `<option value="${k}" ${cur === k ? "selected" : ""}>${l}</option>`).join("");
  return `<div class="sc-acts" style="margin-top:0">${can("content_editor", "edu_reviewer") ? '<button class="chip pri" id="scnew">+ مصدر جديد</button>' : ""}<button class="chip" id="scexp" ${rows.length ? "" : "disabled"}>تصدير القائمة (CSV)</button></div>
  <div class="sc-filters"><input id="fq" type="search" placeholder="عنوان المصدر" value="${esc(f.q)}" aria-label="عنوان المصدر"><input id="fa" type="search" placeholder="المؤلف أو الجهة" value="${esc(f.author)}" aria-label="المؤلف أو الجهة">
  <select id="fk" aria-label="النوع">${opt(KIND, f.kind, "كل الأنواع")}</select><select id="fd" aria-label="المجال"><option value="">كل المجالات</option>${doms().map(([k, l]) => `<option value="${esc(k)}" ${f.dom === k ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>
  <select id="fl" aria-label="العمر أو الصف"><option value="">كل الأعمار والصفوف</option>${LV_OK.map((k) => `<option value="${k}" ${f.lv === k ? "selected" : ""}>${lvn(k)}</option>`).join("")}</select><select id="fs" aria-label="الحالة">${opt(ST, f.st, "كل الحالات")}</select>
  <select id="fr" aria-label="حقوق الاستخدام">${opt(RIGHTS, f.rights, "كل حالات الحقوق")}</select><input id="fres" type="search" placeholder="المورد المرتبط بالمصدر" value="${esc(f.res)}" aria-label="المورد المرتبط"></div>
  <p class="mut">${AD(rows.length)} مصدر${S.src.length ? "" : " — لا توجد مصادر مسجّلة بعد. يضيف الفريق مصادره الحقيقية من «مصدر جديد»؛ لا تُملأ هذه القائمة ببيانات افتراضية."}</p>
  <div>${rows.slice(S.page * PAGE, S.page * PAGE + PAGE).map(rowHtml).join("")}</div>
  <div class="sc-acts"><button class="chip" id="sprev" ${S.page === 0 ? "disabled" : ""}>السابق</button><span class="mut">صفحة ${AD(S.page + 1)} من ${AD(pages)}</span><button class="chip" id="snext" ${S.page >= pages - 1 ? "disabled" : ""}>التالي</button></div>`;
}
function bindList(m) {
  const re = () => { const id = document.activeElement && document.activeElement.id; S.page = 0; paint(m); if (id) { const e = $("#" + id, m); if (e) { e.focus(); try { e.setSelectionRange(e.value.length, e.value.length); } catch (x) { /* */ } } } };
  let t; const txt = (sel, k) => ($(sel, m).oninput = (e) => { S.f[k] = e.target.value; clearTimeout(t); t = setTimeout(re, 200); });
  txt("#fq", "q"); txt("#fa", "author"); txt("#fres", "res");
  [["#fk", "kind"], ["#fd", "dom"], ["#fl", "lv"], ["#fs", "st"], ["#fr", "rights"]].forEach(([s, k]) => ($(s, m).onchange = (e) => { S.f[k] = e.target.value; re(); }));
  $("#sprev", m).onclick = () => { S.page--; paint(m); }; $("#snext", m).onclick = () => { S.page++; paint(m); };
  const nb = $("#scnew", m); if (nb) nb.onclick = () => detail(m, "new");
  $("#scexp", m).onclick = () => exportCsv();
  bindRows(m);
}
function bindRows(m) { $$("[data-o]", m).forEach((r) => { const open = () => detail(m, r.dataset.o); r.onclick = open; r.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }; }); }

/* تصدير CSV: البيانات المعروضة فقط، مع تحييد الخلايا التي تبدأ برموز معادلات */
const cell = (v) => { let s = String(v == null ? "" : v).replace(/\r?\n/g, " "); if (/^[=+\-@\t]/.test(s)) s = "'" + s; return '"' + s.replace(/"/g, '""') + '"'; };
function csvText(rows) {
  const head = ["العنوان", "المؤلف أو الجهة", "النوع", "الناشر", "تاريخ النشر", "آخر تحديث", "الرابط", "الإصدار", "اللغة", "المجال", "العمر أو الصف", "الحالة", "حقوق الاستخدام", "شروط الترخيص", "حالة الرابط", "آخر مراجعة", "موعد المراجعة", "عدد الموارد المرتبطة"];
  const body = rows.map((s) => [s.title, s.author, KIND[s.kind], s.publisher, s.pub_date, s.upd_date, s.url, s.edition, LANG[s.lang], domName(s.dom), (s.levels || []).map(lvn).join("، "), ST[s.status], RIGHTS[s.rights], s.rights_terms, LINKST[s.link_status], s.last_review, s.next_review, linksOf(s.id).length].map(cell).join(","));
  return "﻿" + [head.map(cell).join(",")].concat(body).join("\r\n");
}
function exportCsv() {
  try { const b = new Blob([csvText(filtered())], { type: "text/csv;charset=utf-8" }), a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "zad-sources-" + today() + ".csv"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); toast("تم تصدير القائمة"); } catch (e) { fail(e); }
}

/* ---------- التنبيهات (أرقام حقيقية من البيانات) ---------- */
function alertSets() {
  const qm = qmap(), by = (fn) => S.src.filter(fn), withLinks = new Set(S.links.map((l) => l.item_key));
  return [
    ["معتمد أو غير معتمد؟ مصادر غير فعّالة مرتبطة بموارد منشورة", by((s) => s.status !== "active" && pubLinked(s).length), "راجعها أولًا: موارد منشورة تعتمد على مصدر غير معتمد."],
    ["روابط معطّلة", by((s) => s.link_status === "broken"), "الرابط لم يعد يعمل؛ تُراجَع الموارد المرتبطة يدويًا."],
    ["موعد المراجعة متأخر", by(overdue), "حان موعد المراجعة المقترح."],
    ["حقوق الاستخدام غير واضحة", by((s) => s.rights === "unclear"), "حدّد الحقوق قبل الاعتماد."],
    ["تحتاج إلى مراجعة", by((s) => s.status === "needs_review"), "لم تكتمل مراجعة موثوقيتها."]
  ].map(([t, rows, h]) => ({ t, rows, h })).concat([{ t: "معلومات تنتظر التحقق من مصدرها قبل النشر", h: "تمنع اعتماد المورد حتى يزيل المراجع علامة التحقق.", rows: [], vlinks: S.links.filter((l) => l.verify) },
    { t: "موارد منشورة بلا أي مصدر موثّق", h: "معلومة فقط: غياب التوثيق لا يعني خطأ المحتوى.", rows: [], nosrc: S.q.filter((i) => i.status === "published" && !withLinks.has(i.key)) }]);
}
const alertCount = () => { const a = alertSets(); return a.slice(0, 5).reduce((n, x) => n + x.rows.length, 0) + a[5].vlinks.length; };
function alertsHtml() {
  const qm = qmap(), sm = new Map(S.src.map((s) => [s.id, s]));
  return alertSets().map((a) => {
    let body;
    if (a.vlinks) body = a.vlinks.map((l) => `<div class="sc-row" data-o="${esc(l.source_id)}"><div class="t">${esc((qm.get(l.item_key) || {}).title || l.item_key)}<div class="m">المصدر: ${esc((sm.get(l.source_id) || {}).title || "—")}</div></div></div>`).join("");
    else if (a.nosrc) body = (a.nosrc.length ? `<p class="mut">${AD(a.nosrc.length)} مورد منشور بلا مصدر موثّق${a.nosrc.length > 25 ? " (يظهر أول 25)" : ""}.</p>` + a.nosrc.slice(0, 25).map((i) => `<div class="m" style="font-size:13px">• ${esc(i.title)} <span class="mut">(${esc(TYPE[i.src] || i.src)})</span></div>`).join("") : "");
    else body = a.rows.map(rowHtml).join("");
    const n = a.vlinks ? a.vlinks.length : a.nosrc ? a.nosrc.length : a.rows.length;
    return `<div class="sc-box"><b>${esc(a.t)} — ${AD(n)}</b><div class="mut" style="font-size:12px">${esc(a.h)}</div>${n ? body : '<p class="mut">لا شيء حاليًا.</p>'}</div>`;
  }).join("");
}

/* ---------- صفحة المصدر ---------- */
const blank = () => ({ id: null, title: "", author: "", kind: "book", publisher: "", pub_date: "", upd_date: "", url: "", edition: "", lang: "unknown", dom: "", levels: [], summary: "", team_notes: "", status: "needs_review", rights: "unclear", rights_terms: "", checklist: {}, next_review: "", review_note: "", link_status: "unchecked", link_checked_at: null, last_review: null });
async function detail(m, id) {
  S.sel = id; const s = id === "new" ? blank() : S.src.find((x) => x.id === id);
  if (!s) { S.sel = null; return paint(m); }
  const lg = id === "new" ? { data: [] } : await sb.from("src_log").select("*").eq("source_id", id).order("at", { ascending: false }).limit(100);
  DET = { s: JSON.parse(JSON.stringify(s)), log: lg.data || [], addRes: [] };
  draw(m);
}
const val = (m, sel) => (($(sel, m) || {}).value || "").trim();
function readForm(m) {
  const d = DET.s; ["title", "author", "publisher", "pub_date", "upd_date", "url", "edition", "summary", "team_notes", "rights_terms", "next_review", "review_note"].forEach((k) => { const e = $("#f_" + k, m); if (e) d[k] = e.value.trim(); });
  ["kind", "lang", "dom", "rights", "status"].forEach((k) => { const e = $("#f_" + k, m); if (e && !e.disabled) d[k] = e.value; });
  d.levels = $$("[data-lv]", m).filter((c) => c.checked).map((c) => c.dataset.lv);
  $$("[data-ck]", m).forEach((e) => { if (!e.disabled) d.checklist[e.dataset.ck] = e.value; });
}
function draw(m) {
  const s = DET.s, isNew = !s.id, rev = isRev(), links = isNew ? [] : linksOf(s.id), qm = qmap();
  const sel = (id, obj, cur, dis, blank_) => `<select id="${id}" ${dis ? "disabled" : ""}>${blank_ ? `<option value="">${blank_}</option>` : ""}${Object.entries(obj).map(([k, l]) => `<option value="${k}" ${cur === k ? "selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const ck = CHK.map(([k, q, t]) => { const v = (s.checklist || {})[k] || "unknown";
    return `<div class="sc-ck"><span>${esc(q)}</span><select data-ck="${k}" ${rev ? "" : "disabled"} aria-label="${esc(q)}"><option value="unknown" ${v === "unknown" ? "selected" : ""}>غير محدد</option><option value="yes" ${v === "yes" ? "selected" : ""}>نعم</option><option value="no" ${v === "no" ? "selected" : ""}>لا</option></select></div>`; }).join("");
  const warn = [];
  if (!isNew) { if (s.status !== "active" && pubLinked(s).length) warn.push(`هذا المصدر غير فعّال ويستند إليه ${AD(pubLinked(s).length)} مورد منشور؛ راجع تلك الموارد.`); if (s.link_status === "broken") warn.push("الرابط الإلكتروني معطّل."); if (overdue(s)) warn.push("موعد المراجعة المقترح متأخر."); if (s.rights === "unclear") warn.push("حقوق الاستخدام غير واضحة؛ لا تُنسخ محتويات هذا المصدر قبل توضيحها."); }
  const lk = links.map((l) => { const q = qm.get(l.item_key) || {}; return `<div class="sc-box" data-l="${esc(l.id)}"><b>${esc(q.title || l.item_key)}</b> <span class="sc-f g">${esc(TYPE[q.src] || "")}</span><span class="sc-f g">${esc(QST[q.status] || "—")}</span>${l.verify ? '<span class="sc-f">ينتظر التحقق قبل النشر</span>' : ""}${l.needs_review ? '<span class="sc-f">يحتاج مراجعة إضافية</span>' : ""}
    <div style="font-size:13px;margin-top:4px"><b>${esc(USE[l.use_type] || l.use_type)}</b>${l.location ? " — " + esc(l.location) : ""}${l.info_used ? `<div>المعلومة: ${esc(l.info_used)}</div>` : ""}${l.changes ? `<div>تعديلات فريق زاد: ${esc(l.changes)}</div>` : ""}${l.qnote ? `<div class="sc-warn">ملاحظة جودة: ${esc(l.qnote)}</div>` : ""}</div>
    <div class="sc-acts"><button class="chip" data-le="${esc(l.id)}">تعديل الربط</button>${can("content_editor", "edu_reviewer") ? `<button class="chip bad" data-lr="${esc(l.id)}">إزالة الربط</button>` : ""}</div></div>`; }).join("") || '<p class="mut">لا توجد موارد مرتبطة بهذا المصدر بعد.</p>';
  const lg = DET.log.map((l) => { const d = l.detail || {}; return `<div class="sc-tl"><b>${EVT[l.event] || esc(l.event)}</b><small>${esc(l.actor_name)} · ${fmt(l.at)}</small>${l.note ? `<small>${esc(l.note)}</small>` : ""}${d.fields ? `<small>الحقول: ${esc(d.fields.join("، "))}</small>` : ""}</div>`; }).join("") || '<p class="mut">لا يوجد سجل.</p>';
  const lvChips = LV_OK.map((k) => `<label style="display:inline-block;margin:2px 8px 2px 0"><input type="checkbox" data-lv="${k}" ${(s.levels || []).includes(k) ? "checked" : ""}> ${lvn(k)}</label>`).join("");
  const domOpts = doms();
  m.innerHTML = `<style>${CSS}</style><div class="sc"><button class="chip" id="sback">→ رجوع إلى المركز</button>
  <div class="sc-box"><h3 style="margin:0 0 6px">${isNew ? "مصدر جديد" : esc(s.title)} ${isNew ? "" : badge(s.status)}</h3>${warn.map((w) => `<div class="sc-warn">${esc(w)}</div>`).join("")}${!isNew && s.status === "active" ? '<div class="sc-ok">مصدر فعّال. لا يغني ذلك عن مراجعة محتوى كل مورد يستند إليه.</div>' : ""}
  <div class="mut" style="font-size:12px">لا تُدخل بيانات غير معروفة على أنها حقائق: اترك الحقل فارغًا ليظهر «غير معروف».</div></div>
  <div class="sc-det"><div><div class="sc-box"><div class="sc-form">
   <label class="w">عنوان المصدر *<input id="f_title" maxlength="200" value="${esc(s.title)}"></label>
   <label>المؤلف أو الجهة المسؤولة<input id="f_author" maxlength="200" value="${esc(s.author || "")}"></label><label>نوع المصدر *${sel("f_kind", KIND, s.kind)}</label>
   <label>الناشر<input id="f_publisher" maxlength="200" value="${esc(s.publisher || "")}"></label><label>الإصدار أو الطبعة<input id="f_edition" maxlength="100" value="${esc(s.edition || "")}"></label>
   <label>تاريخ النشر (سنة أو YYYY-MM-DD)<input id="f_pub_date" placeholder="مثال: 2019" value="${esc(s.pub_date || "")}"></label><label>تاريخ آخر تحديث<input id="f_upd_date" placeholder="مثال: 2023-05" value="${esc(s.upd_date || "")}"></label>
   <label class="w">رابط المصدر (https فقط)<input id="f_url" dir="ltr" maxlength="500" value="${esc(s.url || "")}"></label>
   <label>اللغة${sel("f_lang", LANG, s.lang)}</label><label>المجال التعليمي<select id="f_dom"><option value="">غير محدد</option>${domOpts.map(([k, l]) => `<option value="${esc(k)}" ${s.dom === k ? "selected" : ""}>${esc(l)}</option>`).join("")}${domOpts.length ? "" : '<option value="other">متنوع</option>'}</select></label>
   <div class="w"><span style="font-size:13px;color:#444">العمر أو الصف الذي يخدمه</span><div>${lvChips}</div></div>
   <label class="w">ملخص مختصر عن المحتوى<textarea id="f_summary" maxlength="1000">${esc(s.summary || "")}</textarea></label><label class="w">ملاحظات فريق زاد<textarea id="f_team_notes" maxlength="1000">${esc(s.team_notes || "")}</textarea></label>
   <label class="w">حقوق الاستخدام ${sel("f_rights", RIGHTS, s.rights)}</label><label class="w">شروط الترخيص (عند توفرها)<textarea id="f_rights_terms" maxlength="1000">${esc(s.rights_terms || "")}</textarea></label>
   <div class="sc-warn w" style="grid-column:1/-1">وجود رابط عام لا يعني أن محتوياته متاحة لإعادة النشر أو التوزيع. لا تُنسخ كتب أو صور أو أوراق عمل محمية دون إذن أو أساس قانوني.</div></div></div>
  <div class="sc-box"><b>مراجعة الموثوقية</b> <span class="mut" style="font-size:12px">${rev ? "" : "(للمراجع التعليمي أو مدير المكتبة)"}</span>${ck}
   <div class="sc-form" style="margin-top:8px"><label>الحالة ${sel("f_status", ST, s.status, !rev || isNew)}</label><label>موعد المراجعة المقترح<input id="f_next_review" type="date" value="${esc(s.next_review || "")}" ${rev ? "" : "disabled"}></label>
   <label class="w">ملاحظة المراجعة / سبب عدم الاعتماد<textarea id="f_review_note" maxlength="500" ${rev ? "" : "disabled"}>${esc(s.review_note || "")}</textarea></label></div>
   <div class="mut" style="font-size:12px">آخر مراجعة: ${s.last_review ? esc(s.last_review) : "لم تتم"} · لا يُعتمد المصدر بسبب كثرة معلوماته أو تصميمه الجذاب؛ الاعتماد يتطلب: مؤلف/جهة معروفة، قائمة الموثوقية مكتملة وبلا «لا»، حقوق واضحة، ورابط غير معطّل.</div></div>
  ${isNew ? "" : `<div class="sc-box"><b>الرابط الإلكتروني</b> — <span class="sc-f ${s.link_status === "ok" ? "ok" : s.link_status === "broken" ? "" : "g"}">${LINKST[s.link_status] || s.link_status}</span> <span class="mut" style="font-size:12px">${s.link_checked_at ? "آخر فحص " + fmt(s.link_checked_at) : ""}</span>
   ${s.url ? '<div class="sc-acts"><button class="chip" id="schk">فحص الرابط الآن</button></div><div class="mut" style="font-size:12px">الفحص آلي ويتعذّر على بعض المواقع؛ «تعذّر التحقق» ليس معناه أن الرابط معطّل.</div>' : '<p class="mut">لا يوجد رابط.</p>'}</div>`}
  <div class="sc-acts"><button class="chip pri" id="ssave">${isNew ? "إضافة المصدر" : "حفظ التعديلات"}</button>${!isNew && can() && S.me.roles.includes("library_manager") ? '<button class="chip bad" id="sdel">حذف المصدر</button>' : ""}</div></div>
  <div>${isNew ? "" : `<div class="sc-box"><b>الموارد المرتبطة (${AD(links.length)})</b>${lk}${can("content_editor", "edu_reviewer") ? `<div class="sc-box" id="addbox"><b>ربط بمورد</b><div class="sc-form"><label class="w">ابحث عن المورد باسمه<input id="lq" type="search" placeholder="اكتب حرفين على الأقل"></label><div class="w" id="lres"></div>
   <label>نوع الاستفادة${sel("l_use", USE, "rephrased")}</label><label>الجزء أو الفصل أو الصفحة<input id="l_loc" maxlength="200"></label><label class="w">ما المعلومات التي أُخذت من المصدر<textarea id="l_info" maxlength="1000"></textarea></label><label class="w">تعديلات فريق زاد<textarea id="l_chg" maxlength="1000"></textarea></label>
   <label class="w"><input type="checkbox" id="l_nr"> يحتاج المصدر إلى مراجعة إضافية</label><label class="w"><input type="checkbox" id="l_vf"> توجد معلومات يجب التحقق منها قبل النشر</label></div><div class="sc-acts"><button class="chip pri" id="lsave" disabled>ربط</button></div></div>` : ""}</div>`}
  <div class="sc-box"><b>السجل</b>${lg}</div></div></div></div>`;
  bind(m);
}
function bind(m) {
  const s = DET.s, isNew = !s.id;
  $("#sback", m).onclick = () => { S.sel = null; loadAll().then(() => paint(m)); };
  $("#ssave", m).onclick = async () => { readForm(m); const p = Object.assign({}, DET.s, { id: DET.s.id }); if (!isNew && !isRev()) { delete p.status; delete p.checklist; }
    const r = await sb.rpc("src_save", { p }); if (r.error) return fail(r.error); toast(isNew ? "أُضيف المصدر" : "حُفظت التعديلات"); await loadAll(); detail(m, r.data.id); };
  const dl = $("#sdel", m); if (dl) dl.onclick = async () => {
    let r = await sb.rpc("src_delete", { p_id: s.id, p_confirm: false });
    if (r.error && /^SRC_CONFIRM/.test(r.error.message || "")) { if (!(await askQ(clean(r.error), "نعم، احذف مع الاحتفاظ بنسخة"))) return; r = await sb.rpc("src_delete", { p_id: s.id, p_confirm: true }); }
    else if (!r.error && false) { /* */ } else if (r.error) return fail(r.error);
    else if (!(await askQ("حذف المصدر «" + s.title + "»؟ سيُحفظ في الأرشيف.", "نعم، احذف"))) { return; }
    if (r.error) return fail(r.error); toast("حُذف المصدر وبقيت نسخة في الأرشيف"); S.sel = null; await loadAll(); paint(m); };
  const ck = $("#schk", m); if (ck) ck.onclick = async () => { const a = await sb.rpc("src_check_start", { p_id: s.id }); if (a.error) return fail(a.error); toast("جارٍ فحص الرابط…");
    for (let i = 0; i < 8; i++) { await new Promise((r) => setTimeout(r, window.__srcPoll == null ? 1500 : window.__srcPoll)); const c = await sb.rpc("src_check_collect"); if (c.error) return fail(c.error); if (c.data && !c.data.pending) { toast("انتهى فحص الرابط"); await loadAll(); return detail(m, s.id); } }
    toast("لم يصل رد بعد؛ أعد فتح الصفحة بعد قليل."); };
  $$("[data-lr]", m).forEach((b) => (b.onclick = async () => { if (!(await askQ("إزالة ربط هذا المورد بالمصدر؟ تُحفظ نسخة في الأرشيف.", "نعم، أزل"))) return; const r = await sb.rpc("src_link_remove", { p_id: b.dataset.lr }); if (r.error) return fail(r.error); toast("أُزيل الربط"); await loadAll(); detail(m, s.id); }));
  $$("[data-le]", m).forEach((b) => (b.onclick = () => { const l = S.links.find((x) => x.id === b.dataset.le); fillLink(m, l); }));
  const q = $("#lq", m); if (q) { let t; q.oninput = () => { clearTimeout(t); t = setTimeout(() => { const v = q.value.trim().toLowerCase(), box = $("#lres", m); DET.pick = null; $("#lsave", m).disabled = true;
      box.innerHTML = v.length < 2 ? "" : S.q.filter((i) => i.title.toLowerCase().includes(v)).slice(0, 15).map((i) => `<div class="sc-row" data-pick="${esc(i.key)}"><div class="t">${esc(i.title)}<div class="m">${esc(TYPE[i.src] || i.src)} · ${esc((i.levels || []).map(lvn).join("، "))} · ${esc(QST[i.status] || "")}</div></div></div>`).join("") || '<span class="mut">لا توجد نتائج.</span>';
      $$("[data-pick]", box).forEach((r) => (r.onclick = () => { DET.pick = r.dataset.pick; $$("[data-pick]", box).forEach((x) => (x.style.outline = x === r ? "2px solid #6b3fd4" : "")); $("#lsave", m).disabled = false; })); }, 150); };
    $("#lsave", m).onclick = async () => { if (!DET.pick) return; const r = await sb.rpc("src_link_save", { p: { source_id: s.id, item_key: DET.pick, use_type: $("#l_use", m).value, location: val(m, "#l_loc"), info_used: val(m, "#l_info"), changes: val(m, "#l_chg"), needs_review: $("#l_nr", m).checked, verify: $("#l_vf", m).checked } });
      if (r.error) return fail(r.error); toast("رُبط المصدر بالمورد"); await loadAll(); detail(m, s.id); }; }
}
function fillLink(m, l) { const q = qmap().get(l.item_key) || {}; DET.pick = l.item_key; $("#lq", m).value = q.title || l.item_key; $("#lres", m).innerHTML = `<span class="sc-f g">${esc(q.title || l.item_key)}</span>`; $("#l_use", m).value = l.use_type; $("#l_loc", m).value = l.location || ""; $("#l_info", m).value = l.info_used || ""; $("#l_chg", m).value = l.changes || ""; $("#l_nr", m).checked = !!l.needs_review; $("#l_vf", m).checked = !!l.verify; $("#lsave", m).disabled = false; $("#addbox", m).scrollIntoView && $("#addbox", m).scrollIntoView({ block: "center" }); }

window.__sourcesTest = { csvText, cell, S, KIND, RIGHTS, alertSets, filtered };
})();
