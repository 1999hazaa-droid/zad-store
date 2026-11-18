/* قصص زاد التعليمية: صفحة القصص الرئيسية (قراءة فقط من قاعدة البيانات) */
(function () {
"use strict";
const W = window, D = document;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const ROOT = new URL("../", location.href).href;
const TOPICS = { educational: "تربوية", teaching: "تعليمية", animals: "عن الحيوانات", adventure: "مغامرات", science: "علمية مبسطة", values: "قيم وأخلاق", thinking: "تنمية تفكير", arabic: "تعلّم العربية", english: "تعلّم الإنجليزية" };
const AGES = [["a3", "3 سنوات"], ["a4", "4 سنوات"], ["a5", "5 سنوات"], ["a6", "6 سنوات"]];
const GR = [["g1", "الأول"], ["g2", "الثاني"], ["g3", "الثالث"], ["g4", "الرابع"], ["g5", "الخامس"], ["g6", "السادس"]];
function ageText(lv) {
  const a = AGES.filter((x) => lv.includes(x[0])), g = GR.filter((x) => lv.includes(x[0]));
  const p = [];
  if (a.length) p.push(a.length > 1 ? a[0][1].replace(" سنوات", "") + "–" + a[a.length - 1][1] : a[0][1]);
  if (g.length) p.push("الصف " + (g.length > 1 ? g[0][1] + "–" + g[g.length - 1][1] : g[0][1]));
  return p.join(" · ");
}
W.ZS = { SB, KEY, TOPICS, AGES, GR, ageText, esc, ROOT, hdr: { apikey: KEY, Authorization: "Bearer " + KEY } };
const grid = $("#sres"); if (!grid) return;

const st = { q: "", age: "", gr: "", topic: "" };
let all = [];
const norm = (s) => String(s || "").replace(/[ً-ٰٟـ]/g, "").replace(/[إأآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").toLowerCase();
function card(s) {
  const cu = String(s.cover_url || ""), th = /^https?:/.test(cu) ? cu : ROOT + cu.replace("cover.webp", "thumb.webp");
  return `<a class="sc" href="read/?s=${encodeURIComponent(s.slug)}"><span class="cv"><img src="${esc(th)}" alt="غلاف قصة ${esc(s.title)}" loading="lazy" width="300" height="400"></span><span class="bd"><h3>${esc(s.title)}</h3><span class="ag">${esc(ageText(s.levels || []))}</span><span class="sbadge">${esc(TOPICS[s.topic] || "")}</span><span class="rd">اقرأ القصة</span></span></a>`;
}
function pill(k, v, on, label) { return `<button type="button" class="zpill${on ? " on" : ""}" data-k="${k}" data-v="${v}" aria-pressed="${on}">${esc(label)}</button>`; }
function filters() {
  $("#fage").innerHTML = "<b>العمر</b>" + AGES.map((x) => pill("age", x[0], st.age === x[0], x[1])).join("");
  $("#fgr").innerHTML = "<b>الصف</b>" + GR.map((x) => pill("gr", x[0], st.gr === x[0], "الصف " + x[1])).join("");
  $("#ftp").innerHTML = "<b>الموضوع</b>" + Object.keys(TOPICS).map((k) => pill("topic", k, st.topic === k, TOPICS[k])).join("");
  $("#sclr").hidden = !(st.q || st.age || st.gr || st.topic);
}
function render() {
  filters();
  const q = norm(st.q);
  const list = all.filter((s) => (!st.age || (s.levels || []).includes(st.age)) && (!st.gr || (s.levels || []).includes(st.gr)) && (!st.topic || s.topic === st.topic) && (!q || norm(s.title + " " + s.summary + " " + (TOPICS[s.topic] || "")).includes(q)));
  const filtered = st.q || st.age || st.gr || st.topic;
  $("#sstat").innerHTML = `<span>${all.length} قصص</span>`;
  if (!list.length) { grid.innerHTML = `<div class="sempty"><h3>لا توجد قصص بهذه الاختيارات</h3><p>جرّب تغيير العمر أو الصف أو الموضوع، أو اضغط «مسح الفلاتر».</p></div>`; return; }
  let h = "";
  if (filtered) h = `<section class="ssec"><h2>النتائج (${list.length})</h2><div class="sgrid">${list.map(card).join("")}</div></section>`;
  else {
    const newest = list.slice().sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) || a.sort_order - b.sort_order).slice(0, 6);
    h += `<section class="ssec"><h2>أحدث القصص</h2><div class="sgrid">${newest.map(card).join("")}</div></section>`;
    const pop = list.filter((s) => (s.reads || 0) > 0).sort((a, b) => b.reads - a.reads).slice(0, 6);
    if (pop.length) h += `<section class="ssec"><h2>الأكثر قراءة</h2><div class="sgrid">${pop.map(card).join("")}</div></section>`;
    if (list.length > 6) h += `<section class="ssec"><h2>كل القصص</h2><div class="sgrid">${list.slice().sort((a, b) => a.sort_order - b.sort_order).map(card).join("")}</div></section>`;
  }
  grid.innerHTML = h;
}
D.addEventListener("click", (e) => {
  const p = e.target.closest(".zpill[data-k]");
  if (p) { const k = p.dataset.k, v = p.dataset.v; st[k] = st[k] === v ? "" : v; render(); return; }
  if (e.target.closest("#sclr")) { st.q = st.age = st.gr = st.topic = ""; $("#sq").value = ""; $("#sqx").hidden = true; render(); }
  if (e.target.closest("#sqx")) { st.q = ""; $("#sq").value = ""; $("#sqx").hidden = true; render(); }
});
$("#sq").addEventListener("input", (e) => { st.q = e.target.value.trim(); $("#sqx").hidden = !st.q; render(); });
fetch(SB + "/rest/v1/stories?status=eq.published&select=slug,title,summary,topic,levels,cover_url,reads,sort_order,created_at&order=sort_order", { headers: W.ZS.hdr })
  .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
  .then((d) => { all = d; render(); })
  .catch(() => { grid.innerHTML = `<div class="sempty"><h3>تعذّر تحميل القصص</h3><p>تحقّق من الاتصال بالإنترنت ثم أعد فتح الصفحة.</p></div>`; });
})();
