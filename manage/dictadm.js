/* إدارة المعجم المصور: إضافة كلمة بصورة وصوت ومعنى ومثال وترجمة وتصنيف وعمر وحرف، تعديل وحذف وإخفاء ونشر، معاينة البطاقة، استيراد مجموعات بعد مراجعتها، اكتشاف المكرر والمشكوك في إملائه — داخل لوحة زاد المحمية. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const TOPICS = [["letters", "الحروف والكلمات"], ["colors", "الألوان والأشكال"], ["animals", "الحيوانات"], ["food", "الفواكه والخضروات والأطعمة"], ["body", "جسم الإنسان والحواس"], ["home", "المنزل والمدرسة"], ["nature", "الطبيعة والبيئة"], ["jobs", "المهن ووسائل النقل"], ["math", "المفاهيم الرياضية"], ["feelings", "المشاعر والسلوكيات"]];
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const LVSET = { a: ["a2", "a3", "a4", "a5", "a6", "g1", "g2", "g3", "g4"], e: ["a2", "a3", "a4", "a5", "a6", "g1", "g2"], m: ["a4", "a5", "a6", "g1", "g2", "g3", "g4"], h: ["g1", "g2", "g3", "g4"], x: ["g3", "g4"] };
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "مخفي"]];
const TN = Object.fromEntries(TOPICS), SN = Object.fromEntries(ST);
const IC = (c) => (String(c).startsWith("dg_") ? `../images/dig/${c}.svg` : String(c).startsWith("rd_") ? `../images/ready/${c}.svg` : `../images/zad/${c}.webp`);
const AR = /^[ء-ي٠-٩\s.،؟!:\-0-9ـ]+$/, EN = /^[A-Za-z0-9\s.,?!:'\-]+$/;
const BADW = /غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت/;
const imgOk = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; });
const head = (u) => fetch(u, { method: "HEAD", cache: "no-store" }).then((r) => r.ok).catch(() => false);
const nA = (s) => String(s || "").replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").trim();
const letterOf = (ar) => { const f = String(ar || "").trim().split(/\s+/)[0] || "", c = f.startsWith("ال") && f.length > 4 ? f.slice(2) : f; const l = c[0] || ""; return "أإآ".includes(l) ? "ا" : l; };
const stemIn = (ar, ex) => { let st = String(ar || "").trim().split(/\s+/)[0] || ""; if (st.length > 3) st = st.replace(/[ةي]$/, ""); if (st.startsWith("ال") && st.length > 4) st = st.slice(2); return !!st && String(ex || "").includes(st); };
let ALL = [], FS = "", FT = "", FQ = "";
async function load() { const r = await sb.from("dict_words").select("*").order("sort_order").limit(3000); if (r.error) throw r.error; ALL = r.data || []; }
function check(d, others) {
  const m = [], t = (x) => String(x == null ? "" : x).trim();
  if (!t(d.ar) || !AR.test(t(d.ar))) m.push("الكلمة العربية (حروف عربية فقط، بلا تشكيل)"); else if (BADW.test(d.ar)) m.push("كلمة غير مناسبة");
  if (!t(d.meaning) || !AR.test(t(d.meaning)) || BADW.test(d.meaning)) m.push("المعنى (عربي بلا تشكيل ولا رموز)"); else if (t(d.meaning).length > 90) m.push("المعنى أطول من 90 حرفا");
  if (!t(d.example) || !AR.test(t(d.example)) || BADW.test(d.example)) m.push("المثال (عربي بلا تشكيل ولا رموز)"); else if (!stemIn(d.ar, d.example)) m.push("المثال يجب أن يحتوي الكلمة"); else if (t(d.example).length > 70) m.push("المثال أطول من 70 حرفا");
  if (t(d.en) && !EN.test(t(d.en))) m.push("الترجمة الإنجليزية بحروف إنجليزية فقط");
  for (const f of ["pl", "syn", "opp"]) if (t(d[f]) && !AR.test(t(d[f]))) m.push("حقل " + ({ pl: "الجمع", syn: "المرادف", opp: "الضد" }[f]) + " عربي فقط");
  if (!d.icon) m.push("الصورة الكرتونية"); if (!(d.levels || []).length) m.push("العمر أو الصف"); if (!d.topic) m.push("الموضوع"); if (!t(d.sub)) m.push("التصنيف الفرعي");
  if (!t(d.letter)) m.push("الحرف الأول");
  if (others.some((x) => x.id !== d.id && nA(x.ar) === nA(d.ar))) m.push("كلمة مكررة في المعجم");
  if (d.seq && !(d.seq_n >= 1)) m.push("ترتيب الكلمة في التسلسل");
  if (!d.reviewed) m.push("تأكيد المراجعة"); if (!t(d.review_note) || t(d.review_note).length < 6) m.push("ملاحظة المراجعة");
  return m;
}
const lev = (a, b) => { if (Math.abs(a.length - b.length) > 1) return 9; let i = 0, j = 0, e = 0; while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; continue; } if (++e > 1) return 9; if (a.length > b.length) i++; else if (b.length > a.length) j++; else { i++; j++; } } return e + (a.length - i) + (b.length - j); };
function spellHints(rows) {
  const freq = {}, where = {}; rows.forEach((x) => [x.meaning, x.example, x.ar, x.pl, x.syn].forEach((tx) => String(tx || "").split(/[\s.،؟!:]+/).filter((w) => w.length > 2).forEach((w) => { const k = nA(w); freq[k] = (freq[k] || 0) + 1; (where[k] = where[k] || new Set()).add(x.ar); })));
  const common = Object.keys(freq).filter((k) => freq[k] >= 3), out = [];
  Object.keys(freq).filter((k) => freq[k] === 1).forEach((k) => { const c = common.find((z) => lev(k, z) === 1 && z !== k); if (c) out.push(`«${k}» في كلمة ${Array.from(where[k])[0]} تشبه «${c}»`); });
  return out;
}
SUB.dictadm = { title: "إدارة المعجم المصور", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length, bad = ALL.filter((x) => x.status === "published" && check(x, ALL).length).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div><div class="stat"><b>${n("draft") + n("unpublished")}</b><span>مسودة أو مخفي</span></div><div class="stat"><b>${bad}</b><span>منشور وفيه مشكلة</span></div></div>
  <p class="mut">لكل كلمة: صورة كرتونية من رسوم المنصة (لا رفع مباشر للصور من هنا بعد)، ومعنى ومثال وترجمة، ويمكن إضافة رابط ملف صوتي، وإن لم يوجد فالنطق بصوت جهاز الطفل. لا تُنشر كلمة ناقصة أو مكررة. فحص الإملاء هنا ليس مدققا لغويا؛ هو يلتقط التكرار والحروف غير المسموحة وكلمات نادرة تشبه كلمات شائعة، ويبقى التدقيق البشري ضروريا.</p>
  <div class="row"><button class="btn" id="dn1">➕ كلمة جديدة</button><button class="btn g" id="dim">📥 استيراد مجموعة</button><button class="btn g" id="dh">🔎 اكتشاف المشكلات</button></div>
  <div id="dhr"></div>
  <input type="search" id="dqs" placeholder="بحث بالكلمة أو الترجمة" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="dch" style="margin-top:8px"></div><div class="chips" id="dct" style="margin-top:6px"></div><div id="dls"></div>`;
  const draw = () => {
    $("#dch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#dct").innerHTML = [["", "كل المواضيع"], ...TOPICS].map(([k, l]) => `<button class="chip ${FT === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FT || x.topic === FT) && (!q || (x.ar + " " + (x.en || "")).toLowerCase().includes(q))).slice(0, 150);
    $("#dls").innerHTML = list.length ? list.map((x) => { const ms = check(x, ALL); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "i_puzzle"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.ar)}</b><small>${esc(x.en || "")} · ${esc(TN[x.topic] || x.topic)} · ${esc(SN[x.status])}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا نتائج.</p>`;
    $$("#dch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#dct [data-t]").forEach((b) => b.onclick = () => { FT = b.dataset.t; draw(); });
    $$("#dls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => String(x.id) === b.dataset.i), () => view(m)));
  };
  draw(); $("#dqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#dn1").onclick = () => edit(null, () => view(m)); $("#dim").onclick = () => importer(() => view(m));
  $("#dh").onclick = async () => { const o = $("#dhr"); o.innerHTML = `<p class="mut">جاري الفحص…</p>`; const out = [], seenA = {}, seenE = {};
    for (const x of ALL) { const e = check(x, ALL); if (e.length && x.status === "published") out.push(`${x.ar}: ناقص ${e.join("، ")}`);
      const k = nA(x.ar); if (seenA[k]) out.push(`مكرر: ${x.ar} و${seenA[k]}`); seenA[k] = x.ar; const ek = (x.en || "").toLowerCase(); if (ek) { if (seenE[ek] && seenE[ek] !== x.ar) out.push(`ترجمة مكررة «${x.en}»: ${x.ar} و${seenE[ek]}`); seenE[ek] = x.ar; }
      if (!(await imgOk(IC(x.icon)))) out.push(`${x.ar}: الصورة غير موجودة (${x.icon})`); if (x.audio_url && !(await head(x.audio_url))) out.push(`${x.ar}: الملف الصوتي لا يُفتح`);
      if (x.opp && !ALL.some((y) => y.ar === x.opp)) out.push(`${x.ar}: الضد «${x.opp}» غير موجود في المعجم`); }
    spellHints(ALL).slice(0, 40).forEach((t) => out.push("إملاء مشكوك: " + t));
    o.innerHTML = out.length ? `<div class="card"><b style="color:var(--no)">ملاحظات (${out.length})</b><ul>${out.slice(0, 120).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : `<div class="card"><b style="color:var(--ok)">لا مشكلات: كل الكلمات مكتملة وغير مكررة وصورها تعمل.</b></div>`; };
} };
function previewHtml(d) { return `<div class="sheet"><h2>معاينة البطاقة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:12px;text-align:center"><img src="${esc(IC(d.icon || ""))}" alt="" width="120" height="120" style="object-fit:contain"><h2 style="margin:6px 0">${esc(d.ar)}</h2><p>${esc(TN[d.topic] || "")}</p><p style="text-align:start"><b>المعنى:</b> ${esc(d.meaning)}</p><p style="text-align:start"><b>مثال:</b> ${esc(d.example)}</p>${d.en ? `<p style="text-align:start"><b>English:</b> <span dir="ltr">${esc(d.en)}</span></p>` : ""}<p style="text-align:start"><b>الحرف الأول:</b> ${esc(d.letter)}${d.pl ? " · <b>الجمع:</b> " + esc(d.pl) : ""}${d.syn ? " · <b>مرادف:</b> " + esc(d.syn) : ""}${d.opp ? " · <b>ضد:</b> " + esc(d.opp) : ""}</p>${d.audio_url ? `<audio controls src="${esc(d.audio_url)}" style="width:100%"></audio>` : '<p class="mut">لا يوجد ملف صوتي؛ النطق بصوت جهاز الطفل.</p>'}</div><div class="row"><button class="btn g" id="pvx">إغلاق المعاينة</button></div></div>`; }
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice() }) : { slug: "w_" + Date.now().toString(36), ar: "", en: "", topic: "animals", sub: "", letter: "", en_letter: "", icon: "", meaning: "", example: "", pl: "", syn: "", opp: "", seq: "", seq_n: null, levels: [], audio_url: "", review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v, dir) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}" ${dir ? `dir="${dir}"` : ""}></label>`;
  const O = (arr, v) => arr.map(([k, x]) => `<option value="${k}" ${v === k ? "selected" : ""}>${x}</option>`).join("");
  const subs = Array.from(new Set(ALL.map((x) => x.sub)));
  const s = sheet(`<h2>${isNew ? "كلمة جديدة" : "تعديل كلمة"}</h2>
  ${T("dar", "الكلمة بالعربية (بلا تشكيل)", d.ar)}${T("den", "الترجمة الإنجليزية (بعد مراجعتها)", d.en, "ltr")}
  <label class="f"><span>الموضوع</span><select id="dtp">${O(TOPICS, d.topic)}</select></label>
  <label class="f"><span>التصنيف الفرعي (اكتب جديدا أو اختر؛ مثل pet أو fruit)</span><input type="text" id="dsb" list="dsl" value="${esc(d.sub || "")}" dir="ltr"><datalist id="dsl">${subs.map((k) => `<option value="${esc(k)}">`).join("")}</datalist></label>
  ${T("dlt", "الحرف الأول (يُحسب تلقائيا من الكلمة)", d.letter)}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="dlv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  <div class="chips" style="margin-top:6px"><button type="button" class="chip" data-set="a">كل المراحل</button><button type="button" class="chip" data-set="e">سنة إلى الصف الثاني</button><button type="button" class="chip" data-set="m">٤ سنوات إلى الصف الرابع</button><button type="button" class="chip" data-set="h">الصف الأول إلى الرابع</button><button type="button" class="chip" data-set="x">الصف الثالث والرابع</button></div>
  ${T("dic", "الصورة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon, "ltr")}<div id="dpi" style="margin:6px 0"></div>
  ${T("dau", "رابط ملف صوتي للنطق (اختياري، https)", d.audio_url, "ltr")}
  <label class="f"><span>المعنى المبسط</span><textarea id="dme" rows="2" dir="auto">${esc(d.meaning || "")}</textarea></label>
  <label class="f"><span>مثال قصير يحتوي الكلمة</span><textarea id="dex" rows="2" dir="auto">${esc(d.example || "")}</textarea></label>
  ${T("dpl", "الجمع (اختياري)", d.pl)}${T("dsy", "مرادف (اختياري)", d.syn)}${T("dop", "الضد (كلمة موجودة في المعجم، اختياري)", d.opp)}
  ${T("dsq", "تسلسل (اختياري: اسم المجموعة مثل frog)", d.seq, "ltr")}${T("dsn", "ترتيب الكلمة في التسلسل (رقم)", d.seq_n)}
  <label class="f"><span>ملاحظة المراجعة (تلزم قبل النشر)</span><textarea id="drv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="drc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ الكلمة والمعنى والمثال والترجمة وأؤكد صحتها وملاءمتها للعمر</span></label>
  <label class="f"><span>حالة النشر</span><select id="dst">${O(ST, d.status)}</select></label>${T("dso", "ترتيب الظهور", d.sort_order)}
  <p id="dmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p><p id="dchk" class="mut"></p>
  <div class="row"><button class="btn" id="dsv">حفظ</button><button class="btn g" id="dpv">معاينة البطاقة</button><button class="btn g" id="dpl2">فحص الصورة والصوت</button></div>
  <div class="row"><button class="btn g" id="dx">إغلاق</button>${isNew ? "" : `<button class="btn g" id="ddel" style="color:var(--no)">🗑 حذف</button>`}</div>`);
  $("#dx", s).onclick = closeSheet;
  const showIc = () => { const v = $("#dic", s).value.trim(); $("#dpi", s).innerHTML = v ? `<img src="${esc(IC(v))}" alt="" width="64" height="64" style="object-fit:contain" onerror="this.outerHTML='<span class=mut>الصورة غير موجودة</span>'">` : ""; };
  showIc(); $("#dic", s).oninput = showIc;
  $("#dar", s).oninput = () => { if (isNew || !$("#dlt", s).value) $("#dlt", s).value = letterOf($("#dar", s).value); };
  $$("#dlv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  $$("[data-set]", s).forEach((b) => b.onclick = () => { d.levels = LVSET[b.dataset.set].slice(); $$("#dlv [data-l]", s).forEach((x) => x.classList.toggle("on", d.levels.includes(x.dataset.l))); });
  const collect = () => { d.ar = $("#dar", s).value.trim(); d.en = $("#den", s).value.trim(); d.topic = $("#dtp", s).value; d.sub = $("#dsb", s).value.trim(); d.letter = $("#dlt", s).value.trim() || letterOf(d.ar); d.en_letter = d.en ? d.en[0].toUpperCase() : ""; d.icon = $("#dic", s).value.trim(); d.audio_url = $("#dau", s).value.trim() || null; d.meaning = $("#dme", s).value.trim(); d.example = $("#dex", s).value.trim(); d.pl = $("#dpl", s).value.trim() || null; d.syn = $("#dsy", s).value.trim() || null; d.opp = $("#dop", s).value.trim() || null; d.seq = $("#dsq", s).value.trim() || null; d.seq_n = d.seq ? parseInt($("#dsn", s).value, 10) || null : null; d.review_note = $("#drv", s).value.trim(); d.reviewed = $("#drc", s).checked; d.status = $("#dst", s).value; d.sort_order = parseInt($("#dso", s).value, 10) || 0; };
  $("#dpl2", s).onclick = async () => { collect(); const o = $("#dchk", s); o.textContent = "جاري الفحص…"; const bad = []; if (!(await imgOk(IC(d.icon)))) bad.push("الصورة"); if (d.audio_url && !(await head(d.audio_url))) bad.push("الملف الصوتي"); o.textContent = bad.length ? "لا يعمل: " + bad.join("، ") : "الصورة" + (d.audio_url ? " والملف الصوتي" : "") + " تعمل."; };
  $("#dpv", s).onclick = () => { collect(); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = previewHtml(d); document.body.appendChild(o); $("#pvx", o).onclick = () => o.remove(); };
  $("#dsv", s).onclick = async () => {
    collect(); if (!d.ar) { $("#dmiss", s).textContent = "اكتب الكلمة"; return; }
    if (d.status === "published") { const miss = check(d, ALL); if (miss.length) { $("#dmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } if (!(await imgOk(IC(d.icon)))) { $("#dmiss", s).textContent = "الصورة غير موجودة"; return; } if (d.audio_url && !(await head(d.audio_url))) { $("#dmiss", s).textContent = "الملف الصوتي لا يُفتح"; return; } }
    $("#dmiss", s).textContent = ""; $("#dsv", s).disabled = true;
    try { const row = { slug: d.slug, ar: d.ar, en: d.en || "", topic: d.topic, sub: d.sub, letter: d.letter, en_letter: d.en_letter || "", icon: d.icon, meaning: d.meaning, example: d.example, pl: d.pl, syn: d.syn, opp: d.opp, seq: d.seq, seq_n: d.seq_n, levels: d.levels, audio_url: d.audio_url, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("dict_words").insert(row) : await sb.from("dict_words").update(row).eq("id", d.id); if (r.error) throw r.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { $("#dsv", s).disabled = false; fail(e); }
  };
  const del = $("#ddel", s); if (del) del.onclick = async () => { if (!confirm("حذف هذه الكلمة نهائيا؟ لا يمكن التراجع. (للإخفاء فقط اختر حالة «مخفي»)")) return; try { const r = await sb.from("dict_words").delete().eq("id", d.id); if (r.error) throw r.error; toast("تم الحذف"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
/* استيراد: سطر لكل كلمة  الكلمة | English | topic | icon | المعنى | المثال | sub | e أو m أو h أو x */
function importer(reload) {
  const s = sheet(`<h2>استيراد مجموعة مفردات</h2>
  <p class="mut">اكتب سطرا لكل كلمة بالشكل: الكلمة | English | الموضوع (${TOPICS.map((x) => x[0]).join(" أو ")}) | اسم الصورة | المعنى | المثال | التصنيف الفرعي | مستوى العمر (a أو e أو m أو h أو x). تُفحص كل كلمة، وتُرفض المكررة والناقصة، ولا يُنشر شيء إلا إذا أكدت مراجعة المجموعة.</p>
  <label class="f"><span>الأسطر</span><textarea id="iml" rows="9" dir="auto" placeholder="مثال: تفاحة | apple | food | 1f34e | فاكهة حلوة | التفاحة حمراء | fruit | e"></textarea></label>
  <label class="f"><span>ملاحظة مراجعة المجموعة (تلزم للنشر)</span><textarea id="imr" rows="2" dir="auto"></textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="imc"> <span>راجعتُ هذه المجموعة وأؤكد صحة الكلمات والترجمات والأمثلة وملاءمتها للعمر، وأريد نشر الكاملة منها</span></label>
  <p id="imo" class="mut"></p><div class="row"><button class="btn" id="imgo">فحص واستيراد</button><button class="btn g" id="imx">إغلاق</button></div>`);
  $("#imx", s).onclick = closeSheet;
  $("#imgo", s).onclick = async () => {
    const out = $("#imo", s), rows = $("#iml", s).value.split("\n").map((x) => x.trim()).filter(Boolean), pub = $("#imc", s).checked, note = $("#imr", s).value.trim(), good = [], msgs = []; const have = ALL.slice();
    if (pub && note.length < 6) { out.textContent = "اكتب ملاحظة المراجعة أولا."; return; }
    for (const [i, l] of rows.entries()) { const p = l.split("|").map((x) => x.trim()); if (p.length < 8) { msgs.push(`سطر ${i + 1}: ينقصه حقول (8 حقول)`); continue; }
      const d = { id: "n" + i, slug: "w_" + Date.now().toString(36) + i, ar: p[0], en: p[1], topic: p[2], icon: p[3], meaning: p[4], example: p[5], sub: p[6], levels: LVSET[p[7]] ? LVSET[p[7]].slice() : [], letter: letterOf(p[0]), en_letter: p[1] ? p[1][0].toUpperCase() : "", pl: null, syn: null, opp: null, seq: null, seq_n: null, audio_url: null, review_note: note, reviewed: pub, status: "draft", sort_order: 900 + i };
      if (!TN[d.topic]) { msgs.push(`سطر ${i + 1} (${d.ar}): موضوع غير معروف`); continue; } if (!LVSET[p[7]]) { msgs.push(`سطر ${i + 1} (${d.ar}): مستوى العمر a أو e أو m أو h أو x`); continue; }
      const er = check(Object.assign({}, d, { reviewed: true, review_note: note || "مسودة" }), have); if (er.length) { msgs.push(`سطر ${i + 1} (${d.ar}): ${er.join("، ")}`); continue; }
      if (!(await imgOk(IC(d.icon)))) { msgs.push(`سطر ${i + 1} (${d.ar}): الصورة غير موجودة`); continue; }
      d.status = pub ? "published" : "draft"; have.push(d); good.push(d); }
    if (!good.length) { out.textContent = "لا توجد كلمات صالحة للاستيراد. " + msgs.join(" | "); return; }
    $("#imgo", s).disabled = true;
    try { const r = await sb.from("dict_words").insert(good.map((d) => ({ slug: d.slug, ar: d.ar, en: d.en, topic: d.topic, sub: d.sub, letter: d.letter, en_letter: d.en_letter, icon: d.icon, meaning: d.meaning, example: d.example, levels: d.levels, review_note: d.review_note || "", reviewed: d.reviewed, status: d.status, sort_order: d.sort_order }))); if (r.error) throw r.error;
      toast(`تم استيراد ${good.length} كلمة` + (msgs.length ? ` ورُفض ${msgs.length}` : "")); if (msgs.length) { out.textContent = "المرفوض: " + msgs.join(" | "); $("#imgo", s).disabled = false; reload(); } else { closeSheet(); reload(); } } catch (e) { $("#imgo", s).disabled = false; fail(e); }
  };
}
})();
