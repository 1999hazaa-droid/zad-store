#!/usr/bin/env python3
"""يولّد games/offline.json: قائمة ملفات «زاد بلا إنترنت» وأحجامها ونسخة الحزمة.
شغّله بعد أي تعديل على ألعاب /games/ ثم ارفع التغييرات."""
import hashlib, json, os, re
G = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "games")
html = open(os.path.join(G, "index.html"), encoding="utf-8").read()
core = ["./", "index.html"]
refs = re.findall(r'(?:href|src)="([^"]+)"', html)
for r in refs:
    if r.startswith(("http", "#", "data:")): continue
    core.append(r)
core += ["../fonts/cairo-regular.woff", "../fonts/cairo-bold.woff", "../images/logo.png", "icon-192.png", "icon-512.png"]
seen = []; [seen.append(x) for x in core if x not in seen]; core = seen
files = []; h = hashlib.sha1()
def add(u, kind):
    p = os.path.normpath(os.path.join(G, u.split("?")[0])) if u != "./" else os.path.join(G, "index.html")
    d = open(p, "rb").read(); h.update(u.encode()); h.update(d)
    files.append({"u": u, "s": len(d), "k": kind})
for u in core: add(u, "core")
ad = os.path.join(G, "audio")
for root, _, fs in sorted(os.walk(ad)):
    for f in sorted(fs): add("audio/" + os.path.relpath(os.path.join(root, f), ad).replace(os.sep, "/"), "audio")
for f in sorted(os.listdir(os.path.join(G, "chars"))):
    if f.endswith(("-160.png", "-320.png")): add("chars/" + f, "core")
for f in sorted(os.listdir(os.path.join(G, "chars", "poses"))):
    if f.endswith(("-160.png", "-320.png")): add("chars/poses/" + f, "core")
GM = os.path.join(G, "..", "images", "gm")
for f in sorted(os.listdir(GM)):
    if f.endswith(".svg"): add("../images/gm/" + f, "core")
IL = os.path.join(G, "..", "images", "ill")
for f in sorted(os.listdir(IL)):
    if f.endswith(".svg"): add("../images/ill/" + f, "core")
add("characters.html", "core")
add("catalog.json", "core")
add("play2.css", "core")
add("zui.css", "core")
add("ill.js", "core")
add("emo.js", "core")
EM = os.path.join(G, "..", "images", "emo")
for f in sorted(os.listdir(EM)):
    if f.endswith(".svg"): add("../images/emo/" + f, "core")
add("adventures.json", "core")
out = {"version": h.hexdigest()[:10], "total": sum(f["s"] for f in files), "files": files}
json.dump(out, open(os.path.join(G, "offline.json"), "w"), ensure_ascii=False, separators=(",", ":"))
print(out["version"], len(files), out["total"])
