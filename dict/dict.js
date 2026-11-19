/* المعجم المصور والمفاهيم الأساسية - زاد: بطاقات مفردات مصورة + بحث وفهرس أبجدي + ألعاب + متابعة. التقدم محفوظ في هذا الجهاز فقط. */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const PAGE = D.body.dataset.page || "hub";
const ROOT = new URL(PAGE === "hub" ? "../" : "../../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const $$ = (s, r) => Array.from((r || D).querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuf(a).slice(0, n);
const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`);
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const TOP = { letters: ["الحروف والكلمات", "u_abc"], colors: ["الألوان والأشكال", "i_palette"], animals: ["الحيوانات", "1f431"], food: ["الفواكه والخضروات والأطعمة", "1f34e"], body: ["جسم الإنسان والحواس", "x_hand"], home: ["المنزل والمدرسة", "i_home"], nature: ["الطبيعة والبيئة", "1f333"], jobs: ["المهن ووسائل النقل", "x_doctor"], math: ["المفاهيم الرياضية", "i_numbers"], feelings: ["المشاعر والسلوكيات", "1f604"] };
const SUBL = { "animals:pet": "حيوانات أليفة", "animals:wild": "حيوانات برية", "animals:sea": "حيوانات بحرية", "animals:bird": "طيور", "animals:insect": "حشرات", "animals:cycle": "مراحل النمو", "food:fruit": "فواكه", "food:veg": "خضروات", "food:other": "أطعمة ومشروبات", "home:place": "في البيت", "home:furniture": "أثاث", "home:kitchen": "أدوات المطبخ", "home:school": "أدوات المدرسة", "home:clothes": "ملابس", "nature:sky": "السماء والطقس", "nature:plant": "نباتات", "nature:earth": "الأرض", "nature:care": "العناية بالبيئة", "jobs:job": "مهن", "jobs:tool": "أدوات", "jobs:land": "مركبات برية", "jobs:air": "مركبات جوية", "jobs:sea": "مركبات بحرية", "math:num": "أرقام", "math:op": "عمليات حسابية", "math:tool": "أدوات ومفاهيم", "colors:color": "ألوان", "colors:shape": "أشكال", "colors:size": "أحجام", "colors:pos": "مواقع", "feelings:feel": "مشاعر", "feelings:manners": "سلوكيات وآداب", "letters:lang": "اللغة والقراءة" };
const SEQL = { frog: "مراحل نمو الضفدع", butterfly: "مراحل نمو الفراشة", plant: "مراحل نمو النبتة", size: "من الأصغر إلى الأكبر" };
const SORTSKIP = new Set(["سلحفاة", "بطريق", "ضفدع", "قطرة ماء", "ماء", "مظلة", "ساعة", "صندوق", "بيضة", "بيض", "عسل", "حليب"]);
const LK = "zad-learn-v3", SK = "zad-dict-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; const d = (S.dict = S.dict || {}); d.w = d.w || {}; d.tp = d.tp || {}; d.g = d.g || {}; d.badges = d.badges || {}; d.pts = d.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
let ITEMS = [];
async function load() { try { ITEMS = await rest("dict_words?status=eq.published&order=sort_order.asc&select=slug,ar,en,topic,sub,letter,en_letter,icon,meaning,example,pl,syn,opp,seq,seq_n,levels,audio_url,sort_order"); } catch { ITEMS = null; } }
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 2600); }
/* ===== مساعدات الكلمات ===== */
const subl = (w) => SUBL[w.topic + ":" + w.sub] || TOP[w.topic][0];
const byAr = (a) => ITEMS.find((x) => x.ar === a);
const bySlug = (s) => ITEMS.find((x) => x.slug === s);
const elig = (lv) => ITEMS.filter((x) => x.levels.includes(lv));
const young = (lv) => lv === "a2" || lv === "a3";
const hasEn = (lv) => !young(lv);
const R = (s) => (S.dict.w[s] = S.dict.w[s] || { s: 0, h: 0, he: 0, ok: 0, oke: 0, bad: 0, t: 0 });
const mastered = (w) => R(w.slug).ok >= 3, masteredEn = (w) => R(w.slug).oke >= 3, needsRev = (w) => { const r = R(w.slug); return r.bad > r.ok && r.ok < 3; };
function topicUse(t) { S.dict.tp[t] = (S.dict.tp[t] || 0) + 1; }
const normA = (s) => String(s).toLowerCase().replace(/[ً-ْـ]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").split(/\s+/).map((t) => (t.startsWith("ال") && t.length > 3 ? t.slice(2) : t)).join(" ");
/* ===== الصوت: صوت الجهاز عند الضغط فقط، أو ملف الكلمة إن أضافته الإدارة ===== */
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W;
function speak(text, en) { if (!tts) return toast("الصوت غير متاح على هذا الجهاز."); try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.lang = en ? "en-US" : "ar-SA"; u.rate = 0.8; speechSynthesis.speak(u); } catch { toast("تعذر تشغيل الصوت."); } }
function sayW(w, which) {
  const r = R(w.slug); r.t = Date.now();
  if (which === "en") { r.he++; save(); return speak(w.en, true); }
  if (which === "ex") { save(); return speak(w.example, false); }
  r.h++; save();
  if (w.audio_url) { try { const a = new Audio(w.audio_url); a.play().catch(() => speak(w.ar, false)); return; } catch { /* يرجع إلى صوت الجهاز */ } }
  speak(w.ar, false);
}
W.addEventListener("pagehide", () => { if (tts) try { speechSynthesis.cancel(); } catch {} });
const sndBtn = (w, which, label) => `<button type="button" class="dsnd" data-say="${esc(w.slug)}" data-w="${which || "ar"}" aria-label="${esc(label || "استمع إلى نطق " + w.ar)}"><img src="${icon("i_sound")}" alt="" width="26" height="26"></button>`;
function bindSnd(root) { $$(".dsnd", root).forEach((b) => { if (b._b) return; b._b = 1; b.onclick = (e) => { e.preventDefault(); e.stopPropagation(); const w = bySlug(b.dataset.say); if (w) sayW(w, b.dataset.w); }; }); }
/* ===== الشارات ===== */
const BADGES = [["seen20", "مستكشف الكلمات", "تعرّف على ٢٠ كلمة", (s) => s.seen >= 20], ["heard10", "أذن صاغية", "استمع إلى نطق ١٠ كلمات", (s) => s.heard >= 10], ["g1", "أول لعبة", "أكمل أول لعبة", (s) => s.games >= 1], ["m10", "١٠ كلمات متقنة", "أتقن ١٠ كلمات بالأنشطة", (s) => s.mast >= 10], ["m30", "٣٠ كلمة متقنة", "أتقن ٣٠ كلمة بالأنشطة", (s) => s.mast >= 30], ["en10", "كلمات إنجليزية", "أتقن ١٠ كلمات إنجليزية", (s) => s.mastEn >= 10]];
function stats() { const L = ITEMS.map((w) => [w, R(w.slug)]); return { seen: L.filter(([, r]) => r.s > 0).length, heard: L.filter(([, r]) => r.h > 0 || r.he > 0).length, mast: L.filter(([w]) => mastered(w)).length, mastEn: L.filter(([w]) => masteredEn(w)).length, rev: L.filter(([w]) => needsRev(w)).length, games: Object.values(S.dict.g).reduce((a, g) => a + (g.n || 0), 0) }; }
function awardBadges() { const st = stats(), got = []; BADGES.forEach(([id, n, , f]) => { if (!S.dict.badges[id] && f(st)) { S.dict.badges[id] = Date.now(); got.push(n); } }); return got; }
/* ===== واجهات مشتركة ===== */
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${Object.keys(LV).map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
const wUrl = (w, lv) => `${ROOT}dict/word/?w=${encodeURIComponent(w.slug)}&lv=${lv}`;
function wcard(w, lv) { const r = S.dict.w[w.slug] || {}, m = r.ok >= 3; return `<div class="dwc${m ? " done" : ""}" data-slug="${esc(w.slug)}"><a class="dwa" href="${wUrl(w, lv)}"><img src="${icon(w.icon)}" alt="" width="64" height="64" loading="lazy"><b>${esc(w.ar)}</b>${hasEn(lv) ? `<small dir="ltr">${esc(w.en)}</small>` : ""}</a>${sndBtn(w)}</div>`; }
function fail(box) { box.innerHTML = `<div class="sempty"><h3>تعذر تحميل المعجم الآن</h3><p>تحقق من الاتصال ثم أعد المحاولة.</p><p><button type="button" class="abtn go" id="rt">إعادة المحاولة</button></p></div>`; $("#rt").onclick = () => location.reload(); }
/* ===== الصفحة الرئيسية ===== */
const ARL = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split(""), ENL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
function hubPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(); setLv(lv);
  const subs = Object.keys(SUBL);
  const sel = (id, lab, opts, v) => `<select id="${id}" aria-label="${lab}"><option value="">${lab}</option>${opts.map(([k, l]) => `<option value="${esc(k)}"${v === k ? " selected" : ""}>${esc(l)}</option>`).join("")}</select>`;
  const used = ITEMS.reduce((a, w) => { a[w.topic] = (a[w.topic] || 0) + 1; return a; }, {});
  box.innerHTML = `<div class="hero"><img src="${icon("i_books")}" alt=""><div><h1>المعجم المصور والمفاهيم الأساسية</h1><p>كلمات مع صورة ونطق ومعنى ومثال، ثم ألعاب تثبّتها. بالعربية والإنجليزية.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young(lv) ? "للأعمار الصغيرة: صور كبيرة وكلمات مفردة، ويجلس الكبير مع الطفل ويكرر الكلمة بصوته." : "تُعرض الألعاب والكلمات المناسبة لهذه المرحلة."} الترجمة الإنجليزية تظهر ابتداء من عمر ٤ سنوات.</p></div>
<div class="bkcats" id="dtopics">${Object.entries(TOP).map(([k, [l, i]]) => `<button type="button" class="bkct" data-t="${k}"><img src="${icon(i)}" alt="" width="40" height="40"><b>${esc(l)}</b><small>${AD(used[k] || 0)} كلمة</small></button>`).join("")}</div>
<section class="art"><h2>ابحث في المعجم</h2><input class="vsearch" id="dq" type="search" placeholder="اكتب كلمة عربية أو إنجليزية" aria-label="بحث عن كلمة" value="${esc(p.get("q") || "")}"><div class="vfil">${sel("ft", "الموضوع", Object.entries(TOP).map(([k, v]) => [k, v[0]]), p.get("t") || "")}${sel("fs", "التصنيف", subs.map((k) => [k, SUBL[k]]))}${sel("fl", "العمر أو الصف", Object.entries(LV), p.get("f") || "")}${sel("fa", "الحرف الأول", ARL.map((l) => [l, "عربي: " + l]).concat(ENL.map((l) => [l, "English: " + l])), p.get("a") || "")}</div><div class="vbtns"><button type="button" id="dclr">إلغاء التصفية والعودة إلى كل الكلمات</button></div></section>
<section class="art"><h2>الفهرس الأبجدي</h2><div class="dtabs" role="group" aria-label="لغة الفهرس"><button type="button" class="zpill on" id="ixa" aria-pressed="true">الحروف العربية</button><button type="button" class="zpill" id="ixe" aria-pressed="false">الحروف الإنجليزية</button></div><div class="dlet" id="dlet"></div><p class="hint" id="dlh">اضغط حرفا لتظهر كلماته.</p></section>
<section class="art"><h2 id="drt">كل الكلمات</h2><div class="dgrid" id="dres" aria-live="polite"></div><div class="vbtns"><button type="button" id="dmore" hidden>عرض المزيد</button></div></section>
<div class="btns"><a class="abtn go" href="${ROOT}dict/play/?lv=${lv}">ألعاب المعجم</a><a class="abtn" href="${ROOT}dict/progress/?lv=${lv}">لوحة المتابعة</a><a class="abtn" href="${ROOT}dict/guide/">دليل ولي الأمر</a></div>`;
  let ixEn = false, letter = p.get("a") || "", shown = 48;
  const f = () => ({ q: $("#dq").value.trim(), t: $("#ft").value, s: $("#fs").value, l: $("#fl").value, a: $("#fa").value });
  function list() {
    const q = f(), nq = normA(q.q); let L = ITEMS.filter((w) => {
      if (q.t && w.topic !== q.t) return false; if (q.s && (w.topic + ":" + w.sub) !== q.s && w.sub !== q.s) return false; if (q.l && !w.levels.includes(q.l)) return false;
      if (q.a) { if (/[A-Z]/.test(q.a)) { if (w.en_letter !== q.a) return false; } else if (w.letter !== q.a) return false; }
      if (nq && !(normA(w.ar).includes(nq) || w.en.toLowerCase().includes(nq) || (w.pl && normA(w.pl).includes(nq)) || (w.syn && normA(w.syn).includes(nq)))) return false; return true; });
    return L;
  }
  function render() {
    const L = list(), q = f(), act = q.q || q.t || q.s || q.l || q.a;
    $("#drt").textContent = act ? "النتائج: " + AD(L.length) + " كلمة" : "كل الكلمات (" + AD(ITEMS.length) + ")";
    $("#dres").innerHTML = L.length ? L.slice(0, shown).map((w) => wcard(w, lv)).join("") : `<div class="sempty"><h3>لا توجد كلمة بهذا الوصف</h3><p>جرّب كلمة أخرى أو ألغِ التصفية.</p></div>`;
    $("#dmore").hidden = L.length <= shown; bindSnd($("#dres"));
  }
  function letters() {
    const arr = ixEn ? ENL : ARL, cnt = (l) => ITEMS.filter((w) => (ixEn ? w.en_letter : w.letter) === l).length;
    $("#dlet").innerHTML = arr.map((l) => `<button type="button" class="dlt${l === letter ? " on" : ""}${cnt(l) ? "" : " off"}" data-l="${l}" ${cnt(l) ? "" : "disabled"} aria-label="الحرف ${l}: ${AD(cnt(l))} كلمة" ${ixEn ? 'dir="ltr"' : ""}>${l}<small>${AD(cnt(l))}</small></button>`).join("");
    $$(".dlt", $("#dlet")).forEach((b) => (b.onclick = () => { letter = letter === b.dataset.l ? "" : b.dataset.l; $("#fa").value = letter; $("#dlh").textContent = letter ? "كلمات الحرف " + letter + ":" : "اضغط حرفا لتظهر كلماته."; letters(); shown = 48; render(); if (letter) $("#drt").scrollIntoView({ block: "start" }); }));
  }
  $("#ixa").onclick = () => { ixEn = false; $("#ixa").classList.add("on"); $("#ixe").classList.remove("on"); $("#ixa").setAttribute("aria-pressed", "true"); $("#ixe").setAttribute("aria-pressed", "false"); letters(); };
  $("#ixe").onclick = () => { ixEn = true; $("#ixe").classList.add("on"); $("#ixa").classList.remove("on"); $("#ixe").setAttribute("aria-pressed", "true"); $("#ixa").setAttribute("aria-pressed", "false"); letters(); };
  ["#dq"].forEach((s) => $(s).addEventListener("input", () => { shown = 48; render(); }));
  ["#ft", "#fs", "#fl", "#fa"].forEach((s) => $(s).addEventListener("change", () => { shown = 48; if (s === "#fa") { letter = $("#fa").value; ixEn = /[A-Z]/.test(letter); letters(); } render(); }));
  $("#dclr").onclick = () => { ixEn = false; $("#ixa").classList.add("on"); $("#ixe").classList.remove("on"); $("#ixa").setAttribute("aria-pressed", "true"); $("#ixe").setAttribute("aria-pressed", "false"); $("#dq").value = ""; ["#ft", "#fs", "#fl", "#fa"].forEach((s) => ($(s).value = "")); letter = ""; shown = 48; letters(); render(); };
  $("#dmore").onclick = () => { shown += 48; render(); };
  $$(".bkct", $("#dtopics")).forEach((b) => (b.onclick = () => { $("#ft").value = b.dataset.t; shown = 48; render(); $("#drt").scrollIntoView({ block: "start" }); }));
  letters(); render();
}
/* ===== بطاقة المفردة ===== */
function wordPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), w = bySlug(p.get("w"));
  if (!w) return (box.innerHTML = `<div class="sempty"><h3>الكلمة غير موجودة أو غير منشورة</h3><p><a class="abtn go" href="../">المعجم</a></p></div>`);
  document.title = w.ar + " | المعجم المصور | منصة زاد التعليمية";
  const r = R(w.slug); r.s++; r.t = Date.now(); topicUse(w.topic); save();
  const same = ITEMS.filter((x) => x.slug !== w.slug && x.topic === w.topic && x.sub === w.sub), rel = (same.length >= 3 ? same : ITEMS.filter((x) => x.slug !== w.slug && x.topic === w.topic)).slice(0, 8);
  const seqG = w.seq ? ITEMS.filter((x) => x.seq === w.seq).sort((a, b) => a.seq_n - b.seq_n) : [];
  const pool = ITEMS.filter((x) => x.topic === w.topic), idx = pool.findIndex((x) => x.slug === w.slug), prev = pool[(idx - 1 + pool.length) % pool.length], next = pool[(idx + 1) % pool.length];
  const adv = !young(lv);
  const opp = w.opp ? byAr(w.opp) : null;
  box.innerHTML = `<article class="dword"><div class="dtop"><img class="dpic" src="${icon(w.icon)}" alt="رسمة كلمة ${esc(w.ar)}" width="160" height="160"><div class="dnm"><span class="dk">${esc(TOP[w.topic][0])} · ${esc(subl(w))}</span><h1 class="dar">${esc(w.ar)}</h1>${sndBtn(w, "ar", "استمع إلى نطق " + w.ar)}</div></div>
<div class="dbody"><p class="dm"><b>المعنى:</b> ${esc(w.meaning)}</p><p class="dm dex"><b>مثال:</b> ${esc(w.example)} <button type="button" class="dsnd s2" data-say="${esc(w.slug)}" data-w="ex" aria-label="استمع إلى المثال"><img src="${icon("i_sound")}" alt="" width="22" height="22"></button></p>
${w.en ? `<p class="dm den"><b>بالإنجليزية:</b> <span dir="ltr" lang="en">${esc(w.en)}</span> <button type="button" class="dsnd s2" data-say="${esc(w.slug)}" data-w="en" aria-label="استمع إلى النطق بالإنجليزية"><img src="${icon("i_sound")}" alt="" width="22" height="22"></button></p>` : ""}
<p class="dm"><b>الحرف الأول:</b> <a class="dchip" href="${ROOT}dict/?a=${encodeURIComponent(w.letter)}&lv=${lv}">${esc(w.letter)}</a>${w.en ? ` <a class="dchip" dir="ltr" href="${ROOT}dict/?a=${w.en_letter}&lv=${lv}">${esc(w.en_letter)}</a>` : ""}</p>
${adv && w.pl ? `<p class="dm"><b>المفرد:</b> ${esc(w.ar)} &nbsp; <b>الجمع:</b> ${esc(w.pl)}</p>` : ""}${adv && w.syn ? `<p class="dm"><b>مرادف:</b> ${esc(w.syn)}</p>` : ""}${adv && opp ? `<p class="dm"><b>ضد الكلمة:</b> <a class="dchip" href="${wUrl(opp, lv)}">${esc(opp.ar)}</a></p>` : ""}</div>
${seqG.length > 1 ? `<section class="dsec"><h2>${esc(SEQL[w.seq])}</h2><div class="dseq">${seqG.map((x) => `<a class="dseqi${x.slug === w.slug ? " on" : ""}" href="${wUrl(x, lv)}"><img src="${icon(x.icon)}" alt="" width="48" height="48"><span>${esc(x.ar)}</span></a>`).join("")}</div></section>` : ""}
<section class="dsec"><h2>كلمات مرتبطة</h2><div class="dgrid">${rel.map((x) => wcard(x, lv)).join("")}</div></section>
<div class="btns"><a class="abtn go" id="dprac" href="${ROOT}dict/play/?w=${encodeURIComponent(w.slug)}&lv=${lv}">تدرّب على هذه الكلمة</a><a class="abtn" href="${wUrl(prev, lv)}">الكلمة السابقة</a><a class="abtn" href="${wUrl(next, lv)}">الكلمة التالية</a><a class="abtn" href="${ROOT}dict/?t=${w.topic}&lv=${lv}">كل كلمات الموضوع</a></div>
<p class="hint">رؤية الصورة أو سماع الكلمة لا تعني الإتقان، فالإتقان يُسجَّل بعد الإجابة الصحيحة في الألعاب.</p></article>`;
  bindSnd(box);
}
/* ===== الألعاب ===== */
const GAMES = [
  ["listen", "استمع واختر الصورة", "تسمع الكلمة ثم تختار صورتها.", () => true, "ar"],
  ["match", "صِل الكلمة بالصورة", "وصّل كل كلمة بصورتها.", () => true, "ar"],
  ["pic", "شاهد الصورة واختر الكلمة", "ترى صورة وتختار اسمها.", (lv) => !young(lv), "ar"],
  ["first", "اختر الحرف الأول", "ما أول حرف في اسم الصورة؟", (lv) => !young(lv), "ar"],
  ["sort", "صنّف الكلمات", "ضع كل كلمة في موضوعها.", (lv) => !young(lv), "ar"],
  ["aren", "طابق العربية مع الإنجليزية", "وصّل الكلمة العربية بترجمتها.", (lv) => !young(lv) && lv !== "a4", "en"],
  ["order", "رتّب الصور حسب التسلسل", "من البداية إلى النهاية.", (lv) => ["a5", "a6", "g1", "g2", "g3", "g4"].includes(lv), "ar"],
  ["fill", "أكمل الكلمة الناقصة", "اختر الحرف الذي ينقص الكلمة.", (lv) => ["a6", "g1", "g2", "g3", "g4"].includes(lv), "ar"],
  ["anto", "اختر الكلمة المضادة", "ما عكس الكلمة؟", (lv) => ["a6", "g1", "g2", "g3", "g4"].includes(lv), "ar"],
  ["mean", "ما معنى الكلمة؟", "اقرأ المعنى واختر الكلمة.", (lv) => lv.startsWith("g"), "ar"],
  ["plural", "المفرد والجمع", "اختر جمع الكلمة.", (lv) => lv.startsWith("g") || lv === "a6", "ar"],
  ["syn", "اختر المرادف", "كلمة قريبة في المعنى.", (lv) => lv.startsWith("g"), "ar"],
  ["ctx", "الكلمة في الجملة", "أكمل الجملة بالكلمة المناسبة.", (lv) => lv === "g3" || lv === "g4", "ar"]
];
const gameInfo = (id) => GAMES.find((g) => g[0] === id);
function distract(w, pool, n) {
  const ok = (x) => x.slug !== w.slug && x.icon !== w.icon && x.ar !== w.ar;
  let c = pool.filter((x) => ok(x) && x.topic === w.topic && x.sub === w.sub);
  if (c.length < n) c = c.concat(pool.filter((x) => ok(x) && x.topic === w.topic && !c.includes(x)));
  if (c.length < n) c = c.concat(pool.filter((x) => ok(x) && !c.includes(x)));
  return pick(c, n);
}
const nOpts = (lv) => (young(lv) || lv === "a4" ? 3 : 4);
const nQ = (lv) => (young(lv) ? 4 : 6);
function letterOpts(correct, n) { return shuf([correct].concat(pick(ARL.filter((l) => l !== correct), n - 1))); }
function targets(pool, lv, focus, filt) { let L = filt ? pool.filter(filt) : pool; let T = pick(L.filter((x) => !focus || x.slug !== focus.slug), nQ(lv)); if (focus && (!filt || filt(focus))) T = [focus].concat(T.slice(0, nQ(lv) - 1)); return T; }
/* يعيد { rounds } أو null إذا لم تتوفر كلمات كافية لهذه اللعبة */
function build(id, lv, pool, focus) {
  const Q = nQ(lv), N = nOpts(lv), mk = (t) => t.map((w) => w);
  if (id === "listen" || id === "pic" || id === "mean") {
    if (pool.length < N + 1) return null; const T = targets(pool, lv, focus);
    return T.map((w) => { const o = shuf([w].concat(distract(w, pool, N - 1)));
      if (id === "listen") return { t: "mcq", prompt: "استمع إلى الكلمة ثم اختر صورتها", say: w, opts: o.map((x) => ({ img: x.icon, w: x, ok: x === w })), w, why: w.ar + ": " + w.meaning };
      if (id === "pic") return { t: "mcq", prompt: "ما اسم هذه الصورة؟", img: w.icon, say: w, opts: o.map((x) => ({ txt: x.ar, w: x, ok: x === w })), w, why: w.ar + ": " + w.meaning };
      return { t: "mcq", prompt: w.meaning, sub: "ما الكلمة التي لها هذا المعنى؟", opts: o.map((x) => ({ txt: x.ar, img: x.icon, w: x, ok: x === w })), w, why: w.ar + ": " + w.example }; });
  }
  if (id === "match") { const P = pick(pool, young(lv) ? 3 : lv === "a4" ? 4 : 5); if (P.length < 3) return null; return [{ t: "match", pairs: P.map((w) => ({ w, l: w.ar, r: w.icon })), young: young(lv), kind: "ar" }]; }
  if (id === "aren") { const P = pick(pool.filter((w) => w.en), 5); if (P.length < 4) return null; return [{ t: "match", pairs: P.map((w) => ({ w, l: w.ar, r: w.en, icon: lv.startsWith("a") ? w.icon : null })), en: true, kind: "en" }]; }
  if (id === "first") { if (pool.length < 4) return null; const T = targets(pool, lv, focus); return T.map((w) => ({ t: "mcq", prompt: "ما الحرف الأول من اسم هذه الصورة؟", img: w.icon, boxes: { word: w.ar, blank: 0 }, say: w, opts: letterOpts(w.letter, N).map((l) => ({ txt: l, ok: l === w.letter })), w, why: "تبدأ كلمة " + w.ar + " بحرف " + w.letter })); }
  if (id === "fill") { const f = (x) => x.ar.length >= 4 && !x.ar.includes(" "); if (pool.filter(f).length < 3) return null; const T = targets(pool, lv, focus, f); return T.map((w) => { const i = 1 + Math.floor(Math.random() * (w.ar.length - 2)), c = w.ar[i]; return { t: "mcq", prompt: "اختر الحرف الناقص في الكلمة", img: w.icon, boxes: { word: w.ar, blank: i }, say: w, opts: letterOpts(c, 3).map((l) => ({ txt: l, ok: l === c })), w, why: "الكلمة هي: " + w.ar }; }); }
  if (id === "anto") { const A = pool.filter((x) => x.opp && pool.some((y) => y.ar === x.opp)); if (A.length < 3) return null; const T = targets(A, lv, focus && focus.opp ? focus : null);
    return T.map((w) => { const o = pool.find((y) => y.ar === w.opp), ds = pick(A.filter((x) => (x.topic !== w.topic || x.sub !== w.sub) && x.ar !== w.opp && x.ar !== w.ar), 2); if (ds.length < 2) return null; const op = shuf([o].concat(ds)); return { t: "mcq", prompt: "ما الكلمة المضادة لكلمة «" + w.ar + "»؟", img: w.icon, say: w, opts: op.map((x) => ({ txt: x.ar, ok: x === o })), w, why: "ضد " + w.ar + " هو " + o.ar }; }).filter(Boolean); }
  if (id === "plural") { const A = pool.filter((x) => x.pl); if (A.length < 4) return null; const T = targets(A, lv, focus && focus.pl ? focus : null); return T.map((w) => { const ds = pick(A.filter((x) => x.pl !== w.pl && x.topic === w.topic).concat(A.filter((x) => x.pl !== w.pl)), 2); const dd = Array.from(new Set(ds.map((x) => x.pl))); const op = shuf([w.pl].concat(dd.slice(0, 2))); return { t: "mcq", prompt: "ما جمع كلمة «" + w.ar + "»؟", img: w.icon, say: w, opts: op.map((x) => ({ txt: x, ok: x === w.pl })), w, why: "المفرد " + w.ar + " والجمع " + w.pl }; }); }
  if (id === "syn") { const A = pool.filter((x) => x.syn); if (A.length < 3) return null; const T = targets(A, lv, focus && focus.syn ? focus : null); return T.map((w) => { const ds = Array.from(new Set(A.filter((x) => x.syn !== w.syn).map((x) => x.syn))); const op = shuf([w.syn].concat(pick(ds, 2))); return { t: "mcq", prompt: "ما الكلمة القريبة في المعنى من «" + w.ar + "»؟", img: w.icon, say: w, opts: op.map((x) => ({ txt: x, ok: x === w.syn })), w, why: w.ar + " و" + w.syn + " كلمتان متقاربتان في المعنى" }; }); }
  if (id === "ctx") { const stem = (w) => normA(w.ar.split(" ")[0]); const tk = (w) => { const t = w.example.replace(/[.،؟!]/g, "").split(" "), i = t.findIndex((z) => normA(z).includes(stem(w))); return i < 0 ? null : { t, i }; }; const A = pool.filter((x) => tk(x)); if (A.length < 4) return null; const T = targets(A, lv, focus && tk(focus) ? focus : null);
    return T.map((w) => { const k = tk(w), s = k.t.map((z, i) => (i === k.i ? "____" : z)).join(" ") + "."; const ds = pick(pool.filter((x) => x.topic !== w.topic), 2); const op = shuf([w].concat(ds)); return { t: "mcq", prompt: s, sub: "اختر الكلمة التي تكمل الجملة.", opts: op.map((x) => ({ txt: x.ar, ok: x === w })), w, why: "الجملة كاملة: " + w.example }; }); }
  if (id === "order") { const groups = {}; ITEMS.filter((x) => x.seq).forEach((x) => (groups[x.seq] = (groups[x.seq] || []).concat([x]))); const okG = Object.keys(groups).filter((k) => groups[k].every((x) => x.levels.includes(lv)) && groups[k].length >= 3); if (!okG.length) return null; const g = focus && focus.seq && okG.includes(focus.seq) ? focus.seq : pick(okG, 1)[0]; return [{ t: "order", label: SEQL[g], items: groups[g].slice().sort((a, b) => a.seq_n - b.seq_n) }]; }
  if (id === "sort") {
    const OK = pool.filter((x) => !SORTSKIP.has(x.ar) && !(x.topic === "home" && x.sub === "place") && x.sub !== "cycle"), per = young(lv) ? 2 : lv.startsWith("g") ? 3 : 3;
    const topics = Array.from(new Set(OK.map((x) => x.topic))).filter((t) => OK.filter((x) => x.topic === t).length >= per); if (topics.length < 2) return null;
    let G;
    if (pool.every((x) => x.topic === pool[0].topic)) { const ks = Array.from(new Set(OK.map((x) => x.sub))).filter((s) => OK.filter((x) => x.sub === s).length >= 2); if (ks.length < 2) return null; G = pick(ks, Math.min(3, ks.length)).map((s) => ({ n: SUBL[OK.find((x) => x.sub === s).topic + ":" + s] || s, i: OK.find((x) => x.sub === s).icon, words: pick(OK.filter((x) => x.sub === s), per) })); }
    else G = pick(topics, 3).map((t) => ({ n: TOP[t][0], i: TOP[t][1], words: pick(OK.filter((x) => x.topic === t), per) }));
    return [{ t: "sort", groups: G }];
  }
  return null;
}
function playHub() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(); setLv(lv);
  const focus = p.get("w") ? bySlug(p.get("w")) : null, review = p.get("mode") === "review", topic = p.get("t") || "";
  const all = elig(lv);
  const poolFor = () => { let P = all; if (topic) P = P.filter((x) => x.topic === topic); if (review) { const rv = ITEMS.filter((x) => needsRev(x)); if (rv.length) P = rv.concat(all.filter((x) => !rv.includes(x) && (!topic || x.topic === topic)).slice(0, 12)); } return P; };
  const P = poolFor();
  if (focus) { return runPractice(box, focus, lv); }
  box.innerHTML = `<div class="hero"><img src="${icon("i_puzzle")}" alt=""><div><h1>ألعاب المعجم</h1><p>العب لتتذكر الكلمات. الإجابة الصحيحة في الألعاب هي التي تُسجَّل كإتقان.</p></div></div>
<div class="stg"><b>مرحلة الطفل</b>${stagePills(lv, "./" + (topic ? "?t=" + topic : ""))}</div>
<section class="art"><h2>الموضوع</h2><div class="vfil"><select id="pt" aria-label="الموضوع"><option value="">كل المواضيع</option>${Object.entries(TOP).map(([k, v]) => `<option value="${k}"${topic === k ? " selected" : ""}>${esc(v[0])}</option>`).join("")}</select></div>${review ? '<p class="hint">وضع المراجعة: كلمات احتاج الطفل إلى إعادتها.</p>' : ""}<p class="hint">${AD(P.length)} كلمة مناسبة لمرحلة ${esc(LV[lv])}${topic ? " في هذا الموضوع" : ""}.</p></section>
<section class="art"><h2>اختر لعبة</h2><div class="dgames" id="dgames">${GAMES.filter((g) => g[3](lv)).map((g) => { const b = build(g[0], lv, P, null); return `<${b ? "a" : "div"} class="dgm${b ? "" : " off"}" ${b ? `href="${ROOT}dict/play/?g=${g[0]}&lv=${lv}${topic ? "&t=" + topic : ""}${review ? "&mode=review" : ""}"` : ""} data-g="${g[0]}"><b>${esc(g[1])}</b><small>${b ? esc(g[2]) : "لا تتوفر كلمات كافية لهذه اللعبة في هذا الاختيار."}</small></${b ? "a" : "div"}>`; }).join("")}</div></section>
<div class="btns"><a class="abtn" href="${ROOT}dict/?lv=${lv}">المعجم</a><a class="abtn" href="${ROOT}dict/progress/?lv=${lv}">لوحة المتابعة</a></div>`;
  $("#pt").onchange = () => (location.href = `${ROOT}dict/play/?lv=${lv}${$("#pt").value ? "&t=" + $("#pt").value : ""}${review ? "&mode=review" : ""}`);
}
function gameRoute() {
  const p = new URLSearchParams(location.search), g = p.get("g");
  if (!g || !gameInfo(g)) return playHub();
  const box = $("#aview"), lv = getLv(), topic = p.get("t") || "", review = p.get("mode") === "review";
  let P = elig(lv); if (topic) P = P.filter((x) => x.topic === topic); if (review) { const rv = ITEMS.filter((x) => needsRev(x) && x.levels.includes(lv)); if (rv.length >= 4) P = rv; }
  const gi = gameInfo(g);
  box.innerHTML = `<div class="sgp"><h1 style="margin:6px 0">${esc(gi[1])}</h1><div class="vmeta"><span>${esc(LV[lv])}</span>${topic ? `<span>${esc(TOP[topic][0])}</span>` : ""}</div></div><div id="area"></div><div id="resbox"></div><p><a class="abtn" href="${ROOT}dict/play/?lv=${lv}">كل الألعاب</a> <a class="abtn" href="${ROOT}dict/?lv=${lv}">المعجم</a></p>`;
  start(g, lv, P, null, topic);
}
function runPractice(box, w, lv) {
  document.title = "تدرّب على " + w.ar + " | منصة زاد التعليمية";
  const P = elig(lv).filter((x) => x.topic === w.topic).concat(w.levels.includes(lv) ? [] : [w]); const pool = P.length >= 4 ? P : elig(lv);
  const opts = GAMES.filter((g) => g[3](lv) && ["listen", "pic", "first", "fill", "mean", "anto", "plural", "syn", "ctx"].includes(g[0]));
  box.innerHTML = `<div class="sgp"><img class="big" src="${icon(w.icon)}" alt="" style="max-width:110px"><h1 style="margin:6px 0">تدرّب على كلمة «${esc(w.ar)}»</h1><p class="hint">أسئلة قصيرة عن هذه الكلمة وما يشبهها.</p></div><div id="area"></div><div id="resbox"></div><p><a class="abtn" href="${wUrl(w, lv)}">العودة إلى بطاقة الكلمة</a> <a class="abtn" href="${ROOT}dict/play/?lv=${lv}">كل الألعاب</a></p>`;
  const prio = ["listen", "pic", "first", "mean", "fill", "anto", "plural", "syn", "ctx"]; let rounds = null;
  for (const id of prio) { if (!opts.some((o) => o[0] === id)) continue; const r = build(id, lv, pool, w); if (r && r.some((q) => q.w === w)) { rounds = { id, r }; break; } }
  if (!rounds) { const id = young(lv) ? "listen" : "pic"; rounds = { id, r: build(id, lv, pool, w) }; }
  if (!rounds.r) return ($("#area").innerHTML = `<div class="sempty"><h3>لا توجد أسئلة كافية لهذه الكلمة الآن</h3></div>`);
  start(rounds.id, lv, pool, w, "", rounds.r);
}
function start(id, lv, pool, focus, topic, pre) {
  const rounds = pre || build(id, lv, pool, focus), area = $("#area"), res = $("#resbox");
  if (!rounds || !rounds.length) return (area.innerHTML = `<div class="sempty"><h3>لا تتوفر كلمات كافية لهذه اللعبة</h3><p>جرّب موضوعا آخر أو مرحلة أخرى.</p></div>`);
  let wrong = 0, total = 0; const seenW = new Set(); let qi = 0;
  const fb = (t, g) => { const f = $("#fb"); if (f) { f.className = "fb " + (g ? "g" : "b"); f.textContent = t; } };
  const OKM = ["أحسنت!", "صحيح، ممتاز!", "رائع، استمر!", "إجابة صحيحة!"];
  const GAME_EN = id === "aren";
  const good = (w, first) => { const r = R(w.slug); r.t = Date.now(); if (first) { if (GAME_EN) r.oke++; else r.ok++; } topicUse(w.topic); save(); };
  const badw = (w) => { const r = R(w.slug); r.bad++; r.t = Date.now(); save(); };
  const fin = () => { const n = total, stars = wrong === 0 ? 3 : wrong <= Math.max(2, Math.floor(n / 2)) ? 2 : 1, g = (S.dict.g[id] = S.dict.g[id] || { n: 0, best: 0 }); g.n++; g.best = Math.max(g.best, stars); const pts = 5 + stars * 3; S.dict.pts += pts; const got = awardBadges(); save();
    area.innerHTML = ""; res.innerHTML = `<div class="res"><div class="st" aria-label="${stars} نجوم">${"⭐".repeat(stars)}</div><h2>${stars === 3 ? "ممتاز! أجبت بلا أخطاء" : "أحسنت! أكملت اللعبة"}</h2><p>حصلت على ${AD(pts)} نقاط. مجموع نقاطك ${AD(S.dict.pts)}.</p>${got.length ? `<p class="bkbadge">🏅 شارة جديدة: <b>${esc(got.join("، "))}</b></p>` : ""}${stars < 3 ? '<p class="hint">يمكنك إعادة اللعبة، فالتكرار يثبّت الكلمات.</p>' : ""}<div class="btns"><button type="button" class="abtn go" id="again">أعد اللعبة</button><a class="abtn" href="${ROOT}dict/progress/?lv=${lv}">لوحة المتابعة</a></div></div>`; $("#again").onclick = () => { res.innerHTML = ""; if (pre && focus) start(id, lv, pool, focus, topic, build(id, lv, pool, focus) || pre); else start(id, lv, pool, focus, topic); }; res.scrollIntoView({ block: "nearest" }); };
  const fbbox = '<div class="fb" id="fb" role="status"></div>';
  const rd = rounds[0];
  const boxes = (b) => `<div class="dboxes" dir="rtl" aria-label="حروف الكلمة">${b.word.split("").map((c, i) => (c === " " ? `<i class="dsp"></i>` : `<span class="dbx${i === b.blank ? " bl" : ""}">${i === b.blank ? "؟" : esc(c)}</span>`)).join("")}</div>`;
  if (rd.t === "mcq") {
    total = rounds.length;
    const ask = () => { const q = rounds[qi]; let w1 = false; W.__dq = q;
      area.innerHTML = `<section class="art"><p class="hint">السؤال ${AD(qi + 1)} من ${AD(total)}. يمكنك المحاولة أكثر من مرة.</p>${q.img ? `<img class="bkq" src="${icon(q.img)}" alt="">` : ""}${q.boxes ? boxes(q.boxes) : ""}<div class="qq">${esc(q.prompt)}</div>${q.sub ? `<p class="hint">${esc(q.sub)}</p>` : ""}${q.say ? `<div class="vbtns">${sndBtn(q.say, "ar", "استمع إلى الكلمة")}</div>` : ""}<div class="opts dopts${q.opts.some((o) => o.img && !o.txt) ? " bkoi" : ""}">${q.opts.map((o, j) => `<button type="button" class="opt" data-j="${j}">${o.img ? `<img src="${icon(o.img)}" alt="" width="56" height="56">${o.txt ? "<br>" : ""}` : ""}${o.txt ? esc(o.txt) : ""}</button>`).join("")}</div>${fbbox}</section>`;
      bindSnd(area);
      $$(".opt", area).forEach((b) => (b.onclick = () => { if (b.disabled) return; const o = q.opts[+b.dataset.j];
        if (o.ok) { b.classList.add("good"); $$(".opt", area).forEach((x) => (x.disabled = true)); good(q.w, !w1); fb(OKM[qi % OKM.length] + " " + q.why, true); setTimeout(() => { qi++; if (qi < total) ask(); else fin(); }, 1500); }
        else { if (!w1) { w1 = true; wrong++; badw(q.w); } b.classList.add("bad"); b.disabled = true; fb("قريب! فكّر مرة أخرى وجرّب خيارا آخر.", false); } })); };
    ask();
  } else if (rd.t === "match") {
    const P = rd.pairs; total = P.length; let sel = null, done = 0; const flagged = new Set();
    const L = shuf(P.map((x, i) => [x, i])), Rr = shuf(P.map((x, i) => [x, i]));
    area.innerHTML = `<section class="art"><p class="hint" id="cnt">${AD(0)} من ${AD(total)}</p><div class="bkm"><div class="bkml">${L.map(([x, i]) => `<button type="button" class="bkn" data-l="${i}" ${rd.young ? `aria-label="استمع واختر"` : ""}>${rd.young ? `<img src="${icon("i_sound")}" alt="" width="36" height="36">` : `${rd.en && x.icon ? `<img src="${icon(x.icon)}" alt="" width="36" height="36"> ` : ""}<span>${esc(x.l)}</span>`}</button>`).join("")}</div><div class="bkmr">${Rr.map(([x, i]) => `<button type="button" class="bkn bkr" data-r="${i}">${rd.en ? `<span dir="ltr" lang="en">${esc(x.r)}</span>` : `<img src="${icon(x.r)}" alt="صورة ${esc(x.w.ar)}" width="50" height="50">`}</button>`).join("")}</div></div>${fbbox}</section>`;
    $$("[data-l]", area).forEach((b) => (b.onclick = () => { if (b.disabled) return; $$("[data-l]", area).forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = +b.dataset.l; if (rd.young) sayW(P[sel].w, "ar"); fb("اختر الآن ما يناسبها من العمود الآخر.", true); }));
    $$("[data-r]", area).forEach((b) => (b.onclick = () => { if (b.disabled) return; if (sel == null) return fb("اختر أولا من العمود الأول.", false); const k = +b.dataset.r, w = P[sel].w;
      if (k === sel) { b.disabled = true; b.classList.add("good"); const l = $(`[data-l="${sel}"]`, area); l.disabled = true; l.classList.remove("sel"); l.classList.add("good"); good(w, !flagged.has(sel)); sel = null; done++; $("#cnt").textContent = AD(done) + " من " + AD(total); fb(OKM[done % OKM.length], true); if (done === total) setTimeout(fin, 900); }
      else { if (!flagged.has(sel)) { flagged.add(sel); wrong++; badw(w); } b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 600); fb("ليس هذا، جرّب غيره بهدوء.", false); } }));
  } else if (rd.t === "order") {
    const I = rd.items; total = I.length; let k = 0; const flagged = new Set(); const tiles = shuf(I.map((x, i) => [x, i]));
    area.innerHTML = `<section class="art"><p class="hint">${esc(rd.label)}: اضغط الصور بالترتيب الصحيح من البداية إلى النهاية.</p><div class="bkans" id="ans" aria-label="الترتيب الذي اخترته"></div><div class="bkpool" id="pool">${tiles.map(([x, i]) => `<button type="button" class="bkt2" data-i="${i}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><br>${esc(x.ar)}</button>`).join("")}</div>${fbbox}</section>`;
    $$(".bkt2", area).forEach((b) => (b.onclick = () => { if (b.disabled) return; const i = +b.dataset.i, w = I[i];
      if (i === k) { b.disabled = true; b.classList.add("good"); const c = b.cloneNode(true); c.disabled = true; $("#ans").appendChild(c); b.style.visibility = "hidden"; good(w, !flagged.has(i)); k++; fb("صحيح!", true); if (k === total) setTimeout(fin, 900); }
      else { if (!flagged.has(k)) { flagged.add(k); wrong++; badw(I[k]); } b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 600); fb(k === 0 ? "ليست هذه هي البداية، جرّب غيرها." : "ليست هذه التالية، فكّر وجرّب غيرها.", false); } }));
  } else if (rd.t === "sort") {
    const G = rd.groups, items = shuf(G.flatMap((g, gi) => g.words.map((x) => [x, gi]))); total = items.length; let sel = null, placed = 0; const flagged = new Set();
    area.innerHTML = `<section class="art"><p class="hint">اضغط كلمة ثم اضغط مجموعتها.</p><div class="bkpool" id="pool">${items.map(([x], i) => `<button type="button" class="bkt2" data-i="${i}"><img src="${icon(x.icon)}" alt="" width="46" height="46"><br>${esc(x.ar)}</button>`).join("")}</div><div class="bkg">${G.map((g, gi) => `<button type="button" class="bkgp" data-g="${gi}"><img src="${icon(g.i)}" alt="" width="40" height="40"><b>${esc(g.n)}</b><span class="bkgi"></span></button>`).join("")}</div>${fbbox}</section>`;
    $$(".bkt2", area).forEach((b) => (b.onclick = () => { if (b.disabled) return; $$(".bkt2", area).forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = +b.dataset.i; fb("اضغط الآن المجموعة المناسبة.", true); }));
    $$(".bkgp", area).forEach((g) => (g.onclick = () => { if (sel == null) return fb("اختر أولا كلمة.", false); const [x, gi] = items[sel], b = $(`.bkt2[data-i="${sel}"]`, area);
      if (+g.dataset.g === gi) { b.disabled = true; b.style.visibility = "hidden"; $(".bkgi", g).insertAdjacentHTML("beforeend", `<em>${esc(x.ar)}</em>`); good(x, !flagged.has(sel)); sel = null; placed++; fb("صحيح!", true); if (placed === total) setTimeout(fin, 900); }
      else { if (!flagged.has(sel)) { flagged.add(sel); wrong++; badw(x); } fb("ليست هذه مجموعتها، جرّب مجموعة أخرى.", false); } }));
  }
}
/* ===== لوحة المتابعة ===== */
function progressPage() {
  const box = $("#aview"), lv = getLv(), st = stats(), L = elig(lv), D0 = S.dict;
  const mAr = L.filter((w) => mastered(w)).length, mEn = L.filter((w) => masteredEn(w)).length, rev = ITEMS.filter((w) => needsRev(w)).slice(0, 12), topics = Object.entries(D0.tp).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const heardL = ITEMS.filter((w) => R(w.slug).h > 0 || R(w.slug).he > 0).slice(0, 12), mastL = ITEMS.filter((w) => mastered(w)).slice(0, 12);
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0), chips = (a) => a.map((w) => `<a class="dchip" href="${wUrl(w, lv)}">${esc(w.ar)}</a>`).join("");
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة المتابعة: المعجم المصور</h1><p>تقدم الطفل في كلماته هو، دون مقارنته بأي طفل آخر.</p></div></div>
<div class="stg"><b>مرحلة الطفل</b>${stagePills(lv, "./")}</div>
<div class="pg2"><div><b id="pgs">${AD(st.seen)}</b>كلمة تعرّف عليها</div><div><b id="pgh">${AD(st.heard)}</b>كلمة استمع لنطقها</div><div><b id="pgm">${AD(st.mast)}</b>كلمة أتقنها بالألعاب</div><div><b id="pgr">${AD(st.rev)}</b>كلمة تحتاج مراجعة</div></div>
<p class="hint">مشاهدة الصورة أو سماع الكلمة لا تُحسب إتقانا. تُحسب الكلمة متقنة بعد ٣ إجابات صحيحة من المحاولة الأولى في الألعاب.</p>
<section class="art"><h2>التقدم في العربية والإنجليزية (${esc(LV[lv])})</h2><div class="sks"><div><span>كلمات عربية متقنة</span><b>${AD(mAr)} من ${AD(L.length)}</b><div class="bar"><i style="width:${pct(mAr, L.length)}%"></i></div></div>${hasEn(lv) ? `<div><span>كلمات إنجليزية متقنة</span><b>${AD(mEn)} من ${AD(L.length)}</b><div class="bar"><i style="width:${pct(mEn, L.length)}%"></i></div></div>` : `<p class="hint">تظهر لعبة العربية والإنجليزية من عمر ٥ سنوات.</p>`}</div></section>
<section class="art"><h2>الكلمات التي تحتاج إلى مراجعة</h2>${rev.length ? `<div class="dchips">${chips(rev)}</div><div class="btns"><a class="abtn go" id="drev" href="${ROOT}dict/play/?mode=review&lv=${lv}">راجع هذه الكلمات بالألعاب</a></div>` : `<p class="tx">لا توجد كلمات تحتاج إلى مراجعة الآن.</p>`}</section>
<section class="art"><h2>كلمات أتقنها</h2>${mastL.length ? `<div class="dchips">${chips(mastL)}</div>` : `<p class="tx">ستظهر هنا الكلمات بعد إتقانها في الألعاب.</p>`}</section>
<section class="art"><h2>كلمات استمع إلى نطقها</h2>${heardL.length ? `<div class="dchips">${chips(heardL)}</div>` : `<p class="tx">اضغط زر الصوت في بطاقة أي كلمة لتظهر هنا.</p>`}</section>
<section class="art"><h2>الموضوعات الأكثر استخداما</h2>${topics.length ? `<div class="sks">${topics.map(([k, n]) => `<div><span>${esc((TOP[k] || [k])[0])}</span><b>${AD(n)} مرة</b></div>`).join("")}</div>` : `<p class="tx">ستظهر الموضوعات بعد تصفح الكلمات واللعب.</p>`}</section>
<section class="art"><h2>الشارات والإنجازات</h2><div class="bkbs">${BADGES.map(([id, n, d]) => `<div class="bkbd${D0.badges[id] ? " on" : ""}"><span>${D0.badges[id] ? "🏅" : "🔒"}</span><b>${esc(n)}</b><small>${esc(d)}</small></div>`).join("")}</div></section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط ولا تُرسل إلى أي حساب.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح بيانات هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="${ROOT}dict/?lv=${lv}">المعجم</a><a class="abtn" href="${ROOT}dict/play/?lv=${lv}">ألعاب المعجم</a><a class="abtn" href="${ROOT}dict/guide/">دليل ولي الأمر</a></div>`;
  let arm = false; $("#rst").onclick = () => { if (!arm) { arm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد"; return; } S.dict = { w: {}, tp: {}, g: {}, badges: {}, pts: 0 }; save(); progressPage(); toast("تم المسح."); };
}
function guidePage() {
  const box = $("#aview");
  box.innerHTML = `<div class="hero"><img src="${icon("i_books")}" alt=""><div><h1>دليل ولي الأمر: المعجم المصور</h1><p>كيف تستفيد من المعجم مع طفلك خطوة بخطوة.</p></div></div>
<section class="art"><h2>ما هذا القسم؟</h2><p class="tx">معجم مصور يضم كلمات يومية بالعربية والإنجليزية في عشرة موضوعات. لكل كلمة صورة كرتونية واضحة ومعنى مبسط ومثال قصير وزر للنطق، ثم ألعاب تثبّت الكلمة.</p></section>
<section class="art"><h2>كيف نستخدمه مع كل مرحلة؟</h2><ol class="dgsteps"><li><b>من سنة إلى ٣ سنوات:</b> افتح بطاقة الكلمة واضغط زر الصوت وكرر الاسم بصوتك، ثم العب «استمع واختر الصورة» و«صِل الكلمة بالصورة» مع الطفل.</li><li><b>من ٤ إلى ٦ سنوات:</b> أضف الحروف الأولى والتصنيف، ثم الألعاب القصيرة، وتظهر الإنجليزية ابتداء من هذا العمر.</li><li><b>الصف الأول والثاني:</b> المعاني والمفرد والجمع والمضاد والمرادف والجمل القصيرة.</li><li><b>الصف الثالث والرابع:</b> الكلمات العلمية والرياضية ومعنى الكلمة في الجملة والتصنيف.</li></ol></section>
<section class="art"><h2>كيف يُقاس التقدم؟</h2><p class="tx">فتح البطاقة يسجّل «تعرّف على الكلمة»، والضغط على زر الصوت يسجّل «استمع». أما «الإتقان» فلا يُسجَّل إلا بعد ٣ إجابات صحيحة من المحاولة الأولى في الألعاب. الكلمات التي أخطأ فيها أكثر مما أصاب تظهر في «تحتاج مراجعة».</p></section>
<section class="art"><h2>ملاحظات صادقة</h2><ul class="tx"><li>النطق يصدر من صوت جهازك عند الضغط على الزر فقط، وجودة الصوت العربي تختلف من جهاز لآخر، وقد لا يتوفر صوت عربي على بعض الأجهزة. لا توجد تسجيلات صوتية بشرية لكل كلمة بعد، وتستطيع الإدارة إضافة ملف صوتي لأي كلمة.</li><li>راجعت المنصة الكلمات والترجمات والأمثلة داخليا، ولم يراجعها مختص لغوي بعد.</li><li>الصور مأخوذة من رسوم منصة زاد الكرتونية الموجودة، وبعض المفاهيم مثل «على» و«تحت» تُعرض برسوم مبسطة.</li><li>بيانات المتابعة محفوظة في هذا الجهاز فقط.</li></ul></section>
<div class="btns"><a class="abtn go" href="${ROOT}dict/">المعجم</a><a class="abtn" href="${ROOT}dict/play/">ألعاب المعجم</a></div>`;
}
(async function () {
  loadDB();
  if (PAGE === "guide") return guidePage();
  await load(); const box = $("#aview"); if (!ITEMS || !ITEMS.length) return fail(box);
  if (PAGE === "hub") hubPage(); else if (PAGE === "word") wordPage(); else if (PAGE === "play") gameRoute(); else if (PAGE === "progress") progressPage();
  bindSnd(D);
})();
})();
