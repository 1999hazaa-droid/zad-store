# -*- coding: utf-8 -*-
"""يولّد explore/explore.js من values/values.js: python3 tools/content/explore/mkexp.py"""
import os, re
R = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
s = open(R + '/values/values.js', encoding='utf-8').read()
def cut(a, b, new=''):
    global s
    i = s.index(a); j = s.index(b, i); s = s[:i] + new + s[j:]
s = s.replace('S.val', 'S.exp').replace('val_items', 'exp_items').replace('val_events', 'exp_events').replace('zad-val-', 'zad-exp-').replace('.val', '.exp')
s = re.sub(r'^/\*.*?\*/', '/* الثقافة العامة والمعرفة والاستكشاف - زاد: رئيسية + اكتشف العالم + دروس وبطاقات وألعاب واختبارات قصيرة + تقدم + دليل + طباعة. التقدم محلي (S.exp). لا حسابات ولا بيانات شخصية. */', s, count=1, flags=re.S)
CONST = '''const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const PATHS = { animals: ["عالم الحيوانات", "1f981", ["animals"]], plants: ["عالم النباتات", "1f331", ["plants"]], space: ["الفضاء والكواكب", "1f680", ["space"]], earth: ["الأرض والطبيعة", "1f310", ["earth"]], body: ["جسم الإنسان والحواس", "1f440", ["body"]], transport: ["وسائل النقل", "1f697", ["transport"]], jobs: ["المهن والأعمال", "x_doctor", ["jobs"]], places: ["البلدان والمعالم", "1f5fa", ["places"]], invent: ["الاختراعات والتقنية", "1f4a1", ["invent"]], culture: ["الثقافة والمعرفة العامة", "1f9e0", ["culture"]] };
const VALS = ["animals", "plants", "space", "earth", "body", "transport", "jobs", "places", "invent", "culture"];
const P = (cat) => cat;
const STEPS = { 1: ["أتعرف", "معلومات وصور أساسية"], 2: ["أكتشف", "أسئلة ومطابقة وتصنيف"], 3: ["أفهم", "تطبيق ومقارنة واستنتاج بسيط"] };
const KINDN = { lesson: "درس مصور", story: "قصة تعليمية", choose: "سؤال وجواب", quiz: "اختبار قصير", order: "ترتيب", sort: "تصنيف", match: "مطابقة", task: "استكشاف مع الأسرة" };
const SKILL = { lesson: "التعرف على معلومات جديدة", story: "فهم قصة علمية واستنتاج", choose: "الإجابة عن أسئلة المعرفة", quiz: "مراجعة المعلومات باختبار قصير", order: "ترتيب المراحل والخطوات", sort: "التصنيف والمقارنة", match: "ربط الصورة بالاسم", task: "الاستكشاف مع الأسرة" };
let MODE = null, CHK = false, QMSG = "";
'''
cut('const LV = {', '/* ===== التقدم ===== */', CONST)
cut('function badges() {', '/* ===== الصوت', '''function badges() {
  const out = [], all = ITEMS.filter((x) => isDone(x.slug)).length;
  [[1, "مستكشف جديد"], [5, "خمسة أنشطة"], [10, "عشرة أنشطة"], [25, "خمسة وعشرون نشاطا"]].forEach(([n, t]) => { if (all >= n) out.push([t, "i_star"]); });
  VALS.forEach((c) => { const n = ITEMS.filter((x) => x.cat === c && isDone(x.slug)).length; if (n >= 3) out.push(["مستكشف " + PATHS[c][0], PATHS[c][1]]); });
  const qz = ITEMS.filter((x) => x.kind === "quiz" && isDone(x.slug)).length; if (qz >= 3) out.push(["بطل الاختبارات القصيرة", "1f3c6"]);
  const dc = (S.exp.disc || []).length; if (dc >= 5) out.push(["اكتشفت خمسة موضوعات", "1f50d"]);
  return out;
}
''')
cut('/* ===== الرئيسية + القيم ===== */', '/* ===== اللعب ===== */', r'''/* ===== الرئيسية + التصنيفات ===== */
function discPick(lv) {
  const L = ITEMS.filter((x) => x.kind === "lesson" && x.levels.includes(lv)), seen = S.exp.disc || [], fresh = L.filter((x) => !seen.includes(x.slug));
  const pool = fresh.length ? fresh : L; return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
}
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), c = p.get("c"); setLv(lv);
  if (c && PATHS[c]) return catView(box, c, lv);
  const tot = VALS.reduce((a, k) => a.concat(forLv(k, lv)), []), dn = tot.filter((x) => isDone(x.slug)).length, young = lv === "a2" || lv === "a3";
  const card = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<a class="dgc vcard" data-c="${k}" href="?c=${k}&lv=${lv}"><img src="${icon(PATHS[k][1])}" alt="" width="64" height="64"><b>${esc(PATHS[k][0])}</b><small>${its.length ? AD(d) + " من " + AD(its.length) + " أنشطة" : "لا أنشطة لهذه المرحلة"}</small><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></a>`; };
  const dk = discPick(lv), tip = dk && dk.data.pages.find((g) => g.k === "example");
  box.innerHTML = `<div class="hero"><img src="${icon("1f9ed")}" alt=""><div><h1>الثقافة العامة والمعرفة والاستكشاف</h1><p>نتعرف على الحيوانات والنباتات والفضاء والأرض وأجسامنا والمهن والبلدان، بالصور والقصص والألعاب والتجارب الآمنة.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: صور وأصوات ومطابقة بسيطة، ويجلس الكبير مع الطفل ويقرأ له." : "تُعرض الأنشطة المناسبة لهذه المرحلة، ويمكن تغييرها في أي وقت."}</p></div>
<section class="art"><h2>أين وصلت؟ ${AD(dn)} من ${AD(tot.length)} نشاطا</h2><div class="bar"><i style="width:${tot.length ? (dn / tot.length) * 100 : 0}%"></i></div></section>
${dk ? `<section class="art" id="disc"><h2>اكتشف العالم</h2><a class="dgi" id="discgo" href="play/?s=${encodeURIComponent(dk.slug)}&lv=${lv}&d=1"><img src="${icon(dk.icon)}" alt="" width="52" height="52"><span><b>${esc(dk.title)}</b><small>موضوع اليوم، اضغط لتكتشفه</small></span></a>${tip ? `<p class="hint"><b>هل تعلم؟</b> ${esc(tip.t)}</p>` : ""}<p class="hint">يتغير الموضوع في كل مرة تفتح فيها القسم.</p></section>` : ""}
<section class="art"><h2>التصنيفات</h2><div class="dgcats">${VALS.map(card).join("")}</div></section>
<section class="art"><h2>المستويات الثلاثة</h2><ol class="dgsteps">${[1, 2, 3].map((k) => `<li><b>${STEPS[k][0]}</b>: ${esc(STEPS[k][1])}</li>`).join("")}</ol><p class="hint">كل المستويات مفتوحة، ويمكن للطفل الإعادة والمراجعة متى شاء بلا عقوبة.</p></section>
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة المتابعة</a><a class="abtn" href="guide/">دليل ولي الأمر</a><a class="abtn" href="print/">أوراق وبطاقات للطباعة</a></div></section>
<section class="art"><h2>مرتبط بأقسام المكتبة</h2><div class="lks"><a class="abtn" href="${ROOT}wiki/">الموسوعة</a><a class="abtn" href="${ROOT}experiments/">التجارب</a><a class="abtn" href="${ROOT}stories/">القصص</a><a class="abtn" href="${ROOT}library/">أوراق العمل</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function catView(box, c, lv) {
  const info = stepInfo(c, lv), ks = Object.keys(info).map(Number);
  box.innerHTML = `<div class="hero"><img src="${icon(PATHS[c][1])}" alt=""><div><h1>${esc(PATHS[c][0])}</h1><p>المرحلة: ${esc(LV[lv])}. اختر ما يعجبك، وأعد المحاولة متى شئت.</p></div></div>${stagePills(lv, "./?c=" + c)}
${ks.length ? ks.map((k) => { const s = info[k]; return `<section class="art dgstep"><h2>${AD(k)}. ${STEPS[k][0]} <small>${AD(s.d)} من ${AD(s.n)}</small></h2><div class="dgl">${s.items.map((x) => `<a class="dgi${isDone(x.slug) ? " done" : ""}" href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><span><b>${esc(x.title)}</b><small>${esc(KINDN[x.kind])}${isDone(x.slug) ? " · أكملتها" : ""}</small></span></a>`).join("")}</div></section>`; }).join("") : `<div class="sempty"><h3>لا أنشطة لهذه المرحلة بعد</h3><p class="hint">اختر مرحلة أخرى من الأعلى.</p></div>`}
<p><a class="abtn" href="./?lv=${lv}">كل التصنيفات</a></p>`;
}
''')
# النصوص العامة
s = s.replace('التجربة والتفكير في الاختيارات جزء من التعلم، وكل محاولة تقرّبنا من التصرف الجميل.', 'التجربة والمحاولة جزء من التعلم، وكل محاولة تقرّبنا من المعرفة.')
s = s.replace('<h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2>', '<h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2>${QMSG ? `<p class="hint">${esc(QMSG)}</p>` : ""}')
s = s.replace('الاستعداد المدرسي</a></p></div>`);', 'الثقافة العامة</a></p></div>`);')
# playPage: أزل الفرع القصصي القديم (حوار الخيارات) والتحدي، وأضف اختبارا قصيرا وقصة معرفية
i = s.index('  } else if (it.kind === "story") {'); j = s.index('  } else if (it.kind === "task") {')
NEW = r'''  } else if (it.kind === "story") {
    let i = 0; const pg = d.pages;
    const pages = () => { const g = pg[i], last = i === pg.length - 1; box.innerHTML = `${head}<div class="spage"><img src="${icon(g.img)}" alt="" width="170" height="170"><p class="stx">${esc(g.t)}</p>${spk(g.t, "استمع إلى الصفحة")}</div><div class="btns"><button type="button" class="abtn" id="pv" ${i ? "" : "disabled"}>▶ السابقة</button><button type="button" class="abtn go" id="nx">${last ? "سؤال القصة" : "التالية ◀"}</button></div>${back}`; $("#pv").onclick = () => { i--; pages(); }; $("#nx").onclick = () => { if (last) quiz(); else { i++; pages(); } }; };
    const quiz = () => { const m = mc(d.quiz.q, d.quiz.o, null, d.quiz.why, act); box.innerHTML = head + m.html + back; m.bind(box); };
    const act = () => { box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="110" height="110"></div><div class="rv"><b>جرّب بنفسك:</b><p>${esc(d.act)}</p></div>${spk(d.act, "استمع")}<div class="btns"><button type="button" class="abtn go" id="dn">أنهيت القصة</button></div>${back}`; $("#dn").onclick = () => finish(it, wrong, lv); };
    pages();
  } else if (it.kind === "quiz") {
    let n = 0, ok = 0, w0 = 0; const Q = d.qs;
    const ask = () => { w0 = wrong; const q = Q[n]; const m = mc(q.q, q.o, null, q.why, () => { if (wrong === w0) ok++; n++; if (n < Q.length) ask(); else { QMSG = "نتيجتك في الاختبار القصير: " + AD(ok) + " من " + AD(Q.length) + " من المحاولة الأولى. المراجعة تجعل المعلومة أثبت."; const qq = (S.exp.qz = S.exp.qz || {}); qq[it.slug] = Math.max(qq[it.slug] || 0, ok); finish(it, wrong, lv); QMSG = ""; } }, `<p class="hint">السؤال ${AD(n + 1)} من ${AD(Q.length)}</p>`); box.innerHTML = head + m.html + back; m.bind(box); };
    ask();
'''
s = s[:i] + NEW + s[j:]
# تتبع موضوع اكتشف العالم
s = s.replace('function finish(it, wrong, lv) {', 'function finish(it, wrong, lv) {\n  if (new URLSearchParams(location.search).get("d") && it.kind === "lesson") { const dd = (S.exp.disc = S.exp.disc || []); if (!dd.includes(it.slug)) dd.push(it.slug); }', 1)
i = s.index('/* ===== لوحة ولي الأمر ===== */'); j = s.index('(async () =>')
s = s[:i] + open(os.path.dirname(os.path.abspath(__file__)) + '/e_tail.js', encoding='utf-8').read() + s[j:]
open(R + '/explore/explore.js', 'w', encoding='utf-8').write(s)
print(len(s))
