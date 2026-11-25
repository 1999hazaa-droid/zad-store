/* ملف إنجاز الطفل – زاد: كل ما يظهر مستخرج من سجلات النشاط الحقيقية المحفوظة على هذا الجهاز فقط. */
(function () {
"use strict";
const W = window, D = document, PAGE = D.body.dataset.page || "hub";
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
const ROOT = new URL(PAGE === "hub" || PAGE === "rhub" ? "../" : "../../", D.baseURI).href;
const $ = (s, r) => (r || D).querySelector(s), $$ = (s, r) => [...(r || D).querySelectorAll(s)];
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const fmt = (t) => { const d = new Date(t); return AD(d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear()); };
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const CHS = { boy: "محمد", girl1: "فاطمة", girl2: "عائشة" };
const LK = "zad-learn-v3";
const icon = (c) => !c ? ROOT + "images/zad/i_puzzle.webp" : /^https?:|^\//.test(c) ? c : String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`;
const QC = { early: "التعلم المبكر", arabic: "اللغة العربية", math: "الرياضيات", english: "اللغة الإنجليزية", science: "العلوم والمعرفة", values: "القيم والمهارات الحياتية", contest: "مسابقة" };
/* المصادر: key → جدول المحتوى، التبويب، النوع، رابط العمل، حقول الجلب */
const SRC = {
  acts: { tb: "activities", cols: "slug,title,skill,subject,summary,image_url,pdf_url,kind", tab: "ws", type: "ورقة عمل أو نشاط", url: (s) => `${ROOT}activities/view/?a=${encodeURIComponent(s)}` },
  bank: { tb: "bank_items", cols: "slug,title,icon,skill,subject,descr,pdf_url", tab: "ws", type: "نشاط من بنك الأنشطة", url: (s) => `${ROOT}bank/play/?s=${encodeURIComponent(s)}` },
  proj: { tb: "proj_items", cols: "slug,title,icon,skill,subject,descr,kind", tab: "proj", type: "مشروع أو تحدٍّ", url: (s) => `${ROOT}projects/play/?s=${encodeURIComponent(s)}` },
  life: { tb: "life_items", cols: "slug,title,icon,cat", tab: "proj", type: "نشاط من المهارات الحياتية", lab: "المهارات الحياتية", url: (s) => `${ROOT}life/play/?s=${encodeURIComponent(s)}` },
  ready: { tb: "ready_items", cols: "slug,title,icon,cat", tab: "proj", type: "نشاط من الاستعداد المدرسي", lab: "الاستعداد المدرسي", url: (s) => `${ROOT}ready/play/?s=${encodeURIComponent(s)}` },
  val: { tb: "val_items", cols: "slug,title,icon,cat", tab: "les", type: "درس من القيم والسلوك", lab: "القيم والسلوك", url: (s) => `${ROOT}values/play/?s=${encodeURIComponent(s)}` },
  dig: { tb: "dig_items", cols: "slug,title,icon,cat", tab: "les", type: "درس من المهارات الرقمية", lab: "المهارات الرقمية", url: (s) => `${ROOT}digital/play/?s=${encodeURIComponent(s)}` },
  exp: { tb: "exp_items", cols: "slug,title,icon,cat", tab: "les", type: "درس من الثقافة العامة", lab: "الثقافة العامة", url: (s) => `${ROOT}explore/play/?s=${encodeURIComponent(s)}` },
  vid: { tb: "video_items", cols: "slug,title,icon,skill,subject,descr", tab: "les", type: "درس مرئي", url: (s) => `${ROOT}videos/play/?s=${encodeURIComponent(s)}` },
  songs: { tb: "song_items", cols: "slug,title,icon,skill,cat", tab: "les", type: "نشيد تعليمي", url: (s) => `${ROOT}songs/play/?s=${encodeURIComponent(s)}` },
  games: { tb: null, tab: "proj", type: "لعبة تعليمية", lab: "الألعاب التعليمية", url: (s) => `${ROOT}games/#g=${encodeURIComponent(s)}` },
  stories: { tb: "stories", cols: "slug,title,summary,topic,cover_url", tab: "les", type: "قصة تعليمية", lab: "القراءة والقصص", url: (s) => `${ROOT}stories/read/?s=${encodeURIComponent(s)}` },
};
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const gProfiles = () => { const a = lget("hg_profiles", []); return Array.isArray(a) ? a.filter((x) => typeof x === "string" && lget("hg_kid:" + x, null)) : []; };
function gId() { const ps = gProfiles(); if (P.gp && ps.includes(P.gp)) return P.gp; if (P.gp === "-") return ""; const nm = [P.nick, S.name].filter(Boolean); const m = ps.find((x) => nm.includes(x)); return m || (ps.length === 1 && Object.keys(DB.kids).length === 1 ? ps[0] : ""); }
function gameRecords() { const id = gId(); if (!id) return []; const prog = lget("hg_prog:" + id, {}), gt = lget("hg_gt:" + id, {}); return Object.entries(prog).filter(([, v]) => v > 0).map(([k, v]) => ({ src: "games", slug: k, t: +gt[k] || 0, stars: v })); }
const TABS = [["ws", "أوراق العمل"], ["proj", "المشروعات والأنشطة"], ["les", "القصص والدروس"], ["quiz", "الاختبارات والمسابقات"], ["cert", "الشهادات"]];
let DB = null, S = null, P = null, META = {}, CERTS = [], REC = [], EARNED = [], CERR = false;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; const p = (S.pf = S.pf || {}); p.hide = p.hide || {}; p.notes = p.notes || {}; p.certs = p.certs || {};
  if (!p.lv) { const a = parseInt(S.age, 10); p.lv = !a ? "a5" : a <= 2 ? "a2" : a <= 6 ? "a" + a : "g" + Math.min(4, a - 6); }
  if (!LV[p.lv]) p.lv = "a5"; if (!CHS[p.ch]) p.ch = "boy"; P = p;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} syncSoon(); }
/* ---- حساب ولي الأمر والمزامنة (نفس حساب «زاد» والجدول learn_saves: صف واحد لكل حساب، لا يقرؤه غيره) ---- */
const SBK2 = W.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
let SESS = null; try { SESS = JSON.parse(localStorage.getItem("zad-sess")); } catch {}
const setSess = (x) => { SESS = x; try { x ? localStorage.setItem("zad-sess", JSON.stringify(x)) : localStorage.removeItem("zad-sess"); } catch {} };
const lastSync = () => { try { return localStorage.getItem("zad-sync-last") || ""; } catch { return ""; } };
const setLast = (v) => { try { localStorage.setItem("zad-sync-last", v); } catch {} };
const consent = () => { try { return localStorage.getItem("zad-pf-consent") === "1"; } catch { return false; } };
async function sb(path, o) { o = o || {}; const r = await fetch(SB + path, { method: o.method || "GET", headers: Object.assign({ apikey: SBK2, "Content-Type": "application/json", Authorization: "Bearer " + (o.tok || SBK2) }, o.headers || {}), body: o.body ? JSON.stringify(o.body) : undefined }); let j = null; try { j = await r.json(); } catch {} if (!r.ok) throw new Error((j && (j.msg || j.error_description || j.message)) || "خطأ " + r.status); return j; }
const mkSess = (j) => ({ at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: (j.user && j.user.email) || (SESS && SESS.email), uid: (j.user && j.user.id) || (SESS && SESS.uid) });
async function tok() { if (!SESS) return null; if (SESS.exp - 60000 < Date.now()) { try { setSess(mkSess(await sb("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: SESS.rt } }))); } catch { setSess(null); return null; } } return SESS.at; }
let pushT = 0, HOLDSYNC = false, SYNCMSG = "";
function syncSoon() { if (!SESS || !consent() || HOLDSYNC) return; clearTimeout(pushT); pushT = setTimeout(pushNow, 3000); }
async function pushNow() {
  try { const t = await tok(); if (!t) return false; const at = new Date().toISOString(); let cur = DB; try { const x = JSON.parse(localStorage.getItem(LK)); if (x && x.kids) cur = x; } catch {} await sb("/rest/v1/learn_saves?on_conflict=user_id", { method: "POST", tok: t, headers: { Prefer: "resolution=merge-duplicates" }, body: { user_id: SESS.uid, data: cur, updated_at: at } }); setLast(at); SYNCMSG = "تم الحفظ في الحساب " + new Date().toLocaleTimeString("ar"); return true; }
  catch (e) { SYNCMSG = "تعذر الحفظ في الحساب الآن. سنحاول عند التعديل التالي."; return false; }
}
async function pullCloud() { const t = await tok(); if (!t) return null; const r = await sb("/rest/v1/learn_saves?select=data,updated_at&user_id=eq." + SESS.uid, { tok: t }); return r[0] || null; }
function adoptCloud(c) { DB = c.data; try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} setLast(c.updated_at || new Date().toISOString()); }
async function checkConflict() {
  if (!SESS || !consent()) return;
  try { const c = await pullCloud(); if (c && c.updated_at && lastSync() && c.updated_at > lastSync()) { HOLDSYNC = true; W.__pfConflict = c; } } catch {}
}
const idbo = () => new Promise((ok, no) => { try { const r = indexedDB.open("zad-pf", 1); r.onupgradeneeded = () => r.result.createObjectStore("img"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } });
const idbDo = async (mode, fn) => { const db = await idbo(); return new Promise((ok, no) => { const tx = db.transaction("img", mode), st = tx.objectStore("img"), rq = fn(st); tx.oncomplete = () => ok(rq && rq.result); tx.onerror = () => no(tx.error); }); };
const pk = (k) => DB.cur + "|" + k;
const photoGet = (k) => idbDo("readonly", (st) => st.get(pk(k))).catch(() => null);
const photoSet = (k, v) => idbDo("readwrite", (st) => st.put(v, pk(k)));
const photoDel = (k) => idbDo("readwrite", (st) => st.delete(pk(k))).catch(() => {});
const photoKeys = () => idbDo("readonly", (st) => st.getAllKeys()).catch(() => []);
async function photoClear() { const pre = DB.cur + "|"; for (const k of await photoKeys()) if (String(k).startsWith(pre)) await idbDo("readwrite", (st) => st.delete(k)).catch(() => {}); }
const toJpeg = (file) => new Promise((ok, no) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { const m = Math.min(1, 640 / Math.max(im.width, im.height)), c = D.createElement("canvas"); c.width = Math.max(1, Math.round(im.width * m)); c.height = Math.max(1, Math.round(im.height * m)); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL("image/jpeg", 0.8)); }; im.onerror = () => { URL.revokeObjectURL(u); no(new Error("img")); }; im.src = u; });
const kidName = () => P.nick || S.name || "طفلي";
const young = () => P.lv === "a2" || P.lv === "a3";
async function rest(path) { const r = await fetch(SB + "/rest/v1/" + path, { headers: H }); if (!r.ok) throw new Error("rest " + r.status); return r.json(); }
function reportErr(kind, msg) { try { fetch(SB + "/rest/v1/pf_errors", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ kind: String(kind).slice(0, 40), msg: String(msg).slice(0, 300), ua: (navigator.userAgent || "").slice(0, 200) }) }).catch(() => {}); } catch {} }
const tsOf = (r) => (r && (r.t || r.last || (r.d && typeof r.d === "string" ? Date.parse(r.d) : 0))) || 0;
/* سجلات الإنجاز الفعلية من التخزين المحلي */
function rawRecords() {
  const out = [], add = (src, slug, t, extra) => out.push(Object.assign({ src, slug, t: t || 0 }, extra || {}));
  Object.entries(S.acts || {}).forEach(([k, r]) => add("acts", k, tsOf(r) || Date.parse(r && r.d) || 0, { how: r && r.how }));
  [["bank", S.bank && S.bank.done], ["proj", S.proj && S.proj.done], ["vid", S.vid && S.vid.done], ["songs", S.songs && S.songs.done]].forEach(([s, m]) => Object.entries(m || {}).forEach(([k, r]) => { if (r && (r.d || r.t)) add(s, k, tsOf(r), { n: r.d }); }));
  [["life", S.life], ["ready", S.ready], ["val", S.val], ["dig", S.dig], ["exp", S.exp]].forEach(([s, o]) => Object.entries((o && o.it) || {}).forEach(([k, r]) => { if (r && r.d) add(s, k, tsOf(r), { n: r.d }); }));
  Object.entries(S.stories || {}).forEach(([k, r]) => add("stories", k, tsOf(r)));
  gameRecords().forEach((g) => add("games", g.slug, g.t, { stars: g.stars }));
  return out;
}
async function loadMeta(raw) {
  const bySrc = {}; raw.forEach((r) => (bySrc[r.src] = bySrc[r.src] || []).push(r.slug));
  await Promise.all(Object.keys(bySrc).map(async (s) => {
    const cfg = SRC[s], slugs = [...new Set(bySrc[s])]; META[s] = META[s] || {};
    if (s === "games") { try { const cat = await (await fetch(ROOT + "games/catalog.json")).json(); cat.forEach((g) => { META.games[g.id] = { slug: g.id, title: g.t, skill: g.skill, subject: g.subj, summary: g.s }; }); } catch (e) { reportErr("meta", "games " + e.message); CERR = true; } return; }
    for (let i = 0; i < slugs.length; i += 40) {
      const part = slugs.slice(i, i + 40).filter((x) => !META[s][x]); if (!part.length) continue;
      try { const rows = await rest(`${cfg.tb}?status=eq.published&slug=in.(${part.map(encodeURIComponent).join(",")})&select=${cfg.cols}`); rows.forEach((x) => (META[s][x.slug] = x)); } catch (e) { reportErr("meta", s + " " + e.message); CERR = true; }
    }
  }));
}
async function loadCerts() { try { CERTS = await rest("pf_certs?status=eq.active&order=sort_order.asc&select=slug,title,kind,levels,design,descr,rule"); } catch (e) { CERTS = []; CERR = true; reportErr("certs", e.message); } }
const quizQ = () => (S.quiz = S.quiz || {}, S.quiz.h = S.quiz.h || {}, S.quiz.log = S.quiz.log || [], S.quiz.sk = S.quiz.sk || {}, S.quiz);
const firstTs = (k) => { const q = quizQ(); let m = 0; q.log.forEach((e) => { if (e.k === k && (!m || e.ts < m)) m = e.ts; }); return m || (q.h[k] && q.h[k].last) || 0; };
function quizRecords() { const q = quizQ(), a = []; Object.entries(q.h).forEach(([k, h]) => { if (h && h.n > 0) a.push({ key: k, contest: k.startsWith("c:"), cat: h.cat, title: h.title, n: h.n, best: h.best, tot: h.tot, last: h.last || 0, first: firstTs(k) }); }); return a; }
/* تقييم شرط الشهادة على سجلات حقيقية فقط */
function evalCert(c) {
  const r = c.rule || {}, src = Array.isArray(r.src) ? r.src : [], n = +r.n;
  if (!src.length || !(n >= 1)) { reportErr("cert-rule", c.slug); return null; }
  const ts = [];
  const only = Array.isArray(r.items) && r.items.length ? new Set(r.items) : null;
  REC.forEach((x) => { if (src.includes(x.src) && META[x.src] && META[x.src][x.slug] && (!only || only.has(x.slug))) ts.push(x.t); });
  const qs = quizRecords();
  if (src.includes("quiz")) qs.filter((x) => !x.contest && (!r.qcat || x.cat === r.qcat) && (!only || only.has(x.key))).forEach((x) => ts.push(x.first));
  if (src.includes("contest")) qs.filter((x) => x.contest).forEach((x) => ts.push(x.first));
  if (src.includes("skills")) { const q = quizQ(), good = Object.values(q.sk).filter((s) => s.n >= (r.minAns || 5) && s.ok / s.n >= (r.rate || 0.75) && (!r.qcat || s.c === r.qcat)).length; const last = q.log.reduce((m, e) => Math.max(m, e.ts || 0), 0); for (let i = 0; i < good; i++) ts.push(last); }
  ts.sort((a, b) => a - b);
  return { have: ts.length, need: n, done: ts.length >= n, t: ts[n - 1] || ts.find((x) => x > 0) || Date.now() };
}
function issue() {
  EARNED = []; let ch = false;
  CERTS.forEach((c) => {
    const old = P.certs[c.slug]; const ev = evalCert(c); if (!ev) return;
    c.ev = ev;
    if (old) { EARNED.push(c); return; }
    if ((c.levels || []).includes(P.lv) && ev.done) { P.certs[c.slug] = { t: ev.t || Date.now(), lv: P.lv }; ch = true; EARNED.push(c);
      try { fetch(SB + "/rest/v1/pf_issued", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ cert_slug: c.slug, level: P.lv }) }).catch(() => {}); } catch {} }
  });
  if (ch) save();
}
const works = () => REC.filter((x) => META[x.src] && META[x.src][x.slug]).map((x) => { const m = META[x.src][x.slug], cfg = SRC[x.src], key = x.src + ":" + x.slug; return { key, src: x.src, slug: x.slug, t: x.t, tab: cfg.tab, title: m.title, type: cfg.type, skill: m.skill || cfg.lab || (m.cat ? String(m.cat) : "") || m.subject || m.topic || "", text: m.descr || m.summary || m.goal || "", icon: m.icon || m.image_url || m.cover_url || "", pdf: m.pdf_url || "", url: cfg.url(x.slug), by: x.how === "parent" ? "بمساعدة ولي الأمر" : "" }; });
const visible = () => works().filter((w) => !P.hide[w.key]).sort((a, b) => b.t - a.t);
const hiddenCnt = () => works().filter((w) => P.hide[w.key]).length;
async function prepare() { loadDB(); const raw = rawRecords(); REC = raw; await Promise.all([loadMeta(raw), loadCerts(), PAGE === "rhub" || PAGE === "rview" ? loadRp() : 0]); issue(); }
const skel = (m) => { const b = $("#aview"); b.innerHTML = m; const p = D.getElementById("avw"); if (p) p.setAttribute("aria-busy", "false"); return b; };
const abtn = (h, t, c) => `<a class="abtn${c ? " " + c : ""}" href="${h}">${t}</a>`;
function kidBar() {
  const kids = Object.keys(DB.kids);
  return `<section class="pfhead"><img class="pfav" src="${ROOT}games/chars/${P.ch}-160.png" alt="" width="84" height="84"><div class="pfwho"><h1>${esc(kidName())}</h1><p>${esc(LV[P.lv])}</p>${kids.length > 1 ? `<select id="pfkid" aria-label="اختيار الطفل">${kids.map((k) => `<option value="${esc(k)}"${k === DB.cur ? " selected" : ""}>${esc(DB.kids[k].name || (DB.kids[k].pf && DB.kids[k].pf.nick) || "الطفل " + (kids.indexOf(k) + 1))}</option>`).join("")}</select>` : ""}</div><button type="button" class="abtn" id="pfedit">تعديل الاسم والصورة والمرحلة</button></section><div id="pfform"></div>`;
}
function bindKid() {
  const sel = $("#pfkid"); if (sel) sel.onchange = () => { DB.cur = sel.value; save(); location.reload(); };
  const b = $("#pfedit"); if (b) b.onclick = () => {
    const f = $("#pfform"); if (f.innerHTML) { f.innerHTML = ""; return; }
    f.innerHTML = `<form class="pfedit" id="pff"><label>الاسم الذي يظهر في الملف والشهادات<input type="text" id="pfn" maxlength="24" value="${esc(P.nick || S.name || "")}" autocomplete="off"></label><fieldset><legend>الصورة الرمزية</legend><div class="pfchs">${Object.entries(CHS).map(([k, n]) => `<label class="pfch"><input type="radio" name="pfc" value="${k}"${P.ch === k ? " checked" : ""}><img src="${ROOT}games/chars/${k}-160.png" alt="" width="64" height="64"><span>${n}</span></label>`).join("")}</div></fieldset><label>ملف الألعاب المرتبط بهذا الطفل<select id="pfg"><option value="">تلقائي</option>${gProfiles().map((x) => `<option value="${esc(x)}"${P.gp === x ? " selected" : ""}>${esc(x)}</option>`).join("")}<option value="-"${P.gp === "-" ? " selected" : ""}>بدون ربط</option></select></label><label>العمر أو الصف<select id="pfl">${Object.entries(LV).map(([k, v]) => `<option value="${k}"${P.lv === k ? " selected" : ""}>${v}</option>`).join("")}</select></label><div class="btns"><button class="abtn go" type="submit">حفظ</button><button class="abtn" type="button" id="pfx">إلغاء</button></div><p class="hint">الاسم والصورة يبقيان على هذا الجهاز فقط ولا يُرفعان إلى أي مكان.</p></form>`;
    $("#pfx").onclick = () => (f.innerHTML = "");
    $("#pff").onsubmit = (e) => { e.preventDefault(); P.nick = $("#pfn").value.trim().slice(0, 24); P.ch = ($("input[name=pfc]:checked") || { value: P.ch }).value; P.lv = $("#pfl").value; const g = $("#pfg").value; if (g) P.gp = g; else delete P.gp; save(); location.reload(); };
  };
}
function nav(on) { return `<nav class="pfnav" aria-label="أقسام ملف الإنجاز">${abtn(ROOT + "portfolio/", "الرئيسية", on === "hub" ? "go" : "")}${TABS.map(([k, n]) => abtn(ROOT + "portfolio/works/?tab=" + k, n, on === k ? "go" : "")).join("")}${abtn(ROOT + "portfolio/report/", "تقرير ولي الأمر", on === "rep" ? "go" : "")}${abtn(ROOT + "reports/", "تقارير التقدم", "")}</nav>`; }
/* ===== الرئيسية ===== */
function hubPage() {
  const v = visible(), cnt = (t) => v.filter((w) => w.tab === t).length, q = quizRecords().filter((x) => !x.contest);
  const acts = v.filter((w) => w.tab === "ws" || w.tab === "proj").length, les = cnt("les"), saved = cnt("ws") + cnt("proj");
  const stat = (n, l) => `<div class="pfstat"><b>${AD(n)}</b><span>${l}</span></div>`;
  const latest = v.slice(0, 5), empty = !v.length && !q.length;
  const b = skel(`${kidBar()}<div class="pfstats">${stat(acts, "نشاطًا مكتملًا")}${stat(les, "قصة أو درسًا أتمّها")}${stat(saved, "عملًا محفوظًا")}${stat(q.length, "اختبارًا مكتملًا")}${stat(EARNED.length, "شهادة إنجاز")}</div>
<div class="btns pfmain"><a class="abtn go" href="${ROOT}portfolio/works/">عرض ملف الإنجاز</a><a class="abtn" href="${ROOT}portfolio/report/?print=1">تحميل أو طباعة الملف</a><a class="abtn" href="${ROOT}reports/">تقارير التقدم الأسبوعية والشهرية</a></div>
${CERR ? '<p class="hint">تعذر تحميل بعض بيانات الملف الآن. حاول لاحقًا.</p>' : ""}
<section class="art"><h2>آخر الأعمال</h2>${latest.length ? `<div class="pfgrid">${latest.map(card).join("")}</div>` : `<div class="pfempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt="" width="64" height="64"><p>${empty ? "ملف الإنجاز ما زال فارغًا، وسيمتلئ تلقائيًا عند إكمال أنشطة وقصص واختبارات في المنصة." : "لا أعمال مرئية في الملف الآن."}</p><div class="btns">${abtn(ROOT + "activities/", "أنشطة وأوراق عمل")}${abtn(ROOT + "stories/", "قصص تعليمية")}${abtn(ROOT + "quizzes/", "اختبارات ومسابقات")}</div></div>`}</section>
<section class="art pfnext"><h2>خطوتك التعليمية القادمة</h2><div class="rec-mount" data-max="3"></div><p class="rmore"><a href="${ROOT}next/">كل الاقتراحات وإعداداتها</a> · <a href="${ROOT}plan/">خطتي التعليمية الأسبوعية</a></p></section>
<section class="art pfacc"><h2>حساب ولي الأمر وحفظ الملف على الخادم</h2>${accHTML()}<p class="hint" id="pfam" role="status"></p></section>
<section class="art pftr"><h2>نقل الملف إلى جهاز آخر</h2><p>بدون حساب، الملف محفوظ على هذا الجهاز فقط (والصور تبقى على الجهاز دائمًا). لنقله إلى جهاز آخر، صدّر ملفًا من هنا ثم افتحه في الجهاز الجديد بزر «استيراد». الملف يحتوي أعمال الطفل وشهاداته وصورها وتقدمه في الألعاب، فاحتفظ به عندك ولا ترسله لأحد غير مَن تثق به.</p><div class="btns"><button class="abtn go" type="button" id="pfexp">تصدير ملف الطفل</button><button class="abtn" type="button" id="pfimp">استيراد ملف</button></div><p class="hint" id="pftm"></p></section>
<section class="art pfpriv"><h2>خصوصية الملف</h2><p>هذا الملف خاص بالطفل ووليّ أمره، ويُحفظ على هذا الجهاز، وعلى الخادم داخل حساب وليّ الأمر فقط إن وافق على ذلك. لا يظهر لأحد، ولا توجد قائمة ترتيب أو مقارنة بين الأطفال، ولا تُرفع الصور ولا معلومات شخصية. المشاركة الوحيدة تتم بطباعة الملف أو حفظه PDF بقرارك أنت.</p><div class="btns"><button class="abtn" type="button" id="pfhid">أعمال أخفيتها (${AD(hiddenCnt())})</button><button class="abtn qzdanger" type="button" id="pfdel">حذف ملف الإنجاز</button></div><p class="hint" id="pfmsg"></p></section>`);
  bindKid(); bindPriv(); bindPhotos(); bindTransfer(); bindAcc(); if (W.ZREC) D.querySelectorAll(".pfnext .rec-mount").forEach((e) => W.ZREC.mount(e, { max: 3 }));
}
function accHTML() {
  const note = '<p class="hint">ما يُحفظ على الخادم: الاسم الأول للطفل وسجلات نشاطه وملف إنجازه وشهاداته، داخل حساب ولي الأمر فقط ولا يراها غيره، ولا تُستخدم للدعاية ولا للترتيب. الصور لا تُرفع أبدًا وتبقى على جهازك. يمكنك حذف النسخة من الخادم في أي وقت.</p>';
  if (SESS) return `<p>مسجّل الدخول: <b dir="ltr">${esc(SESS.email || "")}</b></p>${consent() ? `<p>المزامنة التلقائية <b>مفعّلة</b>. ${esc(SYNCMSG)}</p>` : "<p>المزامنة التلقائية متوقفة لأنك لم توافق بعد.</p>"}${W.__pfConflict ? '<p class="hint"><b>يوجد في حسابك نسخة أحدث من جهاز آخر.</b> اختر «استعادة من الحساب» لتحميلها، أو «حفظ الآن» لاستبدالها بنسخة هذا الجهاز.</p>' : ""}
<label class="pfck"><input type="checkbox" id="pfcons" ${consent() ? "checked" : ""}> أوافق، بصفتي وليّ الأمر، على حفظ ملف إنجاز طفلي على الخادم</label>${note}
<div class="btns"><button class="abtn go" type="button" id="pfsy">حفظ الآن</button><button class="abtn" type="button" id="pfrs">استعادة من الحساب</button><button class="abtn" type="button" id="pflo">تسجيل الخروج</button><button class="abtn qzdanger" type="button" id="pfsd">حذف نسخة الخادم</button></div>`;
  return `<p>سجّل الدخول كوليّ أمر ليُحفظ ملف الإنجاز تلقائيًا ويظهر على أي جهاز. هذا الحساب نفسه الذي تستخدمه في «زاد التعليمية» والألعاب.</p>
<input class="nm" id="pfem" type="email" inputmode="email" autocomplete="email" placeholder="البريد الإلكتروني" dir="ltr"><input class="nm" id="pfpw" type="password" autocomplete="current-password" placeholder="كلمة المرور (٨ أحرف فأكثر)" dir="ltr">
<label class="pfck"><input type="checkbox" id="pfcons"> أوافق، بصفتي وليّ الأمر، على حفظ ملف إنجاز طفلي على الخادم</label>${note}
<div class="btns"><button class="abtn go" type="button" id="pfli">دخول</button><button class="abtn" type="button" id="pfsu">إنشاء حساب</button><button class="abtn" type="button" id="pffg">نسيت كلمة المرور</button></div>`;
}
function bindAcc() {
  const m = $("#pfam"); if (!m) return; const say = (t) => { m.textContent = t; };
  const cons = $("#pfcons"); if (cons) cons.onchange = () => { try { localStorage.setItem("zad-pf-consent", cons.checked ? "1" : "0"); } catch {} if (SESS && cons.checked) pushNow().then(() => location.reload()); else if (SESS) location.reload(); };
  const busy = async (f) => { try { say("..."); await f(); } catch (e) { say(String(e.message).includes("Invalid login") ? "البريد أو كلمة المرور غير صحيحة" : e.message || "تعذر الإكمال"); } };
  const em = () => $("#pfem").value.trim(), pw = () => $("#pfpw").value;
  const needC = () => { if (!cons.checked) throw new Error("ضع علامة الموافقة أولًا."); try { localStorage.setItem("zad-pf-consent", "1"); } catch {} };
  const after = async () => {
    const c = await pullCloud(), mine = Object.values(DB.kids).some((k) => k.name);
    if (c && c.data && c.data.kids) {
      if (!mine || confirm("وجدنا ملفًا محفوظًا في حسابك. موافق = استعادته (واستبدال بيانات هذا الجهاز). إلغاء = رفع بيانات هذا الجهاز إلى الحساب بدلًا منه.")) { adoptCloud(c); location.reload(); return; }
    }
    await pushNow(); location.reload();
  };
  if ($("#pfli")) $("#pfli").onclick = () => busy(async () => { needC(); setSess(mkSess(await sb("/auth/v1/token?grant_type=password", { method: "POST", body: { email: em(), password: pw() } }))); await after(); });
  if ($("#pfsu")) $("#pfsu").onclick = () => busy(async () => { needC(); if (pw().length < 8) throw new Error("كلمة المرور قصيرة (٨ أحرف على الأقل)"); const j = await sb("/auth/v1/signup", { method: "POST", body: { email: em(), password: pw() } }); if (j.access_token) { setSess(mkSess(j)); await after(); } else say("أرسلنا رسالة تأكيد إلى بريدك. افتح الرابط ثم ارجع وسجّل الدخول."); });
  if ($("#pffg")) $("#pffg").onclick = () => busy(async () => { if (!em()) throw new Error("اكتب بريدك أولًا"); await sb("/auth/v1/recover?redirect_to=" + encodeURIComponent(ROOT + "learn/"), { method: "POST", body: { email: em() } }); say("أرسلنا رابط استعادة كلمة المرور إلى بريدك."); });
  if ($("#pflo")) $("#pflo").onclick = () => { setSess(null); location.reload(); };
  if ($("#pfsy")) $("#pfsy").onclick = () => busy(async () => { if (!consent()) throw new Error("ضع علامة الموافقة أولًا."); if (W.__pfConflict && !confirm("سيستبدل هذا نسخة الحساب الأحدث بنسخة هذا الجهاز. متابعة؟")) return say(""); HOLDSYNC = false; W.__pfConflict = null; say((await pushNow()) ? "تم الحفظ في الحساب." : "تعذر الحفظ الآن."); });
  if ($("#pfrs")) $("#pfrs").onclick = () => busy(async () => { const c = await pullCloud(); if (!c || !c.data || !c.data.kids) return say("لا توجد نسخة محفوظة في حسابك."); if (!confirm("سيستبدل هذا بيانات هذا الجهاز بنسخة الحساب. متابعة؟")) return; adoptCloud(c); location.reload(); });
  if ($("#pfsd")) $("#pfsd").onclick = () => busy(async () => { if (!confirm("حذف نسخة ملف الإنجاز المحفوظة على الخادم نهائيًا؟ بيانات هذا الجهاز تبقى.")) return; const t = await tok(); await sb("/rest/v1/learn_saves?user_id=eq." + SESS.uid, { method: "DELETE", tok: t }); try { localStorage.setItem("zad-pf-consent", "0"); } catch {} say("تم حذف النسخة من الخادم وإيقاف المزامنة."); setTimeout(() => location.reload(), 700); });
}
function bindPriv() {
  const msg = $("#pfmsg"), h = $("#pfhid"); if (h) h.onclick = () => { if (!hiddenCnt()) { msg.textContent = "لا توجد أعمال مخفية."; return; } P.hide = {}; save(); location.reload(); };
  const d = $("#pfdel"); if (!d) return; let st = 0;
  d.onclick = () => {
    if (st === 0) { st = 1; msg.innerHTML = "هذا يحذف الأسماء والصور والملاحظات والشهادات من ملف هذا الطفل على هذا الجهاز. سجلات النشاط نفسها تبقى، فقد تظهر الأعمال والشهادات مجددًا بحسابها من النشاط. للحذف التام اختر «حذف كل تقدم الطفل». اضغط مرة ثانية للتأكيد."; d.textContent = "نعم، احذف ملف الإنجاز"; const a = D.createElement("button"); a.className = "abtn qzdanger"; a.type = "button"; a.textContent = "حذف كل تقدم الطفل من هذا الجهاز"; a.onclick = () => { if (!confirm("سيُمسح كل تقدم هذا الطفل في جميع أقسام زاد على هذا الجهاز نهائيا. متأكد؟")) return; photoClear().then(() => { if (Object.keys(DB.kids).length > 1) { delete DB.kids[DB.cur]; DB.cur = Object.keys(DB.kids)[0]; } else DB.kids[DB.cur] = {}; save(); location.href = ROOT + "portfolio/"; }); }; d.after(a); return; }
    photoClear().then(() => { delete S.pf; save(); location.href = ROOT + "portfolio/"; }); return;
    delete S.pf; save(); location.href = ROOT + "portfolio/";
  };
}
const KEEP = ["name", "age", "av", "acts", "bank", "proj", "life", "ready", "val", "dig", "exp", "vid", "songs", "stories", "quiz", "pf", "dict", "lang", "cards", "xp", "stars"];
function bindTransfer() {
  const msg = $("#pftm"), say = (t) => { if (msg) msg.textContent = t; };
  $("#pfexp").onclick = async () => {
    try {
      const kid = JSON.parse(JSON.stringify(S)), photos = {}, pre = DB.cur + "|";
      for (const k of await photoKeys()) if (String(k).startsWith(pre)) photos[String(k).slice(pre.length)] = await idbDo("readonly", (st) => st.get(k));
      const gid = gId(), games = gid ? { id: gid, kid: lget("hg_kid:" + gid, null), prog: lget("hg_prog:" + gid, {}), gt: lget("hg_gt:" + gid, {}) } : null;
      const blob = new Blob([JSON.stringify({ v: 1, kind: "zad-portfolio", at: Date.now(), kid, photos, games })], { type: "application/json" }), a = D.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "zad-portfolio.json"; D.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); say("تم تجهيز الملف zad-portfolio.json. احفظه في مكان آمن.");
    } catch (e) { reportErr("export", (e && e.message) || "export"); say("تعذر تصدير الملف."); }
  };
  $("#pfimp").onclick = () => {
    const f = D.createElement("input"); f.type = "file"; f.accept = "application/json,.json"; f.onchange = async () => {
      const file = f.files && f.files[0]; if (!file) return; if (file.size > 25e6) return say("الملف كبير جدا.");
      try {
        const o = JSON.parse(await file.text()); if (!o || o.v !== 1 || o.kind !== "zad-portfolio" || !o.kid || typeof o.kid !== "object") return say("هذا ليس ملف ملف إنجاز صالحا من زاد.");
        if (!confirm("سيُضاف هذا الملف كطفل جديد على هذا الجهاز دون مسح أي بيانات موجودة. متابعة؟")) return;
        const kid = {}; KEEP.forEach((k) => { if (o.kid[k] !== undefined) kid[k] = o.kid[k]; });
        let id = "k" + Date.now().toString(36); DB.kids[id] = kid; const old = DB.cur; DB.cur = id;
        for (const [k, v] of Object.entries(o.photos || {})) if (typeof v === "string" && v.startsWith("data:image/jpeg;base64,") && v.length < 4e6) await photoSet(k, v);
        if (o.games && o.games.kid && typeof o.games.id === "string") { let gid = o.games.id, ps = gProfiles(); while (ps.includes(gid)) gid += " ٢"; try { localStorage.setItem("hg_kid:" + gid, JSON.stringify(o.games.kid)); localStorage.setItem("hg_prog:" + gid, JSON.stringify(o.games.prog || {})); localStorage.setItem("hg_gt:" + gid, JSON.stringify(o.games.gt || {})); localStorage.setItem("hg_profiles", JSON.stringify(lget("hg_profiles", []).concat([gid]))); } catch {} kid.pf = kid.pf || {}; kid.pf.gp = gid; }
        save(); say("تم استيراد الملف كطفل جديد."); setTimeout(() => location.reload(), 600);
      } catch (e) { reportErr("import", (e && e.message) || "import"); say("تعذر قراءة الملف. تأكد أنه ملف مُصدّر من هذه الصفحة."); }
    }; f.click();
  };
}
function card(w) {
  return `<article class="pfc" data-k="${esc(w.key)}"><img src="${esc(icon(w.icon))}" alt="" width="56" height="56" loading="lazy" onerror="this.src='${ROOT}images/zad/i_puzzle.webp'"><div class="pfcb"><b>${esc(w.title)}</b><small>${esc(w.type)} · ${w.t ? fmt(w.t) : "تاريخ غير مسجل"}</small>${w.skill ? `<small>المهارة: ${esc(w.skill)}</small>` : ""}${w.by ? `<small>${w.by}</small>` : ""}<p>${esc(P.notes[w.key] || w.text || "")}</p><img class="pfph" data-k="${esc(w.key)}" alt="صورة العمل" hidden><div class="btns"><a class="abtn go" href="${esc(w.url)}">عرض العمل</a>${w.pdf ? `<a class="abtn" href="${esc(w.pdf.startsWith("http") ? w.pdf : ROOT + w.pdf)}" target="_blank" rel="noopener">طباعة نسخة</a>` : ""}<button type="button" class="abtn pfnote" data-k="${esc(w.key)}">ملاحظة</button><button type="button" class="abtn pfpic" data-k="${esc(w.key)}">صورة للعمل</button><button type="button" class="abtn pfpdel" data-k="${esc(w.key)}" hidden>حذف الصورة</button><button type="button" class="abtn pfhide" data-k="${esc(w.key)}">إخفاء من الملف</button></div></div></article>`;
}
/* ===== الأعمال والتبويبات ===== */
function worksPage() {
  let tab = new URLSearchParams(location.search).get("tab"); if (!TABS.some((t) => t[0] === tab)) tab = "ws";
  const v = visible(), body = { ws: () => list(v.filter((w) => w.tab === "ws"), "لا أوراق عمل مكتملة بعد. ابدأ من قسم الأنشطة.", ROOT + "activities/", "أنشطة وأوراق عمل"), proj: () => list(v.filter((w) => w.tab === "proj"), "لا مشروعات أو أنشطة مكتملة بعد.", ROOT + "projects/", "المشروعات والتحديات"), les: () => list(v.filter((w) => w.tab === "les"), "لا قصص أو دروس مكتملة بعد.", ROOT + "stories/", "القصص التعليمية"), quiz: quizTab, cert: certTab }[tab];
  const b = skel(`<div class="zbc"><a href="../../">الرئيسية</a> › <a href="../">ملف الإنجاز</a> › ${esc(TABS.find((t) => t[0] === tab)[1])}</div>${kidBar()}${nav(tab)}<section class="art" id="pftab"></section><div class="btns nopr"><button type="button" class="abtn" id="pfpr">طباعة هذه الصفحة أو حفظها PDF</button></div>`);
  $("#pfpr").onclick = () => W.print();
  $("#pftab").innerHTML = body(); bindKid(); bindPhotos();
  $$(".pfhide").forEach((x) => (x.onclick = () => { if (!confirm("إخفاء هذا العمل من ملف الإنجاز؟ (لا يحذف النشاط نفسه، ويمكن إظهاره من الصفحة الرئيسية)")) return; P.hide[x.dataset.k] = 1; save(); location.reload(); }));
  $$(".pfnote").forEach((x) => (x.onclick = () => { const t = prompt("ملاحظة قصيرة عن هذا العمل (يراها وليّ الأمر فقط):", P.notes[x.dataset.k] || ""); if (t == null) return; const s = t.trim().slice(0, 140); if (s) P.notes[x.dataset.k] = s; else delete P.notes[x.dataset.k]; save(); location.reload(); }));
}
function bindPhotos() {
  $$(".pfph").forEach(async (im) => { const v = await photoGet(im.dataset.k); if (v) { im.src = v; im.hidden = false; const d = im.closest(".pfcb").querySelector(".pfpdel"); if (d) d.hidden = false; const a = im.closest(".pfcb").querySelector(".pfpic"); if (a) a.textContent = "تغيير الصورة"; } });
  $$(".pfpic").forEach((x) => (x.onclick = () => {
    if (!P.photoOk) { if (!confirm("موافقة وليّ الأمر: هل توافق على حفظ صورة هذا العمل على هذا الجهاز فقط؟ لا تُرفع الصورة إلى الإنترنت ولا تظهر لأحد، ويمكنك حذفها في أي وقت. اضغط موافق للمتابعة.")) return; P.photoOk = Date.now(); save(); }
    const f = D.createElement("input"); f.type = "file"; f.accept = "image/*"; f.onchange = async () => { const file = f.files && f.files[0]; if (!file) return; if (!/^image\//.test(file.type) || file.size > 15e6) { alert("اختر صورة أصغر من ١٥ ميغابايت."); return; } try { await photoSet(x.dataset.k, await toJpeg(file)); location.reload(); } catch (e) { reportErr("photo", (e && e.message) || "photo"); alert("تعذر حفظ الصورة. جرّب صورة أخرى."); } }; f.click(); }));
  $$(".pfpdel").forEach((x) => (x.onclick = async () => { if (!confirm("حذف صورة هذا العمل من هذا الجهاز؟")) return; await photoDel(x.dataset.k); location.reload(); }));
}
function list(a, emptyMsg, href, lab) { return a.length ? `<p class="hint">${AD(a.length)} عملًا. الأحدث أولًا.</p><div class="pfgrid">${a.map(card).join("")}</div>` : `<div class="pfempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt="" width="64" height="64"><p>${emptyMsg}</p>${abtn(href, lab, "go")}</div>`; }
function quizTab() {
  const qs = quizRecords().sort((a, b) => b.last - a.last), q = quizQ(), sk = Object.entries(q.sk).filter(([, s]) => s.n >= 3 && s.ok / s.n < 0.6);
  const one = (x) => `<article class="pfc"><img src="${ROOT}images/zad/${x.contest ? "i_trophy" : "i_puzzle"}.webp" alt="" width="56" height="56" onerror="this.style.visibility='hidden'"><div class="pfcb"><b>${esc(x.title || x.key)}</b><small>${esc(x.contest ? "مسابقة" : QC[x.cat] || "اختبار")} · ${x.last ? fmt(x.last) : ""}</small><p>أفضل نتيجة: ${AD(x.best)} من ${AD(x.tot)} · عدد المحاولات: ${AD(x.n)}</p><div class="btns"><a class="abtn go" href="${ROOT}quizzes/${x.contest ? "play/?c=" + encodeURIComponent(x.key.slice(2)) : "quiz/?q=" + encodeURIComponent(x.key)}">${x.contest ? "العب مجددًا" : "أعد التدريب"}</a></div></div></article>`;
  const t1 = qs.filter((x) => !x.contest), t2 = qs.filter((x) => x.contest);
  return (qs.length ? "" : `<div class="pfempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt="" width="64" height="64"><p>لا اختبارات مكتملة بعد.</p>${abtn(ROOT + "quizzes/", "ابدأ اختبارًا", "go")}</div>`) +
    (t1.length ? `<h3>الاختبارات</h3><div class="pfgrid">${t1.map(one).join("")}</div>` : "") + (t2.length ? `<h3>المسابقات</h3><div class="pfgrid">${t2.map(one).join("")}</div>` : "") +
    (sk.length ? `<h3>مهارات تحتاج إلى مراجعة</h3><ul class="qzrl">${sk.map(([k, s]) => `<li><b>${esc(k)}</b>أجاب ${AD(s.ok)} من ${AD(s.n)} إجابة صحيحة. <a class="abtn go" href="${ROOT}quizzes/progress/">لوحة المراجعة</a></li>`).join("")}</ul>` : "");
}
/* ===== الشهادات ===== */
const KINDS = { act: "إكمال نشاط", story: "إكمال قصة", ws: "أوراق عمل", unit: "إكمال وحدة", skill: "التقدم في مهارة", challenge: "مشروع أو تحدٍّ", contest: "المشاركة في مسابقة" };
function certTab() {
  const mine = CERTS.filter((c) => P.certs[c.slug]).sort((a, b) => P.certs[b.slug].t - P.certs[a.slug].t), next = CERTS.filter((c) => !P.certs[c.slug] && (c.levels || []).includes(P.lv) && c.ev && !c.ev.done);
  return `<h3>شهاداتي (${AD(mine.length)})</h3>${mine.length ? `<div class="pfgrid">${mine.map((c) => `<article class="pfc pfcertc d-${esc(c.design)}"><img src="${ROOT}images/zad/i_trophy.webp" alt="" width="56" height="56"><div class="pfcb"><b>${esc(c.title)}</b><small>${esc(KINDS[c.kind] || "")} · ${fmt(P.certs[c.slug].t)}</small><div class="btns"><a class="abtn go" href="${ROOT}portfolio/cert/?c=${esc(c.slug)}">عرض الشهادة</a></div></div></article>`).join("")}</div>` : `<p class="hint">لم تصدر شهادة بعد. تصدر الشهادة تلقائيًا عند إكمال شروطها الحقيقية.</p>`}
${next.length ? `<h3>خطوات قادمة</h3><div class="pfgrid">${next.map((c) => `<article class="pfc"><div class="pfcb"><b>${esc(c.title)}</b><small>${AD(c.ev.have)} من ${AD(c.ev.need)}</small><div class="pfbar"><i style="width:${Math.round(Math.min(1, c.ev.have / c.ev.need) * 100)}%"></i></div></div></article>`).join("")}</div>` : ""}`;
}
function certPage() {
  const slug = new URLSearchParams(location.search).get("c"), c = CERTS.find((x) => x.slug === slug), got = c && P.certs[slug];
  if (!got) return skel(`<div class="zbc"><a href="../../">الرئيسية</a> › <a href="../">ملف الإنجاز</a> › شهادة</div><div class="pfempty"><p>هذه الشهادة لم تصدر بعد أو غير متاحة.</p>${abtn(ROOT + "portfolio/works/?tab=cert", "شهاداتي", "go")}</div>`);
  skel(`<div class="zbc nopr"><a href="../../">الرئيسية</a> › <a href="../">ملف الإنجاز</a> › <a href="../works/?tab=cert">الشهادات</a> › ${esc(c.title)}</div>
<div class="pfcert d-${esc(c.design)} ${young() ? "young" : ""}" id="pfcert" role="img" aria-label="شهادة ${esc(c.title)}"><div class="pfcin"><img class="pfclogo" src="${ROOT}images/icons/apple-touch-icon.png" alt="" width="64" height="64"><p class="pfcorg">منصة زاد التعليمية</p><p class="pfcsm">شهادة إنجاز</p><p class="pfcto">تُمنح إلى</p><h1 class="pfcname">${esc(kidName())}</h1><p class="pfcfor">تقديرًا لإنجازه</p><h2 class="pfcti">${esc(c.title)}</h2><p class="pfcde">${esc(c.descr)}</p><img class="pfcav" src="${ROOT}games/chars/${P.ch}-160.png" alt="" width="96" height="96"><p class="pfcdt">${esc(LV[got.lv || P.lv])} · ${fmt(got.t)}</p></div></div>
<div class="btns nopr"><button type="button" class="abtn go" id="pfprint">طباعة الشهادة أو حفظها PDF</button>${abtn(ROOT + "portfolio/works/?tab=cert", "شهاداتي")}</div><p class="hint nopr">لحفظها PDF اختر «حفظ بصيغة PDF» من نافذة الطباعة. الشهادة خاصة بك ولا تُنشر.</p>`);
  $("#pfprint").onclick = () => W.print();
}
/* ===== تقرير ولي الأمر ===== */
function reportPage() {
  const p = new URLSearchParams(location.search); let per = p.get("p") || "week", from = p.get("from"), to = p.get("to"); const now = Date.now(), DAY = 864e5;
  let a = now - 7 * DAY, z = now; if (per === "month") a = now - 30 * DAY; else if (per === "custom" && from && to) { a = Date.parse(from); z = Date.parse(to) + DAY - 1; if (!(a <= z)) { a = now - 7 * DAY; z = now; per = "week"; } } else per = "week";
  const inP = (t) => t >= a && t <= z, all = works(), vis = all.filter((w) => !P.hide[w.key] && inP(w.t)), q = quizQ();
  const qlog = q.log.filter((e) => inP(e.ts)), certs = EARNED.filter((c) => inP(P.certs[c.slug].t));
  const skills = {}; vis.forEach((w) => { if (w.skill) skills[w.skill] = (skills[w.skill] || 0) + 1; }); qlog.forEach((e) => { });
  const days = Math.max(1, Math.min(31, Math.ceil((z - a) / DAY))), bars = Array(days).fill(0); const evts = vis.map((w) => w.t).concat(qlog.map((e) => e.ts)); evts.forEach((t) => { const i = Math.min(days - 1, Math.floor((t - a) / DAY)); if (i >= 0) bars[i]++; });
  const mx = Math.max(1, ...bars), need = Object.entries(q.sk).filter(([, s]) => s.n >= 3 && s.ok / s.n < 0.6), good = Object.entries(q.sk).filter(([, s]) => s.n >= 5 && s.ok / s.n >= 0.75);
  const byTab = (t) => vis.filter((w) => w.tab === t).length;
  const seg = (k, v) => `<div class="pfstat"><b>${AD(v)}</b><span>${k}</span></div>`;
  const sug = [];
  need.forEach(([k]) => sug.push(`<li>مراجعة مهارة «${esc(k)}»: <a class="abtn go" href="${ROOT}quizzes/progress/">لوحة المراجعة</a></li>`));
  if (!sug.length && qlog.length === 0) sug.push(`<li>جرّبوا اختبارًا قصيرًا هذا الأسبوع: <a class="abtn go" href="${ROOT}quizzes/">الاختبارات والمسابقات</a></li>`);
  CERTS.filter((c) => !P.certs[c.slug] && (c.levels || []).includes(P.lv) && c.ev && !c.ev.done).slice(0, 2).forEach((c) => sug.push(`<li>باقي ${AD(c.ev.need - c.ev.have)} للحصول على شهادة «${esc(c.title)}»</li>`));
  skel(`<div class="zbc nopr"><a href="../../">الرئيسية</a> › <a href="../">ملف الإنجاز</a> › تقرير ولي الأمر</div>${kidBar()}<div class="nopr">${nav("rep")}</div>
<form class="pfper nopr" id="pfp"><label>الفترة<select id="pfpp"><option value="week"${per === "week" ? " selected" : ""}>هذا الأسبوع</option><option value="month"${per === "month" ? " selected" : ""}>هذا الشهر</option><option value="custom"${per === "custom" ? " selected" : ""}>فترة أحددها</option></select></label><span id="pfcu" ${per === "custom" ? "" : "hidden"}><label>من<input type="date" id="pff1" value="${esc(from || "")}"></label><label>إلى<input type="date" id="pft1" value="${esc(to || "")}"></label></span><button class="abtn go" type="submit">عرض</button></form>
<section class="art"><h2>تقرير ${esc(kidName())} · ${fmt(a)} إلى ${fmt(Math.min(z, now))}</h2><div class="pfstats">${seg("أوراق عمل وأنشطة", byTab("ws") + byTab("proj"))}${seg("قصص ودروس", byTab("les"))}${seg("اختبارات ومسابقات", qlog.length)}${seg("شهادات", certs.length)}</div></section>
<section class="art"><h2>النشاط خلال الفترة</h2><div class="pfchart" role="img" aria-label="عدد الإنجازات اليومية">${bars.map((n, i) => `<div class="pfb" title="${fmt(a + i * DAY)}: ${AD(n)}"><i style="height:${Math.round((n / mx) * 100)}%"></i></div>`).join("")}</div><p class="hint">كل عمود يوم واحد، والعمود الأطول يعني أنشطة أكثر في ذلك اليوم.</p></section>
<section class="art"><h2>المهارات التي تدرّب عليها</h2>${Object.keys(skills).length || good.length ? `<ul class="qzrl">${Object.entries(skills).map(([k, n]) => `<li><b>${esc(k)}</b> ${AD(n)} من الأعمال</li>`).join("")}${good.map(([k, s]) => `<li><b>${esc(k)}</b> أجاب ${AD(s.ok)} من ${AD(s.n)} إجابة صحيحة</li>`).join("")}</ul>` : '<p class="hint">لا مهارات مسجلة في هذه الفترة.</p>'}</section>
<section class="art"><h2>الأعمال المحفوظة</h2>${vis.length ? `<ul class="qzrl">${vis.slice(0, 30).map((w) => `<li><b>${esc(w.title)}</b> ${esc(w.type)} · ${fmt(w.t)}</li>`).join("")}</ul>` : '<p class="hint">لا أعمال في هذه الفترة.</p>'}</section>
<section class="art"><h2>الشهادات في الفترة</h2>${certs.length ? `<ul class="qzrl">${certs.map((c) => `<li><b>${esc(c.title)}</b> ${fmt(P.certs[c.slug].t)}</li>`).join("")}</ul>` : '<p class="hint">لا شهادات جديدة في هذه الفترة.</p>'}</section>
<section class="art"><h2>مهارات تحتاج إلى مزيد من التدريب</h2>${need.length ? `<ul class="qzrl">${need.map(([k, s]) => `<li><b>${esc(k)}</b> ${AD(s.ok)} من ${AD(s.n)}. التدريب يصنع الفرق.</li>`).join("")}</ul>` : '<p class="hint">لا مهارات تحتاج تدريبًا الآن.</p>'}</section>
<section class="art"><h2>اقتراحات من محتوى زاد</h2><ul class="qzrl">${sug.join("") || "<li>واصلوا ما بدأتموه.</li>"}</ul></section>
<div class="btns nopr"><button type="button" class="abtn go" id="pfprint">طباعة التقرير أو حفظه PDF</button></div><p class="hint nopr">أرقام التقرير من سجلات هذا الجهاز فقط.</p>`);
  bindKid(); $("#pfprint").onclick = () => W.print();
  const sel = $("#pfpp"); sel.onchange = () => ($("#pfcu").hidden = sel.value !== "custom");
  $("#pfp").onsubmit = (e) => { e.preventDefault(); const u = new URLSearchParams({ p: sel.value }); if (sel.value === "custom") { if (!$("#pff1").value || !$("#pft1").value) return; u.set("from", $("#pff1").value); u.set("to", $("#pft1").value); } location.search = u.toString(); };
  if (p.get("print") === "1") setTimeout(() => W.print(), 600);
}
/* ===================== تقارير تقدم الطفل لوليّ الأمر ===================== */
const DAY = 864e5;
let RPC = { dom: [], reco: [], ind: {}, err: false };
const RPDEF = { rule_complete: { gameStars: 1, quizMinQ: 3 }, ind_need: { minAns: 3, rate: 0.6 } };
async function loadRp() {
  try {
    const rows = await rest("rp_config?order=sort_order.asc&select=slug,kind,title,data");
    RPC = { dom: rows.filter((r) => r.kind === "domain").map((r) => ({ slug: r.slug, title: r.title, d: r.data || {} })), reco: rows.filter((r) => r.kind === "reco").map((r) => ({ slug: r.slug, type: (r.data || {}).type, text: (r.data || {}).text })), ind: {}, err: false };
    rows.filter((r) => r.kind === "indicator").forEach((r) => (RPC.ind[r.slug] = r.data || {}));
  } catch (e) { RPC = { dom: [], reco: [], ind: {}, err: true }; reportErr("rp-config", e.message); }
}
const rpInd = (k) => Object.assign({}, RPDEF[k] || {}, RPC.ind[k] || {});
const rpOn = (k) => RPC.err || !!RPC.ind[k];
const tokens = (s) => String(s || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean).map((t) => t.replace(/^ال/, ""));
function domOf(r) {
  const D_ = RPC.dom; if (!D_.length) return "other";
  for (const d of D_) { if ((d.d.skills || []).includes(r.skill)) return d.slug; }
  for (const d of D_) { const s = d.d.src || []; if (s.includes(r.src) || (r.topic && s.includes(r.src + ":" + r.topic))) return d.slug; }
  if (/[a-z]{3}/i.test(r.skill || "")) { const e = D_.find((d) => d.slug === "english"); if (e) return e.slug; }
  for (const txt of [[r.skill, r.subject, r.cat].join(" "), r.title]) {
    const tk = tokens(txt); if (!tk.length) continue;
    for (const d of D_) if ((d.d.words || []).some((w) => { const x = String(w).toLowerCase().replace(/^ال/, ""); return x && tk.some((t) => t.startsWith(x)); })) return d.slug;
  }
  return "other";
}
const domName = (s) => (RPC.dom.find((d) => d.slug === s) || { title: "أنشطة متنوعة" }).title;
const rpSet = () => { const r = (P.rp = P.rp || {}); r.type = ["week", "month", "custom"].includes(r.type) ? r.type : "week"; r.hideDom = r.hideDom || {}; r.hide = r.hide || {}; r.notif = r.notif ? 1 : 0; return r; };
const loc0 = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d; };
function period(type, off, from, to) {
  const now = new Date();
  if (type === "month") { const a = new Date(now.getFullYear(), now.getMonth() + (off || 0), 1), z = new Date(a.getFullYear(), a.getMonth() + 1, 1); return { a: a.getTime(), z: z.getTime() - 1, name: a.toLocaleDateString("ar", { month: "long", year: "numeric" }) }; }
  if (type === "custom") { const a = from ? Date.parse(from + "T00:00:00") : NaN, z = to ? Date.parse(to + "T00:00:00") : NaN; if (!(a <= z) || z - a > 366 * DAY) return null; return { a, z: z + DAY - 1, name: "" }; }
  const t0 = loc0(Date.now()), back = (t0.getDay() + 1) % 7, a = new Date(t0.getFullYear(), t0.getMonth(), t0.getDate() - back + (off || 0) * 7), z = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 7);
  return { a: a.getTime(), z: z.getTime() - 1, name: "" };
}
const mDom = (w) => { const m = (META[w.src] || {})[w.slug] || {}; return domOf({ src: w.src, skill: m.skill || "", subject: m.subject || "", cat: m.cat || "", topic: m.topic || "", title: w.title }); };
function buildReport(pr, type) {
  const cfg = rpInd("rule_complete"), need = rpInd("ind_need"), inP = (t) => t >= pr.a && t <= pr.z, minS = cfg.gameStars || 1;
  const all = works().filter((w) => !P.hide[w.key] && !(w.src === "games" && (+((REC.find((x) => x.src === "games" && x.slug === w.slug) || {}).stars) || 0) < minS));
  const undated = all.filter((w) => !(w.t > 0)).length;
  const wk = all.filter((w) => w.t > 0 && inP(w.t)).map((w) => Object.assign({}, w, { dom: mDom(w) })).sort((a, b) => a.t - b.t);
  const q = quizQ(), minQ = cfg.quizMinQ || 3;
  const ql = q.log.filter((e) => e && e.n >= minQ && inP(e.ts)).map((e) => Object.assign({}, e, { dom: String(e.k).startsWith("c:") ? "other" : (RPC.dom.find((d) => (d.d.quiz || []).includes(e.c)) || {}).slug || "other" }));
  const qKeys = [...new Set(ql.map((e) => e.k))];
  const retrain = ql.filter((e) => q.log.some((o) => o.k === e.k && o.ts < e.ts)).length;
  const progress = []; qKeys.forEach((k) => { const L = q.log.filter((e) => e.k === k && e.n >= minQ).sort((a, b) => a.ts - b.ts), lastIn = L.filter((e) => inP(e.ts)).pop(), first = L[0]; if (lastIn && first && lastIn !== first && lastIn.ok / lastIn.n > first.ok / first.n) progress.push({ title: lastIn.t, from: first.ok, fn: first.n, to: lastIn.ok, tn: lastIn.n, k }); });
  const needSk = Object.entries(q.sk).filter(([, s]) => s.n >= (need.minAns || 3) && s.ok / s.n < (need.rate || 0.6)).map(([k, s]) => ({ k, ok: s.ok, n: s.n, dom: (RPC.dom.find((d) => (d.d.quiz || []).includes(s.c)) || {}).slug || "other" }));
  const skills = {}; wk.forEach((w) => { const sk = ((META[w.src] || {})[w.slug] || {}).skill; if (sk) skills[sk] = (skills[sk] || 0) + 1; });
  const certs = EARNED.filter((c) => P.certs[c.slug] && inP(P.certs[c.slug].t));
  const days = Math.min(62, Math.max(1, Math.round((pr.z + 1 - pr.a) / DAY))), bars = Array(days).fill(0);
  wk.forEach((w) => { const i = Math.floor((w.t - pr.a) / DAY); if (i >= 0 && i < days) bars[i]++; }); ql.forEach((e) => { const i = Math.floor((e.ts - pr.a) / DAY); if (i >= 0 && i < days) bars[i]++; });
  const cnt = { acts: wk.filter((w) => w.src !== "stories" && !["val", "dig", "exp", "vid", "songs"].includes(w.src)).length, les: wk.filter((w) => ["stories", "val", "dig", "exp", "vid", "songs"].includes(w.src)).length, wsp: wk.filter((w) => ["acts", "bank", "proj"].includes(w.src)).length, games: wk.filter((w) => w.src === "games").length, quiz: qKeys.length };
  const used = {}; wk.forEach((w) => (used[w.src] = 1)); if (qKeys.length) used.quiz = 1;
  return { pr, type, wk, ql, qKeys, retrain, progress, needSk, skills, certs, days, bars, cnt, used, undated };
}
const SECN = { acts: "الأنشطة وأوراق العمل", bank: "بنك الأنشطة", proj: "المشروعات والتحديات", life: "المهارات الحياتية", ready: "الاستعداد المدرسي", val: "القيم والسلوك", dig: "المهارات الرقمية", exp: "الثقافة العامة", vid: "الدروس المرئية", songs: "الأناشيد", games: "الألعاب التعليمية", stories: "القصص", quiz: "الاختبارات والمسابقات" };
let POOL = null;
async function loadPool() {
  if (POOL) return POOL; POOL = { stories: [], bank: [], quiz: [] }; const lv = P.lv;
  const get = async (k, path, f) => { try { POOL[k] = (await rest(path)).map(f); } catch (e) { reportErr("rp-pool", k + " " + e.message); } };
  await Promise.all([
    get("stories", `stories?status=eq.published&levels=cs.{${lv}}&select=slug,title,topic&limit=100`, (x) => Object.assign(x, { src: "stories", url: SRC.stories.url(x.slug) })),
    get("bank", `bank_items?status=eq.published&levels=cs.{${lv}}&select=slug,title,skill,subject,cat&limit=300`, (x) => Object.assign(x, { src: "bank", url: SRC.bank.url(x.slug) })),
    get("quiz", `qz_quizzes?status=eq.published&levels=cs.{${lv}}&select=slug,title,cat,skill,subject&limit=100`, (x) => Object.assign(x, { src: "quiz", url: `${ROOT}quizzes/quiz/?q=${encodeURIComponent(x.slug)}` })),
  ]); return POOL;
}
function recos(R) {
  const T = (ty) => RPC.reco.find((r) => r.type === ty), out = [], urls = new Set(), rs = rpSet(), sel = (d) => !rs.hideDom[d];
  const fill = (tx, o) => String(tx).replace(/\{(\w+)\}/g, (_, k) => (o[k] == null ? "" : o[k]));
  const add = (ty, o, url) => { const t = T(ty); if (!t || !t.text || urls.has(url) || out.length >= 6) return; urls.add(url); out.push({ ty, url, text: fill(t.text, o) }); };
  const q = quizQ(), done = new Set(Object.keys(q.h || {})), have = new Set(REC.map((x) => x.src + ":" + x.slug));
  const pd = (x) => domOf({ src: x.src, skill: x.skill || "", subject: x.subject || "", cat: x.cat || "", topic: x.topic || "", title: x.title });
  Object.entries(q.h || {}).filter(([k, h]) => h && h.tot > 0 && !k.startsWith("c:") && h.best / h.tot < 0.6).sort((a, b) => a[1].best / a[1].tot - b[1].best / b[1].tot).slice(0, 2).forEach(([k, h]) => add("low_skill", { title: h.title || k, best: AD(h.best), tot: AD(h.tot) }, `${ROOT}quizzes/quiz/?q=${encodeURIComponent(k)}`));
  const inPer = new Set(R.wk.map((w) => w.dom).concat(R.ql.map((e) => e.dom)));
  const earlier = works().filter((w) => !P.hide[w.key] && w.t > 0 && w.t < R.pr.a && w.src !== "games").map((w) => Object.assign({}, w, { dom: mDom(w) })).sort((a, b) => b.t - a.t), seen = new Set();
  earlier.forEach((w) => { if (w.dom === "other" || inPer.has(w.dom) || seen.has(w.dom) || !sel(w.dom)) return; seen.add(w.dom); add("retrain", { title: w.title, domain: domName(w.dom) }, w.url); });
  if (!R.qKeys.length && POOL) { const c = POOL.quiz.find((x) => !done.has(x.slug) && sel(pd(x))); if (c) add("quiz", { title: c.title }, c.url); }
  if (POOL) { const s = POOL.stories.find((x) => !have.has("stories:" + x.slug) && sel(pd(x))); if (s) add("story", { title: s.title }, s.url); }
  if (POOL) { const dm = new Set(works().map(mDom)); RPC.dom.filter((d) => sel(d.slug) && !dm.has(d.slug)).slice(0, 2).forEach((d) => { const b = POOL.bank.find((x) => !have.has("bank:" + x.slug) && pd(x) === d.slug); if (b) add("empty", { title: b.title, domain: d.title }, b.url); }); }
  if (POOL) { const dd = [...inPer].find((d) => d !== "other" && sel(d)); if (dd) { const b = POOL.bank.find((x) => !have.has("bank:" + x.slug) && pd(x) === dd); if (b) add("worksheet", { title: b.title, domain: domName(dd) }, b.url); } }
  return out;
}
const rpLink = (w) => `<a href="${w.url}">${esc(w.title)}</a>`;
function childBox(R) {
  const L = [], c = R.cnt;
  if (c.acts) L.push(["🌟", "أكملت أنشطة جميلة"]); if (c.les) L.push(["📖", "تعلمت شيئًا جديدًا"]); if (c.quiz) L.push(["🎯", "جرّبت اختبارًا"]); if (Object.keys(R.skills).length) L.push(["💪", "تدربت على مهارة جديدة"]); if (R.certs.length) L.push(["🏅", "حصلت على شهادة"]);
  if (!L.length) L.push(["🌱", "أنا مستعد لأتعلم شيئًا جديدًا"]); else L.push(["🚶", "أنا أواصل التعلم خطوة بخطوة"]);
  return `<section class="art rpkid"><h2>إنجازاتي ${R.type === "month" ? "هذا الشهر" : R.type === "week" ? "هذا الأسبوع" : "في هذه الفترة"}</h2><ul class="rpkl">${L.map(([e, t]) => `<li><span aria-hidden="true">${e}</span>${t}</li>`).join("")}</ul></section>`;
}
function rpGenLog(kind) { try { const k = "zad-rp-s:" + kind; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); fetch(SB + "/rest/v1/rp_stats", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ kind, level: P.lv }) }).catch(() => {}); } catch {} }
function rviewPage() {
  const p = new URLSearchParams(location.search), rs = rpSet(), type = ["week", "month", "custom"].includes(p.get("t")) ? p.get("t") : rs.type, off = Math.min(0, parseInt(p.get("off"), 10) || 0);
  const pr = period(type, off, p.get("from"), p.get("to"));
  if (!pr) { skel(`<div class="zbc nopr"><a href="../../">الرئيسية</a> › <a href="../">تقارير التقدم</a></div><div class="pfempty"><p>الفترة المحددة غير صحيحة. اختر تاريخ بداية قبل تاريخ النهاية وبحد أقصى سنة.</p>${abtn("../", "العودة", "go")}</div>`); return; }
  const R = buildReport(pr, type), hid = rs.hide, sd = (d) => !rs.hideDom[d];
  const seg = (n, l) => `<div class="pfstat"><b>${AD(n)}</b><span>${l}</span></div>`, mx = Math.max(1, ...R.bars), ind = rpOn;
  const doms = RPC.dom.concat([{ slug: "other", title: "أنشطة متنوعة", d: { icon: "⭐" } }]).filter((d) => sd(d.slug));
  const domHtml = doms.map((d) => {
    const ws = R.wk.filter((w) => w.dom === d.slug), qs = R.ql.filter((e) => e.dom === d.slug), qk = [...new Set(qs.map((e) => e.k))], sk = [...new Set(ws.map((w) => ((META[w.src] || {})[w.slug] || {}).skill).filter(Boolean))], nd = R.needSk.filter((x) => x.dom === d.slug);
    if (d.slug === "other" && !ws.length && !qs.length) return "";
    const has = ws.length || qk.length;
    return `<article class="rpdom" data-dom="${d.slug}"><h3><span aria-hidden="true">${d.d.icon || "⭐"}</span> ${esc(d.title)}</h3>${has ? `<p>أنشطة مكتملة: <b>${AD(ws.length)}</b> · اختبارات: <b>${AD(qk.length)}</b></p>${sk.length ? `<p class="hint">مهارات تدرب عليها: ${sk.slice(0, 8).map(esc).join("، ")}</p>` : ""}${ws.length && !hid.works ? `<ul class="rpl">${ws.slice(0, 6).map((w) => `<li>${rpLink(w)} <small>${esc(w.type)} · ${fmt(w.t)}</small></li>`).join("")}${ws.length > 6 ? `<li class="hint">و ${AD(ws.length - 6)} أخرى</li>` : ""}</ul>` : ""}` : '<p class="hint">لا توجد بيانات كافية في هذه الفترة لهذا المجال.</p>'}${nd.length && !hid.need ? `<p class="rpneed">يحتاج إلى مراجعة: ${nd.map((x) => `${esc(x.k)} (${AD(x.ok)} من ${AD(x.n)})`).join("، ")}</p>` : ""}</article>`;
  }).join("");
  const body = () => {
    const rec = recos(R);
    skel(`<div class="zbc nopr"><a href="../../">الرئيسية</a> › <a href="../">تقارير التقدم</a> › التقرير</div>${kidBar()}
<div class="nopr rpnavp">${type !== "custom" ? `<a class="abtn" href="?t=${type}&off=${off - 1}">${type === "month" ? "الشهر السابق" : "الأسبوع السابق"}</a>${off < 0 ? `<a class="abtn" href="?t=${type}&off=${off + 1}">${type === "month" ? "الشهر التالي" : "الأسبوع التالي"}</a>` : ""}` : ""}<a class="abtn" href="../">إعدادات التقرير</a></div>
<header class="rphead"><h1>تقرير تقدّم ${esc(kidName())}</h1><p>${type === "week" ? "التقرير الأسبوعي" : type === "month" ? "التقرير الشهري" : "تقرير مخصص"} · من ${fmt(pr.a)} إلى ${fmt(Math.min(pr.z, Date.now()))}${type === "month" ? " · " + esc(pr.name) : ""}</p><p class="hint">${esc(LV[P.lv])} · يعرض هذا التقرير ما أُنجز فعليًا في زاد على هذا الجهاز، وليس تقييمًا لقدرات الطفل ولا مقارنة بغيره.</p></header>
<section class="art"><div class="pfstats">${seg(R.cnt.acts, "أنشطة مكتملة")}${seg(R.cnt.les, "دروس وقصص")}${seg(R.cnt.wsp, "أوراق عمل ومشروعات")}${seg(R.cnt.games, "ألعاب")}${seg(R.cnt.quiz, "اختبارات")}${!hid.certs ? seg(R.certs.length, "شهادات") : ""}${seg(Object.keys(R.skills).length, "مهارات تدرب عليها")}${ind("ind_retrain") ? seg(R.retrain, "مرات إعادة التدريب") : ""}</div>${R.undated ? `<p class="hint">يوجد ${AD(R.undated)} عملًا قديمًا بلا تاريخ لا يدخل في تقارير الفترات.</p>` : ""}</section>
${ind("ind_chart") ? `<section class="art"><h2>النشاط اليومي</h2><div class="pfchart" role="img" aria-label="عدد الإنجازات اليومية">${R.bars.map((n, i) => `<div class="pfb" title="${fmt(pr.a + i * DAY)}: ${AD(n)}"><i style="height:${Math.round((n / mx) * 100)}%"></i></div>`).join("")}</div><p class="hint">كل عمود يوم، والأطول يعني إنجازات أكثر في ذلك اليوم.</p></section>` : ""}
<section class="art"><h2>الأقسام التي استخدمها الطفل</h2>${Object.keys(R.used).length ? `<p>${Object.keys(R.used).map((k) => `<span class="rpchip">${esc(SECN[k] || k)}</span>`).join("")}</p>` : '<p class="hint">لم تُسجَّل أنشطة في هذه الفترة.</p>'}</section>
<section class="art"><h2>التقدم حسب المجال</h2><div class="rpdoms">${domHtml || '<p class="hint">لا توجد مجالات للعرض.</p>'}</div>${RPC.err ? '<p class="hint">تعذر تحميل تصنيف المجالات الآن، لذلك لا يظهر التقسيم.</p>' : ""}</section>
${ind("ind_progress") ? `<section class="art"><h2>مهارات أظهرت تقدمًا</h2>${R.progress.length ? `<ul class="rpl">${R.progress.map((x) => `<li><b>${esc(x.title)}</b>: من ${AD(x.from)} من ${AD(x.fn)} إلى ${AD(x.to)} من ${AD(x.tn)}</li>`).join("")}</ul>` : '<p class="hint">لا توجد بيانات كافية لإظهار تقدم في هذه الفترة. يظهر التقدم عند إعادة اختبار سبق إجراؤه بنتيجة أفضل.</p>'}</section>` : ""}
${!hid.need && ind("ind_need") ? `<section class="art"><h2>مهارات تحتاج إلى مزيد من التدريب</h2>${R.needSk.length ? `<ul class="rpl">${R.needSk.map((x) => `<li><b>${esc(x.k)}</b>: ${AD(x.ok)} إجابات صحيحة من ${AD(x.n)} سؤالًا (من كل المحاولات). التدريب يصنع الفرق.</li>`).join("")}</ul>` : '<p class="hint">لا توجد مهارة تحتاج مراجعة بحسب البيانات الحالية.</p>'}</section>` : ""}
${!hid.certs ? `<section class="art"><h2>الشهادات في الفترة</h2>${R.certs.length ? `<ul class="rpl">${R.certs.map((c) => `<li><b>${esc(c.title)}</b> · ${fmt(P.certs[c.slug].t)} · <a class="nopr" href="../../portfolio/cert/?c=${encodeURIComponent(c.slug)}">عرض</a></li>`).join("")}</ul>` : '<p class="hint">لا شهادات جديدة في هذه الفترة.</p>'}</section>` : ""}
${!hid.works ? `<section class="art"><h2>أبرز الأعمال المحفوظة في ملف الإنجاز</h2>${R.wk.length ? `<ul class="rpl">${R.wk.slice(-8).reverse().map((w) => `<li>${rpLink(w)} <small>${esc(w.type)} · ${fmt(w.t)}</small></li>`).join("")}</ul><p class="nopr"><a href="../../portfolio/works/">عرض ملف الإنجاز كاملًا</a></p>` : '<p class="hint">لا أعمال في هذه الفترة.</p>'}</section>` : ""}
<section class="art"><h2>ماذا نتعلم بعد ذلك؟</h2>${rec.length ? `<ul class="rpl rprec">${rec.map((r) => `<li>${esc(r.text)} <a class="abtn go nopr" href="${r.url}">افتح</a></li>`).join("")}</ul>` : '<p class="hint">لا توجد توصيات محددة الآن. واصلوا ما بدأتموه.</p>'}</section>
${childBox(R)}
<div class="btns nopr"><button type="button" class="abtn go" id="rpprint">طباعة التقرير أو حفظه PDF</button></div><p class="hint nopr">التقرير خاص بوليّ الأمر ولا يُرسل إلى أحد. الأرقام من سجلات هذا الجهاز${SESS && consent() ? " (ومتزامنة مع حسابك)" : ""}.</p>`);
    bindKid(); $("#rpprint").onclick = () => { rpGenLog("print"); W.print(); };
    rs.last = { type, a: pr.a, z: pr.z, t: Date.now() }; rs.seen = (type === "week" ? "w" : type === "month" ? "m" : "c") + pr.a; save(); rpGenLog(type);
    W.__rp = { R, rec }; if (p.get("print") === "1") setTimeout(() => W.print(), 700);
  };
  loadPool().then(body, body);
}
function rhubPage() {
  const rs = rpSet(), cur = period("week", 0), prev = period("week", -1), R0 = buildReport(cur, "week");
  const last = rs.last ? `${rs.last.type === "week" ? "أسبوعي" : rs.last.type === "month" ? "شهري" : "مخصص"} · ${fmt(rs.last.a)} إلى ${fmt(rs.last.z)} (أُنشئ ${fmt(rs.last.t)})` : "لم يُنشأ تقرير بعد";
  const due = rs.notif && rs.seen !== "w" + prev.a;
  const t = new Date(), ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`, f0 = new Date(t.getTime() - 6 * DAY);
  const seg = (n, l) => `<div class="pfstat"><b>${AD(n)}</b><span>${l}</span></div>`;
  skel(`<div class="zbc"><a href="../">الرئيسية</a> › تقارير تقدم الطفل</div>${kidBar()}
${due ? `<div class="rpbanner" role="status">تقرير الأسبوع الماضي جاهز للاطلاع. <a class="abtn go" href="view/?t=week&off=-1">عرض التقرير</a></div>` : ""}
<section class="art"><h1>تقارير تقدم ${esc(kidName())}</h1><p class="hint">${esc(LV[P.lv])} · الأسبوع الحالي حتى الآن (من ${fmt(cur.a)}):</p><div class="pfstats">${seg(R0.cnt.acts, "أنشطة مكتملة")}${seg(R0.cnt.les, "دروس وقصص")}${seg(R0.cnt.wsp, "أوراق عمل ومشروعات")}${seg(R0.cnt.quiz, "اختبارات")}${seg(Object.keys(R0.skills).length, "مهارات تدرب عليها")}</div><p><b>آخر تقرير:</b> ${esc(last)}</p>
<div class="btns"><a class="abtn go" href="view/?t=week" id="rpw">عرض التقرير الأسبوعي</a><a class="abtn go" href="view/?t=month" id="rpm">عرض التقرير الشهري</a><a class="abtn" href="view/?t=week&print=1" id="rpp1">طباعة التقرير أو حفظ PDF</a></div></section>
<section class="art"><h2>تقرير لفترة تحددها</h2><form class="pfper" id="rpcf"><label>من<input type="date" id="rpf" value="${ymd(f0)}" max="${ymd(t)}"></label><label>إلى<input type="date" id="rpt" value="${ymd(t)}" max="${ymd(t)}"></label><button class="abtn go" type="submit">عرض التقرير</button></form><p class="hint" id="rpcm" role="status"></p></section>
<section class="art"><h2>إعدادات التقارير</h2><form class="pfedit" id="rpsf"><label>التقرير الافتراضي<select id="rpty"><option value="week"${rs.type === "week" ? " selected" : ""}>أسبوعي</option><option value="month"${rs.type === "month" ? " selected" : ""}>شهري</option></select></label>
<fieldset><legend>المجالات التي تظهر في التقرير</legend>${RPC.dom.map((d) => `<label class="pfck"><input type="checkbox" data-d="${d.slug}" ${rs.hideDom[d.slug] ? "" : "checked"}> ${d.d.icon || ""} ${esc(d.title)}</label>`).join("") || '<p class="hint">تعذر تحميل المجالات الآن.</p>'}</fieldset>
<fieldset><legend>إخفاء تفاصيل غير ضرورية</legend><label class="pfck"><input type="checkbox" data-h="works" ${rs.hide.works ? "checked" : ""}> إخفاء قوائم الأعمال المفصلة</label><label class="pfck"><input type="checkbox" data-h="certs" ${rs.hide.certs ? "checked" : ""}> إخفاء الشهادات</label><label class="pfck"><input type="checkbox" data-h="need" ${rs.hide.need ? "checked" : ""}> إخفاء المهارات التي تحتاج تدريبًا</label></fieldset>
<fieldset><legend>تذكير داخل الموقع (اختياري)</legend><label class="pfck"><input type="checkbox" id="rpnf" ${rs.notif ? "checked" : ""}> أذكّرني هنا عندما يجهز تقرير الأسبوع الماضي</label><p class="hint">التذكير يظهر داخل هذه الصفحة فقط عند زيارتك لها. لا نرسل رسائل ولا بريدًا ولا إشعارات على جهازك.</p></fieldset>
<div class="btns"><button class="abtn go" type="submit">حفظ الإعدادات</button></div><p class="hint" id="rpsm" role="status"></p></form></section>
<section class="art pfpriv"><h2>الخصوصية</h2><p>التقارير تُبنى على جهازك من سجلات طفلك، ولا تُنشر ولا تُشارَك ولا تُرتَّب ولا تقارن الطفل بغيره. يُحفظ فقط تاريخ آخر تقرير وإعداداتك. ${SESS && consent() ? "وبما أنك فعّلت المزامنة، تُحفظ الإعدادات مع ملف الإنجاز في حسابك." : ""}</p><div class="btns"><button class="abtn qzdanger" type="button" id="rpdel">حذف إعدادات التقارير وسجل آخر تقرير</button></div><p class="hint" id="rpdm" role="status"></p></section>`);
  bindKid();
  $("#rpcf").onsubmit = (e) => { e.preventDefault(); const a = $("#rpf").value, z = $("#rpt").value; if (!period("custom", 0, a, z)) { $("#rpcm").textContent = "اختر تاريخ بداية قبل تاريخ النهاية، وبحد أقصى سنة."; return; } location.href = `view/?t=custom&from=${a}&to=${z}`; };
  $("#rpsf").onsubmit = (e) => { e.preventDefault(); rs.type = $("#rpty").value; $$("[data-d]").forEach((x) => { if (x.checked) delete rs.hideDom[x.dataset.d]; else rs.hideDom[x.dataset.d] = 1; }); $$("[data-h]").forEach((x) => { rs.hide[x.dataset.h] = x.checked ? 1 : 0; }); rs.notif = $("#rpnf").checked ? 1 : 0; save(); $("#rpsm").textContent = "تم حفظ الإعدادات."; };
  $("#rpdel").onclick = () => { if (!confirm("حذف إعدادات التقارير وسجل آخر تقرير لهذا الطفل؟ (لا تُحذف أنشطته)")) return; delete P.rp; save(); $("#rpdm").textContent = "تم الحذف."; setTimeout(() => location.reload(), 600); };
}
W.ZPF = { evalCert, rawRecords, works, quizRecords, get state() { return { P, EARNED, REC, META, CERTS }; } };
async function init() { await checkConflict(); await prepare(); ({ hub: hubPage, works: worksPage, cert: certPage, report: reportPage, rhub: rhubPage, rview: rviewPage })[PAGE](); const p = D.getElementById("avw"); if (p) p.setAttribute("aria-busy", "false"); }
if (D.body.classList.contains("pf")) init().catch((e) => { reportErr("init", (e && e.message) || "init"); const b = $("#aview"); if (b) b.innerHTML = '<div class="sempty"><h3>تعذر تحميل ملف الإنجاز الآن</h3><p>حاول مرة أخرى بعد قليل.</p></div>'; });
})();
