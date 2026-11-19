/* إدارة التجارب والمشاريع العلمية — داخل لوحة زاد المحمية. لا نشر قبل مراجعة المحتوى وتعليمات السلامة. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const TOPICS = [["water", "تجارب الماء"], ["colors", "تجارب الألوان"], ["plants", "تجارب النباتات"], ["light", "الضوء والظل"], ["air", "الهواء والطقس"], ["daily", "العلوم اليومية"], ["space", "مشاريع الفضاء"], ["animals", "مشاريع الحيوانات"], ["body", "مشاريع جسم الإنسان"], ["env", "مشاريع البيئة"], ["math", "مشاريع المجسمات"], ["sense", "استكشاف حسي"]];
const KINDS = [["experiment", "تجربة"], ["project", "مشروع"], ["sensory", "استكشاف حسي (سنة–سنتان)"]];
const ADULTS = [["none", "متابعة بسيطة"], ["near", "بحضور كبير بجانب الطفل"], ["required", "إشراف مباشر من كبير"]];
const LEVELS = [["a2", "سنة–سنتان"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "غير منشور"]];
const BAN = ["نار", "لهب", "شمع", "حرق", "ساخن", "سخّن", "سخن", "تسخين", "يغلي", "سكين", "مقص", "إبرة", "دبوس", "حمض", "صودا", "بيكربونات", "كلور", "منظف", "تذوق", "تذوّق", "اشرب", "استنشق", "كهرباء", "بطارية", "ولاعة", "موقد", "فرن", "ميكروويف", "دواء", "مبيد"];
const TN = Object.fromEntries(TOPICS), SN = Object.fromEntries(ST), KN = Object.fromEntries(KINDS);
const IC = (c) => `../images/zad/${c}.webp`;
const P = (s) => String(s).split("::").map((x) => x.trim());
const lines = (t) => String(t).split("\n").map((l) => l.trim()).filter(Boolean);
const pairToText = (a) => a.map((m) => `${m[0]} :: ${m[1] || ""}`).join("\n");
const textToPair = (t) => lines(t).map((l) => { const p = P(l); return [p[0], p[1] || ""]; });
const SIMPLE = ["mc", "tf", "fill"];
const actToText = (a) => a.filter((x) => SIMPLE.includes(x.k)).map((x) => x.k === "tf" ? `tf | ${x.q} | ${x.a ? "صح" : "خطأ"} | ${x.ts.join(",")}` : `${x.k} | ${x.q} | ${x.o.map((o, i) => o + (i === x.a ? "*" : "")).join(" | ")} | ${x.ts.join(",")}`).join("\n");
const textToAct = (t) => lines(t).map((l) => { const p = l.split("|").map((x) => x.trim()); const k = p[0]; const ts = (p[p.length - 1] || "1,2,3").split(",").map(Number).filter(Boolean); if (k === "tf") return { k, q: p[1], a: p[2] === "صح", ts }; const o = p.slice(2, -1); const a = o.findIndex((x) => x.endsWith("*")); return { k, q: p[1], o: o.map((x) => x.replace(/\*$/, "")), a: Math.max(0, a), ts }; });
const linkToText = (a) => a.map((l) => l.type === "cards" ? `cards | ${l.cat} | ${l.sub || ""} | ${l.label || ""}` : `${l.type} | ${(l.q || []).join(" ، ")}`).join("\n");
const textToLink = (t) => lines(t).map((l) => { const p = l.split("|").map((x) => x.trim()); return p[0] === "cards" ? { type: "cards", cat: p[1], sub: p[2], label: p[3] } : { type: p[0], q: (p[1] || "").split("،").map((x) => x.trim()).filter(Boolean) }; });
let ALL = [], FS = "", FK = "", FQ = "";
async function load() { const r = await sb.from("experiments").select("*").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `experiments/${slug}/f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
const banHits = (d) => { const t = [d.expect, d.happened, d.why, ...(d.learn || []), ...(d.learned || []), ...(d.materials || []).map((m) => m[0]), ...(d.steps || []).map((m) => m[0])].join(" ● "); return BAN.filter((b) => t.includes(b)); };
const readiness = (d) => { const m = []; if (!d.title) m.push("العنوان"); if (!d.icon) m.push("الرسمة"); if (!d.levels.length) m.push("العمر أو الصف"); if (d.levels.some((l) => l === "a2") && d.kind !== "sensory") m.push("عمر سنة–سنتان للاستكشاف الحسي فقط"); if (d.kind === "sensory" && d.levels.some((l) => l !== "a2")) m.push("الاستكشاف الحسي لعمر سنة–سنتين فقط"); if (!d.goal) m.push("الهدف"); if (!d.materials.length) m.push("الأدوات"); if (!d.safety.length) m.push("تعليمات السلامة"); if (d.kind !== "sensory" && d.steps.length < 3) m.push("ثلاث خطوات على الأقل"); if (d.kind === "sensory" && !d.steps.length) m.push("الخطوات"); if (!d.expect || !d.happened || !d.why) m.push("ماذا نتوقع/حدث/لماذا"); if (!d.learned.length) m.push("ماذا تعلمنا"); if (d.kind !== "sensory" && !d.acts.length) m.push("الأسئلة"); if (!d.sheet_url) m.push("ورقة الملاحظات PDF"); if (!d.safety_reviewed) m.push("تأكيد مراجعة السلامة"); if (!(d.review_note || "").trim()) m.push("ملاحظة المراجعة"); const b = banHits(d); if (b.length) m.push("كلمات ممنوعة في الخطوات أو الأدوات: " + b.join("، ")); return m; };
SUB.expadm = { title: "إدارة التجارب والمشاريع", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="en">➕ تجربة جديدة</button><button class="btn g" id="enp">➕ مشروع جديد</button></div>
  <input type="search" id="eqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="ech" style="margin-top:8px"></div><div class="chips" id="ekc" style="margin-top:6px"></div><div id="els"></div>`;
  const draw = () => {
    $("#ech").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#ekc").innerHTML = [["", "كل الأنواع"], ...KINDS].map(([k, l]) => `<button class="chip ${FK === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FK || x.kind === FK) && (!q || x.title.toLowerCase().includes(q)));
    $("#els").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(KN[x.kind])} · ${esc(TN[x.topic] || x.topic)} · ${esc(SN[x.status])}${ms.length && x.status !== "published" ? " · ناقص: " + esc(ms.length) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا توجد نتائج.</p>`;
    $$("#ech [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#ekc [data-c]").forEach((b) => b.onclick = () => { FK = b.dataset.c; draw(); });
    $$("#els [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#eqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#en").onclick = () => edit(null, () => view(m), "experiment"); $("#enp").onclick = () => edit(null, () => view(m), "project");
} };
function edit(a, reload, kind0) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), learn: (a.learn || []).slice(), learned: (a.learned || []).slice(), safety: (a.safety || []).slice(), materials: a.materials || [], steps: a.steps || [], acts: a.acts || [], links: a.links || [] })
    : { slug: "ex-" + Date.now().toString(36), kind: kind0 || "experiment", topic: kind0 === "project" ? "env" : "water", title: "", icon: "", levels: [], goal: "", difficulty: 1, minutes: 15, adult: "near", learn: [], materials: [], safety: [], steps: [], expect: "", happened: "", why: "", learned: [], acts: [], sheet_url: "", wiki_slug: "", links: [], adapt: "", review_note: "", safety_reviewed: false, status: "draft", sort_order: 999 };
  const adv = (d.acts || []).filter((x) => !SIMPLE.includes(x.k));
  const T = (id, l, v, t) => `<label class="f"><span>${l}</span><input type="${t || "text"}" id="${id}" value="${esc(v)}"></label>`;
  const TA = (id, l, v, r) => `<label class="f"><span>${l}</span><textarea id="${id}" rows="${r}" dir="auto">${esc(v)}</textarea></label>`;
  const SEL = (id, l, o, v) => `<label class="f"><span>${l}</span><select id="${id}">${o.map(([k, x]) => `<option value="${k}" ${String(v) === String(k) ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
  const s = sheet(`<h2>${isNew ? "نشاط جديد" : "تعديل النشاط"}</h2>
  <p class="mut">قواعد السلامة: لا لهب ولا حرارة ولا أدوات حادة ولا مواد كيميائية ولا تذوق ولا استنشاق. ولا يُنشر النشاط قبل تأكيد مراجعة تعليمات السلامة.</p>
  ${T("et", "اسم التجربة أو المشروع", d.title)}
  ${SEL("ek", "النوع", KINDS, d.kind)}${SEL("etp", "الموضوع العلمي", TOPICS, d.topic)}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف (عمر سنة–سنتين للاستكشاف الحسي فقط)</p><div class="chips" id="elv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("eic", "رمز الرسمة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon)}<img id="eicp" src="${d.icon ? esc(IC(d.icon)) : ""}" alt="" style="height:60px;display:${d.icon ? "block" : "none"}">
  ${TA("eg", "الهدف التعليمي", d.goal, 2)}
  ${SEL("ed", "مستوى الصعوبة", [[1, "سهلة"], [2, "متوسطة"], [3, "تحتاج تركيزًا"]], d.difficulty)}${T("em", "الوقت التقريبي بالدقائق", d.minutes, "number")}${SEL("ead", "إشراف الكبار", ADULTS, d.adult)}
  ${TA("esf", "تعليمات السلامة (سطر لكل تعليمة، وهي تظهر أولًا في الصفحة)", d.safety.join("\n"), 5)}
  ${TA("el", "ماذا سنتعلم؟ (سطر لكل نقطة)", d.learn.join("\n"), 3)}
  ${TA("emt", "الأدوات: اسم الأداة :: رمز الرسمة (سطر لكل أداة)", pairToText(d.materials), 5)}
  ${TA("est", "الخطوات بالترتيب: نص الخطوة :: رمز الرسمة (سطر لكل خطوة)", pairToText(d.steps), 6)}
  ${TA("eex", "ماذا نتوقع أن نلاحظ؟", d.expect, 2)}${TA("eha", "ماذا حدث؟ (النتيجة العلمية الصحيحة)", d.happened, 2)}${TA("ewh", "لماذا حدث ذلك؟", d.why, 3)}
  ${TA("eld", "ماذا تعلمنا؟ (سطر لكل نقطة)", d.learned.join("\n"), 3)}
  ${TA("ea", "الأسئلة: ‎mc | السؤال | خيار | خيار* | المستويات — ‎tf | السؤال | صح أو خطأ | المستويات — ‎fill | جملة فيها ___ | خيار* | ... | المستويات (النجمة = الصحيح، المستويات 1 أو 2 أو 3). ترتيب الخطوات يُنشأ تلقائيًا من الخطوات.", actToText(d.acts), 6)}
  ${TA("ead2", `أنشطة متقدمة بصيغة JSON (مطابقة match أو تصنيف sort أو الشاذ odd): ${adv.length} نشاط حاليًا`, adv.length ? JSON.stringify(adv) : "", 3)}
  ${T("ew", "رمز موضوع الموسوعة المرتبط (مثل wk-water)", d.wiki_slug || "")}
  ${TA("elk", "روابط من المكتبة: ‎stories | عنوان ، عنوان — ‎activities | ... — ‎media | ... — ‎cards | cat | sub | عنوان", linkToText(d.links), 2)}
  ${TA("eadp", "ملاحظة التكييف حسب العمر (اختياري)", d.adapt || "", 2)}
  <p style="margin:12px 2px 4px;font-weight:700">ورقة الملاحظات (PDF قابلة للتحميل والطباعة)</p>${T("esh", "رابط الورقة", d.sheet_url || "")}<label class="btn g" style="display:block;text-align:center">رفع ملف PDF<input type="file" id="esf" accept="application/pdf" hidden></label>
  <p style="margin:12px 2px 4px;font-weight:700">رفع صورة أو ملف إضافي (يُنسخ رابطه)</p><label class="btn g" style="display:block;text-align:center">رفع<input type="file" id="eimf" hidden></label><small class="mut" id="eimt"></small>
  ${TA("erv", "ملاحظة المراجعة (من راجع المحتوى والسلامة وكيف؛ تلزم قبل النشر)", d.review_note || "", 2)}
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="esr" ${d.safety_reviewed ? "checked" : ""}> <span>راجعتُ المحتوى وتعليمات السلامة وأؤكد ملاءمته للفئة العمرية</span></label>
  ${SEL("est2", "حالة النشر", ST, d.status)}
  <p id="emiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="esv">حفظ</button><button class="btn g" id="epv">معاينة</button></div><div class="row"><button class="btn g" id="ex">إغلاق</button></div>`);
  $("#ex", s).onclick = closeSheet;
  $$("#elv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  $("#eic", s).oninput = (e) => { const p = $("#eicp", s); p.src = IC(e.target.value.trim()); p.style.display = "block"; p.onerror = () => (p.style.display = "none"); };
  $("#esf", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); $("#esh", s).value = await up(d.slug, f); toast("تم رفع الورقة"); } catch (x) { fail(x); } };
  $("#eimf", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); $("#eimt", s).textContent = "الرابط: " + await up(d.slug, f); toast("تم الرفع"); } catch (x) { fail(x); } };
  const collect = () => {
    d.title = $("#et", s).value.trim(); d.kind = $("#ek", s).value; d.topic = $("#etp", s).value; d.icon = $("#eic", s).value.trim(); d.goal = $("#eg", s).value.trim();
    d.difficulty = +$("#ed", s).value; d.minutes = Math.max(1, +$("#em", s).value || 15); d.adult = $("#ead", s).value; d.safety = lines($("#esf", s).value); d.learn = lines($("#el", s).value);
    d.materials = textToPair($("#emt", s).value); d.steps = textToPair($("#est", s).value); d.expect = $("#eex", s).value.trim(); d.happened = $("#eha", s).value.trim(); d.why = $("#ewh", s).value.trim(); d.learned = lines($("#eld", s).value);
    let ad = []; const j = $("#ead2", s).value.trim(); if (j) { try { ad = JSON.parse(j); } catch { throw new Error("صيغة JSON للأنشطة المتقدمة غير صحيحة"); } }
    d.acts = textToAct($("#ea", s).value).concat(ad); d.wiki_slug = $("#ew", s).value.trim() || null; d.links = textToLink($("#elk", s).value); d.adapt = $("#eadp", s).value.trim();
    d.sheet_url = $("#esh", s).value.trim() || null; d.review_note = $("#erv", s).value.trim(); d.safety_reviewed = $("#esr", s).checked; d.status = $("#est2", s).value;
  };
  $("#epv", s).onclick = () => { try { collect(); } catch (x) { $("#emiss", s).textContent = x.message; return; } const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><img src="${esc(IC(d.icon))}" style="height:80px"><b style="display:block">${esc(d.title)}</b><p>${esc(d.goal)}</p><p style="background:#fff4d6;padding:6px;border-radius:10px"><b>السلامة:</b> ${esc(d.safety.join(" • ")) || "—"}</p><p style="color:#666">${esc(KN[d.kind])} · ${esc(TN[d.topic])} · ${esc(d.levels.join("، "))}</p><p>${d.materials.length} أداة · ${d.steps.length} خطوة · ${d.acts.length} سؤال · ورقة: ${d.sheet_url ? "نعم" : "لا"}</p></div><div class="row"><button class="btn g" id="vx">إغلاق</button></div></div>`; document.body.appendChild(o); o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); }; };
  $("#esv", s).onclick = async () => {
    try { collect(); } catch (x) { $("#emiss", s).textContent = x.message; return; }
    if (!d.title) { $("#emiss", s).textContent = "اكتب الاسم"; return; }
    if (d.status === "published") { const miss = readiness(d); if (miss.length) { $("#emiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#emiss", s).textContent = ""; $("#esv", s).disabled = true;
    try {
      const row = { slug: d.slug, kind: d.kind, topic: d.topic, title: d.title, icon: d.icon, levels: d.levels, goal: d.goal, difficulty: d.difficulty, minutes: d.minutes, adult: d.adult, learn: d.learn, materials: d.materials, safety: d.safety, steps: d.steps, expect: d.expect, happened: d.happened, why: d.why, learned: d.learned, acts: d.acts, sheet_url: d.sheet_url, wiki_slug: d.wiki_slug, links: d.links, adapt: d.adapt || null, review_note: d.review_note || null, safety_reviewed: d.safety_reviewed, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("experiments").insert(row) : await sb.from("experiments").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#esv", s).disabled = false; }
  };
}
})();
