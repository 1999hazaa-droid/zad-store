/* المهارات الرقمية والتقنية - زاد: رئيسية + لعب + تقدم + طباعة. التقدم محلي داخل zad-learn-v3 (S.dig). لا حسابات ولا بيانات شخصية. */
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
const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : `${ROOT}images/zad/${c}.webp`);
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const CATS = { dev: ["التعرف على الأجهزة والتقنية", "dg_tablet"], basic: ["أساسيات استخدام الحاسوب", "dg_desktop"], logic: ["التفكير الحاسوبي والمنطقي", "1f9e9"], code: ["مقدمة إلى البرمجة", "dg_bot"], create: ["الإبداع الرقمي", "dg_pencil"], search: ["البحث والمعلومات", "1f50d"], safe: ["السلامة والخصوصية الرقمية", "dg_pw"], ai: ["التعرف على الذكاء الاصطناعي", "dg_ai"] };
const STEPS = { 1: ["أتعرف على التقنية", "نتعرف على الأجهزة والفكرة"], 2: ["أستخدم الأدوات الأساسية", "نجرب الأدوات ونفهم عملها"], 3: ["أفكر بطريقة منطقية", "نفكر ونقارن ونختار"], 4: ["أنفذ التعليمات", "نرتب ونصنف وننفذ الأوامر"], 5: ["أصمم وأبدع", "نصنع مشروعا صغيرا"] };
const KINDN = { lesson: "درس مصور", choose: "اختيار", pattern: "اكتشاف النمط", order: "ترتيب الخطوات", sort: "تصنيف بالسحب", match: "توصيل", code: "برمجة بالأوامر", type: "كتابة بلوحة المفاتيح", make: "مشروع إبداعي", task: "نشاط مع كبير" };
/* ===== التقدم ===== */
const LK = "zad-learn-v3", SK = "zad-dig-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; S.dig = S.dig || {}; S.dig.it = S.dig.it || {}; S.dig.pts = S.dig.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
const isDone = (slug) => !!(S.dig.it[slug] && S.dig.it[slug].d > 0);
let ITEMS = [];
async function load() { try { ITEMS = await rest("dig_items?status=eq.published&order=sort_order.asc&select=slug,cat,kind,title,icon,levels,step,data,family"); try { localStorage.setItem("zad-dig-cache", JSON.stringify(ITEMS)); } catch {} } catch { try { ITEMS = JSON.parse(localStorage.getItem("zad-dig-cache") || "[]"); } catch { ITEMS = []; } } return ITEMS; }
const forLv = (cat, lv) => ITEMS.filter((x) => x.cat === cat && x.levels.includes(lv));
function stepInfo(cat, lv) {
  const its = forLv(cat, lv), out = {}; let open = true;
  for (let k = 1; k <= 5; k++) { const L = its.filter((x) => x.step === k); if (!L.length) continue; const d = L.filter((x) => isDone(x.slug)).length; out[k] = { n: L.length, d, ok: open, items: L }; if (d < L.length) open = false; }
  return out;
}
function catStat(cat, lv) { const its = forLv(cat, lv), d = its.filter((x) => isDone(x.slug)).length; return { n: its.length, d }; }
function badges() {
  const out = [], all = Object.keys(S.dig.it).filter(isDone).length;
  [[1, "بداية رقمية جميلة"], [5, "خمسة أنشطة"], [10, "عشرة أنشطة"], [25, "خمسة وعشرون نشاطا"]].forEach(([n, t]) => { if (all >= n) out.push([t, "i_star"]); });
  const pj = (S.dig.proj || []).length; if (pj >= 1) out.push(["مبدع رقمي", "1f3a8"]); if (pj >= 3) out.push(["مصمم مشروعات", "1f451"]);
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
  box.innerHTML = `<div class="hero"><img src="${icon("dg_laptop")}" alt=""><div><h1>المهارات الرقمية والتقنية</h1><p>دروس مصورة وأنشطة وألعاب ومشروعات صغيرة تعرّف الطفل بالأجهزة والتفكير المنطقي والبرمجة المرئية والسلامة الرقمية، بلا حسابات ولا روابط خارجية.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${lv === "a2" ? "للأعمار الصغيرة: يجلس الكبير مع الطفل ويقرأ التعليمات ويشاركه كل نشاط، ويكون استخدام الجهاز بإشراف." : "تُعرض الأنشطة المناسبة لهذه المرحلة، ويمكن تغييرها في أي وقت."}</p></div>
<section class="art"><h2>أين وصلت؟ ${AD(dn)} من ${AD(tot.length)} نشاطا</h2><div class="bar"><i style="width:${tot.length ? (dn / tot.length) * 100 : 0}%"></i></div><div class="lks" style="margin-top:8px"><a class="abtn go" href="progress/">لوحة ولي الأمر</a><a class="abtn" href="print/">أوراق وجداول للطباعة</a></div></section>
<section class="art"><h2>التصنيفات</h2><div class="dgcats">${Object.keys(CATS).map((k) => { const s = catStat(k, lv); return `<a class="dgc" href="?c=${k}&lv=${lv}"><img src="${icon(CATS[k][1])}" alt="" width="64" height="64"><b>${esc(CATS[k][0])}</b><small>${s.n ? AD(s.d) + " من " + AD(s.n) + " أنشطة" : "لا أنشطة لهذه المرحلة"}</small><span class="bar"><i style="width:${s.n ? (s.d / s.n) * 100 : 0}%"></i></span></a>`; }).join("")}</div></section>
<section class="art"><h2>المستويات الخمسة</h2><ol class="dgsteps">${[1, 2, 3, 4, 5].map((k) => `<li><b>${STEPS[k][0]}</b> ${esc(STEPS[k][1])}</li>`).join("")}</ol><p class="hint">لا ينتقل الطفل إلى مستوى أعلى إلا بعد إكمال أنشطة المستوى الحالي، ويستطيع مراجعة الدروس السابقة متى شاء.</p></section>
<section class="art"><h2>قواعد القسم</h2><ul class="tx"><li>كل الأنشطة تعمل داخل الصفحة دون حساب للطفل.</li><li>لا يُطلب من الطفل كتابة اسمه الكامل أو عنوانه أو أي كلمة مرور حقيقية.</li><li>إنجازات الطفل تُحفظ في هذا الجهاز فقط ولا يراها زائر آخر.</li></ul></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function catView(box, c, lv) {
  const info = stepInfo(c, lv), ks = Object.keys(info).map(Number);
  box.innerHTML = `<div class="hero"><img src="${icon(CATS[c][1])}" alt=""><div><h1>${esc(CATS[c][0])}</h1><p>المرحلة: ${esc(LV[lv])}. أكمل أنشطة كل مستوى لتفتح المستوى التالي.</p></div></div>${stagePills(lv, "./?c=" + c)}
${ks.length ? ks.map((k) => { const s = info[k]; return `<section class="art dgstep${s.ok ? "" : " lock"}"><h2>${AD(k)}. ${STEPS[k][0]} <small>${AD(s.d)} من ${AD(s.n)}</small></h2>${s.ok ? `<div class="dgl">${s.items.map((x) => `<a class="dgi${isDone(x.slug) ? " done" : ""}" href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><span><b>${esc(x.title)}</b><small>${esc(KINDN[x.kind])}${isDone(x.slug) ? " · أكملتها" : ""}</small></span></a>`).join("")}</div>` : `<p class="hint">يفتح هذا المستوى بعد إكمال أنشطة المستوى السابق. يمكنك مراجعة ما أنجزته في أي وقت.</p>`}</section>`; }).join("") : `<div class="sempty"><h3>لا توجد أنشطة لهذه المرحلة بعد</h3></div>`}
<p><a class="abtn" href="./?lv=${lv}">كل التصنيفات</a></p>`;
}
/* ===== اللعب ===== */
function nextOf(it, lv) { const info = stepInfo(it.cat, lv); for (const k of Object.keys(info).map(Number)) { if (!info[k].ok) break; const n = info[k].items.find((x) => !isDone(x.slug) && x.slug !== it.slug); if (n) return n; } return null; }
function finish(it, wrong, lv) {
  const r = (S.dig.it[it.slug] = S.dig.it[it.slug] || { d: 0, w: 0, t: 0 }); const first = !r.d; r.d++; r.w += wrong; r.t = Date.now(); S.dig.pts += first ? 10 : 3; save();
  try { fetch(SB + "/rest/v1/dig_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ slug: it.slug, wrong: Math.min(wrong, 50) }) }).catch(() => {}); } catch {}
  const box = $("#aview"), nx = nextOf(it, lv);
  box.innerHTML = `<div class="res"><div class="st">⭐</div><h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2><p>حصلت على ${AD(first ? 10 : 3)} نقاط. مجموع نقاطك ${AD(S.dig.pts)}.</p>${wrong ? `<p class="hint">التجربة والإعادة جزء من التعلم، وكل محاولة تقرّبك من إتقان المهارة.</p>` : ""}
${it.family ? `<div class="rv"><b>نشاط مع الأسرة:</b><p>${esc(it.family)}</p></div>` : ""}
<div class="btns">${nx ? `<a class="abtn go" href="?s=${encodeURIComponent(nx.slug)}&lv=${lv}">النشاط التالي</a>` : ""}<button type="button" class="abtn" id="again">أعد النشاط</button><a class="abtn" href="../?c=${it.cat}&lv=${lv}">${esc(CATS[it.cat][0])}</a></div></div>`;
  $("#again").onclick = () => location.reload();
}
function playPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = ITEMS.find((x) => x.slug === p.get("s"));
  if (!it) return (box.innerHTML = `<div class="sempty"><h3>النشاط غير موجود</h3><p><a class="abtn go" href="../">المهارات الرقمية</a></p></div>`);
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
      if (!quiz) { const g = pg[i], last = i === pg.length - 1; box.innerHTML = `${head}${i === 0 ? `<p class="hint"><b>هدف الدرس:</b> ${esc(d.goal)}</p>` : ""}<div class="spage"><small class="dgk">${g.k === "example" ? "مثال عملي" : "شرح مبسط"}</small><img src="${icon(g.img)}" alt="" width="180" height="180"><p class="stx">${esc(g.t)}</p>${spk(g.t, "استمع إلى الصفحة")}</div><div class="btns"><button type="button" class="abtn" id="pv" ${i ? "" : "disabled"}>▶ السابقة</button><button type="button" class="abtn go" id="nx">${last ? "اختبر فهمك" : "التالية ◀"}</button></div>${back}`; $("#pv").onclick = () => { i--; draw(); }; $("#nx").onclick = () => { if (last) quiz = true; else i++; draw(); }; }
      else { const m = mc(d.check.q, d.check.o, null, d.check.why, () => finish(it, wrong, lv)); box.innerHTML = head + m.html + back; m.bind(box); }
    }; draw();
  } else if (it.kind === "choose") {
    const m = mc(d.q, d.o, d.fb, "", () => finish(it, wrong, lv), `<div class="spage"><img src="${icon(it.icon)}" alt="" width="150" height="150"><p class="stx">${esc(d.scene)}</p></div>`);
    box.innerHTML = head + m.html + back; m.bind(box);
  } else if (it.kind === "order") {
    const units = d.steps; let bank = shuf(units.map((u, k) => ({ u, k }))); if (bank.every((b, k) => b.u === units[k])) bank = bank.reverse(); let pick = [];
    const dr = () => { box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><ol class="slot dgslot">${pick.map((b) => `<li><button type="button" class="opt on" data-r="${b.k}">${esc(b.u)}</button></li>`).join("") || '<span class="ph">اضغط الخطوات بالترتيب</span>'}</ol><div class="opts">${bank.filter((b) => !pick.includes(b)).map((b) => `<button type="button" class="opt" data-p="${b.k}">${esc(b.u)}</button>`).join("")}</div><div class="btns"><button type="button" class="abtn go" id="chk" ${pick.length === units.length ? "" : "disabled"}>تحقّق</button><button type="button" class="abtn" id="clr">من جديد</button></div><div class="fb" id="fb" role="status"></div>${back}`;
      box.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => { pick.push(bank.find((x) => x.k === +b.dataset.p)); dr(); });
      box.querySelectorAll("[data-r]").forEach((b) => b.onclick = () => { pick = pick.filter((x) => x.k !== +b.dataset.r); dr(); });
      $("#clr").onclick = () => { pick = []; dr(); };
      $("#chk").onclick = () => { const ok = pick.every((b, i) => b.u === units[i]); if (ok) { fb("أحسنت! هذا هو الترتيب الصحيح.", "g"); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); setTimeout(() => finish(it, wrong, lv), 1200); } else { wrong++; const first = pick.findIndex((b, i) => b.u !== units[i]); fb(`قريب! راجع الخطوة رقم ${AD(first + 1)} وجرّب مرة أخرى.`, "b"); } };
    }; dr();
  } else if (it.kind === "sort") {
    const its = shuf(d.items.map((x, i) => ({ t: x.t, g: x.g, i, img: x.img }))); const placed = {}; let sel = null;
    const dr = () => {
      const left = its.filter((x) => placed[x.i] == null);
      box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><p class="hint">اسحب كل بطاقة إلى مكانها، أو اضغط البطاقة ثم اضغط المكان.</p><div class="dgpool" id="pool">${left.map((x) => `<button type="button" class="dgcard${sel === x.i ? " sel" : ""}" data-i="${x.i}">${x.img ? `<img src="${icon(x.img)}" alt="" width="26" height="26"> ` : ""}${esc(x.t)}</button>`).join("") || "<span class='ph'>أحسنت! وزعت كل البطاقات</span>"}</div><div class="dggroups">${d.groups.map((g, gi) => `<div class="dgg" data-g="${gi}"><h3>${esc(g)}</h3><div class="dggi">${its.filter((x) => placed[x.i] === gi).map((x) => `<span class="dgcard on">${x.img ? `<img src="${icon(x.img)}" alt="" width="26" height="26"> ` : ""}${esc(x.t)}</span>`).join("")}</div></div>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
      const put = (i, gi) => { const x = its.find((z) => z.i === i); if (!x) return; if (x.g === gi) { placed[i] = gi; sel = null; fb("صحيح!", "g"); if (its.every((z) => placed[z.i] != null)) { dr(); fb("أحسنت! وضعت كل شيء في مكانه.", "g"); setTimeout(() => finish(it, wrong, lv), 1200); return; } dr(); fb("صحيح!", "g"); } else { wrong++; sel = null; dr(); fb("ليست هذه المجموعة المناسبة، جرّب مجموعة أخرى.", "b"); } };
      box.querySelectorAll(".dgcard[data-i]").forEach((c) => {
        c.onclick = () => { if (c._dragged) { c._dragged = false; return; } sel = sel === +c.dataset.i ? null : +c.dataset.i; dr(); };
        c.onpointerdown = (e) => { if (e.button) return; const r = c.getBoundingClientRect(), sx = e.clientX, sy = e.clientY; let gh = null, moved = false; c.setPointerCapture && c.setPointerCapture(e.pointerId);
          c.onpointermove = (m) => { if (!moved && Math.hypot(m.clientX - sx, m.clientY - sy) < 8) return; if (!moved) { moved = true; gh = c.cloneNode(true); gh.classList.add("dgghost"); gh.style.width = r.width + "px"; D.body.appendChild(gh); } gh.style.left = m.clientX - r.width / 2 + "px"; gh.style.top = m.clientY - r.height / 2 + "px"; box.querySelectorAll(".dgg").forEach((g) => { const b = g.getBoundingClientRect(); g.classList.toggle("over", m.clientX >= b.left && m.clientX <= b.right && m.clientY >= b.top && m.clientY <= b.bottom); }); m.preventDefault(); };
          c.onpointerup = (u) => { c.onpointermove = c.onpointerup = null; if (gh) gh.remove(); if (!moved) return; c._dragged = true; let tg = null; box.querySelectorAll(".dgg").forEach((g) => { const b = g.getBoundingClientRect(); if (u.clientX >= b.left && u.clientX <= b.right && u.clientY >= b.top && u.clientY <= b.bottom) tg = +g.dataset.g; }); if (tg != null) put(+c.dataset.i, tg); else dr(); }; };
      });
      box.querySelectorAll(".dgg").forEach((g) => g.onclick = () => { if (sel != null) put(sel, +g.dataset.g); });
    }; dr();
  } else if (it.kind === "pattern") {
    const o = shuf(d.o.map((t, i) => [t, i]));
    box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><div class="dgseq">${d.seq.map((x) => `<img src="${icon(x)}" alt="" width="56" height="56">`).join("")}<span class="dgq" aria-hidden="true">؟</span></div><div class="opts dgopts">${o.map((z, j) => `<button type="button" class="opt dgimg" data-j="${j}" aria-label="الخيار ${AD(j + 1)}"><img src="${icon(z[0])}" alt="" width="56" height="56"></button>`).join("")}</div><div class="fb" id="fb" role="status"></div>${back}`;
    box.querySelectorAll(".opt").forEach((b) => b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j]; if (z[1] === 0) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("أحسنت! اكتشفت النمط.", "g"); setTimeout(() => finish(it, wrong, lv), 1200); } else { wrong++; b.classList.add("bad"); b.disabled = true; fb("ليس هذا هو التالي. انظر إلى التكرار وجرّب مرة أخرى.", "b"); } });
  } else if (it.kind === "match") {
    const L = d.pairs.map((p, i) => Object.assign({ i }, p.l)), Rr = shuf(d.pairs.map((p, i) => Object.assign({ i }, p.r))), dn = {}; let sel = null;
    const cell = (x, side, n) => `<button type="button" class="dgm${sel === x.i && side === "l" ? " sel" : ""}${dn[x.i] ? " ok" : ""}" data-s="${side}" data-i="${x.i}" ${dn[x.i] ? "disabled" : ""} aria-label="${esc(x.t || "صورة " + AD(n + 1))}">${x.img ? `<img src="${icon(x.img)}" alt="" width="48" height="48">` : ""}${x.t ? `<span>${esc(x.t)}</span>` : ""}</button>`;
    const dr = (msg, cls) => {
      box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div>${d.adult ? `<p class="hint"><b>بمرافقة شخص كبير:</b> يقرأ الكبير الخيارات ويساعد الطفل على اللمس.</p>` : ""}<p class="hint">اضغط العنصر من العمود الأول ثم ما يناسبه من العمود الثاني.</p><div class="dgmg"><div>${L.map((x, n) => cell(x, "l", n)).join("")}</div><div>${Rr.map((x, n) => cell(x, "r", n)).join("")}</div></div><div class="fb ${cls || ""}" id="fb" role="status">${msg || ""}</div>${back}`;
      box.querySelectorAll(".dgm").forEach((b) => b.onclick = () => { const i = +b.dataset.i;
        if (b.dataset.s === "l") { sel = sel === i ? null : i; return dr(); }
        if (sel == null) return dr("اختر أولا عنصرا من العمود الأول.", "b");
        if (sel === i) { dn[i] = 1; sel = null; if (Object.keys(dn).length === d.pairs.length) { dr("أحسنت! وصلت كل الأزواج.", "g"); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); return void setTimeout(() => finish(it, wrong, lv), 1200); } return dr("صحيح!", "g"); }
        wrong++; sel = null; dr("ليس هذا هو المناسب. جرّب مرة أخرى، لا بأس.", "b"); });
    }; dr();
  } else if (it.kind === "code") {
    const N = d.size, WS = new Set(d.walls.map((w) => w[0] + "," + w[1])), DRS = [[-1, 0], [0, 1], [1, 0], [0, -1]], ARR = ["⬆", "➡", "⬇", "⬅"];
    const CM = { f: ["للأمام", "dg_up"], l: ["ادر لليسار", "dg_left"], r: ["ادر لليمين", "dg_right"], f3: ["للأمام ٣ مرات", "dg_repeat"] };
    const st0 = () => ({ r: d.start[0], c: d.start[1], d: d.start[2] }); let prog = [], pos = st0(), busy = false;
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const grid = () => { let h = ""; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const w = WS.has(r + "," + c), g = d.goal[0] === r && d.goal[1] === c, me = pos.r === r && pos.c === c; h += `<div class="dgcell${w ? " wall" : ""}${g ? " goal" : ""}">${g && !me ? `<img src="${icon("dg_goal")}" alt="الهدف">` : ""}${me ? `<span class="dgbot"><img src="${icon("dg_bot")}" alt="الروبوت"><i>${ARR[pos.d]}</i></span>` : ""}</div>`; } return h; };
    const upd = () => { const g = $(".dggrid"); if (g) g.innerHTML = grid(); };
    const dr = (msg, cls) => {
      box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><div class="dgbd"><div class="dggrid" style="--n:${N}" role="img" aria-label="شبكة الروبوت">${grid()}</div></div><p class="hint">الروبوت يبدأ حيث يشير السهم. أقصى عدد للأوامر ${AD(d.slots)}. اضغط خانة ممتلئة لحذف أمرها.</p><ol class="dgprog">${Array.from({ length: d.slots }, (_, i) => `<li><button type="button" class="dgslot${prog[i] ? " on" : ""}" data-x="${i}" ${busy || !prog[i] ? "disabled" : ""} aria-label="الأمر ${AD(i + 1)}${prog[i] ? ": " + CM[prog[i]][0] : ": فارغ"}">${prog[i] ? `<img src="${icon(CM[prog[i]][1])}" alt="" width="26" height="26"><span>${CM[prog[i]][0]}</span>` : AD(i + 1)}</button></li>`).join("")}</ol><div class="dgcmds">${d.cmds.map((c) => `<button type="button" class="abtn dgcmd" data-c="${c}" ${busy || prog.length >= d.slots ? "disabled" : ""}><img src="${icon(CM[c][1])}" alt="" width="26" height="26"> ${CM[c][0]}</button>`).join("")}</div><div class="btns"><button type="button" class="abtn go" id="run" ${busy || !prog.length ? "disabled" : ""}>شغّل</button><button type="button" class="abtn" id="clr" ${busy ? "disabled" : ""}>مسح الأوامر</button></div><div class="fb ${cls || ""}" id="fb" role="status">${msg || ""}</div>${back}`;
      box.querySelectorAll(".dgcmd").forEach((b) => b.onclick = () => { if (prog.length < d.slots) { prog.push(b.dataset.c); dr(); } });
      box.querySelectorAll(".dgslot").forEach((b) => b.onclick = () => { prog.splice(+b.dataset.x, 1); dr(); });
      $("#clr").onclick = () => { prog = []; dr(); }; $("#run").onclick = run;
    };
    const run = async () => {
      busy = true; pos = st0(); dr("الروبوت يتحرك…", "");
      for (const cm of prog) {
        if (cm === "l") pos.d = (pos.d + 3) % 4; else if (cm === "r") pos.d = (pos.d + 1) % 4;
        else for (let k = 0; k < (cm === "f3" ? 3 : 1); k++) { const nr = pos.r + DRS[pos.d][0], nc = pos.c + DRS[pos.d][1]; if (nr < 0 || nc < 0 || nr >= N || nc >= N || WS.has(nr + "," + nc)) { wrong++; await sleep(350); busy = false; pos = st0(); return dr("اصطدم الروبوت بجدار. عدّل الأوامر وجرّب، لا بأس.", "b"); } pos.r = nr; pos.c = nc; upd(); await sleep(420); }
        upd(); await sleep(420);
      }
      if (pos.r === d.goal[0] && pos.c === d.goal[1]) { dr("أحسنت! وصل الروبوت إلى الهدف.", "g"); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); setTimeout(() => finish(it, wrong, lv), 1300); }
      else { wrong++; busy = false; pos = st0(); dr("لم يصل الروبوت إلى الهدف بعد. عدّل الأوامر وجرّب مرة أخرى.", "b"); }
    }; dr();
  } else if (it.kind === "type") {
    const txt = d.text, chars = [...new Set([...txt.replace(/\s/g, "")])], extra = shuf([..."ابتثجحخدذرزسشصضطظعغفقكلمنهوي"].filter((x) => !chars.includes(x))).slice(0, 3), keys = shuf(chars.concat(extra));
    box.innerHTML = `${head}<div class="qq">${esc(d.q)}</div><div class="dgtarget" aria-label="الكلمة المطلوبة">${esc(txt)}</div>${spk(txt, "استمع للكلمة")}<input id="ty" class="dgin" type="text" dir="rtl" lang="ar" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="30" aria-label="اكتب الكلمة هنا"><p class="hint">اكتب بلوحة مفاتيح الجهاز، أو اضغط الحروف التالية.</p><div class="dgkeys">${keys.map((k) => `<button type="button" class="dgkey" data-k="${esc(k)}">${esc(k)}</button>`).join("")}<button type="button" class="dgkey wide" id="bk" aria-label="حذف حرف">حذف ⌫</button></div><div class="btns"><button type="button" class="abtn go" id="ok">تحقق</button></div><div class="fb" id="fb" role="status"></div>${back}`;
    const ty = $("#ty"); box.querySelectorAll("[data-k]").forEach((b) => b.onclick = () => { ty.value += b.dataset.k; });
    $("#bk").onclick = () => { ty.value = ty.value.slice(0, -1); };
    $("#ok").onclick = () => { const v = ty.value.trim().replace(/\s+/g, " ");
      if (v === txt) { fb("أحسنت! كتبت الكلمة صحيحة.", "g"); box.querySelectorAll("button,input").forEach((x) => (x.disabled = true)); setTimeout(() => finish(it, wrong, lv), 1200); }
      else { wrong++; let k = 0; while (k < v.length && k < txt.length && v[k] === txt[k]) k++; fb(v ? `قريب! راجع الحرف رقم ${AD(k + 1)} وجرّب مرة أخرى.` : "اكتب الكلمة أولا ثم اضغط تحقق.", "b"); } };
  } else if (it.kind === "make") {
    const T = d.type, BG = ["#ffffff", "#fff3c4", "#d9f2ff", "#e9ddff", "#ffe0ec", "#dff7e4"], INK = ["#3b1a78", "#c0392b", "#1e7a46", "#1f5fae", "#8a6100", "#000000"], BGN = ["أبيض", "أصفر", "أزرق", "بنفسجي", "وردي", "أخضر"], INKN = ["بنفسجي", "أحمر", "أخضر", "أزرق", "ذهبي", "أسود"];
    const cw = T === "poster" ? 320 : 480, ch = T === "poster" ? 440 : 320, IM = {};
    d.stickers.forEach((n) => { const im = new Image(); im.onload = () => { const c = $("#cv"); if (c && c._paint) c._paint(); }; im.src = icon(n); IM[n] = im; });
    const saveProj = (cv) => { const t = D.createElement("canvas"); t.width = 160; t.height = Math.round(160 * cv.height / cv.width); const x = t.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, t.width, t.height); x.drawImage(cv, 0, 0, t.width, t.height); let th = ""; try { th = t.toDataURL("image/jpeg", 0.6); } catch {} const a = (S.dig.proj = (S.dig.proj || []).filter((p) => p.slug !== it.slug)); a.push({ slug: it.slug, name: it.title, thumb: th, t: Date.now() }); S.dig.proj = a.slice(-12); finish(it, 0, lv); };
    const dlBtn = (cv) => { try { const a = D.createElement("a"); a.download = "zad-project.png"; a.href = cv.toDataURL("image/png"); D.body.appendChild(a); a.click(); a.remove(); } catch { toast("تعذر حفظ الصورة على هذا الجهاز."); } };
    if (T === "draw") {
      let col = 0, size = 6, strokes = 0, hist = [];
      const dr = () => {
        box.innerHTML = `${head}<div class="qq">${esc(d.prompt)}</div><p class="hint">ارسم بإصبعك أو بالفأرة. اضغط لونا لتغيير اللون. لا تكتب معلوماتك الخاصة.</p><div class="dgbd"><canvas id="cv" class="dgcv" width="${cw}" height="${ch}" role="img" aria-label="لوحة الرسم"></canvas></div><div class="dgsw" role="group" aria-label="الألوان">${INK.map((c, i) => `<button type="button" class="dgsq${i === col ? " on" : ""}" style="background:${c}" data-c="${i}" aria-label="لون ${INKN[i]}"></button>`).join("")}<button type="button" class="abtn${size === 6 ? " go" : ""}" data-z="6">قلم رفيع</button><button type="button" class="abtn${size === 16 ? " go" : ""}" data-z="16">قلم عريض</button></div><div class="btns"><button type="button" class="abtn" id="und" ${hist.length ? "" : "disabled"}>تراجع</button><button type="button" class="abtn" id="cl">مسح اللوحة</button><button type="button" class="abtn go" id="sv" ${strokes >= 3 ? "" : "disabled"}>احفظ رسمتي</button><button type="button" class="abtn" id="dl" ${strokes >= 3 ? "" : "disabled"}>نزّل الصورة</button></div><div class="fb" id="fb" role="status">${strokes >= 3 ? "رسمة جميلة! يمكنك حفظها." : "ارسم ثلاث خطوط على الأقل لتفتح زر الحفظ."}</div>${back}`;
        const cv = $("#cv"), x = cv.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, cw, ch); if (cv._img) x.putImageData(cv._img, 0, 0); else if (D._dgimg) x.putImageData(D._dgimg, 0, 0);
        const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cw / r.width, (e.clientY - r.top) * ch / r.height]; }; let on = false;
        cv.onpointerdown = (e) => { on = true; cv.setPointerCapture && cv.setPointerCapture(e.pointerId); hist.push(x.getImageData(0, 0, cw, ch)); if (hist.length > 10) hist.shift(); const [a, b] = pt(e); x.strokeStyle = INK[col]; x.lineWidth = size; x.lineCap = x.lineJoin = "round"; x.beginPath(); x.moveTo(a, b); x.lineTo(a + .1, b + .1); x.stroke(); e.preventDefault(); };
        cv.onpointermove = (e) => { if (!on) return; const [a, b] = pt(e); x.lineTo(a, b); x.stroke(); };
        const up = () => { if (!on) return; on = false; strokes++; D._dgimg = x.getImageData(0, 0, cw, ch); dr(); };
        cv.onpointerup = up; cv.onpointercancel = up;
        box.querySelectorAll("[data-c]").forEach((b) => b.onclick = () => { col = +b.dataset.c; D._dgimg = x.getImageData(0, 0, cw, ch); dr(); });
        box.querySelectorAll("[data-z]").forEach((b) => b.onclick = () => { size = +b.dataset.z; D._dgimg = x.getImageData(0, 0, cw, ch); dr(); });
        $("#und").onclick = () => { const h = hist.pop(); D._dgimg = h || null; if (strokes > 0) strokes--; dr(); };
        $("#cl").onclick = () => { hist = []; strokes = 0; D._dgimg = null; dr(); };
        $("#sv").onclick = () => saveProj(cv); $("#dl").onclick = () => dlBtn(cv);
      }; D._dgimg = null; dr();
    } else {
      const F = T === "slides" ? 3 : 1, fr = Array.from({ length: F }, () => ({ bg: 0, ink: 0, txt: "", st: [] })); let cur = 0;
      const paint = (cv, f, n) => { const x = cv.getContext("2d"); x.fillStyle = BG[f.bg]; x.fillRect(0, 0, cw, ch); x.strokeStyle = "#b9a8e8"; x.lineWidth = 6; x.strokeRect(3, 3, cw - 6, ch - 6); const k = f.st.length, sz = Math.min(100, (cw - 40) / Math.max(k, 1)); f.st.forEach((nm, i) => { const im = IM[nm]; if (im && im.complete && im.naturalWidth) x.drawImage(im, (cw - sz * k) / 2 + i * sz, ch * .38 - sz / 2, sz, sz); }); x.fillStyle = INK[f.ink]; x.textAlign = "center"; x.direction = "rtl"; x.font = `800 ${T === "poster" ? 26 : 30}px Cairo, Arial, sans-serif`; x.fillText(f.txt || "", cw / 2, ch * .78, cw - 30); if (F > 1) { x.font = "700 16px Cairo, Arial, sans-serif"; x.fillStyle = "#7a6aa8"; x.fillText("شريحة " + AD(n + 1) + " من " + AD(F), cw / 2, ch - 14); } };
      const okf = (f) => f.st.length >= 1 && f.txt.trim().length >= 2;
      const dr = () => {
        const f = fr[cur];
        box.innerHTML = `${head}<div class="qq">${esc(d.prompt)}</div><div class="dgbd"><canvas id="cv" class="dgcv" width="${cw}" height="${ch}" role="img" aria-label="معاينة المشروع"></canvas></div>${F > 1 ? `<div class="btns"><button type="button" class="abtn" id="pv" ${cur ? "" : "disabled"}>▶ السابقة</button><b>الشريحة ${AD(cur + 1)} من ${AD(F)}</b><button type="button" class="abtn" id="nx" ${cur < F - 1 ? "" : "disabled"}>التالية ◀</button></div>` : ""}<label class="dglab">النص (كلمتان على الأقل، بلا اسم كامل أو عنوان أو رقم هاتف)<input id="tx" class="dgin" type="text" dir="rtl" lang="ar" maxlength="24" autocomplete="off" value="${esc(f.txt)}"></label><b class="dglab">اختر الملصقات (حتى ٥)</b><div class="dgst">${d.stickers.map((n) => `<button type="button" class="dgsk" data-n="${n}" aria-label="أضف ملصقا"><img src="${icon(n)}" alt="" width="40" height="40"></button>`).join("")}<button type="button" class="abtn" id="rm" ${f.st.length ? "" : "disabled"}>احذف آخر ملصق</button></div><b class="dglab">لون الخلفية</b><div class="dgsw">${BG.map((c, i) => `<button type="button" class="dgsq${i === f.bg ? " on" : ""}" style="background:${c}" data-b="${i}" aria-label="خلفية ${BGN[i]}"></button>`).join("")}</div><b class="dglab">لون الكتابة</b><div class="dgsw">${INK.map((c, i) => `<button type="button" class="dgsq${i === f.ink ? " on" : ""}" style="background:${c}" data-k="${i}" aria-label="كتابة ${INKN[i]}"></button>`).join("")}</div><div class="btns"><button type="button" class="abtn go" id="sv" ${fr.every(okf) ? "" : "disabled"}>احفظ مشروعي</button><button type="button" class="abtn" id="dl" ${okf(f) ? "" : "disabled"}>نزّل الصورة</button></div><div class="fb" id="fb" role="status">${fr.every(okf) ? "مشروع رائع! يمكنك حفظه." : "أضف ملصقا وكلمتين لكل " + (F > 1 ? "شريحة" : "تصميم") + " ليفتح زر الحفظ."}</div>${back}`;
        const cv = $("#cv"); cv._paint = () => paint(cv, fr[cur], cur); cv._paint();
        $("#tx").oninput = (e) => { f.txt = e.target.value; cv._paint(); const s = $("#sv"); if (s) s.disabled = !fr.every(okf); const l = $("#dl"); if (l) l.disabled = !okf(f); };
        box.querySelectorAll("[data-n]").forEach((b) => b.onclick = () => { if (f.st.length >= 5) return toast("الحد الأقصى خمسة ملصقات."); f.st.push(b.dataset.n); dr(); });
        $("#rm").onclick = () => { f.st.pop(); dr(); };
        box.querySelectorAll("[data-b]").forEach((b) => b.onclick = () => { f.bg = +b.dataset.b; dr(); });
        box.querySelectorAll("[data-k]").forEach((b) => b.onclick = () => { f.ink = +b.dataset.k; dr(); });
        if (F > 1) { $("#pv").onclick = () => { cur--; dr(); }; $("#nx").onclick = () => { cur++; dr(); }; }
        const bad = () => fr.some((q) => /[0-9٠-٩]{5,}/.test(q.txt));
        $("#sv").onclick = () => { if (bad()) return toast("لا تكتب أرقاما طويلة مثل رقم الهاتف."); const c0 = D.createElement("canvas"); c0.width = cw; c0.height = ch; paint(c0, fr[0], 0); saveProj(c0); };
        $("#dl").onclick = () => { if (bad()) return toast("لا تكتب أرقاما طويلة مثل رقم الهاتف."); dlBtn(cv); };
      }; dr();
    }
  } else if (it.kind === "task") {
    const ck = d.steps.map(() => false);
    const dr = () => { box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="120" height="120">${d.adult ? `<p class="hint"><b>بمرافقة شخص كبير:</b> يقرأ الكبير الخطوات ويشارك الطفل في تنفيذها.</p>` : `<p class="hint">نفّذ كل خطوة مع أسرتك، ثم ضع علامة عليها.</p>`}</div><ul class="dgck">${d.steps.map((s, i) => `<li><label><input type="checkbox" data-i="${i}" ${ck[i] ? "checked" : ""}> <span>${esc(s)}</span></label></li>`).join("")}</ul>${it.family ? `<div class="rv"><b>اقتراح للأسرة:</b><p>${esc(it.family)}</p></div>` : ""}${spk(d.steps.join("، "), "استمع إلى الخطوات")}<div class="btns"><button type="button" class="abtn go" id="dn" ${ck.every(Boolean) ? "" : "disabled"}>أنجزنا المهمة</button></div>${back}`;
      box.querySelectorAll("[data-i]").forEach((c) => c.onchange = () => { ck[+c.dataset.i] = c.checked; dr(); }); $("#dn").onclick = () => finish(it, 0, lv); }; dr();
  }
}
/* ===== لوحة ولي الأمر ===== */
let rstArm = false;
function progressPage() {
  const box = $("#aview"), lv = getLv(), all = ITEMS.filter((x) => isDone(x.slug)), bd = badges(), rec = (x) => S.dig.it[x.slug], proj = S.dig.proj || [];
  const lessons = all.filter((x) => x.kind === "lesson"), mastered = all.filter((x) => x.kind !== "lesson" && x.kind !== "task" && rec(x).w <= 1);
  const review = ITEMS.filter((x) => { const r = rec(x); return r && r.w >= 2 && r.d <= 1; }).slice(0, 8);
  const okImg = (u) => /^data:image\/(jpeg|png);base64,[A-Za-z0-9+\/=]+$/.test(u || "");
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة ولي الأمر: المهارات الرقمية</h1><p>ما أكمله الطفل وما أتقنه وما يحتاج مراجعة وما صنعه. التقييم هنا للتشجيع وليس للمقارنة.</p></div></div>
<div class="pg2"><div><b>${AD(lessons.length)}</b>درسا مكتملا</div><div><b>${AD(mastered.length)}</b>مهارة متقنة</div><div><b>${AD(proj.length)}</b>مشروعا منجزا</div><div><b>${AD(S.dig.pts)}</b>نقطة</div></div>
<section class="art"><h2>التقدم حسب التصنيف</h2><p class="hint">المرحلة المعروضة: ${esc(LV[lv])}. تغيير المرحلة من الصفحة الرئيسية.</p><div class="sks">${Object.keys(CATS).map((c) => { const s = catStat(c, lv), inf = stepInfo(c, lv), cur = Object.keys(inf).map(Number).find((k) => inf[k].d < inf[k].n); return `<div><span>${esc(CATS[c][0])}</span><b>${AD(s.d)} من ${AD(s.n)}${cur ? " · المستوى: " + STEPS[cur][0] : s.n ? " · أنهى كل المستويات" : ""}</b><span class="bar"><i style="width:${s.n ? (s.d / s.n) * 100 : 0}%"></i></span></div>`; }).join("")}</div></section>
<section class="art"><h2>المهارات التي أتقنها</h2>${mastered.length ? `<div class="rvc">${mastered.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div><p class="hint">تُحسب المهارة متقنة إذا أكملها الطفل بخطأ واحد على الأكثر.</p>` : `<p class="tx">ستظهر هنا المهارات بعد إكمال الأنشطة.</p>`}</section>
${review.length ? `<section class="art"><h2>أنشطة تحتاج إلى مراجعة لطيفة</h2><p class="tx">احتاجت هذه الأنشطة إلى محاولات أكثر. يمكن إعادتها بهدوء، فالإعادة تقوّي المهارة.</p><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>المشروعات التي أنجزها</h2>${proj.length ? `<div class="dgpj">${proj.slice().reverse().map((p) => `<figure>${okImg(p.thumb) ? `<img src="${p.thumb}" alt="مشروع: ${esc(p.name)}">` : ""}<figcaption>${esc(p.name)}</figcaption></figure>`).join("")}</div>` : `<p class="tx">لم ينجز الطفل مشروعا بعد. مشروعات التصميم في المستوى الخامس.</p>`}</section>
<section class="art"><h2>الشارات</h2>${bd.length ? `<div class="dgbd2">${bd.map((b) => `<span><img src="${icon(b[1])}" alt="" width="40" height="40"> ${esc(b[0])}</span>`).join("")}</div>` : `<p class="tx">ستظهر الشارات بعد إكمال الأنشطة.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط، ولا تُرسل إلى أي حساب، ولا تظهر لأي زائر آخر. يُرسل فقط عدد الأخطاء المجهول لكل نشاط لتحسين المحتوى، دون اسم أو أي بيانات شخصية.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح تقدم الطفل في هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">متابعة الأنشطة</a><a class="abtn" href="../print/">أوراق للطباعة</a></div>`;
  $("#rst").onclick = () => { if (!rstArm) { rstArm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد: سيُمسح التقدم والمشروعات"; return; } S.dig = { it: {}, pts: 0, proj: [] }; save(); rstArm = false; progressPage(); toast("تم مسح تقدم هذا القسم."); };
}
/* ===== الطباعة ===== */
const PDFS = [["dig-device-cards", "بطاقات الأجهزة ووظائفها", "بطاقات مصورة للقص: حاسوب ولوحي وطابعة وسماعات وغيرها.", "dg_laptop"], ["dig-keyboard-mouse", "ورقة عمل: لوحة المفاتيح والفأرة", "تعرّف على الأجزاء وصلها بأعمالها.", "dg_keyboard"], ["dig-commands-grid", "شبكة الأوامر والروبوت", "لعبة ورقية: يرسم الطفل مسار الروبوت بالأسهم.", "dg_bot"], ["dig-safety-rules", "بطاقة قواعد السلامة الرقمية", "قواعد قصيرة مصورة تُعلّق قرب الجهاز.", "dg_pw"], ["dig-safe-unsafe", "ورقة عمل: آمن أم غير آمن", "يلوّن الطفل التصرف الآمن ويشطب غير الآمن.", "dg_stranger"], ["dig-patterns", "ورقة عمل: اكتشف النمط", "أنماط من الصور يكملها الطفل.", "1f9e9"]];
function printPage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_notebook")}" alt=""><div><h1>أوراق وجداول للطباعة</h1><p>ملفات PDF جاهزة للتحميل والطباعة على ورق A4.</p></div></div><div class="dgl">${PDFS.map((x) => `<a class="dgi" href="${ROOT}files/digital/${x[0]}.pdf" target="_blank" rel="noopener"><img src="${icon(x[3])}" alt="" width="52" height="52"><span><b>${esc(x[1])}</b><small>${esc(x[2])}</small></span></a>`).join("")}</div><p class="hint">تُفتح الملفات في نافذة جديدة. عاين الملف قبل الطباعة.</p><p><a class="abtn" href="../">العودة إلى المهارات الرقمية</a></p>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "print") printPage(); else hubPage(); })();
})();
