/* التجارب والمشاريع العلمية - زاد: قائمة + صفحة تجربة */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const IN_VIEW = /\/experiments\/view\/?/.test(location.pathname);
const ROOT = new URL(IN_VIEW ? "../../" : "../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const SU = (u) => (/^https?:/.test(u || "") ? u : ROOT + String(u || ""));
const icon = (c) => `${ROOT}images/zad/${c}.webp`;
const TOPICS = { water: ["تجارب الماء", "1f4a7", "#dff3fb"], colors: ["تجارب الألوان", "1f3a8", "#fde3ee"], plants: ["تجارب النباتات", "1f331", "#e3f6e3"], light: ["الضوء والظل", "1f4a1", "#fff3c9"], air: ["الهواء والطقس", "1f4a8", "#e4e6ff"], daily: ["العلوم اليومية", "1f52c", "#f3e8ff"], space: ["مشاريع الفضاء", "x_saturn", "#e4e6ff"], animals: ["مشاريع الحيوانات", "1f981", "#fff0d9"], body: ["مشاريع جسم الإنسان", "x_eye", "#fde3ee"], env: ["مشاريع البيئة", "x_recbin", "#e1f2ea"], math: ["مشاريع المجسمات", "i_blocks", "#fff3c9"], sense: ["استكشاف حسي", "1f308", "#f3e8ff"] };
const KINDS = { experiment: "تجربة", project: "مشروع", sensory: "استكشاف حسي (١–٢ سنة)" };
const ADULT = { none: ["متابعة بسيطة من كبير", "ok"], near: ["بحضور شخص كبير بجانب الطفل", "mid"], required: ["بإشراف مباشر من شخص كبير", "req"] };
const DIFF = ["", "سهلة", "متوسطة", "تحتاج تركيزًا"];
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const TIER = { 1: "١–٤ سنوات", 2: "٥–٦ سنوات والصفان ١–٢", 3: "الصفان ٣–٤" };
const tierOf = (lv) => ({ a2: 1, a3: 1, a4: 1, a5: 2, a6: 2, g1: 2, g2: 2, g3: 3, g4: 3 }[lv] || 0);
const lvText = (a) => { const l = a || []; if (!l.length) return ""; const ag = l.filter((x) => x[0] === "a"), gr = l.filter((x) => x[0] === "g"); const p = []; if (ag.length) p.push(ag.length === 1 ? LV[ag[0]] : "من " + LV[ag[0]].replace(" سنوات", "").replace("سنة إلى سنتين", "سنة") + " إلى " + LV[ag[ag.length - 1]]); if (gr.length) p.push(gr.length === 1 ? LV[gr[0]] : "الصفوف " + AD(gr[0][1]) + "–" + AD(gr[gr.length - 1][1])); return p.join(" + "); };
const CACHE = "zad-exp-v1";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
async function rest(q) { const r = await fetch(SB + "/rest/v1/" + q, { headers: H }); if (!r.ok) throw new Error(r.status); const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad"); return j; }
async function load(slug) {
  try {
    const j = await rest("experiments?status=eq.published&order=sort_order.asc&select=" + (slug ? "*&slug=eq." + encodeURIComponent(slug) : "slug,kind,topic,title,icon,levels,goal,difficulty,minutes,adult,sort_order"));
    if (!slug) { try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {} }
    return j;
  } catch { if (slug) return null; try { return JSON.parse(localStorage.getItem(CACHE)) || []; } catch { return []; } }
}
const shuf = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const tn = (k) => (TOPICS[k] || [k])[0];
const abadge = (a) => { const x = ADULT[a] || ADULT.near; return `<span class="ab ${x[1]}">${x[1] === "ok" ? "👤" : "🧑‍🤝‍🧑"} ${esc(x[0])}</span>`; };
/* ===== القائمة ===== */
let all = [];
const F = { kind: "", topic: "", stage: "", lv: "", adult: "", q: "" };
const pill = (k, v, l) => `<button type="button" class="zpill${F[k] === v ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${F[k] === v}">${esc(l)}</button>`;
function base(skip) {
  const q = norm(F.q).trim();
  return all.filter((a) => (skip === "kind" || !F.kind || a.kind === F.kind) && (skip === "topic" || !F.topic || a.topic === F.topic) && (skip === "stage" || !F.stage || (a.levels || []).some((x) => x[0] === (F.stage === "age" ? "a" : "g"))) && (skip === "lv" || !F.lv || (a.levels || []).includes(F.lv)) && (skip === "adult" || !F.adult || a.adult === F.adult) &&
    (!q || norm([a.title, a.goal, tn(a.topic), KINDS[a.kind]].join(" ")).includes(q)));
}
const href = (a) => `view/?s=${encodeURIComponent(a.slug)}` + (F.lv ? "&lv=" + F.lv : "");
function card(a) {
  const c = TOPICS[a.topic] || ["", "1f52c", "#f3eeff"];
  return `<a class="tc" href="${href(a)}"><span class="im" style="--bg:${c[2]}"><img src="${esc(icon(a.icon))}" alt="" loading="lazy" width="96" height="96"></span><span class="bd"><h3>${esc(a.title)}</h3><span class="mt"><span>${esc(KINDS[a.kind])}</span><span>${esc(lvText(a.levels))}</span></span><span class="mt"><span>${esc(c[0])}</span><span>${DIFF[a.difficulty]}</span><span>⏱ ${AD(a.minutes)} دقيقة</span></span><p>${esc(a.goal)}</p>${abadge(a.adult)}<span class="abtn go">افتح</span></span></a>`;
}
function drawList() {
  const set = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };
  const cnt = {}; base("topic").forEach((a) => (cnt[a.topic] = (cnt[a.topic] || 0) + 1));
  set("#mkinds", Object.keys(TOPICS).filter((k) => cnt[k] || F.topic === k).map((k) => `<button type="button" class="mk${F.topic === k ? " on" : ""}" data-k="topic" data-v="${F.topic === k ? "" : k}" aria-pressed="${F.topic === k}"><img src="${icon(TOPICS[k][1])}" alt=""><span>${esc(TOPICS[k][0])}<small>${AD(cnt[k] || 0)} نشاط</small></span></button>`).join(""));
  set("#fstage", "<b>المرحلة</b>" + pill("stage", "", "الكل") + pill("stage", "age", "الأعمار: ١–٦ سنوات") + pill("stage", "grade", "الصفوف: ١–٤"));
  const fl = $("#flv");
  if (fl) { fl.hidden = !F.stage; if (F.stage) fl.innerHTML = "<b>" + (F.stage === "age" ? "العمر" : "الصف") + "</b>" + pill("lv", "", "الكل") + (F.stage === "age" ? AGES : GRADES).map((k) => pill("lv", k, LV[k])).join(""); }
  set("#fkind", "<b>النوع</b>" + pill("kind", "", "الكل") + Object.keys(KINDS).map((k) => pill("kind", k, KINDS[k])).join(""));
  set("#fadult", "<b>إشراف الكبار</b>" + pill("adult", "", "الكل") + Object.keys(ADULT).map((k) => pill("adult", k, ADULT[k][0])).join(""));
  const r = base(), any = Object.values(F).some(Boolean);
  const c = $("#sclr"); if (c) c.hidden = !any;
  const st = $("#sstat"); if (st) st.innerHTML = `<span>${AD(all.filter((a) => a.kind === "experiment").length)} تجربة</span><span>${AD(all.filter((a) => a.kind === "project").length)} مشروعًا</span><span>${AD(all.filter((a) => a.kind === "sensory").length)} أنشطة حسية لعمر ١–٢</span>`;
  $("#sres").innerHTML = !all.length ? `<div class="sempty"><h3>تعذّر تحميل التجارب</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p><button class="abtn go" type="button" id="sretry">إعادة المحاولة</button></div>`
    : r.length ? `<p class="sfoot" style="margin:6px 0">${AD(r.length)} نتيجة</p><div class="mgrid">${r.map(card).join("")}</div>` : `<div class="sempty"><h3>لا توجد نتائج مطابقة</h3><p>جرّب إزالة بعض الفلاتر.</p></div>`;
}
function initList() {
  const p = new URLSearchParams(location.search);
  ["topic", "kind", "q"].forEach((k) => { const v = p.get(k); if (v && (k === "q" || (k === "topic" ? TOPICS[v] : KINDS[v]))) F[k] = v; });
  if (p.get("lv") && LV[p.get("lv")]) { F.lv = p.get("lv"); F.stage = F.lv[0] === "a" ? "age" : "grade"; }
  if (F.q) { const q = $("#sq"); if (q) { q.value = F.q; $("#sqx").hidden = false; } }
  D.addEventListener("click", (e) => {
    const b = e.target.closest("[data-k]"); if (b && !b.disabled) { const k = b.dataset.k; F[k] = b.dataset.v; if (k === "stage") F.lv = ""; drawList(); return; }
    if (e.target.id === "sclr") { Object.keys(F).forEach((k) => (F[k] = "")); const q = $("#sq"); if (q) q.value = ""; $("#sqx").hidden = true; drawList(); }
    if (e.target.id === "sretry") boot();
  });
  const q = $("#sq"), x = $("#sqx");
  q.addEventListener("input", () => { F.q = q.value; x.hidden = !q.value; drawList(); });
  x.addEventListener("click", () => { q.value = ""; F.q = ""; x.hidden = true; drawList(); q.focus(); });
}
/* ===== صفحة التجربة ===== */
let TP = null, TR = 2, total = 0, done = 0, right = 0;
function act(a, i) {
  const k = { mc: "اختر الإجابة الصحيحة", tf: "صح أم خطأ؟", fill: "أكمل المعلومة", match: "طابق الصورة بالمعلومة", sort: "صنّف", odd: "اكتشف الاختلاف", order: "رتّب خطوات التجربة" }[a.k];
  const lab = `<span class="k">${k}</span>`;
  const o2 = (arr) => shuf(arr.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}">${esc(t)}</button>`).join("");
  if (a.k === "mc" || a.k === "fill") return `<div class="act" data-i="${i}" data-k="${a.k}"><h3>${lab}${esc(a.q).replace("___", "<b>_____</b>")}</h3><div class="opts">${o2(a.o)}</div><div class="fb"></div></div>`;
  if (a.k === "tf") return `<div class="act" data-i="${i}" data-k="tf"><h3>${lab}${esc(a.q)}</h3><div class="opts"><button type="button" class="opt" data-j="1">صحيح</button><button type="button" class="opt" data-j="0">خطأ</button></div><div class="fb"></div></div>`;
  if (a.k === "odd") return `<div class="act" data-i="${i}" data-k="odd"><h3>${lab}أي واحد مختلف عن الباقي؟</h3><div class="opts">${shuf(a.i.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}"><img src="${esc(icon(t[1]))}" alt="">${esc(t[0])}</button>`).join("")}</div><div class="fb"></div></div>`;
  if (a.k === "match") return `<div class="act" data-i="${i}" data-k="match"><h3>${lab}اختر الصورة ثم الاسم المناسب لها</h3><div class="mcols"><div class="opts" style="flex-direction:column">${shuf(a.p.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt L" data-j="${j}"><img src="${esc(icon(t[0]))}" alt="${esc(t[1])}"></button>`).join("")}</div><div class="opts" style="flex-direction:column">${shuf(a.p.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt R" data-j="${j}">${esc(t[1])}</button>`).join("")}</div></div><div class="fb"></div></div>`;
  if (a.k === "sort") return `<div class="act" data-i="${i}" data-k="sort"><h3>${lab}اختر العنصر ثم المجموعة المناسبة</h3><div class="opts">${shuf(a.i.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}"><img src="${esc(icon(t[2]))}" alt="">${esc(t[0])}</button>`).join("")}</div><div class="grp">${a.g.map((g, gi) => `<div><button type="button" class="gb" data-g="${gi}">${esc(g)}</button><div class="put" data-p="${gi}"></div></div>`).join("")}</div><div class="fb"></div></div>`;
  if (a.k === "order") return `<div class="act" data-i="${i}" data-k="order"><h3>${lab}اضغط الخطوات بالترتيب الصحيح من الأولى إلى الأخيرة</h3><div class="opts" style="flex-direction:column">${shuf(a.s.map((t, j) => [t, j])).map(([t, j]) => `<button type="button" class="opt" data-j="${j}"><img src="${esc(icon(t[1]))}" alt="">${esc(t[0])}</button>`).join("")}</div><ol class="ordd"></ol><div class="fb"></div></div>`;
  return "";
}
function score() { const s = $("#score"); if (!s) return; s.innerHTML = done >= total ? `أنهيت الأنشطة! نتيجتك: ${AD(right)} من ${AD(total)}` + (right === total ? " — ممتاز" : " — يمكنك قراءة التجربة ثم المحاولة من جديد") : `أجبت عن ${AD(done)} من ${AD(total)} — إجاباتك الصحيحة: ${AD(right)}`; }
function finish(box, ok, msg, first) { box.classList.toggle("ok", ok); if (ok) { done++; if (first) right++; score(); } const fb = $(".fb", box); fb.className = "fb " + (ok ? "g" : "b"); fb.textContent = msg; }
function wireActs(acts) {
  D.querySelectorAll(".act").forEach((box) => {
    const a = acts[+box.dataset.i]; let tries = 0, sel = null, left = 0, next = 0;
    const fb = () => $(".fb", box);
    if (["mc", "tf", "fill", "odd"].includes(a.k)) {
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (!b || b.disabled) return; const j = +b.dataset.j; const ok = a.k === "tf" ? (j === 1) === !!a.a : j === a.a; tries++;
        if (ok) { b.classList.add("good"); box.querySelectorAll(".opt").forEach((x) => (x.disabled = true)); finish(box, true, a.k === "odd" ? "أحسنت! " + a.why : "أحسنت! إجابة صحيحة.", tries === 1); }
        else { b.classList.add("bad"); b.disabled = true; fb().className = "fb b"; fb().textContent = "حاول مرة أخرى."; }
      });
    } else if (a.k === "order") {
      left = a.s.length;
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (!b || b.disabled) return; tries++;
        if (+b.dataset.j === next) { b.disabled = true; b.classList.add("good"); const li = D.createElement("li"); li.textContent = a.s[next][0]; $(".ordd", box).appendChild(li); next++; fb().className = "fb g"; fb().textContent = "خطوة صحيحة."; if (next === left) finish(box, true, "أحسنت! رتّبت كل الخطوات.", tries === left); }
        else { b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 600); fb().className = "fb b"; fb().textContent = "ليست هذه هي الخطوة التالية، حاول مرة أخرى."; }
      });
    } else if (a.k === "match") {
      left = a.p.length;
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (!b || b.disabled) return;
        if (b.classList.contains("L")) { box.querySelectorAll(".L.sel").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = b; return; }
        if (!sel) { fb().className = "fb b"; fb().textContent = "اختر الصورة أولًا."; return; }
        tries++;
        if (sel.dataset.j === b.dataset.j) { sel.classList.remove("sel"); sel.classList.add("good"); b.classList.add("good"); sel.disabled = b.disabled = true; sel = null; left--; fb().className = "fb g"; fb().textContent = "مطابقة صحيحة."; if (!left) finish(box, true, "أحسنت! طابقت كل العناصر.", tries === a.p.length); }
        else { b.classList.add("bad"); setTimeout(() => b.classList.remove("bad"), 600); fb().className = "fb b"; fb().textContent = "ليست هذه، حاول مرة أخرى."; }
      });
    } else if (a.k === "sort") {
      left = a.i.length;
      box.addEventListener("click", (e) => {
        const b = e.target.closest(".opt"); if (b && !b.disabled) { box.querySelectorAll(".opt.sel").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); sel = b; return; }
        const g = e.target.closest(".gb"); if (!g) return;
        if (!sel) { fb().className = "fb b"; fb().textContent = "اختر العنصر أولًا."; return; }
        tries++; const item = a.i[+sel.dataset.j];
        if (item[1] === +g.dataset.g) { const s = D.createElement("span"); s.textContent = item[0]; $(`.put[data-p="${g.dataset.g}"]`, box).appendChild(s); sel.remove(); sel = null; left--; fb().className = "fb g"; fb().textContent = "تصنيف صحيح."; if (!left) finish(box, true, "أحسنت! صنّفت كل العناصر.", tries === a.i.length); }
        else { fb().className = "fb b"; fb().textContent = "ليست في هذه المجموعة، حاول مرة أخرى."; }
      });
    }
  });
}
function pad() {
  const cv = $("#pad"); if (!cv) return; const cx = cv.getContext("2d"); let col = "#6d28d9", dr = false;
  cx.lineWidth = 5; cx.lineCap = "round"; cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height);
  const pos = (e) => { const r = cv.getBoundingClientRect(); const t = e.touches ? e.touches[0] : e; return [(t.clientX - r.left) * cv.width / r.width, (t.clientY - r.top) * cv.height / r.height]; };
  const st = (e) => { dr = true; const [x, y] = pos(e); cx.strokeStyle = col; cx.beginPath(); cx.moveTo(x, y); cx.lineTo(x + .1, y + .1); cx.stroke(); e.preventDefault(); };
  const mv = (e) => { if (!dr) return; const [x, y] = pos(e); cx.lineTo(x, y); cx.stroke(); e.preventDefault(); };
  const en = () => { dr = false; };
  cv.addEventListener("pointerdown", st); cv.addEventListener("pointermove", mv); cv.addEventListener("pointerup", en); cv.addEventListener("pointerleave", en);
  D.querySelectorAll(".cl").forEach((b) => b.addEventListener("click", () => { col = b.dataset.c; D.querySelectorAll(".cl").forEach((x) => x.classList.toggle("on", x === b)); }));
  $("#padx").addEventListener("click", () => { cx.fillStyle = "#fff"; cx.fillRect(0, 0, cv.width, cv.height); });
}
function refl(t) {
  const ta = $("#reflt"); if (!ta) return; const k = "zad-exp-refl-" + t.slug;
  try { ta.value = localStorage.getItem(k) || ""; } catch {}
  ta.addEventListener("input", () => { try { localStorage.setItem(k, ta.value); } catch {} });
}
async function libLinks(t) {
  const out = [];
  for (const l of t.links || []) {
    try {
      if (l.type === "cards") { const j = await rest(`cards?status=eq.published&cat=eq.${encodeURIComponent(l.cat)}${l.sub ? "&sub=eq." + encodeURIComponent(l.sub) : ""}&select=slug&limit=1`); if (j.length) out.push(["بطاقات تعليمية", l.label || "بطاقات مرتبطة", `${ROOT}cards/?cat=${encodeURIComponent(l.cat)}`]); continue; }
      const T = { stories: ["stories", "title,summary", "قصص", "slug,title", (s) => `${ROOT}stories/read/?s=${encodeURIComponent(s.slug)}`], activities: ["activities", "title,summary", "أنشطة منزلية وأوراق عمل", "slug,title", (s) => `${ROOT}activities/view/?a=${encodeURIComponent(s.slug)}`], media: ["media_aids", "title,description", "وسائل تعليمية", "slug,title", (s) => `${ROOT}media/view/?s=${encodeURIComponent(s.slug)}`] }[l.type]; if (!T) continue;
      const or = (l.q || []).flatMap((q) => T[1].split(",").map((c) => `${c}.ilike.*${q.replace(/[(),*]/g, " ")}*`)).join(",");
      const j = await rest(`${T[0]}?status=eq.published&or=(${encodeURIComponent(or)})&select=${T[3]}&limit=3`);
      j.forEach((s) => out.push([T[2], s.title, T[4](s)]));
    } catch {}
  }
  return out;
}
function drawView(t) {
  TP = t; D.title = t.title + " | التجارب والمشاريع العلمية | منصة زاد التعليمية"; const bc = $("#abc"); if (bc) bc.textContent = t.title;
  const lv = new URLSearchParams(location.search).get("lv"); let r = lv ? tierOf(lv) : 0;
  if (!r) { try { r = +localStorage.getItem("zad-exp-tier") || 0; } catch {} }
  const ts = [...new Set((t.levels || []).map(tierOf))]; if (!ts.includes(r)) r = ts[0] || 2; TR = r; render(t);
}
function render(t) {
  const c = TOPICS[t.topic] || ["", "1f52c", "#f3eeff"], sens = t.kind === "sensory";
  const ts = [...new Set((t.levels || []).map(tierOf))].sort();
  let acts = sens ? [] : (t.acts || []).filter((a) => a.ts.includes(TR)); if (!sens && (t.steps || []).length >= 3) acts = acts.concat([{ k: "order", s: t.steps.map((s) => [s[0], s[1] || "i_notebook"]), ts: [1, 2, 3] }]);
  total = acts.length; done = 0; right = 0;
  const sf = t.safety || [], ad = ADULT[t.adult] || ADULT.near;
  const steps = t.steps || [];
  $("#aview").innerHTML = `<div class="hero" style="--bg:${c[2]}"><img src="${esc(icon(t.icon))}" alt=""><div><div class="mt"><span>${esc(KINDS[t.kind])}</span><span>${esc(c[0])}</span><span>${esc(lvText(t.levels))}</span></div><h1>${esc(t.title)}</h1><p>${esc(t.goal)}</p><div class="mt"><span>${DIFF[t.difficulty]}</span><span>⏱ ${AD(t.minutes)} دقيقة تقريبًا</span></div></div></div>
<section class="safe ${ad[1]}" id="safe" role="note"><h2>⚠️ السلامة أولًا</h2><p class="adl"><b>${esc(ad[0])}</b>${t.adult !== "none" ? " — لا ينفّذ الطفل هذا النشاط بمفرده." : ""}</p>${sens ? `<p class="adl"><b>هذا النشاط للكبير مع الطفل الصغير، والطفل يلاحظ ويستكشف بالنظر فقط ولا يتعامل مع أي أداة بمفرده.</b></p>` : ""}<ul>${sf.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
${ts.length > 1 ? `<div class="tiers" role="group" aria-label="مستوى الأنشطة"><b>مستوى الأسئلة:</b>${ts.map((k) => `<button type="button" class="zpill${TR === k ? " on" : ""}" data-t="${k}" aria-pressed="${TR === k}">${TIER[k]}</button>`).join("")}</div>` : ""}
<section class="art"><h2>ماذا سنتعلم؟</h2><ul class="lst">${(t.learn || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
<section class="art"><h2>الأدوات المطلوبة</h2><div class="mats">${(t.materials || []).map((m) => `<div><img src="${esc(icon(m[1]))}" alt=""><span>${esc(m[0])}</span></div>`).join("")}</div></section>
<section class="art"><h2>${sens ? "خطوات النشاط (يقوم بها الكبير)" : "خطوات الملاحظة والتطبيق"}</h2><ol class="stp">${steps.map((s, i) => `<li><span class="n">${AD(i + 1)}</span>${s[1] ? `<img src="${esc(icon(s[1]))}" alt="">` : ""}<p>${esc(s[0])}</p></li>`).join("")}</ol></section>
<section class="art"><h2>ماذا نتوقع أن نلاحظ؟</h2><p class="tx">${esc(t.expect)}</p></section>
<section class="art"><h2>ماذا حدث؟</h2><p class="tx">${esc(t.happened)}</p></section>
<section class="art"><h2>لماذا حدث ذلك؟</h2><p class="tx">${esc(t.why)}</p></section>
<section class="art"><h2>ماذا تعلمنا؟</h2><ul class="lst">${(t.learned || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></section>
<section class="art"><h2>سجل الملاحظات</h2><p class="tx">حمّل الورقة واطبعها لتسجّل: ماذا توقعت؟ ماذا لاحظت؟ ماذا تغيّر؟ ماذا تعلمت؟ ثم ارسم ما شاهدته.</p><p><a class="abtn go" id="sheet" href="${esc(SU(t.sheet_url))}" download>تحميل ورقة الملاحظات (PDF)</a> <a class="abtn" href="${esc(SU(t.sheet_url))}" target="_blank" rel="noopener">فتح للطباعة</a></p></section>
${sens ? "" : `<section class="art" id="acts"><h2>اختبر نفسك</h2><div class="score" id="score"></div>${acts.map((a, i) => act(a, i)).join("")}</section>
<section class="art"><h2>ارسم ولوّن ما شاهدته</h2><div class="cls">${["#6d28d9", "#e11d48", "#f59e0b", "#16a34a", "#0ea5e9", "#1b1430"].map((x, i) => `<button type="button" class="cl${i ? "" : " on"}" data-c="${x}" style="background:${x}" aria-label="لون ${i + 1}"></button>`).join("")}<button type="button" class="abtn" id="padx">مسح الرسم</button></div><canvas id="pad" width="640" height="360" aria-label="مساحة للرسم"></canvas></section>
<section class="art"><h2>ماذا تعلمت من التجربة؟</h2><textarea id="reflt" rows="3" placeholder="اكتب أو اطلب من الكبير أن يكتب ما تعلمته"></textarea><p class="hint">يُحفظ ما تكتبه على هذا الجهاز فقط.</p></section>`}
<section class="art lib" id="lib"></section>
<p class="note">${esc(t.review_note || "")}</p>
<p><a class="abtn" href="../">العودة إلى التجارب والمشاريع</a></p>`;
  if (!sens) { score(); wireActs(acts); pad(); refl(t); }
  lib(t);
}
async function lib(t) {
  const e = $("#lib"); if (!e) return;
  const g = {}; if (t.wiki_slug) g["من الموسوعة التعليمية"] = [["اقرأ الموضوع المرتبط بهذه التجربة", `${ROOT}wiki/view/?s=${encodeURIComponent(t.wiki_slug)}&lv=${TR === 1 ? "a4" : TR === 2 ? "a6" : "g3"}`]];
  const o = await libLinks(t); o.forEach(([k, l, u]) => (g[k] = g[k] || []).push([l, u]));
  const ks = Object.keys(g); if (!ks.length) { e.hidden = true; return; }
  e.innerHTML = `<h2>مواضيع مرتبطة</h2>` + ks.map((k) => `<h3>${esc(k)}</h3>` + g[k].map(([l, u]) => `<a href="${esc(u)}">${esc(l)}</a>`).join("")).join("");
}
async function boot() {
  if (IN_VIEW) {
    D.addEventListener("click", (e) => { const b = e.target.closest("[data-t]"); if (b && TP) { TR = +b.dataset.t; try { localStorage.setItem("zad-exp-tier", TR); } catch {} render(TP); } });
    const slug = new URLSearchParams(location.search).get("s"); const j = slug ? await load(slug) : [];
    if (j && j[0]) drawView(j[0]);
    else $("#aview").innerHTML = `<div class="sempty"><h3>${j === null ? "تعذّر تحميل التجربة" : "لم نجد هذه التجربة"}</h3><p>${j === null ? "تحقّق من الاتصال ثم أعد المحاولة." : "قد تكون غير منشورة أو الرابط غير صحيح."}</p><a class="abtn go" href="../">العودة إلى التجارب</a></div>`;
    return;
  }
  all = await load();
  if (!boot.i) { initList(); boot.i = 1; }
  drawList();
}
boot();
})();
