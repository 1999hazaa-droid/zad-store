/* بنك الأنشطة التعليمية - زاد: أنشطة تفاعلية (اختيار، توصيل، ترتيب، تصنيف، ذاكرة، تلوين) + أوراق عمل PDF + روابط الأقسام. التقدم محلي. */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const PAGE = D.body.dataset.page || "hub";
const ROOT = new URL(PAGE === "hub" ? "../" : "../../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`);
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const CATS = { arabic: ["اللغة العربية", "u_abc"], math: ["الرياضيات", "i_numbers"], english: ["اللغة الإنجليزية", "i_globe"], science: ["العلوم والاكتشاف", "i_microscope"], focus: ["الإدراك والتركيز", "i_brain"], motor: ["المهارات الحركية", "i_pencil"], values: ["القيم والسلوك", "i_heart"], art: ["الإبداع والفنون", "i_palette"] };
const TYPES = { mcq: "اختيار من متعدد", match: "توصيل", order: "ترتيب", sort: "تصنيف", memory: "ذاكرة", color: "تلوين تفاعلي", sheet: "ورقة قابلة للطباعة", link: "من قسم آخر" };
const DIFF = { easy: "سهل", mid: "متوسط", adv: "متقدم" };
const LK = "zad-learn-v3", SK = "zad-bank-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; const b = (S.bank = S.bank || {}); b.done = b.done || {}; b.started = b.started || {}; b.badges = b.badges || {}; b.pts = b.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
let ITEMS = [];
async function load() { try { ITEMS = await rest("bank_items?status=eq.published&order=sort_order.asc&select=slug,cat,type,title,icon,levels,subject,skill,difficulty,descr,instr,data,href,pdf_url,preview_url,link,sort_order"); try { localStorage.setItem("zad-bank-cache", JSON.stringify(ITEMS)); } catch {} } catch { try { ITEMS = JSON.parse(localStorage.getItem("zad-bank-cache") || "[]"); } catch { ITEMS = []; } } return ITEMS; }
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 3200); }
const isDone = (s) => !!S.bank.done[s], isEn = (it) => it.cat === "english";
const fmt = (t, it) => { let s = esc(t); if (!isEn(it)) s = s.replace(/\d+(?:\s*[+−×÷=]\s*\d+)+/g, (m) => `<bdi dir="ltr">${m}</bdi>`).replace(/\d+/g, (d) => AD(d)); return s; };
const fmt2 = (t, it) => (isEn(it) ? esc(t) : esc(t).replace(/\d+/g, (d) => AD(d)));
/* ===== صوت الجهاز عند الضغط فقط ===== */
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W;
function say(text, en) { if (!tts) return toast("الصوت غير متاح على هذا الجهاز."); try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = en ? "en-US" : "ar-SA"; u.rate = 0.8; speechSynthesis.speak(u); } catch { toast("تعذر تشغيل الصوت."); } }
W.addEventListener("pagehide", () => { if (tts) try { speechSynthesis.cancel(); } catch {} });
/* ===== الشارات ===== */
const BADGES = [["first", "البداية", "أكملت أول نشاط", (s) => s.n >= 1], ["five", "٥ أنشطة", "أكملت خمسة أنشطة", (s) => s.n >= 5], ["ten", "١٠ أنشطة", "أكملت عشرة أنشطة", (s) => s.n >= 10], ["twenty", "٢٥ نشاطا", "أكملت خمسة وعشرين نشاطا", (s) => s.n >= 25], ["perfect", "بلا أخطاء", "أنهيت نشاطا من أول محاولة", (s) => s.perfect >= 1], ["three", "نجم المجال", "أكملت ثلاثة أنشطة في مجال واحد", (s) => s.maxCat >= 3], ["sheet", "ورقة منجزة", "أنجزت ورقة عمل مطبوعة", (s) => s.sheets >= 1]];
function stats() { const d = S.bank.done, ks = Object.keys(d).filter((k) => ITEMS.find((i) => i.slug === k)), byCat = {}; ks.forEach((k) => { const it = ITEMS.find((i) => i.slug === k); byCat[it.cat] = (byCat[it.cat] || 0) + 1; }); return { n: ks.length, perfect: ks.filter((k) => d[k].best === 3).length, maxCat: Math.max(0, ...Object.values(byCat)), sheets: ks.filter((k) => ITEMS.find((i) => i.slug === k).type === "sheet").length }; }
function awardBadges() { const st = stats(), got = []; BADGES.forEach(([id, n, , f]) => { if (!S.bank.badges[id] && f(st)) { S.bank.badges[id] = Date.now(); got.push(n); } }); return got; }
function complete(it, wrong, total) { const first = !isDone(it.slug), stars = wrong === 0 ? 3 : wrong <= Math.max(2, Math.floor(total / 2)) ? 2 : 1; const r = (S.bank.done[it.slug] = S.bank.done[it.slug] || { d: 0, w: 0, best: 0, t: 0, last: 0 }); r.d++; r.w += wrong; r.last = wrong; r.best = Math.max(r.best, stars); r.t = Date.now(); const pts = first ? 10 + stars * 2 : 3; S.bank.pts += pts; const got = awardBadges(); save(); return { first, stars, pts, got }; }
/* ===== واجهات ===== */
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${Object.keys(LV).map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
const forLv = (lv) => ITEMS.filter((x) => x.levels.includes(lv));
function btnLabel(x) { return x.type === "sheet" ? "افتح الورقة" : x.type === "link" ? "اذهب إلى القسم" : "ابدأ النشاط"; }
function hrefOf(x, lv) { return x.type === "link" ? ROOT + x.href : `play/?s=${encodeURIComponent(x.slug)}&lv=${lv}`; }
function card(x, lv) { const d = S.bank.done[x.slug]; return `<div class="bkc${d ? " done" : ""}" data-slug="${esc(x.slug)}"><img src="${icon(x.icon)}" alt="" width="56" height="56"><div class="bkb"><b>${esc(x.title)}</b><span class="bkd">${esc(x.descr)}</span><span class="bkt"><i>${esc(TYPES[x.type])}</i><i>${esc(DIFF[x.difficulty])}</i><i>${esc(x.skill)}</i>${d ? '<i class="ok">✓ أنجزته</i>' : S.bank.started[x.slug] ? '<i class="st">بدأته</i>' : ""}</span></div><a class="bkgo" href="${hrefOf(x, lv)}" data-start="${esc(x.slug)}">${btnLabel(x)}</a></div>`; }
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(); setLv(lv);
  const all = forLv(lv), young = lv === "a2" || lv === "a3";
  const subs = Array.from(new Set(all.map((x) => x.subject))), skills = Array.from(new Set(all.map((x) => x.skill)));
  const sel = (id, lab, opts, v) => `<select id="${id}" aria-label="${lab}"><option value="">${lab}</option>${opts.map(([k, l]) => `<option value="${esc(k)}"${v === k ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const cont = all.filter((x) => S.bank.started[x.slug] && !isDone(x.slug)).slice(0, 4);
  box.innerHTML = `<div class="hero"><img src="${icon("i_puzzle")}" alt=""><div><h1>بنك الأنشطة التعليمية</h1><p>أنشطة تفاعلية وأوراق عمل للطباعة لكل مرحلة، للتعلم والمراجعة واللعب.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: أنشطة قصيرة وبسيطة، ويجلس الكبير مع الطفل." : "تُعرض الأنشطة المناسبة لهذه المرحلة."} الصعوبة محددة بحسب العمر والصف والمهارة.</p></div>
<div class="bkcats" id="bkcats">${Object.entries(CATS).map(([k, [l, i]]) => `<button type="button" class="bkct" data-cat="${k}"><img src="${icon(i)}" alt="" width="40" height="40"><b>${esc(l)}</b><small>${AD(all.filter((x) => x.cat === k).length)} نشاطا</small></button>`).join("")}</div>
<section class="art"><h2>ابحث وصفِّ</h2><input class="vsearch" id="bq" type="search" placeholder="ابحث باسم النشاط أو مهارته" aria-label="بحث" value="${esc(p.get("q") || "")}"><div class="vfil">${sel("fc", "المجال", Object.entries(CATS).map(([k, v]) => [k, v[0]]), p.get("c") || "")}${sel("fs", "المادة الدراسية", subs.map((s) => [s, s]))}${sel("ft", "نوع النشاط", Object.entries(TYPES))}${sel("fk", "المهارة المستهدفة", skills.map((s) => [s, s]))}${sel("fd", "مستوى الصعوبة", Object.entries(DIFF))}${sel("fm", "الشكل", [["play", "تفاعلي على الشاشة"], ["print", "قابل للطباعة"], ["link", "في قسم آخر"]])}</div><div class="vbtns"><button type="button" id="fclr">إلغاء التصفية والعودة إلى كل الأنشطة</button></div></section>
<div id="bkres" aria-live="polite"></div>
${cont.length ? `<section class="art" id="bkcont"><h2>أكمل ما بدأت</h2><div class="bkl">${cont.map((x) => card(x, lv)).join("")}</div></section>` : ""}
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة المتابعة</a><a class="abtn" href="guide/">دليل ولي الأمر</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
  const f = () => { const q = $("#bq").value.trim(), c = $("#fc").value, s = $("#fs").value, t = $("#ft").value, k = $("#fk").value, d = $("#fd").value, m = $("#fm").value, on = q || c || s || t || k || d || m;
    const L = all.filter((x) => (!q || (x.title + " " + x.skill + " " + x.descr).includes(q)) && (!c || x.cat === c) && (!s || x.subject === s) && (!t || x.type === t) && (!k || x.skill === k) && (!d || x.difficulty === d) && (!m || (m === "play" ? ["mcq", "match", "order", "sort", "memory", "color"].includes(x.type) : m === "print" ? x.type === "sheet" : x.type === "link")));
    D.querySelectorAll(".bkct").forEach((b) => b.classList.toggle("on", b.dataset.cat === c));
    let h = on ? `<p class="hint">${AD(L.length)} نتيجة</p>${L.length ? `<div class="bkl">${L.map((x) => card(x, lv)).join("")}</div>` : `<div class="sempty"><h3>لا توجد أنشطة بهذه الشروط</h3><p class="hint">غيّر الفلاتر أو اضغط إلغاء التصفية.</p></div>`}` : "";
    if (!on) { const grp = (h2, list) => list.length ? `<section class="art"><h2>${h2}</h2><div class="bkl">${list.map((x) => card(x, lv)).join("")}</div></section>` : ""; const play = all.filter((x) => !["sheet", "link"].includes(x.type)); h = Object.entries(CATS).map(([k, [l]]) => grp(l, play.filter((x) => x.cat === k))).join("") + grp("بنك أوراق العمل القابلة للطباعة", all.filter((x) => x.type === "sheet")) + grp("أنشطة في أقسام أخرى من المكتبة", all.filter((x) => x.type === "link")); }
    $("#bkres").innerHTML = h; $("#bkcont") && ($("#bkcont").style.display = on ? "none" : ""); };
  ["#bq", "#fc", "#fs", "#ft", "#fk", "#fd", "#fm"].forEach((i) => ($(i).oninput = f));
  $("#fclr").onclick = () => { ["#bq", "#fc", "#fs", "#ft", "#fk", "#fd", "#fm"].forEach((i) => ($(i).value = "")); f(); };
  D.querySelectorAll(".bkct").forEach((b) => (b.onclick = () => { $("#fc").value = $("#fc").value === b.dataset.cat ? "" : b.dataset.cat; f(); $("#bkres").scrollIntoView({ block: "start" }); }));
  D.addEventListener("click", (e) => { const a = e.target.closest("[data-start]"); if (!a) return; const x = ITEMS.find((i) => i.slug === a.dataset.start); if (x && x.type === "link") { S.bank.started[x.slug] = Date.now(); save(); } });
  f();
}
/* ===== صفحة النشاط ===== */
const EX = { mcq: "اختر الإجابة الصحيحة بالضغط عليها.", match: "اضغط عنصرا من العمود الأول ثم ما يناسبه من العمود الثاني.", order: "اضغط العناصر بالترتيب الصحيح من الأول إلى الأخير.", sort: "اضغط العنصر ثم اضغط المجموعة التي ينتمي إليها.", memory: "اقلب بطاقتين، فإذا تطابقتا بقيتا مفتوحتين.", color: "اختر لونا من الألوان ثم اضغط الجزء المطلوب في الرسمة." };
function playPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = ITEMS.find((x) => x.slug === p.get("s"));
  if (!it || it.type === "link") return (box.innerHTML = `<div class="sempty"><h3>النشاط غير موجود أو غير منشور</h3><p><a class="abtn go" href="../">بنك الأنشطة</a></p></div>`);
  const rel = it.link && it.link.href ? `<a class="abtn go" id="rel" href="${ROOT}${esc(it.link.href)}">انتقل إلى: ${esc(it.link.label)}</a>` : "";
  const head = `<div class="sgp"><img class="big" src="${icon(it.icon)}" alt="" style="max-width:110px"><h1 style="margin:6px 0">${esc(it.title)}</h1><div class="vmeta"><span>${esc(TYPES[it.type])}</span><span>${esc(DIFF[it.difficulty])}</span><span>${esc(it.subject)}</span><span>${esc(LV[lv])}</span></div><p class="hint"><b>المهارة المستهدفة:</b> ${esc(it.skill)}</p></div>`;
  if (it.type === "sheet") {
    box.innerHTML = `${head}<section class="art"><h2>معاينة الورقة</h2><img class="bkprev" src="${ROOT}${esc(it.preview_url)}" alt="معاينة ورقة ${esc(it.title)}"><p class="hint">${esc(it.descr)} الورقة بحجم A4، وأول صفحة ظاهرة في المعاينة.</p><div class="vbtns"><a class="main" id="dl" href="${ROOT}${esc(it.pdf_url)}" download>⬇ تحميل PDF</a><a id="op" href="${ROOT}${esc(it.pdf_url)}" target="_blank" rel="noopener">🖨 فتح للطباعة</a><button type="button" id="dn">${isDone(it.slug) ? "✓ أنجزنا هذه الورقة" : "أنجزنا هذه الورقة"}</button></div><p class="hint">${esc(it.instr)} بعد الإنجاز اضغط «أنجزنا هذه الورقة» ليسجل ولي الأمر ذلك.</p></section>${rel ? `<section class="art"><h2>نشاط مرتبط</h2><div class="lks">${rel}</div></section>` : ""}${sugg(it, lv)}<p><a class="abtn" href="../?lv=${lv}">بنك الأنشطة</a></p>`;
    $("#dl").onclick = () => { S.bank.started[it.slug] = Date.now(); save(); };
    $("#dn").onclick = () => { if (isDone(it.slug)) return; S.bank.started[it.slug] = S.bank.started[it.slug] || Date.now(); const r = complete(it, 0, 1); $("#dn").textContent = "✓ أنجزنا هذه الورقة"; toast("أحسنت! تم تسجيل الإنجاز." + (r.got.length ? " شارة جديدة: " + r.got[0] : "")); };
    return;
  }
  box.innerHTML = `${head}<section class="art" id="stage"><h2>تعليمات</h2><p class="tx" id="ins">${esc(it.instr)}</p><div class="bkex"><b>مثال:</b> ${esc(EX[it.type])}</div><div class="vbtns"><button type="button" class="main" id="go">ابدأ النشاط</button></div></section><div id="area"></div><div id="resbox"></div>${sugg(it, lv)}<p><a class="abtn" href="../?lv=${lv}">بنك الأنشطة</a></p>`;
  $("#go").onclick = () => { S.bank.started[it.slug] = S.bank.started[it.slug] || Date.now(); save(); $("#stage").style.display = "none"; run(it, lv, rel); };
}
function sugg(it, lv) { const L = ITEMS.filter((x) => x.slug !== it.slug && x.levels.includes(lv) && x.type !== "link" && (x.skill === it.skill || x.cat === it.cat)).sort((a, b) => (isDone(a.slug) ? 1 : 0) - (isDone(b.slug) ? 1 : 0) || (b.skill === it.skill) - (a.skill === it.skill)).slice(0, 3); return L.length ? `<section class="art"><h2>أنشطة مقترحة</h2><div class="bkl">${L.map((x) => card(x, lv).replace('href="play/', 'href="./')).join("")}</div></section>` : ""; }
function run(it, lv, rel) {
  const area = $("#area"), res = $("#resbox"); let wrong = 0, total = 1; const hint = (t, g) => { const f = $("#fb"); if (f) { f.className = "fb " + (g ? "g" : "b"); f.textContent = t; } };
  const fin = (tot) => { const r = complete(it, wrong, tot); area.innerHTML = ""; res.innerHTML = `<div class="res"><div class="st" aria-label="${r.stars} نجوم">${"⭐".repeat(r.stars)}</div><h2>${r.stars === 3 ? "ممتاز! أكملت النشاط بلا أخطاء" : "أحسنت! أكملت النشاط"}</h2><p>${r.first ? "حصلت على " + AD(r.pts) + " نقطة." : "أعدت النشاط وحصلت على " + AD(r.pts) + " نقاط."} مجموع نقاطك ${AD(S.bank.pts)}.</p>${r.got.length ? `<p class="bkbadge">🏅 شارة جديدة: <b>${esc(r.got.join("، "))}</b></p>` : ""}${r.stars < 3 ? '<p class="hint">يمكنك إعادة النشاط لتحصل على نجوم أكثر، فالتكرار يساعد على التعلم.</p>' : ""}<div class="btns"><button type="button" class="abtn" id="again">أعد النشاط</button>${rel}</div></div>`; $("#again").onclick = () => { res.innerHTML = ""; run(it, lv, rel); }; res.scrollIntoView({ block: "nearest" }); };
  const fbbox = '<div class="fb" id="fb" role="status"></div>';
  const T = it.type, d = it.data, t = (x) => fmt(x, it);
  if (T === "mcq") {
    let n = 0; total = d.qs.length;
    const ask = () => { const q = d.qs[n], o = shuf(q.o.map((x, i) => [x, i]));
      area.innerHTML = `<section class="art"><p class="hint">السؤال ${AD(n + 1)} من ${AD(total)}. يمكنك المحاولة أكثر من مرة.</p>${q.img ? `<img class="bkq" src="${icon(q.img)}" alt="">` : ""}${q.cnt ? `<div class="bkcnt" aria-label="مجموعة أشياء للعد">${Array.from({ length: q.cnt[1] }, () => `<img src="${icon(q.cnt[0])}" alt="" width="46" height="46">`).join("")}</div>` : ""}<div class="qq">${t(q.q)}</div>${q.say ? `<button type="button" class="bksay" id="say">🔊 استمع</button>` : ""}<div class="opts${q.oi ? " bkoi" : ""}">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${q.oi ? `<img src="${icon(q.oi[z[1]])}" alt="" width="56" height="56"><br>` : ""}${t(z[0])}</button>`).join("")}</div>${fbbox}</section>`;
      const sy = $("#say"); if (sy) sy.onclick = () => say(q.say, isEn(it));
      area.querySelectorAll(".opt").forEach((b) => (b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j];
        if (z[1] === 0) { b.classList.add("good"); area.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); hint(q.why, true); setTimeout(() => { n++; if (n < total) ask(); else fin(total); }, 1300); }
        else { wrong++; b.classList.add("bad"); b.disabled = true; hint("قريب! فكّر مرة أخرى وجرّب خيارا آخر.", false); } })); };
    ask();
  } else if (T === "match") {
    const P = d.pairs; total = P.length; let sel = null, done = 0;
    const L = shuf(P.map((x, i) => [x[0], i])), R = shuf(P.map((x, i) => [x, i]));
    area.innerHTML = `<section class="art"><p class="hint">${AD(done)} من ${AD(total)}</p><div class="bkm"><div class="bkml">${L.map(([tx, i]) => `<button type="button" class="bkn" data-l="${i}">${t(tx)}</button>`).join("")}</div><div class="bkmr">${R.map(([x, i]) => `<button type="button" class="bkn bkr" data-r="${i}">${x[2] ? `<img src="${icon(x[2])}" alt="" width="50" height="50">` : ""}<span>${t(x[1])}</span></button>`).join("")}</div></div>${fbbox}</section>`;
    area.querySelectorAll("[data-l]").forEach((b) => (b.onclick = () => { if (b.disabled) return; area.querySelectorAll("[data-l]").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = +b.dataset.l; hint("اختر الآن ما يناسبه من العمود الآخر.", true); }));
    area.querySelectorAll("[data-r]").forEach((b) => (b.onclick = () => { if (b.disabled) return; if (sel == null) return hint("اختر أولا عنصرا من العمود الأول.", false);
      if (+b.dataset.r === sel) { b.disabled = true; b.classList.add("good"); const l = area.querySelector(`[data-l="${sel}"]`); l.disabled = true; l.classList.remove("sel"); l.classList.add("good"); sel = null; done++; $(".hint", area).textContent = AD(done) + " من " + AD(total); hint("صحيح! أحسنت.", true); if (done === total) setTimeout(() => fin(total), 900); }
      else { wrong++; b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 600); hint("ليس هذا، جرّب غيره بهدوء.", false); } }));
  } else if (T === "order") {
    const I = d.items; total = I.length; let k = 0; const tiles = shuf(I.map((x, i) => [x, i]));
    area.innerHTML = `<section class="art"><p class="hint">اضغط العناصر بالترتيب الصحيح.</p><div class="bkans" id="ans" aria-label="الترتيب الذي اخترته"></div><div class="bkpool" id="pool">${tiles.map(([x, i]) => `<button type="button" class="bkt2" data-i="${i}">${x.i ? `<img src="${icon(x.i)}" alt="" width="52" height="52"><br>` : ""}${t(x.t)}</button>`).join("")}</div>${fbbox}</section>`;
    area.querySelectorAll(".bkt2").forEach((b) => (b.onclick = () => { if (b.disabled) return; if (+b.dataset.i === k) { b.disabled = true; b.classList.add("good"); const c = b.cloneNode(true); c.disabled = true; $("#ans").appendChild(c); b.style.visibility = "hidden"; k++; hint("صحيح!", true); if (k === total) setTimeout(() => fin(total), 900); } else { wrong++; b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 600); hint(k === 0 ? "ليس هذا هو الأول، جرّب غيره." : "ليس هذا هو التالي، فكّر وجرّب غيره.", false); } }));
  } else if (T === "sort") {
    const G = d.groups, items = shuf(G.flatMap((g, gi) => g.items.map((x) => [x, gi]))); total = items.length; let sel = null, placed = 0;
    area.innerHTML = `<section class="art"><p class="hint">اضغط عنصرا ثم اضغط مجموعته.</p><div class="bkpool" id="pool">${items.map(([x, gi], i) => `<button type="button" class="bkt2" data-i="${i}">${x.i ? `<img src="${icon(x.i)}" alt="" width="46" height="46"><br>` : ""}${t(x.t)}</button>`).join("")}</div><div class="bkg">${G.map((g, gi) => `<button type="button" class="bkgp" data-g="${gi}">${g.i ? `<img src="${icon(g.i)}" alt="" width="40" height="40">` : ""}<b>${t(g.n)}</b><span class="bkgi" data-in="${gi}"></span></button>`).join("")}</div>${fbbox}</section>`;
    area.querySelectorAll(".bkt2").forEach((b) => (b.onclick = () => { if (b.disabled) return; area.querySelectorAll(".bkt2").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = +b.dataset.i; hint("اضغط الآن المجموعة المناسبة.", true); }));
    area.querySelectorAll(".bkgp").forEach((g) => (g.onclick = () => { if (sel == null) return hint("اختر أولا عنصرا.", false); const [x, gi] = items[sel], b = area.querySelector(`.bkt2[data-i="${sel}"]`);
      if (+g.dataset.g === gi) { b.disabled = true; b.style.visibility = "hidden"; g.querySelector(".bkgi").insertAdjacentHTML("beforeend", `<em>${t(x.t)}</em>`); sel = null; placed++; hint("صحيح!", true); if (placed === total) setTimeout(() => fin(total), 900); }
      else { wrong++; g.classList.add("bad"); setTimeout(() => g.classList.remove("bad"), 600); hint("ليس هنا، فكّر وجرّب مجموعة أخرى.", false); } }));
  } else if (T === "memory") {
    const P = d.pairs; total = P.length; let open = [], matched = 0, lock = false;
    const cards = shuf(P.flatMap((x, i) => [{ k: i, t: "i", i: x[1] }, { k: i, t: "t", s: x[0] }]));
    area.innerHTML = `<section class="art"><p class="hint">${AD(matched)} من ${AD(total)} أزواج</p><div class="bkmem">${cards.map((c, j) => `<button type="button" class="bkcard" data-j="${j}" aria-label="بطاقة مغلقة"><span class="bkback">؟</span><span class="bkface">${c.t === "i" ? `<img src="${icon(c.i)}" alt="" width="52" height="52">` : t(c.s)}</span></button>`).join("")}</div>${fbbox}</section>`;
    area.querySelectorAll(".bkcard").forEach((b) => (b.onclick = () => { if (lock || b.classList.contains("up") || b.classList.contains("good")) return; b.classList.add("up"); open.push(b);
      if (open.length === 2) { const [a, c] = open.map((x) => cards[+x.dataset.j]); lock = true;
        if (a.k === c.k && a.t !== c.t) { open.forEach((x) => { x.classList.remove("up"); x.classList.add("good"); }); open = []; lock = false; matched++; $(".hint", area).textContent = AD(matched) + " من " + AD(total) + " أزواج"; hint("زوج صحيح! أحسنت.", true); if (matched === total) setTimeout(() => fin(total), 900); }
        else { wrong++; hint("لا بأس، تذكر أماكن البطاقات وجرّب مرة أخرى.", false); setTimeout(() => { open.forEach((x) => x.classList.remove("up")); open = []; lock = false; }, 900); } } }));
  } else if (T === "color") {
    const PAL = [["red", "#e53935", "أحمر"], ["blue", "#1e88e5", "أزرق"], ["green", "#43a047", "أخضر"], ["yellow", "#fdd835", "أصفر"], ["orange", "#fb8c00", "برتقالي"], ["purple", "#8e24aa", "بنفسجي"], ["brown", "#795548", "بني"], ["pink", "#f06292", "وردي"]];
    const tasks = d.tasks; total = tasks.length; let cur = null; const okT = new Set();
    area.innerHTML = `<section class="art"><ul class="bktask" id="tl">${tasks.map((x, i) => `<li data-t="${i}">${esc(x.n)}</li>`).join("")}</ul><div class="bkpal" role="group" aria-label="الألوان">${PAL.map(([k, h, n]) => `<button type="button" class="bkcol" data-c="${k}" style="background:${h}" aria-label="${n}" title="${n}"></button>`).join("")}</div><div class="bkpic" id="pic">${(W.BANK_PICS || {})[d.pic] || ""}</div>${fbbox}</section>`;
    const hex = Object.fromEntries(PAL.map((x) => [x[0], x[1]])), nm = Object.fromEntries(PAL.map((x) => [x[0], x[2]]));
    area.querySelectorAll(".bkcol").forEach((b) => (b.onclick = () => { cur = b.dataset.c; area.querySelectorAll(".bkcol").forEach((x) => x.classList.toggle("sel", x === b)); hint("اللون المختار: " + nm[cur] + ". اضغط الآن الجزء المطلوب.", true); }));
    area.querySelectorAll(".pt").forEach((el) => { el.style.cursor = "pointer"; el.addEventListener("click", () => { if (!cur) return hint("اختر لونا أولا.", false); el.style.fill = hex[cur]; el.dataset.col = cur; const p = el.dataset.p; tasks.forEach((x, i) => { if (x.p !== p) return; const all = Array.from(area.querySelectorAll(`.pt[data-p="${p}"]`)); if (all.every((e) => e.dataset.col === x.c)) { if (!okT.has(i)) { okT.add(i); area.querySelector(`[data-t="${i}"]`).classList.add("good"); hint("ممتاز! " + x.n + ".", true); } } else { if (okT.has(i)) { okT.delete(i); area.querySelector(`[data-t="${i}"]`).classList.remove("good"); } if (el.dataset.col !== x.c) { wrong++; hint("هذا الجزء لونه " + { red: "أحمر", blue: "أزرق", green: "أخضر", yellow: "أصفر", orange: "برتقالي", purple: "بنفسجي", brown: "بني", pink: "وردي" }[x.c] + "، جرّب لونا آخر.", false); } } }); if (okT.size === total) setTimeout(() => fin(total), 900); }); });
  }
}
function progressPage() {
  const box = $("#aview"), lv = getLv(), B = S.bank, ds = ITEMS.filter((x) => B.done[x.slug]), st = ITEMS.filter((x) => B.started[x.slug] && !B.done[x.slug] && x.type !== "link");
  const forL = forLv(lv).filter((x) => x.type !== "link"), skills = {}; forL.forEach((x) => { const s = (skills[x.skill] = skills[x.skill] || { t: 0, d: 0 }); s.t++; if (B.done[x.slug]) s.d++; });
  const subj = {}; ITEMS.filter((x) => B.started[x.slug] || B.done[x.slug]).forEach((x) => (subj[x.subject] = (subj[x.subject] || 0) + 1));
  const review = ds.filter((x) => B.done[x.slug].last >= 2).slice(0, 6), practiced = Array.from(new Set(ds.map((x) => x.skill)));
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة المتابعة: بنك الأنشطة</h1><p>تقدم الطفل في أنشطته هو، دون مقارنته بأي طفل آخر. كل خطوة إنجاز.</p></div></div>
<div class="pg2"><div><b>${AD(ds.length)}</b>نشاطا مكتملا</div><div><b>${AD(st.length)}</b>بدأها ولم يكملها</div><div><b>${AD(practiced.length)}</b>مهارة تدرب عليها</div><div><b>${AD(B.pts)}</b>نقطة</div></div>
<section class="art"><h2>الشارات والإنجازات</h2><div class="bkbs">${BADGES.map(([id, n, d]) => `<div class="bkbd${B.badges[id] ? " on" : ""}"><span>${B.badges[id] ? "🏅" : "🔒"}</span><b>${esc(n)}</b><small>${esc(d)}</small></div>`).join("")}</div></section>
<section class="art"><h2>أنشطة بدأها ولم يكملها</h2>${st.length ? `<div class="lks">${st.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div>` : `<p class="tx">لا توجد أنشطة غير مكتملة.</p>`}</section>
<section class="art"><h2>التقدم في كل مهارة (لمرحلة ${esc(LV[lv])})</h2><div class="sks">${Object.entries(skills).map(([k, v]) => `<div><span>${esc(k)}</span><b>${v.d === 0 ? "لم يبدأ بعد" : v.d === v.t ? "أنهى كل أنشطتها ✓" : "أكمل " + AD(v.d) + " من " + AD(v.t)}</b><div class="bar"><i style="width:${Math.round((v.d / v.t) * 100)}%"></i></div></div>`).join("")}</div><p class="hint">إكمال النشاط لا يعني الإتقان وحده؛ كرر الأنشطة واحرص على الحوار مع الطفل.</p></section>
<section class="art"><h2>المواد الأكثر استخداما</h2>${Object.keys(subj).length ? `<div class="sks">${Object.entries(subj).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<div><span>${esc(k)}</span><b>${AD(n)} أنشطة</b></div>`).join("")}</div>` : `<p class="tx">ستظهر المواد بعد بدء الأنشطة.</p>`}</section>
<section class="art"><h2>أنشطة مقترحة للمراجعة</h2>${review.length ? `<p class="hint">أنشطة احتاج فيها الطفل إلى محاولات أكثر، والإعادة تثبت المعلومة.</p><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div>` : `<p class="tx">لا توجد أنشطة تحتاج إلى مراجعة الآن.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط ولا تُرسل إلى أي حساب.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح بيانات هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">بنك الأنشطة</a><a class="abtn" href="../guide/">دليل ولي الأمر</a></div>`;
  let arm = false; $("#rst").onclick = () => { if (!arm) { arm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد"; return; } S.bank = { done: {}, started: {}, badges: {}, pts: 0 }; save(); progressPage(); toast("تم المسح."); };
}
function guidePage() {
  $("#aview").innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر والمعلم</h1><p>كيف نختار النشاط المناسب ونستفيد منه.</p></div></div>
<section class="art"><h2>كيف تختار النشاط؟</h2><ul class="tx"><li>اختر مرحلة الطفل، ثم المجال، ثم المهارة التي يحتاج إلى تدريب إضافي عليها.</li><li>ابدأ بالسهل ثم انتقل إلى المتوسط والمتقدم، والصعوبة تختلف بحسب العمر والصف.</li><li>جلوسك مع الطفل أثناء النشاط يرفع فائدته.</li></ul></section>
<section class="art"><h2>أنواع الأنشطة</h2><ul class="tx"><li><b>تفاعلية:</b> اختيار من متعدد، توصيل، ترتيب، تصنيف، ذاكرة، تلوين. تعمل بالضغط على الشاشة (لا يوجد سحب وإفلات).</li><li><b>أوراق عمل PDF:</b> تُطبع بحجم A4، وبعضها معه صفحة إجابات لولي الأمر.</li><li><b>أنشطة في أقسام أخرى:</b> روابط إلى المصدر الأصلي دون تكرار المحتوى.</li></ul></section>
<section class="art"><h2>التقدم والشارات</h2><p class="tx">يحصل الطفل على نجوم ونقاط وشارات تشجيعية، ويمكنه إعادة أي نشاط. لا مقارنة بين الأطفال، والبيانات محفوظة في هذا الجهاز فقط.</p></section>
<section class="art"><h2>الجودة والأمان</h2><p class="tx">كل الأنشطة أصلية من إنتاج زاد، وفُحصت إجاباتها آليا، ولم يراجعها مختص لغوي أو تربوي بعد. القص بالمقص يكون بمقص آمن وبإشراف شخص كبير.</p></section>
<div class="btns"><a class="abtn go" href="../">بنك الأنشطة</a></div>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else hubPage(); })();
})();
