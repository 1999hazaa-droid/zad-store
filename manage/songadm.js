/* إدارة الأناشيد والأغاني التعليمية: كلمات أصلية، تصنيف وعمر ومهارة، سؤال نشاط، رابط صوت (اختياري)، مراجعة قبل النشر — داخل لوحة زاد المحمية. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["letters", "الحروف واللغة العربية"], ["math", "الأرقام والرياضيات"], ["colors", "الألوان والأشكال"], ["english", "اللغة الإنجليزية"], ["nature", "الحيوانات والطبيعة"], ["science", "العلوم والاكتشاف"], ["values", "السلوك والقيم"], ["routine", "الروتين اليومي"]];
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "مخفي"]];
const CN = Object.fromEntries(CATS), SN = Object.fromEntries(ST);
const IC = (c) => (String(c).startsWith("dg_") ? `../images/dig/${c}.svg` : String(c).startsWith("rd_") ? `../images/ready/${c}.svg` : `../images/zad/${c}.webp`);
const AR = /^[ء-ي٠-٩\s.،؟!:\-0-9]+$/, EN = /^[ء-يA-Za-z0-9\s.,،؟?!:'\-]+$/;
let ALL = [], FS = "", FC = "", FQ = "";
function check(d) {
  const m = [], ok = (t) => (d.cat === "english" ? EN : AR).test(String(t || "").trim());
  if (!d.title) m.push("العنوان"); else if (!ok(d.title)) m.push("حروف العنوان");
  if (!(d.levels || []).length) m.push("العمر أو الصف");
  if (!d.skill || !ok(d.skill)) m.push("المهارة التعليمية");
  const L = d.lyrics || []; if (L.length < 4 || L.length > 8) m.push("الكلمات من أربعة إلى ثمانية أسطر"); else L.forEach((x, i) => { if (!ok(x)) m.push("حروف السطر " + (i + 1)); });
  const q = d.quiz || {}; if (!q.q || !ok(q.q)) m.push("سؤال النشاط"); if (!Array.isArray(q.o) || q.o.length !== 3 || new Set(q.o).size !== 3 || !q.o.every(ok)) m.push("ثلاثة خيارات مختلفة (الصحيح أولا)"); if (!q.why || !ok(q.why)) m.push("تفسير الإجابة");
  if (d.audio_url && !/^https:\/\//.test(d.audio_url)) m.push("رابط الصوت يبدأ بـ https");
  if (!d.reviewed) m.push("تأكيد المراجعة"); if (!d.review_note) m.push("ملاحظة المراجعة");
  return m;
}
async function load() { const r = await sb.from("song_items").select("*").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
SUB.songadm = { title: "إدارة الأناشيد", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div></div>
  <p class="mut">اكتب كلمات أصلية فقط، ولا تنسخ كلمات أو تسجيلات محمية بحقوق النشر. رابط الصوت اختياري (https لملف مرخص)، وبدونه يقرأ المشغل الكلمات بصوت الجهاز. لا يوجد رفع مباشر للملفات الصوتية من هنا بعد.</p>
  <div class="row"><button class="btn" id="fn">➕ أنشودة جديدة</button></div>
  <input type="search" id="fqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="fch" style="margin-top:8px"></div><div class="chips" id="fcc" style="margin-top:6px"></div><div id="fls"></div>`;
  const draw = () => {
    $("#fch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#fcc").innerHTML = [["", "كل التصنيفات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.cat === FC) && (!q || x.title.toLowerCase().includes(q)));
    $("#fls").innerHTML = list.length ? list.map((x) => { const ms = check(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "i_music"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.cat])} · ${esc(SN[x.status])}${x.audio_url ? " · صوت" : ""}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا نتائج.</p>`;
    $$("#fch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#fcc [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#fls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => String(x.id) === b.dataset.i), () => view(m)));
  };
  draw(); $("#fqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#fn").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), lyrics: (a.lyrics || []).slice(), quiz: Object.assign({ q: "", o: ["", "", ""], a: 0, why: "" }, a.quiz) }) : { slug: "sg-" + Date.now().toString(36), cat: "letters", title: "", icon: "", levels: [], skill: "", lyrics: [], quiz: { q: "", o: ["", "", ""], a: 0, why: "" }, audio_url: "", review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}"></label>`;
  const s = sheet(`<h2>${isNew ? "أنشودة جديدة" : "تعديل الأنشودة"}</h2>
  ${T("ft", "العنوان", d.title)}<label class="f"><span>التصنيف</span><select id="fc">${CATS.map(([k, x]) => `<option value="${k}" ${d.cat === k ? "selected" : ""}>${x}</option>`).join("")}</select></label>
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="flv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("fic", "رمز الرسمة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon)}${T("fsk", "المهارة التعليمية المستهدفة", d.skill)}
  <label class="f"><span>الكلمات (سطر لكل بيت، من ٤ إلى ٨ أسطر، أصلية فقط)</span><textarea id="fly" rows="7" dir="auto">${esc(d.lyrics.join("\n"))}</textarea></label>
  ${T("fq", "سؤال النشاط", d.quiz.q)}${T("fo1", "الخيار الصحيح (يُخلط تلقائيا)", d.quiz.o[0])}${T("fo2", "خيار آخر", d.quiz.o[1])}${T("fo3", "خيار ثالث", d.quiz.o[2])}${T("fw", "تفسير الإجابة", d.quiz.why)}
  ${T("fau", "رابط ملف صوتي مرخص (اختياري، https)", d.audio_url)}
  <label class="f"><span>ملاحظة المراجعة (من راجع الكلمات لغويا وتربويا؛ تلزم قبل النشر)</span><textarea id="frv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="frc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ الكلمات وأؤكد أنها أصلية أو مرخصة ومناسبة للعمر</span></label>
  <label class="f"><span>حالة النشر</span><select id="fst">${ST.map(([k, x]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${x}</option>`).join("")}</select></label>
  <p id="fmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="fsv">حفظ</button><button class="btn g" id="fpv">معاينة</button></div><div class="row"><button class="btn g" id="fx">إغلاق</button></div>`);
  $("#fx", s).onclick = closeSheet;
  $$("#flv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  const collect = () => { d.title = $("#ft", s).value.trim(); d.cat = $("#fc", s).value; d.icon = $("#fic", s).value.trim() || null; d.skill = $("#fsk", s).value.trim(); d.lyrics = $("#fly", s).value.split("\n").map((x) => x.trim()).filter(Boolean); d.quiz = { q: $("#fq", s).value.trim(), o: [$("#fo1", s).value.trim(), $("#fo2", s).value.trim(), $("#fo3", s).value.trim()], a: 0, why: $("#fw", s).value.trim() }; d.audio_url = $("#fau", s).value.trim() || null; d.review_note = $("#frv", s).value.trim(); d.reviewed = $("#frc", s).checked; d.status = $("#fst", s).value; };
  $("#fpv", s).onclick = () => { collect(); const er = check(d); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><b>${esc(d.title)}</b><p>${esc(CN[d.cat])} · ${esc(d.skill)}</p><ol>${d.lyrics.map((x) => `<li>${esc(x)}</li>`).join("")}</ol><p><b>${esc(d.quiz.q)}</b></p><ul>${d.quiz.o.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>${er.length ? `<p style="color:var(--no)">ناقص: ${esc(er.join("، "))}</p>` : `<p style="color:var(--ok)">جاهزة للنشر</p>`}<button class="btn g" id="pvx">إغلاق المعاينة</button></div>`; document.body.appendChild(o); $("#pvx", o).onclick = () => o.remove(); };
  $("#fsv", s).onclick = async () => {
    collect(); if (!d.title) { $("#fmiss", s).textContent = "اكتب العنوان"; return; }
    if (d.status === "published") { const miss = check(d); if (miss.length) { $("#fmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#fmiss", s).textContent = ""; $("#fsv", s).disabled = true;
    try { const row = { slug: d.slug, cat: d.cat, title: d.title, icon: d.icon, levels: d.levels, skill: d.skill, lyrics: d.lyrics, quiz: d.quiz, audio_url: d.audio_url, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("song_items").insert(row) : await sb.from("song_items").update(row).eq("id", d.id); if (r.error) throw r.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { $("#fsv", s).disabled = false; fail(e); }
  };
}
})();
