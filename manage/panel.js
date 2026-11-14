/* لوحة تحكم زاد التعليمية — بسيطة: كل تعديل يُحفظ ويظهر في المتجر مباشرة */
(function () {
"use strict";
const URL_ = "https://zcnwzpevehudhnsuljdy.supabase.co";
const KEY = "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const SITE = new URL("../", location.href).href;
const sb = supabase.createClient(URL_, KEY, { auth: { persistSession: true, autoRefreshToken: true, storageKey: "zad-admin-auth" } });
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const app = $("#app");
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
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
  if (!row) { await sb.auth.signOut(); return loginView("هذا الحساب ليس حساب مدير المتجر"); }
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
  app.innerHTML = `<header><h1 id="ttl">لوحة زاد</h1><div class="hb"><a class="ib" href="${SITE}" target="_blank">🌐 المتجر</a></div></header><main id="main"></main>
  <nav><div>${TABS.map(([k, e, l]) => `<button data-t="${k}"><b>${e}</b>${l}<i hidden></i></button>`).join("")}</div></nav>`;
  $$("nav button").forEach((b) => b.onclick = () => go(b.dataset.t));
  go(location.hash.slice(1) || "home");
}
function badge() { const i = $('nav button[data-t="orders"] i'); if (i) { i.textContent = pendingCount; i.hidden = !pendingCount; } }
function go(t) {
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
   <button style="--c:#ffdbe9;--s:#f0a9c6" data-g="settings"><b>🏪</b>إعدادات المتجر</button></div>
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
  ${o.phone ? `<a class="btn ok" style="display:block;text-align:center;text-decoration:none;margin-bottom:10px" href="${wa(o.phone, `السلام عليكم ${o.customer_name || ""}، بخصوص طلبك رقم ${o.order_no || ""} من متجر زاد`)}" target="_blank">💬 مراسلة الزبون على واتساب</a>` : ""}
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
    sb.from("products").select("id,name,price,old_price,category_id,image_url,thumb_url,is_visible,is_available,is_best_seller,is_new_arrival,stock,description,file_url,slug,sort_order").order("sort_order", { ascending: true }),
    sb.from("categories").select("id,name,sort_order").order("sort_order", { ascending: true })
  ]);
  if (p.error) throw p.error; CATS = c.data || []; const all = p.data || [];
  m.innerHTML = `<input type="search" id="q" placeholder="🔍 ابحث عن منتج" value="${esc(pQ)}"><div class="chips" id="ch"></div><div id="ls"></div><button class="btn fab" id="add">➕ منتج</button>`;
  const draw = () => {
    $("#ch").innerHTML = [["all", `الكل (${all.length})`], ["off", "🙈 مخفي"], ["out", "🚫 نفد"], ...CATS.map((x) => [x.id, x.name])].map(([k, l]) => `<button class="chip ${pFilter === k ? "on" : ""}" data-f="${k}">${esc(l)}</button>`).join("");
    const q = pQ.trim();
    const list = all.filter((x) => (pFilter === "all" || (pFilter === "off" ? !x.is_visible : pFilter === "out" ? (!x.is_available || x.stock === 0) : x.category_id === pFilter)) && (!q || (x.name || "").includes(q)));
    $("#ls").innerHTML = list.slice(0, 120).map((x) => `<div class="item" data-p="${x.id}">${x.thumb_url || x.image_url ? `<img loading="lazy" src="${esc(x.thumb_url || x.image_url)}" alt="">` : `<div class="ph">🖼️</div>`}<div class="tx"><b>${esc(x.name)}</b><small>${money(x.price)}${x.old_price ? ` <s>${money(x.old_price)}</s>` : ""}</small></div>${!x.is_visible ? `<span class="tag off">مخفي</span>` : !x.is_available || x.stock === 0 ? `<span class="tag off">نفد</span>` : ""}</div>`).join("") || `<div class="empty">لا توجد منتجات</div>` + (list.length > 120 ? `<p class="c mut">يظهر أول 120، استخدم البحث</p>` : "");
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
function productSheet(p, reload) {
  const isNew = !p;
  const d = p || { id: crypto.randomUUID(), name: "", price: "", old_price: null, category_id: CATS[0]?.id || null, image_url: "", is_visible: true, is_available: true, is_best_seller: false, is_new_arrival: false, stock: null, description: "", file_url: "" };
  const s = sheet(`<h2>${isNew ? "منتج جديد" : "تعديل المنتج"}</h2>
  ${d.image_url ? `<img class="thumb" id="pv" src="${esc(d.image_url)}">` : `<div class="thumb c" id="pv" style="padding:40px 0;font-size:40px">🖼️</div>`}
  <input type="file" id="fi" accept="image/*" hidden><button class="btn g" id="pi">📷 ${d.image_url ? "تغيير الصورة" : "اختر صورة"}</button>
  <label class="f"><span>اسم المنتج</span><input type="text" id="nm" value="${esc(d.name)}"></label>
  <div class="row"><label class="f"><span>السعر (ر.ع)</span><input type="number" id="pr" inputmode="decimal" step="0.001" value="${d.price ?? ""}"></label>
  <label class="f"><span>السعر قبل الخصم</span><input type="number" id="op" inputmode="decimal" step="0.001" value="${d.old_price ?? ""}"></label></div>
  <label class="f"><span>التصنيف</span><select id="ct">${CATS.map((c) => `<option value="${c.id}" ${c.id === d.category_id ? "selected" : ""}>${esc(c.name)}</option>`).join("")}</select></label>
  <label class="f"><span>الوصف</span><textarea id="ds">${esc(d.description || "")}</textarea></label>
  <label class="f"><span>الكمية المتوفرة</span><input type="number" id="sk" inputmode="numeric" value="${d.stock ?? ""}" placeholder="اتركها فارغة = غير محدودة"><small>الملفات الرقمية عادة بدون كمية</small></label>
  <div class="card" style="padding:4px 14px"><label class="sw"><span>ظاهر في المتجر</span><input type="checkbox" id="vi" ${d.is_visible ? "checked" : ""}></label>
  <label class="sw"><span>متاح للشراء</span><input type="checkbox" id="av" ${d.is_available ? "checked" : ""}></label>
  <label class="sw"><span>⭐ الأكثر طلباً</span><input type="checkbox" id="bs" ${d.is_best_seller ? "checked" : ""}></label>
  <label class="sw"><span>🆕 جديد</span><input type="checkbox" id="na" ${d.is_new_arrival ? "checked" : ""}></label></div>
  <div class="card"><b>📄 الملف بعد الشراء (PDF)</b><p class="mut" id="fs" style="margin:4px 0 8px">${d.file_url ? "✅ مرفوع" : "لم يُرفع ملف"}</p><input type="file" id="ff" accept="application/pdf" hidden><button class="btn g" id="pf">رفع ملف PDF</button></div>
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
    const f = e.target.files[0]; if (!f) return; toast("جاري رفع الملف…");
    const { error } = await sb.storage.from("paid-files").upload(`${d.id}.pdf`, f, { upsert: true, contentType: "application/pdf", cacheControl: "0" });
    if (error) return fail(error); d.file_url = `private:${d.id}.pdf`; $("#fs", s).textContent = "✅ رُفع، اضغط حفظ"; };
  $("#sv", s).onclick = async () => {
    const name = $("#nm", s).value.trim(), price = Number($("#pr", s).value);
    if (!name) return toast("اكتب اسم المنتج"); if (!(price >= 0) || $("#pr", s).value === "") return toast("اكتب السعر");
    const op = $("#op", s).value === "" ? null : Number($("#op", s).value), sk = $("#sk", s).value === "" ? null : Number($("#sk", s).value);
    const row = { id: d.id, name, price, old_price: op && op > price ? op : null, category_id: $("#ct", s).value || null, image_url: d.image_url || null, thumb_url: d.thumb_url === null ? null : (d.thumb_url || null), description: $("#ds", s).value.trim(), stock: sk,
      is_visible: $("#vi", s).checked, is_available: $("#av", s).checked, is_best_seller: $("#bs", s).checked, is_new_arrival: $("#na", s).checked, file_url: d.file_url || null };
    if (isNew) { row.slug = "p-" + Math.random().toString(36).slice(2, 8); row.sort_order = -Math.floor(Date.now() / 1000); }
    const { error } = isNew ? await sb.from("products").insert(row) : await sb.from("products").update(row).eq("id", d.id);
    if (error) return fail(error); closeSheet(); toast("تم الحفظ ✓ يظهر في المتجر الآن"); reload ? reload() : go(tab);
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
  const items = [["cats", "🗂️", "التصنيفات", "#d6ecff", "#9cc9ef"], ["coupons", "🎟️", "أكواد الخصم", "#d8f5e6", "#9fdcbc"], ["customers", "👥", "الزبائن", "#ffe3d1", "#f2b895"], ["reviews", "⭐", "التقييمات", "#fff3c4", "#ecd57d"], ["settings", "🏪", "إعدادات المتجر", "#ffdbe9", "#f0a9c6"], ["account", "🔐", "حسابي", "#e6dcff", "#c1aef0"]];
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

SUB.settings = { title: "إعدادات المتجر", fn: async (m) => {
  const { data, error } = await sb.from("store_settings").select("config").eq("id", 1).maybeSingle(); if (error) throw error; const cfg = data?.config || {};
  const T = cfg.texts || {}, bank = (cfg.order?.payments || []).find((x) => x.type === "bank") || {}, bb = bank.bank || {};
  m.innerHTML = `${back()}
  <div class="card"><h3>🏪 المتجر</h3><label class="f"><span>اسم المتجر</span><input type="text" id="nm" value="${esc(cfg.name || "")}"></label>
  <label class="f"><span>رقم واتساب الطلبات</span><input type="tel" id="wa" dir="ltr" value="${esc(cfg.order?.whatsapp || "")}" placeholder="96877336242"><small>بالأرقام مع رمز الدولة بدون +</small></label>
  <label class="f"><span>اللون الأساسي</span><input type="color" id="pc" value="${esc(cfg.theme?.primary || "#5B34D6")}" style="height:46px;padding:4px"></label></div>
  <div class="card"><h3>📣 شريط الإعلان (أعلى المتجر)</h3><label class="sw"><span>إظهار الشريط</span><input type="checkbox" id="as" ${T.announce_show ? "checked" : ""}></label><label class="f"><span>نص الإعلان</span><input type="text" id="at" value="${esc(T.announce_text || "")}"></label></div>
  <div class="card"><h3>🖼️ الصفحة الرئيسية</h3><label class="f"><span>العنوان الكبير</span><textarea id="ht" style="min-height:70px">${esc(T.hero_title || "")}</textarea></label>
  <label class="f"><span>النص تحت العنوان</span><textarea id="hx">${esc(T.hero_text || "")}</textarea></label><label class="f"><span>نص الزر</span><input type="text" id="hb" value="${esc(T.hero_button || "")}"></label>
  <label class="f"><span>نبذة عن المتجر</span><textarea id="ab">${esc(T.about || "")}</textarea></label></div>
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
    const { error } = await sb.from("store_settings").update({ config: c }).eq("id", 1); if (error) return fail(error); toast("تم الحفظ ✓ يظهر في المتجر الآن");
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

const VIEWS = { home, orders, products, learn, more };
boot().catch((e) => { console.error(e); app.innerHTML = `<div class="empty">تعذّر فتح اللوحة 😕<br><button class="btn sm" onclick="location.reload()">إعادة المحاولة</button></div>`; });
})();
