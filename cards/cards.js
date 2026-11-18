/* البطاقات التعليمية التفاعلية - زاد: عرض + 6 أنماط + تقدّم مرتبط بـ«تعلّم والعب» */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const ROOT = new URL("../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const U = (u) => /^https?:/.test(u || "") ? u : ROOT + String(u || "");
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const CATS = { letters: "الحروف العربية", numbers: "الأرقام والعد", colors: "الألوان", shapes: "الأشكال", animals: "الحيوانات", food: "الفواكه والخضروات", vocab: "المفردات", english: "الإنجليزية" };
const CICON = { letters: "أ", numbers: "١٢٣", colors: "🎨", shapes: "🔷", animals: "🦁", food: "🍎", vocab: "📚", english: "ABC" };
const AGES = [1, 2, 3, 4, 5, 6], GR = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس"];
const NW = ["صفر", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة", "عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر", "عشرون"];
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const kind = (c) => (c.extra && c.extra.kind) || "";
const isMath = (c) => ["add", "sub", "cmp"].includes(kind(c));
const isEn = (c) => c.cat === "english";
const ZWJ = "‍";

/* ===== التقدّم: يُحفظ داخل بيانات «تعلّم والعب» (zad-learn-v3) لنفس الطفل ===== */
const LK = "zad-learn-v3";
let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  useKid(DB.cur, true);
}
function useKid(k, nosave) {
  DB.cur = k; S = DB.kids[k]; S.cards = S.cards || {}; const C = S.cards;
  C.c = C.c || {}; C.sk = C.sk || {}; C.bd = C.bd || []; C.st = C.st || 0; C.rounds = C.rounds || 0;
  if (!nosave) save();
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const rec = (id) => (S.cards.c[id] = S.cards.c[id] || { s: 0, o: 0, w: 0, t: 0, l: 0 });
const DAY = 864e5;
function status(id) {
  const r = S.cards.c[id]; if (!r || (!r.s && !r.o && !r.w)) return "";
  if (!r.l && r.w > 0) return "r";
  if (r.l && Date.now() - r.t > 3 * DAY) return "r";
  return r.l ? "l" : "s";
}
function seen(c) { const r = rec(c.slug); r.s++; r.t = r.t || Date.now(); save(); }
function answer(c, ok) {
  const r = rec(c.slug); r.t = Date.now();
  if (ok) { r.o++; if (r.o >= 2) r.l = 1; } else { r.w++; if (r.l && r.w > r.o) r.l = 0; }
  if (c.skill) S.cards.sk[c.skill] = (S.cards.sk[c.skill] || 0) + 1;
  save();
}
function addStars(n) { if (!n) return; S.stars = (S.stars || 0) + n; S.xp = (S.xp || 0) + 5 * n; S.cards.st += n; save(); }
const counts = (list) => { const o = { l: 0, s: 0, r: 0, n: 0 }; list.forEach((c) => { const s = status(c.slug); if (s === "l") o.l++; else if (s === "s") o.s++; else if (s === "r") o.r++; else o.n++; }); return o; };
let all = [];
const BADGES = () => {
  const b = [["c1", "🌟", "أول بطاقة", 1], ["c10", "🥉", "١٠ بطاقات", 10], ["c25", "🥈", "٢٥ بطاقة", 25], ["c50", "🥇", "٥٠ بطاقة", 50], ["c100", "🏆", "١٠٠ بطاقة", 100]].map(([id, e, t, n]) => [id, e, t, () => learned() >= n]);
  Object.keys(CATS).forEach((k) => { const L = all.filter((c) => c.cat === k); if (L.length && L.length <= 40) b.push(["cat-" + k, "🏅", "أتقنت: " + CATS[k], () => L.every((c) => status(c.slug) === "l")]); });
  return b;
};
const learned = () => all.filter((c) => { const s = S.cards.c[c.slug]; return s && s.l; }).length;
function checkBadges() {
  let n = 0; BADGES().forEach(([id, e, t, f]) => { if (!S.cards.bd.includes(id) && f()) { S.cards.bd.push(id); n++; toast("🏅 شارة جديدة: " + t); } });
  if (n) save();
}
let toastT = 0;
function toast(t) { let e = $("#ctoast"); if (!e) { e = D.createElement("div"); e.id = "ctoast"; e.setAttribute("role", "status"); e.style.cssText = "position:fixed;bottom:90px;inset-inline:12px;margin:auto;max-width:360px;background:#351078;color:#fff;border-radius:14px;padding:10px 14px;font:800 15px Cairo,sans-serif;text-align:center;z-index:99"; D.body.appendChild(e); } e.textContent = t; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (e.hidden = true), 3200); }

/* ===== الصوت: مصدر واحد في كل مرة، بلا تكرار متراكب، لا تشغيل تلقائي ===== */
const Snd = (() => {
  let A = null, tok = 0, last = { k: "", t: 0 }, voices = [];
  const tts = !!W.speechSynthesis;
  if (tts) { const f = () => (voices = speechSynthesis.getVoices()); f(); speechSynthesis.onvoiceschanged = f; }
  const pick = (lang) => voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2)) && v.lang.toLowerCase().includes(lang.slice(3).toLowerCase())) || voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(lang.slice(0, 2)));
  function stop() { tok++; if (A) { try { A.pause(); } catch {} A.onended = A.onerror = null; A = null; } if (tts) try { speechSynthesis.cancel(); } catch {} ui(false); }
  function ui(on) { D.querySelectorAll(".snd").forEach((b) => b.classList.toggle("on", on)); }
  function say(text, lang, my) { return new Promise((res) => {
    if (!tts || !text) return res(false);
    try { const u = new SpeechSynthesisUtterance(text); u.lang = lang; const v = pick(lang); if (v) u.voice = v; u.rate = 0.85; let done = false; const end = (ok) => { if (!done) { done = true; res(ok); } };
      u.onend = () => end(true); u.onerror = () => end(false); speechSynthesis.cancel(); speechSynthesis.speak(u); setTimeout(() => { if (!speechSynthesis.speaking && !done) end(false); }, 1500); } catch { res(false); }
  }); }
  function file(url, my) { return new Promise((res) => { const a = new Audio(U(url)); A = a; a.onended = () => res(true); a.onerror = () => res(false); const p = a.play(); if (p && p.catch) p.catch(() => res(false)); }); }
  async function play(steps, key) {
    const now = Date.now(); if (key === last.k && now - last.t < 700) return; last = { k: key, t: now };
    stop(); const my = tok; ui(true); let ok = false;
    for (const s of steps) {
      if (my !== tok) return;
      let r = false; if (s.url) r = await file(s.url, my); if (my !== tok) return;
      if (!r && s.text) r = await say(s.text, s.lang || "ar-SA", my);
      if (r) ok = true; if (my !== tok) return;
    }
    if (my === tok) { ui(false); if (!ok) note("تعذّر تشغيل الصوت على هذا الجهاز. جرّب سماعة أو غيّر الإعدادات."); }
  }
  D.addEventListener("visibilitychange", () => { if (D.hidden) stop(); }); W.addEventListener("pagehide", stop);
  return { play, stop };
})();
function note(t) { const e = $("#cfb"); if (e) { e.textContent = t; e.className = "cfb"; } else toast(t); }
function spoken(c) {
  const k = kind(c), x = c.extra || {};
  if (k === "add") return `${NW[x.a]} زائد ${NW[x.b]} يساوي ${NW[x.r]}`;
  if (k === "sub") return `${NW[x.a]} ناقص ${NW[x.b]} يساوي ${NW[x.r]}`;
  if (k === "cmp") return x.q.replace(/[٠-٩]+/g, (m) => NW[+String(m).replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))] || m);
  return c.word_ar;
}
function sound(c) {
  const steps = [];
  if (isEn(c)) { if (c.extra && c.extra.ch && c.cat === "english" && c.sub === "الحروف الإنجليزية") steps.push({ text: c.extra.ch, lang: "en-US" }); steps.push({ text: c.word_en, lang: "en-US" }); }
  else if (c.cat === "letters") { steps.push({ url: `learn/audio/${c.slug.slice(7)}.name.mp3`, text: (c.extra && c.extra.name) || c.word_ar }); steps.push({ url: c.audio_url, text: c.word_ar }); }
  else steps.push({ url: c.audio_url, text: spoken(c) });
  Snd.play(steps, c.slug);
}
const SNDSVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
const sndBtn = (label) => `<button type="button" class="snd" data-snd aria-label="${esc(label || "استمع")}">${SNDSVG}</button>`;

/* ===== التحميل والتصفية ===== */
const st = { q: "", cat: "", age: 0, gr: 0, sub: "", skl: "" };
let cacheNote = false;
async function load() {
  try {
    const r = await fetch(SB + "/rest/v1/cards?status=eq.published&select=*&order=sort_order&limit=2000", { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    if (!r.ok) throw 0; all = await r.json(); try { localStorage.setItem("zad-cards-cache", JSON.stringify(all)); } catch {}
  } catch { try { all = JSON.parse(localStorage.getItem("zad-cards-cache") || "[]"); cacheNote = all.length > 0; } catch { all = []; } }
}
const filtered = () => { const q = norm(st.q); return all.filter((c) => (!st.cat || c.cat === st.cat) && (!st.age || (c.ages || []).includes(st.age)) && (!st.gr || (c.grades || []).includes(st.gr)) && (!st.sub || c.subject === st.sub) && (!st.skl || c.skill === st.skl) && (!q || norm([c.word_ar, c.word_en, c.sub, c.skill, c.subject, CATS[c.cat], c.example].join(" ")).includes(q))); };
const pill = (k, v, on, l) => `<button type="button" class="zpill${on ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${on}">${esc(l)}</button>`;
function head() {
  const L = learned(), n = all.length, a = counts(all);
  const kids = Object.keys(DB.kids);
  $("#cprog").innerHTML = (kids.length > 1 ? `<select id="ckid" aria-label="الطفل">${kids.map((k) => `<option value="${esc(k)}"${k === DB.cur ? " selected" : ""}>${esc(DB.kids[k].name || "الطفل " + (kids.indexOf(k) + 1))}</option>`).join("")}</select>` : (S.name ? `<span class="pc">👤 ${esc(S.name)}</span>` : "")) +
    `<span class="pc">⭐ ${AD(S.stars || 0)}</span><span class="pc">🏅 ${AD(S.cards.bd.length)}</span><span class="pc">✅ تعلّمت ${AD(L)} من ${AD(n)}</span>${a.r ? `<span class="pc" style="background:#fff3e0;color:#e65100">↻ تحتاج مراجعة ${AD(a.r)}</span>` : ""}<button type="button" class="go" id="cmy">تقدّمي</button>`;
  $("#cstat").innerHTML = `<span>${AD(n)} بطاقة</span><span>${AD(Object.keys(CATS).filter((k) => all.some((c) => c.cat === k)).length)} تصنيفات</span>`;
}
function render() {
  $("#fcat").innerHTML = "<b>التصنيف</b>" + Object.keys(CATS).filter((k) => all.some((c) => c.cat === k)).map((k) => pill("cat", k, st.cat === k, CATS[k])).join("");
  $("#fage").innerHTML = "<b>العمر</b>" + AGES.map((a) => pill("age", a, st.age === a, a === 1 ? "سنة" : a === 2 ? "سنتان" : a + " سنوات")).join("");
  $("#fgr").innerHTML = "<b>الصف</b>" + GR.map((g, i) => pill("gr", i + 1, st.gr === i + 1, "الصف " + g)).join("");
  const subs = [...new Set(all.map((c) => c.subject).filter(Boolean))], skls = [...new Set(all.filter((c) => !st.cat || c.cat === st.cat).map((c) => c.skill).filter(Boolean))];
  const fs = $("#fsub"), fk = $("#fskl");
  fs.innerHTML = '<option value="">الكل</option>' + subs.map((s) => `<option${s === st.sub ? " selected" : ""}>${esc(s)}</option>`).join("");
  fk.innerHTML = '<option value="">الكل</option>' + skls.map((s) => `<option${s === st.skl ? " selected" : ""}>${esc(s)}</option>`).join("");
  $("#cclr").hidden = !(st.q || st.cat || st.age || st.gr || st.sub || st.skl);
  const list = filtered(); head();
  const can = { learn: list.length >= 1, review: list.some((c) => status(c.slug) === "r" || (status(c.slug) === "s")), choice: choiceOk(list), match: matchPool(list).length >= 3, recall: textPool(list).length >= 4, order: orderSets(list).length > 0 };
  const M = [["learn", "📖", "تعلّم", "صورة وصوت"], ["review", "🔁", "مراجعة", "ما سبق وشاهدته"], ["choice", "🎯", "اختيار", "اختر الصورة"], ["match", "🔗", "مطابقة", "صل الصورة بالكلمة"], ["recall", "🧠", "تذكّر", "شاهد ثم أجب"], ["order", "🔢", "ترتيب", "حروف وأرقام"]];
  $("#cmodes").innerHTML = M.map(([k, e, t, s]) => `<button type="button" data-mode="${k}"${can[k] ? "" : " disabled"} title="${can[k] ? "" : "غيّر الفلاتر ليتوفّر عدد كافٍ من البطاقات"}"><b>${e}</b>${t}<small>${s}</small></button>`).join("");
  const g = $("#cres");
  if (!all.length) { g.innerHTML = '<div class="sempty"><h3>لا توجد بطاقات منشورة حالياً</h3><p>ستظهر هنا فور نشرها.</p></div>'; return; }
  if (!list.length) { g.innerHTML = '<div class="sempty"><h3>لا توجد بطاقات مطابقة</h3><p>جرّب تغيير الفلاتر أو كلمة البحث.</p></div>'; return; }
  const by = {}; list.forEach((c) => { const k = st.cat ? c.sub || CATS[c.cat] : CATS[c.cat]; (by[k] = by[k] || []).push(c); });
  g.innerHTML = (cacheNote ? '<div class="cnote">لا يوجد اتصال: تُعرض نسخة محفوظة من البطاقات.</div>' : "") + `<p class="sfoot" style="margin:4px 0">${AD(list.length)} بطاقة</p>` + Object.keys(by).map((k) => `<h2 class="csub">${esc(k)}</h2><div class="cgrid">${by[k].map(tile).join("")}</div>`).join("");
}
function tile(c) {
  const s = status(c.slug), mk = s === "l" ? '<span class="mk l" title="تعلّمتها">✓</span>' : s === "s" ? '<span class="mk s" title="شاهدتها">●</span>' : s === "r" ? '<span class="mk r" title="تحتاج مراجعة">↻</span>' : "";
  const w = isEn(c) ? esc(c.word_en) + `<small>${esc(c.word_ar)}</small>` : esc(c.word_ar) + (c.word_en && c.cat !== "letters" && !isMath(c) ? `<small>${esc(c.word_en)}</small>` : "");
  return `<button type="button" class="ct" data-open="${esc(c.slug)}" aria-label="${esc(c.word_ar)}">${mk}<span class="im"><img src="${esc(U(c.image_url))}" alt="${esc(c.word_ar)}" loading="lazy" width="200" height="200"></span><span class="w">${w}</span></button>`;
}

/* ===== العارض ===== */
const V = $("#cvw");
let vs = null; // حالة العرض الحالي
function openV(html, onkey) { V.innerHTML = html; V.hidden = false; D.body.style.overflow = "hidden"; vs = vs || {}; vs.key = onkey; const b = $(".cvh button", V); if (b) b.focus(); }
function closeV() { Snd.stop(); V.hidden = true; V.innerHTML = ""; D.body.style.overflow = ""; vs = null; head(); render(); }
D.addEventListener("keydown", (e) => { if (V.hidden) return; if (e.key === "Escape") closeV(); else if (vs && vs.key) vs.key(e); });
const hd = (t) => `<div class="cvh"><button type="button" data-close aria-label="إغلاق">✕</button><h2>${esc(t)}</h2><button type="button" data-prog aria-label="تقدّمي">⭐ ${AD(S.stars || 0)}</button></div>`;
function forms(c) {
  const ch = c.extra && c.extra.ch; if (!ch) return "";
  const con = c.extra.con; const f = con ? [["أول الكلمة", ch + ZWJ], ["وسطها", ZWJ + ch + ZWJ], ["آخرها", ZWJ + ch]] : [["منفصل", ch], ["آخر الكلمة", ZWJ + ch]];
  return `<div class="forms">${f.map(([l, g]) => `<span><small>${l}</small>${g}</span>`).join("")}</div>`;
}
function counting(c) { const x = c.extra || {}; if (kind(c) !== "num" || !x.cnt || !x.val || x.val > 20) return ""; return `<div class="cnts" aria-label="عدّ ${NW[x.val]}">${Array.from({ length: x.val }, () => `<img src="${esc(U("images/zad/" + x.cnt + ".webp"))}" alt="">`).join("")}</div>`; }
function cardHtml(c) {
  const en = isEn(c), x = c.extra || {};
  const glyph = c.cat === "letters" ? `<div class="glyph" aria-hidden="true">${esc(x.ch)}</div><div class="sub2">${esc(x.name)}</div>` : (en && x.ch && c.sub === "الحروف الإنجليزية") ? `<div class="glyph" aria-hidden="true" style="direction:ltr">${esc(x.ch)}${esc(String(x.ch).toLowerCase())}</div>` : "";
  const word = en ? `<b class="en">${esc(c.word_en)}</b>` : `<b>${esc(c.word_ar)}</b>`;
  const sub2 = en ? `<div class="sub2">${esc(c.word_ar)}</div>` : (c.word_en && !isMath(c) && c.cat !== "letters" ? `<div class="sub2" style="direction:ltr">${esc(c.word_en)}</div>` : "");
  const obj = x.obj ? `<img src="${esc(U(x.obj))}" alt="">` : "";
  return `<div class="cbig" data-card tabindex="0" aria-label="${esc(c.word_ar)}، اضغط للاستماع">${glyph}<div class="pic"><img src="${esc(U(c.image_url))}" alt="${esc(c.word_ar)}"></div><div class="wd">${sndBtn("استمع إلى " + c.word_ar)}${word}</div>${sub2}${c.cat === "letters" ? forms(c) : ""}${counting(c)}<div class="ex${en ? " en" : ""}">${esc(c.example || "")}${obj}</div></div>`;
}
function learnView(list, i, title, after) {
  const c = list[i]; seen(c);
  openV(hd(title || "تعلّم") + `<div class="cvb"><div class="cbar"><i style="width:${((i + 1) / list.length) * 100}%"></i></div><div class="sub2" style="font-weight:800">${AD(i + 1)} / ${AD(list.length)}</div>${cardHtml(c)}<div class="cfb" id="cfb" aria-live="polite"></div></div><div class="cvf"><button type="button" class="sec" data-prev${i ? "" : " disabled"}>السابقة ›</button><button type="button" data-next>${i < list.length - 1 ? "‹ التالية" : (after ? "متابعة" : "إنهاء")}</button></div>`,
    (e) => { if (e.key === "ArrowLeft") $("[data-next]", V).click(); else if (e.key === "ArrowRight") $("[data-prev]", V).click(); });
  vs.list = list; vs.i = i; vs.title = title; vs.after = after; vs.c = c; vs.qc = null; vs.mode = "learn";
}

/* ===== المحرّك: الأسئلة ===== */
const textPool = (l) => l.filter((c) => !isMath(c));
const matchPool = (l) => textPool(l);
function choiceOk(l) { const t = textPool(l); return t.length >= 4 || l.filter(isMath).length >= 1; }
function distract(c, pool, n) {
  const same = shuffle(pool.filter((d) => !isMath(d) && d.slug !== c.slug && d.cat === c.cat && d.word_ar !== c.word_ar && d.image_url !== c.image_url));
  const sub = same.filter((d) => d.sub === c.sub);
  const out = [...sub, ...same.filter((d) => d.sub !== c.sub)].slice(0, n);
  if (out.length < n) shuffle(all.filter((d) => d.cat !== c.cat && !isMath(d) && d.word_ar !== c.word_ar)).slice(0, n - out.length).forEach((d) => out.push(d));
  return out;
}
function mathOptions(c) { const x = c.extra, set = new Set([x.r]); let g = 0; while (set.size < 4 && g++ < 60) { const d = kind(c) === "cmp" ? [x.a, x.b][set.size % 2] : Math.max(0, x.r + Math.floor(Math.random() * 7) - 3); set.add(d); } return shuffle([...set]); }
function buildChoice(list) {
  const mt = list.filter(isMath), tx = textPool(list), qs = [];
  shuffle(tx).slice(0, Math.min(8, tx.length)).forEach((c) => qs.push({ c, t: "pic" }));
  shuffle(mt).slice(0, Math.min(4, mt.length)).forEach((c) => qs.push({ c, t: "num" }));
  return shuffle(qs).slice(0, 8);
}
function run(title, qs, mode) {
  vs = { mode, qs, i: 0, ok: 0, pool: filtered(), title, list: qs.map((q) => q.c) };
  ask();
}
function ask() {
  const q = vs.qs[vs.i]; if (!q) return result();
  const c = q.c, en = isEn(c), bar = `<div class="cbar"><i style="width:${(vs.i / vs.qs.length) * 100}%"></i></div><div class="sub2" style="font-weight:800">سؤال ${AD(vs.i + 1)} من ${AD(vs.qs.length)}</div>`;
  let body = "";
  if (q.t === "pic") {
    const opts = shuffle([c, ...distract(c, vs.pool, 3)]); q.opts = opts;
    body = `<div class="cq">${sndBtn("استمع")}<span${en ? ' style="direction:ltr"' : ""}>${esc(en ? c.word_en : c.word_ar)}</span></div><div class="sub2">اختر الصورة المطابقة</div><div class="copts">${opts.map((o, k) => `<button type="button" class="copt" data-o="${k}" aria-label="خيار ${k + 1}"><img src="${esc(U(o.image_url))}" alt=""></button>`).join("")}</div>`;
  } else if (q.t === "word") {
    const opts = shuffle([c, ...distract(c, vs.pool, 3)]); q.opts = opts;
    body = `<div class="cbig" style="cursor:default"><div class="pic" style="max-height:34vh"><img src="${esc(U(c.image_url))}" alt=""></div></div><div class="sub2">ما اسم هذه البطاقة؟</div><div class="copts">${opts.map((o, k) => `<button type="button" class="copt" data-o="${k}"${en ? ' style="direction:ltr"' : ""}>${esc(en ? o.word_en : o.word_ar)}</button>`).join("")}</div>`;
  } else {
    const nums = mathOptions(c); q.nums = nums;
    body = `<div class="cbig" style="cursor:default"><div class="pic" style="max-height:34vh"><img src="${esc(U(c.image_url))}" alt=""></div></div><div class="cq">${sndBtn("استمع")}<span>${esc(c.extra.q)}</span></div><div class="copts">${nums.map((n, k) => `<button type="button" class="copt" data-o="${k}">${AD(n)}</button>`).join("")}</div>`;
  }
  openV(hd(vs.title) + `<div class="cvb">${bar}${body}<div class="cfb" id="cfb" aria-live="polite"></div></div><div class="cvf"><button type="button" data-nextq hidden>التالي ‹</button></div>`);
  vs.qc = c; vs.locked = false;
}
function pickOpt(k) {
  if (vs.locked) return; const q = vs.qs[vs.i], c = q.c; vs.locked = true;
  const good = q.t === "num" ? q.nums[k] === c.extra.r : q.opts[k].slug === c.slug;
  const btns = V.querySelectorAll(".copt"); btns.forEach((b) => (b.disabled = true));
  btns[k].classList.add(good ? "ok" : "no");
  if (!good) btns.forEach((b, j) => { if (q.t === "num" ? q.nums[j] === c.extra.r : q.opts[j].slug === c.slug) b.classList.add("ok"); });
  answer(c, good); if (good) vs.ok++;
  const f = $("#cfb"); f.className = "cfb " + (good ? "ok" : "no"); f.textContent = good ? "أحسنت! إجابة صحيحة" : "حاول مرة أخرى في الجولة القادمة";
  const nx = $("[data-nextq]", V); nx.hidden = false; nx.textContent = vs.i < vs.qs.length - 1 ? "التالي ‹" : "النتيجة"; nx.focus();
}
function result() {
  Snd.stop(); const n = vs.qs.length, acc = n ? vs.ok / n : 0, stars = acc >= 0.8 ? 2 : acc >= 0.5 ? 1 : 0;
  S.cards.rounds++; addStars(stars); checkBadges(); save();
  const mode = vs.mode, title = vs.title;
  openV(hd(title) + `<div class="cvb"><div class="res"><div class="st" aria-label="${stars} نجوم">${"⭐".repeat(stars) || "🌱"}</div><h3>${acc >= 0.8 ? "ممتاز!" : acc >= 0.5 ? "جيّد، واصل التدرّب" : "لا بأس، أعد المحاولة"}</h3><p>أجبت صحيحاً عن ${AD(vs.ok)} من ${AD(n)}</p><p>${stars ? "ربحت " + AD(stars) + (stars === 1 ? " نجمة" : " نجمتين") + " وأُضيفت إلى نجوم «تعلّم والعب»" : "النجوم تُمنح عند الإجابة الصحيحة عن نصف الأسئلة على الأقل"}</p></div></div><div class="cvf"><button type="button" class="sec" data-close>رجوع</button><button type="button" data-again="${mode}">جولة جديدة</button></div>`);
}

/* ===== الأنماط ===== */
function startMode(m) {
  const list = filtered(); Snd.stop();
  if (m === "learn") return learnView(list, 0, "تعلّم");
  if (m === "review") {
    let due = list.filter((c) => { const s = status(c.slug); return s === "r" || s === "s"; });
    if (!due.length) return toast("لا توجد بطاقات للمراجعة الآن. شاهد بعض البطاقات أولاً.");
    due = shuffle(due).slice(0, 8);
    return learnView(due, 0, "مراجعة", () => run("مراجعة: أسئلة", buildChoice(due).map((q) => (q.t === "pic" && Math.random() < .5 ? { c: q.c, t: "word" } : q)), "choice"));
  }
  if (m === "choice") return run("اختيار", buildChoice(list), "choice");
  if (m === "recall") {
    const tx = shuffle(textPool(list)).slice(0, 5);
    return learnView(tx, 0, "تذكّر: شاهد جيداً", () => run("تذكّر: أجب الآن", shuffle(tx).map((c) => ({ c, t: "word" })), "recall"));
  }
  if (m === "match") return matchRound(list);
  if (m === "order") return orderRound(list);
}
function matchRound(list) {
  const pool = shuffle(matchPool(list)).slice(0, 4), en = pool.some(isEn);
  vs = { mode: "match", title: "مطابقة", pool: list, done: 0, wrong: 0, sel: null, pairs: pool, list: pool };
  const words = shuffle(pool);
  openV(hd("مطابقة") + `<div class="cvb"><div class="sub2" style="font-weight:800">اضغط الصورة ثم الكلمة المناسبة</div><div class="mtc"><div style="display:grid;gap:10px">${pool.map((c) => `<button type="button" data-mp="${esc(c.slug)}"><img src="${esc(U(c.image_url))}" alt=""></button>`).join("")}</div><div style="display:grid;gap:10px">${words.map((c) => `<button type="button" data-mw="${esc(c.slug)}"${isEn(c) ? ' style="direction:ltr"' : ""}>${esc(isEn(c) ? c.word_en : c.word_ar)}</button>`).join("")}</div></div><div class="cfb" id="cfb" aria-live="polite"></div></div><div class="cvf"><button type="button" class="sec" data-close>رجوع</button></div>`);
}
function orderSets(list) {
  const mk = (arr, f) => { const s = arr.filter((c) => f(c)).sort((a, b) => a.extra.v - b.extra.v); return s; };
  const groups = [
    list.filter((c) => c.cat === "letters" && c.extra && c.extra.order).map((c) => ({ c, v: c.extra.order, g: c.extra.ch })),
    list.filter((c) => c.cat === "numbers" && kind(c) === "num").map((c) => ({ c, v: c.extra.val, g: AD(c.extra.val) })),
    list.filter((c) => c.cat === "english" && c.sub === "الحروف الإنجليزية" && c.extra.order).map((c) => ({ c, v: c.extra.order, g: c.extra.ch })),
    list.filter((c) => c.cat === "english" && c.sub === "الأرقام" && c.extra.val != null).map((c) => ({ c, v: c.extra.val, g: String(c.extra.val) })),
  ].map((g) => g.sort((a, b) => a.v - b.v)).filter((g) => g.length >= 4);
  return groups;
}
function orderRound(list) {
  const gs = orderSets(list), qs = [];
  for (let r = 0; r < 3; r++) { const g = gs[Math.floor(Math.random() * gs.length)], n = Math.min(g.length >= 5 ? 5 : 4, g.length), s = Math.floor(Math.random() * (g.length - n + 1)); qs.push(g.slice(s, s + n)); }
  vs = { mode: "order", title: "ترتيب", pool: list, oq: qs, oi: 0, ok: 0, list: qs[0].map((x) => x.c) }; orderAsk();
}
function orderAsk() {
  const seq = vs.oq[vs.oi]; if (!seq) { vs.qs = vs.oq; vs.ok = vs.ok; return orderResult(); }
  vs.pos = 0; vs.err = 0; vs.seq = seq;
  openV(hd("ترتيب") + `<div class="cvb"><div class="cbar"><i style="width:${(vs.oi / vs.oq.length) * 100}%"></i></div><div class="sub2" style="font-weight:800">رتّب من الأول إلى الأخير: ${AD(vs.oi + 1)} من ${AD(vs.oq.length)}</div><div class="slots" id="slots">${seq.map(() => "<span></span>").join("")}</div><div class="ord" id="ord">${shuffle(seq).map((x) => `<button type="button" data-og="${x.v}" style="${/[A-Za-z0-9]/.test(x.g) ? "direction:ltr" : ""}">${esc(x.g)}</button>`).join("")}</div><div class="cfb" id="cfb" aria-live="polite"></div></div><div class="cvf"><button type="button" class="sec" data-close>رجوع</button></div>`);
}
function orderResult() {
  const n = vs.oq.length, acc = vs.ok / n, stars = acc >= 0.8 ? 2 : acc >= 0.5 ? 1 : 0; S.cards.rounds++; addStars(stars); checkBadges(); save();
  openV(hd("ترتيب") + `<div class="cvb"><div class="res"><div class="st">${"⭐".repeat(stars) || "🌱"}</div><h3>${acc >= 0.8 ? "ممتاز!" : "واصل التدرّب"}</h3><p>رتّبت ${AD(vs.ok)} من ${AD(n)} دون أخطاء</p></div></div><div class="cvf"><button type="button" class="sec" data-close>رجوع</button><button type="button" data-again="order">جولة جديدة</button></div>`);
}
function progress() {
  const rows = Object.keys(CATS).filter((k) => all.some((c) => c.cat === k)).map((k) => { const L = all.filter((c) => c.cat === k), a = counts(L); return `<div class="row"><span>${CATS[k]}</span><span>✓ ${AD(a.l)} · ● ${AD(a.s)} · ↻ ${AD(a.r)} · من ${AD(L.length)}</span></div>`; }).join("");
  const sk = Object.entries(S.cards.sk).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<div class="row"><span>${esc(k)}</span><span>${AD(n)} إجابة</span></div>`).join("") || '<p style="margin:0;color:var(--z-ink2)">ستظهر هنا المهارات التي تدرّبت عليها في الألعاب.</p>';
  const B = BADGES(), bd = B.map(([id, e, t]) => `<div class="${S.cards.bd.includes(id) ? "" : "off"}"><b>${S.cards.bd.includes(id) ? e : "🔒"}</b>${esc(t)}</div>`).join("");
  const a = counts(all);
  openV(hd("تقدّمي") + `<div class="cvb"><div class="pan"><div class="box"><h3>ملخّص</h3><div class="row"><span>شاهدتها</span><span>${AD(a.s + a.l + a.r)}</span></div><div class="row"><span>تعلّمتها ✓</span><span>${AD(a.l)}</span></div><div class="row"><span>تحتاج مراجعة ↻</span><span>${AD(a.r)}</span></div><div class="row"><span>جولات ألعاب أكملتها</span><span>${AD(S.cards.rounds)}</span></div><div class="row"><span>نجوم من البطاقات</span><span>⭐ ${AD(S.cards.st)}</span></div><p style="margin:8px 0 0;font-size:12.5px;color:var(--z-ink2)">تُعدّ البطاقة «متعلَّمة» بعد إجابتين صحيحتين في الألعاب. وتحتاج مراجعة إن أخطأت فيها أو مرّت ٣ أيام دون مراجعتها.</p></div><div class="box"><h3>حسب التصنيف</h3>${rows}</div><div class="box"><h3>المهارات التي تدرّبت عليها</h3>${sk}</div><div class="box"><h3>الشارات</h3><div class="bdg">${bd}</div></div><div class="box"><a href="../learn/" style="font-weight:800">افتح «تعلّم والعب» لرؤية بقية إنجازاتك ›</a></div></div></div><div class="cvf"><button type="button" data-close>إغلاق</button></div>`);
}

/* ===== الأحداث ===== */
D.addEventListener("click", (e) => {
  const t = e.target.closest("button,.cbig,[data-open],a"); if (!t) return;
  if (t.dataset.open) { const list = filtered(), i = Math.max(0, list.findIndex((c) => c.slug === t.dataset.open)); return learnView(list, i, "تعلّم"); }
  if (t.dataset.mode) return startMode(t.dataset.mode);
  if (t.dataset.k) { const k = t.dataset.k, v = t.dataset.v; st[k] = (k === "age" || k === "gr") ? (st[k] === +v ? 0 : +v) : (st[k] === v ? "" : v); if (k === "cat") st.skl = ""; return render(); }
  if (t.id === "cclr") { Object.assign(st, { q: "", cat: "", age: 0, gr: 0, sub: "", skl: "" }); $("#cq").value = ""; $("#cqx").hidden = true; return render(); }
  if (t.id === "cqx") { st.q = ""; $("#cq").value = ""; t.hidden = true; return render(); }
  if (t.id === "cmy" || t.dataset.prog !== undefined && t.hasAttribute("data-prog")) return progress();
  if (V.hidden) return;
  if (t.hasAttribute("data-close")) return closeV();
  if (t.hasAttribute("data-snd")) { e.stopPropagation(); const c = vs && (vs.qc || vs.c); if (c) sound(c); return; }
  if (t.hasAttribute("data-card")) { if (vs && vs.c) sound(vs.c); return; }
  if (t.hasAttribute("data-next")) { Snd.stop(); if (vs.i < vs.list.length - 1) return learnView(vs.list, vs.i + 1, vs.title, vs.after); const a = vs.after; return a ? a() : closeV(); }
  if (t.hasAttribute("data-prev")) { Snd.stop(); return learnView(vs.list, vs.i - 1, vs.title, vs.after); }
  if (t.dataset.o !== undefined) return pickOpt(+t.dataset.o);
  if (t.hasAttribute("data-nextq")) { Snd.stop(); vs.i++; return ask(); }
  if (t.dataset.again) return startMode(t.dataset.again === "recall" ? "recall" : t.dataset.again);
  if (t.dataset.mp) { V.querySelectorAll("[data-mp]").forEach((b) => b.classList.remove("sel")); t.classList.add("sel"); vs.sel = t.dataset.mp; return; }
  if (t.dataset.mw) {
    if (!vs.sel) { $("#cfb").textContent = "اختر الصورة أولاً"; $("#cfb").className = "cfb"; return; }
    const c = vs.pairs.find((x) => x.slug === t.dataset.mw), pic = V.querySelector(`[data-mp="${CSS.escape(vs.sel)}"]`);
    if (vs.sel === t.dataset.mw) { answer(c, true); pic.classList.add("done"); t.classList.add("done"); vs.done++; vs.sel = null; $("#cfb").textContent = "صحيح!"; $("#cfb").className = "cfb ok"; if (vs.done === vs.pairs.length) setTimeout(matchResult, 500); }
    else { answer(vs.pairs.find((x) => x.slug === vs.sel), false); vs.wrong++; t.classList.add("no"); setTimeout(() => t.classList.remove("no"), 400); $("#cfb").textContent = "ليست هذه، جرّب كلمة أخرى"; $("#cfb").className = "cfb no"; }
    return;
  }
  if (t.dataset.og !== undefined) {
    const v = +t.dataset.og, want = vs.seq[vs.pos].v;
    if (v === want) { t.classList.add("used"); t.disabled = true; $("#slots").children[vs.pos].textContent = t.textContent; vs.pos++; if (vs.pos === vs.seq.length) { vs.seq.forEach((x) => answer(x.c, !vs.err)); if (!vs.err) vs.ok++; vs.oi++; setTimeout(orderAsk, 700); $("#cfb").textContent = "أحسنت!"; $("#cfb").className = "cfb ok"; } }
    else { vs.err++; t.classList.add("no"); setTimeout(() => t.classList.remove("no"), 400); $("#cfb").textContent = "ليس هذا هو التالي، فكّر مرة أخرى"; $("#cfb").className = "cfb no"; }
  }
});
function matchResult() {
  const n = vs.pairs.length, stars = vs.wrong === 0 ? 2 : vs.wrong <= 2 ? 1 : 0; S.cards.rounds++; addStars(stars); checkBadges(); save();
  openV(hd("مطابقة") + `<div class="cvb"><div class="res"><div class="st">${"⭐".repeat(stars) || "🌱"}</div><h3>${stars === 2 ? "ممتاز!" : "أحسنت، أكملت المطابقة"}</h3><p>وصلت ${AD(n)} بطاقات مع ${AD(vs.wrong)} محاولات خاطئة</p></div></div><div class="cvf"><button type="button" class="sec" data-close>رجوع</button><button type="button" data-again="match">جولة جديدة</button></div>`);
}
D.addEventListener("change", (e) => {
  if (e.target.id === "fsub") { st.sub = e.target.value; render(); }
  else if (e.target.id === "fskl") { st.skl = e.target.value; render(); }
  else if (e.target.id === "ckid") { useKid(e.target.value); render(); }
});
let qt = 0; D.addEventListener("input", (e) => { if (e.target.id !== "cq") return; clearTimeout(qt); qt = setTimeout(() => { st.q = e.target.value.trim(); $("#cqx").hidden = !st.q; render(); }, 180); });

(async function init() {
  loadDB(); await load(); render();
  const p = new URLSearchParams(location.search);
  if (p.get("cat") && CATS[p.get("cat")]) { st.cat = p.get("cat"); render(); }
  const sl = p.get("c"); if (sl) { const list = filtered(), i = list.findIndex((c) => c.slug === sl); if (i >= 0) learnView(list, i, "تعلّم"); }
})();
W.ZC = { st, filtered, status, counts, Snd, orderSets, spoken, vs: () => vs };
})();
