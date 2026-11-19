/* المهارات الحياتية والتطبيقات اليومية - زاد: رئيسية + لعب + تقدم + طباعة. التقدم داخل zad-learn-v3 (S.life). */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const PAGE = D.body.dataset.page || "hub";
const ROOT = new URL(PAGE === "hub" ? "../" : "../../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const icon = (c) => `${ROOT}images/zad/${c}.webp`;
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const CATS = { hyg: ["النظافة والعناية الشخصية", "1f9fc"], time: ["تنظيم الوقت والمسؤوليات", "i_clock"], money: ["المهارات المالية المبسطة", "x_coin"], manners: ["آداب التعامل والتواصل", "i_smile"], safety: ["السلامة والتصرف السليم", "i_lock"], home: ["مهارات المنزل والحياة اليومية", "i_home"], think: ["التفكير وحل المشكلات", "i_bulb"], env: ["البيئة والمسؤولية المجتمعية", "i_tree"] };
const STEPS = { 1: ["أتعرف", "نتعرف على الفكرة"], 2: ["أفهم", "نفهم لماذا ومتى"], 3: ["أختار", "نختار التصرف الأنسب"], 4: ["أطبق", "نرتب ونفرز ونطبق"], 5: ["أستقل", "نطبق المهمة مع الأسرة"] };
const KINDN = { lesson: "درس مصور", choose: "اختيار القرار", order: "ترتيب الخطوات", sort: "سحب وإفلات", task: "مهمة تطبيقية" };
/* ===== التقدم ===== */
const LK = "zad-learn-v3", SK = "zad-life-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; S.life = S.life || {}; S.life.it = S.life.it || {}; S.life.pts = S.life.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
const isDone = (slug) => !!(S.life.it[slug] && S.life.it[slug].d > 0);
let ITEMS = [];
async function load() { try { ITEMS = await rest("life_items?status=eq.published&order=sort_order.asc&select=slug,cat,kind,title,icon,levels,step,data,family"); try { localStorage.setItem("zad-life-cache", JSON.stringify(ITEMS)); } catch {} } catch { try { ITEMS = JSON.parse(localStorage.getItem("zad-life-cache") || "[]"); } catch { ITEMS = []; } } return ITEMS; }
const forLv = (cat, lv) => ITEMS.filter((x) => x.cat === cat && x.levels.includes(lv));
function stepInfo(cat, lv) {
  const its = forLv(cat, lv), out = {}; let open = true;
  for (let k = 1; k <= 5; k++) { const L = its.filter((x) => x.step === k); if (!L.length) continue; const d = L.filter((x) => isDone(x.slug)).length; out[k] = { n: L.length, d, ok: open, items: L }; if (d < L.length) open = false; }
  return out;
}
function catStat(cat, lv) { const its = forLv(cat, lv), d = its.filter((x) => isDone(x.slug)).length; return { n: its.length, d }; }
function badges() {
  const out = [], all = Object.keys(S.life.it).filter(isDone).length;
  [[1, "بداية جميلة"], [5, "خمسة أنشطة"], [10, "عشرة أنشطة"], [25, "خمسة وعشرون نشاطا"]].forEach(([n, t]) => { if (all >= n) out.push([t, "i_star"]); });
  Object.keys(CATS).forEach((c) => { const n = ITEMS.filter((x) => x.cat === c && isDone(x.slug)).length; if (n >= 4) out.push(["نجم " + CATS[c][0], CATS[c][1]]); });
  return out;
}
/* ===== الصوت: لا تشغيل تلقائي ===== */
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W; let voices = [];
if (tts) { const f = () => (voices = speechSynthesis.getVoices() || []); f(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", f); }
function say(text) { if (!tts) return toast("الصوت غير متاح على هذا الجهاز. اقرأ التعليمات بصوت مرتفع."); try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = "ar-SA"; u.rate = .85; const v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith("ar")); if (v) { u.voice = v; u.lang = v.lang; } else if (voices.length) toast("لا يتوفر صوت عربي على جهازك، لذلك قد لا يُسمع الكلام."); speechSynthesis.speak(u); } catch { toast("تعذّر تشغيل الصوت."); } }
const spk = (t, label) => `<button type="button" class="spk" data-say="${esc(t)}" aria-label="${esc(label || "استمع")}"><img src="${icon("i_sound")}" alt="" width="22" height="22"> ${esc(label || "استمع")}</button>`;
D.addEventListener("click", (e) => { const b = e.target.closest("[data-say]"); if (b) say(b.dataset.say); });
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 3200); }
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${Object.keys(LV).map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
/* ===== الرئيسية + التصنيف ===== */
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), c = p.get("c"); setLv(lv);
  if (c && CATS[c]) return catView(box, c, lv);
  const tot = ITEMS.filter((x) => x.levels.includes(lv)), dn = tot.filter((x) => isDone(x.slug)).length;
  box.innerHTML = `<div class="hero"><img src="${icon("i_home")}" alt=""><div><h1>المهارات الحياتية والتطبيقات اليومية</h1><p>مهارات عملية من يوم الطفل: نظافة ووقت ومال وآداب وسلامة وبيت وتفكير وبيئة، بمواقف قصيرة وأنشطة تفاعلية.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${lv === "a2" ? "لعمر سنة إلى سنتين: يقرأ الكبير التعليمات ويشارك الطفل في كل نشاط." : "تُعرض الأنشطة المناسبة لهذه المرحلة، ويمكن تغييرها في أي وقت."}</p></div>
<section class="art"><h2>أين وصلت؟ ${AD(dn)} من ${AD(tot.length)} نشاطا</h2><div class="bar"><i style="width:${tot.length ? (dn / tot.length) * 100 : 0}%"></i></div><div class="lks" style="margin-top:8px"><a class="abtn go" href="progress/">متابعة التقدم</a><a class="abtn" href="print/">أوراق وجداول للطباعة</a></div></section>
<section class="art"><h2>التصنيفات</h2><div class="lfcats">${Object.keys(CATS).map((k) => { const s = catStat(k, lv); return `<a class="lfc" href="?c=${k}&lv=${lv}"><img src="${icon(CATS[k][1])}" alt="" width="64" height="64"><b>${esc(CATS[k][0])}</b><small>${s.n ? AD(s.d) + " من " + AD(s.n) + " أنشطة" : "لا أنشطة لهذه المرحلة"}</small><span class="bar"><i style="width:${s.n ? (s.d / s.n) * 100 : 0}%"></i></span></a>`; }).join("")}</div></section>
<section class="art"><h2>المستويات الخمسة</h2><ol class="lfsteps">${[1, 2, 3, 4, 5].map((k) => `<li><b>${STEPS[k][0]}</b> ${esc(STEPS[k][1])}</li>`).join("")}</ol><p class="hint">لا ينتقل الطفل إلى مستوى أعلى إلا بعد إكمال أنشطة المستوى الحالي، ويستطيع مراجعة الدروس السابقة متى شاء.</p></section>
<section class="art"><h2>مرتبط بأقسام المكتبة</h2><div class="lks"><a class="abtn" href="${ROOT}language/">اللغة والمفردات</a><a class="abtn" href="${ROOT}stories/">القصص</a><a class="abtn" href="${ROOT}wiki/">الموسوعة: الصحة والبيئة</a><a class="abtn" href="${ROOT}library/">أوراق العمل والرياضيات</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function catView(box, c, lv) {
  const info = stepInfo(c, lv), ks = Object.keys(info).map(Number);
  box.innerHTML = `<div class="hero"><img src="${icon(CATS[c][1])}" alt=""><div><h1>${esc(CATS[c][0])}</h1><p>المرحلة: ${esc(LV[lv])}. أكمل أنشطة كل مستوى لتفتح المستوى التالي.</p></div></div>${stagePills(lv, "./?c=" + c)}
${ks.length ? ks.map((k) => { const s = info[k]; return `<section class="art lfstep${s.ok ? "" : " lock"}"><h2>${AD(k)}. ${STEPS[k][0]} <small>${AD(s.d)} من ${AD(s.n)}</small></h2>${s.ok ? `<div class="lfl">${s.items.map((x) => `<a class="lfi${isDone(x.slug) ? " done" : ""}" href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><span><b>${esc(x.title)}</b><small>${esc(KINDN[x.kind])}${isDone(x.slug) ? " · أكملتها" : ""}</small></span></a>`).join("")}</div>` : `<p class="hint">يفتح هذا المستوى بعد إكمال أنشطة المستوى السابق. يمكنك مراجعة ما أنجزته في أي وقت.</p>`}</section>`; }).join("") : `<div class="sempty"><h3>لا توجد أنشطة لهذه المرحلة بعد</h3></div>`}
<p><a class="abtn" href="./?lv=${lv}">كل التصنيفات</a></p>`;
}
/* ===== اللعب ===== */
function nextOf(it, lv) { const info = stepInfo(it.cat, lv); for (const k of Object.keys(info).map(Number)) { if (!info[k].ok) break; const n = info[k].items.find((x) => !isDone(x.slug) && x.slug !== it.slug); if (n) return n; } return null; }
function finish(it, wrong, lv) {
  const r = (S.life.it[it.slug] = S.life.it[it.slug] || { d: 0, w: 0, t: 0 }); const first = !r.d; r.d++; r.w += wrong; r.t = Date.now(); S.life.pts += first ? 10 : 3; save();
  try { fetch(SB + "/rest/v1/life_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ slug: it.slug, wrong: Math.min(wrong, 50) }) }).catch(() => {}); } catch {}
  const box = $("#aview"), nx = nextOf(it, lv);
  box.innerHTML = `<div class="res"><div class="st">⭐</div><h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2><p>حصلت على ${AD(first ? 10 : 3)} نقاط. مجموع نقاطك ${AD(S.life.pts)}.</p>${wrong ? `<p class="hint">التجربة والإعادة جزء من التعلم، وكل محاولة تقرّبك من إتقان المهارة.</p>` : ""}
${it.family ? `<div class="rv"><b>نشاط مع الأسرة:</b><p>${esc(it.family)}</p></div>` : ""}
<div class="btns">${nx ? `<a class="abtn go" href="?s=${encodeURIComponent(nx.slug)}&lv=${lv}">النشاط التالي</a>` : ""}<button type="button" class="abtn" id="again">أعد النشاط</button><a class="abtn" href="../?c=${it.cat}&lv=${lv}">${esc(CATS[it.cat][0])}</a></div></div>`;
  $("#again").onclick = () => location.reload();
}
function playPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = ITEMS.find((x) => x.slug === p.get("s"));
  if (!it) return (box.innerHTML = `<div class="sempty"><h3>النشاط غير موجود</h3><p><a class="abtn go" href="../">المهارات الحياتية</a></p></div>`);
  const head = `<div class="qh"><h2>${esc(it.title)}</h2><small>${esc(CATS[it.cat][0])} · المستوى ${AD(it.step)}: ${STEPS[it.step][0]} · ${esc(KINDN[it.kind])}</small></div>`;
  const back = `<p><a class="abtn" href="../?c=${it.cat}&lv=${lv}">رجوع إلى ${esc(CATS[it.cat][0])}</a></p>`;
  const d = it.data; let wrong = 0;
  const fb = (t, c) => { const f = $("#fb"); if (f) { f.className = "fb " + c; f.textContent = t; } };
  const mc = (q, opts, fbs, why, onOk, intro) => {
    const o = shuf(opts.map((t, i) => [t, i]));
    const html = `${intro || ""}<div class="qq">${esc(q)}</div>${spk(q + " " + o.map((z) => z[0]).join("، "), "استمع")}<div class="opts">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${esc(z[0])}</button>`).join("")}</div><div class="fb" id="fb" role="status"></div>`;
    return { html, bind: (root) => root.querySelectorAll(".opt").forEach((b) => b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j]; if (z[1] === 0) { b.classList.add("good"); root.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb((fbs ? fbs[0] : why) || "أحسنت!", "g"); setTimeout(onOk, 1200); } else { wrong++; b.classList.add("bad"); b.disabled = true; fb((fbs ? fbs[z[1]] : "") + " جرّب خيارا آخر، لا بأس.", "b"); } }) };
  };
  if (it.kind === "lesson") {
    let i = 0, quiz = false; const pg = d.pages;
    const draw = () => {
      if (!quiz) { const g = pg[i], last = i === pg.length - 1; box.innerHTML = `${head}<div class="spage"><img src="${icon(g.img)}" alt="" width="180" height="180"><p class="stx">${esc(g.t)}</p>${spk(g.t, "استمع إلى الصفحة")}</div><div class="btns"><button type="button" class="abtn" id="pv" ${i ? "" : "disabled"}>▶ السابقة</button><button type="button" class="abtn go" id="nx">${last ? "اختبر فهمك" : "التالية ◀"}</button></div>${back}`; $("#pv").onclick = () => { i--; draw(); }; $("#nx").onclick = () => { if (last) quiz = true; else i++; draw(); }; }
      else { const m = mc(d.check.q, d.check.o, null, d.check.why, () => finish(it, wrong, lv)); box.innerHTML = head + m.html + back; m.bind(box); }
    }; draw();
  } else if (it.kind === "choose") {
    const m = mc(d.q, d.o, d.fb, "", () => finish(it, wrong, lv), `<div class="spage"><img src="${icon(it.icon)}" alt="" width="150" height="150"><p class="stx">${esc(d.scene)}</p></div>`);
    box.innerHTML = head + m.html + back; m.bind(box);
  } else if (it.kind === "order") {
    const units = d.steps; let bank = shuf(units.map((u, k) => ({ u, k }))); if (bank.every((b, k) => b.u === units[k])) bank = bank.reverse(); let pick = [];
    const dr = () => { box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><ol class="slot lfslot">${pick.map((b) => `<li><button type="button" class="opt on" data-r="${b.k}">${esc(b.u)}</button></li>`).join("") || '<span class="ph">اضغط الخطوات بالترتيب</span>'}</ol><div class="opts">${bank.filter((b) => !pick.includes(b)).map((b) => `<button type="button" class="opt" data-p="${b.k}">${esc(b.u)}</button>`).join("")}</div><div class="btns"><button type="button" class="abtn go" id="chk" ${pick.length === units.length ? "" : "disabled"}>تحقّق</button><button type="button" class="abtn" id="clr">من جديد</button></div><div class="fb" id="fb" role="status"></div>${back}`;
      box.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => { pick.push(bank.find((x) => x.k === +b.dataset.p)); dr(); });
      box.querySelectorAll("[data-r]").forEach((b) => b.onclick = () => { pick = pick.filter((x) => x.k !== +b.dataset.r); dr(); });
      $("#clr").onclick = () => { pick = []; dr(); };
      $("#chk").onclick = () => { const ok = pick.every((b, i) => b.u === units[i]); if (ok) { fb("أحسنت! هذا هو الترتيب الصحيح.", "g"); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); setTimeout(() => finish(it, wrong, lv), 1200); } else { wrong++; const first = pick.findIndex((b, i) => b.u !== units[i]); fb(`قريب! راجع الخطوة رقم ${AD(first + 1)} وجرّب مرة أخرى.`, "b"); } };
    }; dr();
  } else if (it.kind === "sort") {
    const its = shuf(d.items.map((x, i) => ({ t: x.t, g: x.g, i }))); const placed = {}; let sel = null;
    const dr = () => {
      const left = its.filter((x) => placed[x.i] == null);
      box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><p class="hint">اسحب كل بطاقة إلى مكانها، أو اضغط البطاقة ثم اضغط المكان.</p><div class="lfpool" id="pool">${left.map((x) => `<button type="button" class="lfcard${sel === x.i ? " sel" : ""}" data-i="${x.i}">${esc(x.t)}</button>`).join("") || "<span class='ph'>أحسنت! وزعت كل البطاقات</span>"}</div><div class="lfgroups">${d.groups.map((g, gi) => `<div class="lfg" data-g="${gi}"><h3>${esc(g)}</h3><div class="lfgi">${its.filter((x) => placed[x.i] === gi).map((x) => `<span class="lfcard on">${esc(x.t)}</span>`).join("")}</div></div>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
      const put = (i, gi) => { const x = its.find((z) => z.i === i); if (!x) return; if (x.g === gi) { placed[i] = gi; sel = null; fb("صحيح!", "g"); if (its.every((z) => placed[z.i] != null)) { dr(); fb("أحسنت! وضعت كل شيء في مكانه.", "g"); setTimeout(() => finish(it, wrong, lv), 1200); return; } dr(); fb("صحيح!", "g"); } else { wrong++; sel = null; dr(); fb("ليست هذه المجموعة المناسبة، جرّب مجموعة أخرى.", "b"); } };
      box.querySelectorAll(".lfcard[data-i]").forEach((c) => {
        c.onclick = () => { if (c._dragged) { c._dragged = false; return; } sel = sel === +c.dataset.i ? null : +c.dataset.i; dr(); };
        c.onpointerdown = (e) => { if (e.button) return; const r = c.getBoundingClientRect(), sx = e.clientX, sy = e.clientY; let gh = null, moved = false; c.setPointerCapture && c.setPointerCapture(e.pointerId);
          c.onpointermove = (m) => { if (!moved && Math.hypot(m.clientX - sx, m.clientY - sy) < 8) return; if (!moved) { moved = true; gh = c.cloneNode(true); gh.classList.add("lfghost"); gh.style.width = r.width + "px"; D.body.appendChild(gh); } gh.style.left = m.clientX - r.width / 2 + "px"; gh.style.top = m.clientY - r.height / 2 + "px"; box.querySelectorAll(".lfg").forEach((g) => { const b = g.getBoundingClientRect(); g.classList.toggle("over", m.clientX >= b.left && m.clientX <= b.right && m.clientY >= b.top && m.clientY <= b.bottom); }); m.preventDefault(); };
          c.onpointerup = (u) => { c.onpointermove = c.onpointerup = null; if (gh) gh.remove(); if (!moved) return; c._dragged = true; let tg = null; box.querySelectorAll(".lfg").forEach((g) => { const b = g.getBoundingClientRect(); if (u.clientX >= b.left && u.clientX <= b.right && u.clientY >= b.top && u.clientY <= b.bottom) tg = +g.dataset.g; }); if (tg != null) put(+c.dataset.i, tg); else dr(); }; };
      });
      box.querySelectorAll(".lfg").forEach((g) => g.onclick = () => { if (sel != null) put(sel, +g.dataset.g); });
    }; dr();
  } else if (it.kind === "task") {
    const ck = d.steps.map(() => false);
    const dr = () => { box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="120" height="120">${d.adult ? `<p class="hint"><b>بمرافقة شخص كبير:</b> يقرأ الكبير الخطوات ويشارك الطفل في تنفيذها.</p>` : `<p class="hint">نفّذ كل خطوة مع أسرتك، ثم ضع علامة عليها.</p>`}</div><ul class="lfck">${d.steps.map((s, i) => `<li><label><input type="checkbox" data-i="${i}" ${ck[i] ? "checked" : ""}> <span>${esc(s)}</span></label></li>`).join("")}</ul>${it.family ? `<div class="rv"><b>اقتراح للأسرة:</b><p>${esc(it.family)}</p></div>` : ""}${spk(d.steps.join("، "), "استمع إلى الخطوات")}<div class="btns"><button type="button" class="abtn go" id="dn" ${ck.every(Boolean) ? "" : "disabled"}>أنجزنا المهمة</button></div>${back}`;
      box.querySelectorAll("[data-i]").forEach((c) => c.onchange = () => { ck[+c.dataset.i] = c.checked; dr(); }); $("#dn").onclick = () => finish(it, 0, lv); }; dr();
  }
}
/* ===== التقدم ===== */
function progressPage() {
  const box = $("#aview"), lv = getLv(), all = ITEMS.filter((x) => isDone(x.slug)), bd = badges();
  const review = ITEMS.filter((x) => { const r = S.life.it[x.slug]; return r && r.w >= 2 && r.d <= 1; }).slice(0, 8);
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>تقدّم الطفل في المهارات الحياتية</h1><p>لولي الأمر والطفل: ما تعلّمه، وما أكمله، وما يستحق المراجعة. التقييم هنا للتشجيع.</p></div></div>
<div class="pg2"><div><b>${AD(all.length)}</b>نشاطا مكتملا</div><div><b>${AD(S.life.pts)}</b>نقطة</div><div><b>${AD(bd.length)}</b>شارة</div></div>
<section class="art"><h2>التقدم حسب التصنيف</h2><p class="hint">المرحلة المعروضة: ${esc(LV[lv])}</p><div class="sks">${Object.keys(CATS).map((c) => { const s = catStat(c, lv), inf = stepInfo(c, lv), cur = Object.keys(inf).map(Number).find((k) => inf[k].d < inf[k].n); return `<div><span>${esc(CATS[c][0])}</span><b>${AD(s.d)} من ${AD(s.n)}${cur ? " · المستوى: " + STEPS[cur][0] : s.n ? " · أنهيت كل المستويات" : ""}</b></div>`; }).join("")}</div></section>
<section class="art"><h2>الشارات والإنجازات</h2>${bd.length ? `<div class="lfbd">${bd.map((b) => `<span><img src="${icon(b[1])}" alt="" width="40" height="40"> ${esc(b[0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر هنا الشارات بعد إكمال الأنشطة. ابدأ بأي تصنيف.</p>`}</section>
<section class="art"><h2>الأنشطة المكتملة</h2>${all.length ? `<div class="rvc">${all.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">لم يكمل الطفل نشاطا بعد، وهذه بداية جميلة.</p>`}</section>
${review.length ? `<section class="art"><h2>مهارات تستحق مراجعة لطيفة</h2><p class="tx">هذه الأنشطة احتاجت إلى محاولات أكثر. يمكن إعادتها بهدوء، فالإعادة تُقوّي المهارة.</p><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<div class="btns"><a class="abtn go" href="../?lv=${lv}">متابعة الأنشطة</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
}
/* ===== الطباعة ===== */
const PDFS = [["life-daily-routine", "جدول الروتين اليومي المصور", "جدول مرتب بالصور لأوقات اليوم مع خانات للنجوم.", "i_clock"], ["life-weekly-plan", "جدول الأسبوع", "جدول أسبوعي لتنظيم الواجبات والأنشطة.", "i_notebook"], ["life-chores", "جدول المهام المنزلية", "مهام بسيطة وآمنة مع خانات للتقدم.", "i_home"], ["life-needs-wants", "ورقة عمل: حاجة أم رغبة", "تمييز الحاجات من الرغبات مع تمرين على الاختيار.", "x_coin"], ["life-savings", "خطة الادخار التعليمية", "تحديد هدف وتتبع ما يُدّخر بنقود لعبة.", "i_target"], ["life-safety", "بطاقات قواعد السلامة", "بطاقات مصورة هادئة لقواعد السلامة.", "i_lock"], ["life-cards", "بطاقات روتين قابلة للقص", "بطاقات صور لترتيب خطوات الروتين.", "i_puzzle"]];
function printPage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_notebook")}" alt=""><div><h1>أوراق وجداول للطباعة</h1><p>ملفات PDF جاهزة للتحميل والطباعة على ورق A4.</p></div></div><div class="lfl">${PDFS.map((x) => `<a class="lfi" href="${ROOT}files/life/${x[0]}.pdf" target="_blank" rel="noopener"><img src="${icon(x[3])}" alt="" width="52" height="52"><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></a>`).join("")}</div><p class="hint">تُفتح الملفات في نافذة جديدة. عاين الملف قبل الطباعة.</p><p><a class="abtn" href="../">العودة إلى المهارات الحياتية</a></p>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "print") printPage(); else hubPage(); })();
})();
