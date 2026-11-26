/* المشاريع والتحديات التعليمية - زاد: مشاريع بخطوات مصورة وتوثيق إنجاز + تحديات تفاعلية قصيرة. التقدم والملاحظات محفوظة في هذا الجهاز فقط. */
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
const PCATS = { science: ["العلوم والاستكشاف", "i_microscope"], math: ["الرياضيات", "i_numbers"], arabic: ["اللغة العربية والقراءة والكتابة", "u_abc"], english: ["اللغة الإنجليزية", "i_globe"], art: ["الفنون والإبداع", "i_palette"], nature: ["البيئة والنظافة", "i_tree"], life: ["المهارات الحياتية", "i_clock"], multi: ["متعدد المجالات", "i_puzzle"] };
const CCATS = { observe: ["الملاحظة والاكتشاف", "i_search"], think: ["الألغاز والتفكير", "i_brain"], words: ["اللغة والكلمات", "u_abc"], numbers: ["الأرقام والأنماط", "i_n1"], create: ["الإبداع الفني", "i_brush"] };
const CATS = Object.assign({}, PCATS, CCATS);
const DIFF = { easy: "سهل", mid: "متوسط", adv: "متقدم" };
const KIND = { project: "مشروع", challenge: "تحدٍّ" };
const SPAN = { short: "قصير", weekly: "أسبوعي", monthly: "شهري" };
const spanOf = (x) => (x.kind === "project" && SPAN[x.span] ? x.span : "short");
const LVK = Object.keys(LV);
const ageLbl = (x) => { const k = LVK.filter((l) => (x.levels || []).includes(l)); return !k.length ? "" : k.length === 1 ? LV[k[0]] : LV[k[0]] + " إلى " + LV[k[k.length - 1]]; };
const nowMs = () => (W.__pjNow ? +W.__pjNow : Date.now());
const isNew = (x) => !!x.created_at && nowMs() - new Date(x.created_at).getTime() <= 14 * 864e5;
const FLOW = ["اكتشف", "جهّز الأدوات", "ابدأ التنفيذ", "أنجز", "فكّر", "احفظ إنجازك"];
const GEN_REFLECT = "ما أكثر شيء أعجبك في مشروعك؟ وماذا ستفعل بشكل مختلف في المرة القادمة؟";
const GEN_PARENT = "ابقَ قريبا من طفلك، واسأله أسئلة مفتوحة مثل «ماذا تلاحظ؟» و«ماذا ستفعل بعد ذلك؟» ولا تنفذ العمل بدلا عنه. شجّعه على محاولته، ولا تقارنه بغيره.";
const LK = "zad-learn-v3", SK = "zad-proj-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; const b = (S.proj = S.proj || {}); b.done = b.done || {}; b.started = b.started || {}; b.badges = b.badges || {}; b.steps = b.steps || {}; b.pts = b.pts || 0; b.favs = b.favs || {}; b.flow = b.flow || {};
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
let ITEMS = [];
async function load() { try { ITEMS = await rest("proj_items?status=eq.published&order=sort_order.asc&select=slug,kind,cat,type,title,icon,levels,subject,skill,difficulty,descr,instr,minutes,data,link,sort_order,span,created_at"); try { localStorage.setItem("zad-proj-cache", JSON.stringify(ITEMS)); } catch {} } catch { try { ITEMS = JSON.parse(localStorage.getItem("zad-proj-cache") || "[]"); } catch { ITEMS = []; } } return ITEMS; }
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 3200); }
const isDone = (s) => !!S.proj.done[s], isEn = (it) => it.cat === "english";
const fmt = (t, it) => { let s = esc(t); if (!isEn(it)) s = s.replace(/\d+(?:\s*[+−×÷=]\s*\d+)+/g, (m) => `<bdi dir="ltr">${m}</bdi>`).replace(/\d+/g, (d) => AD(d)); return s; };
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W;
function say(text, en) { if (!tts) return toast("الصوت غير متاح على هذا الجهاز."); try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = en ? "en-US" : "ar-SA"; u.rate = 0.8; speechSynthesis.speak(u); } catch { toast("تعذر تشغيل الصوت."); } }
W.addEventListener("pagehide", () => { if (tts) try { speechSynthesis.cancel(); } catch {} });
/* ===== الشارات ===== */
const BADGES = [["p1", "أول مشروع", "أكملت مشروعك الأول", (s) => s.proj >= 1], ["p3", "٣ مشاريع", "أكملت ثلاثة مشاريع", (s) => s.proj >= 3], ["p6", "٦ مشاريع", "أكملت ستة مشاريع", (s) => s.proj >= 6], ["c1", "أول تحدٍّ", "أكملت تحديك الأول", (s) => s.ch >= 1], ["c5", "٥ تحديات", "أكملت خمسة تحديات", (s) => s.ch >= 5], ["perfect", "تحدٍّ بلا أخطاء", "أنهيت تحديا من أول محاولة", (s) => s.perfect >= 1], ["multi", "مستكشف المجالات", "أكملت مشاريع في ثلاثة مجالات", (s) => s.cats >= 3], ["skills", "متعلم المهارات", "تدربت على خمس مهارات", (s) => s.skills >= 5]];
function stats() { const d = S.proj.done, ks = Object.keys(d).map((k) => ITEMS.find((i) => i.slug === k)).filter(Boolean), P = ks.filter((i) => i.kind === "project"), C = ks.filter((i) => i.kind === "challenge"); return { proj: P.length, ch: C.length, perfect: C.filter((i) => d[i.slug].best === 3).length, cats: new Set(P.map((i) => i.cat)).size, skills: skillSet().size }; }
function skillSet() { const d = S.proj.done, st = new Set(); Object.keys(d).forEach((k) => { const it = ITEMS.find((i) => i.slug === k); if (!it) return; st.add(it.skill); (d[k].skills || []).forEach((x) => st.add(x)); }); return st; }
function awardBadges() { const st = stats(), got = []; BADGES.forEach(([id, n, , f]) => { if (!S.proj.badges[id] && f(st)) { S.proj.badges[id] = Date.now(); got.push(n); } }); return got; }
function complete(it, wrong, total, extra) { const first = !isDone(it.slug), stars = it.kind === "project" ? 3 : wrong === 0 ? 3 : wrong <= Math.max(2, Math.floor(total / 2)) ? 2 : 1; const r = (S.proj.done[it.slug] = S.proj.done[it.slug] || { d: 0, w: 0, best: 0, t: 0, last: 0 }); r.d++; r.w += wrong; r.last = wrong; r.best = Math.max(r.best, stars); r.t = Date.now(); if (extra) { if (extra.note != null) r.note = extra.note; if (extra.skills) r.skills = extra.skills; } const pts = it.kind === "project" ? (first ? 15 : 4) : first ? 10 + stars * 2 : 3; S.proj.pts += pts; const got = awardBadges(); save(); return { first, stars, pts, got }; }
/* ===== واجهات ===== */
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${Object.keys(LV).map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
const forLv = (lv) => ITEMS.filter((x) => x.levels.includes(lv));
const btnLabel = (x) => (x.kind === "project" ? "ابدأ المشروع" : "ابدأ التحدي");
const hrefOf = (x, lv) => `play/?s=${encodeURIComponent(x.slug)}&lv=${lv}`;
const timeBand = (m) => (m <= 10 ? "short" : m <= 25 ? "mid" : "long");
const favBtn = (x) => { const on = !!S.proj.favs[x.slug]; return `<button type="button" class="bkfav${on ? " on" : ""}" data-fav="${esc(x.slug)}" aria-pressed="${on}">${on ? "★ في المفضلة" : "☆ حفظ في المفضلة"}</button>`; };
function card(x, lv) { const d = S.proj.done[x.slug], sp = spanOf(x), ag = ageLbl(x); return `<div class="bkc${d ? " done" : ""}" data-slug="${esc(x.slug)}"><img src="${icon(x.icon)}" alt="" width="56" height="56"><div class="bkb"><b>${esc(x.title)}</b><span class="bkd">${esc(x.descr)}</span><span class="bkt"><i>${KIND[x.kind]}${sp !== "short" ? " " + SPAN[sp] : ""}</i>${ag ? `<i>${esc(ag)}</i>` : ""}<i>${esc(DIFF[x.difficulty])}</i>${x.minutes ? `<i>${AD(x.minutes)} دقيقة${sp !== "short" ? " للجلسة" : ""}</i>` : ""}<i>${esc(x.skill)}</i>${isNew(x) ? '<i class="nw">جديد</i>' : ""}${d ? '<i class="ok">✓ أنجزته</i>' : S.proj.started[x.slug] ? '<i class="st">بدأته</i>' : ""}</span></div><a class="bkgo" href="${hrefOf(x, lv)}" data-start="${esc(x.slug)}">${btnLabel(x)}</a>${x.kind === "project" ? favBtn(x) : ""}</div>`; }
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(); setLv(lv);
  const all = forLv(lv), young = lv === "a2" || lv === "a3";
  const subs = Array.from(new Set(all.map((x) => x.subject))), skills = Array.from(new Set(all.map((x) => x.skill)));
  const sel = (id, lab, opts, v) => `<select id="${id}" aria-label="${lab}"><option value="">${lab}</option>${opts.map(([k, l]) => `<option value="${esc(k)}"${v === k ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const cont = all.filter((x) => S.proj.started[x.slug] && !isDone(x.slug)).slice(0, 4);
  box.innerHTML = `<div class="hero"><img src="${icon("i_rocket")}" alt=""><div><h1>المشاريع والتحديات التعليمية</h1><p>نتعلم بالتجربة والتطبيق: مشاريع بسيطة بخطوات مصورة وتحديات قصيرة ممتعة.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: أنشطة قصيرة وبسيطة بمشاركة شخص بالغ طوال الوقت." : "تُعرض المشاريع والتحديات المناسبة لهذه المرحلة، ويُنصح بوجود شخص بالغ مع المشاريع التي تحتاج إلى ذلك."}</p></div>
<div class="bkcats" id="bkcats">${Object.entries(CATS).map(([k, [l, i]]) => `<button type="button" class="bkct" data-cat="${k}"><img src="${icon(i)}" alt="" width="40" height="40"><b>${esc(l)}</b><small>${AD(all.filter((x) => x.cat === k).length)} ${PCATS[k] ? "مشاريع" : "تحديات"}</small></button>`).join("")}</div>
<section class="art"><h2>ابحث وصفِّ</h2><input class="vsearch" id="bq" type="search" placeholder="ابحث باسم المشروع أو التحدي أو مهارته" aria-label="بحث" value="${esc(p.get("q") || "")}"><div class="vfil">${sel("fk", "النوع", [["project", "مشاريع"], ["challenge", "تحديات"]], p.get("k") || "")}${sel("fc", "المجال", Object.entries(CATS).map(([k, v]) => [k, v[0]]), p.get("c") || "")}${sel("fs", "المادة الدراسية", subs.map((s) => [s, s]))}${sel("fl", "المهارة المستهدفة", skills.map((s) => [s, s]))}${sel("fd", "مستوى الصعوبة", Object.entries(DIFF))}${sel("fm", "زمن الجلسة", [["short", "حتى ١٠ دقائق"], ["mid", "من ١١ إلى ٢٥ دقيقة"], ["long", "أكثر من ٢٥ دقيقة"]])}${sel("fsp", "مدة المشروع", [["short", "قصير (جلسة واحدة)"], ["weekly", "أسبوعي"], ["monthly", "شهري"]])}</div><div class="vbtns"><button type="button" class="chip" id="fnew" aria-pressed="false">✨ المشاريع الجديدة (آخر ١٤ يوما)</button><button type="button" class="chip" id="ffav" aria-pressed="false">★ المفضلة فقط</button><button type="button" id="fclr">إلغاء التصفية والعودة إلى الكل</button></div></section>
<div id="bkres" aria-live="polite"></div>
${cont.length ? `<section class="art" id="bkcont"><h2>أكمل ما بدأت</h2><div class="bkl">${cont.map((x) => card(x, lv)).join("")}</div></section>` : ""}
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة المتابعة</a><a class="abtn" href="guide/">دليل ولي الأمر والسلامة</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
  const IDS = ["#bq", "#fk", "#fc", "#fs", "#fl", "#fd", "#fm", "#fsp"]; let NW = false, FV = false;
  const f = () => { const q = $("#bq").value.trim(), k = $("#fk").value, c = $("#fc").value, s = $("#fs").value, l = $("#fl").value, d = $("#fd").value, m = $("#fm").value, sp = $("#fsp").value, on = q || k || c || s || l || d || m || sp || NW || FV;
    const L = all.filter((x) => (!q || (x.title + " " + x.skill + " " + x.descr).includes(q)) && (!k || x.kind === k) && (!c || x.cat === c) && (!s || x.subject === s) && (!l || x.skill === l) && (!d || x.difficulty === d) && (!m || (x.kind === "project" && timeBand(x.minutes) === m)) && (!sp || (x.kind === "project" && spanOf(x) === sp)) && (!NW || isNew(x)) && (!FV || S.proj.favs[x.slug]));
    D.querySelectorAll(".bkct").forEach((b) => b.classList.toggle("on", b.dataset.cat === c));
    let h = on ? `<p class="hint">${AD(L.length)} نتيجة</p>${L.length ? `<div class="bkl">${L.map((x) => card(x, lv)).join("")}</div>` : `<div class="sempty"><h3>لا توجد نتائج بهذه الشروط</h3><p class="hint">غيّر الفلاتر أو اضغط إلغاء التصفية.</p></div>`}` : "";
    if (!on) { const grp = (h2, list) => list.length ? `<section class="art"><h2>${h2}</h2><div class="bkl">${list.map((x) => card(x, lv)).join("")}</div></section>` : ""; const wk = all.filter((x) => spanOf(x) === "weekly"), mo = all.filter((x) => spanOf(x) === "monthly");
      h = (wk.length || mo.length ? grp("مشاريع أسبوعية: نعمل قليلا كل يوم", wk) + grp("مشاريع شهرية: مراحل وتقدم تدريجي", mo) : `<section class="art" id="pjnospan"><h2>مشاريع أسبوعية وشهرية</h2><p class="hint">لا توجد مشاريع أسبوعية أو شهرية منشورة لهذه المرحلة بعد. تظهر هنا فور نشرها بعد المراجعة.</p></section>`) + `<h2 class="pjh">المشاريع</h2>` + Object.entries(PCATS).map(([k, [l]]) => grp(l, all.filter((x) => x.kind === "project" && x.cat === k))).join("") + `<h2 class="pjh">التحديات القصيرة</h2>` + Object.entries(CCATS).map(([k, [l]]) => grp(l, all.filter((x) => x.kind === "challenge" && x.cat === k))).join(""); }
    $("#bkres").innerHTML = h; $("#bkcont") && ($("#bkcont").style.display = on ? "none" : ""); };
  IDS.forEach((i) => ($(i).oninput = f));
  const tg = (id, get, set) => { const b = $(id); b.onclick = () => { set(!get()); b.classList.toggle("on", get()); b.setAttribute("aria-pressed", get()); f(); }; };
  tg("#fnew", () => NW, (v) => (NW = v)); tg("#ffav", () => FV, (v) => (FV = v));
  W.__pjRefresh = f;
  $("#fclr").onclick = () => { IDS.forEach((i) => ($(i).value = "")); NW = FV = false; ["#fnew", "#ffav"].forEach((i) => { $(i).classList.remove("on"); $(i).setAttribute("aria-pressed", "false"); }); f(); };
  D.querySelectorAll(".bkct").forEach((b) => (b.onclick = () => { $("#fc").value = $("#fc").value === b.dataset.cat ? "" : b.dataset.cat; f(); $("#bkres").scrollIntoView({ block: "start" }); }));
  f();
}
/* ===== صفحة المشروع أو التحدي ===== */
const EX = { mcq: "اختر الإجابة الصحيحة بالضغط عليها.", match: "اضغط عنصرا من العمود الأول ثم ما يناسبه من العمود الثاني.", order: "اضغط العناصر بالترتيب الصحيح من الأول إلى الأخير.", sort: "اضغط العنصر ثم اضغط المجموعة التي ينتمي إليها.", memory: "اقلب بطاقتين، فإذا تطابقتا بقيتا مفتوحتين.", color: "اختر لونا من الألوان ثم اضغط الجزء المطلوب في الرسمة.", diff: "قارن الصورتين ثم اضغط الشيء المختلف في الصورة الثانية." };
function playPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = ITEMS.find((x) => x.slug === p.get("s"));
  if (!it) return (box.innerHTML = `<div class="sempty"><h3>العنصر غير موجود أو غير منشور</h3><p><a class="abtn go" href="../">المشاريع والتحديات</a></p></div>`);
  const rel = it.link && it.link.href ? `<a class="abtn go" id="rel" href="${ROOT}${esc(it.link.href)}">انتقل إلى: ${esc(it.link.label)}</a>` : "";
  const head = `<div class="sgp"><img class="big" src="${icon(it.icon)}" alt="" style="max-width:110px"><h1 style="margin:6px 0">${esc(it.title)}</h1><div class="vmeta"><span>${KIND[it.kind]}${spanOf(it) !== "short" ? " " + SPAN[spanOf(it)] : ""}</span><span>${esc(DIFF[it.difficulty])}</span><span>${esc(it.subject)}</span><span id="pjage">${esc(ageLbl(it) || LV[lv])}</span>${it.minutes ? `<span>${AD(it.minutes)} دقيقة ${spanOf(it) !== "short" ? "للجلسة" : "تقريبا"}</span>` : ""}</div><p class="hint"><b>المهارة:</b> ${esc(it.skill)}</p>${it.kind === "project" ? `<div class="vbtns">${favBtn(it)}</div>` : ""}</div>`;
  const foot = `${sugg(it, lv)}<p><a class="abtn" href="../?lv=${lv}">المشاريع والتحديات</a></p>`;
  if (it.kind === "project") return projectView(box, it, lv, head, rel, foot);
  box.innerHTML = `${head}<section class="art" id="stage"><h2>تعليمات</h2><p class="tx" id="ins">${esc(it.instr)}</p><div class="bkex"><b>مثال:</b> ${esc(EX[it.type])}</div><div class="vbtns"><button type="button" class="main" id="go">ابدأ التحدي</button></div></section><div id="area"></div><div id="resbox"></div>${foot}`;
  $("#go").onclick = () => { S.proj.started[it.slug] = S.proj.started[it.slug] || Date.now(); save(); $("#stage").style.display = "none"; run(it, lv, rel); };
}
function sugg(it, lv) { const L = ITEMS.filter((x) => x.slug !== it.slug && x.levels.includes(lv) && (x.skill === it.skill || x.cat === it.cat)).sort((a, b) => (isDone(a.slug) ? 1 : 0) - (isDone(b.slug) ? 1 : 0) || (b.skill === it.skill) - (a.skill === it.skill)).slice(0, 3); return L.length ? `<section class="art"><h2>مقترحات مرتبطة</h2><div class="bkl">${L.map((x) => card(x, lv).replace('href="play/', 'href="./')).join("")}</div></section>` : ""; }
/* ===== منفذ خطوات المشروع ===== */
function projectView(box, it, lv, head, rel, foot) {
  const d = it.data, n = d.steps.length, t = (x) => fmt(x, it), sp = spanOf(it);
  const FL = (S.proj.flow[it.slug] = S.proj.flow[it.slug] || { st: 1, tl: [] });
  const stg = []; d.steps.forEach((s, i) => { if (s.g) { const L = stg[stg.length - 1]; if (L && L.g === s.g) L.n++; else stg.push({ g: s.g, n: 1, from: i + 1 }); } });
  const resv = (Array.isArray(d.res) ? d.res : []).filter((r) => r && r.href && r.label);
  const flowHtml = `<ol class="pjflow" id="pjflow" aria-label="مراحل المشروع">${FLOW.map((l, i) => `<li data-f="${i + 1}"><b>${AD(i + 1)}</b>${l}</li>`).join("")}</ol>`;
  let cur = S.proj.steps[it.slug] != null ? 3 : S.proj.done[it.slug] && !FL.tl.length ? 6 : Math.max(1, FL.st || 1);
  const setFlow = (k, keep) => { cur = k; if (!keep) { FL.st = Math.min(k, 3); save(); } D.querySelectorAll("#pjflow li").forEach((li) => { const f = +li.dataset.f; li.classList.toggle("done", f < k); li.classList.toggle("on", f === k); if (f === k) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current"); }); };
  const toolsHtml = d.tools.map((x, i) => `<li><label><input type="checkbox" class="pjtk" data-i="${i}"${FL.tl.includes(i) ? " checked" : ""}> <span>${t(x)}</span></label></li>`).join("");
  const stgHtml = stg.length ? `<h2>${sp === "monthly" ? "مراحل المشروع" : "أيام المشروع"}</h2><ol class="tx pjstg">${stg.map((x) => `<li><b>${esc(x.g)}</b> <small>(${AD(x.n)} ${x.n === 1 ? "خطوة" : "خطوات"})</small></li>`).join("")}</ol>` : "";
  const prStep = (() => { let last = "", h = ""; d.steps.forEach((s, i) => { if (s.g && s.g !== last) { last = s.g; h += `<h3>${esc(s.g)}</h3>`; } h += `<p>${AD(i + 1)}. ${t(s.t)}${s.p ? ` <em>(للوالدين: ${t(s.p)})</em>` : ""}</p>`; }); return h; })();
  const printBox = `<section class="pjprint" id="pjprint"><h1>${esc(it.title)}</h1><p>${esc(ageLbl(it))} · ${SPAN[sp]}${it.minutes ? " · " + AD(it.minutes) + " دقيقة" + (sp !== "short" ? " للجلسة" : "") : ""}</p><h2>الهدف</h2><p>${t(d.goal)}</p><h2>الأدوات</h2><ul>${d.tools.map((x) => `<li>☐ ${t(x)}</li>`).join("")}</ul><h2>تعليمات السلامة</h2><p>${t(d.safety)}</p>${d.adult ? "<p>يُنفذ هذا المشروع بمشاركة شخص بالغ.</p>" : ""}<h2>الخطوات</h2>${prStep}<h2>دور ولي الأمر</h2><p>${t(d.parent || GEN_PARENT)}</p><h2>سؤال للتفكير</h2><p>${t(d.reflect || GEN_REFLECT)}</p><p>................................................................</p><p class="pjfoot">منصة زاد التعليمية — إنجاز الطفل يُحفظ في هذا الجهاز فقط.</p></section>`;
  const pre = `${head}<div class="vbtns pjtopbtns"><button type="button" class="abtn" id="pjprintbtn">🖨 اطبع التعليمات</button></div>${flowHtml}<section class="art" id="stage"><h2>هدف المشروع</h2><p class="tx">${t(d.goal)}</p>${d.adult ? `<div class="pjadult">👨‍👩‍👧 هذا المشروع يُنفذ بمشاركة شخص بالغ.</div>` : ""}${stgHtml}<h2>الأدوات المطلوبة</h2><ul class="tx pjtools">${toolsHtml}</ul><p class="hint">كلها أشياء متوفرة في البيت، ولا حاجة إلى شراء شيء خاص. علّم على ما جهّزته.</p><div class="pjsafe"><b>⚠️ تعليمات السلامة</b><p>${t(d.safety)}</p></div><h2>ما سنتعلمه</h2><p class="tx">${t(d.outcome)}</p><div class="pjrole"><b>دور ولي الأمر</b><p>${t(d.parent || GEN_PARENT)}</p></div><div class="vbtns"><button type="button" class="main" id="go">${S.proj.steps[it.slug] != null ? "تابع من حيث توقفت" : "ابدأ التنفيذ"}</button></div></section><div id="area"></div><div id="resbox"></div>${resv.length || rel ? `<section class="art" id="pjres"><h2>موارد من المكتبة</h2><div class="lks">${resv.map((r) => `<a class="abtn" href="${ROOT}${esc(r.href)}">${esc(r.label)}</a>`).join("")}${rel}</div></section>` : ""}${foot}${printBox}`;
  box.innerHTML = pre;
  const area = $("#area"); setFlow(cur, true);
  D.querySelectorAll(".pjtk").forEach((c) => (c.onchange = () => { const i = +c.dataset.i, j = FL.tl.indexOf(i); if (c.checked && j < 0) FL.tl.push(i); if (!c.checked && j >= 0) FL.tl.splice(j, 1); if (FL.tl.length && cur < 2) setFlow(2); else save(); }));
  $("#pjprintbtn").onclick = () => { try { W.print(); } catch {} };
  const stepUI = (k) => { const s = d.steps[k]; S.proj.steps[it.slug] = k; setFlow(3);
    area.innerHTML = `<section class="art pjstep"><div class="pjbar" role="progressbar" aria-valuemin="1" aria-valuemax="${n}" aria-valuenow="${k + 1}"><i style="width:${Math.round(((k + 1) / n) * 100)}%"></i></div><p class="hint" id="pjcnt">الخطوة ${AD(k + 1)} من ${AD(n)}</p>${s.g ? `<p class="pjstage" id="pjstg">${esc(s.g)}</p>` : ""}<img class="pjimg" src="${icon(s.i)}" alt="" width="120" height="120"><div class="pjtxt" id="pjtxt">${t(s.t)}</div>${s.p ? `<div class="pjpar"><b>إرشاد للوالدين:</b> ${t(s.p)}</div>` : ""}${sp !== "short" && d.steps[k + 1] && d.steps[k + 1].g !== s.g ? `<div class="pjpause" id="pjpause">انتهت مرحلة «${esc(s.g)}». يمكنك التوقف الآن وإكمال المشروع لاحقا، فمكانك محفوظ في هذا الجهاز.</div>` : ""}<div class="pjnav"><button type="button" class="abtn" id="prev"${k === 0 ? " disabled" : ""}>→ الخطوة السابقة</button><button type="button" class="main" id="next">${k === n - 1 ? "انتهينا من الخطوات" : "الخطوة التالية ←"}</button></div></section>`;
    $("#prev").onclick = () => stepUI(k - 1);
    $("#next").onclick = () => (k === n - 1 ? questions() : stepUI(k + 1));
    area.scrollIntoView({ block: "nearest" }); };
  const questions = () => { setFlow(4, true); let qi = 0, wrong = 0; const ask = () => { const q = d.qs[qi], o = shuf(q.o.map((x, i) => [x, i]));
      area.innerHTML = `<section class="art"><h2>أسئلة بعد التنفيذ</h2><p class="hint">السؤال ${AD(qi + 1)} من ${AD(d.qs.length)}. يمكنك المحاولة أكثر من مرة.</p><div class="qq">${t(q.q)}</div><div class="opts">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${t(z[0])}</button>`).join("")}</div><div class="fb" id="fb" role="status"></div></section>`;
      area.querySelectorAll(".opt").forEach((b) => (b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j], f = $("#fb");
        if (z[1] === 0) { b.classList.add("good"); area.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); f.className = "fb g"; f.textContent = q.why; setTimeout(() => { qi++; if (qi < d.qs.length) ask(); else finish(wrong); }, 1300); }
        else { wrong++; b.classList.add("bad"); b.disabled = true; f.className = "fb b"; f.textContent = "قريب! فكّر مرة أخرى وجرّب خيارا آخر."; } })); };
    ask(); };
  const finish = (wrong) => { setFlow(5, true); const prev = S.proj.done[it.slug] || {}, chosen = new Set(prev.skills || []);
    area.innerHTML = `<section class="art pjfin"><h2>أكملنا المشروع!</h2><h3>فكّر في تجربتك</h3><p class="tx" id="pjref">${t(d.reflect || GEN_REFLECT)}</p><p class="hint">اكتب ملاحظة قصيرة أو أخبرها لشخص بالغ، واختر المهارة التي تعلمتها. هذه الخطوة اختيارية ولا ترفع أي صور.</p><label class="pjlab" for="note">ملاحظتي عن التجربة</label><textarea id="note" rows="3" maxlength="200" dir="auto" placeholder="مثال: أعجبني أن النبتة كبرت بسرعة">${esc(prev.note || "")}</textarea><p class="hint" id="cnt">${AD((prev.note || "").length)} من ٢٠٠ حرف</p><b class="pjlab">المهارة التي تعلمتها</b><div class="pjsk" id="sk">${d.skills.map((x) => `<button type="button" class="chip${chosen.has(x) ? " on" : ""}" data-k="${esc(x)}" aria-pressed="${chosen.has(x)}">${esc(x)}</button>`).join("")}</div><div class="vbtns"><button type="button" class="main" id="fin">✅ أكملت المشروع</button></div><p class="hint">الملاحظة والمهارة تُحفظان في هذا الجهاز فقط ولا تُنشر.</p></section>`;
    $("#note").oninput = () => ($("#cnt").textContent = AD($("#note").value.length) + " من ٢٠٠ حرف");
    area.querySelectorAll("#sk .chip").forEach((b) => (b.onclick = () => { const k = b.dataset.k; if (chosen.has(k)) chosen.delete(k); else chosen.add(k); b.classList.toggle("on", chosen.has(k)); b.setAttribute("aria-pressed", chosen.has(k)); }));
    $("#fin").onclick = () => { const r = complete(it, wrong, d.qs.length, { note: $("#note").value.trim().slice(0, 200), skills: Array.from(chosen) }); delete S.proj.steps[it.slug]; FL.st = 1; FL.tl = []; save(); setFlow(6, true);
      area.innerHTML = ""; $("#resbox").innerHTML = `<div class="res"><div class="st" aria-label="مشروع مكتمل">🏆</div><h2>أحسنت! أنجزت مشروعك</h2><p>${r.first ? "حصلت على " + AD(r.pts) + " نقطة." : "أعدت المشروع وحصلت على " + AD(r.pts) + " نقاط."} مجموع نقاطك ${AD(S.proj.pts)}.</p>${r.got.length ? `<p class="bkbadge">🏅 شارة جديدة: <b>${esc(r.got.join("، "))}</b></p>` : ""}<div class="btns"><button type="button" class="abtn" id="again">أعد المشروع</button>${rel}<a class="abtn go" href="../?lv=${lv}">مشروع آخر</a></div></div>`; $("#again").onclick = () => { $("#resbox").innerHTML = ""; $("#stage").style.display = ""; delete S.proj.steps[it.slug]; D.querySelectorAll(".pjtk").forEach((c) => (c.checked = false)); setFlow(1); }; $("#resbox").scrollIntoView({ block: "nearest" }); }; };
  $("#go").onclick = () => { S.proj.started[it.slug] = S.proj.started[it.slug] || Date.now(); save(); $("#stage").style.display = "none"; stepUI(Math.min(S.proj.steps[it.slug] || 0, n - 1)); };
  W.__pjSetFlow = setFlow;
}
/* ===== التحديات التفاعلية ===== */
function run(it, lv, rel) {
  const area = $("#area"), res = $("#resbox"); let wrong = 0, total = 1; const hint = (t, g) => { const f = $("#fb"); if (f) { f.className = "fb " + (g ? "g" : "b"); f.textContent = t; } };
  const fin = (tot) => { const r = complete(it, wrong, tot); area.innerHTML = ""; res.innerHTML = `<div class="res"><div class="st" aria-label="${r.stars} نجوم">${"⭐".repeat(r.stars)}</div><h2>${r.stars === 3 ? "ممتاز! أكملت التحدي بلا أخطاء" : "أحسنت! أكملت التحدي"}</h2><p>${r.first ? "حصلت على " + AD(r.pts) + " نقطة." : "أعدت التحدي وحصلت على " + AD(r.pts) + " نقاط."} مجموع نقاطك ${AD(S.proj.pts)}.</p>${r.got.length ? `<p class="bkbadge">🏅 شارة جديدة: <b>${esc(r.got.join("، "))}</b></p>` : ""}${r.stars < 3 ? '<p class="hint">يمكنك إعادة التحدي لتحصل على نجوم أكثر، فالتكرار يساعد على التعلم.</p>' : ""}<div class="btns"><button type="button" class="abtn" id="again">أعد التحدي</button>${rel}</div></div>`; $("#again").onclick = () => { res.innerHTML = ""; run(it, lv, rel); }; res.scrollIntoView({ block: "nearest" }); };
  const fbbox = '<div class="fb" id="fb" role="status"></div>';
  const T = it.type, d = it.data, t = (x) => fmt(x, it);
  if (T === "mcq") {
    let n = 0; total = d.qs.length;
    const ask = () => { const q = d.qs[n], o = shuf(q.o.map((x, i) => [x, i]));
      area.innerHTML = `<section class="art"><p class="hint">السؤال ${AD(n + 1)} من ${AD(total)}. يمكنك المحاولة أكثر من مرة.</p>${q.img ? `<img class="bkq" src="${icon(q.img)}" alt="">` : ""}${q.seq ? `<div class="pjseq" aria-label="نمط من الأشكال">${q.seq.map((x) => (x === "?" ? '<span class="pjq">؟</span>' : `<img src="${icon(x)}" alt="" width="46" height="46">`)).join("")}</div>` : ""}${q.cnt ? `<div class="bkcnt" aria-label="مجموعة أشياء للعد">${Array.from({ length: q.cnt[1] }, () => `<img src="${icon(q.cnt[0])}" alt="" width="46" height="46">`).join("")}</div>` : ""}<div class="qq">${t(q.q)}</div>${q.say ? `<button type="button" class="bksay" id="say">🔊 استمع</button>` : ""}<div class="opts${q.oi ? " bkoi" : ""}">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${q.oi ? `<img src="${icon(q.oi[z[1]])}" alt="" width="56" height="56"><br>` : ""}${t(z[0])}</button>`).join("")}</div>${fbbox}</section>`;
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
  } else if (T === "diff") {
    const R = d.rounds; total = R.length; let n = 0;
    const draw = () => { const r = R[n], right = r.base.map((x, i) => (i === r.idx ? r.alt : x)), cls = r.base.length === 4 ? " pj4" : "";
      area.innerHTML = `<section class="art"><p class="hint">المرحلة ${AD(n + 1)} من ${AD(total)}. اضغط الشيء المختلف في الصورة الثانية.</p><div class="pjdf"><div><b>الصورة الأولى</b><div class="pjg${cls}">${r.base.map((x) => `<span class="pjc"><img src="${icon(x)}" alt="" width="52" height="52"></span>`).join("")}</div></div><div><b>الصورة الثانية</b><div class="pjg${cls}">${right.map((x, i) => `<button type="button" class="pjc" data-i="${i}" aria-label="الخانة ${AD(i + 1)}"><img src="${icon(x)}" alt="" width="52" height="52"></button>`).join("")}</div></div></div>${fbbox}</section>`;
      area.querySelectorAll("[data-i]").forEach((b) => (b.onclick = () => { if (b.disabled) return;
        if (+b.dataset.i === r.idx) { b.classList.add("good"); area.querySelectorAll("[data-i]").forEach((x) => (x.disabled = true)); hint("وجدت الفرق! أحسنت.", true); setTimeout(() => { n++; if (n < total) draw(); else fin(total); }, 1100); }
        else { wrong++; b.classList.add("bad"); b.disabled = true; hint("ليس هذا، قارن بين الصورتين من جديد.", false); } })); };
    draw();
  } else if (T === "color") {
    const PAL = [["red", "#e53935", "أحمر"], ["blue", "#1e88e5", "أزرق"], ["green", "#43a047", "أخضر"], ["yellow", "#fdd835", "أصفر"], ["orange", "#fb8c00", "برتقالي"], ["purple", "#8e24aa", "بنفسجي"], ["brown", "#795548", "بني"], ["pink", "#f06292", "وردي"]];
    const tasks = d.tasks; total = tasks.length; let cur = null; const okT = new Set();
    area.innerHTML = `<section class="art"><ul class="bktask" id="tl">${tasks.map((x, i) => `<li data-t="${i}">${esc(x.n)}</li>`).join("")}</ul><div class="bkpal" role="group" aria-label="الألوان">${PAL.map(([k, h, n]) => `<button type="button" class="bkcol" data-c="${k}" style="background:${h}" aria-label="${n}" title="${n}"></button>`).join("")}</div><div class="bkpic" id="pic">${(W.BANK_PICS || {})[d.pic] || ""}</div>${fbbox}</section>`;
    const hex = Object.fromEntries(PAL.map((x) => [x[0], x[1]])), nm = Object.fromEntries(PAL.map((x) => [x[0], x[2]]));
    area.querySelectorAll(".bkcol").forEach((b) => (b.onclick = () => { cur = b.dataset.c; area.querySelectorAll(".bkcol").forEach((x) => x.classList.toggle("sel", x === b)); hint("اللون المختار: " + nm[cur] + ". اضغط الآن الجزء المطلوب.", true); }));
    area.querySelectorAll(".pt").forEach((el) => { el.style.cursor = "pointer"; el.addEventListener("click", () => { if (!cur) return hint("اختر لونا أولا.", false); el.style.fill = hex[cur]; el.dataset.col = cur; const p = el.dataset.p; tasks.forEach((x, i) => { if (x.p !== p) return; const all = Array.from(area.querySelectorAll(`.pt[data-p="${p}"]`)); if (all.every((e) => e.dataset.col === x.c)) { if (!okT.has(i)) { okT.add(i); area.querySelector(`[data-t="${i}"]`).classList.add("good"); hint("ممتاز! " + x.n + ".", true); } } else { if (okT.has(i)) { okT.delete(i); area.querySelector(`[data-t="${i}"]`).classList.remove("good"); } if (el.dataset.col !== x.c) { wrong++; hint("هذا الجزء لونه " + nm[x.c] + "، جرّب لونا آخر.", false); } } }); if (okT.size === total) setTimeout(() => fin(total), 900); }); });
  }
}
/* ===== لوحة المتابعة ===== */
function progressPage() {
  const box = $("#aview"), lv = getLv(), B = S.proj, byS = (s) => ITEMS.find((x) => x.slug === s);
  const dP = ITEMS.filter((x) => B.done[x.slug] && x.kind === "project"), dC = ITEMS.filter((x) => B.done[x.slug] && x.kind === "challenge");
  const stP = ITEMS.filter((x) => B.started[x.slug] && !B.done[x.slug] && x.kind === "project"), stC = ITEMS.filter((x) => B.started[x.slug] && !B.done[x.slug] && x.kind === "challenge");
  const sk = Array.from(skillSet()), next = forLv(lv).filter((x) => x.kind === "project" && !B.done[x.slug]).sort((a, b) => (dP.some((d) => d.cat === b.cat) ? 1 : 0) - (dP.some((d) => d.cat === a.cat) ? 1 : 0)).slice(0, 4);
  const notes = dP.filter((x) => B.done[x.slug].note), favs = forLv(lv).filter((x) => x.kind === "project" && B.favs[x.slug]);
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة المتابعة: المشاريع والتحديات</h1><p>تقدم الطفل في مشاريعه هو، دون مقارنته بأي طفل آخر. كل مشروع إنجاز يستحق الفرح.</p></div></div>
<div class="pg2"><div><b>${AD(dP.length)}</b>مشروعا مكتملا</div><div><b>${AD(dC.length)}</b>تحديا مكتملا</div><div><b>${AD(sk.length)}</b>مهارة تدرب عليها</div><div><b>${AD(B.pts)}</b>نقطة</div></div>
<section class="art"><h2>ملخص الإنجازات والشارات</h2><div class="bkbs">${BADGES.map(([id, n, d]) => `<div class="bkbd${B.badges[id] ? " on" : ""}"><span>${B.badges[id] ? "🏅" : "🔒"}</span><b>${esc(n)}</b><small>${esc(d)}</small></div>`).join("")}</div></section>
<section class="art" id="pgcur"><h2>مشاريع بدأها ولم يكملها</h2>${stP.length ? `<div class="sks">${stP.map((x) => { const k = B.steps[x.slug], st = k != null ? x.data.steps[k] : null; return `<div class="pgrow"><span>${esc(x.title)}${spanOf(x) !== "short" ? " <small>(" + SPAN[spanOf(x)] + ")</small>" : ""}</span><b>${k != null ? "الخطوة " + AD(k + 1) + " من " + AD(x.data.steps.length) + (st && st.g ? " · " + esc(st.g) : "") : "بدأه ولم يصل إلى الخطوات"}</b><a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">تابع</a></div>`; }).join("")}</div>` : `<p class="tx">لا توجد مشاريع غير مكتملة.</p>`}</section>
<section class="art" id="pghelp"><h2>كيف أساعد دون أن أنفذ عنه؟</h2>${stP.length ? `<ul class="tx">${stP.map((x) => `<li><b>${esc(x.title)}:</b> ${fmt(x.data.parent || GEN_PARENT, x)}</li>`).join("")}</ul>` : `<p class="tx">${esc(GEN_PARENT)}</p>`}<p class="hint">التشجيع على المحاولة أهم من الإتقان، ولا تقارن إنجاز طفلك بإنجاز أي طفل آخر.</p></section>
<section class="art" id="pgfav"><h2>المفضلة</h2>${favs.length ? `<div class="lks">${favs.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div>` : `<p class="tx">لم تُحفظ مشاريع في المفضلة بعد.</p>`}</section>
<section class="art"><h2>المشاريع المكتملة وملاحظات الطفل</h2>${dP.length ? `<div class="sks">${dP.map((x) => `<div><span>${esc(x.title)}</span><b>${B.done[x.slug].note ? esc(B.done[x.slug].note) : "أكمله بلا ملاحظة"}</b></div>`).join("")}</div>` : `<p class="tx">ستظهر المشاريع المكتملة هنا.</p>`}</section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${sk.length ? `<div class="pjsk">${sk.map((x) => `<span class="chip on">${esc(x)}</span>`).join("")}</div>` : `<p class="tx">ستظهر المهارات بعد إكمال أول مشروع أو تحدٍّ.</p>`}<p class="hint">إكمال المشروع لا يعني الإتقان وحده؛ تحدث مع الطفل عما تعلمه.</p></section>
<section class="art"><h2>التحديات التي شارك فيها</h2>${dC.length || stC.length ? `<div class="sks">${dC.map((x) => `<div><span>${esc(x.title)}</span><b>أكمله ${"⭐".repeat(B.done[x.slug].best)}</b></div>`).join("")}${stC.map((x) => `<div><span>${esc(x.title)}</span><b>بدأه ولم يكمله</b></div>`).join("")}</div>` : `<p class="tx">لم يشارك في تحديات بعد.</p>`}</section>
<section class="art"><h2>مشروعات مقترحة للمرحلة التالية</h2>${next.length ? `<div class="lks">${next.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div>` : `<p class="tx">أنجز الطفل كل مشاريع هذه المرحلة. جرّب مرحلة أخرى.</p>`}</section>
<section class="art" id="pgtools"><h2>أدوات المشاريع القادمة</h2>${next.length ? `<div class="sks">${next.map((x) => `<div><span>${esc(x.title)}</span><b>${x.data.tools.map((o) => fmt(o, x)).join("، ")}</b></div>`).join("")}</div><p class="hint">جهّز هذه الأدوات مسبقا من البيت. للأدوات الحادة أو الساخنة يتولى شخص بالغ الجزء الخطر.</p>` : `<p class="tx">لا توجد مشاريع قادمة في هذه المرحلة.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">الملاحظات والإنجازات والمفضلة محفوظة في هذا الجهاز فقط، ولا تُرسل إلى أي حساب ولا تُنشر ولا تُشارَك، ولا يُطلب رفع صور ولا صورة وجه الطفل ولا أي بيانات شخصية.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح بيانات هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">المشاريع والتحديات</a><a class="abtn" href="../guide/">دليل ولي الأمر والسلامة</a></div>`;
  let arm = false; $("#rst").onclick = () => { if (!arm) { arm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد"; return; } S.proj = { done: {}, started: {}, badges: {}, steps: {}, pts: 0, favs: S.proj.favs || {}, flow: {} }; save(); progressPage(); toast("تم المسح."); };
}
function guidePage() {
  $("#aview").innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر والمعلم</h1><p>كيف نختار المشروع المناسب وننفذه بأمان.</p></div></div>
<section class="art"><h2>كيف تختار؟</h2><ul class="tx"><li>اختر مرحلة الطفل ثم المجال الذي يحبه، وابدأ بالمشاريع القصيرة.</li><li>المشاريع تحتاج أدوات من البيت فقط، ولا حاجة إلى شراء شيء خاص.</li><li>اقرأ الأدوات وتعليمات السلامة قبل البدء، وجهز المكان.</li></ul></section>
<section class="art"><h2>السلامة أولا</h2><ul class="tx"><li>للأعمار الصغيرة (من سنة إلى ٣ سنوات) يبقى شخص بالغ مع الطفل طوال الوقت، وتُستعمل أشياء كبيرة لا تدخل الفم.</li><li>القص يقوم به الكبير، أو يُستعمل مقص آمن للأطفال بإشراف.</li><li>لا تستعمل أي مواد خطرة أو مصادر حرارة في أي مشروع.</li><li>نظف المكان وأغسل اليدين بعد كل مشروع.</li></ul></section>
<section class="art"><h2>أثناء التنفيذ</h2><p class="tx">تظهر خطوة واحدة في كل مرة مع صورة وشرح قصير، ويمكن الرجوع إلى الخطوة السابقة. ستجد إرشادا خاصا لك في بعض الخطوات. اسمح للطفل بالمحاولة بنفسه وتدخل عند الحاجة.</p></section>
<section class="art"><h2>المشاريع الأسبوعية والشهرية</h2><p class="tx">المشروع الأسبوعي يُقسَّم إلى أيام، والشهري إلى مراحل، ويُنجَز جزء صغير في كل جلسة دون إرهاق. يُحفظ مكان الطفل في هذا الجهاز ليكمل لاحقا من حيث توقف. في كل مشروع تجد دور ولي الأمر وسؤالا للتفكير ونسخة للطباعة من التعليمات.</p></section>
<section class="art"><h2>التحديات</h2><p class="tx">تحديات قصيرة ممتعة بلا وقت محدد ولا منافسة مع الآخرين. تعمل بالضغط على الشاشة، ويمكن إعادتها كما نريد.</p></section>
<section class="art"><h2>الخصوصية</h2><p class="tx">لا يُطلب رفع صور أو فيديو ولا صورة وجه الطفل ولا أي بيانات شخصية، ولا تُنشر أي إنجازات ولا تُشارَك خارج هذا الجهاز؛ فالمشاركة غير مفعّلة أصلا. المفضلة والتقدم محفوظان هنا فقط. الملاحظات القصيرة محفوظة في هذا الجهاز فقط. كل المحتوى أصلي من إنتاج زاد، وفُحص آليا ولم يراجعه مختص تربوي بعد.</p></section>
<div class="btns"><a class="abtn go" href="../">المشاريع والتحديات</a></div>`;
}
D.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest("[data-fav]"); if (!b) return; e.preventDefault(); const k = b.dataset.fav; if (S.proj.favs[k]) delete S.proj.favs[k]; else S.proj.favs[k] = Date.now(); save(); const on = !!S.proj.favs[k]; D.querySelectorAll(`[data-fav="${k}"]`).forEach((x) => { x.classList.toggle("on", on); x.setAttribute("aria-pressed", on); x.textContent = on ? "★ في المفضلة" : "☆ حفظ في المفضلة"; }); toast(on ? "حُفظ في المفضلة" : "أُزيل من المفضلة"); if (PAGE === "hub" && W.__pjRefresh) W.__pjRefresh(); });
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else hubPage(); })();
})();
