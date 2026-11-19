/* إدارة عالم الإبداع والفنون + مراجعة أعمال المعرض — داخل لوحة زاد المحمية. لا نشر قبل المراجعة. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["color", "عالم التلوين"], ["draw", "عالم الرسم"], ["craft", "الأشغال اليدوية"], ["cutpaste", "عالم القص واللصق"], ["design", "عالم التصميم والإبداع"]];
const ADULTS = [["none", "متابعة بسيطة"], ["near", "بحضور كبير بجانب الطفل"], ["required", "إشراف مباشر من كبير"]];
const LEVELS = [["a2", "سنة–سنتان"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "غير منشور"]];
const BAN = ["نار", "لهب", "شمعة", "حرق", "ساخن", "سخّن", "تسخين", "يغلي", "سكين", "إبرة", "دبوس", "حمض", "كلور", "منظف", "تذوق", "اشرب", "كهرباء", "بطارية", "ولاعة", "موقد", "فرن", "مسدس", "شفرة", "كتر", "طلاء", "بخاخ", "سبراي", "زيتي", "مذيب", "مبيد", "دواء"];
const CN = Object.fromEntries(CATS), SN = Object.fromEntries(ST);
const IC = (c) => `../images/zad/${c}.webp`;
const lines = (t) => String(t).split("\n").map((l) => l.trim()).filter(Boolean);
const pairToText = (a) => (a || []).map((m) => `${m[0]} :: ${m[1] || ""}`).join("\n");
const textToPair = (t) => lines(t).map((l) => { const p = l.split("::").map((x) => x.trim()); return [p[0], p[1] || ""]; });
const linkToText = (a) => (a || []).map((l) => l.type === "cards" ? `cards | ${l.cat} | ${l.label || ""}` : `wiki | ${l.slug}`).join("\n");
const textToLink = (t) => lines(t).map((l) => { const p = l.split("|").map((x) => x.trim()); return p[0] === "cards" ? { type: "cards", cat: p[1], label: p[2] } : { type: "wiki", slug: p[1] }; });
let ALL = [], FS = "", FC = "", FQ = "";
async function load() { const r = await sb.from("art_activities").select("*").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `arts/${slug}/f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
const banHits = (d) => { const t = [d.summary, d.goal, d.outcome, d.tips, ...(d.materials || []).map((m) => m[0]), ...(d.steps || []).map((m) => m[0])].join(" ● "); return BAN.filter((b) => t.includes(b)); };
const readiness = (d) => { const m = []; if (!d.title) m.push("العنوان"); if (!d.icon) m.push("الرسمة"); if (!(d.levels || []).length) m.push("العمر أو الصف"); if ((d.levels || []).includes("a2") && d.adult !== "required") m.push("عمر سنة–سنتين يلزمه إشراف مباشر"); if (!d.skill) m.push("المهارة"); if (!d.goal) m.push("الهدف"); if (!(d.materials || []).length) m.push("الأدوات"); if ((d.steps || []).length < 3) m.push("ثلاث خطوات على الأقل"); if (!d.outcome) m.push("النتيجة المتوقعة"); if (!d.pdf_url && !d.template) m.push("ملف PDF أو قالب تلوين"); if (!d.reviewed) m.push("تأكيد المراجعة"); if (!d.review_note) m.push("ملاحظة المراجعة"); const b = banHits(d); if (b.length) m.push("كلمات غير آمنة: " + b.join("، ")); return m; };
SUB.artsadm = { title: "إدارة عالم الإبداع والفنون", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="an">➕ نشاط جديد</button><button class="btn g" id="agl">🖼 مراجعة أعمال المعرض</button></div>
  <input type="search" id="aqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="ach" style="margin-top:8px"></div><div class="chips" id="acc" style="margin-top:6px"></div><div id="als"></div>`;
  const draw = () => {
    $("#ach").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#acc").innerHTML = [["", "كل الأقسام"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.category === FC) && (!q || x.title.toLowerCase().includes(q)));
    $("#als").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.category] || "")} · ${esc(SN[x.status] || "")}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا توجد أنشطة.</p>`;
    $$("#ach [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#acc [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#als [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#aqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#an").onclick = () => edit(null, () => view(m)); $("#agl").onclick = () => gallery(() => view(m));
} };
async function gallery(back) {
  const r = await sb.from("art_gallery").select("id,image,activity_slug,consent,status,review_note,created_at").order("created_at", { ascending: false }).limit(200);
  if (r.error) return fail(r.error);
  const rows = r.data || [], pend = rows.filter((x) => x.status === "pending").length;
  const s = sheet(`<h2>أعمال المعرض المرسلة</h2><p class="mut">لا يُعرض أي عمل للزوار إلا بعد قبولك. تأكد أن الصورة لا تحتوي اسمًا أو وجهًا أو معلومات شخصية أو محتوى غير مناسب. بانتظار المراجعة: ${pend}</p>
  <div id="gl">${rows.length ? rows.map((x) => `<div class="item" data-g="${x.id}" style="flex-direction:column;align-items:stretch"><img src="${esc(x.image)}" alt="عمل مرسل" style="width:100%;max-height:260px;object-fit:contain;background:#fff;border-radius:10px"><small>${esc(x.activity_slug || "بدون نشاط")} · ${x.status === "pending" ? "بانتظار المراجعة" : x.status === "approved" ? "معروض" : "مرفوض"} · موافقة ولي الأمر: ${x.consent ? "نعم" : "لا"}</small><div class="row"><button class="btn" data-a="approved" ${x.status === "approved" ? "disabled" : ""}>قبول وعرض</button><button class="btn g" data-a="rejected" ${x.status === "rejected" ? "disabled" : ""}>رفض / إخفاء</button></div></div>`).join("") : `<p class="mut">لا توجد أعمال مرسلة.</p>`}</div><div class="row"><button class="btn g" id="gx">إغلاق</button></div>`);
  $("#gx", s).onclick = () => { closeSheet(); back(); };
  $$("#gl [data-a]", s).forEach((b) => b.onclick = async () => {
    const id = b.closest("[data-g]").dataset.g, st = b.dataset.a; b.disabled = true;
    const u = await sb.from("art_gallery").update({ status: st, review_note: st === "approved" ? "روجع وقُبل من المسؤول بعد التأكد من خلوه من أي معلومات شخصية" : "رُفض أو أُخفي من المسؤول" }).eq("id", id);
    if (u.error) { b.disabled = false; return fail(u.error); } toast(st === "approved" ? "تم القبول" : "تم الرفض"); closeSheet(); gallery(back);
  });
}
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), materials: a.materials || [], steps: a.steps || [], links: a.links || [] })
    : { slug: "ar-" + Date.now().toString(36), category: "color", sub: "", title: "", icon: "", levels: [], skill: "", summary: "", goal: "", adult: "near", materials: [], steps: [], outcome: "", tips: "", template: null, pdf_url: null, links: [], learn: "", review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v, t) => `<label class="f"><span>${l}</span><input type="${t || "text"}" id="${id}" value="${esc(v == null ? "" : v)}"></label>`;
  const TA = (id, l, v, r) => `<label class="f"><span>${l}</span><textarea id="${id}" rows="${r}" dir="auto">${esc(v == null ? "" : v)}</textarea></label>`;
  const SEL = (id, l, o, v) => `<label class="f"><span>${l}</span><select id="${id}">${o.map(([k, x]) => `<option value="${k}" ${String(v) === String(k) ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
  const s = sheet(`<h2>${isNew ? "نشاط فني جديد" : "تعديل النشاط"}</h2>
  <p class="mut">قواعد السلامة: أدوات وألوان آمنة للأطفال، ومقص أطفال بحضور كبير فقط، ولا حرارة ولا أدوات حادة ولا مواد كيميائية. ولا يُنشر النشاط قبل تأكيد المراجعة ووجود ملف PDF أو قالب.</p>
  ${T("at", "اسم النشاط", d.title)}${SEL("ac", "القسم", CATS, d.category)}${T("asb", "النوع الفرعي (مثل: رسم الحيوانات خطوة بخطوة)", d.sub)}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="alv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("aic", "رمز الرسمة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon)}<img id="aicp" src="${d.icon ? esc(IC(d.icon)) : ""}" alt="" style="height:60px;display:${d.icon ? "block" : "none"}">
  ${T("ask", "المهارة المستهدفة", d.skill)}${TA("asm", "وصف مختصر", d.summary, 2)}${TA("ag", "الهدف الإبداعي", d.goal, 2)}${SEL("aad", "إشراف الكبار", ADULTS, d.adult)}
  ${TA("amt", "الأدوات: اسم الأداة :: رمز الرسمة (سطر لكل أداة)", pairToText(d.materials), 5)}
  ${TA("ast", "الخطوات بالترتيب: نص الخطوة :: رمز الرسمة (سطر لكل خطوة)", pairToText(d.steps), 6)}
  ${TA("aout", "النتيجة المتوقعة (نموذج، دون اشتراط التطابق)", d.outcome, 2)}${TA("atp", "نصيحة للأهل", d.tips, 2)}
  ${T("atpl", "رمز قالب التلوين في الاستوديو (اختياري، مثل fish أو house)", d.template)}
  ${TA("alk", "روابط التعلّم: ‎wiki | رمز الموضوع — ‎cards | cat | عنوان", linkToText(d.links), 2)}${T("alr", "مهارة التعلّم المرتبطة", d.learn)}
  <p style="margin:12px 2px 4px;font-weight:700">ورقة الطباعة (PDF)</p>${T("apdf", "رابط الملف", d.pdf_url)}<label class="btn g" style="display:block;text-align:center">رفع ملف PDF<input type="file" id="apf" accept="application/pdf" hidden></label>
  <p style="margin:12px 2px 4px;font-weight:700">رفع صورة توضيحية أو ملف إضافي (يُنسخ رابطه)</p><label class="btn g" style="display:block;text-align:center">رفع<input type="file" id="aimf" hidden></label><small class="mut" id="aimt"></small>
  ${TA("arv", "ملاحظة المراجعة (من راجع المحتوى وكيف؛ تلزم قبل النشر)", d.review_note, 2)}
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="ars" ${d.reviewed ? "checked" : ""}> <span>راجعتُ النشاط وأؤكد سلامته وملاءمته للفئة العمرية</span></label>
  ${SEL("ast2", "حالة النشر", ST, d.status)}
  <p id="amiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="asv">حفظ</button><button class="btn g" id="apv">معاينة</button></div><div class="row"><button class="btn g" id="ax">إغلاق</button></div>`);
  $("#ax", s).onclick = closeSheet;
  $$("#alv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  $("#aic", s).oninput = (e) => { const p = $("#aicp", s); p.src = IC(e.target.value.trim()); p.style.display = "block"; p.onerror = () => (p.style.display = "none"); };
  $("#apf", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); $("#apdf", s).value = await up(d.slug, f); toast("تم رفع الملف"); } catch (x) { fail(x); } };
  $("#aimf", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); $("#aimt", s).textContent = "الرابط: " + await up(d.slug, f); toast("تم الرفع"); } catch (x) { fail(x); } };
  const collect = () => {
    d.title = $("#at", s).value.trim(); d.category = $("#ac", s).value; d.sub = $("#asb", s).value.trim(); d.icon = $("#aic", s).value.trim(); d.skill = $("#ask", s).value.trim(); d.summary = $("#asm", s).value.trim(); d.goal = $("#ag", s).value.trim(); d.adult = $("#aad", s).value;
    d.materials = textToPair($("#amt", s).value); d.steps = textToPair($("#ast", s).value); d.outcome = $("#aout", s).value.trim(); d.tips = $("#atp", s).value.trim(); d.template = $("#atpl", s).value.trim() || null;
    d.links = textToLink($("#alk", s).value); d.learn = $("#alr", s).value.trim(); d.pdf_url = $("#apdf", s).value.trim() || null; d.review_note = $("#arv", s).value.trim(); d.reviewed = $("#ars", s).checked; d.status = $("#ast2", s).value;
  };
  $("#apv", s).onclick = () => { collect(); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><img src="${esc(IC(d.icon))}" style="height:80px"><b style="display:block">${esc(d.title)}</b><p>${esc(d.summary)}</p><p><b>المهارة:</b> ${esc(d.skill)}</p><ol>${d.steps.map((x) => `<li>${esc(x[0])}</li>`).join("")}</ol></div><div class="row"><button class="btn g" id="apx">إغلاق المعاينة</button></div></div>`; document.body.appendChild(o); $("#apx", o).onclick = () => o.remove(); };
  $("#asv", s).onclick = async () => {
    collect();
    if (!d.title) { $("#amiss", s).textContent = "اكتب الاسم"; return; }
    if (d.status === "published") { const miss = readiness(d); if (miss.length) { $("#amiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#amiss", s).textContent = ""; $("#asv", s).disabled = true;
    try {
      const row = { slug: d.slug, category: d.category, sub: d.sub, title: d.title, icon: d.icon, levels: d.levels, skill: d.skill, summary: d.summary, goal: d.goal, adult: d.adult, materials: d.materials, steps: d.steps, outcome: d.outcome, tips: d.tips, template: d.template, pdf_url: d.pdf_url, links: d.links, learn: d.learn, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("art_activities").insert(row) : await sb.from("art_activities").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#asv", s).disabled = false; }
  };
}
})();
