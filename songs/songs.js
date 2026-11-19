/* الأناشيد والأغاني التعليمية - زاد: مشغل موحد + تصنيفات + مفضلة + أنشطة بعد الاستماع + لوحة متابعة. التقدم محلي. لا تشغيل تلقائي. */
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
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const icon = (c) => (String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`);
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const CATS = { letters: ["أناشيد الحروف واللغة العربية", "u_abc"], math: ["أناشيد الأرقام والرياضيات", "u_n10"], colors: ["أناشيد الألوان والأشكال", "1f308"], english: ["أناشيد اللغة الإنجليزية", "1f30f" ], nature: ["أناشيد الحيوانات والطبيعة", "1f43e"], science: ["أناشيد العلوم والاكتشاف", "1f52c"], values: ["أناشيد السلوك والقيم", "1f64f"], routine: ["أناشيد الروتين اليومي", "1f9fc"] };
CATS.english[1] = "i_globe";
const LK = "zad-learn-v3", SK = "zad-song-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; S.songs = S.songs || {}; S.songs.fav = S.songs.fav || []; S.songs.heard = S.songs.heard || {}; S.songs.done = S.songs.done || {}; S.songs.pts = S.songs.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
let SONGS = [];
async function load() { try { SONGS = await rest("song_items?status=eq.published&order=sort_order.asc&select=slug,cat,title,icon,levels,skill,lyrics,quiz,audio_url"); try { localStorage.setItem("zad-song-cache", JSON.stringify(SONGS)); } catch {} } catch { try { SONGS = JSON.parse(localStorage.getItem("zad-song-cache") || "[]"); } catch { SONGS = []; } } return SONGS; }
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 3200); }
const isDone = (s) => !!S.songs.done[s], isFav = (s) => S.songs.fav.includes(s);
function toggleFav(slug) { const i = S.songs.fav.indexOf(slug); if (i < 0) S.songs.fav.push(slug); else S.songs.fav.splice(i, 1); save(); }
/* ===== المشغل الموحد: أنشودة واحدة فقط في الوقت نفسه ===== */
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W; let voices = [];
if (tts) { const f = () => (voices = speechSynthesis.getVoices() || []); f(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", f); }
const PL = { slug: null, song: null, i: 0, state: "idle", vol: 0.9, audio: null, err: "", tok: 0 };
function stopAll() { PL.tok++; if (tts) try { speechSynthesis.cancel(); } catch {} if (PL.audio) { try { PL.audio.pause(); } catch {} } PL.state = "idle"; }
function markHeard(s) { S.songs.heard[s.slug] = Date.now(); save(); }
function speakFrom(tok) {
  if (tok !== PL.tok) return;
  const L = PL.song.lyrics; if (PL.i >= L.length) { PL.state = "ended"; PL.i = 0; ui(); const e = D.createEvent("Event"); e.initEvent("songend", true, true); D.dispatchEvent(e); return; }
  const u = new SpeechSynthesisUtterance(L[PL.i]); const en = PL.song.cat === "english"; u.lang = en ? "en-US" : "ar-SA"; u.rate = 0.8; u.pitch = 1.1; u.volume = PL.vol;
  const v = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith(en ? "en" : "ar")); if (v) u.voice = v;
  u.onend = () => { if (tok !== PL.tok) return; PL.i++; ui(); setTimeout(() => speakFrom(tok), 350); };
  u.onerror = (e) => { if (tok !== PL.tok || (e && e.error === "canceled")) return; PL.state = "idle"; PL.err = "تعذر تشغيل الصوت على هذا الجهاز. جرّب متصفحا آخر أو اقرأ الكلمات بصوت مرتفع."; ui(); };
  ui(); try { speechSynthesis.speak(u); } catch { PL.err = "تعذر تشغيل الصوت على هذا الجهاز."; PL.state = "idle"; ui(); }
}
function play(song) {
  if (PL.slug && PL.slug !== song.slug) { stopAll(); PL.i = 0; }
  PL.slug = song.slug; PL.song = song; PL.err = ""; markHeard(song);
  if (song.audio_url) {
    if (!PL.audio) { PL.audio = new Audio(); PL.audio.addEventListener("timeupdate", ui); PL.audio.addEventListener("ended", () => { PL.state = "ended"; ui(); const e = D.createEvent("Event"); e.initEvent("songend", true, true); D.dispatchEvent(e); }); PL.audio.addEventListener("error", () => { PL.state = "idle"; PL.err = "تعذر تحميل الملف الصوتي. حاول لاحقا."; ui(); }); }
    if (PL.audio.dataset.src !== song.audio_url) { PL.audio.src = song.audio_url; PL.audio.dataset.src = song.audio_url; }
    PL.audio.volume = PL.vol; PL.state = "playing"; const pr = PL.audio.play(); if (pr && pr.catch) pr.catch(() => { PL.state = "idle"; PL.err = "تعذر تشغيل الملف الصوتي."; ui(); }); ui(); return;
  }
  if (!tts) { PL.err = "الصوت غير متاح على هذا الجهاز. يمكنك قراءة الكلمات بصوت مرتفع."; PL.state = "idle"; return ui(); }
  stopAll(); PL.slug = song.slug; PL.song = song; PL.state = "playing"; if (PL.i >= song.lyrics.length) PL.i = 0; speakFrom(PL.tok);
}
function pause() { const was = PL.state; stopAll(); if (was === "playing") PL.state = "paused"; ui(); }
function restart() { const s = PL.song; if (!s) return; stopAll(); PL.i = 0; if (PL.audio && s.audio_url) PL.audio.currentTime = 0; play(s); }
function setVol(v) { PL.vol = v; if (PL.audio) PL.audio.volume = v; if (PL.state === "playing" && PL.song && !PL.song.audio_url && tts) { PL.tok++; try { speechSynthesis.cancel(); } catch {} speakFrom(PL.tok); } }
function progressOf(slug) { if (PL.slug !== slug) return 0; if (PL.state === "ended") return 1; if (PL.audio && PL.song && PL.song.audio_url && PL.audio.duration) return PL.audio.currentTime / PL.audio.duration; return PL.song ? PL.i / PL.song.lyrics.length : 0; }
const STT = { idle: "جاهزة للتشغيل", playing: "يعمل الآن", paused: "متوقفة مؤقتا، اضغط تشغيل لتكمل", ended: "انتهت الأنشودة، يمكنك إعادتها" };
function ui() {
  D.querySelectorAll("[data-play]").forEach((b) => { const on = PL.slug === b.dataset.play && PL.state === "playing"; b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "❚❚" : "▶"; b.setAttribute("aria-label", on ? "إيقاف مؤقت" : "تشغيل"); });
  D.querySelectorAll("[data-bar]").forEach((b) => { b.style.width = Math.round(progressOf(b.dataset.bar) * 100) + "%"; });
  D.querySelectorAll("#sgly li").forEach((li, k) => li.classList.toggle("cur", PL.state === "playing" && k === PL.i));
  const st = $("#sgst"); if (st) { const mine = PL.slug === (st.dataset.slug); st.className = "sgst" + (mine && PL.err ? " err" : ""); st.textContent = mine && PL.err ? PL.err : STT[mine ? PL.state : "idle"]; }
  const m = $("#sgmain"); if (m) { m.textContent = PL.slug === m.dataset.slug && PL.state === "playing" ? "❚❚ إيقاف مؤقت" : "▶ تشغيل"; }
}
D.addEventListener("click", (e) => { const b = e.target.closest("[data-play]"); if (!b) return; const s = SONGS.find((x) => x.slug === b.dataset.play); if (!s) return; if (PL.slug === s.slug && PL.state === "playing") pause(); else play(s); });
W.addEventListener("pagehide", stopAll);
/* ===== واجهات ===== */
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${Object.keys(LV).map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
const forLv = (lv) => SONGS.filter((x) => x.levels.includes(lv));
function card(x, lv) { return `<div class="sgcard${isDone(x.slug) ? " done" : ""}" data-slug="${esc(x.slug)}"><img src="${icon(x.icon)}" alt="" width="52" height="52"><a href="play/?s=${encodeURIComponent(x.slug)}&lv=${lv}"><b>${esc(x.title)}</b><small>${esc(CATS[x.cat][0])}${isDone(x.slug) ? " · أكملت النشاط" : ""}</small><div class="sgbar"><i data-bar="${esc(x.slug)}"></i></div></a><button type="button" class="sgplay" data-play="${esc(x.slug)}" aria-pressed="false" aria-label="تشغيل">▶</button></div>`; }
let FIL = "all";
function hubPage() {
  const box = $("#aview"), lv = getLv(); setLv(lv); const all = forLv(lv), young = lv === "a2" || lv === "a3";
  const fl = (f) => f === "all" ? all : f === "fav" ? all.filter((x) => isFav(x.slug)) : f === "heard" ? all.filter((x) => S.songs.heard[x.slug]) : f === "done" ? all.filter((x) => isDone(x.slug)) : all.filter((x) => x.cat === f);
  const chips = [["all", "الكل"], ...Object.keys(CATS).map((k) => [k, CATS[k][0].replace("أناشيد ", "")]), ["fav", "مفضلتي"], ["heard", "استمعت إليها"], ["done", "أكملت أنشطتها"]];
  const draw = () => { const L = fl(FIL); $("#sglist").innerHTML = L.length ? L.map((x) => card(x, lv)).join("") : `<div class="sempty"><h3>لا توجد أناشيد هنا بعد</h3><p class="hint">${FIL === "fav" ? "اضغط القلب في صفحة أي أنشودة لتضيفها إلى مفضلتك." : "اختر تصنيفا آخر أو مرحلة أخرى."}</p></div>`; D.querySelectorAll("[data-f]").forEach((b) => b.classList.toggle("on", b.dataset.f === FIL)); ui(); };
  box.innerHTML = `<div class="hero"><img src="${icon("i_music")}" alt=""><div><h1>الأناشيد والأغاني التعليمية</h1><p>أناشيد أصلية قصيرة تساعد على الحفظ والاستماع والتعلم، وبعد كل أنشودة نشاط صغير.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: أناشيد قصيرة جدا وكلمات متكررة، ويجلس الكبير مع الطفل." : "تُعرض الأناشيد المناسبة لهذه المرحلة."} لا يبدأ الصوت إلا عند الضغط على زر التشغيل.</p></div>
<div class="sgchips" role="group" aria-label="التصنيفات">${chips.map(([k, l]) => `<button type="button" class="chip" data-f="${k}">${esc(l)}</button>`).join("")}</div>
<div class="dgl" id="sglist"></div>
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة المتابعة</a><a class="abtn" href="guide/">دليل ولي الأمر</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
  D.querySelectorAll("[data-f]").forEach((b) => (b.onclick = () => { FIL = b.dataset.f; draw(); })); draw();
}
function words(s) { return Array.from(new Set(s.lyrics.join(" ").split(/\s+/).map((w) => w.replace(/[.,،؟!?:]/g, "")).filter((w) => w.length > 2))); }
function playPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), s = SONGS.find((x) => x.slug === p.get("s"));
  if (!s) return (box.innerHTML = `<div class="sempty"><h3>الأنشودة غير موجودة</h3><p><a class="abtn go" href="../">الأناشيد</a></p></div>`);
  const sim = SONGS.filter((x) => x.cat === s.cat && x.slug !== s.slug && x.levels.includes(lv)).slice(0, 3), rtl = s.cat !== "english";
  box.innerHTML = `<div class="sgp"><img class="big" src="${icon(s.icon)}" alt=""><h1 style="margin:6px 0">${esc(s.title)}</h1><p class="hint"><b>المهارة المستهدفة:</b> ${esc(s.skill)}<br>${esc(CATS[s.cat][0])}</p>
<div class="sgbar" role="progressbar" aria-label="تقدم التشغيل"><i data-bar="${esc(s.slug)}"></i></div><div class="sgst" id="sgst" data-slug="${esc(s.slug)}" role="status">${STT.idle}</div>
<div class="sgctl"><button type="button" class="main" id="sgmain" data-slug="${esc(s.slug)}" data-play="${esc(s.slug)}">▶ تشغيل</button><button type="button" id="sgre" aria-label="إعادة التشغيل">↺ إعادة</button><button type="button" id="sgfav" aria-pressed="${isFav(s.slug)}">${isFav(s.slug) ? "♥ في المفضلة" : "♡ أضف للمفضلة"}</button></div>
<div class="sgvol"><label for="sgv">مستوى الصوت</label><input id="sgv" type="range" min="0" max="1" step="0.1" value="${PL.vol}" aria-label="مستوى الصوت"></div>
<p class="hint">${s.audio_url ? "" : "التشغيل بصوت الجهاز يقرأ الكلمات بإيقاع هادئ، وليس تسجيلا غنائيا."}</p></div>
<section class="art"><h2>كلمات الأنشودة</h2><ol class="sgly" id="sgly" ${rtl ? "" : 'dir="ltr" style="text-align:left"'}>${s.lyrics.map((l) => `<li>${esc(l)}</li>`).join("")}</ol></section>
<section class="art" id="sgact"><h2>نشاط بعد الاستماع</h2><div id="actbox"></div></section>
${sim.length ? `<section class="art"><h2>أناشيد مقترحة من التصنيف نفسه</h2><div class="dgl">${sim.map((x) => card(x, lv).replace('href="play/', 'href="./')).join("")}</div></section>` : ""}
<p><a class="abtn" href="../?lv=${lv}">كل الأناشيد</a></p>`;
  $("#sgre").onclick = restart; $("#sgv").oninput = (e) => setVol(+e.target.value);
  $("#sgfav").onclick = () => { toggleFav(s.slug); const b = $("#sgfav"); b.setAttribute("aria-pressed", String(isFav(s.slug))); b.textContent = isFav(s.slug) ? "♥ في المفضلة" : "♡ أضف للمفضلة"; };
  activity(s, lv); ui();
}
function activity(s, lv) {
  const box = $("#actbox"); let wrong = 0;
  const own = words(s), other = Array.from(new Set(SONGS.filter((x) => x.slug !== s.slug && (x.cat === "english") === (s.cat === "english")).flatMap(words))).filter((w) => !own.includes(w));
  const Q = [{ q: s.quiz.q, o: s.quiz.o, why: s.quiz.why }];
  if (own.length >= 1 && other.length >= 2) { const c = shuf(own)[0], ds = shuf(other).slice(0, 2); Q.push({ q: "أي كلمة وردت في الأنشودة؟", o: [c, ...ds], why: "هذه الكلمة وردت في الأنشودة: " + c + "." }); }
  let n = 0;
  const ask = () => { const q = Q[n], o = shuf(q.o.map((t, i) => [t, i]));
    box.innerHTML = `<p class="hint">السؤال ${AD(n + 1)} من ${AD(Q.length)}. يمكنك الاستماع أولا ثم الإجابة، ويمكنك المحاولة أكثر من مرة.</p><div class="qq">${esc(q.q)}</div><div class="opts">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${esc(z[0])}</button>`).join("")}</div><div class="fb" id="fb" role="status"></div>`;
    box.querySelectorAll(".opt").forEach((b) => (b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j], f = $("#fb");
      if (z[1] === 0) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); f.className = "fb g"; f.textContent = q.why; setTimeout(() => { n++; if (n < Q.length) ask(); else fin(); }, 1300); }
      else { wrong++; b.classList.add("bad"); b.disabled = true; f.className = "fb b"; f.textContent = "قريب! جرّب خيارا آخر، لا بأس."; } })); };
  const fin = () => { const first = !isDone(s.slug); const r = (S.songs.done[s.slug] = S.songs.done[s.slug] || { d: 0, w: 0, t: 0 }); r.d++; r.w += wrong; r.t = Date.now(); S.songs.pts += first ? 10 : 3; save(); const c = $(".sgcard"); box.innerHTML = `<div class="res"><div class="st">⭐</div><h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2><p>حصلت على ${AD(first ? 10 : 3)} نقاط. مجموع نقاطك ${AD(S.songs.pts)}.</p><div class="btns"><button type="button" class="abtn" id="again">أعد النشاط</button></div></div>`; $("#again").onclick = () => { wrong = 0; n = 0; ask(); }; };
  ask();
}
function progressPage() {
  const box = $("#aview"), lv = getLv(), heard = SONGS.filter((x) => S.songs.heard[x.slug]), done = SONGS.filter((x) => isDone(x.slug));
  const byCat = Object.keys(CATS).map((k) => [k, heard.filter((x) => x.cat === k).length, SONGS.filter((x) => x.cat === k && x.levels.includes(lv)).length]).filter((r) => r[1] > 0).sort((a, b) => b[1] - a[1]);
  const skills = Array.from(new Set(done.map((x) => x.skill)));
  const review = SONGS.filter((x) => S.songs.heard[x.slug] && !isDone(x.slug)).slice(0, 8);
  const fav = SONGS.filter((x) => isFav(x.slug));
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة المتابعة: الأناشيد</h1><p>ما استمع إليه الطفل وما أكمله. عدد مرات الاستماع وحده لا يعني إتقان المهارة، فالأنشطة تبين الفهم.</p></div></div>
<div class="pg2"><div><b>${AD(heard.length)}</b>أنشودة استمع إليها</div><div><b>${AD(done.length)}</b>نشاطا مكتملا</div><div><b>${AD(skills.length)}</b>مهارة تدرب عليها</div><div><b>${AD(S.songs.pts)}</b>نقطة</div></div>
<section class="art"><h2>الأناشيد التي استمع إليها</h2>${heard.length ? `<div class="rvc">${heard.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">ستظهر هنا الأناشيد بعد الاستماع إليها.</p>`}</section>
<section class="art"><h2>التصنيفات التي اهتم بها</h2>${byCat.length ? `<div class="sks">${byCat.map(([k, n, t]) => `<div><span>${esc(CATS[k][0])}</span><b>${AD(n)} أناشيد</b></div>`).join("")}</div>` : `<p class="tx">ستظهر التصنيفات بعد الاستماع.</p>`}</section>
<section class="art"><h2>الأنشطة المرتبطة التي أكملها</h2>${done.length ? `<div class="sks">${done.map((x) => { const r = S.songs.done[x.slug]; return `<div><span>${esc(x.title)}</span><b>أكملها ${AD(r.d)} ${r.d > 2 ? "مرات" : "مرة"}</b></div>`; }).join("")}</div>` : `<p class="tx">ستظهر الأنشطة بعد إكمالها.</p>`}</section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${skills.length ? `<ul class="tx">${skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="tx">ستظهر المهارات بعد إكمال الأنشطة.</p>`}</section>
${review.length ? `<section class="art"><h2>استمع إليها ولم يكمل نشاطها</h2><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>المفضلة</h2>${fav.length ? `<div class="rvc">${fav.map((x) => `<span class="chp">${esc(x.title)}</span>`).join("")}</div>` : `<p class="tx">لا توجد أناشيد مفضلة بعد.</p>`}</section>
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط ولا تُرسل إلى أي حساب.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح بيانات هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">الأناشيد</a><a class="abtn" href="../guide/">دليل ولي الأمر</a></div>`;
  let arm = false; $("#rst").onclick = () => { if (!arm) { arm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد"; return; } S.songs = { fav: [], heard: {}, done: {}, pts: 0 }; save(); progressPage(); toast("تم المسح."); };
}
function guidePage() {
  $("#aview").innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>كيف نستفيد من الأناشيد في التعلم والحفظ.</p></div></div>
<section class="art"><h2>كيف تستخدم القسم؟</h2><ul class="tx"><li>اختر مرحلة طفلك، ثم أنشودة، واضغط زر التشغيل ليبدأ الصوت.</li><li>اجلسوا معه وردّدوا الكلمات معا، فالترديد أنفع من الاستماع وحده.</li><li>بعد الأنشودة يوجد نشاط قصير، وهو يبين ما فهمه الطفل.</li><li>لا يُشغَّل شيء تلقائيا، ولا يعمل إلا نشيد واحد في الوقت نفسه.</li></ul></section>
<section class="art"><h2>عن الصوت</h2><p class="tx">المشغل يقرأ الكلمات بصوت الجهاز بإيقاع هادئ، وليس تسجيلا غنائيا. تُضاف التسجيلات الحقيقية لاحقا، وعندها تعمل مع المشغل نفسه.</p></section>
<section class="art"><h2>حسب العمر</h2><ul class="tx"><li><b>سنة إلى ٣ سنوات:</b> أناشيد قصيرة جدا بكلمات متكررة، بمشاركة الكبار.</li><li><b>٤ إلى ٦ سنوات:</b> الحروف والأرقام والألوان والقيم.</li><li><b>الصفوف ١ إلى ٤:</b> القراءة والعمليات والمفاهيم العلمية ومراجعة الدروس.</li></ul></section>
<section class="art"><h2>حقوق الأناشيد</h2><p class="tx">كل الكلمات أصلية كتبت لمنصة زاد، ولا تنسخ نصا محميا بحقوق النشر.</p></section>
<div class="btns"><a class="abtn go" href="../">الأناشيد</a></div>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else hubPage(); })();
})();
