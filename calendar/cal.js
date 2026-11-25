/* التقويم التعليمي: عرض شهري وأسبوعي وقائمة قادمة. يجمع أنشطة خطة الطفل مع أنشطة المكتبة المجدولة (cal_events) المرتبطة بمحتوى منشور فعلًا.
   التذكيرات اختيارية وتظهر عند فتح التقويم؛ لا شيء يُرسل خارج الجهاز. */
(function () {
"use strict";
const D = document, W = window, R = W.ZREC; if (!R) return;
const $ = (s, r) => (r || D).querySelector(s), $$ = (s, r) => [...(r || D).querySelectorAll(s)];
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const LK = "zad-learn-v3", ROOT = R.ROOT, DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, ""), ANON = W.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
const CATS = { lib: "أنشطة المكتبة", ws: "أوراق العمل", story: "القصص التعليمية", home: "الأنشطة المنزلية", proj: "المشروعات التعليمية", exp: "التجارب العلمية الآمنة", art: "الأنشطة الفنية", challenge: "التحديات والمسابقات", occasion: "المناسبات والموضوعات الموسمية" };
const SRCCAT = { acts: "ws", stories: "story", proj: "proj", life: "home" };
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => new Date(s + "T12:00:00");
const addDays = (s, n) => { const x = parse(s); x.setDate(x.getDate() + n); return iso(x); };
const weekStart = (s) => { const x = parse(s); return addDays(s, -((x.getDay() + 1) % 7)); };
const dayIdx = (s) => (parse(s).getDay() + 1) % 7;
const todayS = () => iso(new Date());
const RID = () => "i" + Math.random().toString(36).slice(2, 9);
const dLabel = (s) => { const d = parse(s); return `${DAYS[dayIdx(s)]} ${AD(d.getDate())} ${AD(d.toLocaleDateString("ar", { month: "long" }))}`; };
const mLabel = (s) => AD(parse(s).toLocaleDateString("ar", { month: "long", year: "numeric" }));
const ST = { view: "month", cur: todayS(), sel: todayS(), cats: new Set(Object.keys(CATS)), topic: "", rec: false };
let EV = [], TOP = [], META = {}, MSG = "";
/* ---------- التخزين المشترك مع الخطة ---------- */
let pt = 0;
function mut(fn) { const DB = lget(LK, null) || { cur: "k1", kids: { k1: {} } }; if (!DB.kids || !Object.keys(DB.kids).length) DB.kids = { k1: {} }; if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0]; const k = DB.kids[DB.cur]; k.plan = k.plan || {}; k.plan.weeks = k.plan.weeks || {}; k.plan.set = k.plan.set || {}; k.cal = k.cal || {}; fn(k, DB); DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} clearTimeout(pt); pt = setTimeout(pushNow, 2500); }
async function pushNow() {
  try {
    let S = null; try { S = JSON.parse(localStorage.getItem("zad-sess")); } catch {} if (!S || localStorage.getItem("zad-pf-consent") !== "1") return;
    if (S.exp - 60000 < Date.now()) { const r = await fetch(SB + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: S.rt }) }); if (!r.ok) return; const j = await r.json(); S = { at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: S.email, uid: S.uid }; localStorage.setItem("zad-sess", JSON.stringify(S)); }
    const H = { apikey: ANON, Authorization: "Bearer " + S.at, "Content-Type": "application/json" };
    const c = await (await fetch(SB + "/rest/v1/learn_saves?select=updated_at&user_id=eq." + S.uid, { headers: H })).json(), last = localStorage.getItem("zad-sync-last") || "";
    if (c && c[0] && c[0].updated_at && last && c[0].updated_at > last) return;
    const at = new Date().toISOString(); const r = await fetch(SB + "/rest/v1/learn_saves?on_conflict=user_id", { method: "POST", headers: Object.assign({ Prefer: "resolution=merge-duplicates" }, H), body: JSON.stringify({ user_id: S.uid, data: lget(LK, {}), updated_at: at }) }); if (r.ok) localStorage.setItem("zad-sync-last", at);
  } catch {}
}
function logErr(m) { try { const k = "zad-cal-err:" + m; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); fetch(SB + "/rest/v1/pf_errors", { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ kind: "cal-link", msg: String(m).slice(0, 300) }) }).catch(() => {}); } catch {} }
/* ---------- البيانات ---------- */
async function loadMeta(keys) {
  const by = {}; keys.filter((k) => !(k in META)).forEach((k) => { const [s, ...r] = k.split(":"); (by[s] = by[s] || []).push(r.join(":")); });
  await Promise.all(Object.entries(by).map(async ([s, sl]) => { const t = R.TB[s]; sl.forEach((x) => (META[s + ":" + x] = null)); if (!t) return; try { const rows = await R.rest(`${t[0]}?status=eq.published&slug=in.(${sl.map(encodeURIComponent).join(",")})&select=${t[1]}`); rows.forEach((x) => { x.src = s; x.key = s + ":" + x.slug; META[x.key] = x; }); } catch { sl.forEach((x) => delete META[s + ":" + x]); } }));
}
const domOf = (row, ev) => (ev && ev.domain) || (R.cfg.ov[row.key] && R.cfg.ov[row.key].domain) || R.domOf(row);
const catOfPlan = (row) => (domOf(row) === "arts" ? "art" : SRCCAT[row.src] || "lib");
const isDone = (s) => s === "done" || s === "auto";
function stateOf(it, done) { if (it.st === "done") return "done"; const t = done.get(it.key); if (t && t >= new Date(it.c).setHours(0, 0, 0, 0)) return "auto"; return it.st; }
/* عناصر التقويم الشخصي (من الخطة) + أنشطة المكتبة المجدولة */
function collect(st) {
  const plan = (st.kid && st.kid.plan && st.kid.plan.weeks) || {}, done = R.doneSet(st.kid), out = [], wkKeys = {};
  Object.entries(plan).forEach(([ws, w]) => (w.items || []).forEach((it) => { const date = addDays(ws, it.day); const row = META[it.key]; (wkKeys[ws] = wkKeys[ws] || new Set()).add(it.key); if (!row) { logErr("نشاط في الخطة بلا محتوى منشور: " + it.key); return; } out.push({ t: "plan", id: it.id, ws, it, key: it.key, date, row, cat: catOfPlan(row), done: isDone(stateOf(it, done)), paused: !!w.paused }); }));
  EV.forEach((e) => { const key = e.src + ":" + e.slug, row = META[key]; if (!row) { logErr("نشاط تقويم بلا محتوى منشور: " + e.id); return; } if (!(e.levels || []).includes(st.lv)) return;
    const ws = weekStart(e.starts), inPlan = !!(wkKeys[ws] && wkKeys[ws].has(key)); out.push({ t: "ev", id: e.id, ev: e, key, date: e.starts, row, cat: e.kind, inPlan }); });
  return out;
}
const visible = (it) => ST.cats.has(it.cat) && (!ST.topic || (it.t === "ev" && it.ev.topic === ST.topic));
/* ---------- البطاقة ---------- */
function card(it, st, list) {
  const m = it.row, ev = it.ev, key = it.key, [s, ...r] = key.split(":"), url = ROOT + R.URLS[s](encodeURIComponent(r.join(":")));
  const dom = R.domName(domOf(m, ev)), lvs = ev ? ev.levels.map((l) => R.LV[l]).join("، ") : R.LV[st.lv] || "";
  const desc = ev ? ev.descr : it.it.why || "", mins = ev && ev.minutes ? AD(ev.minutes) + " دقيقة تقريبًا" : R.dur(m), prep = ev && ev.needs_prep;
  const img = (ev && ev.image_url) || R.imgOf(m), id = esc(it.t + ":" + it.id), pdn = it.t === "plan" && it.done;
  const btns = [];
  btns.push(list ? `<a class="cb go" href="${esc(url)}">عرض النشاط</a>` : `<button class="cb" type="button" data-a="det">عرض التفاصيل</button>`);
  if (it.t === "ev") btns.push(it.inPlan ? '<span class="cb dis">في خطتك</span>' : '<button class="cb ok" type="button" data-a="add">إضافة إلى خطتي</button>');
  if (!prep) btns.push(`<a class="cb ${list ? "" : "go"}" href="${esc(url)}" data-a="start">بدء النشاط</a>`);
  if (it.t === "plan") btns.push('<button class="cb" type="button" data-a="mv">تغيير الموعد</button><button class="cb" type="button" data-a="rm">إزالة من الخطة</button>');
  return `<article class="ccard ${pdn ? "cdone" : ""}" data-id="${id}"><img class="cimg" src="${esc(img)}" alt="" width="52" height="52" loading="lazy" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_puzzle.webp'"><div class="cbody"><h3>${esc(m.title === (ev && ev.title) ? m.title : (ev ? ev.title : m.title))}</h3>
<p class="cmeta"><span class="ck k-${it.cat}">${CATS[it.cat]}</span><span class="cd">${dLabel(it.date)}</span>${it.t === "plan" ? '<span class="ck kp">من خطتي</span>' : ""}</p><p class="cmeta"><span>${esc(dom)}</span><span>${esc(lvs)}</span>${mins ? `<span>${esc(mins)}</span>` : ""}</p>${desc ? `<p class="cdesc">${esc(desc)}</p>` : ""}${prep ? `<p class="cprep">يحتاج تجهيزًا: ${esc(ev.prep_note || "")}</p>` : ""}${pdn ? '<p class="cok">أكملت هذه الخطوة.</p>' : ""}
<div class="cbtns">${btns.join("")}</div><div class="cpanel" hidden></div></div></article>`;
}
/* ---------- العروض ---------- */
function viewMonth(items, st) {
  const first = ST.cur.slice(0, 8) + "01", lead = dayIdx(first), n = new Date(parse(first).getFullYear(), parse(first).getMonth() + 1, 0).getDate(), by = {}; items.forEach((i) => (by[i.date] = by[i.date] || []).push(i));
  let cells = ""; for (let i = 0; i < lead; i++) cells += '<div class="ccell cmt"></div>';
  for (let d = 1; d <= n; d++) { const s = first.slice(0, 8) + String(d).padStart(2, "0"), a = by[s] || []; cells += `<button type="button" class="ccell ${s === todayS() ? "ctoday" : ""} ${s === ST.sel ? "csel" : ""}" data-day="${s}" aria-label="${dLabel(s)}${a.length ? "، " + AD(a.length) + " أنشطة" : ""}"><b>${AD(d)}</b><span class="cdots">${a.slice(0, 4).map((i) => `<i class="dk k-${i.cat}"></i>`).join("")}</span>${a.length > 4 ? `<small>+${AD(a.length - 4)}</small>` : ""}</button>`; }
  const days = Object.keys(by).filter((s) => s.startsWith(first.slice(0, 7))).sort();
  return `<div class="cgrid" role="grid"><div class="chead">${DAYS.map((x) => `<span>${x}</span>`).join("")}</div><div class="cbox">${cells}</div></div><div class="cdaypanel" id="cdaypanel">${dayPanel(by[ST.sel] || [], ST.sel, st)}</div>
<div class="cagenda">${days.length ? days.map((s) => `<section class="cday"><h3>${dLabel(s)}</h3>${by[s].map((i) => card(i, st)).join("")}</section>`).join("") : '<p class="cempty">لا أنشطة في هذا الشهر. يمكنك إضافة أنشطة من «أنشطة قادمة» إلى خطتك.</p>'}</div>`;
}
const dayPanel = (a, s, st) => `<h3>${dLabel(s)}</h3>${a.length ? a.map((i) => card(i, st)).join("") : '<p class="cempty">لا أنشطة في هذا اليوم. يوم راحة جميل.</p>'}`;
function viewWeek(items, st) {
  const ws = weekStart(ST.cur), by = {}; items.forEach((i) => (by[i.date] = by[i.date] || []).push(i));
  return `<div class="cweek">${[0, 1, 2, 3, 4, 5, 6].map((d) => { const s = addDays(ws, d); return `<section class="cday ${s === todayS() ? "ctodayc" : ""}"><h3>${dLabel(s)}</h3>${(by[s] || []).map((i) => card(i, st)).join("") || '<p class="cempty">لا أنشطة</p>'}</section>`; }).join("")}</div>`;
}
function viewList(items, st) {
  const t = todayS(), l = items.filter((i) => i.date >= t && !i.done).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 40);
  return `<div class="clist">${l.length ? l.map((i) => card(i, st, true)).join("") : '<p class="cempty">لا أنشطة قادمة الآن. سنضيف المزيد قريبًا، ويمكنك بناء خطتك من «خطتي التعليمية».</p>'}</div>`;
}
const label = () => (ST.view === "month" ? mLabel(ST.cur) : ST.view === "week" ? `أسبوع ${dLabel(weekStart(ST.cur))}` : "الأنشطة القادمة");
/* ---------- الصفحة ---------- */
async function load(st) {
  await R.loadCfg(); const lv = st.lv;
  try { EV = lv ? await R.rest(`cal_events?select=*&levels=cs.{${lv}}&order=starts.asc&limit=500`) : []; } catch (e) { EV = []; R.reportErr("cal " + e.message); }
  try { TOP = await R.rest("cal_topics?select=slug,title,kind,date_from,date_to&order=sort_order.asc"); } catch { TOP = []; }
  const keys = EV.map((e) => e.src + ":" + e.slug), plan = (st.kid && st.kid.plan && st.kid.plan.weeks) || {}; Object.values(plan).forEach((w) => (w.items || []).forEach((i) => keys.push(i.key)));
  await loadMeta([...new Set(keys)]);
}
function banners(st, items) {
  const c = (st.kid && st.kid.cal) || {}, out = [], t = todayS(), tm = addDays(t, 1);
  if (c.rem && c.lastRem !== t) { const a = items.filter((i) => i.t === "plan" && !i.done && !i.paused && (c.remWhen === "same" ? i.date === t : i.date === tm)); if (a.length) out.push(`<p class="cban" role="status">تذكير لطيف: لديكم ${c.remWhen === "same" ? "اليوم" : "غدًا"} «${esc(a[0].row.title)}»${a.length > 1 ? ` و${AD(a.length - 1)} ${a.length > 2 ? "أنشطة" : "نشاط"} آخر` : ""}. <button class="cb" type="button" data-b="remx">إخفاء</button></p>`); }
  if (c.newOn && c.seen) { const n = EV.filter((e) => Date.parse(e.publish_at) > c.seen && (e.levels || []).includes(st.lv) && META[e.src + ":" + e.slug]); if (n.length) out.push(`<p class="cban" role="status">نُشر نشاط جديد مناسب لطفلك: «${esc(n[0].title)}»${n.length > 1 ? ` و${AD(n.length - 1)} آخر` : ""}. <button class="cb" type="button" data-b="newx">حسنًا</button></p>`); }
  return out.join("");
}
async function draw() {
  const st = R.state(), root = $("#cview"); await load(st); const items = collect(st).filter(visible), kids = st.DB ? Object.keys(st.DB.kids) : [], c = (st.kid && st.kid.cal) || {};
  const nm = (k) => st.DB.kids[k].name || (st.DB.kids[k].pf && st.DB.kids[k].pf.nick) || "الطفل " + (kids.indexOf(k) + 1);
  const used = new Set([...collect(st)].map((i) => i.cat));
  root.innerHTML = `<div class="zbc"><a href="../">الرئيسية</a> › <a href="../library/">المكتبة</a> › التقويم التعليمي</div><section class="art"><h1>التقويم التعليمي</h1><p class="hint">أنشطتك المخططة وأنشطة المكتبة القادمة في مكان واحد. التقويم خاص بك ولا يُعرض لأحد.</p>
${kids.length > 1 ? `<label class="nxk">الطفل: <select id="ckid">${kids.map((k) => `<option value="${esc(k)}"${k === st.cur ? " selected" : ""}>${esc(nm(k))}</option>`).join("")}</select></label>` : ""}
${st.lv ? `<p class="hint">المرحلة: <b>${esc(R.LV[st.lv])}</b></p>` : ""}${MSG ? `<p class="cban" role="status">${esc(MSG)}</p>` : ""}${st.lv ? banners(st, collect(st)) : ""}
<div class="ctabs" role="tablist">${[["month", "شهري"], ["week", "أسبوعي"], ["list", "أنشطة قادمة"]].map(([k, l]) => `<button class="ctab ${ST.view === k ? "on" : ""}" type="button" role="tab" aria-selected="${ST.view === k}" data-v="${k}">${l}</button>`).join("")}</div>
${ST.view !== "list" ? `<div class="cnav"><button class="cb" type="button" id="cprev">السابق</button><b>${label()}</b><button class="cb" type="button" id="cnext">التالي</button><button class="cb" type="button" id="ctoday">اليوم</button></div>` : ""}
<div class="cfilt" aria-label="تصفية الأنشطة">${Object.entries(CATS).map(([k, l]) => `<button type="button" class="cchip ${ST.cats.has(k) ? "on" : ""}" data-c="${k}"><i class="dk k-${k}"></i>${l}</button>`).join("")}</div>
${TOP.length ? `<div class="cfilt" aria-label="المواضيع الموسمية"><button type="button" class="cchip ${ST.topic ? "" : "on"}" data-t="">كل المواضيع</button>${TOP.map((t) => `<button type="button" class="cchip ${ST.topic === t.slug ? "on" : ""}" data-t="${esc(t.slug)}">${esc(t.title)}</button>`).join("")}</div>` : ""}</section>
<section class="art" id="cmain">${!st.lv ? `<div class="cask"><p>لنعرض الأنشطة المناسبة، اختر عمر طفلك أو صفه:</p><div class="cbtns">${R.LVK.map((k) => `<button class="cb" type="button" data-l="${k}">${R.LV[k]}</button>`).join("")}</div></div>` : ST.view === "month" ? viewMonth(items, st) : ST.view === "week" ? viewWeek(items, st) : viewList(items, st)}</section>
<section class="art ccfg"><h2>التذكيرات والإعدادات</h2><p class="hint">اختيارية وهادئة: تظهر عند فتح التقويم فقط، مرة واحدة في اليوم، ولا تُعرض للطفل.</p>
<label class="cck"><input type="checkbox" id="crem" ${c.rem ? "checked" : ""}> ذكّرني بأنشطة خطتي</label><label class="cck">موعد التذكير <select id="cwhen"><option value="day" ${c.remWhen !== "same" ? "selected" : ""}>قبل النشاط بيوم</option><option value="same" ${c.remWhen === "same" ? "selected" : ""}>في يوم النشاط</option></select></label>
<label class="cck"><input type="checkbox" id="cnew" ${c.newOn ? "checked" : ""}> أخبرني عند نشر نشاط جديد مناسب لطفلي</label>
<div class="cbtns"><button class="cb go" type="button" id="cics">تنزيل أنشطة خطتي القادمة لتقويم الهاتف (ICS)</button><a class="cb" href="../plan/">خطتي التعليمية</a></div><p class="hint">ملف ICS يُنشأ على جهازك ويحوي عناوين الأنشطة وروابطها فقط، دون اسم الطفل أو أي بيانات أخرى، ويضيف تنبيهًا في تقويم هاتفك إن رغبت.</p></section>`;
  bind(st, items);
}
function openPanel(n, html) { const p = $(".cpanel", n); p.hidden = false; p.innerHTML = html; return p; }
function findItem(st, id) { return collect(st).find((i) => i.t + ":" + i.id === id); }
function capOf(lv) { const g = R.wGroup(lv); return { young: 1, mid: 2, school: 2 }[g] || 2; }
function place(k, st, key, date, ev, moveFrom) {
  const ws = weekStart(date), d = dayIdx(date); k.plan.weeks[ws] = k.plan.weeks[ws] || { id: RID(), created: Date.now(), days: [], n: 0, doms: [], review: false, lv: st.lv, paused: false, items: [] }; const w = k.plan.weeks[ws];
  if (w.items.some((i) => i.key === key && !(moveFrom && i.id === moveFrom.id))) return "هذا النشاط مضاف مسبقًا إلى خطة هذا الأسبوع.";
  if (w.items.filter((i) => i.day === d && !(moveFrom && i.id === moveFrom.id)).length >= capOf(st.lv)) return "هذا اليوم ممتلئ؛ اختر يومًا آخر لتجنب الإرهاق.";
  if (moveFrom) { const ow = k.plan.weeks[moveFrom.ws]; ow.items = ow.items.filter((i) => i.id !== moveFrom.id); const it = Object.assign({}, moveFrom.it, { day: d }); if (it.st === "later") it.st = "todo"; w.items.push(it); }
  else w.items.push({ id: RID(), key, day: d, st: "todo", c: Date.now(), why: ev ? "نشاط اخترته من التقويم التعليمي." : "", ty: "cal", tries: 0, note: "", ev: ev ? ev.id : undefined });
  if (!w.days.includes(d)) w.days.push(d); return "";
}
function bind(st, items) {
  const k = $("#ckid"); if (k) k.onchange = () => { const DB = lget(LK, {}); DB.cur = k.value; localStorage.setItem(LK, JSON.stringify(DB)); location.reload(); };
  $$("[data-v]").forEach((b) => (b.onclick = () => { ST.view = b.dataset.v; draw(); }));
  $$("[data-c]").forEach((b) => (b.onclick = () => { const c = b.dataset.c; ST.cats.has(c) ? ST.cats.delete(c) : ST.cats.add(c); if (!ST.cats.size) ST.cats = new Set(Object.keys(CATS)); draw(); }));
  $$("[data-t]").forEach((b) => (b.onclick = () => { ST.topic = b.dataset.t; draw(); }));
  $$("[data-l]").forEach((b) => (b.onclick = () => { try { localStorage.setItem("zad-rec-lv", b.dataset.l); } catch {} draw(); }));
  const step = (n) => { if (ST.view === "month") { const x = parse(ST.cur.slice(0, 8) + "01"); x.setMonth(x.getMonth() + n); ST.cur = iso(x); ST.sel = ST.cur; } else ST.cur = addDays(ST.cur, 7 * n); draw(); };
  const pv = $("#cprev"); if (pv) { pv.onclick = () => step(-1); $("#cnext").onclick = () => step(1); $("#ctoday").onclick = () => { ST.cur = todayS(); ST.sel = todayS(); draw(); }; }
  $$("[data-day]").forEach((b) => (b.onclick = () => { ST.sel = b.dataset.day; const by = items.filter((i) => i.date === ST.sel); $("#cdaypanel").innerHTML = dayPanel(by, ST.sel, st); $$(".ccell").forEach((x) => x.classList.toggle("csel", x === b)); wire(st); }));
  $$("[data-b=remx]").forEach((b) => (b.onclick = () => { mut((kk) => (kk.cal.lastRem = todayS())); draw(); }));
  $$("[data-b=newx]").forEach((b) => (b.onclick = () => { mut((kk) => (kk.cal.seen = Date.now())); draw(); }));
  $("#crem").onchange = () => { mut((kk) => (kk.cal.rem = $("#crem").checked ? 1 : 0)); MSG = $("#crem").checked ? "فُعّل التذكير. سيظهر عند فتح التقويم." : "أُوقف التذكير."; draw(); };
  $("#cwhen").onchange = () => mut((kk) => (kk.cal.remWhen = $("#cwhen").value));
  $("#cnew").onchange = () => { mut((kk) => { kk.cal.newOn = $("#cnew").checked ? 1 : 0; if (kk.cal.newOn) kk.cal.seen = Date.now(); }); MSG = $("#cnew").checked ? "فُعّل إشعار الأنشطة الجديدة." : "أُوقف إشعار الأنشطة الجديدة."; draw(); };
  $("#cics").onclick = () => ics(st);
  wire(st);
}
function wire(st) {
  $$(".ccard").forEach((n) => {
    if (n.dataset.w) return; n.dataset.w = 1; const id = n.dataset.id;
    n.querySelectorAll("[data-a]").forEach((b) => {
      const a = b.dataset.a;
      if (a === "det") b.onclick = () => { const it = findItem(st, id), p = $(".cpanel", n); if (!p.hidden) { p.hidden = true; return; } const ev = it.ev, [s, ...r] = it.key.split(":"), url = ROOT + R.URLS[s](encodeURIComponent(r.join(":"))); openPanel(n, `<p>${esc(ev ? ev.descr : it.it.why || "")}</p>${ev && ev.needs_prep ? `<p class="cprep">قبل البدء: ${esc(ev.prep_note)}</p>` : ""}<p>${esc(R.KIND[it.row.src])}${it.row.skill ? " · المهارة: " + esc(it.row.skill) : ""}</p><a class="cb go" href="${esc(url)}">فتح صفحة النشاط</a>`); };
      else if (a === "start") b.addEventListener("click", () => { const it = findItem(st, id); if (it && it.t === "plan" && it.done) mut((k) => { const w = k.plan.weeks[it.ws].items.find((i) => i.id === it.id); w.tries = (w.tries || 0) + 1; }); });
      else if (a === "add") b.onclick = () => { const it = findItem(st, id), t = todayS(), d0 = it.date >= t ? it.date : t; openPanel(n, `<label>اليوم المناسب <input type="date" class="cdate" value="${d0}" min="${t}"></label><p class="cerr" role="alert"></p><div class="cbtns"><button class="cb ok" type="button" data-p="y">تأكيد الإضافة</button><button class="cb" type="button" data-p="n">إلغاء</button></div>`); const p = $(".cpanel", n); $("[data-p=n]", p).onclick = () => (p.hidden = true); $("[data-p=y]", p).onclick = () => { const d = $(".cdate", p).value; if (!d || d < t) return ($(".cerr", p).textContent = "اختر تاريخًا من اليوم فصاعدًا."); let err = ""; mut((k) => { err = place(k, st, it.key, d, it.ev); }); if (err) return ($(".cerr", p).textContent = err); MSG = "أُضيف النشاط إلى خطتك في " + dLabel(d) + "."; draw(); }; };
      else if (a === "mv") b.onclick = () => { const it = findItem(st, id), t = todayS(); openPanel(n, `<label>الموعد الجديد <input type="date" class="cdate" value="${it.date}" min="${t}"></label><p class="cerr" role="alert"></p><div class="cbtns"><button class="cb ok" type="button" data-p="y">حفظ الموعد</button><button class="cb" type="button" data-p="n">إلغاء</button></div>`); const p = $(".cpanel", n); $("[data-p=n]", p).onclick = () => (p.hidden = true); $("[data-p=y]", p).onclick = () => { const d = $(".cdate", p).value; if (!d || d < t) return ($(".cerr", p).textContent = "اختر تاريخًا من اليوم فصاعدًا."); let err = ""; mut((k) => { err = place(k, st, it.key, d, null, { id: it.id, ws: it.ws, it: it.it }); }); if (err) return ($(".cerr", p).textContent = err); MSG = "نُقل النشاط إلى " + dLabel(d) + "."; draw(); }; };
      else if (a === "rm") b.onclick = () => { const it = findItem(st, id); mut((k) => { const w = k.plan.weeks[it.ws]; w.items = w.items.filter((i) => i.id !== it.id); }); MSG = "أُزيل النشاط من خطتك."; draw(); };
    });
  });
}
function ics(st) {
  const t = todayS(), l = collect(st).filter((i) => i.t === "plan" && !i.done && i.date >= t), when = (st.kid && st.kid.cal && st.kid.cal.remWhen) === "same" ? "PT8H" : "-PT15H", esc2 = (s) => String(s).replace(/[\;,]/g, "\\$&").replace(/\n/g, "\\n"), z = (s) => s.replace(/-/g, ""), now = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  if (!l.length) { MSG = "لا أنشطة قادمة في خطتك لتنزيلها."; return draw(); }
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Zad//Calendar//AR", "CALSCALE:GREGORIAN"];
  l.forEach((i) => { const [s, ...r] = i.key.split(":"); lines.push("BEGIN:VEVENT", "UID:" + i.id + "@zad", "DTSTAMP:" + now, "DTSTART;VALUE=DATE:" + z(i.date), "DTEND;VALUE=DATE:" + z(addDays(i.date, 1)), "SUMMARY:" + esc2(i.row.title), "DESCRIPTION:" + esc2("نشاط من خطتي التعليمية في زاد: " + new URL(ROOT + R.URLS[s](encodeURIComponent(r.join(":"))), location.href).href), "BEGIN:VALARM", "ACTION:DISPLAY", "DESCRIPTION:" + esc2(i.row.title), "TRIGGER:" + when, "END:VALARM", "END:VEVENT"); });
  lines.push("END:VCALENDAR"); const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" }), a = D.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "zad-plan.ics"; D.body.appendChild(a); a.click(); a.remove(); MSG = "تم تنزيل الملف."; draw();
}
W.ZCAL = { collect, place, weekStart, dayIdx };
draw();
})();
