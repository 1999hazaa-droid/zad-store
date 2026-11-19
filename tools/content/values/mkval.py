# -*- coding: utf-8 -*-
"""يولّد values/values.js من ready/ready.js: python3 tools/content/values/mkval.py"""
import os, re
R = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
s = open(R + '/ready/ready.js', encoding='utf-8').read()
def cut(a, b, new=''):
    global s
    i = s.index(a); j = s.index(b, i)
    s = s[:i] + new + s[j:]
s = s.replace('S.ready', 'S.val').replace('ready_items', 'val_items').replace('ready_events', 'val_events').replace('zad-ready-lv', 'zad-val-lv').replace('zad-ready-cache', 'zad-val-cache')
s = s.replace('/* الاستعداد المدرسي والتعلم المبكر - زاد: رئيسية + لعب + يومي الأول + اختبار مهارات + تقدم + دليل + طباعة. التقدم محلي (S.val). لا حسابات ولا بيانات شخصية. */', '/* التربية والقيم والسلوك الإيجابي - زاد: رئيسية + لعب + قصص تفاعلية + تحديات + تقدم + دليل + طباعة. التقدم محلي (S.val). لا حسابات ولا بيانات شخصية، ولا أحكام على الطفل. */')
# ثوابت
CONST = '''const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const PATHS = { honesty: ["الصدق والأمانة", "1f511", ["honesty"]], respect: ["الاحترام والتقدير", "1f64f", ["respect"]], coop: ["التعاون والمشاركة", "1f9e9", ["coop"]], empathy: ["التعاطف ومراعاة الآخرين", "1f60a", ["empathy"]], resp: ["المسؤولية والاعتماد على النفس", "1f4aa", ["resp"]], patience: ["الصبر والانضباط", "23f3", ["patience"]], forgive: ["التسامح وحل الخلافات", "i_heart", ["forgive"]], clean: ["النظافة والمحافظة على البيئة", "1f9fc", ["clean"]], conf: ["الثقة بالنفس والمبادرة", "2b50", ["conf"]], what: ["ماذا ستفعل؟", "1f914", ["what"]], chal: ["التحديات", "1f3c6", ["chal"]] };
const VALS = ["honesty", "respect", "coop", "empathy", "resp", "patience", "forgive", "clean", "conf"];
const P = (cat) => cat;
const STEPS = { 1: ["مبتدئ", "نبدأ بالمواقف البسيطة"], 2: ["نامٍ", "ننمي الفهم بمواقف أوسع"], 3: ["متقدم", "نفكر ونطبق بتحدٍّ لطيف"] };
const KINDN = { lesson: "درس مصور", story: "قصة تفاعلية", choose: "ماذا ستفعل؟", order: "ترتيب خطوات", sort: "تصنيف السلوك", match: "توصيل", task: "نشاط مع الأسرة", challenge: "تحدٍّ اختياري" };
const SKILL = { lesson: "فهم معنى القيمة", story: "اتخاذ القرار وفهم أثر الاختيارات", choose: "اختيار التصرف المناسب", order: "ترتيب خطوات التصرف", sort: "التمييز بين التصرفات", match: "التعبير عن المشاعر والكلمات", task: "التطبيق مع الأسرة", challenge: "الالتزام بعادة طيبة" };
let MODE = null, CHK = false;
'''
cut('const LV = {', '/* ===== التقدم ===== */', CONST)
# فتح كل المستويات بلا قفل
s = s.replace('out[k] = { n: L.length, d, ok: open, items: L }; if (d < L.length) open = false;', 'out[k] = { n: L.length, d, ok: true, items: L };')
# الشارات
cut('function badges() {', '/* ===== الصوت', '''function badges() {
  const out = [], core = ITEMS.filter((x) => VALS.includes(x.cat) || x.cat === "what"), all = core.filter((x) => isDone(x.slug)).length;
  [[1, "بداية جميلة"], [5, "خمسة أنشطة"], [10, "عشرة أنشطة"], [25, "خمسة وعشرون نشاطا"]].forEach(([n, t]) => { if (all >= n) out.push([t, "i_star"]); });
  VALS.forEach((c) => { const n = ITEMS.filter((x) => x.cat === c && isDone(x.slug)).length; if (n >= 3) out.push(["نجمة " + PATHS[c][0], PATHS[c][1]]); });
  const st = ITEMS.filter((x) => x.kind === "story" && isDone(x.slug)).length; if (st >= 3) out.push(["قارئ القصص", "i_book"]);
  ITEMS.filter((x) => x.kind === "challenge" && isDone(x.slug)).forEach((x) => out.push(["أتممت " + x.title, "1f3c6"]));
  return out;
}
''')
# الرئيسية والتصنيف
cut('/* ===== الرئيسية + المسارات ===== */', '/* ===== اللعب ===== */', r'''/* ===== الرئيسية + القيم ===== */
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), c = p.get("c"); setLv(lv);
  if (c && PATHS[c]) return catView(box, c, lv);
  const tot = VALS.concat(["what", "chal"]).reduce((a, k) => a.concat(forLv(k, lv)), []), dn = tot.filter((x) => isDone(x.slug)).length, young = lv === "a2" || lv === "a3";
  const card = (k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<a class="dgc vcard" data-c="${k}" href="?c=${k}&lv=${lv}"><img src="${icon(PATHS[k][1])}" alt="" width="64" height="64"><b>${esc(PATHS[k][0])}</b><small>${its.length ? AD(d) + " من " + AD(its.length) + " أنشطة" : "لا أنشطة لهذه المرحلة"}</small><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></a>`; };
  box.innerHTML = `<div class="hero"><img src="${icon("1f60a")}" alt=""><div><h1>التربية والقيم والسلوك الإيجابي</h1><p>قصص تفاعلية ومواقف يومية وألعاب وتحديات لطيفة تغرس الصدق والاحترام والتعاون والتعاطف، بلا أحكام ولا مقارنات.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: دروس قصيرة وتوصيل ونشاط مع الأسرة، ويجلس الكبير مع الطفل ويقرأ له." : "تُعرض الأنشطة المناسبة لهذه المرحلة، ويمكن تغييرها في أي وقت."}</p></div>
<section class="art"><h2>أين وصلت؟ ${AD(dn)} من ${AD(tot.length)} نشاطا</h2><div class="bar"><i style="width:${tot.length ? (dn / tot.length) * 100 : 0}%"></i></div></section>
<section class="art"><h2>ابدأ من هنا</h2><div class="rdfeat">${["what", "chal"].map(card).join("")}</div></section>
<section class="art"><h2>القيم</h2><div class="dgcats">${VALS.map(card).join("")}</div></section>
<section class="art"><h2>المستويات الثلاثة</h2><ol class="dgsteps">${[1, 2, 3].map((k) => `<li><b>${STEPS[k][0]}</b>: ${esc(STEPS[k][1])}</li>`).join("")}</ol><p class="hint">كل المواقف مفتوحة للطفل، ويمكنه الإعادة والمراجعة متى شاء بلا عقوبة.</p></section>
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة ولي الأمر</a><a class="abtn" href="guide/">دليل ولي الأمر</a><a class="abtn" href="print/">أوراق وبطاقات للطباعة</a></div></section>
<section class="art"><h2>مرتبط بأقسام المكتبة</h2><div class="lks"><a class="abtn" href="${ROOT}stories/">القصص</a><a class="abtn" href="${ROOT}life/">المهارات الحياتية</a><a class="abtn" href="${ROOT}ready/">الاستعداد المدرسي</a><a class="abtn" href="${ROOT}library/">أوراق العمل</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function catView(box, c, lv) {
  const info = stepInfo(c, lv), ks = Object.keys(info).map(Number);
  box.innerHTML = `<div class="hero"><img src="${icon(PATHS[c][1])}" alt=""><div><h1>${esc(PATHS[c][0])}</h1><p>المرحلة: ${esc(LV[lv])}. اختر ما يعجبك، وأعد المحاولة متى شئت.</p></div></div>${stagePills(lv, "./?c=" + c)}
${ks.length ? ks.map((k) => { const s = info[k]; return `<section class="art dgstep"><h2>${AD(k)}. ${STEPS[k][0]} <small>${AD(s.d)} من ${AD(s.n)}</small></h2><div class="dgl">${s.items.map((x) => `<a class="dgi${isDone(x.slug) ? " done" : ""}" href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><span><b>${esc(x.title)}</b><small>${esc(KINDN[x.kind])}${isDone(x.slug) ? " · أكملتها" : ""}</small></span></a>`).join("")}</div></section>`; }).join("") : `<div class="sempty"><h3>لا أنشطة لهذه المرحلة بعد</h3><p class="hint">اختر مرحلة أخرى من الأعلى.</p></div>`}
<p><a class="abtn" href="./?lv=${lv}">كل القيم</a></p>`;
}
''')
# إزالة التتبع
cut('function tracePath(', 'function playPage(', '')
s = s.replace('const D8 = (a) => a;\n', '')
# نص نهاية الإكمال
s = s.replace('${wrong ? `<p class="hint">التجربة والإعادة جزء من التعلم، وكل محاولة تقرّبك من إتقان المهارة.</p>` : ""}', '${wrong ? `<p class="hint">التجربة والتفكير في الاختيارات جزء من التعلم، وكل محاولة تقرّبنا من التصرف الجميل.</p>` : ""}')
# playPage: احذف الأنواع غير المستخدمة وأضف الجديدة
def keep_branch(a, b):
    i = s.index(a); j = s.index(b, i); return s[i:j]
i0 = s.index('function playPage(')
pre = s[:i0]
pp = s[i0:s.index('/* ===== يومي الأول في المدرسة ===== */')]
post_i = s.index('/* ===== لوحة ولي الأمر ===== */')
tail_guard = s[post_i:]
def seg(a, b): 
    i = pp.index(a); j = pp.index(b, i); return pp[i:j]
head_pp = pp[:pp.index('  if (it.kind === "lesson") {')]
lesson = seg('  if (it.kind === "lesson") {', '  } else if (it.kind === "choose") {')
choose = seg('  } else if (it.kind === "choose") {', '  } else if (it.kind === "order") {')
order = seg('  } else if (it.kind === "order") {', '  } else if (it.kind === "sort") {')
sort_ = seg('  } else if (it.kind === "sort") {', '  } else if (it.kind === "pattern") {')
match = seg('  } else if (it.kind === "match") {', '  } else if (it.kind === "odd") {')
task = pp[pp.index('  } else if (it.kind === "task") {'):]
task = task[:task.rindex('}')].rstrip() + '\n'   # بلا القوس الأخير لدالة playPage
NEW = r'''  } else if (it.kind === "story") {
    let i = 0; const pg = d.pages;
    const pages = () => { const g = pg[i], last = i === pg.length - 1; box.innerHTML = `${head}<div class="spage"><img src="${icon(g.img)}" alt="" width="170" height="170"><p class="stx">${esc(g.t)}</p>${spk(g.t, "استمع إلى الصفحة")}</div><div class="btns"><button type="button" class="abtn" id="pv" ${i ? "" : "disabled"}>▶ السابقة</button><button type="button" class="abtn go" id="nx">${last ? "ماذا تختار؟" : "التالية ◀"}</button></div>${back}`; $("#pv").onclick = () => { i--; pages(); }; $("#nx").onclick = () => { if (last) dil(); else { i++; pages(); } }; };
    const dil = () => {
      const o = shuf(d.dilemma.opts.map((x, j) => [x, j]));
      box.innerHTML = `${head}<div class="qq">${esc(d.dilemma.q)}</div>${spk(d.dilemma.q + " " + o.map((z) => z[0].t).join("، "), "استمع")}<p class="hint">اختر ما تراه مناسبا، وسنرى معا ماذا يحدث. يمكنك تجربة كل الخيارات.</p><div class="opts">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${esc(z[0].t)}</button>`).join("")}</div><div class="rv" id="vres" hidden></div><div class="btns"><button type="button" class="abtn go" id="vnx" hidden>أكمل القصة</button></div>${back}`;
      box.querySelectorAll(".opt").forEach((b) => b.onclick = () => { const z = o[+b.dataset.j], r = $("#vres"); r.hidden = false; r.innerHTML = `<b>ماذا حدث؟</b><p>${esc(z[0].res)}</p>${spk(z[0].res, "استمع")}`;
        if (z[1] === 0) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); $("#vnx").hidden = false; $("#vnx").onclick = quiz; }
        else { wrong++; b.classList.add("seen"); b.disabled = true; } });
    };
    const quiz = () => { const m = mc(d.quiz.q, d.quiz.o, null, d.quiz.why, act); box.innerHTML = head + m.html + back; m.bind(box); };
    const act = () => { box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="110" height="110"></div><div class="rv"><b>أطبق القيمة اليوم:</b><p>${esc(d.act)}</p></div>${spk(d.act, "استمع")}<div class="btns"><button type="button" class="abtn go" id="dn">أنهيت القصة</button></div>${back}`; $("#dn").onclick = () => finish(it, wrong, lv); };
    pages();
  } else if (it.kind === "challenge") {
    const st = (S.val.ch = S.val.ch || {}); const ck = (st[it.slug] = st[it.slug] || d.days.map(() => false));
    const dr = () => { const n = ck.filter(Boolean).length; box.innerHTML = `${head}<div class="spage"><img src="${icon(it.icon)}" alt="" width="110" height="110"></div><p class="hint"><b>هدف التحدي:</b> ${esc(d.goal)}</p><p class="hint">التحدي اختياري، يضع الطفل علامة بمساعدة الكبير، ولا حاجة إلى أي صور أو معلومات شخصية.</p><ul class="dgck">${d.days.map((x, i) => `<li><label><input type="checkbox" data-i="${i}" ${ck[i] ? "checked" : ""}> <span>اليوم ${AD(i + 1)}: ${esc(x)}</span></label></li>`).join("")}</ul><p class="hint">أنجزت ${AD(n)} من ${AD(d.days.length)}. لا بأس إن أكملته على مهل.</p>${it.family ? `<div class="rv"><b>اقتراح للأسرة:</b><p>${esc(it.family)}</p></div>` : ""}${spk(d.goal, "استمع إلى الهدف")}<div class="btns"><button type="button" class="abtn go" id="dn" ${n === d.days.length ? "" : "disabled"}>أتممت التحدي</button><a class="abtn" href="../?c=chal&lv=${lv}">رجوع إلى التحديات</a></div>`;
      box.querySelectorAll("[data-i]").forEach((c) => c.onchange = () => { ck[+c.dataset.i] = c.checked; save(); dr(); }); $("#dn").onclick = () => finish(it, 0, lv); }; dr();
'''
new_pp = head_pp + lesson + choose + order + sort_ + match + NEW + task + '}\n'
mid = s[:i0] + new_pp
# اللوحة والدليل والطباعة والتشغيل: نبدّلها كلها
PROG = open(os.path.dirname(os.path.abspath(__file__)) + '/v_tail.js', encoding='utf-8').read()
s = mid + PROG
open(R + '/values/values.js', 'w', encoding='utf-8').write(s)
print(len(s))
