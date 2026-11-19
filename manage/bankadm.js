/* إدارة بنك الأنشطة: إضافة/تعديل/حذف/نشر/إخفاء، بيانات النشاط بصيغة JSON مع فحص، معاينة، ربط بقسم، فحص الصور والملفات، اكتشاف المشكلات — داخل لوحة زاد المحمية. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["arabic", "اللغة العربية"], ["math", "الرياضيات"], ["english", "اللغة الإنجليزية"], ["science", "العلوم والاكتشاف"], ["focus", "الإدراك والتركيز"], ["motor", "المهارات الحركية"], ["values", "القيم والسلوك"], ["art", "الإبداع والفنون"]];
const TYPES = [["mcq", "اختيار من متعدد"], ["match", "توصيل"], ["order", "ترتيب"], ["sort", "تصنيف"], ["memory", "ذاكرة"], ["color", "تلوين"], ["sheet", "ورقة قابلة للطباعة (PDF)"], ["link", "رابط لنشاط في قسم آخر"]];
const DIFF = [["easy", "سهل"], ["mid", "متوسط"], ["adv", "متقدم"]];
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const LINKS = [["", "بدون ربط"], ["language/", "اللغة والبطاقات"], ["tests/", "التمارين والاختبارات"], ["wiki/", "الموسوعة"], ["explore/", "الثقافة والاستكشاف"], ["values/", "القيم والقصص"], ["life/", "المهارات الحياتية"], ["ready/", "الاستعداد المدرسي"], ["arts/", "الإبداع والفنون"], ["songs/", "الأناشيد"], ["videos/", "الفيديوهات"], ["summaries/", "الملخصات والمراجعات"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "مخفي"]];
const CN = Object.fromEntries(CATS), SN = Object.fromEntries(ST), TN = Object.fromEntries(TYPES), DN = Object.fromEntries(DIFF);
const IC = (c) => (/^\d|^[0-9a-f]{4,6}(-[0-9a-f]{4,6})*$/.test(c) && !/^(u_|i_|rd_|dg_)/.test(c) ? `../images/zad/${c}.webp` : String(c).startsWith("dg_") ? `../images/dig/${c}.svg` : String(c).startsWith("rd_") ? `../images/ready/${c}.svg` : `../images/zad/${c}.webp`);
const AR = /^[ء-ي٠-٩\s.،؟!:\-0-9ـ]+$/, MA = /^[ء-ي٠-٩\s.،؟!:\-0-9ـ+−×÷=]+$/, EN = /^[ء-يA-Za-z0-9\s.,،؟?!:'\-_]+$/;
const BADW = /غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت/;
const COLORS = ["red", "blue", "green", "yellow", "orange", "purple", "brown", "pink"];
let ALL = [], FS = "", FC = "", FQ = "";
const okT = (cat) => (t) => { t = String(t == null ? "" : t).trim(); return t && !BADW.test(t) && (cat === "english" ? EN : cat === "math" ? MA : AR).test(t); };
function checkData(d) {
  const m = [], ok = okT(d.cat), x = d.data || {};
  const opts = (o, n, tag) => { if (!Array.isArray(o) || o.length < 2 || o.length > n || new Set(o).size !== o.length || !o.every(ok)) m.push(tag + ": خيارات مختلفة من 2 إلى " + n); };
  if (d.type === "mcq") { const qs = x.qs; if (!Array.isArray(qs) || qs.length < 3) m.push("ثلاثة أسئلة على الأقل"); else qs.forEach((q, i) => { if (!ok(q.q)) m.push("نص السؤال " + (i + 1)); opts(q.o, d.levels.includes("a2") ? 3 : 4, "سؤال " + (i + 1)); if (!ok(q.why)) m.push("تفسير السؤال " + (i + 1)); if (q.img && !/^[\w-]+$/.test(q.img)) m.push("صورة السؤال " + (i + 1)); }); }
  else if (d.type === "match" || d.type === "memory") { const p = x.pairs; if (!Array.isArray(p) || p.length < 3 || p.length > (d.levels.includes("a2") ? 3 : 6)) m.push("أزواج من 3 إلى " + (d.levels.includes("a2") ? 3 : 6)); else { p.forEach((a, i) => { if (!ok(a[0])) m.push("الزوج " + (i + 1) + " النص"); }); if (new Set(p.map((a) => a[0])).size !== p.length) m.push("أزواج مكررة"); } }
  else if (d.type === "order") { const it = x.items; if (!Array.isArray(it) || it.length < 3 || it.length > 6 || !it.every((a) => ok(a.t))) m.push("ترتيب: من 3 إلى 6 عناصر (بالترتيب الصحيح)"); }
  else if (d.type === "sort") { const g = x.groups; if (!Array.isArray(g) || g.length !== 2 || !g.every((a) => ok(a.n) && Array.isArray(a.items) && a.items.length >= 2 && a.items.every((b) => ok(b.t)))) m.push("تصنيف: مجموعتان في كل منهما عنصران فأكثر"); }
  else if (d.type === "color") { const t = x.tasks; if (!x.pic || !Array.isArray(t) || t.length < 2 || !t.every((a) => a.p && COLORS.includes(a.c) && ok(a.n))) m.push("تلوين: صورة ومهمتان على الأقل بألوان صحيحة"); }
  return m;
}
function check(d) {
  const m = [], ok = okT(d.cat);
  if (!d.title) m.push("العنوان"); else if (!ok(d.title)) m.push("حروف العنوان");
  if (!(d.levels || []).length) m.push("العمر أو الصف");
  if (!d.subject) m.push("المادة"); if (!d.skill || !ok(d.skill)) m.push("المهارة"); if (!d.descr || !ok(d.descr)) m.push("الوصف"); if (!d.instr || !ok(d.instr)) m.push("التعليمات");
  if (!d.icon) m.push("الصورة الكرتونية");
  if (d.type === "sheet") { if (!/\.pdf$/i.test(d.pdf_url || "")) m.push("مسار ملف PDF"); if (!d.preview_url) m.push("صورة المعاينة"); }
  else if (d.type === "link") { if (!d.href) m.push("رابط القسم"); }
  else m.push(...checkData(d));
  if (!d.reviewed) m.push("تأكيد المراجعة"); if (!d.review_note) m.push("ملاحظة المراجعة");
  return m;
}
const abs = (p) => (/^https?:/.test(p) ? p : "../" + p);
const head = (u) => fetch(u, { method: "HEAD", cache: "no-store" }).then((r) => r.ok).catch(() => false);
const imgOk = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; });
async function load() { const r = await sb.from("bank_items").select("*").order("cat").order("sort_order").limit(2000); if (r.error) throw r.error; ALL = r.data || []; }
SUB.bankadm = { title: "إدارة بنك الأنشطة", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length, bad = ALL.filter((x) => x.status === "published" && check(x).length).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div><div class="stat"><b>${n("draft") + n("unpublished")}</b><span>مسودة أو مخفي</span></div><div class="stat"><b>${bad}</b><span>منشور وفيه مشكلة</span></div></div>
  <p class="mut">التصنيفات الثمانية ثابتة في القسم، والمهارات نص حر. الصور تُختار من الرسوم الكرتونية الموجودة في المنصة، وملفات PDF والمعاينات تُكتب مساراتها بعد وضعها في المستودع (لا رفع مباشر من هنا بعد). لا يُنشر نشاط ناقص، وغير المنشور لا يراه الزوار.</p>
  <div class="row"><button class="btn" id="fn">➕ نشاط جديد</button><button class="btn g" id="fh">🔎 اكتشاف المشكلات</button></div>
  <div id="fhr"></div>
  <input type="search" id="fqs" placeholder="بحث بالعنوان أو المهارة" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="fch" style="margin-top:8px"></div><div class="chips" id="fcc" style="margin-top:6px"></div><div id="fls"></div>`;
  const draw = () => {
    $("#fch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#fcc").innerHTML = [["", "كل الفئات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.cat === FC) && (!q || (x.title + " " + x.skill).toLowerCase().includes(q)));
    $("#fls").innerHTML = list.length ? list.map((x) => { const ms = check(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "u_abc"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.cat])} · ${esc(TN[x.type])} · ${esc(DN[x.difficulty])} · ${esc(SN[x.status])}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا نتائج.</p>`;
    $$("#fch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#fcc [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#fls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => String(x.id) === b.dataset.i), () => view(m)));
  };
  draw(); $("#fqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#fn").onclick = () => edit(null, () => view(m));
  $("#fh").onclick = async () => { const o = $("#fhr"); o.innerHTML = `<p class="mut">جاري الفحص…</p>`; const out = [];
    for (const x of ALL) { const e = check(x); if (e.length && x.status === "published") out.push(`${x.title}: ناقص ${e.join("، ")}`);
      if (!(await imgOk(IC(x.icon || "")))) out.push(`${x.title}: الصورة الكرتونية غير موجودة`);
      if (x.type === "sheet") { if (!(await head(abs(x.pdf_url || "")))) out.push(`${x.title}: ملف PDF لا يُفتح`); if (!(await head(abs(x.preview_url || "")))) out.push(`${x.title}: المعاينة لا تُفتح`); }
      if (x.type === "link" && !(await head(abs(x.href || "")))) out.push(`${x.title}: الرابط لا يُفتح`);
      if (x.link && x.link.href && !(await head(abs(x.link.href)))) out.push(`${x.title}: رابط القسم المرتبط لا يُفتح`); }
    o.innerHTML = out.length ? `<div class="card"><b style="color:var(--no)">مشكلات (${out.length})</b><ul>${out.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : `<div class="card"><b style="color:var(--ok)">لا مشكلات: كل الأنشطة المنشورة مكتملة وصورها وملفاتها وروابطها تعمل.</b></div>`; };
} };
const SKEL = { mcq: { qs: [{ q: "", o: ["الصحيح", "خيار", "خيار"], why: "" }] }, match: { pairs: [["", "", null]] }, order: { items: [{ t: "", i: null }] }, sort: { groups: [{ n: "", i: null, items: [{ t: "" }, { t: "" }] }, { n: "", i: null, items: [{ t: "" }, { t: "" }] }] }, memory: { pairs: [["", "u_abc"]] }, color: { pic: "house", tasks: [{ p: "wall", c: "red", n: "" }] }, sheet: {}, link: {} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), link: Object.assign({ href: "", label: "" }, a.link), data: a.data || {} }) : { slug: "bk-" + Date.now().toString(36), cat: "arabic", type: "mcq", title: "", icon: "u_abc", levels: [], subject: "", skill: "", difficulty: "easy", descr: "", instr: "", data: SKEL.mcq, href: null, pdf_url: null, preview_url: null, link: { href: "", label: "" }, review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}"></label>`;
  const O = (arr, v) => arr.map(([k, x]) => `<option value="${k}" ${v === k ? "selected" : ""}>${x}</option>`).join("");
  const skills = [...new Set(ALL.map((x) => x.skill))];
  const s = sheet(`<h2>${isNew ? "نشاط جديد" : "تعديل النشاط"}</h2>
  ${T("ft", "اسم النشاط", d.title)}<label class="f"><span>الفئة</span><select id="fc">${O(CATS, d.cat)}</select></label>
  <label class="f"><span>نوع النشاط</span><select id="fy">${O(TYPES, d.type)}</select></label>
  <label class="f"><span>مستوى الصعوبة</span><select id="fdf">${O(DIFF, d.difficulty)}</select></label>
  ${T("fsb", "المادة", d.subject)}<label class="f"><span>المهارة المستهدفة (اكتب مهارة جديدة أو اختر)</span><input type="text" id="fsk" list="fsl" value="${esc(d.skill)}"><datalist id="fsl">${skills.map((k) => `<option value="${esc(k)}">`).join("")}</datalist></label>
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="flv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("fic", "الصورة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon)}
  <label class="f"><span>وصف قصير</span><textarea id="fde" rows="2" dir="auto">${esc(d.descr || "")}</textarea></label>
  <label class="f"><span>تعليمات للطفل (جملة قصيرة)</span><textarea id="fin" rows="2" dir="auto">${esc(d.instr || "")}</textarea></label>
  <label class="f" id="fdw"><span>الأسئلة والإجابات (JSON؛ الإجابة الصحيحة أولا وتُخلط تلقائيا)</span><textarea id="fdt" rows="10" dir="ltr" style="font-family:monospace;font-size:13px">${esc(JSON.stringify(d.data, null, 1))}</textarea></label>
  ${T("fpd", "مسار ملف PDF (للورقة) مثل files/bank/اسم.pdf", d.pdf_url)}${T("fpv2", "مسار صورة المعاينة (للورقة)", d.preview_url)}${T("fhr", "مسار القسم (للرابط) مثل language/practice/", d.href)}
  <label class="f"><span>ربط اختياري بدرس أو قسم في المكتبة</span><select id="flk">${LINKS.map(([k, x]) => `<option value="${k}" ${d.link.href === k ? "selected" : ""}>${x}</option>`).join("")}${d.link.href && !LINKS.some((x) => x[0] === d.link.href) ? `<option value="${esc(d.link.href)}" selected>${esc(d.link.href)}</option>` : ""}</select></label>${T("fll", "نص زر الانتقال", d.link.label)}
  <label class="f"><span>ملاحظة المراجعة (تلزم قبل النشر)</span><textarea id="frv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="frc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ المحتوى وأؤكد صحته وملاءمته للعمر</span></label>
  <label class="f"><span>حالة النشر</span><select id="fst">${O(ST, d.status)}</select></label>
  ${T("fso2", "ترتيب الظهور (رقم أصغر أولا)", d.sort_order)}
  <p id="fmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p><p id="fchk" class="mut"></p>
  <div class="row"><button class="btn" id="fsv">حفظ</button><button class="btn g" id="fpv">معاينة</button><button class="btn g" id="fpl">فحص الملفات</button></div>
  <div class="row"><button class="btn g" id="fx">إغلاق</button>${isNew ? "" : `<button class="btn g" id="fdel" style="color:var(--no)">🗑 حذف</button>`}</div>`);
  $("#fx", s).onclick = closeSheet;
  $$("#flv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  $("#fy", s).onchange = () => { const t = $("#fy", s).value; try { const cur = JSON.parse($("#fdt", s).value || "{}"); if (!Object.keys(cur).length || !d.__touched) $("#fdt", s).value = JSON.stringify(SKEL[t], null, 1); } catch (e) { $("#fdt", s).value = JSON.stringify(SKEL[t], null, 1); } };
  $("#fdt", s).oninput = () => { d.__touched = true; };
  const collect = () => { d.title = $("#ft", s).value.trim(); d.cat = $("#fc", s).value; d.type = $("#fy", s).value; d.difficulty = $("#fdf", s).value; d.subject = $("#fsb", s).value.trim(); d.skill = $("#fsk", s).value.trim(); d.icon = $("#fic", s).value.trim() || null; d.descr = $("#fde", s).value.trim(); d.instr = $("#fin", s).value.trim();
    try { d.data = d.type === "sheet" || d.type === "link" ? {} : JSON.parse($("#fdt", s).value); d.__jerr = false; } catch (e) { d.__jerr = true; }
    d.pdf_url = d.type === "sheet" ? $("#fpd", s).value.trim() || null : null; d.preview_url = d.type === "sheet" ? $("#fpv2", s).value.trim() || null : null; d.href = d.type === "link" ? $("#fhr", s).value.trim() || null : null;
    const h = $("#flk", s).value; d.link = h ? { href: h, label: $("#fll", s).value.trim() || (LINKS.find((x) => x[0] === h) || [0, h])[1] } : {};
    d.review_note = $("#frv", s).value.trim(); d.reviewed = $("#frc", s).checked; d.status = $("#fst", s).value; d.sort_order = parseInt($("#fso2", s).value, 10) || 0; };
  $("#fpl", s).onclick = async () => { collect(); const o = $("#fchk", s); o.textContent = "جاري الفحص…"; const bad = [];
    if (!(await imgOk(IC(d.icon || "")))) bad.push("الصورة الكرتونية");
    if (d.type === "sheet") { if (!(await head(abs(d.pdf_url || "")))) bad.push("ملف PDF"); if (!(await head(abs(d.preview_url || "")))) bad.push("المعاينة"); }
    if (d.type === "link" && !(await head(abs(d.href || "")))) bad.push("رابط القسم");
    if (d.link.href && !(await head(abs(d.link.href)))) bad.push("الرابط المرتبط");
    o.textContent = bad.length ? "لا يعمل: " + bad.join("، ") : "كل الملفات والروابط تعمل."; };
  $("#fpv", s).onclick = () => { collect(); const er = d.__jerr ? ["صيغة JSON غير صحيحة"] : check(d); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99;
    o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><img src="${esc(IC(d.icon || ""))}" alt="" width="56" height="56"><b> ${esc(d.title)}</b><p>${esc(CN[d.cat])} · ${esc(TN[d.type])} · ${esc(DN[d.difficulty])} · ${esc(d.skill)}</p><p>${esc(d.descr)}</p><p><i>${esc(d.instr)}</i></p>${d.type === "mcq" ? (d.data.qs || []).map((q) => `<p><b>${esc(q.q)}</b></p><ul>${(q.o || []).map((x, i) => `<li>${esc(x)}${i === 0 ? " ✔" : ""}</li>`).join("")}</ul>`).join("") : `<p class="mut">للتجربة الكاملة احفظه كمسودة ثم افتحه من صفحة بنك الأنشطة بعد النشر.</p>`}</div>${er.length ? `<p style="color:var(--no)">ناقص: ${esc(er.join("، "))}</p>` : `<p style="color:var(--ok)">جاهز للنشر</p>`}<button class="btn g" id="pvx">إغلاق المعاينة</button></div>`; document.body.appendChild(o); $("#pvx", o).onclick = () => o.remove(); };
  $("#fsv", s).onclick = async () => {
    collect(); if (!d.title) { $("#fmiss", s).textContent = "اكتب اسم النشاط"; return; }
    if (d.__jerr) { $("#fmiss", s).textContent = "صيغة JSON غير صحيحة"; return; }
    if (d.status === "published") { const miss = check(d); if (miss.length) { $("#fmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#fmiss", s).textContent = ""; $("#fsv", s).disabled = true;
    try { const row = { slug: d.slug, cat: d.cat, type: d.type, title: d.title, icon: d.icon, levels: d.levels, subject: d.subject, skill: d.skill, difficulty: d.difficulty, descr: d.descr, instr: d.instr, data: d.data, href: d.href, pdf_url: d.pdf_url, preview_url: d.preview_url, link: d.link, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("bank_items").insert(row) : await sb.from("bank_items").update(row).eq("id", d.id); if (r.error) throw r.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { $("#fsv", s).disabled = false; fail(e); }
  };
  const del = $("#fdel", s); if (del) del.onclick = async () => { if (!confirm("حذف هذا النشاط نهائيا؟ لا يمكن التراجع. (للإخفاء فقط اختر حالة «مخفي»)")) return; try { const r = await sb.from("bank_items").delete().eq("id", d.id); if (r.error) throw r.error; toast("تم الحذف"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
})();
