/* مركز الأهداف التعليمية ومخرجات التعلم (إدارة). القواعد (فعل قابل للملاحظة، منع المبالغة والتكرار، عمر الهدف ضمن عمر مهارته، ربط الموارد المرتبطة بمهارة الهدف فقط،
   ألا يُنشر هدف إلا مراجع تعليمي، وتعليم الروابط للمراجعة عند تغيّر الهدف) مفروضة في قاعدة البيانات لا في هذه الواجهة. النطاق: من سنة إلى 6 سنوات والصفوف 1–4. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const STG = { recognize: "تعرّف", practice: "تدرّب", apply: "طبّق", review: "راجع" };
const TYPE = { lib: "ملف المكتبة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "تربية وقيم", exp: "استكشاف", vid: "فيديو", songs: "أنشودة", stories: "قصة", quiz: "اختبار", pack: "حزمة" };
const PROB = { dup: "تكرار", verb: "صياغة غير قابلة للملاحظة", outcome: "بلا مخرجات", boast: "ادعاء مبالغ فيه", level: "عمر خارج المهارة", skillhidden: "مهارة مخفية", gone: "مورد محذوف", levelres: "عمر المورد لا يتقاطع", skillmiss: "المورد خارج مهارة الهدف", unpub: "مورد غير منشور", nolink: "بلا موارد" };
const STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const GD = ["arabic", "math", "science", "life", "cognitive"];
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.gl *{box-sizing:border-box}.gl-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.gl-tabs .chip.on{background:#6b3fd4;color:#fff}
.gl-dom{margin:14px 0 6px;font-weight:800;color:#4b2aa5}.gl-row{display:flex;flex-wrap:wrap;gap:8px;align-items:center;background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:8px 10px;margin:6px 0}
.gl-row b{flex:1;min-width:160px}.gl-row .mut{font-size:12px}.gl-bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.gl-bd.bad{background:#ffe3e0;color:#9a1d12}.gl-bd.ok{background:#dff6e7;color:#17683a}.gl-bd.warn{background:#fff0d1;color:#8a5200}
.gl-form{background:#faf7ff;border:1px solid #e4d9ff;border-radius:16px;padding:12px;display:flex;flex-direction:column;gap:8px;margin:10px 0}.gl-form label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px}
.gl-form input[type=text],.gl-form textarea,.gl-form select,.gl-q input,.gl-q select,.gl-row select{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:38px;background:#fff}.gl-lvs{display:flex;flex-wrap:wrap;gap:8px}.gl-lvs label{flex-direction:row;align-items:center;gap:4px;font-weight:600}
.gl-q{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}.gl-q input{flex:1;min-width:160px}.gl-msg{font-weight:700;font-size:13px}.gl-msg.bad{color:#b3261e}.gl-msg.ok{color:#17683a}.gl-acts{display:flex;gap:8px;flex-wrap:wrap}.gl-acts .chip.pri{background:#6b3fd4;color:#fff}.gl-acts .chip.bad{background:#c62f4a;color:#fff}`;
const S = { tab: "goals", me: { roles: [] }, dom: [], sk: [], g: [], ln: [], sl: [], it: new Map(), fd: "", fs: "", edit: null, open: null, chk: null, q: "" };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager"), isMgr = () => has("library_manager");
const dn = (s) => (S.dom.find((d) => d.slug === s) || { name: s }).name;
const lvTxt = (l) => (l || []).map((x) => LV[x]).filter(Boolean).join("، ");
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
const skN = (id) => (S.sk.find((s) => s.id === id) || { name: "" }).name;
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
async function loadMe() { const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data; return S.me.roles.length > 0; }
async function load() {
  const [d, s, g, l, sl] = await Promise.all([sb.from("skill_domains").select("*").order("sort", { ascending: true }), sb.from("skills").select("*").order("sort", { ascending: true }), sb.from("goals").select("*").order("sort", { ascending: true }), sb.from("goal_links").select("*").order("ord", { ascending: true }), sb.from("skill_links").select("*")]);
  S.dom = (d.data || []).filter((x) => GD.includes(x.slug)); S.sk = (s.data || []).filter((x) => GD.includes(x.domain)); S.g = g.data || []; S.ln = l.data || []; S.sl = sl.data || [];
  let all = [], from = 0; for (;;) { const r = await sb.from("quality_items").select("key,src,title,levels,status,gone").eq("gone", false).range(from, from + 999); const a = r.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
const linksOf = (id) => S.ln.filter((l) => l.goal_id === id);
SUB.goalsadm = { title: "مركز الأهداف التعليمية", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  if (!(await loadMe())) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى مركز الأهداف.</p>'; return; }
  await load(); S.edit = null; S.open = null; paint();
} };
function shell(inner) {
  return `<style>${CSS}</style><div class="gl"><button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <p class="mut">الهدف يبدأ بفعل قابل للملاحظة، وله مخرجات واضحة غير مبالغ فيها، ولا يُنشر إلا بعد مراجعة تعليمية. فتح المورد أو إكمال نشاط لا يثبت تحقق الهدف.</p>
  <div class="gl-tabs" id="gltabs">${[["goals", "الأهداف"], ["review", "المراجعة والجودة"]].map(([k, l]) => `<button class="chip ${S.tab === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div>${inner}</div>`;
}
function paint() {
  M.innerHTML = shell(S.tab === "goals" ? (S.open ? linksHtml() : S.edit ? formHtml() : listHtml()) : `<p class="mut">جارٍ التحميل…</p>`);
  $$("#gltabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; S.edit = null; if (S.tab === "review") reviewPaint(); else paint(); }));
  if (S.tab === "goals") { if (S.open) bindLinks(); else if (S.edit) bindForm(); else bindList(); }
}
function listHtml() {
  const doms = S.dom.filter((d) => !S.fd || d.slug === S.fd);
  const body = doms.map((d) => {
    const a = S.g.filter((g) => g.domain === d.slug && (!S.fs || g.status === S.fs));
    return `<div class="gl-dom">${esc(d.name)} <span class="mut">(${AD(a.length)})</span></div>` + (a.length ? a.map((g, i) => { const ls = linksOf(g.id), un = ls.filter((l) => !l.reviewed).length; return `<div class="gl-row" data-id="${esc(g.id)}"><b>${esc(g.name)}${g.extra ? ' <span class="gl-bd">مضاف يدويًا</span>' : ""}<br><span class="mut">المهارة: ${esc(skN(g.skill_id))}</span></b><span class="mut">${esc(lvTxt(g.levels))}</span><span class="gl-bd">${AD(ls.length)} مورد</span>${un ? `<span class="gl-bd warn">${AD(un)} غير مراجع</span>` : ""}<span class="gl-bd ${g.status === "active" ? "ok" : g.status === "hidden" ? "bad" : "warn"}">${STS[g.status]}</span>${canEdit() ? `<button class="chip" data-a="up" ${i === 0 ? "disabled" : ""} aria-label="تقديم">▲</button><button class="chip" data-a="down" ${i === a.length - 1 ? "disabled" : ""} aria-label="تأخير">▼</button><button class="chip" data-a="edit">تعديل</button>${g.status === "active" ? '<button class="chip" data-a="hide">إخفاء مؤقت</button>' : g.status === "hidden" ? '<button class="chip" data-a="draft">إرجاع لمسودة</button>' : ""}${canRev() && g.status !== "active" ? '<button class="chip pri" data-a="publish">نشر</button>' : ""}` : ""}<button class="chip pri" data-a="links">الموارد</button></div>`; }).join("") : '<p class="mut">لا أهداف.</p>');
  }).join("");
  return `<div class="gl-q"><select id="glfd"><option value="">كل المجالات</option>${S.dom.map((d) => `<option value="${esc(d.slug)}" ${S.fd === d.slug ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select><select id="glfs"><option value="">كل الحالات</option>${Object.entries(STS).map(([k, t]) => `<option value="${k}" ${S.fs === k ? "selected" : ""}>${t}</option>`).join("")}</select>${canEdit() ? '<button class="chip pri" id="glnew">+ هدف جديد</button>' : ""}</div>${body}`;
}
function bindList() {
  $("#glfd", M).onchange = (e) => { S.fd = e.target.value; paint(); }; $("#glfs", M).onchange = (e) => { S.fs = e.target.value; paint(); };
  const nw = $("#glnew", M); if (nw) nw.onclick = () => { const sk = S.sk.find((s) => !S.fd || s.domain === S.fd) || S.sk[0]; S.edit = { id: null, skill_id: sk ? sk.id : "", name: "", descr: "", levels: [], outcomes: [""], verify: "", tip: "", status: "draft" }; paint(); };
  $$(".gl-row[data-id]", M).forEach((r) => $$("[data-a]", r).forEach((b) => (b.onclick = async () => {
    const id = r.dataset.id, g = S.g.find((x) => x.id === id), a = b.dataset.a;
    if (a === "edit") { S.edit = Object.assign({}, g); paint(); } else if (a === "links") { S.open = id; S.q = ""; paint(); }
    else if (a === "publish" || a === "hide" || a === "draft") { const x = await sb.rpc("goal_status", { p_id: id, p_status: a === "publish" ? "active" : a === "hide" ? "hidden" : "draft" }); if (x.error) return fail(x.error); await load(); paint(); toast(a === "publish" ? "نُشر الهدف." : a === "hide" ? "أُخفي الهدف مؤقتًا." : "أُعيد إلى مسودة."); }
    else { const sib = S.g.filter((x) => x.domain === g.domain && (!S.fs || x.status === S.fs)).map((x) => x.id), i = sib.indexOf(id), j = a === "up" ? i - 1 : i + 1; if (j < 0 || j >= sib.length) return; [sib[i], sib[j]] = [sib[j], sib[i]]; const x = await sb.rpc("goal_order", { p_ids: sib }); if (x.error) return fail(x.error); await load(); paint(); }
  })));
}
function formHtml() {
  const e = S.edit, sk = S.sk.find((s) => s.id === e.skill_id) || S.sk[0] || { levels: [] };
  return `<div class="gl-form"><b>${e.id ? "تعديل الهدف" : "هدف جديد"}</b>
  <label>المهارة المرتبطة<select id="gfsk">${S.dom.map((d) => `<optgroup label="${esc(d.name)}">${S.sk.filter((s) => s.domain === d.slug).map((s) => `<option value="${esc(s.id)}" ${s.id === (e.skill_id || sk.id) ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</optgroup>`).join("")}</select></label>
  <label>اسم الهدف (يبدأ بفعل قابل للملاحظة: يتعرف على، يميز بين، يصنف، يطابق، يرتب، يقرأ، يكتب، يحل، يطبق)<input type="text" id="gfn" maxlength="120" value="${esc(e.name)}"></label>
  <label>وصف مختصر<textarea id="gfd" rows="2" maxlength="300">${esc(e.descr || "")}</textarea></label>
  <div><b style="font-size:13px">العمر أو الصف (ضمن عمر المهارة)</b><div class="gl-lvs" id="gflv">${Object.entries(LV).filter(([k]) => (sk.levels || []).includes(k)).map(([k, l]) => `<label><input type="checkbox" value="${k}" ${(e.levels || []).includes(k) ? "checked" : ""}> ${l}</label>`).join("")}</div></div>
  <label>مخرجات التعلم (سطر لكل مخرج، من واحد إلى خمسة، قابلة للملاحظة ولا مبالغة فيها)<textarea id="gfo" rows="4">${esc((e.outcomes || []).join("\n"))}</textarea></label>
  <label>كيف يتحقق ولي الأمر من الهدف (عند توفر طريقة)<textarea id="gfv" rows="2">${esc(e.verify || "")}</textarea></label>
  <label>إرشاد مختصر لولي الأمر<textarea id="gft" rows="2">${esc(e.tip || "")}</textarea></label>
  <p class="mut" style="font-size:12px">تعديل الاسم أو المهارة أو العمر أو المخرجات في هدف منشور يعيده مسودة (إن لم تكن مراجعًا) ويعلّم روابطه «غير مراجعة» ويسجّل ذلك في سجل جودة كل مورد مرتبط. الحالة: ${esc(STS[e.status] || "مسودة")}.</p>
  <p class="gl-msg" id="gfm" role="status"></p><div class="gl-acts"><button class="chip pri" id="gfsave">حفظ</button><button class="chip" id="gfcan">إلغاء</button>${e.id && isMgr() ? '<button class="chip bad" id="gfdel">حذف الهدف</button>' : ""}</div></div>`;
}
function bindForm() {
  const e = S.edit, msg = (t, c) => { const m = $("#gfm", M); m.className = "gl-msg " + (c || ""); m.textContent = t; };
  const grab = () => { e.skill_id = $("#gfsk", M).value; e.name = $("#gfn", M).value; e.descr = $("#gfd", M).value; e.levels = $$("#gflv input:checked", M).map((x) => x.value); e.outcomes = $("#gfo", M).value.split("\n"); e.verify = $("#gfv", M).value; e.tip = $("#gft", M).value; };
  $("#gfsk", M).onchange = () => { grab(); const sk = S.sk.find((s) => s.id === e.skill_id); e.levels = (e.levels || []).filter((l) => sk && sk.levels.includes(l)); paint(); };
  $("#gfcan", M).onclick = () => { S.edit = null; paint(); };
  const save = async (force) => {
    grab();
    const p = { id: e.id || null, skill_id: e.skill_id, name: e.name, descr: e.descr, levels: e.levels, outcomes: e.outcomes.map((x) => x.trim()).filter(Boolean), verify: e.verify, tip: e.tip, status: e.id ? e.status : "draft" };
    const r = await sb.rpc("goal_save", { p, p_force: !!force });
    if (r.error) {
      const t = String(r.error.message || "");
      if (/متقارب/.test(t) && isMgr() && !force) { msg(t.replace(/^.*?:\s*/, ""), "bad"); if (await Z.ask("الصياغة قريبة من هدف موجود. حفظه رغم ذلك يخلق تكرارًا محتملًا. هل تؤكد أنه هدف مختلف فعلًا؟")) return save(true); return; }
      return msg(t.replace(/^.*?:\s*/, ""), "bad");
    }
    const n = r.data && r.data.links_to_review; await load(); S.edit = null; paint(); toast(n ? "حُفظ الهدف، ووُسم " + AD(n) + " رابط للمراجعة." : "حُفظ الهدف.");
  };
  $("#gfsave", M).onclick = () => save(false);
  const dl = $("#gfdel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف الهدف نهائيًا؟ لا يمكن حذف هدف له موارد مرتبطة."))) return; const r = await sb.rpc("goal_delete", { p_id: e.id }); if (r.error) return msg(String(r.error.message).replace(/^.*?:\s*/, ""), "bad"); await load(); S.edit = null; paint(); toast("حُذف الهدف."); };
}
function linksHtml() {
  const g = S.g.find((x) => x.id === S.open), ls = linksOf(g.id), q = (S.q || "").trim();
  let cand = [];
  const inSkill = new Set(S.sl.filter((l) => l.skill_id === g.skill_id).map((l) => l.item_key));
  if (q.length >= 2) cand = [...S.it.values()].filter((i) => i.status === "published" && inSkill.has(i.key) && (i.levels || []).some((x) => g.levels.includes(x)) && i.title.includes(q) && !ls.some((l) => l.item_key === i.key)).slice(0, 12);
  const rows = ls.map((l) => { const i = S.it.get(l.item_key); return `<div class="gl-row" data-l="${esc(l.id)}"><b>${esc(itT(l.item_key))} <span class="mut">${esc(TYPE[(i || {}).src] || "")}</span></b><span class="mut">${esc(lvTxt((i || {}).levels))}</span>${i && i.status !== "published" ? '<span class="gl-bd bad">غير منشور</span>' : ""}${l.reviewed ? '<span class="gl-bd ok">مراجَع</span>' : `<span class="gl-bd warn">غير مراجع${l.origin === "rule" ? " (ربط آلي أولي)" : ""}</span>`}${canEdit() ? `<select data-f="stage" aria-label="المستوى">${Object.entries(STG).map(([k, t]) => `<option value="${k}" ${l.stage === k ? "selected" : ""}>${t}</option>`).join("")}</select><select data-f="role" aria-label="الدور"><option value="main" ${l.role === "main" ? "selected" : ""}>هدف رئيسي</option><option value="sub" ${l.role === "sub" ? "selected" : ""}>هدف فرعي</option></select><button class="chip bad" data-a="unlink">فك الربط</button>` : `<span class="gl-bd">${STG[l.stage]}</span>`}</div>`; }).join("");
  const un = ls.filter((l) => !l.reviewed).length;
  return `<button class="chip" id="glback">→ كل الأهداف</button><h3 style="margin:8px 0">${esc(g.name)} <span class="gl-bd">${esc(dn(g.domain))}</span> <span class="gl-bd">${esc(lvTxt(g.levels))}</span> <span class="gl-bd">${esc(STS[g.status])}</span></h3><p class="mut">المهارة: ${esc(skN(g.skill_id))}. تُربط فقط موارد مرتبطة أصلًا بهذه المهارة.</p>
  ${canRev() && un ? `<div class="gl-acts"><button class="chip pri" id="glapp">اعتماد ${AD(un)} رابط غير مراجع (راجعتُ توافقها مع محتوى المورد)</button></div>` : ""}
  ${rows || '<p class="mut">لا موارد مرتبطة بهذا الهدف.</p>'}
  ${canEdit() ? `<div class="gl-form"><b>ربط مورد بهذا الهدف</b><div class="gl-q"><input type="text" id="glq" placeholder="ابحث بعنوان المورد (حرفان على الأقل)" value="${esc(S.q || "")}"></div>${q.length >= 2 ? (cand.length ? cand.map((i) => `<div class="gl-row" data-k="${esc(i.key)}"><b>${esc(i.title)} <span class="mut">${esc(TYPE[i.src] || "")}</span></b><span class="mut">${esc(lvTxt(i.levels))}</span><select data-f="st">${Object.entries(STG).map(([k, t]) => `<option value="${k}" ${k === "practice" ? "selected" : ""}>${t}</option>`).join("")}</select><button class="chip pri" data-a="add">ربط</button></div>`).join("") : '<p class="mut">لا نتائج: يجب أن يكون المورد منشورًا ومرتبطًا بمهارة الهدف ومتقاطع العمر معه.</p>') : ""}<p class="mut" style="font-size:12px">الحد الأقصى ثلاثة أهداف للمورد الواحد، وهدف رئيسي واحد. الأهداف المرتبطة يجب أن تطابق محتوى المورد الفعلي.</p></div>` : ""}`;
}
function bindLinks() {
  const g = S.g.find((x) => x.id === S.open);
  $("#glback", M).onclick = () => { S.open = null; paint(); };
  const ap = $("#glapp", M); if (ap) ap.onclick = async () => { const ids = linksOf(g.id).filter((l) => !l.reviewed).map((l) => l.id); const r = await sb.rpc("goal_review", { p_ids: ids }); if (r.error) return fail(r.error); await load(); paint(); toast("اعتُمدت الروابط."); };
  const q = $("#glq", M); if (q) q.oninput = () => { S.q = q.value; const p = q.selectionStart; paint(); const n = $("#glq", M); n.focus(); try { n.setSelectionRange(p, p); } catch (e) { /* */ } };
  $$(".gl-row[data-l]", M).forEach((r) => {
    const id = r.dataset.l, upd = async () => { const x = await sb.rpc("goal_link_update", { p_id: id, p_stage: $("[data-f=stage]", r).value, p_role: $("[data-f=role]", r).value, p_ord: null }); if (x.error) { fail(x.error); await load(); paint(); return; } await load(); paint(); };
    $$("select", r).forEach((e) => (e.onchange = upd));
    const ul = $("[data-a=unlink]", r); if (ul) ul.onclick = async () => { if (!(await Z.ask("فك ربط هذا المورد بالهدف؟"))) return; const x = await sb.rpc("goal_unlink", { p_id: id }); if (x.error) return fail(x.error); await load(); paint(); };
  });
  $$(".gl-row[data-k]", M).forEach((r) => { $("[data-a=add]", r).onclick = async () => { const x = await sb.rpc("goal_link", { p_goal: g.id, p_key: r.dataset.k, p_stage: $("[data-f=st]", r).value, p_role: "sub" }); if (x.error) return fail(x.error); await load(); paint(); toast("رُبط المورد."); }; });
}
async function reviewPaint() {
  const r = await sb.rpc("goals_check"); S.chk = r.error ? null : r.data || [];
  const dr = S.g.filter((g) => g.status === "draft"), un = S.g.map((g) => ({ g, n: linksOf(g.id).filter((l) => !l.reviewed).length })).filter((x) => x.n);
  const rule = S.ln.filter((l) => l.origin === "rule" && !l.reviewed).length;
  M.innerHTML = shell(`<div class="gl-form"><b>ملخص</b><p class="mut">${AD(S.g.length)} هدف (${AD(S.g.filter((g) => g.status === "active").length)} منشور، ${AD(dr.length)} مسودة، ${AD(S.g.filter((g) => g.status === "hidden").length)} مخفي) · ${AD(S.ln.length)} رابط · ${AD(rule)} رابط آلي أولي لم يُراجَع. الأهداف الأولية كُتبت كمسودات ولا تظهر للمستخدمين قبل أن يراجعها مراجع تعليمي وينشرها.</p>${canRev() && dr.length ? `<div class="gl-acts"><button class="chip pri" id="glpuball">نشر ${AD(dr.length)} مسودة بعد مراجعتها (يتحقق النظام من الصياغة والمخرجات)</button></div>` : ""}</div>
  <div class="gl-dom">فحص جودة الأهداف</div>${r.error ? `<p class="gl-msg bad">${esc(r.error.message)}</p>` : S.chk.length ? S.chk.map((p) => `<div class="gl-row"><span class="gl-bd bad">${esc(PROB[p.t] || p.t)}</span><b>${esc(p.msg)}</b></div>`).join("") : '<p class="gl-msg ok">لا مشكلات: الصياغة قابلة للملاحظة، والمخرجات موجودة، ولا ادعاءات مبالغ فيها، والروابط ضمن مهارة الهدف وعمره.</p>'}
  <div class="gl-dom">أهداف فيها روابط غير مراجعة</div>${un.length ? un.map((x) => `<div class="gl-row" data-id="${esc(x.g.id)}"><b>${esc(x.g.name)}</b><span class="gl-bd warn">${AD(x.n)} غير مراجع</span><button class="chip pri" data-a="open">فتح الروابط</button></div>`).join("") : '<p class="mut">لا شيء بانتظار المراجعة.</p>'}`);
  $$("#gltabs [data-t]", M).forEach((b) => (b.onclick = () => { S.tab = b.dataset.t; S.open = null; if (S.tab === "review") reviewPaint(); else paint(); }));
  $$(".gl-row[data-id] [data-a=open]", M).forEach((b) => (b.onclick = () => { S.tab = "goals"; S.open = b.closest(".gl-row").dataset.id; S.q = ""; paint(); }));
  const pa = $("#glpuball", M); if (pa) pa.onclick = async () => { if (!(await Z.ask("نشر كل المسودات الحالية للمستخدمين؟ تأكد أنك راجعت صياغتها ومخرجاتها وتوافق مواردها."))) return; const x = await sb.rpc("goal_publish_all"); if (x.error) return fail(x.error); await load(); reviewPaint(); toast("نُشر " + AD(x.data) + " هدف."); };
}
window.__goalsAdmTest = { S, linksOf };
})();
