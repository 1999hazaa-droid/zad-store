/* المكتبة التعليمية — منصة زاد التعليمية
   تقرأ الملفات من قاعدة البيانات مباشرة (للقراءة فقط)، والمفضلة والملفات الأخيرة تُحفظ على الجهاز فقط */
(function () {
"use strict";
const W = window, D = document;
const ROOT = new URL("../", location.href).href;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const $ = (s, r) => (r || D).querySelector(s);
const $$ = (s, r) => Array.from((r || D).querySelectorAll(s));
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const IMG = (n) => ROOT + "images/zad/" + n + ".webp";

/* ---------- التصنيفات ---------- */
const LV = [
  ["a2", "سنة إلى سنتين", "i_bottle", "سنة"], ["a3", "3 سنوات", "i_teddy", "3"], ["a4", "4 سنوات", "i_balloon", "4"],
  ["a5", "5 سنوات", "i_pencil", "5"], ["a6", "6 سنوات", "i_bag", "6"],
  ["g1", "الصف الأول", "i_n1", "الأول"], ["g2", "الصف الثاني", "i_n2", "الثاني"], ["g3", "الصف الثالث", "i_n3", "الثالث"], ["g4", "الصف الرابع", "i_n4", "الرابع"]
];
const LVI = Object.fromEntries(LV.map((l, i) => [l[0], i]));
const SEC = [
  ["ws", "أوراق العمل", "أنشطة وتمارين تعليمية متنوعة", "i_notebook"],
  ["letters", "الحروف العربية", "التعرّف على الحروف وكتابتها وتلوينها", "u_letters"],
  ["math", "الأرقام والرياضيات", "العدّ والجمع والطرح والعمليات", "u_nums"],
  ["color", "أنشطة التلوين", "رسومات كرتونية قابلة للطباعة", "i_palette"],
  ["cards", "بطاقات تعليمية", "حروف وأرقام وألوان وأشكال وحيوانات", "u_abc"],
  ["stories", "القصص المصوّرة", "قصص قصيرة مناسبة للأطفال", "i_book"],
  ["home", "الأنشطة المنزلية", "أنشطة تعليمية مع الأسرة", "i_home"],
  ["think", "التفكير والذكاء", "متاهات وألغاز ومطابقة وتصنيف", "i_brain"],
  ["review", "الاختبارات والمراجعات", "أوراق مراجعة وتدريبات حسب الصف", "i_ok"],
  ["extra", "الملفات الإثرائية", "أنشطة إضافية لتنمية المهارات", "i_rocket"],
  ["teacher", "أدوات المعلّمة", "ملفات ووسائل للفصل", "x_teacher"]
];
const SECI = Object.fromEntries(SEC.map((s) => [s[0], s]));
const NEW_DAYS = 14, NEW_MAX = 24;

/* ---------- تخزين على الجهاز فقط ---------- */
const store = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem("zad.lib." + k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("zad.lib." + k, JSON.stringify(v)); } catch (e) { /* وضع التصفح الخاص */ } }
};
/* المفضلة = المخزن الموحد «محتواي المحفوظ» (لكل طفل)؛ FAV قائمة معرّفات ملفات المكتبة المحفوظة مشتقة منه */
const SV = window.ZSAVED; let FAV = [], REC = store.get("recent", []);
if (!Array.isArray(REC)) REC = [];
const favKey = (p) => "lib:" + (p.slug || p.id);
const isFav = (p) => !!SV && SV.has(favKey(p));
function syncFav() { if (!SV || !S || !S.items) { FAV = []; return; } FAV = S.items.filter(isFav).sort((a, b) => (SV.get(favKey(b)).at || 0) - (SV.get(favKey(a)).at || 0)).map((p) => p.id); }
const favMeta = (p) => ({ key: favKey(p), title: p.name, ct: SV.libCt(p), dom: p.lib_subject || "", lv: p.lib_levels || [], img: p.thumb_url || p.image_url || "", paid: !isFree(p) });

const DIFF = { easy: "سهل", medium: "متوسط", hard: "متقدّم" };
const TYPES = { worksheet: "ورقة عمل", pdf: "ملف PDF", story: "قصة تعليمية", cards: "بطاقات تعليمية", home_activity: "نشاط منزلي", exercises: "تدريبات", review: "مراجعة دراسية", summary: "ملخص", teaching_aid: "وسيلة تعليمية", printable_activity: "نشاط قابل للطباعة" };
/* التصنيفات التي يديرها المسؤول: تعدّل الأسماء وتضيف أعمارًا وصفوفًا وأقسامًا جديدة، وتبقى الأساسية كما هي إن تعذّر التحميل */
function applyTax(rows) {
  if (!Array.isArray(rows) || !rows.length) return;
  const by = (k) => rows.filter((r) => r.kind === k).sort((a, b) => a.sort - b.sort);
  try {
    by("type").forEach((r) => { TYPES[r.key] = r.label; });
    const lv = LV.slice();
    [...by("age"), ...by("grade")].forEach((r) => { const i = lv.findIndex((x) => x[0] === r.key); if (i >= 0) lv[i] = [lv[i][0], r.label, lv[i][2], lv[i][3]]; else lv.push([r.key, r.label, "i_books", r.label.replace(/^الصف /, "")]); });
    const ages = lv.filter((x) => x[0][0] === "a"), grades = lv.filter((x) => x[0][0] === "g"), rest = lv.filter((x) => x[0][0] !== "a" && x[0][0] !== "g");
    const num = (x) => parseInt(x[0].slice(1), 10) || 0;
    LV.length = 0; ages.sort((a, b) => num(a) - num(b)).concat(grades.sort((a, b) => num(a) - num(b)), rest).forEach((x) => LV.push(x));
    Object.keys(LVI).forEach((k) => delete LVI[k]); LV.forEach((l, i) => { LVI[l[0]] = i; });
    by("section").forEach((r) => { const i = SEC.findIndex((x) => x[0] === r.key); if (i >= 0) SEC[i] = [SEC[i][0], r.label, SEC[i][2], SEC[i][3]]; else SEC.push([r.key, r.label, "ملفات " + r.label, "i_books"]); });
    Object.keys(SECI).forEach((k) => delete SECI[k]); SEC.forEach((x) => { SECI[x[0]] = x; });
  } catch (e) { console.warn("taxonomy", e); }
}
/* ---------- الحالة ---------- */
const S = { items: [], byId: new Map(), uses: {}, loaded: false, failed: false, lv: "", sec: "", subj: "", price: "", q: "", sort: "new", tab: "all", all: false };

/* ---------- الاتصال ---------- */
function api(path, opt) {
  opt = opt || {};
  const ctl = W.AbortController ? new AbortController() : null, t = ctl && setTimeout(() => ctl.abort(), opt.timeout || 12000);
  const h = { apikey: KEY, Accept: "application/json" };
  if (opt.body !== undefined) h["Content-Type"] = "application/json";
  return fetch(SB + "/rest/v1/" + path, { method: opt.method || "GET", headers: h, body: opt.body !== undefined ? JSON.stringify(opt.body) : undefined, signal: ctl ? ctl.signal : undefined })
    .then((r) => { if (t) clearTimeout(t); if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); })
    .then((x) => (x ? JSON.parse(x) : null));
}
const SEL = "id,name,slug,price,old_price,image_url,thumb_url,description,file_url,bw_url,lib_section,lib_levels,lib_subject,lib_skill,pages,file_type,created_at,is_available,lib_type,lib_unit,lib_keywords,lib_order,lib_difficulty";

/* ---------- أدوات ---------- */
function abs(u) { u = String(u || ""); return /^(https?:|data:)/i.test(u) ? u : ROOT + u.replace(/^\/+/, ""); }
function hashStr(e) { let t = 3735928559, n = 1103547991; const r = String(e || ""); for (let i = 0; i < r.length; i++) { const a = r.charCodeAt(i); t = Math.imul(t ^ a, 2654435761); n = Math.imul(n ^ a, 1597334677); } t = Math.imul(t ^ t >>> 16, 2246822507) ^ Math.imul(n ^ n >>> 13, 3266489909); n = Math.imul(n ^ n >>> 16, 2246822507) ^ Math.imul(t ^ t >>> 13, 3266489909); return (4294967296 * (2097151 & n) + (t >>> 0)).toString(36); }
function thumb(p) {
  if (p.thumb_url) return abs(p.thumb_url);
  const u = p.image_url || ""; if (!u) return IMG("i_notebook");
  const h = hashStr(u); if (W.ATHR_THUMBS && W.ATHR_THUMBS[h]) return ROOT + "images/t/" + h + ".webp";
  return abs(u);
}
const isFree = (p) => Number(p.price) === 0 && !!p.file_url && !String(p.file_url).startsWith("private:");
const isNew = (p) => !!p._new;
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";
const sameOrigin = (u) => { try { return new URL(u, location.href).origin === location.origin; } catch (e) { return false; } };
function norm(s) {
  return String(s || "").normalize("NFC").toLowerCase()
    .replace(/[ً-ٰٟـ]/g, "").replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
function lvSorted(p) { return (p.lib_levels || []).filter((x) => x in LVI).sort((a, b) => LVI[a] - LVI[b]); }
function lvLabel(p) {
  const l = lvSorted(p); if (!l.length) return "";
  if (l.length === 1) return LV[LVI[l[0]]][1];
  const a = LV[LVI[l[0]]], b = LV[LVI[l[l.length - 1]]], ag = (x) => x[0][0] === "a";
  if (ag(a) && ag(b)) return a[0] === "a2" ? "من سنة إلى " + b[1] : "من " + a[3] + " إلى " + b[1];
  if (!ag(a) && !ag(b)) return "من الصف " + a[3] + " إلى " + b[3];
  return "من " + a[1] + " إلى " + b[1];
}
function countTxt(n, adj) { n = Number(n) || 0; const a = adj || ""; if (n === 1) return "ملف واحد" + (a ? " " + a : ""); if (n === 2) return "ملفان" + (a ? " " + a + "ان" : ""); if (n >= 3 && n <= 10) return n + " ملفات" + (a ? " " + a + "ة" : ""); return n + " ملفًا" + (a ? " " + a + "ًا" : ""); }
function pagesTxt(n) { n = Number(n) || 0; if (!n) return ""; if (n === 1) return "صفحة واحدة"; if (n === 2) return "صفحتان"; if (n <= 10) return n + " صفحات"; return n + " صفحة"; }
function fname(p, bw) { return String(p.name || "ملف").replace(/[\\/:*?"<>|]+/g, " ").replace(/\s+/g, " ").trim() + (bw ? " - أبيض وأسود" : "") + ".pdf"; }
function fileUrl(p, bw) { return abs(bw && p.bw_url ? p.bw_url : p.file_url); }
function prodUrl(p) { return ROOT + "p/" + encodeURIComponent(p.slug || p.id) + "/"; }
let tt;
function toast(m) { $(".ltoast") && $(".ltoast").remove(); const e = D.createElement("div"); e.className = "ltoast"; e.setAttribute("role", "status"); e.textContent = m; D.body.appendChild(e); clearTimeout(tt); tt = setTimeout(() => e.remove(), 3200); }
const ICON = {
  eye: '<svg class="lsvg" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  dl: '<svg class="lsvg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>',
  pr: '<svg class="lsvg" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M7 14h10v7H7z"/></svg>',
  cart: '<svg class="lsvg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.4 11h10.2L20 8H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>'
};

/* ---------- البحث والتصفية ---------- */
function searchText(p) {
  if (p._s) return p._s;
  const sec = SECI[p.lib_section];
  const lv = lvSorted(p).map((x) => LV[LVI[x]][1] + " " + LV[LVI[x]][3]).join(" ");
  p._s = norm([p.name, p.description, p.lib_subject, p.lib_skill, p.lib_unit, p.lib_keywords, TYPES[p.lib_type] || "", DIFF[p.lib_difficulty] || "", sec ? sec[1] + " " + sec[2] : "", lv, isFree(p) ? "مجاني مجانا" : "مدفوع", p.file_type || "PDF"].join(" "));
  return p._s;
}
function matches(p, o) {
  o = o || S;
  if (o.lv && !(p.lib_levels || []).includes(o.lv)) return false;
  if (o.sec && p.lib_section !== o.sec) return false;
  if (o.subj && (p.lib_subject || "متنوع") !== o.subj) return false;
  if (o.price === "free" && !isFree(p)) return false;
  if (o.price === "paid" && isFree(p)) return false;
  if (o.q) { const t = searchText(p); if (!norm(o.q).split(" ").filter(Boolean).every((w) => t.includes(w))) return false; }
  return true;
}
const byDate = (a, b) => (Date.parse(b.created_at) || 0) - (Date.parse(a.created_at) || 0);
function sorted(list) {
  const nt = (p) => Date.parse(p.created_at) || 0;
  if (S.sort === "new") return list.slice().sort((a, b) => ((a.lib_order == null) - (b.lib_order == null)) * -1 || (a.lib_order == null ? 0 : a.lib_order - b.lib_order) || nt(b) - nt(a));
  if (S.sort === "pop") return list.slice().sort((a, b) => (S.uses[b.id] || 0) - (S.uses[a.id] || 0) || nt(b) - nt(a));
  return list.slice().sort((a, b) => nt(b) - nt(a));
}
const filtering = () => !!(S.lv || S.sec || S.subj || S.price || S.q || S.all);

/* ---------- عنوان الصفحة (حفظ الحالة في الرابط) ---------- */
function readHash() {
  const h = new URLSearchParams(location.hash.slice(1));
  S.lv = LVI[h.get("lv")] !== undefined ? h.get("lv") : "";
  S.sec = SECI[h.get("sec")] ? h.get("sec") : "";
  S.subj = h.get("sub") || ""; S.price = ["free", "paid"].includes(h.get("pr")) ? h.get("pr") : "";
  S.q = h.get("q") || ""; S.sort = h.get("s") === "pop" ? "pop" : "new";
  S.tab = ["fav", "recent"].includes(h.get("t")) ? h.get("t") : "all"; S.all = h.get("v") === "all";
  return h.get("f") || "";
}
function writeHash(push) {
  const h = new URLSearchParams();
  if (S.tab !== "all") h.set("t", S.tab);
  if (S.lv) h.set("lv", S.lv); if (S.sec) h.set("sec", S.sec); if (S.subj) h.set("sub", S.subj);
  if (S.price) h.set("pr", S.price); if (S.q) h.set("q", S.q); if (S.sort !== "new") h.set("s", S.sort); if (S.all) h.set("v", "all");
  if (PV.p) h.set("f", PV.p.slug || PV.p.id);
  const s = h.toString(), url = location.pathname + location.search + (s ? "#" + s : "");
  if (url === location.pathname + location.search + location.hash) return;
  try { history[push ? "pushState" : "replaceState"]({ lib: 1, pv: !!PV.p }, "", url); } catch (e) { /* */ }
}

/* ---------- عرض البطاقات ---------- */
function card(p, o) {
  o = o || {};
  const free = isFree(p), fav = isFav(p), sec = SECI[p.lib_section], pg = pagesTxt(p.pages), lv = lvLabel(p);
  const subj = [p.lib_subject, p.lib_skill].filter(Boolean).join(" · ");
  const badges = (isNew(p) ? '<span class="lnew">جديد</span>' : "") + (free ? '<span class="lfree">مجاني</span>' : `<span class="lprice">${esc(money(p.price))}</span>`);
  let act;
  if (free) act = `<div class="lact"><button type="button" class="lbt" data-a="pv">${ICON.eye}معاينة</button><button type="button" class="lbt pri" data-a="dl">${ICON.dl}تحميل</button><button type="button" class="lbt" data-a="pr">${ICON.pr}طباعة</button></div>`;
  else act = `<div class="lact two"><button type="button" class="lbt" data-a="pv">${ICON.eye}معاينة</button>${p.is_available === false ? '<button type="button" class="lbt ord" disabled>غير متاح حاليًا</button>' : `<a class="lbt ord" href="${esc(prodUrl(p))}" data-a="ord">${ICON.cart}اطلب الملف</a>`}</div>`;
  return `<article class="lc" data-id="${esc(p.id)}">
<button type="button" class="lth" data-a="pv" aria-label="معاينة ${esc(p.name)}"><img src="${esc(thumb(p))}" alt="" loading="lazy" decoding="async" width="420" height="525"><span class="lbg">${badges}</span>${pg ? `<span class="lpg">${esc(pg)}</span>` : ""}</button>
<button type="button" class="lfav" data-a="fav" aria-pressed="${fav}" title="${fav ? "تم الحفظ" : "حفظ"}" aria-label="${fav ? "إزالة من المفضلة (تم الحفظ)" : "حفظ في المفضلة"}: ${esc(p.name)}">${ICON.heart}</button>
<div class="lbd"><h3>${esc(p.name)}</h3>${p.description ? `<p class="lds">${esc(String(p.description).split("\n")[0])}</p>` : ""}
<div class="lmeta">${lv ? `<span>${esc(lv)}</span>` : ""}${o.skill && p.lib_skill ? `<span class="ls">${esc(p.lib_skill)}</span>` : p.lib_subject ? `<span class="ls" title="${esc(subj)}">${esc(p.lib_subject)}</span>` : sec ? `<span class="ls">${esc(sec[1])}</span>` : ""}</div>
<div class="lft"><b>${esc(p.file_type || "PDF")}</b>${DIFF[p.lib_difficulty] ? `<span class="ldf">${esc(DIFF[p.lib_difficulty])}</span>` : ""}${pg ? `<span>${esc(pg)}</span>` : ""}${free && p.bw_url ? "<span>ملوّن وأبيض وأسود</span>" : ""}</div>
</div>${act}</article>`;
}
const grid = (list, o) => `<div class="lgrid">${list.map((p) => card(p, o)).join("")}</div>`;
function empty(title, text, img, btn) {
  return `<div class="lempty"><img src="${IMG(img || "i_search")}" alt=""><h3>${esc(title)}</h3><p>${esc(text)}</p>${btn || ""}</div>`;
}

/* ---------- الصفحة الأولى ---------- */
function landing() {
  const items = S.items;
  const lvCount = (id) => items.filter((p) => (p.lib_levels || []).includes(id)).length;
  const secCount = (id) => items.filter((p) => p.lib_section === id).length;
  const fresh = items.filter(isNew).sort(byDate).slice(0, 6);
  const free = sorted(items.filter(isFree)).slice(0, 6);
  let h = `<section class="lsec"><h2>اختر العمر أو الصف</h2><p>داخل كل فئة تجد الملفات مرتّبة حسب المادة والمهارة.</p><div class="ltiles">`;
  LV.forEach((l) => { const n = lvCount(l[0]); if (n) h += `<button type="button" class="ltile" data-lv="${l[0]}"><img src="${IMG(l[2])}" alt="">${esc(l[1])}<small>${countTxt(n)}</small></button>`; });
  h += `</div></section><section class="lsec"><h2>أقسام المكتبة</h2><div class="ltiles w">`;
  SEC.forEach((s) => { const n = secCount(s[0]); if (n) h += `<button type="button" class="ltile" data-sec="${s[0]}"><img src="${IMG(s[3])}" alt=""><span>${esc(s[1])}</span><small>${esc(s[2])}</small><em>${countTxt(n)}</em></button>`; });
  h += `</div></section>`;
  const subs = new Map(); items.forEach((p) => { if (p.lib_subject && p.lib_subject !== "متنوع") subs.set(p.lib_subject, (subs.get(p.lib_subject) || 0) + 1); });
  if (subs.size) { h += `<section class="lsec"><h2>تصفّح حسب المادة</h2><div class="lsubs">`; Array.from(subs.entries()).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => { h += `<button type="button" class="zpill" data-subj="${esc(k)}">${esc(k)} <small>${n}</small></button>`; }); h += `</div></section>`; }
  const seen = new Set(FAV.concat(REC)), byId = S.byId;
  const lastP = REC.map((id) => byId.get(id)).find((p) => p && (p.lib_levels || []).length);
  if (lastP) {
    const lv0 = lastP.lib_levels[0];
    const sug = sorted(items.filter((p) => (p.lib_levels || []).includes(lv0) && !seen.has(p.id))).sort((a, b) => isFree(b) - isFree(a)).slice(0, 6);
    if (sug.length) h += `<section class="lsec"><h2><span>مقترحة لك</span></h2><p>بناءً على آخر ملف فتحته (${esc(LV[LVI[lv0]][1])}).</p>${grid(sug)}</section>`;
  }
  const pop = items.filter((p) => (S.uses[p.id] || 0) > 0).sort((a, b) => (S.uses[b.id] || 0) - (S.uses[a.id] || 0)).slice(0, 6);
  if (pop.length >= 3) h += `<section class="lsec"><h2><span>الأكثر استخدامًا</span><button type="button" data-more="pop">عرض الكل</button></h2>${grid(pop)}</section>`;
  if (fresh.length) h += `<section class="lsec"><h2><span>أحدث الإضافات</span><button type="button" data-more="new">عرض الكل</button></h2>${grid(fresh)}</section>`;
  if (free.length) h += `<section class="lsec"><h2><span>ملفات مجانية للتحميل الآن</span><button type="button" data-more="free">عرض الكل</button></h2>${grid(free)}</section>`;
  return h;
}

/* ---------- النتائج ---------- */
function summary() {
  const parts = [];
  if (S.lv) parts.push(LV[LVI[S.lv]][1]); if (S.sec) parts.push(SECI[S.sec][1]); if (S.subj) parts.push(S.subj);
  if (S.price) parts.push(S.price === "free" ? "المجاني" : "المدفوع"); if (S.q) parts.push("«" + S.q + "»");
  return parts.join(" · ");
}
function results() {
  const list = sorted(S.items.filter((p) => matches(p)));
  const sm = summary();
  let h = `<div class="lbar"><p><b>${esc(countTxt(list.length))}</b>${sm ? " · " + esc(sm) : ""}</p><button type="button" class="lclr" data-clear>مسح التصفية</button></div>`;
  if (!list.length) return h + empty("لا توجد ملفات بهذه الشروط", "جرّب كلمة أبسط، أو اختر عمرًا أو قسمًا آخر.", "i_search", '<button type="button" class="zbtn zb2" data-clear>عرض كل الملفات</button>');
  if (S.lv && !S.sec && !S.subj && !S.q) {
    const groups = new Map();
    list.forEach((p) => { const k = p.lib_subject || "متنوع"; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p); });
    const last = (k) => (k === "أدوات المعلّمة" ? 2 : k === "متنوع" ? 1 : 0);
    Array.from(groups.entries()).sort((a, b) => last(a[0]) - last(b[0]) || b[1].length - a[1].length).forEach(([k, l]) => {
      h += `<section class="lgroup"><h3>${esc(k)} <small>${l.length}</small></h3>${grid(l, { skill: true })}</section>`;
    });
    return h;
  }
  return h + grid(list);
}
function favView() {
  const list = FAV.map((id) => S.byId.get(id)).filter(Boolean);
  if (!list.length) return empty("لا توجد ملفات في المفضلة بعد", "اضغط على القلب في أي ملف ليُحفظ هنا. وكل ما حفظته من البحث والأنشطة تجده في «محتواي المحفوظ».", "i_heart", '<button type="button" class="zbtn zb2" data-tab="all">تصفّح المكتبة</button>');
  return `<div class="lbar"><p><b>${esc(countTxt(list.length))}</b> في المفضلة</p></div>` + grid(list);
}
function recentView() {
  const list = REC.map((r) => S.byId.get(r.id)).filter(Boolean);
  if (!list.length) return empty("لم تستخدم أي ملف بعد", "الملفات التي تعاينها أو تحمّلها أو تطبعها تظهر هنا للعودة إليها بسهولة.", "i_books", '<button type="button" class="zbtn zb2" data-tab="all">تصفّح المكتبة</button>');
  return `<div class="lbar"><p><b>${esc(countTxt(list.length))}</b> استخدمتها مؤخرًا</p><button type="button" class="lclr" data-clear-recent>مسح القائمة</button></div>` + grid(list);
}

/* ---------- التصفية (الأزرار) ---------- */
function renderFilters() {
  const pill = (attr, val, on, label, img) => `<button type="button" class="zpill${on ? " on" : ""}" data-${attr}="${val}" aria-pressed="${on}">${img ? `<img src="${IMG(img)}" alt="">` : ""}${esc(label)}</button>`;
  $("#flv").innerHTML = "<b>العمر</b>" + pill("lv", "", !S.lv, "الكل") + LV.filter((l) => S.items.some((p) => (p.lib_levels || []).includes(l[0]))).map((l) => pill("lv", l[0], S.lv === l[0], l[1], l[2])).join("");
  $("#fsec").innerHTML = "<b>القسم</b>" + pill("sec", "", !S.sec, "الكل") + SEC.filter((s) => S.items.some((p) => p.lib_section === s[0])).map((s) => pill("sec", s[0], S.sec === s[0], s[1], s[3])).join("");
  const subs = new Map();
  S.items.filter((p) => matches(p, { ...S, subj: "", q: "" })).forEach((p) => { const k = p.lib_subject || "متنوع"; subs.set(k, (subs.get(k) || 0) + 1); });
  if (S.subj && !subs.has(S.subj)) subs.set(S.subj, 0);
  $("#fsub").innerHTML = `<option value="">كل المواد</option>` + Array.from(subs.entries()).sort((a, b) => b[1] - a[1]).map(([k, n]) => `<option value="${esc(k)}"${k === S.subj ? " selected" : ""}>${esc(k)} (${n})</option>`).join("");
  $("#fpr").value = S.price; $("#fsort").value = S.sort;
  const on = $("#flv .on"), on2 = $("#fsec .on");
  [on, on2].forEach((b) => { if (b && b.dataset.lv !== "" && b.dataset.sec !== "") b.scrollIntoView({ block: "nearest", inline: "nearest" }); });
}
function renderTabs() {
  $$(".ltabs [data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === S.tab)));
  const nf = FAV.filter((id) => !S.loaded || S.byId.has(id)).length, nr = REC.filter((r) => !S.loaded || S.byId.has(r.id)).length;
  $("#lnfav").textContent = nf; $("#lnfav").hidden = !nf; $("#lnrec").textContent = nr; $("#lnrec").hidden = !nr;
  $("#lfl").hidden = S.tab !== "all";
}
function renderStats() {
  const n = S.items.length, f = S.items.filter(isFree).length, nw = S.items.filter(isNew).length;
  $("#lstats").innerHTML = `<span>${countTxt(n)}</span><span>${f} مجانًا</span>${nw ? `<span>${nw} جديدة</span>` : ""}<span>9 أعمار وصفوف</span>`;
}
function render(opts) {
  renderTabs();
  if (!S.loaded) return;
  const res = $("#lres");
  if (S.tab === "fav") res.innerHTML = favView();
  else if (S.tab === "recent") res.innerHTML = recentView();
  else { renderFilters(); res.innerHTML = filtering() ? results() : landing(); }
  if (opts && opts.top) { const t = $("#lmain").getBoundingClientRect().top + W.scrollY - 70; if (W.scrollY > t) W.scrollTo({ top: Math.max(0, t), behavior: "smooth" }); }
}
function setF(patch, top) { Object.assign(S, patch); writeHash(false); render({ top: top !== false }); }

/* ---------- الاستخدام: المفضلة والأخيرة والعدّاد ---------- */
function toggleFav(p, btn) {
  if (!SV) return btn;
  const r = SV.toggle(favMeta(p));
  if (!r.ok) { toast(r.msg); return btn; }
  const on = !!r.on; syncFav();
  $$(`.lc[data-id="${CSS.escape(p.id)}"] .lfav`).forEach((b) => { b.setAttribute("aria-pressed", String(on)); b.setAttribute("title", on ? "تم الحفظ" : "حفظ"); b.setAttribute("aria-label", (on ? "إزالة من المفضلة (تم الحفظ)" : "حفظ في المفضلة") + ": " + p.name); });
  toast(on ? "تم الحفظ في «محتواي المحفوظ»" : "أُزيل من المحفوظات");
  renderTabs();
  if (S.tab === "fav" && !on) render();
  return btn;
}
window.addEventListener("zad-saved", () => { if (!S.loaded) return; syncFav(); $$(".lc").forEach((c) => { const q = S.byId.get(c.dataset.id), b = q && c.querySelector(".lfav"); if (!b) return; const on = isFav(q); b.setAttribute("aria-pressed", String(on)); b.setAttribute("title", on ? "تم الحفظ" : "حفظ"); }); renderTabs(); if (S.tab === "fav") render(); });
function used(p, counted) {
  REC = [{ id: p.id, t: Date.now() }].concat(REC.filter((r) => r.id !== p.id)).slice(0, 24);
  store.set("recent", REC); renderTabs();
  if (counted && isFree(p)) {
    let done = {}; try { done = JSON.parse(sessionStorage.getItem("zad.lib.used") || "{}"); } catch (e) { done = {}; }
    if (!done[p.id]) {
      done[p.id] = 1; try { sessionStorage.setItem("zad.lib.used", JSON.stringify(done)); } catch (e) { /* */ }
      S.uses[p.id] = (S.uses[p.id] || 0) + 1;
      api("rpc/lib_use", { method: "POST", body: { pid: p.id }, timeout: 8000 }).catch(() => { /* العدّاد اختياري */ });
    }
  }
}

/* ---------- التحميل والطباعة ---------- */
const MOBILE = /iPad|iPhone|iPod|Android/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
/* سفاري لا يطبع ملف PDF داخل إطار مخفي بشكل موثوق، فنفتح الملف في نافذة جديدة */
const SAFARI = /^((?!chrome|chromium|crios|fxios|edg|android).)*safari/i.test(navigator.userAgent);
function doDownload(p, bw) {
  let u = fileUrl(p, bw);
  const a = D.createElement("a");
  if (sameOrigin(u)) a.download = fname(p, bw);
  else if (/\/storage\/v1\/object\/public\//.test(u)) u += (u.includes("?") ? "&" : "?") + "download=" + encodeURIComponent(fname(p, bw));
  else { a.target = "_blank"; a.rel = "noopener"; }
  a.href = u; D.body.appendChild(a); a.click(); a.remove();
  used(p, true);
  toast("بدأ تحميل الملف" + (bw ? " (أبيض وأسود)" : ""));
}
function doPrint(p, bw) {
  const u = fileUrl(p, bw);
  used(p, true);
  if (MOBILE || SAFARI || !sameOrigin(u)) {
    const w = W.open(u, "_blank");
    if (w) { try { w.opener = null; } catch (e) { /* */ } } else location.href = u;
    toast(MOBILE ? "افتح الملف ثم اختر «طباعة» من قائمة المشاركة أو الخيارات" : "فُتح الملف في نافذة جديدة، اختر منها «طباعة»");
    return;
  }
  let f = $("#lprint"); if (f) f.remove();
  f = D.createElement("iframe"); f.id = "lprint"; f.title = "طباعة الملف"; f.setAttribute("aria-hidden", "true"); f.tabIndex = -1;
  f.style.cssText = "position:fixed;right:0;bottom:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none";
  let fired = false;
  f.onload = () => { if (fired) return; fired = true; setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { W.open(u, "_blank"); } }, 400); };
  f.src = u; D.body.appendChild(f);
  toast("جاري تجهيز الطباعة…");
}
/* اختيار النسخة: ملوّنة أو أبيض وأسود */
let shFn = null, shBack = null;
function chooseVersion(p, kind, fn) {
  if (!p.bw_url) return fn(false);
  shFn = fn; shBack = D.activeElement;
  $("#lsht").textContent = kind === "pr" ? "طباعة: اختر النسخة" : "تحميل: اختر النسخة";
  $("#lshp").textContent = p.name;
  $("#lsho").innerHTML = `<button type="button" class="lopt" data-v="0"><img src="${IMG("i_palette")}" alt=""><span>النسخة الملوّنة<small>للطابعة الملوّنة أو المشاهدة على الشاشة</small></span></button>
<button type="button" class="lopt" data-v="1" style="margin-top:8px"><img class="bwi" src="${IMG("i_palette")}" alt=""><span>نسخة الأبيض والأسود<small>توفّر الحبر، ومناسبة للتلوين</small></span></button>`;
  $("#lsh").hidden = false; $("#lsho .lopt").focus();
}
function closeSheet() { $("#lsh").hidden = true; shFn = null; if (shBack && shBack.focus) shBack.focus(); }

/* ---------- المعاينة ---------- */
const PV = { p: null, list: [], i: 0, z: 1, mode: "pages", bw: false, back: null, seq: 0, pushed: false };
const MEDIA = new Map();
function loadMedia(p) {
  if (MEDIA.has(p.id)) return Promise.resolve(MEDIA.get(p.id));
  return api(`product_media?select=media_type,media_url,sort_order&product_id=eq.${encodeURIComponent(p.id)}&media_type=in.(page,image)&order=sort_order.asc`)
    .then((rows) => {
      rows = Array.isArray(rows) ? rows : [];
      const pages = rows.filter((r) => r.media_type === "page").map((r) => r.media_url);
      const m = pages.length ? { mode: "pages", list: pages } : { mode: "images", list: [p.image_url].concat(rows.filter((r) => r.media_type === "image").map((r) => r.media_url)).filter(Boolean) };
      MEDIA.set(p.id, m); return m;
    })
    .catch(() => ({ mode: "images", list: [p.image_url || p.thumb_url].filter(Boolean), offline: true }));
}
function openPreview(p, push) {
  try { if (p && window.ZRECENT) window.ZRECENT.touchLib(p.slug || p.id); } catch (e) { /* */ }
  if (!p) return;
  PV.back = D.activeElement; PV.p = p; PV.i = 0; PV.z = 1; PV.bw = false; PV.list = []; PV.mode = "images"; const seq = ++PV.seq;
  $("#lpvt").textContent = p.name;
  { const fb = $("#lfb"); if (fb) { fb.hidden = true; fb.onclick = null; const tryA = (n) => { if (window.ZFEEDBACK) window.ZFEEDBACK.attach(fb, "lib:" + (p.slug || p.id), p.name, () => seq === PV.seq); else if (n < 20) setTimeout(() => tryA(n + 1), 250); }; tryA(0); } }
  $("#lpvm").textContent = [lvLabel(p), SECI[p.lib_section] && SECI[p.lib_section][1], p.file_type || "PDF", pagesTxt(p.pages)].filter(Boolean).join(" · ");
  $("#limg").removeAttribute("src"); $("#lload").hidden = false; $("#lload").textContent = "جاري تحميل المعاينة…";
  $("#lpn").textContent = ""; $("#ldots").innerHTML = "";
  footer();
  $("#lpv").hidden = false; D.documentElement.classList.add("lpv-on");
  $("#lpvx").focus();
  if (push !== false) { writeHash(true); PV.pushed = true; } else PV.pushed = false;
  used(p, false);
  loadMedia(p).then((m) => {
    if (seq !== PV.seq) return;
    PV.mode = m.mode; PV.list = m.list.map(abs); footer();
    if (!PV.list.length) { $("#lload").textContent = "لا توجد صور معاينة لهذا الملف بعد."; return; }
    show(0);
  });
}
function footer() {
  const p = PV.p, f = $("#lpvf");
  if (isFree(p)) {
    f.innerHTML = (p.bw_url ? `<div class="lver"><span>النسخة:</span><div class="lseg" role="group" aria-label="النسخة"><button type="button" data-bw="0" aria-pressed="${!PV.bw}">ملوّنة</button><button type="button" data-bw="1" aria-pressed="${PV.bw}">أبيض وأسود</button></div></div>` : "")
      + `<div class="lpva"><button type="button" class="lbt pri" data-pa="dl">${ICON.dl}تحميل PDF</button><button type="button" class="lbt" data-pa="pr">${ICON.pr}طباعة</button></div>`
      + `<p class="lpvn">${PV.bw ? "معاينة تقريبية لنسخة الأبيض والأسود. " : ""}مقاس A4 بهوامش مناسبة للطباعة. للاستخدام الشخصي أو داخل الفصل.</p>`;
  } else {
    const ok = p.is_available !== false;
    f.innerHTML = `<div class="lpva paid"><span class="lpz">${esc(money(p.price))}${p.old_price && Number(p.old_price) > Number(p.price) ? `<s>${esc(money(p.old_price))}</s>` : ""}</span>${ok ? `<a class="lbt ord" href="${esc(prodUrl(p))}">${ICON.cart}اطلب الملف</a>` : '<button type="button" class="lbt ord" disabled>غير متاح حاليًا</button>'}</div>`
      + `<p class="lpvn">ملف مدفوع: ${PV.mode === "pages" ? "هذه صفحات مختارة من الملف" : "هذه صور توضيحية من محتوى الملف"}. تحصل على الملف كاملًا بعد إتمام الطلب.</p>`;
  }
}
function fit() {
  const img = $("#limg"), st = $("#lstage");
  if (!img.naturalWidth) return;
  const pad = 28, r = img.naturalWidth / img.naturalHeight;
  const fw = Math.max(80, Math.min(st.clientWidth - pad, (st.clientHeight - pad) * r));
  img.style.width = Math.round(fw * PV.z) + "px"; img.style.height = "auto";
  $("#lzv").textContent = Math.round(PV.z * 100) + "%";
  $("#lzo").disabled = PV.z <= 1; $("#lzi").disabled = PV.z >= 3;
}
function show(i) {
  const n = PV.list.length; if (!n) return;
  PV.i = Math.max(0, Math.min(n - 1, i));
  const img = $("#limg"), u = PV.list[PV.i], seq = PV.seq;
  $("#lload").hidden = false; $("#lload").textContent = "جاري تحميل الصفحة…";
  img.onload = () => { if (seq !== PV.seq) return; $("#lload").hidden = true; fit(); const nx = PV.list[PV.i + 1]; if (nx) { const pre = new Image(); pre.src = nx; } };
  img.onerror = () => { $("#lload").hidden = false; $("#lload").textContent = "تعذّر تحميل الصفحة. تأكد من الإنترنت."; };
  img.alt = (PV.mode === "pages" ? "صفحة " : "صورة ") + (PV.i + 1) + " من " + n + " — " + PV.p.name;
  img.classList.toggle("bw", PV.bw);
  img.src = u;
  $("#lstage").scrollTo(0, 0);
  $("#lpn").textContent = (PV.mode === "pages" ? "صفحة " : "صورة ") + (PV.i + 1) + " من " + n;
  $("#lprev").disabled = PV.i === 0; $("#lnext").disabled = PV.i >= n - 1;
  const dots = $("#ldots");
  if (dots.childElementCount !== n) dots.innerHTML = PV.list.map((_, k) => `<button type="button" data-pg="${k}" aria-label="${PV.mode === "pages" ? "صفحة" : "صورة"} ${k + 1}">${k + 1}</button>`).join("");
  $$("#ldots button").forEach((b, k) => b.setAttribute("aria-current", String(k === PV.i)));
  const cur = $("#ldots [aria-current='true']"); if (cur) cur.scrollIntoView({ block: "nearest", inline: "nearest" });
}
function zoom(d) { const L = [1, 1.5, 2, 3]; let k = L.indexOf(PV.z); k = Math.max(0, Math.min(L.length - 1, (k < 0 ? 0 : k) + d)); PV.z = L[k]; fit(); }
function closePreview(fromPop) {
  if (!PV.p) return;
  PV.p = null; PV.seq++;
  $("#lpv").hidden = true; D.documentElement.classList.remove("lpv-on");
  if (!fromPop) { if (PV.pushed) { PV.pushed = false; history.back(); } else writeHash(false); }
  if (PV.back && PV.back.focus && D.contains(PV.back)) PV.back.focus();
  if (S.tab === "recent") render();
}

/* ---------- الأحداث ---------- */
function itemOf(el) { const c = el.closest(".lc"); return c ? S.byId.get(c.dataset.id) : null; }
D.addEventListener("click", (e) => {
  const t = e.target;
  const a = t.closest("[data-a]");
  if (a && !a.closest("#lpv")) {
    const p = itemOf(a); if (!p) return;
    const k = a.dataset.a;
    if (k === "ord") { used(p, false); return; }
    e.preventDefault();
    if (k === "pv") openPreview(p);
    else if (k === "fav") toggleFav(p, a);
    else if (k === "dl") chooseVersion(p, "dl", (bw) => doDownload(p, bw));
    else if (k === "pr") chooseVersion(p, "pr", (bw) => doPrint(p, bw));
    return;
  }
  let b;
  if ((b = t.closest("[data-lv]")) && !b.closest("#lpv")) return setF({ lv: b.dataset.lv, all: false, subj: "" });
  if ((b = t.closest("[data-sec]"))) return setF({ sec: b.dataset.sec, all: false });
  if ((b = t.closest("[data-more]"))) return setF(b.dataset.more === "free" ? { price: "free", all: true } : b.dataset.more === "pop" ? { sort: "pop", all: true } : { sort: "new", all: true });
  if ((b = t.closest("[data-subj]"))) return setF({ subj: b.dataset.subj, all: false });
  if ((b = t.closest("[data-clear]"))) { $("#lq").value = ""; $("#lqx").hidden = true; return setF({ lv: "", sec: "", subj: "", price: "", q: "", all: false }); }
  if ((b = t.closest("[data-clear-recent]"))) { REC = []; store.set("recent", REC); toast("مُسحت القائمة"); return render(); }
  if ((b = t.closest("[data-tab]"))) return setF({ tab: b.dataset.tab });
  if ((b = t.closest("[data-pg]"))) return show(+b.dataset.pg);
  if ((b = t.closest("[data-bw]"))) { PV.bw = b.dataset.bw === "1"; footer(); $("#limg").classList.toggle("bw", PV.bw); return; }
  if ((b = t.closest("[data-pa]"))) { const p = PV.p; if (!p) return; return b.dataset.pa === "dl" ? doDownload(p, PV.bw) : doPrint(p, PV.bw); }
  if ((b = t.closest(".lopt"))) { const fn = shFn, bw = b.dataset.v === "1"; closeSheet(); if (fn) fn(bw); return; }
  if (t.closest("#lshx") || t.id === "lsh") return closeSheet();
  if (t.closest("#lpvx") || t.id === "lpv") return closePreview();
  if (t.closest("#lprev")) return show(PV.i - 1);
  if (t.closest("#lnext")) return show(PV.i + 1);
  if (t.closest("#lzi")) return zoom(1);
  if (t.closest("#lzo")) return zoom(-1);
});
$("#fsub").addEventListener("change", (e) => setF({ subj: e.target.value }));
$("#fpr").addEventListener("change", (e) => setF({ price: e.target.value }));
$("#fsort").addEventListener("change", (e) => setF({ sort: e.target.value }, false));
let qt;
$("#lq").addEventListener("input", (e) => { $("#lqx").hidden = !e.target.value; clearTimeout(qt); qt = setTimeout(() => setF({ q: e.target.value.trim(), tab: "all" }, false), 220); });
$("#lq").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); clearTimeout(qt); setF({ q: e.target.value.trim(), tab: "all" }); e.target.blur(); } });
$("#lqx").addEventListener("click", () => { $("#lq").value = ""; $("#lqx").hidden = true; setF({ q: "" }, false); $("#lq").focus(); });
D.addEventListener("keydown", (e) => {
  if (!$("#lsh").hidden && e.key === "Escape") return closeSheet();
  if (!PV.p) return;
  if (e.key === "Escape") closePreview();
  else if (e.key === "ArrowLeft") show(PV.i + 1);
  else if (e.key === "ArrowRight") show(PV.i - 1);
  else if (e.key === "+" || e.key === "=") zoom(1);
  else if (e.key === "-") zoom(-1);
  else if (e.key === "Tab") { const f = $$("#lpv button:not([disabled]), #lpv a[href]").filter((x) => x.offsetParent); if (!f.length) return; const first = f[0], last = f[f.length - 1]; if (e.shiftKey && D.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && D.activeElement === last) { e.preventDefault(); first.focus(); } }
});
(function swipe() {
  const st = $("#lstage"); let x0 = null, y0 = 0, n = 0;
  st.addEventListener("touchstart", (e) => { n = e.touches.length; if (n !== 1 || PV.z !== 1) { x0 = null; return; } x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  st.addEventListener("touchend", (e) => { if (x0 === null || n !== 1) return; const t = e.changedTouches[0], dx = t.clientX - x0, dy = t.clientY - y0; x0 = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.4) show(PV.i + (dx > 0 ? 1 : -1)); }, { passive: true });
  st.addEventListener("dblclick", () => { PV.z = PV.z > 1 ? 1 : 2; fit(); });
})();
W.addEventListener("resize", () => { if (PV.p) fit(); });
W.addEventListener("popstate", () => {
  const f = readHash();
  $("#lq").value = S.q; $("#lqx").hidden = !S.q;
  if (PV.p && !f) closePreview(true);
  else if (f && (!PV.p || (PV.p.slug !== f && PV.p.id !== f))) openPreview(findSlug(f), false);
  render();
});
function findSlug(f) { let x = f; try { x = decodeURIComponent(f); } catch (e) { /* */ } x = x.normalize("NFC"); return S.items.find((p) => (p.slug || "").normalize("NFC") === x || p.id === x) || null; }

/* ---------- التحميل الأول ---------- */
function setItems(rows, uses) {
  const list = (rows || []).filter((p) => p && p.lib_section && SECI[p.lib_section]);
  const nt = (p) => Date.parse(p.created_at) || 0;
  list.slice().sort((a, b) => nt(b) - nt(a)).forEach((p, i) => { p._new = i < NEW_MAX && Date.now() - nt(p) < NEW_DAYS * 864e5; });
  S.items = list; S.byId = new Map(list.map((p) => [p.id, p]));
  if (uses) S.uses = uses;
  S.loaded = true; S.failed = false;
  if (SV) { SV.migrate(list.map((p) => Object.assign({ id: p.id, key: favKey(p) }, favMeta(p)))); syncFav(); }
  renderStats();
}
function boot() {
  const f = readHash();
  $("#lq").value = S.q; $("#lqx").hidden = !S.q;
  const cache = store.get("cache", null);
  applyTax(store.get("tax", null));
  if (cache && Array.isArray(cache.p) && Date.now() - (cache.t || 0) < 7 * 864e5) { setItems(cache.p, cache.u || {}); render(); }
  else renderTabs();
  Promise.all([
    api(`products?select=${SEL}&is_visible=eq.true&lib_section=not.is.null&order=created_at.desc`),
    api("lib_stats?select=product_id,uses").catch(() => []),
    api("lib_taxonomy?select=kind,key,label,sort&kind=in.(age,grade,section,type)&order=sort.asc").catch(() => [])
  ]).then(([rows, st, tax]) => {
    applyTax(tax); store.set("tax", tax);
    const uses = {}; (st || []).forEach((r) => { uses[r.product_id] = r.uses || 0; });
    const fresh = JSON.stringify(rows), old = cache && JSON.stringify(cache.p);
    store.set("cache", { t: Date.now(), p: rows, u: uses });
    const first = !S.loaded;
    setItems(rows, uses);
    if (first || fresh !== old) render();
    if (f && !PV.p) openPreview(findSlug(f), false);
  }).catch((err) => {
    console.warn("Library load:", err);
    if (S.loaded) { if (f && !PV.p) openPreview(findSlug(f), false); return; }
    S.failed = true;
    $("#lstats").innerHTML = "<span>تعذّر التحميل</span>";
    $("#lres").innerHTML = empty("تعذّر تحميل المكتبة", "تأكد من اتصالك بالإنترنت ثم أعد المحاولة.", "i_cloud", '<button type="button" class="zbtn zb2" onclick="location.reload()">إعادة المحاولة</button>');
  });
  if (S.loaded && f) openPreview(findSlug(f), false);
}
boot();
})();
