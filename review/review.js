/* مركز مراجعة المهارات – زاد: جلسات مراجعة قصيرة اختيارية من أنشطة المهارة المنشورة (review_public + skills_public + support_public + فهرس البحث).
   الروابط بين المهارات (مهارات سابقة) يحدّدها فريق المحتوى فقط. لا مؤقت، لا خصم نقاط، لا حكم على مستوى الطفل. «راجعت» يضغطها الطفل أو ولي الأمر؛ فتح النشاط وحده لا يُحتسب. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INS = (l) => AGES.includes(l) || GRADES.includes(l);
const GROUPS = ["arabic", "math", "visual", "thinking"];
const TYPE = { lib: "ورقة عمل", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", games: "لعبة", cards: "بطاقات" };
const KINDS = [["quick", "مراجعة سريعة", null], ["inter", "تفاعلية بالصور والأصوات", ["bank", "quiz"]], ["cards", "بطاقات تعليمية", ["cards"]], ["game", "لعبة تعليمية", ["games"]], ["ws", "ورقة عمل", ["lib"]], ["app", "تطبيقية من الحياة اليومية", ["acts", "life", "proj", "exp", "ready", "val"]]];
const MSG = ["رائع، لقد راجعت هذا النشاط!", "أنت تتدرب خطوة بخطوة.", "أحسنت! يمكنك العودة إلى هذه المهارة متى أردت."];
const KEY = "zad-review-v1";
const ST = { grp: "", age: "", grade: "", kind: "quick", n: {} };
let REV = [], SK = [], SKD = null, GR = [], GS = [], BYKEY = new Map(), LINKS = new Map(), root = null;
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const kidId = () => { const d = lget("zad-learn-v3", null); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
/* ---- السجل المحلي ---- */
function store() { const s = lget(KEY, { kids: {} }); s.kids = s.kids || {}; const k = (s.kids[kidId()] = s.kids[kidId()] || { skills: {}, cur: {} }); k.skills = k.skills || {}; k.cur = k.cur || {}; return { s, k }; }
const save = (s) => { try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch (e) { return false; } };
function rec(slug) { const { k } = store(); return k.skills[slug] || { sessions: 0, again: false, items: {}, last: 0 }; }
function cur(slug) { const { k } = store(); return new Set(k.cur[slug] || []); }
function toggle(slug, key) { const { s, k } = store(), a = new Set(k.cur[slug] || []); a.has(key) ? a.delete(key) : a.add(key); k.cur[slug] = [...a]; save(s); return a.has(key); }
function finish(slug) {
  const { s, k } = store(), keys = k.cur[slug] || []; if (!keys.length) return false;
  const r = (k.skills[slug] = k.skills[slug] || { sessions: 0, again: false, items: {}, last: 0 }); r.sessions++; r.last = Date.now(); keys.forEach((x) => (r.items[x] = (r.items[x] || 0) + 1)); k.cur[slug] = []; return save(s);
}
function setAgain(slug, on) { const { s, k } = store(), r = (k.skills[slug] = k.skills[slug] || { sessions: 0, again: false, items: {}, last: 0 }); r.again = !!on; return save(s); }
function bankDone() { const d = lget("zad-learn-v3", null), k = d && d.kids && d.kids[kidId()], m = (k && k.bank && k.bank.done) || {}, o = {}; Object.keys(m).forEach((sl) => { if (m[sl] && m[sl].d > 0) o["bank:" + sl] = m[sl].d; }); return o; }
/* ---- بيانات ---- */
function prep(sk, sup, rv) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  const dm = Object.fromEntries((sk.domains || []).map((d) => [d.slug, d]));
  SKD = dm; SK = (sk.skills || []).filter((s) => dm[s.domain] && (s.levels || []).every(INS)).map((s) => Object.assign({}, s, { d: dm[s.domain] }));
  LINKS = new Map(); (sk.links || []).forEach((l) => { if (!LINKS.has(l.s)) LINKS.set(l.s, []); LINKS.get(l.s).push(l); });
  GR = (sup.groups || []).filter((g) => GROUPS.includes(g.slug)); GS = sup.gs || [];
  REV = (rv.items || []).map((r) => { const s = SK.find((x) => x.slug === r.s); return s ? Object.assign({}, r, { sk: s, pool: pool(s) }) : null; }).filter((r) => r && r.pool.length >= 3);
}
function pool(s, lv) {
  const seen = new Set(), out = [];
  (LINKS.get(s.id) || []).slice().sort((a, b) => (a.o || 0) - (b.o || 0)).forEach((l) => { const it = BYKEY.get(l.k); if (!it || seen.has(l.k) || !it.lv.some((x) => INS(x) && s.levels.includes(x) && (!lv || x === lv))) return; seen.add(l.k); out.push(it); });
  return out;
}
const grpOf = (slug) => { const g = GS.find((x) => x.s === slug && GROUPS.includes(x.g)); return g ? g.g : ""; };
const lvSel = () => ST.age || ST.grade || kidLv() || "";
/* ---- القائمة ---- */
function home() {
  const lv = ST.age || ST.grade, a = REV.filter((r) => (!ST.grp || grpOf(r.s) === ST.grp) && (!lv || r.sk.levels.includes(lv)));
  const kid = kidLv(), opt = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const chips = GR.filter((g) => REV.some((r) => grpOf(r.s) === g.slug)).map((g) => `<button type="button" class="skdom" data-g="${esc(g.slug)}" aria-pressed="${ST.grp === g.slug}" style="--c:${esc(g.color || "#e6dcff")}">${esc(g.name)}</button>`).join("");
  const cards = a.map((r) => { const x = rec(r.s); return `<article class="skcard" style="--c:${esc(r.sk.d.color || "#c1aef0")}"><h3>${esc(r.sk.name)}</h3><div class="mt"><span>${esc(r.sk.d.name)}</span><span>${esc(lvTxt(r.sk.levels))}</span>${r.pre.length ? `<span>${AD(r.pre.length)} مهارات سابقة</span>` : ""}${x.again ? "<span>أريد مراجعتها</span>" : ""}</div>${x.sessions ? `<p class="m">راجعتها ${AD(x.sessions)} ${x.sessions === 1 ? "مرة" : "مرات"}.</p>` : ""}<a class="skgo" href="#s=${encodeURIComponent(r.s)}">ابدأ المراجعة</a></article>`; }).join("");
  const sess = REV.filter((r) => rec(r.s).sessions || rec(r.s).again);
  const log = sess.length ? `<details class="srpar" open><summary>سجل المراجعة (على هذا الجهاز)</summary><ul>${sess.map((r) => { const x = rec(r.s), re = Object.keys(x.items).filter((k) => x.items[k] >= 2).length; return `<li><b>${esc(r.sk.name)}</b>: ${x.sessions ? `${AD(x.sessions)} جلسة مكتملة${re ? `، وأعدت ممارسة ${AD(re)} ${re === 1 ? "نشاطًا" : "أنشطة"}` : ""}` : "لم تكتمل جلسة بعد"}${x.again ? " · تريد مراجعتها مرة أخرى" : ""}</li>`; }).join("")}</ul></details>` : "";
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>لا توجد مراجعات متاحة بهذه الاختيارات الآن</h3><p>نضيف مراجعة لكل مهارة بعد أن يجهّز فريق المحتوى أنشطتها وروابطها. يمكنك فتح <a href="${ROOT}skills/">المهارات</a> أو <a href="${ROOT}library/">المكتبة</a> في أي وقت.</p></div>`;
  root.innerHTML = `${chips ? `<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر المجال</h2><div class="skdoms">${chips}</div>` : ""}<div class="skf" role="group" aria-label="تصفية المراجعات"><label>العمر<select id="rage">${opt(AGES, ST.age, "كل الأعمار")}</select></label><label>الصف<select id="rgr">${opt(GRADES, ST.grade, "كل الصفوف")}</select></label></div>${kid && !ST.age && !ST.grade ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kid])}. اختر عمره أو صفه من التصفية.</p>` : ""}<p class="skhint">${AD(a.length)} مراجعة</p><div class="skgrid">${cards || empty}</div>${log}`;
}
/* ---- جلسة المراجعة ---- */
function chosen(r) {
  const lv = lvSel(), p = r.pool.filter((it) => !lv || it.lv.includes(lv)), kd = KINDS.find((k) => k[0] === ST.kind) || KINDS[0], srcs = kd[2];
  const f = srcs ? p.filter((it) => srcs.includes(it.src)) : p;
  const base = srcs ? 3 : 3, n = Math.min(f.length, base + (ST.n[r.s] || 0) * 1);
  return { f, n, lv, kinds: KINDS.filter((k) => !k[2] || p.some((it) => k[2].includes(it.src))) };
}
function session(slug) {
  const r = REV.find((x) => x.s === slug);
  if (!r) { root.innerHTML = `<a class="skback" href="#">← كل المراجعات</a><div class="fzempty"><h3>لم نجد هذه المراجعة</h3><p>قد تكون غير منشورة. يمكنك فتح <a href="${ROOT}skills/#s=${encodeURIComponent(slug)}">صفحة المهارة</a> مباشرة.</p></div>`; return; }
  const { f, n, lv, kinds } = chosen(r), items = f.slice(0, n), done = cur(slug), x = rec(slug), bd = bankDone(), rd = items.filter((it) => done.has(it.key)).length;
  if (!kinds.some((k) => k[0] === ST.kind)) ST.kind = "quick";
  const pre = r.pre.map((p) => { const k = SK.find((z) => z.slug === p.s); return k ? `<li><b>${esc(k.name)}</b> <a class="skgo" href="${p.rev ? "#s=" + encodeURIComponent(p.s) : ROOT + "skills/#s=" + encodeURIComponent(p.s)}">${p.rev ? "مراجعة قصيرة" : "فتح المهارة"}</a></li>` : ""; }).join("");
  const kindBtns = kinds.map((k) => `<button type="button" class="chip" data-kind="${k[0]}" aria-pressed="${ST.kind === k[0]}"${ST.kind === k[0] ? ' style="background:#f1eaff"' : ""}>${esc(k[1])}</button>`).join("");
  const cards = items.map((it, i) => `<div class="srcard" style="--sc:#6b3fd4"><span class="srtag" style="background:#6b6b7b">${esc(TYPE[it.src] || "نشاط")}</span><h3>${AD(i + 1)}. ${esc(it.title)}</h3>${bd[it.key] ? `<p class="m">أكملته سابقًا ${AD(bd[it.key])} ${bd[it.key] === 1 ? "مرة" : "مرات"}.</p>` : ""}<div class="srbtns"><a href="${url(it)}">ابدأ النشاط</a><button type="button" class="alt" data-done="${esc(it.key)}" aria-pressed="${done.has(it.key)}">${done.has(it.key) ? "✓ راجعت هذا النشاط (إلغاء)" : "راجعت هذا النشاط"}</button></div>${done.has(it.key) ? `<div class="srbox" role="status">${MSG[(i + items.length) % MSG.length]}</div>` : ""}</div>`).join("");
  const more = f.length > n ? `<button type="button" class="chip" id="rmore">لنجرّب نشاطًا آخر</button>` : "";
  const sug = r.next.map((s) => REV.find((z) => z.s === s) ? { s, href: "#s=" + encodeURIComponent(s), n: (SK.find((z) => z.slug === s) || {}).name } : SK.find((z) => z.slug === s) ? { s, href: ROOT + "skills/#s=" + encodeURIComponent(s), n: SK.find((z) => z.slug === s).name } : null).filter(Boolean);
  const rest = f.slice(n, n + 1)[0];
  const summ = rd ? `<div class="srbox" role="status"><b>ملخص جلستك</b><br>راجعت ${AD(rd)} من ${AD(items.length)} أنشطة. ${r.summary ? esc(r.summary) : ""}<div class="srbtns"><button type="button" id="rfin">أنهيت الجلسة</button></div></div>` : "";
  const after = x.sessions ? `<div class="srbox"><b>رائع، لقد راجعت هذه المهارة!</b><br>يمكنك العودة إلى هذه المهارة متى أردت.${sug.length ? `<div class="srsug">${sug.map((z) => `<a href="${z.href}"><small>مهارة مرتبطة</small>${esc(z.n)}</a>`).join("")}</div>` : ""}${rest ? `<div class="srsug"><a href="${url(rest)}"><small>نشاط إضافي إن أحببت</small>${esc(rest.title)}</a></div>` : ""}</div>` : "";
  root.innerHTML = `<a class="skback" href="#">← كل المراجعات</a><div class="pthcov" style="--c:${esc(r.sk.d.color)}"><img src="${ROOT}images/ill/${esc(r.sk.d.icon)}" alt=""><div><h2>مراجعة: ${esc(r.sk.name)}</h2><div class="pthmeta"><span>${esc(r.sk.d.name)}</span><span>${esc(lvTxt(r.sk.levels))}</span></div></div></div><div class="srbox"><b>ما سبق أن تعلمناه</b><br>${esc(r.intro)}</div>${r.example ? `<div class="srbox"><b>مثال أو نشاط تمهيدي</b><br>${esc(r.example)}</div>` : ""}${pre ? `<div class="pthgoal"><h3>مهارات سابقة مرتبطة</h3><p class="skhint">اختيارية: ابدأ بها إن أحببت.</p><ul>${pre}</ul></div>` : ""}<h3 class="skstage">اختر طريقة المراجعة <small>أنشطة قليلة، بلا وقت محدد</small></h3><div class="srpick" role="group" aria-label="طريقة المراجعة">${kindBtns}</div>${lv ? "" : `<p class="skhint">نعرض الأنشطة لكل الأعمار والصفوف المناسبة للمهارة. اختر العمر من الصفحة الرئيسية للمراجعة لتضييقها.</p>`}${cards || `<div class="fzempty"><h3>لا توجد أنشطة بهذه الطريقة لعمر طفلك</h3><p>جرّب طريقة أخرى.</p></div>`}${more}${summ}${after}<div class="srbtns"><a class="alt" href="${ROOT}skills/#s=${encodeURIComponent(slug)}">تخطَّ المراجعة وافتح المهارة مباشرة</a><label class="ck"><input type="checkbox" id="ragain"${x.again ? " checked" : ""}> أريد مراجعتها مرة أخرى</label></div><details class="srpar"><summary>لولي الأمر</summary><p>اختر طريقة «ورقة عمل» أو «تطبيقية» لمراجعة منزلية. الجلسة تحفظ ما علّمتموه «راجعت» على هذا الجهاز فقط، ولا تدل على إتقان المهارة.</p><p class="m">لا نحكم على مستوى طفلك من جلسة واحدة.</p></details><a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`;
  D.title = "مراجعة " + r.sk.name + " | مراجعة المهارات | منصة زاد التعليمية";
}
const curSlug = () => (decodeURIComponent(location.hash).match(/^#s=(.+)$/) || [])[1];
function route() { const s = curSlug(); if (s) session(s); else { D.title = "مراجعة المهارات | منصة زاد التعليمية"; home(); } }
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const t = e.target, sl = curSlug();
    const g = t.closest(".skdom"); if (g) { ST.grp = ST.grp === g.dataset.g ? "" : g.dataset.g; home(); return; }
    if (!sl) return;
    const k = t.closest("[data-kind]"); if (k) { ST.kind = k.dataset.kind; ST.n[sl] = 0; session(sl); return; }
    const d = t.closest("[data-done]"); if (d) { toggle(sl, d.dataset.done); session(sl); const b = $(`[data-done="${CSS.escape(d.dataset.done)}"]`); if (b) b.focus(); return; }
    if (t.id === "rmore") { ST.n[sl] = (ST.n[sl] || 0) + 1; session(sl); return; }
    if (t.id === "rfin") { finish(sl); session(sl); const a = $(".srbox b"); return; }
  });
  D.addEventListener("change", (e) => {
    const t = e.target, sl = curSlug();
    if (t.id === "rage") { ST.age = t.value; home(); } if (t.id === "rgr") { ST.grade = t.value; home(); }
    if (sl && t.id === "ragain") setAgain(sl, t.checked);
  });
}
async function init() {
  root = $("#skbody");
  try {
    const [rv, sk, sup] = await Promise.all([rpc("review_public"), rpc("skills_public"), rpc("support_public"), Z.load()]);
    if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(sk, sup, rv); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المراجعات الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="rretry">إعادة المحاولة</button></div>`;
    const b = $("#rretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__reviewTest = { ST, get REV() { return REV; } };
init();
})(window);
