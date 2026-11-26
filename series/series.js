/* السلاسل التعليمية المتدرجة – زاد: واجهة خطوة بخطوة فوق «المسارات» المنشورة (paths_public) مع تعليمات وتلميحات وإجابات يكتبها المشرف (series_public).
   لا نعرض تلميحًا أو إجابة غير مكتوبة. «منجز» = أكمل نشاط بنك الأنشطة فعلًا، أو مُعلَّم منجزًا في خطة الطفل، أو علّمه ولي الأمر هنا؛ الفتح وحده لا يُحتسب. التخطي ليس إنجازًا. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const STG = { recognize: ["التعرف", "#7a5cd6"], understand: ["الفهم", "#2f8fd8"], practice: ["التدريب", "#1e9b6b"], apply: ["التطبيق", "#e08a1e"], review: ["المراجعة", "#d4577a"] };
const TYPE = { lib: "ورقة عمل", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", games: "لعبة", cards: "بطاقات" };
const PD = ["arabic", "math", "science", "life"], AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const KEY = "zad-series-v1";
const ST = { dom: "", age: "", grade: "", rev: false, sel: {}, hint: {}, ans: {} };
let DATA = null, NOTES = {}, DOMS = [], BYKEY = new Map(), SL = [], root = null;
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const kidId = () => { const d = lget("zad-learn-v3", null); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
/* ---- مخزن محلي لكل طفل ---- */
function store() { const s = lget(KEY, { kids: {} }); s.kids = s.kids || {}; return s; }
function mine(slug) { const s = store(), k = (s.kids[kidId()] = s.kids[kidId()] || {}); k[slug] = k[slug] || { done: [], skip: [], rev: false }; return { s, m: k[slug] }; }
function save(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } }
function mark(slug, key, kind, on) {
  const { s, m } = mine(slug), set = (a) => { const x = new Set(a); on ? x.add(key) : x.delete(key); return [...x]; };
  if (kind === "done") { m.done = set(m.done); if (on) m.skip = m.skip.filter((z) => z !== key); } else { m.skip = set(m.skip); if (on) m.done = m.done.filter((z) => z !== key); }
  return save(s);
}
function setRev(slug, on) { const { s, m } = mine(slug); m.rev = !!on; return save(s); }
/* ---- ما أكمله الطفل فعلًا ---- */
function doneSets(slug) {
  const d = lget("zad-learn-v3", null), kid = kidId(), k = d && d.kids && d.kids[kid], bank = (k && k.bank && k.bank.done) || {}, ws = (k && k.plan && k.plan.weeks) || {};
  const auto = new Set(); Object.keys(bank).forEach((sl) => { if (bank[sl] && bank[sl].d > 0) auto.add("bank:" + sl); });
  Object.keys(ws).forEach((w) => (ws[w].items || []).forEach((i) => { if (i.st === "done") auto.add(i.key); }));
  const { m } = mine(slug); return { auto, man: new Set(m.done), skip: new Set(m.skip), rev: m.rev };
}
const stat = (key, ds) => ds.auto.has(key) || ds.man.has(key) ? "done" : ds.skip.has(key) ? "skip" : "";
function prep(sk) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  const dm = Object.fromEntries((sk.domains || []).map((d) => [d.slug, d]));
  DOMS = PD.map((s) => dm[s]).filter(Boolean); SL = [];
  (DATA.paths || []).forEach((p) => {
    if (!dm[p.domain] || !PD.includes(p.domain) || !p.levels.every((l) => AGES.includes(l) || GRADES.includes(l))) return;
    const its = p.items.map((x) => ({ x, it: BYKEY.get(x.k) })).filter((y) => y.it && y.it.lv.some((l) => p.levels.includes(l)));
    if (p.items.some((x) => x.r && !its.some((y) => y.x.k === x.k))) return;
    if (its.length < 3) return;
    SL.push(Object.assign({}, p, { d: dm[p.domain], st: its.map((y) => ({ it: y.it, stage: y.x.s, req: y.x.r, n: (NOTES[p.slug] || {})[y.x.k] || {} })) }));
  });
}
/* ---- القائمة ---- */
function list() {
  const kid = kidLv(), a = SL.filter((p) => (!ST.dom || p.domain === ST.dom) && (!ST.age || p.levels.includes(ST.age)) && (!ST.grade || p.levels.includes(ST.grade)) && (!ST.rev || doneSets(p.slug).rev));
  const chips = DOMS.map((d) => `<button type="button" class="skdom" data-d="${esc(d.slug)}" aria-pressed="${ST.dom === d.slug}" style="--c:${esc(d.color || "#e6dcff")}"><img src="${ROOT}images/ill/${esc(d.icon)}" alt="">${esc(d.name)}</button>`).join("");
  const opt = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const cards = a.map((p) => { const ds = doneSets(p.slug), dn = p.st.filter((r) => stat(r.it.key, ds) === "done").length; return `<article class="skcard" style="--c:${esc(p.d.color || "#c1aef0")}"><h3>${esc(p.name)}</h3><div class="mt"><span>${esc(p.d.name)}</span><span>${esc(lvTxt(p.levels))}</span><span>${AD(p.st.length)} أنشطة</span>${ds.rev ? "<span>للمراجعة المنزلية</span>" : ""}</div><p>${esc(p.skillName)}${p.goalName ? " — " + esc(p.goalName) : ""}</p>${dn ? `<p class="m">أكمل طفلك ${AD(dn)} من ${AD(p.st.length)}.</p>` : ""}<a class="skgo" href="#s=${encodeURIComponent(p.slug)}">ابدأ السلسلة</a></article>`; }).join("");
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>لا توجد سلاسل بهذه الاختيارات الآن</h3><p>لا نعرض سلسلة إلا بعد مراجعتها واكتمال أنشطتها. جرّب عمرًا أو مجالًا آخر.</p></div>`;
  root.innerHTML = `<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر المجال</h2><div class="skdoms">${chips}</div><div class="skf" role="group" aria-label="تصفية السلاسل"><label>العمر<select id="sage">${opt(AGES, ST.age, "كل الأعمار")}</select></label><label>الصف<select id="sgr">${opt(GRADES, ST.grade, "كل الصفوف")}</select></label><label class="ck"><input type="checkbox" id="srv"${ST.rev ? " checked" : ""}>اخترتها للمراجعة المنزلية</label></div>${kid && !ST.age && !ST.grade ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kid])}. اختر عمره أو صفه من التصفية.</p>` : ""}<p class="skhint">${AD(a.length)} سلسلة</p><div class="skgrid">${cards || empty}</div>`;
}
/* ---- صفحة السلسلة ---- */
function sugg(p, ds) {
  const have = new Set(p.st.map((r) => r.it.key)), out = [], seen = new Set();
  SL.filter((q) => q.slug !== p.slug && q.skill === p.skill).forEach((q) => q.st.forEach((r) => { const it = r.it; if (have.has(it.key) || seen.has(it.key) || !it.lv.some((l) => p.levels.includes(l))) return; if (["lib", "acts", "bank", "games", "cards", "quiz", "stories"].includes(it.src)) { seen.add(it.key); out.push(it); } }));
  return out.slice(0, 3);
}
function series(slug) {
  const p = SL.find((x) => x.slug === slug);
  if (!p) { root.innerHTML = `<a class="skback" href="#">← كل السلاسل</a><div class="fzempty"><h3>لم نجد هذه السلسلة</h3><p>قد تكون غير منشورة أو أنشطتها غير جاهزة.</p></div>`; return; }
  const ds = doneSets(slug), sts = p.st.map((r) => stat(r.it.key, ds)), cur = sts.findIndex((x) => !x), all = cur < 0;
  const i = ST.sel[slug] != null && ST.sel[slug] < p.st.length ? ST.sel[slug] : all ? 0 : cur, r = p.st[i], g = STG[r.stage] || ["", "#7a5cd6"], n = r.n || {}, hk = slug + "|" + i;
  const track = p.st.map((x, k) => `${k ? '<span class="srline" aria-hidden="true"></span>' : ""}<button type="button" class="srdot ${sts[k]}${k === cur ? " now" : ""}${k === i ? " sel" : ""}" data-i="${k}" style="--sc:${(STG[x.stage] || ["", "#7a5cd6"])[1]}" aria-label="الخطوة ${AD(k + 1)}: ${esc(x.it.title)}${sts[k] === "done" ? " (منجز)" : sts[k] === "skip" ? " (تم تخطيها)" : k === cur ? " (الحالية)" : ""}"${k === i ? ' aria-current="step"' : ""}><i>${sts[k] === "done" ? "✓" : AD(k + 1)}</i><span>${esc((STG[x.stage] || [""])[0])}</span></button>`).join("");
  const nd = sts.filter((x) => x === "done").length, st = sts[i];
  const detail = `<div class="srcard" style="--sc:${g[1]}" id="srdet"><span class="srtag">${esc(g[0])}</span><span class="srtag" style="background:#6b6b7b">${esc(TYPE[r.it.src] || "نشاط")}</span>${r.req ? "" : '<span class="srtag" style="background:#8a5200">اختياري</span>'}<h3>${esc(r.it.title)}</h3>${n.i ? `<div class="srbox"><b>ماذا نفعل؟</b><br>${esc(n.i)}</div>` : ""}${n.h ? `<button type="button" class="chip" id="srhint" aria-expanded="${!!ST.hint[hk]}">أحتاج تلميحًا</button>${ST.hint[hk] ? `<div class="srbox" role="status"><b>تلميح:</b> ${esc(n.h)}</div>` : ""}` : ""}${n.v ? `<button type="button" class="chip" id="sransw" aria-expanded="${!!ST.ans[hk]}">أرني الإجابة أو طريقة التحقق</button>${ST.ans[hk] ? `<div class="srbox" role="status">${esc(n.v)}</div>` : ""}` : ""}<div class="srbtns"><a href="${url(r.it)}" id="srgo" data-i="${i}">${st === "done" ? "افتحه مرة أخرى" : "ابدأ النشاط"}</a><button type="button" class="alt" id="srprev"${i === 0 ? " disabled" : ""}>النشاط السابق</button><button type="button" class="alt" id="srnext"${i === p.st.length - 1 ? " disabled" : ""}>النشاط التالي</button><button type="button" class="alt" id="srskip">${st === "skip" ? "أعد هذا النشاط إلى السلسلة" : "تخطَّ هذا النشاط"}</button></div>${r.it.src === "bank" ? `<p class="m">يُسجَّل إنجازه تلقائيًا عند إكماله في بنك الأنشطة.</p>` : `<label class="ck"><input type="checkbox" id="srdone"${ds.man.has(r.it.key) ? " checked" : ""}> ولي الأمر: أنهى طفلي هذا النشاط</label>`}${ds.auto.has(r.it.key) ? `<p class="m">مسجّل منجزًا من نشاط الطفل أو خطته على هذا الجهاز.</p>` : ""}</div>`;
  const done = all || sts.every((x) => x) ? (() => { const sg = sugg(p, ds); return `<div class="srbox"><b>أحسنت! أنهيتم هذه السلسلة.</b><br>يمكن ممارسة أي نشاط منها مرة أخرى متى أحببتم.${sg.length ? `<div class="srsug">${sg.map((it) => `<a href="${url(it)}"><small>${esc(TYPE[it.src] || "")}</small>${esc(it.title)}</a>`).join("")}</div>` : ""}</div>`; })() : "";
  const comp = p.st.map((x, k) => ({ x, k, s: sts[k] })).filter((y) => y.s === "done");
  const par = `<details class="srpar"><summary>لولي الأمر</summary><p><b>المهارة:</b> ${esc(p.skillName)}<br><b>الهدف:</b> ${esc(p.goalName || "")}<br><b>الأعمار:</b> ${esc(lvTxt(p.levels))}</p><p><b>ما أكمله طفلك${comp.length ? ` (${AD(comp.length)})` : ""}:</b></p>${comp.length ? `<ul>${comp.map((y) => `<li>${esc(y.x.it.title)} <button type="button" class="chip" data-reopen="${y.k}">افتحه مرة أخرى</button></li>`).join("")}</ul>` : `<p class="m">لا يوجد نشاط مكتمل بعد. سنعرض هنا ما يُسجَّل فعلًا فقط.</p>`}<label class="ck"><input type="checkbox" id="srrev"${ds.rev ? " checked" : ""}> اختر هذه السلسلة للمراجعة المنزلية</label><p class="m">يمكن ممارسة هذه المهارة مرة أخرى في أي وقت. لا نستنتج مستوى ثابتًا لطفلك.</p></details>`;
  root.innerHTML = `<a class="skback" href="#">← كل السلاسل</a><div class="pthcov" style="--c:${esc(p.d.color)}"><img src="${ROOT}images/ill/${esc(p.d.icon)}" alt=""><div><h2>${esc(p.name)}</h2><div class="pthmeta"><span>${esc(p.d.name)}</span><span>${esc(lvTxt(p.levels))}</span><span>${AD(p.st.length)} أنشطة</span></div></div></div>${(p.outcomes || []).length ? `<div class="pthgoal"><h3>ما سيتعلمه طفلك</h3><ul>${p.outcomes.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>` : ""}<div class="pthprog">${nd ? `أكمل طفلك ${AD(nd)} من ${AD(p.st.length)} أنشطة.` : "لم يكمل طفلك نشاطًا من هذه السلسلة بعد."}<div class="bar"><i style="width:${Math.round((nd / p.st.length) * 100)}%"></i></div></div><div class="srtrack" role="group" aria-label="خطوات السلسلة">${track}</div>${detail}${done}${par}<a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`;
  D.title = p.name + " | السلاسل التعليمية | منصة زاد التعليمية";
}
function remember(p, i) { try { sessionStorage.setItem("zad-path-cur", JSON.stringify({ slug: p.slug, name: p.name, i, back: location.href.split("#")[0] + "#s=" + p.slug, list: p.st.map((r) => ({ k: r.it.key, u: url(r.it), t: r.it.title })) })); } catch (e) {} }
const curSlug = () => (decodeURIComponent(location.hash).match(/^#s=(.+)$/) || [])[1];
function route() { const sl = curSlug(); if (sl) series(sl); else { D.title = "السلاسل التعليمية المتدرجة | منصة زاد التعليمية"; list(); } }
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const sl = curSlug(), p = sl && SL.find((x) => x.slug === sl), t = e.target;
    const d = t.closest(".skdom"); if (d) { ST.dom = ST.dom === d.dataset.d ? "" : d.dataset.d; list(); return; }
    if (!p) return;
    const cur = () => { const ds = doneSets(sl), c = p.st.findIndex((r) => !stat(r.it.key, ds)); return c < 0 ? 0 : c; }, sel = () => (ST.sel[sl] != null ? ST.sel[sl] : cur());
    const dot = t.closest(".srdot"); if (dot) { ST.sel[sl] = +dot.dataset.i; series(sl); const f = $('.srdot[aria-current="step"]'); if (f) f.focus(); return; }
    const ro = t.closest("[data-reopen]"); if (ro) { ST.sel[sl] = +ro.dataset.reopen; series(sl); const f = $("#srdet"); if (f) f.scrollIntoView({ block: "start" }); return; }
    if (t.id === "srgo") { remember(p, +t.dataset.i); return; }
    if (t.id === "srhint") { const k = sl + "|" + sel(); ST.hint[k] = !ST.hint[k]; series(sl); return; }
    if (t.id === "sransw") { const k = sl + "|" + sel(); ST.ans[k] = !ST.ans[k]; series(sl); return; }
    if (t.id === "srprev") { ST.sel[sl] = Math.max(0, sel() - 1); series(sl); return; }
    if (t.id === "srnext") { ST.sel[sl] = Math.min(p.st.length - 1, sel() + 1); series(sl); return; }
    if (t.id === "srskip") { const i = sel(), key = p.st[i].it.key, was = stat(key, doneSets(sl)) === "skip"; mark(sl, key, "skip", !was); ST.sel[sl] = was ? i : Math.min(p.st.length - 1, i + 1); delete ST.sel[sl]; series(sl); return; }
  });
  D.addEventListener("change", (e) => {
    const t = e.target, sl = curSlug(), p = sl && SL.find((x) => x.slug === sl);
    if (t.id === "sage") { ST.age = t.value; list(); } if (t.id === "sgr") { ST.grade = t.value; list(); } if (t.id === "srv") { ST.rev = t.checked; list(); }
    if (p && t.id === "srdone") { const i = ST.sel[sl] != null ? ST.sel[sl] : Math.max(0, p.st.findIndex((r) => !stat(r.it.key, doneSets(sl)))); mark(sl, p.st[i].it.key, "done", t.checked); delete ST.sel[sl]; series(sl); }
    if (p && t.id === "srrev") setRev(sl, t.checked);
  });
}
async function init() {
  root = $("#skbody");
  try {
    const [g, sk, nt] = await Promise.all([rpc("paths_public"), rpc("skills_public"), rpc("series_public"), Z.load()]);
    DATA = g; NOTES = nt || {}; if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(sk); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل السلاسل الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="sretry">إعادة المحاولة</button></div>`;
    const b = $("#sretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__seriesTest = { ST, get SL() { return SL; }, doneSets };
init();
})(window);
