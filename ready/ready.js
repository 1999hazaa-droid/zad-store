/* الاستعداد المدرسي والتعلم المبكر - زاد: رئيسية + لعب + يومي الأول + اختبار مهارات + تقدم + دليل + طباعة. التقدم محلي (S.ready). لا حسابات ولا بيانات شخصية. */
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
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات تقريبا", g1: "الصف الأول", g2: "الصف الثاني" };
const PATHS = { lang: ["مسار الاستعداد اللغوي", "1f5e3", ["lang"]], math: ["مسار الاستعداد الرياضي", "i_n3", ["math"]], percep: ["مسار الإدراك والتركيز", "1f441", ["percep", "focus"]], motor: ["مسار المهارات الحركية", "i_pencil", ["motor"]], social: ["مسار الاستعداد الاجتماعي والمدرسي", "x_teacher", ["social", "indep"]] };
const P = (cat) => Object.keys(PATHS).find((k) => PATHS[k][2].includes(cat)) || "lang";
const AREAS = { letters: ["التعرف على الحروف", "lang"], numbers: ["الأرقام والعد", "math"], shapes: ["الأشكال والألوان", "percep"], sorting: ["المطابقة والتصنيف", "percep"], listening: ["الاستماع وفهم التعليمات", "lang"], memory: ["الذاكرة والانتباه", "percep"], motor: ["المهارات الحركية الدقيقة", "motor"] };
const STEPS = { 1: ["مبتدئ", "نبدأ بالمهارات التمهيدية"], 2: ["نامٍ", "ننمي المهارة بتدريب أكثر"], 3: ["متقدم", "نطبق بتحدٍّ لطيف"] };
const KINDN = { lesson: "درس مصور", choose: "اختيار", odd: "المختلف", quant: "عد ومقارنة", pattern: "اكتشاف النمط", memory: "لعبة الذاكرة", match: "توصيل", order: "ترتيب", sort: "تصنيف بالسحب", trace: "تتبع الخط", follow: "تعليمات", task: "نشاط مع الأسرة" };
let MODE = null, CHK = false;
/* ===== التقدم ===== */
const LK = "zad-learn-v3", SK = "zad-ready-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; S.ready = S.ready || {}; S.ready.it = S.ready.it || {}; S.ready.pts = S.ready.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
const isDone = (slug) => !!(S.ready.it[slug] && S.ready.it[slug].d > 0);
let ITEMS = [];
async function load() { try { ITEMS = await rest("ready_items?status=eq.published&order=sort_order.asc&select=slug,cat,kind,title,icon,levels,step,data,family"); try { localStorage.setItem("zad-ready-cache", JSON.stringify(ITEMS)); } catch {} } catch { try { ITEMS = JSON.parse(localStorage.getItem("zad-ready-cache") || "[]"); } catch { ITEMS = []; } } return ITEMS; }
const forLv = (path, lv) => ITEMS.filter((x) => PATHS[path][2].includes(x.cat) && x.levels.includes(lv));
function stepInfo(cat, lv) {
  const its = forLv(cat, lv), out = {}; let open = true;
  for (let k = 1; k <= 5; k++) { const L = its.filter((x) => x.step === k); if (!L.length) continue; const d = L.filter((x) => isDone(x.slug)).length; out[k] = { n: L.length, d, ok: open, items: L }; if (d < L.length) open = false; }
  return out;
}
function catStat(cat, lv) { const its = forLv(cat, lv), d = its.filter((x) => isDone(x.slug)).length; return { n: its.length, d }; }
function badges() {
  const out = [], all = Object.keys(S.ready.it).filter((k) => isDone(k) && ITEMS.some((x) => x.slug === k && PATHS[P(x.cat)] && x.cat !== "day" && x.cat !== "chk")).length;
  [[1, "بداية جميلة"], [5, "خمسة أنشطة"], [10, "عشرة أنشطة"], [25, "خمسة وعشرون نشاطا"]].forEach(([n, t]) => { if (all >= n) out.push([t, "i_star"]); });
  Object.keys(PATHS).forEach((c) => { const n = ITEMS.filter((x) => PATHS[c][2].includes(x.cat) && isDone(x.slug)).length; if (n >= 4) out.push(["نجم " + PATHS[c][0], PATHS[c][1]]); });
  if (S.ready.day) out.push(["أنهيت يومي الأول في المدرسة", "i_bag"]);
  return out;
}
/* ===== الصوت: لا تشغيل تلقائي ===== */
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W; let voices = [];
if (tts) { const f = () => (voices = speechSynthesis.getVoices() || []); f(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", f); }
function say(text) { if (!tts) return toast("الصوت غير متاح على هذا الجهاز. اقرأ التعليمات بصوت مرتفع."); try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "ar-SA"; u.rate = .85; const v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith("ar")); if (v) { u.voice = v; u.lang = v.lang; } else if (voices.length) toast("لا يتوفر صوت عربي على جهازك، لذلك قد لا يُسمع الكلام."); speechSynthesis.speak(u); } catch { toast("تعذّر تشغيل الصوت."); } }
const spk = (t, label) => `<button type="button" class="spk" data-say="${esc(t)}" aria-label="${esc(label || "استمع")}"><img src="${icon("i_sound")}" alt="" width="22" height="22"> ${esc(label || "استمع")}</button>`;
D.addEventListener("click", (e) => { const b = e.target.closest("[data-say]"); if (b) say(b.dataset.say); });
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 3200); }
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${Object.keys(LV).map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
/* ===== الرئيسية + المسارات ===== */
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), c = p.get("c"); setLv(lv);
  if (c && PATHS[c]) return catView(box, c, lv);
  const pk = Object.keys(PATHS), tot = pk.reduce((a, k) => a.concat(forLv(k, lv)), []), dn = tot.filter((x) => isDone(x.slug)).length, young = lv === "a2" || lv === "a3";
  box.innerHTML = `<div class="hero"><img src="${icon("x_teacher")}" alt=""><div><h1>الاستعداد المدرسي والتعلم المبكر</h1><p>مسارات وأنشطة وألعاب قصيرة تجهّز الطفل للمدرسة: لغة وأعداد وإدراك وتركيز ومهارات حركية واستعداد اجتماعي واستقلالية، بلا حسابات ولا عقوبات.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: ألعاب قصيرة تعتمد على اللمس، ويجلس الكبير مع الطفل ويقرأ التعليمات. لا اختبارات في هذه المرحلة." : "تُعرض الأنشطة المناسبة لهذه المرحلة، ويمكن تغييرها في أي وقت."}</p></div>
<section class="art"><h2>أين وصلت؟ ${AD(dn)} من ${AD(tot.length)} نشاطا</h2><div class="bar"><i style="width:${tot.length ? (dn / tot.length) * 100 : 0}%"></i></div></section>
<section class="art"><h2>ابدأ من هنا</h2><div class="rdfeat"><a class="dgc" href="day/?lv=${lv}"><img src="${icon("i_bag")}" alt="" width="64" height="64"><b>يومي الأول في المدرسة</b><small>مشاهد كرتونية بثمانية مواقف</small></a><a class="dgc" href="check/?lv=${lv}"><img src="${icon("i_target")}" alt="" width="64" height="64"><b>اختبار المهارات الأولية</b><small>ألعاب قصيرة غير ضاغطة</small></a></div></section>
<section class="art"><h2>مسارات التعلم</h2><div class="dgcats">${pk.map((k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<a class="dgc" href="?c=${k}&lv=${lv}"><img src="${icon(PATHS[k][1])}" alt="" width="64" height="64"><b>${esc(PATHS[k][0])}</b><small>${its.length ? AD(d) + " من " + AD(its.length) + " أنشطة" : "لا أنشطة لهذه المرحلة"}</small><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></a>`; }).join("")}</div></section>
<section class="art"><h2>المستويات الثلاثة</h2><ol class="dgsteps">${[1, 2, 3].map((k) => `<li><b>${STEPS[k][0]}</b>: ${esc(STEPS[k][1])}</li>`).join("")}</ol><p class="hint">لا ينتقل الطفل إلى مستوى أصعب إلا بعد إكمال أنشطة المستوى الحالي، ويستطيع مراجعة السابق متى شاء.</p></section>
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة ولي الأمر</a><a class="abtn" href="guide/">دليل ولي الأمر</a><a class="abtn" href="print/">أوراق وجداول للطباعة</a></div></section>
<section class="art"><h2>مرتبط بأقسام المكتبة</h2><div class="lks"><a class="abtn" href="${ROOT}language/">اللغة والمفردات</a><a class="abtn" href="${ROOT}stories/">القصص</a><a class="abtn" href="${ROOT}life/">المهارات الحياتية</a><a class="abtn" href="${ROOT}library/">أوراق العمل والرياضيات</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function catView(box, c, lv) {
  const info = stepInfo(c, lv), ks = Object.keys(info).map(Number);
  box.innerHTML = `<div class="hero"><img src="${icon(PATHS[c][1])}" alt=""><div><h1>${esc(PATHS[c][0])}</h1><p>المرحلة: ${esc(LV[lv])}. أكمل أنشطة كل مستوى لتفتح المستوى التالي.</p></div></div>${stagePills(lv, "./?c=" + c)}
${ks.length ? ks.map((k) => { const s = info[k]; return `<section class="art dgstep${s.ok ? "" : " lock"}"><h2>${AD(k)}. ${STEPS[k][0]} <small>${AD(s.d)} من ${AD(s.n)}</small></h2>${s.ok ? `<div class="dgl">${s.items.map((x) => `<a class="dgi${isDone(x.slug) ? " done" : ""}" href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><span><b>${esc(x.title)}</b><small>${esc(KINDN[x.kind])}${isDone(x.slug) ? " · أكملتها" : ""}</small></span></a>`).join("")}</div>` : `<p class="hint">يفتح هذا المستوى بعد إكمال أنشطة المستوى السابق. يمكنك مراجعة ما أنجزته في أي وقت.</p>`}</section>`; }).join("") : `<div class="sempty"><h3>لا توجد أنشطة لهذه المرحلة بعد</h3></div>`}
<p><a class="abtn" href="./?lv=${lv}">كل المسارات</a></p>`;
}
/* ===== اللعب ===== */
function nextOf(it, lv) { const info = stepInfo(P(it.cat), lv); for (const k of Object.keys(info).map(Number)) { if (!info[k].ok) break; const n = info[k].items.find((x) => !isDone(x.slug) && x.slug !== it.slug); if (n) return n; } return null; }
function record(it, wrong) {
  const r = (S.ready.it[it.slug] = S.ready.it[it.slug] || { d: 0, w: 0, t: 0 }); const first = !r.d; r.d++; r.w += wrong; r.t = Date.now(); S.ready.pts += first ? 10 : 3; save();
  try { fetch(SB + "/rest/v1/ready_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ slug: it.slug, wrong: Math.min(wrong, 50) }) }).catch(() => {}); } catch {}
  return first;
}
function finish(it, wrong, lv) {
  if (MODE) return MODE.fn(it, wrong);
  const first = record(it, wrong), box = $("#aview"), nx = nextOf(it, lv);
  box.innerHTML = `<div class="res"><div class="st">⭐</div><h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2><p>حصلت على ${AD(first ? 10 : 3)} نقاط. مجموع نقاطك ${AD(S.ready.pts)}.</p>${wrong ? `<p class="hint">التجربة والإعادة جزء من التعلم، وكل محاولة تقرّبك من إتقان المهارة.</p>` : ""}
${it.family ? `<div class="rv"><b>نشاط مع الأسرة:</b><p>${esc(it.family)}</p></div>` : ""}
<div class="btns">${nx ? `<a class="abtn go" href="?s=${encodeURIComponent(nx.slug)}&lv=${lv}">النشاط التالي</a>` : ""}<button type="button" class="abtn" id="again">أعد النشاط</button><a class="abtn" href="../?c=${P(it.cat)}&lv=${lv}">${esc(PATHS[P(it.cat)][0])}</a></div></div>`;
  $("#again").onclick = () => location.reload();
}
const D8 = (a) => a;
const ART = { day_1: "scene_day_1", day_2: "scene_day_2" };
function tracePath(sh, w, h) {
  const N = 90, o = [], cx = w / 2, cy = h / 2; const seg = (a, b, n) => { for (let i = 0; i < n; i++) o.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); };
  if (sh === "line") seg([w - 50, cy], [50, cy], N); else if (sh === "wave") { for (let i = 0; i <= N; i++) { const t = i / N; o.push([w - 50 - t * (w - 100), cy + 55 * Math.sin(t * Math.PI * 4)]); } } else if (sh === "zigzag") { const v = [[w - 50, cy + 60], [w - 130, cy - 60], [w - 210, cy + 60], [w - 290, cy - 60], [w - 370, cy + 60], [50, cy - 60]]; for (let k = 0; k < v.length - 1; k++) seg(v[k], v[k + 1], 18); o.push(v[v.length - 1]); } else if (sh === "circle") { for (let i = 0; i < N; i++) { const t = -Math.PI / 2 - i / N * Math.PI * 2; o.push([cx + 100 * Math.cos(t), cy + 100 * Math.sin(t)]); } } else if (sh === "square") { const v = [[cx + 95, cy - 95], [cx - 95, cy - 95], [cx - 95, cy + 95], [cx + 95, cy + 95]]; for (let k = 0; k < 4; k++) seg(v[k], v[(k + 1) % 4], 22); } else { const v = [[cx, cy - 105], [cx - 115, cy + 95], [cx + 115, cy + 95]]; for (let k = 0; k < 3; k++) seg(v[k], v[(k + 1) % 3], 30); }
  return o;
}
W.__rdPath = tracePath;
function playPage(forced) {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = forced || ITEMS.find((x) => x.slug === p.get("s"));
  if (!it) return (box.innerHTML = `<div class="sempty"><h3>النشاط غير موجود</h3><p><a class="abtn go" href="../">الاستعداد المدرسي</a></p></div>`);
  const head = MODE ? `<div class="qh"><h2>${esc(it.title)}</h2><small>${esc(MODE.label(it))}</small></div>` : `<div class="qh"><h2>${esc(it.title)}</h2><small>${esc(PATHS[P(it.cat)][0])} · المستوى ${AD(it.step)}: ${STEPS[it.step][0]} · ${esc(KINDN[it.kind])}</small></div>`;
  const back = MODE ? MODE.back : `<p><a class="abtn" href="../?c=${P(it.cat)}&lv=${lv}">رجوع إلى ${esc(PATHS[P(it.cat)][0])}</a></p>`;
  CHK = !!(MODE && MODE.chk);
  const d = it.data; let wrong = 0;
  const fb = (t, c) => { const f = $("#fb"); if (f) { f.className = "fb " + c; f.textContent = t; } };
  const mc = (q, opts, fbs, why, onOk, intro) => {
    const o = shuf(opts.map((t, i) => [t, i]));
    const html = `${intro || ""}<div class="qq">${esc(q)}</div>${spk(q + " " + o.map((z) => z[0]).join("، "), "استمع")}<div class="opts">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${esc(z[0])}</button>`).join("")}</div><div class="fb" id="fb" role="status"></div>`;
    return { html, bind: (root) => root.querySelectorAll(".opt").forEach((b) => b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j]; if (z[1] === 0) { b.classList.add("good"); root.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb((fbs ? fbs[0] : why) || "أحسنت!", "g"); setTimeout(onOk, 1200); } else { wrong++; if (CHK) { root.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("شكرا لمحاولتك! لنكمل.", "g"); return void setTimeout(onOk, 900); } b.classList.add("bad"); b.disabled = true; fb((fbs ? fbs[z[1]] : "") + " جرّب خيارا آخر، لا بأس.", "b"); } }) };
  };
  if (it.kind === "lesson") {
    let i = 0, quiz = false; const pg = d.pages;
    const draw = () => {
      if (!quiz) { const g = pg[i], last = i === pg.length - 1; box.innerHTML = `${head}${i === 0 ? `<p class="hint"><b>هدف الدرس:</b> ${esc(d.goal)}</p>` : ""}<div class="spage"><small class="dgk">${g.k === "example" ? "مثال عملي" : "شرح مبسط"}</small><img src="${icon(g.img)}" alt="" width="180" height="180"><p class="stx">${esc(g.t)}</p>${spk(g.t, "استمع إلى الصفحة")}</div><div class="btns"><button type="button" class="abtn" id="pv" ${i ? "" : "disabled"}>▶ السابقة</button><button type="button" class="abtn go" id="nx">${last ? "اختبر فهمك" : "التالية ◀"}</button></div>${back}`; $("#pv").onclick = () => { i--; draw(); }; $("#nx").onclick = () => { if (last) quiz = true; else i++; draw(); }; }
      else { const m = mc(d.check.q, d.check.o, null, d.check.why, () => finish(it, wrong, lv)); box.innerHTML = head + m.html + back; m.bind(box); }
    }; draw();
  } else if (it.kind === "choose") {
    const m = mc(d.q, d.o, d.fb, "", () => finish(it, wrong, lv), `<div class="spage"><img src="${ART[it.slug] ? ROOT + "images/ready/" + ART[it.slug] + ".webp" : icon(it.icon)}" alt="" width="150" height="150" style="border-radius:18px"><p class="stx">${esc(d.scene)}</p></div>`);
    box.innerHTML = head + m.html + back; m.bind(box);
  } else if (it.kind === "order") {
    const units = d.steps; let bank = shuf(units.map((u, k) => ({ u, k }))); if (bank.every((b, k) => b.u === units[k])) bank = bank.reverse(); let pick = [];
    const dr = () => { box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><ol class="slot dgslot">${pick.map((b) => `<li><button type="button" class="opt on" data-r="${b.k}">${esc(b.u)}</button></li>`).join("") || '<span class="ph">اضغط الخطوات بالترتيب</span>'}</ol><div class="opts">${bank.filter((b) => !pick.includes(b)).map((b) => `<button type="button" class="opt" data-p="${b.k}">${esc(b.u)}</button>`).join("")}</div><div class="btns"><button type="button" class="abtn go" id="chk" ${pick.length === units.length ? "" : "disabled"}>تحقّق</button><button type="button" class="abtn" id="clr">من جديد</button></div><div class="fb" id="fb" role="status"></div>${back}`;
      box.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => { pick.push(bank.find((x) => x.k === +b.dataset.p)); dr(); });
      box.querySelectorAll("[data-r]").forEach((b) => b.onclick = () => { pick = pick.filter((x) => x.k !== +b.dataset.r); dr(); });
      $("#clr").onclick = () => { pick = []; dr(); };
      $("#chk").onclick = () => { const ok = pick.every((b, i) => b.u === units[i]); if (ok) { fb("أحسنت! هذا هو الترتيب الصحيح.", "g"); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); setTimeout(() => finish(it, wrong, lv), 1200); } else { wrong++; const first = pick.findIndex((b, i) => b.u !== units[i]); fb(`قريب! راجع الخطوة رقم ${AD(first + 1)} وجرّب مرة أخرى.`, "b"); } };
    }; dr();
  } else if (it.kind === "sort") {
    const its = shuf(d.items.map((x, i) => ({ t: x.t, g: x.g, i, img: x.img }))); const placed = {}; let sel = null;
    const dr = () => {
      const left = its.filter((x) => placed[x.i] == null);
      box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><p class="hint">اسحب كل بطاقة إلى مكانها، أو اضغط البطاقة ثم اضغط المكان.</p><div class="dgpool" id="pool">${left.map((x) => `<button type="button" class="dgcard${sel === x.i ? " sel" : ""}" data-i="${x.i}">${x.img ? `<img src="${icon(x.img)}" alt="" width="26" height="26"> ` : ""}${esc(x.t)}</button>`).join("") || "<span class='ph'>أحسنت! وزعت كل البطاقات</span>"}</div><div class="dggroups">${d.groups.map((g, gi) => `<div class="dgg" data-g="${gi}"><h3>${esc(g)}</h3><div class="dggi">${its.filter((x) => placed[x.i] === gi).map((x) => `<span class="dgcard on">${x.img ? `<img src="${icon(x.img)}" alt="" width="26" height="26"> ` : ""}${esc(x.t)}</span>`).join("")}</div></div>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
      const put = (i, gi) => { const x = its.find((z) => z.i === i); if (!x) return; if (x.g === gi) { placed[i] = gi; sel = null; fb("صحيح!", "g"); if (its.every((z) => placed[z.i] != null)) { dr(); fb("أحسنت! وضعت كل شيء في مكانه.", "g"); setTimeout(() => finish(it, wrong, lv), 1200); return; } dr(); fb("صحيح!", "g"); } else { wrong++; sel = null; dr(); fb("ليست هذه المجموعة المناسبة، جرّب مجموعة أخرى.", "b"); } };
      box.querySelectorAll(".dgcard[data-i]").forEach((c) => {
        c.onclick = () => { if (c._dragged) { c._dragged = false; return; } sel = sel === +c.dataset.i ? null : +c.dataset.i; dr(); };
        c.onpointerdown = (e) => { if (e.button) return; const r = c.getBoundingClientRect(), sx = e.clientX, sy = e.clientY; let gh = null, moved = false; c.setPointerCapture && c.setPointerCapture(e.pointerId);
          c.onpointermove = (m) => { if (!moved && Math.hypot(m.clientX - sx, m.clientY - sy) < 8) return; if (!moved) { moved = true; gh = c.cloneNode(true); gh.classList.add("dgghost"); gh.style.width = r.width + "px"; D.body.appendChild(gh); } gh.style.left = m.clientX - r.width / 2 + "px"; gh.style.top = m.clientY - r.height / 2 + "px"; box.querySelectorAll(".dgg").forEach((g) => { const b = g.getBoundingClientRect(); g.classList.toggle("over", m.clientX >= b.left && m.clientX <= b.right && m.clientY >= b.top && m.clientY <= b.bottom); }); m.preventDefault(); };
          c.onpointerup = (u) => { c.onpointermove = c.onpointerup = null; if (gh) gh.remove(); if (!moved) return; c._dragged = true; let tg = null; box.querySelectorAll(".dgg").forEach((g) => { const b = g.getBoundingClientRect(); if (u.clientX >= b.left && u.clientX <= b.right && u.clientY >= b.top && u.clientY <= b.bottom) tg = +g.dataset.g; }); if (tg != null) put(+c.dataset.i, tg); else dr(); }; };
      });
      box.querySelectorAll(".dgg").forEach((g) => g.onclick = () => { if (sel != null) put(sel, +g.dataset.g); });
    }; dr();
  } else if (it.kind === "pattern") {
    const o = shuf(d.o.map((t, i) => [t, i]));
    box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><div class="dgseq">${d.seq.map((x) => `<img src="${icon(x)}" alt="" width="56" height="56">`).join("")}<span class="dgq" aria-hidden="true">؟</span></div><div class="opts dgopts">${o.map((z, j) => `<button type="button" class="opt dgimg" data-j="${j}" aria-label="الخيار ${AD(j + 1)}"><img src="${icon(z[0])}" alt="" width="56" height="56"></button>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
    box.querySelectorAll(".opt").forEach((b) => b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j]; if (z[1] === 0) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("أحسنت! اكتشفت النمط.", "g"); setTimeout(() => finish(it, wrong, lv), 1200); } else { wrong++; if (CHK) { box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("شكرا لمحاولتك! لنكمل.", "g"); return void setTimeout(() => finish(it, wrong, lv), 900); } b.classList.add("bad"); b.disabled = true; fb("ليس هذا هو التالي. انظر إلى التكرار وجرّب مرة أخرى.", "b"); } });
  } else if (it.kind === "match") {
    const L = d.pairs.map((p, i) => Object.assign({ i }, p.l)), Rr = shuf(d.pairs.map((p, i) => Object.assign({ i }, p.r))), dn = {}; let sel = null;
    const cell = (x, side, n) => `<button type="button" class="dgm${sel === x.i && side === "l" ? " sel" : ""}${dn[x.i] ? " ok" : ""}" data-s="${side}" data-i="${x.i}" ${dn[x.i] ? "disabled" : ""} aria-label="${esc(x.t || "صورة " + AD(n + 1))}">${x.img ? `<img src="${icon(x.img)}" alt="" width="48" height="48">` : ""}${x.t ? `<span>${esc(x.t)}</span>` : ""}</button>`;
    const dr = (msg, cls) => {
      box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div>${d.adult ? `<p class="hint"><b>بمرافقة شخص كبير:</b> يقرأ الكبير الخيارات ويساعد الطفل على اللمس.</p>` : ""}<p class="hint">اضغط العنصر من العمود الأول ثم ما يناسبه من العمود الثاني.</p><div class="dgmg"><div>${L.map((x, n) => cell(x, "l", n)).join("")}</div><div>${Rr.map((x, n) => cell(x, "r", n)).join("")}</div></div><div class="fb ${cls || ""}" id="fb" role="status">${msg || ""}</div>${back}`;
      box.querySelectorAll(".dgm").forEach((b) => b.onclick = () => { const i = +b.dataset.i;
        if (b.dataset.s === "l") { sel = sel === i ? null : i; return dr(); }
        if (sel == null) return dr("اختر أولا عنصرا من العمود الأول.", "b");
        if (sel === i) { dn[i] = 1; sel = null; if (Object.keys(dn).length === d.pairs.length) { dr("أحسنت! وصلت كل الأزواج.", "g"); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); return void setTimeout(() => finish(it, wrong, lv), 1200); } return dr("صحيح!", "g"); }
        wrong++; sel = null; dr("ليس هذا هو المناسب. جرّب مرة أخرى، لا بأس.", "b"); });
    }; dr();
  } else if (it.kind === "odd") {
    const arr = shuf([{ i: d.odd, o: 1 }, { i: d.same, o: 0 }, { i: d.same, o: 0 }, { i: d.same, o: 0 }]);
    box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div>${spk(d.q, "استمع")}<div class="rdodd">${arr.map((z, j) => `<button type="button" class="opt dgimg" data-o="${z.o}" data-j="${j}" aria-label="الصورة ${AD(j + 1)}"><img src="${icon(z.i)}" alt="" width="84" height="84"></button>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
    box.querySelectorAll(".opt").forEach((b) => b.onclick = () => { if (b.disabled) return; if (b.dataset.o === "1") { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("أحسنت! وجدت الصورة المختلفة.", "g"); setTimeout(() => finish(it, wrong, lv), 1200); } else { wrong++; if (CHK) { box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("شكرا لمحاولتك! لنكمل.", "g"); return void setTimeout(() => finish(it, wrong, lv), 900); } b.classList.add("bad"); b.disabled = true; fb("لا بأس، انظر جيدا وجرّب صورة أخرى.", "b"); } });
  } else if (it.kind === "quant") {
    const grp = d.groups.map((g, k) => `<div class="rdgrp">${d.groups.length > 1 ? `<small>${k ? "المجموعة الثانية" : "المجموعة الأولى"}</small>` : ""}<div>${Array.from({ length: g.n }, () => `<img src="${icon(g.img)}" alt="" width="44" height="44">`).join("")}</div></div>`).join("");
    const m = mc(d.q, d.o, null, "أحسنت!", () => finish(it, wrong, lv), `<div class="rdgrps" role="img" aria-label="${esc(d.q)}">${grp}</div>`); box.innerHTML = head + m.html + back; m.bind(box);
  } else if (it.kind === "memory") {
    const cards = shuf(d.icons.concat(d.icons).map((ic, k) => ({ ic, k }))); let open = [], got = 0, lock = false;
    box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><p class="hint">لا يوجد خطأ هنا. اقلب بطاقتين، وإذا لم تتشابها فستعودان وتحاول من جديد.</p><div class="rdmem" style="--c:${d.icons.length > 4 ? 4 : 3}">${cards.map((c, j) => `<button type="button" class="rdcard" data-j="${j}" data-ic="${c.ic}" aria-label="بطاقة ${AD(j + 1)}"><span class="f"><img src="${icon(c.ic)}" alt="" width="56" height="56"></span><span class="b">؟</span></button>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
    box.querySelectorAll(".rdcard").forEach((b) => b.onclick = () => { if (lock || b.classList.contains("up") || b.classList.contains("ok")) return; b.classList.add("up"); open.push(b); if (open.length < 2) return; lock = true; const [x, y] = open; open = [];
      if (x.dataset.ic === y.dataset.ic) { x.classList.add("ok"); y.classList.add("ok"); got++; lock = false; fb("رائع! وجدت زوجا.", "g"); if (got === d.icons.length) { fb("أحسنت! وجدت كل الأزواج.", "g"); setTimeout(() => finish(it, 0, lv), 1100); } }
      else setTimeout(() => { x.classList.remove("up"); y.classList.remove("up"); lock = false; fb("لا بأس، حاول مرة أخرى.", "b"); }, 800); });
  } else if (it.kind === "trace") {
    const cw = 480, ch = 300, pts = tracePath(d.shape, cw, ch); let user = [], on = false, tries = 0;
    box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div>${spk(d.q, "استمع")}<p class="hint">ابدأ من النقطة الخضراء وتتبع الخط المنقط ببطء. لا بأس إن خرجت قليلا.</p><div class="dgbd"><canvas id="cv" class="dgcv" width="${cw}" height="${ch}" role="img" aria-label="لوحة التتبع"></canvas></div><div class="btns"><button type="button" class="abtn" id="clr">من جديد</button></div><div class="fb" id="fb" role="status"></div>${back}`;
    const cv = $("#cv"), x = cv.getContext("2d");
    const base = () => { x.clearRect(0, 0, cw, ch); x.fillStyle = "#fff"; x.fillRect(0, 0, cw, ch); x.lineWidth = 14; x.lineCap = x.lineJoin = "round"; x.strokeStyle = "#cdbdf5"; x.setLineDash([2, 20]); x.beginPath(); pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1]))); if (d.shape === "circle" || d.shape === "square" || d.shape === "triangle") x.closePath(); x.stroke(); x.setLineDash([]); x.fillStyle = "#22c55e"; x.beginPath(); x.arc(pts[0][0], pts[0][1], 13, 0, 7); x.fill(); x.strokeStyle = "#6d28d9"; x.lineWidth = 9; };
    base();
    const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cw / r.width, (e.clientY - r.top) * ch / r.height]; };
    const score = () => { const R = 34; let cov = 0; pts.forEach((p) => { if (user.some((u) => Math.hypot(u[0] - p[0], u[1] - p[1]) < R)) cov++; }); let stray = 0; user.forEach((u) => { if (!pts.some((p) => Math.hypot(u[0] - p[0], u[1] - p[1]) < R * 1.8)) stray++; }); return [cov / pts.length, user.length ? stray / user.length : 1]; };
    cv.onpointerdown = (e) => { on = true; user = []; base(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId); const p = pt(e); user.push(p); x.beginPath(); x.moveTo(p[0], p[1]); e.preventDefault(); };
    cv.onpointermove = (e) => { if (!on) return; const p = pt(e), l = user[user.length - 1], n = Math.max(1, Math.ceil(Math.hypot(p[0] - l[0], p[1] - l[1]) / 8)); for (let k = 1; k <= n; k++) user.push([l[0] + (p[0] - l[0]) * k / n, l[1] + (p[1] - l[1]) * k / n]); x.lineTo(p[0], p[1]); x.stroke(); };
    const up = () => { if (!on) return; on = false; const [c, s] = score();
      if (c >= 0.8 && s <= 0.25) { fb("أحسنت! تتبعت الخط بجمال.", "g"); cv.onpointerdown = null; setTimeout(() => finish(it, wrong, lv), 1100); }
      else { wrong++; tries++; if (CHK) { fb("شكرا لمحاولتك! لنكمل.", "g"); cv.onpointerdown = null; return void setTimeout(() => finish(it, wrong, lv), 900); } fb("قريب! ابدأ من النقطة الخضراء وتتبع الخط المنقط مرة أخرى.", "b"); setTimeout(() => { user = []; base(); }, 900); } };
    cv.onpointerup = up; cv.onpointercancel = up; $("#clr").onclick = () => { user = []; base(); fb("", ""); };
  } else if (it.kind === "follow") {
    const txt = "المس " + d.seq.map((i) => d.ph[i]).join(" ثم "); let k = 0, shown = true, tm = 0;
    const dr = () => {
      box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><div class="rdins" id="ins" aria-live="polite">${shown ? esc(txt) : "؟ تذكر التعليمات ثم المس الصور"}</div><div class="btns">${spk(txt, "استمع إلى التعليمات")}${d.hide ? `<button type="button" class="abtn" id="rp">أعد عرض التعليمات</button>` : ""}</div><div class="rdimgs">${d.imgs.map((ic, j) => `<button type="button" class="opt dgimg" data-j="${j}" aria-label="${esc(d.ph[j])}"><img src="${icon(ic)}" alt="" width="64" height="64"></button>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
      box.querySelectorAll(".opt").forEach((b) => b.onclick = () => { const j = +b.dataset.j; if (j === d.seq[k]) { b.classList.add("good"); k++; if (k === d.seq.length) { fb("أحسنت! نفذت التعليمات.", "g"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); setTimeout(() => finish(it, wrong, lv), 1200); } else fb("صحيح! أكمل.", "g"); }
        else { wrong++; if (CHK) { box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("شكرا لمحاولتك! لنكمل.", "g"); return void setTimeout(() => finish(it, wrong, lv), 900); } k = 0; box.querySelectorAll(".opt").forEach((x) => x.classList.remove("good")); fb("لا بأس، لنبدأ من جديد بهدوء.", "b"); } });
      if (d.hide) { $("#rp").onclick = () => { shown = true; dr(); hideSoon(); }; }
    };
    const hideSoon = () => { if (!d.hide) return; clearTimeout(tm); tm = setTimeout(() => { shown = false; const i = $("#ins"); if (i) i.textContent = "؟ تذكر التعليمات ثم المس الصور"; }, 4500); };
    dr(); hideSoon();
  } else if (it.kind === "task") {
    const ck = d.steps.map(() => false);
    const dr = () => { box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="120" height="120">${d.adult ? `<p class="hint"><b>بمرافقة شخص كبير:</b> يقرأ الكبير الخطوات ويشارك الطفل في تنفيذها.</p>` : `<p class="hint">نفّذ كل خطوة مع أسرتك، ثم ضع علامة عليها.</p>`}</div><ul class="dgck">${d.steps.map((s, i) => `<li><label><input type="checkbox" data-i="${i}" ${ck[i] ? "checked" : ""}> <span>${esc(s)}</span></label></li>`).join("")}</ul>${it.family ? `<div class="rv"><b>اقتراح للأسرة:</b><p>${esc(it.family)}</p></div>` : ""}${spk(d.steps.join("، "), "استمع إلى الخطوات")}<div class="btns"><button type="button" class="abtn go" id="dn" ${ck.every(Boolean) ? "" : "disabled"}>أنجزنا المهمة</button></div>${back}`;
      box.querySelectorAll("[data-i]").forEach((c) => c.onchange = () => { ck[+c.dataset.i] = c.checked; dr(); }); $("#dn").onclick = () => finish(it, 0, lv); }; dr();
  }
}
/* ===== يومي الأول في المدرسة ===== */
function dayPage() {
  const box = $("#aview"), lv = getLv(), its = ITEMS.filter((x) => x.cat === "day" && x.levels.includes(lv)).sort((a, b) => a.sort_order - b.sort_order); setLv(lv);
  const intro = () => { box.innerHTML = `<div class="hero"><img src="${icon("i_bag")}" alt=""><div><h1>يومي الأول في المدرسة</h1><p>ثمانية مشاهد كرتونية قصيرة: من الاستيقاظ إلى ترتيب الأدوات. في كل مشهد تختار ما تفعله، ويمكنك إعادة المحاولة بلا أي عقوبة.</p></div></div>${stagePills(lv, "./")}${its.length ? `<div class="btns"><button type="button" class="abtn go" id="go">ابدأ يومي</button><a class="abtn" href="../?lv=${lv}">رجوع</a></div>` : `<div class="sempty"><h3>لا مشاهد لهذه المرحلة</h3><p class="hint">هذه التجربة لعمر ٤ سنوات فأكثر. للأصغر سنا جرّب المسارات.</p><a class="abtn go" href="../?lv=${lv}">المسارات</a></div>`}`; const g = $("#go"); if (g) g.onclick = go; };
  let i = 0;
  const end = () => { MODE = null; S.ready.day = { n: ((S.ready.day || {}).n || 0) + 1, t: Date.now() }; S.ready.pts += 20; save(); box.innerHTML = `<div class="res"><div class="st">🎒</div><h2>أنهيت يومك الأول في المدرسة!</h2><p>مررت بثمانية مشاهد وتعلمت كيف يسير اليوم المدرسي. حصلت على ٢٠ نقطة إضافية. مجموع نقاطك ${AD(S.ready.pts)}.</p><div class="rv"><b>مع الأسرة:</b><p>تحدثوا مع الطفل عن المشهد الذي أعجبه أكثر، وعن أي شيء يقلقه بهدوء.</p></div><div class="btns"><button type="button" class="abtn go" id="ag">أعد اليوم</button><a class="abtn" href="../?lv=${lv}">المسارات</a></div></div>`; $("#ag").onclick = () => { i = 0; go(); }; };
  const go = () => { if (i >= its.length) return end(); MODE = { chk: false, label: () => `المشهد ${AD(i + 1)} من ${AD(its.length)}`, back: `<p><a class="abtn" href="../?lv=${lv}">خروج</a></p>`, fn: (it, wrong) => { record(it, wrong); i++; go(); } }; playPage(its[i]); };
  intro();
}
/* ===== اختبار المهارات الأولية: مؤشرات وليست تشخيصا ===== */
function checkPage() {
  const box = $("#aview"), lv = getLv(), its = ITEMS.filter((x) => x.cat === "chk" && x.levels.includes(lv)).sort((a, b) => a.sort_order - b.sort_order); setLv(lv);
  const young = lv === "a2" || lv === "a3";
  box.innerHTML = `<div class="hero"><img src="${icon("i_target")}" alt=""><div><h1>اختبار المهارات الأولية</h1><p>ألعاب قصيرة تساعدنا على معرفة ما يمكن أن نلعب به لاحقا. ليست امتحانا، ولا توجد درجات.</p></div></div>${stagePills(lv, "./")}
<section class="art"><h2>قبل أن نبدأ</h2><ul class="tx"><li>النتائج مؤشرات للتعلم والتدريب فقط، وليست تشخيصا طبيا أو حكما على استعداد الطفل للمدرسة.</li><li>يجلس الكبير بجانب الطفل ويشجعه ولا يصحح له.</li><li>يمكن إعادة الاختبار في أي وقت، وتُحفظ النتيجة في هذا الجهاز فقط.</li></ul></section>
${young || !its.length ? `<div class="sempty"><h3>هذا الاختبار لعمر ٤ سنوات فأكثر</h3><p class="hint">للأعمار الأصغر نقترح ملاحظة الطفل أثناء اللعب بمساعدة جدول متابعة المهارات في صفحة الطباعة.</p><a class="abtn go" href="../print/">أوراق وجداول للطباعة</a></div>` : `<div class="btns"><button type="button" class="abtn go" id="go">ابدأ الألعاب</button><a class="abtn" href="../?lv=${lv}">رجوع</a></div>`}`;
  const g = $("#go"); if (!g) return; let i = 0; const res = {};
  const end = () => { MODE = null; S.ready.chk = { res, t: Date.now(), lv }; save(); showRes(box, res, lv); };
  const go = () => { if (i >= its.length) return end(); MODE = { chk: true, label: () => `لعبة ${AD(i + 1)} من ${AD(its.length)}`, back: `<p class="hint">لا توجد إجابة خاطئة هنا. نلعب لنتعرف على ما يمكن التدرب عليه.</p>`, fn: (it, wrong) => { const a = it.data.area; (res[a] = res[a] || { c: 0, n: 0 }).n++; if (!wrong) res[a].c++; try { fetch(SB + "/rest/v1/ready_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ slug: it.slug, wrong: Math.min(wrong, 50) }) }).catch(() => {}); } catch {} i++; go(); } }; playPage(its[i]); };
  g.onclick = go;
}
const IND = (c, n) => (c >= n ? ["تظهر المهارة بوضوح، استمر في اللعب بها", "g"] : c >= n - 1 ? ["تظهر المهارة وتحتاج إلى مزيد من التدريب", "m"] : ["مهارة يمكن التدرب عليها بالألعاب", "t"]);
function showRes(box, res, lv) {
  const keys = Object.keys(AREAS).filter((a) => res[a]);
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>مؤشرات المهارات</h1><p>شكرا للعب! هذه مؤشرات لطيفة تساعدنا على اختيار الألعاب المناسبة.</p></div></div>
<section class="art"><div class="sks">${keys.map((a) => { const r = res[a], ind = IND(r.c, r.n); return `<div><span>${esc(AREAS[a][0])}</span><b>${esc(ind[0])}</b><span class="bar"><i style="width:${(r.c / r.n) * 100}%"></i></span>${r.c < r.n ? `<a class="abtn" href="../?c=${AREAS[a][1]}&lv=${lv}">ألعاب للتدرب</a>` : ""}</div>`; }).join("")}</div></section>
<div class="rv"><b>تذكير:</b><p>هذه النتائج ليست تشخيصا طبيا ولا حكما على استعداد الطفل للمدرسة، فالأطفال يتعلمون بإيقاعات مختلفة. إن كانت لديكم أسئلة عن نمو الطفل فمعلمته أو مختص في الطفولة المبكرة أقدر على مساعدتكم.</p></div>
<div class="btns"><a class="abtn go" href="../progress/?lv=${lv}">لوحة ولي الأمر</a><a class="abtn" href="../?lv=${lv}">المسارات</a></div>`;
}
/* ===== لوحة ولي الأمر ===== */
let rstArm = false;
function progressPage() {
  const box = $("#aview"), lv = getLv(), pk = Object.keys(PATHS), core = ITEMS.filter((x) => x.cat !== "day" && x.cat !== "chk"), done = core.filter((x) => isDone(x.slug)), rec = (x) => S.ready.it[x.slug], bd = badges();
  const wk = done.filter((x) => rec(x).t > Date.now() - 7 * 864e5), days = new Set(wk.map((x) => new Date(rec(x).t).toDateString())).size;
  const practiced = pk.filter((k) => done.some((x) => PATHS[k][2].includes(x.cat)));
  const review = core.filter((x) => { const r = rec(x); return r && r.w >= 2 && r.d <= 1; }).slice(0, 8);
  const chk = S.ready.chk, weak = chk ? Object.keys(chk.res).filter((a) => chk.res[a].c <= chk.res[a].n - 2) : [];
  const ratio = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return its.length ? d / its.length : 1; };
  const order = Array.from(new Set(weak.map((a) => AREAS[a][1]).concat(pk.slice().sort((a, b) => ratio(a) - ratio(b))))).slice(0, 3);
  const tips = order.map((k) => ITEMS.find((x) => x.kind === "task" && PATHS[k][2].includes(x.cat))).filter(Boolean);
  const dd = S.ready.day;
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة ولي الأمر: الاستعداد المدرسي</h1><p>ما تدرب عليه الطفل وما أكمله وما يحتاج إلى تدريب. للتشجيع وليس للمقارنة بين الأطفال.</p></div></div>
<div class="pg2"><div><b>${AD(done.length)}</b>نشاطا مكتملا</div><div><b>${AD(practiced.length)}</b>مهارات تدرب عليها</div><div><b>${AD(days)}</b>أيام نشاط هذا الأسبوع</div><div><b>${AD(S.ready.pts)}</b>نقطة</div></div>
<section class="art"><h2>ملخص هذا الأسبوع</h2><p class="tx">${wk.length ? `أكمل الطفل ${AD(wk.length)} نشاطا في ${AD(days)} ${days > 2 ? "أيام" : "يوم"}. استمرار اللعب القصير كل يوم أنفع من جلسة طويلة.` : "لم تُسجَّل أنشطة هذا الأسبوع. بضع دقائق من اللعب تكفي للبداية، دون ضغط."}${dd ? ` أنهى الطفل «يومي الأول في المدرسة» ${AD(dd.n)} ${dd.n > 2 ? "مرات" : "مرة"}.` : ""}</p></section>
<section class="art"><h2>التقدم في كل مجال</h2><p class="hint">المرحلة المعروضة: ${esc(LV[lv])}</p><div class="sks">${pk.map((k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length, inf = stepInfo(k, lv), cur = Object.keys(inf).map(Number).find((q) => inf[q].d < inf[q].n); return `<div><span>${esc(PATHS[k][0])}</span><b>${AD(d)} من ${AD(its.length)}${cur ? " · المستوى: " + STEPS[cur][0] : its.length ? " · أنهى كل المستويات" : ""}</b><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></div>`; }).join("")}</div></section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${practiced.length ? `<div class="rvc">${practiced.map((k) => `<span class="chp">${esc(PATHS[k][0].replace("مسار ", ""))}</span>`).join("")}</div>` : `<p class="tx">ستظهر هنا المهارات بعد إكمال الأنشطة.</p>`}</section>
${chk ? `<section class="art"><h2>آخر مؤشرات للمهارات</h2><div class="sks">${Object.keys(AREAS).filter((a) => chk.res[a]).map((a) => `<div><span>${esc(AREAS[a][0])}</span><b>${esc(IND(chk.res[a].c, chk.res[a].n)[0])}</b></div>`).join("")}</div><p class="hint">هذه مؤشرات للتدريب وليست تشخيصا. أعيدوا الاختبار بعد أسابيع من اللعب.</p></section>` : ""}
${review.length || weak.length ? `<section class="art"><h2>مهارات تحتاج إلى مزيد من التدريب</h2><p class="tx">لا بأس، هذه فرص للعب والتدريب بهدوء.</p><div class="lks">${weak.map((a) => `<a class="abtn" href="../?c=${AREAS[a][1]}&lv=${lv}">${esc(AREAS[a][0])}</a>`).join("")}${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>أنشطة منزلية مقترحة</h2><ul class="rdtips">${tips.map((t) => `<li><b>${esc(t.title)}</b><p>${esc(t.family)}</p><ol>${t.data.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></li>`).join("")}</ul></section>
<section class="art"><h2>الشارات</h2>${bd.length ? `<div class="dgbd2">${bd.map((b) => `<span><img src="${icon(b[1])}" alt="" width="40" height="40"> ${esc(b[0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر الشارات بعد إكمال الأنشطة.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط، ولا تُرسل إلى أي حساب، ولا تظهر لأي زائر آخر. يُرسل فقط عدد الأخطاء المجهول لكل نشاط لتحسين المحتوى، دون اسم أو أي بيانات شخصية.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح تقدم الطفل في هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">متابعة الأنشطة</a><a class="abtn" href="../guide/">دليل ولي الأمر</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
  $("#rst").onclick = () => { if (!rstArm) { rstArm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد: سيُمسح التقدم"; return; } S.ready = { it: {}, pts: 0 }; save(); rstArm = false; progressPage(); toast("تم مسح تقدم هذا القسم."); };
}
/* ===== دليل ولي الأمر ===== */
function guidePage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>خطوات بسيطة لدعم استعداد طفلك للمدرسة بهدوء وثقة.</p></div></div>
<section class="art"><h2>كيف تستخدم القسم؟</h2><ul class="tx"><li>اختر مرحلة طفلك من الصفحة الرئيسية. الأعمار الصغيرة تلعب بمشاركة الكبار.</li><li>جلسة قصيرة من ١٠ إلى ١٥ دقيقة كل يوم أفضل من جلسة طويلة.</li><li>ابدأ من المستوى المبتدئ، ولا تنتقل لأصعب قبل أن يرتاح الطفل.</li><li>شجع المحاولة قبل الصواب، وكرر النشاط الذي يحبه.</li></ul></section>
<section class="art"><h2>حسب العمر</h2><ul class="tx"><li><b>١ إلى ٣ سنوات:</b> أسماء الأشياء والألوان والأشكال، والمطابقة، وأجزاء الجسم، وألعاب الحركة الآمنة معكم.</li><li><b>٤ و٥ سنوات:</b> الحروف والأرقام والعد، والتتبع بالقلم، والقصص، وتعليمات قصيرة من خطوتين أو ثلاث.</li><li><b>٦ سنوات:</b> مراجعة الأصوات، وكلمات وجمل قصيرة، وجمع وطرح بالصور، وتجهيز الحقيبة وتنظيم الوقت.</li><li><b>الصفان الأول والثاني:</b> تقوية المهارات الأساسية بتدريب إضافي لطيف، وتنظيم وقت الواجب.</li></ul></section>
<section class="art"><h2>كيف نقرأ المؤشرات؟</h2><p class="tx">اختبار المهارات الأولية يعطي مؤشرات للتدريب فقط، وليس تشخيصا ولا حكما نهائيا. الأطفال ينمون بإيقاعات مختلفة، ونتائج اليوم قد تتغير بعد أسابيع من اللعب. لا تقارنوا طفلكم بغيره.</p></section>
<section class="art"><h2>متى نسأل مختصا؟</h2><p class="tx">إن لاحظتم قلقا مستمرا أو صعوبة واضحة ومتكررة في فهم الكلام أو الحركة أو الانتباه، فاسألوا معلمة الطفل أو مختصا في الطفولة المبكرة. هذا القسم للتدريب واللعب ولا يغني عن رأي المختص.</p></section>
<section class="art"><h2>أفكار منزلية سريعة</h2><ul class="tx"><li>عدوا الدرجات والملاعق وأصابع اليد.</li><li>اقرؤوا قصة قصيرة كل يوم واسألوا: ماذا حدث بعد ذلك؟</li><li>ابحثوا عن أشكال وألوان في البيت.</li><li>اتركوه يجهز حقيبته مساء ثم راجعوها معه بهدوء.</li><li>العبوا لعبة المعلمة والطالب للتعود على المدرسة.</li></ul></section>
<div class="btns"><a class="abtn go" href="../">الاستعداد المدرسي</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
}
/* ===== الطباعة ===== */
const PDFS = [["ready-trace-lines", "ورقة تتبع الخطوط", "خطوط منقطة متدرجة لتدريب اليد على القلم.", "i_pencil"], ["ready-shapes-colors", "ورقة الأشكال والألوان", "تلوين الأشكال ووصلها بأسمائها.", "rd_circle_red"], ["ready-counting", "ورقة العد والمطابقة", "عد الصور ومطابقتها بالأرقام.", "i_n3"], ["ready-patterns", "ورقة الأنماط", "أنماط من الصور يكملها الطفل.", "1f9e9"], ["ready-school-bag", "قائمة تجهيز الحقيبة", "قائمة مصورة يضع الطفل عليها علامة.", "i_bag"], ["ready-daily-schedule", "جدول الروتين المدرسي", "جدول مصور للأسبوع.", "i_clock"], ["ready-skills-tracker", "جدول متابعة المهارات", "جدول للأسرة تضع فيه ملاحظاتها الإيجابية.", "i_chart"], ["ready-parent-guide", "دليل ولي الأمر للطباعة", "صفحة نصائح مختصرة للأسرة.", "i_book"]];
function printPage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_notebook")}" alt=""><div><h1>أوراق وجداول للطباعة</h1><p>ملفات PDF جاهزة للتحميل والطباعة على ورق A4.</p></div></div><div class="dgl">${PDFS.map((x) => `<a class="dgi" href="${ROOT}files/ready/${x[0]}.pdf" target="_blank" rel="noopener"><img src="${icon(x[3])}" alt="" width="52" height="52"><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></a>`).join("")}</div><p class="hint">تُفتح الملفات في نافذة جديدة. عاين الملف قبل الطباعة.</p><p><a class="abtn" href="../">العودة إلى الاستعداد المدرسي</a></p>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "day") dayPage(); else if (PAGE === "check") checkPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else if (PAGE === "print") printPage(); else hubPage(); })();
})();
