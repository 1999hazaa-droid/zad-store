/* إدارة «الحزم التعليمية الجاهزة»: إنشاء الحزم وتعديلها وترتيب مواردها ونشرها.
   لا تُنشر حزمة إلا إذا كانت كل مواردها موجودة ومنشورة ومناسبة لمستوى الحزمة (3 موارد على الأقل).
   لا يوجد نظام اشتراك في المنصة: حالة الحزمة (مجانية/تتضمن مدفوعًا/مدفوعة) تُشتق من حالة مواردها ولا تُحدَّد يدويًا. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const F = () => window.ZFIND;
const ST = { draft: "مسودة", published: "منشورة", unpublished: "غير منشورة" };
const COVERS = [["images/zad/i_book.webp", "كتاب"], ["images/zad/i_numbers.webp", "أرقام"], ["images/zad/i_globe.webp", "كرة أرضية"], ["images/zad/i_microscope.webp", "مجهر"], ["images/zad/i_brain.webp", "عقل"], ["images/zad/i_home.webp", "بيت"], ["images/zad/i_heart.webp", "قلب"], ["images/zad/i_palette.webp", "ألوان"], ["images/zad/i_star.webp", "نجمة"], ["images/zad/i_puzzle.webp", "ألغاز"]];
const MIN_READY = 3, MAX_ITEMS = 40;
const SLUG = /^[a-z0-9-]{3,60}$/, KEYRE = /^[a-z]{2,8}:[^\s<>@]{1,100}$/;
let PACKS = [], ITEMS = {}, FILTER = "", EDIT = null, DRAFT = null, QRY = "";

const fail = (e) => { console.error(e); toast(e && e.code === "23505" ? "هذا الرمز مستخدم لحزمة أخرى" : "تعذّر الحفظ. تأكد من الإنترنت وحاول مرة ثانية"); };
const lvName = (l) => (F().LVN || {})[l] || l;

/** حالة كل مورد داخل الحزمة بالنسبة لمستوياتها: ok | dead (غير موجود/غير منشور) | level (لا يناسب مستوى الحزمة) */
function checkItem(key, levels, by) {
  const it = by.get(key); if (!it || it.hidden || !it.lv.length) return { s: "dead", it: null };
  if (!it.lv.some((l) => levels.includes(l))) return { s: "level", it }; return { s: "ok", it };
}
function inspect(d, by) { const rows = d.keys.map((k) => Object.assign({ key: k }, checkItem(k, d.levels, by))); return { rows, ok: rows.filter((r) => r.s === "ok").length, dead: rows.filter((r) => r.s !== "ok").length }; }
/** يعيد نص الخطأ أو "" إن صلحت البيانات؛ publish يشدّد الشروط */
function validate(d, insp, existingSlugs) {
  const t = String(d.title || "").trim(); if (t.length < 3 || t.length > 80) return "عنوان الحزمة بين 3 و80 حرفًا.";
  if (!SLUG.test(d.slug || "")) return "رمز الحزمة: أحرف إنجليزية صغيرة وأرقام وشرطة فقط (3 إلى 60).";
  if (d.isNew && existingSlugs.has(d.slug)) return "هذا الرمز مستخدم لحزمة أخرى.";
  if (String(d.summary || "").length > 300) return "الوصف أطول من 300 حرف.";
  if (!d.levels.length || d.levels.some((l) => !lvName(l) || lvName(l) === l)) return "اختر عمرًا أو صفًا واحدًا على الأقل من النطاق المسموح (سنة إلى 6 سنوات، والصفوف 1–4).";
  if (d.keys.length > MAX_ITEMS) return "الحد الأقصى " + MAX_ITEMS + " موردًا.";
  if (d.keys.some((k) => !KEYRE.test(k))) return "مفتاح مورد غير صالح.";
  if (new Set(d.keys).size !== d.keys.length) return "مورد مكرر داخل الحزمة.";
  if (d.est != null && d.est !== "" && !(+d.est >= 5 && +d.est <= 600)) return "المدة التقديرية بين 5 و600 دقيقة (اتركها فارغة إن لم يوجد تقدير موثوق).";
  if (d.status === "published") {
    if (insp.dead) return "لا يمكن النشر: " + insp.dead + " مورد غير موجود أو غير منشور أو لا يناسب مستوى الحزمة. أزله أو أصلحه أولًا.";
    if (insp.ok < MIN_READY) return "لا يمكن النشر: الحزمة تحتاج " + MIN_READY + " موارد صالحة على الأقل.";
  }
  return "";
}
function accessOf(rows) { const its = rows.filter((r) => r.it); const paid = its.filter((r) => r.it.paid).length; return !its.length ? "—" : paid === 0 ? "مجانية" : paid === its.length ? "مدفوعة" : "تتضمن " + paid + " مدفوعة"; }

async function loadAll() {
  await F().load().catch(() => {});
  const [p, i] = await Promise.all([sb.from("packs").select("*").order("sort_order", { ascending: true }).limit(500), sb.from("pack_items").select("pack_id,key,pos").order("pos", { ascending: true }).limit(5000)]);
  PACKS = p.error ? [] : p.data || []; ITEMS = {}; (i.error ? [] : i.data || []).forEach((r) => { (ITEMS[r.pack_id] = ITEMS[r.pack_id] || []).push(r.key); });
  if (p.error) toast("تعذّر تحميل الحزم");
}
const byKey = () => new Map((F().X.all || []).map((x) => [x.key, x]));

SUB.packsadm = { title: "إدارة الحزم التعليمية", fn: async function view(m) {
  if (!F()) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">تعذّر تحميل بيانات المحتوى.</p>'; return; }
  m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  await loadAll();
  if (EDIT) return edit(m);
  const by = byKey(), shown = PACKS.filter((p) => !FILTER || p.status === FILTER);
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">حزم تعليمية جاهزة تجمع موارد منشورة موجودة فعلًا. لا تظهر الحزمة للزوار إلا إذا كانت «منشورة» ومواردها صالحة. لا يوجد اشتراك في المنصة، فتُحدَّد حالة الحزمة (مجانية أو مدفوعة) من حالة مواردها.</p>
  <div class="chips" id="pkst">${[["", "الكل"], ["published", "منشورة"], ["draft", "مسودات"], ["unpublished", "غير منشورة"]].map(([k, l]) => `<button class="chip ${FILTER === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("")}</div>
  <button class="chip on" id="pknew">+ حزمة جديدة</button><div id="pklist">${shown.map((p) => { const d = { levels: p.levels || [], keys: ITEMS[p.id] || [] }, ins = inspect(d, by); return `<div class="item"><div class="tx"><b>${esc(p.title)}</b><small>${esc(p.levels.map(lvName).join("، "))} · ${esc(ST[p.status] || p.status)} · ${ins.ok} مورد صالح${ins.dead ? ' · <span style="color:var(--no)">' + ins.dead + " به مشكلة</span>" : ""} · ${esc(accessOf(ins.rows))}${p.status === "published" ? " · بدأها " + (p.starts || 0) : ""}</small></div><button class="chip" data-e="${esc(p.id)}">تعديل</button></div>`; }).join("") || '<p class="mut">لا توجد حزم.</p>'}</div>`;
  $$("#pkst [data-s]", m).forEach((b) => (b.onclick = () => { FILTER = b.dataset.s; view(m); }));
  $("#pknew", m).onclick = () => { EDIT = "new"; DRAFT = { isNew: true, id: null, slug: "", title: "", summary: "", cover: COVERS[0][0], levels: [], dom: (F().X.doms[0] || { slug: "thinking" }).slug, skills: [], est: "", status: "draft", sort: 100, keys: [] }; view(m); };
  $$("[data-e]", m).forEach((b) => (b.onclick = () => { const p = PACKS.find((x) => x.id === b.dataset.e); EDIT = p.id; DRAFT = { isNew: false, id: p.id, slug: p.slug, title: p.title, summary: p.summary || "", cover: p.cover, levels: (p.levels || []).slice(), dom: p.dom, skills: (p.skills || []).slice(), est: p.est_min == null ? "" : p.est_min, status: p.status, sort: p.sort_order, keys: (ITEMS[p.id] || []).slice() }; view(m); }));
} };

function edit(m) {
  const d = DRAFT, by = byKey(), ins = inspect(d, by), X = F().X, LVK = F().LVK, lvs = F().LVN;
  const rowH = (r, i) => `<div class="item"><div class="tx"><b>${i + 1}. ${r.it ? esc(r.it.title) : esc(r.key)}</b><small>${r.s === "ok" ? esc((F().CT[r.it.ct] || "") + " · " + (r.it.paid ? "مدفوع" : "مجاني")) : r.s === "dead" ? '<span style="color:var(--no)">غير موجود أو غير منشور</span>' : '<span style="color:var(--no)">لا يناسب مستوى الحزمة</span>'}</small></div><button class="chip" data-u="${i}" aria-label="رفع">↑</button><button class="chip" data-d="${i}" aria-label="إنزال">↓</button><button class="chip" data-x="${i}" aria-label="إزالة">✕</button></div>`;
  let res = [];
  if (d.levels.length && QRY.trim()) res = F().search(QRY, { lv: new Set(d.levels) }, "rel").map((x) => x.it).filter((it) => !d.keys.includes(it.key)).slice(0, 8);
  m.innerHTML = `<button class="chip" id="pkback">→ رجوع إلى الحزم</button>
  <label class="f"><span>عنوان الحزمة</span><input id="pt" value="${esc(d.title)}" maxlength="80"></label>
  <label class="f"><span>رمز الحزمة (إنجليزي، لا يتغير بعد الإنشاء)</span><input id="ps" dir="ltr" value="${esc(d.slug)}" maxlength="60" ${d.isNew ? "" : "disabled"} placeholder="a5-letters-pack"></label>
  <label class="f"><span>وصف مختصر</span><textarea id="pd" maxlength="300" rows="2">${esc(d.summary)}</textarea></label>
  <div class="f"><span>العمر أو الصف المستهدف</span><div class="chips" id="plv">${LVK.map((l) => `<button class="chip ${d.levels.includes(l) ? "on" : ""}" data-l="${l}" aria-pressed="${d.levels.includes(l)}">${esc(lvs[l])}</button>`).join("")}</div></div>
  <label class="f"><span>المجال التعليمي</span><select id="pm">${X.doms.map((x) => `<option value="${esc(x.slug)}" ${x.slug === d.dom ? "selected" : ""}>${esc(x.title)}</option>`).join("")}</select></label>
  <label class="f"><span>المهارات (واحدة في كل سطر)</span><textarea id="pk" rows="3">${esc(d.skills.join("\n"))}</textarea></label>
  <label class="f"><span>غلاف الحزمة (رسم كرتوني من المنصة)</span><select id="pc">${COVERS.map(([v, n]) => `<option value="${v}" ${v === d.cover ? "selected" : ""}>${n}</option>`).join("")}</select></label>
  <label class="f"><span>المدة التقديرية بالدقائق (اتركها فارغة إن لم يوجد تقدير موثوق)</span><input id="pe" type="number" min="5" max="600" value="${esc(d.est)}"></label>
  <label class="f"><span>الترتيب في الصفحة (الأصغر أولًا)</span><input id="po" type="number" value="${esc(d.sort)}"></label>
  <label class="f"><span>حالة الحزمة</span><select id="pst">${Object.keys(ST).map((k) => `<option value="${k}" ${k === d.status ? "selected" : ""}>${ST[k]}</option>`).join("")}</select></label>
  <div class="card"><b>موارد الحزمة (${ins.ok} صالحة${ins.dead ? "، " + ins.dead + " بها مشكلة" : ""}) · ${esc(accessOf(ins.rows))}</b><p class="mut">رتّب الموارد بالتسلسل التعليمي. لا تُضاف إلا موارد منشورة مناسبة لمستوى الحزمة؛ والملفات المدفوعة تُعرض للزائر كمعاينة فقط.</p>${ins.rows.map(rowH).join("") || '<p class="mut">لا موارد بعد.</p>'}</div>
  <label class="f"><span>إضافة مورد: ابحث بعنوانه (بعد اختيار العمر أو الصف)</span><input type="search" id="pq" value="${esc(QRY)}" placeholder="مثال: حروف"></label>
  <div id="pres">${d.levels.length ? res.map((it) => `<div class="item"><div class="tx"><b>${esc(it.title)}</b><small>${esc((F().CT[it.ct] || "") + " · " + (it.paid ? "مدفوع" : "مجاني") + " · " + it.lv.map(lvName).join("، "))}</small></div><button class="chip" data-a="${esc(it.key)}">إضافة</button></div>`).join("") || (QRY.trim() ? '<p class="mut">لا نتائج مناسبة لهذا المستوى.</p>' : "") : '<p class="mut">اختر العمر أو الصف أولًا.</p>'}</div>
  <div class="card" id="pprev"></div>
  <button class="chip on" id="psave">${d.isNew ? "إنشاء الحزمة" : "حفظ التعديلات"}</button> <button class="chip" id="ppv">معاينة</button> ${d.isNew ? "" : `<button class="chip" id="pdel" style="color:var(--no)">حذف الحزمة</button>`}${!d.isNew && d.status === "published" ? ` <a class="chip" href="../packs/view/?p=${encodeURIComponent(d.slug)}" target="_blank" rel="noopener">فتح الصفحة العامة</a>` : ""}`;
  const sync = () => { d.title = $("#pt", m).value; if (d.isNew) d.slug = $("#ps", m).value.trim().toLowerCase(); d.summary = $("#pd", m).value; d.dom = $("#pm", m).value; d.skills = $("#pk", m).value.split("\n").map((x) => x.trim()).filter(Boolean).slice(0, 8); d.cover = $("#pc", m).value; d.est = $("#pe", m).value; d.sort = parseInt($("#po", m).value, 10) || 100; d.status = $("#pst", m).value; };
  const again = () => { sync(); edit(m); };
  $("#pkback", m).onclick = () => { EDIT = null; DRAFT = null; QRY = ""; SUB.packsadm.fn(m); };
  $$("#plv [data-l]", m).forEach((b) => (b.onclick = () => { sync(); const l = b.dataset.l; d.levels = d.levels.includes(l) ? d.levels.filter((x) => x !== l) : LVK.filter((x) => d.levels.includes(x) || x === l); edit(m); }));
  $$("[data-u]", m).forEach((b) => (b.onclick = () => { sync(); const i = +b.dataset.u; if (i > 0) { [d.keys[i - 1], d.keys[i]] = [d.keys[i], d.keys[i - 1]]; } edit(m); }));
  $$("[data-d]", m).forEach((b) => (b.onclick = () => { sync(); const i = +b.dataset.d; if (i < d.keys.length - 1) { [d.keys[i + 1], d.keys[i]] = [d.keys[i], d.keys[i + 1]]; } edit(m); }));
  $$("[data-x]", m).forEach((b) => (b.onclick = () => { sync(); d.keys.splice(+b.dataset.x, 1); edit(m); }));
  $$("[data-a]", m).forEach((b) => (b.onclick = () => { sync(); if (d.keys.length >= MAX_ITEMS) return toast("الحد الأقصى " + MAX_ITEMS + " موردًا"); if (!d.keys.includes(b.dataset.a)) d.keys.push(b.dataset.a); edit(m); }));
  let t; $("#pq", m).oninput = (e) => { clearTimeout(t); t = setTimeout(() => { sync(); QRY = e.target.value; edit(m); const x = $("#pq", m); x.focus(); x.setSelectionRange(x.value.length, x.value.length); }, 250); };
  $("#ppv", m).onclick = () => { sync(); const i2 = inspect(d, by); $("#pprev", m).innerHTML = `<b>معاينة الحزمة</b><div class="item"><div class="tx"><b>${esc(d.title)}</b><small>${esc(d.levels.map(lvName).join("، "))} · ${esc((X.doms.find((x) => x.slug === d.dom) || { title: "" }).title)} · ${i2.ok} موارد · ${esc(accessOf(i2.rows))}</small></div></div><p class="mut">${esc(d.summary)}</p><ol>${i2.rows.map((r) => `<li>${r.it ? esc(r.it.title) : esc(r.key) + " (مشكلة)"}</li>`).join("")}</ol><p class="mut">${esc(validate(Object.assign({}, d, { status: "published" }), i2, new Set(PACKS.map((x) => x.slug)))) || "الحزمة جاهزة للنشر."}</p>`; };
  $("#psave", m).onclick = async () => {
    sync(); const i2 = inspect(d, by), err = validate(d, i2, new Set(PACKS.map((x) => x.slug))); if (err) return toast(err);
    const row = { title: d.title.trim(), summary: d.summary.trim(), cover: d.cover, levels: d.levels, dom: d.dom, skills: d.skills, est_min: d.est === "" || d.est == null ? null : +d.est, status: d.status, sort_order: d.sort };
    try {
      let id = d.id;
      if (d.isNew) { const q = await sb.from("packs").insert(Object.assign({ slug: d.slug }, row)).select("id").single(); if (q.error) throw q.error; id = q.data.id; }
      else { const q = await sb.from("packs").update(row).eq("id", id); if (q.error) throw q.error; }
      const prev = ITEMS[id] || [], rows = d.keys.map((k, i) => ({ pack_id: id, key: k, pos: i + 1 }));
      if (rows.length) { const q = await sb.from("pack_items").upsert(rows, { onConflict: "pack_id,key" }); if (q.error) throw q.error; }
      const gone = prev.filter((k) => !d.keys.includes(k)); if (gone.length) { const q = await sb.from("pack_items").delete().eq("pack_id", id).in("key", gone); if (q.error) throw q.error; }
      toast(d.isNew ? "تم إنشاء الحزمة ✓" : "تم الحفظ ✓"); EDIT = null; DRAFT = null; QRY = ""; SUB.packsadm.fn(m);
    } catch (e) { fail(e); }
  };
  const del = $("#pdel", m); if (del) del.onclick = async () => { if (!confirm("حذف الحزمة «" + d.title + "» نهائيًا؟ لن يتأثر المحتوى نفسه، لكن تُحذف الحزمة وقائمة مواردها.")) return; try { const q = await sb.from("packs").delete().eq("id", d.id); if (q.error) throw q.error; toast("حُذفت الحزمة"); EDIT = null; DRAFT = null; SUB.packsadm.fn(m); } catch (e) { fail(e); } };
  void again;
}
window.__packsTest = { validate, inspect, checkItem, accessOf, SLUG, KEYRE };
})();
