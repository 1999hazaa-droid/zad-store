/* عالم الإبداع والفنون - زاد: قائمة + صفحة نشاط + معرض الإبداعات */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const P = location.pathname, IN_VIEW = /\/arts\/view\/?/.test(P), IN_GAL = /\/arts\/gallery\/?/.test(P);
const ROOT = new URL(IN_VIEW || IN_GAL ? "../../" : "../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const SU = (u) => (/^https?:/.test(u || "") ? u : ROOT + String(u || ""));
const icon = (c) => `${ROOT}images/zad/${c}.webp`;
const CATS = { color: ["عالم التلوين", "1f3a8", "#fde3ee"], draw: ["عالم الرسم", "i_pencil", "#e3f0ff"], craft: ["الأشغال اليدوية", "x_scissors", "#e3f6e3"], cutpaste: ["عالم القص واللصق", "x_paper", "#fff3c9"], design: ["عالم التصميم والإبداع", "i_palette", "#efe3ff"] };
const ADULT = { none: ["متابعة بسيطة من كبير", "ok"], near: ["بحضور شخص كبير بجانب الطفل", "mid"], required: ["بإشراف مباشر من شخص كبير", "req"] };
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const lvText = (l) => { l = l || []; const ag = l.filter((x) => x[0] === "a"), gr = l.filter((x) => x[0] === "g"), p = []; if (ag.length) p.push(ag.length === 1 ? LV[ag[0]] : "من " + LV[ag[0]].replace(" سنوات", "").replace(" سنة", "") + " إلى " + LV[ag[ag.length - 1]]); if (gr.length) p.push(gr.length === 1 ? LV[gr[0]] : "الصفوف " + gr.map((x) => AD(x[1])).join("–")); return p.join(" + "); };
const CACHE = "zad-arts-v1";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
async function load(slug) {
  try {
    const j = await rest("art_activities?status=eq.published&order=sort_order.asc&select=" + (slug ? "*&slug=eq." + encodeURIComponent(slug) : "slug,category,sub,title,icon,levels,skill,summary,adult,materials,pdf_url,template,sort_order"));
    if (!slug) { try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {} }
    return j;
  } catch { if (slug) return null; try { return JSON.parse(localStorage.getItem(CACHE)) || []; } catch { return []; } }
}
const abadge = (a) => { const x = ADULT[a] || ADULT.near; return `<span class="ab ${x[1]}">${esc(x[0])}</span>`; };
const startHref = (a) => (a.template ? `${ROOT}arts/studio/?t=${encodeURIComponent(a.template)}&a=${encodeURIComponent(a.slug)}` : a.slug === "dr-free" ? `${ROOT}arts/studio/?a=dr-free` : "");
/* ===== القائمة ===== */
let all = [];
const F = { cat: "", stage: "", lv: "", adult: "", q: "" };
const pill = (k, v, l) => `<button type="button" class="zpill${F[k] === v ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${F[k] === v}">${esc(l)}</button>`;
function base(skip) {
  const q = norm(F.q).trim();
  return all.filter((a) => (skip === "cat" || !F.cat || a.category === F.cat) && (skip === "stage" || !F.stage || (a.levels || []).some((x) => x[0] === (F.stage === "age" ? "a" : "g"))) && (skip === "lv" || !F.lv || (a.levels || []).includes(F.lv)) && (skip === "adult" || !F.adult || a.adult === F.adult) &&
    (!q || norm([a.title, a.summary, a.skill, a.sub, (CATS[a.category] || [])[0]].join(" ")).includes(q)));
}
function card(a) {
  const c = CATS[a.category] || ["", "1f3a8", "#f3eeff"], sh = startHref(a);
  const mats = (a.materials || []).slice(0, 3).map((m) => m[0]).join("، ");
  return `<article class="tc"><a class="im" style="--bg:${c[2]}" href="view/?s=${encodeURIComponent(a.slug)}" aria-label="${esc(a.title)}"><img src="${esc(icon(a.icon))}" alt="" loading="lazy" width="96" height="96"></a><div class="bd"><h3><a href="view/?s=${encodeURIComponent(a.slug)}" style="color:inherit;text-decoration:none">${esc(a.title)}</a></h3><span class="mt"><span>${esc(lvText(a.levels))}</span></span><p>${esc(a.summary)}</p><p style="-webkit-line-clamp:1"><b>المهارة:</b> ${esc(a.skill)}</p><p style="-webkit-line-clamp:2"><b>الأدوات:</b> ${esc(mats)}</p>${abadge(a.adult)}<div class="btns"><a class="abtn go" href="view/?s=${encodeURIComponent(a.slug)}">ابدأ النشاط</a><a class="abtn" href="${esc(SU(a.pdf_url))}" download>تحميل / طباعة</a></div></div></article>`;
}
function drawList() {
  const set = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };
  const cnt = {}; base("cat").forEach((a) => (cnt[a.category] = (cnt[a.category] || 0) + 1));
  set("#mkinds", Object.keys(CATS).filter((k) => cnt[k] || F.cat === k).map((k) => `<button type="button" class="mk${F.cat === k ? " on" : ""}" data-k="cat" data-v="${F.cat === k ? "" : k}" aria-pressed="${F.cat === k}"><img src="${esc(icon(CATS[k][1]))}" alt="" width="40" height="40"><span>${esc(CATS[k][0])}</span><small>${AD(cnt[k] || 0)}</small></button>`).join(""));
  set("#fstage", "<b>المرحلة</b>" + pill("stage", "", "الكل") + pill("stage", "age", "الأعمار: ١–٦ سنوات") + pill("stage", "grade", "الصفوف: ١–٤"));
  const fl = $("#flv");
  if (fl) { fl.hidden = !F.stage; if (F.stage) fl.innerHTML = "<b>" + (F.stage === "age" ? "العمر" : "الصف") + "</b>" + pill("lv", "", "الكل") + (F.stage === "age" ? AGES : GRADES).map((k) => pill("lv", k, LV[k])).join(""); }
  set("#fadult", "<b>إشراف الكبار</b>" + pill("adult", "", "الكل") + Object.keys(ADULT).map((k) => pill("adult", k, ADULT[k][0])).join(""));
  const r = base(), any = Object.values(F).some(Boolean);
  const c = $("#sclr"); if (c) c.hidden = !any;
  const st = $("#sstat"); if (st) st.innerHTML = `<span>${AD(all.length)} نشاطًا</span>` + Object.keys(CATS).map((k) => `<span>${esc(CATS[k][0])}: ${AD(all.filter((a) => a.category === k).length)}</span>`).join("");
  $("#sres").innerHTML = !all.length ? `<div class="sempty"><h3>تعذّر تحميل الأنشطة</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p><button class="abtn go" type="button" id="sretry">إعادة المحاولة</button></div>`
    : r.length ? `<p class="sfoot" style="margin:6px 0">${AD(r.length)} نتيجة</p><div class="mgrid">${r.map(card).join("")}</div>` : `<div class="sempty"><h3>لا توجد نتائج مطابقة</h3><p>جرّب إزالة بعض الفلاتر.</p></div>`;
}
function initList() {
  const p = new URLSearchParams(location.search);
  if (p.get("cat") && CATS[p.get("cat")]) F.cat = p.get("cat");
  if (p.get("q")) F.q = p.get("q");
  if (p.get("lv") && LV[p.get("lv")]) { F.lv = p.get("lv"); F.stage = F.lv[0] === "a" ? "age" : "grade"; }
  if (F.q) { const q = $("#sq"); if (q) { q.value = F.q; $("#sqx").hidden = false; } }
  D.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (b && !b.disabled) { const k = b.dataset.k; F[k] = b.dataset.v; if (k === "stage") F.lv = ""; drawList(); return; }
    if (e.target.id === "sclr") { Object.keys(F).forEach((k) => (F[k] = "")); const q = $("#sq"); if (q) q.value = ""; $("#sqx").hidden = true; drawList(); }
    if (e.target.id === "sretry") boot();
  });
  const q = $("#sq"), x = $("#sqx");
  q.addEventListener("input", () => { F.q = q.value; x.hidden = !q.value; drawList(); });
  x.addEventListener("click", () => { q.value = ""; F.q = ""; x.hidden = true; drawList(); q.focus(); });
}
/* ===== صفحة النشاط ===== */
async function libLinks(t) {
  const out = [];
  for (const l of t.links || []) {
    try {
      if (l.type === "cards") { const j = await rest(`cards?status=eq.published&cat=eq.${encodeURIComponent(l.cat)}&select=slug&limit=1`); if (j.length) out.push(["بطاقات تعليمية", l.label || "بطاقات مرتبطة", `${ROOT}cards/?cat=${encodeURIComponent(l.cat)}`]); }
      else if (l.type === "wiki") { const j = await rest(`wiki_topics?status=eq.published&slug=eq.${encodeURIComponent(l.slug)}&select=slug,title&limit=1`); if (j.length) out.push(["من الموسوعة التعليمية", "اقرأ: " + j[0].title, `${ROOT}wiki/view/?s=${encodeURIComponent(l.slug)}&lv=a6`]); }
    } catch {}
  }
  return out;
}
async function tplSvg(id) {
  if (!id) return "";
  try { const r = await fetch(ROOT + "arts/templates.json"); const j = await r.json(); const t = (j.items || []).find((x) => x.id === id); return t ? `<svg viewBox="0 0 600 450" role="img" aria-label="${esc(t.title)}" style="width:100%;max-width:420px;height:auto;display:block;margin:auto;background:#fff;border:2px solid var(--z-line);border-radius:14px">${t.svg}</svg>` : ""; } catch { return ""; }
}
async function drawView(t) {
  D.title = t.title + " | عالم الإبداع والفنون | منصة زاد التعليمية"; const bc = $("#abc"); if (bc) bc.textContent = t.title;
  const c = CATS[t.category] || ["", "1f3a8", "#f3eeff"], ad = ADULT[t.adult] || ADULT.near, sh = startHref(t);
  const pic = await tplSvg(t.template);
  $("#aview").innerHTML = `<div class="hero" style="--bg:${c[2]}"><img src="${esc(icon(t.icon))}" alt=""><div><div class="mt"><span>${esc(c[0])}</span><span>${esc(t.sub || "")}</span><span>${esc(lvText(t.levels))}</span></div><h1>${esc(t.title)}</h1><p>${esc(t.summary)}</p></div></div>
<section class="safe" role="note"><h2>السلامة أولًا</h2><p class="adl"><b>${esc(ad[0])}</b>${t.adult !== "none" ? " — لا ينفّذ الطفل هذا النشاط بمفرده." : ""}</p><ul><li>نستعمل أقلامًا وألوانًا وصمغًا آمنة للأطفال فقط.</li><li>لا نستعمل المقص إلا مقص أطفال بحواف دائرية وبوجود شخص كبير بجانبنا${t.levels && t.levels.includes("a2") ? "، والصغار جدًا يمزّقون الورق بأيديهم أو يقصّه الكبير" : ""}.</li><li>لا نضع الأقلام أو الورق أو الصمغ في الفم، ونغسل أيدينا بعد النشاط.</li></ul></section>
<section class="art"><h2>الهدف الإبداعي</h2><p class="tx">${esc(t.goal)}</p><p class="tx"><b>المهارة المستهدفة:</b> ${esc(t.skill)}</p></section>
<section class="art"><h2>الأدوات المطلوبة</h2><div class="mats">${(t.materials || []).map((m) => `<div><img src="${esc(icon(m[1]))}" alt=""><span>${esc(m[0])}</span></div>`).join("")}</div></section>
<section class="art"><h2>خطوات التنفيذ</h2><ol class="stp">${(t.steps || []).map((s, i) => `<li><span class="n">${AD(i + 1)}</span>${s[1] ? `<img src="${esc(icon(s[1]))}" alt="">` : ""}<p>${esc(s[0])}</p></li>`).join("")}</ol></section>
${pic ? `<section class="art"><h2>صورة توضيحية</h2>${pic}<p class="hint">هذا القالب للتلوين أو الرسم عليه، وليس مطلوبًا أن تتطابق ألوانك مع أحد.</p></section>` : ""}
<section class="art"><h2>النتيجة المتوقعة</h2><p class="tx">${esc(t.outcome)}</p><p class="tx"><b>تذكّر:</b> ${esc(t.tips)}</p></section>
<section class="art"><h2>ابدأ الآن</h2><div class="btns" style="max-width:560px">${sh ? `<a class="abtn go" id="start" href="${esc(sh)}">ابدأ في الاستوديو الرقمي</a>` : ""}<a class="abtn${sh ? "" : " go"}" id="pdf" href="${esc(SU(t.pdf_url))}" download>تحميل الورقة (PDF)</a><a class="abtn" href="${esc(SU(t.pdf_url))}" target="_blank" rel="noopener">فتح للطباعة</a></div></section>
<section class="art" id="lib"></section>
<p><a class="abtn" id="back" href="${ROOT}arts/">العودة إلى قسم الأنشطة</a></p>`;
  const L = await libLinks(t), lib = $("#lib");
  if (lib) { if (L.length) { const g = {}; L.forEach((x) => (g[x[0]] = g[x[0]] || []).push(x)); lib.innerHTML = "<h2>اربط النشاط بالتعلّم</h2>" + `<p class="tx">مهارة هذا النشاط: ${esc(t.learn || t.skill)}</p><div class="lib">` + L.map((x) => `<a href="${esc(x[2])}"><b>${esc(x[0])}:</b> ${esc(x[1])}</a>`).join("") + "</div>"; } else lib.remove(); }
}
/* ===== المعرض ===== */
async function drawGallery() {
  const box = $("#aview");
  let rows = [];
  try { rows = await rest("art_gallery?status=eq.approved&order=created_at.desc&select=id,image,activity_slug&limit=60"); } catch { box.innerHTML = `<div class="sempty"><h3>تعذّر تحميل المعرض</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p></div>`; return; }
  box.innerHTML = `<div class="hero" style="--bg:#efe3ff"><img src="${icon("i_palette")}" alt=""><div><h1>معرض إبداعات زاد</h1><p>أعمال فنية أرسلها أولياء الأمور بعد موافقتهم، وراجعها فريق زاد قبل العرض.</p></div></div>
<section class="safe" role="note"><h2>كيف يعمل المعرض؟</h2><ul><li>المشاركة اختيارية تمامًا، ويحتفظ الطفل بعمله خاصًّا على جهازه إن لم يرد المشاركة.</li><li>لا نعرض أسماء الأطفال ولا أي معلومات شخصية.</li><li>لا يُنشر أي عمل تلقائيًا: يلزم موافقة ولي الأمر ثم مراجعة قبل النشر.</li><li>ترسل العمل من <a href="${ROOT}arts/studio/">الاستوديو</a> بعد الانتهاء من الرسم.</li></ul></section>
${rows.length ? `<div class="gal">${rows.map((r) => `<figure style="margin:0"><img src="${esc(r.image)}" alt="عمل فني من معرض إبداعات زاد" loading="lazy"></figure>`).join("")}</div>` : `<div class="sempty"><h3>لا توجد أعمال معروضة بعد</h3><p>ستظهر هنا الأعمال التي يوافق عليها أولياء الأمور وتجتاز المراجعة.</p><p><a class="abtn go" href="${ROOT}arts/studio/">افتح الاستوديو</a></p></div>`}
<p style="margin-top:12px"><a class="abtn" href="${ROOT}arts/">العودة إلى عالم الإبداع والفنون</a></p>`;
}
async function boot() {
  if (IN_GAL) return drawGallery();
  if (IN_VIEW) {
    const s = new URLSearchParams(location.search).get("s"); const rows = s ? await load(s) : null;
    if (rows && rows[0]) drawView(rows[0]); else $("#aview").innerHTML = `<div class="sempty"><h3>${rows === null ? "تعذّر تحميل النشاط" : "هذا النشاط غير متاح"}</h3><p><a class="abtn go" href="${ROOT}arts/">العودة إلى قسم الأنشطة</a></p></div>`;
    return;
  }
  all = await load(); drawList();
}
if (!IN_VIEW && !IN_GAL) initList();
boot();
})();
