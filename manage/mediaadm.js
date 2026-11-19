/* إدارة الوسائل التعليمية — داخل لوحة زاد المحمية */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const KINDS = [["mindmap", "خريطة ذهنية"], ["slides", "عرض تقديمي"], ["poster", "ملصق تعليمي"], ["board", "لوحة تعليمية"], ["diagram", "مخطط ورسم توضيحي"], ["table", "جدول تعليمي"], ["infographic", "إنفوجرافيك"], ["explainer", "وسيلة شرح مصورة"], ["concept_cards", "بطاقات مفاهيم"], ["printable", "وسيلة قابلة للطباعة"]];
const KN = Object.fromEntries(KINDS);
const LEVELS = [["a2", "سنة–سنتان"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const LN = Object.fromEntries(LEVELS);
const SUBJ = ["اللغة العربية", "الرياضيات", "اللغة الإنجليزية", "العلوم", "التربية الإسلامية", "المهارات الحياتية"];
const OR = [["landscape", "أفقي"], ["portrait", "عمودي"], ["slide", "شرائح"]];
const ST = [["draft", "مسودة"], ["published", "منشورة"], ["unpublished", "غير منشورة"]];
const SN = Object.fromEntries(ST);
const IU = (u) => /^https?:/.test(u || "") ? u : "../" + String(u || "");
let ALL = [], FS = "", FK = "", FQ = "";
const norm = (s) => String(s || "").toLowerCase();
function readiness(d) {
  const m = [];
  if (!(d.title || "").trim()) m.push("العنوان"); if (!(d.description || "").trim()) m.push("الوصف"); if (!(d.subject || "").trim()) m.push("المادة");
  if (!d.levels.length) m.push("الصف أو العمر"); if (!d.cover_url) m.push("صورة الغلاف"); if (!d.pdf_url) m.push("ملف PDF"); if (!d.page_urls.length) m.push("صور صفحات المعاينة");
  return m;
}
async function load() { const r = await sb.from("media_aids").select("*").order("kind").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, kind, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `media/${slug}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
SUB.mediaadm = { title: "إدارة الوسائل التعليمية", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="mn">➕ وسيلة تعليمية جديدة</button></div>
  <input type="search" id="mqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="mch" style="margin-top:8px"></div><div class="chips" id="mck" style="margin-top:6px"></div><div id="mls"></div>`;
  const draw = () => {
    $("#mch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#mck").innerHTML = [["", "كل الأنواع"], ...KINDS].map(([k, l]) => `<button class="chip ${FK === k ? "on" : ""}" data-k="${k}">${l}</button>`).join("");
    const q = norm(FQ), list = ALL.filter((x) => (!FS || x.status === FS) && (!FK || x.kind === FK) && (!q || norm(x.title + " " + x.subject + " " + (x.topic || "")).includes(q)));
    $("#mls").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}">${x.cover_url ? `<img loading="lazy" src="${esc(IU(x.cover_url))}" alt="" style="object-fit:cover">` : `<div class="ph">🖼️</div>`}<div class="tx"><b>${esc(x.title)}</b><small>${esc(KN[x.kind] || x.kind)} · ${esc(x.subject)} · ${esc(x.levels.map((l) => LN[l] || l).join("، "))} · ${SN[x.status]}${ms.length ? " · ينقص: " + esc(ms.join("، ")) : ""}</small></div></div>`; }).join("") : '<p class="mut">لا توجد عناصر مطابقة.</p>';
    $$("#mch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#mck [data-k]").forEach((b) => b.onclick = () => { FK = b.dataset.k; draw(); });
    $$("#mls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#mqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#mn").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), page_urls: (a.page_urls || []).slice() })
    : { slug: "media-" + Date.now().toString(36), kind: "poster", title: "", description: "", levels: [], subject: "", topic: "", orient: "landscape", pages: 1, cover_url: "", pdf_url: "", bw_url: "", page_urls: [], review_note: "", status: "draft", sort_order: ALL.length + 1 };
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v)}"></label>`;
  const fileRow = (k, l, v, acc, multi) => `<p style="margin:12px 2px 4px;font-weight:700">${l}</p><small class="mut" id="${k}t">${v ? "✔ " + esc(v) : "لم يُرفع بعد"}</small><label class="btn g" style="display:block;text-align:center;margin-top:4px">رفع<input type="file" id="${k}f" accept="${acc}" ${multi ? "multiple" : ""} hidden></label>`;
  const s = sheet(`<h2>${isNew ? "وسيلة جديدة" : "تعديل"}</h2>
  ${T("mt", "العنوان", d.title)}
  <label class="f"><span>النوع</span><select id="mk">${KINDS.map(([k, v]) => `<option value="${k}" ${d.kind === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <label class="f"><span>المادة</span><select id="mb"><option value="">اختر</option>${SUBJ.map((v) => `<option ${d.subject === v ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  ${T("mo", "الموضوع (اختياري)", d.topic || "")}
  <p style="margin:12px 2px 4px;font-weight:700">الصفوف والأعمار المناسبة</p><div class="chips" id="mlv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  <label class="f"><span>اتجاه الصفحة</span><select id="mor">${OR.map(([k, v]) => `<option value="${k}" ${d.orient === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <label class="f"><span>وصف مختصر</span><textarea id="md" rows="2" dir="auto">${esc(d.description)}</textarea></label>
  <p style="margin:12px 2px 4px;font-weight:700">صورة الغلاف (إلزامية)</p>${d.cover_url ? `<img class="thumb" id="mim" src="${esc(IU(d.cover_url))}" style="max-height:160px;object-fit:contain">` : `<div class="thumb c" id="mim" style="padding:26px 0;font-size:34px">🖼️</div>`}
  <label class="btn g" style="display:block;text-align:center;margin-top:6px">رفع صورة<input type="file" id="mif" accept="image/*" hidden></label>
  ${fileRow("mp", "ملف PDF (إلزامي)", d.pdf_url, "application/pdf")}${fileRow("mw", "نسخة PDF أبيض وأسود (اختياري)", d.bw_url, "application/pdf")}
  ${fileRow("mg", "صور الصفحات للمعاينة (صورة لكل صفحة، بالترتيب)", d.page_urls.length ? d.page_urls.length + " صفحة" : "", "image/*", true)}
  <label class="f"><span>ملاحظة المراجعة (من راجع المحتوى وكيف؛ تلزم قبل النشر)</span><textarea id="mrn" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="margin-top:12px"><span>حالة النشر</span><select id="mst">${ST.map(([k, v]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <p id="mmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="msv">حفظ</button><button class="btn g" id="mpv">معاينة</button></div><div class="row"><button class="btn g" id="mx">إغلاق</button></div>`);
  $("#mx", s).onclick = closeSheet;
  $$("#mlv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  const one = (id, key, tid, label) => { $("#" + id, s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); d[key] = await up(d.slug, key, f); $("#" + tid, s).textContent = "✔ " + d[key]; toast("تم رفع " + label); if (key === "cover_url") $("#mim", s).outerHTML = `<img class="thumb" id="mim" src="${esc(d.cover_url)}" style="max-height:160px;object-fit:contain">`; } catch (x) { fail(x); } }; };
  one("mif", "cover_url", "mim", "الغلاف"); one("mpf", "pdf_url", "mpt", "الملف"); one("mwf", "bw_url", "mwt", "الملف");
  $("#mgf", s).onchange = async (e) => {
    const fs = [...e.target.files].sort((x, y) => x.name.localeCompare(y.name, "en", { numeric: true })); if (!fs.length) return;
    try { toast("جاري رفع " + fs.length + " صورة…"); const urls = []; for (const f of fs) urls.push(await up(d.slug, "page", f)); d.page_urls = urls; d.pages = urls.length; $("#mgt", s).textContent = "✔ " + urls.length + " صفحة (حسب ترتيب أسماء الملفات)"; toast("تم رفع الصفحات"); } catch (x) { fail(x); }
  };
  const collect = () => {
    d.title = $("#mt", s).value.trim(); d.kind = $("#mk", s).value; d.subject = $("#mb", s).value; d.topic = $("#mo", s).value.trim() || null;
    d.orient = $("#mor", s).value; d.description = $("#md", s).value.trim(); d.review_note = $("#mrn", s).value.trim(); d.status = $("#mst", s).value;
  };
  $("#mpv", s).onclick = () => {
    collect();
    const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99;
    o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;overflow:hidden;background:#fff;padding-bottom:8px">${d.cover_url ? `<img src="${esc(IU(d.cover_url))}" style="width:100%;max-height:220px;object-fit:contain;background:#f3eeff">` : '<div style="padding:30px;color:#c62828;font-weight:700;text-align:center">لا يوجد غلاف بعد</div>'}<div style="padding:8px 12px"><b style="font-size:18px">${esc(d.title)}</b><p class="mut">${esc(KN[d.kind])} · ${esc(d.subject)} · ${esc(d.levels.map((l) => LN[l]).join("، "))}</p><p>${esc(d.description)}</p>${d.page_urls.map((u) => `<img src="${esc(IU(u))}" style="width:100%;border:1px solid #ddd;margin-top:6px">`).join("") || '<p style="color:#c62828">لا توجد صور صفحات</p>'}${d.pdf_url ? `<a href="${esc(IU(d.pdf_url))}" target="_blank" rel="noopener">فتح ملف PDF</a>` : '<p style="color:#c62828">لا يوجد ملف PDF</p>'}</div></div><div class="row"><button class="btn g" id="vx">إغلاق المعاينة</button></div></div>`;
    document.body.appendChild(o); o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); };
  };
  $("#msv", s).onclick = async () => {
    collect();
    if (!d.title) { $("#mmiss", s).textContent = "اكتب العنوان"; return; }
    if (d.status === "published") {
      const miss = readiness(d); if (!d.review_note) miss.push("ملاحظة المراجعة");
      if (miss.length) { $("#mmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; }
    }
    $("#mmiss", s).textContent = ""; $("#msv", s).disabled = true;
    try {
      const row = { slug: d.slug, kind: d.kind, title: d.title, description: d.description, levels: d.levels, subject: d.subject, topic: d.topic, orient: d.orient, pages: d.pages || d.page_urls.length || 1, cover_url: d.cover_url || null, pdf_url: d.pdf_url || null, bw_url: d.bw_url || null, page_urls: d.page_urls, review_note: d.review_note || null, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("media_aids").insert(row) : await sb.from("media_aids").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#msv", s).disabled = false; }
  };
}
})();
