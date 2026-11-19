/* بنك الأسئلة المركزي + اختبارات البنك — داخل لوحة زاد المحمية */
(function () {
"use strict";
const Z = window.__zp; if (!Z || !Z.QH) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, ask, SUB } = Z;
const { mediaField, itemRow, readItem, mfVal, bindMedia, qCheck, QT, QTD, QMAX, qClean } = Z.QH;
const GR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
const SJ = { ar: "اللغة العربية", math: "الرياضيات", en: "اللغة الإنجليزية", sci: "العلوم", isl: "التربية الإسلامية", life: "المهارات الحياتية" };
const DF = { 1: "سهل", 2: "متوسط", 3: "متقدم" };
const SM = { "": "غير محدد", 1: "الفصل الأول", 2: "الفصل الثاني" };
const ST = { draft: "مسودة", published: "منشور", unpublished: "غير منشور" };
const SC = { lesson: "درس واحد", unit: "مراجعة وحدة", semester: "مراجعة فصل", subject: "شامل للمادة", practice: "تدريب قصير" };
const KD = { basic: "تقييم بسيط", practice: "تقييم تدريبي", full: "تقييم شامل" };
const norm = (t) => String(t || "").replace(/[\u064B-\u065F\u0670]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const failx = (e) => { console.error(e); toast(e && e.message && /[\u0600-\u06FF]/.test(e.message) ? e.message : "تعذّر الحفظ. تأكد من الإنترنت وحاول مرة ثانية"); };
const opts = (o, cur) => Object.entries(o).map(([k, l]) => `<option value="${esc(k)}"${String(cur ?? "") === String(k) ? " selected" : ""}>${esc(l)}</option>`).join("");
const dl = (id, a) => `<datalist id="${id}">${[...new Set(a.filter(Boolean))].map((x) => `<option value="${esc(x)}">`).join("")}</datalist>`;
let BQ = [], BF = { g: "", s: "", st: "", q: "" };
const loadBank = async () => { const { data, error } = await sb.from("qbank").select("*").order("created_at", { ascending: false }).limit(5000); if (error) throw error; BQ = data || []; };
const qText = (x) => qClean(x.body && x.body.q || "").slice(0, 90) || "بدون نص";

const bankQSheet = (orig, idx, C) => {
  const E = JSON.parse(JSON.stringify(orig)), ps = {};
  const s = sheet(`<h2>${idx < 0 ? "سؤال جديد" : "تعديل السؤال"}: ${QT[E.t]}</h2>
    <label class="f"><span>نص السؤال</span><textarea id="eq1" style="min-height:70px">${esc(E.q || "")}</textarea><small>${E.t === "fill" ? "ضع __ (شرطتين) مكان الفراغ. " : ""}للمعادلات الرياضية اكتبها كما هي، مثل 5 + 3 = ؟</small></label>
    <label class="f"><span>صورة السؤال (اختياري)</span>${mediaField("img", E.img || "")}</label>
    <div id="etype"></div>
    <label class="f"><span>الشرح بعد الإجابة</span><textarea id="eex" style="min-height:60px">${esc(qClean(E.ex || ""))}</textarea><small>جملة بسيطة تشرح الإجابة الصحيحة بلطف.</small></label>
    <label class="f"><span>المهارة</span><input type="text" id="esk" value="${esc(E.sk || "")}"></label>
    <details class="qz-adv"><summary>الصوت وخيارات إضافية</summary>
      <label class="f"><span>ما يقوله زوزو (اختياري)</span><input type="text" id="esay" value="${esc(E.say || "")}"><small>إن تركته فارغًا يقرأ زوزو نص السؤال.</small></label>
      <label class="f"><span>تسجيل صوتي للسؤال (اختياري)</span>${mediaField("snd", E.snd || "")}</label>
      <div class="sw"><span>سؤال استماع<br><small class="mut">يسمع الطفل السؤال ويختار، مناسب للصغار.</small></span><input type="checkbox" id="elis"${E.listen ? " checked" : ""}></div>
      <label class="f"><span>تلميح (اختياري)</span><input type="text" id="ehint" value="${esc(E.hint || "")}"></label>
      ${Object.keys(ps).length ? `<label class="f"><span>نص القراءة المرتبط</span><select id="epsg"><option value="">بدون</option>${Object.entries(ps).map(([k, g]) => `<option value="${esc(k)}"${E.psg === k ? " selected" : ""}>${esc(g.t || k)}</option>`).join("")}</select></label>` : ""}
      <label class="f"><span>صور للحفظ ثم الإخفاء (اختياري)</span><input type="text" id="ememo" dir="ltr" value="${esc(Array.isArray(E.memo) ? E.memo.join(" | ") : "")}" placeholder="رموز صور مفصولة بـ |"><small>لأسئلة الذاكرة: تظهر الصور ثم تختفي قبل السؤال.</small></label>
    </details>
    ${C.extra(E)}
    <p class="qz-err" id="eerr" role="alert"></p>
    <button class="btn" id="esv">حفظ السؤال</button>${idx >= 0 ? `<button class="btn red" id="edl" style="margin-top:10px">حذف السؤال</button>` : ""}`);
  const T = $("#etype", s);
  const radio = (k, on) => `<label class="qz-ok"><input type="radio" name="ea" value="${k}"${on ? " checked" : ""}><span>صحيح</span></label>`;
  const syncT = () => {
    if (E.t === "mc" || E.t === "fill") { const rows = $$("[data-l=o] > .qz-it", T); E.o = rows.map(readItem); const c = $("input[name=ea]:checked", T); E.a = c ? rows.indexOf(c.closest(".qz-it")) : -1; }
    else if (E.t === "tf") { E.a = $("input[name=ea]:checked", T)?.value === "1"; }
    else if (E.t === "num") { const v = $("#ena", T).value.trim(); E.a = /^\d+$/.test(v) ? parseInt(v, 10) : NaN; const q2 = $("#eeqn", T).value.trim(); if (q2) E.eq = q2; else delete E.eq; }
    else if (E.t === "order") { E.o = $$("[data-l=o] > .qz-it", T).map(readItem); if ($("#edir", T).checked) E.dir = "ltr"; else delete E.dir; }
    else if (E.t === "sort") { E.b = $$("[data-l=b] > .qz-it", T).map(readItem); E.o = $$("[data-l=o] > .qz-it", T).map((r) => { const v = readItem(r), o = typeof v === "object" ? v : { x: v }; o.b = +$("select", r).value; return o; }); }
    else if (E.t === "match") { E.p = $$("[data-l=p] > .qz-it", T).map((r) => $$(".qz-side", r).map(readItem)); }
  };
  const drawT = () => {
    let h = "";
    if (E.t === "mc" || E.t === "fill") h = `<h4>الخيارات <small class="mut">اختر الصحيح بالدائرة</small></h4><div data-l="o">${E.o.map((v, k) => itemRow(v, radio(k, E.a === k))).join("")}</div>${E.o.length < QMAX.o ? `<button class="btn sm g" data-add="o">+ خيار</button>` : ""}`;
    else if (E.t === "tf") h = `<h4>الإجابة الصحيحة</h4><div class="row"><label class="qz-ok big"><input type="radio" name="ea" value="1"${E.a === true ? " checked" : ""}><span>صح</span></label><label class="qz-ok big"><input type="radio" name="ea" value="0"${E.a === false ? " checked" : ""}><span>خطأ</span></label></div>`;
    else if (E.t === "num") h = `<label class="f"><span>الإجابة الصحيحة (عدد)</span><input type="text" id="ena" inputmode="numeric" dir="ltr" value="${Number.isInteger(E.a) ? E.a : ""}"></label><label class="f"><span>المعادلة الظاهرة (اختياري)</span><input type="text" id="eeqn" dir="ltr" value="${esc(qClean(E.eq || ""))}" placeholder="5 + 1 = ؟"></label>`;
    else if (E.t === "order") h = `<h4>العناصر بالترتيب الصحيح <small class="mut">تُخلط للطفل تلقائيًا</small></h4><div data-l="o">${E.o.map((v) => itemRow(v)).join("")}</div>${E.o.length < QMAX.order ? `<button class="btn sm g" data-add="o">+ عنصر</button>` : ""}<div class="sw"><span>ترتيب من اليسار إلى اليمين<br><small class="mut">للأعداد والمعادلات</small></span><input type="checkbox" id="edir"${E.dir === "ltr" ? " checked" : ""}></div>`;
    else if (E.t === "sort") h = `<h4>المجموعات</h4><div data-l="b">${E.b.map((v) => itemRow(v)).join("")}</div>${E.b.length < QMAX.b ? `<button class="btn sm g" data-add="b">+ مجموعة</button>` : ""}<h4>العناصر ومجموعة كل عنصر</h4><div data-l="o">${E.o.map((v) => itemRow(v, "", `<label class="qz-bin"><span>المجموعة:</span><select>${E.b.map((g, k) => `<option value="${k}"${v.b === k ? " selected" : ""}>${esc(qHas(g) ? (typeof g === "object" ? g.x || "مجموعة " + (k + 1) : g) : "مجموعة " + (k + 1))}</option>`).join("")}</select></label>`)).join("")}</div>${E.o.length < QMAX.sort ? `<button class="btn sm g" data-add="o">+ عنصر</button>` : ""}`;
    else if (E.t === "match") h = `<h4>الأزواج <small class="mut">يوصل الطفل الطرف الأول بالثاني</small></h4><div data-l="p">${E.p.map((r) => `<div class="qz-it qz-pair"><div class="qz-r1"><b class="mut">زوج</b><button type="button" class="chip qz-rm">حذف</button></div><div class="qz-side"><input type="text" class="qx" value="${esc(r[0] && typeof r[0] === "object" ? r[0].x ?? "" : r[0] ?? "")}" placeholder="الطرف الأول">${mediaField("img", r[0] && r[0].i || "")}</div><div class="qz-side"><input type="text" class="qx" value="${esc(r[1] && typeof r[1] === "object" ? r[1].x ?? "" : r[1] ?? "")}" placeholder="الطرف الثاني">${mediaField("img", r[1] && r[1].i || "")}</div></div>`).join("")}</div>${E.p.length < QMAX.p ? `<button class="btn sm g" data-add="p">+ زوج</button>` : ""}`;
    T.innerHTML = h; bindMedia(T);
    $$("[data-add]", T).forEach((b) => b.onclick = () => { syncT(); const l = b.dataset.add; if (E.t === "sort" && l === "o") E.o.push({ x: "", b: 0 }); else if (l === "p") E.p.push(["", ""]); else E[l].push(""); drawT(); });
    $$(".qz-rm", T).forEach((b) => b.onclick = () => {
      syncT(); const row = b.closest(".qz-it"), box = row.parentNode, l = box.dataset.l, i = $$(":scope > .qz-it", box).indexOf(row), arr = E[l];
      if (arr.length <= 2) return toast("يلزم عنصران على الأقل");
      arr.splice(i, 1);
      if ((E.t === "mc" || E.t === "fill") && l === "o") E.a = E.a === i ? -1 : E.a > i ? E.a - 1 : E.a;
      if (E.t === "sort" && l === "b") E.o.forEach((o) => { if (o.b === i) o.b = 0; else if (o.b > i) o.b--; });
      drawT();
    });
  };
  drawT(); bindMedia(s);
  $("#esv", s).onclick = () => {
    syncT();
    const set = (k, v) => { if (v === "" || v == null || (Array.isArray(v) && !v.length)) delete E[k]; else E[k] = v; };
    E.q = $("#eq1", s).value.trim(); set("img", mfVal($("label.f [data-mf]", s))); set("ex", $("#eex", s).value.trim()); set("sk", $("#esk", s).value.trim());
    set("say", $("#esay", s).value.trim()); set("snd", String(mfVal($(".qz-adv [data-mf]", s)) || "")); set("hint", $("#ehint", s).value.trim());
    if ($("#elis", s).checked) E.listen = 1; else delete E.listen;
    const pg = $("#epsg", s); if (pg) set("psg", pg.value);
    const mm = $("#ememo", s).value.split("|").map((x) => x.trim()).filter(Boolean); set("memo", mm);
    if (!E.memo) delete E.memoTx;
    const err = qCheck(E, {}) || C.collect(E, s); if (err) { $("#eerr", s).textContent = err; return; }
    C.save(E, s);
  };
  const d = $("#edl", s); if (d) d.onclick = () => C.del && C.del();
};

const typeDefs = { mc: { o: ["", ""], a: 0 }, tf: { a: true }, num: { a: 0 }, order: { o: ["", ""] }, fill: { o: ["", ""], a: 0 }, sort: { b: ["", ""], o: [{ x: "", b: 0 }, { x: "", b: 1 }] }, match: { p: [["", ""], ["", ""]] } };
function editQ(row, done) {
  const isNew = !row;
  const R = row || { qtype: "mc", body: {}, grade: 3, subj: "math", sem: null, unit: "", lesson: "", skill: "", diff: 1, status: "draft", review_note: "" };
  const open = (E) => {
    const pg = E.pg || { t: "", x: "" };
    const same = BQ.filter((x) => x.grade === +R.grade && x.subj === R.subj);
    const C = {
      extra: () => `<div class="card" style="margin-top:10px"><h3>التصنيف</h3>
        <div class="grid2"><label class="f"><span>الصف</span><select id="bxg">${opts(Object.fromEntries(GR.map((g, i) => [i + 1, "الصف " + g])), R.grade)}</select></label><label class="f"><span>المادة</span><select id="bxs">${opts(SJ, R.subj)}</select></label></div>
        <div class="grid2"><label class="f"><span>الفصل</span><select id="bxm">${opts(SM, R.sem ?? "")}</select></label><label class="f"><span>مستوى الصعوبة</span><select id="bxd">${opts(DF, R.diff)}</select></label></div>
        <label class="f"><span>الوحدة</span><input type="text" id="bxu" list="bxul" value="${esc(R.unit)}">${dl("bxul", same.map((x) => x.unit))}</label>
        <label class="f"><span>الدرس</span><input type="text" id="bxl" list="bxll" value="${esc(R.lesson)}">${dl("bxll", same.map((x) => x.lesson))}</label>
        <details class="qz-adv"${pg.x ? " open" : ""}><summary>نص قراءة مرتبط (لأسئلة الفهم والاستيعاب)</summary><label class="f"><span>عنوان النص</span><input type="text" id="bxpt" value="${esc(pg.t || "")}"></label><label class="f"><span>النص</span><textarea id="bxpx" style="min-height:90px">${esc(pg.x || "")}</textarea><small>كل أسئلة هذا النص تكرر النص نفسه ليظهر معها.</small></label></details></div>
        <div class="card"><h3>المراجعة والنشر</h3><label class="f"><span>ملاحظة المراجعة (مطلوبة قبل النشر)</span><textarea id="bxr" style="min-height:56px" placeholder="مثال: راجعتُ الإجابة والخيارات، ولا يوجد جواب آخر صحيح">${esc(R.review_note || "")}</textarea></label><label class="f"><span>الحالة</span><select id="bxst">${opts(ST, R.status)}</select></label><small class="mut">المنشور فقط يظهر للأطفال، ولا يُنشر سؤال ناقص أو بلا شرح.</small></div>`,
      collect: (E, s) => {
        R.grade = +$("#bxg", s).value; R.subj = $("#bxs", s).value; R.sem = $("#bxm", s).value ? +$("#bxm", s).value : null; R.diff = +$("#bxd", s).value;
        R.unit = $("#bxu", s).value.trim(); R.lesson = $("#bxl", s).value.trim(); R.review_note = $("#bxr", s).value.trim(); R.status = $("#bxst", s).value;
        const t = $("#bxpt", s).value.trim(), x = $("#bxpx", s).value.trim(); if (x) E.pg = { t, x }; else delete E.pg;
        if (!E.ex) return "اكتب شرح الإجابة (مطلوب لكل سؤال)";
        if (!E.sk) return "اكتب المهارة المستهدفة";
        if (!R.unit || !R.lesson) return "اكتب الوحدة والدرس";
        if (R.status === "published" && !R.review_note) return "سجّل ملاحظة المراجعة قبل النشر";
        return "";
      },
      save: async (E, s) => {
        const body = Object.assign({}, E); const sk = body.sk; delete body.t; delete body.sk; delete body.id; delete body.tp;
        const rec = { qtype: E.t, body, grade: R.grade, subj: R.subj, sem: R.sem, unit: R.unit, lesson: R.lesson, skill: sk, diff: R.diff, status: R.status, review_note: R.review_note || null };
        const b = $("#esv", s); b.disabled = true;
        const { error } = isNew || !R.id ? await sb.from("qbank").insert(rec) : await sb.from("qbank").update(rec).eq("id", R.id);
        b.disabled = false; if (error) return failx(error);
        closeSheet(); toast("تم حفظ السؤال ✓"); done();
      },
      del: async () => {
        if (!R.id) return closeSheet();
        const u = await sb.from("quizzes").select("title").contains("qids", [R.id]);
        if (u.data && u.data.length) return toast("السؤال مستخدم في اختبار: " + u.data.map((x) => x.title).join("، ") + ". أزله منه أولًا");
        if (!(await ask("حذف هذا السؤال نهائيًا من البنك؟"))) return;
        const { error } = await sb.from("qbank").delete().eq("id", R.id); if (error) return failx(error);
        closeSheet(); toast("حُذف السؤال"); done();
      }
    };
    bankQSheet(E, isNew ? -1 : 0, C);
  };
  if (!isNew) return open(Object.assign({ t: R.qtype, sk: R.skill }, JSON.parse(JSON.stringify(R.body))));
  const s = sheet(`<h2>نوع السؤال</h2><div class="qz-types">${Object.keys(QT).map((t) => `<button data-t="${t}"><b>${QT[t]}</b><small>${QTD[t]}</small></button>`).join("")}</div>`);
  $$("[data-t]", s).forEach((b) => b.onclick = () => { const t = b.dataset.t; open(Object.assign({ t, q: "", sk: "" }, JSON.parse(JSON.stringify(typeDefs[t])))); });
}

SUB.qbank = { title: "بنك الأسئلة", fn: async function view(m) {
  m.innerHTML = `<div class="spin">جاري التحميل…</div>`;
  try { await loadBank(); } catch (e) { m.innerHTML = `<p class="mut">تعذّر تحميل البنك.</p>`; return failx(e); }
  const n = (s) => BQ.filter((x) => x.status === s).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${BQ.length}</b><span>سؤال في البنك</span></div><div class="stat"><b>${n("published")}</b><span>منشور</span></div></div>
  <div class="row"><button class="btn" id="bn">➕ سؤال جديد</button><button class="btn g" id="bt">📋 اختبارات من البنك</button></div>
  <input type="search" id="bq" placeholder="ابحث بنص السؤال أو الوحدة أو الدرس" value="${esc(BF.q)}" style="width:100%;margin-top:8px">
  <div class="chips" id="bcs" style="margin-top:8px"></div><div class="chips" id="bcg" style="margin-top:6px"></div><div class="chips" id="bcp" style="margin-top:6px"></div><div id="bls"></div>`;
  const draw = () => {
    const chips = (id, cur, key, arr) => { $(id).innerHTML = arr.map(([k, l]) => `<button class="chip ${String(cur) === String(k) ? "on" : ""}" data-${key}="${k}">${l}</button>`).join(""); $$(`${id} [data-${key}]`).forEach((b) => b.onclick = () => { BF[key === "st" ? "st" : key] = b.dataset[key]; draw(); }); };
    chips("#bcs", BF.st, "st", [["", `الكل (${BQ.length})`], ...Object.entries(ST).map(([k, l]) => [k, `${l} (${n(k)})`])]);
    chips("#bcg", BF.g, "g", [["", "كل الصفوف"], ...GR.map((g, i) => [String(i + 1), g])]);
    chips("#bcp", BF.s, "s", [["", "كل المواد"], ...Object.entries(SJ)]);
    const q = norm(BF.q), L = BQ.filter((x) => (!BF.st || x.status === BF.st) && (!BF.g || String(x.grade) === BF.g) && (!BF.s || x.subj === BF.s) && (!q || norm(qText(x) + " " + x.unit + " " + x.lesson + " " + x.skill).includes(q)));
    $("#bls").innerHTML = L.length ? `<p class="mut" style="margin:6px 0">${L.length} سؤال</p>` + L.slice(0, 200).map((x) => `<div class="item" data-i="${x.id}"><div class="ph">${x.status === "published" ? "✅" : "📝"}</div><div class="tx"><b>${esc(qText(x))}</b><small>الصف ${GR[x.grade - 1]} · ${SJ[x.subj]} · ${esc(x.unit)} › ${esc(x.lesson)} · ${DF[x.diff]} · ${QT[x.qtype]} · ${ST[x.status]}</small></div></div>`).join("") + (L.length > 200 ? `<p class="mut">يظهر أول 200، استخدم البحث للتضييق.</p>` : "") : `<p class="mut" style="padding:14px 0">لا توجد أسئلة مطابقة.</p>`;
    $$("#bls [data-i]").forEach((e) => e.onclick = () => editQ(BQ.find((x) => x.id === e.dataset.i), () => view(m)));
  };
  draw(); $("#bq").oninput = (e) => { BF.q = e.target.value; draw(); }; $("#bn").onclick = () => editQ(null, () => view(m)); $("#bt").onclick = () => window.__go("qtests");
} };

/* ===== اختبارات من البنك ===== */
let TF = { s: "", g: "" };
SUB.qtests = { title: "اختبارات من البنك", fn: async function view(m) {
  m.innerHTML = `<div class="spin">جاري التحميل…</div>`;
  const r = await sb.from("quizzes").select("id,slug,lv,subj,kind,title,n,is_published,scope,sem,unit,lesson,updated_at").eq("src", "bank").order("updated_at", { ascending: false });
  if (r.error) { m.innerHTML = `<p class="mut">تعذّر التحميل.</p>`; return failx(r.error); }
  const ALL = r.data || [];
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button>
  <div class="grid2" style="margin-top:8px"><div class="stat"><b>${ALL.length}</b><span>اختبار من البنك</span></div><div class="stat"><b>${ALL.filter((x) => x.is_published).length}</b><span>منشور</span></div></div>
  <div class="row"><button class="btn" id="tn">➕ اختبار جديد من البنك</button><button class="btn g" id="tb">❓ بنك الأسئلة</button></div><div id="tl" style="margin-top:8px"></div>
  <p class="mut" style="margin-top:12px">الاختبارات القديمة (المكتوبة يدويًا) تبقى في «الاختبارات والتقييمات».</p>`;
  $("#tl").innerHTML = ALL.length ? ALL.map((x) => `<div class="item" data-i="${x.id}"><div class="ph">${x.is_published ? "✅" : "📝"}</div><div class="tx"><b>${esc(x.title)}</b><small>${esc(SJ[x.subj] || x.subj)} · ${x.lv.startsWith("g") ? "الصف " + GR[+x.lv[1] - 1] : x.lv} · ${SC[x.scope] || ""} · ${x.n} سؤال · ${x.is_published ? "منشور" : "غير منشور"}</small></div></div>`).join("") : `<p class="mut">لم تنشئ اختبارًا من البنك بعد.</p>`;
  $$("#tl [data-i]").forEach((e) => e.onclick = () => editT(e.dataset.i, () => view(m)));
  $("#tn").onclick = () => editT(null, () => view(m)); $("#tb").onclick = () => window.__go("qbank");
} };

async function editT(id, done) {
  if (!BQ.length) try { await loadBank(); } catch (e) { return failx(e); }
  let T = { slug: "", lv: "g3", subj: "math", kind: "basic", title: "", skill: "", diff: 1, intro: "", scope: "lesson", sem: null, unit: "", lesson: "", qids: [], is_published: false, review_note: "", data: {} };
  if (id) { const r = await sb.from("quizzes").select("*").eq("id", id).single(); if (r.error) return failx(r.error); T = r.data; T.qids = T.qids || []; }
  const draw = () => {
    const g = +T.lv.slice(1) || 0, pool = BQ.filter((x) => x.status === "published" && x.grade === g && x.subj === T.subj);
    const scoped = pool.filter((x) => (!["lesson", "unit"].includes(T.scope) || !T.unit || x.unit === T.unit) && (T.scope !== "lesson" || !T.lesson || x.lesson === T.lesson) && (!T.sem || !x.sem || x.sem === T.sem));
    const sel = T.qids.map((q) => BQ.find((x) => x.id === q)).filter(Boolean), nsel = new Set(T.qids);
    const s = sheet(`<h2>${id ? "تعديل اختبار" : "اختبار جديد من البنك"}</h2>
      <label class="f"><span>عنوان الاختبار</span><input type="text" id="tt" value="${esc(T.title)}"></label>
      <div class="grid2"><label class="f"><span>الصف</span><select id="tg">${opts(Object.fromEntries(GR.map((x, i) => ["g" + (i + 1), "الصف " + x])), T.lv)}</select></label><label class="f"><span>المادة</span><select id="ts">${opts(SJ, T.subj)}</select></label></div>
      <div class="grid2"><label class="f"><span>نوع الاختبار</span><select id="tc">${opts(SC, T.scope)}</select></label><label class="f"><span>الفصل</span><select id="tm">${opts(SM, T.sem ?? "")}</select></label></div>
      <label class="f"><span>الوحدة</span><input type="text" id="tu" list="tul" value="${esc(T.unit || "")}">${dl("tul", pool.map((x) => x.unit))}</label>
      <label class="f"><span>الدرس</span><input type="text" id="tl2" list="tll" value="${esc(T.lesson || "")}">${dl("tll", pool.filter((x) => !T.unit || x.unit === T.unit).map((x) => x.lesson))}</label>
      <div class="grid2"><label class="f"><span>التقييم</span><select id="tk">${opts(KD, T.kind)}</select></label><label class="f"><span>مستوى الاختبار</span><select id="td">${opts(DF, T.diff)}</select></label></div>
      <label class="f"><span>المهارة الأساسية</span><input type="text" id="tsk" value="${esc(T.skill || "")}"></label>
      <label class="f"><span>وصف قصير يظهر قبل البدء</span><textarea id="tin" style="min-height:56px">${esc(T.intro || "")}</textarea></label>
      <div class="sw"><span>خيار قياس الوقت للطالب<br><small class="mut">اختياري بدون عدّ تنازلي، ولا يُفرض أبدًا.</small></span><input type="checkbox" id="ttm"${T.data && T.data.timer ? " checked" : ""}></div>
      <div class="card"><h3>الأسئلة (${sel.length})</h3>
        ${sel.length ? sel.map((x, k) => `<div class="item"><div class="ph">${k + 1}</div><div class="tx"><b>${esc(qText(x))}</b><small>${DF[x.diff]} · ${esc(x.unit)} › ${esc(x.lesson)}</small></div><div class="row" style="gap:4px"><button class="chip" data-up="${k}">↑</button><button class="chip" data-dn="${k}">↓</button><button class="chip" data-rm="${k}">إزالة</button></div></div>`).join("") : `<p class="mut">لم تختر أسئلة بعد.</p>`}
        <div class="row" style="margin-top:8px"><button class="btn g" id="tpick">+ اختر من البنك (${scoped.length} متاح)</button><button class="btn g" id="tauto">اختيار تلقائي</button></div></div>
      <label class="f"><span>ملاحظة المراجعة (مطلوبة قبل النشر)</span><textarea id="trv" style="min-height:50px" placeholder="راجعتُ الأسئلة والإجابات">${esc(T.review_note || "")}</textarea></label>
      <div class="sw"><span>منشور للأطفال<br><small class="mut">لا يُنشر إن كان فيه سؤال غير منشور أو أقل من 3 أسئلة.</small></span><input type="checkbox" id="tpub"${T.is_published ? " checked" : ""}></div>
      <p class="qz-err" id="terr" role="alert"></p>
      <button class="btn" id="tsv">حفظ الاختبار</button><button class="btn g" id="tpv" style="margin-top:8px">معاينة كما يراها الطالب</button>${id ? `<button class="btn red" id="tdl" style="margin-top:8px">حذف الاختبار</button>` : ""}`);
    const rd = () => {
      T.title = $("#tt", s).value.trim(); T.lv = $("#tg", s).value; T.subj = $("#ts", s).value; T.scope = $("#tc", s).value; T.sem = $("#tm", s).value ? +$("#tm", s).value : null;
      T.unit = $("#tu", s).value.trim(); T.lesson = $("#tl2", s).value.trim(); T.kind = $("#tk", s).value; T.diff = +$("#td", s).value; T.skill = $("#tsk", s).value.trim(); T.intro = $("#tin", s).value.trim();
      T.review_note = $("#trv", s).value.trim(); T.is_published = $("#tpub", s).checked; T.data = Object.assign({}, T.data || {}); if ($("#ttm", s).checked) T.data.timer = true; else delete T.data.timer;
    };
    const redraw = () => { rd(); closeSheet(); draw(); };
    ["#tg", "#ts", "#tc", "#tm"].forEach((x) => $(x, s).onchange = () => { if (x === "#tg" || x === "#ts") T.qids = []; redraw(); });
    $$("[data-up]", s).forEach((b) => b.onclick = () => { const k = +b.dataset.up; if (k > 0) { rd(); [T.qids[k - 1], T.qids[k]] = [T.qids[k], T.qids[k - 1]]; closeSheet(); draw(); } });
    $$("[data-dn]", s).forEach((b) => b.onclick = () => { const k = +b.dataset.dn; if (k < T.qids.length - 1) { rd(); [T.qids[k + 1], T.qids[k]] = [T.qids[k], T.qids[k + 1]]; closeSheet(); draw(); } });
    $$("[data-rm]", s).forEach((b) => b.onclick = () => { rd(); T.qids.splice(+b.dataset.rm, 1); closeSheet(); draw(); });
    $("#tpick", s).onclick = () => {
      rd(); const keep = new Set(T.qids);
      const p = sheet(`<h2>اختر الأسئلة (${scoped.length})</h2>${scoped.length ? `<div id="tpl">${scoped.map((x) => `<label class="item" style="cursor:pointer"><input type="checkbox" value="${x.id}"${keep.has(x.id) ? " checked" : ""} style="margin-inline-end:8px"><div class="tx"><b>${esc(qText(x))}</b><small>${DF[x.diff]} · ${QT[x.qtype]} · ${esc(x.unit)} › ${esc(x.lesson)}</small></div></label>`).join("")}</div>` : `<p class="mut">لا توجد أسئلة منشورة لهذا الصف والمادة والتصنيف. انشر أسئلة في البنك أولًا.</p>`}<button class="btn" id="tok">تم</button>`);
      $("#tok", p).onclick = () => { const ch = $$("#tpl input:checked", p).map((c) => c.value); T.qids = T.qids.filter((q) => ch.includes(q)).concat(ch.filter((q) => !T.qids.includes(q))); closeSheet(); draw(); };
    };
    $("#tauto", s).onclick = () => {
      rd(); const p = sheet(`<h2>اختيار تلقائي</h2><p class="mut">يسحب أسئلة منشورة من البنك حسب الصف والمادة والتصنيف الحالي (${scoped.length} متاح).</p><label class="f"><span>عدد الأسئلة</span><input type="number" id="an" value="10" min="3" max="40" inputmode="numeric"></label><label class="f"><span>الصعوبة</span><select id="ad">${opts({ 0: "متنوع (سهل ثم متوسط ثم متقدم)", ...DF }, 0)}</select></label><button class="btn" id="aok">اختر الأسئلة</button>`);
      $("#aok", p).onclick = () => {
        const n = Math.max(3, Math.min(40, +$("#an", p).value || 10)), d = +$("#ad", p).value; let c = scoped.filter((x) => !d || x.diff === d).sort(() => Math.random() - 0.5).slice(0, n);
        if (c.length < 3) return toast("لا يوجد أسئلة كافية (الحد الأدنى 3)");
        c = c.sort((a, b) => a.diff - b.diff); T.qids = c.map((x) => x.id); closeSheet(); draw(); toast(`اخترنا ${c.length} سؤالًا`);
      };
    };
    const val = () => {
      rd(); if (!T.title) return "اكتب عنوان الاختبار"; if (!T.qids.length) return "اختر أسئلة للاختبار";
      if (["lesson", "unit"].includes(T.scope) && !T.unit) return "اكتب الوحدة"; if (T.scope === "lesson" && !T.lesson) return "اكتب الدرس";
      if (!T.skill) return "اكتب المهارة الأساسية"; if (T.is_published && !T.review_note) return "سجّل ملاحظة المراجعة قبل النشر"; return "";
    };
    $("#tsv", s).onclick = async () => {
      const e = val(); if (e) { $("#terr", s).textContent = e; return; } $("#terr", s).textContent = "";
      if (!T.slug) T.slug = `${T.lv}-${T.subj}-${T.scope}-${Date.now().toString(36).slice(-4)}${Math.random().toString(36).slice(2, 4)}`;
      const row = { slug: T.slug, lv: T.lv, subj: T.subj, kind: T.kind, title: T.title, skill: T.skill, diff: T.diff, intro: T.intro || null, scope: T.scope, sem: T.sem, unit: T.unit || null, lesson: T.lesson || null, src: "bank", qids: T.qids, review_note: T.review_note || null, is_published: T.is_published, data: T.data || {} };
      const b = $("#tsv", s); b.disabled = true;
      const { error } = id ? await sb.from("quizzes").update(row).eq("id", id) : await sb.from("quizzes").insert(row);
      b.disabled = false; if (error) { $("#terr", s).textContent = error.message && /[\u0600-\u06FF]/.test(error.message) ? error.message : "تعذّر الحفظ"; return; }
      closeSheet(); toast("تم حفظ الاختبار ✓"); done();
    };
    $("#tpv", s).onclick = async () => {
      const e = val(); if (e) { $("#terr", s).textContent = e; return; }
      const { data, error } = await sb.rpc("qbank_build", { p_qids: T.qids }); if (error) return failx(error);
      try { localStorage.setItem("zad.qz.preview", JSON.stringify({ lv: T.lv, subj: T.subj, kind: T.kind, title: T.title, skill: T.skill, diff: T.diff, intro: T.intro, data: Object.assign({}, data, T.data && T.data.timer ? { timer: true } : {}) })); } catch (x) { return toast("تعذّر تجهيز المعاينة"); }
      window.open("../tests/#q=__preview", "_blank");
    };
    const d = $("#tdl", s); if (d) d.onclick = async () => { if (!(await ask(`حذف «${T.title}» وكل إحصائياته نهائيًا؟ أسئلة البنك لا تُحذف.`))) return; const { error } = await sb.from("quizzes").delete().eq("id", id); if (error) return failx(error); closeSheet(); toast("حُذف الاختبار"); done(); };
  };
  draw();
}
})();
