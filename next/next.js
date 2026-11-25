/* صفحة «ماذا نتعلم بعد ذلك؟»: توصيات + إعدادات ولي الأمر */
(function () {
"use strict";
const D = document, R = window.ZREC; if (!R) return;
const $ = (s, r) => (r || D).querySelector(s), $$ = (s, r) => [...(r || D).querySelectorAll(s)];
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const LK = "zad-learn-v3";
const lget = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
async function draw() {
  const st = R.state(), view = $("#aview"); await R.loadCfg(); const set = R.recSet(st), doms = R.cfg.dom;
  const kids = st.DB ? Object.keys(st.DB.kids) : [];
  const nm = (k) => (st.DB.kids[k].name || (st.DB.kids[k].pf && st.DB.kids[k].pf.nick) || "الطفل " + (kids.indexOf(k) + 1));
  view.innerHTML = `<div class="zbc"><a href="../">الرئيسية</a> › <a href="../library/">المكتبة</a> › ماذا نتعلم بعد ذلك؟</div>
<section class="art"><h1>ماذا نتعلم بعد ذلك؟</h1><p class="hint">اقتراحات من محتوى زاد لطفلك، بحسب عمره أو صفه وما أنجزه فعلًا، وتحت كل اقتراح سببه.</p>
${kids.length > 1 ? `<label class="nxk">الطفل: <select id="nxkid">${kids.map((k) => `<option value="${esc(k)}"${k === st.cur ? " selected" : ""}>${esc(nm(k))}</option>`).join("")}</select></label>` : ""}
${st.lv ? `<p class="hint">المرحلة: <b>${esc(R.LV[st.lv])}</b> · <button type="button" class="abtn" id="nxlv">تغيير</button></p>` : ""}
<div class="rec-mount" id="nxrec"></div></section>
<section class="art nxset"><h2>إعدادات التوصيات</h2>
<fieldset><legend>المجالات المفضلة (تظهر أكثر)</legend>${doms.map((d) => `<label><input type="checkbox" data-p="${esc(d.slug)}" ${set.pref[d.slug] ? "checked" : ""}> ${esc(d.title)}</label>`).join("") || '<p class="hint">تعذر تحميل المجالات الآن.</p>'}</fieldset>
<fieldset><legend>مجالات لا أريد عرضها</legend>${doms.map((d) => `<label><input type="checkbox" data-o="${esc(d.slug)}" ${set.off[d.slug] ? "checked" : ""}> ${esc(d.title)}</label>`).join("")}</fieldset>
<label>مستوى تنوع الأنشطة <select id="nxvar"><option value="low"${set.variety === "low" ? " selected" : ""}>قليل (أنواع متقاربة)</option><option value="mid"${set.variety === "mid" ? " selected" : ""}>متوسط</option><option value="high"${set.variety === "high" ? " selected" : ""}>عالٍ (أنواع مختلفة)</option></select></label>
<label><input type="checkbox" id="nxper" ${set.personal ? "checked" : ""}> توصيات شخصية من تقدم الطفل (عند الإيقاف تظهر اقتراحات عامة بحسب العمر فقط)</label>
<div class="btns"><button class="abtn go" type="button" id="nxsave">حفظ الإعدادات</button><button class="abtn qzdanger" type="button" id="nxreset">إعادة ضبط التوصيات</button></div><p class="hint" id="nxm" role="status"></p>
<p class="hint">تُحسب التوصيات على جهازك من سجلات طفلك، ولا تُنشر ولا تقارنه بغيره ولا تُشارك مع أحد. «ليس الآن» يخفي الاقتراح اليوم فقط، و«إخفاء» يخفيه حتى إعادة الضبط.</p></section>`;
  if (st.lv) R.mount($("#nxrec"), { max: 6 }); else R.mount($("#nxrec"), { max: 6 });
  const kid = $("#nxkid"); if (kid) kid.onchange = () => { const DB = lget(LK, {}); DB.cur = kid.value; localStorage.setItem(LK, JSON.stringify(DB)); location.reload(); };
  const lvb = $("#nxlv"); if (lvb) lvb.onclick = () => { try { localStorage.removeItem("zad-rec-lv"); } catch {} const s2 = R.state(); if (s2.kid) { const DB = lget(LK, {}); const k = DB.kids[DB.cur]; k.pf = k.pf || {}; delete k.pf.lv; k.age = ""; localStorage.setItem(LK, JSON.stringify(DB)); } location.reload(); };
  $("#nxsave").onclick = () => { const s2 = R.recSet(R.state()); s2.pref = {}; s2.off = {}; $$("[data-p]").forEach((x) => { if (x.checked) s2.pref[x.dataset.p] = 1; }); $$("[data-o]").forEach((x) => { if (x.checked) s2.off[x.dataset.o] = 1; }); s2.variety = $("#nxvar").value; s2.personal = $("#nxper").checked ? 1 : 0; R.saveSet(R.state(), s2); $("#nxm").textContent = "تم الحفظ."; R.mount($("#nxrec"), { max: 6 }); };
  $("#nxreset").onclick = () => { if (!confirm("إعادة ضبط التوصيات؟ تعود المخفية وتُمسح تفضيلاتك لهذا الطفل. لا تُحذف أنشطته.")) return; const s2 = R.recSet(R.state()); s2.hide = {}; s2.later = {}; s2.pref = {}; s2.off = {}; s2.variety = "mid"; s2.personal = 1; R.saveSet(R.state(), s2); $("#nxm").textContent = "تمت إعادة الضبط."; setTimeout(() => location.reload(), 500); };
}
draw();
})();
