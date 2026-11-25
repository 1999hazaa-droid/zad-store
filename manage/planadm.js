/* إدارة «خطتي التعليمية»: قواعد الاقتراح، نماذج الخطط، فحص المحتوى المؤهل، إيقاف نشاط، أخطاء الروابط.
   كل نشاط في الخطط صف حقيقي منشور في المكتبة؛ ربط المهارات والمستوى والمراجعة قبل الظهور من «إدارة مركز التوصيات». */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const GN = { young: "من سنة إلى ٣ سنوات", mid: "من ٤ إلى ٦ سنوات", school: "الصفوف ١ إلى ٤" };
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SRC = { acts: ["activities", "أنشطة وأوراق عمل"], bank: ["bank_items", "بنك الأنشطة"], proj: ["proj_items", "مشاريع"], life: ["life_items", "مهارات حياتية"], ready: ["ready_items", "استعداد مدرسي"], val: ["val_items", "قيم"], vid: ["video_items", "فيديو"], songs: ["song_items", "أناشيد"], stories: ["stories", "قصص"] };
const AR = /^[ء-ي٠-٩\s.،؟!:\-ـً-ْ«»()]+$/;
let TAB = "rl", CF = [], ERRS = [];
const ni = (v, a, b) => Number.isInteger(v) && v >= a && v <= b;
function chkRules(d) {
  const m = [], g = ["young", "mid", "school"];
  if (!ni(d.maxN, 1, 21)) m.push("أقصى عدد أنشطة في الأسبوع (١–٢١)");
  g.forEach((k) => { if (!ni((d.defN || {})[k], 1, 14)) m.push("العدد الافتراضي: " + GN[k]); if (!ni((d.perDay || {})[k], 1, 3)) m.push("أقصى أنشطة يوميًا: " + GN[k]); if (!ni((d.defDays || {})[k], 3, 5)) m.push("عدد الأيام الافتراضي (٣–٥): " + GN[k]); if (ni((d.defN || {})[k], 1, 14) && ni((d.perDay || {})[k], 1, 3) && ni((d.defDays || {})[k], 3, 5) && d.defN[k] > d.perDay[k] * d.defDays[k]) m.push("العدد الافتراضي أكبر مما تتسع له الأيام: " + GN[k]); });
  return m;
}
function chkTpl(t, domSlugs, rules) {
  const m = [], d = t.data || {};
  if (!t.title || !AR.test(t.title) || t.title.length > 60) m.push("اسم النموذج (عربي حتى ٦٠ حرفًا)");
  if (!Array.isArray(d.groups) || !d.groups.length || d.groups.some((g) => !GN[g])) m.push("الفئات (واحدة على الأقل ضمن النطاق المسموح)");
  if (!ni(d.days, 3, 5)) m.push("عدد الأيام (٣–٥)");
  if (!ni(d.n, 1, 14)) m.push("عدد الأنشطة (١–١٤)");
  if (!Array.isArray(d.doms) || d.doms.some((x) => !domSlugs.includes(x))) m.push("مجالات غير موجودة");
  if (ni(d.n, 1, 14) && ni(d.days, 3, 5) && Array.isArray(d.groups) && d.groups.every((g) => GN[g])) { const pd = (rules && rules.perDay) || { young: 1, mid: 2, school: 2 }; d.groups.forEach((g) => { if (d.n > d.days * (pd[g] || 2)) m.push("العدد أكبر مما تتسع له الأيام لفئة " + GN[g]); }); }
  return m;
}
async function load() {
  const a = await sb.from("rp_config").select("*").order("sort_order").limit(300); CF = a.error ? [] : a.data || [];
  const e = await sb.from("pf_errors").select("*").eq("kind", "plan-link").order("created_at", { ascending: false }).limit(50); ERRS = e.error ? [] : e.data || [];
}
const rules = () => (CF.find((x) => x.slug === "plan_rules") || { data: {} }).data;
const tpls = () => CF.filter((x) => x.kind === "ptpl"), domS = () => CF.filter((x) => x.kind === "domain").map((x) => x.slug);
async function eligible() {
  const out = {}; Object.keys(LV).forEach((k) => (out[k] = 0)); const oos = []; let total = 0;
  for (const [s, [tb, name]] of Object.entries(SRC)) {
    const cols = s === "acts" ? "slug,title,ages,grades" : "slug,title,levels"; const q = await sb.from(tb).select(cols).eq("status", "published").limit(3000); if (q.error) continue;
    (q.data || []).forEach((x) => { total++; let lv = []; if (s === "acts") { (x.ages || []).forEach((a) => lv.push(a <= 2 ? "a2" : "a" + a)); (x.grades || []).forEach((g) => lv.push("g" + g)); lv = lv.filter((l) => LV[l]); } else lv = (x.levels || []).filter((l) => LV[l]); if (!lv.length) oos.push(name + ": " + x.title); [...new Set(lv)].forEach((l) => out[l]++); });
  }
  return { out, oos, total };
}
SUB.planadm = { title: "إدارة خطتي التعليمية", fn: async function view(m) {
  await load();
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">الخطط تُبنى على جهاز الوليّ من المحتوى المنشور فعلًا ولا تُحفظ هنا خطط الأطفال. هنا تُدار القواعد والنماذج، وتُراجع أخطاء الروابط. ربط النشاط بالمهارة والمستوى وإيقافه أو اعتماده قبل الظهور من «إدارة مركز التوصيات».</p>
  <div class="chips" id="plt">${[["rl", "قواعد الاقتراح"], ["tp", "نماذج الخطط"], ["ct", "المحتوى المؤهل"], ["er", "أخطاء الروابط"]].map(([k, l]) => `<button class="chip ${TAB === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div><div id="plb"></div>`;
  $$("#plt [data-t]", m).forEach((b) => (b.onclick = () => { TAB = b.dataset.t; view(m); }));
  const B = $("#plb", m), reload = () => view(m);
  if (TAB === "rl") {
    const r = Object.assign({ maxN: 14, defN: {}, perDay: {}, defDays: {} }, rules()), I = (id, v, a, b) => `<input type="number" id="${id}" min="${a}" max="${b}" value="${esc(v == null ? "" : v)}" style="width:80px">`;
    B.innerHTML = `<div class="card"><b>حدود الخطة (لتجنب إرهاق الطفل)</b><label class="f"><span>أقصى عدد أنشطة في الأسبوع</span>${I("plx", r.maxN, 1, 21)}</label>${["young", "mid", "school"].map((g) => `<div class="item"><div class="tx"><b>${GN[g]}</b><small>العدد الافتراضي / أقصى أنشطة يوميًا / عدد الأيام الافتراضي</small></div><div style="display:flex;gap:6px">${I("pn" + g, (r.defN || {})[g], 1, 14)}${I("pd" + g, (r.perDay || {})[g], 1, 3)}${I("py" + g, (r.defDays || {})[g], 3, 5)}</div></div>`).join("")}
    <label class="f"><span><input type="checkbox" id="plr" ${r.review !== false ? "checked" : ""}> تفعيل أنشطة المراجعة افتراضيًا</span></label><p id="ple" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="plsv">حفظ</button></div></div>`;
    $("#plsv", B).onclick = async () => {
      const g = ["young", "mid", "school"], d = { maxN: parseInt($("#plx", B).value, 10), defN: {}, perDay: {}, defDays: {}, review: $("#plr", B).checked }; g.forEach((k) => { d.defN[k] = parseInt($("#pn" + k, B).value, 10); d.perDay[k] = parseInt($("#pd" + k, B).value, 10); d.defDays[k] = parseInt($("#py" + k, B).value, 10); });
      const ms = chkRules(d); if (ms.length) { $("#ple", B).textContent = "صحّح: " + ms.join("، "); return; }
      try { const q = await sb.from("rp_config").update({ data: d, updated_at: new Date().toISOString() }).eq("slug", "plan_rules"); if (q.error) throw q.error; toast("تم الحفظ"); reload(); } catch (e) { fail(e); }
    };
  } else if (TAB === "tp") {
    B.innerHTML = `<div class="row"><button class="btn" id="pln">+ نموذج جديد</button></div>${tpls().map((t) => { const ms = chkTpl(t, domS(), rules()); return `<div class="item" data-s="${esc(t.slug)}"><div class="tx"><b>${esc(t.title)}</b><small>${t.status === "active" ? "مفعّل" : "متوقف"} · ${(t.data.groups || []).map((g) => GN[g]).join("، ")} · ${t.data.n} أنشطة في ${t.data.days} أيام${ms.length ? ` · <span style="color:var(--no)">يحتاج تصحيحًا</span>` : ""}</small></div></div>`; }).join("") || '<p class="mut">لا نماذج.</p>'}`;
    $$("[data-s]", B).forEach((n) => (n.onclick = () => editTpl(CF.find((x) => x.slug === n.dataset.s), reload)));
    $("#pln", B).onclick = () => editTpl({ slug: "pt_" + Math.random().toString(36).slice(2, 7), kind: "ptpl", title: "", data: { groups: ["mid"], n: 4, days: 3, doms: [], review: true }, status: "off", sort_order: 400, _new: true }, reload);
  } else if (TAB === "ct") {
    B.innerHTML = '<div class="card"><button class="btn" id="plc">فحص المحتوى المؤهل للخطط</button><div id="plr2"></div></div><div class="card"><b>إيقاف نشاط غير مناسب في كل التوصيات والخطط</b><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="pls">' + Object.entries(SRC).map(([k, v]) => `<option value="${k}">${v[1]}</option>`).join("") + '</select><input type="text" id="plq" placeholder="جزء من العنوان" style="flex:1;min-width:140px"><button class="btn" id="plg">بحث</button></div><div id="plo"></div></div>';
    $("#plc", B).onclick = async () => { const o = $("#plr2", B); o.innerHTML = '<p class="mut">جارٍ الفحص…</p>'; try { const c = await eligible(); o.innerHTML = `<p>إجمالي العناصر المنشورة: ${c.total}</p><div class="grid2">${Object.entries(LV).map(([k, l]) => `<div class="stat"><b>${c.out[k]}</b><span>${l}${c.out[k] < 8 ? " (قليل)" : ""}</span></div>`).join("")}</div>${c.oos.length ? `<p class="mut">عناصر منشورة بلا مستوى ضمن النطاق (لن تدخل أي خطة): ${c.oos.length}</p><ul>${c.oos.slice(0, 30).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : '<p class="mut">كل العناصر المنشورة لها مستوى ضمن النطاق.</p>'}`; } catch (e) { fail(e); } };
    $("#plg", B).onclick = async () => { const s = $("#pls", B).value, q = $("#plq", B).value.trim(), o = $("#plo", B); try { let qq = sb.from(SRC[s][0]).select("slug,title").eq("status", "published").order("title").limit(20); if (q) qq = qq.ilike("title", "%" + q.replace(/[%,()]/g, "") + "%"); const r = await qq; if (r.error) throw r.error; o.innerHTML = (r.data || []).map((x, i) => `<div class="item"><div class="tx"><b>${esc(x.title)}</b><small>${esc(x.slug)}</small></div><button class="btn g" data-i="${i}">إيقاف</button></div>`).join("") || '<p class="mut">لا نتائج.</p>'; $$("[data-i]", o).forEach((b) => (b.onclick = async () => { const x = r.data[+b.dataset.i]; if (!confirm("إيقاف «" + x.title + "» في التوصيات والخطط؟ يبقى منشورًا في المكتبة، ويمكنك إعادته من إدارة مركز التوصيات.")) return; try { const w = await sb.from("rec_overrides").upsert({ src: s, slug: x.slug, status: "off", priority: 0, updated_at: new Date().toISOString() }, { onConflict: "src,slug" }); if (w.error) throw w.error; toast("تم الإيقاف"); b.disabled = true; } catch (e) { fail(e); } })); } catch (e) { fail(e); } };
  } else {
    B.innerHTML = ERRS.length ? `<div class="card"><ul>${ERRS.map((e) => `<li>${esc((e.msg || "").slice(0, 160))} · ${esc(String(e.created_at).slice(0, 10))}</li>`).join("")}</ul></div>` : '<p class="mut">لا أخطاء في روابط الأنشطة.</p>';
  }
} };
function editTpl(t, reload) {
  const d = JSON.parse(JSON.stringify(t.data || {})), gs = new Set(d.groups || []), ds = new Set(d.doms || []), all = CF.filter((x) => x.kind === "domain");
  const s = sheet(`<h2>${t._new ? "نموذج جديد" : "تعديل النموذج"}</h2><label class="f"><span>اسم النموذج</span><input type="text" id="plt1" maxlength="60" value="${esc(t.title)}"></label>
  <p style="margin:8px 2px 4px;font-weight:700">الفئات</p><div class="chips" id="plt2">${Object.entries(GN).map(([k, l]) => `<button type="button" class="chip ${gs.has(k) ? "on" : ""}" data-g="${k}">${l}</button>`).join("")}</div>
  <p style="margin:8px 2px 4px;font-weight:700">المجالات</p><div class="chips" id="plt3">${all.map((x) => `<button type="button" class="chip ${ds.has(x.slug) ? "on" : ""}" data-d="${esc(x.slug)}">${esc(x.title)}</button>`).join("")}</div>
  <label class="f"><span>عدد الأنشطة / عدد الأيام (٣–٥)</span><span style="display:flex;gap:8px"><input type="number" id="plt4" min="1" max="14" value="${esc(d.n || 4)}" style="width:50%"><input type="number" id="plt5" min="3" max="5" value="${esc(d.days || 3)}" style="width:50%"></span></label>
  <label class="f"><span><input type="checkbox" id="plt6" ${d.review ? "checked" : ""}> تتضمن أنشطة مراجعة</span></label><label class="f"><span>الحالة</span><select id="plt7"><option value="active" ${t.status === "active" ? "selected" : ""}>مفعّل</option><option value="off" ${t.status !== "active" ? "selected" : ""}>متوقف</option></select></label>
  <p id="plte" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="pltsv">حفظ</button>${t._new ? "" : '<button class="btn g" id="pltdl">حذف النموذج</button>'}<button class="btn g" id="pltx">إغلاق</button></div>`);
  $("#pltx", s).onclick = closeSheet;
  $$("#plt2 [data-g]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.g; gs.has(k) ? gs.delete(k) : gs.add(k); b.classList.toggle("on", gs.has(k)); }));
  $$("#plt3 [data-d]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.d; ds.has(k) ? ds.delete(k) : ds.add(k); b.classList.toggle("on", ds.has(k)); }));
  $("#pltsv", s).onclick = async () => {
    const row = { slug: t.slug, kind: "ptpl", title: $("#plt1", s).value.trim(), data: { groups: [...gs], doms: [...ds], n: parseInt($("#plt4", s).value, 10), days: parseInt($("#plt5", s).value, 10), review: $("#plt6", s).checked }, status: $("#plt7", s).value, sort_order: t.sort_order || 400, updated_at: new Date().toISOString() };
    const ms = chkTpl(row, domS(), rules()); if (ms.length) { $("#plte", s).textContent = "صحّح: " + ms.join("، "); return; }
    try { const q = t._new ? await sb.from("rp_config").insert(row) : await sb.from("rp_config").update(row).eq("slug", t.slug); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { fail(e); }
  };
  if (!t._new) $("#pltdl", s).onclick = async () => { if (!confirm("حذف هذا النموذج؟ خطط الأهل الجاهزة لا تتأثر.")) return; try { const q = await sb.from("rp_config").delete().eq("slug", t.slug); if (q.error) throw q.error; toast("تم الحذف"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
window.__planTest = { chkRules, chkTpl };
})();
