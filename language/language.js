/* عالم اللغات والمفردات - زاد: رئيسية + قواميس + تدريب + استماع + كتابة. التقدم داخل zad-learn-v3 مع بطاقات المكتبة. */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const PAGE = D.body.dataset.page || "hub";
const ROOT = new URL(PAGE === "hub" ? "../" : "../../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const nod = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "");
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const SU = (u) => (/^https?:/.test(u || "") ? u : ROOT + String(u || ""));
const icon = (c) => `${ROOT}images/zad/${c}.webp`;
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const TIERLV = { 1: ["a3", "a4"], 2: ["a5", "a6", "g1", "g2"], 3: ["g3", "g4"] };
const TIERN = { 1: "مبتدئ (٣–٤ سنوات)", 2: "متوسط (٥–٦ سنوات والصفان ١–٢)", 3: "متقدم (الصفان ٣–٤)" };
const tierOf = (lv) => ({ a2: 0, a3: 1, a4: 1, a5: 2, a6: 2, g1: 2, g2: 2, g3: 3, g4: 3 }[lv] || 0);
/* ===== التقدم (نفس مخزن البطاقات) ===== */
const LK = "zad-learn-v3"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; S.cards = S.cards || {}; const C = S.cards; C.c = C.c || {}; C.sk = C.sk || {}; C.bd = C.bd || []; C.st = C.st || 0; C.rounds = C.rounds || 0;
  S.lang = S.lang || {}; const L = S.lang; L.sk = L.sk || {}; L.it = L.it || {}; L.pr = L.pr || {}; L.rounds = L.rounds || 0; L.rv = L.rv || [];
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
function skill(k, ok) { const x = (S.lang.sk[k] = S.lang.sk[k] || { o: 0, w: 0 }); if (ok) x.o++; else x.w++; }
function ansItem(slug, ok, sk) { const r = (S.lang.it[slug] = S.lang.it[slug] || { o: 0, w: 0, t: 0, l: 0 }); r.t = Date.now(); if (ok) { r.o++; if (r.o >= 2) r.l = 1; } else { r.w++; if (r.l && r.w > r.o) r.l = 0; } skill(sk, ok); save(); }
function ansCard(c, ok, sk) { const r = (S.cards.c[c.slug] = S.cards.c[c.slug] || { s: 0, o: 0, w: 0, t: 0, l: 0 }); r.t = Date.now(); if (ok) { r.o++; if (r.o >= 2) r.l = 1; } else { r.w++; if (r.l && r.w > r.o) r.l = 0; } if (c.skill) S.cards.sk[c.skill] = (S.cards.sk[c.skill] || 0) + 1; skill(sk, ok); if (!ok) { const k = c.word_ar + (c.word_en ? " / " + c.word_en : ""); S.lang.rv = [k].concat(S.lang.rv.filter((x) => x !== k)).slice(0, 30); } save(); }
function practice(k) { S.lang.pr[k] = (S.lang.pr[k] || 0) + 1; save(); }
function addStars(n) { if (!n) return; S.stars = (S.stars || 0) + n; S.xp = (S.xp || 0) + 5 * n; S.cards.st += n; save(); }
/* ===== الصوت: لا تشغيل تلقائي، مصدر واحد ===== */
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W; let voices = [], AU = null;
if (tts) { const f = () => (voices = speechSynthesis.getVoices() || []); f(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", f); }
function stopSnd() { if (AU) { try { AU.pause(); } catch {} AU = null; } if (tts) try { speechSynthesis.cancel(); } catch {} }
function say(text, lang, url) {
  stopSnd();
  const viaTTS = () => {
    if (!tts) { toast("الصوت غير متاح على هذا الجهاز. يمكنك قراءة الكلمة بصوت مرتفع."); return; }
    const u = new SpeechSynthesisUtterance(text); const code = lang === "ar" ? "ar" : "en"; u.lang = lang === "ar" ? "ar-SA" : "en-US"; u.rate = .85;
    const v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith(code) && x.localService) || voices.find((x) => x.lang && x.lang.toLowerCase().startsWith(code)); if (v) { u.voice = v; u.lang = v.lang; } else if (voices.length) toast("لا يتوفر صوت " + (lang === "ar" ? "عربي" : "إنجليزي") + " على هذا الجهاز، قد يختلف النطق.");
    try { speechSynthesis.speak(u); } catch { toast("تعذّر تشغيل الصوت على هذا الجهاز."); }
  };
  if (url) { try { AU = new Audio(SU(url)); AU.onerror = () => { AU = null; viaTTS(); }; const p = AU.play(); if (p && p.catch) p.catch(() => { AU = null; viaTTS(); }); return; } catch { AU = null; } }
  viaTTS();
}
let tT = 0;
function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 3200); }
const spk = (text, lang, url, label) => `<button type="button" class="spk" data-say="${esc(text)}" data-lang="${lang}" data-url="${esc(url || "")}" aria-label="${esc(label || "استمع")}"><img src="${icon("i_sound")}" alt="" width="22" height="22"> ${esc(label || "استمع")}</button>`;
D.addEventListener("click", (e) => { const b = e.target.closest("[data-say]"); if (b) say(b.dataset.say, b.dataset.lang, b.dataset.url); });
/* ===== بيانات ===== */
let CARDS = [];
async function loadCards() {
  try { CARDS = await rest("cards?status=eq.published&order=sort_order.asc&select=slug,cat,sub,word_ar,word_en,image_url,audio_url,example,extra,ages,grades,skill&limit=1000"); try { localStorage.setItem("zad-lang-cards", JSON.stringify(CARDS)); } catch {} }
  catch { try { CARDS = JSON.parse(localStorage.getItem("zad-lang-cards") || localStorage.getItem("zad-cards-cache") || "[]"); } catch { CARDS = []; } }
  return CARDS;
}
async function loadItems(lang) { try { return await rest(`lang_items?status=eq.published&lang=eq.${lang}&order=sort_order.asc&select=slug,lang,kind,cat,title,icon,levels,skill,data`); } catch { return null; } }
const stageKey = "zad-lang-lv";
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(stageKey); if (v && LV[v]) return v; } catch {} return ""; };
const isEnC = (c) => c.cat === "english";
const cardStatus = (id) => { const r = S.cards.c[id]; if (!r || (!r.s && !r.o && !r.w)) return ""; if (!r.l && r.w > 0) return "r"; return r.l ? "l" : "s"; };
const cardLv = (c) => { const ag = (c.ages || []).map((a) => "a" + a), gr = (c.grades || []).map((g) => "g" + g); return ag.concat(gr); };
/* ===== القواميس ===== */
const DICTS = {
  animals: ["قاموس الحيوانات", "1f981", (c) => c.cat === "animals"], colors: ["قاموس الألوان", "1f3a8", (c) => c.cat === "colors"], fruits: ["قاموس الفواكه والخضروات", "1f34e", (c) => c.cat === "food"],
  school: ["قاموس المدرسة", "1f392", (c) => c.cat === "vocab" && c.sub === "البيت والمدرسة" && ["كتاب", "قلم", "حقيبة", "مقص", "سبورة", "مكتبه"].includes(norm(c.word_ar))],
  home: ["قاموس المنزل", "1f3e0", (c) => c.cat === "vocab" && c.sub === "البيت والمدرسة" && ["مفتاح", "ساعه", "باب", "سرير", "خزانه", "كره"].includes(norm(c.word_ar))],
  nature: ["قاموس الطبيعة", "1f333", (c) => c.cat === "vocab" && c.sub === "الطبيعة"], jobs: ["قاموس المهن", "x_doctor", (c) => c.cat === "vocab" && c.sub === "المهن"],
  numbers: ["قاموس الأرقام", "1f522", (c) => c.cat === "numbers" && !/[=+]/.test(c.word_ar) && /\/num\//.test(c.image_url || "")],
};
function dictPage() {
  const box = $("#aview"); let cur = new URLSearchParams(location.search).get("d"); if (!DICTS[cur]) cur = "animals"; let q = "";
  const draw = () => {
    const list = CARDS.filter(DICTS[cur][2]); const nq = norm(q).trim();
    const r = list.filter((c) => !nq || norm(c.word_ar).includes(nq) || String(c.word_en || "").toLowerCase().includes(nq));
    box.innerHTML = `<div class="hero"><img src="${icon(DICTS[cur][1])}" alt=""><div><h1>${esc(DICTS[cur][0])}</h1><p>كلمة بالعربية والإنجليزية مع صورة وصوت. ابحث بالعربية أو بالإنجليزية.</p></div></div>
<div class="dtabs" role="group" aria-label="القواميس">${Object.keys(DICTS).map((k) => `<button type="button" class="zpill${k === cur ? " on" : ""}" data-d="${k}" aria-pressed="${k === cur}">${esc(DICTS[k][0].replace("قاموس ", ""))}</button>`).join("")}</div>
<div class="dsr"><input id="dq" type="search" enterkeyhint="search" autocomplete="off" placeholder="ابحث عن كلمة بالعربية أو English" value="${esc(q)}" aria-label="بحث في القاموس"></div>
<p class="sfoot">${AD(r.length)} من ${AD(list.length)} كلمة</p>
${r.length ? `<div class="dg">${r.map((c) => `<article class="dc"><img src="${esc(SU(c.image_url))}" alt="" loading="lazy" width="96" height="96"><h3>${esc(c.word_ar)}</h3><div class="en" dir="ltr">${esc(c.word_en || "")}</div><p>${esc(c.example || "")}</p><div class="sp">${spk(c.word_ar, "ar", c.audio_url, "عربي")}${c.word_en ? spk(c.word_en, "en", "", "English") : ""}</div></article>`).join("")}</div>` : `<div class="sempty"><h3>لا توجد كلمات مطابقة</h3></div>`}
<p><a class="abtn" href="${ROOT}language/">العودة إلى عالم اللغات</a></p>`;
    const i = $("#dq"); i.oninput = (e) => { q = e.target.value; const p = i.selectionStart; draw(); const n = $("#dq"); n.focus(); try { n.setSelectionRange(p, p); } catch {} };
  };
  box.addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (b) { cur = b.dataset.d; q = ""; draw(); } });
  draw();
}
/* ===== أدوات الجلسات ===== */
function resultView(box, title, qs, back) {
  const n = qs.length, ok = qs.filter((x) => x.ok).length, acc = n ? ok / n : 0, stars = acc >= .8 ? 2 : acc >= .5 ? 1 : 0;
  S.lang.rounds++; addStars(stars); save();
  const wrong = qs.filter((x) => !x.ok).map((x) => x.label).filter(Boolean);
  box.innerHTML = `<div class="res"><div class="st">${"⭐".repeat(stars) || "🌱"}</div><h2>${acc >= .8 ? "ممتاز!" : acc >= .5 ? "جيد، واصل" : "واصل التدرّب"}</h2><p>أجبت إجابة صحيحة من أول محاولة عن ${AD(ok)} من ${AD(n)}</p>${wrong.length ? `<div class="rv"><b>للمراجعة:</b><ul>${wrong.map((w) => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}<div class="btns"><button type="button" class="abtn go" id="again">جولة جديدة</button><a class="abtn" href="${back}">رجوع</a></div></div>`;
  $("#again").onclick = () => location.reload();
}
function frame(box, title, qs, i, body, msg) { box.innerHTML = `<div class="qh"><h2>${esc(title)}</h2><div class="bar"><i style="width:${(i / qs.length) * 100}%"></i></div><small>سؤال ${AD(i + 1)} من ${AD(qs.length)}</small></div>${body}<div class="fb" id="fb" role="status">${msg || ""}</div>`; }
/* ===== التدريب ===== */
const KINDN = { ar: { order: "ترتيب الكلمات لتكوين جملة", fill: "اختر الكلمة المناسبة", passage: "اقرأ وأجب", opp: "الكلمات المتقابلة", odd: "اكتشف الكلمة المختلفة", write: "الكتابة والتعبير", build: "رتّب الحروف لتكوين كلمة", pos: "مواضع الحروف في الكلمة", story: "أسئلة فهم القصة" }, en: { order: "Put the words in order", fill: "Choose the right word", passage: "Read and answer", opp: "Opposites", odd: "Find the odd word", write: "Write a sentence", build: "Make the word from letters", pos: "Letters in the word", story: "Story questions" } };
async function practicePage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lang = p.get("lang") === "en" ? "en" : "ar", kind = p.get("kind") || "order"; let lv = getLv();
  if (!KINDN[lang][kind]) return (box.innerHTML = `<div class="sempty"><h3>نوع غير معروف</h3><p><a class="abtn go" href="${ROOT}language/">العودة</a></p></div>`);
  let tier = +p.get("tier") || tierOf(lv); if (kind === "story" && !tier) tier = 2;
  if (lv === "a2") return (box.innerHTML = `<div class="sempty"><h3>هذه التدريبات لعمر ٣ سنوات فأكثر</h3><p>لعمر سنة إلى سنتين: شاهدوا البطاقات والقواميس معًا واسمعوا الأسماء بصوت الكبير.</p><p><a class="abtn go" href="${ROOT}language/dict/">القواميس المصورة</a></p></div>`);
  if (!tier) {
    let av = [1, 2, 3];
    if (kind !== "build" && kind !== "pos") { const its = await loadItems(lang); if (its) av = [1, 2, 3].filter((t) => its.some((x) => x.kind === kind && x.levels.some((l) => TIERLV[t].includes(l)))); }
    box.innerHTML = `<div class="hero"><img src="${icon("i_pencils")}" alt=""><div><h1>${esc(KINDN[lang][kind])}</h1><p>اختر المستوى المناسب. لا يلزم أن يكون مستوى الطفل مطابقًا لعمره، ويمكنه أن يرتقي أو يعود بحسب حاجته.</p></div></div>${av.length ? `<div class="tiers">${av.map((t) => `<a class="abtn go" href="?lang=${lang}&kind=${kind}&tier=${t}">${TIERN[t]}</a>`).join("")}</div>` : `<div class="sempty"><h3>لا يوجد محتوى لهذا النوع بعد</h3></div>`}<p><a class="abtn" href="${ROOT}language/">العودة إلى عالم اللغات</a></p>`; return;
  }
  const lvs = lv && tierOf(lv) === tier ? [lv] : TIERLV[tier];
  let qs = [], title = KINDN[lang][kind] + " — " + TIERN[tier].split(" (")[0];
  if (kind === "pos") {
    const ar = lang === "ar", L = (c) => (ar ? nod(c.word_ar) : String(c.word_en || "").toLowerCase());
    const AL = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split(""), EL = "abcdefghijklmnopqrstuvwxyz".split("");
    let pool = CARDS.filter((c) => c.image_url && c.cat !== "numbers" && (ar ? !isEnC(c) && /^[ء-ي]+$/.test(L(c)) : c.word_en && /^[A-Za-z]+$/.test(c.word_en)) && L(c).length >= 3 && L(c).length <= (tier === 1 ? 5 : 8));
    if (lv && tierOf(lv) === tier) { const f = pool.filter((c) => cardLv(c).includes(lv)); if (f.length >= 6) pool = f; }
    const kinds = tier === 1 ? ["f"] : tier === 2 ? ["f", "l"] : ["f", "l", "m"];
    qs = shuf(pool).slice(0, 6).map((c, n) => {
      const w = L(c), ch = [...w], k = kinds[n % kinds.length]; let a, qt;
      if (k === "f") { a = ch[0]; qt = ar ? "ما الحرف الذي تبدأ به الكلمة؟" : "Which letter does the word start with?"; }
      else if (k === "l") { a = ch[ch.length - 1]; qt = ar ? "ما الحرف الذي تنتهي به الكلمة؟" : "Which letter does the word end with?"; }
      else { a = ch[Math.floor(ch.length / 2)]; qt = ar ? "ما الحرف الأوسط في الكلمة؟" : "Which letter is in the middle of the word?"; if (ch.length % 2 === 0) { a = ch[ch.length / 2 - 1]; qt = ar ? "ما الحرف الذي يقع قبل منتصف الكلمة مباشرة؟" : "Which letter comes just before the middle?"; } }
      const SIM = { "أ": "ا", "إ": "ا", "آ": "ا", "ا": "أ", "ة": "ه", "ه": "ة", "ى": "ي", "ي": "ى" }; const dis = shuf((ar ? AL : EL).filter((x) => x !== a && x !== SIM[a] && !ch.includes(x))).slice(0, 2), o = shuf(dis.concat([a]));
      return { t: "mc", slug: null, img: SU(c.image_url), word: ar ? c.word_ar : c.word_en, aud: ar ? c.audio_url : "", q: qt, o, a: o.indexOf(a), label: (ar ? c.word_ar : c.word_en) + " ← " + a, sk: ar ? "مواضع الحروف في الكلمة" : "Letter positions", lang };
    });
  } else if (kind === "build") {
    let pool = CARDS.filter((c) => { if (lang === "ar") { const w = nod(c.word_ar); return !isEnC(c) && c.cat !== "numbers" && /^[ء-ي]+$/.test(w) && w.length >= 3 && w.length <= (tier === 1 ? 4 : tier === 2 ? 5 : 7); } const w = String(c.word_en || ""); return /^[A-Za-z]+$/.test(w) && w.length >= 3 && w.length <= (tier === 1 ? 4 : tier === 2 ? 5 : 7) && c.cat !== "english" || (c.cat === "english" && /^[A-Za-z]{3,7}$/.test(w) && w.length <= (tier === 1 ? 4 : tier === 2 ? 5 : 7)); });
    if (lv && tierOf(lv) === tier) { const f = pool.filter((c) => cardLv(c).includes(lv)); if (f.length >= 4) pool = f; }
    qs = shuf(pool).slice(0, 5).map((c) => ({ t: "build", c, ans: lang === "ar" ? nod(c.word_ar) : c.word_en.toLowerCase(), label: lang === "ar" ? c.word_ar : c.word_en, sk: lang === "ar" ? "تركيب الحروف لتكوين الكلمات" : "Spelling" }));
  } else {
    const items = await loadItems(lang); if (!items) return (box.innerHTML = `<div class="sempty"><h3>تعذّر تحميل التدريبات</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p></div>`);
    let pool = items.filter((x) => x.kind === kind && x.levels.some((l) => lvs.includes(l)));
    if (!pool.length) pool = items.filter((x) => x.kind === kind && x.levels.some((l) => TIERLV[tier].includes(l)));
    if (kind === "opp") { const pairs = pool.flatMap((x) => x.data.pairs.map((pr) => pr)); const allw = pairs.flat(); qs = shuf(pairs).slice(0, 5).map((pr) => { const dir = Math.random() < .5 ? 0 : 1, w = pr[dir], a = pr[1 - dir], o = shuf(shuf(allw.filter((x) => x !== w && x !== a)).slice(0, 2).concat([a])); return { t: "mc", slug: pool[0].slug, q: lang === "ar" ? `ما عكس كلمة «${w}»؟` : `What is the opposite of "${w}"?`, o, a: o.indexOf(a), label: `${w} ↔ ${a}`, sk: "الكلمات المتقابلة", lang }; }); }
    else if (kind === "odd") qs = shuf(pool.flatMap((x) => x.data.qs.map((q) => ({ t: "mc", slug: x.slug, q: lang === "ar" ? "أي كلمة مختلفة عن الباقي؟" : "Which word is different?", o: q.items, a: q.a, why: q.why, label: q.items[q.a], sk: "التصنيف واكتشاف الكلمة المختلفة", lang })))).slice(0, 5);
    else if (kind === "fill") qs = shuf(pool).slice(0, 5).map((x) => { const o = shuf(x.data.o.map((t, i) => [t, i])), a = o.findIndex((z) => z[1] === x.data.a); return { t: "fill", slug: x.slug, s: x.data.s, o: o.map((z) => z[0]), a, label: x.data.s.replace("___", x.data.o[x.data.a]), sk: x.skill, lang }; });
    else if (kind === "order") qs = shuf(pool).slice(0, 4).map((x) => ({ t: "order", slug: x.slug, words: x.data.words, label: x.data.words.join(" "), sk: x.skill, lang }));
    else if (kind === "write") qs = shuf(pool).slice(0, 3).map((x) => ({ t: "write", slug: x.slug, x, label: x.title, sk: x.skill, lang }));
    else if (kind === "story") { const x = items.find((z) => z.kind === "story" && z.slug === p.get("s")); if (x) { x.data.text = x.data.pages.map((g) => g.t).join(" "); qs = x.data.qs.map((q) => ({ t: "mc", slug: x.slug, q: q.q, o: q.o, a: q.a, label: q.q, sk: x.skill, lang, shuffle: true })); if (x.data.events) qs.push({ t: "events", slug: x.slug, ev: x.data.events, label: "ترتيب أحداث القصة", sk: "ترتيب أحداث القصة", lang }); PASS = x; title = x.title; } }
    else if (kind === "passage") { const x = shuf(pool)[0]; if (x) { qs = x.data.qs.map((q) => ({ t: "mc", slug: x.slug, q: q.q, o: q.o, a: q.a, label: q.q, sk: x.skill, lang, shuffle: true })); if (x.data.events) qs.push({ t: "events", slug: x.slug, ev: x.data.events, label: "ترتيب أحداث النص", sk: "ترتيب أحداث القصة", lang }); PASS = x; } }
  }
  if (!qs.length) return (box.innerHTML = `<div class="sempty"><h3>لا توجد أسئلة لهذا المستوى بعد</h3><p>جرّب مستوى آخر.</p><p><a class="abtn go" href="?lang=${lang}&kind=${kind}">اختيار المستوى</a></p></div>`);
  let i = 0; const done = [];
  const back = ROOT + "language/";
  const next = (ok, q, first) => { done.push({ ok, label: q.label }); i++; setTimeout(show, 700); };
  function show() {
    if (i >= qs.length) return resultView(box, title, done, back);
    const q = qs[i]; let tried = false;
    const rec = (ok) => { if (q.t === "build") ansCard(q.c, ok, q.sk); else if (q.slug) ansItem(q.slug, ok, q.sk); else { skill(q.sk, ok); save(); } };
    const fb = (t, c) => { const f = $("#fb"); f.className = "fb " + c; f.textContent = t; };
    const dirCls = q.lang === "en" || (q.t === "build" && lang === "en") ? "ltr" : "";
    if (q.t === "mc" || q.t === "fill") {
      const opts = q.t === "mc" && q.shuffle ? (() => { const a = q.o[q.a], o = shuf(q.o); q.o = o; q.a = o.indexOf(a); return o; })() : q.o;
      const head = q.t === "fill" ? `<div class="sent ${dirCls}">${esc(q.s).replace("___", '<span class="bl">؟</span>')}</div>${spk(q.s.replace("___", " … "), q.lang, "", "استمع")}` : `${q.img ? `<div class="bpic"><img src="${esc(q.img)}" alt="" width="110" height="110">${spk(q.word, q.lang, q.aud || "", "استمع للكلمة")}</div><div class="wshow ${dirCls}">${esc(q.word)}</div>` : ""}<div class="qq ${dirCls}">${esc(q.q)}</div>`;
      frame(box, title, qs, i, `${PASS && q.t === "mc" && (kind === "passage" || kind === "story") ? passBlock(PASS, lang) : ""}${head}<div class="opts ${dirCls}">${opts.map((o, j) => `<button type="button" class="opt" data-j="${j}">${esc(o)}</button>`).join("")}</div>`);
      $("#aview").querySelectorAll(".opt").forEach((b) => b.onclick = () => { const j = +b.dataset.j; if (b.disabled) return; if (j === q.a) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); fb("أحسنت!" + (q.why ? " " + q.why : ""), "g"); if (!tried) rec(true); next(!tried, q); } else { b.classList.add("bad"); b.disabled = true; if (!tried) { tried = true; rec(false); } fb("حاول مرة أخرى.", "b"); } });
    } else if (q.t === "order" || q.t === "build") {
      const units = q.t === "order" ? q.words : q.ans.split(""); let bank = shuf(units.map((u, k) => ({ u, k }))); if (bank.length > 1 && bank.every((b, k) => b.u === units[k])) bank = bank.reverse(); let pick = [];
      const sep = q.t === "order" ? " " : "";
      const dr = () => { frame(box, title, qs, i, `${q.t === "build" ? `<div class="bpic"><img src="${esc(SU(q.c.image_url))}" alt="" width="110" height="110">${spk(lang === "ar" ? q.c.word_ar : q.c.word_en, lang, lang === "ar" ? q.c.audio_url : "", "استمع للكلمة")}</div><div class="qq">رتّب الحروف لتكوين اسم الصورة</div>` : `<div class="qq">رتّب الكلمات لتكوين جملة صحيحة</div>`}<div class="slot ${dirCls}" aria-label="إجابتك">${pick.map((b) => `<button type="button" class="tk on" data-r="${b.k}">${esc(b.u)}</button>`).join("") || '<span class="ph">اضغط الكلمات بالترتيب</span>'}</div><div class="bank ${dirCls}">${bank.filter((b) => !pick.includes(b)).map((b) => `<button type="button" class="tk" data-p="${b.k}">${esc(b.u)}</button>`).join("")}</div><div class="btns"><button type="button" class="abtn go" id="chk" ${pick.length === units.length ? "" : "disabled"}>تحقّق</button><button type="button" class="abtn" id="clr">مسح</button></div>`, "");
        box.querySelectorAll("[data-p]").forEach((b) => b.onclick = () => { pick.push(bank.find((x) => x.k === +b.dataset.p)); dr(); });
        box.querySelectorAll("[data-r]").forEach((b) => b.onclick = () => { pick = pick.filter((x) => x.k !== +b.dataset.r); dr(); });
        $("#clr").onclick = () => { pick = []; dr(); };
        $("#chk").onclick = () => { const got = pick.map((b) => b.u).join(sep), want = units.join(sep); if (got === want) { fb("أحسنت! إجابة صحيحة.", "g"); if (!tried) rec(true); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); next(!tried, q); } else { if (!tried) { tried = true; rec(false); } fb("ليس الترتيب الصحيح بعد، جرّب مرة أخرى.", "b"); } };
      }; dr();
    } else if (q.t === "events") {
      let pick = []; const bank = shuf(q.ev.map((e, k) => ({ e, k })));
      const dr = () => { frame(box, title, qs, i, `${passBlock(PASS, lang)}<div class="qq ${dirCls}">${lang === "ar" ? "رتّب أحداث النص كما حدثت" : "Put the events in order"}</div><ol class="evs ${dirCls}">${pick.map((b) => `<li>${esc(b.e)}</li>`).join("")}</ol><div class="opts ${dirCls}">${bank.filter((b) => !pick.includes(b)).map((b) => `<button type="button" class="opt" data-k="${b.k}">${esc(b.e)}</button>`).join("")}</div>`);
        box.querySelectorAll("[data-k]").forEach((b) => b.onclick = () => { const k = +b.dataset.k; if (k === pick.length) { pick.push(bank.find((x) => x.k === k)); if (pick.length === q.ev.length) { fb("أحسنت! رتّبت الأحداث.", "g"); if (!tried) rec(true); dr(); box.querySelectorAll("button").forEach((x) => (x.disabled = true)); next(!tried, q); } else dr(); } else { if (!tried) { tried = true; rec(false); } b.classList.add("bad"); fb("ليس هذا هو الحدث التالي، حاول مرة أخرى.", "b"); } });
      }; dr();
    } else if (q.t === "write") {
      const w = q.x.data.words, en = q.lang === "en";
      frame(box, title, qs, i, `<div class="bpic"><img src="${icon(q.x.icon || "i_pencil")}" alt="" width="110" height="110"></div><div class="qq">${esc(q.x.data.prompt)}</div><div class="wds ${dirCls}">${w.map((x) => `<span class="tk on">${esc(x)}</span>`).join("")}</div><textarea id="wt" rows="3" dir="${en ? "ltr" : "rtl"}" placeholder="${en ? "Write your sentence here" : "اكتب جملتك هنا"}" aria-label="جملتك"></textarea><div class="btns"><button type="button" class="abtn go" id="chk">تحقّق</button></div><p class="hint">يلزم أن تحتوي جملتك على كل الكلمات المعطاة، وأن تكون جملة كاملة.</p>`);
      $("#chk").onclick = () => { const t = $("#wt").value.trim(), nt = norm(t); const miss = w.filter((x) => !nt.includes(norm(x))), words = t.split(/\s+/).filter(Boolean).length; if (!t) return fb("اكتب جملتك أولًا.", "b"); if (miss.length) { if (!tried) { tried = true; rec(false); } return fb("لم تستعمل: " + miss.join("، "), "b"); } if (words < w.length + 1) { return fb("أكمل الجملة: أضف كلمة أو أكثر لتصبح جملة كاملة.", "b"); } fb("أحسنت! استعملت كل الكلمات.", "g"); if (!tried) rec(true); box.querySelectorAll("button,textarea").forEach((x) => (x.disabled = true)); next(!tried, q); };
    }
  }
  show();
}
let PASS = null;
function passBlock(x, lang) { return `<div class="pas ${lang === "en" ? "ltr" : ""}"><h3>${esc(x.title)}</h3><p>${esc(x.data.text)}</p>${spk(x.data.text, lang, "", lang === "ar" ? "استمع للنص" : "Listen")}${x.data.vocab && x.data.vocab.length ? `<div class="vc">${x.data.vocab.map((v) => `<span><b>${esc(v[0])}</b>: ${esc(v[1])}</span>`).join("")}</div>` : ""}</div>`; }
/* ===== القصص المصورة ===== */
async function storyPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lang = p.get("lang") === "en" ? "en" : "ar", slug = p.get("s"); let lv = getLv();
  const all = await loadItems(lang); if (!all) return (box.innerHTML = `<div class="sempty"><h3>تعذّر تحميل القصص</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p></div>`);
  const L = all.filter((x) => x.kind === "story");
  if (!slug) {
    const f = (lv && lv !== "a2") ? L.filter((x) => x.levels.includes(lv)) : L; const list = f.length ? f : L;
    box.innerHTML = `<div class="hero"><img src="${icon("1f4d6")}" alt=""><div><h1>${lang === "ar" ? "القصص اللغوية المصورة" : "Illustrated English Stories"}</h1><p>اقرأ القصة صفحة صفحة، واستمع إلى كل صفحة، وتعلّم مفرداتها، ثم أجب عن أسئلة الفهم.${lv && f.length ? " المعروض يناسب: " + esc(LV[lv]) + "." : ""}</p></div></div>
<div class="lks" style="margin:6px 0"><a class="abtn${lang === "ar" ? " go" : ""}" href="?lang=ar">قصص عربية</a><a class="abtn${lang === "en" ? " go" : ""}" href="?lang=en">English stories</a></div>
${list.length ? `<div class="mgrid">${list.map((x) => `<a class="mk tc" href="?lang=${lang}&s=${encodeURIComponent(x.slug)}"><img src="${icon(x.icon || "1f4d6")}" alt="" loading="lazy" width="80" height="80"><b>${esc(x.title)}</b><small>${esc(x.levels.map((l) => LV[l]).join("، "))}</small></a>`).join("")}</div>` : `<div class="sempty"><h3>لا توجد قصص بعد</h3></div>`}
<p><a class="abtn" href="${ROOT}language/">العودة إلى عالم اللغات</a> <a class="abtn" href="${ROOT}stories/">مكتبة القصص الكاملة</a></p>`; return;
  }
  const x = L.find((z) => z.slug === slug); if (!x) return (box.innerHTML = `<div class="sempty"><h3>القصة غير موجودة</h3><p><a class="abtn go" href="?lang=${lang}">القصص</a></p></div>`);
  const pg = x.data.pages, ltr = lang === "en"; let i = 0, seen = new Set();
  const draw = () => {
    seen.add(i); const g = pg[i], last = i === pg.length - 1;
    box.innerHTML = `<div class="qh"><h2>${esc(x.title)}</h2><div class="bar"><i style="width:${((i + 1) / pg.length) * 100}%"></i></div><small>صفحة ${AD(i + 1)} من ${AD(pg.length)}</small></div>
<div class="spage ${ltr ? "ltr" : ""}"><img src="${icon(g.img)}" alt="" width="180" height="180"><p class="stx">${esc(g.t)}</p>${spk(g.t, lang, "", ltr ? "Listen" : "استمع إلى الصفحة")}</div>
<div class="btns"><button type="button" class="abtn" id="sp" ${i ? "" : "disabled"}>${ltr ? "◀" : "▶"} السابقة</button>${last ? "" : `<button type="button" class="abtn go" id="sn">التالية ${ltr ? "▶" : "◀"}</button>`}</div>
${last ? `<section class="art"><h2>${ltr ? "New words" : "مفردات القصة"}</h2><div class="vc ${ltr ? "ltr" : ""}">${x.data.vocab.map((v) => `<span><b>${esc(v[0])}</b> ${spk(v[0], lang, "", "نطق " + v[0])} ${esc(v[1])}</span>`).join("")}</div><div class="btns"><a class="abtn go" href="${ROOT}language/practice/?lang=${lang}&kind=story&s=${encodeURIComponent(x.slug)}&tier=2">أجب عن أسئلة الفهم</a><a class="abtn" href="?lang=${lang}">قصة أخرى</a></div><p class="hint">تُحسب القصة في تقدّمك بعد الإجابة عن الأسئلة، لا بمجرد قراءتها.</p></section>` : ""}`;
    const pv = $("#sp"), nx = $("#sn"); if (pv) pv.onclick = () => { i--; draw(); window.scrollTo({ top: 0 }); }; if (nx) nx.onclick = () => { i++; draw(); window.scrollTo({ top: 0 }); };
  };
  draw();
}
/* ===== أشكال الحرف العربي ===== */
function formsPage() {
  const box = $("#aview"), L = "ابتثجحخدذرزسشصضطظعغفقكلمنهوي".split(""), NJ = "ادذرزو".split(""), Z = "\u200D";
  let cur = new URLSearchParams(location.search).get("c"); if (!L.includes(cur)) cur = "ب";
  const draw = () => {
    const nj = NJ.includes(cur), f = nj ? [["منفصل", cur], ["آخر الكلمة", "ـ" + cur]] : [["منفصل", cur], ["أول الكلمة", cur + Z], ["وسط الكلمة", Z + cur + Z], ["آخر الكلمة", Z + cur]];
    const ex = CARDS.filter((c) => !isEnC(c) && c.cat !== "numbers" && nod(c.word_ar).length >= 3 && nod(c.word_ar).includes(cur)).slice(0, 4);
    box.innerHTML = `<div class="hero"><img src="${icon("u_letters")}" alt=""><div><h1>أشكال الحرف في الكلمة</h1><p>يتغيّر شكل الحرف العربي بحسب موضعه: أول الكلمة أو وسطها أو آخرها.</p></div></div>
<div class="dtabs" role="group" aria-label="الحروف">${L.map((x) => `<button type="button" class="zpill${x === cur ? " on" : ""}" data-c="${x}" aria-pressed="${x === cur}">${x}</button>`).join("")}</div>
<div class="fgrid">${f.map((x) => `<div class="fc"><span class="fch">${x[1]}</span><small>${x[0]}</small></div>`).join("")}</div>
${nj ? `<p class="hint">هذا الحرف لا يتصل بما بعده، فله شكلان فقط.</p>` : ""}
${ex.length ? `<h3>كلمات فيها هذا الحرف</h3><div class="mgrid">${ex.map((c) => { const w = nod(c.word_ar), at = w.indexOf(cur), pos = at === 0 ? "في أول الكلمة" : at === w.length - 1 ? "في آخر الكلمة" : "في وسط الكلمة"; return `<div class="mk tc"><img src="${esc(SU(c.image_url))}" alt="" width="80" height="80"><b>${esc(c.word_ar)}</b><small>الحرف ${pos}</small></div>`; }).join("")}</div>` : ""}
<p><a class="abtn go" href="${ROOT}language/practice/?lang=ar&kind=pos">تدرّب على مواضع الحروف</a> <a class="abtn" href="${ROOT}language/">العودة</a></p>`;
    box.querySelectorAll("[data-c]").forEach((b) => b.onclick = () => { cur = b.dataset.c; history.replaceState(null, "", "?c=" + encodeURIComponent(cur)); draw(); });
  };
  draw();
}
/* ===== الاستماع ===== */
async function listenPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lang = p.get("lang") === "en" ? "en" : "ar", mode = p.get("mode") === "repeat" ? "repeat" : "choose"; const lv = getLv();
  let pool = CARDS.filter((c) => (lang === "en" ? c.word_en && /^[A-Za-z ]+$/.test(c.word_en) : !isEnC(c) && c.cat !== "numbers" && c.word_ar) && c.image_url);
  if (lv) { const f = pool.filter((c) => cardLv(c).includes(lv)); if (f.length >= 8) pool = f; }
  if (pool.length < 4) return (box.innerHTML = `<div class="sempty"><h3>لا توجد بطاقات كافية</h3></div>`);
  const w = (c) => (lang === "en" ? c.word_en : c.word_ar), title = (lang === "en" ? "Listen and choose" : "استمع واختر") + (mode === "repeat" ? " — استمع وكرّر" : "");
  box.innerHTML = `<div class="hero"><img src="${icon("i_sound")}" alt=""><div><h1>${lang === "en" ? "الاستماع والنطق (English)" : "الاستماع (العربية)"}</h1><p>اضغط زر الصوت لتسمع الكلمة، ثم اختر الصورة الصحيحة. الصوت لا يعمل إلا عند الضغط.</p></div></div><div class="dtabs"><a class="zpill${mode === "choose" ? " on" : ""}" href="?lang=${lang}&mode=choose">استمع واختر</a><a class="zpill${mode === "repeat" ? " on" : ""}" href="?lang=${lang}&mode=repeat">استمع وكرّر</a></div><div id="lq"></div>`;
  const q = $("#lq");
  if (mode === "repeat") {
    let k = 0; const list = shuf(pool).slice(0, 10);
    const dr = () => { const c = list[k]; q.innerHTML = `<div class="rp"><img src="${esc(SU(c.image_url))}" alt="" width="140" height="140"><h2 class="${lang === "en" ? "ltr" : ""}">${esc(w(c))}</h2>${lang === "en" ? `<p>${esc(c.word_ar)}</p>` : ""}${spk(w(c), lang, lang === "ar" ? c.audio_url : "", "استمع")}<p class="hint">استمع ثم كرّر الكلمة بصوتك. هذا تدريب على النطق ولا يُحتسب إتقانًا للكلمة.</p><div class="btns"><button type="button" class="abtn" id="pv" ${k ? "" : "disabled"}>السابقة</button><button type="button" class="abtn go" id="nx">${k < list.length - 1 ? "التالية" : "إنهاء"}</button></div><small>${AD(k + 1)} من ${AD(list.length)}</small></div>`;
      $("#pv").onclick = () => { k--; dr(); }; $("#nx").onclick = () => { practice("استماع وتكرار"); if (k < list.length - 1) { k++; dr(); } else { toast("أحسنت! انتهت الجولة"); k = 0; dr(); } };
    }; dr(); return;
  }
  const qs = shuf(pool).slice(0, 6).map((c) => { const o = shuf(shuf(pool.filter((x) => x.slug !== c.slug && norm(w(x)) !== norm(w(c)))).slice(0, 3).concat([c])); return { c, o, a: o.indexOf(c) }; });
  let i = 0; const done = [];
  const show = () => {
    if (i >= qs.length) return resultView(q, title, done, ROOT + "language/");
    const z = qs[i]; let tried = false;
    q.innerHTML = `<div class="qh"><div class="bar"><i style="width:${(i / qs.length) * 100}%"></i></div><small>سؤال ${AD(i + 1)} من ${AD(qs.length)}</small></div><div class="qq">${lang === "en" ? "اضغط لتسمع الكلمة ثم اختر الصورة" : "اضغط لتسمع الكلمة ثم اختر الصورة"}</div><div style="text-align:center">${spk(w(z.c), lang, lang === "ar" ? z.c.audio_url : "", lang === "en" ? "Play" : "استمع")}</div><div class="pics">${z.o.map((c, j) => `<button type="button" class="pic" data-j="${j}"><img src="${esc(SU(c.image_url))}" alt="" width="96" height="96"></button>`).join("")}</div><div class="fb" id="fb" role="status"></div>`;
    q.querySelectorAll(".pic").forEach((b) => b.onclick = () => { const j = +b.dataset.j, f = $("#fb"); if (b.disabled) return; if (j === z.a) { b.classList.add("good"); q.querySelectorAll(".pic").forEach((x) => (x.disabled = true)); f.className = "fb g"; f.innerHTML = `أحسنت! <b class="${lang === "en" ? "ltr" : ""}">${esc(w(z.c))}</b>${lang === "en" ? " = " + esc(z.c.word_ar) : ""}`; if (!tried) ansCard(z.c, true, "الاستماع وربط الصوت بالصورة"); done.push({ ok: !tried, label: w(z.c) }); i++; setTimeout(show, 1100); } else { b.classList.add("bad"); b.disabled = true; if (!tried) { tried = true; ansCard(z.c, false, "الاستماع وربط الصوت بالصورة"); } f.className = "fb b"; f.textContent = "ليست هذه الصورة، استمع مرة أخرى وحاول."; } });
  }; show();
}
/* ===== الكتابة: تتبع الحروف ونسخ الكلمات ===== */
function writePage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lang = p.get("lang") === "en" ? "en" : "ar", mode = p.get("mode") === "copy" ? "copy" : "trace";
  box.innerHTML = `<div class="hero"><img src="${icon("270f")}" alt=""><div><h1>تتبّع الحروف ونسخ الكلمات</h1><p>تتبّع الحرف بإصبعك أو بالماوس فوق الشكل الباهت، وسنقيس مقدار تغطيتك له. وفي «نسخ الكلمات» اكتب الكلمة كما تراها.</p></div></div>
<div class="dtabs"><a class="zpill${lang === "ar" && mode === "trace" ? " on" : ""}" href="?lang=ar&mode=trace">تتبّع الحروف العربية</a><a class="zpill${lang === "en" && mode === "trace" ? " on" : ""}" href="?lang=en&mode=trace">Trace English letters</a><a class="zpill${mode === "copy" && lang === "ar" ? " on" : ""}" href="?lang=ar&mode=copy">نسخ كلمات عربية</a><a class="zpill${mode === "copy" && lang === "en" ? " on" : ""}" href="?lang=en&mode=copy">Copy English words</a></div><div id="wq"></div><p><a class="abtn" href="${ROOT}language/">العودة إلى عالم اللغات</a></p>`;
  const q = $("#wq");
  if (mode === "copy") {
    const pool = shuf(CARDS.filter((c) => c.image_url && (lang === "en" ? c.word_en && /^[A-Za-z]{3,8}$/.test(c.word_en) : !isEnC(c) && c.cat !== "numbers" && /^[ء-ي]{3,6}$/.test(nod(c.word_ar))))).slice(0, 8); let k = 0;
    const dr = () => { const c = pool[k]; if (!c) return (q.innerHTML = `<div class="res"><div class="st">⭐</div><h2>أحسنت! أنهيت نسخ الكلمات</h2><p>التدرّب على الكتابة يقوّي الحفظ، ولا يُحتسب إتقانًا للكلمة إلا بالأسئلة.</p></div>`); const wd = lang === "en" ? c.word_en : c.word_ar;
      q.innerHTML = `<div class="rp"><img src="${esc(SU(c.image_url))}" alt="" width="120" height="120"><h2 class="${lang === "en" ? "ltr" : ""}">${esc(wd)}</h2>${spk(wd, lang, lang === "ar" ? c.audio_url : "", "استمع")}<input id="ct" type="text" dir="${lang === "en" ? "ltr" : "rtl"}" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="${lang === "en" ? "Write the word" : "اكتب الكلمة"}" aria-label="اكتب الكلمة"><div class="btns"><button class="abtn go" id="cb" type="button">تحقّق</button></div><div class="fb" id="fb" role="status"></div><small>${AD(k + 1)} من ${AD(pool.length)}</small></div>`;
      $("#cb").onclick = () => { const v = $("#ct").value.trim(), f = $("#fb"), ok = lang === "en" ? v.toLowerCase() === wd.toLowerCase() : nod(v) === nod(wd); if (ok) { practice("نسخ الكلمات"); f.className = "fb g"; f.textContent = "أحسنت! كتبتها صحيحة."; k++; setTimeout(dr, 800); } else { f.className = "fb b"; f.textContent = "قارن حروف كلمتك بالكلمة وحاول مرة أخرى."; } }; }; dr(); return;
  }
  const letters = CARDS.filter((c) => (lang === "ar" ? c.cat === "letters" : c.cat === "english" && c.sub === "الحروف الإنجليزية")).map((c) => (c.extra && c.extra.ch) || "").filter(Boolean);
  const L = lang === "ar" ? letters : letters.flatMap((x) => [x, x.toLowerCase()]);
  if (!L.length) return (q.innerHTML = `<div class="sempty"><h3>تعذّر تحميل الحروف</h3></div>`);
  const sel = new URLSearchParams(location.search).get("ch") || "";
  q.innerHTML = `<div class="lgrid">${L.map((x) => `<button type="button" class="lt${S.lang.pr["حرف:" + x] ? " done" : ""}${sel === x ? " on" : ""}" data-ch="${esc(x)}" aria-label="حرف ${esc(x)}">${esc(x)}</button>`).join("")}</div><div id="tr"></div>`;
  const tr = $("#tr");
  const open = (ch, scroll) => {
    q.querySelectorAll(".lt").forEach((b) => b.classList.toggle("on", b.dataset.ch === ch));
    tr.innerHTML = `<div class="trw"><div class="tc2"><canvas id="gc" width="480" height="480" aria-hidden="true"></canvas><canvas id="dc" width="480" height="480" role="img" aria-label="لوحة تتبّع الحرف ${esc(ch)}"></canvas></div><div class="btns"><button class="abtn" id="tcl" type="button">مسح</button><button class="abtn go" id="tck" type="button">تحقّق</button>${spk(ch, lang, "", "اسمع الحرف")}</div><div class="fb" id="fb" role="status"></div></div>`;
    if (scroll) tr.scrollIntoView({ behavior: "smooth", block: "center" });
    const gc = $("#gc"), dc = $("#dc"), gx = gc.getContext("2d"), dx = dc.getContext("2d");
    const font = lang === "ar" ? "700 340px Cairo, sans-serif" : "700 360px Cairo, sans-serif";
    const draw = () => { gx.clearRect(0, 0, 480, 480); gx.font = font; gx.textAlign = "center"; gx.textBaseline = "middle"; gx.fillStyle = "#d9cdf7"; gx.fillText(ch, 240, lang === "ar" ? 250 : 270); };
    (D.fonts && D.fonts.load ? D.fonts.load("700 40px Cairo", ch) : Promise.resolve()).then(draw, draw); draw();
    dx.lineWidth = 26; dx.lineCap = "round"; dx.lineJoin = "round"; dx.strokeStyle = "#6d28d9"; let dr = false, any = false;
    const pos = (e) => { const r = dc.getBoundingClientRect(); return [(e.clientX - r.left) * 480 / r.width, (e.clientY - r.top) * 480 / r.height]; };
    dc.onpointerdown = (e) => { dr = true; any = true; dc.setPointerCapture && dc.setPointerCapture(e.pointerId); const [x, y] = pos(e); dx.beginPath(); dx.moveTo(x, y); dx.lineTo(x + .1, y + .1); dx.stroke(); e.preventDefault(); };
    dc.onpointermove = (e) => { if (!dr) return; const [x, y] = pos(e); dx.lineTo(x, y); dx.stroke(); e.preventDefault(); };
    dc.onpointerup = dc.onpointercancel = () => { dr = false; };
    $("#tcl").onclick = () => { dx.clearRect(0, 0, 480, 480); any = false; $("#fb").textContent = ""; };
    $("#tck").onclick = () => {
      const f = $("#fb"); if (!any) { f.className = "fb b"; f.textContent = "تتبّع الحرف أولًا."; return; }
      const g = gx.getImageData(0, 0, 480, 480).data, d = dx.getImageData(0, 0, 480, 480).data; let tot = 0, cov = 0, ink = 0, out = 0;
      for (let i = 3; i < g.length; i += 4) { const gl = g[i] > 40, dd = d[i] > 40; if (gl) { tot++; if (dd) cov++; } if (dd) { ink++; if (!gl) out++; } }
      const pc = tot ? cov / tot : 0, po = ink ? out / ink : 1;
      if (pc >= .5 && po <= .5) { practice("حرف:" + ch); practice("تتبّع الحروف"); const b = q.querySelector(`.lt[data-ch="${CSS.escape(ch)}"]`); if (b) b.classList.add("done"); f.className = "fb g"; f.textContent = `أحسنت! غطّيت ${AD(Math.round(pc * 100))}٪ من الحرف.`; }
      else { f.className = "fb b"; f.textContent = pc < .5 ? `غطّيت ${AD(Math.round(pc * 100))}٪ فقط، تتبّع الحرف كله فوق الشكل الباهت.` : "خرجت كثيرًا عن شكل الحرف، امسح وحاول بهدوء."; }
    };
  };
  q.addEventListener("click", (e) => { const b = e.target.closest(".lt"); if (b) open(b.dataset.ch, true); });
  open(sel && L.includes(sel) ? sel : L[0]);
}
/* ===== الرئيسية ===== */
const TILES = {
  ar: [["الحروف العربية", "u_letters" , "تعرّف على الحروف من الألف إلى الياء بأشكالها وأصواتها وكلماتها، وتتبّعها بإصبعك.", [["بطاقات الحروف", "cards/?cat=letters"], ["أشكال الحرف في الكلمة", "language/forms/"], ["مطابقة الحرف بالصورة", "cards/?cat=letters&mode=match"], ["تتبّع الحروف", "language/write/?lang=ar&mode=trace"]], "1f4d6"],
    ["المفردات العربية", "", "الأسرة والحيوانات والفواكه والألوان والأشكال والملابس والطعام وأجزاء الجسم والمواصلات والمهن والطبيعة.", [["بطاقات المفردات", "cards/?cat=vocab"], ["الحيوانات", "cards/?cat=animals"], ["الفواكه والخضروات", "cards/?cat=food"], ["الألوان", "cards/?cat=colors"], ["الأشكال", "cards/?cat=shapes"], ["القواميس المصورة", "language/dict/"]], "1f4da"],
    ["تكوين الكلمات والجمل", "", "رتّب الحروف لتكوّن كلمة، ورتّب الكلمات لتكوّن جملة، وأكمل الجمل بالكلمة المناسبة.", [["ترتيب الحروف", "language/practice/?lang=ar&kind=build"], ["مواضع الحروف", "language/practice/?lang=ar&kind=pos"], ["ترتيب الكلمات", "language/practice/?lang=ar&kind=order"], ["اختر الكلمة المناسبة", "language/practice/?lang=ar&kind=fill"], ["المتقابلات", "language/practice/?lang=ar&kind=opp"], ["الكلمة المختلفة", "language/practice/?lang=ar&kind=odd"]], "i_puzzle"],
    ["القراءة والفهم", "", "اقرأ نصوصًا قصيرة بمستويات مختلفة، واستمع إليها، وأجب عن الأسئلة ورتّب الأحداث.", [["اقرأ وأجب", "language/practice/?lang=ar&kind=passage"], ["القصص اللغوية المصورة", "language/story/?lang=ar"], ["مكتبة القصص", "stories/"]], "1f4d6"],
    ["الكتابة والتعبير", "", "تتبّع الحروف، وانسخ الكلمات، واكتب جملًا من كلمات معطاة.", [["تتبّع الحروف", "language/write/?lang=ar&mode=trace"], ["نسخ الكلمات", "language/write/?lang=ar&mode=copy"], ["اكتب جملة", "language/practice/?lang=ar&kind=write"]], "270f"]],
  en: [["English Letters", "", "الحروف من A إلى Z، الكبيرة والصغيرة، مع الكلمة المرتبطة بكل حرف وصورتها.", [["بطاقات الحروف", "cards/?cat=english"], ["Trace letters", "language/write/?lang=en&mode=trace"]], "u_abc"],
    ["English Vocabulary", "", "الألوان والأرقام والحيوانات والفواكه والخضروات وكلمات أساسية مع الصور.", [["بطاقات الإنجليزية", "cards/?cat=english"], ["القواميس المصورة", "language/dict/"]], "1f4da"],
    ["Words and Sentences", "", "ضمائر وأفعال وكلمات متقابلة وتكوين جمل بسيطة واستخدام الكلمات في جمل.", [["Make the word", "language/practice/?lang=en&kind=build"], ["Letter positions", "language/practice/?lang=en&kind=pos"], ["Put the words in order", "language/practice/?lang=en&kind=order"], ["Choose the word", "language/practice/?lang=en&kind=fill"], ["Opposites", "language/practice/?lang=en&kind=opp"], ["Odd one out", "language/practice/?lang=en&kind=odd"]], "i_puzzle"],
    ["Listening and Speaking", "", "استمع إلى الكلمات وكرّر النطق واربط الصوت بالصورة.", [["Listen and choose", "language/listen/?lang=en&mode=choose"], ["استمع وكرّر", "language/listen/?lang=en&mode=repeat"]], "i_sound"],
    ["Reading", "", "نصوص إنجليزية قصيرة وأسئلة فهم بسيطة ومفردات من السياق.", [["Read and answer", "language/practice/?lang=en&kind=passage"], ["Illustrated stories", "language/story/?lang=en"], ["Write a sentence", "language/practice/?lang=en&kind=write"]], "1f4d6"]],
};
function progBox() {
  const sk = Object.entries(S.lang.sk).map(([k, v]) => ({ k, o: v.o, w: v.w })).sort((a, b) => b.o + b.w - (a.o + a.w));
  const ar = CARDS.filter((c) => !isEnC(c)), en = CARDS.filter(isEnC);
  const cnt = (L) => { const o = { l: 0, r: 0, s: 0 }; L.forEach((c) => { const s = cardStatus(c.slug); if (o[s] != null) o[s]++; }); return o; };
  const a = cnt(ar), e = cnt(en);
  const letters = Object.keys(S.lang.pr).filter((k) => k.startsWith("حرف:")).length;
  const rv = CARDS.filter((c) => cardStatus(c.slug) === "r").slice(0, 8);
  return `<section class="art" id="prog"><h2>تقدّمي في اللغات</h2><p class="tx">لا تُحسب الكلمة «متعلَّمة» لمجرد مشاهدتها: تُحسب بعد إجابتين صحيحتين في الأسئلة.</p><div class="pg2"><div><b>${AD(a.l)}</b><span>كلمة عربية تعلّمتها</span></div><div><b>${AD(e.l)}</b><span>كلمة إنجليزية تعلّمتها</span></div><div><b>${AD(letters)}</b><span>حرفًا تدرّبت على تتبّعه</span></div><div><b>${AD(S.lang.rounds)}</b><span>جولة تدريب أكملتها</span></div></div>
  ${sk.length ? `<h3>المهارات التي تدرّبت عليها</h3><div class="sks">${sk.slice(0, 8).map((x) => `<div><span>${esc(x.k)}</span><b>${AD(x.o)} صحيحة من ${AD(x.o + x.w)}</b></div>`).join("")}</div>` : `<p class="tx">ابدأ بأي نشاط وستظهر هنا مهاراتك.</p>`}
  ${rv.length || S.lang.rv.length ? `<h3>كلمات تحتاج إلى مراجعة</h3><div class="rvc">${(rv.length ? rv.map((c) => ({ t: c.word_ar + (c.word_en ? " / " + c.word_en : ""), c })) : S.lang.rv.slice(0, 8).map((t) => ({ t }))).map((x) => `<span class="chp">${esc(x.t)}${x.c ? ` <button type="button" class="mini" data-say="${esc(x.c.word_en && isEnC(x.c) ? x.c.word_en : x.c.word_ar)}" data-lang="${isEnC(x.c) ? "en" : "ar"}" data-url="${esc(isEnC(x.c) ? "" : x.c.audio_url || "")}" aria-label="استمع">🔊</button>` : ""}</span>`).join("")}</div><p><a class="abtn go" href="${ROOT}cards/?mode=review">ابدأ المراجعة</a></p>` : ""}</section>`;
}
async function hubPage() {
  const box = $("#aview"); let lv = getLv();
  const lk = (u) => { if (!lv || /lv=|age=|gr=/.test(u)) return ROOT + u; const sep = u.includes("?") ? "&" : "?"; return ROOT + u + (u.startsWith("cards/") ? sep + (lv[0] === "a" ? "age=" : "gr=") + lv[1] : sep + "lv=" + lv); };
  const draw = () => {
    const stagePills = `<button type="button" class="zpill${!lv ? " on" : ""}" data-lv="">الكل</button>` + Object.keys(LV).map((k) => `<button type="button" class="zpill${lv === k ? " on" : ""}" data-lv="${k}" aria-pressed="${lv === k}">${LV[k]}</button>`).join("");
    const trk = (k, name, flag) => `<section class="trk" id="t-${k}"><h2><span>${flag}</span> ${name}</h2><div class="tg">${TILES[k].map((t) => `<article class="tl"><img src="${icon(t[4])}" alt="" width="56" height="56"><div><h3>${esc(t[0])}</h3><p>${esc(t[2])}</p><div class="lks">${t[3].map((l) => `<a class="abtn${/practice|write|listen/.test(l[1]) ? " go" : ""}" href="${esc(lk(l[1]))}">${esc(l[0])}</a>`).join("")}</div></div></article>`).join("")}</div></section>`;
    box.innerHTML = `<div class="hero"><img src="${icon("1f4da")}" alt=""><div><h1>عالم اللغات والمفردات</h1><p>تعلّم العربية والإنجليزية خطوة بخطوة: بطاقات مصورة وصوت وقراءة وكتابة وتدريبات تقيس الفهم فعلًا.</p></div></div><div class="stg"><b>مرحلة الطفل:</b><div class="zrow">${stagePills}</div><p class="hint">${lv === "a2" ? "لعمر سنة إلى سنتين: التعرّف البصري وسماع الأسماء مع الكبير. ابدأ بالقواميس المصورة والبطاقات." : lv ? "المحتوى متدرّج وقابل للمراجعة: يمكن للطفل أن يختار مستوى أسهل أو أصعب من عمره في أي وقت." : "اختر المرحلة لتُفتح الأنشطة بمستواها، أو اتركها «الكل»."}</p>${lv === "a2" ? `<p><a class="abtn go" href="${ROOT}language/dict/">القواميس المصورة</a> <a class="abtn go" href="${ROOT}cards/?age=1">بطاقات عمر سنة وسنتين</a></p>` : ""}</div>
${trk("ar", "تعلّم اللغة العربية", "🇴🇲")}${trk("en", "Learn English — تعلّم الإنجليزية", "🔤")}
<section class="art"><h2>القواميس المصورة</h2><p class="tx">ابحث عن الكلمة بالعربية أو الإنجليزية، وانظر صورتها واسمعها.</p><div class="lks">${Object.keys(DICTS).map((k) => `<a class="abtn" href="${ROOT}language/dict/?d=${k}">${esc(DICTS[k][0])}</a>`).join("")}</div></section>
${progBox()}
<p class="sfoot">الأسئلة والجمل والنصوص أصلية من إعداد زاد وفُحصت آليًا وبمراجعة زاد، ولم يراجعها معلم لغة متخصص بعد، وغير منسوبة إلى منهج محدد. الصوت يأتي من تسجيلات البطاقات المتوفرة أو من صوت جهازك (قد يختلف النطق من جهاز لآخر) ولا يعمل تلقائيًا. الصفان ٥–٦ غير مشمولين حاليًا.</p>`;
  };
  box.addEventListener("click", (e) => { const b = e.target.closest("[data-lv]"); if (b) { lv = b.dataset.lv; try { localStorage.setItem(stageKey, lv); } catch {} draw(); } });
  draw();
}
async function boot() {
  loadDB(); await loadCards();
  if (PAGE === "dict") dictPage(); else if (PAGE === "practice") practicePage(); else if (PAGE === "listen") listenPage(); else if (PAGE === "write") writePage(); else if (PAGE === "story") storyPage(); else if (PAGE === "forms") formsPage(); else hubPage();
}
boot();
})();
