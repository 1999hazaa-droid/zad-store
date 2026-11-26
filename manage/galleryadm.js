/* مركز معرض المشاريع الآمن (إدارة): إعدادات فقط — المجالات والأنواع المتاحة، رسائل التشجيع، وصلاحية طباعة البطاقة وحفظ الصور على جهاز الطفل.
   مشاريع الأطفال وصورهم تبقى على أجهزتهم ولا تصل إلى الخادم، فلا توجد صفحة عامة ولا بلاغات ولا محتوى للإخفاء هنا، ولا خيار لنشر صور الأطفال للعامة. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const S = { me: { roles: [] }, cfg: null };
let M = null;
const canEdit = () => S.me.roles.some((r) => ["content_editor", "edu_reviewer", "library_manager"].includes(r));
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const CSS = `.ga *{box-sizing:border-box}.ga-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.ga label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.ga .ck{flex-direction:row;align-items:center;gap:6px}.ga select,.ga textarea,.ga input[type=text]{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:40px;background:#fff}.ga textarea{min-height:90px}.ga-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.ga .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}`;
async function load() { const r = await sb.rpc("gallery_cfg_admin"); if (r.error) { fail(r.error); S.cfg = null; } else S.cfg = JSON.parse(JSON.stringify(r.data || {})); }
SUB.galleryadm = { title: "مركز معرض المشاريع الآمن", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); paint();
} };
const list = (k, title, hint) => `<h4>${title}</h4><p class="mut">${hint}</p>${(S.cfg[k] || []).map((x, i) => `<div class="ga-row" data-k="${k}" data-i="${i}"><label class="ck"><input type="checkbox" class="gOn"${x.on ? " checked" : ""}> <b>${esc(x.title)}</b> <span class="bd">${esc(x.slug)}</span></label><label>الاسم<input type="text" class="gT" maxlength="40" value="${esc(x.title)}"></label><button class="chip gRm" type="button">حذف من القائمة</button></div>`).join("")}<div class="ga-row"><label>إضافة عنصر: المعرّف (حروف إنجليزية صغيرة)<input type="text" id="n_${k}_s" maxlength="25" dir="ltr"></label><label>الاسم بالعربية<input type="text" id="n_${k}_t" maxlength="40"></label><button class="chip" type="button" data-add="${k}">+ إضافة</button></div>`;
function paint() {
  if (!S.cfg) { M.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">تعذّر تحميل الإعدادات.</p>'; return; }
  const c = S.cfg;
  M.innerHTML = `<style>${CSS}</style><div class="ga"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
<p class="mut">المعرض خاص بكل طفل على جهازه. من هنا تضبط ما يظهر في نماذج الإضافة فقط. لا تملك الإدارة نشر مشاريع الأطفال أو صورهم للعامة، ولا توجد بلاغات لأن لا شيء يُشارك عامًا.</p>
<div class="ga-row"><b>الخصوصية (ثابتة)</b><ul><li>المعرض عام: <b>معطّل دائمًا</b>.</li><li>الصور: تُحفظ على جهاز الطفل فقط بموافقة ولي الأمر.</li><li>البلاغات والمحتوى المخالف: غير متاحة لأن المشاركة العامة غير موجودة.</li></ul></div>
${list("domains", "المجالات التعليمية المتاحة", "المجال المعطّل لا يظهر في نموذج إضافة مشروع جديد، وتبقى مشاريع الأطفال القديمة كما هي.")}
${list("types", "أنواع المشاريع", "تخص المشاريع التي يضيفها الطفل بنفسه. أنواع مشاريع المنصة (مشروع، أسبوعي، شهري، تحدٍّ) ثابتة.")}
<h4>صلاحيات العرض والمشاركة</h4><div class="ga-row"><label class="ck"><input type="checkbox" id="gPrint"${c.allow_print ? " checked" : ""}> السماح بطباعة بطاقة المشروع بعد موافقة ولي الأمر</label><label class="ck"><input type="checkbox" id="gPhotos"${c.allow_photos ? " checked" : ""}> إتاحة حفظ صورة للعمل على جهاز الطفل (بموافقة ولي الأمر)</label></div>
<h4>رسائل التشجيع (رسالة في كل سطر، حتى 10، من 3 إلى 100 حرف)</h4><label><textarea id="gMsgs">${esc((c.msgs || []).join("\n"))}</textarea></label>
<p class="mut">اكتب رسائل مشجعة بلا ترتيب ولا مقارنة بين الأطفال.</p>
<div class="ga-acts">${canEdit() ? '<button class="chip" id="gSave">حفظ الإعدادات</button>' : ""}<a class="chip" href="../gallery/" target="_blank" rel="noopener">فتح صفحة المعرض</a></div></div>`;
  const grab = () => { ["domains", "types"].forEach((k) => $$(`[data-k="${k}"]`, M).forEach((r) => { const x = c[k][+r.dataset.i]; x.on = $(".gOn", r).checked; x.title = $(".gT", r).value.trim(); })); c.allow_print = $("#gPrint", M).checked; c.allow_photos = $("#gPhotos", M).checked; c.msgs = $("#gMsgs", M).value.split("\n").map((x) => x.trim()).filter(Boolean); };
  $$(".gRm", M).forEach((b) => (b.onclick = () => { grab(); const r = b.closest("[data-k]"); c[r.dataset.k].splice(+r.dataset.i, 1); paint(); }));
  $$("[data-add]", M).forEach((b) => (b.onclick = () => { grab(); const k = b.dataset.add, s = $("#n_" + k + "_s", M).value.trim(), t = $("#n_" + k + "_t", M).value.trim(); if (!s || !t) return fail({ message: "اكتب المعرّف والاسم." }); c[k].push({ slug: s, title: t, on: true }); paint(); }));
  const sv = $("#gSave", M); if (sv) sv.onclick = async () => { grab(); const x = await sb.rpc("gallery_cfg_save", { p: { domains: c.domains, types: c.types, msgs: c.msgs, allow_print: c.allow_print, allow_photos: c.allow_photos } }); if (x.error) return fail(x.error); await load(); paint(); toast("تم الحفظ."); };
}
window.__galleryAdmTest = { S };
})();
