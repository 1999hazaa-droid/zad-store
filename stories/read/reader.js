/* قارئ القصص: قراءة + استماع (لا تشغيل تلقائي) + أنشطة + تحميل وطباعة */
(function () {
"use strict";
const W = window, D = document;
const $ = (s, r) => (r || D).querySelector(s);
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const HDR = { apikey: KEY, Authorization: "Bearer " + KEY };
const ROOT = new URL("../../", location.href).href;
const U = (u) => /^https?:/.test(u || "") ? u : ROOT + String(u || "");
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const TOPICS = { educational: "تربوية", teaching: "تعليمية", animals: "عن الحيوانات", adventure: "مغامرات", science: "علمية مبسطة", values: "قيم وأخلاق", thinking: "تنمية تفكير", arabic: "تعلّم العربية", english: "تعلّم الإنجليزية" };
const GRAD = { science: ["#d9f5e3", "#a8e6c3"], values: ["#d6f0f7", "#a9dcec"], adventure: ["#fde0ee", "#f8b4d3"], thinking: ["#fff0c9", "#fdd98a"], english: ["#e4e1ff", "#c4bdfb"], animals: ["#ffe9d6", "#ffd0a8"], educational: ["#e9e4ff", "#d3c9fb"], teaching: ["#e9e4ff", "#d3c9fb"], arabic: ["#ffe3e0", "#ffc3bd"] };
const slug = new URLSearchParams(location.search).get("s") || "";
const store = { get(k, d) { try { const v = localStorage.getItem("zad.st." + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem("zad.st." + k, JSON.stringify(v)); } catch (e) {} } };
const ic = (p) => `<svg class="rsvg" viewBox="0 0 24 24" aria-hidden="true">${p}</svg>`;
const IC = { play: ic('<path d="M8 5v14l11-7z" fill="currentColor"/>'), pause: ic('<path d="M8 5v14M16 5v14"/>'), next: ic('<path d="M15 6l-6 6 6 6"/>'), prev: ic('<path d="M9 6l6 6-6 6"/>'), back: ic('<path d="M9 6l6 6-6 6"/>') };
let S = null, pages = [], i = 0, qs = [];
let zoom = Math.min(1.8, Math.max(0.8, store.get("zoom", 1)));
let rate = store.get("rate", 0.85), vol = store.get("vol", 1);
let playing = false, token = 0, segIdx = 0, audioEl = null, paused = false;
const hasTTS = "speechSynthesis" in W && "SpeechSynthesisUtterance" in W;
let voices = [];
function loadVoices() { if (hasTTS) voices = speechSynthesis.getVoices() || []; }
if (hasTTS) { loadVoices(); speechSynthesis.addEventListener && speechSynthesis.addEventListener("voiceschanged", loadVoices); }
const voiceFor = (lang) => voices.find((v) => v.lang && v.lang.toLowerCase().replace("_", "-").startsWith(lang)) || null;
const isAr = (t) => /[؀-ۿ]/.test(t);
const hash = (s) => { let h = 7; for (let k = 0; k < s.length; k++) h = (h * 31 + s.charCodeAt(k)) >>> 0; return h; };
const shuffle = (a, seed) => { a = a.slice(); let h = seed || 1; for (let k = a.length - 1; k > 0; k--) { h = (h * 1103515245 + 12345) >>> 0; const j = h % (k + 1); [a[k], a[j]] = [a[j], a[k]]; } return a; };
const shuffleNot = (a, seed) => { let r = shuffle(a, seed), n = 0; while (r.every((x, k) => x === a[k]) && n++ < 6) r = shuffle(a, seed + n * 17); return r; };

function fail(msg) { $("#rroot").innerHTML = `<div class="rerr"><h2>${esc(msg)}</h2><p><a href="../">العودة إلى القصص</a></p></div>`; $("#rbar").hidden = true; }
if (!slug) { fail("لم يتم تحديد القصة"); return; }
fetch(SB + "/rest/v1/stories?slug=eq." + encodeURIComponent(slug) + "&status=eq.published&select=*,story_pages(n,text,images,audio_url)", { headers: HDR })
  .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then((d) => { if (!d.length) return fail("هذه القصة غير متاحة"); init(d[0]); })
  .catch(() => fail("تعذّر تحميل القصة، تحقّق من الاتصال"));

function init(s) {
  S = s; pages = (s.story_pages || []).slice().sort((a, b) => a.n - b.n); qs = Array.isArray(s.questions) ? s.questions : [];
  D.title = s.title + " | القصص التعليمية | زاد";
  $("#rtitle").textContent = s.title;
  D.documentElement.style.setProperty("--fs", zoom);
  $("#rzv").textContent = Math.round(zoom * 100) + "%";
  try { if (!sessionStorage.getItem("zad.st.read." + slug)) { sessionStorage.setItem("zad.st.read." + slug, "1"); fetch(SB + "/rest/v1/rpc/story_read", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, HDR), body: JSON.stringify({ p_slug: slug }) }).catch(() => {}); } } catch (e) {}
  const start = parseInt(new URLSearchParams(location.search).get("p") || "1", 10);
  i = Math.min(Math.max((start || 1) - 1, 0), pages.length);
  buildPrint();
  show();
}
function stop(keep) { token++; if (hasTTS) try { speechSynthesis.cancel(); } catch (e) {} if (audioEl) { try { audioEl.pause(); } catch (e) {} audioEl = null; } if (!keep) playing = false; paintAud(); }
function go(n) { const was = playing; paused = false; stop(true); i = Math.max(0, Math.min(pages.length, n)); segIdx = 0; playing = was && i < pages.length; show(); if (playing) speak(); try { scrollTo({ top: 0 }); } catch (e) {} }
function show() {
  const total = pages.length + 1;
  $("#rprog").style.width = Math.round(((i + 1) / total) * 100) + "%";
  $("#rprog").parentNode.setAttribute("aria-valuenow", Math.round(((i + 1) / total) * 100));
  $("#rpn").textContent = i < pages.length ? "صفحة " + (i + 1) + " من " + pages.length : "الأنشطة";
  $("#rprev").disabled = i === 0;
  $("#rnext").hidden = i >= pages.length; $("#raud").hidden = i >= pages.length;
  $("#rnote").hidden = true;
  if (i < pages.length) page(pages[i]); else acts();
  paintAud();
}
function page(p) {
  const g = GRAD[S.topic] || GRAD.educational;
  const imgs = (p.images || []).map((u) => `<img src="${esc(U(u))}" alt="" loading="eager">`).join("");
  const segs = String(p.text || "").split("\n").filter(Boolean);
  const body = segs.length > 1 && !isAr(segs[0]) ? `<p class="en" lang="en">${esc(segs[0])}</p><p class="gl">${esc(segs.slice(1).join(" "))}</p>` : segs.map((t) => `<p>${esc(t)}</p>`).join("");
  $("#rroot").innerHTML = `<div class="rimg${(p.images || []).length < 2 ? " one" : ""}" style="background:linear-gradient(160deg,${g[0]},${g[1]})">${imgs}</div><div class="rtext" id="rtx" lang="${isAr(segs[0] || "") ? "ar" : "en"}">${body}</div>`;
}
/* ----- الصوت: لا يبدأ إلا بضغطة المستخدم ----- */
function segments(p) { return String(p.text || "").split("\n").map((t) => t.trim()).filter(Boolean); }
function paintAud() {
  const b = $("#rplay"); if (!b) return;
  b.innerHTML = playing ? IC.pause + " إيقاف مؤقت" : IC.play + (paused || segIdx > 0 ? " استكمال" : " استمع");
  b.setAttribute("aria-pressed", playing ? "true" : "false");
  const t = $("#rtx"); if (t) t.classList.toggle("on", playing);
}
function note(m) { const n = $("#rnote"); n.textContent = m; n.hidden = !m; }
function speak() {
  let p = pages[i]; if (!p) return;
  const my = ++token;
  if (p.audio_url) {
    audioEl = new Audio(U(p.audio_url));
    audioEl.volume = vol; audioEl.playbackRate = rate < 0.8 ? 0.9 : rate > 1 ? 1.1 : 1;
    audioEl.onended = () => { if (my !== token) return; segIdx = 0; next(true); };
    audioEl.onerror = () => { if (my !== token) return; audioEl = null; fallbackTTS(my, p); };
    audioEl.play().catch(() => { if (my !== token) return; note("لم يبدأ التشغيل، اضغط زر الاستماع مرة أخرى."); playing = false; paintAud(); });
    return;
  }
  fallbackTTS(my, p);
}
function fallbackTTS(my, p) {
  if (!hasTTS) { note("هذا المتصفح لا يدعم القراءة الصوتية. يمكنك قراءة القصة أو تحميلها."); playing = false; paintAud(); return; }
  loadVoices();
  const segs = segments(p);
  const run = () => {
    if (my !== token) return;
    if (segIdx >= segs.length) { segIdx = 0; paintAud(); next(true); return; }
    const t = segs[segIdx], ar = isAr(t), v = voiceFor(ar ? "ar" : "en");
    const u = new SpeechSynthesisUtterance(t);
    u.lang = ar ? "ar-SA" : "en-US"; if (v) u.voice = v; u.rate = rate; u.volume = vol; u.pitch = 1.05;
    u.onend = () => { if (my !== token) return; segIdx++; run(); };
    u.onerror = (e) => { if (my !== token) return; if (e && (e.error === "interrupted" || e.error === "canceled")) return; note("تعذّر تشغيل الصوت على هذا الجهاز."); playing = false; paintAud(); };
    try { speechSynthesis.speak(u); } catch (e) { note("تعذّر تشغيل الصوت على هذا الجهاز."); playing = false; }
  };
  if (!voiceFor("ar") && isAr(segs.join(" "))) note("لم يُعثر على صوت عربي في جهازك؛ سيُستخدم الصوت الافتراضي إن وُجد.");
  run();
}
function next(fromAudio) { if (i < pages.length - 1) { go(i + 1); } else if (fromAudio) { playing = false; go(pages.length); } }
function togglePlay() {
  if (playing) { // إيقاف مؤقت: نحفظ موضع المقطع
    if (audioEl && !audioEl.ended) { audioEl.pause(); playing = false; paused = true; paintAud(); return; }
    paused = true; stop(false); return;
  }
  playing = true; paused = false; paintAud();
  if (audioEl && audioEl.paused && audioEl.currentTime > 0 && !audioEl.ended) { audioEl.play().catch(() => {}); return; }
  speak();
}
/* ----- الأنشطة ----- */
function acts() {
  const g = S.questions || [];
  let h = `<div class="ract"><div class="rdone">أحسنت! أنهيت قصة «${esc(S.title)}» 🎉</div><h2>أنشطة بعد القصة</h2><p>جرّب الأسئلة بهدوء، وليس هناك درجات. إذا أخطأت يمكنك المحاولة مرة أخرى.</p>`;
  qs.forEach((q, k) => { h += `<div class="rq" data-k="${k}"><h3>${k + 1}. ${esc(q.q)}</h3><div class="opts"></div><div class="rfb" aria-live="polite"></div></div>`; });
  h += `<div class="rq"><h3>الهدف من القصة</h3><p style="margin:0;font-weight:600">${esc(S.goal || "")}</p></div>`;
  h += `<h2>تحميل وطباعة</h2><div class="rdl">${S.pdf_url ? `<a class="rbt pri" href="${esc(U(S.pdf_url))}" download>تحميل القصة PDF</a>` : ""}<button type="button" class="rbt" id="ppr1">طباعة القصة</button><button type="button" class="rbt" id="ppr2">طباعة أسئلة الفهم</button>${S.activities_pdf_url ? `<a class="rbt" href="${esc(U(S.activities_pdf_url))}" download>تحميل الأنشطة PDF</a>` : ""}</div><div class="rdl"><button type="button" class="rbt" id="again">أعد قراءة القصة</button><a class="rbt" href="../">كل القصص</a></div></div>`;
  $("#rroot").innerHTML = h;
  qs.forEach((q, k) => qbuild(q, k, $('.rq[data-k="' + k + '"]')));
}
function qbuild(q, k, box) {
  const o = box.querySelector(".opts"), fb = box.querySelector(".rfb"), seed = hash(slug + k);
  const msgOk = ["أحسنت!", "إجابة رائعة!", "صحيح، بارك الله فيك!"], msgNo = ["حاول مرة أخرى", "قريب! فكّر مرة أخرى", "لا بأس، جرّب إجابة ثانية"];
  if (q.t === "mcq") {
    shuffle(q.o.map((t, idx) => ({ t, ok: idx === q.a })), seed).forEach((x) => { const b = D.createElement("button"); b.type = "button"; b.className = "ropt"; b.textContent = x.t; b.onclick = () => { if (x.ok) { b.classList.add("ok"); fb.textContent = msgOk[seed % 3]; fb.className = "rfb ok"; o.querySelectorAll("button").forEach((y) => y.disabled = true); } else { b.classList.add("no"); b.disabled = true; fb.textContent = msgNo[(seed + 1) % 3]; fb.className = "rfb"; } }; o.appendChild(b); });
  } else if (q.t === "order") {
    let step = 0; const done = D.createElement("div"); done.className = "seq";
    const items = shuffleNot(q.items, seed);
    items.forEach((t) => { const b = D.createElement("button"); b.type = "button"; b.className = "ropt"; b.textContent = t; b.onclick = () => { if (t === q.items[step]) { step++; const d = D.createElement("div"); d.textContent = step + ". " + t; done.appendChild(d); b.hidden = true; fb.className = "rfb"; fb.textContent = step === q.items.length ? "ترتيب صحيح! أحسنت 🌟" : "جيد، ما الذي حدث بعد ذلك؟"; if (step === q.items.length) fb.className = "rfb ok"; } else { b.classList.add("no"); setTimeout(() => b.classList.remove("no"), 700); fb.className = "rfb"; fb.textContent = "فكّر: ما الذي حدث أولًا؟"; } }; o.appendChild(b); });
    box.insertBefore(done, fb);
    const hint = D.createElement("p"); hint.style.cssText = "margin:0 0 8px;color:var(--z-ink2);font-size:14px"; hint.textContent = "اضغط الأحداث بالترتيب من الأول إلى الأخير."; box.insertBefore(hint, o);
  } else if (q.t === "match") {
    o.className = "mt"; const L = D.createElement("div"), R = D.createElement("div"); L.className = R.className = "col"; o.appendChild(L); o.appendChild(R);
    let sel = null, left = q.pairs.length;
    q.pairs.forEach((p) => { const b = D.createElement("button"); b.type = "button"; b.className = "ropt"; b.textContent = p[0]; b.dataset.v = p[0]; b.onclick = () => { L.querySelectorAll(".sel").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = b; }; L.appendChild(b); });
    shuffleNot(q.pairs.map((p) => p[1]), seed).forEach((t) => { const b = D.createElement("button"); b.type = "button"; b.className = "ropt"; b.textContent = t; b.onclick = () => { if (!sel) { fb.className = "rfb"; fb.textContent = "اختر العنصر من العمود الأول أولًا"; return; } const pr = q.pairs.find((p) => p[0] === sel.dataset.v); if (pr && pr[1] === t) { sel.classList.remove("sel"); sel.classList.add("ok"); sel.disabled = true; b.classList.add("ok"); b.disabled = true; sel = null; left--; fb.className = "rfb" + (left ? "" : " ok"); fb.textContent = left ? "صحيح! أكمل التوصيل" : "أحسنت! وصّلت الجميع 🌟"; } else { b.classList.add("no"); setTimeout(() => b.classList.remove("no"), 700); fb.className = "rfb"; fb.textContent = "حاول مرة أخرى"; } }; R.appendChild(b); });
  }
}
/* ----- الطباعة ----- */
function buildPrint() {
  const cover = U(S.cover_url);
  let h = `<div class="pg"><h1>${esc(S.title)}</h1><div class="im"><img src="${esc(cover)}" alt="" style="max-height:170mm"></div><div class="ft">منصة زاد التعليمية</div></div>`;
  pages.forEach((p, k) => { const segs = segments(p); const tx = segs.length > 1 && !isAr(segs[0]) ? `<p class="en">${esc(segs[0])}</p><p>${esc(segs.slice(1).join(" "))}</p>` : segs.map((t) => `<p>${esc(t)}</p>`).join(""); h += `<div class="pg"><div class="im">${(p.images || []).map((u) => `<img src="${esc(U(u))}" alt="">`).join("")}</div><div class="tx">${tx}</div><div class="ft">${esc(S.title)} — ${k + 1}</div></div>`; });
  $("#prt").dataset.story = h;
  let q = `<h1>أسئلة الفهم: ${esc(S.title)}</h1><div class="q">الاسم: ................................ &nbsp; التاريخ: ................</div>`;
  qs.forEach((x, k) => {
    q += `<div class="q"><b>${k + 1}. ${esc(x.q)}</b>`;
    if (x.t === "mcq") q += `<ul style="padding:0">${shuffle(x.o, hash(slug + k)).map((t) => `<li>☐ ${esc(t)}</li>`).join("")}</ul>`;
    else if (x.t === "order") q += `<ul style="padding:0">${shuffleNot(x.items, hash(slug + k)).map((t) => `<li>(&nbsp;&nbsp;&nbsp;) ${esc(t)}</li>`).join("")}</ul>`;
    else if (x.t === "match") q += `<ul style="padding:0">${x.pairs.map((p, n) => `<li>${esc(p[0])} &nbsp;←→&nbsp; ______________</li>`).join("")}</ul><div class="ft" style="text-align:start">الخيارات: ${shuffleNot(x.pairs.map((p) => p[1]), hash(slug + k)).map(esc).join(" — ")}</div>`;
    q += `</div>`;
  });
  $("#prt").dataset.q = q + `<div class="ft">منصة زاد التعليمية — للاستخدام الشخصي أو داخل الفصل</div>`;
}
function doPrint(which) {
  const el = $("#prt"); el.innerHTML = el.dataset[which];
  const imgs = Array.from(el.querySelectorAll("img")); let n = imgs.filter((m) => !m.complete).length;
  const fire = () => { try { W.print(); } catch (e) {} };
  if (!n) return setTimeout(fire, 50);
  const t = setTimeout(fire, 3000);
  imgs.forEach((m) => { if (!m.complete) m.addEventListener("load", () => { if (--n === 0) { clearTimeout(t); fire(); } }, { once: true }); });
}
W.addEventListener("afterprint", () => { $("#prt").innerHTML = ""; });
/* ----- ربط الأزرار ----- */
D.addEventListener("click", (e) => {
  const t = e.target.closest("button,a"); if (!t) return;
  if (t.id === "rnext") go(i + 1);
  else if (t.id === "rprev") go(i - 1);
  else if (t.id === "rplay") togglePlay();
  else if (t.id === "rzi" || t.id === "rzo") { zoom = Math.min(1.8, Math.max(0.8, Math.round((zoom + (t.id === "rzi" ? 0.15 : -0.15)) * 100) / 100)); store.set("zoom", zoom); D.documentElement.style.setProperty("--fs", zoom); $("#rzv").textContent = Math.round(zoom * 100) + "%"; }
  else if (t.id === "ppr1") doPrint("story");
  else if (t.id === "ppr2") doPrint("q");
  else if (t.id === "again") go(0);
});
$("#rvol").addEventListener("input", (e) => { vol = +e.target.value; store.set("vol", vol); if (audioEl) audioEl.volume = vol; });
$("#rvol").value = vol;
$("#rrate").value = String(rate);
$("#rrate").addEventListener("change", (e) => { rate = +e.target.value; store.set("rate", rate); if (playing) { const was = segIdx; stop(true); playing = true; segIdx = was; speak(); } });
D.addEventListener("keydown", (e) => { if (/INPUT|SELECT|TEXTAREA/.test((e.target.tagName || ""))) return; if (e.key === "ArrowLeft") go(i + 1); else if (e.key === "ArrowRight") go(i - 1); });
D.addEventListener("visibilitychange", () => { if (D.hidden && playing) { if (audioEl) audioEl.pause(); else if (hasTTS) { token++; speechSynthesis.cancel(); } playing = false; paintAud(); } });
W.addEventListener("pagehide", () => { token++; if (hasTTS) try { speechSynthesis.cancel(); } catch (e) {} });
})();
