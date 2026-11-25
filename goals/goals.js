/* الأهداف التعليمية – زاد: أهداف ومخرجات تعلم مرتبطة بالمهارات والموارد (بيانات حقيقية من goals_public + skills_public + فهرس البحث).
   لا نسب إتقان: لا يوجد تقييم فعلي لكل هدف، وإكمال نشاط في الخطة لا يثبت تحقق الهدف. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const STG = [["recognize", "تعرّف", "التعرف على الفكرة بصورة مبسطة"], ["practice", "تدرّب", "أنشطة وأوراق عمل للتدريب"], ["apply", "طبّق", "استخدام ما تعلمه في موقف جديد"], ["review", "راجع", "مراجعة قصيرة أو اختبار"]];
const STN = Object.fromEntries(STG.map((s) => [s[0], s[1]]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const GDOM = ["arabic", "math", "science", "life", "cognitive"];
const ST = { dom: "", lv: "", skill: "", stage: "", pay: "", q: "" };
let DATA = null, DOMS = [], BYKEY = new Map(), LINKS = new Map(), GL = [], root = null;
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; if (lv.length === 1) return Z.LVN[lv[0]]; return Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
function prep(sk) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i])); LINKS = new Map();
  (DATA.links || []).forEach((l) => { const it = BYKEY.get(l.k); if (!it) return; if (!LINKS.has(l.g)) LINKS.set(l.g, []); LINKS.get(l.g).push({ it, stage: l.s, role: l.r, ord: l.o || 0 }); });
  const dm = Object.fromEntries((sk.domains || []).map((d) => [d.slug, d]));
  DOMS = GDOM.map((s) => dm[s]).filter(Boolean);
  GL = (DATA.goals || []).filter((g) => dm[g.domain] && GDOM.includes(g.domain)).map((g) => Object.assign({}, g, { d: dm[g.domain] }));
}
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
/* موارد الهدف المرئية: لا يظهر مورد خارج عمر الهدف ولا خارج العمر المختار */
function res(g, o) {
  o = o || ST;
  return (LINKS.get(g.id) || []).filter((l) => {
    const it = l.it; if (!it.lv.some((x) => g.levels.includes(x))) return false;
    if (o.lv && !(it.lv.includes(o.lv) && g.levels.includes(o.lv))) return false;
    if (o.stage && l.stage !== o.stage) return false;
    if (o.pay === "free" && it.paid) return false; if (o.pay === "paid" && !it.paid) return false;
    return true;
  }).sort((a, b) => STG.findIndex((x) => x[0] === a.stage) - STG.findIndex((x) => x[0] === b.stage) || a.ord - b.ord || (a.role === "main" ? -1 : 1) - (b.role === "main" ? -1 : 1) || a.it.title.localeCompare(b.it.title, "ar"));
}
const badge = (it) => it.src === "pack" ? "" : it.paid ? `<span class="pd">مدفوع${it.price ? " · " + esc(money(it.price)) : ""}</span>` : `<span class="fr">مجاني</span>`;
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");

function filters() {
  const lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const sks = [...new Map(GL.filter((g) => !ST.dom || g.domain === ST.dom).map((g) => [g.skill, g.skillName])).entries()];
  const skO = `<option value="">كل المهارات</option>` + sks.map(([k, n]) => `<option value="${esc(k)}"${ST.skill === k ? " selected" : ""}>${esc(n)}</option>`).join("");
  const stO = `<option value="">كل المستويات</option>` + STG.map((s) => `<option value="${s[0]}"${ST.stage === s[0] ? " selected" : ""}>${s[1]}</option>`).join("");
  const pO = `<option value="">مجاني ومدفوع</option><option value="free"${ST.pay === "free" ? " selected" : ""}>مجاني</option><option value="paid"${ST.pay === "paid" ? " selected" : ""}>مدفوع</option>`;
  return `<div class="skf" role="group" aria-label="تصفية الأهداف"><label>ابحث عن هدف<input type="search" id="glq" value="${esc(ST.q)}" placeholder="مثال: العد"></label><label>العمر أو الصف<select id="gllv">${lvO}</select></label><label>المهارة<select id="glsk">${skO}</select></label><label>مستوى التعلم<select id="glst">${stO}</select></label><label>مجاني أو مدفوع<select id="glpay">${pO}</select></label></div>`;
}
function list() {
  const q = Z.norm(ST.q);
  const a = GL.filter((g) => (!ST.dom || g.domain === ST.dom) && (!ST.skill || g.skill === ST.skill) && (!ST.lv || g.levels.includes(ST.lv)) && (!q || Z.norm(g.name + " " + (g.descr || "") + " " + g.skillName + " " + (g.outcomes || []).join(" ")).includes(q)));
  const withR = a.map((g) => ({ g, n: res(g).length })).filter((x) => x.n > 0);
  const cnt = (d) => GL.filter((g) => g.domain === d.slug && res(g).length).length;
  const chips = DOMS.map((d) => `<button type="button" class="skdom" data-d="${esc(d.slug)}" aria-pressed="${ST.dom === d.slug}" style="--c:${esc(d.color || "#e6dcff")}"><img src="${ROOT}images/ill/${esc(d.icon)}" alt=""><span>${esc(d.name)}</span><small>${AD(cnt(d))} هدف</small></button>`).join("");
  const cards = withR.map(({ g, n }) => `<article class="skcard" style="--c:${esc(g.d.color || "#c1aef0")}"><h3>${esc(g.name)}</h3><div class="mt"><span>${esc(g.d.name)}</span><span>${esc(lvTxt(g.levels))}</span><span>${AD(n)} مورد</span></div><p class="oc">المهارة: ${esc(g.skillName)}</p>${g.descr ? `<p>${esc(g.descr)}</p>` : ""}<a class="go" href="#g=${esc(g.slug)}" aria-label="عرض الموارد: ${esc(g.name)}">عرض الموارد</a></article>`).join("");
  const kid = kidLv();
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>لا توجد أهداف بهذه الاختيارات</h3><p>لا نعرض هدفًا ليس له موارد مرتبطة فعلًا. جرّب تغيير العمر أو المهارة.</p></div>`;
  root.innerHTML = `<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر المجال</h2><div class="skdoms">${chips}</div>${filters()}${kid && !ST.lv ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kid])}. اختر عمره من القائمة لإظهار الأهداف والموارد المناسبة له فقط.</p>` : ""}<p class="skhint" role="status" id="gln">${AD(withR.length)} هدف فيه موارد</p>${withR.length ? `<div class="skgrid">${cards}</div>` : empty}`;
}
const ACTS = ["acts", "bank", "proj", "life", "ready", "val", "exp"];
function planBox(g, rs) {
  const lv = kidLv(), t = S.iso(new Date()), ws = S.weekStart(t);
  const ok = lv ? rs.filter((l) => l.it.lv.includes(lv) && ["acts", "bank", "proj", "life", "ready", "val", "exp", "vid", "songs", "stories", "quiz"].includes(l.it.src)) : [];
  const note = `<p class="m">إضافة النشاط إلى الخطة تنظّم وقت التدريب فقط. إكماله لا يعني أن الطفل أتقن الهدف، ولا توجد نسبة إتقان لأنه لا يوجد تقييم فعلي لهذا الهدف.</p>`;
  if (!lv) return `<div class="skplan"><b>أضف الهدف إلى خطة طفلك</b><p class="m bad">اختر عمر طفلك أو صفه أولًا من صفحة خطتي ليُضاف التدريب إلى خطته.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  if (!ok.length) return `<div class="skplan"><b>أضف الهدف إلى خطة طفلك</b><p class="m bad">لا يوجد مورد لهذا الهدف يناسب مستوى طفلك الحالي (${esc(Z.LVN[lv])}) ويمكن إضافته إلى الخطة.</p></div>`;
  const opts = DAYS.map((n, i) => { const d = S.addDays(ws, i), dd = S.parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  return `<div class="skplan" id="glplan"><b>أضف الهدف إلى خطة طفلك (${esc(Z.LVN[lv])})</b>${ok.map((l, i) => `<label class="ck"><input type="checkbox" data-k="${esc(l.it.key)}"${i < 2 ? " checked" : ""}> ${esc(l.it.title)} <small>(${esc(STN[l.stage] || "")})</small></label>`).join("")}<label>اليوم من هذا الأسبوع <select id="glday">${opts}</select></label><div><button type="button" id="gladd">إضافة المحدد إلى الخطة</button></div>${note}<p class="m" id="glmsg" role="status"></p></div>`;
}
function goal(slug) {
  const g = GL.find((x) => x.slug === slug);
  if (!g) { root.innerHTML = `<a class="skback" href="#">← كل الأهداف</a><div class="fzempty"><h3>لم نجد هذا الهدف</h3><p>قد يكون غير منشور أو مخفيًا مؤقتًا.</p></div>`; return; }
  const rs = res(g), lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.filter((l) => g.levels.includes(l)).map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const sec = STG.map((s) => { const a = rs.filter((l) => l.stage === s[0]); if (!a.length) return ""; return `<h3 class="skstage">${s[1]} <small>${s[2]}</small></h3>${a.map((l) => `<div class="skres"><b>${esc(l.it.title)}</b><div class="mt">${l.it.ct ? `<span>${esc(Z.CT[l.it.ct] || "")}</span>` : ""}<span>${esc(lvTxt(l.it.lv))}</span>${l.role === "sub" ? `<span>هدف داعم</span>` : ""}${badge(l.it)}</div><a href="${esc(url(l.it))}" aria-label="${l.it.paid ? "عرض المعاينة" : "فتح"}: ${esc(l.it.title)}">${l.it.paid ? "عرض المعاينة" : "فتح"}</a></div>`).join("")}`; }).join("");
  const acts = rs.filter((l) => ACTS.includes(l.it.src)).slice(0, 3);
  const sug = acts.length ? `<div class="skpath"><b>أنشطة مقترحة</b><ol>${acts.map((l) => `<li><a href="${esc(url(l.it))}">${esc(l.it.title)}</a></li>`).join("")}</ol></div>` : "";
  const steps = STG.map((s) => { const m = rs.filter((l) => l.stage === s[0])[0]; return m ? `<li><b>${s[1]}:</b> <a href="${esc(url(m.it))}">${esc(m.it.title)}</a></li>` : ""; }).filter(Boolean);
  const path = steps.length > 1 ? `<div class="skpath"><b>مسار مقترح لهذا الهدف</b><p class="skhint">الترتيب: تعرّف ثم تدرّب ثم طبّق ثم راجع، حسب الموارد الموجودة فعلًا. يمكنك فتح أي مورد مباشرة من القائمة.</p><ol>${steps.join("")}</ol></div>` : "";
  root.innerHTML = `<a class="skback" href="#">← كل الأهداف</a><div class="sktitle"><img src="${ROOT}images/ill/${esc(g.d.icon)}" alt=""><div><h2>${esc(g.name)}</h2><div class="mt skcard" style="border:0;box-shadow:none;padding:0;--c:${esc(g.d.color)}"><div class="mt"><span>${esc(g.d.name)}</span><span>${esc(lvTxt(g.levels))}</span><span>المهارة: ${esc(g.skillName)}</span></div></div></div></div>${g.descr ? `<p>${esc(g.descr)}</p>` : ""}<div class="glout"><h3>ما الذي يُتوقع أن يستطيعه الطفل؟</h3><ul>${(g.outcomes || []).map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>${g.verify ? `<div class="glver"><h3>كيف تلاحظ ذلك؟</h3><p>${esc(g.verify)}</p><p class="skhint">هذه ملاحظة منك وليست اختبارًا آليًا.</p></div>` : ""}${g.tip ? `<div class="gltip"><h3>إرشاد لولي الأمر</h3><p>${esc(g.tip)}</p></div>` : ""}<div class="glnote">فتح المورد أو إكمال نشاط لا يعني أن الطفل أتقن الهدف. نعرض فقط ما أُنجز في الخطة كعدد، دون نسبة إتقان.</div><div class="skf"><label>العمر أو الصف<select id="gllv2">${lvO}</select></label></div>${path}${sug}${rs.length ? sec : `<div class="fzempty"><h3>لا توجد موارد بهذه الاختيارات</h3><p>جرّب كل الأعمار والصفوف.</p></div>`}${planBox(g, rs)}<p class="skhint"><a href="${ROOT}skills/#s=${esc(g.skill)}">عرض مهارة «${esc(g.skillName)}»</a></p>`;
  D.title = g.name + " | الأهداف التعليمية | منصة زاد التعليمية";
}
function route() {
  const h = decodeURIComponent((location.hash || "").replace(/^#/, "")), m = h.match(/^g=(.+)$/);
  if (m) goal(m[1]); else { D.title = "الأهداف التعليمية | منصة زاد التعليمية"; list(); }
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const d = e.target.closest(".skdom"); if (d) { ST.dom = ST.dom === d.dataset.d ? "" : d.dataset.d; ST.skill = ""; list(); return; }
    if (e.target.id === "gladd") {
      const box = $("#glplan"), msg = $("#glmsg"), picks = [...box.querySelectorAll("input[data-k]:checked")].map((i) => i.dataset.k), day = $("#glday").value;
      if (!picks.length) { msg.className = "m bad"; msg.textContent = "اختر موردًا واحدًا على الأقل."; return; }
      const errs = [], okk = []; picks.forEach((k) => { const it = BYKEY.get(k), er = it ? S.addToPlan({ key: it.key, lv: it.lv }, day, "تدريب على هدف اخترته من «الأهداف التعليمية».") : "المحتوى غير متاح."; if (er) errs.push(it ? it.title + ": " + er : er); else okk.push(k); });
      msg.className = "m " + (errs.length ? "bad" : "ok");
      msg.innerHTML = (okk.length ? `تمت إضافة ${AD(okk.length)} إلى خطتك (الإضافة ليست إنجازًا ولا إتقانًا للهدف). <a href="${ROOT}plan/">فتح خطتي</a> ` : "") + errs.map(esc).join("<br>");
    }
  });
  D.addEventListener("input", (e) => { if (e.target.id === "glq") { ST.q = e.target.value; const p = e.target.selectionStart; list(); const n = $("#glq"); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (x) { /* */ } } } });
  D.addEventListener("change", (e) => {
    const id = e.target.id, map = { gllv: "lv", glsk: "skill", glst: "stage", glpay: "pay" };
    if (map[id]) { ST[map[id]] = e.target.value; list(); }
    if (id === "gllv2") { ST.lv = e.target.value; route(); }
  });
}
async function init() {
  root = $("#skbody");
  try {
    const [g, sk] = await Promise.all([rpc("goals_public"), rpc("skills_public"), Z.load()]);
    DATA = g; if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(sk); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل الأهداف الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" class="fzt" id="glretry">إعادة المحاولة</button></div>`;
    const b = $("#glretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__goalsTest = { ST, res: (id) => res(GL.find((g) => g.id === id)), get GL() { return GL; } };
init();
})(window);
