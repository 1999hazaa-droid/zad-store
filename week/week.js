/* المهام التعليمية الأسبوعية – زاد: خطط أسبوعية ينشرها مراجع (wplan_public)، وللأسرة نسخة شخصية مرنة على هذا الجهاز: نقل نشاط إلى يوم آخر، ترتيب، حذف من خطتي (لا يحذف المورد)، بديل، تأجيل، إيقاف مؤقت.
   لا إلزام ولا رسائل ذنب. «أكملته» بالضغط فقط؛ فتح النشاط لا يُحسب. الملخص للأسبوع فقط ولا يقيّم قدرات الطفل. الملاحظات تبقى على الجهاز. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INS = (l) => AGES.includes(l) || GRADES.includes(l);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const KIND = { interactive: "نشاط تفاعلي", worksheet: "ورقة عمل", card: "بطاقة تعليمية", story: "قصة قصيرة", game: "لعبة تعليمية", home: "نشاط منزلي", think: "ملاحظة وتفكير", review: "مراجعة قصيرة", integrated: "نشاط شامل", create: "نشاط إبداعي" };
const DOM = { arabic: "اللغة العربية", math: "الرياضيات", think: "الملاحظة والتفكير", sensory: "المهارات البصرية والسمعية", life: "المهارات الحياتية", science: "العلوم والاستكشاف", arts: "الإبداع والفنون", review: "مراجعة المهارات السابقة" };
const KEY = "zad-week-v1";
const ST = { tab: "plans", age: "", grade: "", focus: [] };
let PL = [], SK = [], BYKEY = new Map(), root = null;
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const kidId = () => { const d = lget("zad-learn-v3", null); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const parse = (s) => new Date(s + "T12:00:00");
const nowS = () => (W.__wkNow ? W.__wkNow() : iso(new Date()));
const addDays = (s, n) => { const x = parse(s); x.setDate(x.getDate() + n); return iso(x); };
const weekStart = (s) => { const x = parse(s); x.setDate(x.getDate() - ((x.getDay() + 1) % 7)); return iso(x); };
const todayIdx = () => (parse(nowS()).getDay() + 1) % 7;
const dateLabel = (ws) => { try { return parse(ws).toLocaleDateString("ar", { day: "numeric", month: "long" }); } catch (e) { return ws; } };
function db() { const s = lget(KEY, { kids: {} }); s.kids = s.kids || {}; const k = (s.kids[kidId()] = s.kids[kidId()] || {}); k.plans = k.plans || {}; k.lv = k.lv || ""; return [s, k]; }
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
const pst = (slug, ws, create) => { const [s, k] = db(), id = slug + "@" + ws; let p = k.plans[id]; if (!p && create) p = k.plans[id] = { ov: {}, rm: [], alt: [], done: {}, post: {}, paused: false, notes: "", t: Date.now() }; return [s, p, k, id]; };
function prep(skj, pj) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  SK = skj.skills || [];
  PL = (pj.items || []).filter((p) => p.levels.every(INS)).map((p) => {
    const es = (p.entries || []).map((e, i) => { const it = BYKEY.get(e.item); if (!it || !KIND[e.kind] || !DOM[e.domain] || !it.lv.some((l) => p.levels.includes(l))) return null; const sk = SK.find((s) => s.slug === e.skill); if (!sk) return null; const alt = e.alt && BYKEY.get(e.alt) && BYKEY.get(e.alt).lv.some((l) => p.levels.includes(l)) ? BYKEY.get(e.alt) : null; return { key: p.slug + "|" + e.item, day: e.day, pos: i, t: e.t, d: e.d || "", kind: e.kind, domain: e.domain, it, alt, sk }; }).filter(Boolean);
    return es.length ? Object.assign({}, p, { es }) : null;
  }).filter(Boolean);
}
const curLv = () => ST.age || ST.grade || db()[1].lv || kidLv();
const setLv = (v) => { const [s, k] = db(); k.lv = v || ""; save(s); };
function eff(p, st, e) { const o = (st && st.ov[e.key]) || {}; return { day: o.day != null ? o.day : e.day, pos: o.pos != null ? o.pos : e.pos }; }
function layout(p, ws, create) {
  const [, st] = pst(p.slug, ws, create), by = DAYS.map(() => []), removed = [];
  p.es.forEach((e) => { if (st && st.rm.includes(e.key)) { removed.push(e); return; } if (ST.focus.length && !ST.focus.includes(e.sk.slug)) return; const x = eff(p, st, e); by[x.day].push({ e, pos: x.pos }); });
  by.forEach((a) => a.sort((a1, b1) => a1.pos - b1.pos || a1.e.pos - b1.e.pos));
  return { st, by: by.map((a) => a.map((x) => x.e)), removed };
}
const doneIn = (st, key, ws) => ((st && st.done[key]) || []).filter((x) => x.d >= ws && x.d <= addDays(ws, 6));
function summary(p, ws) {
  const [, st] = pst(p.slug, ws, false); if (!st) return null;
  const act = p.es.filter((e) => !st.rm.includes(e.key)), dn = act.filter((e) => doneIn(st, e.key, ws).length), redo = act.filter((e) => doneIn(st, e.key, ws).length > 1), post = act.filter((e) => (st.post[e.key] || 0) > 0);
  return { total: act.length, done: dn, redo, post, skills: [...new Set(dn.map((e) => e.sk.name))] };
}
function card(p, ws, e, st, readonly) {
  const dn = doneIn(st, e.key, ws).length, useAlt = st && st.alt.includes(e.key) && e.alt, it = useAlt ? e.alt : e.it, pn = (st && st.post[e.key]) || 0, x = eff(p, st, e);
  return `<article class="tkcard" data-k="${esc(e.key)}"><img src="${ROOT}images/ill/${e.domain === "math" ? "numbers.svg" : e.domain === "arabic" ? "book.svg" : e.domain === "life" ? "heart.svg" : e.domain === "arts" ? "palette.svg" : e.domain === "science" ? "microscope.svg" : e.domain === "review" ? "clock.svg" : "brain.svg"}" alt=""><div><h3>${esc(e.t)}</h3>${e.d ? `<p>${esc(e.d)}</p>` : ""}<div class="mt"><span>${esc(KIND[e.kind])}</span><span>${esc(e.sk.name)}</span><span>${esc(DAYS[x.day])}</span>${useAlt ? "<span>نشاط بديل</span>" : ""}${pn ? `<span>أُجّل ${AD(pn)} ${pn === 1 ? "مرة" : "مرات"}</span>` : ""}${dn ? `<span class="ok">أكملته ${AD(dn)} ${dn === 1 ? "مرة" : "مرات"} هذا الأسبوع</span>` : ""}</div></div><div class="tkact"><a href="${url(it)}" data-a="start">ابدأ النشاط</a><button type="button" data-a="done">${dn ? "أكملته مرة أخرى" : "أكملته"}</button>${dn ? `<button type="button" class="alt" data-a="undo">تراجع</button>` : ""}${e.alt ? `<button type="button" class="alt" data-a="alt">${useAlt ? "العودة إلى الأصلي" : "اختيار نشاط بديل"}</button>` : ""}</div><div class="tkact wkmv"><label>نقل إلى <select data-a="mv" aria-label="نقل النشاط إلى يوم آخر">${DAYS.map((d, i) => `<option value="${i}"${i === x.day ? " selected" : ""}>${d}</option>`).join("")}</select></label><button type="button" class="alt" data-a="up" aria-label="تقديم">↑</button><button type="button" class="alt" data-a="dn" aria-label="تأخير">↓</button><button type="button" class="alt" data-a="post"${x.day >= 6 ? " disabled" : ""}>أؤجله إلى اليوم التالي</button><button type="button" class="alt" data-a="rm">أحذفه من خطتي</button></div></article>`;
}
const empty = (h, p) => `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>${h}</h3><p>${p}</p></div>`;
function tabs() { const L = { plans: "الخطط", mine: "خطتي هذا الأسبوع", past: "الأسابيع السابقة" }; return `<div class="tktabs" role="group" aria-label="أقسام الخطة">${Object.keys(L).map((k) => `<button type="button" data-tab="${k}" aria-pressed="${ST.tab === k}">${L[k]}</button>`).join("")}</div>`; }
function lvSel() { const opt = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join(""); const lv = curLv(); return `<div class="skf" role="group" aria-label="عمر الطفل أو صفه"><label>العمر<select id="wage">${opt(AGES, ST.age || (AGES.includes(lv) && !ST.grade ? lv : ""), "اختر العمر")}</select></label><label>الصف<select id="wgr">${opt(GRADES, ST.grade || (GRADES.includes(lv) && !ST.age ? lv : ""), "اختر الصف")}</select></label></div>`; }
function par() { return `<details class="srpar"><summary>لولي الأمر</summary><p>الخطة اقتراح مرن وليست جدولًا إلزاميًا: انقل الأنشطة بين الأيام أو احذف ما لا يناسبكم من خطتكم دون حذف أي مورد من المكتبة، واختر النشاط البديل عند توفره. يمكنكم إيقاف الخطة مؤقتًا في أي وقت، والبدء بنشاط جديد دون إكمال ما سبق.</p><p>«أكملته» يُسجَّل على هذا الجهاز عند ضغطه فقط، ولا يدل على إتقان، والملخص الأسبوعي لا يقيّم قدرات الطفل. لا نطلب أي بيانات شخصية. <a href="${ROOT}plan/">خطتي التعليمية (اقتراحات تلقائية)</a> · <a href="${ROOT}tasks/">المهام اليومية</a> · <a href="${ROOT}review/">مراجعة المهارات</a> · <a href="${ROOT}paths/">المسارات</a> · <a href="${ROOT}reports/">متابعة تقدم الطفل</a></p></details><a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`; }
function home() {
  const lv = curLv(), ws0 = weekStart(nowS()); let body = "";
  if (ST.tab === "plans") {
    if (!lv) body = empty("اختر عمر طفلك أو صفه", "نعرض لك الخطط الأسبوعية المناسبة. لا إلزام ولا جدول صارم.");
    else { const a = PL.filter((p) => p.levels.includes(lv)); body = `<p class="skhint">${AD(a.length)} خطة</p><div class="skgrid">${a.map((p) => `<article class="skcard"><h3>${esc(p.title)}</h3><div class="mt"><span>${esc(lvTxt(p.levels))}</span><span>${AD(p.es.length)} أنشطة</span></div><p class="m">${esc(p.goals)}</p><p class="m">${esc([...new Set(p.es.map((e) => e.sk.name))].join("، "))}</p><a class="skgo" href="#s=${encodeURIComponent(p.slug)}">افتح الخطة</a></article>`).join("") || empty("لا توجد خطط لهذا العمر الآن", "ننشر الخطط بعد مراجعتها. يمكنك فتح <a href=\"" + ROOT + "plan/\">خطتي التعليمية</a> أو <a href=\"" + ROOT + "library/\">المكتبة</a>.")}</div>`; }
  } else if (ST.tab === "mine") {
    const a = PL.filter((p) => pst(p.slug, ws0, false)[1]);
    body = a.length ? `<div class="skgrid">${a.map((p) => { const sm = summary(p, ws0); return `<article class="skcard"><h3>${esc(p.title)}</h3><p class="m">${sm.done.length ? `أكملت ${AD(sm.done.length)} من ${AD(sm.total)} هذا الأسبوع.` : "لم تُكمل شيئًا بعد، وهذا طبيعي."}</p><a class="skgo" href="#s=${encodeURIComponent(p.slug)}">افتح خطتي</a></article>`; }).join("")}</div>` : empty("لم تبدأ خطة هذا الأسبوع", "افتح أي خطة وغيّر فيها ما شئت، فتصبح خطتك لهذا الأسبوع.");
  } else {
    const [, k] = db(), rows = Object.keys(k.plans).map((id) => { const [slug, ws] = id.split("@"); return { slug, ws, p: PL.find((x) => x.slug === slug) }; }).filter((r) => r.p && r.ws < ws0).sort((a, b) => (a.ws < b.ws ? 1 : -1)).slice(0, 12);
    body = rows.length ? `<div class="skgrid">${rows.map((r) => { const sm = summary(r.p, r.ws); return `<article class="skcard"><h3>${esc(r.p.title)}</h3><p class="m">أسبوع ${esc(dateLabel(r.ws))}: ${sm.done.length ? `أكملت ${AD(sm.done.length)} من ${AD(sm.total)}.` : "بلا أنشطة مكتملة."}</p><a class="skgo" href="#s=${encodeURIComponent(r.p.slug)}&w=${r.ws}">افتح ذلك الأسبوع</a></article>`; }).join("")}</div>` : empty("لا توجد أسابيع سابقة بعد", "ستظهر هنا الخطط التي بدأتها في أسابيع ماضية على هذا الجهاز.");
  }
  root.innerHTML = `${tabs()}${ST.tab === "plans" ? lvSel() : ""}${body}${par()}`;
}
function detail(slug, wsq) {
  const p = PL.find((x) => x.slug === slug);
  if (!p) { root.innerHTML = `<a class="skback" href="#">← كل الخطط</a>${empty("لم نجد هذه الخطة", "قد تكون غير منشورة.")}`; return; }
  const ws = wsq || weekStart(nowS()), cur = ws === weekStart(nowS()), L = layout(p, ws, false), st = L.st, sm = summary(p, ws), ti = todayIdx();
  const skills = [...new Map(p.es.map((e) => [e.sk.slug, e.sk.name])).entries()];
  const days = DAYS.map((d, i) => `<section class="wkday${cur && i === ti ? " today" : ""}" aria-label="${d}"><h3>${d}${cur && i === ti ? "<small>اليوم</small>" : ""}</h3>${L.by[i].map((e) => card(p, ws, e, st)).join("") || '<p class="em">يوم حر، لا أنشطة مقترحة.</p>'}</section>`).join("");
  root.innerHTML = `<a class="skback" href="#">← كل الخطط</a><div class="pthcov"><img src="${ROOT}images/ill/clock.svg" alt=""><div><h2>${esc(p.title)}</h2><div class="pthmeta"><span>${esc(lvTxt(p.levels))}</span><span>أسبوع ${esc(dateLabel(ws))}</span></div></div></div><div class="pthgoal"><h3>أهداف الأسبوع</h3><p>${esc(p.goals)}</p></div>
  <p class="skhint">اختر المهارات التي تريد التركيز عليها (اختياري):</p><div class="skdoms">${skills.map(([sl, nm]) => `<button type="button" class="skdom" data-f="${esc(sl)}" aria-pressed="${ST.focus.includes(sl)}">${esc(nm)}</button>`).join("")}</div>
  ${st && st.paused ? `<div class="wkpause" role="status">الخطة متوقفة مؤقتًا. يمكنك المتابعة في أي وقت دون أي مشكلة. <button type="button" class="chip" id="wresume">استئناف الخطة</button></div>` : `<div class="srbtns"><button type="button" class="alt" id="wpause">إيقاف الخطة مؤقتًا</button></div>`}
  ${days}
  ${L.removed.length ? `<h3 class="skstage">أنشطة حذفتها من خطتي</h3><p class="skhint">لم تُحذف من المكتبة. يمكنك إعادتها.</p>${L.removed.map((e) => `<p>${esc(e.t)} <button type="button" class="chip" data-r="${esc(e.key)}">إعادة إلى خطتي</button></p>`).join("")}` : ""}
  ${sm ? `<div class="wksum" role="status"><b>ملخص هذا الأسبوع</b><br>${sm.done.length ? `أكملت ${AD(sm.done.length)} من ${AD(sm.total)} نشاطًا.<div class="wkbar"><i style="width:${Math.round((sm.done.length / sm.total) * 100)}%"></i></div>` : "لم تُكمل أنشطة بعد، ويمكنك البدء بما تشاء."}${sm.skills.length ? `<br>مهارات مارستها: ${esc(sm.skills.join("، "))}` : ""}${sm.redo.length ? `<br>أنشطة أعدتها: ${esc(sm.redo.map((e) => e.t).join("، "))}` : ""}${sm.post.length ? `<br>أنشطة أجّلتها: ${esc(sm.post.map((e) => e.t).join("، "))}` : ""}<br><small>هذا ملخص لأسبوع واحد فقط ولا يقيّم قدرات الطفل.</small></div>` : ""}
  <h3 class="skstage">ملاحظات ولي الأمر</h3><textarea id="wnotes" aria-label="ملاحظات ولي الأمر" placeholder="اكتب ما تريد تذكره. تبقى على هذا الجهاز فقط.">${esc((st && st.notes) || "")}</textarea>${par()}`;
  D.title = p.title + " | الخطة الأسبوعية | منصة زاد التعليمية";
}
const route0 = () => { const m = decodeURIComponent(location.hash).match(/^#s=([^&]+)(?:&w=(\d{4}-\d\d-\d\d))?$/); return m ? { slug: m[1], ws: m[2] || "" } : null; };
function route() { const r = route0(); if (r) detail(r.slug, r.ws); else { D.title = "المهام التعليمية الأسبوعية | منصة زاد التعليمية"; home(); } }
const redraw = () => { const r = route0(); if (r) detail(r.slug, r.ws); else home(); };
function act(a, key, val) {
  const r = route0(), slug = r.slug, ws = r.ws || weekStart(nowS()), [s, st] = pst(slug, ws, true), p = PL.find((x) => x.slug === slug), e = p.es.find((x) => x.key === key), x = eff(p, st, e);
  if (a === "done") { (st.done[key] = st.done[key] || []).push({ d: nowS(), t: Date.now() }); }
  else if (a === "undo") { const l = st.done[key] || []; l.pop(); if (!l.length) delete st.done[key]; }
  else if (a === "alt") { st.alt = st.alt.includes(key) ? st.alt.filter((k) => k !== key) : st.alt.concat(key); }
  else if (a === "rm") { if (!st.rm.includes(key)) st.rm.push(key); }
  else if (a === "mv") { st.ov[key] = { day: +val, pos: 99 }; }
  else if (a === "post") { if (x.day < 6) { st.ov[key] = { day: x.day + 1, pos: 99 }; st.post[key] = (st.post[key] || 0) + 1; } }
  else if (a === "up" || a === "dn") {
    const same = p.es.filter((o) => !st.rm.includes(o.key) && eff(p, st, o).day === x.day).sort((a1, b1) => eff(p, st, a1).pos - eff(p, st, b1).pos || a1.pos - b1.pos), i = same.findIndex((o) => o.key === key), j = a === "up" ? i - 1 : i + 1;
    if (j >= 0 && j < same.length) { const arr = same.slice(); [arr[i], arr[j]] = [arr[j], arr[i]]; arr.forEach((o, n) => { st.ov[o.key] = { day: x.day, pos: n }; }); }
  }
  save(s);
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const t = e.target, tb = t.closest("[data-tab]"), f = t.closest("[data-f]"), a = t.closest("button[data-a], a[data-a]"), rs = t.closest("[data-r]");
    if (tb) { ST.tab = tb.dataset.tab; if (route0()) location.hash = ""; else home(); return; }
    if (f) { const v = f.dataset.f; ST.focus = ST.focus.includes(v) ? ST.focus.filter((x) => x !== v) : ST.focus.concat(v); redraw(); return; }
    if (t.id === "wpause" || t.id === "wresume") { const r = route0(), [s, st] = pst(r.slug, r.ws || weekStart(nowS()), true); st.paused = t.id === "wpause"; save(s); redraw(); return; }
    if (rs) { const r = route0(), [s, st] = pst(r.slug, r.ws || weekStart(nowS()), true); st.rm = st.rm.filter((k) => k !== rs.dataset.r); save(s); redraw(); return; }
    if (a && a.dataset.a && !["start", "mv"].includes(a.dataset.a)) { act(a.dataset.a, a.closest("[data-k]").dataset.k); redraw(); }
  });
  D.addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "wage") { ST.age = t.value; ST.grade = ""; setLv(t.value); home(); }
    if (t.id === "wgr") { ST.grade = t.value; ST.age = ""; setLv(t.value); home(); }
    if (t.dataset && t.dataset.a === "mv") { act("mv", t.closest("[data-k]").dataset.k, t.value); redraw(); }
    if (t.id === "wnotes") { const r = route0(), [s, st] = pst(r.slug, r.ws || weekStart(nowS()), true); st.notes = t.value.slice(0, 600); save(s); }
  });
}
async function init() {
  root = $("#skbody");
  try {
    const [pj, skj] = await Promise.all([rpc("wplan_public"), rpc("skills_public"), Z.load()]);
    if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(skj, pj); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل الخطط الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="wretry">إعادة المحاولة</button></div>`;
    const b = $("#wretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__wkTest = { ST, get PL() { return PL; } };
init();
})(window);
