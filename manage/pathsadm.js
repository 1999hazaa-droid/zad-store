/* مركز المسارات التعليمية (إدارة). القواعد (هدف من المجالات الأربعة، عمر المسار ضمن عمر هدفه، مورد منشور مرتبط بهدف المسار ومتقاطع العمر، حد 15 موردًا، ثلاثة موارد صالحة على الأقل للنشر،
   النشر للمراجع فقط، وتحويل المسار المنشور إلى مسودة عند تعديل موارده بيد غير مراجع) مفروضة في قاعدة البيانات لا في هذه الواجهة. النطاق: من سنة إلى 6 سنوات والصفوف 1–4.
   حالة «مجاني/مدفوع» تُحسب من الموارد نفسها ولا تُحدَّد يدويًا حتى لا تخالف الواقع. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const STG = { recognize: "التعرف", understand: "الفهم", practice: "التدريب", apply: "التطبيق", review: "المراجعة" };
const RANK = { recognize: 1, understand: 2, practice: 3, apply: 4, review: 5 };
const TYPE = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "أنشودة", stories: "قصة", quiz: "اختبار", pack: "حزمة" };
const PROB = { level: "عمر المسار خارج هدفه", few: "موارد قليلة", gone: "مورد محذوف", unpub: "مورد غير منشور", levelres: "عمر المورد لا يتقاطع", goalmiss: "المورد خارج هدف المسار", goalhidden: "هدف المسار غير منشور", dup: "تكرار" };
const STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const PDOM = ["arabic", "math", "science", "life", "creative"];
const DIFF = { easy: "سهل", mid: "متوسط", hard: "أصعب قليلًا" };
const STD = { recognize: "تقديم الفكرة بصورة مبسطة", understand: "شرح أو قصة أو مثال", practice: "أنشطة وأوراق عمل للممارسة", apply: "استخدام ما تعلمه في موقف مناسب", review: "مراجعة قصيرة أو اختبار" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.pa *{box-sizing:border-box}.pa-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.pa-tabs .chip.on{background:#6b3fd4;color:#fff}
.pa-dom{margin:14px 0 6px;font-weight:800;color:#4b2aa5}.pa-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:8px 10px;margin:6px 0}
.pa-row b{flex:1;min-width:160px}.pa-row .mut{font-size:12px}.pa-bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.pa-bd.bad{background:#ffe3e0;color:#9a1d12}.pa-bd.ok{background:#dff6e7;color:#17683a}.pa-bd.warn{background:#fff0d1;color:#8a5200}
.pa-form{background:#faf7ff;border:1px solid #e4d9ff;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:8px;margin:10px 0}.pa-form label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px}
.pa-form input[type=text],.pa-form input[type=number],.pa-form textarea,.pa-form select,.pa-q input,.pa-q select,.pa-row select{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:38px;background:#fff}.pa-lvs{display:flex;flex-wrap:wrap;gap:8px}.pa-lvs label{flex-direction:row;align-items:center;gap:4px;font-weight:600}
.pa-q{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.pa-q input{flex:1;min-width:160px}.pa-msg{font-weight:700;font-size:13px}.pa-msg.bad{color:#b3261e}.pa-msg.ok{color:#17683a}.pa-acts{display:flex;gap:8px;flex-wrap:wrap}.pa-acts .chip.pri{background:#6b3fd4;color:#fff}.pa-acts .chip.bad{background:#c62f4a;color:#fff}`;
const S = { tab: "paths", me: { roles: [] }, dom: [], goals: [], paths: [], pit: [], gl: [], it: new Map(), fd: "", fs: "", edit: null, open: null, chk: null, q: "", prev: false, si: [], pr: [], sk: [] };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager"), isMgr = () => has("library_manager");
const dn = (s) => (S.dom.find((d) => d.slug === s) || { name: s }).name;
const lvTxt = (l) => (l || []).map((x) => LV[x]).filter(Boolean).join("، ");
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
const gN = (id) => (S.goals.find((g) => g.id === id) || { name: "" }).name;
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
async function loadMe() { const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data; return S.me.roles.length > 0; }
async function load() {
  const [d, g, p, pi, gl, si, pr, sk] = await Promise.all([sb.from("skill_domains").select("*").order("sort", { ascending: true }), sb.from("goals").select("id,name,domain,levels,status,skill_id").order("sort", { ascending: true }), sb.from("paths").select("*").order("sort", { ascending: true }), sb.from("path_items").select("*").order("ord", { ascending: true }), sb.from("goal_links").select("goal_id,item_key"), sb.from("path_stage_info").select("*"), sb.from("path_prior").select("*").order("ord", { ascending: true }), sb.from("skills").select("id,slug,name,domain,levels,status").eq("status", "active")]);
  S.dom = (d.data || []).filter((x) => PDOM.includes(x.slug)); S.goals = (g.data || []).filter((x) => PDOM.includes(x.domain)); S.paths = p.data || []; S.pit = pi.data || []; S.gl = gl.data || []; S.si = si.data || []; S.pr = pr.data || []; S.sk = sk.data || [];
  let all = [], from = 0; for (;;) { const r = await sb.from("quality_items").select("key,src,title,levels,status,gone").eq("gone", false).range(from, from + 999); const a = r.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
const itemsOf = (id) => S.pit.filter((x) => x.path_id === id).sort((a, b) => (RANK[a.stage] - RANK[b.stage]) || a.ord - b.ord);
const valid = (p, x) => { const i = S.it.get(x.item_key); return !!i && i.status === "published" && (i.levels || []).some((l) => p.levels.includes(l)); };
const goodN = (p) => itemsOf(p.id).filter((x) => valid(p, x)).length;
const payTxt = (p) => { const a = itemsOf(p.id).filter((x) => valid(p, x)); const n = a.length; const pd = a.filter((x) => { const i = S.it.get(x.item_key); return i && i.src !== "pack" && i.paid; }).length; return pd === 0 ? "مجاني" : "فيه موارد مدفوعة"; };
SUB.pathsadm = { title: "مركز المسارات التعليمية", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  if (!(await loadMe())) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى مركز المسارات.</p>'; return; }
  await load(); S.tab = "paths"; S.edit = null; S.open = null; paint();
} };
function shell(inner) {
  return `<style>${CSS}</style><div class="pa"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <p class="mut">المسار يرتّب موارد مرتبطة بهدف واحد من الأبسط إلى الأعقد لفئة عمرية واحدة. لا يُنشر مسار أقل من ثلاثة موارد صالحة أو فيه مورد أساسي غير منشور. ويبقى كل مورد قابلًا للفتح بمفرده.</p>
  <div class="pa-tabs" id="patabs">${[["paths", "المسارات"], ["review", "المراجعة والجودة"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`;
}
function paint() {
  M.innerHTML = shell(S.tab === "paths" ? (S.open ? itemsHtml() : S.edit ? formHtml() : listHtml()) : `<p class="mut">جارٍ التحميل…</p>`);
  $$("#patabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; S.edit = null; if (S.tab === "review") reviewPaint(); else paint(); }));
  if (S.tab === "paths") { if (S.open) bindItems(); else if (S.edit) bindForm(); else bindList(); }
}
function listHtml() {
  const doms = S.dom.filter((d) => !S.fd || d.slug === S.fd);
  const body = doms.map((d) => {
    const a = S.paths.filter((p) => { const g = S.goals.find((x) => x.id === p.goal_id); return g && g.domain === d.slug && (!S.fs || p.status === S.fs); });
    return `<div class="pa-dom">${esc(d.name)} <span class="mut">(${AD(a.length)})</span></div>` + (a.length ? a.map((p, i) => `<div class="pa-row" data-id="${esc(p.id)}"><b>${esc(p.name)}${p.extra ? ' <span class="pa-bd">مضاف يدويًا</span>' : ""}<br><span class="mut">الهدف: ${esc(gN(p.goal_id))}</span></b><span class="mut">${esc(lvTxt(p.levels))}</span>${p.diff ? `<span class="pa-bd">${esc(DIFF[p.diff])}</span>` : ""}<span class="pa-bd">${AD(itemsOf(p.id).length)} مورد (${AD(goodN(p))} صالح)</span><span class="pa-bd">${esc(payTxt(p))}</span><span class="pa-bd ${p.status === "active" ? "ok" : p.status === "hidden" ? "bad" : "warn"}">${STS[p.status]}</span>${canEdit() ? `<button class="chip" data-a="up" ${i === 0 ? "disabled" : ""} aria-label="تقديم">▲</button><button class="chip" data-a="down" ${i === a.length - 1 ? "disabled" : ""} aria-label="تأخير">▼</button><button class="chip" data-a="edit">تعديل</button>${p.status === "active" ? '<button class="chip" data-a="hide">إيقاف مؤقت</button>' : p.status === "hidden" ? '<button class="chip" data-a="draft">إرجاع لمسودة</button>' : ""}${canRev() && p.status !== "active" ? '<button class="chip pri" data-a="publish">نشر</button>' : ""}` : ""}<button class="chip pri" data-a="items">الموارد والمعاينة</button></div>`).join("") : '<p class="mut">لا مسارات.</p>');
  }).join("");
  return `<div class="pa-q"><select id="pafd"><option value="">كل المجالات</option>${S.dom.map((d) => `<option value="${esc(d.slug)}" ${S.fd === d.slug ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select><select id="pafs"><option value="">كل الحالات</option>${Object.entries(STS).map(([k, t]) => `<option value="${k}" ${S.fs === k ? "selected" : ""}>${t}</option>`).join("")}</select>${canEdit() ? '<button class="chip pri" id="panew">+ مسار جديد</button>' : ""}</div>${body}`;
}
function bindList() {
  $("#pafd", M).onchange = (e) => { S.fd = e.target.value; paint(); }; $("#pafs", M).onchange = (e) => { S.fs = e.target.value; paint(); };
  const nw = $("#panew", M); if (nw) nw.onclick = () => { const g = S.goals.find((x) => !S.fd || x.domain === S.fd) || S.goals[0]; S.edit = { id: null, goal_id: g ? g.id : "", name: "", descr: "", levels: [], est_min: null, diff: null, status: "draft" }; paint(); };
  $$(".pa-row[data-id]", M).forEach((r) => $$("[data-a]", r).forEach((b) => (b.onclick = async () => {
    const id = r.dataset.id, p = S.paths.find((x) => x.id === id), a = b.dataset.a;
    if (a === "edit") { S.edit = Object.assign({}, p); paint(); } else if (a === "items") { S.open = id; S.q = ""; S.prev = false; paint(); }
    else if (a === "publish" || a === "hide" || a === "draft") { const x = await sb.rpc("path_status", { p_id: id, p_status: a === "publish" ? "active" : a === "hide" ? "hidden" : "draft" }); if (x.error) return fail(x.error); await load(); paint(); toast(a === "publish" ? "نُشر المسار." : a === "hide" ? "أُوقف المسار مؤقتًا." : "أُعيد إلى مسودة."); }
    else { const sib = S.paths.filter((x) => { const g = S.goals.find((y) => y.id === x.goal_id), g2 = S.goals.find((y) => y.id === p.goal_id); return g && g2 && g.domain === g2.domain && (!S.fs || x.status === S.fs); }).map((x) => x.id), i = sib.indexOf(id), j = a === "up" ? i - 1 : i + 1; if (j < 0 || j >= sib.length) return; [sib[i], sib[j]] = [sib[j], sib[i]]; const x = await sb.rpc("path_order", { p_ids: sib }); if (x.error) return fail(x.error); await load(); paint(); }
  })));
}
function formHtml() {
  const e = S.edit, g = S.goals.find((x) => x.id === e.goal_id) || S.goals[0] || { levels: [] };
  return `<div class="pa-form"><b>${e.id ? "تعديل المسار" : "مسار جديد"}</b>
  <label>الهدف التعليمي (يحدد المجال والمهارة)<select id="pfg">${S.dom.map((d) => `<optgroup label="${esc(d.name)}">${S.goals.filter((x) => x.domain === d.slug).map((x) => `<option value="${esc(x.id)}" ${x.id === (e.goal_id || g.id) ? "selected" : ""}>${esc(x.name)}</option>`).join("")}</optgroup>`).join("")}</select></label>
  <label>اسم المسار<input type="text" id="pfn" maxlength="120" value="${esc(e.name)}"></label>
  <label>وصف مختصر<textarea id="pfd" rows="2" maxlength="300">${esc(e.descr || "")}</textarea></label>
  <div><b style="font-size:13px">العمر أو الصف (فئة واحدة، ضمن عمر الهدف)</b><div class="pa-lvs" id="pflv">${Object.entries(LV).filter(([k]) => (g.levels || []).includes(k)).map(([k, l]) => `<label><input type="checkbox" value="${k}" ${(e.levels || []).includes(k) ? "checked" : ""}> ${l}</label>`).join("")}</div></div>
  <label>المدة التقديرية بالدقائق (اتركها فارغة إن لم تكن معروفة)<input type="number" id="pfe" min="1" max="600" value="${e.est_min == null ? "" : esc(e.est_min)}"></label>
  <label>مستوى الصعوبة (اقتراح من إدارة المحتوى، يظهر للزوار كما هو)<select id="pfdf"><option value="">غير محدد</option>${Object.entries(DIFF).map(([k, t]) => `<option value="${k}" ${e.diff === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>
  <p class="mut" style="font-size:12px">حالة «مجاني/مدفوع» تُحسب من موارد المسار نفسها. الحالة الآن: ${esc(STS[e.status] || "مسودة")}. تغيير الهدف أو الفئة أو الاسم في مسار منشور يعيده مسودة (إن لم تكن مراجعًا).</p>
  <p class="pa-msg" id="pfm" role="status"></p><div class="pa-acts"><button class="chip pri" id="pfsave">حفظ</button><button class="chip" id="pfcan">إلغاء</button>${e.id && isMgr() ? '<button class="chip bad" id="pfdel">حذف المسار</button>' : ""}</div></div>`;
}
function bindForm() {
  const e = S.edit, msg = (t, c) => { const m = $("#pfm", M); m.className = "pa-msg " + (c || ""); m.textContent = t; };
  const grab = () => { e.goal_id = $("#pfg", M).value; e.name = $("#pfn", M).value; e.descr = $("#pfd", M).value; e.levels = $$("#pflv input:checked", M).map((x) => x.value); const v = $("#pfe", M).value; e.est_min = v === "" ? null : Number(v); e.diff = $("#pfdf", M).value || null; };
  $("#pfg", M).onchange = () => { grab(); const g = S.goals.find((x) => x.id === e.goal_id); e.levels = (e.levels || []).filter((l) => g && g.levels.includes(l)); paint(); };
  $("#pfcan", M).onclick = () => { S.edit = null; paint(); };
  const save = async (force) => {
    grab();
    const r = await sb.rpc("path_save", { p: { id: e.id || null, goal_id: e.goal_id, name: e.name, descr: e.descr, levels: e.levels, est_min: e.est_min, diff: e.diff || null, status: e.id ? e.status : "draft" }, p_force: !!force });
    if (r.error) return msg(String(r.error.message || "").replace(/^.*?:\s*/, ""), "bad");
    await load(); S.edit = null; if (r.data && r.data.id && !e.id) { S.open = r.data.id; S.q = ""; } paint(); toast("حُفظ المسار.");
  };
  $("#pfsave", M).onclick = () => save(false);
  const dl = $("#pfdel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف المسار نهائيًا مع ترتيب موارده؟ الموارد نفسها لا تُحذف."))) return; const r = await sb.rpc("path_delete", { p_id: e.id }); if (r.error) return msg(String(r.error.message).replace(/^.*?:\s*/, ""), "bad"); await load(); S.edit = null; paint(); toast("حُذف المسار."); };
}
const siOf = (pid, st) => S.si.find((x) => x.path_id === pid && x.stage === st);
const skN = (id) => (S.sk.find((x) => x.id === id) || { name: "مهارة المسار" }).name;
const priorOf = (pid) => S.pr.filter((x) => x.path_id === pid).sort((a, b) => a.ord - b.ord);
const priorPrev = (p) => { const a = priorOf(p.id); return a.length ? `<div class="mut" style="font-size:12px">المهارات السابقة المقترحة: ${a.map((x) => esc(skN(x.skill_id))).join("، ")}</div>` : ""; };
/* مراحل المسار: اسم وشرح ومهارة مستهدفة لكل مرحلة (ترتيب أنواع المراحل ثابت: تعرّف، فهم، تدريب، تطبيق، مراجعة) + المهارات السابقة */
function stagesHtml(p) {
  if (!canEdit()) return "";
  const g = S.goals.find((x) => x.id === p.goal_id) || {}, its = itemsOf(p.id), sks = S.sk.filter((x) => (x.levels || []).some((l) => p.levels.includes(l)));
  const sOpts = (sel) => `<option value="">مهارة المسار (${esc(skN(g.skill_id))})</option>` + sks.filter((x) => x.id !== g.skill_id).map((x) => `<option value="${esc(x.id)}" ${x.id === sel ? "selected" : ""}>${esc(x.name)}</option>`).join("");
  const rows = Object.entries(STG).map(([k, t]) => { const o = siOf(p.id, k), n = its.filter((x) => x.stage === k).length; return `<div class="pa-form" data-st="${k}"><b>${esc(t)} <span class="mut">(${AD(n)} موارد${n ? "" : "، لا تظهر للزوار بلا موارد"})</span></b><label>اسم المرحلة<input type="text" data-f="sname" maxlength="60" value="${esc(o ? o.name : t)}"></label><label>شرح قصير<textarea data-f="sexpl" rows="2" maxlength="240">${esc(o ? o.expl : STD[k])}</textarea></label><label>المهارة المستهدفة<select data-f="sskill">${sOpts(o && o.skill_id)}</select></label><div class="pa-acts"><button class="chip pri" data-a="ssave">حفظ المرحلة</button>${o ? '<button class="chip" data-a="sclear">إعادة الافتراضي</button>' : ""}</div></div>`; }).join("");
  const pri = priorOf(p.id), cand = sks.filter((x) => x.id !== g.skill_id && !pri.some((y) => y.skill_id === x.id));
  return `<div class="pa-dom">مراحل المسار</div><p class="mut" style="font-size:12px">ترتيب أنواع المراحل ثابت (من التعرّف إلى المراجعة) ليبقى التدرّج التعليمي سليمًا، وتُرتَّب الموارد داخل كل مرحلة من قائمة الموارد. المرحلة التي لا موارد فيها لا تظهر للزوار. لا تستعمل عبارات إتقان أو درجات.</p>${rows}<div class="pa-dom">المهارات السابقة المقترحة (غير إلزامية، حتى أربع)</div>${pri.map((x) => `<div class="pa-row" data-pr="${esc(x.skill_id)}"><b>${esc(skN(x.skill_id))}</b><span class="mut">${esc(x.note || "")}</span><button class="chip bad" data-a="prm">إزالة</button></div>`).join("") || '<p class="mut">لا مهارات سابقة محددة، ولن يُعرض هذا القسم للزوار.</p>'}${pri.length < 4 && cand.length ? `<div class="pa-form" id="pa-pradd"><label>مهارة سابقة<select data-f="pskill">${cand.map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("")}</select></label><label>ملاحظة قصيرة (اختياري)<input type="text" data-f="pnote" maxlength="160"></label><div class="pa-acts"><button class="chip pri" data-a="padd">إضافة</button></div></div>` : ""}`;
}
function itemsHtml() {
  const p = S.paths.find((x) => x.id === S.open), its = itemsOf(p.id), q = (S.q || "").trim();
  const inGoal = new Set(S.gl.filter((l) => l.goal_id === p.goal_id).map((l) => l.item_key));
  let cand = [];
  if (q.length >= 2) cand = [...S.it.values()].filter((i) => i.status === "published" && inGoal.has(i.key) && (i.levels || []).some((x) => p.levels.includes(x)) && i.title.includes(q) && !its.some((x) => x.item_key === i.key)).slice(0, 12);
  const rows = its.map((x, k) => { const i = S.it.get(x.item_key), ok = valid(p, x); const same = (d) => its[k + d] && its[k + d].stage === x.stage; return `<div class="pa-row" data-l="${esc(x.id)}"><span class="pa-bd">${AD(k + 1)}</span><b>${esc(itT(x.item_key))} <span class="mut">${esc(TYPE[(i || {}).src] || "")}</span></b><span class="mut">${esc(lvTxt((i || {}).levels))}</span>${ok ? "" : '<span class="pa-bd bad">غير صالح للعرض</span>'}${x.required ? "" : '<span class="pa-bd">اختياري</span>'}${canEdit() ? `<button class="chip" data-a="up" ${same(-1) ? "" : "disabled"} aria-label="تقديم">▲</button><button class="chip" data-a="down" ${same(1) ? "" : "disabled"} aria-label="تأخير">▼</button><select data-f="stage" aria-label="المرحلة">${Object.entries(STG).map(([s, t]) => `<option value="${s}" ${x.stage === s ? "selected" : ""}>${t}</option>`).join("")}</select><select data-f="req" aria-label="الأهمية"><option value="1" ${x.required ? "selected" : ""}>أساسي</option><option value="0" ${x.required ? "" : "selected"}>اختياري</option></select><button class="chip bad" data-a="rm">إزالة</button>` : `<span class="pa-bd">${STG[x.stage]}</span>`}</div>`; }).join("");
  const prev = S.prev ? `<div class="pa-form"><b>معاينة كما يراها الزائر (${AD(goodN(p))} مورد صالح)</b>${Object.entries(STG).map(([s, t]) => { const a = its.filter((x) => x.stage === s && valid(p, x)); const o = siOf(p.id, s); return a.length ? `<div><b style="font-size:13px">${esc(o ? o.name : t)}</b> <span class="mut">المهارة المستهدفة: ${esc(skN(o && o.skill_id ? o.skill_id : (S.goals.find((g) => g.id === p.goal_id) || {}).skill_id))} · ${esc(o && o.expl ? o.expl : STD[s])}</span>${a.map((x) => `<div class="mut">• ${esc(itT(x.item_key))}${x.required ? "" : " (اختياري)"}</div>`).join("")}</div>` : ""; }).join("") || '<p class="mut">لا موارد صالحة.</p>'}${priorPrev(p)}<p class="mut" style="font-size:12px">الحالة: ${esc(STS[p.status])} · ${p.diff ? "الصعوبة: " + esc(DIFF[p.diff]) + " · " : ""}${esc(payTxt(p))}. ${p.status === "active" ? "المسار ظاهر للزوار." : "المسار غير ظاهر للزوار حتى يُنشر."}</p></div>` : "";
  return `<button class="chip" id="paback">→ كل المسارات</button><h3 style="margin:8px 0">${esc(p.name)} <span class="pa-bd">${esc(lvTxt(p.levels))}</span> <span class="pa-bd">${esc(STS[p.status])}</span></h3><p class="mut">الهدف: ${esc(gN(p.goal_id))}. تُضاف فقط موارد مرتبطة بهذا الهدف ومنشورة ومتقاطعة العمر مع المسار.</p>
  <div class="pa-acts"><button class="chip" id="paprev">${S.prev ? "إخفاء المعاينة" : "معاينة المسار"}</button></div>${prev}
  ${rows || '<p class="mut">لا موارد في هذا المسار.</p>'}
  ${stagesHtml(p)}
  ${canEdit() ? `<div class="pa-form"><b>إضافة مورد إلى المسار</b><div class="pa-q"><input type="text" id="paq" placeholder="ابحث بعنوان المورد (حرفان على الأقل)" value="${esc(S.q || "")}"></div>${q.length >= 2 ? (cand.length ? cand.map((i) => `<div class="pa-row" data-k="${esc(i.key)}"><b>${esc(i.title)} <span class="mut">${esc(TYPE[i.src] || "")}</span></b><span class="mut">${esc(lvTxt(i.levels))}</span><select data-f="st">${Object.entries(STG).map(([k, t]) => `<option value="${k}" ${k === "practice" ? "selected" : ""}>${t}</option>`).join("")}</select><button class="chip pri" data-a="add">إضافة</button></div>`).join("") : '<p class="mut">لا نتائج: يجب أن يكون المورد منشورًا ومرتبطًا بهدف المسار ومتقاطع العمر معه.</p>') : ""}<p class="mut" style="font-size:12px">الحد الأقصى 15 موردًا. يُعرض الترتيب بحسب المرحلة ثم الترتيب الذي تحدده هنا داخل المرحلة.</p></div>` : ""}`;
}
function bindItems() {
  const p = S.paths.find((x) => x.id === S.open);
  $("#paback", M).onclick = () => { S.open = null; paint(); };
  $("#paprev", M).onclick = () => { S.prev = !S.prev; paint(); };
  const q = $("#paq", M); if (q) q.oninput = () => { S.q = q.value; const c = q.selectionStart; paint(); const n = $("#paq", M); n.focus(); try { n.setSelectionRange(c, c); } catch (e) { /* */ } };
  $$(".pa-row[data-l]", M).forEach((r) => {
    const id = r.dataset.l;
    const upd = async () => { const x = await sb.rpc("path_item_update", { p_id: id, p_stage: $("[data-f=stage]", r).value, p_required: $("[data-f=req]", r).value === "1" }); if (x.error) fail(x.error); await load(); paint(); };
    $$("select", r).forEach((e) => (e.onchange = upd));
    const mv = async (d) => { const its = itemsOf(p.id), k = its.findIndex((x) => x.id === id), j = k + d; if (j < 0 || j >= its.length || its[j].stage !== its[k].stage) return; const ids = its.map((x) => x.id); [ids[k], ids[j]] = [ids[j], ids[k]]; const x = await sb.rpc("path_items_order", { p_path: p.id, p_ids: ids }); if (x.error) return fail(x.error); await load(); paint(); };
    const up = $("[data-a=up]", r), dw = $("[data-a=down]", r), rm = $("[data-a=rm]", r);
    if (up) up.onclick = () => mv(-1); if (dw) dw.onclick = () => mv(1);
    if (rm) rm.onclick = async () => { if (!(await Z.ask("إزالة هذا المورد من المسار؟ المورد نفسه يبقى في المكتبة."))) return; const x = await sb.rpc("path_item_remove", { p_id: id }); if (x.error) return fail(x.error); await load(); paint(); };
  });
  $$(".pa-form[data-st]", M).forEach((f) => {
    const st = f.dataset.st;
    $("[data-a=ssave]", f).onclick = async () => { const x = await sb.rpc("path_stage_save", { p_path: p.id, p_stage: st, p_name: $("[data-f=sname]", f).value, p_expl: $("[data-f=sexpl]", f).value, p_skill: $("[data-f=sskill]", f).value || null }); if (x.error) return fail(x.error); await load(); paint(); toast("حُفظت المرحلة."); };
    const c = $("[data-a=sclear]", f); if (c) c.onclick = async () => { const x = await sb.rpc("path_stage_clear", { p_path: p.id, p_stage: st }); if (x.error) return fail(x.error); await load(); paint(); toast("أُعيدت المرحلة إلى الافتراضي."); };
  });
  const pa = $("#pa-pradd", M); if (pa) $("[data-a=padd]", pa).onclick = async () => { const x = await sb.rpc("path_prior_save", { p_path: p.id, p_skill: $("[data-f=pskill]", pa).value, p_note: $("[data-f=pnote]", pa).value }); if (x.error) return fail(x.error); await load(); paint(); toast("أُضيفت المهارة السابقة."); };
  $$(".pa-row[data-pr]", M).forEach((r) => ($("[data-a=prm]", r).onclick = async () => { const x = await sb.rpc("path_prior_remove", { p_path: p.id, p_skill: r.dataset.pr }); if (x.error) return fail(x.error); await load(); paint(); }));
  $$(".pa-row[data-k]", M).forEach((r) => { $("[data-a=add]", r).onclick = async () => { const x = await sb.rpc("path_item_add", { p_path: p.id, p_key: r.dataset.k, p_stage: $("[data-f=st]", r).value, p_required: true }); if (x.error) return fail(x.error); await load(); paint(); toast("أُضيف المورد."); }; });
}
async function reviewPaint() {
  const r = await sb.rpc("paths_check"); S.chk = r.error ? null : r.data || [];
  const dr = S.paths.filter((p) => p.status === "draft");
  const rule = S.pit.filter((x) => x.origin === "rule").length;
  M.innerHTML = shell(`<div class="pa-form"><b>ملخص</b><p class="mut">${AD(S.paths.length)} مسار (${AD(S.paths.filter((p) => p.status === "active").length)} منشور، ${AD(dr.length)} مسودة، ${AD(S.paths.filter((p) => p.status === "hidden").length)} مخفي) · ${AD(S.pit.length)} مورد في المسارات (${AD(rule)} رُتّب آليًا أولًا من روابط الهدف). المسارات الأولية مسودات لا تظهر للزوار حتى يراجعها مراجع تعليمي (يتحقق من مناسبة العمر، ومنطقية الترتيب، ووضوح الهدف) وينشرها.</p>${canRev() && dr.length ? `<div class="pa-acts"><button class="chip pri" id="papuball">نشر المسودات الصالحة بعد مراجعتها (${AD(dr.length)} مسودة؛ تُستثنى التي لا تجتاز الفحص)</button></div>` : ""}</div>
  <div class="pa-dom">فحص جودة المسارات</div>${r.error ? `<p class="pa-msg bad">${esc(r.error.message)}</p>` : S.chk.length ? S.chk.map((p) => `<div class="pa-row"><span class="pa-bd ${p.block ? "bad" : "warn"}">${esc(PROB[p.t] || p.t)}${p.block ? " (يمنع النشر)" : ""}</span><b>${esc(p.msg)}</b></div>`).join("") : '<p class="pa-msg ok">لا مشكلات: كل مسار فيه ثلاثة موارد صالحة على الأقل، وعمره ضمن هدفه، وموارده منشورة ومرتبطة بهدفه، ولا روابط معطلة.</p>'}`);
  $$("#patabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; if (S.tab === "review") reviewPaint(); else paint(); }));
  const pa = $("#papuball", M); if (pa) pa.onclick = async () => { if (!(await Z.ask("نشر كل المسارات الصالحة من المسودات للمستخدمين؟ تأكد أنك راجعت ترتيبها ومناسبتها لأعمارها."))) return; const x = await sb.rpc("path_publish_all"); if (x.error) return fail(x.error); await load(); reviewPaint(); toast("نُشر " + AD(x.data) + " مسار."); };
}
window.__pathsAdmTest = { S, itemsOf, siOf, stagesHtml };
})();
