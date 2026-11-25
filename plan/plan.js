/* خطتي التعليمية: خطة أسبوعية مبنية على محتوى المكتبة الفعلي ومحرك التوصيات. تُحفظ داخل سجل الطفل (جهازه وحساب وليّ الأمر) ولا تُنشر. */
(function () {
"use strict";
const D = document, W = window, R = W.ZREC; if (!R) return;
const $ = (s, r) => (r || D).querySelector(s), $$ = (s, r) => [...(r || D).querySelectorAll(s)];
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const LK = "zad-learn-v3", DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"], ROOT = R.ROOT;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => new Date(s + "T12:00:00");
const weekStart = (d) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12); x.setDate(x.getDate() - ((x.getDay() + 1) % 7)); return iso(x); };
const addDays = (s, n) => { const x = parse(s); x.setDate(x.getDate() + n); return iso(x); };
const todayIdx = (ws) => Math.round((parse(iso(new Date())) - parse(ws)) / 864e5);
const RID = () => "i" + Math.random().toString(36).slice(2, 9);
const DEF = { maxN: 14, defN: { young: 3, mid: 5, school: 5 }, perDay: { young: 1, mid: 2, school: 2 }, defDays: { young: 3, mid: 4, school: 4 }, review: true };
const DEFDAYS = { 3: [1, 3, 5], 4: [1, 2, 3, 5], 5: [0, 1, 2, 3, 5] };
let RULES = DEF, TPL = [], WS = weekStart(new Date()), META = {}, SAY = "", LINKOK = null;
const MSG = ["أكملت خطوة من خطتك.", "أنجزت نشاطًا جديدًا.", "خطوة جميلة في خطتك."];

async function loadRules() { try { const r = await R.rest("rp_config?kind=in.(pset,ptpl)&status=eq.active&order=sort_order.asc&select=slug,kind,title,data"); const s = r.find((x) => x.kind === "pset"); if (s) RULES = Object.assign({}, DEF, s.data); TPL = r.filter((x) => x.kind === "ptpl"); } catch (e) { RULES = DEF; TPL = []; } }
/* ---------- التخزين ---------- */
function mut(fn) {
  const DB = lget(LK, null) || { cur: "k1", kids: { k1: {} } }; if (!DB.kids || !Object.keys(DB.kids).length) DB.kids = { k1: {} }; if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  const k = DB.kids[DB.cur]; k.plan = k.plan || {}; k.plan.weeks = k.plan.weeks || {}; k.plan.set = k.plan.set || {}; fn(k, DB); DB._t = Date.now();
  try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} pushSoon();
}
const planOf = (st) => { const p = (st.kid && st.kid.plan) || {}; return { weeks: p.weeks || {}, set: p.set || {} }; };
let pt = 0;
function pushSoon() { clearTimeout(pt); pt = setTimeout(pushNow, 2500); }
async function pushNow() {
  try {
    let S = null; try { S = JSON.parse(localStorage.getItem("zad-sess")); } catch {} if (!S || localStorage.getItem("zad-pf-consent") !== "1") return;
    if (S.exp - 60000 < Date.now()) { const r = await fetch(SB + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: S.rt }) }); if (!r.ok) return; const j = await r.json(); S = { at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: S.email, uid: S.uid }; localStorage.setItem("zad-sess", JSON.stringify(S)); }
    const H = { apikey: ANON, Authorization: "Bearer " + S.at, "Content-Type": "application/json" };
    const c = await (await fetch(SB + "/rest/v1/learn_saves?select=updated_at&user_id=eq." + S.uid, { headers: H })).json(); const last = localStorage.getItem("zad-sync-last") || "";
    if (c && c[0] && c[0].updated_at && last && c[0].updated_at > last) return; /* نسخة أحدث في الحساب: لا نستبدلها؛ يحسمها ملف الإنجاز */
    const at = new Date().toISOString(), data = lget(LK, {});
    const r = await fetch(SB + "/rest/v1/learn_saves?on_conflict=user_id", { method: "POST", headers: Object.assign({ Prefer: "resolution=merge-duplicates" }, H), body: JSON.stringify({ user_id: S.uid, data, updated_at: at }) }); if (r.ok) localStorage.setItem("zad-sync-last", at);
  } catch {}
}
function logLink(m) { try { const k = "zad-plan-err:" + m; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); fetch(SB + "/rest/v1/pf_errors", { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ kind: "plan-link", msg: String(m).slice(0, 300) }) }).catch(() => {}); } catch {} }
/* تسجيل الإنجاز في سجلات الطفل نفسها (ملف الإنجاز والتقارير والتوصيات تقرؤها): مرة واحدة لكل عنصر، ولا يُستبدل سجل موجود */
function writeRecord(k, src, slug) {
  const now = Date.now(), td = iso(new Date());
  if (src === "acts") { k.acts = k.acts || {}; if (k.acts[slug]) return false; k.acts[slug] = { d: td, how: "plan" }; return true; }
  if (["bank", "proj", "vid", "songs"].includes(src)) { k[src] = k[src] || {}; k[src].done = k[src].done || {}; if (k[src].done[slug]) return false; k[src].done[slug] = { d: 1, t: now }; return true; }
  if (["life", "ready", "val", "dig", "exp"].includes(src)) { k[src] = k[src] || {}; k[src].it = k[src].it || {}; if (k[src].it[slug] && k[src].it[slug].d) return false; k[src].it[slug] = { d: 1, w: 0, t: now }; return true; }
  if (src === "stories") { k.stories = k.stories || {}; if (k.stories[slug]) return false; k.stories[slug] = { t: now, d: 1 }; return true; }
  return false;
}
function unwriteRecord(k, src, slug, t) {
  if (src === "acts") { if (k.acts && k.acts[slug] && k.acts[slug].how === "plan") delete k.acts[slug]; }
  else if (["bank", "proj", "vid", "songs"].includes(src)) { const r = k[src] && k[src].done && k[src].done[slug]; if (r && r.t === t) delete k[src].done[slug]; }
  else if (["life", "ready", "val", "dig", "exp"].includes(src)) { const r = k[src] && k[src].it && k[src].it[slug]; if (r && r.t === t) delete k[src].it[slug]; }
  else if (src === "stories") { const r = k.stories && k.stories[slug]; if (r && r.t === t) delete k.stories[slug]; }
}
/* ---------- المحتوى والترشيح ---------- */
const domOfRow = (x) => (R.cfg.ov[x.key] && R.cfg.ov[x.key].domain) || R.domOf(x);
async function loadMeta(keys) {
  const by = {}; keys.filter((k) => !(k in META)).forEach((k) => { const [s, ...r] = k.split(":"); (by[s] = by[s] || []).push(r.join(":")); });
  await Promise.all(Object.entries(by).map(async ([s, sl]) => { const t = R.TB[s]; if (!t) { sl.forEach((x) => (META[s + ":" + x] = null)); return; } sl.forEach((x) => (META[s + ":" + x] = null));
    try { const rows = await R.rest(`${t[0]}?status=eq.published&slug=in.(${sl.map(encodeURIComponent).join(",")})&select=${t[1]}`); rows.forEach((x) => { x.src = s; x.key = s + ":" + x.slug; META[x.key] = x; }); } catch (e) { sl.forEach((x) => delete META[s + ":" + x]); } }));
}
const bad = (key) => { const o = R.cfg.ov[key]; return !META[key] || (o && o.status === "off"); };
async function cands(st, set, exclude) {
  await R.loadCfg(); const pool = await R.loadPool(st.lv), rs = R.recSet(st);
  const r = R.compute(st, pool, rs, { max: 150, domain: "" }); let c = r.cards.filter((x) => x.src !== "games" && !exclude.has(x.key));
  if (!set.review) c = c.filter((x) => x.type !== "review" && x.type !== "again");
  if (set.doms && set.doms.length) c = c.filter((x) => set.doms.includes(x.dom));
  return c;
}
function pick(n, c) {
  const g = {}; c.forEach((x) => (g[x.dom] = g[x.dom] || []).push(x)); const order = Object.keys(g).sort((a, b) => g[b][0].score - g[a][0].score), out = []; let last = "";
  while (out.length < n && order.some((d) => g[d].length)) for (const d of order) { if (out.length >= n) break; const a = g[d]; if (!a.length) continue; let i = a.findIndex((x) => x.src !== last); if (i < 0) i = 0; const x = a.splice(i, 1)[0]; out.push(x); last = x.src; }
  return out;
}
const capOf = (lv) => (RULES.perDay || DEF.perDay)[R.wGroup(lv)] || 2;
function assign(items, days, cap) {
  const cnt = {}; days.sort((a, b) => a - b);
  items.forEach((it, i) => { let j = Math.min(days.length - 1, Math.floor((i * days.length) / items.length)); for (let t = 0; t < days.length; t++) { const d = days[(j + t) % days.length]; if ((cnt[d] || 0) < cap) { it.day = d; cnt[d] = (cnt[d] || 0) + 1; break; } } });
}
async function build(st, ws, set) {
  const cap = capOf(st.lv), n = Math.max(1, Math.min(set.n, RULES.maxN, set.days.length * cap)), c = await cands(st, set, new Set()), ch = pick(n, c), now = Date.now();
  if (!ch.length) return null;
  const items = ch.map((x) => ({ id: RID(), key: x.key, day: 0, st: "todo", c: now, why: R.reasonOf(x), ty: x.type, tries: 0, note: "" })); assign(items, set.days.slice(), cap);
  return { id: RID(), created: now, days: set.days.slice().sort((a, b) => a - b), n: items.length, doms: set.doms || [], review: !!set.review, lv: st.lv, paused: false, items };
}
/* ---------- حالة العنصر والتقدم ---------- */
function stateOf(it, done) { if (it.st === "done") return "done"; const t = done.get(it.key); if (t && t >= new Date(it.c).setHours(0, 0, 0, 0)) return "auto"; return it.st; }
const isDone = (s) => s === "done" || s === "auto";
/* ---------- العرض ---------- */
function card(it, st, done, wk) {
  const s = stateOf(it, done), m = META[it.key], cap = !m || bad(it.key);
  if (cap) return `<article class="pcard pbad" data-i="${it.id}"><p><b>هذا النشاط لم يعد متاحًا في المكتبة.</b></p><div class="pbtns"><button class="pb go" type="button" data-a="chg">تغيير النشاط</button><button class="pb" type="button" data-a="del">حذف</button></div></article>`;
  const x = Object.assign({}, m, { dom: domOfRow(m) }), url = ROOT + R.URLS[it.key.split(":")[0]](encodeURIComponent(m.slug)), d = R.dur(m), kind = R.KIND[m.src];
  const dayOpts = DAYS.map((n, i) => `<option value="${i}" ${i === it.day ? "selected" : ""}>${n}</option>`).join("");
  return `<article class="pcard ${isDone(s) ? "pdone" : ""} ${s === "later" ? "plater" : ""}" data-i="${it.id}"><img class="pimg" src="${esc(R.imgOf(x))}" alt="" width="56" height="56" loading="lazy" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_puzzle.webp'"><div class="pbody"><h3>${esc(m.title)}</h3>
<p class="ptags"><span class="ptag">${esc(R.domName(x.dom))}</span>${m.skill ? `<span class="ptag s">${esc(m.skill)}</span>` : ""}<span class="ptag s">${esc(kind)}</span>${d ? `<span class="ptag s">${esc(d)}</span>` : ""}</p>
<p class="pwhy">${esc(it.why || "")}</p>${isDone(s) ? `<p class="pok">${s === "auto" ? "أنجزتَ هذا النشاط." : "أكملت هذه الخطوة."}${it.tries ? ` أعدت تجربته ${AD(it.tries)} ${it.tries > 2 ? "مرات" : it.tries === 2 ? "مرتين" : "مرة"}.` : ""}</p>` : s === "later" ? '<p class="pnote">مؤجّل: يمكنك متابعته عندما تكون مستعدًا.</p>' : ""}
<div class="pbtns"><a class="pb go" href="${esc(url)}" data-a="go">${isDone(s) ? "أعد التجربة" : "ابدأ النشاط"}</a>${isDone(s) ? (s === "done" ? '<button class="pb" type="button" data-a="undo">تراجع</button>' : "") : '<button class="pb ok" type="button" data-a="done">تم الإنجاز</button>'}<button class="pb" type="button" data-a="chg">تغيير النشاط</button></div>
<details class="pmore"><summary>المزيد</summary><label>نقل إلى يوم <select data-a="mv">${dayOpts}</select></label><div class="pbtns">${s === "later" ? "" : !isDone(s) ? '<button class="pb" type="button" data-a="later">ليس الآن</button>' : ""}<button class="pb" type="button" data-a="del">حذف من الخطة</button></div>
<label>ملاحظتك الخاصة (لا تظهر لأحد غيرك)<textarea data-a="note" rows="2" maxlength="300" placeholder="مثال: احتاج الطفل إلى مساعدة في هذا النشاط">${esc(it.note || "")}</textarea></label></details></div></article>`;
}
async function draw() {
  const st = R.state(), view = $("#pview"); await Promise.all([R.loadCfg(), loadRules()]); const P = planOf(st), wk = P.weeks[WS], kids = st.DB ? Object.keys(st.DB.kids) : [];
  const nm = (k) => (st.DB.kids[k].name || (st.DB.kids[k].pf && st.DB.kids[k].pf.nick) || "الطفل " + (kids.indexOf(k) + 1)), cur = WS === weekStart(new Date());
  const hd = `<div class="zbc"><a href="../">الرئيسية</a> › <a href="../library/">المكتبة</a> › خطتي التعليمية</div><section class="art"><h1>خطتي التعليمية</h1><p class="hint"><a href="../calendar/">التقويم التعليمي</a> · </p><p class="hint">خطة أسبوعية بسيطة من أنشطة المكتبة، يعدّلها وليّ الأمر في أي وقت. لا نقاط تُخصم ولا عدّ تنازلي: ما لم يكتمل يمكن نقله أو تأجيله.</p>
${kids.length > 1 ? `<label class="nxk">الطفل: <select id="pkid">${kids.map((k) => `<option value="${esc(k)}"${k === st.cur ? " selected" : ""}>${esc(nm(k))}</option>`).join("")}</select></label>` : ""}
<div class="pnav"><button class="pb" type="button" id="pprev">الأسبوع السابق</button><b>${weekLabel(WS)}</b><button class="pb" type="button" id="pnext">الأسبوع التالي</button>${cur ? "" : '<button class="pb" type="button" id="pthis">هذا الأسبوع</button>'}</div></section>`;
  if (!wk) { view.innerHTML = hd + `<section class="art pcta"><p>لا توجد خطة لهذا الأسبوع بعد.</p><button class="abtn go" type="button" id="pcreate">إنشاء خطة أسبوعية</button></section><div id="pwiz"></div>${recBox()}`; bind(st, null); return; }
  await loadMeta(wk.items.map((i) => i.key)); await checkLinks(wk);
  const done = R.doneSet(st.kid), ss = wk.items.map((i) => stateOf(i, done)), nd = ss.filter(isDone).length, nl = ss.filter((s) => s === "later").length, nr = ss.length - nd - nl, ti = cur ? todayIdx(WS) : -1;
  const missed = cur ? wk.items.filter((i, k) => !isDone(ss[k]) && i.day < ti) : [];
  const msg = wk.paused ? "الخطة متوقفة مؤقتًا. استأنفها عندما تكونون مستعدين." : nd && nd === ss.length ? "أنجزت خطتك هذا الأسبوع. أحسنت!" : nd ? SAY || MSG[nd % MSG.length] : "يمكنك البدء عندما تكون مستعدًا.";
  const dayList = [...new Set([...(wk.days || []), ...wk.items.map((i) => i.day)])].sort((a, b) => a - b);
  view.innerHTML = hd + `<section class="art pprog"><div class="pstats"><div><b>${AD(nd)}</b><span>مكتملة</span></div><div><b>${AD(nr)}</b><span>متبقية</span></div><div><b>${AD(nl)}</b><span>مؤجّلة</span></div><div><b>${AD(wk.items.reduce((a, i) => a + (i.tries || 0), 0))}</b><span>مرات إعادة التجربة</span></div></div><div class="pbar" role="progressbar" aria-valuenow="${nd}" aria-valuemin="0" aria-valuemax="${ss.length}"><i style="width:${ss.length ? Math.round((nd / ss.length) * 100) : 0}%"></i></div><p class="pmsg" role="status">${esc(msg)}</p>
${wk.paused ? '<p class="pnote">الخطة متوقفة مؤقتًا؛ لا تُحتسب أنشطة متأخرة.</p>' : ""}${missed.length && !wk.paused ? `<p class="pnote">لديك ${AD(missed.length)} ${missed.length > 2 ? "أنشطة" : "نشاط"} لم تُنجز في أيام سابقة، وهذا طبيعي. <button class="pb" type="button" id="presch">أعد جدولتها لبقية الأسبوع</button></p>` : ""}
<div class="pbtns"><button class="pb go" type="button" id="padd">إضافة نشاط من المكتبة</button><button class="pb" type="button" id="ppause">${wk.paused ? "استئناف الخطة" : "إيقاف الخطة مؤقتًا"}</button><button class="pb" type="button" id="pnew">إنشاء خطة جديدة للأسبوع التالي</button><button class="pb" type="button" id="pedit">خطة جديدة لهذا الأسبوع</button><button class="pb" type="button" id="pdel">حذف الخطة</button></div></section>
<div id="pwiz"></div><div id="padder"></div>
<section class="art pweek ${wk.paused ? "ppaused" : ""}" aria-label="جدول الأسبوع">${dayList.map((d) => { const its = wk.items.filter((i) => i.day === d); const dt = parse(addDays(WS, d)); return `<div class="pday ${cur && d === ti ? "ptoday" : ""}" data-d="${d}"><h2>${DAYS[d]} <small>${AD(dt.getDate())}</small></h2>${its.map((i) => card(i, st, done, wk)).join("") || '<p class="pempty">يوم راحة</p>'}</div>`; }).join("")}</section>${recBox()}`;
  bind(st, wk);
}
const weekLabel = (ws) => { const a = parse(ws), b = parse(addDays(ws, 6)), M = (d) => d.toLocaleDateString("ar", { month: "long" }); return `من ${AD(a.getDate())} ${M(a)} إلى ${AD(b.getDate())} ${M(b)}`; };
const recBox = () => '<section class="art"><h2>توصيات التعلم لطفلك</h2><div class="rec-mount" data-max="3"></div><p class="rmore"><a href="../next/">كل التوصيات وإعداداتها</a></p></section>';
async function checkLinks(wk) {
  if (LINKOK) return; LINKOK = {}; const srcs = [...new Set(wk.items.map((i) => i.key.split(":")[0]))];
  await Promise.all(srcs.map(async (s) => { try { const u = ROOT + R.URLS[s]("x").split("?")[0]; const r = await fetch(u, { method: "HEAD" }); LINKOK[s] = r.ok; if (!r.ok) logLink("صفحة نشاط غير متاحة: " + s + " " + r.status); } catch { LINKOK[s] = null; } }));
  wk.items.forEach((i) => { if (bad(i.key)) logLink("نشاط في الخطة لم يعد منشورًا: " + i.key); });
}
/* ---------- المعالج ---------- */
function wizard(st, ws, prefill) {
  const el = $("#pwiz"), P = planOf(st), g = R.wGroup(st.lv || "a5"), s0 = Object.assign({ days: (RULES.defDays && DEFDAYS[(RULES.defDays || DEF.defDays)[g]]) || DEFDAYS[4], n: (RULES.defN || DEF.defN)[g], doms: [], review: RULES.review !== false }, P.set, prefill || {});
  let lv = st.lv || "", days = new Set(s0.days), doms = new Set(s0.doms || []);
  const tpls = () => TPL.filter((t) => (t.data.groups || []).includes(R.wGroup(lv || "a5")));
  el.innerHTML = `<section class="art pwiz"><h2>إنشاء خطة أسبوعية</h2><p class="hint">اختر ما يناسب طفلك. لا نطلب أي معلومات شخصية.</p>
<fieldset><legend>عمر الطفل أو صفه</legend><div class="pchips" id="wlv">${R.LVK.map((k) => `<button type="button" class="pchip ${k === lv ? "on" : ""}" data-l="${k}">${R.LV[k]}</button>`).join("")}</div></fieldset>
<div id="wtp"></div>
<fieldset><legend>المجالات التي تريد التركيز عليها (بدون اختيار = توازن بين كل المجالات)</legend><div class="pchips" id="wdm">${R.cfg.dom.map((d) => `<button type="button" class="pchip ${doms.has(d.slug) ? "on" : ""}" data-d="${esc(d.slug)}">${esc(d.title)}</button>`).join("")}</div></fieldset>
<fieldset><legend>الأيام المخصصة للتعلم</legend><div class="pchips" id="wdy">${DAYS.map((n, i) => `<button type="button" class="pchip ${days.has(i) ? "on" : ""}" data-y="${i}">${n}</button>`).join("")}</div></fieldset>
<label>عدد الأنشطة خلال الأسبوع <input type="number" id="wn" min="1" max="${RULES.maxN}" value="${s0.n}"></label><p class="hint">القليل الجيد أفضل من الكثير المرهق. يكفي ${AD(capOf(lv || "a5"))} ${capOf(lv || "a5") > 1 ? "نشاطان" : "نشاط"} في اليوم كحد أقصى.</p>
<label class="pck"><input type="checkbox" id="wrv" ${s0.review ? "checked" : ""}> أدرج أنشطة مراجعة لمهارات سبق التدريب عليها</label><label class="pck"><input type="checkbox" id="wad"> أريد إضافة نشاط بنفسي من المكتبة بعد إنشاء الخطة</label><p id="wer" class="perr" role="alert"></p>
<div class="pbtns"><button class="abtn go" type="button" id="wgo">إنشاء الخطة</button><button class="abtn" type="button" id="wx">إلغاء</button></div></section>`;
  const fillT = () => { const t = tpls(); $("#wtp").innerHTML = t.length ? `<label>نموذج جاهز (اختياري) <select id="wt"><option value="">بدون نموذج</option>${t.map((x) => `<option value="${esc(x.slug)}">${esc(x.title)}</option>`).join("")}</select></label>` : ""; const w = $("#wt"); if (w) w.onchange = () => { const x = TPL.find((q) => q.slug === w.value); if (!x) return; const d = x.data; doms = new Set(d.doms || []); days = new Set(DEFDAYS[d.days] || DEFDAYS[4]); $("#wn").value = d.n; $("#wrv").checked = !!d.review; $$("#wdm .pchip").forEach((b) => b.classList.toggle("on", doms.has(b.dataset.d))); $$("#wdy .pchip").forEach((b) => b.classList.toggle("on", days.has(+b.dataset.y))); }; };
  fillT();
  $$("#wlv [data-l]").forEach((b) => (b.onclick = () => { lv = b.dataset.l; $$("#wlv .pchip").forEach((x) => x.classList.toggle("on", x === b)); fillT(); }));
  $$("#wdm [data-d]").forEach((b) => (b.onclick = () => { const k = b.dataset.d; doms.has(k) ? doms.delete(k) : doms.add(k); b.classList.toggle("on", doms.has(k)); }));
  $$("#wdy [data-y]").forEach((b) => (b.onclick = () => { const k = +b.dataset.y; days.has(k) ? days.delete(k) : days.add(k); b.classList.toggle("on", days.has(k)); }));
  $("#wx").onclick = () => (el.innerHTML = "");
  $("#wgo").onclick = async () => {
    const er = $("#wer"); er.textContent = ""; if (!lv) return (er.textContent = "اختر عمر الطفل أو صفه."); if (!days.size) return (er.textContent = "اختر يومًا واحدًا على الأقل.");
    const n = parseInt($("#wn").value, 10); if (!(n >= 1 && n <= RULES.maxN)) return (er.textContent = "عدد الأنشطة من ١ إلى " + AD(RULES.maxN) + ".");
    const cap = capOf(lv); if (n > days.size * cap) return (er.textContent = `لتجنب الإرهاق: ${AD(days.size)} ${days.size > 2 ? "أيام" : "يومان"} تتسع لـ ${AD(days.size * cap)} ${days.size * cap > 2 ? "أنشطة" : "نشاط"} كحد أقصى. زد الأيام أو قلل العدد.`);
    $("#wgo").disabled = true; mut((k) => { k.pf = k.pf || {}; k.pf.lv = lv; });
    const st2 = R.state(), set = { days: [...days], n, doms: [...doms], review: $("#wrv").checked }, wk = await build(st2, ws, set);
    if (!wk) { $("#wgo").disabled = false; er.textContent = "سنضيف المزيد من الأنشطة المناسبة قريبًا. جرّب مجالات أخرى أو أدرج أنشطة المراجعة."; return; }
    const ask = $("#wad").checked; mut((k) => { k.plan.weeks[ws] = wk; k.plan.set = set; }); await draw(); if (ask) openAdder();
  };
  el.scrollIntoView({ block: "start" });
}
/* ---------- إضافة نشاط من المكتبة ---------- */
async function openAdder() {
  const st = R.state(), el = $("#padder"); if (!st.lv) return; await R.loadCfg(); const pool = (await R.loadPool(st.lv)).filter((x) => x.src !== "games" && !(R.cfg.ov[x.key] && R.cfg.ov[x.key].status === "off"));
  if (R.cfg.mode === "approve") { /* بوضع الاعتماد لا يُضاف إلا المعتمد */ }
  const okp = pool.filter((x) => R.cfg.mode !== "approve" || (R.cfg.ov[x.key] && R.cfg.ov[x.key].status === "on")), used = new Set(planOf(st).weeks[WS].items.map((i) => i.key));
  el.innerHTML = `<section class="art padder"><h2>إضافة نشاط من المكتبة</h2><div class="pbtns"><input type="search" id="aq" placeholder="ابحث بعنوان النشاط"><select id="ad">${DAYS.map((n, i) => `<option value="${i}">${n}</option>`).join("")}</select><button class="pb" type="button" id="ax">إغلاق</button></div><p id="aer" class="perr" role="alert"></p><div id="alist"></div></section>`;
  const show = () => { const q = $("#aq").value.trim(), l = okp.filter((x) => !used.has(x.key) && (!q || x.title.includes(q))).slice(0, 24); $("#alist").innerHTML = l.length ? l.map((x) => `<div class="arow"><span>${esc(x.title)}<small> ${esc(R.KIND[x.src])}</small></span><button class="pb go" type="button" data-k="${esc(x.key)}">أضف</button></div>`).join("") : '<p class="pempty">لا نتائج مناسبة لمرحلة طفلك.</p>';
    $$("#alist [data-k]").forEach((b) => (b.onclick = () => { const wk = planOf(R.state()).weeks[WS], d = +$("#ad").value, x = okp.find((q) => q.key === b.dataset.k); if (wk.items.filter((i) => i.day === d).length >= capOf(st.lv)) return ($("#aer").textContent = "هذا اليوم ممتلئ؛ اختر يومًا آخر لتجنب الإرهاق."); mut((k) => { k.plan.weeks[WS].items.push({ id: RID(), key: x.key, day: d, st: "todo", c: Date.now(), why: "نشاط اخترتَه من المكتبة.", ty: "manual", tries: 0, note: "" }); const w = k.plan.weeks[WS]; if (!w.days.includes(d)) w.days.push(d); }); draw(); })); };
  $("#aq").oninput = show; $("#ax").onclick = () => (el.innerHTML = ""); show(); el.scrollIntoView({ block: "start" });
}
/* ---------- الربط والأحداث ---------- */
function bind(st, wk) {
  const kid = $("#pkid"); if (kid) kid.onchange = () => { const DB = lget(LK, {}); DB.cur = kid.value; localStorage.setItem(LK, JSON.stringify(DB)); location.reload(); };
  $("#pprev").onclick = () => { WS = addDays(WS, -7); LINKOK = null; draw(); }; $("#pnext").onclick = () => { WS = addDays(WS, 7); LINKOK = null; draw(); }; const th = $("#pthis"); if (th) th.onclick = () => { WS = weekStart(new Date()); draw(); };
  const cr = $("#pcreate"); if (cr) cr.onclick = () => wizard(st, WS);
  if (W.ZREC) $$(".rec-mount").forEach((e) => W.ZREC.mount(e, { max: 3 }));
  if (!wk) return;
  $("#padd").onclick = openAdder; $("#pedit").onclick = () => { if (confirm("إنشاء خطة جديدة لهذا الأسبوع يستبدل الخطة الحالية. أنشطتك المنجزة تبقى محفوظة في ملف الإنجاز. متابعة؟")) wizard(st, WS); };
  $("#ppause").onclick = () => { mut((k) => (k.plan.weeks[WS].paused = !k.plan.weeks[WS].paused)); draw(); };
  $("#pdel").onclick = () => { if (!confirm("حذف خطة هذا الأسبوع؟ لن تُحذف الأنشطة التي أنجزها الطفل من ملف الإنجاز.")) return; mut((k) => delete k.plan.weeks[WS]); draw(); };
  $("#pnew").onclick = async () => { const nx = addDays(weekStart(new Date()), 7); WS = nx; LINKOK = null; const s2 = R.state(); if (planOf(s2).weeks[nx]) return draw(); const set = planOf(s2).set; if (set && set.days && set.days.length && s2.lv) { const w = await build(s2, nx, set); if (w) { mut((k) => (k.plan.weeks[nx] = w)); return draw(); } } await draw(); wizard(R.state(), nx); };
  const rs = $("#presch"); if (rs) rs.onclick = () => { const ti = todayIdx(WS), cap = capOf(st.lv), w = planOf(R.state()).weeks[WS], done = R.doneSet(R.state().kid); const free = []; for (let d = Math.max(0, ti); d <= 6; d++) free.push(d); if (!free.length) return; mut((k) => { const wk2 = k.plan.weeks[WS]; wk2.items.forEach((i) => { if (!isDone(stateOf(i, done)) && i.day < ti) { const cnt = (d) => wk2.items.filter((q) => q.day === d && q !== i).length; const d = free.find((x) => cnt(x) < cap); if (d != null) { i.day = d; i.st = "todo"; if (!wk2.days.includes(d)) wk2.days.push(d); } } }); }); draw(); };
  $$("#pview .pcard").forEach((n) => {
    const id = n.dataset.i;
    const act = (fn) => async () => { await fn(id); };
    n.querySelectorAll("[data-a]").forEach((b) => {
      const a = b.dataset.a;
      if (a === "go") b.addEventListener("click", () => { const it = planOf(R.state()).weeks[WS].items.find((i) => i.id === id), done = R.doneSet(R.state().kid); if (it && isDone(stateOf(it, done))) mut((k) => { k.plan.weeks[WS].items.find((i) => i.id === id).tries = (it.tries || 0) + 1; }); });
      else if (a === "done") b.onclick = () => { SAY = MSG[Math.floor(Math.random() * MSG.length)]; mut((k) => { const it = k.plan.weeks[WS].items.find((i) => i.id === id), [s, ...r] = it.key.split(":"); it.st = "done"; it.t = Date.now(); it.w = writeRecord(k, s, r.join(":")) ? 1 : 0; }); draw(); };
      else if (a === "undo") b.onclick = () => { mut((k) => { const it = k.plan.weeks[WS].items.find((i) => i.id === id), [s, ...r] = it.key.split(":"); if (it.w) unwriteRecord(k, s, r.join(":"), it.t); it.st = "todo"; it.w = 0; }); draw(); };
      else if (a === "later") b.onclick = () => { mut((k) => (k.plan.weeks[WS].items.find((i) => i.id === id).st = "later")); draw(); };
      else if (a === "del") b.onclick = () => { mut((k) => { const w = k.plan.weeks[WS]; w.items = w.items.filter((i) => i.id !== id); }); draw(); };
      else if (a === "mv") b.onchange = () => { const d = +b.value, w = planOf(R.state()).weeks[WS]; if (w.items.filter((i) => i.day === d && i.id !== id).length >= capOf(st.lv)) { alert("هذا اليوم ممتلئ؛ اختر يومًا آخر لتجنب الإرهاق."); draw(); return; } mut((k) => { const w2 = k.plan.weeks[WS], it = w2.items.find((i) => i.id === id); it.day = d; if (it.st === "later") it.st = "todo"; if (!w2.days.includes(d)) w2.days.push(d); }); draw(); };
      else if (a === "note") b.onchange = () => mut((k) => (k.plan.weeks[WS].items.find((i) => i.id === id).note = b.value.slice(0, 300)));
      else if (a === "chg") b.onclick = async () => {
        const s2 = R.state(), w = planOf(s2).weeks[WS], it = w.items.find((i) => i.id === id), old = it.key, set = Object.assign({}, planOf(s2).set, { doms: w.doms || [], review: w.review });
        const ex = new Set(w.items.map((i) => i.key)); let c = await cands(s2, Object.assign({}, set, { doms: [] }), ex);
        const od = META[old] ? domOfRow(META[old]) : ""; const same = c.filter((x) => x.dom === od), pool = same.length ? same : set.doms && set.doms.length ? c.filter((x) => set.doms.includes(x.dom)) : c; const x = pool[0] || c[0];
        if (!x) { alert("سنضيف المزيد من الأنشطة المناسبة قريبًا."); return; }
        mut((k) => { const t = k.plan.weeks[WS].items.find((i) => i.id === id); t.key = x.key; t.why = R.reasonOf(x); t.ty = x.type; t.st = "todo"; t.c = Date.now(); t.tries = 0; t.w = 0; }); draw();
      };
    });
  });
}
W.ZPLAN = { weekStart, addDays, writeRecord, stateOf, build, pick, assign, cands, capOf };
draw();
})();
