/* إدارة الأدلة الإرشادية — داخل لوحة زاد المحمية */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const AUDS = [["parent", "أولياء الأمور"], ["teacher", "المعلمون"], ["child", "الأطفال"]];
const KINDS = [["guide", "دليل"], ["age", "دليل حسب العمر"], ["section", "دليل قسم"], ["template", "نموذج للطباعة"]];
const LEVELS = [["a2", "سنة–سنتان"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "غير منشور"]];
const N = (a) => Object.fromEntries(a), AN = N(AUDS), KN = N(KINDS), SN = N(ST), LN = N(LEVELS);
const IU = (u) => /^https?:/.test(u || "") ? u : "../" + String(u || "");
let ALL = [], FS = "", FA = "", FQ = "";
const readiness = (d) => { const m = []; if (!(d.title || "").trim()) m.push("العنوان"); if (!(d.description || "").trim()) m.push("الوصف"); if (!d.levels.length) m.push("العمر أو الصف"); if (!d.cover_url) m.push("الغلاف"); if (!d.pdf_url) m.push("ملف PDF"); if (!(d.body || []).length) m.push("محتوى الدليل"); if (!(d.review_note || "").trim()) m.push("ملاحظة المراجعة"); return m; };
async function load() { const r = await sb.from("guides").select("*").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, kind, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `guides/${slug}/${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
/* تحويل بين الكتل والنص البسيط */
const SIMPLE = ["h", "p", "steps", "tips", "ex", "img"];
const simple = (body) => (body || []).every((b) => SIMPLE.includes(b.t));
function toText(body) {
  return (body || []).map((b) => b.t === "h" ? "# " + b.x : b.t === "p" ? b.x : b.t === "steps" ? "@خطوات\n" + b.items.map((i) => "- " + i.h + " :: " + i.x).join("\n") : b.t === "tips" ? "@نصائح\n" + b.items.map((i) => "- " + i).join("\n") : b.t === "ex" ? "@مثال\n" + b.x : "@صورة " + b.u + " :: " + (b.cap || "")).join("\n\n");
}
function toBlocks(txt) {
  const out = []; txt.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean).forEach((s) => {
    const L = s.split("\n").map((x) => x.trim()).filter(Boolean);
    if (L[0].startsWith("# ")) { out.push({ t: "h", x: L[0].slice(2) }); if (L.length > 1) out.push({ t: "p", x: L.slice(1).join(" ") }); }
    else if (L[0] === "@خطوات") out.push({ t: "steps", title: "", items: L.slice(1).map((x) => x.replace(/^-\s*/, "").split(" :: ")).map((p) => ({ h: p[0], x: p[1] || "" })) });
    else if (L[0] === "@نصائح") out.push({ t: "tips", title: "نصائح عملية", items: L.slice(1).map((x) => x.replace(/^-\s*/, "")) });
    else if (L[0] === "@مثال") out.push({ t: "ex", title: "مثال تطبيقي", x: L.slice(1).join(" ") });
    else if (L[0].startsWith("@صورة ")) { const p = L[0].slice(6).split(" :: "); out.push({ t: "img", u: p[0], cap: p[1] || "" }); }
    else out.push({ t: "p", x: L.join(" ") });
  }); return out;
}
SUB.guidesadm = { title: "إدارة الأدلة الإرشادية", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="gn">➕ دليل جديد</button></div>
  <input type="search" id="gqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="gch" style="margin-top:8px"></div><div class="chips" id="gca" style="margin-top:6px"></div><div id="gls"></div>`;
  const draw = () => {
    $("#gch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#gca").innerHTML = [["", "كل الفئات"], ...AUDS].map(([k, l]) => `<button class="chip ${FA === k ? "on" : ""}" data-a="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FA || x.audience === FA) && (!q || (x.title + " " + (x.topic || "")).toLowerCase().includes(q)));
    $("#gls").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}">${x.cover_url ? `<img loading="lazy" src="${esc(IU(x.cover_url))}" alt="" style="object-fit:cover">` : `<div class="ph">📘</div>`}<div class="tx"><b>${esc(x.title)}</b><small>${esc(AN[x.audience] || x.audience)} · ${esc(KN[x.kind] || x.kind)} · ${esc(SN[x.status] || x.status)}${ms.length ? " · ⚠ ناقص: " + esc(ms.join("، ")) : ""}</small></div></div>`; }).join("") : `<div class="spin">لا توجد أدلة</div>`;
    $$("#gch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#gca [data-a]").forEach((b) => b.onclick = () => { FA = b.dataset.a; draw(); });
    $$("#gls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#gqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#gn").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), goals: (a.goals || []).slice(), summary: (a.summary || []).slice(), body: a.body || [] })
    : { slug: "gd-" + Date.now().toString(36), audience: "parent", kind: "guide", title: "", description: "", levels: [], topic: "", goals: [], intro: "", body: [], summary: [], cover_url: "", pdf_url: "", review_note: "", status: "draft", sort_order: ALL.length + 1 };
  const ro = !simple(d.body);
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v)}"></label>`;
  const TA = (id, l, v, r) => `<label class="f"><span>${l}</span><textarea id="${id}" rows="${r}" dir="auto">${esc(v)}</textarea></label>`;
  const sel = (id, l, arr, v) => `<label class="f"><span>${l}</span><select id="${id}">${arr.map(([k, t]) => `<option value="${k}" ${v === k ? "selected" : ""}>${t}</option>`).join("")}</select></label>`;
  const fileRow = (k, l, v, acc) => `<p style="margin:12px 2px 4px;font-weight:700">${l}</p><small class="mut" id="${k}t">${v ? "✔ " + esc(v) : "لم يُرفع بعد"}</small><label class="btn g" style="display:block;text-align:center;margin-top:4px">رفع<input type="file" id="${k}f" accept="${acc}" hidden></label>`;
  const s = sheet(`<h2>${isNew ? "دليل جديد" : "تعديل الدليل"}</h2>
  ${T("gt", "العنوان", d.title)}${sel("ga", "الفئة المستهدفة", AUDS, d.audience)}${sel("gk", "نوع الدليل", KINDS, d.kind)}${T("go", "الموضوع / التصنيف", d.topic || "")}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="glv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${TA("gd", "وصف مختصر", d.description, 2)}${TA("gg", "أهداف الدليل (هدف في كل سطر)", d.goals.join("\n"), 3)}${TA("gi", "مقدمة", d.intro || "", 3)}
  <p style="margin:12px 2px 4px;font-weight:700">المحتوى</p>
  ${ro ? `<p style="color:#8a4b00;font-weight:700">⚠ يحتوي هذا الدليل على جداول أو نماذج لا يدعمها المحرر النصي، لذلك المحتوى للعرض فقط ويُحفظ كما هو.</p><textarea rows="6" dir="auto" readonly>${esc(toText(d.body.filter((b) => SIMPLE.includes(b.t))))}</textarea>`
    : `<small class="mut">العنوان: ‎# عنوان — خطوات: ‎@خطوات ثم ‎- العنوان :: الشرح — نصائح: ‎@نصائح — مثال: ‎@مثال — صورة: ‎@صورة رابط :: وصف. افصل الفقرات بسطر فارغ.</small>${TA("gb", "", toText(d.body), 12)}`}
  <small class="mut">صور توضيحية: ارفع صورة ثم انسخ رابطها إلى سطر ‎@صورة</small><label class="btn g" style="display:block;text-align:center;margin-top:4px">رفع صورة توضيحية<input type="file" id="gimf" accept="image/*" hidden></label><small class="mut" id="gimt"></small>
  ${TA("gs", "ملخص أهم النقاط (نقطة في كل سطر)", d.summary.join("\n"), 3)}
  <p style="margin:12px 2px 4px;font-weight:700">صورة الغلاف (إلزامية)</p>${d.cover_url ? `<img class="thumb" id="gim" src="${esc(IU(d.cover_url))}" style="max-height:160px;object-fit:contain">` : `<div class="thumb c" id="gim" style="padding:26px 0;font-size:34px">🖼️</div>`}
  <label class="btn g" style="display:block;text-align:center;margin-top:6px">رفع صورة<input type="file" id="gif" accept="image/*" hidden></label>
  ${fileRow("gp", "ملف PDF (إلزامي)", d.pdf_url, "application/pdf")}
  ${TA("grn", "ملاحظة المراجعة (من راجع المحتوى وكيف؛ تلزم قبل النشر)", d.review_note || "", 2)}
  ${sel("gst", "حالة النشر", ST, d.status)}
  <p id="gmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="gsv">حفظ</button><button class="btn g" id="gpv">معاينة</button></div><div class="row"><button class="btn g" id="gx">إغلاق</button></div>`);
  $("#gx", s).onclick = closeSheet;
  $$("#glv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  const one = (id, key, tid) => { $("#" + id, s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); d[key] = await up(d.slug, key, f); $("#" + tid, s).textContent = "✔ " + d[key]; if (key === "cover_url") $("#gim", s).outerHTML = `<img class="thumb" id="gim" src="${esc(d.cover_url)}" style="max-height:160px;object-fit:contain">`; toast("تم الرفع"); } catch (x) { fail(x); } }; };
  one("gif", "cover_url", "gimt"); one("gpf", "pdf_url", "gpt");
  $("#gimf", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); const u = await up(d.slug, "img", f); $("#gimt", s).textContent = "رابط الصورة: " + u; toast("تم الرفع"); } catch (x) { fail(x); } };
  const lines = (id) => $("#" + id, s).value.split("\n").map((x) => x.trim()).filter(Boolean);
  const collect = () => {
    d.title = $("#gt", s).value.trim(); d.audience = $("#ga", s).value; d.kind = $("#gk", s).value; d.topic = $("#go", s).value.trim() || null;
    d.description = $("#gd", s).value.trim(); d.goals = lines("gg"); d.intro = $("#gi", s).value.trim(); d.summary = lines("gs"); d.review_note = $("#grn", s).value.trim(); d.status = $("#gst", s).value;
    if (!ro) d.body = toBlocks($("#gb", s).value);
  };
  $("#gpv", s).onclick = () => {
    collect(); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99;
    o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;overflow:hidden;background:#fff;padding:0 0 8px">${d.cover_url ? `<img src="${esc(IU(d.cover_url))}" style="width:100%;max-height:220px;object-fit:contain;background:#f3eeff">` : '<div style="padding:30px;color:#c62828;font-weight:700;text-align:center">لا يوجد غلاف بعد</div>'}<div style="padding:8px 12px"><b>${esc(d.title)}</b><p style="color:#666">${esc(AN[d.audience])} · ${esc(KN[d.kind])} · ${esc(d.levels.map((l) => LN[l]).join("، "))}</p><p>${esc(d.description)}</p><p>${d.body.length} كتلة محتوى · ${d.pdf_url ? "PDF جاهز" : "لا PDF"}</p></div></div><div class="row"><button class="btn g" id="vx">إغلاق</button></div></div>`;
    document.body.appendChild(o); o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); };
  };
  $("#gsv", s).onclick = async () => {
    collect();
    if (!d.title) { $("#gmiss", s).textContent = "اكتب العنوان"; return; }
    if (d.status === "published") { const miss = readiness(d); if (miss.length) { $("#gmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#gmiss", s).textContent = ""; $("#gsv", s).disabled = true;
    try {
      const row = { slug: d.slug, audience: d.audience, kind: d.kind, title: d.title, description: d.description, levels: d.levels, topic: d.topic, goals: d.goals, intro: d.intro, body: d.body, summary: d.summary, cover_url: d.cover_url || null, pdf_url: d.pdf_url || null, review_note: d.review_note || null, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("guides").insert(row) : await sb.from("guides").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#gsv", s).disabled = false; }
  };
}
})();
