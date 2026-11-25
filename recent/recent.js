/* صفحة «تابع من حيث توقفت» (السجل الكامل) */
(function () {
"use strict";
const R = window.ZRECENT, S = window.ZSAVED, Z = window.ZFIND; if (!R || !Z || !S) return;
const D = document, esc = R.esc, X = Z.X, ROOT = R.ROOT, AD = R.AD, LK = "zad-learn-v3";
const $ = (s, r) => (r || D).querySelector(s), $$ = (s, r) => [...(r || D).querySelectorAll(s)];
const PLAN_SRC = new Set(["acts", "bank", "proj", "life", "ready", "val", "vid", "songs", "stories", "quiz"]);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const ST = { ct: new Set(), dom: new Set(), status: "", open: false, confirm: false };
let READY = false;
const SF = { "": "كل الحالات", done: "أكملتها", notdone: "بدأتها ولم أكملها" };

function rows() { return READY ? R.resolve(Z, R.list()) : []; }
function filtered(all) {
  let a = all.slice();
  if (ST.ct.size) a = a.filter((r) => r.it && ST.ct.has(r.it.ct));
  if (ST.dom.size) a = a.filter((r) => r.it && ST.dom.has(r.it.dom));
  if (ST.status === "done") a = a.filter((r) => r.status === "done"); else if (ST.status === "notdone") a = a.filter((r) => r.status !== "done");
  return a;
}
function extra(r) {
  const it = r.it, on = S.has(it.key);
  return `<button type="button" data-zr="fav" aria-pressed="${on}" aria-label="${on ? "إزالة من المفضلة" : "حفظ في المفضلة"}: ${esc(it.title)}">${on ? "تم الحفظ" : "حفظ"}</button>${PLAN_SRC.has(it.src) ? `<button type="button" data-zr="plan" aria-label="إضافة إلى خطتي: ${esc(it.title)}">إضافة إلى خطتي</button>` : ""}`;
}
function planBox() {
  const lv = S.kidLv(), t = S.iso(new Date()), ws = S.weekStart(t);
  if (!lv) return `<div class="fzplan"><p class="m bad">اختر عمر طفلك أو صفه أولًا ليُضاف النشاط إلى خطته.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  const opts = DAYS.map((n, i) => { const d = S.addDays(ws, i), dd = S.parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  return `<div class="fzplan"><label>اليوم من هذا الأسبوع <select data-r="day">${opts}</select></label><div class="r"><button type="button" data-zr="planok">إضافة</button><button type="button" data-zr="plancancel">إلغاء</button></div><p class="m" data-r="msg" role="status"></p></div>`;
}
function drawKids() {
  const Dd = S.read && JSON.parse(localStorage.getItem(LK) || "null"), box = $("#zrkids"); const ks = Dd && Dd.kids ? Object.keys(Dd.kids) : [];
  if (ks.length < 2) { box.hidden = true; return; }
  const nm = (k) => Dd.kids[k].name || (Dd.kids[k].pf && Dd.kids[k].pf.nick) || "الطفل " + AD(ks.indexOf(k) + 1);
  box.hidden = false; box.innerHTML = `<label for="zrk">سجل الطفل:</label><select id="zrk">${ks.map((k) => `<option value="${esc(k)}"${k === Dd.cur ? " selected" : ""}>${esc(nm(k))}</option>`).join("")}</select>`;
}
function drawFilters(all) {
  const f = $("#zrf"), tg = $("#zrftog"), cts = Z.CTK.filter((c) => all.some((r) => r.it && r.it.ct === c)), doms = [...new Set(all.map((r) => r.it && r.it.dom).filter(Boolean))];
  tg.setAttribute("aria-expanded", String(ST.open)); f.hidden = !ST.open; tg.hidden = !all.length;
  if (!ST.open) return;
  const chips = (kind, vals, name) => vals.length > 0 ? `<fieldset><legend>${kind === "ct" ? "نوع المحتوى" : "المجال"}</legend><div class="fzchips">${vals.map((v) => `<button type="button" class="fzchip${ST[kind].has(v) ? " on" : ""}" data-f="${kind}" data-v="${esc(v)}" aria-pressed="${ST[kind].has(v)}">${esc(name(v))}</button>`).join("")}</div></fieldset>` : "";
  f.innerHTML = `<fieldset><legend>حالة النشاط</legend><div class="fzchips">${Object.keys(SF).map((k) => `<button type="button" class="fzchip${ST.status === k ? " on" : ""}" data-f="status" data-v="${k}" aria-pressed="${ST.status === k}">${SF[k]}</button>`).join("")}</div></fieldset>` + chips("ct", cts, (v) => Z.CT[v]) + chips("dom", doms, (v) => Z.domName(v)) + `<button type="button" class="fzt" data-f="clear">مسح الفلاتر</button>`;
}
function drawAct() {
  const a = []; ST.ct.forEach((c) => a.push(["ct", c, Z.CT[c]])); ST.dom.forEach((d) => a.push(["dom", d, Z.domName(d)])); if (ST.status) a.push(["status", ST.status, SF[ST.status]]);
  $("#zract").innerHTML = a.map(([k, v, n]) => `<button type="button" class="fzx" data-rm="${k}" data-v="${esc(v)}" aria-label="إلغاء الفلتر: ${esc(n)}">${esc(n)}</button>`).join("") + (a.length ? `<button type="button" class="fzt" data-f="clear">مسح الفلاتر</button>` : "");
}
function render() {
  const all = rows(), hidden = R.me().hide;
  $("#zrcount").textContent = READY ? (all.length ? "عدد العناصر في السجل: " + AD(all.length) : "") : "";
  $("#zrhide").textContent = hidden ? "إظهار القسم في الصفحات" : "إخفاء قسم «تابع من حيث توقفت»"; $("#zrhide").setAttribute("aria-pressed", String(hidden)); $("#zrclr").hidden = !all.length;
  const cf = $("#zrconf"); cf.hidden = !ST.confirm; if (ST.confirm) cf.innerHTML = `<h3>مسح السجل بالكامل؟</h3><p>سيُمسح سجل ${AD(all.length)} عنصرًا لهذا الطفل. لا يتأثر ملف الإنجاز ولا المحفوظات ولا الخطة، ولا يمكن التراجع.</p><div class="r"><button type="button" class="fzt p" data-zr="clrok">نعم، امسح السجل</button><button type="button" class="fzt" data-zr="clrno">إلغاء</button></div>`;
  drawKids(); drawFilters(all); drawAct();
  const list = filtered(all), warn = READY && X.failed.length ? `<div class="fzwarn" role="alert">تعذّر تحميل بعض الأقسام، فقد لا تظهر بعض العناصر كاملة. أعد المحاولة لاحقًا.</div>` : "";
  let h;
  if (!READY) h = `<div class="zr-sk"></div>`;
  else if (!all.length) h = `<div class="fzempty"><img src="${ROOT}images/zad/i_star.webp" alt=""><h3>ابدأ باستكشاف المكتبة التعليمية، وستجد هنا المحتوى الذي استخدمته مؤخرًا</h3><p><a class="fzt p" href="${ROOT}library/">استكشف المكتبة</a> <a class="fzt" href="${ROOT}find/">ابحث في المكتبة</a></p></div>`;
  else if (!list.length) h = `<div class="fzempty"><h3>لا توجد عناصر تطابق الفلاتر</h3><button type="button" class="fzt p" data-f="clear">مسح الفلاتر</button></div>`;
  else h = `<div class="zr-grid">${list.map((r) => R.card(r, Z, r.it ? extra : null)).join("")}</div>`;
  $("#zrres").innerHTML = warn + h;
}
const change = (fn) => { fn(); render(); };

D.addEventListener("click", (e) => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "zrftog") return change(() => { ST.open = !ST.open; });
  if (t.id === "zrhide") { R.setHide(!R.me().hide); render(); return S.toast(R.me().hide ? "أُخفي القسم من الصفحات" : "سيظهر القسم من جديد"); }
  if (t.id === "zrclr") return change(() => { ST.confirm = true; });
  const z = t.dataset.zr;
  if (z === "clrno") return change(() => { ST.confirm = false; });
  if (z === "clrok") { R.clear(); ST.confirm = false; render(); return S.toast("تم مسح السجل"); }
  if (t.dataset.f === "clear") return change(() => { ST.ct.clear(); ST.dom.clear(); ST.status = ""; });
  if (t.dataset.f === "status") return change(() => { ST.status = t.dataset.v; });
  if (t.dataset.f) return change(() => { const s = ST[t.dataset.f]; if (s.has(t.dataset.v)) s.delete(t.dataset.v); else s.add(t.dataset.v); });
  if (t.dataset.rm) return change(() => { if (t.dataset.rm === "status") ST.status = ""; else ST[t.dataset.rm].delete(t.dataset.v); });
  const c = t.closest(".zr-c"); if (!c || !z) return; const k = c.dataset.k;
  if (z === "rm") { R.remove(k); S.toast("أُزيل من السجل"); return; }
  const r = rows().find((x) => x.key === k);
  if (z === "fav" && r && r.it) { const it = r.it, res = S.toggle({ key: it.key, title: it.title, ct: it.ct, dom: it.dom, lv: it.lv, img: Z.imgOf(it), paid: it.paid }); S.toast(res.ok ? (res.on ? "تم الحفظ في «محتواي المحفوظ»" : "أُزيل من المحفوظات") : res.msg); render(); return; }
  if (z === "plan" && r && r.it) { const old = $(".fzplan", c); if (old) { old.remove(); return; } c.insertAdjacentHTML("beforeend", planBox()); const s = $(".fzplan select,.fzplan a", c); if (s) s.focus(); return; }
  if (z === "plancancel") { const b = $(".fzplan", c); if (b) b.remove(); return; }
  if (z === "planok" && r && r.it) { const msg = $("[data-r=msg]", c), er = S.addToPlan(r.it, $("[data-r=day]", c).value, "نشاط عدت إليه من «تابع من حيث توقفت»."); msg.className = "m " + (er ? "bad" : "ok"); msg.innerHTML = er ? esc(er) : `تمت الإضافة إلى خطتك (فتح المحتوى ليس إنجازًا). <a href="${ROOT}plan/">فتح خطتي</a>`; }
});
D.addEventListener("change", (e) => { if (e.target.id !== "zrk") return; try { const d = JSON.parse(localStorage.getItem(LK)); d.cur = e.target.value; localStorage.setItem(LK, JSON.stringify(d)); } catch (x) { /* */ } location.reload(); });
window.addEventListener("zad-recent", () => { if (READY) render(); }); window.addEventListener("zad-saved", () => { if (READY) render(); });

render();
Promise.all([Z.load().catch(() => null), S.ready(), R.loadCfg()]).then(() => { READY = true; render(); });
})();
