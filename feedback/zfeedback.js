/* إرسال ملاحظة حول المحتوى — لولي الأمر. بلا حساب وبلا بيانات شخصية:
   المورد يُحدَّد تلقائيًا من الصفحة، ويتحقق الخادم أنه منشور ومن نطاق الأعمار/الصفوف المعتمدة.
   لا تظهر رسالة نجاح إلا بعد أن يرجع الخادم رقمًا مرجعيًا حقيقيًا. التكرار غير المقصود يمنعه رمز عملية ثابت لكل نافذة + قفل الزر. */
(function (W, D) {
"use strict";
if (W.ZFEEDBACK) return;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_ANON || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpjbnd6cGV2ZWh1ZGhuc3VsamR5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwNDc4MDIsImV4cCI6MjEwNzYyMzgwMn0.WNr3b4xybHT7bb7Z0lnDHJq3QimA5-Ds9x-Pwic5840";
const PAGES = [["activities/view/", "a", "acts"], ["bank/play/", "s", "bank"], ["projects/play/", "s", "proj"], ["life/play/", "s", "life"], ["ready/play/", "s", "ready"], ["values/play/", "s", "val"], ["explore/play/", "s", "exp"], ["videos/play/", "s", "vid"], ["songs/play/", "s", "songs"], ["stories/read/", "s", "stories"], ["quizzes/quiz/", "q", "quiz"], ["packs/view/", "p", "pack"]];
const KINDS = [["info_error", "خطأ في معلومة تعليمية"], ["answer_error", "خطأ في إجابة أو سؤال"], ["file_link", "مشكلة في ملف أو رابط"], ["print_preview", "مشكلة في الطباعة أو المعاينة"], ["instructions", "صعوبة في فهم التعليمات"], ["age_fit", "عدم مناسبة المورد للعمر أو الصف"], ["design", "مشكلة في التصميم أو عرض المحتوى"], ["suggestion", "اقتراح تطوير المورد"], ["new_content", "طلب إضافة محتوى جديد"], ["other", "ملاحظة أخرى"]];
const STT = { new: "وصلت ولم تُراجع بعد", in_review: "قيد المراجعة", need_info: "تحتاج إلى توضيح إضافي", accepted: "تم قبولها وستُعالج", resolved: "تمت المعالجة", unactionable: "درسناها وتعذّر تنفيذها", duplicate: "دُمجت مع ملاحظة مشابهة" };
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
const rnd = () => { try { const a = new Uint8Array(16); (W.crypto || {}).getRandomValues(a); return Array.from(a, (x) => x.toString(16).padStart(2, "0")).join(""); } catch (e) { let s = ""; for (let i = 0; i < 32; i++) s += Math.floor(Math.random() * 16).toString(16); return s; } };
let MEM_DEV = null;
function devId() { try { let d = localStorage.getItem("zad-fb-dev"); if (!d || d.length < 16) { d = rnd(); localStorage.setItem("zad-fb-dev", d); } return d; } catch (e) { return MEM_DEV || (MEM_DEV = rnd()); } }
function rpc(name, body) {
  return fetch(SB + "/rest/v1/rpc/" + name, { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: JSON.stringify(body) })
    .then((r) => r.json().catch(() => null).then((j) => { if (!r.ok) { const e = new Error((j && j.message) || "تعذّر تنفيذ الطلب"); e.server = true; throw e; } return j; }));
}
const CSS = `.zfb-btn{position:fixed;inset-inline-start:12px;bottom:12px;z-index:40;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:6px 14px;border:1px solid #cfc4ee;border-radius:99px;background:#fff;color:#4a2bb0;font:600 13px/1.2 inherit;font-family:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(30,20,70,.15)}.zfb-btn:hover,.zfb-btn:focus-visible{background:#f3efff;outline:2px solid #5B34D6;outline-offset:2px}
.zfb-btn.inl{position:static;box-shadow:none;margin-top:8px}
.zfb-ov{position:fixed;inset:0;z-index:2000;background:rgba(20,12,50,.45);display:flex;align-items:flex-end;justify-content:center}@media(min-width:600px){.zfb-ov{align-items:center}}
.zfb-d{width:100%;max-width:440px;max-height:92vh;overflow:auto;background:#fff;color:#1B1430;border-radius:16px 16px 0 0;padding:16px;font-family:inherit;box-sizing:border-box}@media(min-width:600px){.zfb-d{border-radius:16px}}
.zfb-d h2{margin:0 0 4px;font-size:17px}.zfb-d .it{margin:0 0 10px;padding:6px 10px;background:#f3efff;border-radius:8px;font-size:14px}.zfb-d label{display:block;margin:10px 0 4px;font-size:14px;font-weight:600}
.zfb-d select,.zfb-d textarea,.zfb-d input{width:100%;box-sizing:border-box;font:inherit;border:1px solid #cfc4ee;border-radius:10px;padding:9px;background:#fff;color:inherit}.zfb-d textarea{min-height:96px;resize:vertical}
.zfb-d .n{font-size:12px;color:#5d5675;margin:4px 0}.zfb-d .err{background:#ffeef0;border:1px solid #f1b3bb;color:#8a1f33;border-radius:10px;padding:8px;margin:8px 0;font-size:14px}.zfb-d .ok{background:#e9f8f0;border:1px solid #a9dcc3;color:#0f5a3a;border-radius:10px;padding:10px;margin:8px 0;font-size:15px}
.zfb-d .ref{display:block;margin:6px 0;font:700 20px/1.2 monospace;letter-spacing:2px;direction:ltr;text-align:center;user-select:all}.zfb-d .row{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.zfb-d .row button{flex:1 1 120px;min-height:44px;border-radius:12px;font:600 15px inherit;font-family:inherit;cursor:pointer;border:1px solid #cfc4ee;background:#fff;color:#4a2bb0}.zfb-d .row .pri{background:#5B34D6;color:#fff;border-color:#5B34D6}.zfb-d .row button[disabled]{opacity:.55;cursor:default}
.zfb-d .lk{background:none;border:0;color:#4a2bb0;text-decoration:underline;font:inherit;cursor:pointer;padding:6px 0}@media print{.zfb-btn,.zfb-ov{display:none!important}}`;
let styled = false;
function style() { if (styled) return; styled = true; const s = D.createElement("style"); s.textContent = CSS; D.head.appendChild(s); }

let cur = null; // { ov, key, title, client, busy, back }
function close() { if (!cur) return; D.removeEventListener("keydown", onKey, true); cur.ov.remove(); const b = cur.back; cur = null; try { if (b && b.focus) b.focus(); } catch (e) { /* */ } }
function onKey(e) {
  if (!cur) return; if (e.key === "Escape") { e.stopPropagation(); if (!cur.busy) close(); return; }
  if (e.key === "Tab") { const f = [...cur.ov.querySelectorAll("button:not([disabled]),select,textarea,input,a[href]")].filter((x) => x.offsetParent !== null); if (!f.length) return; const a = D.activeElement, i = f.indexOf(a); if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); } }
}
function open(key, title) {
  if (cur) return; style(); const back = D.activeElement;
  const ov = D.createElement("div"); ov.className = "zfb-ov"; ov.dir = "rtl";
  cur = { ov, key, title, client: rnd(), busy: false, back };
  ov.innerHTML = `<div class="zfb-d" role="dialog" aria-modal="true" aria-labelledby="zfbh"><h2 id="zfbh">إرسال ملاحظة حول هذا المحتوى</h2><p class="it">${esc(title)}</p>
  <div data-v="form"><label for="zfbk">نوع الملاحظة</label><select id="zfbk"><option value="">اختر نوع الملاحظة…</option>${KINDS.map(([k, l]) => `<option value="${k}">${l}</option>`).join("")}</select>
  <label for="zfbt">وصف مختصر للمشكلة أو الاقتراح</label><textarea id="zfbt" maxlength="1000" placeholder="اكتب ما لاحظته بإيجاز"></textarea><div class="n"><span id="zfbc">١٠٠٠</span> حرفًا متبقيًا. لا تكتب اسم الطفل أو رقم هاتف أو بريدًا إلكترونيًا. لا نطلب أي بيانات شخصية.</div>
  <div id="zfbe" role="alert"></div><div class="row"><button type="button" class="pri" id="zfbs">إرسال</button><button type="button" id="zfbx">إلغاء</button></div>
  <button type="button" class="lk" id="zfbq">لديك رقم مرجعي لملاحظة سابقة؟ تتبّع حالتها</button></div>
  <div data-v="done" hidden></div><div data-v="track" hidden><label for="zfbr">الرقم المرجعي</label><input id="zfbr" dir="ltr" maxlength="12" placeholder="ZF-XXXXXX"><div id="zfbo" role="status"></div><div class="row"><button type="button" class="pri" id="zfbg">عرض الحالة</button><button type="button" id="zfbb">رجوع</button></div></div></div>`;
  D.body.appendChild(ov); D.addEventListener("keydown", onKey, true);
  const $ = (s) => ov.querySelector(s), show = (v) => ov.querySelectorAll("[data-v]").forEach((x) => (x.hidden = x.dataset.v !== v));
  ov.addEventListener("click", (e) => { if (e.target === ov && !cur.busy) close(); });
  $("#zfbx").onclick = () => { if (!cur.busy) close(); };
  $("#zfbt").oninput = (e) => { $("#zfbc").textContent = AD(1000 - e.target.value.length); };
  $("#zfbs").onclick = async () => {
    if (cur.busy) return; const k = $("#zfbk").value, t = $("#zfbt").value.trim(), er = $("#zfbe"); er.innerHTML = "";
    if (!k) { er.innerHTML = '<div class="err">اختر نوع الملاحظة أولًا.</div>'; $("#zfbk").focus(); return; }
    if (t.length < 5) { er.innerHTML = '<div class="err">اكتب وصفًا مختصرًا (5 أحرف على الأقل).</div>'; $("#zfbt").focus(); return; }
    cur.busy = true; const sb = $("#zfbs"); sb.disabled = true; sb.textContent = "جارٍ الإرسال…";
    try {
      const r = await rpc("fb_submit", { p_key: key, p_kind: k, p_body: t, p_client: cur.client, p_dev: devId() });
      if (!r || !r.ref) throw new Error("لم يصل تأكيد من الخادم");
      const d = $("[data-v=done]"); d.innerHTML = `<div class="ok">شكرًا لك، وصلت ملاحظتك إلى فريق زاد وستُراجع.<span class="ref">${esc(r.ref)}</span>احتفظ بهذا الرقم لتتبّع حالة الملاحظة لاحقًا.${r.repeat ? "<br>هذه الملاحظة أُرسلت سابقًا ولم تُسجَّل مرة ثانية." : ""}</div><div class="row"><button type="button" class="pri" id="zfbd">تم</button></div>`;
      show("done"); $("#zfbd").onclick = close; $("#zfbd").focus(); cur.busy = false;
    } catch (e) {
      cur.busy = false; sb.disabled = false; sb.textContent = "إرسال";
      er.innerHTML = `<div class="err">${e && e.server ? esc(e.message) : "تعذّر إرسال الملاحظة. تحقق من الاتصال وحاول مرة ثانية. لم تُحفظ الملاحظة."}</div>`;
    }
  };
  $("#zfbq").onclick = () => { show("track"); $("#zfbr").focus(); };
  $("#zfbb").onclick = () => { show("form"); };
  $("#zfbg").onclick = async () => {
    const ref = $("#zfbr").value.trim().toUpperCase(), o = $("#zfbo"); if (ref.length < 5) { o.innerHTML = '<div class="err">اكتب الرقم المرجعي كما ظهر لك.</div>'; return; }
    try { const r = await rpc("fb_status", { p_ref: ref }); o.innerHTML = r && r.found ? `<div class="ok"><b>${esc(r.item_title || "")}</b><br>الحالة: ${esc(STT[r.status] || r.status)}${r.reply ? "<br>" + esc(r.reply) : ""}</div>` : '<div class="err">لم نجد ملاحظة بهذا الرقم. تأكد من كتابته.</div>'; }
    catch (e) { o.innerHTML = '<div class="err">تعذّر التحقق الآن. حاول لاحقًا.</div>'; }
  };
  setTimeout(() => { const f = $("#zfbk"); if (f) f.focus(); }, 30);
}
/* زر يظهر فقط إن كان المحتوى منشورًا ومن النطاق المعتمد (يتحقق الخادم) */
const OK = new Map();
function check(key) { if (!OK.has(key)) OK.set(key, rpc("fb_item", { p_key: key }).then((r) => (r && r.ok ? { title: r.title } : null)).catch(() => null)); return OK.get(key); }
async function attach(btn, key, fallbackTitle, still) { const r = await check(key); if (still && !still()) return false; if (!r) { btn.hidden = true; return false; } style(); btn.hidden = false; btn.onclick = () => open(key, r.title || fallbackTitle || ""); return true; }
async function floating(key) {
  const r = await check(key); if (!r || D.querySelector(".zfb-btn.fl")) return; style();
  const b = D.createElement("button"); b.type = "button"; b.className = "zfb-btn fl"; b.textContent = "إرسال ملاحظة حول هذا المحتوى"; b.onclick = () => open(key, r.title); D.body.appendChild(b);
}
function detect() {
  const p = location.pathname, q = new URLSearchParams(location.search);
  for (const [path, prm, src] of PAGES) if (p.endsWith("/" + path) || p.endsWith("/" + path.slice(0, -1))) { const s = q.get(prm); return s ? src + ":" + s : null; }
  return null;
}
W.ZFEEDBACK = { open, attach, check };
function init() { const k = detect(); if (k) floating(k); }
if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", init); else init();
})(window, document);
