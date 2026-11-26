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
const LVN = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SRC = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "أنشودة", stories: "قصة", quiz: "اختبار", pack: "حزمة" };
const DL = { easy: "دعم بسيط", mid: "دعم تدريبي", adv: "تحدٍ إضافي" };
const S = { tab: "groups", fsrc: "", fq: "", me: { roles: [] }, groups: [], gs: [], skills: [], edit: null, open: null };
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
function shell(inner) { return `<style>${CSS}</style><div class="su"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">كل مجموعة تجمع مهارات منشورة وتعرض أنشطتها المنشورة والمرتبطة بها فعلًا. لا تُستخدم ألفاظ تصف الطفل أو تصنفه. لإضافة مهارة جديدة أو ربط الأنشطة أو كتابة التعليمات والتلميحات أو رفع الملفات استخدم مركز المهارات ونماذج المحتوى، ثم يُنشر النشاط عبر مركز الجودة.</p><div class="su-tabs" id="sutabs">${[["groups", "المجموعات"], ["levels", "مستوى الأنشطة"], ["create", "إنشاء المحتوى"], ["review", "المراجعة والجودة"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`; }
function bindTabs() { $$("#sutabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; S.edit = null; if (S.tab === "review") review(); else if (S.tab === "levels") levels(); else if (S.tab === "create") create(); else paint(); })); }
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

/* ---------- مستوى الأنشطة: تصنيف يدوي للأنشطة التي لا تحمل درجة صعوبة ---------- */
async function levels() {
  M.innerHTML = shell('<p class="mut">جارٍ التحميل…</p>'); bindTabs();
  const pub = await sb.rpc("support_public"), own = (pub.data && pub.data.diff) || {};
  const gsk = new Set(S.gs.map((x) => x.skill_id)); let links = [], from = 0;
  for (;;) { const r = await sb.from("skill_links").select("skill_id,item_key").range(from, from + 999); const a = r.data || []; links = links.concat(a); if (a.length < 1000) break; from += 1000; }
  const keys = [...new Set(links.filter((l) => gsk.has(l.skill_id)).map((l) => l.item_key))];
  let qi = [], f2 = 0; for (;;) { const r = await sb.from("quality_items").select("key,src,title,levels,status,gone").eq("gone", false).eq("status", "published").range(f2, f2 + 999); const a = r.data || []; qi = qi.concat(a); if (a.length < 1000) break; f2 += 1000; }
  const lv = await sb.from("support_levels").select("item_key,difficulty"), mine = Object.fromEntries((lv.data || []).map((x) => [x.item_key, x.difficulty]));
  const set = new Set(keys), items = qi.filter((i) => set.has(i.key)).sort((a, b) => a.src.localeCompare(b.src) || a.title.localeCompare(b.title, "ar"));
  const un = items.filter((i) => !own[i.key]), srcs = [...new Set(items.map((i) => i.src))];
  const shown = items.filter((i) => (!S.fsrc || S.fsrc === "_un" || i.src === S.fsrc) && (!S.fq || i.title.includes(S.fq)) && (S.fsrc !== "_un" || !own[i.key]));
  const rows = shown.slice(0, 80).map((i) => { const o = own[i.key], byEd = mine[i.key]; const fixed = o && !byEd; return `<div class="su-row" data-k="${esc(i.key)}"><b>${esc(i.title)} <span class="mut" style="font-size:12px">${esc(SRC[i.src] || i.src)} · ${esc((i.levels || []).map((l) => LVN[l]).filter(Boolean).join("، "))}</span></b>${fixed ? `<span class="su-bd ok">${DL[o]} (من بيانات النشاط)</span>` : `<select data-f="lv" aria-label="مستوى النشاط"><option value="">غير محدد</option>${Object.entries(DL).map(([k, t]) => `<option value="${k}" ${byEd === k ? "selected" : ""}>${t}</option>`).join("")}</select>`}</div>`; }).join("");
  M.innerHTML = shell(`<div class="su-form"><b>تصنيف مستوى الأنشطة</b><p class="mut">${AD(un.length)} نشاطًا في مهارات المركز بلا درجة صعوبة ولا تصنيف. حدّد مستوى كل نشاط بنفسك بعد مراجعته؛ لا نخمّن التصنيف آليًا. التصنيف هنا لا يغيّر محتوى النشاط، ويُستخدم فقط في خيارات «دعم بسيط / دعم تدريبي / تحدٍ إضافي» في الصفحة العامة. الأنشطة التي لها درجة في بياناتها تظهر ثابتة.</p><div class="su-acts"><select id="sufs"><option value="">كل الأنواع</option><option value="_un" ${S.fsrc === "_un" ? "selected" : ""}>بلا مستوى فقط</option>${srcs.map((x) => `<option value="${esc(x)}" ${S.fsrc === x ? "selected" : ""}>${esc(SRC[x] || x)}</option>`).join("")}</select><input type="text" id="sufq" placeholder="ابحث بعنوان النشاط" value="${esc(S.fq)}"></div></div>${rows || '<p class="mut">لا أنشطة بهذه الاختيارات.</p>'}${shown.length > 80 ? `<p class="mut">يُعرض أول ٨٠ من ${AD(shown.length)}؛ ضيّق البحث.</p>` : ""}`);
  bindTabs();
  $("#sufs", M).onchange = (e) => { S.fsrc = e.target.value; levels(); }; $("#sufq", M).onchange = (e) => { S.fq = e.target.value; levels(); };
  $$(".su-row[data-k] select", M).forEach((sel) => (sel.onchange = async () => { const x = await sb.rpc("support_set_level", { p_key: sel.closest(".su-row").dataset.k, p_diff: sel.value || null }); if (x.error) return fail(x.error); toast(sel.value ? "حُفظ المستوى." : "أُزيل المستوى."); }));
}
/* ---------- إنشاء المحتوى: مهارة جديدة واختصارات الربط والتعليمات ورفع الملفات ---------- */
const GO = [["skillsadm", "ربط الأنشطة بالمهارات وتحديد المرحلة (تعرّف/تدرّب/طبّق/راجع)"], ["bankadm", "كتابة تعليمات النشاط التفاعلي وأسئلته وشرح الإجابات"], ["quizadm", "الاختبارات: الأسئلة والشرح بعد الإجابة"], ["libadm", "رفع أوراق العمل والملفات وتحديد العمر والصف"], ["activitiesadm", "الأنشطة المنزلية: الخطوات ودور ولي الأمر"], ["qualityadm", "مراجعة النشاط ونشره عبر مركز الجودة"]];
async function create() {
  const dom = (await sb.from("skill_domains").select("slug,name").order("sort", { ascending: true })).data || [];
  M.innerHTML = shell(`${canEdit() ? `<div class="su-form"><b>مهارة جديدة تُضاف إلى مجموعة دعم</b><label>المجموعة<select id="cng">${S.groups.map((g) => `<option value="${esc(g.slug)}">${esc(g.name)}</option>`).join("")}</select></label><label>اسم المهارة<input type="text" id="cnn" maxlength="80"></label><label>وصف مبسط لما سيتدرب عليه الطفل<textarea id="cnd" rows="2" maxlength="300"></textarea></label><label>المجال التعليمي<select id="cnm">${dom.map((d) => `<option value="${esc(d.slug)}">${esc(d.name)}</option>`).join("")}</select></label><div><b style="font-size:13px">العمر أو الصف</b><div class="su-lvs" id="cnl" style="display:flex;flex-wrap:wrap;gap:8px">${Object.entries(LVN).map(([k, l]) => `<label style="flex-direction:row;align-items:center;gap:4px;font-weight:600"><input type="checkbox" value="${k}"> ${l}</label>`).join("")}</div></div><p class="mut" style="font-size:12px">القاعدة تمنع المهارات المتقاربة بالاسم وتحصر العمر بين سنتين والصف الرابع. المهارة الجديدة لا تظهر للزوار حتى تُربط بأنشطة منشورة.</p><p class="su-msg" id="cnm2" role="status"></p><div class="su-acts"><button class="chip pri" id="cngo">إنشاء وإضافة إلى المجموعة</button></div></div>` : ""}<div class="su-form"><b>اختصارات</b>${GO.map(([k, t]) => `<div class="su-row"><b>${esc(t)}</b><button class="chip pri" data-go="${esc(k)}">فتح</button></div>`).join("")}</div>`);
  bindTabs();
  $$("[data-go]", M).forEach((b) => (b.onclick = () => window.__go(b.dataset.go)));
  const go = $("#cngo", M); if (go) go.onclick = async () => {
    const msg = (t, c) => { const m = $("#cnm2", M); m.className = "su-msg " + (c || ""); m.textContent = t; };
    const p = { name: $("#cnn", M).value, descr: $("#cnd", M).value, domain: $("#cnm", M).value, levels: $$("#cnl input:checked", M).map((x) => x.value), status: "active" };
    const r = await sb.rpc("skill_save", { p, p_force: false }); if (r.error) return msg(String(r.error.message).replace(/^.*?:\s*/, ""), "bad");
    const a = await sb.rpc("support_skill_add", { p_group: $("#cng", M).value, p_skill: r.data.id }); if (a.error) return msg("أُنشئت المهارة لكن تعذّرت إضافتها للمجموعة: " + String(a.error.message).replace(/^.*?:\s*/, ""), "bad");
    await load(); create(); toast("أُنشئت المهارة وأُضيفت إلى المجموعة. اربطها الآن بأنشطة منشورة لتظهر للزوار.");
  };
}
async function review() {
  const r = await sb.rpc("support_check"), list = r.error ? null : r.data || [];
  M.innerHTML = shell(`<div class="su-form"><b>ملخص</b><p class="mut">${AD(S.groups.length)} مجموعات (${AD(S.groups.filter((g) => g.status === "active").length)} ظاهرة)، ${AD(S.gs.length)} ربط مهارة. تظهر للزوار فقط المهارات التي لها أنشطة منشورة تناسب العمر المختار.</p></div><div class="mut" style="font-weight:800;margin:10px 0 4px">فحص جودة المركز</div>${r.error ? `<p class="su-msg bad">${esc(r.error.message)}</p>` : list.length ? list.map((p) => `<div class="su-row"><span class="su-bd warn">${esc(PROB[p.t] || p.t)}</span><b>${esc(p.msg)}</b></div>`).join("") : '<p class="su-msg" style="color:#17683a">لا مشكلات: كل مجموعة فيها مهارات منشورة ولكل مهارة أنشطة منشورة.</p>'}`);
  bindTabs();
}
window.__supportAdmTest = { S };
})();
