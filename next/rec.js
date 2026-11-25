/* مركز توصيات التعلم «ماذا نتعلم بعد ذلك؟» – زاد.
   كل توصية مرتبطة بعنصر منشور فعلًا في قاعدة بيانات المنصة ومناسب لعمر الطفل أو صفه؛ وتُحسب على الجهاز من سجلات الطفل المحلية فقط. */
(function () {
"use strict";
const W = window, D = document;
const SCR = D.currentScript && D.currentScript.src ? D.currentScript.src : location.href;
const ROOT = new URL("../", SCR).href;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
const LK = "zad-learn-v3";
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const LVK = Object.keys(LV);
const TYPE = { continue: "متابعة التعلم", review: "مراجعة", explore: "استكشاف", general: "اقتراح عام", again: "مراجعة بطريقة مختلفة" };
const KIND = { acts: "ورقة عمل أو نشاط", bank: "نشاط من بنك الأنشطة", proj: "مشروع أو تحدٍّ", life: "نشاط حياتي", ready: "استعداد مدرسي", val: "درس قيم وسلوك", dig: "مهارة رقمية", exp: "ثقافة عامة", vid: "درس مرئي", songs: "نشيد تعليمي", games: "لعبة تعليمية", stories: "قصة تعليمية", quiz: "اختبار قصير" };
const URLS = { acts: (s) => `activities/view/?a=${s}`, bank: (s) => `bank/play/?s=${s}`, proj: (s) => `projects/play/?s=${s}`, life: (s) => `life/play/?s=${s}`, ready: (s) => `ready/play/?s=${s}`, val: (s) => `values/play/?s=${s}`, dig: (s) => `digital/play/?s=${s}`, exp: (s) => `explore/play/?s=${s}`, vid: (s) => `videos/play/?s=${s}`, songs: (s) => `songs/play/?s=${s}`, stories: (s) => `stories/read/?s=${s}`, quiz: (s) => `quizzes/quiz/?q=${s}`, games: (s) => `games/#g=${s}` };
/* الجداول: key → [جدول, أعمدة, فلتر المستوى] */
const TB = {
  acts: ["activities", "slug,title,skill,subject,cat,minutes,image_url,summary"], bank: ["bank_items", "slug,title,icon,skill,subject,cat,levels"], proj: ["proj_items", "slug,title,icon,skill,subject,cat,minutes,levels"],
  life: ["life_items", "slug,title,icon,cat,levels"], ready: ["ready_items", "slug,title,icon,cat,levels"], val: ["val_items", "slug,title,icon,cat,levels"],
  vid: ["video_items", "slug,title,icon,skill,subject,cat,duration_s,poster_url,levels"], songs: ["song_items", "slug,title,icon,skill,cat,levels"], stories: ["stories", "slug,title,topic,cover_url,summary,levels"], quiz: ["qz_quizzes", "slug,title,icon,cat,skill,subject,minutes,levels"],
};
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const hash = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
async function rest(path) { const r = await fetch(SB + "/rest/v1/" + path, { headers: H }); if (!r.ok) throw new Error("rest " + r.status); return r.json(); }
function logEv(src, slug, action, lv) { try { fetch(SB + "/rest/v1/rec_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ src, slug: String(slug).slice(0, 80), action, level: lv || null }) }).catch(() => {}); } catch {} }
function logOnce(src, slug, action, lv) { try { const k = `zad-rec-ev:${action}:${src}:${slug}`; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); } catch {} logEv(src, slug, action, lv); }
function reportErr(m) { try { fetch(SB + "/rest/v1/pf_errors", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ kind: "rp-rec", msg: String(m).slice(0, 300), ua: (navigator.userAgent || "").slice(0, 200) }) }).catch(() => {}); } catch {} }

/* ---------- الطفل والمستوى والإعدادات ---------- */
function state() {
  let DB = lget(LK, null); if (!DB || !DB.kids) DB = null;
  const kid = DB && DB.kids[DB.cur] ? DB.kids[DB.cur] : null;
  let lv = "";
  if (kid) { const p = kid.pf && kid.pf.lv; if (LV[p]) lv = p; else { const a = parseInt(kid.age, 10); if (a) lv = a <= 2 ? "a2" : a <= 6 ? "a" + a : a <= 10 ? "g" + (a - 6) : ""; } }
  if (!lv) { const g = localStorage.getItem("zad-rec-lv"); if (LV[g]) lv = g; }
  return { DB, kid, lv, cur: DB ? DB.cur : "guest" };
}
function recSet(st) {
  const holder = st.kid ? st.kid : null; let r = holder ? (holder.rec = holder.rec || {}) : lget("zad-rec-guest", {}) || {};
  r.off = r.off || {}; r.pref = r.pref || {}; r.hide = r.hide || {}; r.later = r.later || {}; r.variety = ["low", "mid", "high"].includes(r.variety) ? r.variety : "mid"; r.personal = r.personal === 0 ? 0 : 1;
  return r;
}
function saveSet(st, r) { try { if (st.kid) { const DB = lget(LK, {}); if (DB.kids && DB.kids[st.cur]) { DB.kids[st.cur].rec = r; DB._t = Date.now(); localStorage.setItem(LK, JSON.stringify(DB)); } } else localStorage.setItem("zad-rec-guest", JSON.stringify(r)); } catch {} }
function doneSet(kid) {
  const d = new Map(); const add = (src, slug, t) => { if (slug) d.set(src + ":" + slug, t || 0); }; if (!kid) return d;
  const ts = (r) => (r && (r.t || (typeof r.d === "string" ? Date.parse(r.d) : 0))) || 0;
  Object.entries(kid.acts || {}).forEach(([k, r]) => add("acts", k, ts(r)));
  [["bank", kid.bank && kid.bank.done], ["proj", kid.proj && kid.proj.done], ["vid", kid.vid && kid.vid.done], ["songs", kid.songs && kid.songs.done]].forEach(([s, m]) => Object.entries(m || {}).forEach(([k, r]) => { if (r && (r.d || r.t)) add(s, k, ts(r)); }));
  [["life", kid.life], ["ready", kid.ready], ["val", kid.val], ["dig", kid.dig], ["exp", kid.exp]].forEach(([s, o]) => Object.entries((o && o.it) || {}).forEach(([k, r]) => { if (r && r.d) add(s, k, ts(r)); }));
  Object.entries(kid.stories || {}).forEach(([k, r]) => add("stories", k, ts(r)));
  Object.entries((kid.quiz && kid.quiz.h) || {}).forEach(([k, h]) => { if (h && h.n > 0 && !k.startsWith("c:")) add("quiz", k, h.last || 0); });
  return d;
}
/* ---------- المجالات (نفس إعدادات التقارير) ---------- */
let CFG = null;
async function loadCfg() { if (CFG) return CFG; CFG = { dom: [], rr: {}, mode: "auto", ov: {} }; try { const rows = await rest("rp_config?order=sort_order.asc&select=slug,kind,title,data"); CFG.dom = rows.filter((r) => r.kind === "domain").map((r) => ({ slug: r.slug, title: r.title, d: r.data || {} })); rows.filter((r) => r.kind === "rreason").forEach((r) => (CFG.rr[r.slug] = (r.data || {}).text)); const m = rows.find((r) => r.slug === "rec_mode"); if (m) CFG.mode = (m.data || {}).mode === "approve" ? "approve" : "auto"; } catch (e) { reportErr("cfg " + e.message); } try { (await rest("rec_overrides?select=*&limit=3000")).forEach((o) => (CFG.ov[o.src + ":" + o.slug] = o)); } catch (e) { reportErr("ov " + e.message); } return CFG; }
const tokens = (s) => String(s || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean).map((t) => t.replace(/^ال/, ""));
function domOf(r) {
  const D_ = CFG.dom; if (!D_.length) return "other";
  for (const d of D_) if ((d.d.skills || []).includes(r.skill)) return d.slug;
  for (const d of D_) { const s = d.d.src || []; if (s.includes(r.src) || (r.topic && s.includes(r.src + ":" + r.topic))) return d.slug; }
  if (/[a-z]{3}/i.test(r.skill || "")) { const e = D_.find((d) => d.slug === "english"); if (e) return e.slug; }
  for (const txt of [[r.skill, r.subject, r.cat].join(" "), r.title]) { const tk = tokens(txt); if (!tk.length) continue; for (const d of D_) if ((d.d.words || []).some((w) => { const x = String(w).toLowerCase().replace(/^ال/, ""); return x && tk.some((t) => t.startsWith(x)); })) return d.slug; }
  return "other";
}
const domName = (s) => (CFG.dom.find((d) => d.slug === s) || { title: "أنشطة متنوعة" }).title;
/* ---------- المحتوى المتاح فعلًا ---------- */
const POOLS = {};
const gameFits = (age, lv) => {
  const s = String(age || "").replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
  const gm = s.match(/الصف\s*(الأول|الثاني|الثالث|الرابع)(?:\s*[–-]\s*(الأول|الثاني|الثالث|الرابع))?/), gi = { الأول: 1, الثاني: 2, الثالث: 3, الرابع: 4 };
  if (gm) { const a = gi[gm[1]], b = gm[2] ? gi[gm[2]] : a; return lv[0] === "g" && +lv[1] >= a && +lv[1] <= b; }
  const m = s.match(/(\d+)\s*[–-]\s*(\d+)/); if (m) { const a = +m[1], b = +m[2]; if (lv[0] !== "a") return false; const k = +lv[1]; return lv === "a2" ? a <= 2 && b >= 1 : k >= a && k <= b; }
  return false;
};
async function loadPool(lv) {
  if (POOLS[lv]) return POOLS[lv]; const out = []; const ovs = Object.values(CFG.ov);
  const extra = (src) => ovs.filter((o) => o.src === src && o.status === "on" && (o.levels || []).includes(lv)).map((o) => o.slug);
  await Promise.all(Object.entries(TB).map(async ([src, [tb, cols]]) => {
    try {
      const ex = extra(src), exq = ex.length ? `,slug.in.(${ex.map(encodeURIComponent).join(",")})` : "";
      const flt = src === "acts" ? (lv[0] === "g" ? `grades.cs.{${lv[1]}}` : lv === "a2" ? "ages.ov.{1,2}" : `ages.cs.{${lv[1]}}`) : `levels.cs.{${lv}}`;
      const rows = await rest(`${tb}?status=eq.published&or=(${flt}${exq})&select=${cols}&limit=400`);
      rows.forEach((x) => out.push(Object.assign(x, { src, key: src + ":" + x.slug })));
    } catch (e) { reportErr(src + " " + e.message); }
  }));
  try { const cat = await (await fetch(ROOT + "games/catalog.json")).json(); cat.forEach((g) => { if (gameFits(g.age, lv)) out.push({ src: "games", slug: g.id, key: "games:" + g.id, title: g.t, skill: g.skill, subject: g.subj, ageTxt: g.age }); }); } catch (e) { reportErr("games " + e.message); }
  return (POOLS[lv] = out);
}
const imgOf = (x) => { if (x.src === "stories" && x.cover_url) return x.cover_url; if (x.src === "acts" && x.image_url) return x.image_url; if (x.poster_url) return x.poster_url; const c = x.icon; if (!c) return ROOT + (x.src === "games" ? "images/zad/i_trophy.webp" : "images/zad/i_puzzle.webp"); if (/^https?:|^\//.test(c)) return c; return String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`; };
const lvRange = (x) => { if (x.src === "games") return x.ageTxt || ""; const l = (x.levels || []).filter((k) => LV[k]).sort((a, b) => LVK.indexOf(a) - LVK.indexOf(b)); if (!l.length) return ""; return l.length === 1 ? LV[l[0]] : LV[l[0]] + " إلى " + LV[l[l.length - 1]]; };
const dur = (x) => (x.minutes > 0 ? AD(x.minutes) + " دقائق تقريبًا" : x.duration_s > 0 ? AD(Math.max(1, Math.round(x.duration_s / 60))) + " دقائق تقريبًا" : "");
/* ---------- المحرك ---------- */
const WEIGHT = { young: { arts: 14, thinking: 14, arabic: 10, science: 8, life: 6 }, mid: { arabic: 14, math: 14, thinking: 10, arts: 8, english: 4, life: 6 }, school: { arabic: 12, math: 12, english: 10, science: 10, thinking: 8, life: 4, values: 4, arts: 4 } };
const wGroup = (lv) => (lv === "a2" || lv === "a3" ? "young" : lv[0] === "a" ? "mid" : "school");
const VAR = { low: [3, 3], mid: [2, 2], high: [1, 1] };
function compute(st, pool, set, opt) {
  const lv = st.lv, done = doneSet(st.kid), now = Date.now(), td = today(), personal = set.personal !== 0;
  const hasHist = personal && done.size > 0, q = st.kid && st.kid.quiz ? st.kid.quiz : { h: {} };
  const by = (x) => Object.assign({}, x, { dom: (CFG.ov[x.key] && CFG.ov[x.key].domain) || domOf(x) });
  let items = pool.map(by);
  items = items.filter((x) => { const o = CFG.ov[x.key]; if (CFG.mode === "approve" && !(o && o.status === "on")) return false; if (o && o.status === "off") return false; if (o && o.levels && o.levels.length && !o.levels.includes(lv)) return false; if (set.off[x.dom] || set.hide[x.key]) return false; if (set.later[x.key] === td) return false; if (opt.domain && x.dom !== opt.domain) return false; return true; });
  const doneDoms = {}, lastDom = {}, skillsDone = new Set(), weak = new Set();
  items.forEach((x) => { if (done.has(x.key)) { doneDoms[x.dom] = (doneDoms[x.dom] || 0) + 1; lastDom[x.dom] = Math.max(lastDom[x.dom] || 0, done.get(x.key) || 0); if (x.skill) skillsDone.add(x.skill); } });
  Object.entries(q.h || {}).forEach(([k, h]) => { if (h && h.tot > 0 && h.best / h.tot < 0.6) weak.add("quiz:" + k); });
  const wt = WEIGHT[wGroup(lv)], cands = [];
  items.forEach((x) => {
    const o = CFG.ov[x.key] || {}, isDone = done.has(x.key); let type, score = (wt[x.dom] || 3) + (set.pref[x.dom] ? 12 : 0) + (o.priority || 0) * 5 + (hash(td + st.cur + x.key) % 7);
    if (!hasHist) { if (isDone) return; type = "general"; }
    else if (isDone) { const age = now - (done.get(x.key) || 0); if (weak.has(x.key)) { type = "review"; score += 30; } else if (done.get(x.key) > 0 && age > 14 * 864e5) { type = "review"; score += 8; } else return; }
    else if (x.skill && skillsDone.has(x.skill)) { type = "continue"; score += 30; x.why = "skill"; }
    else if (doneDoms[x.dom] && now - (lastDom[x.dom] || 0) < 21 * 864e5) { type = "continue"; score += 16; x.why = "domain"; }
    else { type = "explore"; score += doneDoms[x.dom] ? 6 : 14; }
    if (o.rtype && !isDone) type = o.rtype;
    cands.push(Object.assign(x, { type, score, isDone }));
  });
  cands.sort((a, b) => b.score - a.score);
  const [mD, mS] = VAR[set.variety] || VAR.mid, perD = {}, perS = {}, perT = {}, out = [];
  const pick = (strict) => { for (const c of cands) { if (out.length >= opt.max) break; if (out.includes(c)) continue; if (strict && ((perD[c.dom] || 0) >= mD || (perS[c.src] || 0) >= mS || (perT[c.type] || 0) >= Math.max(2, Math.ceil(opt.max / 2)))) continue; out.push(c); perD[c.dom] = (perD[c.dom] || 0) + 1; perS[c.src] = (perS[c.src] || 0) + 1; perT[c.type] = (perT[c.type] || 0) + 1; } };
  pick(true); if (out.length < opt.max) pick(false);
  if (!out.length && hasHist) { const again = items.filter((x) => done.has(x.key)).sort((a, b) => hash(td + a.key) - hash(td + b.key)).slice(0, opt.max).map((x) => Object.assign(x, { type: "again", isDone: true })); return { cards: again, hasHist, empty: !again.length }; }
  return { cards: out, hasHist, empty: !out.length };
}
function reasonOf(c) {
  const rr = CFG.rr, o = CFG.ov[c.key] || {}, f = (t) => String(t || "").replace(/\{skill\}/g, c.skill || "").replace(/\{domain\}/g, domName(c.dom)).replace(/\{title\}/g, c.title || "");
  if (o.reason) return f(o.reason);
  const key = c.type === "continue" ? (c.why === "skill" && c.skill ? "rr_continue" : "rr_continue_domain") : c.type === "review" ? "rr_review" : c.type === "explore" ? "rr_explore" : c.type === "again" ? "rr_again" : "rr_general";
  const dflt = { rr_continue: "مقترح لأن طفلك تدرب على «{skill}» سابقًا.", rr_continue_domain: "مقترح لأن طفلك مارس مجال «{domain}» مؤخرًا.", rr_review: "لنراجع هذه المهارة من خلال نشاط ممتع، فقد سبق التدرب عليها.", rr_explore: "محتوى جديد مناسب للمرحلة التعليمية الحالية في مجال «{domain}».", rr_general: "اقتراح عام مناسب لعمر طفلك أو صفه، وسيصبح أدق مع تقدمه.", rr_again: "أكمل طفلك المقترحات المتاحة، فلنراجع نشاطًا سابقًا بطريقة مختلفة." };
  return f(rr[key] || dflt[key]);
}
function card(c, st, compact) {
  const url = ROOT + URLS[c.src](encodeURIComponent(c.slug)), meta = [KIND[c.src], lvRange(c)].filter(Boolean).join(" · "), d = dur(c);
  return `<article class="rcard" data-k="${esc(c.key)}"><img class="rimg" src="${esc(imgOf(c))}" alt="" width="96" height="96" loading="lazy" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_puzzle.webp'"><div class="rbody"><span class="rtag t-${c.type}">${esc(TYPE[c.type])}</span><h3>${esc(c.title)}</h3><p class="rmeta">${esc(meta)}${d ? " · " + esc(d) : ""}</p>${c.skill ? `<p class="rskill">المهارة: ${esc(c.skill)}</p>` : ""}<p class="rwhy">${esc(reasonOf(c))}</p><div class="rbtns"><a class="rgo" href="${url}" data-a="start">ابدأ النشاط</a><button type="button" class="rlater" data-a="later">ليس الآن</button><button type="button" class="rhide" data-a="hide">إخفاء</button></div></div></article>`;
}
function askLevel(el, redo) {
  el.innerHTML = `<div class="rask"><p>لنقترح ما يناسب طفلك، اختر عمره أو صفه (لا نطلب أي معلومة أخرى):</p><div class="rbtns">${LVK.map((k) => `<button type="button" class="rlv" data-l="${k}">${LV[k]}</button>`).join("")}</div></div>`;
  el.querySelectorAll(".rlv").forEach((b) => (b.onclick = () => { try { localStorage.setItem("zad-rec-lv", b.dataset.l); } catch {} redo(); }));
}
async function mount(el, o) {
  o = Object.assign({ max: 5, domain: "", title: "", empty: true }, o || {});
  el.classList.add("rec-w"); if (!o.keepTitle && o.title) el.innerHTML = `<div class="rhead"><h2>${esc(o.title)}</h2></div><div class="rlist" aria-busy="true"></div>`; else el.innerHTML = '<div class="rlist" aria-busy="true"></div>';
  const list = el.querySelector(".rlist"), st = state(), redo = () => mount(el, o);
  if (!st.lv) { askLevel(list, redo); list.removeAttribute("aria-busy"); return; }
  try {
    await loadCfg(); const pool = await loadPool(st.lv), set = recSet(st), r = compute(st, pool, set, o);
    list.removeAttribute("aria-busy");
    if (r.empty) { list.innerHTML = '<p class="rempty">سنضيف المزيد من الأنشطة المناسبة قريبًا.</p>'; return; }
    list.innerHTML = (r.hasHist ? "" : '<p class="rnote">هذه اقتراحات عامة مناسبة لعمر طفلك أو صفه، وتصبح أدق عندما يبدأ التعلم.</p>') + `<div class="rgrid">${r.cards.map((c) => card(c, st)).join("")}</div>`;
    r.cards.forEach((c) => logOnce(c.src, c.slug, "shown", st.lv));
    list.querySelectorAll(".rcard").forEach((n) => n.querySelectorAll("[data-a]").forEach((b) => (b.onclick = (e) => {
      const k = n.dataset.k, a = b.dataset.a, [s, ...sl] = k.split(":"), slug = sl.join(":");
      if (a === "start") { logEv(s, slug, "start", st.lv); return; }
      e.preventDefault(); const set2 = recSet(st); if (a === "hide") set2.hide[k] = 1; else set2.later[k] = today(); saveSet(st, set2); logEv(s, slug, a, st.lv); mount(el, o);
    })));
  } catch (e) { reportErr("mount " + e.message); list.removeAttribute("aria-busy"); list.innerHTML = '<p class="rempty">تعذر تحميل الاقتراحات الآن. حاول لاحقًا.</p>'; }
}
W.ZREC = { mount, state, recSet, saveSet, loadCfg, loadPool, compute, LV, LVK, domName, get cfg() { return CFG; }, domOf, doneSet, gameFits, imgOf, dur, reasonOf, lvRange, URLS, KIND, TB, ROOT, rest, today, reportErr, wGroup, TYPE };
const auto = () => D.querySelectorAll(".rec-mount").forEach((el) => { if (!el.classList.contains("rec-w")) mount(el, { max: +el.dataset.max || 5, domain: el.dataset.domain || "", title: el.dataset.title || "" }); });
if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", auto); else auto();
try { let tm = 0; new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(auto, 120); }).observe(D.body || D.documentElement, { childList: true, subtree: true }); } catch {}
})();
