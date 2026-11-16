/* زاد بلا إنترنت — Service Worker
   يخدم ملفات الألعاب المجانية من التخزين المحلي عند انقطاع الإنترنت.
   تنزيل الحزمة وحذفها وتحديثها تديرها الصفحة (offline.js) عبر Cache Storage. */
const PACK = "zad-pack-";
const DB = "zad-offline", STORE = "queue";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim().then(flush)));

const idb = () => new Promise((ok, no) => { const r = indexedDB.open(DB, 1); r.onupgradeneeded = () => r.result.createObjectStore(STORE, { autoIncrement: true }); r.onsuccess = () => ok(r.result); r.onerror = () => no(r.error); });
const qAdd = async (item) => { const db = await idb(); return new Promise((ok) => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).add(item); tx.oncomplete = ok; tx.onerror = ok; }); };
const qAll = async () => { const db = await idb(); return new Promise((ok) => { const out = []; const tx = db.transaction(STORE, "readonly"), c = tx.objectStore(STORE).openCursor(); c.onsuccess = () => { const cur = c.result; if (cur) { out.push({ k: cur.key, v: cur.value }); cur.continue(); } else ok(out); }; c.onerror = () => ok(out); }); };
const qDel = async (k) => { const db = await idb(); return new Promise((ok) => { const tx = db.transaction(STORE, "readwrite"); tx.objectStore(STORE).delete(k); tx.oncomplete = ok; tx.onerror = ok; }); };

/* أحداث الإحصاءات (بدون بيانات شخصية) تُحفظ عند الانقطاع وتُرسل مرة واحدة عند عودة الإنترنت */
async function flush() {
  try {
    const items = await qAll();
    for (const { k, v } of items) {
      try { const r = await fetch(v.url, { method: "POST", headers: { "content-type": "text/plain" }, body: v.body }); if (r.ok || r.status < 500) await qDel(k); else break; } catch { break; }
    }
  } catch {}
}
self.addEventListener("message", (e) => { if (e.data === "flush") e.waitUntil(flush()); });

const findPack = async (req, ignoreSearch) => {
  const names = (await caches.keys()).filter((n) => n.startsWith(PACK));
  for (const n of names) { const c = await caches.open(n); const r = await c.match(req, { ignoreSearch }); if (r) return r; }
  return null;
};

self.addEventListener("fetch", (e) => {
  const req = e.request, url = new URL(req.url);
  if (req.method === "GET" && /\.supabase\.co$/.test(url.hostname) && url.pathname.startsWith("/storage/v1/object/public/wiam/")) {
    e.respondWith((async () => {
      const c = await caches.open("zad-voice"), hit = await c.match(req);
      if (hit) return hit;
      try { const r = await fetch(req); if (r.ok) c.put(req, r.clone()); return r; } catch { return new Response("", { status: 504 }); }
    })());
    return;
  }
  if (req.method === "POST" && /\/functions\/v1\/game-log$/.test(url.pathname)) {
    e.respondWith((async () => {
      const body = await req.clone().text();
      try { const r = await fetch(req); flush(); return r; } catch { await qAdd({ url: req.url, body }); return new Response("{}", { status: 202, headers: { "content-type": "application/json" } }); }
    })());
    return;
  }
  if (req.method !== "GET" || url.origin !== location.origin) return;
  if (!url.pathname.includes("/games/") && !url.pathname.includes("/fonts/") && !url.pathname.includes("/images/logo.png") && !/\/images\/(ill|gm|zad)\//.test(url.pathname)) return;
  const isAudio = url.pathname.includes("/games/audio/");
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      try {
        const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 3000);
        const r = await fetch(req, { signal: ctl.signal }); clearTimeout(t); return r;
      } catch {
        return (await findPack(req, true)) || (await findPack(new Request(new URL("./", self.registration.scope)), true)) || Response.error();
      }
    })());
    return;
  }
  e.respondWith((async () => {
    const hit = await findPack(req, isAudio);
    if (hit) return hit;
    try { return await fetch(req); } catch {
      const old = await findPack(req, true);
      if (old) return old;
      return isAudio ? new Response("", { status: 404 }) : Response.error();
    }
  })());
});
