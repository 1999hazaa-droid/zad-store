/* الأنشطة التعليمية - زاد: قائمة + عرض + تقدّم (يشارك بيانات «تعلّم والعب» لنفس الطفل) */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const IN_VIEW = /\/activities\/view\/?$/.test(location.pathname) || /\/activities\/view\//.test(location.pathname);
const ROOT = new URL(IN_VIEW ? "../../" : "../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const U = (u) => /^https?:/.test(u || "") ? u : ROOT + String(u || "");
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const CATS = { early: "الطفولة المبكرة", arabic: "اللغة العربية", math: "الرياضيات", science: "العلوم", english: "الإنجليزية", life: "المهارات الحياتية" };
const KINDS = { worksheet: "ورقة عمل", cutpaste: "قص ولصق", coloring: "تلوين", matching: "توصيل ومطابقة", sorting: "ترتيب وتصنيف", home: "نشاط منزلي", creative: "إبداعي وفني", discovery: "ملاحظة واكتشاف", interactive: "تفاعلي في الموقع" };
const DIFF = { easy: "سهل", medium: "متوسط", hard: "متقدم" };
const GR = ["الأول", "الثاني", "الثالث", "الرابع"];
const CACHE = "zad-acts-v1";
const LK = "zad-learn-v3";

/* ===== تقدّم الطفل (نفس مخزن البطاقات) ===== */
let DB, S;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; S.acts = S.acts || {};
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); return true; } catch { return false; } }
const rec = (slug) => (S.acts && S.acts[slug]) || null;
const done = (slug) => { const r = rec(slug); return r && r.d ? r.how === "parent" ? "p" : "a" : ""; };

/* ===== التحميل ===== */
let all = [];
async function load() {
  try {
    const r = await fetch(SB + "/rest/v1/activities?status=eq.published&order=sort_order.asc,created_at.asc&select=*", { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad");
    all = j; try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {}
    return true;
  } catch {
    try { all = JSON.parse(localStorage.getItem(CACHE)) || []; } catch { all = []; }
    return false;
  }
}
const ageLbl = (a) => { const g = (a.grades || []).slice().sort((x, y) => x - y), s = (a.ages || []).slice().sort((x, y) => x - y);
  const p = []; if (s.length) p.push(s.length > 1 ? `من ${AD(s[0])} إلى ${AD(s[s.length - 1])} سنوات` : `${AD(s[0])} سنة`);
  if (g.length) p.push("الصف " + (g.length > 1 ? `${GR[g[0] - 1]} – ${GR[g[g.length - 1] - 1]}` : GR[g[0] - 1])); return p.join(" · "); };
const dcls = (d) => ({ easy: "d1", medium: "d2", hard: "d3" }[d] || "");

/* ===== القائمة ===== */
const F = { cat: "", kind: "", age: "", gr: "", dif: "", sub: "", skl: "", q: "" };
const pill = (k, v, l) => `<button type="button" class="zpill${F[k] === v ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${F[k] === v}">${esc(l)}</button>`;
const uniq = (f) => [...new Set(all.map(f).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ar"));
function filtered() {
  const q = norm(F.q).trim();
  return all.filter((a) => (!F.cat || a.cat === F.cat) && (!F.kind || a.kind === F.kind) &&
    (!F.age || (a.ages || []).includes(+F.age)) && (!F.gr || (a.grades || []).includes(+F.gr)) &&
    (!F.dif || a.difficulty === F.dif) && (!F.sub || a.subject === F.sub) && (!F.skl || a.skill === F.skl) &&
    (!q || norm([a.title, a.summary, a.subject, a.skill, (a.tools || []).join(" ")].join(" ")).includes(q)));
}
function card(a) {
  const d = done(a.slug), g = ageLbl(a);
  return `<article class="ac"><div class="im"><img src="${esc(U(a.image_url))}" alt="" loading="lazy" width="160" height="100">${d ? `<span class="dn${d === "p" ? " p" : ""}">${d === "p" ? "أكّده ولي الأمر" : "✅ أُنجز في المنصة"}</span>` : ""}</div>
<div class="bd"><h3>${esc(a.title)}</h3><div class="mt"><span>${esc(KINDS[a.kind] || a.kind)}</span><span>${esc(a.subject)}</span><span class="${dcls(a.difficulty)}">${esc(DIFF[a.difficulty] || "")}</span>${a.minutes ? `<span>⏱ ${AD(a.minutes)} د</span>` : ""}</div>
<p>${esc(g)} · ${esc(a.skill)}</p><p>${esc(a.summary)}</p>
<div class="bt"><a class="abtn go" href="view/?a=${encodeURIComponent(a.slug)}">عرض النشاط</a>${a.pdf_url ? `<a class="abtn" href="${esc(U(a.pdf_url))}" download>تحميل PDF</a>` : ""}${a.interactive_url ? `<a class="abtn" href="${esc(U(a.interactive_url))}${/[?]/.test(a.interactive_url) ? "&" : "?"}act=${encodeURIComponent(a.slug)}">ابدأ</a>` : ""}</div></div></article>`;
}
function progress() {
  const el = $("#aprog"); if (!el) return;
  const ids = new Set(all.map((a) => a.slug)); let pl = 0, pa = 0; const sk = new Set();
  all.forEach((a) => { const d = done(a.slug); if (d === "a") { pl++; sk.add(a.skill); } else if (d === "p") { pa++; sk.add(a.skill); } });
  el.innerHTML = `<span class="pc">أُنجز في المنصة: ${AD(pl)}</span><span class="pc">أكّده ولي الأمر: ${AD(pa)}</span><span class="pc">مهارات تدرّب عليها: ${AD(sk.size)}</span>`;
}
function drawList() {
  const set = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };
  set("#fcat", "<b>التصنيف</b>" + pill("cat", "", "الكل") + Object.keys(CATS).filter((k) => all.some((a) => a.cat === k)).map((k) => pill("cat", k, CATS[k])).join(""));
  set("#fkind", "<b>النوع</b>" + pill("kind", "", "الكل") + Object.keys(KINDS).filter((k) => all.some((a) => a.kind === k)).map((k) => pill("kind", k, KINDS[k])).join(""));
  set("#fage", "<b>العمر</b>" + pill("age", "", "الكل") + [1, 2, 3, 4, 5, 6].filter((n) => all.some((a) => (a.ages || []).includes(n))).map((n) => pill("age", String(n), AD(n) + " سنة")).join(""));
  set("#fgr", "<b>الصف</b>" + pill("gr", "", "الكل") + [1, 2, 3, 4, 5, 6].filter((n) => all.some((a) => (a.grades || []).includes(n))).map((n) => pill("gr", String(n), GR[n - 1])).join(""));
  set("#fdif", "<b>الصعوبة</b>" + pill("dif", "", "الكل") + Object.keys(DIFF).filter((k) => all.some((a) => a.difficulty === k)).map((k) => pill("dif", k, DIFF[k])).join(""));
  const so = (id, vals, k) => { const e = $(id); if (!e) return; e.innerHTML = '<option value="">الكل</option>' + vals.map((v) => `<option value="${esc(v)}"${F[k] === v ? " selected" : ""}>${esc(v)}</option>`).join(""); };
  so("#fsub", uniq((a) => a.subject), "sub"); so("#fskl", uniq((a) => a.skill), "skl");
  const r = filtered(), any = Object.values(F).some(Boolean);
  const c = $("#aclr"); if (c) c.hidden = !any;
  const st = $("#astat"); if (st) st.innerHTML = `<span>${AD(all.length)} نشاط</span><span>${AD(all.filter((a) => a.pdf_url).length)} ورقة للطباعة</span><span>${AD(all.filter((a) => a.kind === "home").length)} نشاط منزلي</span>`;
  const res = $("#ares");
  res.innerHTML = !all.length ? `<div class="sempty"><h3>تعذّر تحميل الأنشطة</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p><button class="abtn go" type="button" id="aretry">إعادة المحاولة</button></div>`
    : r.length ? `<p class="sfoot" style="margin:6px 0">${AD(r.length)} نتيجة</p><div class="agrid">${r.map(card).join("")}</div>`
    : `<div class="sempty"><h3>لا توجد أنشطة مطابقة</h3><p>جرّب إزالة بعض الفلاتر.</p></div>`;
  progress();
}
function initList() {
  const p = new URLSearchParams(location.search);
  ["cat", "kind", "age", "gr", "dif"].forEach((k) => { if (p.get(k)) F[k] = p.get(k); });
  D.addEventListener("click", (e) => {
    const b = e.target.closest(".zpill"); if (b) { F[b.dataset.k] = b.dataset.v; drawList(); return; }
    if (e.target.id === "aclr") { Object.keys(F).forEach((k) => (F[k] = "")); const q = $("#aq"); if (q) q.value = ""; drawList(); }
    if (e.target.id === "aretry") boot();
  });
  $("#fsub").addEventListener("change", (e) => { F.sub = e.target.value; drawList(); });
  $("#fskl").addEventListener("change", (e) => { F.skl = e.target.value; drawList(); });
  const q = $("#aq"), x = $("#aqx");
  q.addEventListener("input", () => { F.q = q.value; x.hidden = !q.value; drawList(); });
  x.addEventListener("click", () => { q.value = ""; F.q = ""; x.hidden = true; drawList(); q.focus(); });
}

/* ===== العرض ===== */
const sec = (t, h) => `<section class="sec"><h2>${t}</h2>${h}</section>`;
const ul = (a, o) => `<${o ? "ol" : "ul"}>${(a || []).map((s) => `<li>${esc(s)}</li>`).join("")}</${o ? "ol" : "ul"}>`;
const pages = (a) => Array.from({ length: a.pages || 0 }, (_, i) => ROOT + "images/lib/" + a.pdf_url.replace(/^files\/lib\/|\.pdf$/g, "") + "/p" + String(i + 1).padStart(2, "0") + ".webp");
function drawView(a) {
  const d = done(a.slug), r = rec(a.slug), pg = a.pdf_url && a.pages && /^files\/lib\//.test(a.pdf_url) ? pages(a) : [];
  D.title = a.title + " | منصة زاد التعليمية"; const bc = $("#abc"); if (bc) bc.textContent = a.title;
  let st = "";
  if (d === "a") st = `<div class="st ok">✅ أنجز الطفل هذا النشاط داخل المنصة بتاريخ ${esc(r.d)}${r.s ? ` (النتيجة ${AD(r.s)}٪)` : ""}.</div>`;
  else if (d === "p") st = `<div class="st ok">✔ أكّد ولي الأمر إكمال النشاط بتاريخ ${esc(r.d)}. <button type="button" class="abtn" id="aundo" style="min-height:36px;margin-inline-start:6px">تراجع</button></div>`;
  else st = a.interactive_url ? `<div class="st">يُسجَّل الإكمال تلقائياً عند إنهاء الجولة بنجاح داخل المنصة.</div>` : `<div class="st">هذا النشاط يُنفَّذ خارج المنصة، فلا يُسجَّل مكتملاً تلقائياً. بعد التنفيذ يمكن لولي الأمر تأكيده إن رغب.</div>`;
  const acts = [];
  if (a.interactive_url) acts.push(`<a class="abtn go" href="${esc(U(a.interactive_url))}${/[?]/.test(a.interactive_url) ? "&" : "?"}act=${encodeURIComponent(a.slug)}">ابدأ النشاط</a>`);
  if (a.pdf_url) acts.push(`${pg.length ? '<button type="button" class="abtn go" id="apvb">معاينة ورقة العمل</button>' : `<a class="abtn go" href="${esc(U(a.pdf_url))}" target="_blank" rel="noopener">فتح ورقة العمل</a>`}<a class="abtn" href="${esc(U(a.pdf_url))}" download>تحميل PDF</a>${a.bw_url ? `<a class="abtn" href="${esc(U(a.bw_url))}" download>PDF أبيض وأسود</a>` : ""}${pg.length ? '<button type="button" class="abtn" id="aprb">طباعة</button>' : ""}`);
  if (a.kind !== "interactive" && !d) acts.push(`<button type="button" class="abtn" id="aconf">أكّدتُ إكمال النشاط (ولي الأمر)</button>`);
  acts.push(`<a class="abtn" href="../">العودة إلى الأنشطة</a>`);
  $("#aview").innerHTML = `<div class="hd"><img src="${esc(U(a.image_url))}" alt="" width="150" height="150"><div><h1>${esc(a.title)}</h1><div class="mt"><span>${esc(CATS[a.cat] || "")}</span><span>${esc(KINDS[a.kind] || "")}</span><span>${esc(a.subject)}</span><span class="${dcls(a.difficulty)}">${esc(DIFF[a.difficulty] || "")}</span>${a.minutes ? `<span>⏱ ${AD(a.minutes)} دقيقة</span>` : ""}<span>${esc(ageLbl(a))}</span></div></div></div>
<div class="acts">${acts.join("")}</div>
${sec("الهدف التعليمي", `<p>${esc(a.goal)}</p><p style="color:var(--z-ink2)">المهارة: ${esc(a.skill)}</p>`)}
${a.tools && a.tools.length ? sec("الأدوات المطلوبة", ul(a.tools)) : ""}
${sec("خطوات النشاط", ul(a.steps, 1))}
${a.parent_role ? sec("دور ولي الأمر", `<p>${esc(a.parent_role)}</p>`) : ""}
${sec("طريقة إكمال النشاط", `<p>${esc(a.completion)}</p>`)}
${pg.length ? sec("ورقة العمل (" + AD(pg.length) + " صفحات)", `<div class="pvs">${pg.map((u, i) => `<button type="button" data-p="${i}" aria-label="صفحة ${AD(i + 1)}"><img src="${esc(u)}" alt="صفحة ${AD(i + 1)}" loading="lazy"></button>`).join("")}</div>`) : ""}
${sec("حالة النشاط", st)}`;
  const on = (id, f) => { const e = $(id); if (e) e.addEventListener("click", f); };
  on("#aconf", () => { S.acts[a.slug] = { d: new Date().toISOString().slice(0, 10), how: "parent", t: Date.now() }; save(); drawView(a); });
  on("#aundo", () => { delete S.acts[a.slug]; save(); drawView(a); });
  on("#apvb", () => openPv(pg, 0)); on("#aprb", () => printPages(pg));
  D.querySelectorAll(".pvs button").forEach((b) => b.addEventListener("click", () => openPv(pg, +b.dataset.p)));
}
function openPv(pg, i) {
  const v = $("#apv"); let k = i;
  const draw = () => { v.innerHTML = `<div class="nv"><button type="button" id="pvn">السابق</button><span>${AD(k + 1)} / ${AD(pg.length)}</span><button type="button" id="pvp">التالي</button><button type="button" id="pvx">إغلاق</button></div><div class="pg"><img src="${esc(pg[k])}" alt="صفحة ${AD(k + 1)}"></div>`;
    $("#pvn").onclick = () => { if (k > 0) { k--; draw(); } }; $("#pvp").onclick = () => { if (k < pg.length - 1) { k++; draw(); } }; $("#pvx").onclick = () => { v.hidden = true; }; };
  v.hidden = false; draw();
}
function printPages(pg) {
  let p = $("#aprint"); if (!p) { p = D.createElement("div"); p.id = "aprint"; D.body.appendChild(p); }
  p.innerHTML = pg.map((u) => `<img src="${esc(u)}" alt="">`).join("");
  const imgs = [...p.querySelectorAll("img")];
  Promise.all(imgs.map((i) => i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))).then(() => W.print());
}
function initView() {
  const slug = new URLSearchParams(location.search).get("a");
  const a = all.find((x) => x.slug === slug);
  if (!a) { $("#aview").innerHTML = `<div class="sempty"><h3>لم نجد هذا النشاط</h3><p>قد يكون غير منشور أو الرابط غير صحيح.</p><a class="abtn go" href="../">العودة إلى الأنشطة</a></div>`; return; }
  drawView(a);
  D.addEventListener("keydown", (e) => { if (e.key === "Escape") { const v = $("#apv"); if (v) v.hidden = true; } });
}
async function boot() {
  loadDB(); await load();
  if (IN_VIEW) initView(); else { if (!boot.i) { initList(); boot.i = 1; } drawList(); }
}
boot();
})();
