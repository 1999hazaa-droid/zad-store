/* ابحث حسب المهارة – زاد التعليمية: تنظيم الموارد حسب المهارة (بيانات حقيقية من skills_public + فهرس البحث) */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const STG = [["recognize", "تعرّف", "نتعرّف على المفهوم أو نشاهد ونقرأ شرحًا مناسبًا"], ["practice", "تدرّب", "أنشطة وأوراق عمل للتدريب"], ["apply", "طبّق", "استخدام المهارة في موقف أو مشروع جديد"], ["review", "راجع", "مراجعة قصيرة أو اختبار"]];
const STN = Object.fromEntries(STG.map((s) => [s[0], s[1]]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const ST = { dom: "", lv: "", stage: "", ct: "", pay: "", q: "" };
let DATA = null, BYKEY = new Map(), LINKS = new Map(), SK = [], root = null;
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; if (lv.length === 1) return Z.LVN[lv[0]]; return Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";

async function fetchSkills() {
  const key = ANON;
  const r = await fetch(SB + "/rest/v1/rpc/skills_public", { method: "POST", headers: { apikey: key, Authorization: "Bearer " + key, "Content-Type": "application/json" }, body: "{}" });
  if (!r.ok) throw new Error("skills " + r.status);
  return r.json();
}
function prep() {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  LINKS = new Map();
  (DATA.links || []).forEach((l) => { const it = BYKEY.get(l.k); if (!it) return; if (!LINKS.has(l.s)) LINKS.set(l.s, []); LINKS.get(l.s).push({ it, stage: l.g, role: l.r, ord: l.o || 0 }); });
  const dom = Object.fromEntries((DATA.domains || []).map((d) => [d.slug, d]));
  SK = (DATA.skills || []).filter((s) => dom[s.domain]).map((s) => Object.assign({}, s, { d: dom[s.domain] }));
}
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
/* الموارد المرئية لمهارة بعد الفلاتر: لا يظهر مورد خارج عمر المهارة ولا خارج العمر المختار */
function res(s, o) {
  o = o || ST;
  return (LINKS.get(s.id) || []).filter((l) => {
    const it = l.it; if (!it.lv.some((x) => s.levels.includes(x))) return false;
    if (o.lv && !(it.lv.includes(o.lv) && s.levels.includes(o.lv))) return false;
    if (o.stage && l.stage !== o.stage) return false;
    if (o.ct && it.ct !== o.ct) return false;
    if (o.pay === "free" && it.paid) return false; if (o.pay === "paid" && !it.paid) return false;
    return true;
  }).sort((a, b) => STG.findIndex((x) => x[0] === a.stage) - STG.findIndex((x) => x[0] === b.stage) || a.ord - b.ord || (a.role === "main" ? -1 : 1) - (b.role === "main" ? -1 : 1) || a.it.title.localeCompare(b.it.title, "ar"));
}
function badge(it) { return it.src === "pack" ? "" : it.paid ? `<span class="pd">مدفوع${it.price ? " · " + esc(money(it.price)) : ""}</span>` : `<span class="fr">مجاني</span>`; }
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");

/* ---------- القائمة ---------- */
function filters() {
  const lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const stO = `<option value="">كل المستويات</option>` + STG.map((s) => `<option value="${s[0]}"${ST.stage === s[0] ? " selected" : ""}>${s[1]}</option>`).join("");
  const ctO = `<option value="">كل الأنواع</option>` + Z.CTK.map((k) => `<option value="${k}"${ST.ct === k ? " selected" : ""}>${esc(Z.CT[k])}</option>`).join("");
  const pO = `<option value="">مجاني ومدفوع</option><option value="free"${ST.pay === "free" ? " selected" : ""}>مجاني</option><option value="paid"${ST.pay === "paid" ? " selected" : ""}>مدفوع</option>`;
  return `<div class="skf" role="group" aria-label="تصفية المهارات"><label>ابحث عن مهارة<input type="search" id="skq" value="${esc(ST.q)}" placeholder="مثال: العد"></label><label>العمر أو الصف<select id="sklv">${lvO}</select></label><label>مستوى المهارة<select id="skst">${stO}</select></label><label>نوع المورد<select id="skct">${ctO}</select></label><label>مجاني أو مدفوع<select id="skpay">${pO}</select></label></div>`;
}
function list() {
  const q = Z.norm(ST.q);
  let a = SK.filter((s) => (!ST.dom || s.domain === ST.dom) && (!q || Z.norm(s.name + " " + (s.descr || "")).includes(q)));
  const withR = a.map((s) => ({ s, n: res(s).length })).filter((x) => x.n > 0);
  const doms = (DATA.domains || []).slice().sort((x, y) => x.sort - y.sort);
  const cnt = (d) => SK.filter((s) => s.domain === d.slug && res(s).length).length;
  const chips = doms.map((d) => `<button type="button" class="skdom" data-d="${esc(d.slug)}" aria-pressed="${ST.dom === d.slug}" style="--c:${esc(d.color || "#e6dcff")}"><img src="${ROOT}images/ill/${esc(d.icon)}" alt=""><span>${esc(d.name)}</span><small>${AD(cnt(d))} مهارة</small></button>`).join("");
  const cards = withR.map(({ s, n }) => `<article class="skcard" style="--c:${esc(s.d.color || "#c1aef0")}"><h3>${esc(s.name)}</h3><div class="mt"><span>${esc(s.d.name)}</span><span>${esc(lvTxt(s.levels))}</span><span>${AD(n)} مورد</span></div>${s.descr ? `<p>${esc(s.descr)}</p>` : ""}<a class="go" href="#s=${esc(s.slug)}" aria-label="عرض الموارد: ${esc(s.name)}">عرض الموارد</a></article>`).join("");
  const kid = kidLv();
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>لا توجد مهارات بهذه الاختيارات</h3><p>لا نعرض مهارة ليس لها موارد مرتبطة فعلًا. جرّب تغيير العمر أو المستوى أو النوع.</p></div>`;
  root.innerHTML = `<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر المجال</h2><div class="skdoms">${chips}</div>${filters()}${kid && !ST.lv ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kid])}. اختر عمره من القائمة لإظهار الموارد المناسبة له فقط.</p>` : ""}<p class="skhint" role="status" id="skn">${AD(withR.length)} مهارة فيها موارد</p>${withR.length ? `<div class="skgrid">${cards}</div>` : empty}`;
}

/* ---------- صفحة المهارة ---------- */
function progress(s) {
  let done = 0, todo = 0, keys = new Set((LINKS.get(s.id) || []).map((l) => l.it.key));
  try { const d = JSON.parse(localStorage.getItem("zad-learn-v3")), kid = d && d.kids && d.kids[d.cur]; const ws = kid && kid.plan && kid.plan.weeks || {}; Object.keys(ws).forEach((w) => (ws[w].items || []).forEach((i) => { if (!keys.has(i.key)) return; if (i.st === "done") done++; else todo++; })); } catch (e) { /* */ }
  if (!done && !todo) return `<p class="skprog">لم تُضف موارد هذه المهارة إلى خطة طفلك بعد. عند إكمال نشاط في الخطة يظهر هنا عدد الأنشطة المنجزة. لا نعرض نسبة إتقان لأن فتح المورد لا يثبت إتقان المهارة.</p>`;
  return `<p class="skprog">في خطة طفلك: ${AD(done)} نشاط مكتمل و${AD(todo)} قيد الإنجاز لهذه المهارة. هذا عدد أنشطة أُنجزت فعلًا، وليس نسبة إتقان. ${done && !todo ? "يمكنك إضافة نشاط مراجعة لتثبيت المهارة." : ""}</p>`;
}
function planBox(s, rs) {
  const lv = kidLv(), t = S.iso(new Date()), ws = S.weekStart(t);
  const ok = lv ? rs.filter((l) => l.it.lv.includes(lv) && ["acts", "bank", "proj", "life", "ready", "val", "vid", "songs", "stories", "quiz"].includes(l.it.src)) : [];
  if (!lv) return `<div class="skplan"><b>أضف المهارة إلى خطة طفلك</b><p class="m bad">اختر عمر طفلك أو صفه أولًا من صفحة خطتي ليُضاف التدريب إلى خطته.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  if (!ok.length) return `<div class="skplan"><b>أضف المهارة إلى خطة طفلك</b><p class="m bad">لا يوجد مورد لهذه المهارة يناسب مستوى طفلك الحالي (${esc(Z.LVN[lv])}) ويمكن إضافته إلى الخطة.</p></div>`;
  const opts = DAYS.map((n, i) => { const d = S.addDays(ws, i), dd = S.parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  return `<div class="skplan" id="skplan"><b>أضف المهارة إلى خطة طفلك (${esc(Z.LVN[lv])})</b>${ok.map((l, i) => `<label class="ck"><input type="checkbox" data-k="${esc(l.it.key)}"${i < 2 ? " checked" : ""}> ${esc(l.it.title)} <small>(${esc(STN[l.stage] || "")})</small></label>`).join("")}<label>اليوم من هذا الأسبوع <select id="skday">${opts}</select></label><div><button type="button" id="skadd">إضافة المحدد إلى الخطة</button></div><p class="m" id="skmsg" role="status"></p></div>`;
}
function skill(slug) {
  const s = SK.find((x) => x.slug === slug);
  if (!s) { root.innerHTML = `<a class="skback" href="#">← كل المهارات</a><div class="fzempty"><h3>لم نجد هذه المهارة</h3><p>قد تكون مخفية مؤقتًا أو غير موجودة.</p></div>`; return; }
  const rs = res(s), lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.filter((l) => s.levels.includes(l)).map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const by = (g) => rs.filter((l) => l.stage === g);
  const sec = STG.map((g) => { const a = by(g[0]); if (!a.length) return ""; return `<h3 class="skstage">${g[1]} <small>${g[2]}</small></h3>${a.map((l) => `<div class="skres"><b>${esc(l.it.title)}</b><div class="mt">${l.it.ct ? `<span>${esc(Z.CT[l.it.ct] || "")}</span>` : ""}<span>${esc(lvTxt(l.it.lv))}</span>${l.role === "sub" ? `<span>مهارة داعمة</span>` : ""}${badge(l.it)}</div><a href="${esc(url(l.it))}" aria-label="${l.it.paid ? "عرض المعاينة" : "فتح"}: ${esc(l.it.title)}">${l.it.paid ? "عرض المعاينة" : "فتح"}</a></div>`).join("")}`; }).join("");
  let path = "";
  if (s.path && rs.length) { const steps = STG.map((g) => { const m = rs.filter((l) => l.stage === g[0]).slice(0, 1)[0]; return m ? `<li><b>${g[1]}:</b> <a href="${esc(url(m.it))}">${esc(m.it.title)}</a></li>` : ""; }).filter(Boolean); if (steps.length > 1) path = `<div class="skpath"><b>مسار مقترح لهذه المهارة</b><p class="skhint">الترتيب مبني على التسلسل التعليمي (تعرّف ثم تدرّب ثم طبّق ثم راجع) وليس على تاريخ إضافة المورد. يمكنك اتباعه أو فتح أي مورد مباشرة من القائمة أدناه.</p><ol>${steps.join("")}</ol></div>`; }
  root.innerHTML = `<a class="skback" href="#">← كل المهارات</a><div class="sktitle"><img src="${ROOT}images/ill/${esc(s.d.icon)}" alt=""><div><h2>${esc(s.name)}</h2><div class="mt skcard" style="border:0;box-shadow:none;padding:0;--c:${esc(s.d.color)}"><div class="mt"><span>${esc(s.d.name)}</span><span>${esc(lvTxt(s.levels))}</span><span>${s.path ? "مهارة متسلسلة" : "مهارة"}</span></div></div></div></div>${s.descr ? `<p>${esc(s.descr)}</p>` : ""}${progress(s)}<div class="skf"><label>العمر أو الصف<select id="sklv2">${lvO}</select></label></div>${path}${rs.length ? sec : `<div class="fzempty"><h3>لا توجد موارد بهذه الاختيارات</h3><p>جرّب كل الأعمار والصفوف.</p></div>`}${planBox(s, rs)}`;
  D.title = s.name + " | ابحث حسب المهارة | منصة زاد التعليمية";
}

/* ---------- التوجيه والأحداث ---------- */
function route() {
  const h = decodeURIComponent((location.hash || "").replace(/^#/, "")), m = h.match(/^s=(.+)$/);
  if (m) skill(m[1]); else { D.title = "ابحث حسب المهارة | منصة زاد التعليمية"; list(); }
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const d = e.target.closest(".skdom"); if (d) { ST.dom = ST.dom === d.dataset.d ? "" : d.dataset.d; list(); return; }
    if (e.target.id === "skadd") {
      const box = $("#skplan"), msg = $("#skmsg"), picks = [...box.querySelectorAll("input[data-k]:checked")].map((i) => i.dataset.k), day = $("#skday").value;
      if (!picks.length) { msg.className = "m bad"; msg.textContent = "اختر موردًا واحدًا على الأقل."; return; }
      const errs = [], okk = []; picks.forEach((k) => { const it = BYKEY.get(k), er = it ? S.addToPlan({ key: it.key, lv: it.lv }, day, "تدريب على مهارة اخترتها من «ابحث حسب المهارة».") : "المحتوى غير متاح."; if (er) errs.push(it ? it.title + ": " + er : er); else okk.push(k); });
      msg.className = "m " + (errs.length ? "bad" : "ok");
      msg.innerHTML = (okk.length ? `تمت إضافة ${AD(okk.length)} إلى خطتك (الإضافة ليست إنجازًا). <a href="${ROOT}plan/">فتح خطتي</a> ` : "") + errs.map(esc).join("<br>");
    }
  });
  D.addEventListener("input", (e) => { if (e.target.id === "skq") { ST.q = e.target.value; const p = e.target.selectionStart; list(); const n = $("#skq"); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (x) { /* */ } } } });
  D.addEventListener("change", (e) => {
    const id = e.target.id, map = { sklv: "lv", skst: "stage", skct: "ct", skpay: "pay" };
    if (map[id]) { ST[map[id]] = e.target.value; list(); }
    if (id === "sklv2") { ST.lv = e.target.value; route(); }
  });
}
async function init() {
  root = $("#skbody");
  try {
    const [j] = await Promise.all([fetchSkills(), Z.load()]);
    DATA = j; if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(); const k = kidLv(); if (k) ST.lv = ""; bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المهارات الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" class="fzt" id="skretry">إعادة المحاولة</button></div>`;
    const b = $("#skretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__skillsTest = { ST, res: (id) => res(SK.find((s) => s.id === id)), get SK() { return SK; } };
init();
})(window);
