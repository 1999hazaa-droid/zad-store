/* صفحة «محتواي المحفوظ» */
(function () {
"use strict";
const Z = window.ZFIND, S = window.ZSAVED; if (!Z || !S) return;
const D = document, esc = Z.esc, X = Z.X, ROOT = Z.ROOT;
const $ = (s, r) => (r || D).querySelector(s), $$ = (s, r) => [...(r || D).querySelectorAll(s)];
const PLAN_SRC = new Set(["acts", "bank", "proj", "life", "ready", "val", "vid", "songs", "stories", "quiz"]);
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
const SB = String(window.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, ""), ANON = window.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
const ST = { list: "", ct: new Set(), dom: new Set(), sort: "new", sel: false, picked: new Set(), open: false, mg: "" };
let READY = false, FAILED = false;
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const live = new Map();
const srcOf = (k) => k.split(":")[0];
const srcFailed = (k) => { const s = srcOf(k); return X.failed.includes(s === "lib" ? "library" : s); };
const fdate = (t) => { try { return new Date(t).toLocaleDateString("ar-OM", { day: "numeric", month: "long", year: "numeric" }); } catch (e) { return ""; } };

/* ---------- بيانات العرض ---------- */
function recs() {
  return S.all().map((r) => {
    const it = live.get(r.key), ok = !!it && !it.hidden && it.lv.length, st = ok ? "ok" : srcFailed(r.key) ? "unk" : "gone";
    const m = ok ? it : null;
    return { key: r.key, at: r.at, lists: r.lists || [], st, it: m, t: (m ? m.title : r.t) || "محتوى محفوظ", ct: (m ? m.ct : r.ct) || "", dom: (m ? m.dom : r.dom) || "", lv: m ? m.lv : r.lv || [], paid: m ? m.paid : r.paid, price: m ? m.price : 0, img: m ? Z.imgOf(m) : r.img || "" };
  });
}
function visible(all) {
  let a = all.filter((r) => !ST.list || r.lists.includes(ST.list));
  if (ST.ct.size) a = a.filter((r) => ST.ct.has(r.ct));
  if (ST.dom.size) a = a.filter((r) => ST.dom.has(r.dom));
  const s = ST.sort; a = a.slice().sort((x, y) => s === "old" ? x.at - y.at : s === "title" ? x.t.localeCompare(y.t, "ar") : y.at - x.at); return a;
}
const lvTxt = (lv) => { if (!lv.length) return ""; if (lv.length === 1) return S.LVN[lv[0]]; return S.LVN[lv[0]] + " إلى " + S.LVN[lv[lv.length - 1]]; };
const money = (n) => (Number(n) || 0).toFixed(3) + " ر.ع";

function card(r) {
  const off = r.st === "gone", sel = ST.picked.has(r.key), planOk = r.it && PLAN_SRC.has(r.it.src);
  const stt = r.it && r.it.src === "pack" ? "" : r.paid ? `<span class="pd">مدفوع${r.price ? " · " + esc(money(r.price)) : ""}</span>` : r.it ? `<span class="fr">مجاني</span>` : "";
  const note = off ? `<p class="st bad">هذا المحتوى لم يعد متاحًا. يمكنك إزالته من قائمتك.</p>` : r.st === "unk" ? `<p class="st bad">تعذّر التحقق من توفر المحتوى الآن، أعد المحاولة لاحقًا.</p>` : r.paid ? `<p class="st">محتوى مدفوع: تتاح المعاينة هنا، والملف الكامل بعد الطلب.</p>` : "";
  const img = r.img || ROOT + "images/zad/i_puzzle.webp";
  const open = !r.it ? `<span class="dis" aria-disabled="true">${off ? "غير متاح" : "تعذّر التحقق"}</span>` : `<a href="${esc(ROOT + r.it.url)}" aria-label="${r.paid ? "عرض المعاينة" : "فتح المحتوى"}: ${esc(r.t)}">${r.paid ? "عرض المعاينة" : "فتح المحتوى"}</a>`;
  const ck = ST.sel ? `<input class="ck" type="checkbox" data-a="pick" ${sel ? "checked" : ""} aria-label="تحديد: ${esc(r.t)}">` : "";
  return `<article class="fzcard${off ? " off" : ""}${sel ? " sel" : ""}" data-k="${esc(r.key)}">${ck}<span class="th ic"><img src="${esc(img)}" alt="" loading="lazy" decoding="async" onerror="this.onerror=null;this.src='${ROOT}images/zad/i_puzzle.webp'"></span>
<div class="bd"><h3>${esc(r.t)}</h3><div class="mt">${r.ct ? `<span>${esc(Z.CT[r.ct] || "")}</span>` : ""}${r.dom ? `<span>${esc(Z.domName(r.dom))}</span>` : ""}${lvTxt(r.lv) ? `<span>${esc(lvTxt(r.lv))}</span>` : ""}${stt}</div>${note}<p class="sd">حُفظ في ${esc(fdate(r.at))}</p></div>
<div class="ac">${open}${planOk ? `<button type="button" data-a="plan" aria-label="إضافة إلى خطتي: ${esc(r.t)}">إضافة إلى خطتي</button>` : ""}<button type="button" class="rm" data-a="rm" aria-label="إزالة من المفضلة: ${esc(r.t)}">إزالة من المفضلة</button></div></article>`;
}
function planBox() {
  const lv = S.kidLv(), t = S.iso(new Date()), ws = S.weekStart(t);
  if (!lv) return `<div class="fzplan"><p class="m bad">اختر عمر طفلك أو صفه أولًا ليُضاف النشاط إلى خطته.</p><a href="${ROOT}plan/">فتح خطتي التعليمية</a></div>`;
  const opts = DAYS.map((n, i) => { const d = S.addDays(ws, i), dd = S.parse(d); return `<option value="${d}"${d === t ? " selected" : ""}>${n} ${AD(dd.getDate())}</option>`; }).join("");
  return `<div class="fzplan"><label>اليوم من هذا الأسبوع <select data-r="day">${opts}</select></label><div class="r"><button type="button" data-a="planok">إضافة</button><button type="button" data-a="plancancel">إلغاء</button></div><p class="m" data-r="msg" role="status"></p></div>`;
}

/* ---------- الرسم ---------- */
function drawLists(all) {
  const ls = S.lists(), n = (id) => all.filter((r) => !id || r.lists.includes(id)).length;
  $("#szlists").innerHTML = `<button type="button" role="tab" data-l="" aria-selected="${!ST.list}">كل المحفوظات (${AD(n(""))})</button>` + ls.map((l) => `<button type="button" role="tab" data-l="${esc(l.id)}" aria-selected="${ST.list === l.id}">${esc(l.name)} (${AD(n(l.id))})</button>`).join("") + `<button type="button" class="add" data-a="newlist">+ قائمة جديدة</button>`;
}
function drawMg() {
  const box = $("#szlmg"), cur = S.lists().find((l) => l.id === ST.list);
  if (ST.mg === "new") { box.hidden = false; box.innerHTML = `<h3>قائمة جديدة <small>(اختيارية، يمكنك الحفظ دون قوائم)</small></h3><div class="fzchips">${S.SUGG.filter((x) => !S.lists().some((l) => l.name === x)).map((x) => `<button type="button" class="fzchip" data-sg="${esc(x)}">${esc(x)}</button>`).join("")}</div><div class="r"><input id="szln" maxlength="40" placeholder="اسم القائمة" aria-label="اسم القائمة"><button type="button" class="fzt p" data-a="mknew">إنشاء</button><button type="button" class="fzt" data-a="mgx">إلغاء</button></div><p class="m" data-r="msg" role="status"></p>`; return; }
  if (ST.mg === "ren" && cur) { box.hidden = false; box.innerHTML = `<h3>تعديل اسم القائمة</h3><div class="r"><input id="szln" maxlength="40" value="${esc(cur.name)}" aria-label="اسم القائمة"><button type="button" class="fzt p" data-a="mkren">حفظ الاسم</button><button type="button" class="fzt" data-a="mgx">إلغاء</button></div><p class="m" data-r="msg" role="status"></p>`; return; }
  if (ST.mg === "del" && cur) { box.hidden = false; box.innerHTML = `<h3>حذف القائمة «${esc(cur.name)}»؟</h3><p class="m">سيُحذف اسم القائمة فقط، ويبقى المحتوى محفوظًا في «كل المحفوظات». لا يمكن التراجع.</p><div class="r"><button type="button" class="fzt p" data-a="mkdel">نعم، احذف القائمة</button><button type="button" class="fzt" data-a="mgx">إلغاء</button></div>`; return; }
  if (cur) { box.hidden = false; box.innerHTML = `<div class="r"><b>${esc(cur.name)}</b><button type="button" class="fzt" data-a="ren">تعديل الاسم</button><button type="button" class="fzt" data-a="del">حذف القائمة</button></div>`; return; }
  box.hidden = true; box.innerHTML = "";
}
function drawFilters(all) {
  const scope = all.filter((r) => !ST.list || r.lists.includes(ST.list)), cts = Z.CTK.filter((c) => scope.some((r) => r.ct === c)), doms = [...new Set(scope.map((r) => r.dom).filter(Boolean))];
  const f = $("#szf"), tg = $("#szftog"); tg.setAttribute("aria-expanded", String(ST.open)); f.hidden = !ST.open;
  tg.hidden = !(cts.length > 1 || doms.length > 1 || ST.ct.size || ST.dom.size);
  if (!ST.open) return;
  const chips = (kind, vals, name) => vals.length ? `<fieldset><legend>${kind === "ct" ? "نوع المحتوى" : "المجال"}</legend><div class="fzchips">${vals.map((v) => `<button type="button" class="fzchip${ST[kind].has(v) ? " on" : ""}" data-f="${kind}" data-v="${esc(v)}" aria-pressed="${ST[kind].has(v)}">${esc(name(v))}</button>`).join("")}</div></fieldset>` : "";
  f.innerHTML = chips("ct", cts, (v) => Z.CT[v]) + chips("dom", doms, (v) => Z.domName(v)) + `<button type="button" class="fzt" data-f="clear">مسح الفلاتر</button>`;
}
function drawAct() {
  const a = []; ST.ct.forEach((c) => a.push(["ct", c, Z.CT[c]])); ST.dom.forEach((d) => a.push(["dom", d, Z.domName(d)]));
  $("#szact").innerHTML = a.map(([k, v, n]) => `<button type="button" class="fzx" data-rm="${k}" data-v="${esc(v)}" aria-label="إلغاء الفلتر: ${esc(n)}">${esc(n)}</button>`).join("") + (a.length ? `<button type="button" class="fzt" data-f="clear">مسح الفلاتر</button>` : "");
}
function drawBulk(list) {
  const b = $("#szbulk"); b.hidden = !ST.sel; $("#szsel").setAttribute("aria-pressed", String(ST.sel)); $("#szsel").textContent = ST.sel ? "إنهاء التحديد" : "تحديد عدة عناصر";
  if (!ST.sel) { b.innerHTML = ""; return; }
  const n = [...ST.picked].filter((k) => list.some((r) => r.key === k)).length, ls = S.lists();
  b.innerHTML = `<b>${n ? "محدد: " + AD(n) : "اختر عناصر من البطاقات"}</b><button type="button" data-a="all">تحديد الكل</button><select id="szmv" aria-label="نقل إلى قائمة"><option value="">القائمة العامة فقط</option>${ls.map((l) => `<option value="${esc(l.id)}">${esc(l.name)}</option>`).join("")}</select><button type="button" data-a="mv"${n ? "" : " disabled"}>نقل المحدد</button><button type="button" class="dg" data-a="rmsel"${n ? "" : " disabled"}>إزالة المحدد</button>`;
}
function render() {
  const all = recs(); $("#szcount").textContent = READY ? (all.length ? (all.length === 1 ? "عندك عنصر واحد محفوظ" : "عدد العناصر المحفوظة: " + AD(all.length)) : "") : "";
  if (ST.list && !S.lists().some((l) => l.id === ST.list)) ST.list = "";
  drawLists(all); drawMg(); drawFilters(all); drawAct();
  const list = visible(all); ST.picked = new Set([...ST.picked].filter((k) => all.some((r) => r.key === k))); drawBulk(list);
  const warn = READY && X.failed.length ? `<div class="fzwarn" role="alert">تعذّر تحميل بعض الأقسام، فقد لا تظهر بعض بياناتك كاملة. أعد المحاولة لاحقًا.</div>` : "";
  let h;
  if (!READY) h = `<div class="fzgrid"><div class="fzsk"></div><div class="fzsk"></div><div class="fzsk"></div></div>`;
  else if (!all.length) h = `<div class="fzempty"><img src="${ROOT}images/zad/i_star.webp" alt=""><h3>لم تحفظ أي محتوى بعد. استكشف المكتبة وأضف الأنشطة التي تعجبك</h3><p><a class="fzt p" href="${ROOT}library/">استكشف المكتبة</a> <a class="fzt" href="${ROOT}find/">ابحث في المكتبة</a></p></div>`;
  else if (!list.length) h = `<div class="fzempty"><h3>${ST.list && !ST.ct.size && !ST.dom.size ? "هذه القائمة فارغة" : "لا توجد عناصر تطابق الفلاتر"}</h3><p>${ST.list && !ST.ct.size && !ST.dom.size ? "انقل إليها محتوى من «كل المحفوظات» بزر «تحديد عدة عناصر»." : "غيّر الفلاتر أو امسحها."}</p>${ST.ct.size || ST.dom.size ? `<button type="button" class="fzt p" data-f="clear">مسح الفلاتر</button>` : ""}</div>`;
  else h = `<div class="fzgrid">${list.map(card).join("")}</div>`;
  $("#szres").innerHTML = warn + h;
}
const change = (fn) => { fn(); render(); };

/* ---------- الأحداث ---------- */
D.addEventListener("click", (e) => {
  const t = e.target.closest("button,input,a"); if (!t || t.tagName === "A") return;
  if (t.dataset.l !== undefined && t.closest("#szlists")) return change(() => { ST.list = t.dataset.l; ST.mg = ""; ST.picked.clear(); });
  const a = t.dataset.a;
  if (a === "newlist") return change(() => { ST.mg = "new"; }) || ($("#szln") && $("#szln").focus());
  if (a === "ren") { ST.mg = "ren"; render(); return $("#szln").focus(); } if (a === "del") return change(() => { ST.mg = "del"; }); if (a === "mgx") return change(() => { ST.mg = ""; });
  if (t.dataset.sg) { $("#szln").value = t.dataset.sg; return $("#szln").focus(); }
  if (a === "mknew") { const r = S.createList($("#szln").value); if (!r.ok) { const m = $("#szlmg [data-r=msg]"); m.className = "m bad"; m.textContent = r.msg; return; } ST.list = r.id; ST.mg = ""; render(); return S.toast(r.msg); }
  if (a === "mkren") { const r = S.renameList(ST.list, $("#szln").value); if (!r.ok) { const m = $("#szlmg [data-r=msg]"); m.className = "m bad"; m.textContent = r.msg; return; } ST.mg = ""; render(); return S.toast(r.msg); }
  if (a === "mkdel") { S.deleteList(ST.list); ST.list = ""; ST.mg = ""; render(); return S.toast("حُذفت القائمة وبقي المحتوى محفوظًا"); }
  if (t.id === "szftog") return change(() => { ST.open = !ST.open; });
  if (t.id === "szsel") return change(() => { ST.sel = !ST.sel; ST.picked.clear(); });
  if (t.dataset.f === "clear") return change(() => { ST.ct.clear(); ST.dom.clear(); });
  if (t.dataset.f && t.dataset.v) return change(() => { const s = ST[t.dataset.f]; if (s.has(t.dataset.v)) s.delete(t.dataset.v); else s.add(t.dataset.v); });
  if (t.dataset.rm) return change(() => { ST[t.dataset.rm].delete(t.dataset.v); });
  if (a === "all") return change(() => { visible(recs()).forEach((r) => ST.picked.add(r.key)); });
  if (a === "mv") { const keys = [...ST.picked], id = $("#szmv").value; S.moveMany(keys, id); const nm = id ? (S.lists().find((l) => l.id === id) || {}).name : "القائمة العامة"; ST.picked.clear(); render(); return S.toast("نُقل " + AD(keys.length) + " إلى «" + nm + "»"); }
  if (a === "rmsel") { const n = S.removeMany([...ST.picked]); ST.picked.clear(); render(); return S.toast("أُزيل " + AD(n) + " من المحفوظات"); }
  const c = t.closest(".fzcard"); if (!c) return; const k = c.dataset.k;
  if (a === "pick") return change(() => { if (t.checked) ST.picked.add(k); else ST.picked.delete(k); });
  if (a === "rm") { S.unsave(k); render(); return S.toast("أُزيل من المحفوظات"); }
  const r = recs().find((x) => x.key === k);
  if (a === "plan" && r && r.it) { const old = $(".fzplan", c); if (old) { old.remove(); return; } c.insertAdjacentHTML("beforeend", planBox()); const s = $(".fzplan select,.fzplan a", c); if (s) s.focus(); return; }
  if (a === "plancancel") { const b = $(".fzplan", c); if (b) b.remove(); return; }
  if (a === "planok" && r && r.it) { const msg = $("[data-r=msg]", c), e2 = S.addToPlan(r.it, $("[data-r=day]", c).value, "نشاط اخترته من «محتواي المحفوظ»."); msg.className = "m " + (e2 ? "bad" : "ok"); msg.innerHTML = e2 ? esc(e2) : `تمت الإضافة إلى خطتك (المحفوظ ليس منجزًا بعد). <a href="${ROOT}plan/">فتح خطتي</a>`; }
});
D.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target.id === "szln") { e.preventDefault(); const b = $("#szlmg [data-a=mknew],#szlmg [data-a=mkren]"); if (b) b.click(); } });
$("#szsort").addEventListener("change", () => change(() => { ST.sort = $("#szsort").value; }));
window.addEventListener("zad-saved", () => { if (READY) render(); });

/* ---------- تسجيل أخطاء الروابط (نص المفتاح فقط، دون أي معرّف) ---------- */
function logGone(all) {
  all.filter((r) => r.st === "gone").forEach((r) => { try { const k = "zad-sv-err:" + r.key; if (sessionStorage.getItem(k)) return; sessionStorage.setItem(k, "1"); fetch(SB + "/rest/v1/pf_errors", { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ kind: "saved-link", msg: r.key.slice(0, 200) }) }).catch(() => {}); } catch (e) { /* */ } });
}

render();
/* الحزم التعليمية الجاهزة: تُحفظ بمفتاح pack:slug وتُعرض هنا إن كانت منشورة وجاهزة */
async function loadPacks() {
  Z.CT.pack = "حزم تعليمية"; if (!Z.CTK.includes("pack")) Z.CTK.push("pack");
  try {
    const P = window.ZPACKS; if (!P) throw new Error("no packs"); const ps = await P.load();
    ps.forEach((p) => { const r = P.resolve(p, Z); if (r.items.length < P.MIN_READY) return; live.set("pack:" + p.slug, { key: "pack:" + p.slug, src: "pack", slug: p.slug, title: p.title, ct: "pack", dom: p.dom, lv: p.levels, img: p.cover, paid: false, price: 0, hidden: false, url: "packs/view/?p=" + encodeURIComponent(p.slug), icon: null }); });
  } catch (e) { X.failed.push("pack"); }
}
Promise.all([Z.load().catch(() => null), S.ready()]).then(() => loadPacks()).then(() => {
  X.all.forEach((i) => live.set(i.key, i)); FAILED = X.failed.length > 0;
  S.migrate(X.items);
  if (!FAILED) { const m = {}; X.items.forEach((i) => { m[i.key] = i; }); live.forEach((i, k) => { if (i.src === "pack") m[k] = i; }); S.refresh(m); }
  READY = true; render(); if (!FAILED) logGone(recs());
});
})();
