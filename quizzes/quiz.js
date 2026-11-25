/* الاختبارات والمسابقات التعليمية - زاد. سؤال واحد في كل مرة، تغذية راجعة مشجعة، نقاط وشارات، ومتابعة خاصة محفوظة في هذا الجهاز فقط. */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const PAGE = D.body.dataset.page || "";
const ROOT = new URL(PAGE === "hub" || !PAGE ? "../" : "../../", D.baseURI).href;
const $ = (s, r) => (r || D).querySelector(s);
const $$ = (s, r) => Array.from((r || D).querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`);
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const LVK = Object.keys(LV);
const CATS = { early: ["التعلم المبكر", "i_teddy"], arabic: ["اللغة العربية", "u_abc"], math: ["الرياضيات", "i_numbers"], english: ["اللغة الإنجليزية", "i_globe"], science: ["العلوم والمعرفة", "i_microscope"], values: ["القيم والمهارات الحياتية", "i_heart"] };
const DIFF = { easy: "سهل", mid: "متوسط", adv: "يحتاج تفكيرا" };
const CH = [
  ["letters", "تحدي الحروف", "u_abc", "أسئلة عن الحروف وأصواتها وتكوين الكلمات."],
  ["numbers", "تحدي الأرقام", "i_numbers", "عد وجمع وأنماط وأعداد."],
  ["pictures", "تحدي الصور", "i_search", "أسئلة تعتمد على الصور والمطابقة."],
  ["vocab", "تحدي المفردات", "i_books", "كلمات ومعان بالعربية والإنجليزية."],
  ["science", "تحدي العلوم", "i_microscope", "الطبيعة والحيوانات والكواكب والبيئة."],
  ["memory", "تحدي الذاكرة", "i_brain", "بطاقات وملاحظة وانتباه."],
  ["discover", "تحدي اكتشاف الإجابة", "i_bulb", "أسئلة تحتاج ملاحظة وتفكيرا."],
  ["review", "مسابقة مراجعة الدرس", "i_book", "أسئلة مراجعة، وتبدأ بما نحتاج إلى مراجعته."],
];
const LK = "zad-learn-v3", SK = "zad-quiz-lv"; let DB = null, S = null, Q = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; const q = (S.quiz = S.quiz || {}); q.h = q.h || {}; q.log = q.log || []; q.pts = q.pts || 0; q.badges = q.badges || {}; q.rw = q.rw || {}; q.sk = q.sk || {}; q.rv = q.rv || {}; q.ev = q.ev || []; Q = q;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
const young = (lv) => lv === "a2" || lv === "a3";
const isG = (lv) => lv && lv[0] === "g";
let ITEMS = [];
async function load() { try { ITEMS = await rest("qz_quizzes?status=eq.published&order=sort_order.asc&select=slug,cat,title,icon,levels,subject,skill,difficulty,descr,minutes,tags,questions,link,sort_order"); } catch { ITEMS = null; } }
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 2600); }
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W;
function speak(text, en) { if (!tts) return toast("الصوت غير متاح على هذا الجهاز."); try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = en ? "en-US" : "ar-SA"; u.rate = 0.8; speechSynthesis.speak(u); } catch { toast("تعذر تشغيل الصوت."); } }
W.addEventListener("pagehide", () => { if (tts) try { speechSynthesis.cancel(); } catch {} });
const spk = (txt, en, label, big) => `<button type="button" class="qzspk${big ? " big" : ""}" data-sp="${esc(txt)}" data-en="${en ? 1 : 0}" aria-label="${esc(label || "استمع")}"><img src="${icon("i_sound")}" alt="" width="26" height="26"><span>${big ? "اضغط لتسمع" : "استمع"}</span></button>`;
function bindSp(root) { $$(".qzspk", root).forEach((b) => { if (b._b) return; b._b = 1; b.onclick = (e) => { e.preventDefault(); speak(b.dataset.sp, b.dataset.en === "1"); }; }); }
/* ===== تسجيل الأخطاء التقنية (للإدارة) ===== */
const errSeen = new Set();
function reportErr(slug, qidx, kind, msg) {
  if (W.ZQ && W.ZQ._noReport) return;
  const k = slug + "#" + qidx + kind; if (errSeen.has(k)) return; errSeen.add(k);
  try { fetch(SB + "/rest/v1/qz_errors", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ quiz_slug: String(slug || "").slice(0, 80), qidx: qidx == null ? null : qidx, kind: String(kind).slice(0, 40), msg: String(msg || "").slice(0, 200), ua: (navigator.userAgent || "").slice(0, 120) }) }).catch(() => {}); } catch {}
}
const tx = (s, en) => (en ? String(s) : AD(s));
/* ===== النقاط والشارات ===== */
const BADGES = [
  ["first", "أول اختبار", "أكمل اختبارا واحدا", (x) => x.done >= 1], ["five", "٥ اختبارات", "أكمل ٥ اختبارات مختلفة", (x) => x.done >= 5], ["ten", "١٠ اختبارات", "أكمل ١٠ اختبارات مختلفة", (x) => x.done >= 10],
  ["retry", "لا أستسلم", "أعاد اختبارا وتحسنت نتيجته", (x) => x.improved >= 1], ["perfect", "نجمة كاملة", "أجاب إجابات صحيحة في اختبار كامل", (x) => x.perfect >= 1],
  ["review", "مراجع نشيط", "زار درسا للمراجعة بعد اختبار", (x) => x.reviewed >= 1], ["contest", "بطل المسابقات", "أكمل مسابقة", (x) => x.contests >= 1], ["team", "فريق متعاون", "أكمل مسابقة تعاونية", (x) => x.teams >= 1],
  ["c_early", "متقن التعلم المبكر", "أتقن ٣ اختبارات من التعلم المبكر", (x) => x.mast.early >= 3], ["c_arabic", "متقن العربية", "أتقن ٣ اختبارات من اللغة العربية", (x) => x.mast.arabic >= 3], ["c_math", "متقن الرياضيات", "أتقن ٣ اختبارات من الرياضيات", (x) => x.mast.math >= 3],
  ["c_english", "متقن الإنجليزية", "أتقن ٣ اختبارات من الإنجليزية", (x) => x.mast.english >= 3], ["c_science", "متقن العلوم", "أتقن ٣ اختبارات من العلوم", (x) => x.mast.science >= 3], ["c_values", "متقن القيم", "أتقن ٣ اختبارات من القيم", (x) => x.mast.values >= 3],
];
function stats() {
  const hs = Object.entries(Q.h).filter(([k]) => !k.startsWith("c:")), mast = {}; Object.keys(CATS).forEach((c) => (mast[c] = 0));
  hs.forEach(([k, h]) => { if (h.tot && h.best / h.tot >= 0.8 && mast[h.cat] != null) mast[h.cat]++; });
  return { done: hs.filter(([, h]) => h.n > 0).length, improved: Q.ev.filter((e) => e === "imp").length, perfect: Object.values(Q.h).filter((h) => h.tot && h.best === h.tot).length, reviewed: Object.keys(Q.rw).length, contests: Object.keys(Q.h).filter((k) => k.startsWith("c:") && Q.h[k].n > 0).length, teams: Q.ev.filter((e) => e === "team").length, mast };
}
function awardBadges() { const st = stats(), got = []; BADGES.forEach(([id, n, , f]) => { if (!Q.badges[id] && f(st)) { Q.badges[id] = Date.now(); got.push(n); } }); return got; }
const today = () => new Date().toISOString().slice(0, 10);
/* ===== حفظ نتيجة اختبار أو مسابقة ===== */
function record(key, title, cat, lv, items, opts) {
  const n = items.length, ok = items.filter((x) => x.ok).length, h = (Q.h[key] = Q.h[key] || { n: 0, best: 0, tot: n, cat, title, lvs: {} });
  const prevBest = h.n > 0 ? h.best : -1; h.n++; h.tot = n; h.cat = cat; h.title = title; h.last = Date.now(); h.lv = lv; h.lvs[lv] = Math.max(h.lvs[lv] || 0, Math.round((ok / n) * 100));
  const improved = prevBest >= 0 && ok > prevBest; if (ok > h.best) h.best = ok;
  let pts = 10 + 2 * ok + (improved ? 5 : 0);
  if (improved) Q.ev.push("imp"); if (opts && opts.team) Q.ev.push("team");
  Q.ev = Q.ev.slice(-40); Q.pts += pts;
  items.forEach((x) => {
    const s = (Q.sk[x.sk] = Q.sk[x.sk] || { ok: 0, n: 0, c: x.cat || cat }); s.n++; if (x.ok) s.ok++; s.c = x.cat || cat;
    if (x.key) { if (x.ok) delete Q.rv[x.key]; else if (!x.skipped || true) Q.rv[x.key] = Date.now(); }
  });
  Q.log.unshift({ k: key, t: title, c: cat, lv, ok, n, ts: Date.now(), team: !!(opts && opts.team) }); Q.log = Q.log.slice(0, 80);
  const got = awardBadges(); save(); return { pts, got, improved, ok, n };
}
/* ===== الصفحة: مساعدات عرض ===== */
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${LVK.map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
function fail(box) { box.innerHTML = `<div class="sempty"><h3>تعذر تحميل الاختبارات الآن</h3><p>تحقق من الاتصال ثم أعد المحاولة.</p><p><button type="button" class="abtn go" id="rt">إعادة المحاولة</button></p></div>`; $("#rt").onclick = () => location.reload(); }
const SH = { a2: "سنة", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات" };
const lvRange = (lv) => { const i = LVK.filter((k) => lv.includes(k)); if (!i.length) return ""; const f = i[0], l = i[i.length - 1]; const contiguous = LVK.indexOf(l) - LVK.indexOf(f) + 1 === i.length; if (!contiguous || i.length === 1) return i.map((k) => LV[k]).join("، "); if (f[0] === "a" && l[0] === "a") return "من " + SH[f] + " إلى " + SH[l]; if (f[0] === "g" && l[0] === "g") return LV[f] + " إلى " + LV[l]; return "من " + (f[0] === "a" ? SH[f] : LV[f]) + " إلى " + LV[l]; };
const elig = (lv) => ITEMS.filter((z) => z.levels.includes(lv));
const qUrl = (z, lv) => `${ROOT}quizzes/quiz/?q=${encodeURIComponent(z.slug)}&lv=${lv}`;
function qcard(z, lv) { const h = Q.h[z.slug], pc = h && h.tot ? Math.round((h.best / h.tot) * 100) : null; return `<a class="qzc${h && h.n ? " done" : ""}" href="${qUrl(z, lv)}">${h && h.n ? `<span class="qzok">أنجزته · ${AD(pc)}٪</span>` : ""}<img src="${icon(z.icon)}" alt="" width="52" height="52" loading="lazy"><b>${esc(z.title)}</b><small>${esc(z.skill)}</small><div class="qzmeta"><span>${AD(z.questions.length)} أسئلة</span><span>${esc(DIFF[z.difficulty] || "")}</span></div></a>`; }
/* ===== بناء مجموعة أسئلة المسابقة ===== */
function srcQ(z, i) { return { q: z.questions[i], src: { slug: z.slug, title: z.title, link: z.link, en: z.cat === "english", cat: z.cat }, key: z.slug + "#" + i }; }
function contestPool(id, lv) {
  const tag = id === "review" ? "review" : id, pool = [];
  elig(lv).forEach((z) => { if (z.tags && z.tags.includes(tag)) z.questions.forEach((_, i) => pool.push(srcQ(z, i))); });
  if (id === "review") { const mine = []; Object.keys(Q.rv).forEach((k) => { const [s, i] = k.split("#"); const z = ITEMS.find((x) => x.slug === s); if (z && z.levels.includes(lv) && z.questions[+i]) mine.push(srcQ(z, +i)); }); return { mine, pool }; }
  return { mine: [], pool };
}
function pickContest(id, lv, n) {
  const { mine, pool } = contestPool(id, lv), out = [], cnt = {};
  const take = (arr, cap) => shuf(arr).forEach((x) => { if (out.length >= n) return; if (out.some((o) => o.key === x.key)) return; if ((cnt[x.src.slug] || 0) >= cap) return; cnt[x.src.slug] = (cnt[x.src.slug] || 0) + 1; out.push(x); });
  take(mine, 3); take(pool, 2); if (out.length < n) take(pool, 4); if (out.length < n) take(pool, 99);
  return out;
}
W.ZQ = W.ZQ || {};
/* ===== محرك الأسئلة ===== */
const OKMSG = ["أحسنت، لقد تعلمت شيئًا جديدًا!", "رائع! إجابة صحيحة.", "تقدم جميل، واصل التعلم!", "ممتاز! استمر هكذا."];
const TYPES = ["mc", "fill", "listen", "pic", "prob", "tf", "match", "dnd", "order", "build", "obs", "mem"];
function validQ(q) {
  if (!q || typeof q !== "object" || !TYPES.includes(q.t) || !q.q) return "نوع أو نص غير صالح";
  const arr = (a, min) => Array.isArray(a) && a.length >= min;
  if (["mc", "fill", "listen", "pic", "prob"].includes(q.t)) { if (!arr(q.o, 2) || new Set(q.o).size !== q.o.length) return "خيارات غير صالحة"; if (q.t === "listen" && !q.say) return "لا نص للاستماع"; if (q.t === "prob" && !q.pr) return "لا مسألة مصورة"; }
  if (q.t === "tf" && typeof q.a !== "boolean") return "إجابة صح أو خطأ غير محددة";
  if (q.t === "match" && (!arr(q.pairs, 2) || q.pairs.some((p) => !p[0] || !(p[1] || p[2])))) return "أزواج غير صالحة";
  if (q.t === "dnd" && (!arr(q.items, 2) || !arr(q.groups, 2) || q.items.some((x) => x.g == null || !q.groups[x.g]))) return "مجموعات غير صالحة";
  if (q.t === "order" && !arr(q.items, 2)) return "عناصر الترتيب غير صالحة";
  if (q.t === "build" && (!q.w || q.w.length < 2)) return "كلمة غير صالحة";
  if (q.t === "obs" && (!arr(q.items, 3) || !arr(q.c, 1) || q.c.some((x) => !q.items[x]))) return "عناصر الملاحظة غير صالحة";
  if (q.t === "mem" && !arr(q.ic, 2)) return "بطاقات غير صالحة";
  return null;
}
const imgT = (src, w) => `<img src="${icon(src)}" alt="" width="${w || 56}" height="${w || 56}">`;
function runQuiz(root, cfg) {
  const items = cfg.items, N = items.length, st = items.map(() => ({ done: false, ok: false, tries: 0, skipped: false, bad: false })), lv = cfg.lv;
  let i = 0, tmr = 0, teamScore = 0;
  root.innerHTML = `<div class="qzp"><div class="qzh"><h1>${esc(cfg.title)}</h1><span class="qzpg" id="qpg"></span></div>
<div class="qzbar" role="progressbar" aria-label="تقدمك في الاختبار" aria-valuemin="0" aria-valuemax="${N}" id="qbar"><i></i></div><div class="qzdots" id="qdots" aria-hidden="true"></div>
${cfg.team ? '<div class="qzteam" id="qteam"></div>' : ""}${cfg.timer ? '<div class="qztm" id="qtm" aria-hidden="true"><i></i></div>' : ""}
<div class="qzcard" id="qbody"></div><div class="qzfb" id="qfb" role="status" aria-live="polite"></div>
<div class="qznav"><button type="button" class="abtn" id="qprev">السابق</button><button type="button" class="abtn" id="qskip">تخطي السؤال</button><button type="button" class="abtn go" id="qnext" disabled>التالي</button></div></div>`;
  const body = $("#qbody", root), fbE = $("#qfb", root), nx = $("#qnext", root), pv = $("#qprev", root), sk = $("#qskip", root);
  const fb = (m, k) => { fbE.className = "qzfb" + (m ? " on " + (k || "b") : ""); fbE.textContent = m || ""; };
  const nDone = () => st.filter((s) => s.done).length;
  function head() {
    $("#qpg", root).textContent = "السؤال " + AD(i + 1) + " من " + AD(N);
    const b = $("#qbar", root); b.setAttribute("aria-valuenow", nDone()); $("i", b).style.width = Math.round((nDone() / N) * 100) + "%";
    $("#qdots", root).innerHTML = st.map((s, k) => `<i class="${s.done ? (s.ok ? "ok" : "rv") : ""}${k === i ? " cur" : ""}"></i>`).join("");
    if (cfg.team) { const nm = cfg.team[i % 2]; $("#qteam", root).innerHTML = `<span>الدور الآن: ${esc(nm)}</span><span>نجمات الفريق: ${AD(teamScore)}</span>`; }
    pv.disabled = i === 0; nx.disabled = !st[i].done; sk.hidden = st[i].done; nx.textContent = i === N - 1 ? "عرض النتيجة" : "التالي";
  }
  function end(ok, msg) {
    const s = st[i]; if (s.done) return; s.done = true; s.ok = !!ok; if (ok && cfg.team) teamScore++;
    const why = items[i].q.why || ""; fb((ok ? OKMSG[Math.floor(Math.random() * OKMSG.length)] : "محاولة رائعة، لنراجع السؤال معًا.") + " " + tx(why, !!(items[i].src && items[i].src.en)) + (msg ? " " + msg : ""), ok ? "g" : "y");
    clearInterval(tmr); head(); try { nx.focus({ preventScroll: true }); } catch {}
  }
  const wrong = () => { const s = st[i]; s.tries++; return s.tries; };
  function timer() {
    clearInterval(tmr); const bar = $("#qtm i", root); if (!bar) return; let left = 30; bar.style.transition = "none"; bar.style.width = "100%"; setTimeout(() => (bar.style.transition = ""), 30);
    tmr = setInterval(() => { left--; bar.style.width = Math.max(0, (left / 30) * 100) + "%"; if (left <= 0) { clearInterval(tmr); if (!st[i].done) fb("انتهى الوقت المقترح، لا بأس! خذ وقتك وأكمل السؤال، فالنقاط لا تتأثر.", "b"); } }, 1000);
  }
  function show() {
    const it = items[i], s = st[i], q = it.q, en = !!(it.src && it.src.en), slug = (it.src && it.src.slug) || cfg.slug || "";
    fb(""); body.innerHTML = ""; const bad = validQ(q);
    if (bad) { reportErr(slug, it.key ? +String(it.key).split("#")[1] : i, "invalid", bad); s.done = true; s.ok = false; s.bad = true; body.innerHTML = '<div class="qzerr">تعذر عرض هذا السؤال الآن، سنتجاوزه ولا يؤثر على نتيجتك.</div>'; head(); return; }
    const t0 = `<div class="qzq" dir="auto">${esc(tx(q.q, en))}</div>`;
    if (s.done) { body.innerHTML = `${t0}<div class="qzfb on ${s.ok ? "g" : "y"}">${s.skipped ? "تخطيت هذا السؤال، يمكنك مراجعته لاحقا." : s.ok ? "أجبت عنه إجابة صحيحة." : "نراجعه معا."} ${esc(tx(q.why || "", en))}</div>`; head(); return; }
    W.ZQ._cur = { q, en };
    try { R[q.t]({ body, q, en, lv, st: s, fb, end, wrong, head: t0, slug }); } catch (e) { reportErr(slug, i, "render", (e && e.message) || "render"); s.done = true; s.ok = false; s.bad = true; body.innerHTML = '<div class="qzerr">تعذر عرض هذا السؤال الآن، سنتجاوزه ولا يؤثر على نتيجتك.</div>'; }
    bindSp(body); head(); if (cfg.timer && isG(lv) && !s.done) timer(); else clearInterval(tmr);
  }
  nx.onclick = () => { if (!st[i].done) return; if (i === N - 1) { clearInterval(tmr); return cfg.onFinish({ items, st }); } i++; show(); W.scrollTo({ top: 0 }); };
  pv.onclick = () => { if (i > 0) { i--; show(); } };
  sk.onclick = () => { if (st[i].done) return; st[i].done = true; st[i].skipped = true; st[i].ok = false; if (i === N - 1) { head(); fb("تخطيت هذا السؤال. اضغط عرض النتيجة.", "b"); } else { i++; show(); } };
  D.onkeydown = null; show();
  return { stop() { clearInterval(tmr); } };
}
/* ===== أنواع الأسئلة ===== */
function visuals(c) {
  const q = c.q; let h = "";
  if (q.ps) h += `<div class="qzps" dir="auto">${esc(q.ps)}</div>`;
  if (q.img) h += `<div class="qzqi">${imgT(q.img, 112)}</div>`;
  if (q.cnt) h += `<div class="qzcnt" role="img" aria-label="صور للعد">${Array.from({ length: q.cnt[1] }, () => imgT(q.cnt[0], 44)).join("")}</div>`;
  if (q.seq) h += `<div class="qzsq" role="img" aria-label="نمط من الأشكال">${q.seq.map((x) => imgT(x, 52)).join("")}<span class="qm">؟</span></div>`;
  if (q.pr) { const p = q.pr, g = (n, x) => `<div class="g">${Array.from({ length: n }, (_, k) => imgT(p.i, 38).replace("<img", x && k >= n - x ? '<img class="x"' : "<img")).join("")}</div>`; h += p.op === "+" ? `<div class="qzpr" role="img" aria-label="مسألة جمع مصورة">${g(p.a)}<b>+</b>${g(p.b)}</div>` : `<div class="qzpr" role="img" aria-label="مسألة طرح مصورة"><div class="g" style="max-width:100%">${Array.from({ length: p.a }, (_, k) => imgT(p.i, 38).replace("<img", k >= p.a - p.b ? '<img class="x"' : "<img")).join("")}</div></div>`; }
  return h;
}
const qHead = (c, extra) => `<div class="qzq" dir="auto">${esc(tx(c.q.q, c.en))}</div>` + (c.lv && c.lv[0] === "a" && c.q.t !== "listen" && !c.q.say ? `<div class="qzqi">${spk(c.q.q, false, "اقرأ لي السؤال")}</div>` : "") + visuals(c.q) + (extra || "");
function optsOf(q, en) {
  let L;
  if (q.t === "tf") L = [{ t: "صح", ok: q.a }, { t: "خطأ", ok: !q.a }];
  else if (q.t === "pic") L = q.o.map((x, k) => ({ i: x, nm: (q.nm && q.nm[k]) || "", ok: k === 0 }));
  else if (q.t === "listen" && q.oi) L = q.o.map((x, k) => ({ i: x, ok: k === 0 }));
  else L = q.o.map((x, k) => ({ t: x, i: q.oi ? q.oi[k] : null, ok: k === 0 }));
  return q.t === "tf" ? L : shuf(L);
}
function choice(c) {
  const q = c.q, L = optsOf(q, c.en), iconic = q.t !== "tf" && L.every((x) => x.i);
  let extra = "";
  if (q.t === "listen") extra = `<div class="qzqi">${spk(q.say, !!q.en, "استمع", true)}</div>`;
  else if (q.t === "pic" && q.say) extra = `<div class="qzqi">${spk(q.say, false, "استمع إلى الكلمة")}</div>`;
  c.body.innerHTML = qHead(c, extra) + `<div class="qzopts${iconic ? " i" : ""}" role="group" aria-label="الخيارات">${L.map((x, k) => `<button type="button" class="qzo" data-k="${k}" dir="auto">${x.i ? imgT(x.i, 68) : ""}${x.t != null ? `<span>${esc(tx(x.t, c.en))}</span>` : ""}${x.nm ? `<small>${esc(x.nm)}</small>` : ""}</button>`).join("")}</div>`;
  const bs = $$(".qzo", c.body); let left = L.length;
  bs.forEach((b, k) => (b.onclick = () => {
    if (c.st.done || b.disabled) return;
    if (L[k].ok) { b.classList.add("ok"); bs.forEach((x) => (x.disabled = true)); c.end(c.st.tries === 0); }
    else { b.classList.add("no"); b.disabled = true; left--; c.wrong(); if (c.st.tries >= 2 || left <= 1) { bs.forEach((x, j) => { x.disabled = true; if (L[j].ok) x.classList.add("ok"); }); c.end(false); } else c.fb("محاولة رائعة، جرّب مرة أخرى.", "y"); }
  }));
}
const R = { mc: choice, fill: choice, listen: choice, pic: choice, prob: choice, tf: choice };
R.match = function (c) {
  const q = c.q, P = q.pairs, Ls = P.map((p, k) => ({ k, t: p[0] })), Rs = shuf(P.map((p, k) => ({ k, t: p[1], i: p[2] })));
  c.body.innerHTML = qHead(c) + `<div class="qzmg"><div id="ml">${Ls.map((x) => `<button type="button" class="qzm" data-k="${x.k}" dir="auto">${esc(tx(x.t, c.en))}</button>`).join("")}</div><div id="mr">${Rs.map((x) => `<button type="button" class="qzm" data-k="${x.k}" dir="auto">${x.i ? imgT(x.i, 52) : ""}${x.t ? `<span>${esc(tx(x.t, c.en))}</span>` : ""}</button>`).join("")}</div></div>`;
  let sel = null, got = 0; const lb = $$("#ml .qzm", c.body), rb = $$("#mr .qzm", c.body);
  lb.forEach((b) => (b.onclick = () => { if (c.st.done || b.classList.contains("ok")) return; lb.forEach((x) => x.classList.remove("sel")); sel = b; b.classList.add("sel"); }));
  rb.forEach((b) => (b.onclick = () => {
    if (c.st.done || b.classList.contains("ok")) return; if (!sel) return c.fb("اضغط أولا على عنصر من العمود الأول.", "b");
    if (sel.dataset.k === b.dataset.k) { sel.classList.remove("sel"); sel.classList.add("ok"); b.classList.add("ok"); sel = null; got++; c.fb("", ""); if (got === P.length) c.end(c.st.tries === 0); }
    else { c.wrong(); [sel, b].forEach((x) => { x.classList.add("shake"); setTimeout(() => x.classList.remove("shake"), 350); }); sel.classList.remove("sel"); sel = null; c.fb("محاولة رائعة، جرّب وصلا آخر.", "y"); }
  }));
};
R.dnd = function (c) {
  const q = c.q, I = shuf(q.items.map((x, k) => Object.assign({ k }, x)));
  c.body.innerHTML = qHead(c) + `<div class="qzpool" id="dpool" aria-label="العناصر">${I.map((x) => `<button type="button" class="qzchip" data-k="${x.k}" dir="auto">${x.i ? imgT(x.i, 40) : ""}${esc(tx(x.t, c.en))}</button>`).join("")}</div><div class="qzgs">${q.groups.map((g, gi) => `<div class="qzg" data-g="${gi}" role="group" aria-label="${esc(g.n)}"><h3>${g.i ? imgT(g.i, 32) : ""}${esc(g.n)}</h3><div class="gi"></div></div>`).join("")}</div>`;
  let selK = null, placed = 0; const chips = $$(".qzchip", c.body), gs = $$(".qzg", c.body), byK = (k) => chips.find((x) => +x.dataset.k === k);
  function place(k, gi) {
    const chip = byK(k); if (!chip || chip.classList.contains("on") || c.st.done) return;
    if (q.items[k].g === gi) { chip.classList.remove("sel"); chip.classList.add("on"); chip.disabled = true; $(".gi", gs[gi]).appendChild(chip); selK = null; placed++; c.fb("", ""); if (placed === q.items.length) c.end(c.st.tries === 0); }
    else { c.wrong(); chip.classList.add("sel"); c.fb("ليس هنا، جرّب مكانا آخر.", "y"); setTimeout(() => chip.classList.remove("sel"), 600); selK = null; }
  }
  chips.forEach((chip) => {
    chip.addEventListener("pointerdown", (e) => {
      if (chip.classList.contains("on") || c.st.done) return; const k = +chip.dataset.k, sx = e.clientX, sy = e.clientY; let ghost = null, moved = false;
      const mv = (ev) => { if (!moved && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 8) { moved = true; ghost = chip.cloneNode(true); ghost.className = "qzghost"; D.body.appendChild(ghost); } if (ghost) { ghost.style.left = ev.clientX - 30 + "px"; ghost.style.top = ev.clientY - 24 + "px"; gs.forEach((g) => { const r = g.getBoundingClientRect(); g.classList.toggle("over", ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom); }); } };
      const up = (ev) => { D.removeEventListener("pointermove", mv); D.removeEventListener("pointerup", up); D.removeEventListener("pointercancel", up); gs.forEach((g) => g.classList.remove("over")); if (ghost) ghost.remove(); if (moved) { const g = gs.find((x) => { const r = x.getBoundingClientRect(); return ev.clientX >= r.left && ev.clientX <= r.right && ev.clientY >= r.top && ev.clientY <= r.bottom; }); if (g) place(k, +g.dataset.g); } else { chips.forEach((x) => x.classList.remove("sel")); if (selK === k) selK = null; else { selK = k; chip.classList.add("sel"); } } };
      D.addEventListener("pointermove", mv); D.addEventListener("pointerup", up); D.addEventListener("pointercancel", up);
    });
    chip.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); chips.forEach((x) => x.classList.remove("sel")); selK = +chip.dataset.k; chip.classList.add("sel"); } });
  });
  gs.forEach((g) => (g.onclick = () => { if (selK != null) place(selK, +g.dataset.g); }));
};
function sequencer(c, kind) {
  const q = c.q, isB = kind === "build";
  const parts = isB ? Array.from(q.w).map((ch, k) => ({ id: k, t: ch })) : q.items.map((x, k) => ({ id: k, t: x.t, i: x.i }));
  const correct = isB ? q.w : parts.map((p) => p.t).join("\u0001"), join = (a) => (isB ? a.map((p) => p.t).join("") : a.map((p) => p.t).join("\u0001"));
  const rtl = !(c.en || q.en); let pool = shuf(parts), row = [];
  const ch = (p) => `<button type="button" class="qzchip${isB ? " letter" : ""}" data-id="${p.id}" dir="auto">${p.i ? imgT(p.i, 40) : ""}${esc(p.t)}</button>`;
  c.body.innerHTML = qHead(c, isB && q.img ? `<div class="qzqi">${imgT(q.img, 112)}</div>` : "") + `<div class="qzrow${rtl ? "" : " ltr"}" id="srow" aria-label="إجابتك" aria-live="polite"></div><div class="qzpool${rtl ? "" : " ltr"}" id="spool" aria-label="العناصر"></div><div class="qznav"><button type="button" class="abtn" id="sclr">مسح</button><button type="button" class="abtn go" id="schk" disabled>تحقق من الإجابة</button></div>`;
  const rowE = $("#srow", c.body), poolE = $("#spool", c.body), chk = $("#schk", c.body);
  function draw() {
    rowE.innerHTML = row.map(ch).join("") || `<span class="ph" style="color:#9a8fc0">اضغط العناصر بالترتيب</span>`; poolE.innerHTML = pool.map(ch).join(""); chk.disabled = row.length !== parts.length || c.st.done;
    $$(".qzchip", poolE).forEach((b) => (b.onclick = () => { if (c.st.done) return; const p = pool.find((x) => x.id === +b.dataset.id); pool = pool.filter((x) => x !== p); row.push(p); draw(); }));
    $$(".qzchip", rowE).forEach((b) => (b.onclick = () => { if (c.st.done) return; const p = row.find((x) => x.id === +b.dataset.id); row = row.filter((x) => x !== p); pool.push(p); draw(); }));
  }
  $("#sclr", c.body).onclick = () => { if (c.st.done) return; pool = shuf(parts); row = []; draw(); };
  chk.onclick = () => {
    if (c.st.done || row.length !== parts.length) return;
    if (join(row) === correct) { $$(".qzchip", rowE).forEach((b) => b.classList.add("on")); chk.disabled = true; $("#sclr", c.body).disabled = true; c.end(c.st.tries === 0); }
    else { c.wrong(); if (c.st.tries >= 2) { row = parts.slice(); pool = []; draw(); $$(".qzchip", rowE).forEach((b) => b.classList.add("on")); chk.disabled = true; $("#sclr", c.body).disabled = true; c.end(false, "هذا هو الترتيب الصحيح."); } else { c.fb("اقتربت! جرّب ترتيبا آخر.", "y"); pool = shuf(parts); row = []; draw(); } }
  };
  draw();
}
R.order = (c) => sequencer(c, "order"); R.build = (c) => sequencer(c, "build");
R.obs = function (c) {
  const q = c.q, I = q.items.map((x, k) => ({ k, i: x.i, t: x.t }));
  c.body.innerHTML = qHead(c) + `<div class="qzobs" role="group" aria-label="الصور">${I.map((x) => `<button type="button" class="qzo" data-k="${x.k}" aria-pressed="false">${imgT(x.i, 68)}${x.t ? `<small>${esc(x.t)}</small>` : ""}</button>`).join("")}</div><div class="qznav"><button type="button" class="abtn go" id="ochk" disabled>تحقق من الإجابة</button></div>`;
  const bs = $$(".qzobs .qzo", c.body), chk = $("#ochk", c.body), set = new Set(q.c);
  const sel = () => bs.filter((b) => b.classList.contains("sel")).map((b) => +b.dataset.k);
  bs.forEach((b) => (b.onclick = () => { if (c.st.done) return; b.classList.toggle("sel"); b.setAttribute("aria-pressed", b.classList.contains("sel")); chk.disabled = !sel().length; }));
  chk.onclick = () => {
    if (c.st.done) return; const s = sel(), good = s.length === set.size && s.every((x) => set.has(x));
    if (good) { bs.forEach((b) => { b.disabled = true; if (set.has(+b.dataset.k)) b.classList.add("ok"); }); chk.disabled = true; c.end(c.st.tries === 0); }
    else { c.wrong(); if (c.st.tries >= 2) { bs.forEach((b) => { b.disabled = true; b.classList.remove("sel"); if (set.has(+b.dataset.k)) b.classList.add("ok"); else b.classList.add("no"); }); chk.disabled = true; c.end(false); } else c.fb("راجع الصور مرة أخرى وانتبه لكل صورة.", "y"); }
  };
};
R.mem = function (c) {
  const q = c.q, cards = shuf(q.ic.concat(q.ic)), cols = q.ic.length === 3 ? 3 : q.ic.length === 5 ? 5 : 4;
  c.body.innerHTML = qHead(c) + `<div class="qzmem" style="--c:${cols}">${cards.map((x, k) => `<button type="button" class="qzcd" data-k="${k}" aria-label="بطاقة مغلقة">؟<span class="f">${imgT(x, 60)}</span></button>`).join("")}</div>`;
  const bs = $$(".qzcd", c.body); let up = [], got = 0, lock = false;
  bs.forEach((b, k) => (b.onclick = () => {
    if (lock || c.st.done || b.classList.contains("up") || b.classList.contains("mt")) return; b.classList.add("up"); up.push(k);
    if (up.length === 2) { const [a, d] = up; if (cards[a] === cards[d]) { bs[a].classList.replace("up", "mt"); bs[d].classList.replace("up", "mt"); up = []; got++; if (got === q.ic.length) c.end(true); } else { lock = true; c.wrong(); setTimeout(() => { bs[a].classList.remove("up"); bs[d].classList.remove("up"); up = []; lock = false; }, 800); } }
  }));
};
/* ===== النتيجة ===== */
function showResult(root, cfg, res, rec) {
  const { items, st } = res, valid = items.map((it, k) => ({ it, s: st[k] })).filter((x) => !x.s.bad), n = valid.length, ok = valid.filter((x) => x.s.ok).length, ans = valid.filter((x) => !x.s.skipped).length, ratio = n ? ok / n : 0;
  const msg = ratio >= 0.8 ? "أحسنت، لقد تعلمت شيئًا جديدًا!" : ratio >= 0.5 ? "تقدم جميل، واصل التعلم!" : "محاولة رائعة، لنراجع الأسئلة معًا!";
  const stars = ratio >= 0.8 ? 3 : ratio >= 0.5 ? 2 : 1, good = [...new Set(valid.filter((x) => x.s.ok).map((x) => x.it.q.sk))], need = valid.filter((x) => !x.s.ok);
  const needSk = [...new Set(need.map((x) => x.it.q.sk))].filter((s) => !good.includes(s));
  let links = []; const seen = new Set(); (need.length ? need : valid).forEach((x) => { const l = x.it.src && x.it.src.link; if (l && l.href && !seen.has(l.href) && links.length < 3) { seen.add(l.href); links.push({ l, slug: x.it.src.slug }); } });
  root.innerHTML = `<div class="qzp qzres"><img src="${icon("zozo-win")}" alt="" width="120" height="120" style="object-fit:contain"><h1>${esc(msg)}</h1><div class="qzstars" aria-label="${stars} من ٣ نجوم">${"★".repeat(stars)}<span class="o">${"★".repeat(3 - stars)}</span></div>
<div class="qzstat"><div><b>${AD(ans)}</b><small>أسئلة أجبت عنها</small></div><div><b>${AD(ok)}</b><small>إجابات صحيحة من المحاولة الأولى</small></div><div><b>${AD(n)}</b><small>عدد الأسئلة</small></div>${rec ? `<div><b>+${AD(rec.pts)}</b><small>نقاط جديدة</small></div>` : ""}</div>
${cfg.team ? `<p class="hint"><b>فريقنا جمع معا ${AD(ok)} نجمة من ${AD(n)}.</b> نتعاون ولا نقارن أنفسنا بأحد.</p>` : ""}
${rec && rec.got.length ? `<div class="qzerr" role="status">شارة جديدة: ${rec.got.map((x) => esc(x)).join("، ")}</div>` : ""}${rec && rec.improved ? `<p class="hint"><b>نتيجتك أفضل من محاولتك السابقة. أحسنت!</b></p>` : ""}${!rec ? `<p class="hint">هذه معاينة ولا يتم حفظ أي نتيجة.</p>` : ""}
<section class="art"><h2>مهارات أظهرت فهمًا لها</h2><div class="qzsk">${good.length ? good.map((g) => `<span>${esc(g)}</span>`).join("") : '<span class="n">سنكمل التدريب معا للوصول إليها</span>'}</div>${needSk.length ? `<h2>مهارات نراجعها معًا</h2><div class="qzsk">${needSk.map((g) => `<span class="n">${esc(g)}</span>`).join("")}</div>` : ""}</section>
${need.length ? `<section class="art"><h2>أسئلة نراجعها معًا</h2><ul class="qzrl">${need.map((x) => `<li><b dir="auto">${esc(tx(x.it.q.q, !!(x.it.src && x.it.src.en)))}</b>${esc(tx(x.it.q.why || "", !!(x.it.src && x.it.src.en)))}${x.s.skipped ? " (تخطيته)" : ""}</li>`).join("")}</ul></section>` : ""}
${links.length ? `<section class="art"><h2>درس أو نشاط يساعدك على المراجعة</h2><div class="btns">${links.map((x) => `<a class="abtn go qzlesson" data-slug="${esc(x.slug)}" href="${ROOT}${esc(x.l.href)}">${esc(x.l.label)}</a>`).join("")}</div></section>` : ""}
<div class="btns"><button type="button" class="abtn go" id="qretry">أعد المحاولة</button><a class="abtn" href="${ROOT}quizzes/?lv=${cfg.lv}">اختبارات ومسابقات أخرى</a><a class="abtn" href="${ROOT}quizzes/progress/?lv=${cfg.lv}">لوحة المتابعة</a></div></div>`;
  $("#qretry", root).onclick = () => cfg.retry();
  $$(".qzlesson", root).forEach((a) => (a.onclick = () => { if (!rec) return; if (Q.rw[a.dataset.slug] !== today()) { Q.rw[a.dataset.slug] = today(); Q.pts += 3; awardBadges(); save(); } }));
  W.scrollTo({ top: 0 });
}
function finishRun(root, cfg, res) {
  const valid = res.items.map((it, k) => ({ it, s: res.st[k] })).filter((x) => !x.s.bad);
  if (!valid.length) { root.innerHTML = '<div class="sempty"><h3>تعذر عرض هذا الاختبار الآن</h3><p>نعمل على إصلاحه، جرّب اختبارا آخر.</p></div>'; return; }
  let rec = null;
  if (!cfg.preview) rec = record(cfg.key, cfg.title, cfg.cat, cfg.lv, valid.map((x) => ({ sk: x.it.q.sk, ok: x.s.ok, key: x.it.key, skipped: x.s.skipped, cat: x.it.src && x.it.src.cat })), { team: !!cfg.team });
  showResult(root, cfg, res, rec);
}
/* ===== الصفحة الرئيسية ===== */
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(); setLv(lv); let cat = p.get("c") || "";
  const st = stats(), E = elig(lv);
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>الاختبارات والمسابقات التعليمية</h1><p>اختبارات قصيرة ومسابقات ممتعة، بنتائج مشجعة ومراجعة بلا ضغط. لأعمار سنة إلى ٦ سنوات والصفوف ١ إلى ٤.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young(lv) ? "للأعمار الصغيرة: أسئلة قصيرة بالصور، ويجلس الكبير مع الطفل ويقرأ السؤال له. لا وقت محدد ولا ضغط." : "كل اختبار يعرض سؤالا واحدا في كل مرة، ويمكن إعادة المحاولة متى شئت."}</p></div>
<div class="qzstat"><div><b>${AD(st.done)}</b><small>اختبارات أنجزتها</small></div><div><b>${AD(Q.pts)}</b><small>نقاط</small></div><div><b>${AD(Object.keys(Q.badges).length)}</b><small>شارات</small></div></div>
<section class="art"><h2>مسابقات قصيرة</h2><p class="hint">مسابقات فردية أو تعاونية بين طفلين. لا ترتيب بين الأطفال ولا نقاط تُخصم عند الخطأ.</p>
<div class="qzgrid" id="qch">${CH.map(([id, t, i, d]) => { const n = id === "review" ? contestPool(id, lv).pool.length + contestPool(id, lv).mine.length : contestPool(id, lv).pool.length, okc = n >= 5; return `<a class="qzc${okc ? "" : " off"}" href="${okc ? `${ROOT}quizzes/play/?c=${id}&lv=${lv}` : "#"}" data-c="${id}" ${okc ? "" : 'aria-disabled="true"'}><img src="${icon(i)}" alt="" width="52" height="52"><b>${t}</b><small>${okc ? d : "غير متاحة لهذه المرحلة"}</small></a>`; }).join("")}</div></section>
<section class="art"><h2>اختبارات بحسب المادة</h2><div class="qzcats" id="qcats" role="group" aria-label="المادة"><button type="button" class="qzcat${cat ? "" : " on"}" data-c=""><span>الكل</span></button>${Object.entries(CATS).map(([k, [l, i]]) => `<button type="button" class="qzcat${cat === k ? " on" : ""}" data-c="${k}"><img src="${icon(i)}" alt="">${esc(l)}</button>`).join("")}</div><div class="qzgrid" id="qlist" aria-live="polite"></div></section>
<div class="btns"><a class="abtn go" href="${ROOT}quizzes/progress/?lv=${lv}">لوحة المتابعة وسجل الإنجازات</a><a class="abtn" href="${ROOT}quizzes/guide/">دليل ولي الأمر</a><a class="abtn" href="${ROOT}tests/">اختبارات المنصة الأخرى</a></div>`;
  function list() { const L = E.filter((z) => !cat || z.cat === cat); $("#qlist").innerHTML = L.length ? L.map((z) => qcard(z, lv)).join("") : `<div class="sempty"><h3>لا توجد اختبارات لهذه المرحلة في هذه المادة بعد</h3><p>جرّب مادة أخرى.</p></div>`; }
  $$(".qzcat", box).forEach((b) => (b.onclick = () => { cat = b.dataset.c; $$(".qzcat", box).forEach((x) => x.classList.toggle("on", x === b)); list(); }));
  $$("#qch .qzc.off", box).forEach((a) => a.addEventListener("click", (e) => e.preventDefault()));
  list();
}
/* ===== صفحة الاختبار قبل البدء ===== */
function quizPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), z = ITEMS.find((x) => x.slug === p.get("q")); let lv = getLv();
  if (!z) return (box.innerHTML = `<div class="sempty"><h3>الاختبار غير موجود أو غير منشور</h3><p><a class="abtn go" href="../">كل الاختبارات</a></p></div>`);
  if (!z.levels.includes(lv)) lv = z.levels[0];
  document.title = z.title + " | الاختبارات | منصة زاد التعليمية"; const h = Q.h[z.slug];
  box.innerHTML = `<div class="hero"><img src="${icon(z.icon)}" alt=""><div><h1>${esc(z.title)}</h1><p>${esc(z.descr)}</p></div></div>
<div class="qzdet"><dl><dt>الفئة المناسبة</dt><dd>${esc(lvRange(z.levels))}</dd><dt>المادة</dt><dd>${esc(z.subject)}</dd><dt>المهارة</dt><dd>${esc(z.skill)}</dd><dt>عدد الأسئلة</dt><dd>${AD(z.questions.length)}</dd><dt>مستوى الصعوبة</dt><dd>${esc(DIFF[z.difficulty])}</dd><dt>مدة مقترحة</dt><dd>${young(lv) ? "خذ وقتك، لا يوجد وقت محدد" : "نحو " + AD(z.minutes) + " دقائق، وليست إلزامية"}</dd>${h && h.n ? `<dt>محاولاتك السابقة</dt><dd>${AD(h.n)} · أفضل نتيجة ${AD(h.best)} من ${AD(h.tot)}</dd>` : ""}</dl>
<div class="stg"><b>مرحلة الطفل</b><div class="dtabs">${z.levels.map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="?q=${encodeURIComponent(z.slug)}&lv=${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div></div>
<p class="hint">${young(lv) ? "يجلس الكبير مع الطفل، ويقرأ السؤال، ويشجعه على المحاولة." : "ستظهر الأسئلة واحدا واحدا، ولكل سؤال محاولتان، ثم نراجع الإجابة معا."}</p>
<div class="btns"><a class="abtn go" id="qgo" href="${ROOT}quizzes/play/?q=${encodeURIComponent(z.slug)}&lv=${lv}">ابدأ الاختبار</a><a class="abtn" href="${ROOT}${esc(z.link.href)}">${esc(z.link.label)}</a><a class="abtn" href="${ROOT}quizzes/?lv=${lv}">كل الاختبارات</a></div></div>`;
  setLv(lv);
}
/* ===== صفحة اللعب ===== */
function playPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search); let lv = getLv(); const cid = p.get("c"), team = p.get("team") === "1", timer = p.get("timer") === "1";
  if (cid) {
    const ch = CH.find((x) => x[0] === cid); if (!ch) return (box.innerHTML = `<div class="sempty"><h3>المسابقة غير موجودة</h3><p><a class="abtn go" href="../">الاختبارات</a></p></div>`);
    const go = () => {
      const qs = pickContest(cid, lv, 8);
      if (qs.length < 5) return (box.innerHTML = `<div class="sempty"><h3>لا تتوفر أسئلة كافية لهذه المرحلة بعد</h3><p><a class="abtn go" href="../?lv=${lv}">اختر مسابقة أخرى</a></p></div>`);
      const names = ["اللاعب الأول", "اللاعب الثاني"], cfg = { title: ch[1] + (team ? " (فريق)" : ""), items: qs, lv, team: team ? names : null, timer: timer && isG(lv), key: "c:" + cid, cat: "contest", retry: go, onFinish: (r) => finishRun(box, cfg, r) };
      box.innerHTML = '<div id="qroot"></div>'; runQuiz($("#qroot"), cfg);
    };
    if (!p.get("start")) {
      box.innerHTML = `<div class="hero"><img src="${icon(ch[2])}" alt=""><div><h1>${esc(ch[1])}</h1><p>${esc(ch[3])}</p></div></div><div class="qzdet"><div class="stg"><b>مرحلة الطفل</b>${stagePills(lv, `?c=${cid}`)}</div>
<div class="qzopt"><label><input type="radio" name="qm" value="0" checked>فردية</label><label><input type="radio" name="qm" value="1">تعاونية بين طفلين، ونجمع النقاط معا</label></div>
${isG(lv) ? '<div class="qzopt"><label><input type="checkbox" id="qtm">شريط وقت لطيف (اختياري، ولا يؤثر على النقاط)</label></div>' : ""}
<p class="hint">${young(lv) ? "لا يوجد وقت محدد. يجلس الكبير مع الطفل." : "٨ أسئلة قصيرة. لا ترتيب بين الأطفال ولا خصم نقاط عند الخطأ."}</p><div class="btns"><button type="button" class="abtn go" id="qgo">ابدأ المسابقة</button><a class="abtn" href="../?lv=${lv}">رجوع</a></div></div>`;
      $("#qgo").onclick = () => { const tm = $("#qtm"); const u = new URL(location.href); u.searchParams.set("start", "1"); u.searchParams.set("lv", lv); u.searchParams.set("team", ($('input[name="qm"]:checked').value === "1") ? "1" : "0"); u.searchParams.set("timer", tm && tm.checked ? "1" : "0"); location.href = u.toString(); };
      return;
    }
    return go();
  }
  const z = ITEMS.find((x) => x.slug === p.get("q"));
  if (!z) return (box.innerHTML = `<div class="sempty"><h3>الاختبار غير موجود أو غير منشور</h3><p><a class="abtn go" href="../">كل الاختبارات</a></p></div>`);
  if (!z.levels.includes(lv)) lv = z.levels[0];
  document.title = z.title + " | الاختبارات | منصة زاد التعليمية";
  const go = () => { const items = z.questions.map((q, i) => ({ q, src: { slug: z.slug, title: z.title, link: z.link, en: z.cat === "english", cat: z.cat }, key: z.slug + "#" + i })); const cfg = { title: z.title, items, lv, slug: z.slug, key: z.slug, cat: z.cat, retry: go, onFinish: (r) => finishRun(box, cfg, r) }; box.innerHTML = '<div id="qroot"></div>'; runQuiz($("#qroot"), cfg); };
  go();
}
/* ===== لوحة المتابعة (ولي الأمر) ===== */
const fdate = (t) => { try { return new Date(t).toLocaleDateString("ar-OM", { day: "numeric", month: "short", year: "numeric" }); } catch { return ""; } };
function progressPage() {
  const box = $("#aview"), lv = getLv(); setLv(lv); const st = stats(), E = elig(lv), kid = DB.kids[DB.cur] && DB.kids[DB.cur].name;
  const hs = Object.entries(Q.h).filter(([k]) => !k.startsWith("c:")), attempts = Object.values(Q.h).reduce((a, h) => a + (h.n || 0), 0);
  const bySub = Object.entries(CATS).map(([k, [l, i]]) => { const tot = E.filter((z) => z.cat === k).length, mine = hs.filter(([s, h]) => h.cat === k && E.some((z) => z.slug === s)), avg = mine.length ? Math.round(mine.reduce((a, [, h]) => a + (h.tot ? (h.best / h.tot) * 100 : 0), 0) / mine.length) : 0; return { k, l, i, tot, done: mine.length, avg }; }).filter((x) => x.tot > 0);
  const sks = Object.entries(Q.sk), mast = sks.filter(([, s]) => s.n >= 3 && s.ok / s.n >= 0.8), need = sks.filter(([, s]) => s.n >= 2 && s.ok / s.n < 0.6);
  const byLv = LVK.map((k) => { const L = Q.log.filter((e) => e.lv === k); return { k, n: L.length, avg: L.length ? Math.round((L.reduce((a, e) => a + e.ok / e.n, 0) / L.length) * 100) : 0 }; }).filter((x) => x.n);
  const sug = (sk) => ITEMS.find((z) => z.questions.some((q) => q.sk === sk));
  const rvN = Object.keys(Q.rv).length, earned = Object.entries(Q.badges).sort((a, b) => b[1] - a[1]);
  box.innerHTML = `<div class="hero"><img src="${icon("i_chart")}" alt=""><div><h1>لوحة متابعة الاختبارات${kid ? " · " + esc(kid) : ""}</h1><p>نتائج الطفل ومهاراته وما يحتاج إلى مراجعة. هذه البيانات خاصة بالطفل وولي أمره، محفوظة في هذا الجهاز فقط ولا تُعرض لأحد.</p></div></div>
<div class="stg"><b>المرحلة المعروضة للمقارنة مع الاختبارات المتاحة</b>${stagePills(lv, "./")}</div>
<div class="qzstat"><div><b>${AD(st.done)}</b><small>اختبارات مكتملة</small></div><div><b>${AD(attempts)}</b><small>محاولات</small></div><div><b>${AD(Q.pts)}</b><small>نقاط</small></div><div><b>${AD(Object.keys(Q.badges).length)}</b><small>شارات</small></div></div>
<section class="art"><h2>التقدم حسب المادة</h2>${bySub.length ? `<div class="qzbars">${bySub.map((x) => `<div class="qzbr"><span>${esc(x.l)}</span><span class="tr"><i style="width:${x.tot ? Math.round((x.done / x.tot) * 100) : 0}%"></i></span><span>${AD(x.done)} من ${AD(x.tot)}${x.done ? " · متوسط " + AD(x.avg) + "٪" : ""}</span></div>`).join("")}</div>` : '<p class="hint">لا توجد اختبارات لهذه المرحلة.</p>'}</section>
<section class="art"><h2>التقدم حسب الصف أو العمر</h2>${byLv.length ? `<div class="qzbars">${byLv.map((x) => `<div class="qzbr"><span>${esc(LV[x.k])}</span><span class="tr"><i style="width:${x.avg}%"></i></span><span>${AD(x.n)} محاولة · ${AD(x.avg)}٪</span></div>`).join("")}</div>` : '<p class="hint">ستظهر هنا النتائج بعد أول اختبار.</p>'}</section>
<section class="art"><h2>مهارات أتقنها الطفل</h2><div class="qzsk">${mast.length ? mast.map(([k]) => `<span>${esc(k)}</span>`).join("") : '<span class="n">تظهر المهارة هنا بعد ٣ إجابات على الأقل ونسبة نجاح ٨٠٪ فأكثر</span>'}</div></section>
<section class="art"><h2>مهارات تحتاج إلى تدريب</h2>${need.length || rvN ? `<ul class="qzrl">${need.map(([k, s]) => { const z = sug(k); return `<li><b>${esc(k)}</b>${AD(s.ok)} إجابة صحيحة من ${AD(s.n)} محاولة. ${z ? `<span class="btns" style="margin-top:6px"><a class="abtn go" href="${qUrl(z, z.levels.includes(lv) ? lv : z.levels[0])}">أعد اختبار ${esc(z.title)}</a><a class="abtn" href="${ROOT}${esc(z.link.href)}">${esc(z.link.label)}</a></span>` : ""}</li>`; }).join("")}${rvN ? `<li><b>أسئلة محفوظة للمراجعة: ${AD(rvN)}</b>تظهر أولا في «مسابقة مراجعة الدرس». <a class="abtn go" href="${ROOT}quizzes/play/?c=review&lv=${lv}">ابدأ مسابقة المراجعة</a></li>` : ""}</ul>` : '<p class="hint">لا توجد مهارات تحتاج تدريبا الآن. أحسنت!</p>'}</section>
<section class="art"><h2>نتائج الاختبارات السابقة</h2>${Q.log.length ? `<ul class="qzrl">${Q.log.slice(0, 15).map((e) => `<li><b>${esc(e.t)}${e.team ? " (فريق)" : ""}</b>${AD(e.ok)} من ${AD(e.n)} · ${esc(LV[e.lv] || "")} · ${esc(fdate(e.ts))}</li>`).join("")}</ul>` : '<p class="hint">لا توجد نتائج بعد. ابدأ باختبار قصير!</p>'}</section>
<section class="art"><h2>سجل الإنجازات والشارات</h2><div class="qzbd">${BADGES.map(([id, n, d]) => `<div class="${Q.badges[id] ? "on" : ""}"><b>${Q.badges[id] ? "★" : "☆"}</b>${esc(n)}<br><small>${esc(d)}${Q.badges[id] ? " · " + esc(fdate(Q.badges[id])) : ""}</small></div>`).join("")}</div>${earned.length ? "" : '<p class="hint">تُمنح الشارات عند إتقان مجموعة من المهارات وعند مراجعة الدروس.</p>'}</section>
<div class="btns"><a class="abtn go" href="${ROOT}quizzes/?lv=${lv}">اختبارات ومسابقات</a><a class="abtn" href="${ROOT}quizzes/guide/">دليل ولي الأمر</a><button type="button" class="abtn qzdanger" id="qreset">مسح تقدم الاختبارات من هذا الجهاز</button></div><p class="hint" id="qrm"></p>`;
  let arm = false; $("#qreset").onclick = () => { if (!arm) { arm = true; $("#qrm").textContent = "اضغط الزر مرة ثانية لتأكيد المسح. لن يتأثر تقدم الأقسام الأخرى."; $("#qreset").textContent = "نعم، امسح تقدم الاختبارات"; return; } S.quiz = {}; save(); location.reload(); };
}
function guidePage() {
  $("#aview").innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>كيف نستعمل الاختبارات والمسابقات مع الطفل بلا ضغط.</p></div></div>
<section class="art"><h2>ما هذا القسم؟</h2><p>اختبارات قصيرة ومسابقات ممتعة لمراجعة ما تعلمه الطفل في العربية والرياضيات والإنجليزية والعلوم والقيم والتعلم المبكر، لأعمار سنة إلى ٦ سنوات وللصفوف ١ إلى ٤.</p></section>
<section class="art"><h2>كيف نستعملها؟</h2><ul class="dgsteps"><li>اختر مرحلة الطفل من أعلى الصفحة.</li><li>للأعمار الصغيرة اجلس مع الطفل واقرأ السؤال له، وشجعه على المحاولة دون استعجال.</li><li>لكل سؤال محاولتان، ثم نعرض الإجابة الصحيحة بلطف ونكمل.</li><li>في النهاية تظهر نتيجة مشجعة، والمهارات التي نجح فيها، وأسئلة نراجعها معا، وزر إلى درس أو نشاط مناسب.</li></ul></section>
<section class="art"><h2>النقاط والشارات</h2><ul class="dgsteps"><li>١٠ نقاط عند إكمال اختبار، ونقطتان لكل إجابة صحيحة من المحاولة الأولى.</li><li>٥ نقاط إضافية عند تحسن النتيجة في إعادة المحاولة.</li><li>٣ نقاط مرة واحدة كل يوم عند فتح الدرس المقترح بعد الاختبار (تُمنح عند فتح الدرس وليست دليلا على إتقانه).</li><li>لا تُخصم نقاط أبدا عند الخطأ، ولا تعتمد النقاط على السرعة.</li><li>تُمنح شارة الإتقان عندما يحقق الطفل ٨٠٪ فأكثر في ٣ اختبارات من المادة نفسها.</li></ul></section>
<section class="art"><h2>المسابقات</h2><p>ثماني مسابقات قصيرة تُبنى من أسئلة الاختبارات المنشورة بحسب المرحلة. يمكن لعبها منفردة أو بين طفلين يتناوبان الدور ويجمعان النجمات معا. لا يوجد ترتيب بين الأطفال. في الصفوف ١ إلى ٤ يوجد شريط وقت اختياري لطيف لا يؤثر على النقاط. تبدأ «مسابقة مراجعة الدرس» بالأسئلة التي احتاج الطفل إلى مراجعتها.</p></section>
<section class="art"><h2>الخصوصية</h2><p>نتائج الطفل محفوظة في هذا الجهاز فقط داخل المتصفح، ولا تُرسل إلى أي خادم ولا تُعرض لأحد. يمكنك مسحها من لوحة المتابعة. الأخطاء التقنية في الأسئلة فقط (مثل سؤال لا يظهر) تُرسل دون أي بيانات عن الطفل.</p></section>
<section class="art"><h2>ما الذي يجب أن تعرفه؟</h2><ul class="dgsteps"><li>الصوت يعمل بصوت الجهاز عند الضغط على زر الاستماع فقط، وقد يختلف نطقه من جهاز إلى آخر.</li><li>راجعت المنصة الأسئلة والإجابات داخليا، ولم يراجعها مختص تربوي بعد.</li><li>لعبة الذاكرة تُحتسب صحيحة عند إكمالها.</li><li>الاختبارات أداة مراجعة وتشجيع وليست تقييما رسميا ولا تشخيصا لمستوى الطفل.</li></ul></section>
<div class="btns"><a class="abtn go" href="${ROOT}quizzes/">الاختبارات والمسابقات</a><a class="abtn" href="${ROOT}quizzes/progress/">لوحة المتابعة</a></div>`;
}
/* ===== معاينة للإدارة: تشغيل الاختبار دون حفظ أي نتيجة ===== */
W.ZQ.preview = function (root, z, lv) {
  loadDB(); const items = (z.questions || []).map((q, i) => ({ q, src: { slug: z.slug || "preview", title: z.title, link: z.link || {}, en: z.cat === "english", cat: z.cat }, key: (z.slug || "preview") + "#" + i }));
  lv = lv || (z.levels && z.levels[0]) || "a5"; const cfg = { title: z.title || "معاينة", items, lv, preview: true, slug: z.slug || "preview", cat: z.cat, retry: () => W.ZQ.preview(root, z, lv), onFinish: (r) => finishRun(root, cfg, r) };
  W.ZQ._noReport = true; return runQuiz(root, cfg);
};
W.ZQ.validQ = validQ; W.ZQ.icon = icon;
async function init() {
  if (W.__ZQPREVIEW) { const pv = W.__ZQPREVIEW; return W.ZQ.preview($("#aview"), pv.quiz, pv.lv); }
  loadDB(); const box = $("#aview"); if (PAGE === "guide") return guidePage();
  await load(); if (ITEMS === null) return fail(box);
  ({ hub: hubPage, quiz: quizPage, play: playPage, progress: progressPage })[PAGE](); const p = D.getElementById("avw"); if (p) p.setAttribute("aria-busy", "false");
}
if (D.body.classList.contains("qz")) init();
})();
