/* إدارة القصص التعليمية — داخل لوحة زاد المحمية (نفس تسجيل الدخول وصلاحيات المدير) */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, imgU, SUB, ago } = Z;
const TOPICS = [["educational", "تربوية"], ["teaching", "تعليمية"], ["animals", "عن الحيوانات"], ["adventure", "مغامرات"], ["science", "علمية مبسطة"], ["values", "قيم وأخلاق"], ["thinking", "تنمية تفكير"], ["arabic", "تعلّم العربية"], ["english", "تعلّم الإنجليزية"]];
const LEVELS = [["a3", "3 سنوات"], ["a4", "4 سنوات"], ["a5", "5 سنوات"], ["a6", "6 سنوات"], ["g1", "الأول"], ["g2", "الثاني"], ["g3", "الثالث"], ["g4", "الرابع"], ["g5", "الخامس"], ["g6", "السادس"]];
const STAT = [["draft", "مسودة", "#ece8fb"], ["review", "قيد المراجعة", "#fff3c4"], ["published", "منشورة", "#d8f5e6"], ["unpublished", "غير منشورة", "#ffe3d1"]];
const SN = Object.fromEntries(STAT.map((x) => [x[0], x[1]])), SC = Object.fromEntries(STAT.map((x) => [x[0], x[2]]));
let ALL = [], F = "";

/* ---- أسئلة: نص ⇄ JSON ---- */
function qToText(qs) {
  return (qs || []).map((q) => {
    if (q.t === "mcq") return "اختيار: " + q.q + "\n" + q.o.map((o, i) => (i === q.a ? "*" : "") + o).join("\n");
    if (q.t === "order") return "ترتيب: " + q.q + "\n" + q.items.join("\n");
    if (q.t === "match") return "توصيل: " + q.q + "\n" + q.pairs.map((p) => p[0] + "=" + p[1]).join("\n");
    return "";
  }).filter(Boolean).join("\n\n");
}
function textToQ(txt) {
  const out = [], errs = [];
  String(txt || "").split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).forEach((b, n) => {
    const L = b.split("\n").map((x) => x.trim()).filter(Boolean), m = L[0].match(/^(اختيار|ترتيب|توصيل)\s*:\s*(.+)$/);
    if (!m) { errs.push(`السؤال ${n + 1}: يجب أن يبدأ بـ «اختيار:» أو «ترتيب:» أو «توصيل:»`); return; }
    const rest = L.slice(1);
    if (m[1] === "اختيار") {
      const ci = rest.findIndex((x) => x.startsWith("*")), o = rest.map((x) => x.replace(/^\*/, "").trim());
      if (rest.length < 2 || ci < 0 || rest.filter((x) => x.startsWith("*")).length !== 1) { errs.push(`السؤال ${n + 1}: يلزم خياران على الأقل وإجابة صحيحة واحدة بعلامة *`); return; }
      const ok = o[ci]; o.splice(ci, 1); out.push({ t: "mcq", q: m[2], o: [ok, ...o], a: 0 });
    } else if (m[1] === "ترتيب") {
      if (rest.length < 3) { errs.push(`السؤال ${n + 1}: يلزم 3 أحداث على الأقل بالترتيب الصحيح`); return; }
      out.push({ t: "order", q: m[2], items: rest });
    } else {
      const pr = rest.map((x) => x.split("=").map((y) => y.trim())).filter((p) => p.length === 2 && p[0] && p[1]);
      if (pr.length < 2 || pr.length !== rest.length) { errs.push(`السؤال ${n + 1}: اكتب كل سطر بالشكل أ=ب (سطران على الأقل)`); return; }
      out.push({ t: "match", q: m[2], pairs: pr });
    }
  });
  return { out, errs };
}
/* ---- جاهزية النشر ---- */
function readiness(d, pages, qs) {
  const miss = [];
  if (!d.title || !d.title.trim()) miss.push("العنوان");
  if (!d.summary || d.summary.trim().length < 15) miss.push("وصف مختصر");
  if (!d.goal || d.goal.trim().length < 10) miss.push("الهدف التعليمي");
  if (!d.cover_url) miss.push("صورة الغلاف");
  if (!d.levels.length) miss.push("العمر أو الصف");
  if (pages.length < 3) miss.push("3 صفحات على الأقل");
  if (pages.some((p) => !p.text || !p.text.trim())) miss.push("نص كل صفحة");
  if (qs.length < 3) miss.push("3 أسئلة فهم على الأقل");
  return miss;
}
async function load() {
  const r = await sb.from("stories").select("*").order("sort_order").limit(500);
  if (r.error) throw r.error; ALL = r.data || [];
}
async function up(slug, kind, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `stories/${slug}/${kind}-${Date.now()}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error;
  return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
SUB.storiesadm = { title: "إدارة القصص", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>كل القصص</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="sn">➕ قصة جديدة</button></div>
  <div class="chips" id="sch" style="margin-top:8px"></div><div id="sls"></div>`;
  const draw = () => {
    $("#sch").innerHTML = [["", `الكل (${ALL.length})`], ...STAT.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${F === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    const list = ALL.filter((x) => !F || x.status === F);
    $("#sls").innerHTML = list.length ? list.map((x) => `<div class="item" data-i="${x.id}">${x.cover_url ? `<img loading="lazy" src="${esc(imgU(String(x.cover_url).replace("cover.webp", "thumb.webp")))}" alt="">` : `<div class="ph">📖</div>`}<div class="tx"><b>${esc(x.title)}</b><small>${esc(x.levels.join("، "))} · قراءات: ${x.reads || 0} · ${ago(x.updated_at)}</small></div><span style="background:${SC[x.status]};border-radius:10px;padding:3px 9px;font-size:12px;font-weight:700;white-space:nowrap">${SN[x.status]}</span></div>`).join("") : `<div class="empty">لا توجد قصص</div>`;
    $$("#sch [data-s]").forEach((b) => b.onclick = () => { F = b.dataset.s; draw(); });
    $$("#sls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#sn").onclick = () => edit(null, () => view(m));
} };
async function edit(story, reload) {
  const isNew = !story;
  const d = story ? Object.assign({}, story, { levels: (story.levels || []).slice() }) : { slug: "story-" + Date.now().toString(36), title: "", summary: "", goal: "", topic: "educational", levels: [], cover_url: "", pdf_url: "", activities_pdf_url: "", questions: [], status: "draft", sort_order: ALL.length + 1 };
  let pages = [];
  if (!isNew) { const r = await sb.from("story_pages").select("n,text,images,audio_url").eq("story_id", d.id).order("n"); if (r.error) return fail(r.error); pages = (r.data || []).map((p) => ({ text: p.text, images: p.images || [], audio_url: p.audio_url || "" })); }
  const orig = JSON.stringify(pages);
  const s = sheet(`<h2>${isNew ? "قصة جديدة" : "تعديل القصة"}</h2>
  <label class="f"><span>العنوان</span><input type="text" id="st" value="${esc(d.title)}"></label>
  <label class="f"><span>وصف مختصر</span><textarea id="ss">${esc(d.summary)}</textarea></label>
  <label class="f"><span>الهدف التعليمي</span><textarea id="sg">${esc(d.goal)}</textarea></label>
  <label class="f"><span>التصنيف</span><select id="sp">${TOPICS.map(([k, v]) => `<option value="${k}" ${d.topic === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <p style="margin:10px 2px 4px;font-weight:700">العمر / الصف</p><div class="chips" id="sl" style="flex-wrap:wrap">${LEVELS.map(([k, v]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${v}</button>`).join("")}</div>
  <p style="margin:12px 2px 4px;font-weight:700">الغلاف</p>${d.cover_url ? `<img class="thumb" id="scv" src="${esc(imgU(d.cover_url))}" style="max-height:200px;object-fit:contain">` : `<div class="thumb c" id="scv" style="padding:30px 0;font-size:34px">🖼️</div>`}
  <label class="btn g" style="display:block;text-align:center;margin-top:6px">رفع صورة الغلاف<input type="file" id="sfc" accept="image/*" hidden></label>
  <p style="margin:12px 2px 4px;font-weight:700">ملفات PDF (اختياري)</p>
  <label class="btn g" style="display:block;text-align:center">رفع PDF القصة<input type="file" id="sfp" accept="application/pdf" hidden></label><small class="mut" id="spt">${d.pdf_url ? "✔ يوجد ملف" : "لا يوجد ملف"}</small>
  <label class="btn g" style="display:block;text-align:center;margin-top:6px">رفع PDF الأنشطة<input type="file" id="sfa" accept="application/pdf" hidden></label><small class="mut" id="sat">${d.activities_pdf_url ? "✔ يوجد ملف" : "لا يوجد ملف"}</small>
  <p style="margin:14px 2px 4px;font-weight:700">صفحات القصة</p><div id="spg"></div><button type="button" class="btn g" id="spa">➕ إضافة صفحة</button>
  <label class="f" style="margin-top:12px"><span>أسئلة الفهم</span><textarea id="sq" rows="10" dir="auto" placeholder="اختيار: السؤال؟&#10;*الإجابة الصحيحة&#10;خيار آخر&#10;&#10;ترتيب: رتّب الأحداث&#10;الحدث الأول&#10;الحدث الثاني&#10;الحدث الثالث&#10;&#10;توصيل: صِل&#10;أ=ب&#10;ج=د">${esc(qToText(d.questions))}</textarea></label>
  <small class="mut">اترك سطرًا فارغًا بين كل سؤال والذي يليه. الإجابة الصحيحة في «اختيار» تبدأ بعلامة *، وسيخلطها الموقع تلقائيًا.</small>
  <label class="f" style="margin-top:12px"><span>حالة النشر</span><select id="sa">${STAT.map(([k, v]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <p id="smiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="ssv">حفظ</button><button class="btn g" id="spv">معاينة</button></div><div class="row"><button class="btn g" id="sc">إغلاق</button></div>`);
  const drawPages = () => {
    $("#spg", s).innerHTML = pages.map((p, k) => `<div class="card" data-k="${k}" style="margin-bottom:8px"><b>صفحة ${k + 1}</b>
    <textarea data-f="text" rows="3" dir="auto" placeholder="نص الصفحة (للإنجليزية: سطر إنجليزي ثم سطر عربي)">${esc(p.text)}</textarea>
    <textarea data-f="images" rows="2" dir="ltr" placeholder="روابط الصور، رابط في كل سطر">${esc((p.images || []).join("\n"))}</textarea>
    <div class="row"><label class="btn g" style="text-align:center;flex:1">رفع صورة<input type="file" accept="image/*" data-f="upimg" hidden></label><label class="btn g" style="text-align:center;flex:1">رفع صوت<input type="file" accept="audio/*" data-f="upaud" hidden></label></div>
    <small class="mut">${p.audio_url ? "🔊 يوجد تسجيل صوتي" : "بدون تسجيل (سيُقرأ بصوت الجهاز)"}</small>
    <div class="row" style="margin-top:6px"><button type="button" class="chip" data-a="up">↑</button><button type="button" class="chip" data-a="dn">↓</button><button type="button" class="chip" data-a="rm">حذف الصفحة</button></div></div>`).join("");
    $$("#spg .card", s).forEach((c) => {
      const k = +c.dataset.k;
      c.querySelector('[data-f="text"]').oninput = (e) => pages[k].text = e.target.value;
      c.querySelector('[data-f="images"]').oninput = (e) => pages[k].images = e.target.value.split("\n").map((x) => x.trim()).filter(Boolean);
      c.querySelector('[data-f="upimg"]').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); pages[k].images.push(await up(d.slug, "img", f)); drawPages(); } catch (x) { fail(x); } };
      c.querySelector('[data-f="upaud"]').onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); pages[k].audio_url = await up(d.slug, "audio", f); drawPages(); } catch (x) { fail(x); } };
      c.querySelectorAll("[data-a]").forEach((b) => b.onclick = () => { const a = b.dataset.a; if (a === "rm") pages.splice(k, 1); else { const j = a === "up" ? k - 1 : k + 1; if (j < 0 || j >= pages.length) return; [pages[k], pages[j]] = [pages[j], pages[k]]; } drawPages(); });
    });
  };
  drawPages();
  $("#spa", s).onclick = () => { pages.push({ text: "", images: [], audio_url: "" }); drawPages(); };
  $$("#sl [data-l]", s).forEach((b) => b.onclick = () => b.classList.toggle("on"));
  $("#sc", s).onclick = closeSheet;
  const bind = (id, key, lab, out) => { $(id, s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); d[key] = await up(d.slug, out, f); if (key === "cover_url") $("#scv", s).outerHTML = `<img class="thumb" id="scv" src="${esc(d[key])}" style="max-height:200px;object-fit:contain">`; else $(lab, s).textContent = "✔ تم رفع الملف"; } catch (x) { fail(x); } }; };
  bind("#sfc", "cover_url", "", "cover"); bind("#sfp", "pdf_url", "#spt", "story"); bind("#sfa", "activities_pdf_url", "#sat", "activities");
  const collect = () => { d.title = $("#st", s).value.trim(); d.summary = $("#ss", s).value.trim(); d.goal = $("#sg", s).value.trim(); d.topic = $("#sp", s).value; d.levels = $$("#sl .chip.on", s).map((b) => b.dataset.l); d.status = $("#sa", s).value; const q = textToQ($("#sq", s).value); return q; };
  $("#spv", s).onclick = () => {
    collect();
    const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99;
    o.innerHTML = `<div class="sheet"><h2>معاينة: ${esc(d.title)}</h2>${d.cover_url ? `<img class="thumb" src="${esc(imgU(d.cover_url))}" style="max-height:240px;object-fit:contain">` : ""}<p class="mut">${esc(d.summary)}</p>${pages.map((p, k) => `<div class="card" style="margin-bottom:8px"><small class="mut">صفحة ${k + 1}</small><div style="display:flex;gap:6px;justify-content:center">${(p.images || []).map((u) => `<img src="${esc(imgU(u))}" style="max-height:110px;max-width:45%;object-fit:contain" alt="">`).join("")}</div><p style="font-size:18px;line-height:1.9;margin:6px 0 0;white-space:pre-line">${esc(p.text)}</p></div>`).join("")}<button class="btn g" id="vx">رجوع للتعديل</button></div>`;
    document.body.appendChild(o);
    o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); };
  };
  $("#ssv", s).onclick = async () => {
    const { out, errs } = collect();
    if (errs.length) { $("#smiss", s).textContent = errs.join(" — "); return; }
    if (!d.title) { $("#smiss", s).textContent = "اكتب عنوان القصة"; return; }
    d.questions = out;
    const miss = readiness(d, pages, out);
    if (d.status === "published" && miss.length) { $("#smiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; }
    $("#smiss", s).textContent = ""; $("#ssv", s).disabled = true;
    try {
      const row = { slug: d.slug, title: d.title, summary: d.summary, goal: d.goal, topic: d.topic, levels: d.levels, cover_url: d.cover_url || null, pdf_url: d.pdf_url || null, activities_pdf_url: d.activities_pdf_url || null, questions: d.questions, status: d.status, sort_order: d.sort_order };
      let id = d.id;
      if (isNew && !id) { const r = await sb.from("stories").insert(row).select("id").single(); if (r.error) throw r.error; id = r.data.id; d.id = id; }
      else { const r = await sb.from("stories").update(row).eq("id", id); if (r.error) throw r.error; }
      const clean = pages.map((p, k) => ({ story_id: id, n: k + 1, text: p.text.trim(), images: p.images || [], audio_url: p.audio_url || null }));
      if (JSON.stringify(pages) !== orig || isNew) {
        const dl = await sb.from("story_pages").delete().eq("story_id", id); if (dl.error) throw dl.error;
        if (clean.length) { const ins = await sb.from("story_pages").insert(clean); if (ins.error) { toast("تعذّر حفظ الصفحات، أعد المحاولة قبل الإغلاق"); throw ins.error; } }
      }
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#ssv", s).disabled = false; }
  };
}
})();
