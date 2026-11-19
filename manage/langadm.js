/* إدارة المحتوى اللغوي (جمل، قراءة، متقابلات، اكتشف المختلف، كتابة) — داخل لوحة زاد المحمية. لا نشر قبل المراجعة. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const LANGS = [["ar", "العربية"], ["en", "الإنجليزية"]];
const KINDS = [["order", "ترتيب كلمات الجملة"], ["fill", "اختر الكلمة المناسبة"], ["passage", "نص قراءة وأسئلة فهم"], ["opp", "كلمات متقابلة"], ["odd", "اكتشف الكلمة المختلفة"], ["write", "كتابة جملة من كلمات"], ["story", "قصة مصورة بمفردات وأسئلة"]];
const LEVELS = [["a3", "٣ سنوات"], ["a4", "٤ سنوات"], ["a5", "٥ سنوات"], ["a6", "٦ سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const ST = [["draft", "مسودة"], ["published", "منشور"], ["unpublished", "غير منشور"]];
const KN = Object.fromEntries(KINDS), SN = Object.fromEntries(ST), LN = Object.fromEntries(LANGS);
const CATK = { order: "sentences", fill: "fill", passage: "reading", opp: "opposites", odd: "odd", write: "writing", story: "stories" };
const IC = (c) => `../images/zad/${c}.webp`;
const lines = (t) => String(t).split("\n").map((l) => l.trim()).filter(Boolean);
const AR_RE = /^[ء-ي٠-٩\s.،؟!:\-0-9]+$/, EN_RE = /^[A-Za-z0-9\s.,?!'\-]+$/;
const EX = {
  order: '{"words":["أنا","أحب","أمي"]}',
  fill: '{"s":"نشرب ___ عندما نعطش.","o":["الماء","الكتاب","الحذاء"],"a":0}',
  passage: '{"text":"...","vocab":[["كلمة","معناها"]],"qs":[{"q":"سؤال؟","o":["الصحيح","خطأ","خطأ"],"a":0}],"events":["حدث أول","حدث ثان","حدث ثالث"]}',
  opp: '{"pairs":[["كبير","صغير"],["طويل","قصير"],["حار","بارد"],["فوق","تحت"],["نهار","ليل"]]}',
  odd: '{"qs":[{"items":["أسد","قطة","تفاحة","حصان"],"a":2,"why":"التفاحة فاكهة"}]}',
  story: '{"pages":[{"t":"جملة الصفحة الأولى.","img":"1f431"},{"t":"جملة الصفحة الثانية.","img":"1f431"},{"t":"جملة الصفحة الثالثة.","img":"1f431"}],"vocab":[["كلمة","معناها"]],"qs":[{"q":"سؤال؟","o":["الصحيح","خطأ","خطأ"],"a":0}],"events":["حدث أول","حدث ثان","حدث ثالث"]}',
  write: '{"prompt":"اكتب جملة فيها الكلمات التالية","words":["القط","يشرب"]}',
};
/* فحص بنية البيانات قبل الحفظ أو النشر: يعيد قائمة أخطاء */
function checkData(d, kind, lang) {
  const e = [], RE = lang === "ar" ? AR_RE : EN_RE, ch = (t, w) => { if (!RE.test(String(t).trim())) e.push(`«${String(t).slice(0, 24)}» فيها حروف لا تناسب لغة ${LN[lang]}${w || ""}`); };
  if (!d || typeof d !== "object") return ["البيانات ليست JSON صحيحًا"];
  const opts = (o, a, w) => { if (!Array.isArray(o) || o.length < 3) e.push("ثلاثة خيارات على الأقل" + w); else { if (new Set(o).size !== o.length) e.push("خيارات مكررة" + w); if (!(a >= 0 && a < o.length)) e.push("رقم الإجابة الصحيحة خارج الخيارات" + w); o.forEach((x) => ch(x)); } };
  if (kind === "order") { if (!Array.isArray(d.words) || d.words.length < 3 || new Set(d.words).size !== d.words.length) e.push("ثلاث كلمات مختلفة على الأقل بالترتيب الصحيح"); else d.words.forEach((x) => ch(x)); }
  else if (kind === "fill") { if (!d.s || String(d.s).split("___").length !== 2) e.push("الجملة تحتوي فراغًا واحدًا ___"); else ch(String(d.s).replace("___", lang === "ar" ? "ـ" : "x")); opts(d.o, d.a, ""); }
  else if (kind === "passage") { if (!d.text) e.push("النص ناقص"); else ch(d.text); if (!Array.isArray(d.qs) || d.qs.length < 2) e.push("سؤالان على الأقل"); else d.qs.forEach((q, i) => { ch(q.q, " (سؤال " + (i + 1) + ")"); opts(q.o, q.a, " (سؤال " + (i + 1) + ")"); }); if (d.events && (!Array.isArray(d.events) || d.events.length < 3)) e.push("ترتيب الأحداث يحتاج ثلاثة أحداث"); }
  else if (kind === "opp") { if (!Array.isArray(d.pairs) || d.pairs.length < 5) e.push("خمسة أزواج متقابلة على الأقل"); else { const all = d.pairs.flat(); if (new Set(all).size !== all.length) e.push("كلمات مكررة بين الأزواج"); all.forEach((x) => ch(x)); } }
  else if (kind === "odd") { if (!Array.isArray(d.qs) || !d.qs.length) e.push("سؤال واحد على الأقل"); else d.qs.forEach((q, i) => { if (!Array.isArray(q.items) || q.items.length !== 4 || new Set(q.items).size !== 4) e.push("أربع كلمات مختلفة في السؤال " + (i + 1)); else { q.items.forEach((x) => ch(x)); if (!(q.a >= 0 && q.a < 4)) e.push("إجابة السؤال " + (i + 1)); } }); }
  else if (kind === "story") { if (!Array.isArray(d.pages) || d.pages.length < 3 || d.pages.length > 6) e.push("القصة من ثلاث صفحات إلى ست"); else d.pages.forEach((p, i) => { ch(p.t || "", " (صفحة " + (i + 1) + ")"); if (!p.img || !/^[0-9a-z_-]+$/i.test(p.img)) e.push("رمز صورة الصفحة " + (i + 1)); }); if (!Array.isArray(d.qs) || d.qs.length < 3) e.push("ثلاثة أسئلة فهم على الأقل"); else d.qs.forEach((q, i) => { ch(q.q, " (سؤال " + (i + 1) + ")"); opts(q.o, q.a, " (سؤال " + (i + 1) + ")"); }); if (!Array.isArray(d.vocab) || !d.vocab.length) e.push("مفردة واحدة على الأقل مع معناها"); if (d.events && (!Array.isArray(d.events) || d.events.length < 3)) e.push("ترتيب الأحداث يحتاج ثلاثة أحداث"); }
  else if (kind === "write") { if (!d.prompt) e.push("نص التعليمات ناقص"); if (!Array.isArray(d.words) || d.words.length < 2) e.push("كلمتان على الأقل"); else d.words.forEach((x) => ch(x)); }
  return e;
}
const readiness = (d) => { const m = []; if (!d.title) m.push("العنوان"); if (!(d.levels || []).length) m.push("العمر أو الصف"); if (!d.skill) m.push("المهارة"); if (!d.reviewed) m.push("تأكيد المراجعة"); if (!d.review_note) m.push("ملاحظة المراجعة"); return m.concat(checkData(d.data, d.kind, d.lang)); };
let ALL = [], FS = "", FL = "", FK = "", FQ = "";
async function load() { const r = await sb.from("lang_items").select("*").order("lang").order("sort_order").limit(1000); if (r.error) throw r.error; ALL = r.data || []; }
SUB.langadm = { title: "إدارة المحتوى اللغوي", fn: async function view(m) {
  await load(); const n = (s) => ALL.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>الكل</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div></div>
  <p class="mut">البطاقات والكلمات المصورة والصوت تُدار من «إدارة البطاقات». هنا الجمل والنصوص والتدريبات اللغوية.</p>
  <div class="row"><button class="btn" id="ln">➕ محتوى جديد</button></div>
  <input type="search" id="lqs" placeholder="بحث بالعنوان" value="${esc(FQ)}" style="width:100%;margin-top:8px">
  <div class="chips" id="lch" style="margin-top:8px"></div><div class="chips" id="llc" style="margin-top:6px"></div><div class="chips" id="lkc" style="margin-top:6px"></div><div id="lls"></div>`;
  const draw = () => {
    $("#lch").innerHTML = [["", `الكل (${ALL.length})`], ...ST.map((s) => [s[0], `${s[1]} (${n(s[0])})`])].map(([k, l]) => `<button class="chip ${FS === k ? "on" : ""}" data-s="${k}">${l}</button>`).join("");
    $("#llc").innerHTML = [["", "كل اللغات"], ...LANGS].map(([k, l]) => `<button class="chip ${FL === k ? "on" : ""}" data-l="${k}">${l}</button>`).join("");
    $("#lkc").innerHTML = [["", "كل الأنواع"], ...KINDS].map(([k, l]) => `<button class="chip ${FK === k ? "on" : ""}" data-k="${k}">${l}</button>`).join("");
    const q = FQ.toLowerCase(), list = ALL.filter((x) => (!FS || x.status === FS) && (!FL || x.lang === FL) && (!FK || x.kind === FK) && (!q || x.title.toLowerCase().includes(q)));
    $("#lls").innerHTML = list.length ? list.map((x) => { const ms = readiness(x); return `<div class="item" data-i="${x.id}"><img loading="lazy" src="${esc(IC(x.icon || "i_pencil"))}" alt="" style="object-fit:contain"><div class="tx"><b>${esc(x.title)}</b><small>${esc(LN[x.lang])} · ${esc(KN[x.kind])} · ${esc(SN[x.status])}${ms.length ? " · ناقص: " + esc(ms[0]) : ""}</small></div></div>`; }).join("") : `<p class="mut">لا يوجد محتوى.</p>`;
    $$("#lch [data-s]").forEach((b) => b.onclick = () => { FS = b.dataset.s; draw(); });
    $$("#llc [data-l]").forEach((b) => b.onclick = () => { FL = b.dataset.l; draw(); });
    $$("#lkc [data-k]").forEach((b) => b.onclick = () => { FK = b.dataset.k; draw(); });
    $$("#lls [data-i]").forEach((b) => b.onclick = () => edit(ALL.find((x) => x.id === b.dataset.i), () => view(m)));
  };
  draw(); $("#lqs").oninput = (e) => { FQ = e.target.value; draw(); }; $("#ln").onclick = () => edit(null, () => view(m));
} };
function edit(a, reload) {
  const isNew = !a;
  const d = a ? Object.assign({}, a, { levels: (a.levels || []).slice() }) : { slug: "lg-" + Date.now().toString(36), lang: "ar", kind: "order", cat: "sentences", title: "", icon: "", levels: [], skill: "", data: JSON.parse(EX.order), review_note: "", reviewed: false, status: "draft", sort_order: 900 };
  const T = (id, l, v) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}"></label>`;
  const TA = (id, l, v, r) => `<label class="f"><span>${l}</span><textarea id="${id}" rows="${r}" dir="ltr" style="font-family:monospace">${esc(v)}</textarea></label>`;
  const SEL = (id, l, o, v) => `<label class="f"><span>${l}</span><select id="${id}">${o.map(([k, x]) => `<option value="${k}" ${String(v) === String(k) ? "selected" : ""}>${x}</option>`).join("")}</select></label>`;
  const s = sheet(`<h2>${isNew ? "محتوى لغوي جديد" : "تعديل المحتوى"}</h2>
  <p class="mut">الصق بنية البيانات بصيغة JSON حسب النوع. يفحص النظام التهجئة الأساسية (أحرف اللغة) والإجابات الصحيحة قبل الحفظ، ولا يُنشر قبل تأكيد المراجعة. لا تترجم حرفيًا، ولا تضع كلمة بلا مراجعة نطقها.</p>
  ${T("lt", "العنوان", d.title)}${SEL("ll", "اللغة", LANGS, d.lang)}${SEL("lk", "النوع", KINDS, d.kind)}
  <p style="margin:12px 2px 4px;font-weight:700">العمر أو الصف</p><div class="chips" id="llv">${LEVELS.map(([k, l]) => `<button type="button" class="chip ${d.levels.includes(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  ${T("lic", "رمز الرسمة الكرتونية (اسم ملف من images/zad بدون الامتداد)", d.icon)}${T("lsk", "المهارة اللغوية", d.skill)}
  ${TA("ld", "البيانات (JSON) — يتغير القالب عند تغيير النوع إن كانت البيانات فارغة", JSON.stringify(d.data, null, 1), 12)}<button type="button" class="btn g" id="lex">إدراج مثال لهذا النوع</button>
  <label class="f"><span>ملاحظة المراجعة (من راجع التهجئة والمعنى وكيف؛ تلزم قبل النشر)</span><textarea id="lrv" rows="2" dir="auto">${esc(d.review_note || "")}</textarea></label>
  <label class="f" style="flex-direction:row;gap:8px;align-items:center"><input type="checkbox" id="lrc" ${d.reviewed ? "checked" : ""}> <span>راجعتُ الكلمات والتهجئة والمعنى وأؤكد ملاءمة المحتوى للفئة العمرية</span></label>
  ${SEL("lst", "حالة النشر", ST, d.status)}
  <p id="lmiss" style="color:var(--no);font-weight:700;margin:6px 0"></p>
  <div class="row"><button class="btn" id="lsv">حفظ</button><button class="btn g" id="lpv">معاينة</button></div><div class="row"><button class="btn g" id="lx">إغلاق</button></div>`);
  $("#lx", s).onclick = closeSheet;
  $$("#llv [data-l]", s).forEach((b) => b.onclick = () => { const k = b.dataset.l, i = d.levels.indexOf(k); if (i < 0) d.levels.push(k); else d.levels.splice(i, 1); b.classList.toggle("on", i < 0); });
  $("#lex", s).onclick = () => { $("#ld", s).value = JSON.stringify(JSON.parse(EX[$("#lk", s).value]), null, 1); };
  const collect = () => {
    d.title = $("#lt", s).value.trim(); d.lang = $("#ll", s).value; d.kind = $("#lk", s).value; d.cat = CATK[d.kind]; d.icon = $("#lic", s).value.trim() || null; d.skill = $("#lsk", s).value.trim();
    d.review_note = $("#lrv", s).value.trim(); d.reviewed = $("#lrc", s).checked; d.status = $("#lst", s).value;
    try { d.data = JSON.parse($("#ld", s).value); } catch { throw new Error("صيغة JSON للبيانات غير صحيحة"); }
  };
  $("#lpv", s).onclick = () => { try { collect(); } catch (x) { $("#lmiss", s).textContent = x.message; return; } const er = checkData(d.data, d.kind, d.lang); const o = document.createElement("div"); o.className = "ov"; o.style.zIndex = 99; o.innerHTML = `<div class="sheet"><h2>معاينة</h2><div style="border:3px solid #7c4dff;border-radius:22px;padding:10px"><b>${esc(d.title)}</b><p>${esc(LN[d.lang])} · ${esc(KN[d.kind])}</p><pre dir="ltr" style="white-space:pre-wrap;font-size:12px">${esc(JSON.stringify(d.data, null, 1))}</pre></div>${er.length ? `<p style="color:var(--no);font-weight:700">أخطاء: ${esc(er.join("؛ "))}</p>` : `<p style="color:#1f7a3a;font-weight:700">البنية سليمة</p>`}<div class="row"><button class="btn g" id="lpx">إغلاق المعاينة</button></div></div>`; document.body.appendChild(o); $("#lpx", o).onclick = () => o.remove(); };
  $("#lsv", s).onclick = async () => {
    try { collect(); } catch (x) { $("#lmiss", s).textContent = x.message; return; }
    if (!d.title) { $("#lmiss", s).textContent = "اكتب العنوان"; return; }
    if (d.status === "published") { const miss = readiness(d); if (miss.length) { $("#lmiss", s).textContent = "لا يمكن النشر قبل اكتمال: " + miss.join("، "); return; } }
    $("#lmiss", s).textContent = ""; $("#lsv", s).disabled = true;
    try {
      const row = { slug: d.slug, lang: d.lang, kind: d.kind, cat: d.cat, title: d.title, icon: d.icon, levels: d.levels, skill: d.skill, data: d.data, review_note: d.review_note, reviewed: d.reviewed, status: d.status, sort_order: d.sort_order };
      const r = isNew ? await sb.from("lang_items").insert(row) : await sb.from("lang_items").update(row).eq("id", d.id);
      if (r.error) throw r.error;
      toast(d.status === "published" ? "تم الحفظ والنشر" : "تم الحفظ"); closeSheet(); reload();
    } catch (x) { fail(x); $("#lsv", s).disabled = false; }
  };
}
})();
