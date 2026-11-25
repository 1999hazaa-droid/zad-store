/* صفحة «ابحث في المكتبة» */
(function () {
"use strict";
const Z = window.ZFIND; if (!Z) return;
const D = document, esc = Z.esc, X = Z.X, ROOT = Z.ROOT;
const $ = (s, r) => (r || D).querySelector(s), $$ = (s, r) => [...(r || D).querySelectorAll(s)];
const PAGE = 24, LK = "zad-learn-v3";
const AVL = { free: "مجاني", paid: "مدفوع", preview: "متاح للمعاينة", print: "قابل للطباعة", inter: "تفاعلي" };
const SORTS = { rel: "الأكثر صلة بالبحث", new: "الأحدث إضافة", pop: "الأكثر استخدامًا", lv: "حسب العمر أو الصف", ct: "حسب نوع المحتوى" };
const ST = { q: "", lv: new Set(), ct: new Set(), dom: new Set(), av: new Set(), need: "", sort: "rel", saved: false, shown: PAGE, open: false };
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
let READY = false, LOGGED = "";

/* ---------- الرابط ---------- */
function fromUrl() {
  const p = new URLSearchParams(location.search);
  ST.q = (p.get("q") || "").slice(0, 60);
  const set = (k, ok) => new Set((p.get(k) || "").split(",").filter((x) => ok(x)));
  ST.lv = set("lv", (x) => Z.LVN[x]); ST.ct = set("ct", (x) => Z.CT[x]); ST.dom = set("d", (x) => /^[a-z]+$/.test(x)); ST.av = set("av", (x) => AVL[x]);
  ST.need = Z.NEEDS[p.get("need")] ? p.get("need") : ""; ST.sort = SORTS[p.get("s")] ? p.get("s") : "rel"; ST.saved = p.get("sv") === "1";
}
function toUrl(push) {
  const p = new URLSearchParams();
  if (ST.q) p.set("q", ST.q); if (ST.lv.size) p.set("lv", [...ST.lv].join(",")); if (ST.ct.size) p.set("ct", [...ST.ct].join(",")); if (ST.dom.size) p.set("d", [...ST.dom].join(","));
  if (ST.av.size) p.set("av", [...ST.av].join(",")); if (ST.need) p.set("need", ST.need); if (ST.sort !== "rel") p.set("s", ST.sort); if (ST.saved) p.set("sv", "1");
  const u = location.pathname + (p.toString() ? "?" + p : "");
  try { history[push ? "pushState" : "replaceState"]({}, "", u); } catch (e) { /* */ }
}

/* ---------- المحفوظ (المخزن الموحد «محتواي المحفوظ») ---------- */
const SV = window.ZSAVED;
const savedSet = () => (SV ? SV.keys() : new Set());
const metaOf = (it) => ({ key: it.key, title: it.title, ct: it.ct, dom: it.dom, lv: it.lv, img: Z.imgOf(it), paid: it.paid });
function toggleFav(it) { if (!SV) return null; return SV.toggle(metaOf(it)); }

/* ---------- خطتي ---------- */
const PLAN_SRC = new Set(["acts", "bank", "proj", "life", "ready", "val", "vid", "songs", "stories", "quiz"]);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parse = (s) => new Date(s + "T12:00:00");
const addDays = (s, n) => { const x = parse(s); x.setDate(x.getDate() + n); return iso(x); };
const weekStart = (s) => addDays(s, -((parse(s).getDay() + 1) % 7));
const dayIdx = (s) => (parse(s).getDay() + 1) % 7;
const RID = () => "i" + Math.random().toString(36).slice(2, 9);
function kidLv() {
  let DB = Z.lget(LK, null); if (!DB || !DB.kids) DB = null; const kid = DB && DB.kids[DB.cur] ? DB.kids[DB.cur] : null; let lv = "";
  if (kid) { const p = kid.pf && kid.pf.lv; if (Z.LVN[p]) lv = p; else { const a = parseInt(kid.age, 10); if (a) lv = a <= 2 ? "a2" : a <= 6 ? "a" + a : a <= 10 ? "g" + (a - 6) : ""; } }
  if (!lv) { try { const g = localStorage.getItem("zad-rec-lv"); if (Z.LVN[g]) lv = g; } catch (e) { /* */ } }
  return lv;
}
const capOf = (lv) => (lv === "a2" || lv === "a3" ? 1 : 2);
let pt = 0;
const SB = String(window.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, ""), ANON = window.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
async function pushNow() {
  try {
    let S = null; try { S = JSON.parse(localStorage.getItem("zad-sess")); } catch (e) { /* */ } if (!S || localStorage.getItem("zad-pf-consent") !== "1") return;
    if (S.exp - 60000 < Date.now()) { const r = await fetch(SB + "/auth/v1/token?grant_type=refresh_token", { method: "POST", headers: { apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ refresh_token: S.rt }) }); if (!r.ok) return; const j = await r.json(); S = { at: j.access_token, rt: j.refresh_token, exp: Date.now() + (j.expires_in || 3600) * 1000, email: S.email, uid: S.uid }; localStorage.setItem("zad-sess", JSON.stringify(S)); }
    const H = { apikey: ANON, Authorization: "Bearer " + S.at, "Content-Type": "application/json" };
    const c = await (await fetch(SB + "/rest/v1/learn_saves?select=updated_at&user_id=eq." + S.uid, { headers: H })).json(), last = localStorage.getItem("zad-sync-last") || "";
    if (c && c[0] && c[0].updated_at && last && c[0].updated_at > last) return;
    const at = new Date().toISOString(); const r = await fetch(SB + "/rest/v1/learn_saves?on_conflict=user_id", { method: "POST", headers: Object.assign({ Prefer: "resolution=merge-duplicates" }, H), body: JSON.stringify({ user_id: S.uid, data: Z.lget(LK, {}), updated_at: at }) }); if (r.ok) localStorage.setItem("zad-sync-last", at);
  } catch (e) { /* */ }
}
function refreshFav(k) { const on = savedSet().has(k); $$(".fzcard").filter((c) => c.dataset.k === k).forEach((c) => { const b = $("[data-a=fav]", c); if (!b) return; b.setAttribute("aria-pressed", on); const it = X.items.find((i) => i.key === k); b.setAttribute("aria-label", (on ? "إزالة من المفضلة" : "حفظ في المفضلة") + ": " + (it ? it.title : "")); const sp = $(".zst", b); if (sp) sp.textContent = on ? "تم الحفظ" : "حفظ"; }); }
window.addEventListener("zad-saved", () => { if (READY) render(); });
const addToPlan = (it, date) => (SV ? SV.addToPlan(it, date) : "تعذّر تحميل خطتي.");

/* ---------- العرض ---------- */
const lvTxt = (it) => { const l = it.lv; if (!l.length) return ""; if (it.src === "games" && it.ageTxt) return it.ageTxt; if (l.length === 1) return Z.LVN[l[0]]; return Z.LVN[l[0]] + " إلى " + Z.LVN[l[l.length - 1]]; };
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";
function card(it, saved) {
  const fav = saved.has(it.key), planOk = PLAN_SRC.has(it.src), isIcon = !it.img;
  const st = it.paid ? `<span class="pd">مدفوع · ${esc(money(it.price))}</span>` : `<span class="fr">مجاني</span>`;
  const ico = isIcon && it.src !== "lib";
  return `<article class="fzcard" data-k="${esc(it.key)}"><a class="th${ico ? " ic" : ""}" href="${esc(ROOT + it.url)}" tabindex="-1" aria-hidden="true"><img src="${esc(Z.imgOf(it))}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_puzzle.webp'"></a>
<button type="button" class="fv zsb" data-a="fav" aria-pressed="${fav}" aria-label="${fav ? "إزالة من المفضلة" : "حفظ في المفضلة"}: ${esc(it.title)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg><span class="zst">${fav ? "تم الحفظ" : "حفظ"}</span></button>
<div class="bd"><h3>${esc(it.title)}</h3>${it.desc ? `<p class="ds">${esc(it.desc)}</p>` : ""}
<div class="mt"><span>${esc(Z.CT[it.ct])}</span>${lvTxt(it) ? `<span>${esc(lvTxt(it))}</span>` : ""}<span>${esc(Z.domName(it.dom))}</span>${st}</div>
${it.paid ? '<p class="pn">المعاينة متاحة قبل الطلب.</p>' : ""}</div>
<div class="ac"><a href="${esc(ROOT + it.url)}" aria-label="عرض المحتوى: ${esc(it.title)}">عرض المحتوى</a>${planOk ? `<button type="button" data-a="plan" aria-label="إضافة إلى خطتي: ${esc(it.title)}">إضافة إلى خطتي</button>` : ""}</div></article>`;
}
function planBox(it) {
  const lv = kidLv(), t = iso(new Date()), ws = weekStart(t);
  const opts = DAYS.map((n, i) => { const d = addDays(ws, i), dd = parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  if (!lv) return `<div class="fzplan"><p class="m bad">اختر عمر طفلك أو صفه أولًا ليُضاف النشاط إلى خطته.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  return `<div class="fzplan"><label>اليوم من هذا الأسبوع <select data-r="day">${opts}</select></label><div class="r"><button type="button" data-a="planok">إضافة</button><button type="button" data-a="plancancel">إلغاء</button></div><p class="m" data-r="msg" role="status"></p></div>`;
}
function active() {
  const a = [];
  ST.lv.forEach((l) => a.push(["lv", l, Z.LVN[l]])); ST.ct.forEach((c) => a.push(["ct", c, Z.CT[c]])); ST.dom.forEach((d) => a.push(["dom", d, Z.domName(d)])); ST.av.forEach((v) => a.push(["av", v, AVL[v]]));
  if (ST.need) a.push(["need", ST.need, Z.NEEDS[ST.need].label]); if (ST.saved) a.push(["saved", "1", "المحتوى المحفوظ"]);
  return a;
}
const F = () => ({ lv: ST.lv, ct: ST.ct, dom: ST.dom, av: ST.av, need: ST.need, saved: ST.saved ? savedSet() : null });
function without(kind, val) { const c = { lv: new Set(ST.lv), ct: new Set(ST.ct), dom: new Set(ST.dom), av: new Set(ST.av), need: ST.need, saved: ST.saved ? savedSet() : null }; if (kind === "need") c.need = ""; else if (kind === "saved") c.saved = null; else c[kind].delete(val); return c; }

function filterPanel() {
  const has = (fn) => X.items.some(fn);
  const pill = (g, v, label) => `<button type="button" class="fzchip${ST[g].has(v) ? " on" : ""}" data-f="${g}" data-v="${esc(v)}" aria-pressed="${ST[g].has(v)}">${esc(label)}</button>`;
  const grp = (title, arr) => (arr.length ? `<fieldset><legend>${esc(title)}</legend><div class="fzchips">${arr.join("")}</div></fieldset>` : "");
  const ages = Z.LV.filter((l) => l[0][0] === "a" && has((i) => i.lv.includes(l[0]))).map((l) => pill("lv", l[0], l[1]));
  const grades = Z.LV.filter((l) => l[0][0] === "g" && has((i) => i.lv.includes(l[0]))).map((l) => pill("lv", l[0], l[1]));
  const cts = Z.CTK.filter((c) => has((i) => i.ct === c)).map((c) => pill("ct", c, Z.CT[c]));
  const doms = X.doms.filter((d) => has((i) => i.dom === d.slug)).map((d) => pill("dom", d.slug, d.title)); if (has((i) => i.dom === "other")) doms.push(pill("dom", "other", "متنوع"));
  const avs = [["free", (i) => i.free], ["paid", (i) => i.paid], ["preview", (i) => i.preview], ["print", (i) => i.printable], ["inter", (i) => i.interactive]].filter(([, fn]) => has(fn)).map(([k]) => pill("av", k, AVL[k]));
  return grp("حسب العمر", ages) + grp("حسب الصف الدراسي", grades) + grp("حسب نوع المحتوى", cts) + grp("حسب المجال", doms) + grp("حسب توفر المحتوى", avs) +
    (savedSet().size ? `<fieldset><legend>المحتوى المحفوظ</legend><div class="fzchips"><button type="button" class="fzchip${ST.saved ? " on" : ""}" data-f="saved" aria-pressed="${ST.saved}">المحتوى المحفوظ فقط</button></div></fieldset>` : "") +
    `<button type="button" class="fzt" data-f="clear">مسح الفلاتر</button>`;
}
function sortOpts() {
  const keys = Object.keys(SORTS).filter((k) => k !== "pop" || X.usedN >= 3);
  if (!keys.includes(ST.sort)) ST.sort = "rel";
  $("#fzsort").innerHTML = keys.map((k) => `<option value="${k}"${ST.sort === k ? " selected" : ""}>${SORTS[k]}</option>`).join("");
}
function needChips() {
  const ok = Object.entries(Z.NEEDS).filter(([, n]) => X.items.some(n.test));
  $("#fzneeds").hidden = !ok.length;
  $("#fzneedc").innerHTML = ok.map(([k, n]) => `<button type="button" class="fzchip${ST.need === k ? " on" : ""}" data-need="${k}" aria-pressed="${ST.need === k}">${esc(n.label)}</button>`).join("");
}

function emptyView() {
  const q = ST.q, act = active(); let h = `<div class="fzempty"><img src="${ROOT}images/zad/i_search.webp" alt=""><h3>لم نعثر على محتوى مطابق. جرّب كلمة أخرى أو غيّر الفلاتر</h3>`;
  const base = (f) => Z.search(q, f, "rel");
  const rm = act.map(([k, v, l]) => ({ k, v, l, n: base(without(k, v)).length })).filter((x) => x.n > 0);
  if (rm.length) h += `<h4>جرّب إزالة أحد الفلاتر</h4><div class="fzchips">${rm.map((x) => `<button type="button" class="fzchip" data-rm="${esc(x.k)}" data-v="${esc(x.v)}">إزالة: ${esc(x.l)} (${AD(x.n)})</button>`).join("")}</div>`;
  const words = [...new Set(Z.qstems(q))], raw = Z.norm(q).split(" ").filter(Boolean);
  let short = [];
  if (words.length > 1) short = raw.map((w) => ({ w, n: Z.qstems(w).length ? base2(w).length : 0 })).filter((x) => x.n > 0 && x.w.length > 1);
  if (short.length) h += `<h4>جرّب كلمة أقصر</h4><div class="fzchips">${short.slice(0, 4).map((x) => `<button type="button" class="fzchip" data-q="${esc(x.w)}">${esc(x.w)} (${AD(x.n)})</button>`).join("")}</div>`;
  function base2(w) { return Z.search(w, F(), "rel"); }
  const doms = X.doms.filter((d) => X.items.some((i) => i.dom === d.slug));
  if (doms.length) h += `<h4>تصفّح المجالات التعليمية</h4><div class="fzchips">${doms.map((d) => `<button type="button" class="fzchip" data-dom="${esc(d.slug)}">${esc(d.title)}</button>`).join("")}</div>`;
  if (short.length) { const rel = base2(short[0].w).slice(0, 3); if (rel.length) { const sv = savedSet(); h += `<h4>محتوى يطابق «${esc(short[0].w)}» وحدها</h4><div class="fzgrid">${rel.map((r) => card(r.it, sv)).join("")}</div>`; } }
  return h + "</div>";
}

function render(opt) {
  opt = opt || {};
  $("#fzq").value = ST.q; $("#fzclearq").hidden = !ST.q;
  sortOpts(); needChips();
  $("#fzf").innerHTML = filterPanel(); $("#fzf").hidden = !ST.open; $("#fzftog").setAttribute("aria-expanded", String(ST.open));
  const act = active(), nAct = act.length; $("#fzftog").innerHTML = "الفلاتر" + (nAct ? ` (${AD(nAct)})` : "");
  $("#fzact").innerHTML = act.map(([k, v, l]) => `<button type="button" class="fzx" data-rm="${esc(k)}" data-v="${esc(v)}" aria-label="إزالة الفلتر: ${esc(l)}">${esc(l)}</button>`).join("") + (nAct ? `<button type="button" class="fzt" data-f="clear">مسح الفلاتر</button>` : "");
  const list = Z.search(ST.q, F(), ST.sort), sv = savedSet(), warn = X.failed.length ? `<div class="fzwarn" role="alert">تعذّر تحميل بعض الأقسام (${esc(X.failed.map((f) => ({ library: "ملفات المكتبة", games: "الألعاب", domains: "المجالات" }[f] || f)).join("، "))})، فقد تكون النتائج ناقصة. أعد المحاولة لاحقًا.</div>` : "";
  $("#fzcount").textContent = X.failed.length ? (list.length ? "نتائج جزئية" : "") : list.length ? (list.length === 1 ? "نتيجة واحدة" : AD(list.length) + (list.length === 2 ? " نتيجتان" : list.length <= 10 ? " نتائج" : " نتيجة")) : "";
  if (X.failed.length && list.length) $("#fzcount").textContent = "";
  if (!list.length) {
    $("#fzres").innerHTML = warn + (X.items.length ? emptyView() : `<div class="fzempty"><h3>تعذّر تحميل المحتوى الآن</h3><p>تأكد من اتصالك بالإنترنت ثم أعد المحاولة.</p><button type="button" class="fzt p" onclick="location.reload()">إعادة المحاولة</button></div>`);
    if (ST.q && X.items.length && !LOGGED.startsWith(ST.q + "|")) { LOGGED = ST.q + "|1"; if (!Z.search(ST.q, {}, "rel").length) Z.logZero(ST.q); }
  } else {
    const show = list.slice(0, ST.shown);
    $("#fzres").innerHTML = warn + `<div class="fzgrid">${show.map((r) => card(r.it, sv)).join("")}</div>` + (list.length > show.length ? `<button type="button" class="fzmore" data-a="more">عرض المزيد (${AD(list.length - show.length)} متبقية)</button>` : "");
  }
}
function commit(q) { ST.q = String(q || "").trim().slice(0, 60); ST.shown = PAGE; toUrl(true); LOGGED = ""; render(); }
function change(fn) { fn(); ST.shown = PAGE; toUrl(false); render(); }

D.addEventListener("click", (e) => {
  if (!READY) return;
  const t = e.target.closest("button,a"); if (!t) return;
  if (t.id === "fzftog") { ST.open = !ST.open; render(); return; }
  if (t.id === "fzclearqa") { e.preventDefault(); ST.q = ""; ST.shown = PAGE; toUrl(true); render(); $("#fzq").focus(); return; }
  if (t.dataset.f === "clear") return change(() => { ST.lv.clear(); ST.ct.clear(); ST.dom.clear(); ST.av.clear(); ST.need = ""; ST.saved = false; });
  if (t.dataset.f === "saved") return change(() => { ST.saved = !ST.saved; });
  if (t.dataset.f) { const g = t.dataset.f, v = t.dataset.v; return change(() => { ST[g].has(v) ? ST[g].delete(v) : ST[g].add(v); }); }
  if (t.dataset.need) return change(() => { ST.need = ST.need === t.dataset.need ? "" : t.dataset.need; });
  if (t.dataset.rm) { const k = t.dataset.rm, v = t.dataset.v; return change(() => { if (k === "need") ST.need = ""; else if (k === "saved") ST.saved = false; else ST[k].delete(v); }); }
  if (t.dataset.q) return commit(t.dataset.q);
  if (t.dataset.dom) return change(() => { ST.q = ""; ST.dom = new Set([t.dataset.dom]); ST.open = true; });
  if (t.dataset.a === "more") return change(() => { ST.shown += PAGE; });
  const c = t.closest(".fzcard"); if (!c) return; const it = X.items.find((i) => i.key === c.dataset.k); if (!it) return;
  if (t.dataset.a === "fav") { const r = toggleFav(it); if (!r) return; if (!r.ok) { SV.toast(r.msg); return; } SV.toast(r.on ? "تم الحفظ في «محتواي المحفوظ»" : "أُزيل من المحفوظات"); refreshFav(it.key); if (ST.saved || $("#fzf:not([hidden])")) render(); return; }
  if (t.dataset.a === "plan") { const old = $(".fzplan", c); if (old) { old.remove(); return; } c.insertAdjacentHTML("beforeend", planBox(it)); const s = $(".fzplan select,.fzplan a", c); if (s) s.focus(); return; }
  if (t.dataset.a === "plancancel") { const b = $(".fzplan", c); if (b) b.remove(); return; }
  if (t.dataset.a === "planok") { const msg = $("[data-r=msg]", c), r = addToPlan(it, $("[data-r=day]", c).value); msg.className = "m " + (r ? "bad" : "ok"); msg.innerHTML = r ? esc(r) : `تمت الإضافة إلى خطتك. <a href="${ROOT}plan/">فتح خطتي</a>`; }
});
D.addEventListener("keydown", (e) => { if (e.key === "Escape" && ST.open && D.activeElement && D.activeElement.closest("#fzf")) { ST.open = false; render(); $("#fzftog").focus(); } });
$("#fzform").addEventListener("submit", (e) => { e.preventDefault(); const v = $("#fzq").value; if (!READY) { ST.q = v; return; } commit(v); const l = $("#fzres"); if (l && l.scrollIntoView) l.scrollIntoView({ block: "start", behavior: "smooth" }); });
$("#fzsort").addEventListener("change", () => change(() => { ST.sort = $("#fzsort").value; }));
window.addEventListener("popstate", () => { fromUrl(); render(); });

fromUrl(); $("#fzq").value = ST.q; $("#fzclearq").hidden = !ST.q;
Z.typeahead($("#fzq"), (s) => { $("#fzq").value = s.text; commit(s.text); });
Promise.all([Z.load(), SV ? SV.ready() : 0]).then(() => { if (SV) SV.migrate(X.items); READY = true; ST.open = ST.lv.size + ST.ct.size + ST.dom.size + ST.av.size > 0 && matchMedia("(min-width:700px)").matches; render(); }).catch(() => { READY = true; render(); });
window.__findState = ST;
})();
