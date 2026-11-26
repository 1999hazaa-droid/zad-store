/* مركز الربط بين المهارات (إدارة): علاقات يحدّدها المحرر بين مهارتين (أساسية/داخل المادة/بين المواد/يومية) مع شرح مبسط وأعمار وموارد ونشاط رابط واحد.
   القواعد (مهارتان منشورتان، عمر ضمن المهارتين ومن سنتين إلى الصف الرابع، موارد منشورة ومرتبطة بإحدى المهارتين، لا علاقة ذاتية، لا دوائر في الأساسية/داخل المادة، لغة داعمة)
   مفروضة في قاعدة البيانات. النشر والإخفاء والحذف للمراجع فقط، وتعديل علاقة منشورة بيد محرر يعيدها مسودة. لا علاقات تُنشأ تلقائيًا. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const KIND = { base: "مهارة أساسية ← مرتبطة بها", within: "داخل المادة نفسها", cross: "بين المواد", daily: "مع الحياة اليومية" };
const STS = { draft: "مسودة", active: "منشورة", hidden: "مخفية" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.rl *{box-sizing:border-box}.rl-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.rl-row b{display:block;margin-bottom:4px}.rl label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.rl select,.rl textarea{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:40px;background:#fff}.rl textarea{min-height:64px}.rl .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.rl .bd.ok{background:#dff6e7;color:#17683a}.rl .ck{flex-direction:row;align-items:center;gap:6px}.rl-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}`;
const S = { me: { roles: [] }, sk: [], sl: [], it: new Map(), rels: [], edit: null };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const nm = (id) => (S.sk.find((s) => s.id === id) || { name: "؟" }).name;
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
const SCOPE = ["a2", "a3", "a4", "a5", "a6", "g1", "g2", "g3", "g4"];
async function load() {
  const [s, l, r] = await Promise.all([sb.from("skills").select("id,slug,domain,name,levels,status,sort").eq("status", "active").order("sort", { ascending: true }), sb.from("skill_links").select("skill_id,item_key"), sb.rpc("rel_admin")]);
  S.sk = s.data || []; S.sl = l.data || []; if (r.error) { fail(r.error); S.rels = []; } else S.rels = r.data || [];
  let all = [], from = 0; for (;;) { const x = await sb.from("quality_items").select("key,title,levels,status,gone").eq("gone", false).range(from, from + 999); const a = x.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
SUB.relsadm = { title: "مركز الربط بين المهارات", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.edit = null; paint();
} };
function listHtml() {
  return `${canEdit() ? '<button class="chip" id="rlNew">+ علاقة جديدة</button>' : ""}${S.rels.map((r) => `<div class="rl-row"><b>${esc(nm(r.from))} ← ${esc(nm(r.to))}</b><span class="bd">${esc(KIND[r.kind])}</span> <span class="bd ${r.status === "active" ? "ok" : ""}">${esc(STS[r.status])}</span> <span class="bd">${AD((r.items || []).length)} موارد</span><div class="mut">${esc(r.expl)}</div><button class="chip" data-e="${esc(r.id)}">تحرير</button></div>`).join("") || '<p class="mut">لا توجد علاقات بعد. لا تُنشأ علاقات تلقائيًا.</p>'}`;
}
function formHtml() {
  const e = S.edit, a = S.sk.find((x) => x.id === e.from), b = S.sk.find((x) => x.id === e.to);
  const both = a && b ? SCOPE.filter((l) => a.levels.includes(l) && b.levels.includes(l)) : [];
  const keys = a && b ? [...new Set(S.sl.filter((x) => x.skill_id === a.id || x.skill_id === b.id).map((x) => x.item_key))].filter((k) => { const i = S.it.get(k); return i && i.status === "published" && (i.levels || []).some((l) => e.levels.includes(l)); }) : [];
  const so = (v) => S.sk.map((s) => `<option value="${esc(s.id)}"${s.id === v ? " selected" : ""}>${esc(s.name)}</option>`).join("");
  return `<button class="chip" id="rlBack">← كل العلاقات</button><h3>${e.id ? "تحرير علاقة" : "علاقة جديدة"}</h3>
  <label>من المهارة (الأساسية أو السابقة)<select id="rlFrom"><option value="">اختر</option>${so(e.from)}</select></label>
  <label>إلى المهارة (المرتبطة أو اللاحقة)<select id="rlTo"><option value="">اختر</option>${so(e.to)}</select></label>
  <label>نوع العلاقة<select id="rlKind">${Object.entries(KIND).map(([k, t]) => `<option value="${k}"${e.kind === k ? " selected" : ""}>${t}</option>`).join("")}</select></label>
  <label>شرح مبسط للعلاقة (بلغة الطفل وولي الأمر، حتى 240 حرفًا)<textarea id="rlExpl" maxlength="240">${esc(e.expl)}</textarea></label>
  <div class="rl-row"><b>الأعمار والصفوف (ضمن عمر المهارتين)</b>${both.length ? both.map((l) => `<label class="ck"><input type="checkbox" data-l="${l}"${e.levels.includes(l) ? " checked" : ""}> ${LV[l]}</label>`).join("") : '<span class="mut">اختر المهارتين أولًا.</span>'}</div>
  <div class="rl-row"><b>الموارد (من أنشطة المهارتين المنشورة، حتى ستة) ونشاط رابط واحد</b>${keys.length ? keys.map((k) => { const it = e.items.find((x) => x.k === k); return `<label class="ck"><input type="checkbox" data-k="${esc(k)}"${it ? " checked" : ""}> ${esc(itT(k))} <label class="ck"><input type="radio" name="rlBr" data-b="${esc(k)}"${it && it.bridge ? " checked" : ""}> رابط</label></label>`; }).join("") : '<span class="mut">اختر المهارتين والأعمار لتظهر الموارد المتاحة. اربط الأنشطة بالمهارات من «مركز المهارات».</span>'}</div>
  <p class="mut">الحالة: ${esc(STS[e.status] || "جديدة")}. ${e.status === "active" ? "ظاهرة للزوار." : "غير ظاهرة للزوار حتى يُنشرها مراجع."}</p>
  <div class="rl-acts">${canEdit() ? '<button class="chip" id="rlSave">حفظ</button>' : ""}${e.id && canRev() ? `${e.status !== "active" ? '<button class="chip" id="rlPub">نشر</button>' : '<button class="chip" id="rlHide">إخفاء</button>'}<button class="chip" id="rlDel">حذف</button>` : ""}</div>`;
}
function paint() {
  M.innerHTML = `<style>${CSS}</style><div class="rl"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">علاقة بين مهارتين مع شرح مبسط ونشاط رابط. لا تضف علاقة إلا إذا كانت مفيدة تربويًا. اكتب بلغة داعمة.</p>${S.edit ? formHtml() : listHtml()}<div class="rl-acts"><button class="chip" data-go="skillsadm">ربط الأنشطة بالمهارات</button><button class="chip" data-go="reviewadm">مراجعة المهارات</button></div></div>`;
  $$("[data-go]", M).forEach((b) => (b.onclick = () => window.__go(b.dataset.go)));
  const nw = $("#rlNew", M); if (nw) nw.onclick = () => { S.edit = { id: null, from: "", to: "", kind: "base", expl: "", levels: [], items: [], status: "" }; paint(); };
  $$("[data-e]", M).forEach((b) => (b.onclick = () => { const r = S.rels.find((x) => x.id === b.dataset.e); S.edit = JSON.parse(JSON.stringify({ id: r.id, from: r.from, to: r.to, kind: r.kind, expl: r.expl, levels: r.levels, items: r.items, status: r.status })); paint(); }));
  if (!S.edit) return;
  const e = S.edit, grab = () => { e.from = $("#rlFrom", M).value; e.to = $("#rlTo", M).value; e.kind = $("#rlKind", M).value; e.expl = $("#rlExpl", M).value; e.levels = $$("[data-l]:checked", M).map((x) => x.dataset.l); const br = ($("[data-b]:checked", M) || {}).dataset; e.items = $$("[data-k]:checked", M).map((x) => ({ k: x.dataset.k, bridge: !!br && br.b === x.dataset.k })); };
  $("#rlBack", M).onclick = () => { S.edit = null; paint(); };
  ["#rlFrom", "#rlTo"].forEach((q) => ($(q, M).onchange = () => { grab(); const a = S.sk.find((x) => x.id === e.from), b = S.sk.find((x) => x.id === e.to); if (a && b) e.levels = e.levels.filter((l) => a.levels.includes(l) && b.levels.includes(l)); paint(); }));
  $$("[data-l]", M).forEach((c) => (c.onchange = () => { grab(); paint(); }));
  const rf = async (fn, args, ok, after) => { const x = await sb.rpc(fn, args); if (x.error) return fail(x.error); await load(); if (after) after(x); paint(); if (ok) toast(ok); };
  const sv = $("#rlSave", M); if (sv) sv.onclick = () => { grab(); rf("rel_save", { p_id: e.id, p_from: e.from || null, p_to: e.to || null, p_kind: e.kind, p_expl: e.expl, p_levels: e.levels, p_items: e.items }, "تم الحفظ.", (x) => { const id = x.data || e.id; const r = S.rels.find((y) => y.id === id); S.edit = r ? JSON.parse(JSON.stringify({ id: r.id, from: r.from, to: r.to, kind: r.kind, expl: r.expl, levels: r.levels, items: r.items, status: r.status })) : null; }); };
  const pb = $("#rlPub", M); if (pb) pb.onclick = () => rf("rel_status", { p_id: e.id, p_status: "active" }, "نُشرت العلاقة.", () => { e.status = "active"; });
  const hd = $("#rlHide", M); if (hd) hd.onclick = () => rf("rel_status", { p_id: e.id, p_status: "hidden" }, "أُخفيت العلاقة.", () => { e.status = "hidden"; });
  const dl = $("#rlDel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف هذه العلاقة نهائيًا؟ لا يمكن التراجع."))) return; const x = await sb.rpc("rel_delete", { p_id: e.id }); if (x.error) return fail(x.error); S.edit = null; await load(); paint(); toast("حُذفت العلاقة."); };
}
window.__relsAdmTest = { S };
})();
