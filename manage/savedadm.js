/* إدارة «محتواي المحفوظ»: أنواع المحتوى القابلة للحفظ، إيقاف حفظ محتوى معين، المحتوى غير المتاح، أخطاء روابط المحفوظات.
   قوائم الأطفال خاصة: تُحفظ على جهاز الطفل وفي حسابه فقط، ولا تعرضها هذه اللوحة. تُحفظ هنا إعدادات الإدارة فقط (جدول saved_off). */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const CT = { story: "قصص تعليمية", ws: "أوراق عمل", cards: "بطاقات تعليمية", home: "أنشطة منزلية", video: "دروس مرئية", game: "ألعاب تعليمية", quiz: "اختبارات", project: "مشروعات", res: "موارد تعليمية" };
let TAB = "types", FILTER = "", OFF = [], ERRS = [];
const F = () => window.ZFIND;
const fail = (e) => { console.error(e); toast("تعذّر الحفظ. تأكد من الإنترنت وحاول مرة ثانية"); };
/** يتحقق من ref قبل الكتابة: نوع معروف أو مفتاح src:slug بسيط */
function chkRef(kind, ref) { if (kind === "type") return CT[ref] ? "" : "نوع غير معروف"; return /^[a-z]{2,8}:[^\s<>@]{1,100}$/i.test(String(ref || "")) ? "" : "مفتاح محتوى غير صالح"; }
async function loadAll() {
  await F().load().catch(() => {});
  const o = await sb.from("saved_off").select("kind,ref,note,created_at").limit(2000); OFF = o.error ? [] : o.data || [];
  const e = await sb.from("pf_errors").select("id,msg,created_at").eq("kind", "saved-link").order("created_at", { ascending: false }).limit(500); ERRS = e.error ? [] : e.data || [];
}
const isOff = (kind, ref) => OFF.some((x) => x.kind === kind && x.ref === ref);
async function setOff(kind, ref, off, note) {
  const bad = chkRef(kind, ref); if (bad) { toast(bad); return false; }
  try {
    const q = off ? await sb.from("saved_off").upsert({ kind, ref, note: note ? String(note).slice(0, 200) : null }, { onConflict: "kind,ref" }) : await sb.from("saved_off").delete().eq("kind", kind).eq("ref", ref);
    if (q.error) throw q.error; return true;
  } catch (e) { fail(e); return false; }
}
SUB.savedadm = { title: "إدارة محتواي المحفوظ", fn: async function view(m) {
  if (!F()) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">تعذّر تحميل بيانات المحتوى.</p>'; return; }
  m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  await loadAll();
  const X = F().X;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">يحفظ الزوار المحتوى المنشور في قوائم خاصة بكل طفل. هنا تحدد ما يمكن حفظه. <b>لا يمكن للمسؤول الاطلاع على قوائم الأطفال</b>؛ هي خاصة بهم وبأولياء أمورهم.</p>
  <div class="chips" id="sdt">${[["types", "أنواع المحتوى"], ["items", "إيقاف محتوى معين"], ["gone", "غير متاح وأخطاء الروابط"]].map(([k, l]) => `<button class="chip ${TAB === k ? "on" : ""}" data-t="${k}">${l}${k === "gone" && ERRS.length ? " (" + new Set(ERRS.map((x) => x.msg)).size + ")" : ""}</button>`).join("")}</div><div id="sdb"></div>`;
  $$("#sdt [data-t]", m).forEach((b) => (b.onclick = () => { TAB = b.dataset.t; view(m); }));
  const B = $("#sdb", m), reload = () => view(m);
  if (TAB === "types") types(B, X, reload); else if (TAB === "items") items(B, X, reload); else gone(B, X, reload);
} };
function types(B, X, reload) {
  const n = (c) => (X.items || []).filter((i) => i.ct === c).length;
  B.innerHTML = `<div class="card"><b>أنواع المحتوى القابلة للحفظ</b><p class="mut">إيقاف نوع يمنع حفظ عناصر جديدة منه. ما حُفظ قبل ذلك يبقى في قوائم أصحابه ويمكنهم إزالته.</p></div>` + Object.keys(CT).map((c) => `<div class="item"><div class="tx"><b>${esc(CT[c])}</b><small>${n(c)} عنصرًا منشورًا · ${isOff("type", c) ? '<span style="color:var(--no)">الحفظ متوقف</span>' : "الحفظ متاح"}</small></div><button class="chip" data-c="${c}">${isOff("type", c) ? "تفعيل الحفظ" : "إيقاف الحفظ"}</button></div>`).join("");
  $$("[data-c]", B).forEach((b) => (b.onclick = async () => { const c = b.dataset.c, off = !isOff("type", c); if (off && !confirm("إيقاف حفظ «" + CT[c] + "»؟ لن يستطيع الزوار حفظ عناصر جديدة منه.")) return; if (await setOff("type", c, off)) { toast(off ? "أُوقف الحفظ" : "فُعّل الحفظ"); reload(); } }));
}
function items(B, X, reload) {
  const all = (X.all || []).filter((i) => !i.hidden && i.lv.length), offI = OFF.filter((x) => x.kind === "item").map((x) => x.ref);
  const n = (s) => F().norm(s), q = n(FILTER), list = all.filter((i) => !q || n(i.title + " " + i.skill).includes(q)).sort((a, b) => (isOff("item", b.key) ? 1 : 0) - (isOff("item", a.key) ? 1 : 0)).slice(0, 60);
  B.innerHTML = `<div class="card"><b>${offI.length}</b> عنصرًا موقوف حفظه</div><label class="f"><span>ابحث عن محتوى</span><input type="search" id="sdi" value="${esc(FILTER)}" placeholder="عنوان أو مهارة"></label>` +
    (list.map((i) => `<div class="item"><div class="tx"><b>${esc(i.title)}</b><small>${esc(CT[i.ct] || "")} · ${isOff("item", i.key) ? '<span style="color:var(--no)">الحفظ متوقف</span>' : "الحفظ متاح"}</small></div><button class="chip" data-k="${esc(i.key)}">${isOff("item", i.key) ? "تفعيل الحفظ" : "إيقاف الحفظ"}</button></div>`).join("") || '<p class="mut">لا نتائج.</p>') + (all.length > 60 && !FILTER ? '<p class="mut">يظهر أول ٦٠ عنصرًا؛ استخدم البحث للباقي.</p>' : "");
  let t; $("#sdi", B).oninput = (e) => { clearTimeout(t); t = setTimeout(() => { FILTER = e.target.value; items(B, X, reload); const x = $("#sdi", B); x.focus(); x.setSelectionRange(x.value.length, x.value.length); }, 250); };
  $$("[data-k]", B).forEach((b) => (b.onclick = async () => { const k = b.dataset.k, off = !isOff("item", k); if (await setOff("item", k, off)) { toast(off ? "أُوقف حفظ هذا المحتوى" : "فُعّل الحفظ"); OFF = off ? OFF.concat([{ kind: "item", ref: k }]) : OFF.filter((x) => !(x.kind === "item" && x.ref === k)); items(B, X, reload); } }));
}
function gone(B, X, reload) {
  const hid = (X.all || []).filter((i) => i.hidden || !i.lv.length), by = {}; ERRS.forEach((e) => { by[e.msg] = by[e.msg] || { n: 0, ids: [], last: e.created_at }; by[e.msg].n++; by[e.msg].ids.push(e.id); });
  const keys = Object.keys(by).sort((a, b) => by[b].n - by[a].n), live = new Set((X.items || []).map((i) => i.key));
  B.innerHTML = `<div class="card"><b>محتوى لا يظهر للزوار الآن (${hid.length})</b><p class="mut">يظهر في قوائم من حفظه سابقًا بحالة «لم يعد متاحًا» ويمكنهم إزالته. أعد نشره من إدارة المكتبة أو إدارة البحث ليعود متاحًا.</p>${hid.slice(0, 30).map((i) => `<div class="item"><div class="tx"><b>${esc(i.title)}</b><small>${i.hidden ? "مخفي من البحث" : "بلا مستوى صالح"}</small></div></div>`).join("") || '<p class="mut">لا يوجد.</p>'}</div>
  <div class="card"><b>أخطاء روابط المحفوظات (${keys.length})</b><p class="mut">تُسجَّل تلقائيًا مفاتيح المحتوى الذي وُجد محفوظًا لكنه لم يعد متاحًا، دون أي معلومة عن الطفل أو الحساب.</p>${keys.map((k) => `<div class="item"><div class="tx"><b>${esc(k)}</b><small>${by[k].n} مرة · ${live.has(k) ? '<span style="color:var(--ok)">المحتوى متاح الآن</span>' : "ما زال غير متاح"}</small></div><button class="chip" data-d="${esc(k)}">تم، احذف السجل</button></div>`).join("") || '<p class="mut">لا أخطاء مسجلة.</p>'}</div>`;
  $$("[data-d]", B).forEach((b) => (b.onclick = async () => { const k = b.dataset.d; if (!confirm("حذف سجلات هذا الخطأ؟")) return; try { const q = await sb.from("pf_errors").delete().in("id", by[k].ids); if (q.error) throw q.error; toast("حُذف السجل"); reload(); } catch (e) { fail(e); } }));
}
window.__savedTest = { chkRef };
})();
