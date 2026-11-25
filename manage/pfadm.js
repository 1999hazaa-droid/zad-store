/* إدارة ملف إنجاز الطفل: أنواع الشهادات وشروطها وربطها بالمحتوى، نصوصها وتصميمها لكل فئة عمرية، إيقافها، عدد الصادر منها، وأخطاء التسجيل. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const KINDS = [["act", "شهادة إكمال نشاط"], ["story", "شهادة إكمال قصة"], ["ws", "شهادة إكمال أوراق عمل"], ["unit", "شهادة إكمال وحدة"], ["skill", "شهادة التقدم في مهارة"], ["challenge", "شهادة مشروع أو تحدٍّ"], ["contest", "شهادة المشاركة في مسابقة"]];
const DESIGNS = [["sun", "شمس (أصفر)"], ["leaf", "ورقة (أخضر)"], ["star", "نجمة (بنفسجي)"], ["sea", "بحر (أزرق)"], ["rose", "وردة (وردي)"], ["sky", "سماء (أزرق فاتح)"]];
const SRCS = [["acts", "الأنشطة وأوراق العمل", "activities"], ["bank", "بنك الأنشطة", "bank_items"], ["proj", "المشروعات والتحديات", "proj_items"], ["life", "المهارات الحياتية", "life_items"], ["ready", "الاستعداد المدرسي", "ready_items"], ["val", "القيم والسلوك", "val_items"], ["dig", "المهارات الرقمية", "dig_items"], ["exp", "الثقافة العامة", "exp_items"], ["vid", "الفيديوهات", "video_items"], ["songs", "الأناشيد", "song_items"], ["stories", "القصص", "stories"], ["quiz", "الاختبارات", "qz_quizzes"], ["contest", "المسابقات", null], ["skills", "مهارات متقنة في الاختبارات", null]];
const QCATS = [["", "أي مادة"], ["early", "التعلم المبكر"], ["arabic", "العربية"], ["math", "الرياضيات"], ["english", "الإنجليزية"], ["science", "العلوم"], ["values", "القيم"]];
const ST = [["draft", "مسودة"], ["active", "مفعّلة"], ["paused", "موقوفة"]], SN = Object.fromEntries(ST), KN = Object.fromEntries(KINDS), SRN = Object.fromEntries(SRCS.map((x) => [x[0], x[1]]));
const AR = /^[ء-ي٠-٩\s.،؟!:\-0-9ـً-ْ]+$/, BADW = /فشل|غبي|أحمق|أقل من|أفضل من|الأول على|الأفضل/;
let ALL = [], ISS = [], ERRS = [], FS = "";
async function load() { const r = await sb.from("pf_certs").select("*").order("sort_order").limit(300); if (r.error) throw r.error; ALL = r.data || []; const i = await sb.from("pf_issued").select("cert_slug,level").limit(20000); ISS = i.error ? [] : i.data || []; const e = await sb.from("pf_errors").select("*").order("created_at", { ascending: false }).limit(150); ERRS = e.error ? [] : e.data || []; }
const issuedOf = (s) => ISS.filter((x) => x.cert_slug === s).length;
function check(d) {
  const m = [], t = (x) => String(x == null ? "" : x).trim(), r = d.rule || {};
  if (!/^[a-z0-9_]{3,40}$/.test(t(d.slug))) m.push("المعرّف (أحرف إنجليزية صغيرة وأرقام و_)");
  if (!t(d.title) || !AR.test(t(d.title)) || BADW.test(d.title)) m.push("عنوان الشهادة (عربي مشجع بلا مقارنة)");
  if (!t(d.descr) || t(d.descr).length < 6 || t(d.descr).length > 200 || BADW.test(d.descr)) m.push("نص الشهادة (٦ إلى ٢٠٠ حرف ومشجع بلا مقارنة أو تفضيل على الآخرين)");
  if (!(d.levels || []).length) m.push("العمر أو الصف");
  if (!Array.isArray(r.src) || !r.src.length || r.src.some((x) => !SRN[x])) m.push("مصدر الإنجاز");
  if (!(+r.n >= 1 && +r.n <= 200)) m.push("عدد الإنجازات المطلوب (١ إلى ٢٠٠)");
  if (r.src && r.src.includes("skills") && !(r.rate > 0 && r.rate <= 1 && r.minAns >= 3)) m.push("شرط المهارة (نسبة وعدد إجابات)");
  return m;
}
async function checkItems(d) { const r = d.rule || {}, bad = []; if (!Array.isArray(r.items) || !r.items.length) return bad; for (const s of r.items) { let ok = false; for (const [k, , tb] of SRCS) { if (!tb || !(r.src || []).includes(k)) continue; const q = await sb.from(tb).select("slug").eq("slug", s).limit(1); if (!q.error && q.data && q.data.length) { ok = true; break; } } if (!ok) bad.push("عنصر غير موجود: " + s); } return bad; }
SUB.pfadm = { title: "إدارة ملف الإنجاز والشهادات", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>أنواع الشهادات</span></div><div class="stat"><b>${n("active")}</b><span>مفعّلة</span></div><div class="stat"><b>${ISS.length}</b><span>شهادات صدرت (عدد فقط)</span></div><div class="stat"><b>${ERRS.length}</b><span>أخطاء تسجيل</span></div></div>
  <p class="mut">الشهادة تصدر للطفل تلقائيًا فقط عندما تتحقق بياناته الفعلية في الأنشطة (لا بزر). ملف الطفل وأعماله محفوظان على جهازه فقط ولا تراها الإدارة؛ هنا أنواع الشهادات وشروطها وعدد الصادر منها دون أي بيانات عن الأطفال. تعديل شروط شهادة لا يسحب شهادة صدرت من قبل. الإيقاف يمنع إصدارها لاحقًا.</p>
  <div class="row"><button class="btn" id="pfn1">➕ نوع شهادة جديد</button><button class="btn g" id="pfer">⚠️ أخطاء التسجيل (${ERRS.length})</button></div><div id="pfres"></div><div class="chips" id="pfch" style="margin-top:8px"></div><div id="pfls"></div>`;
  const draw = () => {
    $("#pfch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    const list = ALL.filter((x) => !FS || x.status === FS);
    $("#pfls").innerHTML = list.length ? list.map((x) => { const ms = check(x); return `<div class="item" data-i="${x.id}"><div class="tx"><b>${esc(x.title)}</b><small>${esc(KN[x.kind])} · ${esc(x.levels.map((l) => (LEVELS.find((a) => a[0] === l) || [])[1]).join("، "))} · ${esc(SN[x.status])} · صدر: ${issuedOf(x.slug)}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا نتائج.</p>`;
    $$("#pfch [data-s]").forEach((b) => (b.onclick = () => { FS = b.dataset.s; draw(); }));
    $$("#pfls [data-i]").forEach((b) => (b.onclick = () => edit(ALL.find((x) => String(x.id) === b.dataset.i), () => view(m))));
  };
  draw(); $("#pfn1").onclick = () => edit(null, () => view(m));
  $("#pfer").onclick = () => { const o = $("#pfres"); o.innerHTML = ERRS.length ? `<div class="card"><b>أخطاء تسجيل الإنجازات</b><p class="mut">تُرسل تلقائيًا عند تعذر جلب بيانات أو عند شرط شهادة غير صالح (دون بيانات عن الطفل).</p><ul>${ERRS.slice(0, 60).map((e) => `<li>${esc(e.kind)} — ${esc(e.msg)} <small>(${esc(String(e.created_at).slice(0, 10))})</small></li>`).join("")}</ul><button class="btn g" id="pfec">مسح السجل بعد المراجعة</button></div>` : `<div class="card"><b style="color:var(--ok)">لا أخطاء مسجلة.</b></div>`; const c = $("#pfec"); if (c) c.onclick = async () => { if (!confirm("مسح سجل الأخطاء؟ (لا يمس الشهادات)")) return; const r = await sb.from("pf_errors").delete().gt("id", 0); if (r.error) return fail(r.error); toast("تم المسح"); view(m); }; };
} };
function edit(a, reload) {
  const isNew = !a, d = a ? Object.assign({}, a, { levels: a.levels.slice(), rule: JSON.parse(JSON.stringify(a.rule || {})) }) : { slug: "", title: "", kind: "act", levels: [], design: "sun", descr: "", rule: { src: [], n: 3 }, status: "draft", sort_order: 200 };
  const r = d.rule, T = (id, l, v, dir) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}" ${dir ? `dir="${dir}"` : ""}></label>`, O = (arr, v) => arr.map(([k, x]) => `<option value="${k}" ${v === k ? "selected" : ""}>${x}</option>`).join("");
  const s = sheet(`<h2>${isNew ? "نوع شهادة جديد" : "تعديل الشهادة"}</h2>${T("pfti", "عنوان الشهادة (مشجع بلا مقارنة)", d.title)}${isNew ? T("pfsl", "المعرّف (إنجليزي صغير، لا يتغير لاحقًا)", d.slug, "ltr") : `<p class="mut">المعرّف: ${esc(d.slug)}</p>`}
  <label class="f"><span>نوع الشهادة</span><select id="pfkd">${O(KINDS, d.kind)}</select></label>
  <label class="f"><span>نص الشهادة القصير المشجع</span><textarea id="pfde" rows="2" maxlength="200" dir="auto">${esc(d.descr)}</textarea></label>
  <p style="margin:10px 2px 4px;font-weight:700">الفئة العمرية أو الصف (لكل فئة تصميم مناسب: الصغار ٢–٣ ألوان هادئة ورسوم، الصفوف إنجاز واضح)</p><div class="chips" id="pflv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  <label class="f"><span>تصميم الشهادة</span><select id="pfdg">${O(DESIGNS, d.design)}</select></label>
  <p style="margin:12px 2px 4px;font-weight:700">شرط الحصول (من نشاط الطفل الفعلي)</p><div class="chips" id="pfsr">${SRCS.map(([k, l]) => `<button type="button" class="chip ${(r.src || []).includes(k) ? "on" : ""}" data-s="${k}">${l}</button>`).join("")}</div>
  <label class="f"><span>عدد الإنجازات المطلوب (١ إلى ٢٠٠)</span><input type="number" id="pfn" min="1" max="200" value="${esc(r.n || 1)}"></label>
  <label class="f"><span>مادة الاختبارات (للاختبارات والمهارات)</span><select id="pfqc">${O(QCATS, r.qcat || "")}</select></label>
  <label class="f"><span>ربط بعناصر محددة فقط (اختياري): معرّفات مفصولة بفاصلة، مثل q_mat01,q_mat02</span><input type="text" id="pfit" dir="ltr" value="${esc((r.items || []).join(","))}"></label>
  <label class="f"><span>للمهارات: أقل عدد إجابات / نسبة الصحة (0.5 إلى 1)</span><span style="display:flex;gap:8px"><input type="number" id="pfma" min="3" value="${esc(r.minAns || 6)}" style="width:50%"><input type="number" id="pfrt" min="0.5" max="1" step="0.05" value="${esc(r.rate || 0.75)}" style="width:50%"></span></label>
  <label class="f"><span>الحالة</span><select id="pfst">${O(ST, d.status)}</select></label>
  <p id="pfmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p><p id="pfchk" class="mut"></p>
  <div class="row"><button class="btn" id="pfsv">حفظ</button><button class="btn g" id="pfpv">معاينة الشهادة</button><button class="btn g" id="pfx">إغلاق</button></div>${isNew ? "" : `<div class="row"><button class="btn g" id="pfdl" style="color:var(--no)">🗑 حذف نوع الشهادة</button></div>`}`);
  $("#pfx", s).onclick = closeSheet;
  $$("#pflv [data-l]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); }));
  $$("#pfsr [data-s]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.s, a2 = (r.src = r.src || []), i = a2.indexOf(k); if (i < 0) a2.push(k); else a2.splice(i, 1); b.classList.toggle("on", i < 0); }));
  const collect = () => { d.title = $("#pfti", s).value.trim(); if (isNew) d.slug = $("#pfsl", s).value.trim(); d.kind = $("#pfkd", s).value; d.descr = $("#pfde", s).value.trim(); d.design = $("#pfdg", s).value; d.status = $("#pfst", s).value; r.n = parseInt($("#pfn", s).value, 10) || 0; const qc = $("#pfqc", s).value; if (qc) r.qcat = qc; else delete r.qcat; const it = $("#pfit", s).value.split(",").map((x) => x.trim()).filter(Boolean); if (it.length) r.items = it; else delete r.items; if ((r.src || []).includes("skills")) { r.minAns = parseInt($("#pfma", s).value, 10) || 0; r.rate = parseFloat($("#pfrt", s).value) || 0; } else { delete r.minAns; delete r.rate; } };
  $("#pfpv", s).onclick = () => { collect(); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; const young = d.levels.every((l) => l === "a2" || l === "a3");
    const col = { sun: ["#7c4dff", "#fff4c9"], leaf: ["#2e9d57", "#f1fbf4"], star: ["#5b2db7", "#f4eeff"], sea: ["#1976b8", "#eaf6ff"], rose: ["#c2417c", "#fff0f5"], sky: ["#3d5bd9", "#eef3ff"] }[d.design] || ["#7c4dff", "#fff4c9"];
    o.innerHTML = `<div class="sheet" style="max-width:640px;width:100%"><h2>معاينة (اسم الطفل تجريبي)</h2><div style="border:8px solid ${col[0]};background:${col[1]};border-radius:22px;padding:8px"><div style="border:3px dashed ${col[0]};border-radius:14px;padding:18px;text-align:center;font-family:inherit"><div style="color:${col[0]};font-weight:800">منصة زاد التعليمية</div><div style="color:${col[0]};font-weight:900;font-size:${young ? 26 : 22}px">شهادة إنجاز</div><div style="color:#666">تُمنح إلى</div><div style="font-weight:900;font-size:26px">اسم الطفل</div><div style="color:${col[0]};font-weight:900;font-size:20px;margin:6px 0">${esc(d.title)}</div><div style="font-weight:700">${esc(d.descr)}</div></div></div><div class="row"><button class="btn g" id="pvx">إغلاق</button></div></div>`; document.body.appendChild(o); $("#pvx", o).onclick = () => o.remove(); };
  $("#pfsv", s).onclick = async () => {
    collect(); const miss = check(d); const out = $("#pfmiss", s);
    if (d.status === "active") { if (miss.length) { out.textContent = "لا يمكن التفعيل قبل اكتمال: " + miss.slice(0, 5).join("، "); return; } const bad = await checkItems(d); if (bad.length) { out.textContent = "لا يمكن التفعيل: " + bad.join("، "); return; } } else if (!d.title || !/^[a-z0-9_]{3,40}$/.test(d.slug)) { out.textContent = "اكتب العنوان والمعرّف"; return; }
    out.textContent = ""; $("#pfsv", s).disabled = true;
    try { const row = { slug: d.slug, title: d.title, kind: d.kind, levels: d.levels, design: d.design, descr: d.descr, rule: d.rule, status: d.status, sort_order: d.sort_order }; const q = isNew ? await sb.from("pf_certs").insert(row) : await sb.from("pf_certs").update(row).eq("id", d.id); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { $("#pfsv", s).disabled = false; fail(e); }
  };
  const del = $("#pfdl", s); if (del) del.onclick = async () => { if (!confirm("حذف نوع الشهادة نهائيا؟ لا تُحذف الشهادات التي حصل عليها الأطفال لكنها لن تظهر. (للإيقاف فقط اختر «موقوفة»)")) return; try { const q = await sb.from("pf_certs").delete().eq("id", d.id); if (q.error) throw q.error; toast("تم الحذف"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
window.__pfTest = { check };
})();
