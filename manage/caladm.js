/* إدارة التقويم التعليمي: أنشطة مجدولة مرتبطة بمحتوى المكتبة، مواضيع ومناسبات موسمية، فحص الروابط.
   لا يُنشر نشاط إلا إذا كان مرتبطًا بصف منشور فعلًا، ولا تُنشر مناسبة إلا بتاريخ مؤكد بعد المراجعة. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = { lib: "أنشطة المكتبة", ws: "أوراق العمل", story: "القصص التعليمية", home: "الأنشطة المنزلية", proj: "المشروعات التعليمية", exp: "التجارب العلمية الآمنة", art: "الأنشطة الفنية", challenge: "التحديات والمسابقات", occasion: "المناسبات والموضوعات الموسمية" };
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SRC = { acts: ["activities", "أنشطة وأوراق عمل"], bank: ["bank_items", "بنك الأنشطة"], proj: ["proj_items", "مشاريع"], life: ["life_items", "مهارات حياتية"], ready: ["ready_items", "استعداد مدرسي"], val: ["val_items", "قيم"], vid: ["video_items", "فيديو"], songs: ["song_items", "أناشيد"], stories: ["stories", "قصص"] };
const ST_N = { draft: "مسودة", review: "قيد المراجعة", published: "منشور", cancelled: "ملغى" }, TS_N = { review: "قيد المراجعة", published: "منشور", off: "متوقف" }, TK = { season: "موسم", theme: "موضوع", occasion: "مناسبة بتاريخ" };
const AR = /^[ء-ي٠-٩\s.،؟!:\-ـً-ْ«»()]+$/;
let TAB = "ev", EV = [], TP = [], DOMS = [], ERRS = [];
const okDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || "") && !isNaN(Date.parse(s + "T12:00:00")) && new Date(s + "T12:00:00").toISOString().slice(0, 10) === s;
function chkEv(e, ctx) {
  const m = [], c = ctx.content, tp = ctx.topic;
  if (!e.title || e.title.length < 3 || e.title.length > 100 || !AR.test(e.title)) m.push("العنوان (عربي من ٣ إلى ١٠٠ حرف)");
  if (!CATS[e.kind]) m.push("الفئة");
  if (!okDate(e.starts)) m.push("تاريخ النشاط غير صحيح"); else if (e.ends && (!okDate(e.ends) || e.ends < e.starts)) m.push("تاريخ النهاية قبل البداية أو غير صحيح");
  if (!Array.isArray(e.levels) || !e.levels.length || e.levels.some((l) => !LV[l])) m.push("المستويات (واحد على الأقل، ضمن سنة–٦ سنوات والصفوف ١–٤ فقط)");
  if (!SRC[e.src] || !e.slug) m.push("ربط المحتوى (اختر عنصرًا من المكتبة)");
  else if (!c) m.push("المحتوى المرتبط غير موجود أو غير منشور");
  else if (c.levels && Array.isArray(e.levels) && e.levels.some((l) => !c.levels.includes(l))) m.push("مستوى النشاط أوسع من مستوى المحتوى المرتبط");
  if (!e.descr || e.descr.length < 10 || e.descr.length > 300) m.push("الوصف (١٠ إلى ٣٠٠ حرف)");
  if (e.image_url && !/^(images\/[\w\-./]+|https:\/\/[^\s"'<>]+)$/.test(e.image_url)) m.push("رابط الصورة (مسار images/… أو https)");
  if (e.minutes != null && !(Number.isInteger(e.minutes) && e.minutes >= 1 && e.minutes <= 180)) m.push("المدة (١–١٨٠ دقيقة أو فارغة)");
  if (e.needs_prep && (!e.prep_note || e.prep_note.trim().length < 5 || e.prep_note.length > 200)) m.push("وصف التجهيزات (٥–٢٠٠ حرف)");
  if (!e.publish_at || isNaN(Date.parse(e.publish_at))) m.push("موعد النشر");
  if (!["draft", "review", "published", "cancelled"].includes(e.status)) m.push("الحالة");
  if (e.kind === "occasion") { if (!tp) m.push("المناسبة تحتاج موضوعًا/مناسبة مرتبطة"); else if (tp.kind === "occasion" && e.status === "published" && (!tp.confirmed || !tp.date_from)) m.push("لا تُنشر مناسبة بتاريخ غير مؤكد"); }
  if (e.topic && !tp) m.push("الموضوع غير موجود");
  if (tp && tp.kind === "occasion" && tp.date_from && okDate(e.starts) && (e.starts < tp.date_from || e.starts > (tp.date_to || tp.date_from))) m.push("تاريخ النشاط خارج تاريخ المناسبة المؤكد");
  return m;
}
function chkTopic(t) {
  const m = [];
  if (!t.title || t.title.length < 2 || t.title.length > 60 || !AR.test(t.title)) m.push("الاسم (عربي ٢–٦٠ حرفًا)");
  if (!TK[t.kind]) m.push("النوع");
  if (t.date_from && !okDate(t.date_from)) m.push("تاريخ البداية"); if (t.date_to && (!okDate(t.date_to) || (t.date_from && t.date_to < t.date_from))) m.push("تاريخ النهاية");
  if (t.kind === "occasion" && t.status === "published" && (!t.confirmed || !t.date_from)) m.push("لا تُنشر مناسبة إلا بتاريخ مؤكد (علامة «مؤكد» وتاريخ بداية)");
  if (!["review", "published", "off"].includes(t.status)) m.push("الحالة");
  return m;
}
async function load() {
  const a = await sb.from("cal_events").select("*").order("starts", { ascending: false }).limit(500); EV = a.error ? [] : a.data || [];
  const b = await sb.from("cal_topics").select("*").order("sort_order").limit(100); TP = b.error ? [] : b.data || [];
  const c = await sb.from("rp_config").select("slug,title").eq("kind", "domain").eq("status", "active"); DOMS = c.error ? [] : c.data || [];
  const e = await sb.from("pf_errors").select("*").eq("kind", "cal-link").order("created_at", { ascending: false }).limit(50); ERRS = e.error ? [] : e.data || [];
}
async function content(src, slug) { if (!SRC[src] || !slug) return null; const cols = src === "acts" ? "slug,title" : "slug,title,levels"; const q = await sb.from(SRC[src][0]).select(cols).eq("status", "published").eq("slug", slug).limit(1); return q.error || !q.data || !q.data[0] ? null : q.data[0]; }
const dt = (s) => s ? new Date(s).toISOString().slice(0, 16) : "";
SUB.caladm = { title: "إدارة التقويم التعليمي", fn: async function view(m) {
  await load();
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">كل نشاط هنا مرتبط بعنصر منشور في المكتبة. التقويم الشخصي للأطفال يُبنى على أجهزة الأهل ولا يُحفظ هنا. المناسبات الثقافية والوطنية لا تُنشر إلا بعد مراجعتها وبتاريخ مؤكد.</p>
  <div class="chips" id="clt">${[["ev", "الأنشطة المجدولة"], ["tp", "المواضيع والمناسبات"], ["lk", "فحص الروابط"]].map(([k, l]) => `<button class="chip ${TAB === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div><div id="clb"></div>`;
  $$("#clt [data-t]", m).forEach((b) => (b.onclick = () => { TAB = b.dataset.t; view(m); }));
  const B = $("#clb", m), reload = () => view(m);
  if (TAB === "ev") {
    B.innerHTML = `<div class="row"><button class="btn" id="cln">+ نشاط جديد</button></div>${EV.map((e) => `<div class="item" data-i="${e.id}"><div class="tx"><b>${esc(e.title)}</b><small>${esc(e.starts)} · ${esc(CATS[e.kind] || e.kind)} · ${esc(ST_N[e.status] || e.status)} · ${(e.levels || []).map((l) => LV[l]).join("، ")}</small></div></div>`).join("") || '<p class="mut">لا أنشطة بعد.</p>'}`;
    $$("[data-i]", B).forEach((n) => (n.onclick = () => editEv(EV.find((x) => x.id === n.dataset.i), reload)));
    $("#cln", B).onclick = () => editEv({ title: "", kind: "lib", starts: new Date().toISOString().slice(0, 10), ends: null, levels: [], src: "bank", slug: "", descr: "", image_url: null, minutes: null, needs_prep: false, prep_note: null, publish_at: new Date().toISOString(), topic: null, status: "draft", domain: null, _new: true }, reload);
  } else if (TAB === "tp") {
    B.innerHTML = `<div class="row"><button class="btn" id="clt2">+ موضوع أو مناسبة</button></div>${TP.map((t) => `<div class="item" data-s="${esc(t.slug)}"><div class="tx"><b>${esc(t.title)}</b><small>${esc(TK[t.kind])} · ${esc(TS_N[t.status])}${t.date_from ? " · " + esc(t.date_from) + (t.date_to ? " إلى " + esc(t.date_to) : "") : " · بلا تاريخ"}${t.kind === "occasion" ? (t.confirmed ? " · مؤكد" : " · غير مؤكد") : ""}</small></div></div>`).join("")}`;
    $$("[data-s]", B).forEach((n) => (n.onclick = () => editTp(TP.find((x) => x.slug === n.dataset.s), reload)));
    $("#clt2", B).onclick = () => editTp({ slug: "t_" + Math.random().toString(36).slice(2, 7), title: "", kind: "theme", date_from: null, date_to: null, confirmed: false, note: "", status: "review", sort_order: 100, _new: true }, reload);
  } else {
    B.innerHTML = `<div class="card"><button class="btn" id="clk">فحص روابط كل الأنشطة المنشورة</button><div id="clr"></div></div>${ERRS.length ? `<div class="card"><b>أخطاء مسجّلة من الزوار</b><ul>${ERRS.map((e) => `<li>${esc((e.msg || "").slice(0, 160))} · ${esc(String(e.created_at).slice(0, 10))}</li>`).join("")}</ul></div>` : '<p class="mut">لا أخطاء روابط مسجّلة.</p>'}`;
    $("#clk", B).onclick = async () => { const o = $("#clr", B); o.innerHTML = '<p class="mut">جارٍ الفحص…</p>'; const bad = []; const live = EV.filter((e) => e.status === "published"); for (const e of live) { const c = await content(e.src, e.slug); const ms = chkEv(e, { content: c, topic: TP.find((t) => t.slug === e.topic) }); if (ms.length) bad.push(`${e.title}: ${ms.join("، ")}`); } o.innerHTML = bad.length ? `<p style="color:var(--no);font-weight:700">${bad.length} من ${live.length} يحتاج تصحيحًا:</p><ul>${bad.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p>سليمة: ${live.length} نشاطًا منشورًا مرتبطًا بمحتوى موجود.</p>`; };
  }
} };
function editEv(e, reload) {
  const x = Object.assign({}, e), lv = new Set(x.levels || []); let linkTitle = "";
  const s = sheet(`<h2>${x._new ? "نشاط جديد" : "تعديل النشاط"}</h2>
  <label class="f"><span>العنوان</span><input type="text" id="ce1" maxlength="100" value="${esc(x.title)}"></label>
  <label class="f"><span>الفئة</span><select id="ce2">${Object.entries(CATS).map(([k, l]) => `<option value="${k}" ${x.kind === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
  <label class="f"><span>التاريخ / النهاية (اختياري)</span><span style="display:flex;gap:8px"><input type="date" id="ce3" value="${esc(x.starts || "")}" style="width:50%"><input type="date" id="ce4" value="${esc(x.ends || "")}" style="width:50%"></span></label>
  <p style="margin:8px 2px 4px;font-weight:700">المستويات</p><div class="chips" id="ce5">${Object.entries(LV).map(([k, l]) => `<button type="button" class="chip ${lv.has(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  <label class="f"><span>المجال (اختياري)</span><select id="ce6"><option value="">تلقائي</option>${DOMS.map((d) => `<option value="${esc(d.slug)}" ${x.domain === d.slug ? "selected" : ""}>${esc(d.title)}</option>`).join("")}</select></label>
  <div class="card"><b>المحتوى المرتبط</b><p id="ce7" class="mut">${x.slug ? esc(x.src + " / " + x.slug) : "لم يُختر بعد"}</p><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="ce8">${Object.entries(SRC).map(([k, v]) => `<option value="${k}" ${x.src === k ? "selected" : ""}>${v[1]}</option>`).join("")}</select><input type="text" id="ce9" placeholder="جزء من العنوان" style="flex:1;min-width:140px"><button class="btn g" type="button" id="cea">بحث</button></div><div id="ceb"></div></div>
  <label class="f"><span>وصف قصير</span><textarea id="cec" rows="3" maxlength="300" dir="auto">${esc(x.descr)}</textarea></label>
  <label class="f"><span>مسار صورة (اختياري؛ images/… أو https، وإلا تُستخدم صورة المحتوى)</span><input type="text" id="ced" dir="ltr" value="${esc(x.image_url || "")}"></label>
  <label class="f"><span>المدة بالدقائق (اتركها فارغة إن لم تكن محددة)</span><input type="number" id="cee" min="1" max="180" value="${esc(x.minutes == null ? "" : x.minutes)}"></label>
  <label class="f"><span><input type="checkbox" id="cef" ${x.needs_prep ? "checked" : ""}> يحتاج تجهيزًا منزليًا (يمنع زر «بدء النشاط» المباشر)</span></label><label class="f"><span>وصف التجهيزات</span><input type="text" id="ceg" maxlength="200" value="${esc(x.prep_note || "")}"></label>
  <label class="f"><span>موعد النشر</span><input type="datetime-local" id="ceh" value="${esc(dt(x.publish_at))}"></label>
  <label class="f"><span>الموضوع / المناسبة (اختياري)</span><select id="cei"><option value="">بدون</option>${TP.map((t) => `<option value="${esc(t.slug)}" ${x.topic === t.slug ? "selected" : ""}>${esc(t.title)}</option>`).join("")}</select></label>
  <label class="f"><span>الحالة</span><select id="cej">${Object.entries(ST_N).map(([k, l]) => `<option value="${k}" ${x.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
  <p id="cer" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="cesv">حفظ</button>${x._new ? "" : '<button class="btn g" id="cedl">حذف</button>'}<button class="btn g" id="cex">إغلاق</button></div>`);
  $("#cex", s).onclick = closeSheet;
  $$("#ce5 [data-l]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.l; lv.has(k) ? lv.delete(k) : lv.add(k); b.classList.toggle("on", lv.has(k)); }));
  $("#cea", s).onclick = async () => { const src = $("#ce8", s).value, q = $("#ce9", s).value.trim(); try { let qq = sb.from(SRC[src][0]).select("slug,title").eq("status", "published").order("title").limit(15); if (q) qq = qq.ilike("title", "%" + q.replace(/[%,()]/g, "") + "%"); const r = await qq; if (r.error) throw r.error; $("#ceb", s).innerHTML = (r.data || []).map((c, i) => `<div class="item" data-c="${i}"><div class="tx"><b>${esc(c.title)}</b><small>${esc(c.slug)}</small></div></div>`).join("") || '<p class="mut">لا نتائج.</p>'; $$("[data-c]", $("#ceb", s)).forEach((n) => (n.onclick = () => { const c = r.data[+n.dataset.c]; x.src = src; x.slug = c.slug; linkTitle = c.title; $("#ce7", s).textContent = c.title + " (" + src + ")"; if (!$("#ce1", s).value) $("#ce1", s).value = c.title; })); } catch (er) { fail(er); } };
  $("#cesv", s).onclick = async () => {
    const row = { title: $("#ce1", s).value.trim(), kind: $("#ce2", s).value, starts: $("#ce3", s).value, ends: $("#ce4", s).value || null, levels: [...lv], domain: $("#ce6", s).value || null, src: x.src, slug: x.slug, descr: $("#cec", s).value.trim(), image_url: $("#ced", s).value.trim() || null, minutes: $("#cee", s).value ? parseInt($("#cee", s).value, 10) : null, needs_prep: $("#cef", s).checked, prep_note: $("#ceg", s).value.trim() || null, publish_at: $("#ceh", s).value ? new Date($("#ceh", s).value).toISOString() : "", topic: $("#cei", s).value || null, status: $("#cej", s).value, updated_at: new Date().toISOString() };
    const c = await content(row.src, row.slug), ms = chkEv(row, { content: c, topic: TP.find((t) => t.slug === row.topic) }); if (ms.length) { $("#cer", s).textContent = "صحّح: " + ms.join("، "); return; }
    try { const q = x._new ? await sb.from("cal_events").insert(row) : await sb.from("cal_events").update(row).eq("id", x.id); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (er) { fail(er); }
  };
  if (!x._new) $("#cedl", s).onclick = async () => { if (!confirm("حذف هذا النشاط من التقويم نهائيًا؟ (يمكنك بدلًا من ذلك تغيير حالته إلى «ملغى»). المحتوى نفسه في المكتبة لا يُحذف.")) return; try { const q = await sb.from("cal_events").delete().eq("id", x.id); if (q.error) throw q.error; toast("تم الحذف"); closeSheet(); reload(); } catch (er) { fail(er); } };
}
function editTp(t, reload) {
  const s = sheet(`<h2>${t._new ? "موضوع أو مناسبة جديدة" : "تعديل"}</h2><label class="f"><span>الاسم</span><input type="text" id="ct1" maxlength="60" value="${esc(t.title)}"></label>
  <label class="f"><span>النوع</span><select id="ct2">${Object.entries(TK).map(([k, l]) => `<option value="${k}" ${t.kind === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
  <label class="f"><span>من / إلى (للمناسبات فقط، وبتاريخ مؤكد من مصدر موثوق)</span><span style="display:flex;gap:8px"><input type="date" id="ct3" value="${esc(t.date_from || "")}" style="width:50%"><input type="date" id="ct4" value="${esc(t.date_to || "")}" style="width:50%"></span></label>
  <label class="f"><span><input type="checkbox" id="ct5" ${t.confirmed ? "checked" : ""}> التاريخ مؤكد وتمت مراجعة ملاءمة المناسبة للأطفال والمنصة</span></label>
  <label class="f"><span>ملاحظة المراجعة</span><input type="text" id="ct6" maxlength="200" value="${esc(t.note || "")}"></label>
  <label class="f"><span>الحالة</span><select id="ct7">${Object.entries(TS_N).map(([k, l]) => `<option value="${k}" ${t.status === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
  <p id="cte" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="ctsv">حفظ</button>${t._new ? "" : '<button class="btn g" id="ctdl">حذف</button>'}<button class="btn g" id="ctx">إغلاق</button></div>`);
  $("#ctx", s).onclick = closeSheet;
  $("#ctsv", s).onclick = async () => { const row = { slug: t.slug, title: $("#ct1", s).value.trim(), kind: $("#ct2", s).value, date_from: $("#ct3", s).value || null, date_to: $("#ct4", s).value || null, confirmed: $("#ct5", s).checked, note: $("#ct6", s).value.trim() || null, status: $("#ct7", s).value, sort_order: t.sort_order || 100, updated_at: new Date().toISOString() }; const ms = chkTopic(row); if (ms.length) { $("#cte", s).textContent = "صحّح: " + ms.join("، "); return; } try { const q = t._new ? await sb.from("cal_topics").insert(row) : await sb.from("cal_topics").update(row).eq("slug", t.slug); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (er) { fail(er); } };
  if (!t._new) $("#ctdl", s).onclick = async () => { if (!confirm("حذف هذا الموضوع؟ الأنشطة المرتبطة به تبقى دون موضوع.")) return; try { const q = await sb.from("cal_topics").delete().eq("slug", t.slug); if (q.error) throw q.error; toast("تم الحذف"); closeSheet(); reload(); } catch (er) { fail(er); } };
}
window.__calTest = { chkEv, chkTopic };
})();
