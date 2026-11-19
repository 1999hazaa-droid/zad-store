/* الأدلة الإرشادية - زاد: قائمة + قارئ (قراءة وتحميل وطباعة) */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const IN_VIEW = /\/guides\/view\/?/.test(location.pathname);
const ROOT = new URL(IN_VIEW ? "../../" : "../", location.href).href;
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const U = (u) => /^https?:/.test(u || "") ? u : ROOT + String(u || "");
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
const AUD = { parent: ["أدلة أولياء الأمور", "أولياء الأمور", "1f468-1f469-1f467"], teacher: ["أدلة المعلمين", "المعلمون", "x_teacher"], child: ["أدلة الأطفال", "الأطفال", "1f9d2"] };
const KIND = { guide: "دليل", age: "دليل حسب العمر", section: "دليل قسم", template: "نموذج للطباعة" };
const LV = { a2: "سنة إلى سنتين", a3: "٣ سنوات", a4: "٤ سنوات", a5: "٥ سنوات", a6: "٦ سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const AGES = ["a2", "a3", "a4", "a5", "a6"], GRADES = ["g1", "g2", "g3", "g4"];
const CACHE = "zad-guides-v1";
const lvShort = (a) => { const l = a.levels || []; if (l.length >= 9) return "كل الأعمار والصفوف"; const ag = l.filter((x) => x[0] === "a"), gr = l.filter((x) => x[0] === "g"); const o = []; if (ag.length) o.push(ag.length > 1 ? `${AD(ag[0].slice(1))}–${AD(ag[ag.length - 1].slice(1))} سنوات` : LV[ag[0]]); if (gr.length) o.push(gr.length > 1 ? `الصفوف ${AD(gr[0].slice(1))}–${AD(gr[gr.length - 1].slice(1))}` : LV[gr[0]]); return o.join(" + "); };
const icon = (c) => `${ROOT}images/zad/${c}.webp`;
let all = [];
async function load(slug) {
  const sel = slug ? "*" : "slug,audience,kind,title,description,levels,topic,cover_url,pdf_url,sort_order,updated_at";
  const url = SB + "/rest/v1/guides?status=eq.published&order=sort_order.asc&select=" + sel + (slug ? "&slug=eq." + encodeURIComponent(slug) : "");
  try {
    const r = await fetch(url, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
    if (!r.ok) throw new Error(r.status);
    const j = await r.json(); if (!Array.isArray(j)) throw new Error("bad");
    if (!slug) { try { localStorage.setItem(CACHE, JSON.stringify(j)); } catch {} }
    return j;
  } catch {
    if (slug) return null;
    try { return JSON.parse(localStorage.getItem(CACHE)) || []; } catch { return []; }
  }
}
/* ===== القائمة ===== */
const F = { aud: "", stage: "", lv: "", kind: "", sub: "", q: "" };
const pill = (k, v, l) => `<button type="button" class="zpill${F[k] === v ? " on" : ""}" data-k="${k}" data-v="${esc(v)}" aria-pressed="${F[k] === v}">${esc(l)}</button>`;
function base(skip) {
  const q = norm(F.q).trim();
  return all.filter((a) => (skip === "aud" || !F.aud || a.audience === F.aud) && (skip === "stage" || !F.stage || (a.levels || []).some((x) => x[0] === (F.stage === "age" ? "a" : "g"))) && (skip === "lv" || !F.lv || (a.levels || []).includes(F.lv)) && (skip === "kind" || !F.kind || a.kind === F.kind) && (skip === "sub" || !F.sub || a.topic === F.sub) &&
    (!q || norm([a.title, a.description, a.topic, (AUD[a.audience] || [])[1], KIND[a.kind], lvShort(a)].join(" ")).includes(q)));
}
function card(a) {
  const lk = `view/?s=${encodeURIComponent(a.slug)}`;
  return `<article class="mc"><a class="im" href="${lk}" tabindex="-1" aria-hidden="true"><img src="${esc(U(a.cover_url))}" alt="" loading="lazy" width="440" height="330"></a>
<div class="bd"><h3>${esc(a.title)}</h3><div class="mt"><span class="k">${esc((AUD[a.audience] || ["", a.audience])[1])}</span><span>${esc(lvShort(a))}</span><span>${esc(KIND[a.kind] || "")}</span></div><p>${esc(a.description)}</p>
<div class="bt"><a class="abtn go" href="${lk}">فتح الدليل</a><a class="abtn" href="${esc(U(a.pdf_url))}" download>PDF</a></div></div></article>`;
}
function drawList() {
  const set = (id, h) => { const e = $(id); if (e) e.innerHTML = h; };
  const cnt = {}; base("aud").forEach((a) => (cnt[a.audience] = (cnt[a.audience] || 0) + 1));
  set("#mkinds", Object.keys(AUD).map((k) => { const n = cnt[k] || 0; return `<button type="button" class="mk${F.aud === k ? " on" : ""}" data-k="aud" data-v="${F.aud === k ? "" : k}" aria-pressed="${F.aud === k}"><img src="${icon(AUD[k][2])}" alt=""><span>${esc(AUD[k][0])}<small>${AD(n)} دليل</small></span></button>`; }).join(""));
  set("#fstage", "<b>المرحلة</b>" + pill("stage", "", "الكل") + pill("stage", "age", "الأعمار: ١–٦ سنوات") + pill("stage", "grade", "الصفوف: ١–٤"));
  const fl = $("#flv");
  if (fl) { fl.hidden = !F.stage; if (F.stage) fl.innerHTML = "<b>" + (F.stage === "age" ? "العمر" : "الصف") + "</b>" + pill("lv", "", "الكل") + (F.stage === "age" ? AGES : GRADES).map((k) => pill("lv", k, LV[k])).join(""); }
  set("#fkind", "<b>النوع</b>" + pill("kind", "", "الكل") + Object.keys(KIND).filter((k) => all.some((a) => a.kind === k)).map((k) => pill("kind", k, KIND[k])).join(""));
  const topics = [...new Set(all.map((a) => a.topic).filter(Boolean))];
  set("#fsub", "<b>الموضوع</b>" + pill("sub", "", "الكل") + topics.map((s) => pill("sub", s, s)).join(""));
  const r = base(), any = Object.values(F).some(Boolean);
  const c = $("#sclr"); if (c) c.hidden = !any;
  const st = $("#sstat"); if (st) st.innerHTML = `<span>${AD(all.length)} دليلًا</span><span>${AD(new Set(all.map((a) => a.audience)).size)} فئات</span>`;
  const lt = $("#glatest");
  if (lt) { const l = !any ? [...all].sort((x, y) => String(y.updated_at).localeCompare(String(x.updated_at))).slice(0, 6) : []; lt.hidden = !l.length; $("#gstrip").innerHTML = l.map(card).join(""); }
  $("#sres").innerHTML = !all.length ? `<div class="sempty"><h3>تعذّر تحميل الأدلة</h3><p>تحقّق من الاتصال ثم أعد المحاولة.</p><button class="abtn go" type="button" id="sretry">إعادة المحاولة</button></div>`
    : r.length ? `<p class="sfoot" style="margin:6px 0">${AD(r.length)} نتيجة</p><div class="mgrid">${r.map(card).join("")}</div>`
    : `<div class="sempty"><h3>لا توجد نتائج مطابقة</h3><p>جرّب إزالة بعض الفلاتر.</p></div>`;
}
function initList() {
  const p = new URLSearchParams(location.search);
  ["aud", "kind", "q"].forEach((k) => { if (p.get(k)) F[k] = p.get(k); });
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
/* ===== القارئ ===== */
function blk(b, hs) {
  switch (b.t) {
    case "h": { const id = "h" + hs.length; hs.push([id, b.x]); return `<h2 id="${id}">${esc(b.x)}</h2>`; }
    case "p": return `<p>${esc(b.x)}</p>`;
    case "steps": return (b.title ? `<h3>${esc(b.title)}</h3>` : "") + `<ol class="stp">${(b.items || []).map((s, i) => `<li><span class="n">${AD(i + 1)}</span>${s.ic ? `<img src="${icon(s.ic)}" alt="">` : ""}<div><b>${esc(s.h)}</b><span>${esc(s.x)}</span></div></li>`).join("")}</ol>`;
    case "tips": return `<div class="box tips"><h3>${esc(b.title || "نصائح")}</h3><ul>${(b.items || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    case "ex": return `<div class="box ex"><h3>${esc(b.title || "مثال تطبيقي")}</h3><p>${esc(b.x)}</p></div>`;
    case "table": return `<div class="tw"><table><thead><tr>${(b.head || []).map((h) => `<th>${esc(h)}</th>`).join("")}</tr></thead><tbody>${(b.rows || []).map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    case "img": return `<figure style="margin:12px 0;text-align:center"><img src="${esc(U(b.u))}" alt="${esc(b.cap || "")}" style="max-width:100%;border-radius:12px">${b.cap ? `<figcaption class="note">${esc(b.cap)}</figcaption>` : ""}</figure>`;
    case "form": {
      let h = `<div class="frm">${b.title ? `<h3>${esc(b.title)}</h3>` : ""}`;
      (b.fields || []).forEach((f) => (h += `<div class="ln"><span>${esc(f)}</span><i></i></div>`));
      (b.checks || []).forEach((c) => (h += `<div class="ck">${esc(c)}</div>`));
      if (b.grid) { const n = typeof b.grid.rows === "number" ? b.grid.rows : (b.grid.rows || []).length; h += `<div class="tw"><table><thead><tr>${b.grid.head.map((x) => `<th>${esc(x)}</th>`).join("")}</tr></thead><tbody>${Array.from({ length: n }, () => `<tr>${b.grid.head.map(() => "<td></td>").join("")}</tr>`).join("")}</tbody></table></div>`; }
      for (let i = 0; i < (b.lines || 0); i++) h += `<div class="ln"><i></i></div>`;
      return h + "</div>";
    }
  }
  return "";
}
function article(a) {
  const hs = [], k = (t, arr, cls) => arr && arr.length ? `<div class="box ${cls}"><h3>${t}</h3><ul>${arr.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : "";
  const body = (a.body || []).map((b) => blk(b, hs)).join("");
  const toc = hs.length > 2 ? `<nav class="toc" aria-label="جدول المحتويات"><h2>المحتويات</h2>${hs.map(([i, t]) => `<a href="#${i}">${esc(t)}</a>`).join("")}</nav>` : "";
  const art = `<article class="art">${k("أهداف الدليل", a.goals, "goals")}${a.intro ? `<h2 style="margin-top:6px">مقدمة</h2><p>${esc(a.intro)}</p>` : ""}${body}${k("ملخص أهم النقاط", a.summary, "sum")}</article>`;
  return { toc, art };
}
function drawView(a) {
  D.title = a.title + " | منصة زاد التعليمية"; const bc = $("#abc"); if (bc) bc.textContent = a.title;
  const { toc, art } = article(a);
  $("#aview").innerHTML = `<div class="vtop"><h1>${esc(a.title)}</h1><div class="mt"><span class="k">${esc((AUD[a.audience] || ["", a.audience])[1])}</span><span>${esc(lvShort(a))}</span><span>${esc(KIND[a.kind] || "")}</span>${a.topic ? `<span>${esc(a.topic)}</span>` : ""}</div><p>${esc(a.description)}</p></div>
<div class="tool"><a class="abtn go" href="${esc(U(a.pdf_url))}" download id="dl">تحميل PDF</a><button type="button" class="abtn" id="vprint">طباعة</button><a class="abtn" href="../">العودة إلى الأدلة</a></div>
<div class="rd">${toc}${art}</div>
<p class="note">${esc(a.review_note || "")}<br>محتوى أصلي من إعداد منصة زاد، غير منسوب إلى منهج أو كتاب مدرسي محدد.</p>`;
  const prt = D.createElement("div"); prt.id = "prt"; prt.innerHTML = `<h1 style="font:800 22pt var(--z-font)">${esc(a.title)}</h1>${art}`; D.body.appendChild(prt);
  const pb = $("#vprint"); if (pb) pb.addEventListener("click", () => W.print());
  if (new URLSearchParams(location.search).get("print") === "1") setTimeout(() => W.print(), 400);
}
async function boot() {
  if (IN_VIEW) {
    const slug = new URLSearchParams(location.search).get("s"); const j = slug ? await load(slug) : [];
    if (j && j[0]) drawView(j[0]);
    else $("#aview").innerHTML = `<div class="sempty"><h3>${j === null ? "تعذّر تحميل الدليل" : "لم نجد هذا الدليل"}</h3><p>${j === null ? "تحقّق من الاتصال ثم أعد المحاولة." : "قد يكون غير منشور أو الرابط غير صحيح."}</p><a class="abtn go" href="../">العودة إلى الأدلة</a></div>`;
    return;
  }
  all = await load();
  if (!boot.i) { initList(); boot.i = 1; }
  drawList();
}
boot();
})();
