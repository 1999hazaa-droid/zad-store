/* الحزم التعليمية الجاهزة – المحرك المشترك: تحميل الحزم، تقدّم الطفل، الحزم المفضلة، وشريط التنقل بين موارد الحزمة.
   النطاق: من سنة إلى 6 سنوات والصفوف 1–4 فقط. التقدّم محفوظ على جهاز الطفل (مفتاح zad-packs-v1) ولا يُرسل منه شيء؛
   الشيء الوحيد المُرسل عدّاد بدء مجهول (pack_start) مرة واحدة لكل طفل على الجهاز، دون أي معرّف. */
(function (W) {
"use strict";
const D = W.document;
const SCR = D.currentScript && D.currentScript.src ? D.currentScript.src : location.href;
const ROOT = new URL("../", SCR).href;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const H = { apikey: KEY, Authorization: "Bearer " + KEY };
const PK = "zad-packs-v1", LK = "zad-learn-v3";
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const lset = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const SLUG = /^[a-z0-9-]{3,60}$/;
/* موارد يمكن معرفة إكمالها فعلًا من سجل الطفل (نفس ما يعرفه «تابع من حيث توقفت»)؛ غيرها يُعدّ «فُتح» فقط */
const TRACK = new Set(["acts", "bank", "proj", "vid", "songs", "life", "ready", "val", "exp", "stories", "quiz"]);
const PLAN_SRC = new Set(["acts", "bank", "proj", "life", "ready", "val", "vid", "songs", "stories", "quiz"]);
const MAXP = 100, MAXF = 100;

/* ---------- المتجر المحلي (لكل طفل) ---------- */
const kidId = () => { const d = lget(LK, null); if (d && d.kids && Object.keys(d.kids).length) return d.kids[d.cur] ? d.cur : Object.keys(d.kids)[0]; return "k1"; };
function db() { const d = lget(PK, null); return d && d.v === 1 && d.kids && typeof d.kids === "object" ? d : { v: 1, kids: {} }; }
function me(d) { d = d || db(); const k = kidId(); if (!d.kids[k]) d.kids[k] = { p: {}, started: {} }; if (!d.kids[k].p) d.kids[k].p = {}; if (!d.kids[k].started) d.kids[k].started = {}; return d.kids[k]; }
function mut(fn) { const d = db(), m = me(d); fn(m); lset(PK, d); try { W.dispatchEvent(new CustomEvent("zad-packs")); } catch (e) { /* */ } }
const rec = (slug) => me().p[slug] || null;
/** يسجّل أن الطفل فتح موردًا من الحزمة (فتح فقط، وليس إكمالًا) */
function markOpened(slug, key) {
  if (!SLUG.test(slug) || !/^[a-z]{2,8}:[^\s<>@]{1,100}$/.test(key)) return;
  mut((m) => {
    if (!m.p[slug] && Object.keys(m.p).length >= MAXP) { const old = Object.keys(m.p).sort((a, b) => (m.p[a].la || 0) - (m.p[b].la || 0))[0]; delete m.p[old]; }
    const r = m.p[slug] = m.p[slug] || { st: Date.now(), la: 0, o: {} }; r.la = Date.now(); r.o[key] = Date.now();
  });
  countStart(slug);
}
/** عدّاد بدء مجهول: مرة واحدة لكل طفل على الجهاز، بلا أي معرّف */
function countStart(slug) {
  const m = me(); if (m.started[slug]) return;
  mut((x) => { x.started[slug] = 1; });
  try { fetch(SB + "/rest/v1/rpc/pack_start", { method: "POST", headers: Object.assign({ "Content-Type": "application/json" }, H), body: JSON.stringify({ p_slug: slug }), keepalive: true }).catch(() => {}); } catch (e) { /* */ }
}
const clearProgress = (slug) => mut((m) => { delete m.p[slug]; });

/* ---------- البيانات ---------- */
async function rest(path) { const r = await fetch(SB + "/rest/v1/" + path, { headers: H }); if (!r.ok) throw new Error("rest " + r.status); return r.json(); }
let LOADED = null;
function load() {
  if (LOADED) return LOADED;
  LOADED = (async () => {
    const [ps, its] = await Promise.all([rest("packs?status=eq.published&select=slug,title,summary,cover,levels,dom,skills,est_min,sort_order,starts,created_at&order=sort_order.asc&limit=500"), rest("pack_items?select=pack_id,key,pos,packs!inner(slug)&packs.status=eq.published&order=pos.asc&limit=5000")]);
    const by = {}; ps.forEach((p) => { p.keys = []; by[p.slug] = p; });
    its.forEach((i) => { const p = by[i.packs && i.packs.slug]; if (p) p.keys.push(i.key); });
    return ps;
  })();
  LOADED.catch(() => { LOADED = null; });
  return LOADED;
}
const reset = () => { LOADED = null; };

/** يطابق مفاتيح الحزمة مع المحتوى المنشور الحالي: غير المنشور أو غير المناسب للمستوى لا يظهر */
function resolve(pack, Z) {
  const X = Z.X, by = new Map(X.all.map((i) => [i.key, i]));
  const items = [], missing = [];
  pack.keys.forEach((k) => {
    const it = by.get(k), src = k.split(":")[0], failed = X.failed.includes(src === "lib" ? "library" : src);
    if (it && !it.hidden && it.lv.length && it.lv.some((l) => pack.levels.includes(l))) items.push(it); else missing.push({ key: k, unknown: !it && failed });
  });
  return { items, missing, unknown: missing.some((m) => m.unknown) };
}
const MIN_READY = 3;
/** الحزمة «جاهزة» فقط إذا بقي فيها 3 موارد صالحة على الأقل وكانت كل موارد الحزمة قابلة للتحقق */
function ready(pack, Z) { const r = resolve(pack, Z); return r.items.length >= MIN_READY; }
function access(items) {
  const paid = items.filter((i) => i.paid).length;
  return paid === 0 ? { k: "free", t: "مجانية", paid: 0 } : paid === items.length ? { k: "paid", t: "مدفوعة", paid } : { k: "mixed", t: "تتضمن موارد مدفوعة", paid };
}
/** رابط المورد داخل الحزمة؛ pk وpi يُظهران شريط التنقل بين الموارد */
function itemUrl(it, slug, idx) {
  const u = String(it.url || ""), q = "pk=" + encodeURIComponent(slug) + "&pi=" + idx, h = u.indexOf("#"), base = h >= 0 ? u.slice(0, h) : u, hash = h >= 0 ? u.slice(h) : "";
  return ROOT + base + (base.indexOf("?") >= 0 ? "&" : "?") + q + hash;
}

/* ---------- التقدّم ---------- */
function statusOf(it, rec_) {
  let s = "new";
  if (rec_ && rec_.o && rec_.o[it.key]) s = "opened";
  const R = W.ZRECENT; if (R && TRACK.has(it.src)) { const x = R.status(it.key); if (x === "done") s = "done"; else if (x === "started") s = "started"; /* «opened» من ZRECENT هو الوضع الافتراضي لا دليل فتح، فلا يُعتمد */ }
  return s;
}
/** تقدّم حقيقي: المفتوح والمكتمل (من الموارد القابلة للتتبع فقط) والمتبقي؛ لا نسبة إن لم يوجد مورد قابل للتتبع */
function progress(slug, items) {
  const r = rec(slug), st = items.map((it) => statusOf(it, r));
  const opened = st.filter((s) => s !== "new").length, tr = items.map((it, i) => (TRACK.has(it.src) ? i : -1)).filter((i) => i >= 0);
  const done = tr.filter((i) => st[i] === "done").length;
  /* المورد التالي: أول مورد لم يُفتح ولم يُكتمل، ولا يُعرض إلا بعد أن فتح الطفل موردًا فعلًا */
  let next = -1; if (opened > 0) next = st.findIndex((s) => s === "new" || s === "started");
  if (opened > 0 && next < 0) next = -1;
  return { st, total: items.length, opened, trackable: tr.length, done, left: items.length - opened, pct: tr.length ? Math.round((done / tr.length) * 100) : null, last: r ? r.la : 0, next, startedAt: r ? r.st : 0 };
}

/* ---------- المفضلة (عبر «محتواي المحفوظ») ---------- */
const favKey = (slug) => "pack:" + slug;
const isFav = (slug) => !!(W.ZSAVED && W.ZSAVED.has(favKey(slug)));
function toggleFav(p, img) { const S = W.ZSAVED; if (!S) return { ok: false, msg: "تعذّر الحفظ الآن." }; return S.toggle({ key: favKey(p.slug), title: p.title, ct: "pack", dom: p.dom, lv: p.levels, img, paid: false }); }

/* ---------- شريط التنقل داخل الحزمة (يظهر في صفحات الموارد عند وجود pk وpi) ---------- */
async function bar() {
  const q = new URLSearchParams(location.search), slug = q.get("pk"), pi = parseInt(q.get("pi"), 10);
  if (!slug || !SLUG.test(slug) || !(pi >= 1 && pi <= 60)) return;
  let packs, Z;
  try { packs = await load(); } catch (e) { return; }
  const p = packs.find((x) => x.slug === slug); if (!p) return;
  const R = W.ZRECENT; try { Z = R ? await R.needZ() : W.ZFIND; } catch (e) { Z = W.ZFIND; } if (!Z || !Z.X || !Z.X.all) return;
  const { items } = resolve(p, Z), key = p.keys[pi - 1];
  const idx = items.findIndex((i) => i.key === key); if (idx < 0) return;
  markOpened(slug, key);
  const prev = items[idx - 1], next = items[idx + 1], pos = (it) => p.keys.indexOf(it.key) + 1;
  const link = (it, label, cls) => it ? `<a class="${cls}" href="${esc(itemUrl(it, slug, pos(it)))}" aria-label="${label}: ${esc(it.title)}">${label}</a>` : `<span class="${cls} dis" aria-disabled="true">${label}</span>`;
  const el = D.createElement("nav"); el.className = "zpk-bar"; el.setAttribute("aria-label", "التنقل داخل الحزمة"); el.dir = "rtl";
  el.innerHTML = `<div class="zpk-t"><b>${esc(p.title)}</b><span>المورد ${AD(idx + 1)} من ${AD(items.length)}</span></div><div class="zpk-b">${link(prev, "المورد السابق", "zpk-p")}${link(next, "المورد التالي", "zpk-n")}<a class="zpk-h" href="${ROOT}packs/view/?p=${encodeURIComponent(slug)}">العودة إلى الحزمة</a><a class="zpk-l" href="${ROOT}library/">العودة إلى المكتبة</a></div>`;
  if (!D.getElementById("zpk-css")) { const l = D.createElement("link"); l.id = "zpk-css"; l.rel = "stylesheet"; l.href = ROOT + "packs/packs.css?v=1"; D.head.appendChild(l); }
  D.body.insertBefore(el, D.body.firstChild);
}
if (/[?&]pk=/.test(location.search)) { if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", bar); else bar(); }

W.ZPACKS = { ROOT, SB, KEY, H, esc, AD, load, reset, resolve, ready, access, itemUrl, progress, statusOf, markOpened, clearProgress, favKey, isFav, toggleFav, kidId, rec, TRACK, PLAN_SRC, MIN_READY, lget };
})(window);
