/* مركز دعم التعلم والتدريب الإضافي (إدارة): ست مجموعات دعم تجمع مهارات منشورة. القواعد (اسم لا يصف الطفل، مهارة منشورة، إظهار المجموعة للمراجع فقط، لا مجموعة ظاهرة بلا مهارات)
   مفروضة في قاعدة البيانات. إنشاء المهارات وربط الأنشطة والتعليمات والتلميحات ورفع الملفات تتم من مركز المهارات ونماذج كل نوع محتوى، ويُنشر النشاط عبر مركز الجودة. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const PROB = { empty: "مجموعة بلا مهارات", inactive: "مهارة غير منشورة", noitems: "مهارة بلا موارد منشورة" };
const CSS = `.su *{box-sizing:border-box}.su-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.su-tabs .chip.on{background:#6b3fd4;color:#fff}.su-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:8px 10px;margin:6px 0}.su-row b{flex:1;min-width:160px}.su-bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.su-bd.ok{background:#dff6e7;color:#17683a}.su-bd.bad{background:#ffe3e0;color:#9a1d12}.su-bd.warn{background:#fff0d1;color:#8a5200}
.su-form{background:#faf7ff;border:1px solid #e4d9ff;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:8px;margin:10px 0}.su-form label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px}.su-form input,.su-form textarea,.su-form select{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:38px;background:#fff}.su-msg{font-weight:700;font-size:13px}.su-msg.bad{color:#b3261e}.su-acts{display:flex;gap:8px;flex-wrap:wrap}.su-acts .chip.pri{background:#6b3fd4;color:#fff}`;
const S = { tab: "groups", me: { roles: [] }, groups: [], gs: [], skills: [], edit: null, open: null };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
async function load() {
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) return false;
  const [g, gs, sk] = await Promise.all([sb.from("support_groups").select("*").order("sort", { ascending: true }), sb.from("support_group_skills").select("*").order("ord", { ascending: true }), sb.from("skills").select("id,slug,name,status,levels").order("sort", { ascending: true })]);
  S.groups = g.data || []; S.gs = gs.data || []; S.skills = sk.data || []; return true;
}
const sk = (id) => S.skills.find((x) => x.id === id);
const of = (slug) => S.gs.filter((x) => x.group_slug === slug).sort((a, b) => a.ord - b.ord);
SUB.supportadm = { title: "مركز دعم التعلم والتدريب الإضافي", fn: async function (m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  if (!(await load())) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى مركز دعم التعلم.</p>'; return; }
  S.tab = "groups"; S.edit = null; S.open = null; paint();
} };
function shell(inner) { return `<style>${CSS}</style><div class="su"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">كل مجموعة تجمع مهارات منشورة وتعرض أنشطتها المنشورة والمرتبطة بها فعلًا. لا تُستخدم ألفاظ تصف الطفل أو تصنفه. لإضافة مهارة جديدة أو ربط الأنشطة أو كتابة التعليمات والتلميحات أو رفع الملفات استخدم مركز المهارات ونماذج المحتوى، ثم يُنشر النشاط عبر مركز الجودة.</p><div class="su-tabs" id="sutabs">${[["groups", "المجموعات"], ["review", "المراجعة والجودة"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`; }
function bindTabs() { $$("#sutabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; S.edit = null; if (S.tab === "review") review(); else paint(); })); }
function paint() {
  const inner = S.open ? skillsHtml() : S.edit ? formHtml() : listHtml();
  M.innerHTML = shell(inner); bindTabs();
  if (S.open) bindSkills(); else if (S.edit) bindForm(); else bindList();
}
function listHtml() {
  return S.groups.map((g, i) => `<div class="su-row" data-g="${esc(g.slug)}"><b>${esc(g.name)}<br><span class="mut" style="font-size:12px">${esc(g.descr)}</span></b><span class="su-bd">${AD(of(g.slug).length)} مهارة</span><span class="su-bd ${g.status === "active" ? "ok" : "warn"}">${g.status === "active" ? "ظاهرة" : "مخفية"}</span>${canEdit() ? `<button class="chip" data-a="up" ${i === 0 ? "disabled" : ""} aria-label="تقديم">▲</button><button class="chip" data-a="down" ${i === S.groups.length - 1 ? "disabled" : ""} aria-label="تأخير">▼</button><button class="chip" data-a="edit">تعديل النص</button>${g.status === "active" ? '<button class="chip" data-a="hide">إخفاء مؤقت</button>' : canRev() ? '<button class="chip pri" data-a="show">إظهار</button>' : ""}` : ""}<button class="chip pri" data-a="skills">المهارات والمعاينة</button></div>`).join("") || '<p class="mut">لا مجموعات.</p>';
}
function bindList() {
  $$(".su-row[data-g]", M).forEach((r) => $$("[data-a]", r).forEach((b) => (b.onclick = async () => {
    const slug = r.dataset.g, g = S.groups.find((x) => x.slug === slug), a = b.dataset.a;
    if (a === "edit") { S.edit = Object.assign({}, g); paint(); } else if (a === "skills") { S.open = slug; paint(); }
    else if (a === "hide" || a === "show") { const x = await sb.rpc("support_group_status", { p_slug: slug, p_status: a === "show" ? "active" : "hidden" }); if (x.error) return fail(x.error); await load(); paint(); toast(a === "show" ? "أُظهرت المجموعة." : "أُخفيت المجموعة."); }
    else { const ids = S.groups.map((x) => x.slug), i = ids.indexOf(slug), j = a === "up" ? i - 1 : i + 1; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; const x = await sb.rpc("support_group_order", { p_slugs: ids }); if (x.error) return fail(x.error); await load(); paint(); }
  })));
}
function formHtml() { const e = S.edit; return `<div class="su-form"><b>تعديل نص المجموعة</b><label>اسم المجموعة<input type="text" id="sfn" maxlength="80" value="${esc(e.name)}"></label><label>وصف مختصر عن الأنشطة (لا عن الطفل)<textarea id="sfd" rows="2" maxlength="200">${esc(e.descr)}</textarea></label><p class="su-msg" id="sfm" role="status"></p><div class="su-acts"><button class="chip pri" id="sfsave">حفظ</button><button class="chip" id="sfcan">إلغاء</button></div></div>`; }
function bindForm() {
  const e = S.edit; $("#sfcan", M).onclick = () => { S.edit = null; paint(); };
  $("#sfsave", M).onclick = async () => { const r = await sb.rpc("support_group_update", { p_slug: e.slug, p_name: $("#sfn", M).value, p_descr: $("#sfd", M).value }); if (r.error) { const m = $("#sfm", M); m.className = "su-msg bad"; m.textContent = String(r.error.message).replace(/^.*?:\s*/, ""); return; } await load(); S.edit = null; paint(); toast("حُفظ."); };
}
function skillsHtml() {
  const g = S.groups.find((x) => x.slug === S.open), rows = of(g.slug), have = new Set(rows.map((r) => r.skill_id));
  const cand = S.skills.filter((s) => s.status === "active" && !have.has(s.id));
  return `<button class="chip" id="suback">→ كل المجموعات</button><h3 style="margin:8px 0">${esc(g.name)} <span class="su-bd ${g.status === "active" ? "ok" : "warn"}">${g.status === "active" ? "ظاهرة" : "مخفية"}</span></h3>
  ${rows.map((r, i) => { const s = sk(r.skill_id) || { name: "مهارة محذوفة", levels: [] }; return `<div class="su-row" data-s="${esc(r.skill_id)}"><span class="su-bd">${AD(i + 1)}</span><b>${esc(s.name)}</b>${s.status && s.status !== "active" ? '<span class="su-bd bad">غير منشورة</span>' : ""}${canEdit() ? `<button class="chip" data-a="up" ${i === 0 ? "disabled" : ""} aria-label="تقديم">▲</button><button class="chip" data-a="down" ${i === rows.length - 1 ? "disabled" : ""} aria-label="تأخير">▼</button><button class="chip" data-a="rm">إزالة</button>` : ""}</div>`; }).join("") || '<p class="mut">لا مهارات في هذه المجموعة.</p>'}
  ${canEdit() ? `<div class="su-form"><b>إضافة مهارة منشورة</b><label>المهارة<select id="sadd">${cand.map((s) => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("")}</select></label><div class="su-acts"><button class="chip pri" id="saddgo" ${cand.length ? "" : "disabled"}>إضافة</button></div></div>` : ""}
  <p class="mut">المعاينة: <a href="../support/#g=${esc(g.slug)}" target="_blank" rel="noopener">فتح المجموعة في الصفحة العامة</a> (تظهر للزوار فقط إن كانت المجموعة ظاهرة).</p>`;
}
function bindSkills() {
  const slug = S.open; $("#suback", M).onclick = () => { S.open = null; paint(); };
  $$(".su-row[data-s]", M).forEach((r) => {
    const id = r.dataset.s;
    const up = $("[data-a=up]", r), dw = $("[data-a=down]", r), rm = $("[data-a=rm]", r);
    const mv = async (d) => { const ids = of(slug).map((x) => x.skill_id), i = ids.indexOf(id), j = i + d; if (j < 0 || j >= ids.length) return; [ids[i], ids[j]] = [ids[j], ids[i]]; const x = await sb.rpc("support_skills_order", { p_group: slug, p_ids: ids }); if (x.error) return fail(x.error); await load(); paint(); };
    if (up) up.onclick = () => mv(-1); if (dw) dw.onclick = () => mv(1);
    if (rm) rm.onclick = async () => { if (!(await Z.ask("إزالة المهارة من هذه المجموعة؟ المهارة وأنشطتها تبقى كما هي. وإن كانت آخر مهارة تُخفى المجموعة."))) return; const x = await sb.rpc("support_skill_remove", { p_group: slug, p_skill: id }); if (x.error) return fail(x.error); await load(); paint(); };
  });
  const ad = $("#saddgo", M); if (ad) ad.onclick = async () => { const x = await sb.rpc("support_skill_add", { p_group: slug, p_skill: $("#sadd", M).value }); if (x.error) return fail(x.error); await load(); paint(); toast("أُضيفت المهارة."); };
}
async function review() {
  const r = await sb.rpc("support_check"), list = r.error ? null : r.data || [];
  M.innerHTML = shell(`<div class="su-form"><b>ملخص</b><p class="mut">${AD(S.groups.length)} مجموعات (${AD(S.groups.filter((g) => g.status === "active").length)} ظاهرة)، ${AD(S.gs.length)} ربط مهارة. تظهر للزوار فقط المهارات التي لها أنشطة منشورة تناسب العمر المختار.</p></div><div class="mut" style="font-weight:800;margin:10px 0 4px">فحص جودة المركز</div>${r.error ? `<p class="su-msg bad">${esc(r.error.message)}</p>` : list.length ? list.map((p) => `<div class="su-row"><span class="su-bd warn">${esc(PROB[p.t] || p.t)}</span><b>${esc(p.msg)}</b></div>`).join("") : '<p class="su-msg" style="color:#17683a">لا مشكلات: كل مجموعة فيها مهارات منشورة ولكل مهارة أنشطة منشورة.</p>'}`);
  bindTabs();
}
window.__supportAdmTest = { S };
})();
