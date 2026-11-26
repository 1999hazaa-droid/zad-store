/* المهام التعليمية اليومية – زاد: اقتراحات قصيرة ومرنة (حتى ثلاث مهام يوميًا) من مجموعات ينشرها مراجع؛ كل مهمة تفتح مورد مكتبة حقيقيًا (dtask_public).
   تنويع المهام حتميّ حسب التاريخ مع تجنّب أنواع الأمس عند وجود بدائل. «أكملتها» يضغطها الطفل أو ولي الأمر؛ فتح المهمة لا يُحسب. لا إلزام ولا شرط للوصول إلى المكتبة. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INS = (l) => AGES.includes(l) || GRADES.includes(l);
const CAT = { arabic: "اللغة العربية", math: "الرياضيات", think: "الملاحظة والتفكير", life: "المهارات الحياتية", create: "الإبداع" };
const CIMG = { arabic: "book.svg", math: "numbers.svg", think: "brain.svg", life: "heart.svg", create: "palette.svg" };
const KIND = { interactive: "نشاط تفاعلي", worksheet: "ورقة عمل", card: "بطاقة تعليمية", story: "قصة قصيرة", game: "لعبة تعليمية", home: "نشاط منزلي", think: "ملاحظة وتفكير" };
const MSG = ["أحسنت، يمكنك متابعة نشاط آخر.", "رائع، خطوة صغيرة كل يوم.", "جميل! يمكنك العودة إلى هذه المهمة لاحقًا."];
const KEY = "zad-dtask-v1", TODAY_MAX = 3;
const ST = { tab: "today", age: "", grade: "", cat: "" };
let SETS = [], TASKS = [], SK = [], BYKEY = new Map(), root = null;
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const kidId = () => { const d = lget("zad-learn-v3", null); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const dstr = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const todayS = () => (W.__tkNow ? W.__tkNow() : dstr(new Date()));
const addDays = (s, n) => { const [y, m, d] = s.split("-").map(Number), t = new Date(y, m - 1, d + n); return dstr(t); };
function store() { const s = lget(KEY, { kids: {} }); s.kids = s.kids || {}; const k = (s.kids[kidId()] = s.kids[kidId()] || {}); k.done = k.done || {}; k.saved = k.saved || {}; k.shuf = k.shuf || {}; return [s, k]; }
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
const doneList = (key) => (store()[1].done[key] || []);
const doneToday = (key) => doneList(key).some((t) => t.d === todayS());
function mark(key, add) { const [s, k] = store(), a = (k.done[key] = k.done[key] || []); if (add) a.push({ d: todayS(), t: Date.now() }); else a.pop(); if (!a.length) delete k.done[key]; save(s); }
function toggleSave(key) { const [s, k] = store(); if (k.saved[key]) delete k.saved[key]; else k.saved[key] = Date.now(); save(s); }
const hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
function prep(skj, dj) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  const dm = Object.fromEntries((skj.domains || []).map((d) => [d.slug, d]));
  SK = (skj.skills || []).filter((s) => dm[s.domain]);
  SETS = []; TASKS = [];
  (dj.items || []).forEach((st) => {
    if (!st.levels.every(INS) || !CAT[st.cat]) return;
    const sk = SK.find((s) => s.slug === st.skill);
    const ts = (st.tasks || []).map((t) => { const it = BYKEY.get(t.item); if (!it || !KIND[t.kind] || !it.lv.some((l) => st.levels.includes(l))) return null; return { key: st.slug + "|" + t.item, set: st.slug, title: t.t, d: t.d || "", kind: t.kind, min: t.min || null, it, cat: st.cat, levels: st.levels, skill: sk ? sk.name : "" }; }).filter(Boolean);
    if (!ts.length) return;
    SETS.push(Object.assign({}, st, { ts, skName: sk ? sk.name : "" })); TASKS.push(...ts);
  });
}
const curLv = () => ST.age || ST.grade || store()[1].lv || kidLv();
const setLv = (v) => { const [s, k] = store(); if (v) k.lv = v; else delete k.lv; save(s); };
function pick(lv, date, avoid, shuf) {
  const pool = TASKS.filter((t) => t.levels.includes(lv) && t.it.lv.includes(lv));
  const ord = pool.slice().sort((a, b) => hash(date + "|" + shuf + "|" + a.key) - hash(date + "|" + shuf + "|" + b.key)), out = [];
  const take = (fn) => { for (const t of ord) { if (out.length >= TODAY_MAX) return; if (!out.includes(t) && fn(t)) out.push(t); } };
  take((t) => !avoid.has(t.kind) && !out.some((o) => o.kind === t.kind) && !out.some((o) => o.cat === t.cat));
  take((t) => !avoid.has(t.kind) && !out.some((o) => o.kind === t.kind));
  take((t) => !out.some((o) => o.kind === t.kind));
  take(() => true);
  return out;
}
function dayPicks(lv, date, shuf, avoid) { return pick(lv, date, avoid, shuf); }
function today() {
  const lv = curLv(); if (!lv) return [];
  const date = todayS(), [sx, k] = store(), y = addDays(date, -1);
  k.shown = k.shown || {};
  const prev = k.shown[y] && k.shown[y].lv === lv ? k.shown[y].kinds : dayPicks(lv, y, 0, new Set()).map((t) => t.kind);
  const out = dayPicks(lv, date, k.shuf[date] || 0, new Set(prev));
  k.shown[date] = { lv, kinds: out.map((t) => t.kind) };
  Object.keys(k.shown).sort().slice(0, -7).forEach((d) => delete k.shown[d]);
  save(sx); return out;
}
function card(t, opt) {
  opt = opt || {}; const n = doneList(t.key).length, dn = doneToday(t.key), sv = !!store()[1].saved[t.key];
  return `<article class="tkcard" style="--c:${esc((SK.find((s) => s.name === t.skill) || {}).color || "#cdb8f5")}" data-k="${esc(t.key)}"><img src="${ROOT}images/ill/${CIMG[t.cat]}" alt=""><div><h3>${esc(t.title)}</h3>${t.d ? `<p>${esc(t.d)}</p>` : ""}<div class="mt"><span>${esc(KIND[t.kind])}</span><span>${esc(t.skill || CAT[t.cat])}</span>${t.min ? `<span>حوالي ${AD(t.min)} دقائق</span>` : ""}${n ? `<span class="ok">${dn ? "أكملتها اليوم" : "أكملتها " + AD(n) + (n === 1 ? " مرة" : " مرات")}</span>` : ""}</div></div><div class="tkact"><a href="${url(t.it)}" data-a="start">ابدأ المهمة</a><button type="button" data-a="done">${n ? "أكملتها مرة أخرى" : "أكملتها"}</button>${n ? `<button type="button" class="alt" data-a="undo">تراجع</button>` : ""}<button type="button" class="alt" data-a="save" aria-pressed="${sv}">${sv ? "محفوظة ✓" : "احفظ للعودة لاحقًا"}</button></div></article>`;
}
function tabs() { const L = { today: "مهام اليوم", sets: "المجموعات", saved: "محفوظاتي", done: "السابقة" }; return `<div class="tktabs" role="group" aria-label="أقسام المهام">${Object.keys(L).map((k) => `<button type="button" data-tab="${k}" aria-pressed="${ST.tab === k}">${L[k]}</button>`).join("")}</div>`; }
function lvSel() { const opt = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join(""); const lv = curLv(); return `<div class="skf" role="group" aria-label="عمر الطفل أو صفه"><label>العمر<select id="tage">${opt(AGES, ST.age || (AGES.includes(lv) && !ST.grade ? lv : ""), "اختر العمر")}</select></label><label>الصف<select id="tgr">${opt(GRADES, ST.grade || (GRADES.includes(lv) && !ST.age ? lv : ""), "اختر الصف")}</select></label></div>`; }
const empty = (h, p) => `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>${h}</h3><p>${p}</p></div>`;
function home() {
  const lv = curLv(); let body = "";
  if (ST.tab === "today") {
    if (!lv) body = empty("اختر عمر طفلك أو صفه", "نقترح لك مهامًا قصيرة تناسبه. لا إلزام ولا واجبات.");
    else {
      const t = today(), done = t.filter((x) => doneToday(x.key)).length;
      body = t.length ? `<h2 class="skhint" style="font-size:17px;margin:14px 0 0;color:var(--z-pri,#5b2bb8)">${done ? `أكملت ${AD(done)} من ${AD(t.length)} اليوم. ${MSG[done % MSG.length]}` : "لنبدأ نشاطًا جديدًا! اختر ما يعجبك."}</h2><p class="skhint">هذه اقتراحات مرنة وليست واجبًا. يمكنك تجاهلها أو تغييرها.</p><div class="tklist">${t.map((x) => card(x)).join("")}</div><div class="srbtns"><button type="button" class="alt" id="tshuf">اقترح مهام أخرى</button></div>` : empty("لا توجد مهام لهذا العمر الآن", "ننشر المهام بعد مراجعتها. يمكنك فتح <a href=\"" + ROOT + "library/\">المكتبة</a> أو <a href=\"" + ROOT + "plan/\">خطتي التعليمية</a>.");
    }
  } else if (ST.tab === "sets") {
    const cats = Object.keys(CAT).filter((c) => SETS.some((s) => s.cat === c)), a = SETS.filter((s) => (!ST.cat || s.cat === ST.cat) && (!lv || s.levels.includes(lv)));
    body = `${cats.length ? `<div class="skdoms">${cats.map((c) => `<button type="button" class="skdom" data-c="${c}" aria-pressed="${ST.cat === c}">${esc(CAT[c])}</button>`).join("")}</div>` : ""}<p class="skhint">${AD(a.length)} مجموعة</p><div class="skgrid">${a.map((s) => `<article class="skcard"><h3>${esc(s.title)}</h3><div class="mt"><span>${esc(CAT[s.cat])}</span><span>${esc(lvTxt(s.levels))}</span></div>${s.descr ? `<p class="m">${esc(s.descr)}</p>` : ""}<p class="m">${esc(s.skName)} · ${AD(s.ts.length)} ${s.ts.length === 1 ? "مهمة" : "مهام"}${s.est ? " · حوالي " + AD(s.est) + " دقيقة" : ""}</p><a class="skgo" href="#s=${encodeURIComponent(s.slug)}">افتح المجموعة</a></article>`).join("") || empty("لا توجد مجموعات بهذه الاختيارات", "جرّب نوعًا آخر أو عمرًا آخر.")}</div>`;
  } else if (ST.tab === "saved") {
    const sv = store()[1].saved, t = TASKS.filter((x) => sv[x.key]);
    body = t.length ? `<div class="tklist">${t.map((x) => card(x)).join("")}</div>` : empty("لم تحفظ مهامًا بعد", "اضغط «احفظ للعودة لاحقًا» على أي مهمة. الحفظ على هذا الجهاز.");
  } else {
    const dn = store()[1].done, t = TASKS.filter((x) => dn[x.key]).sort((a, b) => dn[b.key][dn[b.key].length - 1].t - dn[a.key][dn[a.key].length - 1].t).slice(0, 12);
    body = t.length ? `<p class="skhint">مهام أكملتها على هذا الجهاز. يمكنك إعادة أي مهمة.</p><div class="tklist">${t.map((x) => card(x)).join("")}</div>` : empty("لا توجد مهام مكتملة بعد", "تُسجَّل المهمة فقط عندما تضغط «أكملتها». فتحها أو تنزيل ملفها لا يُحسب.");
  }
  root.innerHTML = `${tabs()}${ST.tab === "today" || ST.tab === "sets" ? lvSel() : ""}${body}${par()}`;
}
function par() {
  return `<details class="srpar"><summary>لولي الأمر</summary><p>المهام اقتراحات تعليمية قصيرة (حتى ${AD(TODAY_MAX)} يوميًا) تتنوع بين الأنواع، ويمكنكم اختيار ما يناسب طفلكم أو تركه. لا يُشترط إكمالها للوصول إلى المكتبة أو لبدء مهارة جديدة.</p><p>تحت كل مهمة المهارة المستهدفة ونوع النشاط. «أكملتها» تُسجَّل على هذا الجهاز عند الضغط فقط ولا تدل على إتقان. <a href="${ROOT}plan/">خطتي التعليمية</a> · <a href="${ROOT}paths/">المسارات</a> · <a href="${ROOT}review/">مراجعة المهارات</a> · <a href="${ROOT}support/">دعم التعلم</a></p></details><a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`;
}
function detail(slug) {
  const s = SETS.find((x) => x.slug === slug);
  if (!s) { root.innerHTML = `<a class="skback" href="#">← كل المجموعات</a>${empty("لم نجد هذه المجموعة", "قد تكون غير منشورة.")}`; return; }
  root.innerHTML = `<a class="skback" href="#">← كل المجموعات</a><div class="pthcov"><img src="${ROOT}images/ill/${CIMG[s.cat]}" alt=""><div><h2>${esc(s.title)}</h2><div class="pthmeta"><span>${esc(CAT[s.cat])}</span><span>${esc(lvTxt(s.levels))}</span>${s.est ? `<span>حوالي ${AD(s.est)} دقيقة</span>` : ""}</div></div></div>${s.descr ? `<div class="pthgoal"><p>${esc(s.descr)}</p></div>` : ""}<p class="skhint">المهارة المستهدفة: ${esc(s.skName)}</p><div class="tklist">${s.ts.map((x) => card(x)).join("")}</div>${par()}`;
  D.title = s.title + " | المهام اليومية | منصة زاد التعليمية";
}
const curSlug = () => (decodeURIComponent(location.hash).match(/^#s=(.+)$/) || [])[1];
function route() { const s = curSlug(); if (s) detail(s); else { D.title = "المهام التعليمية اليومية | منصة زاد التعليمية"; home(); } }
const redraw = () => (curSlug() ? detail(curSlug()) : home());
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const t = e.target, tb = t.closest("[data-tab]"), c = t.closest(".skdom"), a = t.closest("[data-a]");
    if (tb) { ST.tab = tb.dataset.tab; if (curSlug()) location.hash = ""; else home(); return; }
    if (c) { ST.cat = ST.cat === c.dataset.c ? "" : c.dataset.c; home(); return; }
    if (t.id === "tshuf") { const [s, k] = store(), d = todayS(); k.shuf[d] = (k.shuf[d] || 0) + 1; save(s); home(); return; }
    if (a && a.dataset.a !== "start") { const key = a.closest("[data-k]").dataset.k; if (a.dataset.a === "done") mark(key, true); else if (a.dataset.a === "undo") mark(key, false); else toggleSave(key); redraw(); }
  });
  D.addEventListener("change", (e) => { const t = e.target; if (t.id === "tage") { ST.age = t.value; ST.grade = ""; setLv(t.value); if (!t.value) setLv(""); home(); } if (t.id === "tgr") { ST.grade = t.value; ST.age = ""; setLv(t.value); home(); } });
}
async function init() {
  root = $("#skbody");
  try {
    const [dj, skj] = await Promise.all([rpc("dtask_public"), rpc("skills_public"), Z.load()]);
    if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(skj, dj); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المهام الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="tretry">إعادة المحاولة</button></div>`;
    const b = $("#tretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__tkTest = { ST, get TASKS() { return TASKS; }, today };
init();
})(window);
