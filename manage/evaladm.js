/* مركز معايير تقييم المشاريع (إدارة): معايير مرنة بصياغات للأعمار (ملاحظة ولي الأمر / عبارات قصيرة / صفوف)،
   وتقييم لكل مشروع منشور يختار منه المحرر المعايير ومرحلة كل معيار ومهارته ورسائل التشجيع والسؤال الختامي، مع معاينة.
   القواعد (لا درجات ولا منافسة ولا عبارات ضعف، حدود العدد حسب العمر، الأعمار ضمن المشروع، النشر للمراجع بعد نشر المشروع والمعايير) في قاعدة البيانات. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SCOPE = Object.keys(LV);
const STD = { understand: "فهم فكرة المشروع", steps: "اتباع الخطوات الأساسية", tools: "استخدام الأدوات المناسبة", skill: "تطبيق المهارة المستهدفة", complete: "إكمال الجزء المطلوب", express: "التعبير عن النتيجة", reflect: "التفكير فيما تعلمه الطفل", care: "المحافظة على الأدوات وترتيبها بمساعدة مناسبة" };
const STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const LAB = { done: "أنجزت", help: "أحتاج إلى مساعدة", retry: "سأحاول مرة أخرى" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.ev *{box-sizing:border-box}.ev-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.ev-row b{display:block;margin-bottom:4px}.ev label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.ev select,.ev textarea,.ev input[type=text]{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:40px;background:#fff}.ev textarea{min-height:60px}.ev .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.ev .bd.ok{background:#dff6e7;color:#17683a}.ev .ck{flex-direction:row;align-items:center;gap:6px}.ev-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}.ev-pv{background:#faf7ff;border:2px dashed #cdb8f5;border-radius:16px;padding:10px;margin:8px 0}.ev-pv .st{display:flex;gap:6px;flex-wrap:wrap}.ev-pv .st span{border:2px solid #cdb8f5;border-radius:12px;padding:6px 10px;font-size:13px;font-weight:700;background:#fff}`;
const S = { me: { roles: [] }, sk: [], d: { criteria: [], evals: [], projects: [] }, tab: "evals", edit: null, ce: null, pv: "" };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const band = (lv) => (lv === "a2" || lv === "a3" ? "young" : /^a/.test(lv) ? "pre" : lv === "g1" || lv === "g2" ? "early" : "late");
const skN = (id) => (S.sk.find((s) => s.id === id) || {}).name || "";
const prj = (slug) => S.d.projects.find((p) => p.slug === slug);
const crit = (id) => S.d.criteria.find((c) => c.id === id);
async function load() {
  const [s, r] = await Promise.all([sb.from("skills").select("id,slug,name,levels,status,sort").eq("status", "active").order("sort", { ascending: true }), sb.rpc("eval_admin")]);
  S.sk = s.data || []; if (r.error) { fail(r.error); S.d = { criteria: [], evals: [], projects: [] }; } else S.d = r.data || { criteria: [], evals: [], projects: [] };
}
SUB.evaladm = { title: "مركز معايير تقييم المشاريع", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.edit = null; S.ce = null; S.pv = ""; paint();
} };
const blankE = () => ({ id: null, project: "", name: "", levels: [], criteria: [], closing: { young: "", pre: "", early: "", late: "" }, msgs: { done: "", help: "", retry: "" }, status: "" });
const fromE = (r) => ({ id: r.id, project: r.project, name: r.name, levels: r.levels || [], criteria: (r.criteria || []).map((c) => ({ id: c.id, stage: c.stage || "", skill: c.skill || "" })), closing: Object.assign({ young: "", pre: "", early: "", late: "" }, r.closing || {}), msgs: { done: ((r.msgs || {}).done || []).join("\n"), help: ((r.msgs || {}).help || []).join("\n"), retry: ((r.msgs || {}).retry || []).join("\n") }, status: r.status });
const blankC = () => ({ id: null, std: "", young: "", pre: "", kid: "", skill: "", status: "" });
const maxFor = (lv) => (lv.some((l) => l === "a2" || l === "a3") ? 4 : lv.some((l) => /^a/.test(l)) ? 6 : 8);
function listHtml() {
  const tb = `<div class="ev-acts"><button class="chip" data-tab="evals"${S.tab === "evals" ? ' style="background:#5b2bb8;color:#fff"' : ""}>التقييمات</button><button class="chip" data-tab="crit"${S.tab === "crit" ? ' style="background:#5b2bb8;color:#fff"' : ""}>المعايير</button></div>`;
  if (S.tab === "crit") return `${tb}${canEdit() ? '<button class="chip" id="evNewC">+ معيار جديد</button>' : ""}${S.d.criteria.map((c) => `<div class="ev-row"><b>${esc(c.kid)}</b><span class="bd">${esc(STD[c.std] || "معيار مخصص")}</span> <span class="bd ${c.status === "active" ? "ok" : ""}">${esc(STS[c.status])}</span> ${c.skill ? `<span class="bd">${esc(skN(c.skill))}</span>` : ""} <span class="bd">يُستخدم في ${AD(c.used)}</span> <button class="chip" data-ec="${esc(c.id)}">تحرير</button></div>`).join("") || '<p class="mut">لا توجد معايير.</p>'}`;
  return `${tb}${canEdit() ? '<button class="chip" id="evNew">+ تقييم جديد لمشروع</button>' : ""}${S.d.evals.map((e) => `<div class="ev-row"><b>${esc(e.name)}</b><span class="bd">${esc((prj(e.project) || { title: e.project }).title)}</span> <span class="bd ${e.status === "active" ? "ok" : ""}">${esc(STS[e.status])}</span> <span class="bd">${AD((e.criteria || []).length)} معايير</span> <button class="chip" data-e="${esc(e.id)}">تحرير</button></div>`).join("") || '<p class="mut">لا توجد تقييمات بعد. اختر مشروعًا منشورًا وأنشئ له تقييمًا.</p>'}`;
}
function critForm() {
  const c = S.ce;
  return `<button class="chip" id="evCBack">← كل المعايير</button><h3>${c.id ? "تحرير معيار" : "معيار جديد"}</h3>
  <label>النوع القياسي (اختياري)<select id="cStd"><option value="">معيار مخصص</option>${Object.entries(STD).map(([k, v]) => `<option value="${k}"${c.std === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
  <label>صياغة الأعمار الصغيرة، ملاحظة ولي الأمر (حتى 60 حرفًا)<input type="text" id="cYoung" maxlength="60" value="${esc(c.young)}"></label>
  <label>صياغة 4 إلى 6 سنوات، عبارة قصيرة (حتى 80 حرفًا)<input type="text" id="cPre" maxlength="80" value="${esc(c.pre)}"></label>
  <label>صياغة الصفوف الأول إلى الرابع (حتى 140 حرفًا)<input type="text" id="cKid" maxlength="140" value="${esc(c.kid)}"></label>
  <label>مهارة مرتبطة (اختيارية؛ منها تُقترح موارد المكتبة)<select id="cSkill"><option value="">بلا مهارة</option>${S.sk.map((s) => `<option value="${esc(s.id)}"${s.id === c.skill ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
  <p class="mut">الحالة: ${esc(STS[c.status] || "جديد")}. اكتب بلغة داعمة بلا درجات ولا مقارنة ولا عبارات ضعف.</p>
  <div class="ev-acts">${canEdit() ? '<button class="chip" id="cSave">حفظ</button>' : ""}${c.id && canRev() ? `${c.status !== "active" ? '<button class="chip" id="cPub">نشر</button>' : '<button class="chip" id="cHide">إخفاء</button>'}<button class="chip" id="cDel">حذف</button>` : ""}</div>`;
}
function evForm() {
  const e = S.edit, p = prj(e.project), pl = p ? SCOPE.filter((l) => (p.levels || []).includes(l)) : [], mx = maxFor(e.levels), sel = new Map(e.criteria.map((c) => [c.id, c]));
  const stages = p ? p.stages || [] : [];
  const bands = new Set(e.levels.map(band));
  const crow = (c) => { const s = sel.get(c.id); return `<div class="ev-row" data-cid="${esc(c.id)}"><label class="ck"><input type="checkbox" class="cSel"${s ? " checked" : ""}${c.status !== "active" && !s ? "" : ""}> ${esc(c.kid)} <span class="bd ${c.status === "active" ? "ok" : ""}">${esc(STS[c.status])}</span></label>${s ? `<label>مرحلة المعيار (اختياري)<select class="cStage"><option value="">كل المشروع</option>${stages.map((g) => `<option value="${esc(g)}"${s.stage === g ? " selected" : ""}>${esc(g)}</option>`).join("")}</select></label><label>مهارة هذا المعيار في المشروع (اختيارية)<select class="cSk"><option value="">${c.skill ? "حسب المعيار: " + esc(skN(c.skill)) : "بلا مهارة"}</option>${S.sk.map((k) => `<option value="${esc(k.id)}"${s.skill === k.id ? " selected" : ""}>${esc(k.name)}</option>`).join("")}</select></label>` : ""}</div>`; };
  return `<button class="chip" id="evBack">← كل التقييمات</button><h3>${e.id ? "تحرير تقييم" : "تقييم جديد"}</h3>
  <label>المشروع<select id="eProj"${e.id ? " disabled" : ""}><option value="">اختر</option>${S.d.projects.map((x) => `<option value="${esc(x.slug)}"${x.slug === e.project ? " selected" : ""}>${esc(x.title)} ${x.status === "published" ? "" : "(غير منشور)"}</option>`).join("")}</select></label>
  <label>اسم المراجعة<input type="text" id="eName" maxlength="80" value="${esc(e.name)}"></label>
  <div class="ev-row"><b>الأعمار والصفوف (ضمن المشروع)</b>${pl.length ? pl.map((l) => `<label class="ck"><input type="checkbox" data-l="${l}"${e.levels.includes(l) ? " checked" : ""}> ${LV[l]}</label>`).join("") : '<span class="mut">اختر المشروع أولًا.</span>'}<p class="mut">الحد الأقصى للمعايير لهذه الفئة: ${AD(mx)}.</p></div>
  <h4>المعايير المختارة (${AD(e.criteria.length)} من ${AD(mx)})</h4>${S.d.criteria.map(crow).join("")}
  <h4>السؤال الختامي (اختياري، حتى 120 حرفًا)</h4>
  ${bands.has("young") ? `<label>للأعمار الصغيرة (سؤال قصير لولي الأمر)<input type="text" class="cl" data-b="young" maxlength="120" value="${esc(e.closing.young)}"></label>` : ""}
  ${bands.has("pre") ? `<label>من 4 إلى 6 سنوات (يطلب من الطفل أن يحكي)<input type="text" class="cl" data-b="pre" maxlength="120" value="${esc(e.closing.pre)}" placeholder="احكِ بكلماتك ما فعلته"></label>` : ""}
  ${bands.has("early") ? `<label>الصفان الأول والثاني<input type="text" class="cl" data-b="early" maxlength="120" value="${esc(e.closing.early)}" placeholder="ما الشيء الذي تعلمته؟"></label>` : ""}
  ${bands.has("late") ? `<label>الصفان الثالث والرابع (سؤال إضافي بعد الأسئلة الثلاثة)<input type="text" class="cl" data-b="late" maxlength="120" value="${esc(e.closing.late)}"></label>` : ""}
  <h4>رسائل التشجيع (رسالة في كل سطر، حتى 5، من 3 إلى 100 حرف)</h4>
  <label>عند الإنجاز<textarea id="mDone" placeholder="أحسنت! لقد تعلمت شيئًا جديدًا">${esc(e.msgs.done)}</textarea></label>
  <label>عند الحاجة إلى مساعدة<textarea id="mHelp" placeholder="عمل رائع، يمكنك مراجعة خطوة واحدة ثم المحاولة مرة أخرى">${esc(e.msgs.help)}</textarea></label>
  <label>عند المحاولة مرة أخرى<textarea id="mRetry" placeholder="كل محاولة تساعدك على التعلم">${esc(e.msgs.retry)}</textarea></label>
  <p class="mut">إن تركت الرسائل فارغة تُستخدم رسائل التشجيع الافتراضية.</p>
  <div class="ev-acts"><button class="chip" id="evPv">معاينة صفحة التقييم</button>${canEdit() ? '<button class="chip" id="evSave">حفظ كمسودة</button>' : ""}${e.id && canRev() ? `${e.status !== "active" ? '<button class="chip" id="evPub">نشر</button>' : '<button class="chip" id="evHide">إخفاء</button>'}<button class="chip" id="evDel">حذف</button>` : ""}${e.id && e.status === "active" ? `<a class="chip" href="../eval/#/p/${esc(e.project)}" target="_blank" rel="noopener">فتح الصفحة المنشورة</a>` : ""}</div>
  <p class="mut">الحالة: ${esc(STS[e.status] || "جديد")}. ${e.status === "active" ? "ظاهر للزوار." : "غير ظاهر للزوار حتى يُنشره مراجع بعد نشر المشروع والمعايير."}</p><div id="evPvBox">${S.pv}</div>`;
}
function preview() {
  const e = S.edit, p = prj(e.project), lvs = e.levels; if (!p || !lvs.length) return '<p class="mut">اختر المشروع والأعمار أولًا.</p>';
  const cs = e.criteria.map((x) => crit(x.id)).filter(Boolean);
  if (!cs.length) return '<p class="mut">اختر معيارًا واحدًا على الأقل.</p>';
  return lvs.map((l) => { const b = band(l), field = b === "young" ? "young" : b === "pre" ? "pre" : "kid", list = b === "young" ? cs.slice(0, 4) : cs;
    const q = b === "young" ? (e.closing.young || "") : b === "pre" ? (e.closing.pre || "احكِ بكلماتك ما فعلته") : b === "early" ? (e.closing.early || "ما الشيء الذي تعلمته؟") : "ما المهارة التي استخدمتها؟ · ما أكثر خطوة أعجبتك؟ · ما الذي ستفعله بطريقة مختلفة في المرة القادمة؟" + (e.closing.late ? " · " + e.closing.late : "");
    return `<div class="ev-pv"><b>${esc(LV[l])} — ${esc(p.title)}</b>${b === "young" ? '<p class="mut">يملؤها ولي الأمر بالملاحظة؛ لا تقييم ذاتي للطفل.</p>' : ""}${list.map((c) => `<div class="ev-row">${esc(c[field])}<div class="st">${Object.values(LAB).map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>`).join("")}${q ? `<p><b>السؤال:</b> ${esc(q)}</p>` : ""}<p class="mut">ثم: ملاحظة اختيارية · حفظ التقييم · العودة إلى المشروع · إكمال المشروع.</p></div>`; }).join("") + ((e.msgs.done || e.msgs.help || e.msgs.retry) ? `<div class="ev-pv"><b>رسائل التشجيع</b><p>${["done", "help", "retry"].map((k) => (e.msgs[k] || "").split("\n").filter(Boolean).map((t) => `<span class="bd">${esc(LAB[k])}</span> ${esc(t)}`).join("<br>")).filter(Boolean).join("<br>")}</p></div>` : "");
}
function paint() {
  M.innerHTML = `<style>${CSS}</style><div class="ev"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">مراجعة بسيطة ومشجعة بعد المشروع: ثلاث حالات (أنجزت، أحتاج إلى مساعدة، سأحاول مرة أخرى) بلا درجات ولا مقارنة. تُحفظ إجابات الأطفال على أجهزتهم فقط.</p>${S.ce ? critForm() : S.edit ? evForm() : listHtml()}<div class="ev-acts"><button class="chip" data-go="projadm">المشاريع والتحديات</button><button class="chip" data-go="skillsadm">ربط الأنشطة بالمهارات</button></div></div>`;
  $$("[data-go]", M).forEach((b) => (b.onclick = () => window.__go(b.dataset.go)));
  $$("[data-tab]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.tab; paint(); }));
  const rf = async (fn, args, ok, after) => { const x = await sb.rpc(fn, args); if (x.error) return fail(x.error); await load(); if (after) after(x); paint(); if (ok) toast(ok); };
  const nc = $("#evNewC", M); if (nc) nc.onclick = () => { S.ce = blankC(); paint(); };
  $$("[data-ec]", M).forEach((b) => (b.onclick = () => { const c = crit(b.dataset.ec); S.ce = { id: c.id, std: c.std || "", young: c.young, pre: c.pre, kid: c.kid, skill: c.skill || "", status: c.status }; paint(); }));
  const ne = $("#evNew", M); if (ne) ne.onclick = () => { S.edit = blankE(); S.pv = ""; paint(); };
  $$("[data-e]", M).forEach((b) => (b.onclick = () => { S.edit = fromE(S.d.evals.find((x) => x.id === b.dataset.e)); S.pv = ""; paint(); }));
  if (S.ce) {
    const c = S.ce, grab = () => { c.std = $("#cStd", M).value; c.young = $("#cYoung", M).value; c.pre = $("#cPre", M).value; c.kid = $("#cKid", M).value; c.skill = $("#cSkill", M).value; };
    $("#evCBack", M).onclick = () => { S.ce = null; paint(); };
    const sv = $("#cSave", M); if (sv) sv.onclick = () => { grab(); rf("evalc_save", { p: { id: c.id, std: c.std || null, young: c.young, pre: c.pre, kid: c.kid, skill: c.skill || null } }, "تم الحفظ.", (x) => { const r = crit(x.data || c.id); S.ce = r ? { id: r.id, std: r.std || "", young: r.young, pre: r.pre, kid: r.kid, skill: r.skill || "", status: r.status } : null; }); };
    const pb = $("#cPub", M); if (pb) pb.onclick = () => rf("evalc_status", { p_id: c.id, p_status: "active" }, "نُشر المعيار.", () => { c.status = "active"; });
    const hd = $("#cHide", M); if (hd) hd.onclick = () => rf("evalc_status", { p_id: c.id, p_status: "hidden" }, "أُخفي المعيار.", () => { c.status = "hidden"; });
    const dl = $("#cDel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف هذا المعيار نهائيًا؟ لا يمكن التراجع."))) return; const x = await sb.rpc("evalc_delete", { p_id: c.id }); if (x.error) return fail(x.error); S.ce = null; await load(); paint(); toast("حُذف المعيار."); };
    return;
  }
  if (!S.edit) return;
  const e = S.edit, msgs = (t) => (t || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const grab = () => {
    e.project = $("#eProj", M).value || e.project; e.name = $("#eName", M).value; e.levels = $$("[data-l]:checked", M).map((x) => x.dataset.l);
    e.criteria = $$("[data-cid]", M).filter((r) => $(".cSel", r).checked).map((r) => { const id = r.dataset.cid, old = e.criteria.find((x) => x.id === id); return { id, stage: $(".cStage", r) ? $(".cStage", r).value : (old ? old.stage : ""), skill: $(".cSk", r) ? $(".cSk", r).value : (old ? old.skill : "") }; });
    $$(".cl", M).forEach((i) => (e.closing[i.dataset.b] = i.value)); e.msgs.done = $("#mDone", M).value; e.msgs.help = $("#mHelp", M).value; e.msgs.retry = $("#mRetry", M).value;
  };
  $("#evBack", M).onclick = () => { S.edit = null; paint(); };
  $("#eProj", M).onchange = () => { grab(); const p = prj(e.project); e.levels = p ? e.levels.filter((l) => (p.levels || []).includes(l)) : []; e.criteria = e.criteria.map((c) => ({ id: c.id, stage: "", skill: c.skill })); paint(); };
  $$("[data-l]", M).forEach((c) => (c.onchange = () => { grab(); paint(); }));
  $$(".cSel", M).forEach((c) => (c.onchange = () => { grab(); paint(); }));
  $("#evPv", M).onclick = () => { grab(); S.pv = preview(); $("#evPvBox", M).innerHTML = S.pv; };
  const body = () => ({ id: e.id, project: e.project, name: e.name, levels: e.levels, criteria: e.criteria.map((c) => ({ id: c.id, stage: c.stage || "", skill: c.skill || "" })), closing: Object.fromEntries(Object.entries(e.closing).filter(([, v]) => (v || "").trim()).map(([k, v]) => [k, v.trim()])), msgs: { done: msgs(e.msgs.done), help: msgs(e.msgs.help), retry: msgs(e.msgs.retry) } });
  const sv = $("#evSave", M); if (sv) sv.onclick = () => { grab(); rf("eval_save", { p: body() }, "تم الحفظ.", (x) => { const r = S.d.evals.find((y) => y.id === (x.data || e.id)); S.edit = r ? fromE(r) : null; }); };
  const pb = $("#evPub", M); if (pb) pb.onclick = () => rf("eval_status", { p_id: e.id, p_status: "active" }, "نُشر التقييم.", () => { e.status = "active"; });
  const hd = $("#evHide", M); if (hd) hd.onclick = () => rf("eval_status", { p_id: e.id, p_status: "hidden" }, "أُخفي التقييم.", () => { e.status = "hidden"; });
  const dl = $("#evDel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف هذا التقييم نهائيًا؟ لا يمكن التراجع."))) return; const x = await sb.rpc("eval_delete", { p_id: e.id }); if (x.error) return fail(x.error); S.edit = null; await load(); paint(); toast("حُذف التقييم."); };
}
window.__evalAdmTest = { S, preview };
})();
