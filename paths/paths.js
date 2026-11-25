/* المسارات التعليمية – زاد: مسارات موارد متدرجة حسب العمر/الصف، مرتبطة بالأهداف والمهارات (بيانات حقيقية من paths_public + skills_public + فهرس البحث).
   التقدم يعتمد فقط على ما فُتح (سجل الاستخدام الأخير) وما أُكمل فعلًا في خطة الطفل على هذا الجهاز؛ لا إتقان ولا تشخيص. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const STG = [["recognize", "التعرف", "تقديم الفكرة بصورة مبسطة"], ["understand", "الفهم", "شرح أو قصة أو مثال"], ["practice", "التدريب", "أنشطة وأوراق عمل للممارسة"], ["apply", "التطبيق", "استخدام ما تعلمه في موقف مناسب"], ["review", "المراجعة", "مراجعة قصيرة أو اختبار"]];
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const PD = ["arabic", "math", "science", "life"], AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const ADDABLE = ["acts", "bank", "proj", "life", "ready", "val", "exp", "vid", "songs", "stories", "quiz"];
const ST = { lv: "", dom: "", age: "", grade: "", skill: "", goal: "", pay: "", q: "", started: false, fav: false };
let DATA = null, DOMS = [], BYKEY = new Map(), PL = [], root = null;
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; if (lv.length === 1) return Z.LVN[lv[0]]; return Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const kidId = () => { const d = lget("zad-learn-v3", null); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
/* ---- ما فعله الطفل فعلًا ---- */
function usage() {
  const rc = lget("zad-recent-v1", null), kid = kidId(), opened = (rc && rc.kids && rc.kids[kid] && rc.kids[kid].items) || {}, done = new Set(), planned = new Set();
  const d = lget("zad-learn-v3", null), k = d && d.kids && d.kids[kid], ws = (k && k.plan && k.plan.weeks) || {};
  Object.keys(ws).forEach((w) => (ws[w].items || []).forEach((i) => { planned.add(i.key); if (i.st === "done") done.add(i.key); }));
  return { opened, done, planned };
}
const favs = () => { const f = lget("zad-pathfav-v1", { kids: {} }); return new Set((f.kids && f.kids[kidId()]) || []); };
function setFav(slug, on) { const f = lget("zad-pathfav-v1", { kids: {} }); f.kids = f.kids || {}; const a = new Set(f.kids[kidId()] || []); if (on) a.add(slug); else a.delete(slug); f.kids[kidId()] = [...a]; try { localStorage.setItem("zad-pathfav-v1", JSON.stringify(f)); return true; } catch (e) { return false; } }
function prep(sk) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  const dm = Object.fromEntries((sk.domains || []).map((d) => [d.slug, d]));
  DOMS = PD.map((s) => dm[s]).filter(Boolean);
  PL = [];
  (DATA.paths || []).forEach((p) => {
    if (!dm[p.domain] || !PD.includes(p.domain) || !p.levels.every((l) => AGES.includes(l) || GRADES.includes(l))) return;
    const its = p.items.map((x) => ({ x, it: BYKEY.get(x.k) })).filter((y) => y.it && y.it.lv.some((l) => p.levels.includes(l)));
    if (p.items.some((x) => x.r && !its.some((y) => y.x.k === x.k))) return; /* مورد أساسي غير متاح فعلًا: لا نعرض المسار */
    if (its.length < 3) return;
    PL.push(Object.assign({}, p, { d: dm[p.domain], ri: its.map((y) => ({ it: y.it, stage: y.x.s, req: y.x.r })) }));
  });
}
const payOf = (p) => { const n = p.ri.filter((r) => r.it.paid).length; return n === 0 ? "free" : n === p.ri.length ? "paid" : "mixed"; };
const payBadge = (p) => { const k = payOf(p), n = p.ri.filter((r) => r.it.paid).length; return k === "free" ? `<span class="fr">مجاني</span>` : k === "paid" ? `<span class="pd">مدفوع</span>` : `<span class="pd">فيه ${AD(n)} موارد مدفوعة</span>`; };
const itBadge = (it) => it.src === "pack" ? "" : it.paid ? `<span class="pd">مدفوع${it.price ? " · " + esc(money(it.price)) : ""}</span>` : `<span class="fr">مجاني</span>`;
function started(p, u) { return p.ri.some((r) => u.opened[r.it.key] || u.planned.has(r.it.key)); }
function filters() {
  const lvo = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const sks = [...new Map(PL.filter((p) => !ST.dom || p.domain === ST.dom).map((p) => [p.skill, p.skillName])).entries()];
  const gls = [...new Map(PL.filter((p) => (!ST.dom || p.domain === ST.dom) && (!ST.skill || p.skill === ST.skill)).map((p) => [p.goal, p.goalName])).entries()];
  const o = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map(([k, n]) => `<option value="${esc(k)}"${v === k ? " selected" : ""}>${esc(n)}</option>`).join("");
  const pO = `<option value="">مجاني ومدفوع</option><option value="free"${ST.pay === "free" ? " selected" : ""}>مجاني بالكامل</option><option value="paid"${ST.pay === "paid" ? " selected" : ""}>فيه موارد مدفوعة</option>`;
  return `<div class="skf" role="group" aria-label="تصفية المسارات"><label>ابحث باسم المسار<input type="search" id="pq" value="${esc(ST.q)}" placeholder="مثال: الحروف"></label><label>العمر<select id="page">${lvo(AGES, ST.age, "كل الأعمار")}</select></label><label>الصف<select id="pgr">${lvo(GRADES, ST.grade, "كل الصفوف")}</select></label><label>المهارة<select id="psk">${o(sks, ST.skill, "كل المهارات")}</select></label><label>الهدف التعليمي<select id="pgl">${o(gls, ST.goal, "كل الأهداف")}</select></label><label>مجاني أو مدفوع<select id="ppay">${pO}</select></label><label class="ck"><input type="checkbox" id="pst"${ST.started ? " checked" : ""}> المسارات التي بدأها طفلي</label><label class="ck"><input type="checkbox" id="pfv"${ST.fav ? " checked" : ""}> مفضلتي</label></div>`;
}
function list() {
  const q = Z.norm(ST.q), u = usage(), fv = favs();
  const a = PL.filter((p) => (!ST.dom || p.domain === ST.dom) && (!ST.age || p.levels.includes(ST.age)) && (!ST.grade || p.levels.includes(ST.grade)) && (!ST.skill || p.skill === ST.skill) && (!ST.goal || p.goal === ST.goal) && (!ST.pay || (ST.pay === "free" ? payOf(p) === "free" : payOf(p) !== "free")) && (!ST.started || started(p, u)) && (!ST.fav || fv.has(p.slug)) && (!q || Z.norm(p.name + " " + p.descr + " " + p.goalName + " " + p.skillName + " " + (p.outcomes || []).join(" ")).includes(q)));
  const cnt = (d) => PL.filter((p) => p.domain === d.slug).length;
  const chips = DOMS.map((d) => `<button type="button" class="skdom" data-d="${esc(d.slug)}" aria-pressed="${ST.dom === d.slug}" style="--c:${esc(d.color || "#e6dcff")}"><img src="${ROOT}images/ill/${esc(d.icon)}" alt=""><span>${esc(d.name)}</span><small>${AD(cnt(d))} مسار</small></button>`).join("");
  const cards = a.map((p) => `<article class="skcard" style="--c:${esc(p.d.color || "#c1aef0")}"><h3>${esc(p.name)}</h3><div class="mt"><span>${esc(p.d.name)}</span><span>${esc(lvTxt(p.levels))}</span><span>${AD(p.ri.length)} موارد</span>${started(p, u) ? "<span>بدأه طفلك</span>" : ""}</div><div class="mt">${payBadge(p).replace(/class="(fr|pd)"/, 'class="$1"')}</div><p class="oc" style="font-size:13px;font-weight:700;color:#3a1a85;margin:0">الهدف: ${esc(p.goalName)}</p><a class="go" href="#p=${esc(p.slug)}" aria-label="عرض المسار: ${esc(p.name)}">عرض المسار</a></article>`).join("");
  const kid = kidLv();
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>لا توجد مسارات بهذه الاختيارات</h3><p>لا نعرض مسارًا موارده الأساسية غير جاهزة. جرّب تغيير العمر أو المجال، أو ألغِ بعض الفلاتر.</p></div>`;
  root.innerHTML = `<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر المجال</h2><div class="skdoms">${chips}</div>${filters()}${kid && !ST.age && !ST.grade ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kid])}. اختر عمره أو صفه من القوائم لإظهار المسارات المناسبة له فقط.</p>` : ""}<p class="skhint" role="status" id="pn">${AD(a.length)} مسار</p>${a.length ? `<div class="skgrid">${cards}</div>` : empty}`;
}
/* ---------- صفحة المسار ---------- */
function items(p) { return p.ri.filter((r) => !ST.lv || r.it.lv.includes(ST.lv)); }
function nextIdx(p, u) { const i = p.ri.findIndex((r) => !u.opened[r.it.key]); return i; }
function progress(p, u) {
  const n = p.ri.length, op = p.ri.filter((r) => u.opened[r.it.key]).length, dn = p.ri.filter((r) => u.done.has(r.it.key)).length, pl = p.ri.filter((r) => u.planned.has(r.it.key)).length;
  const last = Math.max(0, ...p.ri.map((r) => (u.opened[r.it.key] && u.opened[r.it.key].at) || 0));
  const lastTxt = last ? new Date(last).toLocaleDateString("ar-OM", { day: "numeric", month: "long", year: "numeric" }) : "";
  if (!op && !pl) return `<div class="pthprog"><b>تقدم المسار</b><br>لم يفتح طفلك موارد هذا المسار بعد. سنعرض هنا عدد الموارد التي فُتحت وما أُكمل فعلًا في خطته، دون ادعاء إتقان.</div>`;
  return `<div class="pthprog"><b>تقدم المسار</b><br>فُتح ${AD(op)} من ${AD(n)} موارد${lastTxt ? " · آخر استخدام: " + esc(lastTxt) : ""}.<br>${pl ? `المكتمل في خطة طفلك: ${AD(dn)} من ${AD(n)} (المتبقي ${AD(n - dn)}).${dn ? `<div class="bar" aria-hidden="true"><i style="width:${Math.round((dn / n) * 100)}%"></i></div>نسبة الموارد المكتملة في الخطة: ${AD(Math.round((dn / n) * 100))}٪` : ""}` : "لا موارد من هذا المسار في خطة طفلك، لذا لا نعرض عددًا للمكتمل."}<br><small>فتح المورد لا يعني أنه أُكمل، ولا تعني النسبة إتقان المهارة.</small></div>`;
}
function planBox(p) {
  const lv = kidLv(), t = S.iso(new Date()), ws = S.weekStart(t);
  const ok = lv ? p.ri.filter((r) => r.it.lv.includes(lv) && ADDABLE.includes(r.it.src)) : [];
  if (!lv) return `<div class="skplan"><b>أضف المسار إلى خطة طفلك</b><p class="m bad">اختر عمر طفلك أو صفه أولًا من صفحة خطتي.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  if (!p.levels.includes(lv)) return `<div class="skplan"><b>أضف المسار إلى خطة طفلك</b><p class="m bad">هذا المسار لا يناسب مستوى طفلك الحالي (${esc(Z.LVN[lv])}). المسار مخصص لـ${esc(lvTxt(p.levels))}.</p></div>`;
  if (!ok.length) return `<div class="skplan"><b>أضف المسار إلى خطة طفلك</b><p class="m bad">لا يوجد في المسار مورد يناسب طفلك ويمكن إضافته إلى الخطة.</p></div>`;
  const opts = DAYS.map((n, i) => { const d = S.addDays(ws, i), dd = S.parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  return `<div class="skplan" id="pplan"><b>أضف المسار إلى خطة طفلك (${esc(Z.LVN[lv])})</b>${ok.map((r, i) => `<label class="ck"><input type="checkbox" data-k="${esc(r.it.key)}"${i < 3 ? " checked" : ""}> ${esc(r.it.title)}</label>`).join("")}<label>اليوم من هذا الأسبوع <select id="pday">${opts}</select></label><div><button type="button" id="padd">إضافة المحدد إلى الخطة</button></div><p class="m">الإضافة تنظّم الوقت فقط وليست إنجازًا. إكمال الموارد لا يعني إتقان المهارة.</p><p class="m" id="pmsg" role="status"></p></div>`;
}
function path(slug) {
  const p = PL.find((x) => x.slug === slug);
  if (!p) { root.innerHTML = `<a class="skback" href="#">← كل المسارات</a><div class="fzempty"><h3>لم نجد هذا المسار</h3><p>قد يكون غير منشور أو موارده غير جاهزة.</p></div>`; return; }
  const u = usage(), all = p.ri, vis = items(p), ni = nextIdx(p, u), anyOp = all.some((r) => u.opened[r.it.key]), fv = favs().has(p.slug);
  const lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.filter((l) => p.levels.includes(l)).map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const num = new Map(all.map((r, i) => [r.it.key, i + 1]));
  const sec = STG.map((g) => { const a = vis.filter((r) => r.stage === g[0]); if (!a.length) return ""; return `<h3 class="skstage">${g[1]} <small>${g[2]}</small></h3>${a.map((r) => { const i = num.get(r.it.key) - 1, st = u.done.has(r.it.key) ? "done" : u.opened[r.it.key] ? "open" : ""; return `<div class="pthstep"><span class="no ${st}" aria-hidden="true">${AD(i + 1)}</span><b>${esc(r.it.title)}</b><div class="mt">${r.it.ct ? `<span>${esc(Z.CT[r.it.ct] || "")}</span>` : ""}<span>${esc(lvTxt(r.it.lv))}</span>${r.req ? "" : "<span>اختياري</span>"}${st === "done" ? "<span>مكتمل في الخطة</span>" : st === "open" ? "<span>فُتح</span>" : ""}${itBadge(r.it)}</div><a class="pthgo" data-i="${i}" href="${esc(url(r.it))}" aria-label="${r.it.paid ? "عرض المعاينة" : "فتح"}: ${esc(r.it.title)}">${r.it.paid ? "عرض المعاينة" : "فتح"}</a></div>`; }).join("")}`; }).join("");
  const first = all[0], cont = anyOp && ni >= 0 ? all[ni] : null;
  root.innerHTML = `<a class="skback" href="#">← كل المسارات</a><div class="pthcov" style="--c:${esc(p.d.color)}"><img src="${ROOT}images/ill/${esc(p.d.icon)}" alt=""><div><h2>${esc(p.name)}</h2><div class="pthmeta"><span>${esc(p.d.name)}</span><span>${esc(lvTxt(p.levels))}</span><span>${AD(all.length)} موارد متاحة فعلًا</span>${p.est ? `<span>مدة تقديرية: ${AD(p.est)} دقيقة</span>` : ""}${payBadge(p)}</div></div></div>${p.descr ? `<p>${esc(p.descr)}</p>` : ""}<div class="pthbar"><a id="pstart" class="pthgo" data-i="0" href="${esc(url(first.it))}">ابدأ المسار</a>${cont ? `<a id="pcont" class="pthgo alt" data-i="${ni}" href="${esc(url(cont.it))}">تابع المسار (المورد ${AD(ni + 1)})</a>` : ""}<button type="button" id="pfav" class="alt" aria-pressed="${fv}">${fv ? "♥ في المفضلة" : "♡ إضافة إلى المفضلة"}</button></div><p class="skhint" id="pfm" role="status"></p><div class="pthgoal"><h3>الهدف التعليمي</h3><a href="${ROOT}goals/#g=${esc(p.goal)}"><b>${esc(p.goalName)}</b></a><ul>${(p.outcomes || []).map((o) => `<li>${esc(o)}</li>`).join("")}</ul><p style="margin:6px 0 0">المهارة المرتبطة: <a href="${ROOT}skills/#s=${esc(p.skill)}">${esc(p.skillName)}</a></p></div>${progress(p, u)}<p class="skhint">الموارد مرتبة من الأبسط إلى الأعقد، ويمكنك فتح أي مورد بمفرده دون اتباع الترتيب.</p><div class="skf"><label>عرض موارد العمر أو الصف<select id="plv2">${lvO}</select></label></div>${vis.length ? sec : `<div class="fzempty"><h3>لا موارد بهذا الاختيار</h3><p>جرّب كل الأعمار والصفوف.</p></div>`}${planBox(p)}`;
  D.title = p.name + " | المسارات التعليمية | منصة زاد التعليمية";
}
/* حفظ سياق المسار لشريط التنقل في صفحات الموارد (جلسة المتصفح فقط) */
function remember(p, i) {
  try { sessionStorage.setItem("zad-path-cur", JSON.stringify({ slug: p.slug, name: p.name, i, back: location.href.split("#")[0] + "#p=" + p.slug, list: p.ri.map((r) => ({ k: r.it.key, u: url(r.it), t: r.it.title })) })); } catch (e) { /* */ }
}
function route() {
  const h = decodeURIComponent((location.hash || "").replace(/^#/, "")), m = h.match(/^p=(.+)$/);
  if (m) path(m[1]); else { D.title = "المسارات التعليمية | منصة زاد التعليمية"; list(); }
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const d = e.target.closest(".skdom"); if (d) { ST.dom = ST.dom === d.dataset.d ? "" : d.dataset.d; ST.skill = ""; ST.goal = ""; list(); return; }
    const g = e.target.closest("a.pthgo"); if (g) { const p = PL.find((x) => x.slug === (decodeURIComponent(location.hash).match(/^#p=(.+)$/) || [])[1]); if (p) remember(p, +g.dataset.i); return; }
    if (e.target.id === "pfav") { const slug = (decodeURIComponent(location.hash).match(/^#p=(.+)$/) || [])[1], on = e.target.getAttribute("aria-pressed") !== "true", ok = setFav(slug, on), m = $("#pfm"); if (!ok) { m.textContent = "تعذّر الحفظ على هذا المتصفح."; return; } e.target.setAttribute("aria-pressed", on); e.target.textContent = on ? "♥ في المفضلة" : "♡ إضافة إلى المفضلة"; m.textContent = on ? "أُضيف المسار إلى مفضلة طفلك على هذا الجهاز." : "أُزيل المسار من المفضلة."; return; }
    if (e.target.id === "padd") {
      const box = $("#pplan"), msg = $("#pmsg"), picks = [...box.querySelectorAll("input[data-k]:checked")].map((i) => i.dataset.k), day = $("#pday").value;
      if (!picks.length) { msg.className = "m bad"; msg.textContent = "اختر موردًا واحدًا على الأقل."; return; }
      const errs = [], okk = []; picks.forEach((k) => { const it = BYKEY.get(k), er = it ? S.addToPlan({ key: it.key, lv: it.lv }, day, "جزء من مسار اخترته من «المسارات التعليمية».") : "المحتوى غير متاح."; if (er) errs.push(it ? it.title + ": " + er : er); else okk.push(k); });
      msg.className = "m " + (errs.length ? "bad" : "ok");
      msg.innerHTML = (okk.length ? `تمت إضافة ${AD(okk.length)} إلى خطتك (الإضافة ليست إنجازًا ولا إتقانًا). <a href="${ROOT}plan/">فتح خطتي</a> ` : "") + errs.map(esc).join("<br>");
    }
  });
  D.addEventListener("input", (e) => { if (e.target.id === "pq") { ST.q = e.target.value; const p = e.target.selectionStart; list(); const n = $("#pq"); if (n) { n.focus(); try { n.setSelectionRange(p, p); } catch (x) { /* */ } } } });
  D.addEventListener("change", (e) => {
    const id = e.target.id, map = { page: "age", pgr: "grade", psk: "skill", pgl: "goal", ppay: "pay" };
    if (map[id]) { ST[map[id]] = e.target.value; if (id === "psk") ST.goal = ""; list(); }
    if (id === "pst") { ST.started = e.target.checked; list(); } if (id === "pfv") { ST.fav = e.target.checked; list(); }
    if (id === "plv2") { ST.lv = e.target.value; route(); }
  });
}
async function init() {
  root = $("#skbody");
  try {
    const [g, sk] = await Promise.all([rpc("paths_public"), rpc("skills_public"), Z.load()]);
    DATA = g; if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(sk); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المسارات الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" class="fzt" id="pretry">إعادة المحاولة</button></div>`;
    const b = $("#pretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__pathsTest = { ST, get PL() { return PL; }, usage };
init();
})(window);
