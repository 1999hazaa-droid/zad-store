/* مركز الخطط الأسبوعية (إدارة): خطة لعمر/صف من 2 إلى 8 أنشطة (حتى 4 للأعمار سنتين وثلاث، ونشاط واحد في اليوم لهم)، كل نشاط له يوم ومهارة ومورد منشور مرتبط بها وبديل اختياري.
   القواعد (النطاق، ازدحام اليوم، توازن المجالات، موارد منشورة ومرتبطة، لغة داعمة) في قاعدة البيانات. النشر للمراجع فقط. لا نُنشئ موارد جديدة هنا. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const LV = { a2: "سنتان", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SCOPE = Object.keys(LV);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const KIND = { interactive: "نشاط تفاعلي", worksheet: "ورقة عمل", card: "بطاقة تعليمية", story: "قصة قصيرة", game: "لعبة تعليمية", home: "نشاط منزلي", think: "ملاحظة وتفكير", review: "مراجعة قصيرة", integrated: "نشاط شامل", create: "نشاط إبداعي" };
const DOM = { arabic: "اللغة العربية", math: "الرياضيات", think: "الملاحظة والتفكير", sensory: "المهارات البصرية والسمعية", life: "المهارات الحياتية", science: "العلوم والاستكشاف", arts: "الإبداع والفنون", review: "مراجعة المهارات السابقة" };
const STS = { draft: "مسودة", active: "منشور", hidden: "مخفي" };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CSS = `.wp *{box-sizing:border-box}.wp-row{background:#fff;border:1px solid #e4d9ff;border-radius:14px;padding:10px;margin:8px 0}.wp-row b{display:block;margin-bottom:4px}.wp label{display:flex;flex-direction:column;gap:3px;font-weight:700;font-size:13px;margin:6px 0}.wp select,.wp textarea,.wp input[type=text]{border:2px solid #e4d9ff;border-radius:10px;padding:7px;font:inherit;min-height:40px;background:#fff}.wp textarea{min-height:56px}.wp .bd{border-radius:99px;padding:2px 9px;font-size:12px;font-weight:700;background:#f1eaff;color:#3a1a85}.wp .bd.ok{background:#dff6e7;color:#17683a}.wp .bd.bad{background:#ffe3e0;color:#9a1d12}.wp .ck{flex-direction:row;align-items:center;gap:6px}.wp-acts{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0}`;
const S = { me: { roles: [] }, sk: [], sl: [], it: new Map(), rows: [], edit: null };
let M = null;
const has = (...r) => r.some((x) => S.me.roles.includes(x));
const canEdit = () => has("content_editor", "edu_reviewer", "library_manager"), canRev = () => has("edu_reviewer", "library_manager");
const fail = (e) => toast((e && e.message ? e.message : String(e || "تعذّر التنفيذ")).replace(/^.*?:\s*/, ""), "err");
const nm = (id) => (S.sk.find((s) => s.id === id) || { name: "؟" }).name;
const itT = (k) => { const i = S.it.get(k); return i ? i.title : k; };
async function load() {
  const [s, l, r] = await Promise.all([sb.from("skills").select("id,slug,domain,name,levels,status,sort").eq("status", "active").order("sort", { ascending: true }), sb.from("skill_links").select("skill_id,item_key"), sb.rpc("wplan_admin")]);
  S.sk = s.data || []; S.sl = l.data || []; if (r.error) { fail(r.error); S.rows = []; } else S.rows = r.data || [];
  let all = [], from = 0; for (;;) { const x = await sb.from("quality_items").select("key,title,levels,status,gone").eq("gone", false).range(from, from + 999); const a = x.data || []; all = all.concat(a); if (a.length < 1000) break; from += 1000; }
  S.it = new Map(all.map((i) => [i.key, i]));
}
SUB.wplansadm = { title: "مركز الخطط الأسبوعية", fn: async function view(m) {
  M = m; m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  const me = await sb.rpc("quality_my"); S.me = me.error || !me.data ? { roles: [] } : me.data;
  if (!S.me.roles.length) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">ليست لديك صلاحية الدخول إلى هذا المركز.</p>'; return; }
  await load(); S.edit = null; paint();
} };
const newEntry = () => ({ day: 0, t: "", d: "", kind: "interactive", domain: "arabic", skill: "", item: "", alt: "" });
const blank = () => ({ id: null, title: "", goals: "", levels: [], entries: [newEntry(), newEntry()], status: "" });
const fromRow = (r) => ({ id: r.id, title: r.title, goals: r.goals, levels: r.levels || [], entries: (r.entries || []).map((e) => ({ day: e.day, t: e.t, d: e.d || "", kind: e.kind, domain: e.domain, skill: e.skill, item: e.item, alt: e.alt || "" })), status: r.status });
function stats(e) {
  const lim = e.levels.includes("a2") || e.levels.includes("a3") ? [4, 1] : [8, 2], n = e.entries.length, perDay = DAYS.map((_, i) => e.entries.filter((x) => +x.day === i).length), dom = {};
  e.entries.forEach((x) => (dom[x.domain] = (dom[x.domain] || 0) + 1));
  const warn = []; if (n > lim[0]) warn.push(`عدد الأنشطة (${AD(n)}) أكبر من الحد ${AD(lim[0])}`); if (Math.max(...perDay) > lim[1]) warn.push(`أكثر من ${AD(lim[1])} نشاط في يوم واحد`); if (n >= 4 && Object.values(dom).some((c) => c * 10 > n * 6)) warn.push("مجال واحد يستحوذ على معظم الأنشطة");
  return { perDay, dom, warn };
}
function listHtml() {
  return `${canEdit() ? '<button class="chip" id="wpNew">+ خطة أسبوعية جديدة</button>' : ""}${S.rows.map((r) => `<div class="wp-row"><b>${esc(r.title)}</b><span class="bd">${esc(r.levels.map((l) => LV[l]).join("، "))}</span> <span class="bd ${r.status === "active" ? "ok" : ""}">${esc(STS[r.status])}</span> <span class="bd">${AD((r.entries || []).length)} أنشطة</span><div class="mut">${esc((r.skills || []).map(nm).join("، "))}</div><button class="chip" data-e="${esc(r.id)}">تحرير</button></div>`).join("") || '<p class="mut">لا توجد خطط أسبوعية بعد. لا تُنشأ خطط تلقائيًا.</p>'}`;
}
function formHtml() {
  const e = S.edit, st = stats(e);
  const keysFor = (sk) => [...new Set(S.sl.filter((x) => x.skill_id === sk).map((x) => x.item_key))].filter((k) => { const i = S.it.get(k); return i && i.status === "published" && (i.levels || []).some((l) => e.levels.includes(l)); });
  const row = (x, i) => { const ks = keysFor(x.skill), skl = S.sk.filter((s) => e.levels.every((l) => s.levels.includes(l))); return `<div class="wp-row" data-i="${i}"><b>نشاط ${AD(i + 1)}</b>
   <label>اليوم المقترح<select class="eD">${DAYS.map((d, j) => `<option value="${j}"${+x.day === j ? " selected" : ""}>${d}</option>`).join("")}</select></label>
   <label>عنوان النشاط<input type="text" class="eT" maxlength="80" value="${esc(x.t)}"></label>
   <label>وصف مختصر (اختياري)<input type="text" class="eDs" maxlength="160" value="${esc(x.d)}"></label>
   <label>نوع النشاط<select class="eK">${Object.entries(KIND).map(([k, v]) => `<option value="${k}"${x.kind === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
   <label>المجال<select class="eM">${Object.entries(DOM).map(([k, v]) => `<option value="${k}"${x.domain === k ? " selected" : ""}>${v}</option>`).join("")}</select></label>
   <label>المهارة المستهدفة<select class="eS"><option value="">اختر</option>${skl.map((s) => `<option value="${esc(s.id)}"${s.id === x.skill ? " selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
   <label>المورد (منشور ومرتبط بالمهارة)<select class="eI"><option value="">اختر</option>${ks.map((k) => `<option value="${esc(k)}"${x.item === k ? " selected" : ""}>${esc(itT(k))}</option>`).join("")}</select></label>
   <label>نشاط بديل (اختياري)<select class="eA"><option value="">— لا —</option>${ks.filter((k) => k !== x.item).map((k) => `<option value="${esc(k)}"${x.alt === k ? " selected" : ""}>${esc(itT(k))}</option>`).join("")}</select></label>
   <div class="wp-acts"><button class="chip" data-up="${i}">↑</button><button class="chip" data-dn="${i}">↓</button><button class="chip" data-rm="${i}">حذف النشاط</button></div></div>`; };
  return `<button class="chip" id="wpBack">← كل الخطط</button><h3>${e.id ? "تحرير خطة أسبوعية" : "خطة أسبوعية جديدة"}</h3>
  <label>عنوان الخطة<input type="text" id="wpTitle" maxlength="80" value="${esc(e.title)}"></label>
  <label>أهداف الخطة<textarea id="wpGoals" maxlength="300">${esc(e.goals)}</textarea></label>
  <div class="wp-row"><b>الأعمار والصفوف</b>${SCOPE.map((l) => `<label class="ck"><input type="checkbox" data-l="${l}"${e.levels.includes(l) ? " checked" : ""}> ${LV[l]}</label>`).join("")}</div>
  <h4>الأنشطة</h4>${e.entries.map(row).join("")}<button class="chip" id="wpAdd">+ إضافة نشاط</button>
  <div class="wp-row"><b>معاينة التوزيع</b>${DAYS.map((d, i) => `${d}: ${AD(st.perDay[i])}`).join(" · ")}<br>${Object.entries(st.dom).map(([k, c]) => `${DOM[k]}: ${AD(c)}`).join(" · ") || "—"}${st.warn.map((w) => `<br><span class="bd bad">${esc(w)}</span>`).join("")}</div>
  <p class="mut">الحالة: ${esc(STS[e.status] || "جديد")}. ${e.status === "active" ? "ظاهرة للزوار." : "غير ظاهرة للزوار حتى يُنشرها مراجع."} بعد النشر تظهر في صفحة /week/.</p>
  <div class="wp-acts">${canEdit() ? '<button class="chip" id="wpSave">حفظ</button>' : ""}${e.id && canRev() ? `${e.status !== "active" ? '<button class="chip" id="wpPub">نشر</button>' : '<button class="chip" id="wpHide">إخفاء</button>'}<button class="chip" id="wpDel">حذف</button>` : ""}</div>`;
}
function paint() {
  M.innerHTML = `<style>${CSS}</style><div class="wp"><button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">الخطة اقتراح مرن وليست إلزامية: أنشطة قليلة متوازنة. كل نشاط يفتح مورد مكتبة حقيقيًا منشورًا ومرتبطًا بمهارته. اكتب بلغة داعمة.</p>${S.edit ? formHtml() : listHtml()}<div class="wp-acts"><button class="chip" data-go="skillsadm">ربط الأنشطة بالمهارات</button><button class="chip" data-go="dtasksadm">المهام اليومية</button><button class="chip" data-go="reviewadm">مراجعة المهارات</button><button class="chip" data-go="integadm">الأنشطة الشاملة</button></div></div>`;
  $$("[data-go]", M).forEach((b) => (b.onclick = () => window.__go(b.dataset.go)));
  const nw = $("#wpNew", M); if (nw) nw.onclick = () => { S.edit = blank(); paint(); };
  $$("[data-e]", M).forEach((b) => (b.onclick = () => { S.edit = fromRow(S.rows.find((x) => x.id === b.dataset.e)); paint(); }));
  if (!S.edit) return;
  const e = S.edit, grab = () => { e.title = $("#wpTitle", M).value; e.goals = $("#wpGoals", M).value; e.levels = $$("[data-l]:checked", M).map((x) => x.dataset.l); e.entries = $$("[data-i]", M).map((r) => ({ day: +$(".eD", r).value, t: $(".eT", r).value, d: $(".eDs", r).value, kind: $(".eK", r).value, domain: $(".eM", r).value, skill: $(".eS", r).value, item: $(".eI", r).value, alt: $(".eA", r).value })); };
  $("#wpBack", M).onclick = () => { S.edit = null; paint(); };
  $$("[data-l]", M).forEach((c) => (c.onchange = () => { grab(); paint(); }));
  $$(".eD,.eM,.eK,.eI,.eA", M).forEach((c) => (c.onchange = () => { grab(); paint(); }));
  $$(".eS", M).forEach((c) => (c.onchange = () => { grab(); const i = +c.closest("[data-i]").dataset.i; e.entries[i].item = ""; e.entries[i].alt = ""; paint(); }));
  $("#wpAdd", M).onclick = () => { grab(); e.entries.push(newEntry()); paint(); };
  $$("[data-rm]", M).forEach((b) => (b.onclick = () => { grab(); if (e.entries.length > 1) e.entries.splice(+b.dataset.rm, 1); paint(); }));
  const mv = (i, d) => { grab(); const j = i + d; if (j < 0 || j >= e.entries.length) return; [e.entries[i], e.entries[j]] = [e.entries[j], e.entries[i]]; paint(); };
  $$("[data-up]", M).forEach((b) => (b.onclick = () => mv(+b.dataset.up, -1)));
  $$("[data-dn]", M).forEach((b) => (b.onclick = () => mv(+b.dataset.dn, 1)));
  const rf = async (fn, args, ok, after) => { const x = await sb.rpc(fn, args); if (x.error) return fail(x.error); await load(); if (after) after(x); paint(); if (ok) toast(ok); };
  const sv = $("#wpSave", M); if (sv) sv.onclick = () => { grab(); rf("wplan_save", { p: { id: e.id, title: e.title, goals: e.goals, levels: e.levels, entries: e.entries.map((x) => ({ day: x.day, t: x.t, d: x.d, kind: x.kind, domain: x.domain, skill: x.skill || null, item: x.item, alt: x.alt || null })) } }, "تم الحفظ.", (x) => { const r = S.rows.find((y) => y.id === (x.data || e.id)); S.edit = r ? fromRow(r) : null; }); };
  const pb = $("#wpPub", M); if (pb) pb.onclick = () => rf("wplan_status", { p_id: e.id, p_status: "active" }, "نُشرت الخطة.", () => { e.status = "active"; });
  const hd = $("#wpHide", M); if (hd) hd.onclick = () => rf("wplan_status", { p_id: e.id, p_status: "hidden" }, "أُخفيت الخطة.", () => { e.status = "hidden"; });
  const dl = $("#wpDel", M); if (dl) dl.onclick = async () => { if (!(await Z.ask("حذف هذه الخطة نهائيًا؟ لا يمكن التراجع."))) return; const x = await sb.rpc("wplan_delete", { p_id: e.id }); if (x.error) return fail(x.error); S.edit = null; await load(); paint(); toast("حُذفت الخطة."); };
}
window.__wplansAdmTest = { S };
})();
