/* ملاحظات أولياء الأمور — لوحة الإدارة. الملاحظات داخلية لا تُعرض للعامة، والقواعد (الصلاحيات، شروط «تمت المعالجة»، منع الدمج الخاطئ) مفروضة في قاعدة البيانات.
   الملاحظة ليست حقيقة تلقائيًا: تُراجع، وخطأ التعليم يحوَّل إلى إعادة تقييم في مركز الجودة. النطاق: من سنة إلى 6 سنوات والصفوف 1–4. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const KIND = { info_error: "خطأ في معلومة تعليمية", answer_error: "خطأ في إجابة أو سؤال", file_link: "مشكلة في ملف أو رابط", print_preview: "مشكلة في الطباعة أو المعاينة", instructions: "صعوبة في فهم التعليمات", age_fit: "عدم مناسبة المورد للعمر أو الصف", design: "مشكلة في التصميم أو عرض المحتوى", suggestion: "اقتراح تطوير المورد", new_content: "طلب إضافة محتوى جديد", other: "ملاحظة أخرى" };
const ST = { new: "جديدة", in_review: "قيد المراجعة", need_info: "تحتاج إلى معلومات إضافية", accepted: "تم قبولها", resolved: "تمت المعالجة", unactionable: "غير قابلة للتنفيذ", duplicate: "مكررة" };
const STC = { new: "#6b3fd4", in_review: "#2d7fd0", need_info: "#d9822b", accepted: "#1f9a63", resolved: "#2e7d32", unactionable: "#777", duplicate: "#999" };
const PR = { low: "منخفضة", normal: "عادية", high: "مرتفعة", urgent: "عاجلة" };
const PRC = { low: "#888", normal: "#2d7fd0", high: "#d9822b", urgent: "#c62f4a" };
const EDU = ["info_error", "answer_error", "age_fit"], TECH = ["file_link", "print_preview", "design"];
const ADM = { lib: "libadm", acts: "activitiesadm", bank: "bankadm", proj: "projadm", life: "lifeadm", ready: "readyadm", val: "valadm", exp: "expadm", vid: "videoadm", songs: "songadm", stories: "storiesadm", quiz: "quizadm", pack: "packsadm" };
const TYPE = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع أو تحدٍّ", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف وتجارب", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", pack: "حزمة تعليمية" };
const EVT = { created: "وصلت الملاحظة", status: "تغيّرت الحالة", edited: "تعديل", escalated: "حُوّلت إلى مراجعة عاجلة", redacted: "أُخفي النص" };
const REPLIES = { in_review: "وصلت ملاحظتك وهي قيد المراجعة لدى فريق زاد. شكرًا لك.", need_info: "شكرًا لك. نحتاج مزيدًا من التفاصيل لفهم الملاحظة؛ يمكنك إرسال ملاحظة جديدة من صفحة المحتوى تتضمن ما ظهر لك بالتحديد.", accepted: "شكرًا لك، ثبتت الحاجة إلى معالجة ما ذكرت وسيُنفَّذ التعديل.", resolved: "شكرًا لك، راجعنا ملاحظتك وعالجنا المشكلة.", unactionable: "شكرًا لك، درسنا ملاحظتك وتعذّر تنفيذها في الوقت الحالي.", duplicate: "شكرًا لك، وصلتنا ملاحظة مشابهة وسنتابعها معًا." };
const PAGE = 30;
const S = { tab: "list", me: { roles: [] }, rows: [], f: { kind: "", st: "", res: "", from: "", to: "", pr: "", mine: false }, page: 0, sel: null, dash: null, staff: [] };
let M = null, DET = null;
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const fmt = (d) => { try { return d ? new Date(d).toLocaleString("ar", { dateStyle: "medium", timeStyle: "short" }) : "—"; } catch (e) { return "—"; } };
const day = (d) => { const x = new Date(d); return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0"); };
const clean = (e) => String((e && e.message) || e || "").replace(/^(QUALITY_PERM|QUALITY_GATE|SRC_CONFIRM):\s*/, "");
const fail = (e) => { console.error(e); toast(clean(e) || "تعذّر تنفيذ الطلب. حاول مرة ثانية"); };
const isMgr = () => S.me.roles.includes("library_manager");
const badge = (s) => `<span class="fb-b" style="background:${STC[s]}">${ST[s] || s}</span>`;
const pbadge = (p) => `<span class="fb-b" style="background:${PRC[p]}">${PR[p] || p}</span>`;
const CSS = `.fb *{box-sizing:border-box}.fb-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.fb-tabs .chip.on{background:#6b3fd4;color:#fff}.fb-b{color:#fff;border-radius:99px;padding:2px 10px;font-size:12px;white-space:nowrap}
.fb-row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;border:1px solid #e3dcf6;border-radius:12px;padding:10px;margin:6px 0;background:#fff;cursor:pointer}.fb-row .t{flex:1 1 220px;min-width:0;font-weight:600}.fb-row .m{font-size:12px;color:#666;font-weight:400}
.fb-box{border:1px solid #e3dcf6;border-radius:14px;padding:12px;background:#fff;margin:10px 0}.fb-filters{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px;margin:8px 0}
.fb input,.fb select,.fb textarea{font:inherit;border:1px solid #cfc4ee;border-radius:10px;padding:8px;background:#fff;max-width:100%;width:100%}.fb input[type=checkbox]{width:auto}.fb textarea{min-height:64px}
.fb-acts{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.fb-acts .chip.pri{background:#6b3fd4;color:#fff}.fb-acts .chip.bad{background:#c62f4a;color:#fff}.fb-det{display:grid;gap:14px}@media(min-width:900px){.fb-det{grid-template-columns:3fr 2fr}}
.fb-warn{background:#ffeef0;border:1px solid #f1b3bb;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}.fb-ok{background:#e9f8f0;border:1px solid #a9dcc3;border-radius:10px;padding:8px;margin:6px 0;font-size:13px}.fb-tl{border-inline-start:3px solid #d9ccf7;padding:2px 10px;margin:8px 0;font-size:13px}.fb-tl small{color:#666;display:block}
.fb-kpi{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px}.fb-kpi div{border:1px solid #e3dcf6;border-radius:12px;padding:10px;background:#fff;text-align:center}.fb-kpi b{display:block;font-size:22px;color:#4a2bb0}.fb-body{white-space:pre-wrap;background:#faf8ff;border-radius:10px;padding:10px;font-size:15px}`;

async function loadAll() {
  const [me, r] = await Promise.all([sb.rpc("quality_my"), sb.from("fb_items").select("*").order("created_at", { ascending: false }).limit(3000)]);
  S.me = me.error || !me.data ? { roles: [] } : me.data; S.rows = r.data || []; if (r.error) toast("تعذّر تحميل الملاحظات");
  return !me.error && S.me.roles.length > 0;
}
SUB.feedbackadm = { title: "ملاحظات أولياء الأمور", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const ok = await loadAll();
  if (!ok) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى ملاحظات أولياء الأمور.</p>'; return; }
  if (window.__fbFilter) { S.f = Object.assign({ kind: "", st: "", res: "", from: "", to: "", pr: "", mine: false }, window.__fbFilter); window.__fbFilter = null; S.tab = "list"; S.sel = null; S.page = 0; }
  if (S.sel) return detail(m, S.sel);
  paint(m);
} };
function shell(inner) {
  return `<style>${CSS}</style><div class="fb"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <p class="mut">ملاحظات داخلية من أولياء الأمور لا تُعرض للعامة. لا تُعدّ الملاحظة صحيحة تلقائيًا ولا تُهمل لأن مرسلها غير متخصص: تُراجع ثم تُحوَّل إلى معالجة. لا تُجمع بيانات شخصية. النطاق: من سنة إلى 6 سنوات والصفوف 1–4.</p>
  <div class="fb-tabs" id="fbtabs">${[["list", "الملاحظات"], ["dash", "المؤشرات"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`;
}
async function paint(m) {
  m = m || M; S.sel = null;
  if (S.tab === "dash") { const d = await sb.rpc("fb_dashboard"); S.dash = d.error ? null : d.data; m.innerHTML = shell(dashHtml(d.error)); }
  else m.innerHTML = shell(listHtml());
  $$("#fbtabs [data-t]", m).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.page = 0; paint(m); }));
  if (S.tab === "list") bindList(m); else bindDash(m);
}
/* ---------- المؤشرات (من البيانات الفعلية فقط) ---------- */
function dashHtml(err) {
  if (err || !S.dash) return `<p class="mut">تعذّر تحميل المؤشرات.</p>`;
  const d = S.dash, bs = d.by_status || {}, g = (k) => AD(bs[k] || 0);
  return `<div class="fb-kpi"><div><b>${AD(d.total || 0)}</b>إجمالي الملاحظات</div><div data-k="new"><b>${g("new")}</b>جديدة</div><div><b>${g("in_review")}</b>قيد المراجعة</div><div><b>${g("accepted")}</b>تم قبولها</div><div><b>${g("resolved")}</b>تمت المعالجة</div></div>
  <div class="fb-box"><b>أكثر أنواع المشكلات تكرارًا</b>${(d.kinds || []).length ? (d.kinds || []).map((k) => `<div>${esc(KIND[k.k] || k.k)} — <b>${AD(k.n)}</b></div>`).join("") : '<p class="mut">لا توجد ملاحظات بعد.</p>'}</div>
  <div class="fb-box"><b>موارد تلقّت ملاحظات متعددة</b>${(d.multi || []).length ? (d.multi || []).map((x) => `<div class="fb-row" data-res="${esc(x.key)}"><div class="t">${esc(x.title || x.key)}</div><span class="fb-b" style="background:#c62f4a">${AD(x.n)} ملاحظات</span></div>`).join("") : '<p class="mut">لا يوجد مورد تلقّى أكثر من ملاحظة.</p>'}</div>
  <div class="fb-box"><b>متوسط مدة المعالجة</b><div>${d.avg_n > 0 && d.avg_hours != null ? `${AD(d.avg_hours)} ساعة (من ${AD(d.avg_n)} ملاحظة معالَجة)` : "لا توجد بيانات كافية بعد."}</div></div>`;
}
function bindDash(m) { $$("[data-res]", m).forEach((r) => (r.onclick = () => { S.f = { kind: "", st: "", res: r.dataset.res, from: "", to: "", pr: "", mine: false }; S.tab = "list"; S.page = 0; paint(m); })); $$("[data-k=new]", m).forEach((r) => (r.style.cursor = "pointer", r.onclick = () => { S.f = { kind: "", st: "new", res: "", from: "", to: "", pr: "", mine: false }; S.tab = "list"; paint(m); })); }
/* ---------- القائمة ---------- */
function filtered() {
  const f = S.f, q = f.res.trim().toLowerCase();
  return S.rows.filter((r) => (!f.kind || r.kind === f.kind) && (!f.st || r.status === f.st) && (!f.pr || r.priority === f.pr) && (!q || (r.item_title || "").toLowerCase().includes(q) || r.item_key.toLowerCase() === q || r.ref.toLowerCase().includes(q))
    && (!f.from || day(r.created_at) >= f.from) && (!f.to || day(r.created_at) <= f.to) && (!f.mine || r.assignee === S.me.id));
}
const PRORD = { urgent: 0, high: 1, normal: 2, low: 3 };
function listHtml() {
  const f = S.f, rows = filtered(), pages = Math.max(1, Math.ceil(rows.length / PAGE)); if (S.page >= pages) S.page = pages - 1;
  const opt = (obj, cur, all) => `<option value="">${all}</option>` + Object.entries(obj).map(([k, l]) => `<option value="${k}" ${cur === k ? "selected" : ""}>${l}</option>`).join("");
  return `<div class="fb-filters"><input id="fq" type="search" placeholder="المورد أو الرقم المرجعي" value="${esc(f.res)}" aria-label="المورد أو الرقم المرجعي"><select id="fk" aria-label="نوع الملاحظة">${opt(KIND, f.kind, "كل الأنواع")}</select><select id="fs" aria-label="الحالة">${opt(ST, f.st, "كل الحالات")}</select><select id="fp" aria-label="الأولوية">${opt(PR, f.pr, "كل الأولويات")}</select>
  <label class="mut" style="font-size:12px">من تاريخ<input id="ff" type="date" value="${esc(f.from)}"></label><label class="mut" style="font-size:12px">إلى تاريخ<input id="ft" type="date" value="${esc(f.to)}"></label>${S.me.id ? `<label style="font-size:13px;align-self:end"><input type="checkbox" id="fm" ${f.mine ? "checked" : ""}> المسندة إليّ</label>` : ""}</div>
  <p class="mut">${AD(rows.length)} ملاحظة${S.rows.length ? "" : " — لم تصل أي ملاحظة بعد."}</p>
  <div>${rows.slice(S.page * PAGE, S.page * PAGE + PAGE).map((r) => `<div class="fb-row" data-o="${esc(r.id)}" role="button" tabindex="0"><div class="t">${esc(r.item_title || r.item_key)}<div class="m">${esc(r.ref)} · ${esc(KIND[r.kind] || r.kind)} · ${fmt(r.created_at)}${r.assignee_name ? " · المسؤول: " + esc(r.assignee_name) : ""}</div></div>${badge(r.status)}${pbadge(r.priority)}</div>`).join("")}</div>
  <div class="fb-acts"><button class="chip" id="pprev" ${S.page === 0 ? "disabled" : ""}>السابق</button><span class="mut">صفحة ${AD(S.page + 1)} من ${AD(pages)}</span><button class="chip" id="pnext" ${S.page >= pages - 1 ? "disabled" : ""}>التالي</button></div>`;
}
function bindList(m) {
  const re = () => { const id = document.activeElement && document.activeElement.id; S.page = 0; paint(m).then(() => { if (id) { const e = $("#" + id, m); if (e) e.focus(); } }); };
  let t; $("#fq", m).oninput = (e) => { S.f.res = e.target.value; clearTimeout(t); t = setTimeout(re, 250); };
  [["#fk", "kind"], ["#fs", "st"], ["#fp", "pr"], ["#ff", "from"], ["#ft", "to"]].forEach(([s, k]) => ($(s, m).onchange = (e) => { S.f[k] = e.target.value; re(); }));
  const fm = $("#fm", m); if (fm) fm.onchange = (e) => { S.f.mine = e.target.checked; re(); };
  $("#pprev", m).onclick = () => { S.page--; paint(m); }; $("#pnext", m).onclick = () => { S.page++; paint(m); };
  $$("[data-o]", m).forEach((r) => { const open = () => detail(m, r.dataset.o); r.onclick = open; r.onkeydown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } }; });
}
/* ---------- صفحة الملاحظة ---------- */
async function detail(m, id) {
  S.sel = id; const r = S.rows.find((x) => x.id === id); if (!r) { S.sel = null; return paint(m); }
  const [lg, as, qi, sl, same] = await Promise.all([sb.from("fb_log").select("*").eq("fb_id", id).order("at", { ascending: false }).limit(100), sb.rpc("fb_assignees"), sb.from("quality_items").select("key,title,src,status,recheck,recheck_reason").eq("key", r.item_key), sb.from("src_links").select("*").eq("item_key", r.item_key), sb.from("fb_items").select("id,ref,status,kind").eq("item_key", r.item_key)]);
  const ids = (sl.data || []).map((x) => x.source_id), ss = ids.length ? await sb.from("src_sources").select("id,title,status,rights,link_status").in("id", ids) : { data: [] };
  DET = { r: JSON.parse(JSON.stringify(r)), log: lg.data || [], staff: as.error ? [] : as.data || [], item: (qi.data || [])[0] || null, links: sl.data || [], srcs: ss.data || [], same: (same.data || []).filter((x) => x.id !== id) };
  draw(m);
}
function draw(m) {
  const { r, log, staff, item, links, srcs, same } = DET, tech = TECH.includes(r.kind), edu = EDU.includes(r.kind), red = r.redacted;
  const sm = new Map(srcs.map((s) => [s.id, s]));
  const stOpts = Object.entries(ST).map(([k, l]) => `<option value="${k}" ${r.status === k ? "selected" : ""}>${l}</option>`).join("");
  const pOpts = Object.entries(PR).map(([k, l]) => `<option value="${k}" ${r.priority === k ? "selected" : ""}>${l}</option>`).join("");
  const aOpts = `<option value="">غير معيّن</option>` + staff.map((s) => `<option value="${esc(s.id)}" ${r.assignee === s.id ? "selected" : ""}>${esc(s.name)}</option>`).join("");
  const dupOpts = `<option value="">اختر الملاحظة الأصلية…</option>` + same.filter((x) => x.status !== "duplicate").map((x) => `<option value="${esc(x.id)}" ${r.dup_of === x.id ? "selected" : ""}>${esc(x.ref)} — ${esc(KIND[x.kind] || "")}</option>`).join("");
  const hasItem = !!item;
  const lg = log.map((l) => { const d = l.detail || {}; return `<div class="fb-tl"><b>${EVT[l.event] || esc(l.event)}</b><small>${esc(l.actor_name)} · ${fmt(l.at)}</small>${l.note ? `<small>${esc(l.note)}</small>` : ""}${d.from && d.to && d.from !== d.to ? `<small>${ST[d.from] || d.from} ← ${ST[d.to] || d.to}</small>` : ""}${d.fields ? `<small>الحقول: ${esc(d.fields.join("، "))}</small>` : ""}</div>`; }).join("") || '<p class="mut">لا يوجد سجل.</p>';
  const srcH = links.length ? links.map((l) => { const s = sm.get(l.source_id) || {}; return `<div class="fb-row" style="cursor:default"><div class="t">${esc(s.title || "مصدر محذوف")}<div class="m">${s.status === "active" ? "مصدر فعّال" : "مصدر غير معتمد أو يحتاج مراجعة"}${l.verify ? " · ينتظر التحقق" : ""}</div></div></div>`; }).join("") : '<p class="mut">لا يوجد مصدر موثّق لهذا المورد.</p>';
  m.innerHTML = `<style>${CSS}</style><div class="fb"><button class="chip" id="fbback">→ رجوع إلى الملاحظات</button>
  <div class="fb-box"><h3 style="margin:0 0 6px">${esc(r.ref)} ${badge(r.status)} ${pbadge(r.priority)}</h3><div class="mut" style="font-size:13px">${esc(KIND[r.kind] || r.kind)} · ${fmt(r.created_at)} · المورد: <b>${esc(r.item_title || r.item_key)}</b>${item ? " (" + esc(TYPE[item.src] || item.src) + ")" : ""}</div>
   ${item && item.recheck ? `<div class="fb-warn">المورد عليه طلب إعادة تقييم في مركز الجودة (${esc(item.recheck_reason || "")}).</div>` : ""}${item && item.status !== "published" ? `<div class="fb-warn">حالة المورد في مركز الجودة: ${esc(item.status)}.</div>` : ""}${!hasItem ? '<div class="fb-warn">لم يعد المورد موجودًا في مركز الجودة.</div>' : ""}
   <div class="fb-body">${esc(r.body)}</div>${same.length ? `<div class="mut" style="font-size:12px;margin-top:6px">ملاحظات أخرى على المورد نفسه: ${same.map((x) => esc(x.ref)).join("، ")}</div>` : ""}
   <div class="fb-acts">${hasItem && ADM[item.src] ? '<button class="chip" id="fbopen">فتح المورد للتعديل</button>' : ""}${hasItem ? '<button class="chip" id="fbq">فتح في مركز الجودة (للإيقاف المؤقت أو المراجعة)</button>' : ""}${links.length ? '<button class="chip" id="fbsrc">فتح مركز المصادر</button>' : ""}</div></div>
  <div class="fb-det"><div><div class="fb-box"><b>معالجة الملاحظة</b>${red ? '<div class="fb-warn">أُخفي نص هذه الملاحظة ولا تُعدَّل.</div>' : ""}
   <div class="fb-filters"><label>الحالة<select id="fst" ${red ? "disabled" : ""}>${stOpts}</select></label><label>الأولوية<select id="fpr" ${red ? "disabled" : ""}>${pOpts}</select></label><label>المسؤول عن المراجعة<select id="fas" ${red ? "disabled" : ""}>${aOpts}</select></label></div>
   <div id="fdupw" ${r.status === "duplicate" ? "" : "hidden"}><label>الملاحظة الأصلية التي دُمجت معها<select id="fdup" ${red ? "disabled" : ""}>${dupOpts}</select></label></div>
   <label>ملاحظات داخلية (سبب عدم التنفيذ إلزامي عند «غير قابلة للتنفيذ»)<textarea id="fin" maxlength="1000" ${red ? "disabled" : ""}>${esc(r.internal_note || "")}</textarea></label>
   ${tech ? `<label>خطوات إعادة ظهور المشكلة<textarea id="frp" maxlength="1000" ${red ? "disabled" : ""}>${esc(r.repro || "")}</textarea></label><label style="font-size:14px"><input type="checkbox" id="fft" ${r.fix_tested ? "checked" : ""} ${red ? "disabled" : ""}> اختُبر المورد بعد الإصلاح (شرط لـ«تمت المعالجة»)</label>` : ""}
   ${edu ? '<div class="fb-ok">ملاحظة تعليمية: لا تُعتبر «تمت المعالجة» قبل إعادة مراجعة المورد في مركز الجودة وعودته منشورًا.</div>' : ""}
   <label>رد مختصر لولي الأمر (يظهر له عند تتبّع الرقم المرجعي؛ لا تكتب بيانات داخلية أو شخصية)<textarea id="frs" maxlength="300" ${red ? "disabled" : ""}>${esc(r.reply || "")}</textarea></label>
   <div class="mut" style="font-size:12px">ردود جاهزة (تُعدَّل قبل الحفظ):</div><div class="fb-acts" style="margin-top:4px">${Object.entries(REPLIES).map(([k, t]) => `<button class="chip" data-rep="${k}" ${red ? "disabled" : ""}>${ST[k]}</button>`).join("")}</div>
   <div class="fb-acts">${red ? "" : '<button class="chip pri" id="fbsave">حفظ</button>'}${!red ? '<button class="chip bad" id="fbesc">تحويل إلى مراجعة عاجلة</button>' : ""}${isMgr() && !red ? '<button class="chip bad" id="fbred">إخفاء نص الملاحظة</button>' : ""}</div></div>
   <div class="fb-box"><b>مصادر المورد</b>${srcH}</div></div>
  <div><div class="fb-box"><b>السجل</b>${lg}</div></div></div></div>`;
  bind(m);
}
function bind(m) {
  const r = DET.r, item = DET.item;
  $("#fbback", m).onclick = () => { S.sel = null; loadAll().then(() => paint(m)); };
  const st = $("#fst", m); if (st) st.onchange = () => { $("#fdupw", m).hidden = st.value !== "duplicate"; };
  $$("[data-rep]", m).forEach((b) => (b.onclick = () => { $("#frs", m).value = REPLIES[b.dataset.rep]; }));
  const go = (id, f) => { const e = $(id, m); if (e) e.onclick = f; };
  go("#fbopen", () => { S.sel = null; window.__go(ADM[item.src]); });
  go("#fbq", () => { S.sel = null; window.__qualityOpen = item.key; window.__go("qualityadm"); });
  go("#fbsrc", () => { S.sel = null; window.__go("sourcesadm"); });
  go("#fbsave", async () => {
    const p = { status: $("#fst", m).value, priority: $("#fpr", m).value, assignee: $("#fas", m).value, internal_note: $("#fin", m).value, reply: $("#frs", m).value, dup_of: ($("#fdup", m) || {}).value || "" };
    if ($("#frp", m)) { p.repro = $("#frp", m).value; p.fix_tested = $("#fft", m).checked; }
    const x = await sb.rpc("fb_update", { p_id: r.id, p }); if (x.error) return fail(x.error); toast("حُفظت المعالجة"); await loadAll(); detail(m, r.id); });
  go("#fbesc", async () => { const x = await sb.rpc("fb_escalate", { p_id: r.id }); if (x.error) return fail(x.error); toast(x.data && x.data.flagged ? "حُوّلت الملاحظة وطُلبت إعادة تقييم المورد في مركز الجودة" : "رُفعت الأولوية إلى عاجلة (المورد غير منشور أو عليه طلب قائم)"); await loadAll(); detail(m, r.id); });
  go("#fbred", async () => { if (!(await (Z.ask ? Z.ask("سيُخفى نص هذه الملاحظة وبيانات الجهاز نهائيًا ويبقى سجلها. متابعة؟", "نعم، أخفِ النص") : Promise.resolve(window.confirm("إخفاء النص؟"))))) return; const x = await sb.rpc("fb_redact", { p_id: r.id }); if (x.error) return fail(x.error); toast("أُخفي نص الملاحظة"); await loadAll(); detail(m, r.id); });
}
window.__feedbackTest = { S, KIND, ST, filtered };
})();
