/* مركز المهارات المكتسبة من المشاريع (إدارة): صفحة المهارة (الهدف والأمثلة ومعيار الممارسة) وربط كل مشروع بمهاراته (أساسية/مساندة)
   بيد مدير المحتوى. القواعد (النطاق سنة–الصف الرابع، لا عبارات إتقان/درجات، حدود العدد، النشر للمراجع) في قاعدة البيانات.
   ربط الأنشطة والموارد بالمهارة يتم من «مركز المهارات التعليمية» (skillsadm) ونعرض هنا عددها فقط. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SCOPE = Object.keys(LV), STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.sp *{box-sizing:border-box}.sp-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.sp label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.sp label.ck{flex-direction:row;align-items:center;gap:6px}.sp input[type=text],.sp select,.sp textarea{border:2px solid #cdb8f5;border-radius:10px;padding:8px;font:inherit;width:100%}.sp textarea{min-height:70px}.sp .bd{display:inline-block;background:#f1eaff;border-radius:99px;padding:1px 10px;font-size:12px;margin-inline-end:4px}.sp .bd.ok{background:#dff6e7;color:#17683a}.sp-acts{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.sp .mut{color:#6a5a8f;font-size:13px}.sp .pv{border:2px dashed #b59be8;border-radius:14px;padding:10px;margin:8px 0;background:#faf7ff}`;
const S = { me: { roles: [] }, d: { domains: [], skills: [], plinks: [], projects: [] }, tab: "skills", dom: "", ed: null, pj: "", le: null, pv: "" };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const skById = (id) => S.d.skills.find((s) => s.id === id), prj = (slug) => S.d.projects.find((p) => p.slug === slug), domN = (s) => (S.d.domains.find((d) => d.slug === s) || {}).name || s;
const inScope = (a) => (a || []).length && a.every((l) => SCOPE.includes(l));
async function load() { const r = await sb.rpc("skp_admin"); if (r.error) { fail(r.error); S.d = { domains: [], skills: [], plinks: [], projects: [] }; } else S.d = r.data || { domains: [], skills: [], plinks: [], projects: [] }; }
SUB.skpadm = { title: "مركز المهارات المكتسبة من المشاريع", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.ed = null; S.le = null; S.pv = ""; paint();
} };
const blank = () => ({ id: null, name: "", domain: S.d.domains[0] ? S.d.domains[0].slug : "", levels: [], descr: "", goal: "", goal_kid: "", examples: "", min_proj: 2, status: "", sstatus: "hidden", has: false });
const fromS = (s) => ({ id: s.id, name: s.name, domain: s.domain, levels: (s.levels || []).slice(), descr: s.descr || "", goal: s.info ? s.info.goal : "", goal_kid: s.info ? s.info.goal_kid : "", examples: s.info ? (s.info.examples || []).join("\n") : "", min_proj: s.info ? s.info.min_proj : 2, status: s.info ? s.info.status : "", sstatus: s.sstatus, has: !!s.info });
const tabs = () => `<div class="sp-acts"><button class="chip" data-tab="skills"${S.tab === "skills" ? ' style="background:#5b2bb8;color:#fff"' : ""}>المهارات</button><button class="chip" data-tab="links"${S.tab === "links" ? ' style="background:#5b2bb8;color:#fff"' : ""}>ربط المشاريع بالمهارات</button></div>`;
function skillsList() {
  const rows = S.d.skills.filter((s) => (!S.dom || s.domain === S.dom) && inScope(s.levels)).map((s) => { const n = S.d.plinks.filter((l) => l.skill === s.id).length;
    return `<div class="sp-row" data-sid="${esc(s.id)}"><b>${esc(s.name)}</b> <span class="bd">${esc(domN(s.domain))}</span><span class="bd ${s.info && s.info.status === "active" ? "ok" : ""}">${s.info ? esc(STS[s.info.status]) : "بلا صفحة"}</span><span class="bd">${AD(n)} مشاريع</span><span class="bd">${AD(s.res)} موارد</span> <button class="chip spEdit">تحرير</button></div>`; }).join("");
  return `${tabs()}${canEdit() ? '<button class="chip" id="spNew">+ مهارة جديدة</button>' : ""}<label>المجال<select id="spDom"><option value="">كل المجالات</option>${S.d.domains.map((d) => `<option value="${esc(d.slug)}"${S.dom === d.slug ? " selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>${rows || '<p class="mut">لا توجد مهارات.</p>'}`;
}
function skillForm() {
  const e = S.ed;
  return `<button class="chip" id="spBack">← كل المهارات</button><h3>${e.id ? "تحرير مهارة" : "مهارة جديدة"}</h3>
<label>اسم المهارة<input type="text" id="fName" maxlength="80" value="${esc(e.name)}"></label>
<label>المجال التعليمي<select id="fDom">${S.d.domains.map((d) => `<option value="${esc(d.slug)}"${e.domain === d.slug ? " selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>
<div class="sp-row"><b>العمر والصف (من سنة إلى الصف الرابع فقط)</b>${SCOPE.map((l) => `<label class="ck"><input type="checkbox" data-l="${l}"${e.levels.includes(l) ? " checked" : ""}> ${LV[l]}</label>`).join("")}</div>
<label>وصف مبسط للمهارة<textarea id="fDescr" maxlength="300">${esc(e.descr)}</textarea></label>
<label>الهدف التعليمي (8 إلى 200 حرف)<input type="text" id="fGoal" maxlength="200" value="${esc(e.goal)}"></label>
<label>الهدف بكلمات الطفل (5 إلى 120 حرفًا)<input type="text" id="fKid" maxlength="120" value="${esc(e.goal_kid)}"></label>
<label>أمثلة على المهارة (مثال في كل سطر، حتى 5)<textarea id="fEx">${esc(e.examples)}</textarea></label>
<label>معيار الممارسة: عدد المشاريع أو الأنشطة المسجّلة قبل أن تنتقل الحالة من «بدأت التدريب» إلى «يواصل التعلم»<select id="fMin">${[1, 2, 3, 4, 5, 6].map((n) => `<option value="${n}"${+e.min_proj === n ? " selected" : ""}>${AD(n)}</option>`).join("")}</select></label>
<p class="mut">المركز يعرض الممارسة لا الإتقان؛ تُرفض عبارات الإتقان والدرجات والمقارنة. الحالة: ${esc(STS[e.status] || "جديدة")}. ${e.status === "active" ? "ظاهرة للزوار." : "غير ظاهرة للزوار حتى يُنشرها مراجع."}</p>
<div class="sp-acts"><button class="chip" id="spPv">معاينة صفحة المهارة</button>${canEdit() ? '<button class="chip" id="spSave">حفظ كمسودة</button>' : ""}${e.id && e.has && canRev() ? `${e.status !== "active" ? '<button class="chip" id="spPub">نشر</button>' : '<button class="chip" id="spHide">إخفاء</button>'}${e.status === "active" ? '<button class="chip" id="spDraft">إعادة إلى مسودة</button>' : ""}` : ""}</div><div id="spPvBox">${S.pv}</div>`;
}
function readSkill() { const e = S.ed; e.name = $("#fName").value.trim(); e.domain = $("#fDom").value; e.descr = $("#fDescr").value.trim(); e.goal = $("#fGoal").value.trim(); e.goal_kid = $("#fKid").value.trim(); e.examples = $("#fEx").value; e.min_proj = +$("#fMin").value; e.levels = $$("input[data-l]:checked", M).map((i) => i.dataset.l); }
const exArr = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
function preview() {
  const e = S.ed, links = S.d.plinks.filter((l) => l.skill === e.id);
  S.pv = `<div class="pv"><b>${esc(e.name || "اسم المهارة")}</b><p class="mut">${esc(domN(e.domain))} · ${e.levels.map((l) => LV[l]).join("، ") || "حدّد العمر أو الصف"}</p><p>${esc(e.descr || e.goal_kid)}</p><p><b>بكلمات الطفل:</b> ${esc(e.goal_kid)}</p><p><b>الهدف التعليمي:</b> ${esc(e.goal)}</p>${exArr(e.examples).length ? `<ul>${exArr(e.examples).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}<p><b>المشاريع المرتبطة (${AD(links.length)}):</b> ${links.map((l) => `${esc((prj(l.project) || { title: l.project }).title)} (${l.role === "main" ? "أساسية" : "مساندة"}${l.status === "active" ? "" : "، غير منشور"})`).join("، ") || "لا يوجد"}</p><p class="mut">عتبة «يواصل التعلم»: ${AD(e.min_proj)} · هذه معاينة، والحالات الفعلية تُحسب من سجل الطفل على جهازه.</p></div>`;
  const b = $("#spPvBox"); if (b) b.innerHTML = S.pv;
}
async function saveSkill(then) {
  readSkill(); const e = S.ed, orig = e.id ? skById(e.id) : null;
  if (!e.levels.length || !inScope(e.levels)) return fail("حدّد العمر أو الصف ضمن النطاق.");
  try {
    let id = e.id;
    const changed = !orig || orig.name !== e.name || orig.domain !== e.domain || (orig.descr || "") !== e.descr || JSON.stringify(orig.levels) !== JSON.stringify(e.levels);
    if (changed) { const r = await sb.rpc("skill_save", { p: { id: e.id, name: e.name, domain: e.domain, levels: e.levels, descr: e.descr, status: orig ? orig.sstatus : "hidden" } }); if (r.error) return fail(r.error); id = (r.data && r.data.id) || id; }
    const r2 = await sb.rpc("skp_info_save", { p: { skill: id, goal: e.goal, goal_kid: e.goal_kid, examples: exArr(e.examples), min_proj: e.min_proj } }); if (r2.error) return fail(r2.error);
    toast("تم الحفظ كمسودة."); await load(); S.ed = fromS(skById(id)); S.ed.id = id; if (then) await then(id); paint();
  } catch (x) { fail(x); }
}
async function setSkillStatus(st) { const e = S.ed; const r = await sb.rpc("skp_info_status", { p_skill: e.id, p_status: st }); if (r.error) return fail(r.error); toast(st === "active" ? "تم النشر." : st === "hidden" ? "تم الإخفاء." : "أُعيدت إلى مسودة."); await load(); S.ed = fromS(skById(e.id)); paint(); }
/* ربط المشاريع */
function linksView() {
  const p = prj(S.pj), ls = S.d.plinks.filter((l) => l.project === S.pj);
  const opts = S.d.projects.map((x) => `<option value="${esc(x.slug)}"${x.slug === S.pj ? " selected" : ""}>${esc(x.title)}${x.status === "published" ? "" : " (غير منشور)"}</option>`).join("");
  const row = (l) => `<div class="sp-row" data-lid="${esc(l.id)}"><b>${esc((skById(l.skill) || { name: "؟" }).name)}</b> <span class="bd">${l.role === "main" ? "أساسية" : "مساندة"}</span><span class="bd ${l.status === "active" ? "ok" : ""}">${esc(STS[l.status])}</span><p>${esc(l.goal)}</p><div class="sp-acts">${canEdit() ? '<button class="chip lEdit">تحرير</button>' : ""}${canRev() ? `${l.status !== "active" ? '<button class="chip lPub">نشر</button>' : '<button class="chip lHide">إخفاء</button>'}<button class="chip lDel">حذف</button>` : ""}</div></div>`;
  const f = S.le;
  const cand = p ? S.d.skills.filter((s) => inScope(s.levels) && s.levels.some((x) => (p.levels || []).includes(x))) : [];
  const form = f ? `<div class="sp-row"><h4>${f.id ? "تحرير الربط" : "ربط مهارة بالمشروع"}</h4><label>المهارة (الأعمار تتقاطع مع المشروع)<select id="lSk"${f.id ? " disabled" : ""}><option value="">اختر</option>${cand.map((s) => `<option value="${esc(s.id)}"${s.id === f.skill ? " selected" : ""}>${esc(s.name)}${s.info && s.info.status === "active" ? "" : " (صفحتها غير منشورة)"}</option>`).join("")}</select></label><label>الدور<select id="lRole"><option value="main"${f.role === "main" ? " selected" : ""}>أساسية</option><option value="support"${f.role !== "main" ? " selected" : ""}>مساندة</option></select></label><label>ما الذي يمارسه الطفل في هذا المشروع من هذه المهارة؟ (5 إلى 140 حرفًا)<input type="text" id="lGoal" maxlength="140" value="${esc(f.goal)}"></label><div class="sp-acts"><button class="chip" id="lSave">حفظ كمسودة</button><button class="chip" id="lCancel">إلغاء</button></div></div>` : "";
  return `${tabs()}<label>المشروع<select id="lPj"><option value="">اختر مشروعًا</option>${opts}</select></label>${p ? `<p class="mut">أعمار المشروع: ${(p.levels || []).map((l) => LV[l] || l).join("، ")}. حتى 3 مهارات أساسية و6 مهارات إجمالًا.</p>${canEdit() && !f ? '<button class="chip" id="lNew">+ ربط مهارة</button>' : ""}${form}${ls.map(row).join("") || '<p class="mut">لا توجد مهارات مرتبطة بهذا المشروع بعد.</p>'}` : ""}`;
}
function paint() {
  M.innerHTML = `<style>${CSS}</style><div class="sp"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">اربط المشاريع بالمهارات التي تمارسها (أساسية أو مساندة) وحدّد الهدف التعليمي ومعيار الممارسة. لا تُنشر المهارة ولا الربط قبل مراجعة المراجع.</p>${S.ed ? skillForm() : S.tab === "links" ? linksView() : skillsList()}</div>`;
  bind();
}
function bind() {
  const on = (sel, ev, fn) => $$(sel, M).forEach((n) => n.addEventListener(ev, fn));
  on("[data-tab]", "click", (ev) => { S.tab = ev.currentTarget.dataset.tab; S.ed = null; S.le = null; paint(); });
  on("#spDom", "change", (ev) => { S.dom = ev.target.value; paint(); });
  on("#spNew", "click", () => { S.ed = blank(); S.pv = ""; paint(); });
  on(".spEdit", "click", (ev) => { S.ed = fromS(skById(ev.currentTarget.closest("[data-sid]").dataset.sid)); S.pv = ""; paint(); });
  on("#spBack", "click", () => { S.ed = null; paint(); });
  on("#spPv", "click", () => { readSkill(); preview(); });
  on("#spSave", "click", () => saveSkill());
  on("#spPub", "click", () => setSkillStatus("active")); on("#spHide", "click", () => setSkillStatus("hidden")); on("#spDraft", "click", () => setSkillStatus("draft"));
  on("#lPj", "change", (ev) => { S.pj = ev.target.value; S.le = null; paint(); });
  on("#lNew", "click", () => { S.le = { id: null, skill: "", role: "support", goal: "" }; paint(); });
  on(".lEdit", "click", (ev) => { const l = S.d.plinks.find((x) => x.id === ev.currentTarget.closest("[data-lid]").dataset.lid); S.le = { id: l.id, skill: l.skill, role: l.role, goal: l.goal }; paint(); });
  on("#lCancel", "click", () => { S.le = null; paint(); });
  on("#lSave", "click", async () => { const f = S.le; f.skill = f.id ? f.skill : $("#lSk").value; f.role = $("#lRole").value; f.goal = $("#lGoal").value.trim(); const r = await sb.rpc("skp_link_save", { p: { id: f.id, project: S.pj, skill: f.skill, role: f.role, goal: f.goal, ord: 0 } }); if (r.error) return fail(r.error); toast("تم حفظ الربط كمسودة."); S.le = null; await load(); paint(); });
  const st = (cls, v) => on(cls, "click", async (ev) => { const id = ev.currentTarget.closest("[data-lid]").dataset.lid; const r = await sb.rpc("skp_link_status", { p_id: id, p_status: v }); if (r.error) return fail(r.error); toast(v === "active" ? "تم نشر الربط." : "تم إخفاء الربط."); await load(); paint(); });
  st(".lPub", "active"); st(".lHide", "hidden");
  on(".lDel", "click", async (ev) => { const id = ev.currentTarget.closest("[data-lid]").dataset.lid; if (Z.ask && !(await Z.ask("حذف هذا الربط نهائيًا؟"))) return; const r = await sb.rpc("skp_link_delete", { p_id: id }); if (r.error) return fail(r.error); toast("تم الحذف."); await load(); paint(); });
}
})();
