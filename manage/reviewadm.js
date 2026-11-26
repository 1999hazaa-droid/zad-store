/* مركز مراجعة المهارات (إدارة): لكل مهارة منشورة جلسة مراجعة: شرح مختصر لما سبق تعلمه، مثال تمهيدي، ملخص، والمهارات السابقة المرتبطة (يحدّدها المحرر ولا تُخمَّن).
   أنشطة المراجعة هي أنشطة المهارة المنشورة والمرتبطة بها في «مركز المهارات» (اختصار أسفل). الحفظ للمحرر والمراجع؛ النشر والإخفاء والحذف للمراجع فقط؛ تعديل مراجعة منشورة بيد محرر يعيدها مسودة. لا نشر قبل ثلاثة أنشطة منشورة وشرح مكتوب. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const STS = { draft: "مسودة", active: "منشورة", hidden: "مخفية" };
const CSS = `.ra *{box-sizing:border-box}.ra-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.ra-row b{display:block;margin-bottom:4px}.ra label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.ra textarea{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:64px;background:#fff}.ra .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.ra .bd.bad{background:#ffe3e0;color:#9a1d12}.ra .bd.ok{background:#dff6e7;color:#17683a}.ra .bd.warn{background:#fff0d1;color:#8a5200}.ra .ck{flex-direction:row;align-items:center;gap:6px}.ra .dom{margin:12px 0 4px;font-weight:800;color:#4b2aa5}.ra-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}`;
const S = { me: { roles: [] }, dom: [], sk: [], rows: new Map(), ready: {}, open: null };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const nm = (id) => (S.sk.find((s) => s.id === id) || { name: "" }).name;
async function load() {
  const [d, s, a] = await Promise.all([sb.from("skill_domains").select("slug,name,sort").order("sort", { ascending: true }), sb.from("skills").select("id,slug,domain,name,status,sort,updated_at").eq("status", "active").order("sort", { ascending: true }), sb.rpc("review_admin")]);
  S.dom = d.data || []; S.sk = s.data || [];
  if (a.error) { fail(a.error); S.rows = new Map(); S.ready = {}; return; }
  S.rows = new Map(((a.data || {}).rows || []).map((r) => [r.skill, r])); S.ready = (a.data || {}).ready || {};
}
SUB.reviewadm = { title: "مركز مراجعة المهارات", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.open = null; paint();
} };
function paint() {
  const head = `<style>${CSS}</style><div class="ra"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">لكل مهارة: شرح لما سبق تعلمه، ومثال، وملخص، ومهارات سابقة تحدّدها أنت (لا تخمين). ما لا تكتبه لا يُعرض. اكتب بلغة داعمة بلا وصف للطفل بالضعف.</p>`;
  const foot = `<div class="ra-acts"><button class="chip" data-go="skillsadm">ربط الأنشطة بالمهارات</button><button class="chip" data-go="pathsadm">المسارات</button><button class="chip" data-go="seriesadm">السلاسل المتدرجة</button></div></div>`;
  let inner;
  if (!S.open) {
    inner = S.dom.map((d) => { const a = S.sk.filter((s) => s.domain === d.slug); if (!a.length) return ""; return `<div class="dom">${esc(d.name)}</div>` + a.map((s) => { const r = S.rows.get(s.id), rd = S.ready[s.id] || 0, stale = r && r.sup > r.upd; return `<div class="ra-row"><b>${esc(s.name)}</b>${r ? `<span class="bd ${r.status === "active" ? "ok" : ""}">${esc(STS[r.status])}</span> <span class="bd">${AD((r.pre || []).length)} مهارات سابقة</span>` : '<span class="bd">لا توجد مراجعة</span>'} <span class="bd ${rd >= 3 ? "ok" : "warn"}">${AD(rd)} أنشطة منشورة</span>${stale ? ' <span class="bd bad">عُدّلت المهارة بعد آخر تحديث للمراجعة</span>' : ""} <button class="chip" data-o="${esc(s.id)}">${r ? "تحرير المراجعة" : "إنشاء مراجعة"}</button></div>`; }).join(""); }).join("") || '<p class="mut">لا توجد مهارات منشورة.</p>';
  } else {
    const s = S.sk.find((x) => x.id === S.open), r = S.rows.get(S.open) || { intro: "", example: "", summary: "", status: "draft", pre: [] }, rd = S.ready[S.open] || 0;
    const cand = S.sk.filter((x) => x.id !== S.open).sort((a, b) => (a.domain === s.domain ? 0 : 1) - (b.domain === s.domain ? 0 : 1));
    inner = `<button class="chip" id="raBack">← كل المهارات</button><h3>${esc(s.name)} <span class="bd">${esc(STS[r.status] || "")}</span></h3><p class="mut">الأنشطة المنشورة المرتبطة بالمهارة: ${AD(rd)} ${rd >= 3 ? "" : "(يلزم ثلاثة على الأقل للنشر)"}</p>
    <label>ما سبق أن تعلمه الطفل (شرح مختصر، مطلوب للنشر)<textarea id="raIntro" maxlength="400">${esc(r.intro || "")}</textarea></label>
    <label>مثال أو نشاط تمهيدي (اختياري)<textarea id="raEx" maxlength="300">${esc(r.example || "")}</textarea></label>
    <label>ملخص نهاية الجلسة (اختياري)<textarea id="raSum" maxlength="300">${esc(r.summary || "")}</textarea></label>
    <div class="ra-row"><b>المهارات السابقة المرتبطة (حتى أربع)</b>${cand.map((x) => `<label class="ck"><input type="checkbox" data-p="${esc(x.id)}"${(r.pre || []).includes(x.id) ? " checked" : ""}> ${esc(x.name)}</label>`).join("")}</div>
    ${canEdit() ? '<button class="chip" id="raSave">حفظ</button>' : '<span class="mut">للقراءة فقط</span>'}
    ${S.rows.has(S.open) && canRev() ? `<div class="ra-acts">${r.status !== "active" ? '<button class="chip" id="raPub">نشر المراجعة</button>' : '<button class="chip" id="raHide">إخفاء المراجعة</button>'}<button class="chip" id="raDel">حذف المراجعة</button></div>` : ""}
    ${S.rows.has(S.open) ? `<div class="ra-row"><b>معاينة</b><div class="mut">${esc(r.intro || "")}</div>${(r.pre || []).length ? `<div class="mut">سابقة: ${(r.pre || []).map((p) => esc(nm(p))).join("، ")}</div>` : ""}<p class="mut">${r.status === "active" ? "المراجعة ظاهرة للزوار." : "المراجعة غير ظاهرة للزوار حتى تُنشر."}</p></div>` : ""}`;
  }
  M.innerHTML = head + inner + foot;
  $$("[data-go]", M).forEach((b) => (b.onclick = () => window.__go(b.dataset.go)));
  $$("[data-o]", M).forEach((b) => (b.onclick = () => { S.open = b.dataset.o; paint(); }));
  const bk = $("#raBack", M); if (bk) bk.onclick = () => { S.open = null; paint(); };
  const rf = async (fn, args, ok) => { const x = await sb.rpc(fn, args); if (x.error) return fail(x.error); await load(); paint(); if (ok) toast(ok); };
  const sv = $("#raSave", M); if (sv) sv.onclick = () => rf("review_save", { p_skill: S.open, p_intro: $("#raIntro", M).value, p_example: $("#raEx", M).value, p_summary: $("#raSum", M).value, p_prereqs: $$("[data-p]:checked", M).map((c) => c.dataset.p) }, "تم الحفظ.");
  const pb = $("#raPub", M); if (pb) pb.onclick = () => rf("review_status", { p_skill: S.open, p_status: "active" }, "نُشرت المراجعة.");
  const hd = $("#raHide", M); if (hd) hd.onclick = () => rf("review_status", { p_skill: S.open, p_status: "hidden" }, "أُخفيت المراجعة.");
  const dl = $("#raDel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف مراجعة هذه المهارة نهائيًا (النص والمهارات السابقة)؟ لا يمكن التراجع."))) return; const x = await sb.rpc("review_delete", { p_skill: S.open }); if (x.error) return fail(x.error); S.open = null; await load(); paint(); toast("حُذفت المراجعة."); };
}
window.__reviewAdmTest = { S };
})();
