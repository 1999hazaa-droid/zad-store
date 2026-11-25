/* إدارة الاختبارات والمسابقات: إنشاء اختبار، إضافة الأسئلة والخيارات، تحديد الإجابة الصحيحة، الصور والصوت، العمر والصف، المادة والمهارة، الصعوبة، ترتيب الأسئلة، الربط بدرس، معاينة قبل النشر، تعديل وإخفاء ونشر، ومتابعة الأخطاء التقنية — داخل لوحة زاد المحمية. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const CATS = [["early", "التعلم المبكر"], ["arabic", "اللغة العربية"], ["math", "الرياضيات"], ["english", "اللغة الإنجليزية"], ["science", "العلوم والمعرفة"], ["values", "القيم والمهارات الحياتية"]];
const LEVELS = [["a2", "سنة إلى سنتين"], ["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const DIFFS = [["easy", "سهل"], ["mid", "متوسط"], ["adv", "يحتاج تفكيرا"]], ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "مخفي"]];
const TYPES = [["mc", "اختيار من متعدد"], ["pic", "اختيار صورة"], ["match", "مطابقة"], ["dnd", "سحب وإفلات"], ["order", "ترتيب العناصر"], ["tf", "صح أو خطأ"], ["fill", "إكمال كلمة أو جملة"], ["listen", "استمع واختر"], ["prob", "مسألة مصورة"], ["obs", "ملاحظة (اختيار عدة صور)"], ["build", "تكوين كلمة من حروفها"], ["mem", "ذاكرة (بطاقات متشابهة)"]];
const TAGS = ["letters", "numbers", "pictures", "vocab", "science", "memory", "discover", "review", "tashkeel"];
const CN = Object.fromEntries(CATS), SN = Object.fromEntries(ST), TN = Object.fromEntries(TYPES);
const IC = (c) => (String(c).startsWith("dg_") ? `../images/dig/${c}.svg` : String(c).startsWith("rd_") ? `../images/ready/${c}.svg` : `../images/zad/${c}.webp`);
const imgOk = (u) => new Promise((r) => { const i = new Image(); i.onload = () => r(true); i.onerror = () => r(false); i.src = u; });
const head = (u) => fetch(u, { method: "HEAD", cache: "no-store" }).then((r) => r.ok).catch(() => false);
const AR = /^[ء-ي٠-٩\s.،؟!:\-0-9ـ]+$/, ARM = /^[ء-ي٠-٩\s.،؟!:\-0-9ـ+−×÷=]+$/, ARH = /^[ء-ي٠-٩\s.،؟!:\-0-9ـً-ْ]+$/, ENR = /^[_ء-يA-Za-z0-9\s.،,؟?!:'\-]+$/;
const BADW = /غبي|فاشل|أحمق|مرعب|مخيف|قتل|موت|خطأ فادح/;
let ALL = [], ERRS = [], FS = "", FC = "", FQ = "";
async function load() { const r = await sb.from("qz_quizzes").select("*").order("sort_order").limit(500); if (r.error) throw r.error; ALL = r.data || []; const e = await sb.from("qz_errors").select("*").order("created_at", { ascending: false }).limit(200); ERRS = e.error ? [] : e.data || []; }
const rxOf = (d) => (d.cat === "english" ? ENR : (d.tags || []).includes("tashkeel") ? ARH : d.cat === "math" ? ARM : AR);
/* فحص بنية السؤال (نفس منطق صفحة الطفل) */
function qStruct(q) {
  const arr = (a, m) => Array.isArray(a) && a.length >= m;
  if (!q || !q.q || !["mc", "fill", "listen", "pic", "prob", "tf", "match", "dnd", "order", "build", "obs", "mem"].includes(q.t)) return "نوع أو نص السؤال";
  if (["mc", "fill", "listen", "pic", "prob"].includes(q.t)) { if (!arr(q.o, 2) || q.o.length > 4 || new Set(q.o).size !== q.o.length) return "الخيارات (٢ إلى ٤ دون تكرار، والصحيح أولا)"; if (q.t === "listen" && !q.say) return "نص الاستماع"; if (q.t === "prob" && !(q.pr && q.pr.i)) return "المسألة المصورة"; if (q.t === "fill" && !String(q.q).includes("___")) return "الفراغ ___ في الجملة"; if (q.t === "pic" && q.o.length < 3) return "الصور (٣ على الأقل)"; }
  if (q.t === "prob") { const p = q.pr, r = p.op === "+" ? p.a + p.b : p.a - p.b; if (String(r) !== String(q.o[0])) return "الإجابة الصحيحة لا تطابق المسألة المصورة"; }
  if (q.t === "tf" && typeof q.a !== "boolean") return "إجابة صح أو خطأ";
  if (q.t === "match" && (!arr(q.pairs, 3) || q.pairs.length > 5 || q.pairs.some((p) => !p[0] || !(p[1] || p[2])))) return "أزواج المطابقة (٣ إلى ٥)";
  if (q.t === "dnd" && (!arr(q.items, 3) || q.items.length > 6 || ![2, 3].includes((q.groups || []).length) || q.items.some((x) => !q.groups[x.g]))) return "السحب والإفلات (٣ إلى ٦ عناصر ومجموعتان أو ثلاث)";
  if (q.t === "order" && (!arr(q.items, 3) || q.items.length > 6)) return "عناصر الترتيب (٣ إلى ٦)";
  if (q.t === "build" && (!q.w || q.w.length < 3 || q.w.length > 8)) return "الكلمة (٣ إلى ٨ حروف)";
  if (q.t === "obs" && (!arr(q.items, 4) || q.items.length > 6 || !arr(q.c, 1) || q.c.length >= q.items.length || q.c.some((x) => !q.items[x]))) return "الملاحظة (٤ إلى ٦ صور وإجابة صحيحة واحدة على الأقل لا تشمل الكل)";
  if (q.t === "mem" && (!arr(q.ic, 3) || q.ic.length > 6 || new Set(q.ic).size !== q.ic.length)) return "الذاكرة (٣ إلى ٦ صور مختلفة)";
  return null;
}
const iconsOf = (q) => { const s = new Set(); const a = (x) => x && s.add(x); a(q.img); (q.cnt ? [q.cnt[0]] : []).forEach(a); (q.seq || []).forEach(a); (q.oi && Array.isArray(q.oi) ? q.oi : []).forEach(a); if (q.t === "pic" || (q.t === "listen" && q.oi === true)) q.o.forEach(a); if (q.pr) a(q.pr.i); (q.pairs || []).forEach((p) => a(p[2])); (q.items || []).forEach((x) => a(x.i)); (q.groups || []).forEach((g) => a(g.i)); (q.ic || []).forEach(a); return [...s]; };
const textsOf = (q) => { const t = [q.q, q.why, q.sk]; if (q.ps) t.push(q.ps); if (["mc", "fill", "listen", "prob"].includes(q.t) && !(q.t === "listen" && q.oi === true)) t.push(...q.o); (q.nm || []).forEach((x) => t.push(x)); (q.pairs || []).forEach((p) => { t.push(p[0]); if (p[1]) t.push(p[1]); }); (q.items || []).forEach((x) => x.t && t.push(x.t)); (q.groups || []).forEach((g) => t.push(g.n)); if (q.w) t.push(q.w); return t.filter((x) => x != null && String(x) !== ""); };
function check(d) {
  const m = [], t = (x) => String(x == null ? "" : x).trim(), rx = rxOf(d);
  if (!t(d.title) || !AR.test(t(d.title))) m.push("العنوان (عربي بلا رموز)"); if (!t(d.skill)) m.push("المهارة"); if (!t(d.subject)) m.push("المادة"); if (!t(d.descr)) m.push("الوصف المختصر");
  if (!d.icon) m.push("الرسمة"); if (!(d.levels || []).length) m.push("العمر أو الصف"); if (!d.link || !t(d.link.href) || !t(d.link.label)) m.push("رابط الدرس أو النشاط");
  const qs = d.questions || []; if (qs.length < 4) m.push("٤ أسئلة على الأقل");
  qs.forEach((q, i) => { const e = qStruct(q); if (e) { m.push(`سؤال ${i + 1}: ${e}`); return; } if (!t(q.sk) || !t(q.why)) m.push(`سؤال ${i + 1}: المهارة والتوضيح`); const young = (d.levels || []).some((l) => l === "a2" || l === "a3"); if (young && q.t === "tf") m.push(`سؤال ${i + 1}: صح/خطأ لا يناسب سنة إلى ٣ سنوات`); if (young && ((q.o && q.o.length > 3) || (q.pairs && q.pairs.length > 3))) m.push(`سؤال ${i + 1}: أكثر من ٣ خيارات للصغار`); textsOf(q).forEach((x) => { if (!rx.test(t(x))) m.push(`سؤال ${i + 1}: نص غير مسموح «${t(x).slice(0, 18)}»`); else if (BADW.test(x)) m.push(`سؤال ${i + 1}: كلمة غير مناسبة`); }); });
  if (!d.reviewed) m.push("تأكيد المراجعة"); if (!t(d.review_note) || t(d.review_note).length < 6) m.push("ملاحظة المراجعة");
  return m;
}
async function deep(d) { const bad = []; const seen = new Set(); for (const q of d.questions || []) for (const c of iconsOf(q)) { if (seen.has(c)) continue; seen.add(c); if (!(await imgOk(IC(c)))) bad.push("صورة غير موجودة: " + c); } if (d.icon && !(await imgOk(IC(d.icon)))) bad.push("رسمة الاختبار غير موجودة"); if (d.link && d.link.href && !(await head("../" + d.link.href.split("?")[0]))) bad.push("رابط الدرس لا يُفتح: " + d.link.href); return bad; }
SUB.quizadm = { title: "إدارة الاختبارات والمسابقات", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length, bad = ALL.filter((x) => x.status === "published" && check(x).length).length, groups = {}; ERRS.forEach((e) => (groups[e.quiz_slug] = (groups[e.quiz_slug] || 0) + 1));
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>اختبارات</span></div><div class="stat"><b>${n("published")}</b><span>منشورة</span></div><div class="stat"><b>${n("draft") + n("unpublished")}</b><span>مسودة أو مخفية</span></div><div class="stat"><b>${ERRS.length}</b><span>أخطاء تقنية مسجلة</span></div></div>
  <p class="mut">أنشئ اختبارا، أضف أسئلته وحدد الإجابة الصحيحة (الخيار الأول في كل سؤال هو الصحيح، ويُخلط عرضه للطفل). ما يظهر للطفل ينشر مباشرة، ولا يُنشر اختبار ناقص أو فيه نص غير مسموح أو صورة غير موجودة أو رابط درس لا يعمل. المسابقات تُبنى تلقائيا من الاختبارات المنشورة بحسب الوسوم (tags). فحص المحتوى هنا آلي وليس مراجعة تربوية؛ المراجعة البشرية تبقى لازمة.</p>
  <div class="row"><button class="btn" id="qn1">➕ اختبار جديد</button><button class="btn g" id="qhc">🔎 فحص كل الاختبارات</button><button class="btn g" id="qer">⚠️ الأخطاء التقنية (${ERRS.length})</button></div><div id="qhr"></div>
  <input type="search" id="qqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px"><div class="chips" id="qch" style="margin-top:8px"></div><div class="chips" id="qct" style="margin-top:6px"></div><div id="qls"></div>`;
  const draw = () => {
    $("#qch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#qct").innerHTML = [["", "كل المواد"], ...CATS].map(([k, l]) => `<button class="chip ${FC === k ? "on" : ""}" data-c="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FC || x.cat === FC) && (!q || x.title.toLowerCase().includes(q)));
    $("#qls").innerHTML = list.length ? list.map((x) => { const ms = check(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "i_puzzle"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(CN[x.cat] || x.cat)} · ${(x.questions || []).length} أسئلة · ${esc(SN[x.status])}${groups[x.slug] ? " · أخطاء: " + groups[x.slug] : ""}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا نتائج.</p>`;
    $$("#qch [data-s]").forEach((b) => (b.onclick = () => { FS = b.dataset.s; draw(); })); $$("#qct [data-c]").forEach((b) => (b.onclick = () => { FC = b.dataset.c; draw(); }));
    $$("#qls [data-i]").forEach((b) => (b.onclick = () => edit(ALL.find((x) => String(x.id) === b.dataset.i), () => view(m))));
  };
  draw(); $("#qqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#qn1").onclick = () => edit(null, () => view(m));
  $("#qhc").onclick = async () => { const o = $("#qhr"); o.innerHTML = `<p class="mut">جاري الفحص…</p>`; const out = []; for (const x of ALL) { const e = check(x); if (e.length && x.status === "published") out.push(`${x.title}: ناقص ${e.slice(0, 3).join("، ")}`); const d = await deep(x); d.forEach((t) => out.push(`${x.title}: ${t}`)); } o.innerHTML = out.length ? `<div class="card"><b style="color:var(--no)">ملاحظات (${out.length})</b><ul>${out.slice(0, 120).map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : `<div class="card"><b style="color:var(--ok)">لا مشكلات: كل الاختبارات مكتملة وصورها وروابطها تعمل.</b></div>`; };
  $("#qer").onclick = () => { const o = $("#qhr"); o.innerHTML = ERRS.length ? `<div class="card"><b>الأخطاء التقنية الأخيرة</b><p class="mut">تُرسل تلقائيا من صفحة الطفل عند تعذر عرض سؤال (دون أي بيانات عن الطفل).</p><ul>${ERRS.slice(0, 60).map((e) => `<li>${esc(e.quiz_slug)} سؤال ${e.qidx == null ? "؟" : e.qidx + 1}: ${esc(e.kind)} — ${esc(e.msg)} <small>(${esc(String(e.created_at).slice(0, 10))})</small></li>`).join("")}</ul><button class="btn g" id="qerc">مسح سجل الأخطاء بعد إصلاحها</button></div>` : `<div class="card"><b style="color:var(--ok)">لا أخطاء تقنية مسجلة.</b></div>`; const c = $("#qerc"); if (c) c.onclick = async () => { if (!confirm("مسح سجل الأخطاء التقنية؟ (لا يحذف أي اختبار)")) return; const r = await sb.from("qz_errors").delete().gt("id", 0); if (r.error) return fail(r.error); toast("تم مسح السجل"); view(m); }; };
} };
/* ===== معاينة: تُعرض في إطار منفصل بنفس صفحة الطفل ولا تحفظ أي نتيجة ===== */
function preview(d, lv) {
  const base = new URL("../quizzes/play/", location.href).href, json = JSON.stringify({ quiz: d, lv }).replace(/</g, "\\u003c");
  const doc = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="${base}"><link rel="stylesheet" href="../../css/zad-tokens.css"><link rel="stylesheet" href="../../css/zad-ui.css?v=4"><link rel="stylesheet" href="../../cards/cards.css?v=2"><link rel="stylesheet" href="../../activities/activities.css?v=1"><link rel="stylesheet" href="../../wiki/wiki.css?v=1"><link rel="stylesheet" href="../../language/language.css?v=3"><link rel="stylesheet" href="../quiz.css?v=1"></head><body class="cd ad wk lg qz" data-page="play"><main class="zw avw"><div id="aview"></div></main><script>window.__ZQPREVIEW=${json}<\/script><script src="../quiz.js?v=1"><\/script></body></html>`;
  const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet" style="max-width:820px;width:100%"><h2>معاينة الاختبار (لا تحفظ أي نتيجة)</h2><iframe id="qzfr" title="معاينة" style="width:100%;height:68vh;border:2px solid #e8e2fa;border-radius:14px;background:#f7f4ff" sandbox="allow-scripts allow-same-origin"></iframe><div class="row"><button class="btn g" id="pvx">إغلاق المعاينة</button></div></div>`;
  document.body.appendChild(o); $("#qzfr", o).srcdoc = doc; $("#pvx", o).onclick = () => o.remove();
}
/* ===== محرر الأسئلة: كل نوع له حقول بسيطة ===== */
const L = (s) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean), P = (s) => String(s).split("|").map((x) => x.trim()), dash = (x) => (x && x !== "-" ? x : null);
const FIELDS = {
  mc: [["ps", "نص للقراءة فوق السؤال (اختياري)", "area"], ["img", "صورة (اسم ملف، اختياري)"], ["cnt", "صور للعد: اسم الصورة:العدد (اختياري)"], ["seq", "نمط: أسماء الصور مفصولة بمسافات (اختياري)"], ["say", "نص للاستماع (اختياري)"], ["o", "الخيارات: سطر لكل خيار «نص | صورة اختيارية»، والأول هو الصحيح", "area"]],
  fill: [["img", "صورة (اختياري)"], ["o", "الخيارات (الأول صحيح)، والسؤال يحتوي ___", "area"]],
  listen: [["say", "النص الذي يُنطق عند الضغط"], ["en", "النطق بالإنجليزية", "check"], ["ic", "الخيارات صور (أسماء ملفات) وليست نصا", "check"], ["o", "الخيارات (الأول صحيح)", "area"]],
  pic: [["say", "نص ينطق عند الضغط (اختياري)"], ["o", "الصور: سطر لكل صورة «اسم الصورة | التسمية»، والأولى هي الصحيحة", "area"]],
  tf: [["a", "الإجابة الصحيحة", "sel", [["1", "صح"], ["0", "خطأ"]]]],
  prob: [["ic", "صورة المسألة (اسم ملف)"], ["a", "العدد الأول"], ["b", "العدد الثاني"], ["op", "العملية", "sel", [["+", "جمع"], ["-", "طرح"]]], ["w", "خياران خاطئان مفصولان بفاصلة"]],
  match: [["pairs", "الأزواج: سطر لكل زوج «النص | النص المقابل أو - | صورة أو -»", "area"]],
  dnd: [["groups", "المجموعات: سطر «الاسم | صورة أو -» (٢ أو ٣)", "area"], ["items", "العناصر: سطر «النص | صورة أو - | رقم المجموعة (١ أو ٢ …)»", "area"]],
  order: [["items", "العناصر بالترتيب الصحيح: سطر «النص | صورة اختيارية»", "area"]],
  build: [["w", "الكلمة"], ["img", "صورة (اختياري)"], ["en", "كلمة إنجليزية", "check"]],
  obs: [["items", "الصور: سطر «اسم الصورة | تسمية اختيارية» (٤ إلى ٦)", "area"], ["c", "أرقام الصور الصحيحة مفصولة بفاصلة (تبدأ من ١)"]],
  mem: [["ic", "أسماء الصور المختلفة، سطر لكل صورة (٣ إلى ٦)", "area"]],
};
function toForm(q) {
  const f = {};
  switch (q.t) {
    case "mc": case "fill": f.ps = q.ps || ""; f.img = q.img || ""; f.cnt = q.cnt ? q.cnt[0] + ":" + q.cnt[1] : ""; f.seq = (q.seq || []).join(" "); f.say = q.say || ""; f.o = q.o.map((x, i) => x + (q.oi && q.oi[i] ? " | " + q.oi[i] : "")).join("\n"); break;
    case "listen": f.say = q.say; f.en = !!q.en; f.ic = q.oi === true; f.o = q.o.join("\n"); break;
    case "pic": f.say = q.say || ""; f.o = q.o.map((x, i) => x + " | " + ((q.nm && q.nm[i]) || "")).join("\n"); break;
    case "tf": f.a = q.a ? "1" : "0"; break;
    case "prob": f.ic = q.pr.i; f.a = q.pr.a; f.b = q.pr.b; f.op = q.pr.op; f.w = q.o.slice(1).join(","); break;
    case "match": f.pairs = q.pairs.map((p) => [p[0], p[1] || "-", p[2] || "-"].join(" | ")).join("\n"); break;
    case "dnd": f.groups = q.groups.map((g) => g.n + " | " + (g.i || "-")).join("\n"); f.items = q.items.map((x) => [x.t, x.i || "-", x.g + 1].join(" | ")).join("\n"); break;
    case "order": f.items = q.items.map((x) => x.t + (x.i ? " | " + x.i : "")).join("\n"); break;
    case "build": f.w = q.w; f.img = q.img || ""; f.en = !!q.en; break;
    case "obs": f.items = q.items.map((x) => x.i + (x.t ? " | " + x.t : "")).join("\n"); f.c = q.c.map((x) => x + 1).join(","); break;
    case "mem": f.ic = q.ic.join("\n"); break;
  }
  return f;
}
function fromForm(t, base, f) {
  const q = { t, q: base.q, why: base.why, sk: base.sk };
  switch (t) {
    case "mc": case "fill": { const ls = L(f.o).map(P); q.o = ls.map((x) => x[0]); if (ls.some((x) => dash(x[1]))) q.oi = ls.map((x) => dash(x[1]) || ""); if (f.ps) q.ps = f.ps; if (f.img) q.img = f.img; if (f.cnt) { const [i, n] = f.cnt.split(":"); q.cnt = [i.trim(), parseInt(n, 10) || 0]; } if (f.seq) q.seq = f.seq.split(/\s+/).filter(Boolean); if (f.say) q.say = f.say; break; }
    case "listen": q.say = f.say; if (f.en) q.en = true; q.o = L(f.o); if (f.ic) q.oi = true; break;
    case "pic": { const ls = L(f.o).map(P); q.o = ls.map((x) => x[0]); q.nm = ls.map((x) => x[1] || "").filter((x, i, a) => a.some(Boolean) || false); if (f.say) q.say = f.say; if (!q.nm.length) delete q.nm; break; }
    case "tf": q.a = f.a === "1"; break;
    case "prob": { const a = parseInt(f.a, 10), b = parseInt(f.b, 10), op = f.op === "-" ? "-" : "+", r = op === "+" ? a + b : a - b; q.pr = { i: f.ic, a, b, op }; q.o = [String(r)].concat(String(f.w).split(",").map((x) => x.trim()).filter(Boolean)); break; }
    case "match": q.pairs = L(f.pairs).map(P).map((p) => [p[0], dash(p[1]), dash(p[2])]); break;
    case "dnd": q.groups = L(f.groups).map(P).map((p) => ({ n: p[0], i: dash(p[1]) })); q.items = L(f.items).map(P).map((p) => ({ t: p[0], i: dash(p[1]), g: (parseInt(p[2], 10) || 1) - 1 })); break;
    case "order": q.items = L(f.items).map(P).map((p) => ({ t: p[0], i: p[1] || null })); break;
    case "build": q.w = f.w; if (f.img) q.img = f.img; if (f.en) q.en = true; break;
    case "obs": q.items = L(f.items).map(P).map((p) => ({ i: p[0], t: p[1] || null })); q.c = String(f.c).split(",").map((x) => parseInt(x, 10) - 1).filter((x) => x >= 0); break;
    case "mem": q.ic = L(f.ic); break;
  }
  return q;
}
function editQuestion(q0, done) {
  const q = q0 ? JSON.parse(JSON.stringify(q0)) : { t: "mc", q: "", why: "", sk: "", o: ["", ""] }; let t = q.t; const form = () => toForm(Object.assign({ o: [], items: [], pairs: [], groups: [], ic: [], pr: { i: "", a: 0, b: 0, op: "+" }, c: [], w: "" }, q, { t }));
  const s = sheet(`<h2>${q0 ? "تعديل سؤال" : "سؤال جديد"}</h2><label class="f"><span>نوع السؤال</span><select id="qt">${TYPES.map(([k, l]) => `<option value="${k}" ${k === t ? "selected" : ""}>${l}</option>`).join("")}</select></label>
  <label class="f"><span>نص السؤال (قصير للصغار)</span><input type="text" id="qq" value="${esc(q.q || "")}"></label><label class="f"><span>المهارة التي يقيسها (مثل: الجمع والطرح)</span><input type="text" id="qs" value="${esc(q.sk || "")}"></label><label class="f"><span>توضيح الإجابة الصحيحة (يظهر بعد الإجابة)</span><input type="text" id="qw" value="${esc(q.why || "")}"></label>
  <div id="qf"></div><p id="qm" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="qok">اعتماد السؤال</button><button class="btn g" id="qx">إلغاء</button></div>`);
  const fillF = () => { const f = form(); $("#qf", s).innerHTML = (FIELDS[t] || []).map(([k, l, kind, opts]) => kind === "area" ? `<label class="f"><span>${l}</span><textarea data-k="${k}" rows="5" dir="auto">${esc(f[k] == null ? "" : f[k])}</textarea></label>` : kind === "check" ? `<label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" data-k="${k}" ${f[k] ? "checked" : ""}> <span>${l}</span></label>` : kind === "sel" ? `<label class="f"><span>${l}</span><select data-k="${k}">${opts.map(([v, x]) => `<option value="${v}" ${String(f[k]) === v ? "selected" : ""}>${x}</option>`).join("")}</select></label>` : `<label class="f"><span>${l}</span><input type="text" data-k="${k}" value="${esc(f[k] == null ? "" : f[k])}" dir="auto"></label>`).join(""); };
  fillF(); $("#qt", s).onchange = (e) => { t = e.target.value; const keep = { q: $("#qq", s).value, why: $("#qw", s).value, sk: $("#qs", s).value }; Object.keys(q).forEach((k) => !["q", "why", "sk"].includes(k) && delete q[k]); Object.assign(q, keep); fillF(); };
  $("#qx", s).onclick = closeSheet;
  $("#qok", s).onclick = () => { const f = {}; $$("#qf [data-k]", s).forEach((e) => (f[e.dataset.k] = e.type === "checkbox" ? e.checked : e.value)); const nq = fromForm(t, { q: $("#qq", s).value.trim(), why: $("#qw", s).value.trim(), sk: $("#qs", s).value.trim() }, f); const e = qStruct(nq); if (e) { $("#qm", s).textContent = "تحقق من: " + e; return; } if (!nq.sk || !nq.why) { $("#qm", s).textContent = "اكتب المهارة وتوضيح الإجابة"; return; } closeSheet(); done(nq); };
}
function edit(a, reload, draft) {
  const isNew = !a, d = draft ? draft : a ? Object.assign({}, a, { levels: (a.levels || []).slice(), tags: (a.tags || []).slice(), questions: JSON.parse(JSON.stringify(a.questions || [])), link: a.link || { href: "", label: "" } }) : { slug: "q_" + Date.now().toString(36), cat: "early", title: "", icon: "", levels: [], subject: "", skill: "", difficulty: "easy", descr: "", minutes: 3, tags: [], questions: [], link: { href: "", label: "" }, review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v, dir) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}" ${dir ? `dir="${dir}"` : ""}></label>`, O = (arr, v) => arr.map(([k, x]) => `<option value="${k}" ${v === k ? "selected" : ""}>${x}</option>`).join("");
  const s = sheet(`<h2>${isNew ? "اختبار جديد" : "تعديل اختبار"}</h2>${T("qtt", "عنوان الاختبار (عربي)", d.title)}
  <label class="f"><span>المادة (القسم)</span><select id="qcat">${O(CATS, d.cat)}</select></label>${T("qsb", "اسم المادة كما يظهر (مثل: الرياضيات)", d.subject)}${T("qsk", "المهارة (مثل: الجمع والطرح)", d.skill)}
  <label class="f"><span>وصف مختصر</span><textarea id="qde" rows="2" dir="auto">${esc(d.descr)}</textarea></label>
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف المناسب</p><div class="chips" id="qlv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  <label class="f"><span>مستوى الصعوبة</span><select id="qdf">${O(DIFFS, d.difficulty)}</select></label>${T("qmn", "المدة المقترحة بالدقائق (غير إلزامية)", d.minutes)}
  ${T("qic", "الرسمة (اسم ملف من images/zad بدون الامتداد)", d.icon, "ltr")}<div id="qpi" style="margin:6px 0"></div>
  <p style="margin:12px 2px 4px;font-weight:700">وسوم المسابقات</p><div class="chips" id="qtg">${TAGS.map((k) => `<button type="button" class="chip ${d.tags.includes(k) ? "on" : ""}" data-t="${k}">${k}</button>`).join("")}</div><p class="mut">letters تحدي الحروف · numbers الأرقام · pictures الصور · vocab المفردات · science العلوم · memory الذاكرة · discover اكتشاف الإجابة · review مراجعة الدرس · tashkeel يسمح بالتشكيل في هذا الاختبار</p>
  ${T("qlh", "رابط الدرس أو النشاط داخل المنصة (مثل language/ أو dict/?t=colors)", d.link.href, "ltr")}${T("qll", "نص زر الدرس", d.link.label)}
  <p style="margin:12px 2px 4px;font-weight:700">الأسئلة (<span id="qcn"></span>)</p><div id="qql"></div><div class="row"><button class="btn g" id="qaq">➕ إضافة سؤال</button></div>
  <label class="f"><span>ملاحظة المراجعة (تلزم قبل النشر)</span><textarea id="qrv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="qrc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ الأسئلة والإجابات وأؤكد صحتها وملاءمتها للعمر والصف</span></label>
  <label class="f"><span>حالة النشر</span><select id="qst">${O(ST, d.status)}</select></label>${T("qso", "ترتيب الظهور", d.sort_order)}
  <p id="qmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p><p id="qchk" class="mut"></p>
  <div class="row"><button class="btn" id="qsv">حفظ</button><button class="btn g" id="qpv">معاينة الاختبار</button><button class="btn g" id="qdp">فحص الصور والرابط</button></div>
  <div class="row"><button class="btn g" id="qx">إغلاق</button>${isNew ? "" : `<button class="btn g" id="qdel" style="color:var(--no)">🗑 حذف</button>`}</div>`);
  $("#qx", s).onclick = closeSheet;
  const showIc = () => { const v = $("#qic", s).value.trim(); $("#qpi", s).innerHTML = v ? `<img src="${esc(IC(v))}" alt="" width="64" height="64" style="object-fit:contain" onerror="this.outerHTML='<span class=mut>الصورة غير موجودة</span>'">` : ""; }; showIc(); $("#qic", s).oninput = showIc;
  $$("#qlv [data-l]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); }));
  $$("#qtg [data-t]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.t, i = d.tags.indexOf(k); if (i < 0) d.tags.push(k); else d.tags.splice(i, 1); b.classList.toggle("on", i < 0); }));
  const qlist = () => { $("#qcn", s).textContent = d.questions.length; $("#qql", s).innerHTML = d.questions.map((q, i) => `<div class="item" data-q="${i}"><div class="tx"><b>${i + 1}. ${esc(String(q.q).slice(0, 60))}</b><small>${esc(TN[q.t] || q.t)} · ${esc(q.sk || "")}</small></div><div style="display:flex;gap:4px"><button class="chip" data-up="${i}" aria-label="للأعلى">↑</button><button class="chip" data-dn="${i}" aria-label="للأسفل">↓</button><button class="chip" data-rm="${i}" aria-label="حذف السؤال">✕</button></div></div>`).join("") || `<p class="mut">لا أسئلة بعد.</p>`;
    $$("#qql [data-q]", s).forEach((b) => (b.onclick = (e) => { if (e.target.closest("[data-up],[data-dn],[data-rm]")) return; const i = +b.dataset.q; editQuestion(d.questions[i], (nq) => { d.questions[i] = nq; reopen(); }); }));
    $$("#qql [data-up]", s).forEach((b) => (b.onclick = () => { const i = +b.dataset.up; if (i > 0) { [d.questions[i - 1], d.questions[i]] = [d.questions[i], d.questions[i - 1]]; qlist(); } }));
    $$("#qql [data-dn]", s).forEach((b) => (b.onclick = () => { const i = +b.dataset.dn; if (i < d.questions.length - 1) { [d.questions[i + 1], d.questions[i]] = [d.questions[i], d.questions[i + 1]]; qlist(); } }));
    $$("#qql [data-rm]", s).forEach((b) => (b.onclick = () => { if (confirm("حذف هذا السؤال من الاختبار؟")) { d.questions.splice(+b.dataset.rm, 1); qlist(); } })); };
  const reopen = () => { collect(); edit2(d, isNew, reload); };
  const collect = () => { d.title = $("#qtt", s).value.trim(); d.cat = $("#qcat", s).value; d.subject = $("#qsb", s).value.trim(); d.skill = $("#qsk", s).value.trim(); d.descr = $("#qde", s).value.trim(); d.difficulty = $("#qdf", s).value; d.minutes = parseInt($("#qmn", s).value, 10) || 3; d.icon = $("#qic", s).value.trim(); d.link = { href: $("#qlh", s).value.trim(), label: $("#qll", s).value.trim() }; d.review_note = $("#qrv", s).value.trim(); d.reviewed = $("#qrc", s).checked; d.status = $("#qst", s).value; d.sort_order = parseInt($("#qso", s).value, 10) || 0; };
  qlist(); $("#qaq", s).onclick = () => { collect(); editQuestion(null, (nq) => { d.questions.push(nq); edit2(d, isNew, reload); }); };
  $("#qpv", s).onclick = () => { collect(); if (!d.questions.length) { $("#qmiss", s).textContent = "أضف سؤالا أولا"; return; } preview(d, d.levels[0] || "a5"); };
  $("#qdp", s).onclick = async () => { collect(); const o = $("#qchk", s); o.textContent = "جاري الفحص…"; const bad = await deep(d); o.textContent = bad.length ? "لا يعمل: " + bad.join("، ") : "كل الصور ورابط الدرس تعمل."; };
  $("#qsv", s).onclick = async () => {
    collect(); if (!d.title) { $("#qmiss", s).textContent = "اكتب عنوان الاختبار"; return; }
    if (d.status === "published") { const miss = check(d); if (miss.length) { $("#qmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.slice(0, 6).join("، "); return; } const bad = await deep(d); if (bad.length) { $("#qmiss", s).textContent = "لا يمكن النشر: " + bad.join("، "); return; } }
    $("#qmiss", s).textContent = ""; $("#qsv", s).disabled = true;
    try { const row = { slug: d.slug, cat: d.cat, title: d.title, icon: d.icon || "i_puzzle", levels: d.levels, subject: d.subject, skill: d.skill, difficulty: d.difficulty, descr: d.descr, minutes: d.minutes, tags: d.tags, questions: d.questions, link: d.link, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("qz_quizzes").insert(row) : await sb.from("qz_quizzes").update(row).eq("id", d.id); if (r.error) throw r.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { $("#qsv", s).disabled = false; fail(e); }
  };
  const del = $("#qdel", s); if (del) del.onclick = async () => { if (!confirm("حذف هذا الاختبار نهائيا؟ لا يمكن التراجع. (للإخفاء فقط اختر حالة «مخفي»)")) return; try { const r = await sb.from("qz_quizzes").delete().eq("id", d.id); if (r.error) throw r.error; toast("تم الحذف"); closeSheet(); reload(); } catch (e) { fail(e); } };
  edit._reload = reload;
}
function edit2(d, isNew, reload) { closeSheet(); edit(isNew ? null : { id: d.id }, reload, d); }
window.__qzTest = { check, qStruct, fromForm, toForm, TYPES };
})();
