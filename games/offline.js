/* زاد بلا إنترنت — إدارة تجهيز الألعاب المجانية للعمل دون اتصال
   الفكرة: Service Worker يخدم الملفات من Cache Storage، وهذه الصفحة تنزّل الحزمة وتحذفها وتحدّثها. */
(() => {
  "use strict";
  const PACK = "zad-pack-", LS = "zad_off";
  const SECTIONS = [["a2", "🍼", "سنة إلى سنتين", 6], ["a3", "🧸", "3 سنوات", 7], ["a4", "🎈", "4 سنوات", 7], ["a5", "✏️", "5 سنوات", 8], ["a6", "🎒", "6 سنوات", 9], ["g1", "1️⃣", "الصف الأول", 13], ["g2", "2️⃣", "الصف الثاني", 14], ["g3", "3️⃣", "الصف الثالث", 14], ["g4", "4️⃣", "الصف الرابع", 12]];
  const $ = (s, r = document) => r.querySelector(s);
  const AD = (n) => String(n).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
  const mb = (b) => AD((b / 1048576).toFixed(b < 1048576 ? 2 : 1)).replace(".", "٫") + " ميجابايت";
  const conf = () => { try { return JSON.parse(localStorage.getItem(LS) || "{}"); } catch { return {}; } };
  const save = (o) => { try { localStorage.setItem(LS, JSON.stringify(Object.assign(conf(), o))); } catch {} };
  const supported = "serviceWorker" in navigator && "caches" in window;

  const S = { online: navigator.onLine, ver: null, man: null, state: "none" /* none | partial | ready | busy */, done: 0, total: 0, latest: null, err: "" };
  const base = new URL("./", location.href);
  const abs = (u) => new URL(u, base).href;

  async function packNames() { return (await caches.keys()).filter((n) => n.startsWith(PACK)); }
  async function readStatus() {
    if (!supported) { S.state = "none"; return; }
    const names = await packNames();
    if (!names.length) { S.state = S.state === "busy" ? "busy" : "none"; S.ver = null; return; }
    const name = names.sort().pop(), c = await caches.open(name);
    S.ver = name.slice(PACK.length);
    const done = !!(await c.match("zad-complete"));
    if (S.state !== "busy") S.state = done ? "ready" : "partial";
  }
  async function fetchManifest() {
    try { const r = await fetch("offline.json", { cache: "no-store" }); if (!r.ok) throw 0; S.man = await r.json(); S.latest = S.man.version; save({ man: S.man.version, size: S.man.total }); return S.man; } catch { return null; }
  }
  const updAvail = () => S.state === "ready" && S.latest && S.ver && S.latest !== S.ver;

  const VB = "https://zcnwzpevehudhnsuljdy.supabase.co/storage/v1/object/public/wiam/";
  async function vhash(t) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hala1|" + t)); return [...new Uint8Array(b)].slice(0, 12).map((x) => x.toString(16).padStart(2, "0")).join(""); }
  async function voicePack() {
    try {
      const r = await fetch("_phrases.json", { cache: "no-cache" }); if (!r.ok) return;
      const list = await r.json(), vc = await caches.open("zad-voice"), q = list.slice();
      const w = async () => { while (q.length) { try { const u = VB + (await vhash(q.shift())) + ".mp3"; if (!(await vc.match(u))) { const x = await fetch(u); if (x.ok) await vc.put(u, x); } } catch {} } };
      await Promise.all(Array.from({ length: 4 }, w));
    } catch {}
  }
  async function download(isUpdate) {
    if (!supported || S.state === "busy") return;
    if (!navigator.onLine) { toast("نحتاج إنترنت لتجهيز الألعاب. جرّب عندما تتصل 🌐"); return; }
    const man = (await fetchManifest()) || S.man; if (!man) { toast("لم نتمكن من التجهيز الآن. حاول بعد قليل 🙏"); return; }
    S.state = "busy"; S.done = 0; S.total = man.files.length; S.err = ""; render();
    const name = PACK + man.version, oldNames = (await packNames()).filter((n) => n !== name);
    try {
      const c = await caches.open(name); await c.delete("zad-complete");
      const queue = man.files.slice(); let failed = 0;
      const worker = async () => {
        while (queue.length) {
          const f = queue.shift(), url = abs(f.u);
          if (await c.match(url)) { S.done++; tick(); continue; }
          let ok = false;
          for (let i = 0; i < 3 && !ok; i++) { try { const r = await fetch(url, { cache: "reload" }); if (r.ok) { await c.put(url, r); ok = true; } } catch {} }
          if (!ok) failed++; S.done++; tick();
        }
      };
      await Promise.all(Array.from({ length: 6 }, worker));
      if (failed) throw new Error("incomplete");
      await c.put("zad-complete", new Response(man.version));
      await Promise.all(oldNames.map((n) => caches.delete(n)));
      S.ver = man.version; S.state = "ready"; save({ ver: man.version, at: Date.now(), deleted: false });
      try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch {}
      toast(isUpdate ? "تم تحديث الألعاب ✅" : "الألعاب جاهزة للعب بلا إنترنت ✈️");
      voicePack();
    } catch {
      S.state = "partial"; S.err = "لم يكتمل التنزيل. اضغط «أكمل التنزيل» عند توفر الإنترنت.";
      toast("لم يكتمل تجهيز الألعاب، سنكمله عندما يتحسن الاتصال 🙏");
    }
    render();
  }
  async function remove() {
    const names = await packNames(); await Promise.all(names.map((n) => caches.delete(n))); caches.delete("zad-voice");
    S.state = "none"; S.ver = null; save({ deleted: true }); toast("حُذفت ملفات الألعاب من الجهاز. تقدّمك محفوظ ✅"); render();
  }

  /* ---------- واجهة ---------- */
  let toastT = 0;
  function toast(msg) {
    const old = $(".zo-toast"); old && old.remove(); const t = document.createElement("div"); t.className = "zo-toast"; t.setAttribute("role", "status"); t.textContent = msg; document.body.appendChild(t);
    clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 4200);
  }
  function summary() {
    if (!supported) return { cls: "", ic: "ℹ️", short: "متصفحك لا يدعم العمل بلا إنترنت", t: "هذا المتصفح لا يدعم الألعاب بلا إنترنت", d: "جرّب متصفحاً حديثاً مثل كروم أو سفاري." };
    if (S.state === "busy") return { cls: "", ic: "⏳", short: `نجهّز الألعاب ${AD(Math.round(S.done / Math.max(1, S.total) * 100))}٪`, t: "نجهّز الألعاب…", d: "لا تغلق الصفحة حتى ننتهي." };
    if (updAvail()) return { cls: "upd", ic: "🔄", short: "توجد تحديثات للألعاب", t: S.online ? "توجد تحديثات متاحة" : "ألعابك جاهزة", d: S.online ? "اضغط «حدّث الألعاب». تقدّمك ونجومك محفوظة." : "ستظهر التحديثات عند عودة الإنترنت." };
    if (S.state === "ready") return S.online ? { cls: "on", ic: "🟢", short: "متصل · الألعاب جاهزة بلا إنترنت", t: "متصل بالإنترنت", d: "ألعابك جاهزة، تستطيع اللعب في أي مكان بلا إنترنت ✈️" } : { cls: "off", ic: "✈️", short: "بلا إنترنت · الألعاب جاهزة", t: "لا يوجد إنترنت، لا بأس!", d: "ألعابك جاهزة وتعمل بلا إنترنت 🎈" };
    if (S.state === "partial") return { cls: "off", ic: "📥", short: "بقي تنزيل بعض الملفات", t: "التنزيل لم يكتمل", d: S.online ? "اضغط «أكمل التنزيل»." : "عندما يعود الإنترنت سنكمل التجهيز." };
    return S.online ? { cls: "", ic: "🟢", short: "متصل · جهّز الألعاب بلا إنترنت", t: "متصل بالإنترنت", d: "نزّل الألعاب مرة واحدة وتعلّم بعدها بلا إنترنت." } : { cls: "off", ic: "📡", short: "بلا إنترنت · نحتاج تجهيز الألعاب", t: "لا يوجد إنترنت الآن", d: "الألعاب تحتاج تجهيزاً لمرة واحدة عند توفر الإنترنت." };
  }
  function render() {
    document.body.dataset.zo = S.state === "ready" ? "ready" : "";
    let p = $("#zo-pill"); if (!p) { p = document.createElement("button"); p.id = "zo-pill"; p.type = "button"; p.onclick = openPanel; document.body.appendChild(p); }
    const s = summary(); p.className = s.cls; p.innerHTML = `<i>${s.ic}</i><span>${s.short}</span>`;
    const b = $("#zo-banner"); if (b) bannerFill(b);
    if ($("#zo-panel")) panelFill();
  }
  function bannerFill(b) { const s = summary(); b.innerHTML = `<span class="zi">✈️</span><span><b>زاد بلا إنترنت</b><small>مع زاد، التعلّم يرافقك أينما ذهبت · ${s.short}</small></span><span class="zb">ألعابي المحمّلة</span>`; }
  function injectBanner() {
    const app = $("#app"); if (!app) return; const h = $(".hm-head", app);
    if (h && !$("#zo-banner", app)) { const b = document.createElement("button"); b.id = "zo-banner"; b.type = "button"; b.onclick = openPanel; bannerFill(b); h.insertAdjacentElement("afterend", b); }
  }
  function openPanel() {
    if ($("#zo-panel")) return; const d = document.createElement("div"); d.id = "zo-panel"; d.setAttribute("role", "dialog"); d.setAttribute("aria-label", "ألعابي المحمّلة"); document.body.appendChild(d); document.body.style.overflow = "hidden";
    panelFill(); fetchManifest().then(() => { render(); });
  }
  function closePanel() { const d = $("#zo-panel"); d && d.remove(); document.body.style.overflow = ""; }
  let confirmDel = false;
  function panelFill() {
    const d = $("#zo-panel"); if (!d) return; const s = summary(), size = S.man ? S.man.total : (conf().size || 0), ready = S.state === "ready", busy = S.state === "busy";
    const pct = Math.round(S.done / Math.max(1, S.total) * 100);
    const main = busy ? "" : ready ? (updAvail() ? `<button class="zo-b" id="zo-do" ${S.online ? "" : "disabled"}>🔄 حدّث الألعاب</button><button class="zo-b g" id="zo-re" ${S.online ? "" : "disabled"}>إعادة التنزيل</button>` : `<button class="zo-b g" id="zo-re" ${S.online ? "" : "disabled"}>🔁 إعادة التنزيل</button>`) : `<button class="zo-b" id="zo-do" ${S.online ? "" : "disabled"}>${S.state === "partial" ? "📥 أكمل التنزيل" : "📥 نزّل الألعاب"}</button>`;
    const del = (ready || S.state === "partial") && !busy ? `<button class="zo-b d" id="zo-del">🗑️ حذف الملفات من الجهاز</button>` : "";
    d.innerHTML = `<div class="zp"><div class="zo-top"><button class="zo-x" id="zo-close">✕ إغلاق</button><span></span></div>
      <div class="zo-hero"><div class="zi">✈️</div><h1>زاد بلا إنترنت</h1><p>مع زاد، التعلّم يرافقك أينما ذهبت</p></div>
      <div class="zo-card"><div class="zo-st"><span class="zi">${s.ic}</span><span><b>${s.t}</b><small>${s.d}</small></span></div>
        ${busy ? `<div class="zo-bar"><i style="width:${pct}%"></i></div><small class="zo-note">${AD(pct)}٪ · لا تغلق الصفحة</small>` : ""}
        ${confirmDel ? `<div class="zo-confirm">سنحذف ملفات الألعاب (${mb(size)}) من هذا الجهاز لتوفير المساحة. نجومك وتقدّمك لن تُحذف، ويمكنك تنزيل الألعاب مرة أخرى متى شئت.<div class="zo-btns"><button class="zo-b d" id="zo-del2">نعم، احذفها</button><button class="zo-b g" id="zo-no">لا، ابقِها</button></div></div>` : `<div class="zo-btns">${main}${del}</div>`}
        ${S.err ? `<p class="zo-note">${S.err}</p>` : ""}
      </div>
      <div class="zo-card"><h2>ألعابي المحمّلة</h2>
        ${SECTIONS.map(([id, e, n, c]) => `<div class="zo-row"><span class="e">${e}</span><span class="t"><b>${n}<span class="zo-chip ${ready ? "ok" : "no"}">${ready ? "جاهزة بلا إنترنت ✓" : "تحتاج تنزيل"}</span></b><small>${AD(c)} ${c > 10 ? "لعبة" : "ألعاب"}</small></span><button class="zo-play" data-p="${id}">▶ تشغيل</button></div>`).join("")}
        <p class="zo-note">حجم الملفات على جهازك: ${ready || S.state === "partial" ? mb(size) : "لم تُنزَّل بعد (" + (size ? mb(size) : "حزمة صغيرة") + ")"}. ملفات الألعاب مشتركة بين كل الأعمار والصفوف، لذلك تُنزَّل وتُحذف معاً.</p>
      </div>
      <div class="zo-card"><h2>معلومات مفيدة</h2><p class="zo-note">• تقدّمك ونجومك محفوظة على هذا الجهاز حتى بعد إغلاق الموقع.<br>• للحصول على أفضل تجربة أضف الموقع إلى الشاشة الرئيسية من قائمة المتصفح.<br>• التحديثات لا تُنزَّل إلا بموافقتك.</p></div></div>`;
    $("#zo-close", d).onclick = closePanel;
    const q = (id, fn) => { const b = $(id, d); b && (b.onclick = fn); };
    q("#zo-do", () => download(updAvail())); q("#zo-re", () => download(false));
    q("#zo-del", () => { confirmDel = true; panelFill(); }); q("#zo-no", () => { confirmDel = false; panelFill(); }); q("#zo-del2", () => { confirmDel = false; remove(); });
    d.querySelectorAll("[data-p]").forEach((b) => (b.onclick = () => play(b.dataset.p)));
  }
  async function play(id) {
    closePanel();
    for (let i = 0; i < 5; i++) {
      const c = $(`.catcard[data-c="${id}"]`); if (c) { c.click(); return; }
      const bk = $("#back"); if (!bk) return; bk.click(); await new Promise((r) => setTimeout(r, 600));
    }
  }
  function tick() { const f = $("#zo-panel .zo-bar i"); const p = $("#zo-pill span"); const pct = Math.round(S.done / Math.max(1, S.total) * 100); if (f) { f.style.width = pct + "%"; const n = $("#zo-panel .zo-note"); n && (n.textContent = AD(pct) + "٪ · لا تغلق الصفحة"); } if (p) p.textContent = `نجهّز الألعاب ${AD(pct)}٪`; }

  /* ---------- الاتصال ---------- */
  function setOnline(v) {
    if (S.online === v) return; S.online = v; render();
    if (v) {
      toast(S.state === "ready" ? "عاد الإنترنت 🌐" : "عاد الإنترنت، لنجهّز الألعاب 🌐");
      fetchManifest().then(() => { render(); autoPrepare(); }); navigator.serviceWorker && navigator.serviceWorker.controller && navigator.serviceWorker.controller.postMessage("flush");
    } else toast(S.state === "ready" ? "لا يوجد إنترنت، لا بأس! ألعابك جاهزة 🎈" : "لا يوجد إنترنت الآن 📡");
  }
  addEventListener("online", () => setOnline(true)); addEventListener("offline", () => setOnline(false));

  function autoPrepare() {
    if (!supported || !navigator.onLine || S.state === "busy" || S.state === "ready" || conf().deleted) return;
    const c = navigator.connection; if (c && (c.saveData || /2g/.test(c.effectiveType || ""))) return;
    download(false);
  }

  async function init() {
    if (supported) {
      try { await navigator.serviceWorker.register("sw.js"); await navigator.serviceWorker.ready; } catch {}
    }
    await readStatus(); render();
    new MutationObserver(injectBanner).observe($("#app"), { childList: true }); injectBanner();
    if (navigator.onLine) { await fetchManifest(); await readStatus(); render(); setTimeout(autoPrepare, 1500); }
    window.__zo = { S, download, remove, readStatus, render };
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
