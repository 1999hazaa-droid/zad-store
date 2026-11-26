/* إدارة المشاريع والتحديات: مشروع بخطوات مصورة أو تحدٍّ تفاعلي، عمر وصف ومادة ومهارة وأدوات وسلامة، معاينة وفحص، مسودة/نشر/إخفاء/حذف، اكتشاف المشكلات — داخل لوحة زاد المحمية. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const PC = [["science", "العلوم والاستكشاف"], ["math", "الرياضيات"], ["arabic", "اللغة العربية والقراءة والكتابة"], ["english", "اللغة الإنجليزية"], ["art", "الفنون والإبداع"], ["nature", "البيئة والنظافة"], ["life", "المهارات الحياتية"], ["multi", "متعدد المجالات"]];
const CC = [["observe", "الملاحظة والاكتشاف"], ["think", "الألغاز والتفكير"], ["words", "اللغة والكلمات"], ["numbers", "الأرقام والأنماط"], ["create", "الإبداع الفني"]];
const CATS = [...PC, ...CC];
const CTYPES = [["mcq", "اختيار من متعدد"], ["match", "توصيل"], ["order", "ترتيب"], ["sort", "تصنيف"], ["memory", "ذاكرة"], ["color", "تلوين"], ["diff", "اكتشاف الاختلاف"]];
const DIFF = [["easy", "سهل"], ["mid", "متوسط"], ["adv", "متقدم"]];
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const LINKS = [["", "بدون ربط"], ["experiments/", "التجارب والمشاريع العلمية"], ["language/", "اللغة والبطاقات"], ["tests/", "التمارين والاختبارات"], ["wiki/", "الموسوعة"], ["explore/", "الثقافة والاستكشاف"], ["values/", "القيم والقصص"], ["life/", "المهارات الحياتية"], ["ready/", "الاستعداد المدرسي"], ["arts/", "الإبداع والفنون"], ["stories/", "القصص التعليمية"], ["bank/", "بنك الأنشطة"], ["summaries/", "الملخصات والمراجعات"]];
const SPANS = [["short", "قصير (جلسة واحدة)"], ["weekly", "أسبوعي (عدة أيام)"], ["monthly", "شهري (مراحل)"]], SPN = Object.fromEntries(SPANS);
const CHOKE = /خرز|حبوب|حبة |حبات|أزرار|عملات|دبابيس|مشابك|بالون|بذور|حصى|عدس|فشار|مكسرات|قطع صغيرة|أشياء صغيرة/;
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "مخفي"]];
const CN = Object.fromEntries(CATS), SN = Object.fromEntries(ST), DN = Object.fromEntries(DIFF);
const IC = (c) => (String(c).startsWith("dg_") ? `../images/dig/${c}.svg` : String(c).startsWith("rd_") ? `../images/ready/${c}.svg` : `../images/zad/${c}.webp`);
const AR = /^[ء-ي٠-٩\s.،؟!:\-0-9ـ]+$/, MA = /^[ء-ي٠-٩\s.،؟!:\-0-9ـ+−×÷=]+$/, EN = /^[ء-يA-Za-z0-9\s.,،؟?!:'\-_]+$/;
const BADW = /غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت/, UNSAFE = /سكين|نار|موقد|إبر|مسمار|زجاج|كهرب|كيميائ|حمض|ساخن|غليان|لهب|مبيد|اشتر|حاد/;
const COLORS = ["red", "blue", "green", "yellow", "orange", "purple", "brown", "pink"];
let ALL = [], FS = "", FC = "", FK = "", FQ = "", FSP = "";
const okT = (cat) => (t) => { t = String(t == null ? "" : t).trim(); return t && !BADW.test(t) && !UNSAFE.test(t.replace(/(غير|ليس|ليست) حاد\S*/g, "")) && (cat === "english" ? EN : cat === "math" ? MA : AR).test(t); };
const lines = (t) => String(t || "").split("\n").map((x) => x.trim()).filter(Boolean);
function parseSteps(t) { return lines(t).map((l) => { const p = l.split("|").map((x) => x.trim()); const o = { t: p[0] || "", i: p[1] || "" }; if (p[2]) o.p = p[2]; if (p[3]) o.g = p[3]; return o; }); }
const stepLine = (x) => { const a = [x.t, x.i, x.p || "", x.g || ""]; while (a.length > 2 && !a[a.length - 1]) a.pop(); return a.join(" | "); };
const parseRes = (t) => lines(t).map((l) => { const p = l.split("|").map((x) => x.trim()); return { label: p[0] || "", href: (p[1] || "").replace(/^\/+/, "") }; });
const RESOK = /^[a-z0-9_-]+(\/[a-z0-9_.-]*)*$/;
function checkData(d) {
  const m = [], ok = okT(d.cat), x = d.data || {}, young = d.levels.includes("a2");
  const opts = (o, tag) => { if (!Array.isArray(o) || o.length < 3 || o.length > 4 || new Set(o).size !== o.length || !o.every(ok) || (young && o.length !== 3)) m.push(tag + ": ثلاثة أو أربعة خيارات مختلفة (ثلاثة للصغار)"); };
  if (d.type === "mcq") { const qs = x.qs; if (!Array.isArray(qs) || qs.length < 3) m.push("ثلاثة أسئلة على الأقل"); else qs.forEach((q, i) => { if (!ok(q.q)) m.push("نص السؤال " + (i + 1)); opts(q.o, "سؤال " + (i + 1)); if (!ok(q.why)) m.push("تفسير السؤال " + (i + 1)); }); }
  else if (d.type === "match" || d.type === "memory") { const p = x.pairs; if (!Array.isArray(p) || p.length < 3 || p.length > (young ? 3 : 6)) m.push("أزواج من 3 إلى " + (young ? 3 : 6)); else { p.forEach((a, i) => { if (!ok(a[0])) m.push("الزوج " + (i + 1)); }); if (new Set(p.map((a) => a[0])).size !== p.length) m.push("أزواج مكررة"); } if (young && d.type !== "mcq" && d.type !== "match" && d.type !== "memory") m.push("نوع غير مناسب للأصغر"); }
  else if (d.type === "order") { const it = x.items; if (young || !Array.isArray(it) || it.length < 3 || it.length > 6 || !it.every((a) => ok(a.t))) m.push("ترتيب: من 3 إلى 6 عناصر ولا يصلح للأصغر"); }
  else if (d.type === "sort") { const g = x.groups; if (young || !Array.isArray(g) || g.length < 2 || g.length > 3 || !g.every((a) => ok(a.n) && Array.isArray(a.items) && a.items.length >= 2 && a.items.every((b) => ok(b.t)))) m.push("تصنيف: مجموعتان أو ثلاث ولا يصلح للأصغر"); }
  else if (d.type === "color") { const t = x.tasks; if (young || !x.pic || !Array.isArray(t) || t.length < 2 || !t.every((a) => a.p && COLORS.includes(a.c) && ok(a.n))) m.push("تلوين: صورة ومهمتان بألوان صحيحة ولا يصلح للأصغر"); }
  else if (d.type === "diff") { const r = x.rounds; if (young || !Array.isArray(r) || r.length < 3 || r.length > 5 || !r.every((a) => Array.isArray(a.base) && (a.base.length === 4 || a.base.length === 6) && a.idx >= 0 && a.idx < a.base.length && a.alt && a.alt !== a.base[a.idx] && new Set(a.base).size >= 3)) m.push("اختلافات: من 3 إلى 5 مراحل (4 أو 6 صور، رقم الخانة المختلفة، والصورة البديلة)"); }
  else m.push("نوع غير معروف");
  return m;
}
function check(d) {
  const m = [], ok = okT(d.cat);
  if (!d.title) m.push("العنوان"); else if (!ok(d.title)) m.push("حروف العنوان");
  if (!(d.levels || []).length) m.push("العمر أو الصف");
  if (!d.subject) m.push("المادة"); if (!d.skill || !ok(d.skill)) m.push("المهارة"); if (!d.descr || !ok(d.descr)) m.push("الوصف"); if (!d.instr || !ok(d.instr)) m.push("الهدف أو التعليمات");
  if (!d.icon) m.push("الصورة الكرتونية");
  if (d.kind === "project") {
    const x = d.data || {}, young = d.levels.includes("a2") || d.levels.includes("a3");
    if (!ok(x.goal)) m.push("هدف المشروع"); if (!ok(x.safety)) m.push("تعليمات السلامة"); if (!ok(x.outcome)) m.push("النتيجة التعليمية");
    if (!Array.isArray(x.tools) || x.tools.length < 2 || x.tools.length > 6 || !x.tools.every(ok)) m.push("الأدوات من 2 إلى 6");
    const sp = d.span || "short", S = x.steps || [], mx = sp === "weekly" ? 14 : sp === "monthly" ? 16 : young ? 4 : 7, mn = sp === "weekly" ? 5 : sp === "monthly" ? 6 : 3; if (S.length < mn || S.length > mx) m.push("الخطوات من " + mn + " إلى " + mx); S.forEach((s, i) => { if (!ok(s.t) || s.t.length > 130) m.push("نص الخطوة " + (i + 1)); if (!s.i) m.push("صورة الخطوة " + (i + 1)); if (s.p && !ok(s.p)) m.push("إرشاد الخطوة " + (i + 1)); if (sp !== "short" && !(s.g && ok(s.g))) m.push("مرحلة الخطوة " + (i + 1)); });
    if (sp !== "short") { const gs = new Set(S.map((z) => z.g)); if (young || (sp === "monthly" && d.levels.includes("a4"))) m.push("المدة لا تناسب العمر (الأسبوعي من ٤ سنوات والشهري من ٥)"); if (sp === "weekly" && (gs.size < 2 || gs.size > 7)) m.push("الأسبوعي من يومين إلى ٧ أيام"); if (sp === "monthly" && (gs.size < 3 || gs.size > 5)) m.push("الشهري من ٣ إلى ٥ مراحل"); if (!x.reflect || x.reflect.length < 10 || !ok(x.reflect)) m.push("سؤال التأمل"); if (!x.parent || x.parent.length < 10 || !ok(x.parent)) m.push("دور ولي الأمر"); }
    if (young && [x.goal, x.safety, x.parent, ...(x.tools || []), ...S.map((z) => z.t + " " + (z.p || ""))].some((z) => CHOKE.test(z || ""))) m.push("أدوات تسبب الاختناق لمن هم دون ٤ سنوات");
    if ((x.res || []).length > 6 || (x.res || []).some((r) => !RESOK.test(r.href || "") || !ok(r.label))) m.push("روابط المكتبة (داخلية فقط حتى ستة)");
    if (young && !x.adult) m.push("الأعمار الصغيرة تتطلب مشاركة شخص بالغ"); if (!(d.minutes >= 5 && d.minutes <= 45) || (young && d.minutes > 12)) m.push("الزمن بالدقائق");
    if (!Array.isArray(x.skills) || x.skills.length < 3 || x.skills.length > 4 || !x.skills.every(ok)) m.push("ثلاث أو أربع مهارات يختار منها الطفل");
    const Q = x.qs || []; if (Q.length !== 2) m.push("سؤالان بعد التنفيذ"); Q.forEach((q, i) => { if (!ok(q.q) || !ok(q.why) || !Array.isArray(q.o) || q.o.length !== 3 || new Set(q.o).size !== 3 || !q.o.every(ok)) m.push("سؤال " + (i + 1)); });
  } else m.push(...checkData(d));
  if (!d.reviewed) m.push("تأكيد المراجعة"); if (!d.review_note) m.push("ملاحظة المراجعة");
  return m;
}
const abs = (p) => (/^https?:/.test(p) ? p : "../" + p);
const head = (u) => fetch(u, { method: "HEAD", cache: "no-store" }).then((r) => r.ok).catch(() => false);
const imgOk = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; });
const icons = (d) => { const s = new Set([d.icon]); if (d.kind === "project") ((d.data || {}).steps || []).forEach((x) => s.add(x.i)); else { const x = d.data || {}; (x.qs || []).forEach((q) => { [q.img, ...(q.oi || []), ...(q.seq || []), q.cnt && q.cnt[0]].forEach((i) => i && i !== "?" && s.add(i)); }); (x.pairs || []).forEach((p) => { s.add(p[1]); s.add(p[2]); }); (x.items || []).forEach((i) => s.add(i.i)); (x.groups || []).forEach((g) => { s.add(g.i); g.items.forEach((i) => s.add(i.i)); }); (x.rounds || []).forEach((r) => { r.base.forEach((i) => s.add(i)); s.add(r.alt); }); } s.delete(null); s.delete(undefined); s.delete(""); return Array.from(s).filter((i) => !(d.type === "match" && !/^[\w-]+$/.test(i))); };
async function load() { const r = await sb.from("proj_items").select("*").order("kind").order("sort_order").limit(2000); if (r.error) throw r.error; ALL = r.data || []; }
SUB.projadm = { title: "إدارة المشاريع والتحديات", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length, bad = ALL.filter((x) => x.status === "published" && check(x).length).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div><div class="stat"><b>${n("draft") + n("unpublished")}</b><span>مسودة أو مخفي</span></div><div class="stat"><b>${bad}</b><span>منشور وفيه مشكلة</span></div></div>
  <p class="mut">المشاريع تُكتب بخطواتها وأدواتها وسلامتها، والتحديات تُكتب بياناتها بصيغة JSON مع فحص. الصور تُختار من الرسوم الكرتونية الموجودة في المنصة (لا رفع مباشر من هنا بعد). لا يُنشر ما كان ناقصا، وغير المنشور لا يراه الزوار. الأدوات يجب أن تكون من البيت وآمنة، ولا يُقبل نص فيه أدوات خطرة أو شراء منتجات.</p>
  <div class="row"><button class="btn" id="fnp">➕ مشروع جديد</button><button class="btn" id="fnc">➕ تحدٍّ جديد</button><button class="btn g" id="fh">🔎 اكتشاف المشكلات</button></div>
  <div id="fhr"></div>
  <input type="search" id="fqs" placeholder="بحث بالعنوان أو المهارة" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="fch" style="margin-top:8px"></div><div class="chips" id="fck" style="margin-top:6px"></div><div class="chips" id="fcs" style="margin-top:6px"></div><div class="chips" id="fcc" style="margin-top:6px"></div><div id="fls"></div>`;
  const draw = () => {
    $("#fch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#fck").innerHTML = [["", "مشاريع وتحديات"], ["project", "مشاريع"], ["challenge", "تحديات"]].map(([k, l]) => `<button class="chip ${FK === k ? "on" : ""}" data-k="${k}">${l}</button>`).join("");
    $("#fcs").innerHTML = [["", "كل المدد"], ...SPANS].map(([k, l]) => `<button class="chip ${FSP === k ? "on" : ""}" data-sp="${k}">${l}</button>`).join("");
    $("#fcc").innerHTML = [["", "كل المجالات"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FK || x.kind === FK) && (!FC || x.cat === FC) && (!FSP || (x.span || "short") === FSP) && (!q || (x.title + " " + x.skill).toLowerCase().includes(q)));
    $("#fls").innerHTML = list.length ? list.map((x) => { const ms = check(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "i_puzzle"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${x.kind === "project" ? "مشروع " + SPN[x.span || "short"].split(" ")[0] : "تحدٍّ"} · ${esc(CN[x.cat] || x.cat)} · ${esc(DN[x.difficulty])} · ${esc(SN[x.status])}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا نتائج.</p>`;
    $$("#fch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#fck [data-k]").forEach((b) => b.onclick = () => { FK = b.dataset.k; draw(); });
    $$("#fcs [data-sp]").forEach((b) => b.onclick = () => { FSP = b.dataset.sp; draw(); });
    $$("#fcc [data-c]").forEach((b) => b.onclick = () => { FC = b.dataset.c; draw(); });
    $$("#fls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => String(x.id) === b.dataset.i), null, () => view(m)));
  };
  draw(); $("#fqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#fnp").onclick = () => edit(null, "project", () => view(m)); $("#fnc").onclick = () => edit(null, "challenge", () => view(m));
  $("#fh").onclick = async () => { const o = $("#fhr"); o.innerHTML = `<p class="mut">جاري الفحص…</p>`; const out = [];
    for (const x of ALL) { const e = check(x); if (e.length && x.status === "published") out.push(`${x.title}: ناقص ${e.join("، ")}`); const bad = []; for (const i of icons(x)) if (!(await imgOk(IC(i)))) bad.push(i); if (bad.length) out.push(`${x.title}: صور غير موجودة ${bad.join("، ")}`); if (x.link && x.link.href && !(await head(abs(x.link.href)))) out.push(`${x.title}: رابط القسم المرتبط لا يُفتح`); for (const r of ((x.data || {}).res || [])) if (!(await head(abs(r.href)))) out.push(`${x.title}: رابط المكتبة «${r.label}» لا يُفتح`); }
    o.innerHTML = out.length ? `<div class="card"><b style="color:var(--no)">مشكلات (${out.length})</b><ul>${out.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : `<div class="card"><b style="color:var(--ok)">لا مشكلات: كل المنشور مكتمل وصوره وروابطه تعمل.</b></div>`; };
} };
const SKEL = { mcq: { qs: [{ q: "", o: ["الصحيح", "خيار", "خيار"], why: "" }] }, match: { pairs: [["", "", null]] }, order: { items: [{ t: "", i: null }] }, sort: { groups: [{ n: "", i: null, items: [{ t: "" }, { t: "" }] }, { n: "", i: null, items: [{ t: "" }, { t: "" }] }] }, memory: { pairs: [["", "i_star"]] }, color: { pic: "house", tasks: [{ p: "wall", c: "red", n: "" }] }, diff: { rounds: [{ base: ["1f34e", "1f34c", "1f347", "1f34a"], idx: 0, alt: "1f353" }] } };
function edit(a, kind0, reload) {
  const isNew = !a, kind = a ? a.kind : kind0, proj = kind === "project";
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice(), link: Object.assign({ href: "", label: "" }, a.link), data: JSON.parse(JSON.stringify(a.data || {})) }) : { slug: (proj ? "pj-" : "ch-") + Date.now().toString(36), kind, cat: proj ? "science" : "observe", type: proj ? "project" : "mcq", title: "", icon: "i_puzzle", levels: [], subject: "", skill: "", difficulty: "easy", descr: "", instr: "", span: "short", minutes: proj ? 15 : null, data: proj ? { goal: "", tools: [], steps: [], safety: "", outcome: "", reflect: "", parent: "", res: [], adult: false, skills: [], qs: [{ q: "", o: ["", "", ""], why: "" }, { q: "", o: ["", "", ""], why: "" }] } : SKEL.mcq, link: { href: "", label: "" }, review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}"></label>`;
  const O = (arr, v) => arr.map(([k, x]) => `<option value="${k}" ${v === k ? "selected" : ""}>${x}</option>`).join("");
  const skills = [...new Set(ALL.map((x) => x.skill))], X = d.data, q0 = proj ? X.qs : [];
  const qf = (i) => { const q = q0[i] || { q: "", o: ["", "", ""], why: "" }; return `${T("fq" + i, "سؤال " + (i + 1) + " بعد التنفيذ", q.q)}${T("fa" + i, "الإجابة الصحيحة", q.o[0])}${T("fb" + i, "خيار خاطئ", q.o[1])}${T("fc" + i, "خيار خاطئ آخر", q.o[2])}${T("fw" + i, "تفسير الإجابة", q.why)}`; };
  const s = sheet(`<h2>${isNew ? (proj ? "مشروع جديد" : "تحدٍّ جديد") : "تعديل"}</h2>
  ${T("ft", "الاسم", d.title)}<label class="f"><span>المجال</span><select id="fc">${O(proj ? PC : CC, d.cat)}</select></label>
  ${proj ? "" : `<label class="f"><span>نوع التحدي</span><select id="fy">${O(CTYPES, d.type)}</select></label>`}
  ${proj ? `<label class="f"><span>مدة المشروع</span><select id="fsp">${O(SPANS, d.span || "short")}</select></label>` : ""}<label class="f"><span>مستوى الصعوبة</span><select id="fdf">${O(DIFF, d.difficulty)}</select></label>
  ${T("fsb", "المادة", d.subject)}<label class="f"><span>المهارة (اكتب جديدة أو اختر)</span><input type="text" id="fsk" list="fsl" value="${esc(d.skill)}"><datalist id="fsl">${skills.map((k) => `<option value="${esc(k)}">`).join("")}</datalist></label>
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="flv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("fic", "الصورة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon)}
  <label class="f"><span>وصف قصير</span><textarea id="fde" rows="2" dir="auto">${esc(d.descr || "")}</textarea></label>
  <label class="f"><span>${proj ? "هدف المشروع" : "تعليمات للطفل"}</span><textarea id="fin" rows="2" dir="auto">${esc(d.instr || "")}</textarea></label>
  ${proj ? `<label class="f"><span>الزمن بالدقائق (5 إلى 45)</span><input type="number" id="fmn" min="5" max="45" value="${d.minutes || ""}"></label>
  <label class="f"><span>الأدوات (أداة في كل سطر، من البيت وآمنة)</span><textarea id="ftl" rows="4" dir="auto">${esc((X.tools || []).join("\n"))}</textarea></label>
  <label class="f"><span>خطوات التنفيذ: سطر لكل خطوة بالشكل  النص | اسم الصورة | إرشاد للوالدين اختياري | اسم المرحلة (اليوم أو الأسبوع، يلزم في الأسبوعي والشهري)</span><textarea id="fst2" rows="8" dir="auto">${esc((X.steps || []).map(stepLine).join("\n"))}</textarea></label>
  <label class="f"><span>دور ولي الأمر (كيف يساعد دون أن ينفذ عن الطفل؛ يلزم في الأسبوعي والشهري)</span><textarea id="fpa" rows="2" dir="auto">${esc(X.parent || "")}</textarea></label><label class="f"><span>سؤال أو نشاط التأمل بعد الإنجاز (يلزم في الأسبوعي والشهري)</span><textarea id="frf" rows="2" dir="auto">${esc(X.reflect || "")}</textarea></label><label class="f"><span>روابط من المكتبة (حتى ستة، سطر لكل رابط: الاسم | المسار مثل stories/ أو worksheets)</span><textarea id="fres" rows="3" dir="ltr">${esc((X.res || []).map((r) => r.label + " | " + r.href).join("\n"))}</textarea></label>${T("fsf", "تعليمات السلامة", X.safety)}${T("fou", "النتيجة التعليمية المتوقعة", X.outcome)}
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="fad" ${X.adult ? "checked" : ""}> <span>يتطلب مشاركة شخص بالغ</span></label>
  <label class="f"><span>مهارات يختار منها الطفل عند الإكمال (من 3 إلى 4، سطر لكل مهارة)</span><textarea id="fsks" rows="4" dir="auto">${esc((X.skills || []).join("\n"))}</textarea></label>
  ${qf(0)}${qf(1)}` : `<label class="f" id="fdw"><span>بيانات التحدي (JSON؛ الإجابة الصحيحة أولا وتُخلط تلقائيا)</span><textarea id="fdt" rows="10" dir="ltr" style="font-family:monospace;font-size:13px">${esc(JSON.stringify(d.data, null, 1))}</textarea></label>`}
  <label class="f"><span>ربط اختياري بقسم أو درس في المكتبة</span><select id="flk">${LINKS.map(([k, x]) => `<option value="${k}" ${d.link.href === k ? "selected" : ""}>${x}</option>`).join("")}${d.link.href && !LINKS.some((x) => x[0] === d.link.href) ? `<option value="${esc(d.link.href)}" selected>${esc(d.link.href)}</option>` : ""}</select></label>${T("fll", "نص زر الانتقال", d.link.label)}
  <label class="f"><span>ملاحظة المراجعة التربوية (تلزم قبل النشر)</span><textarea id="frv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="frc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ المحتوى وأؤكد سلامة الأدوات والخطوات وملاءمته للعمر</span></label>
  <label class="f"><span>حالة النشر</span><select id="fst">${O(ST, d.status)}</select></label>
  ${T("fso2", "ترتيب الظهور (رقم أصغر أولا)", d.sort_order)}
  <p id="fmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p><p id="fchk" class="mut"></p>
  <div class="row"><button class="btn" id="fsv">حفظ</button><button class="btn g" id="fpv">معاينة</button><button class="btn g" id="fpl">فحص الصور</button></div>
  <div class="row"><button class="btn g" id="fx">إغلاق</button>${isNew ? "" : `<button class="btn g" id="fdel" style="color:var(--no)">🗑 حذف</button>`}</div>`);
  $("#fx", s).onclick = closeSheet;
  $$("#flv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  if (!proj) { $("#fy", s).onchange = () => { const t = $("#fy", s).value; if (!d.__touched) $("#fdt", s).value = JSON.stringify(SKEL[t], null, 1); }; $("#fdt", s).oninput = () => { d.__touched = true; }; }
  const collect = () => { d.title = $("#ft", s).value.trim(); d.cat = $("#fc", s).value; d.difficulty = $("#fdf", s).value; d.subject = $("#fsb", s).value.trim(); d.skill = $("#fsk", s).value.trim(); d.icon = $("#fic", s).value.trim() || null; d.descr = $("#fde", s).value.trim(); d.instr = $("#fin", s).value.trim();
    if (proj) { d.span = $("#fsp", s).value; d.minutes = parseInt($("#fmn", s).value, 10) || 0; d.data = { reflect: $("#frf", s).value.trim(), parent: $("#fpa", s).value.trim(), res: parseRes($("#fres", s).value), goal: d.instr, tools: lines($("#ftl", s).value), steps: parseSteps($("#fst2", s).value), safety: $("#fsf", s).value.trim(), outcome: $("#fou", s).value.trim(), adult: $("#fad", s).checked, skills: lines($("#fsks", s).value), qs: [0, 1].map((i) => ({ q: $("#fq" + i, s).value.trim(), o: [$("#fa" + i, s).value.trim(), $("#fb" + i, s).value.trim(), $("#fc" + i, s).value.trim()], why: $("#fw" + i, s).value.trim() })) }; }
    else { d.type = $("#fy", s).value; d.minutes = null; try { d.data = JSON.parse($("#fdt", s).value); d.__jerr = false; } catch (e) { d.__jerr = true; } }
    const h = $("#flk", s).value; d.link = h ? { href: h, label: $("#fll", s).value.trim() || (LINKS.find((x) => x[0] === h) || [0, h])[1] } : {};
    d.review_note = $("#frv", s).value.trim(); d.reviewed = $("#frc", s).checked; d.status = $("#fst", s).value; d.sort_order = parseInt($("#fso2", s).value, 10) || 0; };
  $("#fpl", s).onclick = async () => { collect(); const o = $("#fchk", s); o.textContent = "جاري الفحص…"; const bad = []; for (const i of icons(d)) if (!(await imgOk(IC(i)))) bad.push(i); if (d.link.href && !(await head(abs(d.link.href)))) bad.push("الرابط المرتبط"); o.textContent = bad.length ? "لا يعمل: " + bad.join("، ") : "كل الصور والروابط تعمل."; };
  $("#fpv", s).onclick = () => { collect(); const er = d.__jerr ? ["صيغة JSON غير صحيحة"] : check(d); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; const D = d.data || {};
    o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><img src="${esc(IC(d.icon || ""))}" alt="" width="56" height="56"><b> ${esc(d.title)}</b><p>${proj ? "مشروع" : "تحدٍّ"} · ${esc(CN[d.cat])} · ${esc(DN[d.difficulty])} · ${esc(d.skill)}${d.minutes ? " · " + d.minutes + " دقيقة" : ""}${proj ? " · " + esc(SPN[d.span || "short"]) : ""}</p><p>${esc(d.descr)}</p>${proj ? `<p><b>الهدف:</b> ${esc(D.goal)}</p>${D.adult ? "<p>👨‍👩‍👧 بمشاركة شخص بالغ</p>" : ""}<p><b>الأدوات:</b> ${esc((D.tools || []).join("، "))}</p><p><b>السلامة:</b> ${esc(D.safety)}</p><ol>${(D.steps || []).map((x) => `<li><img src="${esc(IC(x.i))}" alt="" width="36" height="36" style="vertical-align:middle"> ${x.g ? `<b>[${esc(x.g)}]</b> ` : ""}${esc(x.t)}${x.p ? `<br><small>إرشاد: ${esc(x.p)}</small>` : ""}</li>`).join("")}</ol><p><b>النتيجة:</b> ${esc(D.outcome)}</p>${D.parent ? `<p><b>دور ولي الأمر:</b> ${esc(D.parent)}</p>` : ""}${D.reflect ? `<p><b>سؤال التأمل:</b> ${esc(D.reflect)}</p>` : ""}${(D.res || []).length ? `<p><b>موارد المكتبة:</b> ${esc(D.res.map((r) => r.label).join("، "))}</p>` : ""}` : `<p><i>${esc(d.instr)}</i></p><p class="mut">للتجربة الكاملة احفظه كمسودة ثم انشره وافتحه من صفحة المشاريع والتحديات.</p>`}</div>${er.length ? `<p style="color:var(--no)">ناقص: ${esc(er.join("، "))}</p>` : `<p style="color:var(--ok)">جاهز للنشر</p>`}<button class="btn g" id="pvx">إغلاق المعاينة</button></div>`; document.body.appendChild(o); $("#pvx", o).onclick = () => o.remove(); };
  $("#fsv", s).onclick = async () => {
    collect(); if (!d.title) { $("#fmiss", s).textContent = "اكتب الاسم"; return; }
    if (d.__jerr) { $("#fmiss", s).textContent = "صيغة JSON غير صحيحة"; return; }
    if (d.status === "published") { const miss = check(d); if (miss.length) { $("#fmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#fmiss", s).textContent = ""; $("#fsv", s).disabled = true;
    try { const row = { slug: d.slug, kind: d.kind, cat: d.cat, type: d.type, title: d.title, icon: d.icon, levels: d.levels, subject: d.subject, skill: d.skill, difficulty: d.difficulty, span: proj ? d.span || "short" : "short", descr: d.descr, instr: d.instr, minutes: d.minutes, data: d.data, link: d.link, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order, updated_at: new Date().toISOString() };
      const r = isNew ? await sb.from("proj_items").insert(row) : await sb.from("proj_items").update(row).eq("id", d.id); if (r.error) throw r.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { $("#fsv", s).disabled = false; fail(e); }
  };
  const del = $("#fdel", s); if (del) del.onclick = async () => { if (!confirm("حذف هذا العنصر نهائيا؟ لا يمكن التراجع. (للإخفاء فقط اختر حالة «مخفي»)")) return; try { const r = await sb.from("proj_items").delete().eq("id", d.id); if (r.error) throw r.error; toast("تم الحذف"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
})();
