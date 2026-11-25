/* إدارة «ابحث في المكتبة»: تعديل عنوان المحتوى وكلماته ومهاراته ومستواه ونوعه، كلمات بديلة، إخفاء من النتائج، مراجعة النتائج، الكلمات بلا نتائج.
   التعديلات تُكتب في جداول المكتبة الفعلية (العنوان، المستوى، كلمات وملف المكتبة) أو في جدول search_overrides لما لا عمود له.
   لا يُخزَّن في سجل البحث إلا نص قصير موحّد دون أي معرّف أو بيانات عن الطفل. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const CT = { story: "قصص تعليمية", ws: "أوراق عمل", cards: "بطاقات تعليمية", home: "أنشطة منزلية", video: "دروس مرئية", game: "ألعاب تعليمية", quiz: "اختبارات", project: "مشروعات", res: "موارد تعليمية" };
const SRC = { lib: ["products", "ملفات المكتبة"], acts: ["activities", "أنشطة منزلية"], bank: ["bank_items", "بنك الأنشطة"], proj: ["proj_items", "مشاريع"], life: ["life_items", "مهارات حياتية"], ready: ["ready_items", "استعداد مدرسي"], val: ["val_items", "قيم"], exp: ["exp_items", "ثقافة عامة"], vid: ["video_items", "فيديو"], songs: ["song_items", "أناشيد"], stories: ["stories", "قصص"], quiz: ["qz_quizzes", "اختبارات"], games: [null, "ألعاب"] };
const BAD = /@|https?:|www\.|<|>|\d{5,}/i;
let TAB = "items", FILTER = "", SYN = [], QS = [], DOMS = [], BUSY = false;
const F = () => window.ZFIND;
/* ---------- التحقق ---------- */
const kws = (s) => String(s || "").split(/[،,\n]+/).map((x) => x.trim()).filter(Boolean);
function chkItem(f, ctx) {
  const m = []; ctx = ctx || {};
  if (f.title != null && (f.title.trim().length < 3 || f.title.length > 120)) m.push("العنوان (٣ إلى ١٢٠ حرفًا)");
  if (f.title != null && BAD.test(f.title)) m.push("العنوان يحوي رابطًا أو بريدًا أو رموزًا غير مسموحة");
  const k = kws(f.keywords); if (k.length > 20 || String(f.keywords || "").length > 300) m.push("الكلمات المفتاحية (حتى ٢٠ كلمة و٣٠٠ حرف)");
  if (k.some((x) => x.length < 2 || x.length > 30 || BAD.test(x))) m.push("كلمة مفتاحية غير صالحة (٢–٣٠ حرفًا ودون روابط أو بيانات شخصية)");
  if (String(f.skills || "").length > 200 || BAD.test(f.skills || "")) m.push("المهارات (حتى ٢٠٠ حرف ودون روابط)");
  if (f.ctype && !CT[f.ctype]) m.push("نوع المحتوى");
  if (f.domain && !(ctx.doms || []).includes(f.domain) && f.domain !== "other") m.push("المجال");
  if (f.levels != null && (!Array.isArray(f.levels) || f.levels.some((l) => !LV[l]))) m.push("المستوى (من سنة إلى ٦ سنوات والصفوف ١–٤ فقط)");
  if (f.levels && !f.levels.length && f.mustLevel) m.push("اختر مستوى واحدًا على الأقل");
  if (f.note && String(f.note).length > 200) m.push("الملاحظة (حتى ٢٠٠ حرف)");
  return m;
}
function chkSyn(s) {
  const m = []; const t = String(s.term || "").trim(), a = (s.alts || []).map((x) => String(x).trim()).filter(Boolean);
  if (t.length < 2 || t.length > 40 || BAD.test(t)) m.push("الكلمة (٢–٤٠ حرفًا ودون روابط)");
  if (!a.length || a.length > 8) m.push("كلمة بديلة واحدة على الأقل وحتى ٨");
  if (a.some((x) => x.length < 2 || x.length > 40 || BAD.test(x))) m.push("كلمة بديلة غير صالحة");
  const nz = (x) => (window.ZFIND ? ZFIND.qstems(x).join(" ") || ZFIND.norm(x) : x);
  if (a.some((x) => nz(x) === nz(t))) m.push("البديلة تطابق الكلمة نفسها");
  if (!["on", "off"].includes(s.status)) m.push("الحالة");
  return m;
}
window.__searchTest = { chkItem, chkSyn };
/* ---------- البيانات ---------- */
async function loadAll() {
  const [a, b] = await Promise.all([sb.from("search_synonyms").select("*").order("created_at", { ascending: false }).limit(500), sb.from("search_queries").select("q,created_at").order("created_at", { ascending: false }).limit(3000)]);
  SYN = a.error ? [] : a.data || []; QS = b.error ? [] : b.data || [];
  const c = await sb.from("rp_config").select("slug,title").eq("kind", "domain").order("sort_order"); DOMS = c.error ? [] : c.data || [];
  F().reset(); await F().load();
}
const dayAgo = (s) => { const d = Math.max(0, Math.round((Date.now() - Date.parse(s)) / 864e5)); return d === 0 ? "اليوم" : d === 1 ? "أمس" : "قبل " + d + " أيام"; };
async function upsertOv(it, patch) {
  const base = Object.assign({ src: it.src, slug: it.slug, keywords: "", skills: "", ctype: null, domain: null, levels: null, hidden: false, note: null }, it.ov && it.ov.src ? it.ov : {}, patch, { updated_at: new Date().toISOString() });
  const q = await sb.from("search_overrides").upsert(base, { onConflict: "src,slug" }); if (q.error) throw q.error;
}
/* ---------- الواجهة ---------- */
SUB.searchadm = { title: "إدارة البحث في المكتبة", fn: async function view(m) {
  if (!window.ZFIND) { m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">تعذّر تحميل محرك البحث.</p>'; return; }
  m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  await loadAll();
  const X = F().X;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">يبحث الزوار في المحتوى المنشور فقط. هنا تضبط كيف يظهر المحتوى في النتائج. لا يظهر في البحث ما لم يكن منشورًا ولمستوى ضمن سنة–٦ سنوات والصفوف ١–٤.</p>
  <div class="chips" id="sct">${[["items", "المحتوى والكلمات"], ["syn", "كلمات بديلة"], ["rev", "مراجعة النتائج"], ["zero", "كلمات بلا نتائج"]].map(([k, l]) => `<button class="chip ${TAB === k ? "on" : ""}" data-t="${k}">${l}${k === "zero" && QS.length ? " (" + QS.length + ")" : ""}</button>`).join("")}</div><div id="scb"></div>`;
  $$("#sct [data-t]", m).forEach((b) => (b.onclick = () => { TAB = b.dataset.t; view(m); }));
  const B = $("#scb", m), reload = () => view(m);
  if (TAB === "items") items(B, X, reload); else if (TAB === "syn") syns(B, reload); else if (TAB === "rev") review(B, X, reload); else zero(B, reload);
} };
function items(B, X, reload) {
  const all = X.all || [], noLv = all.filter((i) => !i.lv.length), hid = all.filter((i) => i.hidden);
  const list = all.filter((i) => !FILTER || F().norm(i.title + " " + i.skill + " " + i.kw).includes(F().norm(FILTER))).slice(0, 80);
  B.innerHTML = `<div class="card"><b>${all.length - noLv.length - hid.filter((i) => i.lv.length).length}</b> عنصرًا يظهر في البحث · <b>${hid.length}</b> مخفي من النتائج${noLv.length ? ` · <b style="color:var(--no)">${noLv.length}</b> بلا مستوى صالح (لا يظهر)` : ""}</div>
  <label class="f"><span>ابحث عن محتوى لتعديله</span><input type="search" id="sci" value="${esc(FILTER)}" placeholder="عنوان أو مهارة أو كلمة"></label>
  ${list.map((i) => `<div class="item" data-k="${esc(i.key)}"><div class="tx"><b>${esc(i.title)}</b><small>${esc(SRC[i.src] ? SRC[i.src][1] : i.src)} · ${i.lv.length ? esc(i.lv.map((l) => LV[l]).join("، ")) : "بلا مستوى"} · ${esc(CT[i.ct] || "")}${i.hidden ? " · مخفي من البحث" : ""}</small></div></div>`).join("") || '<p class="mut">لا نتائج.</p>'}${all.length > 80 && !FILTER ? '<p class="mut">يظهر أول ٨٠ عنصرًا؛ استخدم البحث أعلاه.</p>' : ""}`;
  let t; $("#sci", B).oninput = (e) => { clearTimeout(t); t = setTimeout(() => { FILTER = e.target.value; items(B, X, reload); const n = $("#sci", B); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 250); };
  $$("[data-k]", B).forEach((n) => (n.onclick = () => edit(all.find((x) => x.key === n.dataset.k), reload)));
}
function edit(it, reload) {
  const lib = it.src === "lib", real = SRC[it.src] && SRC[it.src][0], hasLv = real && it.src !== "acts", ov = it.ov || {};
  const lv = new Set(it.lv);
  const s = sheet(`<h2>تعديل: ${esc(it.title)}</h2><p class="mut">${esc(SRC[it.src] ? SRC[it.src][1] : "")} · ${esc(it.key)}</p>
  <label class="f"><span>العنوان${real ? "" : " (لا يُعدَّل لأنه من ملف الألعاب)"}</span><input type="text" id="sc1" maxlength="120" value="${esc(it.title)}" ${real ? "" : "disabled"}></label>
  <label class="f"><span>كلمات مفتاحية (افصل بينها بفاصلة)</span><input type="text" id="sc2" maxlength="300" value="${esc(lib ? (it.raw.kw || "") : ov.keywords || "")}"></label>
  <label class="f"><span>المهارات المرتبطة</span><input type="text" id="sc3" maxlength="200" value="${esc(lib ? it.raw.skill || "" : ov.skills || it.raw.skill || "")}"></label>
  <label class="f"><span>نوع المحتوى</span><select id="sc4">${Object.entries(CT).map(([k, l]) => `<option value="${k}" ${it.ct === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
  <label class="f"><span>المجال</span><select id="sc5">${DOMS.map((d) => `<option value="${esc(d.slug)}" ${it.dom === d.slug ? "selected" : ""}>${esc(d.title)}</option>`).join("")}<option value="other" ${it.dom === "other" ? "selected" : ""}>متنوع</option></select></label>
  <div class="f"><span>العمر أو الصف (ضمن النطاق المسموح فقط)</span><div class="chips" id="sc6">${Object.entries(LV).map(([k, l]) => `<button type="button" class="chip ${lv.has(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div></div>
  <label class="f"><span><input type="checkbox" id="sc7" ${it.hidden ? "checked" : ""}> إخفاء من نتائج البحث (لا يُحذف المحتوى نفسه)</span></label>
  <label class="f"><span>ملاحظة داخلية</span><input type="text" id="sc8" maxlength="200" value="${esc(ov.note || "")}"></label>
  <p id="sce" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="scs">حفظ</button><button class="btn g" id="scx">إغلاق</button></div>`);
  $("#scx", s).onclick = closeSheet;
  $$("#sc6 [data-l]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.l; lv.has(k) ? lv.delete(k) : lv.add(k); b.classList.toggle("on", lv.has(k)); }));
  $("#scs", s).onclick = async () => {
    const f = { title: real ? $("#sc1", s).value.trim() : null, keywords: $("#sc2", s).value.trim(), skills: $("#sc3", s).value.trim(), ctype: $("#sc4", s).value, domain: $("#sc5", s).value, levels: [...lv], mustLevel: !it.hidden && !$("#sc7", s).checked, note: $("#sc8", s).value.trim() || null };
    const ms = chkItem(f, { doms: DOMS.map((d) => d.slug) }); if (ms.length) { $("#sce", s).textContent = "صحّح: " + ms.join("، "); return; }
    if (BUSY) return; BUSY = true;
    try {
      if (lib) {
        const up = { lib_keywords: f.keywords || null, lib_skill: f.skills || null, lib_levels: f.levels }; if (f.title !== it.title) up.name = f.title;
        const q = await sb.from("products").update(up).eq("id", it.raw.id); if (q.error) throw q.error;
      } else if (real) {
        const up = {}; if (f.title !== it.title) up.title = f.title; if (hasLv) up.levels = f.levels;
        if (Object.keys(up).length) { const q = await sb.from(real).update(up).eq("slug", it.slug); if (q.error) throw q.error; }
      }
      await upsertOv(it, { keywords: lib ? "" : f.keywords, skills: lib ? "" : (f.skills === (it.raw.skill || "") ? "" : f.skills), ctype: f.ctype, domain: f.domain, levels: !real || it.src === "acts" ? f.levels : null, hidden: $("#sc7", s).checked, note: f.note });
      toast("تم الحفظ"); closeSheet(); reload();
    } catch (er) { fail(er); } finally { BUSY = false; }
  };
}
function syns(B, reload) {
  B.innerHTML = `<p class="mut">كلمة بديلة تجعل البحث عن كلمة يعرض أيضًا محتوى الكلمات البديلة. استخدمها لمعانٍ متقاربة فقط حتى لا تتغيّر النتائج بطريقة غير مناسبة.</p><div class="row"><button class="btn" id="ssn">+ كلمة بديلة</button></div>${SYN.map((x) => `<div class="item" data-i="${esc(x.id)}"><div class="tx"><b>${esc(x.term)}</b><small>← ${esc((x.alts || []).join("، "))} · ${x.status === "on" ? "مفعّلة" : "متوقفة"}</small></div></div>`).join("") || '<p class="mut">لا توجد كلمات بديلة بعد.</p>'}`;
  $("#ssn", B).onclick = () => editSyn({ term: "", alts: [], status: "on", _new: true }, reload);
  $$("[data-i]", B).forEach((n) => (n.onclick = () => editSyn(SYN.find((x) => x.id === n.dataset.i), reload)));
}
function editSyn(x, reload) {
  const s = sheet(`<h2>${x._new ? "كلمة بديلة جديدة" : "تعديل الكلمة البديلة"}</h2>
  <label class="f"><span>الكلمة التي يكتبها الزائر</span><input type="text" id="sy1" maxlength="40" value="${esc(x.term)}"></label>
  <label class="f"><span>البدائل (افصل بينها بفاصلة، حتى ٨)</span><input type="text" id="sy2" maxlength="200" value="${esc((x.alts || []).join("، "))}"></label>
  <label class="f"><span>الحالة</span><select id="sy3"><option value="on" ${x.status === "on" ? "selected" : ""}>مفعّلة</option><option value="off" ${x.status === "off" ? "selected" : ""}>متوقفة</option></select></label>
  <p id="sye" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="sys">حفظ</button>${x._new ? "" : '<button class="btn g" id="syd">حذف</button>'}<button class="btn g" id="syx">إغلاق</button></div>`);
  $("#syx", s).onclick = closeSheet;
  $("#sys", s).onclick = async () => {
    const row = { term: $("#sy1", s).value.trim(), alts: kws($("#sy2", s).value), status: $("#sy3", s).value }; const ms = chkSyn(row); if (ms.length) { $("#sye", s).textContent = "صحّح: " + ms.join("، "); return; }
    try { const q = x._new ? await sb.from("search_synonyms").insert(row) : await sb.from("search_synonyms").update(row).eq("id", x.id); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (er) { fail(er); }
  };
  if (!x._new) $("#syd", s).onclick = async () => { if (!confirm("حذف هذه الكلمة البديلة؟ لا يتأثر المحتوى.")) return; try { const q = await sb.from("search_synonyms").delete().eq("id", x.id); if (q.error) throw q.error; toast("تم الحذف"); closeSheet(); reload(); } catch (er) { fail(er); } };
}
function review(B, X, reload) {
  B.innerHTML = `<p class="mut">اكتب كلمة كما يكتبها الزائر لترى النتائج وترتيبها كما ستظهر له تمامًا.</p><label class="f"><span>كلمة البحث</span><input type="search" id="srq" maxlength="60" placeholder="مثال: قصص الحيوانات"></label><div id="srr"></div>`;
  const run = () => {
    const q = $("#srq", B).value.trim(), o = $("#srr", B); if (!q) { o.innerHTML = ""; return; }
    const r = F().search(q, {}, "rel");
    o.innerHTML = `<div class="card"><b>${r.length}</b> نتيجة لـ «${esc(q)}»</div>` + r.slice(0, 20).map((x, i) => `<div class="item"><div class="tx"><b>${i + 1}. ${esc(x.it.title)}</b><small>${esc(SRC[x.it.src] ? SRC[x.it.src][1] : x.it.src)} · ${esc(CT[x.it.ct])} · ${esc(x.it.lv.map((l) => LV[l]).join("، "))} · درجة الصلة ${Math.round(x.score)}</small></div><button class="chip" data-h="${esc(x.it.key)}">إخفاء من النتائج</button></div>`).join("") + (r.length > 20 ? '<p class="mut">يظهر أول ٢٠ نتيجة.</p>' : "") + (r.length ? "" : '<p class="mut">لا نتائج. يمكنك إضافة كلمة بديلة أو كلمة مفتاحية للمحتوى المناسب.</p>');
    $$("[data-h]", o).forEach((b) => (b.onclick = async () => { const it = X.all.find((x) => x.key === b.dataset.h); if (!it || !confirm("إخفاء «" + it.title + "» من نتائج البحث؟ يبقى المحتوى في المكتبة ويمكنك إعادته من تبويب المحتوى.")) return; try { await upsertOv(it, { hidden: true }); toast("أُخفي من البحث"); reload(); } catch (er) { fail(er); } }));
  };
  let t; $("#srq", B).oninput = () => { clearTimeout(t); t = setTimeout(run, 250); };
}
function zero(B, reload) {
  const g = new Map(); QS.forEach((r) => { const e = g.get(r.q) || { q: r.q, n: 0, last: r.created_at }; e.n++; if (r.created_at > e.last) e.last = r.created_at; g.set(r.q, e); });
  const rows = [...g.values()].sort((a, b) => b.n - a.n || (a.last < b.last ? 1 : -1));
  B.innerHTML = `<p class="mut">كلمات بحث لم تُرجع أي محتوى. تُحفظ كنص قصير فقط، دون أي معرّف للزائر أو بيانات عن الطفل. أضف محتوى أو كلمة بديلة أو مفتاحية لتحسين النتائج.</p>${rows.length ? `<div class="row"><button class="btn g" id="szc">مسح السجل كله</button></div>` : ""}${rows.map((r) => `<div class="item"><div class="tx"><b>${esc(r.q)}</b><small>${r.n} مرة · آخر مرة ${esc(dayAgo(r.last))}</small></div><button class="chip" data-s="${esc(r.q)}">كلمة بديلة</button><button class="chip" data-d="${esc(r.q)}">حذف</button></div>`).join("") || '<p class="mut">لا توجد كلمات مسجّلة.</p>'}`;
  $$("[data-s]", B).forEach((b) => (b.onclick = () => editSyn({ term: b.dataset.s, alts: [], status: "on", _new: true }, () => { TAB = "syn"; reload(); })));
  $$("[data-d]", B).forEach((b) => (b.onclick = async () => { try { const q = await sb.from("search_queries").delete().eq("q", b.dataset.d); if (q.error) throw q.error; toast("تم الحذف"); reload(); } catch (er) { fail(er); } }));
  const c = $("#szc", B); if (c) c.onclick = async () => { if (!confirm("مسح كل سجل الكلمات بلا نتائج؟ لا يتأثر المحتوى.")) return; try { const q = await sb.from("search_queries").delete().gt("id", 0); if (q.error) throw q.error; toast("تم المسح"); reload(); } catch (er) { fail(er); } };
}
})();
