/* مركز المهام اليومية (إدارة): مجموعة مهام قصيرة (1–5) لعمر/صف ومهارة واحدة، كل مهمة تربط مورد مكتبة منشورًا مرتبطًا بتلك المهارة، مع نوع النشاط ومدة اختيارية وتاريخ عرض اختياري.
   القواعد (النطاق، الأعمار ضمن المهارة، موارد منشورة ومرتبطة بالمهارة، لا تكرار، لغة داعمة) في قاعدة البيانات. النشر للمراجع فقط. لا نُنشئ موارد جديدة هنا. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SCOPE = Object.keys(LV);
const CAT = { arabic: "اللغة العربية", math: "الرياضيات", think: "الملاحظة والتفكير", life: "المهارات الحياتية", create: "الإبداع" };
const KIND = { interactive: "نشاط تفاعلي", worksheet: "ورقة عمل", card: "بطاقة تعليمية", story: "قصة قصيرة", game: "لعبة تعليمية", home: "نشاط منزلي", think: "ملاحظة وتفكير" };
const STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.dt *{box-sizing:border-box}.dt-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.dt-row b{display:block;margin-bottom:4px}.dt label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.dt select,.dt textarea,.dt input[type=text],.dt input[type=number],.dt input[type=date]{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:40px;background:#fff}.dt textarea{min-height:56px}.dt .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.dt .bd.ok{background:#dff6e7;color:#17683a}.dt .ck{flex-direction:row;align-items:center;gap:6px}.dt-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}`;
const S = { me: { roles: [] }, sk: [], sl: [], it: new Map(), rows: [], edit: null };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const nm = (id) => (S.sk.find((s) => s.id === id) || { name: "؟" }).name;
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
async function load() {
  const [s, l, r] = await Promise.all([sb.from("skills").select("id,slug,domain,name,levels,status,sort").eq("status", "active").order("sort", { ascending: true }), sb.from("skill_links").select("skill_id,item_key"), sb.rpc("dtask_admin")]);
  S.sk = s.data || []; S.sl = l.data || []; if (r.error) { fail(r.error); S.rows = []; } else S.rows = r.data || [];
  let all = [], from = 0; for (;;) { const x = await sb.from("quality_items").select("key,title,levels,status,gone").eq("gone", false).range(from, from + 999); const a = x.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
SUB.dtasksadm = { title: "مركز المهام اليومية", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.edit = null; paint();
} };
const blank = () => ({ id: null, title: "", descr: "", cat: "arabic", skill: "", levels: [], est: "", from: "", to: "", tasks: [{ t: "", d: "", kind: "interactive", item: "", min: "" }], status: "" });
const fromRow = (r) => ({ id: r.id, title: r.title, descr: r.descr || "", cat: r.cat, skill: r.skill, levels: r.levels || [], est: r.est || "", from: r.from || "", to: r.to || "", tasks: (r.tasks || []).map((t) => ({ t: t.t, d: t.d || "", kind: t.kind, item: t.item, min: t.min || "" })), status: r.status });
function listHtml() {
  return `${canEdit() ? '<button class="chip" id="dtNew">+ مجموعة مهام جديدة</button>' : ""}${S.rows.map((r) => `<div class="dt-row"><b>${esc(r.title)}</b><span class="bd">${esc(CAT[r.cat])}</span> <span class="bd ${r.status === "active" ? "ok" : ""}">${esc(STS[r.status])}</span> <span class="bd">${AD((r.tasks || []).length)} مهام</span><div class="mut">${esc(nm(r.skill))}${r.from || r.to ? " · " + esc(r.from || "") + " ← " + esc(r.to || "") : ""}</div><button class="chip" data-e="${esc(r.id)}">تحرير</button></div>`).join("") || '<p class="mut">لا توجد مجموعات مهام بعد. لا تُنشأ مهام تلقائيًا.</p>'}`;
}
function formHtml() {
  const e = S.edit, mk = S.sk.find((x) => x.id === e.skill), lvs = mk ? SCOPE.filter((l) => mk.levels.includes(l)) : [];
  const keys = [...new Set(S.sl.filter((x) => x.skill_id === e.skill).map((x) => x.item_key))].filter((k) => { const i = S.it.get(k); return i && i.status === "published" && (i.levels || []).some((l) => e.levels.includes(l)); });
  const taskRow = (t, i) => `<div class="dt-row" data-i="${i}"><b>مهمة ${AD(i + 1)}</b>
   <label>عنوان المهمة<input type="text" class="tT" maxlength="80" value="${esc(t.t)}"></label>
   <label>وصف قصير (اختياري)<input type="text" class="tD" maxlength="160" value="${esc(t.d)}"></label>
   <label>نوع النشاط<select class="tK">${Object.entries(KIND).map(([k, v]) => `<option value="${k}"${t.kind === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
   <label>المورد (منشور ومرتبط بالمهارة)<select class="tI"><option value="">اختر</option>${keys.map((k) => `<option value="${esc(k)}"${t.item === k ? " selected" : ""}>${esc(itT(k))}</option>`).join("")}</select></label>
   <label>مدة تقريبية بالدقائق (اختياري)<input type="number" class="tM" min="1" max="20" value="${esc(t.min)}"></label>
   <div class="dt-acts"><button class="chip" data-up="${i}">↑</button><button class="chip" data-dn="${i}">↓</button><button class="chip" data-rm="${i}">حذف المهمة</button></div></div>`;
  return `<button class="chip" id="dtBack">← كل المجموعات</button><h3>${e.id ? "تحرير مجموعة مهام" : "مجموعة مهام جديدة"}</h3>
  <label>عنوان المجموعة<input type="text" id="dtTitle" maxlength="80" value="${esc(e.title)}"></label>
  <label>وصف مختصر (اختياري)<textarea id="dtDescr" maxlength="200">${esc(e.descr)}</textarea></label>
  <label>نوع المجموعة<select id="dtCat">${Object.entries(CAT).map(([k, v]) => `<option value="${k}"${e.cat === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
  <label>المهارة المستهدفة<select id="dtSkill"><option value="">اختر</option>${S.sk.map((s) => `<option value="${esc(s.id)}"${s.id === e.skill ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
  <div class="dt-row"><b>الأعمار والصفوف (ضمن المهارة)</b>${lvs.length ? lvs.map((l) => `<label class="ck"><input type="checkbox" data-l="${l}"${e.levels.includes(l) ? " checked" : ""}> ${LV[l]}</label>`).join("") : '<span class="mut">اختر المهارة أولًا.</span>'}</div>
  <label>مدة المجموعة التقريبية بالدقائق (اختياري)<input type="number" id="dtEst" min="1" max="30" value="${esc(e.est)}"></label>
  <label>تاريخ بدء العرض (اختياري)<input type="date" id="dtFrom" value="${esc(e.from)}"></label>
  <label>تاريخ نهاية العرض (اختياري)<input type="date" id="dtTo" value="${esc(e.to)}"></label>
  <h4>المهام (من 1 إلى 5)</h4>${e.tasks.map(taskRow).join("")}${e.tasks.length < 5 ? '<button class="chip" id="dtAdd">+ إضافة مهمة</button>' : ""}
  <p class="mut">الحالة: ${esc(STS[e.status] || "جديد")}. ${e.status === "active" ? "ظاهرة للزوار." : "غير ظاهرة للزوار حتى يُنشرها مراجع."} المعاينة: بعد النشر تظهر في صفحة /tasks/.</p>
  <div class="dt-acts">${canEdit() ? '<button class="chip" id="dtSave">حفظ</button>' : ""}${e.id && canRev() ? `${e.status !== "active" ? '<button class="chip" id="dtPub">نشر</button>' : '<button class="chip" id="dtHide">إخفاء</button>'}<button class="chip" id="dtDel">حذف</button>` : ""}</div>`;
}
function paint() {
  M.innerHTML = `<style>${CSS}</style><div class="dt"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">المهام اقتراحات قصيرة وليست واجبات. كل مهمة تفتح مورد مكتبة حقيقيًا منشورًا ومرتبطًا بالمهارة. اكتب بلغة داعمة.</p>${S.edit ? formHtml() : listHtml()}<div class="dt-acts"><button class="chip" data-go="skillsadm">ربط الأنشطة بالمهارات</button><button class="chip" data-go="dailyadm">المواقف اليومية</button><button class="chip" data-go="integadm">الأنشطة الشاملة</button><button class="chip" data-go="reviewadm">مراجعة المهارات</button></div></div>`;
  $$("[data-go]", M).forEach((b) => (b.onclick = () => window.__go(b.dataset.go)));
  const nw = $("#dtNew", M); if (nw) nw.onclick = () => { S.edit = blank(); paint(); };
  $$("[data-e]", M).forEach((b) => (b.onclick = () => { S.edit = fromRow(S.rows.find((x) => x.id === b.dataset.e)); paint(); }));
  if (!S.edit) return;
  const e = S.edit, grab = () => { e.title = $("#dtTitle", M).value; e.descr = $("#dtDescr", M).value; e.cat = $("#dtCat", M).value; e.skill = $("#dtSkill", M).value; e.levels = $$("[data-l]:checked", M).map((x) => x.dataset.l); e.est = $("#dtEst", M).value; e.from = $("#dtFrom", M).value; e.to = $("#dtTo", M).value; e.tasks = $$("[data-i]", M).map((r) => ({ t: $(".tT", r).value, d: $(".tD", r).value, kind: $(".tK", r).value, item: $(".tI", r).value, min: $(".tM", r).value })); };
  $("#dtBack", M).onclick = () => { S.edit = null; paint(); };
  $("#dtSkill", M).onchange = () => { grab(); const mk = S.sk.find((x) => x.id === e.skill); e.levels = mk ? e.levels.filter((l) => mk.levels.includes(l)) : []; e.tasks.forEach((t) => (t.item = "")); paint(); };
  $$("[data-l]", M).forEach((c) => (c.onchange = () => { grab(); paint(); }));
  const ad = $("#dtAdd", M); if (ad) ad.onclick = () => { grab(); e.tasks.push({ t: "", d: "", kind: "interactive", item: "", min: "" }); paint(); };
  $$("[data-rm]", M).forEach((b) => (b.onclick = () => { grab(); if (e.tasks.length > 1) e.tasks.splice(+b.dataset.rm, 1); paint(); }));
  const mv = (i, d) => { grab(); const j = i + d; if (j < 0 || j >= e.tasks.length) return; [e.tasks[i], e.tasks[j]] = [e.tasks[j], e.tasks[i]]; paint(); };
  $$("[data-up]", M).forEach((b) => (b.onclick = () => mv(+b.dataset.up, -1)));
  $$("[data-dn]", M).forEach((b) => (b.onclick = () => mv(+b.dataset.dn, 1)));
  const rf = async (fn, args, ok, after) => { const x = await sb.rpc(fn, args); if (x.error) return fail(x.error); await load(); if (after) after(x); paint(); if (ok) toast(ok); };
  const sv = $("#dtSave", M); if (sv) sv.onclick = () => { grab(); rf("dtask_save", { p: { id: e.id, title: e.title, descr: e.descr, cat: e.cat, skill: e.skill || null, levels: e.levels, est: e.est ? +e.est : null, from: e.from || null, to: e.to || null, tasks: e.tasks.map((t) => ({ t: t.t, d: t.d, kind: t.kind, item: t.item, min: t.min ? +t.min : null })) } }, "تم الحفظ.", (x) => { const r = S.rows.find((y) => y.id === (x.data || e.id)); S.edit = r ? fromRow(r) : null; }); };
  const pb = $("#dtPub", M); if (pb) pb.onclick = () => rf("dtask_status", { p_id: e.id, p_status: "active" }, "نُشرت المجموعة.", () => { e.status = "active"; });
  const hd = $("#dtHide", M); if (hd) hd.onclick = () => rf("dtask_status", { p_id: e.id, p_status: "hidden" }, "أُخفيت المجموعة.", () => { e.status = "hidden"; });
  const dl = $("#dtDel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف هذه المجموعة نهائيًا؟ لا يمكن التراجع."))) return; const x = await sb.rpc("dtask_delete", { p_id: e.id }); if (x.error) return fail(x.error); S.edit = null; await load(); paint(); toast("حُذفت المجموعة."); };
}
window.__dtasksAdmTest = { S };
})();
