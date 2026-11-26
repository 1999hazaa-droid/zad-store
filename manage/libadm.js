/* إدارة المكتبة التعليمية — تعمل داخل لوحة زاد المحمية (نفس تسجيل الدخول وصلاحيات المدير) */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, ask, fail, imgU, go, productSheet, SUB, ago } = Z;
const ST = Object.fromEntries(Z.LIBSTATUS), STC = { draft: "#ece8fb", review: "#fff3c4", published: "#d8f5e6", unpublished: "#ffe3d1" };
const SECTYPE = { ws: "worksheet", cards: "cards", stories: "story", home: "home_activity", review: "review" };
const FIELDS = { name: "العنوان", description: "الوصف", image_url: "الغلاف", price: "السعر", lib_section: "القسم", lib_levels: "العمر/الصف", lib_subject: "المادة", lib_skill: "المهارة", lib_type: "النوع", lib_unit: "الوحدة", lib_difficulty: "مستوى الصعوبة", lib_keywords: "الكلمات المفتاحية", lib_status: "حالة النشر", file_url: "الملف", bw_url: "ملف أبيض وأسود", pages: "الصفحات", is_visible: "الظهور", thumb_url: "الصورة المصغرة", is_available: "التوفر", old_price: "السعر قبل الخصم", slug: "الرابط", category_id: "تصنيف المتجر", sort_order: "ترتيب المتجر", is_best_seller: "الأكثر طلبًا", is_new_arrival: "جديد", file_type: "نوع الملف" };
const ACT = { create: "إضافة", update: "تعديل", status: "تغيير الحالة", delete: "حذف", restore: "استعادة" };
let ALL = [], F = { q: "", status: "", type: "", sec: "" };

const effType = (p) => p.lib_type || SECTYPE[p.lib_section] || "";
const byOrder = (a, b) => ((a.lib_order == null) - (b.lib_order == null)) * -1 || (a.lib_order == null ? 0 : a.lib_order - b.lib_order) || Date.parse(b.created_at) - Date.parse(a.created_at);
const tax = () => Z.libTaxNow();
const secName = (k) => (tax().sections.find((x) => x[0] === k) || [0, k || "—"])[1];
const lvName = (k) => (tax().levels.find((x) => x[0] === k) || [0, k])[1];
const typeName = (k) => (tax().type.find((x) => x[0] === k) || [0, ""])[1];
const norm = (s) => String(s || "").toLowerCase().replace(/[ً-ٰٟ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");

/* جاهزية النشر: لا يُنشر ملف ناقص */
function readiness(p) {
  const miss = [];
  if (!p.name || !p.name.trim()) miss.push("العنوان");
  if (!p.description || p.description.trim().length < 15) miss.push("وصف واضح");
  if (!p.image_url) miss.push("صورة الغلاف");
  if (!p.lib_section) miss.push("القسم");
  if (!(p.lib_levels || []).length) miss.push("العمر أو الصف");
  if (Number(p.price) === 0 ? !(p.file_url && !String(p.file_url).startsWith("private:")) : !p.file_url) miss.push("الملف");
  return miss;
}

async function load() {
  const [p] = await Promise.all([sb.from("products").select("*").not("lib_section", "is", null).limit(1000), Z.loadTax()]);
  if (p.error) throw p.error;
  ALL = (p.data || []).sort(byOrder);
}

SUB.libadm = { title: "إدارة المكتبة", fn: async function view(m) {
  await load();
  const n = (f) => ALL.filter(f).length;
  const stats = [[ALL.length, "كل الملفات"], [n((p) => effType(p) === "worksheet"), "أوراق العمل"], [n((p) => effType(p) === "story"), "القصص التعليمية"], [n((p) => ["home_activity", "printable_activity"].includes(effType(p)) || ["color", "think", "home"].includes(p.lib_section)), "الأنشطة"], [n((p) => p.lib_status === "published"), "منشور"], [n((p) => p.lib_status !== "published"), "غير منشور"]];
  const latest = ALL.slice().sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 5);
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px">${stats.map(([v, l]) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`).join("")}</div>
  <p class="mut" style="margin:6px 4px;font-size:13px">غير المنشور: ${n((p) => p.lib_status === "draft")} مسودة · ${n((p) => p.lib_status === "review")} قيد المراجعة · ${n((p) => p.lib_status === "unpublished")} غير منشور</p>
  <div class="card"><b>أحدث المحتويات المضافة</b>${latest.map((p) => `<div style="font-size:14px;margin-top:6px"><span data-e="${p.id}" style="cursor:pointer;color:var(--p);font-weight:700">${esc(p.name)}</span> <small class="mut">· ${ago(p.created_at)} · ${ST[p.lib_status] || "—"}</small></div>`).join("")}</div>
  <div class="row"><button class="btn" id="ln">➕ محتوى جديد</button><button class="btn g" id="lt">🗂️ التصنيفات</button></div>
  <div class="row" style="margin-top:8px"><button class="btn g" id="la">📜 سجل التغييرات</button><button class="btn g" id="lb">💾 نسخة احتياطية</button></div>
  <div class="row" style="margin-top:8px"><button class="btn g" id="lrv">🔍 مركز مراجعة المكتبة</button></div>
  <input type="search" id="lq" placeholder="🔍 ابحث بالعنوان أو المادة أو الكلمات المفتاحية" value="${esc(F.q)}" style="margin-top:12px">
  <div class="chips" id="lch"></div>
  <div class="row"><label class="f"><span>النوع</span><select id="lty"><option value="">كل الأنواع</option>${tax().type.map(([k, v]) => `<option value="${k}" ${F.type === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>
  <label class="f"><span>القسم</span><select id="lse"><option value="">كل الأقسام</option>${tax().sections.map(([k, v]) => `<option value="${k}" ${F.sec === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label></div>
  <div id="lls"></div>`;
  const reload = () => view(m);
  const draw = () => {
    $("#lch").innerHTML = [["", `الكل (${ALL.length})`], ...Z.LIBSTATUS.map(([k, v]) => [k, `${v} (${n((p) => p.lib_status === k)})`])].map(([k, l]) => `<button class="chip ${F.status === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    const q = norm(F.q).split(" ").filter(Boolean);
    const list = ALL.filter((p) => (!F.status || p.lib_status === F.status) && (!F.type || effType(p) === F.type) && (!F.sec || p.lib_section === F.sec) && (!q.length || q.every((w) => norm([p.name, p.lib_subject, p.lib_skill, p.lib_unit, p.lib_keywords, p.description].join(" ")).includes(w))));
    $("#lls").innerHTML = list.length ? list.slice(0, 150).map((p) => `<div class="item" data-p="${p.id}">${p.thumb_url || p.image_url ? `<img loading="lazy" src="${esc(imgU(p.thumb_url || p.image_url))}" alt="">` : `<div class="ph">🖼️</div>`}<div class="tx"><b>${esc(p.name)}</b><small>${esc([secName(p.lib_section), (p.lib_levels || []).map(lvName).join("، "), typeName(effType(p))].filter(Boolean).join(" · "))}</small></div><span style="background:${STC[p.lib_status] || "#eee"};border-radius:10px;padding:3px 9px;font-size:12px;font-weight:700;white-space:nowrap">${ST[p.lib_status] || "—"}</span></div>`).join("") + (list.length > 150 ? `<p class="mut">يُعرض أول 150 نتيجة. استخدم البحث لتضييق القائمة.</p>` : "") : `<div class="empty">لا يوجد محتوى بهذه الشروط</div>`;
    $$("#lch [data-s]").forEach((b) => b.onclick = () => { F.status = b.dataset.s; draw(); });
    $$("#lls [data-p]").forEach((r) => r.onclick = () => actions(ALL.find((x) => x.id === r.dataset.p), reload, !(F.q || F.status || F.type || F.sec)));
  };
  $$("[data-e]", m).forEach((e) => e.onclick = () => productSheet(ALL.find((x) => x.id === e.dataset.e), reload));
  $("#lq").oninput = (e) => { F.q = e.target.value; draw(); };
  $("#lty").onchange = (e) => { F.type = e.target.value; draw(); };
  $("#lse").onchange = (e) => { F.sec = e.target.value; draw(); };
  $("#ln").onclick = () => productSheet(null, reload, { lib_section: "ws", lib_levels: [], lib_status: "draft", is_visible: false, price: 0 });
  $("#lt").onclick = () => taxSheet(reload);
  $("#lrv").onclick = () => window.__go("libreviewadm"); $("#la").onclick = () => auditSheet(reload);
  $("#lb").onclick = backup;
  draw();
} };

/* إجراءات سريعة على عنصر */
function actions(p, reload, canOrder) {
  if (!p) return;
  const s = sheet(`<h2>${esc(p.name)}</h2><p class="mut" style="margin:0 0 8px">${esc(secName(p.lib_section))} · الحالة: <b>${ST[p.lib_status] || "—"}</b></p>
  <button class="btn" id="ae">✏️ تعديل المحتوى والملفات</button>
  <p style="margin:12px 2px 4px;font-weight:700">تغيير حالة النشر</p>
  <div class="chips" style="flex-wrap:wrap">${Z.LIBSTATUS.map(([k, v]) => `<button class="chip ${p.lib_status === k ? "on" : ""}" data-st="${k}">${v}</button>`).join("")}</div>
  ${canOrder ? `<div class="row" style="margin-top:12px"><button class="btn g" id="au">⬆️ تقديم</button><button class="btn g" id="ad">⬇️ تأخير</button></div>` : `<p class="mut" style="font-size:12px;margin-top:10px">لترتيب المحتوى امسح البحث والفلاتر أولًا.</p>`}
  <button class="btn red" id="ax" style="margin-top:14px">🗑️ حذف من المكتبة</button>`);
  $("#ae", s).onclick = () => { closeSheet(); productSheet(p, reload); };
  $$("[data-st]", s).forEach((b) => b.onclick = async () => {
    const st = b.dataset.st; if (st === p.lib_status) return closeSheet();
    if (st === "published") { const miss = readiness(p); if (miss.length) return toast("لا يمكن النشر قبل إكمال: " + miss.join("، ")); }
    const { error } = await sb.from("products").update({ lib_status: st }).eq("id", p.id);
    if (error) return fail(error);
    const chk = await sb.from("products").select("lib_status,is_visible").eq("id", p.id).single();
    if (chk.error || chk.data.lib_status !== st || chk.data.is_visible !== (st === "published")) return toast("تعذّر التأكد من الحفظ، حدّث الصفحة وحاول ثانية");
    closeSheet(); toast(st === "published" ? "نُشر ✓ يظهر في المكتبة الآن" : `تم: ${ST[st]} ✓`); reload();
  });
  const move = async (d) => {
    const ids = ALL.map((x) => x.id), i = ids.indexOf(p.id), j = i + d; if (j < 0 || j >= ids.length) return toast("هذا آخر موضع");
    [ids[i], ids[j]] = [ids[j], ids[i]];
    const { error } = await sb.rpc("lib_set_order", { ids }); if (error) return fail(error);
    closeSheet(); toast("تم الترتيب ✓"); reload();
  };
  if (canOrder) { $("#au", s).onclick = () => move(-1); $("#ad", s).onclick = () => move(1); }
  $("#ax", s).onclick = async () => {
    closeSheet();
    if (!(await ask(`حذف «${p.name}» من المكتبة والمنصة؟`, "نعم، احذف"))) return;
    const { error } = await sb.from("products").delete().eq("id", p.id);
    if (error) return fail(error);
    const chk = await sb.from("products").select("id", { count: "exact", head: true }).eq("id", p.id);
    if (chk.count) return toast("لم يُحذف، تحقق من الصلاحيات");
    toast("حُذف. يمكنك استعادته من «سجل التغييرات»"); reload();
  };
}

/* التصنيفات */
const KINDS = [["age", "الأعمار"], ["grade", "الصفوف"], ["subject", "المواد"], ["type", "أنواع المحتوى"], ["section", "الأقسام"], ["skill", "المهارات"], ["unit", "الوحدات والدروس"]];
const USE = { age: (p, k) => (p.lib_levels || []).includes(k), grade: (p, k) => (p.lib_levels || []).includes(k), subject: (p, k) => p.lib_subject === k, type: (p, k) => p.lib_type === k, section: (p, k) => p.lib_section === k, skill: (p, k) => p.lib_skill === k, unit: (p, k) => p.lib_unit === k };
let tk = "subject";
async function taxSheet(reload) {
  await Z.loadTax();
  const rows = (Z.TAX || []).filter((r) => r.kind === tk).sort((a, b) => a.sort - b.sort);
  const s = sheet(`<h2>إدارة التصنيفات</h2>
  <div class="chips" style="flex-wrap:wrap">${KINDS.map(([k, l]) => `<button class="chip ${tk === k ? "on" : ""}" data-k="${k}">${l}</button>`).join("")}</div>
  <p class="mut" style="font-size:13px;margin:8px 2px">التعديل والإضافة لا يغيّران الملفات الموجودة. الحذف متاح فقط لما لا يستخدمه أي ملف، وإلا عطّله ليختفي من الخيارات الجديدة.</p>
  ${rows.map((r) => { const used = ALL.filter((p) => USE[tk](p, r.key)).length; return `<div class="item" style="cursor:default"><div class="tx"><b style="${r.active ? "" : "opacity:.5"}">${esc(r.label)}</b><small>${used} ملف${r.active ? "" : " · معطّل"}</small></div><button class="chip" data-ed="${esc(r.key)}">تعديل</button><button class="chip" data-tg="${esc(r.key)}">${r.active ? "تعطيل" : "تفعيل"}</button>${used ? "" : `<button class="chip" data-rm="${esc(r.key)}">🗑️</button>`}</div>`; }).join("") || `<div class="empty">لا توجد عناصر</div>`}
  <div class="row" style="margin-top:10px"><input type="text" id="tnew" placeholder="إضافة جديد…" style="flex:2"><button class="btn sm" id="tadd" style="flex:1">إضافة</button></div>`);
  $$("[data-k]", s).forEach((b) => b.onclick = () => { tk = b.dataset.k; taxSheet(reload); });
  const done = (msg) => { toast(msg); taxSheet(reload); };
  $("#tadd", s).onclick = async () => {
    const label = $("#tnew", s).value.trim(); if (!label) return toast("اكتب الاسم");
    if (rows.some((r) => r.label === label)) return toast("هذا الاسم موجود");
    let key = label;
    if (["age", "grade"].includes(tk)) { const pre = tk === "age" ? "a" : "g", mx = Math.max(0, ...(Z.TAX || []).filter((r) => r.key[0] === pre && r.kind === tk).map((r) => parseInt(r.key.slice(1), 10) || 0)); key = pre + (mx + 1); }
    else if (["type", "section"].includes(tk)) key = "c" + Math.random().toString(36).slice(2, 7);
    const { error } = await sb.from("lib_taxonomy").insert({ kind: tk, key, label, sort: (rows.reduce((a, r) => Math.max(a, r.sort), 0)) + 1 });
    if (error) return fail(error); done("أُضيف ✓");
  };
  $$("[data-tg]", s).forEach((b) => b.onclick = async () => { const r = rows.find((x) => x.key === b.dataset.tg); const { error } = await sb.from("lib_taxonomy").update({ active: !r.active }).eq("kind", tk).eq("key", r.key); if (error) return fail(error); done("تم ✓"); });
  $$("[data-rm]", s).forEach((b) => b.onclick = async () => { const { error } = await sb.from("lib_taxonomy").delete().eq("kind", tk).eq("key", b.dataset.rm); if (error) return fail(error); done("حُذف ✓"); });
  $$("[data-ed]", s).forEach((b) => b.onclick = () => {
    const r = rows.find((x) => x.key === b.dataset.ed);
    const e = sheet(`<h2>تعديل الاسم</h2>${tk === "subject" ? `<p class="mut" style="font-size:13px">سيتحدّث اسم المادة في كل الملفات المرتبطة بها.</p>` : ""}<label class="f"><span>الاسم</span><input type="text" id="tn" value="${esc(r.label)}"></label><div class="row"><button class="btn" id="ty">حفظ</button><button class="btn g" id="tc">إلغاء</button></div>`);
    $("#tc", e).onclick = () => taxSheet(reload);
    $("#ty", e).onclick = async () => {
      const v = $("#tn", e).value.trim(); if (!v) return toast("اكتب الاسم"); if (v === r.label) return taxSheet(reload);
      if (tk === "subject") { const { error } = await sb.rpc("lib_rename_subject", { old_label: r.key, new_label: v }); if (error) return fail(error); await load(); }
      else { const { error } = await sb.from("lib_taxonomy").update({ label: v }).eq("kind", tk).eq("key", r.key); if (error) return fail(error); }
      done("تم التعديل ✓");
    };
  });
}

/* سجل التغييرات + الاستعادة */
async function auditSheet(reload) {
  const { data, error } = await sb.from("lib_audit").select("id,at,action,product_id,product_name,changed,before").order("id", { ascending: false }).limit(60);
  if (error) return fail(error);
  const s = sheet(`<h2>سجل التغييرات</h2><p class="mut" style="font-size:13px;margin:0 2px 8px">آخر 60 تغييرًا. «استعادة» تعيد المحتوى لحالته قبل ذلك التغيير.</p>${(data || []).map((a) => `<div class="card" style="padding:10px"><b style="font-size:14px">${ACT[a.action] || a.action}: ${esc(a.product_name || "")}</b><div class="mut" style="font-size:12px">${ago(a.at)}${a.changed ? " · " + esc(a.changed.map((c) => FIELDS[c] || c).join("، ")) : ""}</div>${a.before && a.action !== "create" && a.action !== "restore" ? `<button class="chip" data-r="${a.id}" style="margin-top:6px">↩️ استعادة النسخة السابقة</button>` : ""}</div>`).join("") || `<div class="empty">لا توجد تغييرات مسجّلة بعد</div>`}`);
  $$("[data-r]", s).forEach((b) => b.onclick = async () => {
    closeSheet(); if (!(await ask("استعادة هذه النسخة السابقة؟", "نعم، استعد"))) return;
    const { error: er } = await sb.rpc("lib_restore", { aid: Number(b.dataset.r) }); if (er) return fail(er);
    toast("تمت الاستعادة ✓"); reload();
  });
}

/* نسخة احتياطية تُحفظ على جهازك (JSON) */
async function backup() {
  toast("جاري تجهيز النسخة…");
  const p = await sb.from("products").select("*").not("lib_section", "is", null).limit(2000);
  if (p.error) return fail(p.error);
  const ids = (p.data || []).map((x) => x.id), media = [];
  for (let i = 0; i < ids.length; i += 40) { const r = await sb.from("product_media").select("*").in("product_id", ids.slice(i, i + 40)); if (r.error) return fail(r.error); media.push(...r.data); }
  const tx = await sb.from("lib_taxonomy").select("*");
  const blob = new Blob([JSON.stringify({ made_at: new Date().toISOString(), products: p.data, product_media: media, taxonomy: tx.data || [] }, null, 1)], { type: "application/json" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `zad-library-backup-${new Date().toISOString().slice(0, 10)}.json`; document.body.appendChild(a); a.click(); a.remove();
  toast(`تم تنزيل نسخة تضم ${p.data.length} ملفًا ✓`);
}
window.__libadm = { readiness, effType };
})();
