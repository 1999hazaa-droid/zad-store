/* التعلم من خلال المواقف اليومية – زاد: موقف مألوف (منزل/مدرسة/تسوق تعليمي/طعام/بيئة) يغلّف مورد تفاعليًا موجودًا فعلًا ويربطه بمهارة.
   لا يُنشر إلا بعد مراجعة مراجع وبوجود علاقة منشورة بين المهارات المرتبطة (daily_public). النسخة القابلة للطباعة مورد منشور حقيقي؛ لا شراء حقيقي ولا بيانات شخصية. «جرّبت الموقف» يضغطها الطفل أو ولي الأمر. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INS = (l) => AGES.includes(l) || GRADES.includes(l);
const KIND = { home: "مواقف المنزل", school: "مواقف المدرسة", shop: "التسوق التعليمي", food: "الطعام والتغذية", env: "البيئة المحيطة" };
const TYPE = { lib: "ورقة عمل", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", games: "لعبة", cards: "بطاقات" };
const MSG = ["رائع، لقد جرّبت هذا الموقف!", "أنت تتدرب خطوة بخطوة.", "يمكنك العودة إلى هذا النشاط متى أردت."];
const KEY = "zad-daily-v1";
const ST = { kind: "", age: "", grade: "" };
let AC = [], SK = [], REVS = new Set(), BYKEY = new Map(), root = null;
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const kidId = () => { const d = lget("zad-learn-v3", null); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const sk = (slug) => SK.find((s) => s.slug === slug);
function rec(slug) { const s = lget(KEY, { kids: {} }); return ((s.kids || {})[kidId()] || {})[slug] || { n: 0, last: 0 }; }
function bump(slug, d) { const s = lget(KEY, { kids: {} }); s.kids = s.kids || {}; const k = (s.kids[kidId()] = s.kids[kidId()] || {}), r = (k[slug] = k[slug] || { n: 0, last: 0 }); r.n = Math.max(0, r.n + d); r.last = Date.now(); try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} return r.n; }
function prep(skj, ij, rv) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  const dm = Object.fromEntries((skj.domains || []).map((d) => [d.slug, d]));
  SK = (skj.skills || []).filter((s) => dm[s.domain] && (s.levels || []).every(INS)).map((s) => Object.assign({}, s, { d: dm[s.domain] }));
  AC = (ij.items || []).map((a) => { const it = BYKEY.get(a.item); if (!it || !a.levels.every(INS) || !sk(a.main) || !it.lv.some((l) => a.levels.includes(l))) return null; return Object.assign({}, a, { it, ex: (a.extra || []).map(sk).filter(Boolean), mk: sk(a.main), xk: a.extra_key ? BYKEY.get(a.extra_key) : null, pk: a.print ? BYKEY.get(a.print) : null }); }).filter(Boolean);
  REVS = new Set((rv.items || []).map((x) => x.s));
}
const lvSel = () => ST.age || ST.grade;
function home() {
  const a = AC.filter((x) => (!ST.kind || x.kind === ST.kind) && (!lvSel() || x.levels.includes(lvSel())));
  const kinds = Object.keys(KIND).filter((k) => AC.some((x) => x.kind === k));
  const opt = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const chips = kinds.map((k) => `<button type="button" class="skdom" data-k="${k}" aria-pressed="${ST.kind === k}">${esc(KIND[k])}</button>`).join("");
  const cards = a.map((x) => `<article class="skcard" style="--c:${esc(x.mk.d.color || "#c1aef0")}"><h3>${esc(x.name)}</h3><div class="mt"><span>${esc(KIND[x.kind])}</span><span>${esc(lvTxt(x.levels))}</span></div><div class="igsk"><span class="main">${esc(x.mk.name)}</span>${x.ex.map((e) => `<span>${esc(e.name)}</span>`).join("")}</div>${rec(x.slug).n ? `<p class="m">جرّبته ${AD(rec(x.slug).n)} ${rec(x.slug).n === 1 ? "مرة" : "مرات"}.</p>` : ""}<a class="skgo" href="#a=${encodeURIComponent(x.slug)}">افتح الموقف</a></article>`).join("");
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>لا توجد مواقف يومية بهذه الاختيارات الآن</h3><p>ننشر كل نشاط بعد مراجعته. يمكنك فتح <a href="${ROOT}skills/">المهارات</a> أو <a href="${ROOT}library/">المكتبة</a> في أي وقت.</p></div>`;
  root.innerHTML = `${chips ? `<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر نوع الموقف</h2><div class="skdoms">${chips}</div>` : ""}<div class="skf" role="group" aria-label="تصفية المواقف"><label>العمر<select id="iage">${opt(AGES, ST.age, "كل الأعمار")}</select></label><label>الصف<select id="igr">${opt(GRADES, ST.grade, "كل الصفوف")}</select></label></div>${kidLv() && !lvSel() ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kidLv()])}. اختر عمره أو صفه من التصفية.</p>` : ""}<p class="skhint">${AD(a.length)} موقف</p><div class="skgrid">${cards || empty}</div>`;
}
function detail(slug) {
  const x = AC.find((a) => a.slug === slug);
  if (!x) { root.innerHTML = `<a class="skback" href="#">← كل المواقف</a><div class="fzempty"><h3>لم نجد هذا الموقف</h3><p>قد يكون غير منشور.</p></div>`; return; }
  const r = rec(slug), sim = AC.filter((a) => a.slug !== slug && (a.kind === x.kind || a.main === x.main || a.extra.some((e) => x.extra.includes(e) || e === x.main))).slice(0, 3);
  const revs = [x.mk, ...x.ex].filter((s) => REVS.has(s.slug));
  const sug = `${x.xk ? `<a href="${url(x.xk)}"><small>نشاط إضافي</small>${esc(x.xk.title)}</a>` : ""}${revs.map((s) => `<a href="${ROOT}review/#s=${encodeURIComponent(s.slug)}"><small>مراجعة قصيرة</small>${esc(s.name)}</a>`).join("")}${sim.map((a) => `<a href="#a=${encodeURIComponent(a.slug)}"><small>نشاط مشابه</small>${esc(a.name)}</a>`).join("")}`;
  root.innerHTML = `<a class="skback" href="#">← كل المواقف</a><div class="pthcov" style="--c:${esc(x.mk.d.color)}"><img src="${ROOT}images/ill/${esc(x.mk.d.icon)}" alt=""><div><h2>${esc(x.name)}</h2><div class="pthmeta"><span>${esc(KIND[x.kind])}</span><span>${esc(lvTxt(x.levels))}</span><span>${esc(TYPE[x.it.src] || "نشاط")}</span></div></div></div><div class="igsk" aria-label="المهارة التي يدعمها الموقف"><span class="main">${esc(x.mk.name)}</span>${x.ex.map((e) => `<span>${esc(e.name)}</span>`).join("")}</div><div class="pthgoal"><h3>الهدف</h3><p>${esc(x.goal)}</p></div><div class="srbox"><b>الموقف</b><br>${esc(x.scene)}</div>${x.tools ? `<div class="srbox"><b>الأدوات أو الموارد المطلوبة</b><br>${esc(x.tools)}</div>` : ""}<div class="srbox"><b>تعليمات الطفل</b><br>${esc(x.instr)}</div><h3 class="skstage">خطوات النشاط</h3><ol class="igst">${x.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>${x.inter ? `<div class="srbox"><b>طريقة التفاعل</b><br>${esc(x.inter)}</div>` : ""}${x.feedback ? `<div class="srbox"><b>التغذية الراجعة</b><br>${esc(x.feedback)}</div>` : ""}<div class="srbtns"><a href="${url(x.it)}" id="igstart">ابدأ النشاط</a>${x.pk ? `<a class="alt" href="${url(x.pk)}" id="igprint">النسخة القابلة للطباعة</a>` : ""}<button type="button" class="alt" id="igdone">${r.n ? "جرّبته مرة أخرى" : "جرّبت الموقف"}</button></div><p class="m">يمكنك التوقف والعودة متى شئت. لا مؤقت ولا خصم نقاط.</p>${r.n ? `<div class="srbox" role="status"><b>${MSG[r.n % MSG.length]}</b><br>جرّبته ${AD(r.n)} ${r.n === 1 ? "مرة" : "مرات"} على هذا الجهاز. <button type="button" class="chip" id="igundo">تراجع عن آخر تجربة</button></div>` : ""}${sug ? `<h3 class="skstage">ماذا بعد؟</h3><div class="srsug">${sug}</div>` : ""}<details class="srpar"><summary>لولي الأمر</summary><p><b>المهارة التي يدعمها:</b> ${esc([x.mk, ...x.ex].map((s) => s.name).join("، "))}<br><b>الهدف:</b> ${esc(x.goal)}</p>${x.tools ? `<p><b>الأدوات المطلوبة:</b> ${esc(x.tools)}</p>` : ""}${x.parent ? `<p><b>إرشادات لولي الأمر:</b> ${esc(x.parent)}</p>` : ""}${x.pk ? `<p><a href="${url(x.pk)}">النسخة القابلة للطباعة</a></p>` : ""}<p><a href="${ROOT}map/#k=${encodeURIComponent(x.main)}">خريطة المهارات</a> · <a href="${ROOT}life/">المهارات الحياتية</a> · <a href="${ROOT}plan/">خطة التعلم الأسبوعية</a></p><p class="m">الهدف التعلم والممارسة وليس تقييم قدرات الطفل. «جرّبت الموقف» يُسجَّل على هذا الجهاز عند ضغطه فقط، ولا يدل على إتقان.</p></details><a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`;
  D.title = x.name + " | المواقف اليومية | منصة زاد التعليمية";
}
const curSlug = () => (decodeURIComponent(location.hash).match(/^#a=(.+)$/) || [])[1];
function route() { const s = curSlug(); if (s) detail(s); else { D.title = "التعلم من خلال المواقف اليومية | منصة زاد التعليمية"; home(); } }
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const t = e.target, k = t.closest(".skdom"), sl = curSlug();
    if (k) { ST.kind = ST.kind === k.dataset.k ? "" : k.dataset.k; home(); return; }
    if (sl && t.id === "igdone") { bump(sl, 1); detail(sl); const b = $("[role=status]"); if (b) b.scrollIntoView({ block: "center" }); return; }
    if (sl && t.id === "igundo") { bump(sl, -1); detail(sl); }
  });
  D.addEventListener("change", (e) => { const t = e.target; if (t.id === "iage") { ST.age = t.value; ST.grade = ""; home(); } if (t.id === "igr") { ST.grade = t.value; ST.age = ""; home(); } });
}
async function init() {
  root = $("#skbody");
  try {
    const [ij, skj, rv] = await Promise.all([rpc("daily_public"), rpc("skills_public"), rpc("review_public").catch(() => ({ items: [] })), Z.load()]);
    if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(skj, ij, rv); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المواقف الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="iretry">إعادة المحاولة</button></div>`;
    const b = $("#iretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__dailyTest = { ST, get AC() { return AC; } };
init();
})(window);
