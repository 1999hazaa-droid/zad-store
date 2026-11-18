/* إدارة البطاقات التعليمية التفاعلية — داخل لوحة زاد المحمية */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["letters", "الحروف العربية"], ["numbers", "الأرقام والعد"], ["colors", "الألوان"], ["shapes", "الأشكال"], ["animals", "الحيوانات"], ["food", "الفواكه والخضروات"], ["vocab", "المفردات"], ["english", "الإنجليزية"]];
const CN = Object.fromEntries(CATS);
const SUBJ = ["لغتي", "رياضيات", "علوم", "إنجليزي", "تربية إسلامية", "مهارات حياتية"];
const GR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
const ST = [["draft", "مسودة", "#ece8fb"], ["published", "منشورة", "#d8f5e6"], ["unpublished", "غير منشورة", "#ffe3d1"]];
const SN = Object.fromEntries(ST.map((x) => [x[0], x[1]]));
const IU = (u) => /^https?:/.test(u || "") ? u : "../" + String(u || "");
let ALL = [], FS = "", FC = "", FQ = "";
const norm = (s) => String(s || "").toLowerCase();
/* جاهزية النشر: لا تُنشر بطاقة ناقصة (والقاعدة نفسها ترفض ذلك أيضاً) */
function readiness(d) {
  const m = [];
  if (!d.cat) m.push("التصنيف"); if (!(d.word_ar || "").trim()) m.push("الكلمة العربية");
  if (!(d.image_url || "").trim()) m.push("الصورة"); if (!(d.example || "").trim()) m.push("المثال");
  if (!d.ages.length) m.push("العمر"); if (!d.grades.length) m.push("الصف"); if (!(d.skill || "").trim()) m.push("المهارة");
  if (d.cat === "english" && !(d.word_en || "").trim()) m.push("الكلمة الإنجليزية");
  if (d.cat === "letters" && !(d.extra && d.extra.ch)) m.push("الحرف");
  return m;
}
async function load() { const r = await sb.from("cards").select("*").order("sort_order").limit(2000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, kind, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `cards/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
SUB.cardsadm = { title: "إدارة البطاقات", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length, bad = ALL.filter((x) => x.status !== "published" && readiness(x).length).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>كل البطاقات</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  ${bad ? `<p class="mut" style="margin:6px 2px">${bad} بطاقة غير منشورة تنقصها بيانات أو صورة.</p>` : ""}
  <div class="row"><button class="btn" id="cn">➕ بطاقة جديدة</button></div>
  <input type="search" id="cqs" placeholder="بحث بالكلمة" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="cch" style="margin-top:8px"></div><div class="chips" id="ccs" style="margin-top:6px"></div><div id="cls"></div>`;
  const draw = () => {
    $("#cch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#ccs").innerHTML = [["", "كل التصنيفات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = norm(FQ), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.cat === FC) && (!q || norm(x.word_ar + " " + x.word_en + " " + x.sub).includes(q))).slice(0, 150);
    $("#cls").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}">${x.image_url ? `<img loading="lazy" src="${esc(IU(x.image_url))}" alt="" style="object-fit:contain">` : `<div class="ph">🖼️</div>`}<div class="tx"><b>${esc(x.word_ar)}${x.word_en ? " · " + esc(x.word_en) : ""}</b><small>${esc(CN[x.cat] || "")} · ${esc(x.sub || "")} · ${SN[x.status]}${ms.length ? " · ينقص: " + esc(ms.join("، ")) : ""}</small></div></div>`; }).join("") + (ALL.length > 150 ? '<p class="mut">يُعرض أول 150 نتيجة؛ استخدم البحث أو الفلاتر.</p>' : "") : '<p class="mut">لا توجد بطاقات مطابقة.</p>';
    $$("#cch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#ccs [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#cls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#cqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#cn").onclick = () => edit(null, () => view(m));
} };
function edit(card, reload) {
  const isNew = !card;
  const d = card ? Object.assign({}, card, { ages: (card.ages || []).slice(), grades: (card.grades || []).slice(), extra: Object.assign({}, card.extra || {}) }) : { slug: "card-" + Date.now().toString(36), cat: "animals", sub: "", word_ar: "", word_en: "", image_url: "", audio_url: "", example: "", extra: {}, ages: [], grades: [], skill: "", subject: "علوم", status: "draft", sort_order: ALL.length + 1 };
  const s = sheet(`<h2>${isNew ? "بطاقة جديدة" : "تعديل البطاقة"}</h2>
  <label class="f"><span>التصنيف</span><select id="kc">${CATS.map(([k, v]) => `<option value="${k}" ${d.cat === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <label class="f"><span>المجموعة (مثل: أليفة، الملابس)</span><input type="text" id="ks" value="${esc(d.sub)}"></label>
  <label class="f"><span>الكلمة بالعربية</span><input type="text" id="kw" value="${esc(d.word_ar)}"></label>
  <label class="f"><span>الكلمة بالإنجليزية (إلزامية في تصنيف الإنجليزية)</span><input type="text" id="ke" dir="ltr" value="${esc(d.word_en)}"></label>
  <div id="klt" ${d.cat === "letters" ? "" : "hidden"}><label class="f"><span>الحرف</span><input type="text" id="kch" maxlength="2" value="${esc(d.extra.ch || "")}"></label>
  <label class="f"><span>اسم الحرف (مثل: ألف)</span><input type="text" id="knm" value="${esc(d.extra.name || "")}"></label>
  <label class="f"><span>يتّصل بما بعده؟</span><select id="kcn"><option value="1" ${d.extra.con !== 0 ? "selected" : ""}>نعم</option><option value="0" ${d.extra.con === 0 ? "selected" : ""}>لا (مثل: ا د ذ ر ز و)</option></select></label></div>
  <label class="f"><span>مثال (جملة قصيرة)</span><textarea id="kx" rows="2" dir="auto">${esc(d.example)}</textarea></label>
  <p style="margin:10px 2px 4px;font-weight:700">العمر</p><div class="chips" id="kag" style="flex-wrap:wrap">${[1, 2, 3, 4, 5, 6].map((a) => `<button type="button" class="chip ${d.ages.includes(a) ? "on" : ""}" data-a="${a}">${a === 1 ? "سنة" : a === 2 ? "سنتان" : a + " سنوات"}</button>`).join("")}</div>
  <p style="margin:10px 2px 4px;font-weight:700">الصف</p><div class="chips" id="kgr" style="flex-wrap:wrap">${GR.map((g, i) => `<button type="button" class="chip ${d.grades.includes(i + 1) ? "on" : ""}" data-g="${i + 1}">${g}</button>`).join("")}</div>
  <label class="f" style="margin-top:8px"><span>المادة</span><select id="kb">${SUBJ.map((x) => `<option ${d.subject === x ? "selected" : ""}>${x}</option>`).join("")}</select></label>
  <label class="f"><span>المهارة (مثل: التعرّف على الحيوانات)</span><input type="text" id="kk" value="${esc(d.skill)}"></label>
  <p style="margin:12px 2px 4px;font-weight:700">الصورة (إلزامية)</p>${d.image_url ? `<img class="thumb" id="kim" src="${esc(IU(d.image_url))}" style="max-height:180px;object-fit:contain">` : `<div class="thumb c" id="kim" style="padding:26px 0;font-size:34px">🖼️</div>`}
  <label class="btn g" style="display:block;text-align:center;margin-top:6px">رفع صورة البطاقة<input type="file" id="kfi" accept="image/*" hidden></label>
  <p style="margin:12px 2px 4px;font-weight:700">الصوت (اختياري)</p><label class="btn g" style="display:block;text-align:center">رفع ملف صوتي<input type="file" id="kfa" accept="audio/*" hidden></label><small class="mut" id="kat">${d.audio_url ? "🔊 يوجد تسجيل" : "بدون تسجيل: يُقرأ بصوت الجهاز"}</small>
  ${d.audio_url ? `<audio controls src="${esc(IU(d.audio_url))}" style="width:100%"></audio>` : ""}
  <label class="f" style="margin-top:12px"><span>حالة النشر</span><select id="kst">${ST.map(([k, v]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <p id="kmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="ksv">حفظ</button><button class="btn g" id="kpv">معاينة</button></div><div class="row"><button class="btn g" id="kc2">إغلاق</button></div>`);
  $("#kc", s).onchange = (e) => { $("#klt", s).hidden = e.target.value !== "letters"; };
  $$("#kag .chip, #kgr .chip", s).forEach((b) => b.onclick = () => b.classList.toggle("on"));
  $("#kc2", s).onclick = closeSheet;
  $("#kfi", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); d.image_url = await up(d.slug, "img", f); $("#kim", s).outerHTML = `<img class="thumb" id="kim" src="${esc(d.image_url)}" style="max-height:180px;object-fit:contain">`; toast("تم رفع الصورة"); } catch (x) { fail(x); } };
  $("#kfa", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); d.audio_url = await up(d.slug, "audio", f); $("#kat", s).textContent = "🔊 تم رفع التسجيل"; toast("تم رفع الصوت"); } catch (x) { fail(x); } };
  const collect = () => {
    d.cat = $("#kc", s).value; d.sub = $("#ks", s).value.trim(); d.word_ar = $("#kw", s).value.trim(); d.word_en = $("#ke", s).value.trim(); d.example = $("#kx", s).value.trim();
    d.ages = $$("#kag .chip.on", s).map((b) => +b.dataset.a); d.grades = $$("#kgr .chip.on", s).map((b) => +b.dataset.g); d.subject = $("#kb", s).value; d.skill = $("#kk", s).value.trim(); d.status = $("#kst", s).value;
    if (d.cat === "letters") { d.extra.ch = $("#kch", s).value.trim(); d.extra.name = $("#knm", s).value.trim(); d.extra.con = +$("#kcn", s).value; }
  };
  $("#kpv", s).onclick = () => {
    collect(); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99;
    o.innerHTML = `<div class="sheet"><h2>معاينة البطاقة</h2><div style="border:3px solid #7c4dff;border-radius:22px;overflow:hidden;text-align:center;background:#fff">${d.image_url ? `<img src="${esc(IU(d.image_url))}" style="width:100%;max-height:300px;object-fit:contain;background:#f3eeff">` : '<div style="padding:40px;color:#c62828;font-weight:700">لا توجد صورة بعد</div>'}<div style="font:900 32px Cairo,sans-serif;color:#351078;padding:8px">${esc(d.cat === "english" ? d.word_en : d.word_ar)}</div>${d.word_en && d.cat !== "english" ? `<div dir="ltr" style="color:#666;font-weight:700">${esc(d.word_en)}</div>` : ""}<div style="background:#f3eeff;margin:10px;padding:10px;border-radius:12px;font-weight:700" dir="auto">${esc(d.example)}</div></div><p class="mut">${esc(CN[d.cat] || "")} · ${esc(d.sub)} · ${d.ages.length ? "العمر: " + d.ages.join("،") : "بلا عمر"} · ${d.grades.length ? "الصف: " + d.grades.join("،") : "بلا صف"}</p><div class="row"><button class="btn g" id="vx">إغلاق المعاينة</button></div></div>`;
    document.body.appendChild(o); o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); };
  };
  $("#ksv", s).onclick = async () => {
    collect();
    if (!d.word_ar) { $("#kmiss", s).textContent = "اكتب الكلمة بالعربية"; return; }
    const miss = readiness(d);
    if (d.status === "published" && miss.length) { $("#kmiss", s).textContent = "لا يمكن نشر البطاقة قبل اكتمال: " + miss.join("، "); return; }
    $("#kmiss", s).textContent = ""; $("#ksv", s).disabled = true;
    try {
      const row = { slug: d.slug, cat: d.cat, sub: d.sub || null, word_ar: d.word_ar, word_en: d.word_en || null, image_url: d.image_url || null, audio_url: d.audio_url || null, example: d.example || null, extra: d.extra, ages: d.ages, grades: d.grades, skill: d.skill || null, subject: d.subject || null, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("cards").insert(row) : await sb.from("cards").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#ksv", s).disabled = false; }
  };
}
})();
