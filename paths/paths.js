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
const PD = ["arabic", "math", "science", "life", "creative"], AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const ADDABLE = ["acts", "bank", "proj", "life", "ready", "val", "exp", "vid", "songs", "stories", "quiz"];
const ST = { lv: "", dom: "", age: "", grade: "", skill: "", goal: "", diff: "", pay: "", q: "", started: false, fav: false };
const PK = "zad-pathprog-v1", LK = "zad-learn-v3";
const DIFF = { easy: "سهل", mid: "متوسط", hard: "أصعب قليلًا" };
const SRCN = { lib: "ملف", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "أنشودة", stories: "قصة", quiz: "اختبار", pack: "حزمة" };
let DATA = null, MORE = new Map(), DOMS = [], BYKEY = new Map(), PL = [], root = null, VKID = null;
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; if (lv.length === 1) return Z.LVN[lv[0]]; return Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const kids = () => { const d = lget(LK, null), ks = d && d.kids && Object.keys(d.kids).length ? Object.keys(d.kids) : ["k1"]; return ks.map((id, i) => ({ id, name: ((d && d.kids && d.kids[id] && (d.kids[id].name || d.kids[id].n)) || "") || "الطفل " + AD(i + 1) })); };
const kidId = () => { const d = lget(LK, null); if (VKID && kids().some((x) => x.id === VKID)) return VKID; return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const progOf = (slug, kid) => { const s = lget(PK, { kids: {} }), k = (s.kids && s.kids[kid || kidId()]) || {}; return k[slug] || {}; };
function setProg(slug, patch, kid) { const s = lget(PK, { kids: {} }); s.kids = s.kids || {}; const id = kid || kidId(), k = (s.kids[id] = s.kids[id] || {}), r = (k[slug] = k[slug] || {}); Object.assign(r, patch); return lset(PK, s); }
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
/* ---- ما فعله الطفل فعلًا ---- */
function usage(kidArg) {
  const rc = lget("zad-recent-v1", null), kid = kidArg || kidId(), opened = (rc && rc.kids && rc.kids[kid] && rc.kids[kid].items) || {}, done = new Set(), planned = new Set();
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
    const mo = MORE.get(p.slug) || {};
    PL.push(Object.assign({}, p, { diff: mo.diff || "", stages: mo.stages || [], prior: mo.prior || [], d: dm[p.domain], ri: its.map((y) => ({ it: y.it, stage: y.x.s, req: y.x.r })) }));
  });
}
const payOf = (p) => { const n = p.ri.filter((r) => r.it.paid).length; return n === 0 ? "free" : n === p.ri.length ? "paid" : "mixed"; };
const payBadge = (p) => { const k = payOf(p), n = p.ri.filter((r) => r.it.paid).length; return k === "free" ? `<span class="fr">مجاني</span>` : k === "paid" ? `<span class="pd">مدفوع</span>` : `<span class="pd">فيه ${AD(n)} موارد مدفوعة</span>`; };
const itBadge = (it) => it.src === "pack" ? "" : it.paid ? `<span class="pd">مدفوع${it.price ? " · " + esc(money(it.price)) : ""}</span>` : `<span class="fr">مجاني</span>`;
const isOpen = (u, r) => !!u.opened[r.it.key];
function started(p, u) { return p.ri.some((r) => u.opened[r.it.key] || u.planned.has(r.it.key)) || !!progOf(p.slug).started; }
const reqOf = (p) => p.ri.filter((r) => r.req);
const isDone = (p, u) => { const q = reqOf(p); return q.length > 0 && q.every((r) => u.done.has(r.it.key)); };
/* مراحل المسار: الاسم والشرح والمهارة من إدارة المحتوى إن وُجدت، وإلا الافتراضي لنوع المرحلة */
function stagesOf(p, rows) {
  const info = new Map((p.stages || []).map((x) => [x.stage, x]));
  return STG.map(([k, nm, ex]) => {
    const its = rows.filter((r) => r.stage === k); if (!its.length) return null;
    const o = info.get(k) || {};
    return { k, name: o.name || nm, expl: o.expl || ex, skill: o.skill ? { slug: o.skill, name: o.skillName } : { slug: p.skill, name: p.skillName }, its, custom: !!o.name };
  }).filter(Boolean);
}
function curStage(p, u, sg) {
  const pr = progOf(p.slug);
  if (pr.stage && sg.some((s) => s.k === pr.stage)) return pr.stage;
  const f = sg.find((s) => s.its.some((r) => r.req && !isOpen(u, r))) || sg.find((s) => s.its.some((r) => !isOpen(u, r)));
  return (f || sg[sg.length - 1]).k;
}
function nextItem(sg, u, key) {
  const i = Math.max(0, sg.findIndex((s) => s.k === key)), order = sg.slice(i).concat(sg.slice(0, i));
  for (const s of order) { const a = s.its.filter((r) => !isOpen(u, r)); const f = a.find((r) => r.it.src !== "proj") || a[0]; if (f) return { r: f, s }; }
  return { r: sg[i].its[0], s: sg[i] };
}
const mainSkills = (p) => [...new Set([p.skillName].concat((p.stages || []).map((x) => x.skillName).filter(Boolean)))].slice(0, 3);
const counts = (p) => { const pj = p.ri.filter((r) => r.it.src === "proj").length; return { a: p.ri.length - pj, pj }; };
const idxOf = (p, key) => p.ri.findIndex((r) => r.it.key === key);
const tabs = (on) => `<div class="pthtabs" role="navigation" aria-label="أقسام المركز"><a href="#"${on === "list" ? ' aria-current="page"' : ""}>المسارات</a><a href="#parent"${on === "parent" ? ' aria-current="page"' : ""}>لوحة ولي الأمر</a></div>`;
const libBack = `<a class="skback" id="plib" href="${ROOT}library/">← العودة إلى المكتبة التعليمية</a>`;
function filters() {
  const lvo = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const sks = [...new Map(PL.filter((p) => !ST.dom || p.domain === ST.dom).map((p) => [p.skill, p.skillName])).entries()];
  const gls = [...new Map(PL.filter((p) => (!ST.dom || p.domain === ST.dom) && (!ST.skill || p.skill === ST.skill)).map((p) => [p.goal, p.goalName])).entries()];
  const o = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map(([k, n]) => `<option value="${esc(k)}"${v === k ? " selected" : ""}>${esc(n)}</option>`).join("");
  const pO = `<option value="">مجاني ومدفوع</option><option value="free"${ST.pay === "free" ? " selected" : ""}>مجاني بالكامل</option><option value="paid"${ST.pay === "paid" ? " selected" : ""}>فيه موارد مدفوعة</option>`;
  const dO = `<option value="">كل المستويات</option>` + Object.entries(DIFF).map(([k, n]) => `<option value="${k}"${ST.diff === k ? " selected" : ""}>${n}</option>`).join("");
  return `<div class="skf" role="group" aria-label="تصفية المسارات"><label>ابحث باسم المسار<input type="search" id="pq" value="${esc(ST.q)}" placeholder="مثال: الحروف"></label><label>العمر<select id="page">${lvo(AGES, ST.age, "كل الأعمار")}</select></label><label>الصف<select id="pgr">${lvo(GRADES, ST.grade, "كل الصفوف")}</select></label><label>مستوى الصعوبة<select id="pdf">${dO}</select></label><label>نوع المهارة<select id="psk">${o(sks, ST.skill, "كل المهارات")}</select></label><label>الهدف التعليمي<select id="pgl">${o(gls, ST.goal, "كل الأهداف")}</select></label><label>مجاني أو مدفوع<select id="ppay">${pO}</select></label><label class="ck"><input type="checkbox" id="pst"${ST.started ? " checked" : ""}> المسارات التي بدأها طفلي</label><label class="ck"><input type="checkbox" id="pfv"${ST.fav ? " checked" : ""}> مفضلتي</label></div>`;
}
/* اقتراحات اختيارية: بحسب عمر/صف الطفل، والمجال المختار، ومهارات فتح طفلك لها أنشطة. لا اقتراح إن لم تتوفر بيانات */
function practicedSkills(u) { const s = new Set(); PL.forEach((p) => { if (p.ri.some((r) => u.opened[r.it.key])) s.add(p.skill); }); return s; }
function suggest(u) {
  const lv = kidLv(); if (!lv) return [];
  const pr = practicedSkills(u);
  return PL.filter((p) => p.levels.includes(lv) && !isDone(p, u) && !started(p, u) && (!ST.dom || p.domain === ST.dom)).map((p, i) => ({ p, sc: pr.has(p.skill) ? 1 : 0, i })).sort((a, b) => b.sc - a.sc || a.i - b.i).slice(0, 3)
    .map((x) => ({ p: x.p, why: x.sc ? `يرتبط بمهارة «${x.p.skillName}» التي فتح طفلك أنشطة لها` : `مناسب لـ${Z.LVN[lv]}${ST.dom ? " وللمجال الذي اخترته" : ""}` }));
}
function card(p, u, fv) {
  const c = counts(p), pr = progOf(p.slug), go = started(p, u), sg = stagesOf(p, p.ri), cur = go ? curStage(p, u, sg) : sg[0].k, ni = nextItem(sg, u, cur), i = idxOf(p, ni.r.it.key);
  const ms = mainSkills(p);
  return `<article class="skcard pcard" data-slug="${esc(p.slug)}" style="--c:${esc(p.d.color || "#c1aef0")}"><div class="pic"><img src="${ROOT}images/ill/${esc(p.d.icon)}" alt="" width="64" height="64"></div><h3>${esc(p.name)}</h3><div class="mt"><span>${esc(p.d.name)}</span><span>${esc(lvTxt(p.levels))}</span>${p.diff ? `<span class="df">${esc(DIFF[p.diff])}</span>` : ""}</div>${p.descr ? `<p class="pdsc">${esc(p.descr.length > 95 ? p.descr.slice(0, 92) + "…" : p.descr)}</p>` : ""}<p class="pms"><b>المهارات:</b> ${ms.map(esc).join("، ")}</p><div class="mt"><span>${AD(c.a)} أنشطة وموارد</span>${c.pj ? `<span>${AD(c.pj)} مشروع</span>` : ""}${go ? "<span>بدأه طفلك</span>" : ""}</div><div class="mt">${payBadge(p)}</div><div class="pact"><a class="go" href="#p=${esc(p.slug)}" aria-label="عرض المسار: ${esc(p.name)}">عرض المسار</a><a class="go alt pthgo" data-slug="${esc(p.slug)}" data-i="${i}" data-stage="${esc(ni.s.k)}" href="${esc(url(ni.r.it))}" aria-label="${go ? "متابعة" : "ابدأ"} المسار: ${esc(p.name)}">${go ? "متابعة المسار" : "ابدأ المسار"}</a><button type="button" class="alt pfvc" data-slug="${esc(p.slug)}" aria-pressed="${fv.has(p.slug)}" aria-label="حفظ في المفضلة: ${esc(p.name)}">${fv.has(p.slug) ? "♥ في المفضلة" : "♡ حفظ في المفضلة"}</button></div></article>`;
}
function list() {
  const q = Z.norm(ST.q), u = usage(), fv = favs();
  const a = PL.filter((p) => (!ST.dom || p.domain === ST.dom) && (!ST.age || p.levels.includes(ST.age)) && (!ST.grade || p.levels.includes(ST.grade)) && (!ST.skill || p.skill === ST.skill) && (!ST.goal || p.goal === ST.goal) && (!ST.diff || p.diff === ST.diff) && (!ST.pay || (ST.pay === "free" ? payOf(p) === "free" : payOf(p) !== "free")) && (!ST.started || started(p, u)) && (!ST.fav || fv.has(p.slug)) && (!q || Z.norm(p.name + " " + p.descr + " " + p.goalName + " " + p.skillName + " " + (p.outcomes || []).join(" ")).includes(q)));
  const cnt = (d) => PL.filter((p) => p.domain === d.slug).length;
  const chips = DOMS.map((d) => `<button type="button" class="skdom" data-d="${esc(d.slug)}" aria-pressed="${ST.dom === d.slug}" style="--c:${esc(d.color || "#e6dcff")}"><img src="${ROOT}images/ill/${esc(d.icon)}" alt=""><span>${esc(d.name)}</span><small>${AD(cnt(d))} مسار</small></button>`).join("");
  const cards = a.map((p) => card(p, u, fv)).join("");
  const kid = kidLv();
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>${PL.length ? "لا توجد مسارات بهذه الاختيارات" : "لا توجد مسارات منشورة بعد"}</h3><p>${PL.length ? "لا نعرض مسارًا موارده الأساسية غير جاهزة. جرّب تغيير العمر أو المجال، أو ألغِ بعض الفلاتر." : "تُنشر المسارات بعد مراجعتها من الفريق التعليمي. عد قريبًا، أو تصفّح <a href=\"" + ROOT + "library/\">المكتبة التعليمية</a>."}</p></div>`;
  const sg = suggest(u), cont = PL.filter((p) => started(p, u) && !isDone(p, u)).slice(0, 3);
  const sugH = sg.length ? `<section class="pthsug" aria-label="مسارات مقترحة"><h2>مسارات مقترحة لطفلك <small>اقتراح اختياري وليس إلزاميًا</small></h2><div class="pthsugl">${sg.map((x) => `<div class="pthsugi"><b>${esc(x.p.name)}</b><span>${esc(x.why)}</span><a href="#p=${esc(x.p.slug)}">عرض المسار</a></div>`).join("")}</div></section>` : "";
  const contH = cont.length ? `<section class="pthsug" aria-label="تابع مساراتك"><h2>تابع مساراتك</h2><div class="pthsugl">${cont.map((p) => { const sgx = stagesOf(p, p.ri), cs = sgx.find((s) => s.k === curStage(p, u, sgx)); return `<div class="pthsugi"><b>${esc(p.name)}</b><span>المرحلة الحالية: ${esc(cs.name)}</span><a href="#p=${esc(p.slug)}">متابعة المسار</a></div>`; }).join("")}</div></section>` : "";
  root.innerHTML = `${libBack}${tabs("list")}<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر المجال</h2><div class="skdoms">${chips}</div>${contH}${sugH}${filters()}${kid && !ST.age && !ST.grade ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kid])}. اختر عمره أو صفه من القوائم لإظهار المسارات المناسبة له فقط.</p>` : !kid ? `<p class="skhint">اختر عمر طفلك أو صفه من <a href="${ROOT}plan/">خطتي التعليمية</a> لتظهر لك اقتراحات مناسبة له.</p>` : ""}<p class="skhint" role="status" id="pn">${AD(a.length)} مسار</p>${a.length ? `<div class="skgrid pthgrid">${cards}</div>` : empty}`;
}
/* ---------- صفحة المسار ---------- */
function items(p) { return p.ri.filter((r) => !ST.lv || r.it.lv.includes(ST.lv)); }
function progress(p, u, sgAll) {
  const n = p.ri.length, op = p.ri.filter((r) => u.opened[r.it.key]), dn = p.ri.filter((r) => u.done.has(r.it.key)).length, pl = p.ri.filter((r) => u.planned.has(r.it.key)).length;
  const last = Math.max(0, ...p.ri.map((r) => (u.opened[r.it.key] && u.opened[r.it.key].at) || 0));
  const lastTxt = last ? new Date(last).toLocaleDateString("ar-OM", { day: "numeric", month: "long", year: "numeric" }) : "";
  const pr = progOf(p.slug);
  if (!op.length && !pl && !pr.started) return `<div class="pthprog" id="pprog"><b>تقدم المسار</b><br>لم يبدأ طفلك هذا المسار بعد. عند البدء سنعرض هنا المرحلة الحالية والأنشطة التي بدأها وما أُكمل في خطته والمهارات التي بدأ التدريب عليها، دون ادعاء إتقان.</div>`;
  const cs = sgAll.find((s) => s.k === curStage(p, u, sgAll)), ni = nextItem(sgAll, u, cs.k), prac = sgAll.filter((s) => s.its.some((r) => u.opened[r.it.key])).map((s) => s.skill.name);
  const used = op.slice(0, 5).map((r) => esc(r.it.title)).join("، ") + (op.length > 5 ? " وغيرها" : "");
  return `<div class="pthprog" id="pprog"><b>تقدم المسار</b><ul class="pthpl"><li>المرحلة الحالية: <b>${esc(cs.name)}</b></li><li>أنشطة بدأها الطفل: ${AD(op.length)} من ${AD(n)}${lastTxt ? " · آخر استخدام: " + esc(lastTxt) : ""}</li><li>${pl ? `المكتمل في خطة طفلك: ${AD(dn)} من ${AD(n)}` : "لا موارد من هذا المسار في خطة طفلك، لذا لا نعرض عددًا للمكتمل."}</li><li>مهارات بدأ التدريب عليها: ${prac.length ? [...new Set(prac)].map(esc).join("، ") : "لا شيء بعد"}</li><li>موارد استخدمها: ${op.length ? used : "لا شيء بعد"}</li></ul>${pl && dn ? `<div class="bar" aria-hidden="true"><i style="width:${Math.round((dn / n) * 100)}%"></i></div>` : ""}<a class="pthgo cont" id="pcont" data-slug="${esc(p.slug)}" data-i="${idxOf(p, ni.r.it.key)}" data-stage="${esc(ni.s.k)}" href="${esc(url(ni.r.it))}">متابعة المسار</a><br><small>فتح المورد لا يعني أنه أُكمل، وإكمال نشاط واحد لا يعني إتقان المهارة.</small></div>`;
}
function stageCard(p, u, sg, s, k, cur) {
  const n = s.its.length, op = s.its.filter((r) => u.opened[r.it.key]).length, dn = s.its.filter((r) => u.done.has(r.it.key)).length;
  const first = s.its.filter((r) => !u.opened[r.it.key]); const go = first.find((r) => r.it.src !== "proj") || first[0] || s.its[0];
  const nxt = sg[k + 1], prv = sg[k - 1], isCur = s.k === cur;
  const rows = s.its.map((r) => { const i = idxOf(p, r.it.key), st = u.done.has(r.it.key) ? "done" : u.opened[r.it.key] ? "open" : ""; return `<div class="pthstep"><span class="no ${st}" aria-hidden="true">${AD(i + 1)}</span><b>${esc(r.it.title)}</b><div class="mt"><span>${esc(SRCN[r.it.src] || Z.CT[r.it.ct] || "مورد")}</span>${r.it.src === "proj" ? "<span>مشروع</span>" : ""}${r.req ? "" : "<span>اختياري</span>"}${st === "done" ? "<span>مكتمل في الخطة</span>" : st === "open" ? "<span>فُتح</span>" : ""}${itBadge(r.it)}</div><a class="pthgo" data-slug="${esc(p.slug)}" data-i="${i}" data-stage="${esc(s.k)}" href="${esc(url(r.it))}" aria-label="${r.it.paid ? "عرض المعاينة" : "فتح"}: ${esc(r.it.title)}">${r.it.paid ? "عرض المعاينة" : "فتح"}</a></div>`; }).join("");
  return `<section class="pthstg${isCur ? " cur" : ""}" id="stg-${esc(s.k)}" data-stage="${esc(s.k)}"><header><span class="sn">${AD(k + 1)}</span><div><h3>${esc(s.name)}${isCur ? ' <em>المرحلة الحالية</em>' : ""}</h3><p class="tsk">المهارة المستهدفة: <a href="${ROOT}skills/#s=${esc(s.skill.slug)}">${esc(s.skill.name)}</a></p></div></header><p class="ex">${esc(s.expl)}</p><p class="cn">${AD(n)} موارد · فُتح ${AD(op)}${dn ? " · مكتمل في الخطة " + AD(dn) : ""}</p>${rows}<div class="pstgact"><a class="pthgo go" data-slug="${esc(p.slug)}" data-i="${idxOf(p, go.it.key)}" data-stage="${esc(s.k)}" href="${esc(url(go.it))}">ابدأ النشاط</a>${nxt ? `<button type="button" class="alt" data-goto="${esc(nxt.k)}" data-slug="${esc(p.slug)}">انتقل إلى المرحلة التالية</button>` : ""}${prv ? `<button type="button" class="alt" data-goto="${esc(prv.k)}" data-slug="${esc(p.slug)}">عودة إلى المرحلة السابقة</button><a class="alt lk" href="${ROOT}skills/#s=${esc(prv.skill.slug)}">مراجعة مهارة سابقة: ${esc(prv.skill.name)}</a>` : ""}</div></section>`;
}
function reqBox(p) {
  const g = {}; reqOf(p).forEach((r) => { const t = SRCN[r.it.src] || "مورد"; g[t] = (g[t] || 0) + 1; });
  const e = Object.entries(g); if (!e.length) return "";
  return `<div class="pthgoal"><h3>الموارد المطلوبة</h3><ul>${e.map(([t, n]) => `<li>${esc(t)}: ${AD(n)}</li>`).join("")}</ul><small>الموارد الاختيارية لا تُحسب هنا.</small></div>`;
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
  if (!p) { root.innerHTML = `${libBack}<a class="skback" href="#">← كل المسارات</a><div class="fzempty"><h3>لم نجد هذا المسار</h3><p>قد يكون غير منشور أو موارده غير جاهزة.</p></div>`; return; }
  const u = usage(), all = p.ri, vis = items(p), sgAll = stagesOf(p, all), sg = stagesOf(p, vis), cur = curStage(p, u, sgAll), fv = favs().has(p.slug), c = counts(p);
  const lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.filter((l) => p.levels.includes(l)).map((l) => `<option value="${l}"${ST.lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const first = nextItem(sgAll, { opened: {} }, sgAll[0].k).r;
  const projs = all.filter((r) => r.it.src === "proj");
  const skills = [...new Map([[p.skill, p.skillName]].concat(sgAll.map((s) => [s.skill.slug, s.skill.name]))).entries()];
  const prior = (p.prior || []).length ? `<div class="pthgoal"><h3>المهارات السابقة المقترحة</h3><ul>${p.prior.map((x) => `<li><a href="${ROOT}skills/#s=${esc(x.s)}">${esc(x.name)}</a>${x.note ? " — " + esc(x.note) : ""}</li>`).join("")}</ul><small>اقتراح غير إلزامي: يمكنك البدء مباشرة.</small></div>` : "";
  root.innerHTML = `${libBack}<a class="skback" href="#">← كل المسارات</a><div class="pthcov" style="--c:${esc(p.d.color)}"><img src="${ROOT}images/ill/${esc(p.d.icon)}" alt=""><div><h2>${esc(p.name)}</h2><div class="pthmeta"><span>${esc(p.d.name)}</span><span>${esc(lvTxt(p.levels))}</span>${p.diff ? `<span>الصعوبة: ${esc(DIFF[p.diff])}</span>` : ""}<span>${AD(c.a)} أنشطة وموارد</span>${c.pj ? `<span>${AD(c.pj)} مشروع</span>` : ""}${p.est ? `<span>مدة تقديرية: ${AD(p.est)} دقيقة</span>` : ""}${payBadge(p)}</div></div></div>${p.descr ? `<p>${esc(p.descr)}</p>` : ""}<div class="pthbar"><a id="pstart" class="pthgo" data-slug="${esc(p.slug)}" data-i="${idxOf(p, first.it.key)}" data-stage="${esc(first.stage)}" href="${esc(url(first.it))}">ابدأ المسار</a><button type="button" id="pfav" class="alt" aria-pressed="${fv}">${fv ? "♥ في المفضلة" : "♡ حفظ في المفضلة"}</button></div><p class="skhint" id="pfm" role="status"></p><div class="pthgoal"><h3>الهدف التعليمي العام</h3><a href="${ROOT}goals/#g=${esc(p.goal)}"><b>${esc(p.goalName)}</b></a><ul>${(p.outcomes || []).map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div><div class="pthgoal"><h3>المهارات التي يتضمنها المسار</h3><ul>${skills.map(([s, n]) => `<li><a href="${ROOT}skills/#s=${esc(s)}">${esc(n)}</a></li>`).join("")}</ul></div>${prior}${reqBox(p)}${projs.length ? `<div class="pthgoal" id="pprojs"><h3>المشاريع التعليمية المرتبطة</h3><ul>${projs.map((r) => `<li><a class="pthgo" data-slug="${esc(p.slug)}" data-i="${idxOf(p, r.it.key)}" data-stage="${esc(r.stage)}" href="${esc(url(r.it))}">${esc(r.it.title)}</a>${r.req ? "" : " (اختياري)"}</li>`).join("")}</ul></div>` : ""}${progress(p, u, sgAll)}<p class="skhint">المراحل مرتبة من الأبسط إلى الأعقد، ويمكنك فتح أي مورد بمفرده أو العودة إلى مرحلة سابقة في أي وقت.</p><div class="skf"><label>عرض موارد العمر أو الصف<select id="plv2">${lvO}</select></label></div>${vis.length ? sg.map((s, k) => stageCard(p, u, sg, s, k, cur)).join("") : `<div class="fzempty"><h3>لا موارد بهذا الاختيار</h3><p>جرّب كل الأعمار والصفوف.</p></div>`}${planBox(p)}`;
  D.title = p.name + " | المسارات التعليمية | منصة زاد التعليمية";
}
/* لوحة ولي الأمر: بيانات الطفل على هذا الجهاز فقط */
function parent() {
  D.title = "لوحة ولي الأمر | المسارات التعليمية | منصة زاد التعليمية";
  const kid = kidId(), u = usage(kid), st = PL.filter((p) => started(p, u) && !isDone(p, u)), dn = PL.filter((p) => isDone(p, u)), allStarted = PL.filter((p) => started(p, u));
  const ks = kids(), sel = ks.length > 1 ? `<label class="lab" for="fkid">الطفل</label><select id="fkid">${ks.map((x) => `<option value="${esc(x.id)}"${x.id === kid ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select>` : "";
  const row = (p) => { const sgx = stagesOf(p, p.ri), cs = sgx.find((s) => s.k === curStage(p, u, sgx)), op = p.ri.filter((r) => u.opened[r.it.key]).length, d = p.ri.filter((r) => u.done.has(r.it.key)).length; return `<div class="pthrow"><span><b>${esc(p.name)}</b><br><small>${esc(p.d.name)} · ${esc(lvTxt(p.levels))} · المرحلة الحالية: ${esc(cs.name)} · فُتح ${AD(op)} من ${AD(p.ri.length)} · مكتمل في الخطة ${AD(d)}</small></span><a class="b" href="#p=${esc(p.slug)}">عرض المسار</a></div>`; };
  const prac = new Map(); allStarted.forEach((p) => stagesOf(p, p.ri).forEach((s) => { const n = s.its.filter((r) => u.opened[r.it.key]).length; if (n) prac.set(s.skill.slug, { name: s.skill.name, n: (prac.get(s.skill.slug) || { n: 0 }).n + n }); }));
  const fu = st.map((p) => { const sgx = stagesOf(p, p.ri), cs = curStage(p, u, sgx), ni = nextItem(sgx, u, cs); if (u.opened[ni.r.it.key]) return ""; return `<li><b>${esc(p.name)}</b>: <a class="pthgo" data-slug="${esc(p.slug)}" data-i="${idxOf(p, ni.r.it.key)}" data-stage="${esc(ni.s.k)}" href="${esc(url(ni.r.it))}">${esc(ni.r.it.title)}</a> <small>(${esc(ni.s.name)})</small></li>`; }).filter(Boolean).join("");
  root.innerHTML = `${libBack}${tabs("parent")}<p class="evintro">لوحة مبسطة لطفل واحد في كل مرة. تُظهر ما سُجّل فعلًا على هذا الجهاز، ولا تقارن الطفل بغيره، ولا يعني فتح نشاط أو إكماله أن المهارة أُتقنت.</p>${sel}<div class="pthbox"><h3>مسارات بدأها الطفل</h3>${st.length ? st.map(row).join("") : '<p class="cnt">لا توجد مسارات قيد المتابعة بعد.</p>'}</div><div class="pthbox"><h3>مسارات أكمل موارده الأساسية في خطته</h3>${dn.length ? dn.map(row).join("") : '<p class="cnt">لا توجد مسارات أُكملت مواردها الأساسية في الخطة بعد.</p>'}<small>الإكمال هنا يعني إنهاء الموارد المطلوبة في الخطة، ولا يعني إتقان المهارة.</small></div><div class="pthbox"><h3>مهارات بدأ التدريب عليها</h3>${prac.size ? [...prac.values()].map((x) => `<span class="pthchip">${esc(x.name)} · ${AD(x.n)} موارد مفتوحة</span>`).join(" ") : '<p class="cnt">لم تُسجَّل ممارسة بعد.</p>'}</div><div class="pthbox"><h3>أنشطة مقترحة للمتابعة</h3>${fu ? `<ul>${fu}</ul>` : '<p class="cnt">لا اقتراحات للمتابعة الآن: ابدأ مسارًا أو افتح نشاطًا أولًا.</p>'}</div><p class="evprivacy">هذه المعلومات خاصة بطفلك على هذا الجهاز، ولا تُرسل إلى أي جهة ولا تُعرض للعامة. لا درجات ولا ترتيب ولا مقارنة.</p>`;
}
/* حفظ سياق المسار لشريط التنقل في صفحات الموارد (جلسة المتصفح فقط) */
function remember(p, i) {
  try { sessionStorage.setItem("zad-path-cur", JSON.stringify({ slug: p.slug, name: p.name, i, back: location.href.split("#")[0] + "#p=" + p.slug, list: p.ri.map((r) => ({ k: r.it.key, u: url(r.it), t: r.it.title })) })); } catch (e) { /* */ }
}
function route() {
  const h = decodeURIComponent((location.hash || "").replace(/^#/, "")), m = h.match(/^p=(.+)$/);
  if (m) path(m[1]); else if (h === "parent") parent(); else { D.title = "المسارات التعليمية | منصة زاد التعليمية"; list(); }
}
const curSlug = () => (decodeURIComponent(location.hash).match(/^#p=(.+)$/) || [])[1];
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const d = e.target.closest(".skdom"); if (d) { ST.dom = ST.dom === d.dataset.d ? "" : d.dataset.d; ST.skill = ""; ST.goal = ""; list(); return; }
    const g = e.target.closest("a.pthgo"); if (g) { const p = PL.find((x) => x.slug === (g.dataset.slug || curSlug())); if (p) { if (!progOf(p.slug).started) setProg(p.slug, { started: Date.now() }); if (g.dataset.stage) setProg(p.slug, { stage: g.dataset.stage }); remember(p, +g.dataset.i); } return; }
    const gt = e.target.closest("button[data-goto]"); if (gt) { setProg(gt.dataset.slug, { stage: gt.dataset.goto }); path(gt.dataset.slug); const t = D.getElementById("stg-" + gt.dataset.goto); if (t && t.scrollIntoView) t.scrollIntoView({ block: "start" }); return; }
    const fc = e.target.closest("button.pfvc"); if (fc) { const slug = fc.dataset.slug, on = fc.getAttribute("aria-pressed") !== "true"; if (setFav(slug, on)) list(); return; }
    if (e.target.id === "pfav") { const slug = curSlug(), on = e.target.getAttribute("aria-pressed") !== "true", ok = setFav(slug, on), m = $("#pfm"); if (!ok) { m.textContent = "تعذّر الحفظ على هذا المتصفح."; return; } e.target.setAttribute("aria-pressed", on); e.target.textContent = on ? "♥ في المفضلة" : "♡ حفظ في المفضلة"; m.textContent = on ? "أُضيف المسار إلى مفضلة طفلك على هذا الجهاز." : "أُزيل المسار من المفضلة."; return; }
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
    const id = e.target.id, map = { page: "age", pgr: "grade", psk: "skill", pgl: "goal", ppay: "pay", pdf: "diff" };
    if (map[id]) { ST[map[id]] = e.target.value; if (id === "psk") ST.goal = ""; list(); }
    if (id === "pst") { ST.started = e.target.checked; list(); } if (id === "pfv") { ST.fav = e.target.checked; list(); }
    if (id === "plv2") { ST.lv = e.target.value; route(); }
    if (id === "fkid") { VKID = e.target.value; parent(); }
  });
}
async function init() {
  root = $("#skbody");
  try {
    const [g, sk, mo] = await Promise.all([rpc("paths_public"), rpc("skills_public"), rpc("paths_more").catch(() => []), Z.load()]);
    DATA = g; MORE = new Map((Array.isArray(mo) ? mo : []).map((x) => [x.slug, x])); if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(sk); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المسارات الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" class="fzt" id="pretry">إعادة المحاولة</button></div>`;
    const b = $("#pretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__pathsTest = { ST, get PL() { return PL; }, usage, progOf, setProg, stagesOf, isDone, suggest };
init();
})(window);
