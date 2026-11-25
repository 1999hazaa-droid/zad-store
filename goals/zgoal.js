/* «ماذا سيتعلم الطفل؟»: قسم يظهر في صفحة المورد من الأهداف المرتبطة به فعلًا (goals_item). لا يظهر شيء إن لم يُنشر هدف مرتبط. */
(function (W) {
"use strict";
const D = document, SCR = D.currentScript ? D.currentScript.src : location.href, ROOT = new URL("../", SCR).href;
const SB = String(W.ATHR_SUPABASE_URL || "https://zcnwzpevehudhnsuljdy.supabase.co").replace(/\/+$/, "");
const ANON = W.ATHR_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_BX7sdXrDSCMBBJVPGscMMg_jKbSmmam";
const PAGES = [["activities/view/", "a", "acts"], ["bank/play/", "s", "bank"], ["projects/play/", "s", "proj"], ["life/play/", "s", "life"], ["ready/play/", "s", "ready"], ["values/play/", "s", "val"], ["explore/play/", "s", "exp"], ["videos/play/", "s", "vid"], ["songs/play/", "s", "songs"], ["stories/read/", "s", "stories"], ["quizzes/quiz/", "q", "quiz"], ["packs/view/", "p", "pack"]];
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function keyOf() {
  const p = location.pathname, q = new URLSearchParams(location.search);
  for (const [path, prm, src] of PAGES) if (p.indexOf("/" + path) >= 0 || p.endsWith("/" + path.replace(/\/$/, ""))) { const v = q.get(prm); return v ? src + ":" + v : ""; }
  return "";
}
function box(a) {
  const g = a[0], more = a.slice(1);
  const oc = (g.outcomes || []).slice(0, 3).map((o) => `<li>${esc(o)}</li>`).join("");
  return `<section class="zgoalbox" id="zgoalbox" aria-label="ماذا سيتعلم الطفل؟"><h2>ماذا سيتعلم الطفل؟</h2><p><b>${esc(g.name)}</b></p><p><span class="tag">${esc(g.domain)}</span><span class="tag">المهارة: ${esc(g.skill)}</span></p><h3>سيتدرب الطفل على</h3><ul>${oc}</ul>${g.tip ? `<h3>إرشاد لولي الأمر</h3><p>${esc(g.tip)}</p>` : ""}${more.length ? `<h3>يدعم أيضًا</h3><p>${more.map((x) => esc(x.name)).join("، ")}</p>` : ""}<a href="${ROOT}goals/">عرض الأهداف التعليمية</a><p class="gnote">هذه أهداف التدريب بهذا المورد. فتح المورد أو إكماله لا يعني أن الطفل أتقن الهدف.</p></section>`;
}
async function go() {
  const key = keyOf(); if (!key) return;
  let a; try { const r = await fetch(SB + "/rest/v1/rpc/goals_item", { method: "POST", headers: { apikey: ANON, Authorization: "Bearer " + ANON, "Content-Type": "application/json" }, body: JSON.stringify({ p_key: key }) }); if (!r.ok) return; a = await r.json(); } catch (e) { return; }
  if (!Array.isArray(a) || !a.length) return;
  const css = D.createElement("link"); css.rel = "stylesheet"; css.href = ROOT + "goals/goals.css?v=1"; D.head.appendChild(css);
  const m = D.querySelector("main"); if (!m || D.getElementById("zgoalbox")) return;
  m.insertAdjacentHTML("afterend", box(a));
}
W.__zgoal = { keyOf, box };
if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", go); else go();
})(window);
