/* ملف إنجاز الطفل – زاد: كل ما يظهر مستخرج من سجلات النشاط الحقيقية المحفوظة على هذا الجهاز فقط. */
(function () {
"use strict";
const W = window, D = document, PAGE = D.body.dataset.page || "hub";
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
const ROOT = new URL(PAGE === "hub" ? "../" : "../../", D.baseURI).href;
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
  bank: { tb: "bank_items", cols: "slug,title,icon,skill,descr,pdf_url", tab: "ws", type: "نشاط من بنك الأنشطة", url: (s) => `${ROOT}bank/play/?s=${encodeURIComponent(s)}` },
  proj: { tb: "proj_items", cols: "slug,title,icon,skill,descr,kind", tab: "proj", type: "مشروع أو تحدٍّ", url: (s) => `${ROOT}projects/play/?s=${encodeURIComponent(s)}` },
  life: { tb: "life_items", cols: "slug,title,icon,cat", tab: "proj", type: "نشاط من المهارات الحياتية", lab: "المهارات الحياتية", url: (s) => `${ROOT}life/play/?s=${encodeURIComponent(s)}` },
  ready: { tb: "ready_items", cols: "slug,title,icon,cat", tab: "proj", type: "نشاط من الاستعداد المدرسي", lab: "الاستعداد المدرسي", url: (s) => `${ROOT}ready/play/?s=${encodeURIComponent(s)}` },
  val: { tb: "val_items", cols: "slug,title,icon,cat", tab: "les", type: "درس من القيم والسلوك", lab: "القيم والسلوك", url: (s) => `${ROOT}values/play/?s=${encodeURIComponent(s)}` },
  dig: { tb: "dig_items", cols: "slug,title,icon,cat", tab: "les", type: "درس من المهارات الرقمية", lab: "المهارات الرقمية", url: (s) => `${ROOT}digital/play/?s=${encodeURIComponent(s)}` },
  exp: { tb: "exp_items", cols: "slug,title,icon,cat", tab: "les", type: "درس من الثقافة العامة", lab: "الثقافة العامة", url: (s) => `${ROOT}explore/play/?s=${encodeURIComponent(s)}` },
  vid: { tb: "video_items", cols: "slug,title,icon,skill,descr", tab: "les", type: "درس مرئي", url: (s) => `${ROOT}videos/play/?s=${encodeURIComponent(s)}` },
  songs: { tb: "song_items", cols: "slug,title,icon,skill", tab: "les", type: "نشيد تعليمي", url: (s) => `${ROOT}songs/play/?s=${encodeURIComponent(s)}` },
  stories: { tb: "stories", cols: "slug,title,summary,topic,cover_url", tab: "les", type: "قصة تعليمية", lab: "القراءة والقصص", url: (s) => `${ROOT}stories/read/?s=${encodeURIComponent(s)}` },
};
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
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
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
  return out;
}
async function loadMeta(raw) {
  const bySrc = {}; raw.forEach((r) => (bySrc[r.src] = bySrc[r.src] || []).push(r.slug));
  await Promise.all(Object.keys(bySrc).map(async (s) => {
    const cfg = SRC[s], slugs = [...new Set(bySrc[s])]; META[s] = META[s] || {};
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
  return { have: ts.length, need: n, done: ts.length >= n, t: ts[n - 1] || 0 };
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
async function prepare() { loadDB(); const raw = rawRecords(); REC = raw; await Promise.all([loadMeta(raw), loadCerts()]); issue(); }
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
    f.innerHTML = `<form class="pfedit" id="pff"><label>الاسم الذي يظهر في الملف والشهادات<input type="text" id="pfn" maxlength="24" value="${esc(P.nick || S.name || "")}" autocomplete="off"></label><fieldset><legend>الصورة الرمزية</legend><div class="pfchs">${Object.entries(CHS).map(([k, n]) => `<label class="pfch"><input type="radio" name="pfc" value="${k}"${P.ch === k ? " checked" : ""}><img src="${ROOT}games/chars/${k}-160.png" alt="" width="64" height="64"><span>${n}</span></label>`).join("")}</div></fieldset><label>العمر أو الصف<select id="pfl">${Object.entries(LV).map(([k, v]) => `<option value="${k}"${P.lv === k ? " selected" : ""}>${v}</option>`).join("")}</select></label><div class="btns"><button class="abtn go" type="submit">حفظ</button><button class="abtn" type="button" id="pfx">إلغاء</button></div><p class="hint">الاسم والصورة يبقيان على هذا الجهاز فقط ولا يُرفعان إلى أي مكان.</p></form>`;
    $("#pfx").onclick = () => (f.innerHTML = "");
    $("#pff").onsubmit = (e) => { e.preventDefault(); P.nick = $("#pfn").value.trim().slice(0, 24); P.ch = ($("input[name=pfc]:checked") || { value: P.ch }).value; P.lv = $("#pfl").value; save(); location.reload(); };
  };
}
function nav(on) { return `<nav class="pfnav" aria-label="أقسام ملف الإنجاز">${abtn(ROOT + "portfolio/", "الرئيسية", on === "hub" ? "go" : "")}${TABS.map(([k, n]) => abtn(ROOT + "portfolio/works/?tab=" + k, n, on === k ? "go" : "")).join("")}${abtn(ROOT + "portfolio/report/", "تقرير ولي الأمر", on === "rep" ? "go" : "")}</nav>`; }
/* ===== الرئيسية ===== */
function hubPage() {
  const v = visible(), cnt = (t) => v.filter((w) => w.tab === t).length, q = quizRecords().filter((x) => !x.contest);
  const acts = v.filter((w) => w.tab === "ws" || w.tab === "proj").length, les = cnt("les"), saved = cnt("ws") + cnt("proj");
  const stat = (n, l) => `<div class="pfstat"><b>${AD(n)}</b><span>${l}</span></div>`;
  const latest = v.slice(0, 5), empty = !v.length && !q.length;
  const b = skel(`${kidBar()}<div class="pfstats">${stat(acts, "نشاطًا مكتملًا")}${stat(les, "قصة أو درسًا أتمّها")}${stat(saved, "عملًا محفوظًا")}${stat(q.length, "اختبارًا مكتملًا")}${stat(EARNED.length, "شهادة إنجاز")}</div>
<div class="btns pfmain"><a class="abtn go" href="${ROOT}portfolio/works/">عرض ملف الإنجاز</a><a class="abtn" href="${ROOT}portfolio/report/?print=1">تحميل أو طباعة الملف</a></div>
${CERR ? '<p class="hint">تعذر تحميل بعض بيانات الملف الآن. حاول لاحقًا.</p>' : ""}
<section class="art"><h2>آخر الأعمال</h2>${latest.length ? `<div class="pfgrid">${latest.map(card).join("")}</div>` : `<div class="pfempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt="" width="64" height="64"><p>${empty ? "ملف الإنجاز ما زال فارغًا، وسيمتلئ تلقائيًا عند إكمال أنشطة وقصص واختبارات في المنصة." : "لا أعمال مرئية في الملف الآن."}</p><div class="btns">${abtn(ROOT + "activities/", "أنشطة وأوراق عمل")}${abtn(ROOT + "stories/", "قصص تعليمية")}${abtn(ROOT + "quizzes/", "اختبارات ومسابقات")}</div></div>`}</section>
<section class="art pfpriv"><h2>خصوصية الملف</h2><p>هذا الملف خاص بالطفل ووليّ أمره، ومحفوظ على هذا الجهاز فقط. لا يظهر لأحد، ولا توجد قائمة ترتيب أو مقارنة بين الأطفال، ولا نحفظ صورًا أو معلومات شخصية. المشاركة الوحيدة تتم بطباعة الملف أو حفظه PDF بقرارك أنت.</p><div class="btns"><button class="abtn" type="button" id="pfhid">أعمال أخفيتها (${AD(hiddenCnt())})</button><button class="abtn qzdanger" type="button" id="pfdel">حذف ملف الإنجاز</button></div><p class="hint" id="pfmsg"></p></section>`);
  bindKid(); bindPriv();
}
function bindPriv() {
  const msg = $("#pfmsg"), h = $("#pfhid"); if (h) h.onclick = () => { if (!hiddenCnt()) { msg.textContent = "لا توجد أعمال مخفية."; return; } P.hide = {}; save(); location.reload(); };
  const d = $("#pfdel"); if (!d) return; let st = 0;
  d.onclick = () => {
    if (st === 0) { st = 1; msg.innerHTML = "هذا يحذف الأسماء والصور والملاحظات والشهادات من ملف هذا الطفل على هذا الجهاز. سجلات النشاط نفسها تبقى، فقد تظهر الأعمال والشهادات مجددًا بحسابها من النشاط. للحذف التام اختر «حذف كل تقدم الطفل». اضغط مرة ثانية للتأكيد."; d.textContent = "نعم، احذف ملف الإنجاز"; const a = D.createElement("button"); a.className = "abtn qzdanger"; a.type = "button"; a.textContent = "حذف كل تقدم الطفل من هذا الجهاز"; a.onclick = () => { if (!confirm("سيُمسح كل تقدم هذا الطفل في جميع أقسام زاد على هذا الجهاز نهائيا. متأكد؟")) return; if (Object.keys(DB.kids).length > 1) { delete DB.kids[DB.cur]; DB.cur = Object.keys(DB.kids)[0]; } else DB.kids[DB.cur] = {}; save(); location.href = ROOT + "portfolio/"; }; d.after(a); return; }
    delete S.pf; save(); location.href = ROOT + "portfolio/";
  };
}
function card(w) {
  return `<article class="pfc" data-k="${esc(w.key)}"><img src="${esc(icon(w.icon))}" alt="" width="56" height="56" loading="lazy" onerror="this.src='${ROOT}images/zad/i_puzzle.webp'"><div class="pfcb"><b>${esc(w.title)}</b><small>${esc(w.type)} · ${w.t ? fmt(w.t) : "تاريخ غير مسجل"}</small>${w.skill ? `<small>المهارة: ${esc(w.skill)}</small>` : ""}${w.by ? `<small>${w.by}</small>` : ""}<p>${esc(P.notes[w.key] || w.text || "")}</p><div class="btns"><a class="abtn go" href="${esc(w.url)}">عرض العمل</a>${w.pdf ? `<a class="abtn" href="${esc(w.pdf.startsWith("http") ? w.pdf : ROOT + w.pdf)}" target="_blank" rel="noopener">طباعة نسخة</a>` : ""}<button type="button" class="abtn pfnote" data-k="${esc(w.key)}">ملاحظة</button><button type="button" class="abtn pfhide" data-k="${esc(w.key)}">إخفاء من الملف</button></div></div></article>`;
}
/* ===== الأعمال والتبويبات ===== */
function worksPage() {
  let tab = new URLSearchParams(location.search).get("tab"); if (!TABS.some((t) => t[0] === tab)) tab = "ws";
  const v = visible(), body = { ws: () => list(v.filter((w) => w.tab === "ws"), "لا أوراق عمل مكتملة بعد. ابدأ من قسم الأنشطة.", ROOT + "activities/", "أنشطة وأوراق عمل"), proj: () => list(v.filter((w) => w.tab === "proj"), "لا مشروعات أو أنشطة مكتملة بعد.", ROOT + "projects/", "المشروعات والتحديات"), les: () => list(v.filter((w) => w.tab === "les"), "لا قصص أو دروس مكتملة بعد.", ROOT + "stories/", "القصص التعليمية"), quiz: quizTab, cert: certTab }[tab];
  const b = skel(`<div class="zbc"><a href="../../">الرئيسية</a> › <a href="../">ملف الإنجاز</a> › ${esc(TABS.find((t) => t[0] === tab)[1])}</div>${kidBar()}${nav(tab)}<section class="art" id="pftab"></section>`);
  $("#pftab").innerHTML = body(); bindKid();
  $$(".pfhide").forEach((x) => (x.onclick = () => { if (!confirm("إخفاء هذا العمل من ملف الإنجاز؟ (لا يحذف النشاط نفسه، ويمكن إظهاره من الصفحة الرئيسية)")) return; P.hide[x.dataset.k] = 1; save(); location.reload(); }));
  $$(".pfnote").forEach((x) => (x.onclick = () => { const t = prompt("ملاحظة قصيرة عن هذا العمل (يراها وليّ الأمر فقط):", P.notes[x.dataset.k] || ""); if (t == null) return; const s = t.trim().slice(0, 140); if (s) P.notes[x.dataset.k] = s; else delete P.notes[x.dataset.k]; save(); location.reload(); }));
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
W.ZPF = { evalCert, rawRecords, works, quizRecords, get state() { return { P, EARNED, REC, META, CERTS }; } };
async function init() { await prepare(); ({ hub: hubPage, works: worksPage, cert: certPage, report: reportPage })[PAGE](); const p = D.getElementById("avw"); if (p) p.setAttribute("aria-busy", "false"); }
if (D.body.classList.contains("pf")) init().catch((e) => { reportErr("init", (e && e.message) || "init"); const b = $("#aview"); if (b) b.innerHTML = '<div class="sempty"><h3>تعذر تحميل ملف الإنجاز الآن</h3><p>حاول مرة أخرى بعد قليل.</p></div>'; });
})();
