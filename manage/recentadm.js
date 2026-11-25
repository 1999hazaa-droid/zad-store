/* إدارة «تابع من حيث توقفت»: أنواع المحتوى التي تدخل السجل، المصادر المستبعدة، مدة الاحتفاظ، آلية الموضع، أخطاء التسجيل.
   سجل كل طفل محفوظ على جهازه فقط؛ هذه اللوحة لا ترى أي سجل، وتحفظ إعدادات عامة في جدول recent_cfg. */
(function () {
"use strict";
const Z = window.__zp; if (!Z) return;
const { sb, $, $$, esc, toast, SUB } = Z;
const CT = { story: "قصص تعليمية", ws: "أوراق عمل", cards: "بطاقات تعليمية", home: "أنشطة منزلية", video: "دروس مرئية", game: "ألعاب تعليمية", quiz: "اختبارات", project: "مشروعات", res: "موارد تعليمية" };
const SRC = { lib: "ملفات المكتبة (أوراق العمل)", acts: "أنشطة منزلية", bank: "بنك الأنشطة", proj: "مشاريع وتحديات", life: "مهارات حياتية", ready: "استعداد مدرسي", val: "قيم وسلوك", exp: "ثقافة عامة", vid: "دروس مرئية", songs: "أناشيد", games: "ألعاب", stories: "قصص", quiz: "اختبارات" };
const DAYS = [7, 14, 30, 60, 90, 180];
let TAB = "cfg", CFG = { off_types: [], off_srcs: [], days: 30, pos: true }, ERRS = [];
const fail = (e) => { console.error(e); toast("تعذّر الحفظ. تأكد من الإنترنت وحاول مرة ثانية"); };
/** يتحقق من قيمة الإعداد قبل الكتابة */
function chk(k, v) {
  if (k === "days") return DAYS.includes(Number(v)) ? "" : "مدة غير مسموحة";
  if (k === "pos") return typeof v === "boolean" ? "" : "قيمة غير صالحة";
  if (k === "off_types") return Array.isArray(v) && v.every((x) => CT[x]) ? "" : "نوع غير معروف";
  if (k === "off_srcs") return Array.isArray(v) && v.every((x) => SRC[x]) ? "" : "مصدر غير معروف";
  return "إعداد غير معروف";
}
async function load() {
  const c = await sb.from("recent_cfg").select("k,v").limit(20); (c.data || []).forEach((r) => { CFG[r.k] = r.v; });
  const e = await sb.from("pf_errors").select("id,kind,msg,created_at").in("kind", ["recent-skip", "recent-log"]).order("created_at", { ascending: false }).limit(500); ERRS = e.error ? [] : e.data || [];
}
async function setCfg(k, v) {
  const bad = chk(k, v); if (bad) { toast(bad); return false; }
  try { const q = await sb.from("recent_cfg").upsert({ k, v, updated_at: new Date().toISOString() }, { onConflict: "k" }); if (q.error) throw q.error; CFG[k] = v; try { localStorage.removeItem("zad-recent-cfg"); } catch (e) { /* */ } return true; } catch (e) { fail(e); return false; }
}
SUB.recentadm = { title: "إدارة تابع من حيث توقفت", fn: async function view(m) {
  m.innerHTML = '<button class="chip" onclick="window.__go(\'more\')">→ رجوع</button><p class="mut">جارٍ التحميل…</p>';
  await load();
  m.innerHTML = `<button class="chip" onclick="window.__go('more')">→ رجوع</button><p class="mut">يُسجَّل في «تابع من حيث توقفت» المحتوى <b>المنشور</b> الذي فتحه الطفل فعلًا، بعد التحقق من نشره. السجل خاص بكل طفل ومحفوظ على جهازه، <b>ولا تعرضه هذه اللوحة</b>. فتح المحتوى لا يُحسب إنجازًا.</p>
  <div class="chips" id="rct">${[["cfg", "الإعدادات"], ["err", "أخطاء التسجيل"]].map(([k, l]) => `<button class="chip ${TAB === k ? "on" : ""}" data-t="${k}">${l}${k === "err" && ERRS.length ? " (" + new Set(ERRS.map((x) => x.msg)).size + ")" : ""}</button>`).join("")}</div><div id="rcb"></div>`;
  $$("#rct [data-t]", m).forEach((b) => (b.onclick = () => { TAB = b.dataset.t; view(m); }));
  const B = $("#rcb", m), reload = () => view(m);
  if (TAB === "cfg") cfg(B, reload); else errs(B, reload);
} };
function cfg(B, reload) {
  const offT = CFG.off_types || [], offS = CFG.off_srcs || [];
  B.innerHTML = `<div class="card"><b>مدة الاحتفاظ بالسجل</b><p class="mut">يُحذف من السجل ما مضى عليه أكثر من هذه المدة.</p><select id="rcd">${DAYS.map((d) => `<option value="${d}"${Number(CFG.days) === d ? " selected" : ""}>${d} يومًا</option>`).join("")}</select></div>
  <div class="card"><b>حفظ آخر نقطة (متابعة من الموضع)</b><p class="mut">يعمل حاليًا للدروس المرئية والمشاريع فقط، لأنهما يحفظان الموضع. غيرهما يُفتح من البداية بزر «إعادة فتح».</p><button class="chip" id="rcp">${CFG.pos === false ? "الميزة متوقفة: تفعيل" : "الميزة مفعّلة: إيقاف"}</button></div>
  <div class="card"><b>أنواع المحتوى التي تدخل السجل</b></div>${Object.keys(CT).map((c) => `<div class="item"><div class="tx"><b>${esc(CT[c])}</b><small>${offT.includes(c) ? '<span style="color:var(--no)">مستبعد من السجل</span>' : "يدخل السجل"}</small></div><button class="chip" data-ty="${c}">${offT.includes(c) ? "تفعيل" : "استبعاد"}</button></div>`).join("")}
  <div class="card"><b>استبعاد صفحات أو أقسام من السجل</b><p class="mut">لا تُسجَّل إلا صفحات تشغيل المحتوى التعليمي المنشور؛ هنا تستبعد قسمًا كاملًا إن لزم.</p></div>${Object.keys(SRC).map((s) => `<div class="item"><div class="tx"><b>${esc(SRC[s])}</b><small>${offS.includes(s) ? '<span style="color:var(--no)">مستبعد</span>' : "يُسجَّل"}</small></div><button class="chip" data-sr="${s}">${offS.includes(s) ? "تفعيل" : "استبعاد"}</button></div>`).join("")}`;
  $("#rcd", B).onchange = async (e) => { if (await setCfg("days", Number(e.target.value))) { toast("حُفظت المدة"); reload(); } };
  $("#rcp", B).onclick = async () => { if (await setCfg("pos", CFG.pos === false)) { toast("تم"); reload(); } };
  const flip = (attr, key) => $$("[" + attr + "]", B).forEach((b) => (b.onclick = async () => { const v = b.getAttribute(attr), cur = (CFG[key] || []).slice(), i = cur.indexOf(v); if (i >= 0) cur.splice(i, 1); else cur.push(v); if (await setCfg(key, cur)) { toast("تم"); reload(); } }));
  flip("data-ty", "off_types"); flip("data-sr", "off_srcs");
}
function errs(B, reload) {
  const by = {}; ERRS.forEach((e) => { const k = e.kind + "|" + e.msg; by[k] = by[k] || { kind: e.kind, msg: e.msg, ids: [], n: 0 }; by[k].n++; by[k].ids.push(e.id); });
  const list = Object.values(by).sort((a, b) => b.n - a.n);
  B.innerHTML = `<div class="card"><b>أخطاء تسجيل الاستخدام (${list.length})</b><p class="mut">«محتوى غير منشور» يعني أن صفحة فُتحت لمحتوى غير منشور فلم يُسجَّل. «تعذّر التحقق» يعني فشل فحص النشر (شبكة). لا تحتوي هذه السجلات أي معلومة عن الطفل.</p></div>` + (list.map((e, i) => `<div class="item"><div class="tx"><b>${esc(e.kind === "recent-skip" ? e.msg : e.msg)}</b><small>${e.kind === "recent-skip" ? "محتوى غير منشور (لم يُسجَّل)" : "تعذّر التحقق"} · ${e.n} مرة</small></div><button class="chip" data-d="${i}">حذف السجل</button></div>`).join("") || '<p class="mut">لا أخطاء مسجلة.</p>');
  $$("[data-d]", B).forEach((b) => (b.onclick = async () => { const e = list[+b.dataset.d]; if (!confirm("حذف سجلات هذا الخطأ؟")) return; try { const q = await sb.from("pf_errors").delete().in("id", e.ids); if (q.error) throw q.error; toast("حُذف"); reload(); } catch (x) { fail(x); } }));
}
window.__recentTest = { chk };
})();
