/* خريطة المهارات – زاد: علاقات بين المهارات يحدّدها فريق المحتوى (rel_public)، تظهر بعد نشرها بيد مراجع، مع نشاط رابط وموارد مرتبطة فعليًا.
   لا نخمّن علاقات. على الهاتف: قائمة مترابطة؛ على الشاشات الأوسع: رسم بسيط للمهارة المختارة وروابطها. */
(function (W) {
"use strict";
const D = document, Z = W.ZFIND, S = W.ZSAVED, ROOT = Z.ROOT, esc = Z.esc;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"], INS = (l) => AGES.includes(l) || GRADES.includes(l);
const KIND = { base: "مهارة أساسية ومرتبطة بها", within: "داخل المادة نفسها", cross: "بين المواد", daily: "مع الحياة اليومية" };
const TYPE = { lib: "ورقة عمل", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "نشيد", stories: "قصة", quiz: "اختبار", games: "لعبة", cards: "بطاقات" };
const ST = { dom: "", age: "", grade: "" };
let SK = [], DOMS = {}, REL = [], REVS = new Set(), BYKEY = new Map(), root = null, trail = [];
const rpc = async (fn) => { const r = await fetch(SB + "/rest/v1/rpc/" + fn, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: "{}" }); if (!r.ok) throw new Error(fn + " " + r.status); return r.json(); };
const kidLv = () => { try { return S.kidLv() || ""; } catch (e) { return ""; } };
const url = (it) => ROOT + String(it.url || "").replace(/^\/+/, "");
const lvTxt = (lv) => { lv = Z.LVK.filter((l) => (lv || []).includes(l)); if (!lv.length) return ""; return lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]; };
const sk = (slug) => SK.find((s) => s.slug === slug);
function prep(skj, rj, rv) {
  BYKEY = new Map(Z.X.items.map((i) => [i.key, i]));
  DOMS = Object.fromEntries((skj.domains || []).map((d) => [d.slug, d]));
  SK = (skj.skills || []).filter((s) => DOMS[s.domain] && (s.levels || []).every(INS)).map((s) => Object.assign({}, s, { d: DOMS[s.domain] }));
  REL = (rj.items || []).map((r) => {
    if (!r.levels.every(INS) || !sk(r.from) || !sk(r.to)) return null;
    const its = r.items.map((x) => ({ it: BYKEY.get(x.k), bridge: x.bridge })).filter((x) => x.it && x.it.lv.some((l) => r.levels.includes(l)));
    return its.length ? Object.assign({}, r, { res: its }) : null;
  }).filter(Boolean);
  REVS = new Set((rv.items || []).map((x) => x.s));
}
const lvSel = () => ST.age || ST.grade || "";
const relsOf = (slug) => REL.filter((r) => (r.from === slug || r.to === slug) && (!lvSel() || r.levels.includes(lvSel())));
/* ---- القائمة ---- */
function home() {
  const ids = new Set(); REL.filter((r) => !lvSel() || r.levels.includes(lvSel())).forEach((r) => { ids.add(r.from); ids.add(r.to); });
  const a = SK.filter((s) => ids.has(s.slug) && (!ST.dom || s.domain === ST.dom));
  const doms = Object.values(DOMS).filter((d) => SK.some((s) => ids.has(s.slug) && s.domain === d.slug));
  const opt = (arr, v, lab) => `<option value="">${lab}</option>` + arr.map((l) => `<option value="${l}"${v === l ? " selected" : ""}>${esc(Z.LVN[l])}</option>`).join("");
  const chips = doms.map((d) => `<button type="button" class="skdom" data-d="${esc(d.slug)}" aria-pressed="${ST.dom === d.slug}" style="--c:${esc(d.color || "#e6dcff")}"><img src="${ROOT}images/ill/${esc(d.icon)}" alt="">${esc(d.name)}</button>`).join("");
  const by = (d) => a.filter((s) => s.domain === d.slug).map((s) => `<article class="skcard" style="--c:${esc(d.color || "#c1aef0")}"><h3>${esc(s.name)}</h3><div class="mt"><span>${esc(d.name)}</span><span>${AD(relsOf(s.slug).length)} ${relsOf(s.slug).length === 1 ? "رابط" : "روابط"}</span></div><a class="skgo" href="#k=${encodeURIComponent(s.slug)}">اعرض الروابط</a></article>`).join("");
  const empty = `<div class="fzempty"><img src="${ROOT}images/zad/i_puzzle.webp" alt=""><h3>لا توجد روابط منشورة بهذه الاختيارات الآن</h3><p>نضيف الروابط بين المهارات بعد أن يراجعها فريق المحتوى. يمكنك فتح <a href="${ROOT}skills/">المهارات</a> أو <a href="${ROOT}library/">المكتبة</a> في أي وقت.</p></div>`;
  root.innerHTML = `${chips ? `<h2 class="skhint" style="font-size:17px;margin:16px 0 0;color:var(--z-pri,#5b2bb8)">اختر المجال</h2><div class="skdoms">${chips}</div>` : ""}<div class="skf" role="group" aria-label="تصفية الروابط"><label>العمر<select id="mage">${opt(AGES, ST.age, "كل الأعمار")}</select></label><label>الصف<select id="mgr">${opt(GRADES, ST.grade, "كل الصفوف")}</select></label></div>${kidLv() && !lvSel() ? `<p class="skhint">طفلك الحالي: ${esc(Z.LVN[kidLv()])}. اختر عمره أو صفه من التصفية.</p>` : ""}<p class="skhint">${AD(a.length)} مهارة لها روابط</p>${a.length ? doms.map((d) => { const h = by(d); return h ? `<h3 class="skstage">${esc(d.name)}</h3><div class="skgrid">${h}</div>` : ""; }).join("") : empty}`;
}
/* ---- مهارة وروابطها ---- */
function svg(s, rs) {
  const inc = rs.filter((r) => r.to === s.slug && (r.kind === "base" || r.kind === "within")).map((r) => sk(r.from)), out = rs.filter((r) => r.from === s.slug && (r.kind === "base" || r.kind === "within")).map((r) => sk(r.to));
  const oth = rs.filter((r) => r.kind === "cross" || r.kind === "daily").map((r) => sk(r.from === s.slug ? r.to : r.from));
  const uniq = (a) => [...new Map(a.map((x) => [x.slug, x])).values()].slice(0, 5);
  const I = uniq(inc), O = uniq(out), X = uniq(oth), H = Math.max(120, 60 * Math.max(I.length, O.length)) + (X.length ? 90 : 0), cy = Math.max(60, 30 * Math.max(I.length, O.length, 1)) + 10;
  const node = (n, x, y, c) => `<a href="#k=${encodeURIComponent(n.slug)}" aria-label="${esc(n.name)}"><rect x="${x - 80}" y="${y - 20}" width="160" height="40" rx="14" fill="${esc(n.d.color || "#e6dcff")}" stroke="${c}" stroke-width="2"/><text x="${x}" y="${y + 5}" text-anchor="middle">${esc(n.name.length > 20 ? n.name.slice(0, 19) + "…" : n.name)}</text></a>`;
  const col = (arr, x) => arr.map((n, i) => { const y = cy + (i - (arr.length - 1) / 2) * 58; return { n, x, y }; });
  const R = col(I, 640), L = col(O, 160), B = X.map((n, i) => ({ n, x: 100 + i * 150 + (5 - X.length) * 75, y: H - 30 }));
  const line = (a, b, c) => `<path d="M${a[0]} ${a[1]} C ${(a[0] + b[0]) / 2} ${a[1]}, ${(a[0] + b[0]) / 2} ${b[1]}, ${b[0]} ${b[1]}" fill="none" stroke="${c}" stroke-width="2.5"/>`;
  return `<svg class="mpsvg" viewBox="0 0 800 ${H}" role="group" aria-label="خريطة روابط مهارة ${esc(s.name)}">${R.map((p) => line([p.x - 80, p.y], [320, cy], "#7a5cd6")).join("")}${L.map((p) => line([480, cy], [p.x + 80, p.y], "#1e9b6b")).join("")}${B.map((p) => line([400, cy + 20], [p.x, p.y - 20], "#e08a1e")).join("")}${R.map((p) => node(p.n, p.x, p.y, "#7a5cd6")).join("")}${L.map((p) => node(p.n, p.x, p.y, "#1e9b6b")).join("")}${B.map((p) => node(p.n, p.x, p.y, "#e08a1e")).join("")}<g><rect x="320" y="${cy - 24}" width="160" height="48" rx="16" fill="#5b2bb8"/><text x="400" y="${cy + 5}" text-anchor="middle" style="fill:#fff">${esc(s.name.length > 20 ? s.name.slice(0, 19) + "…" : s.name)}</text></g>${R.length ? '<text x="640" y="14" text-anchor="middle">تعلّمتها قبلها</text>' : ""}${L.length ? '<text x="160" y="14" text-anchor="middle">تفيدك في</text>' : ""}${B.length ? `<text x="400" y="${H - 62}" text-anchor="middle">روابط بين المواد والحياة</text>` : ""}</svg>`;
}
function focus(slug) {
  const s = sk(slug), rs = s ? relsOf(slug) : [];
  if (!s || !REL.some((r) => r.from === slug || r.to === slug)) { root.innerHTML = `<a class="skback" href="#">← كل المهارات</a><div class="fzempty"><h3>لا توجد روابط منشورة لهذه المهارة</h3><p>يمكنك فتح <a href="${ROOT}skills/#s=${encodeURIComponent(slug)}">صفحة المهارة</a> مباشرة.</p></div>`; return; }
  if (trail[trail.length - 1] !== slug) trail.push(slug); if (trail.length > 20) trail.shift();
  const prev = trail.length > 1 ? sk(trail[trail.length - 2]) : null;
  const card = (r) => {
    const out = r.from === slug, o = sk(out ? r.to : r.from), br = r.res.find((x) => x.bridge), more = r.res.filter((x) => x !== br);
    const dir = out ? `ما تتعلمه هنا يفيدك في «${esc(o.name)}»` : (r.kind === "base" || r.kind === "within") ? `سبق أن تعلمت «${esc(o.name)}»، وهي تساعدك هنا` : `ترتبط بمهارة «${esc(o.name)}»`;
    return `<article class="rel" style="--sc:${esc(o.d.color || "#e4d9ff")}"><span class="reldir">${esc(KIND[r.kind])}</span><span class="reldir" style="background:${esc(o.d.color || "#f1eaff")}">${esc(o.d.name)}</span><h3>${esc(o.name)}</h3><p>${dir}.</p><div class="srbox">${esc(r.expl)}</div><p class="m">للأعمار: ${esc(lvTxt(r.levels))}</p>${br ? `<div class="srbox"><b>نشاط يجمع المهارتين</b><br><a href="${url(br.it)}">${esc(br.it.title)}</a> <small>(${esc(TYPE[br.it.src] || "نشاط")})</small></div>` : ""}${more.length ? `<b>موارد تساعدك على ممارسة هذه العلاقة</b><ul>${more.map((x) => `<li><a href="${url(x.it)}">${esc(x.it.title)}</a> <small>(${esc(TYPE[x.it.src] || "مورد")})</small></li>`).join("")}</ul>` : ""}<div class="srbtns"><a href="#k=${encodeURIComponent(o.slug)}">اعرض روابط «${esc(o.name)}»</a><a class="alt" href="${ROOT}skills/#s=${encodeURIComponent(o.slug)}">افتح المهارة</a>${!out && REVS.has(o.slug) ? `<a class="alt" href="${ROOT}review/#s=${encodeURIComponent(o.slug)}">راجع المهارة السابقة</a>` : ""}</div></article>`;
  };
  const br = rs.map((r) => ({ r, b: r.res.find((x) => x.bridge) })).filter((x) => x.b);
  root.innerHTML = `<a class="skback" href="#">← كل المهارات</a>${prev ? `<a class="skback" href="#k=${encodeURIComponent(prev.slug)}">← المهارة السابقة: ${esc(prev.name)}</a>` : ""}<div class="pthcov" style="--c:${esc(s.d.color)}"><img src="${ROOT}images/ill/${esc(s.d.icon)}" alt=""><div><h2>مهارات مرتبطة بمهارة «${esc(s.name)}»</h2><div class="pthmeta"><span>${esc(s.d.name)}</span><span>${esc(lvTxt(s.levels))}</span><span>${AD(rs.length)} ${rs.length === 1 ? "رابط" : "روابط"}</span></div></div></div>${rs.length ? svg(s, rs) : ""}${rs.length ? rs.map(card).join("") : `<div class="fzempty"><h3>لا توجد روابط لهذا العمر</h3><p>جرّب عمرًا أو صفًا آخر من الصفحة الرئيسية للخريطة.</p></div>`}<div class="srbtns"><a href="${ROOT}skills/#s=${encodeURIComponent(slug)}">افتح مهارة «${esc(s.name)}»</a></div><details class="srpar"><summary>لولي الأمر</summary><p>نربط المهارات ليرى الطفل كيف يستعمل ما تعلمه في مكان آخر. لا يعني الرابط أن طفلك يحتاج إلى شيء؛ هو اقتراح للتعلّم.</p>${br.length ? `<p><b>أنشطة تجمع بين مهارتين:</b></p><ul>${br.map((x) => `<li><a href="${url(x.b.it)}">${esc(x.b.it.title)}</a></li>`).join("")}</ul>` : ""}<p><a href="${ROOT}review/">مراجعة المهارات السابقة</a> · <a href="${ROOT}plan/">خطة التعلم الأسبوعية</a></p></details><a class="skback" href="${ROOT}library/">العودة إلى المكتبة</a>`;
  D.title = "روابط " + s.name + " | خريطة المهارات | منصة زاد التعليمية";
}
const curSlug = () => (decodeURIComponent(location.hash).match(/^#k=(.+)$/) || [])[1];
function route() { const k = curSlug(); if (k) focus(k); else { trail = []; D.title = "خريطة المهارات | منصة زاد التعليمية"; home(); } }
function bind() {
  W.addEventListener("hashchange", route);
  D.addEventListener("click", (e) => { const d = e.target.closest(".skdom"); if (d) { ST.dom = ST.dom === d.dataset.d ? "" : d.dataset.d; home(); } });
  D.addEventListener("change", (e) => { const t = e.target; if (t.id === "mage") { ST.age = t.value; ST.grade = ""; home(); } if (t.id === "mgr") { ST.grade = t.value; ST.age = ""; home(); } });
}
async function init() {
  root = $("#skbody");
  try {
    const [rj, skj, rv] = await Promise.all([rpc("rel_public"), rpc("skills_public"), rpc("review_public").catch(() => ({ items: [] })), Z.load()]);
    if (!Z.X.items.length && (Z.X.failed || []).length) throw new Error("index");
    prep(skj, rj, rv); bind(); route();
  } catch (e) {
    root.innerHTML = `<div class="fzempty"><h3>تعذّر تحميل الخريطة الآن</h3><p>تحقق من الاتصال وأعد المحاولة. لن نعرض بيانات غير مؤكدة.</p><button type="button" id="mretry">إعادة المحاولة</button></div>`;
    const b = $("#mretry"); if (b) b.addEventListener("click", () => { Z.reset(); init(); });
  }
}
W.__mapTest = { ST, get REL() { return REL; } };
init();
})(window);
