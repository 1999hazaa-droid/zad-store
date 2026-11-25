/* محرك «ابحث في المكتبة» – زاد التعليمية.
   يبني فهرسًا من المحتوى المنشور فعلًا فقط: ملفات المكتبة (الظاهرة والمنشورة) + الأنشطة والقصص والدروس والاختبارات التفاعلية المنشورة + كتالوج الألعاب.
   النطاق: من سنة إلى 6 سنوات والصفوف 1–4 فقط. كل البحث والترتيب يتمّان على الجهاز، ولا يُرسل أي شيء عن الباحث. */
(function () {
"use strict";
const W = window, D = document;
const SCR = D.currentScript && D.currentScript.src ? D.currentScript.src : location.href;
const ROOT = new URL("../", SCR).href;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* ---------- التصنيفات ---------- */
const LV = [["a2", "سنة إلى سنتين"], ["a3", "3 سنوات"], ["a4", "4 سنوات"], ["a5", "5 سنوات"], ["a6", "6 سنوات"], ["g1", "الصف الأول"], ["g2", "الصف الثاني"], ["g3", "الصف الثالث"], ["g4", "الصف الرابع"]];
const LVN = Object.fromEntries(LV), LVK = LV.map((l) => l[0]);
const CT = { story: "قصص تعليمية", ws: "أوراق عمل", cards: "بطاقات تعليمية", home: "أنشطة منزلية", video: "دروس مرئية", game: "ألعاب تعليمية", quiz: "اختبارات", project: "مشروعات", res: "موارد تعليمية" };
const CTK = Object.keys(CT);
const SEC = { ws: "أوراق العمل", letters: "الحروف العربية", math: "الأرقام والرياضيات", color: "أنشطة التلوين", cards: "بطاقات تعليمية", stories: "القصص المصوّرة", home: "الأنشطة المنزلية", think: "التفكير والذكاء", review: "الاختبارات والمراجعات", extra: "الملفات الإثرائية", teacher: "أدوات المعلّمة" };
const KIND = { lib: "ملف قابل للطباعة", acts: "نشاط منزلي", bank: "نشاط تفاعلي", proj: "مشروع أو تحدٍّ", life: "درس مهارات حياتية", ready: "نشاط استعداد مدرسي", val: "درس قيم وسلوك", exp: "ثقافة عامة", vid: "درس مرئي", songs: "نشيد تعليمي", games: "لعبة تعليمية", stories: "قصة تعليمية", quiz: "اختبار قصير" };
const SRC_CT = { acts: "home", bank: "res", proj: "project", life: "res", ready: "res", val: "res", exp: "res", vid: "video", songs: "res", games: "game", stories: "story", quiz: "quiz" };
const URLS = { acts: (s) => `activities/view/?a=${s}`, bank: (s) => `bank/play/?s=${s}`, proj: (s) => `projects/play/?s=${s}`, life: (s) => `life/play/?s=${s}`, ready: (s) => `ready/play/?s=${s}`, val: (s) => `values/play/?s=${s}`, exp: (s) => `explore/play/?s=${s}`, vid: (s) => `videos/play/?s=${s}`, songs: (s) => `songs/play/?s=${s}`, stories: (s) => `stories/read/?s=${s}`, quiz: (s) => `quizzes/quiz/?q=${s}`, games: (s) => `games/#g=${s}` };
const TB = {
  acts: ["activities", "slug,title,skill,subject,cat,image_url,summary,ages,grades,created_at"], bank: ["bank_items", "slug,title,icon,skill,subject,cat,levels,created_at"],
  proj: ["proj_items", "slug,title,icon,skill,subject,cat,levels,created_at"], life: ["life_items", "slug,title,icon,cat,levels,created_at"], ready: ["ready_items", "slug,title,icon,cat,levels,created_at"],
  val: ["val_items", "slug,title,icon,cat,levels,created_at"], exp: ["exp_items", "slug,title,icon,cat,levels,created_at"], vid: ["video_items", "slug,title,icon,skill,subject,cat,poster_url,levels,created_at"],
  songs: ["song_items", "slug,title,icon,skill,cat,levels,created_at"], stories: ["stories", "slug,title,topic,cover_url,summary,levels,created_at"], quiz: ["qz_quizzes", "slug,title,icon,cat,skill,subject,levels,created_at"]
};
const CAT_DOM = { early: "thinking", lang: "arabic", hyg: "life" };
const SEC_DOM = { letters: "arabic", math: "math", color: "arts", think: "thinking" };
const SEC_CT = { ws: "ws", letters: "ws", math: "ws", color: "ws", cards: "cards", stories: "story", home: "home", think: "ws", review: "quiz", extra: "res", teacher: "res" };
const LIBTYPE_CT = { worksheet: "ws", cards: "cards", story: "story", home_activity: "home", printable_activity: "ws", summary: "res", review: "quiz" };

/* ---------- العربية: توحيد وجذع ---------- */
const DIG = "٠١٢٣٤٥٦٧٨٩";
function norm(s) {
  return String(s || "").normalize("NFC").toLowerCase().replace(/[ً-ْٰـ]/g, "")
    .replace(/[أإآٱ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").replace(/ؤ/g, "و").replace(/ئ/g, "ي")
    .replace(/[٠-٩]/g, (d) => DIG.indexOf(d)).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}
const IRR = {};
[["قصص", "قصه"], ["حروف", "حرف"], ["ألوان", "لون"], ["أرقام", "رقم"], ["أعداد", "عدد"], ["أشكال", "شكل"], ["أوراق", "ورقه"], ["ألعاب", "لعبه"], ["أنشطة", "نشاط"], ["دروس", "درس"], ["مشاريع", "مشروع"], ["مشروعات", "مشروع"], ["حيوانات", "حيوان"], ["كلمات", "كلمه"], ["حكايات", "حكايه"], ["بطاقات", "بطاقه"], ["اختبارات", "اختبار"], ["تمارين", "تمرين"], ["مهارات", "مهاره"], ["أسئلة", "سؤال"], ["أناشيد", "نشيد"], ["أطفال", "طفل"], ["قصة", "قصه"], ["فيديوهات", "فيديو"], ["مقاطع", "مقطع"], ["عمليات", "عمليه"], ["صور", "صوره"], ["نباتات", "نبات"]].forEach(([a, b]) => { IRR[norm(a)] = norm(b); });
const STOP = new Set(["من", "الي", "في", "عن", "علي", "مع", "او", "ما", "هل", "هذا", "هذه", "ذلك", "و", "ل", "ب", "ك", "عند", "كل", "لل", "الذي", "التي", "اريد", "ان", "يتعلم", "يتدرب"]);
function stem(t) {
  if (/^\d+$/.test(t)) return t;
  let w = t.replace(/^(?:وال|بال|كال|فال|لل)/, "ال");
  if (IRR[w]) w = IRR[w];
  else { if (w.length > 4 && w.startsWith("ال")) w = w.slice(2); if (IRR[w]) w = IRR[w]; }
  if (w.length > 4 && w.endsWith("ات")) w = w.slice(0, -2); else if (w.length > 5 && /(ون|ين|ان)$/.test(w)) w = w.slice(0, -2);
  if (w.length > 3 && w.endsWith("ه")) w = w.slice(0, -1);
  return w;
}
const toks = (s) => norm(s).split(" ").filter(Boolean);
const stems = (s) => toks(s).map(stem).filter((x) => x && (x.length > 1 || /\d/.test(x)));
const qstems = (s) => toks(s).filter((x) => !STOP.has(x)).map(stem).filter((x) => x && (x.length > 1 || /\d/.test(x)));
const SYN = [["قصه", "حكاي"], ["تدريب", "تمرين"], ["عد", "عدد", "رقم"], ["حرف", "هجاء", "هجايي"], ["فيديو", "مرئي"], ["اختبار", "امتحان"], ["لون", "تلوين"]].map((g) => g.map((x) => stem(norm(x))));
function lev(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) { const cur = [i]; let mn = i; for (let j = 1; j <= b.length; j++) { const v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); cur.push(v); if (v < mn) mn = v; } if (mn > max) return max + 1; prev = cur; }
  return prev[b.length];
}

/* ---------- الاتصال ---------- */
async function rest(path) { const r = await fetch(SB + "/rest/v1/" + path, { headers: H }); if (!r.ok) throw new Error("rest " + r.status); return r.json(); }
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const abs = (u) => { u = String(u || ""); return /^(https?:|data:)/i.test(u) ? u : ROOT + u.replace(/^\/+/, ""); };
const firstLine = (s, n) => { s = String(s || "").split("\n")[0].replace(/\s+/g, " ").trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…" : s; };

/* ---------- الفهرس ---------- */
const X = { items: [], vocab: new Set(), doms: [], syn: [], loaded: null, failed: [], usedN: 0, sugg: [] };
function lvOfActs(r) { const o = []; (r.ages || []).forEach((a) => { const n = +a; if (n <= 2 && n >= 1) o.push("a2"); else if (n >= 3 && n <= 6) o.push("a" + n); }); (r.grades || []).forEach((g) => { if (+g >= 1 && +g <= 4) o.push("g" + g); }); return [...new Set(o)]; }
function gameLevels(age) {
  const s = String(age || "").replace(/[٠-٩]/g, (d) => DIG.indexOf(d)), gi = { الأول: 1, الثاني: 2, الثالث: 3, الرابع: 4 };
  const gm = s.match(/الصف\s*(الأول|الثاني|الثالث|الرابع)(?:\s*[–-]\s*(الأول|الثاني|الثالث|الرابع))?/);
  if (gm) { const a = gi[gm[1]], b = gm[2] ? gi[gm[2]] : a, o = []; for (let k = a; k <= b; k++) o.push("g" + k); return o; }
  const m = s.match(/(\d+)\s*[–-]\s*(\d+)/); if (m) { const a = +m[1], b = +m[2], o = []; LVK.filter((l) => l[0] === "a").forEach((l) => { const k = +l[1]; if (l === "a2" ? a <= 2 && b >= 1 : k >= a && k <= b) o.push(l); }); return o; }
  return [];
}
function domOf(r) {
  const D_ = X.doms; if (!D_.length) return "other";
  if (r.catDom && D_.some((d) => d.slug === r.catDom)) return r.catDom;
  for (const d of D_) if ((d.d.skills || []).includes(r.skill)) return d.slug;
  for (const d of D_) { const s = d.d.src || []; if (s.includes(r.src) || (r.topic && s.includes(r.src + ":" + r.topic))) return d.slug; }
  if (/[a-z]{3}/i.test(r.skill || "")) { const e = D_.find((d) => d.slug === "english"); if (e) return e.slug; }
  for (const txt of [[r.skill, r.subject, r.cat].join(" "), r.title]) { const tk = String(txt || "").toLowerCase().split(/[^\p{L}]+/u).filter(Boolean).map((t) => t.replace(/^ال/, "")); if (!tk.length) continue; for (const d of D_) if ((d.d.words || []).some((w) => { const x = String(w).toLowerCase().replace(/^ال/, ""); return x && tk.some((t) => t.startsWith(x)); })) return d.slug; }
  return "other";
}
const domName = (s) => (X.doms.find((d) => d.slug === s) || { title: "متنوع" }).title;
function imgOf(x) {
  if (x.img) return abs(x.img);
  const c = x.icon; if (!c) return ROOT + (x.src === "games" ? "images/zad/i_trophy.webp" : "images/zad/i_puzzle.webp");
  if (/^https?:|^\//.test(c)) return c; return String(c).startsWith("dg_") ? `${ROOT}images/dig/${c}.svg` : String(c).startsWith("rd_") ? `${ROOT}images/ready/${c}.svg` : `${ROOT}images/zad/${c}.webp`;
}
function build(raw, ov) {
  const o = ov[raw.src + ":" + raw.slug] || {};
  let lv = (o.levels && o.levels.length ? o.levels : raw.levels || []).filter((l) => LVN[l]);
  lv = LVK.filter((l) => lv.includes(l));
  const it = { id: raw.id, key: raw.src + ":" + raw.slug, src: raw.src, slug: raw.slug, title: String(raw.title || "").trim(), lv, skill: [raw.skill, o.skills].filter(Boolean).join(" "), skillMain: raw.skill || "", subject: raw.subject || raw.lib_subject || "", desc: raw.desc || "", img: raw.img, icon: raw.icon, created: Date.parse(raw.created_at) || 0, uses: raw.uses || 0, price: raw.price || 0, section: raw.section || "", kw: [raw.kw, o.keywords].filter(Boolean).join(" "), printable: !!raw.printable, interactive: !!raw.interactive, preview: !!raw.preview, free: raw.free !== false, paid: !!raw.paid, url: raw.url, ageTxt: raw.ageTxt || "" };
  if (!it.title) return null;
  it.ct = o.ctype && CT[o.ctype] ? o.ctype : raw.ct;
  it.dom = o.domain || raw.dom || domOf({ src: raw.src, skill: it.skill, subject: it.subject, cat: raw.cat, catDom: raw.catDom, title: it.title, topic: raw.topic });
  if (!it.desc) it.desc = it.skill ? "المهارة: " + String(raw.skill || o.skills).split(" ").slice(0, 8).join(" ") : "";
  const f = { T: new Set(stems(it.title)), K: new Set(stems([it.skill, it.subject, it.kw, raw.topic].join(" "))), M: new Set(stems([domName(it.dom), CT[it.ct], KIND[raw.src], SEC[it.section] || "", it.paid ? "مدفوع" : "مجاني", it.printable ? "للطباعه قابل طباعه" : "", it.interactive ? "تفاعلي" : "", it.lv.map((l) => LVN[l]).join(" ")].join(" "))), D: new Set(stems(raw.descFull || it.desc)) };
  it.f = f; it.nt = " " + norm(it.title) + " "; it.hidden = !!o.hidden; it.ov = o; it.raw = raw;
  return it;
}
async function load() {
  if (X.loaded) return X.loaded;
  X.loaded = (async () => {
    const fails = [], ov = {}, raws = [];
    const safe = async (name, p, d) => { try { return await p; } catch (e) { fails.push(name); return d; } };
    const [cfg, ovs, syn, prods, stats, games] = await Promise.all([
      safe("domains", rest("rp_config?kind=eq.domain&order=sort_order.asc&select=slug,title,data"), []),
      safe("overrides", rest("search_overrides?select=*&limit=5000"), []),
      safe("synonyms", rest("search_synonyms?status=eq.on&select=term,alts&limit=500"), []),
      safe("library", rest("products?select=id,name,slug,price,image_url,thumb_url,description,file_url,lib_section,lib_levels,lib_subject,lib_skill,pages,file_type,created_at,is_available,lib_type,lib_unit,lib_keywords&is_visible=eq.true&lib_status=eq.published&lib_section=not.is.null&order=created_at.desc&limit=2000"), []),
      safe("stats", rest("lib_stats?select=product_id,uses&limit=5000"), []),
      safe("games", fetch(ROOT + "games/catalog.json").then((r) => { if (!r.ok) throw new Error("games"); return r.json(); }), [])
    ]);
    X.doms = cfg.map((r) => ({ slug: r.slug, title: r.title, d: r.data || {} }));
    ovs.forEach((o) => { ov[o.src + ":" + o.slug] = o; });
    X.syn = syn.map((s) => ({ t: qstems(s.term), alts: (s.alts || []).map((a) => qstems(a)).filter((a) => a.length) })).filter((s) => s.t.length && s.alts.length);
    const uses = {}; stats.forEach((r) => { uses[r.product_id] = r.uses || 0; });
    prods.forEach((p) => {
      if (!p.lib_section || !SEC[p.lib_section]) return;
      const free = Number(p.price) === 0 && !!p.file_url && !String(p.file_url).startsWith("private:");
      raws.push({ src: "lib", slug: p.slug || p.id, title: p.name, desc: firstLine(p.description, 110), descFull: p.description, skill: p.lib_skill, subject: p.lib_subject, kw: [p.lib_keywords, p.lib_unit].filter(Boolean).join(" "), levels: p.lib_levels || [], created_at: p.created_at, img: p.thumb_url || p.image_url, uses: uses[p.id] || 0, price: Number(p.price) || 0, free, paid: !free, section: p.lib_section, ct: LIBTYPE_CT[p.lib_type] || SEC_CT[p.lib_section] || "res", dom: SEC_DOM[p.lib_section] || null, printable: true, preview: true, interactive: false, url: `library/#f=${encodeURIComponent(p.slug || p.id)}`, id: p.id, unavailable: p.is_available === false });
    });
    await Promise.all(Object.entries(TB).map(async ([src, [tb, cols]]) => {
      const rows = await safe(src, rest(`${tb}?status=eq.published&select=${cols}&limit=1500`), []);
      rows.forEach((x) => raws.push({ src, slug: x.slug, title: x.title, desc: firstLine(x.summary, 110), descFull: x.summary, skill: x.skill, subject: x.subject, cat: x.cat, catDom: CAT_DOM[x.cat] || x.cat, topic: x.topic, icon: x.icon, img: src === "stories" ? x.cover_url : src === "acts" ? x.image_url : x.poster_url, levels: src === "acts" ? lvOfActs(x) : x.levels || [], created_at: x.created_at, ct: SRC_CT[src], interactive: true, free: true, url: URLS[src](encodeURIComponent(x.slug)) }));
    }));
    (Array.isArray(games) ? games : []).forEach((g) => { const lv = gameLevels(g.age); if (g.id && g.t && lv.length) raws.push({ src: "games", slug: g.id, title: g.t, desc: firstLine(g.s, 110), skill: g.skill, subject: g.subj, levels: lv, ct: "game", interactive: true, free: true, url: URLS.games(encodeURIComponent(g.id)), ageTxt: g.age, created_at: null }); });
    X.all = raws.map((r) => build(r, ov)).filter(Boolean);
    X.items = X.all.filter((i) => !i.hidden && i.lv.length);
    X.ovs = ov;
    X.vocab = new Set(); X.items.forEach((it) => ["T", "K", "M", "D"].forEach((k) => it.f[k].forEach((w) => X.vocab.add(w))));
    X.usedN = X.items.filter((i) => i.uses > 0).length;
    X.failed = fails.filter((f) => f !== "overrides" && f !== "synonyms" && f !== "stats");
    X.optFail = fails.filter((f) => f === "overrides" || f === "synonyms" || f === "stats");
    /* مصادر الاقتراحات: عناوين، مهارات، مجالات، أنواع، كلمات الإدارة */
    const sg = new Map(), add = (text, kind, rank) => { const t = String(text || "").trim(); if (t.length < 2) return; const k = norm(t); if (!k || sg.has(k)) return; sg.set(k, { text: t, kind, rank, n: k }); };
    X.doms.forEach((d) => { if (X.items.some((i) => i.dom === d.slug)) add(d.title, "مجال", 0); });
    CTK.forEach((c) => { if (X.items.some((i) => i.ct === c)) add(CT[c], "نوع", 0); });
    X.items.forEach((i) => add(i.skillMain, "مهارة", 1));
    X.items.forEach((i) => String(i.kw || "").split(/[،,\n]+/).forEach((w) => add(w, "كلمة", 2)));
    X.items.forEach((i) => add(i.title, "محتوى", 3));
    X.sugg = [...sg.values()];
    return X;
  })();
  return X.loaded;
}

/* ---------- البحث ---------- */
const FIELDS = [["T", 10, 6], ["K", 8, 5], ["M", 5, 3], ["D", 3, 2]];
function fieldScore(it, s) {
  let best = 0;
  for (const [k, ex, pre] of FIELDS) {
    const set = it.f[k]; if (set.has(s)) { if (ex > best) best = ex; continue; }
    if (s.length >= 4 && best < pre) for (const w of set) if (w.length - s.length <= 2 && w.startsWith(s)) { best = Math.max(best, pre); break; }
  }
  return best;
}
function fuzzyOf(s) {
  if (s.length < 4 || /\d/.test(s)) return [];
  const max = s.length >= 8 ? 2 : 1, out = []; let min = max + 1;
  for (const w of X.vocab) { if (w[0] !== s[0] || w === s) continue; const d = lev(s, w, max); if (d <= max) { if (d < min) { min = d; out.length = 0; } if (d === min) out.push(w); } }
  return out.slice(0, 4);
}
function groupsFor(q) {
  const base = qstems(q);
  if (!base.length) return { groups: [], text: "" };
  const nq = norm(q);
  const groups = base.map((s) => {
    const alts = [{ s, w: 1 }];
    SYN.forEach((g) => { if (g.includes(s)) g.forEach((x) => { if (x !== s) alts.push({ s: x, w: 0.7 }); }); });
    X.syn.forEach((sy) => { if (sy.t.length === 1 && sy.t[0] === s) sy.alts.forEach((a) => { if (a.length === 1) alts.push({ s: a[0], w: 0.7 }); }); });
    return { s, alts, num: /^\d+$/.test(s) };
  });
  return { groups, text: nq };
}
function scoreItem(it, G, fz) {
  let total = 0, matched = 0, req = 0;
  const hasText = G.groups.some((g) => !g.num);
  for (const g of G.groups) {
    let best = 0;
    for (const a of g.alts) { const sc = fieldScore(it, a.s) * a.w; if (sc > best) best = sc; }
    if (!best && fz[g.s]) for (const w of fz[g.s]) { const sc = fieldScore(it, w) * 0.5; if (sc > best) best = sc; }
    if (g.num && hasText) { if (best) { total += best; matched++; } continue; }
    req++; if (!best) return 0; total += best; matched++;
  }
  if (!req) return 0;
  if (G.text && it.nt.includes(" " + G.text + " ")) total += 8; else if (G.text && it.nt.includes(G.text)) total += 4;
  if (G.groups.every((g) => g.alts.some((a) => it.f.T.has(a.s)))) total += 6;
  return total;
}
function altQueries(q) { /* مرادفات متعددة الكلمات يضيفها المسؤول */
  const nq = " " + norm(q) + " "; const out = [];
  X.syn.forEach((sy) => { const t = sy.t.join(" "); if (sy.t.length > 1 && nq.includes(" " + t + " ")) sy.alts.forEach((a) => out.push(nq.replace(" " + t + " ", " " + a.join(" ") + " ").trim())); });
  return out;
}
function passes(it, F) {
  if (F.lv && F.lv.size && !it.lv.some((l) => F.lv.has(l))) return false;
  if (F.ct && F.ct.size && !F.ct.has(it.ct)) return false;
  if (F.dom && F.dom.size && !F.dom.has(it.dom)) return false;
  const av = F.av || new Set();
  if (av.has("free") !== av.has("paid") && (av.has("free") ? !it.free : !it.paid)) return false;
  if (av.has("preview") && !it.preview) return false;
  if (av.has("print") && !it.printable) return false;
  if (av.has("inter") && !it.interactive) return false;
  if (F.need && NEEDS[F.need] && !NEEDS[F.need].test(it)) return false;
  if (F.saved && !F.saved.has(it.key)) return false;
  return true;
}
const hasStem = (it, a) => a.some((s) => it.f.T.has(s) || it.f.K.has(s));
const NEEDS = {
  letters: { label: "أريد أن يتدرب على الحروف", test: (it) => hasStem(it, ["حرف", "هجاء"]) || it.section === "letters" },
  count: { label: "أريد أن يتعلم العد", test: (it) => hasStem(it, ["عد", "عدد", "رقم"]) },
  story: { label: "أريد قصة قصيرة", test: (it) => it.ct === "story" },
  home: { label: "أريد نشاطًا منزليًا", test: (it) => it.ct === "home" },
  print: { label: "أريد ورقة عمل للطباعة", test: (it) => it.ct === "ws" && it.printable },
  think: { label: "أريد نشاطًا لتنمية التفكير", test: (it) => it.dom === "thinking" }
};
/** بحث: يعيد [{it, score}] مرتّبة بحسب sort */
function search(q, F, sort, opt) {
  F = F || {}; q = String(q || "").trim();
  let list;
  if (!qstems(q).length) list = X.items.filter((it) => passes(it, F)).map((it) => ({ it, score: 0 }));
  else {
    const qs = [q].concat(altQueries(q)), best = new Map();
    qs.forEach((qq, qi) => {
      const G = groupsFor(qq), fz = {}; G.groups.forEach((g) => { if (!g.num && !X.vocab.has(g.s) && !g.alts.slice(1).some((a) => X.vocab.has(a.s))) fz[g.s] = fuzzyOf(g.s); });
      X.items.forEach((it) => { if (!passes(it, F)) return; const sc = scoreItem(it, G, fz) * (qi ? 0.8 : 1); if (sc > 0 && sc > (best.get(it) || 0)) best.set(it, sc); });
    });
    list = [...best.entries()].map(([it, score]) => ({ it, score }));
  }
  const title = (a, b) => a.it.title.localeCompare(b.it.title, "ar");
  const lvI = (r) => LVK.indexOf(r.it.lv[0]);
  const byNew = (a, b) => b.it.created - a.it.created || title(a, b);
  const S = {
    rel: (a, b) => b.score - a.score || byNew(a, b),
    new: byNew,
    pop: (a, b) => b.it.uses - a.it.uses || byNew(a, b),
    lv: (a, b) => lvI(a) - lvI(b) || b.score - a.score || title(a, b),
    ct: (a, b) => CTK.indexOf(a.it.ct) - CTK.indexOf(b.it.ct) || b.score - a.score || title(a, b)
  };
  list.sort(S[sort] || S.rel);
  return list;
}
function suggest(q, max) {
  const nq = norm(q); if (nq.length < 1) return [];
  const qt = nq.split(" ").filter(Boolean), out = [];
  X.sugg.forEach((s) => {
    let r = -1;
    if (s.n.startsWith(nq)) r = 0; else if (s.n.includes(" " + nq)) r = 1; else if (qt.length > 1 && qt.every((t) => s.n.includes(t))) r = 2; else if (nq.length >= 3 && s.n.includes(nq)) r = 3;
    else { const sq = stems(q), sn = stems(s.text); if (sq.length && sq.every((t) => sn.some((w) => w === t || (t.length >= 3 && w.startsWith(t))))) r = 2; }
    if (r >= 0) out.push({ s, r });
  });
  out.sort((a, b) => a.r - b.r || a.s.rank - b.s.rank || a.s.n.length - b.s.n.length);
  return out.slice(0, max || 6).map((x) => x.s);
}
/* تسجيل الكلمات التي لا نتيجة لها: نص قصير مُوحَّد فقط، دون أي معرّف أو بيانات عن الطفل */
function logZero(q) {
  try {
    const raw = String(q || ""); if (/@|https?:|www\.|\d{5,}/i.test(raw)) return false;
    const n = norm(raw); if (n.length < 2 || n.length > 40 || qstems(raw).length < 1) return false;
    const k = "zad-find-z:" + n; if (sessionStorage.getItem(k)) return false; sessionStorage.setItem(k, "1");
    fetch(SB + "/rest/v1/search_queries", { method: "POST", headers: Object.assign({ "Content-Type": "application/json", Prefer: "return=minimal" }, H), body: JSON.stringify({ q: n }) }).catch(() => {});
    return true;
  } catch (e) { return false; }
}

/* ---------- الاقتراحات أثناء الكتابة ---------- */
function typeahead(input, onPick) {
  const wrap = input.closest("[data-zf-wrap]") || input.parentNode; wrap.style.position = wrap.style.position || "relative";
  const box = D.createElement("ul"); box.className = "zf-sug"; box.id = "zfs" + Math.random().toString(36).slice(2, 6); box.setAttribute("role", "listbox"); box.hidden = true; wrap.appendChild(box);
  input.setAttribute("role", "combobox"); input.setAttribute("aria-expanded", "false"); input.setAttribute("aria-controls", box.id); input.setAttribute("aria-autocomplete", "list");
  let cur = -1, list = [], t = 0;
  const close = () => { box.hidden = true; input.setAttribute("aria-expanded", "false"); cur = -1; };
  const paint = () => { box.innerHTML = list.map((s, i) => `<li role="option" id="${box.id}-${i}" data-i="${i}" aria-selected="${i === cur}"><span>${esc(s.text)}</span><small>${esc(s.kind)}</small></li>`).join(""); };
  const show = async () => {
    const v = input.value.trim(); if (!v) return close();
    await load(); if (input.value.trim() !== v) return;
    list = suggest(v, 6); if (!list.length) return close(); cur = -1; paint(); box.hidden = false; input.setAttribute("aria-expanded", "true");
  };
  input.addEventListener("input", () => { clearTimeout(t); t = setTimeout(show, 120); });
  input.addEventListener("focus", () => { load(); });
  input.addEventListener("keydown", (e) => {
    if (box.hidden) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); cur = (cur + (e.key === "ArrowDown" ? 1 : -1) + list.length) % list.length; paint(); input.setAttribute("aria-activedescendant", box.id + "-" + cur); }
    else if (e.key === "Enter" && cur >= 0) { e.preventDefault(); const s = list[cur]; close(); onPick(s); }
    else if (e.key === "Escape") close();
  });
  box.addEventListener("mousedown", (e) => { const li = e.target.closest("li[data-i]"); if (!li) return; e.preventDefault(); const s = list[+li.dataset.i]; close(); onPick(s); });
  D.addEventListener("click", (e) => { if (!wrap.contains(e.target)) close(); });
  return { close };
}

/* ---------- مربع البحث المصغّر في صفحات المنصة ---------- */
const PH = "ابحث عن قصة، ورقة عمل، نشاط أو درس…";
function mountBoxes() {
  D.querySelectorAll("[data-zfind]").forEach((el) => {
    if (el.dataset.ready) return; el.dataset.ready = 1;
    el.innerHTML = `<form class="zfbox" role="search" action="${esc(ROOT + "find/")}" method="get" data-zf-wrap><label class="zfl" for="zfq${esc(el.dataset.zfind || "x")}"><span class="zfv">ابحث في المكتبة</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg></label><input id="zfq${esc(el.dataset.zfind || "x")}" name="q" type="search" autocomplete="off" enterkeyhint="search" maxlength="60" placeholder="${esc(PH)}"><button type="submit">بحث</button></form><p class="zfmore"><a href="${esc(ROOT + "find/")}">بحث متقدم بالفلاتر</a> · <a href="${esc(ROOT + "saved/")}">محتواي المحفوظ</a></p>`;
    const f = el.querySelector("form"), inp = el.querySelector("input");
    typeahead(inp, (s) => { inp.value = s.text; f.submit(); });
  });
}
if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", mountBoxes); else mountBoxes();
try { new MutationObserver(() => { if (D.querySelector("[data-zfind]:not([data-ready])")) mountBoxes(); }).observe(D.documentElement, { childList: true, subtree: true }); } catch (e) { /* */ }
const reset = () => { X.loaded = null; X.all = []; X.items = []; };
W.ZFIND = { reset, load, search, suggest, typeahead, logZero, norm, stem, qstems, X, LV, LVN, LVK, CT, CTK, KIND, NEEDS, ROOT, PH, esc, domName, imgOf, passes, rest, lget, mountBoxes };
})();
