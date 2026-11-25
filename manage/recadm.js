/* إدارة مركز التوصيات «ماذا نتعلم بعد ذلك؟»: ربط المحتوى بالمهارات والمستوى ونوع التوصية، ترتيب، إيقاف، مراجعة قبل الظهور، أسباب التوصيات، تفاعل.
   كل عنصر هنا هو صف حقيقي من جداول المكتبة؛ لا تُضاف عناوين أو روابط يدويًا. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, sheet, closeSheet, fail, SUB } = Z;
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const SRC = { acts: ["activities", "أنشطة وأوراق عمل"], bank: ["bank_items", "بنك الأنشطة"], proj: ["proj_items", "مشاريع"], life: ["life_items", "مهارات حياتية"], ready: ["ready_items", "استعداد مدرسي"], val: ["val_items", "قيم"], vid: ["video_items", "فيديو"], songs: ["song_items", "أناشيد"], stories: ["stories", "قصص"], games: ["", "ألعاب"] };
const RT = { "": "تلقائي", continue: "متابعة", review: "مراجعة", explore: "استكشاف" };
const AR = /^[ء-ي\s.،؟!:\-ـً-ْ«»{}a-z]+$/i, BADW = /فشل|غبي|أحمق|أقل من|أفضل من|الأول على|الأفضل|ضعيف|متخلف|تشخيص|اضطراب/;
const RRN = { rr_continue: "متابعة (مهارة تدرب عليها)", rr_continue_domain: "متابعة (مجال مارسه)", rr_review: "مراجعة", rr_explore: "استكشاف", rr_general: "اقتراح عام", rr_again: "مراجعة بطريقة مختلفة" };
let TAB = "ct", CF = [], OV = [], EV = [], ERRS = [];
/* التحقق من النصوص: بلا أرقام ولا مقارنة ولا متغيرات غير معروفة */
function chkReason(t, needTitle) {
  const m = []; t = String(t || "").trim();
  if (t.length < 10 || t.length > 160) m.push("النص من ١٠ إلى ١٦٠ حرفًا");
  if (t && !AR.test(t)) m.push("عربي فقط دون أرقام أو رموز");
  if (/[0-9٠-٩]/.test(t)) m.push("لا أرقام داخل النص");
  if (BADW.test(t)) m.push("ألفاظ مقارنة أو تقييم غير مناسبة");
  if ([...t.matchAll(/\{(\w+)\}/g)].some((x) => !["skill", "domain", "title"].includes(x[1]))) m.push("المتغيرات المسموحة: {skill} {domain} {title}");
  if (needTitle && !/\{title\}/.test(t)) m.push("يجب أن يحتوي على {title}");
  return m;
}
function chkOv(o) {
  const m = [];
  if (!SRC[o.src]) m.push("مصدر غير معروف");
  if (!o.slug) m.push("عنصر غير محدد");
  if (!["on", "off"].includes(o.status)) m.push("الحالة");
  if ((o.levels || []).some((l) => !LV[l])) m.push("مستوى خارج النطاق (من سنة إلى ٦ سنوات والصفوف ١–٤ فقط)");
  if (o.rtype && !["continue", "review", "explore"].includes(o.rtype)) m.push("نوع التوصية");
  if (!(Number.isInteger(o.priority) && o.priority >= -3 && o.priority <= 3)) m.push("الترتيب من -٣ إلى ٣");
  if (o.reason) m.push(...chkReason(o.reason, false));
  return m;
}
async function load() {
  const a = await sb.from("rp_config").select("*").order("sort_order").limit(200); CF = a.error ? [] : a.data || [];
  const b = await sb.from("rec_overrides").select("*").order("updated_at", { ascending: false }).limit(500); OV = b.error ? [] : b.data || [];
  const c = await sb.from("rec_events").select("src,slug,action,created_at").order("created_at", { ascending: false }).limit(20000); EV = c.error ? [] : c.data || [];
  const e = await sb.from("pf_errors").select("*").eq("kind", "rp-rec").order("created_at", { ascending: false }).limit(50); ERRS = e.error ? [] : e.data || [];
}
const doms = () => CF.filter((x) => x.kind === "domain" && x.status === "active");
const mode = () => ((CF.find((x) => x.slug === "rec_mode") || { data: {} }).data.mode || "auto");
async function titles(keys) {
  const by = {}; keys.forEach((k) => { const [s, ...r] = k.split(":"); (by[s] = by[s] || []).push(r.join(":")); }); const out = {};
  for (const [s, sl] of Object.entries(by)) { const tb = SRC[s] && SRC[s][0]; if (!tb) continue; const q = await sb.from(tb).select("slug,title").in("slug", sl.slice(0, 200)); (q.data || []).forEach((x) => (out[s + ":" + x.slug] = x.title)); }
  return out;
}
SUB.recadm = { title: "إدارة مركز التوصيات", fn: async function view(m) {
  await load();
  const shown = EV.filter((x) => x.action === "shown").length, st = EV.filter((x) => x.action === "start").length;
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><div class="grid2" style="margin-top:8px"><div class="stat"><b>${shown}</b><span>مرات ظهور التوصيات</span></div><div class="stat"><b>${st}</b><span>مرات بدء النشاط</span></div></div>
  <p class="mut">التوصيات تُحسب على جهاز الوليّ من نشاط طفله، ولا تُسجَّل هنا بيانات أي طفل: نحفظ فقط عنصرًا وإجراءً (ظهر / بدأ / إخفاء / ليس الآن) والمستوى. كل عنصر مرتبط بصف حقيقي في المكتبة.</p>
  <div class="chips" id="rct">${[["ct", "المحتوى"], ["rs", "الأسباب ووضع المراجعة"], ["ev", "التفاعل"], ["er", "الأخطاء"]].map(([k, l]) => `<button class="chip ${TAB === k ? "on" : ""}" data-t="${k}">${l}</button>`).join("")}</div><div id="rcb"></div>`;
  $$("#rct [data-t]", m).forEach((b) => (b.onclick = () => { TAB = b.dataset.t; view(m); }));
  const B = $("#rcb", m), reload = () => view(m);
  if (TAB === "ct") {
    B.innerHTML = `<div class="card"><b>البحث عن عنصر في المكتبة وضبط توصيته</b><div style="display:flex;gap:8px;flex-wrap:wrap"><select id="rcs">${Object.entries(SRC).map(([k, v]) => `<option value="${k}">${v[1]}</option>`).join("")}</select><input type="text" id="rcq" placeholder="جزء من العنوان" style="flex:1;min-width:140px"><button class="btn" id="rcgo">بحث</button></div><div id="rcr"></div></div>
    <b style="display:block;margin:10px 2px 4px">عناصر لها إعداد خاص (${OV.length})</b><div id="rcl"></div>`;
    $("#rcl", B).innerHTML = OV.length ? OV.map((o) => `<div class="item" data-o="${esc(o.src + ":" + o.slug)}"><div class="tx"><b data-tt>${esc(o.slug)}</b><small>${esc(SRC[o.src] ? SRC[o.src][1] : o.src)} · ${o.status === "on" ? "معتمد" : "موقوف"} · ${esc(RT[o.rtype || ""])} · ترتيب ${o.priority || 0}${(o.levels || []).length ? " · " + o.levels.map((l) => LV[l]).join("، ") : ""}</small></div></div>`).join("") : '<p class="mut">لا توجد إعدادات خاصة بعد؛ تعمل التوصيات تلقائيًا من بيانات المكتبة.</p>';
    titles(OV.map((o) => o.src + ":" + o.slug)).then((t) => $$("[data-o]", B).forEach((n) => { const x = t[n.dataset.o]; if (x) $("[data-tt]", n).textContent = x; }));
    $$("[data-o]", B).forEach((n) => (n.onclick = () => { const k = n.dataset.o, [s, ...r] = k.split(":"); editOv({ src: s, slug: r.join(":"), title: $("[data-tt]", n).textContent }, OV.find((o) => o.src === s && o.slug === r.join(":")), reload); }));
    $("#rcgo", B).onclick = async () => {
      const s = $("#rcs", B).value, q = $("#rcq", B).value.trim(), out = $("#rcr", B); out.innerHTML = '<p class="mut">جارٍ البحث…</p>';
      try {
        let rows = [];
        if (s === "games") { const j = await (await fetch("../games/catalog.json")).json(); rows = j.filter((g) => !q || String(g.t).includes(q)).slice(0, 30).map((g) => ({ slug: g.id, title: g.t })); }
        else { let qq = sb.from(SRC[s][0]).select("slug,title").eq("status", "published").order("title").limit(30); if (q) qq = qq.ilike("title", "%" + q.replace(/[%,()]/g, "") + "%"); const r = await qq; if (r.error) throw r.error; rows = r.data || []; }
        out.innerHTML = rows.length ? rows.map((x, i) => `<div class="item" data-i="${i}"><div class="tx"><b>${esc(x.title)}</b><small>${esc(x.slug)}</small></div></div>`).join("") : '<p class="mut">لا نتائج.</p>';
        $$("[data-i]", out).forEach((n) => (n.onclick = () => { const x = rows[+n.dataset.i]; editOv({ src: s, slug: x.slug, title: x.title }, OV.find((o) => o.src === s && o.slug === x.slug), reload); }));
      } catch (e) { fail(e); }
    };
  } else if (TAB === "rs") {
    const md = mode();
    B.innerHTML = `<div class="card"><b>مراجعة المحتوى قبل ظهوره في التوصيات</b><label class="f"><span>الوضع</span><select id="rcm"><option value="auto" ${md === "auto" ? "selected" : ""}>تلقائي: كل محتوى منشور ومناسب للمستوى يظهر</option><option value="approve" ${md === "approve" ? "selected" : ""}>بموافقة: لا يظهر إلا ما اعتمدته (حالة «معتمد»)</option></select></label><div class="row"><button class="btn" id="rcmv">حفظ الوضع</button></div></div>
    <b style="display:block;margin:10px 2px 4px">أسباب التوصيات (تظهر تحت كل بطاقة)</b>${CF.filter((x) => x.kind === "rreason").map((r) => `<div class="item" data-r="${r.slug}"><div class="tx"><b>${esc(RRN[r.slug] || r.title)}</b><small>${esc(((r.data || {}).text || "").slice(0, 100))}</small></div></div>`).join("")}`;
    $("#rcmv", B).onclick = async () => { try { const q = await sb.from("rp_config").update({ data: { mode: $("#rcm", B).value }, updated_at: new Date().toISOString() }).eq("slug", "rec_mode"); if (q.error) throw q.error; toast("تم الحفظ"); reload(); } catch (e) { fail(e); } };
    $$("[data-r]", B).forEach((n) => (n.onclick = () => editReason(CF.find((x) => x.slug === n.dataset.r), reload)));
  } else if (TAB === "ev") {
    const agg = {}; EV.forEach((x) => { const k = x.src + ":" + x.slug, a = (agg[k] = agg[k] || { shown: 0, start: 0, hide: 0, later: 0 }); a[x.action] = (a[x.action] || 0) + 1; });
    const rows = Object.entries(agg), stale = rows.filter(([, a]) => a.shown >= 5 && a.start === 0).sort((a, b) => b[1].shown - a[1].shown).slice(0, 30), hid = rows.filter(([, a]) => a.hide >= 2).sort((a, b) => b[1].hide - a[1].hide).slice(0, 20);
    B.innerHTML = `<div class="card"><b>محتوى ظهر خمس مرات أو أكثر دون أن يبدأه أحد</b><div id="rcs1"></div></div><div class="card"><b>محتوى كثر إخفاؤه</b><div id="rcs2"></div></div>`;
    titles([...stale, ...hid].map(([k]) => k)).then((t) => {
      const li = (a) => a.length ? a.map(([k, v]) => `<div class="item"><div class="tx"><b>${esc(t[k] || k)}</b><small>ظهر ${v.shown} · بدأ ${v.start} · إخفاء ${v.hide} · ليس الآن ${v.later}</small></div></div>`).join("") : '<p class="mut">لا شيء حاليًا.</p>';
      $("#rcs1", B).innerHTML = li(stale); $("#rcs2", B).innerHTML = li(hid);
    });
  } else {
    B.innerHTML = ERRS.length ? `<div class="card"><ul>${ERRS.slice(0, 30).map((e) => `<li>${esc((e.msg || "").slice(0, 140))} · ${esc(String(e.created_at).slice(0, 10))}</li>`).join("")}</ul></div>` : '<p class="mut">لا أخطاء.</p>';
  }
} };
function editOv(it, o, reload) {
  const x = Object.assign({ status: "on", levels: [], domain: "", rtype: "", priority: 0, reason: "", note: "" }, o || {}), lv = new Set(x.levels || []);
  const s = sheet(`<h2>${esc(it.title || it.slug)}</h2><p class="mut">${esc(SRC[it.src][1])} · ${esc(it.slug)}</p>
  <label class="f"><span>الحالة</span><select id="rco1"><option value="on" ${x.status === "on" ? "selected" : ""}>معتمد (يظهر في التوصيات)</option><option value="off" ${x.status === "off" ? "selected" : ""}>موقوف (لا يظهر أبدًا)</option></select></label>
  <p style="margin:8px 2px 4px;font-weight:700">المستويات المناسبة (اتركها فارغة ليُستخدم مستوى المحتوى نفسه)</p><div class="chips" id="rco2">${Object.entries(LV).map(([k, l]) => `<button type="button" class="chip ${lv.has(k) ? "on" : ""}" data-l="${k}">${l}</button>`).join("")}</div>
  <label class="f"><span>المجال (يحدد المهارة والتصنيف)</span><select id="rco3"><option value="">تلقائي</option>${doms().map((d) => `<option value="${esc(d.slug)}" ${x.domain === d.slug ? "selected" : ""}>${esc(d.title)}</option>`).join("")}</select></label>
  <label class="f"><span>نوع التوصية</span><select id="rco4">${Object.entries(RT).map(([k, l]) => `<option value="${k}" ${(x.rtype || "") === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
  <label class="f"><span>الترتيب (-٣ إلى ٣؛ الأعلى يظهر أولًا)</span><input type="number" id="rco5" min="-3" max="3" value="${esc(x.priority || 0)}"></label>
  <label class="f"><span>سبب خاص بهذا العنصر (اختياري؛ المتغيرات {skill} {domain} {title})</span><textarea id="rco6" rows="2" maxlength="160" dir="auto">${esc(x.reason || "")}</textarea></label>
  <label class="f"><span>ملاحظة للمسؤول (لا تظهر للأهل)</span><input type="text" id="rco7" maxlength="200" value="${esc(x.note || "")}"></label><p id="rce" style="color:var(--no);font-weight:700"></p>
  <div class="row"><button class="btn" id="rcsv">حفظ</button>${o ? '<button class="btn g" id="rcdl">حذف الإعداد الخاص</button>' : ""}<button class="btn g" id="rcx">إغلاق</button></div>`);
  $("#rcx", s).onclick = closeSheet;
  $$("#rco2 [data-l]", s).forEach((b) => (b.onclick = () => { const k = b.dataset.l; if (lv.has(k)) lv.delete(k); else lv.add(k); b.classList.toggle("on", lv.has(k)); }));
  $("#rcsv", s).onclick = async () => {
    const row = { src: it.src, slug: it.slug, status: $("#rco1", s).value, levels: [...lv], domain: $("#rco3", s).value || null, rtype: $("#rco4", s).value || null, priority: parseInt($("#rco5", s).value, 10), reason: $("#rco6", s).value.trim() || null, note: $("#rco7", s).value.trim() || null, updated_at: new Date().toISOString() };
    const ms = chkOv(row); if (ms.length) { $("#rce", s).textContent = "صحّح: " + ms.join("، "); return; }
    try { const q = await sb.from("rec_overrides").upsert(row, { onConflict: "src,slug" }); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { fail(e); }
  };
  if (o) $("#rcdl", s).onclick = async () => { if (!confirm("حذف الإعداد الخاص بهذا العنصر؟ العنصر نفسه في المكتبة لا يُحذف.")) return; try { const q = await sb.from("rec_overrides").delete().eq("src", it.src).eq("slug", it.slug); if (q.error) throw q.error; toast("تم الحذف"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
function editReason(r, reload) {
  const s = sheet(`<h2>${esc(RRN[r.slug] || r.title)}</h2><p class="mut">المتغيرات: {skill} {domain} {title}. يجب أن يكون السبب مبنيًا على بيانات فعلية ومشجعًا، دون أرقام أو مقارنة.</p>
  <label class="f"><span>نص السبب</span><textarea id="rcr1" rows="3" maxlength="160" dir="auto">${esc((r.data || {}).text || "")}</textarea></label><p id="rce" style="color:var(--no);font-weight:700"></p><div class="row"><button class="btn" id="rcsv">حفظ</button><button class="btn g" id="rcx">إغلاق</button></div>`);
  $("#rcx", s).onclick = closeSheet;
  $("#rcsv", s).onclick = async () => { const t = $("#rcr1", s).value.trim(), ms = chkReason(t, false); if (ms.length) { $("#rce", s).textContent = "صحّح: " + ms.join("، "); return; } try { const q = await sb.from("rp_config").update({ data: Object.assign({}, r.data, { text: t }), updated_at: new Date().toISOString() }).eq("slug", r.slug); if (q.error) throw q.error; toast("تم الحفظ"); closeSheet(); reload(); } catch (e) { fail(e); } };
}
window.__recTest = { chkOv, chkReason };
})();
