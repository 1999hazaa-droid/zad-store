/* مركز السلاسل المتدرجة (إدارة): كتابة تعليمات الطفل والتلميح والإجابة/طريقة التحقق لكل نشاط في السلسلة، ومعاينة ما يراه الطفل.
   ترتيب الأنشطة والمراحل وإضافة/حذف نشاط والنشر تتم في «مركز المسارات التعليمية» (اختصار أسفل) حتى لا تتكرر القواعد. حفظ الملاحظات يتطلب محررًا أو مراجعًا؛ تعديل سلسلة منشورة بيد محرر يعيدها مسودة. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const STG = { recognize: "التعرف", understand: "الفهم", practice: "التدريب", apply: "التطبيق", review: "المراجعة" };
const RANK = { recognize: 1, understand: 2, practice: 3, apply: 4, review: 5 };
const STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.sa *{box-sizing:border-box}.sa-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.sa-row b{display:block;margin-bottom:6px}.sa label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.sa textarea{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:60px;background:#fff}.sa .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.sa .pick{display:flex;flex-direction:column;gap:6px}.sa .msg{font-weight:700;font-size:13px}.sa .msg.bad{color:#b3261e}.sa .msg.ok{color:#17683a}.sa .cnt{font-size:11px;color:#6b6b7b}`;
const S = { me: { roles: [] }, paths: [], pit: [], it: new Map(), notes: {}, open: null };
let M = null;
const canEdit = () => S.me.roles.some((r) => ["content_editor", "edu_reviewer", "library_manager"].includes(r));
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
const itemsOf = (id) => S.pit.filter((x) => x.path_id === id).sort((a, b) => (RANK[a.stage] - RANK[b.stage]) || a.ord - b.ord);
async function load() {
  const [p, pi] = await Promise.all([sb.from("paths").select("id,slug,name,status,levels").order("sort", { ascending: true }), sb.from("path_items").select("id,path_id,item_key,stage,ord,required")]);
  S.paths = p.data || []; S.pit = pi.data || [];
  let all = [], from = 0; for (;;) { const r = await sb.from("quality_items").select("key,title").eq("gone", false).range(from, from + 999); const a = r.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
async function loadNotes(id) { const r = await sb.rpc("series_notes_admin", { p_path: id }); S.notes = r.error ? {} : r.data || {}; if (r.error) fail(r.error); }
SUB.seriesadm = { title: "مركز السلاسل المتدرجة", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.open = null; paint();
} };
function paint() {
  const shell = (inner) => `<style>${CSS}</style><div class="sa"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">لكل نشاط في السلسلة: ماذا يفعل الطفل، وتلميح، والإجابة أو طريقة التحقق. اكتب بلغة داعمة؛ لا تصف الطفل بالضعف أو العجز. ما لا تكتبه لا يُعرض للطفل.</p>${inner}<p><button class="chip" id="saPaths">فتح «مركز المسارات» لترتيب الأنشطة أو النشر</button></p></div>`;
  let inner;
  if (!S.open) inner = `<div class="pick"><b>اختر سلسلة</b>${S.paths.map((p) => `<div class="sa-row"><b>${esc(p.name)}</b><span class="bd">${esc(STS[p.status] || p.status)}</span> <span class="bd">${AD(itemsOf(p.id).length)} أنشطة</span> <button class="chip" data-o="${esc(p.id)}">تحرير التعليمات</button></div>`).join("") || '<p class="mut">لا توجد سلاسل.</p>'}</div>`;
  else {
    const p = S.paths.find((x) => x.id === S.open), its = itemsOf(S.open);
    const pv = its.map((x, k) => { const n = S.notes[x.id] || {}; return `<div class="mut">${AD(k + 1)}. ${esc(STG[x.stage])} — ${esc(itT(x.item_key))}${n.i ? " · فيه تعليمات" : ""}${n.h ? " · فيه تلميح" : ""}${n.v ? " · فيه إجابة" : ""}</div>`; }).join("");
    inner = `<button class="chip" id="saBack">← كل السلاسل</button><h3>${esc(p.name)} <span class="bd">${esc(STS[p.status])}</span></h3><div class="sa-row"><b>معاينة ما سيراه الطفل</b>${pv}${p.status === "active" ? "" : '<p class="mut">السلسلة غير ظاهرة للزوار حتى تُنشر من مركز المسارات.</p>'}</div>${its.map((x, k) => { const n = S.notes[x.id] || {}; return `<div class="sa-row" data-x="${esc(x.id)}"><b>${AD(k + 1)}. ${esc(itT(x.item_key))} <span class="bd">${esc(STG[x.stage])}</span></b><label>تعليمات للطفل<textarea data-f="i" maxlength="300">${esc(n.i || "")}</textarea></label><label>تلميح عند الحاجة<textarea data-f="h" maxlength="300">${esc(n.h || "")}</textarea></label><label>الإجابة أو طريقة التحقق<textarea data-f="v" maxlength="300">${esc(n.v || "")}</textarea></label>${canEdit() ? '<button class="chip" data-a="save">حفظ</button>' : '<span class="mut">للقراءة فقط</span>'}</div>`; }).join("")}`;
  }
  M.innerHTML = shell(inner);
  const sp = $("#saPaths", M); if (sp) sp.onclick = () => window.__go("pathsadm");
  $$("[data-o]", M).forEach((b) => (b.onclick = async () => { S.open = b.dataset.o; await loadNotes(S.open); paint(); }));
  const bk = $("#saBack", M); if (bk) bk.onclick = () => { S.open = null; paint(); };
  $$(".sa-row[data-x] [data-a=save]", M).forEach((b) => (b.onclick = async () => {
    const r = b.closest(".sa-row"), id = r.dataset.x, v = (f) => $(`[data-f=${f}]`, r).value;
    const x = await sb.rpc("series_note_save", { p_item: id, p_instr: v("i"), p_hint: v("h"), p_verify: v("v") });
    if (x.error) return fail(x.error);
    await Promise.all([load(), loadNotes(S.open)]); paint(); toast("تم الحفظ.");
  }));
}
window.__seriesAdmTest = { S };
})();
