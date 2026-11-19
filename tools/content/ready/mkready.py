# -*- coding: utf-8 -*-
"""يولّد ready/ready.js من digital/digital.js + أنواع جديدة: python3 tools/content/ready/mkready.py"""
import re, os
R = os.path.abspath(os.path.dirname(os.path.abspath(__file__)) + '/../../..')
s = open(R + '/digital/digital.js', encoding='utf-8').read()
def X(a, b, n=1):
    global s
    assert s.count(a) == n, (s.count(a), a[:70]); s = s.replace(a, b)
s = s.replace('S.dig', 'S.ready').replace('dig_items', 'ready_items').replace('dig_events', 'ready_events').replace('zad-dig-lv', 'zad-ready-lv').replace('zad-dig-cache', 'zad-ready-cache')
s = s.replace('/* المهارات الرقمية والتقنية - زاد: رئيسية + لعب + تقدم + طباعة. التقدم محلي داخل zad-learn-v3 (S.ready). لا حسابات ولا بيانات شخصية. */', '/* الاستعداد المدرسي والتعلم المبكر - زاد: رئيسية + لعب + يومي الأول + اختبار مهارات + تقدم + دليل + طباعة. التقدم محلي (S.ready). لا حسابات ولا بيانات شخصية. */')
X('const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : `${ROOT}images/zad/${c}.webp`);', 'const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`);')
# tables
s = re.sub(r'const LV = \{.*?\};\n', 'const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات تقريبا", g1: "الصف الأول", g2: "الصف الثاني" };\n', s, count=1, flags=re.S)
s = re.sub(r'const CATS = \{.*?\};\n', '''const PATHS = { lang: ["مسار الاستعداد اللغوي", "1f5e3", ["lang"]], math: ["مسار الاستعداد الرياضي", "i_n3", ["math"]], percep: ["مسار الإدراك والتركيز", "1f441", ["percep", "focus"]], motor: ["مسار المهارات الحركية", "i_pencil", ["motor"]], social: ["مسار الاستعداد الاجتماعي والمدرسي", "x_teacher", ["social", "indep"]] };
const P = (cat) => Object.keys(PATHS).find((k) => PATHS[k][2].includes(cat)) || "lang";
const AREAS = { letters: ["التعرف على الحروف", "lang"], numbers: ["الأرقام والعد", "math"], shapes: ["الأشكال والألوان", "percep"], sorting: ["المطابقة والتصنيف", "percep"], listening: ["الاستماع وفهم التعليمات", "lang"], memory: ["الذاكرة والانتباه", "percep"], motor: ["المهارات الحركية الدقيقة", "motor"] };
''', s, count=1, flags=re.S)
s = re.sub(r'const STEPS = \{.*?\};\n', 'const STEPS = { 1: ["مبتدئ", "نبدأ بالمهارات التمهيدية"], 2: ["نامٍ", "ننمي المهارة بتدريب أكثر"], 3: ["متقدم", "نطبق بتحدٍّ لطيف"] };\n', s, count=1, flags=re.S)
s = re.sub(r'const KINDN = \{.*?\};\n', 'const KINDN = { lesson: "درس مصور", choose: "اختيار", odd: "المختلف", quant: "عد ومقارنة", pattern: "اكتشاف النمط", memory: "لعبة الذاكرة", match: "توصيل", order: "ترتيب", sort: "تصنيف بالسحب", trace: "تتبع الخط", follow: "تعليمات", task: "نشاط مع الأسرة" };\nlet MODE = null, CHK = false;\n', s, count=1, flags=re.S)
# forLv by path, stepInfo, catStat, badges
X('const forLv = (cat, lv) => ITEMS.filter((x) => x.cat === cat && x.levels.includes(lv));', 'const forLv = (path, lv) => ITEMS.filter((x) => PATHS[path][2].includes(x.cat) && x.levels.includes(lv));')
i = s.index('function badges() {'); j = s.index('/* ===== الصوت')
s = s[:i] + '''function badges() {
  const out = [], all = Object.keys(S.ready.it).filter((k) => isDone(k) && ITEMS.some((x) => x.slug === k && PATHS[P(x.cat)] && x.cat !== "day" && x.cat !== "chk")).length;
  [[1, "بداية جميلة"], [5, "خمسة أنشطة"], [10, "عشرة أنشطة"], [25, "خمسة وعشرون نشاطا"]].forEach(([n, t]) => { if (all >= n) out.push([t, "i_star"]); });
  Object.keys(PATHS).forEach((c) => { const n = ITEMS.filter((x) => PATHS[c][2].includes(x.cat) && isDone(x.slug)).length; if (n >= 4) out.push(["نجم " + PATHS[c][0], PATHS[c][1]]); });
  if (S.ready.day) out.push(["أنهيت يومي الأول في المدرسة", "i_bag"]);
  return out;
}
''' + s[j:]
# hub + catView rewrite
i = s.index('/* ===== الرئيسية + التصنيف ===== */'); j = s.index('/* ===== اللعب ===== */')
s = s[:i] + '''/* ===== الرئيسية + المسارات ===== */
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), c = p.get("c"); setLv(lv);
  if (c && PATHS[c]) return catView(box, c, lv);
  const pk = Object.keys(PATHS), tot = pk.reduce((a, k) => a.concat(forLv(k, lv)), []), dn = tot.filter((x) => isDone(x.slug)).length, young = lv === "a2" || lv === "a3";
  box.innerHTML = `<div class="hero"><img src="${icon("x_teacher")}" alt=""><div><h1>الاستعداد المدرسي والتعلم المبكر</h1><p>مسارات وأنشطة وألعاب قصيرة تجهّز الطفل للمدرسة: لغة وأعداد وإدراك وتركيز ومهارات حركية واستعداد اجتماعي واستقلالية، بلا حسابات ولا عقوبات.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: ألعاب قصيرة تعتمد على اللمس، ويجلس الكبير مع الطفل ويقرأ التعليمات. لا اختبارات في هذه المرحلة." : "تُعرض الأنشطة المناسبة لهذه المرحلة، ويمكن تغييرها في أي وقت."}</p></div>
<section class="art"><h2>أين وصلت؟ ${AD(dn)} من ${AD(tot.length)} نشاطا</h2><div class="bar"><i style="width:${tot.length ? (dn / tot.length) * 100 : 0}%"></i></div></section>
<section class="art"><h2>ابدأ من هنا</h2><div class="rdfeat"><a class="dgc" href="day/?lv=${lv}"><img src="${icon("i_bag")}" alt="" width="64" height="64"><b>يومي الأول في المدرسة</b><small>مشاهد كرتونية بثمانية مواقف</small></a><a class="dgc" href="check/?lv=${lv}"><img src="${icon("i_target")}" alt="" width="64" height="64"><b>اختبار المهارات الأولية</b><small>ألعاب قصيرة غير ضاغطة</small></a></div></section>
<section class="art"><h2>مسارات التعلم</h2><div class="dgcats">${pk.map((k) => { const its = forLv(k, lv), d = its.filter((x) => isDone(x.slug)).length; return `<a class="dgc" href="?c=${k}&lv=${lv}"><img src="${icon(PATHS[k][1])}" alt="" width="64" height="64"><b>${esc(PATHS[k][0])}</b><small>${its.length ? AD(d) + " من " + AD(its.length) + " أنشطة" : "لا أنشطة لهذه المرحلة"}</small><span class="bar"><i style="width:${its.length ? (d / its.length) * 100 : 0}%"></i></span></a>`; }).join("")}</div></section>
<section class="art"><h2>المستويات الثلاثة</h2><ol class="dgsteps">${[1, 2, 3].map((k) => `<li><b>${STEPS[k][0]}</b>: ${esc(STEPS[k][1])}</li>`).join("")}</ol><p class="hint">لا ينتقل الطفل إلى مستوى أصعب إلا بعد إكمال أنشطة المستوى الحالي، ويستطيع مراجعة السابق متى شاء.</p></section>
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة ولي الأمر</a><a class="abtn" href="guide/">دليل ولي الأمر</a><a class="abtn" href="print/">أوراق وجداول للطباعة</a></div></section>
<section class="art"><h2>مرتبط بأقسام المكتبة</h2><div class="lks"><a class="abtn" href="${ROOT}language/">اللغة والمفردات</a><a class="abtn" href="${ROOT}stories/">القصص</a><a class="abtn" href="${ROOT}life/">المهارات الحياتية</a><a class="abtn" href="${ROOT}library/">أوراق العمل والرياضيات</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
}
function catView(box, c, lv) {
  const info = stepInfo(c, lv), ks = Object.keys(info).map(Number);
  box.innerHTML = `<div class="hero"><img src="${icon(PATHS[c][1])}" alt=""><div><h1>${esc(PATHS[c][0])}</h1><p>المرحلة: ${esc(LV[lv])}. أكمل أنشطة كل مستوى لتفتح المستوى التالي.</p></div></div>${stagePills(lv, "./?c=" + c)}
${ks.length ? ks.map((k) => { const s = info[k]; return `<section class="art dgstep${s.ok ? "" : " lock"}"><h2>${AD(k)}. ${STEPS[k][0]} <small>${AD(s.d)} من ${AD(s.n)}</small></h2>${s.ok ? `<div class="dgl">${s.items.map((x) => `<a class="dgi${isDone(x.slug) ? " done" : ""}" href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><span><b>${esc(x.title)}</b><small>${esc(KINDN[x.kind])}${isDone(x.slug) ? " · أكملتها" : ""}</small></span></a>`).join("")}</div>` : `<p class="hint">يفتح هذا المستوى بعد إكمال أنشطة المستوى السابق. يمكنك مراجعة ما أنجزته في أي وقت.</p>`}</section>`; }).join("") : `<div class="sempty"><h3>لا توجد أنشطة لهذه المرحلة بعد</h3></div>`}
<p><a class="abtn" href="./?lv=${lv}">كل المسارات</a></p>`;
}
''' + s[j:]
# nextOf / finish / playPage head
X('function nextOf(it, lv) { const info = stepInfo(it.cat, lv);', 'function nextOf(it, lv) { const info = stepInfo(P(it.cat), lv);')
i = s.index('function finish(it, wrong, lv) {'); j = s.index('function playPage() {')
s = s[:i] + '''function record(it, wrong) {
  const r = (S.ready.it[it.slug] = S.ready.it[it.slug] || { d: 0, w: 0, t: 0 }); const first = !r.d; r.d++; r.w += wrong; r.t = Date.now(); S.ready.pts += first ? 10 : 3; save();
  try { fetch(SB + "/rest/v1/ready_events", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ slug: it.slug, wrong: Math.min(wrong, 50) }) }).catch(() => {}); } catch {}
  return first;
}
function finish(it, wrong, lv) {
  if (MODE) return MODE.fn(it, wrong);
  const first = record(it, wrong), box = $("#aview"), nx = nextOf(it, lv);
  box.innerHTML = `<div class="res"><div class="st">⭐</div><h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2><p>حصلت على ${AD(first ? 10 : 3)} نقاط. مجموع نقاطك ${AD(S.ready.pts)}.</p>${wrong ? `<p class="hint">التجربة والإعادة جزء من التعلم، وكل محاولة تقرّبك من إتقان المهارة.</p>` : ""}
${it.family ? `<div class="rv"><b>نشاط مع الأسرة:</b><p>${esc(it.family)}</p></div>` : ""}
<div class="btns">${nx ? `<a class="abtn go" href="?s=${encodeURIComponent(nx.slug)}&lv=${lv}">النشاط التالي</a>` : ""}<button type="button" class="abtn" id="again">أعد النشاط</button><a class="abtn" href="../?c=${P(it.cat)}&lv=${lv}">${esc(PATHS[P(it.cat)][0])}</a></div></div>`;
  $("#again").onclick = () => location.reload();
}
const D8 = (a) => a;
''' + s[j:]
X('function playPage() {\n  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = ITEMS.find((x) => x.slug === p.get("s"));', 'function tracePath(sh, w, h) {\n  const N = 90, o = [], cx = w / 2, cy = h / 2; const seg = (a, b, n) => { for (let i = 0; i < n; i++) o.push([a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n]); };\n  if (sh === "line") seg([w - 50, cy], [50, cy], N); else if (sh === "wave") { for (let i = 0; i <= N; i++) { const t = i / N; o.push([w - 50 - t * (w - 100), cy + 55 * Math.sin(t * Math.PI * 4)]); } } else if (sh === "zigzag") { const v = [[w - 50, cy + 60], [w - 130, cy - 60], [w - 210, cy + 60], [w - 290, cy - 60], [w - 370, cy + 60], [50, cy - 60]]; for (let k = 0; k < v.length - 1; k++) seg(v[k], v[k + 1], 18); o.push(v[v.length - 1]); } else if (sh === "circle") { for (let i = 0; i < N; i++) { const t = -Math.PI / 2 - i / N * Math.PI * 2; o.push([cx + 100 * Math.cos(t), cy + 100 * Math.sin(t)]); } } else if (sh === "square") { const v = [[cx + 95, cy - 95], [cx - 95, cy - 95], [cx - 95, cy + 95], [cx + 95, cy + 95]]; for (let k = 0; k < 4; k++) seg(v[k], v[(k + 1) % 4], 22); } else { const v = [[cx, cy - 105], [cx - 115, cy + 95], [cx + 115, cy + 95]]; for (let k = 0; k < 3; k++) seg(v[k], v[(k + 1) % 3], 30); }\n  return o;\n}\nW.__rdPath = tracePath;\nfunction playPage(forced) {\n  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), it = forced || ITEMS.find((x) => x.slug === p.get("s"));')
X('<a class="abtn go" href="../">المهارات الرقمية</a>', '<a class="abtn go" href="../">الاستعداد المدرسي</a>')
X('const head = `<div class="qh"><h2>${esc(it.title)}</h2><small>${esc(CATS[it.cat][0])} · المستوى ${AD(it.step)}: ${STEPS[it.step][0]} · ${esc(KINDN[it.kind])}</small></div>`;\n  const back = `<p><a class="abtn" href="../?c=${it.cat}&lv=${lv}">رجوع إلى ${esc(CATS[it.cat][0])}</a></p>`;', 'const head = MODE ? `<div class="qh"><h2>${esc(it.title)}</h2><small>${esc(MODE.label(it))}</small></div>` : `<div class="qh"><h2>${esc(it.title)}</h2><small>${esc(PATHS[P(it.cat)][0])} · المستوى ${AD(it.step)}: ${STEPS[it.step][0]} · ${esc(KINDN[it.kind])}</small></div>`;\n  const back = MODE ? MODE.back : `<p><a class="abtn" href="../?c=${P(it.cat)}&lv=${lv}">رجوع إلى ${esc(PATHS[P(it.cat)][0])}</a></p>`;\n  CHK = !!(MODE && MODE.chk);')
# mc wrong in chk mode
X('else { wrong++; b.classList.add("bad"); b.disabled = true; fb((fbs ? fbs[z[1]] : "") + " جرّب خيارا آخر، لا بأس.", "b"); } })', 'else { wrong++; if (CHK) { root.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("شكرا لمحاولتك! لنكمل.", "g"); return void setTimeout(onOk, 900); } b.classList.add("bad"); b.disabled = true; fb((fbs ? fbs[z[1]] : "") + " جرّب خيارا آخر، لا بأس.", "b"); } })')
X('else { wrong++; b.classList.add("bad"); b.disabled = true; fb("ليس هذا هو التالي. انظر إلى التكرار وجرّب مرة أخرى.", "b"); } });', 'else { wrong++; if (CHK) { box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("شكرا لمحاولتك! لنكمل.", "g"); return void setTimeout(() => finish(it, wrong, lv), 900); } b.classList.add("bad"); b.disabled = true; fb("ليس هذا هو التالي. انظر إلى التكرار وجرّب مرة أخرى.", "b"); } });')
# swap new kinds in
i = s.index('  } else if (it.kind === "code") {'); j = s.index('  } else if (it.kind === "task") {')
s = s[:i] + open('' + os.path.dirname(os.path.abspath(__file__)) + '/r_new_kinds.js', encoding='utf-8').read() + s[j:]
# remove old progress/print and rewrite
i = s.index('/* ===== لوحة ولي الأمر ===== */')
s = s[:i] + open('' + os.path.dirname(os.path.abspath(__file__)) + '/r_tail.js', encoding='utf-8').read()
# رسومات المشاهد من كانفا (تُضاف الرسمة للمشهد فقط إذا وُجد ملفها)
OLD = '`<div class="spage"><img src="${icon(it.icon)}" alt="" width="150" height="150"><p class="stx">${esc(d.scene)}</p></div>`'
NEW = '`<div class="spage"><img src="${ART[it.slug] ? ROOT + "images/ready/" + ART[it.slug] + ".webp" : icon(it.icon)}" alt="" width="150" height="150" style="border-radius:18px"><p class="stx">${esc(d.scene)}</p></div>`'
assert OLD in s; s = s.replace(OLD, NEW)
s = s.replace('const D8 = (a) => a;', 'const D8 = (a) => a;\nconst ART = { day_2: "scene_day_2" };', 1)
assert 'const ART' in s
open(R + '/ready/ready.js', 'w', encoding='utf-8').write(s)
print(len(s))
