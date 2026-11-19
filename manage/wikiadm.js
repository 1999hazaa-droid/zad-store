/* إدارة الموسوعة التعليمية المصغرة — داخل لوحة زاد المحمية */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["animals", "عالم الحيوانات"], ["plants", "عالم النباتات"], ["body", "جسم الإنسان"], ["space", "الفضاء والكواكب"], ["science", "العلوم والاكتشاف"], ["geo", "الجغرافيا والعالم"], ["culture", "الثقافة والمعرفة"], ["values", "القيم والمهارات الحياتية"]];
const LEVELS = [["a2", "سنة–سنتان"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "غير منشور"]];
const CN = Object.fromEntries(CATS), SN = Object.fromEntries(ST);
const IU = (u) => /^https?:/.test(u || "") ? u : "../" + String(u || "");
const IC = (c) => `../images/zad/${c}.webp`;
let ALL = [], FS = "", FC = "", FQ = "";
const readiness = (d) => { const m = []; if (!d.title) m.push("العنوان"); if (!d.category) m.push("التصنيف"); if (!d.icon) m.push("الرسمة"); if (!d.levels.length) m.push("العمر أو الصف"); if (!d.intro) m.push("المقدمة"); if (!d.sections.length) m.push("معلومات الموضوع"); if (!d.facts.length) m.push("هل تعلم"); if (!d.vocab.length) m.push("المفردات"); if (!d.acts.length) m.push("الأنشطة"); if (!(d.review_note || "").trim()) m.push("ملاحظة المراجعة"); return m; };
async function load() { const r = await sb.from("wiki_topics").select("*").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
async function up(slug, file) {
  const ext = (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 5) || "bin";
  const path = `wiki/${slug}/img-${Date.now()}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
  const { error } = await sb.storage.from("library").upload(path, file, { contentType: file.type || undefined, cacheControl: "31536000", upsert: false });
  if (error) throw error; return sb.storage.from("library").getPublicUrl(path).data.publicUrl;
}
/* نصوص التحرير: الأسطر بصيغة بسيطة */
const P = (s) => String(s).split("::").map((x) => x.trim());
const secToText = (a) => a.map((s) => `## ${s.h} :: ${s.ic || ""} :: ${s.t}\n${s.x}`).join("\n\n");
const textToSec = (t) => t.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean).map((b) => { const L = b.split("\n"); const h = P(L[0].replace(/^##\s*/, "")); return { h: h[0], x: L.slice(1).join(" ").trim(), t: +h[2] || 1, ...(h[1] ? { ic: h[1] } : {}) }; });
const factToText = (a) => a.map((f) => `${f.h} :: ${f.x} :: ${f.ic} :: ${f.t}`).join("\n");
const textToFact = (t) => t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const p = P(l); return { h: p[0], x: p[1] || "", ic: p[2] || "2b50", t: +p[3] || 1 }; });
const vocToText = (a) => a.map((v) => `${v.w} :: ${v.m} :: ${v.t}${v.ic ? " :: " + v.ic : ""}`).join("\n");
const textToVoc = (t) => t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const p = P(l); return { w: p[0], m: p[1] || "", t: +p[2] || 1, ...(p[3] ? { ic: p[3] } : {}) }; });
const SIMPLE = ["mc", "tf", "fill"];
const actToText = (a) => a.filter((x) => SIMPLE.includes(x.k)).map((x) => x.k === "tf" ? `tf | ${x.q} | ${x.a ? "صح" : "خطأ"} | ${x.ts.join(",")}` : `${x.k} | ${x.q} | ${x.o.map((o, i) => o + (i === x.a ? "*" : "")).join(" | ")} | ${x.ts.join(",")}`).join("\n");
const textToAct = (t) => t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const p = l.split("|").map((x) => x.trim()); const k = p[0]; const ts = (p[p.length - 1] || "1,2,3").split(",").map(Number).filter(Boolean); if (k === "tf") return { k, q: p[1], a: p[2] === "صح", ts }; const o = p.slice(2, -1); return { k, q: p[1], o: o.map((x) => x.replace(/\*$/, "")), a: Math.max(0, o.findIndex((x) => x.endsWith("*"))), ts }; });
const linkToText = (a) => a.map((l) => l.type === "cards" ? `cards | ${l.cat} | ${l.sub || ""} | ${l.label || ""}` : `${l.type} | ${(l.q || []).join(" ، ")}`).join("\n");
const textToLink = (t) => t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => { const p = l.split("|").map((x) => x.trim()); return p[0] === "cards" ? { type: "cards", cat: p[1], sub: p[2], label: p[3] } : { type: p[0], q: (p[1] || "").split("،").map((x) => x.trim()).filter(Boolean) }; });
SUB.wikiadm = { title: "إدارة الموسوعة المصغرة", fn: async function view(m) {
  await load();
  const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div></div>
  <div class="row"><button class="btn" id="wn">➕ موضوع جديد</button></div>
  <input type="search" id="wqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="wch" style="margin-top:8px"></div><div class="chips" id="wcc" style="margin-top:6px"></div><div id="wls"></div>`;
  const draw = () => {
    $("#wch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#wcc").innerHTML = [["", "كل التصنيفات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.category === FC) && (!q || (x.title + " " + (x.sub || "")).toLowerCase().includes(q)));
    $("#wls").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.category] || x.category)} · ${esc(SN[x.status] || x.status)}${ms.length ? " · ⚠ ناقص: " + esc(ms.join("، ")) : ""}</small></div></div>`; }).join("") : `<div class="spin">لا توجد موضوعات</div>`;
    $$("#wch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#wcc [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#wls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#wqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#wn").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), keywords: (a.keywords || []).slice(), related: (a.related || []).slice() })
    : { slug: "wk-" + Date.now().toString(36), category: "animals", sub: "", title: "", icon: "", levels: [], keywords: [], intro: "", sections: [], facts: [], vocab: [], acts: [], related: [], links: [], sources: "", review_note: "", status: "draft", sort_order: ALL.length + 1 };
  const adv = (d.acts || []).filter((x) => !SIMPLE.includes(x.k));
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v)}"></label>`;
  const TA = (id, l, v, r, h) => `<label class="f"><span>${l}</span>${h ? `<small class="mut">${h}</small>` : ""}<textarea id="${id}" rows="${r}" dir="auto">${esc(v)}</textarea></label>`;
  const s = sheet(`<h2>${isNew ? "موضوع جديد" : "تعديل الموضوع"}</h2>
  ${T("wt", "عنوان الموضوع", d.title)}
  <label class="f"><span>التصنيف</span><select id="wc">${CATS.map(([k, v]) => `<option value="${k}" ${d.category === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  ${T("wsb", "التصنيف الفرعي (مثل: الحيوانات البحرية)", d.sub || "")}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="wlv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("wic", "رمز الرسمة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon)}<img id="wicp" src="${d.icon ? esc(IC(d.icon)) : ""}" alt="" style="height:60px;display:${d.icon ? "block" : "none"}">
  ${T("wk", "كلمات مفتاحية (بفاصلة ،)", d.keywords.join("، "))}
  ${TA("wi", "مقدمة قصيرة", d.intro || "", 2)}
  ${TA("ws", "المعلومات (فقرات): ‎## العنوان :: رمز الرسمة :: المستوى (1 أو 2 أو 3) ثم سطر النص، وافصل الأقسام بسطر فارغ", secToText(d.sections), 10)}
  ${TA("wf", "هل تعلم؟ (سطر لكل معلومة): العنوان :: النص :: رمز الرسمة :: المستوى", factToText(d.facts), 5)}
  ${TA("wv", "المفردات (سطر لكل مفردة): الكلمة :: المعنى :: المستوى :: رمز اختياري", vocToText(d.vocab), 4)}
  ${TA("wa", "الأسئلة: ‎mc | السؤال | خيار | خيار* | المستويات — ‎tf | السؤال | صح أو خطأ | المستويات — ‎fill | جملة فيها ___ | خيار* | ... | المستويات (النجمة = الصحيحة)", actToText(d.acts), 8)}
  ${TA("wad", `أنشطة متقدمة بصيغة JSON (مطابقة match أو تصنيف sort أو الشاذ odd): ${adv.length} نشاط حاليًا`, adv.length ? JSON.stringify(adv) : "", 4)}
  ${TA("wl", "روابط من المكتبة (تظهر فقط إذا وُجد محتوى فعلًا): ‎stories | عنوان ، عنوان — ‎activities | ... — ‎media | ... — ‎cards | cat | sub | عنوان الرابط", linkToText(d.links), 3)}
  ${T("wr", "مواضيع مرتبطة (رموز المواضيع بفاصلة ،)", d.related.join("، "))}
  ${TA("wsr", "المصادر", d.sources || "", 2)}
  ${TA("wrn", "ملاحظة المراجعة (من راجع المحتوى وكيف؛ تلزم قبل النشر)", d.review_note || "", 2)}
  <p style="margin:12px 2px 4px;font-weight:700">صورة توضيحية إضافية (اختياري، ترفع ويُنسخ رابطها)</p><label class="btn g" style="display:block;text-align:center">رفع صورة<input type="file" id="wimf" accept="image/*" hidden></label><small class="mut" id="wimt"></small>
  <label class="f" style="margin-top:12px"><span>حالة النشر</span><select id="wst">${ST.map(([k, v]) => `<option value="${k}" ${d.status === k ? "selected" : ""}>${v}</option>`).join("")}</select></label>
  <p id="wmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="wsv">حفظ</button><button class="btn g" id="wpv">معاينة</button></div><div class="row"><button class="btn g" id="wx">إغلاق</button></div>`);
  $("#wx", s).onclick = closeSheet;
  $$("#wlv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  $("#wic", s).oninput = (e) => { const p = $("#wicp", s); p.src = IC(e.target.value.trim()); p.style.display = "block"; p.onerror = () => (p.style.display = "none"); };
  $("#wimf", s).onchange = async (e) => { const f = e.target.files[0]; if (!f) return; try { toast("جاري الرفع…"); $("#wimt", s).textContent = "رابط الصورة: " + await up(d.slug, f); toast("تم الرفع"); } catch (x) { fail(x); } };
  const list = (id) => $("#" + id, s).value.split(/[،,]/).map((x) => x.trim()).filter(Boolean);
  const collect = () => {
    d.title = $("#wt", s).value.trim(); d.category = $("#wc", s).value; d.sub = $("#wsb", s).value.trim() || null; d.icon = $("#wic", s).value.trim(); d.keywords = list("wk"); d.intro = $("#wi", s).value.trim();
    d.sections = textToSec($("#ws", s).value); d.facts = textToFact($("#wf", s).value); d.vocab = textToVoc($("#wv", s).value);
    let ad = []; const j = $("#wad", s).value.trim(); if (j) { try { ad = JSON.parse(j); } catch { throw new Error("صيغة JSON للأنشطة المتقدمة غير صحيحة"); } }
    d.acts = textToAct($("#wa", s).value).concat(ad); d.links = textToLink($("#wl", s).value); d.related = list("wr"); d.sources = $("#wsr", s).value.trim(); d.review_note = $("#wrn", s).value.trim(); d.status = $("#wst", s).value;
  };
  const check = () => { for (const x of d.acts) { if ((x.k === "mc" || x.k === "fill") && !(x.o && x.o.length >= 2)) return "سؤال بخيارات غير كافية: " + x.q; if (x.k === "fill" && !x.q.includes("___")) return "جملة ‎fill تحتاج ___ : " + x.q; } return ""; };
  $("#wpv", s).onclick = () => { try { collect(); } catch (x) { $("#wmiss", s).textContent = x.message; return; } const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><img src="${esc(IC(d.icon))}" style="height:80px"><b style="display:block">${esc(d.title)}</b><p>${esc(d.intro)}</p><p style="color:#666">${esc(CN[d.category])} · ${esc(d.levels.join("، "))}</p><p>${d.sections.length} فقرة · ${d.facts.length} معلومة · ${d.vocab.length} مفردة · ${d.acts.length} نشاط · ${d.links.length} رابط مكتبة</p></div><div class="row"><button class="btn g" id="vx">إغلاق</button></div></div>`; document.body.appendChild(o); o.onclick = (e) => { if (e.target === o || e.target.id === "vx") o.remove(); }; };
  $("#wsv", s).onclick = async () => {
    try { collect(); } catch (x) { $("#wmiss", s).textContent = x.message; return; }
    if (!d.title) { $("#wmiss", s).textContent = "اكتب العنوان"; return; }
    const er = check(); if (er) { $("#wmiss", s).textContent = er; return; }
    if (d.status === "published") { const miss = readiness(d); if (miss.length) { $("#wmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#wmiss", s).textContent = ""; $("#wsv", s).disabled = true;
    try {
      const row = { slug: d.slug, category: d.category, sub: d.sub, title: d.title, icon: d.icon, levels: d.levels, keywords: d.keywords, intro: d.intro, sections: d.sections, facts: d.facts, vocab: d.vocab, acts: d.acts, related: d.related, links: d.links, sources: d.sources || null, review_note: d.review_note || null, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("wiki_topics").insert(row) : await sb.from("wiki_topics").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#wsv", s).disabled = false; }
  };
}
})();
