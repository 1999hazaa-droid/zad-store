/* الوسائل التعليمية - زاد: قائمة + عارض (معاينة وتكبير وتحميل وطباعة) */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const IN_VIEW = /\/media\/view\/?/.test(location.pathname);
const ROOT = new URL(IN_VIEW ? "../../" : "../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const U = (u) => /^https?:/.test(u || "") ? u : ROOT + String(u || "");
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const KINDS = { mindmap: ["الخرائط الذهنية", "خريطة ذهنية", "1f9e0"], slides: ["العروض التقديمية", "عرض تقديمي", "i_laptop"], poster: ["الملصقات التعليمية", "ملصق", "i_map"], board: ["اللوحات التعليمية", "لوحة", "i_board"], diagram: ["المخططات والرسوم التوضيحية", "رسم توضيحي", "i_microscope"], table: ["الجداول التعليمية", "جدول", "i_numbers"], infographic: ["الإنفوجرافيك التعليمي", "إنفوجرافيك", "i_chart"], explainer: ["وسائل الشرح المصورة", "وسيلة شرح مصورة", "1f4a1"], concept_cards: ["بطاقات المفاهيم", "بطاقات مفاهيم", "1f0cf"], printable: ["وسائل قابلة للطباعة", "قابلة للطباعة", "270f"] };
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const SUBJ = ["اللغة العربية", "الرياضيات", "اللغة الإنجليزية", "العلوم", "التربية الإسلامية", "المهارات الحياتية"];
const CACHE = "zad-media-v1";
const lvText = (a) => { const ag = (a.levels || []).filter((x) => x[0] === "a"), gr = (a.levels || []).filter((x) => x[0] === "g"); const o = []; if (gr.length) o.push(gr.length === 1 ? LV[gr[0]] : "الصفوف " + gr.map((g) => AD(g.slice(1))).join("، ")); if (ag.length) o.push(ag.length === 1 ? "عمر " + LV[ag[0]] : "الأعمار " + ag.map((g) => AD(g.slice(1))).join("، ") + " سنوات"); return o.join(" · "); };
const lvShort = (a) => { const l = (a.levels || []); const ag = l.filter((x) => x[0] === "a"), gr = l.filter((x) => x[0] === "g"); const o = []; if (ag.length) o.push(ag.length > 1 ? `${AD(ag[0].slice(1))}–${AD(ag[ag.length - 1].slice(1))} سنوات` : LV[ag[0]]); if (gr.length) o.push(gr.length > 1 ? `الصفوف ${AD(gr[0].slice(1))}–${AD(gr[gr.length - 1].slice(1))}` : LV[gr[0]]); return o.join(" + "); };
const icon = (c) => `${ROOT}images/zad/${c}.webp`;

let all = [];
async function load(slug) {
  const sel = slug ? "*" : "slug,kind,title,description,levels,subject,topic,orient,pages,cover_url,pdf_url,bw_url,sort_order";
  const url = SB + "/rest/v1/media_aids?status=eq.published&order=kind.asc,sort_order.asc&select=" + sel + (slug ? "&slug=eq." + encodeURIComponent(slug) : "");
  try {
    const r = await fetch(url, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad");
    if (!slug) { try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {} }
    return j;
  } catch {
    if (slug) return null;
    try { return JSON.parse(localStorage.getItem(CACHE)) || []; } catch { return []; }
  }
}

/* ===== القائمة ===== */
const F = { kind: "", stage: "", lv: "", sub: "", q: "" };
const pill = (k, v, l) => `<button type="button" class="zpill${F[k] === v ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${F[k] === v}">${esc(l)}</button>`;
const stageOf = (a, st) => (a.levels || []).some((x) => x[0] === (st === "age" ? "a" : "g"));
function base(skip) {
  const q = norm(F.q).trim();
  return all.filter((a) => (skip === "kind" || !F.kind || a.kind === F.kind) && (skip === "stage" || !F.stage || stageOf(a, F.stage)) && (skip === "lv" || !F.lv || (a.levels || []).includes(F.lv)) && (skip === "sub" || !F.sub || a.subject === F.sub) &&
    (!q || norm([a.title, a.description, a.topic, a.subject, (KINDS[a.kind] || [])[1], lvText(a)].join(" ")).includes(q)));
}
function card(a) {
  const lk = `view/?s=${encodeURIComponent(a.slug)}`, k = KINDS[a.kind] || ["", a.kind];
  return `<article class="mc"><a class="im" href="${lk}" tabindex="-1" aria-hidden="true"><img src="${esc(U(a.cover_url))}" alt="" loading="lazy" width="440" height="330">${a.pages > 1 ? `<span class="pg">${AD(a.pages)} صفحات</span>` : ""}</a>
<div class="bd"><h3>${esc(a.title)}</h3><div class="mt"><span class="k">${esc(k[1])}</span><span>${esc(lvShort(a))}</span><span>${esc(a.subject)}</span></div><p>${esc(a.description)}</p>
<div class="bt"><a class="abtn go" href="${lk}">عرض</a><a class="abtn" href="${esc(U(a.pdf_url))}" download>تحميل</a><a class="abtn" href="${lk}&print=1">طباعة</a></div></div></article>`;
}
function drawList() {
  const set = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };
  const cnt = {}; base("kind").forEach((a) => (cnt[a.kind] = (cnt[a.kind] || 0) + 1));
  set("#mkinds", Object.keys(KINDS).map((k) => { const n = cnt[k] || 0; return `<button type="button" class="mk${F.kind === k ? " on" : ""}" data-k="kind" data-v="${F.kind === k ? "" : k}" aria-pressed="${F.kind === k}"${n || F.kind === k ? "" : " disabled style='opacity:.45'"}><img src="${icon(KINDS[k][2])}" alt=""><span>${esc(KINDS[k][0])}<small>${AD(n)} وسيلة</small></span></button>`; }).join(""));
  set("#fstage", "<b>المرحلة</b>" + pill("stage", "", "الكل") + pill("stage", "age", "الأعمار: ١–٦ سنوات") + pill("stage", "grade", "الصفوف: ١–٤"));
  const fl = $("#flv");
  if (fl) { fl.hidden = !F.stage; if (F.stage) fl.innerHTML = "<b>" + (F.stage === "age" ? "العمر" : "الصف") + "</b>" + pill("lv", "", "الكل") + (F.stage === "age" ? AGES : GRADES).map((k) => pill("lv", k, LV[k])).join(""); }
  set("#fsub", "<b>المادة</b>" + pill("sub", "", "الكل") + SUBJ.filter((s) => all.some((a) => a.subject === s)).map((s) => pill("sub", s, s)).join(""));
  const r = base(), any = Object.values(F).some(Boolean);
  const c = $("#sclr"); if (c) c.hidden = !any;
  const st = $("#sstat"); if (st) st.innerHTML = `<span>${AD(all.length)} وسيلة تعليمية</span><span>${AD(new Set(all.map((a) => a.kind)).size)} أنواع</span><span>${AD(new Set(all.map((a) => a.subject)).size)} مواد</span>`;
  $("#sres").innerHTML = !all.length ? `<div class="sempty"><h3>تعذّر تحميل الوسائل</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p><button class="abtn go" type="button" id="sretry">إعادة المحاولة</button></div>`
    : r.length ? `<p class="sfoot" style="margin:6px 0">${AD(r.length)} نتيجة</p><div class="mgrid">${r.map(card).join("")}</div>`
    : `<div class="sempty"><h3>لا توجد نتائج مطابقة</h3><p>جرّب إزالة بعض الفلاتر.</p></div>`;
}
function initList() {
  const p = new URLSearchParams(location.search);
  ["kind", "sub", "q"].forEach((k) => { if (p.get(k)) F[k] = p.get(k); });
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

/* ===== العارض ===== */
let A = null, I = 0, Z = 1;
function setPrintSize(a) { const s = D.createElement("style"); s.textContent = `@page{size:${a.orient === "landscape" ? "A4 landscape" : "A4 portrait"};margin:0}`; D.head.appendChild(s); }
function show(i) {
  I = Math.max(0, Math.min(A.page_urls.length - 1, i));
  const im = $("#vimg"); im.src = U(A.page_urls[I]); im.alt = `${A.title} - صفحة ${I + 1}`;
  im.className = Z === 1 ? "fit" : ""; im.style.width = Z === 1 ? "" : Z * 100 + "%"; im.style.maxWidth = Z === 1 ? "" : "none";
  const c = $("#vcnt"); if (c) c.textContent = `${AD(I + 1)} / ${AD(A.page_urls.length)}`;
  D.querySelectorAll(".thumbs button").forEach((b, k) => b.classList.toggle("on", k === I));
  const on = $(".thumbs button.on"); if (on && on.scrollIntoView) on.scrollIntoView({ block: "nearest", inline: "center" });
  const pv = $("#vprev"), nx = $("#vnext"); if (pv) pv.disabled = I === 0; if (nx) nx.disabled = I === A.page_urls.length - 1;
  const zl = $("#zlab"); if (zl) zl.textContent = Z === 1 ? "ملاءمة" : Math.round(Z * 100) + "٪";
}
function drawView(a) {
  A = a; D.title = a.title + " | منصة زاد التعليمية"; const bc = $("#abc"); if (bc) bc.textContent = a.title;
  const k = KINDS[a.kind] || ["", a.kind], multi = a.page_urls.length > 1;
  const ratio = a.orient === "slide" ? 1.78 : a.orient === "landscape" ? 1.41 : 0.707;
  $("#aview").innerHTML = `<div class="vtop"><h1>${esc(a.title)}</h1><div class="mt"><span class="k">${esc(k[1])}</span><span>${esc(lvText(a))}</span><span>${esc(a.subject)}</span>${a.topic ? `<span>${esc(a.topic)}</span>` : ""}</div><p>${esc(a.description)}</p></div>
<div class="tool"><a class="abtn go" href="${esc(U(a.pdf_url))}" download id="dl">تحميل PDF</a>${a.bw_url ? `<a class="abtn" href="${esc(U(a.bw_url))}" download>PDF أبيض وأسود</a>` : ""}<button type="button" class="abtn" id="vprint">طباعة</button><button type="button" class="abtn" id="vfs">ملء الشاشة</button><a class="abtn" href="../">العودة للمكتبة</a></div>
<div class="stage" id="stage"><div class="vp" id="vp"><img id="vimg" class="fit" alt=""></div>
<div class="nav"><button type="button" class="abtn" id="zout" aria-label="تصغير">−</button><span class="cnt" id="zlab">ملاءمة</span><button type="button" class="abtn" id="zin" aria-label="تكبير">+</button>${multi ? `<button type="button" class="abtn" id="vnext">التالي ‹</button><span class="cnt" id="vcnt"></span><button type="button" class="abtn" id="vprev">› السابق</button>` : ""}</div>
${multi ? `<div class="thumbs" style="--ar:${ratio}">${a.page_urls.map((u, i) => `<button type="button" aria-label="صفحة ${i + 1}"><img src="${esc(U(u))}" alt="" loading="lazy"></button>`).join("")}</div>` : ""}</div>
<div id="srel"></div><p class="note">${esc(a.review_note || "")}<br>محتوى أصلي من إعداد منصة زاد، غير منسوب إلى منهج أو كتاب مدرسي محدد.</p>`;
  const prt = D.createElement("div"); prt.id = "prt"; prt.innerHTML = a.page_urls.map((u) => `<img src="${esc(U(u))}" alt="">`).join(""); D.body.appendChild(prt); setPrintSize(a);
  const on = (id, f) => { const e = $(id); if (e) e.addEventListener("click", f); };
  on("#vprev", () => show(I - 1)); on("#vnext", () => show(I + 1));
  on("#zin", () => { Z = Math.min(3, Z === 1 ? 1.5 : Z + 0.5); show(I); }); on("#zout", () => { Z = Z <= 1.5 ? 1 : Z - 0.5; show(I); });
  D.querySelectorAll(".thumbs button").forEach((b, k) => b.addEventListener("click", () => show(k)));
  on("#vfs", () => { const s = $("#stage"); if (D.fullscreenElement) D.exitFullscreen(); else if (s.requestFullscreen) s.requestFullscreen(); });
  on("#vprint", doPrint);
  D.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(I + 1); else if (e.key === "ArrowRight") show(I - 1); else if (e.key === "+" || e.key === "=") $("#zin").click(); else if (e.key === "-") $("#zout").click(); });
  let x0 = null; const vp = $("#vp");
  vp.addEventListener("touchstart", (e) => { x0 = e.touches.length === 1 && Z === 1 ? e.touches[0].clientX : null; }, { passive: true });
  vp.addEventListener("touchend", (e) => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 60) show(dx < 0 ? I + 1 : I - 1); }, { passive: true });
  show(0);
  related(a).then((o) => { const e = $("#srel"); if (e && o.length) e.innerHTML = `<section class="stage" style="margin-top:12px"><h2 style="font:800 17px var(--z-font);margin:4px 6px 6px">وسائل أخرى قد تفيدك</h2><div class="rel">${o.join("")}</div></section>`; });
  if (new URLSearchParams(location.search).get("print") === "1") setTimeout(doPrint, 400);
}
function doPrint() {
  const imgs = [...D.querySelectorAll("#prt img")]; const ok = () => W.print();
  const pend = imgs.filter((i) => !i.complete);
  if (!pend.length) return ok();
  let n = pend.length; pend.forEach((i) => { const f = () => { if (--n <= 0) ok(); }; i.addEventListener("load", f, { once: true }); i.addEventListener("error", f, { once: true }); });
}
async function related(a) {
  const all2 = await load(); const out = [];
  all2.filter((x) => x.slug !== a.slug && (x.topic && x.topic === a.topic || x.subject === a.subject && x.levels.some((l) => a.levels.includes(l)))).slice(0, 5).forEach((x) => out.push(`<a href="?s=${encodeURIComponent(x.slug)}">${esc((KINDS[x.kind] || ["", ""])[1])}: ${esc(x.title)}</a>`));
  const K = { "اللغة العربية": "ar", "الرياضيات": "math", "العلوم": "sci", "اللغة الإنجليزية": "en", "التربية الإسلامية": "isl", "المهارات الحياتية": "life" }[a.subject];
  const g = (a.levels || []).find((l) => l[0] === "g");
  if (K && g) { try { const r = await fetch(SB + `/rest/v1/qbank?status=eq.published&grade=eq.${g.slice(1)}&subj=eq.${K}&select=unit&limit=1`, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } }); const j = r.ok ? await r.json() : []; if (Array.isArray(j) && j.length) out.push(`<a href="${ROOT}tests/#gen=1&lv=${g}&sj=${K}">قِس فهمك: تدريب من بنك الأسئلة (${esc(a.subject)} · ${esc(LV[g])})</a>`); } catch {} }
  return out;
}
async function boot() {
  if (IN_VIEW) {
    const slug = new URLSearchParams(location.search).get("s"); const j = slug ? await load(slug) : [];
    if (j && j[0]) drawView(j[0]);
    else $("#aview").innerHTML = `<div class="sempty"><h3>${j === null ? "تعذّر تحميل الوسيلة" : "لم نجد هذه الوسيلة"}</h3><p>${j === null ? "تحقّق من الاتصال ثم أعد المحاولة." : "قد تكون غير منشورة أو الرابط غير صحيح."}</p><a class="abtn go" href="../">العودة للمكتبة</a></div>`;
    return;
  }
  all = await load();
  if (!boot.i) { initList(); boot.i = 1; }
  drawList();
}
boot();
})();
