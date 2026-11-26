/* معرض المشاريع الآمن – زاد: خاص بالطفل ووليّ أمره. كل ما يُحفظ هنا يبقى على هذا الجهاز (zad-gallery-v1) والصور في IndexedDB المحلية فقط؛ لا شيء يُرفع ولا يظهر لأحد.
   مشاريع المنصة تُقرأ من سجل الطفل الفعلي (zad-learn-v3) دون تكرار سجلاتها؛ المعرض يحفظ مرجعًا وملاحظات وحالة الإخفاء فقط. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const H = { apikey: ANON, Authorization: "Bearer " + ANON };
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const GK = "zad-gallery-v1", LK = "zad-learn-v3";
const LVS = ["a2", "a3", "a4", "a5", "a6", "g1", "g2", "g3", "g4"];
const DEF = {
  domains: [["science", "العلوم والاستكشاف"], ["math", "الرياضيات"], ["arabic", "اللغة العربية والقراءة والكتابة"], ["english", "اللغة الإنجليزية"], ["art", "الفنون والإبداع"], ["nature", "البيئة والنظافة"], ["life", "المهارات الحياتية"], ["multi", "متعدد المجالات"]].map(([slug, title]) => ({ slug, title, on: true })),
  types: [["project", "مشروع"], ["craft", "عمل يدوي وفني"], ["experiment", "تجربة وملاحظة"], ["story", "قصة أو كتابة"], ["building", "بناء وتركيب"]].map(([slug, title]) => ({ slug, title, on: true })),
  msgs: ["أحسنت! أضفت إنجازًا جديدًا إلى معرضك", "مشروع جميل يوضح ما تعلمته", "كل مشروع جديد هو خطوة في رحلة التعلم", "احتفظ بإنجازك لتتذكر ما تعلمته"], allow_print: true, allow_photos: true
};
const CATMAP = { create: "art", numbers: "math", observe: "science", think: "multi", words: "arabic" };
const BUILT = { weekly: "مشروع أسبوعي", monthly: "مشروع شهري", challenge: "تحدٍّ", project: "مشروع من المنصة" };
const ICO = { science: "i_microscope", math: "i_numbers", arabic: "u_abc", english: "i_globe", art: "i_palette", nature: "i_tree", life: "i_clock", multi: "i_puzzle" };
let CFG = DEF, PROJ = new Map(), SKILLS = [], root = null, PHOTO_OK = false, VIEW = { kid: "", f: { lv: "", dom: "", type: "", st: "", period: "", sort: "new", hid: false } }, NOTICE = "";
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const learn = () => lget(LK, null);
const kidId = () => { const d = learn(); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const curKid = () => VIEW.kid || kidId();
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const LVN = (l) => (Z.LVN && Z.LVN[l]) || l;
const dateTxt = (t) => { try { return new Date(t).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" }); } catch (e) { return ""; } };
/* ===== التخزين المحلي ===== */
function store() { const s = lget(GK, { kids: {} }); s.kids = s.kids || {}; const k = (s.kids[curKid()] = s.kids[curKid()] || {}); k.e = k.e || {}; return [s, k]; }
const commit = (s) => lset(GK, s);
function proj(slug, kid) { const d = learn(), k = d && d.kids && d.kids[kid || curKid()]; return (k && k.proj) || { done: {}, started: {}, steps: {} }; }
/* ===== صور محلية (نفس مخزن ملف الإنجاز، على هذا الجهاز فقط) ===== */
const idbo = () => new Promise((ok, no) => { try { const r = indexedDB.open("zad-pf", 1); r.onupgradeneeded = () => r.result.createObjectStore("img"); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); } catch (e) { no(e); } });
const idbDo = async (mode, fn) => { const db = await idbo(); return new Promise((ok, no) => { const tx = db.transaction("img", mode), st = tx.objectStore("img"), rq = fn(st); tx.oncomplete = () => ok(rq && rq.result); tx.onerror = () => no(tx.error); }); };
const pkey = (e) => curKid() + "|" + (e.ref ? "proj:" + e.ref : "g:" + e.id);
const photoGet = (e) => (PHOTO_OK ? idbDo("readonly", (st) => st.get(pkey(e))).catch(() => null) : Promise.resolve(null));
const photoSet = (e, v) => idbDo("readwrite", (st) => st.put(v, pkey(e)));
const photoDel = (e) => idbDo("readwrite", (st) => st.delete(pkey(e))).catch(() => {});
const toJpeg = (file) => new Promise((ok, no) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { const m = Math.min(1, 640 / Math.max(im.width, im.height)), c = D.createElement("canvas"); c.width = Math.max(1, Math.round(im.width * m)); c.height = Math.max(1, Math.round(im.height * m)); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height); URL.revokeObjectURL(u); ok(c.toDataURL("image/jpeg", 0.8)); }; im.onerror = () => { URL.revokeObjectURL(u); no(new Error("img")); }; im.src = u; });
const photoConsent = () => { const d = learn(), k = d && d.kids && d.kids[curKid()]; return !!(k && k.pf && k.pf.photoOk); };
function setConsent() { let d = learn(); if (!d || !d.kids) d = { cur: "k1", kids: { k1: {} } }; const k = (d.kids[curKid()] = d.kids[curKid()] || {}); k.pf = k.pf || {}; k.pf.photoOk = Date.now(); d._t = Date.now(); return lset(LK, d); }
/* ===== بيانات المشاريع ===== */
const domOf = (it) => { const c = CATMAP[it.cat] || it.cat; return CFG.domains.some((d) => d.slug === c) || DEF.domains.some((d) => d.slug === c) ? c : "multi"; };
const typeOf = (it) => (it.kind === "challenge" ? "challenge" : it.span === "weekly" ? "weekly" : it.span === "monthly" ? "monthly" : "project");
const domName = (s) => ((CFG.domains.concat(DEF.domains)).find((d) => d.slug === s) || { title: "متعدد المجالات" }).title;
const typeName = (s) => BUILT[s] || ((CFG.types.concat(DEF.types)).find((d) => d.slug === s) || { title: "مشروع" }).title;
const icon = (c) => (!c ? ROOT + "images/zad/i_puzzle.webp" : String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`);
function norm(e) {
  const p = e.ref ? PROJ.get(e.ref) : null, pr = e.ref ? proj() : null, dn = pr && pr.done[e.ref] && pr.done[e.ref].d > 0 && pr.done[e.ref].t ? pr.done[e.ref] : null;
  const o = { id: e.id, ref: e.ref || "", hidden: !!e.hidden, at: e.at || 0, note: e.note || "", pnote: e.pnote || "", raw: e };
  if (e.ref) {
    o.title = p ? p.title : e.title || "مشروع من المنصة"; o.descr = e.descr || (p ? p.descr : "") || ""; o.dom = p ? domOf(p) : e.dom || "multi"; o.type = p ? typeOf(p) : "project";
    o.lv = p ? (p.levels || []).filter((l) => LVS.includes(l)) : e.lv || []; o.icon = p ? p.icon : e.icon || ""; o.status = dn ? "done" : "doing"; o.doneT = dn ? dn.t : 0;
    const sk = new Set(); ((p && p.data && p.data.skills) || []).forEach((x) => sk.add(x)); if (dn) (dn.skills || []).forEach((x) => sk.add(x)); (e.skills || []).forEach((x) => sk.add(x)); o.skills = Array.from(sk);
    const steps = (p && p.data && Array.isArray(p.data.steps)) ? p.data.steps : [], prog = dn ? steps.length : Math.min(steps.length, (pr.steps && pr.steps[e.ref]) || 0); o.steps = steps.map((s, i) => ({ t: s.t, ok: i < prog })); o.gone = !p;
  } else { o.title = e.title; o.descr = e.descr || ""; o.dom = e.dom || "multi"; o.type = e.type || "project"; o.lv = e.lv ? [e.lv] : []; o.icon = ""; o.status = e.status === "done" ? "done" : "doing"; o.doneT = o.status === "done" ? e.doneAt || 0 : 0; o.skills = e.skills || []; o.steps = []; }
  return o;
}
const all = () => Object.values(store()[1].e).map(norm);
const getE = (id) => { const e = store()[1].e[id]; return e ? norm(e) : null; };
function evalOf(slug) { const s = lget("zad-eval-v1", null), k = s && s.kids && s.kids[curKid()], r = k && k.ev && k.ev[slug]; if (!r || !r.st) return null; const v = Object.values(r.st), n = (x) => v.filter((y) => y === x).length; return { done: n("done"), help: n("help"), retry: n("retry"), ts: r.ts }; }
/* ===== التحقق ===== */
const PII = /(https?:|www\.|@|\+?\d[\d\s-]{6,}|عنواني|رقم هاتف)/i;
function check(f) {
  if (f.title !== undefined) { const t = f.title.trim(); if (t.length < 2 || t.length > 60) return "عنوان المشروع من حرفين إلى 60 حرفًا."; }
  for (const k of ["title", "descr", "note", "pnote"]) if (f[k] && PII.test(f[k])) return "لا تكتب أرقام هواتف أو روابط أو بريدًا أو عناوين أو أسماء كاملة؛ نحمي خصوصية الطفل.";
  if (f.descr && f.descr.length > 200) return "الوصف حتى 200 حرف.";
  if (f.note && f.note.length > 200) return "الملاحظة حتى 200 حرف.";
  return "";
}
/* ===== واجهة ===== */
const empty = (h, p, b) => `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>${h}</h3><p>${p}</p>${b || ""}</div>`;
const back = `<a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`;
const tabs = (on) => `<div class="evtabs" role="navigation" aria-label="أقسام المعرض"><a href="#/"${on === "hub" ? ' aria-current="page"' : ""}>معرضي</a><a href="#/add"${on === "add" ? ' aria-current="page"' : ""}>+ أضف مشروعًا</a><a href="#/dash"${on === "dash" ? ' aria-current="page"' : ""}>لولي الأمر</a></div>`;
const msgBox = () => { const m = NOTICE; NOTICE = ""; return m ? `<div class="evmsg" role="status">${esc(m)}</div>` : ""; };
function kidSel() { const d = learn(), ks = d && d.kids ? Object.keys(d.kids) : []; if (ks.length < 2) return ""; return `<label class="lab" for="glkid">الطفل</label><select id="glkid">${ks.map((id, i) => `<option value="${esc(id)}"${id === curKid() ? " selected" : ""}>${esc((d.kids[id].name || d.kids[id].n || "") || "الطفل " + AD(i + 1))}</option>`).join("")}</select>`; }
async function cardImg(o) { const p = await photoGet(o.raw); return p ? `<img src="${p}" alt="صورة المشروع">` : `<img class="ic" src="${esc(o.icon ? icon(o.icon) : icon(ICO[o.dom]))}" alt="">`; }
function filtered() {
  const f = VIEW.f, now = Date.now(), per = { week: 7, month: 31, year: 366 }[f.period];
  let a = all().filter((o) => o.hidden === !!f.hid);
  if (f.lv) a = a.filter((o) => o.lv.includes(f.lv)); if (f.dom) a = a.filter((o) => o.dom === f.dom); if (f.type) a = a.filter((o) => o.type === f.type); if (f.st) a = a.filter((o) => o.status === f.st);
  if (per) a = a.filter((o) => (o.doneT || o.at) >= now - per * 864e5);
  a.sort((x, y) => ((y.doneT || y.at) - (x.doneT || x.at)) * (f.sort === "old" ? -1 : 1)); return a;
}
async function hub() {
  D.title = "معرض مشاريعي الآمن | منصة زاد التعليمية";
  const f = VIEW.f, a = filtered(), hidN = all().filter((o) => o.hidden).length, total = all().filter((o) => !o.hidden).length;
  const opt = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map(([k, t]) => `<option value="${esc(k)}"${v === k ? " selected" : ""}>${esc(t)}</option>`).join("");
  const doms = CFG.domains.filter((d) => d.on).map((d) => [d.slug, d.title]), types = Object.entries(BUILT).concat(CFG.types.filter((d) => d.on).map((d) => [d.slug, d.title]));
  const cards = await Promise.all(a.map(async (o) => `<article class="glc" data-id="${esc(o.id)}"><div class="im">${await cardImg(o)}</div><div class="bd"><h3>${esc(o.title)}</h3><div class="mt"><span>${esc(domName(o.dom))}</span><span>${esc(typeName(o.type))}</span>${o.lv.length ? `<span>${esc(o.lv.map(LVN).slice(0, 2).join("، "))}</span>` : ""}</div><div class="mt"><span class="badge ${o.status === "done" ? "ok" : "wip"}">${o.status === "done" ? "مكتمل" : "قيد التنفيذ"}</span>${o.doneT ? `<span>أُنجز في ${esc(dateTxt(o.doneT))}</span>` : o.at ? `<span>أُضيف في ${esc(dateTxt(o.at))}</span>` : ""}</div>${o.skills.length ? `<div class="mt">${o.skills.slice(0, 3).map((x) => `<span class="sk">${esc(x)}</span>`).join("")}</div>` : ""}</div><div class="act"><a href="#/v/${encodeURIComponent(o.id)}">عرض المشروع</a><a class="alt" href="#/e/${encodeURIComponent(o.id)}">تعديل</a><button type="button" class="alt" data-hide="${esc(o.id)}">${o.hidden ? "إظهار" : "إخفاء"}</button><button type="button" class="dng" data-del="${esc(o.id)}">حذف</button></div></article>`));
  root.innerHTML = `${tabs("hub")}${msgBox()}${kidSel()}<p class="evintro">هنا مشاريعك التي وثّقتها. لا ترتيب بينك وبين أحد، وكل مشروع خطوة في رحلتك.</p>
<div class="glfilters glf" role="group" aria-label="تصفح المعرض"><label>العمر أو الصف<select id="fLv">${opt(LVS.map((l) => [l, LVN(l)]), f.lv, "الكل")}</select></label><label>المجال<select id="fDom">${opt(doms, f.dom, "الكل")}</select></label><label>نوع المشروع<select id="fType">${opt(types, f.type, "الكل")}</select></label><label>الحالة<select id="fSt">${opt([["done", "المكتملة"], ["doing", "قيد التنفيذ"]], f.st, "الكل")}</select></label><label>الفترة<select id="fPer">${opt([["week", "هذا الأسبوع"], ["month", "هذا الشهر"], ["year", "هذه السنة"]], f.period, "كل الوقت")}</select></label><label>الترتيب بالتاريخ<select id="fSort"><option value="new"${f.sort === "new" ? " selected" : ""}>الأحدث أولًا</option><option value="old"${f.sort === "old" ? " selected" : ""}>الأقدم أولًا</option></select></label></div>
<div class="pills" role="group"><button type="button" id="fHid" aria-pressed="${!!f.hid}">${f.hid ? "عرض المعرض" : "المخفية (" + AD(hidN) + ")"}</button></div>
${a.length ? `<p class="cnt">${AD(a.length)} ${a.length === 1 ? "مشروع" : "مشاريع"}</p><div class="evgrid">${cards.join("")}</div>` : (total + hidN ? empty("لا توجد مشاريع بهذه الاختيارات", "غيّر الاختيارات أعلاه.") : empty("معرضك ما زال فارغًا", "أضف أول مشروع لتحتفظ به وتتذكر ما تعلمته.", `<a class="btn" href="#/add">أضف مشروعًا</a>`))}
<p class="evprivacy">المعرض خاص بك وبولي أمرك: يبقى على هذا الجهاز ولا يظهر لأحد. لا نطلب صورة وجهك ولا اسمك الكامل.</p>${back}`;
}
async function view(id) {
  const o = getE(id); if (!o) { root.innerHTML = `<a class="skback" href="#/">← العودة إلى المعرض</a>${empty("لم نجد هذا المشروع", "قد يكون حُذف من المعرض.")}`; return; }
  D.title = o.title + " | معرض مشاريعي"; const ph = await photoGet(o.raw), ev = o.ref ? evalOf(o.ref) : null;
  root.innerHTML = `<a class="skback" href="#/">← العودة إلى المعرض</a>${msgBox()}
<div id="glprint"><section class="evhead"><img src="${esc(o.icon ? icon(o.icon) : icon(ICO[o.dom]))}" alt=""><div><h2>${esc(o.title)}</h2><p><span class="badge ${o.status === "done" ? "ok" : "wip"}">${o.status === "done" ? "مكتمل 🎉" : "قيد التنفيذ"}</span> ${esc(domName(o.dom))} · ${esc(typeName(o.type))}</p><p>${o.doneT ? "تاريخ الإنجاز: <b>" + esc(dateTxt(o.doneT)) + "</b>" : o.at ? "أُضيف إلى المعرض في " + esc(dateTxt(o.at)) : ""}</p></div></section>
${ph ? `<img class="glbig" src="${ph}" alt="صورة المشروع">` : ""}
${o.descr ? `<div class="evbox"><h3>وصف مختصر</h3><p>${esc(o.descr)}</p></div>` : ""}
<div class="evbox"><h3>المهارات التي مارستها</h3>${o.skills.length ? `<div class="pills">${o.skills.map((x) => `<span class="sk">${esc(x)}</span>`).join("")}</div>` : '<p class="cnt">لم تُسجَّل مهارات بعد.</p>'}</div>
${o.steps.length ? `<div class="evbox"><h3>خطوات المشروع</h3><ul class="glsteps">${o.steps.map((s) => `<li class="${s.ok ? "on" : ""}">${esc(s.t)}</li>`).join("")}</ul><p class="cnt">${AD(o.steps.filter((s) => s.ok).length)} من ${AD(o.steps.length)} خطوة أكملتها.</p></div>` : ""}
${ev ? `<div class="evbox"><h3>تقييم المشروع</h3><p>${ev.done ? "أنجزت " + AD(ev.done) + " · " : ""}${ev.help ? "تحتاج مساعدة في " + AD(ev.help) + " · " : ""}${ev.retry ? "ستحاول مرة أخرى في " + AD(ev.retry) : ""}</p><p><a href="${ROOT}eval/#/r/${encodeURIComponent(o.ref)}">عرض تقرير المراجعة</a></p></div>` : ""}
${o.note ? `<div class="evbox"><h3>ملاحظتي</h3><p>${esc(o.note)}</p></div>` : ""}${o.pnote ? `<div class="evbox"><h3>ملاحظة ولي الأمر أو المعلم</h3><p>${esc(o.pnote)}</p></div>` : ""}</div>
<p class="evmsg">${o.status === "done" ? "إنجاز جميل! احتفظ به لتتذكر ما تعلمته." : "أنت في الطريق، وكل خطوة تُحسب."}</p>
<div class="evbtns"><a class="alt" href="#/">العودة إلى المعرض</a><a href="#/e/${encodeURIComponent(o.id)}">تعديل بيانات المشروع</a>${o.ref ? `<a class="alt" href="${ROOT}portfolio/works/?tab=proj">في ملف الإنجاز</a><a class="alt" href="${ROOT}projects/play/?s=${encodeURIComponent(o.ref)}&lv=${esc(o.lv[0] || kidLv() || "a5")}">فتح المشروع</a>` : `<a class="alt" href="${ROOT}portfolio/">ملف الإنجاز</a>`}${CFG.allow_print ? '<button type="button" class="alt" id="glprintbtn">طباعة بطاقة المشروع</button>' : ""}<button type="button" class="alt" data-hide="${esc(o.id)}">${o.hidden ? "إظهار في المعرض" : "إخفاء من المعرض"}</button><button type="button" class="alt" data-del="${esc(o.id)}">حذف</button></div>
<p class="evprivacy">${o.ref ? "هذا المشروع من المنصة: سجلّه الأصلي في ملف الإنجاز لم يتكرر، وحذفه من المعرض لا يحذف سجل إنجازك. " : "هذا المشروع مسجّل في المعرض فقط. "}لا يخرج شيء من هذا الجهاز دون موافقة ولي الأمر.</p>${back}`;
}
const chip = (l, on, k) => `<button type="button" class="chip${on ? " on" : ""}" data-sk="${esc(l)}" aria-pressed="${on}" style="border:2px solid #5b2bb8;background:${on ? "#5b2bb8" : "#fff"};color:${on ? "#fff" : "#5b2bb8"};border-radius:99px;font:800 13px inherit;padding:6px 14px;min-height:40px;margin:3px;cursor:pointer">${esc(l)}</button>`;
let FORM = null;
function addPage() {
  D.title = "إضافة مشروع | معرض مشاريعي"; const have = new Set(Object.values(store()[1].e).filter((e) => e.ref).map((e) => e.ref)), pr = proj();
  const cand = Array.from(new Set(Object.keys(pr.done || {}).concat(Object.keys(pr.started || {})))).filter((s) => PROJ.has(s) && !have.has(s) && PROJ.get(s).kind === "project");
  const list = cand.map((s) => { const p = PROJ.get(s), dn = pr.done[s] && pr.done[s].d > 0; return `<div class="evrow"><span>${esc(p.title)} <span class="badge ${dn ? "ok" : "wip"}">${dn ? "مكتمل" : "قيد التنفيذ"}</span></span><button type="button" class="btn" data-addref="${esc(s)}">أضف إلى المعرض</button></div>`; }).join("");
  root.innerHTML = `${tabs("add")}<div class="evbox"><h3>من مشاريعي في المنصة</h3><p class="cnt">المشاريع التي بدأتها أو أكملتها تُضاف بنقرة واحدة، ولا يتكرر سجلّها في ملف الإنجاز.</p>${list || '<p class="cnt">لا توجد مشاريع بدأتها أو أكملتها لم تُضف بعد. <a href="' + ROOT + 'projects/">افتح المشاريع</a></p>'}</div>
<div class="evbox"><h3>مشروع جديد من عملك</h3><p class="cnt">مشروع صنعته بنفسك خارج المنصة.</p><button type="button" class="btn" id="glNewM">أنشئ مشروعًا</button></div>${back}`;
}
function formPage(id) {
  const o = id ? getE(id) : null; if (id && !o) { root.innerHTML = `<a class="skback" href="#/">← العودة إلى المعرض</a>${empty("لم نجد هذا المشروع", "")}`; return; }
  const ref = !!(o && o.ref); FORM = FORM && FORM.id === (o ? o.id : null) ? FORM : { id: o ? o.id : null, title: o ? o.title : "", descr: o ? (o.raw.descr || "") : "", dom: o ? o.dom : "multi", type: o ? o.type : "project", lv: o ? (o.lv[0] || "") : kidLv(), status: o ? o.status : "doing", note: o ? o.note : "", pnote: o ? o.pnote : "", skills: o ? (o.raw.skills || []) : [], err: "" };
  const f = FORM; D.title = (o ? "تعديل " : "مشروع جديد | ") + "معرض مشاريعي";
  const sk = SKILLS.filter((s) => !f.lv || (s.levels || []).includes(f.lv)).slice(0, 24);
  const doms = CFG.domains.filter((d) => d.on || d.slug === f.dom), types = CFG.types.filter((d) => d.on || d.slug === f.type);
  root.innerHTML = `<a class="skback" href="#/">← العودة إلى المعرض</a><h2 style="font-size:20px;color:var(--z-pri,#5b2bb8)">${o ? "تعديل بيانات المشروع" : "مشروع جديد"}</h2>
${ref ? '<p class="evintro">عنوان هذا المشروع ومجاله من المنصة ولا يتغيران. يمكنك تعديل الوصف والملاحظات والمهارات.</p>' : ""}
<div class="glwarn">لا تكتب اسم الطفل الكامل ولا عنوانه ولا رقم هاتف. ولا تصوّر وجه الطفل؛ صوّر العمل فقط.</div>
<form id="glform" novalidate>${ref ? "" : `<label class="lab" for="gTitle">عنوان المشروع</label><input type="text" id="gTitle" maxlength="60" value="${esc(f.title)}">`}
<label class="lab" for="gDescr">وصف مختصر (اختياري)</label><textarea id="gDescr" maxlength="200" dir="auto">${esc(f.descr)}</textarea>
${ref ? "" : `<div class="glf"><label>المجال التعليمي<select id="gDom">${doms.map((d) => `<option value="${esc(d.slug)}"${f.dom === d.slug ? " selected" : ""}>${esc(d.title)}</option>`).join("")}</select></label><label>نوع المشروع<select id="gType">${types.map((d) => `<option value="${esc(d.slug)}"${f.type === d.slug ? " selected" : ""}>${esc(d.title)}</option>`).join("")}</select></label><label>العمر أو الصف<select id="gLv"><option value="">اختر</option>${LVS.map((l) => `<option value="${l}"${f.lv === l ? " selected" : ""}>${esc(LVN(l))}</option>`).join("")}</select></label><label>حالة المشروع<select id="gSt"><option value="doing"${f.status === "doing" ? " selected" : ""}>قيد التنفيذ</option><option value="done"${f.status === "done" ? " selected" : ""}>مكتمل</option></select></label></div>`}
${sk.length ? `<b class="lab">المهارات التي مارستها (اختر حتى 5)</b><div id="gSk">${sk.map((s) => chip(s.name, f.skills.includes(s.name))).join("")}</div>` : ""}
<label class="lab" for="gNote">ملاحظتي أو ملاحظة ولي الأمر (اختيارية)</label><textarea id="gNote" maxlength="200" dir="auto">${esc(f.note)}</textarea>
${CFG.allow_photos && PHOTO_OK ? `<div class="evbox"><h3>صورة العمل (اختيارية)</h3><p class="cnt">تُحفظ على هذا الجهاز فقط ولا تُرفع إلى الإنترنت، ويمكنك حذفها في أي وقت. لا تصوّر وجه الطفل.</p><input type="file" id="gPhoto" accept="image/*"><p id="gPhMsg" class="cnt" role="status"></p>${o ? '<button type="button" class="btn alt" id="gPhDel">حذف الصورة</button>' : ""}</div>` : ""}
<p class="err" id="gErr" role="alert">${esc(f.err)}</p>
<div class="evbtns"><button type="submit" id="gSave">${o ? "حفظ التعديلات" : "إضافة إلى المعرض"}</button><a class="alt" href="#/">إلغاء</a></div></form>`;
}
async function dashPage() {
  D.title = "لوحة ولي الأمر | معرض مشاريعي"; const a = all().filter((o) => !o.hidden), done = a.filter((o) => o.status === "done"), doing = a.filter((o) => o.status === "doing"), hidN = all().length - a.length;
  const doms = {}; a.forEach((o) => (doms[o.dom] = (doms[o.dom] || 0) + 1)); const sk = {}; a.forEach((o) => o.skills.forEach((x) => (sk[x] = (sk[x] || 0) + 1)));
  const latest = a.slice().sort((x, y) => (y.at || y.doneT) - (x.at || x.doneT)).slice(0, 5);
  root.innerHTML = `${tabs("dash")}${msgBox()}${kidSel()}<p class="evintro">أرقام هذه اللوحة محسوبة من مشاريع هذا الطفل المحفوظة على هذا الجهاز فقط، ولا تقارنه بأحد.</p>
<div class="glnum"><div><b>${AD(a.length)}</b>مشروعًا موثقًا</div><div><b>${AD(done.length)}</b>مكتملة</div><div><b>${AD(doing.length)}</b>قيد التنفيذ</div><div><b>${AD(Object.keys(doms).length)}</b>مجالات مارسها</div></div>
<div class="evbox"><h3>المجالات التعليمية التي مارسها</h3>${Object.keys(doms).length ? `<div class="pills">${Object.entries(doms).map(([d, n]) => `<span class="sk">${esc(domName(d))} · ${AD(n)}</span>`).join("")}</div>` : '<p class="cnt">لا توجد مشاريع بعد.</p>'}</div>
<div class="evbox"><h3>المهارات التي مارسها</h3>${Object.keys(sk).length ? `<div class="pills">${Object.entries(sk).map(([d, n]) => `<span class="sk">${esc(d)}${n > 1 ? " · " + AD(n) : ""}</span>`).join("")}</div>` : '<p class="cnt">لم تُسجَّل مهارات بعد.</p>'}</div>
<h2 style="font-size:18px;color:var(--z-pri,#5b2bb8)">أحدث المشاريع المضافة</h2>${latest.length ? latest.map((o) => `<article class="evbox" data-id="${esc(o.id)}"><h3>${esc(o.title)} <span class="badge ${o.status === "done" ? "ok" : "wip"}">${o.status === "done" ? "مكتمل" : "قيد التنفيذ"}</span></h3><p class="cnt">${esc(domName(o.dom))}${o.at ? " · أُضيف في " + esc(dateTxt(o.at)) : ""}</p><label class="lab" for="pn_${esc(o.id)}">ملاحظة تشجيعية من ولي الأمر</label><textarea id="pn_${esc(o.id)}" maxlength="200" dir="auto">${esc(o.pnote)}</textarea><div class="evbtns"><button type="button" data-pnote="${esc(o.id)}">حفظ الملاحظة</button><a class="alt" href="#/v/${encodeURIComponent(o.id)}">مراجعة المشروع</a></div></article>`).join("") : empty("لا توجد مشاريع بعد", "ستظهر هنا عند إضافة أول مشروع.")}
<div class="evbox"><h3>الخصوصية</h3><ul class="evlist"><li>المعرض خاص افتراضيًا ولا يمكن نشره للعامة.</li><li>المشاريع المخفية: ${AD(hidN)}. يمكنك إظهارها من المعرض.</li><li>الصور تُحفظ على هذا الجهاز فقط${photoConsent() ? " (وافقتم على ذلك)" : " (لم يُطلب منكم حفظ صور بعد)"}.</li><li>المشاركة خارج المنصة ممكنة فقط بطباعة بطاقة المشروع بعد موافقتك الصريحة.</li></ul><button type="button" class="btn alt" id="glWipe">حذف كل بيانات المعرض من هذا الجهاز</button></div>${back}`;
}
/* ===== الأحداث ===== */
function pickMsg() { const m = CFG.msgs && CFG.msgs.length ? CFG.msgs : DEF.msgs; return m[Date.now() % m.length]; }
function addRef(slug) {
  const p = PROJ.get(slug); if (!p) return; const [s, k] = store(); const id = "p:" + slug;
  if (!k.e[id]) k.e[id] = { id, ref: slug, title: p.title, dom: domOf(p), lv: (p.levels || []).filter((l) => LVS.includes(l)), icon: p.icon || "", at: Date.now() };
  commit(s); NOTICE = pickMsg(); location.hash = "#/v/" + encodeURIComponent(id);
}
function readForm() { const f = FORM, v = (i) => { const e = $("#" + i); return e ? e.value : undefined; }; const t = v("gTitle"); if (t !== undefined) f.title = t; const d = v("gDescr"); if (d !== undefined) f.descr = d; if (v("gDom") !== undefined) { f.dom = v("gDom"); f.type = v("gType"); f.lv = v("gLv"); f.status = v("gSt"); } const n = v("gNote"); if (n !== undefined) f.note = n; }
async function submitForm() {
  readForm(); const f = FORM, [s, k] = store(), cur = f.id ? k.e[f.id] : null, ref = !!(cur && cur.ref), tt = ref ? undefined : f.title;
  let err = check({ title: tt, descr: f.descr, note: f.note }); if (!err && !ref && !f.lv) err = "اختر العمر أو الصف."; if (!err && f.skills.length > 5) err = "اختر حتى خمس مهارات.";
  if (err) { f.err = err; const e = $("#gErr"); if (e) e.textContent = err; return; }
  let id = f.id, isNew = !id; if (!id) { id = "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); k.e[id] = { id, at: Date.now() }; }
  const e = k.e[id]; e.descr = f.descr.trim(); e.note = f.note.trim(); e.skills = f.skills.slice();
  if (!ref) { e.title = f.title.trim(); e.dom = f.dom; e.type = f.type; e.lv = f.lv; const was = e.status; e.status = f.status; if (f.status === "done" && (was !== "done" || !e.doneAt)) e.doneAt = Date.now(); if (f.status !== "done") delete e.doneAt; }
  const file = $("#gPhoto") && $("#gPhoto").files && $("#gPhoto").files[0];
  if (file && !photoConsent()) { if (!W.confirm("موافقة وليّ الأمر: هل توافق على حفظ صورة هذا المشروع على هذا الجهاز فقط؟ لا تُرفع الصورة إلى الإنترنت ولا تظهر لأحد، ويمكنك حذفها في أي وقت. اضغط موافق للمتابعة.")) { f.err = "لم تُحفظ الصورة لعدم الموافقة. يمكنك إضافة المشروع بدونها."; const el = $("#gErr"); if (el) el.textContent = f.err; return; } setConsent(); }
  if (file) { try { if (!/^image\//.test(file.type) || file.size > 15e6) throw new Error("size"); await photoSet(norm(e).raw, await toJpeg(file)); } catch (x) { f.err = "تعذر حفظ الصورة. جرّب صورة أخرى (أقل من ١٥ ميغابايت)."; const el = $("#gErr"); if (el) el.textContent = f.err; return; } }
  if (!commit(s)) { f.err = "تعذّر الحفظ على هذا الجهاز (قد يكون التخزين مغلقًا)."; const el = $("#gErr"); if (el) el.textContent = f.err; return; }
  FORM = null; NOTICE = isNew ? pickMsg() : "تم حفظ التعديلات."; location.hash = "#/v/" + encodeURIComponent(id);
}
async function route() {
  const h = decodeURIComponent(location.hash || "#/"), m = h.match(/^#\/(v|e)\/(.+)$/);
  if (!(m && m[1] === "e" && FORM && FORM.id === m[2])) FORM = null;
  if (m && m[1] === "v") await view(m[2]); else if (m && m[1] === "e") formPage(m[2]); else if (h === "#/add") addPage(); else if (h === "#/dash") await dashPage(); else await hub();
  W.scrollTo && W.scrollTo(0, 0);
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", async (e) => {
    const t = e.target;
    const ar = t.closest("[data-addref]"); if (ar) { addRef(ar.dataset.addref); return; }
    if (t.id === "glNewM") { FORM = { id: null, open: true, title: "", descr: "", dom: (CFG.domains.find((d) => d.on) || DEF.domains[0]).slug, type: (CFG.types.find((d) => d.on) || DEF.types[0]).slug, lv: kidLv(), status: "doing", note: "", pnote: "", skills: [], err: "" }; formPage(null); return; }
    const sk = t.closest("[data-sk]"); if (sk && FORM) { readForm(); const n = sk.dataset.sk, i = FORM.skills.indexOf(n); if (i >= 0) FORM.skills.splice(i, 1); else if (FORM.skills.length < 5) FORM.skills.push(n); else FORM.err = "اختر حتى خمس مهارات."; const y = W.scrollY; formPage(FORM.id); W.scrollTo(0, y); return; }
    const hd = t.closest("[data-hide]"); if (hd) { const [s, k] = store(), x = k.e[hd.dataset.hide]; if (x) { x.hidden = !x.hidden; commit(s); NOTICE = x.hidden ? "أُخفي المشروع من المعرض ويمكنك إظهاره من «المخفية»." : "عاد المشروع إلى معرضك."; } await route(); return; }
    const dl = t.closest("[data-del]"); if (dl) { const o = getE(dl.dataset.del); if (!o) return; if (!W.confirm(o.ref ? "حذف «" + o.title + "» من المعرض؟ لن يُحذف سجل إنجازك في المنصة، وتُحذف صورته المحفوظة هنا. لا يمكن التراجع." : "حذف «" + o.title + "» نهائيًا مع صورته؟ لا يمكن التراجع.")) return; await photoDel(o.raw); const [s, k] = store(); delete k.e[o.id]; commit(s); NOTICE = "حُذف المشروع من المعرض."; if (location.hash.startsWith("#/v/")) location.hash = "#/"; else await route(); return; }
    if (t.id === "fHid") { VIEW.f.hid = !VIEW.f.hid; await hub(); return; }
    if (t.id === "glprintbtn") { const o = getE(decodeURIComponent(location.hash).replace("#/v/", "")); if (!o) return; if (!W.confirm("موافقة ولي الأمر: هل توافق على طباعة بطاقة هذا المشروع أو حفظها PDF؟ لا يُرسل شيء عبر الإنترنت، وما تفعله بالبطاقة بعد ذلك مسؤوليتكم. اضغط موافق للمتابعة.")) return; W.print(); return; }
    if (t.id === "gPhDel") { const o = FORM && getE(FORM.id); if (o && W.confirm("حذف صورة هذا المشروع من هذا الجهاز؟")) { await photoDel(o.raw); const m = $("#gPhMsg"); if (m) m.textContent = "حُذفت الصورة."; } return; }
    const pn = t.closest("[data-pnote]"); if (pn) { const id = pn.dataset.pnote, v = ($("#pn_" + id).value || "").trim().slice(0, 200), err = check({ pnote: v }); if (err) { NOTICE = ""; W.alert(err); return; } const [s, k] = store(); if (k.e[id]) { k.e[id].pnote = v; commit(s); pn.textContent = "تم حفظ الملاحظة ✓"; } return; }
    if (t.id === "glWipe") { if (!W.confirm("حذف كل مشاريع المعرض وصوره من هذا الجهاز؟ لن تُحذف سجلات إنجازاتك في المنصة. لا يمكن التراجع.")) return; if (!W.confirm("تأكيد أخير: حذف كل بيانات المعرض لهذا الطفل؟")) return; for (const o of all()) await photoDel(o.raw); const [s, k] = store(); k.e = {}; commit(s); NOTICE = "حُذفت كل بيانات المعرض من هذا الجهاز."; await dashPage(); return; }
  });
  D.addEventListener("submit", (e) => { if (e.target.id === "glform") { e.preventDefault(); submitForm(); } });
  D.addEventListener("change", async (e) => {
    const t = e.target, m = { fLv: "lv", fDom: "dom", fType: "type", fSt: "st", fPer: "period", fSort: "sort" }[t.id];
    if (m) { VIEW.f[m] = t.value; await hub(); return; }
    if (t.id === "glkid") { VIEW.kid = t.value; await route(); return; }
    if (t.id === "gLv" && FORM) { readForm(); formPage(FORM.id); }
  });
}
async function init() {
  root = $("#skbody");
  try { PHOTO_OK = await idbo().then((d) => { d.close(); return true; }).catch(() => false); } catch (e) { PHOTO_OK = false; }
  try {
    const [pj, cf, sk] = await Promise.all([
      fetch(SB + "/rest/v1/proj_items?status=eq.published&select=slug,kind,cat,title,icon,levels,descr,data,span", { headers: H }).then((r) => { if (!r.ok) throw new Error("proj"); return r.json(); }),
      fetch(SB + "/rest/v1/rpc/gallery_cfg_public", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, H), body: "{}" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch(SB + "/rest/v1/rpc/skills_public", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, H), body: "{}" }).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    ]);
    if (!Array.isArray(pj)) throw new Error("proj"); pj.forEach((p) => PROJ.set(p.slug, p));
    if (cf && Array.isArray(cf.domains) && Array.isArray(cf.types)) CFG = Object.assign({}, DEF, cf, { msgs: Array.isArray(cf.msgs) && cf.msgs.length ? cf.msgs : DEF.msgs });
    SKILLS = ((sk && sk.skills) || []).filter((s) => s.name && (s.levels || []).some((l) => LVS.includes(l)));
    if (!W.__glBound) { W.__glBound = true; bind(); } await route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المعرض الآن</h3><p>تحقق من الاتصال وأعد المحاولة. مشاريعك المحفوظة على الجهاز لم تتأثر.</p><button type="button" id="glretry" class="btn">إعادة المحاولة</button></div>`; const b = $("#glretry"); if (b) b.addEventListener("click", init);
  }
}
W.__glTest = { get CFG() { return CFG; } };
init();
})(window);
