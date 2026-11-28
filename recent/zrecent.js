/* تابع من حيث توقفت: سجل استخدام فعلي (يُسجَّل فقط عند فتح محتوى منشور)، لكل طفل، على الجهاز.
   المخزن: zad-recent-v1 = { v:1, kids:{ [kidId]:{ hide:bool, items:{ "src:slug": { at } } } } }
   مفصول عن سجل الطفل (zad-learn-v3) عمدًا: المشغّلات تحفظ ذلك السجل كاملًا من نسخة قديمة في ذاكرتها، فكتابتنا فيه كانت ستضيع.
   الحالة (بدأت/أكملت) والموضع تُقرأ من سجلات الطفل الموجودة فقط؛ فتح المحتوى لا يُحسب إنجازًا أبدًا. */
(function (W) {
"use strict";
const LK = "zad-learn-v3", RK = "zad-recent-v1", CK = "zad-recent-cfg", MAXI = 100;
const SCR = document.currentScript ? document.currentScript.src : location.href;
const ROOT = new URL("../", SCR).href;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
const H = { apikey: ANON, Authorization: "Bearer " + ANON };
/* مصدر المحتوى ← نوع المحتوى (مطابق لمحرك البحث) وجدوله ومسار صفحة تشغيله */
const SRC_CT = { lib: "ws", acts: "home", bank: "res", proj: "project", life: "res", ready: "res", val: "res", exp: "res", vid: "video", songs: "res", games: "game", stories: "story", quiz: "quiz" };
const TABLE = { acts: "activities", bank: "bank_items", proj: "proj_items", life: "life_items", ready: "ready_items", val: "val_items", exp: "exp_items", vid: "video_items", songs: "song_items", stories: "stories", quiz: "qz_quizzes" };
const PAGES = [["activities/view/", "a", "acts"], ["bank/play/", "s", "bank"], ["projects/play/", "s", "proj"], ["life/play/", "s", "life"], ["ready/play/", "s", "ready"], ["values/play/", "s", "val"], ["explore/play/", "s", "exp"], ["videos/play/", "s", "vid"], ["songs/play/", "s", "songs"], ["stories/read/", "s", "stories"], ["quizzes/quiz/", "q", "quiz"]];
const SRC_NAME = { lib: "الملفات التعليمية", acts: "أنشطة منزلية", bank: "بنك الأنشطة", proj: "مشاريع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "قيم وسلوك", exp: "ثقافة عامة", vid: "دروس مرئية", songs: "أناشيد", games: "ألعاب", stories: "قصص", quiz: "اختبارات" };
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);

/* ---------- إعدادات المسؤول (تُخزَّن مؤقتًا ساعة) ---------- */
let CFG = (() => { const c = lget(CK, null); return c && c.t && Date.now() - c.t < 36e5 ? c : { t: 0, offT: [], offS: [], days: 30, pos: true }; })();
let cfgP = null;
function loadCfg() {
  if (CFG.t) return Promise.resolve(CFG); if (cfgP) return cfgP;
  cfgP = fetch(SB + "/rest/v1/recent_cfg?select=k,v", { headers: H }).then((r) => (r.ok ? r.json() : Promise.reject())).then((a) => {
    const g = (k, d) => { const x = a.find((y) => y.k === k); return x ? x.v : d; };
    const days = Number(g("days", 30)); CFG = { t: Date.now(), offT: Array.isArray(g("off_types", [])) ? g("off_types", []) : [], offS: Array.isArray(g("off_srcs", [])) ? g("off_srcs", []) : [], days: days >= 7 && days <= 180 ? days : 30, pos: g("pos", true) !== false };
    try { localStorage.setItem(CK, JSON.stringify(CFG)); } catch (e) { /* */ } return CFG;
  }).catch(() => CFG);
  return cfgP;
}
const srcOf = (k) => String(k).split(":")[0];
const allowed = (key) => { const s = srcOf(key); return !CFG.offS.includes(s) && !CFG.offT.includes(SRC_CT[s]); };

/* ---------- التخزين لكل طفل ---------- */
const kidId = () => { const D = lget(LK, null); if (D && D.kids && Object.keys(D.kids).length) return D.kids[D.cur] ? D.cur : Object.keys(D.kids)[0]; return "k1"; };
function rd() { const d = lget(RK, null); const o = d && typeof d === "object" && d.kids && typeof d.kids === "object" ? d : { v: 1, kids: {} }; return o; }
function mut(fn) {
  const d = rd(), k = kidId(); const m = (d.kids[k] = d.kids[k] || {}); m.items = m.items && typeof m.items === "object" ? m.items : {};
  const r = fn(m); try { localStorage.setItem(RK, JSON.stringify(d)); } catch (e) { return { ok: false }; }
  try { W.dispatchEvent(new CustomEvent("zad-recent")); } catch (e) { /* */ } return r === undefined ? { ok: true } : r;
}
const me = () => { const m = rd().kids[kidId()] || {}; return { hide: !!m.hide, items: m.items && typeof m.items === "object" ? m.items : {} }; };
function prune(m) { const lim = Date.now() - CFG.days * 864e5; Object.keys(m.items).forEach((k) => { if (!(m.items[k].at > lim)) delete m.items[k]; }); const ks = Object.keys(m.items).sort((a, b) => m.items[b].at - m.items[a].at); ks.slice(MAXI).forEach((k) => delete m.items[k]); }
/** يسجّل فتح المحتوى (يُستدعى فقط بعد التأكد أنه منشور وأن المستخدم فتحه فعلًا) */
function put(key) { if (!/^[a-z]{2,8}:[^\s<>@]{1,100}$/i.test(key) || !allowed(key)) return false; mut((m) => { m.items[key] = { at: Date.now() }; prune(m); }); return true; }
const remove = (key) => mut((m) => { delete m.items[key]; });
const clear = () => mut((m) => { m.items = {}; });
const setHide = (v) => mut((m) => { m.hide = !!v; });
function list() { const m = me(), lim = Date.now() - CFG.days * 864e5; return Object.keys(m.items).filter((k) => m.items[k].at > lim && allowed(k)).map((k) => ({ key: k, at: m.items[k].at })).sort((a, b) => b.at - a.at); }

/* ---------- حالة النشاط والموضع: قراءة فقط من سجلات الطفل ---------- */
function kidRec() { const D = lget(LK, null); return D && D.kids ? D.kids[D.cur] || D.kids[Object.keys(D.kids)[0]] || {} : {}; }
function status(key) {
  const i = key.indexOf(":"), src = key.slice(0, i), slug = key.slice(i + 1), K = kidRec(); const g = (o, ...p) => p.reduce((a, x) => (a == null ? a : a[x]), o);
  if (src === "acts") return g(K, "acts", slug) ? "done" : "opened";
  if (src === "bank" || src === "proj") return g(K, src, "done", slug) ? "done" : g(K, src, "started", slug) ? "started" : "opened";
  if (src === "vid") return g(K, "vid", "done", slug) ? "done" : g(K, "vid", "pos", slug) ? "started" : "opened";
  if (src === "songs") return g(K, "songs", "done", slug) ? "done" : "opened";
  if (["life", "ready", "val", "exp"].includes(src)) return g(K, src, "it", slug, "d") > 0 ? "done" : "opened";
  if (src === "stories") return g(K, "stories", slug) ? "done" : "opened";
  if (src === "quiz") return g(K, "quiz", "h", slug, "n") > 0 ? "done" : "opened";
  return "opened";
}
/** نقطة متابعة حقيقية إن وُجدت (دروس مرئية ومشاريع فقط)؛ غير ذلك يُفتح المحتوى من بدايته */
function resume(key) {
  if (!CFG.pos) return null; const i = key.indexOf(":"), src = key.slice(0, i), slug = key.slice(i + 1), K = kidRec();
  if (src === "vid") { const n = K.vid && K.vid.pos && K.vid.pos[slug]; if (n > 0 && !(K.vid.done && K.vid.done[slug])) return "من المشهد " + AD(n + 1); }
  if (src === "proj") { const n = K.proj && K.proj.steps && K.proj.steps[slug]; if (n > 0 && !(K.proj.done && K.proj.done[slug])) return "من الخطوة " + AD(n + 1); }
  return null;
}
const ST_TXT = { done: "أكملت النشاط", started: "بدأت النشاط", opened: "فتحت المحتوى" };

/* ---------- التسجيل التلقائي في صفحات التشغيل ---------- */
function detect() {
  const p = location.pathname, q = new URLSearchParams(location.search);
  for (const [path, prm, src] of PAGES) if (p.endsWith("/" + path) || p.endsWith("/" + path.slice(0, -1))) { const s = q.get(prm); return s ? { src, slug: s } : null; }
  if (/\/games\/(index\.html)?$/.test(p)) { const g = (location.hash.match(/[#&]g=([^&]+)/) || [])[1]; return g ? { src: "games", slug: decodeURIComponent(g) } : null; }
  return null;
}
let catP = null;
async function published(src, slug) {
  try {
    if (src === "games") { catP = catP || fetch(ROOT + "games/catalog.json").then((r) => (r.ok ? r.json() : Promise.reject())); const c = await catP; return Array.isArray(c) && c.some((g) => g.id === slug); }
    if (!TABLE[src]) return null;
    const r = await fetch(SB + "/rest/v1/" + TABLE[src] + "?slug=eq." + encodeURIComponent(slug) + "&status=eq.published&select=slug&limit=1", { headers: H }); if (!r.ok) return null; return (await r.json()).length > 0;
  } catch (e) { return null; }
}
function logErr(kind, msg) { try { const k = "zad-rc-err:" + kind + msg; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); fetch(SB + "/rest/v1/pf_errors", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ kind, msg: String(msg).slice(0, 200) }) }).catch(() => {}); } catch (e) { /* */ } }
async function auto() {
  const d = detect(); if (!d) return; const key = d.src + ":" + d.slug; await loadCfg(); if (!allowed(key)) return;
  const ok = await published(d.src, d.slug);
  if (ok === true) put(key); else if (ok === false) logErr("recent-skip", key); else logErr("recent-log", "تعذّر التحقق من نشر " + key);
}
/** من صفحة المكتبة: ملف منشور فُتحت معاينته */
function touchLib(slug) { return loadCfg().then(() => put("lib:" + slug)); }

/* ---------- العرض ---------- */
const fdate = (t) => { const d = new Date(t), n = new Date(), day = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(), df = Math.round((day(n) - day(d)) / 864e5); if (df <= 0) return "اليوم"; if (df === 1) return "أمس"; try { return d.toLocaleDateString("ar-OM", { day: "numeric", month: "long" }); } catch (e) { return ""; } };
let ZP = null;
function needZ() { if (W.ZFIND) return W.ZFIND.load().then(() => W.ZFIND).catch(() => W.ZFIND); if (ZP) return ZP; ZP = new Promise((res) => { const s = document.createElement("script"); s.src = ROOT + "find/zfind.js?v=2"; s.onload = () => W.ZFIND.load().then(() => res(W.ZFIND)).catch(() => res(W.ZFIND)); s.onerror = () => res(null); document.head.appendChild(s); }); return ZP; }
/** يطابق السجل مع المحتوى المنشور الحالي؛ غير المتاح يُعلَّم "gone" إلا إن فشل تحميل قسمه */
function resolve(Z, rows) {
  const X = Z.X, by = new Map(X.all.map((i) => [i.key, i]));
  return rows.map((r) => { const it = by.get(r.key), ok = !!it && !it.hidden && it.lv.length, s = srcOf(r.key), failed = X.failed.includes(s === "lib" ? "library" : s); return Object.assign({}, r, { it: ok ? it : null, st: ok ? "ok" : failed ? "unk" : "gone", status: status(r.key), resume: resume(r.key) }); });
}
function card(r, Z, full) {
  const it = r.it, url = it ? ROOT + it.url : "", rs = r.resume;
  const img = it ? Z.imgOf(it) : ROOT + "images/zad/i_puzzle.webp";
  const meta = it ? `<span>${esc(Z.CT[it.ct] || "")}</span>${it.dom ? `<span>${esc(Z.domName(it.dom))}</span>` : ""}` : "";
  const stc = `<span class="zr-s ${r.status}">${ST_TXT[r.status]}</span>`;
  const go = it ? `<a class="zr-go" href="${esc(url)}" aria-label="${rs ? "متابعة" : "إعادة فتح"}: ${esc(it.title)}">${rs ? "متابعة" : "إعادة فتح"}</a>` : `<span class="zr-go dis" aria-disabled="true">${r.st === "gone" ? "غير متاح" : "تعذّر التحقق"}</span>`;
  return `<article class="zr-c${it ? "" : " off"}" data-k="${esc(r.key)}"><span class="zr-th"><img src="${esc(img)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_puzzle.webp'"></span>
<div class="zr-bd"><h3>${esc(it ? it.title : r.st === "gone" ? "محتوى لم يعد متاحًا" : "محتوى سبق أن فتحته")}</h3><div class="zr-mt">${meta}</div><p class="zr-d">${stc} · آخر استخدام: ${esc(fdate(r.at))}</p>${rs ? `<p class="zr-rs">${esc(rs)}</p>` : ""}${!it && r.st === "gone" ? `<p class="zr-bad">لم يعد هذا المحتوى متاحًا. يمكنك إزالته من السجل.</p>` : ""}</div>
<div class="zr-ac">${go}${full && it ? full(r) : ""}<button type="button" class="zr-rm" data-zr="rm" aria-label="إزالة من السجل${it ? ": " + esc(it.title) : ""}">إزالة من السجل</button></div></article>`;
}
const MAXS = { home: 4, lib: 4, kid: 4, pf: 3 };
async function mount(el) {
  if (el.dataset.zr === "1") return; el.dataset.zr = "1"; await loadCfg();
  const kind = el.dataset.zrecent || "home", max = MAXS[kind] || 4, m = me(), rows = list();
  const head = `<div class="zr-hd"><h2>تابع من حيث توقفت</h2>${rows.length ? `<a class="zr-all" href="${ROOT}recent/">عرض السجل الكامل</a>` : ""}</div>`;
  if (m.hide) { el.innerHTML = ""; el.hidden = true; return; } el.hidden = false;
  if (!rows.length) { el.innerHTML = `<section class="zr-sec zr-empty" aria-label="تابع من حيث توقفت">${head}<p>ابدأ باستكشاف المكتبة التعليمية، وستجد هنا المحتوى الذي استخدمته مؤخرًا.</p><a class="zr-go" href="${ROOT}library/">استكشف المكتبة</a></section>`; return; }
  el.innerHTML = `<section class="zr-sec" aria-label="تابع من حيث توقفت">${head}<div class="zr-sk"></div></section>`;
  const Z = await needZ(); if (!Z || !Z.X || !Z.X.all) { el.innerHTML = ""; return; }
  const sh = resolve(Z, rows).filter((r) => r.st !== "gone").slice(0, max);
  if (!sh.length) { el.innerHTML = `<section class="zr-sec zr-empty" aria-label="تابع من حيث توقفت">${head}<p>ابدأ باستكشاف المكتبة التعليمية، وستجد هنا المحتوى الذي استخدمته مؤخرًا.</p><a class="zr-go" href="${ROOT}library/">استكشف المكتبة</a></section>`; return; }
  el.innerHTML = `<section class="zr-sec" aria-label="تابع من حيث توقفت">${head}<div class="zr-grid">${sh.map((r) => card(r, Z)).join("")}</div></section>`;
}
function scan() { document.querySelectorAll("[data-zrecent]").forEach((e) => { if (e.dataset.zr !== "1") mount(e); }); }
function remountAll() { document.querySelectorAll("[data-zrecent]").forEach((e) => { e.dataset.zr = ""; }); scan(); }
document.addEventListener("click", (e) => { const b = e.target.closest("[data-zr=rm]"); if (!b || b.closest(".zr-page")) return; const c = b.closest(".zr-c"); if (!c) return; remove(c.dataset.k); });
let t;
function init() {
  scan(); try { new MutationObserver((ms) => { if (ms.every((x) => x.target.closest && x.target.closest("[data-zrecent]"))) return; clearTimeout(t); t = setTimeout(scan, 80); }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) { /* */ }
  W.addEventListener("zad-recent", () => { if (!document.querySelector(".zr-page")) remountAll(); }); W.addEventListener("storage", (e) => { if (e.key === RK || e.key === LK) { if (!document.querySelector(".zr-page")) remountAll(); else W.dispatchEvent(new CustomEvent("zad-recent")); } });
  auto();
  if (/\/games\//.test(location.pathname)) {
    W.addEventListener("hashchange", auto);
    /* بطاقة لعبة: الضغط عليها يفتح اللعبة فعلًا (زر المفضلة داخلها لا يُحسب) */
    document.addEventListener("click", (e) => { if (e.target.closest(".zfv")) return; const c = e.target.closest("[data-g]"); const id = c && c.dataset.g; if (!id || !/^\w+$/.test(id)) return; loadCfg().then(() => { if (!allowed("games:" + id)) return; published("games", id).then((ok) => { if (ok === true) put("games:" + id); }); }); }, true);
  }
}
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
/* فتح مورد من «الحزم التعليمية»: يُحمَّل شريط التنقل بين موارد الحزمة (pk وpi في الرابط) */
if (/[?&]pk=/.test(location.search) && !W.ZPACKS) { const s = document.createElement("script"); s.src = ROOT + "packs/zpacks.js?v=1"; document.head.appendChild(s); }

W.ZRECENT = { ROOT, SRC_CT, SRC_NAME, ST_TXT, list, put, remove, clear, setHide, me, status, resume, resolve, card, mount, remountAll, touchLib, loadCfg, cfg: () => CFG, kidId, esc, AD, fdate, needZ, allowed };
})(window);
