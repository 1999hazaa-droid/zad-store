/* الموسوعة التعليمية المصغرة - زاد: قائمة + صفحة موضوع بأنشطة تفاعلية */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const IN_VIEW = /\/wiki\/view\/?/.test(location.pathname);
const ROOT = new URL(IN_VIEW ? "../../" : "../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const icon = (c) => `${ROOT}images/zad/${c}.webp`;
const CATS = { animals: ["عالم الحيوانات", "1f981", "#fff0d9"], plants: ["عالم النباتات", "1f331", "#e3f6e3"], body: ["جسم الإنسان", "1f9e0", "#fde3ee"], space: ["الفضاء والكواكب", "x_saturn", "#e4e6ff"], science: ["العلوم والاكتشاف", "1f52c", "#dff3fb"], geo: ["الجغرافيا والعالم", "1f310", "#e1f2ea"], culture: ["الثقافة والمعرفة", "1f4da", "#f3e8ff"], values: ["القيم والمهارات الحياتية", "1f44f", "#fff3c9"] };
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const TIER = { 1: "الأصغر (١–٤ سنوات)", 2: "٥–٦ سنوات والصفان ١–٢", 3: "الصفان ٣–٤" };
const TSHORT = { 1: "١–٤ سنوات", 2: "٥–٦ سنوات والصفان ١–٢", 3: "الصفان ٣–٤" };
const tierOf = (lv) => ({ a2: 1, a3: 1, a4: 1, a5: 2, a6: 2, g1: 2, g2: 2, g3: 3, g4: 3 }[lv] || 0);
const CACHE = "zad-wiki-v1";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
async function load(slug) {
  try {
    const j = await rest("wiki_topics?status=eq.published&order=sort_order.asc&select=" + (slug ? "*&slug=eq." + encodeURIComponent(slug) : "slug,category,sub,title,icon,levels,keywords,intro,facts,sort_order"));
    if (!slug) { try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {} }
    return j;
  } catch { if (slug) return null; try { return JSON.parse(localStorage.getItem(CACHE)) || []; } catch { return []; } }
}
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const catName = (k) => (CATS[k] || [k])[0];
/* ===== القائمة ===== */
let all = [];
const F = { cat: "", stage: "", lv: "", sub: "", q: "" };
const pill = (k, v, l) => `<button type="button" class="zpill${F[k] === v ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${F[k] === v}">${esc(l)}</button>`;
function base(skip) {
  const q = norm(F.q).trim();
  return all.filter((a) => (skip === "cat" || !F.cat || a.category === F.cat) && (skip === "stage" || !F.stage || (a.levels || []).some((x) => x[0] === (F.stage === "age" ? "a" : "g"))) && (skip === "lv" || !F.lv || (a.levels || []).includes(F.lv)) && (skip === "sub" || !F.sub || a.sub === F.sub) &&
    (!q || norm([a.title, a.sub, a.intro, catName(a.category), (a.keywords || []).join(" ")].join(" ")).includes(q)));
}
const href = (a) => `view/?s=${encodeURIComponent(a.slug)}` + (F.lv ? "&lv=" + F.lv : "");
function card(a) {
  const c = CATS[a.category] || ["", "i_book", "#f3eeff"];
  return `<a class="tc" href="${href(a)}"><span class="im" style="--bg:${c[2]}"><img src="${esc(icon(a.icon))}" alt="" loading="lazy" width="96" height="96"></span><span class="bd"><h3>${esc(a.title)}</h3><span class="mt"><span>${esc(c[0])}</span></span><p>${esc(a.intro)}</p><span class="abtn go">اقرأ الموضوع</span></span></a>`;
}
let facts = [], fi = 0;
function drawFacts() {
  const t = F.lv ? tierOf(F.lv) : 0;
  const pool = []; base("none").forEach((a) => (a.facts || []).forEach((f) => { if (!t || f.t <= t) pool.push({ f, a }); }));
  facts = shuf(pool); fi = 0; showFacts();
}
function showFacts() {
  const s = $("#gdyk"); if (!s) return; s.hidden = !facts.length; if (!facts.length) return;
  const part = facts.slice(fi, fi + 4).concat(facts.length < 4 ? [] : facts.slice(0, Math.max(0, fi + 4 - facts.length)));
  $("#dyk").innerHTML = `<div class="dykbar"><button type="button" class="abtn" id="dykn">معلومة أخرى</button></div><div class="dyk">${part.map(({ f, a }) => `<div class="fc"><div class="t"><img src="${esc(icon(f.ic))}" alt=""><b>${esc(f.h)}</b></div><p>${esc(f.x)}</p><div class="mt"><span>${esc(catName(a.category))}</span><span>${esc(TSHORT[f.t])}</span></div><a class="abtn" href="view/?s=${encodeURIComponent(a.slug)}&lv=${f.t === 1 ? "a4" : f.t === 2 ? "a6" : "g3"}">اقرأ عن ${esc(a.title)}</a></div>`).join("")}</div>`;
}
function drawList() {
  const set = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };
  const cnt = {}; base("cat").forEach((a) => (cnt[a.category] = (cnt[a.category] || 0) + 1));
  set("#mkinds", Object.keys(CATS).filter((k) => cnt[k] || F.cat === k).map((k) => `<button type="button" class="mk${F.cat === k ? " on" : ""}" data-k="cat" data-v="${F.cat === k ? "" : k}" aria-pressed="${F.cat === k}"><img src="${icon(CATS[k][1])}" alt=""><span>${esc(CATS[k][0])}<small>${AD(cnt[k] || 0)} موضوع</small></span></button>`).join(""));
  set("#fstage", "<b>المرحلة</b>" + pill("stage", "", "الكل") + pill("stage", "age", "الأعمار: ١–٦ سنوات") + pill("stage", "grade", "الصفوف: ١–٤"));
  const fl = $("#flv");
  if (fl) { fl.hidden = !F.stage; if (F.stage) fl.innerHTML = "<b>" + (F.stage === "age" ? "العمر" : "الصف") + "</b>" + pill("lv", "", "الكل") + (F.stage === "age" ? AGES : GRADES).map((k) => pill("lv", k, LV[k])).join(""); }
  const subs = [...new Set(base("sub").map((a) => a.sub).filter(Boolean))];
  set("#fkind", subs.length > 1 ? "<b>الموضوع</b>" + pill("sub", "", "الكل") + subs.map((s) => pill("sub", s, s)).join("") : "");
  const r = base(), any = Object.values(F).some(Boolean);
  const c = $("#sclr"); if (c) c.hidden = !any;
  const st = $("#sstat"); if (st) st.innerHTML = `<span>${AD(all.length)} موضوعًا</span><span>${AD(new Set(all.map((a) => a.category)).size)} تصنيفات</span><span>${AD(all.reduce((n, a) => n + (a.facts || []).length, 0))} معلومة «هل تعلم؟»</span>`;
  $("#sres").innerHTML = !all.length ? `<div class="sempty"><h3>تعذّر تحميل الموسوعة</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p><button class="abtn go" type="button" id="sretry">إعادة المحاولة</button></div>`
    : r.length ? `<p class="sfoot" style="margin:6px 0">${AD(r.length)} نتيجة</p><div class="mgrid">${r.map(card).join("")}</div>` : `<div class="sempty"><h3>لا توجد نتائج مطابقة</h3><p>جرّب إزالة بعض الفلاتر.</p></div>`;
}
function initList() {
  const p = new URLSearchParams(location.search);
  ["cat", "q"].forEach((k) => { if (p.get(k) && (k !== "cat" || CATS[p.get(k)])) F[k] = p.get(k); });
  if (p.get("lv") && LV[p.get("lv")]) { F.lv = p.get("lv"); F.stage = F.lv[0] === "a" ? "age" : "grade"; }
  if (F.q) { const q = $("#sq"); if (q) { q.value = F.q; $("#sqx").hidden = false; } }
  D.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (b && !b.disabled) { const k = b.dataset.k; F[k] = b.dataset.v; if (k === "stage") F.lv = ""; if (k === "cat") F.sub = ""; drawList(); drawFacts(); return; }
    if (e.target.id === "sclr") { Object.keys(F).forEach((k) => (F[k] = "")); const q = $("#sq"); if (q) q.value = ""; $("#sqx").hidden = true; drawList(); drawFacts(); }
    if (e.target.id === "sretry") boot();
    if (e.target.id === "dykn") { fi = (fi + 4) % Math.max(1, facts.length); showFacts(); }
  });
  const q = $("#sq"), x = $("#sqx");
  q.addEventListener("input", () => { F.q = q.value; x.hidden = !q.value; drawList(); drawFacts(); });
  x.addEventListener("click", () => { q.value = ""; F.q = ""; x.hidden = true; drawList(); drawFacts(); q.focus(); });
}
/* ===== صفحة الموضوع ===== */
let TP = null, TR = 2, total = 0, done = 0, right = 0;
function act(a, i) {
  const k = { mc: "اختر الإجابة الصحيحة", tf: "صح أم خطأ؟", fill: "أكمل المعلومة", match: "طابق الصورة بالمعلومة", sort: "صنّف", odd: "اكتشف الاختلاف" }[a.k];
  const lab = `<span class="k">${k}</span>`;
  if (a.k === "mc") return `<div class="act" data-i="${i}" data-k="mc"><h3>${lab}${esc(a.q)}</h3><div class="opts">${shuf(a.o.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}">${esc(t)}</button>`).join("")}</div><div class="fb"></div></div>`;
  if (a.k === "tf") return `<div class="act" data-i="${i}" data-k="tf"><h3>${lab}${esc(a.q)}</h3><div class="opts"><button type="button" class="opt" data-j="1">صحيح</button><button type="button" class="opt" data-j="0">خطأ</button></div><div class="fb"></div></div>`;
  if (a.k === "fill") return `<div class="act" data-i="${i}" data-k="fill"><h3>${lab}${esc(a.q).replace("___", "<b>_____</b>")}</h3><div class="opts">${shuf(a.o.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}">${esc(t)}</button>`).join("")}</div><div class="fb"></div></div>`;
  if (a.k === "odd") return `<div class="act" data-i="${i}" data-k="odd"><h3>${lab}أي واحد مختلف عن الباقي؟</h3><div class="opts">${shuf(a.i.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}"><img src="${esc(icon(t[1]))}" alt="">${esc(t[0])}</button>`).join("")}</div><div class="fb"></div></div>`;
  if (a.k === "match") return `<div class="act" data-i="${i}" data-k="match"><h3>${lab}اختر الصورة ثم الاسم المناسب لها</h3><div class="mcols"><div class="opts" style="flex-direction:column">${shuf(a.p.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt L" data-j="${j}"><img src="${esc(icon(t[0]))}" alt="${esc(t[1])}"></button>`).join("")}</div><div class="opts" style="flex-direction:column">${shuf(a.p.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt R" data-j="${j}">${esc(t[1])}</button>`).join("")}</div></div><div class="fb"></div></div>`;
  if (a.k === "sort") return `<div class="act" data-i="${i}" data-k="sort"><h3>${lab}اختر العنصر ثم المجموعة المناسبة</h3><div class="opts" id="pool${i}">${shuf(a.i.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}"><img src="${esc(icon(t[2]))}" alt="">${esc(t[0])}</button>`).join("")}</div><div class="grp">${a.g.map((g, gi) => `<div><button type="button" class="gb" data-g="${gi}">${esc(g)}</button><div class="put" data-p="${gi}"></div></div>`).join("")}</div><div class="fb"></div></div>`;
  return "";
}
function score() { const s = $("#score"); if (!s) return; s.innerHTML = done >= total ? `أنهيت الأنشطة! نتيجتك: ${AD(right)} من ${AD(total)}` + (right === total ? " — ممتاز" : " — يمكنك قراءة الموضوع ثم المحاولة من جديد") : `أجبت عن ${AD(done)} من ${AD(total)} — إجاباتك الصحيحة: ${AD(right)}`; }
function finish(box, ok, msg, first) { box.classList.toggle("ok", ok); if (ok) { done++; if (first) right++; score(); } const fb = $(".fb", box); fb.className = "fb " + (ok ? "g" : "b"); fb.textContent = msg; }
function wireActs(acts) {
  const L = acts;
  D.querySelectorAll(".act").forEach((box) => {
    const a = L[+box.dataset.i]; let tries = 0, sel = null, left = 0;
    if (["mc", "tf", "fill", "odd"].includes(a.k)) {
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (!b || b.disabled) return; const j = +b.dataset.j; const ok = a.k === "tf" ? (j === 1) === !!a.a : j === a.a; tries++;
        if (ok) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); finish(box, true, a.k === "odd" ? "أحسنت! " + a.why : "أحسنت! إجابة صحيحة.", tries === 1); }
        else { b.classList.add("bad"); b.disabled = true; const fb = $(".fb", box); fb.className = "fb b"; fb.textContent = "حاول مرة أخرى."; }
      });
    } else if (a.k === "match") {
      left = a.p.length;
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (!b || b.disabled) return;
        if (b.classList.contains("L")) { box.querySelectorAll(".L.sel").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = b; return; }
        if (!sel) { const fb = $(".fb", box); fb.className = "fb b"; fb.textContent = "اختر الصورة أولًا."; return; }
        tries++;
        if (sel.dataset.j === b.dataset.j) { sel.classList.remove("sel"); sel.classList.add("good"); b.classList.add("good"); sel.disabled = b.disabled = true; sel = null; left--; const fb = $(".fb", box); fb.className = "fb g"; fb.textContent = "مطابقة صحيحة."; if (!left) finish(box, true, "أحسنت! طابقت كل العناصر.", tries === a.p.length); }
        else { b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 600); const fb = $(".fb", box); fb.className = "fb b"; fb.textContent = "ليست هذه، حاول مرة أخرى."; }
      });
    } else if (a.k === "sort") {
      left = a.i.length;
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (b && !b.disabled) { box.querySelectorAll(".opt.sel").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = b; return; }
        const g = e.target.closest(".gb"); if (!g) return; const fb = $(".fb", box);
        if (!sel) { fb.className = "fb b"; fb.textContent = "اختر العنصر أولًا."; return; }
        tries++; const item = a.i[+sel.dataset.j];
        if (item[1] === +g.dataset.g) { const s = D.createElement("span"); s.textContent = item[0]; $(`.put[data-p="${g.dataset.g}"]`, box).appendChild(s); sel.remove(); sel = null; left--; fb.className = "fb g"; fb.textContent = "تصنيف صحيح."; if (!left) finish(box, true, "أحسنت! صنّفت كل العناصر.", tries === a.i.length); }
        else { fb.className = "fb b"; fb.textContent = "ليست في هذه المجموعة، حاول مرة أخرى."; }
      });
    }
  });
}
const keyOf = (t) => (t.keywords || []).filter(Boolean);
async function libLinks(t) {
  const out = [];
  for (const l of t.links || []) {
    try {
      if (l.type === "cards") { const j = await rest(`cards?status=eq.published&cat=eq.${encodeURIComponent(l.cat)}${l.sub ? "&sub=eq." + encodeURIComponent(l.sub) : ""}&select=slug&limit=1`); if (j.length) out.push(["بطاقات تعليمية", l.label || "بطاقات مرتبطة", `${ROOT}cards/?cat=${encodeURIComponent(l.cat)}`]); continue; }
      const T = { stories: ["stories", "title,summary", "قصص", "slug,title", (s) => `${ROOT}stories/read/?s=${encodeURIComponent(s.slug)}`], activities: ["activities", "title,summary", "أنشطة منزلية وأوراق عمل", "slug,title", (s) => `${ROOT}activities/view/?a=${encodeURIComponent(s.slug)}`], media: ["media_aids", "title,description", "وسائل تعليمية", "slug,title", (s) => `${ROOT}media/view/?s=${encodeURIComponent(s.slug)}`] }[l.type]; if (!T) continue;
      const or = (l.q || []).flatMap((q) => T[1].split(",").map((c) => `${c}.ilike.*${q.replace(/[(),*]/g, " ")}*`)).join(",");
      const j = await rest(`${T[0]}?status=eq.published&or=(${encodeURIComponent(or)})&select=${T[3]}&limit=3`);
      j.forEach((s) => out.push([T[2], s.title, T[4](s)]));
    } catch {}
  }
  return out;
}
async function drawView(t) {
  TP = t; D.title = t.title + " | الموسوعة المصغرة | منصة زاد التعليمية"; const bc = $("#abc"); if (bc) bc.textContent = t.title;
  const p = new URLSearchParams(location.search); let lv = p.get("lv"); let r = lv ? tierOf(lv) : 0;
  if (!r) { try { r = +localStorage.getItem("zad-wiki-tier") || 0; } catch {} } TR = r || 2;
  render(t, lv);
}
async function render(t) {
  const c = CATS[t.category] || ["", "i_book", "#f3eeff"];
  const sec = (t.sections || []).filter((s) => s.t <= TR && (TR > 1 || s.t === 1)), fc = (t.facts || []).filter((f) => f.t <= TR), vc = (t.vocab || []).filter((v) => v.t <= TR);
  const acts = (t.acts || []).filter((a) => a.ts.includes(TR)); total = acts.length; done = 0; right = 0;
  $("#aview").innerHTML = `<div class="hero" style="--bg:${c[2]}"><img src="${esc(icon(t.icon))}" alt=""><div><div class="mt"><span>${esc(c[0])}</span>${t.sub && t.sub !== t.title ? `<span>${esc(t.sub)}</span>` : ""}</div><h1>${esc(t.title)}</h1><p>${esc(t.intro)}</p></div></div>
<div class="tiers" role="group" aria-label="مستوى القراءة"><b>مستوى القراءة:</b>${[1, 2, 3].map((k) => `<button type="button" class="zpill${TR === k ? " on" : ""}" data-t="${k}" aria-pressed="${TR === k}">${TIER[k]}</button>`).join("")}</div>
<section class="art"><h2>اقرأ وتعلّم</h2>${sec.map((s) => `<div class="sec">${s.ic ? `<img src="${esc(icon(s.ic))}" alt="">` : ""}<div><h3>${esc(s.h)}</h3><p>${esc(s.x)}</p></div></div>`).join("")}</section>
<section class="art"><h2>هل تعلم؟</h2><div class="facts">${fc.map((f) => `<div class="fc"><div class="t"><img src="${esc(icon(f.ic))}" alt=""><b>${esc(f.h)}</b></div><p>${esc(f.x)}</p><div class="mt"><span>${esc(c[0])}</span><span>${esc(TSHORT[f.t])}</span></div></div>`).join("")}</div></section>
<section class="art"><h2>مفردات جديدة</h2><div class="vc">${vc.map((v) => `<div>${v.ic ? `<img src="${esc(icon(v.ic))}" alt="">` : ""}<p style="margin:0"><b>${esc(v.w)}</b><span>${esc(v.m)}</span></p></div>`).join("")}</div></section>
<section class="art" id="acts"><h2>اختبر معلوماتك</h2><div class="score" id="score"></div>${acts.map((a, i) => act(a, i)).join("")}<div id="nxt"></div></section>
<section class="art lib" id="lib" hidden></section>
<section class="art" id="more" hidden></section>
<p class="note">${esc(t.sources || "")}<br>${esc(t.review_note || "")}</p>`;
  score(); wireActs(acts);
  $("#nxt").innerHTML = "";
  more(t); lib(t);
}
async function more(t) {
  try {
    const a = await load(); const rel = (t.related || []).map((s) => a.find((x) => x.slug === s)).filter(Boolean);
    const same = a.filter((x) => x.category === t.category).sort((x, y) => x.sort_order - y.sort_order); const i = same.findIndex((x) => x.slug === t.slug);
    const nx = same[i + 1] || a.filter((x) => x.sort_order > t.sort_order)[0] || a[0];
    const lk = (x) => `<a class="tc" href="?s=${encodeURIComponent(x.slug)}&lv=${TR === 1 ? "a4" : TR === 2 ? "a6" : "g3"}"><span class="im" style="--bg:${(CATS[x.category] || ["", "", "#f3eeff"])[2]}"><img src="${esc(icon(x.icon))}" alt="" width="96" height="96"></span><span class="bd"><h3>${esc(x.title)}</h3></span></a>`;
    const e = $("#more"); if (!e) return;
    e.hidden = false; e.innerHTML = `<h2>اكتشف المزيد</h2><div class="mgrid">${rel.map(lk).join("")}</div>${nx && nx.slug !== t.slug ? `<h2 style="margin-top:12px">استكشف الموضوع التالي</h2><div class="mgrid">${lk(nx)}</div>` : ""}<p style="margin-top:10px"><a class="abtn" href="../">العودة إلى الموسوعة</a></p>`;
  } catch {}
}
async function lib(t) {
  const o = await libLinks(t); const e = $("#lib"); if (!e || !o.length) return;
  const g = {}; o.forEach(([k, l, u]) => (g[k] = g[k] || []).push([l, u]));
  e.hidden = false; e.innerHTML = `<h2>من مكتبة زاد عن هذا الموضوع</h2>` + Object.keys(g).map((k) => `<h3>${esc(k)}</h3>` + g[k].map(([l, u]) => `<a href="${esc(u)}">${esc(l)}</a>`).join("")).join("");
}
async function boot() {
  if (IN_VIEW) {
    D.addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b && TP) { TR = +b.dataset.t; try { localStorage.setItem("zad-wiki-tier", TR); } catch {} render(TP); } });
    const slug = new URLSearchParams(location.search).get("s"); const j = slug ? await load(slug) : [];
    if (j && j[0]) drawView(j[0]);
    else $("#aview").innerHTML = `<div class="sempty"><h3>${j === null ? "تعذّر تحميل الموضوع" : "لم نجد هذا الموضوع"}</h3><p>${j === null ? "تحقّق من الاتصال ثم أعد المحاولة." : "قد يكون غير منشور أو الرابط غير صحيح."}</p><a class="abtn go" href="../">العودة إلى الموسوعة</a></div>`;
    return;
  }
  all = await load();
  if (!boot.i) { initList(); boot.i = 1; }
  drawList(); drawFacts();
}
boot();
})();
