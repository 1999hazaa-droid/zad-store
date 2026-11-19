/* الفيديوهات والدروس المصورة - زاد: دروس مصورة أصلية (رسوم متتابعة + نص + قراءة بصوت الجهاز) ودعم ملفات فيديو مرخصة. لا تشغيل تلقائي. التقدم محلي. */
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
const CATS = { letters: "الحروف واللغة العربية", math: "الأرقام والرياضيات", english: "اللغة الإنجليزية", science: "العلوم والطبيعة", living: "الحيوانات والنباتات", body: "جسم الإنسان والصحة", space: "الفضاء والاكتشاف", values: "القيم والسلوك الإيجابي", life: "المهارات الحياتية", ready: "الاستعداد المدرسي", art: "الرسم والأشغال الفنية", songs: "الأناشيد التعليمية", review: "المراجعة والشرح المدرسي" };
const LK = "zad-learn-v3", SK = "zad-vid-lv"; let DB = null, S = null;
function loadDB() {
  try { DB = JSON.parse(localStorage.getItem(LK)); } catch { DB = null; }
  if (!DB || !DB.kids) DB = { cur: "k1", kids: { k1: {} } };
  if (!DB.kids[DB.cur]) DB.cur = Object.keys(DB.kids)[0];
  S = DB.kids[DB.cur]; const v = (S.vid = S.vid || {}); v.fav = v.fav || []; v.later = v.later || []; v.watched = v.watched || {}; v.done = v.done || {}; v.pos = v.pos || {}; v.pts = v.pts || 0;
}
function save() { DB._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(DB)); } catch {} }
const getLv = () => { const p = new URLSearchParams(location.search).get("lv"); if (p && LV[p]) return p; try { const v = localStorage.getItem(SK); if (v && LV[v]) return v; } catch {} return "a5"; };
const setLv = (v) => { try { localStorage.setItem(SK, v); } catch {} };
let VIDS = [];
async function load() { try { VIDS = await rest("video_items?status=eq.published&order=sort_order.asc&select=slug,cat,title,icon,levels,subject,skill,descr,kind,scenes,video_url,poster_url,duration_s,quiz,link,created_at"); try { localStorage.setItem("zad-vid-cache", JSON.stringify(VIDS)); } catch {} } catch { try { VIDS = JSON.parse(localStorage.getItem("zad-vid-cache") || "[]"); } catch { VIDS = []; } } return VIDS; }
let tT = 0; function toast(t) { let e = $("#ltoast"); if (!e) { e = D.createElement("div"); e.id = "ltoast"; e.setAttribute("role", "status"); D.body.appendChild(e); } e.textContent = t; e.classList.add("on"); clearTimeout(tT); tT = setTimeout(() => e.classList.remove("on"), 3200); }
const isDone = (s) => !!S.vid.done[s], isFav = (s) => S.vid.fav.includes(s), isLater = (s) => S.vid.later.includes(s);
function toggle(list, slug) { const a = S.vid[list], i = a.indexOf(slug); if (i < 0) a.push(slug); else a.splice(i, 1); save(); }
const dur = (s) => (s < 60 ? AD(s) + " ثانية" : AD(Math.round(s / 60)) + " دقيقة");
const durBand = (s) => (s <= 40 ? "short" : s <= 90 ? "mid" : "long");
/* ===== مشغل موحد: فيديو واحد فقط في الوقت نفسه ===== */
const tts = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W; let voices = [];
if (tts) { const f = () => (voices = speechSynthesis.getVoices() || []); f(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", f); }
const PL = { v: null, i: 0, state: "idle", vol: 0.9, tok: 0, timer: 0, err: "", mute: false };
function stopAll() { PL.tok++; clearTimeout(PL.timer); if (tts) try { speechSynthesis.cancel(); } catch {} D.querySelectorAll("video").forEach((v) => { try { v.pause(); } catch {} }); if (PL.state === "playing") PL.state = "paused"; }
function savePos() { if (!PL.v) return; if (PL.state === "ended") delete S.vid.pos[PL.v.slug]; else if (PL.i > 0) S.vid.pos[PL.v.slug] = PL.i; save(); }
function scene(tok) {
  if (tok !== PL.tok) return; const v = PL.v;
  if (PL.i >= v.scenes.length) { PL.state = "ended"; PL.i = v.scenes.length - 1; PL.fin = true; delete S.vid.pos[v.slug]; S.vid.watched[v.slug] = Date.now(); save(); ui(); const e = D.createEvent("Event"); e.initEvent("vidend", true, true); D.dispatchEvent(e); return; }
  ui(); const txt = v.scenes[PL.i].t, en = v.cat === "english", next = () => { if (tok !== PL.tok) return; PL.i++; PL.timer = setTimeout(() => scene(tok), 600); };
  if (!tts || PL.mute) { PL.timer = setTimeout(next, 6500); return; }
  const u = new SpeechSynthesisUtterance(txt); u.lang = en ? "en-US" : "ar-SA"; u.rate = 0.85; u.pitch = 1.1; u.volume = PL.vol;
  const vv = voices.find((x) => x.lang && x.lang.toLowerCase().startsWith(en ? "en" : "ar")); if (vv) u.voice = vv;
  u.onend = () => next();
  u.onerror = (e) => { if (tok !== PL.tok || (e && e.error === "canceled")) return; PL.mute = true; PL.err = "تعذر تشغيل الصوت على هذا الجهاز، سيستمر الدرس بالصور والنص."; ui(); PL.timer = setTimeout(next, 6500); };
  try { speechSynthesis.speak(u); } catch { PL.mute = true; PL.err = "تعذر تشغيل الصوت على هذا الجهاز، سيستمر الدرس بالصور والنص."; ui(); PL.timer = setTimeout(next, 6500); }
}
function play(v) {
  if (PL.v && PL.v.slug !== v.slug) { stopAll(); PL.i = 0; PL.state = "idle"; }
  stopAll(); PL.v = v; PL.err = ""; PL.fin = false; if (PL.state === "ended" || PL.i >= v.scenes.length) PL.i = 0; PL.state = "playing"; S.vid.watched[v.slug] = S.vid.watched[v.slug] || Date.now(); save(); scene(PL.tok);
}
function pause() { const was = PL.state; stopAll(); PL.state = was === "playing" ? "paused" : was; savePos(); ui(); }
function restart() { if (!PL.v) return; const v = PL.v; stopAll(); PL.i = 0; PL.state = "idle"; play(v); }
function go(d) { if (!PL.v) return; const was = PL.state; stopAll(); PL.i = Math.max(0, Math.min(PL.v.scenes.length - 1, PL.i + d)); if (was === "playing" || was === "ended") { PL.state = "playing"; scene(PL.tok); } else { PL.state = "paused"; ui(); } }
function setVol(x) { PL.vol = x; if (PL.state === "playing" && tts && !PL.mute) { PL.tok++; clearTimeout(PL.timer); try { speechSynthesis.cancel(); } catch {} scene(PL.tok); } }
const STT = { idle: "جاهز للتشغيل", playing: "يعمل الآن", paused: "متوقف مؤقتا، اضغط تشغيل لتكمل", ended: "انتهى الدرس، يمكنك إعادته" };
const prog = (slug) => { if (!PL.v || PL.v.slug !== slug) return 0; if (PL.state === "ended") return 1; return PL.i / PL.v.scenes.length; };
function ui() {
  const mine = !!PL.v;
  D.querySelectorAll("[data-vplay]").forEach((b) => { const on = mine && PL.state === "playing"; b.setAttribute("aria-pressed", String(on)); b.textContent = on ? "❚❚ إيقاف مؤقت" : (PL.state === "paused" || PL.i > 0 && PL.state !== "ended") ? "▶ استئناف" : "▶ تشغيل"; });
  const st = $("#vst"); if (st) { st.className = "sgst" + (PL.err ? " err" : ""); st.textContent = PL.err || STT[PL.state]; }
  const b = $("#vbar"); if (b && PL.v) b.style.width = Math.round(prog(PL.v.slug) * 100) + "%";
  const sc = $("#vscene"); if (sc && PL.v) { const s = PL.v.scenes[Math.min(PL.i, PL.v.scenes.length - 1)]; if (sc.dataset.i !== String(PL.i)) { sc.dataset.i = String(PL.i); sc.innerHTML = `<img class="vsc" src="${icon(s.img)}" alt=""><p class="vcap">${esc(s.t)}</p>`; } D.querySelectorAll("#vdots i").forEach((d, k) => d.classList.toggle("on", k === PL.i)); const c = $("#vcnt"); if (c) c.textContent = "المشهد " + AD(PL.i + 1) + " من " + AD(PL.v.scenes.length); }
}
D.addEventListener("click", (e) => { const b = e.target.closest("[data-vplay]"); if (!b) return; const v = VIDS.find((x) => x.slug === b.dataset.vplay); if (!v) return; if (PL.v && PL.v.slug === v.slug && PL.state === "playing") pause(); else play(v); });
W.addEventListener("pagehide", () => { stopAll(); savePos(); });
/* ===== واجهات ===== */
function stagePills(lv, href) { return `<div class="dtabs" role="group" aria-label="مرحلة الطفل">${Object.keys(LV).map((k) => `<a class="zpill${k === lv ? " on" : ""}" href="${href}${href.includes("?") ? "&" : "?"}lv=${k}" data-lv="${k}" aria-pressed="${k === lv}">${esc(LV[k])}</a>`).join("")}</div>`; }
const forLv = (lv) => VIDS.filter((x) => x.levels.includes(lv));
function card(x, lv, pre) { const n = S.vid.pos[x.slug]; return `<a class="vcardx${isDone(x.slug) ? " done" : ""}" data-slug="${esc(x.slug)}" href="${pre || "play/"}?s=${encodeURIComponent(x.slug)}&lv=${lv}"><img src="${icon(x.icon)}" alt="" width="56" height="56"><span><b>${esc(x.title)}</b><small>${esc(CATS[x.cat] || "")} · ${dur(x.duration_s)}${isDone(x.slug) ? " · أكملت النشاط" : n ? " · تابع من حيث توقفت" : ""}</small></span></a>`; }
function row(list, lv, empty) { return list.length ? `<div class="vrow">${list.map((x) => card(x, lv)).join("")}</div>` : `<p class="tx">${empty}</p>`; }
function hubPage() {
  const box = $("#aview"), lv = getLv(); setLv(lv); const all = forLv(lv), young = lv === "a2" || lv === "a3";
  const subs = Array.from(new Set(all.map((x) => x.subject))), skills = Array.from(new Set(all.map((x) => x.skill)));
  const sec = (h, list, empty) => `<section class="art"><h2>${h}</h2>${row(list, lv, empty)}</section>`;
  const cont = all.filter((x) => S.vid.pos[x.slug]), fav = all.filter((x) => isFav(x.slug)), later = all.filter((x) => isLater(x.slug));
  const newest = all.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || b.slug.localeCompare(a.slug)).slice(0, 4);
  const most = all.filter((x) => S.vid.watched[x.slug]).sort((a, b) => S.vid.watched[b.slug] - S.vid.watched[a.slug]).slice(0, 4);
  const favCats = new Set(fav.concat(all.filter((x) => isDone(x.slug))).map((x) => x.cat));
  const sugg = all.filter((x) => !isDone(x.slug)).sort((a, b) => (favCats.has(b.cat) ? 1 : 0) - (favCats.has(a.cat) ? 1 : 0)).slice(0, 4);
  const linked = all.filter((x) => x.link && x.link.href).slice(0, 6);
  const sel = (id, lab, opts) => `<select id="${id}" aria-label="${lab}"><option value="">${lab}</option>${opts.map(([k, l]) => `<option value="${esc(k)}">${esc(l)}</option>`).join("")}</select>`;
  box.innerHTML = `<div class="hero"><img src="${icon("i_tablet")}" alt=""><div><h1>الفيديوهات والدروس التعليمية المصورة</h1><p>دروس مصورة أصلية قصيرة بالرسوم والنص وقراءة بصوت الجهاز، وبعد كل درس نشاط صغير وزر للانتقال إلى نشاط مرتبط في المكتبة.</p></div></div>
<div class="stg"><b>اختر مرحلة الطفل</b>${stagePills(lv, "./")}<p class="hint">${young ? "للأعمار الصغيرة: دروس قصيرة جدا، ويجلس الكبير مع الطفل." : "تُعرض الدروس المناسبة لهذه المرحلة."} لا يبدأ أي درس إلا عند الضغط على زر التشغيل.</p></div>
<section class="art"><h2>ابحث وصفِّ</h2><input class="vsearch" id="vq" type="search" placeholder="ابحث بعنوان الدرس أو مهارته" aria-label="بحث"><div class="vfil">${sel("fc", "التصنيف", Object.entries(CATS))}${sel("fs", "المادة", subs.map((s) => [s, s]))}${sel("fk", "المهارة", skills.map((s) => [s, s]))}${sel("ft", "نوع المحتوى", [["anim", "درس مصور"], ["file", "فيديو مرخص"]])}${sel("fd", "المدة", [["short", "قصير (حتى ٤٠ ثانية)"], ["mid", "متوسط"], ["long", "أطول"]])}</div><div id="vres" aria-live="polite"></div></section>
<div id="vsecs">${cont.length ? sec("أكمل المشاهدة", cont) : ""}${sec("مقترحة للتعلم", sugg, "لا توجد دروس لهذه المرحلة.")}${sec("أحدث الدروس", newest, "لا توجد دروس.")}${sec("الأكثر مشاهدة على هذا الجهاز", most, "ستظهر هنا الدروس التي شاهدتها. المشاهدة وحدها لا تعني الإتقان.")}${sec("مفضلتي", fav, "اضغط القلب في صفحة أي درس لتضيفه إلى مفضلتك.")}${later.length ? sec("للمشاهدة لاحقا", later) : ""}<section class="art"><h2>دروس مرتبطة بأقسام المكتبة</h2><div class="vrow">${linked.map((x) => `<a class="vcardx" href="${ROOT}${esc(x.link.href)}"><img src="${icon(x.icon)}" alt="" width="56" height="56"><span><b>${esc(x.link.label)}</b><small>مرتبط بدرس: ${esc(x.title)}</small></span></a>`).join("")}</div></section>
<section class="art"><h2>التصنيفات</h2><div class="rvc">${Object.entries(CATS).map(([k, l]) => `<button type="button" class="chip" data-cat="${k}">${esc(l)} (${AD(all.filter((x) => x.cat === k).length)})</button>`).join("")}</div></div>
<section class="art"><h2>لولي الأمر</h2><div class="lks"><a class="abtn go" href="progress/?lv=${lv}">لوحة المتابعة</a><a class="abtn" href="guide/">دليل ولي الأمر</a></div></section>
<p><a class="abtn" href="${ROOT}library/">العودة إلى المكتبة</a></p>`;
  const f = () => { const q = $("#vq").value.trim(), c = $("#fc").value, s = $("#fs").value, k = $("#fk").value, t = $("#ft").value, d = $("#fd").value, on = q || c || s || k || t || d;
    $("#vsecs").style.display = on ? "none" : ""; const L = all.filter((x) => (!q || (x.title + " " + x.skill + " " + x.descr).includes(q)) && (!c || x.cat === c) && (!s || x.subject === s) && (!k || x.skill === k) && (!t || x.kind === t) && (!d || durBand(x.duration_s) === d));
    $("#vres").innerHTML = on ? `<p class="hint">${AD(L.length)} نتيجة</p>` + row(L, lv, "لا توجد نتائج. غيّر البحث أو الفلاتر.") : ""; };
  ["#vq", "#fc", "#fs", "#fk", "#ft", "#fd"].forEach((i) => ($(i).oninput = f));
  D.querySelectorAll("[data-cat]").forEach((b) => (b.onclick = () => { $("#fc").value = b.dataset.cat; f(); $("#vres").scrollIntoView({ block: "nearest" }); }));
}
function playPage() {
  const box = $("#aview"), p = new URLSearchParams(location.search), lv = getLv(), v = VIDS.find((x) => x.slug === p.get("s"));
  if (!v) return (box.innerHTML = `<div class="sempty"><h3>الدرس غير موجود أو غير منشور</h3><p><a class="abtn go" href="../">الفيديوهات</a></p></div>`);
  const sim = VIDS.filter((x) => x.cat === v.cat && x.slug !== v.slug && x.levels.includes(lv)).concat(VIDS.filter((x) => x.cat !== v.cat && x.subject === v.subject && x.slug !== v.slug && x.levels.includes(lv))).slice(0, 3);
  const isF = v.kind === "file", start = S.vid.pos[v.slug] || 0;
  const stage = isF ? `<video class="vvid" id="vvid" controls playsinline preload="none" ${v.poster_url ? `poster="${esc(v.poster_url)}"` : ""} src="${esc(v.video_url)}">متصفحك لا يدعم تشغيل الفيديو.</video><div class="sgst" id="vst" role="status">جاهز للتشغيل. الجودة تتحدد من ملف المصدر.</div>` :
    `<div class="vstage" id="vscene" aria-live="polite"></div><div class="vdots" id="vdots">${v.scenes.map(() => "<i></i>").join("")}</div><p class="hint" id="vcnt" style="text-align:center"></p><div class="sgbar" role="progressbar" aria-label="تقدم الدرس"><i id="vbar"></i></div><div class="sgst" id="vst" role="status">${STT.idle}</div>
<div class="vbtns"><button type="button" class="main" id="vmain" data-vplay="${esc(v.slug)}">▶ تشغيل</button><button type="button" id="vprev" aria-label="المشهد السابق">⏮</button><button type="button" id="vnext" aria-label="المشهد التالي">⏭</button><button type="button" id="vre" aria-label="إعادة الدرس">↺ إعادة</button></div>
<div class="sgvol"><label for="vv">مستوى الصوت</label><input id="vv" type="range" min="0" max="1" step="0.1" value="${PL.vol}" aria-label="مستوى الصوت"></div><p class="hint">${tts ? "القراءة بصوت الجهاز، وإن تعذر الصوت يسير الدرس بالصور والنص." : "الصوت غير متاح على هذا الجهاز، سيسير الدرس بالصور والنص."}</p>`;
  box.innerHTML = `<div class="sgp"><h1 style="margin:6px 0">${esc(v.title)}</h1><div class="vmeta"><span>${esc(LV[lv])}</span><span>${esc(v.subject)}</span><span>${esc(CATS[v.cat])}</span><span>${dur(v.duration_s)}</span><span>${isF ? "فيديو مرخص" : "درس مصور أصلي"}</span></div><p class="hint">${esc(v.descr)}<br><b>المهارة المستهدفة:</b> ${esc(v.skill)}</p>${stage}
<div class="vbtns"><button type="button" id="vfav" aria-pressed="${isFav(v.slug)}">${isFav(v.slug) ? "♥ في المفضلة" : "♡ أضف للمفضلة"}</button><button type="button" id="vlater" aria-pressed="${isLater(v.slug)}">${isLater(v.slug) ? "✓ في قائمة لاحقا" : "⏱ شاهد لاحقا"}</button></div></div>
${isF ? "" : `<section class="art"><h2>نص الدرس</h2><ol class="sgly">${v.scenes.map((s) => `<li>${esc(s.t)}</li>`).join("")}</ol></section>`}
<section class="art" id="vact"><h2>نشاط بعد المشاهدة</h2><div id="actbox"></div></section>
${v.link && v.link.href ? `<section class="art"><h2>انتقل إلى نشاط مرتبط</h2><div class="lks"><a class="abtn go" id="vlink" href="${ROOT}${esc(v.link.href)}">اذهب إلى: ${esc(v.link.label)}</a></div></section>` : ""}
${sim.length ? `<section class="art"><h2>دروس مرتبطة بالموضوع</h2><div class="vrow">${sim.map((x) => card(x, lv, "./")).join("")}</div></section>` : ""}
<p><a class="abtn" href="../?lv=${lv}">كل الفيديوهات</a></p>`;
  $("#vfav").onclick = () => { toggle("fav", v.slug); const b = $("#vfav"); b.setAttribute("aria-pressed", String(isFav(v.slug))); b.textContent = isFav(v.slug) ? "♥ في المفضلة" : "♡ أضف للمفضلة"; };
  $("#vlater").onclick = () => { toggle("later", v.slug); const b = $("#vlater"); b.setAttribute("aria-pressed", String(isLater(v.slug))); b.textContent = isLater(v.slug) ? "✓ في قائمة لاحقا" : "⏱ شاهد لاحقا"; };
  if (isF) { const el = $("#vvid"), st = $("#vst"); el.addEventListener("play", () => { stopAll(); try { speechSynthesis.cancel(); } catch {} D.querySelectorAll("video").forEach((o) => { if (o !== el) o.pause(); }); S.vid.watched[v.slug] = S.vid.watched[v.slug] || Date.now(); save(); st.className = "sgst"; st.textContent = "يعمل الآن"; });
    el.addEventListener("pause", () => { if (!el.ended) { st.textContent = "متوقف مؤقتا"; if (el.currentTime > 1) { S.vid.pos[v.slug] = Math.floor(el.currentTime); save(); } } });
    el.addEventListener("ended", () => { delete S.vid.pos[v.slug]; S.vid.watched[v.slug] = Date.now(); save(); st.textContent = "انتهى الفيديو"; });
    el.addEventListener("error", () => { st.className = "sgst err"; st.textContent = "تعذر تشغيل الفيديو. تأكد من الاتصال ثم أعد المحاولة، أو اقرأ وصف الدرس وأنجز النشاط أدناه."; });
    el.addEventListener("loadedmetadata", () => { if (S.vid.pos[v.slug]) try { el.currentTime = S.vid.pos[v.slug]; } catch {} }); }
  else { PL.v = v; PL.i = Math.min(start, v.scenes.length - 1); PL.state = start ? "paused" : "idle"; PL.fin = false; $("#vre").onclick = restart; $("#vprev").onclick = () => go(-1); $("#vnext").onclick = () => go(1); $("#vv").oninput = (e) => setVol(+e.target.value); }
  activity(v, lv); ui();
}
function activity(v, lv) {
  const box = $("#actbox"); let wrong = 0, n = 0;
  const sceneWords = Array.from(new Set(v.scenes.flatMap((s) => s.t.split(/\s+/)).map((w) => w.replace(/[.,،؟!?:]/g, "")).filter((w) => w.length > 2)));
  const other = Array.from(new Set(VIDS.filter((x) => x.slug !== v.slug && (x.cat === "english") === (v.cat === "english")).flatMap((x) => x.scenes.flatMap((s) => s.t.split(/\s+/)).map((w) => w.replace(/[.,،؟!?:]/g, "")).filter((w) => w.length > 2)))).filter((w) => !sceneWords.includes(w));
  const Q = [{ q: v.quiz.q, o: v.quiz.o, why: v.quiz.why }];
  if (sceneWords.length && other.length >= 2) { const c = shuf(sceneWords)[0], ds = shuf(other).slice(0, 2); Q.push({ q: v.cat === "english" ? "Which word was in the lesson?" : "أي كلمة وردت في الدرس؟", o: [c, ...ds], why: (v.cat === "english" ? "This word was in the lesson: " : "هذه الكلمة وردت في الدرس: ") + c + "." }); }
  const ask = () => { const q = Q[n], o = shuf(q.o.map((t, i) => [t, i]));
    box.innerHTML = `<p class="hint">السؤال ${AD(n + 1)} من ${AD(Q.length)}. يمكنك مشاهدة الدرس أولا ثم الإجابة، ويمكنك المحاولة أكثر من مرة.</p><div class="qq">${esc(q.q)}</div><div class="opts">${o.map((z, j) => `<button type="button" class="opt" data-j="${j}">${esc(z[0])}</button>`).join("")}</div><div class="fb" id="fb" role="status"></div>`;
    box.querySelectorAll(".opt").forEach((b) => (b.onclick = () => { if (b.disabled) return; const z = o[+b.dataset.j], f = $("#fb");
      if (z[1] === 0) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); f.className = "fb g"; f.textContent = q.why; setTimeout(() => { n++; if (n < Q.length) ask(); else fin(); }, 1300); }
      else { wrong++; b.classList.add("bad"); b.disabled = true; f.className = "fb b"; f.textContent = "قريب! جرّب خيارا آخر، لا بأس."; } })); };
  const fin = () => { const first = !isDone(v.slug); const r = (S.vid.done[v.slug] = S.vid.done[v.slug] || { d: 0, w: 0, t: 0 }); r.d++; r.w += wrong; r.t = Date.now(); S.vid.pts += first ? 10 : 3; save(); box.innerHTML = `<div class="res"><div class="st">⭐</div><h2>${wrong ? "أحسنت، أكملت النشاط!" : "ممتاز، أكملت النشاط!"}</h2><p>حصلت على ${AD(first ? 10 : 3)} نقاط. مجموع نقاطك ${AD(S.vid.pts)}.</p><div class="btns"><button type="button" class="abtn" id="again">أعد النشاط</button></div></div>`; $("#again").onclick = () => { wrong = 0; n = 0; ask(); }; };
  ask();
}
function progressPage() {
  const box = $("#aview"), lv = getLv(), watched = VIDS.filter((x) => S.vid.watched[x.slug]), done = VIDS.filter((x) => isDone(x.slug));
  const byCat = Object.keys(CATS).map((k) => [k, watched.filter((x) => x.cat === k).length, done.filter((x) => x.cat === k).length, VIDS.filter((x) => x.cat === k && x.levels.includes(lv)).length]).filter((r) => r[1] > 0);
  const bySub = Array.from(new Set(watched.map((x) => x.subject))).map((s) => [s, watched.filter((x) => x.subject === s).length, done.filter((x) => x.subject === s).length]);
  const skills = Array.from(new Set(done.map((x) => x.skill))), later = VIDS.filter((x) => isLater(x.slug)), review = watched.filter((x) => !isDone(x.slug)).slice(0, 8);
  const lk = done.filter((x) => x.link && x.link.href);
  box.innerHTML = `<div class="hero"><img src="${icon("i_trophy")}" alt=""><div><h1>لوحة المتابعة: الفيديوهات</h1><p>ما شاهده الطفل وما أنجزه. المشاهدة وحدها لا تعني إتقان الدرس، فالأنشطة هي التي تبين الفهم.</p></div></div>
<div class="pg2"><div><b>${AD(watched.length)}</b>درسا شاهده</div><div><b>${AD(done.length)}</b>درسا أكمل نشاطه</div><div><b>${AD(skills.length)}</b>مهارة تدرب عليها</div><div><b>${AD(S.vid.pts)}</b>نقطة</div></div>
<section class="art"><h2>الدروس التي شاهدها</h2>${watched.length ? `<div class="rvc">${watched.map((x) => `<span class="chp">${esc(x.title)}${isDone(x.slug) ? " ✓" : ""}</span>`).join("")}</div>` : `<p class="tx">ستظهر هنا الدروس بعد مشاهدتها.</p>`}</section>
<section class="art"><h2>التقدم في المواد</h2>${bySub.length ? `<div class="sks">${bySub.map(([s, w, d]) => `<div><span>${esc(s)}</span><b>شاهد ${AD(w)} وأكمل نشاط ${AD(d)}</b></div>`).join("")}</div>` : `<p class="tx">سيظهر التقدم بعد المشاهدة.</p>`}</section>
<section class="art"><h2>التقدم في التصنيفات</h2>${byCat.length ? `<div class="sks">${byCat.map(([k, w, d, t]) => `<div><span>${esc(CATS[k])}</span><b>شاهد ${AD(w)}، أكمل ${AD(d)}${t ? " من " + AD(t) : ""}</b></div>`).join("")}</div>` : `<p class="tx">ستظهر التصنيفات بعد المشاهدة.</p>`}</section>
<section class="art"><h2>الأنشطة التي أنجزها</h2>${done.length ? `<div class="sks">${done.map((x) => { const r = S.vid.done[x.slug]; return `<div><span>${esc(x.title)}</span><b>أنجزه ${AD(r.d)} ${r.d > 2 ? "مرات" : "مرة"}</b></div>`; }).join("")}</div>` : `<p class="tx">ستظهر الأنشطة بعد إكمالها.</p>`}</section>
<section class="art"><h2>المهارات التي تدرب عليها</h2>${skills.length ? `<ul class="tx">${skills.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="tx">ستظهر المهارات بعد إكمال الأنشطة.</p>`}</section>
${later.length ? `<section class="art"><h2>للمتابعة لاحقا</h2><div class="lks">${later.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
${review.length ? `<section class="art"><h2>شاهدها ولم يكمل نشاطها</h2><div class="lks">${review.map((x) => `<a class="abtn" href="../play/?s=${encodeURIComponent(x.slug)}&lv=${lv}">${esc(x.title)}</a>`).join("")}</div></section>` : ""}
${lk.length ? `<section class="art"><h2>أنشطة المكتبة المقترحة بعد الدروس المكتملة</h2><div class="lks">${lk.map((x) => `<a class="abtn" href="${ROOT}${esc(x.link.href)}">${esc(x.link.label)}</a>`).join("")}</div></section>` : ""}
<section class="art"><h2>الخصوصية</h2><p class="tx">هذه البيانات محفوظة في هذا الجهاز فقط ولا تُرسل إلى أي حساب.</p><div class="btns"><button type="button" class="abtn" id="rst">مسح بيانات هذا القسم</button></div></section>
<div class="btns"><a class="abtn go" href="../?lv=${lv}">الفيديوهات</a><a class="abtn" href="../guide/">دليل ولي الأمر</a></div>`;
  let arm = false; $("#rst").onclick = () => { if (!arm) { arm = true; $("#rst").textContent = "اضغط مرة أخرى للتأكيد"; return; } S.vid = { fav: [], later: [], watched: {}, done: {}, pos: {}, pts: 0 }; save(); progressPage(); toast("تم المسح."); };
}
function guidePage() {
  $("#aview").innerHTML = `<div class="hero"><img src="${icon("i_book")}" alt=""><div><h1>دليل ولي الأمر</h1><p>كيف نستفيد من الدروس المصورة.</p></div></div>
<section class="art"><h2>كيف تستخدم القسم؟</h2><ul class="tx"><li>اختر مرحلة طفلك ثم درسا، واضغط زر التشغيل ليبدأ.</li><li>اجلس معه، فالدروس قصيرة وتحتاج إلى حوار وتكرار.</li><li>بعد الدرس نشاط قصير يبين ما فهمه، ثم زر للانتقال إلى نشاط في المكتبة.</li><li>لا يبدأ شيء تلقائيا، ولا يعمل إلا درس واحد في الوقت نفسه.</li></ul></section>
<section class="art"><h2>ما نوع هذه الدروس؟</h2><p class="tx">الدروس الحالية رسوم متتابعة أصلية مع نص وقراءة بصوت الجهاز، وليست ملفات فيديو مسجلة. يدعم القسم إضافة ملفات فيديو مرخصة من لوحة الإدارة، ولا تُنشر إلا بعد تسجيل المصدر والترخيص.</p></section>
<section class="art"><h2>حسب العمر</h2><ul class="tx"><li><b>سنة إلى ٣ سنوات:</b> دروس قصيرة جدا وبطيئة بمشاركة الكبار.</li><li><b>٤ إلى ٦ سنوات:</b> الحروف والأرقام والقيم والاستعداد المدرسي.</li><li><b>الصفوف ١ إلى ٤:</b> اللغة والرياضيات والعلوم والمراجعة.</li></ul></section>
<section class="art"><h2>الحقوق والجودة</h2><p class="tx">المحتوى أصلي لمنصة زاد. فُحصت بنيته آليا، ولم يراجعه بعد مختص لغوي أو تربوي. لا إعلانات ولا روابط خارجية.</p></section>
<div class="btns"><a class="abtn go" href="../">الفيديوهات</a></div>`;
}
(async () => { loadDB(); await load(); if (PAGE === "play") playPage(); else if (PAGE === "progress") progressPage(); else if (PAGE === "guide") guidePage(); else hubPage(); })();
})();
