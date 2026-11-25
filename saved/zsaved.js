/* محتواي المحفوظ – المخزن الموحد (لكل طفل، على الجهاز، ويُزامَن مع الحساب كبقية بيانات الطفل)
   الشكل: kid.saved = { v:1, lists:[{id,name,c}], items:{ "src:slug": {t,ct,dom,lv[],img,paid,at,lists[]} } } */
(function (W) {
"use strict";
const LK = "zad-learn-v3", MAXL = 20, MAXI = 500;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
const ROOT = new URL("../", document.currentScript ? document.currentScript.src : location.href).href;
const SUGG = ["أنشطة هذا الأسبوع", "قصص أريد قراءتها", "أوراق عمل للطباعة", "أنشطة الرياضيات", "أنشطة نهاية الأسبوع", "محتوى للمراجعة"];
const LVN = { a2: "سنة إلى سنتين", a3: "3 سنوات", a4: "4 سنوات", a5: "5 سنوات", a6: "6 سنوات", g1: "الصف الأول", g2: "الصف الثاني", g3: "الصف الثالث", g4: "الصف الرابع" };
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
const rid = () => "l" + Math.random().toString(36).slice(2, 9);
const RID = () => "i" + Math.random().toString(36).slice(2, 9);
let cfg = { types: new Set(), items: new Set(), ok: false }, cfgP = null;

/* ---------- قراءة وكتابة سجل الطفل الحالي ---------- */
function db() { let D = lget(LK, null); if (!D || !D.kids || !Object.keys(D.kids).length) D = { cur: "k1", kids: { k1: {} } }; if (!D.kids[D.cur]) D.cur = Object.keys(D.kids)[0]; return D; }
function norm(s) { s = s && typeof s === "object" ? s : {}; if (!Array.isArray(s.lists)) s.lists = []; if (!s.items || typeof s.items !== "object" || Array.isArray(s.items)) s.items = {}; s.v = 1; return s; }
const kidId = () => db().cur;
function read() { const D = db(); return norm(D.kids[D.cur].saved); }
function mut(fn) {
  const D = db(), k = D.kids[D.cur]; k.saved = norm(k.saved); const r = fn(k.saved); D._t = Date.now();
  try { localStorage.setItem(LK, JSON.stringify(D)); } catch (e) { return { ok: false, msg: "تعذّر الحفظ على الجهاز (قد يكون التصفح خاصًا)." }; }
  pushSoon(); try { W.dispatchEvent(new CustomEvent("zad-saved")); } catch (e) { /* */ } return r === undefined ? { ok: true } : r;
}
let pt = 0;
function pushSoon() { clearTimeout(pt); pt = setTimeout(pushNow, 2500); }
async function pushNow() {
  try {
    let S = null; try { S = JSON.parse(localStorage.getItem("zad-sess")); } catch (e) { /* */ } if (!S || localStorage.getItem("zad-pf-consent") !== "1") return;
    if (S.exp - 60000 < Date.now()) { const r = await fetch(SB + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: S.rt }) }); if (!r.ok) return; const j = await r.json(); S = { at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: S.email, uid: S.uid }; localStorage.setItem("zad-sess", JSON.stringify(S)); }
    const H = { apikey: ANON, Authorization: "Bearer " + S.at, "Content-Type": "application/json" };
    const c = await (await fetch(SB + "/rest/v1/learn_saves?select=updated_at&user_id=eq." + S.uid, { headers: H })).json(), last = localStorage.getItem("zad-sync-last") || "";
    if (c && c[0] && c[0].updated_at && last && c[0].updated_at > last) return; /* نسخة أحدث في الحساب: لا نستبدلها */
    const at = new Date().toISOString(), r = await fetch(SB + "/rest/v1/learn_saves?on_conflict=user_id", { method: "POST", headers: Object.assign({ Prefer: "resolution=merge-duplicates" }, H), body: JSON.stringify({ user_id: S.uid, data: lget(LK, {}), updated_at: at }) }); if (r.ok) localStorage.setItem("zad-sync-last", at);
  } catch (e) { /* */ }
}

/* ---------- إعدادات المسؤول: أنواع أو عناصر أوقف حفظها ---------- */
function ready() {
  if (cfgP) return cfgP;
  cfgP = fetch(SB + "/rest/v1/saved_off?select=kind,ref", { headers: { apikey: ANON, Authorization: "Bearer " + ANON } }).then((r) => (r.ok ? r.json() : Promise.reject())).then((a) => {
    cfg = { types: new Set(a.filter((x) => x.kind === "type").map((x) => x.ref)), items: new Set(a.filter((x) => x.kind === "item").map((x) => x.ref)), ok: true };
    try { W.dispatchEvent(new CustomEvent("zad-saved")); } catch (e) { /* */ } return cfg;
  }).catch(() => cfg);
  return cfgP;
}
function blocked(key, ct) { if (cfg.items.has(key)) return "أوقف المسؤول حفظ هذا المحتوى حاليًا."; if (ct && cfg.types.has(ct)) return "حفظ هذا النوع من المحتوى متوقف حاليًا."; return ""; }

/* ---------- العناصر ---------- */
const has = (key) => !!read().items[key];
const get = (key) => read().items[key] || null;
function clean(m) { return { t: String(m.title || m.t || "").slice(0, 160), ct: m.ct || "", dom: m.dom || "", lv: Array.isArray(m.lv) ? m.lv.filter((l) => LVN[l]) : [], img: m.img || "", paid: !!m.paid }; }
/** يحفظ العنصر مرة واحدة فقط؛ يعيد {ok,on,msg} */
function save(meta, listId) {
  const key = meta.key; if (!key) return { ok: false, msg: "محتوى غير معروف." };
  if (has(key)) { if (listId) mut((s) => { const i = s.items[key]; i.lists = Array.isArray(i.lists) ? i.lists : []; if (!i.lists.includes(listId)) i.lists.push(listId); }); return { ok: true, on: true, dup: true, msg: "هذا المحتوى محفوظ مسبقًا." }; }
  const b = blocked(key, meta.ct); if (b) return { ok: false, on: false, msg: b };
  if (Object.keys(read().items).length >= MAXI) return { ok: false, msg: "وصلت إلى الحد الأقصى للمحفوظات (" + MAXI + "). أزل بعضها أولًا." };
  const r = mut((s) => { s.items[key] = Object.assign(clean(meta), { at: Date.now(), lists: listId && s.lists.some((l) => l.id === listId) ? [listId] : [] }); });
  if (r && r.ok === false) return r; return { ok: true, on: true, msg: "تم الحفظ" };
}
function unsave(key) { mut((s) => { delete s.items[key]; }); return { ok: true, on: false, msg: "أُزيل من المحفوظات" }; }
function toggle(meta) { return has(meta.key) ? unsave(meta.key) : save(meta); }
function removeMany(keys) { const n = keys.length; mut((s) => { keys.forEach((k) => { delete s.items[k]; }); }); return n; }
/** نقل العناصر إلى قائمة (أو إلى القائمة العامة فقط إذا كانت الوجهة فارغة) */
function moveMany(keys, listId) { return mut((s) => { if (listId && !s.lists.some((l) => l.id === listId)) return; keys.forEach((k) => { if (s.items[k]) s.items[k].lists = listId ? [listId] : []; }); }); }
/** يحدّث لقطة العنصر من بيانات حيّة (العنوان والنوع...) دون تغيير تاريخ الحفظ */
function refresh(map) { const s = read(); let ch = false; Object.keys(s.items).forEach((k) => { const m = map[k]; if (!m) return; const c = clean(m), o = s.items[k]; if (["t", "ct", "dom", "img", "paid"].some((f) => o[f] !== c[f]) || JSON.stringify(o.lv) !== JSON.stringify(c.lv)) ch = true; }); if (!ch) return; mut((x) => { Object.keys(x.items).forEach((k) => { if (map[k]) Object.assign(x.items[k], clean(map[k])); }); }); }
function count() { return Object.keys(read().items).length; }
function all() { const s = read(); return Object.keys(s.items).map((k) => Object.assign({ key: k }, s.items[k])); }
function keys() { return new Set(Object.keys(read().items)); }

/* ---------- القوائم ---------- */
const lists = () => read().lists.slice();
function listErr(name, s, selfId) { name = String(name || "").replace(/\s+/g, " ").trim(); if (!name) return "اكتب اسم القائمة."; if (name.length > 40) return "الاسم طويل (الحد 40 حرفًا)."; if (s.lists.some((l) => l.id !== selfId && l.name === name)) return "توجد قائمة بهذا الاسم."; return ""; }
function createList(name) { let out; const r = mut((s) => { const e = listErr(name, s); if (e) { out = { ok: false, msg: e }; return out; } if (s.lists.length >= MAXL) { out = { ok: false, msg: "الحد الأقصى " + MAXL + " قائمة." }; return out; } const l = { id: rid(), name: String(name).replace(/\s+/g, " ").trim(), c: Date.now() }; s.lists.push(l); out = { ok: true, id: l.id, msg: "تم إنشاء القائمة" }; return out; }); return r && r.ok === false && !out ? r : out; }
function renameList(id, name) { let out; mut((s) => { const l = s.lists.find((x) => x.id === id); if (!l) { out = { ok: false, msg: "القائمة غير موجودة." }; return; } const e = listErr(name, s, id); if (e) { out = { ok: false, msg: e }; return; } l.name = String(name).replace(/\s+/g, " ").trim(); out = { ok: true, msg: "تم تعديل الاسم" }; }); return out; }
/** حذف القائمة لا يحذف المحتوى؛ يبقى في القائمة العامة */
function deleteList(id) { mut((s) => { s.lists = s.lists.filter((l) => l.id !== id); Object.keys(s.items).forEach((k) => { const i = s.items[k]; if (Array.isArray(i.lists)) i.lists = i.lists.filter((x) => x !== id); }); }); return { ok: true }; }

/* ---------- ترحيل المفضلات القديمة (مرة واحدة) ---------- */
/** يمرّر قائمة عناصر حيّة {id,key,title,ct,dom,lv,img,paid}؛ ينقل المفضلات القديمة ثم يفرّغها */
function migrate(items) {
  if (!items || !items.length) return 0; let n = 0;
  const lib = lget("zad.lib.fav", []), fnd = lget("zad.find.fav", []); if (!(Array.isArray(lib) && lib.length) && !(Array.isArray(fnd) && fnd.length)) return 0;
  const byId = new Map(), byKey = new Map(); items.forEach((i) => { if (i.id) byId.set(i.id, i); byKey.set(i.key, i); });
  const add = [], leftLib = [], leftFnd = [];
  (Array.isArray(lib) ? lib : []).forEach((id) => { const i = byId.get(id); if (i) add.push(i); else leftLib.push(id); });
  (Array.isArray(fnd) ? fnd : []).forEach((k) => { const i = byKey.get(k); if (i) add.push(i); else leftFnd.push(k); });
  const r = mut((s) => { add.forEach((i) => { if (!s.items[i.key]) { s.items[i.key] = Object.assign(clean(i), { at: Date.now() - n, lists: [] }); n++; } }); });
  if (r && r.ok === false) return 0;
  try { localStorage.setItem("zad.lib.fav", JSON.stringify(leftLib)); localStorage.setItem("zad.find.fav", JSON.stringify(leftFnd)); } catch (e) { /* */ }
  return n;
}

/* ---------- الإضافة إلى خطة الأسبوع (نفس بنية صفحة «خطتي») ---------- */
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => new Date(s + "T12:00:00");
const addDays = (s, n) => { const x = parse(s); x.setDate(x.getDate() + n); return iso(x); };
const weekStart = (s) => addDays(s, -((parse(s).getDay() + 1) % 7));
const dayIdx = (s) => (parse(s).getDay() + 1) % 7;
const capOf = (lv) => (lv === "a2" || lv === "a3" ? 1 : 2);
function kidLv() {
  const D = lget(LK, null), kid = D && D.kids && D.kids[D.cur] ? D.kids[D.cur] : null; let lv = "";
  if (kid) { const p = kid.pf && kid.pf.lv; if (LVN[p]) lv = p; else { const a = parseInt(kid.age, 10); if (a) lv = a <= 2 ? "a2" : a <= 6 ? "a" + a : a <= 10 ? "g" + (a - 6) : ""; } }
  if (!lv) { try { const g = localStorage.getItem("zad-rec-lv"); if (LVN[g]) lv = g; } catch (e) { /* */ } }
  return lv;
}
/** it: {key, lv[]}؛ يعيد نص خطأ أو "" عند النجاح. المحفوظ لا يُحسب إنجازًا: الإنجاز يُسجَّل عند إكمال النشاط فقط */
function addToPlan(it, date, why) {
  const lv = kidLv(); if (!lv) return "اختر عمر طفلك أو صفه أولًا من صفحة خطتي.";
  if (!it.lv || !it.lv.includes(lv)) return "هذا المحتوى غير مناسب لمستوى طفلك الحالي (" + LVN[lv] + ").";
  const D = db(), k = D.kids[D.cur]; k.plan = k.plan || {}; k.plan.weeks = k.plan.weeks || {}; k.plan.set = k.plan.set || {};
  const ws = weekStart(date), d = dayIdx(date);
  const w = (k.plan.weeks[ws] = k.plan.weeks[ws] || { id: RID(), created: Date.now(), days: [], n: 0, doms: [], review: false, lv, paused: false, items: [] });
  if (w.items.some((i) => i.key === it.key)) return "هذا النشاط مضاف مسبقًا إلى خطة هذا الأسبوع.";
  if (w.items.filter((i) => i.day === d).length >= capOf(lv)) return "هذا اليوم ممتلئ؛ اختر يومًا آخر لتجنب الإرهاق.";
  w.items.push({ id: RID(), key: it.key, day: d, st: "todo", c: Date.now(), why: why || "نشاط اخترته من «ابحث في المكتبة».", ty: "find", tries: 0, note: "" });
  if (!w.days.includes(d)) w.days.push(d);
  D._t = Date.now(); try { localStorage.setItem(LK, JSON.stringify(D)); } catch (e) { return "تعذّر الحفظ على الجهاز."; }
  pushSoon(); return "";
}
const inPlan = (key) => { const D = lget(LK, null), k = D && D.kids && D.kids[D.cur]; const w = k && k.plan && k.plan.weeks; return !!w && Object.keys(w).some((x) => (w[x].items || []).some((i) => i.key === key)); };

/* ---------- رسالة تأكيد قصيرة ---------- */
function toast(m) { const o = document.querySelector(".zs-toast"); if (o) o.remove(); const e = document.createElement("div"); e.className = "zs-toast"; e.setAttribute("role", "status"); e.textContent = m; document.body.appendChild(e); setTimeout(() => e.remove(), 2400); }
/** تعيين ct لملف مكتبة من حقوله (تستعمله صفحة المكتبة) */
const SEC_CT = { ws: "ws", letters: "ws", math: "ws", color: "ws", cards: "cards", stories: "story", home: "home", think: "ws", review: "quiz", extra: "res", teacher: "res" };
const LIBTYPE_CT = { worksheet: "ws", cards: "cards", story: "story", home_activity: "home", printable_activity: "ws", summary: "res", review: "quiz" };
const libCt = (p) => LIBTYPE_CT[p.lib_type] || SEC_CT[p.lib_section] || "res";
window.addEventListener("storage", (e) => { if (e.key === LK) try { W.dispatchEvent(new CustomEvent("zad-saved")); } catch (x) { /* */ } });

W.ZSAVED = { ROOT, SUGG, LVN, kidId, read, has, get, save, unsave, toggle, removeMany, moveMany, refresh, count, all, keys, lists, createList, renameList, deleteList, migrate, addToPlan, inPlan, kidLv, ready, blocked, toast, libCt, weekStart, addDays, iso, parse, dayIdx, capOf, cfg: () => cfg };
})(window);
