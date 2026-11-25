/* إدارة تقارير تقدم الطفل: المجالات وربط المهارات بالمحتوى، شروط احتساب الإنجاز، المؤشرات، نصوص التوصيات، جودة التصنيف، عدد التقارير وأخطاء التحميل.
   لا يتيح هذا القسم إضافة نتائج: التقارير تُبنى دائمًا من نشاط الطفل الفعلي على جهازه. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const QCATS = [["early", "التعلم المبكر"], ["arabic", "العربية"], ["math", "الرياضيات"], ["english", "الإنجليزية"], ["science", "العلوم"], ["values", "القيم"]];
const SRCOK = /^(acts|bank|proj|life|ready|val|dig|exp|vid|songs|games|stories)(:[a-z]+)?$/;
const AR = /^[ء-ي٠-٩\s.،؟!:\-ـً-ْ«»{}a-z]+$/i, BADW = /فشل|غبي|أحمق|أقل من|أفضل من|الأول على|الأفضل|ضعيف|متخلف|تشخيص|اضطراب/;
const PH = { low_skill: ["title", "best", "tot"], retrain: ["title", "domain"], story: ["title"], worksheet: ["title", "domain"], empty: ["title", "domain"], quiz: ["title"] };
const RN = { low_skill: "إعادة اختبار نتيجته أقل", retrain: "إعادة نشاط سابق", story: "قصة لم تُقرأ", worksheet: "ورقة عمل أو نشاط مناسب", empty: "مجال لم يبدأ", quiz: "اختبار جديد" };
let CF = [], ST = [], ERRS = [], TAB = "dom";
async function load() {
  const r = await sb.from("rp_config").select("*").order("sort_order").limit(200); if (r.error) throw r.error; CF = r.data || [];
  const s = await sb.from("rp_stats").select("kind,level,created_at").order("created_at", { ascending: false }).limit(20000); ST = s.error ? [] : s.data || [];
  const e = await sb.from("pf_errors").select("*").like("kind", "rp-%").order("created_at", { ascending: false }).limit(50); ERRS = e.error ? [] : e.data || [];
}
const of = (k) => CF.filter((x) => x.kind === k);
function chkDom(d) {
  const m = [], x = d.data || {};
  if (!d.title || !AR.test(d.title) || d.title.length > 40) m.push("اسم المجال (عربي حتى ٤٠ حرفًا)");
  if (!Array.isArray(x.words) || x.words.some((w) => !w || w.length > 30) || x.words.length > 80) m.push("الكلمات المفتاحية (حتى ٨٠ كلمة، كل كلمة حتى ٣٠ حرفًا)");
  if ((x.src || []).some((s) => !SRCOK.test(s))) m.push("مصادر المحتوى (مثل: val أو stories:arabic)");
  if ((x.skills || []).some((s) => !s || s.length > 120)) m.push("المهارات المربوطة");
  if (!(x.words || []).length && !(x.quiz || []).length && !(x.src || []).length && !(x.skills || []).length) m.push("لا يوجد أي ربط بالمحتوى");
  if (!x.icon || x.icon.length > 4) m.push("الرمز (إيموجي واحد)");
  return m;
}
function chkReco(r) {
  const m = [], t = String((r.data || {}).text || "").trim(), ty = (r.data || {}).type, ok = PH[ty] || [];
  if (!t || t.length < 12 || t.length > 220) m.push("نص التوصية (١٢ إلى ٢٢٠ حرفًا)");
  if (BADW.test(t)) m.push("ألفاظ مقارنة أو تقييم غير مناسبة");
  if (/[0-9٠-٩]/.test(t)) m.push("لا أرقام داخل النص (تُملأ تلقائيًا من البيانات)");
  const used = [...t.matchAll(/\{(\w+)\}/g)].map((x) => x[1]);
  if (used.some((u) => !ok.includes(u))) m.push("متغيرات غير مسموحة (المسموح: " + ok.map((o) => "{" + o + "}").join(" ") + ")");
  if (!used.includes("title")) m.push("يجب أن يحتوي النص على {title} ليرتبط بمحتوى موجود");
  if (!/،|لأن|فـ|ف[هـ]|حيث|بعد|لم |قد /.test(t)) m.push("اذكر سبب التوصية في النص");
  return m;
}
const tokens = (s) => String(s || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean).map((t) => t.replace(/^ال/, ""));
function classify(doms, r) {
  for (const d of doms) if (((d.data || {}).skills || []).includes(r.skill)) return d.slug;
  for (const d of doms) { const s = (d.data || {}).src || []; if (s.includes(r.src) || (r.topic && s.includes(r.src + ":" + r.topic))) return d.slug; }
  if (/[a-z]{3}/i.test(r.skill || "")) { const e = doms.find((d) => d.slug === "english"); if (e) return e.slug; }
  for (const txt of [[r.skill, r.subject, r.cat].join(" "), r.title]) { const tk = tokens(txt); if (!tk.length) continue; for (const d of doms) if (((d.data || {}).words || []).some((w) => { const x = String(w).toLowerCase().replace(/^ال/, ""); return x && tk.some((t) => t.startsWith(x)); })) return d.slug; }
  return "other";
}
async function coverage() {
  const doms = of("domain").filter((d) => d.status === "active"), out = {}, miss = {}, T = [["acts", "activities", "slug,title,skill,subject"], ["bank", "bank_items", "slug,title,skill,subject,cat"], ["proj", "proj_items", "slug,title,skill,subject,cat"], ["vid", "video_items", "slug,title,skill,subject,cat"], ["songs", "song_items", "slug,title,skill,cat"], ["stories", "stories", "slug,title,topic"], ["life", "life_items", "slug,title,cat"], ["ready", "ready_items", "slug,title,cat"], ["val", "val_items", "slug,title,cat"], ["dig", "dig_items", "slug,title,cat"], ["exp", "exp_items", "slug,title,cat"]];
  let total = 0;
  for (const [src, tb, cols] of T) { const q = await sb.from(tb).select(cols).eq("status", "published").limit(2000); if (q.error) continue; (q.data || []).forEach((x) => { total++; const d = classify(doms, Object.assign({ src }, x)); out[d] = (out[d] || 0) + 1; if (d === "other" && x.skill) miss[x.skill] = (miss[x.skill] || 0) + 1; }); }
  return { out, miss, total, doms };
}
SUB.rpadm = { title: "إدارة تقارير تقدم الطفل", fn: async function view(m) {
  await load();
  const now = Date.now(), d30 = ST.filter((x) => now - Date.parse(x.created_at) < 30 * 864e5), cn = (k) => d30.filter((x) => x.kind === k).length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><div class="grid2" style="margin-top:8px"><div class="stat"><b>${ST.length}</b><span>تقارير أُنشئت (الكل)</span></div><div class="stat"><b>${d30.length}</b><span>آخر ٣٠ يومًا</span></div></div>
  <p class="mut">التقارير تُبنى على جهاز الوليّ من نشاط طفله الفعلي فقط؛ لا تُدخل هنا أي نتائج. هنا تُدار المجالات وربط المهارات بالمحتوى وشروط الاحتساب والمؤشرات ونصوص التوصيات. لا نحتفظ بأي بيانات طفل: العدّاد يسجّل نوع التقرير والمستوى فقط.</p>
  <div class="chips" id="rpt">${[["dom", "المجالات"], ["ind", "المؤشرات والشروط"], ["rec", "التوصيات"], ["q", "الجودة والإحصاءات"]].map(([k, l]) => `<button class="chip ${TAB === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div><div id="rpb"></div>`;
  $$("#rpt [data-t]", m).forEach((b) => (b.onclick = () => { TAB = b.dataset.t; view(m); }));
  const B = $("#rpb", m), reload = () => view(m);
  if (TAB === "dom") {
    B.innerHTML = of("domain").map((d) => { const x = d.data || {}, ms = chkDom(d); return `<div class="item" data-s="${d.slug}"><div class="tx"><b>${esc(x.icon || "")} ${esc(d.title)}</b><small>${d.status === "active" ? "مفعّل" : "متوقف"} · كلمات: ${(x.words || []).length} · مصادر: ${esc((x.src || []).join("، ") || "—")} · اختبارات: ${esc((x.quiz || []).join("، ") || "—")} · مهارات مربوطة: ${(x.skills || []).length}${ms.length ? ` · <span style="color:var(--no)">ناقص: ${esc(ms[0])}</span>` : ""}</small></div></div>`; }).join("") || '<p class="mut">لا مجالات.</p>';
    $$("[data-s]", B).forEach((b) => (b.onclick = () => editDom(CF.find((x) => x.slug === b.dataset.s), reload)));
  } else if (TAB === "ind") {
    const rc = (CF.find((x) => x.slug === "rule_complete") || { data: {} }).data, nd = (CF.find((x) => x.slug === "ind_need") || { data: {} }).data;
    B.innerHTML = `<div class="card"><b>شروط احتساب النشاط المكتمل</b><label class="f"><span>أقل عدد نجوم لتُحتسب اللعبة (١ إلى ٣)</span><input type="number" id="rpg" min="1" max="3" value="${esc(rc.gameStars || 1)}"></label><label class="f"><span>أقل عدد أسئلة لتُحتسب محاولة الاختبار (١ إلى ٢٠)</span><input type="number" id="rpq" min="1" max="20" value="${esc(rc.quizMinQ || 3)}"></label>
    <b>مهارة تحتاج مزيدًا من التدريب</b><label class="f"><span>أقل عدد أسئلة (٣ إلى ٥٠) / نسبة الصحة دون (٠.٣ إلى ٠.٩)</span><span style="display:flex;gap:8px"><input type="number" id="rpm" min="3" max="50" value="${esc(nd.minAns || 3)}" style="width:50%"><input type="number" id="rpr" min="0.3" max="0.9" step="0.05" value="${esc(nd.rate || 0.6)}" style="width:50%"></span></label><div class="row"><button class="btn" id="rpsv">حفظ الشروط</button></div></div>
    <div class="card"><b>تشغيل أو إيقاف المؤشرات في التقارير</b>${["ind_retrain", "ind_progress", "ind_need", "ind_chart"].map((k) => { const r = CF.find((x) => x.slug === k); return `<div class="item"><div class="tx"><b>${esc(r ? r.title : k)}</b><small>${esc(r && r.data && r.data.note || "")}</small></div><button class="chip ${r && r.status === "active" ? "on" : ""}" data-i="${k}">${r && r.status === "active" ? "مفعّل" : "متوقف"}</button></div>`; }).join("")}<p class="mut">إيقاف مؤشر يخفيه من كل التقارير فورًا إن رأيت أنه غير دقيق.</p></div><p id="rpmsg" style="color:var(--no);font-weight:700"></p>`;
    $("#rpsv", B).onclick = async () => { const g = parseInt($("#rpg", B).value, 10), q = parseInt($("#rpq", B).value, 10), a = parseInt($("#rpm", B).value, 10), r = parseFloat($("#rpr", B).value); if (!(g >= 1 && g <= 3 && q >= 1 && q <= 20 && a >= 3 && a <= 50 && r >= 0.3 && r <= 0.9)) { $("#rpmsg", B).textContent = "قيم خارج الحدود المسموحة."; return; } try { let e = await sb.from("rp_config").update({ data: Object.assign({}, rc, { gameStars: g, quizMinQ: q }), updated_at: new Date().toISOString() }).eq("slug", "rule_complete"); if (e.error) throw e.error; e = await sb.from("rp_config").update({ data: Object.assign({}, nd, { minAns: a, rate: r }), updated_at: new Date().toISOString() }).eq("slug", "ind_need"); if (e.error) throw e.error; toast("تم الحفظ"); reload(); } catch (e) { fail(e); } };
    $$("[data-i]", B).forEach((b) => (b.onclick = async () => { const r = CF.find((x) => x.slug === b.dataset.i); if (!r) return; try { const q = await sb.from("rp_config").update({ status: r.status === "active" ? "off" : "active" }).eq("slug", r.slug); if (q.error) throw q.error; reload(); } catch (e) { fail(e); } }));
  } else if (TAB === "rec") {
    B.innerHTML = of("reco").map((r) => { const ms = chkReco(r); return `<div class="item" data-s="${r.slug}"><div class="tx"><b>${esc(RN[(r.data || {}).type] || r.title)}</b><small>${r.status === "active" ? "مفعّلة" : "متوقفة"} · ${esc(((r.data || {}).text || "").slice(0, 90))}${ms.length ? ` · <span style="color:var(--no)">${esc(ms[0])}</span>` : ""}</small></div></div>`; }).join("");
    $$("[data-s]", B).forEach((b) => (b.onclick = () => editReco(CF.find((x) => x.slug === b.dataset.s), reload)));
  } else {
    B.innerHTML = `<div class="card"><b>عدد التقارير حسب النوع (آخر ٣٠ يومًا)</b><p>أسبوعي: ${cn("week")} · شهري: ${cn("month")} · مخصص: ${cn("custom")} · طباعة: ${cn("print")}</p></div><div class="row"><button class="btn" id="rpcv">فحص جودة تصنيف المحتوى في المجالات</button><button class="btn g" id="rper">⚠️ أخطاء التحميل (${ERRS.length})</button></div><div id="rpres"></div>`;
    $("#rper", B).onclick = () => { $("#rpres", B).innerHTML = ERRS.length ? `<div class="card"><ul>${ERRS.slice(0, 30).map((e) => `<li>${esc(e.kind)} · ${esc((e.msg || "").slice(0, 120))} · ${esc(String(e.created_at).slice(0, 10))}</li>`).join("")}</ul></div>` : '<p class="mut">لا أخطاء.</p>'; };
    $("#rpcv", B).onclick = async () => { const o = $("#rpres", B); o.innerHTML = '<p class="mut">جارٍ الفحص…</p>'; try { const c = await coverage(), nm = Object.fromEntries(c.doms.map((d) => [d.slug, d.title])); const oth = c.out.other || 0; o.innerHTML = `<div class="card"><b>توزيع ${c.total} عنصرًا منشورًا على المجالات</b><ul>${c.doms.map((d) => `<li>${esc(nm[d.slug])}: ${c.out[d.slug] || 0}</li>`).join("")}<li>أنشطة متنوعة (غير مصنفة): ${oth}</li></ul>${oth ? `<p class="mut">المهارات غير المصنفة (أضف كلمة مفتاحية أو اربطها بنصها الكامل في المجال المناسب):</p><ul>${Object.entries(c.miss).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([k, n]) => `<li>${esc(k)} (${n})</li>`).join("")}</ul>` : '<p class="mut">كل العناصر مصنفة.</p>'}</div>`; } catch (e) { fail(e); } };
  }
} };
function editDom(d, reload) {
  const x = JSON.parse(JSON.stringify(d.data || {})), T = (id, l, v, dir) => `<label class="f"><span>${l}</span><input type="text" id="${id}" value="${esc(v == null ? "" : v)}" ${dir ? `dir="${dir}"` : ""}></label>`;
  const s = sheet(`<h2>تعديل المجال</h2><p class="mut">المعرّف: ${esc(d.slug)}</p>${T("rpd1", "اسم المجال", d.title)}${T("rpd2", "الرمز (إيموجي)", x.icon)}
  <label class="f"><span>كلمات مفتاحية تربط المهارات والعناوين بالمجال (مفصولة بفاصلة؛ تُطابق بداية الكلمة)</span><textarea id="rpd3" rows="4" dir="auto">${esc((x.words || []).join("، "))}</textarea></label>
  <label class="f"><span>مصادر تُحتسب كلها ضمن المجال (مفصولة بفاصلة): acts, bank, proj, life, ready, val, dig, exp, vid, songs, games, stories أو stories:arabic</span><input type="text" id="rpd4" dir="ltr" value="${esc((x.src || []).join(","))}"></label>
  <p style="margin:8px 2px 4px;font-weight:700">مواد الاختبارات المرتبطة</p><div class="chips" id="rpd5">${QCATS.map(([k, l]) => `<button type="button" class="chip ${(x.quiz || []).includes(k) ? "on" : ""}" data-q="${k}">${l}</button>`).join("")}</div>
  <label class="f"><span>مهارات تُربط بالمجال بنصها الكامل (سطر لكل مهارة، تُقدَّم على الكلمات)</span><textarea id="rpd6" rows="3" dir="auto">${esc((x.skills || []).join("\n"))}</textarea></label>
  <label class="f"><span>الحالة</span><select id="rpd7"><option value="active" ${d.status === "active" ? "selected" : ""}>مفعّل</option><option value="off" ${d.status !== "active" ? "selected" : ""}>متوقف</option></select></label><p id="rpe" style="color:var(--no);font-weight:700"></p>
  <div class="row"><button class="btn" id="rpsv">حفظ</button><button class="btn g" id="rpx">إغلاق</button></div>`);
  $("#rpx", s).onclick = closeSheet;
  $$("#rpd5 [data-q]", s).forEach((b) => (b.onclick = () => { x.quiz = x.quiz || []; const i = x.quiz.indexOf(b.dataset.q); if (i < 0) x.quiz.push(b.dataset.q); else x.quiz.splice(i, 1); b.classList.toggle("on", i < 0); }));
  $("#rpsv", s).onclick = async () => {
    const nd = Object.assign({}, x, { icon: $("#rpd2", s).value.trim(), words: $("#rpd3", s).value.split(/[,،\n]/).map((t) => t.trim()).filter(Boolean), src: $("#rpd4", s).value.split(",").map((t) => t.trim()).filter(Boolean), skills: $("#rpd6", s).value.split("\n").map((t) => t.trim()).filter(Boolean) });
    const row = { slug: d.slug, title: $("#rpd1", s).value.trim(), data: nd, status: $("#rpd7", s).value }, ms = chkDom(row);
    if (ms.length && row.status === "active") { $("#rpe", s).textContent = "لا يمكن الحفظ مفعّلًا قبل تصحيح: " + ms.join("، "); return; }
    try { const q = await sb.from("rp_config").update({ title: row.title, data: row.data, status: row.status, updated_at: new Date().toISOString() }).eq("slug", d.slug); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { fail(e); }
  };
}
function editReco(r, reload) {
  const ty = (r.data || {}).type, s = sheet(`<h2>${esc(RN[ty] || "توصية")}</h2><p class="mut">المتغيرات المسموحة: ${(PH[ty] || []).map((p) => "{" + p + "}").join(" ")} — تُملأ من محتوى المكتبة الفعلي. يجب أن يتضمن النص السبب، دون مقارنة ولا أرقام.</p>
  <label class="f"><span>نص التوصية</span><textarea id="rpr1" rows="4" maxlength="220" dir="auto">${esc((r.data || {}).text || "")}</textarea></label><label class="f"><span>الحالة</span><select id="rpr2"><option value="active" ${r.status === "active" ? "selected" : ""}>مفعّلة</option><option value="off" ${r.status !== "active" ? "selected" : ""}>متوقفة (لا تظهر)</option></select></label><p id="rpe" style="color:var(--no);font-weight:700"></p>
  <div class="row"><button class="btn" id="rpsv">حفظ</button><button class="btn g" id="rpx">إغلاق</button></div>`);
  $("#rpx", s).onclick = closeSheet;
  $("#rpsv", s).onclick = async () => { const data = Object.assign({}, r.data, { text: $("#rpr1", s).value.trim() }), ms = chkReco({ data }), st = $("#rpr2", s).value; if (ms.length && st === "active") { $("#rpe", s).textContent = "لا يمكن الحفظ مفعّلًا قبل تصحيح: " + ms.join("، "); return; } try { const q = await sb.from("rp_config").update({ data, status: st, updated_at: new Date().toISOString() }).eq("slug", r.slug); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
window.__rpTest = { chkDom, chkReco, classify };
})();
