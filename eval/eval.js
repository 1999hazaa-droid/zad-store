/* مركز معايير تقييم المشاريع – زاد: مراجعة مشجعة بعد المشروع، بلا درجات ولا مقارنة.
   البيانات العامة من eval_public (تقييمات منشورة فقط). ما يسجله الطفل أو ولي الأمر يُحفظ على هذا الجهاز فقط (zad-eval-v1) ولا يُرسل لأي جهة.
   الإكمال والتاريخ يُقرآن من سجل المشاريع الحقيقي (zad-learn-v3)؛ لا نعرض تاريخًا غير مسجّل. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INS = (l) => AGES.includes(l) || GRADES.includes(l);
const KEY = "zad-eval-v1", LK = "zad-learn-v3";
const CIMG = { science: "brain.svg", math: "numbers.svg", arabic: "book.svg", english: "book.svg", art: "palette.svg", nature: "heart.svg", life: "heart.svg" };
const STATES = ["done", "help", "retry"];
const LAB = { done: ["أنجزت", "أنجز"], help: ["أحتاج إلى مساعدة", "يحتاج إلى مساعدة"], retry: ["سأحاول مرة أخرى", "سيحاول مرة أخرى"] };
const DEF = {
  done: ["أحسنت! لقد تعلمت شيئًا جديدًا.", "لقد بذلت جهدًا جميلًا في مشروعك."],
  help: ["عمل رائع، يمكنك مراجعة خطوة واحدة ثم المحاولة مرة أخرى.", "طلب المساعدة جزء جميل من التعلم."],
  retry: ["كل محاولة تساعدك على التعلم.", "فكّر في شيء جديد يمكنك تجربته في المرة القادمة."],
  none: ["حفظنا مراجعتك. يمكنك العودة إليها في أي وقت."]
};
const band = (lv) => (lv === "a2" || lv === "a3" ? "young" : AGES.includes(lv) ? "pre" : lv === "g1" || lv === "g2" ? "early" : "late");
let ITEMS = [], BYKEY = new Map(), root = null;
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const learn = () => lget(LK, null);
const kidId = () => { const d = learn(); return d && d.kids && Object.keys(d.kids).length ? (d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]) : "k1"; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`);
const pic = (it) => (it.project.icon ? icon(it.project.icon) : ROOT + "images/ill/" + (CIMG[it.project.cat] || "star.svg"));
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const dateTxt = (t) => { try { return new Date(t).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" }); } catch (e) { return ""; } };
let VIEW = null;
function store(kid) { const s = lget(KEY, { kids: {} }); s.kids = s.kids || {}; const id = kid || kidId(), k = (s.kids[id] = s.kids[id] || {}); k.ev = k.ev || {}; k.need = k.need || {}; k.again = k.again || {}; return [s, k]; }
const rec = (slug, kid) => store(kid)[1].ev[slug] || null;
const commit = (s) => lset(KEY, s);
function doneRec(slug, kid) { const d = learn(); if (!d || !d.kids) return null; const k = d.kids[kid || kidId()]; const r = k && k.proj && k.proj.done && k.proj.done[slug]; return r && r.d > 0 && r.t ? r : null; }
function completeProject(slug, skills) {
  let d = learn(); if (!d || !d.kids) d = { cur: "k1", kids: { k1: {} } }; if (!d.kids[d.cur]) d.cur = Object.keys(d.kids)[0];
  const k = d.kids[d.cur], b = (k.proj = k.proj || {}); b.done = b.done || {}; b.started = b.started || {}; b.badges = b.badges || {}; b.steps = b.steps || {}; b.pts = b.pts || 0; b.favs = b.favs || {}; b.flow = b.flow || {};
  const first = !b.done[slug], r = (b.done[slug] = b.done[slug] || { d: 0, w: 0, best: 0, t: 0, last: 0 });
  r.d++; r.best = 3; r.last = 0; r.t = Date.now(); if (skills && skills.length) r.skills = Array.from(new Set((r.skills || []).concat(skills)));
  b.pts += first ? 15 : 4; d._t = Date.now(); return lset(LK, d);
}
function prep(j) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  ITEMS = (j.items || []).filter((it) => it.levels && it.levels.length && it.levels.every(INS) && (it.criteria || []).length);
}
const find = (slug) => ITEMS.find((i) => i.slug === slug);
function lvFor(it, r) { const own = r && r.lv, k = kidLv(); if (own && it.levels.includes(own)) return own; if (k && it.levels.includes(k)) return k; return it.levels[0]; }
const ctext = (c, lv) => { const b = band(lv); return b === "young" ? c.young : b === "pre" ? c.pre : c.kid; };
const crits = (it, lv) => { const a = it.criteria; return band(lv) === "young" ? a.slice(0, 4) : a; };
const svg = {
  done: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="22" fill="#ffd54a" stroke="#e0a800" stroke-width="3"/><circle cx="24" cy="30" r="3" fill="#3a1a85"/><circle cx="40" cy="30" r="3" fill="#3a1a85"/><path d="M22 40q10 11 20 0" fill="none" stroke="#3a1a85" stroke-width="3.5" stroke-linecap="round"/><path d="M50 8l2.4 5 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="#8b5be0"/></svg>',
  help: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="21" fill="#cdb8f5" stroke="#6b3fd4" stroke-width="3"/><circle cx="25" cy="33" r="3" fill="#3a1a85"/><circle cx="39" cy="33" r="3" fill="#3a1a85"/><path d="M25 43q7 6 14 0" fill="none" stroke="#3a1a85" stroke-width="3.5" stroke-linecap="round"/><g fill="#ffd54a" stroke="#e0a800" stroke-width="2"><rect x="46" y="6" width="5" height="14" rx="2.5"/><rect x="52" y="9" width="5" height="12" rx="2.5"/><rect x="40" y="9" width="5" height="12" rx="2.5"/><rect x="40" y="17" width="17" height="11" rx="5"/></g></svg>',
  retry: '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="34" r="19" fill="#b7ecd0" stroke="#2b9a66" stroke-width="3"/><circle cx="25" cy="31" r="3" fill="#3a1a85"/><circle cx="39" cy="31" r="3" fill="#3a1a85"/><path d="M25 41q7 6 14 0" fill="none" stroke="#3a1a85" stroke-width="3.5" stroke-linecap="round"/><path d="M12 22A26 26 0 0 1 50 14" fill="none" stroke="#8b5be0" stroke-width="4" stroke-linecap="round"/><path d="M52 6v11H41z" fill="#8b5be0"/></svg>'
};
const empty = (h, p) => `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>${h}</h3><p>${p}</p></div>`;
const tabs = (on) => `<div class="evtabs" role="navigation" aria-label="أقسام المركز"><a href="#/"${on === "hub" ? ' aria-current="page"' : ""}>المشاريع</a><a href="#/dash"${on === "dash" ? ' aria-current="page"' : ""}>لولي الأمر والمعلم</a></div>`;
const back = `<a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`;
/* ===== الصفحة الرئيسية ===== */
function hub() {
  D.title = "مركز معايير تقييم المشاريع | منصة زاد التعليمية";
  const lv = VIEW && VIEW.lv || kidLv(), list = ITEMS.filter((i) => !lv || i.levels.includes(lv));
  const opt = (arr, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const sel = `<div class="skf" role="group" aria-label="عمر الطفل أو صفه"><label>العمر<select id="eage">${opt(AGES, "اختر العمر")}</select></label><label>الصف<select id="egr">${opt(GRADES, "اختر الصف")}</select></label></div>`;
  const cards = list.map((it) => { const r = rec(it.slug), dn = doneRec(it.slug); return `<article class="evpc"><img src="${esc(pic(it))}" alt=""><div><h3>${esc(it.name)}</h3><p>${esc(it.project.title)}</p><div class="mt"><span>${esc(lvTxt(it.levels))}</span><span>${AD(it.criteria.length)} ${it.criteria.length === 1 ? "معيار" : "معايير"}</span>${r ? '<span class="ok">حُفظت مراجعة</span>' : ""}${dn ? '<span class="ok">المشروع مكتمل</span>' : ""}</div></div><div class="act"><a href="#/p/${encodeURIComponent(it.slug)}">${r ? "افتح المراجعة" : "ابدأ المراجعة"}</a>${r ? `<a class="alt" href="#/r/${encodeURIComponent(it.slug)}">التقرير</a>` : ""}</div></article>`; }).join("");
  root.innerHTML = `${tabs("hub")}<p class="evintro">اختر مشروعًا أنهيته لتراجعه: ماذا أنجزت؟ وأين تحتاج مساعدة؟ وماذا تريد أن تجرب مرة أخرى؟ لا توجد درجات ولا ترتيب بين الأطفال، والمراجعة اختيارية.</p>${sel}${list.length ? `<div class="evgrid">${cards}</div>` : empty(lv ? "لا توجد مراجعات منشورة لهذا العمر الآن" : "لا توجد مراجعات منشورة بعد", "ننشر المراجعات بعد مراجعتها من فريق المحتوى. يمكنك فتح <a href=\"" + ROOT + "projects/\">المشاريع</a> وإكمال أي مشروع دون تقييم.")}<p class="evprivacy">المراجعة خاصة بطفلك: تُحفظ على هذا الجهاز فقط ولا تظهر للعامة، ولا نستخدمها للمقارنة بين الأطفال.</p>${back}`;
}
/* ===== صفحة التقييم ===== */
let CUR = null;
function evalPage(slug) {
  const it = find(slug);
  if (!it) { root.innerHTML = `<a class="skback" href="#/">← كل المراجعات</a>${empty("لم نجد هذه المراجعة", "قد تكون غير منشورة بعد.")}`; return; }
  const r0 = rec(slug), lv = lvFor(it, r0), r = r0 ? JSON.parse(JSON.stringify(r0)) : { st: {} };
  r.st = r.st || {}; CUR = { it, lv, r, saved: !!r0 };
  draw();
}
function draw() {
  const { it, lv, r } = CUR, b = band(lv), cs = crits(it, lv), ag = (store()[1].again[it.slug] || []);
  D.title = it.name + " | مركز معايير تقييم المشاريع | منصة زاد التعليمية";
  const pills = it.levels.length > 1 ? `<div class="pills" role="group" aria-label="العمر أو الصف">${it.levels.map((l) => `<button type="button" data-lv="${l}" aria-pressed="${l === lv}">${esc(Z.LVN[l])}</button>`).join("")}</div>` : "";
  const intro = { young: "هذه مراجعة يملؤها ولي الأمر بالملاحظة: اختر ما لاحظته على طفلك. لا يُطلب من الطفل تقييم نفسه.", pre: "اختر لكل خطوة الوجه الذي يناسبك. ويمكنك أن تحكي ما فعلته بكلمات بسيطة.", early: "راجع خطوات مشروعك، واختر لكل خطوة ما يناسبك، ثم أجب عن السؤال في النهاية.", late: "راجع مشروعك بنفسك: اختر ما أتقنته وما تريد تحسينه، ثم أجب عن الأسئلة." }[b];
  const sug = new Set(ag), sk = (c) => (c.skill ? `<span class="sk">${esc(c.skill.name)}</span>` : "");
  const rows = []; let last = null;
  cs.forEach((c) => { const g = c.stage || ""; if (g && g !== last) rows.push(`<h3 class="evstage">${esc(g)}</h3>`); if (g) last = g; const cur = r.st[c.id], t = ctext(c, lv); rows.push(`<div class="evcr${sug.has(c.id) ? " sug" : ""}" data-c="${esc(c.id)}"><p>${esc(t)}${sug.has(c.id) ? '<span class="tag">مقترح للتجربة مرة أخرى</span>' : ""}</p><div class="evst" role="radiogroup" aria-label="${esc(t)}">${STATES.map((s) => `<button type="button" role="radio" data-s="${s}" aria-checked="${cur === s}">${svg[s]}<span>${LAB[s][b === "young" ? 1 : 0]}</span></button>`).join("")}</div></div>`); });
  const cl = it.closing || {};
  let q = "";
  if (b === "young") q = `${cl.young ? `<p class="evintro">${esc(cl.young)}</p>` : ""}`;
  if (b === "pre") q = `<label class="lab" for="said">${esc(cl.pre || "احكِ بكلماتك ما فعلته")}</label><textarea id="said" maxlength="100" dir="auto" placeholder="مثال: صنعت نبتة وسقيتها">${esc(r.said || "")}</textarea>`;
  if (b === "early") q = `<label class="lab" for="learned">${esc(cl.early || "ما الشيء الذي تعلمته؟")}</label><textarea id="learned" maxlength="160" dir="auto">${esc(r.learned || "")}</textarea>`;
  if (b === "late") q = `<label class="lab" for="skillUsed">ما المهارة التي استخدمتها؟</label><textarea id="skillUsed" maxlength="120" dir="auto">${esc(r.skillUsed || "")}</textarea><label class="lab" for="fav">ما أكثر خطوة أعجبتك؟</label><textarea id="fav" maxlength="120" dir="auto">${esc(r.fav || "")}</textarea><label class="lab" for="diff">ما الذي ستفعله بطريقة مختلفة في المرة القادمة؟</label><textarea id="diff" maxlength="160" dir="auto">${esc(r.diff || "")}</textarea>${cl.late ? `<label class="lab" for="lt">${esc(cl.late)}</label><textarea id="lt" maxlength="160" dir="auto">${esc(r.lt || "")}</textarea>` : ""}`;
  const dn = doneRec(it.slug);
  const sum = b === "late" ? (() => { const m = cs.filter((c) => r.st[c.id] === "done"), n = cs.filter((c) => r.st[c.id] === "help" || r.st[c.id] === "retry"); return m.length || n.length ? `<div class="evbox"><h3>مراجعتي</h3>${m.length ? `<p><b>ما أتقنته:</b> ${m.map((c) => esc(ctext(c, lv))).join("، ")}</p>` : ""}${n.length ? `<p><b>ما أريد تحسينه:</b> ${n.map((c) => esc(ctext(c, lv))).join("، ")}</p>` : ""}</div>` : ""; })() : "";
  root.innerHTML = `<a class="skback" href="#/">← كل المراجعات</a>
<section class="evhead"><img src="${esc(pic(it))}" alt=""><div><h2>${esc(it.name)}</h2><p>${esc(it.project.title)}</p>${it.project.goal ? `<p class="evgoal"><b>الهدف التعليمي:</b> ${esc(it.project.goal)}</p>` : ""}</div></section>
${pills}<p class="evintro">${intro}</p>
${ag.length ? `<div class="evagain"><b>اقتراح من ولي الأمر أو المعلم:</b> جرّب إعادة الخطوات المعلّمة بإطار برتقالي، دون أي ضغط.</div>` : ""}
<div id="evcrs">${rows.join("")}</div>${sum}
<div class="evbox">${q}<label class="lab" for="parent">${b === "young" ? "ملاحظة ولي الأمر (اختيارية)" : "ملاحظة ولي الأمر أو المعلم (اختيارية)"}</label><textarea id="parent" maxlength="200" dir="auto" placeholder="${b === "young" ? "مثال: أحب لمس الأشياء وتجربتها" : "ملاحظة قصيرة تشجع التعلم"}">${esc(r.parent || "")}</textarea></div>
<div id="evmsg" role="status" aria-live="polite">${CUR.msg || ""}</div>
<div class="evbtns"><button type="button" id="evsave">حفظ التقييم</button><a class="alt" id="evback" href="${ROOT}projects/play/?s=${encodeURIComponent(it.slug)}&lv=${lv}">العودة إلى المشروع</a><button type="button" class="alt" id="evfin">${dn ? "إكمال المشروع مرة أخرى" : "إكمال المشروع"}</button>${CUR.saved ? `<a class="alt" href="#/r/${encodeURIComponent(it.slug)}">عرض التقرير</a>` : ""}</div>
<p class="evprivacy">التقييم اختياري ولا يمنع إكمال المشروع. يُحفظ على هذا الجهاز فقط، ولا يظهر للعامة، ولا يقارن الطفل بغيره.${dn ? " تاريخ آخر إكمال مسجّل: " + esc(dateTxt(dn.t)) + "." : ""}</p>${back}`;
}
function readFields() { const r = CUR.r, v = (id) => { const e = $("#" + id); return e ? e.value.trim() : undefined; }; ["said", "learned", "skillUsed", "fav", "diff", "lt", "parent"].forEach((k) => { const x = v(k); if (x !== undefined) r[k] = x; }); }
function pickMsg(it, r) {
  const vals = Object.values(r.st || {}), key = vals.includes("retry") ? "retry" : vals.includes("help") ? "help" : vals.includes("done") ? "done" : "none";
  const own = ((it.msgs || {})[key] || []).filter(Boolean), pool = own.length ? own : DEF[key], t = r.ts || Date.now();
  return [pool[t % pool.length], pool.length > 1 ? pool[(t + 1) % pool.length] : ""];
}
function saveEval() {
  readFields(); const { it, lv, r } = CUR; r.lv = lv; r.ts = Date.now();
  const [s, k] = store(); k.ev[it.slug] = JSON.parse(JSON.stringify(r)); const ok = commit(s);
  const m = pickMsg(it, r);
  CUR.saved = ok; CUR.msg = ok ? `<div class="evmsg">${esc(m[0])}${m[1] ? `<small>${esc(m[1])}</small>` : ""}<small><a href="#/r/${encodeURIComponent(it.slug)}">عرض تقرير المراجعة</a></small></div>` : `<div class="evmsg">تعذّر الحفظ على هذا الجهاز (قد يكون التخزين مغلقًا). يمكنك متابعة المشروع دون حفظ.</div>`;
  draw(); const e = $("#evmsg"); if (e && e.scrollIntoView) e.scrollIntoView({ block: "nearest" });
}
function finishProject() {
  readFields(); const { it, r } = CUR, sk = []; (it.criteria || []).forEach((c) => { if (r.st[c.id] === "done" && c.skill) sk.push(c.skill.name); });
  const ok = completeProject(it.slug, Array.from(new Set(sk)));
  CUR.msg = ok ? `<div class="evmsg">سُجّل إكمال المشروع على هذا الجهاز. أحسنت!<small>لا يشترط التقييم لإكمال المشروع، ويمكنك حفظه متى شئت.</small></div>` : `<div class="evmsg">تعذّر تسجيل الإكمال على هذا الجهاز. يمكنك إكمال المشروع من صفحته.</div>`;
  draw();
}
/* ===== التقرير ===== */
function resList(keys) { return keys.map((k) => BYKEY.get(k)).filter(Boolean).slice(0, 4); }
function report(slug, kid) {
  const it = find(slug), r = it && rec(slug, kid);
  if (!it || !r) { root.innerHTML = `<a class="skback" href="#/">← كل المراجعات</a>${empty("لا يوجد تقرير بعد", "احفظ مراجعة المشروع أولًا ليظهر ملخصها. لن نعرض بيانات غير مسجّلة.")}`; return; }
  const lv = (r.lv && it.levels.includes(r.lv)) ? r.lv : it.levels[0], b = band(lv), cs = crits(it, lv), dn = doneRec(slug, kid), k = store(kid)[1];
  const by = (s) => cs.filter((c) => r.st[c.id] === s), li = (a) => (a.length ? `<ul class="evlist">${a.map((c) => `<li>${esc(ctext(c, lv))}</li>`).join("")}</ul>` : '<p class="cnt">لا يوجد شيء مسجّل هنا.</p>');
  const skills = new Set(); by("done").forEach((c) => c.skill && skills.add(c.skill.name)); ((dn && dn.skills) || []).forEach((x) => skills.add(x));
  const notes = []; if (r.parent) notes.push(["ملاحظة ولي الأمر أو المعلم", r.parent]); if (r.said) notes.push(["ما حكاه الطفل", r.said]); if (r.learned) notes.push(["ما تعلمه", r.learned]); if (r.skillUsed) notes.push(["المهارة التي استخدمها", r.skillUsed]); if (r.fav) notes.push(["أكثر خطوة أعجبته", r.fav]); if (r.diff) notes.push(["ما سيفعله بطريقة مختلفة", r.diff]); if (r.lt) notes.push([it.closing && it.closing.late || "سؤال إضافي", r.lt]);
  const need = by("help").concat(by("retry")), seen = new Set(); let res = [];
  need.forEach((c) => resList(c.res || []).forEach((x) => { if (!seen.has(x.key)) { seen.add(x.key); res.push([c, x]); } }));
  Object.keys(k.need).forEach((sl) => { cs.concat(it.criteria).forEach((c) => { if (c.skill && c.skill.slug === sl) resList(c.res || []).forEach((x) => { if (!seen.has(x.key)) { seen.add(x.key); res.push([c, x]); } }); }); });
  const ag = (k.again[slug] || []).map((id) => it.criteria.find((c) => c.id === id)).filter(Boolean);
  const nextHtml = res.length ? `<div class="evsug">${res.slice(0, 5).map(([c, x]) => `<a href="${esc(url(x))}"><span>${esc(x.title)}</span>${c.skill ? `<small>${esc(c.skill.name)}</small>` : ""}</a>`).join("")}</div>` : need.length || ag.length ? `<p>جرّب إعادة الخطوة التي اخترتها بهدوء، ثم عُد إلى المشروع. <a href="${ROOT}projects/play/?s=${encodeURIComponent(slug)}&lv=${lv}">افتح المشروع</a></p>` : by("done").length ? `<p>أنجزت ما اخترته، يمكنك تجربة مشروع آخر. <a href="${ROOT}projects/?lv=${lv}">مشاريع أخرى</a></p>` : `<p>لم تُسجَّل حالات بعد؛ يمكنك العودة وإكمال المراجعة متى شئت.</p>`;
  D.title = "تقرير " + it.name + " | منصة زاد التعليمية";
  root.innerHTML = `<a class="skback" href="#/">← كل المراجعات</a>
<section class="evhead"><img src="${esc(pic(it))}" alt=""><div><h2>${esc(it.name)}</h2><p>${esc(it.project.title)} · ${esc(Z.LVN[lv])}</p><p>${dn ? "تاريخ إكمال المشروع المسجّل: <b>" + esc(dateTxt(dn.t)) + "</b>" : "لم يُسجَّل إكمال هذا المشروع على هذا الجهاز بعد."}</p><p>تاريخ حفظ المراجعة: ${esc(dateTxt(r.ts))}</p></div></section>
<div class="evbox"><h3>ما أنجزه</h3>${li(by("done"))}</div>
<div class="evbox"><h3>ما يحتاج إلى مساعدة</h3>${li(by("help"))}</div>
<div class="evbox"><h3>ما سيحاول مرة أخرى</h3>${li(by("retry"))}</div>
${ag.length ? `<div class="evbox"><h3>خطوات مقترحة لإعادة التجربة</h3>${li(ag)}</div>` : ""}
<div class="evbox"><h3>المهارات التي مارسها</h3>${skills.size ? `<div class="pills">${Array.from(skills).map((x) => `<span class="sk">${esc(x)}</span>`).join("")}</div>` : '<p class="cnt">لم تُسجَّل مهارات بعد.</p>'}</div>
<div class="evbox"><h3>الملاحظات</h3>${notes.length ? notes.map((n) => `<p><b>${esc(n[0])}:</b> ${esc(n[1])}</p>`).join("") : '<p class="cnt">لا توجد ملاحظات مسجّلة.</p>'}</div>
<div class="evbox"><h3>الخطوة التعليمية التالية المقترحة</h3>${nextHtml}</div>
<div class="evbtns noprint"><a class="alt" href="#/p/${encodeURIComponent(slug)}">تعديل المراجعة</a><button type="button" id="evprint" class="alt">طباعة التقرير</button></div>
<p class="evprivacy">هذا التقرير خاص بطفلك على هذا الجهاز. المشاركة اختيارية بالطباعة تحت إشراف ولي الأمر، ولا يتضمن مقارنة بأي طفل آخر.</p>${back}`;
}
/* ===== لوحة ولي الأمر والمعلم ===== */
function kids() { const d = learn(); const ks = d && d.kids ? Object.keys(d.kids) : ["k1"]; return ks.map((id, i) => ({ id, name: ((d && d.kids[id] && (d.kids[id].name || d.kids[id].n)) || "") || "الطفل " + AD(i + 1) })); }
function dash() {
  D.title = "لوحة ولي الأمر والمعلم | مركز معايير تقييم المشاريع";
  const ks = kids(), kid = (VIEW && VIEW.kid && ks.some((x) => x.id === VIEW.kid)) ? VIEW.kid : kidId(), [, k] = store(kid), evs = ITEMS.filter((i) => k.ev[i.slug]);
  const sks = new Map(); evs.forEach((it) => it.criteria.forEach((c) => c.skill && sks.set(c.skill.slug, c.skill.name)));
  const rows = evs.map((it) => { const r = k.ev[it.slug], lv = r.lv && it.levels.includes(r.lv) ? r.lv : it.levels[0], cs = crits(it, lv), n = (s) => cs.filter((c) => r.st[c.id] === s).length, dn = doneRec(it.slug, kid), ag = new Set(k.again[it.slug] || []);
    return `<article class="evbox" data-s="${esc(it.slug)}"><h3>${esc(it.name)}</h3><p>${esc(it.project.title)} · ${esc(Z.LVN[lv])}${dn ? " · أُكمل في " + esc(dateTxt(dn.t)) : " · لم يُسجَّل إكماله بعد"}</p>
<p>${LAB.done[1]}: ${AD(n("done"))} · ${LAB.help[1]}: ${AD(n("help"))} · ${LAB.retry[1]}: ${AD(n("retry"))}</p>
<div>${cs.map((c) => `<div class="evrow"><span>${esc(ctext(c, lv))}${r.st[c.id] ? ` — <b>${esc(LAB[r.st[c.id]][1])}</b>` : ""}</span><button type="button" class="btn alt" data-again="${esc(c.id)}" aria-pressed="${ag.has(c.id)}">${ag.has(c.id) ? "ألغِ اقتراح الإعادة" : "اقترح إعادة التجربة"}</button></div>`).join("")}</div>
<label class="lab" for="n_${esc(it.slug)}">ملاحظة تعليمية قصيرة</label><textarea id="n_${esc(it.slug)}" maxlength="200" dir="auto">${esc(r.parent || "")}</textarea><div class="evbtns"><button type="button" data-note="${esc(it.slug)}">حفظ الملاحظة</button><a class="alt" href="#/r/${encodeURIComponent(it.slug)}">التقرير</a><a class="alt" href="#/p/${encodeURIComponent(it.slug)}">فتح المراجعة</a></div></article>`; }).join("");
  const done = ITEMS.filter((it) => doneRec(it.slug, kid));
  root.innerHTML = `${tabs("dash")}<p class="evintro">هنا يراجع ولي الأمر أو المعلم مراجعات المشاريع لطفل واحد في كل مرة، دون مقارنة بين الأطفال. كل شيء يُحفظ على هذا الجهاز فقط.</p>
${ks.length > 1 ? `<label class="lab" for="evkid">الطفل</label><select id="evkid">${ks.map((x) => `<option value="${esc(x.id)}"${x.id === kid ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select>` : ""}
<div class="evbox"><h3>مهارات تحتاج إلى تدريب إضافي</h3>${sks.size ? `<div class="pills" role="group">${Array.from(sks).map(([sl, nm]) => `<button type="button" data-need="${esc(sl)}" aria-pressed="${!!k.need[sl]}">${esc(nm)}</button>`).join("")}</div><p class="cnt">اضغط المهارة لتعليمها أو إلغاء تعليمها. تظهر موارد المكتبة المرتبطة بها في تقرير المشروع.</p>` : '<p class="cnt">تظهر هنا مهارات المشاريع بعد حفظ أول مراجعة.</p>'}</div>
<h2 style="font-size:18px;color:var(--z-pri,#5b2bb8)">مراجعات المشاريع</h2>${rows || empty("لا توجد مراجعات محفوظة بعد", "عندما يحفظ طفلك مراجعة مشروع ستظهر هنا.")}
<div class="evbox"><h3>المشاريع المكتملة (التي لها مراجعة منشورة)</h3>${done.length ? `<ul class="evlist">${done.map((it) => `<li>${esc(it.name)} — ${esc(dateTxt(doneRec(it.slug, kid).t))}</li>`).join("")}</ul>` : '<p class="cnt">لا توجد مشاريع مكتملة مسجّلة.</p>'}</div>
<p class="evprivacy">لا توجد درجات ولا ترتيب ولا مقارنة. لا يُرسل شيء خارج هذا الجهاز.</p>${back}`;
}
/* ===== التوجيه والأحداث ===== */
function route() {
  const h = decodeURIComponent(location.hash || "#/"), m = h.match(/^#\/(p|r)\/(.+)$/);
  if (m) { if (m[1] === "p") evalPage(m[2]); else report(m[2]); } else if (h === "#/dash") dash(); else hub();
  W.scrollTo && W.scrollTo(0, 0);
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const t = e.target, st = t.closest(".evst button"), lvb = t.closest("[data-lv]");
    if (st && CUR) { const c = st.closest(".evcr").dataset.c, s = st.dataset.s; readFields(); if (CUR.r.st[c] === s) delete CUR.r.st[c]; else CUR.r.st[c] = s; CUR.msg = ""; const y = W.scrollY; draw(); W.scrollTo(0, y); const nb = $('.evcr[data-c="' + c + '"] [data-s="' + s + '"]'); if (nb) nb.focus(); return; }
    if (lvb && CUR && lvb.closest(".pills")) { readFields(); CUR.lv = lvb.dataset.lv; CUR.msg = ""; draw(); return; }
    if (t.id === "evsave") { saveEval(); return; }
    if (t.id === "evfin") { finishProject(); return; }
    if (t.id === "evprint") { W.print(); return; }
    const ng = t.closest("[data-need]"); if (ng) { const [s, k] = store(VIEW && VIEW.kid), sl = ng.dataset.need; if (k.need[sl]) delete k.need[sl]; else k.need[sl] = { ts: Date.now() }; commit(s); dash(); return; }
    const ag = t.closest("[data-again]"); if (ag) { const sl = ag.closest("[data-s]").dataset.s, [s, k] = store(VIEW && VIEW.kid), a = (k.again[sl] = k.again[sl] || []), i = a.indexOf(ag.dataset.again); if (i >= 0) a.splice(i, 1); else a.push(ag.dataset.again); if (!a.length) delete k.again[sl]; commit(s); dash(); return; }
    const nt = t.closest("[data-note]"); if (nt) { const sl = nt.dataset.note, [s, k] = store(VIEW && VIEW.kid), r = k.ev[sl]; if (r) { r.parent = ($("#n_" + sl).value || "").trim().slice(0, 200); commit(s); nt.textContent = "تم حفظ الملاحظة ✓"; } return; }
  });
  D.addEventListener("change", (e) => {
    const t = e.target;
    if (t.id === "eage" || t.id === "egr") { VIEW = VIEW || {}; VIEW.lv = t.value; hub(); }
    if (t.id === "evkid") { VIEW = VIEW || {}; VIEW.kid = t.value; dash(); }
  });
}
async function init() {
  root = $("#skbody");
  try { const [j] = await Promise.all([rpc("eval_public"), Z.load()]); if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index"); prep(j); if (!W.__evBound) { W.__evBound = true; bind(); } route(); }
  catch (e) { root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المراجعات الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="evretry" class="btn">إعادة المحاولة</button></div>`; const b = $("#evretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); }); }
}
W.__evTest = { band, get ITEMS() { return ITEMS; } };
init();
})(window);
