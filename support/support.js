/* مركز دعم التعلم والتدريب الإضافي – زاد: يجمع مهارات موجودة فعلًا في ست مجموعات دعم، ويعرض أنشطتها المنشورة بمستويات مرنة.
   بيانات حقيقية من support_public + skills_public + فهرس البحث. لا تصنيف للطفل، ولا نسب إتقان، ولا مؤقت، ولا خصم نقاط. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INSCOPE = (l) => AGES.includes(l) || GRADES.includes(l);
const STG = [["recognize", "نبدأ بتمهيد بسيط", "نتعرّف على الفكرة أو نشاهد ونقرأ شرحًا قصيرًا"], ["practice", "أنشطة للتدريب", "نختار منها ما نحب ونعود إليها لاحقًا"], ["apply", "نشاط إضافي إن أحببنا", "نجرّب المهارة في موقف جديد"], ["review", "مراجعة قصيرة", "نراجع بهدوء، ويمكن إعادة المحاولة"]];
const SUP = { easy: ["دعم بسيط", "أنشطة أبسط في الغالب، لنبدأ بثقة."], mid: ["دعم تدريبي", "أنشطة للتدريب المتكرر على المهارة."], adv: ["تحدٍ إضافي", "أنشطة أوسع لمن يحب التجربة."] };
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const ADDABLE = ["acts", "bank", "proj", "life", "ready", "val", "exp", "vid", "songs", "stories", "quiz"];
const ST = { lv: "", sup: "" };
let DATA = null, SKD = null, BYKEY = new Map(), LINKS = new Map(), SKB = new Map(), GR = [], GOALS = [], root = null;
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; if (lv.length === 1) return Z.LVN[lv[0]]; return Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const kidId = () => { const d = lget("zad-learn-v3", null); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
/* ---- سجل اختياري على هذا الجهاز: مهارات اخترتها + أنشطة أريد العودة إليها ---- */
const store = () => { const s = lget("zad-support-v1", { kids: {} }); s.kids = s.kids || {}; const k = s.kids[kidId()] = s.kids[kidId()] || { skills: [], back: [] }; k.skills = k.skills || []; k.back = k.back || []; return [s, k]; };
function toggle(list, v, on) { const a = new Set(store()[1][list]); if (on) a.add(v); else a.delete(v); const [s, k] = store(); k[list] = [...a]; try { localStorage.setItem("zad-support-v1", JSON.stringify(s)); return true; } catch (e) { return false; } }
const chosen = (slug) => store()[1].skills.includes(slug), backed = (key) => store()[1].back.includes(key);
function usage() {
  const rc = lget("zad-recent-v1", null), kid = kidId(), opened = (rc && rc.kids && rc.kids[kid] && rc.kids[kid].items) || {}, done = new Set();
  const d = lget("zad-learn-v3", null), k = d && d.kids && d.kids[kid], ws = (k && k.plan && k.plan.weeks) || {};
  Object.keys(ws).forEach((w) => (ws[w].items || []).forEach((i) => { if (i.st === "done") done.add(i.key); }));
  return { opened, done };
}
function prep() {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  const sk = Object.fromEntries((SKD.skills || []).map((s) => [s.slug, s])), id2 = Object.fromEntries((SKD.skills || []).map((s) => [s.id, s]));
  SKB = new Map(); (SKD.skills || []).forEach((s) => { if (s.levels.some(INSCOPE)) SKB.set(s.slug, s); });
  LINKS = new Map();
  (SKD.links || []).forEach((l) => { const it = BYKEY.get(l.k); if (!it) return; if (!LINKS.has(l.s)) LINKS.set(l.s, []); LINKS.get(l.s).push({ it, stage: l.g, role: l.r, ord: l.o || 0 }); });
  const dm = Object.fromEntries((SKD.domains || []).map((d) => [d.slug, d]));
  GR = (DATA.groups || []).map((g) => Object.assign({}, g, { sk: (DATA.gs || []).filter((x) => x.g === g.slug && sk[x.s] && SKB.has(x.s)).sort((a, b) => a.o - b.o).map((x) => Object.assign({}, sk[x.s], { d: dm[sk[x.s].domain] || {} })) }));
  void id2;
}
const diffOf = (it) => (DATA.diff || {})[it.key] || "";
const FEAT = { intro: "تعليمات ومثال قبل البدء", retry: "يمكن إعادة المحاولة", why: "يشرح الإجابة بعد المحاولة", say: "فيه قراءة صوتية للأسئلة" };
/* «intro» يخص أنشطة بنك الأنشطة التفاعلية فقط: صفحتها تعرض التعليمات ومثالًا قبل زر «ابدأ النشاط» (تحقّق منه اختبار المحرك) */
const featOf = (it) => (((DATA.feat || {})[it.key] || []).concat(it.key.startsWith("bank:") && ((DATA.feat || {})[it.key] || []).includes("retry") ? ["intro"] : [])).filter((f) => FEAT[f]).map((f) => `<span>${FEAT[f]}</span>`).join("");
/* الموارد المرئية لمهارة: منشورة ومتقاطعة العمر مع المهارة، وضمن المرحلة المختارة، ولا تتجاوز الصف الرابع */
function res(s) {
  return (LINKS.get(s.id) || []).filter((l) => {
    const it = l.it; if (!it.lv.some((x) => s.levels.includes(x) && INSCOPE(x))) return false;
    if (ST.lv && !(it.lv.includes(ST.lv) && s.levels.includes(ST.lv))) return false;
    if (ST.sup && diffOf(it) !== ST.sup) return false;
    return true;
  }).sort((a, b) => STG.findIndex((x) => x[0] === a.stage) - STG.findIndex((x) => x[0] === b.stage) || a.ord - b.ord || a.it.title.localeCompare(b.it.title, "ar"));
}
const badge = (it) => it.src === "pack" ? "" : it.paid ? `<span class="pd">مدفوع${it.price ? " · " + esc(money(it.price)) : ""}</span>` : `<span class="fr">مجاني</span>`;
const nSk = (g) => g.sk.filter((s) => res(s).length).length;
function levelBar() {
  const opts = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.filter(INSCOPE).map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const kid = kidLv();
  return `<div class="skf" role="group" aria-label="اختيار العمر أو الصف"><label>عمر الطفل أو صفه<select id="suplv">${opts}</select></label></div>${kid && !ST.lv ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kid])}. اختر عمره من القائمة لنعرض الأنشطة المناسبة له.</p>` : ""}`;
}
function supBar() {
  return `<div class="suplv" role="group" aria-label="مستوى النشاط"><button type="button" data-sup="" aria-pressed="${ST.sup === ""}">كل الأنشطة</button>${Object.entries(SUP).map(([k, v]) => `<button type="button" data-sup="${k}" aria-pressed="${ST.sup === k}">${v[0]}</button>`).join("")}</div><p class="supnote">اختر ما يناسب اليوم وغيّره في أي وقت: <b>دعم بسيط</b> للبدء بثقة، <b>دعم تدريبي</b> لمزيد من التدريب، <b>تحدٍ إضافي</b> لمن يحب التجربة. هذه خيارات للأنشطة وليست وصفًا للطفل، وتعتمد على تصنيف مستوى كل نشاط عندنا.</p>`;
}
/* ---------- القائمة: المجموعات الست + سجلي ---------- */
function list() {
  D.title = "مركز دعم التعلم والتدريب الإضافي | منصة زاد التعليمية";
  const cards = GR.map((g) => `<a class="supg" href="#g=${esc(g.slug)}" style="--c:${esc(g.color)}" aria-label="${esc(g.name)}"><img src="${ROOT}images/ill/${esc(g.icon)}" alt=""><b>${esc(g.name)}</b><span>${esc(g.descr)}</span><small>${AD(nSk(g))} مهارة فيها أنشطة</small></a>`).join("");
  const ok = GR.filter((g) => nSk(g) > 0);
  root.innerHTML = `<a class="supback" href="${ROOT}library/">→ العودة إلى المكتبة</a>${levelBar()}<h2 class="skhint" style="font-size:17px;margin:12px 0 0;color:var(--z-pri,#5b2bb8)">ما الذي تحب أن نقوّيه اليوم؟</h2>${GR.length ? `<div class="supgroups">${cards}</div>` : `<div class="fzempty"><h3>لا توجد مجموعات الآن</h3><p>سنعرضها هنا عند إتاحتها.</p></div>`}${ok.length === 0 && GR.length ? `<div class="fzempty"><h3>لا أنشطة بهذا العمر</h3><p>جرّب اختيار عمر أو صف آخر.</p></div>` : ""}${logBox()}`;
}
/* عدد مرات إكمال أنشطة بنك الأنشطة: يسجّله البنك فعلًا على الجهاز (S.bank.done[slug].d)؛ لا نعرض عدد الأخطاء */
function bankDone() { const d = lget("zad-learn-v3", null), k = d && d.kids && d.kids[kidId()], m = (k && k.bank && k.bank.done) || {}, r = {}; Object.keys(m).forEach((sl) => { if (m[sl] && m[sl].d > 0) r["bank:" + sl] = m[sl].d; }); return r; }
function logBox() {
  const u = usage(), [, k] = store(), all = new Set(); GR.forEach((g) => g.sk.forEach((s) => (LINKS.get(s.id) || []).forEach((l) => all.add(l.it.key))));
  const opened = Object.keys(u.opened).filter((x) => all.has(x) && BYKEY.get(x)).sort((a, b) => (u.opened[b].at || 0) - (u.opened[a].at || 0)).slice(0, 5);
  const doneN = [...u.done].filter((x) => all.has(x)).length;
  const skills = k.skills.map((sl) => SKB.get(sl)).filter(Boolean), back = k.back.map((x) => BYKEY.get(x)).filter(Boolean);
  const bd = bankDone(), again = Object.keys(bd).filter((x) => bd[x] >= 2 && all.has(x) && BYKEY.get(x));
  const redo = []; GR.forEach((g) => g.sk.forEach((s) => { if (!redo.includes(s) && (LINKS.get(s.id) || []).some((l) => again.includes(l.it.key))) redo.push(s); }));
  const none = !opened.length && !doneN && !skills.length && !back.length && !again.length;
  return `<div class="suplog" id="suplog"><h3>سجلي الاختياري (على هذا الجهاز)</h3>${none ? "<p>لا يوجد شيء هنا بعد. عندما تختار مهارة أو تفتح نشاطًا أو تحفظ نشاطًا للعودة إليه سيظهر هنا. نعرض عدد مرات إكمال أنشطة بنك الأنشطة فقط لأنه يسجّلها.</p>" : `${skills.length ? `<b>مهارات اخترت التدريب عليها</b><ul>${skills.map((s) => `<li><a href="#s=${esc(s.slug)}">${esc(s.name)}</a></li>`).join("")}</ul>` : ""}${opened.length ? `<b>أنشطة فتحتها مؤخرًا</b><ul>${opened.map((x) => `<li><a href="${esc(url(BYKEY.get(x)))}">${esc(BYKEY.get(x).title)}</a></li>`).join("")}</ul>` : ""}${back.length ? `<b>أنشطة أريد العودة إليها</b><ul>${back.map((it) => `<li><a href="${esc(url(it))}">${esc(it.title)}</a></li>`).join("")}</ul>` : ""}${again.length ? `<b>أنشطة أعدتها أكثر من مرة</b><ul>${again.map((x) => `<li><a href="${esc(url(BYKEY.get(x)))}">${esc(BYKEY.get(x).title)}</a> — أكملتها ${AD(bd[x])} مرات</li>`).join("")}</ul>` : ""}${redo.length ? `<b>مهارات أعدت التدريب عليها</b><ul>${redo.map((s) => `<li><a href="#s=${esc(s.slug)}">${esc(s.name)}</a></li>`).join("")}</ul>` : ""}${doneN ? `<p>أنشطة أكملتها في الخطة: ${AD(doneN)}.</p>` : ""}<p class="skhint">فتح النشاط أو إكماله لا يعني إتقان المهارة، ولا نصنّف الطفل بناءً عليه.</p>`}</div>`;
}
/* ---------- صفحة المجموعة ---------- */
function group(slug) {
  const g = GR.find((x) => x.slug === slug);
  if (!g) { root.innerHTML = `<a class="supback" href="#">→ كل المجموعات</a><div class="fzempty"><h3>لم نجد هذه المجموعة</h3><p>قد تكون مخفية مؤقتًا.</p></div>`; return; }
  D.title = g.name + " | دعم التعلم | منصة زاد التعليمية";
  const sks = g.sk.map((s) => ({ s, n: res(s).length })).filter((x) => x.n > 0);
  const cards = sks.map(({ s, n }) => `<article class="skcard" style="--c:${esc(g.color)}"><h3>${esc(s.name)}</h3><div class="mt"><span>${esc(lvTxt(s.levels.filter(INSCOPE)))}</span><span>${AD(n)} نشاط</span></div>${s.descr ? `<p>${esc(s.descr)}</p>` : ""}<a class="go" href="#g=${esc(g.slug)}&s=${esc(s.slug)}" aria-label="ابدأ التدريب: ${esc(s.name)}">اختر هذه المهارة</a></article>`).join("");
  root.innerHTML = `<a class="supback" href="#">→ كل المجموعات</a><div class="sktitle"><img src="${ROOT}images/ill/${esc(g.icon)}" alt=""><div><h2>${esc(g.name)}</h2><p class="skhint">${esc(g.descr)}</p></div></div>${levelBar()}${supBar()}<p class="skhint" role="status" id="supn">${AD(sks.length)} مهارة فيها أنشطة</p>${sks.length ? `<div class="skgrid">${cards}</div>` : `<div class="fzempty"><h3>لا أنشطة بهذه الاختيارات</h3><p>جرّب كل الأعمار أو كل الأنشطة.</p></div>`}`;
}
/* ---------- صفحة المهارة (التدريب) ---------- */
function planBox(rs) {
  const lv = kidLv(), t = S.iso(new Date()), ws = S.weekStart(t);
  const ok = lv ? rs.filter((l) => l.it.lv.includes(lv) && ADDABLE.includes(l.it.src)) : [];
  if (!lv) return `<div class="skplan"><b>أضف نشاطًا قصيرًا إلى خطة الطفل</b><p class="m bad">اختر عمر طفلك أو صفه أولًا من صفحة خطتي.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  if (!ok.length) return `<div class="skplan"><b>أضف نشاطًا قصيرًا إلى خطة الطفل</b><p class="m bad">لا يوجد نشاط يناسب مستوى طفلك الحالي (${esc(Z.LVN[lv])}) ويمكن إضافته إلى الخطة.</p></div>`;
  const opts = DAYS.map((n, i) => { const d = S.addDays(ws, i), dd = S.parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  return `<div class="skplan" id="supplan"><b>أضف نشاطًا قصيرًا إلى خطة الطفل (${esc(Z.LVN[lv])})</b>${ok.slice(0, 8).map((l, i) => `<label class="ck"><input type="checkbox" data-k="${esc(l.it.key)}"${i === 0 ? " checked" : ""}> ${esc(l.it.title)}</label>`).join("")}<label>اليوم من هذا الأسبوع <select id="supday">${opts}</select></label><div><button type="button" id="supadd">إضافة المحدد إلى الخطة</button></div><p class="m">الإضافة تنظّم الوقت فقط، ولا يلزم إكمال كل الأنشطة في جلسة واحدة.</p><p class="m" id="supmsg" role="status"></p></div>`;
}
function skill(gslug, slug) {
  const g = GR.find((x) => x.slug === gslug), s = g && g.sk.find((x) => x.slug === slug);
  if (!s) { root.innerHTML = `<a class="supback" href="#">→ كل المجموعات</a><div class="fzempty"><h3>لم نجد هذه المهارة</h3><p>قد تكون مخفية مؤقتًا.</p></div>`; return; }
  D.title = s.name + " | دعم التعلم | منصة زاد التعليمية";
  const rs = res(s), un = (LINKS.get(s.id) || []).filter((l) => l.it.lv.some((x) => s.levels.includes(x)) && !diffOf(l.it)).length;
  const by = (k) => rs.filter((l) => l.stage === k);
  const one = (l) => { const d = diffOf(l.it); return `<div class="supres"><b>${esc(l.it.title)}</b><div class="mt">${l.it.ct ? `<span>${esc(Z.CT[l.it.ct] || "")}</span>` : ""}<span>${esc(lvTxt(l.it.lv.filter(INSCOPE)))}</span>${d ? `<span>${SUP[d][0]}</span>` : ""}${featOf(l.it)}${badge(l.it)}</div><a href="${esc(url(l.it))}" aria-label="${l.it.paid ? "عرض المعاينة" : "ابدأ"}: ${esc(l.it.title)}">${l.it.paid ? "عرض المعاينة" : "ابدأ"}</a><button type="button" class="supbk" data-k="${esc(l.it.key)}" aria-pressed="${backed(l.it.key)}">${backed(l.it.key) ? "♥ سأعود إليه" : "♡ أريد العودة إليه"}</button></div>`; };
  const sec = STG.map((st) => { const a = by(st[0]); return a.length ? `<h3 class="skstage">${st[1]} <small>${st[2]}</small></h3>${a.map(one).join("")}` : ""; }).join("");
  const outs = GOALS.filter((x) => x.skill === s.slug).flatMap((x) => x.outcomes || []).slice(0, 4);
  const lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.filter((l) => s.levels.includes(l) && INSCOPE(l)).map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const rel = (SKD.skills || []).length ? `<p class="skhint"><a href="${ROOT}skills/#s=${esc(s.slug)}">كل موارد هذه المهارة في «ابحث حسب المهارة»</a>${PATHS.filter((p) => p.skill === s.slug).slice(0, 3).map((p) => ` · <a href="${ROOT}paths/#p=${esc(p.slug)}">${esc(p.name)}</a>`).join("")}</p>` : "";
  root.innerHTML = `<a class="supback" href="#g=${esc(g.slug)}">→ ${esc(g.name)}</a><div class="sktitle"><img src="${ROOT}images/ill/${esc(g.icon)}" alt=""><div><h2>${esc(s.name)}</h2><div class="mt skcard" style="border:0;box-shadow:none;padding:0"><div class="mt"><span>${esc(lvTxt(s.levels.filter(INSCOPE)))}</span><span>${esc(g.name)}</span></div></div></div></div>${s.descr ? `<p><b>ما الذي سنتدرب عليه؟</b> ${esc(s.descr)}</p>` : ""}${outs.length ? `<div class="supnote"><b>بعد التدريب قد يستطيع الطفل أن:</b><ul style="margin:4px 0;padding-inline-start:22px">${outs.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>` : ""}<button type="button" class="supchoose" id="supchoose" aria-pressed="${chosen(s.slug)}">${chosen(s.slug) ? "✓ اخترنا التدريب على هذه المهارة" : "أريد التدريب على هذه المهارة"}</button><div class="skf"><label>العمر أو الصف<select id="suplv2">${lvO}</select></label></div>${supBar()}${un && ST.sup ? `<p class="skhint">وفيه ${AD(un)} نشاط لم يُحدَّد مستواه بعد، يظهر في «كل الأنشطة».</p>` : ""}${rs.length ? sec : `<div class="fzempty"><h3>لا أنشطة بهذه الاختيارات</h3><p>جرّب كل الأعمار أو كل الأنشطة.</p></div>`}${rs.length ? planBox(rs) : ""}${rel}`;
}
let PATHS = [];
function route() {
  const q = new URLSearchParams(decodeURIComponent((location.hash || "").replace(/^#/, "")));
  if (q.get("s") && q.get("g")) skill(q.get("g"), q.get("s")); else if (q.get("s")) { const g = GR.find((x) => x.sk.some((k) => k.slug === q.get("s"))); if (g) skill(g.slug, q.get("s")); else list(); } else if (q.get("g")) group(q.get("g")); else list();
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const b = e.target.closest("[data-sup]"); if (b) { ST.sup = b.dataset.sup; route(); return; }
    const bk = e.target.closest(".supbk"); if (bk) { const on = bk.getAttribute("aria-pressed") !== "true"; if (toggle("back", bk.dataset.k, on)) { bk.setAttribute("aria-pressed", on); bk.textContent = on ? "♥ سأعود إليه" : "♡ أريد العودة إليه"; } return; }
    if (e.target.id === "supchoose") { const q = new URLSearchParams(decodeURIComponent(location.hash.replace(/^#/, ""))), slug = q.get("s"), on = e.target.getAttribute("aria-pressed") !== "true"; if (toggle("skills", slug, on)) { e.target.setAttribute("aria-pressed", on); e.target.textContent = on ? "✓ اخترنا التدريب على هذه المهارة" : "أريد التدريب على هذه المهارة"; } return; }
    if (e.target.id === "supadd") {
      const box = $("#supplan"), msg = $("#supmsg"), picks = [...box.querySelectorAll("input[data-k]:checked")].map((i) => i.dataset.k), day = $("#supday").value;
      if (!picks.length) { msg.className = "m bad"; msg.textContent = "اختر نشاطًا واحدًا على الأقل."; return; }
      const errs = [], okk = []; picks.forEach((k) => { const it = BYKEY.get(k), er = it ? S.addToPlan({ key: it.key, lv: it.lv }, day, "تدريب إضافي اخترته من «دعم التعلم والتدريب الإضافي».") : "المحتوى غير متاح."; if (er) errs.push(it ? it.title + ": " + er : er); else okk.push(k); });
      msg.className = "m " + (errs.length ? "bad" : "ok");
      msg.innerHTML = (okk.length ? `تمت إضافة ${AD(okk.length)} إلى الخطة (الإضافة ليست إنجازًا). <a href="${ROOT}plan/">فتح خطتي</a> ` : "") + errs.map(esc).join("<br>");
    }
  });
  D.addEventListener("change", (e) => { if (e.target.id === "suplv" || e.target.id === "suplv2") { ST.lv = e.target.value; route(); } });
}
async function init() {
  root = $("#skbody");
  try {
    const [d, sk] = await Promise.all([rpc("support_public"), rpc("skills_public"), Z.load()]);
    DATA = d; SKD = sk; if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    try { GOALS = (await rpc("goals_public")).goals || []; } catch (e) { GOALS = []; }
    try { PATHS = (await rpc("paths_public")).paths || []; } catch (e) { PATHS = []; }
    prep(); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المركز الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" class="fzt" id="supretry">إعادة المحاولة</button></div>`;
    const b = $("#supretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__supTest = { ST, get GR() { return GR; }, res: (slug) => { const s = SKB.get(slug); return s ? res(s) : []; } };
init();
})(window);
