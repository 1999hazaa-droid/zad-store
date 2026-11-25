/* صفحة «الحزم التعليمية الجاهزة»: الأقسام المقترحة والتصنيف والبحث والتصفية */
(function () {
"use strict";
const P = window.ZPACKS, Z = window.ZFIND, S = window.ZSAVED; if (!P || !Z) return;
const D = document, esc = P.esc, AD = P.AD, ROOT = P.ROOT, X = Z.X;
const $ = (s) => D.querySelector(s);
const EARLY = ["a2", "a3", "a4", "a5", "a6"], PRIM = ["g1", "g2", "g3", "g4"];
const ST = { q: "", lv: "", dom: "", ct: "", acc: "", started: false };
let MODEL = [], READY = false, FAIL = false, HIDDEN = 0;

const lvTxt = (lv) => (lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]);
function build(packs) {
  MODEL = []; HIDDEN = 0;
  packs.forEach((p) => {
    const r = P.resolve(p, Z);
    if (r.items.length < P.MIN_READY) { HIDDEN++; return; }
    MODEL.push({ p, items: r.items, acc: P.access(r.items), prog: P.progress(p.slug, r.items), unknown: r.unknown, fav: P.isFav(p.slug), cts: new Set(r.items.map((i) => i.ct)) });
  });
}
const refresh = () => MODEL.forEach((m) => { m.prog = P.progress(m.p.slug, m.items); m.fav = P.isFav(m.p.slug); });
function matches(m) {
  if (ST.lv && !m.p.levels.includes(ST.lv)) return false;
  if (ST.dom && m.p.dom !== ST.dom) return false;
  if (ST.ct && !m.cts.has(ST.ct)) return false;
  if (ST.acc === "free" && m.acc.k !== "free") return false;
  if (ST.acc === "paid" && m.acc.k === "free") return false;
  if (ST.started && !m.prog.opened) return false;
  if (ST.q) { const q = Z.qstems(ST.q); if (!q.length) return true; const h = new Set(Z.qstems([m.p.title, m.p.summary, (m.p.skills || []).join(" "), Z.domName(m.p.dom)].join(" "))); if (!q.every((s) => h.has(s) || [...h].some((w) => w.length >= 4 && s.length >= 3 && w.startsWith(s)))) return false; }
  return true;
}
const filtersOn = () => !!(ST.q || ST.lv || ST.dom || ST.ct || ST.acc || ST.started);
function fdate(t) { try { return new Date(t).toLocaleDateString("ar-OM", { day: "numeric", month: "long" }); } catch (e) { return ""; } }

function card(m) {
  const p = m.p, pr = m.prog, img = ROOT + String(p.cover || "images/zad/i_book.webp").replace(/^\/+/, "");
  const progTxt = pr.opened ? `<p class="pk-pr">فتحتَ ${AD(pr.opened)} من ${AD(pr.total)} موارد${pr.last ? " · آخر استخدام " + esc(fdate(pr.last)) : ""}</p>` : "";
  const cont = pr.next >= 0 ? `<a class="pk-go" href="${esc(P.itemUrl(m.items[pr.next], p.slug, p.keys.indexOf(m.items[pr.next].key) + 1))}" aria-label="متابعة: ${esc(m.items[pr.next].title)}">متابعة</a>` : "";
  return `<article class="pk-c" data-s="${esc(p.slug)}"><span class="pk-lvb">${esc(lvTxt(p.levels))}</span><a class="pk-th" href="view/?p=${encodeURIComponent(p.slug)}" tabindex="-1" aria-hidden="true"><img src="${esc(img)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_book.webp'"></a>
<div class="pk-bd"><h3>${esc(p.title)}</h3><div class="pk-mt"><span>${esc(Z.domName(p.dom))}</span><span>${AD(m.items.length)} موارد</span><span class="${m.acc.k === "free" ? "fr" : "pd"}">${esc(m.acc.k === "mixed" ? "تتضمن " + AD(m.acc.paid) + " مدفوعة" : m.acc.t)}</span></div><p class="pk-s">${esc(p.summary)}</p>${progTxt}</div>
<div class="pk-ac">${cont}<a class="pk-go" href="view/?p=${encodeURIComponent(p.slug)}" aria-label="${pr.opened ? "عرض الحزمة" : "ابدأ الحزمة"}: ${esc(p.title)}">${pr.opened ? "عرض الحزمة" : "ابدأ الحزمة"}</a><button type="button" data-fav="${esc(p.slug)}" aria-pressed="${m.fav}" aria-label="${m.fav ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}: ${esc(p.title)}">${m.fav ? "تم الحفظ" : "حفظ"}</button></div></article>`;
}
const grid = (arr) => `<div class="pk-grid">${arr.map(card).join("")}</div>`;
const sec = (id, title, note, arr) => (arr.length ? `<section class="pk-sec" aria-labelledby="${id}"><h2 id="${id}">${esc(title)}</h2>${note ? `<p class="n">${esc(note)}</p>` : ""}${grid(arr)}</section>` : "");

function fill() {
  const lvs = [...new Set(MODEL.flatMap((m) => m.p.levels))], doms = [...new Set(MODEL.map((m) => m.p.dom))], cts = [...new Set(MODEL.flatMap((m) => [...m.cts]))];
  const set = (id, arr, name) => { const s = $(id), cur = s.value; s.innerHTML = `<option value="">الكل</option>` + arr.map((v) => `<option value="${esc(v)}">${esc(name(v))}</option>`).join(""); s.value = arr.includes(cur) ? cur : ""; };
  set("#pklv", Z.LVK.filter((l) => lvs.includes(l)), (l) => Z.LVN[l]); set("#pkdom", doms, Z.domName); set("#pkct", Z.CTK.filter((c) => cts.includes(c)), (c) => Z.CT[c]);
}
function drawAct() {
  const a = []; if (ST.lv) a.push(["lv", Z.LVN[ST.lv]]); if (ST.dom) a.push(["dom", Z.domName(ST.dom)]); if (ST.ct) a.push(["ct", Z.CT[ST.ct]]); if (ST.acc) a.push(["acc", ST.acc === "free" ? "مجانية بالكامل" : "تتضمن موارد مدفوعة"]); if (ST.started) a.push(["started", "الحزم التي بدأتها"]); if (ST.q) a.push(["q", "«" + ST.q + "»"]);
  $("#pkact").innerHTML = a.map(([k, n]) => `<button type="button" class="fzx" data-rm="${k}" aria-label="إلغاء الفلتر: ${esc(n)}">${esc(n)}</button>`).join("") + (a.length ? `<button type="button" class="fzt" data-clear="1">مسح الفلاتر</button>` : "");
}
function render() {
  drawAct(); const out = $("#pkres");
  if (!READY) { out.innerHTML = `<div class="pk-sk"></div>`; return; }
  const warn = FAIL ? `<div class="pk-warn" role="alert">تعذّر تحميل بعض الأقسام، فقد لا تظهر بعض الحزم كاملة. أعد المحاولة لاحقًا.</div>` : X.failed.length ? `<div class="pk-warn" role="alert">تعذّر تحميل بعض أقسام المكتبة، فقد تظهر بعض الحزم بموارد أقل من المعتاد.</div>` : "";
  if (!MODEL.length) { out.innerHTML = warn + `<div class="fzempty"><img src="${ROOT}images/zad/i_star.webp" alt=""><h3>لا توجد حزم جاهزة الآن</h3><p>نضيف حزمًا جديدة باستمرار. يمكنك في الأثناء تصفح <a href="../library/">المكتبة التعليمية</a>.</p></div>`; return; }
  if (filtersOn()) {
    const r = MODEL.filter(matches);
    out.innerHTML = warn + `<p class="pk-note" role="status">${r.length ? "عدد الحزم: " + AD(r.length) : ""}</p>` + (r.length ? grid(r) : `<div class="fzempty"><h3>لا توجد حزم تطابق اختيارك</h3><p>جرّب تغيير الفلاتر أو كلمة البحث.</p><button type="button" class="fzt p" data-clear="1">مسح الفلاتر</button></div>`);
    return;
  }
  const lv = S ? S.kidLv() : "", now = Date.now();
  const sug = lv ? MODEL.filter((m) => m.p.levels.includes(lv)) : [];
  const started = MODEL.filter((m) => m.prog.opened).sort((a, b) => b.prog.last - a.prog.last).slice(0, 4);
  const fresh = MODEL.filter((m) => now - Date.parse(m.p.created_at) < 30 * 864e5).sort((a, b) => Date.parse(b.p.created_at) - Date.parse(a.p.created_at)).slice(0, 4);
  const free = MODEL.filter((m) => m.acc.k === "free").slice(0, 8), paid = MODEL.filter((m) => m.acc.k !== "free").slice(0, 8);
  const pop = MODEL.filter((m) => (m.p.starts || 0) >= 3).sort((a, b) => b.p.starts - a.p.starts).slice(0, 4);
  const fav = MODEL.filter((m) => m.fav);
  const hint = !lv ? `<p class="pk-note">لعرض حزم مقترحة لعمر طفلك، <a href="../learn/">اختر عمره أو صفه</a> في لوحة الطفل.</p>` : "";
  const group = (title, ids) => { const g = ids.filter((l) => MODEL.some((m) => m.p.levels.includes(l))); return g.length ? `<section class="pk-sec" aria-labelledby="pk-${ids[0]}"><h2 id="pk-${ids[0]}">${esc(title)}</h2>${g.map((l) => `<h3 class="lv">${esc(Z.LVN[l])}</h3>${grid(MODEL.filter((m) => m.p.levels.includes(l)))}`).join("")}</section>` : ""; };
  out.innerHTML = warn + hint + sec("pk-started", "تابع الحزم التي بدأتها", "حزم فتحتَ بعض مواردها", started) + sec("pk-sug", "حزم مقترحة لعمر طفلك", "حسب العمر أو الصف المحدد في ملف الطفل", sug) + sec("pk-new", "الحزم الجديدة", "أضيفت إلى المكتبة مؤخرًا", fresh) + sec("pk-free", "الحزم المجانية", "كل مواردها مجانية", free) + sec("pk-paid", "حزم تتضمن موارد مدفوعة", "تتاح معاينة المورد المدفوع، والملف الكامل بعد الطلب", paid) + sec("pk-pop", "الأكثر استخدامًا", "حسب عدد مرات بدء الحزمة", pop) + sec("pk-fav", "حزمك المفضلة", "", fav) + group("حزم الطفولة المبكرة", EARLY) + group("حزم المرحلة الابتدائية", PRIM);
}
const change = (fn) => { fn(); render(); };
$("#pkq").addEventListener("input", (e) => change(() => { ST.q = e.target.value.trim(); }));
$("#pklv").addEventListener("change", (e) => change(() => { ST.lv = e.target.value; }));
$("#pkdom").addEventListener("change", (e) => change(() => { ST.dom = e.target.value; }));
$("#pkct").addEventListener("change", (e) => change(() => { ST.ct = e.target.value; }));
$("#pkacc").addEventListener("change", (e) => change(() => { ST.acc = e.target.value; }));
$("#pkst").addEventListener("change", (e) => change(() => { ST.started = e.target.checked; }));
function syncInputs() { $("#pkq").value = ST.q; $("#pklv").value = ST.lv; $("#pkdom").value = ST.dom; $("#pkct").value = ST.ct; $("#pkacc").value = ST.acc; $("#pkst").checked = ST.started; }
D.addEventListener("click", (e) => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.dataset.clear) { change(() => { Object.assign(ST, { q: "", lv: "", dom: "", ct: "", acc: "", started: false }); syncInputs(); }); return; }
  if (t.dataset.rm) { change(() => { const k = t.dataset.rm; ST[k] = k === "started" ? false : ""; syncInputs(); }); return; }
  const f = t.dataset.fav; if (f) { const m = MODEL.find((x) => x.p.slug === f); if (!m) return; const img = ROOT + String(m.p.cover || "").replace(/^\/+/, ""), r = P.toggleFav(m.p, img); if (S) S.toast(r.ok ? (r.on ? "تم الحفظ في «محتواي المحفوظ»" : "أُزيلت من المحفوظات") : r.msg); refresh(); render(); }
});
window.addEventListener("zad-packs", () => { if (READY) { refresh(); render(); } });
window.addEventListener("zad-saved", () => { if (READY) { refresh(); render(); } });
window.addEventListener("pageshow", (e) => { if (e.persisted && READY) { refresh(); render(); } });

render();
Promise.all([Z.load().catch(() => null), P.load().catch(() => { FAIL = true; return []; }), S ? S.ready() : null, window.ZRECENT ? window.ZRECENT.loadCfg() : null]).then(([, packs]) => {
  if (!X.all || !X.all.length) FAIL = true;
  build(packs || []); fill(); READY = true; render();
});
})();
