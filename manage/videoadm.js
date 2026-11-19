/* إدارة الفيديوهات والدروس المصورة: درس مصور أصلي أو فيديو مرخص (رابط https)، عمر وصف ومادة وتصنيف ومهارة ومدة، نشاط، ربط بقسم، مصدر وترخيص، معاينة وفحص التشغيل، مسودة/نشر/إخفاء/ترتيب — داخل لوحة زاد المحمية. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["letters", "الحروف واللغة العربية"], ["math", "الأرقام والرياضيات"], ["english", "اللغة الإنجليزية"], ["science", "العلوم والطبيعة"], ["living", "الحيوانات والنباتات"], ["body", "جسم الإنسان والصحة"], ["space", "الفضاء والاكتشاف"], ["values", "القيم والسلوك الإيجابي"], ["life", "المهارات الحياتية"], ["ready", "الاستعداد المدرسي"], ["art", "الرسم والأشغال الفنية"], ["songs", "الأناشيد التعليمية"], ["review", "المراجعة والشرح المدرسي"]];
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const LINKS = [["", "بدون رابط"], ["language/", "اللغة والبطاقات"], ["tests/", "التمارين والاختبارات"], ["wiki/", "الموسوعة"], ["explore/", "الثقافة والاستكشاف"], ["values/", "القيم والقصص"], ["life/", "المهارات الحياتية"], ["ready/", "الاستعداد المدرسي"], ["arts/", "الإبداع والفنون"], ["songs/", "الأناشيد"], ["summaries/", "الملخصات والمراجعات"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "مخفي"]];
const CN = Object.fromEntries(CATS), SN = Object.fromEntries(ST);
const IC = (c) => (String(c).startsWith("dg_") ? `../images/dig/${c}.svg` : String(c).startsWith("rd_") ? `../images/ready/${c}.svg` : `../images/zad/${c}.webp`);
const AR = /^[ء-ي٠-٩\s.،؟!:\-0-9]+$/, EN = /^[ء-يA-Za-z0-9\s.,،؟?!:'\-]+$/;
let ALL = [], FS = "", FC = "", FQ = "";
const parseScenes = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean).map((l) => { const i = l.lastIndexOf("|"); return i < 0 ? { t: l, img: "" } : { t: l.slice(0, i).trim(), img: l.slice(i + 1).trim() }; });
function check(d) {
  const m = [], ok = (t) => (d.cat === "english" ? EN : AR).test(String(t || "").trim());
  if (!d.title) m.push("العنوان"); else if (!ok(d.title)) m.push("حروف العنوان");
  if (!(d.levels || []).length) m.push("العمر أو الصف");
  if (!d.subject) m.push("المادة"); if (!d.skill || !ok(d.skill)) m.push("المهارة التعليمية"); if (!d.descr || !ok(d.descr)) m.push("الوصف");
  if (!d.duration_s || d.duration_s < 5) m.push("المدة بالثواني");
  if (d.kind === "file") { if (!/^https:\/\//.test(d.video_url || "")) m.push("رابط الفيديو يبدأ بـ https"); if (!d.source) m.push("المصدر"); if (!d.license) m.push("الترخيص أو إذن العرض"); }
  else { const S = d.scenes || []; if (S.length < 3 || S.length > 8) m.push("من ثلاثة إلى ثمانية مشاهد"); S.forEach((s, i) => { if (!ok(s.t)) m.push("حروف المشهد " + (i + 1)); if (!s.img) m.push("صورة المشهد " + (i + 1)); }); }
  const q = d.quiz || {}; if (!q.q || !ok(q.q)) m.push("سؤال النشاط"); if (!Array.isArray(q.o) || q.o.length !== 3 || new Set(q.o).size !== 3 || !q.o.every(ok)) m.push("ثلاثة خيارات مختلفة (الصحيح أولا)"); if (!q.why || !ok(q.why)) m.push("تفسير الإجابة");
  if (!d.reviewed) m.push("تأكيد المراجعة"); if (!d.review_note) m.push("ملاحظة المراجعة");
  return m;
}
async function load() { const r = await sb.from("video_items").select("*").order("cat").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
SUB.videoadm = { title: "إدارة الفيديوهات", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div></div>
  <p class="mut">الأولوية للدروس الأصلية. للفيديو الخارجي أدخل رابط https مباشرا لملف مرخص أو مسموح عرضه، وسجل المصدر والترخيص، وافحص التشغيل قبل النشر. لا رفع مباشر للملفات من هنا بعد، ولا يُنشر ما كان ناقصا أو معطلا. غير المنشور لا يراه الزوار.</p>
  <div class="row"><button class="btn" id="fn">➕ درس جديد</button></div>
  <input type="search" id="fqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="fch" style="margin-top:8px"></div><div class="chips" id="fcc" style="margin-top:6px"></div><div id="fls"></div>`;
  const draw = () => {
    $("#fch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#fcc").innerHTML = [["", "كل التصنيفات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.cat === FC) && (!q || x.title.toLowerCase().includes(q)));
    $("#fls").innerHTML = list.length ? list.map((x) => { const ms = check(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "i_tablet"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.cat])} · ${esc(SN[x.status])} · ${x.kind === "file" ? "فيديو مرخص" : "درس مصور"} · ترتيب ${x.sort_order}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا نتائج.</p>`;
    $$("#fch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#fcc [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#fls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => String(x.id) === b.dataset.i), () => view(m)));
  };
  draw(); $("#fqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#fn").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), scenes: (a.scenes || []).map((s) => Object.assign({}, s)), quiz: Object.assign({ q: "", o: ["", "", ""], a: 0, why: "" }, a.quiz), link: Object.assign({ href: "", label: "" }, a.link) }) : { slug: "vd-" + Date.now().toString(36), cat: "letters", title: "", icon: "i_tablet", levels: [], subject: "", skill: "", descr: "", kind: "anim", scenes: [], video_url: "", poster_url: "", source: "", license: "", duration_s: 0, quiz: { q: "", o: ["", "", ""], a: 0, why: "" }, link: { href: "", label: "" }, review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}"></label>`;
  const s = sheet(`<h2>${isNew ? "درس جديد" : "تعديل الدرس"}</h2>
  ${T("ft", "العنوان", d.title)}<label class="f"><span>التصنيف</span><select id="fc">${CATS.map(([k, x]) => `<option value="${k}" ${d.cat === k ? "selected" : ""}>${x}</option>`).join("")}</select></label>
  <label class="f"><span>نوع المحتوى</span><select id="fk"><option value="anim" ${d.kind === "anim" ? "selected" : ""}>درس مصور أصلي (مشاهد)</option><option value="file" ${d.kind === "file" ? "selected" : ""}>فيديو مرخص (رابط https)</option></select></label>
  ${T("fsb", "المادة", d.subject)}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="flv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("fic", "الصورة المصغرة (اسم ملف كرتوني من images/zad بدون الامتداد)", d.icon)}${T("fsk", "المهارة التعليمية", d.skill)}
  <label class="f"><span>وصف قصير</span><textarea id="fde" rows="2" dir="auto">${esc(d.descr || "")}</textarea></label>
  <label class="f"><span>المشاهد (للدرس المصور): سطر لكل مشهد بالشكل  النص | رمز الصورة</span><textarea id="fsc" rows="6" dir="auto">${esc(d.scenes.map((x) => x.t + " | " + x.img).join("\n"))}</textarea></label>
  ${T("fvu", "رابط الفيديو المباشر (https، للنوع المرخص)", d.video_url)}${T("fpu", "رابط صورة مصغرة للفيديو (اختياري، https)", d.poster_url)}${T("fso", "مصدر الفيديو", d.source)}${T("flc", "الترخيص أو إذن العرض", d.license)}
  <label class="f"><span>المدة بالثواني</span><input type="number" id="fdu" min="5" value="${d.duration_s || ""}"></label>
  ${T("fq", "سؤال النشاط", d.quiz.q)}${T("fo1", "الخيار الصحيح (يُخلط تلقائيا)", d.quiz.o[0])}${T("fo2", "خيار آخر", d.quiz.o[1])}${T("fo3", "خيار ثالث", d.quiz.o[2])}${T("fw", "تفسير الإجابة", d.quiz.why)}
  <label class="f"><span>الربط بقسم في المكتبة (ورقة عمل أو اختبار أو نشاط)</span><select id="flk">${LINKS.map(([k, x]) => `<option value="${k}" ${d.link.href === k ? "selected" : ""}>${x}</option>`).join("")}${d.link.href && !LINKS.some((x) => x[0] === d.link.href) ? `<option value="${esc(d.link.href)}" selected>${esc(d.link.href)}</option>` : ""}</select></label>${T("fll", "نص زر الانتقال", d.link.label)}
  <label class="f"><span>ملاحظة المراجعة (من راجع المعلومات واللغة والصور والصوت؛ تلزم قبل النشر)</span><textarea id="frv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="frc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ المحتوى وأؤكد صحة المعلومات وملاءمته للعمر وحقوق استخدامه</span></label>
  <label class="f"><span>حالة النشر</span><select id="fst">${ST.map(([k, x]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${x}</option>`).join("")}</select></label>
  ${T("fso2", "ترتيب الظهور داخل التصنيف (رقم أصغر أولا)", d.sort_order)}
  <p id="fmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p><p id="fchk" class="mut"></p>
  <div class="row"><button class="btn" id="fsv">حفظ</button><button class="btn g" id="fpv">معاينة</button><button class="btn g" id="fpl">فحص التشغيل</button></div><div class="row"><button class="btn g" id="fx">إغلاق</button></div>`);
  $("#fx", s).onclick = closeSheet;
  $$("#flv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  const collect = () => { d.title = $("#ft", s).value.trim(); d.cat = $("#fc", s).value; d.kind = $("#fk", s).value; d.subject = $("#fsb", s).value.trim(); d.icon = $("#fic", s).value.trim() || null; d.skill = $("#fsk", s).value.trim(); d.descr = $("#fde", s).value.trim(); d.scenes = d.kind === "anim" ? parseScenes($("#fsc", s).value) : []; d.video_url = d.kind === "file" ? $("#fvu", s).value.trim() || null : null; d.poster_url = $("#fpu", s).value.trim() || null; d.source = $("#fso", s).value.trim() || null; d.license = $("#flc", s).value.trim() || null; d.duration_s = parseInt($("#fdu", s).value, 10) || 0; d.quiz = { q: $("#fq", s).value.trim(), o: [$("#fo1", s).value.trim(), $("#fo2", s).value.trim(), $("#fo3", s).value.trim()], a: 0, why: $("#fw", s).value.trim() }; const h = $("#flk", s).value; d.link = h ? { href: h, label: $("#fll", s).value.trim() || (LINKS.find((x) => x[0] === h) || [0, h])[1] } : {}; d.review_note = $("#frv", s).value.trim(); d.reviewed = $("#frc", s).checked; d.status = $("#fst", s).value; d.sort_order = parseInt($("#fso2", s).value, 10) || 0; };
  $("#fpl", s).onclick = async () => { collect(); const o = $("#fchk", s); o.textContent = "جاري الفحص…";
    if (d.kind === "file") { if (!/^https:\/\//.test(d.video_url || "")) { o.textContent = "أدخل رابط https أولا."; return; } const v = document.createElement("video"); v.preload = "metadata"; let done = false; const fin = (t) => { if (done) return; done = true; o.textContent = t; v.removeAttribute("src"); v.load(); }; v.onloadedmetadata = () => { fin("الفيديو يعمل. مدته " + Math.round(v.duration) + " ثانية." + (Math.abs(v.duration - d.duration_s) > 3 ? " عدّل حقل المدة ليطابقها." : "")); }; v.onerror = () => fin("تعذر تشغيل الفيديو من هذا الرابط. لا تنشره."); setTimeout(() => fin("انتهت المهلة، تعذر التحقق من الرابط. لا تنشره."), 12000); v.src = d.video_url; }
    else { const bad = []; await Promise.all(d.scenes.map((x) => new Promise((r) => { const i = new Image(); i.onload = r; i.onerror = () => { bad.push(x.img); r(); }; i.src = IC(x.img); }))); o.textContent = bad.length ? "صور غير موجودة: " + bad.join("، ") : d.scenes.length ? "كل صور المشاهد تعمل (" + d.scenes.length + ")." : "لا مشاهد."; } };
  $("#fpv", s).onclick = () => { collect(); const er = check(d); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><b>${esc(d.title)}</b><p>${esc(CN[d.cat])} · ${esc(d.subject)} · ${esc(d.skill)} · ${d.duration_s} ثانية</p><p>${esc(d.descr)}</p>${d.kind === "file" ? `<video controls playsinline preload="none" style="width:100%" src="${esc(d.video_url || "")}"></video>` : `<ol>${d.scenes.map((x) => `<li><img src="${esc(IC(x.img))}" alt="" width="40" height="40" style="vertical-align:middle"> ${esc(x.t)}</li>`).join("")}</ol>`}<p><b>${esc(d.quiz.q)}</b></p><ul>${d.quiz.o.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>${er.length ? `<p style="color:var(--no)">ناقص: ${esc(er.join("، "))}</p>` : `<p style="color:var(--ok)">جاهز للنشر</p>`}<button class="btn g" id="pvx">إغلاق المعاينة</button></div>`; document.body.appendChild(o); $("#pvx", o).onclick = () => o.remove(); };
  $("#fsv", s).onclick = async () => {
    collect(); if (!d.title) { $("#fmiss", s).textContent = "اكتب العنوان"; return; }
    if (d.status === "published") { const miss = check(d); if (miss.length) { $("#fmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#fmiss", s).textContent = ""; $("#fsv", s).disabled = true;
    try { const row = { slug: d.slug, cat: d.cat, title: d.title, icon: d.icon, levels: d.levels, subject: d.subject, skill: d.skill, descr: d.descr, kind: d.kind, scenes: d.scenes, video_url: d.video_url, poster_url: d.poster_url, source: d.source, license: d.license, duration_s: d.duration_s, quiz: d.quiz, link: d.link, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("video_items").insert(row) : await sb.from("video_items").update(row).eq("id", d.id); if (r.error) throw r.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { $("#fsv", s).disabled = false; fail(e); }
  };
}
})();
