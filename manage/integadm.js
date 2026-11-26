/* مركز الأنشطة الشاملة (إدارة): نشاط شامل يغلّف مورد تفاعليًا منشورًا (بنك الأنشطة/لعبة/ورقة…) ويحدّد مهارته الأساسية والمهارات المرتبطة والهدف والتعليمات والخطوات وطريقة التفاعل.
   القواعد (مهارتان على الأقل، أعمار ضمن المهارة الأساسية ومن سنتين إلى الصف الرابع، مورد منشور مرتبط بإحدى المهارات، لغة داعمة) في قاعدة البيانات. النشر للمراجع فقط ويتطلب علاقة منشورة في «الربط بين المهارات» بين الأساسية وكل إضافية.
   لا ننشئ أنشطة تفاعلية جديدة هنا: الصور والصوت والتفاعل من المورد نفسه، وإنشاؤه يتم في مراكز المحتوى (اختصار). */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SCOPE = Object.keys(LV);
const KIND = { langmath: "اللغة والرياضيات", observe: "الملاحظة والتصنيف", story: "القصة والتفكير", sciencelang: "العلوم واللغة", life: "المهارات الحياتية" };
const STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.ig *{box-sizing:border-box}.ig-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.ig-row b{display:block;margin-bottom:4px}.ig label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.ig select,.ig textarea,.ig input[type=text]{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:40px;background:#fff}.ig textarea{min-height:64px}.ig .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.ig .bd.ok{background:#dff6e7;color:#17683a}.ig .bd.bad{background:#ffe3e0;color:#9a1d12}.ig .ck{flex-direction:row;align-items:center;gap:6px}.ig-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}`;
const S = { me: { roles: [] }, sk: [], sl: [], it: new Map(), rows: [], edit: null };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const nm = (id) => (S.sk.find((s) => s.id === id) || { name: "؟" }).name;
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
async function load() {
  const [s, l, r] = await Promise.all([sb.from("skills").select("id,slug,domain,name,levels,status,sort").eq("status", "active").order("sort", { ascending: true }), sb.from("skill_links").select("skill_id,item_key"), sb.rpc("integ_admin")]);
  S.sk = s.data || []; S.sl = l.data || []; if (r.error) { fail(r.error); S.rows = []; } else S.rows = r.data || [];
  let all = [], from = 0; for (;;) { const x = await sb.from("quality_items").select("key,title,levels,status,gone").eq("gone", false).range(from, from + 999); const a = x.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
SUB.integadm = { title: "مركز الأنشطة الشاملة", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.edit = null; paint();
} };
const blank = () => ({ id: null, name: "", kind: "langmath", item: "", main: "", extra: [], levels: [], goal: "", tools: "", instr: "", steps: [], inter: "", feedback: "", extra_key: "", status: "", missing: [] });
const fromRow = (r) => ({ id: r.id, name: r.name, kind: r.kind, item: r.item, main: r.main, extra: r.extra || [], levels: r.levels || [], goal: r.goal, tools: r.tools || "", instr: r.instr, steps: r.steps || [], inter: r.inter || "", feedback: r.feedback || "", extra_key: r.extra_key || "", status: r.status, missing: r.missing || [] });
function listHtml() {
  return `${canEdit() ? '<button class="chip" id="igNew">+ نشاط شامل جديد</button>' : ""}${S.rows.map((r) => `<div class="ig-row"><b>${esc(r.name)}</b><span class="bd">${esc(KIND[r.kind])}</span> <span class="bd ${r.status === "active" ? "ok" : ""}">${esc(STS[r.status])}</span> <span class="bd">${AD(1 + (r.extra || []).length)} مهارات</span>${(r.missing || []).length ? ' <span class="bd bad">ينقصه ربط منشور بين المهارات</span>' : ""}<div class="mut">${esc(nm(r.main))}${(r.extra || []).map((x) => " + " + esc(nm(x))).join("")}</div><button class="chip" data-e="${esc(r.id)}">تحرير</button></div>`).join("") || '<p class="mut">لا توجد أنشطة شاملة بعد. لا تُنشأ أنشطة تلقائيًا.</p>'}`;
}
function formHtml() {
  const e = S.edit, mk = S.sk.find((x) => x.id === e.main), ids = [e.main, ...e.extra].filter(Boolean);
  const lvs = mk ? SCOPE.filter((l) => mk.levels.includes(l)) : [];
  const keys = [...new Set(S.sl.filter((x) => ids.includes(x.skill_id)).map((x) => x.item_key))].filter((k) => { const i = S.it.get(k); return i && i.status === "published" && (i.levels || []).some((l) => e.levels.includes(l)); });
  const allKeys = [...S.it.values()].filter((i) => i.status === "published" && (i.levels || []).some((l) => e.levels.includes(l))).map((i) => i.key);
  const so = (v) => S.sk.map((s) => `<option value="${esc(s.id)}"${s.id === v ? " selected" : ""}>${esc(s.name)}</option>`).join("");
  return `<button class="chip" id="igBack">← كل الأنشطة</button><h3>${e.id ? "تحرير نشاط شامل" : "نشاط شامل جديد"}</h3>
  <label>اسم النشاط<input type="text" id="igName" maxlength="80" value="${esc(e.name)}"></label>
  <label>النوع<select id="igKind">${Object.entries(KIND).map(([k, t]) => `<option value="${k}"${e.kind === k ? " selected" : ""}>${t}</option>`).join("")}</select></label>
  <label>المهارة الأساسية<select id="igMain"><option value="">اختر</option>${so(e.main)}</select></label>
  <div class="ig-row"><b>المهارات الإضافية المرتبطة (واحدة على الأقل، حتى أربع)</b>${S.sk.filter((s) => s.id !== e.main).map((s) => `<label class="ck"><input type="checkbox" data-x="${esc(s.id)}"${e.extra.includes(s.id) ? " checked" : ""}> ${esc(s.name)}</label>`).join("") || '<span class="mut">اختر المهارة الأساسية أولًا.</span>'}</div>
  ${e.missing.length ? `<p><span class="bd bad">لا علاقة منشورة بين الأساسية و: ${e.missing.map((x) => esc(nm(x))).join("، ")}</span> <button class="chip" data-go="relsadm">فتح «الربط بين المهارات»</button></p>` : ""}
  <div class="ig-row"><b>الأعمار والصفوف (ضمن المهارة الأساسية)</b>${lvs.length ? lvs.map((l) => `<label class="ck"><input type="checkbox" data-l="${l}"${e.levels.includes(l) ? " checked" : ""}> ${LV[l]}</label>`).join("") : '<span class="mut">اختر المهارة الأساسية أولًا.</span>'}</div>
  <label>المورد التفاعلي الذي يبدأ منه الطفل (منشور ومرتبط بإحدى المهارات)<select id="igItem"><option value="">اختر</option>${keys.map((k) => `<option value="${esc(k)}"${e.item === k ? " selected" : ""}>${esc(itT(k))}</option>`).join("")}</select></label>
  <label>الهدف التعليمي<textarea id="igGoal" maxlength="240">${esc(e.goal)}</textarea></label>
  <label>الأدوات أو الموارد المطلوبة (اختياري)<input type="text" id="igTools" maxlength="200" value="${esc(e.tools)}"></label>
  <label>التعليمات<textarea id="igInstr" maxlength="400">${esc(e.instr)}</textarea></label>
  <label>خطوات النشاط (خطوة في كل سطر، حتى ثماني)<textarea id="igSteps">${esc(e.steps.join("\n"))}</textarea></label>
  <label>طريقة التفاعل (اختياري)<input type="text" id="igInter" maxlength="160" value="${esc(e.inter)}"></label>
  <label>التغذية الراجعة (اختياري)<textarea id="igFb" maxlength="240">${esc(e.feedback)}</textarea></label>
  <label>نشاط إضافي بعد الانتهاء (اختياري)<select id="igExtra"><option value="">— لا —</option>${allKeys.map((k) => `<option value="${esc(k)}"${e.extra_key === k ? " selected" : ""}>${esc(itT(k))}</option>`).join("")}</select></label>
  <p class="mut">الحالة: ${esc(STS[e.status] || "جديد")}. ${e.status === "active" ? "ظاهر للزوار." : "غير ظاهر للزوار حتى يُنشره مراجع."}</p>
  <div class="ig-acts">${canEdit() ? '<button class="chip" id="igSave">حفظ</button>' : ""}${e.id && canRev() ? `${e.status !== "active" ? '<button class="chip" id="igPub">نشر</button>' : '<button class="chip" id="igHide">إخفاء</button>'}<button class="chip" id="igDel">حذف</button>` : ""}</div>`;
}
function paint() {
  M.innerHTML = `<style>${CSS}</style><div class="ig"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">لا تجمع المهارات عشوائيًا: يلزم أن تكون بينها علاقة منشورة في «الربط بين المهارات». اكتب بلغة داعمة.</p>${S.edit ? formHtml() : listHtml()}<div class="ig-acts"><button class="chip" data-go="relsadm">الربط بين المهارات</button><button class="chip" data-go="bankadm">بنك الأنشطة</button><button class="chip" data-go="skillsadm">ربط الأنشطة بالمهارات</button></div></div>`;
  $$("[data-go]", M).forEach((b) => (b.onclick = () => window.__go(b.dataset.go)));
  const nw = $("#igNew", M); if (nw) nw.onclick = () => { S.edit = blank(); paint(); };
  $$("[data-e]", M).forEach((b) => (b.onclick = () => { S.edit = fromRow(S.rows.find((x) => x.id === b.dataset.e)); paint(); }));
  if (!S.edit) return;
  const e = S.edit, grab = () => { e.name = $("#igName", M).value; e.kind = $("#igKind", M).value; e.main = $("#igMain", M).value; e.extra = $$("[data-x]:checked", M).map((x) => x.dataset.x); e.levels = $$("[data-l]:checked", M).map((x) => x.dataset.l); e.item = $("#igItem", M).value; e.goal = $("#igGoal", M).value; e.tools = $("#igTools", M).value; e.instr = $("#igInstr", M).value; e.steps = $("#igSteps", M).value.split("\n").map((x) => x.trim()).filter(Boolean); e.inter = $("#igInter", M).value; e.feedback = $("#igFb", M).value; e.extra_key = $("#igExtra", M).value; };
  $("#igBack", M).onclick = () => { S.edit = null; paint(); };
  $("#igMain", M).onchange = () => { grab(); const mk = S.sk.find((x) => x.id === e.main); e.extra = e.extra.filter((x) => x !== e.main); if (mk) e.levels = e.levels.filter((l) => mk.levels.includes(l)); paint(); };
  $$("[data-x],[data-l]", M).forEach((c) => (c.onchange = () => { grab(); paint(); }));
  const rf = async (fn, args, ok, after) => { const x = await sb.rpc(fn, args); if (x.error) return fail(x.error); await load(); if (after) after(x); paint(); if (ok) toast(ok); };
  const sv = $("#igSave", M); if (sv) sv.onclick = () => { grab(); rf("integ_save", { p: { id: e.id, name: e.name, kind: e.kind, item: e.item, main: e.main || null, extra: e.extra, levels: e.levels, goal: e.goal, tools: e.tools, instr: e.instr, steps: e.steps, inter: e.inter, feedback: e.feedback, extra_key: e.extra_key } }, "تم الحفظ.", (x) => { const r = S.rows.find((y) => y.id === (x.data || e.id)); S.edit = r ? fromRow(r) : null; }); };
  const pb = $("#igPub", M); if (pb) pb.onclick = () => rf("integ_status", { p_id: e.id, p_status: "active" }, "نُشر النشاط.", () => { e.status = "active"; });
  const hd = $("#igHide", M); if (hd) hd.onclick = () => rf("integ_status", { p_id: e.id, p_status: "hidden" }, "أُخفي النشاط.", () => { e.status = "hidden"; });
  const dl = $("#igDel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف هذا النشاط الشامل نهائيًا؟ لا يمكن التراجع."))) return; const x = await sb.rpc("integ_delete", { p_id: e.id }); if (x.error) return fail(x.error); S.edit = null; await load(); paint(); toast("حُذف النشاط."); };
}
window.__integAdmTest = { S };
})();
