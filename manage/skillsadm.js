/* مركز المهارات التعليمية — تنظيم الموارد حسب المهارة (إدارة). القواعد (منع التكرار، تقاطع العمر، حد الروابط، الصلاحيات، تعليم الروابط للمراجعة عند تغيّر التصنيف)
   مفروضة في قاعدة البيانات لا في هذه الواجهة. النطاق: من سنة إلى 6 سنوات والصفوف 1–4. الروابط الآلية الأولى «غير مراجعة» حتى يعتمدها مراجع تعليمي. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const STG = { recognize: "تعرّف", practice: "تدرّب", apply: "طبّق", review: "راجع" };
const TYPE = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "أنشودة", stories: "قصة", quiz: "اختبار", pack: "حزمة" };
const PROB = { dup: "تكرار", goal: "هدف غير واضح", gone: "مورد محذوف", level: "عمر لا يتقاطع", unpub: "مورد غير منشور" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.sk *{box-sizing:border-box}.sk-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.sk-tabs .chip.on{background:#6b3fd4;color:#fff}
.sk-dom{margin:14px 0 6px;font-weight:800;color:#4b2aa5}.sk-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:8px 10px;margin:6px 0}
.sk-row b{flex:1;min-width:140px}.sk-row .mut{font-size:12px}.sk-bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.sk-bd.bad{background:#ffe3e0;color:#9a1d12}.sk-bd.ok{background:#dff6e7;color:#17683a}.sk-bd.warn{background:#fff0d1;color:#8a5200}
.sk-form{background:#faf7ff;border:1px solid #e4d9ff;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:8px;margin:10px 0}.sk-form label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px}
.sk-form input[type=text],.sk-form textarea,.sk-form select,.sk-q input,.sk-q select,.sk-row select{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:38px;background:#fff}.sk-lvs{display:flex;flex-wrap:wrap;gap:8px}.sk-lvs label{flex-direction:row;align-items:center;gap:4px;font-weight:600}
.sk-q{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.sk-q input{flex:1;min-width:160px}.sk-msg{font-weight:700;font-size:13px}.sk-msg.bad{color:#b3261e}.sk-msg.ok{color:#17683a}.sk-acts{display:flex;gap:8px;flex-wrap:wrap}.sk-acts .chip.pri{background:#6b3fd4;color:#fff}.sk-acts .chip.bad{background:#c62f4a;color:#fff}`;
const S = { tab: "skills", me: { roles: [] }, dom: [], sk: [], ln: [], it: new Map(), fd: "", fs: "", edit: null, open: null, chk: null, log: [] };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager"), isMgr = () => has("library_manager");
const dn = (s) => (S.dom.find((d) => d.slug === s) || { name: s }).name;
const lvTxt = (l) => (l || []).map((x) => LV[x]).filter(Boolean).join("، ");
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
async function loadMe() { const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data; return S.me.roles.length > 0; }
async function load() {
  const [d, s, l] = await Promise.all([sb.from("skill_domains").select("*").order("sort", { ascending: true }), sb.from("skills").select("*").order("sort", { ascending: true }), sb.from("skill_links").select("*").order("ord", { ascending: true })]);
  S.dom = d.data || []; S.sk = s.data || []; S.ln = l.data || [];
  let all = [], from = 0; for (;;) { const r = await sb.from("quality_items").select("key,src,title,levels,status,gone").eq("gone", false).range(from, from + 999); const a = r.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
const linksOf = (id) => S.ln.filter((l) => l.skill_id === id);
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
SUB.skillsadm = { title: "مركز المهارات التعليمية", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  if (!(await loadMe())) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى مركز المهارات.</p>'; return; }
  await load(); S.edit = null; S.open = null; paint();
} };
function shell(inner) {
  return `<style>${CSS}</style><div class="sk"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <p class="mut">تربط المهارات الموارد بهدف التعلم. لا يُربط مورد بمهارة لمجرد زيادة ظهوره في البحث، ولا يربط النظام مواردَ خارج عمر المهارة. فتح المورد لا يعني إتقان المهارة.</p>
  <div class="sk-tabs" id="sktabs">${[["skills", "المهارات"], ["review", "المراجعة والجودة"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`;
}
function paint() {
  M.innerHTML = shell(S.tab === "skills" ? (S.open ? linksHtml() : S.edit ? formHtml() : listHtml()) : `<p class="mut">جارٍ التحميل…</p>`);
  $$("#sktabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; S.edit = null; if (S.tab === "review") reviewPaint(); else paint(); }));
  if (S.tab === "skills") { if (S.open) bindLinks(); else if (S.edit) bindForm(); else bindList(); }
}
/* ---------- القائمة ---------- */
function listHtml() {
  const doms = S.dom.filter((d) => !S.fd || d.slug === S.fd);
  const body = doms.map((d) => {
    const a = S.sk.filter((s) => s.domain === d.slug && (!S.fs || s.status === S.fs));
    return `<div class="sk-dom">${esc(d.name)} <span class="mut">(${AD(a.length)})</span></div>` + (a.length ? a.map((s, i) => { const ls = linksOf(s.id), un = ls.filter((l) => !l.reviewed).length; return `<div class="sk-row" data-id="${esc(s.id)}"><b>${esc(s.name)}${s.parent_id ? ' <span class="sk-bd">فرعية</span>' : ""}</b><span class="mut">${esc(lvTxt(s.levels))}</span><span class="sk-bd">${AD(ls.length)} مورد</span>${un ? `<span class="sk-bd warn">${AD(un)} غير مراجع</span>` : ""}${s.status === "hidden" ? '<span class="sk-bd bad">مخفية</span>' : ""}${s.has_path ? '<span class="sk-bd">متسلسلة</span>' : ""}${canEdit() ? `<button class="chip" data-a="up" ${i === 0 ? "disabled" : ""} aria-label="تقديم">▲</button><button class="chip" data-a="down" ${i === a.length - 1 ? "disabled" : ""} aria-label="تأخير">▼</button><button class="chip" data-a="edit">تعديل</button>` : ""}<button class="chip pri" data-a="links">الموارد</button></div>`; }).join("") : '<p class="mut">لا مهارات.</p>');
  }).join("");
  return `<div class="sk-q"><select id="skfd"><option value="">كل المجالات</option>${S.dom.map((d) => `<option value="${esc(d.slug)}" ${S.fd === d.slug ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select><select id="skfs"><option value="">كل الحالات</option><option value="active" ${S.fs === "active" ? "selected" : ""}>ظاهرة</option><option value="hidden" ${S.fs === "hidden" ? "selected" : ""}>مخفية</option></select>${canEdit() ? '<button class="chip pri" id="sknew">+ مهارة جديدة</button>' : ""}</div>${body}`;
}
function bindList() {
  $("#skfd", M).onchange = (e) => { S.fd = e.target.value; paint(); }; $("#skfs", M).onchange = (e) => { S.fs = e.target.value; paint(); };
  const nw = $("#sknew", M); if (nw) nw.onclick = () => { S.edit = { id: null, name: "", descr: "", domain: S.fd || (S.dom[0] || {}).slug, levels: [], has_path: false, parent_id: null, status: "active" }; paint(); };
  $$(".sk-row", M).forEach((r) => $$("[data-a]", r).forEach((b) => (b.onclick = async () => {
    const id = r.dataset.id, s = S.sk.find((x) => x.id === id), a = b.dataset.a;
    if (a === "edit") { S.edit = Object.assign({}, s); paint(); } else if (a === "links") { S.open = id; S.q = ""; paint(); }
    else { const sib = S.sk.filter((x) => x.domain === s.domain && (!S.fs || x.status === S.fs)).map((x) => x.id), i = sib.indexOf(id), j = a === "up" ? i - 1 : i + 1; if (j < 0 || j >= sib.length) return; [sib[i], sib[j]] = [sib[j], sib[i]]; const x = await sb.rpc("skill_order", { p_ids: sib }); if (x.error) return fail(x.error); await load(); paint(); }
  })));
}
/* ---------- نموذج المهارة ---------- */
function formHtml() {
  const e = S.edit, parents = S.sk.filter((s) => s.domain === e.domain && !s.parent_id && s.id !== e.id);
  return `<div class="sk-form"><b>${e.id ? "تعديل المهارة" : "مهارة جديدة"}</b>
  <label>اسم المهارة<input type="text" id="sfn" maxlength="80" value="${esc(e.name)}"></label>
  <label>وصف مبسط<textarea id="sfd" rows="2" maxlength="300">${esc(e.descr || "")}</textarea></label>
  <label>المجال التعليمي<select id="sfdm">${S.dom.map((d) => `<option value="${esc(d.slug)}" ${e.domain === d.slug ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>
  <div><b style="font-size:13px">العمر أو الصف</b><div class="sk-lvs" id="sflv">${Object.entries(LV).map(([k, l]) => `<label><input type="checkbox" value="${k}" ${(e.levels || []).includes(k) ? "checked" : ""}> ${l}</label>`).join("")}</div></div>
  <label>مهارة رئيسية (إن كانت هذه فرعية)<select id="sfp"><option value="">— لا، هذه مهارة رئيسية —</option>${parents.map((p) => `<option value="${esc(p.id)}" ${e.parent_id === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("")}</select></label>
  <label style="flex-direction:row;align-items:center;gap:6px"><input type="checkbox" id="sfh" ${e.has_path ? "checked" : ""}> مهارة تحتاج مسار تعلم متسلسلًا</label>
  <label>الحالة<select id="sfs"><option value="active" ${e.status !== "hidden" ? "selected" : ""}>ظاهرة</option><option value="hidden" ${e.status === "hidden" ? "selected" : ""}>مخفية مؤقتًا</option></select></label>
  <p class="mut" style="font-size:12px">تغيير الاسم أو المجال أو العمر أو الحالة يعلّم روابط المهارة «غير مراجعة» ويسجّل ذلك في سجل جودة كل مورد منشور مرتبط.</p>
  <p class="sk-msg" id="sfm" role="status"></p><div class="sk-acts"><button class="chip pri" id="sfsave">حفظ</button><button class="chip" id="sfcan">إلغاء</button>${e.id && isMgr() ? '<button class="chip bad" id="sfdel">حذف المهارة</button>' : ""}</div></div>`;
}
function bindForm() {
  const e = S.edit, msg = (t, c) => { const m = $("#sfm", M); m.className = "sk-msg " + (c || ""); m.textContent = t; };
  $("#sfdm", M).onchange = () => { e.name = $("#sfn", M).value; e.descr = $("#sfd", M).value; e.domain = $("#sfdm", M).value; e.levels = $$("#sflv input:checked", M).map((x) => x.value); e.has_path = $("#sfh", M).checked; e.parent_id = null; e.status = $("#sfs", M).value; paint(); };
  $("#sfcan", M).onclick = () => { S.edit = null; paint(); };
  const save = async (force) => {
    const p = { id: e.id || null, name: $("#sfn", M).value, descr: $("#sfd", M).value, domain: $("#sfdm", M).value, levels: $$("#sflv input:checked", M).map((x) => x.value), parent_id: $("#sfp", M).value || null, has_path: $("#sfh", M).checked, status: $("#sfs", M).value };
    const r = await sb.rpc("skill_save", { p, p_force: !!force });
    if (r.error) {
      const t = String(r.error.message || "");
      if (/متقاربة/.test(t) && isMgr() && !force) { msg(t.replace(/^.*?:\s*/, ""), "bad"); if (await Z.ask("الاسم قريب من مهارة موجودة. حفظه رغم ذلك يخلق تكرارًا محتملًا. هل تؤكد أنها مهارة مختلفة فعلًا؟")) return save(true); return; }
      return msg(t.replace(/^.*?:\s*/, ""), "bad");
    }
    const n = r.data && r.data.links_to_review; await load(); S.edit = null; paint(); toast(n ? "حُفظت المهارة، ووُسم " + AD(n) + " رابط للمراجعة." : "حُفظت المهارة.");
  };
  $("#sfsave", M).onclick = () => save(false);
  const dl = $("#sfdel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف المهارة نهائيًا؟ لا يمكن حذف مهارة لها روابط أو مهارات فرعية."))) return; const r = await sb.rpc("skill_delete", { p_id: e.id }); if (r.error) return msg(String(r.error.message).replace(/^.*?:\s*/, ""), "bad"); await load(); S.edit = null; paint(); toast("حُذفت المهارة."); };
}
/* ---------- روابط المهارة ---------- */
function linksHtml() {
  const s = S.sk.find((x) => x.id === S.open), ls = linksOf(s.id), q = (S.q || "").trim();
  let cand = [];
  if (q.length >= 2) cand = [...S.it.values()].filter((i) => i.status === "published" && (i.levels || []).some((x) => s.levels.includes(x)) && i.title.includes(q) && !ls.some((l) => l.item_key === i.key)).slice(0, 12);
  const rows = ls.map((l) => { const i = S.it.get(l.item_key); return `<div class="sk-row" data-l="${esc(l.id)}"><b>${esc(itT(l.item_key))} <span class="mut">${esc(TYPE[(i || {}).src] || "")}</span></b><span class="mut">${esc(lvTxt((i || {}).levels))}</span>${i && i.status !== "published" ? '<span class="sk-bd bad">غير منشور</span>' : ""}${l.reviewed ? '<span class="sk-bd ok">مراجَع</span>' : `<span class="sk-bd warn">غير مراجع${l.origin === "rule" ? " (ربط آلي أولي)" : ""}</span>`}${canEdit() ? `<select data-f="stage" aria-label="المستوى">${Object.entries(STG).map(([k, t]) => `<option value="${k}" ${l.stage === k ? "selected" : ""}>${t}</option>`).join("")}</select><select data-f="role" aria-label="الدور"><option value="main" ${l.role === "main" ? "selected" : ""}>رئيسية</option><option value="sub" ${l.role === "sub" ? "selected" : ""}>داعمة</option></select><button class="chip bad" data-a="unlink">فك الربط</button>` : `<span class="sk-bd">${STG[l.stage]}</span>`}</div>`; }).join("");
  const un = ls.filter((l) => !l.reviewed).length;
  return `<button class="chip" id="sklback">→ كل المهارات</button><h3 style="margin:8px 0">${esc(s.name)} <span class="sk-bd">${esc(dn(s.domain))}</span> <span class="sk-bd">${esc(lvTxt(s.levels))}</span></h3>
  ${canRev() && un ? `<div class="sk-acts"><button class="chip pri" id="skapp">اعتماد ${AD(un)} رابط غير مراجع (راجعتُ صحة ارتباطها)</button></div>` : ""}
  ${rows || '<p class="mut">لا موارد مرتبطة بهذه المهارة.</p>'}
  ${canEdit() ? `<div class="sk-form"><b>ربط مورد منشور بهذه المهارة</b><div class="sk-q"><input type="text" id="skq" placeholder="ابحث بعنوان المورد (حرفان على الأقل)" value="${esc(S.q || "")}"></div>${q.length >= 2 ? (cand.length ? cand.map((i) => `<div class="sk-row" data-k="${esc(i.key)}"><b>${esc(i.title)} <span class="mut">${esc(TYPE[i.src] || "")}</span></b><span class="mut">${esc(lvTxt(i.levels))}</span><select data-f="st">${Object.entries(STG).map(([k, t]) => `<option value="${k}" ${k === "practice" ? "selected" : ""}>${t}</option>`).join("")}</select><button class="chip pri" data-a="add">ربط</button></div>`).join("") : '<p class="mut">لا نتائج مناسبة لعمر المهارة.</p>') : ""}<p class="mut" style="font-size:12px">الحد الأقصى أربع مهارات للمورد الواحد، ومهارة رئيسية واحدة. لا يُسمح بربط مورد لا يتقاطع عمره مع عمر المهارة.</p></div>` : ""}`;
}
function bindLinks() {
  const s = S.sk.find((x) => x.id === S.open);
  $("#sklback", M).onclick = () => { S.open = null; paint(); };
  const ap = $("#skapp", M); if (ap) ap.onclick = async () => { const ids = linksOf(s.id).filter((l) => !l.reviewed).map((l) => l.id); const r = await sb.rpc("skill_review", { p_ids: ids }); if (r.error) return fail(r.error); await load(); paint(); toast("اعتُمدت الروابط."); };
  const q = $("#skq", M); if (q) q.oninput = () => { S.q = q.value; const p = q.selectionStart; paint(); const n = $("#skq", M); n.focus(); try { n.setSelectionRange(p, p); } catch (e) { /* */ } };
  $$(".sk-row[data-l]", M).forEach((r) => {
    const id = r.dataset.l, upd = async () => { const x = await sb.rpc("skill_link_update", { p_id: id, p_stage: $("[data-f=stage]", r).value, p_role: $("[data-f=role]", r).value, p_ord: null }); if (x.error) { fail(x.error); await load(); paint(); return; } await load(); paint(); };
    $$("select", r).forEach((e) => (e.onchange = upd));
    const ul = $("[data-a=unlink]", r); if (ul) ul.onclick = async () => { if (!(await Z.ask("فك ربط هذا المورد بالمهارة؟"))) return; const x = await sb.rpc("skill_unlink", { p_id: id }); if (x.error) return fail(x.error); await load(); paint(); };
  });
  $$(".sk-row[data-k]", M).forEach((r) => { $("[data-a=add]", r).onclick = async () => { const x = await sb.rpc("skill_link", { p_skill: s.id, p_key: r.dataset.k, p_stage: $("[data-f=st]", r).value, p_role: "sub" }); if (x.error) return fail(x.error); await load(); paint(); toast("رُبط المورد."); }; });
}
/* ---------- المراجعة والجودة ---------- */
async function reviewPaint() {
  const r = await sb.rpc("skills_check"); S.chk = r.error ? null : r.data || [];
  const un = S.sk.map((s) => ({ s, n: linksOf(s.id).filter((l) => !l.reviewed).length })).filter((x) => x.n);
  const rule = S.ln.filter((l) => l.origin === "rule" && !l.reviewed).length;
  const unlinked = [...S.it.values()].filter((i) => i.status === "published" && !S.ln.some((l) => l.item_key === i.key)).length;
  M.innerHTML = shell(`<div class="sk-form"><b>ملخص</b><p class="mut">${AD(S.sk.length)} مهارة · ${AD(S.ln.length)} رابط · ${AD(rule)} رابط آلي أولي لم يُراجَع بعد · ${AD(unlinked)} مورد منشور بلا مهارة (لم تطابقه قواعد الربط، ويبقى للربط اليدوي).</p></div>
  <div class="sk-dom">فحص جودة التصنيف</div>${r.error ? `<p class="sk-msg bad">${esc(r.error.message)}</p>` : S.chk.length ? S.chk.map((p) => `<div class="sk-row"><span class="sk-bd bad">${esc(PROB[p.t] || p.t)}</span><b>${esc(p.msg)}</b></div>`).join("") : '<p class="sk-msg ok">لا مشكلات: الأسماء غير مكررة، والأهداف واضحة، والروابط ضمن عمر المهارة.</p>'}
  <div class="sk-dom">مهارات فيها روابط غير مراجعة</div>${un.length ? un.map((x) => `<div class="sk-row" data-id="${esc(x.s.id)}"><b>${esc(x.s.name)}</b><span class="sk-bd warn">${AD(x.n)} غير مراجع</span><button class="chip pri" data-a="open">فتح الروابط</button></div>`).join("") : '<p class="mut">لا شيء بانتظار المراجعة.</p>'}`);
  $$("#sktabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; if (S.tab === "review") reviewPaint(); else paint(); }));
  $$(".sk-row[data-id] [data-a=open]", M).forEach((b) => (b.onclick = () => { S.tab = "skills"; S.open = b.closest(".sk-row").dataset.id; S.q = ""; paint(); }));
}
window.__skillsTest = { S, linksOf };
})();
