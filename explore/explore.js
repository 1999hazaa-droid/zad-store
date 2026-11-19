/* الثقافة العامة والمعرفة والاستكشاف - زاد: رئيسية + اكتشف العالم + دروس وبطاقات وألعاب واختبارات قصيرة + تقدم + دليل + طباعة. التقدم محلي (S.exp). لا حسابات ولا بيانات شخصية. */
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
const PATHS = { animals: ["عالم الحيوانات", "1f981", ["animals"]], plants: ["عالم النباتات", "1f331", ["plants"]], space: ["الفضاء والكواكب", "1f680", ["space"]], earth: ["الأرض والطبيعة", "1f310", ["earth"]], body: ["جسم الإنسان والحواس", "1f440", ["body"]], transport: ["وسائل النقل", "1f697", ["transport"]], jobs: ["المهن والأعمال", "x_doctor", ["jobs"]], places: ["البلدان والمعالم", "1f5fa", ["places"]], invent: ["الاختراعات والتقنية", "1f4a1", ["invent"]], culture: ["الثقافة والمعرفة العامة", "1f9e0", ["culture"]] };
const VALS = ["animals", "plants", "space", "earth", "body", "transport", "jobs", "places", "invent", "culture"];
const P = (cat) => cat;
const STEPS = { 1: ["أتعرف", "معلومات وصور أساسية"], 2: ["أكتشف", "أسئلة ومطابقة وتصنيف"], 3: ["أفهم", "تطبيق ومقارنة واستنتاج بسيط"] };
const KINDN = { lesson: "درس مصور", story: "قصة تعليمية", choose: "سؤال وجواب", quiz: "اختبار قصير", order: "ترتيب", sort: "تصنيف", match: "مطابقة", task: "استكشاف مع الأسرة" };
const SKILL = { lesson: "التعرف على معلومات جديدة", story: "فهم قصة علمية واستنتاج", choose: "الإجابة عن أسئلة المعرفة", quiz: "مراجعة المعلومات باختبار قصير", order: "ترتيب المراحل والخطوات", sort: "التصنيف والمقارنة", match: "ربط الصورة بالاسم", task: "الاستكشاف مع الأسرة" };
let MODE = null, CHK = false, QMSG = "";
/* ===== التقدم ===== */
const LK = "zad-learn-v3", SK = "zad-exp-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; S.exp = S.exp || {}; S.exp.it = S.exp.it || {}; S.exp.pts = S.exp.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
const isDone = (slug) => !!(S.exp.it[slug] && S.exp.it[slug].d > 0);
let ITEMS = [];
async function load() { try { ITEMS = await rest("exp_items?status=eq.published&order=sort_order.asc&select=slug,cat,kind,title,icon,levels,step,data,family"); try { localStorage.setItem("zad-exp-cache", JSON.stringify(ITEMS)); } catch {} } catch { try { ITEMS = JSON.parse(localStorage.getItem("zad-exp-cache") || "[]"); } catch { ITEMS = []; } } return ITEMS; }
const forLv = (path, lv) => ITEMS.filter((x) => PATHS[path][2].includes(x.cat) && x.levels.includes(lv));
function stepInfo(cat, lv) {
  const its = forLv(cat, lv), out = {}; let open = true;
  for (let k = 1; k <= 5; k++) { const L = its.filter((x) => x.step === k); if (!L.length) continue; const d = L.filter((x) => isDone(x.slug)).length; out[k] = { n: L.length, d, ok: true, items: L }; }
  return out;
}
function catStat(cat, lv) { const its = forLv(cat, lv), d = its.filter((x) => isDone(x.slug)).length; return { n: its.length, d }; }
function badges() {
  const out = [], all = ITEMS.filter((x) => isDone(x.slug)).length;
  [[1, "مستكشف جديد"], [5, "خمسة أنشطة"], [10, "عشرة أنشطة"], [25, "خمسة وعشرون نشاطا"]].forEach(([n, t]) => { if (all >= n) out.push([t, "i_star"]); });
  VALS.forEach((c) => { const n = ITEMS.filter((x) => x.cat === c && isDone(x.slug)).length; if (n >= 3) out.push(["مستكشف " + PATHS[c][0], PATHS[c][1]]); });
  const qz = ITEMS.filter((x) => x.kind === "quiz" && isDone(x.slug)).length; if (qz >= 3) out.push(["بطل الاختبارات القصيرة", "1f3c6"]);
  const dc = (S.exp.disc || []).length; if (dc >= 5) out.push(["اكتشفت خمسة موضوعات", "1f50d"]);
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
/* ===== الرئيسية + التصنيفات ===== */
function discPick(lv) {
  const L = ITEMS.filter((x) => x.kind === "lesson" && x.levels.includes(lv)), seen = S.exp.disc || [], fresh = L.filter((x) => !seen.includes(x.slug));
  const pool = fresh.length ? fresh : L; return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), c = p.get("c"); setLv(lv);
  if (c && PATHS[c]) return catView(box, c, lv);
  const tot = VALS.reduce((a, k) => a.concat(forLv(k, lv)), []), dn = tot.filter((x) => isDone(x.slug)).length, young = lv === "a2" || lv === "a3";
  const card = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<a class="dgc vcard" data-c="${k}" href="?c=${k}&lv=${lv}"><img src="${icon(PATHS[k][1])}" alt="" width="64" height="64"><b>${esc(PATHS[k][0])}</b><small>${its.length ? AD(d) + " من " + AD(its.length) + " أنشطة" : "لا أنشطة لهذه المرحلة"}</small><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></a>`; };
  const dk = discPick(lv), tip = dk && dk.data.pages.find((g) => g.k === "example");
  box.innerHTML = `<div class="hero"><img src="${icon("1f9ed")}" alt=""><div><h1>الثقافة العامة والمعرفة والاستكشاف</h1><p>نتعرف على الحيوانات والنباتات والفضاء والأرض وأجسامنا والمهن والبلدان، بالصور والقصص والألعاب والتجارب الآمنة.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: صور وأصوات ومطابقة بسيطة، ويجلس الكبير مع الطفل ويقرأ له." : "تُعرض الأنشطة المناسبة لهذه المرحلة، ويمكن تغييرها في أي وقت."}</p></div>
<section class="art"><h2>أين وصلت؟ ${AD(dn)} من ${AD(tot.length)} نشاطا</h2><div class="bar"><i style="width:${tot.length ? (dn / tot.length) * 100 : 0}%"></i></div></section>
${dk ? `<section class="art" id="disc"><h2>اكتشف العالم</h2><a class="dgi" id="discgo" href="play/?s=${encodeURIComponent(dk.slug)}&lv=${lv}&d=1"><img src="${icon(dk.icon)}" alt="" width="52" height="52"><span><b>${esc(dk.title)}</b><small>موضوع اليوم، اضغط لتكتشفه</small></span></a>${tip ? `<p class="hint"><b>هل تعلم؟</b> ${esc(tip.t)}</p>` : ""}<p class="hint">يتغير الموضوع في كل مرة تفتح فيها القسم.</p></section>` : ""}
<section class="art"><h2>التصنيفات</h2><div class="dgcats">${VALS.map(card).join("")}</div></section>
<section class="art"><h2>المستويات الثلاثة</h2><ol class="dgsteps">${[1, 2, 3].map((k) => `<li><b>${STEPS[k][0]}</b>: ${esc(STEPS[k][1])}</li>`).join("")}</ol><p class="hint">كل المستويات مفتوحة، ويمكن للطفل الإعادة والمراجعة متى شاء بلا عقوبة.</p></section>
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة المتابعة</a><a class="abtn" href="guide/">دليل ولي الأمر</a><a class="abtn" href="print/">أوراق وبطاقات للطباعة</a></div></section>
<section class="art"><h2>مرتبط بأقسام المكتبة</h2><div class="lks"><a class="abtn" href="${ROOT}wiki/">الموسوعة</a><a class="abtn" href="${ROOT}experiments/">التجارب</a><a class="abtn" href="${ROOT}stories/">القصص</a><a class="abtn" href="${ROOT}library/">أوراق العمل</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function catView(box, c, lv) {
  const info = stepInfo(c, lv), ks = Object.keys(info).map(Number);
  box.innerHTML = `<div class="hero"><img src="${icon(PATHS[c][1])}" alt=""><div><h1>${esc(PATHS[c][0])}</h1><p>المرحلة: ${esc(LV[lv])}. اختر ما يعجبك، وأعد المحاولة متى شئت.</p></div></div>${stagePills(lv, "./?c=" + c)}
${ks.length ? ks.map((k) => { const s = info[k]; return `<section class="art dgstep"><h2>${AD(k)}. ${STEPS[k][0]} <small>${AD(s.d)} من ${AD(s.n)}</small></h2><div class="dgl">${s.items.map((x) => `<a class="dgi${isDone(x.slug) ? " done" : ""}" href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><span><b>${esc(x.title)}</b><small>${esc(KINDN[x.kind])}${isDone(x.slug) ? " · أكملتها" : ""}</small></span></a>`).join("")}</div></section>`; }).join("") : `<div class="sempty"><h3>لا أنشطة لهذه المرحلة بعد</h3><p class="hint">اختر مرحلة أخرى من الأعلى.</p></div>`}
<p><a class="abtn" href="./?lv=${lv}">كل التصنيفات</a></p>`;
}
/* ===== اللعب ===== */
function nextOf(it, lv) { const info = stepInfo(P(it.cat), lv); for (const k of Object.keys(info).map(Number)) { if (!info[k].ok) break; const n = info[k].items.find((x) => !isDone(x.slug) && x.slug !== it.slug); if (n) return n; } return null; }
function record(it, wrong) {
  const r = (S.exp.it[it.slug] = S.exp.it[it.slug] || { d: 0, w: 0, t: 0 }); const first = !r.d; r.d++; r.w += wrong; r.t = Date.now(); S.exp.pts += first ? 10 : 3; save();
  try { fetch(SB + "/rest/v1/exp_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ slug: it.slug, wrong: Math.min(wrong, 50) }) }).catch(() => {}); } catch {}
  return first;
}
function finish(it, wrong, lv) {
  if (new URLSearchParams(location.search).get("d") && it.kind === "lesson") { const dd = (S.exp.disc = S.exp.disc || []); if (!dd.includes(it.slug)) dd.push(it.slug); }
  if (MODE) return MODE.fn(it, wrong);
  const first = record(it, wrong), box = $("#aview"), nx = nextOf(it, lv);
  box.innerHTML = `<div class="res"><div class="st">⭐</div><h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2>${QMSG ? `<p class="hint">${esc(QMSG)}</p>` : ""}<p>حصلت على ${AD(first ? 10 : 3)} نقاط. مجموع نقاطك ${AD(S.exp.pts)}.</p>${wrong ? `<p class="hint">التجربة والمحاولة جزء من التعلم، وكل محاولة تقرّبنا من المعرفة.</p>` : ""}
${it.family ? `<div class="rv"><b>نشاط مع الأسرة:</b><p>${esc(it.family)}</p></div>` : ""}
<div class="btns">${nx ? `<a class="abtn go" href="?s=${encodeURIComponent(nx.slug)}&lv=${lv}">النشاط التالي</a>` : ""}<button type="button" class="abtn" id="again">أعد النشاط</button><a class="abtn" href="../?c=${P(it.cat)}&lv=${lv}">${esc(PATHS[P(it.cat)][0])}</a></div></div>`;
  $("#again").onclick = () => location.reload();
}
const ART = { day_1: "scene_day_1", day_2: "scene_day_2" };
function playPage(forced) {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = forced || ITEMS.find((x) => x.slug === p.get("s"));
  if (!it) return (box.innerHTML = `<div class="sempty"><h3>النشاط غير موجود</h3><p><a class="abtn go" href="../">الثقافة العامة</a></p></div>`);
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
  } else if (it.kind === "story") {
    let i = 0; const pg = d.pages;
    const pages = () => { const g = pg[i], last = i === pg.length - 1; box.innerHTML = `${head}<div class="spage"><img src="${icon(g.img)}" alt="" width="170" height="170"><p class="stx">${esc(g.t)}</p>${spk(g.t, "استمع إلى الصفحة")}</div><div class="btns"><button type="button" class="abtn" id="pv" ${i ? "" : "disabled"}>▶ السابقة</button><button type="button" class="abtn go" id="nx">${last ? "سؤال القصة" : "التالية ◀"}</button></div>${back}`; $("#pv").onclick = () => { i--; pages(); }; $("#nx").onclick = () => { if (last) quiz(); else { i++; pages(); } }; };
    const quiz = () => { const m = mc(d.quiz.q, d.quiz.o, null, d.quiz.why, act); box.innerHTML = head + m.html + back; m.bind(box); };
    const act = () => { box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="110" height="110"></div><div class="rv"><b>جرّب بنفسك:</b><p>${esc(d.act)}</p></div>${spk(d.act, "استمع")}<div class="btns"><button type="button" class="abtn go" id="dn">أنهيت القصة</button></div>${back}`; $("#dn").onclick = () => finish(it, wrong, lv); };
    pages();
  } else if (it.kind === "quiz") {
    let n = 0, ok = 0, w0 = 0; const Q = d.qs;
    const ask = () => { w0 = wrong; const q = Q[n]; const m = mc(q.q, q.o, null, q.why, () => { if (wrong === w0) ok++; n++; if (n < Q.length) ask(); else { QMSG = "نتيجتك في الاختبار القصير: " + AD(ok) + " من " + AD(Q.length) + " من المحاولة الأولى. المراجعة تجعل المعلومة أثبت."; const qq = (S.exp.qz = S.exp.qz || {}); qq[it.slug] = Math.max(qq[it.slug] || 0, ok); finish(it, wrong, lv); QMSG = ""; } }, `<p class="hint">السؤال ${AD(n + 1)} من ${AD(Q.length)}</p>`); box.innerHTML = head + m.html + back; m.bind(box); };
    ask();
  } else if (it.kind === "task") {
    const ck = d.steps.map(() => false);
    const dr = () => { box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="120" height="120">${d.adult ? `<p class="hint"><b>بمرافقة شخص كبير:</b> يقرأ الكبير الخطوات ويشارك الطفل في تنفيذها.</p>` : `<p class="hint">نفّذ كل خطوة مع أسرتك، ثم ضع علامة عليها.</p>`}</div><ul class="dgck">${d.steps.map((s, i) => `<li><label><input type="checkbox" data-i="${i}" ${ck[i] ? "checked" : ""}> <span>${esc(s)}</span></label></li>`).join("")}</ul>${it.family ? `<div class="rv"><b>اقتراح للأسرة:</b><p>${esc(it.family)}</p></div>` : ""}${spk(d.steps.join("، "), "استمع إلى الخطوات")}<div class="btns"><button type="button" class="abtn go" id="dn" ${ck.every(Boolean) ? "" : "disabled"}>أنجزنا المهمة</button></div>${back}`;
      box.querySelectorAll("[data-i]").forEach((c) => c.onchange = () => { ck[+c.dataset.i] = c.checked; dr(); }); $("#dn").onclick = () => finish(it, 0, lv); }; dr();
  }
}
/* ===== لوحة متابعة الطفل وولي الأمر ===== */
let rstArm = false;
function progressPage() {
  const box = $("#aview"), lv = getLv(), core = ITEMS, done = core.filter((x) => isDone(x.slug)), rec = (x) => S.exp.it[x.slug], bd = badges();
  const wk = done.filter((x) => rec(x).t > Date.now() - 7 * 864e5), days = new Set(wk.map((x) => new Date(rec(x).t).toDateString())).size;
  const disc = (S.exp.disc || []).map((sl) => ITEMS.find((x) => x.slug === sl)).filter(Boolean);
  const lessons = done.filter((x) => x.kind === "lesson"), acts = done.filter((x) => x.kind !== "lesson" && x.kind !== "quiz" && x.kind !== "task");
  const qzs = ITEMS.filter((x) => x.kind === "quiz" && S.exp.qz && S.exp.qz[x.slug] != null);
  const skills = Array.from(new Set(done.map((x) => SKILL[x.kind]))).filter(Boolean);
  const review = core.filter((x) => { const r = rec(x); return r && r.w >= 2 && r.d <= 1; }).slice(0, 8);
  const ratio = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return its.length ? d / its.length : 1; };
  const order = VALS.slice().sort((a, b) => ratio(a) - ratio(b)).slice(0, 3);
  const tips = order.map((k) => ITEMS.find((x) => x.kind === "task" && x.cat === k)).filter(Boolean);
  const known = VALS.filter((k) => done.some((x) => x.cat === k));
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة المتابعة: الثقافة العامة والاستكشاف</h1><p>ما اكتشفه الطفل وما أكمله، للتشجيع والمراجعة معا. لا مقارنة بين الأطفال.</p></div></div>
<div class="pg2"><div><b>${AD(done.length)}</b>نشاطا مكتملا</div><div><b>${AD(lessons.length)}</b>درسا مكتملا</div><div><b>${AD(disc.length)}</b>موضوعا اكتشفه</div><div><b>${AD(S.exp.pts)}</b>نقطة</div></div>
<section class="art"><h2>ملخص هذا الأسبوع</h2><p class="tx">${wk.length ? `أكمل الطفل ${AD(wk.length)} نشاطا في ${AD(days)} ${days > 2 ? "أيام" : "يوم"}. اسألوه: ما أغرب معلومة عرفتها اليوم؟` : "لم تُسجَّل أنشطة هذا الأسبوع. درس واحد قصير يكفي للبداية، دون ضغط."}</p></section>
<section class="art"><h2>الموضوعات التي اكتشفها الطفل</h2>${disc.length ? `<div class="rvc">${disc.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">تظهر هنا الموضوعات بعد إكمال نشاط اكتشف العالم من الصفحة الرئيسية.</p>`}</section>
<section class="art"><h2>الدروس المكتملة</h2>${lessons.length ? `<div class="rvc">${lessons.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">ستظهر الدروس هنا بعد إكمالها.</p>`}</section>
<section class="art"><h2>الأنشطة التي أنجزها</h2>${acts.length ? `<p class="tx">${AD(acts.length)} نشاطا بين قصص وأسئلة ومطابقة وتصنيف وترتيب.</p><div class="rvc">${acts.slice(0, 20).map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">ستظهر الأنشطة بعد إكمالها.</p>`}</section>
<section class="art"><h2>نتائج الاختبارات القصيرة</h2>${qzs.length ? `<div class="sks">${qzs.map((x) => { const n = S.exp.qz[x.slug], t = x.data.qs.length; return `<div><span>${esc(x.title)}</span><b>${AD(n)} من ${AD(t)} من المحاولة الأولى</b><span class="bar"><i style="width:${(n / t) * 100}%"></i></span></div>`; }).join("")}</div><p class="hint">النتيجة أفضل محاولة، وللطفل أن يعيد الاختبار كما يشاء.</p>` : `<p class="tx">ستظهر النتائج بعد إكمال اختبار قصير.</p>`}</section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${skills.length ? `<ul class="tx">${skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="tx">ستظهر المهارات بعد إكمال الأنشطة.</p>`}</section>
<section class="art"><h2>التقدم في كل تصنيف</h2><p class="hint">المرحلة المعروضة: ${esc(LV[lv])}</p><div class="sks">${VALS.map((k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<div><span>${esc(PATHS[k][0])}</span><b>${AD(d)} من ${AD(its.length)}</b><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></div>`; }).join("")}</div></section>
${review.length ? `<section class="art"><h2>موضوعات يمكن مراجعتها</h2><p class="tx">لا بأس، العودة إلى هذه الموضوعات مرة أخرى تثبت المعلومة بهدوء.</p><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>أفكار استكشاف للأسرة</h2><ul class="rdtips">${tips.map((t) => `<li><b>${esc(t.title)}</b><p>${esc(t.family)}</p><ol>${t.data.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></li>`).join("")}</ul></section>
<section class="art"><h2>الشارات والإنجازات</h2>${bd.length ? `<div class="dgbd2">${bd.map((b) => `<span><img src="${icon(b[1])}" alt="" width="40" height="40"> ${esc(b[0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر الشارات بعد إكمال الأنشطة. الشارات تكافئ الجهد والفضول.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط، ولا تُرسل إلى أي حساب، ولا تظهر لأي زائر آخر. يُرسل فقط عدد الأخطاء المجهول لكل نشاط لتحسين المحتوى، دون اسم أو أي بيانات شخصية.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح تقدم الطفل في هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">متابعة الأنشطة</a><a class="abtn" href="../guide/">دليل ولي الأمر</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
  $("#rst").onclick = () => { if (!rstArm) { rstArm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد: سيُمسح التقدم"; return; } S.exp = { it: {}, pts: 0 }; save(); rstArm = false; progressPage(); toast("تم مسح تقدم هذا القسم."); };
}
/* ===== دليل ولي الأمر ===== */
function guidePage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>كيف ننمي فضول الطفل ومعرفته بالعالم بهدوء ومتعة.</p></div></div>
<section class="art"><h2>كيف تستخدم القسم؟</h2><ul class="tx"><li>اختر مرحلة طفلك. الأعمار الصغيرة تلعب بمشاركة الكبار الذين يقرؤون لهم.</li><li>ابدأ بنشاط اكتشف العالم من الصفحة الرئيسية، فهو يعرض موضوعا جديدا في كل مرة.</li><li>المستويات: أتعرف ثم أكتشف ثم أفهم، وكلها مفتوحة للطفل.</li><li>جلسة قصيرة من عشر دقائق أنفع من جلسة طويلة.</li></ul></section>
<section class="art"><h2>حسب العمر</h2><ul class="tx"><li><b>سنة إلى ٣ سنوات:</b> صور وأصوات ومطابقة بسيطة، مع قراءة الكبير وتسمية الأشياء.</li><li><b>٤ إلى ٦ سنوات:</b> بيئات الحيوانات وأجزاء النبات والكواكب والمهن ووسائل النقل بأسئلة قصيرة.</li><li><b>الصف الأول والثاني:</b> مبادئ العلوم والأرض والفضاء والبلدان والاختراعات والصحة.</li><li><b>الصف الثالث والرابع:</b> الظواهر الطبيعية والمجموعة الشمسية والقارات والمخترعون والطاقة.</li></ul></section>
<section class="art"><h2>كيف نتحدث بعد النشاط؟</h2><ul class="tx"><li>اسألوا: ماذا تعلمت اليوم؟ وما الذي أدهشك؟</li><li>اسألوا لماذا وكيف، وشجعوا الطفل على التخمين قبل الإجابة.</li><li>ابحثوا معا عن الجواب في كتاب أو موسوعة عندما لا تعرفون.</li><li>امدحوا الفضول والمحاولة لا النتيجة وحدها.</li></ul></section>
<section class="art"><h2>الأمان في الاستكشاف المنزلي</h2><ul class="tx"><li>كل نشاط استكشاف في القسم بمشاركة شخص بالغ.</li><li>لا نستخدم النار أو الأدوات الحادة أو المواد الكيميائية.</li><li>نغسل اليدين بعد لمس التراب والنباتات والحيوانات.</li><li>لا نأكل شيئا من الطبيعة قبل أن يتأكد الكبير منه.</li></ul></section>
<section class="art"><h2>عن صحة المعلومات</h2><p class="tx">كُتبت المعلومات بصياغة مبسطة وفُحصت بنيتها آليا، ولم تُراجع بعد من مختص تعليمي. إن وجدتم معلومة تحتاج تصحيحا فأخبرونا لنصححها.</p></section>
<div class="btns"><a class="abtn go" href="../">الثقافة العامة</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
}
/* ===== الطباعة ===== */
const PDFS = [["exp-animal-cards", "بطاقات الحيوانات", "ست بطاقات مصورة يمكن قصها واللعب بها.", "1f981"], ["exp-plant-parts", "ورقة أجزاء النبات", "صل بين جزء النبات ووظيفته.", "1f331"], ["exp-planets", "جدول الكواكب", "ترتيب الكواكب بالصور وأماكن للكتابة.", "1f680"], ["exp-senses", "ورقة الحواس الخمس", "اربط كل حاسة بعضوها وبما تفعله.", "1f440"], ["exp-jobs", "بطاقات المهن وأدواتها", "اربط المهنة بأداتها.", "x_doctor"], ["exp-transport", "تصنيف وسائل النقل", "صنف: بر وبحر وجو.", "1f697"], ["exp-explore-log", "سجل المستكشف الصغير", "صفحة لتسجيل ما اكتشفناه في المنزل.", "1f50d"], ["exp-parent-guide", "دليل ولي الأمر للطباعة", "صفحة نصائح مختصرة وآمنة.", "i_book"]];
function printPage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_notebook")}" alt=""><div><h1>أوراق وبطاقات للطباعة</h1><p>ملفات PDF جاهزة للتحميل والطباعة على ورق A4.</p></div></div><div class="dgl">${PDFS.map((x) => `<a class="dgi" href="${ROOT}files/explore/${x[0]}.pdf" target="_blank" rel="noopener"><img src="${icon(x[3])}" alt="" width="52" height="52"><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></a>`).join("")}</div><p class="hint">تُفتح الملفات في نافذة جديدة. عاين الملف قبل الطباعة.</p><p><a class="abtn" href="../">العودة إلى الثقافة العامة</a></p>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else if (PAGE === "print") printPage(); else hubPage(); })();
})();
