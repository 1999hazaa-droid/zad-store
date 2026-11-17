/* الاختبارات والتقييمات — منصة زاد التعليمية
   الأسئلة تُقرأ من قاعدة البيانات (المنشورة فقط)، ونتائج الطفل تُحفظ على الجهاز في ملفه (hg_qz) وتظهر في لوحة ولي الأمر.
   يُرسل للخادم عدّاد مجهول فقط (رقم المحاولة والدرجة) بدون أي بيانات عن الطفل. */
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
const app = $("#app");

/* ---------- التصنيفات ---------- */
const LV = [["a2", "سنة إلى سنتين", "i_bottle"], ["a3", "3 سنوات", "i_teddy"], ["a4", "4 سنوات", "i_balloon"], ["a5", "5 سنوات", "i_pencil"], ["a6", "6 سنوات", "i_bag"], ["g1", "الصف الأول", "i_n1"], ["g2", "الصف الثاني", "i_n2"], ["g3", "الصف الثالث", "i_n3"], ["g4", "الصف الرابع", "i_n4"]];
const LVI = Object.fromEntries(LV.map((l, i) => [l[0], i]));
const SUBJ = { ar: ["اللغة العربية", "u_letters", "الحروف والكلمات والقراءة"], math: ["الرياضيات", "u_nums", "الأعداد والعمليات والأشكال"], sci: ["العلوم", "i_microscope", "الكائنات الحية والبيئة والمواد"], gen: ["المهارات العامة", "i_brain", "التفكير والذاكرة والتصنيف"] };
const SUBJ_ORDER = ["ar", "math", "sci", "gen"];
const KIND = { basic: ["تقييم بسيط", "i_star", "يتأكد من فهم المهارة الأساسية"], practice: ["تقييم تدريبي", "i_target", "لتطبيق ما تعلّمته"], full: ["تقييم شامل", "i_trophy", "يجمع عدة مهارات من المادة"] };
const KIND_ORDER = ["basic", "practice", "full"];
const young = (lv) => /^a/.test(lv || "");
const LIBSUB = { ar: "اللغة العربية", math: "الرياضيات", sci: "العلوم", gen: "التفكير" };
const GAMESUB = { ar: ["اللغة العربية", "القراءة والقرآن"], math: ["الرياضيات"], sci: ["العلوم والوقت"], gen: ["الأشكال والتفكير", "مهارات الصغار"] };
const GAMEAGE = { a2: ["١–٤", "١–٢", "١–٣"], a3: ["١–٤", "١–٣", "٣–٤"], a4: ["١–٤", "٤–٦", "٣–٤", "٤–٥"], a5: ["٤–٦", "٥–٦", "٤–٥"], a6: ["٤–٦", "٥–٦", "٦–٧"], g1: ["الأول", "٥–٦", "٦–٧"], g2: ["الثاني"], g3: ["الثالث"], g4: ["الرابع"] };

/* ---------- تخزين ---------- */
const ls = {
  get(k, d) { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  raw(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
};

/* ---------- ملف الطفل (نفس ملفات الألعاب) ---------- */
function kidLoad(id) { const o = ls.get("hg_kid:" + id, null); return o && typeof o === "object" && o.ch ? o : null; }
function kidIds() { const a = ls.get("hg_profiles", []); return (Array.isArray(a) ? a : []).filter((id) => kidLoad(id)); }
function kidStage(k) {
  if (!k) return "";
  if (k.grade >= 1) return "g" + Math.min(4, k.grade);
  const a = k.age || 5; return a <= 2 ? "a2" : a <= 6 ? "a" + a : "g" + Math.min(4, Math.max(1, a - 6));
}
const KID = { id: "", k: null };
function kidBoot() {
  const cur = ls.raw("hg_cur") || "", ids = kidIds();
  if (cur && kidLoad(cur)) { KID.id = cur; KID.k = kidLoad(cur); return; }
  if (ids.length === 1) { KID.id = ids[0]; KID.k = kidLoad(ids[0]); return; }
  KID.id = ""; KID.k = null;
}
function kidSet(id) { const k = kidLoad(id); if (!k) return; KID.id = id; KID.k = k; try { localStorage.setItem("hg_cur", id); } catch (e) { /* */ } }
const RKEY = () => "hg_qz:" + KID.id;
function results() { const o = ls.get(RKEY(), null); return o && Array.isArray(o.at) ? o : { v: 1, at: [] }; }
function bestOf(slug) { let b = null; results().at.forEach((r) => { if (r.q === slug && r.n) { const p = r.s / r.n; if (b === null || p > b.p) b = { p, s: r.s, n: r.n }; } }); return b; }

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
let SNAP = null;
function snapshot() { if (!SNAP) SNAP = fetch("quizzes.json?v=1").then((r) => { if (!r.ok) throw new Error("snap"); return r.json(); }); return SNAP; }
const META = "id,slug,lv,subj,kind,title,skill,diff,intro,n,sort_order,updated_at";
let LIST = null;
function loadList() {
  if (LIST) return Promise.resolve(LIST);
  return api(`quizzes?select=${META}&is_published=eq.true&order=sort_order.asc`)
    .then((rows) => { if (!Array.isArray(rows) || !rows.length) throw new Error("empty"); LIST = rows; ls.set("zad.qz.list", { t: Date.now(), r: rows }); return rows; })
    .catch(() => {
      const c = ls.get("zad.qz.list", null);
      if (c && Array.isArray(c.r) && c.r.length) { LIST = c.r; return LIST; }
      return snapshot().then((all) => { LIST = all.map((q) => { const o = Object.assign({}, q); o.n = (q.data && q.data.qs || []).length; delete o.data; return o; }); return LIST; });
    });
}
const PREV = "__preview";
function loadQuiz(slug) {
  if (slug === PREV) { const q = ls.get("zad.qz.preview", null); return Promise.resolve(q && q.data ? Object.assign({}, q, { slug: PREV, id: null }) : null); }
  return api(`quizzes?select=id,slug,lv,subj,kind,title,skill,diff,intro,data,updated_at&slug=eq.${encodeURIComponent(slug)}&is_published=eq.true`)
    .then((rows) => { if (!rows || !rows[0]) throw new Error("nf"); return rows[0]; })
    .catch(() => snapshot().then((all) => all.find((q) => q.slug === slug) || null));
}

/* ---------- صوت زوزو (نفس صوت الألعاب ونفس الذاكرة المؤقتة) ---------- */
let MUTE = ls.get("zad.qz.mute", false) === true;
const VC = new Map(), AU = new Audio();
let vtok = 0;
function vnorm(t) { return String(t).replace(/<[^>]*>/g, " ").replace(/[«»"“”:؛;…+=*\/()\[\]{}<>|_~^%$#@&`⁦-⁩‎‏]/g, " ").replace(/[^؀-ۿA-Za-z0-9 ،؟.!?,'\-]/g, " ").replace(/\s+/g, " ").trim(); }
function vchunks(t) { if (t.length <= 88) return [t]; const o = []; let c = ""; t.split(/(?<=[.!?؟،,])\s+/).forEach((sn) => { sn.split(" ").forEach((w) => { (c + " " + w).trim().length > 86 ? (c && o.push(c), c = w) : c = (c + " " + w).trim(); }); c.length > 40 && (o.push(c), c = ""); }); c && o.push(c); return o; }
async function vhash(t) { const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("hala1|" + t)); return [...new Uint8Array(b)].slice(0, 12).map((x) => x.toString(16).padStart(2, "0")).join(""); }
function vurl(t) {
  if (VC.has(t)) return VC.get(t);
  const pr = (async () => {
    try {
      const u = SB + "/storage/v1/object/public/wiam/" + await vhash(t) + ".mp3";
      let r = await fetch(u);
      if (!r.ok && navigator.onLine !== false) {
        const g = await fetch(SB + "/functions/v1/wiam-tts", { method: "POST", headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ text: t }) }).then((x) => x.ok ? x.json() : null).catch(() => null);
        if (g && g.url) r = await fetch(g.url);
      }
      if (r && r.ok) return URL.createObjectURL(await r.blob());
    } catch (e) { /* بدون صوت */ }
    return null;
  })();
  VC.set(t, pr); pr.then((v) => { if (!v) VC.delete(t); });
  return pr;
}
function playUrl(u) { return new Promise((res) => { try { AU.onended = AU.onerror = () => res(); AU.src = u; AU.currentTime = 0; const p = AU.play(); if (p && p.catch) p.catch(() => res()); } catch (e) { res(); } }); }
async function say(raw, btn) {
  const tok = ++vtok; stopSay(true);
  if (MUTE) return;
  const t = vnorm(raw || ""); if (!t) return;
  btn && btn.classList.add("on");
  for (const part of vchunks(t)) { const u = await vurl(part); if (tok !== vtok) break; if (u) await playUrl(u); if (tok !== vtok) break; }
  btn && btn.classList.remove("on");
}
async function sayUrl(u, btn) { const tok = ++vtok; stopSay(true); if (MUTE) return; btn && btn.classList.add("on"); await playUrl(u); if (tok === vtok) btn && btn.classList.remove("on"); }
function stopSay(keep) { if (!keep) vtok++; try { AU.pause(); } catch (e) { /* */ } $$(".qp-snd.on").forEach((b) => b.classList.remove("on")); }
let ac = null;
function tone(kind) {
  if (MUTE) return;
  try {
    ac = ac || new (W.AudioContext || W.webkitAudioContext)();
    const notes = kind === "ok" ? [[660, 0], [880, 0.12], [1175, 0.24]] : kind === "end" ? [[523, 0], [659, 0.14], [784, 0.28], [1047, 0.42]] : [[330, 0], [262, 0.16]];
    notes.forEach(([f, d]) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = kind === "no" ? "triangle" : "sine"; o.frequency.value = f; g.gain.setValueAtTime(0.0001, ac.currentTime + d); g.gain.exponentialRampToValueAtTime(kind === "no" ? 0.08 : 0.16, ac.currentTime + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + d + 0.3); o.connect(g).connect(ac.destination); o.start(ac.currentTime + d); o.stop(ac.currentTime + d + 0.32); });
  } catch (e) { /* */ }
}
const SPK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';

/* ---------- الصور والرسوم ---------- */
function src(code) { return /^https?:/.test(code) ? code : IMG(code); }
const COL = { red: "#EF4444", blue: "#3B82F6", green: "#22C55E", yellow: "#FACC15", orange: "#F97316", purple: "#8B5CF6", pink: "#EC4899", brown: "#92400E", black: "#1F2937", white: "#FFFFFF", gray: "#9CA3AF" };
function shapeSVG(name, color) {
  const c = COL[color] || color || "#8B5CF6", s = `fill="${c}" stroke="#2B1B4F" stroke-width="3" stroke-linejoin="round"`;
  const P = {
    circle: `<circle cx="50" cy="50" r="40" ${s}/>`, square: `<rect x="12" y="12" width="76" height="76" ${s}/>`, rect: `<rect x="5" y="25" width="90" height="50" ${s}/>`,
    triangle: `<polygon points="50,8 92,88 8,88" ${s}/>`, oval: `<ellipse cx="50" cy="50" rx="44" ry="28" ${s}/>`, diamond: `<polygon points="50,6 90,50 50,94 10,50" ${s}/>`,
    star: `<polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38" ${s}/>`, heart: `<path d="M50 88 C10 60 6 34 22 22 C36 12 48 22 50 32 C52 22 64 12 78 22 C94 34 90 60 50 88Z" ${s}/>`,
    pentagon: `<polygon points="50,6 93,38 77,90 23,90 7,38" ${s}/>`, hexagon: `<polygon points="27,10 73,10 95,50 73,90 27,90 5,50" ${s}/>`, semicircle: `<path d="M8 70 A42 42 0 0 1 92 70 Z" ${s}/>`,
    cube: `<polygon points="20,35 60,35 60,85 20,85" ${s}/><polygon points="20,35 40,15 80,15 60,35" fill="${c}" stroke="#2B1B4F" stroke-width="3" opacity=".85"/><polygon points="60,35 80,15 80,65 60,85" fill="${c}" stroke="#2B1B4F" stroke-width="3" opacity=".7"/>`,
    cylinder: `<path d="M22 22 v56 a28 10 0 0 0 56 0 v-56" ${s}/><ellipse cx="50" cy="22" rx="28" ry="10" ${s}/>`,
    cone: `<path d="M50 8 L80 78 A30 10 0 0 1 20 78 Z" ${s}/><path d="M20 78 A30 10 0 0 0 80 78" fill="none" stroke="#2B1B4F" stroke-width="3"/>`,
    sphere: `<circle cx="50" cy="50" r="40" ${s}/><ellipse cx="50" cy="50" rx="40" ry="12" fill="none" stroke="#2B1B4F" stroke-width="2" stroke-dasharray="5 4"/>`
  };
  return `<svg class="qv" viewBox="0 0 100 100" role="img" aria-hidden="true">${P[name] || P.circle}</svg>`;
}
function clockSVG(h, m) {
  h = +h; m = +m; const ha = ((h % 12) + m / 60) * 30, ma = m * 6, rad = (a) => (a - 90) * Math.PI / 180;
  let t = ""; for (let i = 1; i <= 12; i++) { const a = rad(i * 30); t += `<text x="${50 + 34 * Math.cos(a)}" y="${50 + 34 * Math.sin(a) + 4}" font-size="11" text-anchor="middle" font-family="Cairo" font-weight="700" fill="#2B1B4F">${i}</text>`; }
  return `<svg class="qv" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff" stroke="#5427D5" stroke-width="5"/>${t}<line x1="50" y1="50" x2="${50 + 22 * Math.cos(rad(ha))}" y2="${50 + 22 * Math.sin(rad(ha))}" stroke="#2B1B4F" stroke-width="5" stroke-linecap="round"/><line x1="50" y1="50" x2="${50 + 32 * Math.cos(rad(ma))}" y2="${50 + 32 * Math.sin(rad(ma))}" stroke="#E11D48" stroke-width="3" stroke-linecap="round"/><circle cx="50" cy="50" r="3.5" fill="#2B1B4F"/></svg>`;
}
function pieSVG(n, d) {
  n = +n; d = +d; let s = "";
  if (d === 1) return `<svg class="qv" viewBox="0 0 100 100"><circle cx="50" cy="50" r="44" fill="${n ? "#8B5CF6" : "#fff"}" stroke="#2B1B4F" stroke-width="3"/></svg>`;
  for (let i = 0; i < d; i++) { const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2; s += `<path d="M50 50 L${50 + 44 * Math.cos(a0)} ${50 + 44 * Math.sin(a0)} A44 44 0 ${1 / d > 0.5 ? 1 : 0} 1 ${50 + 44 * Math.cos(a1)} ${50 + 44 * Math.sin(a1)} Z" fill="${i < n ? "#8B5CF6" : "#fff"}" stroke="#2B1B4F" stroke-width="2.5"/>`; }
  return `<svg class="qv" viewBox="0 0 100 100" aria-hidden="true">${s}</svg>`;
}
function barSVG(n, d) { n = +n; d = +d; const w = 92 / d; let s = ""; for (let i = 0; i < d; i++) s += `<rect x="${4 + i * w}" y="30" width="${w}" height="40" fill="${i < n ? "#F59E0B" : "#fff"}" stroke="#2B1B4F" stroke-width="2.5"/>`; return `<svg class="qv" viewBox="0 0 100 100" aria-hidden="true">${s}</svg>`; }
function tenSVG(n) { n = +n; const fr = Math.ceil(Math.max(n, 1) / 10); let s = ""; for (let f = 0; f < fr; f++) for (let i = 0; i < 10; i++) { const x = 5 + (i % 5) * 18, y = 6 + f * 42 + Math.floor(i / 5) * 18, k = f * 10 + i; s += `<rect x="${x}" y="${y}" width="18" height="18" fill="#fff" stroke="#2B1B4F" stroke-width="1.5"/>${k < n ? `<circle cx="${x + 9}" cy="${y + 9}" r="6.5" fill="#E11D48"/>` : ""}`; } return `<svg class="qv" viewBox="0 0 100 ${fr * 42 + 4}" aria-hidden="true">${s}</svg>`; }
function nlineSVG(a, b, mark) { a = +a; b = +b; const n = b - a, step = 88 / n; let s = `<line x1="4" y1="40" x2="96" y2="40" stroke="#2B1B4F" stroke-width="2"/>`; for (let i = 0; i <= n; i++) { const x = 6 + i * step, v = a + i; s += `<line x1="${x}" y1="34" x2="${x}" y2="46" stroke="#2B1B4F" stroke-width="2"/>`; s += v === +mark ? `<circle cx="${x}" cy="40" r="5" fill="#E11D48"/><text x="${x}" y="62" font-size="9" text-anchor="middle" font-family="Cairo" font-weight="700" fill="#E11D48">؟</text>` : `<text x="${x}" y="62" font-size="8" text-anchor="middle" font-family="Cairo" font-weight="700" fill="#2B1B4F">${v}</text>`; } return `<svg class="qv" viewBox="0 0 100 70" style="width:min(420px,86vw)" aria-hidden="true">${s}</svg>`; }
function angleSVG(deg) { deg = +deg; const r = (a) => a * Math.PI / 180, x = 20 + 70 * Math.cos(r(deg)), y = 80 - 70 * Math.sin(r(deg)); return `<svg class="qv" viewBox="0 0 100 90" aria-hidden="true"><line x1="20" y1="80" x2="95" y2="80" stroke="#2B1B4F" stroke-width="4" stroke-linecap="round"/><line x1="20" y1="80" x2="${x}" y2="${y}" stroke="#2B1B4F" stroke-width="4" stroke-linecap="round"/>${deg === 90 ? `<path d="M20 66 H34 V80" fill="none" stroke="#E11D48" stroke-width="2.5"/>` : `<path d="M38 80 A18 18 0 0 0 ${20 + 18 * Math.cos(r(deg))} ${80 - 18 * Math.sin(r(deg))}" fill="none" stroke="#E11D48" stroke-width="2.5"/>`}</svg>`; }
function areaSVG(w, h) { w = +w; h = +h; const u = Math.min(84 / w, 64 / h); let s = ""; for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) s += `<rect x="${8 + i * u}" y="${8 + j * u}" width="${u}" height="${u}" fill="#DDD6FE" stroke="#5427D5" stroke-width="1.2"/>`; return `<svg class="qv" viewBox="0 0 100 ${16 + h * u}" aria-hidden="true">${s}</svg>`; }
function rectSVG(w, h) { w = +w; h = +h; const k = Math.min(70 / w, 46 / h), W2 = w * k, H2 = h * k, x = (100 - W2) / 2, y = 10; return `<svg class="qv" viewBox="0 0 100 ${H2 + 34}" aria-hidden="true"><rect x="${x}" y="${y}" width="${W2}" height="${H2}" fill="#FEF3C7" stroke="#B45309" stroke-width="2.5"/><text x="50" y="${y + H2 + 14}" font-size="9" text-anchor="middle" font-family="Cairo" font-weight="700" fill="#2B1B4F">${w} سم</text><text x="${x - 3}" y="${y + H2 / 2 + 3}" font-size="9" text-anchor="end" font-family="Cairo" font-weight="700" fill="#2B1B4F">${h} سم</text></svg>`; }
function b10SVG(h, t, o) { h = +h; t = +t; o = +o; let s = "", x = 4; for (let i = 0; i < h; i++) { s += `<rect x="${x}" y="8" width="30" height="30" fill="#93C5FD" stroke="#1D4ED8" stroke-width="1.5"/>`; x += 34; } for (let i = 0; i < t; i++) { s += `<rect x="${x}" y="8" width="6" height="30" fill="#FCD34D" stroke="#B45309" stroke-width="1.2"/>`; x += 9; } for (let i = 0; i < o; i++) { s += `<rect x="${x}" y="${32 - (i % 2) * 8}" width="6" height="6" fill="#86EFAC" stroke="#15803D" stroke-width="1"/>`; if (i % 2) x += 9; } return `<svg class="qv" viewBox="0 0 ${Math.max(100, x + 10)} 46" style="width:min(420px,86vw)" aria-hidden="true">${s}</svg>`; }
function dotsSVG(n) { n = +n; const P = { 1: [[50, 50]], 2: [[28, 28], [72, 72]], 3: [[25, 25], [50, 50], [75, 75]], 4: [[28, 28], [72, 28], [28, 72], [72, 72]], 5: [[28, 28], [72, 28], [50, 50], [28, 72], [72, 72]], 6: [[28, 24], [72, 24], [28, 50], [72, 50], [28, 76], [72, 76]] }; return `<svg class="qv" viewBox="0 0 100 100" aria-hidden="true"><rect x="6" y="6" width="88" height="88" rx="16" fill="#fff" stroke="#2B1B4F" stroke-width="3"/>${(P[n] || []).map(([x, y]) => `<circle cx="${x}" cy="${y}" r="9" fill="#2B1B4F"/>`).join("")}</svg>`; }
function visual(spec, cls) {
  spec = String(spec || "");
  const at = spec.lastIndexOf("@");
  if (at > 0 && /^[0-9.]+$/.test(spec.slice(at + 1)) && !/^(https?:)/.test(spec)) { const sc = +spec.slice(at + 1); return `<span class="qsc" style="display:inline-flex;transform:scale(${sc})">${visual(spec.slice(0, at), cls)}</span>`; }
  if (spec.startsWith("svg:")) {
    const [, k, a, b, c] = spec.split(":");
    if (k === "shape") return shapeSVG(a, b);
    if (k === "clock") return clockSVG(a, b);
    if (k === "pie") { const [n, d] = a.split("/"); return pieSVG(n, d); }
    if (k === "bar") { const [n, d] = a.split("/"); return barSVG(n, d); }
    if (k === "ten") return tenSVG(a);
    if (k === "nline") return nlineSVG(a, b, c);
    if (k === "angle") return angleSVG(a);
    if (k === "area") return areaSVG(a, b);
    if (k === "rect") return rectSVG(a, b);
    if (k === "b10") return b10SVG(a, b, c);
    if (k === "dots") return dotsSVG(a);
    return "";
  }
  if (spec.startsWith("cnt:")) { const [, code, n] = spec.split(":"); return `<span class="cnt">${Array.from({ length: +n }, () => `<img src="${esc(src(code))}" alt="">`).join("")}</span>`; }
  return `<img class="${cls || "pic"}" src="${esc(src(spec))}" alt="">`;
}
/* عنصر خيار/بلاطة: نص، أو صورة، أو الاثنان */
function itemHTML(v) {
  if (v == null) return "";
  if (typeof v !== "object") return `<span>${fmt(String(v))}</span>`;
  return (v.i ? visual(v.i, "") : "") + (v.x != null && v.x !== "" ? `<span>${fmt(v.x)}</span>` : "");
}
function itemText(v) { if (v == null) return ""; if (typeof v !== "object") return String(v); return v.x != null ? String(v.x) : ""; }
/* المعادلات وما بين ⟦ ⟧ تُعرض من اليسار إلى اليمين */
function fmt(t) { return esc(t).replace(/⟦(.*?)⟧/g, '<bdi dir="ltr" class="ltr">$1</bdi>'); }
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => { const r = Math.random() * 16 | 0; return (c === "x" ? r : (r & 3 | 8)).toString(16); }));
function shuffleNot(n, seed) { /* ترتيب عشوائي ثابت لا يطابق الترتيب الصحيح */
  const a = Array.from({ length: n }, (_, i) => i); if (n < 2) return a;
  let s = seed || 7; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let k = 0; k < 8; k++) { for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (a.some((v, i) => v !== i)) return a; }
  return a.reverse();
}
function seedOf(s) { let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 100000; return h || 7; }

/* ---------- واجهة: رسائل وحوار ---------- */
function confirmDlg(title, text, yes, no) {
  return new Promise((res) => {
    const d = D.createElement("div"); d.className = "qz-dlg"; d.setAttribute("role", "dialog"); d.setAttribute("aria-modal", "true");
    d.innerHTML = `<div><img src="${IMG("zozo-help")}" alt="" width="80" style="margin:auto"><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="row"><button type="button" class="qp-btn pri" data-y>${esc(yes)}</button><button type="button" class="qp-btn sec" data-n>${esc(no)}</button></div></div>`;
    D.body.appendChild(d); $("[data-n]", d).focus();
    const done = (v) => { d.remove(); res(v); };
    $("[data-y]", d).onclick = () => done(true); $("[data-n]", d).onclick = () => done(false);
    d.addEventListener("keydown", (e) => { if (e.key === "Escape") done(false); });
  });
}
function countQ(n) { n = +n || 0; return n === 1 ? "سؤال واحد" : n === 2 ? "سؤالان" : n <= 10 ? n + " أسئلة" : n + " سؤالًا"; }
function dayTxt(iso) { try { const d = new Date(iso); return d.getDate() + "/" + (d.getMonth() + 1); } catch (e) { return ""; } }

/* ---------- الصفحة الأولى ---------- */
function kidsBar() {
  const ids = kidIds();
  if (!ids.length) return `<div class="qz-kids"><b>لم تُنشئ ملفًا لطفلك بعد.</b><small>يمكنك الاختبار الآن، وإذا أنشأت ملف الطفل من <a href="../games/#start">الألعاب</a> تُحفظ نتائجه وتظهر في لوحة ولي الأمر.</small></div>`;
  return `<div class="qz-kids" role="group" aria-label="من يختبر الآن؟"><b>من يختبر الآن؟</b>${ids.map((id) => { const k = kidLoad(id); return `<button type="button" class="qz-kid" data-kid="${esc(id)}" aria-pressed="${id === KID.id}"><img src="${ROOT}games/chars/${esc(k.ch)}-160.png" alt="">${esc(k.n || id)}</button>`; }).join("")}<small>النتائج تُحفظ في ملف الطفل على هذا الجهاز وتظهر في لوحة ولي الأمر فقط.</small></div>`;
}
function hero(h1, p, bc, pose, bubble) {
  return `<section class="qz-hero" style="background:linear-gradient(135deg,#351078,#5427D5 55%,#7045E8)"><div class="zw"><div>${bc ? `<div class="zbc">${bc}</div>` : ""}<h1>${h1}</h1><p>${p}</p></div><div class="qz-zz">${bubble ? `<span class="qz-say">${esc(bubble)}</span>` : ""}<img src="${IMG(pose || "zozo-welcome")}" alt="زوزو" width="110" height="115"></div></div></section>`;
}
function home() {
  setPlay(false);
  const me = kidStage(KID.k), list = LIST || [];
  const cnt = (lv) => list.filter((q) => q.lv === lv).length;
  const name = KID.k ? (KID.k.n || KID.id) : "";
  let h = hero("الاختبارات والتقييمات", "اختبارات قصيرة وممتعة مع زوزو لتعرف ماذا تعلّمت، بدون وقت ضاغط.", `<a href="../">الرئيسية</a> › الاختبارات`, "zozo-welcome", name ? `أهلًا ${name}! هيا نختبر معلوماتنا` : "أهلًا! أنا زوزو، سأرافقك في الاختبار");
  h += `<main class="zw">${kidsBar()}<section class="qz-sec" style="margin-top:6px"><h2>اختر العمر أو الصف</h2><p>داخل كل فئة: اللغة العربية والرياضيات والعلوم والمهارات العامة، ولكل مادة 3 مستويات.</p><div class="qz-lvs">`;
  LV.forEach((l) => { const n = cnt(l[0]); if (n) h += `<button type="button" class="qz-lv${l[0] === me ? " me" : ""}" data-go="#lv=${l[0]}"><img src="${IMG(l[2])}" alt="">${esc(l[1])}<small>${n} اختبارًا</small></button>`; });
  h += `</div></section><section class="qz-sec"><h2>المواد</h2><div class="qz-subs">${SUBJ_ORDER.map((s) => `<div class="qz-subi s-${s}"><img src="${IMG(SUBJ[s][1])}" alt=""><span>${SUBJ[s][0]}<small>${SUBJ[s][2]}</small></span></div>`).join("")}</div></section>`;
  const rec = results().at.slice(-5).reverse();
  if (rec.length) h += `<section class="qz-sec"><h2>آخر اختباراتك</h2><div class="qz-hist">${rec.map((r) => { const q = list.find((x) => x.slug === r.q); return `<a class="qz-hrow" href="#q=${encodeURIComponent(r.q)}"><img src="${IMG(SUBJ[r.sj] ? SUBJ[r.sj][1] : "i_star")}" alt="" width="32" height="32"><b>${esc(q ? q.title : r.q)}</b><small>${r.s} من ${r.n} · ${dayTxt(r.d)}</small></a>`; }).join("")}</div></section>`;
  h += `<p class="qz-note">لا نطلب أي بيانات شخصية. نتائج الطفل لا تظهر لأحد غيرك، وتجدها في <a href="../games/#parent">لوحة ولي الأمر</a>.</p></main>`;
  app.innerHTML = h; W.scrollTo(0, 0);
  D.title = "الاختبارات والتقييمات | منصة زاد التعليمية";
}

/* ---------- صفحة الفئة ---------- */
function level(lv) {
  setPlay(false);
  const L = LV[LVI[lv]]; if (!L) return home();
  const list = (LIST || []).filter((q) => q.lv === lv);
  let h = hero(`<img src="${IMG(L[2])}" alt="" width="44" height="44" style="vertical-align:-10px"> اختبارات ${esc(L[1])}`, `${list.length} اختبارًا في 4 مواد. ابدأ بالبسيط ثم التدريبي ثم الشامل.`, `<a href="../">الرئيسية</a> › <a href="#">الاختبارات</a> › ${esc(L[1])}`, "zozo-cheer", young(lv) ? "اضغط على الاختبار وسأقرأ لك الأسئلة" : "اختر المادة وابدأ بالتقييم البسيط");
  h += `<main class="zw">${kidsBar()}`;
  if (!list.length) h += `<div class="qz-empty"><img src="${IMG("zozo-think")}" alt=""><h3>لا توجد اختبارات هنا بعد</h3><p>اختر عمرًا أو صفًا آخر.</p></div>`;
  SUBJ_ORDER.forEach((s) => {
    const L2 = list.filter((q) => q.subj === s).sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || a.sort_order - b.sort_order);
    if (!L2.length) return;
    h += `<section class="s-${s}"><div class="qz-band qz-sb"><img src="${IMG(SUBJ[s][1])}" alt=""><div><h2>${SUBJ[s][0]}</h2><p>${SUBJ[s][2]}</p></div></div><div class="qz-list">`;
    L2.forEach((q) => {
      const b = bestOf(q.slug), K = KIND[q.kind];
      const badge = b ? `<span class="qz-best${b.p >= 0.8 ? "" : " mid"}">${b.s} من ${b.n}</span>` : `<span class="qz-best new">جديد</span>`;
      h += `<button type="button" class="qz-card" data-go="#q=${encodeURIComponent(q.slug)}"><span class="qz-kd"><img src="${IMG(K[1])}" alt="">${K[0].replace("تقييم ", "")}</span><span><b>${esc(q.title)}</b><small>${esc(K[0])} · ${esc(q.skill || "")} · ${countQ(q.n)}</small></span>${badge}</button>`;
    });
    h += `</div></section>`;
  });
  h += `<p class="qz-note">التقييم البسيط يتأكد من المهارة الأساسية، والتدريبي لتطبيقها، والشامل يجمع عدة مهارات. لا يوجد وقت ضاغط، ويمكنك إعادة أي اختبار.</p></main>`;
  app.innerHTML = h; W.scrollTo(0, 0);
  D.title = `اختبارات ${L[1]} | منصة زاد التعليمية`;
}

/* ---------- مشغّل الاختبار ---------- */
const P = { q: null, qs: [], i: 0, mode: "instant", ans: [], lock: [], ok: [], attempt: "", t0: 0, timer: false, tick: null, done: false, ui: null, saved: false };
function setPlay(on) { D.documentElement.classList.toggle("qz-on", !!on); if (!on) { clearInterval(P.tick); stopSay(); } }
async function openQuiz(slug) {
  setPlay(false);
  app.innerHTML = `<div class="qz-load"><img src="${IMG("zozo-think")}" alt="" width="120"><p>جاري تجهيز الاختبار…</p></div>`;
  const q = await loadQuiz(slug);
  if (!q || !q.data || !Array.isArray(q.data.qs) || !q.data.qs.length) {
    app.innerHTML = `<main class="zw"><div class="qz-empty"><img src="${IMG("zozo-help")}" alt=""><h3>تعذّر فتح الاختبار</h3><p>تأكد من الإنترنت ثم حاول مرة أخرى.</p><a class="zbtn zb2" href="#">كل الاختبارات</a></div></main>`;
    return;
  }
  intro(q);
}
function intro(q) {
  setPlay(true); stopSay();
  Object.assign(P, { q, qs: q.data.qs, i: 0, mode: young(q.lv) || q.kind === "basic" ? "instant" : "exam", ans: [], lock: [], ok: [], attempt: uid(), t0: 0, timer: false, done: false, saved: false });
  const K = KIND[q.kind], S = SUBJ[q.subj], L = LV[LVI[q.lv]];
  const ins = P.mode === "instant"
    ? [young(q.lv) ? "زوزو يقرأ لك كل سؤال، ويمكنك سماعه مرة أخرى من زر السماعة." : "اقرأ السؤال، ويمكنك سماعه من زر السماعة.", "اختر الإجابة، وسيخبرك زوزو إن كانت صحيحة ويشرح لك.", "لا يوجد وقت، خذ وقتك."]
    : ["أجب عن الأسئلة بالترتيب، ويمكنك الرجوع لأي سؤال.", "في النهاية تراجع إجاباتك قبل التسليم.", "بعد التسليم ترى النتيجة وشرح الإجابات."];
  app.innerHTML = `<div class="qp s-${q.subj}"><div class="qp-top"><button type="button" class="qp-x" data-exit aria-label="رجوع"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg></button><div class="qp-tt"><b>${esc(q.title)}</b><small>${esc(S[0])} · ${esc(L[1])}</small></div>${muteBtn()}</div>
  <div class="qi"><div class="qi-card"><div class="qi-hd"><img class="zz" src="${IMG("zozo-welcome")}" alt="زوزو"><div><h1>${esc(q.title)}</h1><p>${esc(K[0])}: ${esc(K[2])}</p></div></div>
  <div class="qi-meta"><span class="sj">${esc(S[0])}</span><span>المهارة: ${esc(q.skill || "")}</span><span>${countQ(P.qs.length)}</span><span>${esc(L[1])}</span></div>
  ${q.intro ? `<p style="margin:0;font-size:15px;line-height:1.7">${fmt(q.intro)}</p>` : ""}
  <ul class="qi-ins">${ins.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
  ${q.data.timer && P.mode === "exam" ? `<label class="qi-tm"><span>أريد قياس الوقت (اختياري، بدون عدّ تنازلي)</span><input type="checkbox" id="qtm"></label>` : ""}
  </div><button type="button" class="qp-btn pri" data-start style="min-height:58px;font-size:19px">ابدأ الاختبار</button>
  ${q.slug === PREV ? `<p class="qz-note" style="margin:0">معاينة من لوحة التحكم: النتيجة لا تُحفظ في ملف أي طفل.</p>` : ""}
  ${!KID.k && kidIds().length ? `<p class="qz-note" style="margin:0">اختر الطفل من صفحة الاختبارات حتى تُحفظ نتيجته في ملفه.</p>` : ""}</div></div>`;
  D.title = q.title + " | اختبارات زاد";
  W.scrollTo(0, 0);
  if (young(q.lv)) say(q.title + ". " + (q.intro || "هيا نبدأ!"));
}
function muteBtn() { return `<button type="button" class="qp-x" data-mute aria-pressed="${MUTE}" aria-label="${MUTE ? "تشغيل الصوت" : "كتم الصوت"}">${MUTE ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M16 9l5 6M21 9l-5 6"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3l5-4v14l-5-4H4z" fill="currentColor" stroke="none"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/></svg>'}</button>`; }
function start() {
  P.timer = !!($("#qtm") && $("#qtm").checked); P.t0 = Date.now();
  show(0);
}
function frame(inner, foot) {
  const n = P.qs.length;
  const bar = P.qs.map((_, k) => `<i class="${k === P.i ? "c" : (P.mode === "exam" ? isAnswered(k) : P.lock[k]) ? "d" : ""}"></i>`).join("");
  const S = SUBJ[P.q.subj];
  return `<div class="qp s-${P.q.subj}"><div class="qp-top"><button type="button" class="qp-x" data-exit aria-label="الخروج من الاختبار"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button><div class="qp-tt"><b>${esc(P.q.title)}</b><small>${esc(S[0])}${P.timer ? ` · <span class="qp-time" id="qtime">0:00</span>` : ""}</small></div><span class="qp-n">${P.i + 1} من ${n}</span><div class="qp-bar" aria-hidden="true">${bar}</div></div>
  <div class="qp-main" id="qmain">${inner}</div><div class="qp-foot"><div class="in">${foot}</div></div></div>`;
}
function isAnswered(k) { const a = P.ans[k], q = P.qs[k]; if (a == null) return false; return complete(q, a); }
function promptHTML(q) {
  const yng = young(P.q.lv), lis = !!q.listen, voice = q.snd || q.say !== "" ;
  const zz = P.lock[P.i] ? (P.ok[P.i] ? "zozo-cheer" : "zozo-help") : "zozo-think";
  let h = "";
  if (q.psg && P.q.data.psg && P.q.data.psg[q.psg]) { const g = P.q.data.psg[q.psg]; h += `<div class="qp-psg">${g.t ? `<h3>${esc(g.t)}</h3>` : ""}${fmt(g.x)}${g.snd || !yng ? `<div style="margin-top:6px"><button type="button" class="qp-snd" data-psg aria-label="استمع إلى النص" style="width:40px;height:40px">${SPK}</button></div>` : ""}</div>`; }
  if (lis) {
    h += `<div class="qp-q"><img class="zz" src="${IMG(zz)}" alt=""><div class="qp-bub"><span class="tx"><small>سؤال استماع</small>${esc(q.q || "استمع ثم اختر الإجابة")}</span></div></div><div class="qp-listen"><button type="button" class="qp-snd" data-say aria-label="استمع إلى السؤال">${SPK}</button><span>اضغط لتستمع</span></div>`;
  } else {
    h += `<div class="qp-q"><img class="zz" src="${IMG(zz)}" alt=""><div class="qp-bub"><span class="tx">${q.t === "fill" ? esc(q.q2 || "اختر الكلمة المناسبة للفراغ") : fmt(q.q)}</span>${voice ? `<button type="button" class="qp-snd" data-say aria-label="استمع إلى السؤال">${SPK}</button>` : ""}</div></div>`;
  }
  const imgs = q.img ? (Array.isArray(q.img) ? q.img : [q.img]) : [];
  if (imgs.length || q.eq) h += `<div class="qp-vis">${imgs.map((x) => visual(x)).join("")}${q.eq ? `<div class="qp-eq">${esc(q.eq).replace(/؟/g, '<span class="qm">؟</span>')}</div>` : ""}</div>`;
  return h;
}
let memoSeen = {};
function show(i) {
  stopSay(); P.i = i; const q = P.qs[i];
  if (q.memo && !memoSeen[P.attempt + i] && !P.lock[i]) { memo(q); return; }
  const inner = promptHTML(q) + `<div id="qans"></div><div id="qfb"></div>`;
  app.innerHTML = frame(inner, footHTML());
  P.ui = render(q, $("#qans"), i);
  if (P.lock[i]) { P.ui.reveal(); fbBox(); }
  wireFoot();
  W.scrollTo(0, 0);
  if (P.timer) clockTick();
  const autoSay = young(P.q.lv) || q.listen;
  if (autoSay && !P.lock[i]) setTimeout(() => speakQ(q), 250);
}
/* تحويل الرموز الرياضية إلى كلمات عند القراءة بالصوت */
function mathWords(e) { return String(e).replace(/(\d)\s*\/\s*(\d)/g, "$1 على $2").replace(/\+/g, " زائد ").replace(/[−-]/g, " ناقص ").replace(/×/g, " ضرب ").replace(/÷/g, " قسمة ").replace(/=/g, " يساوي ").replace(/<|>/g, " ").replace(/؟/g, " كم؟ "); }
function spoken(t) { return String(t || "").replace(/⟦(.*?)⟧/g, (m, e) => " " + mathWords(e) + " "); }
function speakQ(q, btn) {
  if (q.snd) return sayUrl(q.snd, btn || $("[data-say]"));
  let t = q.say != null && q.say !== "" ? q.say : (q.t === "fill" ? (q.q2 || "") + " " + String(q.q || "").replace(/__+/g, " ... ") : q.q);
  if (q.eq && (q.say == null || q.say === "")) t += "، " + mathWords(q.eq);
  return say(spoken(t), btn || $("[data-say]"));
}
function memo(q) {
  const inner = `<div class="qp-q"><img class="zz" src="${IMG("zozo-think")}" alt=""><div class="qp-bub"><span class="tx">${esc(q.memoTx || "انظر جيدًا واحفظ الصور، ثم اضغط «حفظتها»")}</span></div></div><div class="qp-memo"><div class="row">${q.memo.map((x) => visual(x, "")).join("")}</div></div>`;
  app.innerHTML = frame(inner, `<button type="button" class="qp-btn pri" data-memo>حفظتها! أكمل</button>`);
  if (young(P.q.lv)) say(q.memoTx || "انظر جيدًا واحفظ الصور");
  $("[data-memo]").onclick = () => { memoSeen[P.attempt + P.i] = 1; show(P.i); };
}
function footHTML() {
  const last = P.i === P.qs.length - 1;
  if (P.mode === "instant") {
    if (P.lock[P.i]) return `<button type="button" class="qp-btn sun" data-next>${last ? "اعرض النتيجة" : "السؤال التالي"}</button>`;
    return needsCheck(P.qs[P.i]) ? `<button type="button" class="qp-btn pri" data-check disabled>تحقّق</button>` : `<p class="qp-hint" style="margin:auto">اضغط على الإجابة</p>`;
  }
  return `${P.i > 0 ? `<button type="button" class="qp-btn sec" data-prev>السابق</button>` : ""}<button type="button" class="qp-btn ${last ? "sun" : "pri"}" data-next>${last ? "مراجعة الإجابات" : "التالي"}</button>`;
}
const needsCheck = (q) => !["mc", "tf"].includes(q.t);
function wireFoot() {
  const ck = $("[data-check]"); if (ck) ck.onclick = () => commit();
  const nx = $("[data-next]"); if (nx) nx.onclick = () => next();
  const pv = $("[data-prev]"); if (pv) pv.onclick = () => show(P.i - 1);
}
function changed() {
  const ck = $("[data-check]"); if (ck) ck.disabled = !complete(P.qs[P.i], P.ans[P.i]);
  if (P.mode === "exam") { const b = $$(".qp-bar i")[P.i]; b && b.classList.toggle("d", isAnswered(P.i)); }
}
function commit() {
  const i = P.i, q = P.qs[i];
  if (P.lock[i] || !complete(q, P.ans[i])) return;
  P.lock[i] = true; P.ok[i] = check(q, P.ans[i]);
  tone(P.ok[i] ? "ok" : "no");
  P.ui.reveal(); fbBox();
  $(".qp-foot .in").innerHTML = footHTML(); wireFoot();
  const zz = $(".qp-q img.zz"); if (zz) zz.src = IMG(P.ok[i] ? "zozo-cheer" : "zozo-help");
  const b = $$(".qp-bar i")[i]; b && b.classList.add("d");
  if (young(P.q.lv)) say(P.ok[i] ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : "لا بأس، لنتعلّم معًا");
  setTimeout(() => { const f = $("#qfb"); f && f.scrollIntoView({ behavior: "smooth", block: "nearest" }); }, 60);
}
const PRAISE = ["أحسنت!", "رائع!", "ممتاز!", "برافو!", "جميل جدًا!"];
function fbBox() {
  const i = P.i, q = P.qs[i], ok = P.ok[i], f = $("#qfb"); if (!f) return;
  f.innerHTML = `<div class="qp-fb ${ok ? "ok" : "no"}"><img src="${IMG(ok ? "zozo-cheer" : "zozo-help")}" alt=""><div><b>${ok ? PRAISE[i % PRAISE.length] : "لا بأس! لنتعلّم معًا"}</b>${!ok ? `<p>الإجابة الصحيحة: ${correctHTML(q)}</p>` : ""}${q.ex ? `<p>${fmt(q.ex)}</p>` : ""}</div></div>`;
}
function next() {
  if (P.mode === "instant") { if (!P.lock[P.i]) return; if (P.i < P.qs.length - 1) show(P.i + 1); else finish(); return; }
  if (P.i < P.qs.length - 1) show(P.i + 1); else review();
}
function review() {
  stopSay();
  const n = P.qs.length, left = P.qs.map((_, k) => k).filter((k) => !isAnswered(k));
  const inner = `<div class="qi" style="padding:0"><div class="qi-card"><div class="qi-hd"><img class="zz" src="${IMG("zozo-think")}" alt=""><div><h1>راجع إجاباتك</h1><p>${left.length ? `بقي ${countQ(left.length)} بدون إجابة. اضغط على الرقم للرجوع إليه.` : "أجبت عن كل الأسئلة. يمكنك الرجوع لأي سؤال قبل التسليم."}</p></div></div>
  <div class="qr-grid">${P.qs.map((_, k) => `<button type="button" class="${isAnswered(k) ? "d" : ""}" data-goq="${k}" aria-label="السؤال ${k + 1}${isAnswered(k) ? " (أُجيب)" : " (بدون إجابة)"}">${k + 1}</button>`).join("")}</div></div></div>`;
  P.i = n - 1;
  app.innerHTML = frame(inner, `<button type="button" class="qp-btn sec" data-goq="${n - 1}">رجوع</button><button type="button" class="qp-btn sun" data-submit>تسليم الاختبار</button>`);
  $(".qp-n").textContent = "مراجعة";
  $$("[data-goq]").forEach((b) => b.onclick = () => show(+b.dataset.goq));
  $("[data-submit]").onclick = async () => {
    if (left.length && !(await confirmDlg("هل تسلّم الآن؟", `بقي ${countQ(left.length)} بدون إجابة، وستُحسب غير صحيحة.`, "نعم، سلّم", "أكمل الإجابة"))) return;
    P.qs.forEach((q, k) => { P.lock[k] = true; P.ok[k] = isAnswered(k) && check(q, P.ans[k]); });
    finish();
  };
  W.scrollTo(0, 0);
}

/* ---------- أنواع الأسئلة ---------- */
function complete(q, a) {
  if (a == null) return false;
  switch (q.t) {
    case "mc": case "tf": case "fill": return typeof a === "number";
    case "num": return String(a).length > 0;
    case "order": return Array.isArray(a) && a.length === q.o.length && a.every((x) => x != null);
    case "sort": return Array.isArray(a) && a.length === q.o.length && a.every((x) => x != null);
    case "match": return Array.isArray(a) && a.length === q.p.length && a.every((x) => x != null);
  }
  return false;
}
function check(q, a) {
  if (!complete(q, a)) return false;
  switch (q.t) {
    case "mc": case "fill": return a === q.a;
    case "tf": return (a === 0) === !!q.a;
    case "num": return Number(String(a).replace(",", ".")) === Number(q.a);
    case "order": { const seq = a.map((k) => itemKey(q.o[k])).join("|"); return seq === q.o.map(itemKey).join("|") || (q.alt || []).some((al) => al.map(itemKey).join("|") === seq); }
    case "sort": return a.every((b, k) => b === q.o[k].b);
    case "match": return a.every((r, k) => r === k);
  }
  return false;
}
const itemKey = (v) => typeof v !== "object" ? String(v) : (v.x || "") + "#" + (v.i || "");
function correctHTML(q) {
  switch (q.t) {
    case "mc": case "fill": return `<b>${itemInline(q.o[q.a])}</b>`;
    case "tf": return `<b>${q.a ? "صح" : "خطأ"}</b>`;
    case "num": return `<b class="ltr">${esc(q.a)}</b>`;
    case "order": return `<b>${q.o.map(itemInline).join(q.join === "" ? "" : " ، ")}</b>`;
    case "sort": return q.b.map((bn, bi) => `<b>${itemInline(bn)}:</b> ${q.o.filter((x) => x.b === bi).map(itemInline).join(" ، ")}`).join(" — ");
    case "match": return q.p.map((pr) => `${itemInline(pr[0])} ← ${itemInline(pr[1])}`).join(" ، ");
  }
  return "";
}
function itemInline(v) {
  if (v == null) return "";
  const t = itemText(v), i = typeof v === "object" ? (v.i || "") : "";
  const im = i ? (i.startsWith("svg:") ? `<span style="display:inline-block;width:34px;height:34px;vertical-align:middle">${visual(i)}</span>` : i.startsWith("cnt:") ? esc(i.split(":")[2]) : `<img src="${esc(src(i.split("@")[0]))}" alt="" width="34" height="34" style="vertical-align:middle">`) : "";
  return im + (t ? fmt(t) : "");
}
function answerHTML(q, a) {
  if (!complete(q, a)) return "بدون إجابة";
  switch (q.t) {
    case "mc": case "fill": return itemInline(q.o[a]);
    case "tf": return a === 0 ? "صح" : "خطأ";
    case "num": return `<span class="ltr">${esc(a)}</span>`;
    case "order": return a.map((k) => itemInline(q.o[k])).join(q.join === "" ? "" : " ، ");
    case "sort": return "توزيع غير صحيح";
    case "match": return "توصيل غير صحيح";
  }
  return "";
}
function render(q, box, i) {
  const st = P.ans[i], locked = () => !!P.lock[i], setA = (v) => { P.ans[i] = v; changed(); };
  const R = { reveal() { } };
  if (q.t === "mc" || q.t === "tf") {
    const opts = q.t === "tf" ? [{ x: "صح", s: "✓" }, { x: "خطأ", s: "✗" }] : q.o;
    const allImg = q.t === "mc" && q.o.every((o) => typeof o === "object" && !!o.i);
    const short = q.t === "mc" && q.o.every((o) => typeof o !== "object" && String(o).length <= 6);
    const cls = q.t === "tf" ? "qp-tf" : `qp-opts${q.o.length === 3 && (allImg || short) ? " three" : ""}${!allImg && q.o.some((o) => itemText(o).length > 24) ? " one" : ""}`;
    box.innerHTML = `<div class="${cls}" role="group" aria-label="الخيارات">${opts.map((o, k) => `<button type="button" class="qp-opt${st === k ? " sel" : ""}" data-k="${k}">${q.t === "tf" ? `<i aria-hidden="true">${o.s}</i><span>${o.x}</span>` : itemHTML(o)}</button>`).join("")}</div>`;
    $$(".qp-opt", box).forEach((b) => b.onclick = () => {
      if (locked()) return; const k = +b.dataset.k;
      setA(k); $$(".qp-opt", box).forEach((x) => x.classList.toggle("sel", x === b));
      if (P.mode === "instant") commit();
    });
    R.reveal = () => {
      const ca = q.t === "tf" ? (q.a ? 0 : 1) : q.a;
      $$(".qp-opt", box).forEach((b) => { const k = +b.dataset.k; b.disabled = true; b.classList.remove("sel"); if (k === ca) b.classList.add("ok"); else if (k === P.ans[i]) b.classList.add("no"); });
    };
    return R;
  }
  if (q.t === "num") {
    box.innerHTML = `<div class="qp-ans" id="qnum" aria-live="polite">${esc(st || "")}</div><p class="qp-hint">اكتب الإجابة بالأرقام</p><div class="qp-keys" role="group" aria-label="لوحة الأرقام">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<button type="button" data-d="${d}">${d}</button>`).join("")}<button type="button" class="del" data-d="del" aria-label="مسح" style="grid-column:span 5">⌫ مسح</button></div>`;
    const out = $("#qnum", box);
    $$("[data-d]", box).forEach((b) => b.onclick = () => {
      if (locked()) return; let v = String(P.ans[i] || "");
      v = b.dataset.d === "del" ? v.slice(0, -1) : (v.length < 6 ? (v === "0" ? "" : v) + b.dataset.d : v);
      out.textContent = v; setA(v || null);
    });
    R.reveal = () => { out.classList.add(P.ok[i] ? "ok" : "no"); $$("[data-d]", box).forEach((b) => b.disabled = true); };
    return R;
  }
  if (q.t === "order") return renderOrder(q, box, i, setA, locked);
  if (q.t === "fill") return renderFill(q, box, i, setA, locked);
  if (q.t === "sort") return renderSort(q, box, i, setA, locked);
  if (q.t === "match") return renderMatch(q, box, i, setA, locked);
  box.innerHTML = `<p>نوع سؤال غير معروف</p>`; return R;
}
/* سحب وإفلات مع بديل اللمس: اضغط ثم اضغط */
function dragify(el, getTargets, onDrop, onTap) {
  let sx = 0, sy = 0, ghost = null, moved = false, pid = null, over = null;
  el.addEventListener("pointerdown", (e) => {
    if (e.button > 0) return; pid = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
    try { el.setPointerCapture(pid); } catch (er) { /* */ }
  });
  el.addEventListener("pointermove", (e) => {
    if (pid !== e.pointerId) return;
    if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 8) return;
    if (!moved) { moved = true; const r = el.getBoundingClientRect(); ghost = el.cloneNode(true); ghost.classList.add("ghost"); ghost.style.width = r.width + "px"; ghost.style.height = r.height + "px"; D.body.appendChild(ghost); el.style.opacity = ".35"; }
    ghost.style.left = e.clientX - ghost.offsetWidth / 2 + "px"; ghost.style.top = e.clientY - ghost.offsetHeight / 2 + "px";
    ghost.style.display = "none"; const t = D.elementFromPoint(e.clientX, e.clientY); ghost.style.display = "";
    const tg = t && getTargets().find((x) => x === t || x.contains(t));
    if (over !== tg) { over && over.classList.remove("hl"); over = tg; over && over.classList.add("hl"); }
  });
  const end = (e, cancel) => {
    if (pid !== e.pointerId) return; pid = null;
    if (moved) { ghost && ghost.remove(); ghost = null; el.style.opacity = ""; over && over.classList.remove("hl"); if (!cancel && over) onDrop(over); over = null; }
    else if (!cancel) onTap();
    moved = false;
  };
  el.addEventListener("pointerup", (e) => end(e, false));
  el.addEventListener("pointercancel", (e) => end(e, true));
  el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap(); } });
}
function renderOrder(q, box, i, setA, locked) {
  const n = q.o.length, perm = shuffleNot(n, seedOf(P.q.slug + q.id));
  let slots = Array.isArray(P.ans[i]) ? P.ans[i].slice() : Array(n).fill(null);
  const draw = () => {
    const used = new Set(slots.filter((x) => x != null));
    box.innerHTML = `<div class="qp-slots${q.dir === "ltr" ? " ltr" : ""}" aria-label="ضع البطاقات بالترتيب">${slots.map((k, s) => `<span class="qp-slot" data-s="${s}" aria-label="المكان ${s + 1}">${k != null ? `<button type="button" class="qp-tile${q.sm ? " sm" : ""}" data-in="${s}">${itemHTML(q.o[k])}</button>` : `<small style="color:#B3A6E6;font-weight:700">${s + 1}</small>`}</span>`).join("")}</div>
    <p class="qp-hint">${esc(q.hint || "اضغط على البطاقات بالترتيب، أو اسحبها إلى مكانها")}</p>
    <div class="qp-bank">${perm.map((k) => `<button type="button" class="qp-tile${q.sm ? " sm" : ""}${used.has(k) ? " used" : ""}" data-k="${k}" ${used.has(k) ? 'tabindex="-1" aria-hidden="true"' : ""}>${itemHTML(q.o[k])}</button>`).join("")}</div>`;
    const put = (k, s) => { if (locked()) return; const old = slots.indexOf(k); if (old >= 0) slots[old] = null; if (s == null) s = slots.indexOf(null); if (s < 0) return; slots[s] = k; save(); };
    const save = () => { setA(slots.every((x) => x == null) ? null : slots.slice()); draw(); };
    $$(".qp-bank .qp-tile:not(.used)", box).forEach((t) => dragify(t, () => $$(".qp-slot", box), (sl) => put(+t.dataset.k, +sl.dataset.s), () => put(+t.dataset.k, null)));
    $$(".qp-slot .qp-tile", box).forEach((t) => dragify(t, () => $$(".qp-slot", box), (sl) => { if (locked()) return; const a = +t.dataset.in, b = +sl.dataset.s; [slots[a], slots[b]] = [slots[b], slots[a]]; save(); }, () => { if (locked()) return; slots[+t.dataset.in] = null; save(); }));
  };
  draw();
  return { reveal() { const ok = P.ok[i]; $$(".qp-slot .qp-tile", box).forEach((t) => t.classList.add(ok ? "ok" : "no")); } };
}
function renderFill(q, box, i, setA, locked) {
  let cur = typeof P.ans[i] === "number" ? P.ans[i] : null;
  const parts = String(q.q).split(/__+/);
  const draw = () => {
    box.innerHTML = `<div class="qp-fill">${fmt(parts[0])}<span class="qp-blank" data-blank tabindex="0" role="button" aria-label="الفراغ">${cur != null ? `<span class="qp-tile">${itemHTML(q.o[cur])}</span>` : "&nbsp;"}</span>${fmt(parts.slice(1).join(" "))}</div>
    <p class="qp-hint">اسحب الإجابة إلى الفراغ أو اضغط عليها</p>
    <div class="qp-bank">${q.o.map((o, k) => `<button type="button" class="qp-tile${q.sm ? " sm" : ""}${cur === k ? " used" : ""}" data-k="${k}">${itemHTML(o)}</button>`).join("")}</div>`;
    const blank = $("[data-blank]", box);
    const set = (k) => { if (locked()) return; cur = k; setA(k); draw(); };
    $$(".qp-bank .qp-tile:not(.used)", box).forEach((t) => dragify(t, () => [blank], () => set(+t.dataset.k), () => set(+t.dataset.k)));
    blank.onclick = () => { if (locked() || cur == null) return; cur = null; setA(null); draw(); };
  };
  draw();
  return { reveal() { const b = $("[data-blank] .qp-tile", box); b && b.classList.add(P.ok[i] ? "ok" : "no"); } };
}
function renderSort(q, box, i, setA, locked) {
  let place = Array.isArray(P.ans[i]) ? P.ans[i].slice() : Array(q.o.length).fill(null), sel = null;
  const draw = () => {
    box.innerHTML = `<div class="qp-bins">${q.b.map((bn, bi) => `<div class="qp-bin" data-b="${bi}" role="button" tabindex="0" aria-label="ضع في: ${esc(itemText(bn) || "المجموعة " + (bi + 1))}"><h4>${itemHTML(bn)}</h4><div class="in">${place.map((p, k) => p === bi ? `<button type="button" class="qp-tile sm" data-in="${k}">${itemHTML(q.o[k])}</button>` : "").join("")}</div></div>`).join("")}</div>
    <p class="qp-hint">${sel != null ? "الآن اضغط على المجموعة المناسبة" : "اسحب كل بطاقة إلى مجموعتها، أو اضغطها ثم اضغط المجموعة"}</p>
    <div class="qp-bank">${q.o.map((o, k) => place[k] == null ? `<button type="button" class="qp-tile sm${sel === k ? " sel" : ""}" data-k="${k}">${itemHTML(o)}</button>` : "").join("")}</div>`;
    const save = () => { setA(place.every((x) => x == null) ? null : place.slice()); draw(); };
    const bins = () => $$(".qp-bin", box);
    $$(".qp-bank .qp-tile", box).forEach((t) => dragify(t, bins, (bn) => { if (locked()) return; place[+t.dataset.k] = +bn.dataset.b; sel = null; save(); }, () => { if (locked()) return; sel = sel === +t.dataset.k ? null : +t.dataset.k; draw(); }));
    $$(".qp-bin .qp-tile", box).forEach((t) => dragify(t, bins, (bn) => { if (locked()) return; place[+t.dataset.in] = +bn.dataset.b; save(); }, () => { if (locked()) return; place[+t.dataset.in] = null; save(); }));
    bins().forEach((bn) => { const go = () => { if (locked() || sel == null) return; place[sel] = +bn.dataset.b; sel = null; save(); }; bn.addEventListener("click", (e) => { if (e.target.closest(".qp-tile")) return; go(); }); bn.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } }); });
  };
  draw();
  return { reveal() { $$(".qp-bin .qp-tile", box).forEach((t) => { const k = +t.dataset.in; t.classList.add(place[k] === q.o[k].b ? "ok" : "no"); }); } };
}
const PCOL = ["#8B5CF6", "#F59E0B", "#10B981", "#EC4899", "#3B82F6", "#EF4444"];
function renderMatch(q, box, i, setA, locked) {
  const n = q.p.length, perm = shuffleNot(n, seedOf(P.q.slug + q.id + "m"));
  let link = Array.isArray(P.ans[i]) ? P.ans[i].slice() : Array(n).fill(null), sel = null;
  const draw = () => {
    box.innerHTML = `<div class="qp-match"><svg class="lines" aria-hidden="true"></svg><div class="col">${q.p.map((pr, k) => `<button type="button" class="qp-tile${link[k] != null ? " p" : ""}${sel === k ? " sel" : ""}" data-l="${k}" style="${link[k] != null ? `border-color:${PCOL[k % 6]}` : ""}">${link[k] != null ? `<i style="background:${PCOL[k % 6]}">${k + 1}</i>` : ""}${itemHTML(pr[0])}</button>`).join("")}</div><div class="col">${perm.map((r) => { const L = link.indexOf(r); return `<button type="button" class="qp-tile${L >= 0 ? " p" : ""}" data-r="${r}" style="${L >= 0 ? `border-color:${PCOL[L % 6]}` : ""}">${L >= 0 ? `<i style="background:${PCOL[L % 6]}">${L + 1}</i>` : ""}${itemHTML(q.p[r][1])}</button>`; }).join("")}</div></div>
    <p class="qp-hint">${sel != null ? "اضغط الآن على ما يناسبها في العمود الآخر" : "صِل كل عنصر بما يناسبه: اضغط عليه ثم على ما يناسبه، أو اسحبه إليه"}</p>`;
    lines();
    const save = () => { setA(link.every((x) => x == null) ? null : link.slice()); draw(); };
    const conn = (l, r) => { if (locked()) return; const o = link.indexOf(r); if (o >= 0) link[o] = null; link[l] = r; sel = null; save(); };
    $$("[data-l]", box).forEach((t) => dragify(t, () => $$("[data-r]", box), (rt) => conn(+t.dataset.l, +rt.dataset.r), () => { if (locked()) return; const k = +t.dataset.l; if (link[k] != null && sel !== k) { link[k] = null; sel = k; save(); return; } sel = sel === k ? null : k; draw(); }));
    $$("[data-r]", box).forEach((t) => { t.onclick = () => { if (locked()) return; const r = +t.dataset.r; if (sel != null) return conn(sel, r); const o = link.indexOf(r); if (o >= 0) { link[o] = null; save(); } }; });
  };
  const lines = () => {
    const sv = $("svg.lines", box); if (!sv) return; const br = box.querySelector(".qp-match").getBoundingClientRect();
    sv.innerHTML = link.map((r, k) => { if (r == null) return ""; const a = $(`[data-l="${k}"]`, box).getBoundingClientRect(), b = $(`[data-r="${r}"]`, box).getBoundingClientRect(); const x1 = a.left - br.left, y1 = a.top + a.height / 2 - br.top, x2 = b.right - br.left, y2 = b.top + b.height / 2 - br.top; return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${PCOL[k % 6]}" stroke-width="4" stroke-linecap="round"/>`; }).join("");
  };
  draw();
  const ro = W.ResizeObserver ? new ResizeObserver(lines) : null; ro && ro.observe(box);
  return { reveal() { $$("[data-l]", box).forEach((t) => { const k = +t.dataset.l; t.classList.add(link[k] === k ? "ok" : "no"); }); } };
}

/* ---------- النتيجة ---------- */
function finish() {
  if (P.done) return; P.done = true; clearInterval(P.tick); stopSay();
  const n = P.qs.length, s = P.ok.filter(Boolean).length, pct = Math.round((s / n) * 100), secs = P.t0 ? Math.round((Date.now() - P.t0) / 1000) : null;
  const sk = {}; P.qs.forEach((q, k) => { const name = q.sk || P.q.skill || "المهارة"; sk[name] = sk[name] || [0, 0]; sk[name][1]++; if (P.ok[k]) sk[name][0]++; });
  const wrong = P.qs.map((q, k) => k).filter((k) => !P.ok[k]);
  if (!P.saved && P.q.slug !== PREV) {
    P.saved = true;
    const o = results();
    o.at.push({ id: P.attempt, q: P.q.slug, tt: String(P.q.title || "").slice(0, 80), lv: P.q.lv, sj: P.q.subj, k: P.q.kind, s, n, d: new Date().toISOString(), sk, w: wrong.map((k) => P.qs[k].id), t: P.timer ? secs : undefined });
    o.at = o.at.slice(-300); ls.set(RKEY(), o);
    const res = {}; P.qs.forEach((q, k) => { res[q.id] = P.ok[k] ? 1 : 0; });
    if (P.q.id && Object.keys(res).length === n) api("rpc/quiz_done", { method: "POST", body: { p_attempt: P.attempt, p_quiz: P.q.id, p_score: s, p_total: n, p_res: res, p_secs: secs }, timeout: 8000 }).catch(() => { /* العدّاد اختياري */ });
  }
  tone("end");
  const stars = pct >= 90 ? 3 : pct >= 60 ? 2 : pct >= 30 ? 1 : 0;
  const msg = pct >= 90 ? "ممتاز! أتقنت هذه المهارات" : pct >= 70 ? "أحسنت! أنت تتقدّم" : pct >= 50 ? "أحسنت المحاولة، واصل التدريب" : "بداية جيدة! لنتدرّب معًا ثم نحاول مرة أخرى";
  const pose = pct >= 70 ? "zozo-win" : "zozo-cheer";
  const skH = Object.entries(sk).map(([k, v]) => `<div class="qs-skr ${v[0] === v[1] ? "ok" : "rv"}"><span>${esc(k)}</span><small>${v[0] === v[1] ? "أتقنتها" : "تحتاج تدريبًا"} · ${v[0]} من ${v[1]}</small></div>`).join("");
  const rvH = wrong.map((k) => { const q = P.qs[k]; return `<div class="qs-rq"><h4>${k + 1}. ${q.t === "fill" ? fmt(String(q.q).replace(/__+/g, "____")) : fmt(q.q || "")}</h4><div class="ln y">إجابتك: <b>${answerHTML(q, P.ans[k])}</b></div><div class="ln c">الصحيح: ${correctHTML(q)}</div>${q.ex ? `<p>${fmt(q.ex)}</p>` : ""}</div>`; }).join("");
  const inner = `<div class="qi" style="padding:0"><div class="qi-card"><div class="qs-top"><img class="zz" src="${IMG(pose)}" alt="زوزو"><div class="qs-ring" style="--p:${pct}"><div><b>${s} من ${n}</b><small>إجابات صحيحة</small></div></div><div class="qs-stars" aria-label="${stars} نجوم">${[0, 1, 2].map((k) => `<img src="${IMG("i_star")}" alt="" class="${k < stars ? "" : "off"}">`).join("")}</div><p class="qs-msg">${esc(msg)}</p>${secs != null && P.timer ? `<small style="color:var(--z-ink2);font-weight:700">الوقت: ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}</small>` : ""}</div></div>
  <div class="qi-card"><h2>المهارات</h2><div class="qs-sk">${skH}</div></div>
  ${wrong.length ? `<div class="qi-card"><h2>أسئلة تحتاج إلى مراجعة</h2><div class="qs-rv">${rvH}</div></div>` : ""}
  <div class="qi-card"><h2>تدرّب أكثر</h2><div class="qs-sug" id="qsug"><span class="qp-hint">جاري تجهيز الاقتراحات…</span></div></div>
  ${KID.k ? `<p class="qz-note" style="margin:0">حُفظت النتيجة في ملف ${esc(KID.k.n || KID.id)}، وتظهر في <a href="../games/#parent">لوحة ولي الأمر</a>.</p>` : `<p class="qz-note" style="margin:0">حُفظت النتيجة على هذا الجهاز. لمتابعة التقدّم في لوحة ولي الأمر أنشئ ملف الطفل من <a href="../games/#start">الألعاب</a>.</p>`}</div>`;
  app.innerHTML = frame(inner, `<button type="button" class="qp-btn sec" data-again>أعد الاختبار</button><button type="button" class="qp-btn pri" data-more>اختبارات ${esc(LV[LVI[P.q.lv]][1])}</button>`);
  $(".qp-n").textContent = "النتيجة"; $$(".qp-bar i").forEach((b) => { b.className = "d"; });
  $("[data-again]").onclick = () => intro(P.q);
  $("[data-more]").onclick = () => { location.hash = "#lv=" + P.q.lv; };
  $("[data-exit]").onclick = () => { location.hash = "#lv=" + P.q.lv; };
  W.scrollTo(0, 0);
  if (young(P.q.lv)) say(msg);
  suggest(pct, wrong);
}
let CAT = null;
function suggest(pct, wrong) {
  const q = P.q, box = $("#qsug");
  (CAT || (CAT = fetch(ROOT + "games/catalog.json").then((r) => r.json()).catch(() => []))).then((cat) => {
    if (!box.isConnected) return;
    const ages = GAMEAGE[q.lv] || [], subs = GAMESUB[q.subj] || [];
    const words = new Set([q.skill || "", ...P.qs.filter((x, k) => !P.ok[k]).map((x) => x.sk || "")].join(" ").split(/\s+/).filter((w) => w.length > 2));
    const g = (Array.isArray(cat) ? cat : []).filter((x) => subs.includes(x.subj) && ages.some((a) => String(x.age || "").includes(a)))
      .map((x) => ({ x, sc: [...words].filter((w) => String(x.skill || "").includes(w) || String(x.t || "").includes(w)).length }))
      .sort((a, b) => b.sc - a.sc).slice(0, 3).map((o) => o.x);
    const list = (LIST || []).filter((x) => x.lv === q.lv && x.slug !== q.slug);
    const nk = KIND_ORDER[KIND_ORDER.indexOf(q.kind) + 1];
    const nextQ = pct >= 70 ? (list.find((x) => x.subj === q.subj && x.kind === nk) || list.find((x) => x.subj !== q.subj && x.kind === q.kind)) : list.find((x) => x.subj === q.subj && x.kind === "basic") || null;
    let h = g.map((x) => `<a href="${ROOT}games/#g=${encodeURIComponent(x.id)}"><img src="${IMG("i_blocks")}" alt=""><span>لعبة: ${esc(x.t)}<small>${esc(x.skill || x.s || "")}</small></span></a>`).join("");
    h += `<a href="${ROOT}library/#lv=${q.lv}&sub=${encodeURIComponent(LIBSUB[q.subj])}"><img src="${IMG("i_notebook")}" alt=""><span>ملفات للطباعة: ${esc(LIBSUB[q.subj])} · ${esc(LV[LVI[q.lv]][1])}<small>أوراق عمل وأنشطة من المكتبة التعليمية</small></span></a>`;
    if (nextQ) h += `<a href="#q=${encodeURIComponent(nextQ.slug)}"><img src="${IMG(KIND[nextQ.kind][1])}" alt=""><span>${pct >= 70 ? "الاختبار التالي" : "ابدأ بالتقييم البسيط"}: ${esc(nextQ.title)}<small>${esc(KIND[nextQ.kind][0])} · ${countQ(nextQ.n)}</small></span></a>`;
    box.innerHTML = h;
  });
}
function clockTick() { clearInterval(P.tick); const f = () => { const e = $("#qtime"); if (!e) return; const s = Math.round((Date.now() - P.t0) / 1000); e.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }; f(); P.tick = setInterval(f, 1000); }

/* ---------- الأحداث والتنقل ---------- */
let leaving = false;
D.addEventListener("click", async (e) => {
  const t = e.target;
  let b;
  if ((b = t.closest("[data-go]"))) { location.hash = b.dataset.go; return; }
  if ((b = t.closest("[data-kid]"))) { kidSet(b.dataset.kid); route(); return; }
  if ((b = t.closest("[data-start]"))) { start(); return; }
  if ((b = t.closest("[data-say]"))) { const q = P.qs[P.i]; q && speakQ(q, b); return; }
  if ((b = t.closest("[data-psg]"))) { const q = P.qs[P.i], g = q && P.q.data.psg && P.q.data.psg[q.psg]; if (g) g.snd ? sayUrl(g.snd, b) : say(g.x, b); return; }
  if ((b = t.closest("[data-mute]"))) { MUTE = !MUTE; ls.set("zad.qz.mute", MUTE); if (MUTE) stopSay(); b.outerHTML = muteBtn(); return; }
  if ((b = t.closest("[data-exit]"))) {
    if (P.done || !P.t0) { location.hash = P.q ? "#lv=" + P.q.lv : ""; return; }
    if (await confirmDlg("هل تريد الخروج؟", "لن تُحفظ إجابات هذا الاختبار إذا خرجت الآن.", "خروج", "أكمل الاختبار")) { P.done = true; location.hash = "#lv=" + P.q.lv; }
  }
});
function route() {
  const h = new URLSearchParams(location.hash.slice(1));
  if (h.get("q")) { if (P.q && P.q.slug === h.get("q") && P.t0 && !P.done) return; return openQuiz(h.get("q")); }
  if (h.get("lv")) return level(h.get("lv"));
  return home();
}
W.addEventListener("hashchange", async () => {
  if (leaving) { leaving = false; return; }
  const h = new URLSearchParams(location.hash.slice(1));
  if (P.q && P.t0 && !P.done && h.get("q") !== P.q.slug) {
    const go = await confirmDlg("هل تريد الخروج؟", "لن تُحفظ إجابات هذا الاختبار إذا خرجت الآن.", "خروج", "أكمل الاختبار");
    if (!go) { leaving = true; location.hash = "#q=" + encodeURIComponent(P.q.slug); return; }
    P.done = true;
  }
  route();
});
D.addEventListener("click", (e) => { const b = e.target.closest("button,[role=button]"); if (b && ac && ac.state === "suspended") ac.resume().catch(() => { }); }, true);

/* ---------- البداية ---------- */
kidBoot();
loadList().then(() => route()).catch(() => { app.innerHTML = `<main class="zw"><div class="qz-empty"><img src="${IMG("zozo-help")}" alt=""><h3>تعذّر تحميل الاختبارات</h3><p>تأكد من اتصالك بالإنترنت ثم أعد المحاولة.</p><button type="button" class="zbtn zb2" onclick="location.reload()">إعادة المحاولة</button></div></main>`; });
W.__qz = { P, check, complete, show, review, finish, results: () => results(), KID };
})();
