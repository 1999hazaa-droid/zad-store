/* مركز المهارات المكتسبة من المشاريع – زاد التعليمية
   البيانات العامة من skp_public (مهارات وروابط منشورة فقط). ممارسة الطفل تُحسب من سجله الحقيقي على هذا الجهاز:
   مشاريع مكتملة (zad-learn-v3) + أنشطة سجّلها بنفسه (zad-skp-v1) + مهارات علّمها ولي الأمر «تدرب أكثر» (zad-skp-v1 / zad-eval-v1).
   لا درجات ولا ترتيب ولا حالة «إتقان»: لا يوجد معيار موثوق للإتقان في المنصة. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INS = (l) => AGES.includes(l) || GRADES.includes(l);
const KEY = "zad-skp-v1", LK = "zad-learn-v3", EK = "zad-eval-v1";
const LB = { none: "لم تبدأ بعد", start: "بدأت التدريب", more: "تدرب أكثر", cont: "يواصل التعلم" };
const LD = { none: "لم تُسجَّل ممارسة لهذه المهارة بعد. يمكنك أن تتدرب عليها بمشروع أو نشاط.", start: "مارست هذه المهارة في نشاط أو مشروع.", more: "تحتاج إلى أنشطة إضافية لتتدرب أكثر.", cont: "يمكنك متابعة مشاريع أخرى مرتبطة بالمهارة." };
let DATA = null, SK = [], PL = new Map(), PJ = new Map(), LINKS = new Map(), root = null, VIEW = { lv: null, kid: null, dom: "", pj: "", st: "" };
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const learn = () => lget(LK, null);
const kids = () => { const d = learn(), ks = d && d.kids ? Object.keys(d.kids) : ["k1"]; return ks.map((id, i) => ({ id, name: ((d && d.kids[id] && (d.kids[id].name || d.kids[id].n)) || "") || "الطفل " + AD(i + 1) })); };
const kidId = () => { const d = learn(); return VIEW.kid && kids().some((x) => x.id === VIEW.kid) ? VIEW.kid : d && d.kids && d.kids[d.cur] ? d.cur : kids()[0].id; };
const kidLv = () => { try { const S = W.ZSAVED; const v = S && S.kidLv && S.kidLv(); return INS(v) ? v : ""; } catch (e) { return ""; } };
const curLv = () => (VIEW.lv === null ? kidLv() : VIEW.lv);
function store(kid) { const s = lget(KEY, { kids: {} }); s.kids = s.kids || {}; const k = (s.kids[kid || kidId()] = s.kids[kid || kidId()] || {}); k.acts = k.acts || {}; k.more = k.more || {}; return [s, k]; }
const doneRec = (slug, kid) => { const d = learn(), k = d && d.kids && d.kids[kid || kidId()], r = k && k.proj && k.proj.done && k.proj.done[slug]; return r && r.d > 0 && r.t ? r : null; };
const evNeed = (kid) => { const e = lget(EK, null), k = e && e.kids && e.kids[kid || kidId()]; return (k && k.need) || {}; };
const dateTxt = (t) => { try { return new Date(t).toLocaleDateString("ar", { year: "numeric", month: "long", day: "numeric" }); } catch (e) { return ""; } };
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const icoOf = (s) => ROOT + "images/ill/" + esc(s.d.icon);
const back = `<a class="skback" href="${ROOT}library/">العودة إلى المكتبة التعليمية</a>`;
const empty = (h, p) => `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>${h}</h3><p>${p}</p></div>`;
const tabs = (on) => `<div class="evtabs" role="navigation" aria-label="أقسام المركز"><a href="#/"${on === "hub" ? ' aria-current="page"' : ""}>المهارات</a><a href="#/me"${on === "me" ? ' aria-current="page"' : ""}>ما مارسته</a><a href="#/parent"${on === "parent" ? ' aria-current="page"' : ""}>لولي الأمر</a></div>`;

function prep(j) {
  const dom = Object.fromEntries((j.domains || []).map((d) => [d.slug, d]));
  SK = (j.skills || []).filter((s) => dom[s.domain] && s.levels.length && s.levels.every(INS)).map((s) => Object.assign({}, s, { d: dom[s.domain] }));
  const ids = new Set(SK.map((s) => s.id));
  PJ = new Map((j.projects || []).filter((p) => p.levels.every(INS)).map((p) => [p.slug, p]));
  PL = new Map(); (j.plinks || []).forEach((l) => { if (!ids.has(l.s) || !PJ.has(l.p)) return; if (!PL.has(l.s)) PL.set(l.s, []); PL.get(l.s).push({ p: PJ.get(l.p), r: l.r, g: l.g, o: l.o }); });
  const by = new Map(Z.X.items.map((i) => [i.key, i]));
  LINKS = new Map(); (j.links || []).forEach((l) => { const it = by.get(l.k); if (!it || !ids.has(l.s)) return; if (!LINKS.has(l.s)) LINKS.set(l.s, []); LINKS.get(l.s).push({ it, stage: l.g, role: l.r, ord: l.o || 0 }); });
  DATA = j;
}
const vis = (s, lv) => !lv || s.levels.includes(lv);
const projsOf = (s, lv) => (PL.get(s.id) || []).filter((l) => !lv || l.p.levels.includes(lv));
const actsOf = (s, lv) => (LINKS.get(s.id) || []).filter((l) => l.it.lv.some((x) => s.levels.includes(x)) && (!lv || (l.it.lv.includes(lv) && s.levels.includes(lv)))).sort((a, b) => a.ord - b.ord || a.it.title.localeCompare(b.it.title, "ar"));
/* حالة ممارسة المهارة: عدّاد حقيقي لما سجّله الجهاز، وعتبة «يواصل التعلم» يحدّدها مدير المحتوى (min_proj) */
function state(s, kid) {
  const k = store(kid)[1], pd = (PL.get(s.id) || []).filter((l) => doneRec(l.p.slug, kid)), ad = Object.keys(k.acts).filter((a) => k.acts[a].s === s.slug);
  const n = pd.length + ad.length, flag = !!(k.more[s.slug] || evNeed(kid)[s.slug]);
  const lvl = flag ? "more" : n === 0 ? "none" : n < (s.min_proj || 2) ? "start" : "cont";
  return { n, lvl, pd, ad, flag };
}
const chip = (l) => `<span class="lvl ${l}">${LB[l]}</span>`;
const pUrl = (p, lv) => `${ROOT}projects/play/?s=${encodeURIComponent(p.slug)}${lv && p.levels.includes(lv) ? "&lv=" + lv : p.levels[0] ? "&lv=" + p.levels[0] : ""}`;

/* ===== الرئيسية ===== */
function hub() {
  D.title = "مركز المهارات المكتسبة من المشاريع | منصة زاد التعليمية";
  const lv = curLv(), kid = kidId();
  const opt = (arr, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const pjs = [...PJ.values()].filter((p) => !lv || p.levels.includes(lv));
  const list = SK.filter((s) => vis(s, lv) && (!VIEW.dom || s.domain === VIEW.dom) && (!VIEW.pj || (PL.get(s.id) || []).some((l) => l.p.slug === VIEW.pj)) && (() => { const st = state(s, kid).lvl; return !VIEW.st || (VIEW.st === "practiced" ? st !== "none" : VIEW.st === "more" ? st === "more" : st === "none"); })());
  const doms = (DATA.domains || []).filter((d) => SK.some((s) => s.domain === d.slug && vis(s, lv)));
  const chips = doms.map((d) => `<button type="button" data-d="${esc(d.slug)}" aria-pressed="${VIEW.dom === d.slug}" style="--c:${esc(d.color || "#cdb8f5")}">${esc(d.name)}</button>`).join("");
  const cards = list.map((s) => { const st = state(s, kid), ps = projsOf(s, lv).slice(0, 2);
    return `<article class="skpc" style="--c:${esc(s.d.color)}"><img class="ic" src="${icoOf(s)}" alt=""><h3>${esc(s.name)}</h3><div class="mt"><span>${esc(s.d.name)}</span><span>${esc(lvTxt(s.levels))}</span></div><p>${esc(s.goal_kid || s.descr || "")}</p>${ps.length ? `<p class="ex">أمثلة من المشاريع: ${ps.map((l) => esc(l.p.title)).join("، ")}</p>` : ""}<div>${chip(st.lvl)}</div><div class="bt"><a href="#/s/${encodeURIComponent(s.slug)}/projects">عرض المشاريع</a><a class="alt" href="#/s/${encodeURIComponent(s.slug)}/acts">عرض الأنشطة التدريبية</a></div></article>`; }).join("");
  root.innerHTML = `${tabs("hub")}<p class="evintro">اختر مهارة لتعرف أي مشاريع وأنشطة تساعدك على ممارستها. «بدأت التدريب» تعني أنك مارست المهارة، وليست شهادة إتقان. لا درجات ولا ترتيب بين الأطفال.</p>
<div class="skpsel" role="group" aria-label="تصفية المهارات"><label>العمر<select id="fage">${opt(AGES, "كل الأعمار")}</select></label><label>الصف<select id="fgr">${opt(GRADES, "كل الصفوف")}</select></label><label>المشروع المرتبط<select id="fpj"><option value="">كل المشاريع</option>${pjs.map((p) => `<option value="${esc(p.slug)}"${VIEW.pj === p.slug ? " selected" : ""}>${esc(p.title)}</option>`).join("")}</select></label><label>حالة الممارسة<select id="fst"><option value="">الكل</option><option value="practiced"${VIEW.st === "practiced" ? " selected" : ""}>مهارات مارستها</option><option value="more"${VIEW.st === "more" ? " selected" : ""}>تحتاج مزيدًا من التدريب</option><option value="none"${VIEW.st === "none" ? " selected" : ""}>لم أبدأ بها بعد</option></select></label></div>
<div class="skpdoms" role="group" aria-label="المجال التعليمي">${chips}</div>
${list.length ? `<div class="skpgrid">${cards}</div>` : empty(SK.length ? "لا توجد مهارات بهذه الاختيارات" : "لم تُنشر مهارات هذا المركز بعد", SK.length ? "جرّب تغيير العمر أو الصف أو المجال." : "يضيف فريق المحتوى المهارات بعد مراجعتها، وسنعرضها هنا عند نشرها.")}${back}`;
}

/* ===== صفحة المهارة ===== */
function skill(slug, sec) {
  const s = SK.find((x) => x.slug === slug);
  if (!s) { root.innerHTML = `${tabs("hub")}${empty("لم نجد هذه المهارة", "قد لا تكون منشورة بعد.")}<a class="skback" href="#/">كل المهارات</a>`; return; }
  const lv = curLv(), kid = kidId(), st = state(s, kid), [, k] = store(kid), ps = projsOf(s, lv), as = actsOf(s, lv);
  D.title = s.name + " | مركز المهارات المكتسبة من المشاريع";
  const lvO = `<option value="">كل الأعمار والصفوف</option>` + Z.LVK.filter((l) => s.levels.includes(l)).map((l) => `<option value="${l}"${lv === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const pHtml = ps.length ? ps.map((l) => { const dn = doneRec(l.p.slug, kid); return `<div class="skpproj"><b>${esc(l.p.title)}</b> <span class="skprole${l.r === "main" ? "" : " sup"}">${l.r === "main" ? "مهارة أساسية" : "مهارة مساندة"}</span><p>ما تمارسه فيه: ${esc(l.g)}</p><p class="cnt">${esc(lvTxt(l.p.levels))}${dn ? " · أكملته في " + esc(dateTxt(dn.t)) : ""}</p><a class="b" href="${esc(pUrl(l.p, lv))}">افتح المشروع</a></div>`; }).join("") : `<p class="cnt">لا توجد مشاريع منشورة مرتبطة بهذه المهارة لهذا العمر أو الصف بعد.</p>`;
  const aHtml = as.length ? as.map((l) => { const on = !!k.acts[l.it.key]; return `<div class="skprow"><span><b>${esc(l.it.title)}</b> <small>${esc(Z.CT[l.it.ct] || "")} · ${esc(lvTxt(l.it.lv))}</small></span><span><a class="b" href="${esc(url(l.it))}">افتح</a> <button type="button" data-act="${esc(l.it.key)}" aria-pressed="${on}">${on ? "سجّلت أنني نفّذته ✓" : "نفّذت هذا النشاط"}</button></span></div>`; }).join("") : `<p class="cnt">لا توجد أنشطة منشورة لهذه المهارة تناسب هذا العمر أو الصف بعد.</p>`;
  root.innerHTML = `${tabs("hub")}<a class="skback" href="#/">كل المهارات</a>
<div class="skphead" style="--c:${esc(s.d.color)}"><img src="${icoOf(s)}" alt=""><div><h2>${esc(s.name)}</h2><p>${esc(s.d.name)} · ${esc(lvTxt(s.levels))}</p></div></div>
<div class="skpsel" style="grid-template-columns:1fr"><label>العمر أو الصف<select id="flv">${lvO}</select></label></div>
<div class="skpbox"><h3>ما هذه المهارة؟</h3><p>${esc(s.descr || s.goal_kid)}</p><p><b>بكلمات الطفل:</b> ${esc(s.goal_kid)}</p><p><b>الهدف التعليمي:</b> ${esc(s.goal)}</p>${(s.examples || []).length ? `<h3>أمثلة على المهارة</h3><ul>${s.examples.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>` : ""}</div>
<div class="skpbox"><h3>حالة ممارسة المهارة</h3><p>${chip(st.lvl)} ${esc(LD[st.lvl])}</p><p class="cnt">مسجّل لطفلك على هذا الجهاز: ${AD(st.pd.length)} ${st.pd.length === 1 ? "مشروع مكتمل" : "مشاريع مكتملة"} و${AD(st.ad.length)} ${st.ad.length === 1 ? "نشاط" : "أنشطة"}.</p><div class="skprow"><span>هل يحتاج الطفل إلى أنشطة إضافية في هذه المهارة؟</span><button type="button" data-more="${esc(s.slug)}" aria-pressed="${!!k.more[s.slug]}">${k.more[s.slug] ? "علّمتها «تدرب أكثر» ✓" : "علّمها «تدرب أكثر»"}</button></div><p class="skpnote">الفرق بين الممارسة والإتقان: الممارسة تعني أن الطفل جرّب المهارة في مشروع أو نشاط. أما الإتقان فيحتاج إلى ملاحظة طويلة من ولي الأمر أو المعلم، ولا يوجد في المنصة معيار موثوق لقياسه، لذلك لا نعرضه ولا نعدّ إكمال المشروع دليلًا عليه.</p></div>
<div class="skpbox" id="skpprojects"><h3>المشاريع التي ترتبط بها</h3>${pHtml}</div>
<div class="skpbox" id="skpacts"><h3>أنشطة تساعد على التدريب</h3><p class="cnt">ورقة عمل، بطاقة، قصة، نشاط تفاعلي، مشروع قصير أو فيديو من المكتبة. زر «نفّذت هذا النشاط» تسجيل ذاتي من الطفل أو ولي الأمر يُحفظ على هذا الجهاز.</p>${aHtml}</div>${back}`;
  if (sec) { const t = $(sec === "acts" ? "#skpacts" : "#skpprojects"); if (t && t.scrollIntoView) t.scrollIntoView(); }
}

/* ===== ما مارسته (عرض الطفل) ===== */
const kidSel = (kid) => (kids().length > 1 ? `<label class="lab" for="fkid">الطفل</label><select id="fkid">${kids().map((x) => `<option value="${esc(x.id)}"${x.id === kid ? " selected" : ""}>${esc(x.name)}</option>`).join("")}</select>` : "");
function me() {
  D.title = "ما مارسته | مركز المهارات المكتسبة من المشاريع";
  const kid = kidId(), lv = curLv(), all = SK.filter((s) => vis(s, lv)).map((s) => ({ s, st: state(s, kid) }));
  const done = all.filter((x) => x.st.n > 0), later = all.filter((x) => x.st.n === 0 || x.st.lvl === "more").slice(0, 6);
  const row = ({ s, st }) => `<article class="skpbox" style="border-inline-start:8px solid ${esc(s.d.color)}"><h3>مارست هذه المهارة: ${esc(s.name)}</h3><p>${chip(st.lvl)}</p>${st.pd.length ? `<p>من خلال المشاريع: ${st.pd.map((l) => `${esc(l.p.title)} (${esc(dateTxt(doneRec(l.p.slug, kid).t))})`).join("، ")}</p>` : ""}${st.ad.length ? `<p>أنشطة نفّذتها: ${AD(st.ad.length)}</p>` : ""}<a class="b" href="#/s/${encodeURIComponent(s.slug)}">تدرب على هذه المهارة</a></article>`;
  root.innerHTML = `${tabs("me")}<p class="evintro">هنا المهارات التي مارستها في مشاريعك وأنشطتك المسجّلة على هذا الجهاز. إكمال المشروع لا يعني أنك أتقنت كل مهاراته، فيمكنك دائمًا أن تتدرب أكثر.</p>${kidSel(kid)}
${done.length ? done.map(row).join("") : empty("لم تُسجَّل ممارسة بعد", "عندما تكمل مشروعًا مرتبطًا بمهارة، أو تسجّل نشاطًا نفّذته، ستظهر المهارة هنا.")}
${later.length ? `<h2 style="font-size:18px;color:var(--z-pri,#5b2bb8)">يمكنك التدرب عليها لاحقًا</h2><div class="skpgrid">${later.map(({ s, st }) => `<article class="skpc" style="--c:${esc(s.d.color)}"><img class="ic" src="${icoOf(s)}" alt=""><h3>${esc(s.name)}</h3><p>${esc(s.goal_kid)}</p><div>${chip(st.lvl)}</div><div class="bt"><a href="#/s/${encodeURIComponent(s.slug)}">تدرب على هذه المهارة</a></div></article>`).join("")}</div>` : ""}
<p class="evprivacy">هذه المعلومات خاصة بطفلك على هذا الجهاز، ولا تُعرض للعامة ولا تقارن الطفل بغيره.</p>${back}`;
}

/* ===== لوحة ولي الأمر ===== */
function parent() {
  D.title = "لوحة ولي الأمر | مركز المهارات المكتسبة من المشاريع";
  const kid = kidId(), lv = curLv(), all = SK.filter((s) => vis(s, lv)).map((s) => ({ s, st: state(s, kid) })), pr = all.filter((x) => x.st.n > 0), need = all.filter((x) => x.st.lvl === "more");
  const sug = need.map(({ s }) => { const a = actsOf(s, lv).filter((l) => !store(kid)[1].acts[l.it.key]).slice(0, 2), p = projsOf(s, lv).filter((l) => !doneRec(l.p.slug, kid)).slice(0, 1); return `<li><b>${esc(s.name)}</b>: ${a.map((l) => `<a href="${esc(url(l.it))}">${esc(l.it.title)}</a>`).join("، ")}${p.length ? (a.length ? " · " : "") + `مشروع: <a href="${esc(pUrl(p[0].p, lv))}">${esc(p[0].p.title)}</a>` : ""}${!a.length && !p.length ? "لا يوجد اقتراح منشور بعد" : ""} <a href="#/s/${encodeURIComponent(s.slug)}">فتح المهارة</a></li>`; }).join("");
  root.innerHTML = `${tabs("parent")}<p class="evintro">لوحة مبسطة لطفل واحد في كل مرة. تُظهر ما سُجّل فعلًا، ولا تقارن الطفل بغيره، ولا تعني الممارسة أن المهارة أُتقنت.</p>${kidSel(kid)}
<div class="skpbox"><h3>مهارات مارسها الطفل</h3>${pr.length ? pr.map(({ s, st }) => `<div class="skprow"><span><b>${esc(s.name)}</b> ${chip(st.lvl)}<br><small>المشاريع: ${st.pd.length ? st.pd.map((l) => esc(l.p.title)).join("، ") : "لا يوجد"} · الأنشطة المكتملة: ${AD(st.ad.length)}</small></span><a class="b" href="#/s/${encodeURIComponent(s.slug)}">التفاصيل</a></div>`).join("") : '<p class="cnt">لا توجد ممارسة مسجّلة بعد.</p>'}</div>
<div class="skpbox"><h3>مهارات تحتاج إلى تدريب إضافي</h3>${need.length ? `<ul>${sug}</ul>` : '<p class="cnt">لم تُعلَّم مهارة بأنها تحتاج إلى تدريب إضافي. يمكنك تعليمها من صفحة المهارة، أو من لوحة مراجعات المشاريع.</p>'}</div>
<p class="evprivacy">البيانات محفوظة على هذا الجهاز فقط ولا تُرسل إلى أي جهة. لا درجات ولا ترتيب ولا مقارنة.</p>${back}`;
}

function route() {
  const h = decodeURIComponent(location.hash || "#/"), m = h.match(/^#\/s\/([^/]+)(?:\/(projects|acts))?$/);
  if (m) skill(m[1], m[2]); else if (h === "#/me") me(); else if (h === "#/parent") parent(); else hub();
}
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => {
    const d = e.target.closest("[data-d]"); if (d && d.closest(".skpdoms")) { VIEW.dom = VIEW.dom === d.dataset.d ? "" : d.dataset.d; hub(); return; }
    const a = e.target.closest("[data-act]"); if (a) { const [s, k] = store(), sk = SK.find((x) => x.slug === decodeURIComponent((location.hash.match(/^#\/s\/([^/]+)/) || [])[1] || "")); if (k.acts[a.dataset.act]) delete k.acts[a.dataset.act]; else if (sk) k.acts[a.dataset.act] = { t: Date.now(), s: sk.slug }; lset(KEY, s); const y = W.scrollY; route(); W.scrollTo(0, y); return; }
    const m = e.target.closest("[data-more]"); if (m) { const [s, k] = store(); if (k.more[m.dataset.more]) delete k.more[m.dataset.more]; else k.more[m.dataset.more] = Date.now(); lset(KEY, s); const y = W.scrollY; route(); W.scrollTo(0, y); }
  });
  D.addEventListener("change", (e) => {
    const id = e.target.id, v = e.target.value;
    if (id === "fage" || id === "fgr") { VIEW.lv = v; hub(); } else if (id === "fpj") { VIEW.pj = v; hub(); } else if (id === "fst") { VIEW.st = v; hub(); } else if (id === "flv") { VIEW.lv = v; route(); } else if (id === "fkid") { VIEW.kid = v; route(); }
  });
}
async function init() {
  root = $("#skbody");
  try { const [j] = await Promise.all([rpc("skp_public"), Z.load()]); if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index"); prep(j); if (!W.__skpBound) { W.__skpBound = true; bind(); } route(); }
  catch (e) { root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل المهارات الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="skpretry">إعادة المحاولة</button></div>`; const b = $("#skpretry"); if (b) b.onclick = init; }
}
init();
})(window);
