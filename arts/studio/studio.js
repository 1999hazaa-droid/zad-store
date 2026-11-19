/* استوديو التلوين والرسم - زاد */
(function () {
"use strict";
const D = document, $ = (s) => D.querySelector(s);
const SB = String(window.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const KEY = window.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const COLORS = ["#e11d48", "#f97316", "#facc15", "#22c55e", "#0ea5e9", "#2563eb", "#7c3aed", "#ec4899", "#8b5a2b", "#111827", "#6b7280", "#ffffff", "#fda4af", "#fdba74", "#bef264", "#7dd3fc"];
const W = 900, H = 675, KEYS = "zad-art-works";
const pc = $("#pc"), ol = $("#ol"), px = pc.getContext("2d", { willReadFrequently: true }), ox = ol.getContext("2d", { willReadFrequently: true });
let tool = "fill", size = 14, color = COLORS[0], data = null, cur = null, mask = null, hist = [], drawing = false, last = null, saved = 0;
const msg = (t, bad) => { const m = $("#msg"); m.textContent = t || ""; m.style.color = bad ? "#b3322e" : "#1f7a3a"; };
function whiteAll() { px.fillStyle = "#fff"; px.fillRect(0, 0, W, H); }
function snap() { hist.push(px.getImageData(0, 0, W, H)); if (hist.length > 20) hist.shift(); }
function buildMask() {
  mask = new Uint8Array(W * H); const d = ox.getImageData(0, 0, W, H).data;
  for (let i = 0; i < W * H; i++) mask[i] = d[i * 4 + 3] >= 110 ? 1 : 0;
}
function loadTemplate(t) {
  cur = t; whiteAll(); hist = []; ox.clearRect(0, 0, W, H); mask = new Uint8Array(W * H);
  D.querySelectorAll(".tpl").forEach((b) => b.classList.toggle("on", (b.dataset.id || "") === (t ? t.id : "")));
  if (!t) { return; }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 450" width="${W}" height="${H}">${t.svg}</svg>`;
  const img = new Image();
  img.onload = () => { ox.clearRect(0, 0, W, H); ox.drawImage(img, 0, 0, W, H); const id = ox.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < d.length; i += 4) if (d[i] > 200 && d[i + 1] > 200 && d[i + 2] > 200) d[i + 3] = 0; ox.putImageData(id, 0, 0); buildMask(); };
  img.onerror = () => msg("تعذّر تحميل القالب", true);
  img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
function pos(e) { const r = pc.getBoundingClientRect(); return [Math.floor((e.clientX - r.left) * W / r.width), Math.floor((e.clientY - r.top) * H / r.height)]; }
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function fill(x, y) {
  if (x < 0 || y < 0 || x >= W || y >= H) return; if (mask && mask[y * W + x]) return;
  const img = px.getImageData(0, 0, W, H), d = img.data, i0 = (y * W + x) * 4, sr = d[i0], sg = d[i0 + 1], sb = d[i0 + 2], [nr, ng, nb] = hex(color);
  if (sr === nr && sg === ng && sb === nb) return; snap();
  const stack = [x, y], seen = new Uint8Array(W * H), tol = 40;
  const ok = (p) => !seen[p] && !(mask && mask[p]) && Math.abs(d[p * 4] - sr) + Math.abs(d[p * 4 + 1] - sg) + Math.abs(d[p * 4 + 2] - sb) <= tol;
  while (stack.length) {
    const cy = stack.pop(), cx = stack.pop(); let p = cy * W + cx; if (!ok(p)) continue;
    let l = cx, rr = cx; while (l > 0 && ok(cy * W + l - 1)) l--; while (rr < W - 1 && ok(cy * W + rr + 1)) rr++;
    for (let k = l; k <= rr; k++) { const q = cy * W + k; seen[q] = 1; d[q * 4] = nr; d[q * 4 + 1] = ng; d[q * 4 + 2] = nb; d[q * 4 + 3] = 255; }
    for (const ny of [cy - 1, cy + 1]) { if (ny < 0 || ny >= H) continue; let inRun = false; for (let k = l; k <= rr; k++) { const q = ny * W + k; if (ok(q)) { if (!inRun) { stack.push(k, ny); inRun = true; } } else inRun = false; } }
  }
  px.putImageData(img, 0, 0);
}
function stroke(a, b) { px.strokeStyle = tool === "eraser" ? "#fff" : color; px.lineWidth = size; px.lineCap = px.lineJoin = "round"; px.beginPath(); px.moveTo(a[0], a[1]); px.lineTo(b[0], b[1]); px.stroke(); }
pc.addEventListener("pointerdown", (e) => {
  e.preventDefault(); const p = pos(e);
  if (tool === "fill") { fill(p[0], p[1]); return; }
  snap(); drawing = true; last = p; pc.setPointerCapture(e.pointerId); stroke(p, [p[0] + .01, p[1] + .01]);
});
pc.addEventListener("pointermove", (e) => { if (!drawing) return; e.preventDefault(); const p = pos(e); stroke(last, p); last = p; });
const end = () => { drawing = false; };
pc.addEventListener("pointerup", end); pc.addEventListener("pointercancel", end); pc.addEventListener("pointerleave", end);
function compose(w) {
  const c = D.createElement("canvas"); c.width = w || W; c.height = Math.round((w || W) * H / W); const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(pc, 0, 0, c.width, c.height); x.drawImage(ol, 0, 0, c.width, c.height); return c;
}
/* الواجهة */
function drawPal() { $("#pal").innerHTML = COLORS.map((c) => `<button type="button" class="sw${c === color ? " on" : ""}" data-c="${c}" style="background:${c}" aria-label="لون ${c}"></button>`).join("") + `<label class="sw" style="background:conic-gradient(red,yellow,lime,cyan,blue,magenta,red);position:relative" aria-label="لون مخصص"><input type="color" id="cust" value="${color}" style="opacity:0;position:absolute;inset:0;width:100%;height:100%;cursor:pointer"></label>`; }
function tabs(T) {
  const cats = Object.entries(T.cats); let fc = "";
  const draw = () => {
    $("#tcats").innerHTML = `<button type="button" class="zpill${!fc ? " on" : ""}" data-c="">الكل</button><button type="button" class="zpill" data-blank="1">لوحة بيضاء</button>` + cats.map(([k, v]) => `<button type="button" class="zpill${fc === k ? " on" : ""}" data-c="${k}">${esc(v)}</button>`).join("");
    $("#tpls").innerHTML = T.items.filter((t) => !fc || t.cat === fc).map((t) => `<button type="button" class="tpl${cur && cur.id === t.id ? " on" : ""}" data-id="${t.id}" role="option" aria-label="${esc(t.title)}"><svg viewBox="0 0 600 450" aria-hidden="true">${t.svg}</svg>${esc(t.title)}</button>`).join("");
  };
  draw();
  D.addEventListener("click", (e) => {
    const c = e.target.closest("[data-c]"); if (c && c.closest("#tcats")) { fc = c.dataset.c; draw(); return; }
    if (e.target.closest("[data-blank]")) { loadTemplate(null); msg(""); return; }
    const t = e.target.closest(".tpl"); if (t) { loadTemplate(T.items.find((x) => x.id === t.dataset.id)); msg(""); D.querySelectorAll(".tpl").forEach((b) => b.classList.toggle("on", b === t)); }
  });
}
function mineDraw() {
  let L = []; try { L = JSON.parse(localStorage.getItem(KEYS)) || []; } catch {}
  $("#mine").hidden = !L.length; $("#minel").innerHTML = L.map((w, i) => `<div><img src="${w.img}" alt="عمل محفوظ ${i + 1}"><button type="button" class="tb" data-del="${i}" style="margin-top:4px;width:100%">حذف من جهازي</button></div>`).join("");
}
D.addEventListener("click", (e) => {
  const sw = e.target.closest(".sw[data-c]"); if (sw) { color = sw.dataset.c; if (tool === "eraser") tool = "fill"; setTool(); drawPal(); return; }
  const t = e.target.closest("[data-tool]"); if (t) { tool = t.dataset.tool; setTool(); return; }
  const s = e.target.closest("[data-size]"); if (s) { size = +s.dataset.size; D.querySelectorAll("[data-size]").forEach((b) => b.classList.toggle("on", b === s)); return; }
  const del = e.target.closest("[data-del]"); if (del) { let L = []; try { L = JSON.parse(localStorage.getItem(KEYS)) || []; L.splice(+del.dataset.del, 1); localStorage.setItem(KEYS, JSON.stringify(L)); } catch {} mineDraw(); }
});
D.addEventListener("input", (e) => { if (e.target.id === "cust") { color = e.target.value; if (tool === "eraser") tool = "fill"; setTool(); } });
D.addEventListener("change", (e) => { if (e.target.id === "cust") drawPal(); });
function setTool() { D.querySelectorAll("[data-tool]").forEach((b) => b.classList.toggle("on", b.dataset.tool === tool)); }
$("#undo").onclick = () => { const h = hist.pop(); if (h) px.putImageData(h, 0, 0); else msg("لا يوجد ما يمكن التراجع عنه"); };
$("#clear").onclick = () => { if (!confirm("هل تريد مسح الرسم والبدء من جديد؟")) return; snap(); whiteAll(); msg("تم المسح، يمكنك البدء من جديد."); };
$("#dl").onclick = () => { compose().toBlob((b) => { if (!b) { msg("تعذّر إنشاء الصورة", true); return; } const a = D.createElement("a"); a.href = URL.createObjectURL(b); a.download = "zad-art-" + Date.now() + ".png"; D.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); msg("تم تحميل الصورة."); }, "image/png"); };
$("#save").onclick = () => {
  try { const L = JSON.parse(localStorage.getItem(KEYS) || "[]"); L.unshift({ img: compose(360).toDataURL("image/jpeg", 0.8), t: Date.now() }); localStorage.setItem(KEYS, JSON.stringify(L.slice(0, 8))); msg("تم حفظ عملك على هذا الجهاز فقط."); mineDraw(); }
  catch { msg("تعذّر الحفظ على هذا الجهاز (قد تكون المساحة ممتلئة أو التخزين معطّلًا). يمكنك تحميل الصورة بدلًا من ذلك.", true); }
};
$("#pub").onclick = () => {
  const o = D.createElement("div"); o.className = "zdlg";
  o.innerHTML = `<div role="dialog" aria-modal="true" aria-label="اقتراح العمل للمعرض"><h2 style="font:800 18px var(--z-font);margin:0 0 6px">اقتراح العمل لمعرض إبداعات زاد</h2><p class="tx" style="font-size:14.5px">يُرسل الرسم فقط دون أي اسم أو معلومات شخصية، ولا يظهر في المعرض إلا بعد مراجعته. لا يُنشر شيء تلقائيًا، ويمكنك الاكتفاء بحفظ العمل خاصًا على جهازك.</p><label><input type="checkbox" id="cons"><span>أنا ولي أمر الطفل وأوافق على اقتراح هذا العمل للنشر العام في معرض زاد بعد المراجعة، وأؤكد أنه لا يحتوي على اسم الطفل أو صورته أو معلومات شخصية.</span></label><div class="msg" id="dm"></div><div style="display:flex;gap:8px"><button type="button" class="tb on" id="dsend">إرسال للمراجعة</button><button type="button" class="tb" id="dno">إلغاء، أبقيه خاصًا</button></div></div>`;
  D.body.appendChild(o); $("#dno").onclick = () => o.remove();
  $("#dsend").onclick = async () => {
    const dm = $("#dm"); if (!$("#cons").checked) { dm.style.color = "#b3322e"; dm.textContent = "تلزم موافقة ولي الأمر أولًا."; return; }
    $("#dsend").disabled = true; dm.style.color = "#555"; dm.textContent = "جاري الإرسال…";
    try {
      const img = compose(560).toDataURL("image/jpeg", 0.72);
      const r = await fetch(SB + "/rest/v1/art_gallery", { method: "POST", headers: { apikey: KEY, Authorization: "Bearer " + KEY, "Content-Type": "application/json", Prefer: "return=minimal" }, body: JSON.stringify({ image: img, consent: true, status: "pending", activity_slug: (new URLSearchParams(location.search)).get("a") || null }) });
      if (!r.ok) throw new Error(r.status);
      dm.style.color = "#1f7a3a"; dm.textContent = "تم الإرسال. سيظهر في المعرض فقط بعد المراجعة والموافقة."; setTimeout(() => o.remove(), 2500);
    } catch { dm.style.color = "#b3322e"; dm.textContent = "تعذّر الإرسال الآن. حاول لاحقًا، ولم يُحفظ شيء."; $("#dsend").disabled = false; }
  };
};
whiteAll(); drawPal(); mineDraw();
fetch("../templates.json").then((r) => r.json()).then((T) => { tabs(T); const t = new URLSearchParams(location.search).get("t"); const f = T.items.find((x) => x.id === t); if (f) loadTemplate(f); else loadTemplate(T.items.find((x) => x.id === "fish")); }).catch(() => msg("تعذّر تحميل القوالب. تحقق من الاتصال وأعد المحاولة، ويمكنك الرسم على لوحة بيضاء.", true));
})();
