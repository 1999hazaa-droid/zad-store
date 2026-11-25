/* صفحة الحزمة: التفاصيل وقائمة الموارد والتقدّم */
(function () {
"use strict";
const P = window.ZPACKS, Z = window.ZFIND, S = window.ZSAVED; if (!P || !Z) return;
const D = document, esc = P.esc, AD = P.AD, ROOT = P.ROOT, X = Z.X, $ = (s, r) => (r || D).querySelector(s);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const slug = new URLSearchParams(location.search).get("p") || "";
const ST_TXT = { new: "لم تُفتح", opened: "فتحتَها", started: "بدأتَها", done: "أكملتَها" };
const body = $("#pkbody");
let pack = null, items = [], unknown = false, READY = false;
const lvTxt = (lv) => (lv.length === 1 ? Z.LVN[lv[0]] : Z.LVN[lv[0]] + " إلى " + Z.LVN[lv[lv.length - 1]]);
function fdate(t) { try { return new Date(t).toLocaleDateString("ar-OM", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } }
const idxOf = (it) => pack.keys.indexOf(it.key) + 1;
const url = (it) => P.itemUrl(it, pack.slug, idxOf(it));

function planBox(why) {
  const lv = S ? S.kidLv() : "", t = S.iso(new Date()), ws = S.weekStart(t);
  if (!lv) return `<div class="fzplan"><p class="m bad">اختر عمر طفلك أو صفه أولًا ليُضاف النشاط إلى خطته.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  const opts = DAYS.map((n, i) => { const d = S.addDays(ws, i), dd = S.parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  return `<div class="fzplan"><label>اليوم من هذا الأسبوع <select data-r="day">${opts}</select></label><div class="r"><button type="button" data-a="planok">إضافة</button><button type="button" data-a="plancancel">إلغاء</button></div><p class="m" data-r="msg" role="status"></p></div>`;
}
function rowHtml(it, i, pr) {
  const s = pr.st[i], paid = it.paid, plan = P.PLAN_SRC.has(it.src);
  const go = `<a href="${esc(url(it))}" aria-label="${paid ? "معاينة" : s === "new" ? "فتح" : "إعادة فتح"}: ${esc(it.title)}">${paid ? "معاينة المورد" : s === "new" ? "فتح المورد" : "إعادة فتح"}</a>`;
  return `<li class="pk-r ${s}" data-k="${esc(it.key)}"><span class="no" aria-hidden="true">${AD(i + 1)}</span><img src="${esc(Z.imgOf(it))}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_puzzle.webp'">
<div><h3>${esc(it.title)}</h3><div class="pk-mt"><span>${esc(Z.CT[it.ct] || "")}</span>${it.dom ? `<span>${esc(Z.domName(it.dom))}</span>` : ""}<span class="${paid ? "pd" : "fr"}">${paid ? "مدفوع" : "مجاني"}</span></div><p class="st ${s}">${ST_TXT[s]}${P.TRACK.has(it.src) ? "" : " · لا يتوفر تتبع للإكمال لهذا النوع"}</p>${paid ? `<p class="pk-note" style="margin:3px 0 0">المعاينة متاحة هنا، والملف الكامل بعد الطلب.</p>` : ""}</div>
<div class="ra">${go}${plan ? `<button type="button" data-a="plan" data-k="${esc(it.key)}" aria-label="إضافة إلى خطتي: ${esc(it.title)}">إضافة إلى خطتي</button>` : ""}</div></li>`;
}
function render() {
  const p = pack, pr = P.progress(p.slug, items), acc = P.access(items), fav = P.isFav(p.slug), img = ROOT + String(p.cover || "images/zad/i_book.webp").replace(/^\/+/, "");
  const nxt = pr.next >= 0 ? items[pr.next] : null;
  const main = nxt ? `<a class="pk-go" href="${esc(url(nxt))}">متابعة: ${esc(nxt.title)}</a><a class="pk-go" style="background:#fff;color:var(--z-pri,#5b2bb8);border:2px solid var(--z-pri,#5b2bb8)" href="${esc(url(items[0]))}">البدء من أول الحزمة</a>` : `<a class="pk-go" href="${esc(url(items[0]))}">${pr.opened ? "فتح أول مورد من جديد" : "ابدأ الحزمة"}</a>`;
  const trk = pr.trackable ? `<p>أكملتَ ${AD(pr.done)} من ${AD(pr.trackable)} موارد يمكن تتبّع إكمالها</p><div class="pk-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pr.pct}" aria-label="نسبة التقدم الفعلية"><i style="width:${pr.pct}%"></i></div><p>نسبة التقدم الفعلية: ${AD(pr.pct)}٪</p>` : `<p>لا يتوفر في موارد هذه الحزمة تتبّع لإكمال النشاط، لذلك لا تُعرض نسبة تقدّم.</p>`;
  const progress = `<section class="pk-prog" aria-label="تقدم الطفل في الحزمة"><h3>تقدّمك في الحزمة</h3><p>فتحتَ ${AD(pr.opened)} من ${AD(pr.total)} موارد · لم تُفتح بعد: ${AD(pr.left)}</p>${trk}${pr.last ? `<p>آخر استخدام: ${esc(fdate(pr.last))}</p>` : ""}<small>فتح المورد أو تنزيل الملف لا يُعدّ إكمالًا ولا يُصدر شهادة. الإنجاز يُسجَّل عند إكمال النشاط فعليًا. التقدّم محفوظ لهذا الطفل على هذا الجهاز.</small>${pr.opened ? `<p style="margin-top:8px"><button type="button" class="fzt" data-a="reset">مسح سجل فتحي لموارد هذه الحزمة</button></p>` : ""}</section>`;
  const warn = unknown ? `<div class="pk-warn" role="alert">تعذّر التحقق من بعض موارد الحزمة الآن، فقد تظهر الحزمة ناقصة. أعد المحاولة لاحقًا.</div>` : "";
  body.innerHTML = `${warn}<div class="pk-hero"><span class="pk-th"><img src="${esc(img)}" alt="" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_book.webp'"></span><div><h2>${esc(p.title)}</h2><div class="pk-mt"><span>${esc(lvTxt(p.levels))}</span><span>${esc(Z.domName(p.dom))}</span><span>${AD(items.length)} موارد</span><span class="${acc.k === "free" ? "fr" : "pd"}">${esc(acc.k === "mixed" ? "تتضمن " + AD(acc.paid) + " مدفوعة من " + AD(items.length) : acc.t)}</span></div><p class="pk-s" style="margin-top:8px">${esc(p.summary)}</p>${p.skills && p.skills.length ? `<h3 style="margin:10px 0 4px;font-size:14px">المهارات التي تنمّيها الحزمة</h3><ul class="pk-skills">${p.skills.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>` : ""}${p.est_min ? `<p class="pk-note">المدة التقديرية: نحو ${AD(p.est_min)} دقيقة</p>` : ""}</div></div>
<div class="pk-main">${main}<button type="button" data-a="fav" aria-pressed="${fav}">${fav ? "تم الحفظ في المفضلة" : "إضافة إلى المفضلة"}</button><button type="button" data-a="plannext"${nxt || items.some((i) => P.PLAN_SRC.has(i.src)) ? "" : " hidden"}>إضافة إلى الخطة الأسبوعية</button></div><div id="pkplan"></div>
${progress}<h2 style="font-size:18px;color:var(--z-pri,#5b2bb8);margin:16px 0 0">موارد الحزمة بالترتيب التعليمي</h2><ol class="pk-list">${items.map((it, i) => rowHtml(it, i, pr)).join("")}</ol>
<p class="pk-note">يمكنك الانتقال من مورد إلى التالي من الشريط الذي يظهر أعلى صفحة كل مورد، دون الرجوع إلى المكتبة.</p>
<p><a class="fzt" href="../">العودة إلى الحزم</a> <a class="fzt" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function fail(msg, sub) { body.innerHTML = `<div class="fzempty"><img src="${ROOT}images/zad/i_star.webp" alt=""><h3>${esc(msg)}</h3><p>${sub || ""}</p><p><a class="fzt p" href="../">كل الحزم التعليمية</a></p></div>`; }
D.addEventListener("click", (e) => {
  const t = e.target.closest("button"); if (!t || !pack || !READY) return; const a = t.dataset.a;
  if (a === "fav") { const r = P.toggleFav(pack, ROOT + String(pack.cover || "").replace(/^\/+/, "")); if (S) S.toast(r.ok ? (r.on ? "تم الحفظ في «محتواي المحفوظ»" : "أُزيلت من المحفوظات") : r.msg); render(); return; }
  if (a === "reset") { P.clearProgress(pack.slug); render(); if (S) S.toast("تم مسح سجل الفتح لهذه الحزمة؛ ما أكملته فعلًا يبقى محفوظًا"); return; }
  if (a === "plancancel") { const b = $(".fzplan", t.closest("li") || D); const x = t.closest(".fzplan"); if (x) x.remove(); return; }
  if (a === "plan" || a === "plannext") {
    const pr = P.progress(pack.slug, items);
    const it = a === "plan" ? items.find((i) => i.key === t.dataset.k) : (pr.next >= 0 && P.PLAN_SRC.has(items[pr.next].src) ? items[pr.next] : items.find((i, n) => P.PLAN_SRC.has(i.src) && pr.st[n] !== "done"));
    if (!it) { if (S) S.toast("لا يوجد مورد مناسب للإضافة إلى الخطة."); return; }
    const host = a === "plan" ? t.closest("li") : $("#pkplan"), old = $(".fzplan", host); if (old) { old.remove(); return; }
    host.insertAdjacentHTML("beforeend", planBox()); const box = $(".fzplan", host); box.dataset.k = it.key; const hdr = a === "plannext" ? `<p class="m" role="status">سيُضاف: ${esc(it.title)}</p>` : ""; if (hdr) box.insertAdjacentHTML("afterbegin", hdr); const f = $("select,a", box); if (f) f.focus(); return;
  }
  if (a === "planok") { const box = t.closest(".fzplan"), it = items.find((i) => i.key === box.dataset.k), msg = $("[data-r=msg]", box); if (!it) return; const er = S.addToPlan(it, $("[data-r=day]", box).value, "نشاط من حزمة «" + pack.title + "»."); msg.className = "m " + (er ? "bad" : "ok"); msg.innerHTML = er ? esc(er) : `تمت الإضافة إلى خطتك (فتح المحتوى ليس إنجازًا). <a href="${ROOT}plan/">فتح خطتي</a>`; }
});
D.addEventListener("click", (e) => { const l = e.target.closest(".pk-r .ra a, .pk-main a.pk-go"); if (!l || !pack) return; const m = String(l.getAttribute("href")).match(/[?&]pi=(\d+)/); if (m && pack.keys[+m[1] - 1]) P.markOpened(pack.slug, pack.keys[+m[1] - 1]); }, true);
window.addEventListener("zad-packs", () => { if (READY) render(); }); window.addEventListener("zad-saved", () => { if (READY) render(); });
window.addEventListener("pageshow", (e) => { if (e.persisted && READY) render(); });

if (!P.lget || !/^[a-z0-9-]{3,60}$/.test(slug)) { fail("لم نجد هذه الحزمة", "الرابط غير صحيح."); }
else Promise.all([Z.load().catch(() => null), P.load().then((x) => x, () => null), S ? S.ready() : null, window.ZRECENT ? window.ZRECENT.loadCfg() : null]).then(([, packs]) => {
  if (!packs) return fail("تعذّر تحميل الحزمة", "تأكد من الإنترنت ثم أعد المحاولة.");
  pack = packs.find((x) => x.slug === slug);
  if (!pack) return fail("هذه الحزمة غير متاحة", "قد تكون غير منشورة أو أُزيلت.");
  if (!X.all || !X.all.length) return fail("تعذّر تحميل موارد الحزمة", "أعد المحاولة بعد قليل.");
  const r = P.resolve(pack, Z); items = r.items; unknown = r.unknown;
  if (items.length < P.MIN_READY) return fail("هذه الحزمة غير جاهزة بعد", "لا تظهر حزمة قبل اكتمال مواردها.");
  $("#pkbc").textContent = pack.title; D.title = pack.title + " | الحزم التعليمية | زاد التعليمية";
  READY = true; render();
});
})();
