# -*- coding: utf-8 -*-
"""يرسم صور الأرقام والألوان والأشكال والجمع/الطرح: رسومات أصلية بأسلوب كرتوني موحّد (بنفسجي زاد)."""
import math, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
ROOT = os.path.join(os.path.dirname(__file__), "..", "..", "..")
OUT = os.path.join(ROOT, "images", "cards")
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
S = 4; W = 512  # رسم بدقة أعلى ثم تصغير
AD = lambda n: str(n).translate(str.maketrans("0123456789", "٠١٢٣٤٥٦٧٨٩"))
def font(sz): return ImageFont.truetype(FB, sz*S)
def canvas(): return Image.new("RGBA", (W*S, W*S), (0,0,0,0))
def save(im, rel):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    im.resize((W, W), Image.LANCZOS).save(p, "WEBP", quality=90, method=6)
def shade(c, f):
    c = c.lstrip("#"); r,g,b = [int(c[i:i+2],16) for i in (0,2,4)]
    return tuple(max(0,min(255,int(v*f))) for v in (r,g,b))
def gloss(d, box, r):
    x0,y0,x1,y1 = box
    d.ellipse((x0+(x1-x0)*0.14, y0+(y1-y0)*0.10, x0+(x1-x0)*0.50, y0+(y1-y0)*0.34), fill=(255,255,255,110))
def center_text(d, xy, t, f, fill, stroke=None, sw=0):
    bb = d.textbbox((0,0), t, font=f, stroke_width=sw*S)
    d.text((xy[0]-(bb[0]+bb[2])/2, xy[1]-(bb[1]+bb[3])/2), t, font=f, fill=fill, stroke_width=sw*S, stroke_fill=stroke)

PUR = "#7c4dff"
def disk(d, cx, cy, r, base):
    d.ellipse((cx-r, cy+r*0.06, cx+r, cy+r*1.06), fill=(0,0,0,40))
    d.ellipse((cx-r, cy-r, cx+r, cy+r), fill=shade(base,0.78))
    d.ellipse((cx-r, cy-r, cx+r, cy+r*0.94), fill=base)
    d.ellipse((cx-r*0.55, cy-r*0.85, cx+r*0.1, cy-r*0.4), fill=(255,255,255,90))

def num(n):
    im = canvas(); d = ImageDraw.Draw(im); c = W*S//2
    disk(d, c, c-10*S, 215*S, PUR)
    t = AD(n); sz = 270 if len(t)==1 else (230 if len(t)==2 else (170 if len(t)==3 else 130))
    center_text(d, (c, c-30*S), t, font(sz), "white", shade(PUR,0.6), 5)
    center_text(d, (c, c+150*S), str(n), font(78), (255,255,255,235), shade(PUR,0.6), 3)
    save(im, f"num/{n}.webp")

def dots(d, n, x0, y0, x1, y1, col, cross=0, r=None):
    cols = 5 if n>6 else 3
    rows = math.ceil(n/cols); gw=(x1-x0)/cols; gh=(y1-y0)/max(rows,1)
    r = r or min(gw,gh)*0.38
    for i in range(n):
        cx = x0+gw*(i%cols)+gw/2; cy = y0+gh*(i//cols)+gh/2
        d.ellipse((cx-r,cy-r+3*S,cx+r,cy+r+3*S), fill=(0,0,0,40))
        d.ellipse((cx-r,cy-r,cx+r,cy+r), fill=col)
        d.ellipse((cx-r*0.6,cy-r*0.75,cx-r*0.1,cy-r*0.35), fill=(255,255,255,120))
        if i >= n-cross:
            d.line((cx-r,cy-r,cx+r,cy+r), fill="#d32f2f", width=9*S); d.line((cx-r,cy+r,cx+r,cy-r), fill="#d32f2f", width=9*S)

def panel(d):
    d.rounded_rectangle((12*S,12*S,(W-12)*S,(W-12)*S), radius=60*S, fill=(255,255,255,255), outline=shade(PUR,1.0), width=8*S)

def mathimg(op, a, b):
    im = canvas(); d = ImageDraw.Draw(im); panel(d)
    if op == "add":
        dots(d, a, 28*S, 70*S, 224*S, 300*S, "#ff7043"); dots(d, b, 296*S, 70*S, 492*S, 300*S, "#29b6f6")
        center_text(d, (260*S, 180*S), "+", font(60), PUR)
        sym = "+"; res = a+b
    else:
        dots(d, a, 60*S, 70*S, 450*S, 300*S, "#ff7043", cross=b); sym = "−"; res = a-b
    center_text(d, (256*S, 400*S), f"{AD(a)} {sym} {AD(b)} = ؟", font(76), PUR)
    save(im, f"math/{op}-{a}-{b}.webp")

def cmp(a, b):
    im = canvas(); d = ImageDraw.Draw(im); panel(d)
    dots(d, a, 30*S, 70*S, 226*S, 330*S, "#ff7043", r=18*S); dots(d, b, 296*S, 70*S, 492*S, 330*S, "#29b6f6", r=18*S)
    center_text(d, (260*S, 200*S), "؟", font(60), PUR)
    center_text(d, (136*S, 410*S), AD(a), font(90), "#ff7043", shade("#ff7043",0.6), 3)
    center_text(d, (376*S, 410*S), AD(b), font(90), "#29b6f6", shade("#29b6f6",0.6), 3)
    save(im, f"math/cmp-{a}-{b}.webp")

def color(k, hx):
    im = canvas(); d = ImageDraw.Draw(im); c = W*S//2
    # قطرة/بقعة ملوّنة كرتونية
    base = hx
    d.ellipse((c-210*S, c-190*S+14*S, c+210*S, c+190*S+14*S), fill=(0,0,0,40))
    d.ellipse((c-215*S, c-200*S, c+215*S, c+190*S), fill=shade(base,0.78) if k!="white" else "#cfd8dc")
    d.ellipse((c-215*S, c-200*S, c+215*S, c+170*S), fill=base, outline=("#b0bec5" if k=="white" else None), width=6*S)
    d.ellipse((c-150*S, c-160*S, c-40*S, c-90*S), fill=(255,255,255,140))
    save(im, f"col/{k}.webp")

def poly(n, c, r, rot=-90):
    return [(c[0]+r*math.cos(math.radians(rot+360*i/n)), c[1]+r*math.sin(math.radians(rot+360*i/n))) for i in range(n)]
def shape(k):
    im = canvas(); d = ImageDraw.Draw(im); c = (W*S//2, W*S//2); base = {"circle":"#ef5350","square":"#42a5f5","triangle":"#66bb6a",
      "rect":"#ffa726","star":"#fdd835","heart":"#ec407a","diamond":"#ab47bc","oval":"#26c6da","hexa":"#8d6e63"}[k]
    dk = shade(base,0.72); o = 10*S
    def draw(fn):
        sh = Image.new("RGBA", im.size, (0,0,0,0)); sd = ImageDraw.Draw(sh); fn(sd, 0, 16*S, (0,0,0,45)); im.alpha_composite(sh)
        fn(d, 0, 0, dk); fn(d, 0, -o, base)
    if k=="circle": draw(lambda g,x,y,f: g.ellipse((c[0]-190*S,c[1]-190*S+y,c[0]+190*S,c[1]+190*S+y), fill=f))
    elif k=="square": draw(lambda g,x,y,f: g.rounded_rectangle((c[0]-170*S,c[1]-170*S+y,c[0]+170*S,c[1]+170*S+y), radius=30*S, fill=f))
    elif k=="rect": draw(lambda g,x,y,f: g.rounded_rectangle((c[0]-215*S,c[1]-125*S+y,c[0]+215*S,c[1]+125*S+y), radius=30*S, fill=f))
    elif k=="triangle": draw(lambda g,x,y,f: g.polygon([(p[0],p[1]+y+30*S) for p in poly(3,c,215*S)], fill=f))
    elif k=="star":
        pts=[]
        for i in range(10):
            r = 220*S if i%2==0 else 95*S; a = math.radians(-90+36*i); pts.append((c[0]+r*math.cos(a), c[1]+r*math.sin(a)+20*S))
        draw(lambda g,x,y,f: g.polygon([(p[0],p[1]+y) for p in pts], fill=f))
    elif k=="heart":
        def hh(g,x,y,f):
            g.ellipse((c[0]-200*S,c[1]-170*S+y,c[0]+5*S,c[1]+35*S+y), fill=f); g.ellipse((c[0]-5*S,c[1]-170*S+y,c[0]+200*S,c[1]+35*S+y), fill=f)
            g.polygon([(c[0]-192*S,c[1]-30*S+y),(c[0]+192*S,c[1]-30*S+y),(c[0],c[1]+205*S+y)], fill=f)
        draw(hh)
    elif k=="diamond": draw(lambda g,x,y,f: g.polygon([(c[0],c[1]-215*S+y),(c[0]+150*S,c[1]+y),(c[0],c[1]+215*S+y),(c[0]-150*S,c[1]+y)], fill=f))
    elif k=="oval": draw(lambda g,x,y,f: g.ellipse((c[0]-135*S,c[1]-205*S+y,c[0]+135*S,c[1]+205*S+y), fill=f))
    elif k=="hexa": draw(lambda g,x,y,f: g.polygon([(p[0],p[1]+y) for p in poly(6,c,205*S,0)], fill=f))
    g = ImageDraw.Draw(im); g.ellipse((c[0]-120*S,c[1]-150*S,c[0]-60*S,c[1]-110*S), fill=(255,255,255,120))
    save(im, f"shp/{k}.webp")

if __name__ == "__main__":
    import data
    for c in data.cards:
        k = c["extra"].get("kind")
        if k in ("sub",): continue
        if k == "num": num(c["extra"]["val"])
        elif k in ("add","sub"): mathimg(k, c["extra"]["a"], c["extra"]["b"])
        elif k == "cmp": cmp(c["extra"]["a"], c["extra"]["b"])
        elif c["cat"] == "colors": color(c["key"][4:], c["extra"]["hex"])
        elif c["cat"] == "shapes": shape(c["key"][4:])
    print("ok")
