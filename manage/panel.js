/* لوحة تحكم زاد التعليمية — بسيطة: كل تعديل يُحفظ ويظهر في المنصة مباشرة */
(function () {
"use strict";
const URL_ = "https://zcnwzpevehudhnsuljdy.supabase.co";
const KEY = "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const SITE = new URL("../", location.href).href;
/* رسالة واضحة عند منع النشر من أي صفحة إدارة (المنع نفسه في قاعدة البيانات: مركز الجودة) */
{ const of = window.fetch.bind(window); window.fetch = async function () { const r = await of.apply(null, arguments); try { if (!r.ok && r.status >= 400 && r.status < 500) r.clone().text().then((t) => { const i = t.indexOf("QUALITY_GATE:"); if (i >= 0) { const msg = t.slice(i + 13).split('"')[0].trim(); setTimeout(() => toast(msg || "لا يمكن النشر قبل اجتياز مراجعة الجودة"), 250); } }).catch(() => {}); } catch (e) { /* */ } return r; }; }
const sb = supabase.createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "zad-admin-auth" } });
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const app = $("#app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const imgU = (u) => !u ? "" : /^(https?:|data:|blob:)/i.test(u) ? u : SITE + String(u).replace(/^\/+/, "");
const money = (n) => (Number(n) || 0).toFixed(3).replace(/\.?0+$/, "") + " ر.ع";
const ago = (d) => { const m = (Date.now() - Date.parse(d)) / 6e4; if (m < 1) return "الآن"; if (m < 60) return `قبل ${m | 0} دقيقة`; if (m < 1440) return `قبل ${(m / 60) | 0} ساعة`; return `قبل ${(m / 1440) | 0} يوم`; };
const digits = (s) => String(s || "").replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/\D/g, "");
const wa = (phone, text) => `https://wa.me/${digits(phone)}${text ? "?text=" + encodeURIComponent(text) : ""}`;
let tt;
function toast(m) { $(".toast")?.remove(); const e = document.createElement("div"); e.className = "toast"; e.textContent = m; document.body.appendChild(e); clearTimeout(tt); tt = setTimeout(() => e.remove(), 2400); }
function sheet(html, onOpen) {
  closeSheet();
  const o = document.createElement("div"); o.className = "ov"; o.id = "ov";
  o.innerHTML = `<div class="sheet">${html}</div>`;
  o.addEventListener("click", (e) => { if (e.target === o) closeSheet(); });
  document.body.appendChild(o);
  onOpen && onOpen(o.firstChild);
  return o.firstChild;
}
function closeSheet() { $("#ov")?.remove(); }
function ask(msg, okText = "نعم، احذف") {
  return new Promise((res) => {
    const s = sheet(`<h2>${esc(msg)}</h2><p class="mut">لا يمكن التراجع عن هذا.</p><div class="row"><button class="btn red" id="y">${okText}</button><button class="btn g" id="n">إلغاء</button></div>`);
    $("#y", s).onclick = () => { closeSheet(); res(true); }; $("#n", s).onclick = () => { closeSheet(); res(false); };
  });
}
const fail = (e) => { console.error(e); toast("تعذّر الحفظ. تأكد من الإنترنت وحاول مرة ثانية"); };

/* ---------- الدخول ---------- */
async function boot() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get("type") === "recovery" && h.get("access_token")) return recoveryView(h);
  const { data } = await sb.auth.getSession();
  if (!data.session) return loginView();
  const { data: row } = await sb.from("admin_users").select("id").eq("id", data.session.user.id).maybeSingle();
  if (!row) { await sb.auth.signOut(); return loginView("هذا الحساب ليس حساب مدير المنصة"); }
  shell();
}
function loginView(err = "") {
  app.innerHTML = `<div class="login"><div style="font-size:54px">🔐</div><h1>لوحة تحكم زاد</h1>
  <label class="f"><span>البريد الإلكتروني</span><input type="email" id="em" dir="ltr" autocomplete="username" autocapitalize="none" autocorrect="off" spellcheck="false" inputmode="email"></label>
  <label class="f"><span>كلمة المرور</span><input type="password" id="pw" dir="ltr" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false"></label>
  <label class="sw" style="justify-content:flex-start"><input type="checkbox" id="sh"><span>إظهار كلمة المرور</span></label>
  <p id="er" style="color:var(--no);font-weight:700;min-height:24px">${esc(err)}</p><button class="btn" id="go">دخول</button>
  <button class="btn g" id="fg" style="margin-top:10px">نسيت كلمة المرور؟</button></div>`;
  $("#sh").onchange = (e) => $("#pw").type = e.target.checked ? "text" : "password";
  const go = async () => {
    const email = $("#em").value.trim().toLowerCase(), pw = $("#pw").value.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
    if (!email || !pw) { $("#er").textContent = "اكتب البريد وكلمة المرور"; return; }
    $("#er").textContent = "جاري الدخول…"; $("#go").disabled = true;
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password: pw });
      if (error) { $("#er").textContent = /invalid/i.test(error.message) ? "البريد أو كلمة المرور غير صحيحة. جرّب «نسيت كلمة المرور»" : "خطأ: " + error.message; $("#go").disabled = false; return; }
      await boot();
    } catch (e) { $("#er").textContent = "تعذّر الاتصال: " + (e && e.message || e); $("#go").disabled = false; }
  };
  $("#go").onclick = go; $("#pw").onkeydown = (e) => e.key === "Enter" && go();
  $("#fg").onclick = async () => {
    const email = $("#em").value.trim().toLowerCase(); if (!email) { $("#er").textContent = "اكتب بريدك أولاً ثم اضغط «نسيت كلمة المرور»"; return; }
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    $("#er").style.color = error ? "var(--no)" : "var(--ok)"; $("#er").textContent = error ? "تعذّر الإرسال: " + error.message : "أرسلنا رابط تغيير كلمة المرور إلى بريدك ✓";
  };
}
function recoveryView(h) {
  app.innerHTML = `<div class="login"><div style="font-size:54px">🔑</div><h1>كلمة مرور جديدة</h1><label class="f"><span>كلمة المرور الجديدة (8 أحرف فأكثر)</span><input type="password" id="np" dir="ltr" autocapitalize="none"></label><p id="er" style="color:var(--no);font-weight:700"></p><button class="btn" id="go">حفظ ودخول</button></div>`;
  $("#go").onclick = async () => {
    const v = $("#np").value; if (v.length < 8) { $("#er").textContent = "كلمة المرور قصيرة"; return; }
    await sb.auth.setSession({ access_token: h.get("access_token"), refresh_token: h.get("refresh_token") });
    const { error } = await sb.auth.updateUser({ password: v });
    if (error) { $("#er").textContent = "تعذّر: " + error.message; return; }
    history.replaceState(null, "", location.pathname); boot();
  };
}

/* ---------- الهيكل ---------- */
const TABS = [["home", "🏠", "الرئيسية"], ["orders", "🧾", "الطلبات"], ["products", "🛍️", "المنتجات"], ["learn", "🦉", "تعلّم والعب"], ["more", "⚙️", "المزيد"]];
let tab = "home", pendingCount = 0;
function shell() {
  app.innerHTML = `<header><h1 id="ttl">لوحة زاد</h1><div class="hb"><a class="ib" href="${SITE}" target="_blank">🌐 المنصة</a></div></header><main id="main"></main>
  <nav><div>${TABS.map(([k, e, l]) => `<button data-t="${k}"><b>${e}</b>${l}<i hidden></i></button>`).join("")}</div></nav>`;
  $$("nav button").forEach((b) => b.onclick = () => go(b.dataset.t));
  loadTax();
  go(location.hash.slice(1) || "home");
}
function badge() { const i = $('nav button[data-t="orders"] i'); if (i) { i.textContent = pendingCount; i.hidden = !pendingCount; } }
function go(t, force) {
  if (qzDirty && !force) { ask("لم تحفظ تغييرات الاختبار. هل تخرج دون حفظ؟", "خروج دون حفظ").then((y) => { if (y) { qzDirty = false; go(t, true); } else { const b = $("#qzbar"); b && b.classList.add("on"); } }); return; }
  if (!TABS.some((x) => x[0] === t) && !SUB[t]) t = "home";
  tab = t; history.replaceState(null, "", "#" + t);
  const main = TABS.some((x) => x[0] === t) ? t : "more";
  $$("nav button").forEach((b) => b.classList.toggle("on", b.dataset.t === main));
  const name = (TABS.find((x) => x[0] === t) || [])[2] || (SUB[t] || {}).title || "";
  $("#ttl").textContent = name || "لوحة زاد";
  const m = $("#main"); m.innerHTML = `<div class="spin">جاري التحميل…</div>`; window.scrollTo(0, 0);
  const f = VIEWS[t] || (SUB[t] && SUB[t].fn);
  Promise.resolve(f(m)).catch((e) => { console.error(e); m.innerHTML = `<div class="empty">تعذّر التحميل 😕<br><button class="btn sm" onclick="location.reload()">إعادة المحاولة</button></div>`; });
}
const back = (to = "more") => `<button class="chip" onclick="window.__go('${to}')">→ رجوع</button>`;
window.__go = go;

/* ---------- الرئيسية ---------- */
async function home(m) {
  const [o, p] = await Promise.all([
    sb.from("orders").select("id,order_no,customer_name,total,status,hidden,ordered_at,phone").order("ordered_at", { ascending: false }).limit(1000),
    sb.from("products").select("id", { count: "exact", head: true })
  ]);
  const orders = (o.data || []).filter((x) => !x.hidden), news = orders.filter((x) => x.status === "new");
  pendingCount = news.length; badge();
  const mon = new Date().toISOString().slice(0, 7);
  const sum = orders.filter((x) => (x.ordered_at || "").startsWith(mon)).reduce((a, x) => a + Number(x.total || 0), 0);
  m.innerHTML = `<div class="grid2"><div class="stat ${news.length ? "hot" : ""}"><b>${news.length}</b><span>طلبات جديدة</span></div><div class="stat"><b>${orders.length}</b><span>كل الطلبات</span></div>
  <div class="stat"><b>${money(sum)}</b><span>مبيعات هذا الشهر</span></div><div class="stat"><b>${p.count ?? "—"}</b><span>منتجات</span></div></div>
  <h3 style="margin:18px 2px 4px">اختصارات</h3>
  <div class="big">
   <button style="--c:#fff3c4;--s:#ecd57d" data-g="newp"><b>➕</b>منتج جديد</button>
   <button style="--c:#e6dcff;--s:#c1aef0" data-g="learn"><b>🔑</b>كود تعلّم والعب</button>
   <button style="--c:#d8f5e6;--s:#9fdcbc" data-g="coupons"><b>🎟️</b>كود خصم</button>
   <button style="--c:#ffdbe9;--s:#f0a9c6" data-g="settings"><b>🏪</b>إعدادات المنصة</button></div>
  <h3 style="margin:18px 2px 4px">آخر الطلبات الجديدة</h3>
  ${news.length ? news.slice(0, 5).map(orderRow).join("") : `<div class="empty">لا توجد طلبات جديدة ✨</div>`}`;
  $$("[data-g]", m).forEach((b) => b.onclick = () => b.dataset.g === "newp" ? productSheet(null) : go(b.dataset.g));
  bindOrders(m, home);
}

/* ---------- الطلبات ---------- */
let oFilter = "new";
const orderRow = (o) => `<div class="item" data-o="${o.id}"><div class="ph">${o.status === "new" ? "🆕" : "✅"}</div><div class="tx"><b>${esc(o.customer_name || "زبون")} · ${money(o.total)}</b><small>#${esc(o.order_no || "")} · ${ago(o.ordered_at)}</small></div><span class="tag ${o.status === "new" ? "new" : "done"}">${o.status === "new" ? "جديد" : "تم التسليم"}</span></div>`;
function bindOrders(m, reload) { $$("[data-o]", m).forEach((r) => r.onclick = () => orderSheet(r.dataset.o, reload)); }
async function orders(m) {
  const { data, error } = await sb.from("orders").select("*").order("ordered_at", { ascending: false }).limit(300);
  if (error) throw error;
  const all = data || []; pendingCount = all.filter((x) => x.status === "new" && !x.hidden).length; badge();
  const draw = () => {
    const list = all.filter((o) => oFilter === "hidden" ? o.hidden : !o.hidden && (oFilter === "all" || o.status === oFilter));
    m.innerHTML = `<div class="chips">${[["new", "🆕 جديد"], ["delivered", "✅ تم التسليم"], ["all", "الكل"], ["hidden", "🗂️ مؤرشف"]].map(([k, l]) => `<button class="chip ${oFilter === k ? "on" : ""}" data-f="${k}">${l}</button>`).join("")}</div>${list.length ? list.map(orderRow).join("") : `<div class="empty">لا توجد طلبات هنا</div>`}`;
    $$("[data-f]", m).forEach((b) => b.onclick = () => { oFilter = b.dataset.f; draw(); });
    $$("[data-o]", m).forEach((r) => r.onclick = () => orderSheet(r.dataset.o, () => orders(m), all));
  };
  draw();
}
async function orderSheet(id, reload, cache) {
  let o = cache && cache.find((x) => x.id === id);
  if (!o) { const { data } = await sb.from("orders").select("*").eq("id", id).maybeSingle(); o = data; }
  if (!o) return;
  const s = sheet(`<h2>طلب #${esc(o.order_no || "")}</h2>
  <div class="card"><b>${esc(o.customer_name || "")}</b><br><span class="mut" dir="ltr">${esc(o.phone || "")}</span>
   ${o.governorate || o.address ? `<br><span class="mut">📍 ${esc([o.governorate, o.wilaya, o.address].filter(Boolean).join("، "))}</span>` : ""}</div>
  <div class="card"><h3>الطلب</h3><div style="white-space:pre-wrap">${esc(o.items_text || "")}</div>
   <p class="mut" style="margin:8px 0 0">التوصيل: ${esc(o.delivery_name || "—")} · الدفع: ${esc(o.payment_name || "—")}${o.coupon ? ` · كود: ${esc(o.coupon)}` : ""}</p>
   <p style="margin:8px 0 0;font-size:20px"><b>الإجمالي: ${money(o.total)}</b></p>${o.notes ? `<p class="mut">ملاحظة الزبون: ${esc(o.notes)}</p>` : ""}</div>
  <label class="f"><span>ملاحظتي (لا يراها الزبون)</span><textarea id="an">${esc(o.admin_note || "")}</textarea></label>
  ${o.phone ? `<a class="btn ok" style="display:block;text-align:center;text-decoration:none;margin-bottom:10px" href="${wa(o.phone, `السلام عليكم ${o.customer_name || ""}، بخصوص طلبك رقم ${o.order_no || ""} من منصة زاد`)}" target="_blank">💬 مراسلة الزبون على واتساب</a>` : ""}
  <button class="btn" id="st">${o.status === "new" ? "✅ تم التسليم" : "↩️ رجّعه جديد"}</button>
  <div class="row" style="margin-top:10px"><button class="btn g" id="hd">${o.hidden ? "إظهار" : "🗂️ أرشفة"}</button><button class="btn red" id="dl">🗑️ حذف</button></div>`);
  const upd = async (patch, msg) => { const { error } = await sb.from("orders").update(patch).eq("id", id); if (error) return fail(error); closeSheet(); toast(msg); reload && reload($("#main")); };
  $("#st", s).onclick = () => upd({ status: o.status === "new" ? "delivered" : "new", admin_note: $("#an", s).value }, "تم ✓");
  $("#hd", s).onclick = () => upd({ hidden: !o.hidden, admin_note: $("#an", s).value }, "تم ✓");
  $("#an", s).onchange = async () => { await sb.from("orders").update({ admin_note: $("#an", s).value }).eq("id", id); toast("حُفظت الملاحظة ✓"); };
  $("#dl", s).onclick = async () => { if (!(await ask("حذف هذا الطلب نهائياً؟"))) return; const { error } = await sb.from("orders").delete().eq("id", id); if (error) return fail(error); toast("حُذف"); reload && reload($("#main")); };
}

/* ---------- المنتجات ---------- */
let CATS = [], pFilter = "all", pQ = "";
async function products(m) {
  const [p, c] = await Promise.all([
    sb.from("products").select("id,name,price,old_price,category_id,image_url,thumb_url,is_visible,is_available,is_best_seller,is_new_arrival,stock,description,file_url,slug,sort_order,lib_section,lib_levels,lib_subject,lib_skill,pages,bw_url,file_type,lib_type,lib_unit,lib_keywords,lib_difficulty,lib_status,lib_order,created_at").order("sort_order", { ascending: true }),
    sb.from("categories").select("id,name,sort_order").order("sort_order", { ascending: true })
  ]);
  if (p.error) throw p.error; CATS = c.data || []; const all = p.data || [];
  m.innerHTML = `<input type="search" id="q" placeholder="🔍 ابحث عن منتج" value="${esc(pQ)}"><div class="chips" id="ch"></div><div id="ls"></div><button class="btn fab" id="add">➕ منتج</button>`;
  const draw = () => {
    $("#ch").innerHTML = [["all", `الكل (${all.length})`], ["lib", `المكتبة (${all.filter((x) => x.lib_section).length})`], ["off", "🙈 مخفي"], ["out", "🚫 نفد"], ...CATS.map((x) => [x.id, x.name])].map(([k, l]) => `<button class="chip ${pFilter === k ? "on" : ""}" data-f="${k}">${esc(l)}</button>`).join("");
    const q = pQ.trim();
    const list = all.filter((x) => (pFilter === "all" || (pFilter === "lib" ? !!x.lib_section : pFilter === "off" ? !x.is_visible : pFilter === "out" ? (!x.is_available || x.stock === 0) : x.category_id === pFilter)) && (!q || (x.name || "").includes(q)));
    $("#ls").innerHTML = list.slice(0, 120).map((x) => `<div class="item" data-p="${x.id}">${x.thumb_url || x.image_url ? `<img loading="lazy" src="${esc(imgU(x.thumb_url || x.image_url))}" alt="">` : `<div class="ph">🖼️</div>`}<div class="tx"><b>${esc(x.name)}</b><small>${Number(x.price) === 0 ? "مجاني" : money(x.price)}${x.old_price ? ` <s>${money(x.old_price)}</s>` : ""}${x.lib_section ? ` · <span class="tag">${esc(LIBSEC[x.lib_section] || "المكتبة")}</span>` : ""}</small></div>${!x.is_visible ? `<span class="tag off">مخفي</span>` : !x.is_available || x.stock === 0 ? `<span class="tag off">نفد</span>` : ""}</div>`).join("") || `<div class="empty">لا توجد منتجات</div>` + (list.length > 120 ? `<p class="c mut">يظهر أول 120، استخدم البحث</p>` : "");
    $$("#ch [data-f]").forEach((b) => b.onclick = () => { pFilter = b.dataset.f; draw(); });
    $$("#ls [data-p]").forEach((r) => r.onclick = () => productSheet(all.find((x) => x.id === r.dataset.p), () => products(m)));
  };
  $("#q").oninput = (e) => { pQ = e.target.value; draw(); };
  $("#add").onclick = () => productSheet(null, () => products(m));
  draw();
}
function resizeImg(file, max = 1100) {
  return new Promise((res, rej) => {
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => { const k = Math.min(1, max / Math.max(im.width, im.height)); const c = document.createElement("canvas"); c.width = im.width * k; c.height = im.height * k; c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); c.toBlob((b) => b ? res(b) : rej(new Error("img")), "image/jpeg", .86); URL.revokeObjectURL(u); };
    im.onerror = rej; im.src = u;
  });
}
/* ---------- المكتبة التعليمية ---------- */
const LIBSEC = { ws: "أوراق العمل", letters: "الحروف العربية", math: "الأرقام والرياضيات", color: "أنشطة التلوين", cards: "بطاقات تعليمية", stories: "القصص المصوّرة", home: "الأنشطة المنزلية", think: "التفكير والذكاء", review: "الاختبارات والمراجعات", extra: "الملفات الإثرائية", teacher: "أدوات المعلّمة" };
const LIBLV = [["a2", "سنة إلى سنتين"], ["a3", "3 سنوات"], ["a4", "4 سنوات"], ["a5", "5 سنوات"], ["a6", "6 سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const LIBSUBJ = ["اللغة العربية", "الرياضيات", "اللغة الإنجليزية", "العلوم", "التربية الإسلامية", "الهوية والمواطنة", "التفكير", "التلوين", "المهارات الحياتية", "المواد المصاحبة", "أدوات المعلّمة", "متنوع"];
const LIBSTATUS = [["draft", "مسودة"], ["review", "قيد المراجعة"], ["published", "منشور"], ["unpublished", "غير منشور"]];
const LIBTYPES = [["worksheet", "ورقة عمل"], ["pdf", "ملف PDF"], ["story", "قصة تعليمية"], ["cards", "بطاقات تعليمية"], ["home_activity", "نشاط منزلي"], ["exercises", "تدريبات"], ["review", "مراجعة دراسية"], ["summary", "ملخص"], ["teaching_aid", "وسيلة تعليمية"], ["printable_activity", "نشاط قابل للطباعة"]];
let TAXC = null; /* التصنيفات من قاعدة البيانات (كل الصفوف حتى المعطّلة) */
async function loadTax() { try { const { data, error } = await sb.from("lib_taxonomy").select("kind,key,label,sort,active").order("sort", { ascending: true }); if (!error && data && data.length) TAXC = data; } catch (e) { /* تُستخدم القيم الأساسية */ } return TAXC; }
function libTaxNow() {
  const on = (k) => (TAXC || []).filter((r) => r.kind === k && r.active);
  const lv = on("age").concat(on("grade")).map((r) => [r.key, r.label]), sec = on("section").map((r) => [r.key, r.label]), ty = on("type").map((r) => [r.key, r.label]), su = on("subject").map((r) => r.label);
  return { levels: lv.length ? lv : LIBLV, sections: sec.length ? sec : Object.entries(LIBSEC), type: ty.length ? ty : LIBTYPES, subjects: su.length ? su : LIBSUBJ };
}
const LIBMAGIC = async (f) => { const b = new Uint8Array(await f.slice(0, 5).arrayBuffer()); return String.fromCharCode(...b) === "%PDF-"; };
const fmtSize = (n) => n >= 1048576 ? (n / 1048576).toFixed(1) + " م.ب" : Math.max(1, Math.round(n / 1024)) + " ك.ب";
/* فحص ملف PDF قبل الرفع: غير فارغ، حجم مقبول، توقيع PDF صحيح. يعيد نص الخطأ أو null */
async function checkPdf(f) {
  if (!f) return "لم يُختر ملف";
  if (!f.size) return "الملف فارغ";
  if (f.size > 50 * 1048576) return "الملف أكبر من 50 م.ب";
  if (f.type && f.type !== "application/pdf") return "الملف ليس PDF";
  if (!(await LIBMAGIC(f))) return "الملف تالف أو ليس PDF حقيقيًا";
  return null;
}
const isPub = (u) => !!u && !String(u).startsWith("private:");
let pdfjsP = null;
function loadPdfjs() {
  if (pdfjsP) return pdfjsP;
  pdfjsP = new Promise((res, rej) => {
    const sc = document.createElement("script"); sc.src = "../js/vendor/pdfjs/pdf.min.js";
    sc.onload = () => { try { window.pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("../js/vendor/pdfjs/pdf.worker.min.js", location.href).href; res(window.pdfjsLib); } catch (e) { rej(e); } };
    sc.onerror = () => { pdfjsP = null; rej(new Error("pdfjs")); }; document.head.appendChild(sc);
  });
  return pdfjsP;
}
/* يقرأ ملف PDF من الجهاز ويحوّل أول (max) صفحات إلى صور للمعاينة */
async function pdfPages(file, max, onStep) {
  const lib = await loadPdfjs();
  const doc = await lib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const n = Math.min(doc.numPages, max), out = [];
  for (let i = 1; i <= n; i++) {
    onStep && onStep(i, n);
    const pg = await doc.getPage(i), v0 = pg.getViewport({ scale: 1 }), v = pg.getViewport({ scale: 1000 / v0.width });
    const c = document.createElement("canvas"); c.width = Math.round(v.width); c.height = Math.round(v.height);
    const cx = c.getContext("2d"); cx.fillStyle = "#fff"; cx.fillRect(0, 0, c.width, c.height);
    await pg.render({ canvasContext: cx, viewport: v }).promise;
    out.push(await new Promise((r, j) => c.toBlob((b) => b ? r(b) : j(new Error("img")), "image/jpeg", .85)));
    if (pg.cleanup) pg.cleanup();
  }
  const total = doc.numPages; if (doc.destroy) doc.destroy();
  return { total, blobs: out };
}
async function libUpload(path, body, type) {
  const { error } = await sb.storage.from("library").upload(path, body, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
function productSheet(p, reload, preset) {
  const isNew = !p;
  const d = p || Object.assign({ id: crypto.randomUUID(), name: "", price: "", old_price: null, category_id: CATS[0]?.id || null, image_url: "", is_visible: true, is_available: true, is_best_seller: false, is_new_arrival: false, stock: null, description: "", file_url: "" }, preset || {});
  const LT = libTaxNow(), TYPES_ = LT.type, LVL_ = LT.levels, SEC_ = LT.sections, SUBJ_ = LT.subjects;
  const s = sheet(`<h2>${isNew ? "منتج جديد" : "تعديل المنتج"}</h2>
  ${d.image_url ? `<img class="thumb" id="pv" src="${esc(imgU(d.image_url))}">` : `<div class="thumb c" id="pv" style="padding:40px 0;font-size:40px">🖼️</div>`}
  <input type="file" id="fi" accept="image/*" hidden><button class="btn g" id="pi">📷 ${d.image_url ? "تغيير الصورة" : "اختر صورة"}</button>
  <label class="f"><span>اسم المنتج</span><input type="text" id="nm" value="${esc(d.name)}"></label>
  <div class="row"><label class="f"><span>السعر (ر.ع)</span><input type="number" id="pr" inputmode="decimal" step="0.001" value="${d.price ?? ""}"></label>
  <label class="f"><span>السعر قبل الخصم</span><input type="number" id="op" inputmode="decimal" step="0.001" value="${d.old_price ?? ""}"></label></div>
  <label class="f"><span>التصنيف</span><select id="ct">${CATS.map((c) => `<option value="${c.id}" ${c.id === d.category_id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
  <label class="f"><span>الوصف</span><textarea id="ds">${esc(d.description || "")}</textarea></label>
  <label class="f"><span>الكمية المتوفرة</span><input type="number" id="sk" inputmode="numeric" value="${d.stock ?? ""}" placeholder="اتركها فارغة = غير محدودة"><small>الملفات الرقمية عادة بدون كمية</small></label>
  <div class="card" style="padding:4px 14px"><label class="sw"><span>ظاهر في المنصة</span><input type="checkbox" id="vi" ${d.is_visible ? "checked" : ""}></label>
  <label class="sw"><span>متاح للشراء</span><input type="checkbox" id="av" ${d.is_available ? "checked" : ""}></label>
  <label class="sw"><span>⭐ الأكثر طلباً</span><input type="checkbox" id="bs" ${d.is_best_seller ? "checked" : ""}></label>
  <label class="sw"><span>🆕 جديد</span><input type="checkbox" id="na" ${d.is_new_arrival ? "checked" : ""}></label></div>
  <div class="card"><b>📄 الملف بعد الشراء (للملفات المدفوعة)</b><p class="mut" id="fs" style="margin:4px 0 8px">${d.file_url && !isPub(d.file_url) ? "✅ مرفوع" : "لم يُرفع ملف"}</p><input type="file" id="ff" accept="application/pdf" hidden><button class="btn g" id="pf">رفع ملف PDF</button></div>
  <div class="card" id="libc"><h3>📚 المكتبة التعليمية</h3>
  <p class="mut" style="margin:0;font-size:13px">اختر القسم ليظهر الملف في صفحة المكتبة. السعر 0 يعني ملفًا مجانيًا يُحمَّل ويُطبع مباشرة، وغير ذلك يظهر بزر «اطلب الملف».</p>
  <label class="f"><span>القسم في المكتبة</span><select id="lsec"><option value="">لا يظهر في المكتبة</option>${SEC_.map(([k, v]) => `<option value="${k}" ${d.lib_section === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label>
  <div class="f"><span style="display:block;font-weight:700;margin-bottom:5px;font-size:14px">العمر أو الصف (واحد أو أكثر)</span><div class="chips" style="flex-wrap:wrap" id="llv">${LVL_.map(([k, v]) => `<button type="button" class="chip ${(d.lib_levels || []).includes(k) ? "on" : ""}" data-lv="${k}" aria-pressed="${(d.lib_levels || []).includes(k)}">${esc(v)}</button>`).join("")}</div></div>
  <div class="row"><label class="f"><span>المادة</span><input type="text" id="lsub" list="lsubs" value="${esc(d.lib_subject || "")}" placeholder="مثال: الرياضيات"></label><label class="f"><span>المهارة أو الموضوع</span><input type="text" id="lskl" value="${esc(d.lib_skill || "")}" placeholder="مثال: الجمع ضمن 20"></label></div>
  <datalist id="lsubs">${SUBJ_.map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
  <label class="f"><span>عدد الصفحات</span><input type="number" id="lpgs" inputmode="numeric" min="1" max="999" value="${d.pages ?? ""}" placeholder="يُملأ تلقائيًا عند رفع الملف"></label>
  <div class="row"><label class="f"><span>نوع المحتوى</span><select id="ltyp"><option value="">غير محدد</option>${TYPES_.map(([k, v]) => `<option value="${k}" ${d.lib_type === k ? "selected" : ""}>${esc(v)}</option>`).join("")}</select></label><label class="f"><span>مستوى الصعوبة</span><select id="ldif"><option value="">غير محدد</option>${[["easy","سهل"],["medium","متوسط"],["hard","متقدّم"]].map(([k, v]) => `<option value="${k}" ${d.lib_difficulty === k ? "selected" : ""}>${v}</option>`).join("")}</select></label><label class="f"><span>الوحدة أو الدرس</span><input type="text" id="lunit" value="${esc(d.lib_unit || "")}" placeholder="مثال: الوحدة 3"></label></div>
  <label class="f"><span>الكلمات المفتاحية (افصل بينها بفاصلة)</span><input type="text" id="lkw" value="${esc(d.lib_keywords || "")}" placeholder="مثال: جمع، أعداد، تمارين"></label>
  <label class="f"><span>حالة النشر</span><select id="lst">${LIBSTATUS.map(([k, v]) => `<option value="${k}" ${(d.lib_status || (d.is_visible === false ? "unpublished" : "published")) === k ? "selected" : ""}>${v}</option>`).join("")}</select><small>لا يراه الزوار إلا إذا كانت الحالة «منشور».</small></label>
  <button type="button" class="btn g" id="lprev" style="margin-top:6px">👁️ معاينة قبل النشر</button>
  <div style="border-top:1px solid #f0ecfb;padding-top:10px;margin-top:4px"><b>الملف المجاني (النسخة الملوّنة)</b><p class="mut" id="lfs" style="margin:2px 0 8px;font-size:14px">${isPub(d.file_url) ? "✅ مرفوع" : "لم يُرفع ملف مجاني"}</p>
  <input type="file" id="lff" accept="application/pdf" hidden><button type="button" class="btn g" id="lfb">${isPub(d.file_url) ? "استبدال الملف المجاني" : "رفع الملف المجاني (PDF)"}</button></div>
  <div style="border-top:1px solid #f0ecfb;padding-top:10px;margin-top:12px"><b>نسخة الأبيض والأسود (اختياري)</b><p class="mut" id="lbs" style="margin:2px 0 8px;font-size:14px">${d.bw_url ? "✅ مرفوعة" : "لا توجد"}</p>
  <input type="file" id="lbf" accept="application/pdf" hidden><div class="row"><button type="button" class="btn g" id="lbb">${d.bw_url ? "استبدال" : "رفع نسخة أبيض وأسود"}</button>${d.bw_url ? `<button type="button" class="btn red" id="lbx">إزالة النسخة</button>` : ""}</div></div>
  <div style="border-top:1px solid #f0ecfb;padding-top:10px;margin-top:12px"><b>صور صفحات المعاينة</b><p class="mut" id="lps" style="margin:2px 0 8px;font-size:14px">جاري التحقق…</p>
  <input type="file" id="lpf" accept="image/*" multiple hidden><input type="file" id="lpd" accept="application/pdf" hidden>
  <div class="row"><button type="button" class="btn g" id="lpg">توليد من ملف PDF</button><button type="button" class="btn g" id="lpi">رفع صور</button></div>
  <p class="mut" style="margin:6px 0 0;font-size:12px">الملف المجاني: تُولَّد صور كل صفحاته تلقائيًا عند رفعه. الملف المدفوع: تُولَّد أول 3 صفحات فقط حتى لا يظهر الملف كاملًا.</p></div>
  </div>
  <p class="mut" style="font-size:12px;margin:4px 4px 10px">لإيقاف عرض ملف قديم دون فقدان بياناته: أطفئ «ظاهر في المنصة» بدل الحذف.</p>
  <button class="btn" id="sv">💾 حفظ</button>
  ${isNew ? "" : `<button class="btn red" id="dl" style="margin-top:10px">🗑️ حذف المنتج</button>`}`);
  $("#pi", s).onclick = () => $("#fi", s).click();
  $("#fi", s).onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return; toast("جاري رفع الصورة…");
    try {
      const b = await resizeImg(f), path = `p/${d.id}-${Date.now()}.jpg`;
      const { error } = await sb.storage.from("product-images").upload(path, b, { contentType: "image/jpeg", cacheControl: "31536000" });
      if (error) throw error;
      d.image_url = sb.storage.from("product-images").getPublicUrl(path).data.publicUrl; d.thumb_url = null;
      const pv = $("#pv", s); pv.outerHTML = `<img class="thumb" id="pv" src="${d.image_url}">`; toast("رُفعت الصورة، اضغط حفظ");
    } catch (er) { fail(er); }
  };
  $("#pf", s).onclick = () => $("#ff", s).click();
  $("#ff", s).onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return; const bad = await checkPdf(f); if (bad) { e.target.value = ""; return toast(bad); } toast("جاري رفع الملف…");
    const { error } = await sb.storage.from("paid-files").upload(`${d.id}.pdf`, f, { upsert: true, contentType: "application/pdf", cacheControl: "0" });
    if (error) return fail(error); d.file_url = `private:${d.id}.pdf`; $("#fs", s).textContent = `✅ رُفع (${fmtSize(f.size)})، اضغط حفظ`; d._size = f.size; };
  /* المكتبة */
  const priceNow = () => Number($("#pr", s).value || 0);
  const setPages = (urls, note) => { d._pages = urls; $("#lps", s).textContent = `✅ ${urls.length} صورة جاهزة${note ? " " + note : ""} — اضغط حفظ`; };
  $$("#llv [data-lv]", s).forEach((b) => b.onclick = () => { const on = !b.classList.contains("on"); b.classList.toggle("on", on); b.setAttribute("aria-pressed", String(on)); });
  if (isNew) $("#lps", s).textContent = "لا توجد صور معاينة";
  else sb.from("product_media").select("id", { count: "exact", head: true }).eq("product_id", d.id).eq("media_type", "page").then(({ count }) => { if (!d._pages) $("#lps", s).textContent = count ? `✅ ${count} صفحة معاينة` : "لا توجد صور معاينة"; });
  const genFrom = async (file, max) => {
    const { total, blobs } = await pdfPages(file, max, (i, n) => { $("#lps", s).textContent = `جاري تجهيز صور المعاينة ${i} من ${n}…`; });
    const ts = Date.now(), urls = [];
    for (let i = 0; i < blobs.length; i++) { $("#lps", s).textContent = `جاري رفع صور المعاينة ${i + 1} من ${blobs.length}…`; urls.push(await libUpload(`pages/${d.id}/${ts}-${String(i + 1).padStart(2, "0")}.jpg`, blobs[i], "image/jpeg")); }
    if (!$("#lpgs", s).value) $("#lpgs", s).value = total;
    setPages(urls, total > blobs.length ? `(من ${total} صفحة)` : "");
    return total;
  };
  $("#lfb", s).onclick = () => { if (priceNow() > 0) return toast("الملف المجاني للمنتجات بسعر 0. للمدفوع استخدم «الملف بعد الشراء»"); $("#lff", s).click(); };
  $("#lff", s).onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    const bad = await checkPdf(f); if (bad) { $("#lfs", s).textContent = "لم يُرفع: " + bad; return toast(bad); }
    d._size = f.size;
    try {
      $("#lfs", s).textContent = `جاري رفع الملف (${fmtSize(f.size)})…`;
      d.file_url = await libUpload(`files/${d.id}-${Date.now()}.pdf`, f, "application/pdf");
      $("#lfs", s).textContent = "✅ رُفع الملف، جاري تجهيز المعاينة…";
      try { const n = await genFrom(f, 30); $("#lpgs", s).value = n; $("#lfs", s).textContent = `✅ رُفع الملف (${n} صفحة) — اضغط حفظ`; }
      catch (er) { console.warn(er); $("#lfs", s).textContent = "✅ رُفع الملف — اضغط حفظ"; $("#lps", s).textContent = "تعذّر توليد صور المعاينة، ارفعها كصور"; }
    } catch (er) { $("#lfs", s).textContent = "لم يُرفع"; fail(er); }
  };
  $("#lbb", s).onclick = () => $("#lbf", s).click();
  $("#lbf", s).onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    const bad = await checkPdf(f); if (bad) { $("#lbs", s).textContent = "لم تُرفع: " + bad; return toast(bad); }
    try { $("#lbs", s).textContent = "جاري الرفع…"; d.bw_url = await libUpload(`files/${d.id}-bw-${Date.now()}.pdf`, f, "application/pdf"); $("#lbs", s).textContent = "✅ رُفعت، اضغط حفظ"; }
    catch (er) { $("#lbs", s).textContent = "لم تُرفع"; fail(er); }
  };
  const lbx = $("#lbx", s); if (lbx) lbx.onclick = () => { d.bw_url = null; $("#lbs", s).textContent = "ستُزال النسخة من المكتبة بعد الحفظ (الملف نفسه يبقى محفوظًا)"; lbx.remove(); };
  $("#lpg", s).onclick = () => $("#lpd", s).click();
  $("#lpd", s).onchange = async (e) => {
    const f = e.target.files[0]; e.target.value = ""; if (!f) return;
    { const bad = await checkPdf(f); if (bad) return toast(bad); }
    try { await genFrom(f, priceNow() > 0 ? 3 : 30); } catch (er) { $("#lps", s).textContent = "تعذّر توليد الصور"; fail(er); }
  };
  $("#lpi", s).onclick = () => $("#lpf", s).click();
  $("#lpf", s).onchange = async (e) => {
    const fs = Array.from(e.target.files || []); e.target.value = ""; if (!fs.length) return;
    try {
      const ts = Date.now(), urls = [];
      for (let i = 0; i < fs.length; i++) { $("#lps", s).textContent = `جاري رفع الصورة ${i + 1} من ${fs.length}…`; urls.push(await libUpload(`pages/${d.id}/${ts}-${String(i + 1).padStart(2, "0")}.jpg`, await resizeImg(fs[i], 1100), "image/jpeg")); }
      setPages(urls);
    } catch (er) { $("#lps", s).textContent = "لم تُرفع"; fail(er); }
  };
  /* حالة النشر والظهور وجهان لشيء واحد */
  const stSel = $("#lst", s), viCb = $("#vi", s);
  stSel.onchange = () => { viCb.checked = stSel.value === "published"; };
  viCb.onchange = () => { if ($("#lsec", s).value) stSel.value = viCb.checked ? "published" : (stSel.value === "published" ? "unpublished" : stSel.value); };
  /* حفظ مؤقت للملفات المرفوعة حتى لا تضيع عند تحديث الصفحة قبل «حفظ» */
  const DK = "zad.libdraft." + d.id, keepDraft = () => { try { localStorage.setItem(DK, JSON.stringify({ t: Date.now(), file_url: d.file_url || null, bw_url: d.bw_url || null, image_url: d.image_url || null, pages: d._pages || null, size: d._size || null })); } catch (e) { /* */ } };
  try { const dr = JSON.parse(localStorage.getItem(DK) || "null"); if (dr && Date.now() - dr.t < 7 * 864e5 && (dr.file_url !== (d.file_url || null) || dr.bw_url !== (d.bw_url || null) || dr.image_url !== (d.image_url || null) || (dr.pages && dr.pages.length))) {
    const b = document.createElement("button"); b.type = "button"; b.className = "btn g"; b.textContent = "↩️ استعادة ملفات رُفعت ولم تُحفظ"; b.style.marginBottom = "8px";
    b.onclick = () => { if (dr.file_url) d.file_url = dr.file_url; if (dr.bw_url) d.bw_url = dr.bw_url; if (dr.image_url) { d.image_url = dr.image_url; d.thumb_url = null; } if (dr.pages) { d._pages = dr.pages; $("#lps", s).textContent = `✅ ${dr.pages.length} صورة جاهزة — اضغط حفظ`; } $("#lfs", s).textContent = "✅ تمت الاستعادة — اضغط حفظ"; b.remove(); };
    $("#libc", s).insertBefore(b, $("#libc", s).children[1]); } } catch (e) { /* */ }
  ["#fi", "#lff", "#lbf", "#lpf", "#lpd", "#ff"].forEach((q) => $(q, s).addEventListener("change", () => setTimeout(keepDraft, 2500)));
  const check = () => {
    const sec = $("#lsec", s).value, lv = $$("#llv .chip.on", s).length, desc = $("#ds", s).value.trim(), price = Number($("#pr", s).value || 0), t = $("#nm", s).value.trim();
    return [[!!t, "عنوان المحتوى"], [desc.length >= 15, "وصف واضح (15 حرفًا على الأقل)"], [!!(d.image_url || (d._pages && d._pages.length)), "صورة غلاف أو صفحات معاينة"], [!!sec, "القسم"], [lv > 0, "العمر أو الصف"], [price > 0 ? !!d.file_url : isPub(d.file_url), price > 0 ? "الملف بعد الشراء" : "الملف المجاني (PDF)"]];
  };
  $("#lprev", s).onclick = () => {
    const sec = SEC_.find((x) => x[0] === $("#lsec", s).value), lvs = $$("#llv .chip.on", s).map((b) => b.textContent), ty = TYPES_.find((x) => x[0] === $("#ltyp", s).value), cov = d.image_url ? imgU(d.image_url) : (d._pages && d._pages[0]) || "", price = Number($("#pr", s).value || 0), nm = $("#nm", s).value.trim() || "(بدون عنوان)", ds = $("#ds", s).value.trim();
    const card = (w) => `<div style="width:${w}px;max-width:100%;border:1px solid #e6e0f8;border-radius:16px;background:#fff;overflow:hidden;margin:0 auto"><div style="aspect-ratio:4/3;background:#f6f3ff;display:grid;place-items:center">${cov ? `<img src="${esc(cov)}" alt="" style="width:100%;height:100%;object-fit:cover">` : "<span style='color:#999'>لا توجد صورة</span>"}</div><div style="padding:10px"><b style="font-size:15px">${esc(nm)}</b><div style="font-size:12px;color:#6d6684;margin:4px 0">${esc([$("#lsub", s).value, sec && sec[1], lvs.join("، "), ty && ty[1]].filter(Boolean).join(" · "))}</div><p style="margin:0 0 8px;font-size:13px">${esc(ds.slice(0, 90))}${ds.length > 90 ? "…" : ""}</p><span style="display:inline-block;background:#5B34D6;color:#fff;border-radius:10px;padding:6px 12px;font-size:13px">${price === 0 ? "تحميل مجاني" : "اطلب الملف"}</span></div></div>`;
    const ck = check(), fileUrl = d.file_url && isPub(d.file_url) ? imgU(d.file_url) : "";
    const pvo = document.createElement("div"); pvo.className = "ov"; pvo.id = "ovp"; pvo.addEventListener("click", (e) => { if (e.target === pvo) pvo.remove(); });
    pvo.innerHTML = `<div class="sheet"><h2>معاينة قبل النشر</h2>
      <div class="card"><b>قائمة التحقق</b>${ck.map(([ok, l]) => `<div style="font-size:14px;margin-top:4px">${ok ? "✅" : "⚠️"} ${l}</div>`).join("")}${d._size ? `<div style="font-size:14px;margin-top:4px">📄 حجم الملف المرفوع: ${fmtSize(d._size)}</div>` : ""}${fileUrl ? `<div style="margin-top:8px"><a class="btn g sm" href="${esc(fileUrl)}" target="_blank" rel="noopener">فتح الملف للتأكد من سلامته</a></div>` : ""}</div>
      <p class="mut" style="margin:8px 0 4px">كما تظهر على الهاتف:</p>${card(300)}<p class="mut" style="margin:12px 0 4px">كما تظهر على الكمبيوتر:</p>${card(420)}
      <button class="btn g" id="pvx" style="margin-top:12px">رجوع للتعديل</button></div>`;
    document.body.appendChild(pvo); $("#pvx", pvo).onclick = () => pvo.remove();
  };
  $("#sv", s).onclick = async () => {
    const name = $("#nm", s).value.trim(), price = Number($("#pr", s).value);
    if (!name) return toast("اكتب اسم المنتج"); if (!(price >= 0) || $("#pr", s).value === "") return toast("اكتب السعر");
    const op = $("#op", s).value === "" ? null : Number($("#op", s).value), sk = $("#sk", s).value === "" ? null : Number($("#sk", s).value);
    const row = { id: d.id, name, price, old_price: op && op > price ? op : null, category_id: $("#ct", s).value || null, image_url: d.image_url || null, thumb_url: d.thumb_url === null ? null : (d.thumb_url || null), description: $("#ds", s).value.trim(), stock: sk,
      is_visible: $("#vi", s).checked, is_available: $("#av", s).checked, is_best_seller: $("#bs", s).checked, is_new_arrival: $("#na", s).checked, file_url: d.file_url || null };
    const lsec = $("#lsec", s).value || null, llv = $$("#llv .chip.on", s).map((b) => b.dataset.lv), lpg = $("#lpgs", s).value === "" ? null : Math.round(Number($("#lpgs", s).value));
    if (lsec && !llv.length) return toast("اختر العمر أو الصف للمكتبة");
    const lst = lsec ? $("#lst", s).value : null;
    if (lsec && lst === "published") { const miss = check().filter((x) => !x[0]).map((x) => x[1]); if (miss.length) return toast("قبل النشر أكمل: " + miss.join("، ")); }
    if (lsec) { const dup = (await sb.from("products").select("id,name").eq("name", name).not("lib_section", "is", null).neq("id", d.id).limit(1)).data; if (dup && dup.length && !(await ask(`يوجد ملف آخر بنفس العنوان «${name}». هل تحفظ رغم ذلك؟`, "نعم، احفظ"))) return; }
    if (lsec && price === 0 && !isPub(row.file_url)) return toast("ارفع الملف المجاني (PDF) أو ضع سعرًا للملف");
    if (lpg !== null && !(lpg >= 1 && lpg <= 999)) return toast("عدد الصفحات غير صحيح");
    Object.assign(row, { lib_section: lsec, lib_levels: llv, lib_subject: $("#lsub", s).value.trim() || null, lib_skill: $("#lskl", s).value.trim() || null, pages: lpg, bw_url: d.bw_url || null, file_type: "PDF", lib_type: lsec ? ($("#ltyp", s).value || null) : null, lib_difficulty: lsec ? ($("#ldif", s).value || null) : null, lib_unit: lsec ? ($("#lunit", s).value.trim() || null) : null, lib_keywords: lsec ? ($("#lkw", s).value.split(/[,،]/).map((x) => x.trim()).filter(Boolean).join("، ") || null) : null, lib_status: lst });
    if (lsec) row.is_visible = lst === "published";
    if (!row.image_url && d._pages && d._pages.length) row.image_url = d._pages[0];
    if (isNew) { row.slug = "p-" + Math.random().toString(36).slice(2, 8); row.sort_order = -Math.floor(Date.now() / 1000); }
    const { error } = isNew ? await sb.from("products").insert(row) : await sb.from("products").update(row).eq("id", d.id);
    if (error) return fail(error);
    if (d._pages) {
      const del = await sb.from("product_media").delete().eq("product_id", d.id).eq("media_type", "page");
      if (del.error) return fail(del.error);
      if (d._pages.length) { const ins = await sb.from("product_media").insert(d._pages.map((u, i) => ({ product_id: d.id, media_type: "page", media_url: u, sort_order: i + 1 }))); if (ins.error) return fail(ins.error); }
    }
    try { localStorage.removeItem(DK); } catch (e) { /* */ }
    closeSheet(); toast(lsec && lst !== "published" ? "تم الحفظ ✓ (غير ظاهر للزوار)" : "تم الحفظ ✓ يظهر في المنصة الآن"); reload ? reload() : go(tab);
  };
  const dl = $("#dl", s);
  if (dl) dl.onclick = async () => { if (!(await ask(`حذف «${d.name}» نهائياً؟`))) return; const { error } = await sb.from("products").delete().eq("id", d.id); if (error) return fail(error); toast("حُذف"); reload && reload(); };
}

/* ---------- تعلّم والعب ---------- */
const PLANS = [["شهر", 30, "1.5"], ["3 أشهر", 90, "3.5"], ["سنة", 365, "10"]];
const genCode = () => { const a = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", r = (n) => Array.from({ length: n }, () => a[Math.floor(Math.random() * a.length)]).join(""); return `ZD-${r(4)}-${r(4)}`; };
async function learn(m) {
  const { data, error } = await sb.from("learn_codes").select("*").order("created_at", { ascending: false }).limit(300);
  if (error) throw error; const rows = data || [];
  const act = rows.filter((c) => c.expires_at && Date.parse(c.expires_at) > Date.now() && !String(c.plan).startsWith("owner"));
  m.innerHTML = `<div class="grid2"><div class="stat"><b>${act.length}</b><span>مشتركون فعّالون</span></div><div class="stat"><b>${rows.filter((c) => !c.redeemed_at).length}</b><span>أكواد غير مستخدمة</span></div></div>
  <div class="card"><h3>🔑 إنشاء كود تفعيل</h3><p class="mut" style="margin:0 0 8px">اختر الباقة، وبعد دفع الزبون أرسل له الكود.</p>
  <div class="row">${PLANS.map(([l, d, pr]) => `<button class="btn sm" data-d="${d}" data-l="${l}">${l}<br><small>${pr} ر.ع</small></button>`).join("")}</div></div>
  <div class="card"><button class="btn g" id="own">🔗 رابط خاص بي (بدون اشتراك)</button></div>
  <h3 style="margin:16px 2px 4px">الأكواد</h3>
  ${rows.length ? rows.map((c) => { const used = !!c.redeemed_at, live = used && Date.parse(c.expires_at) > Date.now(); return `<div class="item" data-c="${esc(c.code)}"><div class="ph">${live ? "✅" : used ? "⌛" : "🆕"}</div><div class="tx"><b class="code">${esc(c.code)}</b><small>${esc(c.plan)} · ${c.days} يوم · ${used ? (live ? "فعّال حتى " + new Date(c.expires_at).toLocaleDateString("ar-OM") : "منتهي") : "لم يُستخدم"}</small></div></div>`; }).join("") : `<div class="empty">لا توجد أكواد بعد</div>`}`;
  $$("[data-d]", m).forEach((b) => b.onclick = async () => {
    const code = genCode(), { error } = await sb.from("learn_codes").insert({ code, plan: b.dataset.l, days: +b.dataset.d });
    if (error) return fail(error); codeSheet(code, b.dataset.l, () => learn(m));
  });
  $("#own", m).onclick = async () => {
    const code = "ZD-OWNER-" + Math.random().toString(36).slice(2, 12).toUpperCase(), { error } = await sb.from("learn_codes").insert({ code, plan: "owner", days: 36500 });
    if (error) return fail(error);
    sheet(`<h2>رابطك الخاص</h2><p class="mut">افتحه من هاتفك فيفعّل نفسه (يعمل على جهاز واحد فقط، لا تشاركه).</p><div class="card code" style="word-break:break-all;font-size:13px">${esc(SITE + "learn/#code=" + code)}</div><button class="btn" id="cp">نسخ الرابط</button>`, (s) => $("#cp", s).onclick = () => { navigator.clipboard?.writeText(SITE + "learn/#code=" + code); toast("نُسخ ✓"); });
    learn(m);
  };
  $$("[data-c]", m).forEach((r) => r.onclick = () => { const c = rows.find((x) => x.code === r.dataset.c); codeSheet(c.code, c.plan, () => learn(m), c); });
}
function codeSheet(code, plan, reload, c) {
  const msg = `أهلاً 🌟 كود تفعيل «تعلّم والعب» (${plan}):\n${code}\nافتح التطبيق هنا:\n${SITE}learn/\nثم اختر «الاشتراك والتفعيل» وأدخل الكود.`;
  const s = sheet(`<h2>كود التفعيل</h2><div class="card c code" style="font-size:24px">${esc(code)}</div>
  <a class="btn ok" style="display:block;text-align:center;text-decoration:none" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank">💬 إرسال عبر واتساب</a>
  <button class="btn g" id="cp" style="margin-top:10px">نسخ الرسالة</button>
  ${c && !c.redeemed_at ? `<button class="btn red" id="dl" style="margin-top:10px">🗑️ حذف الكود</button>` : ""}`);
  $("#cp", s).onclick = () => { navigator.clipboard?.writeText(msg); toast("نُسخت ✓"); };
  const dl = $("#dl", s); if (dl) dl.onclick = async () => { await sb.from("learn_codes").delete().eq("code", code); closeSheet(); toast("حُذف"); reload(); };
  if (!c) reload();
}

/* ---------- المزيد ---------- */
const SUB = {};
function more(m) {
  const items = [["libadm", "📚", "إدارة المكتبة", "#e6dcff", "#c1aef0"], ["storiesadm", "📖", "إدارة القصص", "#e6dcff", "#c1aef0"], ["cardsadm", "🃏", "إدارة البطاقات", "#e6dcff", "#c1aef0"], ["activitiesadm", "🧩", "إدارة الأنشطة", "#e6dcff", "#c1aef0"], ["summariesadm", "📝", "إدارة الملخصات والمراجعات", "#e6dcff", "#c1aef0"], ["mediaadm", "🖼️", "إدارة الوسائل التعليمية", "#e6dcff", "#c1aef0"], ["guidesadm", "📘", "إدارة الأدلة الإرشادية", "#e6dcff", "#c1aef0"], ["wikiadm", "🌍", "إدارة الموسوعة المصغرة", "#e6dcff", "#c1aef0"], ["expadm", "🔬", "إدارة التجارب والمشاريع", "#e6dcff", "#c1aef0"], ["artsadm", "🎨", "إدارة الإبداع والفنون", "#e6dcff", "#c1aef0"], ["langadm", "🔤", "إدارة المحتوى اللغوي", "#e6dcff", "#c1aef0"], ["lifeadm", "🌱", "إدارة المهارات الحياتية", "#e6dcff", "#c1aef0"], ["digadm", "💻", "إدارة المهارات الرقمية", "#e6dcff", "#c1aef0"], ["readyadm", "🎒", "إدارة الاستعداد المدرسي", "#e6dcff", "#c1aef0"], ["valadm", "🌟", "إدارة التربية والقيم", "#e6dcff", "#c1aef0"], ["expadm", "🧭", "إدارة الثقافة العامة", "#e6dcff", "#c1aef0"], ["songadm", "🎵", "إدارة الأناشيد", "#e6dcff", "#c1aef0"], ["videoadm", "🎬", "إدارة الفيديوهات", "#e6dcff", "#c1aef0"], ["bankadm", "🧩", "إدارة بنك الأنشطة", "#e6dcff", "#c1aef0"], ["projadm", "🚀", "إدارة المشاريع والتحديات", "#e6dcff", "#c1aef0"], ["dictadm", "📖", "إدارة المعجم المصور", "#e6dcff", "#c1aef0"], ["quizadm", "🏆", "إدارة الاختبارات والمسابقات", "#e6dcff", "#c1aef0"], ["pfadm", "🎖️", "إدارة ملف الإنجاز والشهادات", "#e6dcff", "#c1aef0"], ["rpadm", "📊", "إدارة تقارير تقدم الطفل", "#e6dcff", "#c1aef0"], ["recadm", "🧭", "إدارة مركز التوصيات", "#e6dcff", "#c1aef0"], ["planadm", "🗓️", "إدارة خطتي التعليمية", "#e6dcff", "#c1aef0"], ["caladm", "📅", "إدارة التقويم التعليمي", "#e6dcff", "#c1aef0"], ["searchadm", "🔎", "إدارة البحث في المكتبة", "#e6dcff", "#c1aef0"], ["savedadm", "❤️", "إدارة محتواي المحفوظ", "#e6dcff", "#c1aef0"], ["recentadm", "🕘", "إدارة تابع من حيث توقفت", "#e6dcff", "#c1aef0"], ["packsadm", "🎁", "إدارة الحزم التعليمية", "#e6dcff", "#c1aef0"], ["qualityadm", "✅", "مركز جودة المحتوى", "#e6dcff", "#c1aef0"],["sourcesadm", "📚", "مركز المصادر والمراجع", "#e6dcff", "#c1aef0"],["feedbackadm", "💬", "ملاحظات أولياء الأمور", "#e6dcff", "#c1aef0"],["versionsadm", "🔄", "مركز تحديث المحتوى", "#e6dcff", "#c1aef0"], ["qbank", "❓", "بنك الأسئلة", "#e6dcff", "#c1aef0"], ["qtests", "📋", "اختبارات من البنك", "#e6dcff", "#c1aef0"], ["cats", "🗂️", "التصنيفات", "#d6ecff", "#9cc9ef"], ["coupons", "🎟️", "أكواد الخصم", "#d8f5e6", "#9fdcbc"], ["customers", "👥", "الزبائن", "#ffe3d1", "#f2b895"], ["reviews", "⭐", "التقييمات", "#fff3c4", "#ecd57d"], ["settings", "🏪", "إعدادات المنصة", "#ffdbe9", "#f0a9c6"], ["account", "🔐", "حسابي", "#e6dcff", "#c1aef0"], ["quizzes", `<img src="${SITE}images/ill/target.svg" alt="" width="40" height="40" style="display:block">`, "الاختبارات والتقييمات", "#efe7ff", "#cdb8f5"]];
  m.innerHTML = `<div class="big">${items.map(([k, e, l, c, s]) => `<button data-g="${k}" style="--c:${c};--s:${s}"><b>${e}</b>${l}</button>`).join("")}</div>`;
  $$("[data-g]", m).forEach((b) => b.onclick = () => go(b.dataset.g));
}

SUB.cats = { title: "التصنيفات", fn: async (m) => {
  const [c, p] = await Promise.all([sb.from("categories").select("*").order("sort_order", { ascending: true }), sb.from("products").select("category_id")]);
  const cats = c.data || [], cnt = {}; (p.data || []).forEach((x) => cnt[x.category_id] = (cnt[x.category_id] || 0) + 1);
  m.innerHTML = `${back()}${cats.map((x, i) => `<div class="item" data-c="${x.id}"><div class="ph">🗂️</div><div class="tx"><b>${esc(x.name)}</b><small>${cnt[x.id] || 0} منتج</small></div><button class="chip" data-u="${i}">▲</button><button class="chip" data-dn="${i}">▼</button></div>`).join("")}<button class="btn fab" id="add">➕ تصنيف</button>`;
  const swap = async (i, j) => { if (j < 0 || j >= cats.length) return; await Promise.all([sb.from("categories").update({ sort_order: j + 1 }).eq("id", cats[i].id), sb.from("categories").update({ sort_order: i + 1 }).eq("id", cats[j].id)]); SUB.cats.fn(m); };
  $$("[data-u]", m).forEach((b) => b.onclick = (e) => { e.stopPropagation(); swap(+b.dataset.u, +b.dataset.u - 1); });
  $$("[data-dn]", m).forEach((b) => b.onclick = (e) => { e.stopPropagation(); swap(+b.dataset.dn, +b.dataset.dn + 1); });
  const edit = (x) => { const s = sheet(`<h2>${x ? "تعديل التصنيف" : "تصنيف جديد"}</h2><label class="f"><span>الاسم</span><input type="text" id="nm" value="${esc(x?.name || "")}"></label><button class="btn" id="sv">💾 حفظ</button>${x ? `<button class="btn red" id="dl" style="margin-top:10px">🗑️ حذف</button>` : ""}`);
    $("#sv", s).onclick = async () => { const name = $("#nm", s).value.trim(); if (!name) return toast("اكتب الاسم");
      const { error } = x ? await sb.from("categories").update({ name }).eq("id", x.id) : await sb.from("categories").insert({ name, slug: "c-" + Math.random().toString(36).slice(2, 8), sort_order: cats.length + 1 });
      if (error) return fail(error); closeSheet(); toast("تم ✓"); SUB.cats.fn(m); };
    const dl = $("#dl", s); if (dl) dl.onclick = async () => { if (cnt[x.id]) { toast("انقل منتجات هذا التصنيف أولاً"); return; } if (!(await ask(`حذف تصنيف «${x.name}»؟`))) return; const { error } = await sb.from("categories").delete().eq("id", x.id); if (error) return fail(error); toast("حُذف"); SUB.cats.fn(m); }; };
  $$("[data-c]", m).forEach((r) => r.onclick = () => edit(cats.find((x) => x.id === r.dataset.c)));
  $("#add", m).onclick = () => edit(null);
} };

SUB.coupons = { title: "أكواد الخصم", fn: async (m) => {
  const { data, error } = await sb.from("coupons").select("*").order("created_at", { ascending: false }); if (error) throw error; const cs = data || [];
  const lab = (c) => c.kind === "ship" ? "توصيل مجاني" : c.kind === "fixed" ? `خصم ${money(c.value)}` : `خصم ${c.value}%`;
  m.innerHTML = `${back()}${cs.length ? cs.map((c) => `<div class="item" data-c="${esc(c.code)}"><div class="ph">🎟️</div><div class="tx"><b class="code">${esc(c.code)}</b><small>${lab(c)}${c.owner ? " · " + esc(c.owner) : ""}</small></div><span class="tag ${c.enabled ? "done" : "off"}">${c.enabled ? "فعّال" : "موقوف"}</span></div>`).join("") : `<div class="empty">لا توجد أكواد خصم</div>`}<button class="btn fab" id="add">➕ كود</button>`;
  const edit = (c) => { const d = c || { code: "", owner: "", kind: "pct", value: 10, min_total: 0, max_uses: null, ends_at: null, enabled: true };
    const s = sheet(`<h2>${c ? "تعديل الكود" : "كود خصم جديد"}</h2>
    <label class="f"><span>الكود</span><input type="text" id="cd" dir="ltr" value="${esc(d.code)}" ${c ? "readonly" : ""} placeholder="SARA10" style="text-transform:uppercase"></label>
    <label class="f"><span>اسم صاحب الكود (اختياري)</span><input type="text" id="ow" value="${esc(d.owner || "")}"></label>
    <label class="f"><span>النوع</span><select id="kd"><option value="pct" ${d.kind === "pct" ? "selected" : ""}>نسبة %</option><option value="fixed" ${d.kind === "fixed" ? "selected" : ""}>مبلغ ثابت</option><option value="ship" ${d.kind === "ship" ? "selected" : ""}>توصيل مجاني</option></select></label>
    <label class="f" id="vb"><span>القيمة</span><input type="number" id="vl" inputmode="decimal" step="0.001" value="${d.value ?? ""}"></label>
    <div class="row"><label class="f"><span>أقل مبلغ للطلب</span><input type="number" id="mn" inputmode="decimal" value="${Number(d.min_total) > 0 ? d.min_total : ""}"></label><label class="f"><span>عدد الاستخدامات</span><input type="number" id="mx" inputmode="numeric" value="${d.max_uses ?? ""}"></label></div>
    <label class="f"><span>ينتهي في (اختياري)</span><input type="date" id="en" value="${d.ends_at ? d.ends_at.slice(0, 10) : ""}"></label>
    <div class="card" style="padding:4px 14px"><label class="sw"><span>الكود فعّال</span><input type="checkbox" id="ea" ${d.enabled ? "checked" : ""}></label></div>
    <button class="btn" id="sv">💾 حفظ</button>${c ? `<button class="btn red" id="dl" style="margin-top:10px">🗑️ حذف</button>` : ""}`);
    const vis = () => $("#vb", s).hidden = $("#kd", s).value === "ship"; $("#kd", s).onchange = vis; vis();
    $("#sv", s).onclick = async () => { const code = $("#cd", s).value.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, ""); if (!code) return toast("اكتب الكود");
      const kind = $("#kd", s).value, row = { owner: $("#ow", s).value.trim() || code, kind, value: kind === "ship" ? 0 : Number($("#vl", s).value) || 0, min_total: Number($("#mn", s).value) || 0, max_uses: $("#mx", s).value ? Number($("#mx", s).value) : null, ends_at: $("#en", s).value ? new Date($("#en", s).value + "T23:59:59+04:00").toISOString() : null, enabled: $("#ea", s).checked };
      const { error } = c ? await sb.from("coupons").update(row).eq("code", c.code) : await sb.from("coupons").insert({ code, ...row });
      if (error) return fail(error); closeSheet(); toast("تم ✓"); SUB.coupons.fn(m); };
    const dl = $("#dl", s); if (dl) dl.onclick = async () => { if (!(await ask(`حذف الكود ${c.code}؟`))) return; await sb.from("coupons").delete().eq("code", c.code); toast("حُذف"); SUB.coupons.fn(m); }; };
  $$("[data-c]", m).forEach((r) => r.onclick = () => edit(cs.find((x) => x.code === r.dataset.c)));
  $("#add", m).onclick = () => edit(null);
} };

SUB.customers = { title: "الزبائن", fn: async (m) => {
  const { data, error } = await sb.from("customers").select("*").order("last_order_at", { ascending: false }).limit(500); if (error) throw error; const cs = data || []; let q = "";
  m.innerHTML = `${back()}<input type="search" id="q" placeholder="🔍 ابحث بالاسم أو الرقم"><div id="ls"></div>`;
  const draw = () => { const l = cs.filter((c) => !q || (c.name || "").includes(q) || (c.phone || "").includes(q)); $("#ls").innerHTML = l.length ? l.map((c) => `<div class="item" data-p="${esc(c.phone)}"><div class="ph">👤</div><div class="tx"><b>${esc(c.name || "زبون")}</b><small dir="ltr" style="display:inline-block">${esc(c.phone)}</small> · ${c.orders_count || 0} طلب · ${money(c.total_spent)}</div></div>`).join("") : `<div class="empty">لا يوجد زبائن</div>`;
    $$("[data-p]", m).forEach((r) => r.onclick = () => { const c = cs.find((x) => x.phone === r.dataset.p);
      const s = sheet(`<h2>${esc(c.name || "زبون")}</h2><p class="mut" dir="ltr" style="text-align:right">${esc(c.phone)}</p><a class="btn ok" style="display:block;text-align:center;text-decoration:none" href="${wa(c.phone)}" target="_blank">💬 واتساب</a>
      <label class="f"><span>ملاحظة</span><textarea id="nt">${esc(c.note || "")}</textarea></label><div class="card" style="padding:4px 14px"><label class="sw"><span>يقبل العروض</span><input type="checkbox" id="mk" ${c.marketing ? "checked" : ""}></label></div><button class="btn" id="sv">💾 حفظ</button>`);
      $("#sv", s).onclick = async () => { const { error } = await sb.from("customers").update({ note: $("#nt", s).value, marketing: $("#mk", s).checked }).eq("phone", c.phone); if (error) return fail(error); c.note = $("#nt", s).value; c.marketing = $("#mk", s).checked; closeSheet(); toast("تم ✓"); }; }); };
  $("#q").oninput = (e) => { q = e.target.value.trim(); draw(); }; draw();
} };

SUB.reviews = { title: "التقييمات", fn: async (m) => {
  const { data, error } = await sb.from("reviews").select("*").order("created_at", { ascending: false }).limit(200); if (error) throw error; const rs = data || [];
  m.innerHTML = `${back()}${rs.length ? rs.map((r) => `<div class="card"><b>${"⭐".repeat(r.rating || 0)}</b> ${esc(r.name || "")} <span class="tag ${r.status === "approved" ? "done" : "new"}">${r.status === "approved" ? "ظاهر" : "ينتظر"}</span><p style="margin:6px 0">${esc(r.text || "")}</p><div class="row"><button class="btn sm ${r.status === "approved" ? "g" : "ok"}" data-a="${r.id}">${r.status === "approved" ? "إخفاء" : "✅ إظهار"}</button><button class="btn sm red" data-d="${r.id}" style="box-shadow:0 3px 0 #f3c4c6">حذف</button></div></div>`).join("") : `<div class="empty">لا توجد تقييمات بعد</div>`}`;
  $$("[data-a]", m).forEach((b) => b.onclick = async () => { const r = rs.find((x) => x.id === b.dataset.a); await sb.from("reviews").update({ status: r.status === "approved" ? "pending" : "approved" }).eq("id", r.id); SUB.reviews.fn(m); });
  $$("[data-d]", m).forEach((b) => b.onclick = async () => { if (!(await ask("حذف هذا التقييم؟"))) return; await sb.from("reviews").delete().eq("id", b.dataset.d); SUB.reviews.fn(m); });
} };

SUB.settings = { title: "إعدادات المنصة", fn: async (m) => {
  const { data, error } = await sb.from("store_settings").select("config").eq("id", 1).maybeSingle(); if (error) throw error; const cfg = data?.config || {};
  const T = cfg.texts || {}, bank = (cfg.order?.payments || []).find((x) => x.type === "bank") || {}, bb = bank.bank || {};
  m.innerHTML = `${back()}
  <div class="card"><h3>🏪 المنصة</h3><label class="f"><span>اسم المنصة</span><input type="text" id="nm" value="${esc(cfg.name || "")}"></label>
  <label class="f"><span>رقم واتساب الطلبات</span><input type="tel" id="wa" dir="ltr" value="${esc(cfg.order?.whatsapp || "")}" placeholder="96877336242"><small>بالأرقام مع رمز الدولة بدون +</small></label>
  <label class="f"><span>اللون الأساسي</span><input type="color" id="pc" value="${esc(cfg.theme?.primary || "#5B34D6")}" style="height:46px;padding:4px"></label></div>
  <div class="card"><h3>📣 شريط الإعلان (أعلى المنصة)</h3><label class="sw"><span>إظهار الشريط</span><input type="checkbox" id="as" ${T.announce_show ? "checked" : ""}></label><label class="f"><span>نص الإعلان</span><input type="text" id="at" value="${esc(T.announce_text || "")}"></label></div>
  <div class="card"><h3>🖼️ الصفحة الرئيسية</h3><label class="f"><span>العنوان الكبير</span><textarea id="ht" style="min-height:70px">${esc(T.hero_title || "")}</textarea></label>
  <label class="f"><span>النص تحت العنوان</span><textarea id="hx">${esc(T.hero_text || "")}</textarea></label><label class="f"><span>نص الزر</span><input type="text" id="hb" value="${esc(T.hero_button || "")}"></label>
  <label class="f"><span>نبذة عن المنصة</span><textarea id="ab">${esc(T.about || "")}</textarea></label></div>
  <div class="card"><h3>💳 الدفع (التحويل البنكي)</h3><label class="f"><span>اسم البنك</span><input type="text" id="bk" value="${esc(bb.bank || "")}"></label><label class="f"><span>اسم صاحب الحساب</span><input type="text" id="bh" value="${esc(bb.holder || "")}"></label><label class="f"><span>رقم الحساب</span><input type="text" id="bn" dir="ltr" value="${esc(bb.number || "")}"></label><label class="f"><span>الآيبان (IBAN)</span><input type="text" id="bi" dir="ltr" value="${esc(bb.iban || "")}"></label>
  <label class="f"><span>تعليمات الدفع للزبون</span><textarea id="bt">${esc(bank.note || "")}</textarea></label></div>
  <button class="btn" id="sv">💾 حفظ الإعدادات</button>`;
  $("#sv", m).onclick = async () => {
    const { data: fresh } = await sb.from("store_settings").select("config").eq("id", 1).maybeSingle(); const c = fresh?.config || cfg;
    c.name = $("#nm", m).value.trim() || c.name; c.order = c.order || {}; c.order.whatsapp = digits($("#wa", m).value) || c.order.whatsapp;
    c.theme = { ...(c.theme || {}), primary: $("#pc", m).value };
    c.texts = { ...(c.texts || {}), announce_show: $("#as", m).checked, announce_text: $("#at", m).value.trim(), hero_title: $("#ht", m).value.trim(), hero_text: $("#hx", m).value.trim(), hero_button: $("#hb", m).value.trim(), about: $("#ab", m).value.trim() };
    const pays = c.order.payments = c.order.payments || []; let b = pays.find((x) => x.type === "bank");
    if (!b) { b = { id: "bank", type: "bank", name: "تحويل بنكي", enabled: true, countries: ["OM"] }; pays.push(b); }
    b.bank = { ...(b.bank || {}), bank: $("#bk", m).value.trim(), holder: $("#bh", m).value.trim(), number: $("#bn", m).value.trim(), iban: $("#bi", m).value.trim() }; b.note = $("#bt", m).value.trim();
    const { error } = await sb.from("store_settings").update({ config: c }).eq("id", 1); if (error) return fail(error); toast("تم الحفظ ✓ يظهر في المنصة الآن");
  };
} };

SUB.account = { title: "حسابي", fn: async (m) => {
  const { data } = await sb.auth.getUser();
  m.innerHTML = `${back()}<div class="card"><b>الحساب</b><p class="mut" dir="ltr" style="text-align:right">${esc(data.user?.email || "")}</p></div>
  <div class="card"><h3>تغيير كلمة المرور</h3><label class="f"><span>كلمة المرور الجديدة (8 أحرف فأكثر)</span><input type="password" id="np" dir="ltr"></label><button class="btn" id="cp">حفظ</button></div>
  <button class="btn red" id="lo">تسجيل الخروج</button>`;
  $("#cp", m).onclick = async () => { const v = $("#np", m).value; if (v.length < 8) return toast("كلمة المرور قصيرة"); const { error } = await sb.auth.updateUser({ password: v }); if (error) return fail(error); $("#np", m).value = ""; toast("تم التغيير ✓"); };
  $("#lo", m).onclick = async () => { await sb.auth.signOut(); location.reload(); };
} };

/* ---------- الاختبارات والتقييمات ---------- */
const QSUBJ = { ar: ["اللغة العربية", "u_letters"], math: ["الرياضيات", "u_nums"], sci: ["العلوم", "i_microscope"], gen: ["المهارات العامة", "i_brain"], en: ["اللغة الإنجليزية", "u_abc"], isl: ["التربية الإسلامية", "i_heart"], life: ["المهارات الحياتية", "i_brain"] };
const QKIND = { basic: "تقييم بسيط", practice: "تقييم تدريبي", full: "تقييم شامل" };
const QT = { mc: "اختيار من متعدد", tf: "صح أو خطأ", num: "إدخال عدد", order: "ترتيب", fill: "إكمال الفراغ", sort: "تصنيف", match: "توصيل" };
const QTD = { mc: "سؤال وخيارات (نص أو صور) وإجابة صحيحة واحدة", tf: "عبارة والطفل يختار صح أو خطأ", num: "الطفل يكتب الناتج بلوحة أرقام", order: "ترتيب حروف أو كلمات أو صور أو أعداد", fill: "جملة فيها فراغ __ وخيارات لإكماله", sort: "سحب العناصر إلى مجموعاتها", match: "توصيل كل صورة أو كلمة بما يناسبها" };
const QMAX = { o: 6, order: 8, sort: 10, b: 3, p: 6 };
const QDIFF = { 1: "سهل", 2: "متوسط", 3: "صعب" };
const qLv = (v) => (LIBLV.find((l) => l[0] === v) || [v, v])[1];
const qIcon = (sj) => `${SITE}images/zad/${(QSUBJ[sj] || ["", "i_target"])[1]}.webp`;
const qClean = (s) => String(s ?? "").replace(/[⟦⟧]/g, "");
const qHas = (v) => v != null && (typeof v === "object" ? !!(v.i || (v.x != null && String(v.x).trim())) : String(v).trim() !== "");
const qPct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
let qzF = { lv: "all", sj: "all", st: "all", q: "" };
function qImg(spec) {
  spec = String(spec || "").trim(); if (!spec) return "";
  if (spec.includes("|")) return spec.split("|").map((x) => qImg(x)).join("");
  spec = spec.replace(/@[0-9.]+$/, "");
  if (/^(svg|cnt):/.test(spec)) return `<span class="qz-th qz-svg">رسم</span>`;
  return `<img class="qz-th" src="${esc(/^https?:/.test(spec) ? spec : SITE + "images/zad/" + spec + ".webp")}" alt="" onerror="this.classList.add('bad')">`;
}
const AUDT = { mp3: "audio/mpeg", m4a: "audio/mp4", mp4: "audio/mp4", aac: "audio/aac", wav: "audio/wav", ogg: "audio/ogg", webm: "audio/webm" };
function qShrink(file, max) {
  const png = file.type === "image/png";
  return new Promise((res, rej) => {
    const im = new Image(), u = URL.createObjectURL(file);
    im.onload = () => { const k = Math.min(1, max / Math.max(im.width || max, im.height || max)); const c = document.createElement("canvas"); c.width = Math.max(1, Math.round((im.width || max) * k)); c.height = Math.max(1, Math.round((im.height || max) * k)); const g = c.getContext("2d"); if (!png) { g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); } g.drawImage(im, 0, 0, c.width, c.height); c.toBlob((b) => b ? res({ b, type: png ? "image/png" : "image/jpeg", ext: png ? "png" : "jpg" }) : rej(new Error("img")), png ? "image/png" : "image/jpeg", .86); URL.revokeObjectURL(u); };
    im.onerror = () => { URL.revokeObjectURL(u); rej(new Error("type")); }; im.src = u;
  });
}
async function qUpload(file, kind) {
  let body = file, type = file.type || "", ext = (file.name.split(".").pop() || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  if (kind === "img") {
    if (!/^image\//.test(type)) throw new Error("type");
    if (type !== "image/gif") { const r = await qShrink(file, 900); body = r.b; type = r.type; ext = r.ext; }
  } else {
    if (!type && AUDT[ext]) type = AUDT[ext];
    if (type === "audio/x-m4a" || type === "audio/m4a") type = "audio/mp4";
    if (!/^audio\//.test(type)) throw new Error("type");
  }
  if (body.size > 10 * 1024 * 1024) throw new Error("size");
  const path = `${kind}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext || "bin"}`;
  const { error } = await sb.storage.from("quiz-media").upload(path, body, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return sb.storage.from("quiz-media").getPublicUrl(path).data.publicUrl;
}
const mediaField = (kind, val, ph) => `<div class="qz-mf" data-mf="${kind}"><input type="text" dir="ltr" value="${esc(Array.isArray(val) ? val.join(" | ") : val || "")}" placeholder="${ph || (kind === "img" ? "صورة: ارفعها أو اكتب رمزها" : "صوت: ارفعه أو اكتب رابطه")}" aria-label="${kind === "img" ? "الصورة" : "الصوت"}"><label class="chip qz-upl">${kind === "img" ? "رفع صورة" : "رفع صوت"}<input type="file" accept="${kind === "img" ? "image/*" : "audio/*"}" hidden></label><span class="qz-pv"></span></div>`;
function bindMedia(root) {
  $$("[data-mf]", root).forEach((w) => {
    if (w.dataset.b) return; w.dataset.b = "1";
    const inp = $("input[type=text]", w), fi = $("input[type=file]", w), pv = $(".qz-pv", w), kind = w.dataset.mf, lb = $(".qz-upl", w);
    const show = () => {
      const v = inp.value.trim();
      pv.innerHTML = kind === "img" ? qImg(v) : v ? `<button type="button" class="chip" data-play>تشغيل</button>` : "";
      const pb = $("[data-play]", pv); if (pb) pb.onclick = () => { try { new Audio(v).play().catch(() => toast("تعذّر تشغيل الصوت")); } catch (e) { toast("تعذّر تشغيل الصوت"); } };
    };
    inp.oninput = show; show();
    fi.onchange = async () => {
      const f = fi.files[0]; if (!f) return;
      lb.classList.add("busy"); lb.firstChild.textContent = "جاري الرفع…";
      try { inp.value = await qUpload(f, kind); show(); toast("تم رفع الملف"); }
      catch (e) { console.error(e); toast(e.message === "type" ? (kind === "img" ? "اختر ملف صورة" : "اختر ملفًا صوتيًا (mp3 أو m4a)") : e.message === "size" ? "الملف أكبر من 10 ميغابايت" : "تعذّر الرفع، حاول مرة أخرى"); }
      lb.classList.remove("busy"); lb.firstChild.textContent = kind === "img" ? "رفع صورة" : "رفع صوت"; fi.value = "";
    };
  });
}
const mfVal = (w) => { const v = $("input[type=text]", w).value.trim(); return v.includes("|") ? v.split("|").map((x) => x.trim()).filter(Boolean) : v; };
/* عنصر: نص و/أو صورة */
const itemRow = (v, pre, post) => { const o = v && typeof v === "object" ? v : { x: v }; return `<div class="qz-it"><div class="qz-r1">${pre || ""}<input type="text" class="qx" value="${esc(o.x ?? "")}" placeholder="النص (اختياري إذا وضعت صورة)" aria-label="النص"><button type="button" class="chip qz-rm" aria-label="حذف هذا العنصر">حذف</button></div>${mediaField("img", o.i || "")}${post || ""}</div>`; };
const readItem = (box) => { const x = $(".qx", box).value.trim(), i = mfVal($("[data-mf]", box)); return i ? (x ? { i, x } : { i }) : x; };
function qCheck(q, data) {
  if (!QT[q.t]) return "نوع السؤال غير معروف";
  if (!String(q.q || "").trim()) return "اكتب نص السؤال";
  if (q.listen && !q.say && !q.snd) return "سؤال الاستماع يحتاج نصًا يقرؤه زوزو أو ملفًا صوتيًا";
  if (q.t === "mc" || q.t === "fill") {
    if (!Array.isArray(q.o) || q.o.length < 2) return "أضف خيارين على الأقل";
    if (q.o.some((v) => !qHas(v))) return "يوجد خيار فارغ";
    if (new Set(q.o.map((v) => JSON.stringify(v))).size !== q.o.length) return "يوجد خياران متطابقان";
    if (!(Number.isInteger(q.a) && q.a >= 0 && q.a < q.o.length)) return "اختر الإجابة الصحيحة";
  }
  if (q.t === "fill" && !String(q.q).includes("__")) return "ضع __ (شرطتين) مكان الفراغ في نص السؤال";
  if (q.t === "tf" && typeof q.a !== "boolean") return "اختر صح أو خطأ";
  if (q.t === "num" && !(Number.isInteger(q.a) && q.a >= 0 && q.a < 1e7)) return "الإجابة يجب أن تكون عددًا صحيحًا موجبًا (بدون فواصل)";
  if (q.t === "order") { if (!Array.isArray(q.o) || q.o.length < 2) return "أضف عنصرين على الأقل"; if (q.o.some((v) => !qHas(v))) return "يوجد عنصر فارغ"; }
  if (q.t === "sort") {
    if (!Array.isArray(q.b) || q.b.length < 2) return "أضف مجموعتين على الأقل"; if (q.b.some((v) => !qHas(v))) return "اكتب اسم كل مجموعة أو ضع صورتها";
    if (!Array.isArray(q.o) || q.o.length < 2) return "أضف عنصرين على الأقل للتصنيف"; if (q.o.some((v) => !qHas(v) || !(v.b >= 0 && v.b < q.b.length))) return "كل عنصر يحتاج نصًا أو صورة ومجموعة";
  }
  if (q.t === "match") { if (!Array.isArray(q.p) || q.p.length < 2) return "أضف زوجين على الأقل"; if (q.p.some((r) => !Array.isArray(r) || !qHas(r[0]) || !qHas(r[1]))) return "أكمل طرفي كل زوج"; if (new Set(q.p.map((r) => JSON.stringify(r[1]))).size !== q.p.length) return "يوجد طرفان متطابقان في العمود الثاني"; }
  if (q.psg && !(data.psg && data.psg[q.psg])) return "نص القراءة المرتبط غير موجود";
  return "";
}
let qzDirty = false;
addEventListener("beforeunload", (e) => { if (qzDirty) { e.preventDefault(); e.returnValue = ""; } });

SUB.quizzes = { title: "الاختبارات والتقييمات", fn: async (m) => {
  const [r, s] = await Promise.all([sb.from("quizzes").select("id,slug,lv,subj,kind,title,skill,diff,n,is_published,sort_order,updated_at").order("sort_order", { ascending: true }), sb.from("quiz_stats").select("*")]);
  if (r.error) throw r.error;
  const all = r.data || [], S = {}; (s.data || []).forEach((x) => S[x.quiz_id] = x);
  const att = Object.values(S).reduce((t, x) => t + (+x.attempts || 0), 0), avg = att ? Math.round(Object.values(S).reduce((t, x) => t + (+x.avg_pct || 0) * (+x.attempts || 0), 0) / att) : null, pub = all.filter((x) => x.is_published).length;
  const chip = (g, v, l) => `<button class="chip${qzF[g] === v ? " on" : ""}" data-f="${g}" data-v="${v}">${l}</button>`;
  m.innerHTML = `${back()}<div class="grid2 qz-kp"><div class="stat"><b>${all.length}</b><span>اختبار</span></div><div class="stat"><b>${pub}</b><span>منشور للأطفال</span></div><div class="stat"><b>${att}</b><span>محاولة مكتملة</span></div><div class="stat"><b>${avg == null ? "—" : avg + "%"}</b><span>متوسط النتائج</span></div></div>
  <p class="mut qz-pr">المحاولات تُحسب بدون أسماء أو بيانات أطفال. نتيجة كل طفل تبقى على جهازه وفي لوحة ولي الأمر فقط.</p>
  <input type="search" id="qzs" placeholder="ابحث بعنوان الاختبار أو المهارة" value="${esc(qzF.q)}">
  <div class="chips">${chip("lv", "all", "كل الأعمار")}${LIBLV.map((l) => chip("lv", l[0], l[1])).join("")}</div>
  <div class="chips">${chip("sj", "all", "كل المواد")}${Object.keys(QSUBJ).map((k) => chip("sj", k, QSUBJ[k][0])).join("")}${chip("st", "all", "الكل")}${chip("st", "pub", "المنشورة")}${chip("st", "hid", "المخفية")}</div>
  <div id="qzl"></div><button class="btn fab" id="add">+ اختبار جديد</button>`;
  const list = () => {
    const q = qzF.q.trim(), L = all.filter((x) => (qzF.lv === "all" || x.lv === qzF.lv) && (qzF.sj === "all" || x.subj === qzF.sj) && (qzF.st === "all" || (qzF.st === "pub") === !!x.is_published) && (!q || (x.title + " " + (x.skill || "")).includes(q)));
    $("#qzl", m).innerHTML = L.length ? `<p class="mut" style="margin:4px 0">${L.length} اختبار</p>` + L.map((x) => { const st = S[x.id]; return `<div class="item" data-q="${x.id}"><img src="${qIcon(x.subj)}" alt="" style="object-fit:contain;padding:6px"><div class="tx"><b>${esc(x.title)}</b><small>${esc(qLv(x.lv))} · ${esc((QSUBJ[x.subj] || [""])[0])} · ${QKIND[x.kind] || ""} · ${x.n} سؤال${st && st.attempts ? ` · ${st.attempts} محاولة · ${Math.round(st.avg_pct)}%` : ""}</small></div><button class="tag ${x.is_published ? "done" : "off"} qz-pb" data-pub="${x.id}" aria-label="${x.is_published ? "منشور، اضغط للإخفاء" : "مخفي، اضغط للنشر"}">${x.is_published ? "منشور" : "مخفي"}</button></div>`; }).join("") : `<div class="empty">لا توجد اختبارات بهذا التصفية</div>`;
    $$("[data-q]", m).forEach((e) => e.onclick = () => quizEdit(m, e.dataset.q));
    $$("[data-pub]", m).forEach((b) => b.onclick = async (e) => {
      e.stopPropagation(); const x = all.find((y) => y.id === b.dataset.pub); if (!x) return;
      if (!x.is_published && !x.n) return toast("أضف أسئلة قبل النشر");
      const { error } = await sb.from("quizzes").update({ is_published: !x.is_published }).eq("id", x.id); if (error) return fail(error);
      x.is_published = !x.is_published; toast(x.is_published ? "نُشر الاختبار للأطفال" : "أُخفي الاختبار"); list();
    });
  };
  $$("[data-f]", m).forEach((b) => b.onclick = () => { qzF[b.dataset.f] = b.dataset.v; SUB.quizzes.fn(m); });
  $("#qzs", m).oninput = (e) => { qzF.q = e.target.value; list(); };
  $("#add", m).onclick = () => quizEdit(m, null);
  list();
} };

async function quizEdit(m, id) {
  qzDirty = false;
  m.innerHTML = `<div class="spin">جاري التحميل…</div>`; scrollTo(0, 0);
  let Z, ST = null; const QS = {};
  if (id) {
    const [r, s1, s2] = await Promise.all([sb.from("quizzes").select("*").eq("id", id).single(), sb.from("quiz_stats").select("*").eq("quiz_id", id), sb.from("quiz_qstats").select("*").eq("quiz_id", id)]);
    if (r.error) { fail(r.error); return SUB.quizzes.fn(m); }
    Z = r.data; ST = (s1.data || [])[0] || null; (s2.data || []).forEach((x) => QS[x.qid] = x);
  } else Z = { id: null, slug: "", lv: qzF.lv !== "all" ? qzF.lv : "a5", subj: qzF.sj !== "all" ? qzF.sj : "ar", kind: "basic", title: "", skill: "", diff: 1, intro: "", data: { qs: [] }, is_published: false, sort_order: 0 };
  Z.data = Z.data && typeof Z.data === "object" ? JSON.parse(JSON.stringify(Z.data)) : { qs: [] };
  if (!Array.isArray(Z.data.qs)) Z.data.qs = [];
  const D = Z.data, sel = (id, o, v) => `<select id="${id}">${Object.entries(o).map(([k, l]) => `<option value="${k}"${String(v) === String(k) ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const touch = () => { qzDirty = true; const b = $("#qzbar", m); b && b.classList.add("on"); };
  const syncMeta = () => {
    if (!$("#qtt", m)) return;
    Z.title = $("#qtt", m).value.trim(); Z.lv = $("#qlv", m).value; Z.subj = $("#qsj", m).value; Z.kind = $("#qkd", m).value; Z.skill = $("#qsk", m).value.trim(); Z.diff = +$("#qdf", m).value || 1; Z.intro = $("#qin", m).value.trim(); Z.sort_order = parseInt($("#qso", m).value, 10) || 0; Z.is_published = $("#qpub", m).checked;
    if ($("#qtm", m).checked) D.timer = true; else delete D.timer;
  };
  const draw = () => {
    const ps = D.psg && typeof D.psg === "object" ? D.psg : {};
    m.innerHTML = `<button class="chip" id="qback">→ كل الاختبارات</button>
    <div class="card"><h3>بيانات الاختبار</h3>
      <label class="f"><span>العنوان</span><input type="text" id="qtt" value="${esc(Z.title)}" placeholder="مثال: الحروف من أ إلى ث"></label>
      <div class="grid2"><label class="f"><span>العمر أو الصف</span>${sel("qlv", Object.fromEntries(LIBLV), Z.lv)}</label><label class="f"><span>المادة</span>${sel("qsj", Object.fromEntries(Object.entries(QSUBJ).map(([k, v]) => [k, v[0]])), Z.subj)}</label>
      <label class="f"><span>نوع التقييم</span>${sel("qkd", QKIND, Z.kind)}</label><label class="f"><span>الصعوبة</span>${sel("qdf", QDIFF, Z.diff || 1)}</label></div>
      <label class="f"><span>المهارة الأساسية</span><input type="text" id="qsk" value="${esc(Z.skill || "")}" placeholder="مثال: الجمع ضمن 10"></label>
      <label class="f"><span>وصف قصير يظهر قبل البدء</span><textarea id="qin" style="min-height:64px">${esc(Z.intro || "")}</textarea></label>
      <label class="f"><span>الترتيب في القائمة</span><input type="number" id="qso" value="${Z.sort_order || 0}" inputmode="numeric"><small>الأصغر يظهر أولًا داخل نفس المستوى.</small></label>
      <div class="sw"><span>منشور للأطفال<br><small class="mut">المخفي لا يظهر في صفحة الاختبارات.</small></span><input type="checkbox" id="qpub"${Z.is_published ? " checked" : ""}></div>
      <div class="sw"><span>خيار قياس الوقت<br><small class="mut">اختياري للطفل، بدون عدّ تنازلي (للصفوف فقط).</small></span><input type="checkbox" id="qtm"${D.timer ? " checked" : ""}></div>
    </div>
    ${Z.id ? `<div class="card"><h3>إحصائيات عامة</h3>${ST && ST.attempts ? `<p style="margin:0">${ST.attempts} محاولة مكتملة · متوسط النتيجة ${Math.round(ST.avg_pct)}% · آخر محاولة ${ago(ST.last_at)}</p>` : `<p class="mut" style="margin:0">لا توجد محاولات بعد.</p>`}<small class="mut">بدون أسماء أو بيانات أطفال. نسبة الإجابة الصحيحة لكل سؤال تظهر تحته.</small></div>` : ""}
    <div class="card"><h3>نصوص القراءة <small class="mut">(اختياري)</small></h3>${Object.keys(ps).length ? Object.entries(ps).map(([k, g]) => `<div class="item" data-ps="${esc(k)}"><div class="ph qz-n">نص</div><div class="tx"><b>${esc(g.t || "بدون عنوان")}</b><small>${esc(String(g.x || "").slice(0, 60))}…</small></div></div>`).join("") : `<p class="mut" style="margin:0 0 8px">أضف نصًا قصيرًا إذا كانت الأسئلة عن فهم المقروء.</p>`}<button class="btn sm g" id="qaddp">+ نص قراءة</button></div>
    <div class="card"><h3>الأسئلة (${D.qs.length})</h3>${D.qs.length ? D.qs.map((q, k) => { const t = QS[q.id]; return `<div class="item qz-q" data-qi="${k}"><div class="ph qz-n">${k + 1}</div><div class="tx"><b>${esc(qClean(q.q)) || "بدون نص"}</b><small>${QT[q.t] || q.t}${q.sk ? " · " + esc(q.sk) : ""}${t && t.answered ? ` · أجاب ${t.answered}، صحيح ${qPct(t.correct, t.answered)}%` : ""}</small></div><button class="chip" data-up="${k}" aria-label="تحريك لأعلى">▲</button><button class="chip" data-dn="${k}" aria-label="تحريك لأسفل">▼</button></div>`; }).join("") : `<p class="mut">لا توجد أسئلة بعد.</p>`}<button class="btn sm" id="qaddq" style="margin-top:6px">+ إضافة سؤال</button></div>
    <div class="row" style="margin:10px 0"><button class="btn g" id="qprev">معاينة كما يراها الطفل</button></div>
    ${Z.id ? `<button class="btn red" id="qdel">حذف الاختبار نهائيًا</button>` : ""}
    <div class="qz-bar${qzDirty ? " on" : ""}" id="qzbar"><span>تغييرات غير محفوظة</span><button class="btn ok" id="qsave">حفظ الاختبار</button></div>`;
    $$("#qtt,#qlv,#qsj,#qkd,#qsk,#qdf,#qin,#qso,#qpub,#qtm", m).forEach((e) => e.addEventListener(e.tagName === "SELECT" || e.type === "checkbox" ? "change" : "input", touch));
    $("#qback", m).onclick = () => go("quizzes");
    $$("[data-qi]", m).forEach((e) => e.onclick = () => { syncMeta(); qSheet(D.qs[+e.dataset.qi], +e.dataset.qi); });
    const mv = (i, j) => { if (j < 0 || j >= D.qs.length) return; syncMeta(); [D.qs[i], D.qs[j]] = [D.qs[j], D.qs[i]]; qzDirty = true; draw(); };
    $$("[data-up]", m).forEach((b) => b.onclick = (e) => { e.stopPropagation(); mv(+b.dataset.up, +b.dataset.up - 1); });
    $$("[data-dn]", m).forEach((b) => b.onclick = (e) => { e.stopPropagation(); mv(+b.dataset.dn, +b.dataset.dn + 1); });
    $("#qaddq", m).onclick = () => { syncMeta(); typeSheet(); };
    $("#qaddp", m).onclick = () => { syncMeta(); pSheet(null); };
    $$("[data-ps]", m).forEach((e) => e.onclick = () => { syncMeta(); pSheet(e.dataset.ps); });
    $("#qsave", m).onclick = save;
    $("#qprev", m).onclick = () => {
      syncMeta(); if (!D.qs.length) return toast("أضف سؤالًا أولًا");
      for (let k = 0; k < D.qs.length; k++) { const e = qCheck(D.qs[k], D); if (e) return toast(`السؤال ${k + 1}: ${e}`); }
      try { localStorage.setItem("zad.qz.preview", JSON.stringify({ lv: Z.lv, subj: Z.subj, kind: Z.kind, title: Z.title || "معاينة", skill: Z.skill, diff: Z.diff, intro: Z.intro, data: D })); } catch (e) { return toast("تعذّر تجهيز المعاينة"); }
      window.open(SITE + "tests/#q=__preview", "_blank");
    };
    const dl = $("#qdel", m); if (dl) dl.onclick = async () => { if (!(await ask(`حذف «${Z.title}» وكل إحصائياته؟`))) return; const { error } = await sb.from("quizzes").delete().eq("id", Z.id); if (error) return fail(error); qzDirty = false; toast("حُذف الاختبار"); go("quizzes"); };
  };
  const save = async () => {
    syncMeta();
    if (!Z.title) return toast("اكتب عنوان الاختبار");
    for (let k = 0; k < D.qs.length; k++) { const e = qCheck(D.qs[k], D); if (e) return toast(`السؤال ${k + 1}: ${e}`); }
    if (Z.is_published && !D.qs.length) return toast("أضف سؤالًا واحدًا على الأقل قبل النشر");
    if (!Z.slug) Z.slug = `${Z.lv}-${Z.subj}-${Z.kind}-${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 4)}`;
    const row = { slug: Z.slug, lv: Z.lv, subj: Z.subj, kind: Z.kind, title: Z.title, skill: Z.skill || null, diff: Z.diff || 1, intro: Z.intro || null, data: D, is_published: Z.is_published, sort_order: Z.sort_order || 0 };
    const b = $("#qsave", m); b.disabled = true; b.textContent = "جاري الحفظ…";
    const { data, error } = Z.id ? await sb.from("quizzes").update(row).eq("id", Z.id).select("id").single() : await sb.from("quizzes").insert(row).select("id").single();
    b.disabled = false; b.textContent = "حفظ الاختبار";
    if (error) return fail(error);
    Z.id = data.id; qzDirty = false; $("#qzbar", m).classList.remove("on"); toast("تم حفظ الاختبار ✓"); draw();
  };
  const newId = () => { let k = D.qs.length + 1; while (D.qs.some((q) => q.id === "q" + k)) k++; return "q" + k; };
  const typeSheet = () => {
    const s = sheet(`<h2>نوع السؤال</h2><div class="qz-types">${Object.keys(QT).map((t) => `<button data-t="${t}"><b>${QT[t]}</b><small>${QTD[t]}</small></button>`).join("")}</div>`);
    $$("[data-t]", s).forEach((b) => b.onclick = () => {
      const t = b.dataset.t, base = { t, q: "", sk: Z.skill || "", id: newId() };
      const def = { mc: { o: ["", ""], a: 0 }, tf: { a: true }, num: { a: 0 }, order: { o: ["", ""] }, fill: { o: ["", ""], a: 0 }, sort: { b: ["", ""], o: [{ x: "", b: 0 }, { x: "", b: 1 }] }, match: { p: [["", ""], ["", ""]] } }[t];
      qSheet(Object.assign(base, def), -1);
    });
  };
  const pSheet = (key) => {
    D.psg = D.psg && typeof D.psg === "object" ? D.psg : {};
    const g = key ? D.psg[key] : { t: "", x: "" };
    const s = sheet(`<h2>${key ? "تعديل نص القراءة" : "نص قراءة جديد"}</h2><label class="f"><span>العنوان</span><input type="text" id="pt" value="${esc(g.t || "")}"></label><label class="f"><span>النص</span><textarea id="px" style="min-height:140px">${esc(g.x || "")}</textarea><small>اجعله قصيرًا وواضحًا. يظهر فوق كل سؤال مرتبط به.</small></label><label class="f"><span>تسجيل صوتي للنص (اختياري)</span>${mediaField("snd", g.snd || "")}<small>إن لم تضف صوتًا يقرأ زوزو النص.</small></label><button class="btn" id="psv">حفظ النص</button>${key ? `<button class="btn red" id="pdl" style="margin-top:10px">حذف النص</button>` : ""}`);
    bindMedia(s);
    $("#psv", s).onclick = () => {
      const t = $("#pt", s).value.trim(), x = $("#px", s).value.trim(), snd = mfVal($("[data-mf]", s)); if (!x) return toast("اكتب النص");
      let k = key; if (!k) { let n = 1; while (D.psg["p" + n]) n++; k = "p" + n; }
      D.psg[k] = Object.assign({ t, x }, snd ? { snd: String(snd) } : {}); qzDirty = true; closeSheet(); draw();
    };
    const d = $("#pdl", s); if (d) d.onclick = () => { if (D.qs.some((q) => q.psg === key)) return toast("انقل الأسئلة المرتبطة بهذا النص أولًا"); delete D.psg[key]; if (!Object.keys(D.psg).length) delete D.psg; qzDirty = true; closeSheet(); draw(); };
  };
  const qSheet = (orig, idx) => {
    const E = JSON.parse(JSON.stringify(orig)), ps = D.psg && typeof D.psg === "object" ? D.psg : {};
    const s = sheet(`<h2>${idx < 0 ? "سؤال جديد" : "السؤال " + (idx + 1)}: ${QT[E.t]}</h2>
      <label class="f"><span>نص السؤال</span><textarea id="eq1" style="min-height:70px">${esc(E.q || "")}</textarea><small>${E.t === "fill" ? "ضع __ (شرطتين) مكان الفراغ. " : ""}للمعادلات الرياضية اكتبها كما هي، مثل 5 + 3 = ؟</small></label>
      <label class="f"><span>صورة السؤال (اختياري)</span>${mediaField("img", E.img || "")}</label>
      <div id="etype"></div>
      <label class="f"><span>الشرح بعد الإجابة</span><textarea id="eex" style="min-height:60px">${esc(qClean(E.ex || ""))}</textarea><small>جملة بسيطة تشرح الإجابة الصحيحة بلطف.</small></label>
      <label class="f"><span>المهارة</span><input type="text" id="esk" value="${esc(E.sk || "")}"></label>
      <details class="qz-adv"><summary>الصوت وخيارات إضافية</summary>
        <label class="f"><span>ما يقوله زوزو (اختياري)</span><input type="text" id="esay" value="${esc(E.say || "")}"><small>إن تركته فارغًا يقرأ زوزو نص السؤال.</small></label>
        <label class="f"><span>تسجيل صوتي للسؤال (اختياري)</span>${mediaField("snd", E.snd || "")}</label>
        <div class="sw"><span>سؤال استماع<br><small class="mut">يسمع الطفل السؤال ويختار، مناسب للصغار.</small></span><input type="checkbox" id="elis"${E.listen ? " checked" : ""}></div>
        <label class="f"><span>تلميح (اختياري)</span><input type="text" id="ehint" value="${esc(E.hint || "")}"></label>
        ${Object.keys(ps).length ? `<label class="f"><span>نص القراءة المرتبط</span><select id="epsg"><option value="">بدون</option>${Object.entries(ps).map(([k, g]) => `<option value="${esc(k)}"${E.psg === k ? " selected" : ""}>${esc(g.t || k)}</option>`).join("")}</select></label>` : ""}
        <label class="f"><span>صور للحفظ ثم الإخفاء (اختياري)</span><input type="text" id="ememo" dir="ltr" value="${esc(Array.isArray(E.memo) ? E.memo.join(" | ") : "")}" placeholder="رموز صور مفصولة بـ |"><small>لأسئلة الذاكرة: تظهر الصور ثم تختفي قبل السؤال.</small></label>
      </details>
      <p class="qz-err" id="eerr" role="alert"></p>
      <button class="btn" id="esv">حفظ السؤال</button>${idx >= 0 ? `<button class="btn red" id="edl" style="margin-top:10px">حذف السؤال</button>` : ""}`);
    const T = $("#etype", s);
    const radio = (k, on) => `<label class="qz-ok"><input type="radio" name="ea" value="${k}"${on ? " checked" : ""}><span>صحيح</span></label>`;
    const syncT = () => {
      if (E.t === "mc" || E.t === "fill") { const rows = $$("[data-l=o] > .qz-it", T); E.o = rows.map(readItem); const c = $("input[name=ea]:checked", T); E.a = c ? rows.indexOf(c.closest(".qz-it")) : -1; }
      else if (E.t === "tf") { E.a = $("input[name=ea]:checked", T)?.value === "1"; }
      else if (E.t === "num") { const v = $("#ena", T).value.trim(); E.a = /^\d+$/.test(v) ? parseInt(v, 10) : NaN; const q2 = $("#eeqn", T).value.trim(); if (q2) E.eq = q2; else delete E.eq; }
      else if (E.t === "order") { E.o = $$("[data-l=o] > .qz-it", T).map(readItem); if ($("#edir", T).checked) E.dir = "ltr"; else delete E.dir; }
      else if (E.t === "sort") { E.b = $$("[data-l=b] > .qz-it", T).map(readItem); E.o = $$("[data-l=o] > .qz-it", T).map((r) => { const v = readItem(r), o = typeof v === "object" ? v : { x: v }; o.b = +$("select", r).value; return o; }); }
      else if (E.t === "match") { E.p = $$("[data-l=p] > .qz-it", T).map((r) => $$(".qz-side", r).map(readItem)); }
    };
    const drawT = () => {
      let h = "";
      if (E.t === "mc" || E.t === "fill") h = `<h4>الخيارات <small class="mut">اختر الصحيح بالدائرة</small></h4><div data-l="o">${E.o.map((v, k) => itemRow(v, radio(k, E.a === k))).join("")}</div>${E.o.length < QMAX.o ? `<button class="btn sm g" data-add="o">+ خيار</button>` : ""}`;
      else if (E.t === "tf") h = `<h4>الإجابة الصحيحة</h4><div class="row"><label class="qz-ok big"><input type="radio" name="ea" value="1"${E.a === true ? " checked" : ""}><span>صح</span></label><label class="qz-ok big"><input type="radio" name="ea" value="0"${E.a === false ? " checked" : ""}><span>خطأ</span></label></div>`;
      else if (E.t === "num") h = `<label class="f"><span>الإجابة الصحيحة (عدد)</span><input type="text" id="ena" inputmode="numeric" dir="ltr" value="${Number.isInteger(E.a) ? E.a : ""}"></label><label class="f"><span>المعادلة الظاهرة (اختياري)</span><input type="text" id="eeqn" dir="ltr" value="${esc(qClean(E.eq || ""))}" placeholder="5 + 1 = ؟"></label>`;
      else if (E.t === "order") h = `<h4>العناصر بالترتيب الصحيح <small class="mut">تُخلط للطفل تلقائيًا</small></h4><div data-l="o">${E.o.map((v) => itemRow(v)).join("")}</div>${E.o.length < QMAX.order ? `<button class="btn sm g" data-add="o">+ عنصر</button>` : ""}<div class="sw"><span>ترتيب من اليسار إلى اليمين<br><small class="mut">للأعداد والمعادلات</small></span><input type="checkbox" id="edir"${E.dir === "ltr" ? " checked" : ""}></div>`;
      else if (E.t === "sort") h = `<h4>المجموعات</h4><div data-l="b">${E.b.map((v) => itemRow(v)).join("")}</div>${E.b.length < QMAX.b ? `<button class="btn sm g" data-add="b">+ مجموعة</button>` : ""}<h4>العناصر ومجموعة كل عنصر</h4><div data-l="o">${E.o.map((v) => itemRow(v, "", `<label class="qz-bin"><span>المجموعة:</span><select>${E.b.map((g, k) => `<option value="${k}"${v.b === k ? " selected" : ""}>${esc(qHas(g) ? (typeof g === "object" ? g.x || "مجموعة " + (k + 1) : g) : "مجموعة " + (k + 1))}</option>`).join("")}</select></label>`)).join("")}</div>${E.o.length < QMAX.sort ? `<button class="btn sm g" data-add="o">+ عنصر</button>` : ""}`;
      else if (E.t === "match") h = `<h4>الأزواج <small class="mut">يوصل الطفل الطرف الأول بالثاني</small></h4><div data-l="p">${E.p.map((r) => `<div class="qz-it qz-pair"><div class="qz-r1"><b class="mut">زوج</b><button type="button" class="chip qz-rm">حذف</button></div><div class="qz-side"><input type="text" class="qx" value="${esc(r[0] && typeof r[0] === "object" ? r[0].x ?? "" : r[0] ?? "")}" placeholder="الطرف الأول">${mediaField("img", r[0] && r[0].i || "")}</div><div class="qz-side"><input type="text" class="qx" value="${esc(r[1] && typeof r[1] === "object" ? r[1].x ?? "" : r[1] ?? "")}" placeholder="الطرف الثاني">${mediaField("img", r[1] && r[1].i || "")}</div></div>`).join("")}</div>${E.p.length < QMAX.p ? `<button class="btn sm g" data-add="p">+ زوج</button>` : ""}`;
      T.innerHTML = h; bindMedia(T);
      $$("[data-add]", T).forEach((b) => b.onclick = () => { syncT(); const l = b.dataset.add; if (E.t === "sort" && l === "o") E.o.push({ x: "", b: 0 }); else if (l === "p") E.p.push(["", ""]); else E[l].push(""); drawT(); });
      $$(".qz-rm", T).forEach((b) => b.onclick = () => {
        syncT(); const row = b.closest(".qz-it"), box = row.parentNode, l = box.dataset.l, i = $$(":scope > .qz-it", box).indexOf(row), arr = E[l];
        if (arr.length <= 2) return toast("يلزم عنصران على الأقل");
        arr.splice(i, 1);
        if ((E.t === "mc" || E.t === "fill") && l === "o") E.a = E.a === i ? -1 : E.a > i ? E.a - 1 : E.a;
        if (E.t === "sort" && l === "b") E.o.forEach((o) => { if (o.b === i) o.b = 0; else if (o.b > i) o.b--; });
        drawT();
      });
    };
    drawT(); bindMedia(s);
    $("#esv", s).onclick = () => {
      syncT();
      const set = (k, v) => { if (v === "" || v == null || (Array.isArray(v) && !v.length)) delete E[k]; else E[k] = v; };
      E.q = $("#eq1", s).value.trim(); set("img", mfVal($("label.f [data-mf]", s))); set("ex", $("#eex", s).value.trim()); set("sk", $("#esk", s).value.trim());
      set("say", $("#esay", s).value.trim()); set("snd", String(mfVal($(".qz-adv [data-mf]", s)) || "")); set("hint", $("#ehint", s).value.trim());
      if ($("#elis", s).checked) E.listen = 1; else delete E.listen;
      const pg = $("#epsg", s); if (pg) set("psg", pg.value);
      const mm = $("#ememo", s).value.split("|").map((x) => x.trim()).filter(Boolean); set("memo", mm);
      if (!E.memo) delete E.memoTx;
      const err = qCheck(E, D); if (err) { $("#eerr", s).textContent = err; return; }
      if (idx < 0) D.qs.push(E); else D.qs[idx] = E;
      qzDirty = true; closeSheet(); draw(); toast("تم. لا تنسَ حفظ الاختبار");
    };
    const d = $("#edl", s); if (d) d.onclick = async () => { if (!(await ask("حذف هذا السؤال؟", "نعم، احذف"))) return; D.qs.splice(idx, 1); qzDirty = true; draw(); toast("حُذف السؤال. احفظ الاختبار لتثبيت الحذف"); };
  };
  draw();
}

const VIEWS = { home, orders, products, learn, more };
window.__zp = { QH: { mediaField, itemRow, readItem, mfVal, bindMedia, qCheck, QT, QTD, QMAX, qClean, qHas }, sb, $, $$, esc, toast, sheet, closeSheet, ask, fail, imgU, go, productSheet, SUB, ago, loadTax, libTaxNow, LIBSTATUS, LIBTYPES, LIBSEC, LIBLV, get TAX() { return TAXC; } };
boot().catch((e) => { console.error(e); app.innerHTML = `<div class="empty">تعذّر فتح اللوحة 😕<br><button class="btn sm" onclick="location.reload()">إعادة المحاولة</button></div>`; });
})();
